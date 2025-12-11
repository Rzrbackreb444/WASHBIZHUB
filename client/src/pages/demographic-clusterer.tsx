import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { 
  Users, MapPin, Search, Building2, DollarSign, Home,
  Car, Train, Shirt, Target, User, Loader2, Sparkles,
  AlertTriangle, TrendingUp, TrendingDown, Minus, ShoppingBag
} from "lucide-react";

interface DemographicAnalysisResult {
  success: boolean;
  data: {
    address: string;
    radius: number;
    analysisFocus: string;
    populationOverview: {
      totalEstimate: number;
      density: "high" | "medium" | "low";
      densityDescription: string;
      growthTrend: "growing" | "stable" | "declining";
      medianAge: number;
    };
    customerSegments: {
      families: { percentage: number; count: number; description: string };
      singles: { percentage: number; count: number; description: string };
      elderly: { percentage: number; count: number; description: string };
      students: { percentage: number; count: number; description: string };
      professionals: { percentage: number; count: number; description: string };
    };
    incomeDistribution: {
      lowIncome: { percentage: number; range: string };
      moderateIncome: { percentage: number; range: string };
      middleIncome: { percentage: number; range: string };
      upperMiddleIncome: { percentage: number; range: string };
      highIncome: { percentage: number; range: string };
      medianHouseholdIncome: number;
      incomeAssessment: string;
    };
    housingAnalysis: {
      apartments: { percentage: number; description: string };
      singleFamily: { percentage: number; description: string };
      condos: { percentage: number; description: string };
      multiFamily: { percentage: number; description: string };
      renterPercentage: number;
      ownerPercentage: number;
      averageHouseholdSize: number;
      housingAssessment: string;
    };
    lifestyleIndicators: {
      carOwnership: { percentage: number; avgVehiclesPerHousehold: number; assessment: string };
      transitUsage: { percentage: number; transitScore: number; assessment: string };
      walkability: { score: number; assessment: string };
      commutePatterns: string;
      shoppingPreferences: string;
    };
    laundryBehavior: {
      selfServiceLikelihood: number;
      dropOffLikelihood: number;
      pickupDeliveryLikelihood: number;
      washerOwnership: number;
      averageLoadsPerWeek: number;
      peakDays: string[];
      peakHours: string[];
      pricesSensitivity: "high" | "medium" | "low";
      conveniencePreference: "high" | "medium" | "low";
      behaviorAssessment: string;
    };
    spendingPower: {
      discretionaryIncomeLevel: "high" | "medium" | "low";
      monthlyLaundryBudget: { low: number; average: number; high: number };
      pricePointRecommendation: string;
      spendingAssessment: string;
    };
    customerPersonas: Array<{
      name: string;
      age: string;
      occupation: string;
      householdType: string;
      income: string;
      laundryNeeds: string;
      visitFrequency: string;
      preferredServices: string[];
      painPoints: string[];
      marketingApproach: string;
      estimatedPercentage: number;
    }>;
    marketOpportunity: {
      score: number;
      grade: "A" | "B" | "C" | "D";
      primaryTarget: string;
      secondaryTarget: string;
      verdict: string;
    };
  };
  confidence: number;
  error?: string;
}

const GRADE_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  "A": { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.15)", label: "Excellent Market" },
  "B": { color: "#A3E635", bgColor: "rgba(163, 230, 53, 0.15)", label: "Good Opportunity" },
  "C": { color: "#FBBF24", bgColor: "rgba(251, 191, 36, 0.15)", label: "Fair Potential" },
  "D": { color: "#F87171", bgColor: "rgba(248, 113, 113, 0.15)", label: "Limited Market" }
};

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG["C"];
  
  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{ backgroundColor: config.bgColor }}
      data-testid="badge-market-grade"
    >
      <div 
        className="text-4xl font-bold"
        style={{ color: config.color }}
        data-testid="text-grade-letter"
      >
        {grade}
      </div>
      <div>
        <div 
          className="text-lg font-semibold"
          style={{ color: config.color }}
          data-testid="text-grade-score"
        >
          {score}/100
        </div>
        <div className="text-sm text-muted-foreground" data-testid="text-grade-label">
          {config.label}
        </div>
      </div>
    </div>
  );
}

