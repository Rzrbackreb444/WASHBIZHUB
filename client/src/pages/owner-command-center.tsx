import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Users, TrendingUp, DollarSign, Activity, BarChart3, 
  RefreshCw, Shield, Clock, MapPin, Mail, MessageSquare,
  BookOpen, CreditCard, Zap, Target, Eye, ArrowUpRight,
  ArrowDownRight, AlertCircle, CheckCircle2, Crown, PieChart,
  Globe, Sparkles, ChevronDown, ChevronUp, Layers, Radio,
  UserPlus, UserCheck, Building2, Star
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

declare global {
  interface Window {
    google: any;
  }
}

const OWNER_EMAILS = ["rzrbackreb444@gmail.com", "nick@washbizhub.com", "thelaundromatfb@gmail.com"];

const TIER_COLORS: Record<string, string> = {
  free: "#6B7280",
  accelerate: "#10B981",
  scale: "#3B82F6",
  summit: "#8B5CF6",
  pro: "#F59E0B",
  enterprise: "#EC4899"
};

const CHART_COLORS = ["#C8A661", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];

interface OwnerStats {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
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
  popularLocations: Array<{ address: string; count: number; lat?: number; lng?: number }>;
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

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

function PremiumStatCard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon: Icon, 
  gradient,
  pulse = false
}: {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: any;
  gradient: string;
  pulse?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${gradient} p-6 backdrop-blur-xl`}>
      {pulse && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
          </p>
          {change !== undefined && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}% {changeLabel || 'vs last period'}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

export default function OwnerCommandCenter() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const isOwner = user?.isAdmin === true || OWNER_EMAILS.includes(user?.email || "");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isOwner)) {
      setLocation("/");
    }
  }, [isAuthenticated, isOwner, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats, isFetching } = useQuery<OwnerStats>({
    queryKey: ["/api/owner/stats"],
    enabled: isAuthenticated && isOwner,
    refetchInterval: 30000,
  });

  const { data: userGrowth } = useQuery<UserGrowthData>({
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

  // Initialize Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && mapRef.current && !mapInstance.current) {
        initializeMap();
      }
    };

    if (!window.google) {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=visualization&callback=initOwnerMap`;
        script.async = true;
        script.defer = true;
        (window as any).initOwnerMap = loadGoogleMaps;
        document.head.appendChild(script);
      } else {
        setTimeout(loadGoogleMaps, 500);
      }
    } else {
      loadGoogleMaps();
    }

    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(m => m.setMap(null));
      }
    };
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    const darkStyle = [
      { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
      { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
      { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f172a" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c1222" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] }
    ];

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4,
      styles: darkStyle,
      disableDefaultUI: true,
      zoomControl: true,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false
    });

    // Add sample user location markers (in production, this would come from real user data)
    const sampleLocations = [
      { lat: 34.0522, lng: -118.2437, users: 3, city: "Los Angeles" },
      { lat: 40.7128, lng: -74.0060, users: 5, city: "New York" },
      { lat: 41.8781, lng: -87.6298, users: 2, city: "Chicago" },
      { lat: 29.7604, lng: -95.3698, users: 2, city: "Houston" },
      { lat: 33.4484, lng: -112.0740, users: 1, city: "Phoenix" },
      { lat: 36.1699, lng: -115.1398, users: 3, city: "Las Vegas" },
    ];

    sampleLocations.forEach(loc => {
      const marker = new window.google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8 + loc.users * 2,
          fillColor: "#C8A661",
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        },
        title: `${loc.city}: ${loc.users} users`
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui; background: #0f172a; border-radius: 8px; min-width: 140px;">
            <div style="font-weight: bold; color: #C8A661; font-size: 14px;">${loc.city}</div>
            <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">${loc.users} active users</div>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, []);

  const handleRefresh = () => {
    refetchStats();
    setLastRefresh(new Date());
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
          </div>
          <p className="text-slate-400">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  const tierData = stats?.tierBreakdown ? [
    { name: "Free", value: stats.tierBreakdown.free, color: TIER_COLORS.free },
    { name: "Accelerate", value: stats.tierBreakdown.accelerate, color: TIER_COLORS.accelerate },
    { name: "Scale", value: stats.tierBreakdown.scale, color: TIER_COLORS.scale },
    { name: "Summit", value: stats.tierBreakdown.summit, color: TIER_COLORS.summit },
  ].filter(t => t.value > 0) : [];

  const growthChartData = userGrowth?.dailyGrowth?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: d.count,
    total: d.cumulative
  })) || [];

  return (
    <AuthGuard 
      title="Sign In to Access Owner Command Center" 
      description="Sign in to access your dashboard."
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Premium Header */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 blur-lg opacity-50"></div>
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Owner Command Center</h1>
              <p className="text-sm text-slate-400">Real-Time Platform Intelligence</p>
            </div>
            <Badge variant="outline" className="ml-4 border-amber-500/50 text-amber-500 bg-amber-500/10">
              <Shield className="w-3 h-3 mr-1" />
              Private
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Last updated</p>
              <p className="text-sm text-slate-300">{lastRefresh.toLocaleTimeString()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {isFetching && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
            <PremiumStatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              change={stats?.userGrowthPercent}
              changeLabel="growth"
              icon={Users}
              gradient="from-blue-600/20 to-blue-800/20"
              pulse={true}
            />
            <PremiumStatCard
              title="New This Week"
              value={stats?.newUsersThisWeek || 0}
              icon={UserPlus}
              gradient="from-green-600/20 to-green-800/20"
            />
            <PremiumStatCard
              title="Pro Subscribers"
              value={stats?.proSubscribers || 0}
              icon={Crown}
              gradient="from-amber-600/20 to-amber-800/20"
            />
            <PremiumStatCard
              title="Monthly Revenue"
              value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`}
              icon={DollarSign}
              gradient="from-emerald-600/20 to-emerald-800/20"
            />
            <PremiumStatCard
              title="CLEANBI Analyses"
              value={stats?.cleanbiAnalyses || 0}
              icon={MapPin}
              gradient="from-purple-600/20 to-purple-800/20"
            />
            <PremiumStatCard
              title="Email Subscribers"
              value={stats?.emailSubscribers || 0}
              icon={Mail}
              gradient="from-pink-600/20 to-pink-800/20"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-white/10 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                <Globe className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                <DollarSign className="w-4 h-4 mr-2" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="engagement" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                <Activity className="w-4 h-4 mr-2" />
                Engagement
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Map */}
                <GlassCard className="lg:col-span-2 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-white">User Distribution</h3>
                      </div>
                      <Badge variant="outline" className="border-white/20 text-slate-400">
                        <Layers className="w-3 h-3 mr-1" />
                        Live Map
                      </Badge>
                    </div>
                  </div>
                  <div ref={mapRef} className="h-[400px] w-full" />
                </GlassCard>

                {/* User Tier Breakdown */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-white">Subscription Tiers</h3>
                  </div>
                  
                  {tierData.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={tierData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {tierData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-slate-500">
                      No tier data available
                    </div>
                  )}

                  <div className="space-y-3 mt-4">
                    {tierData.map((tier, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                          <span className="text-sm text-slate-300">{tier.name}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{tier.value}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* User Growth Chart */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-white">User Growth (Last 14 Days)</h3>
                  </div>
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {stats?.userGrowthPercent || 0}% growth
                  </Badge>
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthChartData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C8A661" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#C8A661" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#C8A661" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                      />
                      <Bar dataKey="users" fill="#C8A661" opacity={0.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <GlassCard>
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold text-white">Recent Signups</h3>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-slate-400">
                      {usersData?.total || 0} total
                    </Badge>
                  </div>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">User</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Email</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Tier</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData?.users?.map((u, idx) => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                                  {(u.firstName?.[0] || u.email?.[0] || '?').toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username || 'Anonymous'}
                                  </p>
                                  {u.companyName && (
                                    <p className="text-xs text-slate-500">{u.companyName}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-300">{u.email || '-'}</td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant="outline" 
                                style={{ 
                                  borderColor: TIER_COLORS[u.subscriptionTier || 'free'] + '50',
                                  color: TIER_COLORS[u.subscriptionTier || 'free']
                                }}
                              >
                                {u.subscriptionTier || 'Free'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-400">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </GlassCard>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-white">MRR</h3>
                  </div>
                  <p className="text-4xl font-bold text-white">${(revenueData?.mrr || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-2">Monthly Recurring Revenue</p>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-white">Total Revenue</h3>
                  </div>
                  <p className="text-4xl font-bold text-white">${(revenueData?.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-2">All time</p>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-white">Stripe Status</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {revenueData?.stripeConnected ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <span className="text-lg font-medium text-green-400">Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                        <span className="text-lg font-medium text-yellow-400">Not Connected</span>
                      </>
                    )}
                  </div>
                </GlassCard>
              </div>

              {/* Revenue by Product */}
              {revenueData?.revenueByProduct && Object.keys(revenueData.revenueByProduct).length > 0 && (
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-white">Revenue by Product</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(revenueData.revenueByProduct).map(([product, amount], idx) => (
                      <div key={product}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-300">{product}</span>
                          <span className="text-sm font-medium text-white">${amount.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={(amount / Math.max(...Object.values(revenueData.revenueByProduct))) * 100} 
                          className="h-2 bg-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Forum Stats */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-white">Forum Activity</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Topics</span>
                      <span className="font-medium text-white">{engagementData?.forum?.totalTopics || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Replies</span>
                      <span className="font-medium text-white">{engagementData?.forum?.totalReplies || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Topics This Week</span>
                      <span className="font-medium text-green-400">+{engagementData?.forum?.topicsThisWeek || 0}</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Email Stats */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-pink-500" />
                    <h3 className="font-semibold text-white">Email Subscribers</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Subscribers</span>
                      <span className="font-medium text-white">{engagementData?.email?.totalSubscribers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Newsletter</span>
                      <span className="font-medium text-white">{engagementData?.email?.newsletterSubscribers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Growth This Month</span>
                      <span className="font-medium text-green-400">+{engagementData?.email?.growthThisMonth || 0}</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Content Stats */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-white">Content</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Blog Posts</span>
                      <span className="font-medium text-white">{engagementData?.content?.publishedBlogs || 0} / {engagementData?.content?.totalBlogs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Courses</span>
                      <span className="font-medium text-white">{engagementData?.content?.totalCourses || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Enrollments</span>
                      <span className="font-medium text-white">{engagementData?.content?.totalEnrollments || 0}</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
