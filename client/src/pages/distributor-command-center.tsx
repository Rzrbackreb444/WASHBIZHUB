import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  Building2, 
  Cpu, 
  Package, 
  Wrench, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Users,
  MapPin,
  BarChart3,
  Zap,
  Activity,
  DollarSign,
  Truck,
  Settings,
  RefreshCw,
  ChevronRight,
  Filter,
  Search,
  Bell,
  Headphones,
  Shield,
  Lock,
  Wifi,
  WifiOff,
  ThermometerSun,
  Droplets,
  Timer,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Play,
  Pause,
  Volume2,
  PhoneIncoming,
  PhoneOutgoing,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  CircleDot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Realistic AAdvantage / EVI-style demo data
const COMPANY_NAME = "AAdvantage Laundry Systems";
const DEMO_MODE = true;

const mockFleetData = {
  totalMachines: 2847,
  online: 2712,
  offline: 48,
  maintenance: 87,
  avgUptime: 98.3,
  revenueToday: 847250,
  revenueMTD: 12847000,
  partsRevenueMTD: 1247000,
  serviceCallsToday: 47,
  avgResponseTime: 2.3,
  brands: [
    { name: "Dexter", count: 1423, online: 1398, revenue: 5847000, color: "#DC2626" },
    { name: "Speed Queen", count: 698, online: 672, revenue: 3247000, color: "#2563EB" },
    { name: "Continental Girbau", count: 456, online: 428, revenue: 2147000, color: "#059669" },
    { name: "Huebsch", count: 270, online: 214, revenue: 1406000, color: "#7C3AED" }
  ],
  customers: 342,
  locations: 187,
  technicians: 28,
  serviceTickets: 23,
  partsOrders: 18,
  pendingDeliveries: 7
};

const mockMachines = [
  { id: "DX-4500-W001", brand: "Dexter", model: "T-400", type: "Washer", status: "running", customer: "Clean City Laundry", location: "Dallas - Oak Lawn", temp: 142, cycles: 12847, lastService: "2024-11-15", health: 94 },
  { id: "DX-4500-W002", brand: "Dexter", model: "T-400", type: "Washer", status: "running", customer: "Clean City Laundry", location: "Dallas - Oak Lawn", temp: 138, cycles: 11234, lastService: "2024-10-22", health: 91 },
  { id: "DX-4500-D001", brand: "Dexter", model: "T-80", type: "Dryer", status: "warning", customer: "Clean City Laundry", location: "Dallas - Oak Lawn", temp: 185, cycles: 15678, lastService: "2024-09-10", health: 67 },
  { id: "SQ-3200-W001", brand: "Speed Queen", model: "SC40", type: "Washer", status: "running", customer: "Fresh Wash Express", location: "Fort Worth - Downtown", temp: 135, cycles: 8456, lastService: "2024-12-01", health: 98 },
  { id: "SQ-3200-D001", brand: "Speed Queen", model: "ST75", type: "Dryer", status: "running", customer: "Fresh Wash Express", location: "Fort Worth - Downtown", temp: 172, cycles: 9234, lastService: "2024-11-28", health: 96 },
  { id: "CN-2800-W001", brand: "Continental", model: "E-Series", type: "Washer", status: "offline", customer: "Downtown Suds", location: "Arlington - Central", temp: 0, cycles: 22456, lastService: "2024-08-15", health: 45 },
  { id: "HB-1800-W001", brand: "Huebsch", model: "Galaxy", type: "Washer", status: "running", customer: "Quick Clean Center", location: "Plano - Legacy", temp: 140, cycles: 6789, lastService: "2024-12-10", health: 99 },
  { id: "DX-4500-W003", brand: "Dexter", model: "T-600", type: "Washer", status: "running", customer: "Laundry Land", location: "Irving - Las Colinas", temp: 145, cycles: 18234, lastService: "2024-11-20", health: 88 },
  { id: "DX-4500-D002", brand: "Dexter", model: "T-120", type: "Dryer", status: "maintenance", customer: "Spin Cycle Pro", location: "Garland - Downtown", temp: 0, cycles: 24567, lastService: "2024-07-22", health: 52 },
  { id: "SQ-3200-W002", brand: "Speed Queen", model: "SC60", type: "Washer", status: "running", customer: "Campus Wash Co", location: "Denton - UNT Area", temp: 138, cycles: 4567, lastService: "2024-12-05", health: 100 },
];

