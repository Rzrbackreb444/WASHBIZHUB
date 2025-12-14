import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { OperatorLayout } from "@/components/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { KPICard } from "@/components/dashboard/KPICard";
import { DonutChart, SectionHeader } from "@/components/dashboard/DashboardComponents";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Activity,
  Truck,
  Wrench,
  Users,
  Package,
  Plus,
  Send,
  Settings,
  ShoppingCart,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
  MapPin,
  CreditCard,
  Ticket,
  TrendingUp,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Wifi,
  WifiOff,
  ChevronRight,
  BarChart3,
  Globe,
  Target,
  Scale,
  Building2,
  Eye,
  Edit,
  ExternalLink,
  Receipt,
  Timer,
  Sparkles,
  MessageSquare,
  Star,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import heroImage from "@assets/AdobeStock_790549884_1765733867350.jpeg";

// Revenue data types
interface KPIData {
  revenue: { today: number; month: number; transactions: number };
  machines: { total: number; running: number; available: number; maintenance: number; offline: number };
  tickets: { total: number; urgent: number; pending: number };
}

interface RevenueChartDay {
  name: string;
  revenue: number;
  date: string;
}

// Default revenue data (fallback when no real data)
const defaultRevenueData = {
  daily: [
    { name: "Mon", current: 0, previous: 0 },
    { name: "Tue", current: 0, previous: 0 },
    { name: "Wed", current: 0, previous: 0 },
    { name: "Thu", current: 0, previous: 0 },
    { name: "Fri", current: 0, previous: 0 },
    { name: "Sat", current: 0, previous: 0 },
    { name: "Sun", current: 0, previous: 0 },
  ],
};

const revenueByServiceData = [
  { name: "Self-Service", value: 45, color: "#0A1628" },
  { name: "Wash & Fold", value: 30, color: "#C8A661" },
  { name: "Pickup & Delivery", value: 15, color: "#3B82F6" },
  { name: "Dry Cleaning", value: 10, color: "#10B981" },
];

const mockActivityFeed = [
  { id: 1, type: "transaction", message: "POS Sale #1247 - $42.50", time: "2 min ago", icon: CreditCard },
  { id: 2, type: "booking", message: "New pickup scheduled - 123 Main St", time: "5 min ago", icon: Calendar },
  { id: 3, type: "driver", message: "Driver Mike checked in at Route #3", time: "12 min ago", icon: MapPin },
  { id: 4, type: "alert", message: "Washer #7 - High vibration detected", time: "18 min ago", icon: AlertTriangle },
  { id: 5, type: "coupon", message: "SPRING20 redeemed by John D.", time: "25 min ago", icon: Ticket },
  { id: 6, type: "transaction", message: "POS Sale #1246 - $28.75", time: "32 min ago", icon: CreditCard },
  { id: 7, type: "booking", message: "Delivery completed - Order #892", time: "45 min ago", icon: CheckCircle },
  { id: 8, type: "alert", message: "Dryer #3 maintenance reminder", time: "1 hr ago", icon: Bell },
];

const mockSchedule = [
  { id: 1, type: "delivery", title: "Pickup - 456 Oak Ave", time: "10:30 AM", status: "upcoming", driver: "Mike T." },
  { id: 2, type: "delivery", title: "Delivery - 789 Pine St", time: "11:15 AM", status: "upcoming", driver: "Sarah L." },
  { id: 3, type: "maintenance", title: "Washer #5 - Belt replacement", time: "2:00 PM", status: "scheduled", tech: "Bob K." },
  { id: 4, type: "shift", title: "Evening shift starts", time: "4:00 PM", status: "scheduled", staff: "Team B" },
  { id: 5, type: "delivery", title: "Express Pickup - 321 Elm Rd", time: "4:30 PM", status: "upcoming", driver: "Mike T." },
];

