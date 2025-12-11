import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Target, TrendingUp, DollarSign, Calendar, BarChart3,
  Scale, Percent, Clock, Sparkles, AlertTriangle, CheckCircle, Info
} from "lucide-react";

const breakEvenCalculatorConfig: PremiumCalculatorConfig = {
  id: "break-even-calculator",
  name: "Break-Even Analysis Calculator",
  description: "Calculate how many loads you need to cover all costs. Industry benchmark: Most laundromats break even at 40-60 loads/day depending on location and equipment mix.",
  category: "Financial Planning",
  inputs: [
    {
      name: "monthlyRent",
      label: "Monthly Rent",
      type: "slider",
      defaultValue: 3500,
      min: 1000,
      max: 15000,
      step: 100,
      prefix: "$",
      tooltip: "Monthly lease payment for your location. Industry average: $3,000-$8,000 depending on market.",
    },
    {
      name: "monthlyInsurance",
      label: "Monthly Insurance",
      type: "slider",
      defaultValue: 400,
      min: 100,
      max: 2000,
      step: 25,
      prefix: "$",
      tooltip: "Business insurance, liability, and equipment coverage. Typical range: $300-$800/month.",
    },
    {
      name: "monthlyLoanPayment",
      label: "Monthly Loan Payment",
      type: "slider",
      defaultValue: 2500,
      min: 0,
      max: 15000,
      step: 100,
      prefix: "$",
      tooltip: "Equipment financing or business loan payments. Set to 0 if equipment is paid off.",
    },
    {
      name: "otherFixedCosts",
      label: "Other Fixed Costs",
      type: "slider",
      defaultValue: 500,
      min: 0,
      max: 3000,
      step: 50,
      prefix: "$",
      tooltip: "Other monthly fixed expenses: phone, internet, security, accounting, etc.",
    },
    {
      name: "variableCostPerLoad",
      label: "Variable Cost per Load",
      type: "slider",
      defaultValue: 1.50,
      min: 0.50,
      max: 5.00,
      step: 0.10,
      prefix: "$",
      tooltip: "Utilities (water, gas, electric), supplies, and wear per load. Industry average: $1.00-$2.50.",
    },
    {
      name: "avgPricePerLoad",
      label: "Average Price per Load",
      type: "slider",
      defaultValue: 4.50,
      min: 2.00,
      max: 12.00,
      step: 0.25,
      prefix: "$",
      tooltip: "Blended average across all machine sizes. Industry average: $3.50-$6.00 for self-service.",
    },
    {
      name: "monthlyOperatingDays",
      label: "Operating Days per Month",
      type: "slider",
      defaultValue: 30,
      min: 20,
      max: 31,
      step: 1,
      tooltip: "Days open per month. Most laundromats operate 7 days/week (30-31 days).",
    },
    {
      name: "hoursPerDay",
      label: "Hours Open per Day",
      type: "slider",
      defaultValue: 16,
      min: 8,
      max: 24,
      step: 1,
      tooltip: "Operating hours per day. Industry average: 14-18 hours, some are 24/7.",
    },
    {
      name: "currentMonthlyLoads",
      label: "Current Monthly Loads",
      type: "slider",
      defaultValue: 2000,
      min: 500,
      max: 10000,
      step: 50,
      tooltip: "Your actual or projected monthly load volume for margin of safety calculation.",
    },
  ],
  outputs: [
    {
      name: "totalFixedCosts",
      label: "Total Monthly Fixed Costs",
      format: "currency",
      decimals: 0,
      description: "Sum of all fixed monthly expenses",
    },
    {
      name: "contributionMargin",
      label: "Contribution Margin per Load",
      format: "currency",
      decimals: 2,
      highlight: true,
      description: "Price minus variable cost = profit per load to cover fixed costs",
    },
    {
      name: "contributionMarginPercent",
      label: "Contribution Margin %",
      format: "percentage",
      decimals: 1,
      description: "Contribution margin as percentage of price",
    },
    {
      name: "breakEvenLoads",
      label: "Break-Even Loads/Month",
      format: "number",
      decimals: 0,
      highlight: true,
      description: "Loads needed monthly to cover all fixed costs",
    },
    {
      name: "breakEvenLoadsPerDay",
      label: "Break-Even Loads/Day",
      format: "number",
      decimals: 1,
      description: "Daily loads needed to stay above break-even",
    },
    {
      name: "breakEvenLoadsPerHour",
      label: "Break-Even Loads/Hour",
      format: "number",
      decimals: 2,
      description: "Loads per operating hour to break even",
    },
    {
      name: "breakEvenRevenue",
      label: "Break-Even Revenue/Month",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Monthly revenue required to cover all costs",
    },
    {
      name: "breakEvenRevenueDaily",
      label: "Break-Even Revenue/Day",
      format: "currency",
      decimals: 0,
      description: "Daily revenue target to reach break-even",
    },
    {
      name: "marginOfSafety",
      label: "Margin of Safety",
      format: "percentage",
      decimals: 1,
      description: "How far above break-even your current volume is (higher = safer)",
    },
    {
      name: "daysToBreakEven",
      label: "Days to Monthly Break-Even",
      format: "number",
      decimals: 1,
      description: "Days into the month when you cover fixed costs",
    },
    {
      name: "monthlyProfit",
      label: "Projected Monthly Profit",
      format: "currency",
      decimals: 0,
      description: "Profit after all costs at current volume",
    },
  ],
  formulas: {
    totalFixedCosts: "monthlyRent + monthlyInsurance + monthlyLoanPayment + otherFixedCosts",
    contributionMargin: "avgPricePerLoad - variableCostPerLoad",
    contributionMarginPercent: "contributionMargin > 0 ? (contributionMargin / avgPricePerLoad) * 100 : 0",
    breakEvenLoads: "contributionMargin > 0 ? totalFixedCosts / contributionMargin : 0",
    breakEvenLoadsPerDay: "monthlyOperatingDays > 0 ? breakEvenLoads / monthlyOperatingDays : 0",
    breakEvenLoadsPerHour: "hoursPerDay > 0 && monthlyOperatingDays > 0 ? breakEvenLoads / (monthlyOperatingDays * hoursPerDay) : 0",
    breakEvenRevenue: "breakEvenLoads * avgPricePerLoad",
    breakEvenRevenueDaily: "monthlyOperatingDays > 0 ? breakEvenRevenue / monthlyOperatingDays : 0",
    marginOfSafety: "currentMonthlyLoads > breakEvenLoads && currentMonthlyLoads > 0 ? ((currentMonthlyLoads - breakEvenLoads) / currentMonthlyLoads) * 100 : (currentMonthlyLoads > 0 && breakEvenLoads > 0 ? ((currentMonthlyLoads - breakEvenLoads) / currentMonthlyLoads) * 100 : 0)",
    daysToBreakEven: "currentMonthlyLoads > 0 && monthlyOperatingDays > 0 ? (breakEvenLoads / (currentMonthlyLoads / monthlyOperatingDays)) : monthlyOperatingDays",
    monthlyProfit: "(currentMonthlyLoads * contributionMargin) - totalFixedCosts",
  },
  charts: [
    {
      type: "bar",
      title: "Cost & Revenue Breakdown",
      dataKeys: ["totalFixedCosts", "breakEvenRevenue", "monthlyProfit"],
      labels: ["Fixed Costs", "Break-Even Revenue", "Monthly Profit"],
      colors: ["#EF4444", "#F59E0B", "#22C55E"],
    },
    {
      type: "line",
      title: "Break-Even Analysis",
      dataKeys: ["breakEvenLoads", "breakEvenLoadsPerDay"],
      labels: ["Monthly Break-Even", "Daily Break-Even"],
      colors: ["#3B82F6", "#C8A661"],
    },
  ],
  tips: [
    "Industry benchmark: Most laundromats need 40-60 loads/day to break even",
    "Higher contribution margin = faster path to profitability",
    "Aim for 30%+ margin of safety for financial stability",
    "Reducing fixed costs by 10% has same effect as 10% revenue increase",
    "Consider pricing strategy: premium pricing can improve margins significantly",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

export default function BreakEvenCalculator() {
  return (
    <>
      <SEO
        title="Break-Even Calculator | Laundromat Profitability Analysis | WashBizHub"
        description="Calculate your laundromat break-even point. Understand how many loads you need to cover fixed costs, contribution margins, and margin of safety for sustainable profitability."
        canonicalUrl="/break-even-calculator"
        ogType="website"
        keywords={[
          "break-even calculator",
          "laundromat break-even analysis",
          "laundromat profitability",
          "contribution margin calculator",
          "fixed costs laundromat",
          "laundromat financial planning",
          "break-even loads",
          "margin of safety laundromat",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators" },
              { name: "Break-Even Calculator", url: "/break-even-calculator" },
            ]}
          />

          <div className="mb-8 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Break-Even Calculator
                </h1>
                <p className="text-muted-foreground" data-testid="text-page-subtitle">
                  Know exactly when your laundromat becomes profitable
                </p>
              </div>
              <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30" data-testid="badge-category">
                <Sparkles className="w-3 h-3 mr-1" />
                Financial Planning
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Industry Avg Break-Even</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-industry-breakeven">50 loads/day</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Percent className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target Margin of Safety</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-target-margin">30%+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Contribution Margin</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-avg-margin">$2-$4/load</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Days to Break-Even</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-days-target">15-20 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-blue-500/30 bg-blue-500/10" data-testid="alert-info">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400">Understanding Break-Even Analysis</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Break-even is the point where total revenue equals total costs. Every load beyond break-even 
              generates pure profit (minus variable costs). A higher contribution margin means you reach 
              profitability faster with fewer loads.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={breakEvenCalculatorConfig} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-strategies">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Strategies to Lower Break-Even
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2" data-testid="strategy-1">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Negotiate rent</strong> - Even $200/mo savings lowers break-even by 50+ loads
                  </span>
                </div>
                <div className="flex items-start gap-2" data-testid="strategy-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Energy-efficient equipment</strong> - Reduce variable cost per load by 20-30%
                  </span>
                </div>
                <div className="flex items-start gap-2" data-testid="strategy-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Strategic pricing</strong> - Premium machines can have 60%+ margins
                  </span>
                </div>
                <div className="flex items-start gap-2" data-testid="strategy-4">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Add WDF services</strong> - Higher margins help cover fixed costs faster
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-scenarios">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Pricing Scenario Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center" data-testid="scenario-economy">
                  <span className="text-sm text-muted-foreground">Economy Pricing ($3.00/load)</span>
                  <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">Higher Volume Needed</Badge>
                </div>
                <div className="flex justify-between items-center" data-testid="scenario-standard">
                  <span className="text-sm text-muted-foreground">Standard Pricing ($4.50/load)</span>
                  <Badge variant="outline">Balanced Approach</Badge>
                </div>
                <div className="flex justify-between items-center" data-testid="scenario-premium">
                  <span className="text-sm text-muted-foreground">Premium Pricing ($6.00/load)</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Lower Volume Needed</Badge>
                </div>
                <div className="flex justify-between items-center" data-testid="scenario-wdf">
                  <span className="text-sm text-muted-foreground">WDF Service ($2.00/lb avg)</span>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Highest Margins</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6" data-testid="card-warning">
            <CardContent className="pt-6">
              <Alert className="border-amber-500/30 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertTitle className="text-amber-400">Break-Even Warning Signs</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Break-even requiring 80+ loads/day indicates cost structure issues</li>
                    <li>Margin of safety below 20% leaves little room for slow periods</li>
                    <li>Days to break-even past day 25 means minimal profit potential</li>
                    <li>Contribution margin under $2.00 suggests pricing or efficiency problems</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}
