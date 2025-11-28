import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Subscribe() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // For MVP, we collect minimal info - in production, would use Stripe Checkout or Elements
      const email = prompt("Enter your email address:");
      if (!email || !email.trim()) {
        toast({
          title: "Cancelled",
          description: "Email is required to subscribe.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const name = prompt("Enter your name:");
      if (!name || !name.trim()) {
        toast({
          title: "Cancelled",
          description: "Name is required to subscribe.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Call the backend to create subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });

      const data = await response.json();

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      // In production, we'd use the clientSecret to handle payment with Stripe Elements
      // For MVP, show success message with subscription details
      toast({
        title: "Subscription Created!",
        description: `Your Pro subscription has been initiated. Subscription ID: ${data.subscriptionId}. Payment setup required.`,
      });

      // In production, redirect to payment page or show Stripe Elements
      // window.location.href = `/payment?subscription=${data.subscriptionId}&client_secret=${data.clientSecret}`;
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const proFeatures = [
    "Unlimited 2D/3D design studio access",
    "Complete CLEANBI™ analysis with AI insights",
    "Advanced revenue modeling & projections",
    "Access to all 2,100+ diagnostic fault codes",
    "Priority vendor marketplace listings",
    "Exclusive affiliate partner opportunities",
    "AI-powered blog content generation",
    "Premium support & consultation",
    "Early access to new features",
    "Export designs to PDF/CAD formats",
  ];

  const freeFeatures = [
    "Basic revenue calculator",
    "2D design studio (limited)",
    "CLEANBI™ scoring (basic)",
    "Browse marketplace vendors",
    "Read blog content",
    "Parts catalog search",
    "Laundromat locator",
  ];

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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Free Plan */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-white text-2xl">Free</CardTitle>
                <Badge variant="secondary">Current Plan</Badge>
              </div>
              <div className="text-4xl font-black text-white mb-2">
                $0<span className="text-xl font-normal text-white/60">/month</span>
              </div>
              <CardDescription className="text-white/70">
                Essential tools to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {freeFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white/80">
                    <CheckCircle className="h-5 w-5 text-white/50 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full border-white/30 text-white hover:bg-white/10"
                disabled
                data-testid="button-current-plan"
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-gradient-to-br from-accent/30 to-accent/10 backdrop-blur border-accent relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 text-sm font-bold">
              POPULAR
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Zap className="h-6 w-6 text-accent" />
                  Pro
                </CardTitle>
              </div>
              <div className="text-4xl font-black text-white mb-2">
                $499<span className="text-xl font-normal text-white/60">/month</span>
              </div>
              <CardDescription className="text-white/90">
                Complete platform access for multi-location operators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {proFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg py-6"
                onClick={handleSubscribe}
                disabled={isLoading}
                data-testid="button-subscribe-pro"
              >
                {isLoading ? "Processing..." : "Subscribe to Pro"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-white/10 backdrop-blur border-white/20 text-center">
            <CardContent className="pt-8">
              <div className="text-4xl font-black text-accent mb-2">10x</div>
              <p className="text-white/80">ROI on subscription cost through optimized operations</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 text-center">
            <CardContent className="pt-8">
              <div className="text-4xl font-black text-accent mb-2">500+</div>
              <p className="text-white/80">Diagnostic codes save thousands in repair costs</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 text-center">
            <CardContent className="pt-8">
              <div className="text-4xl font-black text-accent mb-2">24/7</div>
              <p className="text-white/80">Access to all tools and premium support</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="bg-white/10 backdrop-blur border-white/20 mt-12 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div>
              <h3 className="font-bold text-white mb-2">Can I cancel anytime?</h3>
              <p>Yes, you can cancel your Pro subscription at any time. You'll retain access until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Do you offer annual billing?</h3>
              <p>Yes, contact us for annual billing options and receive 2 months free ($970/year instead of $1,164).</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">What payment methods do you accept?</h3>
              <p>We accept all major credit cards and debit cards through our secure Stripe payment processor.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
