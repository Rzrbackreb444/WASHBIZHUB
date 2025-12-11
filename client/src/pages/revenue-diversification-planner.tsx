import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from "recharts";
import { 
  DollarSign, TrendingUp, Shield, Target, Calculator, 
  Truck, Building2, Coffee, Package, Users, Info, 
  BarChart3, PieChartIcon, CheckCircle, AlertTriangle
} from "lucide-react";

interface ServiceConfig {
  id: string;
  name: string;
  icon: typeof DollarSign;
  enabled: boolean;
  projectedRevenue: number;
  implementationCost: number;
  color: string;
}

const CHART_COLORS = ['#C8A661', '#0A1628', '#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B'];

export default function RevenueDiversificationPlanner() {
  const [selfServiceRevenue, setSelfServiceRevenue] = useState(15000);
  const [breakEvenMonths, setBreakEvenMonths] = useState(12);
  
  const [services, setServices] = useState<ServiceConfig[]>([
    { 
      id: 'wdf', 
      name: 'Wash-Dry-Fold (WDF)', 
      icon: Package,
      enabled: false, 
      projectedRevenue: 5000, 
      implementationCost: 8000,
      color: '#22C55E'
    },
    { 
      id: 'pickup', 
      name: 'Pickup & Delivery', 
      icon: Truck,
      enabled: false, 
      projectedRevenue: 3500, 
      implementationCost: 12000,
      color: '#3B82F6'
    },
    { 
      id: 'vending', 
      name: 'Vending Machines', 
      icon: Coffee,
      enabled: false, 
      projectedRevenue: 1200, 
      implementationCost: 5000,
      color: '#8B5CF6'
    },
    { 
      id: 'commercial', 
      name: 'Commercial Accounts', 
      icon: Building2,
      enabled: false, 
      projectedRevenue: 8000, 
      implementationCost: 3000,
      color: '#F59E0B'
    },
    { 
      id: 'dropoff', 
      name: 'Drop-Off Only', 
      icon: Users,
      enabled: false, 
      projectedRevenue: 2500, 
      implementationCost: 2000,
      color: '#EF4444'
    },
  ]);

  const updateService = (id: string, updates: Partial<ServiceConfig>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const calculations = useMemo(() => {
    const enabledServices = services.filter(s => s.enabled);
    const totalNewRevenue = enabledServices.reduce((sum, s) => sum + s.projectedRevenue, 0);
    const totalProjectedRevenue = selfServiceRevenue + totalNewRevenue;
    const totalImplementationCost = enabledServices.reduce((sum, s) => sum + s.implementationCost, 0);
    
    const revenueStreams = [
      { name: 'Self-Service', revenue: selfServiceRevenue, percentage: 0, color: '#C8A661' },
      ...enabledServices.map(s => ({
        name: s.name,
        revenue: s.projectedRevenue,
        percentage: 0,
        color: s.color
      }))
    ];

    revenueStreams.forEach(stream => {
      stream.percentage = totalProjectedRevenue > 0 
        ? (stream.revenue / totalProjectedRevenue) * 100 
        : 0;
    });

    const largestPercentage = Math.max(...revenueStreams.map(s => s.percentage));
    const diversificationScore = Math.max(0, 100 - largestPercentage);

    const numberOfStreams = revenueStreams.length;
    const riskFactor = numberOfStreams > 0 ? (1 / numberOfStreams) * 100 : 100;
    const riskReduction = 100 - riskFactor;

    const serviceROI = enabledServices.map(s => ({
      name: s.name,
      roi: s.implementationCost > 0 ? ((s.projectedRevenue * 12) / s.implementationCost) * 100 : 0,
      monthsToBreakeven: s.projectedRevenue > 0 ? s.implementationCost / s.projectedRevenue : 0,
      annualRevenue: s.projectedRevenue * 12,
      color: s.color
    }));

    const combinedMonthlyRevenue = totalNewRevenue;
    const combinedBreakeven = combinedMonthlyRevenue > 0 
      ? totalImplementationCost / combinedMonthlyRevenue 
      : 0;

    const meetsBreakevenTarget = combinedBreakeven <= breakEvenMonths && combinedBreakeven > 0;

    return {
      totalProjectedRevenue,
      totalNewRevenue,
      totalImplementationCost,
      revenueStreams,
      diversificationScore,
      riskReduction,
      serviceROI,
      combinedBreakeven,
      meetsBreakevenTarget,
      numberOfStreams
    };
  }, [selfServiceRevenue, services, breakEvenMonths]);

  const pieData = calculations.revenueStreams.map(stream => ({
    name: stream.name,
    value: stream.revenue,
    percentage: stream.percentage
  }));

  const roiTimelineData = calculations.serviceROI.map(s => ({
    name: s.name.length > 15 ? s.name.substring(0, 12) + '...' : s.name,
    'Months to Break-even': s.monthsToBreakeven,
    'Annual ROI %': s.roi
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <>
      <SEO
        title="Revenue Diversification Planner | Laundromat Income Streams Calculator | WashBizHub"
        description="Plan and optimize your laundromat revenue streams. Calculate ROI for WDF, pickup/delivery, vending, commercial accounts, and more. Reduce risk through diversification."
        canonicalUrl="/revenue-diversification-planner"
        ogType="website"
        keywords={[
          "laundromat revenue diversification",
          "laundry business income streams",
          "WDF profitability calculator",
          "pickup delivery laundromat ROI",
          "commercial laundry accounts",
          "vending machine revenue",
          "laundromat risk reduction",
          "laundry business planning"
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Revenue Diversification Planner", url: "/revenue-diversification-planner" }
            ]}
          />

          <div className="mb-8 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="page-title">
                  Revenue Diversification Planner
                </h1>
                <p className="text-muted-foreground">
                  Optimize your laundromat income streams and reduce business risk
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]">
                <Calculator className="w-3 h-3 mr-1" />
                Premium Calculator
              </Badge>
              <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]">
                <BarChart3 className="w-3 h-3 mr-1" />
                ROI Analysis
              </Badge>
              <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]">
                <Shield className="w-3 h-3 mr-1" />
                Risk Assessment
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#C8A661]" />
                    Current Revenue & Settings
                  </CardTitle>
                  <CardDescription>
                    Enter your baseline self-service revenue and target break-even period
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="self-service-revenue">Monthly Self-Service Revenue</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Your current monthly revenue from self-service machines only
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="self-service-revenue"
                          type="number"
                          value={selfServiceRevenue}
                          onChange={(e) => setSelfServiceRevenue(Number(e.target.value))}
                          className="pl-9"
                          data-testid="input-self-service-revenue"
                        />
                      </div>
                      <Slider
                        value={[selfServiceRevenue]}
                        onValueChange={([v]) => setSelfServiceRevenue(v)}
                        min={5000}
                        max={50000}
                        step={500}
                        className="mt-2"
                        data-testid="slider-self-service-revenue"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formatCurrency(selfServiceRevenue)}/month
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="breakeven-months">Target Break-even (Months)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Your target timeframe to recoup implementation costs
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="breakeven-months"
                        type="number"
                        value={breakEvenMonths}
                        onChange={(e) => setBreakEvenMonths(Number(e.target.value))}
                        min={1}
                        max={36}
                        data-testid="input-breakeven-months"
                      />
                      <Slider
                        value={[breakEvenMonths]}
                        onValueChange={([v]) => setBreakEvenMonths(v)}
                        min={3}
                        max={36}
                        step={1}
                        className="mt-2"
                        data-testid="slider-breakeven-months"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {breakEvenMonths} months target
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#C8A661]" />
                    Revenue Stream Configuration
                  </CardTitle>
                  <CardDescription>
                    Toggle services on/off and configure projected revenue and implementation costs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {services.map((service) => {
                    const ServiceIcon = service.icon;
                    return (
                      <div 
                        key={service.id}
                        className={`p-4 rounded-lg border transition-all ${
                          service.enabled 
                            ? 'border-[#C8A661]/50 bg-[#C8A661]/5' 
                            : 'border-border bg-muted/30'
                        }`}
                        data-testid={`service-card-${service.id}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-10 w-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: service.enabled ? service.color + '20' : 'var(--muted)' }}
                            >
                              <ServiceIcon 
                                className="h-5 w-5" 
                                style={{ color: service.enabled ? service.color : 'var(--muted-foreground)' }} 
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{service.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {service.enabled ? 'Enabled' : 'Disabled'}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={service.enabled}
                            onCheckedChange={(checked) => updateService(service.id, { enabled: checked })}
                            data-testid={`toggle-${service.id}`}
                          />
                        </div>
                        
                        {service.enabled && (
                          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                            <div className="space-y-2">
                              <Label className="text-sm">Projected Monthly Revenue</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={service.projectedRevenue}
                                  onChange={(e) => updateService(service.id, { projectedRevenue: Number(e.target.value) })}
                                  className="pl-9"
                                  data-testid={`input-revenue-${service.id}`}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Implementation Cost</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={service.implementationCost}
                                  onChange={(e) => updateService(service.id, { implementationCost: Number(e.target.value) })}
                                  className="pl-9"
                                  data-testid={`input-cost-${service.id}`}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <PremiumResults
                featureName="revenue-diversification-planner"
                analysisType="revenue-diversification-planner"
                title="Revenue Diversification Results"
                data={{}}
                summary={{
                  headline: "Revenue optimization analysis",
                  metrics: [
                    { label: "Total Revenue", value: formatCurrency(calculations.totalProjectedRevenue) },
                    { label: "Diversification Score", value: `${calculations.diversificationScore.toFixed(0)}` },
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
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <PieChartIcon className="h-5 w-5 text-[#C8A661]" />
                      Revenue Mix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64" data-testid="chart-revenue-mix">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percentage }) => `${percentage.toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={calculations.revenueStreams[index]?.color || CHART_COLORS[index % CHART_COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                      ROI Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64" data-testid="chart-roi-timeline">
                      {roiTimelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={roiTimelineData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <RechartsTooltip />
                            <Bar dataKey="Months to Break-even" fill="#C8A661" name="Break-even (months)" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          Enable services to see ROI timeline
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border shadow-sm overflow-hidden sticky top-4">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader className="bg-[#0A1628] text-white">
                  <CardTitle className="text-xl">Results Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Projected Revenue</p>
                      <p className="text-3xl font-bold text-[#C8A661]" data-testid="output-total-revenue">
                        {formatCurrency(calculations.totalProjectedRevenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="output-diversification-score">
                          {calculations.diversificationScore.toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Diversification Score</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="output-risk-reduction">
                          {calculations.riskReduction.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Risk Reduction</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-[#C8A661]" />
                        Revenue Breakdown
                      </h4>
                      <div className="space-y-2">
                        {calculations.revenueStreams.map((stream, idx) => (
                          <div 
                            key={stream.name} 
                            className="flex items-center justify-between text-sm"
                            data-testid={`output-stream-${idx}`}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-3 w-3 rounded-full" 
                                style={{ backgroundColor: stream.color }}
                              />
                              <span className="text-muted-foreground">{stream.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{formatCurrency(stream.revenue)}</span>
                              <span className="text-muted-foreground ml-2">({stream.percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#C8A661]" />
                        Service ROI Analysis
                      </h4>
                      {calculations.serviceROI.length > 0 ? (
                        <div className="space-y-3">
                          {calculations.serviceROI.map((service, idx) => (
                            <div 
                              key={service.name} 
                              className="bg-muted/30 rounded-lg p-3"
                              data-testid={`output-roi-${idx}`}
                            >
                              <p className="font-medium text-sm mb-2">{service.name}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Annual ROI</p>
                                  <p className="font-semibold text-green-600">{service.roi.toFixed(0)}%</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Break-even</p>
                                  <p className="font-semibold">{service.monthsToBreakeven.toFixed(1)} mo</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Enable services to see ROI analysis</p>
                      )}
                    </div>

                    <Separator />

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#C8A661]" />
                        Combined Break-even
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold" data-testid="output-combined-breakeven">
                            {calculations.combinedBreakeven > 0 
                              ? `${calculations.combinedBreakeven.toFixed(1)} months`
                              : 'N/A'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total Cost: {formatCurrency(calculations.totalImplementationCost)}
                          </p>
                        </div>
                        {calculations.combinedBreakeven > 0 && (
                          <div data-testid="output-breakeven-status">
                            {calculations.meetsBreakevenTarget ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                On Target
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Above Target
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#0A1628] rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Number of Revenue Streams</p>
                      <p className="text-2xl font-bold text-[#C8A661]" data-testid="output-stream-count">
                        {calculations.numberOfStreams}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Risk Factor: {(100 / calculations.numberOfStreams).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">Industry Benchmarks</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Diversified laundromats earn 30-50% more revenue</p>
                    <p>• WDF typically adds $3-8K/month in revenue</p>
                    <p>• Commercial accounts offer highest margins (40-60%)</p>
                    <p>• Pickup/delivery growing 15% annually</p>
                    <p>• Target: 3-5 revenue streams for stability</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            </PremiumResults>
          </div>

          <div className="mt-8">
            <CalculatorDisclaimer />
          </div>
        </div>
      </div>
    </>
  );
}
