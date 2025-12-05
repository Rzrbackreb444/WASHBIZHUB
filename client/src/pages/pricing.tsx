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
  Quote
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
        { name: "Location Analyses", free: "5 total", starter: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
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
        { name: "Solar Potential Analysis", free: false, starter: true, pro: true, enterprise: true },
        { name: "Full Category Breakdowns", free: false, starter: true, pro: true, enterprise: true },
      ]
    },
    { 
      category: "Investment Tools",
      icon: Calculator,
      features: [
        { name: "Property Value Estimates", free: false, starter: true, pro: true, enterprise: true },
        { name: "ROI Calculator", free: false, starter: false, pro: true, enterprise: true },
        { name: "Monte Carlo Simulation", free: false, starter: false, pro: true, enterprise: true },
        { name: "Utility Rate Analysis", free: false, starter: false, pro: true, enterprise: true },
        { name: "Drive-Time Catchment Maps", free: false, starter: false, pro: true, enterprise: true },
        { name: "Revenue Projections", free: false, starter: false, pro: true, enterprise: true },
      ]
    },
    { 
      category: "Enterprise Data",
      icon: Building2,
      features: [
        { name: "Ownership & Lien Data", free: false, starter: false, pro: false, enterprise: true },
        { name: "Motivated Seller Score", free: false, starter: false, pro: false, enterprise: true },
        { name: "Property Tax Records", free: false, starter: false, pro: false, enterprise: true },
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
      question: "Is there a free trial available?",
      answer: "Absolutely! All paid plans include a 7-day free trial with full access to all features. No credit card required to start. If you don't cancel during the trial, you'll be charged after 7 days."
    },
    {
      question: "Can I switch between plans?",
      answer: "Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately with prorated billing. Downgrades apply at your next billing cycle."
    }
  ];

  const speakableContent = [
    "CLEANBI Explorer pricing starts at free with 5 location analyses. Starter is $29 per month for unlimited analyses. Pro is $99 per month with ROI calculators and API access. Enterprise is $699 per month with ownership data and dedicated support.",
    "All paid plans include a 7-day free trial and 30-day money-back guarantee. Annual billing saves up to 17%."
  ];

  return (
    <>
      <SEO 
        title="CLEANBI Pricing Plans - Location Intelligence for Laundromat Investors"
        description="Score any location for laundromat investment potential. Free: 5 analyses total. Starter: $29/mo unlimited. Pro: $99/mo with calculators & API. Enterprise: $699/mo with ownership data. 7-day free trial, 30-day money-back guarantee."
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
          "CLEANBI free trial",
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
        {/* Premium Gradient Hero Section */}
        <section 
          className="relative py-16 sm:py-24 lg:py-32 overflow-hidden"
          aria-labelledby="pricing-hero-title"
        >
          {/* Stripe-inspired mesh gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#0f1d30]" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 80% 50% at 20% 40%, rgba(200, 166, 97, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 60%, rgba(184, 134, 11, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse 40% 30% at 50% 80%, rgba(212, 160, 48, 0.15) 0%, transparent 50%)
              `
            }}
          />
          
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
                  <Badge className="bg-[#b8860b]/20 text-[#C8A661] border-[#b8860b]/30 text-xs">
                    Save up to 17%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section 
          className="relative -mt-8 sm:-mt-12 pb-16 sm:pb-24"
          aria-labelledby="pricing-plans-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="pricing-plans-title" className="sr-only">Pricing Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {tiers.map((tier, index) => {
                const Icon = tier.icon;
                const displayPrice = getDisplayPrice(tier);
                const savingsPercent = isAnnual ? getSavingsPercent(tier.price, tier.priceAnnual) : 0;
                
                return (
                  <Card 
                    key={tier.id}
                    className={`relative bg-white dark:bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      tier.popular 
                        ? 'ring-2 ring-[#C8A661] shadow-xl lg:scale-105 z-10' 
                        : 'shadow-lg'
                    }`}
                    data-testid={`card-plan-${tier.id}`}
                    role="article"
                    aria-label={`${tier.name} plan - ${tier.price === 0 ? 'Free' : `$${displayPrice} per month`}`}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <Badge 
                          className={`${tier.badgeColor} shadow-lg px-3 py-1`}
                          data-testid={`badge-${tier.id}`}
                        >
                          <Star className="h-3 w-3 mr-1" aria-hidden="true" />
                          {tier.badge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4 pt-6">
                      <div 
                        className={`mx-auto mb-4 p-3 rounded-xl ${tier.iconBg} w-fit transition-transform duration-300 hover:scale-110`}
                        aria-hidden="true"
                      >
                        <Icon className={`h-6 w-6 ${tier.iconColor}`} />
                      </div>
                      
                      <CardTitle className="text-xl font-bold text-foreground mb-1">
                        {tier.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {tier.tagline}
                      </CardDescription>
                      
                      <div className="my-4" aria-label={`Price: ${tier.price === 0 ? 'Free' : `$${displayPrice} per month`}`}>
                        {tier.price === 0 ? (
                          <span className="text-4xl font-bold text-foreground">FREE</span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-foreground">${displayPrice}</span>
                              <span className="text-muted-foreground">/mo</span>
                            </div>
                            {isAnnual && savingsPercent > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground line-through">
                                  ${tier.price}/mo
                                </span>
                                <Badge variant="secondary" className="text-xs bg-[#b8860b]/10 text-[#b8860b] dark:bg-[#b8860b]/20 dark:text-[#C8A661]">
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
                              ? 'bg-[#C8A661] hover:bg-[#B8964D] text-white' 
                              : tier.ctaVariant === 'outline' 
                                ? '' 
                                : 'bg-primary hover:bg-primary/90'
                          }`}
                          variant={tier.ctaVariant}
                          data-testid={`button-cta-${tier.id}`}
                          aria-label={`${tier.cta} for ${tier.name} plan`}
                        >
                          {tier.cta}
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Button>
                      </Link>
                      
                      {/* Credit card requirement indicator */}
                      <p className="text-xs text-muted-foreground text-center mt-2" data-testid={`text-cc-${tier.id}`}>
                        {tier.price === 0 ? (
                          <span className="flex items-center justify-center gap-1">
                            <Gift className="h-3 w-3 text-[#b8860b]" aria-hidden="true" />
                            No credit card required
                          </span>
                        ) : tier.id === 'enterprise' ? (
                          <span className="flex items-center justify-center gap-1">
                            <CreditCard className="h-3 w-3" aria-hidden="true" />
                            14-day free trial • CC required
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            <CreditCard className="h-3 w-3" aria-hidden="true" />
                            7-day free trial • CC required
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
                              className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                feature.highlight ? 'text-[#C8A661]' : 'text-[#b8860b]'
                              }`} 
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
                    className="flex flex-col items-center text-center p-4 sm:p-6 bg-background rounded-xl border border-border"
                  >
                    <div className="p-3 rounded-full bg-primary/10 mb-3">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
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
            
            <Card className="overflow-hidden shadow-lg">
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

        {/* Listing Tiers Section - For Sellers */}
        <section 
          className="py-16 sm:py-24 bg-gradient-to-br from-[#1e3a5f]/5 to-[#C8A661]/5"
          aria-labelledby="listing-tiers-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30">
                <Star className="h-3 w-3 mr-1.5" aria-hidden="true" />
                For Sellers
              </Badge>
              <h2 id="listing-tiers-title" className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Listing Visibility Tiers
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sell your laundromat faster with premium visibility. Higher tiers unlock auto-features that work for you 24/7.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {LISTING_TIER_ORDER.map((tierId) => {
                const tier = LISTING_TIERS[tierId];
                const TierIcon = tier.icon;
                return (
                  <Card 
                    key={tier.id}
                    className={`relative flex flex-col ${tier.popular ? 'border-[#C8A661] ring-2 ring-[#C8A661]/20' : ''}`}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className={tier.badgeColor}>
                          {tier.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className={`w-12 h-12 rounded-xl ${tier.iconBg} flex items-center justify-center mx-auto mb-3`}>
                        <TierIcon className={`w-6 h-6 ${tier.iconColor}`} />
                      </div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <CardDescription className="text-xs">{tier.tagline}</CardDescription>
                      <div className="mt-3">
                        <span className="text-3xl font-bold">${tier.price}</span>
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
                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${feature.highlight ? 'text-[#C8A661]' : 'text-green-500'}`} />
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
                          className="w-full"
                          variant={tier.ctaVariant as "default" | "outline" | "secondary"}
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
          className="py-16 sm:py-24 bg-muted/30"
          aria-labelledby="testimonials-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30">
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
                  className="bg-background hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-[#C8A661]/30 mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary"
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
          className="py-16 sm:py-24"
          aria-labelledby="faq-title"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
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
                  className="hover:shadow-md transition-shadow"
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

        {/* Visibility Add-Ons for Sellers */}
        <VisibilityAddOnsSection />

        {/* Final CTA Section */}
        <section 
          className="py-16 sm:py-24 bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#0f1d30] relative overflow-hidden"
          aria-labelledby="final-cta-title"
        >
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 60% 40% at 30% 50%, rgba(200, 166, 97, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse 50% 30% at 70% 60%, rgba(184, 134, 11, 0.3) 0%, transparent 50%)
              `
            }}
            aria-hidden="true"
          />
          
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
                  className="bg-[#C8A661] hover:bg-[#B8964D] text-white px-8 group min-h-12"
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
              No credit card required • 7-day free trial on paid plans • 30-day money-back guarantee
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
              className="w-full bg-[#C8A661] hover:bg-[#B8964D] text-white min-h-12"
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
      <Check className="w-5 h-5 text-[#b8860b] mx-auto" aria-label="Included" />
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
