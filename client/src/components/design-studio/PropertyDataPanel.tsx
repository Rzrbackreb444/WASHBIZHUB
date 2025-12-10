import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Building2,
  Map,
  Zap,
  Droplets,
  Flame,
  Store,
  Users,
  Car,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  DollarSign,
  Ruler,
  MapPin
} from "lucide-react";

interface ParcelData {
  address: string;
  coordinates: { lat: number; lng: number };
  parcelSize: number;
  parcelDimensions: { width: number; depth: number };
  zoning: string;
  lotNumber: string;
  yearBuilt?: number;
  buildingSize?: number;
  assessed?: number;
}

interface UtilityConnection {
  type: "electric" | "water" | "gas" | "sewer";
  status: "available" | "limited" | "unavailable";
  capacity?: string;
  notes?: string;
}

interface NearbyBusiness {
  name: string;
  type: string;
  distance: string;
  impact: "positive" | "neutral" | "competitive";
}

interface PropertyDataPanelProps {
  parcelData: ParcelData | null;
  onRequestZoningReport?: () => void;
}

const MOCK_UTILITIES: UtilityConnection[] = [
  { type: "electric", status: "available", capacity: "400A 3-Phase", notes: "Suitable for commercial laundry" },
  { type: "water", status: "available", capacity: "2\" main", notes: "High flow capacity available" },
  { type: "gas", status: "available", capacity: "Natural gas", notes: "Connected to main line" },
  { type: "sewer", status: "available", capacity: "6\" connection", notes: "Commercial capacity" }
];

const MOCK_NEARBY_BUSINESSES: NearbyBusiness[] = [
  { name: "Metro Grocery", type: "Grocery Store", distance: "0.2 mi", impact: "positive" },
  { name: "Quick Stop Gas", type: "Gas Station", distance: "0.1 mi", impact: "positive" },
  { name: "Sunny Apartments", type: "Multi-Family Housing", distance: "0.3 mi", impact: "positive" },
  { name: "Clean & Fresh Laundry", type: "Laundromat", distance: "1.2 mi", impact: "competitive" },
  { name: "Dollar General", type: "Retail Store", distance: "0.4 mi", impact: "neutral" }
];

