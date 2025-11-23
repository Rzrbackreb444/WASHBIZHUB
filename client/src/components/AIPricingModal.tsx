import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PricingPlan {
  tier: "free" | "pro" | "enterprise";
  name: string;
  price: string;
  period: string;
  quota: string;
  features: string[];
  model: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  popular?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    tier: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    quota: "10 messages/month",
    model: "Gemini 1.5",
    features: [
      "10 AI consultant messages per month",
      "Basic laundromat expertise",
      "Equipment recommendations",
      "Valuation estimates",
      "ROI calculations",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    quota: "500 messages/month",
    model: "GPT-4 Turbo",
    badge: "Most Popular",
    badgeVariant: "default",
    popular: true,
    features: [
      "500 AI consultant messages per month",
      "Advanced multi-model AI (GPT-4)",
      "Priority response speed",
      "Detailed market analysis",
      "Custom financial projections",
      "Competitor analysis",
      "Location scoring & demographics",
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: "$99",
    period: "/month",
    quota: "Unlimited",
    model: "Claude 3.5 Sonnet",
    badge: "Best Value",
    badgeVariant: "secondary",
    features: [
      "Unlimited AI consultant messages",
      "Premium AI model (Claude 3.5 Sonnet)",
      "Custom knowledge base training",
      "Upload your own documents & data",
      "White-glove support",
      "Custom system prompts",
      "API access for integrations",
      "Dedicated account manager",
    ],
  },
];

interface AIPricingModalProps {
  open: boolean;
  onClose: () => void;
  currentTier?: string;
  onUpgrade?: (tier: "pro" | "enterprise") => void;
}

export function AIPricingModal({ open, onClose, currentTier = "free", onUpgrade }: AIPricingModalProps) {
  const handleUpgrade = (tier: "pro" | "enterprise") => {
    if (onUpgrade) {
      onUpgrade(tier);
    }
    // Stripe checkout will be implemented in next task
    console.log(`Upgrade to ${tier}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Upgrade WashBizHub AI Consultant
          </DialogTitle>
          <DialogDescription className="text-base">
            Get unlimited access to the world's most advanced laundromat business consultant
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative p-6 hover-elevate ${
                plan.popular ? "border-2 border-primary shadow-lg" : ""
              }`}
              data-testid={`card-pricing-${plan.tier}`}
            >
              {plan.badge && (
                <Badge
                  variant={plan.badgeVariant}
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  data-testid={`badge-plan-${plan.tier}`}
                >
                  {plan.badge}
                </Badge>
              )}

              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  {plan.tier === "free" && <Zap className="h-8 w-8 text-muted-foreground" />}
                  {plan.tier === "pro" && <Sparkles className="h-8 w-8 text-primary" />}
                  {plan.tier === "enterprise" && <Crown className="h-8 w-8 text-accent" />}
                </div>
                <h3 className="text-2xl font-bold mb-2" data-testid={`text-plan-name-${plan.tier}`}>
                  {plan.name}
                </h3>
                <div className="mb-1">
                  <span className="text-4xl font-bold" data-testid={`text-price-${plan.tier}`}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2" data-testid={`text-quota-${plan.tier}`}>
                  {plan.quota}
                </p>
                <Badge variant="outline" className="mb-4" data-testid={`badge-model-${plan.tier}`}>
                  {plan.model}
                </Badge>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm"
                    data-testid={`text-feature-${plan.tier}-${index}`}
                  >
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {currentTier === plan.tier ? (
                <Button variant="outline" disabled className="w-full" data-testid={`button-current-${plan.tier}`}>
                  Current Plan
                </Button>
              ) : plan.tier === "free" ? (
                <Button variant="ghost" disabled className="w-full" data-testid="button-free-plan">
                  Free Forever
                </Button>
              ) : (
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleUpgrade(plan.tier as "pro" | "enterprise")}
                  data-testid={`button-upgrade-${plan.tier}`}
                >
                  Upgrade to {plan.name}
                </Button>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            <strong>30-day money-back guarantee.</strong> Cancel anytime, no questions asked. All plans include
            Bloomberg Terminal-grade expertise in laundromat valuation, equipment selection, financial analysis,
            and market insights.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
