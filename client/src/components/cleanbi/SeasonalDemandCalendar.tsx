import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, Sun, Cloud, Snowflake, Droplets, Info, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SeasonalDemandCalendarProps {
  region?: string;
  climate?: "temperate" | "tropical" | "arid" | "cold";
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

interface MonthData {
  name: string;
  shortName: string;
  demandIndex: number;
  peakReason?: string;
  weather: "hot" | "warm" | "cool" | "cold" | "rainy";
  events?: string[];
}

const SEASONAL_DATA: Record<string, MonthData[]> = {
  temperate: [
    { name: "January", shortName: "Jan", demandIndex: 85, weather: "cold", peakReason: "Post-holiday cleaning", events: ["New Year deep clean"] },
    { name: "February", shortName: "Feb", demandIndex: 80, weather: "cold", events: ["Valentine's linens"] },
    { name: "March", shortName: "Mar", demandIndex: 95, weather: "cool", peakReason: "Spring cleaning season", events: ["Spring break", "Daylight savings"] },
    { name: "April", shortName: "Apr", demandIndex: 100, weather: "warm", peakReason: "Peak spring cleaning", events: ["Easter", "Allergy season bedding"] },
    { name: "May", shortName: "May", demandIndex: 90, weather: "warm", events: ["Mother's Day", "Memorial Day"] },
    { name: "June", shortName: "Jun", demandIndex: 75, weather: "hot", events: ["Summer vacation starts"] },
    { name: "July", shortName: "Jul", demandIndex: 70, weather: "hot", peakReason: "Summer slowdown" },
    { name: "August", shortName: "Aug", demandIndex: 85, weather: "hot", events: ["Back to school prep"] },
    { name: "September", shortName: "Sep", demandIndex: 95, weather: "warm", peakReason: "Back to school", events: ["Labor Day", "College move-in"] },
    { name: "October", shortName: "Oct", demandIndex: 85, weather: "cool", events: ["Halloween costumes"] },
    { name: "November", shortName: "Nov", demandIndex: 90, weather: "cool", events: ["Thanksgiving linens", "Holiday prep"] },
    { name: "December", shortName: "Dec", demandIndex: 80, weather: "cold", events: ["Holiday parties", "Gift wrapping"] }
  ],
  tropical: [
    { name: "January", shortName: "Jan", demandIndex: 90, weather: "warm", events: ["Tourist season peak"] },
    { name: "February", shortName: "Feb", demandIndex: 95, weather: "warm", peakReason: "Peak tourist season" },
    { name: "March", shortName: "Mar", demandIndex: 100, weather: "warm", peakReason: "Spring break rush", events: ["Spring break tourists"] },
    { name: "April", shortName: "Apr", demandIndex: 85, weather: "warm" },
    { name: "May", shortName: "May", demandIndex: 75, weather: "rainy", peakReason: "Rainy season starts" },
    { name: "June", shortName: "Jun", demandIndex: 80, weather: "rainy" },
    { name: "July", shortName: "Jul", demandIndex: 85, weather: "rainy" },
    { name: "August", shortName: "Aug", demandIndex: 80, weather: "rainy" },
    { name: "September", shortName: "Sep", demandIndex: 75, weather: "rainy" },
    { name: "October", shortName: "Oct", demandIndex: 80, weather: "rainy" },
    { name: "November", shortName: "Nov", demandIndex: 85, weather: "warm" },
    { name: "December", shortName: "Dec", demandIndex: 95, weather: "warm", peakReason: "Holiday tourists", events: ["Holiday visitors"] }
  ]
};

const WEATHER_ICONS: Record<string, React.ElementType> = {
  hot: Sun,
  warm: Sun,
  cool: Cloud,
  cold: Snowflake,
  rainy: Droplets
};

const WEATHER_COLORS: Record<string, string> = {
  hot: "text-orange-500",
  warm: "text-yellow-500",
  cool: "text-blue-400",
  cold: "text-blue-600",
  rainy: "text-cyan-500"
};

function getDemandLevel(index: number): { label: string; color: string; bgColor: string } {
  if (index >= 95) return { label: "Peak", color: "text-green-600", bgColor: "bg-green-500" };
  if (index >= 85) return { label: "High", color: "text-lime-600", bgColor: "bg-lime-500" };
  if (index >= 75) return { label: "Moderate", color: "text-amber-600", bgColor: "bg-amber-500" };
  return { label: "Low", color: "text-blue-600", bgColor: "bg-blue-500" };
}

export function SeasonalDemandCalendar({ region = "US", climate = "temperate", isSubscriber = false, onUpgradeClick }: SeasonalDemandCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [view, setView] = useState<"calendar" | "chart">("calendar");
  
  const monthData = SEASONAL_DATA[climate] || SEASONAL_DATA.temperate;
  const currentMonth = new Date().getMonth();
  
  const peakMonths = monthData
    .map((m, i) => ({ ...m, index: i }))
    .filter(m => m.demandIndex >= 95)
    .map(m => m.shortName);
  
  const lowMonths = monthData
    .map((m, i) => ({ ...m, index: i }))
    .filter(m => m.demandIndex < 75)
    .map(m => m.shortName);
  
  const annualAvg = monthData.reduce((sum, m) => sum + m.demandIndex, 0) / 12;
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
            <p className="text-muted-foreground mb-4">
              Seasonal demand data requires a Pro subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Seasonal Demand Calendar
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
              <Calendar className="h-5 w-5 text-blue-500" />
              Seasonal Demand Calendar
            </CardTitle>
            <CardDescription>
              Monthly demand patterns for {climate} climate regions
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant={view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              Calendar
            </Button>
            <Button
              variant={view === "chart" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("chart")}
            >
              Chart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Peak Months</p>
            <p className="font-semibold text-green-600">{peakMonths.join(", ") || "None"}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Low Months</p>
            <p className="font-semibold text-blue-600">{lowMonths.join(", ") || "None"}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Annual Avg</p>
            <p className="font-semibold text-amber-600">{annualAvg.toFixed(0)}%</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Variance</p>
            <p className="font-semibold text-purple-600">
              {(Math.max(...monthData.map(m => m.demandIndex)) - Math.min(...monthData.map(m => m.demandIndex))).toFixed(0)}%
            </p>
          </div>
        </div>
        
        {view === "calendar" ? (
          <div className="grid grid-cols-4 gap-2">
            {monthData.map((month, index) => {
              const demand = getDemandLevel(month.demandIndex);
              const WeatherIcon = WEATHER_ICONS[month.weather];
              const isCurrentMonth = index === currentMonth;
              
              return (
                <Tooltip key={month.name}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedMonth(selectedMonth === index ? null : index)}
                      className={cn(
                        "p-3 rounded-lg border transition-all hover-elevate text-left",
                        selectedMonth === index && "ring-2 ring-primary",
                        isCurrentMonth && "border-primary"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{month.shortName}</span>
                        <WeatherIcon className={cn("h-3 w-3", WEATHER_COLORS[month.weather])} />
                      </div>
                      <div className="flex items-center gap-1">
                        <div 
                          className={cn("w-2 h-2 rounded-full", demand.bgColor)}
                        />
                        <span className={cn("text-sm font-bold", demand.color)}>
                          {month.demandIndex}%
                        </span>
                      </div>
                      {month.peakReason && (
                        <div className="mt-1">
                          {month.demandIndex >= 95 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : month.demandIndex < 75 ? (
                            <TrendingDown className="h-3 w-3 text-blue-500" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{month.name}</p>
                      <p className="text-xs">Demand: {demand.label} ({month.demandIndex}%)</p>
                      {month.peakReason && (
                        <p className="text-xs text-muted-foreground">{month.peakReason}</p>
                      )}
                      {month.events && month.events.length > 0 && (
                        <p className="text-xs">Events: {month.events.join(", ")}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {monthData.map((month, index) => {
              const demand = getDemandLevel(month.demandIndex);
              const isCurrentMonth = index === currentMonth;
              
              return (
                <div key={month.name} className="flex items-center gap-3">
                  <span className={cn(
                    "w-8 text-xs font-medium",
                    isCurrentMonth && "text-primary font-bold"
                  )}>
                    {month.shortName}
                  </span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                    <div 
                      className={cn("h-full transition-all", demand.bgColor)}
                      style={{ width: `${month.demandIndex}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {month.demandIndex}%
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs w-16 justify-center">
                    {demand.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
        
        {selectedMonth !== null && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">{monthData[selectedMonth].name} Details</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Demand Index</span>
                <span className="font-medium">{monthData[selectedMonth].demandIndex}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weather Pattern</span>
                <span className="font-medium capitalize">{monthData[selectedMonth].weather}</span>
              </div>
              {monthData[selectedMonth].peakReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Key Factor</span>
                  <span className="font-medium">{monthData[selectedMonth].peakReason}</span>
                </div>
              )}
              {monthData[selectedMonth].events && (
                <div>
                  <span className="text-muted-foreground">Events:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {monthData[selectedMonth].events?.map((event, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg">
          <Info className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">Staffing Tip</p>
            <p className="text-muted-foreground">
              Plan for {peakMonths.length > 0 ? `extra staffing in ${peakMonths.join(" and ")}` : "consistent staffing year-round"}. 
              Consider promotional pricing during slower months to maintain cash flow.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SeasonalDemandCalendar;
