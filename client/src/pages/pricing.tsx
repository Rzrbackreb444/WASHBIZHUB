import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Heart
} from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const tiers = [
    {
      name: "Accelerate",
      price: billingCycle === "monthly" ? 249 : 2490,
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
      price: billingCycle === "monthly" ? 499 : 4990,
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
      price: billingCycle === "monthly" ? 899 : 8990,
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
        "2,100+ diagnostic codes library",
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

  const savings = billingCycle === "annual" 
    ? "Save 16% with annual billing!" 
    : "Switch to annual and save 16%!";

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4" data-testid="badge-pricing-header">
            <DollarSign className="h-3 w-3 mr-1" />
            Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-black text-foreground mb-4" data-testid="text-pricing-title">
            Professional Laundromat Software
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-pricing-subtitle">
            World-class enterprise platform combining marketplace, POS, IoT monitoring, AI consultant, 
            comprehensive SEO suite, website hosting with WYSIWYG builder, 50+ calculators, and viral UGC affiliate marketing
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "annual")} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual" data-testid="tab-annual">
                  Annual
                  <Badge className="ml-2 bg-accent text-accent-foreground text-xs">Save 16%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <p className="text-accent text-sm mt-2 font-semibold" data-testid="text-savings">
            {savings}
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
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
                      ${billingCycle === "monthly" ? tier.price : Math.floor(tier.price / 12)}
                    </span>
                    <span className="text-muted-foreground text-lg">
                      /{billingCycle === "monthly" ? "mo" : "mo"}
                    </span>
                    {billingCycle === "annual" && (
                      <div className="text-sm text-muted-foreground mt-1">
                        ${tier.price}/year (billed annually)
                      </div>
                    )}
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
  );
}
