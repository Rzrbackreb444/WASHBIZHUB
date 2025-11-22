/**
 * UNIVERSAL UPGRADE PROMPT COMPONENT
 * 
 * Freemium conversion system based on top SaaS best practices:
 * - Contextual prompts at natural friction points
 * - "Discovery" framing (not blocking)
 * - FOMO & urgency tactics
 * - Minimal friction upgrade flow
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, Crown, Zap, TrendingUp, X, Check, 
  Clock, Users, Star, ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "usage_limit" | "feature_gate" | "achievement" | "exploration";
  featureName: string;
  featureDescription?: string;
  usageLimit?: { current: number; max: number; period: string };
  benefits?: string[];
  urgency?: {
    message: string;
    countdown?: number; // hours
    socialProof?: string;
  };
}

const PRICING_TIERS = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    tagline: "Perfect for getting started",
    features: [
      "3 SEO audits per month",
      "5 calculator uses per month",
      "Basic templates",
      "Community support",
      "AI chat (5 messages/day)",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: 49,
    period: "month",
    tagline: "Most Popular - Serious businesses",
    features: [
      "Unlimited SEO audits",
      "Unlimited calculators",
      "Premium templates & designs",
      "AI agents & automation",
      "Priority support",
      "Website builder",
      "Advanced analytics",
      "Custom branding",
    ],
    highlight: true,
    badge: "BEST VALUE",
  },
  {
    name: "Enterprise",
    price: 199,
    period: "month",
    tagline: "Multi-location operations",
    features: [
      "Everything in Pro",
      "White-label platform",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Unlimited team members",
      "SLA guarantee",
    ],
    highlight: false,
  },
];

export function UpgradePrompt({
  isOpen,
  onClose,
  trigger,
  featureName,
  featureDescription,
  usageLimit,
  benefits = [],
  urgency,
}: UpgradePromptProps) {
  const [countdown, setCountdown] = useState(urgency?.countdown || 0);

  // Update countdown when urgency.countdown changes
  useEffect(() => {
    if (urgency?.countdown !== undefined) {
      setCountdown(urgency.countdown);
    }
  }, [urgency?.countdown]);

  // Start countdown timer
  useEffect(() => {
    if (!urgency?.countdown || countdown === 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 3600000); // 1 hour

    return () => clearInterval(timer);
  }, [urgency, countdown]);

  const getTriggerHeadline = () => {
    switch (trigger) {
      case "usage_limit":
        return "You've hit your free plan limit";
      case "feature_gate":
        return `You discovered a Premium feature! ✨`;
      case "achievement":
        return "Great progress! Ready for more?";
      case "exploration":
        return "Unlock the full WashBizHub experience";
      default:
        return "Upgrade to Pro";
    }
  };

  const getTriggerSubtext = () => {
    switch (trigger) {
      case "usage_limit":
        return `You've used ${usageLimit?.current} of ${usageLimit?.max} free ${featureName} ${usageLimit?.period}. Upgrade for unlimited access.`;
      case "feature_gate":
        return featureDescription || `${featureName} is available on Pro and Enterprise plans.`;
      case "achievement":
        return `You're getting great results! Upgrade to unlock even more powerful tools.`;
      default:
        return "Access premium features and take your business to the next level.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2 mb-2">
                {trigger === "feature_gate" && <Sparkles className="h-6 w-6 text-primary" />}
                {trigger === "usage_limit" && <Zap className="h-6 w-6 text-orange-500" />}
                {trigger === "achievement" && <TrendingUp className="h-6 w-6 text-emerald-500" />}
                {getTriggerHeadline()}
              </DialogTitle>
              <DialogDescription className="text-base">
                {getTriggerSubtext()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Urgency Banner */}
        {urgency && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{urgency.message}</p>
                  {urgency.socialProof && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {urgency.socialProof}
                    </p>
                  )}
                </div>
              </div>
              {countdown > 0 && (
                <Badge variant="default" className="text-lg font-bold px-4 py-2">
                  {countdown}h left
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Benefits Grid */}
        {benefits.length > 0 && (
          <div className="my-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              What you'll unlock:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Pricing Tiers */}
        <div className="my-6">
          <h3 className="text-center font-semibold text-lg mb-6">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative p-6 hover-elevate transition-all",
                  tier.highlight && "border-2 border-primary shadow-lg scale-105"
                )}
              >
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent">
                    {tier.badge}
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <h4 className="font-bold text-lg mb-1">{tier.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{tier.tagline}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className={cn(
                        "h-4 w-4 flex-shrink-0 mt-0.5",
                        tier.highlight ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={tier.highlight ? "default" : "outline"}
                  disabled={tier.price === 0}
                  data-testid={`button-select-${tier.name.toLowerCase()}`}
                >
                  {tier.price === 0 ? (
                    "Current Plan"
                  ) : (
                    <>
                      Upgrade to {tier.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <Card className="bg-muted/30 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground">4.9/5 from 2,847 reviews</p>
            </div>
            <div>
              <p className="font-bold text-lg">72,000+</p>
              <p className="text-xs text-muted-foreground">Laundromats served</p>
            </div>
            <div>
              <p className="font-bold text-lg">$12M+</p>
              <p className="text-xs text-muted-foreground">Revenue generated</p>
            </div>
          </div>
        </Card>

        {/* Money-back guarantee */}
        <p className="text-center text-sm text-muted-foreground">
          💯 30-day money-back guarantee • Cancel anytime • No hidden fees
        </p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Usage hook for tracking and triggering upgrade prompts
 */
export function useUpgradePrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState<Omit<UpgradePromptProps, "isOpen" | "onClose">>({
    trigger: "feature_gate",
    featureName: "",
  });

  const showUpgradePrompt = (config: Omit<UpgradePromptProps, "isOpen" | "onClose">) => {
    setPromptConfig(config);
    setIsOpen(true);
  };

  return {
    UpgradePromptComponent: (
      <UpgradePrompt
        {...promptConfig}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    ),
    showUpgradePrompt,
    closeUpgradePrompt: () => setIsOpen(false),
  };
}
