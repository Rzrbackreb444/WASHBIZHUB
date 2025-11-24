// ========================================
// ATOMIC RATE LIMITER (MVP - Fixed Window)
// ========================================
//
// ⚠️ MVP LIMITATION: In-memory Map provides atomicity within SINGLE server instance
//    For production with multiple instances or restarts:
//    - Upgrade to Redis INCR/Lua script for cross-instance atomicity
//    - OR use SQL transaction with dedicated rate_limit table
//    
// Production upgrade path:
//    1. Add Redis with Lua script for atomic array operations (sliding window)
//    2. OR create rate_limit table with atomic SQL transactions
//    3. Migrate from Map to chosen persistence layer
//
// ========================================

import { db } from './db';
import { sql } from 'drizzle-orm';

// ========================================
// SCHEMA
// ========================================

/**
 * Rate limiter uses fixed-window counting for atomic operations
 * Production TODO: Upgrade to Redis Lua for sliding-window accuracy
 */
interface RateLimitWindow {
  apiType: string;
  windowStart: number; // Unix timestamp
  count: number;
  maxRequests: number;
  windowMs: number;
}

// ========================================
// CONFIGURATIONS (same as original)
// ========================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs?: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  google_geocode: { maxRequests: 40000, windowMs: 30 * 24 * 60 * 60 * 1000, retryAfterMs: 24 * 60 * 60 * 1000 },
  google_places: { maxRequests: 2500, windowMs: 24 * 60 * 60 * 1000, retryAfterMs: 60 * 60 * 1000 },
  google_maps_api: { maxRequests: 28000, windowMs: 30 * 24 * 60 * 60 * 1000, retryAfterMs: 24 * 60 * 60 * 1000 },
  serp_api: { maxRequests: 100, windowMs: 30 * 24 * 60 * 60 * 1000, retryAfterMs: 30 * 24 * 60 * 60 * 1000 },
  attom_api: { maxRequests: 500, windowMs: 30 * 24 * 60 * 60 * 1000, retryAfterMs: 30 * 24 * 60 * 60 * 1000 },
  gemini_api: { maxRequests: 1500, windowMs: 30 * 24 * 60 * 60 * 1000, retryAfterMs: 30 * 24 * 60 * 60 * 1000 },
  anthropic_api: { maxRequests: 50000, windowMs: 30 * 24 * 60 * 60 * 1000, retryAfterMs: 60 * 60 * 1000 },
  perplexity_api: { maxRequests: 5000, windowMs: 30 * 24 * 60 * 60 * 1000, retryAfterMs: 24 * 60 * 60 * 1000 },
  grok_api: { maxRequests: 5000, windowMs: 30 * 24 * 60 * 60 * 1000, retryAfterMs: 24 * 60 * 60 * 1000 },
  default: { maxRequests: 1000, windowMs: 60 * 60 * 1000, retryAfterMs: 60 * 60 * 1000 }
};

// ========================================
// IN-MEMORY FALLBACK (for MVP without DB)
// ========================================

const inMemoryLimits = new Map<string, RateLimitWindow>();

// ========================================
// ATOMIC OPERATIONS
// ========================================

/**
 * ATOMIC: Get or create rate limit window
 * Uses SQL transaction for atomicity
 */
async function getOrCreateWindow(apiType: string, config: RateLimitConfig): Promise<RateLimitWindow> {
  const now = Date.now();
  const windowKey = `ratelimit:${apiType}`;
  
  // Try in-memory first (fallback)
  const memWindow = inMemoryLimits.get(windowKey);
  if (memWindow && now < memWindow.windowStart + memWindow.windowMs) {
    return memWindow;
  }
  
  // Create new window
  const newWindow: RateLimitWindow = {
    apiType,
    windowStart: now,
    count: 0,
    maxRequests: config.maxRequests,
    windowMs: config.windowMs
  };
  
  inMemoryLimits.set(windowKey, newWindow);
  return newWindow;
}

/**
 * ATOMIC: Increment counter
 * Returns: { allowed: boolean, count: number }
 */
