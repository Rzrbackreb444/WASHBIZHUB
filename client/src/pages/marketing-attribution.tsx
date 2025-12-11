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
  CheckCircle, Scale
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  channel: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface AttributionResult {
  success: boolean;
  data: {
    dateRange: { start: string; end: string };
    goals: { targetCPA: number; targetROAS: number };
    totalSpend: number;
    totalConversions: number;
    overallROI: number;
    overallCPA: number;
    attributionModels: {
      firstTouch: Array<{ channel: string; attributedConversions: number; attributedRevenue: number; percentageShare: number }>;
      lastTouch: Array<{ channel: string; attributedConversions: number; attributedRevenue: number; percentageShare: number }>;
      linear: Array<{ channel: string; attributedConversions: number; attributedRevenue: number; percentageShare: number }>;
      timeDecay: Array<{ channel: string; attributedConversions: number; attributedRevenue: number; percentageShare: number }>;
    };
    channelPerformance: Array<{
      channel: string;
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      conversionRate: number;
      cpc: number;
      cpa: number;
      roi: number;
      roas: number;
      effectivenessScore: number;
      rank: number;
    }>;
    campaignROI: Array<{
      campaign: string;
      channel: string;
      spend: number;
      revenue: number;
      roi: number;
      roas: number;
      status: "exceeds-goal" | "meets-goal" | "below-goal" | "underperforming";
    }>;
    budgetReallocation: {
      currentAllocation: Array<{ channel: string; amount: number; percentage: number }>;
      recommendedAllocation: Array<{ channel: string; amount: number; percentage: number; change: number }>;
      rationale: string;
      expectedImpact: { additionalConversions: number; improvedROI: number; reducedCPA: number };
    };
    predictedImpact: Array<{
      scenario: string;
      budgetChange: number;
      predictedConversions: number;
      predictedROI: number;
      predictedCPA: number;
      confidence: number;
    }>;
    recommendations: Array<{ priority: "high" | "medium" | "low"; category: string; action: string; expectedImpact: string }>;
    insights: string[];
  };
  confidence: number;
  error?: string;
}

