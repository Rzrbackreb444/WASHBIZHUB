import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Package,
  Users,
  ArrowRight,
  Shield,
  TrendingUp,
  Zap,
  Camera,
  Mic,
  FileText,
  Download,
  Upload,
  BookOpen,
  Settings,
  ChevronRight,
  ChevronDown,
  Filter,
  Bell,
  Play,
  Pause,
  Eye,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Cpu,
  Activity,
  BarChart3,
  Calendar,
  MapPin,
  Phone,
  Truck,
  RefreshCw,
  Layers,
  Database,
  Lock,
  Clipboard,
  FileSpreadsheet,
  Printer,
  Send,
  History,
  Tool,
  ThermometerSun,
  Droplets,
  Timer,
  Gauge,
  CircleDot,
  Cog,
  HardDrive,
  Wifi,
  WifiOff,
  RotateCcw,
  PlusCircle,
  Building2,
  Headphones,
  Brain,
  Sparkles,
  Target,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  ClipboardList,
  FolderOpen,
  Image,
  Video,
  ShoppingCart,
  CreditCard,
  Receipt,
  FileDown,
  Table,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Comprehensive brand database
const EQUIPMENT_BRANDS = [
  { id: "dexter", name: "Dexter", logo: "DX", color: "#DC2626", machines: 1423, codes: 847, manuals: 156 },
  { id: "speed-queen", name: "Speed Queen", logo: "SQ", color: "#2563EB", machines: 698, codes: 623, manuals: 134 },
  { id: "continental", name: "Continental Girbau", logo: "CG", color: "#059669", machines: 456, codes: 512, manuals: 98 },
  { id: "huebsch", name: "Huebsch", logo: "HB", color: "#7C3AED", machines: 270, codes: 445, manuals: 87 },
  { id: "maytag", name: "Maytag Commercial", logo: "MY", color: "#0891B2", machines: 189, codes: 389, manuals: 76 },
  { id: "wascomat", name: "Wascomat", logo: "WS", color: "#EA580C", machines: 134, codes: 334, manuals: 62 },
  { id: "ipso", name: "IPSO", logo: "IP", color: "#4F46E5", machines: 98, codes: 298, manuals: 54 },
  { id: "unimac", name: "UniMac", logo: "UM", color: "#0D9488", machines: 87, codes: 267, manuals: 48 },
  { id: "milnor", name: "Milnor", logo: "ML", color: "#BE185D", machines: 76, codes: 234, manuals: 42 },
  { id: "american-dryer", name: "American Dryer", logo: "AD", color: "#CA8A04", machines: 65, codes: 198, manuals: 38 },
  { id: "lg-commercial", name: "LG Commercial", logo: "LG", color: "#A21CAF", machines: 54, codes: 176, manuals: 32 },
  { id: "electrolux", name: "Electrolux Pro", logo: "EL", color: "#1D4ED8", machines: 43, codes: 156, manuals: 28 }
];

const TOTAL_CODES = EQUIPMENT_BRANDS.reduce((sum, b) => sum + b.codes, 0);
const TOTAL_MANUALS = EQUIPMENT_BRANDS.reduce((sum, b) => sum + b.manuals, 0);

