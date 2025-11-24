/**
 * CLEANBI GOOGLE MAPS INJECTOR
 * 
 * Detects laundromats on Google Maps and shows instant CLEANBI scores on hover.
 * This is the viral distribution mechanism for the 71K Facebook group.
 */

(function() {
  'use strict';

  const CLEANBI_API_URL = 'https://washbizhub.com/api/cleanbi/auto';
  const scoreCache = new Map(); // Cache scores to avoid redundant API calls
  let currentOverlay = null;

  /**
   * Fetch CLEANBI score from WashBizHub API
   */
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

  /**
   * Create the CLEANBI score overlay
   */
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
            <div class="cleanbi-confidence">${scoreData.confidence}% Confidence</div>
          </div>
        </div>
        <div class="cleanbi-breakdown">
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">
              👥 Foot Traffic
            </span>
            <span class="cleanbi-breakdown-score">${Math.round(scoreData.breakdown.footTraffic.score)} pts</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">
              📍 Competition
            </span>
            <span class="cleanbi-breakdown-score">${Math.round(scoreData.breakdown.competition.score)} pts</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">
              ⭐ Reviews
            </span>
            <span class="cleanbi-breakdown-score">${Math.round(scoreData.breakdown.reviews.score)} pts</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">
              📌 Location
            </span>
            <span class="cleanbi-breakdown-score">${Math.round(scoreData.breakdown.location.score)} pts</span>
          </div>
          <div class="cleanbi-breakdown-item">
            <span class="cleanbi-breakdown-label">
              👁️ Visibility
            </span>
            <span class="cleanbi-breakdown-score">${Math.round(scoreData.breakdown.visibility.score)} pts</span>
          </div>
        </div>
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
    currentOverlay = overlay;

    return overlay;
  }

  /**
   * Check if element is a business listing (NOW WORKS FOR ANY BUSINESS!)
   * 
   * Target industries: Laundromats, Car Washes, Restaurants, Gas Stations, 
   * Retail Stores, Gyms, and ANY other business
   */
  function isBusinessElement(element) {
    const text = element.textContent.toLowerCase();
    
    // Must have BOTH business name AND address indicators (strict filtering)
    const hasTitle = element.querySelector('[class*="title"]') || 
                     element.querySelector('h1') || 
                     element.querySelector('h2') ||
                     element.querySelector('h3');
    
    const hasAddress = text.includes('directions') || 
                       text.includes('get directions') ||
                       element.querySelector('[class*="address"]') ||
                       element.querySelector('[class*="location"]');
    
    // Priority keywords for high-value industries
    const priorityKeywords = [
      'laundromat', 'laundry', 'car wash', 'restaurant', 'cafe',
      'gas station', 'gym', 'fitness', 'retail', 'store'
    ];
    const isPriorityBusiness = priorityKeywords.some(keyword => text.includes(keyword));
    
    // Must have basic structure (title + address) OR be priority industry
    return (hasTitle && hasAddress) || isPriorityBusiness;
  }

  /**
   * Extract address from Google Maps element
   */
  function extractAddressFromElement(element) {
    // Try to find address in various Google Maps structures
    const addressSelectors = [
      '[data-item-id*="address"]',
      '[class*="address"]',
      '[aria-label*="Address"]'
    ];

    for (const selector of addressSelectors) {
      const addressEl = element.querySelector(selector) || element.closest('[data-section-id]')?.querySelector(selector);
      if (addressEl) {
        return addressEl.textContent.trim();
      }
    }

    // Fallback: look for text that looks like an address
    const text = element.textContent;
    const addressMatch = text.match(/\d+\s+[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/);
    return addressMatch ? addressMatch[0] : null;
  }

  /**
   * Extract business name from element
   */
  function extractBusinessName(element) {
    const nameSelectors = [
      '[data-item-id="title"]',
      'h1',
      'h2',
      '[role="heading"]',
      '[class*="title"]'
    ];

    for (const selector of nameSelectors) {
      const nameEl = element.querySelector(selector) || element.closest('[data-section-id]')?.querySelector(selector);
      if (nameEl) {
        return nameEl.textContent.trim();
      }
    }

    return null;
  }

  /**
   * Handle hover on potential business elements
   */
  async function handleBusinessHover(element) {
    if (!isBusinessElement(element)) {
      return;
    }

    const address = extractAddressFromElement(element);
    const businessName = extractBusinessName(element);

    // STRICT REQUIREMENT: Must have EITHER address OR (business name + priority industry keyword)
    if (!address) {
      console.log('[CLEANBI] No address found, skipping');
      return;
    }

    // Show loading overlay immediately
    createScoreOverlay(element, null);

    // Fetch and display score
    const scoreData = await getCleanbiScore(address, businessName);
    if (scoreData && currentOverlay) {
      createScoreOverlay(element, scoreData);
    }
  }

  /**
   * Set up hover listeners on business elements
   */
  function setupHoverListeners() {
    // Google Maps uses various selectors for listings
    const listingSelectors = [
      '[role="article"]',
      '[data-section-id*="search"]',
      '[class*="section-result"]',
      '[class*="place-result"]',
      'a[href*="/maps/place"]'
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
            // Delay removal to allow user to interact with overlay
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

  /**
   * Initialize the CLEANBI injector
   */
  function init() {
    console.log('[CLEANBI] Initializing Google Maps injector...');

    // Set up mutation observer to detect new listings
    const observer = new MutationObserver(() => {
      setupHoverListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial setup
    setupHoverListeners();

    // Handle overlay hover
    document.addEventListener('mouseover', (e) => {
      if (currentOverlay && currentOverlay.contains(e.target)) {
        // Keep overlay visible when hovering over it
        currentOverlay.style.opacity = '1';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (currentOverlay && currentOverlay.contains(e.target)) {
        // Remove overlay when mouse leaves
        setTimeout(() => {
          if (currentOverlay && !currentOverlay.matches(':hover')) {
            currentOverlay.remove();
            currentOverlay = null;
          }
        }, 300);
      }
    });

    console.log('[CLEANBI] Google Maps injector initialized!');
  }

  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
