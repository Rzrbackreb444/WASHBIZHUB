import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Building2, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  BarChart3,
  FileText,
  Award,
  Rocket,
  Users,
  Download,
  Phone,
  Mail,
  Calendar,
  ShoppingCart,
  Target,
  ExternalLink,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import type { Listing, BrokerProfile } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DashboardShell,
  KPICard,
  KPIGroup,
  ChartCard,
  DateRangePicker,
  DashboardNav,
  type DateRange,
} from "@/components/dashboard";
import { getNavItemsForRole } from "@/lib/dashboard-nav-config";
import { DashboardSkeleton } from "@/components/premium/skeletons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

interface ListingWithStats extends Listing {
  daysListed?: number;
  performanceScore?: number;
}

interface Inquiry {
  id: string;
  buyerName: string;
  email: string;
  phone?: string;
  listingTitle: string;
  listingId: string;
  message?: string;
  createdAt: Date;
  status: "new" | "contacted" | "qualified" | "closed";
}


const mockViewsData = [
  { date: "Dec 1", views: 45, inquiries: 3 },
  { date: "Dec 2", views: 52, inquiries: 4 },
  { date: "Dec 3", views: 38, inquiries: 2 },
  { date: "Dec 4", views: 65, inquiries: 5 },
  { date: "Dec 5", views: 48, inquiries: 3 },
  { date: "Dec 6", views: 72, inquiries: 6 },
  { date: "Dec 7", views: 58, inquiries: 4 },
];

const funnelData = [
  { stage: "Inquiries", value: 156, color: "#0A1628" },
  { stage: "NDAs Signed", value: 42, color: "#1a3a5c" },
  { stage: "Offers Made", value: 12, color: "#C8A661" },
  { stage: "Closed Deals", value: 4, color: "#22c55e" },
];

const mockInquiries: Inquiry[] = [
  {
    id: "1",
    buyerName: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    listingTitle: "Premium Laundromat - Downtown LA",
    listingId: "listing-1",
    message: "Interested in learning more about the financials",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "new",
  },
  {
    id: "2",
    buyerName: "Sarah Johnson",
    email: "sarah.j@business.com",
    phone: "(555) 987-6543",
    listingTitle: "Coin Laundry - San Diego",
    listingId: "listing-2",
    message: "Would like to schedule a site visit",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: "contacted",
  },
  {
    id: "3",
    buyerName: "Michael Chen",
    email: "m.chen@invest.com",
    listingTitle: "Multi-Location Laundromat Chain",
    listingId: "listing-3",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "qualified",
  },
];

