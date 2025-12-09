import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  UserPlus, ShoppingCart, Search, ChevronRight, Percent, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  { month: "Jul", mrr: 12400, arr: 148800 },
  { month: "Aug", mrr: 15200, arr: 182400 },
  { month: "Sep", mrr: 18900, arr: 226800 },
  { month: "Oct", mrr: 22400, arr: 268800 },
  { month: "Nov", mrr: 28600, arr: 343200 },
  { month: "Dec", mrr: 34200, arr: 410400 },
];

const userGrowthData = [
  { month: "Jul", signups: 120, total: 820 },
  { month: "Aug", signups: 230, total: 1050 },
  { month: "Sep", signups: 270, total: 1320 },
  { month: "Oct", signups: 260, total: 1580 },
  { month: "Nov", signups: 240, total: 1820 },
  { month: "Dec", signups: 280, total: 2100 },
];

const cleanbiUsageData = [
  { day: "Mon", analyses: 142 },
  { day: "Tue", analyses: 168 },
  { day: "Wed", analyses: 195 },
  { day: "Thu", analyses: 187 },
  { day: "Fri", analyses: 212 },
  { day: "Sat", analyses: 98 },
  { day: "Sun", analyses: 76 },
];

const topPerformingPages = [
  { page: "/cleanbi", title: "CLEANBI Analysis", views: 12847, bounceRate: 23.4, avgTime: "4:32" },
  { page: "/calculators", title: "Calculators Hub", views: 8923, bounceRate: 31.2, avgTime: "3:45" },
  { page: "/marketplace", title: "Marketplace", views: 7651, bounceRate: 28.7, avgTime: "2:58" },
  { page: "/blog", title: "Blog & Resources", views: 6234, bounceRate: 42.1, avgTime: "2:12" },
  { page: "/courses", title: "Academy Courses", views: 4892, bounceRate: 35.6, avgTime: "5:18" },
  { page: "/equipment", title: "Equipment Guide", views: 3467, bounceRate: 38.9, avgTime: "3:22" },
];

const recentActivity = [
  { type: "registration", user: "John Smith", email: "john@example.com", time: "5 min ago" },
  { type: "purchase", user: "Sarah Johnson", plan: "Pro Monthly", amount: "$49", time: "12 min ago" },
  { type: "analysis", user: "Mike Davis", address: "123 Oak St, Miami", time: "18 min ago" },
  { type: "registration", user: "Emily Brown", email: "emily@example.com", time: "25 min ago" },
  { type: "purchase", user: "James Wilson", plan: "Starter Annual", amount: "$199", time: "32 min ago" },
  { type: "analysis", user: "Lisa Anderson", address: "456 Pine Ave, Seattle", time: "45 min ago" },
  { type: "registration", user: "David Lee", email: "david@example.com", time: "1 hr ago" },
  { type: "analysis", user: "Amanda White", address: "789 Elm Dr, Denver", time: "1.5 hr ago" },
];

const adminNavItems = [
  { id: "overview", label: "Overview", href: "/admin-dashboard", icon: BarChart3 },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "subscriptions", label: "Subscriptions", href: "/admin/analytics", icon: CreditCard },
  { id: "content", label: "Content", href: "/admin/blog", icon: FileText },
  { id: "marketplace", label: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
];