// Demo error codes database
const DEMO_ERROR_CODES = [
  { 
    code: "E47", 
    brand: "Dexter", 
    model: "T-400/T-600 Washer",
    title: "Water Inlet Valve Failure",
    severity: "critical",
    description: "The water inlet valve is not opening properly or has failed completely. Machine cannot fill with water.",
    symptoms: ["Machine won't fill with water", "Partial fill only", "Error code displays on control panel", "Unusual valve clicking sounds"],
    causes: ["Failed solenoid coil", "Clogged inlet screen", "Low water pressure", "Wiring harness damage", "Control board fault"],
    diagnostics: [
      "Check incoming water pressure (minimum 20 PSI required)",
      "Inspect inlet screens for debris buildup",
      "Measure solenoid coil resistance (should be 800-1200 ohms)",
      "Verify 120VAC at valve during fill cycle",
      "Check wiring harness for damage or corrosion"
    ],
    repairSteps: [
      "1. Disconnect power and water supply",
      "2. Remove top panel (4 screws, 2 front, 2 back)",
      "3. Locate water inlet valve assembly",
      "4. Disconnect electrical connectors (photo reference needed)",
      "5. Remove water supply lines (have towels ready)",
      "6. Remove mounting screws (typically 2)",
      "7. Install new valve in reverse order",
      "8. Restore water and power",
      "9. Run test fill cycle",
      "10. Check for leaks at all connections"
    ],
    parts: [
      { partNumber: "9379-183-001", name: "Water Inlet Valve Assembly", price: 187.50, inStock: 12, supplier: "Dexter Parts Direct" },
      { partNumber: "9732-126-001", name: "Inlet Screen Kit (10 pack)", price: 24.99, inStock: 45, supplier: "Multiple" },
      { partNumber: "9857-147-001", name: "Wiring Harness - Valve", price: 67.00, inStock: 8, supplier: "Dexter Parts Direct" }
    ],
    estimatedTime: "45-60 minutes",
    skillLevel: "Intermediate",
    tools: ["Phillips screwdriver", "1/4\" nut driver", "Multimeter", "Adjustable wrench", "Towels"],
    safetyNotes: ["Always disconnect power before service", "Shut off water supply", "Depressurize lines before disconnecting"],
    videoUrl: "https://training.dexterlaundry.com/e47-repair",
    manualPage: 127,
    successRate: 94
  },
  { 
    code: "F21", 
    brand: "Speed Queen", 
    model: "SC40/SC60 Washer",
    title: "Drain Pump Failure",
    severity: "high",
    description: "The drain pump is not evacuating water from the tub within the allotted time. Machine enters safety lockout.",
    symptoms: ["Water remains in tub after cycle", "Extended drain times", "Burning smell from pump area", "Loud pump motor noise"],
    causes: ["Blocked drain hose", "Failed pump motor", "Clogged pump impeller", "Foreign object in pump", "Voltage issue"],
    diagnostics: [
      "Check drain hose for kinks or blockages",
      "Verify 120VAC at pump motor during drain",
      "Listen for pump motor attempting to run",
      "Check for foreign objects in pump housing",
      "Measure pump motor resistance"
    ],
    repairSteps: [
      "1. Disconnect power supply",
      "2. Remove front access panel",
      "3. Locate drain pump at bottom of unit",
      "4. Place shallow pan under pump",
      "5. Remove drain hose clamp and hose",
      "6. Disconnect electrical connector",
      "7. Remove pump mounting bolts (3)",
      "8. Install new pump and reassemble",
      "9. Run drain test cycle"
    ],
    parts: [
      { partNumber: "201566P", name: "Drain Pump Assembly", price: 156.00, inStock: 18, supplier: "Alliance Parts" },
      { partNumber: "38664", name: "Drain Hose", price: 34.50, inStock: 32, supplier: "Multiple" },
      { partNumber: "510508P", name: "Pump Mounting Gasket", price: 12.99, inStock: 56, supplier: "Alliance Parts" }
    ],
    estimatedTime: "30-45 minutes",
    skillLevel: "Intermediate",
    tools: ["Socket set", "Pliers", "Multimeter", "Drain pan", "Shop towels"],
    safetyNotes: ["Water may drain when hose removed", "Pump housing may be hot"],
    videoUrl: "https://training.speedqueen.com/f21-repair",
    manualPage: 89,
    successRate: 97
  },
  { 
    code: "d8", 
    brand: "Continental", 
    model: "E-Series Washer",
    title: "Door Lock Mechanism Fault",
    severity: "medium",
    description: "Door lock solenoid or switch has failed. Machine will not start cycle or door remains locked after cycle completion.",
    symptoms: ["Door won't lock at start", "Door remains locked", "Error on display", "Clicking from door area"],
    causes: ["Failed door lock solenoid", "Misaligned strike plate", "Damaged door switch", "Wiring fault", "Control board issue"],
    diagnostics: [
      "Check door alignment and closure",
      "Verify 120VAC at door lock during cycle start",
      "Test door switch continuity",
      "Inspect lock mechanism for debris",
      "Check control board outputs"
    ],
    repairSteps: [
      "1. Disconnect power",
      "2. Open door and remove inner door trim",
      "3. Locate door lock assembly",
      "4. Disconnect wiring harness",
      "5. Remove mounting screws (2-3)",
      "6. Install new assembly",
      "7. Reassemble and test"
    ],
    parts: [
      { partNumber: "WE1M1267", name: "Door Lock Assembly", price: 89.00, inStock: 24, supplier: "Continental Parts" },
      { partNumber: "WE4M415", name: "Door Strike Plate", price: 18.50, inStock: 67, supplier: "Multiple" }
    ],
    estimatedTime: "25-35 minutes",
    skillLevel: "Basic",
    tools: ["Phillips screwdriver", "Torx T20", "Multimeter"],
    safetyNotes: ["Disconnect power before service"],
    videoUrl: "https://training.continentalgirbau.com/d8-repair",
    manualPage: 64,
    successRate: 98
  }
];

