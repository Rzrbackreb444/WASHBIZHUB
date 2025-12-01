import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import {
  Check,
  Star,
  Zap,
  Crown,
  Users,
  Calculator,
  Gift,
  X,
  Map,
  Building2,
  Eye,
  Lock
} from "lucide-react";

export default function Pricing() {

  // CLEANBI Explorer Pricing Plans
  const cleanbiPlans = [
    {
      name: "Free",
      price: 0,
      icon: Gift,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      popular: false,
      description: "Try before you buy",
      cta: "Get Started Free",
      features: [
        "1 location analysis per day",
        "CLEANBI Score & Grade",
        "Basic competitor count",
        "Street View access",
        "Save analyses to history",
        "Shareable analysis links"
      ],
      limits: "1 analysis/day"
    },
    {
      name: "Starter",
      price: 29,
      icon: Zap,
      iconBg: "bg-[#C8A661]/20",
      iconColor: "text-[#C8A661]",
      popular: true,
      description: "For serious investors",
      cta: "Start 7-Day Free Trial",
      features: [
        "Unlimited CLEANBI analyses",
        "3D Aerial View flyovers",
        "Full competitor intelligence",
        "Walk Score & Transit Score",
        "Solar potential analysis",
        "Property value estimates",
        "Export PDF reports",
        "Priority support"
      ],
      limits: "Unlimited analyses"
    },
    {
      name: "Pro",
      price: 79,
      icon: Crown,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      popular: false,
      description: "For power users & brokers",
      cta: "Start 7-Day Free Trial",
      features: [
        "Everything in Starter, plus:",
        "ROI & Valuation calculators",
        "Monte Carlo simulations",
        "Utility rate analysis",
        "Drive-time catchment maps",
        "Bulk location analysis",
        "Deal scoring AI insights",
        "Revenue projections",
        "API access (100 calls/mo)"
      ],
      limits: "100 API calls/mo"
    },
    {
      name: "Enterprise",
      price: 199,
      icon: Building2,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      popular: false,
      description: "For brokers & multi-unit operators",
      cta: "Contact Sales",
      features: [
        "Everything in Pro, plus:",
        "Ownership & lien data",
        "Motivated seller detection",
        "Property tax records",
        "White-label reports",
        "Custom branding",
        "Unlimited API access",
        "Dedicated account manager",
        "Phone support"
      ],
      limits: "Unlimited everything"
    }
  ];

  // CLEANBI FAQs
  const cleanbiPricingFaqs = [
    {
      question: "What is CLEANBI Explorer?",
      answer: "CLEANBI Explorer is an AI-powered location intelligence platform that scores any address for laundromat investment potential. It analyzes demographics, competition, traffic, property values, and more to give you a comprehensive score from 0-100."
    },
    {
      question: "How many free analyses do I get?",
      answer: "Free users get 1 location analysis per day. Your saved analyses are always accessible, and you can come back tomorrow for another free analysis."
    },
    {
      question: "What's included in the Starter plan?",
      answer: "Starter ($29/mo) includes unlimited CLEANBI analyses, 3D Aerial View flyovers, full competitor intelligence, Walk Score & Transit Score, solar potential analysis, property value estimates, and PDF report exports."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! All plans are month-to-month with no long-term contracts. Cancel anytime and your access continues through the end of your billing period."
    },
    {
      question: "What's the difference between Pro and Enterprise?",
      answer: "Pro ($79/mo) adds ROI calculators, Monte Carlo simulations, utility rate analysis, and API access. Enterprise ($199/mo) includes ownership & lien data, motivated seller detection, white-label reports, and dedicated support."
    }
  ];

  return (
    <>
      <SEO 
        title="CLEANBI Explorer Pricing - Location Intelligence for Laundromat Investors"
        description="Score any location for laundromat investment potential. Free tier: 1 analysis/day. Starter: $29/mo unlimited analyses, 3D views, competitor intel. Pro: $79/mo with calculators & API. Enterprise: $199/mo with ownership data."
        canonicalUrl="/pricing"
        ogType="website"
        keywords={[
          "CLEANBI pricing",
          "laundromat location analysis",
          "laundromat investment tool",
          "location intelligence software",
          "competitor analysis pricing",
          "laundromat due diligence",
          "property scoring tool",
          "laundromat site selection",
          "investment analysis software",
          "laundromat market research"
        ]}
        faqs={cleanbiPricingFaqs}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" }
        ]}
      />
      <div className="min-h-screen bg-background py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-3 sm:mb-4 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30" data-testid="badge-cleanbi-header">
              <Map className="h-3 w-3 mr-1" />
              CLEANBI Explorer - Location Intelligence
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 sm:mb-4" data-testid="text-pricing-title">
              Find Your Next Golden Opportunity
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 px-2" data-testid="text-pricing-subtitle">
              Score any address in seconds. Analyze demographics, competition, and investment potential with AI-powered intelligence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>72K+ community members</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Powered by Google Maps</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Real-time data</span>
              </div>
            </div>
          </div>

          {/* CLEANBI Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {cleanbiPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name}
                  className={`relative ${plan.popular ? 'ring-2 ring-[#C8A661] shadow-xl' : ''}`}
                  data-testid={`card-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8A661] text-white" data-testid="badge-most-popular">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-3 p-3 rounded-full ${plan.iconBg} w-fit`}>
                      <Icon className={`h-6 w-6 ${plan.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground mb-1">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                    <div className="my-4">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-black text-foreground">FREE</span>
                      ) : (
                        <>
                          <span className="text-3xl font-black text-foreground">${plan.price}</span>
                          <span className="text-muted-foreground">/mo</span>
                        </>
                      )}
                    </div>
                    <Link href={plan.name === "Enterprise" ? "/consultation" : "/cleanbi-explorer"}>
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-[#C8A661] hover:bg-[#B8964D] text-white' : ''}`}
                        variant={plan.popular ? "default" : "outline"}
                        data-testid={`button-${plan.name.toLowerCase()}`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="pt-0 px-4">
                    <div className="text-xs text-muted-foreground text-center mb-3 pb-3 border-b">
                      {plan.limits}
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                          <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${feature.startsWith('Everything') ? 'text-[#C8A661]' : 'text-green-500'}`} />
                          <span className={`${feature.startsWith('Everything') ? 'text-[#C8A661] font-medium' : 'text-muted-foreground'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-black text-center mb-2">
              Compare Plans
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8">
              See exactly what's included at each tier
            </p>
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold text-foreground min-w-[180px]">Feature</th>
                      <th className="text-center p-4 font-semibold text-foreground min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <Gift className="w-5 h-5 text-green-500" />
                          <span>Free</span>
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold text-foreground min-w-[100px] bg-[#C8A661]/10">
                        <div className="flex flex-col items-center gap-1">
                          <Zap className="w-5 h-5 text-[#C8A661]" />
                          <span>Starter</span>
                          <span className="text-xs text-muted-foreground font-normal">$29/mo</span>
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold text-foreground min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <Crown className="w-5 h-5 text-purple-500" />
                          <span>Pro</span>
                          <span className="text-xs text-muted-foreground font-normal">$79/mo</span>
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold text-foreground min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <Building2 className="w-5 h-5 text-blue-500" />
                          <span>Enterprise</span>
                          <span className="text-xs text-muted-foreground font-normal">$199/mo</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-muted/30">
                      <td colSpan={5} className="p-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Map className="w-4 h-4 text-[#C8A661]" />
                          Core Analysis
                        </div>
                      </td>
                    </tr>
                    {[
                      { feature: "CLEANBI Score & Grade", free: true, starter: true, pro: true, enterprise: true },
                      { feature: "Daily Analyses", free: "1/day", starter: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
                      { feature: "Competitor Count", free: true, starter: true, pro: true, enterprise: true },
                      { feature: "Street View", free: true, starter: true, pro: true, enterprise: true },
                      { feature: "Save & Share Analyses", free: true, starter: true, pro: true, enterprise: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/20">
                        <td className="p-3 text-muted-foreground">{row.feature}</td>
                        <td className="p-3 text-center">
                          {typeof row.free === 'boolean' ? (row.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />) : <span className="text-xs">{row.free}</span>}
                        </td>
                        <td className="p-3 text-center bg-[#C8A661]/5">
                          {typeof row.starter === 'boolean' ? (row.starter ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />) : <span className="text-xs font-medium text-[#C8A661]">{row.starter}</span>}
                        </td>
                        <td className="p-3 text-center">
                          {typeof row.pro === 'boolean' ? (row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />) : <span className="text-xs">{row.pro}</span>}
                        </td>
                        <td className="p-3 text-center">
                          {typeof row.enterprise === 'boolean' ? (row.enterprise ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />) : <span className="text-xs">{row.enterprise}</span>}
                        </td>
                      </tr>
                    ))}
                    
                    <tr className="bg-muted/30">
                      <td colSpan={5} className="p-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#C8A661]" />
                          Visual Intelligence
                        </div>
                      </td>
                    </tr>
                    {[
                      { feature: "3D Aerial Flyover", free: false, starter: true, pro: true, enterprise: true },
                      { feature: "Competition Heatmap", free: false, starter: true, pro: true, enterprise: true },
                      { feature: "Walk Score & Transit", free: false, starter: true, pro: true, enterprise: true },
                      { feature: "Solar Potential", free: false, starter: true, pro: true, enterprise: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/20">
                        <td className="p-3 text-muted-foreground">{row.feature}</td>
                        <td className="p-3 text-center">{row.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center bg-[#C8A661]/5">{row.starter ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center">{row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center">{row.enterprise ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                      </tr>
                    ))}
                    
                    <tr className="bg-muted/30">
                      <td colSpan={5} className="p-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-[#C8A661]" />
                          Investment Tools
                        </div>
                      </td>
                    </tr>
                    {[
                      { feature: "Property Value Estimates", free: false, starter: true, pro: true, enterprise: true },
                      { feature: "ROI Calculator", free: false, starter: false, pro: true, enterprise: true },
                      { feature: "Monte Carlo Simulation", free: false, starter: false, pro: true, enterprise: true },
                      { feature: "Utility Rate Analysis", free: false, starter: false, pro: true, enterprise: true },
                      { feature: "Drive-Time Catchment", free: false, starter: false, pro: true, enterprise: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/20">
                        <td className="p-3 text-muted-foreground">{row.feature}</td>
                        <td className="p-3 text-center">{row.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center bg-[#C8A661]/5">{row.starter ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center">{row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center">{row.enterprise ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                      </tr>
                    ))}
                    
                    <tr className="bg-muted/30">
                      <td colSpan={5} className="p-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#C8A661]" />
                          Enterprise Data
                        </div>
                      </td>
                    </tr>
                    {[
                      { feature: "Ownership Data", free: false, starter: false, pro: false, enterprise: true },
                      { feature: "Lien Detection", free: false, starter: false, pro: false, enterprise: true },
                      { feature: "Motivated Seller Score", free: false, starter: false, pro: false, enterprise: true },
                      { feature: "White-Label Reports", free: false, starter: false, pro: false, enterprise: true },
                      { feature: "Unlimited API Access", free: false, starter: false, pro: false, enterprise: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/20">
                        <td className="p-3 text-muted-foreground">{row.feature}</td>
                        <td className="p-3 text-center">{row.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center bg-[#C8A661]/5">{row.starter ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center">{row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                        <td className="p-3 text-center">{row.enterprise ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* FAQs */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-black text-center mb-6">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {cleanbiPricingFaqs.map((faq, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-[#C8A661]/10 border-[#C8A661]/30 mb-12">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4" data-testid="text-cta-title">
                Ready to Find Your Next Location?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto" data-testid="text-cta-subtitle">
                Join 72,000+ laundromat professionals using CLEANBI Explorer to make smarter investment decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cleanbi-explorer">
                  <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964D] text-white" data-testid="button-cta-try-free">
                    <Map className="h-5 w-5 mr-2" />
                    Try Free - 1 Analysis/Day
                  </Button>
                </Link>
                <Link href="/consultation">
                  <Button size="lg" variant="outline" data-testid="button-cta-demo">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
              <p className="text-muted-foreground text-sm mt-4">
                No credit card required for free tier
              </p>
            </CardContent>
          </Card>

          {/* Facebook Group CTA */}
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3" data-testid="text-facebook-cta-title">
                Part of the Largest Laundromat Community
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6" data-testid="text-facebook-cta-description">
                CLEANBI Explorer is built for the 72,000+ member "Advantage Laundry" Facebook community
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
    </>
  );
}