const quickActions = [
  { id: "pos", label: "Create Transaction", icon: ShoppingCart, href: "/pos-suite", color: "bg-[#0A1628]" },
  { id: "dispatch", label: "Dispatch Driver", icon: Truck, href: "/route-optimization", color: "bg-blue-600" },
  { id: "promo", label: "Send Promotion", icon: Send, href: "/marketing-loyalty", color: "bg-purple-600" },
  { id: "repair", label: "Repair Ticket", icon: Wrench, href: "/service-guy-ai", color: "bg-orange-600" },
  { id: "pricing", label: "Adjust Pricing", icon: Settings, href: "/iot-dashboard", color: "bg-green-600" },
];

// Mock CLEANBI data for command center
const mockCleanbiData = {
  overallScore: 82,
  grade: "B",
  factors: [
    { name: "Location", score: 88, weight: 25 },
    { name: "Demographics", score: 76, weight: 20 },
    { name: "Competition", score: 85, weight: 20 },
    { name: "Traffic", score: 79, weight: 15 },
    { name: "Visibility", score: 84, weight: 10 },
    { name: "Infrastructure", score: 78, weight: 10 },
  ],
};

// Mock pending orders for POS widget
const mockPendingOrders = [
  { id: "WDF-001", customer: "John D.", type: "Wash & Fold", weight: "12.5 lbs", status: "processing", eta: "2:30 PM" },
  { id: "WDF-002", customer: "Sarah M.", type: "Pickup", weight: "8.2 lbs", status: "ready", eta: "Ready" },
  { id: "WDF-003", customer: "Mike R.", type: "Express", weight: "5.0 lbs", status: "weighing", eta: "1:45 PM" },
  { id: "DC-001", customer: "Lisa K.", type: "Dry Clean", weight: "3 items", status: "processing", eta: "Tomorrow" },
];

// Mock website stats
const mockWebsiteStats = {
  visitors: 1247,
  pageViews: 3892,
  conversionRate: 4.2,
  topPage: "Services",
  lastPublished: "2 hours ago",
  status: "published",
};

