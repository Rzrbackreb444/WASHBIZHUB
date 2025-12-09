import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, MapPin, Users, DollarSign, Car, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LocationData {
  address: string;
  cleanbiScore: number;
  grade: string;
  competitorCount: number;
  populationDensity: number;
  medianIncome: number;
  trafficScore: number;
  walkScore?: number;
  transitScore?: number;
  opportunityLevel: string;
}

interface LocationComparisonProps {
  locations: LocationData[];
  onRemoveLocation?: (index: number) => void;
}

const GRADE_COLORS: Record<string, string> = {
  "A": "bg-green-500",
  "B": "bg-lime-500",
  "C": "bg-amber-500",
  "Needs Work": "bg-yellow-600"
};

const GRADE_TEXT_COLORS: Record<string, string> = {
  "A": "text-green-500",
  "B": "text-lime-500",
  "C": "text-amber-500",
  "Needs Work": "text-yellow-600"
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function ComparisonIndicator({ value1, value2, higherIsBetter = true }: { 
  value1: number; 
  value2: number; 
  higherIsBetter?: boolean;
}) {
  const diff = value1 - value2;
  const isWinner = higherIsBetter ? diff > 0 : diff < 0;
  const isLoser = higherIsBetter ? diff < 0 : diff > 0;
  
  if (Math.abs(diff) < 0.01) {
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
  
  if (isWinner) {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  }
  
  return <TrendingDown className="h-4 w-4 text-red-500" />;
}

function MetricRow({ 
  label, 
  icon: Icon, 
  values, 
  formatter = (v: number) => v.toString(),
  higherIsBetter = true 
}: {
  label: string;
  icon: React.ElementType;
  values: number[];
  formatter?: (value: number) => string;
  higherIsBetter?: boolean;
}) {
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const winnerIndex = higherIsBetter 
    ? values.indexOf(maxValue) 
    : values.indexOf(minValue);
  
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `1fr repeat(${values.length}, 1fr)` }}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      {values.map((value, index) => (
        <div 
          key={index}
          className={cn(
            "text-center py-2 px-3 rounded-md text-sm font-medium",
            index === winnerIndex && values.length > 1 ? "bg-green-500/10 text-green-600 dark:text-green-400" : ""
          )}
        >
          <div className="flex items-center justify-center gap-1">
            <span>{formatter(value)}</span>
            {values.length > 1 && index > 0 && (
              <ComparisonIndicator 
                value1={value} 
                value2={values[0]} 
                higherIsBetter={higherIsBetter} 
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LocationComparison({ locations, onRemoveLocation }: LocationComparisonProps) {
  const [showDetails, setShowDetails] = useState(true);
  
  if (locations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Locations to Compare</h3>
          <p className="text-muted-foreground">
            Analyze at least 2 locations to compare them side-by-side.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (locations.length === 1) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Add Another Location</h3>
          <p className="text-muted-foreground">
            You need at least 2 locations for comparison. Current: {locations[0].address}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const winnerIndex = locations.reduce((best, loc, index) => 
    loc.cleanbiScore > locations[best].cleanbiScore ? index : best, 0);
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Location Comparison
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4" style={{ gridTemplateColumns: `1fr repeat(${locations.length}, 1fr)` }}>
          <div />
          {locations.map((location, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="relative">
                {index === winnerIndex && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white">
                    <Trophy className="h-3 w-3 mr-1" />
                    Winner
                  </Badge>
                )}
                <div className={cn(
                  "mt-4 text-4xl font-bold",
                  GRADE_TEXT_COLORS[location.grade] || "text-foreground"
                )}>
                  {location.grade}
                </div>
                <div className="text-2xl font-semibold">{location.cleanbiScore.toFixed(1)}</div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 px-2">
                {location.address}
              </p>
              {onRemoveLocation && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => onRemoveLocation(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {showDetails && (
          <div className="space-y-3 pt-4 border-t">
            <MetricRow
              label="CLEANBI Score"
              icon={TrendingUp}
              values={locations.map(l => l.cleanbiScore)}
              formatter={(v) => v.toFixed(1)}
              higherIsBetter={true}
            />
            <MetricRow
              label="Competition"
              icon={Building}
              values={locations.map(l => l.competitorCount)}
              formatter={(v) => `${v} nearby`}
              higherIsBetter={false}
            />
            <MetricRow
              label="Population Density"
              icon={Users}
              values={locations.map(l => l.populationDensity)}
              formatter={(v) => `${formatNumber(v)}/mi²`}
              higherIsBetter={true}
            />
            <MetricRow
              label="Median Income"
              icon={DollarSign}
              values={locations.map(l => l.medianIncome)}
              formatter={formatCurrency}
              higherIsBetter={true}
            />
            <MetricRow
              label="Traffic Score"
              icon={Car}
              values={locations.map(l => l.trafficScore)}
              formatter={(v) => `${v}/100`}
              higherIsBetter={true}
            />
            {locations.some(l => l.walkScore) && (
              <MetricRow
                label="Walk Score"
                icon={MapPin}
                values={locations.map(l => l.walkScore || 0)}
                formatter={(v) => `${v}/100`}
                higherIsBetter={true}
              />
            )}
          </div>
        )}
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Summary</h4>
          <div className="grid gap-2">
            {locations.map((location, index) => {
              const strengths: string[] = [];
              const weaknesses: string[] = [];
              
              const maxDensity = Math.max(...locations.map(l => l.populationDensity));
              const minCompetition = Math.min(...locations.map(l => l.competitorCount));
              const maxIncome = Math.max(...locations.map(l => l.medianIncome));
              const maxTraffic = Math.max(...locations.map(l => l.trafficScore));
              
              if (location.populationDensity === maxDensity) strengths.push("Highest population density");
              if (location.competitorCount === minCompetition) strengths.push("Lowest competition");
              if (location.medianIncome === maxIncome) strengths.push("Highest income area");
              if (location.trafficScore === maxTraffic) strengths.push("Best traffic exposure");
              
              if (location.populationDensity < maxDensity * 0.7) weaknesses.push("Lower population");
              if (location.competitorCount > minCompetition * 1.5) weaknesses.push("More competition");
              
              return (
                <div key={index} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-white", GRADE_COLORS[location.grade])}>
                      {location.grade}
                    </Badge>
                    <span className="text-sm font-medium truncate">{location.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {strengths.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
                        ✓ {s}
                      </Badge>
                    ))}
                    {weaknesses.map((w, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                        ⚠ {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LocationComparison;