const mockAlerts = [
  { id: 1, type: "critical", machine: "DX-4500-D001", customer: "Clean City Laundry", location: "Dallas - Oak Lawn", message: "Exhaust temperature exceeding threshold (185°F) - immediate inspection required", time: "2 min ago", acknowledged: false },
  { id: 2, type: "critical", machine: "CN-2800-W001", customer: "Downtown Suds", location: "Arlington - Central", message: "Machine offline - no telemetry received for 4 hours", time: "4 hrs ago", acknowledged: false },
  { id: 3, type: "warning", machine: "DX-4500-D002", customer: "Spin Cycle Pro", location: "Garland - Downtown", message: "Scheduled maintenance overdue by 45 days", time: "1 day ago", acknowledged: true },
  { id: 4, type: "warning", machine: "SQ-3200-D018", customer: "Fresh Wash Express", location: "Fort Worth - Downtown", message: "Belt tension sensor reading below optimal", time: "3 hrs ago", acknowledged: false },
  { id: 5, type: "info", machine: "HB-1800-W001", customer: "Quick Clean Center", location: "Plano - Legacy", message: "Warranty expiration in 30 days - renewal recommended", time: "Today", acknowledged: true }
];

const mockRecentCalls = [
  { id: 1, caller: "Mike's Laundromat", phone: "(214) 555-0147", issue: "Washer not draining - Unit #4", status: "dispatched", tech: "John Davidson", time: "10:30 AM", priority: "high", eta: "25 min" },
  { id: 2, caller: "Campus Wash Co", phone: "(940) 555-0234", issue: "Card reader error code E47", status: "scheduled", tech: "Sarah Mitchell", time: "11:45 AM", priority: "medium", eta: "2:00 PM" },
  { id: 3, caller: "Green Clean LLC", phone: "(817) 555-0891", issue: "Dryer not heating properly", status: "en_route", tech: "Tom Bradley", time: "9:15 AM", priority: "high", eta: "12 min" },
  { id: 4, caller: "Spin Zone", phone: "(972) 555-0456", issue: "Water leak under washer #7", status: "completed", tech: "Maria Garcia", time: "Yesterday 4:30 PM", priority: "critical", eta: null },
  { id: 5, caller: "Fresh Start Laundry", phone: "(469) 555-0789", issue: "Coin mechanism jammed", status: "scheduled", tech: "David Chen", time: "Tomorrow 9:00 AM", priority: "low", eta: null }
];

const mockPartsRecommendations = [
  { part: "Drive Belt #9040-076-009", machine: "Dexter T-80/T-120 Series", sku: "DX-BELT-80", price: 47.50, reason: "Predictive: 847 cycles remaining based on wear pattern", urgency: "high", customers: 12, inStock: 34, leadTime: "In Stock" },
  { part: "Water Inlet Valve Assembly", machine: "Speed Queen SC40/SC60", sku: "SQ-VALVE-INL", price: 189.00, reason: "Failure pattern detected - 3 units showing degradation", urgency: "critical", customers: 3, inStock: 8, leadTime: "In Stock" },
  { part: "Control Board Module #9857-147", machine: "Continental E-Series", sku: "CN-CTRL-E47", price: 445.00, reason: "End of life cycle - 2 units approaching 25K cycles", urgency: "medium", customers: 8, inStock: 2, leadTime: "3-5 days" },
  { part: "Door Latch Assembly", machine: "Huebsch Galaxy Series", sku: "HB-LATCH-GLX", price: 78.00, reason: "Preventive replacement recommended at 20K cycles", urgency: "low", customers: 15, inStock: 22, leadTime: "In Stock" },
  { part: "Bearing Kit #9732-258", machine: "Dexter T-400/T-600", sku: "DX-BRG-400", price: 156.00, reason: "Vibration sensors detecting early wear", urgency: "medium", customers: 6, inStock: 12, leadTime: "In Stock" }
];

