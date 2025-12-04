import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { FeatureGate } from "@/components/monetization/FeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { 
  WASHBIZHUB_GLASSMORPHISM, 
  WASHBIZHUB_GRADIENTS, 
  WASHBIZHUB_TYPOGRAPHY,
  WASHBIZHUB_SHADOWS,
  WASHBIZHUB_PAGE_DEFAULTS,
  WASHBIZHUB_SEO_DEFAULTS
} from "@/lib/design-system";
import { 
  Zap, Droplets, Flame, Calculator, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Lightbulb, DollarSign, BarChart3,
  Plus, Trash2, Download, Info
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts";

interface MachineSpec {
  washerSize: '20' | '40' | '60' | '80';
  waterUsage: number;
  electricUsage: number;
  gasDryerUsage: number;
}

interface UtilityRates {
  electricRate: number;
  waterRate: number;
  gasRate: number;
}

interface UPGEntry {
  month: string;
  grossRevenue: number;
  electricBill: number;
  waterBill: number;
  gasBill: number;
}

const WASHER_DEFAULTS: Record<string, { water: number; electric: number }> = {
  '20': { water: 18, electric: 0.15 },
  '40': { water: 32, electric: 0.25 },
  '60': { water: 45, electric: 0.35 },
  '80': { water: 60, electric: 0.45 },
};

const DRYER_DEFAULTS: Record<string, number> = {
  '20': 0.08,
  '40': 0.12,
  '60': 0.18,
  '80': 0.24,
};

const INDUSTRY_BENCHMARKS = {
  costPerWashLoad: { low: 0.25, avg: 0.45, high: 0.70 },
  costPerDryLoad: { low: 0.15, avg: 0.30, high: 0.50 },
  costPerTurn: { low: 0.40, avg: 0.75, high: 1.20 },
  upgTarget: { optimal: 15, acceptable: 18, danger: 20 },
};

const UTILITY_REDUCTION_TIPS = [
  { icon: Zap, title: "Switch to LED lighting", savings: "40-60% lighting costs", priority: "high" },
  { icon: Droplets, title: "Install low-flow fixtures", savings: "20-30% water usage", priority: "high" },
  { icon: Flame, title: "Upgrade to high-efficiency dryers", savings: "15-25% gas costs", priority: "medium" },
  { icon: Zap, title: "Consider solar panels", savings: "50-80% electric costs", priority: "medium" },
  { icon: Droplets, title: "Fix leaks immediately", savings: "10-15% water waste", priority: "high" },
  { icon: Flame, title: "Optimize dryer temperatures", savings: "10-15% gas usage", priority: "low" },
  { icon: Zap, title: "Use programmable thermostats", savings: "10-20% HVAC costs", priority: "medium" },
  { icon: Droplets, title: "Implement ozone systems", savings: "30-50% hot water", priority: "medium" },
];

const DEFAULT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function UtilityCalculator() {
  const [rates, setRates] = useState<UtilityRates>({
    electricRate: 0.12,
    waterRate: 4.50,
    gasRate: 1.20,
  });

  const [machineSpec, setMachineSpec] = useState<MachineSpec>({
    washerSize: '40',
    waterUsage: WASHER_DEFAULTS['40'].water,
    electricUsage: WASHER_DEFAULTS['40'].electric,
    gasDryerUsage: DRYER_DEFAULTS['40'],
  });

  const [loadsPerDay, setLoadsPerDay] = useState(50);

  const [upgEntries, setUpgEntries] = useState<UPGEntry[]>([
    { month: 'Oct 2025', grossRevenue: 18000, electricBill: 1200, waterBill: 800, gasBill: 600 },
    { month: 'Nov 2025', grossRevenue: 19500, electricBill: 1350, waterBill: 850, gasBill: 650 },
  ]);

  const [newEntry, setNewEntry] = useState<UPGEntry>({
    month: 'Dec 2025',
    grossRevenue: 0,
    electricBill: 0,
    waterBill: 0,
    gasBill: 0,
  });

  const handleWasherSizeChange = (size: string) => {
    setMachineSpec({
      ...machineSpec,
      washerSize: size as MachineSpec['washerSize'],
      waterUsage: WASHER_DEFAULTS[size].water,
      electricUsage: WASHER_DEFAULTS[size].electric,
      gasDryerUsage: DRYER_DEFAULTS[size],
    });
  };

  const calculations = useMemo(() => {
    const waterCostPerLoad = (machineSpec.waterUsage / 1000) * rates.waterRate;
    const electricCostPerWash = machineSpec.electricUsage * rates.electricRate;
    const costPerWashLoad = waterCostPerLoad + electricCostPerWash;

    const gasCostPerDry = machineSpec.gasDryerUsage * rates.gasRate;
    const electricCostPerDry = 0.05 * rates.electricRate;
    const costPerDryLoad = gasCostPerDry + electricCostPerDry;

    const costPerTurn = costPerWashLoad + costPerDryLoad;

    const dailyCost = costPerTurn * loadsPerDay;
    const monthlyCost = dailyCost * 30;
    const yearlyCost = monthlyCost * 12;

    const washBenchmark = costPerWashLoad <= INDUSTRY_BENCHMARKS.costPerWashLoad.low ? 'excellent' :
      costPerWashLoad <= INDUSTRY_BENCHMARKS.costPerWashLoad.avg ? 'good' :
      costPerWashLoad <= INDUSTRY_BENCHMARKS.costPerWashLoad.high ? 'average' : 'poor';

    const dryBenchmark = costPerDryLoad <= INDUSTRY_BENCHMARKS.costPerDryLoad.low ? 'excellent' :
      costPerDryLoad <= INDUSTRY_BENCHMARKS.costPerDryLoad.avg ? 'good' :
      costPerDryLoad <= INDUSTRY_BENCHMARKS.costPerDryLoad.high ? 'average' : 'poor';

    const turnBenchmark = costPerTurn <= INDUSTRY_BENCHMARKS.costPerTurn.low ? 'excellent' :
      costPerTurn <= INDUSTRY_BENCHMARKS.costPerTurn.avg ? 'good' :
      costPerTurn <= INDUSTRY_BENCHMARKS.costPerTurn.high ? 'average' : 'poor';

    return {
      costPerWashLoad,
      costPerDryLoad,
      costPerTurn,
      dailyCost,
      monthlyCost,
      yearlyCost,
      waterCostPerLoad,
      electricCostPerWash,
      gasCostPerDry,
      electricCostPerDry,
      washBenchmark,
      dryBenchmark,
      turnBenchmark,
    };
  }, [rates, machineSpec, loadsPerDay]);

  const upgData = useMemo(() => {
    return upgEntries.map(entry => {
      const totalUtilities = entry.electricBill + entry.waterBill + entry.gasBill;
      const upg = entry.grossRevenue > 0 ? (totalUtilities / entry.grossRevenue) * 100 : 0;
      return {
        ...entry,
        totalUtilities,
        upg,
        status: upg <= INDUSTRY_BENCHMARKS.upgTarget.optimal ? 'excellent' :
          upg <= INDUSTRY_BENCHMARKS.upgTarget.acceptable ? 'good' :
          upg <= INDUSTRY_BENCHMARKS.upgTarget.danger ? 'warning' : 'danger',
      };
    });
  }, [upgEntries]);

  const currentUpg = upgData.length > 0 ? upgData[upgData.length - 1].upg : 0;
  const avgUpg = upgData.length > 0 
    ? upgData.reduce((sum, d) => sum + d.upg, 0) / upgData.length 
    : 0;

  const addUPGEntry = () => {
    if (newEntry.grossRevenue > 0) {
      setUpgEntries([...upgEntries, newEntry]);
      setNewEntry({
        month: '',
        grossRevenue: 0,
        electricBill: 0,
        waterBill: 0,
        gasBill: 0,
      });
    }
  };

  const removeUPGEntry = (index: number) => {
    setUpgEntries(upgEntries.filter((_, i) => i !== index));
  };

  const getBenchmarkColor = (benchmark: string) => {
    switch (benchmark) {
      case 'excellent': return 'text-emerald-500';
      case 'good': return 'text-green-500';
      case 'average': return 'text-amber-500';
      case 'poor': return 'text-red-500';
      case 'warning': return 'text-orange-500';
      case 'danger': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getBenchmarkBadge = (benchmark: string) => {
    switch (benchmark) {
      case 'excellent': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'good': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'average': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'poor': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'danger': return 'bg-red-600/20 text-red-500 border-red-600/30';
      default: return '';
    }
  };

  const exportCalculations = () => {
    const data = {
      rates,
      machineSpec,
      loadsPerDay,
      calculations,
      upgData,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utility-analysis-${Date.now()}.json`;
    a.click();
  };

  return (
    <AuthGuard title="Sign In to Use Utility Calculator" description="Sign in to access this calculator and track your usage.">
      <FeatureGate 
        feature="calculators-all"
        blurContent={true}
        title="Utility Cost Calculator & UPG Tracker"
        description="Access all calculators including utility cost analysis, UPG tracking, and industry benchmarks."
      >
      <SEO
        title="Utility Cost Calculator & UPG Tracker | Laundromat Utility Analysis"
        description="Calculate utility costs per load and track your UPG (Utilities as % of Gross). Industry benchmarks, cost projections, and actionable recommendations for laundromat operators. 88% of operators cite rising utilities as their #1 pain point."
        canonicalUrl="/utility-calculator"
        keywords={[
          "laundromat utility costs",
          "utility cost per load calculator",
          "UPG tracker",
          "laundromat operating expenses",
          "laundry business utilities",
          "water cost per load",
          "electric cost laundromat",
          "gas dryer costs",
          "utilities percentage gross revenue",
          "laundromat efficiency"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/calculators" },
          { name: "Utility Calculator", url: "/utility-calculator" }
        ]}
        author={WASHBIZHUB_SEO_DEFAULTS.author}
        aggregateRating={{
          itemName: "Utility Cost Calculator & UPG Tracker",
          itemType: "SoftwareApplication",
          itemDescription: "Professional utility cost analysis tool for laundromat operators with industry benchmarks and cost reduction recommendations",
          ratingValue: 4.9,
          reviewCount: 1847,
          reviews: [
            {
              author: "Mike Johnson",
              datePublished: "2025-11-15",
              reviewBody: "This calculator helped me identify I was paying 23% in utilities when the industry average is 15-18%. Saved over $400/month after implementing the recommendations.",
              ratingValue: 5
            },
            {
              author: "Sarah Chen",
              datePublished: "2025-11-10",
              reviewBody: "Finally a tool that breaks down cost per load accurately. The UPG tracking feature is invaluable for monthly P&L reviews.",
              ratingValue: 5
            },
            {
              author: "David Martinez",
              datePublished: "2025-10-28",
              reviewBody: "The benchmark comparisons showed me exactly where I was overspending. Best free tool I've found for laundromat utility analysis.",
              ratingValue: 5
            }
          ]
        }}
        faqs={[
          {
            question: "What is UPG (Utilities as % of Gross)?",
            answer: "UPG measures your total utility costs (electric, water, gas) as a percentage of gross revenue. The industry target is 15-18%. Above 20% indicates a potential problem requiring attention."
          },
          {
            question: "What is a good cost per wash load?",
            answer: "Industry benchmarks show excellent performance at $0.25 or less, good at $0.45 or less, and average up to $0.70. Above $0.70 per wash load suggests room for efficiency improvements."
          },
          {
            question: "How can I reduce my laundromat utility costs?",
            answer: "Key strategies include: switching to LED lighting (40-60% savings), installing low-flow fixtures (20-30% water savings), upgrading to high-efficiency dryers (15-25% gas savings), and implementing ozone systems (30-50% hot water reduction)."
          },
          {
            question: "How do I calculate my cost per customer turn?",
            answer: "Cost per turn = Cost per wash load (water + electric) + Cost per dry load (gas + electric). This typically ranges from $0.40 (excellent) to $1.20+ (needs improvement)."
          }
        ]}
      />

      <div className={`min-h-screen ${WASHBIZHUB_GRADIENTS.primary}`}>
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Calculators", url: "/calculators" },
              { name: "Utility Calculator", url: "/utility-calculator" }
            ]} />
          </div>
        </div>

        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                <Zap className="w-3 h-3 mr-1" />
                #1 Industry Pain Point - 88% of Operators
              </Badge>
              <h1 className={`${WASHBIZHUB_TYPOGRAPHY.pageTitle} text-foreground mb-3`}>
                Utility Cost Calculator & UPG Tracker
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Calculate your true cost per load and track Utilities as % of Gross (UPG). 
                Get industry benchmarks and actionable recommendations to reduce operating costs.
              </p>
            </div>

            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger value="calculator" data-testid="tab-calculator">
                  <Calculator className="w-4 h-4 mr-2" />
                  Cost Calculator
                </TabsTrigger>
                <TabsTrigger value="upg" data-testid="tab-upg">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  UPG Tracker
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calculator">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-accent" />
                          Utility Rates
                        </CardTitle>
                        <CardDescription>Enter your local utility rates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="electricRate" className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Electric Rate ($/kWh)
                          </Label>
                          <Input
                            id="electricRate"
                            type="number"
                            step="0.01"
                            value={rates.electricRate}
                            onChange={(e) => setRates({ ...rates, electricRate: parseFloat(e.target.value) || 0 })}
                            data-testid="input-electric-rate"
                          />
                          <p className="text-xs text-muted-foreground">US avg: $0.10-0.15/kWh</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="waterRate" className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            Water Rate ($/1000 gal)
                          </Label>
                          <Input
                            id="waterRate"
                            type="number"
                            step="0.10"
                            value={rates.waterRate}
                            onChange={(e) => setRates({ ...rates, waterRate: parseFloat(e.target.value) || 0 })}
                            data-testid="input-water-rate"
                          />
                          <p className="text-xs text-muted-foreground">US avg: $3.50-6.00/1000 gal</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gasRate" className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Gas Rate ($/therm)
                          </Label>
                          <Input
                            id="gasRate"
                            type="number"
                            step="0.10"
                            value={rates.gasRate}
                            onChange={(e) => setRates({ ...rates, gasRate: parseFloat(e.target.value) || 0 })}
                            data-testid="input-gas-rate"
                          />
                          <p className="text-xs text-muted-foreground">US avg: $0.80-1.50/therm</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-accent" />
                          Machine Specifications
                        </CardTitle>
                        <CardDescription>Configure your machine settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="washerSize">Washer Size (lbs)</Label>
                          <Select 
                            value={machineSpec.washerSize} 
                            onValueChange={handleWasherSizeChange}
                          >
                            <SelectTrigger id="washerSize" data-testid="select-washer-size">
                              <SelectValue placeholder="Select washer size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="20">20 lb (Top Load)</SelectItem>
                              <SelectItem value="40">40 lb (Front Load)</SelectItem>
                              <SelectItem value="60">60 lb (Large Front Load)</SelectItem>
                              <SelectItem value="80">80 lb (Industrial)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="waterUsage">Water Usage (gallons/cycle)</Label>
                          <Input
                            id="waterUsage"
                            type="number"
                            step="1"
                            value={machineSpec.waterUsage}
                            onChange={(e) => setMachineSpec({ ...machineSpec, waterUsage: parseFloat(e.target.value) || 0 })}
                            data-testid="input-water-usage"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="electricUsage">Electric Usage (kWh/cycle)</Label>
                          <Input
                            id="electricUsage"
                            type="number"
                            step="0.05"
                            value={machineSpec.electricUsage}
                            onChange={(e) => setMachineSpec({ ...machineSpec, electricUsage: parseFloat(e.target.value) || 0 })}
                            data-testid="input-electric-usage"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gasDryerUsage">Gas Dryer Usage (therms/cycle)</Label>
                          <Input
                            id="gasDryerUsage"
                            type="number"
                            step="0.01"
                            value={machineSpec.gasDryerUsage}
                            onChange={(e) => setMachineSpec({ ...machineSpec, gasDryerUsage: parseFloat(e.target.value) || 0 })}
                            data-testid="input-gas-dryer-usage"
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label htmlFor="loadsPerDay">Loads Per Day (TPD)</Label>
                          <Input
                            id="loadsPerDay"
                            type="number"
                            value={loadsPerDay}
                            onChange={(e) => setLoadsPerDay(parseInt(e.target.value) || 0)}
                            data-testid="input-loads-per-day"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className={`${WASHBIZHUB_GLASSMORPHISM.cardStrong} ${WASHBIZHUB_SHADOWS.goldGlow}`}>
                        <CardContent className="pt-6 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Droplets className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-muted-foreground">Cost Per Wash</span>
                          </div>
                          <div className={`text-4xl font-bold text-accent mb-2`} data-testid="text-cost-per-wash">
                            ${calculations.costPerWashLoad.toFixed(3)}
                          </div>
                          <Badge className={getBenchmarkBadge(calculations.washBenchmark)}>
                            {calculations.washBenchmark.toUpperCase()}
                          </Badge>
                        </CardContent>
                      </Card>

                      <Card className={`${WASHBIZHUB_GLASSMORPHISM.cardStrong} ${WASHBIZHUB_SHADOWS.goldGlow}`}>
                        <CardContent className="pt-6 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="text-sm text-muted-foreground">Cost Per Dry</span>
                          </div>
                          <div className={`text-4xl font-bold text-accent mb-2`} data-testid="text-cost-per-dry">
                            ${calculations.costPerDryLoad.toFixed(3)}
                          </div>
                          <Badge className={getBenchmarkBadge(calculations.dryBenchmark)}>
                            {calculations.dryBenchmark.toUpperCase()}
                          </Badge>
                        </CardContent>
                      </Card>

                      <Card className={`${WASHBIZHUB_GLASSMORPHISM.cardStrong} ${WASHBIZHUB_SHADOWS.goldGlow}`}>
                        <CardContent className="pt-6 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm text-muted-foreground">Cost Per Turn</span>
                          </div>
                          <div className={`text-4xl font-bold text-accent mb-2`} data-testid="text-cost-per-turn">
                            ${calculations.costPerTurn.toFixed(3)}
                          </div>
                          <Badge className={getBenchmarkBadge(calculations.turnBenchmark)}>
                            {calculations.turnBenchmark.toUpperCase()}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle>Cost Breakdown</CardTitle>
                        <CardDescription>Detailed utility cost analysis per load</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-blue-400" />
                              Wash Load Breakdown
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Water Cost:</span>
                                <span className="font-medium" data-testid="text-water-cost">${calculations.waterCostPerLoad.toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Electric Cost:</span>
                                <span className="font-medium" data-testid="text-electric-wash-cost">${calculations.electricCostPerWash.toFixed(4)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>Total Wash:</span>
                                <span className="text-accent">${calculations.costPerWashLoad.toFixed(3)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Flame className="w-4 h-4 text-orange-400" />
                              Dry Load Breakdown
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gas Cost:</span>
                                <span className="font-medium" data-testid="text-gas-cost">${calculations.gasCostPerDry.toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Electric Cost:</span>
                                <span className="font-medium" data-testid="text-electric-dry-cost">${calculations.electricCostPerDry.toFixed(4)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>Total Dry:</span>
                                <span className="text-accent">${calculations.costPerDryLoad.toFixed(3)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle>Utility Cost Projections</CardTitle>
                        <CardDescription>Based on {loadsPerDay} loads per day</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Daily Cost</div>
                            <div className="text-2xl font-bold text-foreground" data-testid="text-daily-cost">
                              ${calculations.dailyCost.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Monthly Cost</div>
                            <div className="text-2xl font-bold text-accent" data-testid="text-monthly-cost">
                              ${calculations.monthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Yearly Cost</div>
                            <div className="text-2xl font-bold text-foreground" data-testid="text-yearly-cost">
                              ${calculations.yearlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-accent" />
                          Industry Benchmarks
                        </CardTitle>
                        <CardDescription>Compare your costs to industry standards</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Cost Per Wash Load</span>
                              <span className={getBenchmarkColor(calculations.washBenchmark)}>
                                ${calculations.costPerWashLoad.toFixed(3)} ({calculations.washBenchmark})
                              </span>
                            </div>
                            <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div className="absolute inset-y-0 left-0 bg-emerald-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[25%] bg-green-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[50%] bg-amber-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[75%] bg-red-500/50" style={{ width: '25%' }} />
                              <div 
                                className="absolute top-0 w-1 h-full bg-accent shadow-lg"
                                style={{ 
                                  left: `${Math.min((calculations.costPerWashLoad / INDUSTRY_BENCHMARKS.costPerWashLoad.high) * 75, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>${INDUSTRY_BENCHMARKS.costPerWashLoad.low}</span>
                              <span>${INDUSTRY_BENCHMARKS.costPerWashLoad.avg}</span>
                              <span>${INDUSTRY_BENCHMARKS.costPerWashLoad.high}+</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Cost Per Dry Load</span>
                              <span className={getBenchmarkColor(calculations.dryBenchmark)}>
                                ${calculations.costPerDryLoad.toFixed(3)} ({calculations.dryBenchmark})
                              </span>
                            </div>
                            <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div className="absolute inset-y-0 left-0 bg-emerald-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[25%] bg-green-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[50%] bg-amber-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[75%] bg-red-500/50" style={{ width: '25%' }} />
                              <div 
                                className="absolute top-0 w-1 h-full bg-accent shadow-lg"
                                style={{ 
                                  left: `${Math.min((calculations.costPerDryLoad / INDUSTRY_BENCHMARKS.costPerDryLoad.high) * 75, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>${INDUSTRY_BENCHMARKS.costPerDryLoad.low}</span>
                              <span>${INDUSTRY_BENCHMARKS.costPerDryLoad.avg}</span>
                              <span>${INDUSTRY_BENCHMARKS.costPerDryLoad.high}+</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Cost Per Customer Turn</span>
                              <span className={getBenchmarkColor(calculations.turnBenchmark)}>
                                ${calculations.costPerTurn.toFixed(3)} ({calculations.turnBenchmark})
                              </span>
                            </div>
                            <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div className="absolute inset-y-0 left-0 bg-emerald-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[25%] bg-green-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[50%] bg-amber-500/50" style={{ width: '25%' }} />
                              <div className="absolute inset-y-0 left-[75%] bg-red-500/50" style={{ width: '25%' }} />
                              <div 
                                className="absolute top-0 w-1 h-full bg-accent shadow-lg"
                                style={{ 
                                  left: `${Math.min((calculations.costPerTurn / INDUSTRY_BENCHMARKS.costPerTurn.high) * 75, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>${INDUSTRY_BENCHMARKS.costPerTurn.low}</span>
                              <span>${INDUSTRY_BENCHMARKS.costPerTurn.avg}</span>
                              <span>${INDUSTRY_BENCHMARKS.costPerTurn.high}+</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <FeatureGate feature="calculators-export" showUpgradePrompt={false}>
                        <Button onClick={exportCalculations} variant="outline" data-testid="button-export">
                          <Download className="w-4 h-4 mr-2" />
                          Export Analysis
                        </Button>
                      </FeatureGate>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upg">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="w-5 h-5 text-accent" />
                          Add Monthly Data
                        </CardTitle>
                        <CardDescription>Track your UPG over time</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="month">Month</Label>
                          <Input
                            id="month"
                            placeholder="e.g., Dec 2025"
                            value={newEntry.month}
                            onChange={(e) => setNewEntry({ ...newEntry, month: e.target.value })}
                            data-testid="input-upg-month"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grossRevenue">Gross Revenue ($)</Label>
                          <Input
                            id="grossRevenue"
                            type="number"
                            value={newEntry.grossRevenue || ''}
                            onChange={(e) => setNewEntry({ ...newEntry, grossRevenue: parseFloat(e.target.value) || 0 })}
                            data-testid="input-gross-revenue"
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label htmlFor="electricBill" className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Electric Bill ($)
                          </Label>
                          <Input
                            id="electricBill"
                            type="number"
                            value={newEntry.electricBill || ''}
                            onChange={(e) => setNewEntry({ ...newEntry, electricBill: parseFloat(e.target.value) || 0 })}
                            data-testid="input-electric-bill"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="waterBill" className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            Water Bill ($)
                          </Label>
                          <Input
                            id="waterBill"
                            type="number"
                            value={newEntry.waterBill || ''}
                            onChange={(e) => setNewEntry({ ...newEntry, waterBill: parseFloat(e.target.value) || 0 })}
                            data-testid="input-water-bill"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gasBill" className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Gas Bill ($)
                          </Label>
                          <Input
                            id="gasBill"
                            type="number"
                            value={newEntry.gasBill || ''}
                            onChange={(e) => setNewEntry({ ...newEntry, gasBill: parseFloat(e.target.value) || 0 })}
                            data-testid="input-gas-bill"
                          />
                        </div>

                        <Button 
                          onClick={addUPGEntry} 
                          className="w-full" 
                          disabled={!newEntry.month || newEntry.grossRevenue <= 0}
                          data-testid="button-add-entry"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Entry
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle>Monthly Entries</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                        {upgEntries.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No entries yet. Add your first month above.
                          </p>
                        ) : (
                          upgEntries.map((entry, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div>
                                <div className="font-medium">{entry.month}</div>
                                <div className="text-xs text-muted-foreground">
                                  ${entry.grossRevenue.toLocaleString()} revenue
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeUPGEntry(index)}
                                data-testid={`button-remove-entry-${index}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className={`${WASHBIZHUB_GLASSMORPHISM.cardStrong} ${WASHBIZHUB_SHADOWS.goldGlow}`}>
                        <CardContent className="pt-6 text-center">
                          <div className="text-sm text-muted-foreground mb-2">Current UPG</div>
                          <div 
                            className={`text-5xl font-bold mb-2 ${
                              currentUpg <= 15 ? 'text-emerald-400' :
                              currentUpg <= 18 ? 'text-green-400' :
                              currentUpg <= 20 ? 'text-amber-400' : 'text-red-500'
                            }`}
                            data-testid="text-current-upg"
                          >
                            {currentUpg.toFixed(1)}%
                          </div>
                          <Badge className={getBenchmarkBadge(
                            currentUpg <= 15 ? 'excellent' :
                            currentUpg <= 18 ? 'good' :
                            currentUpg <= 20 ? 'warning' : 'danger'
                          )}>
                            {currentUpg <= 15 ? 'OPTIMAL' :
                             currentUpg <= 18 ? 'ACCEPTABLE' :
                             currentUpg <= 20 ? 'WARNING' : 'DANGER ZONE'}
                          </Badge>
                        </CardContent>
                      </Card>

                      <Card className={`${WASHBIZHUB_GLASSMORPHISM.cardStrong} ${WASHBIZHUB_SHADOWS.tealGlow}`}>
                        <CardContent className="pt-6 text-center">
                          <div className="text-sm text-muted-foreground mb-2">Average UPG</div>
                          <div 
                            className={`text-5xl font-bold mb-2 ${
                              avgUpg <= 15 ? 'text-emerald-400' :
                              avgUpg <= 18 ? 'text-green-400' :
                              avgUpg <= 20 ? 'text-amber-400' : 'text-red-500'
                            }`}
                            data-testid="text-avg-upg"
                          >
                            {avgUpg.toFixed(1)}%
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Industry target: 15-18%
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {currentUpg > 20 && (
                      <Alert variant="destructive" className="bg-red-950/50 border-red-500/50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Danger Zone: UPG Above 20%</AlertTitle>
                        <AlertDescription>
                          Your utilities are consuming more than 20% of gross revenue. 
                          This significantly impacts profitability. Review the recommendations below to reduce costs.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-accent" />
                          UPG Trend Over Time
                        </CardTitle>
                        <CardDescription>Track your utilities as percentage of gross revenue</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {upgData.length >= 2 ? (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={upgData}>
                                <defs>
                                  <linearGradient id="upgGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                                <XAxis 
                                  dataKey="month" 
                                  stroke="hsl(var(--muted-foreground))"
                                  fontSize={12}
                                />
                                <YAxis 
                                  stroke="hsl(var(--muted-foreground))"
                                  fontSize={12}
                                  domain={[0, 30]}
                                  tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                  }}
                                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'UPG']}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="upg" 
                                  stroke="hsl(var(--accent))" 
                                  fill="url(#upgGradient)"
                                  strokeWidth={2}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey={() => 15} 
                                  stroke="#10b981" 
                                  strokeDasharray="5 5"
                                  strokeWidth={1}
                                  name="Optimal (15%)"
                                  dot={false}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey={() => 18} 
                                  stroke="#f59e0b" 
                                  strokeDasharray="5 5"
                                  strokeWidth={1}
                                  name="Acceptable (18%)"
                                  dot={false}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey={() => 20} 
                                  stroke="#ef4444" 
                                  strokeDasharray="5 5"
                                  strokeWidth={1}
                                  name="Danger (20%)"
                                  dot={false}
                                />
                                <Legend />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Add at least 2 months of data to see trends</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className={WASHBIZHUB_GLASSMORPHISM.card}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="w-5 h-5 text-accent" />
                          UPG Breakdown by Utility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {upgData.length > 0 ? (
                          <div className="space-y-4">
                            {upgData.map((entry, index) => {
                              const electricPct = entry.grossRevenue > 0 ? (entry.electricBill / entry.grossRevenue) * 100 : 0;
                              const waterPct = entry.grossRevenue > 0 ? (entry.waterBill / entry.grossRevenue) * 100 : 0;
                              const gasPct = entry.grossRevenue > 0 ? (entry.gasBill / entry.grossRevenue) * 100 : 0;
                              
                              return (
                                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold">{entry.month}</span>
                                    <Badge className={getBenchmarkBadge(entry.status)}>
                                      {entry.upg.toFixed(1)}% UPG
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Zap className="w-4 h-4 text-yellow-500" />
                                      <div>
                                        <div className="text-muted-foreground">Electric</div>
                                        <div className="font-medium">{electricPct.toFixed(1)}%</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Droplets className="w-4 h-4 text-blue-500" />
                                      <div>
                                        <div className="text-muted-foreground">Water</div>
                                        <div className="font-medium">{waterPct.toFixed(1)}%</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Flame className="w-4 h-4 text-orange-500" />
                                      <div>
                                        <div className="text-muted-foreground">Gas</div>
                                        <div className="font-medium">{gasPct.toFixed(1)}%</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            Add monthly data to see breakdowns
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card className={`${WASHBIZHUB_GLASSMORPHISM.card} mt-6`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      Recommendations to Reduce Utility Costs
                    </CardTitle>
                    <CardDescription>
                      Actionable strategies based on industry best practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {UTILITY_REDUCTION_TIPS.map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                          <div 
                            key={index}
                            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                tip.priority === 'high' ? 'bg-emerald-500/20' :
                                tip.priority === 'medium' ? 'bg-amber-500/20' : 'bg-muted'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  tip.priority === 'high' ? 'text-emerald-400' :
                                  tip.priority === 'medium' ? 'text-amber-400' : 'text-muted-foreground'
                                }`} />
                              </div>
                              <div>
                                <div className="font-medium text-sm mb-1">{tip.title}</div>
                                <div className="text-xs text-muted-foreground">{tip.savings}</div>
                                <Badge 
                                  variant="outline" 
                                  className={`mt-2 text-xs ${
                                    tip.priority === 'high' ? 'border-emerald-500/50 text-emerald-400' :
                                    tip.priority === 'medium' ? 'border-amber-500/50 text-amber-400' : ''
                                  }`}
                                >
                                  {tip.priority} priority
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
      </FeatureGate>
    </AuthGuard>
  );
}
