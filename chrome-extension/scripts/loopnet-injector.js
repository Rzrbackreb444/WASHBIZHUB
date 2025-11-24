/**
 * CLEANBI LOOPNET INJECTOR
 * 
 * Shows CLEANBI scores on LoopNet laundromat listings
 */

(function() {
  'use strict';

  const CLEANBI_API_URL = 'https://washbizhub.com/api/cleanbi/auto';
  const scoreCache = new Map();
  let currentOverlay = null;

  async function getCleanbiScore(address, businessName) {
    const cacheKey = `${businessName}|${address}`;
    
    if (scoreCache.has(cacheKey)) {
      return scoreCache.get(cacheKey);
    }

    try {
      const response = await fetch(CLEANBI_API_URL, {
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
      scoreCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[CLEANBI] Error fetching score:', error);
      return null;
    }
  }

  function createScoreOverlay(element, scoreData) {
    if (currentOverlay) {
      currentOverlay.remove();
      currentOverlay = null;
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
          </div>
        </div>
        <div class="cleanbi-breakdown">
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">👥 Foot Traffic</span>
            <span class="cleanbi-breakdown-score">${Math.round(scoreData.breakdown.footTraffic.score)} pts</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">⭐ Reviews</span>
            <span class="cleanbi-breakdown-score">${Math.round(scoreData.breakdown.reviews.score)} pts</span>
          </div>
        </div>
        <div class="cleanbi-cta">
          <a href="https://washbizhub.com/cleanbi-auto" target="_blank" class="cleanbi-cta-button">
            Get Full Report →
          </a>
        </div>
      `;
    }

    const rect = element.getBoundingClientRect();
    overlay.style.position = 'fixed';
    overlay.style.left = `${Math.min(rect.right + 10, window.innerWidth - 250)}px`;
    overlay.style.top = `${Math.max(rect.top, 10)}px`;
    
    document.body.appendChild(overlay);
    currentOverlay = overlay;

    return overlay;
  }

  function isBusinessElement(element) {
    const text = element.textContent.toLowerCase();
    // Accept ANY commercial real estate listing
    return text.includes('for sale') || text.includes('lease') || 
           text.includes('business') || text.includes('commercial');
  }

  function extractAddressFromElement(element) {
    const addressEl = element.querySelector('[class*="address"]') || 
                      element.querySelector('[class*="location"]');
    return addressEl ? addressEl.textContent.trim() : null;
  }

  function extractBusinessName(element) {
    const nameEl = element.querySelector('h2') || 
                   element.querySelector('h3') ||
                   element.querySelector('[class*="title"]');
    return nameEl ? nameEl.textContent.trim() : null;
  }

  async function handleBusinessHover(element) {
    if (!isBusinessElement(element)) {
      return;
    }

    const address = extractAddressFromElement(element);
    const businessName = extractBusinessName(element);

    if (!address) {
      return;
    }

    createScoreOverlay(element, null);
    const scoreData = await getCleanbiScore(address, businessName);
    
    if (scoreData && currentOverlay) {
      createScoreOverlay(element, scoreData);
    }
  }

  function setupHoverListeners() {
    const listingSelectors = [
      '[data-testid*="listing"]',
      '.placard',
      '.property-card',
      '[class*="property"]'
    ];

    listingSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (element.hasAttribute('data-cleanbi-initialized')) {
          return;
        }

        element.setAttribute('data-cleanbi-initialized', 'true');

        element.addEventListener('mouseenter', () => {
          handleBusinessHover(element);
        });

        element.addEventListener('mouseleave', () => {
          if (currentOverlay) {
            setTimeout(() => {
              if (currentOverlay && !currentOverlay.matches(':hover')) {
                currentOverlay.remove();
                currentOverlay = null;
              }
            }, 300);
          }
        });
      });
    });
  }

  function init() {
    console.log('[CLEANBI] Initializing LoopNet injector...');

    const observer = new MutationObserver(() => {
      setupHoverListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setupHoverListeners();
    console.log('[CLEANBI] LoopNet injector initialized!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
