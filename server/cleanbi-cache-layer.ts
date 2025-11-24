// ========================================
// CLEANBI CACHING LAYER
// 24hr TTL, 85%+ target hit rate
// Reduces API calls by 10x
// ========================================

import { createClient, RedisClientType } from 'redis';

// In-memory fallback if Redis unavailable
const memoryCache = new Map<string, { data: any; expires: number }>();

let redisClient: RedisClientType | null = null;
let useRedis = false;

// ========================================
// REDIS INITIALIZATION
// ========================================

export async function initializeCacheLayer() {
  // Only use Redis if REDIS_URL is provided
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.on('error', (err: Error) => {
        console.error('Redis error:', err);
        useRedis = false;
      });
      
      await redisClient.connect();
      useRedis = true;
      console.log('✅ Redis cache layer initialized');
    } catch (error) {
      console.warn('⚠️ Redis unavailable, falling back to memory cache:', error);
      useRedis = false;
    }
  } else {
    console.log('📦 Using in-memory cache (Redis not configured)');
  }
}

// ========================================
// CACHE KEY GENERATION
// ========================================

export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `cleanbi:${prefix}:${parts.join(':')}`;
}

// Examples:
// generateCacheKey('geocode', '123 Main St, NY') => 'cleanbi:geocode:123 Main St, NY'
// generateCacheKey('places', 'ChIJd8BlQ2BZwokRAFUEcm_qrcA') => 'cleanbi:places:ChIJd8BlQ2BZwokRAFUEcm_qrcA'
// generateCacheKey('demographics', 10001) => 'cleanbi:demographics:10001'

// ========================================
// CACHE OPERATIONS
// ========================================

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  try {
    if (useRedis && redisClient) {
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
    } else {
      // Memory cache
      const cached = memoryCache.get(key);
      if (cached && Date.now() < cached.expires) {
        return cached.data as T;
      } else if (cached) {
        // Expired
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.error('Cache get error:', error);
  }
  
  return null;
}

export async function cacheSet(key: string, value: any, ttlSeconds: number = 86400) {
  try {
    if (useRedis && redisClient) {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } else {
      // Memory cache
      memoryCache.set(key, {
        data: value,
        expires: Date.now() + (ttlSeconds * 1000)
      });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDelete(key: string) {
  try {
    if (useRedis && redisClient) {
      await redisClient.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function cacheClear(pattern?: string) {
  try {
    if (useRedis && redisClient) {
      if (pattern) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        await redisClient.flushDb();
      }
    } else {
      if (pattern) {
        // Simple pattern matching for memory cache
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of Array.from(memoryCache.keys())) {
          if (regex.test(key)) {
            memoryCache.delete(key);
          }
        }
      } else {
        memoryCache.clear();
      }
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

// ========================================
// CACHE ANALYTICS
// ========================================

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  hitRate: number;
}

const stats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  hitRate: 0
};

export function recordCacheHit() {
  stats.hits++;
  updateHitRate();
}

export function recordCacheMiss() {
  stats.misses++;
  updateHitRate();
}

export function recordCacheSet() {
  stats.sets++;
}

function updateHitRate() {
  const total = stats.hits + stats.misses;
  stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
}

export function getCacheStats(): CacheStats {
  return { ...stats };
}

export function resetCacheStats() {
  stats.hits = 0;
  stats.misses = 0;
  stats.sets = 0;
  stats.hitRate = 0;
}

// ========================================
// CACHED API WRAPPERS
// ========================================

/**
 * Generic cached fetch wrapper
 * Usage: const data = await cachedFetch('geocode', '123 Main St', fetchFn, 86400);
 */
export async function cachedFetch<T>(
  cachePrefix: string,
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 86400
): Promise<T> {
  const fullKey = generateCacheKey(cachePrefix, cacheKey);
  
  // Try cache first
  const cached = await cacheGet<T>(fullKey);
  if (cached !== null) {
    recordCacheHit();
    return cached;
  }
  
  // Cache miss - fetch fresh data
  recordCacheMiss();
  const data = await fetchFn();
  
  // Store in cache
  await cacheSet(fullKey, data, ttlSeconds);
  recordCacheSet();
  
  return data;
}

// ========================================
// BATCH CACHE OPERATIONS
// ========================================

/**
 * Get multiple keys at once (batched)
 */
export async function cacheGetBatch<T = any>(keys: string[]): Promise<Map<string, T>> {
  const results = new Map<string, T>();
  
  try {
    if (useRedis && redisClient) {
      const values = await redisClient.mGet(keys);
      values.forEach((value, index) => {
        if (value) {
          results.set(keys[index], JSON.parse(value) as T);
        }
      });
    } else {
      // Memory cache
      for (const key of keys) {
        const cached = memoryCache.get(key);
        if (cached && Date.now() < cached.expires) {
          results.set(key, cached.data as T);
        }
      }
    }
  } catch (error) {
    console.error('Batch cache get error:', error);
  }
  
  return results;
}

/**
 * Set multiple keys at once (batched)
 */
export async function cacheSetBatch(entries: Array<{ key: string; value: any; ttl?: number }>) {
  try {
    if (useRedis && redisClient) {
      const pipeline = redisClient.multi();
      for (const entry of entries) {
        const ttl = entry.ttl || 86400;
        pipeline.setEx(entry.key, ttl, JSON.stringify(entry.value));
      }
      await pipeline.exec();
    } else {
      // Memory cache
      for (const entry of entries) {
        const ttl = (entry.ttl || 86400) * 1000;
        memoryCache.set(entry.key, {
          data: entry.value,
          expires: Date.now() + ttl
        });
      }
    }
  } catch (error) {
    console.error('Batch cache set error:', error);
  }
}

// ========================================
// TTL RECOMMENDATIONS BY DATA TYPE
// ========================================

export const CACHE_TTL = {
  GEOCODE: 604800,      // 7 days (addresses rarely change)
  PLACE_DETAILS: 86400, // 24 hours (reviews/ratings update daily)
  DEMOGRAPHICS: 2592000, // 30 days (census data stable)
  COMPETITION: 86400,   // 24 hours (business listings change)
  ROUTES: 3600,         // 1 hour (traffic patterns change)
  WEATHER: 1800,        // 30 minutes (weather updates)
  SCORES: 3600,         // 1 hour (calculated scores can refresh hourly)
  API_RESPONSE: 86400   // 24 hours (default for external APIs)
};

// ========================================
// CLEANUP & SHUTDOWN
// ========================================

export async function shutdownCacheLayer() {
  if (redisClient) {
    await redisClient.quit();
    console.log('✅ Redis cache layer shutdown');
  }
  
  // Clear memory cache
  memoryCache.clear();
}

// ========================================
// MEMOIZATION HELPERS
// ========================================

/**
 * Memoize a function with caching
 * Perfect for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn: (...args: Parameters<T>) => string,
  ttlSeconds: number = 3600
): T {
  return (async (...args: Parameters<T>) => {
    const key = generateCacheKey('memoized', keyFn(...args));
    
    const cached = await cacheGet<ReturnType<T>>(key);
    if (cached !== null) {
      recordCacheHit();
      return cached;
    }
    
    recordCacheMiss();
    const result = await fn(...args);
    await cacheSet(key, result, ttlSeconds);
    recordCacheSet();
    
    return result;
  }) as T;
}
