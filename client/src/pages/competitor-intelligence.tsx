import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
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
import { ResponsiveRadar } from "@nivo/radar";
import { 
  Radar, MapPin, Search, Building2, Users, TrendingUp, 
  Target, CheckCircle, AlertTriangle, Lightbulb, Shield,
  Loader2, Sparkles, DollarSign, BarChart3, Crosshair,
  Zap, Star, Eye, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";

interface CompetitorAnalysisResult {
  success: boolean;
  data: {
    address: string;
    radius: number;
    analysisDepth: string;
    marketOverview: {
      estimatedCompetitors: number;
      marketSaturation: "low" | "moderate" | "high" | "saturated";
      estimatedMarketSize: string;
      growthPotential: "high" | "moderate" | "low";
      marketMaturity: "emerging" | "growing" | "mature" | "declining";
    };
    competitorLandscape: {
      traditionalLaundromats: number;
      modernFacilities: number;
      pickupDeliveryServices: number;
      dryCleaners: number;
      laundryApps: number;
      dominantPlayerType: string;
      competitorProfiles: Array<{
        type: string;
        marketShare: string;
        strengths: string[];
        weaknesses: string[];
      }>;
    };
    swotAnalysis: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    positioningStrategy: {
      recommendedPosition: string;
      targetSegment: string;
      uniqueValueProposition: string;
      brandingAdvice: string;
      keyDifferentiators: string[];
    };
    pricingStrategy: {
      marketPricingLevel: "below-market" | "market-rate" | "premium";
      recommendedApproach: string;
      washPricing: { low: number; recommended: number; premium: number };
      dryPricing: { low: number; recommended: number; premium: number };
      pricingTips: string[];
    };
    serviceGaps: Array<{
      gap: string;
      opportunity: string;
      priority: "high" | "medium" | "low";
      estimatedDemand: string;
    }>;
    differentiationOpportunities: Array<{
      opportunity: string;
      implementation: string;
      investmentLevel: "low" | "medium" | "high";
      impactPotential: "high" | "medium" | "low";
    }>;
    competitiveDimensions: {
      priceCompetitiveness: number;
      serviceQuality: number;
      convenience: number;
      technologyAdoption: number;
      customerExperience: number;
      marketPresence: number;
    };
    opportunityScore: {
      score: number;
      grade: "A" | "B" | "C" | "Needs Work";
      marketSharePotential: string;
      verdict: string;
    };
    recommendations: Array<{
      action: string;
      priority: "high" | "medium" | "low";
      timeframe: string;
      expectedImpact: string;
    }>;
  };
  confidence: number;
  error?: string;
}

const GRADE_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  "A": { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.15)", label: "Excellent Opportunity" },
  "B": { color: "#A3E635", bgColor: "rgba(163, 230, 53, 0.15)", label: "Good Potential" },
  "C": { color: "#FBBF24", bgColor: "rgba(251, 191, 36, 0.15)", label: "Fair Opportunity" },
  "Needs Work": { color: "#C8A661", bgColor: "rgba(200, 166, 97, 0.15)", label: "Challenging Market" }
};

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG["Needs Work"];
  
  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{ backgroundColor: config.bgColor }}
      data-testid="badge-opportunity-grade"
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

function SaturationBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-700",
    moderate: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    saturated: "bg-red-100 text-red-700"
  };
  
  return (
    <Badge className={`${colors[level] || colors.moderate} capitalize`} data-testid="badge-saturation-level">
      {level}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200"
  };
  
  return (
    <Badge variant="outline" className={`${colors[priority] || colors.medium} capitalize`} data-testid="badge-priority">
      {priority}
    </Badge>
  );
}

function InvestmentBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: "bg-purple-100 text-purple-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-teal-100 text-teal-700"
  };
  
  return (
    <Badge className={`${colors[level] || colors.medium} capitalize`}>
      {level} Investment
    </Badge>
  );
}

