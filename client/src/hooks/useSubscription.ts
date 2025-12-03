import { useAuth } from "./useAuth";

export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";
export type CLEANBITier = "free" | "starter" | "pro" | "enterprise";

interface FeatureAccess {
  hasAccess: boolean;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  upgradeUrl: string;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

// Map old tier names to new for backwards compatibility
const TIER_MIGRATION: Record<string, SubscriptionTier> = {
  accelerate: "starter",
  scale: "pro",
  summit: "enterprise",
};

const FEATURE_TIERS: Record<string, SubscriptionTier> = {
  // POS Features
  "pos-basic": "free",
  "pos-orders": "free",
  "pos-customers": "starter",
  "pos-machines": "starter",
  "pos-routes": "pro",
  "pos-analytics": "pro",
  "pos-inventory": "pro",
  
  // CLEANBI Features
  "cleanbi-preview": "free",
  "cleanbi-full": "starter",
  "cleanbi-unlimited": "pro",
  "cleanbi-api": "enterprise",
  "cleanbi-bulk": "enterprise",
  
  // Equipment Mix Optimizer
  "equipment-optimizer-preview": "free",
  "equipment-optimizer-basic": "starter",
  "equipment-optimizer-full": "pro",
  "equipment-optimizer-portfolio": "enterprise",
  
  // Competitor Analysis
  "competitor-preview": "free",
  "competitor-full": "starter",
  "competitor-unlimited": "pro",
  
  // Calculators
  "calculators-basic": "free",
  "calculators-all": "starter",
  "calculators-advanced": "pro",
  "calculators-export": "pro",
  "calculators-white-label": "enterprise",
  
  // Business Plan Generator
  "business-plan-generator": "starter",
  
  // Templates & Downloads
  "templates-premium": "starter",
  
  // Bulk Analysis
  "bulk-analysis": "enterprise",
  
  // AI Consultation Council
  "ai-council-trial": "free",
  "ai-council-basic": "starter",
  "ai-council-unlimited": "pro",
  "ai-council-priority": "enterprise",
  
  // Revenue Forecaster
  "revenue-forecaster": "starter",
  "revenue-forecaster-seasonality": "pro",
  "revenue-forecaster-multi": "enterprise",
  
  // What-If Simulator
  "whatif-basic": "starter",
  "whatif-unlimited": "pro",
  "whatif-portfolio": "enterprise",
  
  // Due Diligence
  "due-diligence": "pro",
  "due-diligence-bulk": "enterprise",
  
  // Marketplace Listings
  "marketplace-browse": "free",
  "marketplace-list": "free",
  "marketplace-inquire": "starter",
  "marketplace-featured": "pro",
  "marketplace-broker": "enterprise",
  
  // Funding Matcher
  "funding-view": "free",
  "funding-match": "starter",
  "funding-priority": "pro",
  "funding-direct": "enterprise",
  
  // Legacy features
  "ai-consultant": "pro",
  "ai-blog-generator": "enterprise",
  "website-builder": "pro",
  "multi-location": "pro",
  "priority-support": "starter",
  "white-label": "enterprise",
};

export function useSubscription() {
  const { user, isLoading } = useAuth();

  // Migrate old tier names to new ones
  let rawTier = (user?.subscriptionTier as string) || "free";
  const currentTier = (TIER_MIGRATION[rawTier] || rawTier) as SubscriptionTier;
  const isPro = user?.isPro || currentTier === "pro" || currentTier === "enterprise";

  function hasFeatureAccess(featureKey: string): FeatureAccess {
    const requiredTier = FEATURE_TIERS[featureKey] || "free";
    const currentLevel = TIER_LEVELS[currentTier] || 0;
    const requiredLevel = TIER_LEVELS[requiredTier] || 0;

    return {
      hasAccess: currentLevel >= requiredLevel,
      requiredTier,
      currentTier,
      upgradeUrl: `/subscribe?feature=${featureKey}`,
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
    isLoading,
    hasFeatureAccess,
    canAccessTier,
    getFeatureTier,
    isFreeTier: currentTier === "free",
    isStarterTier: currentTier === "starter",
    isProTier: currentTier === "pro",
    isEnterpriseTier: currentTier === "enterprise",
    tierLevel: TIER_LEVELS[currentTier] || 0,
  };
}

export function getTierDisplayName(tier: SubscriptionTier | string): string {
  const names: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    // Legacy names
    accelerate: "Starter",
    scale: "Pro",
    summit: "Enterprise",
  };
  return names[tier] || "Free";
}

export function getTierPrice(tier: SubscriptionTier | string): number {
  const prices: Record<string, number> = {
    free: 0,
    starter: 29,
    pro: 99,
    enterprise: 699,
  };
  return prices[tier] || 0;
}

export function getTierColor(tier: SubscriptionTier | string): string {
  const colors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    starter: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    pro: "bg-[#b8860b]/10 text-[#b8860b] dark:bg-[#b8860b]/20 dark:text-[#d4a030]",
    enterprise: "bg-[#1e3a5f]/10 text-[#1e3a5f] dark:bg-[#1e3a5f]/20 dark:text-blue-200",
    // Legacy
    accelerate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    scale: "bg-[#b8860b]/10 text-[#b8860b] dark:bg-[#b8860b]/20 dark:text-[#d4a030]",
    summit: "bg-[#1e3a5f]/10 text-[#1e3a5f] dark:bg-[#1e3a5f]/20 dark:text-blue-200",
  };
  return colors[tier] || colors.free;
}