// Preventative maintenance schedules
const MAINTENANCE_SCHEDULES = [
  { task: "Clean lint filters", frequency: "Daily", lastDone: "Today", nextDue: "Tomorrow", priority: "high", timeRequired: "5 min" },
  { task: "Check belt tension", frequency: "Weekly", lastDone: "3 days ago", nextDue: "4 days", priority: "medium", timeRequired: "15 min" },
  { task: "Lubricate bearings", frequency: "Monthly", lastDone: "2 weeks ago", nextDue: "2 weeks", priority: "medium", timeRequired: "30 min" },
  { task: "Inspect door seals", frequency: "Weekly", lastDone: "5 days ago", nextDue: "2 days", priority: "high", timeRequired: "10 min" },
  { task: "Clean water inlet screens", frequency: "Monthly", lastDone: "3 weeks ago", nextDue: "1 week", priority: "high", timeRequired: "20 min" },
  { task: "Check drain hoses", frequency: "Monthly", lastDone: "1 month ago", nextDue: "Today", priority: "critical", timeRequired: "15 min" },
  { task: "Test door locks", frequency: "Weekly", lastDone: "1 week ago", nextDue: "Today", priority: "high", timeRequired: "10 min" },
  { task: "Inspect electrical connections", frequency: "Quarterly", lastDone: "2 months ago", nextDue: "1 month", priority: "medium", timeRequired: "45 min" },
  { task: "Full machine calibration", frequency: "Semi-Annual", lastDone: "4 months ago", nextDue: "2 months", priority: "low", timeRequired: "2 hrs" }
];

// Repair log entries
const REPAIR_LOG = [
  { id: "RL-2024-1247", date: "Dec 18, 2024", machine: "DX-4500-W001", brand: "Dexter", issue: "Water inlet valve replacement", tech: "John Davidson", laborHours: 0.75, partsCost: 187.50, laborCost: 112.50, status: "completed", notes: "Replaced valve, tested successfully. Customer satisfied." },
  { id: "RL-2024-1246", date: "Dec 17, 2024", machine: "SQ-3200-D001", brand: "Speed Queen", issue: "Belt replacement - squealing", tech: "Sarah Mitchell", laborHours: 0.5, partsCost: 47.50, laborCost: 75.00, status: "completed", notes: "Belt was cracked. Replaced and tensioned properly." },
  { id: "RL-2024-1245", date: "Dec 17, 2024", machine: "CN-2800-W001", brand: "Continental", issue: "Door lock mechanism repair", tech: "Tom Bradley", laborHours: 0.4, partsCost: 89.00, laborCost: 60.00, status: "completed", notes: "Door lock solenoid failed. Replaced assembly." },
  { id: "RL-2024-1244", date: "Dec 16, 2024", machine: "HB-1800-W001", brand: "Huebsch", issue: "Control board diagnosis", tech: "Maria Garcia", laborHours: 1.5, partsCost: 0, laborCost: 225.00, status: "parts_ordered", notes: "Board needs replacement. Part on order - 3-5 days." },
  { id: "RL-2024-1243", date: "Dec 15, 2024", machine: "DX-4500-D002", brand: "Dexter", issue: "Exhaust vent cleaning", tech: "David Chen", laborHours: 0.5, partsCost: 0, laborCost: 75.00, status: "completed", notes: "Heavy lint buildup in exhaust. Cleaned thoroughly." }
];

// Service manuals library
const SERVICE_MANUALS = [
  { id: 1, brand: "Dexter", model: "T-300/T-400/T-600 Washer Series", version: "Rev. 2024.1", pages: 287, size: "24.5 MB", type: "Service Manual", lastUpdated: "Nov 2024" },
  { id: 2, brand: "Dexter", model: "T-80/T-120 Stack Dryer", version: "Rev. 2023.2", pages: 198, size: "18.2 MB", type: "Service Manual", lastUpdated: "Aug 2023" },
  { id: 3, brand: "Speed Queen", model: "SC Series Washer-Extractor", version: "Rev. 2024.2", pages: 312, size: "28.7 MB", type: "Service Manual", lastUpdated: "Oct 2024" },
  { id: 4, brand: "Speed Queen", model: "ST Series Tumble Dryer", version: "Rev. 2024.1", pages: 245, size: "21.3 MB", type: "Service Manual", lastUpdated: "Sep 2024" },
  { id: 5, brand: "Continental", model: "E-Series Professional", version: "Rev. 2023.3", pages: 267, size: "23.1 MB", type: "Service Manual", lastUpdated: "Dec 2023" },
  { id: 6, brand: "Huebsch", model: "Galaxy 600 Series", version: "Rev. 2024.1", pages: 189, size: "16.8 MB", type: "Service Manual", lastUpdated: "Jul 2024" },
  { id: 7, brand: "Dexter", model: "C-Series Coin/Card System", version: "Rev. 2024.3", pages: 156, size: "12.4 MB", type: "Technical Guide", lastUpdated: "Nov 2024" },
  { id: 8, brand: "Multiple", model: "Commercial Laundry Electrical", version: "Rev. 2024.1", pages: 423, size: "35.2 MB", type: "Reference Guide", lastUpdated: "Oct 2024" }
];