export default function BrokerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
    preset: "30d",
  });

  const { data: brokerProfile, isLoading: profileLoading } = useQuery<BrokerProfile>({
    queryKey: ["/api/broker/profile"],
    enabled: !!user,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery<ListingWithStats[]>({
    queryKey: ["/api/broker/listings"],
    enabled: !!user,
  });

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
    return <DashboardSkeleton />;
  }

  const activeListings = listings.filter(l => l.status === "active");
  const draftListings = listings.filter(l => l.status === "draft");
  const soldListings = listings.filter(l => l.status === "sold");
  const totalViews = listings.reduce((sum, l) => sum + (l.viewCount || 0), 0);
  const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiryCount || 0), 0);
  const avgDaysToSell = brokerProfile?.averageDaysToSell || 45;

  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated...",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your PDF report is being generated...",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">New</Badge>;
      case "contacted":
        return <Badge className="bg-amber-500">Contacted</Badge>;
      case "qualified":
        return <Badge className="bg-green-500">Qualified</Badge>;
      case "closed":
        return <Badge className="bg-gray-500">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <AuthGuard 
      title="Sign In to Access Broker Dashboard" 
      description="Sign in to access your dashboard."
    >
      <DashboardShell
        title="Broker Command Center"
        subtitle={brokerProfile?.companyName || (user ? `${user.firstName} ${user.lastName}` : "Your Brokerage")}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Broker Dashboard" },
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showExportButtons
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        headerActions={
          <div className="flex items-center gap-2">
            {brokerProfile?.verified && (
              <Badge className="bg-[#C8A661] text-[#0A1628]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Link href="/listings/create">
              <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-create-listing">
                <Plus className="w-4 h-4 mr-2" />
                New Listing
              </Button>
            </Link>
          </div>
        }
      >
        <div className="space-y-6">
          <DashboardNav
            items={getNavItemsForRole(user?.role)}
            currentPath="/broker-dashboard"
            userRole={user?.role}
          />

          <KPIGroup>
            <KPICard
              value={activeListings.length}
              label="Active Listings"
              subtitle={`${draftListings.length} drafts`}
              icon={Building2}
              variant="gold"
            />
            <KPICard
              value={totalViews}
              label="Total Views This Month"
              trend={{ value: 12.5, direction: "up", label: "vs last month" }}
              icon={Eye}
              variant="default"
            />
            <KPICard
              value={totalInquiries}
              label="Leads/Inquiries"
              trend={{ value: 8.2, direction: "up", label: "vs last month" }}
              icon={MessageSquare}
              variant="success"
            />
            <KPICard
              value={avgDaysToSell}
              label="Avg Days to Sell"
              subtitle={`${soldListings.length} sold total`}
              icon={TrendingUp}
              suffix=" days"
              formatValue={false}
            />
          </KPIGroup>

          <div className="grid lg:grid-cols-2 gap-6">
            <ChartCard
              title="Listings Performance"
              subtitle="Views and inquiries over time"
              minHeight="280px"
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mockViewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A1628",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#0A1628"
                    strokeWidth={2}
                    dot={{ fill: "#0A1628", strokeWidth: 2 }}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="inquiries"
                    stroke="#C8A661"
                    strokeWidth={2}
                    dot={{ fill: "#C8A661", strokeWidth: 2 }}
                    name="Inquiries"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Lead Funnel"
              subtitle="Inquiry to close conversion"
              minHeight="280px"
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} stroke="#9ca3af" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A1628",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [value, "Count"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            <Link href="/listings/create">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center mb-3">
                    <Plus className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <h4 className="font-semibold text-foreground">Add New Listing</h4>
                  <p className="text-xs text-muted-foreground mt-1">Create a new listing</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/broker/leads">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <h4 className="font-semibold text-foreground">View All Leads</h4>
                  <p className="text-xs text-muted-foreground mt-1">{totalInquiries} active leads</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/consultation">
              <Card className="bg-card border shadow-sm hover-elevate cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <h4 className="font-semibold text-foreground">Request Consultation</h4>
                  <p className="text-xs text-muted-foreground mt-1">Get expert advice</p>
                </CardContent>
              </Card>
            </Link>

            <Card 
              className="bg-card border shadow-sm hover-elevate cursor-pointer h-full"
              onClick={handleExportPDF}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center mb-3">
                  <Download className="h-6 w-6 text-[#C8A661]" />
                </div>
                <h4 className="font-semibold text-foreground">Export Report</h4>
                <p className="text-xs text-muted-foreground mt-1">Download analytics</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-lg">Your Listings</CardTitle>
                  <CardDescription>Manage and track your active listings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
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

                <TabsContent value="active" className="mt-0">
                  {activeListings.length === 0 ? (
                    <div className="py-12 text-center">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No active listings</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first listing to start selling
                      </p>
                      <Link href="/listings/create">
                        <Button className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white" data-testid="button-create-first-listing">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Listing
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Listing</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-center">Views</TableHead>
                            <TableHead className="text-center">Inquiries</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeListings.map((listing) => (
                            <TableRow key={listing.id} data-testid={`row-listing-${listing.id}`}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate flex items-center gap-2">
                                      {listing.title}
                                      {listing.featured && (
                                        <Award className="h-4 w-4 text-[#C8A661]" />
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {listing.city}, {listing.region}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-semibold text-[#C8A661]">
                                  ${Number(listing.priceInUSD || 0).toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{listing.viewCount || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{listing.inquiryCount || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  Active
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <Link href={`/listings/${listing.id}/edit`}>
                                    <Button variant="ghost" size="icon" data-testid={`button-edit-${listing.id}`}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button variant="ghost" size="icon" data-testid={`button-boost-${listing.id}`}>
                                    <Rocket className="h-4 w-4 text-[#C8A661]" />
                                  </Button>
                                  <Link href={`/listings/${listing.slug}`}>
                                    <Button variant="ghost" size="icon" data-testid={`button-view-${listing.id}`}>
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteListingMutation.mutate(listing.id)}
                                    disabled={deleteListingMutation.isPending}
                                    data-testid={`button-delete-${listing.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="drafts" className="mt-0">
                  {draftListings.length === 0 ? (
                    <div className="py-12 text-center">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No draft listings</h3>
                      <p className="text-muted-foreground">
                        All your listings are either active or sold
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Listing</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {draftListings.map((listing) => (
                            <TableRow key={listing.id} data-testid={`row-draft-${listing.id}`}>
                              <TableCell>
                                <div className="font-medium">{listing.title}</div>
                                <div className="text-xs text-muted-foreground">Draft - Not published</div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Draft
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <Link href={`/listings/${listing.id}/edit`}>
                                    <Button size="sm" data-testid={`button-edit-draft-${listing.id}`}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Continue
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteListingMutation.mutate(listing.id)}
                                    disabled={deleteListingMutation.isPending}
                                    data-testid={`button-delete-draft-${listing.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sold" className="mt-0">
                  {soldListings.length === 0 ? (
                    <div className="py-12 text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No sold listings yet</h3>
                      <p className="text-muted-foreground">
                        Your sold listings will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Listing</TableHead>
                            <TableHead className="text-right">Sold Price</TableHead>
                            <TableHead className="text-center">Views</TableHead>
                            <TableHead className="text-center">Days Listed</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {soldListings.map((listing) => (
                            <TableRow key={listing.id} data-testid={`row-sold-${listing.id}`}>
                              <TableCell>
                                <div className="font-medium">{listing.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  Sold {listing.soldAt ? format(new Date(listing.soldAt), "MMM d, yyyy") : "Recently"}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-semibold text-green-600">
                                  ${Number(listing.priceInUSD || 0).toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">{listing.viewCount || 0}</TableCell>
                              <TableCell className="text-center">{listing.daysListed || "N/A"}</TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-green-500">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Sold
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-lg">Recent Inquiries</CardTitle>
                  <CardDescription>Latest buyer inquiries and leads</CardDescription>
                </div>
                <Link href="/broker/leads">
                  <Button variant="outline" size="sm">
                    View All
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {mockInquiries.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
                  <p className="text-muted-foreground">
                    Inquiries from potential buyers will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockInquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30 hover-elevate"
                      data-testid={`card-inquiry-${inquiry.id}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-[#C8A661]">
                          {inquiry.buyerName.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{inquiry.buyerName}</span>
                            {getStatusBadge(inquiry.status)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(inquiry.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          Interested in: {inquiry.listingTitle}
                        </p>
                        {inquiry.message && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            "{inquiry.message}"
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <a
                            href={`mailto:${inquiry.email}`}
                            className="flex items-center gap-1.5 text-sm text-[#0A1628] hover:text-[#C8A661]"
                          >
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{inquiry.email}</span>
                          </a>
                          {inquiry.phone && (
                            <a
                              href={`tel:${inquiry.phone}`}
                              className="flex items-center gap-1.5 text-sm text-[#0A1628] hover:text-[#C8A661]"
                            >
                              <Phone className="h-4 w-4" />
                              <span>{inquiry.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" data-testid={`button-contact-${inquiry.id}`}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Link href={`/listings/${inquiry.listingId}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-view-listing-${inquiry.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {brokerProfile && (
            <Card className="bg-card border shadow-sm overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Broker Profile</CardTitle>
                    <CardDescription>Your business information and credentials</CardDescription>
                  </div>
                  <Link href="/broker/profile/edit">
                    <Button variant="outline" data-testid="button-edit-profile">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Company Name</div>
                    <div className="font-semibold">{brokerProfile.companyName}</div>
                  </div>
                  {brokerProfile.licenseNumber && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">License Number</div>
                      <div className="font-semibold">{brokerProfile.licenseNumber}</div>
                    </div>
                  )}
                  {brokerProfile.yearsExperience && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Years of Experience</div>
                      <div className="font-semibold text-[#C8A661]">{brokerProfile.yearsExperience} years</div>
                    </div>
                  )}
                  {brokerProfile.specializations && brokerProfile.specializations.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Specializations</div>
                      <div className="flex flex-wrap gap-1">
                        {brokerProfile.specializations.map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
