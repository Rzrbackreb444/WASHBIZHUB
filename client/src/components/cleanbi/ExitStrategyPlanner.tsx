import { useState, useMemo } from "react";
import { LogOut, TrendingUp, Calendar, DollarSign, Target, Info, Calculator, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { cn } from "@/lib/utils";

interface ExitStrategyPlannerProps {
  cleanbiScore: number;
  grade: string;
  purchasePrice?: number;
  currentNOI?: number;
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

interface ExitScenario {
  year: number;
  businessValue: number;
  totalCashFlow: number;
  totalReturn: number;
  irr: number;
  multiple: number;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function ExitStrategyPlanner({
  cleanbiScore,
  grade,
  purchasePrice = 300000,
  currentNOI = 75000,
  isSubscriber = false,
  onUpgradeClick
}: ExitStrategyPlannerProps) {
  const [acquisitionCost, setAcquisitionCost] = useState(purchasePrice);
  const [annualNOI, setAnnualNOI] = useState(currentNOI);
  const [noiGrowth, setNoiGrowth] = useState(3);
  const [targetHoldPeriod, setTargetHoldPeriod] = useState(5);
  const [exitStrategy, setExitStrategy] = useState<"sell" | "refinance" | "hold">("sell");
  
  const gradeMultiples = {
    "A": { min: 3.5, max: 4.5 },
    "B": { min: 2.8, max: 3.5 },
    "C": { min: 2.2, max: 2.8 },
    "Needs Work": { min: 1.5, max: 2.2 }
  };
  
  const multiples = gradeMultiples[grade as keyof typeof gradeMultiples] || gradeMultiples["Needs Work"];
  const exitMultiple = (multiples.min + multiples.max) / 2;
  
  const scenarios = useMemo<ExitScenario[]>(() => {
    const results: ExitScenario[] = [];
    let cumulativeCashFlow = -acquisitionCost;
    
    for (let year = 1; year <= 10; year++) {
      const yearNOI = annualNOI * Math.pow(1 + noiGrowth / 100, year);
      cumulativeCashFlow += yearNOI;
      
      const exitValue = yearNOI * exitMultiple;
      const totalReturn = cumulativeCashFlow + exitValue;
      const irr = Math.pow(totalReturn / acquisitionCost, 1 / year) - 1;
      
      results.push({
        year,
        businessValue: Math.round(exitValue),
        totalCashFlow: Math.round(cumulativeCashFlow),
        totalReturn: Math.round(totalReturn),
        irr: irr * 100,
        multiple: totalReturn / acquisitionCost
      });
    }
    
    return results;
  }, [acquisitionCost, annualNOI, noiGrowth, exitMultiple]);
  
  const targetScenario = scenarios[targetHoldPeriod - 1];
  const optimalYear = scenarios.reduce((best, s) => s.irr > best.irr ? s : best, scenarios[0]);
  
  const chartData = scenarios.map(s => ({
    year: `Y${s.year}`,
    value: s.businessValue,
    cashFlow: s.totalCashFlow,
    totalReturn: s.totalReturn
  }));
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
            <p className="text-muted-foreground mb-4">
              Exit strategy planning requires a Pro subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-purple-500" />
            Exit Strategy Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="h-64 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-purple-500" />
              Exit Strategy Planner
            </CardTitle>
            <CardDescription>
              Optimize your hold period and exit timing
            </CardDescription>
          </div>
          <Badge className="gap-1">
            <Target className="h-3 w-3" />
            {exitMultiple.toFixed(1)}x Exit Multiple
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Acquisition Cost</Label>
            <Input
              type="number"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(Number(e.target.value))}
              data-testid="input-acquisition-cost"
            />
          </div>
          <div className="space-y-2">
            <Label>Current Annual NOI</Label>
            <Input
              type="number"
              value={annualNOI}
              onChange={(e) => setAnnualNOI(Number(e.target.value))}
              data-testid="input-annual-noi"
            />
          </div>
          <div className="space-y-2">
            <Label>NOI Growth Rate: {noiGrowth}%</Label>
            <Slider
              value={[noiGrowth]}
              onValueChange={([v]) => setNoiGrowth(v)}
              min={0}
              max={10}
              step={0.5}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Exit Strategy</Label>
          <RadioGroup
            value={exitStrategy}
            onValueChange={(v) => setExitStrategy(v as typeof exitStrategy)}
            className="grid grid-cols-3 gap-3"
          >
            <div className={cn(
              "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer",
              exitStrategy === "sell" && "border-primary bg-primary/5"
            )}>
              <RadioGroupItem value="sell" id="sell" />
              <Label htmlFor="sell" className="cursor-pointer">Sell Business</Label>
            </div>
            <div className={cn(
              "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer",
              exitStrategy === "refinance" && "border-primary bg-primary/5"
            )}>
              <RadioGroupItem value="refinance" id="refinance" />
              <Label htmlFor="refinance" className="cursor-pointer">Cash-Out Refi</Label>
            </div>
            <div className={cn(
              "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer",
              exitStrategy === "hold" && "border-primary bg-primary/5"
            )}>
              <RadioGroupItem value="hold" id="hold" />
              <Label htmlFor="hold" className="cursor-pointer">Hold Forever</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Target Hold Period: {targetHoldPeriod} years</Label>
          <Slider
            value={[targetHoldPeriod]}
            onValueChange={([v]) => setTargetHoldPeriod(v)}
            min={1}
            max={10}
            step={1}
          />
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Exit Value (Y{targetHoldPeriod})</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(targetScenario.businessValue)}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Total Return</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(targetScenario.totalReturn)}</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">IRR</p>
            <p className="text-xl font-bold text-purple-600">{targetScenario.irr.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Cash Multiple</p>
            <p className="text-xl font-bold text-amber-600">{targetScenario.multiple.toFixed(2)}x</p>
          </div>
        </div>
        
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-700 dark:text-green-400">
                Optimal Exit: Year {optimalYear.year}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Maximum IRR of {optimalYear.irr.toFixed(1)}% with total return of {formatCurrency(optimalYear.totalReturn)} 
                ({optimalYear.multiple.toFixed(2)}x cash-on-cash)
              </p>
            </div>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" width={80} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "value" ? "Business Value" :
                  name === "cashFlow" ? "Cumulative Cash Flow" :
                  "Total Return"
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <ReferenceLine x={`Y${targetHoldPeriod}`} stroke="#8B5CF6" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="value" name="Business Value" stroke="#22C55E" strokeWidth={2} />
              <Line type="monotone" dataKey="totalReturn" name="Total Return" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="cashFlow" name="Cash Flow" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Year</th>
                <th className="text-right py-2 px-3">Business Value</th>
                <th className="text-right py-2 px-3">Cumulative Cash</th>
                <th className="text-right py-2 px-3">Total Return</th>
                <th className="text-right py-2 px-3">IRR</th>
                <th className="text-right py-2 px-3">Multiple</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.slice(0, 7).map((s) => (
                <tr 
                  key={s.year} 
                  className={cn(
                    "border-b last:border-0",
                    s.year === targetHoldPeriod && "bg-primary/5"
                  )}
                >
                  <td className="py-2 px-3 font-medium">Year {s.year}</td>
                  <td className="py-2 px-3 text-right text-green-600">{formatCurrency(s.businessValue)}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(s.totalCashFlow)}</td>
                  <td className="py-2 px-3 text-right text-blue-600">{formatCurrency(s.totalReturn)}</td>
                  <td className="py-2 px-3 text-right text-purple-600">{s.irr.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-semibold">{s.multiple.toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Projections based on {grade} grade exit multiple of {exitMultiple.toFixed(1)}x NOI. 
          Actual returns depend on market conditions and operational performance.
        </p>
      </CardContent>
    </Card>
  );
}

export default ExitStrategyPlanner;
