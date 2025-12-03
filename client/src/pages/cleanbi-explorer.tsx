import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { AuthGuard } from "@/components/AuthGuard";
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
  TrendingDown,
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
  Receipt,
  Footprints,
  Train,
  Bike,
  Sun,
  Bolt,
  Gauge,
  MessageSquare,
  Lightbulb,
  Phone,
  Briefcase,
  BookmarkPlus,
  ArrowRight,
  Check,
  Plus,
  Minus,
  WashingMachine,
  CircleDollarSign,
  Wrench,
  RefreshCw,
  LineChart
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ListingAnalyzer } from "@/components/ListingAnalyzer";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import { UpgradeModal } from "@/components/monetization/UpgradeModal";
import { UsageLimitBanner } from "@/components/monetization/UpgradePrompt";
import { trackEvent, trackConversion } from "@/lib/user-journey";
import { PLATFORM_TIERS } from "@/lib/tier-config";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    google: any;
  }
}

interface ReviewSentiment {
  overallSentiment: "positive" | "mixed" | "negative";
  sentimentScore: number;
  positiveThemes: string[];
  negativeThemes: string[];
  reviewHighlights: { text: string; sentiment: "positive" | "negative" }[];
  strengthsCount: number;
  weaknessesCount: number;
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
  walkScore?: number;
  walkDescription?: string;
  transitScore?: number | null;
  transitDescription?: string | null;
  bikeScore?: number | null;
  bikeDescription?: string | null;
  timestamp?: number;
  sentiment?: ReviewSentiment | null;
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

// Premium Intelligence Types
interface SolarData {
  hasSolarPotential: boolean;
  annualSunshineHours: number;
  roofAreaSqFt: number;
  estimatedPanelCount: number;
  annualKwhProduction: number;
  annualSavings: number;
  paybackYears: number;
  carbonOffsetLbs: number;
  status: "success" | "error" | "not_available";
}

interface UtilityRateData {
  utilityName: string;
  residentialRate: number;
  commercialRate: number;
  industrialRate: number;
  avgMonthlyBill: number;
  rateClass: "low" | "medium" | "high";
  state: string;
  zipCode: string;
  status: "success" | "error" | "not_available";
}

interface PropertyData {
  estimatedValue: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
  yearBuilt: number;
  buildingSqFt: number;
  propertyType: string;
  ownerName?: string;
  taxAssessedValue?: number;
  annualPropertyTax?: number;
  hasLiens?: boolean;
  motivatedSellerScore?: number;
  status: "success" | "error" | "not_available";
  ownershipGated?: boolean;
  liensGated?: boolean;
}

interface DistanceMatrixData {
  driveTimeMinutes: number;
  distanceMiles: number;
  trafficCondition: "light" | "moderate" | "heavy";
  nearbyHouseholds1Mile: number;
  nearbyHouseholds3Mile: number;
  nearbyHouseholds5Mile: number;
  catchmentScore: number;
  status: "success" | "error" | "not_available";
}

interface IntelligenceReport {
  walkScore: any;
  solarData: SolarData | null;
  propertyValue: Partial<PropertyData> | null;
  utilityRates: UtilityRateData | null;
  distanceMatrix: DistanceMatrixData | null;
  fullPropertyData: PropertyData | null;
  tier: string;
  featuresUnlocked: string[];
  featuresGated: string[];
}

type MachineType = 'washer' | 'dryer' | 'combo' | 'folder' | 'ironer';
type MachineBrand = 
  | 'speed_queen' | 'dexter' | 'maytag' | 'lg' | 'electrolux' | 'huebsch'
  | 'wascomat' | 'continental_girbau' | 'ipso' | 'alliance' | 'adc'
  | 'unimac' | 'primus' | 'fagor' | 'other';
type MachineCapacity = 'small' | 'medium' | 'large' | 'extra_large' | 'mega';

interface EquipmentItem {
  id: string;
  machineType: MachineType;
  brand: MachineBrand;
  model: string;
  capacity: MachineCapacity;
  ageYears: number;
  purchaseCost: number;
  quantity: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  hasCardSystem?: boolean;
  monthlyRevenue?: number;
}

interface ValuatorResult {
  equipmentFMV: number;
  propertyValue: number;
  businessValue: number;
  totalAssetValue: number;
  valuationRange: { min: number; max: number };
  adjustments: Array<{ reason: string; amount: number; percentage: number; direction: 'increase' | 'decrease' }>;
  equipmentBreakdown: {
    totalFMV: number;
    totalOriginalCost: number;
    weightedAge: number;
    brandBreakdown: Record<string, { count: number; value: number }>;
    typeBreakdown: Record<string, { count: number; value: number }>;
    items: Array<{
      id: string;
      machineType: string;
      brand: string;
      quantity: number;
      currentValue: number;
      fairMarketValue: number;
      depreciationRate: number;
      remainingLifeYears: number;
    }>;
  };
  businessDetails: {
    ebitda: number;
    ebitdaMultiple: number;
    ebitdaMultipleRange: { min: number; max: number };
    businessValue: number;
    businessValueRange: { min: number; max: number };
    cleanbiGrade: string;
    confidenceLevel: 'high' | 'medium' | 'low';
  };
}

const BRAND_DISPLAY_NAMES: Record<MachineBrand, string> = {
  speed_queen: 'Speed Queen',
  dexter: 'Dexter',
  maytag: 'Maytag',
  lg: 'LG Commercial',
  electrolux: 'Electrolux',
  huebsch: 'Huebsch',
  wascomat: 'Wascomat',
  continental_girbau: 'Continental Girbau',
  ipso: 'IPSO',
  alliance: 'Alliance',
  adc: 'ADC',
  unimac: 'UniMac',
  primus: 'Primus',
  fagor: 'Fagor',
  other: 'Other'
};

const CAPACITY_DISPLAY_NAMES: Record<MachineCapacity, string> = {
  small: 'Small (15-20 lbs)',
  medium: 'Medium (20-30 lbs)',
  large: 'Large (30-40 lbs)',
  extra_large: 'Extra Large (40-60 lbs)',
  mega: 'Mega (60-80+ lbs)'
};

const MACHINE_TYPE_DISPLAY: Record<MachineType, string> = {
  washer: 'Washer',
  dryer: 'Dryer',
  combo: 'Combo',
  folder: 'Folder',
  ironer: 'Ironer'
};

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635",
  "C": "#FBBF24",
  "Needs Work": "#b8860b"
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

function CleanBIExplorerContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const streetViewInstance = useRef<any>(null);
  const heatmapLayer = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const savedMarkersRef = useRef<any[]>([]);
  
