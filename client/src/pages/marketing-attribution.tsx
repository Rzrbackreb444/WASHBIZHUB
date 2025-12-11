import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { ResponsiveBar } from "@nivo/bar";
import { 
  Target, Plus, Trash2, TrendingUp, TrendingDown, DollarSign,
  Users, Calendar, Loader2, Sparkles, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Lightbulb, AlertTriangle, 
  CheckCircle, Scissors, Scale, Megaphone
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  channel: string;
  spend: number;
  startDate: string;
  endDate: string;
  revenue: number;
  newCustomers: number;
}

interface AttributionResult {
  success: boolean;
  data: {
    summary: {
      totalSpend: number;
      totalRevenue: number;
      totalNewCustomers: number;
      overallROI: number;
      overallCPA: number;
      bestPerformingChannel: string;
      worstPerformingChannel: string;
    };
    attributionModels: {
      firstTouch: Array<{ campaignId: string; campaignName: string; attributedRevenue: number; attributedCustomers: number; attributionPercent: number }>;
      lastTouch: Array<{ campaignId: string; campaignName: string; attributedRevenue: number; attributedCustomers: number; attributionPercent: number }>;
      linear: Array<{ campaignId: string; campaignName: string; attributedRevenue: number; attributedCustomers: number; attributionPercent: number }>;
      timeDecay: Array<{ campaignId: string; campaignName: string; attributedRevenue: number; attributedCustomers: number; attributionPercent: number }>;
    };
    channelPerformance: Array<{
      channel: string;
      totalSpend: number;
      totalRevenue: number;
      roi: number;
      cpa: number;
      newCustomers: number;
      efficiency: string;
    }>;
    campaignPerformance: Array<{
      id: string;
      name: string;
      channel: string;
      spend: number;
      revenue: number;
      roi: number;
      cpa: number;
      newCustomers: number;
      ltv: number;
      status: string;
      recommendation: string;
    }>;
    budgetRecommendations: {
      currentAllocation: Array<{ channel: string; percent: number; amount: number }>;
      recommendedAllocation: Array<{ channel: string; percent: number; amount: number; change: string }>;
      projectedImpact: { revenueIncrease: number; roiImprovement: number; cpaReduction: number };
    };
    cutScaleRecommendations: {
      scale: Array<{ campaign: string; reason: string; suggestedIncrease: string }>;
      maintain: Array<{ campaign: string; reason: string }>;
      optimize: Array<{ campaign: string; reason: string; suggestion: string }>;
      cut: Array<{ campaign: string; reason: string; potentialSavings: number }>;
    };
    insights: Array<{ type: string; title: string; description: string; actionable: string }>;
  };
  confidence: number;
  error?: string;
}

const CHANNEL_OPTIONS = [
  { value: "social", label: "Social Media" },
  { value: "email", label: "Email Marketing" },
  { value: "flyers", label: "Flyers / Print" },
  { value: "referral", label: "Referral Program" },
  { value: "google_ads", label: "Google Ads" },
  { value: "direct_mail", label: "Direct Mail" },
  { value: "local_seo", label: "Local SEO" },
  { value: "partnerships", label: "Partnerships" },
  { value: "other", label: "Other" },
];

