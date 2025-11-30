import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  Lock,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
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
  showcase: { label: "Showcase", icon: Crown, color: "text-[#d4af37]", bgColor: "bg-[#d4af37]/10", price: 89 },
  diamond: { label: "Diamond", icon: Diamond, color: "text-purple-400", bgColor: "bg-purple-500/10", price: 199 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: "Active", color: "text-green-400", bgColor: "bg-green-500/10" },
  draft: { label: "Draft", color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
  pending: { label: "Pending", color: "text-blue-400", bgColor: "bg-blue-500/10" },
  sold: { label: "Sold", color: "text-purple-400", bgColor: "bg-purple-500/10" },
  expired: { label: "Expired", color: "text-red-400", bgColor: "bg-red-500/10" },
};

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
  const [activeTab, setActiveTab] = useState("listings");
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  const { data, isLoading: dataLoading } = useQuery<MyListingsResponse>({
    queryKey: ["/api/dashboard/my-listings"],
    enabled: !!user,
  });

  const { data: tierBenefitsData } = useQuery<Record<string, TierBenefits>>({
    queryKey: ["/api/listings/tier-benefits"],
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

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1526] to-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-96" />
          <div className="grid md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1526] to-background flex items-center justify-center">
        <Card className="max-w-md bg-[#0b1526]/80 border-[#d4af37]/20">
          <CardHeader>
            <CardTitle className="text-white">Authentication Required</CardTitle>
            <CardDescription>Please log in to access your seller dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/api/login">
              <Button className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0b1526]" data-testid="button-login">
                Log In to Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

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
  const topPerforming = data?.topPerforming || [];
  const tierBenefits = tierBenefitsData || data?.tierBenefits || {};

  const currentTier = summary.highestTier || "free";
  const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG.free;
  const TierIcon = tierConfig.icon;

  const canAccessAnalytics = currentTier !== "free";

  return (
    <>
      <SEO
        title="Seller Dashboard | Manage Your Listings | WashBizHub"
        description="Manage your business listings, view analytics, and upgrade your subscription on WashBizHub."
        canonicalUrl="/seller-dashboard"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0b1526] to-background">
        <div
          className="relative py-12 bg-gradient-to-br from-[#0b1526] via-[#142040] to-[#0b1526] overflow-hidden border-b border-[#d4af37]/20"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#d4af37] rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-8 h-8 text-[#d4af37]" />
                  <h1 className="text-3xl sm:text-4xl font-bold text-white" data-testid="text-dashboard-title">
                    Seller Dashboard
                  </h1>
                  <Badge className={`${tierConfig.bgColor} ${tierConfig.color} border-0 gap-1`} data-testid="badge-tier">
                    <TierIcon className="w-3.5 h-3.5" />
                    {tierConfig.label}
                  </Badge>
                </div>
                <p className="text-white/70">
                  Manage your listings, view performance, and grow your business
                </p>
              </div>
              <Link href="/add-listing">
                <Button
                  size="lg"
                  className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0b1526] font-bold"
                  data-testid="button-create-listing"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-[#0b1526]/50 border-white/10" data-testid="card-stat-listings">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Listings</CardTitle>
                <Building2 className="h-4 w-4 text-[#d4af37]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summary.totalListings}</div>
                <p className="text-xs text-white/50">
                  {summary.activeListings} active, {summary.draftListings} draft
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0b1526]/50 border-white/10" data-testid="card-stat-views">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-[#d4af37]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summary.totalViews.toLocaleString()}</div>
                <p className="text-xs text-white/50">Across all listings</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0b1526]/50 border-white/10" data-testid="card-stat-inquiries">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Inquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-[#d4af37]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summary.totalInquiries.toLocaleString()}</div>
                <p className="text-xs text-white/50">Buyer messages</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0b1526]/50 border-white/10" data-testid="card-stat-nda">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">NDA Requests</CardTitle>
                <FileText className="h-4 w-4 text-[#d4af37]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summary.totalNdaRequests.toLocaleString()}</div>
                <p className="text-xs text-white/50">Serious buyers</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#0b1526]/80 border border-white/10">
              <TabsTrigger
                value="listings"
                className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0b1526]"
                data-testid="tab-listings"
              >
                <Building2 className="w-4 h-4 mr-2" />
                My Listings
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0b1526]"
                data-testid="tab-analytics"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0b1526]"
                data-testid="tab-subscription"
              >
                <Crown className="w-4 h-4 mr-2" />
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-6" data-testid="content-listings">
              {listings.length === 0 ? (
                <Card className="bg-[#0b1526]/50 border-white/10">
                  <CardContent className="py-16 text-center">
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-white/30" />
                    <h3 className="text-xl font-bold text-white mb-2">No Listings Yet</h3>
                    <p className="text-white/60 mb-6">
                      Create your first listing to start reaching buyers.
                    </p>
                    <Link href="/add-listing">
                      <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0b1526]" data-testid="button-create-first-listing">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Listing
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#0b1526]/50 border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white/70">Listing</TableHead>
                          <TableHead className="text-white/70">Price</TableHead>
                          <TableHead className="text-white/70">Status</TableHead>
                          <TableHead className="text-white/70">Tier</TableHead>
                          <TableHead className="text-white/70 text-center">Views</TableHead>
                          <TableHead className="text-white/70 text-center">Inquiries</TableHead>
                          <TableHead className="text-white/70 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {listings.map((listing) => {
                          const listingTier = listing.subscriptionTier || "free";
                          const listingTierConfig = TIER_CONFIG[listingTier] || TIER_CONFIG.free;
                          const ListingTierIcon = listingTierConfig.icon;
                          const statusConfig = STATUS_CONFIG[listing.status] || STATUS_CONFIG.draft;

                          return (
                            <TableRow
                              key={listing.id}
                              className="border-white/10 hover:bg-white/5"
                              data-testid={`row-listing-${listing.id}`}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {listing.featuredImage ? (
                                      <img
                                        src={listing.featuredImage}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon className="w-5 h-5 text-white/30" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <Link href={`/listing/${listing.slug || listing.id}`}>
                                      <p className="font-medium text-white truncate max-w-[200px] hover:text-[#d4af37] cursor-pointer">
                                        {listing.title}
                                      </p>
                                    </Link>
                                    <p className="text-xs text-white/50">
                                      {listing.city}, {listing.region}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-white font-medium">
                                  {formatPrice(listing.priceInUSD)}
                                </span>
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
                                <span className="text-white">{listing.viewCount || 0}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-white">{listing.inquiryCount || 0}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-white/70 hover:text-white hover:bg-white/10"
                                      data-testid={`button-actions-${listing.id}`}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-[#0b1526] border-white/20">
                                    <Link href={`/listing-form?edit=${listing.id}`}>
                                      <DropdownMenuItem
                                        className="text-white hover:bg-white/10 cursor-pointer"
                                        data-testid={`action-edit-${listing.id}`}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Listing
                                      </DropdownMenuItem>
                                    </Link>
                                    {listing.status === "active" ? (
                                      <DropdownMenuItem
                                        className="text-white hover:bg-white/10 cursor-pointer"
                                        onClick={() =>
                                          toggleStatusMutation.mutate({ listingId: listing.id, newStatus: "draft" })
                                        }
                                        data-testid={`action-pause-${listing.id}`}
                                      >
                                        <Pause className="w-4 h-4 mr-2" />
                                        Pause Listing
                                      </DropdownMenuItem>
                                    ) : listing.status === "draft" ? (
                                      <DropdownMenuItem
                                        className="text-white hover:bg-white/10 cursor-pointer"
                                        onClick={() =>
                                          toggleStatusMutation.mutate({ listingId: listing.id, newStatus: "active" })
                                        }
                                        data-testid={`action-activate-${listing.id}`}
                                      >
                                        <Play className="w-4 h-4 mr-2" />
                                        Activate Listing
                                      </DropdownMenuItem>
                                    ) : null}
                                    {listingTier !== "diamond" && (
                                      <DropdownMenuItem
                                        className="text-[#d4af37] hover:bg-[#d4af37]/10 cursor-pointer"
                                        onClick={() => {
                                          const nextTier =
                                            listingTier === "free"
                                              ? "basic"
                                              : listingTier === "basic"
                                              ? "showcase"
                                              : "diamond";
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
                                          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                          onSelect={(e) => e.preventDefault()}
                                          data-testid={`action-delete-${listing.id}`}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete Listing
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-[#0b1526] border-white/20">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-white">Delete Listing?</AlertDialogTitle>
                                          <AlertDialogDescription className="text-white/70">
                                            This action cannot be undone. This will permanently delete "{listing.title}" and remove all associated data.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-500 hover:bg-red-600"
                                            onClick={() => deleteMutation.mutate(listing.id)}
                                            data-testid={`confirm-delete-${listing.id}`}
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
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6" data-testid="content-analytics">
              {!canAccessAnalytics ? (
                <Card className="bg-[#0b1526]/50 border-white/10">
                  <CardContent className="py-16 text-center">
                    <div className="relative inline-block mb-6">
                      <BarChart3 className="w-20 h-20 text-white/20" />
                      <div className="absolute -top-2 -right-2 bg-[#d4af37] rounded-full p-2">
                        <Lock className="w-4 h-4 text-[#0b1526]" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Unlock Advanced Analytics</h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      Upgrade to Basic tier or higher to access detailed analytics, view trends, and track your listing performance.
                    </p>
                    <Button
                      className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0b1526]"
                      onClick={() => setActiveTab("subscription")}
                      data-testid="button-upgrade-analytics"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Unlock
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-[#0b1526]/50 border-white/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          30-Day Views
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-white">{summary.totalViews.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-green-400 text-sm mt-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>+12% from last month</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0b1526]/50 border-white/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Conversion Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-white">
                          {summary.totalViews > 0
                            ? ((summary.totalInquiries / summary.totalViews) * 100).toFixed(1)
                            : 0}%
                        </div>
                        <p className="text-white/50 text-sm mt-1">Views to inquiries</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0b1526]/50 border-white/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          NDA Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-white">
                          {summary.totalInquiries > 0
                            ? ((summary.totalNdaRequests / summary.totalInquiries) * 100).toFixed(1)
                            : 0}%
                        </div>
                        <p className="text-white/50 text-sm mt-1">Serious buyer signals</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-[#0b1526]/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#d4af37]" />
                        Top Performing Listings
                      </CardTitle>
                      <CardDescription className="text-white/50">
                        Your best listings by engagement
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {topPerforming.length === 0 ? (
                        <p className="text-white/50 text-center py-8">No performance data yet</p>
                      ) : (
                        <div className="space-y-4">
                          {topPerforming.map((listing, index) => (
                            <div
                              key={listing.id}
                              className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
                              data-testid={`top-listing-${listing.id}`}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{listing.title}</p>
                                <p className="text-sm text-white/50">
                                  {listing.city}, {listing.region}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-medium">{listing.viewCount || 0} views</p>
                                <p className="text-sm text-white/50">{listing.inquiryCount || 0} inquiries</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6" data-testid="content-subscription">
              <Card className="bg-gradient-to-br from-[#d4af37]/10 to-transparent border-[#d4af37]/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${tierConfig.bgColor}`}>
                      <TierIcon className={`w-6 h-6 ${tierConfig.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-white">Current Plan: {tierConfig.label}</CardTitle>
                      <CardDescription className="text-white/60">
                        {currentTier === "free"
                          ? "Upgrade to unlock premium features"
                          : "Thank you for being a premium seller"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                      <span>{tierBenefits[currentTier]?.mediaLimit || 5} Photos</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                      <span>{tierBenefits[currentTier]?.videoLimit || 0} Videos</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      {tierBenefits[currentTier]?.featured ? (
                        <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                      ) : (
                        <Lock className="w-4 h-4 text-white/30" />
                      )}
                      <span className={tierBenefits[currentTier]?.featured ? "" : "text-white/40"}>Featured Badge</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      {tierBenefits[currentTier]?.analytics ? (
                        <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                      ) : (
                        <Lock className="w-4 h-4 text-white/30" />
                      )}
                      <span className={tierBenefits[currentTier]?.analytics ? "" : "text-white/40"}>
                        Analytics Access
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                {(["basic", "showcase", "diamond"] as const).map((tier) => {
                  const config = TIER_CONFIG[tier];
                  const benefits = tierBenefits[tier] || {};
                  const Icon = config.icon;
                  const isCurrentTier = currentTier === tier;
                  const isHigherTier =
                    ["basic", "showcase", "diamond"].indexOf(tier) >
                    ["free", "basic", "showcase", "diamond"].indexOf(currentTier);

                  return (
                    <Card
                      key={tier}
                      className={`relative overflow-hidden ${
                        tier === "showcase"
                          ? "border-[#d4af37]/50 bg-gradient-to-br from-[#d4af37]/10 to-transparent"
                          : "bg-[#0b1526]/50 border-white/10"
                      }`}
                      data-testid={`card-tier-${tier}`}
                    >
                      {tier === "showcase" && (
                        <div className="absolute top-0 right-0 bg-[#d4af37] text-[#0b1526] text-xs font-bold px-3 py-1 rounded-bl-lg">
                          POPULAR
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <div className={`w-12 h-12 mx-auto rounded-xl ${config.bgColor} flex items-center justify-center mb-2`}>
                          <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <CardTitle className="text-white">{config.label}</CardTitle>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-white">${config.price}</span>
                          <span className="text-white/50">/mo</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                            <span>Up to {benefits.mediaLimit || 15} photos</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                            <span>{benefits.videoLimit || 2} video uploads</span>
                          </div>
                          {benefits.featured && (
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                              <span>Featured badge</span>
                            </div>
                          )}
                          {benefits.prioritySearch && (
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                              <span>Priority in search</span>
                            </div>
                          )}
                          {benefits.analytics && (
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                              <span>Advanced analytics</span>
                            </div>
                          )}
                          {(benefits as TierBenefits).homepageCarousel && (
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                              <span>Homepage carousel</span>
                            </div>
                          )}
                        </div>
                        <Button
                          className={`w-full ${
                            isCurrentTier
                              ? "bg-white/10 text-white cursor-default"
                              : tier === "showcase"
                              ? "bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0b1526]"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                          disabled={isCurrentTier || !isHigherTier || listings.length === 0}
                          onClick={() => {
                            if (listings.length > 0 && isHigherTier) {
                              subscribeMutation.mutate({ listingId: listings[0].id, tierId: tier });
                            }
                          }}
                          data-testid={`button-upgrade-${tier}`}
                        >
                          {isCurrentTier ? (
                            "Current Plan"
                          ) : !isHigherTier ? (
                            "Already Higher"
                          ) : listings.length === 0 ? (
                            "Create a Listing First"
                          ) : (
                            <>
                              Upgrade to {config.label}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-[#0b1526]/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Tier Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white/70">Feature</TableHead>
                          <TableHead className="text-white/70 text-center">Free</TableHead>
                          <TableHead className="text-white/70 text-center">Basic ($65)</TableHead>
                          <TableHead className="text-white/70 text-center">Showcase ($89)</TableHead>
                          <TableHead className="text-white/70 text-center">Diamond ($199)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-white/10">
                          <TableCell className="text-white">Photo Uploads</TableCell>
                          <TableCell className="text-center text-white/70">5</TableCell>
                          <TableCell className="text-center text-white/70">15</TableCell>
                          <TableCell className="text-center text-white/70">30</TableCell>
                          <TableCell className="text-center text-[#d4af37]">Unlimited</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10">
                          <TableCell className="text-white">Video Uploads</TableCell>
                          <TableCell className="text-center text-white/70">0</TableCell>
                          <TableCell className="text-center text-white/70">2</TableCell>
                          <TableCell className="text-center text-white/70">5</TableCell>
                          <TableCell className="text-center text-[#d4af37]">20</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10">
                          <TableCell className="text-white">Featured Badge</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center text-green-400">✓</TableCell>
                          <TableCell className="text-center text-green-400">✓</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10">
                          <TableCell className="text-white">Priority Search</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center text-green-400">✓</TableCell>
                          <TableCell className="text-center text-green-400">✓</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10">
                          <TableCell className="text-white">Analytics</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center text-green-400">✓</TableCell>
                          <TableCell className="text-center text-green-400">✓</TableCell>
                          <TableCell className="text-center text-green-400">✓</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10">
                          <TableCell className="text-white">Homepage Carousel</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center text-green-400">✓</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
