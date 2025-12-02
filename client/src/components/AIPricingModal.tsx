import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    console.log(`Upgrade to ${tier}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Upgrade AI Consultant
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Get unlimited access to the world's most advanced laundromat business consultant
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative p-6 transition-all ${
                plan.popular ? "border-2 border-[#b8860b] shadow-lg ring-1 ring-[#b8860b]/20" : "border border-border/50"
              }`}
              data-testid={`card-pricing-${plan.tier}`}
            >
              {plan.badge && (
                <Badge
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 ${
                    plan.popular ? "bg-[#b8860b] text-white" : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`badge-plan-${plan.tier}`}
                >
                  {plan.badge}
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-3" data-testid={`text-plan-name-${plan.tier}`}>
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold" data-testid={`text-price-${plan.tier}`}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`text-quota-${plan.tier}`}>
                  {plan.quota}
                </p>
                <p className="text-xs text-muted-foreground mt-2" data-testid={`badge-model-${plan.tier}`}>
                  Powered by {plan.model}
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm"
                    data-testid={`text-feature-${plan.tier}-${index}`}
                  >
                    <span className={`text-xs mt-1 ${plan.popular ? "text-[#b8860b]" : "text-muted-foreground"}`}>✓</span>
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {currentTier === plan.tier ? (
                <Button variant="outline" disabled className="w-full h-11" data-testid={`button-current-${plan.tier}`}>
                  Current Plan
                </Button>
              ) : plan.tier === "free" ? (
                <Button variant="ghost" disabled className="w-full h-11" data-testid="button-free-plan">
                  Free Forever
                </Button>
              ) : (
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full h-11 font-medium ${plan.popular ? "bg-[#b8860b] hover:bg-[#a07609]" : ""}`}
                  onClick={() => handleUpgrade(plan.tier as "pro" | "enterprise")}
                  data-testid={`button-upgrade-${plan.tier}`}
                >
                  Upgrade to {plan.name}
                </Button>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">30-day money-back guarantee.</span> Cancel anytime, no questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
