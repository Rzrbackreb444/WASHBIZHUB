import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { 
  Map, 
  Layers, 
  MapPin, 
  Search, 
  Play, 
  Share2, 
  Eye, 
  Flame, 
  Users, 
  DollarSign,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Video,
  Camera,
  Maximize2,
  X,
  Star,
  TrendingUp,
  Target,
  Sparkles,
  Globe,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

declare global {
  interface Window {
    google: any;
  }
}

interface AnalysisResult {
  address: string;
  lat: number;
  lng: number;
  cleanbiScore: number;
  grade: string;
  competitorCount: number;
  populationDensity: number;
  medianIncome: number;
  trafficScore: number;
  opportunityLevel: "goldmine" | "promising" | "moderate" | "saturated" | "oversaturated";
  aerialViewUrl?: string;
  streetViewUrl?: string;
}

interface Competitor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  distance: number;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "#FFD700",
  "A": "#22C55E",
  "B+": "#84CC16",
  "B": "#A3E635",
  "C+": "#FCD34D",
  "C": "#FBBF24",
  "D": "#F97316",
  "F": "#EF4444"
};

const OPPORTUNITY_COLORS: Record<string, { bg: string; text: string; pulse: boolean }> = {
  "goldmine": { bg: "bg-yellow-500", text: "Gold Mine Zone", pulse: true },
  "promising": { bg: "bg-green-500", text: "High Opportunity", pulse: false },
  "moderate": { bg: "bg-blue-500", text: "Moderate Potential", pulse: false },
  "saturated": { bg: "bg-orange-500", text: "Competitive Market", pulse: false },
  "oversaturated": { bg: "bg-red-500", text: "Oversaturated", pulse: false }
};

