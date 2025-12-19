import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  PremiumStatCard,
  PremiumMetricCard,
  PremiumProgressBar,
  PremiumWatermark,
  SubscriptionGate,
} from "@/components/premium-components";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useCallback } from "react";
import { 
  TrendingUp, TrendingDown, Minus, AlertTriangle, 
  DollarSign, Calculator, BarChart3, RefreshCcw, 
  Sparkles, Info, ArrowRight, Target, Percent, Users,
  Building, Wrench, Zap, Banknote, Clock
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
    name: "Average Transaction",
    icon: DollarSign,
    min: 8,
    max: 30,
    step: 0.50,
    defaultValue: 12,
    unit: "currency",
    description: "Average customer spend per visit",
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
    description: "Average customers per day",
    category: "revenue",
  },
  {
    id: "operatingDays",
    name: "Operating Days/Week",
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
    description: "Monthly lease payment",
    category: "cost",
  },
  {
    id: "laborCostPercent",
    name: "Labor Cost %",
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
    name: "Utility Cost %",
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
    name: "Supply Cost %",
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
    name: "WDF Revenue/Month",
    icon: Banknote,
    min: 0,
    max: 10000,
    step: 250,
    defaultValue: 2500,
    unit: "currency",
    description: "Wash-dry-fold service revenue",
    category: "revenue",
  },
  {
    id: "priceIncrease",
    name: "Price Increase %",
    icon: Percent,
    min: 0,
    max: 25,
    step: 1,
    defaultValue: 0,
    unit: "percent",
    description: "Proposed vend price increase",
    category: "growth",
  },
  {
    id: "customerGrowth",
    name: "Customer Growth %",
    icon: TrendingUp,
    min: -15,
    max: 25,
    step: 1,
    defaultValue: 0,
    unit: "percent",
    description: "Expected customer growth rate",
    category: "growth",
  },
];

interface Scenario {
  name: string;
  values: Record<string, number>;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  { name: "Current State", values: {} },
];