function DensityBadge({ density }: { density: string }) {
  const colors: Record<string, string> = {
    high: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-red-100 text-red-700"
  };
  return (
    <Badge className={`${colors[density] || colors.medium} capitalize`} data-testid="badge-density">
      {density} Density
    </Badge>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "growing") return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (trend === "declining") return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-yellow-600" />;
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-red-100 text-red-700"
  };
  return (
    <Badge className={`${colors[level] || colors.medium} capitalize`}>
      {level}
    </Badge>
  );
}

export default function DemographicClusterer() {
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState(3);
  const [analysisFocus, setAnalysisFocus] = useState("comprehensive");
  const [progress, setProgress] = useState(0);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { address: string; radius: number; analysisFocus: string }) => {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 12, 85));
      }, 600);
      
      try {
        const response = await apiRequest("POST", "/api/ai/cluster-demographics", data);
        clearInterval(interval);
        setProgress(100);
        return response.json() as Promise<DemographicAnalysisResult>;
      } catch (error) {
        clearInterval(interval);
        setProgress(0);
        throw error;
      }
    },
    onSettled: () => {
      setTimeout(() => setProgress(0), 1000);
    }
  });

  const handleAnalyze = () => {
    if (!address.trim()) return;
    analyzeMutation.mutate({ address, radius, analysisFocus });
  };

  const result = analyzeMutation.data;

  const segmentPieData = result?.success && result.data ? [
    { id: "Families", value: result.data.customerSegments.families.percentage, color: "#0A1628" },
    { id: "Singles", value: result.data.customerSegments.singles.percentage, color: "#C8A661" },
    { id: "Elderly", value: result.data.customerSegments.elderly.percentage, color: "#4B5563" },
    { id: "Students", value: result.data.customerSegments.students.percentage, color: "#6B7280" },
    { id: "Professionals", value: result.data.customerSegments.professionals.percentage, color: "#9CA3AF" },
  ] : [];

  const incomeBarData = result?.success && result.data ? [
    { bracket: "<$30K", percentage: result.data.incomeDistribution.lowIncome.percentage },
    { bracket: "$30-50K", percentage: result.data.incomeDistribution.moderateIncome.percentage },
    { bracket: "$50-75K", percentage: result.data.incomeDistribution.middleIncome.percentage },
    { bracket: "$75-100K", percentage: result.data.incomeDistribution.upperMiddleIncome.percentage },
    { bracket: ">$100K", percentage: result.data.incomeDistribution.highIncome.percentage },
  ] : [];

  return (
    <>
      <SEO
        title="Demographic Micro-Clusterer | AI-Powered Customer Analysis | WashBizHub"
        description="Analyze demographics around any location with AI. Get detailed customer segments, income distribution, housing analysis, and laundry behavior predictions for your laundromat business."
        keywords={["demographic analysis", "customer segmentation", "laundromat demographics", "market analysis", "AI demographics"]}
        canonicalUrl="https://washbizhub.com/demographic-clusterer"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Demographic Micro-Clusterer", url: "/demographic-clusterer" }
            ]}
          />
          
          <div className="mt-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Users className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="heading-page-title">
                  Demographic Micro-Clusterer
                </h1>
                <p className="text-muted-foreground">
                  AI-powered customer segment analysis
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-3xl" data-testid="text-page-description">
              Enter any address or ZIP code to get a detailed AI analysis of the surrounding demographics. 
              Understand customer segments, income distribution, housing types, and predict laundry behavior for your market.
            </p>
          </div>

          <Card className="mb-8 bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-[#C8A661]" />
                Analyze Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address or ZIP Code
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State or ZIP code"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10"
                      data-testid="input-address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Analysis Focus</Label>
                  <Select value={analysisFocus} onValueChange={setAnalysisFocus}>
                    <SelectTrigger data-testid="select-analysis-focus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                      <SelectItem value="segments">Customer Segments Focus</SelectItem>
                      <SelectItem value="income">Income Analysis Focus</SelectItem>
                      <SelectItem value="housing">Housing Focus</SelectItem>
                      <SelectItem value="laundry">Laundry Behavior Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Analysis Radius</Label>
                  <span className="text-sm text-muted-foreground" data-testid="text-radius-value">
                    {radius} mile{radius !== 1 ? "s" : ""}
                  </span>
                </div>
                <Slider
                  value={[radius]}
                  onValueChange={(v) => setRadius(v[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  data-testid="slider-radius"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 mi</span>
                  <span>5 mi</span>
                  <span>10 mi</span>
                </div>
              </div>

              {analyzeMutation.isPending && (
                <div className="space-y-2" data-testid="container-loading">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing demographics with AI...
                  </div>
                  <Progress value={progress} className="h-2" data-testid="progress-analysis" />
                </div>
              )}

              <Button 
                onClick={handleAnalyze}
                disabled={!address.trim() || analyzeMutation.isPending}
                className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                data-testid="button-analyze"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Demographics
                  </>
                )}
              </Button>

              {analyzeMutation.isError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2" data-testid="alert-error">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Failed to analyze demographics. Please try again.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {result?.success && result.data && (
            <PremiumResults
              featureName="demographic-clusterer"
              analysisType="demographic-clusterer"
              title="Demographic Analysis Results"
              data={result.data}
              summary={{
                headline: `${result.data.populationOverview.totalEstimate.toLocaleString()} Est. Population`,
                metrics: [
                  { label: "Median Age", value: result.data.populationOverview.medianAge?.toString() || "N/A" },
                  { label: "Density", value: result.data.populationOverview.density },
                  { label: "Confidence", value: `${Math.round(result.confidence * 100)}%` },
                ]
              }}
              benefits={[
                "Unlimited AI analyses",
                "Export to Google Sheets & Docs",
                "Save all results to profile"
              ]}
            >
              <div className="space-y-6" data-testid="container-results">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#C8A661]" />
                    Population Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium" data-testid="text-address">
                          {result.data.address}
                        </span>
                        <Badge variant="outline">{result.data.radius} mi radius</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid="text-density-description">
                        {result.data.populationOverview.densityDescription}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>AI Confidence:</span>
                        <Progress value={result.confidence * 100} className="w-24 h-2" />
                        <span>{Math.round(result.confidence * 100)}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-population">
                          {result.data.populationOverview.totalEstimate.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Est. Population</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-median-age">
                          {result.data.populationOverview.medianAge}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Median Age</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <DensityBadge density={result.data.populationOverview.density} />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center flex flex-col items-center">
                        <div className="flex items-center gap-1" data-testid="text-growth-trend">
                          <TrendIcon trend={result.data.populationOverview.growthTrend} />
                          <span className="text-sm font-medium capitalize">
                            {result.data.populationOverview.growthTrend}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Growth Trend</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-[#C8A661]" />
                      Customer Segments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64" data-testid="chart-segments">
                      <ResponsivePie
                        data={segmentPieData}
                        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                        innerRadius={0.5}
                        padAngle={0.7}
                        cornerRadius={3}
                        colors={{ datum: "data.color" }}
                        borderWidth={1}
                        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                        arcLinkLabelsSkipAngle={10}
                        arcLinkLabelsTextColor="#666"
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsColor={{ from: "color" }}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor="#fff"
                        valueFormat={(value) => `${value}%`}
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      {Object.entries(result.data.customerSegments).map(([key, seg]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="capitalize text-muted-foreground">{key}</span>
                          <span className="font-medium">{seg.percentage}% ({seg.count.toLocaleString()})</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-[#C8A661]" />
                      Income Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64" data-testid="chart-income">
                      <ResponsiveBar
                        data={incomeBarData}
                        keys={["percentage"]}
                        indexBy="bracket"
                        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                        padding={0.3}
                        valueScale={{ type: "linear" }}
                        colors={["#C8A661"]}
                        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: -45,
                        }}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          format: (v) => `${v}%`,
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor="#fff"
                        valueFormat={(v) => `${v}%`}
                      />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 mt-4 text-center">
                      <div className="text-xl font-bold text-[#C8A661]" data-testid="text-median-income">
                        ${result.data.incomeDistribution.medianHouseholdIncome.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Median Household Income</div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3" data-testid="text-income-assessment">
                      {result.data.incomeDistribution.incomeAssessment}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-[#C8A661]" />
                    Housing Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Housing Types</h4>
                      {[
                        { label: "Apartments", value: result.data.housingAnalysis.apartments },
                        { label: "Single Family", value: result.data.housingAnalysis.singleFamily },
                        { label: "Condos/Townhouses", value: result.data.housingAnalysis.condos },
                        { label: "Multi-Family", value: result.data.housingAnalysis.multiFamily },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium">{item.value.percentage}%</span>
                          </div>
                          <Progress value={item.value.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-renter-pct">
                            {result.data.housingAnalysis.renterPercentage}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Renters</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-foreground" data-testid="text-owner-pct">
                            {result.data.housingAnalysis.ownerPercentage}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Owners</div>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-[#C8A661]" data-testid="text-household-size">
                          {result.data.housingAnalysis.averageHouseholdSize}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Avg. Household Size</div>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid="text-housing-assessment">
                        {result.data.housingAnalysis.housingAssessment}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Car className="h-5 w-5 text-[#C8A661]" />
                      Lifestyle Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Car Ownership</span>
                      </div>
                      <span className="font-medium" data-testid="text-car-ownership">
                        {result.data.lifestyleIndicators.carOwnership.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.data.lifestyleIndicators.carOwnership.assessment} 
                      ({result.data.lifestyleIndicators.carOwnership.avgVehiclesPerHousehold} vehicles/household)
                    </p>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Train className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Transit Usage</span>
                      </div>
                      <span className="font-medium" data-testid="text-transit-usage">
                        {result.data.lifestyleIndicators.transitUsage.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.data.lifestyleIndicators.transitUsage.assessment} 
                      (Score: {result.data.lifestyleIndicators.transitUsage.transitScore}/100)
                    </p>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Walkability Score</span>
                      <span className="font-medium" data-testid="text-walkability">
                        {result.data.lifestyleIndicators.walkability.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.data.lifestyleIndicators.walkability.assessment}
                    </p>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Shopping Preferences</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.data.lifestyleIndicators.shoppingPreferences}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shirt className="h-5 w-5 text-[#C8A661]" />
                      Laundry Behavior Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Self-Service Likelihood</span>
                        <span className="font-medium text-[#C8A661]" data-testid="text-self-service">
                          {result.data.laundryBehavior.selfServiceLikelihood}%
                        </span>
                      </div>
                      <Progress value={result.data.laundryBehavior.selfServiceLikelihood} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Drop-Off Likelihood</span>
                        <span className="font-medium" data-testid="text-dropoff">
                          {result.data.laundryBehavior.dropOffLikelihood}%
                        </span>
                      </div>
                      <Progress value={result.data.laundryBehavior.dropOffLikelihood} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pickup/Delivery Likelihood</span>
                        <span className="font-medium" data-testid="text-pickup-delivery">
                          {result.data.laundryBehavior.pickupDeliveryLikelihood}%
                        </span>
                      </div>
                      <Progress value={result.data.laundryBehavior.pickupDeliveryLikelihood} className="h-2" />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-[#C8A661]" data-testid="text-washer-ownership">
                          {result.data.laundryBehavior.washerOwnership}%
                        </div>
                        <div className="text-xs text-muted-foreground">Own Washers</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-[#C8A661]" data-testid="text-loads-per-week">
                          {result.data.laundryBehavior.averageLoadsPerWeek}
                        </div>
                        <div className="text-xs text-muted-foreground">Loads/Week</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Peak:</span>
                      {result.data.laundryBehavior.peakDays.map((day) => (
                        <Badge key={day} variant="secondary" className="text-xs">{day}</Badge>
                      ))}
                      {result.data.laundryBehavior.peakHours.map((hour) => (
                        <Badge key={hour} variant="outline" className="text-xs">{hour}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Price Sensitivity:</span>
                        <LevelBadge level={result.data.laundryBehavior.pricesSensitivity} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Convenience:</span>
                        <LevelBadge level={result.data.laundryBehavior.conveniencePreference} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid="text-behavior-assessment">
                      {result.data.laundryBehavior.behaviorAssessment}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#C8A661]" />
                    Spending Power Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-2">Discretionary Income</div>
                      <LevelBadge level={result.data.spendingPower.discretionaryIncomeLevel} />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-2">Monthly Laundry Budget</div>
                      <div className="text-lg font-bold text-[#C8A661]" data-testid="text-monthly-budget">
                        ${result.data.spendingPower.monthlyLaundryBudget.low} - ${result.data.spendingPower.monthlyLaundryBudget.high}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg: ${result.data.spendingPower.monthlyLaundryBudget.average}
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-2">Price Point Recommendation</div>
                      <p className="text-sm font-medium" data-testid="text-price-recommendation">
                        {result.data.spendingPower.pricePointRecommendation}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4" data-testid="text-spending-assessment">
                    {result.data.spendingPower.spendingAssessment}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#C8A661]" />
                    Target Customer Personas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="container-personas">
                    {result.data.customerPersonas.map((persona, index) => (
                      <Card key={index} className="bg-muted/30 border" data-testid={`card-persona-${index}`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{persona.name}</h4>
                            <Badge className="bg-[#C8A661] text-[#0A1628]">
                              {persona.estimatedPercentage}%
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Age:</span> {persona.age}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Occupation:</span> {persona.occupation}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Household:</span> {persona.householdType}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Income:</span> {persona.income}
                            </p>
                          </div>
                          <Separator />
                          <div className="text-sm space-y-2">
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Needs:</span> {persona.laundryNeeds}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Frequency:</span> {persona.visitFrequency}
                            </p>
                            <div>
                              <span className="font-medium text-foreground text-sm">Services:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {persona.preferredServices.map((service, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{service}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-foreground text-sm">Pain Points:</span>
                              <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                                {persona.painPoints.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <span className="font-medium text-foreground text-sm">Marketing Approach:</span>
                            <p className="text-xs text-muted-foreground mt-1">{persona.marketingApproach}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#C8A661]" />
                    Target Priority Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="container-priority-matrix">
                    <p className="text-sm text-muted-foreground">
                      Focus your marketing efforts on these segments based on potential and accessibility:
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.data.customerPersonas
                        .sort((a, b) => b.estimatedPercentage - a.estimatedPercentage)
                        .map((persona, index) => {
                          const priority = index === 0 ? "High" : index === 1 ? "Medium" : "Low";
                          const priorityColor = index === 0 
                            ? "bg-green-100 text-green-700 border-green-200" 
                            : index === 1 
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200" 
                            : "bg-gray-100 text-gray-700 border-gray-200";
                          const bgColor = index === 0 
                            ? "bg-green-50 dark:bg-green-900/20" 
                            : index === 1 
                            ? "bg-yellow-50 dark:bg-yellow-900/20" 
                            : "bg-gray-50 dark:bg-gray-900/20";
                          
                          return (
                            <div 
                              key={index} 
                              className={`rounded-lg p-4 border ${bgColor}`}
                              data-testid={`priority-segment-${index}`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <Badge className={priorityColor}>
                                  #{index + 1} {priority} Priority
                                </Badge>
                                <span className="text-lg font-bold text-[#C8A661]">
                                  {persona.estimatedPercentage}%
                                </span>
                              </div>
                              <h4 className="font-semibold text-foreground mb-2">{persona.name}</h4>
                              <div className="space-y-2 text-sm">
                                <p className="text-muted-foreground">
                                  <span className="font-medium">Target:</span> {persona.householdType}, {persona.age}
                                </p>
                                <p className="text-muted-foreground">
                                  <span className="font-medium">Income:</span> {persona.income}
                                </p>
                                <p className="text-muted-foreground">
                                  <span className="font-medium">Frequency:</span> {persona.visitFrequency}
                                </p>
                              </div>
                              <Separator className="my-3" />
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-foreground">Marketing Message:</p>
                                <p className="text-xs text-muted-foreground italic">
                                  "{persona.marketingApproach}"
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#C8A661]" />
                    Market Opportunity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <GradeBadge 
                        grade={result.data.marketOpportunity.grade} 
                        score={result.data.marketOpportunity.score} 
                      />
                      <p className="mt-4 text-muted-foreground" data-testid="text-market-verdict">
                        {result.data.marketOpportunity.verdict}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Primary Target Segment</div>
                        <p className="font-semibold text-foreground" data-testid="text-primary-target">
                          {result.data.marketOpportunity.primaryTarget}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Secondary Target Segment</div>
                        <p className="font-semibold text-foreground" data-testid="text-secondary-target">
                          {result.data.marketOpportunity.secondaryTarget}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </PremiumResults>
          )}
        </div>
      </div>
    </>
  );
}
