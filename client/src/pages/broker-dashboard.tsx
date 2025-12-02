import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  DollarSign, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  FileText,
  Award
} from "lucide-react";
import { Link } from "wouter";
import type { Listing, BrokerProfile } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ListingWithStats extends Listing {
  daysListed?: number;
  performanceScore?: number;
}

export default function BrokerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Fetch broker profile
  const { data: brokerProfile, isLoading: profileLoading } = useQuery<BrokerProfile>({
    queryKey: ["/api/broker/profile"],
    enabled: !!user,
  });

  // Fetch broker's listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery<ListingWithStats[]>({
    queryKey: ["/api/broker/listings"],
    enabled: !!user,
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await apiRequest("DELETE", `/api/listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/broker/profile"] });
      toast({
        title: "Listing deleted",
        description: "The listing has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = authLoading || profileLoading || listingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === "active");
  const draftListings = listings.filter(l => l.status === "draft");
  const soldListings = listings.filter(l => l.status === "sold");
  const totalViews = listings.reduce((sum, l) => sum + (l.viewCount || 0), 0);
  const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiryCount || 0), 0);
  const avgDaysToSell = brokerProfile?.averageDaysToSell || 0;

  return (
    <AuthGuard 
      title="Sign In to Access Broker Dashboard" 
      description="Sign in to access your dashboard."
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-8 h-8" />
                <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
                  Broker Dashboard
                </h1>
                {brokerProfile?.verified && (
                  <Badge className="bg-accent text-accent-foreground">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg text-primary-foreground/90">
                {brokerProfile?.companyName || user.firstName + " " + user.lastName}
              </p>
            </div>
            <Link href="/listings/create">
              <Button size="lg" variant="secondary" data-testid="button-create-listing">
                <Plus className="w-5 h-5 mr-2" />
                New Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-stat-active">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeListings.length}</div>
              <p className="text-xs text-muted-foreground">
                {draftListings.length} drafts
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-views">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all listings
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-inquiries">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInquiries}</div>
              <p className="text-xs text-muted-foreground">
                Potential buyers
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-performance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Days to Sell</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDaysToSell}</div>
              <p className="text-xs text-muted-foreground">
                {soldListings.length} sold
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Listings Management */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({activeListings.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" data-testid="tab-drafts">
              Drafts ({draftListings.length})
            </TabsTrigger>
            <TabsTrigger value="sold" data-testid="tab-sold">
              Sold ({soldListings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active listings</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first listing to start selling
                  </p>
                  <Link href="/listings/create">
                    <Button data-testid="button-create-first-listing">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeListings.map((listing) => (
                  <Card key={listing.id} className="hover-elevate" data-testid={`card-listing-${listing.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{listing.title}</CardTitle>
                            {listing.featured && (
                              <Badge variant="default">
                                <Award className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            {listing.city}, {listing.region} • {listing.country}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            ${Number(listing.priceInUSD || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {listing.currency !== "USD" && `(${listing.currency} ${Number(listing.priceOriginal || 0).toLocaleString()})`}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <Eye className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                          <div className="text-sm font-semibold">{listing.viewCount || 0}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                          <div className="text-sm font-semibold">{listing.inquiryCount || 0}</div>
                          <div className="text-xs text-muted-foreground">Inquiries</div>
                        </div>
                        <div className="text-center">
                          <FileText className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                          <div className="text-sm font-semibold">{listing.ndaRequestCount || 0}</div>
                          <div className="text-xs text-muted-foreground">NDAs</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/listings/${listing.slug}`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm" data-testid={`button-view-${listing.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/listings/${listing.id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm" data-testid={`button-edit-${listing.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteListingMutation.mutate(listing.id)}
                          disabled={deleteListingMutation.isPending}
                          data-testid={`button-delete-${listing.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            {draftListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No draft listings</h3>
                  <p className="text-muted-foreground">
                    All your listings are either active or sold
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {draftListings.map((listing) => (
                  <Card key={listing.id} className="hover-elevate" data-testid={`card-draft-${listing.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{listing.title}</CardTitle>
                          <CardDescription>Draft • Not yet published</CardDescription>
                        </div>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Draft
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link href={`/listings/${listing.id}/edit`} className="flex-1">
                          <Button className="w-full" size="sm" data-testid={`button-edit-draft-${listing.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Continue Editing
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteListingMutation.mutate(listing.id)}
                          disabled={deleteListingMutation.isPending}
                          data-testid={`button-delete-draft-${listing.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sold" className="space-y-4">
            {soldListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sold listings yet</h3>
                  <p className="text-muted-foreground">
                    Your sold listings will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {soldListings.map((listing) => (
                  <Card key={listing.id} data-testid={`card-sold-${listing.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{listing.title}</CardTitle>
                          <CardDescription>
                            Sold • {listing.soldAt ? new Date(listing.soldAt).toLocaleDateString() : "Recently"}
                          </CardDescription>
                        </div>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Sold
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-primary mb-2">
                        ${Number(listing.priceInUSD || 0).toLocaleString()}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Views</div>
                          <div className="font-semibold">{listing.viewCount || 0}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Inquiries</div>
                          <div className="font-semibold">{listing.inquiryCount || 0}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Days Listed</div>
                          <div className="font-semibold">{listing.daysListed || "N/A"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Profile Card */}
        {brokerProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Broker Profile</CardTitle>
              <CardDescription>Your business information and credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Company Name</div>
                  <div className="font-semibold">{brokerProfile.companyName}</div>
                </div>
                {brokerProfile.licenseNumber && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">License Number</div>
                    <div className="font-semibold">{brokerProfile.licenseNumber}</div>
                  </div>
                )}
                {brokerProfile.yearsExperience && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Years of Experience</div>
                    <div className="font-semibold">{brokerProfile.yearsExperience} years</div>
                  </div>
                )}
                {brokerProfile.specializations && brokerProfile.specializations.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Specializations</div>
                    <div className="flex flex-wrap gap-1">
                      {brokerProfile.specializations.map((spec) => (
                        <Badge key={spec} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Link href="/broker/profile/edit">
                  <Button variant="outline" data-testid="button-edit-profile">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