function CompetitorRadarChart({ dimensions }: { dimensions: CompetitorAnalysisResult['data']['competitiveDimensions'] }) {
  const data = [
    { dimension: "Price", value: dimensions.priceCompetitiveness, fullMark: 100 },
    { dimension: "Quality", value: dimensions.serviceQuality, fullMark: 100 },
    { dimension: "Convenience", value: dimensions.convenience, fullMark: 100 },
    { dimension: "Technology", value: dimensions.technologyAdoption, fullMark: 100 },
    { dimension: "Experience", value: dimensions.customerExperience, fullMark: 100 },
    { dimension: "Presence", value: dimensions.marketPresence, fullMark: 100 },
  ];

  return (
    <div className="h-[300px] w-full" data-testid="chart-competitor-radar">
      <ResponsiveRadar
        data={data}
        keys={["value"]}
        indexBy="dimension"
        maxValue={100}
        margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
        curve="linearClosed"
        borderWidth={2}
        borderColor="#C8A661"
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={16}
        enableDots={true}
        dotSize={8}
        dotColor="#0A1628"
        dotBorderWidth={2}
        dotBorderColor="#C8A661"
        colors={["rgba(200, 166, 97, 0.4)"]}
        fillOpacity={0.6}
        blendMode="normal"
        animate={true}
        theme={{
          text: { fill: "#6B7280" },
          grid: { line: { stroke: "#E5E7EB" } },
        }}
      />
    </div>
  );
}

