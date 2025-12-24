import { SEOHead } from "@/components/SEOHead";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Check, Droplets, Flame, BarChart3,
  Shield, Clock, Sparkles, ArrowRight, Star, Upload,
  ChevronDown, ChevronUp, FileText, AlertTriangle, TrendingDown
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
  {
    icon: Upload,
    title: "AI Bill Scanning",
    description: "Upload your utility bills and our AI extracts all relevant data automatically"
  },
  {
    icon: BarChart3,
    title: "Benchmark Analysis",
    description: "Compare your costs against industry averages and similar-sized laundromats"
  },
  {
    icon: TrendingDown,
    title: "Savings Opportunities",
    description: "Identify rate optimization, equipment upgrades, and operational changes to reduce costs"
  },
  {
    icon: AlertTriangle,
    title: "Red Flag Detection",
    description: "Spot billing errors, unusual spikes, and potential equipment issues automatically"
  }
];

const FAQS = [
  {
    q: "What utility bills can I analyze?",
    a: "Our auditor supports electricity, gas, water, and sewer bills from any utility provider in the US. Simply upload photos or PDFs of your bills and our AI extracts the data automatically."
  },
  {
    q: "How much can I save on utility costs?",
    a: "Most laundromat owners find 10-25% in potential savings through rate optimization, equipment efficiency improvements, or correcting billing errors. High-volume operations often see even greater savings."
  },
  {
    q: "What is a good utility cost percentage for laundromats?",
    a: "Industry benchmarks show utilities should be 15-25% of gross revenue. If your utilities exceed 25%, there's likely significant room for optimization. Our calculator tracks your UPG (Utilities as Percentage of Gross) ratio."
  },
  {
    q: "Do I need to manually enter all my bill data?",
    a: "No! Our AI-powered bill scanner extracts data from photos or PDF uploads automatically. You can also manually enter data if you prefer."
  }
];

const TESTIMONIALS = [
  {
    name: "Robert K.",
    role: "Multi-unit Operator",
    quote: "Found $340/month in overcharges on my water bills that I'd been paying for years. Paid for the subscription in one month.",
    rating: 5
  },
  {
    name: "Sandra T.",
    role: "New Owner",
    quote: "The benchmarking showed my utility costs were 32% of revenue - way above average. Made changes and got it down to 21%.",
    rating: 5
  }
];

export default function UtilityBillLanding() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Laundromat Utility Bill Auditor",
        "url": "https://washbizhub.com/utility-bill-auditor",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "description": "Analyze and optimize laundromat utility costs with AI-powered bill scanning, benchmarking, and savings recommendations.",
        "offers": {
          "@type": "Offer",
          "price": "29",
          "priceCurrency": "USD",
          "description": "Starter plan from $29/month"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.7",
          "ratingCount": "412",
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
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://washbizhub.com/calculators" },
          { "@type": "ListItem", "position": 3, "name": "Utility Bill Auditor", "item": "https://washbizhub.com/utility-bill-auditor" }
        ]
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="Laundromat Utility Bill Auditor - Reduce Operating Costs | WashBizHub"
        description="Analyze and reduce your laundromat utility costs with AI-powered bill scanning. Compare against industry benchmarks, find billing errors, and optimize water, gas, and electricity expenses."
        keywords={[
          "laundromat utility costs",
          "laundromat utility bill auditor",
          "laundromat operating costs",
          "reduce laundromat expenses",
          "utility cost calculator",
          "laundromat water costs"
        ]}
        canonical="https://washbizhub.com/landing/utility-bill"
        structuredData={structuredData}
        ogType="website"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-500/5 via-background to-blue-500/5 py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300/30 px-4 py-1.5">
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    AI-Powered Analysis
                  </Badge>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                    Utility Bill <span className="text-green-600 dark:text-green-400">Auditor</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                    Stop overpaying on utilities. Our AI analyzes your bills, benchmarks against industry averages, and finds savings opportunities.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/utility-bill-auditor">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold h-14 px-8 group w-full sm:w-auto" data-testid="button-audit-bills">
                      <FileText className="w-5 h-5 mr-2" />
                      Audit My Bills
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="h-14 px-8 w-full sm:w-auto" data-testid="button-view-pricing-utility">
                      View Pricing
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">Avg. 18% savings found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">2-minute upload</span>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <Card className="border-green-200 dark:border-green-800/50 shadow-xl bg-card/80 backdrop-blur">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-4 rounded-full bg-green-100 dark:bg-green-900/30 w-fit mb-4">
                    <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl">Utility Analysis</CardTitle>
                  <CardDescription>Sample 3-month audit results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span>Electricity</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$1,847/mo</p>
                        <p className="text-xs text-green-600">12% below avg</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        <span>Water/Sewer</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$2,234/mo</p>
                        <p className="text-xs text-red-500">18% above avg</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span>Gas</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$423/mo</p>
                        <p className="text-xs text-green-600">On target</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Potential Monthly Savings</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">$312</p>
                  </div>
                  <Link href="/utility-bill-auditor">
                    <Button className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white" data-testid="button-analyze-yours">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Your Bills
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
                Complete Utility Cost Management
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From AI-powered bill scanning to actionable savings recommendations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, idx) => (
                <Card key={idx} className="border-border/50 hover-elevate">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 w-fit mb-3">
                      <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
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

        {/* Testimonials */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Real Savings from Real Owners</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((testimonial, idx) => (
                <Card key={idx} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />
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
        <section className="py-20 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <Card 
                  key={idx} 
                  className={`border-border/50 cursor-pointer transition-all ${expandedFaq === idx ? 'border-green-500/50' : ''}`}
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
        <section className="py-20 bg-gradient-to-br from-green-500/5 to-blue-500/5">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stop Overpaying on Utilities
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Upload your bills now and see how much you could save.
            </p>
            <Link href="/utility-bill-auditor">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold h-14 px-10 group" data-testid="button-final-cta-utility">
                <Upload className="w-5 h-5 mr-2" />
                Start Free Utility Audit
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
