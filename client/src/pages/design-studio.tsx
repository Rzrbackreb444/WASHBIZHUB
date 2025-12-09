import { useState, useCallback, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { equipmentLibrary } from "@shared/schema";
import { 
  Palette, Box, Plus, Save, Trash2, RotateCw, Grid3X3, 
  DollarSign, TrendingUp, Calculator, ZoomIn, ZoomOut,
  Download, Undo2, Redo2, Info, Eye, EyeOff, Move3D, Maximize2, Camera,
  Sun, Moon, RotateCcw, Layers, Sparkles, Target, Zap, ChevronRight,
  Search, Ruler, Share2, Copy, Check, X, HelpCircle, LayoutTemplate,
  Building2, Store, Warehouse, Menu, ChevronDown, GripVertical, FileText,
  Image, ImageOff, Upload, Lightbulb, Mail, MapPin, Users, Navigation
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthGuard } from "@/components/AuthGuard";
import { useLocationDesign } from "@/contexts/LocationDesignContext";
import { ValuationEstimatesPanel } from "@/components/design-studio/ValuationEstimatesPanel";

const Canvas = lazy(() => import("@react-three/fiber").then(m => ({ default: m.Canvas })));
const ThreeScene = lazy(() => import("./design-studio-3d-scene"));

interface PlacedEquipment {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  equipment: typeof equipmentLibrary[number];
}

interface HistoryState {
  equipment: PlacedEquipment[];
  dimensions: { width: number; depth: number };
}

interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  sqft: number;
  icon: typeof Building2;
  dimensions: { width: number; depth: number };
  equipment: Array<{
    equipmentId: string;
    x: number;
    y: number;
    rotation: number;
  }>;
}

interface AISuggestion {
  roomSize: 'small' | 'medium' | 'large';
  sqft: number;
  recommendedWashers: number;
  recommendedDryers: number;
  projectedMonthlyRevenue: number;
  projectedAnnualRevenue: number;
  cleanbiScore: number;
  equipmentCost: number;
  washerPlacement: string;
  dryerPlacement: string;
  additionalTips: string[];
}

interface LocationContext {
  address: string;
  cleanbiScore: number;
  grade: string;
  medianIncome: number;
  populationDensity: number;
  competitorCount: number;
  trafficScore: number;
  opportunityLevel: string;
  revenueMultiplier: number;
  notes: string;
}

function calculateLocationMultiplier(location: Partial<LocationContext>): number {
  let multiplier = 1.0;
  
  if (location.medianIncome) {
    if (location.medianIncome >= 80000) multiplier += 0.15;
    else if (location.medianIncome >= 60000) multiplier += 0.08;
    else if (location.medianIncome < 40000) multiplier -= 0.10;
  }
  
  if (location.populationDensity) {
    if (location.populationDensity >= 10000) multiplier += 0.12;
    else if (location.populationDensity >= 5000) multiplier += 0.06;
    else if (location.populationDensity < 2000) multiplier -= 0.08;
  }
  
  if (location.competitorCount !== undefined) {
    if (location.competitorCount === 0) multiplier += 0.20;
    else if (location.competitorCount <= 2) multiplier += 0.10;
    else if (location.competitorCount >= 5) multiplier -= 0.15;
  }
  
  if (location.trafficScore) {
    if (location.trafficScore >= 80) multiplier += 0.10;
    else if (location.trafficScore >= 60) multiplier += 0.05;
  }
  
  return Math.max(0.5, Math.min(1.5, multiplier));
}

const GRID_SIZE = 20;
const SCALE_FACTOR = 0.15;
const SCALE_3D = 0.02;

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "small-mat",
    name: "Small Mat",
    description: "1,000 sq ft - Starter layout",
    sqft: 1000,
    icon: Store,
    dimensions: { width: 1440, depth: 1200 },
    equipment: [
      { equipmentId: "dexter-t900", x: 40, y: 80, rotation: 0 },
      { equipmentId: "dexter-t900", x: 100, y: 80, rotation: 0 },
      { equipmentId: "dexter-t900", x: 160, y: 80, rotation: 0 },
      { equipmentId: "dexter-t1200", x: 220, y: 80, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 40, y: 200, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 100, y: 200, rotation: 0 },
    ],
  },
  {
    id: "medium-mat",
    name: "Medium Mat",
    description: "2,500 sq ft - Growth layout",
    sqft: 2500,
    icon: Building2,
    dimensions: { width: 2160, depth: 2400 },
    equipment: [
      { equipmentId: "dexter-t900", x: 60, y: 100, rotation: 0 },
      { equipmentId: "dexter-t900", x: 130, y: 100, rotation: 0 },
      { equipmentId: "dexter-t900", x: 200, y: 100, rotation: 0 },
      { equipmentId: "dexter-t1200", x: 270, y: 100, rotation: 0 },
      { equipmentId: "dexter-t1200", x: 340, y: 100, rotation: 0 },
      { equipmentId: "speed-queen-sfn", x: 410, y: 100, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 60, y: 280, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 130, y: 280, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 200, y: 280, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 270, y: 280, rotation: 0 },
    ],
  },
  {
    id: "large-mat",
    name: "Large Mat",
    description: "5,000 sq ft - Premium layout",
    sqft: 5000,
    icon: Warehouse,
    dimensions: { width: 3600, depth: 2880 },
    equipment: [
      { equipmentId: "dexter-t900", x: 80, y: 100, rotation: 0 },
      { equipmentId: "dexter-t900", x: 160, y: 100, rotation: 0 },
      { equipmentId: "dexter-t900", x: 240, y: 100, rotation: 0 },
      { equipmentId: "dexter-t900", x: 320, y: 100, rotation: 0 },
      { equipmentId: "dexter-t1200", x: 400, y: 100, rotation: 0 },
      { equipmentId: "dexter-t1200", x: 480, y: 100, rotation: 0 },
      { equipmentId: "dexter-t1200", x: 560, y: 100, rotation: 0 },
      { equipmentId: "speed-queen-sfn", x: 640, y: 100, rotation: 0 },
      { equipmentId: "speed-queen-sfn", x: 720, y: 100, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 80, y: 300, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 160, y: 300, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 240, y: 300, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 320, y: 300, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 400, y: 300, rotation: 0 },
      { equipmentId: "speed-queen-stack", x: 480, y: 300, rotation: 0 },
    ],
  },
];

const equipmentCategories = [
  { id: "all", name: "All", types: [] as string[] },
  { id: "washers", name: "Washers", types: ["washer"] },
  { id: "dryers", name: "Dryers", types: ["dryer"] },
  { id: "architecture", name: "Structure", types: ["door", "window", "column", "wall", "bulkhead"] },
  { id: "furniture", name: "Furniture", types: ["table", "counter", "seating", "furniture", "cart"] },
  { id: "utilities", name: "Utilities", types: ["restroom", "storage", "utility", "sink"] },
  { id: "financial", name: "Financial", types: ["atm", "changer"] },
  { id: "services", name: "Services", types: ["vending", "dogwash", "accessory"] },
  { id: "entertainment", name: "Games", types: ["arcade", "entertainment"] },
];

const getCategoryTypes = (categoryId: string): string[] => {
  if (categoryId === "all") return [];
  const category = equipmentCategories.find(c => c.id === categoryId);
  return category?.types || [];
};

