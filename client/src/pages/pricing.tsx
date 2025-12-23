import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Star,
  Gift,
  Shield,
  CreditCard,
  RefreshCw,
  Clock,
  ChevronDown,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { toast } = useToast();

  const checkoutMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const res = await apiRequest("POST", "/api/create-subscription", {
        tierId,
        interval: isAnnual ? 'year' : 'month',
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = (tierId: string) => {
    if (tierId === 'free') {
      window.location.href = '/signup';
      return;
    }
    if (tierId === 'enterprise') {
      window.location.href = '/enterprise-onboarding';
      return;
    }
    checkoutMutation.mutate(tierId);
  };

  const freeFeatures = [
    "3 CLEANBI location analyses",
    "Browse marketplace listings",
    "View 7 Lease Red Flags",
    "Access blog & help center",
    "Calculator previews"
  ];

  const allAccessFeatures = [
    "Unlimited CLEANBI analyses",
    "Full Calculator Suite (50+ tools)",
    "All Courses & Training",
    "Complete Template Vault",
    "AI Business Plan Generator",
    "Design Studio (2D/3D)",
    "Service Guy AI diagnostics",
    "POS Command Center",
    "Priority support"
  ];

  const enterpriseFeatures = [
    "Everything in All-Access",
    "API access for integrations",
    "White-label reports",
    "Multi-location management",
    "Team seats (up to 10)",
    "Dedicated account manager"
  ];

  const faqs = [
    {
      question: "What is CLEANBI?",
      answer: "CLEANBI is our AI-powered location intelligence system that scores any address for laundromat investment potential. It analyzes 17 key factors including competition, demographics, accessibility, and business metrics."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! There are no long-term contracts. Cancel anytime and your access continues until the end of your billing period."
    },
    {
      question: "What's the money-back guarantee?",
      answer: "All paid plans include a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund - no questions asked."
    },
    {
      question: "Which plan should I choose?",
      answer: "Free is great for exploring. All-Access is perfect for serious buyers, operators, and investors who want complete tools and training. Enterprise is for multi-unit owners and brokers needing API access and team features."
    }
  ];

  const trustBadges = [
    { icon: Shield, label: "Bank-level security" },
    { icon: CreditCard, label: "Secure payments" },
    { icon: RefreshCw, label: "30-day guarantee" },
    { icon: Clock, label: "Cancel anytime" }
  ];

  const monthlyPrice = 149;
  const annualMonthly = 124;
  const annualTotal = 1490;
  const savings = Math.round(((monthlyPrice * 12 - annualTotal) / (monthlyPrice * 12)) * 100);

  const enterpriseMonthly = 299;
  const enterpriseAnnual = 249;

  return (
    <>
      <SEO 
        title="Simple, Transparent Pricing | WashBizHub"
        description="Start free with 3 CLEANBI analyses. Upgrade to All-Access for unlimited tools, courses, and AI features. 30-day money-back guarantee."
        canonicalUrl="/pricing"
        ogType="website"
        keywords={["WashBizHub pricing", "laundromat software pricing", "CLEANBI pricing"]}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 bg-[#0A1628]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Badge 
              variant="outline"
              className="mb-6 border-[#C8A661]/40 text-[#C8A661]"
              data-testid="badge-pricing"
            >
              Simple Pricing
            </Badge>
            
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
              data-testid="text-pricing-title"
            >
              Start Free, <span className="text-[#C8A661]">Grow With Us</span>
            </h1>
            
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              No hidden fees. No surprises. Just the tools you need to succeed in the laundromat business.
            </p>

            {/* Annual/Monthly Toggle */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-white/60'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                data-testid="switch-billing"
                className="data-[state=checked]:bg-[#C8A661]"
              />
              <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-white/60'}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge className="bg-[#C8A661] text-white border-0">
                  Save {savings}%
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Free Tier */}
              <Card className="relative" data-testid="card-free">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 p-2.5 rounded-lg bg-muted w-fit">
                    <Gift className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">Free</CardTitle>
                  <p className="text-sm text-muted-foreground">Get started</p>
                  
                  <div className="my-4">
                    <span className="text-4xl font-bold">$0</span>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCheckout('free')}
                    data-testid="button-free"
                  >
                    Start Free
                  </Button>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <ul className="space-y-2.5 text-sm">
                    {freeFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* All-Access Tier - Popular */}
              <Card 
                className="relative border-2 border-[#C8A661] shadow-lg"
                data-testid="card-all-access"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#C8A661] text-white border-0 px-3">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="mx-auto mb-3 p-2.5 rounded-lg bg-[#C8A661]/20 w-fit">
                    <Sparkles className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <CardTitle className="text-xl">All-Access</CardTitle>
                  <p className="text-sm text-muted-foreground">Complete toolkit</p>
                  
                  <div className="my-4">
                    <span className="text-4xl font-bold">
                      ${isAnnual ? annualMonthly : monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                    {isAnnual && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ${annualTotal}/year (billed annually)
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-[#C8A661] hover:bg-[#B89651] text-white"
                    onClick={() => handleCheckout('business')}
                    disabled={checkoutMutation.isPending}
                    data-testid="button-all-access"
                  >
                    {checkoutMutation.isPending ? "Loading..." : "Get All-Access"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <ul className="space-y-2.5 text-sm">
                    {allAccessFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#C8A661] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Enterprise Tier */}
              <Card className="relative" data-testid="card-enterprise">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 w-fit">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <p className="text-sm text-muted-foreground">For teams & brokers</p>
                  
                  <div className="my-4">
                    <span className="text-4xl font-bold">
                      ${isAnnual ? enterpriseAnnual : enterpriseMonthly}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCheckout('enterprise')}
                    data-testid="button-enterprise"
                  >
                    Contact Sales
                  </Button>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <ul className="space-y-2.5 text-sm">
                    {enterpriseFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <badge.icon className="h-4 w-4" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Simple FAQ */}
        <section className="py-16 bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover-elevate"
                    data-testid={`button-faq-${index}`}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown 
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#0A1628]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-white/70 mb-6">
              Join 73,000+ laundromat professionals using WashBizHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-[#C8A661] hover:bg-[#B89651] text-white"
                  data-testid="button-cta-free"
                >
                  Start Free Today
                </Button>
              </Link>
              <Link href="/cleanbi-explorer">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                  data-testid="button-cta-demo"
                >
                  Try CLEANBI Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
