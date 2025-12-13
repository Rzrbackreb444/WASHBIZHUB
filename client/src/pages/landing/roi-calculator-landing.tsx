import { SeoHead } from "@/components/SeoHead";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, Check, TrendingUp, DollarSign, BarChart3, 
  Shield, Clock, Sparkles, ArrowRight, Star, Zap, Crown,
  ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "5-Year Cash Flow Projections",
    description: "Model revenue growth, expense trends, and net income over 5 years with adjustable assumptions"
  },
  {
    icon: DollarSign,
    title: "Cap Rate & NOI Analysis",
    description: "Calculate net operating income and capitalization rate for accurate property valuations"
  },
  {
    icon: BarChart3,
    title: "Sensitivity Analysis",
    description: "Test how changes in rent, revenue, or expenses impact your overall returns"
  },
  {
    icon: Calculator,
    title: "Cash-on-Cash Return",
    description: "See your actual return on invested capital after debt service and operating costs"
  }
];

const FAQS = [
  {
    q: "What is ROI for a laundromat investment?",
    a: "Return on Investment (ROI) measures the profitability of your laundromat relative to the total capital invested. A good laundromat ROI typically ranges from 20-35% annually, significantly higher than most real estate investments."
  },
  {
    q: "How does your ROI calculator work?",
    a: "Our calculator uses industry-standard formulas including Cap Rate, Cash-on-Cash Return, and Internal Rate of Return (IRR). Enter your purchase price, expected revenue, operating expenses, and financing terms to get comprehensive projections."
  },
  {
    q: "What factors affect laundromat ROI?",
    a: "Key factors include: location demographics, competition density, utility costs, equipment age, staffing model, rent/lease terms, and financing structure. Our CLEANBI system analyzes all of these automatically."
  },
  {
    q: "Is this calculator free?",
    a: "The basic ROI calculator is free for all users. Advanced features like Monte Carlo simulations, sensitivity analysis, and PDF exports require a Starter ($29/mo) or Pro ($99/mo) subscription."
  }
];

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    role: "First-time Investor",
    quote: "The ROI calculator helped me understand exactly what returns to expect. I closed on my first laundromat 60 days later.",
    rating: 5
  },
  {
    name: "Linda S.",
    role: "Multi-unit Operator",
    quote: "I use this for every acquisition now. The sensitivity analysis alone has saved me from two bad deals.",
    rating: 5
  }
];

export default function ROICalculatorLanding() {
  const { isAuthenticated } = useAuth();
  const { tier } = useSubscription();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Laundromat ROI Calculator",
        "url": "https://washbizhub.com/roi-calculator",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "description": "Calculate return on investment for laundromat acquisitions with 5-year projections, cap rate analysis, and cash-on-cash returns.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free basic calculator, premium features from $29/month"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "847",
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
          { "@type": "ListItem", "position": 3, "name": "ROI Calculator", "item": "https://washbizhub.com/roi-calculator" }
        ]
      }
    ]
  };

  return (
    <>
      <SeoHead
        title="Laundromat ROI Calculator - Free Investment Returns Analysis | WashBizHub"
        description="Calculate your laundromat investment returns with our free ROI calculator. Get 5-year cash flow projections, cap rate analysis, and cash-on-cash returns. Used by 73,000+ investors."
        keywords={[
          "laundromat ROI calculator",
          "laundromat investment returns",
          "coin laundry ROI",
          "laundromat cap rate calculator",
          "laundromat cash flow projections",
          "laundromat investment analysis"
        ]}
        canonical="https://washbizhub.com/landing/roi-calculator"
        structuredData={structuredData}
        ogType="website"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-accent/10 text-accent border-accent/30 px-4 py-1.5">
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-accent" />
                    Trusted by 73,000+ Investors
                  </Badge>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                    Laundromat ROI <span className="text-accent">Calculator</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                    Know exactly what returns to expect before you buy. Calculate cap rates, cash-on-cash returns, and 5-year projections in minutes.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/roi-calculator">
                    <Button size="lg" className="btn-premium-gold text-white font-semibold h-14 px-8 group w-full sm:w-auto" data-testid="button-try-calculator">
                      <Calculator className="w-5 h-5 mr-2" />
                      Try Free Calculator
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
                    <Shield className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Results in 60 seconds</span>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <Card className="border-accent/20 shadow-xl bg-card/80 backdrop-blur">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-4 rounded-full bg-accent/10 w-fit mb-4">
                    <TrendingUp className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">Sample Analysis</CardTitle>
                  <CardDescription>Based on $350,000 acquisition</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Annual NOI</p>
                      <p className="text-2xl font-bold text-foreground">$87,500</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Cap Rate</p>
                      <p className="text-2xl font-bold text-accent">25.0%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Cash-on-Cash</p>
                      <p className="text-2xl font-bold text-foreground">32.1%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">5-Year IRR</p>
                      <p className="text-2xl font-bold text-accent">41.8%</p>
                    </div>
                  </div>
                  <Link href="/roi-calculator">
                    <Button className="w-full mt-4" data-testid="button-calculate-yours">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Calculate Your ROI
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for Investment Analysis
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our ROI calculator gives you the same financial metrics used by professional brokers and institutional investors.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, idx) => (
                <Card key={idx} className="border-border/50 hover-elevate">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-accent/10 w-fit mb-3">
                      <feature.icon className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
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
              <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground">Start free, upgrade when you need more power</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Tier */}
              <Card className="border-border">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Free</Badge>
                  <CardTitle className="text-2xl">Basic ROI</CardTitle>
                  <div className="text-3xl font-bold">$0</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {["Basic ROI calculation", "Cap rate analysis", "Simple projections", "Community support"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/roi-calculator">
                    <Button variant="outline" className="w-full" data-testid="button-start-free">
                      Start Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Starter Tier */}
              <Card className="border-accent/50 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-white">MOST POPULAR</Badge>
                </div>
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-accent/10 text-accent border-accent/30">
                    <Zap className="w-3 h-3 mr-1" />
                    Starter
                  </Badge>
                  <CardTitle className="text-2xl">Pro Analysis</CardTitle>
                  <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {["Everything in Free", "5-year projections", "Sensitivity analysis", "PDF exports", "Email support"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing">
                    <Button className="w-full btn-premium-gold text-white" data-testid="button-start-starter">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro Tier */}
              <Card className="border-border">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                  <CardTitle className="text-2xl">Advanced</CardTitle>
                  <div className="text-3xl font-bold">$99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {["Everything in Starter", "Monte Carlo simulation", "API access", "Bulk analysis", "Priority support"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full" data-testid="button-start-pro">
                      Get Started
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
              <h2 className="text-3xl font-bold mb-4">What Investors Say</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((testimonial, idx) => (
                <Card key={idx} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
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
                  className={`border-border/50 cursor-pointer transition-all ${expandedFaq === idx ? 'border-accent/50' : ''}`}
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
        <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Calculate Your Returns?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 73,000+ investors who use WashBizHub to make smarter laundromat investments.
            </p>
            <Link href="/roi-calculator">
              <Button size="lg" className="btn-premium-gold text-white font-semibold h-14 px-10 group" data-testid="button-final-cta">
                <Calculator className="w-5 h-5 mr-2" />
                Start Free ROI Analysis
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
