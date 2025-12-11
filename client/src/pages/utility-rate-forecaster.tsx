import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, Flame, Droplets, TrendingUp, TrendingDown, Calculator, 
  Calendar, PiggyBank, BarChart3, LineChart as LineChartIcon, Info,
  Sparkles, DollarSign, Percent, ArrowRight, CheckCircle, Target,
  Download, Share2, Loader2
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip, BarChart, Bar, Cell, AreaChart, Area } from "recharts";

interface UtilityProjection {
  month: number;
  year: number;
  electric: number;
  gas: number;
  water: number;
  total: number;
  electricWithEfficiency: number;
  gasWithEfficiency: number;
  waterWithEfficiency: number;
  totalWithEfficiency: number;
}

const CHART_COLORS = {
  electric: "#F59E0B",
  gas: "#EF4444",
  water: "#3B82F6",
  total: "#C8A661",
  withEfficiency: "#22C55E",
};

const SEASONAL_FACTORS = {
  electric: [1.0, 0.95, 0.9, 0.85, 0.9, 1.1, 1.3, 1.35, 1.2, 0.95, 0.9, 1.0],
  gas: [1.4, 1.35, 1.2, 1.0, 0.8, 0.6, 0.5, 0.5, 0.6, 0.9, 1.15, 1.4],
  water: [0.9, 0.9, 0.95, 1.0, 1.05, 1.15, 1.2, 1.2, 1.1, 1.0, 0.95, 0.9],
};

