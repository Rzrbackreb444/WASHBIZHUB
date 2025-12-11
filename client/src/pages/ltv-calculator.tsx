import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WASHBIZHUB_SEO_DEFAULTS } from "@/lib/design-system";
import { 
  Users, TrendingUp, DollarSign, Calendar, Target, 
  BarChart3, Heart, RefreshCcw, Sparkles, AlertTriangle, CheckCircle, Info
} from "lucide-react";

const ltvCalculatorConfig: PremiumCalculatorConfig = {
  id: "customer-ltv-calculator",
  name: "Customer Lifetime Value (LTV) Calculator",
  description: "Calculate the total revenue a customer generates over their entire relationship with your laundromat. Industry benchmark: $1,152 average LTV (24 months @ $12/visit x 4 visits/month).",
  category: "Customer Intelligence",
  inputs: [
    {
      name: "avgVisitRevenue",
      label: "Average Revenue per Visit",
      type: "slider",
      defaultValue: 12,
      min: 5,
      max: 50,
      step: 0.50,
      prefix: "$",
      tooltip: "Average amount a customer spends per visit. Industry average: $12 for self-service, $25-40 for WDF orders.",
    },
    {
      name: "visitsPerMonth",
      label: "Visits per Month",
      type: "slider",
      defaultValue: 4,
      min: 1,
      max: 12,
      step: 0.5,
      tooltip: "How often a typical customer visits your laundromat. Industry average: 4 visits/month (weekly laundry).",
    },
    {
      name: "customerLifespanMonths",
      label: "Customer Lifespan (Months)",
      type: "slider",
      defaultValue: 24,
      min: 6,
      max: 60,
      step: 1,
      tooltip: "Average months a customer stays active. Industry average: 18-24 months before moving or switching.",
    },
    {
      name: "retentionRate",
      label: "Monthly Retention Rate",
      type: "slider",
      defaultValue: 95,
      min: 70,
      max: 99,
      step: 0.5,
      suffix: "%",
      tooltip: "Percentage of customers who return each month. Well-run stores achieve 90-95% retention.",
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
      tooltip: "Your gross profit margin after direct costs (utilities, supplies). Industry average: 70-85%.",
    },
    {
      name: "referralRate",
      label: "Referral Rate",
      type: "slider",
      defaultValue: 15,
      min: 0,
      max: 50,
      step: 1,
      suffix: "%",
      tooltip: "Percentage of new customers from referrals. Good programs achieve 15-30% referral rates.",
    },
    {
      name: "discountRate",
      label: "Annual Discount Rate",
      type: "slider",
      defaultValue: 10,
      min: 5,
      max: 20,
      step: 0.5,
      suffix: "%",
      tooltip: "Rate to discount future cash flows to present value. Higher rates = more conservative LTV.",
    },
  ],
  outputs: [
    {
      name: "simpleLTV",
      label: "Simple LTV",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Basic lifetime value: Revenue per visit × Visits × Lifespan",
    },
    {
      name: "grossProfitLTV",
      label: "Gross Profit LTV",
      format: "currency",
      decimals: 0,
      description: "Lifetime value after direct costs (using gross margin)",
    },
    {
      name: "retentionAdjustedLTV",
      label: "Retention-Adjusted LTV",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "LTV accounting for customer churn over time",
    },
    {
      name: "presentValueLTV",
      label: "Present Value LTV (DCF)",
      format: "currency",
      decimals: 0,
      description: "Time-value-adjusted LTV using discount rate",
    },
    {
      name: "monthlyRevPerCustomer",
      label: "Monthly Revenue/Customer",
      format: "currency",
      decimals: 2,
      description: "Average monthly revenue from each customer",
    },
    {
      name: "annualRevPerCustomer",
      label: "Annual Revenue/Customer",
      format: "currency",
      decimals: 0,
      description: "Average annual revenue from each customer",
    },
    {
      name: "referralValue",
      label: "Referral Value Add",
      format: "currency",
      decimals: 0,
      description: "Additional value from customer referrals",
    },
    {
      name: "totalLTV",
      label: "Total Customer Value",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Complete lifetime value including referrals",
    },
    {
      name: "churnRate",
      label: "Monthly Churn Rate",
      format: "percentage",
      decimals: 1,
      description: "Percentage of customers lost each month",
    },
    {
      name: "expectedLifespan",
      label: "Expected Lifespan (Retention-Based)",
      format: "number",
      decimals: 1,
      description: "Average customer lifespan based on retention rate",
    },
  ],
  formulas: {
    monthlyRevPerCustomer: "avgVisitRevenue * visitsPerMonth",
    annualRevPerCustomer: "monthlyRevPerCustomer * 12",
    simpleLTV: "avgVisitRevenue * visitsPerMonth * customerLifespanMonths",
    grossProfitLTV: "simpleLTV * (grossMargin / 100)",
    churnRate: "100 - retentionRate",
    expectedLifespan: "retentionRate > 0 ? 1 / ((100 - retentionRate) / 100) : customerLifespanMonths",
    retentionAdjustedLTV: "monthlyRevPerCustomer * expectedLifespan * (grossMargin / 100)",
    monthlyDiscountRate: "discountRate / 12 / 100",
    presentValueLTV: "monthlyRevPerCustomer * (grossMargin / 100) * (1 / (monthlyDiscountRate + (1 - retentionRate / 100)))",
    referralValue: "retentionAdjustedLTV * (referralRate / 100)",
    totalLTV: "retentionAdjustedLTV + referralValue",
  },
  charts: [
    {
      type: "bar",
      title: "LTV Breakdown",
      dataKeys: ["simpleLTV", "grossProfitLTV", "retentionAdjustedLTV", "totalLTV"],
      labels: ["Simple LTV", "Gross Profit", "Retention-Adj", "Total LTV"],
      colors: ["#3B82F6", "#22C55E", "#F59E0B", "#C8A661"],
    },
    {
      type: "pie",
      title: "Revenue Sources",
      dataKeys: ["retentionAdjustedLTV", "referralValue"],
      labels: ["Direct Revenue", "Referral Value"],
      colors: ["#3B82F6", "#22C55E"],
    },
  ],
  tips: [
    "Industry benchmark: $1,152 average LTV (24 months × $12/visit × 4 visits/month)",
    "90% of customers become repeat customers at well-run laundromats",
    "WDF customers have 2-3x higher LTV than self-service only",
    "Loyalty programs can increase LTV by 15-30%",
    "Target LTV:CAC ratio of at least 3:1 for sustainable growth",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

export default function LTVCalculator() {
  return (
    <>
      <SEO
        title="Customer Lifetime Value (LTV) Calculator | Laundromat Customer Analytics | WashBizHub"
        description="Calculate customer lifetime value for your laundromat. Understand revenue per customer, retention impact, referral value, and optimize your customer acquisition strategy."
        canonicalUrl="/ltv-calculator"
        ogType="website"
        keywords={[
          "customer lifetime value calculator",
          "laundromat LTV",
          "customer retention laundromat",
          "laundromat customer analytics",
          "LTV calculator",
          "customer value laundry",
          "laundromat customer metrics",
          "retention rate calculator",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Calculators", href: "/calculators-hub" },
              { label: "Customer LTV Calculator" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Customer Lifetime Value Calculator
                </h1>
                <p className="text-muted-foreground">
                  Understand the true value of your customers over time
                </p>
              </div>
              <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Customer Intelligence
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Industry Avg LTV</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-industry-avg">$1,152</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <RefreshCcw className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Visit Frequency</p>
                    <p className="text-2xl font-bold text-foreground">4x/month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Lifespan</p>
                    <p className="text-2xl font-bold text-foreground">24 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target LTV:CAC</p>
                    <p className="text-2xl font-bold text-foreground">3:1+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-blue-500/30 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400">Understanding Customer LTV</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Customer Lifetime Value (LTV) measures the total revenue a customer generates throughout their relationship 
              with your laundromat. Higher LTV means more profitable customers and justifies higher acquisition costs.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={ltvCalculatorConfig} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Ways to Increase LTV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Add WDF services</strong> - Increases average transaction 2-3x
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Loyalty programs</strong> - Boost retention by 15-25%
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Referral incentives</strong> - Each referral adds 15-20% to LTV
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Better experience</strong> - Clean, modern stores retain 90%+ customers
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  LTV Benchmarks by Service Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Self-Service Only</span>
                  <Badge variant="outline">$800 - $1,200</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Self-Service + WDF</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">$1,500 - $2,500</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">WDF + Pickup/Delivery</span>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">$2,500 - $4,000</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Commercial Accounts</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">$5,000 - $15,000+</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}
