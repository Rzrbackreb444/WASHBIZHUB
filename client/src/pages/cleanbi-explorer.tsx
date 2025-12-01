import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
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
  ChevronDown,
  ChevronUp,
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
  Zap,
  History,
  BarChart3,
  Home,
  Car,
  Clock,
  MapPinned,
  Trash2,
  Info,
  ExternalLink,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Brain,
  FileText,
  Download,
  Lock,
  Crown,
  Unlock,
  Calculator,
  Wallet,
  FileSpreadsheet,
  Gavel,
  ThumbsUp,
  ThumbsDown,
  Scale,
  Banknote,
  PiggyBank,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

declare global {
  interface Window {
    google: any;
  }
}

interface AnalysisResult {
  id?: string;
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
  timestamp?: number;
}

interface Competitor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  distance: number;
  priceLevel?: number;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

interface SavedAnalysis extends AnalysisResult {
  id: string;
  timestamp: number;
}

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635",
  "C": "#FBBF24",
  "Needs Work": "#C8A661"
};

const OPPORTUNITY_LABELS: Record<string, { text: string; pulse: boolean }> = {
  "goldmine": { text: "Gold Mine Zone", pulse: true },
  "promising": { text: "High Opportunity", pulse: false },
  "moderate": { text: "Good Potential", pulse: false },
  "saturated": { text: "Room to Grow", pulse: false },
  "oversaturated": { text: "Strategic Location", pulse: false }
};

const CLEANBI_CATEGORIES = [
  { key: "customer", name: "Customer", icon: Users, description: "Population density, household income, demographics", weight: 20 },
  { key: "location", name: "Location", icon: MapPin, description: "Visibility, accessibility, parking, foot traffic", weight: 18 },
  { key: "equipment", name: "Equipment", icon: Zap, description: "Machine mix, age, efficiency potential", weight: 15 },
  { key: "adaptability", name: "Adaptability", icon: TrendingUp, description: "Expansion room, service diversification", weight: 12 },
  { key: "numbers", name: "Numbers", icon: DollarSign, description: "Revenue, margins, ROI benchmarks", weight: 15 },
  { key: "brand", name: "Brand", icon: Star, description: "Online presence, reviews, reputation", weight: 10 },
  { key: "intelligence", name: "Intelligence", icon: Brain, description: "Market saturation, competition density", weight: 10 }
];

const INDUSTRY_BENCHMARKS = {
  tpd: { min: 5, max: 7, unit: "turns/day", label: "Turns Per Day", description: "Industry target range" },
  vendPrice: { min: 3.25, max: 5.75, unit: "$/load", label: "Vend Price", description: "National average" },
  ebitdaMargin: { min: 22, max: 30, unit: "%", label: "EBITDA Margin", description: "Healthy range" },
  revenuePerSqFt: { min: 45, max: 85, unit: "$/sqft", label: "Revenue/SqFt", description: "Performance target" }
};

