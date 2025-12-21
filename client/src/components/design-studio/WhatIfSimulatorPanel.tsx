import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, TrendingDown, Minus, 
  DollarSign, Calculator, BarChart3, RefreshCcw, 
  Sparkles, Target, Percent, Users,
  Building, Wrench, Zap, Banknote, Clock, Save
} from "lucide-react";

interface Variable {
  id: string;
  name: string;
  icon: typeof DollarSign;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: "currency" | "percent" | "number" | "days" | "hours";
  description: string;
  category: "revenue" | "cost" | "operations" | "growth";
}

const VARIABLES: Variable[] = [
  {
    id: "avgTicket",
    name: "Avg Transaction",
    icon: DollarSign,
    min: 8,
    max: 30,
    step: 0.50,
    defaultValue: 12,
    unit: "currency",
    description: "Average customer spend",
    category: "revenue",
  },
  {
    id: "dailyCustomers",
    name: "Daily Customers",
    icon: Users,
    min: 20,
    max: 200,
    step: 5,
    defaultValue: 75,
    unit: "number",
    description: "Customers per day",
    category: "revenue",
  },
  {
    id: "operatingDays",
    name: "Days/Week",
    icon: Clock,
    min: 5,
    max: 7,
    step: 1,
    defaultValue: 7,
    unit: "days",
    description: "Days open per week",
    category: "operations",
  },
  {
    id: "monthlyRent",
    name: "Monthly Rent",
    icon: Building,
    min: 1500,
    max: 8000,
    step: 100,
    defaultValue: 3000,
    unit: "currency",
    description: "Monthly lease",
    category: "cost",
  },
  {
    id: "laborCostPercent",
    name: "Labor %",
    icon: Users,
    min: 10,
    max: 35,
    step: 1,
    defaultValue: 18,
    unit: "percent",
    description: "Labor as % of revenue",
    category: "cost",
  },
  {
    id: "utilityCostPercent",
    name: "Utility %",
    icon: Zap,
    min: 8,
    max: 20,
    step: 0.5,
    defaultValue: 12,
    unit: "percent",
    description: "Utilities as % of revenue",
    category: "cost",
  },
  {
    id: "supplyCostPercent",
    name: "Supply %",
    icon: Wrench,
    min: 3,
    max: 12,
    step: 0.5,
    defaultValue: 5,
    unit: "percent",
    description: "Supplies as % of revenue",
    category: "cost",
  },
  {
    id: "wdfRevenue",
    name: "WDF Revenue",
    icon: Banknote,
    min: 0,
    max: 10000,
    step: 250,
    defaultValue: 2500,
    unit: "currency",
    description: "Wash-dry-fold monthly",
    category: "revenue",
  },
  {
    id: "priceIncrease",
    name: "Price Increase",
    icon: Percent,
    min: 0,
    max: 25,
    step: 1,
    defaultValue: 0,
    unit: "percent",
    description: "Vend price increase",
    category: "growth",
  },
  {
    id: "customerGrowth",
    name: "Customer Growth",
    icon: TrendingUp,
    min: -15,
    max: 25,
    step: 1,
    defaultValue: 0,
    unit: "percent",
    description: "Expected growth rate",
    category: "growth",
  },
];

interface WhatIfSimulatorPanelProps {
  equipmentMonthlyRevenue: number;
  equipmentCost: number;
  washerCount: number;
  dryerCount: number;
  sqft: number;
}

