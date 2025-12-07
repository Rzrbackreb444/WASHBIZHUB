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
  LISTING_TIERS,
  LISTING_TIER_ORDER,
  getSavingsPercent,
  type PlatformTierConfig,
  type ListingTierConfig
} from "@/lib/tier-config";
import {
  Check,
  Star,
  Zap,
  Crown,
  Gift,
  X,
  Map,
  Building2,
  Eye,
  Lock,
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
  Store,
  Wrench
} from "lucide-react";
import { VisibilityAddOnsSection } from "@/components/VisibilityAddOnsSection";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const tiers = PLATFORM_TIER_ORDER.map(id => PLATFORM_TIERS[id]);

  const getDisplayPrice = (tier: PlatformTierConfig) => {
    if (tier.price === 0) return 0;
    if (isAnnual) {
      return Math.round(tier.priceAnnual / 12);
    }
    return tier.price;
  };

  const testimonials = [
    {
      name: "David Rodriguez",
      role: "Multi-Unit Owner, Texas",
      quote: "CLEANBI helped me find 3 acquisition targets in under a week. The location scoring is incredibly accurate - it predicted revenue within 8% of actual numbers.",
      rating: 5,
      avatar: "DR"
    },
    {
      name: "Sarah Thompson",
      role: "Laundromat Broker, California",
      quote: "The Pro plan's Monte Carlo simulations have transformed how I present deals to buyers. My close rate went up 40% after adding these reports to my listings.",
      rating: 5,
      avatar: "ST"
    },
    {
      name: "Marcus Williams",
      role: "Private Equity, Florida",
      quote: "Enterprise gives us the ownership data and motivated seller detection we need. We've acquired 12 laundromats in 18 months using WashBizHub's intelligence.",
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
      category: "Core Analysis",
      icon: Map,
      features: [
        { name: "CLEANBI Score & Grade", free: true, starter: true, pro: true, enterprise: true },
        { name: "Location Analyses", free: "3 total", starter: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Competitor Count", free: true, starter: true, pro: true, enterprise: true },
        { name: "Street View Access", free: true, starter: true, pro: true, enterprise: true },
        { name: "Save & Share Analyses", free: true, starter: true, pro: true, enterprise: true },
      ]
    },
    { 
      category: "Visual Intelligence",
      icon: Eye,
      features: [
        { name: "3D Aerial Flyover", free: false, starter: true, pro: true, enterprise: true },
        { name: "Competition Heatmap", free: false, starter: true, pro: true, enterprise: true },
        { name: "Walk Score & Transit", free: false, starter: true, pro: true, enterprise: true },
        { name: "Full Category Breakdowns", free: false, starter: true, pro: true, enterprise: true },
        { name: "Export PDF Reports", free: false, starter: true, pro: true, enterprise: true },
      ]
    },
    { 
      category: "Member Benefits",
      icon: Calculator,
      features: [
        { name: "Full Calculator Hub (ROI, Loan, Utility, Labor, Valuation)", free: false, starter: true, pro: true, enterprise: true },
        { name: "Book & Courses Access", free: false, starter: true, pro: true, enterprise: true },
        { name: "AI Business Plan Generator", free: false, starter: true, pro: true, enterprise: true },
        { name: "Premium Templates & Downloads", free: false, starter: true, pro: true, enterprise: true },
        { name: "Forum Posting & Community", free: false, starter: true, pro: true, enterprise: true },
      ]
    },
    { 
      category: "Pro Features",
      icon: TrendingUp,
      features: [
        { name: "Monte Carlo Simulations", free: false, starter: false, pro: true, enterprise: true },
        { name: "Drive-Time Catchment Maps", free: false, starter: false, pro: true, enterprise: true },
        { name: "Due Diligence Toolkit", free: false, starter: false, pro: true, enterprise: true },
        { name: "Website Builder", free: false, starter: false, pro: true, enterprise: true },
        { name: "API Access (500 calls/mo)", free: false, starter: false, pro: true, enterprise: true },
      ]
    },
    { 
      category: "Enterprise Data",
      icon: Building2,
      features: [
        { name: "Ownership & Lien Data", free: false, starter: false, pro: false, enterprise: true },
        { name: "Motivated Seller Score", free: false, starter: false, pro: false, enterprise: true },
        { name: "White-Label Reports", free: false, starter: false, pro: false, enterprise: true },
        { name: "Unlimited API Access", free: false, starter: false, pro: false, enterprise: true },
        { name: "Team Collaboration", free: false, starter: false, pro: false, enterprise: true },
      ]
    },
    { 
      category: "Support",
      icon: Users,
      features: [
        { name: "Email Support", free: "Community", starter: "Priority", pro: "Priority", enterprise: "Dedicated" },
        { name: "Phone Support", free: false, starter: false, pro: true, enterprise: true },
        { name: "Slack Support", free: false, starter: false, pro: false, enterprise: true },
        { name: "Account Manager", free: false, starter: false, pro: false, enterprise: true },
      ]
    },
  ];

  const productOffers = tiers.map(tier => ({
    name: `CLEANBI ${tier.name} Plan`,
    description: tier.description,
    price: tier.price.toString(),
    priceCurrency: "USD",
    availability: "InStock" as const,
    priceValidUntil: "2025-12-31"
  }));

  const offerCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "name": "WashBizHub CLEANBI Pricing Plans",
    "description": "AI-powered location intelligence for laundromat investors. Choose from Free, Starter, Pro, or Enterprise plans.",
    "numberOfItems": tiers.length,
    "itemListElement": tiers.map((tier, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "itemOffered": {
        "@type": "SoftwareApplication",
        "name": `CLEANBI ${tier.name}`,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "description": tier.description
      },
      "price": tier.price,
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": tier.price,
        "priceCurrency": "USD",
        "unitCode": "MON",
        "unitText": "month"
      },
      "availability": "https://schema.org/InStock",
      "url": "https://washbizhub.com/pricing"
    }))
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "CLEANBI Location Intelligence",
    "serviceType": "Business Intelligence Software",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com"
    },
    "description": "AI-powered location scoring and analysis platform for laundromat investors. Analyze demographics, competition, property values, and investment potential for any address.",
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "CLEANBI Pricing Tiers",
      "itemListElement": tiers.map(tier => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `CLEANBI ${tier.name}`
        },
        "price": tier.price,
        "priceCurrency": "USD"
      }))
    }
  };

  const extendedFaqs = [
    ...PLATFORM_PRICING_FAQS,
    {
      question: "Do you offer discounts for annual billing?",
      answer: "Yes! When you choose annual billing, you save up to 17% compared to monthly pricing. For example, the Starter plan is $29/month billed monthly, or $24/month when billed annually ($290/year)."
    },
    {
      question: "What's your money-back guarantee?",
      answer: "All paid plans include a 30-day money-back guarantee. If you're not completely satisfied within your first month, contact us for a full refund - no questions asked. We're confident you'll love WashBizHub."
    },
    {
      question: "Can I switch between plans?",
      answer: "Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately with prorated billing. Downgrades apply at your next billing cycle."
    }
  ];

  const speakableContent = [
    "CLEANBI Explorer pricing starts at free with 3 location analyses. Starter is $29 per month for unlimited analyses and full calculator hub access. Pro is $99 per month with advanced analytics and API access. Enterprise is $699 per month with ownership data and dedicated support.",
    "All paid plans include a 30-day money-back guarantee. Annual billing saves up to 17%."
  ];

  return (
    <>
      <SEO 
        title="CLEANBI Pricing Plans - Location Intelligence for Laundromat Investors"
        description="Score any location for laundromat investment potential. Free: 3 analyses total. Starter: $29/mo unlimited + calculator hub. Pro: $99/mo with advanced analytics & API. Enterprise: $699/mo with ownership data. 30-day money-back guarantee."
        canonicalUrl="/pricing"
        ogType="website"
        keywords={[
          "CLEANBI pricing",
          "laundromat location analysis pricing",
          "laundromat investment software cost",
          "location intelligence subscription",
          "competitor analysis tool pricing",
          "laundromat due diligence software",
          "property scoring platform",
          "laundromat site selection tool",
          "investment analysis software pricing",
          "laundromat market research tool",
          "ROI calculator laundromat",
          "laundromat valuation software",
          "business intelligence laundromat",
          "CLEANBI money-back guarantee",
          "laundromat analytics platform"
        ]}
        faqs={extendedFaqs}
        productOffers={productOffers}
        speakableContent={speakableContent}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" }
        ]}
        structuredData={[offerCatalogSchema, serviceSchema]}
        aggregateRating={{
          itemName: "WashBizHub CLEANBI Platform",
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
              reviewBody: "The Starter plan is perfect for getting started. I use CLEANBI Explorer daily to scout new locations. The unlimited analyses pay for themselves after just one good deal. The 3D views are amazing for virtual site visits.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Sarah Thompson",
              authorType: "Person",
              datePublished: "2025-09-15",
              reviewBody: "Upgraded to Pro for the ROI calculators and Monte Carlo simulations. These tools helped me model different scenarios before buying my second laundromat. The API access is great for my custom dashboards too.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Marcus Williams",
              authorType: "Person",
              datePublished: "2025-11-08",
              reviewBody: "Enterprise is worth it if you manage multiple locations. The ownership data and motivated seller detection have helped me find off-market deals. White-label reports make client presentations professional.",
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
          className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-[#0A1628]"
          aria-labelledby="pricing-hero-title"
        >
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge 
                className="mb-4 sm:mb-6 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/40 backdrop-blur-sm"
                data-testid="badge-cleanbi-header"
              >
                <Map className="h-3 w-3 mr-1.5" aria-hidden="true" />
                <span className="speakable">CLEANBI Explorer - Location Intelligence</span>
              </Badge>
              
              <h1 
                id="pricing-hero-title"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight speakable"
                data-testid="text-pricing-title"
              >
                Find Your Next{" "}
                <span className="text-[#C8A661]">Golden Opportunity</span>
              </h1>
              
              <p 
                className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed speakable"
                data-testid="text-pricing-subtitle"
              >
                Score any address in seconds. Analyze demographics, competition, and investment 
                potential with AI-powered intelligence trusted by 72,000+ professionals.
              </p>

              {/* Social proof stats */}
              <div 
                className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm sm:text-base text-white/70 mb-8 sm:mb-12"
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
                className="inline-flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 border border-white/20"
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
                  <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 text-xs">
                    Save up to 17%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <div className="bg-muted/30 py-4 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="text-muted-foreground">Jump to:</span>
              <a href="#buyer-plans" className="text-primary hover:underline font-medium flex items-center gap-1">
                <Map className="h-3 w-3" />
                Buyer Intelligence
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="#service-guy-ai" className="text-orange-400 hover:underline font-medium flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                Service Tech Tools
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="#seller-plans" className="text-[#C8A661] hover:underline font-medium flex items-center gap-1">
                <Store className="h-3 w-3" />
                Seller Listings
              </a>
            </div>
          </div>
        </div>

        {/* Buyer Intelligence Plans Section */}
        <section 
          className="relative pt-8 sm:pt-12 pb-16 sm:pb-24"
          aria-labelledby="pricing-plans-title"
          id="buyer-plans"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30">
                <Map className="h-3 w-3 mr-1.5" aria-hidden="true" />
                Buyer Intelligence Plans
              </Badge>
              <h2 id="pricing-plans-title" className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                CLEANBI Explorer Plans
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                For investors and buyers analyzing locations. Score any address, analyze demographics, competition, and investment potential.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
              {tiers.map((tier, index) => {
                const Icon = tier.icon;
                const displayPrice = getDisplayPrice(tier);
                const savingsPercent = isAnnual ? getSavingsPercent(tier.price, tier.priceAnnual) : 0;
                
                return (
                  <Card 
                    key={tier.id}
                    className={`relative bg-card border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                      tier.popular 
                        ? 'border-[#C8A661] border-2' 
                        : ''
                    }`}
                    data-testid={`card-plan-${tier.id}`}
                    role="article"
                    aria-label={`${tier.name} plan - ${tier.price === 0 ? 'Free' : `$${displayPrice} per month`}`}
                  >
                    <div className={`${tier.popular ? 'h-2 bg-[#C8A661]' : 'h-1 bg-[#C8A661]'}`} />
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <Badge 
                          className="bg-[#C8A661] text-[#0A1628] shadow-lg px-3 py-1"
                          data-testid={`badge-${tier.id}`}
                        >
                          <Star className="h-3 w-3 mr-1" aria-hidden="true" />
                          {tier.badge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4 pt-6">
                      <div 
                        className="mx-auto mb-4 p-3 rounded-lg bg-[#0A1628] w-fit transition-transform duration-300 hover:scale-110"
                        aria-hidden="true"
                      >
                        <Icon className="h-6 w-6 text-[#C8A661]" />
                      </div>
                      
                      <CardTitle className="text-xl font-bold text-foreground mb-1">
                        {tier.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {tier.tagline}
                      </CardDescription>
                      
                      <div className="my-4" aria-label={`Price: ${tier.price === 0 ? 'Free' : `$${displayPrice} per month`}`}>
                        {tier.price === 0 ? (
                          <span className="text-4xl font-bold text-[#C8A661]">FREE</span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-[#C8A661]">${displayPrice}</span>
                              <span className="text-muted-foreground">/mo</span>
                            </div>
                            {isAnnual && savingsPercent > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground line-through">
                                  ${tier.price}/mo
                                </span>
                                <Badge variant="secondary" className="text-xs bg-[#C8A661]/10 text-[#C8A661]">
                                  Save {savingsPercent}%
                                </Badge>
                              </div>
                            )}
                            {isAnnual && (
                              <span className="text-xs text-muted-foreground mt-1">
                                Billed ${tier.priceAnnual}/year
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Link href={tier.id === "enterprise" ? "/consultation" : "/cleanbi-explorer"}>
                        <Button 
                          className={`w-full group ${
                            tier.popular 
                              ? 'bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]' 
                              : 'bg-[#0A1628] hover:bg-[#1a3a5c] text-white'
                          }`}
                          data-testid={`button-cta-${tier.id}`}
                          aria-label={`${tier.cta} for ${tier.name} plan`}
                        >
                          {tier.cta}
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Button>
                      </Link>
                      
                      {/* Guarantee indicator */}
                      <p className="text-xs text-muted-foreground text-center mt-2" data-testid={`text-cc-${tier.id}`}>
                        {tier.price === 0 ? (
                          <span className="flex items-center justify-center gap-1">
                            <Gift className="h-3 w-3 text-[#C8A661]" aria-hidden="true" />
                            No credit card required
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            <Shield className="h-3 w-3 text-[#C8A661]" aria-hidden="true" />
                            30-day money-back guarantee
                          </span>
                        )}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0 px-4 pb-6">
                      <div className="text-xs text-muted-foreground text-center mb-4 pb-4 border-b">
                        {tier.limits.cleanbiAnalyses === 'unlimited' 
                          ? 'Unlimited analyses' 
                          : `${tier.limits.cleanbiAnalyses} analysis/day`}
                        {tier.limits.apiCalls !== 0 && tier.limits.apiCalls !== 'unlimited' && (
                          <> • {tier.limits.apiCalls} API calls/mo</>
                        )}
                        {tier.limits.apiCalls === 'unlimited' && (
                          <> • Unlimited API</>
                        )}
                      </div>
                      
                      <ul className="space-y-2.5" role="list" aria-label={`${tier.name} plan features`}>
                        {tier.features.filter(f => f.included).slice(0, 8).map((feature, i) => (
                          <li 
                            key={i} 
                            className="flex items-start gap-2.5 text-sm"
                          >
                            <Check 
                              className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#C8A661]" 
                              aria-hidden="true"
                            />
                            <span className={feature.highlight ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section 
          className="py-12 sm:py-16 bg-muted/30"
          aria-labelledby="trust-section-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="trust-section-title" className="sr-only">Trust & Security</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={index}
                    className="flex flex-col items-center text-center p-4 sm:p-6 bg-card rounded-xl border shadow-sm"
                  >
                    <div className="p-3 rounded-lg bg-[#0A1628] mb-3">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#C8A661]" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{badge.label}</span>
                    <span className="text-xs text-muted-foreground mt-1">{badge.sublabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section 
          className="py-16 sm:py-24"
          aria-labelledby="comparison-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 id="comparison-title" className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Compare All Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See exactly what's included at each tier. All plans include core CLEANBI scoring.
              </p>
            </div>
            
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div 
                className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                role="region"
                aria-label="Feature comparison table"
                tabIndex={0}
              >
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th scope="col" className="text-left p-4 font-semibold text-foreground sticky left-0 bg-muted/50 min-w-[200px]">
                        Feature
                      </th>
                      {tiers.map(tier => {
                        const Icon = tier.icon;
                        return (
                          <th 
                            key={tier.id}
                            scope="col" 
                            className={`text-center p-4 font-semibold text-foreground min-w-[120px] ${
                              tier.popular ? 'bg-[#C8A661]/10' : ''
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1.5">
                              <Icon className={`w-5 h-5 ${tier.iconColor}`} aria-hidden="true" />
                              <span>{tier.name}</span>
                              <span className="text-xs text-muted-foreground font-normal">
                                {tier.price === 0 ? 'Free' : `$${getDisplayPrice(tier)}/mo`}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((category, catIdx) => {
                      const CategoryIcon = category.icon;
                      return [
                        <tr key={`cat-${catIdx}`} className="bg-muted/30">
                          <td colSpan={5} className="p-3 font-semibold text-foreground sticky left-0 bg-muted/30">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="w-4 h-4 text-[#C8A661]" aria-hidden="true" />
                              {category.category}
                            </div>
                          </td>
                        </tr>,
                        ...category.features.map((feature, featIdx) => (
                          <tr 
                            key={`feat-${catIdx}-${featIdx}`} 
                            className="border-b hover:bg-muted/10 transition-colors"
                          >
                            <td className="p-3 text-muted-foreground sticky left-0 bg-background">
                              {feature.name}
                            </td>
                            <td className="p-3 text-center">
                              {renderFeatureValue(feature.free, false)}
                            </td>
                            <td className="p-3 text-center bg-[#C8A661]/5">
                              {renderFeatureValue(feature.starter, true)}
                            </td>
                            <td className="p-3 text-center">
                              {renderFeatureValue(feature.pro, false)}
                            </td>
                            <td className="p-3 text-center">
                              {renderFeatureValue(feature.enterprise, false)}
                            </td>
                          </tr>
                        ))
                      ];
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              <span className="inline-flex items-center gap-1">
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                Scroll horizontally on mobile to see all plans
              </span>
            </p>
          </div>
        </section>

        {/* Seller Listing Plans Section */}
        <section 
          className="py-16 sm:py-24 bg-muted/30"
          aria-labelledby="listing-tiers-title"
          id="seller-plans"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Store className="h-3 w-3 mr-1.5" aria-hidden="true" />
                Seller Listing Plans
              </Badge>
              <h2 id="listing-tiers-title" className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Sell Your Laundromat Faster
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Premium visibility tiers help you reach more buyers. Higher tiers unlock automation that works for you 24/7 — AI-generated blog posts, automatic search engine indexing, and featured carousel placement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {LISTING_TIER_ORDER.map((tierId) => {
                const tier = LISTING_TIERS[tierId];
                const TierIcon = tier.icon;
                return (
                  <Card 
                    key={tier.id}
                    className={`relative flex flex-col bg-card border shadow-sm overflow-hidden ${tier.popular ? 'border-[#C8A661] border-2' : ''}`}
                  >
                    <div className={`${tier.popular ? 'h-2 bg-[#C8A661]' : 'h-1 bg-[#C8A661]'}`} />
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#C8A661] text-[#0A1628]">
                          {tier.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center mx-auto mb-3">
                        <TierIcon className="w-6 h-6 text-[#C8A661]" />
                      </div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <CardDescription className="text-xs">{tier.tagline}</CardDescription>
                      <div className="mt-3">
                        <span className="text-3xl font-bold text-[#C8A661]">${tier.price}</span>
                        {tier.price > 0 && <span className="text-muted-foreground">/mo</span>}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      {tier.features.map((feature, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-2 text-sm ${feature.highlight ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                        >
                          {feature.included ? (
                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#C8A661]" />
                          ) : (
                            <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground/30" />
                          )}
                          <span className={!feature.included ? 'text-muted-foreground/50' : ''}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                      {tier.roi && (
                        <div className="pt-2 mt-2 border-t">
                          <p className="text-xs text-[#C8A661] font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {tier.roi}
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Link href="/listing-form">
                        <Button 
                          className={`w-full ${tier.popular ? 'bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]' : 'bg-[#0A1628] hover:bg-[#1a3a5c] text-white'}`}
                          data-testid={`button-listing-tier-${tier.id}`}
                        >
                          {tier.cta}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 inline-block mr-1 text-[#C8A661]" />
                <strong>Diamond VIP</strong> includes AI-generated blog post about your listing + automatic Google/Bing indexing for maximum SEO visibility.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          className="py-16 sm:py-24"
          aria-labelledby="testimonials-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Users className="h-3 w-3 mr-1.5" aria-hidden="true" />
                Customer Success Stories
              </Badge>
              <h2 id="testimonials-title" className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Trusted by Industry Leaders
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how laundromat professionals use CLEANBI to make smarter investment decisions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index}
                  className="bg-card border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-1 bg-[#C8A661]" />
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-[#C8A661]/30 mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center text-sm font-semibold text-[#C8A661]"
                        aria-hidden="true"
                      >
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                      <div className="ml-auto flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-[#C8A661] text-[#C8A661]" aria-hidden="true" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section 
          className="py-16 sm:py-24 bg-muted/30"
          aria-labelledby="faq-title"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                FAQs
              </Badge>
              <h2 id="faq-title" className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about CLEANBI pricing and plans.
              </p>
            </div>
            
            <div className="space-y-4" role="list" aria-label="Frequently asked questions">
              {extendedFaqs.map((faq, idx) => (
                <Card 
                  key={idx}
                  className="bg-card border shadow-sm hover:shadow-md transition-shadow"
                  role="listitem"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-start gap-3">
                      <span 
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C8A661]/10 text-[#C8A661] flex items-center justify-center text-xs font-bold"
                        aria-hidden="true"
                      >
                        Q
                      </span>
                      <span itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                        <span itemProp="name">{faq.question}</span>
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pl-12">
                    <p 
                      className="text-muted-foreground text-sm leading-relaxed"
                      itemScope 
                      itemProp="acceptedAnswer" 
                      itemType="https://schema.org/Answer"
                    >
                      <span itemProp="text">{faq.answer}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Guy AI Section */}
        <section 
          className="py-16 sm:py-24 bg-[#0A1628]"
          aria-labelledby="service-guy-title"
          id="service-guy-ai"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/40">
                <Wrench className="h-3 w-3 mr-1.5" />
                Service Technicians
              </Badge>
              <h2 id="service-guy-title" className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Service Guy AI - Diagnostic Field Tool
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Instant error code lookup, repair procedures, and parts ordering for commercial laundry equipment. 
                15,867+ diagnostic codes from Dexter, Speed Queen, Wascomat, Huebsch, Continental & more.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Starter Tier */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C8A661]/20 mx-auto mb-3">
                    <Zap className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <CardTitle className="text-white">Starter</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    $29<span className="text-lg font-normal text-white/60">/mo</span>
                  </div>
                  <CardDescription className="text-white/60">50 lookups/month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>Basic error code lookup</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>2 troubleshooting steps shown</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>Voice input for hands-free</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/60">
                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Parts lists locked</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/60">
                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Full procedures locked</span>
                  </div>
                  <Link href="/api/stripe/create-checkout?plan=starter" className="block pt-4">
                    <Button className="w-full bg-[#C8A661]/20 text-[#C8A661] border border-[#C8A661]/40 hover:bg-[#C8A661]/30">
                      Get Starter
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro Tier - Most Popular */}
              <Card className="bg-white/10 border-[#C8A661]/50 backdrop-blur-sm relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#C8A661] text-[#0A1628] font-semibold">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C8A661]/30 mx-auto mb-3">
                    <Star className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <CardTitle className="text-white">Pro</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    $79<span className="text-lg font-normal text-white/60">/mo</span>
                  </div>
                  <CardDescription className="text-white/60">500 lookups/month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-white">Full repair procedures</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-white">Parts lists with pricing</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>Photo diagnosis with AI</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>Job tracking & history</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>Invoice/quote generator</span>
                  </div>
                  <Link href="/api/stripe/create-checkout?plan=pro" className="block pt-4">
                    <Button className="w-full bg-[#C8A661] text-[#0A1628] hover:bg-[#B8964F]">
                      Get Pro
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise Tier */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 mx-auto mb-3">
                    <Crown className="h-6 w-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Enterprise</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    $199<span className="text-lg font-normal text-white/60">/mo</span>
                  </div>
                  <CardDescription className="text-white/60">Unlimited lookups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-white">Everything in Pro</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-white">Unlimited lookups</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>API access for integrations</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>Complete diagnostic database</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-[#C8A661] mt-0.5 flex-shrink-0" />
                    <span>Dedicated support</span>
                  </div>
                  <Link href="/api/stripe/create-checkout?plan=enterprise" className="block pt-4">
                    <Button className="w-full bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30">
                      Get Enterprise
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Link href="/service-guy-ai">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Try Free Lookup (3/month)
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <p className="text-white/50 text-sm mt-3">
                Free tier: 3 lookups/month with basic info. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* Visibility Add-Ons for Sellers */}
        <VisibilityAddOnsSection />

        {/* Final CTA Section */}
        <section 
          className="py-16 sm:py-24 bg-[#0A1628]"
          aria-labelledby="final-cta-title"
        >
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 
              id="final-cta-title"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4"
            >
              Ready to Find Your Next Location?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join 72,000+ laundromat professionals who trust CLEANBI for smarter investment decisions. 
              Start with a free analysis today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cleanbi-explorer">
                <Button 
                  size="lg"
                  className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] px-8 group min-h-12"
                  data-testid="button-final-cta-primary"
                >
                  Start Free Analysis
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 min-h-12"
                  data-testid="button-final-cta-secondary"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-white/60 mt-6">
              Free tier: No credit card required • Paid plans: 30-day money-back guarantee
            </p>
          </div>
        </section>

        {/* Sticky Mobile CTA */}
        <div 
          className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border md:hidden z-50"
          role="complementary"
          aria-label="Quick action"
        >
          <Link href="/cleanbi-explorer">
            <Button 
              className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] min-h-12"
              data-testid="button-sticky-cta"
            >
              Start Free Analysis
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {/* Bottom padding for sticky CTA on mobile */}
        <div className="h-20 md:hidden" aria-hidden="true" />
      </div>
    </>
  );
}

function renderFeatureValue(value: boolean | string, isPopular: boolean) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-[#C8A661] mx-auto" aria-label="Included" />
    ) : (
      <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" aria-label="Not included" />
    );
  }
  return (
    <span className={`text-xs font-medium ${isPopular ? 'text-[#C8A661]' : 'text-muted-foreground'}`}>
      {value}
    </span>
  );
}