function EquipmentThumbnail({ equipment, size = "md" }: { equipment: typeof equipmentLibrary[number]; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "w-6 h-6" : "w-10 h-10";
  const { type } = equipment;
  
  const renderIcon = () => {
    switch(type) {
      case "washer":
        return (
          <div className="w-3/4 h-3/4 rounded-full border-2 border-white/30 flex items-center justify-center">
            <div className="w-1/2 h-1/2 rounded-full bg-white/20" />
          </div>
        );
      case "dryer":
        return (
          <div className="w-3/4 h-3/4 rounded-full border-2 border-white/30 flex items-center justify-center">
            <div className="w-1/3 h-1/3 rounded-full border border-white/40" />
          </div>
        );
      case "atm":
        return (
          <div className="w-3/4 h-3/4 flex items-center justify-center text-white/80 text-[8px] font-bold">
            ATM
          </div>
        );
      case "changer":
        return (
          <div className="w-3/4 h-3/4 flex items-center justify-center text-white/80 text-[7px] font-bold">
            $
          </div>
        );
      case "vending":
        return (
          <div className="w-3/4 h-3/4 border border-white/30 rounded flex flex-col items-center justify-center gap-0.5">
            <div className="w-2/3 h-1/4 bg-white/20 rounded-sm" />
            <div className="w-2/3 h-1/4 bg-white/20 rounded-sm" />
          </div>
        );
      case "dogwash":
        return (
          <div className="w-3/4 h-3/4 flex items-center justify-center text-white/80 text-[7px] font-bold">
            DOG
          </div>
        );
      case "table":
      case "furniture":
        return (
          <div className="w-3/4 h-1/3 bg-white/30 rounded-sm border-t-2 border-white/40" />
        );
      case "cart":
        return (
          <div className="w-3/4 h-3/4 border border-white/30 rounded flex items-center justify-center">
            <div className="w-1/2 h-1/2 border border-white/40 rounded" />
          </div>
        );
      case "arcade":
      case "entertainment":
        return (
          <div className="w-3/4 h-3/4 flex items-center justify-center text-white/80 text-[8px] font-bold">
            PLAY
          </div>
        );
      case "door":
        return (
          <div className="w-3/4 h-full flex flex-col items-center justify-center">
            <div className="w-full h-3/4 border-2 border-white/40 rounded-t-sm bg-white/10" />
            <div className="w-1/4 h-1/4 rounded-full bg-white/40 absolute right-1" />
          </div>
        );
      case "window":
        return (
          <div className="w-3/4 h-2/3 border-2 border-white/40 bg-sky-400/30 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
            <div className="bg-sky-300/40" />
            <div className="bg-sky-300/40" />
          </div>
        );
      case "column":
        return (
          <div className="w-1/2 h-1/2 bg-white/30 border-2 border-white/40 rounded-full" />
        );
      case "wall":
        return (
          <div className="w-full h-1/4 bg-white/40 border border-white/50" />
        );
      case "bulkhead":
        return (
          <div className="w-3/4 h-1/3 bg-white/20 border-b-2 border-white/40 rounded-b-sm" />
        );
      case "counter":
        return (
          <div className="w-3/4 h-1/3 bg-white/40 rounded-sm border-t-2 border-white/50" />
        );
      case "seating":
        return (
          <div className="w-3/4 h-1/2 bg-white/30 rounded-sm flex items-end justify-center pb-0.5">
            <div className="w-1/2 h-1/2 bg-white/20 rounded-t-sm" />
          </div>
        );
      case "restroom":
        return (
          <div className="w-3/4 h-3/4 border-2 border-white/30 rounded-sm flex items-center justify-center text-white/80 text-[6px] font-bold">
            WC
          </div>
        );
      case "storage":
        return (
          <div className="w-3/4 h-3/4 border border-dashed border-white/40 rounded-sm flex items-center justify-center text-white/70 text-[6px]">
            STOR
          </div>
        );
      case "utility":
        return (
          <div className="w-3/4 h-3/4 border border-white/30 rounded-sm flex items-center justify-center">
            <div className="w-1/2 h-1/2 bg-white/20 rounded-full" />
          </div>
        );
      case "sink":
        return (
          <div className="w-2/3 h-1/2 border-2 border-white/40 rounded-sm bg-white/10" />
        );
      case "accessory":
        return (
          <div className="w-1/2 h-1/2 rounded-full border border-white/30 bg-white/10" />
        );
      default:
        return (
          <div className="w-3/4 h-3/4 rounded border border-white/30" />
        );
    }
  };
  
  return (
    <div 
      className={`${sizeClasses} rounded-md flex items-center justify-center relative overflow-hidden`}
      style={{ backgroundColor: equipment.color }}
    >
      {renderIcon()}
    </div>
  );
}

function OnboardingTooltip({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onDismiss}>
      <Card className="max-w-md bg-gradient-to-br from-[#001F3F] to-[#003366] border-[#39CCCC]/30" onClick={e => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#39CCCC]" />
              Welcome to Design Studio
            </CardTitle>
            <Button size="icon" variant="ghost" onClick={onDismiss} className="h-8 w-8 text-white/70 hover:text-white" aria-label="Close onboarding">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-white/80 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-[#39CCCC]/20 p-2 rounded-lg shrink-0">
                <LayoutTemplate className="h-4 w-4 text-[#39CCCC]" />
              </div>
              <div>
                <p className="font-medium text-white">Start with a Template</p>
                <p className="text-white/60 text-xs">Choose from Small, Medium, or Large Mat templates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg shrink-0">
                <Plus className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Add Equipment</p>
                <p className="text-white/60 text-xs">Drag washers and dryers from the sidebar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg shrink-0">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">See Live ROI</p>
                <p className="text-white/60 text-xs">Watch revenue projections update in real-time</p>
              </div>
            </div>
          </div>
          <Button onClick={onDismiss} className="w-full bg-[#39CCCC] text-[#001F3F] hover:bg-[#39CCCC]/90">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MeasurementOverlay({ 
  dimensions, 
  canvasWidth, 
  canvasHeight,
  showRulers 
}: { 
  dimensions: { width: number; depth: number }; 
  canvasWidth: number; 
  canvasHeight: number;
  showRulers: boolean;
}) {
  if (!showRulers) return null;
  
  const ftWidth = Math.round(dimensions.width / 12);
  const ftDepth = Math.round(dimensions.depth / 12);
  
  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-6 bg-[#001F3F]/90 border-b border-[#39CCCC]/30 flex items-center justify-between px-2">
        <span className="text-[10px] text-white/60">0'</span>
        <span className="text-xs font-medium text-[#39CCCC]">{ftWidth}' wide</span>
        <span className="text-[10px] text-white/60">{ftWidth}'</span>
      </div>
      <div className="absolute top-6 left-0 bottom-0 w-6 bg-[#001F3F]/90 border-r border-[#39CCCC]/30 flex flex-col items-center justify-between py-2">
        <span className="text-[10px] text-white/60 rotate-[-90deg] origin-center whitespace-nowrap">0'</span>
        <span className="text-xs font-medium text-[#39CCCC] rotate-[-90deg] origin-center whitespace-nowrap">{ftDepth}' deep</span>
        <span className="text-[10px] text-white/60 rotate-[-90deg] origin-center whitespace-nowrap">{ftDepth}'</span>
      </div>
    </>
  );
}

function BuildingShellEditor({ 
  dimensions, 
  setDimensions,
  canvasWidth,
  canvasHeight,
  showRulers
}: { 
  dimensions: { width: number; depth: number }; 
  setDimensions: (d: { width: number; depth: number }) => void;
  canvasWidth: number;
  canvasHeight: number;
  showRulers: boolean;
}) {
  const [isDragging, setIsDragging] = useState<'right' | 'bottom' | 'corner' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDim, setStartDim] = useState({ width: 0, depth: 0 });
  const [startShell, setStartShell] = useState({ width: 0, height: 0 });
  
  const offset = showRulers ? 24 : 0;
  const availableWidth = canvasWidth - offset - 40;
  const availableHeight = canvasHeight - offset - 40;
  
  const scaleX = availableWidth / dimensions.width;
  const scaleY = availableHeight / dimensions.depth;
  const scale = Math.min(scaleX, scaleY, 0.25);
  
  const shellWidth = dimensions.width * scale;
  const shellHeight = dimensions.depth * scale;
  
  const MIN_DIMENSION_INCHES = 600;
  
  const handleMouseDown = (edge: 'right' | 'bottom' | 'corner') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(edge);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartDim({ width: dimensions.width, depth: dimensions.depth });
    setStartShell({ width: shellWidth, height: shellHeight });
  };
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      
      const inchesPerPixelX = startDim.width / startShell.width;
      const inchesPerPixelY = startDim.depth / startShell.height;
      
      let newWidth = startDim.width;
      let newDepth = startDim.depth;
      
      if (isDragging === 'right' || isDragging === 'corner') {
        const rawWidth = startDim.width + dx * inchesPerPixelX;
        newWidth = Math.max(MIN_DIMENSION_INCHES, Math.round(rawWidth / 12) * 12);
      }
      if (isDragging === 'bottom' || isDragging === 'corner') {
        const rawDepth = startDim.depth + dy * inchesPerPixelY;
        newDepth = Math.max(MIN_DIMENSION_INCHES, Math.round(rawDepth / 12) * 12);
      }
      
      setDimensions({ width: newWidth, depth: newDepth });
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, startDim, startShell, setDimensions]);
  
  const ftWidth = Math.round(dimensions.width / 12);
  const ftDepth = Math.round(dimensions.depth / 12);
  const sqFt = Math.round((dimensions.width * dimensions.depth) / 144);
  
  return (
    <>
      <svg 
        className="absolute pointer-events-none z-10" 
        style={{ left: offset, top: offset }}
        width={shellWidth + 20} 
        height={shellHeight + 20}
      >
        <rect 
          x={0} 
          y={0} 
          width={shellWidth} 
          height={shellHeight} 
          fill="none" 
          stroke="#39CCCC" 
          strokeWidth="3"
          strokeDasharray="8 4"
          className="drop-shadow-lg"
        />
        
        <text 
          x={shellWidth / 2} 
          y={-8} 
          textAnchor="middle" 
          fill="#39CCCC" 
          fontSize="11" 
          fontWeight="600"
        >
          {ftWidth}' wide
        </text>
        
        <text 
          x={shellWidth + 14} 
          y={shellHeight / 2} 
          textAnchor="middle" 
          fill="#39CCCC" 
          fontSize="11" 
          fontWeight="600"
          transform={`rotate(90, ${shellWidth + 14}, ${shellHeight / 2})`}
        >
          {ftDepth}' deep
        </text>
        
        <text 
          x={shellWidth / 2} 
          y={shellHeight / 2} 
          textAnchor="middle" 
          fill="#39CCCC" 
          fontSize="13" 
          fontWeight="bold"
          opacity={0.6}
        >
          {sqFt.toLocaleString()} sq ft
        </text>
      </svg>
      
      <div 
        className="absolute w-4 h-4 bg-[#39CCCC] rounded-full cursor-e-resize z-20 shadow-lg hover:scale-125 transition-transform"
        style={{ 
          left: offset + shellWidth - 8, 
          top: offset + shellHeight / 2 - 8,
        }}
        onMouseDown={handleMouseDown('right')}
        data-testid="handle-resize-right"
      />
      
      <div 
        className="absolute w-4 h-4 bg-[#39CCCC] rounded-full cursor-s-resize z-20 shadow-lg hover:scale-125 transition-transform"
        style={{ 
          left: offset + shellWidth / 2 - 8, 
          top: offset + shellHeight - 8,
        }}
        onMouseDown={handleMouseDown('bottom')}
        data-testid="handle-resize-bottom"
      />
      
      <div 
        className="absolute w-5 h-5 bg-gradient-to-br from-[#39CCCC] to-[#2AA0A0] rounded-full cursor-nwse-resize z-20 shadow-lg hover:scale-125 transition-transform border-2 border-white/30"
        style={{ 
          left: offset + shellWidth - 10, 
          top: offset + shellHeight - 10,
        }}
        onMouseDown={handleMouseDown('corner')}
        data-testid="handle-resize-corner"
      />
      
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-grabbing" />
      )}
    </>
  );
}