export function WhatIfSimulatorPanel({
  equipmentMonthlyRevenue,
  equipmentCost,
  washerCount,
  dryerCount,
  sqft,
}: WhatIfSimulatorPanelProps) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    VARIABLES.forEach(v => { initial[v.id] = v.defaultValue; });
    return initial;
  });

  const [showBaseline, setShowBaseline] = useState(false);

  const updateValue = useCallback((id: string, value: number) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    const initial: Record<string, number> = {};
    VARIABLES.forEach(v => { initial[v.id] = v.defaultValue; });
    setValues(initial);
  }, []);

  const formatValue = useCallback((value: number, unit: Variable["unit"]) => {
    switch (unit) {
      case "currency":
        return `$${value.toLocaleString()}`;
      case "percent":
        return `${value}%`;
      case "days":
        return `${value}`;
      case "hours":
        return `${value}h`;
      default:
        return value.toLocaleString();
    }
  }, []);

  // Calculations using equipment data + simulator variables
  // Following laundromat industry conventions for revenue and EBITDA
  const calculations = useMemo(() => {
    const {
      avgTicket, dailyCustomers, operatingDays, monthlyRent,
      laborCostPercent, utilityCostPercent, supplyCostPercent,
      wdfRevenue, priceIncrease, customerGrowth
    } = values;

    // Apply scenario adjustments
    const adjustedTicket = avgTicket * (1 + priceIncrease / 100);
    const adjustedCustomers = Math.max(1, dailyCustomers * (1 + customerGrowth / 100));
    const daysPerMonth = operatingDays * 4.33;
    
    // Equipment-based revenue calculation using machine throughput
    // Total daily cycles = adjustedCustomers (each customer = 1 wash + 1 dry cycle)
    // Revenue = customers * avgTicket (ticket covers full visit)
    const totalMachines = washerCount + dryerCount;
    
    let vendRevenue: number;
    let servedCustomers: number = adjustedCustomers;
    
    if (totalMachines > 0) {
      // Machine capacity model: check if we can serve all customers
      // Assume each customer needs 1 washer turn + 1 dryer turn
      // Max daily capacity = min(washers, dryers) * maxTurnsPerMachine
      const maxTurnsPerMachine = 8; // Industry standard for high-utilization
      const washerCapacity = washerCount * maxTurnsPerMachine;
      const dryerCapacity = dryerCount > 0 ? dryerCount * maxTurnsPerMachine : washerCapacity; // If no dryers, assume self-dry
      const maxDailyCustomers = Math.min(washerCapacity, dryerCapacity);
      
      // Actual served customers = min(demand, capacity)
      servedCustomers = Math.min(adjustedCustomers, maxDailyCustomers);
      
      // Daily revenue = customers served * average ticket
      const dailyVendRevenue = servedCustomers * adjustedTicket;
      
      // Monthly revenue
      vendRevenue = dailyVendRevenue * daysPerMonth;
      
      // Equipment data used only as ceiling cap (prevent over-optimistic projections)
      // No floor - allow revenue to decline in proportion to servedCustomers
      if (equipmentMonthlyRevenue > 0 && vendRevenue > equipmentMonthlyRevenue * 2) {
        vendRevenue = equipmentMonthlyRevenue * 2;
      }
    } else {
      // No equipment placed - pure calculation from inputs
      const dailyVendRevenue = adjustedTicket * adjustedCustomers;
      vendRevenue = dailyVendRevenue * daysPerMonth;
    }
    
    const totalMonthlyRevenue = vendRevenue + wdfRevenue;
    const annualRevenue = totalMonthlyRevenue * 12;

    // Costs (as percentage of revenue)
    const laborCost = totalMonthlyRevenue * (laborCostPercent / 100);
    const utilityCost = totalMonthlyRevenue * (utilityCostPercent / 100);
    const supplyCost = totalMonthlyRevenue * (supplyCostPercent / 100);
    const insuranceCost = totalMonthlyRevenue * 0.02;
    const maintenanceCost = totalMonthlyRevenue * 0.03;
    const totalCosts = monthlyRent + laborCost + utilityCost + supplyCost + insuranceCost + maintenanceCost;

    // Profitability
    const monthlyNetIncome = totalMonthlyRevenue - totalCosts;
    const annualNetIncome = monthlyNetIncome * 12;
    const profitMargin = totalMonthlyRevenue > 0 ? (monthlyNetIncome / totalMonthlyRevenue) * 100 : 0;
    
    // EBITDA for laundromats: Net Income + Owner Comp (assumed 0 for analysis) + Interest + Taxes + Depreciation + Amortization
    // Simplified: Operating Income + Depreciation (typically 8-10% of equipment cost annually)
    const annualDepreciation = equipmentCost > 0 ? equipmentCost * 0.08 : annualRevenue * 0.05;
    const annualEBITDA = annualNetIncome + annualDepreciation;
    const valuation3x = annualEBITDA * 3;
    const valuation4x = annualEBITDA * 4;
    
    // Efficiency metrics with guards against NaN/Infinity
    const rentToRevenue = totalMonthlyRevenue > 0 ? (monthlyRent / totalMonthlyRevenue) * 100 : 0;
    const revenuePerSqft = sqft > 0 ? annualRevenue / sqft : 0;
    const paybackYears = (annualNetIncome > 0 && equipmentCost > 0) 
      ? Math.min(99, equipmentCost / annualNetIncome) 
      : (equipmentCost > 0 ? 99 : 0);

    // Calculate turns per machine for display (servedCustomers / totalMachines)
    const turnsPerMachinePerDay = totalMachines > 0 
      ? servedCustomers / totalMachines 
      : adjustedCustomers / Math.max(1, washerCount || 1);

    return {
      monthlyRevenue: totalMonthlyRevenue,
      annualRevenue,
      monthlyNetIncome,
      annualNetIncome,
      profitMargin,
      annualEBITDA,
      valuation3x,
      valuation4x,
      laborCost,
      utilityCost,
      supplyCost,
      totalCosts,
      rentToRevenue,
      revenuePerSqft,
      paybackYears,
      turnsPerMachinePerDay,
    };
  }, [values, equipmentMonthlyRevenue, equipmentCost, sqft, washerCount, dryerCount]);

  // Baseline calculations (frozen snapshot using default values)
  const baselineCalcs = useMemo(() => {
    const defaults: Record<string, number> = {};
    VARIABLES.forEach(v => { defaults[v.id] = v.defaultValue; });
    
    const {
      avgTicket, dailyCustomers, operatingDays, monthlyRent,
      laborCostPercent, utilityCostPercent, supplyCostPercent,
      wdfRevenue
    } = defaults;

    const daysPerMonth = operatingDays * 4.33;
    
    // Use equipment revenue directly as baseline (no scaling)
    const vendRevenue = equipmentMonthlyRevenue > 0 
      ? equipmentMonthlyRevenue 
      : avgTicket * dailyCustomers * daysPerMonth;
    
    const totalMonthlyRevenue = vendRevenue + wdfRevenue;
    const annualRevenue = totalMonthlyRevenue * 12;
    
    // Costs
    const laborCost = totalMonthlyRevenue * (laborCostPercent / 100);
    const utilityCost = totalMonthlyRevenue * (utilityCostPercent / 100);
    const supplyCost = totalMonthlyRevenue * (supplyCostPercent / 100);
    const insuranceCost = totalMonthlyRevenue * 0.02;
    const maintenanceCost = totalMonthlyRevenue * 0.03;
    const totalCosts = monthlyRent + laborCost + utilityCost + supplyCost + insuranceCost + maintenanceCost;
    
    const monthlyNetIncome = totalMonthlyRevenue - totalCosts;
    const annualNetIncome = monthlyNetIncome * 12;
    const profitMargin = totalMonthlyRevenue > 0 ? (monthlyNetIncome / totalMonthlyRevenue) * 100 : 0;
    
    // EBITDA
    const annualDepreciation = equipmentCost > 0 ? equipmentCost * 0.08 : annualRevenue * 0.05;
    const annualEBITDA = annualNetIncome + annualDepreciation;
    const valuation3x = annualEBITDA * 3;
    const valuation4x = annualEBITDA * 4;
    
    // Efficiency
    const rentToRevenue = totalMonthlyRevenue > 0 ? (monthlyRent / totalMonthlyRevenue) * 100 : 0;
    const revenuePerSqft = sqft > 0 ? annualRevenue / sqft : 0;
    const paybackYears = (annualNetIncome > 0 && equipmentCost > 0) 
      ? Math.min(99, equipmentCost / annualNetIncome) 
      : (equipmentCost > 0 ? 99 : 0);

    return {
      monthlyRevenue: totalMonthlyRevenue,
      annualRevenue,
      monthlyNetIncome,
      annualNetIncome,
      profitMargin,
      annualEBITDA,
      valuation3x,
      valuation4x,
      totalCosts,
      rentToRevenue,
      revenuePerSqft,
      paybackYears,
    };
  }, [equipmentMonthlyRevenue, equipmentCost, sqft]);

  const getDelta = (current: number, baseline: number) => {
    if (!showBaseline) return null;
    const delta = current - baseline;
    const percent = baseline !== 0 ? ((current - baseline) / baseline) * 100 : 0;
    return { delta, percent };
  };

  const DeltaBadge = ({ current, baseline }: { current: number; baseline: number }) => {
    const result = getDelta(current, baseline);
    if (!result || !showBaseline) return null;
    
    const { delta, percent } = result;
    if (Math.abs(percent) < 0.5) return null;
    
    const isPositive = delta > 0;
    return (
      <Badge 
        variant="outline" 
        className={`text-[9px] px-1 py-0 ${isPositive ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'}`}
      >
        {isPositive ? '+' : ''}{percent.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-4 pr-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-white/80 text-xs font-medium">What-If Simulator</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Switch
                id="baseline"
                checked={showBaseline}
                onCheckedChange={setShowBaseline}
                className="scale-75"
              />
              <Label htmlFor="baseline" className="text-[9px] text-white/60">Compare</Label>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetToDefaults}
              className="h-6 px-2 text-[10px] text-white/60"
              data-testid="button-reset-whatif"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Equipment Context */}
        <div className="bg-white/5 rounded-lg p-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-white/50">Washers</p>
              <p className="text-sm font-bold text-blue-400">{washerCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/50">Dryers</p>
              <p className="text-sm font-bold text-orange-400">{dryerCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/50">Eq. Revenue</p>
              <p className="text-sm font-bold text-green-400">${Math.round(equipmentMonthlyRevenue).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Variable Sliders - Compact Grid */}
        <div className="space-y-3">
          {VARIABLES.map((variable) => {
            const Icon = variable.icon;
            const value = values[variable.id];
            const categoryColors: Record<string, string> = {
              revenue: "text-green-400",
              cost: "text-red-400",
              operations: "text-blue-400",
              growth: "text-purple-400",
            };
            
            return (
              <div key={variable.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Icon className={`h-3 w-3 ${categoryColors[variable.category]}`} />
                    <span className="text-[10px] text-white/70">{variable.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-white/20 text-white">
                    {formatValue(value, variable.unit)}
                  </Badge>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={([v]) => updateValue(variable.id, v)}
                  min={variable.min}
                  max={variable.max}
                  step={variable.step}
                  className="h-1"
                  data-testid={`slider-${variable.id}`}
                />
              </div>
            );
          })}
        </div>

        <Separator className="bg-white/10" />

        {/* Results Dashboard */}
        <div className="space-y-3">
          <div className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Projected Results
          </div>
          
          {/* Revenue Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-lg p-2 border border-green-500/20">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-white/50">Monthly Revenue</p>
                <DeltaBadge current={calculations.monthlyRevenue} baseline={baselineCalcs.monthlyRevenue} />
              </div>
              <p className="text-base font-bold text-green-400">
                ${Math.round(calculations.monthlyRevenue).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-lg p-2 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-white/50">Annual Revenue</p>
                <DeltaBadge current={calculations.annualRevenue} baseline={baselineCalcs.annualRevenue} />
              </div>
              <p className="text-base font-bold text-emerald-400">
                ${Math.round(calculations.annualRevenue).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Profit Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-lg p-2 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-white/50">Monthly Net</p>
                <DeltaBadge current={calculations.monthlyNetIncome} baseline={baselineCalcs.monthlyNetIncome} />
              </div>
              <p className={`text-base font-bold ${calculations.monthlyNetIncome >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                ${Math.round(calculations.monthlyNetIncome).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/10 rounded-lg p-2 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-white/50">Profit Margin</p>
                {showBaseline && Math.abs(calculations.profitMargin - baselineCalcs.profitMargin) > 0.5 && (
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] px-1 py-0 ${calculations.profitMargin > baselineCalcs.profitMargin ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'}`}
                  >
                    {calculations.profitMargin > baselineCalcs.profitMargin ? '+' : ''}{(calculations.profitMargin - baselineCalcs.profitMargin).toFixed(1)}%
                  </Badge>
                )}
              </div>
              <p className={`text-base font-bold ${calculations.profitMargin >= 20 ? 'text-purple-400' : calculations.profitMargin >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                {calculations.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-[9px] text-white/50 mb-2">Monthly Cost Breakdown</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Rent</span>
                <span className="text-white">${values.monthlyRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Labor</span>
                <span className="text-white">${Math.round(calculations.laborCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Utilities</span>
                <span className="text-white">${Math.round(calculations.utilityCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Supplies</span>
                <span className="text-white">${Math.round(calculations.supplyCost).toLocaleString()}</span>
              </div>
              <Separator className="bg-white/10 my-1" />
              <div className="flex justify-between text-[10px] font-medium">
                <span className="text-white/80">Total Costs</span>
                <span className="text-red-400">${Math.round(calculations.totalCosts).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Valuation & ROI */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-lg p-2 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-white/50">3x EBITDA Value</p>
                <DeltaBadge current={calculations.valuation3x} baseline={baselineCalcs.valuation3x} />
              </div>
              <p className="text-sm font-bold text-amber-400">
                ${Math.round(calculations.valuation3x).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-lg p-2 border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-white/50">4x EBITDA Value</p>
                <DeltaBadge current={calculations.valuation4x} baseline={baselineCalcs.valuation4x} />
              </div>
              <p className="text-sm font-bold text-yellow-400">
                ${Math.round(calculations.valuation4x).toLocaleString()}
              </p>
            </div>
          </div>

          {/* EBITDA */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-lg p-2 border border-indigo-500/20">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-white/50">Annual EBITDA</p>
              <DeltaBadge current={calculations.annualEBITDA} baseline={baselineCalcs.annualEBITDA} />
            </div>
            <p className="text-base font-bold text-indigo-400">
              ${Math.round(calculations.annualEBITDA).toLocaleString()}
            </p>
          </div>

          {/* Efficiency Metrics */}
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] text-white/50">Efficiency Metrics</p>
              {showBaseline && <Badge variant="outline" className="text-[8px] px-1 py-0 border-white/20 text-white/60">vs Baseline</Badge>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[9px] text-white/50">Rent/Rev</p>
                <p className={`text-xs font-bold ${calculations.rentToRevenue <= 10 ? 'text-green-400' : calculations.rentToRevenue <= 15 ? 'text-amber-400' : 'text-red-400'}`}>
                  {calculations.rentToRevenue.toFixed(1)}%
                </p>
                {showBaseline && Math.abs(calculations.rentToRevenue - baselineCalcs.rentToRevenue) > 0.5 && (
                  <p className={`text-[8px] ${calculations.rentToRevenue < baselineCalcs.rentToRevenue ? 'text-green-400' : 'text-red-400'}`}>
                    {calculations.rentToRevenue < baselineCalcs.rentToRevenue ? '-' : '+'}{Math.abs(calculations.rentToRevenue - baselineCalcs.rentToRevenue).toFixed(1)}%
                  </p>
                )}
              </div>
              <div>
                <p className="text-[9px] text-white/50">$/Sq Ft</p>
                <p className="text-xs font-bold text-cyan-400">
                  ${calculations.revenuePerSqft.toFixed(0)}
                </p>
                {showBaseline && Math.abs(calculations.revenuePerSqft - baselineCalcs.revenuePerSqft) > 1 && (
                  <p className={`text-[8px] ${calculations.revenuePerSqft > baselineCalcs.revenuePerSqft ? 'text-green-400' : 'text-red-400'}`}>
                    {calculations.revenuePerSqft > baselineCalcs.revenuePerSqft ? '+' : ''}{(calculations.revenuePerSqft - baselineCalcs.revenuePerSqft).toFixed(0)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[9px] text-white/50">Payback</p>
                <p className={`text-xs font-bold ${calculations.paybackYears <= 3 ? 'text-green-400' : calculations.paybackYears <= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                  {calculations.paybackYears < 10 ? `${calculations.paybackYears.toFixed(1)}y` : 'N/A'}
                </p>
                {showBaseline && 
                  baselineCalcs.paybackYears > 0 && baselineCalcs.paybackYears < 50 && 
                  calculations.paybackYears > 0 && calculations.paybackYears < 50 && 
                  equipmentCost > 0 &&
                  Math.abs(calculations.paybackYears - baselineCalcs.paybackYears) > 0.1 && (
                  <p className={`text-[8px] ${calculations.paybackYears < baselineCalcs.paybackYears ? 'text-green-400' : 'text-red-400'}`}>
                    {calculations.paybackYears < baselineCalcs.paybackYears ? '' : '+'}{(calculations.paybackYears - baselineCalcs.paybackYears).toFixed(1)}y
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
