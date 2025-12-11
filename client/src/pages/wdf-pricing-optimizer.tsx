import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  DollarSign, Scale, TrendingUp, Clock, Droplets, Package, 
  Target, BarChart3, PieChart, Zap, AlertTriangle, CheckCircle, Info,
  Calculator, Layers
} from "lucide-react";

const wdfPricingOptimizerConfig: PremiumCalculatorConfig = {
  id: "wdf-pricing-optimizer",
  name: "WDF Pricing Optimizer Calculator",
  description: "Calculate optimal wash-dry-fold pricing based on your costs, desired margins, and market conditions. Get tier-based pricing recommendations for economy, standard, premium, and rush services.",
  category: "Pricing Strategy",
  inputs: [
    {
      name: "laborCostPerHour",
      label: "Labor Cost per Hour",
      type: "slider",
      defaultValue: 15,
      min: 10,
      max: 35,
      step: 0.50,
      prefix: "$",
      tooltip: "Hourly wage for WDF staff including benefits. Industry range: $12-25/hour depending on location.",
    },
    {
      name: "minutesPerPound",
      label: "Minutes per Pound to Process",
      type: "slider",
      defaultValue: 3,
      min: 1,
      max: 10,
      step: 0.25,
      tooltip: "Average processing time per pound including sorting, washing, drying, and folding. Efficient operations: 2-4 min/lb.",
    },
    {
      name: "utilityCostPerLoad",
      label: "Utility Cost per Load",
      type: "slider",
      defaultValue: 2.50,
      min: 1,
      max: 8,
      step: 0.25,
      prefix: "$",
      tooltip: "Combined water, gas, and electricity cost per wash/dry cycle. Average: $2-4 per load.",
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
      tooltip: "Detergent, fabric softener, bags, hangers per pound. Typical range: $0.10-0.25/lb.",
    },
    {
      name: "overheadPerPound",
      label: "Overhead Allocation per Pound",
      type: "slider",
      defaultValue: 0.20,
      min: 0.05,
      max: 0.75,
      step: 0.01,
      prefix: "$",
      tooltip: "Rent, insurance, equipment depreciation allocated per pound. Varies by location: $0.10-0.50/lb.",
    },
    {
      name: "targetMargin",
      label: "Target Profit Margin",
      type: "slider",
      defaultValue: 35,
      min: 15,
      max: 60,
      step: 1,
      suffix: "%",
      tooltip: "Desired profit margin on WDF services. Industry average: 30-40%. Premium markets: 40-50%.",
    },
    {
      name: "marketPricePerPound",
      label: "Current Market Price per Pound",
      type: "slider",
      defaultValue: 1.75,
      min: 0.75,
      max: 4.00,
      step: 0.05,
      prefix: "$",
      tooltip: "What competitors charge per pound in your market. Research local pricing: $1.25-3.00/lb typical.",
    },
    {
      name: "monthlyVolume",
      label: "Monthly WDF Volume (Pounds)",
      type: "slider",
      defaultValue: 5000,
      min: 500,
      max: 30000,
      step: 100,
      tooltip: "Expected or current monthly WDF volume. Small operation: 1,000-3,000 lbs. Medium: 5,000-15,000 lbs.",
    },
    {
      name: "poundsPerLoad",
      label: "Pounds per Load",
      type: "slider",
      defaultValue: 15,
      min: 8,
      max: 30,
      step: 1,
      tooltip: "Average pounds processed per washer load. Standard washer: 12-18 lbs. Large capacity: 20-30 lbs.",
    },
  ],
  outputs: [
    {
      name: "laborCostPerPound",
      label: "Labor Cost per Pound",
      format: "currency",
      decimals: 3,
      description: "Labor cost allocated to each pound: (Hourly Rate × Minutes/Lb) / 60",
    },
    {
      name: "utilityCostPerPound",
      label: "Utility Cost per Pound",
      format: "currency",
      decimals: 3,
      description: "Utility cost per pound based on load capacity",
    },
    {
      name: "totalCostPerPound",
      label: "Total Cost per Pound",
      format: "currency",
      decimals: 3,
      highlight: true,
      description: "Complete cost: Labor + Utility + Supply + Overhead",
    },
    {
      name: "recommendedPrice",
      label: "Recommended Price per Pound",
      format: "currency",
      decimals: 2,
      highlight: true,
      description: "Optimal price based on costs and target margin",
    },
    {
      name: "profitPerPound",
      label: "Profit per Pound",
      format: "currency",
      decimals: 3,
      highlight: true,
      description: "Profit earned on each pound at recommended price",
    },
    {
      name: "monthlyRevenue",
      label: "Monthly Revenue Projection",
      format: "currency",
      decimals: 0,
      description: "Expected monthly revenue at recommended price",
    },
    {
      name: "monthlyProfit",
      label: "Monthly Profit Projection",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Expected monthly profit at recommended price",
    },
    {
      name: "actualMargin",
      label: "Actual Margin at Market Price",
      format: "percentage",
      decimals: 1,
      description: "Your margin if using current market price",
    },
    {
      name: "priceVsMarket",
      label: "Price vs Market Difference",
      format: "percentage",
      decimals: 1,
      description: "How your recommended price compares to market (+/- %)",
    },
    {
      name: "breakEvenVolume",
      label: "Break-Even Volume (Monthly)",
      format: "number",
      decimals: 0,
      description: "Minimum pounds needed to cover fixed overhead at market price",
    },
    {
      name: "economyTierPrice",
      label: "Economy Tier Price",
      format: "currency",
      decimals: 2,
      description: "Budget-friendly option with 20% margin",
    },
    {
      name: "standardTierPrice",
      label: "Standard Tier Price",
      format: "currency",
      decimals: 2,
      description: "Standard service at target margin",
    },
    {
      name: "premiumTierPrice",
      label: "Premium Tier Price",
      format: "currency",
      decimals: 2,
      description: "Premium service with +10% above target margin",
    },
    {
      name: "rushTierPrice",
      label: "Rush/Same-Day Tier Price",
      format: "currency",
      decimals: 2,
      description: "Express service with +25% above target margin",
    },
  ],
  formulas: {
    laborCostPerPound: "(laborCostPerHour * minutesPerPound) / 60",
    utilityCostPerPound: "utilityCostPerLoad / poundsPerLoad",
    totalCostPerPound: "laborCostPerPound + utilityCostPerPound + supplyCostPerPound + overheadPerPound",
    recommendedPrice: "totalCostPerPound / (1 - targetMargin / 100)",
    profitPerPound: "recommendedPrice - totalCostPerPound",
    monthlyRevenue: "recommendedPrice * monthlyVolume",
    monthlyProfit: "profitPerPound * monthlyVolume",
    actualMargin: "((marketPricePerPound - totalCostPerPound) / marketPricePerPound) * 100",
    priceVsMarket: "((recommendedPrice - marketPricePerPound) / marketPricePerPound) * 100",
    breakEvenVolume: "totalCostPerPound > 0 ? (overheadPerPound * monthlyVolume) / (marketPricePerPound - (laborCostPerPound + utilityCostPerPound + supplyCostPerPound)) : 0",
    economyTierPrice: "totalCostPerPound / (1 - 0.20)",
    standardTierPrice: "totalCostPerPound / (1 - targetMargin / 100)",
    premiumTierPrice: "totalCostPerPound / (1 - (targetMargin + 10) / 100)",
    rushTierPrice: "totalCostPerPound / (1 - (targetMargin + 25) / 100)",
  },
  charts: [
    {
      type: "pie",
      title: "Cost Breakdown per Pound",
      dataKeys: ["laborCostPerPound", "utilityCostPerPound", "supplyCostPerPound", "overheadPerPound"],
      labels: ["Labor", "Utilities", "Supplies", "Overhead"],
      colors: ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6"],
    },
    {
      type: "bar",
      title: "Price Tier Comparison",
      dataKeys: ["economyTierPrice", "standardTierPrice", "premiumTierPrice", "rushTierPrice"],
      labels: ["Economy", "Standard", "Premium", "Rush"],
      colors: ["#22C55E", "#3B82F6", "#C8A661", "#EF4444"],
    },
  ],
  tips: [
    "Industry benchmark: WDF prices typically range from $1.25-$3.00 per pound depending on market",
    "Target 30-40% profit margin for sustainable WDF operations",
    "Efficient processing time is 2-4 minutes per pound for experienced staff",
    "Premium/rush tiers can generate 40-60% higher margins on willing customers",
    "Monitor utility costs seasonally - they can vary 20-30% throughout the year",
    "Labor is typically 40-50% of total WDF costs - efficiency here drives profitability",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

export default function WDFPricingOptimizer() {
  return (
    <>
      <SEO
        title="WDF Pricing Optimizer Calculator | Wash-Dry-Fold Pricing Strategy | WashBizHub"
        description="Calculate optimal wash-dry-fold pricing for your laundromat. Get cost breakdowns, profit margins, tier recommendations (economy, standard, premium, rush), and market comparison analysis."
        canonicalUrl="/wdf-pricing-optimizer"
        ogType="website"
        keywords={[
          "WDF pricing calculator",
          "wash dry fold pricing",
          "laundromat WDF calculator",
          "wash fold pricing strategy",
          "laundry service pricing",
          "WDF profit calculator",
          "laundromat pricing optimizer",
          "wash dry fold cost analysis",
        ]}
      />
      
      <div className="min-h-screen bg-background" data-testid="wdf-pricing-optimizer-page">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "WDF Pricing Optimizer", url: "/wdf-pricing-optimizer" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center" data-testid="calculator-icon-container">
                <Scale className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="page-title">
                  WDF Pricing Optimizer
                </h1>
                <p className="text-muted-foreground" data-testid="page-subtitle">
                  Calculate optimal wash-dry-fold pricing with tier recommendations
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border shadow-sm" data-testid="stat-card-labor">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Labor Impact</p>
                    <p className="text-lg font-bold text-foreground">40-50%</p>
                    <p className="text-xs text-muted-foreground">of total costs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm" data-testid="stat-card-margin">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Margin</p>
                    <p className="text-lg font-bold text-foreground">30-40%</p>
                    <p className="text-xs text-muted-foreground">industry standard</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm" data-testid="stat-card-price">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#C8A661]/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Range</p>
                    <p className="text-lg font-bold text-foreground">$1.25-$3.00</p>
                    <p className="text-xs text-muted-foreground">per pound</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm" data-testid="stat-card-efficiency">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processing</p>
                    <p className="text-lg font-bold text-foreground">2-4 min</p>
                    <p className="text-xs text-muted-foreground">per pound target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-8 border-[#C8A661]/30 bg-[#C8A661]/5" data-testid="calculator-info-alert">
            <Info className="h-4 w-4 text-[#C8A661]" />
            <AlertTitle className="text-foreground">How This Calculator Works</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Enter your operational costs and desired margin to calculate optimal WDF pricing. 
              The calculator provides tiered pricing recommendations (economy, standard, premium, rush) 
              and compares your pricing to market rates. Use the cost breakdown chart to identify 
              opportunities for efficiency improvements.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine 
            config={wdfPricingOptimizerConfig} 
            data-testid="wdf-pricing-calculator-engine"
          />

          <PremiumResults
            featureName="wdf-pricing-optimizer"
            analysisType="wdf-pricing-optimizer"
            title="WDF Pricing Analysis Results"
            data={{}}
            summary={{
              headline: "Optimized pricing strategy",
              metrics: [
                { label: "Target Margin", value: "30-40%" },
                { label: "Market Range", value: "$1.25-$3.00/lb" },
              ]
            }}
            benefits={[
              "Save unlimited analyses",
              "Export to Google Sheets & Docs",
              "Priority support"
            ]}
            cardWrapper={false}
            showTitle={false}
          >
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="bg-card border shadow-sm overflow-hidden" data-testid="tier-strategy-card">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Layers className="h-5 w-5 text-[#C8A661]" />
                  Pricing Tier Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/20" data-testid="tier-economy">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500 text-white">Economy</Badge>
                      <span className="text-sm text-muted-foreground">Basic service, 20% margin</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Budget customers</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-500/5 rounded-lg border border-blue-500/20" data-testid="tier-standard">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500 text-white">Standard</Badge>
                      <span className="text-sm text-muted-foreground">Full service, target margin</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Most customers</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-[#C8A661]/5 rounded-lg border border-[#C8A661]/20" data-testid="tier-premium">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#C8A661] text-[#0A1628]">Premium</Badge>
                      <span className="text-sm text-muted-foreground">Special care, +10% margin</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Quality-focused</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/20" data-testid="tier-rush">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-500 text-white">Rush</Badge>
                      <span className="text-sm text-muted-foreground">Same-day, +25% margin</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Time-sensitive</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden" data-testid="optimization-tips-card">
              <div className="h-1 bg-[#0A1628]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5 text-[#C8A661]" />
                  Cost Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3" data-testid="tip-labor">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Optimize Labor Efficiency</p>
                      <p className="text-xs text-muted-foreground">Train staff to process 2-3 min/lb. Batch similar items.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3" data-testid="tip-utilities">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Maximize Load Capacity</p>
                      <p className="text-xs text-muted-foreground">Fill machines to optimal capacity (not overloaded) to reduce per-pound utility costs.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3" data-testid="tip-supplies">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Bulk Purchase Supplies</p>
                      <p className="text-xs text-muted-foreground">Buy detergent, softener in bulk. Negotiate vendor discounts at 5K+ lbs/month.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3" data-testid="tip-tiers">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Promote Higher Tiers</p>
                      <p className="text-xs text-muted-foreground">Rush and premium tiers yield 40-60% higher margins with minimal extra cost.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="bg-muted/30 border" data-testid="formula-labor">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-[#C8A661]" />
                  <span className="text-sm font-medium text-foreground">Labor Cost Formula</span>
                </div>
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block">
                  Labor/Lb = (Hourly Rate × Min/Lb) ÷ 60
                </code>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border" data-testid="formula-total">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-[#C8A661]" />
                  <span className="text-sm font-medium text-foreground">Total Cost Formula</span>
                </div>
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block">
                  Total = Labor + Utility + Supply + Overhead
                </code>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border" data-testid="formula-price">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-[#C8A661]" />
                  <span className="text-sm font-medium text-foreground">Price Formula</span>
                </div>
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block">
                  Price = Cost ÷ (1 - Target Margin%)
                </code>
              </CardContent>
            </Card>
          </div>
          </PremiumResults>

          <div className="mt-8">
            <CalculatorDisclaimer />
          </div>
        </div>
      </div>
    </>
  );
}
