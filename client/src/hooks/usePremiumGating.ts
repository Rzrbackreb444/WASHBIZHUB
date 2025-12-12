import { useMemo, useCallback, useState } from "react";
import { useSubscription, type SubscriptionTier } from "./useSubscription";
import { useAuth } from "./useAuth";

export interface PremiumGatingResult {
  isPremium: boolean;
  isAllAccess: boolean;
  tier: SubscriptionTier;
  tierDisplayName: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  canAccessFeature: (featureName: string) => boolean;
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  isUpgradeModalOpen: boolean;
  upgradeModalFeature: string | null;
  openUpgradeModalFor: (featureName: string) => void;
  trialInfo: {
    isTrial: boolean;
    daysRemaining: number;
    endsAt: Date | null;
  };
}

const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

export function usePremiumGating(): PremiumGatingResult {
  const { 
    tier, 
    isPro, 
    isBusiness,
    isEnterprise,
    isLoading, 
    canAccess,
    isTrial,
    trialDaysRemaining,
    trialEndsAt
  } = useSubscription();
  
  const { isAuthenticated } = useAuth();
  
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | null>(null);

  const isPremium = useMemo(() => {
    return isPro || isBusiness || isEnterprise;
  }, [isPro, isBusiness, isEnterprise]);
  
  // isAllAccess now means Enterprise (backwards compatibility)
  const isAllAccess = isEnterprise;

  const tierDisplayName = useMemo(() => {
    return TIER_DISPLAY_NAMES[tier] || "Free";
  }, [tier]);

  const canAccessFeature = useCallback((featureName: string): boolean => {
    // All tiers defer to canAccess which properly checks tier hierarchy
    // Enterprise gets everything, Business gets business+ features, Pro gets pro+ features
    // This ensures enterprise-only features (API, white-label) remain locked for lower tiers
    return canAccess(featureName);
  }, [canAccess]);

  const showUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true);
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalFeature(null);
  }, []);

  const openUpgradeModalFor = useCallback((featureName: string) => {
    setUpgradeModalFeature(featureName);
    setIsUpgradeModalOpen(true);
  }, []);

  const trialInfo = useMemo(() => ({
    isTrial,
    daysRemaining: trialDaysRemaining,
    endsAt: trialEndsAt,
  }), [isTrial, trialDaysRemaining, trialEndsAt]);

  return useMemo(() => ({
    isPremium,
    isAllAccess,
    tier,
    tierDisplayName,
    isLoading,
    isAuthenticated,
    canAccessFeature,
    showUpgradeModal,
    hideUpgradeModal,
    isUpgradeModalOpen,
    upgradeModalFeature,
    openUpgradeModalFor,
    trialInfo,
  }), [
    isPremium, 
    isAllAccess, 
    tier, 
    tierDisplayName, 
    isLoading, 
    isAuthenticated,
    canAccessFeature, 
    showUpgradeModal, 
    hideUpgradeModal, 
    isUpgradeModalOpen,
    upgradeModalFeature,
    openUpgradeModalFor,
    trialInfo
  ]);
}

export function usePremiumFeatureCheck(featureName: string) {
  const { canAccessFeature, isPremium, isLoading, openUpgradeModalFor } = usePremiumGating();
  
  const hasAccess = useMemo(() => {
    return canAccessFeature(featureName);
  }, [canAccessFeature, featureName]);

  const requireUpgrade = useCallback(() => {
    if (!hasAccess) {
      openUpgradeModalFor(featureName);
    }
  }, [hasAccess, openUpgradeModalFor, featureName]);

  return useMemo(() => ({
    hasAccess,
    isPremium,
    isLoading,
    requireUpgrade,
  }), [hasAccess, isPremium, isLoading, requireUpgrade]);
}
