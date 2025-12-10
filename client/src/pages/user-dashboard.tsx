import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import { 
  TrendingUp, TrendingDown, Heart, Search, Calculator, FileText, 
  Users, Building2, MapPin, Clock, Star, ChevronRight, Bell,
  ArrowUpRight, Activity, Target, Zap, Award, Eye, MessageSquare,
  Bookmark, Download, Share2, Filter, Calendar, MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";

const CHART_COLORS = {
  primary: "#3B82F6",
  secondary: "#8B5CF6", 
  accent: "#06B6D4",
  success: "#22C55E",
  warning: "#F59E0B",
  gradient1: "url(#colorGradient1)",
  gradient2: "url(#colorGradient2)",
};

const activityData = [
  { name: "Mon", views: 45, searches: 12, saves: 3 },
  { name: "Tue", views: 52, searches: 18, saves: 5 },
  { name: "Wed", views: 38, searches: 9, saves: 2 },
  { name: "Thu", views: 65, searches: 22, saves: 8 },
  { name: "Fri", views: 48, searches: 15, saves: 4 },
  { name: "Sat", views: 72, searches: 28, saves: 6 },
  { name: "Sun", views: 58, searches: 20, saves: 5 },
];

const monthlyData = [
  { month: "Jan", value: 2400 },
  { month: "Feb", value: 1398 },
  { month: "Mar", value: 9800 },
  { month: "Apr", value: 3908 },
  { month: "May", value: 4800 },
  { month: "Jun", value: 3800 },
  { month: "Jul", value: 4300 },
  { month: "Aug", value: 5200 },
  { month: "Sep", value: 4100 },
  { month: "Oct", value: 6300 },
  { month: "Nov", value: 5800 },
  { month: "Dec", value: 7200 },
];

const engagementData = [
  { name: "Listings Viewed", value: 42, fill: "#3B82F6" },
  { name: "Reports Downloaded", value: 8, fill: "#8B5CF6" },
  { name: "Calculators Used", value: 15, fill: "#06B6D4" },
  { name: "Messages Sent", value: 12, fill: "#22C55E" },
];

const radialData = [
  { name: "Profile Complete", value: 85, fill: "#3B82F6" },
];

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function formatEventType(eventType: string): string {
  const map: Record<string, string> = {
    saved_search: "Saved search",
    favorite_listing: "Saved to favorites",
    follow: "Followed user",
    listing_created: "Created listing",
    cleanbi_analysis: "CLEANBI analysis",
    forum_post: "Forum post",
    forum_reply: "Forum reply",
  };
  return map[eventType] || eventType.replace(/_/g, " ");
}

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch dashboard overview with all stats and data
  const { data: dashboardData, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["/api/user-dashboard/overview"],
    enabled: !!user,
  });

  // Fetch engagement metrics for charts
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["/api/user-dashboard/metrics"],
    enabled: !!user,
  });
  
  // Combined loading states
  const isLoading = isLoadingOverview || isLoadingMetrics;

  const userName = user?.firstName || user?.username || "User";
  const initials = userName.slice(0, 2).toUpperCase();
  
  // Extract stats from dashboard data (only use when loaded)
  const stats = isLoadingOverview 
    ? { savedSearches: 0, favorites: 0, listingsViewed: 0, connections: 0 }
    : dashboardData?.stats || { savedSearches: 0, favorites: 0, listingsViewed: 0, connections: 0 };
  const userSavedSearches = dashboardData?.savedSearches || [];
  const userFavorites = dashboardData?.favorites || [];
  const recentActivity = dashboardData?.recentActivity || [];
  
  // Extract metrics for charts - null when loading, API data when available, empty arrays if loaded but no data
  const hasMetricsLoaded = !isLoadingMetrics && metrics !== undefined;
  const chartMonthlyData = hasMetricsLoaded ? (metrics?.monthlyData || []) : null;
  const chartEngagementData = hasMetricsLoaded ? (metrics?.engagementData || []) : null;
  
  // Transform activity data for the weekly chart
  const chartActivityData = hasMetricsLoaded 
    ? (metrics?.monthlyData?.map((m: any) => ({
        name: m.name,
        views: m.views || 0,
        searches: m.activity || 0,
      })) || [])
    : null;

  return (
    <>
      <SEO 
        title="My Dashboard | WashBizHub"
        description="Your personal command center for laundromat investing. Track saved searches, favorites, reports, and platform activity."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-white dark:border-slate-800 shadow-lg">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back, {userName}
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your laundromat journey
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" data-testid="button-notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">3</Badge>
              </Button>
              <Button size="sm" data-testid="button-new-search">
                <Search className="w-4 h-4 mr-2" />
                New Search
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Saved Searches" 
              value={String(stats.savedSearches)} 
              change="Active alerts"
              trend="up"
              icon={Search}
              color="blue"
            />
            <StatCard 
              title="Favorites" 
              value={String(stats.favorites)} 
              change="Watchlist"
              trend="up"
              icon={Heart}
              color="rose"
            />
            <StatCard 
              title="Listings Viewed" 
              value={String(stats.listingsViewed)} 
              change="Browse history"
              trend="neutral"
              icon={Eye}
              color="purple"
            />
            <StatCard 
              title="Connections" 
              value={String(stats.connections)} 
              change="Network"
              trend="up"
              icon={Users}
              color="emerald"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Chart */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Your Activity</CardTitle>
                      <CardDescription>Weekly platform engagement</CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">Views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-muted-foreground">Searches</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-64">
                    {isLoadingMetrics ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="space-y-4 w-full">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ) : chartActivityData && chartActivityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartActivityData}>
                          <defs>
                            <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: 'none', 
                              borderRadius: '12px', 
                              boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="views" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            fill="url(#colorGradient1)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="searches" 
                            stroke="#8B5CF6" 
                            strokeWidth={2}
                            fill="url(#colorGradient2)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No activity data yet. Start exploring to track your engagement!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Engagement Trend</CardTitle>
                      <CardDescription>12-month activity overview</CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-normal">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +23% vs last year
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-48">
                    {isLoadingMetrics ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="space-y-3 w-full">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    ) : chartMonthlyData && chartMonthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartMonthlyData.map((m: any) => ({ month: m.name || m.month, value: m.activity || m.value || 0 }))} barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: 'none', 
                              borderRadius: '12px', 
                              boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                            }} 
                          />
                          <Bar 
                            dataKey="value" 
                            fill="#3B82F6" 
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No engagement trend data yet. Your activity will appear here.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionCard 
                  icon={Building2}
                  title="Browse Listings"
                  description="Find your next opportunity"
                  href="/laundromat-listings"
                  color="blue"
                />
                <QuickActionCard 
                  icon={MapPin}
                  title="CLEANBI Explorer"
                  description="Analyze any location"
                  href="/cleanbi-explorer"
                  color="purple"
                />
                <QuickActionCard 
                  icon={Calculator}
                  title="Calculators"
                  description="Valuation & ROI tools"
                  href="/calculators"
                  color="cyan"
                />
                <QuickActionCard 
                  icon={FileText}
                  title="Buy Reports"
                  description="One-time analysis"
                  href="/single-analysis"
                  color="emerald"
                />
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          innerRadius="70%" 
                          outerRadius="100%" 
                          data={radialData} 
                          startAngle={90} 
                          endAngle={-270}
                        >
                          <RadialBar
                            background={{ fill: '#e2e8f0' }}
                            dataKey="value"
                            cornerRadius={10}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">85%</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground">Complete your profile to get personalized recommendations</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Complete Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Engagement Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingMetrics ? (
                    <div className="space-y-3">
                      <Skeleton className="h-48 w-full rounded-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : chartEngagementData && chartEngagementData.length > 0 ? (
                    <>
                      <div className="h-48 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartEngagementData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {chartEngagementData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {chartEngagementData.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Your engagement breakdown will appear here as you use the platform.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Saved Searches */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Saved Searches</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/laundromat-listings">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingOverview ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : userSavedSearches.length > 0 ? (
                    userSavedSearches.slice(0, 3).map((search: any) => (
                      <SavedSearchItem 
                        key={search.id}
                        title={search.name}
                        matches={search.lastMatchCount || 0}
                        newMatches={0}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No saved searches yet</p>
                      <Button variant="link" size="sm" asChild>
                        <Link href="/laundromat-listings">Start searching</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {isLoadingOverview ? (
                        <div className="space-y-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : recentActivity.length > 0 ? (
                        recentActivity.slice(0, 5).map((activity: any) => {
                          const iconMap: Record<string, any> = {
                            saved_search: Search,
                            favorite_listing: Heart,
                            follow: Users,
                            listing_created: Building2,
                            cleanbi_analysis: MapPin,
                          };
                          const Icon = iconMap[activity.eventType] || Activity;
                          const timeAgo = activity.createdAt ? formatTimeAgo(new Date(activity.createdAt)) : "Recently";
                          return (
                            <ActivityItem 
                              key={activity.id}
                              icon={Icon}
                              title={formatEventType(activity.eventType)}
                              description={activity.entityType || "Platform activity"}
                              time={timeAgo}
                            />
                          );
                        })
                      ) : (
                        <ActivityItem 
                          icon={Eye}
                          title="Get started"
                          description="Browse listings to begin tracking activity"
                          time="Now"
                        />
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Section - Favorites & Recommendations */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {/* Favorite Listings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Favorite Listings</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/favorites">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FavoriteListingCard 
                    title="Premium Coin Laundry"
                    location="Miami, FL"
                    price="$425,000"
                    revenue="$180,000/yr"
                    grade="A"
                    image="/placeholder-laundromat.jpg"
                  />
                  <FavoriteListingCard 
                    title="Austin Express Wash"
                    location="Austin, TX"
                    price="$680,000"
                    revenue="$285,000/yr"
                    grade="B"
                    image="/placeholder-laundromat.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recommended For You */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recommended For You</CardTitle>
                    <CardDescription>Based on your search history</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Zap className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RecommendationCard 
                    title="New listing matches your criteria"
                    description="Modern laundromat in Tampa, FL with high foot traffic and recent equipment upgrades."
                    matchScore={95}
                  />
                  <RecommendationCard 
                    title="Price drop alert"
                    description="A listing you viewed dropped by $50,000. Located in Phoenix, AZ."
                    matchScore={88}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: any;
  color: "blue" | "rose" | "purple" | "emerald";
}) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-400",
    rose: "from-rose-500/10 to-rose-600/5 text-rose-600 dark:text-rose-400",
    purple: "from-purple-500/10 to-purple-600/5 text-purple-600 dark:text-purple-400",
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400",
  };

  const iconBgClasses = {
    blue: "bg-blue-500",
    rose: "bg-rose-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border-0 overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              {trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
              <span className="text-xs text-muted-foreground">{change}</span>
            </div>
          </div>
          <div className={`${iconBgClasses[color]} p-2 rounded-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ icon: Icon, title, description, href, color }: {
  icon: any;
  title: string;
  description: string;
  href: string;
  color: "blue" | "purple" | "cyan" | "emerald";
}) {
  const colorClasses = {
    blue: "group-hover:bg-blue-500",
    purple: "group-hover:bg-purple-500",
    cyan: "group-hover:bg-cyan-500",
    emerald: "group-hover:bg-emerald-500",
  };

  return (
    <Link href={href}>
      <Card className="group hover-elevate cursor-pointer h-full transition-all duration-200">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <div className={`p-3 rounded-xl bg-muted ${colorClasses[color]} transition-colors mb-3`}>
            <Icon className="w-6 h-6 text-muted-foreground group-hover:text-white transition-colors" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function SavedSearchItem({ title, matches, newMatches }: {
  title: string;
  matches: number;
  newMatches: number;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Search className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{matches} matches</p>
        </div>
      </div>
      {newMatches > 0 && (
        <Badge variant="default" className="bg-blue-500">{newMatches} new</Badge>
      )}
    </div>
  );
}

function ActivityItem({ icon: Icon, title, description, time }: {
  icon: any;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-muted">
        <Icon className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function FavoriteListingCard({ title, location, price, revenue, grade, image }: {
  title: string;
  location: string;
  price: string;
  revenue: string;
  grade: string;
  image: string;
}) {
  const gradeColors: Record<string, string> = {
    A: "bg-emerald-500",
    B: "bg-lime-500",
    C: "bg-amber-500",
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className={`absolute top-1 right-1 w-5 h-5 rounded-full ${gradeColors[grade]} flex items-center justify-center`}>
          <span className="text-xs font-bold text-white">{grade}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate">{title}</h4>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {location}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm font-bold text-blue-600">{price}</span>
          <span className="text-xs text-muted-foreground">{revenue}</span>
        </div>
      </div>
      <Button size="icon" variant="ghost">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function RecommendationCard({ title, description, matchScore }: {
  title: string;
  description: string;
  matchScore: number;
}) {
  return (
    <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
              <circle 
                cx="24" cy="24" r="20" 
                stroke="currentColor" strokeWidth="4" fill="none" 
                className="text-blue-500"
                strokeDasharray={`${matchScore * 1.26} 126`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{matchScore}%</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1">Match</span>
        </div>
      </div>
    </div>
  );
}