// Parts inventory
const PARTS_INVENTORY = [
  { sku: "DX-BELT-80", name: "Drive Belt - Dexter T-80/T-120", brand: "Dexter", category: "Belts", price: 47.50, inStock: 34, reorderPoint: 10, lastOrdered: "Dec 10", onOrder: 0 },
  { sku: "DX-VALVE-INL", name: "Water Inlet Valve Assembly", brand: "Dexter", category: "Valves", price: 187.50, inStock: 12, reorderPoint: 5, lastOrdered: "Dec 5", onOrder: 10 },
  { sku: "SQ-PUMP-DRN", name: "Drain Pump Assembly", brand: "Speed Queen", category: "Pumps", price: 156.00, inStock: 18, reorderPoint: 8, lastOrdered: "Dec 8", onOrder: 0 },
  { sku: "CN-LOCK-DR", name: "Door Lock Assembly", brand: "Continental", category: "Locks", price: 89.00, inStock: 24, reorderPoint: 10, lastOrdered: "Dec 1", onOrder: 0 },
  { sku: "HB-CTRL-GLX", name: "Control Board - Galaxy Series", brand: "Huebsch", category: "Electronics", price: 445.00, inStock: 2, reorderPoint: 3, lastOrdered: "Nov 28", onOrder: 5 },
  { sku: "DX-BRG-400", name: "Bearing Kit - T-400/T-600", brand: "Dexter", category: "Bearings", price: 156.00, inStock: 15, reorderPoint: 5, lastOrdered: "Dec 12", onOrder: 0 },
  { sku: "SQ-SEAL-DR", name: "Door Seal - SC Series", brand: "Speed Queen", category: "Seals", price: 78.00, inStock: 22, reorderPoint: 8, lastOrdered: "Dec 3", onOrder: 0 },
  { sku: "UNIV-THERM", name: "High Limit Thermostat (Universal)", brand: "Universal", category: "Safety", price: 34.00, inStock: 45, reorderPoint: 15, lastOrdered: "Dec 15", onOrder: 0 }
];

// ROI Analysis data
const ROI_METRICS = {
  totalServiceCalls: 847,
  avgCallCost: 175,
  preventedCallbacks: 127,
  callbackSavings: 22225,
  partsRevenue: 124700,
  partsProfitMargin: 0.35,
  laborEfficiency: 1.23,
  firstTimeFixRate: 94.2,
  avgResponseTime: 2.3,
  customerSatisfaction: 4.8,
  monthlyRecurring: 47500,
  annualProjected: 570000
};

