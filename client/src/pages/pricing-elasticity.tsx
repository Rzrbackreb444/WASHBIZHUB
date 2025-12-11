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
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { 
  TrendingUp, DollarSign, BarChart3, Target, 
  Loader2, Sparkles, AlertTriangle, CheckCircle, 
  ArrowUpRight, ArrowDownRight, Minus, Users, 
  Scale, Lightbulb, Building2, PieChart
} from "lucide-react";

interface PricingElasticityResult {
  success: boolean;
  data: {
    currentPricing: {
      washPrice: number;
      dryPrice: number;
      wdfPricePerLb: number;
    };
    elasticityAnalysis: {
      washElasticity: {
        coefficient: number;
        classification: "inelastic" | "unit-elastic" | "elastic";
        interpretation: string;
      };
      dryElasticity: {
        coefficient: number;
        classification: "inelastic" | "unit-elastic" | "elastic";
        interpretation: string;
      };
      wdfElasticity: {
        coefficient: number;
        classification: "inelastic" | "unit-elastic" | "elastic";
        interpretation: string;
      };
      overallSensitivity: "low" | "moderate" | "high";
      marketConditions: string;
    };
    revenueImpact: Array<{
      priceChange: number;
      washRevenue: number;
      dryRevenue: number;
      wdfRevenue: number;
      totalRevenue: number;
      changePercent: number;
    }>;
    optimalPricing: {
      maxRevenue: {
        washPrice: number;
        dryPrice: number;
        wdfPricePerLb: number;
        estimatedRevenue: number;
        revenueIncrease: number;
      };
      maxProfit: {
        washPrice: number;
        dryPrice: number;
        wdfPricePerLb: number;
        estimatedProfit: number;
        profitIncrease: number;
        assumptions: string;
      };
    };
    competitorAnalysis: {
      yourPosition: "below-market" | "at-market" | "above-market";
      pricingGap: {
        wash: number;
        dry: number;
        wdf: number;
      };
      marketAverage: {
        wash: number;
        dry: number;
        wdf: number;
      };
      recommendation: string;
    };
    customerSensitivity: {
      priceConscious: number;
      qualityFocused: number;
      convenienceDriven: number;
      loyalCustomers: number;
      segments: Array<{
        segment: string;
        sensitivity: "low" | "medium" | "high";
        recommendation: string;
      }>;
    };
    recommendations: Array<{
      action: string;
      priority: "high" | "medium" | "low";
      expectedImpact: string;
      implementation: string;
    }>;
  };
  confidence: number;
  error?: string;
}

function ElasticityBadge({ classification }: { classification: string }) {
  const config: Record<string, { color: string; bgColor: string; label: string }> = {
    "inelastic": { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.15)", label: "Inelastic (|E| < 1)" },
    "unit-elastic": { color: "#FBBF24", bgColor: "rgba(251, 191, 36, 0.15)", label: "Unit Elastic (|E| = 1)" },
    "elastic": { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)", label: "Elastic (|E| > 1)" },
  };
  const cfg = config[classification] || config["inelastic"];
  
  return (
    <Badge 
      style={{ backgroundColor: cfg.bgColor, color: cfg.color }} 
      className="capitalize font-medium"
      data-testid={`badge-elasticity-${classification}`}
    >
      {cfg.label}
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
    <Badge variant="outline" className={`${colors[priority] || colors.medium} capitalize`} data-testid={`badge-priority-${priority}`}>
      {priority}
    </Badge>
  );
}

function SensitivityBadge({ sensitivity }: { sensitivity: string }) {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700"
  };
  
  return (
    <Badge className={`${colors[sensitivity] || colors.medium} capitalize`} data-testid={`badge-sensitivity-${sensitivity}`}>
      {sensitivity} Sensitivity
    </Badge>
  );
}

