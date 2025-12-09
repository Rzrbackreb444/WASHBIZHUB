import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { 
  DashboardShell, 
  DashboardSection, 
  KPICard,
  KPIGroup,
  DashboardNav
} from "@/components/dashboard";
import { 
  Heart, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Search,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  MapPin,
  Building2,
  Sparkles,
  Phone,
  Eye,
  Settings,
  Activity,
  Target,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedSearch, BuyerMessageThread } from "@shared/schema";
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const navItems = [
  { id: "overview", label: "Overview", href: "/buyer-dashboard", icon: BarChart3 },
  { id: "searches", label: "Saved Searches", href: "/buyer-dashboard?tab=searches", icon: Search },
  { id: "watchlist", label: "Watchlist", href: "/buyer-dashboard?tab=watchlist", icon: Heart },
  { id: "messages", label: "Messages", href: "/buyer-dashboard?tab=messages", icon: MessageSquare },
  { id: "analytics", label: "Analytics", href: "/buyer-dashboard?tab=analytics", icon: Activity },
];

const mockActivityData = [
  { date: "Mon", views: 12, saves: 3 },
  { date: "Tue", views: 19, saves: 5 },
  { date: "Wed", views: 15, saves: 2 },
  { date: "Thu", views: 25, saves: 8 },
  { date: "Fri", views: 22, saves: 6 },
  { date: "Sat", views: 30, saves: 10 },
  { date: "Sun", views: 18, saves: 4 },
];

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNewSearchDialog, setShowNewSearchDialog] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/buyer/dashboard-stats"],
    enabled: !!user
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/buyer/favorites"],
    enabled: !!user
  });

  const { data: searches = [] } = useQuery({
    queryKey: ["/api/buyer/saved-searches"],
    enabled: !!user
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/buyer/messages/threads"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/buyer/messages/threads?role=buyer");
      return res.json();
    }
  });

  const { data: comparisons = [] } = useQuery({
    queryKey: ["/api/buyer/comparisons"],
    enabled: !!user
  });

  const { data: recommendedListings = [] } = useQuery({
    queryKey: ["/api/listings/recommended"],
    enabled: !!user
  });

  const deleteSearchMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/buyer/saved-searches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/saved-searches"] });
      toast({ title: "Search deleted" });
    }
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await apiRequest("DELETE", `/api/buyer/favorites/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/favorites"] });
      toast({ title: "Removed from watchlist" });
    }
  });

  const recentActivity = [
    { id: 1, type: "view", message: "Viewed 'Premium Laundromat in Austin'", time: "2 hours ago", icon: Eye },
    { id: 2, type: "save", message: "Saved search 'High ROI Texas Properties'", time: "5 hours ago", icon: Heart },
    { id: 3, type: "analysis", message: "Ran CLEANBI analysis on 3 locations", time: "1 day ago", icon: BarChart3 },
    { id: 4, type: "message", message: "New message from seller 'LaundryPros LLC'", time: "2 days ago", icon: MessageSquare },
    { id: 5, type: "alert", message: "Price drop alert: Downtown LA Mat -$50K", time: "3 days ago", icon: TrendingDown },
  ];

  return (
    <AuthGuard 
      title="Sign In to Access Buyer Command Center" 
      description="Sign in to access your premium buyer dashboard."
    >
      <SEO title="Buyer Command Center | WashBizHub" description="Your premium buyer dashboard - track listings, manage searches, and analyze opportunities" />
      
      <DashboardShell
        title="Buyer Command Center"
        subtitle="Track opportunities, manage searches, and close deals"
        showDatePicker={false}
        showExportButtons={false}
        headerActions={
          <DashboardNav 
            items={navItems} 
            variant="dropdown" 
            className="hidden md:flex"
          />
        }
      >
        <div className="md:hidden mb-6">
          <DashboardNav items={navItems} variant="tabs" />
        </div>

        <DashboardSection className="mb-8">
          <KPIGroup>
            <KPICard
              value={stats?.savedSearchesCount || searches.length || 0}
              label="Saved Searches"
              icon={Search}
              variant="gold"
              subtitle="Active alerts"
            />
            <KPICard
              value={stats?.favoritesCount || favorites.length || 0}
              label="Watched Listings"
              icon={Heart}
              variant="default"
              subtitle={`${stats?.priceChanges || 0} price changes`}
            />
            <KPICard
              value={stats?.cleanbiAnalyses || 0}
              label="CLEANBI Analyses"
              icon={BarChart3}
              variant="default"
              subtitle="Locations analyzed"
            />
            <KPICard
              value={stats?.preQualificationStatus || "Not Started"}
              label="Pre-Qualification"
              icon={ShieldCheck}
              variant={stats?.preQualificationStatus === "Approved" ? "success" : "warning"}
              formatValue={false}
            />
          </KPIGroup>
        </DashboardSection>

        <DashboardSection className="mb-8">
          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">Get started with common tasks</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Dialog open={showNewSearchDialog} onOpenChange={setShowNewSearchDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-new-search">
                      <Search className="h-5 w-5 text-[#0A1628]" />
                      <span className="text-sm font-medium">New Search</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border bg-card">
                    <DialogHeader>
                      <DialogTitle>Create Saved Search</DialogTitle>
                    </DialogHeader>
                    <SaveSearchForm onSuccess={() => setShowNewSearchDialog(false)} />
                  </DialogContent>
                </Dialog>
                
                <Link href="/cleanbi">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-cleanbi">
                    <BarChart3 className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">CLEANBI Analysis</span>
                  </Button>
                </Link>
                
                <Link href="/acquisitions-funding">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-prequalify">
                    <ShieldCheck className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Get Pre-Qualified</span>
                  </Button>
                </Link>
                
                <Link href="/brokers">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-contact-broker">
                    <Phone className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Contact Broker</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <DashboardSection 
              title="Recommended Listings" 
              description="Based on your search criteria and preferences"
              action={
                <Link href="/buy-laundromat">
                  <Button variant="ghost" size="sm" className="text-[#C8A661] hover:text-[#B8964F]" data-testid="button-view-all-listings">
                    View All <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              }
            >
              <div className="grid gap-4">
                {recommendedListings.length === 0 ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-card border shadow-sm hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-recommended-${i}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-24 h-20 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold text-foreground line-clamp-1">Sample Laundromat #{i}</h4>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" /> Austin, TX
                                  </p>
                                </div>
                                <Badge className="bg-[#C8A661]/10 text-[#C8A661] border-0 flex-shrink-0">
                                  92% Match
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-lg font-bold text-[#C8A661]">${(450 + i * 50).toLocaleString()}K</span>
                                <span className="text-sm text-muted-foreground">|</span>
                                <span className="text-sm text-muted-foreground">{15 + i}% ROI</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  recommendedListings.slice(0, 3).map((listing: any) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-recommended-${listing.id}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-24 h-20 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {listing.imageUrl ? (
                                <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                              ) : (
                                <Building2 className="h-8 w-8 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold text-foreground line-clamp-1">{listing.title}</h4>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" /> {listing.city}, {listing.region}
                                  </p>
                                </div>
                                {listing.matchScore && (
                                  <Badge className="bg-[#C8A661]/10 text-[#C8A661] border-0 flex-shrink-0">
                                    {listing.matchScore}% Match
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-lg font-bold text-[#C8A661]">${(listing.price / 1000).toFixed(0)}K</span>
                                {listing.roi && (
                                  <>
                                    <span className="text-sm text-muted-foreground">|</span>
                                    <span className="text-sm text-muted-foreground">{listing.roi}% ROI</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </DashboardSection>
          </div>

          <div className="lg:col-span-1">
            <DashboardSection title="Recent Activity">
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3" data-testid={`activity-item-${activity.id}`}>
                        <div className="relative">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === "save" ? "bg-rose-500/10" :
                            activity.type === "analysis" ? "bg-blue-500/10" :
                            activity.type === "message" ? "bg-green-500/10" :
                            activity.type === "alert" ? "bg-amber-500/10" :
                            "bg-muted/50"
                          }`}>
                            <activity.icon className={`h-4 w-4 ${
                              activity.type === "save" ? "text-rose-500" :
                              activity.type === "analysis" ? "text-blue-500" :
                              activity.type === "message" ? "text-green-500" :
                              activity.type === "alert" ? "text-amber-500" :
                              "text-muted-foreground"
                            }`} />
                          </div>
                          {index < recentActivity.length - 1 && (
                            <div className="absolute top-8 left-4 w-px h-full bg-border -translate-x-1/2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-4">
                          <p className="text-sm text-foreground line-clamp-2">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </DashboardSection>
          </div>
        </div>

        <DashboardSection 
          title="Your Saved Searches" 
          description="Get instant alerts when new listings match your criteria"
          action={
            <Dialog open={showNewSearchDialog} onOpenChange={setShowNewSearchDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white" data-testid="button-new-search">
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Search
                </Button>
              </DialogTrigger>
              <DialogContent className="border bg-card">
                <DialogHeader>
                  <DialogTitle>Create Saved Search</DialogTitle>
                </DialogHeader>
                <SaveSearchForm onSuccess={() => setShowNewSearchDialog(false)} />
              </DialogContent>
            </Dialog>
          }
          className="mb-8"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searches.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3 bg-card border shadow-sm">
                <CardContent className="py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Saved Searches Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create a saved search to get email alerts for new listings</p>
                  <Dialog open={showNewSearchDialog} onOpenChange={setShowNewSearchDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-create-first-search">
                        Create Your First Search
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border bg-card">
                      <DialogHeader>
                        <DialogTitle>Create Saved Search</DialogTitle>
                      </DialogHeader>
                      <SaveSearchForm onSuccess={() => setShowNewSearchDialog(false)} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              searches.map((search: SavedSearch) => (
                <Card key={search.id} className="bg-card border shadow-sm hover:shadow-md transition-shadow" data-testid={`card-search-${search.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center">
                          <Target className="h-4 w-4 text-[#C8A661]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground line-clamp-1">{search.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">{search.alertFrequency} alerts</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSearchMutation.mutate(search.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        data-testid="button-delete-search"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={search.isActive ? "default" : "secondary"} className={search.isActive ? "bg-green-500/10 text-green-600 border-0" : ""}>
                        {search.isActive ? "Active" : "Paused"}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-[#C8A661] hover:text-[#B8964F] h-8 px-2">
                        <Settings className="h-3.5 w-3.5 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DashboardSection>

        <DashboardSection 
          title="Watched Listings" 
          description="Track price and status changes on your favorite properties"
          action={
            <Link href="/buy-laundromat">
              <Button variant="ghost" size="sm" className="text-[#C8A661] hover:text-[#B8964F]" data-testid="button-browse-listings">
                Browse Listings <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          }
          className="mb-8"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3 xl:col-span-4 bg-card border shadow-sm">
                <CardContent className="py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Watched Listings</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add properties to your watchlist to track price and status changes</p>
                  <Link href="/buy-laundromat">
                    <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-start-browsing">
                      Start Browsing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              favorites.map((fav: any) => (
                <Card key={fav.id} className="bg-card border shadow-sm hover:shadow-md transition-shadow overflow-hidden" data-testid={`card-favorite-${fav.id}`}>
                  <div className="relative">
                    <div className="h-32 bg-muted/50 flex items-center justify-center">
                      {fav.listing?.imageUrl ? (
                        <img src={fav.listing.imageUrl} alt={fav.listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="h-10 w-10 text-muted-foreground/50" />
                      )}
                    </div>
                    {fav.priceChange && (
                      <Badge className={`absolute top-2 left-2 ${fav.priceChange < 0 ? "bg-green-500" : "bg-red-500"} text-white border-0`}>
                        {fav.priceChange < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                        ${Math.abs(fav.priceChange / 1000).toFixed(0)}K
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteFavoriteMutation.mutate(fav.listingId);
                      }}
                      className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white text-red-500"
                      data-testid="button-remove-favorite"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                  <Link href={`/listing/${fav.listing?.id}`}>
                    <CardContent className="p-3 cursor-pointer">
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1">{fav.listing?.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {fav.listing?.city}, {fav.listing?.region}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-[#C8A661]">
                          ${fav.listing?.price ? (fav.listing.price / 1000).toFixed(0) : "N/A"}K
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))
            )}
          </div>
        </DashboardSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Your Activity">
            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockActivityData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0A1628" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0A1628" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C8A661" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#C8A661" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Area type="monotone" dataKey="views" stroke="#0A1628" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                      <Area type="monotone" dataKey="saves" stroke="#C8A661" fillOpacity={1} fill="url(#colorSaves)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#0A1628]" />
                    <span className="text-sm text-muted-foreground">Listings Viewed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#C8A661]" />
                    <span className="text-sm text-muted-foreground">Listings Saved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DashboardSection>

          <DashboardSection 
            title="Messages"
            action={
              <Link href="/buyer-messaging">
                <Button variant="ghost" size="sm" className="text-[#C8A661] hover:text-[#B8964F]" data-testid="button-view-all-messages">
                  View All <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            }
          >
            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                {messages.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Contact sellers to start a conversation</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 4).map((thread: BuyerMessageThread) => (
                      <Link key={thread.id} href={`/buyer/messages/${thread.id}`}>
                        <div className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer" data-testid={`card-thread-${thread.id}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-foreground line-clamp-1">{thread.subject}</h4>
                                {thread.buyerUnreadCount > 0 && (
                                  <Badge className="bg-[#C8A661] text-[#0A1628] border-0 text-xs px-1.5 py-0">
                                    {thread.buyerUnreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{thread.lastMessagePreview}</p>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(thread.lastMessageAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </DashboardSection>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}

function SaveSearchForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/buyer/saved-searches", {
        name,
        filters: {},
        alertFrequency: frequency
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/saved-searches"] });
      toast({ title: "Search saved!" });
      setName("");
      onSuccess?.();
    }
  });

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="text-foreground">Search Name</Label>
        <Input
          placeholder="e.g., High ROI Properties in Texas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5"
          data-testid="input-search-name"
        />
      </div>
      <div>
        <Label className="text-foreground">Alert Frequency</Label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full mt-1.5 px-3 py-2 bg-background border rounded-md text-foreground"
          data-testid="select-frequency"
        >
          <option value="instant">Instant</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <Button
        onClick={() => mutation.mutate()}
        disabled={!name || mutation.isPending}
        className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
        data-testid="button-save-search"
      >
        {mutation.isPending ? "Saving..." : "Create Search"}
      </Button>
    </div>
  );
}
