import { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

const store: RateLimitStore = {};

const CLEANUP_INTERVAL = 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(store)) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, CLEANUP_INTERVAL);

export type EndpointCategory = "ai" | "calculator" | "export" | "auth" | "general";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  premiumMaxRequests?: number;
}

const RATE_LIMITS: Record<EndpointCategory, RateLimitConfig> = {
  ai: { maxRequests: 10, windowMs: 60 * 1000, premiumMaxRequests: 50 },
  calculator: { maxRequests: 30, windowMs: 60 * 1000 },
  export: { maxRequests: 5, windowMs: 60 * 1000, premiumMaxRequests: 20 },
  auth: { maxRequests: 5, windowMs: 60 * 1000 },
  general: { maxRequests: 100, windowMs: 60 * 1000 },
};

const ENDPOINT_CATEGORIES: Record<string, EndpointCategory> = {
  "/api/ai": "ai",
  "/api/gemini": "ai",
  "/api/chat": "ai",
  "/api/generate": "ai",
  "/api/cleanbi/ai": "ai",
  "/api/calculator": "calculator",
  "/api/cleanbi/calculate": "calculator",
  "/api/valuation": "calculator",
  "/api/export": "export",
  "/api/pdf": "export",
  "/api/download": "export",
  "/api/google/export-to-sheets": "export",
  "/api/google/export-to-docs": "export",
  "/api/google/export": "export",
  "/api/auth": "auth",
  "/api/login": "auth",
  "/api/register": "auth",
  "/api/password": "auth",
};

function getEndpointCategory(path: string): EndpointCategory {
  for (const [prefix, category] of Object.entries(ENDPOINT_CATEGORIES)) {
    if (path.startsWith(prefix)) {
      return category;
    }
  }
  return "general";
}

function getClientIdentifier(req: Request): string {
  const user = req.user as any;
  const userId = user?.claims?.sub || user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  return `ip:${ip}`;
}

function isPremiumUser(req: Request): boolean {
  const user = req.user as any;
  if (!user) return false;
  const tier = user.subscriptionTier || user.cleanbiTier;
  return tier && tier !== "free";
}

function isAdminUser(req: Request): boolean {
  const user = req.user as any;
  return user?.isAdmin === true || user?.claims?.isAdmin === true;
}

function logViolation(
  clientId: string,
  category: EndpointCategory,
  endpoint: string,
  limit: number
): void {
  console.warn(
    `[RATE_LIMIT] Violation: ${clientId} exceeded ${limit} req/min for ${category} (${endpoint})`
  );
}

export function categoryRateLimiter(category?: EndpointCategory) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isAdminUser(req)) {
      return next();
    }

    const effectiveCategory = category || getEndpointCategory(req.path);
    const config = RATE_LIMITS[effectiveCategory];
    const clientId = getClientIdentifier(req);
    const key = `${clientId}:${effectiveCategory}`;
    const now = Date.now();
    const isPremium = isPremiumUser(req);
    const limit = isPremium && config.premiumMaxRequests
      ? config.premiumMaxRequests
      : config.maxRequests;

    if (!store[key] || store[key].resetTime < now) {
      store[key] = { count: 1, resetTime: now + config.windowMs };
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", limit - 1);
      res.setHeader("X-RateLimit-Reset", Math.ceil(store[key].resetTime / 1000));
      return next();
    }

    store[key].count++;
    const remaining = Math.max(0, limit - store[key].count);
    const retryAfterSeconds = Math.ceil((store[key].resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(store[key].resetTime / 1000));

    if (store[key].count > limit) {
      res.setHeader("Retry-After", retryAfterSeconds);
      logViolation(clientId, effectiveCategory, req.path, limit);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds,
        category: effectiveCategory,
        limit,
      });
    }

    next();
  };
}

export function aiRateLimiter() {
  return categoryRateLimiter("ai");
}

export function calculatorRateLimiter() {
  return categoryRateLimiter("calculator");
}

export function exportRateLimiter() {
  return categoryRateLimiter("export");
}

export function authRateLimiter() {
  return categoryRateLimiter("auth");
}

export function globalRateLimiter() {
  return categoryRateLimiter();
}

export function getRateLimitStats(): Record<string, { count: number; resetTime: number }> {
  const now = Date.now();
  const stats: Record<string, { count: number; resetTime: number }> = {};
  for (const [key, entry] of Object.entries(store)) {
    if (entry.resetTime > now) {
      stats[key] = entry;
    }
  }
  return stats;
}

export function clearRateLimitStore(): void {
  for (const key of Object.keys(store)) {
    delete store[key];
  }
}