const ATTRIBUTION_MODELS = [
  { value: "first-touch", label: "First Touch", description: "Credit first campaign interaction" },
  { value: "last-touch", label: "Last Touch", description: "Credit final campaign before conversion" },
  { value: "linear", label: "Linear", description: "Equal credit across all campaigns" },
  { value: "time-decay", label: "Time Decay", description: "More credit to recent campaigns" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: typeof TrendingUp }> = {
    scale: { color: "bg-green-100 text-green-700", icon: TrendingUp },
    maintain: { color: "bg-blue-100 text-blue-700", icon: Scale },
    optimize: { color: "bg-yellow-100 text-yellow-700", icon: Lightbulb },
    cut: { color: "bg-red-100 text-red-700", icon: Scissors },
  };
  const { color, icon: Icon } = config[status] || config.maintain;
  
  return (
    <Badge className={`${color} capitalize`} data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
}

function EfficiencyBadge({ efficiency }: { efficiency: string }) {
  const colors: Record<string, string> = {
    excellent: "bg-green-100 text-green-700",
    good: "bg-blue-100 text-blue-700",
    average: "bg-yellow-100 text-yellow-700",
    poor: "bg-red-100 text-red-700",
  };
  
  return (
    <Badge className={`${colors[efficiency] || colors.average} capitalize`} data-testid={`badge-efficiency-${efficiency}`}>
      {efficiency}
    </Badge>
  );
}

function InsightCard({ insight }: { insight: { type: string; title: string; description: string; actionable: string } }) {
  const config: Record<string, { color: string; icon: typeof CheckCircle }> = {
    success: { color: "border-green-500 bg-green-50", icon: CheckCircle },
    warning: { color: "border-yellow-500 bg-yellow-50", icon: AlertTriangle },
    opportunity: { color: "border-blue-500 bg-blue-50", icon: Lightbulb },
    insight: { color: "border-purple-500 bg-purple-50", icon: Sparkles },
  };
  const { color, icon: Icon } = config[insight.type] || config.insight;
  
  return (
    <div className={`border-l-4 ${color} p-4 rounded-r-lg`} data-testid={`card-insight-${insight.type}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground">{insight.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
          <p className="text-sm font-medium text-foreground mt-2">{insight.actionable}</p>
        </div>
      </div>
    </div>
  );
}

function ROIChart({ data }: { data: Array<{ channel: string; roi: number; spend: number }> }) {
  const chartData = data.map(d => ({
    channel: d.channel.charAt(0).toUpperCase() + d.channel.slice(1).replace("_", " "),
    ROI: d.roi,
  }));

  return (
    <div className="h-[300px]" data-testid="chart-roi-by-channel">
      <ResponsiveBar
        data={chartData}
        keys={["ROI"]}
        indexBy="channel"
        margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        colors={({ data }) => (data.ROI as number) >= 0 ? "#22C55E" : "#EF4444"}
        borderRadius={4}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "Channel",
          legendPosition: "middle",
          legendOffset: 50,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          legend: "ROI %",
          legendPosition: "middle",
          legendOffset: -50,
          format: (v) => `${v}%`,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#ffffff"
        label={(d) => `${(d.value as number).toFixed(0)}%`}
        theme={{
          text: { fill: "#6B7280" },
          axis: { ticks: { text: { fill: "#6B7280" } } },
          grid: { line: { stroke: "#E5E7EB" } },
        }}
      />
    </div>
  );
}

function CPAChart({ data }: { data: Array<{ channel: string; cpa: number }> }) {
  const chartData = data.map(d => ({
    channel: d.channel.charAt(0).toUpperCase() + d.channel.slice(1).replace("_", " "),
    CPA: d.cpa,
  }));

  return (
    <div className="h-[300px]" data-testid="chart-cpa-comparison">
      <ResponsiveBar
        data={chartData}
        keys={["CPA"]}
        indexBy="channel"
        margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        colors="#C8A661"
        borderRadius={4}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "Channel",
          legendPosition: "middle",
          legendOffset: 50,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          legend: "Cost Per Acquisition ($)",
          legendPosition: "middle",
          legendOffset: -50,
          format: (v) => `$${v}`,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#0A1628"
        label={(d) => `$${(d.value as number).toFixed(0)}`}
        theme={{
          text: { fill: "#6B7280" },
          axis: { ticks: { text: { fill: "#6B7280" } } },
          grid: { line: { stroke: "#E5E7EB" } },
        }}
      />
    </div>
  );
}

export default function MarketingAttribution() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Summer Social Campaign",
      channel: "social",
      spend: 500,
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      revenue: 2500,
      newCustomers: 25,
    },
  ]);
  const [attributionModel, setAttributionModel] = useState("linear");
  const [progress, setProgress] = useState(0);

  const addCampaign = () => {
    const newId = (campaigns.length + 1).toString();
    setCampaigns([...campaigns, {
      id: newId,
      name: "",
      channel: "social",
      spend: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      revenue: 0,
      newCustomers: 0,
    }]);
  };

  const removeCampaign = (id: string) => {
    if (campaigns.length > 1) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const updateCampaign = (id: string, field: keyof Campaign, value: string | number) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const analyzeMutation = useMutation({
    mutationFn: async (data: { campaigns: Campaign[]; attributionModel: string }) => {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 85));
      }, 500);
      
      try {
        const response = await apiRequest("POST", "/api/ai/attribute-campaigns", data);
        clearInterval(interval);
        setProgress(100);
        return response.json() as Promise<AttributionResult>;
      } catch (error) {
        clearInterval(interval);
        setProgress(0);
        throw error;
      }
    },
    onSettled: () => {
      setTimeout(() => setProgress(0), 1000);
    },
  });

  const handleAnalyze = () => {
    const validCampaigns = campaigns.filter(c => c.name.trim() && c.spend > 0);
    if (validCampaigns.length === 0) return;
    analyzeMutation.mutate({ campaigns: validCampaigns, attributionModel });
  };

  const result = analyzeMutation.data;
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalCustomers = campaigns.reduce((sum, c) => sum + c.newCustomers, 0);

  return (
    <>
      <SEO
        title="Marketing Campaign Attribution Engine | AI-Powered Marketing ROI Analysis | WashBizHub"
        description="Analyze your laundromat marketing campaigns with AI. Get attribution modeling, ROI by channel, cost per acquisition analysis, and budget allocation recommendations."
        keywords={["marketing attribution", "campaign ROI", "laundromat marketing", "cost per acquisition", "marketing analytics", "budget optimization"]}
        canonicalUrl="https://washbizhub.com/marketing-attribution"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Marketing Attribution", url: "/marketing-attribution" },
            ]}
          />
          
          <div className="mt-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Target className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="heading-page-title">
                  Marketing Campaign Attribution Engine
                </h1>
                <p className="text-muted-foreground">
                  AI-powered marketing ROI analysis and budget optimization
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661] text-[#0A1628]" data-testid="badge-premium">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium AI Tool
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-3xl" data-testid="text-page-description">
              Enter your marketing campaigns to get AI-powered attribution analysis. Understand which channels 
              drive the most revenue, optimize your budget allocation, and identify underperforming campaigns to cut.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spend</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-spend">
                      {formatCurrency(totalSpend)}
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
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-revenue">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">New Customers</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-customers">
                      {totalCustomers}
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
                    <p className="text-sm text-muted-foreground">Simple ROI</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-simple-roi">
                      {totalSpend > 0 ? formatPercent(((totalRevenue - totalSpend) / totalSpend) * 100) : "N/A"}
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
                <Megaphone className="h-5 w-5 text-[#C8A661]" />
                Campaign Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {campaigns.map((campaign, index) => (
                  <div key={campaign.id} className="border rounded-lg p-4 space-y-4" data-testid={`card-campaign-${index}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">Campaign {index + 1}</h4>
                      {campaigns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCampaign(campaign.id)}
                          className="text-red-500 hover:text-red-600"
                          data-testid={`button-remove-campaign-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Campaign Name</Label>
                        <Input
                          placeholder="e.g., Summer Promo"
                          value={campaign.name}
                          onChange={(e) => updateCampaign(campaign.id, "name", e.target.value)}
                          data-testid={`input-campaign-name-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Channel</Label>
                        <Select
                          value={campaign.channel}
                          onValueChange={(v) => updateCampaign(campaign.id, "channel", v)}
                        >
                          <SelectTrigger data-testid={`select-channel-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CHANNEL_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Spend ($)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={campaign.spend}
                          onChange={(e) => updateCampaign(campaign.id, "spend", parseFloat(e.target.value) || 0)}
                          data-testid={`input-spend-${index}`}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={campaign.startDate}
                          onChange={(e) => updateCampaign(campaign.id, "startDate", e.target.value)}
                          data-testid={`input-start-date-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={campaign.endDate}
                          onChange={(e) => updateCampaign(campaign.id, "endDate", e.target.value)}
                          data-testid={`input-end-date-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Revenue ($)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={campaign.revenue}
                          onChange={(e) => updateCampaign(campaign.id, "revenue", parseFloat(e.target.value) || 0)}
                          data-testid={`input-revenue-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>New Customers</Label>
                        <Input
                          type="number"
                          min={0}
                          value={campaign.newCustomers}
                          onChange={(e) => updateCampaign(campaign.id, "newCustomers", parseInt(e.target.value) || 0)}
                          data-testid={`input-customers-${index}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={addCampaign}
                className="w-full"
                data-testid="button-add-campaign"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Campaign
              </Button>

              <Separator />

              <div className="space-y-3">
                <Label>Attribution Model</Label>
                <div className="grid md:grid-cols-4 gap-3">
                  {ATTRIBUTION_MODELS.map(model => (
                    <button
                      key={model.value}
                      onClick={() => setAttributionModel(model.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        attributionModel === model.value
                          ? "border-[#C8A661] bg-[#C8A661]/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      data-testid={`button-model-${model.value}`}
                    >
                      <div className="font-medium text-foreground">{model.label}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {analyzeMutation.isPending && (
                <div className="space-y-2" data-testid="container-loading">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing campaigns with AI...
                  </div>
                  <Progress value={progress} className="h-2" data-testid="progress-analysis" />
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={campaigns.filter(c => c.name.trim() && c.spend > 0).length === 0 || analyzeMutation.isPending}
                className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                data-testid="button-analyze"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Attribution...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Attribution
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
                  <span>Failed to analyze campaigns. Please try again.</span>
                </div>
              </CardContent>
            </Card>
          )}

          {result?.success && result.data && (
            <div className="space-y-6" data-testid="container-results">
              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-[#C8A661]" />
                    Attribution Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-[#C8A661]" data-testid="text-overall-roi">
                        {formatPercent(result.data.summary.overallROI)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Overall ROI</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-foreground" data-testid="text-overall-cpa">
                        {formatCurrency(result.data.summary.overallCPA)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Avg CPA</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-green-600" data-testid="text-best-channel">
                        {result.data.summary.bestPerformingChannel}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Best Channel</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-red-600" data-testid="text-worst-channel">
                        {result.data.summary.worstPerformingChannel}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Needs Attention</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                      ROI by Channel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.data.channelPerformance.length > 0 ? (
                      <ROIChart data={result.data.channelPerformance} />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No channel data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#C8A661]" />
                      Cost Per Acquisition by Channel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.data.channelPerformance.length > 0 ? (
                      <CPAChart data={result.data.channelPerformance} />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No CPA data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-[#C8A661]" />
                    Campaign Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table data-testid="table-campaign-performance">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campaign</TableHead>
                          <TableHead>Channel</TableHead>
                          <TableHead className="text-right">Spend</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">ROI</TableHead>
                          <TableHead className="text-right">CPA</TableHead>
                          <TableHead className="text-right">Customers</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.data.campaignPerformance.map((campaign, idx) => (
                          <TableRow key={campaign.id} data-testid={`row-campaign-${idx}`}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell className="capitalize">{campaign.channel.replace("_", " ")}</TableCell>
                            <TableCell className="text-right">{formatCurrency(campaign.spend)}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(campaign.revenue)}</TableCell>
                            <TableCell className={`text-right ${campaign.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {formatPercent(campaign.roi)}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(campaign.cpa)}</TableCell>
                            <TableCell className="text-right">{campaign.newCustomers}</TableCell>
                            <TableCell>
                              <StatusBadge status={campaign.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-[#C8A661]" />
                      Budget Allocation Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Projected Impact</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-600" data-testid="text-revenue-increase">
                            +{formatCurrency(result.data.budgetRecommendations.projectedImpact.revenueIncrease)}
                          </div>
                          <div className="text-xs text-muted-foreground">Revenue Increase</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-blue-600" data-testid="text-roi-improvement">
                            +{result.data.budgetRecommendations.projectedImpact.roiImprovement.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">ROI Improvement</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-purple-600" data-testid="text-cpa-reduction">
                            -{result.data.budgetRecommendations.projectedImpact.cpaReduction.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">CPA Reduction</div>
                        </div>
                      </div>
                    </div>
                    
                    {result.data.budgetRecommendations.recommendedAllocation.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Recommended Allocation</h4>
                        {result.data.budgetRecommendations.recommendedAllocation.map((alloc, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b" data-testid={`row-allocation-${idx}`}>
                            <span className="capitalize">{alloc.channel.replace("_", " ")}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{alloc.percent}%</span>
                              <Badge className={alloc.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                {alloc.change}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-[#C8A661]" />
                      Cut / Scale Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.data.cutScaleRecommendations.scale.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-green-600 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Scale Up
                        </h4>
                        {result.data.cutScaleRecommendations.scale.map((item, idx) => (
                          <div key={idx} className="bg-green-50 rounded-lg p-3" data-testid={`card-scale-${idx}`}>
                            <div className="font-medium text-foreground">{item.campaign}</div>
                            <div className="text-sm text-muted-foreground">{item.reason}</div>
                            <div className="text-sm font-medium text-green-600 mt-1">Increase: {item.suggestedIncrease}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.data.cutScaleRecommendations.optimize.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-yellow-600 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          Optimize
                        </h4>
                        {result.data.cutScaleRecommendations.optimize.map((item, idx) => (
                          <div key={idx} className="bg-yellow-50 rounded-lg p-3" data-testid={`card-optimize-${idx}`}>
                            <div className="font-medium text-foreground">{item.campaign}</div>
                            <div className="text-sm text-muted-foreground">{item.reason}</div>
                            <div className="text-sm font-medium text-yellow-600 mt-1">{item.suggestion}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.data.cutScaleRecommendations.cut.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-red-600 flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          Consider Cutting
                        </h4>
                        {result.data.cutScaleRecommendations.cut.map((item, idx) => (
                          <div key={idx} className="bg-red-50 rounded-lg p-3" data-testid={`card-cut-${idx}`}>
                            <div className="font-medium text-foreground">{item.campaign}</div>
                            <div className="text-sm text-muted-foreground">{item.reason}</div>
                            <div className="text-sm font-medium text-red-600 mt-1">Potential Savings: {formatCurrency(item.potentialSavings)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {result.data.insights.length > 0 && (
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-[#C8A661]" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4" data-testid="container-insights">
                      {result.data.insights.map((insight, idx) => (
                        <InsightCard key={idx} insight={insight} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}