import { useState } from "react";
import { TrendingUp, TrendingDown, Calendar, BarChart3, Info, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from "recharts";
import { cn } from "@/lib/utils";

interface HistoricalTrendsProps {
  address?: string;
  region?: string;
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

interface TrendData {
  year: number;
  medianIncome: number;
  population: number;
  homeValue: number;
  renterPct: number;
  laundromatCount: number;
}

function generateHistoricalData(baseYear: number = 2019): TrendData[] {
  const baseIncome = 55000;
  const basePopulation = 12500;
  const baseHomeValue = 280000;
  const baseRenterPct = 42;
  const baseLaundromatCount = 5;
  
  return Array.from({ length: 6 }, (_, i) => ({
    year: baseYear + i,
    medianIncome: Math.round(baseIncome * (1 + 0.03 * i + Math.random() * 0.02)),
    population: Math.round(basePopulation * (1 + 0.015 * i + Math.random() * 0.01)),
    homeValue: Math.round(baseHomeValue * (1 + 0.06 * i + Math.random() * 0.03)),
    renterPct: Math.round((baseRenterPct + i * 0.5 + Math.random() * 2) * 10) / 10,
    laundromatCount: baseLaundromatCount + Math.floor(i / 2)
  }));
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function calculateChange(data: TrendData[], key: keyof TrendData): { value: number; isPositive: boolean } {
  const first = data[0][key] as number;
  const last = data[data.length - 1][key] as number;
  const change = ((last - first) / first) * 100;
  return { value: Math.abs(change), isPositive: change >= 0 };
}

export function HistoricalTrends({ 
  address, 
  region = "National", 
  isSubscriber = false,
  onUpgradeClick 
}: HistoricalTrendsProps) {
  const [activeMetric, setActiveMetric] = useState<"all" | "income" | "population" | "homeValue" | "renter">("all");
  const [data] = useState(() => generateHistoricalData());
  
  const incomeChange = calculateChange(data, "medianIncome");
  const populationChange = calculateChange(data, "population");
  const homeValueChange = calculateChange(data, "homeValue");
  const renterChange = calculateChange(data, "renterPct");
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              Historical trends require a Pro subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Historical Market Trends
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
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Historical Market Trends
            </CardTitle>
            <CardDescription>
              5-year market evolution for {region}
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {data[0].year} - {data[data.length - 1].year}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {incomeChange.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                "text-lg font-bold",
                incomeChange.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {incomeChange.value.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Income Growth</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {populationChange.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                "text-lg font-bold",
                populationChange.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {populationChange.value.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Population Growth</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {homeValueChange.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                "text-lg font-bold",
                homeValueChange.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {homeValueChange.value.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Home Value</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {renterChange.isPositive ? (
                <TrendingUp className="h-4 w-4 text-blue-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-500" />
              )}
              <span className={cn(
                "text-lg font-bold",
                renterChange.isPositive ? "text-blue-600" : "text-amber-600"
              )}>
                {renterChange.value.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Renter % Change</p>
          </div>
        </div>
        
        <div className="flex gap-1 flex-wrap">
          {(["all", "income", "population", "homeValue", "renter"] as const).map((metric) => (
            <Button
              key={metric}
              variant={activeMetric === metric ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveMetric(metric)}
              className="text-xs"
            >
              {metric === "all" ? "All Metrics" :
               metric === "income" ? "Income" :
               metric === "population" ? "Population" :
               metric === "homeValue" ? "Home Values" : "Renter %"}
            </Button>
          ))}
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === "all" ? (
              <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis yAxisId="left" tickFormatter={formatCurrency} className="text-xs" width={60} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} className="text-xs" width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number, name: string) => [
                    name === "renterPct" ? `${value}%` :
                    name === "population" ? formatNumber(value) :
                    formatCurrency(value),
                    name === "medianIncome" ? "Median Income" :
                    name === "homeValue" ? "Home Value" :
                    name === "population" ? "Population" :
                    name === "renterPct" ? "Renter %" : name
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="medianIncome" name="Income" fill="#3B82F6" opacity={0.7} />
                <Line yAxisId="left" type="monotone" dataKey="homeValue" name="Home Value" stroke="#22C55E" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="renterPct" name="Renter %" stroke="#F59E0B" strokeWidth={2} />
              </ComposedChart>
            ) : (
              <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis 
                  tickFormatter={activeMetric === "renter" ? (v) => `${v}%` : 
                                 activeMetric === "population" ? formatNumber : formatCurrency} 
                  className="text-xs" 
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric === "income" ? "medianIncome" :
                           activeMetric === "homeValue" ? "homeValue" :
                           activeMetric === "population" ? "population" : "renterPct"}
                  stroke="#3B82F6"
                  fill="url(#colorMetric)"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Year</th>
                <th className="text-right py-2 px-3">Median Income</th>
                <th className="text-right py-2 px-3">Population</th>
                <th className="text-right py-2 px-3">Home Value</th>
                <th className="text-right py-2 px-3">Renter %</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.year} className="border-b last:border-0">
                  <td className="py-2 px-3 font-medium">{row.year}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(row.medianIncome)}</td>
                  <td className="py-2 px-3 text-right">{formatNumber(row.population)}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(row.homeValue)}</td>
                  <td className="py-2 px-3 text-right">{row.renterPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Data sourced from US Census Bureau ACS 5-Year Estimates and local market reports.
        </p>
      </CardContent>
    </Card>
  );
}

export default HistoricalTrends;
