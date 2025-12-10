import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KPICard } from "@/components/dashboard/KPICard";
import { DonutChart, SectionHeader } from "@/components/dashboard/DashboardComponents";
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

const mockRevenueData = {
  daily: [
    { name: "Mon", current: 1240, previous: 980 },
    { name: "Tue", current: 1380, previous: 1120 },
    { name: "Wed", current: 1520, previous: 1340 },
    { name: "Thu", current: 1290, previous: 1180 },
    { name: "Fri", current: 1650, previous: 1420 },
    { name: "Sat", current: 2100, previous: 1890 },
    { name: "Sun", current: 1980, previous: 1720 },
  ],
  weekly: [
    { name: "Week 1", current: 9200, previous: 8400 },
    { name: "Week 2", current: 10500, previous: 9100 },
    { name: "Week 3", current: 8800, previous: 9500 },
    { name: "Week 4", current: 11200, previous: 10200 },
  ],
  monthly: [
    { name: "Jul", current: 38500, previous: 35200 },
    { name: "Aug", current: 42100, previous: 38900 },
    { name: "Sep", current: 39800, previous: 41200 },
    { name: "Oct", current: 45600, previous: 42800 },
    { name: "Nov", current: 48200, previous: 44100 },
    { name: "Dec", current: 52400, previous: 47300 },
  ],
};

const revenueByServiceData = [
  { name: "Self-Service", value: 45, color: "#0A1628" },
  { name: "Wash & Fold", value: 30, color: "#C8A661" },
  { name: "Pickup & Delivery", value: 15, color: "#3B82F6" },
  { name: "Dry Cleaning", value: 10, color: "#10B981" },
];

const machineStatusData = [
  { label: "Running", value: 12, color: "#10B981" },
  { label: "Available", value: 8, color: "#3B82F6" },
  { label: "Error", value: 2, color: "#EF4444" },
  { label: "Offline", value: 3, color: "#6B7280" },
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

export default function OperatorDashboard() {
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const { data: kpiData } = useQuery({
    queryKey: ["/api/operator-dashboard/kpis"],
    staleTime: 30000,
  });

  const todayRevenue = kpiData?.todayRevenue ?? 2847.50;
  const activeMachines = kpiData?.activeMachines ?? 20;
  const totalMachines = kpiData?.totalMachines ?? 25;
  const pendingDeliveries = kpiData?.pendingDeliveries ?? 8;
  const openTickets = kpiData?.openTickets ?? 3;
  const loyaltyMembers = kpiData?.loyaltyMembers ?? 1247;
  const lowStockItems = kpiData?.lowStockItems ?? 5;

  const revenueData = mockRevenueData[revenuePeriod];
  const currentTotal = revenueData.reduce((sum, d) => sum + d.current, 0);
  const previousTotal = revenueData.reduce((sum, d) => sum + d.previous, 0);
  const revenueTrend = ((currentTotal - previousTotal) / previousTotal) * 100;

  return (
    <>
      <Helmet>
        <title>Operator Dashboard | WashBizHub Command Center</title>
        <meta name="description" content="Unified operator dashboard for managing all WashBizHub modules - POS, IoT, Routes, Service, Marketing, and Inventory." />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                Operator Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Your unified command center for all operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 border-green-500/50 text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </Badge>
              <Button variant="outline" size="sm" data-testid="button-refresh-dashboard">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="container-module-links">
            <Link href="/pos-suite">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-2">
                    <ShoppingCart className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <span className="text-sm font-medium">POS Suite</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/iot-dashboard">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-2">
                    <Activity className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <span className="text-sm font-medium">IoT Dashboard</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/route-optimization">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-2">
                    <Truck className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <span className="text-sm font-medium">Routes</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/service-guy-ai">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-2">
                    <Wrench className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <span className="text-sm font-medium">Service Guy</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/marketing-loyalty">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <span className="text-sm font-medium">Marketing</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/parts-inventory">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-2">
                    <Package className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <span className="text-sm font-medium">Inventory</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
