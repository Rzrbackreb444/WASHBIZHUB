import { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { FAQSection } from "@/components/SuperSEOWrapper";
import { COMMON_FAQS } from "@/lib/seo-config";
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
  Bookmark,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Plus,
  Minus,
  WashingMachine,
  CircleDollarSign,
  Wrench,
  RefreshCw,
  LineChart,
  Award,
  Trophy,
  Printer,
  Ruler
} from "lucide-react";
import {
  ProgressRing,
  StatusBadge,
  PremiumCard,
  PremiumCardContent,
  AnimatedNumber,
  CardSkeleton,
} from "@/components/premium";
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ListingAnalyzer } from "@/components/ListingAnalyzer";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import { UpgradeModal } from "@/components/monetization/UpgradeModal";
import { UsageLimitBanner } from "@/components/monetization/UpgradePrompt";
import { trackEvent, trackConversion } from "@/lib/user-journey";
import { PLATFORM_TIERS } from "@/lib/tier-config";
import { useAuth } from "@/hooks/useAuth";
import { CLEANBIHelpChat } from "@/components/CLEANBIHelpChat";
import { CLEANBICrossSellCompact } from "@/components/CLEANBICrossSell";
import { useIsMobileWithHydration } from "@/hooks/use-mobile";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { SavedAddressesPanel } from "@/components/cleanbi/SavedAddressesPanel";
import { ViewModeToggle } from "@/components/cleanbi/ViewModeToggle";
import AnalysisChartsView from "@/components/cleanbi/AnalysisChartsView";
import { AnalysisReportGenerator } from "@/components/cleanbi/AnalysisReportGenerator";
import { AnalysisSocialShare } from "@/components/cleanbi/AnalysisSocialShare";
import { useLocationDesign } from "@/contexts/LocationDesignContext";
import { RequestProfessionalAnalysisCTA } from "@/components/consultation/RequestProfessionalAnalysisCTA";

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

interface EquipmentTemplate {
  id: string;
  name: string;
  description: string;
  totalMachines: number;
  estimatedCost: number;
  equipment: Omit<EquipmentItem, 'id'>[];
}

const EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  {
    id: 'starter-20',
    name: '20-Machine Starter',
    description: 'Ideal for small neighborhood laundromats (1,500-2,000 sqft)',
    totalMachines: 20,
    estimatedCost: 145000,
    equipment: [
      { machineType: 'washer', brand: 'speed_queen', model: 'SC20', capacity: 'small', ageYears: 0, purchaseCost: 5500, quantity: 4, condition: 'excellent' },
      { machineType: 'washer', brand: 'speed_queen', model: 'SC30', capacity: 'medium', ageYears: 0, purchaseCost: 7500, quantity: 4, condition: 'excellent' },
      { machineType: 'washer', brand: 'speed_queen', model: 'SC40', capacity: 'large', ageYears: 0, purchaseCost: 9500, quantity: 2, condition: 'excellent' },
      { machineType: 'dryer', brand: 'speed_queen', model: 'ST30', capacity: 'medium', ageYears: 0, purchaseCost: 4500, quantity: 8, condition: 'excellent' },
      { machineType: 'dryer', brand: 'speed_queen', model: 'ST45', capacity: 'large', ageYears: 0, purchaseCost: 5500, quantity: 2, condition: 'excellent' }
    ]
  },
  {
    id: 'standard-40',
    name: '40-Machine Standard',
    description: 'Best for mid-size stores (2,500-3,500 sqft)',
    totalMachines: 40,
    estimatedCost: 320000,
    equipment: [
      { machineType: 'washer', brand: 'dexter', model: 'T-300', capacity: 'small', ageYears: 0, purchaseCost: 6000, quantity: 6, condition: 'excellent' },
      { machineType: 'washer', brand: 'dexter', model: 'T-400', capacity: 'medium', ageYears: 0, purchaseCost: 8000, quantity: 8, condition: 'excellent' },
      { machineType: 'washer', brand: 'dexter', model: 'T-600', capacity: 'large', ageYears: 0, purchaseCost: 11000, quantity: 4, condition: 'excellent' },
      { machineType: 'washer', brand: 'dexter', model: 'T-900', capacity: 'extra_large', ageYears: 0, purchaseCost: 15000, quantity: 2, condition: 'excellent' },
      { machineType: 'dryer', brand: 'dexter', model: 'DL2X30', capacity: 'medium', ageYears: 0, purchaseCost: 5500, quantity: 12, condition: 'excellent' },
      { machineType: 'dryer', brand: 'dexter', model: 'DL2X45', capacity: 'large', ageYears: 0, purchaseCost: 7000, quantity: 6, condition: 'excellent' },
      { machineType: 'dryer', brand: 'dexter', model: 'DL2X55', capacity: 'extra_large', ageYears: 0, purchaseCost: 8500, quantity: 2, condition: 'excellent' }
    ]
  },
  {
    id: 'premium-80',
    name: '80-Machine Premium',
    description: 'For high-volume flagship locations (4,500+ sqft)',
    totalMachines: 80,
    estimatedCost: 680000,
    equipment: [
      { machineType: 'washer', brand: 'continental_girbau', model: 'E-Series 20', capacity: 'small', ageYears: 0, purchaseCost: 6500, quantity: 10, condition: 'excellent' },
      { machineType: 'washer', brand: 'continental_girbau', model: 'E-Series 30', capacity: 'medium', ageYears: 0, purchaseCost: 9000, quantity: 14, condition: 'excellent' },
      { machineType: 'washer', brand: 'continental_girbau', model: 'E-Series 40', capacity: 'large', ageYears: 0, purchaseCost: 12000, quantity: 8, condition: 'excellent' },
      { machineType: 'washer', brand: 'continental_girbau', model: 'E-Series 60', capacity: 'extra_large', ageYears: 0, purchaseCost: 18000, quantity: 4, condition: 'excellent' },
      { machineType: 'washer', brand: 'continental_girbau', model: 'E-Series 80', capacity: 'mega', ageYears: 0, purchaseCost: 24000, quantity: 2, condition: 'excellent' },
      { machineType: 'dryer', brand: 'adc', model: 'AD-30', capacity: 'medium', ageYears: 0, purchaseCost: 5000, quantity: 20, condition: 'excellent' },
      { machineType: 'dryer', brand: 'adc', model: 'AD-45', capacity: 'large', ageYears: 0, purchaseCost: 6500, quantity: 14, condition: 'excellent' },
      { machineType: 'dryer', brand: 'adc', model: 'AD-75', capacity: 'extra_large', ageYears: 0, purchaseCost: 8500, quantity: 6, condition: 'excellent' },
      { machineType: 'dryer', brand: 'adc', model: 'AD-120', capacity: 'mega', ageYears: 0, purchaseCost: 12000, quantity: 2, condition: 'excellent' }
    ]
  }
];

const EQUIPMENT_USEFUL_LIFE: Record<MachineType, number> = {
  washer: 12,
  dryer: 14,
  combo: 10,
  folder: 15,
  ironer: 15
};

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
  { 
    key: "customer", 
    name: "Customer", 
    icon: Users, 
    description: "Population density, household income, demographics", 
    weight: 20,
    tooltip: "Analyzes population density per square mile, median household income, and renter demographics in the area",
    getPlainLanguage: (score: number) => score >= 85 ? "Excellent customer base" : score >= 70 ? "Strong customer potential" : score >= 55 ? "Moderate customer base" : "Needs customer outreach",
    factors: ["Population density", "Median income", "Renter percentage"]
  },
  { 
    key: "location", 
    name: "Location", 
    icon: MapPin, 
    description: "Visibility, accessibility, parking, foot traffic", 
    weight: 18,
    tooltip: "Evaluates walk score, transit access, visibility from main roads, and parking availability",
    getPlainLanguage: (score: number) => score >= 85 ? "Prime location" : score >= 70 ? "Very accessible" : score >= 55 ? "Decent accessibility" : "Location challenges",
    factors: ["Walk score", "Transit access", "Visibility"]
  },
  { 
    key: "equipment", 
    name: "Equipment", 
    icon: Zap, 
    description: "Machine mix, age, efficiency potential", 
    weight: 15,
    tooltip: "Estimates optimal machine mix based on market size, considers modern efficiency standards",
    getPlainLanguage: (score: number) => score >= 85 ? "Optimal setup" : score >= 70 ? "Good equipment fit" : score >= 55 ? "Upgrade opportunity" : "Retool recommended",
    factors: ["Market capacity", "Efficiency potential", "Mix optimization"]
  },
  { 
    key: "adaptability", 
    name: "Adaptability", 
    icon: TrendingUp, 
    description: "Expansion room, service diversification", 
    weight: 12,
    tooltip: "Measures potential for adding services like wash-dry-fold, pickup/delivery, or commercial accounts",
    getPlainLanguage: (score: number) => score >= 85 ? "High growth potential" : score >= 70 ? "Room to expand" : score >= 55 ? "Some expansion options" : "Limited flexibility",
    factors: ["Service diversification", "Market gaps", "Growth room"]
  },
  { 
    key: "numbers", 
    name: "Numbers", 
    icon: DollarSign, 
    description: "Revenue, margins, ROI benchmarks", 
    weight: 15,
    tooltip: "Projects revenue potential based on area demographics, competition, and industry benchmarks",
    getPlainLanguage: (score: number) => score >= 85 ? "Strong financials" : score >= 70 ? "Solid numbers" : score >= 55 ? "Average returns" : "Margin pressure",
    factors: ["Revenue potential", "Cost efficiency", "ROI outlook"]
  },
  { 
    key: "brand", 
    name: "Brand", 
    icon: Star, 
    description: "Online presence, reviews, reputation", 
    weight: 10,
    tooltip: "Considers existing reputation, review ratings, and online visibility in the market",
    getPlainLanguage: (score: number) => score >= 85 ? "Strong presence" : score >= 70 ? "Good reputation" : score >= 55 ? "Building awareness" : "Needs visibility",
    factors: ["Review ratings", "Online presence", "Local reputation"]
  },
  { 
    key: "intelligence", 
    name: "Intelligence", 
    icon: Brain, 
    description: "Market saturation, competition density", 
    weight: 10,
    tooltip: "Analyzes competitor density, market saturation, and strategic positioning opportunities",
    getPlainLanguage: (score: number) => score >= 85 ? "Low competition" : score >= 70 ? "Manageable market" : score >= 55 ? "Competitive area" : "Saturated market",
    factors: ["Competition density", "Market saturation", "Positioning"]
  }
];

const TOP_QUARTILE_BENCHMARKS: Record<string, number> = {
  customer: 88,
  location: 85,
  equipment: 90,
  adaptability: 82,
  numbers: 87,
  brand: 83,
  intelligence: 86
};

function getScoreInterpretation(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "#22C55E" };
  if (score >= 70) return { label: "Good", color: "#A3E635" };
  if (score >= 55) return { label: "Fair", color: "#FBBF24" };
  return { label: "Needs Work", color: "#C8A661" };
}

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

interface QuickWin {
  type: "opportunity" | "consideration";
  icon: typeof Target;
  title: string;
  description: string;
}

function generateQuickWins(analysis: AnalysisResult): QuickWin[] {
  const wins: QuickWin[] = [];
  
  if (analysis.competitorCount <= 3) {
    wins.push({
      type: "opportunity",
      icon: Target,
      title: "Low saturation market",
      description: "Premium pricing opportunity with minimal competition"
    });
  }
  
  if (analysis.medianIncome >= 75000) {
    wins.push({
      type: "opportunity",
      icon: Briefcase,
      title: "High-income area",
      description: "Target full-service offerings and premium amenities"
    });
  }
  
  if (analysis.trafficScore >= 70) {
    wins.push({
      type: "opportunity",
      icon: Clock,
      title: "High foot traffic",
      description: "Consider extended hours to capture more customers"
    });
  }
  
  if (analysis.populationDensity >= 8000) {
    wins.push({
      type: "opportunity",
      icon: Users,
      title: "Dense population",
      description: "Strong customer base within walking distance"
    });
  }
  
  if (analysis.walkScore && analysis.walkScore >= 70) {
    wins.push({
      type: "opportunity",
      icon: Footprints,
      title: "Highly walkable",
      description: "Walk-in traffic potential is excellent"
    });
  }
  
  if (analysis.competitorCount >= 6) {
    wins.push({
      type: "consideration",
      icon: Building2,
      title: "Competitive market",
      description: "Differentiation strategy recommended for standout appeal"
    });
  }
  
  if (analysis.medianIncome < 50000) {
    wins.push({
      type: "consideration",
      icon: DollarSign,
      title: "Value-focused market",
      description: "Emphasize affordable pricing and loyalty programs"
    });
  }
  
  if (analysis.populationDensity < 3000) {
    wins.push({
      type: "consideration",
      icon: Car,
      title: "Lower density area",
      description: "Consider pickup/delivery services to expand reach"
    });
  }
  
  return wins.slice(0, 5);
}

// Types for AI-Curated Action Board
interface InsightOpportunity {
  id: string;
  icon: typeof Target;
  title: string;
  description: string;
  actionText: string;
  priority: "high" | "medium" | "low";
  dataSource: string;
}

interface InsightRisk {
  id: string;
  icon: typeof AlertCircle;
  title: string;
  description: string;
  mitigation: string;
  severity: "high" | "medium" | "low";
  dataSource: string;
}

function generateInsightsOpportunities(analysis: AnalysisResult): InsightOpportunity[] {
  const opportunities: InsightOpportunity[] = [];
  
  // Low competition = premium pricing opportunity
  if (analysis.competitorCount <= 3) {
    opportunities.push({
      id: "opp-low-competition",
      icon: Target,
      title: "Low Competition Zone",
      description: `Only ${analysis.competitorCount} competitor${analysis.competitorCount === 1 ? "" : "s"} within 1 mile radius`,
      actionText: "Room for premium positioning and higher vend prices",
      priority: "high",
      dataSource: "competitorCount"
    });
  } else if (analysis.competitorCount <= 5) {
    opportunities.push({
      id: "opp-moderate-competition",
      icon: Target,
      title: "Moderate Competition",
      description: `${analysis.competitorCount} competitors nearby - manageable market`,
      actionText: "Focus on service quality to capture market share",
      priority: "medium",
      dataSource: "competitorCount"
    });
  }
  
  // High income area
  if (analysis.medianIncome >= 100000) {
    opportunities.push({
      id: "opp-premium-income",
      icon: Briefcase,
      title: "Premium Market",
      description: `$${(analysis.medianIncome / 1000).toFixed(0)}K median income supports premium services`,
      actionText: "Offer wash-dry-fold, delivery, and premium amenities",
      priority: "high",
      dataSource: "medianIncome"
    });
  } else if (analysis.medianIncome >= 75000) {
    opportunities.push({
      id: "opp-high-income",
      icon: DollarSign,
      title: "Strong Spending Power",
      description: `$${(analysis.medianIncome / 1000).toFixed(0)}K median income in this area`,
      actionText: "Full-service offerings will resonate with customers",
      priority: "medium",
      dataSource: "medianIncome"
    });
  }
  
  // High traffic score
  if (analysis.trafficScore >= 80) {
    opportunities.push({
      id: "opp-high-traffic",
      icon: TrendingUp,
      title: "Excellent Foot Traffic",
      description: `Traffic score of ${analysis.trafficScore}/100 indicates high visibility`,
      actionText: "Extended hours and signage will maximize exposure",
      priority: "high",
      dataSource: "trafficScore"
    });
  } else if (analysis.trafficScore >= 60) {
    opportunities.push({
      id: "opp-good-traffic",
      icon: Clock,
      title: "Good Traffic Flow",
      description: `Traffic score of ${analysis.trafficScore}/100 - solid visibility`,
      actionText: "Consider strategic signage to capture drive-by traffic",
      priority: "medium",
      dataSource: "trafficScore"
    });
  }
  
  // High population density
  if (analysis.populationDensity >= 10000) {
    opportunities.push({
      id: "opp-dense-population",
      icon: Users,
      title: "Dense Urban Market",
      description: `${(analysis.populationDensity / 1000).toFixed(1)}K people per sq mile`,
      actionText: "Large captive customer base within walking distance",
      priority: "high",
      dataSource: "populationDensity"
    });
  } else if (analysis.populationDensity >= 5000) {
    opportunities.push({
      id: "opp-good-density",
      icon: Users,
      title: "Strong Population Base",
      description: `${(analysis.populationDensity / 1000).toFixed(1)}K people per sq mile nearby`,
      actionText: "Consistent customer flow from local residents",
      priority: "medium",
      dataSource: "populationDensity"
    });
  }
  
  // High walk score
  if (analysis.walkScore && analysis.walkScore >= 85) {
    opportunities.push({
      id: "opp-walkable",
      icon: Footprints,
      title: "Walker's Paradise",
      description: `Walk Score of ${analysis.walkScore} - daily errands walkable`,
      actionText: "Walk-in customers will be a major traffic source",
      priority: "high",
      dataSource: "walkScore"
    });
  } else if (analysis.walkScore && analysis.walkScore >= 70) {
    opportunities.push({
      id: "opp-very-walkable",
      icon: Footprints,
      title: "Very Walkable Location",
      description: `Walk Score of ${analysis.walkScore} - most errands walkable`,
      actionText: "Pedestrian traffic supports consistent walk-ins",
      priority: "medium",
      dataSource: "walkScore"
    });
  }
  
  // Good transit score
  if (analysis.transitScore && analysis.transitScore >= 70) {
    opportunities.push({
      id: "opp-transit",
      icon: Train,
      title: "Excellent Transit Access",
      description: `Transit Score of ${analysis.transitScore} - convenient public transit`,
      actionText: "Car-free customers can easily reach your location",
      priority: "medium",
      dataSource: "transitScore"
    });
  }
  
  // Sort by priority and return top 5
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return opportunities.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 5);
}

