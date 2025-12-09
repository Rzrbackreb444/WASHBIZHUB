/**
 * TIER-GATING MIDDLEWARE
 * 
 * Protects premium content based on user subscription tier.
 * Supports the simplified 2-tier structure: free | all_access
 * 
 * Features:
 * - Authentication validation
 * - Subscription tier enforcement
 * - Trial period support (trial users get all_access features)
 * - Usage quota checking
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { cleanbiUsage } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export type SubscriptionTier = "free" | "all_access";

const ADMIN_BYPASS_EMAILS = [
  "nick@washbizhub.com",
  "thelaundromatfb@gmail.com",
  "rzrbackreb444@gmail.com"
];

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  all_access: 10,
};

const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: "Free",
  all_access: "All-Access",
};

const QUOTA_LIMITS: Record<string, { free: number; all_access: number | "unlimited" }> = {
  cleanbi_analyses: { free: 3, all_access: "unlimited" },
  calculator_uses: { free: 5, all_access: "unlimited" },
  design_exports: { free: 0, all_access: "unlimited" },
  service_guy_diagnoses: { free: 3, all_access: "unlimited" },
};

function normalizeTier(tier: string | null | undefined): SubscriptionTier {
  const t = tier?.toLowerCase() || "free";
  if (t === "all_access" || t === "allaccess" || t === "all-access") return "all_access";
  if (t === "accelerate" || t === "starter" || t === "pro" || t === "scale" || t === "summit" || t === "enterprise") return "all_access";
  return "free";
}

function isAdminBypass(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_BYPASS_EMAILS.includes(email.toLowerCase());
}

function isTrialActive(trialEndDate: Date | string | null | undefined): boolean {
  if (!trialEndDate) return false;
  const endDate = typeof trialEndDate === 'string' ? new Date(trialEndDate) : trialEndDate;
  return endDate > new Date();
}

/**
 * Gets user ID from request session
 */
function getUserIdFromRequest(req: Request): string | null {
  const user = req.user as any;
  if (!user) return null;
  return user.claims?.sub || user.sub || null;
}

/**
 * Gets user email from request session
 */
function getUserEmailFromRequest(req: Request): string | null {
  const user = req.user as any;
  if (!user) return null;
  return user.claims?.email || user.email || null;
}

/**
 * Determines the effective subscription tier for a user,
 * considering both subscription status and trial period.
 * 
 * @param user - User object from database (can include subscriptionTier, trialEndDate, isPro)
 * @returns The effective tier ('free' or 'all_access')
 */
export function getUserTier(user: {
  subscriptionTier?: string | null;
  trialEndDate?: Date | string | null;
  isPro?: boolean | null;
  cleanbiTier?: string | null;
} | null | undefined): SubscriptionTier {
  if (!user) return "free";
  
  if (user.isPro === true) return "all_access";
  
  if (isTrialActive(user.trialEndDate)) return "all_access";
  
  const cleanbiTier = user.cleanbiTier;
  if (cleanbiTier && normalizeTier(cleanbiTier) === "all_access") return "all_access";
  
  return normalizeTier(user.subscriptionTier);
}

/**
 * Middleware that validates user is logged in (session check).
 * Returns 401 if not authenticated.
 */
export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated() || !user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this feature",
      code: "AUTH_REQUIRED",
      loginUrl: "/api/login",
    });
  }
  
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Session expired. Please log in again.",
      code: "SESSION_EXPIRED",
      loginUrl: "/api/login",
    });
  }
  
  (req as any).userId = userId;
  return next();
};

/**
 * Middleware factory that checks if user has required subscription tier.
 * Returns 403 with upgrade message if tier is insufficient.
 * Trial users get all_access features.
 * 
 * @param minTier - Minimum required tier ('free' or 'all_access')
 * @returns Express middleware
 */
export function requireTier(minTier: SubscriptionTier): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserIdFromRequest(req);
      const userEmail = getUserEmailFromRequest(req);
      
      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
          message: "Please log in to access this feature",
          code: "AUTH_REQUIRED",
          loginUrl: "/api/login",
        });
      }
      
      if (isAdminBypass(userEmail)) {
        console.log(`[Tier Gate] Admin bypass granted for ${userEmail}`);
        (req as any).userId = userId;
        (req as any).userTier = "all_access";
        (req as any).isAdminBypass = true;
        return next();
      }
      
      const dbUser = await storage.getUser(userId);
      const userTier = getUserTier(dbUser);
      
      (req as any).userId = userId;
      (req as any).userTier = userTier;
      (req as any).dbUser = dbUser;
      
      const userLevel = TIER_LEVELS[userTier];
      const requiredLevel = TIER_LEVELS[minTier];
      
      if (userLevel >= requiredLevel) {
        return next();
      }
      
      const currentTierName = TIER_NAMES[userTier];
      const requiredTierName = TIER_NAMES[minTier];
      
      console.log(`[Tier Gate] Access denied: User ${userId} has ${userTier}, requires ${minTier}`);
      
      return res.status(403).json({
        error: "Upgrade required",
        message: `This feature requires ${requiredTierName} tier. You currently have ${currentTierName} tier.`,
        code: "TIER_INSUFFICIENT",
        currentTier: userTier,
        requiredTier: minTier,
        upgradeMessage: `Upgrade to ${requiredTierName} ($129/mo) to unlock unlimited access to all features.`,
        upgradeUrl: `/pricing?feature=${encodeURIComponent(req.path)}&required=${minTier}`,
        features: {
          unlocked: [
            "Unlimited CLEANBI analyses",
            "Full Calculator Suite (50+ tools)",
            "Design Studio (2D/3D floor plans)",
            "Service Guy AI diagnostics",
            "Complete Book & All Courses",
          ]
        }
      });
    } catch (error) {
      console.error("[Tier Gate] Middleware error:", error);
      return res.status(500).json({
        error: "Server error",
        message: "Failed to verify subscription tier",
        code: "TIER_CHECK_FAILED",
      });
    }
  };
}