export function PropertyDataPanel({ parcelData, onRequestZoningReport }: PropertyDataPanelProps) {
  const [utilitiesExpanded, setUtilitiesExpanded] = useState(true);
  const [neighborsExpanded, setNeighborsExpanded] = useState(true);
  const [zoningExpanded, setZoningExpanded] = useState(true);

  if (!parcelData) {
    return (
      <Card className="bg-gradient-to-br from-[#001F3F] to-[#002850] border-emerald-500/30">
        <CardContent className="py-8 text-center">
          <Map className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No Property Selected</p>
          <p className="text-white/30 text-xs mt-1">
            Search for an address to view property data
          </p>
        </CardContent>
      </Card>
    );
  }

  const getUtilityIcon = (type: UtilityConnection["type"]) => {
    switch (type) {
      case "electric": return <Zap className="h-4 w-4" />;
      case "water": return <Droplets className="h-4 w-4" />;
      case "gas": return <Flame className="h-4 w-4" />;
      case "sewer": return <Droplets className="h-4 w-4" />;
    }
  };

  const getUtilityColor = (status: UtilityConnection["status"]) => {
    switch (status) {
      case "available": return "text-green-400";
      case "limited": return "text-amber-400";
      case "unavailable": return "text-red-400";
    }
  };

  const getImpactColor = (impact: NearbyBusiness["impact"]) => {
    switch (impact) {
      case "positive": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "neutral": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "competitive": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }
  };

  const getImpactIcon = (impact: NearbyBusiness["impact"]) => {
    switch (impact) {
      case "positive": return <CheckCircle2 className="h-3 w-3" />;
      case "neutral": return <Info className="h-3 w-3" />;
      case "competitive": return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const zoningGrade = parcelData.zoning?.includes("Commercial") ? "A" : 
                     parcelData.zoning?.includes("Business") ? "B" : "C";

  return (
    <Card className="bg-gradient-to-br from-[#001F3F] to-[#002850] border-emerald-500/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Building2 className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-lg">Property Data</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-white text-sm font-medium" data-testid="text-property-address">
                {parcelData.address}
              </p>
              <p className="text-white/50 text-xs">{parcelData.lotNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Ruler className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg" data-testid="text-property-sqft">
              {parcelData.parcelSize.toLocaleString()}
            </p>
            <p className="text-white/50 text-[10px]">Square Feet</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <DollarSign className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg" data-testid="text-property-assessed">
              ${((parcelData.assessed || 0) / 1000).toFixed(0)}K
            </p>
            <p className="text-white/50 text-[10px]">Assessed Value</p>
          </div>
        </div>

        {parcelData.yearBuilt && (
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-2 text-sm">
            <span className="text-white/60">Year Built</span>
            <span className="text-white font-medium" data-testid="text-property-year">{parcelData.yearBuilt}</span>
          </div>
        )}

        <Separator className="bg-white/10" />

        <Collapsible open={zoningExpanded} onOpenChange={setZoningExpanded}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors" data-testid="button-toggle-zoning">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span className="text-white/80 text-sm font-medium">Zoning Information</span>
            </div>
            {zoningExpanded ? (
              <ChevronUp className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/40" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Zone Code</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30" data-testid="badge-zoning-code">
                  {parcelData.zoning}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Laundromat Suitable</span>
                <Badge className={`${
                  zoningGrade === "A" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                  zoningGrade === "B" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                  "bg-red-500/20 text-red-400 border-red-500/30"
                }`} data-testid="badge-zoning-suitable">
                  {zoningGrade === "A" ? "Permitted" : zoningGrade === "B" ? "Conditional" : "Review Required"}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Zoning Compatibility</span>
                  <span className="text-white/70">{zoningGrade === "A" ? "95" : zoningGrade === "B" ? "75" : "50"}%</span>
                </div>
                <Progress 
                  value={zoningGrade === "A" ? 95 : zoningGrade === "B" ? 75 : 50} 
                  className="h-1.5 bg-white/10"
                />
              </div>
              {onRequestZoningReport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRequestZoningReport}
                  className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 mt-2"
                  data-testid="button-request-zoning-report"
                >
                  <FileText className="h-3 w-3 mr-1.5" />
                  Request Full Zoning Report
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-white/10" />

        <Collapsible open={utilitiesExpanded} onOpenChange={setUtilitiesExpanded}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors" data-testid="button-toggle-utilities">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-white/80 text-sm font-medium">Utility Connections</span>
            </div>
            {utilitiesExpanded ? (
              <ChevronUp className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/40" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2 pl-6">
              {MOCK_UTILITIES.map((utility) => (
                <div key={utility.type} className="bg-white/5 rounded-lg p-2" data-testid={`utility-${utility.type}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={getUtilityColor(utility.status)}>
                        {getUtilityIcon(utility.type)}
                      </span>
                      <span className="text-white/80 text-sm capitalize">{utility.type}</span>
                    </div>
                    <Badge className={`text-[10px] ${
                      utility.status === "available" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      utility.status === "limited" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}>
                      {utility.status}
                    </Badge>
                  </div>
                  {utility.capacity && (
                    <p className="text-white/50 text-[10px] ml-6">{utility.capacity}</p>
                  )}
                  {utility.notes && (
                    <p className="text-white/40 text-[10px] ml-6 mt-0.5">{utility.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-white/10" />

        <Collapsible open={neighborsExpanded} onOpenChange={setNeighborsExpanded}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors" data-testid="button-toggle-neighbors">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-cyan-400" />
              <span className="text-white/80 text-sm font-medium">Nearby Businesses</span>
            </div>
            {neighborsExpanded ? (
              <ChevronUp className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/40" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2 pl-6">
              {MOCK_NEARBY_BUSINESSES.map((business, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-2" data-testid={`nearby-business-${index}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white/80 text-sm font-medium">{business.name}</p>
                      <p className="text-white/50 text-[10px]">{business.type} • {business.distance}</p>
                    </div>
                    <Badge className={`text-[10px] flex items-center gap-1 ${getImpactColor(business.impact)}`}>
                      {getImpactIcon(business.impact)}
                      {business.impact}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 mt-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <div>
                    <p className="text-cyan-400 text-xs font-medium">Traffic Generators</p>
                    <p className="text-white/50 text-[10px]">3 positive foot traffic sources nearby</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-orange-400" />
                  <div>
                    <p className="text-orange-400 text-xs font-medium">Competition</p>
                    <p className="text-white/50 text-[10px]">1 competitor within 1.5 mile radius</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