function generateInsightsRisks(analysis: AnalysisResult): InsightRisk[] {
  const risks: InsightRisk[] = [];
  
  // High competition
  if (analysis.competitorCount >= 8) {
    risks.push({
      id: "risk-high-competition",
      icon: Building2,
      title: "Saturated Market",
      description: `${analysis.competitorCount} competitors within 1 mile`,
      mitigation: "Differentiate with superior service, modern equipment, or niche offerings",
      severity: "high",
      dataSource: "competitorCount"
    });
  } else if (analysis.competitorCount >= 6) {
    risks.push({
      id: "risk-moderate-competition",
      icon: Building2,
      title: "Competitive Market",
      description: `${analysis.competitorCount} competitors nearby requires differentiation`,
      mitigation: "Focus on customer experience and loyalty programs",
      severity: "medium",
      dataSource: "competitorCount"
    });
  }
  
  // Lower income area
  if (analysis.medianIncome < 40000) {
    risks.push({
      id: "risk-low-income",
      icon: Wallet,
      title: "Value-Sensitive Market",
      description: `$${(analysis.medianIncome / 1000).toFixed(0)}K median income - price conscious`,
      mitigation: "Competitive pricing with loyalty rewards and promotions",
      severity: "high",
      dataSource: "medianIncome"
    });
  } else if (analysis.medianIncome < 50000) {
    risks.push({
      id: "risk-moderate-income",
      icon: DollarSign,
      title: "Budget-Conscious Area",
      description: `$${(analysis.medianIncome / 1000).toFixed(0)}K median income area`,
      mitigation: "Balance quality with value pricing strategies",
      severity: "medium",
      dataSource: "medianIncome"
    });
  }
  
  // Low traffic
  if (analysis.trafficScore < 40) {
    risks.push({
      id: "risk-low-traffic",
      icon: Car,
      title: "Lower Visibility Zone",
      description: `Traffic score of ${analysis.trafficScore}/100 may limit walk-ins`,
      mitigation: "Invest in marketing, delivery services, and online presence",
      severity: "high",
      dataSource: "trafficScore"
    });
  } else if (analysis.trafficScore < 55) {
    risks.push({
      id: "risk-moderate-traffic",
      icon: Navigation,
      title: "Moderate Visibility",
      description: `Traffic score of ${analysis.trafficScore}/100 - some visibility challenges`,
      mitigation: "Enhanced signage and local marketing can help",
      severity: "medium",
      dataSource: "trafficScore"
    });
  }
  
  // Low population density
  if (analysis.populationDensity < 2000) {
    risks.push({
      id: "risk-low-density",
      icon: MapPinned,
      title: "Lower Density Area",
      description: `${(analysis.populationDensity / 1000).toFixed(1)}K people per sq mile`,
      mitigation: "Pickup/delivery service can expand your reach significantly",
      severity: "high",
      dataSource: "populationDensity"
    });
  } else if (analysis.populationDensity < 4000) {
    risks.push({
      id: "risk-moderate-density",
      icon: MapPin,
      title: "Suburban Density",
      description: `${(analysis.populationDensity / 1000).toFixed(1)}K people per sq mile`,
      mitigation: "Focus on convenience and parking availability",
      severity: "medium",
      dataSource: "populationDensity"
    });
  }
  
  // Low walk score
  if (analysis.walkScore && analysis.walkScore < 40) {
    risks.push({
      id: "risk-car-dependent",
      icon: Car,
      title: "Car-Dependent Location",
      description: `Walk Score of ${analysis.walkScore} - driving required`,
      mitigation: "Ensure ample parking and consider drive-through pickup",
      severity: "medium",
      dataSource: "walkScore"
    });
  }
  
  // Sort by severity and return all
  const severityOrder = { high: 0, medium: 1, low: 2 };
  return risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

function getIncomeLevel(income: number): { label: string; color: string } {
  if (income >= 100000) return { label: "High", color: "#22C55E" };
  if (income >= 75000) return { label: "Upper-Middle", color: "#A3E635" };
  if (income >= 50000) return { label: "Middle", color: "#FBBF24" };
  return { label: "Value", color: "#F97316" };
}

function getMarketMedianDelta(score: number): { value: number; label: string } {
  const marketMedian = 62;
  const delta = score - marketMedian;
  const sign = delta >= 0 ? "+" : "";
  return { value: delta, label: `${sign}${delta} vs market avg` };
}

function CleanBIExplorerContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { isMobile, isHydrated } = useIsMobileWithHydration();
  const { linkLocationToDesign, calculateRevenueMultiplier } = useLocationDesign();
  
  // Determine mobile status immediately on client using window.innerWidth as fallback
  // This prevents desktop users from seeing the mobile hydration overlay
  const showMobile = typeof window !== 'undefined' 
    ? (isHydrated ? isMobile : window.innerWidth < 1024)
    : false;
  
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const streetViewInstance = useRef<any>(null);
  const heatmapLayer = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const savedMarkersRef = useRef<any[]>([]);
  const sidebarViewportRef = useRef<HTMLDivElement>(null);
  
  // Mobile-specific state
  const [mobileAnalysisSheetOpen, setMobileAnalysisSheetOpen] = useState(false);
  
  // Helper to scroll sidebar to top after analysis
  const scrollSidebarToTop = () => {
    setTimeout(() => {
      sidebarViewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };
  
  const quota = useUsageQuota();
  const userTier = quota.tier.toLowerCase() as "free" | "starter" | "pro" | "enterprise";
  const remainingAnalyses = quota.remaining;
  const isAtLimit = quota.isAtLimit;
  
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Resizable sidebar state with localStorage persistence
  const SIDEBAR_STORAGE_KEY = "cleanbi_sidebar_width";
  const DEFAULT_SIDEBAR_SIZE = 25; // 25% default (approximately 320px on 1280px screen)
  const MIN_SIDEBAR_SIZE = 20; // 20% minimum
  const MAX_SIDEBAR_SIZE = 40; // 40% maximum
  const [sidebarSize, setSidebarSize] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_SIZE && parsed <= MAX_SIDEBAR_SIZE) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SIDEBAR_SIZE;
  });
  
  // Save sidebar size to localStorage when it changes
  const handleSidebarResize = useCallback((sizes: number[]) => {
    if (sizes[0] > 0) {
      setSidebarSize(sizes[0]);
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, sizes[0].toString());
      } catch {}
    }
  }, []);
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'charts'>('map');
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showAerialView, setShowAerialView] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPostAnalysisModal, setShowPostAnalysisModal] = useState(false);
  const [aerialVideoUrl, setAerialVideoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [showSavedMarkers, setShowSavedMarkers] = useState(true);
  const [showBenchmarkComparison, setShowBenchmarkComparison] = useState(false);
  
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
  
  // Scenario Projection Sliders State
  const [scenarioSliders, setScenarioSliders] = useState({
    vendPrice: 4.50, // $3.00 - $7.00, will be adjusted based on median income
    turnsPerDay: 5, // 3-10 turns/day
    machineCount: 30, // 10-100 machines
    operatingHours: 16, // 12-24 hours/day
  });
  
  // Financing Calculator State
  const [financingCalc, setFinancingCalc] = useState({
    loanAmount: 250000,
    interestRate: 8.0, // 6-12%
    loanTerm: 7, // 5, 7, 10 years
  });
  
  // Calculate default vend price based on median income when analysis changes
  useEffect(() => {
    if (analysisResult?.medianIncome) {
      // Higher income areas can support higher vend prices
      const income = analysisResult.medianIncome;
      let defaultVendPrice = 4.50;
      if (income >= 100000) defaultVendPrice = 6.00;
      else if (income >= 75000) defaultVendPrice = 5.25;
      else if (income >= 50000) defaultVendPrice = 4.50;
      else if (income >= 35000) defaultVendPrice = 3.75;
      else defaultVendPrice = 3.25;
      
      setScenarioSliders(prev => ({ ...prev, vendPrice: defaultVendPrice }));
    }
  }, [analysisResult?.medianIncome]);
  
  // Calculate scenario projections
  const scenarioProjections = useMemo(() => {
    const { vendPrice, turnsPerDay, machineCount, operatingHours } = scenarioSliders;
    // Adjust turns based on operating hours (base is 16 hours)
    const hoursMultiplier = operatingHours / 16;
    const adjustedTurns = turnsPerDay * hoursMultiplier;
    
    const dailyRevenue = vendPrice * adjustedTurns * machineCount;
    const monthlyRevenue = dailyRevenue * 30;
    const annualRevenue = monthlyRevenue * 12;
    
    // Expense breakdown percentages (mid-range of industry benchmarks)
    const expenses = {
      utilities: annualRevenue * 0.175, // 17.5% (mid of 15-20%)
      labor: annualRevenue * 0.125, // 12.5% (mid of 10-15%)
      rent: annualRevenue * 0.11, // 11% (mid of 10-12%)
      maintenance: annualRevenue * 0.04, // 4% (mid of 3-5%)
      other: annualRevenue * 0.065, // 6.5% (mid of 5-8%)
    };
    
    const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
    const expensePercentage = (totalExpenses / annualRevenue) * 100;
    const ebitda = annualRevenue - totalExpenses;
    const ebitdaMargin = (ebitda / annualRevenue) * 100;
    
    return {
      dailyRevenue,
      monthlyRevenue,
      annualRevenue,
      expenses,
      totalExpenses,
      expensePercentage,
      ebitda,
      ebitdaMargin,
    };
  }, [scenarioSliders]);
  
  // Calculate monthly loan payment
  const monthlyPayment = useMemo(() => {
    const { loanAmount, interestRate, loanTerm } = financingCalc;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    
    if (monthlyRate === 0) return loanAmount / numPayments;
    
    const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return payment;
  }, [financingCalc]);
  
  // Deal Scorer state
  const [dealVerdict, setDealVerdict] = useState<"buy" | "negotiate" | "overpriced" | null>(null);
  
  // Competitor Analysis state (one-click deep dive)
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [competitorSheetOpen, setCompetitorSheetOpen] = useState(false);
  
  // Competition Tab Filtering State
  const [competitorRatingFilter, setCompetitorRatingFilter] = useState<string>("all");
  const [competitorDistanceFilter, setCompetitorDistanceFilter] = useState<string>("all");
  const [competitorSortBy, setCompetitorSortBy] = useState<string>("distance");
  
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
  const [equipmentModalMode, setEquipmentModalMode] = useState<'standard' | 'quick' | 'templates'>('standard');
  
  // Memoized running totals for valuator equipment
  const equipmentRunningTotals = useMemo(() => {
    const totalMachines = valuatorEquipment.reduce((sum, e) => sum + e.quantity, 0);
    const totalCost = valuatorEquipment.reduce((sum, e) => sum + (e.purchaseCost * e.quantity), 0);
    const washerCount = valuatorEquipment.filter(e => e.machineType === 'washer').reduce((sum, e) => sum + e.quantity, 0);
    const dryerCount = valuatorEquipment.filter(e => e.machineType === 'dryer').reduce((sum, e) => sum + e.quantity, 0);
    const avgAge = totalMachines > 0 
      ? valuatorEquipment.reduce((sum, e) => sum + (e.ageYears * e.quantity), 0) / totalMachines 
      : 0;
    return { totalMachines, totalCost, washerCount, dryerCount, avgAge };
  }, [valuatorEquipment]);

  // Memoized age distribution data for chart
  const ageDistributionData = useMemo(() => {
    const ageCounts: Record<number, { washers: number; dryers: number; other: number }> = {};
    valuatorEquipment.forEach(item => {
      const age = item.ageYears;
      if (!ageCounts[age]) {
        ageCounts[age] = { washers: 0, dryers: 0, other: 0 };
      }
      if (item.machineType === 'washer') {
        ageCounts[age].washers += item.quantity;
      } else if (item.machineType === 'dryer') {
        ageCounts[age].dryers += item.quantity;
      } else {
        ageCounts[age].other += item.quantity;
      }
    });
    
    return Object.entries(ageCounts)
      .map(([age, counts]) => ({
        age: parseInt(age),
        label: `${age}yr`,
        washers: counts.washers,
        dryers: counts.dryers,
        other: counts.other,
        total: counts.washers + counts.dryers + counts.other
      }))
      .sort((a, b) => a.age - b.age);
  }, [valuatorEquipment]);

  // Memoized depreciation and replacement timeline data
  const depreciationTimelineData = useMemo(() => {
    return valuatorEquipment.map(item => {
      const usefulLife = EQUIPMENT_USEFUL_LIFE[item.machineType] || 12;
      const remainingLife = Math.max(0, usefulLife - item.ageYears);
      const depreciationPercent = Math.min(100, (item.ageYears / usefulLife) * 100);
      const estimatedCurrentValue = item.purchaseCost * item.quantity * (1 - (depreciationPercent / 100) * 0.7);
      const replacementUrgency = remainingLife <= 2 ? 'urgent' : remainingLife <= 5 ? 'soon' : 'good';
      
      return {
        id: item.id,
        brand: BRAND_DISPLAY_NAMES[item.brand],
        type: MACHINE_TYPE_DISPLAY[item.machineType],
        quantity: item.quantity,
        ageYears: item.ageYears,
        usefulLife,
        remainingLife,
        depreciationPercent,
        estimatedCurrentValue,
        replacementUrgency,
        originalCost: item.purchaseCost * item.quantity
      };
    });
  }, [valuatorEquipment]);
  
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

  // Auto-open mobile sheet when analysis completes on mobile
  useEffect(() => {
    if (showMobile && analysisResult) {
      setMobileAnalysisSheetOpen(true);
    }
  }, [showMobile, analysisResult]);

  // Memoized category scores calculation for performance
  const memoizedCategoryScores = useMemo(() => {
    if (!analysisResult) return {};
    return generateCategoryScores(analysisResult.cleanbiScore, analysisResult);
  }, [analysisResult?.cleanbiScore, analysisResult?.populationDensity, analysisResult?.medianIncome, analysisResult?.trafficScore, analysisResult?.competitorCount]);

  // Memoized revenue projections for financial calculator
  const memoizedRevenueProjections = useMemo(() => {
    if (!analysisResult) return null;
    const populationServed = Math.min(analysisResult.populationDensity * 0.78, 25000);
    const baseRevenue = populationServed * 18;
    const incomeMultiplier = Math.max(0.7, Math.min(1.4, analysisResult.medianIncome / 70000));
    const competitionFactor = 1 / Math.max(1, analysisResult.competitorCount * 0.3);
    const estimatedRevenue = Math.max(150000, Math.min(600000, baseRevenue * incomeMultiplier * competitionFactor));
    const estimatedExpenses = estimatedRevenue * 0.58;
    const estimatedNOI = estimatedRevenue - estimatedExpenses;
    const estimatedValue = estimatedNOI * 2.5;
    return {
      revenue: Math.round(estimatedRevenue),
      expenses: Math.round(estimatedExpenses),
      noi: Math.round(estimatedNOI),
      value: Math.round(estimatedValue)
    };
  }, [analysisResult?.populationDensity, analysisResult?.medianIncome, analysisResult?.competitorCount]);

  // Memoized filtered and sorted competitors
  const filteredCompetitors = useMemo(() => {
    let filtered = [...competitors];
    
    // Apply rating filter
    if (competitorRatingFilter === "4plus") {
      filtered = filtered.filter(c => c.rating >= 4);
    } else if (competitorRatingFilter === "3plus") {
      filtered = filtered.filter(c => c.rating >= 3);
    } else if (competitorRatingFilter === "below3") {
      filtered = filtered.filter(c => c.rating < 3);
    }
    
    // Apply distance filter
    if (competitorDistanceFilter === "1mi") {
      filtered = filtered.filter(c => c.distance <= 1);
    } else if (competitorDistanceFilter === "2mi") {
      filtered = filtered.filter(c => c.distance <= 2);
    } else if (competitorDistanceFilter === "3mi") {
      filtered = filtered.filter(c => c.distance <= 3);
    } else if (competitorDistanceFilter === "5mi") {
      filtered = filtered.filter(c => c.distance <= 5);
    }
    
    // Apply sorting
    if (competitorSortBy === "distance") {
      filtered.sort((a, b) => a.distance - b.distance);
    } else if (competitorSortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (competitorSortBy === "reviews") {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    
    return filtered;
  }, [competitors, competitorRatingFilter, competitorDistanceFilter, competitorSortBy]);

  // Memoized competitor market summary statistics
  const competitorMarketSummary = useMemo(() => {
    if (competitors.length === 0) return null;
    
    const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    const highRatedCount = competitors.filter(c => c.rating >= 4).length;
    const lowRatedCount = competitors.filter(c => c.rating < 3).length;
    const mediumRatedCount = competitors.length - highRatedCount - lowRatedCount;
    const totalReviews = competitors.reduce((sum, c) => sum + c.reviewCount, 0);
    const avgReviews = totalReviews / competitors.length;
    
    // Calculate market opportunity score based on competitor weaknesses
    // Higher score = more opportunity (lower avg rating, more low-rated competitors)
    let opportunityScore = 50; // baseline
    opportunityScore += (5 - avgRating) * 15; // lower avg rating = more opportunity
    opportunityScore += (lowRatedCount / competitors.length) * 20; // more low-rated = more opportunity
    opportunityScore -= (highRatedCount / competitors.length) * 10; // fewer high-rated = less competition
    if (avgReviews < 50) opportunityScore += 10; // low review counts = less established
    opportunityScore = Math.max(20, Math.min(95, opportunityScore));
    
    // Determine opportunity level
    let opportunityLevel: "high" | "moderate" | "low" = "moderate";
    if (opportunityScore >= 70) opportunityLevel = "high";
    else if (opportunityScore < 45) opportunityLevel = "low";
    
    // Generate service gaps based on competitor weaknesses
    const serviceGaps: string[] = [];
    if (avgReviews < 30) serviceGaps.push("Online presence");
    if (avgRating < 3.8) serviceGaps.push("Customer service");
    if (competitors.length < 3) serviceGaps.push("Limited competition");
    if (lowRatedCount >= competitors.length / 3) serviceGaps.push("Quality standards");
    if (!serviceGaps.length) serviceGaps.push("Premium positioning");
    
    return {
      avgRating,
      highRatedCount,
      mediumRatedCount,
      lowRatedCount,
      totalReviews,
      avgReviews,
      opportunityScore,
      opportunityLevel,
      serviceGaps
    };
  }, [competitors]);

  // Generate estimated drive time based on distance (rough approximation)
  const getEstimatedDriveTime = (distanceMiles: number): string => {
    // Assume average speed of 25 mph in urban areas, 35 mph in suburban
    const avgSpeed = distanceMiles < 2 ? 20 : 30;
    const minutes = Math.round((distanceMiles / avgSpeed) * 60);
    return `~${minutes} min`;
  };

  // Generate competitor sentiment based on rating and review count
  const getCompetitorSentiment = (rating: number, reviewCount: number): { label: string; color: string; icon: typeof ThumbsUp } => {
    if (rating >= 4.5 && reviewCount >= 50) {
      return { label: "Strong competitor", color: "#EF4444", icon: ThumbsDown };
    } else if (rating >= 4) {
      return { label: "Well-rated", color: "#F97316", icon: TrendingUp };
    } else if (rating >= 3) {
      return { label: "Mixed reviews", color: "#FBBF24", icon: MessageSquare };
    } else {
      return { label: "Weak competitor", color: "#22C55E", icon: ThumbsUp };
    }
  };

  // Get potential service gaps for a competitor
  const getCompetitorGaps = (comp: Competitor): string[] => {
    const gaps: string[] = [];
    if (comp.rating < 3.5) gaps.push("Customer satisfaction");
    if (comp.reviewCount < 20) gaps.push("Limited visibility");
    if (comp.rating < 4 && comp.reviewCount > 50) gaps.push("Quality issues");
    if (comp.priceLevel && comp.priceLevel >= 3) gaps.push("Price sensitivity");
    if (!gaps.length) gaps.push("Differentiation needed");
    return gaps.slice(0, 2);
  };

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
    scrollSidebarToTop();
    
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
    scrollSidebarToTop();
    
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
    scrollSidebarToTop();
    
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
          title: "Analysis Limit Reached", 
          description: `You've used all your free analyses. Upgrade for unlimited access!`,
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
                fillColor: GRADE_COLORS[result.grade] || "#C8A661",
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
        scrollSidebarToTop();
        
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
      
      // Handle rate limit (5 free analyses total)
      if (data.rateLimited) {
        toast({ 
          title: "Analysis Limit Reached", 
          description: `You've used all your free analyses. Upgrade for unlimited access!`,
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
                fillColor: GRADE_COLORS[result.grade] || "#C8A661",
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
        scrollSidebarToTop();
        
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
        fillColor: "#C8A661",
        fillOpacity: 0.3,
        strokeColor: "#C8A661",
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
            <div style="font-weight: 600; color: #C8A661; margin-bottom: 6px;">Market Gap Zone</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.7);">
              <div>Score: ${zone.opportunityScore}/100</div>
              <div>Renters: ${zone.renterPercentage}%</div>
              <div>Income: $${Math.round(zone.medianIncome / 1000)}K</div>
              <div>${zone.gapReason}</div>
            </div>
            <div style="font-size: 11px; color: #C8A661; margin-top: 8px; font-weight: 500;">Click to run full CLEANBI analysis</div>
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
          fillColor: "#C8A661",
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
              <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #C8A661, #A8893F); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">#${idx + 1}</div>
              <div style="font-size: 18px; font-weight: 600; color: white;">Score: ${opp.opportunityScore}</div>
            </div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 6px;">${opp.gapReason}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.5);">
              Renters: ${opp.renterPercentage}% | Income: $${Math.round(opp.medianIncome / 1000)}K
            </div>
            <button 
              onclick="window.analyzeGapFromMap && window.analyzeGapFromMap(${opp.lat}, ${opp.lng})"
              style="margin-top: 10px; padding: 8px 14px; background: linear-gradient(90deg, #C8A661, #A8893F); border: none; border-radius: 8px; color: white; font-size: 12px; cursor: pointer; width: 100%; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
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
        scrollSidebarToTop();
        
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
        title="CLEANBI Explorer - AI Location Intelligence for Laundromats"
        description="Free CLEANBI scoring system analyzes laundromat locations. Get demographic data, competition mapping, traffic analysis & site scores for any US address."
        canonicalUrl="/cleanbi-explorer"
        ogType="website"
        keywords={[
          "CLEANBI score",
          "laundromat location analysis",
          "site selection tool",
          "demographic analysis",
          "competition mapping",
          "laundromat location intelligence",
          "coin laundry site score",
          "market analysis laundromat",
          "laundromat feasibility study",
          "commercial laundry location",
          "traffic analysis laundromat",
          "walk score laundromat",
          "transit score coin laundry",
          "population density analysis",
          "income demographics laundromat",
          "laundromat investment tool",
          "laundry business location finder"
        ]}
        howTo={{
          name: "How to Use CLEANBI Explorer for Laundromat Site Analysis",
          description: "Complete 5-step guide to analyze any location for laundromat investment potential using the CLEANBI scoring system",
          steps: [
            { name: "Enter Your Target Address", text: "Type any US street address, city, or zip code into the search bar. CLEANBI works with commercial properties, retail centers, or any location you're considering for a laundromat business." },
            { name: "Run the CLEANBI Analysis", text: "Click 'Analyze Location' to start the comprehensive scoring process. CLEANBI will gather demographic data, map competitors, calculate accessibility scores, and generate your location grade in seconds." },
            { name: "Review Your CLEANBI Score", text: "View your overall score (0-100) and letter grade (A/B/C). The score breakdown shows how the location performs across all 7 CLEANBI factors: Customer, Location, Equipment, Adaptability, Numbers, Brand, and Intelligence." },
            { name: "Explore Competition & Demographics", text: "Switch to the Competition tab to see all nearby laundromats with ratings and reviews. Check the Demographics panel for population density, median income, and household data within your catchment area." },
            { name: "Save and Export Your Analysis", text: "Save the analysis to your history for future reference. Premium users can export detailed PDF reports, share analysis links with partners, and access 3D aerial flyover views of the location." }
          ],
          totalTime: "PT3M"
        }}
        productOffers={[
          {
            name: "CLEANBI Free",
            description: "Get started with 3 free location analyses. Includes basic CLEANBI scoring, competitor mapping, and demographic overview.",
            price: "0",
            priceCurrency: "USD",
            availability: "InStock"
          },
          {
            name: "CLEANBI Starter",
            description: "Unlimited location analyses, full competitor intelligence, Walk Score integration, and PDF report exports for serious investors.",
            price: "29",
            priceCurrency: "USD",
            availability: "InStock"
          },
          {
            name: "CLEANBI Pro",
            description: "Everything in Starter plus 3D aerial flyovers, property value estimates, utility rate data, AI-powered investment insights, and priority support.",
            price: "79",
            priceCurrency: "USD",
            availability: "InStock"
          },
          {
            name: "CLEANBI Enterprise",
            description: "Full platform access with bulk analysis, API access, white-label reports, dedicated account manager, and custom integrations for brokers and investors.",
            price: "199",
            priceCurrency: "USD",
            availability: "InStock"
          }
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "CLEANBI Explorer",
          "alternateName": "CLEANBI Location Intelligence",
          "applicationCategory": "BusinessApplication",
          "applicationSubCategory": "Real Estate Analysis Tool",
          "operatingSystem": "Web Browser",
          "browserRequirements": "Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.",
          "softwareVersion": "2.0",
          "releaseNotes": "New Market Gaps finder, enhanced competitor intelligence, 3D aerial views",
          "screenshot": "https://washbizhub.com/cleanbi-explorer-screenshot.png",
          "offers": [
            {
              "@type": "Offer",
              "name": "Free Tier",
              "price": "0",
              "priceCurrency": "USD",
              "description": "3 free location analyses with basic scoring"
            },
            {
              "@type": "Offer",
              "name": "Starter Plan",
              "price": "29",
              "priceCurrency": "USD",
              "description": "Unlimited analyses, competitor intel, PDF exports"
            },
            {
              "@type": "Offer",
              "name": "Pro Plan",
              "price": "79",
              "priceCurrency": "USD",
              "description": "3D flyovers, property values, AI insights"
            },
            {
              "@type": "Offer",
              "name": "Enterprise Plan",
              "price": "199",
              "priceCurrency": "USD",
              "description": "API access, bulk analysis, white-label reports"
            }
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "523",
            "bestRating": "5",
            "worstRating": "1"
          },
          "featureList": [
            "CLEANBI 7-factor location scoring algorithm",
            "Real-time competitor mapping and analysis",
            "US Census demographic data integration",
            "Walk Score, Transit Score, and Bike Score",
            "Population density and income analysis",
            "Market saturation and gap identification",
            "3D aerial flyover views",
            "Google Street View integration",
            "AI-powered investment recommendations",
            "PDF report generation and export",
            "Saved analysis history",
            "Shareable analysis links"
          ],
          "audience": {
            "@type": "BusinessAudience",
            "audienceType": "Laundromat Investors, Commercial Real Estate Investors, Business Brokers"
          },
          "creator": {
            "@type": "Organization",
            "name": "WashBizHub",
            "url": "https://washbizhub.com"
          }
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Tools", url: "/tools" },
          { name: "CLEANBI Explorer", url: "/cleanbi-explorer" }
        ]}
        aggregateRating={{
          itemName: "CLEANBI Explorer",
          itemType: "SoftwareApplication",
          itemDescription: "AI-powered location intelligence platform for laundromat site selection and investment analysis",
          ratingValue: 4.8,
          reviewCount: 523,
          bestRating: 5,
          worstRating: 1,
          reviews: [
            {
              author: "Michael Torres",
              authorType: "Person",
              datePublished: "2025-10-15",
              reviewBody: "CLEANBI Explorer completely transformed my due diligence process. I analyzed 15 locations in a weekend and found a goldmine site that my competitors missed. The demographic data and competition mapping saved me months of research.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Jennifer Martinez",
              authorType: "Person",
              datePublished: "2025-09-28",
              reviewBody: "As a first-time laundromat buyer, CLEANBI gave me confidence in my location choice. The Walk Score integration and income demographics helped me understand the customer base. The score breakdown is incredibly detailed.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Robert Chen",
              authorType: "Person",
              datePublished: "2025-11-02",
              reviewBody: "Used CLEANBI to evaluate 8 potential sites for my second laundromat. The competition mapping feature showed me exactly where the gaps were. Ended up finding a B+ location I never would have considered otherwise.",
              ratingValue: 4,
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

      {/* Mobile Loading Overlay - Only shows on mobile during hydration */}
      {!isHydrated && showMobile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a14] text-white" data-testid="status-mobile-hydration">
          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          <span className="text-sm uppercase tracking-[0.2em]">Calibrating mobile controls…</span>
        </div>
      )}

      {/* Main Content */}
      <div className="fixed inset-0 bg-[#0a0a14]" data-testid="cleanbi-explorer">
        {/* Ternary Layout - Only ONE layout is mounted at a time */}
        {showMobile ? (
          // Mobile layout - ONLY renders on mobile
          <div className="h-full flex flex-col">
            {/* Mobile Map - Full width at top */}
            <div className="flex-1 relative min-h-[40vh]">
              <div 
                ref={mapRef}
                className="absolute inset-0"
                data-testid="explorer-map-mobile"
              />
              
              {/* Mobile Floating Action Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => {
                  if (analysisResult) {
                    setMobileAnalysisSheetOpen(true);
                  } else {
                    const addressInput = document.querySelector('[data-testid="input-explorer-address-mobile"]') as HTMLInputElement;
                    if (addressInput) {
                      addressInput.focus();
                    }
                  }
                }}
                className={`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#C8A661] to-[#A8893F] shadow-xl flex items-center justify-center text-white ${!analysisResult && !isAnalyzing ? 'animate-pulse' : ''}`}
                data-testid="button-mobile-fab"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : analysisResult ? (
                  <BarChart3 className="w-6 h-6" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </motion.button>
              
              {/* Mobile Address Input Overlay */}
              <div className="absolute top-4 left-4 right-4 z-30">
                <div className="bg-gradient-to-br from-[#1e3a5f]/95 to-[#0f1d2f]/95 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A661]" />
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && analyzeLocation()}
                        placeholder="Enter address to analyze..."
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-12 text-base"
                        data-testid="input-explorer-address-mobile"
                      />
                    </div>
                    <Button 
                      onClick={analyzeLocation}
                      disabled={isAnalyzing || !address.trim()}
                      className="bg-gradient-to-r from-[#C8A661] to-[#A8893F] hover:from-[#D8B66D] hover:to-[#C8A661] text-white min-h-12 px-4"
                      data-testid="button-analyze-mobile"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Zap className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Market Gap Legend on Mobile */}
              <AnimatePresence>
                {showMarketGaps && totalGapCount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-4 left-4 right-4 z-20 bg-gradient-to-br from-[#1e3a5f]/95 to-[#0f1d2f]/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl" 
                    data-testid="market-gap-legend-mobile"
                  >
                    <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#C8A661]" />
                      Market Gap Legend
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px]">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-[#C8A661]/30 border border-[#C8A661]" />
                        <span className="text-white/70">Gap Zones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#C8A661] fill-[#C8A661]" />
                        <span className="text-white/70">Top Opportunities</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-white/70">Competitors</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mobile Analysis Sheet */}
            <Sheet open={mobileAnalysisSheetOpen} onOpenChange={setMobileAnalysisSheetOpen}>
              <SheetContent 
                side="bottom" 
                className="h-[85vh] bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] border-t border-white/10 rounded-t-3xl p-0"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Location Analysis</SheetTitle>
                  <SheetDescription>Analysis results for the selected location</SheetDescription>
                </SheetHeader>
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-2" />
                <ScrollArea className="h-[calc(85vh-24px)]" viewportRef={sidebarViewportRef}>
                  {/* Mobile Analysis Results - Same content as sidebar but optimized for mobile */}
                  <div className="p-4">
                    {/* Score Hero on Mobile */}
                    {analysisResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            <svg viewBox="0 0 36 36" className="w-24 h-24">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={GRADE_COLORS[analysisResult.grade]}
                                strokeWidth="3"
                                strokeDasharray={`${analysisResult.cleanbiScore}, 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl font-bold text-white">{analysisResult.cleanbiScore}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                className="text-sm px-3 py-1 font-semibold"
                                style={{ backgroundColor: GRADE_COLORS[analysisResult.grade] }}
                              >
                                Grade {analysisResult.grade}
                              </Badge>
                            </div>
                            <p className="text-white/70 text-sm line-clamp-2">{analysisResult.address}</p>
                            {analysisResult.businessName && (
                              <p className="text-[#C8A661] text-sm font-medium mt-1">{analysisResult.businessName}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <Button
                            onClick={() => setShowStreetView(true)}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 min-h-11"
                            data-testid="button-streetview-mobile"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Street View
                          </Button>
                          <Button
                            onClick={() => {
                              const saved = saveAnalysis(analysisResult, competitors);
                              setSavedAnalyses(saved);
                              toast({ title: "Analysis saved!" });
                            }}
                            variant="outline"
                            className="border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/10 min-h-11"
                            data-testid="button-save-mobile"
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                        
                        {/* Mobile Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="w-full overflow-x-auto flex gap-1 bg-white/5 p-1 rounded-lg mb-4 snap-x scroll-smooth">
                            <TabsTrigger 
                              value="overview" 
                              className="min-h-11 px-4 text-sm flex-shrink-0 snap-start data-[state=active]:bg-[#C8A661] data-[state=active]:text-white"
                            >
                              Overview
                            </TabsTrigger>
                            <TabsTrigger 
                              value="competition"
                              className="min-h-11 px-4 text-sm flex-shrink-0 snap-start data-[state=active]:bg-[#C8A661] data-[state=active]:text-white"
                            >
                              Competition
                            </TabsTrigger>
                            <TabsTrigger 
                              value="demographics"
                              className="min-h-11 px-4 text-sm flex-shrink-0 snap-start data-[state=active]:bg-[#C8A661] data-[state=active]:text-white"
                            >
                              Demographics
                            </TabsTrigger>
                            <TabsTrigger 
                              value="financials"
                              className="min-h-11 px-4 text-sm flex-shrink-0 snap-start data-[state=active]:bg-[#C8A661] data-[state=active]:text-white"
                            >
                              Financials
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="mt-0">
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-white/50 mb-1">Population</div>
                                <div className="text-lg font-semibold text-white">{(analysisResult.populationDensity * 0.78).toLocaleString()}</div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-white/50 mb-1">Competitors</div>
                                <div className="text-lg font-semibold text-white">{analysisResult.competitorCount}</div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-white/50 mb-1">Median Income</div>
                                <div className="text-lg font-semibold text-white">${(analysisResult.medianIncome / 1000).toFixed(0)}K</div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-white/50 mb-1">Traffic Score</div>
                                <div className="text-lg font-semibold text-white">{analysisResult.trafficScore}/100</div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="competition" className="mt-0">
                            <div className="space-y-2">
                              {competitors.length === 0 ? (
                                <div className="text-center py-6 text-white/50">
                                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No competitors found nearby</p>
                                </div>
                              ) : (
                                competitors.map((comp, idx) => (
                                  <div key={idx} className="bg-white/5 rounded-lg px-4 py-3 min-h-12 flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-white">{comp.name}</p>
                                      <p className="text-xs text-white/50">{comp.distance} miles away</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                                      {comp.rating ? `${comp.rating}★` : 'No rating'}
                                    </Badge>
                                  </div>
                                ))
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="demographics" className="mt-0">
                            <div className="space-y-3">
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs text-white/50">Renter Percentage</span>
                                  <span className="text-sm font-medium text-white">{analysisResult.renterPercentage || 45}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-[#C8A661] to-[#d4a030]" 
                                    style={{ width: `${analysisResult.renterPercentage || 45}%` }}
                                  />
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-white/50">Population Density</span>
                                  <span className="text-sm font-medium text-white">{analysisResult.populationDensity.toLocaleString()}/sq mi</span>
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-white/50">Walk Score</span>
                                  <span className="text-sm font-medium text-white">{analysisResult.walkScore || analysisResult.trafficScore}/100</span>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="financials" className="mt-0">
                            {userTier === "free" ? (
                              <div className="relative">
                                <div className="blur-sm pointer-events-none opacity-60">
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="bg-green-500/10 rounded p-2 text-center">
                                        <div className="text-sm font-bold text-green-400">$540K</div>
                                        <div className="text-[9px] text-white/50">Annual</div>
                                      </div>
                                      <div className="bg-white/5 rounded p-2 text-center">
                                        <div className="text-sm font-bold text-white">48.5%</div>
                                        <div className="text-[9px] text-white/50">EBITDA</div>
                                      </div>
                                      <div className="bg-[#C8A661]/20 rounded p-2 text-center">
                                        <div className="text-sm font-bold text-[#C8A661]">$2.8K</div>
                                        <div className="text-[9px] text-white/50">Payment</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                                  <Lock className="w-6 h-6 text-[#C8A661] mb-2" />
                                  <p className="text-white/70 text-xs text-center mb-2">Interactive financial projections</p>
                                  <Button 
                                    size="sm"
                                    className="bg-[#C8A661] hover:bg-[#d4a030] text-black text-xs"
                                    onClick={() => setShowUpgradeModal(true)}
                                    data-testid="button-unlock-financials-mobile"
                                  >
                                    <Crown className="w-3 h-3 mr-1" />
                                    Unlock
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {/* Compact Scenario Summary */}
                                <div className="bg-[#0A1628] rounded-lg p-3 border border-[#C8A661]/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <LineChart className="w-3.5 h-3.5 text-[#C8A661]" />
                                    <span className="text-xs font-medium text-white">Scenario Summary</span>
                                  </div>
                                  <div className="text-[10px] text-white/50 mb-2">
                                    {scenarioSliders.machineCount} machines × ${scenarioSliders.vendPrice.toFixed(2)}/load × {scenarioSliders.turnsPerDay} turns/day
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white/5 rounded p-2 text-center">
                                      <div className="text-[10px] text-white/50">Daily</div>
                                      <div className="text-sm font-bold text-white" data-testid="display-daily-revenue-mobile">
                                        ${scenarioProjections.dailyRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                      </div>
                                    </div>
                                    <div className="bg-white/5 rounded p-2 text-center">
                                      <div className="text-[10px] text-white/50">Monthly</div>
                                      <div className="text-sm font-bold text-white" data-testid="display-monthly-revenue-mobile">
                                        ${(scenarioProjections.monthlyRevenue / 1000).toFixed(1)}K
                                      </div>
                                    </div>
                                    <div className="bg-[#C8A661]/20 rounded p-2 text-center border border-[#C8A661]/30">
                                      <div className="text-[10px] text-[#C8A661]">Annual</div>
                                      <div className="text-sm font-bold text-[#C8A661]" data-testid="display-annual-revenue-mobile">
                                        ${(scenarioProjections.annualRevenue / 1000).toFixed(0)}K
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* EBITDA Summary */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-[10px] text-white/50 mb-1">Total Expenses</div>
                                    <div className="text-base font-semibold text-white" data-testid="display-expenses-mobile">
                                      ${(scenarioProjections.totalExpenses / 1000).toFixed(0)}K
                                    </div>
                                    <div className="text-[9px] text-white/40">
                                      {scenarioProjections.expensePercentage.toFixed(0)}% of revenue
                                    </div>
                                  </div>
                                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                                    <div className="text-[10px] text-green-400 mb-1">EBITDA</div>
                                    <div className="text-base font-semibold text-green-400" data-testid="display-ebitda-mobile">
                                      ${(scenarioProjections.ebitda / 1000).toFixed(0)}K
                                    </div>
                                    <div className="text-[9px] text-green-400/70">
                                      {scenarioProjections.ebitdaMargin.toFixed(1)}% margin
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Financing Quick View */}
                                <div className="bg-[#C8A661]/10 rounded-lg p-3 border border-[#C8A661]/20">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-[10px] text-[#C8A661]">Monthly Payment</div>
                                      <div className="text-xl font-bold text-[#C8A661]" data-testid="display-payment-mobile">
                                        ${monthlyPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[9px] text-white/50">${(financingCalc.loanAmount / 1000).toFixed(0)}K @ {financingCalc.interestRate}%</div>
                                      <div className="text-[9px] text-white/50">{financingCalc.loanTerm} year term</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-[10px] text-white/40 text-center">
                                  Use desktop for full interactive scenario modeling
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </motion.div>
                    )}
                    
                    {/* Loading state */}
                    {isAnalyzing && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-[#C8A661] animate-spin mb-4" />
                        <p className="text-white/70">Analyzing location...</p>
                      </div>
                    )}
                    
                    {/* Empty state */}
                    {!analysisResult && !isAnalyzing && (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-[#C8A661] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Analysis Yet</h3>
                        <p className="text-white/60 text-sm mb-4">
                          Enter an address above to analyze a location
                        </p>
                        <Button 
                          onClick={() => setMobileAnalysisSheetOpen(false)}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 min-h-11"
                        >
                          Close Panel
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            
            {/* Mobile Bottom Bar */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] border-t border-white/10 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A661] to-[#A8893F] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">CLEANBI™ Explorer</div>
                  <div className="text-[10px] text-white/50">{remainingAnalyses} analyses left</div>
                </div>
              </div>
              <Button
                onClick={() => setMobileAnalysisSheetOpen(true)}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 min-h-11 text-sm"
                data-testid="button-view-analysis-mobile"
              >
                {analysisResult ? 'View Analysis' : 'Get Started'}
                <ChevronUp className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          // Desktop layout - ONLY renders on desktop
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={handleSidebarResize}
            className="h-full"
          >
          {/* Left Sidebar - Resizable Panel */}
          <ResizablePanel
            defaultSize={sidebarOpen ? sidebarSize : 0}
            size={sidebarOpen ? undefined : 0}
            minSize={sidebarOpen ? MIN_SIDEBAR_SIZE : 0}
            maxSize={sidebarOpen ? MAX_SIDEBAR_SIZE : 0}
            collapsible={true}
            collapsedSize={0}
            data-testid="sidebar-panel"
            className="relative"
          >
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full bg-[#0A1628] flex flex-col"
            >
              {/* Sticky Sidebar Header with Quota & Tier */}
              <div className="sticky top-0 z-20 bg-[#0A1628] border-b border-white/10">
                {/* Gold Top Accent */}
                <div className="h-1 bg-gradient-to-r from-[#C8A661] via-[#D4B06A] to-[#C8A661]" />
                
                <div className="p-3">
                  {/* Brand + Tier Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A661] to-[#A8893F] flex items-center justify-center shadow-lg">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>CLEANBI™ Explorer</h2>
                      </div>
                    </div>
                    <Badge 
                      className={`text-[10px] font-semibold px-2 py-0.5 ${
                        userTier === 'enterprise' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        userTier === 'pro' ? 'bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30' :
                        userTier === 'starter' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-white/10 text-white/60 border-white/20'
                      }`}
                      data-testid="tier-badge"
                    >
                      {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
                    </Badge>
                  </div>
                  
                  {/* Quota Progress Bar */}
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Analyses This Month</span>
                      <span className="text-xs font-semibold text-white">
                        {quota.used}/{quota.limit === -1 ? '∞' : quota.limit}
                      </span>
                    </div>
                    {quota.limit !== -1 && (
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            quota.used >= quota.limit ? 'bg-red-500' :
                            quota.used >= quota.limit * 0.8 ? 'bg-amber-500' :
                            'bg-[#C8A661]'
                          }`}
                        />
                      </div>
                    )}
                    {quota.limit === -1 && (
                      <div className="flex items-center gap-1 text-[10px] text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unlimited analyses</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Upgrade CTA - Show only for free/starter tiers */}
                  {(userTier === 'free' || userTier === 'starter') && (
                    <Button 
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full mt-2.5 bg-gradient-to-r from-[#C8A661] to-[#A8893F] hover:from-[#D8B66D] hover:to-[#C8A661] text-[#0A1628] h-9 text-xs font-semibold shadow-lg"
                      data-testid="button-upgrade-header"
                    >
                      <Crown className="w-3.5 h-3.5 mr-1.5" />
                      {userTier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Pro'}
                    </Button>
                  )}
                </div>
              </div>
              
              <ScrollArea className="flex-1" viewportRef={sidebarViewportRef}>

            {/* Empty State - Click to Analyze CTA */}
            <AnimatePresence>
            {!analysisResult && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4"
              >
                {/* Hero Card with Gold Accent */}
                <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                  {/* Gold Top Bar */}
                  <div className="h-1 bg-[#C8A661]" />
                  
                  <div className="p-5 text-center">
                    {/* Navy Icon Container with Gold Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#0A1628] border border-[#C8A661]/30 flex items-center justify-center shadow-lg">
                      <MapPin className="w-8 h-8 text-[#C8A661]" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Ready to Score Your Location?</h3>
                    <p className="text-white/60 text-sm mb-5">
                      Enter any address below to get an instant CLEANBI™ score (0-100) and investment grade.
                    </p>
                    
                    {/* Feature List */}
                    <div className="space-y-2.5 text-left mb-5 bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2.5 text-sm text-white/80">
                        <div className="w-5 h-5 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[#C8A661]" />
                        </div>
                        <span>Competitor density analysis</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-white/80">
                        <div className="w-5 h-5 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[#C8A661]" />
                        </div>
                        <span>Demographics & income data</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-white/80">
                        <div className="w-5 h-5 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[#C8A661]" />
                        </div>
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
                      className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] h-11 text-sm font-semibold shadow-lg"
                      data-testid="button-click-to-analyze"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Click to Analyze
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Premium Loading Skeleton State */}
            <AnimatePresence>
            {isAnalyzing && !analysisResult && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 border-b border-white/10"
                data-testid="analysis-loading-skeleton"
              >
                {/* Score Hero Skeleton */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-[90px] h-[90px] rounded-full bg-white/5 animate-pulse flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                    <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-full max-w-[180px] bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
                
                {/* Action Buttons Skeleton */}
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 h-8 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
                
                {/* Tabs Skeleton */}
                <div className="h-10 bg-white/5 rounded-lg mb-3 animate-pulse" />
                
                {/* Metrics Grid Skeleton */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 animate-pulse">
                      <div className="h-3 w-16 bg-white/10 rounded mb-2" />
                      <div className="h-5 w-12 bg-white/10 rounded mb-1" />
                      <div className="h-2 w-20 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
                
                {/* Analyzing Status Message */}
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-[#C8A661] border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 w-6 h-6 border-2 border-[#d4a030]/30 rounded-full animate-ping" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white font-medium">Analyzing Location</p>
                    <p className="text-xs text-white/50">Gathering demographics, competitors & walkability data...</p>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Analysis Result - Premium Display */}
            <AnimatePresence>
            {analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="border-b border-white/10"
                data-testid="analysis-result-panel"
              >
                {/* Premium Score Hero Section */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  className="relative overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(ellipse at top right, ${GRADE_COLORS[analysisResult.grade] || "#C8A661"}, transparent 70%)`
                    }}
                  />
                  
                  <div className="relative p-4 sm:p-5">
                    {/* Score Display with ProgressRing */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <ProgressRing
                          progress={analysisResult.cleanbiScore}
                          size={90}
                          strokeWidth={6}
                          progressColor={GRADE_COLORS[analysisResult.grade] || "#C8A661"}
                          trackColor="rgba(255,255,255,0.1)"
                          animated={true}
                          testId="cleanbi-score-ring"
                        >
                          <div className="text-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                              className="text-2xl font-bold text-white"
                              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                              <AnimatedNumber value={analysisResult.cleanbiScore} format="number" />
                            </motion.div>
                            <div className="text-[9px] text-white/50 uppercase tracking-wider">Score</div>
                          </div>
                        </ProgressRing>
                        
                        {/* Grade Badge Overlay */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                          className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-[#0f1d2f]"
                          style={{ backgroundColor: GRADE_COLORS[analysisResult.grade] || "#C8A661" }}
                          data-testid="grade-badge"
                        >
                          {analysisResult.grade}
                        </motion.div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                        >
                          <div className="text-xs uppercase tracking-wider text-white/40 mb-1 font-medium">CLEANBI™ Analysis</div>
                          <StatusBadge
                            variant={
                              analysisResult.grade === "A" ? "success" :
                              analysisResult.grade === "B" ? "success" :
                              analysisResult.grade === "C" ? "warning" : "neutral"
                            }
                            label={OPPORTUNITY_LABELS[analysisResult.opportunityLevel]?.text || "Analysis Complete"}
                            pulse={OPPORTUNITY_LABELS[analysisResult.opportunityLevel]?.pulse}
                            size="md"
                            testId="opportunity-badge"
                          />
                          <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed">
                            {analysisResult.address}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Quick Actions Row */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      className="flex flex-wrap gap-2"
                    >
                      <AnalysisSocialShare analysis={analysisResult} />
                      <AnalysisReportGenerator 
                        analysis={analysisResult} 
                        isSubscriber={userTier === "pro" || userTier === "enterprise"}
                        onUpgradeClick={() => setShowUpgradeModal(true)}
                      />
                      <Button
                        size="default"
                        className="flex-1 min-h-11 px-4 gap-2 bg-[#C8A661] hover:bg-[#d4a030] text-white"
                        onClick={() => {
                          saveAnalysis(analysisResult);
                          setSavedAnalyses(getStoredAnalyses());
                          toast({ title: "Saved!", description: "Analysis added to history" });
                        }}
                        data-testid="button-save-analysis"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        Save
                      </Button>
                    </motion.div>
                    
                    {/* Design Studio Connection & Professional Analysis */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.55, duration: 0.3 }}
                      className="flex flex-col gap-2 mt-2"
                    >
                      <Button
                        size="default"
                        className="w-full min-h-11 gap-2 bg-gradient-to-r from-[#C8A661] to-[#B8955A] text-[#001F3F] hover:from-[#D4B872] hover:to-[#C8A661] font-bold shadow-lg"
                        onClick={() => {
                          const nearestCompetitor = competitors.length > 0 
                            ? Math.min(...competitors.map(c => c.distance)) 
                            : 2.0;
                          const marketSaturation: "Low" | "Medium" | "High" = 
                            analysisResult.competitorCount <= 2 ? "Low" :
                            analysisResult.competitorCount <= 5 ? "Medium" : "High";
                          
                          const locationData = {
                            address: analysisResult.address,
                            coordinates: { lat: analysisResult.lat, lng: analysisResult.lng },
                            cleanbiScore: analysisResult.cleanbiScore,
                            grade: (analysisResult.grade === "A" || analysisResult.grade === "B" || analysisResult.grade === "C" 
                              ? analysisResult.grade 
                              : "Needs Work") as "A" | "B" | "C" | "Needs Work",
                            demographics: {
                              medianIncome: analysisResult.medianIncome || 65000,
                              populationDensity: analysisResult.populationDensity || 5000,
                              renterPercentage: 45,
                              householdSize: 2.5,
                            },
                            competition: {
                              count: analysisResult.competitorCount || 0,
                              nearestDistance: nearestCompetitor,
                              marketSaturation,
                            },
                            traffic: {
                              score: analysisResult.trafficScore || 50,
                              dailyTraffic: (analysisResult.trafficScore || 50) * 200,
                              peakHours: ["8AM-10AM", "5PM-7PM"],
                            },
                            accessibility: {
                              walkScore: analysisResult.walkScore || 50,
                              transitScore: analysisResult.transitScore || 30,
                              parkingAvailable: true,
                            },
                            economics: {
                              avgRent: 25,
                              utilityMultiplier: 1.0,
                              laborCost: 15,
                            },
                            opportunityLevel: analysisResult.opportunityLevel || "moderate",
                            revenueMultiplier: 1.0,
                            analyzedAt: new Date().toISOString(),
                          };
                          
                          linkLocationToDesign(locationData);
                          toast({ 
                            title: "Location Linked!", 
                            description: "Opening Design Studio with location data..." 
                          });
                          setLocation("/design-studio");
                        }}
                        data-testid="button-design-for-location"
                      >
                        <Ruler className="w-4 h-4" />
                        Design for this Location
                      </Button>
                      
                      <RequestProfessionalAnalysisCTA
                        variant="button"
                        size="sm"
                        buttonText="Request Expert Review"
                        consultationData={{
                          type: "location",
                          locationAddress: analysisResult.address,
                          locationScore: analysisResult.cleanbiScore,
                          locationGrade: analysisResult.grade,
                        }}
                        className="w-full"
                      />
                    </motion.div>
                    
                    {/* View Mode Toggle */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      className="flex items-center justify-between mt-3"
                    >
                      <span className="text-xs text-white/50">View Mode</span>
                      <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Tabs Section */}
                <div className="px-3 pb-2">

                {/* Detail Tabs - Compact */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 sm:grid-cols-7 bg-white/5 backdrop-blur-sm mb-2 rounded-lg border border-white/10 gap-0.5 p-0.5">
                    <TabsTrigger value="overview" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 min-h-11 data-[state=active]:bg-[#C8A661] data-[state=active]:text-white rounded-lg">
                      <span className="hidden sm:inline">Overview</span>
                      <span className="sm:hidden">Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="score" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 min-h-11 data-[state=active]:bg-[#C8A661] data-[state=active]:text-white rounded-lg">Score</TabsTrigger>
                    <TabsTrigger value="compete" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 min-h-11 data-[state=active]:bg-[#C8A661] data-[state=active]:text-white rounded-lg">
                      <span className="hidden sm:inline">Compete</span>
                      <span className="sm:hidden">Comp</span>
                    </TabsTrigger>
                    <TabsTrigger value="financials" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 min-h-11 data-[state=active]:bg-[#22C55E] data-[state=active]:text-white flex items-center justify-center gap-0.5 rounded-lg" data-testid="tab-financials">
                      <Calculator className="w-3 h-3" />
                      <span className="hidden sm:inline">Calc</span>
                    </TabsTrigger>
                    <TabsTrigger value="valuator" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 min-h-11 data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white flex items-center justify-center gap-0.5 rounded-lg" data-testid="tab-valuator">
                      <CircleDollarSign className="w-3 h-3" />
                      <span className="hidden sm:inline">Value</span>
                      {(userTier === "free" || userTier === "starter") && <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#8B5CF6]" />}
                    </TabsTrigger>
                    <TabsTrigger value="deal" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 min-h-11 data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white flex items-center justify-center gap-0.5 rounded-lg" data-testid="tab-deal">
                      <Scale className="w-3 h-3" />
                      <span className="hidden sm:inline">Deal</span>
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="text-[9px] sm:text-[10px] px-0.5 sm:px-1 min-h-11 data-[state=active]:bg-[#C8A661] data-[state=active]:text-white flex items-center justify-center gap-0.5 rounded-lg">
                      AI
                      {userTier === "free" && <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#C8A661]" />}
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab - Premium Design */}
                  <TabsContent value="overview" className="mt-0 space-y-3" data-testid="overview-tab">
                    
                    {/* Executive KPI Ribbon */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-[#0A1628] to-[#0A1628]/80 rounded-lg p-3 border border-[#C8A661]/30"
                      data-testid="executive-kpi-ribbon"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-[#C8A661]" />
                        <span className="text-xs font-semibold text-white/80">Executive Summary</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* CLEANBI Score with Delta */}
                        <div className="bg-white/5 rounded-md p-2 text-center" data-testid="kpi-cleanbi-score">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xl font-bold text-[#C8A661]">{analysisResult.cleanbiScore}</span>
                            <Badge 
                              className={`text-[8px] px-1 py-0 ${getMarketMedianDelta(analysisResult.cleanbiScore).value >= 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
                              variant="outline"
                            >
                              {getMarketMedianDelta(analysisResult.cleanbiScore).label}
                            </Badge>
                          </div>
                          <div className="text-[9px] text-white/50">CLEANBI Score</div>
                        </div>
                        
                        {/* Competitor Count with Trend */}
                        <div className="bg-white/5 rounded-md p-2 text-center" data-testid="kpi-competitor-count">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xl font-bold text-white">{analysisResult.competitorCount}</span>
                            {analysisResult.competitorCount <= 3 ? (
                              <TrendingDown className="w-3.5 h-3.5 text-green-400" />
                            ) : analysisResult.competitorCount >= 6 ? (
                              <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <Minus className="w-3.5 h-3.5 text-yellow-400" />
                            )}
                          </div>
                          <div className="text-[9px] text-white/50">Competitors</div>
                        </div>
                        
                        {/* Population Density */}
                        <div className="bg-white/5 rounded-md p-2 text-center" data-testid="kpi-population-density">
                          <div className="text-xl font-bold text-white">{(analysisResult.populationDensity / 1000).toFixed(1)}K</div>
                          <div className="text-[9px] text-white/50">Pop. Density</div>
                        </div>
                        
                        {/* Median Income Bracket */}
                        <div className="bg-white/5 rounded-md p-2 text-center" data-testid="kpi-income-bracket">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0"
                            style={{ 
                              borderColor: `${getIncomeLevel(analysisResult.medianIncome).color}50`,
                              color: getIncomeLevel(analysisResult.medianIncome).color
                            }}
                          >
                            {getIncomeLevel(analysisResult.medianIncome).label}
                          </Badge>
                          <div className="text-[9px] text-white/50 mt-1">Income Level</div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Quick Wins Panel */}
                    {(() => {
                      const quickWins = generateQuickWins(analysisResult);
                      if (quickWins.length === 0) return null;
                      return (
                        <Collapsible defaultOpen className="w-full" data-testid="quick-wins-panel">
                          <CollapsibleTrigger className="w-full" asChild>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#C8A661]/15 to-transparent border border-[#C8A661]/20 cursor-pointer hover:border-[#C8A661]/40 transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-[#C8A661]/20 flex items-center justify-center">
                                  <Lightbulb className="w-4 h-4 text-[#C8A661]" />
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-white">Quick Wins</span>
                                  <div className="text-[9px] text-white/50">{quickWins.length} actionable insights</div>
                                </div>
                              </div>
                              <ChevronDown className="w-4 h-4 text-white/50 group-data-[state=open]:rotate-180 transition-transform" />
                            </motion.div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 space-y-1.5">
                            {quickWins.map((win, index) => (
                              <motion.div
                                key={win.title}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className="flex items-start gap-2 p-2 rounded-md bg-white/5 border border-white/5"
                                data-testid={`quick-win-${index}`}
                              >
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                  win.type === "opportunity" 
                                    ? "bg-green-500/20" 
                                    : "bg-amber-500/20"
                                }`}>
                                  <win.icon className={`w-3.5 h-3.5 ${
                                    win.type === "opportunity" 
                                      ? "text-green-400" 
                                      : "text-amber-400"
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-white">{win.title}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[8px] px-1 py-0 ${
                                        win.type === "opportunity" 
                                          ? "border-green-500/30 text-green-400" 
                                          : "border-amber-500/30 text-amber-400"
                                      }`}
                                    >
                                      {win.type === "opportunity" ? "Opportunity" : "Consider"}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-white/60 mt-0.5">{win.description}</p>
                                </div>
                              </motion.div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })()}

                    {/* Key Metrics Grid with Animated Numbers */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { 
                          icon: Building2, 
                          label: "Competitors", 
                          value: analysisResult.competitorCount,
                          subtext: `in ${searchRadius[0]} mi radius`,
                          color: analysisResult.competitorCount <= 3 ? "#22C55E" : analysisResult.competitorCount <= 6 ? "#FBBF24" : "#EF4444",
                          trend: analysisResult.competitorCount <= 3 ? "up" : analysisResult.competitorCount <= 6 ? "neutral" : "down"
                        },
                        { 
                          icon: Users, 
                          label: "Population", 
                          value: analysisResult.populationDensity,
                          displayValue: `${(analysisResult.populationDensity / 1000).toFixed(1)}K`,
                          subtext: "per sq mile",
                          color: analysisResult.populationDensity >= 8000 ? "#22C55E" : analysisResult.populationDensity >= 4000 ? "#FBBF24" : "#EF4444",
                          trend: analysisResult.populationDensity >= 8000 ? "up" : "neutral"
                        },
                        { 
                          icon: DollarSign, 
                          label: "Median Income", 
                          value: analysisResult.medianIncome,
                          displayValue: `$${(analysisResult.medianIncome / 1000).toFixed(0)}K`,
                          subtext: "household",
                          color: analysisResult.medianIncome >= 75000 ? "#22C55E" : analysisResult.medianIncome >= 45000 ? "#FBBF24" : "#EF4444",
                          trend: analysisResult.medianIncome >= 75000 ? "up" : "neutral"
                        },
                        { 
                          icon: Gauge, 
                          label: "Traffic Score", 
                          value: analysisResult.trafficScore,
                          subtext: "out of 100",
                          color: analysisResult.trafficScore >= 70 ? "#22C55E" : analysisResult.trafficScore >= 50 ? "#FBBF24" : "#EF4444",
                          trend: analysisResult.trafficScore >= 70 ? "up" : "neutral"
                        }
                      ].map((metric, index) => (
                        <motion.div
                          key={metric.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all duration-200 group"
                          data-testid={`metric-${metric.label.toLowerCase().replace(/\s/g, '-')}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 text-white/50">
                              <metric.icon className="w-3.5 h-3.5" style={{ color: metric.color }} />
                              <span className="text-[10px] font-medium">{metric.label}</span>
                            </div>
                            {metric.trend === "up" && <TrendingUp className="w-3 h-3 text-green-400" />}
                            {metric.trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
                          </div>
                          <div className="text-lg font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                            {metric.displayValue || <AnimatedNumber value={metric.value} format="number" />}
                          </div>
                          <div className="text-[9px] text-white/40">{metric.subtext}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Walk Score Section - Premium Design */}
                    {analysisResult.walkScore !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-lg border border-[#C8A661]/20"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#C8A661]/15 to-transparent" />
                        <div className="relative p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                                <Footprints className="w-4 h-4 text-[#C8A661]" />
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-white">Walkability Index</span>
                                <div className="text-[9px] text-white/40">Foot traffic potential</div>
                              </div>
                            </div>
                            <StatusBadge
                              variant={analysisResult.walkScore >= 70 ? "success" : analysisResult.walkScore >= 50 ? "warning" : "error"}
                              label={analysisResult.walkScore >= 70 ? "Walker's Paradise" : analysisResult.walkScore >= 50 ? "Somewhat Walkable" : "Car-Dependent"}
                              size="sm"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { icon: Footprints, label: "Walk", score: analysisResult.walkScore },
                              { icon: Train, label: "Transit", score: analysisResult.transitScore },
                              { icon: Bike, label: "Bike", score: analysisResult.bikeScore }
                            ].map((item) => {
                              const score = item.score ?? 0;
                              const scoreColor = score >= 70 ? "#22C55E" : score >= 50 ? "#FBBF24" : "#EF4444";
                              return (
                                <div key={item.label} className="text-center">
                                  <ProgressRing
                                    progress={score}
                                    size={40}
                                    strokeWidth={3}
                                    progressColor={scoreColor}
                                    trackColor="rgba(255,255,255,0.1)"
                                    animated={true}
                                    className="mx-auto mb-1"
                                  >
                                    <span className="text-xs font-bold" style={{ color: scoreColor }}>
                                      {item.score ?? "—"}
                                    </span>
                                  </ProgressRing>
                                  <div className="text-[9px] text-white/50 flex items-center justify-center gap-0.5">
                                    <item.icon className="w-2.5 h-2.5" />
                                    {item.label}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-white/50 mt-2 text-center italic">
                            {analysisResult.walkDescription || "Walkability data for customer accessibility"}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Premium Intelligence Panels */}
                    {loadingIntelligence ? (
                      <div className="bg-white/5 rounded-lg p-3 flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-2 border-[#C8A661] border-t-transparent rounded-full mr-2" />
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
                            className="bg-white/5 rounded-lg p-3 border border-dashed border-[#C8A661]/30 cursor-pointer hover:border-[#C8A661]/50 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="solar-upgrade-prompt"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#C8A661]" />
                              <Sun className="w-4 h-4 text-yellow-500/50" />
                              <span className="text-white/70 text-sm">Solar Potential Analysis</span>
                              <Crown className="w-3 h-3 text-[#C8A661] ml-auto" />
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
                                <div className="flex items-center gap-1 text-xs text-[#C8A661]">
                                  <Lock className="w-3 h-3" />
                                  <span>Owner info & liens: Enterprise tier</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : userTier === "free" && (
                          <div 
                            className="bg-white/5 rounded-lg p-3 border border-dashed border-[#C8A661]/30 cursor-pointer hover:border-[#C8A661]/50 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="property-upgrade-prompt"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#C8A661]" />
                              <Building2 className="w-4 h-4 text-blue-400/50" />
                              <span className="text-white/70 text-sm">Property Value & Details</span>
                              <Crown className="w-3 h-3 text-[#C8A661] ml-auto" />
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
                            className="bg-white/5 rounded-lg p-3 border border-dashed border-[#C8A661]/30 cursor-pointer hover:border-[#C8A661]/50 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="utility-upgrade-prompt"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#C8A661]" />
                              <Bolt className="w-4 h-4 text-purple-400/50" />
                              <span className="text-white/70 text-sm">Utility Rate Analysis</span>
                              <Badge variant="outline" className="text-[10px] border-[#C8A661]/30 text-[#C8A661] ml-auto">PRO</Badge>
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
                            className="bg-white/5 rounded-lg p-3 border border-dashed border-[#C8A661]/30 cursor-pointer hover:border-[#C8A661]/50 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="catchment-upgrade-prompt"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#C8A661]" />
                              <Gauge className="w-4 h-4 text-cyan-400/50" />
                              <span className="text-white/70 text-sm">Customer Catchment Analysis</span>
                              <Badge variant="outline" className="text-[10px] border-[#C8A661]/30 text-[#C8A661] ml-auto">PRO</Badge>
                            </div>
                            <div className="text-xs text-white/40 mt-1">See household counts & drive-time analytics</div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        size="default" 
                        variant="outline" 
                        onClick={initStreetView}
                        className="flex-1 min-h-11 px-4 gap-2 border-white/20 text-white hover:bg-white/10"
                        data-testid="button-street-view"
                      >
                        <Camera className="w-4 h-4" />
                        Street View
                      </Button>
                      <Button 
                        size="default" 
                        variant="outline" 
                        onClick={userTier === "free" ? () => setShowUpgradeModal(true) : fetchAerialView}
                        className={`flex-1 min-h-11 px-4 gap-2 border-white/20 text-white hover:bg-white/10 ${userTier === "free" ? "border-[#C8A661]/50" : ""}`}
                        data-testid="button-aerial-view"
                      >
                        {userTier === "free" ? (
                          <>
                            <Lock className="w-4 h-4 text-[#C8A661]" />
                            3D Flyover
                            <Crown className="w-3 h-3 text-[#C8A661]" />
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" />
                            3D Flyover
                          </>
                        )}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={shareAnalysis}
                        className="min-h-11 min-w-11 border-white/20 text-white hover:bg-white/10"
                        data-testid="button-share-analysis"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Score Breakdown Tab - Enhanced with Radar Chart */}
                  <TabsContent value="score" className="mt-0" data-testid="score-breakdown-tab">
                    {/* Header with Benchmark Toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#C8A661]" />
                        <span className="text-xs font-medium text-white/70">CLEANBI™ Factor Analysis</span>
                        <Badge variant="outline" className="text-[9px] border-white/20 text-white/50">Estimated</Badge>
                      </div>
                      {userTier === "free" ? (
                        <StatusBadge 
                          variant="warning" 
                          label="2 of 7 Factors" 
                          size="sm"
                          testId="score-limit-badge"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] text-white/50">Live Data</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Benchmark Comparison Toggle */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-[#C8A661]/10 to-transparent rounded-lg p-2.5 mb-3 border border-[#C8A661]/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5 text-[#C8A661]" />
                          <span className="text-xs text-white/60">Your Score: <span className="text-sm font-bold" style={{ color: GRADE_COLORS[analysisResult.grade] }}>{analysisResult.cleanbiScore}</span></span>
                          {analysisResult.cleanbiScore > 65 && (
                            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="benchmark-toggle" className="text-[10px] text-white/50 cursor-pointer">
                            vs Top Quartile
                          </Label>
                          <Switch
                            id="benchmark-toggle"
                            checked={showBenchmarkComparison}
                            onCheckedChange={setShowBenchmarkComparison}
                            className="scale-75 data-[state=checked]:bg-[#C8A661]"
                            data-testid="toggle-benchmark-comparison"
                          />
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Radar Chart Visualization */}
                    {userTier !== "free" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 rounded-lg p-3 mb-3 border border-white/5"
                        data-testid="radar-chart-container"
                      >
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              cx="50%"
                              cy="50%"
                              outerRadius="70%"
                              data={CLEANBI_CATEGORIES.map(cat => ({
                                category: cat.name.substring(0, 3),
                                fullName: cat.name,
                                score: categoryScores[cat.key] || 0,
                                benchmark: TOP_QUARTILE_BENCHMARKS[cat.key] || 85,
                                fullMark: 100
                              }))}
                            >
                              <PolarGrid 
                                stroke="rgba(255,255,255,0.1)" 
                                gridType="polygon"
                              />
                              <PolarAngleAxis 
                                dataKey="category" 
                                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                                tickLine={false}
                              />
                              <PolarRadiusAxis 
                                angle={90} 
                                domain={[0, 100]} 
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }}
                                tickCount={5}
                                axisLine={false}
                              />
                              {showBenchmarkComparison && (
                                <Radar
                                  name="Top Quartile"
                                  dataKey="benchmark"
                                  stroke="#C8A661"
                                  fill="#C8A661"
                                  fillOpacity={0.15}
                                  strokeWidth={1}
                                  strokeDasharray="4 4"
                                  data-testid="radar-benchmark"
                                />
                              )}
                              <Radar
                                name="Your Score"
                                dataKey="score"
                                stroke="#0A1628"
                                fill="#C8A661"
                                fillOpacity={0.4}
                                strokeWidth={2}
                                data-testid="radar-score"
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: '#0A1628',
                                  border: '1px solid rgba(200, 166, 97, 0.3)',
                                  borderRadius: '8px',
                                  padding: '8px 12px'
                                }}
                                labelStyle={{ color: '#C8A661', fontWeight: 'bold', fontSize: 12 }}
                                itemStyle={{ color: '#ffffff', fontSize: 11 }}
                                formatter={(value: number, name: string) => [
                                  `${value}/100`,
                                  name === "benchmark" ? "Top Quartile" : "Your Score"
                                ]}
                                labelFormatter={(label: string) => {
                                  const cat = CLEANBI_CATEGORIES.find(c => c.name.substring(0, 3) === label);
                                  return cat?.name || label;
                                }}
                              />
                              {showBenchmarkComparison && (
                                <Legend 
                                  wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                                  iconSize={8}
                                  formatter={(value: string) => (
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{value}</span>
                                  )}
                                />
                              )}
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        {showBenchmarkComparison && (
                          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-center gap-4 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-0.5 bg-[#C8A661]" />
                              <span className="text-white/50">Your Location</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-0.5 bg-[#C8A661]/50 border-dashed border-t border-[#C8A661]" />
                              <span className="text-white/50">A-Grade Benchmark</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* Factor Grid with Enhanced Cards */}
                    <div className="space-y-2">
                      {/* For free users: show first 2 subscores, blur the rest */}
                      {userTier === "free" ? (
                        <div className="relative">
                          {/* First 2 subscores visible with premium styling */}
                          {CLEANBI_CATEGORIES.slice(0, 2).map((cat, index) => {
                            const Icon = cat.icon;
                            const score = categoryScores[cat.key] || 0;
                            const gradeColor = GRADE_COLORS[score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "Needs Work"];
                            const interpretation = getScoreInterpretation(score);
                            const benchmarkDelta = score - TOP_QUARTILE_BENCHMARKS[cat.key];
                            return (
                              <Tooltip key={cat.key}>
                                <TooltipTrigger asChild>
                                  <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/5 rounded-lg p-3 mb-2 border border-white/5 hover:border-white/10 transition-colors cursor-help"
                                    data-testid={`score-factor-${cat.key}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <ProgressRing
                                        progress={score}
                                        size={44}
                                        strokeWidth={3}
                                        progressColor={gradeColor}
                                        trackColor="rgba(255,255,255,0.1)"
                                        animated={true}
                                      >
                                        <Icon className="w-4 h-4" style={{ color: gradeColor }} />
                                      </ProgressRing>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{cat.name}</span>
                                            <Info className="w-3 h-3 text-white/30" />
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-bold" style={{ color: gradeColor }}>
                                              <AnimatedNumber value={score} format="number" />
                                            </span>
                                            {benchmarkDelta >= 0 ? (
                                              <TrendingUp className="w-3 h-3 text-green-400" data-testid={`trend-up-${cat.key}`} />
                                            ) : (
                                              <TrendingDown className="w-3 h-3 text-orange-400" data-testid={`trend-down-${cat.key}`} />
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-[10px] text-[#C8A661] font-medium">{cat.getPlainLanguage(score)}</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">{cat.description}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[220px] bg-[#0A1628] border-[#C8A661]/30 p-3">
                                  <div className="space-y-2">
                                    <div className="font-semibold text-[#C8A661] text-sm">{cat.name} Score</div>
                                    <p className="text-xs text-white/70">{cat.tooltip}</p>
                                    <div className="pt-1 border-t border-white/10">
                                      <div className="text-[10px] text-white/50 mb-1">Factors analyzed:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {cat.factors.map((factor: string) => (
                                          <Badge key={factor} variant="outline" className="text-[9px] border-white/20 text-white/60">{factor}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                    {showBenchmarkComparison && (
                                      <div className="pt-1 text-[10px]">
                                        <span className="text-white/50">vs Top Quartile: </span>
                                        <span className={benchmarkDelta >= 0 ? "text-green-400" : "text-orange-400"}>
                                          {benchmarkDelta >= 0 ? "+" : ""}{benchmarkDelta} pts
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                          
                          {/* Blurred remaining subscores */}
                          <div className="relative">
                            <div className="blur-sm pointer-events-none opacity-40">
                              {CLEANBI_CATEGORIES.slice(2, 4).map((cat) => {
                                const Icon = cat.icon;
                                return (
                                  <div key={cat.key} className="bg-white/5 rounded-lg p-3 mb-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-white/50" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-white">{cat.name}</span>
                                          <span className="text-sm font-bold text-white/50">••</span>
                                        </div>
                                        <div className="h-1 bg-white/10 rounded mt-1.5" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Upgrade CTA Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-[#0f1d2f]/80 to-[#0f1d2f]/95 rounded-lg">
                              <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center p-4"
                              >
                                <div className="w-12 h-12 rounded-full bg-[#C8A661]/20 flex items-center justify-center mx-auto mb-3">
                                  <Lock className="w-5 h-5 text-[#C8A661]" />
                                </div>
                                <h4 className="text-white font-semibold text-sm mb-1">Unlock All 7 Factors + Radar</h4>
                                <p className="text-white/50 text-xs mb-3 max-w-[200px]">
                                  Equipment, Adaptability, Numbers, Brand & Intelligence scores with visual comparison
                                </p>
                                <Button 
                                  size="sm"
                                  className="bg-gradient-to-r from-[#C8A661] to-[#d4a030] hover:from-[#D8B66D] hover:to-[#C8A661] text-black font-medium shadow-lg"
                                  onClick={() => setShowUpgradeModal(true)}
                                  data-testid="button-unlock-subscores"
                                >
                                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                                  Unlock — $29/mo
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Full subscores for paid users with enhanced design */
                        CLEANBI_CATEGORIES.map((cat, index) => {
                          const Icon = cat.icon;
                          const score = categoryScores[cat.key] || 0;
                          const gradeColor = GRADE_COLORS[score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "Needs Work"];
                          const interpretation = getScoreInterpretation(score);
                          const benchmarkDelta = score - TOP_QUARTILE_BENCHMARKS[cat.key];
                          const isAboveAverage = score > 65;
                          return (
                            <Tooltip key={cat.key}>
                              <TooltipTrigger asChild>
                                <motion.div 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-[#C8A661]/30 transition-all duration-200 group cursor-help"
                                  data-testid={`score-factor-${cat.key}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <ProgressRing
                                      progress={score}
                                      size={44}
                                      strokeWidth={3}
                                      progressColor={gradeColor}
                                      trackColor="rgba(255,255,255,0.1)"
                                      animated={true}
                                    >
                                      <Icon className="w-4 h-4" style={{ color: gradeColor }} />
                                    </ProgressRing>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-white group-hover:text-[#C8A661] transition-colors">{cat.name}</span>
                                          <Info className="w-3 h-3 text-white/30 group-hover:text-[#C8A661]/50 transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-sm font-bold" style={{ color: gradeColor }}>
                                            <AnimatedNumber value={score} format="number" />
                                          </span>
                                          {benchmarkDelta >= 0 ? (
                                            <TrendingUp className="w-3 h-3 text-green-400" data-testid={`trend-up-${cat.key}`} />
                                          ) : (
                                            <TrendingDown className="w-3 h-3 text-orange-400" data-testid={`trend-down-${cat.key}`} />
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-[#C8A661] font-medium">{cat.getPlainLanguage(score)}</p>
                                        {showBenchmarkComparison && (
                                          <span className={`text-[9px] ${benchmarkDelta >= 0 ? "text-green-400" : "text-orange-400"}`} data-testid={`benchmark-delta-${cat.key}`}>
                                            {benchmarkDelta >= 0 ? "+" : ""}{benchmarkDelta} vs A-grade
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[9px] text-white/40 mt-0.5">{cat.description}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[220px] bg-[#0A1628] border-[#C8A661]/30 p-3">
                                <div className="space-y-2">
                                  <div className="font-semibold text-[#C8A661] text-sm">{cat.name} Score</div>
                                  <p className="text-xs text-white/70">{cat.tooltip}</p>
                                  <div className="pt-1 border-t border-white/10">
                                    <div className="text-[10px] text-white/50 mb-1">Factors analyzed:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {cat.factors.map((factor: string) => (
                                        <Badge key={factor} variant="outline" className="text-[9px] border-white/20 text-white/60">{factor}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="pt-1 text-[10px]">
                                    <span className="text-white/50">Top Quartile Target: </span>
                                    <span className="text-[#C8A661] font-medium">{TOP_QUARTILE_BENCHMARKS[cat.key]}</span>
                                    <span className={`ml-2 ${benchmarkDelta >= 0 ? "text-green-400" : "text-orange-400"}`}>
                                      ({benchmarkDelta >= 0 ? "+" : ""}{benchmarkDelta})
                                    </span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })
                      )}
                    </div>
                    
                    {/* Export Options - Premium Feature */}
                    {userTier !== "free" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4 pt-3 border-t border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/50">Export Analysis</span>
                          <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">Available</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="default"
                            variant="outline"
                            className="min-h-11 px-4 gap-2 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={() => toast({ title: "PDF Export", description: "Generating comprehensive PDF report..." })}
                            data-testid="button-export-pdf-score"
                          >
                            <FileText className="w-4 h-4" />
                            PDF Report
                          </Button>
                          <Button
                            size="default"
                            variant="outline"
                            className="min-h-11 px-4 gap-2 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={() => toast({ title: "CSV Export", description: "Generating raw data export..." })}
                            data-testid="button-export-csv-score"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            CSV Data
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>

                  {/* Competition Tab - Enhanced */}
                  <TabsContent value="compete" className="mt-0 space-y-3" data-testid="competition-tab-content">
                    {/* Competitive Gap Summary */}
                    {competitorMarketSummary && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-[#0A1628] to-[#0A1628]/80 rounded-lg p-3 border border-[#C8A661]/30"
                        data-testid="competitive-gap-summary"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-[#C8A661]" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-white">Market Analysis</span>
                              <div className="text-[10px] text-white/50">Competitor landscape</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold" style={{ 
                                color: competitorMarketSummary.opportunityLevel === "high" ? "#22C55E" : 
                                       competitorMarketSummary.opportunityLevel === "moderate" ? "#FBBF24" : "#EF4444" 
                              }}>
                                {competitorMarketSummary.opportunityScore.toFixed(0)}
                              </span>
                              <span className="text-[10px] text-white/40">/100</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] ${
                                competitorMarketSummary.opportunityLevel === "high" ? "border-green-500/30 text-green-400" :
                                competitorMarketSummary.opportunityLevel === "moderate" ? "border-yellow-500/30 text-yellow-400" :
                                "border-red-500/30 text-red-400"
                              }`}
                              data-testid="market-opportunity-badge"
                            >
                              {competitorMarketSummary.opportunityLevel === "high" ? "High Opportunity" :
                               competitorMarketSummary.opportunityLevel === "moderate" ? "Moderate" : "Competitive"}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          <div className="bg-white/5 rounded p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-base font-bold text-white">{competitorMarketSummary.avgRating.toFixed(1)}</span>
                            </div>
                            <div className="text-[9px] text-white/40">Avg Rating</div>
                          </div>
                          <div className="bg-green-500/10 rounded p-2 text-center border border-green-500/20">
                            <div className="text-base font-bold text-green-400">{competitorMarketSummary.lowRatedCount}</div>
                            <div className="text-[9px] text-white/40">&lt;3 Stars</div>
                          </div>
                          <div className="bg-yellow-500/10 rounded p-2 text-center border border-yellow-500/20">
                            <div className="text-base font-bold text-yellow-400">{competitorMarketSummary.mediumRatedCount}</div>
                            <div className="text-[9px] text-white/40">3-4 Stars</div>
                          </div>
                          <div className="bg-red-500/10 rounded p-2 text-center border border-red-500/20">
                            <div className="text-base font-bold text-red-400">{competitorMarketSummary.highRatedCount}</div>
                            <div className="text-[9px] text-white/40">4+ Stars</div>
                          </div>
                        </div>
                        
                        {/* Service Gaps */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-white/40">Gaps to exploit:</span>
                          {competitorMarketSummary.serviceGaps.map((gap, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-[9px] border-[#C8A661]/30 text-[#C8A661] bg-[#C8A661]/5"
                            >
                              <Lightbulb className="w-2.5 h-2.5 mr-1" />
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Filtering Controls */}
                    <div className="bg-white/5 rounded-lg p-2.5 border border-white/10" data-testid="competitor-filters">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-white/50 flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          Filter & Sort
                        </span>
                        <span className="text-[10px] text-white/30">({filteredCompetitors.length} of {competitors.length})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Rating Filter */}
                        <Select value={competitorRatingFilter} onValueChange={setCompetitorRatingFilter}>
                          <SelectTrigger 
                            className="h-8 text-[10px] bg-white/5 border-white/10 text-white"
                            data-testid="select-rating-filter"
                          >
                            <Star className="w-3 h-3 mr-1 text-yellow-400" />
                            <SelectValue placeholder="Rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="4plus">4+ Stars</SelectItem>
                            <SelectItem value="3plus">3+ Stars</SelectItem>
                            <SelectItem value="below3">&lt;3 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Distance Filter */}
                        <Select value={competitorDistanceFilter} onValueChange={setCompetitorDistanceFilter}>
                          <SelectTrigger 
                            className="h-8 text-[10px] bg-white/5 border-white/10 text-white"
                            data-testid="select-distance-filter"
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            <SelectValue placeholder="Distance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Distance</SelectItem>
                            <SelectItem value="1mi">Within 1 mi</SelectItem>
                            <SelectItem value="2mi">Within 2 mi</SelectItem>
                            <SelectItem value="3mi">Within 3 mi</SelectItem>
                            <SelectItem value="5mi">Within 5 mi</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Sort By */}
                        <Select value={competitorSortBy} onValueChange={setCompetitorSortBy}>
                          <SelectTrigger 
                            className="h-8 text-[10px] bg-white/5 border-white/10 text-white"
                            data-testid="select-sort-by"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <SelectValue placeholder="Sort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="distance">Nearest</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                            <SelectItem value="reviews">Most Reviews</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Enhanced Competitor Cards */}
                    <div className="space-y-2 max-h-72 overflow-y-auto" data-testid="competitor-list">
                      {competitors.length === 0 ? (
                        <div className="text-center py-6 text-white/40 text-sm">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <div className="font-medium text-green-400">No direct competitors found!</div>
                          <div className="text-[10px] mt-1">This area has low competition</div>
                        </div>
                      ) : filteredCompetitors.length === 0 ? (
                        <div className="text-center py-4 text-white/40 text-sm">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-400/50" />
                          <div>No competitors match your filters</div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="mt-2 text-[10px] text-[#C8A661]"
                            onClick={() => {
                              setCompetitorRatingFilter("all");
                              setCompetitorDistanceFilter("all");
                            }}
                            data-testid="button-clear-filters"
                          >
                            Clear Filters
                          </Button>
                        </div>
                      ) : (
                        filteredCompetitors.slice(0, 10).map((comp) => {
                          const sentiment = getCompetitorSentiment(comp.rating, comp.reviewCount);
                          const gaps = getCompetitorGaps(comp);
                          const SentimentIcon = sentiment.icon;
                          
                          return (
                            <motion.button
                              key={comp.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={() => analyzeCompetitor(comp)}
                              disabled={isAnalyzingCompetitor && selectedCompetitor?.id === comp.id}
                              className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all duration-200 border border-transparent hover:border-[#C8A661]/30 group"
                              data-testid={`card-competitor-${comp.id}`}
                            >
                              {/* Header Row */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-white text-sm truncate group-hover:text-[#C8A661] transition-colors">
                                    {comp.name}
                                  </div>
                                  {/* Sentiment Badge */}
                                  <div className="flex items-center gap-1 mt-1">
                                    <SentimentIcon className="w-3 h-3" style={{ color: sentiment.color }} />
                                    <span className="text-[10px]" style={{ color: sentiment.color }}>{sentiment.label}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  {isAnalyzingCompetitor && selectedCompetitor?.id === comp.id ? (
                                    <Loader2 className="w-4 h-4 text-[#C8A661] animate-spin" />
                                  ) : (
                                    <>
                                      <Target className="w-3.5 h-3.5 text-[#C8A661]" />
                                      <span className="text-[9px] text-[#C8A661]">Deep Dive</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {/* Rating Comparison Row */}
                              <div className="flex items-center gap-3 mb-2">
                                {/* Their Rating */}
                                <div className="flex items-center gap-1.5 bg-white/5 rounded px-2 py-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  <span className="text-sm font-bold text-white">{comp.rating.toFixed(1)}</span>
                                  <span className="text-[9px] text-white/40">({comp.reviewCount})</span>
                                </div>
                                
                                {/* Rating Bar Visual */}
                                <div className="flex-1">
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-300"
                                      style={{ 
                                        width: `${(comp.rating / 5) * 100}%`,
                                        backgroundColor: comp.rating >= 4 ? "#EF4444" : comp.rating >= 3 ? "#FBBF24" : "#22C55E"
                                      }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-0.5">
                                    <span className="text-[8px] text-white/30">Weak</span>
                                    <span className="text-[8px] text-white/30">Strong</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Distance & Drive Time Row */}
                              <div className="flex items-center gap-4 text-xs text-white/50 mb-2">
                                <span className="flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  {comp.distance.toFixed(1)} mi away
                                </span>
                                <span className="flex items-center gap-1">
                                  <Car className="w-3 h-3" />
                                  {getEstimatedDriveTime(comp.distance)}
                                </span>
                                {comp.priceLevel && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {"$".repeat(comp.priceLevel)}
                                  </span>
                                )}
                              </div>
                              
                              {/* Service Gap Indicators */}
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[9px] text-white/30">Gaps:</span>
                                {gaps.map((gap, idx) => (
                                  <Badge 
                                    key={idx}
                                    variant="outline" 
                                    className="text-[8px] py-0 h-4 border-green-500/20 text-green-400/80 bg-green-500/5"
                                  >
                                    {gap}
                                  </Badge>
                                ))}
                              </div>
                            </motion.button>
                          );
                        })
                      )}
                    </div>
                    
                    {/* Industry Standard Benchmarks */}
                    <Separator className="bg-white/10" />
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-1 group">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs text-white/50">Industry Benchmarks</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-white/30 group-data-[state=open]:rotate-180 transition-transform" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {Object.entries(INDUSTRY_BENCHMARKS).map(([key, bench]) => (
                            <div key={key} className="bg-white/5 rounded p-2 text-center">
                              <div className="text-sm font-bold text-[#C8A661]">{bench.min}-{bench.max}</div>
                              <div className="text-[10px] text-white/40">{bench.unit}</div>
                              <div className="text-[10px] text-white/60 truncate">{bench.label}</div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TabsContent>

                  {/* Financials Calculator Tab - Enhanced with Scenario Projections */}
                  <TabsContent value="financials" className="mt-0 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Calculator className="w-4 h-4 text-[#C8A661]" />
                        Financial Projections
                      </div>
                      {userTier === "free" ? (
                        <Badge className="text-[10px] bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                          <Lock className="w-2.5 h-2.5 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">Interactive</Badge>
                      )}
                    </div>
                    
                    {/* Premium Gate for Free Users */}
                    {userTier === "free" ? (
                      <div className="relative">
                        <div className="blur-sm pointer-events-none opacity-60">
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-3">
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-white">Scenario Projections</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-green-500/10 rounded p-2 text-center">
                                <div className="text-lg font-bold text-green-400">$540K</div>
                                <div className="text-[10px] text-white/50">Annual Rev</div>
                              </div>
                              <div className="bg-white/5 rounded p-2 text-center">
                                <div className="text-lg font-bold text-white">48.5%</div>
                                <div className="text-[10px] text-white/50">EBITDA</div>
                              </div>
                              <div className="bg-white/5 rounded p-2 text-center">
                                <div className="text-lg font-bold text-[#C8A661]">$2,845</div>
                                <div className="text-[10px] text-white/50">Monthly Pmt</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg backdrop-blur-[2px]">
                          <div className="text-center p-4">
                            <Lock className="w-8 h-8 text-[#C8A661] mx-auto mb-2" />
                            <h4 className="text-white font-semibold mb-1">Revenue Projections</h4>
                            <p className="text-white/60 text-xs mb-3">Get interactive scenario modeling & financing tools</p>
                            <Button 
                              size="sm"
                              className="bg-[#C8A661] hover:bg-[#d4a030] text-black font-medium"
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
                        {/* Section 1: Scenario Projections with Sliders */}
                        <div className="bg-[#0A1628] rounded-lg p-3 border border-[#C8A661]/20">
                          <div className="flex items-center gap-2 mb-3">
                            <LineChart className="w-4 h-4 text-[#C8A661]" />
                            <span className="text-sm font-medium text-white">Scenario Projections</span>
                          </div>
                          
                          {/* Vend Price Slider */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] text-white/60 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Vend Price
                              </label>
                              <span className="text-xs font-semibold text-[#C8A661]" data-testid="display-vend-price">
                                ${scenarioSliders.vendPrice.toFixed(2)}/load
                              </span>
                            </div>
                            <Slider
                              value={[scenarioSliders.vendPrice]}
                              onValueChange={([val]) => setScenarioSliders(s => ({...s, vendPrice: val}))}
                              min={3}
                              max={7}
                              step={0.25}
                              className="w-full"
                              data-testid="slider-vend-price"
                            />
                            <div className="flex justify-between text-[9px] text-white/40 mt-0.5">
                              <span>$3.00</span>
                              <span>$7.00</span>
                            </div>
                          </div>
                          
                          {/* Turns Per Day Slider */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] text-white/60 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                Turns Per Day
                              </label>
                              <span className="text-xs font-semibold text-[#C8A661]" data-testid="display-turns-per-day">
                                {scenarioSliders.turnsPerDay} turns
                              </span>
                            </div>
                            <Slider
                              value={[scenarioSliders.turnsPerDay]}
                              onValueChange={([val]) => setScenarioSliders(s => ({...s, turnsPerDay: val}))}
                              min={3}
                              max={10}
                              step={1}
                              className="w-full"
                              data-testid="slider-turns-per-day"
                            />
                            <div className="flex justify-between text-[9px] text-white/40 mt-0.5">
                              <span>3</span>
                              <span>10</span>
                            </div>
                          </div>
                          
                          {/* Machine Count Slider */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] text-white/60 flex items-center gap-1">
                                <WashingMachine className="w-3 h-3" />
                                Machine Count
                              </label>
                              <span className="text-xs font-semibold text-[#C8A661]" data-testid="display-machine-count">
                                {scenarioSliders.machineCount} machines
                              </span>
                            </div>
                            <Slider
                              value={[scenarioSliders.machineCount]}
                              onValueChange={([val]) => setScenarioSliders(s => ({...s, machineCount: val}))}
                              min={10}
                              max={100}
                              step={5}
                              className="w-full"
                              data-testid="slider-machine-count"
                            />
                            <div className="flex justify-between text-[9px] text-white/40 mt-0.5">
                              <span>10</span>
                              <span>100</span>
                            </div>
                          </div>
                          
                          {/* Operating Hours Slider */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] text-white/60 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Operating Hours
                              </label>
                              <span className="text-xs font-semibold text-[#C8A661]" data-testid="display-operating-hours">
                                {scenarioSliders.operatingHours} hrs/day
                              </span>
                            </div>
                            <Slider
                              value={[scenarioSliders.operatingHours]}
                              onValueChange={([val]) => setScenarioSliders(s => ({...s, operatingHours: val}))}
                              min={12}
                              max={24}
                              step={1}
                              className="w-full"
                              data-testid="slider-operating-hours"
                            />
                            <div className="flex justify-between text-[9px] text-white/40 mt-0.5">
                              <span>12h</span>
                              <span>24h</span>
                            </div>
                          </div>
                          
                          <Separator className="bg-white/10 my-3" />
                          
                          {/* Revenue Projections Results */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/5 rounded p-2 text-center">
                              <div className="text-[10px] text-white/50">Daily</div>
                              <div className="text-sm font-bold text-white" data-testid="display-daily-revenue">
                                ${scenarioProjections.dailyRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </div>
                            </div>
                            <div className="bg-white/5 rounded p-2 text-center">
                              <div className="text-[10px] text-white/50">Monthly</div>
                              <div className="text-sm font-bold text-white" data-testid="display-monthly-revenue">
                                ${(scenarioProjections.monthlyRevenue / 1000).toFixed(1)}K
                              </div>
                            </div>
                            <div className="bg-[#C8A661]/20 rounded p-2 text-center border border-[#C8A661]/30">
                              <div className="text-[10px] text-[#C8A661]">Annual</div>
                              <div className="text-sm font-bold text-[#C8A661]" data-testid="display-annual-revenue">
                                ${(scenarioProjections.annualRevenue / 1000).toFixed(0)}K
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Section 2: Expense Breakdown */}
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
                            <div className="flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-[#C8A661]" />
                              <span className="text-sm font-medium text-white">Expense Breakdown</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-2">
                              {/* Expense Items */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Bolt className="w-3 h-3 text-yellow-400" />
                                    <span className="text-[11px] text-white/70">Utilities</span>
                                    <span className="text-[9px] text-white/40">(15-20%)</span>
                                  </div>
                                  <span className="text-xs font-medium text-white" data-testid="display-expense-utilities">
                                    ${(scenarioProjections.expenses.utilities / 1000).toFixed(1)}K
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-3 h-3 text-blue-400" />
                                    <span className="text-[11px] text-white/70">Labor</span>
                                    <span className="text-[9px] text-white/40">(10-15%)</span>
                                  </div>
                                  <span className="text-xs font-medium text-white" data-testid="display-expense-labor">
                                    ${(scenarioProjections.expenses.labor / 1000).toFixed(1)}K
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-3 h-3 text-purple-400" />
                                    <span className="text-[11px] text-white/70">Rent</span>
                                    <span className="text-[9px] text-white/40">(10-12%)</span>
                                  </div>
                                  <span className="text-xs font-medium text-white" data-testid="display-expense-rent">
                                    ${(scenarioProjections.expenses.rent / 1000).toFixed(1)}K
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Wrench className="w-3 h-3 text-orange-400" />
                                    <span className="text-[11px] text-white/70">Maintenance</span>
                                    <span className="text-[9px] text-white/40">(3-5%)</span>
                                  </div>
                                  <span className="text-xs font-medium text-white" data-testid="display-expense-maintenance">
                                    ${(scenarioProjections.expenses.maintenance / 1000).toFixed(1)}K
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Receipt className="w-3 h-3 text-gray-400" />
                                    <span className="text-[11px] text-white/70">Other</span>
                                    <span className="text-[9px] text-white/40">(5-8%)</span>
                                  </div>
                                  <span className="text-xs font-medium text-white" data-testid="display-expense-other">
                                    ${(scenarioProjections.expenses.other / 1000).toFixed(1)}K
                                  </span>
                                </div>
                              </div>
                              
                              <Separator className="bg-white/10 my-2.5" />
                              
                              {/* EBITDA Summary */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white/5 rounded p-2">
                                  <div className="text-[10px] text-white/50">Total Expenses</div>
                                  <div className="text-sm font-semibold text-white" data-testid="display-total-expenses">
                                    ${(scenarioProjections.totalExpenses / 1000).toFixed(0)}K
                                    <span className="text-[10px] text-white/40 ml-1">
                                      ({scenarioProjections.expensePercentage.toFixed(0)}%)
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                                  <div className="text-[10px] text-green-400">EBITDA</div>
                                  <div className="text-sm font-semibold text-green-400" data-testid="display-ebitda">
                                    ${(scenarioProjections.ebitda / 1000).toFixed(0)}K
                                    <span className="text-[10px] text-green-400/70 ml-1">
                                      ({scenarioProjections.ebitdaMargin.toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        {/* Section 3: Financing Calculator */}
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4 text-[#C8A661]" />
                              <span className="text-sm font-medium text-white">Financing Calculator</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-2">
                              {/* Loan Amount Input */}
                              <div className="mb-3">
                                <label className="text-[10px] text-white/60 block mb-1.5">Loan Amount</label>
                                <div className="relative">
                                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                                  <Input
                                    type="number"
                                    value={financingCalc.loanAmount}
                                    onChange={(e) => setFinancingCalc(f => ({...f, loanAmount: Number(e.target.value)}))}
                                    className="pl-7 h-9 text-sm bg-white/10 border-white/20 text-white"
                                    data-testid="input-loan-amount"
                                  />
                                </div>
                              </div>
                              
                              {/* Interest Rate Slider */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-[10px] text-white/60">Interest Rate</label>
                                  <span className="text-xs font-semibold text-[#C8A661]" data-testid="display-interest-rate">
                                    {financingCalc.interestRate.toFixed(1)}%
                                  </span>
                                </div>
                                <Slider
                                  value={[financingCalc.interestRate]}
                                  onValueChange={([val]) => setFinancingCalc(f => ({...f, interestRate: val}))}
                                  min={6}
                                  max={12}
                                  step={0.25}
                                  className="w-full"
                                  data-testid="slider-interest-rate"
                                />
                                <div className="flex justify-between text-[9px] text-white/40 mt-0.5">
                                  <span>6%</span>
                                  <span>12%</span>
                                </div>
                              </div>
                              
                              {/* Loan Term Selector */}
                              <div className="mb-3">
                                <label className="text-[10px] text-white/60 block mb-1.5">Loan Term</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[5, 7, 10].map(term => (
                                    <button
                                      key={term}
                                      onClick={() => setFinancingCalc(f => ({...f, loanTerm: term}))}
                                      className={`py-2 rounded text-xs font-medium transition-colors ${
                                        financingCalc.loanTerm === term
                                          ? 'bg-[#C8A661] text-[#0A1628]'
                                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                                      }`}
                                      data-testid={`button-term-${term}`}
                                    >
                                      {term} Years
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              <Separator className="bg-white/10 my-3" />
                              
                              {/* Monthly Payment Result */}
                              <div className="bg-[#C8A661]/10 rounded-lg p-3 border border-[#C8A661]/30 text-center">
                                <div className="text-[10px] text-[#C8A661] mb-1">Estimated Monthly Payment</div>
                                <div className="text-2xl font-bold text-[#C8A661]" data-testid="display-monthly-payment">
                                  ${monthlyPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </div>
                                <div className="text-[10px] text-white/50 mt-1">
                                  Total: ${(monthlyPayment * financingCalc.loanTerm * 12).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </div>
                              </div>
                              
                              {/* DSCR Indicator */}
                              {scenarioProjections.ebitda > 0 && (
                                <div className="mt-2 bg-white/5 rounded p-2 text-center">
                                  <div className="text-[10px] text-white/50">Debt Service Coverage Ratio</div>
                                  <div className={`text-sm font-bold ${
                                    (scenarioProjections.ebitda / (monthlyPayment * 12)) >= 1.25 
                                      ? 'text-green-400' 
                                      : (scenarioProjections.ebitda / (monthlyPayment * 12)) >= 1.0 
                                        ? 'text-yellow-400' 
                                        : 'text-red-400'
                                  }`} data-testid="display-dscr">
                                    {(scenarioProjections.ebitda / (monthlyPayment * 12)).toFixed(2)}x
                                  </div>
                                  <div className="text-[9px] text-white/40">
                                    {(scenarioProjections.ebitda / (monthlyPayment * 12)) >= 1.25 
                                      ? 'Strong coverage' 
                                      : (scenarioProjections.ebitda / (monthlyPayment * 12)) >= 1.0 
                                        ? 'Adequate coverage' 
                                        : 'Below threshold'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    )}

                    {/* Export CTA */}
                    {userTier !== "free" && analysisResult ? (
                      <Button 
                        variant="outline" 
                        className="w-full h-9 text-xs border-[#C8A661]/30 text-[#C8A661] hover:bg-[#C8A661]/10"
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
                                annualRevenue: scenarioProjections.annualRevenue,
                                operatingExpenses: scenarioProjections.totalExpenses,
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
                        className="w-full h-9 text-xs border-[#C8A661]/30 text-[#C8A661] hover:bg-[#C8A661]/10"
                        onClick={() => setShowUpgradeModal(true)}
                        data-testid="button-calc-upgrade"
                      >
                        <Crown className="w-3 h-3 mr-1.5" />
                        Export to Google Sheets — Pro Feature
                      </Button>
                    )}
                  </TabsContent>

                  {/* Deal Scorer Tab - Enhanced Due Diligence Checklist */}
                  <TabsContent value="deal" className="mt-0 space-y-3" data-testid="deal-tab-content">
                    {/* Section Header */}
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                      <Scale className="w-4 h-4 text-[#C8A661]" />
                      <span>Due Diligence Checklist</span>
                      <Badge variant="outline" className="text-[9px] border-[#C8A661]/30 text-[#C8A661] ml-auto">
                        {(() => {
                          const checks = [
                            analysisResult.cleanbiScore >= 70,
                            analysisResult.competitorCount < 5,
                            analysisResult.medianIncome >= 50000,
                            analysisResult.trafficScore >= 60,
                            !analysisResult.walkScore || analysisResult.walkScore >= 50,
                            analysisResult.opportunityLevel !== "oversaturated"
                          ];
                          const passed = checks.filter(Boolean).length;
                          return `${passed}/6 Passed`;
                        })()}
                      </Badge>
                    </div>

                    {/* Due Diligence Checklist */}
                    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden" data-testid="due-diligence-checklist">
                      {/* Location Score Check */}
                      <div className="flex items-start gap-3 p-3 border-b border-white/5" data-testid="checklist-location-score">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          analysisResult.cleanbiScore >= 70 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {analysisResult.cleanbiScore >= 70 
                            ? <Check className="w-3 h-3" />
                            : <X className="w-3 h-3" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white">Location Score</span>
                            <span className={`text-xs font-semibold ${
                              analysisResult.cleanbiScore >= 70 ? "text-green-400" : "text-red-400"
                            }`}>
                              {analysisResult.cleanbiScore}/100
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">
                            {analysisResult.cleanbiScore >= 70 
                              ? "CLEANBI score meets minimum threshold (≥70)" 
                              : "Score below recommended threshold (70)"}
                          </p>
                        </div>
                      </div>

                      {/* Competition Level */}
                      <div className="flex items-start gap-3 p-3 border-b border-white/5" data-testid="checklist-competition">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          analysisResult.competitorCount < 5 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {analysisResult.competitorCount < 5 
                            ? <Check className="w-3 h-3" />
                            : <X className="w-3 h-3" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white">Competition Level</span>
                            <span className={`text-xs font-semibold ${
                              analysisResult.competitorCount < 5 ? "text-green-400" : "text-red-400"
                            }`}>
                              {analysisResult.competitorCount} nearby
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">
                            {analysisResult.competitorCount < 5 
                              ? "Low competition within 2mi radius (&lt;5)" 
                              : `High competition: ${analysisResult.competitorCount} competitors within 2mi`}
                          </p>
                        </div>
                      </div>

                      {/* Demographics Check */}
                      <div className="flex items-start gap-3 p-3 border-b border-white/5" data-testid="checklist-demographics">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          analysisResult.medianIncome >= 50000 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {analysisResult.medianIncome >= 50000 
                            ? <Check className="w-3 h-3" />
                            : <X className="w-3 h-3" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white">Demographics</span>
                            <span className={`text-xs font-semibold ${
                              analysisResult.medianIncome >= 50000 ? "text-green-400" : "text-red-400"
                            }`}>
                              ${(analysisResult.medianIncome / 1000).toFixed(0)}K income
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">
                            {analysisResult.medianIncome >= 50000 
                              ? "Median household income meets threshold (≥$50K)" 
                              : "Below recommended income threshold ($50K)"}
                          </p>
                        </div>
                      </div>

                      {/* Traffic Score */}
                      <div className="flex items-start gap-3 p-3 border-b border-white/5" data-testid="checklist-traffic">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          analysisResult.trafficScore >= 60 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {analysisResult.trafficScore >= 60 
                            ? <Check className="w-3 h-3" />
                            : <X className="w-3 h-3" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white">Traffic Score</span>
                            <span className={`text-xs font-semibold ${
                              analysisResult.trafficScore >= 60 ? "text-green-400" : "text-red-400"
                            }`}>
                              {analysisResult.trafficScore}/100
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">
                            {analysisResult.trafficScore >= 60 
                              ? "Good foot/vehicle traffic potential (≥60)" 
                              : "Traffic score below threshold (60)"}
                          </p>
                        </div>
                      </div>

                      {/* Walk Score */}
                      <div className="flex items-start gap-3 p-3 border-b border-white/5" data-testid="checklist-walkscore">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          !analysisResult.walkScore || analysisResult.walkScore >= 50 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {!analysisResult.walkScore || analysisResult.walkScore >= 50 
                            ? <Check className="w-3 h-3" />
                            : <X className="w-3 h-3" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white">Walk Score</span>
                            <span className={`text-xs font-semibold ${
                              !analysisResult.walkScore || analysisResult.walkScore >= 50 ? "text-green-400" : "text-red-400"
                            }`}>
                              {analysisResult.walkScore ? `${analysisResult.walkScore}/100` : "N/A"}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">
                            {!analysisResult.walkScore 
                              ? "Walk score data not available (passes by default)"
                              : analysisResult.walkScore >= 50 
                                ? "Walkable area attracts foot traffic (≥50)" 
                                : "Below walkability threshold (50)"}
                          </p>
                        </div>
                      </div>

                      {/* Market Saturation */}
                      <div className="flex items-start gap-3 p-3" data-testid="checklist-saturation">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          analysisResult.opportunityLevel !== "oversaturated" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {analysisResult.opportunityLevel !== "oversaturated" 
                            ? <Check className="w-3 h-3" />
                            : <X className="w-3 h-3" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white">Market Saturation</span>
                            <span className={`text-xs font-semibold capitalize ${
                              analysisResult.opportunityLevel !== "oversaturated" ? "text-green-400" : "text-red-400"
                            }`}>
                              {analysisResult.opportunityLevel.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">
                            {analysisResult.opportunityLevel !== "oversaturated" 
                              ? "Market has room for growth" 
                              : "Market is oversaturated - requires differentiation"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Valuation vs Asking Price Comparison */}
                    <div className="bg-gradient-to-br from-[#0A1628]/50 to-transparent rounded-lg p-4 border border-[#C8A661]/20" data-testid="valuation-comparison">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-4 h-4 text-[#C8A661]" />
                        <span className="text-sm font-medium text-white">Valuation Comparison</span>
                      </div>
                      
                      {/* Asking Price Input */}
                      <div className="mb-4">
                        <label className="text-xs text-white/60 block mb-2">Enter Asking Price</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <Input
                            type="number"
                            value={calcValues.askingPrice || ""}
                            onChange={(e) => setCalcValues(v => ({...v, askingPrice: Number(e.target.value)}))}
                            placeholder="0"
                            className="pl-8 h-12 text-xl font-bold bg-white/10 border-white/20 text-white placeholder:text-white/30"
                            data-testid="input-asking-price"
                          />
                        </div>
                      </div>

                      {/* Fair Market Value Range */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-xs text-white/50 mb-1">Low Est.</div>
                          <div className="text-sm font-bold text-white">
                            ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 2.0 / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div className="bg-[#C8A661]/10 rounded-lg p-2 text-center border border-[#C8A661]/30">
                          <div className="text-xs text-[#C8A661] mb-1">Fair Value</div>
                          <div className="text-sm font-bold text-[#C8A661]">
                            ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 2.5 / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-xs text-white/50 mb-1">High Est.</div>
                          <div className="text-sm font-bold text-white">
                            ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 3.0 / 1000).toFixed(0)}K
                          </div>
                        </div>
                      </div>

                      {/* Deal Rating */}
                      {calcValues.askingPrice > 0 && (
                        <div className={`rounded-lg p-3 border ${
                          dealVerdict === "buy" ? "bg-green-500/10 border-green-500/30" :
                          dealVerdict === "negotiate" ? "bg-yellow-500/10 border-yellow-500/30" :
                          "bg-red-500/10 border-red-500/30"
                        }`} data-testid="deal-rating">
                          <div className="flex items-center gap-3">
                            {dealVerdict === "buy" && <ThumbsUp className="w-6 h-6 text-green-400" />}
                            {dealVerdict === "negotiate" && <Scale className="w-6 h-6 text-yellow-400" />}
                            {dealVerdict === "overpriced" && <ThumbsDown className="w-6 h-6 text-red-400" />}
                            <div className="flex-1">
                              <div className={`text-base font-bold ${
                                dealVerdict === "buy" ? "text-green-400" :
                                dealVerdict === "negotiate" ? "text-yellow-400" :
                                "text-red-400"
                              }`}>
                                {dealVerdict === "buy" && "Great Deal"}
                                {dealVerdict === "negotiate" && "Fair Price"}
                                {dealVerdict === "overpriced" && "Overpriced"}
                              </div>
                              <div className="text-xs text-white/60">
                                {dealVerdict === "buy" && "Asking price is below fair market value"}
                                {dealVerdict === "negotiate" && "Price is within fair value range - room to negotiate"}
                                {dealVerdict === "overpriced" && "Asking price exceeds estimated fair value"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-white/50">Target Offer</div>
                              <div className="text-sm font-bold text-[#C8A661]">
                                ${((calcValues.annualRevenue - calcValues.operatingExpenses) * 2.2 / 1000).toFixed(0)}K
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2" data-testid="quick-actions">
                      <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                        <Zap className="w-3 h-3" />
                        <span>Quick Actions</span>
                      </div>
                      
                      {/* Request Property Report */}
                      <Button 
                        variant="outline" 
                        className="w-full h-10 text-xs border-[#C8A661]/30 text-[#C8A661] hover:bg-[#C8A661]/10 justify-start gap-2"
                        onClick={() => setShowUpgradeModal(true)}
                        data-testid="button-request-property-report"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="flex-1 text-left">Request Property Report</span>
                        <Crown className="w-3 h-3 text-[#C8A661]/60" />
                      </Button>
                      
                      {/* Schedule Consultation */}
                      <Button 
                        variant="outline" 
                        className="w-full h-10 text-xs border-[#0A1628]/50 text-white hover:bg-white/10 justify-start gap-2"
                        onClick={() => setLocation("/consultation")}
                        data-testid="button-schedule-consultation"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="flex-1 text-left">Schedule Consultation</span>
                        <ArrowRight className="w-3 h-3 text-white/40" />
                      </Button>
                      
                      {/* Save Analysis */}
                      <Button 
                        className="w-full h-10 text-xs bg-[#0A1628] hover:bg-[#1a3a5c] text-white justify-start gap-2"
                        onClick={() => {
                          const saved = saveAnalysis(analysisResult);
                          setSavedAnalyses(getStoredAnalyses());
                          toast({ title: "Analysis Saved", description: "You can access this in your saved analyses." });
                        }}
                        data-testid="button-save-analysis"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        <span className="flex-1 text-left">Save Analysis</span>
                        <Check className="w-3 h-3 text-green-400" />
                      </Button>
                      
                      {/* Share Analysis */}
                      <Button 
                        variant="outline" 
                        className="w-full h-10 text-xs border-white/20 text-white hover:bg-white/10 justify-start gap-2"
                        onClick={shareAnalysis}
                        data-testid="button-share-deal"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="flex-1 text-left">Share Analysis Link</span>
                      </Button>
                      
                      {/* Export PDF */}
                      {userTier !== "free" && analysisResult ? (
                        <Button 
                          className="w-full h-10 text-xs bg-gradient-to-r from-[#C8A661] to-[#B8964F] text-[#0A1628] font-semibold justify-start gap-2"
                          onClick={async () => {
                            try {
                              toast({ title: "Generating PDF...", description: "Creating your analysis report..." });
                              const { default: jsPDF } = await import("jspdf");
                              const doc = new jsPDF();
                              const noi = calcValues.annualRevenue - calcValues.operatingExpenses;
                              const fairValue = noi * 2.5;
                              
                              doc.setFontSize(20);
                              doc.setTextColor(10, 22, 40);
                              doc.text("CLEANBI™ Due Diligence Report", 20, 25);
                              
                              doc.setFontSize(12);
                              doc.setTextColor(100, 100, 100);
                              doc.text(analysisResult.address, 20, 35);
                              doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
                              
                              doc.setFillColor(200, 166, 97);
                              doc.rect(150, 15, 40, 30, "F");
                              doc.setFontSize(24);
                              doc.setTextColor(255, 255, 255);
                              doc.text(analysisResult.grade, 162, 32);
                              doc.setFontSize(10);
                              doc.text(`Score: ${analysisResult.cleanbiScore}`, 155, 40);
                              
                              doc.setFontSize(14);
                              doc.setTextColor(10, 22, 40);
                              doc.text("Due Diligence Checklist", 20, 60);
                              doc.setFontSize(11);
                              doc.setTextColor(60, 60, 60);
                              
                              const checks = [
                                { label: "Location Score", pass: analysisResult.cleanbiScore >= 70, value: `${analysisResult.cleanbiScore}/100` },
                                { label: "Competition Level", pass: analysisResult.competitorCount < 5, value: `${analysisResult.competitorCount} nearby` },
                                { label: "Demographics", pass: analysisResult.medianIncome >= 50000, value: `$${(analysisResult.medianIncome/1000).toFixed(0)}K` },
                                { label: "Traffic Score", pass: analysisResult.trafficScore >= 60, value: `${analysisResult.trafficScore}/100` },
                                { label: "Walk Score", pass: !analysisResult.walkScore || analysisResult.walkScore >= 50, value: analysisResult.walkScore ? `${analysisResult.walkScore}/100` : "N/A" },
                                { label: "Market Saturation", pass: analysisResult.opportunityLevel !== "oversaturated", value: analysisResult.opportunityLevel }
                              ];
                              
                              checks.forEach((check, i) => {
                                const status = check.pass ? "✓ PASS" : "✗ FAIL";
                                doc.setTextColor(check.pass ? 34 : 239, check.pass ? 197 : 68, check.pass ? 94 : 68);
                                doc.text(`${status} - ${check.label}: ${check.value}`, 25, 70 + (i * 8));
                              });
                              
                              doc.setFontSize(14);
                              doc.setTextColor(10, 22, 40);
                              doc.text("Financial Analysis", 20, 130);
                              doc.setFontSize(11);
                              doc.setTextColor(60, 60, 60);
                              doc.text(`Annual Revenue: $${calcValues.annualRevenue.toLocaleString()}`, 25, 140);
                              doc.text(`Operating Expenses: $${calcValues.operatingExpenses.toLocaleString()}`, 25, 148);
                              doc.text(`NOI: $${noi.toLocaleString()}`, 25, 156);
                              doc.text(`Fair Market Value: $${Math.round(fairValue).toLocaleString()}`, 25, 164);
                              
                              if (calcValues.askingPrice > 0) {
                                doc.setFontSize(14);
                                doc.setTextColor(10, 22, 40);
                                doc.text("Deal Analysis", 20, 185);
                                doc.setFontSize(11);
                                doc.text(`Asking Price: $${calcValues.askingPrice.toLocaleString()}`, 25, 195);
                                const verdictText = dealVerdict === "buy" ? "GREAT DEAL" : dealVerdict === "negotiate" ? "FAIR PRICE" : "OVERPRICED";
                                const verdictColor = dealVerdict === "buy" ? [34, 197, 94] : dealVerdict === "negotiate" ? [234, 179, 8] : [239, 68, 68];
                                doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
                                doc.text(`Verdict: ${verdictText}`, 25, 203);
                              }
                              
                              doc.setFontSize(9);
                              doc.setTextColor(150, 150, 150);
                              doc.text("Generated by WashBizHub.com - CLEANBI™ Proprietary Technology", 20, 280);
                              
                              doc.save(`CLEANBI_DueDiligence_${analysisResult.address.replace(/[^a-z0-9]/gi, "_")}.pdf`);
                              toast({ title: "PDF Downloaded!", description: "Your due diligence report has been saved." });
                            } catch (err) {
                              console.error("PDF Error:", err);
                              toast({ title: "PDF Error", description: "Could not generate PDF", variant: "destructive" });
                            }
                          }}
                          data-testid="button-export-pdf"
                        >
                          <Download className="w-4 h-4" />
                          <span className="flex-1 text-left">Export Due Diligence Report (PDF)</span>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          className="w-full h-10 text-xs border-[#C8A661]/30 text-[#C8A661] hover:bg-[#C8A661]/10 justify-start gap-2"
                          onClick={() => setShowUpgradeModal(true)}
                          data-testid="button-export-upgrade"
                        >
                          <Lock className="w-4 h-4" />
                          <span className="flex-1 text-left">Export Report — Pro Feature</span>
                          <Crown className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  {/* AI Insights Tab */}
                  <TabsContent value="insights" className="mt-0" data-testid="insights-tab-content">
                    {/* AI-Curated Action Board Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0A1628] flex items-center justify-center">
                          <Brain className="w-4 h-4 text-[#C8A661]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">AI Action Board</h3>
                          <p className="text-[10px] text-white/50">Data-driven insights for your location</p>
                        </div>
                      </div>
                      <Badge 
                        className="text-[9px] bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30"
                        data-testid="badge-ai-powered"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI-Powered
                      </Badge>
                    </div>

                    {/* AI Summary Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-[#C8A661]/10 to-transparent rounded-lg p-4 border border-[#C8A661]/20 mb-4"
                      data-testid="ai-summary-card"
                    >
                      <p className="text-sm text-white/90 leading-relaxed">
                        {generateAINarrative(analysisResult, competitors)}
                      </p>
                    </motion.div>

                    {/* TOP OPPORTUNITIES SECTION */}
                    <div className="mb-5" data-testid="opportunities-section">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center">
                          <Lightbulb className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Top Opportunities</h4>
                        <Badge 
                          variant="outline" 
                          className="text-[9px] border-green-500/30 text-green-400 ml-auto"
                          data-testid="badge-opportunity-count"
                        >
                          {generateInsightsOpportunities(analysisResult).length} Found
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {generateInsightsOpportunities(analysisResult).length > 0 ? (
                          generateInsightsOpportunities(analysisResult).map((opp, index) => {
                            const Icon = opp.icon;
                            return (
                              <motion.div
                                key={opp.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`rounded-lg p-3 border transition-colors ${
                                  opp.priority === "high" 
                                    ? "bg-green-500/10 border-green-500/30 hover:border-green-500/50" 
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                }`}
                                data-testid={`opportunity-card-${opp.id}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    opp.priority === "high" ? "bg-green-500/20" : "bg-[#C8A661]/20"
                                  }`}>
                                    <Icon className={`w-4 h-4 ${opp.priority === "high" ? "text-green-400" : "text-[#C8A661]"}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-white">{opp.title}</span>
                                      {opp.priority === "high" && (
                                        <Badge className="text-[8px] bg-green-500/30 text-green-300 border-0 px-1.5 py-0">
                                          High Priority
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-white/60 mb-1.5">{opp.description}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-[#C8A661]">
                                      <ArrowRight className="w-3 h-3" />
                                      <span>{opp.actionText}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-white/40 text-sm">
                            <Lightbulb className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p>No major opportunities identified</p>
                            <p className="text-xs">Consider analyzing nearby locations</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RISK ALERTS SECTION */}
                    <div className="mb-5" data-testid="risks-section">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Risk Alerts</h4>
                        {generateInsightsRisks(analysisResult).length > 0 && (
                          <Badge 
                            variant="outline" 
                            className="text-[9px] border-amber-500/30 text-amber-400 ml-auto"
                            data-testid="badge-risk-count"
                          >
                            {generateInsightsRisks(analysisResult).length} Alert{generateInsightsRisks(analysisResult).length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        {generateInsightsRisks(analysisResult).length > 0 ? (
                          generateInsightsRisks(analysisResult).map((risk, index) => {
                            const Icon = risk.icon;
                            return (
                              <motion.div
                                key={risk.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`rounded-lg p-3 border transition-colors ${
                                  risk.severity === "high" 
                                    ? "bg-red-500/10 border-red-500/30 hover:border-red-500/50" 
                                    : "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
                                }`}
                                data-testid={`risk-card-${risk.id}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    risk.severity === "high" ? "bg-red-500/20" : "bg-amber-500/20"
                                  }`}>
                                    <Icon className={`w-4 h-4 ${risk.severity === "high" ? "text-red-400" : "text-amber-400"}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-white">{risk.title}</span>
                                      <Badge 
                                        className={`text-[8px] border-0 px-1.5 py-0 ${
                                          risk.severity === "high" 
                                            ? "bg-red-500/30 text-red-300" 
                                            : "bg-amber-500/30 text-amber-300"
                                        }`}
                                      >
                                        {risk.severity === "high" ? "Caution" : "Monitor"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-white/60 mb-2">{risk.description}</p>
                                    <div className="bg-white/5 rounded-md p-2 border border-white/10">
                                      <div className="flex items-start gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                                        <div>
                                          <span className="text-[10px] text-white/40 uppercase tracking-wide">Mitigation</span>
                                          <p className="text-xs text-white/80">{risk.mitigation}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-400" />
                            <p className="text-sm text-green-300 font-medium">No Major Risks Identified</p>
                            <p className="text-xs text-white/50 mt-1">This location shows strong fundamentals</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TIER-BASED UPSELL */}
                    {userTier === "free" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#0A1628] to-[#1a3a5c] rounded-lg p-4 border border-[#C8A661]/30"
                        data-testid="insights-upgrade-prompt"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#C8A661]/20 flex items-center justify-center shrink-0">
                            <Crown className="w-5 h-5 text-[#C8A661]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-1">Unlock Deep Market Analysis</h4>
                            <p className="text-xs text-white/60 mb-3">
                              Get AI-powered recommendations, competitor strategies, and revenue projections with Pro.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-[9px] border-[#C8A661]/30 text-[#C8A661]">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                Market Projections
                              </Badge>
                              <Badge variant="outline" className="text-[9px] border-[#C8A661]/30 text-[#C8A661]">
                                <Target className="w-3 h-3 mr-1" />
                                Competitor Intel
                              </Badge>
                              <Badge variant="outline" className="text-[9px] border-[#C8A661]/30 text-[#C8A661]">
                                <Brain className="w-3 h-3 mr-1" />
                                AI Strategies
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-medium"
                              onClick={() => setShowUpgradeModal(true)}
                              data-testid="button-insights-upgrade"
                            >
                              <Unlock className="w-3.5 h-3.5 mr-1.5" />
                              Upgrade to Pro — $99/mo
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Starter tier upsell - more subtle */}
                    {userTier === "starter" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-3 border border-white/10 mt-4"
                        data-testid="insights-starter-upgrade"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#C8A661]" />
                            <span className="text-xs text-white/70">Want AI strategy recommendations?</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] border-[#C8A661]/30 text-[#C8A661] hover:bg-[#C8A661]/10"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid="button-insights-starter-upgrade"
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            Upgrade
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Pro/Enterprise - Additional AI Insights */}
                    {(userTier === "pro" || userTier === "enterprise") && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-lg p-4 border border-[#8B5CF6]/30 mt-4"
                        data-testid="pro-insights-extras"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                          <span className="text-xs font-semibold text-white">AI Strategic Recommendation</span>
                          <Badge className="text-[8px] bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30">Pro</Badge>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {analysisResult.grade === "A" 
                            ? "This is a prime acquisition target. Consider acting quickly and be prepared to pay asking price or above for quality locations with these metrics."
                            : analysisResult.grade === "B"
                            ? "Strong fundamentals present. Focus negotiations on equipment condition and lease terms. A 10-15% discount from asking price is reasonable to pursue."
                            : "Value-add opportunity identified. This location could benefit from equipment upgrades, extended hours, or service diversification to improve returns."
                          }
                        </p>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Need help? Ask our AI consultant</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px] text-[#8B5CF6] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 px-2"
                              onClick={() => setActiveTab("overview")}
                              data-testid="button-ask-ai-consultant"
                            >
                              Open Chat
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
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
                            className="min-h-11 text-[10px] sm:text-xs border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 w-full sm:w-auto"
                            onClick={() => setShowAddEquipmentModal(true)}
                            data-testid="button-add-equipment"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Equipment
                          </Button>
                        </div>

                        {/* Preset Templates Section */}
                        {valuatorEquipment.length === 0 && (
                          <div className="bg-gradient-to-br from-[#0A1628]/50 to-transparent rounded-lg p-3 sm:p-4 border border-[#C8A661]/20" data-testid="preset-templates-section">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-[#C8A661]" />
                              <span className="text-xs sm:text-sm font-medium text-white">Quick Start Templates</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {EQUIPMENT_TEMPLATES.map((template) => (
                                <button
                                  key={template.id}
                                  type="button"
                                  className="bg-white/5 hover:bg-[#C8A661]/20 border border-white/10 hover:border-[#C8A661]/40 rounded-lg p-2 sm:p-3 text-left transition-all"
                                  onClick={() => {
                                    const newEquipment = template.equipment.map((eq, idx) => ({
                                      ...eq,
                                      id: `${template.id}-${idx}-${Date.now()}`
                                    }));
                                    setValuatorEquipment(newEquipment);
                                    toast({ 
                                      title: "Template Applied",
                                      description: `${template.name} - ${template.totalMachines} machines added`
                                    });
                                  }}
                                  data-testid={`button-template-${template.id}`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-md bg-[#C8A661]/20 flex items-center justify-center">
                                      <WashingMachine className="w-3 h-3 text-[#C8A661]" />
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-medium text-white">{template.name}</span>
                                  </div>
                                  <p className="text-[9px] sm:text-[10px] text-white/50 mb-1.5">{template.description}</p>
                                  <div className="flex items-center justify-between text-[9px] text-white/40">
                                    <span>{template.totalMachines} machines</span>
                                    <span className="text-[#C8A661]">${(template.estimatedCost / 1000).toFixed(0)}K</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/10 text-center">
                              <span className="text-[10px] text-white/40">Or </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px] text-[#8B5CF6] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                                onClick={() => setShowAddEquipmentModal(true)}
                                data-testid="button-add-custom-equipment"
                              >
                                <Plus className="w-2.5 h-2.5 mr-1" />
                                Add Custom Equipment
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Equipment Inventory Section - Mobile Optimized */}
                        {valuatorEquipment.length === 0 ? (
                          <div className="bg-white/5 rounded-lg p-3 sm:p-4 text-center border border-dashed border-white/20">
                            <WashingMachine className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-white/30" />
                            <p className="text-xs sm:text-sm text-white/50 mb-3">Select a template above or add equipment manually</p>
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
                                    className="flex items-center justify-between bg-white/5 rounded-lg px-2 sm:px-3 min-h-12 hover:bg-white/8 transition-colors"
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
                                        className="min-h-11 min-w-11 text-white/40 hover:text-white"
                                        onClick={() => {
                                          setEditingEquipment(item);
                                          setShowAddEquipmentModal(true);
                                        }}
                                        data-testid={`button-edit-equipment-${item.id}`}
                                      >
                                        <Wrench className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="min-h-11 min-w-11 text-red-400/60 hover:text-red-400"
                                        onClick={() => {
                                          setValuatorEquipment(prev => prev.filter(e => e.id !== item.id));
                                          toast({ title: "Equipment removed" });
                                        }}
                                        data-testid={`button-delete-equipment-${item.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                            
                            {/* Running Totals Display */}
                            <div className="bg-gradient-to-r from-[#0A1628] to-[#0A1628]/50 rounded-lg p-2 sm:p-3 border border-[#C8A661]/20 mt-2" data-testid="running-totals-section">
                              <div className="flex items-center gap-2 mb-2">
                                <Calculator className="w-3.5 h-3.5 text-[#C8A661]" />
                                <span className="text-[10px] sm:text-xs font-medium text-white/70">Running Totals</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="text-center">
                                  <div className="text-base sm:text-lg font-bold text-[#C8A661]" data-testid="total-machines-count">
                                    {equipmentRunningTotals.totalMachines}
                                  </div>
                                  <div className="text-[9px] text-white/40">Total Machines</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-base sm:text-lg font-bold text-white" data-testid="total-cost-value">
                                    ${(equipmentRunningTotals.totalCost / 1000).toFixed(0)}K
                                  </div>
                                  <div className="text-[9px] text-white/40">Original Cost</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] sm:text-sm font-bold text-blue-400">
                                    {equipmentRunningTotals.washerCount}
                                  </div>
                                  <div className="text-[9px] text-white/40">Washers</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] sm:text-sm font-bold text-orange-400">
                                    {equipmentRunningTotals.dryerCount}
                                  </div>
                                  <div className="text-[9px] text-white/40">Dryers</div>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-center gap-4 text-[9px] text-white/40">
                                <span>Avg Age: <span className="text-white">{equipmentRunningTotals.avgAge.toFixed(1)}yr</span></span>
                                <span>W:D Ratio: <span className="text-white">{equipmentRunningTotals.dryerCount > 0 ? (equipmentRunningTotals.washerCount / equipmentRunningTotals.dryerCount).toFixed(1) : '—'}:1</span></span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Depreciation Timeline Visualization */}
                        {valuatorEquipment.length > 0 && (
                          <Collapsible className="bg-white/5 rounded-lg border border-white/10">
                            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-white/5 transition-colors" data-testid="toggle-depreciation-visualization">
                              <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-[#C8A661]" />
                                <span className="text-[10px] sm:text-xs font-medium text-white">Equipment Age & Depreciation</span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-white/40" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-2 sm:px-3 pb-2 sm:pb-3">
                              {/* Age Distribution Chart */}
                              {ageDistributionData.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-[9px] text-white/50 mb-2">Age Distribution</div>
                                  <div className="h-[120px] sm:h-[140px]" data-testid="age-distribution-chart">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={ageDistributionData} barCategoryGap="20%">
                                        <XAxis 
                                          dataKey="label" 
                                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                                          tickLine={false}
                                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                        />
                                        <YAxis 
                                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }}
                                          tickLine={false}
                                          axisLine={false}
                                          width={20}
                                        />
                                        <RechartsTooltip
                                          contentStyle={{
                                            backgroundColor: '#0A1628',
                                            border: '1px solid rgba(200, 166, 97, 0.3)',
                                            borderRadius: '6px',
                                            fontSize: 10
                                          }}
                                          labelStyle={{ color: '#C8A661' }}
                                        />
                                        <Bar dataKey="washers" name="Washers" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="dryers" name="Dryers" stackId="a" fill="#F97316" radius={[2, 2, 0, 0]} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              )}

                              {/* Replacement Timeline */}
                              <div className="space-y-1.5">
                                <div className="text-[9px] text-white/50">Replacement Timeline</div>
                                {depreciationTimelineData.map((item) => (
                                  <div key={item.id} className="bg-white/5 rounded-lg p-2" data-testid={`replacement-timeline-${item.id}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-medium text-white">{item.quantity}x {item.brand} {item.type}</span>
                                        <Badge 
                                          variant="outline" 
                                          className={`text-[8px] ${
                                            item.replacementUrgency === 'urgent' 
                                              ? 'border-red-500/40 text-red-400' 
                                              : item.replacementUrgency === 'soon' 
                                              ? 'border-yellow-500/40 text-yellow-400' 
                                              : 'border-green-500/40 text-green-400'
                                          }`}
                                        >
                                          {item.replacementUrgency === 'urgent' ? 'Replace Soon' : item.replacementUrgency === 'soon' ? 'Plan Ahead' : 'Good'}
                                        </Badge>
                                      </div>
                                      <span className="text-[9px] text-white/40">{item.remainingLife}yr left</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Progress 
                                        value={item.depreciationPercent} 
                                        className="h-1.5 flex-1 bg-white/10"
                                      />
                                      <span className="text-[9px] text-white/50 w-8 text-right">{item.depreciationPercent.toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1 text-[9px]">
                                      <span className="text-white/40">Age: {item.ageYears}/{item.usefulLife}yr</span>
                                      <span className="text-[#C8A661]">~${item.estimatedCurrentValue.toLocaleString()} FMV</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
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
                                {!valuatorNarrative && valuatorResult && analysisResult && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="min-h-11 text-[10px] sm:text-xs border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                                    onClick={async () => {
                                      if (!valuatorResult || !analysisResult) {
                                        toast({ title: "Valuation Required", description: "Calculate valuation first to generate AI insights", variant: "destructive" });
                                        return;
                                      }
                                      
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
                                            propertyValue: valuatorResult.propertyValue || 0,
                                            businessValue: valuatorResult.businessValue || 0,
                                            cleanbiGrade: analysisResult.grade || 'C',
                                            cleanbiScore: analysisResult.cleanbiScore || 70,
                                            ebitdaMultiple: valuatorResult.businessDetails?.ebitdaMultiple || 3.0,
                                            ebitda: valuatorResult.businessDetails?.ebitda || 0,
                                            equipmentDetails: {
                                              totalMachines: valuatorEquipment.reduce((sum, e) => sum + e.quantity, 0),
                                              weightedAge: valuatorResult.equipmentBreakdown?.weightedAge || 5,
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
                                        
                                        if (response.success && response.narrative) {
                                          setValuatorNarrative(response.narrative);
                                          trackEvent("valuator_narrative_generated", "engagement");
                                          toast({ title: "AI Insights Generated", description: "Valuation narrative ready" });
                                        } else if (response.upgradeRequired) {
                                          toast({ title: "Pro Tier Required", description: "Upgrade to Pro to access AI insights", variant: "destructive" });
                                        } else if (response.fallback) {
                                          setValuatorNarrative(response.fallback);
                                          toast({ title: "Limited Insights", description: "Using fallback analysis - full AI temporarily unavailable" });
                                        } else {
                                          toast({ title: "Error", description: response.error || "Could not generate AI insights", variant: "destructive" });
                                        }
                                      } catch (error: any) {
                                        console.error("Narrative error:", error);
                                        const errorMessage = error?.message || "Could not generate AI insights";
                                        toast({ title: "Error", description: errorMessage, variant: "destructive" });
                                      } finally {
                                        setIsGeneratingNarrative(false);
                                      }
                                    }}
                                    disabled={isGeneratingNarrative || !valuatorResult}
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

                            {/* What-If Simulator Section - Pro+ Feature */}
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <LineChart className="w-4 h-4 text-[#10B981]" />
                                <span className="text-xs sm:text-sm font-semibold text-white">What-If Simulator</span>
                                {(userTier === "free" || userTier === "starter") ? (
                                  <Badge className="text-[8px] sm:text-[9px] bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                                    <Lock className="w-2.5 h-2.5 mr-0.5" />
                                    Pro+
                                  </Badge>
                                ) : (
                                  <Badge className="text-[8px] sm:text-[9px] bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">Beta</Badge>
                                )}
                              </div>
                              
                              {/* Pro+ Gate for What-If Simulator */}
                              {(userTier === "free" || userTier === "starter") ? (
                                <div className="relative">
                                  {/* Blurred Preview */}
                                  <div className="blur-sm pointer-events-none opacity-60">
                                    <p className="text-[10px] sm:text-xs text-white/50 mb-3">
                                      Model scenarios: What if you add new machines or upgrade equipment?
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                      <Button size="sm" variant="outline" className="min-h-11 text-[10px] border-[#10B981]/30 text-[#10B981]">
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Machine
                                      </Button>
                                      <Button size="sm" variant="outline" className="min-h-11 text-[10px] border-orange-500/30 text-orange-400">
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Remove
                                      </Button>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="text-center">
                                          <div className="text-[9px] text-white/40">Current Value</div>
                                          <div className="text-base font-bold text-white">$245,000</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-[9px] text-white/40">New Value</div>
                                          <div className="text-base font-bold text-[#10B981]">$312,500</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Upgrade Overlay */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A1628]/60 backdrop-blur-[2px] rounded-lg">
                                    <Lock className="w-6 h-6 text-[#C8A661] mb-2" />
                                    <p className="text-xs font-medium text-white mb-1">Pro+ Feature</p>
                                    <p className="text-[10px] text-white/60 text-center px-4 mb-3">
                                      Model equipment changes and see how they impact your business value
                                    </p>
                                    <Button
                                      size="sm"
                                      className="min-h-9 px-4 bg-[#C8A661] hover:bg-[#a07850] text-white text-xs"
                                      onClick={() => setShowUpgradeModal(true)}
                                      data-testid="button-upgrade-whatif"
                                    >
                                      <Crown className="w-3 h-3 mr-1" />
                                      Upgrade to Pro
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-[10px] sm:text-xs text-white/50 mb-3">
                                    Model scenarios: What if you add new machines or upgrade equipment?
                                  </p>
                              
                                  {/* Scenario Controls */}
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="min-h-11 text-[10px] sm:text-xs border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10"
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
                                      className="min-h-11 text-[10px] sm:text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
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
                                    className="w-full mt-2 min-h-11 text-[10px] sm:text-xs bg-[#10B981] hover:bg-[#059669] text-white"
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

                              {/* What-If Results - Enhanced Display */}
                              {whatIfResult && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-gradient-to-br from-[#0A1628]/80 to-[#0A1628]/40 rounded-lg p-3 sm:p-4 border border-[#C8A661]/30"
                                  data-testid="whatif-results-section"
                                >
                                  {/* Header with Percentage Change Badge */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <LineChart className="w-4 h-4 text-[#C8A661]" />
                                      <span className="text-[10px] sm:text-xs font-medium text-white">Scenario Impact</span>
                                    </div>
                                    <Badge 
                                      className={`text-[10px] sm:text-xs font-bold ${
                                        whatIfResult.valueDifference >= 0 
                                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                                      }`}
                                      data-testid="whatif-percentage-badge"
                                    >
                                      {whatIfResult.valueDifference >= 0 ? (
                                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                      ) : (
                                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                                      )}
                                      {whatIfResult.valueDifference >= 0 ? '+' : ''}{whatIfResult.percentageChange?.toFixed(1)}%
                                    </Badge>
                                  </div>

                                  {/* Before/After Comparison */}
                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-white/5 rounded-lg p-2.5 text-center border border-white/10">
                                      <div className="text-[9px] sm:text-[10px] text-white/40 mb-1">Before</div>
                                      <div className="text-base sm:text-lg font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }} data-testid="whatif-before-value">
                                        ${(whatIfResult.currentValue || valuatorResult.totalAssetValue).toLocaleString()}
                                      </div>
                                    </div>
                                    <div className={`rounded-lg p-2.5 text-center border ${
                                      whatIfResult.valueDifference >= 0 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-red-500/10 border-red-500/30'
                                    }`}>
                                      <div className="text-[9px] sm:text-[10px] text-white/40 mb-1">After</div>
                                      <div className={`text-base sm:text-lg font-bold ${
                                        whatIfResult.valueDifference >= 0 ? 'text-green-400' : 'text-red-400'
                                      }`} style={{ fontFamily: "'Bebas Neue', sans-serif" }} data-testid="whatif-after-value">
                                        ${whatIfResult.newValue?.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Value Difference Highlight */}
                                  <div className={`rounded-lg p-2 sm:p-2.5 text-center ${
                                    whatIfResult.valueDifference >= 0 
                                      ? 'bg-green-500/10 border border-green-500/20' 
                                      : 'bg-red-500/10 border border-red-500/20'
                                  }`} data-testid="whatif-difference-section">
                                    <div className="text-[9px] text-white/40 mb-0.5">Net Value Change</div>
                                    <div className={`flex items-center justify-center gap-1 text-lg sm:text-xl font-bold ${
                                      whatIfResult.valueDifference >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`} style={{ fontFamily: "'Bebas Neue', sans-serif" }} data-testid="whatif-difference-value">
                                      {whatIfResult.valueDifference >= 0 ? (
                                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                      ) : (
                                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                      )}
                                      {whatIfResult.valueDifference >= 0 ? '+' : ''}${whatIfResult.valueDifference?.toLocaleString()}
                                    </div>
                                  </div>

                                  {/* Scenario Details */}
                                  {(whatIfScenario.addedMachines.length > 0 || whatIfScenario.removedMachineIds.length > 0) && (
                                    <div className="mt-3 pt-2 border-t border-white/10">
                                      <div className="text-[9px] text-white/40 mb-1.5">Scenario Changes:</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {whatIfScenario.addedMachines.length > 0 && (
                                          <Badge variant="outline" className="text-[8px] border-green-500/30 text-green-400">
                                            <Plus className="w-2.5 h-2.5 mr-0.5" />
                                            {whatIfScenario.addedMachines.reduce((sum, m) => sum + m.quantity, 0)} machines added
                                          </Badge>
                                        )}
                                        {whatIfScenario.removedMachineIds.length > 0 && (
                                          <Badge variant="outline" className="text-[8px] border-red-500/30 text-red-400">
                                            <Trash2 className="w-2.5 h-2.5 mr-0.5" />
                                            {whatIfScenario.removedMachineIds.length} items removed
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Reset Scenario Button */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-3 min-h-11 text-[10px] border-[#C8A661]/30 text-[#C8A661] hover:bg-[#C8A661]/10"
                                    onClick={() => {
                                      setWhatIfScenario({ addedMachines: [], removedMachineIds: [] });
                                      setWhatIfResult(null);
                                      toast({ title: "Scenario Reset", description: "What-If scenario has been cleared" });
                                    }}
                                    data-testid="button-reset-scenario"
                                  >
                                    <RefreshCw className="w-3 h-3 mr-1.5" />
                                    Reset Scenario
                                  </Button>
                                </motion.div>
                              )}
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                </div>

                {/* Next Steps CTAs - Compact Action Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-2 bg-gradient-to-br from-[#1e3a5f]/80 to-[#0f1d2f]/80 rounded-lg p-2.5 border border-[#C8A661]/30"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <ArrowRight className="w-3.5 h-3.5 text-[#C8A661]" />
                    <span className="text-xs font-semibold text-white">Ready to Take Action?</span>
                    <span className="text-[10px] text-[#C8A661] font-medium ml-auto">Grade {analysisResult.grade}</span>
                  </div>
                  
                  {/* Featured CTA: AI Consultation */}
                  <Button 
                    size="sm"
                    variant="default"
                    className="w-full mb-2 min-h-11"
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
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    <span className="text-xs">Get Expert AI Council Analysis — $49</span>
                  </Button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-[#C8A661] to-[#A8893F] hover:from-[#D8B66D] hover:to-[#C8A661] text-white min-h-11 text-[10px] font-medium"
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
                      <Banknote className="w-3 h-3 mr-1" />
                      Get Funding
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant="outline"
                      className="min-h-11 text-[10px]"
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
                      <Briefcase className="w-3 h-3 mr-1" />
                      Find Broker
                    </Button>
                  </div>
                  
                  {/* Equipment Partner Cross-Sell - Compact */}
                  <CLEANBICrossSellCompact />
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Map Layers - Card Section */}
            <div className="px-4 py-3">
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                {/* Gold Top Bar */}
                <div className="h-1 bg-[#C8A661]" />
                
                <div className="p-3">
                  {/* Section Header with Info Tooltip */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0A1628] border border-[#C8A661]/30 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-[#C8A661]" />
                      </div>
                      <span className="text-sm font-medium text-white">Map Layers</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                          <Info className="w-3 h-3 text-white/50" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px] bg-[#0A1628] border-white/20 text-white">
                        <p className="text-xs">Toggle map overlays to visualize competition, opportunities, and saved locations.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Layer Toggles with Enhanced Visual States */}
                  <div className="space-y-1.5">
                    {/* Competition Layer */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          onClick={() => toggleLayer("competition")}
                          className={`flex items-center justify-between w-full min-h-10 px-3 rounded-lg transition-all cursor-pointer ${
                            layers.competition 
                              ? 'bg-red-500/10 border border-red-500/30' 
                              : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                          }`}
                          data-testid="switch-layer-competition"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && toggleLayer("competition")}
                        >
                          <Label className="text-xs text-white/80 flex items-center gap-2 pointer-events-none cursor-pointer">
                            <div className={`w-2.5 h-2.5 rounded-full bg-red-500 ${layers.competition ? 'shadow-sm shadow-red-500/50 animate-pulse' : ''}`} />
                            Competition
                          </Label>
                          <Switch 
                            checked={layers.competition} 
                            onCheckedChange={() => toggleLayer("competition")}
                            className="data-[state=checked]:bg-red-500"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[180px] bg-[#0A1628] border-white/20 text-white">
                        <p className="text-xs">Show nearby laundromats as red markers to see your competition</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Opportunity Heatmap Layer */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          onClick={() => toggleLayer("opportunities")}
                          className={`flex items-center justify-between w-full min-h-10 px-3 rounded-lg transition-all cursor-pointer ${
                            layers.opportunities 
                              ? 'bg-orange-500/10 border border-orange-500/30' 
                              : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                          }`}
                          data-testid="switch-layer-opportunities"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && toggleLayer("opportunities")}
                        >
                          <Label className="text-xs text-white/80 flex items-center gap-2 pointer-events-none cursor-pointer">
                            <Flame className={`w-3 h-3 text-orange-500 ${layers.opportunities ? 'animate-pulse' : ''}`} />
                            Opportunity Heatmap
                          </Label>
                          <Switch 
                            checked={layers.opportunities} 
                            onCheckedChange={() => toggleLayer("opportunities")}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[180px] bg-[#0A1628] border-white/20 text-white">
                        <p className="text-xs">Heat overlay showing demand intensity based on demographics</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Saved Locations Layer */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          onClick={() => toggleLayer("savedLocations")}
                          className={`flex items-center justify-between w-full min-h-10 px-3 rounded-lg transition-all cursor-pointer ${
                            layers.savedLocations 
                              ? 'bg-[#C8A661]/10 border border-[#C8A661]/30' 
                              : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                          }`}
                          data-testid="switch-layer-saved"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && toggleLayer("savedLocations")}
                        >
                          <Label className="text-xs text-white/80 flex items-center gap-2 pointer-events-none cursor-pointer">
                            <Bookmark className={`w-3 h-3 text-[#C8A661] ${layers.savedLocations ? 'fill-[#C8A661]' : ''}`} />
                            Saved Locations
                          </Label>
                          <Switch 
                            checked={layers.savedLocations} 
                            onCheckedChange={() => toggleLayer("savedLocations")}
                            className="data-[state=checked]:bg-[#C8A661]"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[180px] bg-[#0A1628] border-white/20 text-white">
                        <p className="text-xs">Display your saved analyses as gold markers on the map</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Search Radius with Presets */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-white/80">Search Radius</Label>
                      <Badge variant="outline" className="text-[10px] border-[#C8A661]/50 text-[#C8A661] px-1.5">
                        {searchRadius[0]} mi
                      </Badge>
                    </div>
                    <Slider
                      value={searchRadius}
                      onValueChange={setSearchRadius}
                      min={1}
                      max={25}
                      step={1}
                      className="[&_[role=slider]]:bg-[#C8A661] [&_[role=slider]]:border-[#C8A661] mb-2"
                      data-testid="slider-search-radius"
                    />
                    {/* Quick Preset Buttons */}
                    <div className="flex gap-1.5 mt-2" role="group" aria-label="Search radius presets">
                      {[3, 5, 10, 15].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSearchRadius([val])}
                          aria-pressed={searchRadius[0] === val}
                          className={`flex-1 text-[10px] py-1.5 rounded-md transition-colors ${
                            searchRadius[0] === val 
                              ? 'bg-[#C8A661] text-[#0A1628] font-medium' 
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                          data-testid={`button-radius-${val}`}
                        >
                          {val} mi
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Gap Finder Section - Card Style */}
            <div className="px-4 py-2">
            <Collapsible>
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                {/* Gold Top Bar */}
                <div className="h-1 bg-[#C8A661]" />
                
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0A1628] border border-[#C8A661]/30 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-[#C8A661]" />
                    </div>
                    <span className="text-sm font-medium text-white">Market Gap Finder</span>
                    <Badge variant="outline" className="text-[9px] border-[#C8A661]/50 text-[#C8A661] px-1.5 py-0">NEW</Badge>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/50" />
                </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3" forceMount={undefined}>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="space-y-4"
                >
                <p className="text-xs text-white/60">
                  Find underserved areas with high renter populations and low laundromat competition.
                </p>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <Label className="text-xs text-white/80 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#C8A661]/50 border border-[#C8A661]" />
                    Show Market Gaps
                  </Label>
                  <Switch 
                    checked={showMarketGaps} 
                    onCheckedChange={setShowMarketGaps}
                    className="data-[state=checked]:bg-[#C8A661]"
                    data-testid="switch-show-market-gaps"
                  />
                </div>

                {showMarketGaps && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-white/80">Gap Radius</Label>
                        <Badge variant="outline" className="text-[10px] border-[#C8A661]/50 text-[#C8A661] px-1.5">{gapRadius[0]} mi</Badge>
                      </div>
                      <Slider
                        value={gapRadius}
                        onValueChange={setGapRadius}
                        min={0.5}
                        max={5}
                        step={0.5}
                        className="[&_[role=slider]]:bg-[#C8A661]"
                        data-testid="slider-gap-radius"
                      />
                      <p className="text-[10px] text-white/50 mt-1">Min distance from any competitor</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-white/80">Min Renter %</Label>
                        <Badge variant="outline" className="text-[10px] border-[#C8A661]/50 text-[#C8A661] px-1.5">{minRenterPercent[0]}%</Badge>
                      </div>
                      <Slider
                        value={minRenterPercent}
                        onValueChange={setMinRenterPercent}
                        min={20}
                        max={60}
                        step={5}
                        className="[&_[role=slider]]:bg-[#C8A661]"
                        data-testid="slider-min-renter-percent"
                      />
                      <p className="text-[10px] text-white/50 mt-1">Areas with high renter concentration</p>
                    </div>

                    <Button 
                      onClick={findMarketGaps}
                      disabled={loadingGapAnalysis}
                      className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] h-10 text-sm font-semibold"
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
                      <div className="bg-[#C8A661]/10 rounded-lg p-3 border border-[#C8A661]/30 space-y-3">
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
                            <div className="text-lg font-bold text-[#C8A661]">{totalGapCount}</div>
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
                              <Star className="w-3 h-3 text-[#C8A661]" />
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
                                    className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-2 cursor-pointer hover:bg-white/10 hover:border-[#C8A661]/30 transition-all duration-200"
                                    data-testid={`gap-opportunity-${idx}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#C8A661] to-[#A8893F] flex items-center justify-center text-[10px] font-bold text-white shadow-md">
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
                                      className="min-h-11 min-w-11 text-[#C8A661] hover:bg-[#C8A661]/20 hover:text-[#d4a030]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        analyzeGapZone(opp);
                                      }}
                                    >
                                      <Zap className="w-4 h-4" />
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
              </div>
            </Collapsible>
            </div>

            {/* Saved Addresses Panel - New Component */}
            <div className="px-4 py-2">
              <SavedAddressesPanel 
                onSelect={(saved) => loadSavedAnalysis(saved as SavedAnalysis)} 
                isOpen={savedPanelOpen} 
                onToggle={() => setSavedPanelOpen(!savedPanelOpen)} 
              />
            </div>
            
            {/* Saved Analyses History - Card Style */}
            <div className="px-4 py-2">
            <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded}>
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                {/* Gold Top Bar */}
                <div className="h-1 bg-[#C8A661]" />
                
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0A1628] border border-[#C8A661]/30 flex items-center justify-center">
                      <History className="w-3.5 h-3.5 text-[#C8A661]" />
                    </div>
                    <span className="text-sm font-medium text-white">Your Analyses</span>
                    <Badge variant="outline" className="text-[10px] border-[#C8A661]/50 text-[#C8A661] px-1.5">
                      {savedAnalyses.length}
                    </Badge>
                  </div>
                  {historyExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3">
                <AnimatePresence mode="wait">
                {savedAnalyses.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-center py-6 text-white/50 text-sm bg-white/5 rounded-lg"
                  >
                    <MapPinned className="w-8 h-8 mx-auto mb-2 text-[#C8A661]/50" />
                    <p>No saved analyses yet</p>
                    <p className="text-xs text-white/40 mt-1">Analyze a location to get started</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {/* Bulk Actions Bar */}
                    {savedAnalyses.length > 1 && (
                      <div className="flex items-center justify-between py-1.5 px-2 bg-white/5 rounded-lg mb-2">
                        <span className="text-[10px] text-white/50">{savedAnalyses.length} locations saved</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px] text-white/40 hover:text-red-400 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Clear all saved analyses?')) {
                                  setSavedAnalyses([]);
                                  localStorage.removeItem('cleanbi_saved_analyses');
                                  toast({ title: "All analyses cleared" });
                                }
                              }}
                              data-testid="button-clear-all-analyses"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Clear All
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-[#0A1628] border-white/20 text-white">
                            <p className="text-xs">Remove all saved analyses</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    
                    {/* Saved Analyses List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {savedAnalyses.map((saved, index) => (
                        <motion.div 
                          key={saved.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          onClick={() => loadSavedAnalysis(saved)}
                          className="bg-white/5 border border-white/10 rounded-lg p-2.5 cursor-pointer hover:bg-white/10 hover:border-[#C8A661]/30 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg cursor-help"
                                  style={{ backgroundColor: GRADE_COLORS[saved.grade] }}
                                >
                                  {saved.grade === "Needs Work" ? "NW" : saved.grade}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-[#0A1628] border-white/20 text-white">
                                <p className="text-xs">Grade: {saved.grade} • Score: {saved.cleanbiScore}/100</p>
                              </TooltipContent>
                            </Tooltip>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white truncate">{saved.address}</div>
                              <div className="text-xs text-white/50">
                                Score: {saved.cleanbiScore} · {new Date(saved.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            {/* Inline Action Buttons */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="min-h-8 min-w-8 text-white/40 hover:text-[#C8A661] hover:bg-[#C8A661]/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      loadSavedAnalysis(saved);
                                    }}
                                    data-testid={`button-view-analysis-${saved.id}`}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-[#0A1628] border-white/20 text-white">
                                  <p className="text-xs">View analysis</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="min-h-8 min-w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                                    onClick={(e) => handleDeleteSaved(saved.id, e)}
                                    data-testid={`button-delete-analysis-${saved.id}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-[#0A1628] border-white/20 text-white">
                                  <p className="text-xs">Delete analysis</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </CollapsibleContent>
              </div>
            </Collapsible>
            </div>

            {/* Your Plan Section - Card Style */}
            <div className="px-4 py-2">
            <Collapsible open={planExpanded} onOpenChange={setPlanExpanded}>
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                {/* Gold Top Bar */}
                <div className="h-1 bg-[#C8A661]" />
                
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0A1628] border border-[#C8A661]/30 flex items-center justify-center">
                      <Crown className="w-3.5 h-3.5 text-[#C8A661]" />
                    </div>
                    <span className="text-sm font-medium text-white">Your Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={`text-[10px] ${
                        userTier === "enterprise" ? "border-purple-500/50 text-purple-400" :
                        userTier === "pro" ? "border-blue-500/50 text-blue-400" :
                        userTier === "starter" ? "border-green-500/50 text-green-400" :
                        "border-[#C8A661]/50 text-[#C8A661]"
                      }`}
                    >
                      {userTier === "enterprise" ? "Enterprise" :
                       userTier === "pro" ? "Pro" :
                       userTier === "starter" ? "Starter" : "Free"}
                    </Badge>
                    {planExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                  </div>
                </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-2 bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span>Basic scoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span>Competitor mapping</span>
                  </div>
                  {userTier !== "free" && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span>Unlimited analyses</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span>Financial projections</span>
                      </div>
                    </>
                  )}
                  {(userTier === "pro" || userTier === "enterprise") && (
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span>AI insights & Sheets export</span>
                    </div>
                  )}
                </div>
                
                {userTier !== "enterprise" && (
                  <Button 
                    size="sm"
                    className="w-full mt-3 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] min-h-10 text-xs font-semibold"
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
                    {userTier === "free" ? "Upgrade $29/mo" :
                     userTier === "starter" ? "Go Pro $99/mo" :
                     "Enterprise $699/mo"}
                  </Button>
                )}
              </CollapsibleContent>
              </div>
            </Collapsible>
            </div>

            {/* Search Section - Compact */}
            <div className="px-3 py-2">
              {/* Free Tier Usage - Inline compact */}
              {userTier === "free" && (
                <div className={`mb-2 rounded-lg p-2 border ${remainingAnalyses === 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/60">Daily Analysis</span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${remainingAnalyses === 0 ? "border-red-500/50 text-red-400" : "border-[#C8A661]/50 text-[#C8A661]"}`}
                    >
                      {remainingAnalyses !== null ? (remainingAnalyses === 0 ? "Used" : "1 left") : "1/day"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Listing URL Analyzer */}
              <div className="mb-2">
                <ListingAnalyzer 
                  onAnalyzeAddress={analyzeFromListing}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              <div className="relative flex items-center mb-2">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="px-2 text-[10px] text-white/40">or enter address directly</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-gradient-to-br from-[#C8A661]/20 to-[#A8893F]/20 backdrop-blur-md rounded-xl p-3 border border-[#C8A661]/30 shadow-xl"
              >
                <div className="text-xs font-medium text-white mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C8A661]" />
                  Analyze Any Location
                </div>
                
                {/* Business Name Field */}
                <div className="mb-2">
                  <label className="block text-[10px] font-medium text-white/60 mb-1">
                    Business Name <span className="text-white/40">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Spin City Laundry"
                      className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-8 text-xs"
                      data-testid="input-explorer-business-name"
                    />
                  </div>
                </div>
                
                {/* Address Field */}
                <div className="mb-2">
                  <label className="block text-[10px] font-medium text-white/60 mb-1">
                    Street Address <span className="text-[#C8A661]">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && analyzeLocation()}
                      placeholder="123 Main St, City, State ZIP"
                      className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-8 text-xs"
                      data-testid="input-explorer-address"
                    />
                  </div>
                </div>

                <Button 
                  onClick={analyzeLocation}
                  disabled={isAnalyzing || !address.trim()}
                  className="w-full bg-gradient-to-r from-[#C8A661] to-[#A8893F] hover:from-[#D8B66D] hover:to-[#C8A661] text-white h-9 text-xs font-medium disabled:opacity-50 shadow-xl"
                  data-testid="button-analyze-location"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 mr-1.5" />
                      Analyze Location
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Footer - Compact */}
            <div className="px-3 py-2 border-t border-white/10 mt-auto backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                <Sparkles className="w-2.5 h-2.5 text-[#C8A661]" />
                <span>CLEANBI™ Proprietary</span>
              </div>
            </div>
              </ScrollArea>

              {/* Sidebar Toggle Button - Inside sidebar panel */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute top-56 right-0 translate-x-full z-30 w-7 h-14 bg-gradient-to-b from-[#C8A661] to-[#A8893F] border border-[#d4a030]/50 rounded-r-lg flex items-center justify-center text-white hover:from-[#D8B66D] hover:to-[#C8A661] transition-all shadow-xl"
                data-testid="button-toggle-sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </ResizablePanel>

          {/* Resizable Handle - Gold/Amber themed */}
          {sidebarOpen && (
            <ResizableHandle
              className="w-1.5 bg-[#C8A661]/20 hover:bg-[#C8A661]/50 active:bg-[#C8A661] transition-colors data-[resize-handle-active]:bg-[#C8A661] relative group"
              data-testid="sidebar-resize-handle"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#C8A661]/30 group-hover:bg-[#C8A661]/60 transition-colors" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-[#C8A661]/40 group-hover:bg-[#C8A661] transition-colors" />
            </ResizableHandle>
          )}

          {/* Main Map Area - Second Panel */}
          <ResizablePanel defaultSize={sidebarOpen ? (100 - sidebarSize) : 100} minSize={60}>
            <div className="h-full relative">
              {/* Toggle button when sidebar is collapsed */}
              {!sidebarOpen && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSidebarOpen(true)}
                  className="absolute top-56 left-0 z-30 w-7 h-14 bg-gradient-to-b from-[#C8A661] to-[#A8893F] border border-[#d4a030]/50 rounded-r-lg flex items-center justify-center text-white hover:from-[#D8B66D] hover:to-[#C8A661] transition-all shadow-xl"
                  data-testid="button-toggle-sidebar-open"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
              
              {/* Map or Charts View based on viewMode */}
              {viewMode === 'map' ? (
                <div 
                  ref={mapRef}
                  className="absolute inset-0"
                  data-testid="explorer-map"
                />
              ) : (
                /* Charts View - Show when viewMode is 'charts' */
                analysisResult ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f1d2f] to-[#1e3a5f] overflow-auto p-6">
                    <AnalysisChartsView analysis={analysisResult} />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f1d2f] to-[#1e3a5f] flex items-center justify-center">
                    <div className="text-center text-white/50">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[#C8A661]/50" />
                      <p className="text-sm">No analysis data to display</p>
                      <p className="text-xs mt-1">Run an analysis to see charts</p>
                    </div>
                  </div>
                )
              )}

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
                <Target className="w-4 h-4 text-[#C8A661]" />
                Market Gap Legend
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#C8A661]/30 border border-[#C8A661]" />
                  <span className="text-[11px] text-white/70">Gap Zones (high renters, low competition)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#C8A661] fill-[#C8A661]" />
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
          </ResizablePanel>
        </ResizablePanelGroup>
        )}

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
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#C8A661] animate-spin" />
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
              className="relative w-full max-w-md bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] rounded-2xl overflow-hidden border border-[#C8A661]/30 shadow-2xl backdrop-blur-md"
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
                    style={{ backgroundColor: GRADE_COLORS[pendingAnalysis.grade] || "#C8A661", fontFamily: "'Bebas Neue', sans-serif" }}
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
                    className="w-full bg-gradient-to-r from-[#C8A661] to-[#A8893F] hover:from-[#D8B66D] hover:to-[#C8A661] text-white h-12 text-lg font-medium shadow-xl"
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
                <Target className="w-5 h-5 text-[#C8A661]" />
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
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C8A661] to-[#A8893F] flex items-center justify-center shadow-xl">
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
                    style={{ backgroundColor: GRADE_COLORS[competitorAnalysis.grade] || "#C8A661" }}
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
                  <div className="bg-gradient-to-br from-[#C8A661]/10 to-transparent rounded-xl p-4 border border-[#C8A661]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Scale className="w-4 h-4 text-[#C8A661]" />
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
                      <div className="bg-[#C8A661]/10 rounded-lg p-2 border border-[#C8A661]/20">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-[#C8A661] mt-0.5 shrink-0" />
                          <p className="text-xs text-white/70">
                            <span className="text-[#C8A661] font-medium">Opportunity:</span> Customers complain about {competitorAnalysis.sentiment.negativeThemes[0]?.toLowerCase()}. 
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
                      <Lock className="w-5 h-5 text-[#C8A661] mb-1" />
                      <p className="text-xs text-white/70 mb-2">Sentiment Analysis</p>
                      <Button 
                        size="sm"
                        className="bg-[#C8A661] hover:bg-[#d4a030] text-black text-xs"
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
                    className="w-full bg-[#C8A661] hover:bg-[#C8A661]/90 text-white"
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

        {/* CLEANBI FAQ Section for SEO */}
        <div className="max-w-4xl mx-auto px-4 py-8 mt-8">
          <FAQSection 
            faqs={COMMON_FAQS.cleanbi}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-white/10 rounded-xl p-6"
          />
        </div>

        {/* CLEANBI Help Chat Widget */}
        <CLEANBIHelpChat />
      </div>
    </>
  );
}

export default function CleanBIExplorer() {
  return (
    <AuthGuard
      title="CLEANBI Explorer Access"
      description="Sign in to access the CLEANBI Explorer and analyze laundromat locations. Free account includes 5 location analyses."
    >
      <CleanBIExplorerContent />
    </AuthGuard>
  );
}
