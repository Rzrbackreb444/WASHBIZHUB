import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Crown, 
  Sparkles, 
  Zap, 
  Users, 
  Clock, 
  Check, 
  ArrowRight,
  Star,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradePrompt } from "@/components/UpgradePrompt";

type SubscriptionTier = "free" | "accelerate" | "scale" | "summit";

const TIER_ORDER: Record<SubscriptionTier, number> = {
  free: 0,
  accelerate: 1,
  scale: 2,
  summit: 3,
};

const TIER_DETAILS: Record<SubscriptionTier, {
  name: string;
  icon: typeof Crown;
  color: string;
  bgColor: string;
  borderColor: string;
  price: string;
}> = {
  free: {
    name: "Free",
    icon: Zap,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-muted",
    price: "$0",
  },
  accelerate: {
    name: "Accelerate",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    price: "$249/mo",
  },
  scale: {
    name: "Scale",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    price: "$499/mo",
  },
  summit: {
    name: "Summit",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    price: "$899/mo",
  },
};

const DEFAULT_BENEFITS: Record<SubscriptionTier, string[]> = {
  free: [],
  accelerate: [
    "Basic POS System",
    "Website Builder (5 templates)",
    "50+ Business Calculators",
    "Design Studio 2D",
    "Vendor Marketplace Access",
  ],
  scale: [
    "Everything in Accelerate",
    "Up to 5 Locations",
    "IoT Machine Monitoring",
    "CLEANBI™ Scoring",
    "AI Consultant Access",
    "Professional Analytics Suite",
  ],
  summit: [
    "Everything in Scale",
    "Unlimited Locations",
    "White-label Platform",
    "Custom Branding",
    "API Access",
    "Dedicated Account Manager",
  ],
};

interface PaywallProps {
  children: ReactNode;
  requiredTier: SubscriptionTier;
  featureName: string;
  featureDescription?: string;
  previewMode?: boolean;
  blurIntensity?: number;
  showTeaser?: boolean;
  teaserPercent?: number;
  benefits?: string[];
  socialProofCount?: number;
  showUrgency?: boolean;
  urgencyMessage?: string;
  className?: string;
}

interface PaywallState {
  userTier: SubscriptionTier;
  unlockAttempts: number;
  lastAttempt: string | null;
}

const STORAGE_KEY = "washbizhub_subscription";
const ANALYTICS_KEY = "washbizhub_paywall_analytics";

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function getDefaultPaywallState(): PaywallState {
  return {
    userTier: "free",
    unlockAttempts: 0,
    lastAttempt: null,
  };
}

function getStoredSubscription(): PaywallState {
  if (!isBrowser()) {
    return getDefaultPaywallState();
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading subscription from localStorage:", e);
  }
  return getDefaultPaywallState();
}

function setStoredSubscription(state: Partial<PaywallState>): void {
  if (!isBrowser()) {
    return;
  }
  try {
    const current = getStoredSubscription();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving subscription to localStorage:", e);
  }
}

