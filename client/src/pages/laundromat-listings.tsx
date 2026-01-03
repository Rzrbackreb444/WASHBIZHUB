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
  ExternalLink, Sparkles, ArrowRight, Crown, Calculator, Briefcase, Loader2, Star
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { FAQSection } from "@/components/SuperSEOWrapper";
import FeaturedListingsCarousel from "@/components/FeaturedListingsCarousel";
import { ArtDecoDivider, GlassmorphismCard } from "@/components/premium-components";

import dexterLaundromatImage from "@assets/Dexter_Laundromat_1765740800732.jpg";
import bigDexterLaundromatImage from "@assets/big_dexter_laundromat_1765733391377.jpg";
import darkLaundromatImage from "@assets/dark_laundromat_1764814080285.jpg";

const listingsStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Laundromats For Sale",
  "description": "Browse verified laundromats for sale across the United States with CLEANBI location scores and financial analysis.",
  "url": "https://washbizhub.com/laundromat-listings",
  "numberOfItems": "50+",
  "itemListOrder": "Descending"
};

const marketplaceStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Laundromats For Sale Marketplace",
  "description": "Find laundromats for sale with verified listings, CLEANBI scores, and detailed financials. The #1 marketplace for buying laundromats.",
  "url": "https://washbizhub.com/laundromat-listings",
  "mainEntity": {
    "@type": "Service",
    "name": "Laundromat Marketplace",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub"
    },
    "serviceType": "Business Brokerage",
    "areaServed": "United States"
  }
};

