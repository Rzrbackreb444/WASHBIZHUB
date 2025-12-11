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
import { 
  MapPin, Search, Building2, Users, TrendingUp, Car, 
  Eye, Target, CheckCircle, AlertTriangle, Lightbulb,
  Loader2, Sparkles, Home, DollarSign, BarChart3, Navigation
} from "lucide-react";

interface LocationScoutResult {
  success: boolean;
  data: {
    address: string;
    coordinates: { lat: number; lng: number } | null;
    radius: number;
    analysisType: string;
    locationProfile: {
      neighborhood: string;
      areaType: "urban" | "suburban" | "rural";
      walkabilityEstimate: "high" | "medium" | "low";
      parkingAvailability: "abundant" | "adequate" | "limited";
      visibility: "high" | "medium" | "low";
      accessibilityScore: number;
    };
    demographics: {
      populationDensity: {
        estimate: "high" | "medium" | "low";
        description: string;
      };
      renterRatio: {
        estimate: number;
        assessment: string;
      };
      medianIncome: {
        bracket: "low" | "moderate" | "middle" | "upper-middle" | "high";
        idealForLaundromat: boolean;
        rationale: string;
      };
      householdSize: {
        average: number;
        implication: string;
      };
    };
    competition: {
      estimatedCompetitors: number;
      competitionLevel: "low" | "moderate" | "high" | "saturated";
      nearbyLaundromats: Array<{
        type: string;
        distance: string;
        threat: "low" | "medium" | "high";
      }>;
      marketGap: string;
    };
    traffic: {
      pattern: "heavy" | "moderate" | "light";
      peakTimes: string[];
      footTraffic: "high" | "medium" | "low";
      vehicleAccess: "excellent" | "good" | "fair" | "poor";
    };
    opportunity: {
      score: number;
      grade: "A" | "B" | "C" | "Needs Work";
      strengths: string[];
      weaknesses: string[];
      verdict: string;
    };
    recommendations: Array<{
      category: string;
      action: string;
      priority: "high" | "medium" | "low";
      estimatedImpact: string;
    }>;
  };
  confidence: number;
  error?: string;
}

const GRADE_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  "A": { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.15)", label: "Excellent Opportunity" },
  "B": { color: "#A3E635", bgColor: "rgba(163, 230, 53, 0.15)", label: "Good Potential" },
  "C": { color: "#FBBF24", bgColor: "rgba(251, 191, 36, 0.15)", label: "Fair Opportunity" },
  "Needs Work": { color: "#C8A661", bgColor: "rgba(200, 166, 97, 0.15)", label: "Needs Improvement" }
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

function LevelBadge({ level, type }: { level: string; type: "density" | "traffic" | "competition" | "access" }) {
  const colorMap: Record<string, Record<string, string>> = {
    density: { high: "bg-green-100 text-green-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-red-100 text-red-700" },
    traffic: { heavy: "bg-green-100 text-green-700", moderate: "bg-yellow-100 text-yellow-700", light: "bg-red-100 text-red-700" },
    competition: { low: "bg-green-100 text-green-700", moderate: "bg-yellow-100 text-yellow-700", high: "bg-orange-100 text-orange-700", saturated: "bg-red-100 text-red-700" },
    access: { excellent: "bg-green-100 text-green-700", good: "bg-lime-100 text-lime-700", fair: "bg-yellow-100 text-yellow-700", poor: "bg-red-100 text-red-700" }
  };
  
  const colors = colorMap[type]?.[level.toLowerCase()] || "bg-muted text-muted-foreground";
  
  return (
    <Badge className={`${colors} capitalize`} data-testid={`badge-${type}-level`}>
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
    <Badge variant="outline" className={`${colors[priority] || colors.medium} capitalize`}>
      {priority}
    </Badge>
  );
}