function trackUnlockAttempt(featureName: string, requiredTier: SubscriptionTier): void {
  if (!isBrowser()) {
    return;
  }
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    const analytics = stored ? JSON.parse(stored) : { attempts: [] };
    analytics.attempts.push({
      feature: featureName,
      tier: requiredTier,
      timestamp: new Date().toISOString(),
    });
    if (analytics.attempts.length > 100) {
      analytics.attempts = analytics.attempts.slice(-100);
    }
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    
    const state = getStoredSubscription();
    setStoredSubscription({
      unlockAttempts: state.unlockAttempts + 1,
      lastAttempt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error tracking unlock attempt:", e);
  }
}

export function Paywall({
  children,
  requiredTier,
  featureName,
  featureDescription,
  previewMode = true,
  blurIntensity = 5,
  showTeaser = false,
  teaserPercent = 30,
  benefits,
  socialProofCount = 10000,
  showUrgency = true,
  urgencyMessage = "Limited time offer - Save 40% this week",
  className,
}: PaywallProps) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [userTier, setUserTier] = useState<SubscriptionTier>("free");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const state = getStoredSubscription();
    setUserTier(state.userTier);
  }, []);

  const hasAccess = TIER_ORDER[userTier] >= TIER_ORDER[requiredTier];
  const tierInfo = TIER_DETAILS[requiredTier];
  const TierIcon = tierInfo.icon;
  const displayBenefits = benefits || DEFAULT_BENEFITS[requiredTier];

  const handleUnlockClick = useCallback(() => {
    trackUnlockAttempt(featureName, requiredTier);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    setIsUpgradeOpen(true);
  }, [featureName, requiredTier]);

  if (hasAccess) {
    return <>{children}</>;
  }

  const blurValue = Math.min(Math.max(blurIntensity, 1), 10) * 2;
  const teaserHeight = showTeaser ? `${Math.min(Math.max(teaserPercent, 10), 80)}%` : "100%";

  return (
    <div className={cn("relative", className)} data-testid="paywall-container">
      <div 
        className="relative overflow-hidden rounded-xl"
        style={{ maxHeight: showTeaser ? "400px" : undefined }}
        data-testid="paywall-content-wrapper"
      >
        {previewMode && (
          <div
            className="relative"
            style={{ 
              filter: `blur(${blurValue}px)`,
              WebkitFilter: `blur(${blurValue}px)`,
              pointerEvents: "none",
              userSelect: "none",
            }}
            data-testid="paywall-blurred-content"
          >
            {children}
          </div>
        )}

        {showTeaser && (
          <div 
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: `calc(100% - ${teaserHeight})`,
              background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)",
            }}
            data-testid="paywall-teaser-gradient"
          />
        )}

        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "bg-gradient-to-br from-background/60 via-background/80 to-background/90",
            "backdrop-blur-sm"
          )}
          data-testid="paywall-overlay"
        >
          <Card 
            className={cn(
              "relative max-w-md w-full mx-4 overflow-visible",
              "bg-card/95 backdrop-blur-xl",
              "border-2",
              tierInfo.borderColor,
              isAnimating && "scale-[1.02] transition-transform duration-300"
            )}
            data-testid="paywall-card"
          >
            <div 
              className={cn(
                "absolute -top-4 left-1/2 -translate-x-1/2",
                "flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-gradient-to-r from-primary to-accent",
                "shadow-lg"
              )}
              data-testid="paywall-tier-badge"
            >
              <Lock className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-bold text-primary-foreground">
                {tierInfo.name} Feature
              </span>
            </div>

            <div className="p-6 pt-8 space-y-6">
              <div className="text-center space-y-3">
                <div 
                  className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto",
                    tierInfo.bgColor,
                    "ring-4 ring-offset-2 ring-offset-background",
                    tierInfo.borderColor.replace("border-", "ring-")
                  )}
                  data-testid="paywall-lock-icon"
                >
                  <TierIcon className={cn("h-8 w-8", tierInfo.color)} />
                </div>

                <h3 
                  className="text-2xl font-bold"
                  data-testid="paywall-feature-name"
                >
                  {featureName}
                </h3>

                {featureDescription && (
                  <p 
                    className="text-muted-foreground"
                    data-testid="paywall-feature-description"
                  >
                    {featureDescription}
                  </p>
                )}

                <Badge 
                  variant="outline"
                  className={cn(
                    "mt-2",
                    tierInfo.bgColor,
                    tierInfo.color
                  )}
                  data-testid="paywall-price-badge"
                >
                  <TierIcon className="h-3 w-3 mr-1" />
                  {tierInfo.name} • {tierInfo.price}
                </Badge>
              </div>

              {displayBenefits.length > 0 && (
                <div 
                  className="space-y-2"
                  data-testid="paywall-benefits-list"
                >
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    What you'll unlock:
                  </p>
                  <ul className="grid gap-2">
                    {displayBenefits.slice(0, 5).map((benefit, index) => (
                      <li 
                        key={index}
                        className="flex items-start gap-2 text-sm"
                        data-testid={`paywall-benefit-${index}`}
                      >
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleUnlockClick}
                  className="w-full group"
                  size="lg"
                  data-testid="paywall-unlock-button"
                >
                  Unlock with {tierInfo.name}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button 
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setIsUpgradeOpen(true)}
                  data-testid="paywall-view-plans-button"
                >
                  View all plans
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div 
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  data-testid="paywall-social-proof"
                >
                  <Users className="h-4 w-4" />
                  <span>
                    {socialProofCount.toLocaleString()}+ members unlocked
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className="h-3 w-3 text-amber-500 fill-amber-500" 
                    />
                  ))}
                </div>
              </div>

              {showUrgency && (
                <div 
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    "bg-gradient-to-r from-primary/10 to-accent/10",
                    "border border-primary/20"
                  )}
                  data-testid="paywall-urgency-banner"
                >
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-sm font-medium">{urgencyMessage}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <UpgradePrompt
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        trigger="feature_gate"
        featureName={featureName}
        featureDescription={featureDescription}
        benefits={displayBenefits}
        urgency={showUrgency ? {
          message: urgencyMessage,
          countdown: 24,
          socialProof: `${socialProofCount.toLocaleString()}+ laundromat operators upgraded this month`,
        } : undefined}
      />
    </div>
  );
}

export function usePaywall() {
  const [userTier, setUserTier] = useState<SubscriptionTier>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isBrowser()) {
      const state = getStoredSubscription();
      setUserTier(state.userTier);
    }
    setIsLoading(false);
  }, []);

  const hasAccess = useCallback((requiredTier: SubscriptionTier): boolean => {
    return TIER_ORDER[userTier] >= TIER_ORDER[requiredTier];
  }, [userTier]);

  const setSubscriptionTier = useCallback((tier: SubscriptionTier) => {
    setStoredSubscription({ userTier: tier });
    setUserTier(tier);
  }, []);

  const getAnalytics = useCallback(() => {
    if (!isBrowser()) {
      return { attempts: [] };
    }
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : { attempts: [] };
    } catch {
      return { attempts: [] };
    }
  }, []);

  const clearAnalytics = useCallback(() => {
    if (!isBrowser()) {
      return;
    }
    try {
      localStorage.removeItem(ANALYTICS_KEY);
    } catch (e) {
      console.error("Error clearing analytics:", e);
    }
  }, []);

  return {
    userTier,
    isLoading,
    hasAccess,
    setSubscriptionTier,
    getAnalytics,
    clearAnalytics,
    tierDetails: TIER_DETAILS,
    tierOrder: TIER_ORDER,
  };
}

export type { SubscriptionTier, PaywallProps };
