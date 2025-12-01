import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  StatCard, MetricCard, DonutChart, MiniBarChart, ProgressBar,
  DashboardGrid, SectionHeader, DataTable
} from "@/components/dashboard/DashboardComponents";
import {
  Users, TrendingUp, DollarSign, Activity, BarChart3, 
  RefreshCw, Shield, Clock, MapPin, Mail, MessageSquare,
  BookOpen, CreditCard, Zap, Target, Eye, ArrowUpRight,
  AlertCircle, CheckCircle2, Crown, PieChart
} from "lucide-react";

const OWNER_EMAIL = "rzrbackreb444@gmail.com";

interface OwnerStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  proSubscribers: number;
  cleanbiAnalyses: number;
  cleanbiThisMonth: number;
  emailSubscribers: number;
  userGrowthPercent: number;
  tierBreakdown: { free: number; accelerate: number; scale: number; summit: number };
  monthlyRevenue: number;
  lastUpdated: string;
}

interface UserGrowthData {
  dailyGrowth: { date: string; count: number; cumulative: number }[];
}

interface UsersData {
  users: Array<{
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    isPro: boolean;
    subscriptionTier: string | null;
    cleanbiTier: string | null;
    companyName: string | null;
    role: string | null;
    createdAt: string;
  }>;
  total: number;
}

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  mrr: number;
  revenueByProduct: Record<string, number>;
  recentTransactions: Array<any>;
  stripeConnected: boolean;
}

interface CleanbiData {
  totalAnalyses: number;
  analysesThisMonth: number;
  analysesByType: Record<string, number>;
  popularLocations: Array<{ address: string; count: number }>;
  paidVsFree: { paid: number; free: number };
}

interface EngagementData {
  forum: {
    totalTopics: number;
    totalReplies: number;
    topicsThisWeek: number;
    repliesThisWeek: number;
  };
  email: {
    totalSubscribers: number;
    emailSubscribers: number;
    newsletterSubscribers: number;
    growthThisMonth: number;
  };
  content: {
    totalBlogs: number;
    publishedBlogs: number;
    totalCourses: number;
    totalEnrollments: number;
  };
}