export default function SmartLocationScout() {
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState(1);
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [progress, setProgress] = useState(0);

  const scoutMutation = useMutation({
    mutationFn: async (data: { address: string; radius: number; analysisType: string }) => {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 500);
      
      try {
        const response = await apiRequest("POST", "/api/ai/scout-location", data);
        clearInterval(interval);
        setProgress(100);
        return response.json() as Promise<LocationScoutResult>;
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
    scoutMutation.mutate({ address, radius, analysisType });
  };

  const result = scoutMutation.data;

  return (
    <>
      <SEO
        title="Smart Location Scout | AI-Powered Laundromat Site Analysis | WashBizHub"
        description="Use AI to analyze any location's potential for a laundromat business. Get instant insights on demographics, competition, traffic patterns, and opportunity scores."
        keywords={["laundromat location analysis", "site selection", "laundromat demographics", "competition analysis", "AI location scout"]}
        canonicalUrl="https://washbizhub.com/smart-location-scout"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Smart Location Scout", url: "/smart-location-scout" }
            ]}
          />
          
          <div className="mt-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <MapPin className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="heading-page-title">
                  Smart Location Scout
                </h1>
                <p className="text-muted-foreground">
                  AI-powered laundromat site analysis
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-3xl" data-testid="text-page-description">
              Enter any address to get an instant AI analysis of the location's potential for a laundromat business. 
              Our AI evaluates demographics, competition, traffic patterns, and more to give you a comprehensive opportunity score.
            </p>
          </div>

          <Card className="mb-8 bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-[#C8A661]" />
                Analyze Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address or Location
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
                  <Label className="text-sm font-medium">Analysis Type</Label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger data-testid="select-analysis-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                      <SelectItem value="quick">Quick Assessment</SelectItem>
                      <SelectItem value="competition">Competition Focus</SelectItem>
                      <SelectItem value="demographics">Demographics Focus</SelectItem>
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
                  min={0.5}
                  max={5}
                  step={0.5}
                  className="w-full"
                  data-testid="slider-radius"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5 mi</span>
                  <span>2.5 mi</span>
                  <span>5 mi</span>
                </div>
              </div>

              {scoutMutation.isPending && (
                <div className="space-y-2" data-testid="container-loading">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing location with AI...
                  </div>
                  <Progress value={progress} className="h-2" data-testid="progress-analysis" />
                </div>
              )}

              <Button 
                onClick={handleAnalyze}
                disabled={!address.trim() || scoutMutation.isPending}
                className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                data-testid="button-analyze"
              >
                {scoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Location
                  </>
                )}
              </Button>

              {scoutMutation.isError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2" data-testid="alert-error">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Failed to analyze location. Please try again.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {result?.success && result.data && (
            <PremiumResults
              featureName="smart-location-scout"
              analysisType="smart-location-scout"
              title="Location Analysis Results"
              data={result.data}
              summary={{
                headline: `${result.data.opportunity.grade} Grade Location`,
                metrics: [
                  { label: "Score", value: `${result.data.opportunity.score}/100` },
                  { label: "Confidence", value: `${Math.round(result.confidence * 100)}%` },
                  { label: "Foot Traffic", value: result.data.traffic.level },
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
                    <Target className="h-5 w-5 text-[#C8A661]" />
                    Opportunity Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <GradeBadge 
                        grade={result.data.opportunity.grade} 
                        score={result.data.opportunity.score} 
                      />
                      <p className="mt-4 text-muted-foreground" data-testid="text-verdict">
                        {result.data.opportunity.verdict}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>AI Confidence:</span>
                        <Progress value={result.confidence * 100} className="w-24 h-2" />
                        <span>{Math.round(result.confidence * 100)}%</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1" data-testid="list-strengths">
                          {result.data.opportunity.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Considerations
                        </h4>
                        <ul className="space-y-1" data-testid="list-weaknesses">
                          {result.data.opportunity.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-orange-600 mt-1">•</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#C8A661]" />
                    Location Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium" data-testid="text-address">
                          {result.data.address}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm" data-testid="text-neighborhood">
                        {result.data.locationProfile.neighborhood}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Area Type</div>
                        <Badge className="capitalize" data-testid="badge-area-type">
                          {result.data.locationProfile.areaType}
                        </Badge>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Accessibility</div>
                        <div className="text-lg font-bold text-[#C8A661]" data-testid="text-accessibility-score">
                          {result.data.locationProfile.accessibilityScore}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Walkability</div>
                        <LevelBadge level={result.data.locationProfile.walkabilityEstimate} type="density" />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Visibility</div>
                        <LevelBadge level={result.data.locationProfile.visibility} type="density" />
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
                      Demographics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Population Density</span>
                      <LevelBadge level={result.data.demographics.populationDensity.estimate} type="density" />
                    </div>
                    <p className="text-xs text-muted-foreground" data-testid="text-density-description">
                      {result.data.demographics.populationDensity.description}
                    </p>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Renter Ratio</span>
                      <span className="text-lg font-bold text-[#C8A661]" data-testid="text-renter-ratio">
                        {result.data.demographics.renterRatio.estimate}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground" data-testid="text-renter-assessment">
                      {result.data.demographics.renterRatio.assessment}
                    </p>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Income Bracket</span>
                      <Badge className={result.data.demographics.medianIncome.idealForLaundromat ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                        {result.data.demographics.medianIncome.bracket}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground" data-testid="text-income-rationale">
                      {result.data.demographics.medianIncome.rationale}
                    </p>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Household Size</span>
                      <span className="font-medium" data-testid="text-household-size">
                        {result.data.demographics.householdSize.average} people
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.data.demographics.householdSize.implication}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                      Competition Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Competition Level</span>
                      <LevelBadge level={result.data.competition.competitionLevel} type="competition" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-competitor-count">
                        {result.data.competition.estimatedCompetitors}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Estimated Competitors within {result.data.radius} mi
                      </div>
                    </div>
                    
                    {result.data.competition.nearbyLaundromats.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Nearby Competitors</h4>
                          {result.data.competition.nearbyLaundromats.map((l, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{l.type} - {l.distance}</span>
                              <Badge variant="outline" className={
                                l.threat === "high" ? "border-red-200 text-red-700" :
                                l.threat === "medium" ? "border-yellow-200 text-yellow-700" :
                                "border-green-200 text-green-700"
                              }>
                                {l.threat} threat
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-1">Market Gap</h4>
                      <p className="text-xs text-muted-foreground" data-testid="text-market-gap">
                        {result.data.competition.marketGap}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-[#C8A661]" />
                    Traffic Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-xs text-muted-foreground mb-2">Traffic Pattern</div>
                      <LevelBadge level={result.data.traffic.pattern} type="traffic" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-xs text-muted-foreground mb-2">Foot Traffic</div>
                      <LevelBadge level={result.data.traffic.footTraffic} type="density" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-xs text-muted-foreground mb-2">Vehicle Access</div>
                      <LevelBadge level={result.data.traffic.vehicleAccess} type="access" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-xs text-muted-foreground mb-2">Parking</div>
                      <Badge className="capitalize">{result.data.locationProfile.parkingAvailability}</Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Peak Times</h4>
                    <div className="flex flex-wrap gap-2" data-testid="list-peak-times">
                      {result.data.traffic.peakTimes.map((time, i) => (
                        <Badge key={i} variant="outline">{time}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-[#C8A661]" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="list-recommendations">
                    {result.data.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{rec.category}</Badge>
                            <PriorityBadge priority={rec.priority} />
                          </div>
                          <p className="font-medium text-sm">{rec.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expected Impact: {rec.estimatedImpact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </div>
            </PremiumResults>
          )}

          {!result && !scoutMutation.isPending && (
            <div className="text-center py-16 bg-muted/30 rounded-lg" data-testid="container-empty-state">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Enter an address to get started
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our AI will analyze the location's potential for a laundromat business, 
                including demographics, competition, and traffic patterns.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
