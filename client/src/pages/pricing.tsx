import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import {
  Check,
  Star,
  Zap,
  Rocket,
  Crown,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Wrench,
  Globe,
  Bot,
  Calculator,
  Store,
  GraduationCap,
  FileText,
  Heart,
  Gift,
  Shield,
  Clock,
  Sparkles,
  Target,
  AlertTriangle,
  ChevronRight,
  X
} from "lucide-react";

export default function Pricing() {
  const pricingFaqs = [
    {
      question: "Is there really no credit card required for the trial?",
      answer: "Correct! Start your 14-day full POS trial with no credit card required. Experience unlimited machines, AI predictive alerts, and dynamic pricing with zero commitment."
    },
    {
      question: "What's included in the free forever plan?",
      answer: "The free plan includes CLEANBI Score (unlimited), 50+ business calculators, Design Studio 2D, Marketplace Cash-Back (5-15%), access to the 2,200+ error code database, community forum, and educational content."
    },
    {
      question: "What happens after the 14-day trial ends?",
      answer: "After your trial, choose between $149/month flat rate (unlimited transactions) or $0/month + 1.9% per transaction. Either option is cheaper than competitors who charge 6-8%. You keep AI alerts even if you cancel."
    },
    {
      question: "How much can I save with WashBizPOS?",
      answer: "Owners typically save $2,000-$12,000 in the first year through AI predictive maintenance alerts (preventing costly breakdowns), dynamic pricing (+22% revenue boost), and reduced transaction fees compared to competitors."
    }
  ];

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "WashBizPOS Pro",
    "description": "Complete laundromat POS system with AI predictive maintenance, dynamic pricing, and IoT monitoring",
    "brand": {
      "@type": "Brand",
      "name": "WashBizHub"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Forever",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "14-Day Full Trial",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31"
      },
      {
        "@type": "Offer",
        "name": "WashBizPOS Pro Flat",
        "price": "149",
        "priceCurrency": "USD",
        "billingIncrement": "P1M",
        "availability": "https://schema.org/InStock"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": pricingFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  const [pricingModel, setPricingModel] = useState<"flat" | "transaction">("flat");

  // New 2025 winning pricing strategy
  const mainPlans = [
    {
      name: "Free Forever",
      price: 0,
      icon: Gift,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      popular: false,
      description: "Essential tools at no cost",
      cta: "Get Started Free",
      features: [
        "CLEANBI Score (unlimited)",
        "Service Guy AI (2 messages)",
        "50+ Business Calculators",
        "Design Studio 2D",
        "Marketplace Cash-Back (5-15%)",
        "Error Code Database Access",
        "Community Forum (72K+ members)",
        "Educational Content"
      ]
    },
    {
      name: "Full POS Trial",
      price: 0,
      duration: "14 days",
      icon: Rocket,
      iconBg: "bg-teal-100 dark:bg-teal-900/30",
      iconColor: "text-teal-600 dark:text-teal-400",
      popular: true,
      description: "Experience everything - no credit card required",
      cta: "Start 14-Day Free Trial",
      highlight: "68% convert to paid",
      features: [
        "UNLIMITED machines",
        "AI Predictive Maintenance Alerts",
        "Dynamic Pricing Engine",
        "Remote Machine Control",
        "Loyalty App for Customers",
        "Full Analytics Dashboard",
        "Route Optimization",
        "Keep AI alerts even if you cancel"
      ]
    },
    {
      name: "WashBizPOS Pro",
      price: pricingModel === "flat" ? 149 : 0,
      transactionFee: pricingModel === "transaction" ? "1.9%" : null,
      icon: Crown,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      popular: false,
      description: pricingModel === "flat" 
        ? "Flat rate, unlimited everything" 
        : "Pay only when you earn",
      cta: "Start Free Trial",
      features: [
        "Unlimited Machines",
        "Unlimited Locations",
        "AI Predictive Alerts (save $2k-$12k/year)",
        "Dynamic Pricing (+22% revenue)",
        "Full IoT Monitoring",
        "2,200+ Error Code Database",
        "Service Guy AI (500 messages/mo)",
        "Priority Support"
      ]
    }
  ];

  // Legacy tiers for enterprise
  const tiers = [
    {
      name: "Accelerate",
      price: 349,
      icon: Zap,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      popular: false,
      description: "Perfect for single-location owners getting started",
      features: [
        "Single Location Management",
        "Basic POS System (per-pound pricing)",
        "Website Builder (5 templates)",
        "SEO Optimizer",
        "50+ Business Calculators",
        "Design Studio 2D",
        "Educational Content Access",
        "Vendor Marketplace Access",
        "Community Forum Access",
        "Email Support"
      ],
      limits: {
        locations: "1",
        transactions: "500/month",
        users: "2",
        storage: "5GB"
      }
    },
    {
      name: "Scale",
      price: 699,
      icon: TrendingUp,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      popular: true,
      description: "For multi-location operators and growing businesses",
      features: [
        "Everything in Accelerate, plus:",
        "Up to 5 Locations",
        "Advanced POS + Inventory",
        "IoT Machine Monitoring",
        "Pickup/Delivery Management",
        "Route Optimization (Google Maps)",
        "Design Studio 3D (React Konva)",
        "CLEANBI™ Scoring (17 factors)",
        "AI Consultant (Multi-Model)",
        "Advanced Analytics & BI",
        "Professional Visualizations (D3.js)",
        "Affiliate Program (20% commission)",
        "Priority Support"
      ],
      limits: {
        locations: "5",
        transactions: "Unlimited",
        users: "10",
        storage: "50GB"
      }
    },
    {
      name: "Summit",
      price: 1199,
      icon: Crown,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      popular: false,
      description: "Enterprise solution for large operations and franchises",
      features: [
        "Everything in Scale, plus:",
        "Unlimited Locations",
        "Custom Branding & White-Label",
        "Preventive Maintenance System",
        "Real-time Sensor Telemetry",
        "Predictive Analytics (Machine Learning)",
        "Custom Integrations (API Access)",
        "Multi-tenant Architecture",
        "ATM Depot Partnership",
        "Larry Larsen Due Diligence Suite",
        "Google Search Console + SERP API",
        "Dedicated Account Manager",
        "24/7 Phone Support"
      ],
      limits: {
        locations: "Unlimited",
        transactions: "Unlimited",
        users: "Unlimited",
        storage: "Unlimited"
      }
    }
  ];

  const platformFeatures = [
    {
      category: "Operations Management",
      icon: Wrench,
      features: [
        "POS System (per-pound pricing $1.25-$2.25/lb)",
        "Order lifecycle management",
        "Stripe payment integration",
        "Scale integration",
        "Multi-location support",
        "Household accounts",
        "Subscription management"
      ]
    },
    {
      category: "IoT & Diagnostics",
      icon: BarChart3,
      features: [
        "MQTT/HTTPS sensor ingestion",
        "Machine telemetry (temp, vibration, water)",
        "Predictive maintenance alerts",
        "2,200+ diagnostic codes library",
        "Repair ticket tracking",
        "Parts inventory management",
        "Warranty records"
      ]
    },
    {
      category: "Logistics & Delivery",
      icon: TrendingUp,
      features: [
        "Google Maps Distance Matrix",
        "Route optimization (OR-Tools)",
        "GPS tracking & geofencing",
        "DoorDash integration",
        "Two-way SMS (Twilio)",
        "Proof of delivery",
        "Driver mobile app (PWA)"
      ]
    },
    {
      category: "AI & Analytics",
      icon: Bot,
      features: [
        "Multi-model AI (OpenAI, Anthropic, Gemini, Perplexity, Grok)",
        "RAG pipeline with pgvector",
        "Trained on full Laundromat Bible",
        "Professional D3.js visualizations",
        "50+ interactive calculators",
        "Real-time dashboards (Chart.js)",
        "Business intelligence suite"
      ]
    },
    {
      category: "Website & SEO",
      icon: Globe,
      features: [
        "WYSIWYG website builder",
        "5 professional templates",
        "Custom domain + SSL",
        "CDN (Cloudflare)",
        "Google Search Console integration",
        "SERP API integration",
        "Automated SEO/AEO optimization",
        "Multi-tenant hosting"
      ]
    },
    {
      category: "Design Studio",
      icon: FileText,
      features: [
        "2D layout tools (React Konva)",
        "3D visualization (Pro)",
        "Equipment library (washers, dryers, etc.)",
        "Cost calculations",
        "TPD (Turns Per Day) projections",
        "Room dimension planning",
        "Export designs (PDF/PNG)"
      ]
    },
    {
      category: "Marketplace & Vendors",
      icon: Store,
      features: [
        "Multi-vendor marketplace",
        "Equipment listings",
        "Parts inventory",
        "Vendor profiles & reviews",
        "Amazon affiliate integration (4-10%)",
        "ATM Depot partnership",
        "Buying/selling platform"
      ]
    },
    {
      category: "Education & Resources",
      icon: GraduationCap,
      features: [
        "Video courses & certifications",
        "Laundromat Bible (complete book)",
        "Templates & checklists",
        "Industry benchmarks",
        "Case studies",
        "Community forum (72K+ members)",
        "Facebook Group integration"
      ]
    },
    {
      category: "Affiliate Program",
      icon: Heart,
      features: [
        "20% commission (vs Amazon's 4-10%)",
        "Custom affiliate links",
        "Social media sharing tools",
        "Real-time tracking",
        "Performance analytics",
        "Monthly payouts",
        "UGC content rewards"
      ]
    }
  ];

  const addOns = [
    {
      name: "Additional Location",
      price: "$99/month",
      description: "Add another location to your plan"
    },
    {
      name: "Custom Integration",
      price: "$499 one-time",
      description: "Custom API integration with your systems"
    },
    {
      name: "Training Session",
      price: "$199/session",
      description: "1-hour personalized training with expert"
    },
    {
      name: "White-Label Branding",
      price: "$299/month",
      description: "Remove WashBizHub branding, use yours"
    },
    {
      name: "Dedicated Account Manager",
      price: "$599/month",
      description: "Personal support contact for your business"
    }
  ];

  return (
    <>
      <SEO 
        title="Pricing - 14-Day Free Trial | $149/mo or 1.9% Transaction Fee"
        description="Start your 14-day full POS trial free - no credit card required. Unlimited machines, AI predictive alerts, dynamic pricing. After trial: $149/mo flat OR $0/mo + 1.9%. Save $2K-$12K/year. 68% trial-to-paid conversion."
        canonicalUrl="/pricing"
        keywords={[
          "laundromat POS pricing",
          "laundry software cost",
          "free laundromat trial",
          "WashBizPOS pricing",
          "laundromat management software",
          "coin laundry POS system",
          "dynamic pricing laundromat"
        ]}
        structuredData={[pricingSchema, faqSchema]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" }
        ]}
      />
      <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - 14 Day Trial */}
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-3 sm:mb-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30" data-testid="badge-trial-header">
            <Clock className="h-3 w-3 mr-1" />
            14-Day Full POS Trial - No Credit Card Required
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 sm:mb-4" data-testid="text-pricing-title">
            Start Your 14-Day Full POS Trial
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 px-2" data-testid="text-pricing-subtitle">
            No credit card required • Unlimited machines • Cancel anytime
          </p>
          <p className="text-sm sm:text-base text-teal-600 dark:text-teal-400 font-semibold">
            Keep the AI alerts even if you cancel
          </p>
        </div>

        {/* Main CTA Button */}
        <div className="flex justify-center mb-12">
          <Link href="/register">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-teal-600 hover:bg-teal-700"
              data-testid="button-start-trial-hero"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Start Your 14-Day Free Trial
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>68% trial-to-paid conversion</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>72K+ community members</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Save $2K-$12K in first 7 days</span>
          </div>
        </div>

        {/* Main Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {mainPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name}
                className={`relative ${plan.popular ? 'scale-105 shadow-2xl ring-2 ring-teal-500 z-10' : ''}`}
                data-testid={`card-plan-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white" data-testid="badge-recommended">
                    <Star className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
                {'highlight' in plan && plan.highlight && (
                  <Badge className="absolute -top-3 right-4 bg-green-500 text-white text-xs">
                    {plan.highlight}
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-3 p-3 rounded-full ${plan.iconBg} w-fit`}>
                    <Icon className={`h-7 w-7 ${plan.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl font-black text-foreground mb-1">
                    {plan.name}
                  </CardTitle>
                  {'duration' in plan && plan.duration && (
                    <Badge variant="outline" className="mb-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {plan.duration}
                    </Badge>
                  )}
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                  <div className="my-4">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-black text-foreground">FREE</span>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-foreground">${plan.price}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </>
                    )}
                    {'transactionFee' in plan && plan.transactionFee && (
                      <div className="text-sm text-muted-foreground mt-1">
                        + {plan.transactionFee} per transaction
                      </div>
                    )}
                  </div>
                  <Link href="/register">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                      data-testid={`button-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pricing Model Toggle for Pro */}
        <div className="max-w-xl mx-auto mb-16">
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-center mb-4">Choose Your Pro Pricing Model</h3>
              <Tabs value={pricingModel} onValueChange={(v) => setPricingModel(v as "flat" | "transaction")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="flat" data-testid="tab-flat-pricing">
                    <DollarSign className="h-4 w-4 mr-1" />
                    $149/mo Flat
                  </TabsTrigger>
                  <TabsTrigger value="transaction" data-testid="tab-transaction-pricing">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    $0 + 1.9%
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-center text-sm text-muted-foreground mt-3">
                {pricingModel === "flat" 
                  ? "Unlimited transactions, predictable monthly cost" 
                  : "Pay only when you earn (cheaper than competitors' 6-8%)"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What You DON'T Get With Competitors */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-black text-center mb-6 sm:mb-8">What Others Charge For (That's FREE Here)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "7-day trials", us: "14 days full access", them: "7 days limited" },
              { label: "Credit card required", us: "No card needed", them: "Card upfront" },
              { label: "Machine limits", us: "Unlimited", them: "Per-machine fees" },
              { label: "Transaction fees", us: "1.9% (or $99 flat)", them: "6-8% typical" },
            ].map((item, i) => (
              <Card key={i} className="text-center">
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs text-muted-foreground mb-2">{item.label}</p>
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">{item.us}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-red-500 opacity-60">
                      <X className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm line-through">{item.them}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enterprise Tiers (collapsed) */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-black text-center mb-2">Enterprise Solutions</h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8">For large operations and franchises</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={tier.name}
                className={`relative ${tier.popular ? 'scale-105 shadow-2xl ring-2 ring-accent' : ''}`}
                data-testid={`card-tier-${tier.name.toLowerCase()}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground" data-testid="badge-popular">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <div className={`mx-auto mb-4 p-3 rounded-full ${tier.iconBg} w-fit`}>
                    <Icon className={`h-8 w-8 ${tier.iconColor}`} />
                  </div>
                  <CardTitle className="text-3xl font-black text-foreground mb-2" data-testid={`text-tier-name-${tier.name.toLowerCase()}`}>
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="mb-4" data-testid={`text-tier-description-${tier.name.toLowerCase()}`}>
                    {tier.description}
                  </CardDescription>
                  <div className="mb-4">
                    <span className="text-5xl font-black text-foreground" data-testid={`text-price-${tier.name.toLowerCase()}`}>
                      ${tier.price}
                    </span>
                    <span className="text-muted-foreground text-lg">/mo</span>
                  </div>
                  <Link href="/subscribe">
                    <Button 
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      size="lg"
                      data-testid={`button-subscribe-${tier.name.toLowerCase()}`}
                    >
                      {tier.popular ? (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Get Started
                        </>
                      ) : 'Choose Plan'}
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      Plan Limits
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                      <div>
                        <span className="text-muted-foreground">Locations:</span>
                        <span className="ml-2 text-foreground font-medium">{tier.limits.locations}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Users:</span>
                        <span className="ml-2 text-foreground font-medium">{tier.limits.users}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transactions:</span>
                        <span className="ml-2 text-foreground font-medium">{tier.limits.transactions}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Storage:</span>
                        <span className="ml-2 text-foreground font-medium">{tier.limits.storage}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-2 ${feature.startsWith('Everything') ? 'text-accent font-semibold mt-4' : 'text-muted-foreground'}`}
                        data-testid={`feature-${tier.name.toLowerCase()}-${idx}`}
                      >
                        <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${feature.startsWith('Everything') ? 'text-accent' : 'text-primary'}`} />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </div>

        {/* Platform Features */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-foreground mb-4" data-testid="text-platform-features-title">
              Complete Platform Features
            </h2>
            <p className="text-muted-foreground text-lg" data-testid="text-platform-features-subtitle">
              Everything you need to modernize and scale your laundromat business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.category}
                  data-testid={`card-feature-${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <CardTitle className="text-foreground text-lg" data-testid={`text-category-${category.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {category.category}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.features.map((feature, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-start gap-2 text-muted-foreground text-sm"
                          data-testid={`feature-item-${category.category.toLowerCase().replace(/\s+/g, '-')}-${idx}`}
                        >
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Add-Ons */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-foreground mb-4" data-testid="text-addons-title">
              Add-Ons & Extras
            </h2>
            <p className="text-muted-foreground text-lg" data-testid="text-addons-subtitle">
              Customize your plan with additional features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOns.map((addon) => (
              <Card 
                key={addon.name}
                data-testid={`card-addon-${addon.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardHeader>
                  <CardTitle className="text-foreground text-lg mb-2" data-testid={`text-addon-name-${addon.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {addon.name}
                  </CardTitle>
                  <CardDescription data-testid={`text-addon-description-${addon.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {addon.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent" data-testid={`text-addon-price-${addon.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {addon.price}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-black text-foreground mb-4" data-testid="text-cta-title">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-cta-subtitle">
              Join 72,000+ laundromat professionals modernizing their operations with WashBizHub
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscribe">
                <Button size="lg" data-testid="button-cta-subscribe">
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/consultation">
                <Button size="lg" variant="outline" data-testid="button-cta-consultation">
                  Schedule Demo
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground text-sm mt-6" data-testid="text-cta-guarantee">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </CardContent>
        </Card>

        {/* Facebook Group CTA */}
        <div className="mt-12 text-center">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-3" data-testid="text-facebook-cta-title">
                Part of the Largest Laundromat Community
              </h3>
              <p className="text-muted-foreground mb-6" data-testid="text-facebook-cta-description">
                WashBizHub is built for and by the 72,000+ member "Advantage Laundry" Facebook community
              </p>
              <Link href="/facebook-group">
                <Button className="bg-[#1877f2] hover:bg-[#1877f2]/90 text-white" data-testid="button-facebook-group">
                  <Users className="h-4 w-4 mr-2" />
                  Join the Facebook Group
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
