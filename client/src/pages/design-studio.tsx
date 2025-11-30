import { useState, useCallback, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
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
import { equipmentLibrary } from "@shared/schema";
import { 
  Palette, Box, Plus, Save, Trash2, RotateCw, Grid3X3, 
  DollarSign, TrendingUp, Calculator, ZoomIn, ZoomOut,
  Download, Undo2, Redo2, Info, Eye, Move3D, Maximize2, Camera,
  Sun, Moon, RotateCcw, Layers, Sparkles, Target, Zap, ChevronRight,
  Search, Ruler, Share2, Copy, Check, X, HelpCircle, LayoutTemplate,
  Building2, Store, Warehouse, Menu, ChevronDown, GripVertical
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  { id: "financial", name: "Financial", types: ["atm", "changer"] },
  { id: "services", name: "Services", types: ["vending", "dogwash"] },
  { id: "furniture", name: "Furniture", types: ["table", "furniture", "cart", "seating-bench"] },
  { id: "entertainment", name: "Games", types: ["arcade"] },
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
        return (
          <div className="w-3/4 h-3/4 flex items-center justify-center text-white/80 text-[8px] font-bold">
            PLAY
          </div>
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
  saveDesign,
  exportPNG,
  generateShareLink,
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
  saveDesign: () => void;
  exportPNG: () => void;
  generateShareLink: () => void;
  compact?: boolean;
}) {
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
      </div>

      {!compact && (
        <>
          <Separator className="bg-white/10" />

          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-white/80 text-xs font-medium">Revenue Projection</span>
            </div>
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
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="bg-gradient-to-br from-[#39CCCC]/20 to-[#39CCCC]/10 border border-[#39CCCC]/30 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Target className="h-3 w-3 text-[#39CCCC]" />
              <p className="text-[10px] text-[#39CCCC] font-medium">CLEANBI Score</p>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-black text-white">{cleanbiScore}</p>
              <p className="text-white/60 text-xs">/100</p>
            </div>
            <div className="w-full bg-black/30 rounded-full h-1.5 mt-1">
              <div 
                className="bg-gradient-to-r from-[#39CCCC] to-[#2AA0A0] h-1.5 rounded-full transition-all"
                style={{ width: `${cleanbiScore}%` }}
              />
            </div>
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
                  Start 14-Day Free Trial
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

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('designStudioOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

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

  const avgVendPrice = 4.50;
  const dailyRevenue = totalTPD * avgVendPrice;
  const monthlyRevenue = dailyRevenue * 30;
  const annualRevenue = monthlyRevenue * 12;
  
  const cleanbiScore = Math.min(100, 40 + 
    (washerCount * 4) + 
    (dryerCount * 3) + 
    (washerCount >= 4 && dryerCount >= 4 ? 10 : 0) + 
    (totalTPD >= 20 ? 8 : 0)
  );
  
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
    "name": "WashBizHub Design Studio",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "description": "Professional 2D and 3D laundromat floor plan designer with drag-and-drop equipment library, real-time cost calculations, and ROI projections.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "127"
    }
  };

  return (
    <>
      <SEO 
        title="3D Design Studio | Laundromat Layout Designer | WashBizHub" 
        description="Professional 2D and 3D laundromat floor plan designer. Drag-and-drop equipment from Dexter, Speed Queen, and more. Real-time cost calculations, TPD analysis, and ROI projections for your laundromat business."
        canonicalUrl="/design-studio"
        keywords={["laundromat design studio", "3D floor plan designer", "laundromat layout tool", "commercial laundry design", "equipment planning", "laundromat ROI calculator"]}
        ogType="website"
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
            <div className="flex items-center gap-2">
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
                    saveDesign={saveDesign}
                    exportPNG={exportPNG}
                    generateShareLink={generateShareLink}
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
                          saveDesign={saveDesign}
                          exportPNG={exportPNG}
                          generateShareLink={generateShareLink}
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
    </>
  );
}