const mockTechnicians = [
  { id: 1, name: "John Davidson", status: "on_job", location: "Dallas - Oak Lawn", jobsToday: 5, jobsCompleted: 3, eta: "25 min", rating: 4.9, specialty: "Dexter" },
  { id: 2, name: "Sarah Mitchell", status: "available", location: "Fort Worth HQ", jobsToday: 4, jobsCompleted: 2, eta: null, rating: 4.8, specialty: "Speed Queen" },
  { id: 3, name: "Tom Bradley", status: "en_route", location: "En route to Plano", jobsToday: 6, jobsCompleted: 4, eta: "12 min", rating: 4.7, specialty: "All Brands" },
  { id: 4, name: "Maria Garcia", status: "available", location: "Arlington Office", jobsToday: 5, jobsCompleted: 5, eta: null, rating: 5.0, specialty: "Continental" },
  { id: 5, name: "David Chen", status: "break", location: "Irving - Las Colinas", jobsToday: 4, jobsCompleted: 3, eta: null, rating: 4.6, specialty: "Huebsch" }
];

export default function DistributorCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [liveUpdateTime, setLiveUpdateTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLiveUpdateTime(new Date());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <Helmet>
        <title>Command Center | {COMPANY_NAME} | Fleet AI</title>
        <meta 
          name="description" 
          content="Enterprise AI-powered fleet management. Real-time monitoring, predictive maintenance, parts intelligence, and dispatch optimization." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0f1a]">
        {/* Premium Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a]">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8A661] to-[#8B7355] flex items-center justify-center shadow-lg shadow-[#C8A661]/20">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-white">{COMPANY_NAME}</h1>
                    {DEMO_MODE && (
                      <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                        DEMO MODE
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">Fleet Command Center</span>
                    <Separator orientation="vertical" className="h-3 bg-gray-700" />
                    <div className="flex items-center gap-1.5">
                      {isLive ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          <span className="text-green-400 text-xs">LIVE</span>
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                          <span className="text-gray-500 text-xs">PAUSED</span>
                        </>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs">Last update: {formatTime(liveUpdateTime)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Shield className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">SOC 2 Compliant</span>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">256-bit Encrypted</span>
                </div>
                <Separator orientation="vertical" className="h-6 bg-gray-700 hidden md:block" />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input 
                    placeholder="Search machines, customers..." 
                    className="pl-9 w-64 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#C8A661]/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-fleet-search"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => setIsLive(!isLive)}
                  data-testid="button-toggle-live"
                >
                  {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 relative"
                  data-testid="button-notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1800px] mx-auto px-6 py-6">
          {/* Executive KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Cpu className="w-5 h-5 text-[#C8A661]" />
                    <Badge className="bg-green-500/20 text-green-400 text-[10px]">LIVE</Badge>
                  </div>
                  <div className="text-2xl font-bold text-white">{mockFleetData.totalMachines.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Fleet</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-xs text-green-400 font-bold">{mockFleetData.avgUptime}%</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{mockFleetData.online.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Online Now</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{mockFleetData.maintenance}</div>
                  <div className="text-xs text-gray-500">Need Service</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <div className="flex items-center text-emerald-400 text-xs">
                      <ArrowUpRight className="w-3 h-3" />
                      12%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(mockFleetData.revenueMTD)}</div>
                  <div className="text-xs text-gray-500">Revenue MTD</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-purple-400" />
                    <div className="flex items-center text-emerald-400 text-xs">
                      <ArrowUpRight className="w-3 h-3" />
                      8%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(mockFleetData.partsRevenueMTD)}</div>
                  <div className="text-xs text-gray-500">Parts Revenue</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{mockFleetData.customers}</div>
                  <div className="text-xs text-gray-500">Customers</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Wrench className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{mockFleetData.serviceCallsToday}</div>
                  <div className="text-xs text-gray-500">Calls Today</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{mockFleetData.avgResponseTime}h</div>
                  <div className="text-xs text-gray-500">Avg Response</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#1a1f2e] border border-white/5 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Command Overview
              </TabsTrigger>
              <TabsTrigger value="fleet" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-fleet">
                <Cpu className="w-4 h-4 mr-2" />
                Fleet Health
              </TabsTrigger>
              <TabsTrigger value="parts" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-parts">
                <Package className="w-4 h-4 mr-2" />
                Parts Intelligence
              </TabsTrigger>
              <TabsTrigger value="receptionist" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-receptionist">
                <Headphones className="w-4 h-4 mr-2" />
                AI Receptionist
              </TabsTrigger>
              <TabsTrigger value="dispatch" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0a0f1a] text-gray-400" data-testid="tab-dispatch">
                <Truck className="w-4 h-4 mr-2" />
                Dispatch
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Critical Alerts */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-red-500 via-amber-500 to-green-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Active Alerts
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                          {mockAlerts.filter(a => a.type === 'critical').length} Critical
                        </Badge>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          {mockAlerts.filter(a => a.type === 'warning').length} Warning
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                    <AnimatePresence>
                      {mockAlerts.map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-start gap-3 p-4 rounded-xl border ${
                            alert.type === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                            alert.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                            'bg-blue-500/5 border-blue-500/20'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${
                            alert.type === 'critical' ? 'bg-red-500 animate-pulse' :
                            alert.type === 'warning' ? 'bg-amber-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm text-white">{alert.machine}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-400">{alert.customer}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{alert.location}</span>
                            </div>
                            <p className="text-sm text-gray-300">{alert.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-500">{alert.time}</span>
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Acknowledged
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {!alert.acknowledged && (
                              <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0a0f1a] text-xs">
                                Dispatch
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Brand Distribution */}
                <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-[#C8A661] to-[#8B7355]" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Fleet by Brand</CardTitle>
                    <CardDescription className="text-gray-500">Equipment distribution across manufacturers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockFleetData.brands.map((brand, index) => (
                      <motion.div 
                        key={brand.name} 
                        className="space-y-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.color }} />
                            <span className="font-medium text-white">{brand.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">{brand.count.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{formatCurrency(brand.revenue)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full rounded-full"
                              style={{ backgroundColor: brand.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(brand.online / brand.count) * 100}%` }}
                              transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                            />
                          </div>
                          <span className="text-xs text-green-400 font-medium w-12 text-right">
                            {Math.round((brand.online / brand.count) * 100)}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Calls & Parts Intelligence */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Service Calls */}
                <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Phone className="w-5 h-5 text-blue-400" />
                        Live Service Queue
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setActiveTab("receptionist")}>
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockRecentCalls.slice(0, 4).map((call, index) => (
                      <motion.div 
                        key={call.id} 
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            call.status === 'completed' ? 'bg-green-500/20' :
                            call.status === 'en_route' ? 'bg-blue-500/20' :
                            call.status === 'dispatched' ? 'bg-amber-500/20' :
                            'bg-gray-500/20'
                          }`}>
                            {call.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                             call.status === 'en_route' ? <Truck className="w-5 h-5 text-blue-400" /> :
                             call.status === 'dispatched' ? <PhoneOutgoing className="w-5 h-5 text-amber-400" /> :
                             <Clock className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">{call.caller}</div>
                            <div className="text-xs text-gray-400">{call.issue}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{call.time}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-xs ${
                            call.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            call.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            call.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {call.priority}
                          </Badge>
                          {call.eta && (
                            <div className="text-xs text-cyan-400 mt-1">ETA: {call.eta}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-0.5">{call.tech}</div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Parts Intelligence Preview */}
                <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-400" />
                        Parts Intelligence
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setActiveTab("parts")}>
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockPartsRecommendations.slice(0, 3).map((part, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">{part.part}</div>
                          <div className="text-xs text-gray-400">{part.machine}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Zap className="w-3 h-3 text-[#C8A661]" />
                            {part.reason}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <Badge className={`text-xs ${
                            part.urgency === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            part.urgency === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            part.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {part.urgency}
                          </Badge>
                          <div className="text-xs text-white font-medium mt-1">{formatCurrency(part.price)}</div>
                          <div className="text-xs text-gray-500">{part.customers} customers</div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Fleet Health Tab */}
            <TabsContent value="fleet" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-white">Real-Time Fleet Monitoring</CardTitle>
                      <CardDescription className="text-gray-500">Live equipment status across all brands and locations</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Filter brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1f2e] border-white/10">
                          <SelectItem value="all" className="text-white">All Brands</SelectItem>
                          <SelectItem value="dexter" className="text-white">Dexter</SelectItem>
                          <SelectItem value="speedqueen" className="text-white">Speed Queen</SelectItem>
                          <SelectItem value="continental" className="text-white">Continental</SelectItem>
                          <SelectItem value="huebsch" className="text-white">Huebsch</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <Filter className="w-4 h-4 mr-2" />
                        More Filters
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {mockMachines.map((machine, index) => (
                      <motion.div
                        key={machine.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                          machine.status === 'running' ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' :
                          machine.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' :
                          machine.status === 'maintenance' ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40' :
                          'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-mono text-sm font-bold text-white">{machine.id}</div>
                            <div className="text-xs text-gray-400">{machine.brand} {machine.model}</div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            machine.status === 'running' ? 'bg-green-500 animate-pulse' :
                            machine.status === 'warning' ? 'bg-amber-500' :
                            machine.status === 'maintenance' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Customer</span>
                            <span className="text-gray-300">{machine.customer}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Location</span>
                            <span className="text-gray-300">{machine.location}</span>
                          </div>
                          {machine.temp > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 flex items-center gap-1">
                                <ThermometerSun className="w-3 h-3" />
                                Temp
                              </span>
                              <span className={machine.temp > 180 ? 'text-red-400' : 'text-gray-300'}>{machine.temp}°F</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Cycles</span>
                            <span className="text-gray-300">{machine.cycles.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Health Score</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    machine.health >= 80 ? 'bg-green-500' :
                                    machine.health >= 60 ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${machine.health}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${
                                machine.health >= 80 ? 'text-green-400' :
                                machine.health >= 60 ? 'text-amber-400' :
                                'text-red-400'
                              }`}>{machine.health}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                      Load More Machines ({mockFleetData.totalMachines - mockMachines.length} remaining)
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parts Intelligence Tab */}
            <TabsContent value="parts" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-white">Predictive Parts Intelligence</CardTitle>
                      <CardDescription className="text-gray-500">AI-powered recommendations based on telemetry and repair history</CardDescription>
                    </div>
                    <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0a0f1a]">
                      <Package className="w-4 h-4 mr-2" />
                      Create Bulk Order
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPartsRecommendations.map((part, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Package className="w-7 h-7 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{part.part}</div>
                            <div className="text-sm text-gray-400">{part.machine}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span className="font-mono bg-white/5 px-2 py-0.5 rounded">{part.sku}</span>
                              <span>•</span>
                              <Zap className="w-3 h-3 text-[#C8A661]" />
                              <span>{part.reason}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Price</div>
                            <div className="text-lg font-bold text-white">{formatCurrency(part.price)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Affected</div>
                            <div className="text-lg font-bold text-white">{part.customers}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">In Stock</div>
                            <div className="text-lg font-bold text-green-400">{part.inStock}</div>
                          </div>
                          <Badge className={`${
                            part.urgency === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            part.urgency === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            part.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {part.urgency} priority
                          </Badge>
                          <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0a0f1a]">
                            Order Now
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Receptionist Tab */}
            <TabsContent value="receptionist" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Headphones className="w-5 h-5 text-blue-400" />
                          AI Receptionist Console
                        </CardTitle>
                        <CardDescription className="text-gray-500">24/7 AI-powered call handling and scheduling</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-green-400 text-sm font-medium">System Active</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockRecentCalls.map((call, index) => (
                        <motion.div 
                          key={call.id} 
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              call.status === 'completed' ? 'bg-green-500/20' :
                              call.status === 'en_route' ? 'bg-blue-500/20' :
                              call.status === 'dispatched' ? 'bg-amber-500/20' :
                              'bg-gray-500/20'
                            }`}>
                              {call.status === 'completed' ? <CheckCircle className="w-6 h-6 text-green-400" /> :
                               call.status === 'en_route' ? <Truck className="w-6 h-6 text-blue-400" /> :
                               call.status === 'dispatched' ? <PhoneOutgoing className="w-6 h-6 text-amber-400" /> :
                               <Calendar className="w-6 h-6 text-gray-400" />}
                            </div>
                            <div>
                              <div className="font-medium text-white">{call.caller}</div>
                              <div className="text-sm text-gray-400">{call.issue}</div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Phone className="w-3 h-3" />
                                {call.phone}
                                <span>•</span>
                                {call.time}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge className={`${
                                call.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                call.status === 'en_route' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                call.status === 'dispatched' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              }`}>
                                {call.status.replace('_', ' ')}
                              </Badge>
                              <div className="text-xs text-gray-400 mt-1">Tech: {call.tech}</div>
                              {call.eta && <div className="text-xs text-cyan-400">ETA: {call.eta}</div>}
                            </div>
                            <Button size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                              Details
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Today's Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Calls Handled", value: "47", icon: Phone, color: "text-blue-400" },
                      { label: "Avg Handle Time", value: "2:34", icon: Clock, color: "text-cyan-400" },
                      { label: "Resolution Rate", value: "94%", icon: CheckCircle2, color: "text-green-400" },
                      { label: "Appointments Set", value: "18", icon: Calendar, color: "text-purple-400" },
                      { label: "Escalations", value: "3", icon: AlertCircle, color: "text-amber-400" },
                      { label: "Customer Satisfaction", value: "4.8/5", icon: Star, color: "text-[#C8A661]" }
                    ].map((stat, index) => (
                      <motion.div 
                        key={stat.label}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          <span className="text-sm text-gray-400">{stat.label}</span>
                        </div>
                        <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Dispatch Tab */}
            <TabsContent value="dispatch" className="space-y-6">
              <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border-white/5 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Truck className="w-5 h-5 text-orange-400" />
                        Technician Dispatch
                      </CardTitle>
                      <CardDescription className="text-gray-500">AI-optimized routing and real-time tracking</CardDescription>
                    </div>
                    <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0a0f1a]">
                      <MapPin className="w-4 h-4 mr-2" />
                      Optimize All Routes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-gradient-to-br from-[#0f1420] to-[#1a1f2e] rounded-xl border border-white/5 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-16 h-16 text-[#C8A661]/50 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">Live Route Map</p>
                        <p className="text-sm text-gray-500">Google Maps integration with real-time tracking</p>
                        <p className="text-xs text-gray-600 mt-2">Connect Google Maps API for live view</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {mockTechnicians.map((tech, index) => (
                        <motion.div
                          key={tech.id}
                          className={`p-4 rounded-xl border ${
                            tech.status === 'available' ? 'bg-green-500/5 border-green-500/20' :
                            tech.status === 'on_job' ? 'bg-blue-500/5 border-blue-500/20' :
                            tech.status === 'en_route' ? 'bg-amber-500/5 border-amber-500/20' :
                            'bg-gray-500/5 border-gray-500/20'
                          }`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                tech.status === 'available' ? 'bg-green-500/20 text-green-400' :
                                tech.status === 'on_job' ? 'bg-blue-500/20 text-blue-400' :
                                tech.status === 'en_route' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {tech.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-white text-sm">{tech.name}</div>
                                <div className="text-xs text-gray-500">{tech.specialty}</div>
                              </div>
                            </div>
                            <Badge className={`text-xs ${
                              tech.status === 'available' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              tech.status === 'on_job' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              tech.status === 'en_route' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                              {tech.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {tech.location}
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <div className="text-xs text-gray-500">
                              {tech.jobsCompleted}/{tech.jobsToday} jobs
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[#C8A661]">
                              <Star className="w-3 h-3 fill-current" />
                              {tech.rating}
                            </div>
                          </div>
                        </motion.div>
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
                <span>Powered by WashBizHub Fleet AI</span>
                <Separator orientation="vertical" className="h-3 bg-gray-700" />
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-blue-400" />
                  <span>End-to-End Encrypted</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>v3.0.0</span>
                <Separator orientation="vertical" className="h-3 bg-gray-700" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