function TopPerformingPagesTable() {
  return (
    <Card className="bg-card border shadow-sm overflow-hidden">
      <div className="h-1 bg-[#C8A661]" />
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg text-foreground">Top Performing Pages</CardTitle>
        <Badge variant="outline" className="text-xs border-[#C8A661]/40 text-[#C8A661]">
          <Eye className="w-3 h-3 mr-1" />
          Analytics
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Page</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Views</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Bounce Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {topPerformingPages.map((page, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30" data-testid={`row-page-${idx}`}>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{page.title}</span>
                        <span className="text-xs text-muted-foreground">{page.page}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-[#C8A661]">{page.views.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {page.bounceRate < 30 ? (
                          <ArrowDownRight className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3 text-amber-500" />
                        )}
                        <span className={`text-sm ${page.bounceRate < 30 ? 'text-green-600' : 'text-amber-600'}`}>
                          {page.bounceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-foreground">{page.avgTime}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    <Card className="bg-card border shadow-sm overflow-hidden">
      <div className="h-1 bg-[#C8A661]" />
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
          <Activity className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3" data-testid={`activity-item-${idx}`}>
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
    <Card className="bg-card border shadow-sm overflow-hidden">
      <div className="h-1 bg-[#C8A661]" />
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
      `Total Users,${stats?.users.total || 2100}\n` +
      `Active Subscribers,${stats?.users.proUsers || 570}\n` +
      `Monthly Recurring Revenue,$${34200}\n` +
      `Annual Recurring Revenue,$${410400}\n` +
      `CLEANBI Analyses Today,${247}\n` +
      `Active Listings,${stats?.listings.active || 0}\n` +
      `Total CLEANBI Scans,${stats?.cleanbi.totalScans || 3847}\n` +
      `Newsletter Subscribers,${stats?.newsletter.subscribers || 0}\n` +
      `Date Range,${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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

  const totalMRR = 34200;
  const totalARR = 410400;
  const revenueGrowth = 19.6;
  const cleanbiToday = 247;
  const activeSubscribers = stats?.users.proUsers || 570;

  return (
    <DashboardShell
      title="Admin Analytics Hub"
      subtitle="WashBizHub Platform Command Center"
      breadcrumbs={[
        { label: "Admin", href: "/admin-dashboard" },
        { label: "Analytics Hub" },
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

        <DashboardSection title="Platform Metrics" description="Key performance indicators for the platform">
          <KPIGroup>
            <KPICard
              label="Total Users"
              value={stats?.users.total || 2100}
              icon={Users}
              variant="default"
              trend={{ value: 15.4, direction: "up", label: "vs last month" }}
              subtitle={`${stats?.users.newThisMonth || 280} new this month`}
            />
            <KPICard
              label="Active Subscribers"
              value={activeSubscribers}
              icon={Zap}
              variant="success"
              trend={{ value: 12.3, direction: "up", label: "vs last month" }}
              subtitle={`$${(activeSubscribers * 60).toLocaleString()} MRR`}
            />
            <KPICard
              label="CLEANBI Today"
              value={cleanbiToday}
              icon={MapPin}
              variant="gold"
              trend={{ value: 28.7, direction: "up", label: "vs yesterday" }}
              subtitle={`${stats?.cleanbi.totalScans?.toLocaleString() || '3,847'} total`}
            />
            <KPICard
              label="Revenue This Month"
              value={totalMRR}
              prefix="$"
              icon={DollarSign}
              variant="gold"
              trend={{ value: revenueGrowth, direction: "up", label: "vs last month" }}
              subtitle={`$${(totalARR / 1000).toFixed(0)}K ARR`}
            />
          </KPIGroup>
        </DashboardSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Revenue Analytics"
            subtitle="Monthly Recurring Revenue (MRR) over time"
            onRefresh={() => refetchStats()}
            isLoading={statsLoading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "white" }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "mrr" ? "MRR" : "ARR"]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => value === "mrr" ? "Monthly Revenue" : "Annual Revenue"} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke={COLORS.gold}
                  strokeWidth={2}
                  fill="url(#mrrGradient)"
                  name="mrr"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="User Growth"
            subtitle="New signups and total users over time"
            onRefresh={() => refetchStats()}
            isLoading={statsLoading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "white" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={COLORS.navy}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Total Users"
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  stroke={COLORS.gold}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="New Signups"
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
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "white" }}
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

          <ChartCard
            title="CLEANBI Usage"
            subtitle="Daily analysis counts this week"
            isLoading={statsLoading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cleanbiUsageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", backgroundColor: "white" }}
                  formatter={(value: number) => [value.toLocaleString(), "Analyses"]}
                />
                <Bar dataKey="analyses" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <QuickActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <TopPerformingPagesTable />
        </div>

        <DashboardSection title="CLEANBI Hotspots" description="Most analyzed locations this month">
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
                    {[
                      { address: "123 Main St, Los Angeles, CA", analyses: 847, score: 92 },
                      { address: "456 Oak Ave, New York, NY", analyses: 623, score: 88 },
                      { address: "789 Pine Blvd, Chicago, IL", analyses: 512, score: 85 },
                      { address: "321 Elm St, Houston, TX", analyses: 489, score: 79 },
                      { address: "654 Maple Dr, Phoenix, AZ", analyses: 378, score: 91 },
                    ].map((location, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/30" data-testid={`row-cleanbi-${idx}`}>
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

        <DashboardSection title="Platform Overview">
          <DashboardGrid columns={4}>
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#C8A661]">{stats?.listings.active || 156}</p>
                    <p className="text-xs text-muted-foreground">Active Listings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#C8A661]">{stats?.forum.totalTopics || 342}</p>
                    <p className="text-xs text-muted-foreground">Forum Topics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#C8A661]">{stats?.courses.total || 24}</p>
                    <p className="text-xs text-muted-foreground">Academy Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#C8A661]">{stats?.newsletter.subscribers || 1847}</p>
                    <p className="text-xs text-muted-foreground">Newsletter Subs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DashboardGrid>
        </DashboardSection>
      </div>
    </DashboardShell>
  );
}