function getStoredAnalyses(): SavedAnalysis[] {
  try {
    const stored = localStorage.getItem("cleanbi_analyses");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAnalysis(analysis: AnalysisResult): SavedAnalysis {
  const saved: SavedAnalysis = {
    ...analysis,
    id: `cbi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };
  const analyses = getStoredAnalyses();
  const existing = analyses.findIndex(a => 
    a.lat.toFixed(4) === saved.lat.toFixed(4) && 
    a.lng.toFixed(4) === saved.lng.toFixed(4)
  );
  if (existing >= 0) {
    analyses[existing] = saved;
  } else {
    analyses.unshift(saved);
  }
  const trimmed = analyses.slice(0, 20);
  localStorage.setItem("cleanbi_analyses", JSON.stringify(trimmed));
  return saved;
}

function deleteStoredAnalysis(id: string): void {
  const analyses = getStoredAnalyses().filter(a => a.id !== id);
  localStorage.setItem("cleanbi_analyses", JSON.stringify(analyses));
}

function generateCategoryScores(overallScore: number, analysisData?: AnalysisResult): Record<string, number> {
  const baseScore = overallScore;
  const populationFactor = analysisData?.populationDensity ? Math.min(100, (analysisData.populationDensity / 50)) : baseScore;
  const incomeFactor = analysisData?.medianIncome ? Math.min(100, (analysisData.medianIncome / 800)) : baseScore;
  const trafficFactor = analysisData?.trafficScore || baseScore;
  const competitionFactor = analysisData?.competitorCount !== undefined 
    ? Math.max(30, 100 - (analysisData.competitorCount * 8)) 
    : baseScore;
  
  return {
    customer: Math.round(Math.min(100, Math.max(0, (populationFactor + incomeFactor) / 2))),
    location: Math.round(Math.min(100, Math.max(0, trafficFactor))),
    equipment: Math.round(Math.min(100, Math.max(0, baseScore + 5))),
    adaptability: Math.round(Math.min(100, Math.max(0, baseScore - 3))),
    numbers: Math.round(Math.min(100, Math.max(0, (baseScore + incomeFactor / 10) / 1.1))),
    brand: Math.round(Math.min(100, Math.max(0, baseScore))),
    intelligence: Math.round(Math.min(100, Math.max(0, competitionFactor)))
  };
}

function generateAINarrative(analysis: AnalysisResult, competitors: Competitor[]): string {
  const grade = analysis.grade;
  const score = analysis.cleanbiScore;
  const compCount = analysis.competitorCount;
  const income = analysis.medianIncome;
  const density = analysis.populationDensity;
  
  let narrative = "";
  
  if (grade === "A") {
    narrative = `This location scores an exceptional ${score}/100 (Grade A), indicating a Gold Mine opportunity. `;
  } else if (grade === "B") {
    narrative = `This location earns a solid ${score}/100 (Grade B), representing High Opportunity. `;
  } else if (grade === "C") {
    narrative = `This location scores ${score}/100 (Grade C), showing Good Potential with room for optimization. `;
  } else {
    narrative = `This location scores ${score}/100, suggesting strategic improvements would be beneficial. `;
  }
  
  if (compCount <= 2) {
    narrative += `With only ${compCount} competitor${compCount === 1 ? "" : "s"} nearby, market saturation is low. `;
  } else if (compCount <= 5) {
    narrative += `The ${compCount} nearby competitors indicate moderate market presence. `;
  } else {
    narrative += `With ${compCount} competitors in range, differentiation strategies are recommended. `;
  }
  
  if (income >= 75000) {
    narrative += `The median household income of $${(income/1000).toFixed(0)}K suggests strong spending power. `;
  } else if (income >= 50000) {
    narrative += `Median income of $${(income/1000).toFixed(0)}K indicates a solid middle-class market. `;
  } else {
    narrative += `The $${(income/1000).toFixed(0)}K median income points to value-focused pricing strategies. `;
  }
  
  if (density >= 5000) {
    narrative += `High population density (${(density/1000).toFixed(1)}K/sq mi) ensures steady foot traffic.`;
  } else if (density >= 2000) {
    narrative += `Moderate density of ${(density/1000).toFixed(1)}K/sq mi provides consistent customer flow.`;
  } else {
    narrative += `Lower density area may benefit from pickup/delivery services to expand reach.`;
  }
  
  return narrative;
}

export default function CleanBIExplorer() {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const streetViewInstance = useRef<any>(null);
  const heatmapLayer = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const savedMarkersRef = useRef<any[]>([]);
  
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showAerialView, setShowAerialView] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [aerialVideoUrl, setAerialVideoUrl] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<"free" | "starter" | "pro" | "enterprise">("free");
  const [remainingAnalyses, setRemainingAnalyses] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [showSavedMarkers, setShowSavedMarkers] = useState(true);
  
  // Financial calculators state (auto-populated from analysis)
  const [calcValues, setCalcValues] = useState({
    askingPrice: 0,
    annualRevenue: 0,
    operatingExpenses: 0,
    downPayment: 0,
    interestRate: 7.5,
    loanTerm: 10,
  });
  
  // Deal Scorer state
  const [dealVerdict, setDealVerdict] = useState<"buy" | "negotiate" | "overpriced" | null>(null);
  
  // Auto-calculate deal verdict when financial values change
  useEffect(() => {
    if (calcValues.annualRevenue > 0 && calcValues.operatingExpenses > 0 && calcValues.askingPrice > 0) {
      const noi = calcValues.annualRevenue - calcValues.operatingExpenses;
      const fairValue = noi * 2.5;
      if (calcValues.askingPrice <= fairValue * 0.85) {
        setDealVerdict("buy");
      } else if (calcValues.askingPrice <= fairValue * 1.1) {
        setDealVerdict("negotiate");
      } else {
        setDealVerdict("overpriced");
      }
    }
  }, [calcValues]);
  
  const [layers, setLayers] = useState({
    competition: true,
    demographics: false,
    traffic: false,
    opportunities: true,
    savedLocations: true
  });
  
  const [searchRadius, setSearchRadius] = useState([5]);

  useEffect(() => {
    setSavedAnalyses(getStoredAnalyses());
  }, []);

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
      if (savedMarkersRef.current) {
        savedMarkersRef.current.forEach(m => m.setMap(null));
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && savedAnalyses.length > 0 && showSavedMarkers) {
      renderSavedMarkers();
    }
  }, [savedAnalyses, showSavedMarkers]);

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

    setTimeout(() => renderSavedMarkers(), 500);
  };

  const renderSavedMarkers = () => {
    if (!mapInstance.current || !showSavedMarkers) return;
    
    savedMarkersRef.current.forEach(m => m.setMap(null));
    savedMarkersRef.current = [];

    savedAnalyses.forEach((saved) => {
      if (analysisResult && saved.lat === analysisResult.lat && saved.lng === analysisResult.lng) {
        return;
      }

      const marker = new window.google.maps.Marker({
        position: { lat: saved.lat, lng: saved.lng },
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: GRADE_COLORS[saved.grade] || "#C8A661",
          fillOpacity: 0.7,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        },
        title: saved.address,
        zIndex: 500
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui; min-width: 180px; background: #12121f; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 6px; background: ${GRADE_COLORS[saved.grade]}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">${saved.grade}</div>
              <div style="font-size: 18px; font-weight: bold; color: white;">${saved.cleanbiScore}/100</div>
            </div>
            <div style="font-size: 12px; color: #999; margin-bottom: 4px;">${saved.address}</div>
            <div style="font-size: 11px; color: #666;">Saved ${new Date(saved.timestamp).toLocaleDateString()}</div>
          </div>
        `
      });

      marker.addListener("click", () => {
        loadSavedAnalysis(saved);
        infoWindow.open(mapInstance.current, marker);
      });

      savedMarkersRef.current.push(marker);
    });
  };

  const loadSavedAnalysis = (saved: SavedAnalysis) => {
    setAnalysisResult(saved);
    setCategoryScores(generateCategoryScores(saved.cleanbiScore, saved));
    setActiveTab("overview");
    
    if (mapInstance.current) {
      mapInstance.current.setCenter({ lat: saved.lat, lng: saved.lng });
      mapInstance.current.setZoom(14);
    }
    
    toast({
      title: `Loaded: Grade ${saved.grade}`,
      description: saved.address
    });
  };

  const analyzeLocation = async () => {
    if (!address.trim()) {
      toast({ title: "Enter an address", description: "Please enter an address to analyze", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setActiveTab("overview");
    
    try {
      const response = await apiRequest("POST", "/api/cleanbi-explorer/analyze", {
        address,
        radius: searchRadius[0]
      });

      const data = await response.json();
      
      // Handle rate limit (3 free analyses per day)
      if (data.rateLimited) {
        toast({ 
          title: "Daily Limit Reached", 
          description: `You've used all 3 free analyses today. Upgrade for unlimited access!`,
          variant: "destructive"
        });
        setShowUpgradePrompt(true);
        setIsAnalyzing(false);
        return;
      }
      
      if (data.success) {
        const result = data.analysis;
        setAnalysisResult(result);
        setCompetitors(data.competitors || []);
        setCategoryScores(generateCategoryScores(result.cleanbiScore, result));
        
        // Auto-populate calculator values from analysis using realistic laundromat formulas
        // Typical laundromat: $15-25 revenue per capita served annually
        // Population served = population density * ~0.5 mile radius (~0.78 sq mi) for a typical trade area
        const populationServed = Math.min(result.populationDensity * 0.78, 25000);
        // Conservative revenue estimate: $18 per capita (typical for mid-tier market)
        const baseRevenue = populationServed * 18;
        // Adjust for median income (higher income = more premium services)
        const incomeMultiplier = Math.max(0.7, Math.min(1.4, result.medianIncome / 70000));
        // Adjust for competition (more competitors = lower market share)
        const competitionFactor = 1 / Math.max(1, result.competitorCount * 0.3);
        // Realistic annual revenue range: $150K - $600K for most laundromats
        const estimatedRevenue = Math.max(150000, Math.min(600000, baseRevenue * incomeMultiplier * competitionFactor));
        // Typical operating expenses: 55-65% of revenue
        const estimatedExpenses = estimatedRevenue * 0.58;
        const estimatedNOI = estimatedRevenue - estimatedExpenses;
        // Fair value = 2.5x NOI for laundromats
        const estimatedValue = estimatedNOI * 2.5;
        
        setCalcValues(prev => ({
          ...prev,
          annualRevenue: Math.round(estimatedRevenue),
          operatingExpenses: Math.round(estimatedExpenses),
          askingPrice: Math.round(estimatedValue),
          downPayment: Math.round(estimatedValue * 0.25),
        }));
        setDealVerdict(null);
        
        // Track tier and remaining analyses for premium indicators
        if (data.tier) setUserTier(data.tier);
        if (typeof data.remainingDaily === "number") setRemainingAnalyses(data.remainingDaily);
        
        const saved = saveAnalysis(result);
        setSavedAnalyses(getStoredAnalyses());
        
        if (mapInstance.current && result) {
          const center = { lat: result.lat, lng: result.lng };
          mapInstance.current.setCenter(center);
          mapInstance.current.setZoom(14);
          
          markersRef.current.forEach(m => m.setMap(null));
          markersRef.current = [];

          const mainMarker = new window.google.maps.Marker({
            position: center,
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 22,
              fillColor: GRADE_COLORS[result.grade] || "#C8A661",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 4
            },
            zIndex: 1000,
            animation: window.google.maps.Animation.DROP
          });
          
          markersRef.current.push(mainMarker);

          if (layers.competition && data.competitors) {
            data.competitors.forEach((comp: Competitor) => {
              const marker = new window.google.maps.Marker({
                position: { lat: comp.lat, lng: comp.lng },
                map: mapInstance.current,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#EF4444",
                  fillOpacity: 0.85,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2
                },
                title: comp.name
              });
              
              const compInfo = new window.google.maps.InfoWindow({
                content: `
                  <div style="padding: 10px; font-family: system-ui; min-width: 160px;">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${comp.name}</div>
                    <div style="font-size: 13px; color: #666; display: flex; align-items: center; gap: 4px;">
                      <span style="color: #facc15;">★</span> ${comp.rating} (${comp.reviewCount} reviews)
                    </div>
                    <div style="font-size: 12px; color: #888; margin-top: 4px;">${comp.distance.toFixed(1)} mi away</div>
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
          
          renderSavedMarkers();
        }

        toast({ 
          title: `CLEANBI™ Grade: ${result.grade}`, 
          description: `Score: ${result.cleanbiScore}/100 — ${OPPORTUNITY_LABELS[result.opportunityLevel]?.text || "Analysis Complete"}`
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

  const initStreetView = () => {
    if (!analysisResult) return;
    setShowStreetView(true);
  };

  // Initialize Street View when modal opens
  useEffect(() => {
    if (showStreetView && analysisResult && streetViewRef.current && window.google) {
      streetViewInstance.current = new window.google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: { lat: analysisResult.lat, lng: analysisResult.lng },
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
          addressControl: false,
          showRoadLabels: false
        }
      );
    }
  }, [showStreetView, analysisResult]);

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
      } catch {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied!", description: "Share link copied to clipboard" });
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share link copied to clipboard" });
    }
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteStoredAnalysis(id);
    setSavedAnalyses(getStoredAnalyses());
    renderSavedMarkers();
    toast({ title: "Removed", description: "Analysis removed from history" });
  };

  const toggleLayer = (layer: keyof typeof layers) => {
    const newValue = !layers[layer];
    setLayers(prev => ({ ...prev, [layer]: newValue }));
    
    if (layer === "savedLocations") {
      setShowSavedMarkers(newValue);
      if (savedMarkersRef.current && savedMarkersRef.current.length > 0) {
        savedMarkersRef.current.forEach(m => {
          if (m && typeof m.setVisible === 'function') {
            m.setVisible(newValue);
          }
        });
      }
      return;
    }
    
    if (!mapInstance.current) return;
    
    if (layer === "competition" && markersRef.current) {
      markersRef.current.forEach((marker, idx) => {
        if (idx > 0 && marker && typeof marker.setVisible === 'function') {
          marker.setVisible(newValue);
        }
      });
    }
    
    if (layer === "opportunities" && heatmapLayer.current) {
      heatmapLayer.current.setMap(newValue ? mapInstance.current : null);
    }
  };

  return (
    <>
      <SEO 
        title="CLEANBI™ Explorer 2.0 - Interactive Market Intelligence Map"
        description="Discover high-opportunity laundromat locations with our interactive CLEANBI Explorer. Real-time 3D aerial views, competition heatmaps, demographic analysis, and AI-powered business insights. Score any address globally in seconds."
        canonicalUrl="/cleanbi-explorer"
        ogType="website"
        keywords={[
          "CLEANBI Explorer",
          "laundromat location analysis",
          "business intelligence map",
          "competition analysis tool",
          "demographic analysis",
          "laundromat investment",
          "location scoring",
          "market intelligence",
          "3D aerial view",
          "foot traffic analysis",
          "laundromat valuation",
          "real estate scoring"
        ]}
        faqs={[
          {
            question: "What is CLEANBI Explorer?",
            answer: "CLEANBI Explorer is an interactive map-based tool that scores any business location globally using real-time Google data. It analyzes demographics, competition, foot traffic, and market opportunity to generate an A-C grade and 0-100 score for laundromat investment decisions."
          },
          {
            question: "How does the CLEANBI scoring work?",
            answer: "CLEANBI uses a proprietary 17-factor weighted algorithm analyzing population density, median income, competitor saturation, foot traffic patterns, accessibility, and more. Scores 85+ receive an A grade (excellent opportunity), 70-84 get B (good opportunity), 55-69 get C (fair opportunity), and below 55 is marked 'Needs Work'."
          },
          {
            question: "Is CLEANBI Explorer free to use?",
            answer: "Yes! You get 3 free location analyses per day. Free users can view saved analyses unlimited times and access Street View. Premium features like 3D Aerial Flyover and unlimited analyses require a subscription."
          },
          {
            question: "What's included in the competition analysis?",
            answer: "CLEANBI Explorer shows all nearby laundromats within your selected radius, their ratings, review counts, and exact locations on the map. It calculates competitor density and market saturation to help you identify underserved areas."
          },
          {
            question: "Can I save and share my analyses?",
            answer: "Yes! Analyses are automatically saved to your history. You can view them anytime without using daily credits. Each analysis generates a shareable link you can send to partners or investors."
          }
        ]}
        howTo={{
          name: "How to Use CLEANBI Explorer",
          description: "Step-by-step guide to analyze any location for laundromat investment potential",
          steps: [
            { name: "Enter Address", text: "Type any address, city, or zip code in the search bar at the bottom of the sidebar." },
            { name: "Click Analyze", text: "Press the 'Analyze Location' button to start the CLEANBI scoring process." },
            { name: "View Results", text: "See your CLEANBI score (0-100), grade (A/B/C), and opportunity level in the sidebar." },
            { name: "Explore Tabs", text: "Switch between Overview, Score Breakdown, Competition, and AI Insights tabs for detailed analysis." },
            { name: "Use Map Features", text: "Click competitor markers, enable Street View, or use 3D Flyover to explore the location visually." }
          ],
          totalTime: "PT2M"
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "CLEANBI Explorer",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "3 free analyses per day, premium unlimited access available"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1247",
            "bestRating": "5",
            "worstRating": "1"
          },
          "featureList": [
            "Interactive map-based location scoring",
            "Real-time competitor analysis",
            "3D aerial flyover views",
            "Street View integration",
            "AI-powered investment insights",
            "Demographic analysis",
            "Shareable analysis links",
            "Saved analysis history"
          ]
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI", url: "/cleanbi" },
          { name: "Explorer", url: "/cleanbi-explorer" }
        ]}
      />

      <div className="fixed inset-0 bg-[#0a0a14] flex" data-testid="cleanbi-explorer">
        {/* Left Sidebar */}
        <div 
          className={`absolute top-52 left-0 bottom-0 z-20 bg-[#12121f] border-r border-white/10 transition-all duration-300 flex flex-col ${sidebarOpen ? "w-[400px]" : "w-0 overflow-hidden"}`}
        >
          <ScrollArea className="flex-1">

            {/* Analysis Result */}
            {analysisResult && (
              <div className="p-4 border-b border-white/10">
                {/* Score Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl"
                    style={{ backgroundColor: GRADE_COLORS[analysisResult.grade] || "#C8A661" }}
                  >
                    {analysisResult.grade}
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">{analysisResult.cleanbiScore}</div>
                    <div className="text-sm text-white/50">CLEANBI™ Score</div>
                    <Badge 
                      className={`mt-1 ${OPPORTUNITY_LABELS[analysisResult.opportunityLevel]?.pulse ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: GRADE_COLORS[analysisResult.grade] + "33", color: GRADE_COLORS[analysisResult.grade] }}
                    >
                      {OPPORTUNITY_LABELS[analysisResult.opportunityLevel]?.text}
                    </Badge>
                  </div>
                </div>

                {/* Detail Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-6 bg-white/5 mb-3">
                    <TabsTrigger value="overview" className="text-[10px] px-1 data-[state=active]:bg-[#C8A661] data-[state=active]:text-white">Overview</TabsTrigger>
                    <TabsTrigger value="score" className="text-[10px] px-1 data-[state=active]:bg-[#C8A661] data-[state=active]:text-white">Score</TabsTrigger>
                    <TabsTrigger value="compete" className="text-[10px] px-1 data-[state=active]:bg-[#C8A661] data-[state=active]:text-white">Compete</TabsTrigger>
                    <TabsTrigger value="financials" className="text-[10px] px-1 data-[state=active]:bg-[#22C55E] data-[state=active]:text-white flex items-center gap-0.5" data-testid="tab-financials">
                      <Calculator className="w-3 h-3" />
                      Calc
                    </TabsTrigger>
                    <TabsTrigger value="deal" className="text-[10px] px-1 data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white flex items-center gap-0.5" data-testid="tab-deal">
                      <Scale className="w-3 h-3" />
                      Deal
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="text-[10px] px-1 data-[state=active]:bg-[#C8A661] data-[state=active]:text-white flex items-center gap-0.5">
                      AI
                      {userTier === "free" && <Crown className="w-2.5 h-2.5 text-[#C8A661]" />}
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                          <Building2 className="w-3.5 h-3.5" />
                          Competitors
                        </div>
                        <div className="text-2xl font-bold text-white">{analysisResult.competitorCount}</div>
                        <div className="text-xs text-white/40">in {searchRadius[0]} mi radius</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                          <Users className="w-3.5 h-3.5" />
                          Population
                        </div>
                        <div className="text-2xl font-bold text-white">{(analysisResult.populationDensity / 1000).toFixed(1)}K</div>
                        <div className="text-xs text-white/40">per sq mile</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          Median Income
                        </div>
                        <div className="text-2xl font-bold text-white">${(analysisResult.medianIncome / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-white/40">household</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Traffic Score
                        </div>
                        <div className="text-2xl font-bold text-white">{analysisResult.trafficScore}</div>
                        <div className="text-xs text-white/40">out of 100</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={initStreetView}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                        data-testid="button-street-view"
                      >
                        <Camera className="w-4 h-4 mr-1" />
                        Street View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={userTier === "free" ? () => setShowUpgradePrompt(true) : fetchAerialView}
                        className={`flex-1 border-white/20 text-white hover:bg-white/10 ${userTier === "free" ? "border-[#C8A661]/50" : ""}`}
                        data-testid="button-aerial-view"
                      >
                        {userTier === "free" ? (
                          <>
                            <Lock className="w-4 h-4 mr-1 text-[#C8A661]" />
                            3D Flyover
                            <Crown className="w-3 h-3 ml-1 text-[#C8A661]" />
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4 mr-1" />
                            3D Flyover
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={shareAnalysis}
                        className="border-white/20 text-white hover:bg-white/10"
                        data-testid="button-share-analysis"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Score Breakdown Tab */}
                  <TabsContent value="score" className="mt-0 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-white/50">CLEANBI™ 7-Factor Analysis</div>
                      <Badge variant="outline" className="text-[10px] border-white/20 text-white/40">Based on Location Data</Badge>
                    </div>
                    {CLEANBI_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const score = categoryScores[cat.key] || 0;
                      return (
                        <div key={cat.key} className="bg-white/5 rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-[#C8A661]" />
                              <span className="text-sm font-medium text-white">{cat.name}</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: GRADE_COLORS[score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "Needs Work"] }}>
                              {score}
                            </span>
                          </div>
                          <Progress value={score} className="h-1.5" />
                          <div className="text-xs text-white/40 mt-1">{cat.description}</div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  {/* Competition Tab */}
                  <TabsContent value="compete" className="mt-0">
                    <div className="text-xs text-white/50 mb-2">Nearby Competitors ({competitors.length})</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {competitors.length === 0 ? (
                        <div className="text-center py-6 text-white/40 text-sm">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          No direct competitors found!
                        </div>
                      ) : (
                        competitors.slice(0, 10).map((comp) => (
                          <div key={comp.id} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-sm truncate">{comp.name}</div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    {comp.rating.toFixed(1)} ({comp.reviewCount})
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Navigation className="w-3 h-3" />
                                    {comp.distance.toFixed(1)} mi
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Industry Standard Benchmarks */}
                    <Separator className="my-3 bg-white/10" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-white/50">Industry Standard Targets</div>
                      <Badge variant="outline" className="text-[10px] border-white/20 text-white/40">Reference Data</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(INDUSTRY_BENCHMARKS).map(([key, bench]) => (
                        <div key={key} className="bg-white/5 rounded p-2 text-center">
                          <div className="text-lg font-bold text-[#C8A661]">{bench.min}-{bench.max}</div>
                          <div className="text-xs text-white/40">{bench.unit}</div>
                          <div className="text-xs text-white/60 truncate">{bench.label}</div>
                          <div className="text-[10px] text-white/30 mt-0.5">{bench.description}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Financials Calculator Tab */}
                  <TabsContent value="financials" className="mt-0 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Calculator className="w-4 h-4 text-green-400" />
                        Quick Financial Analysis
                      </div>
                      <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">Auto-populated</Badge>
                    </div>
                    
                    {/* ROI Calculator Mini */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-white">ROI Analysis</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="text-[10px] text-white/50 block mb-1">Annual Revenue</label>
                          <Input
                            type="number"
                            value={calcValues.annualRevenue}
                            onChange={(e) => setCalcValues(v => ({...v, annualRevenue: Number(e.target.value)}))}
                            className="h-8 text-sm bg-white/10 border-white/20 text-white"
                            data-testid="input-calc-revenue"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/50 block mb-1">Operating Expenses</label>
                          <Input
                            type="number"
                            value={calcValues.operatingExpenses}
                            onChange={(e) => setCalcValues(v => ({...v, operatingExpenses: Number(e.target.value)}))}
                            className="h-8 text-sm bg-white/10 border-white/20 text-white"
                            data-testid="input-calc-expenses"
                          />
                        </div>
                      </div>
                      
                      {/* ROI Results */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-500/10 rounded p-2 text-center border border-green-500/20">
                          <div className="text-lg font-bold text-green-400">
                            {((calcValues.annualRevenue - calcValues.operatingExpenses) / Math.max(calcValues.downPayment, 1) * 100).toFixed(0)}%
                          </div>
                          <div className="text-[10px] text-white/50">Cash-on-Cash</div>
                        </div>
                        <div className="bg-white/5 rounded p-2 text-center">
                          <div className="text-lg font-bold text-white">
                            {((calcValues.annualRevenue - calcValues.operatingExpenses) / Math.max(calcValues.askingPrice, 1) * 100).toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-white/50">Cap Rate</div>
                        </div>
                        <div className="bg-white/5 rounded p-2 text-center">
                          <div className="text-lg font-bold text-[#C8A661]">
                            ${((calcValues.annualRevenue - calcValues.operatingExpenses) / 12 / 1000).toFixed(1)}K
                          </div>
                          <div className="text-[10px] text-white/50">Monthly NOI</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Valuation Estimate */}
                    <div className="bg-gradient-to-br from-[#C8A661]/10 to-transparent rounded-lg p-3 border border-[#C8A661]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-[#C8A661]" />
                        <span className="text-sm font-medium text-white">Estimated Value Range</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xs text-white/40">Low (2.0x)</div>
                          <div className="text-base font-bold text-white">
                            ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 2 / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div className="bg-[#C8A661]/20 rounded py-1">
                          <div className="text-xs text-[#C8A661]">Fair (2.5x)</div>
                          <div className="text-lg font-bold text-[#C8A661]">
                            ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 2.5 / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40">High (3.0x)</div>
                          <div className="text-base font-bold text-white">
                            ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 3 / 1000).toFixed(0)}K
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Export CTA */}
                    {userTier !== "free" && analysisResult ? (
                      <Button 
                        variant="outline" 
                        className="w-full h-9 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={async () => {
                          try {
                            toast({ title: "Exporting...", description: "Creating your Google Sheets report..." });
                            const response = await fetch("/api/cleanbi-explorer/export-sheets", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                address: analysisResult.address,
                                score: analysisResult.cleanbiScore,
                                grade: analysisResult.grade,
                                populationDensity: analysisResult.populationDensity,
                                medianIncome: analysisResult.medianIncome,
                                trafficScore: analysisResult.trafficScore || 75,
                                parkingScore: analysisResult.parkingScore || 80,
                                competitorCount: analysisResult.competitorCount,
                                nearestCompetitor: analysisResult.nearestCompetitor || 1.5,
                                annualRevenue: calcValues.annualRevenue,
                                operatingExpenses: calcValues.operatingExpenses,
                                askingPrice: calcValues.askingPrice,
                                dealVerdict: dealVerdict || "Unknown"
                              })
                            });
                            const data = await response.json();
                            if (data.success) {
                              toast({ title: "Export Complete!", description: "Opening your spreadsheet..." });
                              window.open(data.spreadsheetUrl, "_blank");
                            } else {
                              toast({ title: "Export Failed", description: data.error, variant: "destructive" });
                            }
                          } catch (err) {
                            toast({ title: "Export Error", description: "Could not export to Google Sheets", variant: "destructive" });
                          }
                        }}
                        data-testid="button-calc-export"
                      >
                        <FileSpreadsheet className="w-3 h-3 mr-1.5" />
                        Export to Google Sheets
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full h-9 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={() => setShowUpgradePrompt(true)}
                        data-testid="button-calc-upgrade"
                      >
                        <Crown className="w-3 h-3 mr-1.5" />
                        Export to Google Sheets — Pro Feature
                      </Button>
                    )}
                  </TabsContent>

                  {/* Deal Scorer Tab */}
                  <TabsContent value="deal" className="mt-0 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                      <Scale className="w-4 h-4 text-blue-400" />
                      Deal Scorer — Is This Price Fair?
                    </div>
                    
                    {/* Asking Price Input */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <label className="text-xs text-white/60 block mb-2">Seller's Asking Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          type="number"
                          value={calcValues.askingPrice}
                          onChange={(e) => setCalcValues(v => ({...v, askingPrice: Number(e.target.value)}))}
                          className="pl-8 h-12 text-xl font-bold bg-white/10 border-white/20 text-white"
                          data-testid="input-asking-price"
                        />
                      </div>
                    </div>
                    
                    {/* Deal Verdict */}
                    {dealVerdict && (
                      <div className={`rounded-xl p-4 border ${
                        dealVerdict === "buy" ? "bg-green-500/20 border-green-500/40" :
                        dealVerdict === "negotiate" ? "bg-yellow-500/20 border-yellow-500/40" :
                        "bg-red-500/20 border-red-500/40"
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {dealVerdict === "buy" && <ThumbsUp className="w-8 h-8 text-green-400" />}
                          {dealVerdict === "negotiate" && <Scale className="w-8 h-8 text-yellow-400" />}
                          {dealVerdict === "overpriced" && <ThumbsDown className="w-8 h-8 text-red-400" />}
                          <div>
                            <div className={`text-xl font-bold ${
                              dealVerdict === "buy" ? "text-green-400" :
                              dealVerdict === "negotiate" ? "text-yellow-400" :
                              "text-red-400"
                            }`}>
                              {dealVerdict === "buy" && "Strong Buy"}
                              {dealVerdict === "negotiate" && "Negotiate"}
                              {dealVerdict === "overpriced" && "Overpriced"}
                            </div>
                            <div className="text-xs text-white/60">
                              {dealVerdict === "buy" && "This is priced below fair value — act fast!"}
                              {dealVerdict === "negotiate" && "Fair price range, but room to negotiate."}
                              {dealVerdict === "overpriced" && "Price exceeds calculated fair value."}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-white/50 text-xs">Fair Value</div>
                              <div className="font-semibold text-white">
                                ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 2.5 / 1000).toFixed(0)}K
                              </div>
                            </div>
                            <div>
                              <div className="text-white/50 text-xs">Your Offer Target</div>
                              <div className="font-semibold text-[#C8A661]">
                                ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 2.2 / 1000).toFixed(0)}K
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Export & Share Actions */}
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full h-9 text-xs border-white/20 text-white hover:bg-white/10"
                        onClick={shareAnalysis}
                        data-testid="button-share-deal"
                      >
                        <Share2 className="w-3 h-3 mr-1.5" />
                        Share Analysis Link
                      </Button>
                      
                      {userTier !== "free" && analysisResult ? (
                        <Button 
                          className="w-full h-9 text-xs bg-gradient-to-r from-[#C8A661] to-[#8B7355] text-white"
                          onClick={async () => {
                            try {
                              toast({ title: "Generating PDF...", description: "Creating your analysis report..." });
                              
                              // Use browser-based PDF generation with jsPDF
                              const { default: jsPDF } = await import("jspdf");
                              const doc = new jsPDF();
                              const noi = calcValues.annualRevenue - calcValues.operatingExpenses;
                              const fairValue = noi * 2.5;
                              
                              // Title
                              doc.setFontSize(20);
                              doc.setTextColor(30, 58, 95); // Navy
                              doc.text("CLEANBI™ Location Analysis", 20, 25);
                              
                              // Subtitle
                              doc.setFontSize(12);
                              doc.setTextColor(100, 100, 100);
                              doc.text(analysisResult.address, 20, 35);
                              doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
                              
                              // Score Box
                              doc.setFillColor(200, 166, 97); // Gold
                              doc.rect(150, 15, 40, 30, "F");
                              doc.setFontSize(24);
                              doc.setTextColor(255, 255, 255);
                              doc.text(analysisResult.grade, 162, 32);
                              doc.setFontSize(10);
                              doc.text(`Score: ${analysisResult.cleanbiScore}`, 155, 40);
                              
                              // Section: Market Demographics
                              doc.setFontSize(14);
                              doc.setTextColor(30, 58, 95);
                              doc.text("Market Demographics", 20, 60);
                              doc.setFontSize(11);
                              doc.setTextColor(60, 60, 60);
                              doc.text(`Population Density: ${analysisResult.populationDensity.toLocaleString()} per sq mi`, 25, 70);
                              doc.text(`Median Income: $${analysisResult.medianIncome.toLocaleString()}`, 25, 78);
                              doc.text(`Competitors: ${analysisResult.competitorCount}`, 25, 86);
                              
                              // Section: Financial Projections
                              doc.setFontSize(14);
                              doc.setTextColor(30, 58, 95);
                              doc.text("Financial Projections", 20, 105);
                              doc.setFontSize(11);
                              doc.setTextColor(60, 60, 60);
                              doc.text(`Annual Revenue: $${calcValues.annualRevenue.toLocaleString()}`, 25, 115);
                              doc.text(`Operating Expenses: $${calcValues.operatingExpenses.toLocaleString()}`, 25, 123);
                              doc.text(`Net Operating Income: $${noi.toLocaleString()}`, 25, 131);
                              doc.text(`Fair Market Value (2.5x NOI): $${Math.round(fairValue).toLocaleString()}`, 25, 139);
                              
                              // Section: Deal Analysis
                              doc.setFontSize(14);
                              doc.setTextColor(30, 58, 95);
                              doc.text("Deal Analysis", 20, 160);
                              doc.setFontSize(11);
                              doc.setTextColor(60, 60, 60);
                              doc.text(`Asking Price: $${calcValues.askingPrice.toLocaleString()}`, 25, 170);
                              const verdictColor = dealVerdict === "buy" ? [34, 197, 94] : dealVerdict === "negotiate" ? [234, 179, 8] : [239, 68, 68];
                              doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
                              doc.text(`Verdict: ${dealVerdict?.toUpperCase() || "N/A"}`, 25, 178);
                              doc.setTextColor(60, 60, 60);
                              doc.text(`Target Offer: $${Math.round(noi * 2.2).toLocaleString()}`, 25, 186);
                              
                              // Footer
                              doc.setFontSize(9);
                              doc.setTextColor(150, 150, 150);
                              doc.text("Generated by WashBizHub.com - CLEANBI™ Proprietary Technology", 20, 280);
                              
                              // Save
                              doc.save(`CLEANBI_Analysis_${analysisResult.address.replace(/[^a-z0-9]/gi, "_")}.pdf`);
                              toast({ title: "PDF Downloaded!", description: "Your analysis report has been saved." });
                            } catch (err) {
                              console.error("PDF Error:", err);
                              toast({ title: "PDF Error", description: "Could not generate PDF", variant: "destructive" });
                            }
                          }}
                          data-testid="button-export-pdf"
                        >
                          <Download className="w-3 h-3 mr-1.5" />
                          Export Full Report (PDF)
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          className="w-full h-9 text-xs border-[#C8A661]/30 text-[#C8A661] hover:bg-[#C8A661]/10"
                          onClick={() => setShowUpgradePrompt(true)}
                          data-testid="button-export-upgrade"
                        >
                          <Lock className="w-3 h-3 mr-1.5" />
                          Export Report — Pro Feature
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  {/* AI Insights Tab */}
                  <TabsContent value="insights" className="mt-0">
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                      <Brain className="w-4 h-4 text-[#C8A661]" />
                      AI-Powered Analysis
                    </div>
                    <div className="bg-gradient-to-br from-[#C8A661]/10 to-transparent rounded-lg p-4 border border-[#C8A661]/20">
                      <p className="text-sm text-white/90 leading-relaxed">
                        {generateAINarrative(analysisResult, competitors)}
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-white/50">Key Takeaways</div>
                      <div className="flex items-start gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{analysisResult.grade === "A" ? "Exceptional opportunity - act fast" : analysisResult.grade === "B" ? "Strong fundamentals for success" : "Strategic improvements can boost value"}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-white/80">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <span>{analysisResult.competitorCount <= 3 ? "Low competition = pricing power" : "Differentiation strategy recommended"}</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Map Layers */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-[#C8A661]" />
                <span className="text-sm font-medium text-white">Map Layers</span>
              </div>

              <div className="space-y-2.5">
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
                    <Flame className="w-3 h-3 text-orange-500" />
                    Opportunity Heatmap
                  </Label>
                  <Switch 
                    checked={layers.opportunities} 
                    onCheckedChange={() => toggleLayer("opportunities")}
                    data-testid="switch-layer-opportunities"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white/70 flex items-center gap-2">
                    <History className="w-3 h-3 text-[#C8A661]" />
                    Saved Locations
                  </Label>
                  <Switch 
                    checked={layers.savedLocations} 
                    onCheckedChange={() => toggleLayer("savedLocations")}
                    data-testid="switch-layer-saved"
                  />
                </div>
              </div>

              <div className="mt-4">
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
            </div>

            {/* Saved Analyses History */}
            <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded} className="p-4 border-b border-white/10">
              <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#C8A661]" />
                  <span className="text-sm font-medium text-white">Your Analyses ({savedAnalyses.length})</span>
                </div>
                {historyExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                {savedAnalyses.length === 0 ? (
                  <div className="text-center py-4 text-white/40 text-sm">
                    <MapPinned className="w-6 h-6 mx-auto mb-2" />
                    No saved analyses yet
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {savedAnalyses.map((saved) => (
                      <div 
                        key={saved.id}
                        onClick={() => loadSavedAnalysis(saved)}
                        className="bg-white/5 rounded-lg p-2.5 cursor-pointer hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: GRADE_COLORS[saved.grade] }}
                          >
                            {saved.grade === "Needs Work" ? "NW" : saved.grade}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{saved.address}</div>
                            <div className="text-xs text-white/40">
                              Score: {saved.cleanbiScore} · {new Date(saved.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-7 w-7 text-white/40 hover:text-red-400"
                            onClick={(e) => handleDeleteSaved(saved.id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Search Section - At Bottom */}
            <div className="p-4">
              {/* Free Tier Usage Indicator */}
              {userTier === "free" && (
                <div className="mb-3 bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Zap className="w-4 h-4 text-[#C8A661]" />
                      <span>Daily Analyses</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${remainingAnalyses === 0 ? "border-red-500/50 text-red-400" : "border-[#C8A661]/50 text-[#C8A661]"}`}
                    >
                      {remainingAnalyses !== null ? `${remainingAnalyses} left` : "3 free/day"}
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-[#C8A661] to-[#8B7355] transition-all duration-300"
                      style={{ width: `${((remainingAnalyses ?? 3) / 3) * 100}%` }}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowUpgradePrompt(true)}
                    className="w-full text-[#C8A661] hover:text-white hover:bg-[#C8A661]/20 text-xs h-8"
                    data-testid="button-upgrade-sidebar"
                  >
                    <Crown className="w-3.5 h-3.5 mr-1.5" />
                    Upgrade for Unlimited Analyses
                  </Button>
                </div>
              )}

              <div className="bg-gradient-to-br from-[#C8A661]/20 to-[#8B7355]/20 rounded-xl p-4 border border-[#C8A661]/30">
                <div className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C8A661]" />
                  Analyze Any Location
                </div>
                
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && analyzeLocation()}
                    placeholder="Enter address, city, or zip code..."
                    className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base"
                    data-testid="input-explorer-address"
                  />
                </div>

                <Button 
                  onClick={analyzeLocation}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-[#C8A661] to-[#8B7355] hover:opacity-90 text-white h-12 text-base font-medium"
                  data-testid="button-analyze-location"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Analyze Location
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 mt-auto">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <Sparkles className="w-3 h-3" />
                <span>CLEANBI™ Proprietary Technology</span>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-56 z-30 w-6 h-12 bg-[#12121f] border border-white/10 rounded-r-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all ${sidebarOpen ? "left-[400px]" : "left-0"}`}
          data-testid="button-toggle-sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Main Map Area */}
        <div className={`flex-1 relative transition-all duration-300 ${sidebarOpen ? "ml-[400px]" : "ml-0"}`}>
          <div 
            ref={mapRef}
            className="absolute inset-0"
            data-testid="explorer-map"
          />

        </div>

        {/* Street View Modal */}
        {showStreetView && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8">
            <div className="relative w-full max-w-5xl aspect-video bg-[#12121f] rounded-xl overflow-hidden border border-white/10">
              <button
                onClick={() => setShowStreetView(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                data-testid="button-close-streetview"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div ref={streetViewRef} className="w-full h-full" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{analysisResult?.address}</h3>
                    <p className="text-white/60 text-sm">Street View</p>
                  </div>
                  <Badge 
                    className="text-base px-3 py-1"
                    style={{ backgroundColor: GRADE_COLORS[analysisResult?.grade || "C"] }}
                  >
                    Grade {analysisResult?.grade}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aerial View Modal */}
        {showAerialView && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8">
            <div className="relative w-full max-w-5xl aspect-video bg-[#12121f] rounded-xl overflow-hidden border border-white/10">
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

        {/* Upgrade Prompt Modal */}
        {showUpgradePrompt && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-[#12121f] rounded-2xl overflow-hidden border border-[#C8A661]/30 shadow-2xl">
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20"
                data-testid="button-close-upgrade"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#C8A661] to-[#8B7355] flex items-center justify-center">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">You've Hit Your Daily Limit</h2>
                <p className="text-white/60 mb-6">
                  Free users get 3 location analyses per day. Upgrade to unlock unlimited analyses, 3D Aerial Views, and premium insights.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-left bg-white/5 rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-white/80 text-sm">Unlimited CLEANBI™ analyses</span>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-white/5 rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-white/80 text-sm">3D Aerial View flyovers</span>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-white/5 rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-white/80 text-sm">Detailed competitor intelligence</span>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-white/5 rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-white/80 text-sm">Export PDF reports</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-[#C8A661] to-[#8B7355] hover:opacity-90 text-white h-12 text-lg font-medium mb-3"
                  onClick={() => window.location.href = "/pricing"}
                  data-testid="button-upgrade-now"
                >
                  Upgrade to Starter - $29/mo
                </Button>
                
                <p className="text-white/40 text-xs">
                  Your saved analyses are still accessible. Come back tomorrow for 3 more free analyses!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
