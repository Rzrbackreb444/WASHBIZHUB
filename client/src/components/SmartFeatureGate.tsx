import { type ReactNode } from 'react';
import { useSmartGating, type SmartGatingResult } from '@/hooks/useSmartGating';
import { type UsageInfo, type GatingTier } from '@/lib/feature-gating-config';

export interface SmartFeatureGateRenderProps {
  canAccess: boolean;
  isTeaser: boolean;
  isFree: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  currentTier: GatingTier;
  usageInfo: UsageInfo;
  showUpgradePrompt: boolean;
  blurResults: boolean;
  showPartialResults: boolean;
  incrementUsage: () => void;
  setShowUpgradePrompt: (show: boolean) => void;
  requiresAuth: boolean;
}

interface SmartFeatureGateProps {
  feature: string;
  onUpgradeClick?: () => void;
  children: (props: SmartFeatureGateRenderProps) => ReactNode;
}

export function SmartFeatureGate({
  feature,
  onUpgradeClick,
  children,
}: SmartFeatureGateProps) {
  const gating = useSmartGating(feature);

  const renderProps: SmartFeatureGateRenderProps = {
    canAccess: gating.canAccess,
    isTeaser: gating.isTeaser,
    isFree: gating.isFree,
    isPro: gating.isPro,
    isEnterprise: gating.isEnterprise,
    currentTier: gating.currentTier,
    usageInfo: gating.usageInfo,
    showUpgradePrompt: gating.showUpgradePrompt,
    blurResults: gating.blurResults,
    showPartialResults: gating.showPartialResults,
    incrementUsage: gating.incrementUsage,
    setShowUpgradePrompt: gating.setShowUpgradePrompt,
    requiresAuth: gating.requiresAuth,
  };

  return <>{children(renderProps)}</>;
}

export { useSmartGating } from '@/hooks/useSmartGating';
export type { UsageInfo, GatingTier } from '@/lib/feature-gating-config';
