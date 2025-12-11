import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Zap, Flame, Droplets, TrendingUp, AlertTriangle, 
  Calendar, PiggyBank, BarChart3, LineChart as LineChartIcon, Info,
  Sparkles, DollarSign, Plus, Trash2, Loader2, Lightbulb,
  ThermometerSun, Target, Shield, Clock, ChevronRight
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip, AreaChart, Area, BarChart, Bar, Cell } from "recharts";
import { apiRequest } from "@/lib/queryClient";

interface UtilityMonth {
  id: string;
  month: string;
  electric: number;
  gas: number;
  water: number;
}

interface ForecastResult {
  success: boolean;
  data: {
    forecast: Array<{
      month: string;
      electric: { predicted: number; low: number; high: number };
      gas: { predicted: number; low: number; high: number };
      water: { predicted: number; low: number; high: number };
      totalCost: { predicted: number; low: number; high: number };
    }>;
    peakDemand: {
      electric: { month: string; value: number; reason: string };
      gas: { month: string; value: number; reason: string };
      water: { month: string; value: number; reason: string };
    };
    seasonalFactors: {
      electric: Array<{ season: string; factor: number; explanation: string }>;
      gas: Array<{ season: string; factor: number; explanation: string }>;
      water: Array<{ season: string; factor: number; explanation: string }>;
    };
    anomalies: Array<{
      type: string;
      utility: string;
      description: string;
      severity: string;
      recommendation: string;
    }>;
    efficiencyOpportunities: Array<{
      category: string;
      opportunity: string;
      estimatedSavings: number;
      estimatedSavingsPercent: number;
      implementation: string;
      priority: string;
      paybackMonths: number;
    }>;
    costOptimization: Array<{
      strategy: string;
      description: string;
      potentialSavings: number;
      difficulty: string;
    }>;
    budgetSummary: {
      monthlyAverage: { predicted: number; low: number; high: number };
      annualTotal: { predicted: number; low: number; high: number };
      quarterlyBreakdown: Array<{
        quarter: string;
        total: number;
        percentOfAnnual: number;
      }>;
      yearOverYearChange: number;
      budgetRecommendation: string;
    };
  };
  confidence: number;
  error?: string;
}

const CHART_COLORS = {
  electric: "#F59E0B",
  gas: "#EF4444",
  water: "#3B82F6",
  total: "#C8A661",
  confidence: "#22C55E",
};

const generateMonthOptions = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    months.push(monthName);
  }
  return months;
};

