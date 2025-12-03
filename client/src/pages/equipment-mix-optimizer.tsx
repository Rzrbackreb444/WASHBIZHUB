import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  DollarSign, 
  Gauge, 
  Calculator, 
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Lightbulb,
  Crown,
  Lock
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface MachineType {
  id: string;
  name: string;
  capacity: string;
  baseTurns: number;
  pricePerTurn: number;
  monthlyMaintenance: number;
  purchaseCost: number;
  icon: string;
}

const MACHINE_TYPES: MachineType[] = [
  { id: "washer_20", name: "20 lb Washer", capacity: "20 lb", baseTurns: 6, pricePerTurn: 3.50, monthlyMaintenance: 25, purchaseCost: 3500, icon: "washer" },
  { id: "washer_30", name: "30 lb Washer", capacity: "30 lb", baseTurns: 5.5, pricePerTurn: 5.00, monthlyMaintenance: 35, purchaseCost: 5000, icon: "washer" },
  { id: "washer_40", name: "40 lb Washer", capacity: "40 lb", baseTurns: 5, pricePerTurn: 6.50, monthlyMaintenance: 45, purchaseCost: 7000, icon: "washer" },
  { id: "washer_60", name: "60 lb Washer", capacity: "60 lb", baseTurns: 4.5, pricePerTurn: 8.00, monthlyMaintenance: 55, purchaseCost: 10000, icon: "washer" },
  { id: "washer_80", name: "80 lb Washer", capacity: "80 lb", baseTurns: 4, pricePerTurn: 10.00, monthlyMaintenance: 65, purchaseCost: 14000, icon: "washer" },
  { id: "dryer_30", name: "30 lb Dryer", capacity: "30 lb", baseTurns: 8, pricePerTurn: 1.75, monthlyMaintenance: 20, purchaseCost: 2500, icon: "dryer" },
  { id: "dryer_50", name: "50 lb Dryer", capacity: "50 lb", baseTurns: 7, pricePerTurn: 2.50, monthlyMaintenance: 30, purchaseCost: 4000, icon: "dryer" },
  { id: "dryer_75", name: "75 lb Dryer", capacity: "75 lb", baseTurns: 6, pricePerTurn: 3.50, monthlyMaintenance: 40, purchaseCost: 6000, icon: "dryer" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function calculateDiminishingReturns(machineCount: number, baseTurns: number): number {
  if (machineCount <= 0) return 0;
  const diminishFactor = Math.max(0.5, 1 - (machineCount - 1) * 0.05);
  return baseTurns * diminishFactor;
}

export default function EquipmentMixOptimizer() {
  const { user, isLoading: userLoading } = useUser();
  const { tier, isFreeTier } = useSubscription();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const [machineQuantities, setMachineQuantities] = useState<Record<string, number>>({
    washer_20: 8,
    washer_30: 6,
    washer_40: 4,
    washer_60: 2,
    washer_80: 1,
    dryer_30: 10,
    dryer_50: 6,
    dryer_75: 4,
  });

  const [operatingDays, setOperatingDays] = useState(365);
  const [operatingHours, setOperatingHours] = useState(16);
  const [utilityRate, setUtilityRate] = useState(0.12);

  const updateQuantity = (machineId: string, delta: number) => {
    setMachineQuantities(prev => ({
      ...prev,
      [machineId]: Math.max(0, (prev[machineId] || 0) + delta)
    }));
  };

  const calculations = useMemo(() => {
    let totalAnnualRevenue = 0;
    let totalMonthlyMaintenance = 0;
    let totalEquipmentCost = 0;
    let totalMachines = 0;
    
    const machineBreakdown: Array<{
      machine: MachineType;
      quantity: number;
      adjustedTurns: number;
      dailyRevenue: number;
      annualRevenue: number;
      annualMaintenance: number;
    }> = [];

    MACHINE_TYPES.forEach(machine => {
      const quantity = machineQuantities[machine.id] || 0;
      if (quantity > 0) {
        totalMachines += quantity;
        const adjustedTurns = calculateDiminishingReturns(quantity, machine.baseTurns);
        const dailyRevenue = quantity * adjustedTurns * machine.pricePerTurn;
        const annualRevenue = dailyRevenue * operatingDays;
        const annualMaintenance = quantity * machine.monthlyMaintenance * 12;
        
        totalAnnualRevenue += annualRevenue;
        totalMonthlyMaintenance += quantity * machine.monthlyMaintenance;
        totalEquipmentCost += quantity * machine.purchaseCost;

        machineBreakdown.push({
          machine,
          quantity,
          adjustedTurns,
          dailyRevenue,
          annualRevenue,
          annualMaintenance
        });
      }
    });

    const estimatedUtilityCost = totalAnnualRevenue * 0.22;
    const netOperatingIncome = totalAnnualRevenue - (totalMonthlyMaintenance * 12) - estimatedUtilityCost;
    const roi = totalEquipmentCost > 0 ? (netOperatingIncome / totalEquipmentCost) * 100 : 0;
    const paybackYears = netOperatingIncome > 0 ? totalEquipmentCost / netOperatingIncome : 0;

    return {
      totalAnnualRevenue,
      totalMonthlyMaintenance,
      totalEquipmentCost,
      totalMachines,
      estimatedUtilityCost,
      netOperatingIncome,
      roi,
      paybackYears,
      machineBreakdown
    };
  }, [machineQuantities, operatingDays]);

  const getOptimizationSuggestions = () => {
    const suggestions: Array<{ type: "add" | "remove" | "tip"; text: string; impact: string }> = [];
    
    const washers = (machineQuantities.washer_20 || 0) + (machineQuantities.washer_30 || 0) + 
                   (machineQuantities.washer_40 || 0) + (machineQuantities.washer_60 || 0) + (machineQuantities.washer_80 || 0);
    const dryers = (machineQuantities.dryer_30 || 0) + (machineQuantities.dryer_50 || 0) + (machineQuantities.dryer_75 || 0);
    
    if (dryers < washers * 1.2) {
      suggestions.push({
        type: "add",
        text: "Add more dryers to match washer capacity (ideal ratio: 1.2:1 dryers to washers)",
        impact: "+$3K-8K/year"
      });
    }
    
    if ((machineQuantities.washer_60 || 0) < 2 && washers > 15) {
      suggestions.push({
        type: "add",
        text: "Add 60lb washers - high demand for large loads with premium pricing",
        impact: "+$12K/year per unit"
      });
    }
    
    if ((machineQuantities.washer_20 || 0) > 10) {
      suggestions.push({
        type: "tip",
        text: "Consider replacing some 20lb washers with 30lb for better revenue per sq ft",
        impact: "+15% revenue"
      });
    }

    if (calculations.totalMachines > 40 && (machineQuantities.washer_80 || 0) < 2) {
      suggestions.push({
        type: "add",
        text: "Add an 80lb washer for commercial accounts and large families",
        impact: "+$15K/year potential"
      });
    }

    return suggestions;
  };

  const suggestions = getOptimizationSuggestions();

  return (
    <AuthGuard>
      <SEO 
        title="Equipment Mix Optimizer | Laundromat Revenue Calculator"
        description="Optimize your laundromat equipment mix for maximum revenue. Calculate ARR impact of adding or removing washers and dryers with diminishing returns analysis."
        keywords="laundromat equipment, washer dryer mix, ARR calculator, revenue optimization, equipment planning"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#0f1d2f] via-[#1e3a5f] to-[#0f1d2f]">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: "Tools", href: "/calculators" },
            { label: "Equipment Mix Optimizer" }
          ]} />

          <div className="mt-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Equipment Mix Optimizer
            </h1>
            <p className="text-white/60">
              Calculate the revenue impact of adding or removing machines with real diminishing returns analysis
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#b8860b]" />
                    Equipment Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#b8860b] flex items-center gap-2">
                        <Gauge className="w-4 h-4" />
                        Washers
                      </h3>
                      {MACHINE_TYPES.filter(m => m.icon === "washer").map(machine => (
                        <div key={machine.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <div className="text-white font-medium text-sm">{machine.name}</div>
                            <div className="text-white/50 text-xs">{formatCurrency(machine.pricePerTurn)}/turn</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                              onClick={() => updateQuantity(machine.id, -1)}
                              data-testid={`button-decrease-${machine.id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-white font-bold">
                              {machineQuantities[machine.id] || 0}
                            </span>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                              onClick={() => updateQuantity(machine.id, 1)}
                              data-testid={`button-increase-${machine.id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Dryers
                      </h3>
                      {MACHINE_TYPES.filter(m => m.icon === "dryer").map(machine => (
                        <div key={machine.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <div className="text-white font-medium text-sm">{machine.name}</div>
                            <div className="text-white/50 text-xs">{formatCurrency(machine.pricePerTurn)}/turn</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                              onClick={() => updateQuantity(machine.id, -1)}
                              data-testid={`button-decrease-${machine.id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-white font-bold">
                              {machineQuantities[machine.id] || 0}
                            </span>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                              onClick={() => updateQuantity(machine.id, 1)}
                              data-testid={`button-increase-${machine.id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isFreeTier ? (
                <Card className="bg-white/5 border-white/10 relative overflow-hidden">
                  <div className="blur-sm pointer-events-none opacity-50">
                    <CardHeader className="border-b border-white/10">
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        Revenue Breakdown by Machine
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="bg-white/5 rounded-lg p-3 h-16" />
                        ))}
                      </div>
                    </CardContent>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <Lock className="w-8 h-8 text-[#b8860b] mb-2" />
                    <h4 className="text-white font-semibold mb-1">Detailed Revenue Breakdown</h4>
                    <p className="text-white/60 text-sm mb-3">See per-machine revenue analysis</p>
                    <Button 
                      className="bg-[#b8860b] hover:bg-[#d4a030] text-black"
                      onClick={() => setShowUpgradePrompt(true)}
                      data-testid="button-unlock-breakdown"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Unlock — $29/mo
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Revenue Breakdown by Machine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {calculations.machineBreakdown.map(item => {
                        const percentage = calculations.totalAnnualRevenue > 0 
                          ? (item.annualRevenue / calculations.totalAnnualRevenue) * 100 
                          : 0;
                        return (
                          <div key={item.machine.id} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium text-sm">{item.machine.name}</span>
                                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                                  x{item.quantity}
                                </Badge>
                              </div>
                              <span className="text-[#b8860b] font-bold">{formatCurrency(item.annualRevenue)}/yr</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                            <div className="flex justify-between mt-1 text-xs text-white/50">
                              <span>{item.adjustedTurns.toFixed(1)} turns/day avg</span>
                              <span>{percentage.toFixed(1)}% of revenue</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-[#b8860b]/20 to-transparent border-[#b8860b]/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#b8860b]" />
                    Annual Revenue Projection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-[#b8860b]" data-testid="text-annual-revenue">
                      {formatCurrency(calculations.totalAnnualRevenue)}
                    </div>
                    <div className="text-white/60 text-sm">Projected Annual Revenue</div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Machines</span>
                      <span className="text-white font-medium">{calculations.totalMachines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Monthly Maintenance</span>
                      <span className="text-red-400 font-medium">-{formatCurrency(calculations.totalMonthlyMaintenance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Est. Annual Utilities</span>
                      <span className="text-red-400 font-medium">-{formatCurrency(calculations.estimatedUtilityCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Equipment Cost</span>
                      <span className="text-white font-medium">{formatCurrency(calculations.totalEquipmentCost)}</span>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-medium">Net Operating Income</span>
                      <span className="text-green-400 font-bold text-xl">{formatCurrency(calculations.netOperatingIncome)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">{calculations.roi.toFixed(1)}%</div>
                      <div className="text-xs text-white/50">Annual ROI</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">{calculations.paybackYears.toFixed(1)} yrs</div>
                      <div className="text-xs text-white/50">Payback Period</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Optimization Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, idx) => (
                      <div 
                        key={idx} 
                        className={`rounded-lg p-3 border ${
                          suggestion.type === "add" 
                            ? "bg-green-500/10 border-green-500/20" 
                            : suggestion.type === "remove"
                              ? "bg-red-500/10 border-red-500/20"
                              : "bg-[#b8860b]/10 border-[#b8860b]/20"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {suggestion.type === "add" ? (
                            <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                          ) : suggestion.type === "remove" ? (
                            <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          ) : (
                            <Target className="w-4 h-4 text-[#b8860b] mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className="text-white text-sm">{suggestion.text}</p>
                            <Badge 
                              className={`mt-1 text-xs ${
                                suggestion.type === "add" 
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-[#b8860b]/20 text-[#b8860b] border-[#b8860b]/30"
                              }`}
                            >
                              {suggestion.impact}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">Your equipment mix is well optimized!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-white/40" />
                    Diminishing Returns Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/50 text-xs leading-relaxed">
                    This calculator applies diminishing returns to machine utilization. 
                    Each additional machine of the same type reduces average turns per day by 5% 
                    (minimum 50% utilization), reflecting real-world customer distribution patterns.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <UpgradePrompt 
        isOpen={showUpgradePrompt} 
        onClose={() => setShowUpgradePrompt(false)} 
      />
    </AuthGuard>
  );
}
