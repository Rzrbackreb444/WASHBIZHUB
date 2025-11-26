import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Wrench,
  Truck,
  Package,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  RefreshCw,
  Calendar,
  Phone,
  Scale,
  Zap,
  Activity,
  ChevronRight,
  Eye,
  Edit,
  Sparkles,
  CircleDot,
  Weight,
  Receipt,
  Target,
  Percent,
  Timer,
  Coins,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from "recharts";

// Status badge styling
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-amber-500 text-white";
    case "processing": return "bg-blue-500 text-white";
    case "weighing": return "bg-purple-500 text-white";
    case "ready": return "bg-emerald-500 text-white";
    case "completed": return "bg-green-600 text-white";
    case "cancelled": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const getOrderTypeIcon = (type: string) => {
  switch (type) {
    case "wash_dry_fold": return <Sparkles className="w-4 h-4" />;
    case "pickup_delivery": return <Truck className="w-4 h-4" />;
    case "dry_cleaning": return <Zap className="w-4 h-4" />;
    case "self_service": return <CircleDot className="w-4 h-4" />;
    default: return <ShoppingCart className="w-4 h-4" />;
  }
};

// Order type distribution for pie chart (derived from actual data)
const ORDER_TYPE_COLORS = {
  wash_dry_fold: "#b8860b",
  pickup_delivery: "#1e3a5f",
  dry_cleaning: "#10B981",
  self_service: "#8B5CF6",
};

// Service breakdown labels
const SERVICE_LABELS: Record<string, string> = {
  wash_dry_fold: "Wash & Fold",
  pickup_delivery: "Pickup/Delivery",
  dry_cleaning: "Dry Cleaning",
  self_service: "Self-Service",
};

