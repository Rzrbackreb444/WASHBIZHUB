/**
 * SUBSCRIPTION TIER ENFORCEMENT MIDDLEWARE
 * 
 * Server-side middleware to enforce subscription tier access for premium API routes.
 * 
 * Tier Hierarchy: free < starter < pro < enterprise
 * 
 * Usage:
 *   import { requireTier } from "./middleware/tier-enforcement";
 *   router.post("/analyze", requireTier("starter"), async (req, res) => { ... });
 * 
 * Admin Bypass: Platform owner emails always have full access
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "../storage";

// NEW 2-TIER STRUCTURE: Free + All-Access
export type SubscriptionTier = "free" | "all_access" | "starter" | "pro" | "enterprise";

// Platform owner emails with full admin access (bypass all tier checks)
const ADMIN_BYPASS_EMAILS = [
  "nick@washbizhub.com",
  "thelaundromatfb@gmail.com",
  "rzrbackreb444@gmail.com"
];

// Simplified: free (0) vs all_access (10) - legacy tiers map to all_access
const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  all_access: 10,
  // Legacy tiers map to all_access level for backward compatibility
  starter: 10,
  pro: 10,
  enterprise: 10,
};

const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: "Free",
  all_access: "All-Access",
  starter: "All-Access", // Legacy mapping
  pro: "All-Access",     // Legacy mapping
  enterprise: "All-Access", // Legacy mapping
};

const TIER_PRICING: Record<SubscriptionTier, string> = {
  free: "$0/mo",
  all_access: "$129/mo",
  starter: "$129/mo", // Legacy mapping
  pro: "$129/mo",     // Legacy mapping
  enterprise: "$129/mo", // Legacy mapping
};

function getTierLevel(tier: string | null | undefined): number {
  const normalizedTier = (tier?.toLowerCase() || "free") as SubscriptionTier;
  return TIER_LEVELS[normalizedTier] ?? 0;
}

function normalizeTier(tier: string | null | undefined): SubscriptionTier {
  const t = tier?.toLowerCase() || "free";
  if (t in TIER_LEVELS) {
    return t as SubscriptionTier;
  }
  // Map legacy tier names to all_access
  if (t === "accelerate" || t === "starter") return "all_access";
  if (t === "scale" || t === "pro") return "all_access";
  if (t === "summit" || t === "enterprise") return "all_access";
  if (t === "all_access" || t === "allaccess" || t === "all-access") return "all_access";
  return "free";
}

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const user = req.user as any;
  if (!user) return null;
  return user.claims?.sub || user.sub || null;
}

async function getUserEmailFromRequest(req: Request): Promise<string | null> {
  const user = req.user as any;
  if (!user) return null;
  return user.claims?.email || user.email || null;
}

function isAdminBypass(email: string | null): boolean {
  if (!email) return false;
  return ADMIN_BYPASS_EMAILS.includes(email.toLowerCase());
}

async function getUserTier(userId: string): Promise<SubscriptionTier> {
  try {
    const user = await storage.getUser(userId);
    if (!user) return "free";
    const cleanbiTier = user.cleanbiTier as string | null;
    const subscriptionTier = user.subscriptionTier as string | null;
    const tierToUse = cleanbiTier || subscriptionTier;
    return normalizeTier(tierToUse);
  } catch (error) {
    console.error("[Tier Enforcement] Error fetching user tier:", error);
    return "free";
  }
}

/**
 * Middleware factory that enforces minimum subscription tier access.
 * 
 * @param minTier - The minimum tier required to access the route
 * @returns Express middleware that checks tier access
 * 
 * @example
 * router.post("/bulk", requireTier("starter"), handler);
 * router.post("/expansion", requireTier("pro"), handler);
 */
export function requireTier(minTier: SubscriptionTier): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = await getUserIdFromRequest(req);
      const userEmail = await getUserEmailFromRequest(req);
      
      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
          message: "Please log in to access this feature",
          code: "AUTH_REQUIRED",
        });
      }

      // Admin bypass: Platform owners always have full access
      if (isAdminBypass(userEmail)) {
        console.log(`[Tier Enforcement] Admin bypass granted for ${userEmail}`);
        (req as any).userTier = "enterprise";
        (req as any).userId = userId;
        (req as any).isAdminBypass = true;
        return next();
      }

      const userTier = await getUserTier(userId);
      const userLevel = getTierLevel(userTier);
      const requiredLevel = getTierLevel(minTier);

      if (userLevel >= requiredLevel) {
        (req as any).userTier = userTier;
        (req as any).userId = userId;
        return next();
      }

      const currentTierName = TIER_NAMES[userTier];
      const requiredTierName = TIER_NAMES[minTier];
      const requiredPricing = TIER_PRICING[minTier];

      console.log(`[Tier Enforcement] Access denied: User ${userId} has ${userTier} tier, requires ${minTier}`);

      return res.status(403).json({
        error: "Upgrade required",
        message: `This feature requires ${requiredTierName} tier or higher. You currently have ${currentTierName} tier.`,
        code: "TIER_INSUFFICIENT",
        currentTier: userTier,
        requiredTier: minTier,
        upgradeMessage: `Upgrade to ${requiredTierName} (${requiredPricing}) to unlock this feature.`,
        upgradeUrl: `/pricing?feature=${encodeURIComponent(req.path)}&required=${minTier}`,
      });
    } catch (error) {
      console.error("[Tier Enforcement] Middleware error:", error);
      return res.status(500).json({
        error: "Server error",
        message: "Failed to verify subscription tier",
        code: "TIER_CHECK_FAILED",
      });
    }
  };
}

/**
 * Middleware that allows free access but attaches tier info to request.
 * Useful for routes where tier affects features but doesn't block access.
 */
export function attachTierInfo(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = await getUserIdFromRequest(req);
      
      if (userId) {
        const userTier = await getUserTier(userId);
        (req as any).userTier = userTier;
        (req as any).userId = userId;
      } else {
        (req as any).userTier = "free";
        (req as any).userId = null;
      }
      
      return next();
    } catch (error) {
      (req as any).userTier = "free";
      (req as any).userId = null;
      return next();
    }
  };
}

/**
 * Check if user has minimum tier access (non-middleware helper)
 */
export async function checkTierAccess(
  userId: string | null,
  minTier: SubscriptionTier
): Promise<{ hasAccess: boolean; userTier: SubscriptionTier; message?: string }> {
  if (!userId) {
    return {
      hasAccess: minTier === "free",
      userTier: "free",
      message: minTier === "free" ? undefined : "Authentication required",
    };
  }

  const userTier = await getUserTier(userId);
  const userLevel = getTierLevel(userTier);
  const requiredLevel = getTierLevel(minTier);

  if (userLevel >= requiredLevel) {
    return { hasAccess: true, userTier };
  }

  return {
    hasAccess: false,
    userTier,
    message: `Requires ${TIER_NAMES[minTier]} tier or higher`,
  };
}

export { TIER_LEVELS, TIER_NAMES, TIER_PRICING };
