import { useState, useEffect } from "react";
import { MapPin, Layers, Eye, EyeOff, Info, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MarketHeatMapProps {
  centerCoordinates?: { lat: number; lng: number };
  address?: string;
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

interface HeatMapZone {
  id: string;
  name: string;
  opportunityScore: number;
  color: string;
  demographics: {
    population: number;
    medianIncome: number;
    renterPct: number;
  };
  competition: number;
}

const OPPORTUNITY_COLORS = {
  goldMine: "#22C55E",
  highOpportunity: "#A3E635",
  goodPotential: "#FBBF24",
  roomToGrow: "#F59E0B",
  saturated: "#EF4444"
};

const MOCK_ZONES: HeatMapZone[] = [
  {
    id: "zone-1",
    name: "Downtown Core",
    opportunityScore: 85,
    color: OPPORTUNITY_COLORS.goldMine,
    demographics: { population: 45000, medianIncome: 52000, renterPct: 68 },
    competition: 2
  },
  {
    id: "zone-2",
    name: "University District",
    opportunityScore: 78,
    color: OPPORTUNITY_COLORS.highOpportunity,
    demographics: { population: 32000, medianIncome: 38000, renterPct: 82 },
    competition: 3
  },
  {
    id: "zone-3",
    name: "Residential West",
    opportunityScore: 65,
    color: OPPORTUNITY_COLORS.goodPotential,
    demographics: { population: 28000, medianIncome: 65000, renterPct: 45 },
    competition: 4
  },
  {
    id: "zone-4",
    name: "Industrial Park",
    opportunityScore: 55,
    color: OPPORTUNITY_COLORS.roomToGrow,
    demographics: { population: 8000, medianIncome: 48000, renterPct: 35 },
    competition: 1
  },
  {
    id: "zone-5",
    name: "Shopping District",
    opportunityScore: 42,
    color: OPPORTUNITY_COLORS.saturated,
    demographics: { population: 18000, medianIncome: 72000, renterPct: 28 },
    competition: 7
  }
];

function getOpportunityLabel(score: number): string {
  if (score >= 85) return "Gold Mine Zone";
  if (score >= 70) return "High Opportunity";
  if (score >= 55) return "Good Potential";
  if (score >= 40) return "Room to Grow";
  return "Saturated Market";
}

function getOpportunityColor(score: number): string {
  if (score >= 85) return OPPORTUNITY_COLORS.goldMine;
  if (score >= 70) return OPPORTUNITY_COLORS.highOpportunity;
  if (score >= 55) return OPPORTUNITY_COLORS.goodPotential;
  if (score >= 40) return OPPORTUNITY_COLORS.roomToGrow;
  return OPPORTUNITY_COLORS.saturated;
}

export function MarketHeatMap({
  centerCoordinates,
  address,
  isSubscriber = false,
  onUpgradeClick
}: MarketHeatMapProps) {
  const [selectedZone, setSelectedZone] = useState<HeatMapZone | null>(null);
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [showDemographics, setShowDemographics] = useState(true);
  const [radius, setRadius] = useState(3);
  const [overlayType, setOverlayType] = useState<"opportunity" | "income" | "renters" | "competition">("opportunity");
  
  const zones = MOCK_ZONES;
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enterprise Feature</h3>
            <p className="text-muted-foreground mb-4">
              Market Heat Maps require an Enterprise subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Enterprise
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-500" />
            Market Heat Map
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
              <Layers className="h-5 w-5 text-orange-500" />
              Market Heat Map
            </CardTitle>
            <CardDescription>
              Opportunity zones within {radius} mile radius
            </CardDescription>
          </div>
          <Select value={overlayType} onValueChange={(v) => setOverlayType(v as typeof overlayType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opportunity">Opportunity Score</SelectItem>
              <SelectItem value="income">Median Income</SelectItem>
              <SelectItem value="renters">Renter Density</SelectItem>
              <SelectItem value="competition">Competition</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="competitors"
              checked={showCompetitors}
              onCheckedChange={setShowCompetitors}
            />
            <Label htmlFor="competitors">Show Competitors</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="demographics"
              checked={showDemographics}
              onCheckedChange={setShowDemographics}
            />
            <Label htmlFor="demographics">Show Demographics</Label>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <Label className="whitespace-nowrap">Radius: {radius} mi</Label>
            <Slider
              value={[radius]}
              onValueChange={([v]) => setRadius(v)}
              min={1}
              max={10}
              step={0.5}
              className="max-w-32"
            />
          </div>
        </div>
        
        <div className="relative h-72 bg-muted rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {zones.map((zone, index) => {
                const cx = 50 + (index % 3) * 120 + Math.random() * 40;
                const cy = 60 + Math.floor(index / 3) * 120 + Math.random() * 40;
                const r = 40 + zone.opportunityScore / 3;
                
                return (
                  <g key={zone.id}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={getOpportunityColor(zone.opportunityScore)}
                      opacity={0.4}
                      className="cursor-pointer hover:opacity-60 transition-opacity"
                      onClick={() => setSelectedZone(zone)}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r * 0.6}
                      fill={getOpportunityColor(zone.opportunityScore)}
                      opacity={0.6}
                      className="cursor-pointer"
                      onClick={() => setSelectedZone(zone)}
                    />
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-xs font-medium pointer-events-none"
                    >
                      {zone.opportunityScore}
                    </text>
                    {showCompetitors && (
                      <text
                        x={cx}
                        y={cy + 15}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px] pointer-events-none"
                      >
                        {zone.competition} comp
                      </text>
                    )}
                  </g>
                );
              })}
              
              <circle
                cx={200}
                cy={150}
                r={8}
                fill="#3B82F6"
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                x={200}
                y={175}
                textAnchor="middle"
                className="fill-blue-600 text-[10px] font-medium"
              >
                Your Location
              </text>
            </svg>
          </div>
          
          <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur rounded-lg p-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: OPPORTUNITY_COLORS.goldMine }} />
                <span>Gold Mine</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: OPPORTUNITY_COLORS.highOpportunity }} />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: OPPORTUNITY_COLORS.goodPotential }} />
                <span>Good</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: OPPORTUNITY_COLORS.saturated }} />
                <span>Saturated</span>
              </div>
            </div>
          </div>
        </div>
        
        {selectedZone && (
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getOpportunityColor(selectedZone.opportunityScore) }}
                />
                <h4 className="font-medium">{selectedZone.name}</h4>
              </div>
              <Badge style={{ backgroundColor: getOpportunityColor(selectedZone.opportunityScore), color: "#fff" }}>
                {getOpportunityLabel(selectedZone.opportunityScore)}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Opportunity</p>
                <p className="font-semibold">{selectedZone.opportunityScore}/100</p>
              </div>
              <div>
                <p className="text-muted-foreground">Population</p>
                <p className="font-semibold">{selectedZone.demographics.population.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Median Income</p>
                <p className="font-semibold">${selectedZone.demographics.medianIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Renter %</p>
                <p className="font-semibold">{selectedZone.demographics.renterPct}%</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedZone.competition} existing laundromat{selectedZone.competition !== 1 ? "s" : ""} in zone
              </span>
              <Button variant="outline" size="sm">
                Analyze This Zone
              </Button>
            </div>
          </div>
        )}
        
        <div className="grid gap-2">
          {zones.sort((a, b) => b.opportunityScore - a.opportunityScore).map((zone) => (
            <div 
              key={zone.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover-elevate",
                selectedZone?.id === zone.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedZone(zone)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getOpportunityColor(zone.opportunityScore) }}
                />
                <span className="font-medium">{zone.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{zone.competition} competitors</span>
                <Badge variant="outline">{zone.opportunityScore}/100</Badge>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Heat map zones are based on demographic data, competition density, and CLEANBI algorithms.
          Click zones to see detailed analysis.
        </p>
      </CardContent>
    </Card>
  );
}

export default MarketHeatMap;