function EquipmentPanel({ 
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  filteredEquipment,
  addEquipment,
  isMobile = false
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  filteredEquipment: typeof equipmentLibrary;
  addEquipment: (e: typeof equipmentLibrary[number]) => void;
  isMobile?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          placeholder="Search equipment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white/10 border-white/20 text-white text-sm h-9 placeholder:text-white/40"
          data-testid="input-equipment-search"
        />
      </div>
      
      <div className="flex gap-1 flex-wrap">
        {equipmentCategories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={categoryFilter === cat.id ? "default" : "outline"}
            onClick={() => setCategoryFilter(cat.id)}
            className={`h-7 text-xs ${
              categoryFilter === cat.id 
                ? "bg-[#39CCCC] text-[#001F3F]" 
                : "text-white/70 border-white/20"
            }`}
            data-testid={`button-filter-${cat.id}`}
          >
            {cat.name}
          </Button>
        ))}
      </div>
      
      <Separator className="bg-white/10" />
      
      <ScrollArea className={isMobile ? "h-[200px]" : "h-[300px]"}>
        <div className={isMobile ? "grid grid-cols-2 gap-2" : "space-y-2"}>
          {filteredEquipment.map((equipment) => (
            <button
              key={equipment.id}
              onClick={() => addEquipment(equipment)}
              className={`${
                isMobile ? "p-2 flex flex-col items-center gap-2" : "w-full p-2 flex items-center gap-3"
              } rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-[#39CCCC]/30 group`}
              data-testid={`button-add-${equipment.id}`}
            >
              <EquipmentThumbnail equipment={equipment} size={isMobile ? "md" : "md"} />
              <div className={isMobile ? "text-center" : "flex-1 text-left"}>
                <p className="text-white font-medium text-xs truncate">{equipment.name}</p>
                <p className="text-white/50 text-[10px]">
                  {equipment.capacity} • ${equipment.cost.toLocaleString()}
                </p>
              </div>
              {!isMobile && (
                <Plus className="h-4 w-4 text-white/30 group-hover:text-[#39CCCC] transition-colors" />
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface RevenueBreakdown {
  washers: number;
  dryers: number;
  vending: number;
  atm: number;
  dogwash: number;
  changer: number;
  arcade: number;
}

function MetricsPanel({
  washerCount,
  dryerCount,
  totalCost,
  totalTPD,
  dailyRevenue,
  monthlyRevenue,
  annualRevenue,
  cleanbiScore,
  dynamicPricingBoost,
  annualDynamicBoost,
  placedEquipment,
  revenueBreakdown,
  ancillaryRevenue,
  sqft,
  saveDesign,
  exportPNG,
  exportPDF,
  generateShareLink,
  onOpenConsultation,
  compact = false
}: {
  washerCount: number;
  dryerCount: number;
  totalCost: number;
  totalTPD: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  annualRevenue: number;
  cleanbiScore: number;
  dynamicPricingBoost: number;
  annualDynamicBoost: number;
  placedEquipment: PlacedEquipment[];
  revenueBreakdown: RevenueBreakdown;
  ancillaryRevenue: number;
  sqft: number;
  saveDesign: () => void;
  exportPNG: () => void;
  exportPDF: () => void;
  generateShareLink: () => void;
  onOpenConsultation: () => void;
  compact?: boolean;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-500/10 rounded-lg p-2 text-center">
          <p className="text-xl font-black text-blue-400">{washerCount}</p>
          <p className="text-[10px] text-white/60">Washers</p>
        </div>
        <div className="bg-orange-500/10 rounded-lg p-2 text-center">
          <p className="text-xl font-black text-orange-400">{dryerCount}</p>
          <p className="text-[10px] text-white/60">Dryers</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Equipment Cost</span>
          <span className="text-white font-bold" data-testid="metric-total-cost">
            ${totalCost.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Turns/Day</span>
          <span className="text-white font-bold" data-testid="metric-tpd">
            {totalTPD}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Space</span>
          <span className="text-white font-bold">{sqft.toLocaleString()} sq ft</span>
        </div>
      </div>

      {!compact && (
        <>
          <Separator className="bg-white/10" />

          <div className="space-y-1">
            <button 
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center justify-between w-full mb-1"
              data-testid="button-toggle-breakdown"
            >
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-white/80 text-xs font-medium">Revenue Projection</span>
              </div>
              <ChevronDown className={`h-3 w-3 text-white/50 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
            </button>
            <div className="bg-green-500/10 rounded-lg p-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Daily</span>
                <span className="text-green-400 font-medium">${dailyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Monthly</span>
                <span className="text-green-400 font-medium">${monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Annual</span>
                <span className="text-green-400 font-bold">${annualRevenue.toLocaleString()}</span>
              </div>
              
              {showBreakdown && monthlyRevenue > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                  <p className="text-[10px] text-white/50 font-medium mb-1">Monthly Breakdown</p>
                  {revenueBreakdown.washers > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-blue-300/70">Washers</span>
                      <span className="text-blue-300">${Math.round(revenueBreakdown.washers).toLocaleString()}</span>
                    </div>
                  )}
                  {revenueBreakdown.dryers > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-orange-300/70">Dryers</span>
                      <span className="text-orange-300">${Math.round(revenueBreakdown.dryers).toLocaleString()}</span>
                    </div>
                  )}
                  {revenueBreakdown.vending > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-purple-300/70">Vending</span>
                      <span className="text-purple-300">${Math.round(revenueBreakdown.vending).toLocaleString()}</span>
                    </div>
                  )}
                  {revenueBreakdown.atm > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-yellow-300/70">ATM</span>
                      <span className="text-yellow-300">${Math.round(revenueBreakdown.atm).toLocaleString()}</span>
                    </div>
                  )}
                  {revenueBreakdown.dogwash > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-cyan-300/70">Dog Wash</span>
                      <span className="text-cyan-300">${Math.round(revenueBreakdown.dogwash).toLocaleString()}</span>
                    </div>
                  )}
                  {revenueBreakdown.arcade > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-pink-300/70">Arcade/Games</span>
                      <span className="text-pink-300">${Math.round(revenueBreakdown.arcade).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {ancillaryRevenue > 0 && (
                    <div className="flex justify-between text-[10px] pt-1 border-t border-white/5">
                      <span className="text-[#C8A661]/70">Ancillary Total</span>
                      <span className="text-[#C8A661] font-medium">${Math.round(ancillaryRevenue).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="bg-gradient-to-br from-[#39CCCC]/20 to-[#39CCCC]/10 border border-[#39CCCC]/30 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-[#39CCCC]" />
                <p className="text-[10px] text-[#39CCCC] font-medium">Viability Scorecard</p>
              </div>
              <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                cleanbiScore >= 85 ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                cleanbiScore >= 70 ? 'bg-[#A3E635]/20 text-[#A3E635]' :
                cleanbiScore >= 55 ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                'bg-[#C8A661]/20 text-[#C8A661]'
              }`}>
                {cleanbiScore >= 85 ? 'Grade A' : 
                 cleanbiScore >= 70 ? 'Grade B' : 
                 cleanbiScore >= 55 ? 'Grade C' : 'Needs Work'}
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-black text-white">{cleanbiScore}</p>
              <p className="text-white/60 text-xs">/100</p>
            </div>
            <div className="w-full bg-black/30 rounded-full h-1.5 mt-1">
              <div 
                className={`h-1.5 rounded-full transition-all ${
                  cleanbiScore >= 85 ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A]' :
                  cleanbiScore >= 70 ? 'bg-gradient-to-r from-[#A3E635] to-[#84CC16]' :
                  cleanbiScore >= 55 ? 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]' :
                  'bg-gradient-to-r from-[#C8A661] to-[#B8955A]'
                }`}
                style={{ width: `${cleanbiScore}%` }}
              />
            </div>
            {placedEquipment.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/50">Base Score</span>
                  <span className="text-white/70">+30</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/50">Washers ({washerCount}x)</span>
                  <span className="text-white/70">+{(washerCount * 3.5).toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/50">Dryers ({dryerCount}x)</span>
                  <span className="text-white/70">+{(dryerCount * 2.5).toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/50">Balance Ratio</span>
                  <span className="text-white/70">{dryerCount > 0 && washerCount / dryerCount >= 1.2 && washerCount / dryerCount <= 1.8 ? '+12' : '+0'}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/50">Ancillary Streams</span>
                  <span className="text-white/70">{ancillaryRevenue > 0 ? '+10' : '+0'}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/50">$/sq ft Efficiency</span>
                  <span className="text-white/70">{sqft > 0 && annualRevenue / sqft >= 150 ? '+8' : sqft > 0 && annualRevenue / sqft >= 100 ? '+4' : '+0'}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/50">TPD Performance</span>
                  <span className="text-white/70">{(() => {
                    const totalTPD = placedEquipment.reduce((sum, p) => sum + (p.equipment.tpd || 0), 0);
                    return totalTPD >= 25 ? '+10' : totalTPD >= 15 ? '+5' : '+0';
                  })()}</span>
                </div>
              </div>
            )}
          </div>

          {monthlyRevenue > 0 && (
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <Zap className="h-3 w-3 text-purple-400" />
                <p className="text-[10px] text-purple-400 font-medium">AI Dynamic Pricing</p>
              </div>
              <p className="text-lg font-black text-white">
                +${dynamicPricingBoost.toLocaleString()}<span className="text-white/60 text-xs">/mo</span>
              </p>
              <p className="text-[10px] text-white/50">+${annualDynamicBoost.toLocaleString()}/year with peak pricing</p>
            </div>
          )}

          {totalCost > 0 && (
            <div className="bg-[#39CCCC]/10 border border-[#39CCCC]/20 rounded-lg p-2">
              <p className="text-[10px] text-[#39CCCC] font-medium mb-0.5">ROI Payback</p>
              <p className="text-lg font-black text-white">
                {monthlyRevenue > 0 ? Math.round(totalCost / monthlyRevenue) : '--'} months
              </p>
              {sqft > 0 && annualRevenue > 0 && (
                <p className="text-[9px] text-white/50 mt-1">
                  ${Math.round(annualRevenue / sqft)}/sq ft annually
                </p>
              )}
            </div>
          )}

          {/* Valuation Estimates - Pro+ Feature */}
          {monthlyRevenue > 0 && (
            <ValuationEstimatesPanel
              monthlyRevenue={monthlyRevenue}
              annualRevenue={annualRevenue}
              totalEquipmentCost={totalCost}
              locationScore={locationContext?.cleanbiScore}
              locationGrade={locationContext?.grade}
              sqft={sqft}
            />
          )}

          {/* Smart Optimization Tips */}
          {placedEquipment.length > 0 && (
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-2">
                <Lightbulb className="h-3 w-3 text-amber-400" />
                <p className="text-[10px] text-amber-400 font-medium">Revenue Optimization</p>
              </div>
              <div className="space-y-1.5 text-[9px]">
                {washerCount > 0 && dryerCount === 0 && (
                  <div className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <p className="text-white/70">Add dryers to complete your laundry cycle. Ideal ratio is 1.3-1.5 washers per dryer.</p>
                  </div>
                )}
                {dryerCount > 0 && washerCount > 0 && (washerCount / dryerCount < 1.2 || washerCount / dryerCount > 1.8) && (
                  <div className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <p className="text-white/70">Optimize washer-dryer ratio (current: {(washerCount / dryerCount).toFixed(1)}:1, ideal: 1.3-1.5:1)</p>
                  </div>
                )}
                {ancillaryRevenue === 0 && washerCount >= 3 && (
                  <div className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                    <p className="text-white/70">Add vending or ATM for +$300-600/mo ancillary revenue</p>
                  </div>
                )}
                {revenueBreakdown.dogwash === 0 && sqft >= 1500 && (
                  <div className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <p className="text-white/70">Dog wash stations generate $800-1,500/mo in urban areas</p>
                  </div>
                )}
                {sqft > 0 && annualRevenue / sqft < 100 && washerCount >= 2 && (
                  <div className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <p className="text-white/70">Below industry avg ($100-150/sq ft). Add higher-capacity machines.</p>
                  </div>
                )}
                {sqft > 0 && annualRevenue / sqft >= 150 && (
                  <div className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                    <p className="text-white/70">Excellent revenue efficiency! Top 25% of laundromats.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator className="bg-white/10" />

          {placedEquipment.length > 0 && (
            <div className="bg-gradient-to-r from-[#39CCCC] to-[#2AA0A0] rounded-lg p-3 text-center">
              <p className="text-white font-bold text-sm mb-1">Ready to Launch?</p>
              <p className="text-[#001F3F]/70 text-[10px] mb-2">Pre-load your machines in WashBizPOS</p>
              <Link href="/pricing">
                <Button 
                  className="w-full h-8 bg-[#001F3F] text-white hover:bg-[#001F3F]/90 text-xs font-bold"
                  data-testid="button-launch-pos-trial"
                >
                  Get Started Now
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      <div className="space-y-1.5 pt-1">
        <Button 
          className="w-full h-9 bg-[#39CCCC] text-[#001F3F] hover:bg-[#39CCCC]/90 text-xs font-medium"
          onClick={saveDesign}
          data-testid="button-save-design"
        >
          <Save className="h-3 w-3 mr-1.5" />
          Save Design
        </Button>
        <Button 
          className="w-full h-9 bg-gradient-to-r from-[#001F3F] to-[#003366] text-white hover:from-[#002850] hover:to-[#004080] text-xs font-medium border border-[#39CCCC]/30"
          onClick={exportPDF}
          data-testid="button-export-pdf"
        >
          <FileText className="h-3 w-3 mr-1.5" />
          Export PDF
        </Button>
        <div className="grid grid-cols-2 gap-1.5">
          <Button 
            variant="outline"
            className="h-8 text-xs border-white/20 text-white/70 hover:text-white"
            onClick={exportPNG}
            data-testid="button-export-png"
          >
            <Download className="h-3 w-3 mr-1" />
            PNG
          </Button>
          <Button 
            variant="outline"
            className="h-8 text-xs border-white/20 text-white/70 hover:text-white"
            onClick={generateShareLink}
            data-testid="button-share-link"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        </div>
        
        {placedEquipment.length > 0 && (
          <Button 
            className="w-full h-11 bg-gradient-to-r from-[#C8A661] via-[#D4B872] to-[#C8A661] text-[#001F3F] hover:from-[#D4B872] hover:via-[#E5C983] hover:to-[#D4B872] text-xs font-bold shadow-lg border border-[#B8955A]/30"
            onClick={onOpenConsultation}
            data-testid="button-send-to-consultant"
          >
            <Users className="h-4 w-4 mr-2" />
            Request Professional Analysis
          </Button>
        )}
      </div>
    </div>
  );
}

export default function DesignStudio() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLDivElement>(null);
  
  const [studioType, setStudioType] = useState<"2d" | "3d">("2d");
  const [dimensions, setDimensions] = useState({ width: 3600, depth: 2400 });
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [showLabels, setShowLabels] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [equipmentSheetOpen, setEquipmentSheetOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(50);
  const [backgroundScale, setBackgroundScale] = useState(100);
  const [backgroundVisible, setBackgroundVisible] = useState(true);
  const [floorPlanDialogOpen, setFloorPlanDialogOpen] = useState(false);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  
  const [aiSuggestionDialogOpen, setAiSuggestionDialogOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isApplyingAISuggestion, setIsApplyingAISuggestion] = useState(false);
  
  const [locationContext, setLocationContext] = useState<LocationContext | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [sendToConsultantDialogOpen, setSendToConsultantDialogOpen] = useState(false);
  const [isSendingToConsultant, setIsSendingToConsultant] = useState(false);
  const [consultantNotes, setConsultantNotes] = useState("");

  const { currentLocation, clearLocationContext, calculateRevenueMultiplier, isLocationLinked } = useLocationDesign();

  useEffect(() => {
    if (currentLocation && !locationContext) {
      setLocationContext({
        address: currentLocation.address,
        cleanbiScore: currentLocation.cleanbiScore,
        grade: currentLocation.grade,
        medianIncome: currentLocation.demographics.medianIncome,
        populationDensity: currentLocation.demographics.populationDensity,
        competitorCount: currentLocation.competition.count,
        trafficScore: currentLocation.traffic.score,
        opportunityLevel: currentLocation.opportunityLevel,
        revenueMultiplier: calculateRevenueMultiplier(currentLocation),
        notes: ''
      });
    }
  }, [currentLocation, locationContext, calculateRevenueMultiplier]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('designStudioOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const savedBackground = localStorage.getItem('designStudio-floorPlan');
    if (savedBackground) {
      try {
        const parsed = JSON.parse(savedBackground);
        if (parsed.image) setBackgroundImage(parsed.image);
        if (typeof parsed.opacity === 'number') setBackgroundOpacity(parsed.opacity);
        if (typeof parsed.scale === 'number') setBackgroundScale(parsed.scale);
        if (typeof parsed.visible === 'boolean') setBackgroundVisible(parsed.visible);
      } catch (e) {
        console.error('Failed to load floor plan from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (backgroundImage) {
      const data = {
        image: backgroundImage,
        opacity: backgroundOpacity,
        scale: backgroundScale,
        visible: backgroundVisible,
      };
      localStorage.setItem('designStudio-floorPlan', JSON.stringify(data));
    }
  }, [backgroundImage, backgroundOpacity, backgroundScale, backgroundVisible]);

  const handleFloorPlanUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG, JPG, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBackgroundImage(result);
      setBackgroundVisible(true);
      setBackgroundOpacity(50);
      setBackgroundScale(100);
      toast({
        title: "Floor Plan Imported",
        description: "Your floor plan has been added as a background. Adjust opacity and scale as needed.",
      });
    };
    reader.onerror = () => {
      toast({
        title: "Upload Failed",
        description: "Could not read the file. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);

    if (floorPlanInputRef.current) {
      floorPlanInputRef.current.value = '';
    }
  }, [toast]);

  const removeFloorPlan = useCallback(() => {
    setBackgroundImage(null);
    setBackgroundOpacity(50);
    setBackgroundScale(100);
    setBackgroundVisible(true);
    localStorage.removeItem('designStudio-floorPlan');
    toast({
      title: "Floor Plan Removed",
      description: "The background floor plan has been removed.",
    });
  }, [toast]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.offsetWidth;
        const aspectRatio = dimensions.width / dimensions.depth;
        const padding = 16;
        const availableWidth = containerWidth - padding * 2;
        const maxHeight = isMobile ? 400 : 600;
        
        let width = availableWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [dimensions, isMobile]);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('designStudioOnboarding', 'true');
  }, []);

  const pushToHistory = useCallback((newEquipment: PlacedEquipment[], newDimensions = dimensions) => {
    const newState: HistoryState = { 
      equipment: JSON.parse(JSON.stringify(newEquipment)), 
      dimensions: { ...newDimensions } 
    };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex, dimensions]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPlacedEquipment(prevState.equipment);
      setDimensions(prevState.dimensions);
      setHistoryIndex(prev => prev - 1);
      toast({ title: "Undone", description: "Last action reversed." });
    }
  }, [historyIndex, history, toast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPlacedEquipment(nextState.equipment);
      setDimensions(nextState.dimensions);
      setHistoryIndex(prev => prev + 1);
      toast({ title: "Redone", description: "Action restored." });
    }
  }, [historyIndex, history, toast]);

  const filteredEquipment = equipmentLibrary.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.capacity.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryTypes = getCategoryTypes(categoryFilter);
    const matchesCategory = categoryFilter === "all" || categoryTypes.includes(e.type);
    return matchesSearch && matchesCategory;
  });

  const totalCost = placedEquipment.reduce((sum, item) => sum + item.equipment.cost, 0);
  const totalTPD = placedEquipment.reduce((sum, item) => sum + item.equipment.tpdContribution, 0);
  const washerCount = placedEquipment.filter(item => item.equipment.type === "washer").length;
  const dryerCount = placedEquipment.filter(item => item.equipment.type === "dryer").length;

  // Enhanced revenue calculations using equipment database values
  const revenueBreakdown = {
    washers: placedEquipment
      .filter(item => item.equipment.type === "washer")
      .reduce((sum, item) => sum + (item.equipment.roiMonthly || item.equipment.tpdContribution * 4.50 * 30), 0),
    dryers: placedEquipment
      .filter(item => item.equipment.type === "dryer")
      .reduce((sum, item) => sum + (item.equipment.roiMonthly || item.equipment.tpdContribution * 3.50 * 30), 0),
    vending: placedEquipment
      .filter(item => item.equipment.type === "vending")
      .reduce((sum, item) => sum + (item.equipment.roiMonthly || 400), 0),
    atm: placedEquipment
      .filter(item => item.equipment.type === "atm")
      .reduce((sum, item) => sum + (item.equipment.roiMonthly || 350), 0),
    dogwash: placedEquipment
      .filter(item => item.equipment.type === "dogwash")
      .reduce((sum, item) => sum + (item.equipment.roiMonthly || 1200), 0),
    changer: placedEquipment
      .filter(item => item.equipment.type === "changer")
      .reduce((sum, item) => sum + (item.equipment.roiMonthly || 0), 0),
    arcade: placedEquipment
      .filter(item => ["arcade", "entertainment"].includes(item.equipment.type))
      .reduce((sum, item) => sum + (item.equipment.roiMonthly || 150), 0),
  };
  
  const washerRevenue = revenueBreakdown.washers;
  const dryerRevenue = revenueBreakdown.dryers;
  const ancillaryRevenue = revenueBreakdown.vending + revenueBreakdown.atm + 
    revenueBreakdown.dogwash + revenueBreakdown.arcade;
  
  const baseMonthlyRevenue = washerRevenue + dryerRevenue + ancillaryRevenue;
  const locationMultiplier = locationContext?.revenueMultiplier ?? 1.0;
  const monthlyRevenue = Math.round(baseMonthlyRevenue * locationMultiplier);
  const dailyRevenue = Math.round(monthlyRevenue / 30);
  const annualRevenue = monthlyRevenue * 12;
  
  // CLEANBI score with more sophisticated calculation
  const sqft = Math.round((dimensions.width / 12) * (dimensions.depth / 12));
  const revenuePerSqft = sqft > 0 ? annualRevenue / sqft : 0;
  const washerDryerRatio = dryerCount > 0 ? washerCount / dryerCount : 0;
  const hasAncillary = ancillaryRevenue > 0;
  const hasOptimalRatio = washerDryerRatio >= 1.2 && washerDryerRatio <= 1.8;
  
  const cleanbiScore = Math.min(100, Math.round(
    30 + // Base score
    (washerCount * 3.5) + // Machine capacity
    (dryerCount * 2.5) + 
    (hasOptimalRatio ? 12 : 0) + // Equipment balance bonus
    (hasAncillary ? 10 : 0) + // Ancillary revenue stream
    (revenuePerSqft >= 150 ? 8 : revenuePerSqft >= 100 ? 4 : 0) + // Revenue efficiency
    (totalTPD >= 25 ? 10 : totalTPD >= 15 ? 5 : 0) // TPD performance
  ));
  
  const dynamicPricingBoost = Math.round(monthlyRevenue * 0.22);
  const annualDynamicBoost = dynamicPricingBoost * 12;

  const addEquipment = useCallback((equipment: typeof equipmentLibrary[number]) => {
    const scaledWidth = Math.round(equipment.width * SCALE_FACTOR);
    const scaledHeight = Math.round(equipment.depth * SCALE_FACTOR);
    
    const offsetX = Math.random() * 100 - 50;
    const offsetY = Math.random() * 100 - 50;
    
    const newItem: PlacedEquipment = {
      id: `${equipment.id}-${Date.now()}`,
      x: (canvasSize.width / 2) - scaledWidth / 2 + offsetX,
      y: (canvasSize.height / 2) - scaledHeight / 2 + offsetY,
      z: 0,
      width: scaledWidth,
      height: scaledHeight,
      depth: equipment.height * SCALE_FACTOR,
      rotation: 0,
      equipment,
    };
    
    const newEquipment = [...placedEquipment, newItem];
    setPlacedEquipment(newEquipment);
    setSelectedId(newItem.id);
    pushToHistory(newEquipment);
    
    toast({
      title: "Equipment Added",
      description: `${equipment.name} added to your design.`,
    });
    
    if (isMobile) {
      setEquipmentSheetOpen(false);
    }
  }, [canvasSize, placedEquipment, pushToHistory, toast, isMobile]);

  const removeEquipment = useCallback((id: string) => {
    const newEquipment = placedEquipment.filter(item => item.id !== id);
    setPlacedEquipment(newEquipment);
    setSelectedId(null);
    pushToHistory(newEquipment);
    toast({
      title: "Equipment Removed",
      description: "Equipment removed from design.",
    });
  }, [placedEquipment, pushToHistory, toast]);

  const rotateEquipment = useCallback((id: string) => {
    const newEquipment = placedEquipment.map(item => {
      if (item.id === id) {
        return {
          ...item,
          rotation: (item.rotation + 90) % 360,
          width: item.height,
          height: item.width,
        };
      }
      return item;
    });
    setPlacedEquipment(newEquipment);
    pushToHistory(newEquipment);
  }, [placedEquipment, pushToHistory]);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    const snappedX = snapToGrid ? Math.round(x / GRID_SIZE) * GRID_SIZE : x;
    const snappedY = snapToGrid ? Math.round(y / GRID_SIZE) * GRID_SIZE : y;
    
    setPlacedEquipment(prev => prev.map(item => 
      item.id === id ? { ...item, x: snappedX, y: snappedY } : item
    ));
  }, [snapToGrid]);

  const onDragStop = useCallback((id: string, x: number, y: number) => {
    const snappedX = snapToGrid ? Math.round(x / GRID_SIZE) * GRID_SIZE : x;
    const snappedY = snapToGrid ? Math.round(y / GRID_SIZE) * GRID_SIZE : y;
    
    const newEquipment = placedEquipment.map(item => 
      item.id === id ? { ...item, x: snappedX, y: snappedY } : item
    );
    setPlacedEquipment(newEquipment);
    pushToHistory(newEquipment);
  }, [snapToGrid, placedEquipment, pushToHistory]);

  const clearCanvas = useCallback(() => {
    setPlacedEquipment([]);
    setSelectedId(null);
    pushToHistory([]);
    toast({
      title: "Canvas Cleared",
      description: "All equipment has been removed.",
    });
  }, [pushToHistory, toast]);

  const loadTemplate = useCallback((template: StarterTemplate) => {
    const newEquipment: PlacedEquipment[] = template.equipment.map((item, index) => {
      const equipment = equipmentLibrary.find(e => e.id === item.equipmentId);
      if (!equipment) return null;
      
      const scaledWidth = Math.round(equipment.width * SCALE_FACTOR);
      const scaledHeight = Math.round(equipment.depth * SCALE_FACTOR);
      
      return {
        id: `${item.equipmentId}-${Date.now()}-${index}`,
        x: item.x,
        y: item.y,
        z: 0,
        width: scaledWidth,
        height: scaledHeight,
        depth: equipment.height * SCALE_FACTOR,
        rotation: item.rotation,
        equipment,
      };
    }).filter(Boolean) as PlacedEquipment[];
    
    setDimensions(template.dimensions);
    setPlacedEquipment(newEquipment);
    pushToHistory(newEquipment, template.dimensions);
    
    toast({
      title: "Template Loaded",
      description: `${template.name} template with ${newEquipment.length} pieces of equipment.`,
    });
  }, [pushToHistory, toast]);

  const suggestAILayout = useCallback(() => {
    const widthFt = Math.round(dimensions.width / 12);
    const depthFt = Math.round(dimensions.depth / 12);
    const sqft = widthFt * depthFt;
    
    let roomSize: 'small' | 'medium' | 'large';
    let recommendedWashers: number;
    let recommendedDryers: number;
    let washerPlacement: string;
    let dryerPlacement: string;
    let additionalTips: string[];
    
    if (sqft < 1500) {
      roomSize = 'small';
      recommendedWashers = Math.min(6, Math.max(4, Math.floor(sqft / 250)));
      recommendedDryers = Math.min(4, Math.max(3, Math.floor(recommendedWashers * 0.7)));
      washerPlacement = "Line washers along the front wall for easy customer access";
      dryerPlacement = "Stack dryers on the back wall to maximize floor space";
      additionalTips = [
        "Consider 2-3 high-capacity washers for bedding customers",
        "Add a folding table near the exit",
        "Install a change machine near the entrance"
      ];
    } else if (sqft <= 3000) {
      roomSize = 'medium';
      recommendedWashers = Math.min(12, Math.max(8, Math.floor(sqft / 200)));
      recommendedDryers = Math.min(8, Math.max(6, Math.floor(recommendedWashers * 0.65)));
      washerPlacement = "Create two rows of washers with aisle access from both sides";
      dryerPlacement = "Position dryers along the back and side walls";
      additionalTips = [
        "Mix washer sizes: 60% standard, 40% large capacity",
        "Add seating area in the center",
        "Consider a dog wash station for additional revenue",
        "Install an ATM for customer convenience"
      ];
    } else {
      roomSize = 'large';
      recommendedWashers = Math.min(20, Math.max(15, Math.floor(sqft / 175)));
      recommendedDryers = Math.min(14, Math.max(10, Math.floor(recommendedWashers * 0.6)));
      washerPlacement = "Create a U-shaped washer layout with clear traffic flow";
      dryerPlacement = "Dedicate a full wall section to stacked dryers";
      additionalTips = [
        "Add a premium section with extra-large washers",
        "Include a wash-dry-fold service area",
        "Install multiple folding stations",
        "Consider vending machines and an arcade area",
        "Add a comfortable waiting lounge"
      ];
    }
    
    const avgVendPrice = 4.50;
    const avgTpdPerMachine = 4;
    const totalMachines = recommendedWashers + recommendedDryers;
    const estimatedDailyRevenue = totalMachines * avgTpdPerMachine * avgVendPrice;
    const projectedMonthlyRevenue = Math.round(estimatedDailyRevenue * 30);
    const projectedAnnualRevenue = projectedMonthlyRevenue * 12;
    
    const washerEquip = equipmentLibrary.find(e => e.id === 'dexter-t900');
    const dryerEquip = equipmentLibrary.find(e => e.id === 'speed-queen-stack');
    const washerCost = washerEquip?.cost || 8000;
    const dryerCost = dryerEquip?.cost || 12000;
    const equipmentCost = (recommendedWashers * washerCost) + (recommendedDryers * dryerCost);
    
    const cleanbiScore = Math.min(100, 45 + 
      (recommendedWashers * 3) + 
      (recommendedDryers * 2.5) + 
      (roomSize === 'large' ? 10 : roomSize === 'medium' ? 5 : 0)
    );
    
    const suggestion: AISuggestion = {
      roomSize,
      sqft,
      recommendedWashers,
      recommendedDryers,
      projectedMonthlyRevenue,
      projectedAnnualRevenue,
      cleanbiScore: Math.round(cleanbiScore),
      equipmentCost,
      washerPlacement,
      dryerPlacement,
      additionalTips,
    };
    
    setAiSuggestion(suggestion);
    setAiSuggestionDialogOpen(true);
  }, [dimensions]);

  const applyAISuggestion = useCallback(async () => {
    if (!aiSuggestion) return;
    
    setIsApplyingAISuggestion(true);
    
    const washerEquip = equipmentLibrary.find(e => e.id === 'dexter-t900') || equipmentLibrary[0];
    const dryerEquip = equipmentLibrary.find(e => e.id === 'speed-queen-stack') || equipmentLibrary.find(e => e.type === 'dryer') || equipmentLibrary[1];
    
    const newEquipment: PlacedEquipment[] = [];
    const startX = 60;
    const startY = 80;
    const spacingX = 70;
    const spacingY = 100;
    
    const washersPerRow = Math.ceil(Math.sqrt(aiSuggestion.recommendedWashers * 1.5));
    for (let i = 0; i < aiSuggestion.recommendedWashers; i++) {
      const row = Math.floor(i / washersPerRow);
      const col = i % washersPerRow;
      
      const scaledWidth = Math.round(washerEquip.width * SCALE_FACTOR);
      const scaledHeight = Math.round(washerEquip.depth * SCALE_FACTOR);
      
      newEquipment.push({
        id: `washer-ai-${Date.now()}-${i}`,
        x: startX + col * spacingX,
        y: startY + row * spacingY,
        z: 0,
        width: scaledWidth,
        height: scaledHeight,
        depth: washerEquip.height * SCALE_FACTOR,
        rotation: 0,
        equipment: washerEquip,
      });
      
      await new Promise(resolve => setTimeout(resolve, 80));
      setPlacedEquipment([...newEquipment]);
    }
    
    const dryerStartY = startY + (Math.ceil(aiSuggestion.recommendedWashers / washersPerRow) + 1) * spacingY;
    const dryersPerRow = Math.ceil(Math.sqrt(aiSuggestion.recommendedDryers * 2));
    
    for (let i = 0; i < aiSuggestion.recommendedDryers; i++) {
      const row = Math.floor(i / dryersPerRow);
      const col = i % dryersPerRow;
      
      const scaledWidth = Math.round(dryerEquip.width * SCALE_FACTOR);
      const scaledHeight = Math.round(dryerEquip.depth * SCALE_FACTOR);
      
      newEquipment.push({
        id: `dryer-ai-${Date.now()}-${i}`,
        x: startX + col * spacingX,
        y: dryerStartY + row * spacingY,
        z: 0,
        width: scaledWidth,
        height: scaledHeight,
        depth: dryerEquip.height * SCALE_FACTOR,
        rotation: 0,
        equipment: dryerEquip,
      });
      
      await new Promise(resolve => setTimeout(resolve, 80));
      setPlacedEquipment([...newEquipment]);
    }
    
    pushToHistory(newEquipment);
    setIsApplyingAISuggestion(false);
    setAiSuggestionDialogOpen(false);
    
    toast({
      title: "AI Layout Applied",
      description: `Added ${aiSuggestion.recommendedWashers} washers and ${aiSuggestion.recommendedDryers} dryers to your design.`,
    });
  }, [aiSuggestion, pushToHistory, toast]);

  const saveDesign = useCallback(() => {
    const design = {
      dimensions,
      equipment: placedEquipment,
      totalCost,
      totalTPD,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('washbizhub-design', JSON.stringify(design));
    toast({
      title: "Design Saved",
      description: "Your design has been saved locally.",
    });
  }, [dimensions, placedEquipment, totalCost, totalTPD, toast]);

  const exportPNG = useCallback(async () => {
    if (!canvas2DRef.current) {
      toast({
        title: "Export Error",
        description: "Please switch to 2D view to export.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const canvas = await html2canvas(canvas2DRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `laundromat-design-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "Export Complete",
        description: "Design exported as PNG.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export design. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const exportPDF = useCallback(async () => {
    if (!canvas2DRef.current) {
      toast({
        title: "Export Error",
        description: "Please switch to 2D view to export PDF.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating PDF...",
      description: "Please wait while we create your professional floor plan.",
    });

    try {
      const canvas = await html2canvas(canvas2DRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      const navyColor: [number, number, number] = [0, 31, 63];
      const tealColor: [number, number, number] = [57, 204, 204];
      const darkBg: [number, number, number] = [26, 26, 46];

      pdf.setFillColor(...navyColor);
      pdf.rect(0, 0, pageWidth, 45, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('WashBizHub', margin, 18);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...tealColor);
      pdf.text('Design Studio', margin, 26);

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Laundromat Floor Plan', margin, 38);

      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 200, 200);
      pdf.text(currentDate, pageWidth - margin - pdf.getTextWidth(currentDate), 38);

      const roomSqFt = Math.round((dimensions.width * dimensions.depth) / 144);
      const projectName = `${roomSqFt.toLocaleString()} sq ft Layout`;
      pdf.setTextColor(...tealColor);
      pdf.setFontSize(8);
      pdf.text(projectName, margin, 43);

      let yPos = 55;

      const imgData = canvas.toDataURL('image/png');
      const imgAspectRatio = canvas.width / canvas.height;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth / imgAspectRatio;
      const maxImgHeight = 80;
      const finalImgHeight = Math.min(imgHeight, maxImgHeight);
      const finalImgWidth = finalImgHeight * imgAspectRatio;
      const imgX = margin + (contentWidth - finalImgWidth) / 2;

      pdf.setFillColor(...darkBg);
      pdf.roundedRect(imgX - 3, yPos - 3, finalImgWidth + 6, finalImgHeight + 6, 2, 2, 'F');

      pdf.addImage(imgData, 'PNG', imgX, yPos, finalImgWidth, finalImgHeight);

      pdf.setDrawColor(...tealColor);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(imgX - 3, yPos - 3, finalImgWidth + 6, finalImgHeight + 6, 2, 2, 'S');

      yPos += finalImgHeight + 15;

      pdf.setFillColor(245, 245, 250);
      pdf.roundedRect(margin, yPos, contentWidth, 28, 2, 2, 'F');

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...navyColor);
      pdf.text('DESIGN METRICS', margin + 5, yPos + 8);

      const metricsY = yPos + 16;
      const metricSpacing = contentWidth / 4;
      const metrics = [
        { label: 'Washers', value: washerCount.toString(), color: [59, 130, 246] as [number, number, number] },
        { label: 'Dryers', value: dryerCount.toString(), color: [249, 115, 22] as [number, number, number] },
        { label: 'Turns/Day', value: totalTPD.toString(), color: [34, 197, 94] as [number, number, number] },
        { label: 'CLEANBI', value: cleanbiScore.toString(), color: tealColor },
      ];

      metrics.forEach((metric, index) => {
        const x = margin + 5 + index * metricSpacing;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...metric.color);
        pdf.text(metric.value, x, metricsY);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(metric.label, x, metricsY + 6);
      });

      yPos += 35;

      pdf.setFillColor(...navyColor);
      pdf.roundedRect(margin, yPos, contentWidth / 2 - 3, 50, 2, 2, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...tealColor);
      pdf.text('FINANCIAL SUMMARY', margin + 5, yPos + 10);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(255, 255, 255);
      const financials = [
        { label: 'Equipment Cost:', value: `$${totalCost.toLocaleString()}` },
        { label: 'Daily Revenue:', value: `$${dailyRevenue.toLocaleString()}` },
        { label: 'Monthly Revenue:', value: `$${monthlyRevenue.toLocaleString()}` },
        { label: 'Annual Revenue:', value: `$${annualRevenue.toLocaleString()}` },
      ];

      financials.forEach((item, index) => {
        pdf.setTextColor(200, 200, 200);
        pdf.text(item.label, margin + 5, yPos + 20 + index * 7);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.value, margin + 45, yPos + 20 + index * 7);
        pdf.setFont('helvetica', 'normal');
      });

      const rightBoxX = margin + contentWidth / 2 + 3;
      pdf.setFillColor(245, 245, 250);
      pdf.roundedRect(rightBoxX, yPos, contentWidth / 2 - 3, 50, 2, 2, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...navyColor);
      pdf.text('ROI ANALYSIS', rightBoxX + 5, yPos + 10);

      const paybackMonths = monthlyRevenue > 0 ? Math.round(totalCost / monthlyRevenue) : 0;
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');

      const roiData = [
        { label: 'Payback Period:', value: paybackMonths > 0 ? `${paybackMonths} months` : 'N/A' },
        { label: 'Dynamic Pricing Boost:', value: `+$${dynamicPricingBoost.toLocaleString()}/mo` },
        { label: 'Annual Boost:', value: `+$${annualDynamicBoost.toLocaleString()}/yr` },
        { label: 'Room Size:', value: `${roomSqFt.toLocaleString()} sq ft` },
      ];

      roiData.forEach((item, index) => {
        pdf.setTextColor(100, 100, 100);
        pdf.text(item.label, rightBoxX + 5, yPos + 20 + index * 7);
        pdf.setTextColor(34, 34, 34);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.value, rightBoxX + 45, yPos + 20 + index * 7);
        pdf.setFont('helvetica', 'normal');
      });

      yPos += 60;

      if (placedEquipment.length > 0) {
        pdf.setFillColor(250, 250, 252);
        pdf.roundedRect(margin, yPos, contentWidth, 8 + Math.min(placedEquipment.length, 10) * 6 + 8, 2, 2, 'F');

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...navyColor);
        pdf.text('EQUIPMENT LIST', margin + 5, yPos + 7);

        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin + 5, yPos + 10, margin + contentWidth - 5, yPos + 10);

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 100, 100);
        pdf.text('Equipment', margin + 5, yPos + 16);
        pdf.text('Capacity', margin + 70, yPos + 16);
        pdf.text('TPD', margin + 110, yPos + 16);
        pdf.text('Cost', margin + 135, yPos + 16);

        const equipmentSummary: Record<string, { count: number; equipment: typeof equipmentLibrary[number] }> = {};
        placedEquipment.forEach((item) => {
          const key = item.equipment.id;
          if (equipmentSummary[key]) {
            equipmentSummary[key].count++;
          } else {
            equipmentSummary[key] = { count: 1, equipment: item.equipment };
          }
        });

        let listY = yPos + 24;
        Object.values(equipmentSummary).slice(0, 10).forEach((item) => {
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(50, 50, 50);
          const displayName = item.count > 1 ? `${item.equipment.name} (x${item.count})` : item.equipment.name;
          pdf.text(displayName.substring(0, 35), margin + 5, listY);
          pdf.text(item.equipment.capacity, margin + 70, listY);
          pdf.text((item.equipment.tpdContribution * item.count).toString(), margin + 110, listY);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...navyColor);
          pdf.text(`$${(item.equipment.cost * item.count).toLocaleString()}`, margin + 135, listY);
          listY += 6;
        });

        if (Object.keys(equipmentSummary).length > 10) {
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(100, 100, 100);
          pdf.text(`... and ${Object.keys(equipmentSummary).length - 10} more items`, margin + 5, listY);
        }
      }

      pdf.setFillColor(...navyColor);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 200, 200);
      pdf.text('Generated by WashBizHub Design Studio', margin, pageHeight - 10);

      pdf.setTextColor(...tealColor);
      const website = 'washbizhub.com';
      pdf.text(website, pageWidth - margin - pdf.getTextWidth(website), pageHeight - 10);

      pdf.save(`laundromat-floor-plan-${Date.now()}.pdf`);

      toast({
        title: "PDF Exported Successfully",
        description: "Your professional floor plan is ready for presentation.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [canvas2DRef, dimensions, placedEquipment, washerCount, dryerCount, totalCost, totalTPD, dailyRevenue, monthlyRevenue, annualRevenue, cleanbiScore, dynamicPricingBoost, annualDynamicBoost, toast]);

  const generateShareLink = useCallback(() => {
    const designData = {
      d: dimensions,
      e: placedEquipment.map(e => ({
        id: e.equipment.id,
        x: Math.round(e.x),
        y: Math.round(e.y),
        r: e.rotation,
      })),
    };
    
    const encoded = btoa(JSON.stringify(designData));
    const shareUrl = `${window.location.origin}/design-studio?share=${encoded}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: "Link Copied!",
        description: "Share this link to collaborate on your design.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Could not copy link. Please try again.",
        variant: "destructive",
      });
    });
  }, [dimensions, placedEquipment, toast]);

  const sendToConsultant = useCallback(async () => {
    if (placedEquipment.length === 0) {
      toast({
        title: "No Equipment",
        description: "Add equipment to your design before sending to consultant.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSendingToConsultant(true);
    
    try {
      const sqft = Math.round((dimensions.width * dimensions.depth) / 144);
      const locationMultiplier = locationContext ? locationContext.revenueMultiplier : 1.0;
      const adjustedMonthlyRevenue = Math.round(monthlyRevenue * locationMultiplier);
      const adjustedAnnualRevenue = Math.round(annualRevenue * locationMultiplier);
      
      const equipmentSummary: Record<string, { count: number; equipment: typeof equipmentLibrary[number] }> = {};
      placedEquipment.forEach((item) => {
        const key = item.equipment.id;
        if (equipmentSummary[key]) {
          equipmentSummary[key].count++;
        } else {
          equipmentSummary[key] = { count: 1, equipment: item.equipment };
        }
      });
      
      const equipmentList = Object.values(equipmentSummary).map(item => ({
        name: item.equipment.name,
        brand: item.equipment.brand,
        capacity: item.equipment.capacity,
        count: item.count,
        unitCost: item.equipment.cost,
        totalCost: item.equipment.cost * item.count,
        tpdContribution: item.equipment.tpdContribution * item.count,
      }));
      
      const designPackage = {
        dimensions: {
          widthInches: dimensions.width,
          depthInches: dimensions.depth,
          sqft,
        },
        equipment: equipmentList,
        totals: {
          equipmentCount: placedEquipment.length,
          washerCount,
          dryerCount,
          totalCost,
          totalTPD,
        },
        projections: {
          dailyRevenue,
          monthlyRevenue: adjustedMonthlyRevenue,
          annualRevenue: adjustedAnnualRevenue,
          locationMultiplier,
          dynamicPricingBoost,
          annualDynamicBoost,
        },
        scores: {
          cleanbiScore,
          grade: cleanbiScore >= 85 ? 'A' : cleanbiScore >= 70 ? 'B' : cleanbiScore >= 55 ? 'C' : 'Needs Work',
        },
        location: locationContext || null,
        notes: consultantNotes,
        timestamp: new Date().toISOString(),
      };
      
      const response = await fetch('/api/send-design-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(designPackage),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send consultation request');
      }
      
      setSendToConsultantDialogOpen(false);
      setConsultantNotes("");
      
      toast({
        title: "Consultation Request Sent!",
        description: "Nick and Larry will review your design and reach out within 24-48 hours.",
      });
    } catch (error) {
      console.error('Consultation request error:', error);
      toast({
        title: "Send Failed",
        description: "Could not send consultation request. Please try again or email consult@washbizhub.com directly.",
        variant: "destructive",
      });
    } finally {
      setIsSendingToConsultant(false);
    }
  }, [placedEquipment, dimensions, locationContext, monthlyRevenue, annualRevenue, washerCount, dryerCount, totalCost, totalTPD, dailyRevenue, cleanbiScore, dynamicPricingBoost, annualDynamicBoost, consultantNotes, toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    
    if (shareData) {
      try {
        const decoded = JSON.parse(atob(shareData));
        if (decoded.d && decoded.e) {
          setDimensions(decoded.d);
          const loadedEquipment: PlacedEquipment[] = decoded.e.map((item: { id: string; x: number; y: number; r: number }, index: number) => {
            const equipment = equipmentLibrary.find(e => e.id === item.id);
            if (!equipment) return null;
            
            const scaledWidth = Math.round(equipment.width * SCALE_FACTOR);
            const scaledHeight = Math.round(equipment.depth * SCALE_FACTOR);
            
            return {
              id: `${item.id}-loaded-${index}`,
              x: item.x,
              y: item.y,
              z: 0,
              width: scaledWidth,
              height: scaledHeight,
              depth: equipment.height * SCALE_FACTOR,
              rotation: item.r,
              equipment,
            };
          }).filter(Boolean);
          
          setPlacedEquipment(loadedEquipment);
          toast({
            title: "Design Loaded",
            description: "Shared design has been loaded successfully.",
          });
        }
      } catch (e) {
        console.error('Failed to load shared design:', e);
      }
    }
  }, [toast]);

  const selectedEquipment = placedEquipment.find(item => item.id === selectedId);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "WashBizHub Design Studio - Laundromat Floor Plan Designer",
    "alternateName": "Laundromat Design Studio",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Floor Plan Design",
    "operatingSystem": "Web Browser",
    "description": "Professional 2D and 3D laundromat floor plan designer with drag-and-drop equipment library featuring Dexter, Speed Queen, and more. Includes real-time cost calculations, TPD analysis, and ROI projections.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "312",
      "bestRating": "5"
    },
    "featureList": [
      "2D and 3D floor plan views",
      "Drag-and-drop equipment placement",
      "Real 2025 manufacturer equipment pricing (Speed Queen, Dexter, ADC, Maytag)",
      "Real-time equipment cost calculator",
      "TPD (Turns Per Day) analysis",
      "Revenue breakdown by equipment category (washers, dryers, ancillary)",
      "Ancillary revenue optimization (vending, ATM, dog wash, arcade)",
      "CLEANBI viability scoring with optimization tips",
      "Washer-dryer ratio optimization",
      "Revenue per square foot analysis",
      "ROI payback period calculator",
      "Dynamic pricing boost projections",
      "Starter templates (1,000-5,000 sq ft)",
      "Contractor-ready PDF exports",
      "Sharable design links"
    ],
    "screenshot": "https://washbizhub.com/design-studio-screenshot.png",
    "softwareVersion": "3.0",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com"
    }
  };

  return (
    <AuthGuard title="Sign In to Access Design Studio" description="Sign in to access this tool.">
      <SEO 
        title="Laundromat Design Studio - Free 2D/3D Floor Plan Designer with ROI Calculator | WashBizHub" 
        description="Professional laundromat floor plan designer with real 2025 equipment pricing from Speed Queen, Dexter, ADC. Real-time revenue projections, CLEANBI scoring, and ancillary income optimization. Free 2D/3D layouts with contractor-ready PDF exports."
        canonicalUrl="/design-studio"
        keywords={[
          "laundromat design studio",
          "laundromat floor plan",
          "laundromat layout design",
          "3D laundromat designer",
          "coin laundry floor plan",
          "laundromat equipment layout",
          "commercial laundry design",
          "laundromat space planning",
          "how many washers fit in laundromat",
          "laundromat equipment placement",
          "laundry floor plan ideas",
          "laundromat ROI calculator",
          "TPD calculator laundromat",
          "laundromat startup planning",
          "laundromat design ideas",
          "Speed Queen laundromat layout",
          "Dexter laundromat floor plan",
          "laundromat revenue calculator",
          "laundromat equipment cost 2025",
          "laundromat profitability calculator",
          "ancillary revenue laundromat",
          "dog wash laundromat revenue",
          "washer dryer ratio laundromat",
          "laundromat business plan tool"
        ]}
        ogType="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Tools", url: "/calculators" },
          { name: "Design Studio", url: "/design-studio" }
        ]}
        faqs={[
          {
            question: "How do I design a laundromat layout?",
            answer: "Use WashBizHub Design Studio: 1) Choose a starter template (1,000-5,000 sq ft) or set custom dimensions, 2) Drag-and-drop washers, dryers, and amenities from our equipment library, 3) Arrange equipment for optimal traffic flow, 4) Review real-time cost estimates and ROI projections. Toggle between 2D and 3D views to visualize your space."
          },
          {
            question: "How many washers fit in a 1,000 square foot laundromat?",
            answer: "A 1,000 sq ft laundromat typically fits 8-12 washers and 8-12 dryers, depending on equipment sizes. Our small laundromat template includes 4 front-load washers and 2 stack dryers. Use Design Studio to test different configurations and maximize your equipment density while maintaining customer comfort."
          },
          {
            question: "What is the ideal washer-to-dryer ratio for a laundromat?",
            answer: "The ideal ratio is typically 1:1 or 1:1.25 (washers to dryers). However, if you use high-capacity dryers or stack dryers, you may need fewer dryer units. Design Studio calculates your TPD (Turns Per Day) to help optimize your mix for maximum revenue."
          },
          {
            question: "How much does laundromat equipment cost?",
            answer: "Commercial laundry equipment costs vary: Front-load washers ($3,000-$15,000), top-load washers ($800-$2,500), stack dryers ($4,000-$10,000), and single dryers ($2,000-$6,000). Design Studio shows real-time equipment costs as you build your layout, helping you stay within budget."
          },
          {
            question: "What square footage do I need for a profitable laundromat?",
            answer: "Most profitable laundromats range from 1,500-4,000 sq ft. Smaller mats (1,000-1,500 sq ft) work in dense urban areas. Larger mats (3,000-5,000+ sq ft) suit suburban locations with parking. Design Studio offers templates for small (1,000 sq ft), medium (2,500 sq ft), and large (5,000 sq ft) laundromats."
          },
          {
            question: "What amenities should I include in my laundromat design?",
            answer: "Essential amenities include: folding tables, seating areas, change machines, vending machines, and restrooms. Popular additions are TVs, free WiFi, phone charging stations, and kid's play areas. Design Studio includes furniture and amenity options to help you create a complete customer experience."
          },
          {
            question: "How do I calculate laundromat ROI?",
            answer: "Laundromat ROI depends on equipment costs, monthly revenue, and operating expenses. Design Studio calculates projected monthly revenue based on your equipment mix, local market rates, and TPD (Turns Per Day). Most laundromats achieve 20-35% cash-on-cash returns with proper planning."
          },
          {
            question: "Can I export my laundromat floor plan?",
            answer: "Yes! Design Studio lets you export your floor plan as a PDF or share it via a unique link. This is perfect for presenting to investors, contractors, equipment vendors, or landlords. Your design includes equipment specs, dimensions, and cost breakdowns."
          }
        ]}
        howTo={{
          name: "How to Design Your Laundromat Layout",
          description: "Complete guide to creating a professional laundromat floor plan with equipment placement, cost analysis, and ROI projections",
          totalTime: "PT15M",
          steps: [
            {
              name: "Choose Your Space Size",
              text: "Select a starter template (Small 1,000 sq ft, Medium 2,500 sq ft, or Large 5,000 sq ft) or enter custom dimensions for your specific space."
            },
            {
              name: "Add Washers",
              text: "Drag front-load or top-load washers from the equipment library onto your floor plan. Choose from brands like Dexter, Speed Queen, Maytag, and more. Position them along walls for plumbing access."
            },
            {
              name: "Add Dryers",
              text: "Place dryers near your washer area. Consider stack dryers to save floor space. Ensure adequate ventilation paths to exterior walls."
            },
            {
              name: "Include Amenities",
              text: "Add folding tables, seating areas, change machines, vending machines, and carts. Leave clear pathways for customer traffic flow."
            },
            {
              name: "Review Costs and ROI",
              text: "Check the real-time equipment cost calculator and TPD (Turns Per Day) analysis. Review projected monthly and annual revenue based on your equipment mix."
            },
            {
              name: "Toggle 3D View",
              text: "Switch to 3D view to visualize your layout from different angles. This helps identify potential issues with equipment placement and traffic flow."
            },
            {
              name: "Export or Share Your Design",
              text: "Download your floor plan as a PDF or generate a shareable link. Use this to present to contractors, landlords, or investors."
            }
          ]
        }}
        structuredData={structuredData}
      />
      
      <OnboardingTooltip show={showOnboarding} onDismiss={dismissOnboarding} />
      
      <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#001830] to-[#000D1A] py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#39CCCC]/20 p-2 md:p-3 rounded-xl">
                <Palette className="h-6 w-6 md:h-8 md:w-8 text-[#39CCCC]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white" data-testid="text-design-studio-title">
                  Design Studio
                </h1>
                <p className="text-white/60 text-xs md:text-sm">
                  Professional laundromat layout designer with live ROI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {locationContext && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-lg px-3 py-1.5 cursor-default" data-testid="badge-cleanbi-linked">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 text-xs font-semibold">CLEANBI Linked</span>
                      </div>
                      <Separator orientation="vertical" className="h-4 bg-green-500/30" />
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-green-300" />
                        <span className="text-white/80 text-xs max-w-[150px] truncate">{locationContext.address}</span>
                      </div>
                      <Badge className={`text-[10px] px-1.5 py-0.5 ${
                        locationContext.grade === 'A' ? 'bg-green-500 text-white' :
                        locationContext.grade === 'B' ? 'bg-lime-500 text-white' :
                        locationContext.grade === 'C' ? 'bg-amber-500 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        Grade {locationContext.grade}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setLocationContext(null);
                          clearLocationContext();
                          toast({ title: "Location Unlinked", description: "Revenue projections reset to baseline." });
                        }}
                        className="h-5 w-5 text-white/40 hover:text-white hover:bg-white/10"
                        aria-label="Unlink location"
                        data-testid="button-unlink-location"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">Location-Adjusted Revenue</p>
                      <p className="text-xs text-muted-foreground">
                        Revenue projections are multiplied by {locationContext.revenueMultiplier.toFixed(2)}x based on CLEANBI location analysis including demographics, competition, and traffic data.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setShowOnboarding(true)}
                    className="h-8 w-8 border-white/20 text-white/70"
                    aria-label="Show tutorial"
                    data-testid="button-help"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show tutorial</TooltipContent>
              </Tooltip>
              <Badge className="bg-[#39CCCC]/20 text-[#39CCCC] border-[#39CCCC]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Pro Feature
              </Badge>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <Tabs value={studioType} onValueChange={(v) => setStudioType(v as "2d" | "3d")} className="w-full md:w-auto">
                <TabsList className="grid w-full max-w-xs grid-cols-2 bg-white/10">
                  <TabsTrigger value="2d" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-[#001F3F]" data-testid="tab-2d">
                    <Layers className="w-4 h-4 mr-2" />
                    2D View
                  </TabsTrigger>
                  <TabsTrigger value="3d" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-[#001F3F]" data-testid="tab-3d">
                    <Move3D className="w-4 h-4 mr-2" />
                    3D View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-[#39CCCC]/30 text-[#39CCCC] hover:bg-[#39CCCC]/10" data-testid="button-templates">
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    Starter Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#001F3F] border-[#39CCCC]/30 max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <LayoutTemplate className="h-5 w-5 text-[#39CCCC]" />
                      Choose a Starter Template
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      Select a pre-configured layout template to start designing your laundromat.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    {STARTER_TEMPLATES.map((template) => (
                      <DialogClose key={template.id} asChild>
                        <button
                          onClick={() => loadTemplate(template)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-[#39CCCC]/30 text-left group"
                          data-testid={`button-template-${template.id}`}
                        >
                          <div className="bg-[#39CCCC]/20 p-3 rounded-lg group-hover:bg-[#39CCCC]/30 transition-colors">
                            <template.icon className="h-6 w-6 text-[#39CCCC]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-bold">{template.name}</p>
                            <p className="text-white/60 text-sm">{template.description}</p>
                            <p className="text-[#39CCCC] text-xs mt-1">
                              {template.equipment.length} pieces pre-configured
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-[#39CCCC] transition-colors" />
                        </button>
                      </DialogClose>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              <input
                ref={floorPlanInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                onChange={handleFloorPlanUpload}
                className="hidden"
                data-testid="input-floor-plan-file"
              />
              
              <Dialog open={floorPlanDialogOpen} onOpenChange={setFloorPlanDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`border-purple-500/30 text-purple-400 hover:bg-purple-500/10 ${backgroundImage ? 'bg-purple-500/10' : ''}`}
                    data-testid="button-import-floor-plan"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    {backgroundImage ? 'Edit Floor Plan' : 'Import Floor Plan'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#001F3F] border-purple-500/30 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Image className="h-5 w-5 text-purple-400" />
                      {backgroundImage ? 'Floor Plan Settings' : 'Import Floor Plan'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      {backgroundImage 
                        ? 'Adjust opacity and scale to trace over your floor plan.'
                        : 'Upload an existing floor plan image to trace over while designing.'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {!backgroundImage ? (
                      <div className="space-y-4">
                        <button
                          onClick={() => floorPlanInputRef.current?.click()}
                          className="w-full p-6 rounded-xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 hover:bg-purple-500/10 transition-colors group"
                          data-testid="button-upload-floor-plan"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="bg-purple-500/20 p-4 rounded-full group-hover:bg-purple-500/30 transition-colors">
                              <Upload className="h-8 w-8 text-purple-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-white font-medium">Click to upload</p>
                              <p className="text-white/50 text-sm">PNG, JPG, or PDF (max 10MB)</p>
                            </div>
                          </div>
                        </button>
                        <p className="text-white/40 text-xs text-center">
                          Upload your existing blueprint or floor plan to trace over
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-[#1a1a2e] p-2">
                          <img 
                            src={backgroundImage} 
                            alt="Floor plan preview" 
                            className="w-full h-32 object-contain opacity-70"
                            data-testid="img-floor-plan-preview"
                          />
                          <Badge className="absolute top-2 right-2 bg-green-500/20 text-green-400 border-green-500/30">
                            <Check className="h-3 w-3 mr-1" />
                            Loaded
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-white/80 text-sm flex items-center gap-2">
                              {backgroundVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              Visibility
                            </Label>
                            <Button
                              size="sm"
                              variant={backgroundVisible ? "default" : "outline"}
                              onClick={() => setBackgroundVisible(!backgroundVisible)}
                              className={`h-8 ${backgroundVisible ? 'bg-purple-500 hover:bg-purple-600' : 'border-white/20 text-white/70'}`}
                              data-testid="button-toggle-floor-plan-visibility"
                            >
                              {backgroundVisible ? 'Visible' : 'Hidden'}
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-white/80 text-sm">Opacity</Label>
                              <span className="text-purple-400 text-sm font-medium" data-testid="text-floor-plan-opacity">{backgroundOpacity}%</span>
                            </div>
                            <Slider
                              value={[backgroundOpacity]}
                              onValueChange={([v]) => setBackgroundOpacity(v)}
                              min={10}
                              max={100}
                              step={5}
                              className="w-full"
                              data-testid="slider-floor-plan-opacity"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-white/80 text-sm">Scale</Label>
                              <span className="text-purple-400 text-sm font-medium" data-testid="text-floor-plan-scale">{backgroundScale}%</span>
                            </div>
                            <Slider
                              value={[backgroundScale]}
                              onValueChange={([v]) => setBackgroundScale(v)}
                              min={25}
                              max={200}
                              step={5}
                              className="w-full"
                              data-testid="slider-floor-plan-scale"
                            />
                          </div>
                        </div>
                        
                        <Separator className="bg-white/10" />
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-white/20 text-white/70 hover:text-white"
                            onClick={() => floorPlanInputRef.current?.click()}
                            data-testid="button-replace-floor-plan"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Replace
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                            onClick={() => {
                              removeFloorPlan();
                              setFloorPlanDialogOpen(false);
                            }}
                            data-testid="button-remove-floor-plan"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={aiSuggestionDialogOpen} onOpenChange={setAiSuggestionDialogOpen}>
                <DialogContent className="bg-[#001F3F] border-[#39CCCC]/30 max-w-lg" data-testid="dialog-ai-suggestions">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      AI Layout Recommendations
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                      Smart suggestions based on your {aiSuggestion?.sqft.toLocaleString()} sq ft space
                    </DialogDescription>
                  </DialogHeader>
                  
                  {aiSuggestion && (
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30">
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            aiSuggestion.roomSize === 'large' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : aiSuggestion.roomSize === 'medium' 
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {aiSuggestion.roomSize.charAt(0).toUpperCase() + aiSuggestion.roomSize.slice(1)} Room
                          </Badge>
                          <span className="text-white/60 text-sm">{aiSuggestion.sqft.toLocaleString()} sq ft</span>
                        </div>
                        <Badge className="bg-[#39CCCC]/20 text-[#39CCCC] border-[#39CCCC]/30">
                          CLEANBI: {aiSuggestion.cleanbiScore}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-sm bg-blue-500" />
                            <span className="text-white/80 text-sm font-medium">Washers</span>
                          </div>
                          <p className="text-2xl font-black text-white" data-testid="text-ai-recommended-washers">
                            {aiSuggestion.recommendedWashers}
                          </p>
                          <p className="text-white/50 text-xs mt-1">{aiSuggestion.washerPlacement}</p>
                        </div>
                        
                        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-sm bg-orange-500" />
                            <span className="text-white/80 text-sm font-medium">Dryers</span>
                          </div>
                          <p className="text-2xl font-black text-white" data-testid="text-ai-recommended-dryers">
                            {aiSuggestion.recommendedDryers}
                          </p>
                          <p className="text-white/50 text-xs mt-1">{aiSuggestion.dryerPlacement}</p>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/80 text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            Revenue Projection
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xl font-black text-green-400" data-testid="text-ai-projected-revenue">
                              ${aiSuggestion.projectedMonthlyRevenue.toLocaleString()}
                            </p>
                            <p className="text-white/50 text-xs">per month</p>
                          </div>
                          <div>
                            <p className="text-xl font-black text-green-400">
                              ${aiSuggestion.projectedAnnualRevenue.toLocaleString()}
                            </p>
                            <p className="text-white/50 text-xs">per year</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-500/20">
                          <p className="text-white/60 text-sm">
                            Equipment Cost: <span className="text-white font-semibold">${aiSuggestion.equipmentCost.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-400" />
                          Pro Tips
                        </p>
                        <ul className="space-y-1">
                          {aiSuggestion.additionalTips.map((tip, index) => (
                            <li key={index} className="text-white/60 text-xs flex items-start gap-2">
                              <span className="text-[#39CCCC] mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setAiSuggestionDialogOpen(false)}
                          className="flex-1 border-white/20 text-white/70"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={applyAISuggestion}
                          disabled={isApplyingAISuggestion}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                          data-testid="button-apply-ai-suggestion"
                        >
                          {isApplyingAISuggestion ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Apply Suggestion
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
              {/* Professional Consultation Council Dialog */}
              <Dialog open={sendToConsultantDialogOpen} onOpenChange={setSendToConsultantDialogOpen}>
                <DialogContent className="max-w-lg bg-gradient-to-b from-[#0A1628] to-[#0D1F35] border-[#C8A661]/30 text-white">
                  <DialogHeader className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8A661] to-[#B8955A] flex items-center justify-center shadow-lg shadow-[#C8A661]/20">
                        <Users className="h-8 w-8 text-[#001F3F]" />
                      </div>
                    </div>
                    <div className="text-center">
                      <DialogTitle className="text-xl font-bold text-white">
                        Laundromat Consultation Council
                      </DialogTitle>
                      <DialogDescription className="text-white/70 mt-2">
                        Expert analysis by industry veterans with decades of combined experience
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    {/* Expert Council */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-white/80 font-semibold text-xs mb-3">Your Expert Panel:</p>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="text-center">
                          <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-[10px]">
                            OPS
                          </div>
                          <p className="text-white/80 text-[9px] mt-1 font-medium">Operations</p>
                        </div>
                        <div className="text-center">
                          <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-[10px]">
                            FIN
                          </div>
                          <p className="text-white/80 text-[9px] mt-1 font-medium">Financial</p>
                        </div>
                        <div className="text-center">
                          <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-[10px]">
                            MKT
                          </div>
                          <p className="text-white/80 text-[9px] mt-1 font-medium">Market</p>
                        </div>
                        <div className="text-center">
                          <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-white font-bold text-[10px]">
                            EQP
                          </div>
                          <p className="text-white/80 text-[9px] mt-1 font-medium">Equipment</p>
                        </div>
                        <div className="text-center">
                          <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-[10px]">
                            LOC
                          </div>
                          <p className="text-white/80 text-[9px] mt-1 font-medium">Location</p>
                        </div>
                      </div>
                      <p className="text-white/50 text-[10px] mt-3 text-center italic">
                        5 specialized experts discuss, delegate, and advise on your design
                      </p>
                    </div>
                    
                    {/* Human Oversight */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-[#C8A661]/10 to-transparent rounded-lg p-3 border border-[#C8A661]/20">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8A661] to-[#B8955A] flex items-center justify-center text-[#001F3F] font-bold text-sm flex-shrink-0">
                        NK
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Nick Kremers</p>
                        <p className="text-[#C8A661] text-[10px]">Founder & Final Review</p>
                        <p className="text-white/60 text-[10px]">Human oversight on every consultation</p>
                      </div>
                    </div>
                    
                    {/* What You'll Receive */}
                    <div className="bg-gradient-to-r from-[#C8A661]/10 to-transparent rounded-lg p-3 border border-[#C8A661]/20">
                      <p className="text-[#C8A661] font-semibold text-xs mb-2">What You'll Receive:</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-white/80 text-xs">
                          <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Professional viability assessment with market comparisons</span>
                        </li>
                        <li className="flex items-start gap-2 text-white/80 text-xs">
                          <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Equipment mix optimization recommendations</span>
                        </li>
                        <li className="flex items-start gap-2 text-white/80 text-xs">
                          <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Revenue projection verification by industry experts</span>
                        </li>
                        <li className="flex items-start gap-2 text-white/80 text-xs">
                          <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Personalized 30-minute consultation call</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Design Summary */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-white/80 font-semibold text-xs mb-2">Your Design Summary:</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-[#39CCCC]">{washerCount + dryerCount}</p>
                          <p className="text-[10px] text-white/50">Machines</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-400">${monthlyRevenue.toLocaleString()}</p>
                          <p className="text-[10px] text-white/50">Monthly Rev</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold" style={{ color: cleanbiScore >= 85 ? '#22C55E' : cleanbiScore >= 70 ? '#A3E635' : cleanbiScore >= 55 ? '#FBBF24' : '#C8A661' }}>
                            {cleanbiScore >= 85 ? 'A' : cleanbiScore >= 70 ? 'B' : cleanbiScore >= 55 ? 'C' : 'Review'}
                          </p>
                          <p className="text-[10px] text-white/50">Viability</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes Field */}
                    <div>
                      <Label className="text-white/80 text-xs mb-1.5 block">Additional Context (Optional)</Label>
                      <Textarea
                        value={consultantNotes}
                        onChange={(e) => setConsultantNotes(e.target.value)}
                        placeholder="Tell us about your goals, timeline, location details, or any specific concerns..."
                        className="bg-white/5 border-white/20 text-white text-sm min-h-[80px] placeholder:text-white/40"
                        data-testid="input-consultant-notes"
                      />
                    </div>
                    
                    {/* CTA Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setSendToConsultantDialogOpen(false)}
                        className="flex-1 border-white/20 text-white/70 hover:text-white"
                        data-testid="button-cancel-consultation"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={sendToConsultant}
                        disabled={isSendingToConsultant}
                        className="flex-1 bg-gradient-to-r from-[#C8A661] to-[#B8955A] text-[#001F3F] hover:from-[#D4B872] hover:to-[#C8A661] font-bold"
                        data-testid="button-submit-consultation"
                      >
                        {isSendingToConsultant ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-[#001F3F] border-t-transparent rounded-full mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Request Analysis
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-center text-white/40 text-[10px]">
                      Response within 24-48 business hours • No obligation • 100% confidential
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-5'}`}>
            {!isMobile && (
              <Card className="lg:col-span-1 bg-white/5 backdrop-blur border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Box className="h-4 w-4 text-[#39CCCC]" />
                    Equipment Library
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-white/80 text-xs mb-2 block">Room Size (ft)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Width"
                        value={Math.round(dimensions.width / 12)}
                        onChange={(e) => setDimensions({ ...dimensions, width: (parseInt(e.target.value) || 0) * 12 })}
                        className="bg-white/10 border-white/20 text-white text-sm h-8"
                        data-testid="input-room-width"
                      />
                      <Input
                        type="number"
                        placeholder="Depth"
                        value={Math.round(dimensions.depth / 12)}
                        onChange={(e) => setDimensions({ ...dimensions, depth: (parseInt(e.target.value) || 0) * 12 })}
                        className="bg-white/10 border-white/20 text-white text-sm h-8"
                        data-testid="input-room-depth"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={suggestAILayout}
                      className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs"
                      data-testid="button-ai-suggest-layout"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Suggest Layout
                    </Button>
                  </div>

                  {studioType === "3d" && (
                    <>
                      <Separator className="bg-white/10" />
                      <div>
                        <Label className="text-white/80 text-xs mb-2 block flex items-center gap-1">
                          <Sun className="h-3 w-3" />
                          Lighting
                        </Label>
                        <Slider
                          value={[ambientIntensity]}
                          onValueChange={([v]) => setAmbientIntensity(v)}
                          min={0.1}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  <Separator className="bg-white/10" />

                  <EquipmentPanel
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    filteredEquipment={filteredEquipment}
                    addEquipment={addEquipment}
                  />
                </CardContent>
              </Card>
            )}

            <div className={`${isMobile ? '' : 'lg:col-span-3'} space-y-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={showGrid ? "default" : "outline"}
                    onClick={() => setShowGrid(!showGrid)}
                    className={`h-8 text-xs ${showGrid ? 'bg-[#39CCCC] text-[#001F3F]' : 'border-white/20 text-white/70'}`}
                    data-testid="button-toggle-grid"
                  >
                    <Grid3X3 className="h-3 w-3 mr-1" />
                    Grid
                  </Button>
                  <Button
                    size="sm"
                    variant={snapToGrid ? "default" : "outline"}
                    onClick={() => setSnapToGrid(!snapToGrid)}
                    className={`h-8 text-xs ${snapToGrid ? 'bg-[#39CCCC] text-[#001F3F]' : 'border-white/20 text-white/70'}`}
                    data-testid="button-toggle-snap"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Snap
                  </Button>
                  <Button
                    size="sm"
                    variant={showRulers ? "default" : "outline"}
                    onClick={() => setShowRulers(!showRulers)}
                    className={`h-8 text-xs ${showRulers ? 'bg-[#39CCCC] text-[#001F3F]' : 'border-white/20 text-white/70'}`}
                    data-testid="button-toggle-rulers"
                  >
                    <Ruler className="h-3 w-3 mr-1" />
                    Rulers
                  </Button>
                  {studioType === "2d" && (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
                        className="h-8 w-8 border-white/20 text-white/70"
                        aria-label="Zoom in"
                        data-testid="button-zoom-in"
                      >
                        <ZoomIn className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
                        className="h-8 w-8 border-white/20 text-white/70"
                        aria-label="Zoom out"
                        data-testid="button-zoom-out"
                      >
                        <ZoomOut className="h-3 w-3" />
                      </Button>
                      <span className="text-white/50 text-xs">{Math.round(zoom * 100)}%</span>
                    </>
                  )}
                  {backgroundImage && studioType === "2d" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant={backgroundVisible ? "default" : "outline"}
                          onClick={() => setBackgroundVisible(!backgroundVisible)}
                          className={`h-8 text-xs ${backgroundVisible ? 'bg-purple-500 text-white hover:bg-purple-600' : 'border-purple-500/30 text-purple-400'}`}
                          data-testid="button-quick-toggle-floor-plan"
                        >
                          {backgroundVisible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          Floor Plan
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle floor plan visibility</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="h-8 w-8 border-white/20 text-white/70 disabled:opacity-30"
                        aria-label="Undo"
                        data-testid="button-undo"
                      >
                        <Undo2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undo</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="h-8 w-8 border-white/20 text-white/70 disabled:opacity-30"
                        aria-label="Redo"
                        data-testid="button-redo"
                      >
                        <Redo2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Redo</TooltipContent>
                  </Tooltip>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearCanvas}
                    className="h-8 text-red-400 border-red-400/30 hover:bg-red-400/10 text-xs"
                    data-testid="button-clear-canvas"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              <Card className="bg-white/5 backdrop-blur border-white/10 overflow-hidden" ref={canvasContainerRef}>
                <CardContent className="p-0">
                  {studioType === "3d" ? (
                    <div className="w-full h-[400px] md:h-[500px] relative" data-testid="canvas-3d-stage">
                      <Suspense fallback={
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
                          <div className="text-center text-white/60">
                            <div className="animate-spin w-8 h-8 border-2 border-[#39CCCC] border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-sm">Loading 3D Scene...</p>
                          </div>
                        </div>
                      }>
                        <Canvas shadows>
                          <ThreeScene 
                            equipment={placedEquipment}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            ambientIntensity={ambientIntensity}
                            showLabels={showLabels}
                            canvasWidth={canvasSize.width}
                            canvasHeight={canvasSize.height}
                          />
                        </Canvas>
                      </Suspense>
                      
                      {placedEquipment.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center text-white/40">
                            <Move3D className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-base md:text-lg font-medium">Add equipment to see your 3D layout</p>
                            <p className="text-xs md:text-sm">Use starter templates or add equipment manually</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white/60 text-[10px] px-2 py-1 rounded">
                        Orbit to rotate • Scroll to zoom • Click to select
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="relative overflow-hidden"
                      style={{ 
                        width: '100%',
                        height: canvasSize.height * zoom,
                        background: '#1a1a2e'
                      }}
                      data-testid="canvas-2d-stage"
                    >
                      <div
                        ref={canvas2DRef}
                        style={{
                          width: canvasSize.width,
                          height: canvasSize.height,
                          transform: `scale(${zoom})`,
                          transformOrigin: 'top left',
                          position: 'relative',
                        }}
                      >
                        {backgroundImage && backgroundVisible && (
                          <div 
                            className="absolute inset-0 pointer-events-none z-0"
                            style={{ 
                              left: showRulers ? 24 : 0, 
                              top: showRulers ? 24 : 0,
                              right: 0,
                              bottom: 0,
                            }}
                            data-testid="floor-plan-background"
                          >
                            <img 
                              src={backgroundImage} 
                              alt="Floor plan background"
                              className="w-full h-full"
                              style={{
                                objectFit: 'contain',
                                opacity: backgroundOpacity / 100,
                                transform: `scale(${backgroundScale / 100})`,
                                transformOrigin: 'center center',
                              }}
                            />
                          </div>
                        )}
                        
                        <MeasurementOverlay 
                          dimensions={dimensions} 
                          canvasWidth={canvasSize.width} 
                          canvasHeight={canvasSize.height}
                          showRulers={showRulers}
                        />
                        
                        {showGrid && (
                          <svg 
                            className="absolute inset-0 pointer-events-none" 
                            style={{ left: showRulers ? 24 : 0, top: showRulers ? 24 : 0 }}
                            width={canvasSize.width - (showRulers ? 24 : 0)} 
                            height={canvasSize.height - (showRulers ? 24 : 0)}
                          >
                            <defs>
                              <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                                <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="rgba(57,204,204,0.1)" strokeWidth="1"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                          </svg>
                        )}
                        
                        <BuildingShellEditor
                          dimensions={dimensions}
                          setDimensions={setDimensions}
                          canvasWidth={canvasSize.width}
                          canvasHeight={canvasSize.height}
                          showRulers={showRulers}
                        />

                        {placedEquipment.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-white/30">
                            <div className="text-center">
                              <Layers className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 opacity-50" />
                              <p className="text-base md:text-lg font-medium">Start with a template or add equipment</p>
                              <p className="text-xs md:text-sm">Drag equipment to position it on the canvas</p>
                            </div>
                          </div>
                        )}

                        {placedEquipment.map((item) => (
                          <Rnd
                            key={item.id}
                            position={{ x: item.x + (showRulers ? 24 : 0), y: item.y + (showRulers ? 24 : 0) }}
                            size={{ width: item.width, height: item.height }}
                            onDrag={(e, d) => updatePosition(item.id, d.x - (showRulers ? 24 : 0), d.y - (showRulers ? 24 : 0))}
                            onDragStop={(e, d) => onDragStop(item.id, d.x - (showRulers ? 24 : 0), d.y - (showRulers ? 24 : 0))}
                            onClick={() => setSelectedId(item.id)}
                            bounds="parent"
                            enableResizing={false}
                            className="group"
                          >
                            <div
                              className={`w-full h-full rounded-md flex items-center justify-center cursor-move transition-all shadow-lg ${
                                selectedId === item.id 
                                  ? 'ring-2 ring-[#39CCCC] ring-offset-2 ring-offset-[#1a1a2e] scale-105' 
                                  : 'hover:ring-1 hover:ring-white/50 hover:scale-102'
                              }`}
                              style={{ 
                                backgroundColor: item.equipment.color,
                                transform: `rotate(${item.rotation}deg)`,
                              }}
                            >
                              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="h-3 w-3 text-white/50" />
                              </div>
                              <span 
                                className="text-white text-[9px] md:text-[10px] font-bold text-center leading-tight px-1 select-none drop-shadow-md"
                                style={{ transform: `rotate(-${item.rotation}deg)` }}
                              >
                                {item.equipment.capacity}
                              </span>
                            </div>
                          </Rnd>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedEquipment && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <EquipmentThumbnail equipment={selectedEquipment.equipment} size="sm" />
                        <div>
                          <p className="text-white font-medium text-sm">{selectedEquipment.equipment.name}</p>
                          <p className="text-white/60 text-xs">
                            ${selectedEquipment.equipment.cost.toLocaleString()} • {selectedEquipment.equipment.tpdContribution} TPD
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => rotateEquipment(selectedId!)}
                          className="h-8 w-8 border-white/20 text-white/70"
                          aria-label="Rotate equipment"
                          data-testid="button-rotate"
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => removeEquipment(selectedId!)}
                          className="h-8 w-8 text-red-400 border-red-400/30 hover:bg-red-400/10"
                          aria-label="Delete equipment"
                          data-testid="button-delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {!isMobile && (
              <Card className="lg:col-span-1 bg-white/5 backdrop-blur border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-[#39CCCC]" />
                    Live Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricsPanel
                    washerCount={washerCount}
                    dryerCount={dryerCount}
                    totalCost={totalCost}
                    totalTPD={totalTPD}
                    dailyRevenue={dailyRevenue}
                    monthlyRevenue={monthlyRevenue}
                    annualRevenue={annualRevenue}
                    cleanbiScore={cleanbiScore}
                    dynamicPricingBoost={dynamicPricingBoost}
                    annualDynamicBoost={annualDynamicBoost}
                    placedEquipment={placedEquipment}
                    revenueBreakdown={revenueBreakdown}
                    ancillaryRevenue={ancillaryRevenue}
                    sqft={sqft}
                    saveDesign={saveDesign}
                    exportPNG={exportPNG}
                    exportPDF={exportPDF}
                    generateShareLink={generateShareLink}
                    onOpenConsultation={() => setSendToConsultantDialogOpen(true)}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#001F3F] border-t border-white/10 p-3 z-40">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-lg font-black text-white">{washerCount + dryerCount}</p>
                    <p className="text-[9px] text-white/60">Items</p>
                  </div>
                  <Separator orientation="vertical" className="h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-lg font-black text-[#39CCCC]">${totalCost.toLocaleString()}</p>
                    <p className="text-[9px] text-white/60">Cost</p>
                  </div>
                  <Separator orientation="vertical" className="h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-lg font-black text-green-400">${monthlyRevenue.toLocaleString()}</p>
                    <p className="text-[9px] text-white/60">/month</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Sheet open={equipmentSheetOpen} onOpenChange={setEquipmentSheetOpen}>
                    <SheetTrigger asChild>
                      <Button size="sm" className="bg-[#39CCCC] text-[#001F3F]" data-testid="button-add-equipment-mobile">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="bg-[#001F3F] border-white/10 h-[70vh]">
                      <SheetHeader>
                        <SheetTitle className="text-white flex items-center gap-2">
                          <Box className="h-5 w-5 text-[#39CCCC]" />
                          Equipment Library
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">
                        <div className="mb-3">
                          <Label className="text-white/80 text-xs mb-2 block">Room Size (ft)</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="Width"
                              value={Math.round(dimensions.width / 12)}
                              onChange={(e) => setDimensions({ ...dimensions, width: (parseInt(e.target.value) || 0) * 12 })}
                              className="bg-white/10 border-white/20 text-white text-sm h-9"
                            />
                            <Input
                              type="number"
                              placeholder="Depth"
                              value={Math.round(dimensions.depth / 12)}
                              onChange={(e) => setDimensions({ ...dimensions, depth: (parseInt(e.target.value) || 0) * 12 })}
                              className="bg-white/10 border-white/20 text-white text-sm h-9"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={suggestAILayout}
                            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs"
                            data-testid="button-ai-suggest-layout-mobile"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Suggest Layout
                          </Button>
                        </div>
                        <EquipmentPanel
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          categoryFilter={categoryFilter}
                          setCategoryFilter={setCategoryFilter}
                          filteredEquipment={filteredEquipment}
                          addEquipment={addEquipment}
                          isMobile={true}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" variant="outline" className="border-white/20 text-white" data-testid="button-metrics-mobile">
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="bg-[#001F3F] border-white/10 h-[80vh]">
                      <SheetHeader>
                        <SheetTitle className="text-white flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-[#39CCCC]" />
                          Live Metrics & ROI
                        </SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="h-full mt-4 pr-4">
                        <MetricsPanel
                          washerCount={washerCount}
                          dryerCount={dryerCount}
                          totalCost={totalCost}
                          totalTPD={totalTPD}
                          dailyRevenue={dailyRevenue}
                          monthlyRevenue={monthlyRevenue}
                          annualRevenue={annualRevenue}
                          cleanbiScore={cleanbiScore}
                          dynamicPricingBoost={dynamicPricingBoost}
                          annualDynamicBoost={annualDynamicBoost}
                          placedEquipment={placedEquipment}
                          revenueBreakdown={revenueBreakdown}
                          ancillaryRevenue={ancillaryRevenue}
                          sqft={sqft}
                          saveDesign={saveDesign}
                          exportPNG={exportPNG}
                          exportPDF={exportPDF}
                          generateShareLink={generateShareLink}
                          onOpenConsultation={() => setSendToConsultantDialogOpen(true)}
                        />
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          )}
          
          {isMobile && <div className="h-20" />}
        </div>
      </div>
    </AuthGuard>
  );
}
