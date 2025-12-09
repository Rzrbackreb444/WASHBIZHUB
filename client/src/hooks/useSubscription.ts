import { useAuth } from "./useAuth";

export type SubscriptionTier = "free" | "all_access";
export type CLEANBITier = "free" | "all_access";

interface FeatureAccess {
  hasAccess: boolean;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  upgradeUrl: string;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  all_access: 1,
};

const TIER_MIGRATION: Record<string, SubscriptionTier> = {
  accelerate: "all_access",
  scale: "all_access",
  summit: "all_access",
  starter: "all_access",
  pro: "all_access",
  enterprise: "all_access",
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
  // ALL-ACCESS ($129/mo) - Everything Included
  // ============================================
  "book-access": "all_access",
  "courses-access": "all_access",
  "forum-post": "all_access",
  "calculators-all": "all_access",
  "cleanbi-full": "all_access",
  "cleanbi-unlimited": "all_access",
  "cleanbi-bulk": "all_access",
  "cleanbi-api": "all_access",
  "competitor-full": "all_access",
  "competitor-unlimited": "all_access",
  "equipment-optimizer-basic": "all_access",
  "equipment-optimizer-full": "all_access",
  "equipment-optimizer-portfolio": "all_access",
  "business-plan-generator": "all_access",
  "templates-premium": "all_access",
  "ai-council-basic": "all_access",
  "ai-council-unlimited": "all_access",
  "ai-council-priority": "all_access",
  "revenue-forecaster": "all_access",
  "revenue-forecaster-seasonality": "all_access",
  "revenue-forecaster-multi": "all_access",
  "whatif-basic": "all_access",
  "whatif-unlimited": "all_access",
  "whatif-portfolio": "all_access",
  "marketplace-inquire": "all_access",
  "marketplace-featured": "all_access",
  "marketplace-broker": "all_access",
  "funding-match": "all_access",
  "funding_gauge": "all_access",
  "funding_chart": "all_access",
  "funding-priority": "all_access",
  "funding-direct": "all_access",
  "pos-customers": "all_access",
  "pos-machines": "all_access",
  "pos-routes": "all_access",
  "pos-analytics": "all_access",
  "pos-inventory": "all_access",
  "priority-support": "all_access",
  "calculators-advanced": "all_access",
  "calculators-export": "all_access",
  "calculators-white-label": "all_access",
  "due-diligence": "all_access",
  "due-diligence-bulk": "all_access",
  "website-builder": "all_access",
  "multi-location": "all_access",
  "ai-consultant": "all_access",
  "bulk-analysis": "all_access",
  "white-label": "all_access",
  "ai-blog-generator": "all_access",
  "design-studio": "all_access",
  "service-guy-ai": "all_access",
};

export function useSubscription() {
  const { user, isLoading } = useAuth();

  let rawTier = (user?.subscriptionTier as string) || "free";
  const currentTier = (TIER_MIGRATION[rawTier] || rawTier) as SubscriptionTier;
  const isPro = user?.isPro || currentTier === "all_access";
  const isAllAccess = currentTier === "all_access";

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

  function getFeatureTier(featureKey: string): SubscriptionTier {
    return FEATURE_TIERS[featureKey] || "free";
  }

  return {
    tier: currentTier,
    isPro,
    isAllAccess,
    isLoading,
    hasFeatureAccess,
    canAccessTier,
    getFeatureTier,
    isFreeTier: currentTier === "free",
    isStarterTier: false,
    isProTier: isAllAccess,
    isEnterpriseTier: isAllAccess,
    tierLevel: TIER_LEVELS[currentTier] || 0,
  };
}

export function getTierDisplayName(tier: SubscriptionTier | string): string {
  const names: Record<string, string> = {
    free: "Free",
    all_access: "All-Access",
    starter: "All-Access",
    pro: "All-Access",
    enterprise: "All-Access",
    accelerate: "All-Access",
    scale: "All-Access",
    summit: "All-Access",
  };
  return names[tier] || "Free";
}

export function getTierPrice(tier: SubscriptionTier | string): number {
  const prices: Record<string, number> = {
    free: 0,
    all_access: 129,
    starter: 129,
    pro: 129,
    enterprise: 129,
  };
  return prices[tier] || 0;
}

export function getTierColor(tier: SubscriptionTier | string): string {
  const colors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    all_access: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    starter: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    pro: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    enterprise: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    accelerate: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    scale: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
    summit: "bg-[#C8A661]/10 text-[#C8A661] dark:bg-[#C8A661]/20 dark:text-[#d4a030]",
  };
  return colors[tier] || colors.free;
}
