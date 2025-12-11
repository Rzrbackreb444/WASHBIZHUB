import { lazy, Suspense, useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Users, Building2, DollarSign, TrendingUp, 
  Target, BarChart3, Sparkles, Info, CheckCircle, AlertTriangle,
  Home, Percent, Layers, Radar
} from "lucide-react";

const RadarChartComponent = lazy(() => import("@/components/RadarChartComponent"));

const marketGapFinderConfig: PremiumCalculatorConfig = {
  id: "market-gap-finder-calculator",
  name: "Market Gap Finder Calculator",
  description: "Analyze market opportunity for new laundromat locations. Evaluate population density, competition, demographics, and identify underserved markets with high demand potential.",
  category: "Market Intelligence",
  inputs: [
    {
      name: "targetZipCode",
      label: "Target Zip Code",
      type: "text",
      defaultValue: "",
      tooltip: "Enter the zip code of the area you're analyzing for market opportunity.",
    },
    {
      name: "population",
      label: "Population in Area",
      type: "slider",
      defaultValue: 25000,
      min: 5000,
      max: 200000,
      step: 1000,
      tooltip: "Total population within 1-3 mile radius. Industry standard: 1 laundromat per 5,000-8,000 people.",
    },
    {
      name: "existingLaundromats",
      label: "Number of Existing Laundromats",
      type: "slider",
      defaultValue: 3,
      min: 0,
      max: 20,
      step: 1,
      tooltip: "Count of laundromats currently serving this area. Include all competitors within 2-3 miles.",
    },
    {
      name: "medianIncome",
      label: "Median Household Income",
      type: "slider",
      defaultValue: 55000,
      min: 25000,
      max: 150000,
      step: 1000,
      prefix: "$",
      tooltip: "Area median household income. Sweet spot for laundromats: $35K-$65K. Higher income = fewer renters.",
    },
    {
      name: "renterPercentage",
      label: "Renter Percentage",
      type: "slider",
      defaultValue: 45,
      min: 10,
      max: 90,
      step: 1,
      suffix: "%",
      tooltip: "Percentage of households that rent. Higher renter % = higher demand. Target: 40%+ for strong demand.",
    },
    {
      name: "avgCompetitorMachines",
      label: "Average Competitor Size (Machines)",
      type: "slider",
      defaultValue: 30,
      min: 10,
      max: 100,
      step: 1,
      tooltip: "Average number of machines at competing laundromats. Larger = more established competition.",
    },
    {
      name: "plannedMachineCount",
      label: "Your Planned Machine Count",
      type: "slider",
      defaultValue: 40,
      min: 15,
      max: 100,
      step: 1,
      tooltip: "Number of machines you plan to install. 30-50 machines is typical for mid-size stores.",
    },
  ],
  outputs: [
    {
      name: "marketSaturationScore",
      label: "Market Saturation Score",
      format: "number",
      decimals: 0,
      highlight: true,
      description: "0-100 scale. Lower = less saturated, more opportunity. Under 50 is favorable.",
    },
    {
      name: "populationPerLaundromat",
      label: "Population per Laundromat",
      format: "number",
      decimals: 0,
      description: "People per existing laundromat. Target: 5,000-8,000 per store. Higher = underserved.",
    },
    {
      name: "incomeScore",
      label: "Income Score",
      format: "number",
      decimals: 0,
      description: "0-100 score based on median income sweet spot ($35K-$65K optimal).",
    },
    {
      name: "renterDemandScore",
      label: "Renter Demand Score",
      format: "number",
      decimals: 0,
      highlight: true,
      description: "0-100 score combining renter % with income factors. Higher = stronger demand.",
    },
    {
      name: "competitiveAdvantageScore",
      label: "Competitive Advantage Score",
      format: "number",
      decimals: 0,
      description: "Your size vs competitors. 100+ = larger than average, competitive edge.",
    },
    {
      name: "marketOpportunityScore",
      label: "Market Opportunity Score",
      format: "number",
      decimals: 0,
      highlight: true,
      description: "Overall opportunity rating 0-100. Higher = better market entry potential.",
    },
    {
      name: "demandIndex",
      label: "Demand Index",
      format: "number",
      decimals: 1,
      description: "Composite demand factor combining all market signals.",
    },
    {
      name: "idealPopulationPerStore",
      label: "Ideal Population Per Store",
      format: "number",
      decimals: 0,
      description: "Industry benchmark: 5,000-8,000 people per laundromat.",
    },
  ],
  formulas: {
    idealPopulationPerStore: "5000",
    populationPerLaundromat: "existingLaundromats > 0 ? population / existingLaundromats : population",
    saturationRaw: "existingLaundromats / (population / 5000)",
    marketSaturationScore: "Math.min(100, Math.max(0, saturationRaw * 100))",
    incomeDeviation: "Math.abs(medianIncome - 50000)",
    incomeScore: "Math.max(0, 100 - (incomeDeviation / 500))",
    renterDemandScore: "(renterPercentage / 70) * (incomeScore / 100) * 100",
    competitiveAdvantageScore: "(plannedMachineCount / avgCompetitorMachines) * 100",
    demandIndex: "(renterDemandScore + incomeScore) / 2",
    marketOpportunityScore: "((100 - marketSaturationScore) * demandIndex) / 100",
  },
  charts: [
    {
      type: "bar",
      title: "Market Factor Analysis",
      dataKeys: ["marketSaturationScore", "incomeScore", "renterDemandScore", "competitiveAdvantageScore", "marketOpportunityScore"],
      labels: ["Saturation", "Income", "Renter Demand", "Competitive Adv", "Opportunity"],
      colors: ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#C8A661"],
    },
    {
      type: "pie",
      title: "Opportunity Breakdown",
      dataKeys: ["incomeScore", "renterDemandScore", "competitiveAdvantageScore"],
      labels: ["Income Factor", "Renter Demand", "Competitive Edge"],
      colors: ["#3B82F6", "#22C55E", "#F59E0B"],
    },
  ],
  tips: [
    "Industry benchmark: 1 laundromat per 5,000-8,000 population",
    "Best markets: 40%+ renters, $35K-$65K median income",
    "Under-saturated markets (saturation <50%) offer best entry opportunities",
    "Competitive advantage above 100% means you'll be larger than average",
    "A-grade markets: Opportunity score 85+, low saturation, high renter %",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

function getOpportunityRating(score: number): { grade: string; color: string; description: string } {
  if (score >= 85) {
    return { grade: "A", color: "text-green-500", description: "Excellent market opportunity - strong demand, low competition" };
  } else if (score >= 70) {
    return { grade: "B", color: "text-blue-500", description: "Good market potential - solid fundamentals with manageable competition" };
  } else if (score >= 55) {
    return { grade: "C", color: "text-yellow-500", description: "Moderate opportunity - requires careful positioning and differentiation" };
  } else {
    return { grade: "Needs Work", color: "text-red-500", description: "Challenging market - high saturation or weak demand signals" };
  }
}

function getEntryStrategy(saturation: number, renterDemand: number, competitiveAdvantage: number): string {
  if (saturation < 30 && renterDemand > 70) {
    return "Blue Ocean Entry: Underserved market with strong demand. Focus on premium positioning and capturing market share quickly.";
  } else if (saturation < 50 && competitiveAdvantage > 100) {
    return "Size Advantage Entry: Build larger than competitors with better equipment mix. Become the destination store.";
  } else if (saturation >= 50 && saturation < 75) {
    return "Differentiation Strategy: Add WDF services, modern equipment, and loyalty programs to stand out from existing competitors.";
  } else if (renterDemand > 60 && saturation >= 50) {
    return "Niche Focus Entry: Target specific customer segments (students, families, commercial accounts) underserved by current operators.";
  } else if (saturation >= 75) {
    return "Acquisition Strategy: Consider acquiring an underperforming competitor rather than new construction. Look for retool opportunities.";
  }
  return "Balanced Approach: Focus on operational excellence, competitive pricing, and superior customer experience to compete effectively.";
}

export default function MarketGapFinder() {
  return (
    <>
      <SEO
        title="Market Gap Finder Calculator | Laundromat Location Analysis | WashBizHub"
        description="Analyze market opportunity for new laundromat locations. Evaluate population density, competition levels, demographics, and identify underserved markets with our free market gap analysis tool."
        canonicalUrl="/market-gap-finder"
        ogType="website"
        keywords={[
          "laundromat market analysis",
          "market gap finder",
          "laundromat location analysis",
          "laundry market opportunity",
          "laundromat competition analysis",
          "demographic analysis laundromat",
          "laundromat site selection",
          "market saturation calculator",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Market Gap Finder", url: "/market-gap-finder" },
            ]}
          />

          <div className="mb-8 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Market Gap Finder Calculator
                </h1>
                <p className="text-muted-foreground">
                  Identify underserved markets and evaluate entry opportunities
                </p>
              </div>
              <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Market Intelligence
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target Pop/Store</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-target-pop">5,000-8,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Home className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ideal Renter %</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-ideal-renter">40%+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sweet Spot Income</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-sweet-spot">$35K-$65K</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">A-Grade Score</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-a-grade">85+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/10">
            <Info className="h-4 w-4 text-emerald-400" />
            <AlertTitle className="text-emerald-400">Understanding Market Gaps</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              The best laundromat locations combine low competition (saturation under 50%), strong renter populations (40%+), 
              and income levels in the $35K-$65K sweet spot. This calculator helps you identify these golden opportunities.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={marketGapFinderConfig} />

          <PremiumResults
            featureName="market-gap-finder"
            analysisType="market-gap-finder"
            title="Market Gap Analysis Results"
            data={{}}
            summary={{
              headline: "Market opportunity analysis complete",
              metrics: [
                { label: "Target Pop/Store", value: "5,000-8,000" },
                { label: "Ideal Renter %", value: "40%+" },
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
          <div className="mt-8">
            <Card data-testid="card-radar-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Radar className="w-5 h-5 text-[#C8A661]" />
                  Market Factor Radar Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Visual representation of all market factors. Larger coverage area indicates stronger opportunity.
                </p>
                <div className="h-[300px] w-full" data-testid="chart-radar-market-factors">
                  <Suspense fallback={<Skeleton className="h-full w-full" />}>
                    <RadarChartComponent 
                      data={{
                        labels: ['Population/Store', 'Income Score', 'Renter Demand', 'Low Saturation', 'Competitive Edge', 'Opportunity'],
                        datasets: [{
                          label: 'Market Factors',
                          data: [7, 8, 6, 8, 7, 7],
                          backgroundColor: 'rgba(200, 166, 97, 0.3)',
                          borderColor: '#C8A661',
                          borderWidth: 2,
                          pointBackgroundColor: '#C8A661',
                          pointBorderColor: '#C8A661',
                          pointBorderWidth: 1,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        }]
                      }}
                    />
                  </Suspense>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#C8A661]" />
                    <span className="text-muted-foreground">Population/Store: Higher = underserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                    <span className="text-muted-foreground">Income Score: Sweet spot = $35K-$65K</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                    <span className="text-muted-foreground">Renter Demand: Higher % = more demand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span className="text-muted-foreground">Low Saturation: Less competition = better</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
                    <span className="text-muted-foreground">Competitive Edge: Your size advantage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EC4899]" />
                    <span className="text-muted-foreground">Opportunity: Overall market potential</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="border-[#C8A661]/30 bg-gradient-to-br from-[#C8A661]/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-[#C8A661]" />
                  Market Opportunity Grading System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30" data-testid="grade-a-info">
                    <div className="text-3xl font-bold text-green-500">A</div>
                    <div className="text-sm text-muted-foreground mt-1">Score 85+</div>
                    <div className="text-xs text-muted-foreground">Excellent Opportunity</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30" data-testid="grade-b-info">
                    <div className="text-3xl font-bold text-blue-500">B</div>
                    <div className="text-sm text-muted-foreground mt-1">Score 70-84</div>
                    <div className="text-xs text-muted-foreground">Good Potential</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30" data-testid="grade-c-info">
                    <div className="text-3xl font-bold text-yellow-500">C</div>
                    <div className="text-sm text-muted-foreground mt-1">Score 55-69</div>
                    <div className="text-xs text-muted-foreground">Moderate Opportunity</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/30" data-testid="grade-needs-work-info">
                    <div className="text-2xl font-bold text-red-500">Needs Work</div>
                    <div className="text-sm text-muted-foreground mt-1">Score Below 55</div>
                    <div className="text-xs text-muted-foreground">Challenging Market</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Signs of a Strong Market
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-strong-sign-1">
                    <strong>Population 8,000+ per store</strong> - Underserved market with demand
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-strong-sign-2">
                    <strong>Renter % above 45%</strong> - Strong built-in customer base
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-strong-sign-3">
                    <strong>Income $40K-$60K range</strong> - Ideal laundromat demographics
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-strong-sign-4">
                    <strong>Saturation under 50%</strong> - Room for new entrants
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-strong-sign-5">
                    <strong>Aging competitors</strong> - Opportunity to modernize the market
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Warning Signs to Watch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-warning-sign-1">
                    <strong>Saturation above 80%</strong> - Highly competitive, price wars likely
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-warning-sign-2">
                    <strong>Renter % under 30%</strong> - Limited customer base, most own W/D
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-warning-sign-3">
                    <strong>Income above $100K</strong> - Households likely have in-unit laundry
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-warning-sign-4">
                    <strong>New competition nearby</strong> - Recent builds indicate active market
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground" data-testid="text-warning-sign-5">
                    <strong>Declining population</strong> - Shrinking market, reduced demand
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="w-5 h-5 text-[#C8A661]" />
                  Entry Strategy Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50" data-testid="strategy-blue-ocean">
                    <div className="font-semibold text-foreground mb-2">Blue Ocean Entry</div>
                    <p className="text-sm text-muted-foreground">
                      For underserved markets with low saturation and high demand. Focus on capturing market share quickly with premium positioning.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50" data-testid="strategy-size-advantage">
                    <div className="font-semibold text-foreground mb-2">Size Advantage</div>
                    <p className="text-sm text-muted-foreground">
                      Build larger than competitors with better equipment. Become the destination store in moderately competitive markets.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50" data-testid="strategy-differentiation">
                    <div className="font-semibold text-foreground mb-2">Differentiation</div>
                    <p className="text-sm text-muted-foreground">
                      Add WDF services, modern equipment, and loyalty programs to stand out in competitive markets.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50" data-testid="strategy-niche-focus">
                    <div className="font-semibold text-foreground mb-2">Niche Focus</div>
                    <p className="text-sm text-muted-foreground">
                      Target specific customer segments (students, families, commercial) underserved by current operators.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50" data-testid="strategy-acquisition">
                    <div className="font-semibold text-foreground mb-2">Acquisition Strategy</div>
                    <p className="text-sm text-muted-foreground">
                      For saturated markets, consider acquiring underperforming competitors rather than new construction.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50" data-testid="strategy-balanced">
                    <div className="font-semibold text-foreground mb-2">Balanced Approach</div>
                    <p className="text-sm text-muted-foreground">
                      Focus on operational excellence, competitive pricing, and superior customer experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </PremiumResults>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}
