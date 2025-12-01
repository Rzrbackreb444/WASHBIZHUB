import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Store, MapPin, DollarSign, TrendingUp, Search, Plus, Building2, BarChart3, 
  MessageSquare, Settings, Zap, Filter, Home, Target, CheckCircle2, 
  ExternalLink, Sparkles, ArrowRight, Crown, Calculator, Briefcase
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import newportImage from "@assets/Dexter Laundromat_1763779877618.jpg";

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635",
  "C": "#FBBF24",
  "Needs Work": "#C8A661"
};

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", 
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", 
  "VA", "WA", "WV", "WI", "WY"
];

interface LaundroListing {
  id: string;
  title: string;
  location: string;
  state: string;
  address?: string;
  price: number;
  annualRevenue: number;
  monthlyProfit: number;
  featured: boolean;
  verified: boolean;
  cleanbiScore: number;
  cleanbiGrade: string;
  includesRealEstate: boolean;
  machineCount?: number;
  sqft?: number;
  leaseTerms?: string;
  images: string[];
  description: string;
  contactEmail: string;
  createdAt: string;
}

function getGradeFromScore(score: number): string {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "Needs Work";
}

export default function LaundromatListings() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [includesRealEstate, setIncludesRealEstate] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("featured");

  const { data: listings = [] } = useQuery<LaundroListing[]>({
    queryKey: ["/api/laundromat-listings"],
    initialData: [
      {
        id: "l1",
        title: "Profitable 20-Machine Laundromat - Downtown Location",
        location: "Dallas",
        state: "TX",
        address: "2847 Main St, Dallas, TX 75201",
        price: 185000,
        annualRevenue: 95000,
        monthlyProfit: 4200,
        featured: true,
        verified: true,
        cleanbiScore: 82,
        cleanbiGrade: "B",
        includesRealEstate: false,
        machineCount: 20,
        sqft: 2400,
        leaseTerms: "8 years remaining",
        images: [],
        description: "Well-maintained laundromat in high-traffic downtown area with strong customer base. SBA 7(a) loan eligible. Seller financing available.",
        contactEmail: "seller@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "l2",
        title: "Family-Run 15-Machine Laundromat with Real Estate",
        location: "Denver",
        state: "CO",
        address: "1520 Market St, Denver, CO 80202",
        price: 425000,
        annualRevenue: 72000,
        monthlyProfit: 2800,
        featured: true,
        verified: true,
        cleanbiScore: 75,
        cleanbiGrade: "B",
        includesRealEstate: true,
        machineCount: 15,
        sqft: 1800,
        images: [],
        description: "Established business with loyal customer base, includes real estate. Property valued at $300K+. Opportunity for growth with added services.",
        contactEmail: "owner@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "l3",
        title: "Newport Laundry - Premium High-Income Location",
        location: "Newport Beach",
        state: "CA",
        address: "1205 Balboa Blvd, Newport Beach, CA 92661",
        price: 200000,
        annualRevenue: 82753,
        monthlyProfit: 950,
        featured: true,
        verified: true,
        cleanbiScore: 85,
        cleanbiGrade: "A",
        includesRealEstate: false,
        machineCount: 27,
        sqft: 3200,
        leaseTerms: "Up to 20 years",
        images: [newportImage],
        description: "Premium opportunity in high-income Orange County. Features 27 Dexter machines, PayRange + coin system. Ideal for fluff & fold expansion.",
        contactEmail: "larry@washbizhub.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "l4",
        title: "High-Volume Laundromat Near University",
        location: "Austin",
        state: "TX",
        address: "4521 Guadalupe St, Austin, TX 78751",
        price: 275000,
        annualRevenue: 142000,
        monthlyProfit: 6200,
        featured: false,
        verified: true,
        cleanbiScore: 88,
        cleanbiGrade: "A",
        includesRealEstate: false,
        machineCount: 32,
        sqft: 2800,
        leaseTerms: "12 years remaining",
        images: [],
        description: "Prime location near UT Austin campus. High foot traffic, consistent student demand. Card system installed. Strong cash flow.",
        contactEmail: "broker@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "l5",
        title: "Turnkey Laundromat with WDF Service",
        location: "Phoenix",
        state: "AZ",
        address: "890 W Camelback Rd, Phoenix, AZ 85013",
        price: 165000,
        annualRevenue: 88000,
        monthlyProfit: 3800,
        featured: false,
        verified: true,
        cleanbiScore: 72,
        cleanbiGrade: "B",
        includesRealEstate: false,
        machineCount: 18,
        sqft: 2000,
        leaseTerms: "5 years remaining",
        images: [],
        description: "Established wash-dry-fold service generating additional revenue. Equipment in good condition. Great starter opportunity.",
        contactEmail: "seller2@example.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "l6",
        title: "Laundromat + Building - Investment Package",
        location: "Atlanta",
        state: "GA",
        address: "1245 Peachtree St NE, Atlanta, GA 30309",
        price: 750000,
        annualRevenue: 156000,
        monthlyProfit: 8500,
        featured: true,
        verified: true,
        cleanbiScore: 91,
        cleanbiGrade: "A",
        includesRealEstate: true,
        machineCount: 40,
        sqft: 4500,
        images: [],
        description: "Rare opportunity: profitable laundromat plus building ownership. Triple net investment. Building alone worth $500K. SBA eligible.",
        contactEmail: "invest@example.com",
        createdAt: new Date().toISOString(),
      },
    ],
  });

  const filteredListings = listings
    .filter((l) => {
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.address && l.address.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesState = selectedState === "all" || l.state === selectedState;
      const matchesPrice = l.price >= priceRange[0] && l.price <= priceRange[1];
      const matchesRealEstate = includesRealEstate === null || l.includesRealEstate === includesRealEstate;
      
      return matchesSearch && matchesState && matchesPrice && matchesRealEstate;
    })
    .sort((a, b) => {
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "score") return b.cleanbiScore - a.cleanbiScore;
      if (sortBy === "revenue") return b.annualRevenue - a.annualRevenue;
      return 0;
    });

  const activeFilters = [
    selectedState !== "all" && `State: ${selectedState}`,
    priceRange[0] > 0 && `Min: $${(priceRange[0] / 1000).toFixed(0)}K`,
    priceRange[1] < 1000000 && `Max: $${(priceRange[1] / 1000).toFixed(0)}K`,
    includesRealEstate === true && "With Real Estate",
    includesRealEstate === false && "Business Only",
  ].filter(Boolean);

  return (
    <>
      <Helmet>
        <title>Laundromats For Sale | Deal Flow Dashboard - WashBizHub</title>
        <meta name="description" content="Browse verified laundromats for sale with CLEANBI scoring. Filter by location, price, real estate. Get pre-qualified financing. The #1 laundromat marketplace." />
        <meta name="keywords" content="laundromat for sale, buy laundromat, laundromat business, coin laundry for sale, laundromat marketplace, CLEANBI" />
        <link rel="canonical" href="https://washbizhub.com/laundromat-listings" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Header */}
        <div className="border-b border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-[#C8A661]/20">
                    <Store className="w-8 h-8 text-[#C8A661]" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {listings.length} Active Listings
                  </Badge>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Deal Flow Dashboard
                </h1>
                <p className="text-white/60 text-lg">
                  Verified laundromats for sale with CLEANBI™ intelligence scoring
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/cleanbi-explorer">
                  <Button className="bg-[#C8A661] hover:bg-[#b8860b] text-black" data-testid="link-cleanbi">
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Any Location
                  </Button>
                </Link>
                <Link href="/funding-matcher">
                  <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10" data-testid="link-funding">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Get Pre-Qualified
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Search & Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search by city, state, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                data-testid="input-listings-search"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-32 h-12 bg-white/5 border-white/10 text-white" data-testid="select-state">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {US_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12 bg-white/5 border-white/10 text-white" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured First</SelectItem>
                  <SelectItem value="score">CLEANBI Score</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>

              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 border-white/10 text-white hover:bg-white/10" data-testid="button-filters">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilters.length > 0 && (
                      <Badge className="ml-2 bg-[#C8A661] text-black">{activeFilters.length}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-white/10">
                  <SheetHeader>
                    <SheetTitle className="text-white">Filter Listings</SheetTitle>
                    <SheetDescription className="text-white/60">
                      Narrow down your search
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label className="text-white">Price Range</Label>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <span>${(priceRange[0] / 1000).toFixed(0)}K</span>
                        <span>—</span>
                        <span>${(priceRange[1] / 1000).toFixed(0)}K</span>
                      </div>
                      <Slider
                        value={priceRange}
                        onValueChange={(v) => setPriceRange(v as [number, number])}
                        min={0}
                        max={1000000}
                        step={25000}
                        className="mt-2"
                      />
                    </div>

                    {/* Real Estate Toggle */}
                    <div className="space-y-3">
                      <Label className="text-white">Property Type</Label>
                      <div className="space-y-2">
                        <Button 
                          variant={includesRealEstate === null ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setIncludesRealEstate(null)}
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          All Listings
                        </Button>
                        <Button 
                          variant={includesRealEstate === true ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setIncludesRealEstate(true)}
                        >
                          <Home className="w-4 h-4 mr-2" />
                          Includes Real Estate
                        </Button>
                        <Button 
                          variant={includesRealEstate === false ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setIncludesRealEstate(false)}
                        >
                          <Store className="w-4 h-4 mr-2" />
                          Business Only (Leased)
                        </Button>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedState("all");
                        setPriceRange([0, 1000000]);
                        setIncludesRealEstate(null);
                        setSearchQuery("");
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter, i) => (
                <Badge key={i} variant="outline" className="border-[#C8A661]/50 text-[#C8A661]">
                  {filter}
                </Badge>
              ))}
            </div>
          )}

          {/* Results Count */}
          <div className="text-white/60 text-sm mb-6">
            Showing {filteredListings.length} of {listings.length} listings
          </div>

          {/* Listings Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="bg-white/5 border-white/10 hover:border-[#C8A661]/50 transition-all overflow-hidden group"
                data-testid={`listing-${listing.id}`}
              >
                {/* Image or Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800">
                  {listing.images[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Store className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {listing.featured && (
                      <Badge className="bg-[#C8A661] text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {listing.includesRealEstate && (
                      <Badge className="bg-blue-500/90 text-white">
                        <Home className="w-3 h-3 mr-1" />
                        Includes RE
                      </Badge>
                    )}
                    {listing.verified && (
                      <Badge variant="outline" className="bg-black/50 border-green-500/50 text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* CLEANBI Score */}
                  <div className="absolute top-3 right-3">
                    <div 
                      className="w-14 h-14 rounded-full flex flex-col items-center justify-center text-white font-bold"
                      style={{ backgroundColor: GRADE_COLORS[listing.cleanbiGrade] }}
                    >
                      <span className="text-lg leading-none">{listing.cleanbiGrade}</span>
                      <span className="text-[10px] opacity-80">{listing.cleanbiScore}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Title & Location */}
                  <div>
                    <h3 className="font-semibold text-white line-clamp-2 mb-1 group-hover:text-[#C8A661] transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-white/50">
                      <MapPin className="w-3.5 h-3.5" />
                      {listing.location}, {listing.state}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-[10px] text-white/40 uppercase">Revenue</p>
                      <p className="font-bold text-green-400 text-sm">${(listing.annualRevenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-[10px] text-white/40 uppercase">Profit/Mo</p>
                      <p className="font-bold text-[#C8A661] text-sm">${listing.monthlyProfit.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-[10px] text-white/40 uppercase">Machines</p>
                      <p className="font-bold text-white text-sm">{listing.machineCount || "—"}</p>
                    </div>
                  </div>

                  {/* Asking Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                      <p className="text-xs text-white/40">Asking Price</p>
                      <p className="text-2xl font-bold text-white">
                        ${(listing.price / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">Est. ROI</p>
                      <p className="text-lg font-semibold text-green-400">
                        {((listing.monthlyProfit * 12 / listing.price) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className="bg-[#C8A661] hover:bg-[#b8860b] text-black" 
                      data-testid={`button-view-${listing.id}`}
                      onClick={() => setLocation(`/listing/${listing.id}`)}
                    >
                      View Details
                    </Button>
                    <Link href={`/cleanbi-explorer?address=${encodeURIComponent(listing.address || listing.location + ", " + listing.state)}`}>
                      <Button 
                        variant="outline" 
                        className="w-full border-white/20 text-white hover:bg-white/10"
                        data-testid={`button-analyze-${listing.id}`}
                      >
                        <Target className="w-4 h-4 mr-1" />
                        Analyze
                      </Button>
                    </Link>
                  </div>

                  {/* Quick Funding Link */}
                  <Link href="/funding-matcher">
                    <Button 
                      variant="ghost" 
                      className="w-full text-green-400 hover:text-green-300 hover:bg-green-500/10 text-sm"
                      data-testid={`button-funding-${listing.id}`}
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Get Pre-Qualified for This Deal
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No listings match your filters</h3>
              <p className="text-white/60 mb-4">Try adjusting your search criteria</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedState("all");
                  setPriceRange([0, 1000000]);
                  setIncludesRealEstate(null);
                  setSearchQuery("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#C8A661]/20 to-[#b8860b]/10 border border-[#C8A661]/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ready to Buy?</h3>
                <p className="text-white/60">Get pre-qualified with our funding partners in minutes</p>
              </div>
              <div className="flex gap-3">
                <Link href="/funding-matcher">
                  <Button className="bg-green-500 hover:bg-green-600 text-white" data-testid="link-funding-bottom">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Match Me with Lenders
                  </Button>
                </Link>
                <Link href="/sell-your-laundromat">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="link-sell">
                    <Plus className="w-4 h-4 mr-2" />
                    List Your Business
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
