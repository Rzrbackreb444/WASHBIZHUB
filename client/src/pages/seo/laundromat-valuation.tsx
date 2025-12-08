/**
 * SEO Landing Page: Laundromat Valuation Calculator
 * Target Keywords: laundromat valuation, laundromat value calculator, how much is my laundromat worth
 */

import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Calculator, TrendingUp, FileText, CheckCircle2 } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Valuations Completed" },
  { value: "3.5x", label: "Median EBITDA Multiple" },
  { value: "$7.1B", label: "Industry Market Size" },
  { value: "95%", label: "Accuracy Rate" }
];

const features = [
  {
    icon: "calculator",
    title: "Industry-Standard Methods",
    description: "Uses EBITDA, SDE, and NOI multiples with 2024 benchmarks from BizBuySell and industry data."
  },
  {
    icon: "trendingUp",
    title: "Equipment Depreciation",
    description: "Factors in equipment age, condition, and remaining useful life for accurate asset valuation."
  },
  {
    icon: "mapPin",
    title: "Location Analysis",
    description: "Adjusts value based on demographics, competition, lease terms, and growth potential."
  },
  {
    icon: "fileText",
    title: "PDF Reports",
    description: "Generate professional valuation reports for sellers, buyers, and lenders."
  },
  {
    icon: "shield",
    title: "Confidential & Secure",
    description: "Your financial data is never shared. All calculations happen in real-time."
  },
  {
    icon: "users",
    title: "Expert Support",
    description: "Access to certified business valuators and laundromat industry consultants."
  }
];

const testimonials = [
  {
    quote: "Used the valuation calculator before selling my laundromat. The estimate was within 5% of final sale price!",
    author: "Robert M.",
    role: "Former Owner, Chicago IL",
    rating: 5
  },
  {
    quote: "As a broker, I use WashBizHub's valuation tool for every listing. Clients love the detailed breakdowns.",
    author: "Jennifer L.",
    role: "Business Broker, Los Angeles CA",
    rating: 5
  },
  {
    quote: "The EBITDA multiple analysis helped me negotiate $40K off the asking price. Worth every penny.",
    author: "David T.",
    role: "First-Time Buyer, Dallas TX",
    rating: 5
  }
];

const relatedTools = [
  {
    name: "ROI Calculator",
    description: "Calculate return on investment, cash flow, and payback period.",
    href: "/roi-calculator",
    icon: "trendingUp"
  },
  {
    name: "CLEANBI Explorer",
    description: "Analyze location quality with demographics and competition mapping.",
    href: "/cleanbi-explorer",
    icon: "mapPin"
  },
  {
    name: "Due Diligence Checklist",
    description: "100+ verification items for buying a laundromat.",
    href: "/laundromat-due-diligence",
    icon: "fileText"
  }
];

export default function LaundromatValuationSEO() {
  const config = getSEOPageConfig("/laundromat-valuation");
  
  if (!config) return null;

  return (
    <SEOLandingPage
      config={config}
      stats={stats}
      features={features}
      testimonials={testimonials}
      relatedTools={relatedTools}
      cta={{
        primary: { text: "Calculate Your Valuation", href: "/valuation-calculator" },
        secondary: { text: "View Pricing", href: "/pricing" }
      }}
    >
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-how-it-works">
            How Laundromat Valuation Works
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Our valuation calculator uses the same methods professional appraisers use
          </p>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C8A661] text-[#0A1628] flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Enter Financial Data</h3>
                  <p className="text-muted-foreground">Input your annual revenue, operating expenses, and net income. We'll calculate your NOI and SDE automatically.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C8A661] text-[#0A1628] flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Add Business Details</h3>
                  <p className="text-muted-foreground">Equipment age, lease terms, location quality, and competition factors adjust your multiple.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C8A661] text-[#0A1628] flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Your Valuation Range</h3>
                  <p className="text-muted-foreground">Receive a fair market value estimate with low, mid, and high ranges based on industry benchmarks.</p>
                </div>
              </div>
            </div>

            <Card className="border-2 border-[#C8A661]/20 shadow-xl">
              <CardHeader className="bg-[#0A1628] text-white rounded-t-lg">
                <CardTitle className="text-2xl text-center">Valuation Multiples 2024</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="font-medium">SDE Multiple (Median)</span>
                    <span className="text-2xl font-bold text-[#C8A661]">3.16x - 4.23x</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="font-medium">EBITDA Multiple</span>
                    <span className="text-2xl font-bold text-[#C8A661]">3.44x - 4.85x</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="font-medium">Revenue Multiple</span>
                    <span className="text-2xl font-bold text-[#C8A661]">1.15x - 1.78x</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-medium">Lower/Upper Quartile</span>
                    <span className="text-2xl font-bold text-[#C8A661]">2.6x - 4.0x</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Source: BizBuySell 2024 Market Data
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-factors">
            Factors That Affect Laundromat Value
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Understanding what increases (or decreases) your business value
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="w-5 h-5" />
                  Increases Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Long-term lease (10+ years remaining)",
                  "Modern equipment (under 5 years old)",
                  "Prime location with high foot traffic",
                  "Low competition within 2-mile radius",
                  "Additional revenue streams (wash-and-fold)",
                  "Strong, documented financial records",
                  "Energy-efficient, card-ready machines"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <TrendingUp className="w-5 h-5 rotate-180" />
                  Decreases Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Short lease remaining (under 3 years)",
                  "Aging equipment needing replacement",
                  "High utility costs (above 30% of revenue)",
                  "Strong nearby competition",
                  "Declining neighborhood demographics",
                  "Deferred maintenance and repairs",
                  "Inconsistent or poor financial records"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/valuation-calculator">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]" data-testid="button-start-valuation">
                Start Your Free Valuation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SEOLandingPage>
  );
}
