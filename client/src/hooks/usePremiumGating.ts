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
  all_access: "All-Access",
};

export function usePremiumGating(): PremiumGatingResult {
  const { 
    tier, 
    isPro, 
    isAllAccess, 
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
    return isPro || isAllAccess;
  }, [isPro, isAllAccess]);

  const tierDisplayName = useMemo(() => {
    return TIER_DISPLAY_NAMES[tier] || "Free";
  }, [tier]);

  const canAccessFeature = useCallback((featureName: string): boolean => {
    // Premium users (all_access) have access to ALL features
    // This ensures new calculators/AI tools work without needing explicit whitelisting
    if (isAllAccess || isPro) {
      return true;
    }
    // Free users go through normal feature gating
    return canAccess(featureName);
  }, [canAccess, isAllAccess, isPro]);

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
