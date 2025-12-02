import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { PLATFORM_ADMIN_EMAILS } from "./cleanbi-subscription-manager";

/**
 * Platform admin emails bypass all rate limits
 */
function isAdminUser(req: Request): boolean {
  const user = req.user as any;
  const userEmail = user?.claims?.email?.toLowerCase();
  return userEmail && PLATFORM_ADMIN_EMAILS.includes(userEmail);
}

/**
 * Rate Limiting Middleware - PostgreSQL-based request throttling
 * 
 * Prevents abuse by limiting the number of requests per IP address
 * per endpoint within a time window. Persists across server restarts.
 * 
 * ADMINS: Platform admins bypass all rate limits.
 * 
 * @param endpoint - Endpoint path (e.g., "/api/alerts/price")
 * @param maxRequests - Maximum requests allowed in time window
 * @param windowHours - Time window in hours (default: 1 hour)
 */
export function rateLimiter(
  endpoint: string,
  maxRequests: number = 5,
  windowHours: number = 1
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ADMIN BYPASS: Platform admins skip all rate limits
      if (isAdminUser(req)) {
        return next();
      }
      
      // Get IP address (handle proxy headers)
      const ipAddress = 
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown';
      
      // Check if IP has exceeded rate limit
      const allowed = await storage.checkRateLimit(
        ipAddress,
        endpoint,
        maxRequests,
        windowHours
      );
      
      if (!allowed) {
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
          retryAfter: `${windowHours} hour(s)`
        });
      }
      
      // Record this request
      await storage.recordRequest(ipAddress, endpoint, windowHours);
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request if rate limiter has issues
      next();
    }
  };
}

/**
 * Cleanup job - Remove expired rate limit logs
 * Should be called periodically (e.g., via cron job or BullMQ)
 */
export async function cleanupRateLimits() {
  try {
    await storage.cleanupExpiredRateLimits();
    await storage.cleanupExpiredTokens();
    console.log('Cleaned up expired rate limits and tokens');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
