import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
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

  const tiers = PLATFORM_TIER_ORDER.map(id => PLATFORM_TIERS[id]);
  const freeTier = PLATFORM_TIERS.free;
  const allAccessTier = PLATFORM_TIERS.all_access;

  const getDisplayPrice = (tier: PlatformTierConfig) => {
    if (tier.price === 0) return 0;
    if (isAnnual) {
      return Math.round(tier.priceAnnual / 12);
    }
    return tier.price;
  };

  const annualSavings = allAccessTier.price * 12 - allAccessTier.priceAnnual;
  const monthsFree = Math.round(annualSavings / allAccessTier.price);

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
        { name: "Location Score & Grade", free: true, allAccess: true },
        { name: "Number of Analyses", free: "3 total", allAccess: "Unlimited" },
        { name: "Competitor Count", free: true, allAccess: true },
        { name: "Street View Access", free: true, allAccess: true },
        { name: "Bulk Analysis", free: false, allAccess: true },
        { name: "Drive-Time Catchment Maps", free: false, allAccess: true },
        { name: "Monte Carlo Simulations", free: false, allAccess: true },
      ]
    },
    { 
      category: "Tools & Calculators",
      icon: Calculator,
      features: [
        { name: "Basic Calculator Preview", free: true, allAccess: true },
        { name: "Full Calculator Suite (50+ tools)", free: false, allAccess: true },
        { name: "ROI & Valuation Calculators", free: false, allAccess: true },
        { name: "Due Diligence Toolkit", free: false, allAccess: true },
        { name: "AI Business Plan Generator", free: false, allAccess: true },
        { name: "Website Builder", free: false, allAccess: true },
      ]
    },
    { 
      category: "Learning & Resources",
      icon: BookOpen,
      features: [
        { name: "Blog & Help Center", free: true, allAccess: true },
        { name: "Complete Book Access", free: false, allAccess: true },
        { name: "All Courses & Training", free: false, allAccess: true },
        { name: "Premium Templates", free: false, allAccess: true },
      ]
    },
    { 
      category: "Community & Marketplace",
      icon: Users,
      features: [
        { name: "Browse Marketplace Listings", free: true, allAccess: true },
        { name: "Read Forum Discussions", free: true, allAccess: true },
        { name: "View Funding Directory", free: true, allAccess: true },
        { name: "Forum Posting & Replies", free: false, allAccess: true },
        { name: "Create Marketplace Listings", free: false, allAccess: true },
        { name: "Lead Access & Messaging", free: false, allAccess: true },
      ]
    },
    { 
      category: "Design & Operations",
      icon: LayoutGrid,
      features: [
        { name: "Design Studio (2D/3D)", free: false, allAccess: true },
        { name: "Service Guy AI Diagnostics", free: false, allAccess: true },
        { name: "White-Label Reports", free: false, allAccess: true },
        { name: "API Access (Unlimited)", free: false, allAccess: true },
        { name: "Team Collaboration (5 seats)", free: false, allAccess: true },
      ]
    },
    { 
      category: "Support",
      icon: MessageSquare,
      features: [
        { name: "Email Support", free: "Community", allAccess: "Priority" },
        { name: "Phone Support", free: false, allAccess: true },
      ]
    },
  ];

  const pricingFaqs = [
    {
      question: "What is CLEANBI?",
      answer: "CLEANBI is our proprietary AI-powered location intelligence system that scores any address for laundromat investment potential. It analyzes 6 key factors: Competition, Location, Equipment, Accessibility, Neighborhood, and Business metrics to give you a comprehensive grade."
    },
    {
      question: "What's included in All-Access?",
      answer: "Everything! Unlimited CLEANBI analyses, all 50+ calculators, complete book & courses, Design Studio with 2D/3D floor plans, Service Guy AI diagnostics, forum access, marketplace features, AI tools, bulk analysis, API access, and priority support. One membership, zero limitations."
    },
    {
      question: "How much do I save with annual billing?",
      answer: "Annual billing gives you 2 months free! Instead of paying $129/month ($1,548/year), you pay just $1,290/year - saving you $258 annually."
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
    "description": "AI-powered laundromat business intelligence platform. Choose Free or All-Access membership.",
    "numberOfItems": 2,
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
    return "/consultation";
  };

  return (
    <>
      <SEO 
        title="Simple Pricing - One Plan, Everything Included | WashBizHub"
        description="One simple plan. Everything included. Free: 3 CLEANBI analyses. All-Access: $129/mo or $1,290/yr for unlimited analyses, 50+ calculators, courses, Design Studio, and more. 30-day money-back guarantee."
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
          "laundromat design studio"
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
                One Simple Plan.{" "}
                <span className="text-[#C8A661]">Everything Included.</span>
              </h1>
              
              <p 
                className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed"
                data-testid="text-pricing-subtitle"
              >
                No confusing tiers. No hidden features. Get complete access to every tool, 
                calculator, course, and resource for one simple price.
              </p>

              {/* Social proof stats */}
              <div 
                className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm sm:text-base text-white/70 mb-10"
                aria-label="Platform statistics"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#C8A661]" aria-hidden="true" />
                  <span>72K+ members</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#C8A661]" aria-hidden="true" />
                  <span>2M+ analyses run</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#C8A661]" aria-hidden="true" />
                  <span>4.8/5 rating</span>
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Free Tier */}
              <Card 
                className="relative bg-card border shadow-sm"
                data-testid="card-plan-free"
              >
                <div className="h-1 bg-muted" />
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="mx-auto mb-4 p-3 rounded-lg bg-muted w-fit">
                    <Gift className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Free
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Try it out - no credit card required
                  </CardDescription>
                  
                  <div className="my-6">
                    <span className="text-5xl font-bold text-foreground">$0</span>
                  </div>
                  
                  <Link href="/signup">
                    <Button 
                      variant="outline"
                      className="w-full border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white"
                      data-testid="button-cta-free"
                    >
                      Start Free
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardHeader>
                
                <CardContent className="pt-4 pb-8">
                  <p className="text-sm text-muted-foreground mb-4 text-center">What's included:</p>
                  <ul className="space-y-3">
                    {[
                      "3 CLEANBI location analyses",
                      "Browse marketplace listings",
                      "Read forum discussions",
                      "View funding directory",
                      "Blog & help center access",
                      "Basic calculator previews",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* All-Access Tier */}
              <Card 
                className="relative bg-card border-2 border-[#C8A661] shadow-lg"
                data-testid="card-plan-all-access"
              >
                <div className="h-2 bg-[#C8A661]" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-[#C8A661] text-[#0A1628] shadow-lg px-4 py-1 font-semibold">
                    <Star className="h-3 w-3 mr-1.5" />
                    BEST VALUE
                  </Badge>
                </div>
                
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="mx-auto mb-4 p-3 rounded-lg bg-gradient-to-br from-[#C8A661] to-[#8B7355] w-fit">
                    <Crown className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    All-Access
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Complete access to everything
                  </CardDescription>
                  
                  <div className="my-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-[#C8A661]">
                        ${getDisplayPrice(allAccessTier)}
                      </span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    {isAnnual && (
                      <div className="mt-2 space-y-1">
                        <span className="text-sm text-muted-foreground line-through">
                          ${allAccessTier.price}/mo
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Billed ${allAccessTier.priceAnnual.toLocaleString()}/year
                        </p>
                        <Badge variant="secondary" className="bg-[#C8A661]/10 text-[#C8A661]">
                          Save ${annualSavings} per year
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <Link href="/subscribe?plan=all_access">
                    <Button 
                      className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                      data-testid="button-cta-all-access"
                    >
                      Get All-Access
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardHeader>
                
                <CardContent className="pt-4 pb-8">
                  <p className="text-sm text-muted-foreground mb-4 text-center">Everything in Free, plus:</p>
                  <ul className="space-y-3">
                    {[
                      { text: "Unlimited CLEANBI analyses", highlight: true },
                      { text: "Full Calculator Suite (50+ tools)", highlight: true },
                      { text: "Complete Book & All Courses", highlight: true },
                      { text: "Design Studio (2D/3D floor plans)", highlight: true },
                      { text: "Service Guy AI diagnostics", highlight: false },
                      { text: "Forum posting & community", highlight: false },
                      { text: "Marketplace listing & leads", highlight: false },
                      { text: "AI Business Plan Generator", highlight: false },
                      { text: "Due Diligence Toolkit", highlight: false },
                      { text: "Monte Carlo simulations", highlight: false },
                      { text: "API access (unlimited)", highlight: false },
                      { text: "Priority email & phone support", highlight: false },
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-[#C8A661]' : 'text-green-600'}`} />
                        <span className={`text-sm ${feature.highlight ? 'font-medium text-foreground' : 'text-foreground'}`}>
                          {feature.text}
                        </span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CONSULTING_ADDONS.map((addon) => {
                const Icon = addon.icon;
                return (
                  <Card 
                    key={addon.id}
                    className={`relative bg-card border shadow-sm overflow-hidden ${addon.popular ? 'border-[#C8A661] border-2' : ''}`}
                    data-testid={`card-consulting-${addon.id}`}
                  >
                    <div className={`h-1 ${addon.popular ? 'bg-[#C8A661]' : 'bg-muted'}`} />
                    {addon.popular && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-[#C8A661] text-[#0A1628] text-xs">
                          POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    <CardContent className="p-6">
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
                      
                      <ul className="space-y-2 mb-6">
                        {addon.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
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
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 border-b">
                <div className="font-medium text-foreground">Feature</div>
                <div className="text-center font-medium text-foreground">Free</div>
                <div className="text-center font-medium text-[#C8A661]">All-Access</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y">
                {comparisonFeatures.map((category, catIdx) => (
                  <div key={catIdx}>
                    {/* Category Header */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <category.icon className="h-4 w-4 text-[#C8A661]" />
                        {category.category}
                      </div>
                      <div></div>
                      <div></div>
                    </div>
                    
                    {/* Category Features */}
                    {category.features.map((feature, featIdx) => (
                      <div 
                        key={featIdx} 
                        className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-muted/20 transition-colors"
                      >
                        <div className="text-sm text-foreground">{feature.name}</div>
                        <div className="flex justify-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40" />
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">{feature.free}</span>
                          )}
                        </div>
                        <div className="flex justify-center">
                          {typeof feature.allAccess === 'boolean' ? (
                            feature.allAccess ? (
                              <Check className="h-5 w-5 text-[#C8A661]" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-[#C8A661]">{feature.allAccess}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Table Footer CTAs */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-muted/50 border-t">
                <div></div>
                <div className="flex justify-center">
                  <Link href="/signup">
                    <Button variant="outline" size="sm" data-testid="button-compare-free">
                      Start Free
                    </Button>
                  </Link>
                </div>
                <div className="flex justify-center">
                  <Link href="/subscribe?plan=all_access">
                    <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-compare-all-access">
                      Get All-Access
                    </Button>
                  </Link>
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
                Trusted by 72,000+ Professionals
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
              Join 72,000+ investors, operators, and brokers using WashBizHub to make smarter decisions.
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
              <Link href="/subscribe?plan=all_access">
                <Button 
                  size="lg"
                  className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold min-w-[180px]"
                  data-testid="button-cta-final-all-access"
                >
                  Get All-Access
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
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
