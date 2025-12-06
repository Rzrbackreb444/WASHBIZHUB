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
  ExternalLink, Sparkles, ArrowRight, Crown, Calculator, Briefcase, Loader2
} from "lucide-react";
import { Helmet } from "react-helmet-async";

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
  const [cleanbiLoadingId, setCleanbiLoadingId] = useState<string | null>(null);

  // Fetch from the same source as the FeaturedListingsCarousel
  const { data: carouselListings = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/listings/featured-carousel'],
    staleTime: 60000,
  });

  // Transform carousel listings to the expected format (real listings only, images optional)
  const listings: LaundroListing[] = carouselListings
    .map((l: any) => ({
      id: l.id?.toString() || l.slug || "unknown",
      title: l.title || "Untitled Listing",
      location: l.city || "Unknown",
      state: l.region || "",
      address: l.exactAddress || `${l.city || ""}, ${l.region || ""}`,
      price: parseFloat(l.priceInUSD || l.priceOriginal || "0"),
      annualRevenue: l.financials?.annualRevenue ? parseFloat(l.financials.annualRevenue) : 0,
      monthlyProfit: l.financials?.cashFlow ? parseFloat(l.financials.cashFlow) / 12 : 0,
      featured: l.subscriptionTier === 'diamond' || l.subscriptionTier === 'showcase' || l.featured,
      verified: true,
      cleanbiScore: l.cleanbiScore || 75,
      cleanbiGrade: l.cleanbiGrade || getGradeFromScore(l.cleanbiScore || 75),
      includesRealEstate: l.includesRealEstate || false,
      machineCount: l.machineCount || undefined,
      sqft: l.squareFeet || undefined,
      leaseTerms: l.leaseTerms || undefined,
      images: l.featuredImage ? [l.featuredImage] : l.images || [],
      description: l.tagline || l.description || "",
      contactEmail: "consult@washbizhub.com",
      createdAt: l.createdAt || new Date().toISOString(),
    }));

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
                    <Button 
                        variant="outline" 
                        className="w-full border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/10"
                        data-testid={`button-cleanbi-analyze-${listing.id}`}
                        disabled={cleanbiLoadingId === listing.id}
                        onClick={() => {
                          setCleanbiLoadingId(listing.id);
                          setLocation(`/cleanbi-explorer?address=${encodeURIComponent(listing.address || listing.location + ", " + listing.state)}`);
                        }}
                      >
                        {cleanbiLoadingId === listing.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4 mr-1" />
                        )}
                        {cleanbiLoadingId === listing.id ? "Analyzing..." : "CLEANBI Score"}
                      </Button>
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
