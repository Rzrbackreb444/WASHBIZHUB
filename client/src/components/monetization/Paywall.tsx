import { useEffect, useRef, useState } from "react";
import { useSubscription, type SubscriptionTier } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, Zap, Crown, Building2, Sparkles, ArrowRight, Check, 
  Shield, Clock, Star, TrendingUp, Loader2
} from "lucide-react";
import { PLATFORM_TIERS, type PlatformTier } from "@/lib/tier-config";
import { trackEvent, trackConversion } from "@/lib/user-journey";

interface PaywallProps {
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
  title?: string;
  description?: string;
  benefits?: string[];
  showPreview?: boolean;
  previewLines?: number;
}

const TIER_ICONS = {
  free: Lock,
  starter: Zap,
  pro: Crown,
  enterprise: Building2,
};

export function Paywall({
  requiredTier,
  children,
  title,
  description,
  benefits,
  showPreview = false,
  previewLines = 3
}: PaywallProps) {
  const { canAccessTier, tier: currentTier, isLoading } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const hasTrackedRef = useRef(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const tierConfig = PLATFORM_TIERS[requiredTier];
  const TierIcon = TIER_ICONS[requiredTier] || Lock;

  const defaultBenefits = tierConfig?.features
    .filter(f => f.included && f.highlight)
    .map(f => f.text)
    .slice(0, 4) || [];

  const displayBenefits = benefits || defaultBenefits;

  useEffect(() => {
    if (!isLoading && !canAccessTier(requiredTier) && !hasTrackedRef.current) {
      trackEvent("paywall_shown", "engagement", undefined, { 
        requiredTier, 
        currentTier,
        title 
      });
      hasTrackedRef.current = true;
    }
  }, [isLoading, requiredTier, currentTier, title, canAccessTier]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    trackConversion("paywall_click", tierConfig?.price || 0, { tier: requiredTier });

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: requiredTier,
          interval: "month",
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (canAccessTier(requiredTier)) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {showPreview && (
        <div className="relative mb-4">
          <div 
            className="overflow-hidden"
            style={{ maxHeight: `${previewLines * 1.75}rem` }}
          >
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        </div>
      )}
      
      <Card className="border-accent/30 bg-gradient-to-br from-card via-card to-accent/5 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-accent/10 w-fit ring-4 ring-accent/5">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          
          <Badge className="mx-auto mb-3 bg-accent/10 text-accent border-accent/30 px-3 py-1">
            <TierIcon className="h-3.5 w-3.5 mr-1.5" />
            {tierConfig?.name || requiredTier} Required
          </Badge>
          
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {title || `Unlock with ${tierConfig?.name || requiredTier}`}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base max-w-md mx-auto">
            {description || tierConfig?.description || "Upgrade to access this premium content."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {displayBenefits.length > 0 && (
            <div className="bg-muted/30 dark:bg-white/5 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-sm font-medium text-card-foreground mb-3 text-center">
                What you'll get:
              </p>
              <ul className="space-y-2.5">
                {displayBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-card-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="text-center space-y-3">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-card-foreground">
                ${tierConfig?.price || 0}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            
            <Button 
              className="w-full max-w-sm btn-premium-gold text-white font-semibold h-12 group"
              data-testid={`button-paywall-upgrade-${requiredTier}`}
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparing Checkout...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started Now
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-accent" />
                30-day guarantee
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Cancel anytime
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i}
                  className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-card-foreground">73,000+</span> professionals trust WashBizHub
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HardPaywall({
  requiredTier,
  title,
  description,
  redirectTo = "/pricing"
}: {
  requiredTier: SubscriptionTier;
  title?: string;
  description?: string;
  redirectTo?: string;
}) {
  const { canAccessTier, isLoading } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    const tierConfig = PLATFORM_TIERS[requiredTier];
    trackConversion("hard_paywall_click", tierConfig?.price || 0, { tier: requiredTier });

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: requiredTier,
          interval: "month",
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (canAccessTier(requiredTier)) {
    return null;
  }

  const tierConfig = PLATFORM_TIERS[requiredTier];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-accent/30 bg-gradient-to-br from-card to-accent/5 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-accent/10 w-fit">
            <Lock className="h-10 w-10 text-accent" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {title || "Premium Content"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {description || `This feature requires a ${tierConfig?.name || requiredTier} subscription.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <Button 
            className="w-full btn-premium-gold text-white font-semibold h-12"
            data-testid="button-hard-paywall-upgrade"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Checkout...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                View Plans & Upgrade
              </>
            )}
          </Button>
          
          <Link href="/">
            <Button variant="ghost" className="w-full text-muted-foreground">
              Go back to homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function SoftPaywall({
  requiredTier,
  message,
  ctaText = "Upgrade Now"
}: {
  requiredTier: SubscriptionTier;
  message?: string;
  ctaText?: string;
}) {
  const { canAccessTier, isLoading } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    const tierConfig = PLATFORM_TIERS[requiredTier];
    trackConversion("soft_paywall_click", tierConfig?.price || 0, { tier: requiredTier });

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: requiredTier,
          interval: "month",
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (canAccessTier(requiredTier)) {
    return null;
  }

  const tierConfig = PLATFORM_TIERS[requiredTier];

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/20">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-full bg-accent/20">
          <Lock className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="font-medium text-card-foreground">
            {message || `${tierConfig?.name || requiredTier} Feature`}
          </p>
          <p className="text-sm text-muted-foreground">
            Starting at ${tierConfig?.price || 0}/month
          </p>
        </div>
      </div>
      
      <Button 
        className="btn-premium-gold text-white"
        data-testid="button-soft-paywall-upgrade"
        onClick={handleCheckout}
        disabled={checkoutLoading}
      >
        {checkoutLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Zap className="h-4 w-4 mr-1.5" />
            {ctaText}
          </>
        )}
      </Button>
    </div>
  );
}
