import { useAuth } from "./useAuth";

export type SubscriptionTier = "free" | "accelerate" | "scale" | "summit";
export type CLEANBITier = "basic" | "pro" | "enterprise";

interface FeatureAccess {
  hasAccess: boolean;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  upgradeUrl: string;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  accelerate: 1,
  scale: 2,
  summit: 3,
};

const FEATURE_TIERS: Record<string, SubscriptionTier> = {
  "pos-basic": "free",
  "pos-orders": "free",
  "pos-customers": "accelerate",
  "pos-machines": "accelerate",
  "pos-routes": "scale",
  "pos-analytics": "scale",
  "pos-inventory": "scale",
  "cleanbi-basic": "free",
  "cleanbi-advanced": "accelerate",
  "cleanbi-api": "summit",
  "ai-consultant": "scale",
  "ai-blog-generator": "summit",
  "website-builder": "scale",
  "multi-location": "scale",
  "priority-support": "accelerate",
  "white-label": "summit",
};

export function useSubscription() {
  const { user, isLoading } = useAuth();

  const currentTier = (user?.subscriptionTier as SubscriptionTier) || "free";
  const isPro = user?.isPro || false;

  function hasFeatureAccess(featureKey: string): FeatureAccess {
    const requiredTier = FEATURE_TIERS[featureKey] || "free";
    const currentLevel = TIER_LEVELS[currentTier];
    const requiredLevel = TIER_LEVELS[requiredTier];

    return {
      hasAccess: currentLevel >= requiredLevel,
      requiredTier,
      currentTier,
      upgradeUrl: `/pricing?feature=${featureKey}`,
    };
  }

  function canAccessTier(tier: SubscriptionTier): boolean {
    const currentLevel = TIER_LEVELS[currentTier];
    const requiredLevel = TIER_LEVELS[tier];
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
    isAccelerateTier: currentTier === "accelerate",
    isScaleTier: currentTier === "scale",
    isSummitTier: currentTier === "summit",
    tierLevel: TIER_LEVELS[currentTier],
  };
}

export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    free: "Free",
    accelerate: "Accelerate",
    scale: "Scale",
    summit: "Summit",
  };
  return names[tier] || "Free";
}

export function getTierColor(tier: SubscriptionTier): string {
  const colors: Record<SubscriptionTier, string> = {
    free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    accelerate: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
    scale: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    summit: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  };
  return colors[tier] || colors.free;
}
