/**
 * SHARED OVERLAY CODE FOR CLEANBI EXTENSION
 * 
 * Extracted common logic used by all injectors (Google Maps, LoopNet, BizBuySell)
 */

const CLEANBI_SHARED = {
  API_URL: 'https://washbizhub.com/api/cleanbi/auto',
  scoreCache: new Map(),
  currentOverlay: null,

  /**
   * Fetch CLEANBI score from WashBizHub API
   */
  async getCleanbiScore(address, businessName) {
    const cacheKey = `${businessName}|${address}`;
    
    if (this.scoreCache.has(cacheKey)) {
      return this.scoreCache.get(cacheKey);
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, businessName }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.scoreCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[CLEANBI] Error fetching score:', error);
      return null;
    }
  },

  /**
   * Create the CLEANBI score overlay
   */
  createScoreOverlay(element, scoreData, compact = false) {
    if (this.currentOverlay) {
      this.currentOverlay.remove();
      this.currentOverlay = null;
    }

    const overlay = document.createElement('div');
    overlay.className = 'cleanbi-score-badge';
    
    if (!scoreData) {
      overlay.innerHTML = `
        <div class="cleanbi-header">
          <div class="cleanbi-logo">CLEANBI</div>
          <div class="cleanbi-powered">Powered by Google</div>
        </div>
        <div class="cleanbi-error">
          <div class="cleanbi-loading-spinner"></div>
          <div style="margin-top: 8px;">Calculating score...</div>
        </div>
      `;
    } else {
      const gradeClass = `grade-${scoreData.grade.toLowerCase()}`;
      
      const breakdownHTML = compact ? `
        <div class="cleanbi-breakdown">
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">👥 Foot Traffic</span>
            <span class="cleanbi-breakdown-score">${scoreData.breakdown.footTraffic.score}/30</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">⭐ Reviews</span>
            <span class="cleanbi-breakdown-score">${scoreData.breakdown.reviews.score}/25</span>
          </div>
        </div>
      ` : `
        <div class="cleanbi-breakdown">
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">👥 Foot Traffic</span>
            <span class="cleanbi-breakdown-score">${scoreData.breakdown.footTraffic.score}/30</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">📍 Competition</span>
            <span class="cleanbi-breakdown-score">${scoreData.breakdown.competition.score}/20</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">⭐ Reviews</span>
            <span class="cleanbi-breakdown-score">${scoreData.breakdown.reviews.score}/25</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">📌 Location</span>
            <span class="cleanbi-breakdown-score">${scoreData.breakdown.location.score}/15</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">👁️ Visibility</span>
            <span class="cleanbi-breakdown-score">${scoreData.breakdown.visibility.score}/10</span>
          </div>
        </div>
      `;
      
      overlay.innerHTML = `
        <div class="cleanbi-header">
          <div class="cleanbi-logo">CLEANBI™</div>
          <div class="cleanbi-powered">Powered by Google</div>
        </div>
        <div class="cleanbi-score-row">
          <div class="cleanbi-grade ${gradeClass}">${scoreData.grade}</div>
          <div>
            <div class="cleanbi-score">${scoreData.score}/100</div>
            <div class="cleanbi-score-label">SCORE</div>
            ${!compact ? `<div class="cleanbi-confidence">${scoreData.confidence}% Confidence</div>` : ''}
          </div>
        </div>
        ${breakdownHTML}
        <div class="cleanbi-cta">
          <a href="https://washbizhub.com/cleanbi-auto" target="_blank" class="cleanbi-cta-button">
            Get Full $97 Report →
          </a>
        </div>
      `;
    }

    // Position overlay near the hovered element
    const rect = element.getBoundingClientRect();
    overlay.style.position = 'fixed';
    overlay.style.left = `${Math.min(rect.right + 10, window.innerWidth - 250)}px`;
    overlay.style.top = `${Math.max(rect.top, 10)}px`;
    
    document.body.appendChild(overlay);
    this.currentOverlay = overlay;

    return overlay;
  },

  /**
   * Check if element is ANY business or property listing
   * UNIVERSAL: Works for all business types AND residential properties
   */
  isBusinessOrPropertyElement(element) {
    const text = element.textContent.toLowerCase();
    
    // Check for basic listing structure (has address-like content)
    const hasAddressIndicators = 
      /\d+\s+[a-z]/i.test(text) || // Street number + name
      text.includes('address') ||
      text.includes('location') ||
      text.includes('directions');
    
    // Check for price/business indicators
    const hasListingIndicators =
      text.includes('for sale') ||
      text.includes('for lease') ||
      text.includes('asking price') ||
      text.includes('revenue') ||
      text.includes('sqft') ||
      text.includes('sq ft') ||
      text.includes('beds') ||
      text.includes('baths');
    
    return hasAddressIndicators || hasListingIndicators;
  },

  /**
   * Remove current overlay
   */
  removeOverlay() {
    if (this.currentOverlay) {
      this.currentOverlay.remove();
      this.currentOverlay = null;
    }
  },

  /**
   * Setup overlay hover behavior to keep it visible
   */
  setupOverlayHoverBehavior() {
    document.addEventListener('mouseover', (e) => {
      if (this.currentOverlay && this.currentOverlay.contains(e.target)) {
        this.currentOverlay.style.opacity = '1';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (this.currentOverlay && this.currentOverlay.contains(e.target)) {
        setTimeout(() => {
          if (this.currentOverlay && !this.currentOverlay.matches(':hover')) {
            this.removeOverlay();
          }
        }, 300);
      }
    });
  },

  /**
   * Create delayed removal handler for element hover
   */
  createDelayedRemovalHandler() {
    return () => {
      setTimeout(() => {
        if (this.currentOverlay && !this.currentOverlay.matches(':hover')) {
          this.removeOverlay();
        }
      }, 300);
    };
  }
};

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CLEANBI_SHARED;
}
