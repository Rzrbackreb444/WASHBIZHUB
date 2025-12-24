import { db } from "./db";
import { users, templatePurchases, courseEnrollments } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export type FeatureTier = "free" | "pro" | "enterprise" | "owner";

export interface UserEntitlements {
  tier: FeatureTier;
  isOwner: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  
  features: {
    mediaStudio: boolean;
    backgroundRemoval: boolean;
    aiEditing: boolean;
    logoGeneration: boolean;
    bookStudio: boolean;
    contentEditor: boolean;
    realTimeCollab: boolean;
    consultations: boolean;
    unlimitedAiMessages: boolean;
  };
  
  limits: {
    aiMessagesPerMonth: number;
    aiMessagesUsed: number;
    backgroundRemovalsPerMonth: number;
    backgroundRemovalsUsed: number;
  };
  
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
}

const OWNER_EMAILS = (process.env.OWNER_EMAILS || "thelaundromatfb@gmail.com,rzrbackreb444@gmail.com,nick@washbizhub.com,larry@washbizhub.com").split(",").map(e => e.trim().toLowerCase());

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase());
}

export async function getUserEntitlements(userId: string | null, email?: string | null): Promise<UserEntitlements> {
  const defaultEntitlements: UserEntitlements = {
    tier: "free",
    isOwner: false,
    isPro: false,
    isEnterprise: false,
    features: {
      mediaStudio: false,
      backgroundRemoval: false,
      aiEditing: false,
      logoGeneration: false,
      bookStudio: false,
      contentEditor: false,
      realTimeCollab: false,
      consultations: false,
      unlimitedAiMessages: false,
    },
    limits: {
      aiMessagesPerMonth: 10,
      aiMessagesUsed: 0,
      backgroundRemovalsPerMonth: 0,
      backgroundRemovalsUsed: 0,
    },
    subscriptionStatus: null,
    stripeCustomerId: null,
  };

  if (isOwnerEmail(email)) {
    return {
      tier: "owner",
      isOwner: true,
      isPro: true,
      isEnterprise: true,
      features: {
        mediaStudio: true,
        backgroundRemoval: true,
        aiEditing: true,
        logoGeneration: true,
        bookStudio: true,
        contentEditor: true,
        realTimeCollab: true,
        consultations: true,
        unlimitedAiMessages: true,
      },
      limits: {
        aiMessagesPerMonth: 999999,
        aiMessagesUsed: 0,
        backgroundRemovalsPerMonth: 999999,
        backgroundRemovalsUsed: 0,
      },
      subscriptionStatus: "owner",
      stripeCustomerId: null,
    };
  }

  if (!userId) {
    return defaultEntitlements;
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) {
      return defaultEntitlements;
    }

    const subscriptionTier = user.subscriptionTier || "free";
    const isPro = user.isPro || subscriptionTier === "accelerate" || subscriptionTier === "scale";
    const isEnterprise = subscriptionTier === "summit" || subscriptionTier === "enterprise";
    
    let tier: FeatureTier = "free";
    if (isEnterprise) tier = "enterprise";
    else if (isPro) tier = "pro";

    const entitlements: UserEntitlements = {
      tier,
      isOwner: false,
      isPro,
      isEnterprise,
      features: {
        mediaStudio: isPro || isEnterprise,
        backgroundRemoval: isPro || isEnterprise,
        aiEditing: isPro || isEnterprise,
        logoGeneration: isEnterprise,
        bookStudio: isPro || isEnterprise,
        contentEditor: isPro || isEnterprise,
        realTimeCollab: isEnterprise,
        consultations: true,
        unlimitedAiMessages: isEnterprise,
      },
      limits: {
        aiMessagesPerMonth: isEnterprise ? 999999 : isPro ? 500 : 10,
        aiMessagesUsed: user.aiMessagesUsed || 0,
        backgroundRemovalsPerMonth: isEnterprise ? 500 : isPro ? 50 : 0,
        backgroundRemovalsUsed: 0,
      },
      subscriptionStatus: user.stripeSubscriptionId ? "active" : null,
      stripeCustomerId: user.stripeCustomerId || null,
    };

    return entitlements;
  } catch (error) {
    console.error("[Entitlements] Error fetching user entitlements:", error);
    return defaultEntitlements;
  }
}

export function createEntitlementMiddleware(requiredFeature: keyof UserEntitlements["features"]) {
  return async (req: any, res: any, next: any) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: "Authentication required",
        upgrade: true,
        feature: requiredFeature 
      });
    }

    const entitlements = await getUserEntitlements(user.id, user.email);
    
    if (!entitlements.features[requiredFeature]) {
      return res.status(403).json({ 
        error: "This feature requires a premium subscription",
        upgrade: true,
        feature: requiredFeature,
        currentTier: entitlements.tier,
        requiredTier: requiredFeature === "realTimeCollab" || requiredFeature === "logoGeneration" ? "enterprise" : "pro"
      });
    }

    req.entitlements = entitlements;
    next();
  };
}

export async function checkFeatureAccess(
  userId: string | null, 
  email: string | null, 
  feature: keyof UserEntitlements["features"]
): Promise<{ allowed: boolean; reason?: string; entitlements: UserEntitlements }> {
  const entitlements = await getUserEntitlements(userId, email);
  
  if (entitlements.features[feature]) {
    return { allowed: true, entitlements };
  }
  
  return { 
    allowed: false, 
    reason: `This feature requires ${feature === "realTimeCollab" || feature === "logoGeneration" ? "Enterprise" : "Pro"} subscription`,
    entitlements 
  };
}

export async function incrementUsage(userId: string, usageType: "ai_message" | "background_removal"): Promise<boolean> {
  try {
    if (usageType === "ai_message") {
      await db.update(users)
        .set({ aiMessagesUsed: (await db.select({ count: users.aiMessagesUsed }).from(users).where(eq(users.id, userId)))[0]?.count || 0 + 1 })
        .where(eq(users.id, userId));
    }
    return true;
  } catch (error) {
    console.error("[Entitlements] Error incrementing usage:", error);
    return false;
  }
}
