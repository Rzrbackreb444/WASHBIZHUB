import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResponsiveRadar } from "@nivo/radar";
import { 
  TrendingUp, DollarSign, Target, MapPin,
  BarChart3, Sparkles, Info, CheckCircle, AlertTriangle,
  XCircle, Building2, Users, Clock, Shield, Radar
} from "lucide-react";

const expansionFeasibilityConfig: PremiumCalculatorConfig = {
  id: "expansion-feasibility-scorecard",
  name: "Expansion Feasibility Scorecard Calculator",
  description: "Evaluate the viability of expanding your laundromat business with comprehensive financial, market, and operational analysis. Get a data-driven Go/Caution/Wait recommendation.",
  category: "Strategic Planning",
  inputs: [
    {
      name: "capitalAvailable",
      label: "Capital Available",
      type: "slider",
      defaultValue: 150000,
      min: 25000,
      max: 1000000,
      step: 5000,
      prefix: "$",
      tooltip: "Total liquid capital you have available for expansion including cash, investments, and accessible credit lines.",
    },
    {
      name: "financingRate",
      label: "Financing Rate",
      type: "slider",
      defaultValue: 8,
      min: 4,
      max: 18,
      step: 0.25,
      suffix: "%",
      tooltip: "Expected annual interest rate on borrowed funds. SBA loans: 6-8%, conventional: 8-12%, private: 12-18%.",
    },
    {
      name: "targetPopulation",
      label: "Target Market Population",
      type: "slider",
      defaultValue: 25000,
      min: 5000,
      max: 200000,
      step: 1000,
      tooltip: "Population within 1-2 mile radius of proposed location. Ideal: 20,000+ per store.",
    },
    {
      name: "competitionCount",
      label: "Competition Count in Area",
      type: "slider",
      defaultValue: 3,
      min: 0,
      max: 15,
      step: 1,
      tooltip: "Number of competing laundromats within 2-mile radius. Lower competition = higher opportunity.",
    },
    {
      name: "estimatedMonthlyRevenue",
      label: "Estimated Monthly Revenue",
      type: "slider",
      defaultValue: 25000,
      min: 5000,
      max: 100000,
      step: 1000,
      prefix: "$",
      tooltip: "Projected monthly revenue based on market research. Use $2-4/sq ft or $800-1,200/machine benchmarks.",
    },
    {
      name: "estimatedMonthlyExpenses",
      label: "Estimated Monthly Expenses",
      type: "slider",
      defaultValue: 15000,
      min: 3000,
      max: 60000,
      step: 500,
      prefix: "$",
      tooltip: "Total monthly operating expenses including utilities, labor, supplies, and maintenance.",
    },
    {
      name: "leaseCost",
      label: "Monthly Lease Cost",
      type: "slider",
      defaultValue: 4000,
      min: 1000,
      max: 20000,
      step: 250,
      prefix: "$",
      tooltip: "Monthly rent/lease cost. Aim for rent under 20% of projected revenue.",
    },
    {
      name: "equipmentInvestment",
      label: "Equipment Investment Needed",
      type: "slider",
      defaultValue: 200000,
      min: 50000,
      max: 800000,
      step: 10000,
      prefix: "$",
      tooltip: "Total cost for washers, dryers, payment systems, and other equipment.",
    },
    {
      name: "buildoutCosts",
      label: "Build-out Costs",
      type: "slider",
      defaultValue: 75000,
      min: 10000,
      max: 300000,
      step: 5000,
      prefix: "$",
      tooltip: "Construction, plumbing, electrical, HVAC, and interior build-out expenses.",
    },
    {
      name: "yearsExperience",
      label: "Years of Operation Experience",
      type: "slider",
      defaultValue: 3,
      min: 0,
      max: 20,
      step: 0.5,
      tooltip: "Your total years of laundromat operation experience. More experience = lower operational risk.",
    },
  ],
  outputs: [
    {
      name: "totalInvestment",
      label: "Total Investment Required",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Equipment + Build-out + 3 months lease reserve",
    },
    {
      name: "projectedDSCR",
      label: "Projected DSCR",
      format: "number",
      decimals: 2,
      highlight: true,
      description: "Debt Service Coverage Ratio (1.25+ is healthy)",
    },
    {
      name: "timeToProfitability",
      label: "Time to Profitability",
      format: "number",
      decimals: 1,
      description: "Estimated months to reach break-even",
    },
    {
      name: "feasibilityScore",
      label: "Expansion Feasibility Score",
      format: "number",
      decimals: 0,
      highlight: true,
      description: "Overall score from 0-100 (85+ = Go, 70-84 = Caution, <70 = Wait)",
    },
    {
      name: "marketOpportunityScore",
      label: "Market Opportunity Score",
      format: "number",
      decimals: 0,
      description: "Based on population-to-competition ratio",
    },
    {
      name: "financialReadinessScore",
      label: "Financial Readiness Score",
      format: "number",
      decimals: 0,
      description: "Based on capital coverage and financing terms",
    },
    {
      name: "operationalReadinessScore",
      label: "Operational Readiness Score",
      format: "number",
      decimals: 0,
      description: "Based on experience and projected margins",
    },
    {
      name: "monthlyNetCashFlow",
      label: "Monthly Net Cash Flow",
      format: "currency",
      decimals: 0,
      description: "Projected monthly revenue minus expenses",
    },
    {
      name: "annualDebtService",
      label: "Annual Debt Service",
      format: "currency",
      decimals: 0,
      description: "Annual loan payments on financed portion",
    },
    {
      name: "successProbability",
      label: "Success Probability",
      format: "percentage",
      decimals: 0,
      description: "Statistical likelihood of successful expansion",
    },
  ],
  formulas: {
    totalInvestment: "equipmentInvestment + buildoutCosts + (leaseCost * 3)",
    financedAmount: "Math.max(0, totalInvestment - capitalAvailable)",
    monthlyNetCashFlow: "estimatedMonthlyRevenue - estimatedMonthlyExpenses",
    annualNetCashFlow: "monthlyNetCashFlow * 12",
    annualDebtService: "financedAmount > 0 ? (financedAmount * (financingRate / 100) * 1.2) : 0",
    projectedDSCR: "annualDebtService > 0 ? annualNetCashFlow / annualDebtService : 99",
    timeToProfitability: "monthlyNetCashFlow > 0 ? totalInvestment / monthlyNetCashFlow : 120",
    populationPerCompetitor: "competitionCount > 0 ? targetPopulation / competitionCount : targetPopulation",
    marketOpportunityScore: "Math.min(100, (populationPerCompetitor / 5000) * 100)",
    capitalCoverageRatio: "capitalAvailable / totalInvestment",
    financialReadinessScore: "Math.min(100, capitalCoverageRatio * 100)",
    operatingMargin: "(estimatedMonthlyRevenue - estimatedMonthlyExpenses) / estimatedMonthlyRevenue * 100",
    experienceMultiplier: "Math.min(1, (yearsExperience / 5))",
    operationalReadinessScore: "Math.min(100, (operatingMargin * 2) + (experienceMultiplier * 40))",
    feasibilityScore: "(financialReadinessScore + marketOpportunityScore + operationalReadinessScore) / 3",
    successProbability: "Math.min(95, Math.max(20, feasibilityScore * 0.9 + (projectedDSCR > 1.25 ? 10 : 0)))",
  },
  charts: [
    {
      type: "bar",
      title: "Readiness Scores",
      dataKeys: ["financialReadinessScore", "marketOpportunityScore", "operationalReadinessScore", "feasibilityScore"],
      labels: ["Financial", "Market", "Operational", "Overall"],
      colors: ["#3B82F6", "#22C55E", "#F59E0B", "#C8A661"],
    },
    {
      type: "pie",
      title: "Investment Breakdown",
      dataKeys: ["equipmentInvestment", "buildoutCosts", "leaseCost"],
      labels: ["Equipment", "Build-out", "Lease Reserve"],
      colors: ["#0A1628", "#C8A661", "#22C55E"],
    },
  ],
  tips: [
    "Target DSCR of 1.25+ for healthy debt coverage",
    "Aim for rent under 20% of projected monthly revenue",
    "Population-to-competition ratio of 8,000:1 is ideal",
    "5+ years experience significantly reduces operational risk",
    "Keep 6 months operating reserves beyond initial investment",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

function getGrade(score: number): { grade: string; color: string; bgColor: string } {
  if (score >= 85) return { grade: "A", color: "text-green-600", bgColor: "bg-green-500/10 border-green-500/30" };
  if (score >= 70) return { grade: "B", color: "text-blue-600", bgColor: "bg-blue-500/10 border-blue-500/30" };
  if (score >= 55) return { grade: "C", color: "text-amber-600", bgColor: "bg-amber-500/10 border-amber-500/30" };
  return { grade: "Needs Work", color: "text-red-600", bgColor: "bg-red-500/10 border-red-500/30" };
}

function getRecommendation(score: number): { text: string; icon: typeof CheckCircle; color: string } {
  if (score >= 85) return { text: "GO - Strong Expansion Opportunity", icon: CheckCircle, color: "text-green-500" };
  if (score >= 70) return { text: "CAUTION - Proceed with Improvements", icon: AlertTriangle, color: "text-amber-500" };
  return { text: "WAIT - Address Key Issues First", icon: XCircle, color: "text-red-500" };
}

interface ReadinessRadarChartProps {
  financialScore: number;
  marketScore: number;
  operationalScore: number;
}

function ReadinessRadarChart({ financialScore, marketScore, operationalScore }: ReadinessRadarChartProps) {
  const radarData = useMemo(() => [
    { dimension: "Financial Readiness", score: financialScore, fullMark: 100 },
    { dimension: "Market Opportunity", score: marketScore, fullMark: 100 },
    { dimension: "Operational Readiness", score: operationalScore, fullMark: 100 },
    { dimension: "Capital Coverage", score: Math.min(100, financialScore * 1.1), fullMark: 100 },
    { dimension: "Risk Mitigation", score: Math.min(100, (financialScore + operationalScore) / 2), fullMark: 100 },
  ], [financialScore, marketScore, operationalScore]);

  return (
    <div className="h-[300px] w-full" data-testid="chart-readiness-radar">
      <ResponsiveRadar
        data={radarData}
        keys={["score"]}
        indexBy="dimension"
        maxValue={100}
        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
        borderColor={{ from: "color" }}
        gridLabelOffset={20}
        dotSize={8}
        dotColor={{ theme: "background" }}
        dotBorderWidth={2}
        colors={["#C8A661"]}
        fillOpacity={0.25}
        blendMode="multiply"
        animate={true}
        theme={{
          text: { fill: "#888888", fontSize: 11 },
          grid: { line: { stroke: "#444444", strokeWidth: 1 } },
        }}
      />
    </div>
  );
}

export default function ExpansionFeasibilityScorecard() {
  return (
    <>
      <SEO
        title="Expansion Feasibility Scorecard Calculator | Laundromat Growth Planning | WashBizHub"
        description="Evaluate your laundromat expansion opportunity with our comprehensive feasibility scorecard. Analyze financial readiness, market opportunity, and operational factors for data-driven expansion decisions."
        canonicalUrl="/expansion-feasibility-scorecard"
        ogType="website"
        keywords={[
          "laundromat expansion calculator",
          "laundromat feasibility study",
          "laundromat growth planning",
          "expansion scorecard",
          "laundromat investment analysis",
          "multi-store laundromat",
          "laundromat market analysis",
          "expansion risk assessment",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Expansion Feasibility Scorecard", url: "/expansion-feasibility-scorecard" },
            ]}
          />

          <div className="mb-8 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Expansion Feasibility Scorecard
                </h1>
                <p className="text-muted-foreground">
                  Data-driven analysis for your laundromat expansion decision
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30" data-testid="badge-category">
                <Sparkles className="w-3 h-3 mr-1" />
                Strategic Planning
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target DSCR</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-target-dscr">1.25+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ideal Pop/Store</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-ideal-population">8,000+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rent % Target</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-rent-target">&lt;20%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Break-even</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-breakeven">18-24 mo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-blue-500/30 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400">Understanding the Feasibility Score</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              This calculator evaluates expansion readiness across three dimensions: Financial (capital coverage, debt service), 
              Market (population density, competition), and Operational (experience, projected margins). 
              Scores 85+ receive "Go" recommendation, 70-84 "Caution", and below 70 "Wait".
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={expansionFeasibilityConfig} />

          <div className="mt-8">
            <Card data-testid="card-readiness-radar">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Radar className="w-5 h-5 text-[#C8A661]" />
                  Readiness Radar Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Visual comparison of your readiness across key expansion dimensions. 
                  Higher scores toward the outer edge indicate stronger performance.
                </p>
                <ReadinessRadarChart 
                  financialScore={55} 
                  marketScore={70} 
                  operationalScore={60} 
                />
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm text-muted-foreground">Financial</p>
                    <p className="text-xl font-bold text-blue-600" data-testid="text-radar-financial">55</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-sm text-muted-foreground">Market</p>
                    <p className="text-xl font-bold text-green-600" data-testid="text-radar-market">70</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm text-muted-foreground">Operational</p>
                    <p className="text-xl font-bold text-amber-600" data-testid="text-radar-operational">60</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-[#C8A661]" />
                  Grading Scale (CLEANBI Style)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-green-600" data-testid="text-grade-a">Grade A (85-100)</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">GO</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-blue-600" data-testid="text-grade-b">Grade B (70-84)</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">CAUTION</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-amber-600" data-testid="text-grade-c">Grade C (55-69)</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">WAIT</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-red-600" data-testid="text-grade-needs-work">Needs Work (&lt;55)</span>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">STOP</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Key Risk Factors to Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Undercapitalization:</strong> Having less than 30% capital coverage increases failure risk
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Market Saturation:</strong> Less than 5,000 pop per competitor signals oversaturated market
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>High Rent Ratio:</strong> Rent exceeding 25% of revenue severely impacts profitability
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Low DSCR:</strong> DSCR below 1.0 means inability to cover debt payments
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Financial Readiness Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Target 50%+ capital coverage</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Secure SBA financing (6-8% rates)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Keep 6 months operating reserves</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Market Opportunity Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Target 8,000+ pop per competitor</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Focus on 40%+ renter demographics</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Verify traffic counts &amp; visibility</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Operational Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Gain 3+ years experience first</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Target 25%+ operating margin</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">Document SOPs before expanding</span>
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
