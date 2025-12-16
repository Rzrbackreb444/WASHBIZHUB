/**
 * TIER-GATING MIDDLEWARE
 * 
 * Protects premium content based on user subscription tier.
 * Supports the 4-tier structure: free | pro | business | enterprise
 * 
 * Features:
 * - Authentication validation
 * - Subscription tier enforcement with proper hierarchy
 * - Trial period support (trial users get business features)
 * - Usage quota checking per tier
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { cleanbiUsage } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export type SubscriptionTier = "free" | "pro" | "business" | "enterprise";

const ADMIN_BYPASS_EMAILS = [
  "nick@washbizhub.com",
  "thelaundromatfb@gmail.com",
  "rzrbackreb444@gmail.com"
];

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  business: 2,
  enterprise: 3,
};

const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

const QUOTA_LIMITS: Record<string, { free: number; pro: number; business: number | "unlimited"; enterprise: number | "unlimited" }> = {
  cleanbi_analyses: { free: 3, pro: 25, business: "unlimited", enterprise: "unlimited" },
  calculator_uses: { free: 5, pro: 50, business: "unlimited", enterprise: "unlimited" },
  design_exports: { free: 0, pro: 10, business: "unlimited", enterprise: "unlimited" },
  service_guy_diagnoses: { free: 3, pro: 20, business: "unlimited", enterprise: "unlimited" },
};

// Migration map for old tier names
const TIER_MIGRATION: Record<string, SubscriptionTier> = {
  accelerate: "business",
  scale: "business",
  summit: "enterprise",
  starter: "pro",
  all_access: "enterprise",
  allaccess: "enterprise",
  "all-access": "enterprise",
};

function normalizeTier(tier: string | null | undefined): SubscriptionTier {
  const t = tier?.toLowerCase() || "free";
  
  // Check migration map first
  if (TIER_MIGRATION[t]) return TIER_MIGRATION[t];
  
  // Check if it's already a valid tier
  if (t === "free" || t === "pro" || t === "business" || t === "enterprise") {
    return t as SubscriptionTier;
  }
  
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
 * Supports: unified-auth middleware, Cloudflare session, and legacy Replit passport
 */
function getUserIdFromRequest(req: Request): string | null {
  // Check unified auth user first (set by unified-auth middleware)
  if ((req as any).user?.id) return (req as any).user.id;
  
  // Check session for Cloudflare auth
  if ((req as any).session?.userId) return (req as any).session.userId;
  
  // Legacy Replit passport check
  const user = req.user as any;
  if (!user) return null;
  return user.claims?.sub || user.sub || user.id || null;
}

/**
 * Gets user email from request session
 * Supports: unified-auth middleware, Cloudflare session, and legacy Replit passport
 */
function getUserEmailFromRequest(req: Request): string | null {
  // Check unified auth user first (set by unified-auth middleware)
  if ((req as any).user?.email) return (req as any).user.email;
  
  // Check session for Cloudflare auth
  if ((req as any).session?.email) return (req as any).session.email;
  
  // Legacy Replit passport check
  const user = req.user as any;
  if (!user) return null;
  return user.claims?.email || user.email || null;
}

/**
 * Determines the effective subscription tier for a user,
 * considering both subscription status and trial period.
 * 
 * @param user - User object from database (can include subscriptionTier, trialEndDate, isPro)
 * @returns The effective tier ('free' | 'pro' | 'business' | 'enterprise')
 */
export function getUserTier(user: {
  subscriptionTier?: string | null;
  trialEndDate?: Date | string | null;
  isPro?: boolean | null;
  cleanbiTier?: string | null;
} | null | undefined): SubscriptionTier {
  if (!user) return "free";
  
  // Get the normalized tier from subscription
  const subscriptionTier = normalizeTier(user.subscriptionTier);
  
  // Check CLEANBI tier (may be higher than subscription tier)
  const cleanbiTier = normalizeTier(user.cleanbiTier);
  
  // Use the highest tier between subscription and CLEANBI
  let effectiveTier = TIER_LEVELS[cleanbiTier] > TIER_LEVELS[subscriptionTier] 
    ? cleanbiTier 
    : subscriptionTier;
  
  // Trial users get business tier access
  if (isTrialActive(user.trialEndDate) && TIER_LEVELS[effectiveTier] < TIER_LEVELS["business"]) {
    effectiveTier = "business";
  }
  
  // Legacy isPro flag grants at least pro access
  if (user.isPro === true && TIER_LEVELS[effectiveTier] < TIER_LEVELS["pro"]) {
    effectiveTier = "pro";
  }
  
  return effectiveTier;
}

/**
 * Middleware that validates user is logged in (session check).
 * Supports: unified-auth middleware, Cloudflare session, and legacy Replit passport
 * Returns 401 if not authenticated.
 */
export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  // Check unified auth user (set by unified-auth middleware)
  const unifiedUser = (req as any).user;
  
  // Check Cloudflare session
  const sessionUserId = (req as any).session?.userId;
  
  // Check legacy Replit passport
  const passportAuthenticated = typeof req.isAuthenticated === 'function' && req.isAuthenticated();
  
  // User is authenticated if any of these are true
  const isAuthenticated = !!(unifiedUser?.id || sessionUserId || passportAuthenticated);
  
  if (!isAuthenticated) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this feature",
      code: "AUTH_REQUIRED",
      loginUrl: "/login",
    });
  }
  
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Session expired. Please log in again.",
      code: "SESSION_EXPIRED",
      loginUrl: "/login",
    });
  }
  
  (req as any).userId = userId;
  return next();
};

/**
 * Middleware factory that checks if user has required subscription tier.
 * Returns 403 with upgrade message if tier is insufficient.
 * Trial users get business tier features.
 * 
 * @param minTier - Minimum required tier ('free' | 'pro' | 'business' | 'enterprise')
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
          loginUrl: "/login",
        });
      }
      
      if (isAdminBypass(userEmail)) {
        console.log(`[Tier Gate] Admin bypass granted for ${userEmail}`);
        (req as any).userId = userId;
        (req as any).userTier = "enterprise";
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
        upgradeMessage: `Upgrade to ${requiredTierName} to unlock ${minTier === 'enterprise' ? 'enterprise' : 'premium'} features.`,
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
 * Free users have limited usage, Business+ users have unlimited.
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
          message: `You've reached your ${quotaKey.replace(/_/g, ' ')} limit (${limit}). Upgrade to Business for unlimited usage.`,
          code: "QUOTA_EXCEEDED",
          currentTier: effectiveTier,
          quotaKey,
          used: usage,
          limit,
          upgradeMessage: "Upgrade to Business ($149/mo) for unlimited usage of all features.",
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