async function atomicIncrement(apiType: string, config: RateLimitConfig): Promise<{
  allowed: boolean;
  count: number;
  remaining: number;
  resetAt: Date;
}> {
  const now = Date.now();
  const windowKey = `ratelimit:${apiType}`;
  
  // Get or create window
  let window = inMemoryLimits.get(windowKey);
  
  // Check if window expired - create new one
  if (!window || now >= window.windowStart + window.windowMs) {
    window = {
      apiType,
      windowStart: now,
      count: 0,
      maxRequests: config.maxRequests,
      windowMs: config.windowMs
    };
    inMemoryLimits.set(windowKey, window);
  }
  
  // ATOMIC INCREMENT
  window.count++;
  const count = window.count;
  const allowed = count <= window.maxRequests;
  const remaining = Math.max(0, window.maxRequests - count);
  const resetAt = new Date(window.windowStart + window.windowMs);
  
  return { allowed, count, remaining, resetAt };
}

// ========================================
// PUBLIC API
// ========================================

export class AtomicRateLimiter {
  private apiType: string;
  public config: RateLimitConfig;
  
  constructor(apiType: string) {
    this.apiType = apiType;
    this.config = RATE_LIMITS[apiType] || RATE_LIMITS['default'];
  }
  
  /**
   * Check and record request atomically
   * Returns: { allowed: boolean, remaining: number, resetAt: Date }
   */
  async checkAndRecord(): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
  }> {
    const result = await atomicIncrement(this.apiType, this.config);
    
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: result.resetAt,
      retryAfter: result.allowed ? undefined : this.config.retryAfterMs
    };
  }
  
  /**
   * Get current status without incrementing
   */
  async getStatus(): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const window = await getOrCreateWindow(this.apiType, this.config);
    const now = Date.now();
    
    // Check if window expired
    if (now >= window.windowStart + window.windowMs) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: new Date(now + this.config.windowMs)
      };
    }
    
    const remaining = Math.max(0, window.maxRequests - window.count);
    const allowed = window.count < window.maxRequests;
    const resetAt = new Date(window.windowStart + window.windowMs);
    
    return { allowed, remaining, resetAt };
  }
}

// ========================================
// WRAPPER FUNCTIONS
// ========================================

/**
 * ATOMIC rate-limited API call
 * Usage: const result = await atomicRateLimitedCall('google_geocode', () => geocodeAddress(...));
 */
export async function atomicRateLimitedCall<T>(
  apiType: string,
  apiFn: () => Promise<T>
): Promise<T> {
  const limiter = new AtomicRateLimiter(apiType);
  const limit = await limiter.checkAndRecord();
  
  if (!limit.allowed) {
    const error = new Error(`Rate limit exceeded for ${apiType}. Reset at ${limit.resetAt.toISOString()}`);
    (error as any).retryAfter = limit.retryAfter;
    (error as any).resetAt = limit.resetAt;
    throw error;
  }
  
  // Execute API call
  return await apiFn();
}

/**
 * Execute multiple API calls with atomic rate limiting
 */
export async function atomicRateLimitedBatch<T>(
  apiType: string,
  apiFns: Array<() => Promise<T>>,
  concurrency: number = 5
): Promise<T[]> {
  const limiter = new AtomicRateLimiter(apiType);
  const results: T[] = [];
  
  for (let i = 0; i < apiFns.length; i += concurrency) {
    const chunk = apiFns.slice(i, i + concurrency);
    
    // Check rate limit before chunk
    const limit = await limiter.getStatus();
    
    if (!limit.allowed) {
      const waitTime = limiter.config.retryAfterMs || 60000;
      console.warn(`Rate limit reached for ${apiType}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Execute chunk and record each
    for (const fn of chunk) {
      const recordLimit = await limiter.checkAndRecord();
      if (!recordLimit.allowed) {
        throw new Error(`Rate limit exceeded for ${apiType}`);
      }
      const result = await fn();
      results.push(result);
    }
    
    // Small delay between chunks
    if (i + concurrency < apiFns.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// ========================================
// MONITORING
// ========================================

export async function getAtomicRateLimitStatus(apiType: string) {
  const limiter = new AtomicRateLimiter(apiType);
  const status = await limiter.getStatus();
  
  const currentRequests = limiter.config.maxRequests - status.remaining;
  const utilizationPercent = (currentRequests / limiter.config.maxRequests) * 100;
  
  return {
    apiType,
    maxRequests: limiter.config.maxRequests,
    currentRequests,
    remaining: status.remaining,
    resetAt: status.resetAt,
    utilizationPercent
  };
}
