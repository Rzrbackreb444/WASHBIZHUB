import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DashboardShell,
  DashboardGrid,
  DashboardSection,
  KPICard,
  KPIGroup,
  ChartCard,
  DateRange,
  DashboardNav,
} from "@/components/dashboard";
import {
  Users, ShoppingBag, MessageSquare, BookOpen, FileText, Building2,
  Bot, MapPin, Mail, Globe, TrendingUp, DollarSign, Activity,
  LogOut, RefreshCw, Calendar, Eye, Clock,
  Zap, BarChart3, Settings, Tag, CreditCard,
  UserPlus, ShoppingCart, Search, ChevronRight
} from "lucide-react";
import { subDays, startOfDay, endOfDay } from "date-fns";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardStats {
  users: { total: number; newThisMonth: number; proUsers: number };
  listings: { total: number; active: number };
  forum: { totalTopics: number; totalReplies: number; topicsThisWeek: number };
  courses: { total: number; enrollments: number };
  content: { blogPosts: number; publishedBlogs: number };
  vendors: { total: number };
  aiAgents: { total: number };
  cleanbi: { totalScans: number };
  newsletter: { subscribers: number };
  tenants: { total: number };
}

const COLORS = {
  navy: "#0A1628",
  gold: "#C8A661",
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  pink: "#EC4899",
};

const subscriptionData = [
  { name: "Free", value: 1250, color: "#64748B" },
  { name: "Starter", value: 340, color: "#3B82F6" },
  { name: "Pro", value: 185, color: "#C8A661" },
  { name: "Enterprise", value: 45, color: "#0A1628" },
];

const revenueData = [
  { month: "Jul", revenue: 12400 },
  { month: "Aug", revenue: 15200 },
  { month: "Sep", revenue: 18900 },
  { month: "Oct", revenue: 22400 },
  { month: "Nov", revenue: 28600 },
  { month: "Dec", revenue: 34200 },
];

const userGrowthData = [
  { month: "Jul", users: 820, subscribers: 120 },
  { month: "Aug", users: 1050, subscribers: 180 },
  { month: "Sep", users: 1320, subscribers: 245 },
  { month: "Oct", users: 1580, subscribers: 320 },
  { month: "Nov", users: 1820, subscribers: 420 },
  { month: "Dec", users: 2100, subscribers: 570 },
];

const topCleanbiLocations = [
  { address: "123 Main St, Los Angeles, CA", analyses: 847, score: 92 },
  { address: "456 Oak Ave, New York, NY", analyses: 623, score: 88 },
  { address: "789 Pine Blvd, Chicago, IL", analyses: 512, score: 85 },
  { address: "321 Elm St, Houston, TX", analyses: 489, score: 79 },
  { address: "654 Maple Dr, Phoenix, AZ", analyses: 378, score: 91 },
];

const recentActivity = [
  { type: "registration", user: "John Smith", email: "john@example.com", time: "5 min ago" },
  { type: "purchase", user: "Sarah Johnson", plan: "Pro Monthly", amount: "$49", time: "12 min ago" },
  { type: "analysis", user: "Mike Davis", address: "123 Oak St, Miami", time: "18 min ago" },
  { type: "registration", user: "Emily Brown", email: "emily@example.com", time: "25 min ago" },
  { type: "purchase", user: "James Wilson", plan: "Starter Annual", amount: "$199", time: "32 min ago" },
  { type: "analysis", user: "Lisa Anderson", address: "456 Pine Ave, Seattle", time: "45 min ago" },
];

const adminNavItems = [
  { id: "overview", label: "Overview", href: "/admin-dashboard", icon: BarChart3 },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "subscriptions", label: "Subscriptions", href: "/admin/analytics", icon: CreditCard },
  { id: "content", label: "Content", href: "/admin/blog", icon: FileText },
  { id: "marketplace", label: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
];

