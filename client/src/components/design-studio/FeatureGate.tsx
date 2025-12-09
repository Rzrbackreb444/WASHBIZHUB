import { useEffect, useRef, useState } from "react";
import { useSubscription, type SubscriptionTier } from "@/hooks/useSubscription";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, Zap, Crown, Building2, Sparkles, ArrowRight, Check, 
  Loader2, Palette, DollarSign, MapPin, Users, Save, RefreshCw,
  TrendingUp, FileText
} from "lucide-react";
import { PLATFORM_TIERS, type PlatformTier } from "@/lib/tier-config";
import { UpgradeModal } from "@/components/monetization/UpgradeModal";
import { trackEvent } from "@/lib/user-journey";

export type DesignStudioFeature = 
  | "view-catalog"
  | "equipment-design"
  | "save-designs"
  | "static-revenue"
  | "live-location-sync"
  | "realtime-revenue"
  | "valuation-estimates"
  | "revenue-multipliers"
  | "multi-location"
  | "team-sharing"
  | "saved-templates";

const DESIGN_STUDIO_FEATURE_TIERS: Record<DesignStudioFeature, PlatformTier> = {
  "view-catalog": "free",
  "equipment-design": "starter",
  "save-designs": "starter",
  "static-revenue": "starter",
  "live-location-sync": "pro",
  "realtime-revenue": "pro",
  "valuation-estimates": "pro",
  "revenue-multipliers": "pro",
  "multi-location": "enterprise",
  "team-sharing": "enterprise",
  "saved-templates": "enterprise",
};

const TIER_LEVELS: Record<PlatformTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

const TIER_ICONS = {
  free: Lock,
  starter: Zap,
  pro: Crown,
  enterprise: Building2,
};

const FEATURE_METADATA: Record<DesignStudioFeature, { title: string; description: string; icon: typeof Palette }> = {
  "view-catalog": {
    title: "Equipment Catalog",
    description: "Browse our complete equipment catalog with specifications.",
    icon: Palette,
  },
  "equipment-design": {
    title: "Full Equipment Design",
    description: "Design your complete laundromat layout with drag-and-drop equipment placement.",
    icon: Palette,
  },
  "save-designs": {
    title: "Save Designs",
    description: "Save your laundromat designs to revisit and refine later.",
    icon: Save,
  },
  "static-revenue": {
    title: "Revenue Projections",
    description: "Get static revenue projections based on your equipment mix.",
    icon: DollarSign,
  },
  "live-location-sync": {
    title: "Live Location Sync",
    description: "Sync your design with real location data from CLEANBI analysis.",
    icon: MapPin,
  },
  "realtime-revenue": {
    title: "Real-Time Revenue",
    description: "See revenue adjustments update in real-time as you modify your design.",
    icon: RefreshCw,
  },
  "valuation-estimates": {
    title: "Valuation Estimates",
    description: "Get business valuation estimates based on your projected revenue.",
    icon: TrendingUp,
  },
  "revenue-multipliers": {
    title: "Revenue Multipliers",
    description: "Apply location-based multipliers for accurate revenue projections.",
    icon: DollarSign,
  },
  "multi-location": {
    title: "Multi-Location Portfolios",
    description: "Manage designs for multiple locations in a single portfolio.",
    icon: Building2,
  },
  "team-sharing": {
    title: "Team Sharing",
    description: "Share designs with your team members and collaborators.",
    icon: Users,
  },
  "saved-templates": {
    title: "Saved Templates",
    description: "Create and use design templates across multiple projects.",
    icon: FileText,
  },
};

const TIER_BENEFITS: Record<PlatformTier, string[]> = {
  free: ["Browse equipment catalog", "View specifications"],
  starter: [
    "Full equipment design tools",
    "Static revenue projections",
    "Save your designs",
    "Equipment specifications",
  ],
  pro: [
    "Everything in Starter",
    "Live location integration",
    "Real-time revenue adjustments",
    "Valuation estimates",
    "Revenue multipliers",
  ],
  enterprise: [
    "Everything in Pro",
    "Multi-location portfolios",
    "Team sharing & collaboration",
    "Saved design templates",
    "Priority support",
  ],
};

export function hasFeatureAccess(userTier: PlatformTier, requiredTier: PlatformTier): boolean {
  const userLevel = TIER_LEVELS[userTier] ?? 0;
  const requiredLevel = TIER_LEVELS[requiredTier] ?? 0;
  return userLevel >= requiredLevel;
}

