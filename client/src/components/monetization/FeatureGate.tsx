import { useEffect, useRef } from "react";
import { useSubscription, type SubscriptionTier } from "@/hooks/useSubscription";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap, Crown, Building2, Sparkles, ArrowRight, Check, Loader2 } from "lucide-react";
import { PLATFORM_TIERS } from "@/lib/tier-config";
import { trackEvent } from "@/lib/user-journey";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  blurContent?: boolean;
  title?: string;
  description?: string;
}

const TIER_ICONS = {
  free: Lock,
  starter: Zap,
  pro: Crown,
  enterprise: Building2,
};

const TIER_BENEFITS: Record<SubscriptionTier, string[]> = {
  free: [],
  starter: [
    "Unlimited CLEANBI analyses",
    "Full category breakdowns",
    "AI-powered recommendations",
    "PDF report exports"
  ],
  pro: [
    "Everything in Starter",
    "ROI & Valuation calculators",
    "Monte Carlo simulations",
    "API access (500 calls/mo)"
  ],
  enterprise: [
    "Everything in Pro",
    "Ownership & lien data",
    "Motivated seller detection",
    "Unlimited API access"
  ]
};

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  blurContent = false,
  title,
  description
}: FeatureGateProps) {
  const { hasFeatureAccess, tier: currentTier, isLoading } = useSubscription();
  const access = hasFeatureAccess(feature);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !access.hasAccess && !hasTrackedRef.current) {
      trackEvent("feature_gate_shown", "engagement", undefined, { 
        feature, 
        requiredTier: access.requiredTier,
        currentTier 
      });
      hasTrackedRef.current = true;
    }
  }, [isLoading, access.hasAccess, feature, access.requiredTier, currentTier]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (access.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const requiredTierConfig = PLATFORM_TIERS[access.requiredTier];
  const TierIcon = TIER_ICONS[access.requiredTier] || Lock;
  const benefits = TIER_BENEFITS[access.requiredTier] || [];

  const featureTitle = title || getFeatureTitle(feature);
  const featureDescription = description || getFeatureDescription(feature);

  return (
    <div className="relative">
      {blurContent && (
        <div className="absolute inset-0 z-10">
          <div className="blur-sm opacity-50 pointer-events-none">
            {children}
          </div>
        </div>
      )}
      
      <Card className={`${blurContent ? 'relative z-20' : ''} border-accent/30 bg-gradient-to-br from-card to-accent/5`}>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 rounded-full bg-accent/10 w-fit">
            <Lock className="h-6 w-6 text-accent" />
          </div>
          
          <Badge className="mx-auto mb-2 bg-accent/10 text-accent border-accent/30">
            <TierIcon className="h-3 w-3 mr-1" />
            {requiredTierConfig?.name || access.requiredTier} Feature
          </Badge>
          
          <CardTitle className="text-xl text-card-foreground">
            {featureTitle}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {featureDescription}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {benefits.length > 0 && (
            <ul className="text-left space-y-2 max-w-sm mx-auto">
              {benefits.slice(0, 4).map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          )}
          
          <div className="pt-2 space-y-2">
            <Link href="/pricing">
              <Button 
                className="w-full btn-premium-gold text-white font-semibold group"
                data-testid={`button-upgrade-${feature}`}
                onClick={() => trackEvent("upgrade_click", "conversion", undefined, { feature, from: currentTier })}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to {requiredTierConfig?.name || access.requiredTier}
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            {requiredTierConfig && requiredTierConfig.price > 0 && (
              <p className="text-xs text-muted-foreground">
                Starting at ${requiredTierConfig.price}/month • 7-day free trial
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getFeatureTitle(feature: string): string {
  const titles: Record<string, string> = {
    "cleanbi-full": "Unlock Full CLEANBI Analysis",
    "cleanbi-unlimited": "Unlimited CLEANBI Analyses",
    "calculators-all": "Access All Calculators",
    "calculators-export": "Export Calculator Results",
    "ai-council-basic": "AI Consulting Council",
    "ai-council-unlimited": "Unlimited AI Consultations",
    "revenue-forecaster": "Revenue Forecaster",
    "whatif-basic": "What-If Simulator",
    "due-diligence": "Due Diligence Toolkit",
    "pos-customers": "Customer Management",
    "pos-machines": "Machine Tracking",
    "pos-routes": "Route Optimization",
    "pos-analytics": "Advanced Analytics",
    "marketplace-inquire": "Send Buyer Inquiries",
    "funding-match": "Get Funding Matches",
    "business-plan-generator": "AI Business Plan Generator",
    "templates-premium": "Premium Templates Library",
  };
  return titles[feature] || "Premium Feature";
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    "cleanbi-full": "Get detailed breakdowns, AI recommendations, and export-ready reports for any location.",
    "cleanbi-unlimited": "Run unlimited location analyses without daily restrictions.",
    "calculators-all": "Access our complete suite of 80+ industry-specific calculators.",
    "calculators-export": "Export your calculations as professional PDF reports.",
    "ai-council-basic": "Get insights from our panel of AI experts modeled on industry veterans.",
    "ai-council-unlimited": "Unlimited conversations with our AI consulting council.",
    "revenue-forecaster": "Project revenue with seasonality adjustments and market factors.",
    "whatif-basic": "Simulate different scenarios to optimize your investment decisions.",
    "due-diligence": "Comprehensive checklists and verification tools for acquisitions.",
    "pos-customers": "Track customers, preferences, and lifetime value.",
    "pos-machines": "Monitor machine status, maintenance, and performance.",
    "pos-routes": "Optimize pickup and delivery routes for efficiency.",
    "pos-analytics": "Deep insights into operations, revenue, and trends.",
    "marketplace-inquire": "Contact sellers directly about listings.",
    "funding-match": "Get matched with lenders based on your profile.",
    "business-plan-generator": "Generate SBA-ready business plans with AI assistance.",
    "templates-premium": "Access professionally designed templates for every business need.",
  };
  return descriptions[feature] || "Upgrade to access this premium feature.";
}

export function UpgradeBanner({ 
  feature, 
  compact = false,
  className = ""
}: { 
  feature: string; 
  compact?: boolean;
  className?: string;
}) {
  const { hasFeatureAccess, isLoading } = useSubscription();
  const access = hasFeatureAccess(feature);

  if (isLoading || access.hasAccess) {
    return null;
  }

  const requiredTierConfig = PLATFORM_TIERS[access.requiredTier];

  if (compact) {
    return (
      <Link href="/pricing">
        <div 
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium cursor-pointer hover:bg-accent/20 transition-colors ${className}`}
          data-testid={`banner-upgrade-${feature}`}
        >
          <Lock className="h-3 w-3" />
          Upgrade to unlock
        </div>
      </Link>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/20 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-accent/20">
          <Lock className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="font-medium text-card-foreground text-sm">
            {getFeatureTitle(feature)}
          </p>
          <p className="text-xs text-muted-foreground">
            Available in {requiredTierConfig?.name || access.requiredTier} and above
          </p>
        </div>
      </div>
      
      <Link href="/pricing">
        <Button 
          size="sm" 
          className="btn-premium-gold text-white"
          data-testid={`button-banner-upgrade-${feature}`}
        >
          <Zap className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      </Link>
    </div>
  );
}

export function InlineUpgradePrompt({ 
  feature,
  message
}: { 
  feature: string;
  message?: string;
}) {
  const { hasFeatureAccess, isLoading } = useSubscription();
  const access = hasFeatureAccess(feature);

  if (isLoading || access.hasAccess) {
    return null;
  }

  return (
    <Link href="/pricing">
      <span 
        className="inline-flex items-center gap-1 text-accent hover:underline cursor-pointer text-sm"
        data-testid={`link-inline-upgrade-${feature}`}
      >
        <Lock className="h-3 w-3" />
        {message || `Upgrade to ${access.requiredTier}`}
      </span>
    </Link>
  );
}
