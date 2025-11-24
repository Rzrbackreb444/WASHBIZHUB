// ========================================
// REDIS CONNECTION MANAGER
// ========================================
//
// Production-grade Redis connection with graceful fallback
// - Primary: Redis for distributed atomic operations
// - Fallback: In-memory Map for development/testing
// - Auto-reconnect on connection loss
// - Health checks and monitoring
//
// ========================================

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Initialize Redis connection
 * Returns true if connected successfully, false if using fallback
 */
export async function initializeRedis(): Promise<boolean> {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('📦 REDIS_URL not configured - using in-memory fallback');
    return false;
  }
  
  if (isConnecting) {
    console.log('⏳ Redis connection already in progress');
    return false;
  }
  
  try {
    isConnecting = true;
    connectionAttempts++;
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > MAX_RECONNECT_ATTEMPTS) {
            console.error(`❌ Redis reconnection failed after ${MAX_RECONNECT_ATTEMPTS} attempts`);
            return false; // Stop reconnecting
          }
          
          // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms
          const delay = Math.min(50 * Math.pow(2, retries), 5000);
          console.log(`🔄 Redis reconnecting in ${delay}ms (attempt ${retries + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          return delay;
        }
      }
    });
    
    // Event handlers
    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('🔗 Redis connecting...');
    });
    
    redisClient.on('ready', () => {
      console.log('✅ Redis connected and ready');
      connectionAttempts = 0; // Reset counter on successful connection
    });
    
    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
    
    redisClient.on('end', () => {
      console.log('⚠️  Redis connection closed');
    });
    
    await redisClient.connect();
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to connect to Redis: ${error.message}`);
    redisClient = null;
    return false;
  } finally {
    isConnecting = false;
  }
}

/**
 * Get Redis client instance
 * Returns null if not connected (use fallback logic)
 */
export function getRedis(): RedisClientType | null {
  return redisClient?.isReady ? redisClient : null;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisClient?.isReady ?? false;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ Redis connection closed gracefully');
    } catch (error: any) {
      console.error(`❌ Error closing Redis: ${error.message}`);
      await redisClient.disconnect();
    } finally {
      redisClient = null;
    }
  }
}

/**
 * Execute Redis command with automatic fallback
 * Returns result if successful, null if fallback needed
 */
export async function executeRedis<T>(
  operation: (client: RedisClientType) => Promise<T>
): Promise<T | null> {
  const client = getRedis();
  
  if (!client) {
    return null; // Caller should use fallback logic
  }
  
  try {
    return await operation(client);
  } catch (error: any) {
    console.error(`❌ Redis operation failed: ${error.message}`);
    return null; // Fallback to in-memory
  }
}

/**
 * Health check for Redis connection
 */
export async function redisHealthCheck(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const client = getRedis();
  
  if (!client) {
    return {
      connected: false,
      error: 'Redis client not initialized'
    };
  }
  
  try {
    const start = Date.now();
    await client.ping();
    const latency = Date.now() - start;
    
    return {
      connected: true,
      latency
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message
    };
  }
}
