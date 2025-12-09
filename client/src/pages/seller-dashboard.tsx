import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DashboardShell,
  DashboardSection,
  KPICard,
  KPIGroup,
  ChartCard,
  DashboardNav,
} from "@/components/dashboard";
import { getNavItemsForRole } from "@/lib/dashboard-nav-config";
import {
  Building2,
  Plus,
  Eye,
  MessageSquare,
  FileText,
  TrendingUp,
  Crown,
  Star,
  Zap,
  Diamond,
  MoreVertical,
  Edit,
  Pause,
  Play,
  Rocket,
  Trash2,
  BarChart3,
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Listing } from "@shared/schema";

interface TierBenefits {
  mediaLimit: number;
  videoLimit: number;
  featured: boolean;
  prioritySearch: boolean;
  analytics: boolean;
  homepageCarousel?: boolean;
}

interface MyListingsResponse {
  listings: Listing[];
  summary: {
    totalListings: number;
    activeListings: number;
    draftListings: number;
    soldListings: number;
    totalViews: number;
    totalInquiries: number;
    totalNdaRequests: number;
    highestTier: string;
  };
  topPerforming: Listing[];
  tierBenefits: Record<string, TierBenefits>;
}


const TIER_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string; price?: number }> = {
  free: { label: "Free", icon: Star, color: "text-gray-400", bgColor: "bg-gray-500/10" },
  basic: { label: "Basic", icon: Zap, color: "text-blue-400", bgColor: "bg-blue-500/10", price: 65 },
  showcase: { label: "Showcase", icon: Crown, color: "text-[#C8A661]", bgColor: "bg-[#C8A661]/10", price: 89 },
  diamond: { label: "Diamond", icon: Diamond, color: "text-purple-400", bgColor: "bg-purple-500/10", price: 199 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: "Active", color: "text-green-600", bgColor: "bg-green-500/10" },
  draft: { label: "Draft", color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  pending: { label: "Pending", color: "text-blue-600", bgColor: "bg-blue-500/10" },
  sold: { label: "Sold", color: "text-purple-600", bgColor: "bg-purple-500/10" },
  expired: { label: "Expired", color: "text-red-600", bgColor: "bg-red-500/10" },
};

const mockPerformanceData = [
  { date: "Week 1", views: 45, inquiries: 3 },
  { date: "Week 2", views: 78, inquiries: 5 },
  { date: "Week 3", views: 120, inquiries: 8 },
  { date: "Week 4", views: 95, inquiries: 6 },
  { date: "Week 5", views: 150, inquiries: 12 },
  { date: "Week 6", views: 180, inquiries: 15 },
];

function formatPrice(price: string | null | undefined): string {
  if (!price) return "Call for Price";
  const num = parseFloat(price);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

export default function SellerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  const { data, isLoading: dataLoading } = useQuery<MyListingsResponse>({
    queryKey: ["/api/dashboard/my-listings"],
    enabled: !!user,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ listingId, newStatus }: { listingId: string; newStatus: string }) => {
      await apiRequest("PUT", `/api/listings/${listingId}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/my-listings"] });
      toast({ title: "Status updated", description: "Listing status has been changed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update listing status.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await apiRequest("DELETE", `/api/listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/my-listings"] });
      toast({ title: "Listing deleted", description: "Your listing has been removed." });
      setListingToDelete(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete listing.", variant: "destructive" });
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ listingId, tierId }: { listingId: string; tierId: string }) => {
      const response = await apiRequest("POST", `/api/listings/${listingId}/subscribe`, { tierId });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start subscription checkout.", variant: "destructive" });
    },
  });

  const listings = data?.listings || [];
  const summary = data?.summary || {
    totalListings: 0,
    activeListings: 0,
    draftListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalNdaRequests: 0,
    highestTier: "free",
  };

  const currentTier = summary.highestTier || "free";
  const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG.free;
  const TierIcon = tierConfig.icon;

  const recentActivity = [
    { id: 1, type: "view", message: "New view on 'Premium Laundromat'", time: "5 min ago", icon: Eye },
    { id: 2, type: "inquiry", message: "Inquiry from interested buyer", time: "2 hours ago", icon: MessageSquare },
    { id: 3, type: "nda", message: "NDA request submitted", time: "1 day ago", icon: FileText },
    { id: 4, type: "view", message: "Your listing is trending", time: "2 days ago", icon: TrendingUp },
  ];

  return (
    <AuthGuard
      title="Sign In to Access Seller Portal"
      description="Sign in to manage your listings and connect with buyers."
    >
      <SEO
        title="Seller Portal | Manage Your Listings | WashBizHub"
        description="Manage your business listings, view analytics, and connect with qualified buyers on WashBizHub."
        canonicalUrl="/seller-dashboard"
      />

      <DashboardShell
        title="Seller Dashboard"
        subtitle="Manage listings, track performance, and connect with buyers"
        showDatePicker={false}
        showExportButtons={false}
        headerActions={
          <div className="flex items-center gap-2">
            <DashboardNav 
              items={getNavItemsForRole(user?.role)} 
              variant="dropdown" 
              className="hidden md:flex"
            />
            <Badge className={`${tierConfig.bgColor} ${tierConfig.color} border-0 gap-1`} data-testid="badge-tier">
              <TierIcon className="w-3.5 h-3.5" />
              {tierConfig.label}
            </Badge>
            <Link href="/listing-form">
              <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-create-listing">
                <Plus className="w-4 h-4 mr-1.5" />
                New Listing
              </Button>
            </Link>
          </div>
        }
      >
        <DashboardSection className="mb-8">
          <KPIGroup>
            <KPICard
              value={summary.activeListings}
              label="Active Listings"
              icon={Building2}
              variant="gold"
              subtitle={`${summary.draftListings} drafts`}
            />
            <KPICard
              value={summary.totalViews}
              label="Total Views"
              icon={Eye}
              variant="default"
              trend={{ value: 12.5, direction: "up", label: "vs last month" }}
            />
            <KPICard
              value={summary.totalInquiries}
              label="Inquiries"
              icon={MessageSquare}
              variant="default"
              subtitle="Buyer messages"
            />
            <KPICard
              value={summary.totalNdaRequests}
              label="NDA Requests"
              icon={FileText}
              variant="success"
              subtitle="Serious buyers"
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
                  <p className="text-sm text-muted-foreground">Manage your listings efficiently</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/listing-form">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-add">
                    <Plus className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Add Listing</span>
                  </Button>
                </Link>
                <Link href="/seller-dashboard?tab=messages">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-messages">
                    <MessageSquare className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Messages</span>
                  </Button>
                </Link>
                <Link href="/seller-dashboard?tab=analytics">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-analytics">
                    <BarChart3 className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Analytics</span>
                  </Button>
                </Link>
                <Link href="/account-subscription">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-upgrade">
                    <Rocket className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Boost Visibility</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ChartCard
              title="Listing Performance"
              subtitle="Views and inquiries over time"
              minHeight="280px"
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={mockPerformanceData}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A1628" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0A1628" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="inquiriesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8A661" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8A661" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#0A1628"
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                    name="Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="inquiries"
                    stroke="#C8A661"
                    fill="url(#inquiriesGradient)"
                    strokeWidth={2}
                    name="Inquiries"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
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
                            activity.type === "inquiry" ? "bg-green-500/10" :
                            activity.type === "nda" ? "bg-purple-500/10" :
                            "bg-blue-500/10"
                          }`}>
                            <activity.icon className={`h-4 w-4 ${
                              activity.type === "inquiry" ? "text-green-600" :
                              activity.type === "nda" ? "text-purple-600" :
                              "text-blue-600"
                            }`} />
                          </div>
                          {index < recentActivity.length - 1 && (
                            <div className="absolute top-8 left-4 w-px h-full bg-border -translate-x-1/2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-4">
                          <p className="text-sm text-foreground line-clamp-2">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
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
          title="Your Listings"
          description="Manage and track all your property listings"
          action={
            <Link href="/listing-form">
              <Button size="sm" className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white" data-testid="button-new-listing">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Listing
              </Button>
            </Link>
          }
        >
          {listings.length === 0 ? (
            <Card className="bg-card border shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Listings Yet</h3>
                <p className="text-muted-foreground mb-6">Create your first listing to start reaching buyers.</p>
                <Link href="/listing-form">
                  <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-create-first-listing">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Listing</TableHead>
                      <TableHead className="text-muted-foreground">Price</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Tier</TableHead>
                      <TableHead className="text-muted-foreground text-center">Views</TableHead>
                      <TableHead className="text-muted-foreground text-center">Inquiries</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => {
                      const listingTier = listing.subscriptionTier || "free";
                      const listingTierConfig = TIER_CONFIG[listingTier] || TIER_CONFIG.free;
                      const ListingTierIcon = listingTierConfig.icon;
                      const statusConfig = STATUS_CONFIG[listing.status] || STATUS_CONFIG.draft;

                      return (
                        <TableRow key={listing.id} className="border-border hover:bg-muted/30" data-testid={`row-listing-${listing.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {listing.featuredImage ? (
                                  <img src={listing.featuredImage} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link href={`/listing/${listing.slug || listing.id}`}>
                                  <p className="font-medium text-foreground truncate max-w-[200px] hover:text-[#C8A661] cursor-pointer">
                                    {listing.title}
                                  </p>
                                </Link>
                                <p className="text-xs text-muted-foreground">{listing.city}, {listing.region}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-foreground font-medium">{formatPrice(listing.priceInUSD)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${listingTierConfig.bgColor} ${listingTierConfig.color} border-0 gap-1`}>
                              <ListingTierIcon className="w-3 h-3" />
                              {listingTierConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-foreground">{listing.viewCount || 0}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-foreground">{listing.inquiryCount || 0}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" data-testid={`button-actions-${listing.id}`}>
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border">
                                <Link href={`/listing-form?edit=${listing.id}`}>
                                  <DropdownMenuItem className="cursor-pointer" data-testid={`action-edit-${listing.id}`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Listing
                                  </DropdownMenuItem>
                                </Link>
                                {listing.status === "active" ? (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => toggleStatusMutation.mutate({ listingId: listing.id, newStatus: "draft" })}
                                    data-testid={`action-pause-${listing.id}`}
                                  >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause Listing
                                  </DropdownMenuItem>
                                ) : listing.status === "draft" ? (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => toggleStatusMutation.mutate({ listingId: listing.id, newStatus: "active" })}
                                    data-testid={`action-activate-${listing.id}`}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Activate Listing
                                  </DropdownMenuItem>
                                ) : null}
                                {listingTier !== "diamond" && (
                                  <DropdownMenuItem
                                    className="text-[#C8A661] cursor-pointer"
                                    onClick={() => {
                                      const nextTier = listingTier === "free" ? "basic" : listingTier === "basic" ? "showcase" : "diamond";
                                      subscribeMutation.mutate({ listingId: listing.id, tierId: nextTier });
                                    }}
                                    data-testid={`action-boost-${listing.id}`}
                                  >
                                    <Rocket className="w-4 h-4 mr-2" />
                                    Boost Tier
                                  </DropdownMenuItem>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="text-red-600 cursor-pointer"
                                      onSelect={(e) => e.preventDefault()}
                                      data-testid={`action-delete-${listing.id}`}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Listing
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-card border">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your listing.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteMutation.mutate(listing.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </DashboardSection>
      </DashboardShell>
    </AuthGuard>
  );
}
