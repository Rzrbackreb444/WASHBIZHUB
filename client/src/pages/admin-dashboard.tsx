import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Users, ShoppingBag, MessageSquare, BookOpen, FileText, Building2,
  Bot, MapPin, Mail, Globe, TrendingUp, DollarSign, Activity,
  LogOut, RefreshCw, Calendar, Eye, ArrowUpRight, Clock,
  Zap, Target, BarChart3, PieChart
} from "lucide-react";

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

function StatCard({ title, value, icon: Icon, change, changeLabel, color = "amber" }: {
  title: string;
  value: number | string;
  icon: any;
  change?: number;
  changeLabel?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    amber: "from-amber-500 to-amber-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    cyan: "from-cyan-500 to-cyan-600",
    pink: "from-pink-500 to-pink-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <Card className="relative overflow-hidden border-slate-700 bg-slate-800/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            {change !== undefined && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <ArrowUpRight className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(change)}% {changeLabel || 'vs last month'}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DataTable({ title, data, columns, emptyMessage = "No data available" }: {
  title: string;
  data: any[];
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  emptyMessage?: string;
}) {
  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {data.length === 0 ? (
            <p className="text-slate-500 text-center py-8">{emptyMessage}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left py-2 px-2 text-xs font-medium text-slate-400 uppercase">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    {columns.map((col) => (
                      <td key={col.key} className="py-2 px-2 text-sm text-slate-300">
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

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth on mount
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

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats", { headers: getAuthHeaders(), credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent users
  const { data: recentUsers = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/recent-users", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch recent listings
  const { data: recentListings = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-listings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/recent-listings", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch recent forum activity
  const { data: recentForum = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-forum"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/recent-forum", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch recent blogs
  const { data: recentBlogs = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-blogs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/recent-blogs", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch all users
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/dashboard/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/users", { headers: getAuthHeaders(), credentials: "include" });
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch tenants
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

  const handleRefresh = () => {
    refetchStats();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return (
    <AuthGuard 
      title="Sign In to Access Admin Dashboard" 
      description="Sign in to access your dashboard."
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WashBizHub Command Center</h1>
              <p className="text-xs text-slate-400">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <StatCard 
            title="Total Users" 
            value={stats?.users.total || 0} 
            icon={Users}
            color="blue"
          />
          <StatCard 
            title="Pro Subscribers" 
            value={stats?.users.proUsers || 0} 
            icon={Zap}
            color="amber"
          />
          <StatCard 
            title="Active Listings" 
            value={stats?.listings.active || 0} 
            icon={ShoppingBag}
            color="green"
          />
          <StatCard 
            title="Forum Topics" 
            value={stats?.forum.totalTopics || 0} 
            icon={MessageSquare}
            color="purple"
          />
          <StatCard 
            title="CLEANBI Scans" 
            value={stats?.cleanbi.totalScans || 0} 
            icon={MapPin}
            color="cyan"
          />
          <StatCard 
            title="Course Enrollments" 
            value={stats?.courses.enrollments || 0} 
            icon={BookOpen}
            color="pink"
          />
          <StatCard 
            title="Blog Posts" 
            value={stats?.content.blogPosts || 0} 
            icon={FileText}
            color="orange"
          />
          <StatCard 
            title="Newsletter Subs" 
            value={stats?.newsletter.subscribers || 0} 
            icon={Mail}
            color="red"
          />
          <StatCard 
            title="Vendors" 
            value={stats?.vendors.total || 0} 
            icon={Building2}
            color="green"
          />
          <StatCard 
            title="Tenants" 
            value={stats?.tenants.total || 0} 
            icon={Globe}
            color="blue"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">New Users (30d)</p>
                <p className="text-xl font-bold text-white">{stats?.users.newThisMonth || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Forum Replies</p>
                <p className="text-xl font-bold text-white">{stats?.forum.totalReplies || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Topics This Week</p>
                <p className="text-xl font-bold text-white">{stats?.forum.topicsThisWeek || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">AI Agents</p>
                <p className="text-xl font-bold text-white">{stats?.aiAgents.total || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed data */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="forum" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
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
                  <Badge className={u.isPro ? "bg-amber-500/20 text-amber-400" : "bg-slate-600 text-slate-300"}>
                    {u.subscriptionTier || 'free'}
                  </Badge>
                )},
                { key: "cleanbiTier", label: "CLEANBI", render: (u) => (
                  <Badge className="bg-cyan-500/20 text-cyan-400">{u.cleanbiTier || 'free'}</Badge>
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
                  <Badge className="bg-green-500/20 text-green-400">{l.businessType}</Badge>
                )},
                { key: "status", label: "Status", render: (l) => (
                  <Badge className={l.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-300"}>
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
                  <Badge className="bg-purple-500/20 text-purple-400">{b.category}</Badge>
                )},
                { key: "type", label: "Type", render: (b) => (
                  <Badge className="bg-blue-500/20 text-blue-400">{b.type}</Badge>
                )},
                { key: "status", label: "Status", render: (b) => (
                  <Badge className={b.status === 'published' ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}>
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
                  <span className="text-cyan-400">{t.domain}</span>
                )},
                { key: "slug", label: "Slug" },
                { key: "isActive", label: "Status", render: (t) => (
                  <Badge className={t.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                )},
                { key: "createdAt", label: "Created", render: (t) => t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-' },
              ]}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-500">
            WashBizHub Admin Dashboard - Data refreshes every 30 seconds
          </p>
          <p className="text-xs text-slate-600 mt-1">
            <Clock className="w-3 h-3 inline mr-1" />
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