const CHANNEL_OPTIONS = [
  "Google Ads",
  "Facebook Ads",
  "Instagram Ads",
  "LinkedIn Ads",
  "Email Marketing",
  "Direct Mail",
  "Local SEO",
  "Content Marketing",
  "Referral Program",
  "Display Ads",
  "YouTube Ads",
  "TikTok Ads",
  "Other"
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: typeof TrendingUp }> = {
    "exceeds-goal": { color: "bg-green-100 text-green-700", icon: TrendingUp },
    "meets-goal": { color: "bg-blue-100 text-blue-700", icon: CheckCircle },
    "below-goal": { color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
    "underperforming": { color: "bg-red-100 text-red-700", icon: TrendingDown },
  };
  const { color, icon: Icon } = config[status] || config["below-goal"];
  
  return (
    <Badge className={`${color} capitalize gap-1`} data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3" />
      {status.replace("-", " ")}
    </Badge>
  );
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function MarketingAttribution() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: generateId(),
      name: "",
      channel: "Google Ads",
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    },
  ]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });
  const [goals, setGoals] = useState({ targetCPA: 50, targetROAS: 3 });
  const [progress, setProgress] = useState(0);

  const addCampaign = () => {
    setCampaigns([...campaigns, {
      id: generateId(),
      name: "",
      channel: "Google Ads",
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
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
    mutationFn: async (data: { campaigns: Campaign[]; dateRange: { start: string; end: string }; goals: { targetCPA: number; targetROAS: number } }) => {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 85));
      }, 500);
      
      try {
        const response = await apiRequest("POST", "/api/ai/attribute-marketing", data);
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
    analyzeMutation.mutate({ campaigns: validCampaigns, dateRange, goals });
  };

  const result = analyzeMutation.data;
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const validCampaignCount = campaigns.filter(c => c.name.trim() && c.spend > 0).length;

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
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Conversions</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-conversions">
                      {totalConversions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-clicks">
                      {totalClicks}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Est. CPA</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-simple-cpa">
                      {totalConversions > 0 ? formatCurrency(totalSpend / totalConversions) : "N/A"}
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
                    
                    <div className="grid md:grid-cols-2 gap-4">
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
                            {CHANNEL_OPTIONS.map(ch => (
                              <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Spend ($)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={campaign.spend || ""}
                          onChange={(e) => updateCampaign(campaign.id, "spend", parseFloat(e.target.value) || 0)}
                          data-testid={`input-spend-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Impressions</Label>
                        <Input
                          type="number"
                          min={0}
                          value={campaign.impressions || ""}
                          onChange={(e) => updateCampaign(campaign.id, "impressions", parseInt(e.target.value) || 0)}
                          data-testid={`input-impressions-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Clicks</Label>
                        <Input
                          type="number"
                          min={0}
                          value={campaign.clicks || ""}
                          onChange={(e) => updateCampaign(campaign.id, "clicks", parseInt(e.target.value) || 0)}
                          data-testid={`input-clicks-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Conversions</Label>
                        <Input
                          type="number"
                          min={0}
                          value={campaign.conversions || ""}
                          onChange={(e) => updateCampaign(campaign.id, "conversions", parseInt(e.target.value) || 0)}
                          data-testid={`input-conversions-${index}`}
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#C8A661]" />
                    <Label className="text-base font-semibold">Date Range</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        data-testid="input-date-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        data-testid="input-date-end"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#C8A661]" />
                    <Label className="text-base font-semibold">Goals</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target CPA ($)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={goals.targetCPA}
                        onChange={(e) => setGoals(prev => ({ ...prev, targetCPA: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-target-cpa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target ROAS (x)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={goals.targetROAS}
                        onChange={(e) => setGoals(prev => ({ ...prev, targetROAS: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-target-roas"
                      />
                    </div>
                  </div>
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
            <PremiumResults
              featureName="marketing-attribution"
              analysisType="marketing-attribution"
              title="Marketing Attribution Analysis"
              data={result.data}
              summary={{
                headline: `${result.data.overallROI > 0 ? '+' : ''}${(result.data.overallROI * 100).toFixed(0)}% Overall ROI`,
                metrics: [
                  { label: "Overall ROI", value: `${(result.data.overallROI * 100).toFixed(0)}%` },
                  { label: "Avg CPA", value: `$${result.data.overallCPA?.toFixed(2) || "N/A"}` },
                  { label: "Conversions", value: result.data.totalConversions?.toString() || "0" },
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
                      <PieChart className="h-5 w-5 text-[#C8A661]" />
                      Attribution Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-[#C8A661]" data-testid="text-overall-roi">
                        {formatPercent(result.data.overallROI)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Overall ROI</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-foreground" data-testid="text-overall-cpa">
                        {formatCurrency(result.data.overallCPA)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Avg CPA</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-foreground" data-testid="text-result-spend">
                        {formatCurrency(result.data.totalSpend)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Total Spend</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-foreground" data-testid="text-result-conversions">
                        {result.data.totalConversions}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Conversions</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">Attribution by Model</h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      {(["firstTouch", "lastTouch", "linear", "timeDecay"] as const).map(model => (
                        <div key={model} className="border rounded-lg p-3" data-testid={`card-attribution-${model}`}>
                          <h5 className="font-medium text-sm mb-2 capitalize">{model.replace(/([A-Z])/g, ' $1').trim()}</h5>
                          <div className="space-y-1">
                            {result.data.attributionModels[model].slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="truncate mr-2">{item.channel}</span>
                                <Badge variant="outline" className="text-xs">{item.percentageShare.toFixed(0)}%</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
                      Channel Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.data.channelPerformance.length > 0 ? (
                      <div className="h-[300px]" data-testid="chart-channel-performance">
                        <ResponsiveBar
                          data={result.data.channelPerformance.map(d => ({
                            channel: d.channel.length > 10 ? d.channel.substring(0, 8) + "..." : d.channel,
                            ROI: d.roi,
                            Score: d.effectivenessScore
                          }))}
                          keys={["ROI", "Score"]}
                          indexBy="channel"
                          margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
                          padding={0.3}
                          groupMode="grouped"
                          colors={["#C8A661", "#0A1628"]}
                          borderRadius={4}
                          axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: -30 }}
                          axisLeft={{ tickSize: 5, tickPadding: 5, legend: "Value", legendPosition: "middle", legendOffset: -45 }}
                          labelSkipWidth={12}
                          labelSkipHeight={12}
                          legends={[{ dataFrom: "keys", anchor: "bottom-right", direction: "column", translateX: 80, itemWidth: 60, itemHeight: 20 }]}
                          theme={{ text: { fill: "#6B7280" }, grid: { line: { stroke: "#E5E7EB" } } }}
                        />
                      </div>
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
                      <Target className="h-5 w-5 text-[#C8A661]" />
                      CPA by Channel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3" data-testid="list-cpa-breakdown">
                      {result.data.channelPerformance.map((ch, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ch.channel}</span>
                            <Badge variant="outline" className="text-xs">Rank #{ch.rank}</Badge>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${ch.cpa <= goals.targetCPA ? "text-green-600" : "text-red-600"}`}>
                              {formatCurrency(ch.cpa)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ch.cpa <= goals.targetCPA ? "Below" : "Above"} target
                            </p>
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
                    <DollarSign className="h-5 w-5 text-[#C8A661]" />
                    Campaign ROI Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table data-testid="table-campaign-roi">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campaign</TableHead>
                          <TableHead>Channel</TableHead>
                          <TableHead className="text-right">Spend</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">ROI</TableHead>
                          <TableHead className="text-right">ROAS</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.data.campaignROI.map((campaign, idx) => (
                          <TableRow key={idx} data-testid={`row-campaign-roi-${idx}`}>
                            <TableCell className="font-medium">{campaign.campaign}</TableCell>
                            <TableCell>{campaign.channel}</TableCell>
                            <TableCell className="text-right">{formatCurrency(campaign.spend)}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(campaign.revenue)}</TableCell>
                            <TableCell className={`text-right ${campaign.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {formatPercent(campaign.roi)}
                            </TableCell>
                            <TableCell className="text-right">{campaign.roas.toFixed(2)}x</TableCell>
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
                      Budget Reallocation Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Expected Impact</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-600" data-testid="text-additional-conversions">
                            +{result.data.budgetReallocation.expectedImpact.additionalConversions}
                          </div>
                          <div className="text-xs text-muted-foreground">Conversions</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-blue-600" data-testid="text-improved-roi">
                            +{result.data.budgetReallocation.expectedImpact.improvedROI.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">ROI</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-purple-600" data-testid="text-reduced-cpa">
                            -{formatCurrency(result.data.budgetReallocation.expectedImpact.reducedCPA)}
                          </div>
                          <div className="text-xs text-muted-foreground">CPA</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground" data-testid="text-rationale">
                      {result.data.budgetReallocation.rationale}
                    </p>

                    {result.data.budgetReallocation.recommendedAllocation.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Recommended Allocation</h4>
                        {result.data.budgetReallocation.recommendedAllocation.map((alloc, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b" data-testid={`row-allocation-${idx}`}>
                            <span>{alloc.channel}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(alloc.amount)} ({alloc.percentage}%)</span>
                              {alloc.change !== 0 && (
                                <Badge className={alloc.change > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                  {alloc.change > 0 ? "+" : ""}{alloc.change}%
                                </Badge>
                              )}
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
                      <TrendingUp className="h-5 w-5 text-[#C8A661]" />
                      Predicted Impact Scenarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.data.predictedImpact.map((scenario, idx) => (
                      <div key={idx} className="border rounded-lg p-3" data-testid={`card-scenario-${idx}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{scenario.scenario}</span>
                          <Badge variant="outline" className="text-xs">
                            {(scenario.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">Conversions</p>
                            <p className="font-semibold">{scenario.predictedConversions}</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">ROI</p>
                            <p className="font-semibold">{scenario.predictedROI.toFixed(1)}%</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground text-xs">CPA</p>
                            <p className="font-semibold">{formatCurrency(scenario.predictedCPA)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {result.data.predictedImpact.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No predictions available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-[#C8A661]" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3" data-testid="list-recommendations">
                      {result.data.recommendations.map((rec, idx) => (
                        <div key={idx} className="border rounded-lg p-3" data-testid={`card-recommendation-${idx}`}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                            <Badge className={
                              rec.priority === "high" ? "bg-red-100 text-red-700" :
                              rec.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            }>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="font-medium mb-1">{rec.action}</p>
                          <p className="text-sm text-muted-foreground">{rec.expectedImpact}</p>
                        </div>
                      ))}
                      {result.data.recommendations.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No recommendations available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#C8A661]" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3" data-testid="list-insights">
                      {result.data.insights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-[#C8A661] shrink-0 mt-0.5" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                      {result.data.insights.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No insights available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Analysis confidence: {(result.confidence * 100).toFixed(0)}%
              </div>
              </div>
            </PremiumResults>
          )}
        </div>
      </div>
    </>
  );
}