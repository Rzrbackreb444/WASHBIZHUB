import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid,
  DollarSign, 
  Users, 
  FileText, 
  Mail, 
  BookOpen, 
  Store, 
  MessageSquare,
  TrendingUp,
  Settings,
  Monitor,
  Search,
  Ticket,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading, authResolved } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch stats only when we KNOW user is admin (authResolved ensures definitive state)
  const { data: stats, refetch, isFetching } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: authResolved && isAuthenticated && user?.isAdmin === true,
  });

  // Handle redirect ONLY when we have a DEFINITIVE answer
  // authResolved ensures we've completed the auth check successfully
  useEffect(() => {
    // Only redirect when:
    // 1. Auth has fully resolved (not just stopped loading)
    // 2. AND user is confirmed NOT an admin
    if (authResolved && (!user || !user.isAdmin)) {
      setLocation('/');
    }
  }, [authResolved, user, setLocation]);

  // Show loading while auth is being determined OR while still fetching
  if (!authResolved) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If auth resolved but no user or not admin, show redirecting (the useEffect will handle actual redirect)
  if (!user || !user.isAdmin) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  const modules = [
    {
      title: "Advertisements",
      description: "Manage all ads across the platform",
      icon: Monitor,
      href: "/admin/ads",
      color: "text-blue-500",
      stats: stats?.ads || 0,
    },
    {
      title: "Blog Posts",
      description: "Create and manage blog content",
      icon: FileText,
      href: "/admin/blog",
      color: "text-purple-500",
      stats: stats?.posts || 0,
    },
    {
      title: "Newsletter",
      description: "Compose and send newsletters",
      icon: Mail,
      href: "/admin/newsletter",
      color: "text-green-500",
      stats: stats?.subscribers || 0,
    },
    {
      title: "Courses",
      description: "Manage courses and lessons",
      icon: BookOpen,
      href: "/admin/courses",
      color: "text-yellow-500",
      stats: stats?.courses || 0,
    },
    {
      title: "Resources",
      description: "Templates, calculators, guides",
      icon: LayoutGrid,
      href: "/admin/resources",
      color: "text-pink-500",
      stats: stats?.resources || 0,
    },
    {
      title: "Marketplace",
      description: "Vendors, products, storefronts",
      icon: Store,
      href: "/admin/marketplace",
      color: "text-orange-500",
      stats: stats?.vendors || 0,
    },
    {
      title: "Forum",
      description: "Moderate discussions and topics",
      icon: MessageSquare,
      href: "/admin/forum",
      color: "text-indigo-500",
      stats: stats?.topics || 0,
    },
    {
      title: "Users",
      description: "Manage user accounts and roles",
      icon: Users,
      href: "/admin/users",
      color: "text-red-500",
      stats: stats?.users || 0,
    },
    {
      title: "Analytics",
      description: "Revenue, engagement, conversions",
      icon: TrendingUp,
      href: "/admin/analytics",
      color: "text-teal-500",
      stats: null,
    },
    {
      title: "SEO / Indexing",
      description: "Search engine indexing control",
      icon: Search,
      href: "/admin/indexing",
      color: "text-cyan-500",
      stats: null,
    },
    {
      title: "Promo Codes",
      description: "Create discount codes for Facebook group",
      icon: Ticket,
      href: "/admin/promo-codes",
      color: "text-amber-500",
      stats: stats?.promoCodes || 0,
    },
    {
      title: "Settings",
      description: "Platform configuration",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-500",
      stats: null,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#C8A661' }}>
            Admin Control Center
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Full control over every aspect of WashBizHub
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-stats"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.revenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || '0'}</div>
            <p className="text-xs text-muted-foreground">+180 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.subscribers || '0'}</div>
            <p className="text-xs text-muted-foreground">+12% growth</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Items</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContent || '0'}</div>
            <p className="text-xs text-muted-foreground">Across all modules</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {modules.map((module) => (
          <a
            key={module.href}
            href={module.href}
            className="block"
            data-testid={`link-admin-${module.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Card className="hover-elevate active-elevate-2 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <module.icon className={`h-8 w-8 ${module.color}`} />
                  {module.stats !== null && (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {module.stats}
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