export default function UtilityLoadForecaster() {
  const [utilityMonths, setUtilityMonths] = useState<UtilityMonth[]>([
    { id: "1", month: generateMonthOptions()[0], electric: 850, gas: 450, water: 320 },
    { id: "2", month: generateMonthOptions()[1], electric: 820, gas: 480, water: 310 },
    { id: "3", month: generateMonthOptions()[2], electric: 780, gas: 520, water: 290 },
  ]);
  const [machineCount, setMachineCount] = useState(25);
  const [operatingHours, setOperatingHours] = useState(14);
  const [electricRate, setElectricRate] = useState(0.12);
  const [gasRate, setGasRate] = useState(1.50);
  const [waterRate, setWaterRate] = useState(0.005);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);

  const forecastMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/forecast-utility-load", {
        historicalData: utilityMonths.map(m => ({
          month: m.month,
          electric: m.electric,
          gas: m.gas,
          water: m.water,
        })),
        machineCount,
        operatingHours,
        rates: {
          electric: electricRate,
          gas: gasRate,
          water: waterRate,
        },
      });
      return response.json();
    },
    onSuccess: (data: ForecastResult) => {
      setForecastResult(data);
    },
  });

  const addMonth = () => {
    const newId = Date.now().toString();
    const nextMonthIndex = utilityMonths.length;
    const monthOptions = generateMonthOptions();
    setUtilityMonths([
      ...utilityMonths,
      { 
        id: newId, 
        month: monthOptions[nextMonthIndex] || monthOptions[0], 
        electric: 800, 
        gas: 450, 
        water: 300 
      },
    ]);
  };

  const removeMonth = (id: string) => {
    if (utilityMonths.length > 3) {
      setUtilityMonths(utilityMonths.filter(m => m.id !== id));
    }
  };

  const updateMonth = (id: string, field: keyof UtilityMonth, value: string | number) => {
    setUtilityMonths(utilityMonths.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = forecastResult?.data.forecast.map(f => ({
    name: f.month.split(' ')[0].slice(0, 3),
    Electric: f.electric.predicted,
    ElectricLow: f.electric.low,
    ElectricHigh: f.electric.high,
    Gas: f.gas.predicted,
    Water: f.water.predicted,
    Total: f.totalCost.predicted,
    TotalLow: f.totalCost.low,
    TotalHigh: f.totalCost.high,
  })) || [];

  const seasonalData = forecastResult?.data.seasonalFactors.electric.map((e, i) => ({
    season: e.season,
    Electric: e.factor,
    Gas: forecastResult?.data.seasonalFactors.gas[i]?.factor || 1,
    Water: forecastResult?.data.seasonalFactors.water[i]?.factor || 1,
  })) || [];

  return (
    <>
      <SEO
        title="Predictive Utility Load Forecaster | AI-Powered Laundromat Utility Analysis | WashBizHub"
        description="AI-powered utility forecasting for laundromats. Get 12-month predictions, peak demand alerts, seasonal patterns, efficiency recommendations, and budget planning insights."
        canonicalUrl="/utility-load-forecaster"
        ogType="website"
        keywords={[
          "utility load forecaster",
          "laundromat utility prediction",
          "AI utility analysis",
          "energy cost forecasting",
          "laundromat efficiency",
          "utility bill prediction",
          "peak demand forecasting",
          "laundromat budget planning",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Utility Load Forecaster", url: "/utility-load-forecaster" },
            ]}
          />

          <div className="mb-8 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Predictive Utility Load Forecaster
                </h1>
                <p className="text-muted-foreground">
                  AI-powered 12-month utility cost predictions with confidence intervals
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>

          <Alert className="mb-6 border-[#C8A661]/30 bg-[#C8A661]/10">
            <Info className="h-4 w-4 text-[#C8A661]" />
            <AlertTitle className="text-[#C8A661]">How It Works</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Enter your last 3-6 months of utility bills along with your operation details. Our AI analyzes 
              patterns, seasonal trends, and industry benchmarks to forecast your next 12 months of utility costs 
              with actionable insights.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-1 bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C8A661]" />
                  Historical Utility Bills
                </CardTitle>
                <CardDescription>Enter your last 3-6 months of utility expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {utilityMonths.map((month, index) => (
                  <div key={month.id} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Month {index + 1}</Label>
                      {utilityMonths.length > 3 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMonth(month.id)}
                          data-testid={`button-remove-month-${index}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={month.month}
                      onChange={(e) => updateMonth(month.id, 'month', e.target.value)}
                      placeholder="e.g., November 2024"
                      data-testid={`input-month-name-${index}`}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" /> Electric
                        </Label>
                        <Input
                          type="number"
                          value={month.electric}
                          onChange={(e) => updateMonth(month.id, 'electric', Number(e.target.value))}
                          placeholder="$"
                          data-testid={`input-electric-${index}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <Flame className="w-3 h-3 text-red-500" /> Gas
                        </Label>
                        <Input
                          type="number"
                          value={month.gas}
                          onChange={(e) => updateMonth(month.id, 'gas', Number(e.target.value))}
                          placeholder="$"
                          data-testid={`input-gas-${index}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-500" /> Water
                        </Label>
                        <Input
                          type="number"
                          value={month.water}
                          onChange={(e) => updateMonth(month.id, 'water', Number(e.target.value))}
                          placeholder="$"
                          data-testid={`input-water-${index}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {utilityMonths.length < 6 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={addMonth}
                    data-testid="button-add-month"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Month
                  </Button>
                )}

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Operation Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Machine Count</Label>
                      <Input
                        type="number"
                        value={machineCount}
                        onChange={(e) => setMachineCount(Number(e.target.value))}
                        data-testid="input-machine-count"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Hours/Day</Label>
                      <Input
                        type="number"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(Number(e.target.value))}
                        data-testid="input-operating-hours"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Current Rates</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">$/kWh</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={electricRate}
                        onChange={(e) => setElectricRate(Number(e.target.value))}
                        data-testid="input-electric-rate"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">$/therm</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={gasRate}
                        onChange={(e) => setGasRate(Number(e.target.value))}
                        data-testid="input-gas-rate"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">$/gallon</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={waterRate}
                        onChange={(e) => setWaterRate(Number(e.target.value))}
                        data-testid="input-water-rate"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => forecastMutation.mutate()}
                  disabled={forecastMutation.isPending}
                  className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                  data-testid="button-generate-forecast"
                >
                  {forecastMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Forecast...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Forecast
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {forecastResult?.success && forecastResult.data.forecast.length > 0 ? (
                <>
                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <LineChartIcon className="w-5 h-5 text-[#C8A661]" />
                          12-Month Forecast
                        </CardTitle>
                        <Badge variant="outline" className="border-green-500/50 text-green-600">
                          {Math.round(forecastResult.confidence * 100)}% Confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]" data-testid="chart-forecast">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                            <RechartsTooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="TotalHigh" 
                              stroke="transparent" 
                              fill={CHART_COLORS.total}
                              fillOpacity={0.1}
                              name="Upper Bound"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="TotalLow" 
                              stroke="transparent" 
                              fill={CHART_COLORS.total}
                              fillOpacity={0.1}
                              name="Lower Bound"
                            />
                            <Line type="monotone" dataKey="Total" stroke={CHART_COLORS.total} strokeWidth={3} name="Total Cost" dot={{ fill: CHART_COLORS.total }} />
                            <Line type="monotone" dataKey="Electric" stroke={CHART_COLORS.electric} strokeWidth={2} name="Electric" />
                            <Line type="monotone" dataKey="Gas" stroke={CHART_COLORS.gas} strokeWidth={2} name="Gas" />
                            <Line type="monotone" dataKey="Water" stroke={CHART_COLORS.water} strokeWidth={2} name="Water" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="projections" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="projections" data-testid="tab-projections">
                        <Calendar className="w-4 h-4 mr-1" />
                        Projections
                      </TabsTrigger>
                      <TabsTrigger value="peaks" data-testid="tab-peaks">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Peak Demand
                      </TabsTrigger>
                      <TabsTrigger value="seasonal" data-testid="tab-seasonal">
                        <ThermometerSun className="w-4 h-4 mr-1" />
                        Seasonal
                      </TabsTrigger>
                      <TabsTrigger value="efficiency" data-testid="tab-efficiency">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        Efficiency
                      </TabsTrigger>
                      <TabsTrigger value="budget" data-testid="tab-budget">
                        <PiggyBank className="w-4 h-4 mr-1" />
                        Budget
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="projections" className="mt-4">
                      <Card className="bg-card border shadow-sm">
                        <CardHeader>
                          <CardTitle>Monthly Projections Table</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table data-testid="table-projections">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Month</TableHead>
                                  <TableHead className="text-right">Electric</TableHead>
                                  <TableHead className="text-right">Gas</TableHead>
                                  <TableHead className="text-right">Water</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead className="text-right">Range</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {forecastResult.data.forecast.map((f, i) => (
                                  <TableRow key={i} data-testid={`row-projection-${i}`}>
                                    <TableCell className="font-medium">{f.month}</TableCell>
                                    <TableCell className="text-right text-amber-600">{formatCurrency(f.electric.predicted)}</TableCell>
                                    <TableCell className="text-right text-red-600">{formatCurrency(f.gas.predicted)}</TableCell>
                                    <TableCell className="text-right text-blue-600">{formatCurrency(f.water.predicted)}</TableCell>
                                    <TableCell className="text-right font-bold text-[#C8A661]">{formatCurrency(f.totalCost.predicted)}</TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                      {formatCurrency(f.totalCost.low)} - {formatCurrency(f.totalCost.high)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="peaks" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="card-peak-demand">
                        <Card className="bg-card border shadow-sm">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-amber-500" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Electric Peak</p>
                                <p className="text-xl font-bold text-amber-600">{forecastResult.data.peakDemand.electric.month}</p>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-electric-peak">
                              {formatCurrency(forecastResult.data.peakDemand.electric.value)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">{forecastResult.data.peakDemand.electric.reason}</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-card border shadow-sm">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-red-500" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Gas Peak</p>
                                <p className="text-xl font-bold text-red-600">{forecastResult.data.peakDemand.gas.month}</p>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-gas-peak">
                              {formatCurrency(forecastResult.data.peakDemand.gas.value)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">{forecastResult.data.peakDemand.gas.reason}</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-card border shadow-sm">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Droplets className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Water Peak</p>
                                <p className="text-xl font-bold text-blue-600">{forecastResult.data.peakDemand.water.month}</p>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-water-peak">
                              {formatCurrency(forecastResult.data.peakDemand.water.value)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">{forecastResult.data.peakDemand.water.reason}</p>
                          </CardContent>
                        </Card>
                      </div>

                      {forecastResult.data.anomalies.length > 0 && (
                        <Card className="bg-card border shadow-sm mt-4">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-orange-500" />
                              Detected Anomalies
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3" data-testid="card-anomalies">
                              {forecastResult.data.anomalies.map((anomaly, i) => (
                                <Alert 
                                  key={i} 
                                  className={`border-l-4 ${
                                    anomaly.severity === 'high' ? 'border-l-red-500' :
                                    anomaly.severity === 'medium' ? 'border-l-orange-500' :
                                    'border-l-yellow-500'
                                  }`}
                                >
                                  <AlertTitle className="capitalize">{anomaly.type} - {anomaly.utility}</AlertTitle>
                                  <AlertDescription>
                                    <p>{anomaly.description}</p>
                                    <p className="mt-1 text-sm font-medium">{anomaly.recommendation}</p>
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="seasonal" className="mt-4">
                      <Card className="bg-card border shadow-sm" data-testid="card-seasonal">
                        <CardHeader>
                          <CardTitle>Seasonal Adjustment Factors</CardTitle>
                          <CardDescription>How seasonal patterns affect your utility costs</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[250px] mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={seasonalData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="season" className="text-xs" />
                                <YAxis className="text-xs" domain={[0, 2]} />
                                <RechartsTooltip 
                                  formatter={(value: number) => value.toFixed(2) + 'x'}
                                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                                />
                                <Legend />
                                <Bar dataKey="Electric" fill={CHART_COLORS.electric} name="Electric" />
                                <Bar dataKey="Gas" fill={CHART_COLORS.gas} name="Gas" />
                                <Bar dataKey="Water" fill={CHART_COLORS.water} name="Water" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {forecastResult.data.seasonalFactors.electric.map((sf, i) => (
                              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                                <h4 className="font-medium mb-2">{sf.season}</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-amber-600">Electric</span>
                                    <span>{sf.factor.toFixed(2)}x</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-red-600">Gas</span>
                                    <span>{forecastResult.data.seasonalFactors.gas[i]?.factor.toFixed(2) || '1.00'}x</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-600">Water</span>
                                    <span>{forecastResult.data.seasonalFactors.water[i]?.factor.toFixed(2) || '1.00'}x</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="efficiency" className="mt-4">
                      <Card className="bg-card border shadow-sm" data-testid="card-efficiency">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-[#C8A661]" />
                            Efficiency Recommendations
                          </CardTitle>
                          <CardDescription>AI-identified opportunities to reduce utility costs</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {forecastResult.data.efficiencyOpportunities.map((opp, i) => (
                              <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-[#C8A661]">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant={opp.priority === 'high' ? 'default' : 'secondary'} 
                                             className={opp.priority === 'high' ? 'bg-green-600' : ''}>
                                        {opp.priority} priority
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">{opp.category}</span>
                                    </div>
                                    <h4 className="font-medium mb-1">{opp.opportunity}</h4>
                                    <p className="text-sm text-muted-foreground">{opp.implementation}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-green-600">{formatCurrency(opp.estimatedSavings)}/mo</p>
                                    <p className="text-sm text-muted-foreground">{opp.estimatedSavingsPercent}% savings</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {opp.paybackMonths} mo payback
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {forecastResult.data.costOptimization.length > 0 && (
                              <>
                                <Separator className="my-6" />
                                <h4 className="font-medium mb-4">Quick Wins</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {forecastResult.data.costOptimization.map((opt, i) => (
                                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">{opt.strategy}</span>
                                        <Badge variant="outline" className={
                                          opt.difficulty === 'easy' ? 'border-green-500/50 text-green-600' :
                                          opt.difficulty === 'moderate' ? 'border-amber-500/50 text-amber-600' :
                                          'border-red-500/50 text-red-600'
                                        }>
                                          {opt.difficulty}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{opt.description}</p>
                                      <p className="text-sm font-medium text-green-600 mt-1">
                                        Save {formatCurrency(opt.potentialSavings)}/mo
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="budget" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="card-budget">
                        <Card className="bg-card border shadow-sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-[#C8A661]" />
                              Budget Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">Monthly Average</p>
                                <p className="text-3xl font-bold text-[#C8A661]">
                                  {formatCurrency(forecastResult.data.budgetSummary.monthlyAverage.predicted)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Range: {formatCurrency(forecastResult.data.budgetSummary.monthlyAverage.low)} - {formatCurrency(forecastResult.data.budgetSummary.monthlyAverage.high)}
                                </p>
                              </div>

                              <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">Annual Total</p>
                                <p className="text-3xl font-bold text-[#C8A661]">
                                  {formatCurrency(forecastResult.data.budgetSummary.annualTotal.predicted)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Range: {formatCurrency(forecastResult.data.budgetSummary.annualTotal.low)} - {formatCurrency(forecastResult.data.budgetSummary.annualTotal.high)}
                                </p>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm">Year-Over-Year Change</span>
                                <span className={`font-medium ${forecastResult.data.budgetSummary.yearOverYearChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {forecastResult.data.budgetSummary.yearOverYearChange >= 0 ? '+' : ''}
                                  {forecastResult.data.budgetSummary.yearOverYearChange.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-card border shadow-sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-[#C8A661]" />
                              Quarterly Breakdown
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {forecastResult.data.budgetSummary.quarterlyBreakdown.map((q, i) => (
                                <div key={i} className="flex items-center gap-4">
                                  <span className="font-medium w-12">{q.quarter}</span>
                                  <div className="flex-1 bg-muted rounded-full h-3">
                                    <div 
                                      className="bg-[#C8A661] h-3 rounded-full"
                                      style={{ width: `${q.percentOfAnnual}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-20 text-right">{formatCurrency(q.total)}</span>
                                  <span className="text-sm text-muted-foreground w-12 text-right">{q.percentOfAnnual}%</span>
                                </div>
                              ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="p-4 bg-[#C8A661]/10 rounded-lg border border-[#C8A661]/30">
                              <h4 className="font-medium text-[#C8A661] mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Budget Recommendation
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {forecastResult.data.budgetSummary.budgetRecommendation}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Enter Your Utility Data</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Add your last 3-6 months of utility bills and click "Generate AI Forecast" 
                      to receive detailed 12-month predictions with actionable insights.
                    </p>
                    {forecastMutation.isError && (
                      <Alert className="mt-4 max-w-md mx-auto border-red-500/50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Forecast Error</AlertTitle>
                        <AlertDescription>
                          Failed to generate forecast. Please try again.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}