export default function WhatIfAnalysis() {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    VARIABLES.forEach(v => { initial[v.id] = v.defaultValue; });
    return initial;
  });

  const [comparisonValues, setComparisonValues] = useState<Record<string, number> | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);

  const updateValue = useCallback((id: string, value: number) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const formatValue = useCallback((value: number, unit: Variable["unit"]) => {
    switch (unit) {
      case "currency":
        return `$${value.toLocaleString()}`;
      case "percent":
        return `${value}%`;
      case "days":
        return `${value} days`;
      case "hours":
        return `${value} hours`;
      default:
        return value.toLocaleString();
    }
  }, []);

  const calculations = useMemo(() => {
    const {
      avgTicket, dailyCustomers, operatingDays, monthlyRent,
      laborCostPercent, utilityCostPercent, supplyCostPercent,
      wdfRevenue, priceIncrease, customerGrowth
    } = values;

    const adjustedTicket = avgTicket * (1 + priceIncrease / 100);
    const adjustedCustomers = dailyCustomers * (1 + customerGrowth / 100);
    const weeksPerMonth = 4.33;
    const dailyVendRevenue = adjustedTicket * adjustedCustomers;
    const monthlyVendRevenue = dailyVendRevenue * operatingDays * weeksPerMonth;
    const totalMonthlyRevenue = monthlyVendRevenue + wdfRevenue;
    const annualRevenue = totalMonthlyRevenue * 12;

    const laborCost = totalMonthlyRevenue * (laborCostPercent / 100);
    const utilityCost = totalMonthlyRevenue * (utilityCostPercent / 100);
    const supplyCost = totalMonthlyRevenue * (supplyCostPercent / 100);
    const totalOperatingCosts = monthlyRent + laborCost + utilityCost + supplyCost;
    const otherCosts = totalMonthlyRevenue * 0.05;
    const totalCosts = totalOperatingCosts + otherCosts;

    const monthlyNetIncome = totalMonthlyRevenue - totalCosts;
    const annualNetIncome = monthlyNetIncome * 12;
    const profitMargin = (monthlyNetIncome / totalMonthlyRevenue) * 100;
    const annualEBITDA = annualNetIncome * 1.2;
    const valuation3x = annualEBITDA * 3;
    const valuation4x = annualEBITDA * 4;

    const rentToRevenue = (monthlyRent / totalMonthlyRevenue) * 100;
    const turnsPerDay = (dailyVendRevenue / avgTicket) / 20;

    return {
      monthlyRevenue: totalMonthlyRevenue,
      annualRevenue,
      monthlyNetIncome,
      annualNetIncome,
      profitMargin,
      annualEBITDA,
      valuation3x,
      valuation4x,
      monthlyVendRevenue,
      laborCost,
      utilityCost,
      supplyCost,
      totalCosts,
      rentToRevenue,
      turnsPerDay,
    };
  }, [values]);

  const comparisonCalcs = useMemo(() => {
    if (!comparisonValues) return null;

    const v = comparisonValues;
    const adjustedTicket = v.avgTicket * (1 + v.priceIncrease / 100);
    const adjustedCustomers = v.dailyCustomers * (1 + v.customerGrowth / 100);
    const weeksPerMonth = 4.33;
    const dailyVendRevenue = adjustedTicket * adjustedCustomers;
    const monthlyVendRevenue = dailyVendRevenue * v.operatingDays * weeksPerMonth;
    const totalMonthlyRevenue = monthlyVendRevenue + v.wdfRevenue;
    const annualRevenue = totalMonthlyRevenue * 12;

    const laborCost = totalMonthlyRevenue * (v.laborCostPercent / 100);
    const utilityCost = totalMonthlyRevenue * (v.utilityCostPercent / 100);
    const supplyCost = totalMonthlyRevenue * (v.supplyCostPercent / 100);
    const totalOperatingCosts = v.monthlyRent + laborCost + utilityCost + supplyCost;
    const otherCosts = totalMonthlyRevenue * 0.05;
    const totalCosts = totalOperatingCosts + otherCosts;

    const monthlyNetIncome = totalMonthlyRevenue - totalCosts;
    const annualNetIncome = monthlyNetIncome * 12;
    const profitMargin = (monthlyNetIncome / totalMonthlyRevenue) * 100;
    const annualEBITDA = annualNetIncome * 1.2;
    const valuation3x = annualEBITDA * 3;
    const valuation4x = annualEBITDA * 4;

    return {
      monthlyRevenue: totalMonthlyRevenue,
      annualRevenue,
      monthlyNetIncome,
      annualNetIncome,
      profitMargin,
      annualEBITDA,
      valuation3x,
      valuation4x,
    };
  }, [comparisonValues]);

  const resetToDefaults = () => {
    const initial: Record<string, number> = {};
    VARIABLES.forEach(v => { initial[v.id] = v.defaultValue; });
    setValues(initial);
  };

  const saveCurrentScenario = () => {
    const name = `Scenario ${savedScenarios.length + 1}`;
    setSavedScenarios(prev => [...prev, { name, values: { ...values } }]);
  };

  const loadScenario = (scenario: Scenario) => {
    if (Object.keys(scenario.values).length === 0) {
      resetToDefaults();
    } else {
      setValues({ ...scenario.values });
    }
  };

  const setAsComparison = () => {
    setComparisonValues({ ...values });
    setShowComparison(true);
  };

  const clearComparison = () => {
    setComparisonValues(null);
    setShowComparison(false);
  };

  const getDelta = (current: number, comparison: number | undefined) => {
    if (!comparison) return null;
    return ((current - comparison) / Math.abs(comparison)) * 100;
  };

  const renderDelta = (delta: number | null) => {
    if (delta === null) return null;
    const isPositive = delta > 0;
    const Icon = isPositive ? TrendingUp : delta < 0 ? TrendingDown : Minus;
    const colorClass = isPositive ? "text-green-500" : delta < 0 ? "text-red-500" : "text-muted-foreground";
    return (
      <span className={`flex items-center gap-1 text-sm ${colorClass}`}>
        <Icon className="w-3 h-3" />
        {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
      </span>
    );
  };

  return (
    <>
      <SEO
        title="What-If Analysis Engine | Laundromat Scenario Modeling | WashBizHub"
        description="Model your laundromat's financial future with 10 key variables. Compare scenarios, see instant results, and make data-driven decisions for growth."
        canonicalUrl="/what-if-analysis"
        ogType="website"
        keywords={[
          "laundromat what-if analysis",
          "laundromat scenario modeling",
          "laundromat financial projections",
          "business scenario analysis",
          "laundromat revenue calculator",
          "laundromat profit modeling",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Calculators", url: "/calculators-hub" },
              { name: "What-If Analysis Engine", url: "/what-if-analysis" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  What-If Analysis Engine
                </h1>
                <p className="text-muted-foreground">
                  Model 10 key variables and see real-time impact on your bottom line
                </p>
              </div>
              <Badge className="ml-auto bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Tool
              </Badge>
            </div>
          </div>

          <Alert className="mb-6 border-indigo-500/30 bg-indigo-500/10">
            <Info className="h-4 w-4 text-indigo-400" />
            <AlertTitle className="text-indigo-400">How to Use This Tool</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Adjust the 10 sliders below to model different scenarios. Click "Set as Baseline" to save 
              your current state, then modify variables to compare the impact. Great for planning price increases, 
              cost reductions, or growth strategies.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={resetToDefaults} data-testid="button-reset">
              <RefreshCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button variant="outline" size="sm" onClick={setAsComparison} data-testid="button-set-baseline">
              <Target className="w-4 h-4 mr-1" /> Set as Baseline
            </Button>
            {showComparison && (
              <Button variant="outline" size="sm" onClick={clearComparison} data-testid="button-clear-comparison">
                Clear Comparison
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={saveCurrentScenario} data-testid="button-save-scenario">
              Save Scenario
            </Button>
            {savedScenarios.length > 1 && (
              <div className="flex gap-1 ml-2">
                {savedScenarios.map((scenario, idx) => (
                  <Button 
                    key={idx} 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => loadScenario(scenario)}
                    data-testid={`button-load-scenario-${idx}`}
                  >
                    {scenario.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="revenue" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="cost" data-testid="tab-cost">Costs</TabsTrigger>
                  <TabsTrigger value="operations" data-testid="tab-operations">Operations</TabsTrigger>
                  <TabsTrigger value="growth" data-testid="tab-growth">Growth</TabsTrigger>
                </TabsList>

                {["revenue", "cost", "operations", "growth"].map(category => (
                  <TabsContent key={category} value={category}>
                    <Card>
                      <CardContent className="pt-6 space-y-6">
                        {VARIABLES.filter(v => v.category === category).map(variable => (
                          <div key={variable.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2 text-sm">
                                <variable.icon className="w-4 h-4 text-muted-foreground" />
                                {variable.name}
                              </Label>
                              <span className="font-mono font-bold text-foreground" data-testid={`text-value-${variable.id}`}>
                                {formatValue(values[variable.id], variable.unit)}
                              </span>
                            </div>
                            <Slider
                              value={[values[variable.id]]}
                              min={variable.min}
                              max={variable.max}
                              step={variable.step}
                              onValueChange={([val]) => updateValue(variable.id, val)}
                              data-testid={`slider-${variable.id}`}
                            />
                            <p className="text-xs text-muted-foreground">{variable.description}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Key Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground" data-testid="text-monthly-revenue">
                        ${calculations.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      {showComparison && renderDelta(getDelta(calculations.monthlyRevenue, comparisonCalcs?.monthlyRevenue))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Annual Revenue</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground" data-testid="text-annual-revenue">
                        ${calculations.annualRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      {showComparison && renderDelta(getDelta(calculations.annualRevenue, comparisonCalcs?.annualRevenue))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Net Income</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${calculations.monthlyNetIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-monthly-net">
                        ${calculations.monthlyNetIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      {showComparison && renderDelta(getDelta(calculations.monthlyNetIncome, comparisonCalcs?.monthlyNetIncome))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Annual Net Income</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${calculations.annualNetIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-annual-net">
                        ${calculations.annualNetIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      {showComparison && renderDelta(getDelta(calculations.annualNetIncome, comparisonCalcs?.annualNetIncome))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${calculations.profitMargin >= 20 ? 'text-green-500' : calculations.profitMargin >= 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {calculations.profitMargin.toFixed(1)}%
                      </span>
                      {showComparison && renderDelta(getDelta(calculations.profitMargin, comparisonCalcs?.profitMargin))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Valuation Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Annual EBITDA</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground" data-testid="text-ebitda">
                        ${calculations.annualEBITDA.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      {showComparison && renderDelta(getDelta(calculations.annualEBITDA, comparisonCalcs?.annualEBITDA))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Value @ 3x EBITDA</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground" data-testid="text-valuation-3x">
                        ${calculations.valuation3x.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      {showComparison && renderDelta(getDelta(calculations.valuation3x, comparisonCalcs?.valuation3x))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Value @ 4x EBITDA</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground" data-testid="text-valuation-4x">
                        ${calculations.valuation4x.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      {showComparison && renderDelta(getDelta(calculations.valuation4x, comparisonCalcs?.valuation4x))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-500" />
                    Health Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rent-to-Revenue</span>
                    <Badge variant={calculations.rentToRevenue <= 20 ? "default" : calculations.rentToRevenue <= 25 ? "secondary" : "destructive"}>
                      {calculations.rentToRevenue.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Est. Turns/Day</span>
                    <Badge variant={calculations.turnsPerDay >= 4 ? "default" : calculations.turnsPerDay >= 3 ? "secondary" : "destructive"}>
                      {calculations.turnsPerDay.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Op. Costs %</span>
                    <Badge variant={(calculations.totalCosts / calculations.monthlyRevenue * 100) <= 70 ? "default" : "secondary"}>
                      {((calculations.totalCosts / calculations.monthlyRevenue) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
