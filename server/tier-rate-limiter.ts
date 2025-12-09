import { Request, Response, NextFunction } from "express";
import { PLATFORM_ADMIN_EMAILS } from "./cleanbi-subscription-manager";

interface RateLimitEntry {
  requests: number[];
  cleanbiUsageThisMonth: number;
  monthStart: number;
}

interface TierConfig {
  requestsPerMinute: number;
  cleanbiAnalysesPerMonth: number;
}

const TIER_CONFIGS: Record<string, TierConfig> = {
  free: { requestsPerMinute: 30, cleanbiAnalysesPerMonth: 10 },
  starter: { requestsPerMinute: 100, cleanbiAnalysesPerMonth: -1 },
  pro: { requestsPerMinute: 300, cleanbiAnalysesPerMonth: -1 },
  enterprise: { requestsPerMinute: 1000, cleanbiAnalysesPerMonth: -1 },
};

const WINDOW_MS = 60 * 1000;

const userRateLimits = new Map<string, RateLimitEntry>();
const ipRateLimits = new Map<string, RateLimitEntry>();

function isAdminUser(req: Request): boolean {
  const user = req.user as any;
  const userEmail = user?.claims?.email?.toLowerCase();
  return userEmail && PLATFORM_ADMIN_EMAILS.includes(userEmail);
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function getUserTier(req: Request): string {
  const user = req.user as any;
  if (!user) return 'free';
  
  const tier = user?.claims?.subscriptionTier || 
               user?.subscriptionTier || 
               user?.cleanbiTier ||
               'free';
  
  return tier.toLowerCase();
}

function getUserId(req: Request): string | null {
  const user = req.user as any;
  return user?.claims?.sub || user?.sub || user?.id || null;
}

function getOrCreateEntry(key: string, store: Map<string, RateLimitEntry>): RateLimitEntry {
  const now = Date.now();
  const currentMonth = new Date(now).getMonth();
  
  let entry = store.get(key);
  
  if (!entry) {
    entry = {
      requests: [],
      cleanbiUsageThisMonth: 0,
      monthStart: new Date(now).setDate(1),
    };
    store.set(key, entry);
  }
  
  const entryMonth = new Date(entry.monthStart).getMonth();
  if (entryMonth !== currentMonth) {
    entry.cleanbiUsageThisMonth = 0;
    entry.monthStart = new Date(now).setDate(1);
  }
  
  entry.requests = entry.requests.filter(t => now - t < WINDOW_MS);
  
  return entry;
}

export function tierRateLimiter(routeType: 'api' | 'cleanbi' = 'api') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isAdminUser(req)) {
        return next();
      }

      const userId = getUserId(req);
      const clientIP = getClientIP(req);
      const tier = getUserTier(req);
      const tierConfig = TIER_CONFIGS[tier] || TIER_CONFIGS.free;

      const key = userId || clientIP;
      const store = userId ? userRateLimits : ipRateLimits;
      const entry = getOrCreateEntry(key, store);

      const now = Date.now();

      if (routeType === 'cleanbi' && tierConfig.cleanbiAnalysesPerMonth !== -1) {
        if (entry.cleanbiUsageThisMonth >= tierConfig.cleanbiAnalysesPerMonth) {
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          nextMonth.setDate(1);
          nextMonth.setHours(0, 0, 0, 0);
          
          const retryAfterSeconds = Math.ceil((nextMonth.getTime() - now) / 1000);
          
          res.setHeader('X-RateLimit-Limit', tierConfig.cleanbiAnalysesPerMonth.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', Math.ceil(nextMonth.getTime() / 1000).toString());
          res.setHeader('Retry-After', retryAfterSeconds.toString());
          
          return res.status(429).json({
            error: 'Monthly CLEANBI analysis limit reached',
            message: `You've used all ${tierConfig.cleanbiAnalysesPerMonth} CLEANBI analyses for this month. Upgrade to Starter or higher for unlimited analyses.`,
            limit: tierConfig.cleanbiAnalysesPerMonth,
            used: entry.cleanbiUsageThisMonth,
            tier,
            retryAfter: retryAfterSeconds,
            upgradeUrl: '/pricing',
          });
        }
      }

      if (entry.requests.length >= tierConfig.requestsPerMinute) {
        const oldestRequest = entry.requests[0];
        const resetTime = oldestRequest + WINDOW_MS;
        const retryAfterSeconds = Math.ceil((resetTime - now) / 1000);

        res.setHeader('X-RateLimit-Limit', tierConfig.requestsPerMinute.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
        res.setHeader('Retry-After', retryAfterSeconds.toString());

        console.warn(`🚨 [RATE LIMIT] ${tier.toUpperCase()} tier exceeded: ${key} (${entry.requests.length}/${tierConfig.requestsPerMinute} req/min)`);

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `You've exceeded the ${tierConfig.requestsPerMinute} requests/minute limit for the ${tier} tier.`,
          limit: tierConfig.requestsPerMinute,
          remaining: 0,
          tier,
          retryAfter: retryAfterSeconds,
          upgradeUrl: tier === 'free' ? '/pricing' : undefined,
        });
      }

      entry.requests.push(now);
      
      if (routeType === 'cleanbi') {
        entry.cleanbiUsageThisMonth++;
      }

      const remaining = tierConfig.requestsPerMinute - entry.requests.length;
      const resetTime = entry.requests[0] + WINDOW_MS;

      res.setHeader('X-RateLimit-Limit', tierConfig.requestsPerMinute.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

      if (routeType === 'cleanbi' && tierConfig.cleanbiAnalysesPerMonth !== -1) {
        res.setHeader('X-RateLimit-CleanBI-Limit', tierConfig.cleanbiAnalysesPerMonth.toString());
        res.setHeader('X-RateLimit-CleanBI-Remaining', 
          (tierConfig.cleanbiAnalysesPerMonth - entry.cleanbiUsageThisMonth).toString());
      }

      next();
    } catch (error) {
      console.error('[TIER RATE LIMITER] Error:', error);
      next();
    }
  };
}