export default function CleanBIExplorer() {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const heatmapLayer = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [showAerialView, setShowAerialView] = useState(false);
  const [aerialVideoUrl, setAerialVideoUrl] = useState<string | null>(null);
  
  const [layers, setLayers] = useState({
    competition: true,
    demographics: false,
    traffic: false,
    opportunities: true
  });
  
  const [searchRadius, setSearchRadius] = useState([5]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && mapRef.current && !mapInstance.current) {
        initializeMap();
      }
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=visualization,places&callback=initMap`;
      script.async = true;
      script.defer = true;
      (window as any).initMap = loadGoogleMaps;
      document.head.appendChild(script);
    } else {
      loadGoogleMaps();
    }

    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(m => m.setMap(null));
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const darkStyle = [
      { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
      { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#333355" }] },
      { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1f1f33" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3d3d5c" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e1a" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4a4a6a" }] }
    ];

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4,
      styles: darkStyle,
      disableDefaultUI: true,
      zoomControl: true,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false
    });
  };

  const analyzeLocation = async () => {
    if (!address.trim()) {
      toast({ title: "Enter an address", description: "Please enter an address to analyze", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await apiRequest("POST", "/api/cleanbi-explorer/analyze", {
        address,
        radius: searchRadius[0]
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.analysis);
        setCompetitors(data.competitors || []);
        
        if (mapInstance.current && data.analysis) {
          const center = { lat: data.analysis.lat, lng: data.analysis.lng };
          mapInstance.current.setCenter(center);
          mapInstance.current.setZoom(14);
          
          markersRef.current.forEach(m => m.setMap(null));
          markersRef.current = [];

          const mainMarker = new window.google.maps.Marker({
            position: center,
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: GRADE_COLORS[data.analysis.grade] || "#C8A661",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3
            },
            zIndex: 1000
          });
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; font-family: system-ui; min-width: 200px;">
                <div style="font-size: 24px; font-weight: bold; color: ${GRADE_COLORS[data.analysis.grade]}">${data.analysis.grade}</div>
                <div style="font-size: 14px; color: #666; margin-top: 4px;">CLEANBI™ Score: ${data.analysis.cleanbiScore}</div>
                <div style="font-size: 12px; color: #888; margin-top: 8px;">${data.analysis.address}</div>
              </div>
            `
          });
          
          mainMarker.addListener("click", () => infoWindow.open(mapInstance.current, mainMarker));
          markersRef.current.push(mainMarker);

          if (layers.competition && data.competitors) {
            data.competitors.forEach((comp: Competitor) => {
              const marker = new window.google.maps.Marker({
                position: { lat: comp.lat, lng: comp.lng },
                map: mapInstance.current,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#EF4444",
                  fillOpacity: 0.8,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 1
                },
                title: comp.name
              });
              
              const compInfo = new window.google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px; font-family: system-ui;">
                    <div style="font-weight: bold;">${comp.name}</div>
                    <div style="font-size: 12px; color: #666;">⭐ ${comp.rating} (${comp.reviewCount} reviews)</div>
                    <div style="font-size: 12px; color: #888;">${comp.distance.toFixed(1)} mi away</div>
                  </div>
                `
              });
              
              marker.addListener("click", () => compInfo.open(mapInstance.current, marker));
              markersRef.current.push(marker);
            });
          }

          if (layers.opportunities && data.heatmapData) {
            if (heatmapLayer.current) {
              heatmapLayer.current.setMap(null);
            }
            
            heatmapLayer.current = new window.google.maps.visualization.HeatmapLayer({
              data: data.heatmapData.map((p: HeatmapPoint) => ({
                location: new window.google.maps.LatLng(p.lat, p.lng),
                weight: p.weight
              })),
              map: mapInstance.current,
              radius: 50,
              opacity: 0.6,
              gradient: [
                "rgba(0, 255, 0, 0)",
                "rgba(0, 255, 0, 0.5)",
                "rgba(255, 255, 0, 0.7)",
                "rgba(255, 165, 0, 0.8)",
                "rgba(255, 0, 0, 1)"
              ]
            });
          }
        }

        toast({ 
          title: `CLEANBI™ Grade: ${data.analysis.grade}`, 
          description: `Score: ${data.analysis.cleanbiScore}/100 - ${OPPORTUNITY_COLORS[data.analysis.opportunityLevel]?.text || "Analysis Complete"}`
        });
      } else {
        toast({ title: "Analysis failed", description: data.error || "Unable to analyze location", variant: "destructive" });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({ title: "Error", description: "Failed to analyze location", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchAerialView = async () => {
    if (!analysisResult) return;
    
    setShowAerialView(true);
    
    try {
      const response = await apiRequest("POST", "/api/cleanbi-explorer/aerial-view", {
        lat: analysisResult.lat,
        lng: analysisResult.lng,
        address: analysisResult.address
      });
      
      const data = await response.json();
      if (data.videoUrl) {
        setAerialVideoUrl(data.videoUrl);
      }
    } catch (error) {
      console.error("Aerial view error:", error);
      toast({ title: "Aerial View", description: "3D flyover not available for this location", variant: "default" });
    }
  };

  const shareAnalysis = async () => {
    if (!analysisResult) return;
    
    const shareUrl = `${window.location.origin}/cleanbi-explorer?address=${encodeURIComponent(analysisResult.address)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CLEANBI™ Analysis: Grade ${analysisResult.grade}`,
          text: `Check out this location analysis: ${analysisResult.address} - Score: ${analysisResult.cleanbiScore}/100`,
          url: shareUrl
        });
      } catch (e) {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied!", description: "Share link copied to clipboard" });
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share link copied to clipboard" });
    }
  };

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <>
      <Helmet>
        <title>CLEANBI™ Explorer - Interactive Market Intelligence Map | WashBizHub</title>
        <meta name="description" content="Discover high-opportunity laundromat locations with our interactive CLEANBI Explorer. 3D aerial views, competition heatmaps, and demographic data visualization." />
      </Helmet>

      <div className="fixed inset-0 bg-[#0a0a14] flex" data-testid="cleanbi-explorer">
        <div 
          className={`absolute top-0 left-0 bottom-0 z-20 bg-[#12121f] border-r border-white/10 transition-all duration-300 flex flex-col ${sidebarOpen ? "w-80" : "w-0 overflow-hidden"}`}
        >
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C8A661] to-[#8B7355] flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">CLEANBI™ Explorer</h1>
                <p className="text-xs text-white/50">Market Intelligence Map</p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeLocation()}
                placeholder="Enter any address..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                data-testid="input-explorer-address"
              />
            </div>

            <Button 
              onClick={analyzeLocation}
              disabled={isAnalyzing}
              className="w-full mt-3 bg-gradient-to-r from-[#C8A661] to-[#8B7355] hover:opacity-90 text-white"
              data-testid="button-analyze-location"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Location
                </>
              )}
            </Button>
          </div>

          {analysisResult && (
            <div className="p-4 border-b border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: GRADE_COLORS[analysisResult.grade] || "#C8A661" }}
                  >
                    {analysisResult.grade}
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{analysisResult.cleanbiScore}</div>
                    <div className="text-xs text-white/50">CLEANBI™ Score</div>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg px-3 py-2 text-center text-sm font-medium text-white ${OPPORTUNITY_COLORS[analysisResult.opportunityLevel]?.bg} ${OPPORTUNITY_COLORS[analysisResult.opportunityLevel]?.pulse ? "animate-pulse" : ""}`}>
                {OPPORTUNITY_COLORS[analysisResult.opportunityLevel]?.text}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-white/50 mb-1">
                    <Building2 className="w-3 h-3" />
                    Competitors
                  </div>
                  <div className="text-xl font-bold text-white">{analysisResult.competitorCount}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-white/50 mb-1">
                    <Users className="w-3 h-3" />
                    Population
                  </div>
                  <div className="text-xl font-bold text-white">{(analysisResult.populationDensity / 1000).toFixed(1)}K</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-white/50 mb-1">
                    <DollarSign className="w-3 h-3" />
                    Med. Income
                  </div>
                  <div className="text-xl font-bold text-white">${(analysisResult.medianIncome / 1000).toFixed(0)}K</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-white/50 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Traffic
                  </div>
                  <div className="text-xl font-bold text-white">{analysisResult.trafficScore}/100</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchAerialView}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  data-testid="button-aerial-view"
                >
                  <Video className="w-4 h-4 mr-1" />
                  3D Flyover
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={shareAnalysis}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  data-testid="button-share-analysis"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-[#C8A661]" />
              <span className="text-sm font-medium text-white">Map Layers</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Competition
                </Label>
                <Switch 
                  checked={layers.competition} 
                  onCheckedChange={() => toggleLayer("competition")}
                  data-testid="switch-layer-competition"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Demographics
                </Label>
                <Switch 
                  checked={layers.demographics} 
                  onCheckedChange={() => toggleLayer("demographics")}
                  data-testid="switch-layer-demographics"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  Traffic
                </Label>
                <Switch 
                  checked={layers.traffic} 
                  onCheckedChange={() => toggleLayer("traffic")}
                  data-testid="switch-layer-traffic"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70 flex items-center gap-2">
                  <Flame className="w-3 h-3 text-orange-500" />
                  Opportunity Zones
                </Label>
                <Switch 
                  checked={layers.opportunities} 
                  onCheckedChange={() => toggleLayer("opportunities")}
                  data-testid="switch-layer-opportunities"
                />
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-white/70">Search Radius</Label>
              <span className="text-sm font-medium text-[#C8A661]">{searchRadius[0]} miles</span>
            </div>
            <Slider
              value={searchRadius}
              onValueChange={setSearchRadius}
              min={1}
              max={25}
              step={1}
              className="[&_[role=slider]]:bg-[#C8A661]"
              data-testid="slider-search-radius"
            />
          </div>

          {competitors.length > 0 && (
            <div className="p-4 flex-1 overflow-auto">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-white">Nearby Competitors ({competitors.length})</span>
              </div>
              <div className="space-y-2">
                {competitors.slice(0, 5).map((comp, i) => (
                  <div key={comp.id} className="bg-white/5 rounded-lg p-2 text-xs">
                    <div className="font-medium text-white truncate">{comp.name}</div>
                    <div className="flex items-center justify-between text-white/50 mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        {comp.rating} ({comp.reviewCount})
                      </span>
                      <span>{comp.distance.toFixed(1)} mi</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-white/10 mt-auto">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Sparkles className="w-3 h-3" />
              <span>CLEANBI™ Proprietary Technology</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-[#12121f] border border-white/10 rounded-r-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all ${sidebarOpen ? "left-80" : "left-0"}`}
          data-testid="button-toggle-sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className={`flex-1 relative transition-all duration-300 ${sidebarOpen ? "ml-80" : "ml-0"}`}>
          <div 
            ref={mapRef}
            className="absolute inset-0"
            data-testid="explorer-map"
          />

          {!analysisResult && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C8A661]/20 to-[#8B7355]/20 flex items-center justify-center border border-[#C8A661]/30">
                  <MapPin className="w-12 h-12 text-[#C8A661]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enter an Address to Explore</h2>
                <p className="text-white/50 max-w-md">
                  Discover market opportunities with 3D aerial views, competition heatmaps, and demographic intelligence
                </p>
              </div>
            </div>
          )}
        </div>

        {showAerialView && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8">
            <div className="relative w-full max-w-4xl aspect-video bg-[#12121f] rounded-xl overflow-hidden border border-white/10">
              <button
                onClick={() => setShowAerialView(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                data-testid="button-close-aerial"
              >
                <X className="w-5 h-5" />
              </button>
              
              {aerialVideoUrl ? (
                <video
                  src={aerialVideoUrl}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#C8A661] animate-spin" />
                    <p className="text-white/70">Loading 3D aerial view...</p>
                    <p className="text-white/40 text-sm mt-2">Generating cinematic flyover for {analysisResult?.address}</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{analysisResult?.address}</h3>
                    <p className="text-white/60 text-sm">3D Aerial View powered by Google</p>
                  </div>
                  <Badge 
                    className="text-lg px-4 py-2"
                    style={{ backgroundColor: GRADE_COLORS[analysisResult?.grade || "C"] }}
                  >
                    Grade {analysisResult?.grade}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
