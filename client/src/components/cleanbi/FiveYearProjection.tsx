import { useState, useMemo } from "react";
import { TrendingUp, Calendar, DollarSign, Settings, Info, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

interface FiveYearProjectionProps {
  cleanbiScore: number;
  grade: string;
  initialRevenue?: number;
  initialExpenses?: number;
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

interface ProjectionData {
  year: number;
  revenue: number;
  expenses: number;
  netIncome: number;
  cumulativeCashFlow: number;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function FiveYearProjection({
  cleanbiScore,
  grade,
  initialRevenue = 250000,
  initialExpenses = 187500,
  isSubscriber = false,
  onUpgradeClick
}: FiveYearProjectionProps) {
  const [revenue, setRevenue] = useState(initialRevenue);
  const [revenueGrowth, setRevenueGrowth] = useState(5);
  const [expenseRatio, setExpenseRatio] = useState(75);
  const [expenseGrowth, setExpenseGrowth] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  
  const locationMultiplier = 0.8 + (cleanbiScore / 100) * 0.4;
  const adjustedGrowth = revenueGrowth * locationMultiplier;
  
  const projections = useMemo<ProjectionData[]>(() => {
    const data: ProjectionData[] = [];
    let cumulativeCash = 0;
    
    for (let year = 0; year <= 5; year++) {
      const yearRevenue = revenue * Math.pow(1 + adjustedGrowth / 100, year);
      const yearExpenses = (revenue * (expenseRatio / 100)) * Math.pow(1 + expenseGrowth / 100, year);
      const netIncome = yearRevenue - yearExpenses;
      cumulativeCash += netIncome;
      
      data.push({
        year,
        revenue: Math.round(yearRevenue),
        expenses: Math.round(yearExpenses),
        netIncome: Math.round(netIncome),
        cumulativeCashFlow: Math.round(cumulativeCash)
      });
    }
    
    return data;
  }, [revenue, adjustedGrowth, expenseRatio, expenseGrowth]);
  
  const year5Data = projections[5];
  const totalCashFlow = year5Data.cumulativeCashFlow;
  const revenueIncrease = ((year5Data.revenue - revenue) / revenue) * 100;
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              Unlock 5-year cash flow projections with a Pro subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            5-Year Cash Flow Projection
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
              <TrendingUp className="h-5 w-5 text-blue-500" />
              5-Year Cash Flow Projection
            </CardTitle>
            <CardDescription>
              Growth adjusted for CLEANBI Score {cleanbiScore.toFixed(1)} ({adjustedGrowth.toFixed(1)}% annual growth)
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            data-testid="button-projection-settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showSettings && (
          <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Starting Annual Revenue
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Current annual gross revenue</TooltipContent>
                </Tooltip>
              </Label>
              <Input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                data-testid="input-starting-revenue"
              />
            </div>
            <div className="space-y-2">
              <Label>Base Revenue Growth Rate: {revenueGrowth}%</Label>
              <Slider
                value={[revenueGrowth]}
                onValueChange={([v]) => setRevenueGrowth(v)}
                min={0}
                max={15}
                step={0.5}
              />
            </div>
            <div className="space-y-2">
              <Label>Expense Ratio: {expenseRatio}%</Label>
              <Slider
                value={[expenseRatio]}
                onValueChange={([v]) => setExpenseRatio(v)}
                min={50}
                max={90}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Expense Growth Rate: {expenseGrowth}%</Label>
              <Slider
                value={[expenseGrowth]}
                onValueChange={([v]) => setExpenseGrowth(v)}
                min={0}
                max={10}
                step={0.5}
              />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Year 5 Revenue</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(year5Data.revenue)}
            </p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Year 5 Net Income</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(year5Data.netIncome)}
            </p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Total 5-Year Cash</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(totalCashFlow)}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Revenue Growth</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              +{revenueIncrease.toFixed(0)}%
            </p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                tickFormatter={(v) => `Y${v}`}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={(v) => formatCurrency(v)}
                className="text-xs"
                width={80}
              />
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "revenue" ? "Revenue" : 
                  name === "netIncome" ? "Net Income" : 
                  name === "expenses" ? "Expenses" : name
                ]}
                labelFormatter={(v) => `Year ${v}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#3B82F6"
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="netIncome"
                name="Net Income"
                stroke="#22C55E"
                fill="url(#colorNet)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#EF4444"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Year</th>
                <th className="text-right py-2 px-3">Revenue</th>
                <th className="text-right py-2 px-3">Expenses</th>
                <th className="text-right py-2 px-3">Net Income</th>
                <th className="text-right py-2 px-3">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => (
                <tr key={p.year} className="border-b last:border-0">
                  <td className="py-2 px-3 font-medium">Year {p.year}</td>
                  <td className="py-2 px-3 text-right text-blue-600 dark:text-blue-400">
                    {formatCurrency(p.revenue)}
                  </td>
                  <td className="py-2 px-3 text-right text-red-600 dark:text-red-400">
                    {formatCurrency(p.expenses)}
                  </td>
                  <td className="py-2 px-3 text-right text-green-600 dark:text-green-400">
                    {formatCurrency(p.netIncome)}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold">
                    {formatCurrency(p.cumulativeCashFlow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Projections are estimates based on adjustable assumptions. Actual results may vary.
          Growth rate adjusted by CLEANBI location quality score.
        </p>
      </CardContent>
    </Card>
  );
}

export default FiveYearProjection;
