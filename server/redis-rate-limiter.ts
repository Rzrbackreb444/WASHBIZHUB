// ========================================
// REDIS-BASED ATOMIC RATE LIMITER
// ========================================
//
// Production-grade sliding-window rate limiter
// - Redis with Lua scripts for true atomicity
// - Fallback to in-memory Map for development
// - Sliding window (more accurate than fixed window)
// - Cross-instance atomic operations
// - Quota tracking per API (Google Maps, Places, SERP)
//
// ========================================

import { getRedis, isRedisAvailable } from './redis-connection';

// In-memory fallback for development
const inMemoryLimits = new Map<string, number[]>();

/**
 * Lua script for atomic sliding-window rate limiting
 * Returns number of requests in current window
 */
const RATE_LIMIT_LUA = `
local key = KEYS[1]
local window = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Remove expired timestamps
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)

-- Count current requests in window
local count = redis.call('ZCARD', key)

if count < limit then
  -- Add current request
  redis.call('ZADD', key, now, now)
  redis.call('EXPIRE', key, window)
  return count + 1
else
  return -1
end
`;

export interface RateLimitConfig {
  limit: number;        // Max requests allowed
  windowMs: number;     // Time window in milliseconds
  apiName: string;      // API identifier (e.g., 'google_geocode')
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;  // Unix timestamp when limit resets
}

/**
 * Check and increment rate limit atomically
 * Uses Redis Lua script for true atomicity, falls back to in-memory Map
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Date.now();
  const key = `ratelimit:${config.apiName}`;
  
  // Redis implementation (atomic via Lua)
  if (redis && isRedisAvailable()) {
    try {
      const result = await redis.eval(RATE_LIMIT_LUA, {
        keys: [key],
        arguments: [
          config.windowMs.toString(),
          config.limit.toString(),
          now.toString()
        ]
      }) as number;
      
      if (result === -1) {
        // Rate limit exceeded
        return {
          allowed: false,
          remaining: 0,
          resetAt: now + config.windowMs
        };
      }
      
      // Request allowed
      return {
        allowed: true,
        remaining: config.limit - result,
        resetAt: now + config.windowMs
      };
    } catch (error: any) {
      console.error(`❌ Redis rate limit error: ${error.message}, falling back to in-memory`);
      // Fall through to in-memory implementation
    }
  }
  
  // In-memory fallback (fixed window - less accurate but functional)
  const timestamps = inMemoryLimits.get(key) || [];
  
  // Remove expired timestamps (critical for preventing memory leak)
  const windowStart = now - config.windowMs;
  const validTimestamps = timestamps.filter((t: number) => t > windowStart);
  
  // ALWAYS update map with purged timestamps (prevents memory leak)
  inMemoryLimits.set(key, validTimestamps);
  
  if (validTimestamps.length >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: Math.min(...validTimestamps) + config.windowMs
    };
  }
  
  // Add current request
  validTimestamps.push(now);
  inMemoryLimits.set(key, validTimestamps);
  
  return {
    allowed: true,
    remaining: config.limit - validTimestamps.length,
    resetAt: now + config.windowMs
  };
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(config: RateLimitConfig): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Date.now();
  const key = `ratelimit:${config.apiName}`;
  
  // Redis implementation
  if (redis && isRedisAvailable()) {
    try {
      // Remove expired entries
      await redis.zRemRangeByScore(key, '-inf', now - config.windowMs);
      
      // Count current requests
      const count = await redis.zCard(key);
      
      return {
        allowed: count < config.limit,
        remaining: Math.max(0, config.limit - count),
        resetAt: now + config.windowMs
      };
    } catch (error: any) {
      console.error(`❌ Redis status check error: ${error.message}`);
    }
  }
  
  // In-memory fallback
  const timestamps = inMemoryLimits.get(key) || [];
  const windowStart = now - config.windowMs;
  const validCount = timestamps.filter(t => t > windowStart).length;
  
  return {
    allowed: validCount < config.limit,
    remaining: Math.max(0, config.limit - validCount),
    resetAt: now + config.windowMs
  };
}

/**
 * Reset rate limit for a specific API
 * Useful for testing or admin override
 */
export async function resetRateLimit(apiName: string): Promise<void> {
  const redis = getRedis();
  const key = `ratelimit:${apiName}`;
  
  if (redis && isRedisAvailable()) {
    try {
      await redis.del(key);
      console.log(`✅ Rate limit reset for ${apiName}`);
    } catch (error: any) {
      console.error(`❌ Failed to reset rate limit: ${error.message}`);
    }
  }
  
  // Also reset in-memory
  inMemoryLimits.delete(key);
}

/**
 * Get all rate limit stats (for monitoring dashboard)
 */
export async function getAllRateLimits(): Promise<Record<string, {
  count: number;
  limit: number;
  remaining: number;
}>> {
  const stats: Record<string, { count: number; limit: number; remaining: number }> = {};
  
  // For in-memory fallback
  for (const [key, timestamps] of Array.from(inMemoryLimits.entries())) {
    const apiName = key.replace('ratelimit:', '');
    const now = Date.now();
    
    // Assume 1 day window for generic stats
    const windowStart = now - 86400000;
    const count = timestamps.filter((t: number) => t > windowStart).length;
    
    stats[apiName] = {
      count,
      limit: 1000, // Default
      remaining: Math.max(0, 1000 - count)
    };
  }
  
  return stats;
}