export default function UtilityRateForecaster() {
  const [currentElectricBill, setCurrentElectricBill] = useState(800);
  const [currentGasBill, setCurrentGasBill] = useState(400);
  const [currentWaterBill, setCurrentWaterBill] = useState(300);
  const [annualRateIncrease, setAnnualRateIncrease] = useState(4);
  const [efficiencyImprovement, setEfficiencyImprovement] = useState(15);
  const [monthsToForecast, setMonthsToForecast] = useState(36);
  const [seasonalVariation, setSeasonalVariation] = useState(20);
  const [loadsPerMonth, setLoadsPerMonth] = useState(5000);
  const [isCalculated, setIsCalculated] = useState(false);

  const calculations = useMemo(() => {
    const monthlyRateIncrease = annualRateIncrease / 100 / 12;
    const seasonalFactor = seasonalVariation / 100;
    const efficiencyFactor = 1 - (efficiencyImprovement / 100);
    
    const projections: UtilityProjection[] = [];
    
    for (let i = 0; i < monthsToForecast; i++) {
      const monthIndex = i % 12;
      const yearNumber = Math.floor(i / 12) + 1;
      
      const growthMultiplier = Math.pow(1 + monthlyRateIncrease, i);
      
      const electricSeasonal = 1 + (SEASONAL_FACTORS.electric[monthIndex] - 1) * seasonalFactor;
      const gasSeasonal = 1 + (SEASONAL_FACTORS.gas[monthIndex] - 1) * seasonalFactor;
      const waterSeasonal = 1 + (SEASONAL_FACTORS.water[monthIndex] - 1) * seasonalFactor;
      
      const electric = currentElectricBill * growthMultiplier * electricSeasonal;
      const gas = currentGasBill * growthMultiplier * gasSeasonal;
      const water = currentWaterBill * growthMultiplier * waterSeasonal;
      const total = electric + gas + water;
      
      const electricWithEfficiency = electric * efficiencyFactor;
      const gasWithEfficiency = gas * efficiencyFactor;
      const waterWithEfficiency = water * efficiencyFactor;
      const totalWithEfficiency = electricWithEfficiency + gasWithEfficiency + waterWithEfficiency;
      
      projections.push({
        month: i + 1,
        year: yearNumber,
        electric: Math.round(electric * 100) / 100,
        gas: Math.round(gas * 100) / 100,
        water: Math.round(water * 100) / 100,
        total: Math.round(total * 100) / 100,
        electricWithEfficiency: Math.round(electricWithEfficiency * 100) / 100,
        gasWithEfficiency: Math.round(gasWithEfficiency * 100) / 100,
        waterWithEfficiency: Math.round(waterWithEfficiency * 100) / 100,
        totalWithEfficiency: Math.round(totalWithEfficiency * 100) / 100,
      });
    }
    
    const currentMonthlyTotal = currentElectricBill + currentGasBill + currentWaterBill;
    const currentAnnualTotal = currentMonthlyTotal * 12;
    
    const year1Projections = projections.slice(0, 12);
    const year2Projections = projections.slice(12, 24);
    const year3Projections = projections.slice(24, 36);
    const year4Projections = projections.slice(36, 48);
    const year5Projections = projections.slice(48, 60);
    
    const annualTotals = [
      year1Projections.reduce((sum, p) => sum + p.total, 0),
      year2Projections.length > 0 ? year2Projections.reduce((sum, p) => sum + p.total, 0) : 0,
      year3Projections.length > 0 ? year3Projections.reduce((sum, p) => sum + p.total, 0) : 0,
      year4Projections.length > 0 ? year4Projections.reduce((sum, p) => sum + p.total, 0) : 0,
      year5Projections.length > 0 ? year5Projections.reduce((sum, p) => sum + p.total, 0) : 0,
    ].filter(t => t > 0);
    
    const annualTotalsWithEfficiency = [
      year1Projections.reduce((sum, p) => sum + p.totalWithEfficiency, 0),
      year2Projections.length > 0 ? year2Projections.reduce((sum, p) => sum + p.totalWithEfficiency, 0) : 0,
      year3Projections.length > 0 ? year3Projections.reduce((sum, p) => sum + p.totalWithEfficiency, 0) : 0,
      year4Projections.length > 0 ? year4Projections.reduce((sum, p) => sum + p.totalWithEfficiency, 0) : 0,
      year5Projections.length > 0 ? year5Projections.reduce((sum, p) => sum + p.totalWithEfficiency, 0) : 0,
    ].filter(t => t > 0);
    
    const totalCostWithoutImprovements = projections.reduce((sum, p) => sum + p.total, 0);
    const totalCostWithImprovements = projections.reduce((sum, p) => sum + p.totalWithEfficiency, 0);
    const totalSavings = totalCostWithoutImprovements - totalCostWithImprovements;
    
    const avgMonthlyProjected = totalCostWithoutImprovements / monthsToForecast;
    const avgMonthlyWithEfficiency = totalCostWithImprovements / monthsToForecast;
    
    const costPerLoadCurrent = currentMonthlyTotal / loadsPerMonth;
    const costPerLoadProjected = avgMonthlyProjected / loadsPerMonth;
    const costPerLoadWithEfficiency = avgMonthlyWithEfficiency / loadsPerMonth;
    
    const fiveYearProjection = annualTotals.reduce((sum, t) => sum + t, 0);
    const fiveYearWithEfficiency = annualTotalsWithEfficiency.reduce((sum, t) => sum + t, 0);
    const fiveYearSavings = fiveYearProjection - fiveYearWithEfficiency;
    
    const chartData = projections.map((p, index) => ({
      name: `M${p.month}`,
      month: p.month,
      "Without Improvements": Math.round(p.total),
      "With Improvements": Math.round(p.totalWithEfficiency),
      Electric: Math.round(p.electric),
      Gas: Math.round(p.gas),
      Water: Math.round(p.water),
    }));
    
    const yearlyComparisonData = annualTotals.map((total, index) => ({
      name: `Year ${index + 1}`,
      "Without Improvements": Math.round(total),
      "With Improvements": Math.round(annualTotalsWithEfficiency[index]),
      Savings: Math.round(total - annualTotalsWithEfficiency[index]),
    }));
    
    const utilityBreakdownData = [
      { name: "Electric", value: currentElectricBill, color: CHART_COLORS.electric },
      { name: "Gas", value: currentGasBill, color: CHART_COLORS.gas },
      { name: "Water", value: currentWaterBill, color: CHART_COLORS.water },
    ];
    
    return {
      projections,
      currentMonthlyTotal,
      currentAnnualTotal,
      annualTotals,
      annualTotalsWithEfficiency,
      totalCostWithoutImprovements,
      totalCostWithImprovements,
      totalSavings,
      avgMonthlyProjected,
      avgMonthlyWithEfficiency,
      costPerLoadCurrent,
      costPerLoadProjected,
      costPerLoadWithEfficiency,
      fiveYearProjection,
      fiveYearWithEfficiency,
      fiveYearSavings,
      chartData,
      yearlyComparisonData,
      utilityBreakdownData,
    };
  }, [currentElectricBill, currentGasBill, currentWaterBill, annualRateIncrease, efficiencyImprovement, monthsToForecast, seasonalVariation, loadsPerMonth]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyPrecise = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  return (
    <>
      <SEO
        title="Utility Rate Forecaster Calculator | Laundromat Utility Cost Projections | WashBizHub"
        description="Project your laundromat utility costs over time. Calculate electric, gas, and water bill projections, efficiency savings, and 5-year cost forecasts with seasonal variations."
        canonicalUrl="/utility-rate-forecaster"
        ogType="website"
        keywords={[
          "utility rate forecaster",
          "laundromat utility costs",
          "utility bill calculator",
          "laundromat efficiency calculator",
          "electric bill projections",
          "gas bill forecast",
          "water bill calculator",
          "laundromat operating costs",
          "utility savings calculator",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Utility Rate Forecaster", url: "/utility-rate-forecaster" },
            ]}
          />

          <div className="mb-8 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <LineChartIcon className="w-6 h-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Utility Rate Forecaster
                </h1>
                <p className="text-muted-foreground">
                  Project and optimize your laundromat utility costs over time
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Calculator
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Electric</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-current-electric">
                      {formatCurrency(currentElectricBill)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gas</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-current-gas">
                      {formatCurrency(currentGasBill)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Water</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-current-water">
                      {formatCurrency(currentWaterBill)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Total</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-monthly-total">
                      {formatCurrency(calculations.currentMonthlyTotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-[#C8A661]/30 bg-[#C8A661]/10">
            <Info className="h-4 w-4 text-[#C8A661]" />
            <AlertTitle className="text-[#C8A661]">Understanding Utility Forecasting</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Utility costs typically increase 3-5% annually. Efficiency improvements from modern equipment, LED lighting, 
              and water reclamation can reduce costs by 10-25%. This calculator projects your costs with and without improvements.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-1 bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#C8A661]" />
                  Input Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Monthly Electric Bill
                    </Label>
                    <span className="text-sm font-medium text-[#C8A661]" data-testid="text-electric-value">
                      {formatCurrency(currentElectricBill)}
                    </span>
                  </div>
                  <Slider
                    value={[currentElectricBill]}
                    onValueChange={(value) => setCurrentElectricBill(value[0])}
                    min={100}
                    max={3000}
                    step={25}
                    data-testid="slider-electric-bill"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      Monthly Gas Bill
                    </Label>
                    <span className="text-sm font-medium text-[#C8A661]" data-testid="text-gas-value">
                      {formatCurrency(currentGasBill)}
                    </span>
                  </div>
                  <Slider
                    value={[currentGasBill]}
                    onValueChange={(value) => setCurrentGasBill(value[0])}
                    min={50}
                    max={1500}
                    step={25}
                    data-testid="slider-gas-bill"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Monthly Water Bill
                    </Label>
                    <span className="text-sm font-medium text-[#C8A661]" data-testid="text-water-value">
                      {formatCurrency(currentWaterBill)}
                    </span>
                  </div>
                  <Slider
                    value={[currentWaterBill]}
                    onValueChange={(value) => setCurrentWaterBill(value[0])}
                    min={50}
                    max={1000}
                    step={25}
                    data-testid="slider-water-bill"
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      Annual Rate Increase
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Expected annual increase in utility rates. Historical average is 3-5%.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <span className="text-sm font-medium text-[#C8A661]" data-testid="text-rate-increase-value">
                      {annualRateIncrease}%
                    </span>
                  </div>
                  <Slider
                    value={[annualRateIncrease]}
                    onValueChange={(value) => setAnnualRateIncrease(value[0])}
                    min={0}
                    max={15}
                    step={0.5}
                    data-testid="slider-rate-increase"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      Efficiency Improvement
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Expected reduction from upgrades like high-efficiency machines, LED lighting, or water reclamation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <span className="text-sm font-medium text-green-600" data-testid="text-efficiency-value">
                      {efficiencyImprovement}%
                    </span>
                  </div>
                  <Slider
                    value={[efficiencyImprovement]}
                    onValueChange={(value) => setEfficiencyImprovement(value[0])}
                    min={0}
                    max={40}
                    step={1}
                    data-testid="slider-efficiency"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Months to Forecast
                    </Label>
                    <span className="text-sm font-medium text-[#C8A661]" data-testid="text-months-value">
                      {monthsToForecast} months
                    </span>
                  </div>
                  <Slider
                    value={[monthsToForecast]}
                    onValueChange={(value) => setMonthsToForecast(value[0])}
                    min={12}
                    max={60}
                    step={6}
                    data-testid="slider-months"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Seasonal Variation
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">How much seasonal changes affect your utility costs. Higher = more variation between summer/winter.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <span className="text-sm font-medium text-[#C8A661]" data-testid="text-seasonal-value">
                      {seasonalVariation}%
                    </span>
                  </div>
                  <Slider
                    value={[seasonalVariation]}
                    onValueChange={(value) => setSeasonalVariation(value[0])}
                    min={0}
                    max={50}
                    step={5}
                    data-testid="slider-seasonal"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Loads per Month
                    </Label>
                    <span className="text-sm font-medium text-[#C8A661]" data-testid="text-loads-value">
                      {loadsPerMonth.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[loadsPerMonth]}
                    onValueChange={(value) => setLoadsPerMonth(value[0])}
                    min={1000}
                    max={15000}
                    step={500}
                    data-testid="slider-loads"
                  />
                </div>

                <Button 
                  onClick={handleCalculate}
                  className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                  data-testid="button-calculate"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Projections
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C8A661]" />
                  Key Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Current Annual</div>
                    <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-current-annual">
                      {formatCurrency(calculations.currentAnnualTotal)}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Avg Monthly (Projected)</div>
                    <div className="text-2xl font-bold text-foreground" data-testid="text-avg-monthly-projected">
                      {formatCurrency(calculations.avgMonthlyProjected)}
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Avg w/ Efficiency</div>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-avg-with-efficiency">
                      {formatCurrency(calculations.avgMonthlyWithEfficiency)}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total ({monthsToForecast}mo)</div>
                    <div className="text-2xl font-bold text-foreground" data-testid="text-total-without">
                      {formatCurrency(calculations.totalCostWithoutImprovements)}
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">With Improvements</div>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-total-with">
                      {formatCurrency(calculations.totalCostWithImprovements)}
                    </div>
                  </div>
                  
                  <div className="bg-[#C8A661]/10 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total Savings</div>
                    <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-savings">
                      {formatCurrency(calculations.totalSavings)}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Cost/Load (Current)</div>
                    <div className="text-xl font-bold text-foreground" data-testid="text-cost-per-load-current">
                      {formatCurrencyPrecise(calculations.costPerLoadCurrent)}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Cost/Load (Projected)</div>
                    <div className="text-xl font-bold text-foreground" data-testid="text-cost-per-load-projected">
                      {formatCurrencyPrecise(calculations.costPerLoadProjected)}
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Cost/Load (w/ Eff.)</div>
                    <div className="text-xl font-bold text-green-600" data-testid="text-cost-per-load-efficiency">
                      {formatCurrencyPrecise(calculations.costPerLoadWithEfficiency)}
                    </div>
                  </div>
                </div>

                <Card className="bg-[#0A1628] text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-300 text-sm mb-1">5-Year Projection Savings</div>
                        <div className="text-3xl font-bold text-[#C8A661]" data-testid="text-five-year-savings">
                          {formatCurrency(calculations.fiveYearSavings)}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {formatCurrency(calculations.fiveYearProjection)} → {formatCurrency(calculations.fiveYearWithEfficiency)}
                        </div>
                      </div>
                      <div className="text-right">
                        <PiggyBank className="w-12 h-12 text-[#C8A661] mb-2" />
                        <Badge className="bg-[#C8A661] text-[#0A1628]">
                          {efficiencyImprovement}% Saved
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends" data-testid="tab-trends">
                <LineChartIcon className="w-4 h-4 mr-2" />
                Utility Trends
              </TabsTrigger>
              <TabsTrigger value="comparison" data-testid="tab-comparison">
                <BarChart3 className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="yearly" data-testid="tab-yearly">
                <Calendar className="w-4 h-4 mr-2" />
                Annual Totals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="mt-4">
              <Card className="bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle data-testid="text-chart-trends-title">Utility Cost Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]" data-testid="chart-trends">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calculations.chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Month ${label.replace('M', '')}`}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="Electric" 
                          stackId="1"
                          stroke={CHART_COLORS.electric} 
                          fill={CHART_COLORS.electric}
                          fillOpacity={0.6}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Gas" 
                          stackId="1"
                          stroke={CHART_COLORS.gas} 
                          fill={CHART_COLORS.gas}
                          fillOpacity={0.6}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Water" 
                          stackId="1"
                          stroke={CHART_COLORS.water} 
                          fill={CHART_COLORS.water}
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="mt-4">
              <Card className="bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle data-testid="text-chart-comparison-title">With vs Without Efficiency Improvements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]" data-testid="chart-comparison">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calculations.chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Month ${label.replace('M', '')}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Without Improvements" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="With Improvements" 
                          stroke="#22C55E" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="yearly" className="mt-4">
              <Card className="bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle data-testid="text-chart-yearly-title">Annual Cost Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]" data-testid="chart-yearly">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={calculations.yearlyComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar dataKey="Without Improvements" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="With Improvements" fill="#22C55E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Efficiency Improvement Ideas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>High-efficiency washers</strong> - Reduce water usage by 30-50%
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>LED lighting upgrade</strong> - Cut lighting costs by 50-75%
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Water reclamation</strong> - Reuse 50%+ of rinse water
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Solar panels</strong> - Offset 20-40% of electric costs
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Heat recovery</strong> - Capture dryer heat for water pre-heating
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Industry Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Utilities % of Revenue</span>
                  <Badge variant="outline">15-25%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Electric Bill Range</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                    $0.12-0.25/load
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gas Bill Range</span>
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                    $0.08-0.15/load
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Water/Sewer Range</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                    $0.05-0.12/load
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Annual Rate Increase</span>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                    3-5% typical
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C8A661]" />
                Annual Projections Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-annual-projections">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Year</th>
                      <th className="text-right py-3 px-2 font-medium">Without Improvements</th>
                      <th className="text-right py-3 px-2 font-medium">With Improvements</th>
                      <th className="text-right py-3 px-2 font-medium text-green-600">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.yearlyComparisonData.map((year, index) => (
                      <tr key={year.name} className="border-b" data-testid={`row-year-${index + 1}`}>
                        <td className="py-3 px-2 font-medium">{year.name}</td>
                        <td className="py-3 px-2 text-right" data-testid={`text-year-${index + 1}-without`}>
                          {formatCurrency(year["Without Improvements"])}
                        </td>
                        <td className="py-3 px-2 text-right text-green-600" data-testid={`text-year-${index + 1}-with`}>
                          {formatCurrency(year["With Improvements"])}
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-[#C8A661]" data-testid={`text-year-${index + 1}-savings`}>
                          {formatCurrency(year.Savings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50 font-medium">
                      <td className="py-3 px-2">Total</td>
                      <td className="py-3 px-2 text-right" data-testid="text-total-projected-all-years">
                        {formatCurrency(calculations.fiveYearProjection)}
                      </td>
                      <td className="py-3 px-2 text-right text-green-600" data-testid="text-total-with-efficiency-all-years">
                        {formatCurrency(calculations.fiveYearWithEfficiency)}
                      </td>
                      <td className="py-3 px-2 text-right text-[#C8A661]" data-testid="text-total-savings-all-years">
                        {formatCurrency(calculations.fiveYearSavings)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}
