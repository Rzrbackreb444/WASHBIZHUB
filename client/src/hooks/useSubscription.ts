import { useAuth } from "./useAuth";

export type SubscriptionTier = "free" | "pro" | "business" | "enterprise";
export type CLEANBITier = "free" | "pro" | "business" | "enterprise";

interface FeatureAccess {
  hasAccess: boolean;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  upgradeUrl: string;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  business: 2,
  enterprise: 3,
};

const TIER_MIGRATION: Record<string, SubscriptionTier> = {
  accelerate: "business",
  scale: "business",
  summit: "enterprise",
  starter: "pro",
  all_access: "enterprise",
};

const FEATURE_TIERS: Record<string, SubscriptionTier> = {
  // ============================================
  // FREE TIER - Lead Generation & Discovery
  // ============================================
  "marketplace-browse": "free",
  "marketplace-list": "free",
  "funding-view": "free",
  "forum-read": "free",
  "blog-access": "free",
  "help-center": "free",
  "cleanbi-preview": "free",
  "calculators-basic": "free",
  "equipment-optimizer-preview": "free",
  "competitor-preview": "free",
  "ai-council-trial": "free",
  "pos-basic": "free",
  "pos-orders": "free",
  
  // ============================================
  // PRO TIER ($49/mo) - For Serious Buyers
  // ============================================
  "forum-post": "pro",
  "calculators-all": "pro",
  "cleanbi-full": "pro",
  "cleanbi-unlimited": "pro",
  "calculators-advanced": "pro",
  "calculators-export": "pro",
  "marketplace-inquire": "pro",
  "funding-match": "pro",
  "funding_gauge": "pro",
  "funding_chart": "pro",
  
  // ============================================
  // BUSINESS TIER ($149/mo) - For Operators
  // ============================================
  "book-access": "business",
  "courses-access": "business",
  "service-guy-ai": "business",
  "design-studio": "business",
  "business-plan-generator": "business",
  "ai-council-basic": "business",
  "ai-council-unlimited": "business",
  "due-diligence": "business",
  "website-builder": "business",
  "pos-customers": "business",
  "pos-machines": "business",
  "pos-routes": "business",
  "pos-analytics": "business",
  "pos-inventory": "business",
  "competitor-full": "business",
  "competitor-unlimited": "business",
  "equipment-optimizer-basic": "business",
  "equipment-optimizer-full": "business",
  "templates-premium": "business",
  "revenue-forecaster": "business",
  "whatif-basic": "business",
  "whatif-unlimited": "business",
  "bulk-analysis": "business",
  "priority-support": "business",
  
  // ============================================
  // ENTERPRISE TIER ($299/mo) - Multi-Unit & Brokers
  // ============================================
  "cleanbi-bulk": "enterprise",
  "cleanbi-api": "enterprise",
  "equipment-optimizer-portfolio": "enterprise",
  "ai-council-priority": "enterprise",
  "revenue-forecaster-seasonality": "enterprise",
  "revenue-forecaster-multi": "enterprise",
  "whatif-portfolio": "enterprise",
  "marketplace-featured": "enterprise",
  "marketplace-broker": "enterprise",
  "funding-priority": "enterprise",
  "funding-direct": "enterprise",
  "calculators-white-label": "enterprise",
  "due-diligence-bulk": "enterprise",
  "multi-location": "enterprise",
  "ai-consultant": "enterprise",
  "white-label": "enterprise",
  "ai-blog-generator": "enterprise",
};

export function useSubscription() {
  const { user, isLoading } = useAuth();

  let rawTier = (user?.subscriptionTier as string) || "free";
  const currentTier = (TIER_MIGRATION[rawTier] || rawTier) as SubscriptionTier;
  const isPro = user?.isPro || ["pro", "business", "enterprise"].includes(currentTier);
  const isAllAccess = ["business", "enterprise"].includes(currentTier);
  const isBusiness = ["business", "enterprise"].includes(currentTier);
  const isEnterprise = currentTier === "enterprise";

  // Trial is active if trialEndDate exists and is in the future
  const trialEndsAt = user?.trialEndDate ? new Date(user.trialEndDate) : null;
  const isTrial = trialEndsAt ? trialEndsAt.getTime() > Date.now() : false;
  const trialDaysRemaining = trialEndsAt && isTrial
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  function hasFeatureAccess(featureKey: string): FeatureAccess {
    const requiredTier = FEATURE_TIERS[featureKey] || "free";
    const currentLevel = TIER_LEVELS[currentTier] || 0;
    const requiredLevel = TIER_LEVELS[requiredTier] || 0;

    return {
      hasAccess: currentLevel >= requiredLevel,
      requiredTier,
      currentTier,
      upgradeUrl: `/pricing`,
    };
  }

  function canAccessTier(tier: SubscriptionTier): boolean {
    const currentLevel = TIER_LEVELS[currentTier] || 0;
    const requiredLevel = TIER_LEVELS[tier] || 0;
    return currentLevel >= requiredLevel;
  }

  function canAccess(feature: string): boolean {
    return hasFeatureAccess(feature).hasAccess;
  }

  function getFeatureTier(featureKey: string): SubscriptionTier {
    return FEATURE_TIERS[featureKey] || "free";
  }

  return {
    tier: currentTier,
    isPro,
    isAllAccess,
    isBusiness,
    isEnterprise,
    isTrial,
    trialDaysRemaining,
    trialEndsAt,
    isLoading,
    hasFeatureAccess,
    canAccessTier,
    canAccess,
    getFeatureTier,
    isFreeTier: currentTier === "free",
    isProTier: currentTier === "pro",
    isBusinessTier: ["business", "enterprise"].includes(currentTier),
    isEnterpriseTier: currentTier === "enterprise",
    tierLevel: TIER_LEVELS[currentTier] || 0,
  };
}

export function getTierDisplayName(tier: SubscriptionTier | string): string {
  const names: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    business: "Business",
    enterprise: "Enterprise",
    all_access: "Enterprise",
    starter: "Pro",
    accelerate: "Business",
    scale: "Business",
    summit: "Enterprise",
  };
  return names[tier] || "Free";
}

export function getTierPrice(tier: SubscriptionTier | string): number {
  const prices: Record<string, number> = {
    free: 0,
    pro: 49,
    business: 149,
    enterprise: 299,
    all_access: 299,
    starter: 49,
  };
  return prices[tier] || 0;
}

export function getTierColor(tier: SubscriptionTier | string): string {
  const colors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    pro: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    business: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    enterprise: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    all_access: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    starter: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    accelerate: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    scale: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    summit: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };
  return colors[tier] || colors.free;
}
