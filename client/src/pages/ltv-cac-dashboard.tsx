import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Scale, TrendingUp, DollarSign, Target, ArrowRight,
  BarChart3, Sparkles, AlertTriangle, CheckCircle, Info, Gauge
} from "lucide-react";

const ltvCacConfig: PremiumCalculatorConfig = {
  id: "ltv-cac-ratio-dashboard",
  name: "LTV:CAC Ratio Dashboard",
  description: "The most important metric for sustainable growth. Compare customer lifetime value to acquisition cost. Target: 3:1 minimum, 5:1+ excellent.",
  category: "Customer Intelligence",
  inputs: [
    {
      name: "avgVisitRevenue",
      label: "Avg Revenue per Visit",
      type: "slider",
      defaultValue: 12,
      min: 5,
      max: 50,
      step: 0.50,
      prefix: "$",
      tooltip: "Average customer spend per visit. Industry: $12 self-service, $25-40 WDF.",
    },
    {
      name: "visitsPerMonth",
      label: "Visits per Month",
      type: "slider",
      defaultValue: 4,
      min: 1,
      max: 12,
      step: 0.5,
      tooltip: "Customer visit frequency. Industry average: 4x/month.",
    },
    {
      name: "customerLifespanMonths",
      label: "Customer Lifespan (Months)",
      type: "slider",
      defaultValue: 24,
      min: 6,
      max: 60,
      step: 1,
      tooltip: "Average customer relationship length. Industry: 18-24 months.",
    },
    {
      name: "grossMargin",
      label: "Gross Margin",
      type: "slider",
      defaultValue: 75,
      min: 50,
      max: 90,
      step: 1,
      suffix: "%",
      tooltip: "Profit margin after direct costs. Industry: 70-85%.",
    },
    {
      name: "monthlyMarketingBudget",
      label: "Monthly Marketing Budget",
      type: "slider",
      defaultValue: 1000,
      min: 100,
      max: 10000,
      step: 100,
      prefix: "$",
      tooltip: "Total monthly marketing/advertising spend.",
    },
    {
      name: "newCustomersPerMonth",
      label: "New Customers per Month",
      type: "slider",
      defaultValue: 50,
      min: 5,
      max: 200,
      step: 5,
      tooltip: "Total new customers acquired monthly from all channels.",
    },
  ],
  outputs: [
    {
      name: "customerLTV",
      label: "Customer LTV",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Gross profit lifetime value per customer",
    },
    {
      name: "customerCAC",
      label: "Customer CAC",
      format: "currency",
      decimals: 2,
      highlight: true,
      description: "Cost to acquire each new customer",
    },
    {
      name: "ltvCacRatio",
      label: "LTV:CAC Ratio",
      format: "number",
      decimals: 1,
      highlight: true,
      description: "THE KEY METRIC - Target 3:1 minimum",
    },
    {
      name: "paybackMonths",
      label: "Payback Period",
      format: "number",
      decimals: 1,
      description: "Months to recover acquisition cost",
    },
    {
      name: "monthlyProfitPerCustomer",
      label: "Monthly Profit/Customer",
      format: "currency",
      decimals: 2,
      description: "Gross profit per customer per month",
    },
    {
      name: "annualCustomerValue",
      label: "Annual Customer Value",
      format: "currency",
      decimals: 0,
      description: "Yearly gross profit per customer",
    },
    {
      name: "marketingROI",
      label: "Marketing ROI",
      format: "percentage",
      decimals: 0,
      description: "Return on marketing investment",
    },
    {
      name: "breakEvenCustomers",
      label: "Break-Even Customers",
      format: "number",
      decimals: 0,
      description: "Customers needed to cover marketing cost",
    },
    {
      name: "healthScore",
      label: "Business Health Score",
      format: "number",
      decimals: 0,
      description: "Overall score based on LTV:CAC (0-100)",
    },
  ],
  formulas: {
    monthlyRevPerCustomer: "avgVisitRevenue * visitsPerMonth",
    monthlyProfitPerCustomer: "monthlyRevPerCustomer * (grossMargin / 100)",
    annualCustomerValue: "monthlyProfitPerCustomer * 12",
    customerLTV: "monthlyProfitPerCustomer * customerLifespanMonths",
    customerCAC: "newCustomersPerMonth > 0 ? monthlyMarketingBudget / newCustomersPerMonth : 0",
    ltvCacRatio: "customerCAC > 0 ? customerLTV / customerCAC : 0",
    paybackMonths: "monthlyProfitPerCustomer > 0 ? customerCAC / monthlyProfitPerCustomer : 0",
    lifetimeProfitPerCustomer: "customerLTV - customerCAC",
    marketingROI: "monthlyMarketingBudget > 0 ? ((customerLTV * newCustomersPerMonth) - (monthlyMarketingBudget * 12)) / (monthlyMarketingBudget * 12) * 100 : 0",
    breakEvenCustomers: "customerLTV > 0 ? monthlyMarketingBudget / (customerLTV / customerLifespanMonths) : 0",
    healthScore: "ltvCacRatio >= 6 ? 100 : ltvCacRatio >= 5 ? 90 : ltvCacRatio >= 4 ? 80 : ltvCacRatio >= 3 ? 70 : ltvCacRatio >= 2 ? 50 : ltvCacRatio >= 1 ? 30 : 10",
  },
  charts: [
    {
      type: "bar",
      title: "LTV vs CAC Comparison",
      dataKeys: ["customerLTV", "customerCAC"],
      labels: ["Customer LTV", "Customer CAC"],
      colors: ["#22C55E", "#EF4444"],
    },
    {
      type: "comparison",
      title: "Key Metrics",
      dataKeys: ["ltvCacRatio", "paybackMonths", "marketingROI"],
      labels: ["LTV:CAC", "Payback (mo)", "ROI %"],
      colors: ["#C8A661", "#3B82F6", "#22C55E"],
    },
  ],
  tips: [
    "LTV:CAC below 3:1 = unsustainable growth (spending too much to acquire)",
    "LTV:CAC of 3:1 = minimum viable ratio for profitability",
    "LTV:CAC of 5:1+ = excellent - efficient customer acquisition",
    "LTV:CAC above 8:1 = may be under-investing in growth",
    "Payback period should be under 6 months for healthy cash flow",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

function getRatioStatus(ratio: number): { status: string; color: string; description: string } {
  if (ratio >= 6) return { status: "Excellent", color: "text-green-500", description: "Very efficient acquisition" };
  if (ratio >= 5) return { status: "Great", color: "text-green-400", description: "Strong unit economics" };
  if (ratio >= 4) return { status: "Good", color: "text-lime-500", description: "Healthy growth trajectory" };
  if (ratio >= 3) return { status: "Acceptable", color: "text-yellow-500", description: "Minimum viable ratio" };
  if (ratio >= 2) return { status: "Warning", color: "text-orange-500", description: "Optimize acquisition" };
  return { status: "Critical", color: "text-red-500", description: "Spending too much" };
}

export default function LTVCACDashboard() {
  return (
    <>
      <SEO
        title="LTV:CAC Ratio Dashboard | Customer Unit Economics | WashBizHub"
        description="Calculate and optimize your LTV:CAC ratio - the most important metric for sustainable laundromat growth. Compare lifetime value to acquisition cost."
        canonicalUrl="/ltv-cac-dashboard"
        ogType="website"
        keywords={[
          "LTV CAC ratio calculator",
          "customer unit economics",
          "laundromat marketing ROI",
          "lifetime value acquisition cost",
          "customer profitability",
          "marketing efficiency laundromat",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Calculators", href: "/calculators-hub" },
              { label: "LTV:CAC Dashboard" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  LTV:CAC Ratio Dashboard
                </h1>
                <p className="text-muted-foreground">
                  The #1 metric for sustainable business growth
                </p>
              </div>
              <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Critical Metric
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-400 mb-2">&lt; 3:1</div>
                  <p className="text-sm font-semibold text-red-400">Unsustainable</p>
                  <p className="text-xs text-muted-foreground mt-1">Spending too much to acquire customers</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">3:1 - 5:1</div>
                  <p className="text-sm font-semibold text-yellow-400">Healthy</p>
                  <p className="text-xs text-muted-foreground mt-1">Sustainable growth range</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">5:1+</div>
                  <p className="text-sm font-semibold text-green-400">Excellent</p>
                  <p className="text-xs text-muted-foreground mt-1">Very efficient acquisition</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-amber-500/30 bg-amber-500/10">
            <Info className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-amber-400">Why LTV:CAC Matters</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              LTV:CAC compares what a customer is worth to what you spent acquiring them. 
              A ratio of 3:1 means each customer generates $3 in profit for every $1 spent on marketing - 
              the minimum for sustainable growth.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={ltvCacConfig} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  How to Improve LTV:CAC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Increase LTV:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Add WDF services (2-3x higher LTV)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Implement loyalty programs (+15-25% retention)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Improve customer experience
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Decrease CAC:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      Build referral programs (lowest CAC)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      Optimize local SEO (free traffic)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      Improve storefront visibility
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gauge className="w-5 h-5 text-amber-500" />
                  Related Calculators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/ltv-calculator">
                  <Button variant="outline" className="w-full justify-between" data-testid="link-ltv-calculator">
                    <span>Customer LTV Calculator</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/cac-calculator">
                  <Button variant="outline" className="w-full justify-between" data-testid="link-cac-calculator">
                    <span>Customer Acquisition Cost Calculator</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/labor-calculator">
                  <Button variant="outline" className="w-full justify-between" data-testid="link-labor-calculator">
                    <span>Labor Cost Calculator</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/utility-calculator">
                  <Button variant="outline" className="w-full justify-between" data-testid="link-utility-calculator">
                    <span>Utility Cost Calculator</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}