const listingsFaqs = [
  {
    question: "How do I find laundromats for sale?",
    answer: "Browse WashBizHub's verified marketplace featuring laundromats for sale across the US. Filter by location, price range, and whether real estate is included. Each listing includes CLEANBI location scoring and financial analysis."
  },
  {
    question: "What is a CLEANBI score on laundromat listings?",
    answer: "CLEANBI is a proprietary 0-100 scoring system that rates laundromat locations based on demographics, competition, traffic, accessibility, and economic factors. A = 85+, B = 70-84, C = 55-69. Higher scores indicate better investment potential."
  },
  {
    question: "How much do laundromats cost?",
    answer: "Laundromats typically range from $100,000 to $1,000,000+ depending on size, location, equipment, and whether real estate is included. Self-service coin laundries average $200,000-$400,000, while premium locations with real estate can exceed $750,000."
  },
  {
    question: "What should I look for when buying a laundromat?",
    answer: "Key factors include: location demographics (renter population, income levels), competition density, equipment age and condition, lease terms, verified financials, utility costs, and foot traffic. Use CLEANBI scoring to evaluate locations objectively."
  },
  {
    question: "Are these laundromat listings verified?",
    answer: "Yes, all listings on WashBizHub are verified by our team. We confirm business ownership, review financials, and provide CLEANBI location analysis for each property. Featured listings receive additional due diligence."
  }
];

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

  // Fetch ALL active listings from the marketplace
  const { data: allListingsData = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/listings?status=active'],
    staleTime: 60000,
  });

  // Fetch featured carousel listings separately (for carousel display)
  const { data: carouselData = [] } = useQuery<any[]>({
    queryKey: ['/api/listings/featured-carousel'],
    staleTime: 60000,
  });

  // Transform function for consistent listing format
  const transformListing = (l: any): LaundroListing => ({
    id: l.id?.toString() || l.slug || "unknown",
    title: l.title || "Untitled Listing",
    location: l.city || "Unknown",
    state: l.region || "",
    address: l.exactAddress || `${l.city || ""}, ${l.region || ""}`,
    price: parseFloat(l.priceInUSD || l.priceOriginal || "0"),
    annualRevenue: l.financials?.annualRevenue ? parseFloat(l.financials.annualRevenue) : 0,
    monthlyProfit: l.financials?.cashFlow ? parseFloat(l.financials.cashFlow) / 12 : 0,
    featured: l.subscriptionTier === 'diamond' || l.subscriptionTier === 'showcase' || l.featured || l.carouselFeatured,
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
  });

  // All marketplace listings
  const listings: LaundroListing[] = allListingsData.map(transformListing);
  
  // Featured carousel listings (subset displayed at top)
  const featuredCarouselIds = new Set(carouselData.map((l: any) => l.id?.toString()));

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
      <SEO
        title="Laundromats For Sale Near Me | Coin Laundry Businesses For Sale by Owner | WashBizHub"
        description="Find laundromats for sale by owner and broker. Browse coin laundry businesses with CLEANBI location scores, verified financials, real estate options. Filter by state, price, revenue. Updated daily."
        canonicalUrl="/laundromat-listings"
        ogType="website"
        keywords={[
          "laundromat for sale",
          "laundromats for sale near me",
          "buy laundromat",
          "laundromat business for sale",
          "coin laundry for sale",
          "how to buy a laundromat",
          "laundromat listings",
          "laundromat marketplace",
          "laundromat investment",
          "CLEANBI score",
          "laundromat price",
          "laundromat valuation"
        ]}
        structuredData={[listingsStructuredData, marketplaceStructuredData]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Marketplace", url: "/marketplace" },
          { name: "Laundromats For Sale", url: "/laundromat-listings" }
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0A1628] via-[#16213e] to-[#0A1628] overflow-x-hidden">
        {/* Premium Art Deco Hero Header */}
        <div className="relative border-b border-[#C8A661]/30 overflow-hidden">
          {/* Background Image with Premium Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${dexterLaundromatImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/85 to-[#0A1628]/75" />
          
          {/* Art Deco Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#C8A661]/40" />
          <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#C8A661]/40" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {/* Premium Icon Container */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#C8A661]/30 to-[#C8A661]/10 border border-[#C8A661]/40 shadow-lg shadow-[#C8A661]/10">
                    <Store className="w-8 h-8 text-[#C8A661]" />
                  </div>
                  <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/40 px-3 py-1">
                    <Crown className="w-3 h-3 mr-1.5" />
                    {listings.length} Premium Listings
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Live Market Data
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                  <span className="text-[#C8A661]">Deal Flow</span> Dashboard
                </h1>
                <p className="text-white/70 text-lg sm:text-xl max-w-xl">
                  Verified laundromats for sale with <span className="text-[#C8A661] font-semibold">CLEANBI™</span> intelligence scoring
                </p>
                
                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#C8A661]">{listings.length}+</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Active Deals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">94%</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">50+</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">States</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/cleanbi-explorer">
                  <Button className="bg-gradient-to-r from-[#C8A661] to-[#D4B878] hover:from-[#D4B878] hover:to-[#C8A661] text-black font-bold shadow-lg shadow-[#C8A661]/20 border border-[#C8A661]/50 w-full" data-testid="link-cleanbi">
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Any Location
                  </Button>
                </Link>
                <Link href="/funding-matcher">
                  <Button variant="outline" className="border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/10 w-full" data-testid="link-funding">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Get Pre-Qualified
                  </Button>
                </Link>
                <Link href="/sell-your-laundromat">
                  <Button variant="ghost" className="text-white/70 hover:text-[#C8A661] hover:bg-white/5 w-full" data-testid="link-sell-hero">
                    <Plus className="w-4 h-4 mr-2" />
                    List Your Business
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Bottom Art Deco Divider */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A661]/50 to-transparent" />
        </div>

        {/* Premium Featured Listings Carousel */}
        {carouselData.length > 0 && (
          <div className="relative border-b border-[#C8A661]/20 bg-gradient-to-b from-[#0A1628]/50 to-transparent py-8 sm:py-10">
            {/* Decorative Gold Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#C8A661] to-transparent" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#C8A661]/30 to-[#C8A661]/10 border border-[#C8A661]/30">
                    <Crown className="w-6 h-6 text-[#C8A661]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Featured Opportunities</h2>
                    <p className="text-white/50 text-sm">Hand-selected premium investment properties</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-[#C8A661]/20 to-[#D4B878]/20 text-[#C8A661] border-[#C8A661]/40 ml-2">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-white/50">
                  <Sparkles className="w-4 h-4 text-[#C8A661]" />
                  {listings.length} total listings available
                </div>
              </div>
              <FeaturedListingsCarousel />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* All Listings Header with Premium Styling */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Store className="w-5 h-5 text-[#C8A661]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">All Listings</h2>
                <p className="text-sm text-white/50">Browse verified investment opportunities</p>
              </div>
            </div>
            <Badge className="bg-white/5 text-white/70 border-white/20 px-3 py-1">
              {filteredListings.length} of {listings.length} listings
            </Badge>
          </div>

          {/* Premium Search & Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8A661]" />
              <Input
                placeholder="Search by city, state, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-gradient-to-r from-white/5 to-white/3 border-[#C8A661]/20 text-white placeholder:text-white/40 focus:border-[#C8A661]/50 focus:ring-[#C8A661]/20"
                data-testid="input-listings-search"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-24 sm:w-32 h-10 sm:h-12 bg-white/5 border-white/10 text-white text-sm sm:text-base" data-testid="select-state">
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
                <SelectTrigger className="w-32 sm:w-40 h-10 sm:h-12 bg-white/5 border-white/10 text-white text-sm sm:text-base" data-testid="select-sort">
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

          {/* Premium Listings Grid */}
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border border-white/10 hover:border-[#C8A661]/50 transition-all duration-300 shadow-lg hover:shadow-[#C8A661]/10"
                data-testid={`listing-${listing.id}`}
              >
                {/* Premium Gold Accent Border */}
                {listing.featured && (
                  <div className="absolute inset-0 rounded-xl border-2 border-[#C8A661]/30 pointer-events-none z-10" />
                )}
                
                {/* Image or Placeholder with Premium Overlay */}
                <div className="relative h-52 bg-gradient-to-br from-[#16213e] to-[#0A1628]">
                  {listing.images[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#16213e] to-[#0A1628]">
                      <Store className="w-20 h-20 text-[#C8A661]/20" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {listing.featured && (
                      <Badge className="bg-gradient-to-r from-[#C8A661] to-[#D4B878] text-black font-semibold shadow-lg">
                        <Crown className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {listing.includesRealEstate && (
                      <Badge className="bg-blue-600/90 text-white border border-blue-400/30">
                        <Home className="w-3 h-3 mr-1" />
                        Includes RE
                      </Badge>
                    )}
                    {listing.verified && (
                      <Badge variant="outline" className="bg-black/60 backdrop-blur-sm border-green-500/50 text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Premium CLEANBI Score Badge */}
                  <div className="absolute top-3 right-3">
                    <div 
                      className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-lg border-2 border-white/20"
                      style={{ 
                        backgroundColor: GRADE_COLORS[listing.cleanbiGrade],
                        boxShadow: `0 4px 20px ${GRADE_COLORS[listing.cleanbiGrade]}40`
                      }}
                    >
                      <span className="text-xl leading-none font-black">{listing.cleanbiGrade}</span>
                      <span className="text-[10px] opacity-90 font-medium">{listing.cleanbiScore}</span>
                    </div>
                  </div>
                  
                  {/* Bottom Gradient with Price Preview */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0A1628] to-transparent">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white">${(listing.price / 1000).toFixed(0)}K</span>
                      <span className="text-sm font-medium text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {((listing.monthlyProfit * 12 / listing.price) * 100).toFixed(1)}% ROI
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Title & Location */}
                  <div>
                    <h3 className="font-bold text-lg text-white line-clamp-2 mb-2 group-hover:text-[#C8A661] transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-white/60">
                      <MapPin className="w-4 h-4 text-[#C8A661]" />
                      {listing.location}, {listing.state}
                    </div>
                  </div>

                  {/* Premium Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-gradient-to-br from-white/5 to-white/0 rounded-lg border border-white/5 text-center">
                      <p className="text-[10px] text-[#C8A661] uppercase tracking-wider font-medium mb-1">Revenue</p>
                      <p className="font-bold text-green-400 text-sm">${(listing.annualRevenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-white/5 to-white/0 rounded-lg border border-white/5 text-center">
                      <p className="text-[10px] text-[#C8A661] uppercase tracking-wider font-medium mb-1">Monthly</p>
                      <p className="font-bold text-[#C8A661] text-sm">${listing.monthlyProfit.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-white/5 to-white/0 rounded-lg border border-white/5 text-center">
                      <p className="text-[10px] text-[#C8A661] uppercase tracking-wider font-medium mb-1">Machines</p>
                      <p className="font-bold text-white text-sm">{listing.machineCount || "—"}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      className="bg-gradient-to-r from-[#C8A661] to-[#D4B878] hover:from-[#D4B878] hover:to-[#C8A661] text-black font-semibold shadow-md" 
                      data-testid={`button-view-${listing.id}`}
                      onClick={() => setLocation(`/listing/${listing.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                        variant="outline" 
                        className="border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/10 font-medium"
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
                          <Target className="w-4 h-4 mr-1" />
                        )}
                        {cleanbiLoadingId === listing.id ? "Analyzing..." : "CLEANBI"}
                      </Button>
                  </div>

                  {/* Quick Funding Link */}
                  <Link href="/funding-matcher">
                    <Button 
                      variant="ghost" 
                      className="w-full text-green-400 hover:text-green-300 hover:bg-green-500/10 text-sm border border-green-500/20"
                      data-testid={`button-funding-${listing.id}`}
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Get Pre-Qualified for This Deal
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
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

          {/* FAQ Section for SEO */}
          <div className="mt-16">
            <FAQSection 
              faqs={listingsFaqs}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-white/10 rounded-xl p-6"
            />
          </div>

          {/* Premium Bottom CTA */}
          <div className="mt-16 relative overflow-hidden">
            {/* Art Deco Frame */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#C8A661]/30" />
            <div className="absolute top-2 left-2 right-2 bottom-2 rounded-xl border border-[#C8A661]/20" />
            
            <div className="relative p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#1a1f2e] via-[#0f1420] to-[#0A1628]">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#C8A661]/40 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#C8A661]/40 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#C8A661]/40 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[#C8A661]/40 rounded-br-2xl" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <Crown className="w-5 h-5 text-[#C8A661]" />
                    <span className="text-sm text-[#C8A661] uppercase tracking-wider font-medium">Premium Service</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                    Ready to <span className="text-[#C8A661]">Own</span> Your Future?
                  </h3>
                  <p className="text-white/60 text-lg max-w-md">
                    Get pre-qualified with our trusted funding partners in minutes
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Link href="/funding-matcher">
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold shadow-lg shadow-green-500/20 border border-green-400/30 w-full sm:w-auto" data-testid="link-funding-bottom">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Match Me with Lenders
                    </Button>
                  </Link>
                  <Link href="/sell-your-laundromat">
                    <Button variant="outline" className="border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/10 w-full sm:w-auto" data-testid="link-sell">
                      <Plus className="w-4 h-4 mr-2" />
                      List Your Business
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