export default function OwnerCommandCenter() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const isOwner = user?.isAdmin === true || user?.email === OWNER_EMAIL;

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isOwner)) {
      setLocation("/");
    }
  }, [isAuthenticated, isOwner, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<OwnerStats>({
    queryKey: ["/api/owner/stats"],
    enabled: isAuthenticated && isOwner,
    refetchInterval: 30000,
  });

  const { data: userGrowth, isLoading: growthLoading } = useQuery<UserGrowthData>({
    queryKey: ["/api/owner/user-growth"],
    enabled: isAuthenticated && isOwner,
  });

  const { data: usersData } = useQuery<UsersData>({
    queryKey: ["/api/owner/users", { limit: 20 }],
    enabled: isAuthenticated && isOwner,
  });

  const { data: revenueData } = useQuery<RevenueData>({
    queryKey: ["/api/owner/revenue"],
    enabled: isAuthenticated && isOwner,
  });

  const { data: cleanbiData } = useQuery<CleanbiData>({
    queryKey: ["/api/owner/cleanbi"],
    enabled: isAuthenticated && isOwner,
  });

  const { data: engagementData } = useQuery<EngagementData>({
    queryKey: ["/api/owner/engagement"],
    enabled: isAuthenticated && isOwner,
  });

  const handleRefresh = () => {
    refetchStats();
    setLastRefresh(new Date());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isOwner) {
    return null;
  }

  const tierChartData = stats?.tierBreakdown ? [
    { label: "Free", value: stats.tierBreakdown.free, color: "#6b7280" },
    { label: "Accelerate", value: stats.tierBreakdown.accelerate, color: "#10b981" },
    { label: "Scale", value: stats.tierBreakdown.scale, color: "#3b82f6" },
    { label: "Summit", value: stats.tierBreakdown.summit, color: "#8b5cf6" },
  ] : [];

  const growthChartData = userGrowth?.dailyGrowth?.slice(-14).map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.count,
  })) || [];

  const cleanbiTypeData = cleanbiData?.analysesByType ? [
    { label: "Basic", value: cleanbiData.analysesByType.basic || 0, color: "#6b7280" },
    { label: "Detailed", value: cleanbiData.analysesByType.detailed || 0, color: "#10b981" },
    { label: "API", value: cleanbiData.analysesByType.api || 0, color: "#3b82f6" },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <section className="border-b border-white/10 bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-blue-900/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-white" data-testid="text-page-title">
                    Owner Command Center
                  </h1>
                  <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
                    <Shield className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                </div>
                <p className="text-purple-200 mt-1">Real-Time Platform Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-white" data-testid="text-last-updated">
                  {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={statsLoading}
                className="border-white/20 text-white hover:bg-white/10"
                data-testid="button-refresh"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section>
          <SectionHeader
            title="Key Metrics"
            subtitle="Platform overview at a glance"
            icon={BarChart3}
            color="#f59e0b"
          />
          <DashboardGrid cols={6}>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              subtitle={stats?.userGrowthPercent ? `${stats.userGrowthPercent > 0 ? "+" : ""}${stats.userGrowthPercent}% this month` : "Loading..."}
              icon={Users}
              variant="blue"
              trend={stats?.userGrowthPercent ? { value: stats.userGrowthPercent } : undefined}
            />
            <StatCard
              title="Active Users"
              value={stats?.activeUsers || 0}
              subtitle="Last 7 days"
              icon={Activity}
              variant="green"
            />
            <StatCard
              title="Pro Subscribers"
              value={stats?.proSubscribers || 0}
              subtitle="Paid accounts"
              icon={Crown}
              variant="purple"
            />
            <StatCard
              title="Monthly Revenue"
              value={`$${(revenueData?.mrr || 0).toLocaleString()}`}
              subtitle="MRR estimate"
              icon={DollarSign}
              variant="yellow"
            />
            <StatCard
              title="CLEANBI Analyses"
              value={stats?.cleanbiAnalyses || 0}
              subtitle={`${stats?.cleanbiThisMonth || 0} this month`}
              icon={Target}
              variant="cyan"
            />
            <StatCard
              title="Email Subscribers"
              value={stats?.emailSubscribers || 0}
              subtitle="Newsletter + forms"
              icon={Mail}
              variant="pink"
            />
          </DashboardGrid>
        </section>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-white/20" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-white/20" data-testid="tab-revenue">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="cleanbi" className="data-[state=active]:bg-white/20" data-testid="tab-cleanbi">
              <Target className="w-4 h-4 mr-2" />
              CLEANBI
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-white/20" data-testid="tab-engagement">
              <MessageSquare className="w-4 h-4 mr-2" />
              Engagement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    User Growth (Last 14 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {growthLoading ? (
                    <div className="h-32 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <MiniBarChart data={growthChartData} height={120} />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    Users by Tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={tierChartData}
                    size={140}
                    centerValue={stats?.totalUsers || 0}
                    centerLabel="Total"
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Recent Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <DataTable
                    columns={[
                      { key: "email", label: "Email", format: (v) => v || "N/A" },
                      { key: "name", label: "Name", format: (v) => v || "Anonymous" },
                      { key: "subscriptionTier", label: "Tier", format: (v) => (
                        <Badge variant={v === "free" ? "secondary" : "default"} className="text-xs">
                          {v || "free"}
                        </Badge>
                      )},
                      { key: "createdAt", label: "Joined", format: (v) => new Date(v).toLocaleDateString() },
                    ]}
                    data={(usersData?.users || []).map((u) => ({
                      ...u,
                      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username,
                    }))}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <DashboardGrid cols={4}>
              <MetricCard
                label="Monthly Recurring Revenue"
                value={revenueData?.mrr || 0}
                prefix="$"
                color="green"
              />
              <MetricCard
                label="Total Revenue"
                value={revenueData?.totalRevenue || 0}
                prefix="$"
                color="blue"
              />
              <MetricCard
                label="CLEANBI Reports Revenue"
                value={revenueData?.revenueByProduct?.cleanbiReports || 0}
                prefix="$"
                color="purple"
              />
              <MetricCard
                label="Stripe Status"
                value={revenueData?.stripeConnected ? "Connected" : "Not Connected"}
                color={revenueData?.stripeConnected ? "green" : "red"}
              />
            </DashboardGrid>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Revenue by Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {revenueData?.revenueByProduct && Object.entries(revenueData.revenueByProduct).map(([product, amount]) => (
                    <div key={product} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300 capitalize">{product.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className="text-white font-semibold">${amount.toLocaleString()}</span>
                      </div>
                      <ProgressBar
                        value={amount}
                        max={Math.max(...Object.values(revenueData.revenueByProduct)) || 100}
                        showValue={false}
                        color="gradient"
                        size="sm"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    {revenueData?.stripeConnected ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                    )}
                    Payment Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${revenueData?.stripeConnected ? "bg-green-400" : "bg-amber-400"}`} />
                      <span className="text-white font-medium">Stripe</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {revenueData?.stripeConnected
                        ? "Payment processing is active and ready to receive payments."
                        : "Stripe API key not configured. Payment processing unavailable."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cleanbi" className="space-y-6">
            <DashboardGrid cols={4}>
              <MetricCard
                label="Total Analyses"
                value={cleanbiData?.totalAnalyses || 0}
                color="blue"
              />
              <MetricCard
                label="This Month"
                value={cleanbiData?.analysesThisMonth || 0}
                color="green"
              />
              <MetricCard
                label="Paid Analyses"
                value={cleanbiData?.paidVsFree?.paid || 0}
                color="purple"
              />
              <MetricCard
                label="Free Analyses"
                value={cleanbiData?.paidVsFree?.free || 0}
                color="default"
              />
            </DashboardGrid>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Analyses by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={cleanbiTypeData}
                    size={160}
                    centerValue={cleanbiData?.totalAnalyses || 0}
                    centerLabel="Total"
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-400" />
                    Popular Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {cleanbiData?.popularLocations?.length ? (
                      <div className="space-y-3">
                        {cleanbiData.popularLocations.map((loc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5">
                            <span className="text-sm text-gray-300 truncate max-w-[70%]">{loc.address}</span>
                            <Badge variant="secondary">{loc.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No location data available</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <DashboardGrid cols={4}>
              <MetricCard
                label="Forum Topics"
                value={engagementData?.forum?.totalTopics || 0}
                color="blue"
              />
              <MetricCard
                label="Forum Replies"
                value={engagementData?.forum?.totalReplies || 0}
                color="green"
              />
              <MetricCard
                label="Email Subscribers"
                value={engagementData?.email?.totalSubscribers || 0}
                color="purple"
              />
              <MetricCard
                label="New Subs This Month"
                value={engagementData?.email?.growthThisMonth || 0}
                change={engagementData?.email?.growthThisMonth ? Math.round((engagementData.email.growthThisMonth / (engagementData.email.totalSubscribers || 1)) * 100) : 0}
                color="pink"
              />
            </DashboardGrid>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Forum Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 text-center">
                      <p className="text-2xl font-black text-white">{engagementData?.forum?.topicsThisWeek || 0}</p>
                      <p className="text-xs text-gray-400">Topics This Week</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 text-center">
                      <p className="text-2xl font-black text-white">{engagementData?.forum?.repliesThisWeek || 0}</p>
                      <p className="text-xs text-gray-400">Replies This Week</p>
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Topics</span>
                    <span className="text-white font-semibold">{engagementData?.forum?.totalTopics || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Replies</span>
                    <span className="text-white font-semibold">{engagementData?.forum?.totalReplies || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    Content & Courses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 text-center">
                      <p className="text-2xl font-black text-white">{engagementData?.content?.publishedBlogs || 0}</p>
                      <p className="text-xs text-gray-400">Published Blogs</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 text-center">
                      <p className="text-2xl font-black text-white">{engagementData?.content?.totalCourses || 0}</p>
                      <p className="text-xs text-gray-400">Courses</p>
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Blog Posts</span>
                    <span className="text-white font-semibold">{engagementData?.content?.totalBlogs || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Course Enrollments</span>
                    <span className="text-white font-semibold">{engagementData?.content?.totalEnrollments || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
