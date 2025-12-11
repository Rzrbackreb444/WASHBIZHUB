import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Scale, TrendingUp, DollarSign, Clock, Users,
  BarChart3, Sparkles, AlertTriangle, CheckCircle, Info, Shirt
} from "lucide-react";

const wdfEfficiencyConfig: PremiumCalculatorConfig = {
  id: "wdf-efficiency-calculator",
  name: "Wash-Dry-Fold Efficiency Calculator",
  description: "Measure and optimize your WDF operation efficiency. Industry benchmark: 30-50 lbs/hour standard, 50-70 lbs/hour efficient, 70+ lbs/hour top performers.",
  category: "Operations & Efficiency",
  inputs: [
    {
      name: "poundsProcessedDaily",
      label: "Pounds Processed Daily",
      type: "slider",
      defaultValue: 300,
      min: 50,
      max: 2000,
      step: 25,
      tooltip: "Total pounds of laundry processed per day in WDF service.",
    },
    {
      name: "laborHoursDaily",
      label: "Labor Hours Daily",
      type: "slider",
      defaultValue: 8,
      min: 2,
      max: 24,
      step: 0.5,
      tooltip: "Total labor hours dedicated to WDF processing daily.",
    },
    {
      name: "numEmployees",
      label: "Number of WDF Staff",
      type: "slider",
      defaultValue: 2,
      min: 1,
      max: 10,
      step: 1,
      tooltip: "Number of employees working on WDF at a time.",
    },
    {
      name: "pricePerPound",
      label: "Price per Pound",
      type: "slider",
      defaultValue: 1.75,
      min: 1.00,
      max: 4.00,
      step: 0.05,
      prefix: "$",
      tooltip: "Your WDF price per pound. Industry range: $1.25-$2.50.",
    },
    {
      name: "hourlyWage",
      label: "Hourly Wage",
      type: "slider",
      defaultValue: 15,
      min: 10,
      max: 30,
      step: 0.50,
      prefix: "$",
      tooltip: "Average hourly wage for WDF staff.",
    },
    {
      name: "supplyCostPerPound",
      label: "Supply Cost per Pound",
      type: "slider",
      defaultValue: 0.15,
      min: 0.05,
      max: 0.50,
      step: 0.01,
      prefix: "$",
      tooltip: "Detergent, fabric softener, bags per pound. Typically $0.10-0.25.",
    },
    {
      name: "utilityCostPerPound",
      label: "Utility Cost per Pound",
      type: "slider",
      defaultValue: 0.08,
      min: 0.03,
      max: 0.20,
      step: 0.01,
      prefix: "$",
      tooltip: "Water, electric, gas cost per pound processed.",
    },
    {
      name: "operatingDaysPerMonth",
      label: "Operating Days per Month",
      type: "slider",
      defaultValue: 26,
      min: 20,
      max: 31,
      step: 1,
      tooltip: "Number of days per month WDF operates.",
    },
  ],
  outputs: [
    {
      name: "poundsPerLaborHour",
      label: "Pounds per Labor Hour",
      format: "number",
      decimals: 1,
      highlight: true,
      description: "KEY METRIC: Industry benchmark 30-50 avg, 70+ top performers",
    },
    {
      name: "poundsPerEmployeeHour",
      label: "Lbs per Employee Hour",
      format: "number",
      decimals: 1,
      description: "Efficiency per individual worker",
    },
    {
      name: "dailyRevenue",
      label: "Daily WDF Revenue",
      format: "currency",
      decimals: 0,
      description: "Gross revenue from WDF per day",
    },
    {
      name: "monthlyRevenue",
      label: "Monthly WDF Revenue",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Total monthly WDF revenue",
    },
    {
      name: "dailyLaborCost",
      label: "Daily Labor Cost",
      format: "currency",
      decimals: 2,
      description: "Labor expense per day",
    },
    {
      name: "dailySupplyCost",
      label: "Daily Supply Cost",
      format: "currency",
      decimals: 2,
      description: "Supplies expense per day",
    },
    {
      name: "dailyUtilityCost",
      label: "Daily Utility Cost",
      format: "currency",
      decimals: 2,
      description: "Utility expense per day for WDF",
    },
    {
      name: "dailyGrossProfit",
      label: "Daily Gross Profit",
      format: "currency",
      decimals: 2,
      description: "Revenue minus direct costs",
    },
    {
      name: "monthlyGrossProfit",
      label: "Monthly Gross Profit",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Monthly WDF profit after direct costs",
    },
    {
      name: "profitMarginPercent",
      label: "WDF Profit Margin",
      format: "percentage",
      decimals: 1,
      highlight: true,
      description: "Target: 40-50% margin",
    },
    {
      name: "revenuePerLaborHour",
      label: "Revenue per Labor Hour",
      format: "currency",
      decimals: 2,
      description: "Revenue generated per hour of labor",
    },
    {
      name: "profitPerLaborHour",
      label: "Profit per Labor Hour",
      format: "currency",
      decimals: 2,
      description: "Profit generated per hour of labor",
    },
    {
      name: "efficiencyRating",
      label: "Efficiency Rating",
      format: "number",
      decimals: 0,
      description: "Score 0-100 based on industry benchmarks",
    },
  ],
  formulas: {
    poundsPerLaborHour: "laborHoursDaily > 0 ? poundsProcessedDaily / laborHoursDaily : 0",
    poundsPerEmployeeHour: "numEmployees > 0 && laborHoursDaily > 0 ? poundsProcessedDaily / laborHoursDaily / numEmployees : 0",
    dailyRevenue: "poundsProcessedDaily * pricePerPound",
    monthlyRevenue: "dailyRevenue * operatingDaysPerMonth",
    dailyLaborCost: "laborHoursDaily * hourlyWage * numEmployees",
    dailySupplyCost: "poundsProcessedDaily * supplyCostPerPound",
    dailyUtilityCost: "poundsProcessedDaily * utilityCostPerPound",
    totalDailyCost: "dailyLaborCost + dailySupplyCost + dailyUtilityCost",
    dailyGrossProfit: "dailyRevenue - totalDailyCost",
    monthlyGrossProfit: "dailyGrossProfit * operatingDaysPerMonth",
    profitMarginPercent: "dailyRevenue > 0 ? (dailyGrossProfit / dailyRevenue) * 100 : 0",
    revenuePerLaborHour: "laborHoursDaily > 0 ? dailyRevenue / laborHoursDaily : 0",
    profitPerLaborHour: "laborHoursDaily > 0 ? dailyGrossProfit / laborHoursDaily : 0",
    efficiencyRating: "poundsPerLaborHour >= 70 ? 100 : poundsPerLaborHour >= 60 ? 90 : poundsPerLaborHour >= 50 ? 80 : poundsPerLaborHour >= 40 ? 70 : poundsPerLaborHour >= 30 ? 60 : poundsPerLaborHour >= 20 ? 40 : 20",
  },
  charts: [
    {
      type: "bar",
      title: "Daily Financials",
      dataKeys: ["dailyRevenue", "dailyLaborCost", "dailySupplyCost", "dailyGrossProfit"],
      labels: ["Revenue", "Labor", "Supplies", "Profit"],
      colors: ["#22C55E", "#EF4444", "#F59E0B", "#3B82F6"],
    },
    {
      type: "pie",
      title: "Cost Breakdown",
      dataKeys: ["dailyLaborCost", "dailySupplyCost", "dailyUtilityCost", "dailyGrossProfit"],
      labels: ["Labor", "Supplies", "Utilities", "Profit"],
      colors: ["#EF4444", "#F59E0B", "#8B5CF6", "#22C55E"],
    },
  ],
  tips: [
    "Industry benchmark: 30-50 lbs/hour standard, 50-70 efficient, 70+ top performers",
    "Target WDF profit margin: 40-50% after labor, supplies, utilities",
    "WDF customers have 2-3x higher LTV than self-service only",
    "Efficient workflow design can increase throughput 20-30%",
    "Consider premium pricing tiers (express, specialty fabrics)",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

export default function WDFEfficiencyCalculator() {
  return (
    <>
      <SEO
        title="Wash-Dry-Fold Efficiency Calculator | WDF Pounds Per Hour | WashBizHub"
        description="Calculate your WDF operation efficiency in pounds per labor hour. Benchmark against industry standards and optimize your wash-dry-fold service profitability."
        canonicalUrl="/wdf-efficiency-calculator"
        ogType="website"
        keywords={[
          "wash dry fold calculator",
          "WDF efficiency",
          "pounds per hour laundry",
          "laundromat WDF profitability",
          "wash and fold pricing",
          "laundry service efficiency",
          "WDF labor cost",
          "commercial laundry efficiency",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Calculators", href: "/calculators-hub" },
              { label: "WDF Efficiency Calculator" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                <Shirt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  WDF Efficiency Calculator
                </h1>
                <p className="text-muted-foreground">
                  Measure and optimize wash-dry-fold productivity
                </p>
              </div>
              <Badge className="ml-auto bg-teal-500/20 text-teal-400 border-teal-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Operations
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Below Standard</p>
                  <p className="text-2xl font-bold text-red-400">&lt;30 lbs/hr</p>
                  <p className="text-xs text-muted-foreground mt-1">Needs optimization</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Average</p>
                  <p className="text-2xl font-bold text-yellow-400">30-50 lbs/hr</p>
                  <p className="text-xs text-muted-foreground mt-1">Industry standard</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-lime-500/10 to-green-500/10 border-lime-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Efficient</p>
                  <p className="text-2xl font-bold text-lime-400">50-70 lbs/hr</p>
                  <p className="text-xs text-muted-foreground mt-1">Well-run operation</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Top Performer</p>
                  <p className="text-2xl font-bold text-green-400">70+ lbs/hr</p>
                  <p className="text-xs text-muted-foreground mt-1">Elite efficiency</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-teal-500/30 bg-teal-500/10">
            <Info className="h-4 w-4 text-teal-400" />
            <AlertTitle className="text-teal-400">WDF Efficiency Matters</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Pounds per labor hour is the key metric for WDF profitability. Higher efficiency means lower labor 
              cost per pound and better margins. WDF typically contributes 20-40% of total laundromat revenue 
              with 40-50% profit margins when run efficiently.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={wdfEfficiencyConfig} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Boost WDF Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Workflow optimization</strong> - Batch similar items, minimize machine transitions
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Efficient equipment</strong> - High-capacity washers/dryers reduce cycles
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Staff training</strong> - Proper folding techniques save 15-20% time
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Ergonomic setup</strong> - Reduce walking, proper folding table heights
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  WDF Pricing Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Standard WDF</span>
                  <Badge variant="outline">$1.25 - $1.75/lb</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Premium/Express</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">$2.00 - $2.50/lb</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Commercial Accounts</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">$1.00 - $1.50/lb</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Target Margin</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">40-50%</Badge>
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