/**
 * Middleware factory that validates user hasn't exceeded usage limits.
 * Free users have limited usage, all_access users have unlimited.
 * 
 * @param quotaKey - The quota key to check (e.g., 'cleanbi_analyses', 'calculator_uses')
 * @returns Express middleware
 */
export function checkQuota(quotaKey: string): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId || getUserIdFromRequest(req);
      const userTier = (req as any).userTier as SubscriptionTier | undefined;
      
      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
          message: "Please log in to access this feature",
          code: "AUTH_REQUIRED",
        });
      }
      
      const userEmail = getUserEmailFromRequest(req);
      if (isAdminBypass(userEmail)) {
        return next();
      }
      
      let effectiveTier = userTier;
      if (!effectiveTier) {
        const dbUser = await storage.getUser(userId);
        effectiveTier = getUserTier(dbUser);
        (req as any).userTier = effectiveTier;
      }
      
      const limits = QUOTA_LIMITS[quotaKey];
      if (!limits) {
        console.warn(`[Tier Gate] Unknown quota key: ${quotaKey}`);
        return next();
      }
      
      const limit = limits[effectiveTier];
      
      if (limit === "unlimited") {
        (req as any).quotaRemaining = Infinity;
        return next();
      }
      
      const usage = await getUsageCount(userId, quotaKey);
      const remaining = Math.max(0, limit - usage);
      
      (req as any).quotaUsed = usage;
      (req as any).quotaLimit = limit;
      (req as any).quotaRemaining = remaining;
      
      if (remaining <= 0) {
        console.log(`[Tier Gate] Quota exceeded: User ${userId}, key ${quotaKey}, used ${usage}/${limit}`);
        
        return res.status(403).json({
          error: "Quota exceeded",
          message: `You've reached your ${quotaKey.replace(/_/g, ' ')} limit (${limit}). Upgrade to All-Access for unlimited usage.`,
          code: "QUOTA_EXCEEDED",
          currentTier: effectiveTier,
          quotaKey,
          used: usage,
          limit,
          upgradeMessage: "Upgrade to All-Access ($129/mo) for unlimited usage of all features.",
          upgradeUrl: `/pricing?quota=${quotaKey}`,
        });
      }
      
      return next();
    } catch (error) {
      console.error("[Tier Gate] Quota check error:", error);
      return res.status(500).json({
        error: "Server error",
        message: "Failed to check usage quota",
        code: "QUOTA_CHECK_FAILED",
      });
    }
  };
}

/**
 * Get usage count for a specific quota key
 */
async function getUsageCount(userId: string, quotaKey: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  try {
    switch (quotaKey) {
      case "cleanbi_analyses": {
        const [result] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(cleanbiUsage)
          .where(and(
            eq(cleanbiUsage.userId, userId),
            gte(cleanbiUsage.createdAt, startOfMonth)
          ));
        return result?.count || 0;
      }
      
      default:
        return 0;
    }
  } catch (error) {
    console.error(`[Tier Gate] Error getting usage for ${quotaKey}:`, error);
    return 0;
  }
}

/**
 * Increment usage count for a specific quota key
 */
export async function incrementUsage(userId: string, quotaKey: string, metadata?: Record<string, any>): Promise<void> {
  try {
    switch (quotaKey) {
      case "cleanbi_analyses": {
        const month = new Date().toISOString().slice(0, 7);
        await db.insert(cleanbiUsage).values({
          userId,
          month,
          reportType: metadata?.reportType || "basic",
          addressScored: metadata?.address || null,
        });
        break;
      }
      
      default:
        console.warn(`[Tier Gate] Unknown quota key for increment: ${quotaKey}`);
    }
  } catch (error) {
    console.error(`[Tier Gate] Error incrementing usage for ${quotaKey}:`, error);
  }
}

/**
 * Optional auth middleware - attaches user info if logged in but doesn't block
 */
export const optionalTierInfo: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);
    
    if (userId) {
      const dbUser = await storage.getUser(userId);
      const userTier = getUserTier(dbUser);
      (req as any).userId = userId;
      (req as any).userTier = userTier;
      (req as any).dbUser = dbUser;
    } else {
      (req as any).userTier = "free";
    }
    
    return next();
  } catch (error) {
    (req as any).userTier = "free";
    return next();
  }
};

export { TIER_LEVELS, TIER_NAMES, QUOTA_LIMITS };