export function trackCleanbiUsage(req: Request): void {
  const userId = getUserId(req);
  const clientIP = getClientIP(req);
  const key = userId || clientIP;
  const store = userId ? userRateLimits : ipRateLimits;
  const entry = store.get(key);
  
  if (entry) {
    entry.cleanbiUsageThisMonth++;
  }
}

export function getUsageStats(req: Request): { 
  tier: string; 
  requestsUsed: number; 
  requestsLimit: number;
  cleanbiUsed: number;
  cleanbiLimit: number;
} {
  const userId = getUserId(req);
  const clientIP = getClientIP(req);
  const tier = getUserTier(req);
  const tierConfig = TIER_CONFIGS[tier] || TIER_CONFIGS.free;
  
  const key = userId || clientIP;
  const store = userId ? userRateLimits : ipRateLimits;
  const entry = store.get(key);
  
  return {
    tier,
    requestsUsed: entry?.requests.length || 0,
    requestsLimit: tierConfig.requestsPerMinute,
    cleanbiUsed: entry?.cleanbiUsageThisMonth || 0,
    cleanbiLimit: tierConfig.cleanbiAnalysesPerMonth,
  };
}

setInterval(() => {
  const now = Date.now();
  
  for (const [key, entry] of userRateLimits.entries()) {
    entry.requests = entry.requests.filter(t => now - t < WINDOW_MS * 5);
    if (entry.requests.length === 0) {
      const monthsOld = (now - entry.monthStart) / (30 * 24 * 60 * 60 * 1000);
      if (monthsOld > 2) {
        userRateLimits.delete(key);
      }
    }
  }
  
  for (const [key, entry] of ipRateLimits.entries()) {
    entry.requests = entry.requests.filter(t => now - t < WINDOW_MS * 5);
    if (entry.requests.length === 0) {
      const monthsOld = (now - entry.monthStart) / (30 * 24 * 60 * 60 * 1000);
      if (monthsOld > 1) {
        ipRateLimits.delete(key);
      }
    }
  }
}, 5 * 60 * 1000);

export function getTierRateLimitStats() {
  return {
    userEntries: userRateLimits.size,
    ipEntries: ipRateLimits.size,
    tierConfigs: TIER_CONFIGS,
  };
}