function PositionBadge({ position }: { position: string }) {
  const config: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    "below-market": { icon: <ArrowDownRight className="w-3 h-3" />, color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.15)" },
    "at-market": { icon: <Minus className="w-3 h-3" />, color: "#FBBF24", bgColor: "rgba(251, 191, 36, 0.15)" },
    "above-market": { icon: <ArrowUpRight className="w-3 h-3" />, color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  };
  const cfg = config[position] || config["at-market"];
  
  return (
    <Badge 
      style={{ backgroundColor: cfg.bgColor, color: cfg.color }} 
      className="capitalize font-medium flex items-center gap-1"
      data-testid="badge-market-position"
    >
      {cfg.icon}
      {position.replace("-", " ")}
    </Badge>
  );
}

function RevenueImpactChart({ data }: { data: PricingElasticityResult['data']['revenueImpact'] }) {
  if (!data || data.length === 0) return null;

  const chartData = [
    {
      id: "Total Revenue",
      color: "#C8A661",
      data: data.map(d => ({
        x: `${d.priceChange > 0 ? '+' : ''}${d.priceChange}%`,
        y: d.totalRevenue,
      })),
    },
  ];

  return (
    <div className="h-[300px] w-full" data-testid="chart-revenue-impact">
      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 30, bottom: 50, left: 70 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Price Change',
          legendOffset: 36,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Monthly Revenue ($)',
          legendOffset: -55,
          legendPosition: 'middle',
          format: (v) => `$${(v as number).toLocaleString()}`,
        }}
        colors={["#C8A661"]}
        lineWidth={3}
        pointSize={10}
        pointColor="#0A1628"
        pointBorderWidth={2}
        pointBorderColor="#C8A661"
        enableArea={true}
        areaOpacity={0.15}
        useMesh={true}
        enableCrosshair={true}
        theme={{
          axis: { ticks: { text: { fill: "#6B7280" } }, legend: { text: { fill: "#6B7280" } } },
          grid: { line: { stroke: "#E5E7EB" } },
          crosshair: { line: { stroke: "#C8A661" } },
        }}
      />
    </div>
  );
}

function RevenueBreakdownChart({ data }: { data: PricingElasticityResult['data']['revenueImpact'] }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(d => ({
    priceChange: `${d.priceChange > 0 ? '+' : ''}${d.priceChange}%`,
    Wash: d.washRevenue,
    Dry: d.dryRevenue,
    WDF: d.wdfRevenue,
  }));

  return (
    <div className="h-[300px] w-full" data-testid="chart-revenue-breakdown">
      <ResponsiveBar
        data={chartData}
        keys={['Wash', 'Dry', 'WDF']}
        indexBy="priceChange"
        margin={{ top: 20, right: 100, bottom: 50, left: 70 }}
        padding={0.3}
        groupMode="stacked"
        colors={['#3B82F6', '#22C55E', '#C8A661']}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Price Change',
          legendOffset: 36,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Revenue ($)',
          legendOffset: -55,
          legendPosition: 'middle',
          format: (v) => `$${(v as number).toLocaleString()}`,
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            translateX: 90,
            translateY: 0,
            itemWidth: 80,
            itemHeight: 20,
            itemsSpacing: 2,
            symbolSize: 12,
          },
        ]}
        theme={{
          axis: { ticks: { text: { fill: "#6B7280" } }, legend: { text: { fill: "#6B7280" } } },
          grid: { line: { stroke: "#E5E7EB" } },
        }}
      />
    </div>
  );
}

