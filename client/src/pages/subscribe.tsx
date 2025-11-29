import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap, Loader2, Crown, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type TierId = 'starter' | 'pro' | 'enterprise' | 'pos_flat';

interface SubscriptionTier {
  id: TierId;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  icon: typeof Star;
}

export default function Subscribe() {
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<TierId | null>(null);
  
  const { data: user } = useQuery<{ id: string } | null>({
    queryKey: ['/api/auth/user'],
  });

  const tiers: SubscriptionTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      description: 'Perfect for first-time buyers',
      icon: Star,
      features: [
        "5 CLEANBI Reports/month",
        "Full property analysis",
        "Competition mapping",
        "Basic support",
        "Export to PDF",
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 97,
      description: 'For serious investors',
      icon: Zap,
      popular: true,
      features: [
        "25 CLEANBI Reports/month",
        "Advanced AI insights",
        "Revenue projections",
        "Market comparisons",
        "Priority support",
        "API access (100 calls)",
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 499,
      description: 'For portfolios & brokers',
      icon: Crown,
      features: [
        "Unlimited CLEANBI Reports",
        "White-label reports",
        "Custom branding",
        "Dedicated account manager",
        "API access (unlimited)",
        "Team seats (5 included)",
      ],
    },
    {
      id: 'pos_flat',
      name: 'WashBizPOS Pro',
      price: 99,
      description: 'Complete POS system',
      icon: Rocket,
      features: [
        "Unlimited transactions",
        "AI predictive maintenance",
        "Dynamic pricing engine",
        "Multi-location support",
        "Real-time analytics",
        "IoT machine integration",
      ],
    },
  ];

  const handleSubscribe = async (tierId: TierId) => {
    setLoadingTier(tierId);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tierId,
          interval: 'month',
          userId: user?.id || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Star className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-subscribe-title">
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/70" data-testid="text-subscribe-subtitle">
            Unlock the complete WashBizHub platform for serious operators
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={tier.id}
                className={`relative overflow-hidden ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-accent/30 to-accent/10 border-accent' 
                    : 'bg-white/10 backdrop-blur border-white/20'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 text-sm font-bold">
                    POPULAR
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-6 w-6 ${tier.popular ? 'text-accent' : 'text-white/70'}`} />
                    <CardTitle className="text-white text-xl">{tier.name}</CardTitle>
                  </div>
                  <div className="text-3xl font-black text-white mb-2">
                    ${tier.price}<span className="text-lg font-normal text-white/60">/month</span>
                  </div>
                  <CardDescription className={tier.popular ? 'text-white/90' : 'text-white/70'}>
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white/80 text-sm">
                        <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${tier.popular ? 'text-accent' : 'text-white/50'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full font-bold ${
                      tier.popular 
                        ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={loadingTier !== null}
                    data-testid={`button-subscribe-${tier.id}`}
                  >
                    {loadingTier === tier.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Get ${tier.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-white/60 max-w-2xl mx-auto">
          <p className="mb-4">
            All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
          <p className="text-sm">
            Already a subscriber?{' '}
            <Link href="/account" className="text-accent hover:underline">
              Manage your subscription
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