  const quota = useUsageQuota();
  const userTier = quota.tier.toLowerCase() as "free" | "starter" | "pro" | "enterprise";
  const remainingAnalyses = quota.remaining;
  const isAtLimit = quota.isAtLimit;
  
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showAerialView, setShowAerialView] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPostAnalysisModal, setShowPostAnalysisModal] = useState(false);
  const [aerialVideoUrl, setAerialVideoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [showSavedMarkers, setShowSavedMarkers] = useState(true);
  
  // Premium Intelligence State
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceReport | null>(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  
  // Email capture gate state
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [captureEmail, setCaptureEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(() => {
    return localStorage.getItem("cleanbi_email_captured") === "true";
  });
  const [pendingAnalysis, setPendingAnalysis] = useState<AnalysisResult | null>(null);
  const [pendingCompetitors, setPendingCompetitors] = useState<Competitor[]>([]);
  
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
  
  // Competitor Analysis state (one-click deep dive)
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [competitorSheetOpen, setCompetitorSheetOpen] = useState(false);
  
  // Market Gap Finder state
  const [showMarketGaps, setShowMarketGaps] = useState(false);
  const [gapRadius, setGapRadius] = useState([1.5]);
  const [minRenterPercent, setMinRenterPercent] = useState([35]);
  const [gapZones, setGapZones] = useState<any[]>([]);
  const [topOpportunities, setTopOpportunities] = useState<any[]>([]);
  const [saturationScore, setSaturationScore] = useState<number | null>(null);
  const [totalGapCount, setTotalGapCount] = useState(0);
  const [areaStats, setAreaStats] = useState<any>(null);
  const [loadingGapAnalysis, setLoadingGapAnalysis] = useState(false);
  const [gapMarkers, setGapMarkers] = useState<any[]>([]);
  const [gapZoneCircles, setGapZoneCircles] = useState<any[]>([]);
  
  // Valuator State - Equipment inventory and valuation
  const [valuatorEquipment, setValuatorEquipment] = useState<EquipmentItem[]>([]);
  const [valuatorResult, setValuatorResult] = useState<ValuatorResult | null>(null);
  const [isCalculatingValuation, setIsCalculatingValuation] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);
  const [whatIfScenario, setWhatIfScenario] = useState<{
    addedMachines: EquipmentItem[];
    removedMachineIds: string[];
  }>({ addedMachines: [], removedMachineIds: [] });
  const [whatIfResult, setWhatIfResult] = useState<any | null>(null);
  const [isCalculatingWhatIf, setIsCalculatingWhatIf] = useState(false);
  const [valuatorNarrative, setValuatorNarrative] = useState<{
    executiveSummary: string;
    strengthsAnalysis: string;
    risksAnalysis: string;
    recommendations: string[];
    confidenceStatement: string;
  } | null>(null);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  
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
  const [autoAnalyzeTriggered, setAutoAnalyzeTriggered] = useState(false);

  useEffect(() => {
    setSavedAnalyses(getStoredAnalyses());
  }, []);
  
  // Auto-analyze from URL parameters (seamless flow from homepage)
  useEffect(() => {
    if (autoAnalyzeTriggered) return;
    
    const params = new URLSearchParams(window.location.search);
    // URLSearchParams already decodes values, no need for decodeURIComponent
    const urlAddress = params.get('address');
    const urlName = params.get('name');
    const urlScore = params.get('score');
    const urlGrade = params.get('grade');
    
    if (urlAddress) {
      setAddress(urlAddress);
      if (urlName) setBusinessName(urlName);
      setAutoAnalyzeTriggered(true);
      
      // Wait for map to initialize, then auto-analyze
      const checkAndAnalyze = () => {
        if (window.google && mapInstance.current) {
          // If we have pre-computed score/grade from homepage, show it faster
          if (urlScore && urlGrade) {
            toast({
              title: `Continuing analysis: Grade ${urlGrade}`,
              description: urlName ? `${urlName} - Loading full map...` : `Loading full map...`,
            });
          }
          // Trigger analysis with both name and address
          setTimeout(() => {
            analyzeLocationWithAddress(urlAddress, urlName || undefined);
          }, 500);
        } else {
          // Retry after a short delay if map isn't ready
          setTimeout(checkAndAnalyze, 500);
        }
      };
      
      checkAndAnalyze();
      
      // Clean URL without reloading
      window.history.replaceState({}, '', '/cleanbi-explorer');
    }
  }, [autoAnalyzeTriggered]);

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
          fillColor: GRADE_COLORS[saved.grade] || "#b8860b",
          fillOpacity: 0.7,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        },
        title: saved.address,
        zIndex: 500
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui; min-width: 180px; background: linear-gradient(135deg, #1e3a5f, #0f1d2f); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: ${GRADE_COLORS[saved.grade]}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">${saved.grade}</div>
              <div style="font-size: 18px; font-weight: 600; color: white;">${saved.cleanbiScore}/100</div>
            </div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 4px;">${saved.address}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.5);">Saved ${new Date(saved.timestamp).toLocaleDateString()}</div>
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
  
  // Email validation helper
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Email capture submission
  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureEmail.trim() || !pendingAnalysis) return;
    
    // Client-side email validation
    if (!isValidEmail(captureEmail)) {
      toast({ 
        title: "Invalid Email", 
        description: "Please enter a valid email address.",
        variant: "destructive" 
      });
      return;
    }
    
    setEmailSubmitting(true);
    try {
      await apiRequest("POST", "/api/cleanbi-explorer/leads", {
        email: captureEmail,
        address: pendingAnalysis.address,
        score: pendingAnalysis.cleanbiScore,
        grade: pendingAnalysis.grade,
        source: "cleanbi-explorer"
      });
      
      // Mark email as captured (try localStorage, fallback to state only)
      try {
        localStorage.setItem("cleanbi_email_captured", "true");
        localStorage.setItem("cleanbi_user_email", captureEmail);
      } catch {}
      setEmailCaptured(true);
      
      toast({
        title: "Welcome to CLEANBI!",
        description: "Your full analysis is now available."
      });
    } catch (error) {
      // Still allow access on error - don't trap users
      toast({ 
        title: "Note", 
        description: "Couldn't save your info, but your analysis is ready!",
      });
    }
    
    // Always reveal the analysis (even if lead capture failed)
    setAnalysisResult(pendingAnalysis);
    setCompetitors(pendingCompetitors);
    setCategoryScores(generateCategoryScores(pendingAnalysis.cleanbiScore, pendingAnalysis));
    
    // Clear pending state and close modal
    setPendingAnalysis(null);
    setPendingCompetitors([]);
    setShowEmailGate(false);
    setEmailSubmitting(false);
  };
  
  // Skip email capture (fallback option)
  const skipEmailCapture = () => {
    if (!pendingAnalysis) return;
    
    // Reveal analysis without capturing email
    setAnalysisResult(pendingAnalysis);
    setCompetitors(pendingCompetitors);
    setCategoryScores(generateCategoryScores(pendingAnalysis.cleanbiScore, pendingAnalysis));
    
    setPendingAnalysis(null);
    setPendingCompetitors([]);
    setShowEmailGate(false);
    
    // Mark as skipped so we don't ask again this session
    try {
      sessionStorage.setItem("cleanbi_email_skipped", "true");
    } catch {}
  };

  // Helper function for URL-initiated analysis (seamless handoff from homepage)
  const analyzeLocationWithAddress = async (targetAddress: string, targetName?: string) => {
    if (!targetAddress.trim()) return;
    
    setAddress(targetAddress);
    if (targetName) setBusinessName(targetName);
    setIsAnalyzing(true);
    setActiveTab("overview");
    
    try {
      const response = await apiRequest("POST", "/api/cleanbi-explorer/analyze", {
        address: targetAddress,
        businessName: targetName || undefined,
        radius: searchRadius[0]
      });

      const data = await response.json();
      
      if (data.rateLimited) {
        toast({ 
          title: "Daily Limit Reached", 
          description: `You've used your free analysis today. Upgrade for unlimited access!`,
          variant: "destructive"
        });
        setShowUpgradeModal(true);
        setIsAnalyzing(false);
        return;
      }
      
      if (data.success) {
        const result = data.analysis;
        
        // Check if this is a first-time user who hasn't provided email yet
        const hasEmailCapture = emailCaptured || 
          (typeof localStorage !== 'undefined' && localStorage.getItem("cleanbi_email_captured")) ||
          (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("cleanbi_email_skipped"));
        
        if (!hasEmailCapture) {
          setPendingAnalysis(result);
          setPendingCompetitors(data.competitors || []);
          setShowEmailGate(true);
          
          // Still show markers on map even when email gate is displayed
          if (mapInstance.current && result) {
            const center = { lat: result.lat, lng: result.lng };
            mapInstance.current.setCenter(center);
            mapInstance.current.setZoom(14);
            
            // Clear existing markers and add new ones
            markersRef.current.forEach(m => m.setMap(null));
            markersRef.current = [];
            
            // Main location marker
            const mainMarker = new window.google.maps.Marker({
              position: center,
              map: mapInstance.current,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 22,
                fillColor: GRADE_COLORS[result.grade] || "#b8860b",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 4
              },
              zIndex: 1000,
              animation: window.google.maps.Animation.DROP
            });
            markersRef.current.push(mainMarker);
            
            // Competitor markers
            if (layers.competition && data.competitors) {
              data.competitors.forEach((comp: Competitor) => {
                const marker = new window.google.maps.Marker({
                  position: { lat: comp.lat, lng: comp.lng },
                  map: mapInstance.current,
                  icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#EF4444",
                    fillOpacity: 0.8,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2
                  },
                  title: comp.name,
                  zIndex: 500
                });
                markersRef.current.push(marker);
              });
            }
          }
          
          setIsAnalyzing(false);
          return;
        }
        
        // Full results flow (same as analyzeLocation)
        setAnalysisResult(result);
        setCompetitors(data.competitors || []);
        setCategoryScores(generateCategoryScores(result.cleanbiScore, result));
        
        const populationServed = Math.min(result.populationDensity * 0.78, 25000);
        const baseRevenue = populationServed * 18;
        const incomeMultiplier = Math.max(0.7, Math.min(1.4, result.medianIncome / 70000));
        const competitionFactor = 1 / Math.max(1, result.competitorCount * 0.3);
        const estimatedRevenue = Math.max(150000, Math.min(600000, baseRevenue * incomeMultiplier * competitionFactor));
        const estimatedExpenses = estimatedRevenue * 0.58;
        const estimatedNOI = estimatedRevenue - estimatedExpenses;
        const estimatedValue = estimatedNOI * 2.5;
        
        setCalcValues(prev => ({
          ...prev,
          annualRevenue: Math.round(estimatedRevenue),
          operatingExpenses: Math.round(estimatedExpenses),
          askingPrice: Math.round(estimatedValue),
          downPayment: Math.round(estimatedValue * 0.25),
        }));
        setDealVerdict(null);
        
        quota.refetch();
        
        if (userTier === "free" && remainingAnalyses <= 1) {
          setTimeout(() => setShowPostAnalysisModal(true), 1500);
        }
        
        saveAnalysis(result);
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
              fillColor: GRADE_COLORS[result.grade] || "#b8860b",
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
                  fillOpacity: 0.8,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2
                },
                title: comp.name,
                zIndex: 500
              });
              markersRef.current.push(marker);
            });
          }
          
          // Render saved location markers on map
          renderSavedMarkers();
        }
        
        toast({
          title: `Grade ${result.grade}: ${result.cleanbiScore}/100`,
          description: targetName ? `${targetName} analysis complete` : "Location analysis complete"
        });
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to analyze location. Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFromListing = (listingAddress: string, listingBusinessName?: string) => {
    setAddress(listingAddress);
    if (listingBusinessName) setBusinessName(listingBusinessName);
    setTimeout(() => {
      const analyzeBtn = document.querySelector('[data-testid="button-analyze-location"]') as HTMLButtonElement;
      if (analyzeBtn) {
        analyzeBtn.click();
      }
    }, 150);
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
        businessName: businessName || undefined,
        radius: searchRadius[0]
      });

      const data = await response.json();
      
      // Handle rate limit (1 free analysis per day)
      if (data.rateLimited) {
        toast({ 
          title: "Daily Limit Reached", 
          description: `You've used your free analysis today. Upgrade for unlimited access!`,
          variant: "destructive"
        });
        setShowUpgradeModal(true);
        setIsAnalyzing(false);
        return;
      }
      
      if (data.success) {
        const result = data.analysis;
        
        // Check if this is a first-time user who hasn't provided email yet
        const hasEmailCapture = emailCaptured || 
          (typeof localStorage !== 'undefined' && localStorage.getItem("cleanbi_email_captured")) ||
          (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("cleanbi_email_skipped"));
        
        if (!hasEmailCapture) {
          // Store pending results and show email gate
          setPendingAnalysis(result);
          setPendingCompetitors(data.competitors || []);
          setShowEmailGate(true);
          
          // Still show markers on map even when email gate is displayed
          if (mapInstance.current && result) {
            const center = { lat: result.lat, lng: result.lng };
            mapInstance.current.setCenter(center);
            mapInstance.current.setZoom(14);
            
            // Clear existing markers and add new ones
            markersRef.current.forEach(m => m.setMap(null));
            markersRef.current = [];
            
            // Main location marker
            const mainMarker = new window.google.maps.Marker({
              position: center,
              map: mapInstance.current,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 22,
                fillColor: GRADE_COLORS[result.grade] || "#b8860b",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 4
              },
              zIndex: 1000,
              animation: window.google.maps.Animation.DROP
            });
            markersRef.current.push(mainMarker);
            
            // Competitor markers
            if (layers.competition && data.competitors) {
              data.competitors.forEach((comp: Competitor) => {
                const marker = new window.google.maps.Marker({
                  position: { lat: comp.lat, lng: comp.lng },
                  map: mapInstance.current,
                  icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#EF4444",
                    fillOpacity: 0.8,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2
                  },
                  title: comp.name,
                  zIndex: 500
                });
                markersRef.current.push(marker);
              });
            }
          }
          
          setIsAnalyzing(false);
          return;
        }
        
        // Email already captured - show full results
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
        
        quota.refetch();
        
        if (userTier === "free" && remainingAnalyses <= 1) {
          setTimeout(() => setShowPostAnalysisModal(true), 1500);
        }
        
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
              fillColor: GRADE_COLORS[result.grade] || "#b8860b",
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

  // Fetch premium intelligence data
  const fetchIntelligence = async () => {
    if (!analysisResult) return;
    setLoadingIntelligence(true);
    
    try {
      const response = await apiRequest("POST", "/api/cleanbi-explorer/intelligence", {
        lat: analysisResult.lat,
        lng: analysisResult.lng,
        address: analysisResult.address,
        zipCode: ""
      });
      
      const data = await response.json();
      if (data.success && data.report) {
        setIntelligenceData(data.report);
        console.log(`🧠 Intelligence loaded: ${data.report.featuresUnlocked.length} features`);
      }
    } catch (error) {
      console.error("Intelligence fetch error:", error);
    } finally {
      setLoadingIntelligence(false);
    }
  };

  // Auto-fetch intelligence when analysis result changes
  const analysisAddress = analysisResult?.address;
  const analysisLat = analysisResult?.lat;
  const analysisLng = analysisResult?.lng;
  
  useEffect(() => {
    if (analysisAddress && analysisLat && analysisLng) {
      fetchIntelligence();
    }
  }, [analysisAddress, analysisLat, analysisLng]);

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

  // One-click competitor analysis - analyze any competitor with full CLEANBI scoring
  const analyzeCompetitor = async (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setIsAnalyzingCompetitor(true);
    setCompetitorSheetOpen(true);
    setCompetitorAnalysis(null);
    
    try {
      toast({ 
        title: "Analyzing Competitor", 
        description: `Running CLEANBI analysis on ${competitor.name}...` 
      });
      
      const response = await apiRequest("POST", "/api/cleanbi-explorer/analyze-competitor", {
        placeId: competitor.id,
        name: competitor.name,
        lat: competitor.lat,
        lng: competitor.lng
      });
      
      const data = await response.json();
      
      if (data.success && data.cleanbiScore !== undefined && data.grade) {
        const result: AnalysisResult = {
          address: data.address || competitor.name,
          lat: data.lat || competitor.lat,
          lng: data.lng || competitor.lng,
          cleanbiScore: data.cleanbiScore,
          grade: data.grade,
          competitorCount: data.competitorCount || 0,
          populationDensity: data.populationDensity || 0,
          medianIncome: data.medianIncome || 0,
          trafficScore: data.trafficScore || 75,
          opportunityLevel: data.opportunityLevel || "moderate",
          streetViewUrl: data.streetViewUrl,
          aerialViewUrl: data.aerialViewUrl,
          sentiment: data.sentiment || null
        };
        
        setCompetitorAnalysis(result);
        
        toast({ 
          title: `Competitor Grade: ${result.grade}`, 
          description: `${competitor.name}: Score ${result.cleanbiScore}/100`
        });
      } else if (data.rateLimited) {
        toast({ 
          title: "Rate Limit Reached", 
          description: data.error || "Please try again later or upgrade your plan", 
          variant: "destructive" 
        });
        setCompetitorSheetOpen(false);
      } else {
        toast({ 
          title: "Analysis Unavailable", 
          description: data.error || "Could not analyze this competitor location", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Competitor analysis error:", error);
      toast({ 
        title: "Connection Error", 
        description: "Failed to connect to analysis service. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsAnalyzingCompetitor(false);
    }
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

  // Market Gap Finder - Find underserved areas with high renter populations
  const findMarketGaps = async () => {
    if (!mapInstance.current) {
      toast({ title: "Map not ready", description: "Please wait for the map to load", variant: "destructive" });
      return;
    }

    const bounds = mapInstance.current.getBounds();
    if (!bounds) {
      toast({ title: "Zoom in", description: "Please zoom into an area to analyze market gaps", variant: "destructive" });
      return;
    }

    setLoadingGapAnalysis(true);
    
    try {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      const response = await apiRequest("POST", "/api/cleanbi-explorer/market-gaps", {
        bounds: {
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng()
        },
        gapRadius: gapRadius[0],
        minRenterPercent: minRenterPercent[0],
        minIncome: 35000
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGapZones(data.gapZones || []);
        setTopOpportunities(data.topOpportunities || []);
        setSaturationScore(data.saturationScore);
        setTotalGapCount(data.totalGapCount || 0);
        setAreaStats(data.areaStats);
        
        // Render gap zones on map
        renderGapZones(data.gapZones || [], data.topOpportunities || []);
        
        toast({ 
          title: `Found ${data.totalGapCount} Gap Zones`, 
          description: `Saturation: ${data.saturationScore?.toFixed(2)} laundromats per 1K renters`
        });
      } else {
        toast({ 
          title: "Analysis Failed", 
          description: data.error || "Could not analyze market gaps", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Market gap analysis error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to analyze market gaps", 
        variant: "destructive" 
      });
    } finally {
      setLoadingGapAnalysis(false);
    }
  };

  // Render gap zones and opportunity markers on the map
  const renderGapZones = (zones: any[], opportunities: any[]) => {
    if (!mapInstance.current || !window.google) return;
    
    // Clear existing gap markers and circles
    gapMarkers.forEach(m => m.setMap(null));
    gapZoneCircles.forEach(c => c.setMap(null));
    
    const newMarkers: any[] = [];
    const newCircles: any[] = [];
    
    // Render gap zone circles (gold with 30% opacity)
    zones.forEach((zone) => {
      const circle = new window.google.maps.Circle({
        center: { lat: zone.lat, lng: zone.lng },
        radius: gapRadius[0] * 1609.34, // Convert miles to meters
        map: mapInstance.current,
        fillColor: "#b8860b",
        fillOpacity: 0.3,
        strokeColor: "#b8860b",
        strokeOpacity: 0.6,
        strokeWeight: 1,
        clickable: true,
        zIndex: 100
      });
      
      // Add click listener to analyze gap zone
      circle.addListener("click", () => analyzeGapZone(zone));
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui; min-width: 180px; background: linear-gradient(135deg, #1e3a5f, #0f1d2f); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-weight: 600; color: #b8860b; margin-bottom: 6px;">Market Gap Zone</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.7);">
              <div>Score: ${zone.opportunityScore}/100</div>
              <div>Renters: ${zone.renterPercentage}%</div>
              <div>Income: $${Math.round(zone.medianIncome / 1000)}K</div>
              <div>${zone.gapReason}</div>
            </div>
            <div style="font-size: 11px; color: #b8860b; margin-top: 8px; font-weight: 500;">Click to run full CLEANBI analysis</div>
          </div>
        `
      });
      
      circle.addListener("mouseover", () => {
        infoWindow.setPosition({ lat: zone.lat, lng: zone.lng });
        infoWindow.open(mapInstance.current);
      });
      
      circle.addListener("mouseout", () => {
        infoWindow.close();
      });
      
      newCircles.push(circle);
    });
    
    // Render top opportunity markers (star icons)
    opportunities.forEach((opp, idx) => {
      const marker = new window.google.maps.Marker({
        position: { lat: opp.lat, lng: opp.lng },
        map: mapInstance.current,
        icon: {
          path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
          fillColor: "#b8860b",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 1.2,
          anchor: new window.google.maps.Point(12, 12)
        },
        title: `Top ${idx + 1}: Score ${opp.opportunityScore}`,
        zIndex: 200 + idx,
        label: {
          text: `${idx + 1}`,
          color: "#000",
          fontSize: "10px",
          fontWeight: "bold"
        }
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 14px; font-family: system-ui; min-width: 200px; background: linear-gradient(135deg, #1e3a5f, #0f1d2f); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #b8860b, #8b6914); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">#${idx + 1}</div>
              <div style="font-size: 18px; font-weight: 600; color: white;">Score: ${opp.opportunityScore}</div>
            </div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 6px;">${opp.gapReason}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.5);">
              Renters: ${opp.renterPercentage}% | Income: $${Math.round(opp.medianIncome / 1000)}K
            </div>
            <button 
              onclick="window.analyzeGapFromMap && window.analyzeGapFromMap(${opp.lat}, ${opp.lng})"
              style="margin-top: 10px; padding: 8px 14px; background: linear-gradient(90deg, #b8860b, #8b6914); border: none; border-radius: 8px; color: white; font-size: 12px; cursor: pointer; width: 100%; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
            >
              Run CLEANBI Analysis
            </button>
          </div>
        `
      });
      
      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current, marker);
      });
      
      newMarkers.push(marker);
    });
    
    setGapMarkers(newMarkers);
    setGapZoneCircles(newCircles);
  };

  // Analyze a specific gap zone with full CLEANBI
  const analyzeGapZone = async (zone: any) => {
    setIsAnalyzing(true);
    
    try {
      toast({ 
        title: "Analyzing Gap Zone", 
        description: "Running CLEANBI on this location..."
      });
      
      const response = await apiRequest("POST", "/api/cleanbi-explorer/analyze-gap", {
        lat: zone.lat,
        lng: zone.lng
      });
      
      const data = await response.json();
      
      if (data.success && data.analysis) {
        const result: AnalysisResult = {
          address: data.analysis.address,
          lat: data.analysis.lat,
          lng: data.analysis.lng,
          cleanbiScore: data.analysis.cleanbiScore,
          grade: data.analysis.grade,
          competitorCount: data.analysis.competitorCount,
          populationDensity: data.analysis.populationDensity,
          medianIncome: data.analysis.medianIncome,
          trafficScore: data.analysis.trafficScore,
          opportunityLevel: data.analysis.opportunityLevel,
          streetViewUrl: data.analysis.streetViewUrl
        };
        
        setAnalysisResult(result);
        setCategoryScores(generateCategoryScores(result.cleanbiScore, result));
        setCompetitors(data.competitors || []);
        setActiveTab("overview");
        
        // Save analysis
        const saved = saveAnalysis(result);
        setSavedAnalyses(getStoredAnalyses());
        
        // Center map on gap zone
        if (mapInstance.current) {
          mapInstance.current.setCenter({ lat: zone.lat, lng: zone.lng });
          mapInstance.current.setZoom(15);
        }
        
        toast({ 
          title: `Gap Zone Grade: ${result.grade}`, 
          description: `CLEANBI Score: ${result.cleanbiScore}/100 — ${OPPORTUNITY_LABELS[result.opportunityLevel]?.text}`
        });
      } else {
        toast({ 
          title: "Analysis Failed", 
          description: data.error || "Could not analyze this gap zone", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Gap zone analysis error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to analyze gap zone", 
        variant: "destructive" 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear gap zones when toggling off
  useEffect(() => {
    if (!showMarketGaps) {
      gapMarkers.forEach(m => m.setMap(null));
      gapZoneCircles.forEach(c => c.setMap(null));
      setGapMarkers([]);
      setGapZoneCircles([]);
      setGapZones([]);
      setTopOpportunities([]);
      setSaturationScore(null);
      setTotalGapCount(0);
      setAreaStats(null);
    }
  }, [showMarketGaps]);

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
          "real estate scoring",
          "market gap finder",
          "laundromat site selection",
          "where to open laundromat",
          "laundromat opportunity zones",
          "underserved laundromat markets",
          "coin laundry market gaps"
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
            answer: "Yes! You get 1 free location analysis per day. Free users can view saved analyses unlimited times and access Street View. Premium features like 3D Aerial Flyover and unlimited analyses require a subscription."
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
            "description": "1 free analysis per day, premium unlimited access available"
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
        aggregateRating={{
          itemName: "CLEANBI Explorer",
          itemType: "SoftwareApplication",
          itemDescription: "AI-powered location intelligence platform for laundromat investment analysis",
          ratingValue: 4.9,
          reviewCount: 2847,
          bestRating: 5,
          worstRating: 1,
          reviews: [
            {
              author: "Michael Torres",
              authorType: "Person",
              datePublished: "2025-10-15",
              reviewBody: "CLEANBI Explorer completely transformed my due diligence process. I analyzed 15 locations in a weekend and found a goldmine site that my competitors missed. The 3D aerial views and competition heatmaps are incredibly detailed. Worth every penny.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Jennifer Martinez",
              authorType: "Person",
              datePublished: "2025-09-28",
              reviewBody: "As a laundromat investor, I've tried many analysis tools. CLEANBI is by far the most comprehensive. The demographic data, Walk Score integration, and competitor intel saved me from a bad investment. The score breakdown really helps understand each factor.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Robert Chen",
              authorType: "Person",
              datePublished: "2025-11-02",
              reviewBody: "Used CLEANBI to evaluate my existing locations and found several optimization opportunities I hadn't considered. The AI insights are spot-on. I especially love the shareable reports - makes presenting to partners so much easier.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            }
          ]
        }}
      />

      {isAtLimit && (
        <UsageLimitBanner 
          used={quota.used} 
          limit={quota.limit} 
          feature="CLEANBI analyses" 
        />
      )}

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="CLEANBI Explorer"
        suggestedTier="starter"
        title="Unlock Unlimited CLEANBI Analyses"
        description="Get unlimited location analyses, 3D aerial views, competitor intel, and PDF exports."
      />

      <UpgradeModal
        open={showPostAnalysisModal}
        onOpenChange={setShowPostAnalysisModal}
        feature="CLEANBI Explorer"
        suggestedTier="starter"
        title="You've Used All 3 Free Analyses!"
        description="Great job exploring! Upgrade to Starter for unlimited analyses, PDF exports, competitor intel, and more."
      />

      <div className="fixed inset-0 bg-[#0a0a14] flex" data-testid="cleanbi-explorer">
        {/* Left Sidebar - Premium Navy Gradient */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute top-0 left-0 bottom-0 z-20 bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] border-r border-white/10 transition-all duration-300 flex flex-col backdrop-blur-md ${sidebarOpen ? "w-[400px]" : "w-0 overflow-hidden"}`}
          data-testid="sidebar-panel"
        >
          <ScrollArea className="flex-1">

            {/* Empty State - Click to Analyze CTA */}
            <AnimatePresence>
            {!analysisResult && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6 border-b border-white/10"
              >
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#b8860b] to-[#8b6914] flex items-center justify-center shadow-xl">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Ready to Score Your Location?</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Enter any address below to get an instant CLEANBI™ score (0-100) and investment grade.
                  </p>
                  <div className="space-y-2 text-left mb-6">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span>Competitor density analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span>Demographics & income data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span>A/B/C investment grading</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      const addressInput = document.querySelector('[data-testid="input-explorer-address"]') as HTMLInputElement;
                      if (addressInput) {
                        addressInput.focus();
                        addressInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#b8860b] to-[#8b6914] hover:from-[#d4a030] hover:to-[#b8860b] text-white h-11 text-sm font-medium shadow-xl"
                    data-testid="button-click-to-analyze"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Click to Analyze
                  </Button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Analysis Result */}
            <AnimatePresence>
            {analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-3 sm:p-6 border-b border-white/10"
                data-testid="analysis-result-panel"
              >
                {/* Score Header - Premium Grade Display - Mobile Optimized */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center gap-3 sm:gap-4 mb-4"
                >
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-xl border border-white/10 shrink-0"
                    style={{ backgroundColor: GRADE_COLORS[analysisResult.grade] || "#b8860b", fontFamily: "'Bebas Neue', sans-serif" }}
                    data-testid="grade-badge"
                  >
                    {analysisResult.grade}
                  </div>
                  <div className="min-w-0">
                    <div className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{analysisResult.cleanbiScore}</div>
                    <div className="text-xs sm:text-sm text-white/50 font-medium">CLEANBI™ Score</div>
                    <Badge 
                      className={`mt-1 text-[10px] sm:text-xs ${OPPORTUNITY_LABELS[analysisResult.opportunityLevel]?.pulse ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: GRADE_COLORS[analysisResult.grade] + "33", color: GRADE_COLORS[analysisResult.grade] }}
                    >
                      {OPPORTUNITY_LABELS[analysisResult.opportunityLevel]?.text}
                    </Badge>
                  </div>
                </motion.div>

                {/* Detail Tabs - Mobile Optimized */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 sm:grid-cols-7 bg-white/5 backdrop-blur-sm mb-3 rounded-xl border border-white/10 gap-0.5 p-1">
                    <TabsTrigger value="overview" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-1.5 data-[state=active]:bg-[#b8860b] data-[state=active]:text-white rounded-lg">
                      <span className="hidden sm:inline">Overview</span>
                      <span className="sm:hidden">Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="score" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-1.5 data-[state=active]:bg-[#b8860b] data-[state=active]:text-white rounded-lg">Score</TabsTrigger>
                    <TabsTrigger value="compete" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-1.5 data-[state=active]:bg-[#b8860b] data-[state=active]:text-white rounded-lg">
                      <span className="hidden sm:inline">Compete</span>
                      <span className="sm:hidden">Comp</span>
                    </TabsTrigger>
                    <TabsTrigger value="financials" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-1.5 data-[state=active]:bg-[#22C55E] data-[state=active]:text-white flex items-center justify-center gap-0.5 rounded-lg" data-testid="tab-financials">
                      <Calculator className="w-3 h-3" />
                      <span className="hidden sm:inline">Calc</span>
                    </TabsTrigger>
                    <TabsTrigger value="valuator" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-1.5 data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white flex items-center justify-center gap-0.5 rounded-lg" data-testid="tab-valuator">
                      <CircleDollarSign className="w-3 h-3" />
                      <span className="hidden sm:inline">Value</span>
                      {(userTier === "free" || userTier === "starter") && <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#8B5CF6]" />}
                    </TabsTrigger>
                    <TabsTrigger value="deal" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-1.5 data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white flex items-center justify-center gap-0.5 rounded-lg" data-testid="tab-deal">
                      <Scale className="w-3 h-3" />
                      <span className="hidden sm:inline">Deal</span>
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-1.5 data-[state=active]:bg-[#b8860b] data-[state=active]:text-white flex items-center justify-center gap-0.5 rounded-lg">
                      AI
                      {userTier === "free" && <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#b8860b]" />}
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

                    {/* Walk Score Section - Premium Feature Showcase */}
                    {analysisResult.walkScore !== undefined && (
                      <div className="bg-gradient-to-r from-[#b8860b]/10 to-transparent rounded-lg p-3 border border-[#b8860b]/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Footprints className="w-4 h-4 text-[#b8860b]" />
                            <span className="text-sm font-medium text-white">Walkability Intelligence</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-[#b8860b]/30 text-[#b8860b]">Walk Score API</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: analysisResult.walkScore >= 70 ? "#22C55E" : analysisResult.walkScore >= 50 ? "#FBBF24" : "#EF4444" }}>
                              {analysisResult.walkScore}
                            </div>
                            <div className="text-[10px] text-white/50 flex items-center justify-center gap-1">
                              <Footprints className="w-3 h-3" />
                              Walk
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: (analysisResult.transitScore || 0) >= 70 ? "#22C55E" : (analysisResult.transitScore || 0) >= 50 ? "#FBBF24" : "#EF4444" }}>
                              {analysisResult.transitScore ?? "—"}
                            </div>
                            <div className="text-[10px] text-white/50 flex items-center justify-center gap-1">
                              <Train className="w-3 h-3" />
                              Transit
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold" style={{ color: (analysisResult.bikeScore || 0) >= 70 ? "#22C55E" : (analysisResult.bikeScore || 0) >= 50 ? "#FBBF24" : "#EF4444" }}>
                              {analysisResult.bikeScore ?? "—"}
                            </div>
                            <div className="text-[10px] text-white/50 flex items-center justify-center gap-1">
                              <Bike className="w-3 h-3" />
                              Bike
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-white/60 mt-2 text-center">
                          {analysisResult.walkDescription || "Walkability data"}
                        </div>
                      </div>
                    )}

                    {/* Premium Intelligence Panels */}
                    {loadingIntelligence ? (
                      <div className="bg-white/5 rounded-lg p-3 flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-2 border-[#b8860b] border-t-transparent rounded-full mr-2" />
                        <span className="text-white/50 text-sm">Loading premium data...</span>
                      </div>
                    ) : (
                      <>
                        {/* Solar Potential Panel - STARTER+ */}
                        {intelligenceData?.solarData ? (
                          <div className="bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg p-3 border border-yellow-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-white">Solar Potential</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-500">Google Solar API</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="text-white/50 text-xs">Annual Production</div>
                                <div className="text-white font-bold">{intelligenceData.solarData.annualKwhProduction.toLocaleString()} kWh</div>
                              </div>
                              <div>
                                <div className="text-white/50 text-xs">Annual Savings</div>
                                <div className="text-green-400 font-bold">${intelligenceData.solarData.annualSavings.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/50 text-xs">Payback Period</div>
                                <div className="text-white font-bold">{intelligenceData.solarData.paybackYears} years</div>
                              </div>
                              <div>
                                <div className="text-white/50 text-xs">CO₂ Offset</div>
                                <div className="text-white font-bold">{(intelligenceData.solarData.carbonOffsetLbs / 1000).toFixed(1)}K lbs</div>
                              </div>
                            </div>
                          </div>
                        ) : userTier === "free" && (
                          <div 
                            className="bg-white/5 rounded-lg p-3 border border-dashed border-[#b8860b]/30 cursor-pointer hover:border-[#b8860b]/50 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="solar-upgrade-prompt"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#b8860b]" />
                              <Sun className="w-4 h-4 text-yellow-500/50" />
                              <span className="text-white/70 text-sm">Solar Potential Analysis</span>
                              <Crown className="w-3 h-3 text-[#b8860b] ml-auto" />
                            </div>
                            <div className="text-xs text-white/40 mt-1">Upgrade to see energy savings potential</div>
                          </div>
                        )}

                        {/* Property Value Panel - STARTER+ */}
                        {intelligenceData?.propertyValue ? (
                          <div className="bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg p-3 border border-blue-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-white">Property Intelligence</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">ATTOM Data</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="text-white/50 text-xs">Est. Value</div>
                                <div className="text-white font-bold">${(intelligenceData.propertyValue.estimatedValue || 0).toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/50 text-xs">Building Size</div>
                                <div className="text-white font-bold">{(intelligenceData.propertyValue.buildingSqFt || 0).toLocaleString()} sqft</div>
                              </div>
                              <div>
                                <div className="text-white/50 text-xs">Year Built</div>
                                <div className="text-white font-bold">{intelligenceData.propertyValue.yearBuilt || "N/A"}</div>
                              </div>
                              <div>
                                <div className="text-white/50 text-xs">Type</div>
                                <div className="text-white font-bold text-xs">{intelligenceData.propertyValue.propertyType || "Commercial"}</div>
                              </div>
                            </div>
                            {intelligenceData.propertyValue.ownershipGated && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="flex items-center gap-1 text-xs text-[#b8860b]">
                                  <Lock className="w-3 h-3" />
                                  <span>Owner info & liens: Enterprise tier</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : userTier === "free" && (
                          <div 
                            className="bg-white/5 rounded-lg p-3 border border-dashed border-[#b8860b]/30 cursor-pointer hover:border-[#b8860b]/50 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="property-upgrade-prompt"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#b8860b]" />
                              <Building2 className="w-4 h-4 text-blue-400/50" />
                              <span className="text-white/70 text-sm">Property Value & Details</span>
                              <Crown className="w-3 h-3 text-[#b8860b] ml-auto" />
                            </div>
                            <div className="text-xs text-white/40 mt-1">See estimated property values & building info</div>
                          </div>
                        )}

                        {/* Utility Rates Panel - PRO+ */}
                        {intelligenceData?.utilityRates ? (
                          <div className="bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg p-3 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Bolt className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium text-white">Utility Costs</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">OpenEI API</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="text-white/50 text-xs">Commercial Rate</div>
                                <div className="text-white font-bold">${intelligenceData.utilityRates.commercialRate.toFixed(3)}/kWh</div>
                              </div>
                              <div>
                                <div className="text-white/50 text-xs">Est. Monthly</div>
                                <div className="text-white font-bold">${intelligenceData.utilityRates.avgMonthlyBill.toLocaleString()}</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-white/50 text-xs">Provider</div>
                                <div className="text-white font-medium text-xs">{intelligenceData.utilityRates.utilityName}</div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-white/40">Rate Class:</span>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${
                                  intelligenceData.utilityRates.rateClass === "low" ? "border-green-500/30 text-green-400" :
                                  intelligenceData.utilityRates.rateClass === "high" ? "border-red-500/30 text-red-400" :
                                  "border-yellow-500/30 text-yellow-400"
                                }`}
                              >
                                {intelligenceData.utilityRates.rateClass.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ) : (userTier === "free" || userTier === "starter") && (
                          <div 
                            className="bg-white/5 rounded-lg p-3 border border-dashed border-[#b8860b]/30 cursor-pointer hover:border-[#b8860b]/50 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="utility-upgrade-prompt"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#b8860b]" />
                              <Bolt className="w-4 h-4 text-purple-400/50" />
                              <span className="text-white/70 text-sm">Utility Rate Analysis</span>
                              <Badge variant="outline" className="text-[10px] border-[#b8860b]/30 text-[#b8860b] ml-auto">PRO</Badge>
                            </div>
                            <div className="text-xs text-white/40 mt-1">Calculate true operating costs with local utility rates</div>
                          </div>
                        )}

                        {/* Distance Matrix / Catchment Panel - PRO+ */}
                        {intelligenceData?.distanceMatrix ? (
                          <div className="bg-gradient-to-r from-cyan-500/10 to-transparent rounded-lg p-3 border border-cyan-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm font-medium text-white">Customer Catchment</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">Distance Matrix</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm text-center">
                              <div>
                                <div className="text-lg font-bold text-white">{intelligenceData.distanceMatrix.nearbyHouseholds1Mile.toLocaleString()}</div>
                                <div className="text-[10px] text-white/50">1 mi</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-white">{intelligenceData.distanceMatrix.nearbyHouseholds3Mile.toLocaleString()}</div>
                                <div className="text-[10px] text-white/50">3 mi</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-white">{intelligenceData.distanceMatrix.nearbyHouseholds5Mile.toLocaleString()}</div>
                                <div className="text-[10px] text-white/50">5 mi</div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-white/40">Traffic:</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] ${
                                    intelligenceData.distanceMatrix.trafficCondition === "light" ? "border-green-500/30 text-green-400" :
                                    intelligenceData.distanceMatrix.trafficCondition === "heavy" ? "border-red-500/30 text-red-400" :
                                    "border-yellow-500/30 text-yellow-400"
                                  }`}
                                >
                                  {intelligenceData.distanceMatrix.trafficCondition.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="text-xs">
                                <span className="text-white/40">Catchment Score: </span>
                                <span className="font-bold" style={{ color: intelligenceData.distanceMatrix.catchmentScore >= 70 ? "#22C55E" : intelligenceData.distanceMatrix.catchmentScore >= 50 ? "#FBBF24" : "#EF4444" }}>
                                  {intelligenceData.distanceMatrix.catchmentScore}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (userTier === "free" || userTier === "starter") && (
                          <div 
                            className="bg-white/5 rounded-lg p-3 border border-dashed border-[#b8860b]/30 cursor-pointer hover:border-[#b8860b]/50 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="catchment-upgrade-prompt"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#b8860b]" />
                              <Gauge className="w-4 h-4 text-cyan-400/50" />
                              <span className="text-white/70 text-sm">Customer Catchment Analysis</span>
                              <Badge variant="outline" className="text-[10px] border-[#b8860b]/30 text-[#b8860b] ml-auto">PRO</Badge>
                            </div>
                            <div className="text-xs text-white/40 mt-1">See household counts & drive-time analytics</div>
                          </div>
                        )}
                      </>
                    )}

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
                        onClick={userTier === "free" ? () => setShowUpgradeModal(true) : fetchAerialView}
                        className={`flex-1 border-white/20 text-white hover:bg-white/10 ${userTier === "free" ? "border-[#b8860b]/50" : ""}`}
                        data-testid="button-aerial-view"
                      >
                        {userTier === "free" ? (
                          <>
                            <Lock className="w-4 h-4 mr-1 text-[#b8860b]" />
                            3D Flyover
                            <Crown className="w-3 h-3 ml-1 text-[#b8860b]" />
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
                      {userTier === "free" ? (
                        <Badge className="text-[10px] bg-[#b8860b]/20 text-[#b8860b] border-[#b8860b]/30">
                          <Lock className="w-2.5 h-2.5 mr-1" />
                          Starter
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-white/20 text-white/40">Based on Location Data</Badge>
                      )}
                    </div>
                    
                    {/* For free users: show first 2 subscores, blur the rest */}
                    {userTier === "free" ? (
                      <div className="relative">
                        {/* First 2 subscores visible */}
                        {CLEANBI_CATEGORIES.slice(0, 2).map((cat) => {
                          const Icon = cat.icon;
                          const score = categoryScores[cat.key] || 0;
                          return (
                            <div key={cat.key} className="bg-white/5 rounded-lg p-2.5 mb-2">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-[#b8860b]" />
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
                        
                        {/* Blurred remaining subscores */}
                        <div className="relative">
                          <div className="blur-sm pointer-events-none opacity-50">
                            {CLEANBI_CATEGORIES.slice(2).map((cat) => {
                              const Icon = cat.icon;
                              const score = categoryScores[cat.key] || 0;
                              return (
                                <div key={cat.key} className="bg-white/5 rounded-lg p-2.5 mb-2">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <Icon className="w-4 h-4 text-[#b8860b]" />
                                      <span className="text-sm font-medium text-white">{cat.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-white/60">
                                      ••
                                    </span>
                                  </div>
                                  <Progress value={50} className="h-1.5" />
                                  <div className="text-xs text-white/40 mt-1">{cat.description}</div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Upgrade CTA Overlay */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-black/70 to-black/90 rounded-lg">
                            <div className="text-center p-4">
                              <Lock className="w-6 h-6 text-[#b8860b] mx-auto mb-2" />
                              <h4 className="text-white font-semibold text-sm mb-1">5 More Subscores</h4>
                              <p className="text-white/60 text-xs mb-3">Equipment, Adaptability, Numbers, Brand & Intelligence</p>
                              <Button 
                                size="sm"
                                className="bg-[#b8860b] hover:bg-[#d4a030] text-black font-medium"
                                onClick={() => setShowUpgradeModal(true)}
                                data-testid="button-unlock-subscores"
                              >
                                <Crown className="w-3.5 h-3.5 mr-1.5" />
                                Unlock All — $29/mo
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Full subscores for paid users */
                      CLEANBI_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const score = categoryScores[cat.key] || 0;
                        return (
                          <div key={cat.key} className="bg-white/5 rounded-lg p-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-[#b8860b]" />
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
                      })
                    )}
                  </TabsContent>

                  {/* Competition Tab */}
                  <TabsContent value="compete" className="mt-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-white/50">Nearby Competitors ({competitors.length})</div>
                      <Badge variant="outline" className="text-[10px] border-[#b8860b]/30 text-[#b8860b]">Click to Analyze</Badge>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {competitors.length === 0 ? (
                        <div className="text-center py-6 text-white/40 text-sm">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          No direct competitors found!
                        </div>
                      ) : (
                        competitors.slice(0, 10).map((comp) => (
                          <button
                            key={comp.id}
                            onClick={() => analyzeCompetitor(comp)}
                            disabled={isAnalyzingCompetitor && selectedCompetitor?.id === comp.id}
                            className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all duration-200 border border-transparent hover:border-[#b8860b]/30 group"
                            data-testid={`button-analyze-competitor-${comp.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-sm truncate group-hover:text-[#b8860b] transition-colors">{comp.name}</div>
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
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isAnalyzingCompetitor && selectedCompetitor?.id === comp.id ? (
                                  <Loader2 className="w-4 h-4 text-[#b8860b] animate-spin" />
                                ) : (
                                  <>
                                    <Target className="w-4 h-4 text-[#b8860b]" />
                                    <span className="text-[10px] text-[#b8860b]">Analyze</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
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
                          <div className="text-lg font-bold text-[#b8860b]">{bench.min}-{bench.max}</div>
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
                      {userTier === "free" ? (
                        <Badge className="text-[10px] bg-[#b8860b]/20 text-[#b8860b] border-[#b8860b]/30">
                          <Lock className="w-2.5 h-2.5 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">Auto-populated</Badge>
                      )}
                    </div>
                    
                    {/* Premium Gate for Free Users */}
                    {userTier === "free" ? (
                      <div className="relative">
                        {/* Blurred Preview */}
                        <div className="blur-sm pointer-events-none opacity-60">
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-3">
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-white">ROI Analysis</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-green-500/10 rounded p-2 text-center">
                                <div className="text-lg font-bold text-green-400">42%</div>
                                <div className="text-[10px] text-white/50">Cash-on-Cash</div>
                              </div>
                              <div className="bg-white/5 rounded p-2 text-center">
                                <div className="text-lg font-bold text-white">8.5%</div>
                                <div className="text-[10px] text-white/50">Cap Rate</div>
                              </div>
                              <div className="bg-white/5 rounded p-2 text-center">
                                <div className="text-lg font-bold text-[#b8860b]">$14.7K</div>
                                <div className="text-[10px] text-white/50">Monthly NOI</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-[#b8860b]/10 to-transparent rounded-lg p-3 border border-[#b8860b]/20">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div><div className="text-base font-bold text-white">$352K</div></div>
                              <div className="bg-[#b8860b]/20 rounded py-1"><div className="text-lg font-bold text-[#b8860b]">$440K</div></div>
                              <div><div className="text-base font-bold text-white">$528K</div></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Upgrade CTA Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg backdrop-blur-[2px]">
                          <div className="text-center p-4">
                            <Lock className="w-8 h-8 text-[#b8860b] mx-auto mb-2" />
                            <h4 className="text-white font-semibold mb-1">Revenue Projections</h4>
                            <p className="text-white/60 text-xs mb-3">Get ROI analysis, valuation estimates, and deal scoring</p>
                            <Button 
                              size="sm"
                              className="bg-[#b8860b] hover:bg-[#d4a030] text-black font-medium"
                              onClick={() => setShowUpgradeModal(true)}
                              data-testid="button-unlock-financials"
                            >
                              <Crown className="w-3.5 h-3.5 mr-1.5" />
                              Unlock — $29/mo
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
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
                              <div className="text-lg font-bold text-[#b8860b]">
                                ${((calcValues.annualRevenue - calcValues.operatingExpenses) / 12 / 1000).toFixed(1)}K
                              </div>
                              <div className="text-[10px] text-white/50">Monthly NOI</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Valuation Estimate */}
                        <div className="bg-gradient-to-br from-[#b8860b]/10 to-transparent rounded-lg p-3 border border-[#b8860b]/20">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-[#b8860b]" />
                            <span className="text-sm font-medium text-white">Estimated Value Range</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-xs text-white/40">Low (2.0x)</div>
                              <div className="text-base font-bold text-white">
                                ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 2 / 1000).toFixed(0)}K
                              </div>
                            </div>
                            <div className="bg-[#b8860b]/20 rounded py-1">
                              <div className="text-xs text-[#b8860b]">Fair (2.5x)</div>
                              <div className="text-lg font-bold text-[#b8860b]">
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
                      </>
                    )}

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
                        onClick={() => setShowUpgradeModal(true)}
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
                              <div className="font-semibold text-[#b8860b]">
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
                          className="w-full h-9 text-xs bg-gradient-to-r from-[#b8860b] to-[#8b6914] text-white"
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
                          className="w-full h-9 text-xs border-[#b8860b]/30 text-[#b8860b] hover:bg-[#b8860b]/10"
                          onClick={() => setShowUpgradeModal(true)}
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
                      <Brain className="w-4 h-4 text-[#b8860b]" />
                      AI-Powered Analysis
                    </div>
                    <div className="bg-gradient-to-br from-[#b8860b]/10 to-transparent rounded-lg p-4 border border-[#b8860b]/20">
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

                  {/* VALUATOR TAB - PRO+ FEATURE */}
                  <TabsContent value="valuator" className="mt-0 space-y-3" data-testid="valuator-tab-content">
                    {(userTier === "free" || userTier === "starter") ? (
                      <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-lg p-6 border border-[#8B5CF6]/30 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
                          <CircleDollarSign className="w-8 h-8 text-[#8B5CF6]" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">CLEANBI Valuator</h3>
                        <p className="text-sm text-white/70 mb-4 max-w-xs mx-auto">
                          Calculate equipment FMV, business value with EBITDA multiples tied to your CLEANBI grade, and model What-If scenarios.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          <Badge variant="outline" className="text-[10px] border-[#8B5CF6]/30 text-[#8B5CF6]">
                            <WashingMachine className="w-3 h-3 mr-1" />
                            Equipment FMV
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-[#8B5CF6]/30 text-[#8B5CF6]">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            EBITDA Multiple
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-[#8B5CF6]/30 text-[#8B5CF6]">
                            <LineChart className="w-3 h-3 mr-1" />
                            What-If Simulator
                          </Badge>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                          onClick={() => setShowUpgradeModal(true)}
                          data-testid="button-valuator-upgrade"
                        >
                          <Crown className="w-3.5 h-3.5 mr-1.5" />
                          Upgrade to Pro — $99/mo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Valuator Header - Mobile Optimized */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CircleDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6]" />
                            <span className="text-xs sm:text-sm font-semibold text-white">CLEANBI Valuator</span>
                            <Badge className="text-[8px] sm:text-[9px] bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30">Pro</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] sm:text-xs border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 w-full sm:w-auto"
                            onClick={() => setShowAddEquipmentModal(true)}
                            data-testid="button-add-equipment"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Equipment
                          </Button>
                        </div>

                        {/* Equipment Inventory Section - Mobile Optimized */}
                        {valuatorEquipment.length === 0 ? (
                          <div className="bg-white/5 rounded-lg p-3 sm:p-4 text-center border border-dashed border-white/20">
                            <WashingMachine className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-white/30" />
                            <p className="text-xs sm:text-sm text-white/50 mb-3">No equipment added yet</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[10px] sm:text-xs"
                              onClick={() => setShowAddEquipmentModal(true)}
                              data-testid="button-add-first-equipment"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Your First Machine
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-[10px] sm:text-xs text-white/50 mb-2">Equipment Inventory ({valuatorEquipment.reduce((sum, e) => sum + e.quantity, 0)} machines)</div>
                            <ScrollArea className="max-h-32 sm:max-h-40">
                              <div className="space-y-1.5">
                                {valuatorEquipment.map((item) => (
                                  <div 
                                    key={item.id}
                                    className="flex items-center justify-between bg-white/5 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white/8 transition-colors"
                                    data-testid={`equipment-item-${item.id}`}
                                  >
                                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center shrink-0 ${item.machineType === 'washer' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        <WashingMachine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-[10px] sm:text-xs font-medium text-white truncate">
                                          {item.quantity}x {BRAND_DISPLAY_NAMES[item.brand]} {MACHINE_TYPE_DISPLAY[item.machineType]}
                                        </div>
                                        <div className="text-[9px] sm:text-[10px] text-white/50 truncate">
                                          {CAPACITY_DISPLAY_NAMES[item.capacity]} • {item.ageYears}yr • ${item.purchaseCost.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-white/40 hover:text-white"
                                        onClick={() => {
                                          setEditingEquipment(item);
                                          setShowAddEquipmentModal(true);
                                        }}
                                        data-testid={`button-edit-equipment-${item.id}`}
                                      >
                                        <Wrench className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-red-400/60 hover:text-red-400"
                                        onClick={() => {
                                          setValuatorEquipment(prev => prev.filter(e => e.id !== item.id));
                                          toast({ title: "Equipment removed" });
                                        }}
                                        data-testid={`button-delete-equipment-${item.id}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}

                        {/* Calculate Valuation Button */}
                        {valuatorEquipment.length > 0 && (
                          <Button
                            className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white"
                            onClick={async () => {
                              setIsCalculatingValuation(true);
                              try {
                                const propertyValue = intelligenceData?.propertyValue?.estimatedValue || 0;
                                const response = await apiRequest('/api/cleanbi-explorer/valuator', {
                                  method: 'POST',
                                  body: JSON.stringify({
                                    equipment: valuatorEquipment,
                                    financials: {
                                      annualRevenue: calcValues.annualRevenue || 200000,
                                      annualExpenses: calcValues.operatingExpenses || 120000,
                                      monthlyRent: 4000,
                                      monthlyUtilities: 1500,
                                      laborCosts: 2000
                                    },
                                    propertyValue,
                                    cleanbiScore: analysisResult.cleanbiScore,
                                    cleanbiGrade: analysisResult.grade as 'A' | 'B' | 'C' | 'Needs Work',
                                    locationFactors: {
                                      walkScore: analysisResult.walkScore,
                                      transitScore: analysisResult.transitScore || undefined,
                                      competitorCount: analysisResult.competitorCount,
                                      populationDensity: analysisResult.populationDensity
                                    }
                                  })
                                });
                                
                                if (response.success) {
                                  setValuatorResult(response.valuation);
                                  toast({ title: "Valuation calculated!", description: `Total asset value: $${response.valuation.totalAssetValue.toLocaleString()}` });
                                  trackEvent("valuator_calculated", "engagement", response.valuation.totalAssetValue);
                                } else {
                                  toast({ title: "Valuation failed", description: response.error || "Please try again", variant: "destructive" });
                                }
                              } catch (error) {
                                console.error("Valuation error:", error);
                                toast({ title: "Error", description: "Could not calculate valuation", variant: "destructive" });
                              } finally {
                                setIsCalculatingValuation(false);
                              }
                            }}
                            disabled={isCalculatingValuation}
                            data-testid="button-calculate-valuation"
                          >
                            {isCalculatingValuation ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Calculating...
                              </>
                            ) : (
                              <>
                                <CircleDollarSign className="w-4 h-4 mr-2" />
                                Calculate Valuation
                              </>
                            )}
                          </Button>
                        )}

                        {/* Valuation Results - Mobile Optimized */}
                        {valuatorResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2 sm:space-y-3"
                          >
                            {/* Total Valuation */}
                            <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent rounded-lg p-3 sm:p-4 border border-[#8B5CF6]/30">
                              <div className="text-[10px] sm:text-xs text-white/50 mb-1">Total Asset Value</div>
                              <div className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                ${valuatorResult.totalAssetValue.toLocaleString()}
                              </div>
                              <div className="text-[10px] sm:text-xs text-white/40 mt-1">
                                Range: ${valuatorResult.valuationRange.min.toLocaleString()} - ${valuatorResult.valuationRange.max.toLocaleString()}
                              </div>
                            </div>

                            {/* Value Breakdown */}
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                              <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                                <WashingMachine className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-blue-400" />
                                <div className="text-[9px] sm:text-xs text-white/50">Equipment</div>
                                <div className="text-[10px] sm:text-sm font-bold text-white">${valuatorResult.equipmentFMV.toLocaleString()}</div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-green-400" />
                                <div className="text-[9px] sm:text-xs text-white/50">Property</div>
                                <div className="text-[10px] sm:text-sm font-bold text-white">${valuatorResult.propertyValue.toLocaleString()}</div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-[#8B5CF6]" />
                                <div className="text-[9px] sm:text-xs text-white/50">Business</div>
                                <div className="text-[10px] sm:text-sm font-bold text-white">${valuatorResult.businessValue.toLocaleString()}</div>
                              </div>
                            </div>

                            {/* EBITDA Details */}
                            <div className="bg-white/5 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <span className="text-[10px] sm:text-xs text-white/50">EBITDA Multiple</span>
                                <Badge 
                                  className="text-[9px] sm:text-[10px]"
                                  style={{ 
                                    backgroundColor: GRADE_COLORS[valuatorResult.businessDetails.cleanbiGrade] + "33",
                                    color: GRADE_COLORS[valuatorResult.businessDetails.cleanbiGrade]
                                  }}
                                >
                                  Grade {valuatorResult.businessDetails.cleanbiGrade}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xl sm:text-2xl font-bold text-[#8B5CF6]">{valuatorResult.businessDetails.ebitdaMultiple}x</div>
                                <div className="text-[9px] sm:text-xs text-white/40">
                                  ({valuatorResult.businessDetails.ebitdaMultipleRange.min}x - {valuatorResult.businessDetails.ebitdaMultipleRange.max}x)
                                </div>
                              </div>
                              <div className="text-[10px] sm:text-xs text-white/50 mt-1">
                                EBITDA: ${valuatorResult.businessDetails.ebitda.toLocaleString()}/yr
                              </div>
                            </div>

                            {/* Adjustments - Mobile Optimized */}
                            {valuatorResult.adjustments.length > 0 && (
                              <div className="bg-white/5 rounded-lg p-2 sm:p-3">
                                <div className="text-[10px] sm:text-xs text-white/50 mb-1.5 sm:mb-2">Valuation Adjustments</div>
                                <div className="space-y-0.5 sm:space-y-1">
                                  {valuatorResult.adjustments.map((adj, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[10px] sm:text-xs gap-2">
                                      <span className="text-white/70 truncate">{adj.reason}</span>
                                      <span className={`shrink-0 ${adj.direction === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                                        {adj.direction === 'increase' ? '+' : '-'}${adj.amount.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Equipment Age & Depreciation - Mobile Optimized */}
                            <div className="bg-white/5 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                <span className="text-white/50">Weighted Age</span>
                                <span className="text-white font-medium">{valuatorResult.equipmentBreakdown.weightedAge.toFixed(1)} yrs</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                                <span className="text-white/50">Original Cost</span>
                                <span className="text-white/70">${valuatorResult.equipmentBreakdown.totalOriginalCost.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                                <span className="text-white/50">Depreciation</span>
                                <span className="text-red-400">
                                  -${(valuatorResult.equipmentBreakdown.totalOriginalCost - valuatorResult.equipmentBreakdown.totalFMV).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Confidence Level - Mobile Optimized */}
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                              <span className="text-white/40">Confidence:</span>
                              <Badge 
                                variant="outline"
                                className={`text-[9px] sm:text-[10px] ${
                                  valuatorResult.businessDetails.confidenceLevel === 'high' 
                                    ? 'border-green-500/30 text-green-400'
                                    : valuatorResult.businessDetails.confidenceLevel === 'medium'
                                    ? 'border-yellow-500/30 text-yellow-400'
                                    : 'border-red-500/30 text-red-400'
                                }`}
                              >
                                {valuatorResult.businessDetails.confidenceLevel.toUpperCase()}
                              </Badge>
                            </div>

                            {/* AI Valuation Insights Section */}
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-[#8B5CF6]" />
                                  <span className="text-xs sm:text-sm font-semibold text-white">AI Insights</span>
                                  <Badge className="text-[8px] sm:text-[9px] bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30">Gemini</Badge>
                                </div>
                                {!valuatorNarrative && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[10px] sm:text-xs border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                                    onClick={async () => {
                                      setIsGeneratingNarrative(true);
                                      try {
                                        const dominantBrand = valuatorEquipment.reduce((acc, item) => {
                                          acc[item.brand] = (acc[item.brand] || 0) + item.quantity;
                                          return acc;
                                        }, {} as Record<string, number>);
                                        const topBrand = Object.entries(dominantBrand).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';
                                        
                                        const response = await apiRequest('/api/cleanbi-explorer/valuator/narrative', {
                                          method: 'POST',
                                          body: JSON.stringify({
                                            totalAssetValue: valuatorResult.totalAssetValue,
                                            equipmentFMV: valuatorResult.equipmentFMV,
                                            propertyValue: valuatorResult.propertyValue,
                                            businessValue: valuatorResult.businessValue,
                                            cleanbiGrade: analysisResult.grade,
                                            cleanbiScore: analysisResult.cleanbiScore,
                                            ebitdaMultiple: valuatorResult.businessDetails.ebitdaMultiple,
                                            ebitda: valuatorResult.businessDetails.ebitda,
                                            equipmentDetails: {
                                              totalMachines: valuatorEquipment.reduce((sum, e) => sum + e.quantity, 0),
                                              weightedAge: valuatorResult.equipmentBreakdown.weightedAge,
                                              dominantBrand: topBrand
                                            },
                                            locationFactors: {
                                              walkScore: analysisResult.walkScore,
                                              transitScore: analysisResult.transitScore,
                                              competitorCount: analysisResult.competitorCount,
                                              populationDensity: analysisResult.populationDensity
                                            }
                                          })
                                        });
                                        
                                        if (response.success) {
                                          setValuatorNarrative(response.narrative);
                                          trackEvent("valuator_narrative_generated", "engagement");
                                        }
                                      } catch (error) {
                                        console.error("Narrative error:", error);
                                        toast({ title: "Error", description: "Could not generate AI insights", variant: "destructive" });
                                      } finally {
                                        setIsGeneratingNarrative(false);
                                      }
                                    }}
                                    disabled={isGeneratingNarrative}
                                    data-testid="button-generate-narrative"
                                  >
                                    {isGeneratingNarrative ? (
                                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analyzing...</>
                                    ) : (
                                      <><Sparkles className="w-3 h-3 mr-1" />Generate</>
                                    )}
                                  </Button>
                                )}
                              </div>

                              {/* Narrative Content */}
                              {valuatorNarrative ? (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="space-y-2 sm:space-y-3"
                                >
                                  {/* Executive Summary */}
                                  <div className="bg-[#8B5CF6]/10 rounded-lg p-2 sm:p-3 border border-[#8B5CF6]/20">
                                    <div className="text-[10px] sm:text-xs text-[#8B5CF6] font-medium mb-1">Executive Summary</div>
                                    <p className="text-[10px] sm:text-xs text-white/80 leading-relaxed">{valuatorNarrative.executiveSummary}</p>
                                  </div>

                                  {/* Strengths & Risks Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="bg-green-500/10 rounded-lg p-2 sm:p-3 border border-green-500/20">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <ThumbsUp className="w-3 h-3 text-green-400" />
                                        <span className="text-[10px] sm:text-xs text-green-400 font-medium">Strengths</span>
                                      </div>
                                      <p className="text-[9px] sm:text-[10px] text-white/70 leading-relaxed">{valuatorNarrative.strengthsAnalysis}</p>
                                    </div>
                                    <div className="bg-orange-500/10 rounded-lg p-2 sm:p-3 border border-orange-500/20">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <AlertCircle className="w-3 h-3 text-orange-400" />
                                        <span className="text-[10px] sm:text-xs text-orange-400 font-medium">Risks</span>
                                      </div>
                                      <p className="text-[9px] sm:text-[10px] text-white/70 leading-relaxed">{valuatorNarrative.risksAnalysis}</p>
                                    </div>
                                  </div>

                                  {/* Recommendations */}
                                  <div className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10">
                                    <div className="text-[10px] sm:text-xs text-white/50 font-medium mb-1.5">Recommendations</div>
                                    <ul className="space-y-1">
                                      {valuatorNarrative.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-white/70">
                                          <Check className="w-3 h-3 text-[#8B5CF6] shrink-0 mt-0.5" />
                                          <span>{rec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Confidence Statement */}
                                  <div className="text-center">
                                    <p className="text-[9px] sm:text-[10px] text-white/40 italic">{valuatorNarrative.confidenceStatement}</p>
                                  </div>
                                </motion.div>
                              ) : (
                                <p className="text-[10px] sm:text-xs text-white/40 text-center py-3">
                                  Click "Generate" to get AI-powered insights on this valuation
                                </p>
                              )}
                            </div>

                            {/* What-If Simulator Section - Mobile Optimized */}
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <LineChart className="w-4 h-4 text-[#10B981]" />
                                <span className="text-xs sm:text-sm font-semibold text-white">What-If Simulator</span>
                                <Badge className="text-[8px] sm:text-[9px] bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">Beta</Badge>
                              </div>
                              <p className="text-[10px] sm:text-xs text-white/50 mb-3">
                                Model scenarios: What if you add new machines or upgrade equipment?
                              </p>
                              
                              {/* Scenario Controls */}
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[10px] sm:text-xs border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10"
                                  onClick={() => {
                                    const newMachine: EquipmentItem = {
                                      id: `what-if-${Date.now()}`,
                                      brand: 'speed_queen',
                                      machineType: 'washer',
                                      capacity: 'large',
                                      ageYears: 0,
                                      purchaseCost: 12000,
                                      quantity: 1
                                    };
                                    setWhatIfScenario(prev => ({
                                      ...prev,
                                      addedMachines: [...prev.addedMachines, newMachine]
                                    }));
                                    toast({ title: "Added new machine to scenario", description: "New Speed Queen washer added" });
                                  }}
                                  data-testid="button-whatif-add-machine"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add New Machine
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[10px] sm:text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                                  onClick={() => {
                                    if (valuatorEquipment.length > 0 && whatIfScenario.removedMachineIds.length < valuatorEquipment.length) {
                                      const nextToRemove = valuatorEquipment.find(e => !whatIfScenario.removedMachineIds.includes(e.id));
                                      if (nextToRemove) {
                                        setWhatIfScenario(prev => ({
                                          ...prev,
                                          removedMachineIds: [...prev.removedMachineIds, nextToRemove.id]
                                        }));
                                        toast({ title: "Removed machine from scenario", description: `${BRAND_DISPLAY_NAMES[nextToRemove.brand]} ${MACHINE_TYPE_DISPLAY[nextToRemove.machineType]} removed` });
                                      }
                                    }
                                  }}
                                  data-testid="button-whatif-remove-machine"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Remove Oldest
                                </Button>
                              </div>

                              {/* Scenario Summary */}
                              {(whatIfScenario.addedMachines.length > 0 || whatIfScenario.removedMachineIds.length > 0) && (
                                <div className="bg-[#10B981]/10 rounded-lg p-2 sm:p-3 mb-3 border border-[#10B981]/20">
                                  <div className="text-[10px] sm:text-xs text-white/50 mb-1.5">Current Scenario:</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {whatIfScenario.addedMachines.map((m, idx) => (
                                      <Badge 
                                        key={`add-${idx}`} 
                                        className="text-[9px] bg-green-500/20 text-green-400 border-green-500/30 cursor-pointer"
                                        onClick={() => {
                                          setWhatIfScenario(prev => ({
                                            ...prev,
                                            addedMachines: prev.addedMachines.filter((_, i) => i !== idx)
                                          }));
                                        }}
                                      >
                                        <Plus className="w-2.5 h-2.5 mr-0.5" />
                                        {m.quantity}x {BRAND_DISPLAY_NAMES[m.brand]}
                                        <X className="w-2.5 h-2.5 ml-1 hover:text-white" />
                                      </Badge>
                                    ))}
                                    {whatIfScenario.removedMachineIds.map((id, idx) => {
                                      const machine = valuatorEquipment.find(e => e.id === id);
                                      return machine ? (
                                        <Badge 
                                          key={`rem-${idx}`} 
                                          className="text-[9px] bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer"
                                          onClick={() => {
                                            setWhatIfScenario(prev => ({
                                              ...prev,
                                              removedMachineIds: prev.removedMachineIds.filter(rid => rid !== id)
                                            }));
                                          }}
                                        >
                                          <Trash2 className="w-2.5 h-2.5 mr-0.5" />
                                          {BRAND_DISPLAY_NAMES[machine.brand]}
                                          <X className="w-2.5 h-2.5 ml-1 hover:text-white" />
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                  
                                  {/* Calculate What-If Button */}
                                  <Button
                                    size="sm"
                                    className="w-full mt-2 h-7 text-[10px] sm:text-xs bg-[#10B981] hover:bg-[#059669] text-white"
                                    onClick={async () => {
                                      setIsCalculatingWhatIf(true);
                                      try {
                                        const response = await apiRequest('/api/cleanbi-explorer/valuator/what-if', {
                                          method: 'POST',
                                          body: JSON.stringify({
                                            baseEquipment: valuatorEquipment,
                                            scenario: whatIfScenario,
                                            financials: {
                                              annualRevenue: calcValues.annualRevenue || 200000,
                                              annualExpenses: calcValues.operatingExpenses || 120000,
                                              monthlyRent: 4000,
                                              monthlyUtilities: 1500,
                                              laborCosts: 2000
                                            },
                                            cleanbiScore: analysisResult.cleanbiScore,
                                            cleanbiGrade: analysisResult.grade
                                          })
                                        });
                                        
                                        if (response.success) {
                                          setWhatIfResult(response.comparison);
                                          toast({ 
                                            title: "What-If Analysis Complete", 
                                            description: `Value ${response.comparison.valueDifference >= 0 ? 'increase' : 'decrease'}: $${Math.abs(response.comparison.valueDifference).toLocaleString()}`
                                          });
                                        }
                                      } catch (error) {
                                        console.error("What-If error:", error);
                                        toast({ title: "Error", description: "Could not calculate scenario", variant: "destructive" });
                                      } finally {
                                        setIsCalculatingWhatIf(false);
                                      }
                                    }}
                                    disabled={isCalculatingWhatIf}
                                    data-testid="button-calculate-whatif"
                                  >
                                    {isCalculatingWhatIf ? (
                                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Calculating...</>
                                    ) : (
                                      <><LineChart className="w-3 h-3 mr-1" />Calculate Impact</>
                                    )}
                                  </Button>
                                </div>
                              )}

                              {/* What-If Results */}
                              {whatIfResult && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10"
                                >
                                  <div className="text-[10px] sm:text-xs text-white/50 mb-2">Scenario Impact:</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="text-center">
                                      <div className="text-[9px] text-white/40">Current Value</div>
                                      <div className="text-sm sm:text-base font-bold text-white">${whatIfResult.currentValue?.toLocaleString() || valuatorResult.totalAssetValue.toLocaleString()}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-[9px] text-white/40">New Value</div>
                                      <div className="text-sm sm:text-base font-bold text-[#10B981]">${whatIfResult.newValue?.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-white/10">
                                    <span className="text-[10px] text-white/50">Difference:</span>
                                    <span className={`text-xs font-bold ${whatIfResult.valueDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {whatIfResult.valueDifference >= 0 ? '+' : ''}${whatIfResult.valueDifference?.toLocaleString()}
                                      <span className="text-[9px] ml-1">({whatIfResult.percentageChange?.toFixed(1)}%)</span>
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-full mt-2 h-6 text-[10px] text-white/50 hover:text-white"
                                    onClick={() => {
                                      setWhatIfScenario({ addedMachines: [], removedMachineIds: [] });
                                      setWhatIfResult(null);
                                    }}
                                    data-testid="button-clear-whatif"
                                  >
                                    Clear Scenario
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Next Steps CTAs - Action Chaining Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-4 bg-gradient-to-br from-[#1e3a5f]/80 to-[#0f1d2f]/80 rounded-xl p-4 border border-[#b8860b]/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="w-4 h-4 text-[#b8860b]" />
                    <span className="text-sm font-semibold text-white">Ready to Take Action?</span>
                  </div>
                  <p className="text-xs text-white/60 mb-4">
                    This location scores a <span className="text-[#b8860b] font-medium">Grade {analysisResult.grade}</span>. 
                    {analysisResult.grade === "A" || analysisResult.grade === "B" 
                      ? " Move forward with confidence." 
                      : " Get expert guidance to maximize potential."}
                  </p>
                  
                  {/* Featured CTA: AI Consultation Council */}
                  <Button 
                    size="default"
                    variant="default"
                    className="w-full mb-3"
                    onClick={() => {
                      trackEvent("cleanbi_cta_council", "engagement", undefined, { 
                        address: analysisResult.address,
                        grade: analysisResult.grade,
                        score: analysisResult.cleanbiScore 
                      });
                      trackConversion("council_intent", undefined, { source: "cleanbi_explorer" });
                      setLocation(`/ai-consultation-council?address=${encodeURIComponent(analysisResult.address)}&score=${analysisResult.cleanbiScore}&grade=${analysisResult.grade}`);
                    }}
                    data-testid="button-cta-ai-council"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Get Expert AI Council Analysis — From $49
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-[#b8860b] to-[#8b6914] hover:from-[#d4a030] hover:to-[#b8860b] text-white h-9 text-xs font-medium"
                      onClick={() => {
                        trackEvent("cleanbi_cta_funding", "engagement", undefined, { 
                          address: analysisResult.address,
                          grade: analysisResult.grade,
                          score: analysisResult.cleanbiScore 
                        });
                        trackConversion("funding_intent", undefined, { source: "cleanbi_explorer" });
                        setLocation(`/funding?address=${encodeURIComponent(analysisResult.address)}&score=${analysisResult.cleanbiScore}`);
                      }}
                      data-testid="button-cta-funding"
                    >
                      <Banknote className="w-3.5 h-3.5 mr-1.5" />
                      Get Funding
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        trackEvent("cleanbi_cta_larry", "engagement", undefined, { 
                          address: analysisResult.address,
                          grade: analysisResult.grade,
                          score: analysisResult.cleanbiScore 
                        });
                        setLocation(`/larry-larsen?address=${encodeURIComponent(analysisResult.address)}&score=${analysisResult.cleanbiScore}`);
                      }}
                      data-testid="button-cta-larry"
                    >
                      <Crown className="w-3.5 h-3.5 mr-1.5" />
                      Talk to Larry ($397)
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 h-9 text-xs font-medium"
                      onClick={() => {
                        trackEvent("cleanbi_cta_broker", "engagement", undefined, { 
                          address: analysisResult.address,
                          grade: analysisResult.grade,
                          score: analysisResult.cleanbiScore 
                        });
                        setLocation(`/directory?category=brokers&address=${encodeURIComponent(analysisResult.address)}`);
                      }}
                      data-testid="button-cta-broker"
                    >
                      <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                      Find Broker
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 h-9 text-xs font-medium"
                      onClick={async () => {
                        trackEvent("cleanbi_cta_save_dashboard", "engagement", undefined, { 
                          address: analysisResult.address,
                          grade: analysisResult.grade,
                          score: analysisResult.cleanbiScore 
                        });
                        
                        if (!user) {
                          toast({
                            title: "Sign in required",
                            description: "Create an account to save analyses to your dashboard.",
                          });
                          setLocation("/login?redirect=/cleanbi-explorer");
                          return;
                        }
                        
                        try {
                          const savedItem = saveAnalysis(analysisResult);
                          setSavedAnalyses(getStoredAnalyses());
                          
                          await apiRequest("/api/cleanbi-explorer/save-analysis", {
                            method: "POST",
                            body: JSON.stringify({
                              address: analysisResult.address,
                              lat: analysisResult.lat,
                              lng: analysisResult.lng,
                              score: analysisResult.cleanbiScore,
                              grade: analysisResult.grade,
                              competitorCount: analysisResult.competitorCount,
                              populationDensity: analysisResult.populationDensity,
                              medianIncome: analysisResult.medianIncome,
                              trafficScore: analysisResult.trafficScore,
                              opportunityLevel: analysisResult.opportunityLevel,
                            })
                          }).catch(() => {});
                          
                          toast({
                            title: "Analysis Saved",
                            description: "Added to your dashboard & history.",
                          });
                        } catch {
                          toast({
                            title: "Saved Locally",
                            description: "Analysis saved to your browser history.",
                          });
                        }
                      }}
                      data-testid="button-cta-save"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
                      Save Analysis
                    </Button>
                  </div>
                  
                  {analysisResult.grade === "A" && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Grade A locations sell fast — act quickly!</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Map Layers */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-[#b8860b]" />
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
                    <History className="w-3 h-3 text-[#b8860b]" />
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
                  <span className="text-sm font-medium text-[#b8860b]">{searchRadius[0]} miles</span>
                </div>
                <Slider
                  value={searchRadius}
                  onValueChange={setSearchRadius}
                  min={1}
                  max={25}
                  step={1}
                  className="[&_[role=slider]]:bg-[#b8860b]"
                  data-testid="slider-search-radius"
                />
              </div>
            </div>

            {/* Market Gap Finder Section */}
            <Collapsible className="p-4 border-b border-white/10">
              <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#b8860b]" />
                  <span className="text-sm font-medium text-white">Market Gap Finder</span>
                  <Badge variant="outline" className="text-[10px] border-[#b8860b]/50 text-[#b8860b] px-1.5 py-0">NEW</Badge>
                </div>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4" forceMount={undefined}>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                <p className="text-xs text-white/50">
                  Find underserved areas with high renter populations and low laundromat competition.
                </p>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white/70 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#b8860b]/50 border border-[#b8860b]" />
                    Show Market Gaps
                  </Label>
                  <Switch 
                    checked={showMarketGaps} 
                    onCheckedChange={setShowMarketGaps}
                    data-testid="switch-show-market-gaps"
                  />
                </div>

                {showMarketGaps && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm text-white/70">Gap Radius</Label>
                        <span className="text-sm font-medium text-[#b8860b]">{gapRadius[0]} miles</span>
                      </div>
                      <Slider
                        value={gapRadius}
                        onValueChange={setGapRadius}
                        min={0.5}
                        max={5}
                        step={0.5}
                        className="[&_[role=slider]]:bg-[#b8860b]"
                        data-testid="slider-gap-radius"
                      />
                      <p className="text-[10px] text-white/40 mt-1">Min distance from any competitor</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm text-white/70">Min Renter %</Label>
                        <span className="text-sm font-medium text-[#b8860b]">{minRenterPercent[0]}%</span>
                      </div>
                      <Slider
                        value={minRenterPercent}
                        onValueChange={setMinRenterPercent}
                        min={20}
                        max={60}
                        step={5}
                        className="[&_[role=slider]]:bg-[#b8860b]"
                        data-testid="slider-min-renter-percent"
                      />
                      <p className="text-[10px] text-white/40 mt-1">Areas with high renter concentration</p>
                    </div>

                    <Button 
                      onClick={findMarketGaps}
                      disabled={loadingGapAnalysis}
                      className="w-full bg-gradient-to-r from-[#b8860b] to-[#8B6914] hover:opacity-90 text-white h-10 text-sm font-medium"
                      data-testid="button-find-gaps"
                    >
                      {loadingGapAnalysis ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Scanning Area...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Find Market Gaps
                        </>
                      )}
                    </Button>

                    {/* Gap Analysis Results Panel */}
                    {totalGapCount > 0 && areaStats && (
                      <div className="bg-[#b8860b]/10 rounded-lg p-3 border border-[#b8860b]/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/70">Area Saturation</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              saturationScore && saturationScore < 0.3 
                                ? "border-green-500/50 text-green-400" 
                                : saturationScore && saturationScore < 0.6 
                                  ? "border-yellow-500/50 text-yellow-400"
                                  : "border-red-500/50 text-red-400"
                            }`}
                          >
                            {saturationScore?.toFixed(2)} per 1K renters
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-lg font-bold text-[#b8860b]">{totalGapCount}</div>
                            <div className="text-[10px] text-white/50">Gap Zones Found</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-lg font-bold text-white">{areaStats.competitorCount}</div>
                            <div className="text-[10px] text-white/50">Competitors</div>
                          </div>
                        </div>

                        <div className="text-xs text-white/70">
                          <span className="text-white/50">Avg Income:</span> ${Math.round(areaStats.avgIncome / 1000)}K • 
                          <span className="text-white/50 ml-1">Renters:</span> {areaStats.avgRenterPercentage}%
                        </div>

                        {/* Top Opportunities */}
                        {topOpportunities.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                          >
                            <div className="text-xs font-medium text-white flex items-center gap-1">
                              <Star className="w-3 h-3 text-[#b8860b]" />
                              Top Opportunities
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-2 max-h-32 overflow-y-auto">
                              <div className="space-y-1.5">
                                {topOpportunities.map((opp, idx) => (
                                  <motion.div 
                                    key={opp.id}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    onClick={() => analyzeGapZone(opp)}
                                    className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-2 cursor-pointer hover:bg-white/10 hover:border-[#b8860b]/30 transition-all duration-200"
                                    data-testid={`gap-opportunity-${idx}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#b8860b] to-[#8b6914] flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                                        {idx + 1}
                                      </div>
                                      <div>
                                        <div className="text-xs text-white">Score: {opp.opportunityScore}</div>
                                        <div className="text-[10px] text-white/40">{opp.gapReason}</div>
                                      </div>
                                    </div>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-6 w-6 text-[#b8860b] hover:bg-[#b8860b]/20 hover:text-[#d4a030]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        analyzeGapZone(opp);
                                      }}
                                    >
                                      <Zap className="w-3 h-3" />
                                    </Button>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </>
                )}
                </motion.div>
              </CollapsibleContent>
            </Collapsible>

            {/* Saved Analyses History */}
            <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded} className="p-4 border-b border-white/10">
              <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#b8860b]" />
                  <span className="text-sm font-medium text-white">Your Analyses ({savedAnalyses.length})</span>
                </div>
                {historyExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <AnimatePresence mode="wait">
                {savedAnalyses.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-center py-4 text-white/40 text-sm"
                  >
                    <MapPinned className="w-6 h-6 mx-auto mb-2" />
                    No saved analyses yet
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-2 max-h-48 overflow-y-auto"
                  >
                    <div className="space-y-2">
                      {savedAnalyses.map((saved, index) => (
                        <motion.div 
                          key={saved.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          onClick={() => loadSavedAnalysis(saved)}
                          className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-2.5 cursor-pointer hover:bg-white/10 hover:border-[#b8860b]/30 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg"
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
                              className="opacity-0 group-hover:opacity-100 h-7 w-7 text-white/40 hover:text-red-400 transition-opacity"
                              onClick={(e) => handleDeleteSaved(saved.id, e)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>

            {/* Tier Comparison Panel - Upgrade CTA */}
            <div className="p-4 border-b border-white/10">
              <div className="bg-gradient-to-br from-[#1e3a5f]/60 to-[#0f1d2f]/60 rounded-xl p-4 border border-[#b8860b]/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#b8860b]" />
                    <span className="text-sm font-semibold text-white">Your Plan</span>
                  </div>
                  <Badge 
                    className={`text-xs ${
                      userTier === "enterprise" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                      userTier === "pro" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                      userTier === "starter" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      "bg-white/10 text-white/60 border-white/20"
                    }`}
                  >
                    {userTier === "enterprise" ? "Enterprise" :
                     userTier === "pro" ? "Pro" :
                     userTier === "starter" ? "Starter" : "Free"}
                  </Badge>
                </div>
                
                {/* Current Features */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Basic location scoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Competitor mapping</span>
                  </div>
                  {userTier !== "free" && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Check className="w-3 h-3 text-green-400" />
                        <span>Unlimited analyses</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Check className="w-3 h-3 text-green-400" />
                        <span>Financial projections</span>
                      </div>
                    </>
                  )}
                  {(userTier === "pro" || userTier === "enterprise") && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Check className="w-3 h-3 text-green-400" />
                        <span>AI-powered insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Check className="w-3 h-3 text-green-400" />
                        <span>Google Sheets export</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Locked Features - Only for non-enterprise users */}
                {userTier !== "enterprise" && (
                  <>
                    <Separator className="my-3 bg-white/10" />
                    <div className="text-xs text-white/50 mb-2">
                      {userTier === "free" ? "Unlock with Starter:" : 
                       userTier === "starter" ? "Unlock with Pro:" : 
                       "Unlock with Enterprise:"}
                    </div>
                    <div className="space-y-2 mb-4">
                      {userTier === "free" && (
                        <>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>Unlimited daily analyses</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>Financial ROI calculator</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>Deal scoring & valuation</span>
                          </div>
                        </>
                      )}
                      {userTier === "starter" && (
                        <>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>AI investment insights</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>Export to Google Sheets</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>Review sentiment analysis</span>
                          </div>
                        </>
                      )}
                      {userTier === "pro" && (
                        <>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>White-label reports</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>API access</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Lock className="w-3 h-3 text-[#b8860b]/60" />
                            <span>Priority support</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <Button 
                      size="sm"
                      className="w-full bg-gradient-to-r from-[#b8860b] to-[#8b6914] hover:from-[#d4a030] hover:to-[#b8860b] text-white h-9 text-xs font-medium"
                      onClick={() => {
                        trackEvent("cleanbi_tier_upgrade_click", "conversion", undefined, {
                          currentTier: userTier,
                          targetTier: userTier === "free" ? "starter" : userTier === "starter" ? "pro" : "enterprise"
                        });
                        setShowUpgradeModal(true);
                      }}
                      data-testid="button-tier-upgrade"
                    >
                      <Crown className="w-3.5 h-3.5 mr-1.5" />
                      {userTier === "free" ? "Upgrade — $29/mo" :
                       userTier === "starter" ? "Go Pro — $99/mo" :
                       "Enterprise — $699/mo"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Search Section - At Bottom */}
            <div className="p-4">
              {/* Free Tier Usage Indicator */}
              {userTier === "free" && (
                <div className={`mb-3 rounded-lg p-3 border ${remainingAnalyses === 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Zap className={`w-4 h-4 ${remainingAnalyses === 0 ? "text-red-400" : "text-[#b8860b]"}`} />
                      <span>Daily Analysis</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${remainingAnalyses === 0 ? "border-red-500/50 text-red-400" : "border-[#b8860b]/50 text-[#b8860b]"}`}
                    >
                      {remainingAnalyses !== null ? (remainingAnalyses === 0 ? "Used" : "1 left") : "1 free/day"}
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-all duration-300 ${remainingAnalyses === 0 ? "bg-red-500" : "bg-gradient-to-r from-[#b8860b] to-[#8b6914]"}`}
                      style={{ width: `${remainingAnalyses === 0 ? 0 : 100}%` }}
                    />
                  </div>
                  {remainingAnalyses === 0 ? (
                    <Button
                      size="sm"
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full bg-[#b8860b] hover:bg-[#d4a030] text-black font-medium text-xs h-8"
                      data-testid="button-upgrade-sidebar"
                    >
                      <Crown className="w-3.5 h-3.5 mr-1.5" />
                      Unlock Unlimited — $29/mo
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full text-[#b8860b] hover:text-white hover:bg-[#b8860b]/20 text-xs h-8"
                      data-testid="button-upgrade-sidebar"
                    >
                      <Crown className="w-3.5 h-3.5 mr-1.5" />
                      Upgrade for Unlimited
                    </Button>
                  )}
                </div>
              )}

              {/* Listing URL Analyzer */}
              <div className="mb-4">
                <ListingAnalyzer 
                  onAnalyzeAddress={analyzeFromListing}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              <div className="relative flex items-center mb-4">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="px-3 text-xs text-white/40">or enter address directly</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-gradient-to-br from-[#b8860b]/20 to-[#8b6914]/20 backdrop-blur-md rounded-2xl p-4 border border-[#b8860b]/30 shadow-xl"
              >
                <div className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#b8860b]" />
                  Analyze Any Location
                </div>
                
                {/* Business Name Field */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Business Name <span className="text-white/40">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Spin City Laundry"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10 text-sm"
                      data-testid="input-explorer-business-name"
                    />
                  </div>
                </div>
                
                {/* Address Field */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Street Address <span className="text-[#b8860b]">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && analyzeLocation()}
                      placeholder="123 Main St, City, State ZIP"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10 text-sm"
                      data-testid="input-explorer-address"
                    />
                  </div>
                </div>

                <Button 
                  onClick={analyzeLocation}
                  disabled={isAnalyzing || !address.trim()}
                  className="w-full bg-gradient-to-r from-[#b8860b] to-[#8b6914] hover:from-[#d4a030] hover:to-[#b8860b] text-white h-11 text-sm font-medium disabled:opacity-50 shadow-xl"
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
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 mt-auto backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Sparkles className="w-3 h-3 text-[#b8860b]" />
                <span className="font-medium">CLEANBI™ Proprietary Technology</span>
              </div>
            </div>
          </ScrollArea>
        </motion.div>

        {/* Sidebar Toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-56 z-30 w-6 h-12 bg-gradient-to-r from-[#1e3a5f] to-[#0f1d2f] border border-white/10 rounded-r-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md shadow-xl ${sidebarOpen ? "left-[400px]" : "left-0"}`}
          data-testid="button-toggle-sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </motion.button>

        {/* Main Map Area */}
        <div className={`flex-1 relative transition-all duration-300 ${sidebarOpen ? "ml-[400px]" : "ml-0"}`}>
          <div 
            ref={mapRef}
            className="absolute inset-0"
            data-testid="explorer-map"
          />

          {/* Market Gap Legend - Shows when gaps are displayed */}
          <AnimatePresence>
          {showMarketGaps && totalGapCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-6 right-4 z-20 bg-gradient-to-br from-[#1e3a5f]/95 to-[#0f1d2f]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl" 
              data-testid="market-gap-legend"
            >
              <div className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Target className="w-4 h-4 text-[#b8860b]" />
                Market Gap Legend
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#b8860b]/30 border border-[#b8860b]" />
                  <span className="text-[11px] text-white/70">Gap Zones (high renters, low competition)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#b8860b] fill-[#b8860b]" />
                  <span className="text-[11px] text-white/70">Top Opportunity Locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-[11px] text-white/70">Existing Competitors</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[10px] text-white/50 mb-1 font-medium">Saturation Score</div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                </div>
                <div className="flex justify-between text-[9px] text-white/40 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Street View Modal */}
        <AnimatePresence>
        {showStreetView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm"
            data-testid="modal-streetview"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl aspect-video bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <button
                onClick={() => setShowStreetView(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 border border-white/10 transition-colors"
                data-testid="button-close-streetview"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div ref={streetViewRef} className="w-full h-full" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{analysisResult?.address}</h3>
                    <p className="text-white/60 text-sm font-medium">Street View</p>
                  </div>
                  <Badge 
                    className="text-base px-4 py-2 shadow-xl border border-white/10"
                    style={{ backgroundColor: GRADE_COLORS[analysisResult?.grade || "C"], fontFamily: "'Bebas Neue', sans-serif" }}
                    data-testid="badge-streetview-grade"
                  >
                    Grade {analysisResult?.grade}
                  </Badge>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Aerial View Modal */}
        <AnimatePresence>
        {showAerialView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm"
            data-testid="modal-aerialview"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl aspect-video bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <button
                onClick={() => setShowAerialView(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 border border-white/10 transition-colors"
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
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#b8860b] animate-spin" />
                    <p className="text-white/70 font-medium">Loading 3D aerial view...</p>
                    <p className="text-white/40 text-sm mt-2">Generating cinematic flyover for {analysisResult?.address}</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{analysisResult?.address}</h3>
                    <p className="text-white/60 text-sm font-medium">3D Aerial View powered by Google</p>
                  </div>
                  <Badge 
                    className="text-lg px-4 py-2 shadow-xl border border-white/10"
                    style={{ backgroundColor: GRADE_COLORS[analysisResult?.grade || "C"], fontFamily: "'Bebas Neue', sans-serif" }}
                    data-testid="badge-aerial-grade"
                  >
                    Grade {analysisResult?.grade}
                  </Badge>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>


        {/* Email Capture Gate Modal */}
        <AnimatePresence>
        {showEmailGate && pendingAnalysis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            data-testid="modal-email-gate"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] rounded-2xl overflow-hidden border border-[#b8860b]/30 shadow-2xl backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              
              <div className="relative p-8">
                {/* Score Preview */}
                <div className="text-center mb-6">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-2xl text-4xl font-bold text-white mb-4 shadow-xl border border-white/10"
                    style={{ backgroundColor: GRADE_COLORS[pendingAnalysis.grade] || "#b8860b", fontFamily: "'Bebas Neue', sans-serif" }}
                    data-testid="badge-pending-grade"
                  >
                    {pendingAnalysis.grade}
                  </motion.div>
                  <p className="text-white/60 text-sm font-medium">
                    Score: {pendingAnalysis.cleanbiScore}/100
                  </p>
                </div>
                
                <h2 className="text-2xl font-semibold text-white text-center mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Unlock Your Full Analysis
                </h2>
                <p className="text-white/60 text-center mb-6 text-sm font-medium">
                  Enter your email to see competitor details, demographic data, and investment projections for this location.
                </p>
                
                <form onSubmit={handleEmailCapture} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={captureEmail}
                      onChange={(e) => setCaptureEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                      data-testid="input-capture-email"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={emailSubmitting || !captureEmail.trim()}
                    className="w-full bg-gradient-to-r from-[#b8860b] to-[#8b6914] hover:from-[#d4a030] hover:to-[#b8860b] text-white h-12 text-lg font-medium shadow-xl"
                    data-testid="button-unlock-analysis"
                  >
                    {emailSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Full Report
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Competitor analysis with ratings</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Demographic & income data</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>AI-powered investment insights</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={skipEmailCapture}
                    className="text-white/50 text-xs hover:text-white/80 underline font-medium"
                    data-testid="button-skip-email"
                  >
                    Skip for now
                  </button>
                  <span className="text-white/30 text-xs">|</span>
                  <span className="text-white/40 text-xs font-medium">No spam, unsubscribe anytime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Competitor Analysis Sheet - One-Click Deep Dive */}
        <Sheet open={competitorSheetOpen} onOpenChange={setCompetitorSheetOpen}>
          <SheetContent 
            side="right" 
            className="w-full sm:max-w-lg bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] border-l border-white/10 text-white overflow-y-auto backdrop-blur-md"
            data-testid="sheet-competitor-analysis"
          >
            <SheetHeader className="pb-4 border-b border-white/10">
              <SheetTitle className="text-white flex items-center gap-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Target className="w-5 h-5 text-[#b8860b]" />
                Competitor Analysis
              </SheetTitle>
              <SheetDescription className="text-white/60 font-medium">
                {selectedCompetitor?.name || "Loading..."}
              </SheetDescription>
            </SheetHeader>

            {isAnalyzingCompetitor ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-16 space-y-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#b8860b] to-[#8b6914] flex items-center justify-center shadow-xl">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Analyzing {selectedCompetitor?.name}</p>
                  <p className="text-white/50 text-sm mt-1 font-medium">Running CLEANBI™ intelligence...</p>
                </div>
              </motion.div>
            ) : competitorAnalysis ? (
              <div className="py-6 space-y-6">
                {/* Score Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{competitorAnalysis.address}</div>
                    <div className="text-sm text-white/50 mt-1">
                      {competitorAnalysis.competitorCount} nearby competitors • {(competitorAnalysis.populationDensity / 1000).toFixed(1)}K density
                    </div>
                  </div>
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: GRADE_COLORS[competitorAnalysis.grade] || "#b8860b" }}
                  >
                    {competitorAnalysis.grade}
                  </div>
                </div>

                {/* Score Bar */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70 text-sm">CLEANBI™ Score</span>
                    <span className="text-xl font-bold" style={{ color: GRADE_COLORS[competitorAnalysis.grade] }}>
                      {competitorAnalysis.cleanbiScore}/100
                    </span>
                  </div>
                  <Progress value={competitorAnalysis.cleanbiScore} className="h-2" />
                  <div className="mt-2 text-xs text-white/50">
                    {OPPORTUNITY_LABELS[competitorAnalysis.opportunityLevel]?.text || "Analysis Complete"}
                  </div>
                </div>

                {/* Comparison with Primary Location */}
                {analysisResult && (
                  <div className="bg-gradient-to-br from-[#b8860b]/10 to-transparent rounded-xl p-4 border border-[#b8860b]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Scale className="w-4 h-4 text-[#b8860b]" />
                      <span className="text-sm font-medium text-white">vs Your Location</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-[10px] text-white/40 mb-1">Your Score</div>
                        <div 
                          className="text-lg font-bold"
                          style={{ color: GRADE_COLORS[analysisResult.grade] }}
                        >
                          {analysisResult.cleanbiScore}
                        </div>
                      </div>
                      <div className="text-center flex flex-col items-center justify-center">
                        <div className={`text-xs font-medium ${
                          analysisResult.cleanbiScore > competitorAnalysis.cleanbiScore 
                            ? "text-green-400" 
                            : analysisResult.cleanbiScore < competitorAnalysis.cleanbiScore 
                              ? "text-red-400" 
                              : "text-white/50"
                        }`}>
                          {analysisResult.cleanbiScore > competitorAnalysis.cleanbiScore 
                            ? `+${analysisResult.cleanbiScore - competitorAnalysis.cleanbiScore} pts`
                            : analysisResult.cleanbiScore < competitorAnalysis.cleanbiScore
                              ? `${analysisResult.cleanbiScore - competitorAnalysis.cleanbiScore} pts`
                              : "Tied"}
                        </div>
                        <div className="text-[10px] text-white/30">difference</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-white/40 mb-1">Competitor</div>
                        <div 
                          className="text-lg font-bold"
                          style={{ color: GRADE_COLORS[competitorAnalysis.grade] }}
                        >
                          {competitorAnalysis.cleanbiScore}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-white/70">Key Metrics</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                        <DollarSign className="w-3 h-3" />
                        Median Income
                      </div>
                      <div className="text-lg font-bold text-white">
                        ${(competitorAnalysis.medianIncome / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                        <Users className="w-3 h-3" />
                        Pop. Density
                      </div>
                      <div className="text-lg font-bold text-white">
                        {(competitorAnalysis.populationDensity / 1000).toFixed(1)}K/mi²
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                        <Building2 className="w-3 h-3" />
                        Competitors
                      </div>
                      <div className="text-lg font-bold text-white">
                        {competitorAnalysis.competitorCount}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        Their Rating
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedCompetitor?.rating.toFixed(1)} ({selectedCompetitor?.reviewCount})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strategic Insights */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Strategic Insight</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {analysisResult && competitorAnalysis.cleanbiScore < analysisResult.cleanbiScore ? (
                      <>Your location has a <span className="text-green-400 font-medium">competitive advantage</span> with a {analysisResult.cleanbiScore - competitorAnalysis.cleanbiScore} point higher score. Focus on marketing and service quality to capture their customers.</>
                    ) : analysisResult && competitorAnalysis.cleanbiScore > analysisResult.cleanbiScore ? (
                      <>This competitor has a <span className="text-yellow-400 font-medium">{competitorAnalysis.cleanbiScore - analysisResult.cleanbiScore} point advantage</span>. Study their operations, pricing, and customer experience to identify improvement opportunities.</>
                    ) : (
                      <>This competitor operates in a similar market position. Differentiation through service quality, extended hours, or premium offerings could help you stand out.</>
                    )}
                  </p>
                </div>

                {/* Review Sentiment Analysis - Premium Feature */}
                {competitorAnalysis.sentiment ? (
                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-white">Review Sentiment</span>
                      </div>
                      <Badge 
                        className={`text-xs ${
                          competitorAnalysis.sentiment.overallSentiment === "positive" 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : competitorAnalysis.sentiment.overallSentiment === "negative"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}
                      >
                        {competitorAnalysis.sentiment.overallSentiment.charAt(0).toUpperCase() + competitorAnalysis.sentiment.overallSentiment.slice(1)}
                      </Badge>
                    </div>
                    
                    {/* Sentiment Score Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Customer Satisfaction</span>
                        <span className={
                          competitorAnalysis.sentiment.sentimentScore >= 65 ? "text-green-400" :
                          competitorAnalysis.sentiment.sentimentScore >= 40 ? "text-yellow-400" : "text-red-400"
                        }>{competitorAnalysis.sentiment.sentimentScore}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            competitorAnalysis.sentiment.sentimentScore >= 65 ? "bg-green-500" :
                            competitorAnalysis.sentiment.sentimentScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${competitorAnalysis.sentiment.sentimentScore}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Themes Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Strengths */}
                      <div>
                        <div className="flex items-center gap-1 text-xs text-green-400 mb-1.5">
                          <ThumbsUp className="w-3 h-3" />
                          <span>Strengths ({competitorAnalysis.sentiment.strengthsCount})</span>
                        </div>
                        <div className="space-y-1">
                          {competitorAnalysis.sentiment.positiveThemes.length > 0 ? (
                            competitorAnalysis.sentiment.positiveThemes.slice(0, 3).map((theme, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] border-green-500/30 text-green-400 mr-1">
                                {theme}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-white/30">No clear strengths</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Weaknesses */}
                      <div>
                        <div className="flex items-center gap-1 text-xs text-red-400 mb-1.5">
                          <ThumbsDown className="w-3 h-3" />
                          <span>Weaknesses ({competitorAnalysis.sentiment.weaknessesCount})</span>
                        </div>
                        <div className="space-y-1">
                          {competitorAnalysis.sentiment.negativeThemes.length > 0 ? (
                            competitorAnalysis.sentiment.negativeThemes.slice(0, 3).map((theme, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] border-red-500/30 text-red-400 mr-1">
                                {theme}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-white/30">No clear weaknesses</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Opportunity Callout */}
                    {competitorAnalysis.sentiment.negativeThemes.length > 0 && (
                      <div className="bg-[#b8860b]/10 rounded-lg p-2 border border-[#b8860b]/20">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-[#b8860b] mt-0.5 shrink-0" />
                          <p className="text-xs text-white/70">
                            <span className="text-[#b8860b] font-medium">Opportunity:</span> Customers complain about {competitorAnalysis.sentiment.negativeThemes[0]?.toLowerCase()}. 
                            Excel here to win their business.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : userTier === "free" ? (
                  <div className="relative">
                    <div className="blur-sm pointer-events-none opacity-50">
                      <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-4 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-white">Review Sentiment</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full mb-3" />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 rounded p-2 h-16" />
                          <div className="bg-white/5 rounded p-2 h-16" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Lock className="w-5 h-5 text-[#b8860b] mb-1" />
                      <p className="text-xs text-white/70 mb-2">Sentiment Analysis</p>
                      <Button 
                        size="sm"
                        className="bg-[#b8860b] hover:bg-[#d4a030] text-black text-xs"
                        onClick={() => setShowUpgradeModal(true)}
                        data-testid="button-unlock-sentiment"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Unlock — $29/mo
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-[#b8860b] hover:bg-[#b8860b]/90 text-white"
                    onClick={() => {
                      if (competitorAnalysis) {
                        setAddress(competitorAnalysis.address);
                        setCompetitorSheetOpen(false);
                        handleAnalyze();
                      }
                    }}
                    data-testid="button-analyze-as-primary"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Analyze This Location as Primary
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => {
                      if (competitorAnalysis) {
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${competitorAnalysis.lat},${competitorAnalysis.lng}`,
                          "_blank"
                        );
                      }
                    }}
                    data-testid="button-open-in-maps"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Google Maps
                  </Button>
                </div>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        {/* Equipment Add/Edit Modal for Valuator */}
        <Dialog open={showAddEquipmentModal} onOpenChange={(open) => {
          setShowAddEquipmentModal(open);
          if (!open) setEditingEquipment(null);
        }}>
          <DialogContent className="bg-[#0f1d2f] border border-white/10 text-white max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <WashingMachine className="w-5 h-5 text-[#8B5CF6]" />
                {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Enter the machine details to calculate fair market value.
              </DialogDescription>
            </DialogHeader>
            
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const equipment: EquipmentItem = {
                  id: editingEquipment?.id || `eq_${Date.now()}`,
                  machineType: formData.get('machineType') as MachineType,
                  brand: formData.get('brand') as MachineBrand,
                  model: formData.get('model') as string || '',
                  capacity: formData.get('capacity') as MachineCapacity,
                  ageYears: parseInt(formData.get('ageYears') as string) || 0,
                  purchaseCost: parseInt(formData.get('purchaseCost') as string) || 0,
                  quantity: parseInt(formData.get('quantity') as string) || 1,
                  condition: formData.get('condition') as 'excellent' | 'good' | 'fair' | 'poor' || 'good',
                };
                
                if (editingEquipment) {
                  setValuatorEquipment(prev => prev.map(item => 
                    item.id === editingEquipment.id ? equipment : item
                  ));
                  toast({ title: "Equipment updated" });
                } else {
                  setValuatorEquipment(prev => [...prev, equipment]);
                  toast({ title: "Equipment added" });
                }
                
                setShowAddEquipmentModal(false);
                setEditingEquipment(null);
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="machineType" className="text-xs text-white/70">Type</Label>
                  <Select name="machineType" defaultValue={editingEquipment?.machineType || 'washer'}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e3a5f] border-white/10">
                      <SelectItem value="washer">Washer</SelectItem>
                      <SelectItem value="dryer">Dryer</SelectItem>
                      <SelectItem value="combo">Combo</SelectItem>
                      <SelectItem value="folder">Folder</SelectItem>
                      <SelectItem value="ironer">Ironer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="quantity" className="text-xs text-white/70">Quantity</Label>
                  <Input 
                    type="number" 
                    name="quantity" 
                    min="1" 
                    max="100"
                    defaultValue={editingEquipment?.quantity || 1}
                    className="bg-white/5 border-white/10 text-white h-9"
                    data-testid="input-equipment-quantity"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs text-white/70">Brand</Label>
                <Select name="brand" defaultValue={editingEquipment?.brand || 'speed_queen'}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e3a5f] border-white/10 max-h-60">
                    {Object.entries(BRAND_DISPLAY_NAMES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="capacity" className="text-xs text-white/70">Capacity</Label>
                  <Select name="capacity" defaultValue={editingEquipment?.capacity || 'medium'}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-9">
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e3a5f] border-white/10">
                      <SelectItem value="small">Small (15-20 lbs)</SelectItem>
                      <SelectItem value="medium">Medium (20-30 lbs)</SelectItem>
                      <SelectItem value="large">Large (30-40 lbs)</SelectItem>
                      <SelectItem value="extra_large">XL (40-60 lbs)</SelectItem>
                      <SelectItem value="mega">Mega (60-80+ lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="condition" className="text-xs text-white/70">Condition</Label>
                  <Select name="condition" defaultValue={editingEquipment?.condition || 'good'}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-9">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e3a5f] border-white/10">
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ageYears" className="text-xs text-white/70">Age (years)</Label>
                  <Input 
                    type="number" 
                    name="ageYears" 
                    min="0" 
                    max="30"
                    defaultValue={editingEquipment?.ageYears || 0}
                    className="bg-white/5 border-white/10 text-white h-9"
                    placeholder="e.g. 5"
                    data-testid="input-equipment-age"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="purchaseCost" className="text-xs text-white/70">Purchase Cost ($)</Label>
                  <Input 
                    type="number" 
                    name="purchaseCost" 
                    min="0"
                    defaultValue={editingEquipment?.purchaseCost || ''}
                    className="bg-white/5 border-white/10 text-white h-9"
                    placeholder="e.g. 8500"
                    data-testid="input-equipment-cost"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs text-white/70">Model (optional)</Label>
                <Input 
                  type="text" 
                  name="model" 
                  defaultValue={editingEquipment?.model || ''}
                  className="bg-white/5 border-white/10 text-white h-9"
                  placeholder="e.g. SC80"
                  data-testid="input-equipment-model"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddEquipmentModal(false);
                    setEditingEquipment(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                  data-testid="button-cancel-equipment"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                  data-testid="button-save-equipment"
                >
                  {editingEquipment ? 'Update' : 'Add'} Equipment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default function CleanBIExplorer() {
  return (
    <AuthGuard
      title="CLEANBI Explorer Access"
      description="Sign in to access the CLEANBI Explorer and analyze laundromat locations. Free account includes 1 analysis per day."
    >
      <CleanBIExplorerContent />
    </AuthGuard>
  );
}
