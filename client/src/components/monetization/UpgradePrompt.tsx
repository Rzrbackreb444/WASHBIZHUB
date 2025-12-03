import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Crown, Building2, Sparkles, ArrowRight, Check,
  TrendingUp, Shield, Star, Clock
} from "lucide-react";
import { useSubscription, type SubscriptionTier } from "@/hooks/useSubscription";
import { PLATFORM_TIERS, type PlatformTier } from "@/lib/tier-config";
import { trackEvent } from "@/lib/user-journey";

interface UpgradePromptProps {
  variant?: "inline" | "card" | "banner" | "floating" | "minimal";
  suggestedTier?: PlatformTier;
  feature?: string;
  title?: string;
  description?: string;
  benefits?: string[];
  showTrial?: boolean;
  className?: string;
}

export function UpgradePrompt({
  variant = "card",
  suggestedTier = "starter",
  feature,
  title,
  description,
  benefits,
  showTrial = true,
  className = ""
}: UpgradePromptProps) {
  const { tier: currentTier, canAccessTier } = useSubscription();
  
  if (canAccessTier(suggestedTier)) {
    return null;
  }

  const tierConfig = PLATFORM_TIERS[suggestedTier];
  const defaultBenefits = benefits || tierConfig?.features
    .filter(f => f.included && f.highlight)
    .map(f => f.text)
    .slice(0, 3) || [];

  const handleClick = () => {
    trackEvent("upgrade_prompt_click", "conversion", undefined, {
      variant,
      suggestedTier,
      feature,
      currentTier
    });
  };

  if (variant === "minimal") {
    return (
      <Link href="/pricing" onClick={handleClick}>
        <span className={`inline-flex items-center gap-1.5 text-accent hover:underline cursor-pointer text-sm font-medium ${className}`}>
          <Zap className="h-3.5 w-3.5" />
          Upgrade to {tierConfig?.name}
        </span>
      </Link>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 ${className}`}>
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="text-sm font-medium text-card-foreground">
          {title || `Unlock with ${tierConfig?.name}`}
        </span>
        <Link href="/pricing" onClick={handleClick}>
          <Button size="sm" className="h-7 px-3 btn-premium-gold text-white text-xs">
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`w-full p-4 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-y border-accent/20 ${className}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 rounded-full bg-accent/20 hidden sm:block">
              <Crown className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">
                {title || `Upgrade to ${tierConfig?.name} for full access`}
              </p>
              <p className="text-sm text-muted-foreground">
                {description || `Starting at $${tierConfig?.price}/month`}
              </p>
            </div>
          </div>
          <Link href="/pricing" onClick={handleClick}>
            <Button className="btn-premium-gold text-white whitespace-nowrap">
              <Zap className="h-4 w-4 mr-2" />
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Card className="shadow-xl border-accent/30 bg-card max-w-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Crown className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-card-foreground text-sm">
                  {title || `Upgrade to ${tierConfig?.name}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {description || "Get full access to all premium features"}
                </p>
                <Link href="/pricing" onClick={handleClick}>
                  <Button size="sm" className="mt-3 w-full btn-premium-gold text-white">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className={`border-accent/30 bg-gradient-to-br from-card to-accent/5 ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <Badge className="mb-3 bg-accent/10 text-accent border-accent/30">
              <Crown className="h-3 w-3 mr-1" />
              {tierConfig?.name} Plan
            </Badge>
            
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              {title || `Upgrade to ${tierConfig?.name}`}
            </h3>
            <p className="text-muted-foreground mb-4">
              {description || tierConfig?.description || "Get access to premium features and grow your business faster."}
            </p>
            
            {defaultBenefits.length > 0 && (
              <ul className="space-y-2 mb-4">
                {defaultBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-card-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-card-foreground">
                ${tierConfig?.price}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
              {showTrial && (
                <p className="text-xs text-muted-foreground">7-day free trial</p>
              )}
            </div>
            
            <Link href="/pricing" onClick={handleClick}>
              <Button className="btn-premium-gold text-white font-semibold px-6 group">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                30-day guarantee
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrialBanner({ daysRemaining = 7 }: { daysRemaining?: number }) {
  return (
    <div className="w-full py-2 px-4 bg-gradient-to-r from-accent to-[#d4a030] text-white text-center text-sm font-medium">
      <span className="flex items-center justify-center gap-2">
        <Star className="h-4 w-4" />
        {daysRemaining} days left in your free trial
        <Link href="/pricing">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 px-2 text-xs bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            Upgrade Now
          </Button>
        </Link>
      </span>
    </div>
  );
}

export function UsageLimitBanner({ 
  used, 
  limit, 
  feature = "analyses" 
}: { 
  used: number; 
  limit: number; 
  feature?: string;
}) {
  const percentUsed = Math.round((used / limit) * 100);
  const isNearLimit = percentUsed >= 80;
  const isAtLimit = percentUsed >= 100;

  if (!isNearLimit) return null;

  return (
    <div className={`w-full py-2 px-4 text-center text-sm font-medium ${
      isAtLimit 
        ? 'bg-destructive/10 text-destructive border-b border-destructive/20'
        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-b border-amber-500/20'
    }`}>
      <span className="flex items-center justify-center gap-2">
        {isAtLimit ? (
          <>
            <TrendingUp className="h-4 w-4" />
            You've reached your {feature} limit ({used}/{limit})
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4" />
            {used}/{limit} {feature} used this month ({percentUsed}%)
          </>
        )}
        <Link href="/pricing">
          <Button 
            size="sm" 
            className={`h-6 px-2 text-xs ${
              isAtLimit 
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            Upgrade
          </Button>
        </Link>
      </span>
    </div>
  );
}
