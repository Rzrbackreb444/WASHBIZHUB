// ========================================
// CLEANBI RATE LIMITER
// Protects free tier API quotas
// ========================================

import { cacheGet, cacheSet, generateCacheKey } from './cleanbi-cache-layer';

// ========================================
// RATE LIMIT CONFIGURATIONS
// ========================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  retryAfterMs?: number; // How long to wait before retry
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Google Maps APIs (free tier)
  'google_geocode': {
    maxRequests: 40000, // 40K per month
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    retryAfterMs: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  'google_places': {
    maxRequests: 2500, // Conservative limit
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    retryAfterMs: 60 * 60 * 1000 // 1 hour
  },
  
  'google_maps_api': {
    maxRequests: 28000, // API quotas
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    retryAfterMs: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // SERP API (free tier)
  'serp_api': {
    maxRequests: 100, // Free tier limit
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    retryAfterMs: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  
  // ATTOM Data API
  'attom_api': {
    maxRequests: 500,
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    retryAfterMs: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  
  // AI Services (free tier protection)
  'gemini_api': {
    maxRequests: 1500, // 1500 per month free tier
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    retryAfterMs: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  
  'anthropic_api': {
    maxRequests: 50000, // Token-based, but set request limit
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    retryAfterMs: 60 * 60 * 1000 // 1 hour
  },
  
  'perplexity_api': {
    maxRequests: 5000,
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    retryAfterMs: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  'grok_api': {
    maxRequests: 5000,
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    retryAfterMs: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Default rate limit
  'default': {
    maxRequests: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    retryAfterMs: 60 * 60 * 1000 // 1 hour
  }
};

// ========================================
// RATE LIMITER IMPLEMENTATION
// ========================================

export class RateLimiter {
  private apiType: string;
  public config: RateLimitConfig;
  
  constructor(apiType: string) {
    this.apiType = apiType;
    this.config = RATE_LIMITS[apiType] || RATE_LIMITS['default'];
  }
  
  /**
   * Check if request is allowed
   * Returns { allowed: boolean, remaining: number, resetAt: Date }
   */
  async checkLimit(): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
  }> {
    const key = generateCacheKey('ratelimit', this.apiType);
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get current request count
    const limiterData = await cacheGet<{
      requests: number[];
      windowStart: number;
    }>(key);
    
    let requests: number[] = [];
    
    if (limiterData) {
      // Filter out requests outside the current window
      requests = limiterData.requests.filter(timestamp => timestamp > windowStart);
    }
    
    const requestCount = requests.length;
    const remaining = Math.max(0, this.config.maxRequests - requestCount);
    const allowed = requestCount < this.config.maxRequests;
    
    // Calculate reset time (end of current window)
    const oldestRequest = requests[0] || now;
    const resetAt = new Date(oldestRequest + this.config.windowMs);
    
    const result = {
      allowed,
      remaining,
      resetAt,
      retryAfter: allowed ? undefined : this.config.retryAfterMs
    };
    
    return result;
  }
  
  /**
   * Record a request
   */
  async recordRequest() {
    const key = generateCacheKey('ratelimit', this.apiType);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get current data
    const limiterData = await cacheGet<{
      requests: number[];
      windowStart: number;
    }>(key);
    
    let requests: number[] = [];
    
    if (limiterData) {
      // Filter out old requests
      requests = limiterData.requests.filter(timestamp => timestamp > windowStart);
    }
    
    // Add new request
    requests.push(now);
    
    // Save updated data
    await cacheSet(key, {
      requests,
      windowStart
    }, Math.ceil(this.config.windowMs / 1000));
  }
  
  /**
   * Reset rate limit (admin function)
   */
  async reset() {
    const key = generateCacheKey('ratelimit', this.apiType);
    await cacheSet(key, {
      requests: [],
      windowStart: Date.now()
    }, Math.ceil(this.config.windowMs / 1000));
  }
}

// ========================================
// MIDDLEWARE WRAPPER
// ========================================

/**
 * Rate-limited API call wrapper
 * Usage: const result = await rateLimitedCall('google_geocode', () => geocodeAddress(...));
 */
export async function rateLimitedCall<T>(
  apiType: string,
  apiFn: () => Promise<T>
): Promise<T> {
  const limiter = new RateLimiter(apiType);
  
  const limit = await limiter.checkLimit();
  
  if (!limit.allowed) {
    const error = new Error(`Rate limit exceeded for ${apiType}. Reset at ${limit.resetAt.toISOString()}`);
    (error as any).retryAfter = limit.retryAfter;
    (error as any).resetAt = limit.resetAt;
    throw error;
  }
  
  // Execute API call
  const result = await apiFn();
  
  // Record the request
  await limiter.recordRequest();
  
  return result;
}

// ========================================
// BATCH RATE LIMITING
// ========================================

/**
 * Execute multiple API calls with rate limiting
 * Automatically batches and delays if needed
 */
export async function rateLimitedBatch<T>(
  apiType: string,
  apiFns: Array<() => Promise<T>>,
  concurrency: number = 5
): Promise<T[]> {
  const limiter = new RateLimiter(apiType);
  const results: T[] = [];
  
  // Split into chunks
  for (let i = 0; i < apiFns.length; i += concurrency) {
    const chunk = apiFns.slice(i, i + concurrency);
    
    // Check rate limit before chunk
    const limit = await limiter.checkLimit();
    
    if (!limit.allowed) {
      // Wait for rate limit to reset
      const waitTime = limit.retryAfter || 60000; // Default 1 minute
      console.warn(`Rate limit reached for ${apiType}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Execute chunk in parallel
    const chunkResults = await Promise.all(chunk.map(fn => fn()));
    results.push(...chunkResults);
    
    // Record requests
    for (let j = 0; j < chunk.length; j++) {
      await limiter.recordRequest();
    }
    
    // Small delay between chunks to avoid bursting
    if (i + concurrency < apiFns.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// ========================================
// MONITORING & ANALYTICS
// ========================================

export async function getRateLimitStatus(apiType: string): Promise<{
  apiType: string;
  maxRequests: number;
  currentRequests: number;
  remaining: number;
  resetAt: Date;
  utilizationPercent: number;
}> {
  const limiter = new RateLimiter(apiType);
  const limit = await limiter.checkLimit();
  
  const currentRequests = limiter.config.maxRequests - limit.remaining;
  const utilizationPercent = (currentRequests / limiter.config.maxRequests) * 100;
  
  return {
    apiType,
    maxRequests: limiter.config.maxRequests,
    currentRequests,
    remaining: limit.remaining,
    resetAt: limit.resetAt,
    utilizationPercent
  };
}

export async function getAllRateLimitStatus(): Promise<Array<{
  apiType: string;
  maxRequests: number;
  currentRequests: number;
  remaining: number;
  resetAt: Date;
  utilizationPercent: number;
}>> {
  const apiTypes = Object.keys(RATE_LIMITS).filter(key => key !== 'default');
  
  const statuses = await Promise.all(
    apiTypes.map(type => getRateLimitStatus(type))
  );
  
  return statuses;
}

// ========================================
// QUOTA ALERTS
// ========================================

export async function checkQuotaAlerts(threshold: number = 80): Promise<Array<{
  apiType: string;
  utilizationPercent: number;
  severity: 'warning' | 'critical';
}>> {
  const statuses = await getAllRateLimitStatus();
  
  const alerts: Array<{
    apiType: string;
    utilizationPercent: number;
    severity: 'warning' | 'critical';
  }> = [];
  
  for (const status of statuses) {
    if (status.utilizationPercent >= threshold) {
      alerts.push({
        apiType: status.apiType,
        utilizationPercent: status.utilizationPercent,
        severity: status.utilizationPercent >= 95 ? 'critical' : 'warning'
      });
    }
  }
  
  return alerts;
}
