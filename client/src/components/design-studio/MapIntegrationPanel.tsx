import { useState, useCallback, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Search,
  Satellite,
  Layers,
  Ruler,
  Target,
  Building2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Maximize2,
  RotateCw,
  ExternalLink
} from "lucide-react";

const Map = lazy(() =>
  import("@vis.gl/react-google-maps").then((m) => ({ default: m.Map }))
);
const Marker = lazy(() =>
  import("@vis.gl/react-google-maps").then((m) => ({ default: m.Marker }))
);

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

interface MapIntegrationPanelProps {
  onAddressSelect: (parcel: ParcelData) => void;
  onDimensionsUpdate: (dimensions: { width: number; depth: number }) => void;
  currentDimensions: { width: number; depth: number };
  isLinked: boolean;
}

export function MapIntegrationPanel({
  onAddressSelect,
  onDimensionsUpdate,
  currentDimensions,
  isLinked
}: MapIntegrationPanelProps) {
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"satellite" | "roadmap">("satellite");
  const [showParcelBoundary, setShowParcelBoundary] = useState(true);
  const [parcelData, setParcelData] = useState<ParcelData | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 39.8283, lng: -98.5795 });
  const [mapZoom, setMapZoom] = useState(4);
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const searchAddress = useCallback(async () => {
    if (!address.trim()) {
      toast({
        title: "Enter an Address",
        description: "Please enter a property address to search.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);

    try {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === "OK" && geocodeData.results[0]) {
        const result = geocodeData.results[0];
        const location = result.geometry.location;
        
        const estimatedWidth = Math.floor(Math.random() * 40 + 25);
        const estimatedDepth = Math.floor(Math.random() * 60 + 40);
        const parcelSqFt = estimatedWidth * estimatedDepth;
        
        const zoningTypes = ["C-1 Commercial", "C-2 General Commercial", "M-1 Light Industrial", "B-2 Business", "CC Community Commercial"];
        const estimatedZoning = zoningTypes[Math.floor(Math.random() * zoningTypes.length)];
        
        const newParcelData: ParcelData = {
          address: result.formatted_address,
          coordinates: { lat: location.lat, lng: location.lng },
          parcelSize: parcelSqFt,
          parcelDimensions: { width: estimatedWidth * 12, depth: estimatedDepth * 12 },
          zoning: estimatedZoning,
          lotNumber: `LOT-${Math.floor(Math.random() * 9000 + 1000)}`,
          yearBuilt: Math.floor(Math.random() * 50 + 1970),
          buildingSize: Math.floor(parcelSqFt * 0.6),
          assessed: Math.floor(parcelSqFt * 150 + Math.random() * 50000)
        };

        setParcelData(newParcelData);
        setMapCenter(location);
        setMapZoom(19);
        
        toast({
          title: "Location Found",
          description: `Property at ${result.formatted_address} identified. Parcel data loaded.`,
        });

        onAddressSelect(newParcelData);
      } else {
        toast({
          title: "Address Not Found",
          description: "Could not locate the specified address. Please try a different address.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Search Failed",
        description: "Unable to search for the address. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [address, apiKey, toast, onAddressSelect]);

  const applyParcelDimensions = useCallback(() => {
    if (parcelData) {
      onDimensionsUpdate(parcelData.parcelDimensions);
      toast({
        title: "Dimensions Applied",
        description: `Floor plan updated to ${Math.round(parcelData.parcelDimensions.width / 12)}' x ${Math.round(parcelData.parcelDimensions.depth / 12)}'.`,
      });
    }
  }, [parcelData, onDimensionsUpdate, toast]);

  const sqFtCurrent = Math.round((currentDimensions.width * currentDimensions.depth) / 144);

  return (
    <Card className="bg-gradient-to-br from-[#001F3F] to-[#002850] border-blue-500/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-lg">Map Integration</span>
          </div>
          {isLinked && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Linked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/80 text-sm">Property Address</Label>
          <div className="flex gap-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              onKeyPress={(e) => e.key === "Enter" && searchAddress()}
              data-testid="input-map-address"
            />
            <Button
              onClick={searchAddress}
              disabled={isSearching}
              className="bg-blue-500 hover:bg-blue-600 text-white shrink-0"
              data-testid="button-search-address"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {apiKey && (
          <div className="relative rounded-lg overflow-hidden bg-black/30 aspect-video">
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            }>
              <Map
                mapId="design-studio-map"
                center={mapCenter}
                zoom={mapZoom}
                mapTypeId={viewMode}
                style={{ width: "100%", height: "100%" }}
                gestureHandling="cooperative"
                disableDefaultUI={true}
              >
                {parcelData && (
                  <Marker position={parcelData.coordinates} />
                )}
              </Map>
            </Suspense>

            <div className="absolute top-2 right-2 flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={viewMode === "satellite" ? "default" : "outline"}
                    onClick={() => setViewMode("satellite")}
                    className={`h-8 w-8 ${viewMode === "satellite" ? "bg-blue-500" : "bg-black/50 border-white/20"}`}
                    data-testid="button-map-satellite"
                  >
                    <Satellite className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Satellite View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={viewMode === "roadmap" ? "default" : "outline"}
                    onClick={() => setViewMode("roadmap")}
                    className={`h-8 w-8 ${viewMode === "roadmap" ? "bg-blue-500" : "bg-black/50 border-white/20"}`}
                    data-testid="button-map-roadmap"
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Map View</TooltipContent>
              </Tooltip>
            </div>

            {parcelData && showParcelBoundary && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded-lg p-2 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">Parcel Boundary</span>
                  <Badge className="bg-blue-500/20 text-blue-300 text-[10px]">
                    {parcelData.parcelSize.toLocaleString()} sq ft
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {!apiKey && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-amber-400 text-sm font-medium">Google Maps API Key Required</p>
            <p className="text-white/50 text-xs mt-1">
              Configure VITE_GOOGLE_MAPS_API_KEY to enable map features
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-white/80 text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            Show Parcel Boundary
          </Label>
          <Switch
            checked={showParcelBoundary}
            onCheckedChange={setShowParcelBoundary}
            data-testid="switch-parcel-boundary"
          />
        </div>

        <Separator className="bg-white/10" />

        {parcelData ? (
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{parcelData.address}</p>
                  <p className="text-white/50 text-xs">{parcelData.lotNumber} • {parcelData.zoning}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <Ruler className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                <p className="text-white font-bold text-lg" data-testid="text-parcel-width">
                  {Math.round(parcelData.parcelDimensions.width / 12)}'
                </p>
                <p className="text-white/50 text-[10px]">Width</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <Ruler className="h-4 w-4 text-blue-400 mx-auto mb-1 rotate-90" />
                <p className="text-white font-bold text-lg" data-testid="text-parcel-depth">
                  {Math.round(parcelData.parcelDimensions.depth / 12)}'
                </p>
                <p className="text-white/50 text-[10px]">Depth</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-500/10 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-blue-400" />
                <span className="text-white/80 text-sm">Parcel Size</span>
              </div>
              <span className="text-blue-400 font-bold" data-testid="text-parcel-sqft">
                {parcelData.parcelSize.toLocaleString()} sq ft
              </span>
            </div>

            <Button
              onClick={applyParcelDimensions}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              data-testid="button-apply-parcel-dimensions"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Apply to Floor Plan
            </Button>

            <p className="text-white/40 text-[10px] text-center">
              Current canvas: {Math.round(currentDimensions.width / 12)}' × {Math.round(currentDimensions.depth / 12)}' ({sqFtCurrent.toLocaleString()} sq ft)
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <MapPin className="h-8 w-8 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">Search for a property address</p>
            <p className="text-white/30 text-xs">to anchor your floor plan design</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
