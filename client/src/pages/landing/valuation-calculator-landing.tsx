import { SeoHead } from "@/components/SeoHead";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, Check, DollarSign, BarChart3, TrendingUp,
  Shield, Clock, Sparkles, ArrowRight, Star, Zap, Crown,
  ChevronDown, ChevronUp, Building2, Scale
} from "lucide-react";
import { useState } from "react";

const VALUATION_METHODS = [
  {
    icon: DollarSign,
    title: "Income Approach",
    description: "Value based on Net Operating Income (NOI) and cap rate - the industry standard for laundromats"
  },
  {
    icon: BarChart3,
    title: "Multiple of SDE",
    description: "Seller's Discretionary Earnings multiplied by industry-standard 2.5-4x multiples"
  },
  {
    icon: TrendingUp,
    title: "Revenue Multiples",
    description: "Quick valuation based on annual gross revenue with location-adjusted multipliers"
  },
  {
    icon: Building2,
    title: "Asset-Based",
    description: "Equipment value plus lease value for distressed or below-market properties"
  }
];

const FAQS = [
  {
    q: "How do you value a laundromat?",
    a: "Laundromats are typically valued using the income approach (NOI × cap rate multiple) or SDE multiple method. A well-run laundromat usually sells for 2.5-4x Seller's Discretionary Earnings, or at cap rates between 15-30% depending on location and condition."
  },
  {
    q: "What cap rate should I use for a laundromat?",
    a: "Cap rates for laundromats typically range from 15-30%. Lower cap rates (15-20%) apply to premium locations with strong demographics, while higher cap rates (25-30%) apply to smaller markets or older facilities. Our calculator adjusts based on your location's CLEANBI score."
  },
  {
    q: "How much is a laundromat worth?",
    a: "Most laundromats sell for $100,000 to $1,000,000+. The value depends on annual revenue (typically 1.5-2.5x), equipment age, lease terms, and location quality. Use our calculator for a precise estimate based on your specific numbers."
  },
  {
    q: "Is this valuation calculator accurate?",
    a: "Our calculator uses the same methodologies as professional business brokers and appraisers. It's designed to give you a realistic range, not a guarantee. For acquisitions over $500K, we recommend also getting a professional appraisal."
  }
];

const TESTIMONIALS = [
  {
    name: "James R.",
    role: "Business Broker",
    quote: "I use WashBizHub's valuation tool with every client. It matches my manual calculations and saves hours of work.",
    rating: 5
  },
  {
    name: "Patricia M.",
    role: "Seller",
    quote: "The valuation report helped me price my laundromat correctly. Sold within 45 days at asking price.",
    rating: 5
  }
];

export default function ValuationCalculatorLanding() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Laundromat Valuation Calculator",
        "url": "https://washbizhub.com/valuation-calculator",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "description": "Calculate the fair market value of any laundromat using income approach, SDE multiples, and asset-based methods.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free basic valuation, pro features from $99/month"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "623",
          "bestRating": "5"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://washbizhub.com" },
          { "@type": "ListItem", "position": 2, "name": "Calculators", "item": "https://washbizhub.com/calculators" },
          { "@type": "ListItem", "position": 3, "name": "Valuation Calculator", "item": "https://washbizhub.com/valuation-calculator" }
        ]
      }
    ]
  };

  return (
    <>
      <SeoHead
        title="Laundromat Valuation Calculator - Know What It's Worth | WashBizHub"
        description="Calculate the fair market value of any laundromat. Use income approach, SDE multiples, and cap rate analysis. Trusted by 72,000+ investors and brokers."
        keywords={[
          "laundromat valuation calculator",
          "how much is a laundromat worth",
          "laundromat business valuation",
          "coin laundry valuation",
          "laundromat price calculator",
          "laundromat cap rate"
        ]}
        canonical="https://washbizhub.com/landing/valuation-calculator"
        structuredData={structuredData}
        ogType="website"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-500/5 via-background to-accent/5 py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300/30 px-4 py-1.5">
                    <Scale className="w-3.5 h-3.5 mr-1.5" />
                    Pro Feature
                  </Badge>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                    Laundromat <span className="text-purple-600 dark:text-purple-400">Valuation</span> Calculator
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                    Know exactly what a laundromat is worth before you buy or sell. Multiple valuation methods with industry-standard formulas.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/valuation-calculator">
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold h-14 px-8 group w-full sm:w-auto" data-testid="button-try-valuation">
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Valuation
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="h-14 px-8 w-full sm:w-auto" data-testid="button-view-pricing">
                      View Pricing
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Broker-grade accuracy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Results in 2 minutes</span>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <Card className="border-purple-200 dark:border-purple-800/50 shadow-xl bg-card/80 backdrop-blur">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 w-fit mb-4">
                    <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl">Sample Valuation</CardTitle>
                  <CardDescription>Based on $18K monthly revenue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Income Approach</p>
                      <p className="text-2xl font-bold text-foreground">$432K</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">SDE Multiple</p>
                      <p className="text-2xl font-bold text-purple-600">$385K</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Revenue Multiple</p>
                      <p className="text-2xl font-bold text-foreground">$410K</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Fair Value Range</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">$385-432K</p>
                    </div>
                  </div>
                  <Link href="/valuation-calculator">
                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white" data-testid="button-value-yours">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Value Your Laundromat
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Valuation Methods */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Four Industry-Standard Valuation Methods
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our calculator uses the same methodologies as professional business appraisers and M&A advisors.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUATION_METHODS.map((method, idx) => (
                <Card key={idx} className="border-border/50 hover-elevate">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 w-fit mb-3">
                      <method.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tier Comparison */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Valuation Tools by Plan</h2>
              <p className="text-muted-foreground">Advanced valuation requires Pro subscription</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free/Starter */}
              <Card className="border-border">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Free & Starter</Badge>
                  <CardTitle className="text-2xl">Basic Valuation</CardTitle>
                  <div className="text-3xl font-bold">$0-29<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {["Revenue multiple estimate", "Basic cap rate calculator", "SDE estimate", "Community benchmarks"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/calculators">
                    <Button variant="outline" className="w-full" data-testid="button-basic-valuation">
                      Try Basic Valuation
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro */}
              <Card className="border-purple-500/50 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">PRO FEATURE</Badge>
                </div>
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                  <CardTitle className="text-2xl">Full Valuation Suite</CardTitle>
                  <div className="text-3xl font-bold">$99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {["All 4 valuation methods", "Monte Carlo simulation", "Comparable sales data", "PDF valuation report", "Sensitivity analysis", "Expert support"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-purple-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" data-testid="button-pro-valuation">
                      Start 7-Day Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Trusted by Professionals</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((testimonial, idx) => (
                <Card key={idx} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-purple-500 text-purple-500" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <Card 
                  key={idx} 
                  className={`border-border/50 cursor-pointer transition-all ${expandedFaq === idx ? 'border-purple-500/50' : ''}`}
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">{faq.q}</CardTitle>
                      {expandedFaq === idx ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedFaq === idx && (
                    <CardContent className="pt-0 pb-4">
                      <p className="text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-purple-500/5 to-accent/5">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Know What It's Worth Before You Buy
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Don't overpay for your next laundromat. Get an accurate valuation in minutes.
            </p>
            <Link href="/valuation-calculator">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold h-14 px-10 group" data-testid="button-final-cta-valuation">
                <Calculator className="w-5 h-5 mr-2" />
                Start Valuation Calculator
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
