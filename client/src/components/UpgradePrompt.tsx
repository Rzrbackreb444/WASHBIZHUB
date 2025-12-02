/**
 * UNIVERSAL UPGRADE PROMPT COMPONENT
 * Premium, minimalist design for freemium conversion
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
    countdown?: number;
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
      "Basic calculators (5/month)",
      "Educational content access",
      "Community forum",
      "AI chat (5 messages/day)",
      "Basic templates",
    ],
    highlight: false,
  },
  {
    name: "Accelerate",
    price: 249,
    period: "month",
    tagline: "Single-location owners",
    features: [
      "Basic POS System",
      "Website Builder (5 templates)",
      "SEO Optimizer",
      "50+ Business Calculators",
      "Design Studio 2D",
      "Educational Content",
      "Vendor Marketplace",
      "Email Support",
    ],
    highlight: false,
  },
  {
    name: "Scale",
    price: 499,
    period: "month",
    tagline: "Multi-location operators",
    features: [
      "Everything in Accelerate",
      "Up to 5 Locations",
      "IoT Machine Monitoring",
      "Route Optimization",
      "3D Design Studio",
      "CLEANBI Scoring",
      "AI Consultant Access",
      "Professional Analytics Suite",
      "Affiliate Program (20%)",
      "Priority Support",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Summit",
    price: 899,
    period: "month",
    tagline: "Enterprise & franchises",
    features: [
      "Everything in Scale",
      "Unlimited Locations",
      "White-label Platform",
      "Custom Branding",
      "API Access",
      "Dedicated Account Manager",
      "24/7 Phone Support",
      "Custom Integrations",
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
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (urgency?.countdown !== undefined) {
      setCountdown(urgency.countdown);
    }
  }, [urgency?.countdown]);

  useEffect(() => {
    if (!urgency?.countdown || countdown === 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 3600000);

    return () => clearInterval(timer);
  }, [urgency, countdown]);

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "nickisthecoolest") {
      setPromoApplied(true);
      setDiscount(0.40);
      setPromoError("");
    } else {
      setPromoApplied(false);
      setDiscount(0);
      setPromoError("Invalid promo code");
    }
  };

  const calculatePrice = (originalPrice: number) => {
    if (promoApplied && discount > 0) {
      return originalPrice * (1 - discount);
    }
    return originalPrice;
  };

  const handleUpgrade = async (planName: string, price: number) => {
    const priceIdMap: Record<string, string> = {
      "Pro": import.meta.env.VITE_STRIPE_PRICE_SEO_PRO || "price_seo_pro_monthly",
      "Enterprise": import.meta.env.VITE_STRIPE_PRICE_SEO_ENTERPRISE || "price_seo_enterprise_monthly",
    };

    const priceId = priceIdMap[planName];
    if (!priceId) {
      console.error("Invalid plan selected");
      return;
    }

    try {
      const response = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          promoCode: promoApplied ? promoCode : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
    }
  };

  const getTriggerHeadline = () => {
    switch (trigger) {
      case "usage_limit":
        return "You've reached your limit";
      case "feature_gate":
        return "Premium Feature";
      case "achievement":
        return "Ready for more?";
      case "exploration":
        return "Unlock the full experience";
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
        return `You're getting great results. Upgrade to unlock even more powerful tools.`;
      default:
        return "Access premium features and take your business to the next level.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            {getTriggerHeadline()}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {getTriggerSubtext()}
          </DialogDescription>
        </DialogHeader>

        {/* Urgency Banner */}
        {urgency && (
          <Card className="bg-[#b8860b]/10 border-[#b8860b]/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{urgency.message}</p>
                {urgency.socialProof && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {urgency.socialProof}
                  </p>
                )}
              </div>
              {countdown > 0 && (
                <Badge className="bg-[#b8860b] text-white text-lg font-semibold px-4 py-2">
                  {countdown}h left
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Benefits */}
        {benefits.length > 0 && (
          <div className="my-6">
            <h3 className="font-semibold mb-4">What you'll unlock:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-[#b8860b] text-sm mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Promo Code */}
        <div className="my-6">
          <Card className="p-4 border-border/50">
            <label className="text-sm font-medium mb-3 block">
              Have a promo code?
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && applyPromoCode()}
                className={cn("h-11", promoApplied && "border-emerald-500")}
                data-testid="input-promo-code"
              />
              <Button
                onClick={applyPromoCode}
                variant={promoApplied ? "default" : "outline"}
                disabled={!promoCode}
                className="h-11"
                data-testid="button-apply-promo"
              >
                {promoApplied ? "Applied" : "Apply"}
              </Button>
            </div>
            {promoApplied && (
              <p className="text-sm text-emerald-600 mt-2">
                {(discount * 100)}% discount applied
              </p>
            )}
            {promoError && (
              <p className="text-sm text-destructive mt-2">
                {promoError}
              </p>
            )}
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="my-6">
          <h3 className="text-center font-semibold text-lg mb-6">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING_TIERS.slice(0, 3).map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative p-6 transition-all",
                  tier.highlight ? "border-2 border-[#b8860b] shadow-lg ring-1 ring-[#b8860b]/20" : "border-border/50"
                )}
              >
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b8860b] text-white">
                    {tier.badge}
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-lg mb-1">{tier.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{tier.tagline}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    {promoApplied && tier.price > 0 ? (
                      <>
                        <span className="text-2xl font-bold line-through text-muted-foreground">${tier.price}</span>
                        <span className="text-4xl font-bold text-emerald-600">${calculatePrice(tier.price).toFixed(0)}</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">${tier.price}</span>
                    )}
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                  {promoApplied && tier.price > 0 && (
                    <Badge variant="default" className="mt-2 bg-emerald-600">
                      Save ${(tier.price * discount).toFixed(0)}/mo
                    </Badge>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className={cn(
                        "text-xs mt-1",
                        tier.highlight ? "text-[#b8860b]" : "text-muted-foreground"
                      )}>✓</span>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full h-11 font-medium",
                    tier.highlight ? "bg-[#b8860b] hover:bg-[#a07609]" : ""
                  )}
                  variant={tier.highlight ? "default" : "outline"}
                  disabled={tier.price === 0}
                  onClick={() => handleUpgrade(tier.name, tier.price)}
                  data-testid={`button-select-${tier.name.toLowerCase()}`}
                >
                  {tier.price === 0 ? "Current Plan" : `Upgrade to ${tier.name}`}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <Card className="bg-muted/30 border-border/50 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">4.9/5</p>
              <p className="text-xs text-muted-foreground">from 2,847 reviews</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">72,000+</p>
              <p className="text-xs text-muted-foreground">Laundromats served</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">$12M+</p>
              <p className="text-xs text-muted-foreground">Revenue generated</p>
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          30-day money-back guarantee · Cancel anytime · No hidden fees
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