export default function ServiceAIEnterpriseDemo() {
  const [activeView, setActiveView] = useState<"operator" | "technician">("operator");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCode, setSelectedCode] = useState<typeof DEMO_ERROR_CODES[0] | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [showPartsOrder, setShowPartsOrder] = useState(false);
  const [cart, setCart] = useState<typeof PARTS_INVENTORY>([]);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => setLiveTime(new Date()), 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const addToCart = (part: typeof PARTS_INVENTORY[0]) => {
    setCart([...cart, part]);
  };

  return (
    <>
      <Helmet>
        <title>Service AI Enterprise | Complete Equipment Intelligence Platform</title>
        <meta name="description" content="Enterprise-grade AI diagnostics, preventative maintenance, parts ordering, and service management for commercial laundry equipment." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0f1a]">
        {/* Premium Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a]">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-white">Service AI Enterprise</h1>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">DEMO</Badge>
                  </div>
                  <p className="text-sm text-gray-400">Complete Equipment Intelligence Platform</p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                  <Button
                    size="sm"
                    variant={activeView === "operator" ? "default" : "ghost"}
                    className={activeView === "operator" ? "bg-[#C8A661] text-[#0a0f1a]" : "text-gray-400 hover:text-white"}
                    onClick={() => setActiveView("operator")}
                    data-testid="button-operator-view"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Operator View
                  </Button>
                  <Button
                    size="sm"
                    variant={activeView === "technician" ? "default" : "ghost"}
                    className={activeView === "technician" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}
                    onClick={() => setActiveView("technician")}
                    data-testid="button-tech-view"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Technician View
                  </Button>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Shield className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">SOC 2</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">Encrypted</span>
                  </div>
                </div>

                <Button variant="outline" size="icon" className="border-white/10 text-gray-400 hover:text-white relative" data-testid="button-cart">
                  <ShoppingCart className="w-4 h-4" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center">{cart.length}</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-b border-white/5 bg-[#0f1420]">
          <div className="max-w-[1800px] mx-auto px-6 py-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#C8A661]" />
                  <span className="text-sm text-white font-bold">{TOTAL_CODES.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">Error Codes</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-gray-700" />
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white font-bold">{TOTAL_MANUALS}</span>
                  <span className="text-xs text-gray-500">Service Manuals</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-gray-700" />
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white font-bold">{EQUIPMENT_BRANDS.length}</span>
                  <span className="text-xs text-gray-500">Brands Supported</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs text-green-400">AI Active</span>
                <span className="text-xs text-gray-500 ml-2">{liveTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1800px] mx-auto px-6 py-6">
          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#1a1f2e] border border-white/5 p-1 flex-wrap h-auto gap-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-diagnostics">
                <Brain className="w-4 h-4 mr-2" />
                AI Diagnostics
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-maintenance">
                <Calendar className="w-4 h-4 mr-2" />
                Preventative Maintenance
              </TabsTrigger>
              <TabsTrigger value="repair-log" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-repair-log">
                <ClipboardList className="w-4 h-4 mr-2" />
                Repair Log
              </TabsTrigger>
              <TabsTrigger value="manuals" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-manuals">
                <BookOpen className="w-4 h-4 mr-2" />
                Service Manuals
              </TabsTrigger>
              <TabsTrigger value="parts" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-parts">
                <Package className="w-4 h-4 mr-2" />
                Parts & Ordering
              </TabsTrigger>
              <TabsTrigger value="roi" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-roi">
                <TrendingUp className="w-4 h-4 mr-2" />
                ROI Analysis
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: "Active Machines", value: "2,847", icon: Cpu, color: "text-blue-400", change: "+12" },
                  { label: "Service Tickets", value: "23", icon: AlertTriangle, color: "text-amber-400", change: "-3" },
                  { label: "First-Time Fix", value: "94.2%", icon: CheckCircle2, color: "text-green-400", change: "+2.1%" },
                  { label: "Avg Response", value: "2.3h", icon: Clock, color: "text-cyan-400", change: "-0.4h" },
                  { label: "Parts Revenue", value: "$124.7K", icon: DollarSign, color: "text-emerald-400", change: "+8%" },
                  { label: "Customer Score", value: "4.8/5", icon: Star, color: "text-[#C8A661]", change: "+0.2" }
                ].map((stat, index) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          <span className="text-xs text-green-400">{stat.change}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Brand Coverage */}
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Complete Brand Coverage</CardTitle>
                      <CardDescription className="text-gray-500">Full diagnostic support for all major commercial laundry equipment manufacturers</CardDescription>
                    </div>
                    <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white" data-testid="button-export-brands">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export to Sheets
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {EQUIPMENT_BRANDS.map((brand, index) => (
                      <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: brand.color }}
                          >
                            {brand.logo}
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm group-hover:text-[#C8A661] transition-colors">{brand.name}</div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Error Codes</span>
                            <span className="text-white font-medium">{brand.codes}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Manuals</span>
                            <span className="text-white font-medium">{brand.manuals}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Machines</span>
                            <span className="text-green-400 font-medium">{brand.machines}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 hover:border-orange-500/30 cursor-pointer transition-all group" onClick={() => setActiveTab("diagnostics")}>
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                      <Brain className="w-7 h-7 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">AI Diagnostics</h3>
                    <p className="text-sm text-gray-400 mb-4">Instant error code lookup with step-by-step repair instructions for all brands</p>
                    <div className="flex items-center text-orange-400 text-sm font-medium">
                      Start Diagnosis <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 hover:border-blue-500/30 cursor-pointer transition-all group" onClick={() => setActiveTab("maintenance")}>
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                      <Calendar className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Preventative Maintenance</h3>
                    <p className="text-sm text-gray-400 mb-4">Automated scheduling and tracking to prevent breakdowns before they happen</p>
                    <div className="flex items-center text-blue-400 text-sm font-medium">
                      View Schedule <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 hover:border-green-500/30 cursor-pointer transition-all group" onClick={() => setActiveTab("parts")}>
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                      <Package className="w-7 h-7 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">One-Click Parts</h3>
                    <p className="text-sm text-gray-400 mb-4">Instant part identification with real-time pricing and one-click ordering</p>
                    <div className="flex items-center text-green-400 text-sm font-medium">
                      Order Parts <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Diagnostics Tab */}
            <TabsContent value="diagnostics" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Search & Input */}
                <Card className="lg:col-span-1 bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-orange-400" />
                      AI Diagnostic Engine
                    </CardTitle>
                    <CardDescription className="text-gray-500">Enter error code, describe symptoms, or upload photo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-400">Error Code or Symptom</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input 
                          placeholder="E.g., E47, F21, 'not draining'..."
                          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-diagnostic-search"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-400">Equipment Brand</Label>
                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1f2e] border-white/10">
                          <SelectItem value="all" className="text-white">All Brands</SelectItem>
                          {EQUIPMENT_BRANDS.map(brand => (
                            <SelectItem key={brand.id} value={brand.id} className="text-white">{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white" data-testid="button-voice-input">
                        <Mic className="w-4 h-4 mr-2" />
                        Voice Input
                      </Button>
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white" data-testid="button-photo-input">
                        <Camera className="w-4 h-4 mr-2" />
                        Photo AI
                      </Button>
                    </div>

                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" data-testid="button-diagnose">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Diagnosis
                    </Button>

                    <Separator className="bg-white/10" />

                    <div>
                      <Label className="text-gray-400 text-sm mb-2 block">Quick Access - Common Codes</Label>
                      <div className="space-y-2">
                        {DEMO_ERROR_CODES.map((code) => (
                          <div 
                            key={code.code}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedCode?.code === code.code 
                                ? 'bg-orange-500/10 border-orange-500/30' 
                                : 'bg-white/5 border-white/5 hover:border-white/20'
                            }`}
                            onClick={() => setSelectedCode(code)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${
                                  code.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                  code.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}>
                                  {code.code}
                                </Badge>
                                <span className="text-sm text-white">{code.title}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{code.brand} • {code.model}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Diagnostic Results */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">
                          {selectedCode ? `Diagnosis: ${selectedCode.code} - ${selectedCode.title}` : 'Select an Error Code'}
                        </CardTitle>
                        {selectedCode && (
                          <CardDescription className="text-gray-500">{selectedCode.brand} • {selectedCode.model}</CardDescription>
                        )}
                      </div>
                      {selectedCode && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-white">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                          </Button>
                          <Button variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-white">
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedCode ? (
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-6">
                          {/* Severity & Quick Stats */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-white/5 text-center">
                              <div className={`text-lg font-bold ${
                                selectedCode.severity === 'critical' ? 'text-red-400' :
                                selectedCode.severity === 'high' ? 'text-orange-400' : 'text-amber-400'
                              }`}>
                                {selectedCode.severity.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500">Severity</div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 text-center">
                              <div className="text-lg font-bold text-white">{selectedCode.estimatedTime}</div>
                              <div className="text-xs text-gray-500">Est. Time</div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 text-center">
                              <div className="text-lg font-bold text-white">{selectedCode.skillLevel}</div>
                              <div className="text-xs text-gray-500">Skill Level</div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 text-center">
                              <div className="text-lg font-bold text-green-400">{selectedCode.successRate}%</div>
                              <div className="text-xs text-gray-500">Success Rate</div>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <h4 className="text-sm font-semibold text-white mb-2">Problem Description</h4>
                            <p className="text-sm text-gray-300">{selectedCode.description}</p>
                          </div>

                          {/* Symptoms */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-400" />
                              Common Symptoms
                            </h4>
                            <ul className="space-y-2">
                              {selectedCode.symptoms.map((symptom, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  {symptom}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Possible Causes */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-400" />
                              Possible Causes
                            </h4>
                            <ul className="space-y-2">
                              {selectedCode.causes.map((cause, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">{i + 1}</span>
                                  {cause}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Diagnostic Steps */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                              <Search className="w-4 h-4 text-cyan-400" />
                              Diagnostic Steps
                            </h4>
                            <ol className="space-y-3">
                              {selectedCode.diagnostics.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Step-by-Step Repair */}
                          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-orange-400" />
                              Step-by-Step Repair Instructions
                            </h4>
                            <ol className="space-y-3">
                              {selectedCode.repairSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Required Tools */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                              <Cog className="w-4 h-4 text-gray-400" />
                              Required Tools
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedCode.tools.map((tool, i) => (
                                <Badge key={i} variant="outline" className="border-white/20 text-gray-300">{tool}</Badge>
                              ))}
                            </div>
                          </div>

                          {/* Safety Notes */}
                          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              Safety Notes
                            </h4>
                            <ul className="space-y-2">
                              {selectedCode.safetyNotes.map((note, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-red-300">
                                  <XCircle className="w-4 h-4" />
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Parts Required - ONE CLICK ORDERING */}
                          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-green-400" />
                                Required Parts - One-Click Ordering
                              </h4>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                In Stock
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              {selectedCode.parts.map((part, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                  <div>
                                    <div className="font-medium text-white text-sm">{part.name}</div>
                                    <div className="text-xs text-gray-500">
                                      <span className="font-mono">{part.partNumber}</span> • {part.supplier}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className="font-bold text-white">${part.price.toFixed(2)}</div>
                                      <div className="text-xs text-green-400">{part.inStock} in stock</div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                      onClick={() => addToCart({ 
                                        sku: part.partNumber, 
                                        name: part.name, 
                                        brand: selectedCode.brand,
                                        category: "Parts",
                                        price: part.price, 
                                        inStock: part.inStock,
                                        reorderPoint: 5,
                                        lastOrdered: "Today",
                                        onOrder: 0
                                      })}
                                      data-testid={`button-add-part-${i}`}
                                    >
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Button className="w-full mt-4 bg-[#C8A661] hover:bg-[#B8964F] text-[#0a0f1a]" data-testid="button-order-all-parts">
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Order All Parts (${selectedCode.parts.reduce((sum, p) => sum + p.price, 0).toFixed(2)})
                            </Button>
                          </div>

                          {/* Video & Manual Links */}
                          <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white h-auto py-4" data-testid="button-watch-video">
                              <div className="text-center">
                                <Video className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                <div className="font-medium">Watch Repair Video</div>
                                <div className="text-xs text-gray-500">Step-by-step visual guide</div>
                              </div>
                            </Button>
                            <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white h-auto py-4" data-testid="button-view-manual">
                              <div className="text-center">
                                <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                                <div className="font-medium">Open Service Manual</div>
                                <div className="text-xs text-gray-500">Page {selectedCode.manualPage}</div>
                              </div>
                            </Button>
                          </div>
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="h-[600px] flex items-center justify-center">
                        <div className="text-center">
                          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-400 mb-2">Select an Error Code</h3>
                          <p className="text-sm text-gray-500">Choose from the list or search for a specific code</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preventative Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Preventative Maintenance Schedule
                      </CardTitle>
                      <CardDescription className="text-gray-500">Automated tracking to prevent breakdowns before they happen</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export to Sheets
                      </Button>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MAINTENANCE_SCHEDULES.map((task, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          task.priority === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                          task.priority === 'high' ? 'bg-amber-500/5 border-amber-500/20' :
                          'bg-white/5 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            task.priority === 'critical' ? 'bg-red-500/20' :
                            task.priority === 'high' ? 'bg-amber-500/20' :
                            task.priority === 'medium' ? 'bg-blue-500/20' : 'bg-gray-500/20'
                          }`}>
                            <Wrench className={`w-5 h-5 ${
                              task.priority === 'critical' ? 'text-red-400' :
                              task.priority === 'high' ? 'text-amber-400' :
                              task.priority === 'medium' ? 'text-blue-400' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-white">{task.task}</div>
                            <div className="text-xs text-gray-500">
                              {task.frequency} • {task.timeRequired} • Last: {task.lastDone}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              task.nextDue === 'Today' || task.nextDue === 'Tomorrow' ? 'text-amber-400' : 'text-gray-400'
                            }`}>
                              Due: {task.nextDue}
                            </div>
                            <Badge className={`text-xs ${
                              task.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              task.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0a0f1a]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Repair Log Tab */}
            <TabsContent value="repair-log" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-purple-400" />
                        Repair Log Book
                      </CardTitle>
                      <CardDescription className="text-gray-500">Complete service history with parts, labor, and notes</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export to Sheets
                      </Button>
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Entry
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {REPAIR_LOG.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 rounded-xl bg-white/5 border border-white/5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                              <Wrench className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">{entry.issue}</div>
                              <div className="text-sm text-gray-400">{entry.machine} • {entry.brand}</div>
                              <div className="text-xs text-gray-500">{entry.date} • Tech: {entry.tech}</div>
                            </div>
                          </div>
                          <Badge className={`${
                            entry.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            entry.status === 'parts_ordered' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {entry.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div className="p-2 rounded-lg bg-white/5 text-center">
                            <div className="text-xs text-gray-500">Labor Hours</div>
                            <div className="text-sm font-bold text-white">{entry.laborHours}h</div>
                          </div>
                          <div className="p-2 rounded-lg bg-white/5 text-center">
                            <div className="text-xs text-gray-500">Labor Cost</div>
                            <div className="text-sm font-bold text-white">${entry.laborCost.toFixed(2)}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-white/5 text-center">
                            <div className="text-xs text-gray-500">Parts Cost</div>
                            <div className="text-sm font-bold text-white">${entry.partsCost.toFixed(2)}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-green-500/10 text-center">
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="text-sm font-bold text-green-400">${(entry.laborCost + entry.partsCost).toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 italic">"{entry.notes}"</div>
                        <div className="text-xs text-gray-600 mt-2">ID: {entry.id}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Manuals Tab */}
            <TabsContent value="manuals" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        Service Manual Library
                      </CardTitle>
                      <CardDescription className="text-gray-500">Complete service documentation for all supported equipment</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Manual
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {SERVICE_MANUALS.map((manual, index) => (
                      <motion.div
                        key={manual.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-7 h-7 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{manual.model}</div>
                            <div className="text-sm text-gray-400">{manual.brand} • {manual.type}</div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                              <span>{manual.pages} pages</span>
                              <span>•</span>
                              <span>{manual.size}</span>
                              <span>•</span>
                              <span>{manual.version}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Updated: {manual.lastUpdated}</div>
                          </div>
                          <Button size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parts & Ordering Tab */}
            <TabsContent value="parts" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Package className="w-5 h-5 text-green-400" />
                          Parts Inventory
                        </CardTitle>
                        <CardDescription className="text-gray-500">Real-time inventory with one-click ordering</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {PARTS_INVENTORY.map((part, index) => (
                        <motion.div
                          key={part.sku}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 rounded-xl border ${
                            part.inStock <= part.reorderPoint ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">{part.name}</div>
                              <div className="text-sm text-gray-400">{part.brand} • {part.category}</div>
                              <div className="text-xs text-gray-500 font-mono">{part.sku}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className={`text-lg font-bold ${part.inStock <= part.reorderPoint ? 'text-amber-400' : 'text-white'}`}>
                                {part.inStock}
                              </div>
                              <div className="text-xs text-gray-500">In Stock</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">${part.price.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">Price</div>
                            </div>
                            {part.inStock <= part.reorderPoint && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                Low Stock
                              </Badge>
                            )}
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => addToCart(part)}
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Order
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Cart */}
                <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-[#C8A661]" />
                      Order Cart ({cart.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cart.length > 0 ? (
                      <div className="space-y-4">
                        {cart.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div>
                              <div className="text-sm font-medium text-white">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.sku}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-white">${item.price.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                        <Separator className="bg-white/10" />
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-[#C8A661]">${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                        </div>
                        <Button className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0a0f1a]">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Checkout
                        </Button>
                        <Button variant="outline" className="w-full border-white/10 text-gray-400 hover:text-white" onClick={() => setCart([])}>
                          Clear Cart
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">Cart is empty</p>
                        <p className="text-xs text-gray-600">Add parts from inventory or diagnostics</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ROI Analysis Tab */}
            <TabsContent value="roi" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Annual Revenue Impact", value: formatCurrency(ROI_METRICS.annualProjected), icon: DollarSign, color: "text-green-400" },
                  { label: "Callback Savings", value: formatCurrency(ROI_METRICS.callbackSavings), icon: TrendingDown, color: "text-cyan-400" },
                  { label: "Labor Efficiency", value: `${ROI_METRICS.laborEfficiency}x`, icon: Zap, color: "text-[#C8A661]" },
                  { label: "First-Time Fix Rate", value: `${ROI_METRICS.firstTimeFixRate}%`, icon: Target, color: "text-purple-400" }
                ].map((stat, index) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-emerald-400" />
                        ROI Breakdown & Export
                      </CardTitle>
                      <CardDescription className="text-gray-500">Complete financial analysis with Google Sheets export</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export to Google Sheets
                      </Button>
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <Table className="w-4 h-4 mr-2" />
                        Export to Excel
                      </Button>
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF Report
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">Revenue Impact</h4>
                      {[
                        { label: "Parts Revenue (MTD)", value: formatCurrency(ROI_METRICS.partsRevenue) },
                        { label: "Parts Profit (35% margin)", value: formatCurrency(ROI_METRICS.partsRevenue * ROI_METRICS.partsProfitMargin) },
                        { label: "Monthly Recurring Revenue", value: formatCurrency(ROI_METRICS.monthlyRecurring) },
                        { label: "Annual Projected", value: formatCurrency(ROI_METRICS.annualProjected) }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="font-bold text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">Efficiency Gains</h4>
                      {[
                        { label: "Total Service Calls", value: ROI_METRICS.totalServiceCalls.toString() },
                        { label: "Prevented Callbacks", value: ROI_METRICS.preventedCallbacks.toString() },
                        { label: "Callback Savings", value: formatCurrency(ROI_METRICS.callbackSavings) },
                        { label: "Avg Response Time", value: `${ROI_METRICS.avgResponseTime} hours` }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="font-bold text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 bg-[#0a0f1a] mt-12">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Powered by WashBizHub Service AI</span>
                <Separator orientation="vertical" className="h-3 bg-gray-700" />
                <span>{TOTAL_CODES.toLocaleString()} Error Codes</span>
                <span>•</span>
                <span>{TOTAL_MANUALS} Service Manuals</span>
                <span>•</span>
                <span>{EQUIPMENT_BRANDS.length} Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-green-400" />
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
