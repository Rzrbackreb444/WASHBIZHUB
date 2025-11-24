import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, MapPin, DollarSign, TrendingUp, Search, Plus, Building2, BarChart3, MessageSquare, Settings, Zap } from "lucide-react";
import { Helmet } from "react-helmet-async";
import newportImage from "@assets/Dexter Laundromat_1763779877618.jpg";

interface LaundroListing {
  id: string;
  title: string;
  location: string;
  state: string;
  price: number;
  annualRevenue: number;
  monthlyProfit: number;
  featured: boolean;
  verified: boolean;
  cleanbiScore: number;
  cleanbiFactors?: {
    market: number;
    financial: number;
    lease: number;
    competition: number;
    equipment: number;
    utilities: number;
    readiness: number;
  };
  images: string[];
  description: string;
  contactEmail: string;
  createdAt: string;
}

interface DashboardListing extends LaundroListing {
  views: number;
  inquiries: number;
  daysListed: number;
}

export default function LaundromatListings() {
  const [, setLocation] = useLocation();
  const [userRole, setUserRole] = useState<"buyer" | "seller" | "broker">("buyer");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: listings = [] } = useQuery<LaundroListing[]>({
    queryKey: ["/api/laundromat-listings"],
    initialData: [
      {
        id: "l1",
        title: "Profitable 20-Machine Laundromat - Downtown Location",
        location: "Downtown",
        state: "TX",
        price: 185000,
        annualRevenue: 95000,
        monthlyProfit: 4200,
        featured: true,
        verified: true,
        cleanbiScore: 82,
        images: [],
        description: "Well-maintained laundromat in high-traffic downtown area with strong customer base. SBA 7(a) loan eligible. Seller financing available ($40K-$80K down payment options). Traditional bank financing pre-qualified. Equipment lease-back options available.",
        contactEmail: "seller@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "l2",
        title: "Family-Run 15-Machine Laundromat",
        location: "Midtown",
        state: "CO",
        price: 125000,
        annualRevenue: 72000,
        monthlyProfit: 2800,
        featured: true,
        verified: true,
        cleanbiScore: 75,
        images: [],
        description: "Established business with loyal customer base, opportunity for growth. SBA eligible. Owner financing available. FHA small business loan qualified. Alternative lender options for qualified buyers.",
        contactEmail: "owner@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "l3",
        title: "Newport Laundry - Premium High-Income Location with Fluff & Fold Potential",
        location: "Newport Beach",
        state: "CA",
        price: 200000,
        annualRevenue: 82753,
        monthlyProfit: 950,
        featured: true,
        verified: true,
        cleanbiScore: 85,
        cleanbiFactors: {
          market: 92,
          financial: 88,
          lease: 85,
          competition: 78,
          equipment: 82,
          utilities: 81,
          readiness: 85,
        },
        images: [newportImage],
        description: "Unique premium opportunity in high-income Orange County location. Features 27 machines with Dexter equipment, full security infrastructure, PayRange + coin system. Graduated lease terms (up to 20 years) with owner financing available. SBA-eligible. Seller financing options available ($50K-$100K down). Ideal for fluff & fold and pickup/delivery service expansion. Owner-operated building offers flexibility for qualified buyers.",
        contactEmail: "larry@washbizhub.com",
        createdAt: new Date().toISOString(),
      },
    ],
  });

  const filteredListings = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // BUYER VIEW
  if (userRole === "buyer") {
    return (
      <>
        <Helmet>
          <title>Buy Laundromats | WashBizHub Marketplace - Verified Profitable Businesses</title>
          <meta name="description" content="Discover verified, profitable laundromat businesses with CLEANBI analysis. Browse high-income locations, equipment details, and financial metrics on WashBizHub Marketplace." />
          <meta name="keywords" content="buy laundromat, laundromat for sale, laundromat business, profitable laundromats, laundromat marketplace" />
          <link rel="canonical" href="https://washbizhub.com/laundromat-listings" />
          <meta property="og:title" content="Buy Laundromats | WashBizHub Marketplace" />
          <meta property="og:description" content="Verified laundromat businesses with CLEANBI scoring and financial analysis." />
          <meta property="og:type" content="website" />
          <meta name="robots" content="index, follow" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Store className="w-10 h-10 text-primary" />
                Find Your Next Laundromat
              </h1>
              <p className="text-muted-foreground text-lg">
                Browse verified, profitable laundromat businesses ready for new ownership. All listings include CLEANBI analysis.
              </p>
            </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-listings-search"
                  />
                </div>
                <Button variant="outline">Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Listings Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="hover-elevate transition-all overflow-hidden"
                data-testid={`listing-${listing.id}`}
              >
                <div className="flex flex-wrap gap-2 p-4 bg-muted/50">
                  {listing.featured && <Badge className="bg-yellow-600">⭐ Featured</Badge>}
                  {listing.verified && <Badge variant="outline">✓ Verified</Badge>}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Financing Available
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {listing.location}, {listing.state}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* CLEANBI Score */}
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">CLEANBI Score</p>
                      <Zap className="w-3 h-3 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold">{listing.cleanbiScore}/100</div>
                    {listing.cleanbiFactors && (
                      <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
                        <div>Market: {listing.cleanbiFactors.market}</div>
                        <div>Financial: {listing.cleanbiFactors.financial}</div>
                        <div>Lease: {listing.cleanbiFactors.lease}</div>
                        <div>Equipment: {listing.cleanbiFactors.equipment}</div>
                      </div>
                    )}
                  </div>

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Annual Revenue</p>
                      <p className="font-bold text-green-500">${(listing.annualRevenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Monthly Profit</p>
                      <p className="font-bold text-accent">${listing.monthlyProfit.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <DollarSign className="w-6 h-6 text-primary" />
                    {(listing.price / 1000).toFixed(0)}K
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      data-testid={`button-view-${listing.id}`}
                      onClick={() => setLocation(`/listing/${listing.id}`)}
                    >
                      View Details
                    </Button>
                    <Button variant="outline" size="icon" data-testid={`button-message-${listing.id}`}>
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
    );
  }

  // SELLER DASHBOARD
  if (userRole === "seller") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Seller Dashboard</h1>
            <Button className="gap-2" data-testid="button-list-new">
              <Plus className="w-4 h-4" />
              List New Business
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-3xl font-bold mt-2">2</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold mt-2 text-primary">847</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-3xl font-bold mt-2 text-accent">23</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-3xl font-bold mt-2 text-green-500">98%</p>
              </CardContent>
            </Card>
          </div>

          {/* My Listings */}
          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">${listing.price.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" data-testid={`button-edit-${listing.id}`}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" data-testid={`button-analytics-${listing.id}`}>
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // BROKER DASHBOARD
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Broker Portal</h1>

        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="matches">Buyer Matches</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6 mt-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Portfolio Listings</p>
                  <p className="text-3xl font-bold mt-2">8</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-3xl font-bold mt-2 text-green-500">$2.3M</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Pending Sales</p>
                  <p className="text-3xl font-bold mt-2 text-accent">3</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Potential Commission</p>
                  <p className="text-3xl font-bold mt-2 text-primary">$92K</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Leads</CardTitle>
                <CardDescription>Leads matched to your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">12 active buyer leads matching your properties</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>Pending Commissions</span>
                    <span className="font-bold">$15,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>Paid This Month</span>
                    <span className="font-bold text-green-500">$8,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
