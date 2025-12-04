import { useSubscription, getTierDisplayName, type SubscriptionTier } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  blurContent?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  blurContent = false,
}: FeatureGateProps) {
  const { hasFeatureAccess, isLoading } = useSubscription();

  if (isLoading) {
    return <div className="animate-pulse bg-muted rounded-lg h-32" />;
  }

  const access = hasFeatureAccess(feature);

  if (access.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (blurContent) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none">{children}</div>
        <UpgradeOverlay requiredTier={access.requiredTier} feature={feature} />
      </div>
    );
  }

  if (showUpgradePrompt) {
    return <UpgradePrompt requiredTier={access.requiredTier} feature={feature} />;
  }

  return null;
}

interface UpgradePromptProps {
  requiredTier: SubscriptionTier;
  feature: string;
}

function UpgradePrompt({ requiredTier, feature }: UpgradePromptProps) {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">Premium Feature</CardTitle>
        <CardDescription>
          This feature requires the {getTierDisplayName(requiredTier)} plan or higher
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Link href={`/pricing?feature=${feature}`}>
          <Button data-testid="button-upgrade-feature">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade to {getTierDisplayName(requiredTier)}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function UpgradeOverlay({ requiredTier, feature }: UpgradePromptProps) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
      <div className="text-center p-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-1">Unlock This Feature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upgrade to {getTierDisplayName(requiredTier)} to access this feature
        </p>
        <Link href={`/pricing?feature=${feature}`}>
          <Button size="sm" data-testid="button-upgrade-overlay">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface TierBadgeProps {
  tier: SubscriptionTier;
  showLabel?: boolean;
}

export function TierBadge({ tier, showLabel = true }: TierBadgeProps) {
  const variants: Record<SubscriptionTier, "default" | "secondary" | "outline"> = {
    free: "outline",
    starter: "secondary",
    pro: "default",
    enterprise: "default",
  };

  return (
    <Badge variant={variants[tier]} className={tier === "enterprise" ? "bg-amber-500 hover:bg-amber-600" : ""}>
      {showLabel && getTierDisplayName(tier)}
    </Badge>
  );
}

interface RequiresTierProps {
  tier: SubscriptionTier;
  inline?: boolean;
}

export function RequiresTier({ tier, inline = false }: RequiresTierProps) {
  if (inline) {
    return (
      <span className="text-xs text-muted-foreground ml-1">
        ({getTierDisplayName(tier)}+)
      </span>
    );
  }

  return (
    <Badge variant="outline" className="text-xs font-normal">
      <Lock className="h-3 w-3 mr-1" />
      {getTierDisplayName(tier)}
    </Badge>
  );
}