export default function PricingElasticity() {
  const [washPrice, setWashPrice] = useState(3.50);
  const [dryPrice, setDryPrice] = useState(2.50);
  const [wdfPrice, setWdfPrice] = useState(1.75);
  const [monthlyWashCycles, setMonthlyWashCycles] = useState(2500);
  const [monthlyDryCycles, setMonthlyDryCycles] = useState(2000);
  const [monthlyWdfLbs, setMonthlyWdfLbs] = useState(1500);
  const [competitorWashPrice, setCompetitorWashPrice] = useState("");
  const [competitorDryPrice, setCompetitorDryPrice] = useState("");
  const [competitorWdfPrice, setCompetitorWdfPrice] = useState("");
  const [areaType, setAreaType] = useState("suburban");
  const [customerDemographics, setCustomerDemographics] = useState("mixed");
  const [progress, setProgress] = useState(0);

  const analyzeMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 85));
      }, 500);
      
      try {
        const response = await apiRequest("POST", "/api/ai/model-pricing-elasticity", data);
        clearInterval(interval);
        setProgress(100);
        return response.json() as Promise<PricingElasticityResult>;
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
    analyzeMutation.mutate({
      washPrice,
      dryPrice,
      wdfPricePerLb: wdfPrice,
      monthlyWashCycles,
      monthlyDryCycles,
      monthlyWdfLbs,
      competitorWashPrice: competitorWashPrice || undefined,
      competitorDryPrice: competitorDryPrice || undefined,
      competitorWdfPrice: competitorWdfPrice || undefined,
      areaType,
      customerDemographics,
    });
  };

  const result = analyzeMutation.data;
  const currentMonthlyRevenue = (washPrice * monthlyWashCycles) + (dryPrice * monthlyDryCycles) + (wdfPrice * monthlyWdfLbs);

  return (
    <>
      <SEO
        title="Pricing Elasticity Modeler | AI Price Optimization | WashBizHub"
        description="Use AI to analyze price elasticity for your laundromat. Model revenue impact of price changes, find optimal pricing for max profit, and understand customer price sensitivity."
        keywords={["laundromat pricing", "price elasticity", "pricing optimization", "laundromat revenue", "pricing strategy", "WDF pricing"]}
        canonicalUrl="https://washbizhub.com/pricing-elasticity"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Pricing Elasticity Modeler", url: "/pricing-elasticity" }
            ]}
          />
          
          <div className="mt-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Scale className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="heading-page-title">
                  Pricing Elasticity Modeler
                </h1>
                <p className="text-muted-foreground">
                  AI-powered price optimization analysis
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium AI Tool
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-3xl" data-testid="text-page-description">
              Analyze how price changes affect your revenue and customer demand. Our AI models 
              price elasticity for each service and recommends optimal pricing for maximum revenue or profit.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Monthly Revenue</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-current-revenue">
                      ${currentMonthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Monthly Volume</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-volume">
                      {(monthlyWashCycles + monthlyDryCycles).toLocaleString()} cycles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">WDF Revenue</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-wdf-revenue">
                      ${(wdfPrice * monthlyWdfLbs).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#C8A661]" />
                Pricing & Volume Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Current Pricing</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Wash Cycle Price</Label>
                      <span className="text-lg font-bold text-[#C8A661]" data-testid="text-wash-price">${washPrice.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[washPrice]}
                      onValueChange={(v) => setWashPrice(v[0])}
                      min={1.00}
                      max={8.00}
                      step={0.25}
                      className="w-full"
                      data-testid="slider-wash-price"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$1.00</span>
                      <span>$4.50</span>
                      <span>$8.00</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Dry Cycle Price</Label>
                      <span className="text-lg font-bold text-[#C8A661]" data-testid="text-dry-price">${dryPrice.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[dryPrice]}
                      onValueChange={(v) => setDryPrice(v[0])}
                      min={0.50}
                      max={5.00}
                      step={0.25}
                      className="w-full"
                      data-testid="slider-dry-price"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0.50</span>
                      <span>$2.75</span>
                      <span>$5.00</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">WDF per lb</Label>
                      <span className="text-lg font-bold text-[#C8A661]" data-testid="text-wdf-price">${wdfPrice.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[wdfPrice]}
                      onValueChange={(v) => setWdfPrice(v[0])}
                      min={0.75}
                      max={3.50}
                      step={0.05}
                      className="w-full"
                      data-testid="slider-wdf-price"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0.75</span>
                      <span>$2.00</span>
                      <span>$3.50</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Volume</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="washCycles" className="text-sm font-medium">Wash Cycles / Month</Label>
                    <Input
                      id="washCycles"
                      type="number"
                      value={monthlyWashCycles}
                      onChange={(e) => setMonthlyWashCycles(parseInt(e.target.value) || 0)}
                      className="font-mono"
                      data-testid="input-wash-cycles"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dryCycles" className="text-sm font-medium">Dry Cycles / Month</Label>
                    <Input
                      id="dryCycles"
                      type="number"
                      value={monthlyDryCycles}
                      onChange={(e) => setMonthlyDryCycles(parseInt(e.target.value) || 0)}
                      className="font-mono"
                      data-testid="input-dry-cycles"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wdfLbs" className="text-sm font-medium">WDF Pounds / Month</Label>
                    <Input
                      id="wdfLbs"
                      type="number"
                      value={monthlyWdfLbs}
                      onChange={(e) => setMonthlyWdfLbs(parseInt(e.target.value) || 0)}
                      className="font-mono"
                      data-testid="input-wdf-lbs"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Competitor Pricing (Optional)</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="compWash" className="text-sm font-medium">Competitor Wash</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="compWash"
                        type="number"
                        step="0.25"
                        placeholder="3.50"
                        value={competitorWashPrice}
                        onChange={(e) => setCompetitorWashPrice(e.target.value)}
                        className="pl-7"
                        data-testid="input-competitor-wash"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compDry" className="text-sm font-medium">Competitor Dry</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="compDry"
                        type="number"
                        step="0.25"
                        placeholder="2.50"
                        value={competitorDryPrice}
                        onChange={(e) => setCompetitorDryPrice(e.target.value)}
                        className="pl-7"
                        data-testid="input-competitor-dry"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compWdf" className="text-sm font-medium">Competitor WDF/lb</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="compWdf"
                        type="number"
                        step="0.05"
                        placeholder="1.75"
                        value={competitorWdfPrice}
                        onChange={(e) => setCompetitorWdfPrice(e.target.value)}
                        className="pl-7"
                        data-testid="input-competitor-wdf"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Area Type</Label>
                  <Select value={areaType} onValueChange={setAreaType}>
                    <SelectTrigger data-testid="select-area-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urban">Urban / Downtown</SelectItem>
                      <SelectItem value="suburban">Suburban</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                      <SelectItem value="college">College Town</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Customer Demographics</Label>
                  <Select value={customerDemographics} onValueChange={setCustomerDemographics}>
                    <SelectTrigger data-testid="select-demographics">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget-Conscious</SelectItem>
                      <SelectItem value="mixed">Mixed Demographics</SelectItem>
                      <SelectItem value="professional">Young Professionals</SelectItem>
                      <SelectItem value="family">Families</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {analyzeMutation.isPending && (
                <div className="space-y-2" data-testid="container-loading">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing pricing elasticity with AI...
                  </div>
                  <Progress value={progress} className="h-2" data-testid="progress-analysis" />
                </div>
              )}

              <Button 
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                data-testid="button-analyze"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Elasticity...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Elasticity
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
                  <span>Failed to analyze pricing. Please try again.</span>
                </div>
              </CardContent>
            </Card>
          )}

          {result?.success && result.data && (
            <PremiumResults
              featureName="pricing-elasticity"
              analysisType="pricing-elasticity"
              title="Pricing Elasticity Analysis"
              data={result.data}
              summary={{
                headline: `${result.data.elasticityScore?.rating || "Analysis"} Elasticity`,
                metrics: [
                  { label: "Elasticity Score", value: result.data.elasticityScore?.score?.toString() || "N/A" },
                  { label: "Optimal Price Point", value: result.data.optimalPricing?.recommendedBase || "N/A" },
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
                      <Scale className="h-5 w-5 text-[#C8A661]" />
                      Elasticity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Wash Service</span>
                        <ElasticityBadge classification={result.data.elasticityAnalysis.washElasticity.classification} />
                      </div>
                      <div className="text-2xl font-bold text-foreground" data-testid="text-wash-coefficient">
                        E = {result.data.elasticityAnalysis.washElasticity.coefficient.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {result.data.elasticityAnalysis.washElasticity.interpretation}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Dry Service</span>
                        <ElasticityBadge classification={result.data.elasticityAnalysis.dryElasticity.classification} />
                      </div>
                      <div className="text-2xl font-bold text-foreground" data-testid="text-dry-coefficient">
                        E = {result.data.elasticityAnalysis.dryElasticity.coefficient.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {result.data.elasticityAnalysis.dryElasticity.interpretation}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">WDF Service</span>
                        <ElasticityBadge classification={result.data.elasticityAnalysis.wdfElasticity.classification} />
                      </div>
                      <div className="text-2xl font-bold text-foreground" data-testid="text-wdf-coefficient">
                        E = {result.data.elasticityAnalysis.wdfElasticity.coefficient.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {result.data.elasticityAnalysis.wdfElasticity.interpretation}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700 dark:text-blue-400">Market Conditions</span>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid="text-market-conditions">
                      {result.data.elasticityAnalysis.marketConditions}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {result.data.revenueImpact && result.data.revenueImpact.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                        Revenue Impact Curve
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RevenueImpactChart data={result.data.revenueImpact} />
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-[#C8A661]" />
                        Revenue Breakdown by Service
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RevenueBreakdownChart data={result.data.revenueImpact} />
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-green-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Optimal Pricing - Max Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Wash</div>
                        <div className="text-xl font-bold text-green-600" data-testid="text-optimal-wash">
                          ${result.data.optimalPricing.maxRevenue.washPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Dry</div>
                        <div className="text-xl font-bold text-green-600" data-testid="text-optimal-dry">
                          ${result.data.optimalPricing.maxRevenue.dryPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">WDF/lb</div>
                        <div className="text-xl font-bold text-green-600" data-testid="text-optimal-wdf">
                          ${result.data.optimalPricing.maxRevenue.wdfPricePerLb.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Estimated Revenue</div>
                        <div className="text-xl font-bold text-green-600" data-testid="text-optimal-revenue">
                          ${result.data.optimalPricing.maxRevenue.estimatedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +{result.data.optimalPricing.maxRevenue.revenueIncrease.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-purple-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-500" />
                      Optimal Pricing - Max Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Wash</div>
                        <div className="text-xl font-bold text-purple-600" data-testid="text-profit-wash">
                          ${result.data.optimalPricing.maxProfit.washPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Dry</div>
                        <div className="text-xl font-bold text-purple-600" data-testid="text-profit-dry">
                          ${result.data.optimalPricing.maxProfit.dryPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">WDF/lb</div>
                        <div className="text-xl font-bold text-purple-600" data-testid="text-profit-wdf">
                          ${result.data.optimalPricing.maxProfit.wdfPricePerLb.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Estimated Profit</div>
                        <div className="text-xl font-bold text-purple-600" data-testid="text-optimal-profit">
                          ${result.data.optimalPricing.maxProfit.estimatedProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +{result.data.optimalPricing.maxProfit.profitIncrease.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {result.data.optimalPricing.maxProfit.assumptions}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {result.data.revenueImpact && result.data.revenueImpact.length > 0 && (
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                      Scenario Analysis Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid="table-scenarios">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Price Change</th>
                            <th className="text-right py-2 px-3 font-medium text-muted-foreground">Wash Revenue</th>
                            <th className="text-right py-2 px-3 font-medium text-muted-foreground">Dry Revenue</th>
                            <th className="text-right py-2 px-3 font-medium text-muted-foreground">WDF Revenue</th>
                            <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total</th>
                            <th className="text-right py-2 px-3 font-medium text-muted-foreground">Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.data.revenueImpact.map((row, idx) => (
                            <tr 
                              key={idx} 
                              className={`border-b ${row.priceChange === 0 ? 'bg-[#C8A661]/10 font-medium' : ''}`}
                              data-testid={`row-scenario-${idx}`}
                            >
                              <td className="py-2 px-3">
                                {row.priceChange > 0 ? '+' : ''}{row.priceChange}%
                                {row.priceChange === 0 && <Badge className="ml-2 text-xs">Current</Badge>}
                              </td>
                              <td className="text-right py-2 px-3">${row.washRevenue.toLocaleString()}</td>
                              <td className="text-right py-2 px-3">${row.dryRevenue.toLocaleString()}</td>
                              <td className="text-right py-2 px-3">${row.wdfRevenue.toLocaleString()}</td>
                              <td className="text-right py-2 px-3 font-medium">${row.totalRevenue.toLocaleString()}</td>
                              <td className={`text-right py-2 px-3 ${row.changePercent > 0 ? 'text-green-600' : row.changePercent < 0 ? 'text-red-600' : ''}`}>
                                {row.changePercent > 0 ? '+' : ''}{row.changePercent.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#C8A661]" />
                      Competitor Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-muted-foreground">Your Position:</span>
                      <PositionBadge position={result.data.competitorAnalysis.yourPosition} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Wash Gap</div>
                        <div className={`text-lg font-bold ${result.data.competitorAnalysis.pricingGap.wash > 0 ? 'text-green-600' : result.data.competitorAnalysis.pricingGap.wash < 0 ? 'text-red-600' : ''}`}>
                          {result.data.competitorAnalysis.pricingGap.wash > 0 ? '+' : ''}${result.data.competitorAnalysis.pricingGap.wash.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Dry Gap</div>
                        <div className={`text-lg font-bold ${result.data.competitorAnalysis.pricingGap.dry > 0 ? 'text-green-600' : result.data.competitorAnalysis.pricingGap.dry < 0 ? 'text-red-600' : ''}`}>
                          {result.data.competitorAnalysis.pricingGap.dry > 0 ? '+' : ''}${result.data.competitorAnalysis.pricingGap.dry.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">WDF Gap</div>
                        <div className={`text-lg font-bold ${result.data.competitorAnalysis.pricingGap.wdf > 0 ? 'text-green-600' : result.data.competitorAnalysis.pricingGap.wdf < 0 ? 'text-red-600' : ''}`}>
                          {result.data.competitorAnalysis.pricingGap.wdf > 0 ? '+' : ''}${result.data.competitorAnalysis.pricingGap.wdf.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Market Averages: Wash ${result.data.competitorAnalysis.marketAverage.wash.toFixed(2)} | 
                      Dry ${result.data.competitorAnalysis.marketAverage.dry.toFixed(2)} | 
                      WDF ${result.data.competitorAnalysis.marketAverage.wdf.toFixed(2)}/lb
                    </div>
                    <p className="text-sm text-foreground" data-testid="text-competitor-recommendation">
                      {result.data.competitorAnalysis.recommendation}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#C8A661]" />
                      Customer Sensitivity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Price-Conscious</div>
                        <div className="text-xl font-bold text-foreground">{result.data.customerSensitivity.priceConscious}%</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Quality-Focused</div>
                        <div className="text-xl font-bold text-foreground">{result.data.customerSensitivity.qualityFocused}%</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Convenience-Driven</div>
                        <div className="text-xl font-bold text-foreground">{result.data.customerSensitivity.convenienceDriven}%</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Loyal Customers</div>
                        <div className="text-xl font-bold text-foreground">{result.data.customerSensitivity.loyalCustomers}%</div>
                      </div>
                    </div>
                    {result.data.customerSensitivity.segments.length > 0 && (
                      <div className="space-y-2">
                        {result.data.customerSensitivity.segments.map((seg, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded" data-testid={`segment-${idx}`}>
                            <span className="text-sm font-medium">{seg.segment}</span>
                            <SensitivityBadge sensitivity={seg.sensitivity} />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {result.data.recommendations && result.data.recommendations.length > 0 && (
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-[#C8A661]" />
                      Pricing Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.data.recommendations.map((rec, idx) => (
                        <div 
                          key={idx} 
                          className="border rounded-lg p-4"
                          data-testid={`card-recommendation-${idx}`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-medium text-foreground">{rec.action}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  <strong>Expected Impact:</strong> {rec.expectedImpact}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <strong>Implementation:</strong> {rec.implementation}
                                </div>
                              </div>
                            </div>
                            <PriorityBadge priority={rec.priority} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-muted/30 border">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Analysis confidence: {(result.confidence * 100).toFixed(0)}%. 
                      Elasticity estimates are based on AI modeling of typical laundromat market conditions. 
                      Actual results may vary based on local factors.
                    </span>
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
