/**
 * WDF Margin Master - Wash-Dry-Fold Profitability Calculator
 * Premium gated tool with blurred preview for non-subscribers
 */

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  Calculator, Lock, TrendingUp, DollarSign, Users, Truck, 
  AlertTriangle, CheckCircle, BarChart3, PieChart, Zap,
  ArrowRight, Crown
} from "lucide-react";
import { StickyConsultationBar } from "@/components/StickyConsultationBar";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine, Legend 
} from "recharts";
import { Helmet } from "react-helmet-async";
import calculatorBgUrl from "@assets/generated_images/calculator_results_premium_background.png";

interface WDFInputs {
  monthlyPounds: number;
  pricePerPound: number;
  laborHourlyRate: number;
  poundsPerHour: number;
  supplyPct: number;
  utilityPct: number;
  includeVehicle: boolean;
  vehicleMonthly: number;
  fuelMonthly: number;
  insuranceMonthly: number;
  pickupDropoffFee: number;
  avgOrderWeight: number;
}

const defaultInputs: WDFInputs = {
  monthlyPounds: 5000,
  pricePerPound: 1.75,
  laborHourlyRate: 16,
  poundsPerHour: 35,
  supplyPct: 5,
  utilityPct: 8,
  includeVehicle: true,
  vehicleMonthly: 450,
  fuelMonthly: 300,
  insuranceMonthly: 150,
  pickupDropoffFee: 5,
  avgOrderWeight: 25,
};

function PremiumGate() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-xl">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
          <Lock className="h-8 w-8 text-[#C8A661]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Premium Tool</h3>
        <p className="text-slate-400 mb-6">
          WDF Margin Master is available with All-Access subscription. 
          Unlock powerful profitability analysis for your Wash-Dry-Fold business.
        </p>
        <div className="space-y-3">
          <Link href="/pricing">
            <Button className="w-full bg-[#C8A661] hover:bg-[#b8963f] text-slate-900 font-semibold" data-testid="button-unlock-wdf">
              <Crown className="h-4 w-4 mr-2" />
              Unlock with All-Access - $149/mo
            </Button>
          </Link>
          <p className="text-xs text-slate-500">
            Includes 50+ calculators, CLEANBI Pro, Service Guy AI & more
          </p>
        </div>
      </div>
    </div>
  );
}

function BlurredPreview() {
  return (
    <div className="blur-sm pointer-events-none select-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#C8A661]">$8,750</div>
            <p className="text-sm text-slate-400">5,000 lbs × $1.75/lb</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">$3,625</div>
            <p className="text-sm text-slate-400">41.4% margin</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Break-Even</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">2,143 lbs</div>
            <p className="text-sm text-slate-400">Per month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 h-64 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex items-center justify-center h-full text-slate-500">
          Break-Even Chart Preview
        </div>
      </div>
    </div>
  );
}