export function getRequiredTierForFeature(featureName: DesignStudioFeature): PlatformTier {
  return DESIGN_STUDIO_FEATURE_TIERS[featureName] ?? "free";
}

interface DesignStudioFeatureGateProps {
  requiredTier?: PlatformTier;
  feature?: DesignStudioFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  blurContent?: boolean;
  variant?: "card" | "inline" | "subtle";
  title?: string;
  description?: string;
}

export function DesignStudioFeatureGate({
  requiredTier,
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  blurContent = false,
  variant = "card",
  title,
  description,
}: DesignStudioFeatureGateProps) {
  const { tier: currentTier, isLoading } = useSubscription();
  const hasTrackedRef = useRef(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const effectiveTier = requiredTier ?? (feature ? getRequiredTierForFeature(feature) : "free");
  const userHasAccess = hasFeatureAccess(currentTier as PlatformTier, effectiveTier);

  const featureMeta = feature ? FEATURE_METADATA[feature] : null;
  const displayTitle = title ?? featureMeta?.title ?? "Premium Feature";
  const displayDescription = description ?? featureMeta?.description ?? "Upgrade to access this feature.";
  const FeatureIcon = featureMeta?.icon ?? Lock;

  useEffect(() => {
    if (!isLoading && !userHasAccess && !hasTrackedRef.current) {
      trackEvent("design_studio_feature_gate_shown", "engagement", undefined, {
        feature,
        requiredTier: effectiveTier,
        currentTier,
      });
      hasTrackedRef.current = true;
    }
  }, [isLoading, userHasAccess, feature, effectiveTier, currentTier]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userHasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const tierConfig = PLATFORM_TIERS[effectiveTier];
  const TierIcon = TIER_ICONS[effectiveTier] ?? Lock;
  const benefits = TIER_BENEFITS[effectiveTier] ?? [];

  if (variant === "subtle") {
    return (
      <>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => setUpgradeModalOpen(true)}
          data-testid={`design-studio-gate-subtle-${feature ?? effectiveTier}`}
        >
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{displayTitle}</span>
          <Badge variant="outline" className="ml-auto text-xs border-[#C8A661]/40 text-[#C8A661]">
            <TierIcon className="h-3 w-3 mr-1" />
            {tierConfig?.name}
          </Badge>
        </div>
        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          suggestedTier={effectiveTier}
          feature={feature ?? `design-studio-${effectiveTier}`}
          title={`Unlock ${displayTitle}`}
          description={displayDescription}
        />
      </>
    );
  }

  if (variant === "inline") {
    return (
      <>
        <div
          className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#C8A661]/10 to-[#C8A661]/5 border border-[#C8A661]/20 cursor-pointer hover:border-[#C8A661]/40 transition-colors"
          onClick={() => setUpgradeModalOpen(true)}
          data-testid={`design-studio-gate-inline-${feature ?? effectiveTier}`}
        >
          <div className="p-1.5 rounded-md bg-[#0A1628]">
            <FeatureIcon className="h-4 w-4 text-[#C8A661]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{displayTitle}</p>
            <p className="text-xs text-muted-foreground">Requires {tierConfig?.name} plan</p>
          </div>
          <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] h-8">
            <Zap className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </div>
        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          suggestedTier={effectiveTier}
          feature={feature ?? `design-studio-${effectiveTier}`}
          title={`Unlock ${displayTitle}`}
          description={displayDescription}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        {blurContent && (
          <div className="absolute inset-0 z-10">
            <div className="blur-sm opacity-40 pointer-events-none">{children}</div>
          </div>
        )}

        <Card
          className={`${blurContent ? "relative z-20" : ""} border-[#C8A661]/30 bg-gradient-to-br from-card to-[#C8A661]/5 shadow-sm overflow-hidden`}
        >
          <div className="h-1 bg-[#C8A661]" />
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 rounded-lg bg-[#0A1628] w-fit">
              <Lock className="h-6 w-6 text-[#C8A661]" />
            </div>

            <Badge className="mx-auto mb-2 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30">
              <TierIcon className="h-3 w-3 mr-1" />
              {tierConfig?.name} Feature
            </Badge>

            <CardTitle className="text-xl text-foreground">{displayTitle}</CardTitle>
            <CardDescription className="text-muted-foreground">{displayDescription}</CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            {benefits.length > 0 && (
              <ul className="text-left space-y-2 max-w-sm mx-auto">
                {benefits.slice(0, 4).map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-[#C8A661] flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-2 space-y-2">
              <Button
                className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold group"
                data-testid={`button-upgrade-design-studio-${feature ?? effectiveTier}`}
                onClick={() => {
                  trackEvent("design_studio_upgrade_click", "conversion", undefined, {
                    feature,
                    from: currentTier,
                  });
                  setUpgradeModalOpen(true);
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to {tierConfig?.name}
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>

              {tierConfig && tierConfig.price > 0 && (
                <p className="text-xs text-muted-foreground">
                  Starting at ${tierConfig.price}/month
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        suggestedTier={effectiveTier}
        feature={feature ?? `design-studio-${effectiveTier}`}
        title={`Unlock ${displayTitle}`}
        description={displayDescription}
      />
    </>
  );
}

export function DesignStudioUpgradeBanner({
  feature,
  compact = false,
  className = "",
}: {
  feature?: DesignStudioFeature;
  compact?: boolean;
  className?: string;
}) {
  const { tier: currentTier, isLoading } = useSubscription();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const effectiveTier = feature ? getRequiredTierForFeature(feature) : "starter";
  const userHasAccess = hasFeatureAccess(currentTier as PlatformTier, effectiveTier);

  if (isLoading || userHasAccess) {
    return null;
  }

  const tierConfig = PLATFORM_TIERS[effectiveTier];
  const featureMeta = feature ? FEATURE_METADATA[feature] : null;

  if (compact) {
    return (
      <>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C8A661]/10 text-[#C8A661] text-sm font-medium cursor-pointer hover:bg-[#C8A661]/20 transition-colors ${className}`}
          onClick={() => setUpgradeModalOpen(true)}
          data-testid={`design-studio-banner-compact-${feature ?? effectiveTier}`}
        >
          <Lock className="h-3 w-3" />
          Upgrade to unlock
        </div>
        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          suggestedTier={effectiveTier}
          feature={feature ?? `design-studio-${effectiveTier}`}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#C8A661]/10 to-[#0A1628]/5 border border-[#C8A661]/20 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#0A1628]">
            <Lock className="h-4 w-4 text-[#C8A661]" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {featureMeta?.title ?? "Premium Feature"}
            </p>
            <p className="text-xs text-muted-foreground">
              Available in {tierConfig?.name} and above
            </p>
          </div>
        </div>

        <Button
          size="sm"
          className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
          onClick={() => setUpgradeModalOpen(true)}
          data-testid={`button-design-studio-banner-upgrade-${feature ?? effectiveTier}`}
        >
          <Zap className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      </div>
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        suggestedTier={effectiveTier}
        feature={feature ?? `design-studio-${effectiveTier}`}
      />
    </>
  );
}

export function useDesignStudioAccess() {
  const { tier: currentTier, isLoading } = useSubscription();

  const checkFeatureAccess = (feature: DesignStudioFeature): boolean => {
    const requiredTier = getRequiredTierForFeature(feature);
    return hasFeatureAccess(currentTier as PlatformTier, requiredTier);
  };

  const getAccessibleFeatures = (): DesignStudioFeature[] => {
    return Object.keys(DESIGN_STUDIO_FEATURE_TIERS).filter((feature) =>
      checkFeatureAccess(feature as DesignStudioFeature)
    ) as DesignStudioFeature[];
  };

  const getLockedFeatures = (): DesignStudioFeature[] => {
    return Object.keys(DESIGN_STUDIO_FEATURE_TIERS).filter(
      (feature) => !checkFeatureAccess(feature as DesignStudioFeature)
    ) as DesignStudioFeature[];
  };

  return {
    tier: currentTier as PlatformTier,
    isLoading,
    checkFeatureAccess,
    getAccessibleFeatures,
    getLockedFeatures,
    canViewCatalog: checkFeatureAccess("view-catalog"),
    canDesignEquipment: checkFeatureAccess("equipment-design"),
    canSaveDesigns: checkFeatureAccess("save-designs"),
    canViewRevenue: checkFeatureAccess("static-revenue"),
    canSyncLocation: checkFeatureAccess("live-location-sync"),
    canViewRealtimeRevenue: checkFeatureAccess("realtime-revenue"),
    canViewValuation: checkFeatureAccess("valuation-estimates"),
    canUseMultipliers: checkFeatureAccess("revenue-multipliers"),
    canManageMultiLocation: checkFeatureAccess("multi-location"),
    canShareWithTeam: checkFeatureAccess("team-sharing"),
    canUseTemplates: checkFeatureAccess("saved-templates"),
  };
}