function DataTable({ title, data, columns, emptyMessage = "No data available" }: {
  title: string;
  data: any[];
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  emptyMessage?: string;
}) {
  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {data.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30">
                    {columns.map((col) => (
                      <td key={col.key} className="py-2 px-2 text-sm text-foreground">
                        {col.render ? col.render(item) : item[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ActivityFeed() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration": return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "purchase": return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "analysis": return <Search className="h-4 w-4 text-[#C8A661]" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityMessage = (activity: typeof recentActivity[0]) => {
    switch (activity.type) {
      case "registration":
        return <><span className="font-medium">{activity.user}</span> registered with {activity.email}</>;
      case "purchase":
        return <><span className="font-medium">{activity.user}</span> purchased {activity.plan} for {activity.amount}</>;
      case "analysis":
        return <><span className="font-medium">{activity.user}</span> analyzed {activity.address}</>;
      default:
        return activity.user;
    }
  };

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
        <Badge variant="secondary" className="text-xs">Live</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {getActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { label: "View All Users", icon: Users, href: "/admin/users", color: "bg-blue-500" },
    { label: "Manage Subscriptions", icon: CreditCard, href: "/admin/analytics", color: "bg-green-500" },
    { label: "Promo Codes", icon: Tag, href: "/admin/promo-codes", color: "bg-purple-500" },
    { label: "System Settings", icon: Settings, href: "/admin/settings", color: "bg-[#0A1628]" },
  ];

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, idx) => (
            <Link key={idx} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted/50"
                data-testid={`button-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
    preset: "30d",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setLocation("/admin/login");
        return;
      }

      try {
        const response = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminToken");
          setLocation("/admin/login");
        }
      } catch {
        setLocation("/admin/login");
      }
    };
    checkAuth();
  }, [setLocation]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  });

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats", { headers: getAuthHeaders(), credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/users", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: recentListings = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-listings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/recent-listings", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: recentForum = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-forum"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/recent-forum", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: recentBlogs = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-blogs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/recent-blogs", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/tenants"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/tenants", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" +
      `Total Users,${stats?.users.total || 0}\n` +
      `Pro Subscribers,${stats?.users.proUsers || 0}\n` +
      `Active Listings,${stats?.listings.active || 0}\n` +
      `CLEANBI Scans,${stats?.cleanbi.totalScans || 0}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "admin_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  const totalRevenue = 34200;
  const revenueGrowth = 19.6;

  return (
    <DashboardShell
      title="Admin Analytics"
      subtitle="WashBizHub Command Center"
      breadcrumbs={[
        { label: "Admin", href: "/admin-dashboard" },
        { label: "Analytics" },
      ]}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      showDatePicker={true}
      showExportButtons={true}
      onExportCSV={handleExportCSV}
      onExportPDF={handleExportPDF}
      headerActions={
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetchStats()}
            className="text-white hover:bg-white/10"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <DashboardNav items={adminNavItems} variant="tabs" />

        <DashboardSection title="Key Performance Indicators">
          <KPIGroup>
            <KPICard
              label="Total Revenue"
              value={totalRevenue}
              prefix="$"
              icon={DollarSign}
              variant="gold"
              trend={{ value: revenueGrowth, direction: "up", label: "vs last month" }}
            />
            <KPICard
              label="Active Subscribers"
              value={stats?.users.proUsers || 570}
              icon={Zap}
              variant="success"
              trend={{ value: 12.3, direction: "up", label: "vs last month" }}
            />
            <KPICard
              label="Total Users"
              value={stats?.users.total || 2100}
              icon={Users}
              variant="default"
              trend={{ value: 15.4, direction: "up", label: "vs last month" }}
            />
            <KPICard
              label="CLEANBI Analyses"
              value={stats?.cleanbi.totalScans || 3847}
              icon={MapPin}
              variant="gold"
              trend={{ value: 28.7, direction: "up", label: "this month" }}
            />
          </KPIGroup>
        </DashboardSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Revenue Over Time"
            subtitle="Monthly revenue trend"
            onRefresh={() => refetchStats()}
            isLoading={statsLoading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.gold}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="User Growth"
            subtitle="Users and subscribers over time"
            onRefresh={() => refetchStats()}
            isLoading={statsLoading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={COLORS.navy}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Total Users"
                />
                <Line
                  type="monotone"
                  dataKey="subscribers"
                  stroke={COLORS.gold}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Subscribers"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Subscription Distribution"
            subtitle="Users by plan type"
            isLoading={statsLoading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                  formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ActivityFeed />

          <QuickActions />
        </div>

        <DashboardSection title="Top CLEANBI Locations" description="Most analyzed addresses this month">
          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Address</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Analyses</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Avg Score</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCleanbiLocations.map((location, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-[#C8A661]" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{location.address}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground font-medium">{location.analyses.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${location.score >= 85 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {location.score}/100
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-[#C8A661] hover:bg-[#C8A661]/10">
                            View <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection title="Additional Stats">
          <DashboardGrid columns={4}>
            <KPICard
              label="New Users (30d)"
              value={stats?.users.newThisMonth || 280}
              icon={UserPlus}
              size="compact"
              trend={{ value: 23.4, direction: "up" }}
            />
            <KPICard
              label="Forum Topics"
              value={stats?.forum.totalTopics || 156}
              icon={MessageSquare}
              size="compact"
            />
            <KPICard
              label="Active Listings"
              value={stats?.listings.active || 89}
              icon={ShoppingBag}
              size="compact"
            />
            <KPICard
              label="Newsletter Subs"
              value={stats?.newsletter.subscribers || 4250}
              icon={Mail}
              size="compact"
            />
          </DashboardGrid>
        </DashboardSection>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-muted/50 border">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#0A1628] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-[#0A1628] data-[state=active]:text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="forum" className="data-[state=active]:bg-[#0A1628] data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-[#0A1628] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-[#0A1628] data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Tenants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <DataTable
              title="All Users"
              data={allUsers}
              columns={[
                { key: "email", label: "Email" },
                { key: "firstName", label: "Name", render: (u) => `${u.firstName || ''} ${u.lastName || ''}`.trim() || '-' },
                { key: "subscriptionTier", label: "Tier", render: (u) => (
                  <Badge className={u.isPro ? "bg-[#C8A661]/20 text-[#C8A661]" : "bg-muted text-muted-foreground"}>
                    {u.subscriptionTier || 'free'}
                  </Badge>
                )},
                { key: "cleanbiTier", label: "CLEANBI", render: (u) => (
                  <Badge className="bg-blue-100 text-blue-700">{u.cleanbiTier || 'free'}</Badge>
                )},
                { key: "role", label: "Role" },
                { key: "createdAt", label: "Joined", render: (u) => u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-' },
              ]}
            />
          </TabsContent>

          <TabsContent value="listings">
            <DataTable
              title="Recent Listings"
              data={recentListings}
              columns={[
                { key: "title", label: "Title" },
                { key: "businessType", label: "Type", render: (l) => (
                  <Badge className="bg-green-100 text-green-700">{l.businessType}</Badge>
                )},
                { key: "status", label: "Status", render: (l) => (
                  <Badge className={l.status === 'active' ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>
                    {l.status}
                  </Badge>
                )},
                { key: "priceInUSD", label: "Price", render: (l) => l.priceInUSD ? `$${Number(l.priceInUSD).toLocaleString()}` : '-' },
                { key: "location", label: "Location", render: (l) => `${l.city || ''}, ${l.region || ''}`.trim() || '-' },
                { key: "createdAt", label: "Created", render: (l) => l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '-' },
              ]}
            />
          </TabsContent>

          <TabsContent value="forum">
            <DataTable
              title="Recent Forum Topics"
              data={recentForum}
              columns={[
                { key: "title", label: "Title" },
                { key: "views", label: "Views", render: (t) => (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {t.views || 0}
                  </span>
                )},
                { key: "replyCount", label: "Replies", render: (t) => t.replyCount || 0 },
                { key: "createdAt", label: "Created", render: (t) => t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-' },
              ]}
            />
          </TabsContent>

          <TabsContent value="content">
            <DataTable
              title="Recent Blog Posts"
              data={recentBlogs}
              columns={[
                { key: "title", label: "Title" },
                { key: "category", label: "Category", render: (b) => (
                  <Badge className="bg-purple-100 text-purple-700">{b.category}</Badge>
                )},
                { key: "type", label: "Type", render: (b) => (
                  <Badge className="bg-blue-100 text-blue-700">{b.type}</Badge>
                )},
                { key: "status", label: "Status", render: (b) => (
                  <Badge className={b.status === 'published' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                    {b.status}
                  </Badge>
                )},
                { key: "createdAt", label: "Created", render: (b) => b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '-' },
              ]}
            />
          </TabsContent>

          <TabsContent value="tenants">
            <DataTable
              title="Platform Tenants"
              data={tenants}
              columns={[
                { key: "name", label: "Name" },
                { key: "domain", label: "Domain", render: (t) => (
                  <span className="text-[#C8A661]">{t.domain}</span>
                )},
                { key: "slug", label: "Slug" },
                { key: "isActive", label: "Status", render: (t) => (
                  <Badge className={t.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                )},
                { key: "createdAt", label: "Created", render: (t) => t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-' },
              ]}
            />
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            WashBizHub Admin Dashboard - Data refreshes every 30 seconds
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <Clock className="w-3 h-3 inline mr-1" />
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