function WDFCalculator({ inputs, setInputs }: { inputs: WDFInputs; setInputs: (i: WDFInputs) => void }) {
  const calculations = useMemo(() => {
    const monthlyRevenue = inputs.monthlyPounds * inputs.pricePerPound;
    const laborHours = inputs.monthlyPounds / inputs.poundsPerHour;
    const laborCost = laborHours * inputs.laborHourlyRate;
    const supplyCost = monthlyRevenue * (inputs.supplyPct / 100);
    const utilityCost = monthlyRevenue * (inputs.utilityPct / 100);
    
    let vehicleCost = 0;
    let pickupRevenue = 0;
    if (inputs.includeVehicle) {
      vehicleCost = inputs.vehicleMonthly + inputs.fuelMonthly + inputs.insuranceMonthly;
      const ordersPerMonth = inputs.monthlyPounds / inputs.avgOrderWeight;
      pickupRevenue = ordersPerMonth * inputs.pickupDropoffFee * 2;
    }
    
    const totalCosts = laborCost + supplyCost + utilityCost + vehicleCost;
    const totalRevenue = monthlyRevenue + pickupRevenue;
    const netProfit = totalRevenue - totalCosts;
    const marginPct = (netProfit / totalRevenue) * 100;
    
    const fixedCosts = vehicleCost;
    const variableCostPerPound = (laborCost + supplyCost + utilityCost) / inputs.monthlyPounds;
    const revenuePerPound = inputs.pricePerPound + (pickupRevenue / inputs.monthlyPounds);
    const breakEvenPounds = fixedCosts / (revenuePerPound - variableCostPerPound);
    
    const chartData = Array.from({ length: 12 }, (_, i) => {
      const pounds = (i + 1) * 1000;
      const rev = pounds * revenuePerPound;
      const varCost = pounds * variableCostPerPound;
      const totalCost = fixedCosts + varCost;
      return {
        pounds,
        revenue: rev,
        costs: totalCost,
        profit: rev - totalCost,
      };
    });
    
    return {
      monthlyRevenue,
      pickupRevenue,
      totalRevenue,
      laborCost,
      laborHours,
      supplyCost,
      utilityCost,
      vehicleCost,
      totalCosts,
      netProfit,
      marginPct,
      breakEvenPounds,
      chartData,
    };
  }, [inputs]);
  
  const updateInput = (key: keyof WDFInputs, value: number | boolean) => {
    setInputs({ ...inputs, [key]: value });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/90 backdrop-blur-sm border border-[#C8A661]/40 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#C8A661]" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#C8A661]" data-testid="text-wdf-revenue">
              ${calculations.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              WDF: ${calculations.monthlyRevenue.toFixed(0)} | P&D: ${calculations.pickupRevenue.toFixed(0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/90 backdrop-blur-sm border border-green-500/40 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${calculations.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} data-testid="text-wdf-profit">
              ${calculations.netProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {calculations.marginPct.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/90 backdrop-blur-sm border border-blue-500/40 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Break-Even
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400" data-testid="text-wdf-breakeven">
              {Math.round(calculations.breakEvenPounds).toLocaleString()} lbs
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Per month to cover costs
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/90 backdrop-blur-sm border border-purple-500/40 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Labor Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {calculations.laborHours.toFixed(1)} hrs
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ${calculations.laborCost.toFixed(0)} labor cost
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">WDF Inputs</CardTitle>
            <CardDescription>Adjust your business parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="monthlyPounds" className="text-sm font-medium">
                Monthly Pounds: {inputs.monthlyPounds.toLocaleString()}
              </Label>
              <Slider
                id="monthlyPounds"
                value={[inputs.monthlyPounds]}
                onValueChange={(v) => updateInput('monthlyPounds', v[0])}
                min={500}
                max={20000}
                step={100}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="pricePerPound" className="text-sm font-medium">
                Price per Pound: ${inputs.pricePerPound.toFixed(2)}
              </Label>
              <Slider
                id="pricePerPound"
                value={[inputs.pricePerPound * 100]}
                onValueChange={(v) => updateInput('pricePerPound', v[0] / 100)}
                min={100}
                max={350}
                step={5}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="laborRate" className="text-sm font-medium">
                Labor Rate: ${inputs.laborHourlyRate}/hr
              </Label>
              <Slider
                id="laborRate"
                value={[inputs.laborHourlyRate]}
                onValueChange={(v) => updateInput('laborHourlyRate', v[0])}
                min={12}
                max={30}
                step={0.5}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="poundsPerHour" className="text-sm font-medium">
                Productivity: {inputs.poundsPerHour} lbs/hour
              </Label>
              <Slider
                id="poundsPerHour"
                value={[inputs.poundsPerHour]}
                onValueChange={(v) => updateInput('poundsPerHour', v[0])}
                min={20}
                max={60}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Supply Cost: {inputs.supplyPct}%</Label>
                <Slider
                  value={[inputs.supplyPct]}
                  onValueChange={(v) => updateInput('supplyPct', v[0])}
                  min={2}
                  max={12}
                  step={0.5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Utility Cost: {inputs.utilityPct}%</Label>
                <Slider
                  value={[inputs.utilityPct]}
                  onValueChange={(v) => updateInput('utilityPct', v[0])}
                  min={4}
                  max={15}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#C8A661]" />
              Break-Even Analysis
            </CardTitle>
            <CardDescription>Revenue vs. Costs by Volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculations.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="pounds" 
                    stroke="#9CA3AF"
                    tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(0)}`, '']}
                    labelFormatter={(label) => `${label.toLocaleString()} lbs`}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Legend />
                  <ReferenceLine 
                    x={Math.round(calculations.breakEvenPounds)} 
                    stroke="#F59E0B" 
                    strokeDasharray="5 5"
                    label={{ value: 'Break-Even', fill: '#F59E0B', fontSize: 12 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue"
                    stroke="#22C55E" 
                    fill="#22C55E20"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    name="Costs"
                    stroke="#EF4444" 
                    fill="#EF444420"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#C8A661]" />
                Pickup & Delivery
              </CardTitle>
              <CardDescription>Add vehicle expenses and delivery fees</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="vehicle-toggle" className="text-sm">Include P&D</Label>
              <Switch
                id="vehicle-toggle"
                checked={inputs.includeVehicle}
                onCheckedChange={(v) => updateInput('includeVehicle', v)}
                data-testid="switch-vehicle"
              />
            </div>
          </div>
        </CardHeader>
        {inputs.includeVehicle && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label className="text-sm">Vehicle Payment</Label>
                <Input
                  type="number"
                  value={inputs.vehicleMonthly}
                  onChange={(e) => updateInput('vehicleMonthly', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Fuel/Month</Label>
                <Input
                  type="number"
                  value={inputs.fuelMonthly}
                  onChange={(e) => updateInput('fuelMonthly', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Insurance</Label>
                <Input
                  type="number"
                  value={inputs.insuranceMonthly}
                  onChange={(e) => updateInput('insuranceMonthly', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">P&D Fee (each way)</Label>
                <Input
                  type="number"
                  value={inputs.pickupDropoffFee}
                  onChange={(e) => updateInput('pickupDropoffFee', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Avg Order (lbs)</Label>
                <Input
                  type="number"
                  value={inputs.avgOrderWeight}
                  onChange={(e) => updateInput('avgOrderWeight', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-lg bg-muted/50 flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">Monthly Vehicle Costs:</span>
                <span className="ml-2 font-semibold text-red-400">
                  ${calculations.vehicleCost.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">P&D Revenue:</span>
                <span className="ml-2 font-semibold text-green-400">
                  +${calculations.pickupRevenue.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Net P&D Impact:</span>
                <span className={`ml-2 font-semibold ${calculations.pickupRevenue - calculations.vehicleCost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(calculations.pickupRevenue - calculations.vehicleCost).toFixed(0)}
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700">
        <CardContent className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Labor</div>
              <div className="text-lg font-semibold text-red-400">${calculations.laborCost.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Supplies</div>
              <div className="text-lg font-semibold text-red-400">${calculations.supplyCost.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Utilities</div>
              <div className="text-lg font-semibold text-red-400">${calculations.utilityCost.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Vehicle</div>
              <div className="text-lg font-semibold text-red-400">${calculations.vehicleCost.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Costs</div>
              <div className="text-lg font-bold text-red-500">${calculations.totalCosts.toFixed(0)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WDFMarginMaster() {
  const { isAuthenticated, user } = useAuth();
  const [inputs, setInputs] = useState<WDFInputs>(defaultInputs);
  
  const hasAccess = isAuthenticated && (
    user?.subscriptionTier === 'business' ||
    user?.subscriptionTier === 'enterprise' ||
    user?.subscriptionTier === 'pro'
  );
  
  return (
    <>
      <Helmet>
        <title>WDF Margin Master - Wash-Dry-Fold Profitability Calculator | WashBizHub</title>
        <meta name="description" content="Calculate Wash-Dry-Fold profitability with labor costs, vehicle expenses, break-even analysis, and margin projections. Premium tool for laundromat owners." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#C8A661]/20 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">
                  WDF Margin Master
                </h1>
                <p className="text-slate-400">
                  Wash-Dry-Fold Profitability Calculator
                </p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Link href="/funding">
                  <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20" data-testid="button-get-funding">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Get Funding
                  </Button>
                </Link>
                <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Premium background for calculator results */}
            <div 
              className="absolute inset-0 opacity-[0.12] pointer-events-none rounded-2xl overflow-hidden"
              style={{ 
                backgroundImage: `url(${calculatorBgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="relative">
              {!hasAccess && <PremiumGate />}
              {!hasAccess ? (
                <BlurredPreview />
              ) : (
                <WDFCalculator inputs={inputs} setInputs={setInputs} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <StickyConsultationBar context="wdf" />
    </>
  );
}