// Service Guy AI mock tickets
const mockServiceTickets = [
  { id: "SRV-001", machine: "Washer #7", issue: "High vibration", priority: "high", status: "open" },
  { id: "SRV-002", machine: "Dryer #3", issue: "Not heating", priority: "medium", status: "in_progress" },
  { id: "SRV-003", machine: "Changer #1", issue: "Coin jam", priority: "low", status: "scheduled" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function getActivityIcon(type: string) {
  switch (type) {
    case "transaction": return { icon: CreditCard, color: "text-green-600 bg-green-100 dark:bg-green-900/30" };
    case "booking": return { icon: Calendar, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" };
    case "driver": return { icon: MapPin, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" };
    case "alert": return { icon: AlertTriangle, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" };
    case "coupon": return { icon: Ticket, color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30" };
    default: return { icon: Bell, color: "text-gray-600 bg-gray-100 dark:bg-gray-800" };
  }
}

function getScheduleStyle(type: string) {
  switch (type) {
    case "delivery": return { icon: Truck, color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20" };
    case "maintenance": return { icon: Wrench, color: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20" };
    case "shift": return { icon: Users, color: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20" };
    default: return { icon: Calendar, color: "border-l-gray-500 bg-gray-50 dark:bg-gray-800" };
  }
}

// Helper functions for status colors
function getOrderStatusColor(status: string) {
  switch (status) {
    case "ready": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "processing": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "weighing": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}

function getTicketStatusColor(status: string) {
  switch (status) {
    case "open": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "in_progress": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "scheduled": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}

function getGradeColor(grade: string) {
  switch (grade) {
    case "A": return "text-green-500";
    case "B": return "text-lime-500";
    case "C": return "text-amber-500";
    default: return "text-[#C8A661]";
  }
}

export default function OperatorDashboard() {
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [activeTab, setActiveTab] = useState("overview");
  const [quickPosWeight, setQuickPosWeight] = useState("");
  const [quickPosService, setQuickPosService] = useState("wash_fold");
  const { toast } = useToast();

  // Real API queries for operator dashboard
  const { data: kpiData, isLoading: kpiLoading } = useQuery<KPIData>({
    queryKey: ["/api/operator/kpis"],
    staleTime: 30000,
  });

  const { data: revenueChartData } = useQuery<RevenueChartDay[]>({
    queryKey: ["/api/operator/revenue-chart"],
    staleTime: 60000,
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/operator/transactions"],
    staleTime: 30000,
  });

  const { data: machines } = useQuery({
    queryKey: ["/api/operator/machines"],
    staleTime: 30000,
  });

  const { data: tickets } = useQuery({
    queryKey: ["/api/operator/tickets"],
    staleTime: 30000,
  });

  const { data: coursesData } = useQuery({
    queryKey: ["/api/operator/courses"],
    staleTime: 60000,
  });

  // Derive KPIs from real data with fallbacks
  const todayRevenue = kpiData?.revenue?.today ?? 0;
  const monthRevenue = kpiData?.revenue?.month ?? 0;
  const transactionCount = kpiData?.revenue?.transactions ?? 0;
  const totalMachines = kpiData?.machines?.total ?? 0;
  const activeMachines = (kpiData?.machines?.running ?? 0) + (kpiData?.machines?.available ?? 0);
  const openTickets = kpiData?.tickets?.total ?? 0;
  const urgentTickets = kpiData?.tickets?.urgent ?? 0;
  const pendingDeliveries = 5; // TODO: Connect to real delivery tracking API
  const loyaltyMembers = 0; // TODO: Connect to real loyalty API
  const lowStockItems = 0; // TODO: Connect to real inventory API

  // Build machine status data from real API
  const machineStatusData = [
    { label: "Running", value: kpiData?.machines?.running ?? 0, color: "#10B981" },
    { label: "Available", value: kpiData?.machines?.available ?? 0, color: "#3B82F6" },
    { label: "Maintenance", value: kpiData?.machines?.maintenance ?? 0, color: "#F59E0B" },
    { label: "Offline", value: kpiData?.machines?.offline ?? 0, color: "#6B7280" },
  ];

  // Build revenue chart from real data
  const revenueData = revenueChartData?.map(d => ({
    name: d.name,
    current: d.revenue,
    previous: 0,
  })) || defaultRevenueData.daily;

  const currentTotal = revenueData.reduce((sum, d) => sum + d.current, 0);
  const previousTotal = revenueData.reduce((sum, d) => sum + d.previous, 0);
  const revenueTrend = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  // Quick POS calculation
  const pricePerPound = quickPosService === "express" ? 2.25 : 1.75;
  const quickPosTotal = quickPosWeight ? parseFloat(quickPosWeight) * pricePerPound : 0;

  // Mutation to create real POS transaction
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: { serviceType: string; weight: number; total: number }) => {
      return apiRequest("/api/operator/transactions", {
        method: "POST",
        body: JSON.stringify(transactionData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operator/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/revenue-chart"] });
      toast({ 
        title: "Transaction Created!", 
        description: `${quickPosWeight} lbs @ $${pricePerPound}/lb = ${formatCurrency(quickPosTotal)}` 
      });
      setQuickPosWeight("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Transaction Failed", 
        description: error.message || "Could not create transaction", 
        variant: "destructive" 
      });
    },
  });

  const handleQuickTransaction = () => {
    if (!quickPosWeight || parseFloat(quickPosWeight) <= 0) {
      toast({ title: "Enter weight", description: "Please enter the laundry weight", variant: "destructive" });
      return;
    }
    createTransactionMutation.mutate({
      serviceType: quickPosService,
      weight: parseFloat(quickPosWeight),
      total: quickPosTotal,
    });
  };

  return (
    <OperatorLayout locationName="My Laundromat" title="Command Center">
      <Helmet>
        <title>Command Center | WashBizHub Operator OS</title>
        <meta name="description" content="Your complete laundromat operating system - POS, CLEANBI, Website, Service, Courses, Calculators, and more in one unified command center." />
      </Helmet>

      <div className="h-full bg-muted/30 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* Command Center Header with Hero Background */}
          <div className="relative rounded-xl overflow-hidden mb-2">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/90 via-[#0A1628]/75 to-[#0A1628]/50" />
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3" data-testid="text-dashboard-title">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#C8A661] to-[#A8893F] flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    Command Center
                  </h1>
                  <p className="text-white/80 mt-1">
                    Everything you need to run your laundromat - one screen, total control
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1.5 border-green-400/50 text-green-400 bg-green-500/10">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Live
                  </Badge>
                  <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" data-testid="button-refresh-dashboard">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1 bg-muted/50">
              <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-overview">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="pos" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-pos">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">POS</span>
              </TabsTrigger>
              <TabsTrigger value="machines" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-machines">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Machines</span>
              </TabsTrigger>
              <TabsTrigger value="service" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-service">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Service</span>
              </TabsTrigger>
              <TabsTrigger value="website" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-website">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Website</span>
              </TabsTrigger>
              <TabsTrigger value="cleanbi" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-cleanbi">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">CLEANBI</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-tools">
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Tools</span>
              </TabsTrigger>
              <TabsTrigger value="learn" className="gap-1.5 text-xs sm:text-sm" data-testid="tab-learn">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Academy</span>
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="container-kpi-row">
            <KPICard
              value={todayRevenue}
              label="Today's Revenue"
              icon={DollarSign}
              variant="gold"
              prefix="$"
              trend={{ value: 12.5, direction: "up", label: "vs yesterday" }}
            />
            <KPICard
              value={`${activeMachines}/${totalMachines}`}
              label="Active Machines"
              icon={Activity}
              variant="success"
              formatValue={false}
              subtitle={`${Math.round((activeMachines / totalMachines) * 100)}% utilization`}
            />
            <KPICard
              value={pendingDeliveries}
              label="Pending Deliveries"
              icon={Truck}
              variant="default"
              trend={{ value: -2, direction: "down", label: "from morning" }}
            />
            <KPICard
              value={openTickets}
              label="Open Tickets"
              icon={Wrench}
              variant={openTickets > 5 ? "danger" : "warning"}
            />
            <KPICard
              value={loyaltyMembers}
              label="Loyalty Members"
              icon={Users}
              variant="default"
              trend={{ value: 3.2, direction: "up", label: "this month" }}
            />
            <KPICard
              value={lowStockItems}
              label="Low Stock Items"
              icon={Package}
              variant={lowStockItems > 3 ? "warning" : "default"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 bg-card border shadow-sm" data-testid="card-revenue-chart">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(currentTotal)} total
                    <span className={revenueTrend >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                      {revenueTrend >= 0 ? "+" : ""}{revenueTrend.toFixed(1)}%
                    </span>
                  </p>
                </div>
                <Select value={revenuePeriod} onValueChange={(v) => setRevenuePeriod(v as typeof revenuePeriod)}>
                  <SelectTrigger className="w-28" data-testid="select-revenue-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C8A661" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C8A661" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [formatCurrency(value), ""]}
                      />
                      <Area type="monotone" dataKey="previous" stroke="#9CA3AF" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Previous" />
                      <Area type="monotone" dataKey="current" stroke="#C8A661" strokeWidth={2} fill="url(#currentGradient)" name="Current" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-card border shadow-sm" data-testid="card-revenue-breakdown">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByServiceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {revenueByServiceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {revenueByServiceData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border shadow-sm" data-testid="card-machine-status">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#C8A661]" />
                  Machine Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={machineStatusData}
                  size={140}
                  centerValue={totalMachines}
                  centerLabel="Total"
                />
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-turns-per-day">4.2</div>
                    <div className="text-xs text-muted-foreground">Turns/Day</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-avg-cycle-time">32m</div>
                    <div className="text-xs text-muted-foreground">Avg Cycle</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm" data-testid="card-quick-actions">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#C8A661]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {quickActions.map((action) => (
                    <Link key={action.id} href={action.href}>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12 hover-elevate"
                        data-testid={`button-action-${action.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${action.color} flex items-center justify-center`}>
                            <action.icon className="h-4 w-4 text-white" />
                          </div>
                          <span>{action.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm" data-testid="card-todays-schedule">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#C8A661]" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-3">
                    {mockSchedule.map((item) => {
                      const style = getScheduleStyle(item.type);
                      return (
                        <div
                          key={item.id}
                          className={`border-l-4 rounded-r-lg p-3 ${style.color}`}
                          data-testid={`schedule-item-${item.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{item.time}</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.driver || item.tech || item.staff}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border shadow-sm" data-testid="card-activity-feed">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#C8A661]" />
                  Activity Feed
                </CardTitle>
                <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {mockActivityFeed.map((activity) => {
                  const { icon: Icon, color } = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      data-testid={`activity-item-${activity.id}`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

            </TabsContent>

            {/* POS TAB */}
            <TabsContent value="pos" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Quick Transaction */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-[#C8A661]" />
                      Quick Transaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={quickPosService} onValueChange={setQuickPosService}>
                      <SelectTrigger data-testid="select-pos-service">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wash_fold">Wash & Fold ($1.75/lb)</SelectItem>
                        <SelectItem value="dry_clean">Dry Cleaning</SelectItem>
                        <SelectItem value="express">Express ($2.25/lb)</SelectItem>
                        <SelectItem value="pickup">Pickup & Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                    <div>
                      <label className="text-sm text-muted-foreground">Weight (lbs)</label>
                      <Input
                        type="number"
                        placeholder="Enter weight"
                        value={quickPosWeight}
                        onChange={(e) => setQuickPosWeight(e.target.value)}
                        data-testid="input-pos-weight"
                      />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-[#C8A661]">{formatCurrency(quickPosTotal)}</div>
                      <div className="text-sm text-muted-foreground">Estimated Total</div>
                    </div>
                    <Button className="w-full" onClick={handleQuickTransaction} data-testid="button-create-transaction">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Create Transaction
                    </Button>
                    <Link href="/pos-suite">
                      <Button variant="outline" className="w-full" data-testid="button-full-pos">
                        Open Full POS Suite
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Order Queue */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-[#C8A661]" />
                        Order Queue
                      </span>
                      <Badge variant="outline">{mockPendingOrders.length} Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPendingOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-sm font-medium">{order.id}</div>
                            <div>
                              <div className="font-medium text-sm">{order.customer}</div>
                              <div className="text-xs text-muted-foreground">{order.type} - {order.weight}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                            <span className="text-sm text-muted-foreground">{order.eta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* MACHINES TAB */}
            <TabsContent value="machines" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-[#C8A661]" />
                      Machine Status Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart data={machineStatusData} size={160} centerValue={totalMachines} centerLabel="Total" />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {machineStatusData.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.label}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/iot-dashboard" className="w-full">
                      <Button variant="outline" className="w-full">
                        Full IoT Dashboard
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Machine Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockServiceTickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{ticket.machine}</div>
                            <div className="text-sm text-muted-foreground">{ticket.issue}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                            <Button size="sm" variant="outline" onClick={() => setActiveTab("service")}>Fix</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SERVICE GUY AI TAB */}
            <TabsContent value="service" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-500" />
                      Service Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockServiceTickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Wrench className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium">{ticket.machine}</div>
                              <div className="text-sm text-muted-foreground">{ticket.issue}</div>
                              <div className="text-xs text-muted-foreground mt-1">Ticket: {ticket.id}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                            <Badge className={getTicketStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/service-guy-ai" className="w-full">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Open Service Guy AI
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Diagnosis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Describe the machine issue and our AI will help diagnose and provide repair guidance.
                    </p>
                    <Input placeholder="e.g., Washer not spinning" data-testid="input-service-issue" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select machine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="washer-7">Washer #7</SelectItem>
                        <SelectItem value="dryer-3">Dryer #3</SelectItem>
                        <SelectItem value="changer-1">Changer #1</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full" variant="outline">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Diagnosis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* WEBSITE TAB */}
            <TabsContent value="website" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Your Website
                      </span>
                      <Badge className="bg-green-100 text-green-700">{mockWebsiteStats.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold">{mockWebsiteStats.visitors}</div>
                        <div className="text-sm text-muted-foreground">Visitors Today</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold">{mockWebsiteStats.pageViews}</div>
                        <div className="text-sm text-muted-foreground">Page Views</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold">{mockWebsiteStats.conversionRate}%</div>
                        <div className="text-sm text-muted-foreground">Conversion</div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold">{mockWebsiteStats.topPage}</div>
                        <div className="text-sm text-muted-foreground">Top Page</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Link href="/website-builder">
                      <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Website
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Website Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Switch to a new look with our professional templates.</p>
                    <Link href="/website-builder">
                      <Button variant="outline" className="w-full">
                        Browse Templates
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/marketing-loyalty">
                      <Button variant="outline" className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Send Promotion
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CLEANBI TAB */}
            <TabsContent value="cleanbi" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#C8A661]" />
                      CLEANBI Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-6xl font-bold ${getGradeColor(mockCleanbiData.grade)}`}>
                      {mockCleanbiData.grade}
                    </div>
                    <div className="text-3xl font-semibold mt-2">{mockCleanbiData.overallScore}/100</div>
                    <p className="text-sm text-muted-foreground mt-2">Your location's investment potential</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/cleanbi-explorer" className="w-full">
                      <Button className="w-full bg-gradient-to-r from-[#0A1628] to-[#1a2d4a]">
                        Full CLEANBI Analysis
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCleanbiData.factors.map((factor) => (
                        <div key={factor.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{factor.name} ({factor.weight}%)</span>
                            <span className="font-medium">{factor.score}/100</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#C8A661] to-[#D4B87A]"
                              style={{ width: `${factor.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TOOLS TAB */}
            <TabsContent value="tools" className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { name: "Valuation Calculator", icon: DollarSign, href: "/calculators/valuation", color: "bg-green-600" },
                  { name: "ROI Calculator", icon: TrendingUp, href: "/calculators/roi", color: "bg-blue-600" },
                  { name: "Loan Calculator", icon: CreditCard, href: "/calculators/loan", color: "bg-purple-600" },
                  { name: "Expense Tracker", icon: Receipt, href: "/calculators/expense", color: "bg-amber-600" },
                  { name: "Break-Even Analysis", icon: Scale, href: "/calculators/breakeven", color: "bg-pink-600" },
                  { name: "Cap Rate Calculator", icon: BarChart3, href: "/calculators/caprate", color: "bg-cyan-600" },
                  { name: "QR Code Generator", icon: Target, href: "/advanced-qr-generator", color: "bg-indigo-600" },
                  { name: "Design Studio", icon: Building2, href: "/design-studio", color: "bg-orange-600" },
                ].map((tool) => (
                  <Link key={tool.name} href={tool.href}>
                    <Card className="hover-elevate cursor-pointer h-full">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className={`h-12 w-12 rounded-xl ${tool.color} flex items-center justify-center mb-3`}>
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium">{tool.name}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>

            {/* ACADEMY TAB */}
            <TabsContent value="learn" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#C8A661]" />
                      WashBizHub Academy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { title: "Laundromat Buying 101", progress: 75, lessons: 12 },
                        { title: "Operations Mastery", progress: 30, lessons: 8 },
                        { title: "Marketing & Growth", progress: 0, lessons: 10 },
                        { title: "Financial Management", progress: 50, lessons: 6 },
                      ].map((course) => (
                        <div key={course.title} className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">{course.title}</div>
                          <div className="text-xs text-muted-foreground mb-2">{course.lessons} lessons</div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-[#C8A661]" style={{ width: `${course.progress}%` }} />
                          </div>
                          <div className="text-xs text-right mt-1 text-muted-foreground">{course.progress}% complete</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/academy">
                      <Button>
                        Continue Learning
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold">73K+</div>
                      <div className="text-sm text-muted-foreground">Community Members</div>
                    </div>
                    <Link href="/community">
                      <Button variant="outline" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Join Discussions
                      </Button>
                    </Link>
                    <Link href="/marketplace">
                      <Button variant="outline" className="w-full">
                        <Building2 className="h-4 w-4 mr-2" />
                        Browse Marketplace
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </OperatorLayout>
  );
}
