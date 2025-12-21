import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  PLATFORM_TIERS, 
  PLATFORM_TIER_ORDER, 
  PLATFORM_PRICING_FAQS,
  CONSULTING_ADDONS,
  getSavingsPercent,
  type PlatformTierConfig,
  type ConsultingAddon
} from "@/lib/tier-config";
import {
  Check,
  Star,
  Crown,
  Gift,
  X,
  Map,
  Calculator,
  Shield,
  CreditCard,
  RefreshCw,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Quote,
  BookOpen,
  Wrench,
  LayoutGrid,
  MessageSquare,
  Target,
  Phone,
  Briefcase
} from "lucide-react";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { toast } = useToast();

  const tiers = PLATFORM_TIER_ORDER.map(id => PLATFORM_TIERS[id]);
  const freeTier = PLATFORM_TIERS.free;
  const proTier = PLATFORM_TIERS.pro;
  const businessTier = PLATFORM_TIERS.business;
  const enterpriseTier = PLATFORM_TIERS.enterprise;

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
      window.location.href = '/sign-up';
      return;
    }
    checkoutMutation.mutate(tierId);
  };

  const getDisplayPrice = (tier: PlatformTierConfig) => {
    if (tier.price === 0) return 0;
    if (isAnnual) {
      return Math.round(tier.priceAnnual / 12);
    }
    return tier.price;
  };

  const annualSavings = businessTier.price * 12 - businessTier.priceAnnual;
  const monthsFree = Math.round(annualSavings / businessTier.price);

  const testimonials = [
    {
      name: "David Rodriguez",
      role: "Multi-Unit Owner, Texas",
      quote: "CLEANBI helped me find 3 acquisition targets in under a week. The location scoring predicted revenue within 8% of actual numbers. The All-Access membership pays for itself every month.",
      rating: 5,
      avatar: "DR"
    },
    {
      name: "Sarah Thompson",
      role: "Laundromat Broker, California",
      quote: "Having everything in one membership is a game-changer. The Monte Carlo simulations and Design Studio have transformed how I present deals to buyers. My close rate is up 40%.",
      rating: 5,
      avatar: "ST"
    },
    {
      name: "Marcus Williams",
      role: "First-Time Buyer, Florida",
      quote: "Started with the free trial and upgraded to All-Access within a week. The calculators, courses, and CLEANBI reports gave me the confidence to buy my first laundromat.",
      rating: 5,
      avatar: "MW"
    }
  ];

  const trustBadges = [
    { icon: Shield, label: "256-bit SSL Encryption", sublabel: "Bank-level security" },
    { icon: CreditCard, label: "Secure Stripe Payments", sublabel: "PCI compliant" },
    { icon: RefreshCw, label: "30-Day Money Back", sublabel: "No questions asked" },
    { icon: Clock, label: "Cancel Anytime", sublabel: "No long-term contracts" }
  ];

  const comparisonFeatures = [
    { 
      category: "CLEANBI Analysis",
      icon: Map,
      features: [
        { name: "Location Score & Grade", free: true, pro: true, business: true, enterprise: true },
        { name: "Number of Analyses", free: "3 total", pro: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
        { name: "Competitor Count", free: true, pro: true, business: true, enterprise: true },
        { name: "Street View Access", free: true, pro: true, business: true, enterprise: true },
        { name: "Bulk Analysis", free: false, pro: false, business: true, enterprise: true },
        { name: "Drive-Time Catchment Maps", free: false, pro: false, business: false, enterprise: true },
        { name: "Monte Carlo Simulations", free: false, pro: false, business: true, enterprise: true },
        { name: "API Access", free: false, pro: false, business: false, enterprise: "Unlimited" },
      ]
    },
    { 
      category: "Tools & Calculators",
      icon: Calculator,
      features: [
        { name: "Basic Calculator Preview", free: true, pro: true, business: true, enterprise: true },
        { name: "Full Calculator Suite (50+ tools)", free: false, pro: true, business: true, enterprise: true },
        { name: "ROI & Valuation Calculators", free: false, pro: true, business: true, enterprise: true },
        { name: "Due Diligence Toolkit", free: false, pro: false, business: true, enterprise: true },
        { name: "AI Business Plan Generator", free: false, pro: false, business: true, enterprise: true },
        { name: "Website Builder", free: false, pro: false, business: true, enterprise: true },
        { name: "White-Label Reports", free: false, pro: false, business: false, enterprise: true },
      ]
    },
    { 
      category: "Learning & Resources",
      icon: BookOpen,
      features: [
        { name: "Blog & Help Center", free: true, pro: true, business: true, enterprise: true },
        { name: "Complete Book Access", free: false, pro: false, business: true, enterprise: true },
        { name: "All Courses & Training", free: false, pro: false, business: true, enterprise: true },
        { name: "Template Vault Access", free: "Preview Only", pro: "5 templates", business: "All templates", enterprise: "All templates" },
        { name: "AI Business Plan Generator", free: false, pro: false, business: true, enterprise: true },
        { name: "Lease Red Flag Checklist (50+)", free: "7 alerts", pro: true, business: true, enterprise: true },
        { name: "Due Diligence Checklist", free: false, pro: false, business: true, enterprise: true },
        { name: "LOI & Legal Templates", free: false, pro: false, business: true, enterprise: true },
      ]
    },
    { 
      category: "Community & Marketplace",
      icon: Users,
      features: [
        { name: "Browse Marketplace Listings", free: true, pro: true, business: true, enterprise: true },
        { name: "Read Forum Discussions", free: true, pro: true, business: true, enterprise: true },
        { name: "View Funding Directory", free: true, pro: true, business: true, enterprise: true },
        { name: "Forum Posting & Replies", free: false, pro: true, business: true, enterprise: true },
        { name: "Create Marketplace Listings", free: false, pro: true, business: true, enterprise: true },
        { name: "Lead Access & Messaging", free: false, pro: true, business: true, enterprise: true },
      ]
    },
    { 
      category: "Design & Operations",
      icon: LayoutGrid,
      features: [
        { name: "Design Studio (2D/3D)", free: false, pro: false, business: true, enterprise: true },
        { name: "Service Guy AI Diagnostics", free: false, pro: false, business: true, enterprise: true },
        { name: "POS Command Center", free: false, pro: false, business: true, enterprise: true },
        { name: "Multi-Location Management", free: false, pro: false, business: false, enterprise: true },
        { name: "Team Collaboration", free: false, pro: false, business: "3 seats", enterprise: "10 seats" },
      ]
    },
    { 
      category: "Support",
      icon: MessageSquare,
      features: [
        { name: "Email Support", free: "Community", pro: "Standard", business: "Priority", enterprise: "Dedicated" },
        { name: "Phone Support", free: false, pro: false, business: true, enterprise: true },
        { name: "Dedicated Account Manager", free: false, pro: false, business: false, enterprise: true },
      ]
    },
  ];

  const pricingFaqs = [
    {
      question: "What is CLEANBI?",
      answer: "CLEANBI is our proprietary AI-powered location intelligence system that scores any address for laundromat investment potential. It analyzes 17 key factors including Competition, Location, Equipment, Accessibility, Neighborhood, and Business metrics to give you a comprehensive grade."
    },
    {
      question: "Which plan is right for me?",
      answer: "Free: Perfect for exploring with 3 CLEANBI analyses. Pro ($49/mo): Best for serious buyers who need unlimited analyses and calculators. Business ($149/mo): Ideal for operators who want courses, AI tools, POS, and Service Guy AI. Enterprise ($299/mo): For multi-unit owners and brokers needing API access, white-label reports, and team collaboration."
    },
    {
      question: "How much do I save with annual billing?",
      answer: "Annual billing saves you 2 months! Pro: $490/yr instead of $588. Business: $1,490/yr instead of $1,788. Enterprise: $2,990/yr instead of $3,588."
    },
    {
      question: "Do I need a credit card to start?",
      answer: "No credit card is needed for the Free tier - just sign up and start analyzing locations immediately with 3 free CLEANBI analyses."
    },
    {
      question: "What is the money-back guarantee?",
      answer: "All paid plans include a 30-day money-back guarantee. If you're not completely satisfied within the first 30 days, contact us for a full refund - no questions asked."
    },
    {
      question: "What are consulting add-ons?",
      answer: "Our consulting add-ons provide personalized, human expert guidance on top of your membership. Strategy Sessions ($750) are 90-min deep dives. Monthly Advisory ($1,500/mo) gives you ongoing access to an expert. White-Glove Service ($5,000+) provides full acquisition support from search to close."
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processing."
    }
  ];

  const productOffers = tiers.map(tier => ({
    name: `WashBizHub ${tier.name} Plan`,
    description: tier.description,
    price: tier.price.toString(),
    priceCurrency: "USD",
    availability: "InStock" as const,
    priceValidUntil: "2026-12-31"
  }));

  const offerCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "name": "WashBizHub Pricing Plans",
    "description": "AI-powered laundromat business intelligence platform. Choose Free, Pro, Business, or Enterprise membership.",
    "numberOfItems": 4,
    "itemListElement": [
      {
        "@type": "Offer",
        "position": 1,
        "itemOffered": {
          "@type": "SoftwareApplication",
          "name": "WashBizHub Free",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "description": "3 free CLEANBI analyses, browse marketplace, read forum"
        },
        "price": 0,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://washbizhub.com/pricing"
      },
      {
        "@type": "Offer",
        "position": 2,
        "itemOffered": {
          "@type": "SoftwareApplication",
          "name": "WashBizHub All-Access",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "description": "Complete access to every tool, feature, and resource - unlimited CLEANBI, calculators, courses, Design Studio, and more"
        },
        "price": 129,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": 129,
          "priceCurrency": "USD",
          "unitCode": "MON",
          "unitText": "month"
        },
        "availability": "https://schema.org/InStock",
        "url": "https://washbizhub.com/pricing"
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "WashBizHub Laundromat Intelligence Platform",
    "serviceType": "Business Intelligence Software",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com"
    },
    "description": "Complete laundromat business intelligence platform with CLEANBI location scoring, 50+ calculators, courses, Design Studio, and expert consulting services.",
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "WashBizHub Pricing Tiers",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Free" }, "price": 0, "priceCurrency": "USD" },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "All-Access" }, "price": 129, "priceCurrency": "USD" }
      ]
    }
  };

  const speakableContent = [
    "WashBizHub pricing is simple: Free includes 3 CLEANBI analyses. All-Access is $129 per month or $1,290 per year and includes everything - unlimited analyses, 50+ calculators, courses, Design Studio, and priority support.",
    "All paid plans include a 30-day money-back guarantee. Annual billing saves you 2 months free."
  ];

  const getConsultingPriceDisplay = (addon: ConsultingAddon) => {
    if (addon.priceType === 'one-time') return `$${addon.price.toLocaleString()}`;
    if (addon.priceType === 'monthly') return `$${addon.price.toLocaleString()}/mo`;
    return `$${addon.price.toLocaleString()}+`;
  };

  const getConsultingCTALink = (addon: ConsultingAddon) => {
    const subject = encodeURIComponent(`${addon.name} Inquiry - WashBizHub`);
    const body = encodeURIComponent(`Hi WashBizHub Team,\n\nI'm interested in learning more about the ${addon.name} service.\n\nPlease contact me to discuss how this can help with my laundromat investment journey.\n\nBest regards`);
    return `mailto:consult@washbizhub.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <SEO 
        title="Pricing Plans That Grow With You | WashBizHub"
        description="Start free, then upgrade as your business grows. Free: 3 CLEANBI analyses + template previews. Pro: unlimited analyses + 5 templates. Business: full Template Vault, AI Business Plan, Design Studio, POS. 30-day money-back guarantee."
        canonicalUrl="/pricing"
        ogType="website"
        keywords={[
          "WashBizHub pricing",
          "laundromat software pricing",
          "CLEANBI pricing",
          "laundromat investment tools",
          "laundromat calculators",
          "laundromat courses",
          "laundromat business intelligence",
          "laundromat location analysis",
          "ROI calculator laundromat",
          "laundromat valuation software",
          "laundromat consulting",
          "laundromat design studio",
          "laundromat business plan template",
          "laundromat due diligence checklist",
          "laundromat lease checklist",
          "laundromat LOI template",
          "laundromat template vault"
        ]}
        faqs={pricingFaqs}
        productOffers={productOffers}
        speakableContent={speakableContent}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" }
        ]}
        structuredData={[offerCatalogSchema, serviceSchema]}
        aggregateRating={{
          itemName: "WashBizHub Platform",
          itemType: "SoftwareApplication",
          itemDescription: "Complete laundromat business intelligence platform with CLEANBI location scoring, analytics, ROI calculators, and investment tools",
          ratingValue: 4.8,
          reviewCount: 4291,
          bestRating: 5,
          worstRating: 1,
          reviews: [
            {
              author: "David Rodriguez",
              authorType: "Person",
              datePublished: "2025-10-20",
              reviewBody: "CLEANBI helped me find 3 acquisition targets in under a week. The All-Access membership pays for itself every month with the insights I get.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Sarah Thompson",
              authorType: "Person",
              datePublished: "2025-09-15",
              reviewBody: "Having everything in one membership is a game-changer. The Monte Carlo simulations and Design Studio have transformed how I present deals.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Marcus Williams",
              authorType: "Person",
              datePublished: "2025-11-08",
              reviewBody: "Started with the free trial and upgraded within a week. The calculators, courses, and CLEANBI reports gave me confidence to buy my first laundromat.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            }
          ]
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section 
          className="relative py-16 sm:py-20 lg:py-28 overflow-hidden bg-[#0A1628]"
          aria-labelledby="pricing-hero-title"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge 
                className="mb-6 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/40"
                data-testid="badge-pricing-header"
              >
                <Sparkles className="h-3 w-3 mr-1.5" aria-hidden="true" />
                Simple, Transparent Pricing
              </Badge>
              
              <h1 
                id="pricing-hero-title"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
                data-testid="text-pricing-title"
              >
                Plans That{" "}
                <span className="text-[#C8A661]">Grow With You.</span>
              </h1>
              
              <p 
                className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed"
                data-testid="text-pricing-subtitle"
              >
                Start free, then upgrade as your laundromat business grows. 
                Transparent pricing with no hidden fees.
              </p>

              {/* Social proof stats */}
              <div 
                className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm sm:text-base text-white/70 mb-10"
                aria-label="Platform statistics"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#C8A661]" aria-hidden="true" />
                  <span>73K+ members</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#C8A661]" aria-hidden="true" />
                  <span>2M+ analyses run</span>
                </div>
              </div>

              {/* Annual/Monthly Toggle */}
              <div 
                className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20"
                role="group"
                aria-label="Billing cycle selector"
              >
                <span 
                  className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-white/60'}`}
                  id="monthly-label"
                >
                  Monthly
                </span>
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  aria-labelledby="annual-label monthly-label"
                  data-testid="switch-billing-toggle"
                  className="data-[state=checked]:bg-[#C8A661]"
                />
                <span 
                  className={`text-sm font-medium transition-colors ${isAnnual ? 'text-white' : 'text-white/60'}`}
                  id="annual-label"
                >
                  Annual
                </span>
                {isAnnual && (
                  <Badge className="bg-[#C8A661] text-[#0A1628] font-semibold">
                    {monthsFree} Months FREE
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section 
          className="relative py-16 sm:py-20 bg-muted/30"
          aria-labelledby="pricing-plans-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              
              {/* Free Tier */}
              <Card 
                className="relative bg-card border shadow-sm"
                data-testid="card-plan-free"
              >
                <div className="h-1 bg-muted" />
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto mb-3 p-2.5 rounded-lg bg-muted w-fit">
                    <Gift className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Free</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Get started</CardDescription>
                  
                  <div className="my-4">
                    <span className="text-4xl font-bold text-foreground">$0</span>
                  </div>
                  
                  <Link href="/signup">
                    <Button 
                      variant="outline"
                      className="w-full"
                      data-testid="button-cta-free"
                    >
                      Start Free
                    </Button>
                  </Link>
                </CardHeader>
                
                <CardContent className="pt-2 pb-6">
                  <ul className="space-y-2 text-sm">
                    {["3 CLEANBI analyses", "Template previews", "7 Lease Red Flags", "Browse marketplace", "Blog access"].map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Pro Tier */}
              <Card 
                className="relative bg-card border shadow-sm"
                data-testid="card-plan-pro"
              >
                <div className="h-1 bg-blue-500" />
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto mb-3 p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 w-fit">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Pro</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">For serious buyers</CardDescription>
                  
                  <div className="my-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-blue-600">${getDisplayPrice(proTier)}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    {isAnnual && (
                      <p className="text-xs text-muted-foreground mt-1">Billed ${proTier.priceAnnual}/year</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                    data-testid="button-cta-pro"
                    onClick={() => handleCheckout('pro')}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? 'Loading...' : 'Go Pro'}
                  </Button>
                </CardHeader>
                
                <CardContent className="pt-2 pb-6">
                  <p className="text-xs text-muted-foreground mb-2">Everything in Free, plus:</p>
                  <ul className="space-y-2 text-sm">
                    {["Unlimited CLEANBI", "Full Calculator Suite", "5 Template Vault items", "50+ Lease Red Flags", "Export to PDF"].map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Business Tier - Most Popular */}
              <Card 
                className="relative bg-card border-2 border-[#C8A661] shadow-lg"
                data-testid="card-plan-business"
              >
                <div className="h-2 bg-[#C8A661]" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-[#C8A661] text-[#0A1628] shadow-lg px-3 py-0.5 text-xs font-semibold">
                    MOST POPULAR
                  </Badge>
                </div>
                
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto mb-3 p-2.5 rounded-lg bg-[#C8A661]/20 w-fit">
                    <Star className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Business</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">For operators</CardDescription>
                  
                  <div className="my-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-[#C8A661]">${getDisplayPrice(businessTier)}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    {isAnnual && (
                      <p className="text-xs text-muted-foreground mt-1">Billed ${businessTier.priceAnnual.toLocaleString()}/year</p>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                    data-testid="button-cta-business"
                    onClick={() => handleCheckout('business')}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? 'Loading...' : 'Get Business'}
                  </Button>
                </CardHeader>
                
                <CardContent className="pt-2 pb-6">
                  <p className="text-xs text-muted-foreground mb-2">Everything in Pro, plus:</p>
                  <ul className="space-y-2 text-sm">
                    {["Full Template Vault", "AI Business Plan", "Book & All Courses", "Service Guy AI", "Design Studio", "POS System"].map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#C8A661] shrink-0 mt-0.5" />
                        <span className="text-foreground font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Enterprise Tier */}
              <Card 
                className="relative bg-card border shadow-sm"
                data-testid="card-plan-enterprise"
              >
                <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto mb-3 p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 w-fit">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Enterprise</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Multi-unit & brokers</CardDescription>
                  
                  <div className="my-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-purple-600">${getDisplayPrice(enterpriseTier)}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    {isAnnual && (
                      <p className="text-xs text-muted-foreground mt-1">Billed ${enterpriseTier.priceAnnual.toLocaleString()}/year</p>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    data-testid="button-cta-enterprise"
                    onClick={() => handleCheckout('enterprise')}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? 'Loading...' : 'Get Enterprise Access'}
                  </Button>
                </CardHeader>
                
                <CardContent className="pt-2 pb-6">
                  <p className="text-xs text-muted-foreground mb-2">Everything in Business, plus:</p>
                  <ul className="space-y-2 text-sm">
                    {["Templates + White-label", "Unlimited API access", "Team (10 seats)", "Custom integrations", "Dedicated manager", "Priority phone support"].map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustBadges.map((badge, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 bg-card border rounded-lg"
                  data-testid={`badge-trust-${index}`}
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <badge.icon className="h-5 w-5 text-[#0A1628]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{badge.label}</p>
                    <p className="text-xs text-muted-foreground">{badge.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expert Consulting Section */}
        <section 
          className="py-16 sm:py-20 bg-background"
          aria-labelledby="consulting-section-title"
          id="consulting"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Briefcase className="w-3 h-3 mr-1.5" />
                Expert Consulting
              </Badge>
              <h2 id="consulting-section-title" className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Need Hands-On Expert Guidance?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our consulting add-ons pair you with industry experts for personalized strategy, 
                deal support, and acquisition assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {CONSULTING_ADDONS.map((addon) => {
                const Icon = addon.icon;
                return (
                  <Card 
                    key={addon.id}
                    className={`relative bg-card border shadow-sm overflow-hidden flex flex-col h-full ${addon.popular ? 'border-[#C8A661] border-2' : ''}`}
                    data-testid={`card-consulting-${addon.id}`}
                  >
                    <div className={`h-1 ${addon.popular ? 'bg-[#C8A661]' : 'bg-muted'}`} />
                    {addon.popular && (
                      <div className="absolute top-2 right-4 z-10">
                        <Badge className="bg-[#C8A661] text-[#0A1628] text-xs font-semibold">
                          POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`h-12 w-12 rounded-lg ${addon.iconBg} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-6 w-6 ${addon.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{addon.name}</h3>
                          <p className="text-sm text-muted-foreground">{addon.tagline}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-[#C8A661]">
                          {getConsultingPriceDisplay(addon)}
                        </span>
                        {addon.priceType === 'one-time' && (
                          <span className="text-sm text-muted-foreground ml-2">one-time</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {addon.description}
                      </p>
                      
                      <ul className="space-y-2 mb-6 flex-1">
                        {addon.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-auto">
                        <Link href={getConsultingCTALink(addon)}>
                          <Button 
                            className={`w-full ${
                              addon.popular 
                                ? 'bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]' 
                                : 'bg-[#0A1628] hover:bg-[#1a3a5c] text-white'
                            }`}
                            data-testid={`button-cta-consulting-${addon.id}`}
                          >
                            {addon.cta}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section 
          className="py-16 sm:py-20 bg-muted/30"
          aria-labelledby="comparison-title"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Calculator className="w-3 h-3 mr-1.5" />
                Feature Comparison
              </Badge>
              <h2 id="comparison-title" className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Compare Plans
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See exactly what's included in each plan
              </p>
            </div>

            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-2 p-4 bg-muted/50 border-b text-xs sm:text-sm">
                <div className="font-medium text-foreground">Feature</div>
                <div className="text-center font-medium text-foreground">Free</div>
                <div className="text-center font-medium text-blue-600">Pro</div>
                <div className="text-center font-medium text-[#C8A661]">Business</div>
                <div className="text-center font-medium text-purple-600">Enterprise</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y">
                {comparisonFeatures.map((category, catIdx) => (
                  <div key={catIdx}>
                    {/* Category Header */}
                    <div className="grid grid-cols-5 gap-2 p-4 bg-muted/30">
                      <div className="flex items-center gap-2 font-semibold text-foreground col-span-5 sm:col-span-1">
                        <category.icon className="h-4 w-4 text-[#C8A661]" />
                        {category.category}
                      </div>
                    </div>
                    
                    {/* Category Features */}
                    {category.features.map((feature, featIdx) => {
                      const renderCell = (value: boolean | string) => {
                        if (typeof value === 'boolean') {
                          return value ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/40" />
                          );
                        }
                        return <span className="text-xs sm:text-sm text-muted-foreground">{value}</span>;
                      };
                      
                      return (
                        <div 
                          key={featIdx} 
                          className="grid grid-cols-5 gap-2 p-3 sm:p-4 items-center hover:bg-muted/20 transition-colors"
                        >
                          <div className="text-xs sm:text-sm text-foreground">{feature.name}</div>
                          <div className="flex justify-center">{renderCell(feature.free)}</div>
                          <div className="flex justify-center">{renderCell(feature.pro)}</div>
                          <div className="flex justify-center">{renderCell(feature.business)}</div>
                          <div className="flex justify-center">{renderCell(feature.enterprise)}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              {/* Table Footer CTAs */}
              <div className="grid grid-cols-5 gap-2 p-4 sm:p-6 bg-muted/50 border-t">
                <div></div>
                <div className="flex justify-center">
                  <Link href="/signup">
                    <Button variant="outline" size="sm" className="text-xs px-2" data-testid="button-compare-free">
                      Free
                    </Button>
                  </Link>
                </div>
                <div className="flex justify-center">
                  <Button size="sm" variant="outline" className="text-xs px-2 border-blue-500 text-blue-600" data-testid="button-compare-pro" onClick={() => handleCheckout('pro')} disabled={checkoutMutation.isPending}>
                    Pro
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button size="sm" className="text-xs px-2 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-compare-business" onClick={() => handleCheckout('business')} disabled={checkoutMutation.isPending}>
                    Business
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button size="sm" className="text-xs px-2 bg-purple-600 hover:bg-purple-700 text-white" data-testid="button-compare-enterprise" onClick={() => handleCheckout('enterprise')} disabled={checkoutMutation.isPending}>
                    Enterprise
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section 
          className="py-16 sm:py-20 bg-background"
          aria-labelledby="testimonials-title"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Quote className="w-3 h-3 mr-1.5" />
                Member Stories
              </Badge>
              <h2 id="testimonials-title" className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Trusted by 73,000+ Professionals
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See what our members say about WashBizHub
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index}
                  className="bg-card border shadow-sm overflow-hidden"
                  data-testid={`card-testimonial-${index}`}
                >
                  <div className="h-1 bg-[#C8A661]" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#C8A661] text-[#C8A661]" />
                      ))}
                    </div>
                    <blockquote className="text-foreground mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section 
          className="py-16 sm:py-20 bg-muted/30"
          aria-labelledby="faq-title"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <MessageSquare className="w-3 h-3 mr-1.5" />
                FAQs
              </Badge>
              <h2 id="faq-title" className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {pricingFaqs.map((faq, index) => (
                <Card 
                  key={index}
                  className="bg-card border shadow-sm overflow-hidden"
                  data-testid={`card-faq-${index}`}
                >
                  <button
                    className="w-full p-4 flex items-center justify-between text-left"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                    data-testid={`button-faq-${index}`}
                  >
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    <ChevronDown 
                      className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section 
          className="py-16 sm:py-20 bg-[#0A1628]"
          aria-labelledby="final-cta-title"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="final-cta-title" className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Accelerate Your Laundromat Journey?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join 73,000+ investors, operators, and brokers using WashBizHub to make smarter decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 min-w-[180px]"
                  data-testid="button-cta-final-free"
                >
                  Start Free
                </Button>
              </Link>
              <Button 
                size="lg"
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold min-w-[180px]"
                data-testid="button-cta-final-business"
                onClick={() => handleCheckout('business')}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? 'Loading...' : 'Get Business Plan'}
                {!checkoutMutation.isPending && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
            
            <p className="text-sm text-white/60 mt-6">
              30-day money-back guarantee • Cancel anytime • No credit card for Free tier
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
