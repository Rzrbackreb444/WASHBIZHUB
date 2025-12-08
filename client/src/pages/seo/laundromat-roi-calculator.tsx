/**
 * SEO Landing Page: Laundromat ROI Calculator
 * Target Keywords: laundromat ROI, laundromat return on investment, laundromat profit calculator
 */

import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, DollarSign, Calculator, Clock, CheckCircle2, PiggyBank } from "lucide-react";

const config = getSEOPageConfig("/laundromat-roi-calculator")!;

const stats = [
  { value: "20-35%", label: "Average Annual ROI" },
  { value: "3-5 yrs", label: "Payback Period" },
  { value: "15-25%", label: "Cash-on-Cash Return" },
  { value: "$7.1B", label: "Industry Size" }
];

const features = [
  {
    icon: "calculator",
    title: "Complete ROI Analysis",
    description: "Calculate total return, cash-on-cash, and payback period with industry benchmarks."
  },
  {
    icon: "trendingUp",
    title: "Cash Flow Projections",
    description: "Monthly and annual cash flow with financing scenarios included."
  },
  {
    icon: "dollarSign",
    title: "Expense Breakdown",
    description: "Detailed analysis of utilities, labor, rent, and operating costs."
  },
  {
    icon: "building",
    title: "Financing Calculator",
    description: "Model SBA loans, conventional financing, and seller financing options."
  },
  {
    icon: "target",
    title: "Industry Benchmarks",
    description: "Compare your projections to national averages and top performers."
  },
  {
    icon: "fileText",
    title: "Investment Reports",
    description: "Generate professional reports for partners and lenders."
  }
];

const testimonials = [
  {
    quote: "The ROI calculator showed 28% return. Two years in, I'm actually at 32%. Best investment decision I've made.",
    author: "Marcus D.",
    role: "Owner, Austin TX",
    rating: 5
  },
  {
    quote: "Used the payback period calculation to convince my partner. We bought the laundromat and hit breakeven in 3.5 years.",
    author: "Linda & Tom R.",
    role: "Investors, Phoenix AZ",
    rating: 5
  },
  {
    quote: "The financing comparison feature helped me choose SBA over conventional. Saved $400/month on payments.",
    author: "Kevin S.",
    role: "First-Time Buyer, Chicago IL",
    rating: 5
  }
];

const relatedTools = [
  {
    name: "Valuation Calculator",
    description: "Determine fair market value before investing.",
    href: "/valuation-calculator",
    icon: "calculator"
  },
  {
    name: "CLEANBI Explorer",
    description: "Analyze location quality for better ROI predictions.",
    href: "/cleanbi-explorer",
    icon: "mapPin"
  },
  {
    name: "SBA Readiness",
    description: "Check your eligibility for SBA financing.",
    href: "/sba-readiness",
    icon: "dollarSign"
  }
];

const roiFactors = [
  { label: "Gross Revenue", typical: "$120K-$300K/yr", description: "Total income from all sources" },
  { label: "Operating Expenses", typical: "50-65% of revenue", description: "Utilities, labor, supplies, maintenance" },
  { label: "Net Operating Income", typical: "35-50% of revenue", description: "Revenue minus all operating costs" },
  { label: "Debt Service", typical: "Varies", description: "Loan payments if financed" },
  { label: "Cash Flow", typical: "$40K-$100K+/yr", description: "Money in your pocket after all expenses" }
];

export default function LaundromatROICalculatorSEO() {
  return (
    <SEOLandingPage
      config={config}
      stats={stats}
      features={features}
      testimonials={testimonials}
      relatedTools={relatedTools}
      cta={{
        primary: { text: "Calculate Your ROI", href: "/roi-calculator" },
        secondary: { text: "View Pricing", href: "/pricing" }
      }}
    >
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-factors">
            Key ROI Factors
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Understanding the numbers behind laundromat profitability
          </p>

          <div className="max-w-4xl mx-auto space-y-4">
            {roiFactors.map((factor, idx) => (
              <Card key={idx} className="border" data-testid={`roi-factor-${idx}`}>
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#C8A661]" />
                      <span className="font-semibold">{factor.label}</span>
                    </div>
                    <div className="text-sm text-muted-foreground md:text-center flex-1">{factor.description}</div>
                    <Badge className="bg-[#0A1628] text-white self-start md:self-auto">{factor.typical}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-example">
            Sample ROI Calculation
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Real numbers for a typical mid-size laundromat acquisition
          </p>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-[#0A1628]/20">
              <CardHeader className="bg-[#0A1628] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span>Purchase Price</span>
                  <span className="font-bold">$350,000</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Down Payment (20%)</span>
                  <span className="font-bold">$70,000</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>SBA Loan Amount</span>
                  <span className="font-bold">$280,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Capital Invested</span>
                  <span className="font-bold text-[#C8A661]">$70,000</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#C8A661]/20">
              <CardHeader className="bg-[#C8A661] text-[#0A1628] rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Annual Returns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span>Gross Revenue</span>
                  <span className="font-bold">$180,000</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Operating Expenses (55%)</span>
                  <span className="font-bold">-$99,000</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Debt Service</span>
                  <span className="font-bold">-$36,000</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Net Cash Flow</span>
                  <span className="font-bold text-green-600">$45,000</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold">Cash-on-Cash ROI</span>
                  <span className="font-bold text-2xl text-green-600">64%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              *Example for illustration. Actual returns vary based on location, management, and market conditions.
            </p>
            <Link href="/roi-calculator">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]" data-testid="button-calculate">
                Calculate Your Specific ROI
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-why">
            Why Laundromats Are Great Investments
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Proven business model with consistent returns
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: PiggyBank, title: "Recession Resistant", description: "People always need clean clothes regardless of economic conditions" },
              { icon: Clock, title: "Semi-Passive Income", description: "Minimal day-to-day involvement once systems are in place" },
              { icon: TrendingUp, title: "Appreciation", description: "Well-maintained laundromats increase in value over time" },
              { icon: DollarSign, title: "Cash Business", description: "Quick returns, no receivables, immediate cash flow" }
            ].map((item, idx) => (
              <Card key={idx} className="text-center" data-testid={`why-${idx}`}>
                <CardContent className="pt-6">
                  <item.icon className="w-10 h-10 mx-auto mb-4 text-[#C8A661]" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SEOLandingPage>
  );
}