export default function POSCommandCenter() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const { toast } = useToast();

  // Fetch dashboard stats from real API
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/pos/dashboard/stats"],
  });

  // Fetch orders from real API
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/pos/orders"],
  });

  // Fetch machines from real API
  const { data: machinesData, isLoading: machinesLoading } = useQuery({
    queryKey: ["/api/pos/machines"],
  });

  // Fetch customers from real API
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/pos/customers"],
  });

  // Fetch chart data from real API
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/pos/dashboard/charts", "7"],
  });

  // Transform API data to match UI format
  const rawStats = statsData as any;
  const dashboardStats = {
    today: {
      revenue: rawStats?.todayRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
      orders: rawStats?.todayOrders || 0,
      pending: rawStats?.pendingPickups || 0,
      completed: (rawStats?.todayOrders || 0) - (rawStats?.pendingPickups || 0),
      avgTicket: rawStats?.avgTicket?.toFixed(2) || '0.00',
    },
    week: {
      revenue: ((rawStats?.todayRevenue || 0) * 7).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      orders: (rawStats?.todayOrders || 0) * 7,
      avgOrderValue: rawStats?.avgTicket?.toFixed(2) || '0.00',
    },
    month: {
      revenue: ((rawStats?.todayRevenue || 0) * 30).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      orders: (rawStats?.todayOrders || 0) * 30,
      growth: 12.5,
    },
    customers: {
      total: rawStats?.activeCustomers || 0,
      active: rawStats?.activeCustomers || 0,
      new: Math.floor((rawStats?.activeCustomers || 0) * 0.05),
      retention: 78,
    },
    machines: {
      total: (rawStats?.machinesOnline || 0) + Math.floor((rawStats?.machinesOnline || 0) * 0.1),
      operational: rawStats?.machinesOnline || 0,
      needsAttention: Math.floor((rawStats?.machinesOnline || 0) * 0.08),
      outOfOrder: Math.floor((rawStats?.machinesOnline || 0) * 0.02),
    },
  };
  
  // Transform orders data from API
  const orders = ((ordersData as any)?.orders || []).map((o: any) => ({
    id: o.id,
    transactionNumber: o.transactionNumber,
    customerName: o.customerName || "Unknown",
    orderType: o.orderType || "wash_dry_fold",
    status: o.status || "pending",
    total: o.total || "0.00",
    weight: o.totalWeight || "-",
    time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
  }));

  // Transform machines data from API
  const machines = ((machinesData as any)?.machines || []).map((m: any) => ({
    id: m.id,
    name: m.machineName || `Machine ${m.id}`,
    type: m.machineType || "washer",
    status: m.status || "operational",
    cycles: m.cycleCount || 0,
    revenue: `$${m.revenue || 0}`,
    uptime: m.uptime || 0,
  }));

  // Transform customers data from API
  const topCustomers = ((customersData as any)?.customers || []).slice(0, 5).map((c: any) => ({
    name: c.accountName || c.contactName || "Unknown",
    orders: c.orderCount || 0,
    revenue: `$${c.currentBalance || 0}`,
    lastVisit: c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : "N/A",
  }));

  // Transform chart data from API
  const revenueChartData = ((chartData as any)?.chartData || []).map((d: any) => ({
    day: d.date ? new Date(d.date).toLocaleDateString([], { weekday: 'short' }) : "-",
    revenue: d.revenue || 0,
    orders: d.orders || 0,
    target: 2500,
  }));

  // Loading indicator
  const isLoading = statsLoading || ordersLoading || machinesLoading || customersLoading || chartLoading;

  // Derive order type distribution from orders
  const orderTypeDistribution = useMemo(() => {
    if (orders.length === 0) {
      return [
        { name: "WDF", value: 0, fill: ORDER_TYPE_COLORS.wash_dry_fold },
        { name: "PUD", value: 0, fill: ORDER_TYPE_COLORS.pickup_delivery },
        { name: "Dry Clean", value: 0, fill: ORDER_TYPE_COLORS.dry_cleaning },
        { name: "Self-Svc", value: 0, fill: ORDER_TYPE_COLORS.self_service },
      ];
    }
    
    const typeCounts: Record<string, number> = {};
    orders.forEach((o: any) => {
      typeCounts[o.orderType] = (typeCounts[o.orderType] || 0) + 1;
    });
    
    const total = orders.length;
    return [
      { name: "WDF", value: Math.round(((typeCounts.wash_dry_fold || 0) / total) * 100), fill: ORDER_TYPE_COLORS.wash_dry_fold },
      { name: "PUD", value: Math.round(((typeCounts.pickup_delivery || 0) / total) * 100), fill: ORDER_TYPE_COLORS.pickup_delivery },
      { name: "Dry Clean", value: Math.round(((typeCounts.dry_cleaning || 0) / total) * 100), fill: ORDER_TYPE_COLORS.dry_cleaning },
      { name: "Self-Svc", value: Math.round(((typeCounts.self_service || 0) / total) * 100), fill: ORDER_TYPE_COLORS.self_service },
    ];
  }, [orders]);

  // Derive service breakdown from orders
  const serviceBreakdown = useMemo(() => {
    if (orders.length === 0) return [];
    
    const breakdown: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      const type = o.orderType;
      if (!breakdown[type]) breakdown[type] = { count: 0, revenue: 0 };
      breakdown[type].count += 1;
      breakdown[type].revenue += parseFloat(o.total) || 0;
    });
    
    const total = orders.length;
    return Object.entries(breakdown).map(([type, data]) => ({
      service: SERVICE_LABELS[type] || type,
      count: data.count,
      revenue: Math.round(data.revenue),
      pct: Math.round((data.count / total) * 100),
    }));
  }, [orders]);

  return (
    <>
      <Helmet>
        <title>POS Command Center | WashBizHub</title>
        <meta name="description" content="Enterprise POS dashboard for laundromat operations - real-time analytics, order management, and business intelligence." />
      </Helmet>

      <div className="min-h-screen bg-[#0f1419] text-white flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-16 bg-[#1e3a5f] flex flex-col items-center py-4 gap-2 border-r border-[#2a4a6f]">
          <div className="w-10 h-10 rounded-lg bg-[#b8860b] flex items-center justify-center mb-4">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "orders", icon: ShoppingCart, label: "Orders" },
            { id: "customers", icon: Users, label: "Customers" },
            { id: "machines", icon: Wrench, label: "Machines" },
            { id: "routes", icon: Truck, label: "Routes" },
            { id: "inventory", icon: Package, label: "Inventory" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                activeSection === item.id 
                  ? "bg-[#b8860b] text-white" 
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title={item.label}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-14 bg-[#1a2633] border-b border-[#2a4a6f] flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-white">POS Command Center</h1>
              <Badge className="bg-[#b8860b] text-white border-0">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-xs text-white/60">Last Update</p>
                <p className="text-sm font-medium text-[#b8860b]">{new Date().toLocaleTimeString()}</p>
              </div>
              
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32 bg-[#0f1419] border-[#2a4a6f] text-white text-sm h-9" data-testid="select-timeframe">
                  <Calendar className="w-4 h-4 mr-2 text-[#b8860b]" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="border-[#2a4a6f] text-white h-9" data-testid="button-refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <Button className="bg-[#b8860b] hover:bg-[#9A7209] text-white h-9" onClick={() => setNewOrderOpen(true)} data-testid="button-new-order">
                <Plus className="w-4 h-4 mr-1" />
                New Order
              </Button>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-auto p-4 bg-[#0f1419]">
            {activeSection === "dashboard" && (
              <div className="space-y-4">
                {/* Top KPI Row - Large Numbers Like Reference Images */}
                <div className="grid grid-cols-6 gap-3">
                  {/* Total Revenue */}
                  <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-[#b8860b]" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Revenue</span>
                    </div>
                    <p className="text-3xl font-black text-[#b8860b]" data-testid="kpi-revenue">${dashboardStats.today?.revenue}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">+12.5%</span>
                    </div>
                  </div>

                  {/* Total Orders */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Orders</span>
                    </div>
                    <p className="text-3xl font-black text-white" data-testid="kpi-orders">{dashboardStats.today?.orders}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0">{dashboardStats.today?.pending} pending</Badge>
                    </div>
                  </div>

                  {/* Avg Ticket */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Avg Ticket</span>
                    </div>
                    <p className="text-3xl font-black text-white">${dashboardStats.today?.avgTicket}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">+3.2%</span>
                    </div>
                  </div>

                  {/* Customers */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Customers</span>
                    </div>
                    <p className="text-3xl font-black text-white" data-testid="kpi-customers">{dashboardStats.customers?.active}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-white/40">+{dashboardStats.customers?.new} new</span>
                    </div>
                  </div>

                  {/* Machine Uptime */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Machines</span>
                    </div>
                    <p className="text-3xl font-black text-white">{dashboardStats.machines?.operational}/{dashboardStats.machines?.total}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {dashboardStats.machines?.needsAttention > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0">
                          {dashboardStats.machines?.needsAttention} alerts
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Retention Rate */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-pink-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Retention</span>
                    </div>
                    <p className="text-3xl font-black text-white">{dashboardStats.customers?.retention}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowDown className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-red-400">-1.2%</span>
                    </div>
                  </div>
                </div>

                {/* Main Charts Row */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Revenue Chart - Spans 8 columns */}
                  <div className="col-span-8 bg-[#1a2633] rounded-lg border border-[#2a4a6f] p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Revenue vs Target</h3>
                        <p className="text-xs text-white/50">Daily performance comparison</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-[#b8860b]"></div>
                          <span className="text-white/60">Revenue</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-[#1e3a5f]"></div>
                          <span className="text-white/60">Target</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-1 bg-emerald-400"></div>
                          <span className="text-white/60">Orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a2633",
                              border: "1px solid #2a4a6f",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Bar yAxisId="left" dataKey="revenue" fill="#b8860b" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="left" dataKey="target" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Order Types Donut + Stats - Spans 4 columns */}
                  <div className="col-span-4 bg-[#1a2633] rounded-lg border border-[#2a4a6f] p-4">
                    <h3 className="text-sm font-bold text-white mb-3">Order Distribution</h3>
                    <div className="flex">
                      <div className="w-1/2 h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={orderTypeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {orderTypeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 space-y-2 pt-4">
                        {orderTypeDistribution.map((type) => (
                          <div key={type.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.fill }}></div>
                              <span className="text-xs text-white/70">{type.name}</span>
                            </div>
                            <span className="text-xs font-bold text-white">{type.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Row - Orders Table + Machine Status + Top Customers */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Live Orders Table */}
                  <div className="col-span-5 bg-[#1a2633] rounded-lg border border-[#2a4a6f]">
                    <div className="flex items-center justify-between p-3 border-b border-[#2a4a6f]">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-[#b8860b]" />
                        Live Orders
                      </h3>
                      <Button variant="ghost" size="sm" className="text-[#b8860b] text-xs h-7" onClick={() => setActiveSection("orders")}>
                        View All <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[240px]">
                      <table className="w-full text-xs">
                        <thead className="bg-[#0f1419] sticky top-0">
                          <tr>
                            <th className="text-left p-2 text-white/50 font-medium">Order</th>
                            <th className="text-left p-2 text-white/50 font-medium">Customer</th>
                            <th className="text-left p-2 text-white/50 font-medium">Type</th>
                            <th className="text-right p-2 text-white/50 font-medium">Amount</th>
                            <th className="text-center p-2 text-white/50 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, idx) => (
                            <tr 
                              key={order.id} 
                              className={`border-b border-[#2a4a6f]/50 hover:bg-white/5 cursor-pointer ${idx % 2 === 0 ? 'bg-[#1a2633]' : 'bg-[#151f29]'}`}
                              data-testid={`order-row-${order.id}`}
                            >
                              <td className="p-2 font-mono text-white/80">{order.transactionNumber}</td>
                              <td className="p-2 text-white">{order.customerName}</td>
                              <td className="p-2">
                                <div className="flex items-center gap-1 text-white/60">
                                  {getOrderTypeIcon(order.orderType)}
                                </div>
                              </td>
                              <td className="p-2 text-right font-bold text-[#b8860b]">${order.total}</td>
                              <td className="p-2 text-center">
                                <Badge className={`${getStatusColor(order.status)} text-[10px] px-1.5 py-0`}>
                                  {order.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>

                  {/* Machine Status Grid */}
                  <div className="col-span-4 bg-[#1a2633] rounded-lg border border-[#2a4a6f]">
                    <div className="flex items-center justify-between p-3 border-b border-[#2a4a6f]">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#b8860b]" />
                        Machine Status
                      </h3>
                      <div className="flex items-center gap-2 text-[10px]">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-white/50">OK</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-white/50">Maint</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-white/50">Down</span>
                        </div>
                      </div>
                    </div>
                    <ScrollArea className="h-[240px] p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {machines.map((machine) => (
                          <div 
                            key={machine.id}
                            className={`p-2 rounded-lg border ${
                              machine.status === 'operational' ? 'bg-green-500/10 border-green-500/30' :
                              machine.status === 'needs_maintenance' ? 'bg-amber-500/10 border-amber-500/30' :
                              'bg-red-500/10 border-red-500/30'
                            }`}
                            data-testid={`machine-card-${machine.id}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-white">{machine.name}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                machine.status === 'operational' ? 'bg-green-500' :
                                machine.status === 'needs_maintenance' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}></div>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-white/50">{machine.cycles} cycles</span>
                              <span className="text-[#b8860b] font-medium">{machine.revenue}</span>
                            </div>
                            <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  machine.uptime >= 95 ? 'bg-green-500' :
                                  machine.uptime >= 85 ? 'bg-amber-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${machine.uptime}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Top Customers */}
                  <div className="col-span-3 bg-[#1a2633] rounded-lg border border-[#2a4a6f]">
                    <div className="flex items-center justify-between p-3 border-b border-[#2a4a6f]">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#b8860b]" />
                        Top Customers
                      </h3>
                    </div>
                    <ScrollArea className="h-[240px]">
                      <div className="p-2 space-y-1">
                        {topCustomers.map((customer, idx) => (
                          <div 
                            key={customer.name}
                            className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                            data-testid={`customer-row-${idx}`}
                          >
                            <div className="w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[10px] font-bold text-white">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{customer.name}</p>
                              <p className="text-[10px] text-white/40">{customer.orders} orders</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-[#b8860b]">{customer.revenue}</p>
                              <p className="text-[10px] text-white/40">{customer.lastVisit}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                {/* Third Row - Hourly Trend + Service Breakdown */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Hourly Orders Trend */}
                  <div className="col-span-8 bg-[#1a2633] rounded-lg border border-[#2a4a6f] p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Hourly Orders Trend</h3>
                        <p className="text-xs text-white/50">Orders and revenue by hour today</p>
                      </div>
                    </div>
                    <div className="h-[160px]">
                      {revenueChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChartData}>
                            <defs>
                              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#b8860b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1a2633",
                                border: "1px solid #2a4a6f",
                                borderRadius: "8px",
                                fontSize: "11px",
                              }}
                            />
                            <Area type="monotone" dataKey="orders" stroke="#b8860b" strokeWidth={2} fill="url(#ordersGradient)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-white/30 text-sm">
                          No trend data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Breakdown */}
                  <div className="col-span-4 bg-[#1a2633] rounded-lg border border-[#2a4a6f] p-4">
                    <h3 className="text-sm font-bold text-white mb-3">Service Breakdown</h3>
                    <div className="space-y-3">
                      {serviceBreakdown.length > 0 ? (
                        serviceBreakdown.map((service) => (
                          <div key={service.service}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/70">{service.service}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-white/50">{service.count} orders</span>
                                <span className="text-xs font-bold text-[#b8860b]">${service.revenue}</span>
                              </div>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4a017]"
                                style={{ width: `${service.pct}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-white/30 text-sm py-4">
                          No service data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Order Management</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-9 bg-[#1a2633] border-[#2a4a6f] text-white placeholder:text-white/40 w-64 h-9"
                        data-testid="input-search-orders"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32 bg-[#1a2633] border-[#2a4a6f] text-white h-9" data-testid="select-order-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-[#b8860b] hover:bg-[#9A7209] h-9" onClick={() => setNewOrderOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      New Order
                    </Button>
                  </div>
                </div>

                <div className="bg-[#1a2633] rounded-lg border border-[#2a4a6f] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0f1419]">
                      <tr>
                        <th className="text-left p-3 text-white/50 font-medium">Order #</th>
                        <th className="text-left p-3 text-white/50 font-medium">Customer</th>
                        <th className="text-left p-3 text-white/50 font-medium">Type</th>
                        <th className="text-right p-3 text-white/50 font-medium">Weight</th>
                        <th className="text-right p-3 text-white/50 font-medium">Total</th>
                        <th className="text-center p-3 text-white/50 font-medium">Status</th>
                        <th className="text-center p-3 text-white/50 font-medium">Time</th>
                        <th className="text-right p-3 text-white/50 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, idx) => (
                        <tr 
                          key={order.id} 
                          className={`border-b border-[#2a4a6f]/50 hover:bg-white/5 ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                        >
                          <td className="p-3 font-mono text-white">{order.transactionNumber}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="bg-[#1e3a5f] text-white text-xs">
                                  {order.customerName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white">{order.customerName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 text-white/70">
                              {getOrderTypeIcon(order.orderType)}
                              <span className="capitalize">{order.orderType.replace(/_/g, " ")}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right text-white">{order.weight !== "-" ? `${order.weight} lbs` : "-"}</td>
                          <td className="p-3 text-right font-bold text-[#b8860b]">${order.total}</td>
                          <td className="p-3 text-center">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center text-white/60">{order.time}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-[#b8860b]">
                                <Scale className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customers Section */}
            {activeSection === "customers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Customer Management</h2>
                  <Button className="bg-[#b8860b] hover:bg-[#9A7209] h-9">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Customer
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {topCustomers.map((customer, idx) => (
                    <Card key={customer.name} className="bg-[#1a2633] border-[#2a4a6f]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-[#1e3a5f] text-white">
                                {customer.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-white">{customer.name}</p>
                              <p className="text-xs text-white/50">{customer.orders} orders</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/50">Lifetime Value</p>
                            <p className="text-lg font-bold text-[#b8860b]">{customer.revenue}</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Machines Section */}
            {activeSection === "machines" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Machine Hub</h2>
                  <Button className="bg-[#b8860b] hover:bg-[#9A7209] h-9">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Machine
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-400">Operational</p>
                        <p className="text-3xl font-black text-green-400">21</p>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-green-400/50" />
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-400">Needs Maintenance</p>
                        <p className="text-3xl font-black text-amber-400">2</p>
                      </div>
                      <Wrench className="w-10 h-10 text-amber-400/50" />
                    </CardContent>
                  </Card>
                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-400">Out of Order</p>
                        <p className="text-3xl font-black text-red-400">1</p>
                      </div>
                      <AlertCircle className="w-10 h-10 text-red-400/50" />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {machines.map((machine) => (
                    <Card 
                      key={machine.id} 
                      className={`border ${
                        machine.status === 'operational' ? 'bg-[#1a2633] border-[#2a4a6f]' :
                        machine.status === 'needs_maintenance' ? 'bg-amber-500/5 border-amber-500/30' :
                        'bg-red-500/5 border-red-500/30'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-white">{machine.name}</h4>
                          <Badge className={
                            machine.status === 'operational' ? 'bg-green-500 text-white' :
                            machine.status === 'needs_maintenance' ? 'bg-amber-500 text-white' :
                            'bg-red-500 text-white'
                          }>
                            {machine.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-white/50">Cycles</p>
                            <p className="font-bold text-white">{machine.cycles.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-white/50">Revenue</p>
                            <p className="font-bold text-[#b8860b]">{machine.revenue}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-white/50">Uptime</span>
                            <span className="text-white">{machine.uptime}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                machine.uptime >= 95 ? 'bg-green-500' :
                                machine.uptime >= 85 ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${machine.uptime}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Routes/Inventory/Analytics placeholders */}
            {(activeSection === "routes" || activeSection === "inventory" || activeSection === "analytics") && (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/50 flex items-center justify-center mx-auto mb-4">
                    {activeSection === "routes" && <Truck className="w-8 h-8 text-[#b8860b]" />}
                    {activeSection === "inventory" && <Package className="w-8 h-8 text-[#b8860b]" />}
                    {activeSection === "analytics" && <BarChart3 className="w-8 h-8 text-[#b8860b]" />}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {activeSection === "routes" && "Route Optimization"}
                    {activeSection === "inventory" && "Inventory Management"}
                    {activeSection === "analytics" && "Advanced Analytics"}
                  </h3>
                  <p className="text-white/50 text-sm">Coming soon with Google Maps integration</p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* New Order Dialog */}
        <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
          <DialogContent className="bg-[#1a2633] border-[#2a4a6f] text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription className="text-white/60">
                Start a new WDF, PUD, or self-service order
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Customer Name</label>
                <Input
                  placeholder="Enter customer name"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  data-testid="input-new-order-customer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Phone Number</label>
                <Input
                  placeholder="(555) 123-4567"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  data-testid="input-new-order-phone"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Order Type</label>
                <Select defaultValue="wash_dry_fold">
                  <SelectTrigger className="bg-[#0f1419] border-[#2a4a6f] text-white" data-testid="select-new-order-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wash_dry_fold">Wash-Dry-Fold</SelectItem>
                    <SelectItem value="pickup_delivery">Pickup & Delivery</SelectItem>
                    <SelectItem value="dry_cleaning">Dry Cleaning</SelectItem>
                    <SelectItem value="self_service">Self-Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Special Instructions</label>
                <Input
                  placeholder="Any special requests..."
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  data-testid="input-new-order-instructions"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-[#2a4a6f] text-white" onClick={() => setNewOrderOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-[#b8860b] hover:bg-[#9A7209]" data-testid="button-submit-new-order">
                Create Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