export default function CompetitorIntelligence() {
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState(3);
  const [analysisDepth, setAnalysisDepth] = useState("comprehensive");
  const [progress, setProgress] = useState(0);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { address: string; radius: number; analysisDepth: string }) => {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 12, 85));
      }, 600);
      
      try {
        const response = await apiRequest("POST", "/api/ai/analyze-competitors", data);
        clearInterval(interval);
        setProgress(100);
        return response.json() as Promise<CompetitorAnalysisResult>;
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
    analyzeMutation.mutate({ address, radius, analysisDepth });
  };

  const result = analyzeMutation.data;

  return (
    <>
      <SEO
        title="Competitor Intelligence Radar | AI-Powered Market Analysis | WashBizHub"
        description="Use AI to analyze your laundromat competition. Get instant insights on market saturation, competitor strengths/weaknesses, pricing strategies, and differentiation opportunities."
        keywords={["laundromat competition analysis", "competitor intelligence", "market analysis", "laundromat pricing strategy", "competitive positioning"]}
        canonicalUrl="https://washbizhub.com/competitor-intelligence"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Competitor Intelligence", url: "/competitor-intelligence" }
            ]}
          />
          
          <div className="mt-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Radar className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="heading-page-title">
                  Competitor Intelligence Radar
                </h1>
                <p className="text-muted-foreground">
                  AI-powered competitive market analysis
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-3xl" data-testid="text-page-description">
              Enter any location to get an instant AI analysis of the competitive landscape. 
              Our AI evaluates market saturation, competitor strengths and weaknesses, pricing strategies, 
              and identifies opportunities to differentiate your laundromat business.
            </p>
          </div>

          <Card className="mb-8 bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crosshair className="h-5 w-5 text-[#C8A661]" />
                Analyze Competition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Target Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State ZIP"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10"
                      data-testid="input-address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Analysis Depth</Label>
                  <Select value={analysisDepth} onValueChange={setAnalysisDepth}>
                    <SelectTrigger data-testid="select-analysis-depth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                      <SelectItem value="quick">Quick Assessment</SelectItem>
                      <SelectItem value="pricing-focus">Pricing Focus</SelectItem>
                      <SelectItem value="differentiation-focus">Differentiation Focus</SelectItem>
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
                    Analyzing competitive landscape with AI...
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
                    Analyzing Competition...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Competition
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {analyzeMutation.isError && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-red-700" data-testid="container-error">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Failed to analyze competition. Please try again.</span>
                </div>
              </CardContent>
            </Card>
          )}

          {result?.success && result.data && (
            <div className="space-y-6" data-testid="container-results">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                      Market Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-[#C8A661]" data-testid="text-competitor-count">
                          {result.data.marketOverview.estimatedCompetitors}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Estimated Competitors</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-lg font-bold text-foreground" data-testid="text-market-size">
                          {result.data.marketOverview.estimatedMarketSize}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Est. Market Size</div>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Saturation:</span>
                        <SaturationBadge level={result.data.marketOverview.marketSaturation} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Growth:</span>
                        <Badge className={
                          result.data.marketOverview.growthPotential === "high" 
                            ? "bg-green-100 text-green-700" 
                            : result.data.marketOverview.growthPotential === "moderate"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        } data-testid="badge-growth-potential">
                          {result.data.marketOverview.growthPotential}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Maturity:</span>
                        <Badge variant="outline" className="capitalize" data-testid="badge-market-maturity">
                          {result.data.marketOverview.marketMaturity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#C8A661]" />
                      Opportunity Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GradeBadge 
                      grade={result.data.opportunityScore.grade} 
                      score={result.data.opportunityScore.score} 
                    />
                    <div className="mt-4 space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Market Share Potential: </span>
                        <span className="font-medium" data-testid="text-market-share-potential">
                          {result.data.opportunityScore.marketSharePotential}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid="text-opportunity-verdict">
                        {result.data.opportunityScore.verdict}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#C8A661]" />
                    Competitor Landscape
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-5 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground" data-testid="text-traditional-count">
                        {result.data.competitorLandscape.traditionalLaundromats}
                      </div>
                      <div className="text-xs text-muted-foreground">Traditional</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground" data-testid="text-modern-count">
                        {result.data.competitorLandscape.modernFacilities}
                      </div>
                      <div className="text-xs text-muted-foreground">Modern</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground" data-testid="text-delivery-count">
                        {result.data.competitorLandscape.pickupDeliveryServices}
                      </div>
                      <div className="text-xs text-muted-foreground">Pickup/Delivery</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground" data-testid="text-drycleaners-count">
                        {result.data.competitorLandscape.dryCleaners}
                      </div>
                      <div className="text-xs text-muted-foreground">Dry Cleaners</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground" data-testid="text-apps-count">
                        {result.data.competitorLandscape.laundryApps}
                      </div>
                      <div className="text-xs text-muted-foreground">Laundry Apps</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Dominant Player: </span>
                    <span className="font-medium" data-testid="text-dominant-player">
                      {result.data.competitorLandscape.dominantPlayerType}
                    </span>
                  </div>
                  
                  {result.data.competitorLandscape.competitorProfiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-semibold">Competitor Profiles:</h4>
                      {result.data.competitorLandscape.competitorProfiles.map((profile, idx) => (
                        <div key={idx} className="border rounded-lg p-3" data-testid={`card-competitor-profile-${idx}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{profile.type}</span>
                            <Badge variant="outline">{profile.marketShare}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-green-600 text-xs">Strengths:</span>
                              <ul className="list-disc list-inside text-xs text-muted-foreground">
                                {profile.strengths.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                            <div>
                              <span className="text-red-600 text-xs">Weaknesses:</span>
                              <ul className="list-disc list-inside text-xs text-muted-foreground">
                                {profile.weaknesses.slice(0, 2).map((w, i) => <li key={i}>{w}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#C8A661]" />
                      SWOT Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2" data-testid="container-strengths">
                        <div className="flex items-center gap-1 text-green-600">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm font-semibold">Strengths</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {result.data.swotAnalysis.strengths.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 mt-1 text-green-500 shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2" data-testid="container-weaknesses">
                        <div className="flex items-center gap-1 text-red-600">
                          <ArrowDownRight className="h-4 w-4" />
                          <span className="text-sm font-semibold">Weaknesses</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {result.data.swotAnalysis.weaknesses.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 mt-1 text-red-500 shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2" data-testid="container-opportunities">
                        <div className="flex items-center gap-1 text-blue-600">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm font-semibold">Opportunities</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {result.data.swotAnalysis.opportunities.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <Star className="h-3 w-3 mt-1 text-blue-500 shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2" data-testid="container-threats">
                        <div className="flex items-center gap-1 text-orange-600">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm font-semibold">Threats</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {result.data.swotAnalysis.threats.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <Minus className="h-3 w-3 mt-1 text-orange-500 shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radar className="h-5 w-5 text-[#C8A661]" />
                      Competitive Dimensions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CompetitorRadarChart dimensions={result.data.competitiveDimensions} />
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#C8A661]" />
                    Positioning Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Recommended Position:</span>
                        <p className="font-medium" data-testid="text-recommended-position">
                          {result.data.positioningStrategy.recommendedPosition}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Target Segment:</span>
                        <p className="font-medium" data-testid="text-target-segment">
                          {result.data.positioningStrategy.targetSegment}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Unique Value Proposition:</span>
                      <p className="font-medium" data-testid="text-uvp">
                        {result.data.positioningStrategy.uniqueValueProposition}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Branding Advice:</span>
                      <p className="text-sm text-muted-foreground" data-testid="text-branding-advice">
                        {result.data.positioningStrategy.brandingAdvice}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Key Differentiators:</span>
                      <div className="flex flex-wrap gap-2 mt-2" data-testid="container-differentiators">
                        {result.data.positioningStrategy.keyDifferentiators.map((diff, idx) => (
                          <Badge key={idx} variant="outline">{diff}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#C8A661]" />
                      Pricing Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Market Pricing Level:</span>
                        <Badge 
                          className={
                            result.data.pricingStrategy.marketPricingLevel === "premium"
                              ? "bg-purple-100 text-purple-700"
                              : result.data.pricingStrategy.marketPricingLevel === "below-market"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }
                          data-testid="badge-pricing-level"
                        >
                          {result.data.pricingStrategy.marketPricingLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid="text-pricing-approach">
                        {result.data.pricingStrategy.recommendedApproach}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-1">Wash Pricing</div>
                          <div className="text-sm">
                            <span className="text-green-600">${result.data.pricingStrategy.washPricing.low}</span>
                            <span className="mx-1">-</span>
                            <span className="font-bold text-[#C8A661]">${result.data.pricingStrategy.washPricing.recommended}</span>
                            <span className="mx-1">-</span>
                            <span className="text-purple-600">${result.data.pricingStrategy.washPricing.premium}</span>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-1">Dry Pricing</div>
                          <div className="text-sm">
                            <span className="text-green-600">${result.data.pricingStrategy.dryPricing.low}</span>
                            <span className="mx-1">-</span>
                            <span className="font-bold text-[#C8A661]">${result.data.pricingStrategy.dryPricing.recommended}</span>
                            <span className="mx-1">-</span>
                            <span className="text-purple-600">${result.data.pricingStrategy.dryPricing.premium}</span>
                          </div>
                        </div>
                      </div>
                      <ul className="text-sm space-y-1">
                        {result.data.pricingStrategy.pricingTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 mt-1 text-[#C8A661] shrink-0" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#C8A661]" />
                      Service Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3" data-testid="container-service-gaps">
                      {result.data.serviceGaps.map((gap, idx) => (
                        <div key={idx} className="border rounded-lg p-3" data-testid={`card-service-gap-${idx}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{gap.gap}</span>
                            <PriorityBadge priority={gap.priority} />
                          </div>
                          <p className="text-sm text-muted-foreground">{gap.opportunity}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Demand: {gap.estimatedDemand}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#C8A661]" />
                    Differentiation Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4" data-testid="container-differentiation">
                    {result.data.differentiationOpportunities.map((opp, idx) => (
                      <div key={idx} className="border rounded-lg p-4" data-testid={`card-differentiation-${idx}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{opp.opportunity}</span>
                          <InvestmentBadge level={opp.investmentLevel} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{opp.implementation}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Impact:</span>
                          <Badge 
                            variant="outline"
                            className={
                              opp.impactPotential === "high" 
                                ? "border-green-200 text-green-700"
                                : opp.impactPotential === "medium"
                                ? "border-yellow-200 text-yellow-700"
                                : "border-gray-200 text-gray-700"
                            }
                          >
                            {opp.impactPotential}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-[#C8A661]" />
                    Priority Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3" data-testid="container-recommendations">
                    {result.data.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-4 border rounded-lg p-4" data-testid={`card-recommendation-${idx}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <PriorityBadge priority={rec.priority} />
                            <span className="text-xs text-muted-foreground">{rec.timeframe}</span>
                          </div>
                          <p className="font-medium">{rec.action}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Expected Impact: {rec.expectedImpact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground" data-testid="text-confidence">
                Analysis Confidence: {Math.round(result.confidence * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
