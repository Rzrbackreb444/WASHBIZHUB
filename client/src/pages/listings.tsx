import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, DollarSign, TrendingUp, Building,
  Filter, Search, Droplets, Car, Shirt, Sparkles, Target, Loader2
} from "lucide-react";
import { useLocation } from "wouter";

interface Listing {
  id: string;
  businessType: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  askingPrice: string;
  annualRevenue: string | null;
  monthlyProfit: string | null;
  squareFootage: number | null;
  washers: number | null;
  dryers: number | null;
  cleanbiScore: number | null;
  marketOpportunity: number | null;
  slug: string;
  photos: string[] | null;
  featured: boolean;
  verified: boolean;
  views: number;
  inquiries: number;
  createdAt: string;
}

export default function Listings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [businessType, setBusinessType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case "car_wash": return Car;
      case "dry_cleaner": return Shirt;
      default: return Droplets;
    }
  };

  const getBusinessLabel = (type: string) => {
    switch (type) {
      case "car_wash": return "Car Wash";
      case "dry_cleaner": return "Dry Cleaner";
      default: return "Laundromat";
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = businessType === "all" || listing.businessType === businessType;
    const matchesState = stateFilter === "all" || listing.state === stateFilter;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = parseFloat(listing.askingPrice);
      if (priceRange === "0-250k") matchesPrice = price < 250000;
      else if (priceRange === "250k-500k") matchesPrice = price >= 250000 && price < 500000;
      else if (priceRange === "500k-1m") matchesPrice = price >= 500000 && price < 1000000;
      else if (priceRange === "1m+") matchesPrice = price >= 1000000;
    }
    
    return matchesSearch && matchesType && matchesState && matchesPrice;
  });

  const featuredListings = filteredListings.filter(l => l.featured);
  const regularListings = filteredListings.filter(l => !l.featured);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Laundromat Marketplace
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover profitable laundromats, car washes, and dry cleaners for sale
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="City, state, or business name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger id="business-type" data-testid="select-business-type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="laundromat">Laundromats</SelectItem>
                    <SelectItem value="car_wash">Car Washes</SelectItem>
                    <SelectItem value="dry_cleaner">Dry Cleaners</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price-range">Price Range</Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger id="price-range" data-testid="select-price">
                    <SelectValue placeholder="All prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-250k">Under $250K</SelectItem>
                    <SelectItem value="250k-500k">$250K - $500K</SelectItem>
                    <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                    <SelectItem value="1m+">$1M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger id="state" data-testid="select-state">
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All Listings ({filteredListings.length})
            </TabsTrigger>
            <TabsTrigger value="featured" data-testid="tab-featured">
              Featured ({featuredListings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {featuredListings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent" />
                  Featured Listings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {featuredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted" />
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : regularListings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or check back later
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured">
            {featuredListings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No featured listings</h3>
                  <p className="text-muted-foreground">
                    Featured listings will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const BusinessIcon = getBusinessIcon(listing.businessType);
  const businessLabel = getBusinessLabel(listing.businessType);

  return (
    <Link href={`/listings/${listing.slug}`}>
      <Card className="hover-elevate active-elevate-2 h-full cursor-pointer" data-testid={`card-listing-${listing.id}`}>
        {listing.photos && listing.photos.length > 0 ? (
          <div className="h-48 bg-muted relative overflow-hidden">
            <img 
              src={listing.photos[0]} 
              alt={listing.businessName}
              className="w-full h-full object-cover"
            />
            {listing.featured && (
              <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                Featured
              </Badge>
            )}
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center relative">
            <BusinessIcon className="w-16 h-16 text-muted-foreground" />
            {listing.featured && (
              <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                Featured
              </Badge>
            )}
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="outline">{businessLabel}</Badge>
            {listing.verified && (
              <Badge variant="default" className="text-xs">Verified</Badge>
            )}
          </div>
          <CardTitle className="text-xl line-clamp-1">{listing.businessName}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.city}, {listing.state}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Asking Price</span>
            <span className="text-lg font-bold text-accent">
              ${(parseFloat(listing.askingPrice) / 1000).toFixed(0)}K
            </span>
          </div>

          {listing.annualRevenue && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Annual Revenue</span>
              <span className="font-semibold">
                ${(parseFloat(listing.annualRevenue) / 1000).toFixed(0)}K
              </span>
            </div>
          )}

          {listing.washers && listing.dryers && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{listing.washers} Washers</span>
              <span>{listing.dryers} Dryers</span>
            </div>
          )}
          
          <Button 
              size="sm"
              variant="outline" 
              className="w-full mt-3 border-accent/50 text-accent hover:bg-accent/10"
              data-testid={`button-cleanbi-analyze-${listing.id}`}
              disabled={loadingId === listing.id}
              onClick={(e) => {
                e.stopPropagation();
                setLoadingId(listing.id);
                navigate(`/cleanbi-explorer?address=${encodeURIComponent(listing.address || `${listing.city}, ${listing.state}`)}`);
              }}
            >
              {loadingId === listing.id ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <MapPin className="w-3 h-3 mr-1" />
              )}
              {loadingId === listing.id ? "Analyzing..." : "Analyze with CLEANBI"}
            </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

function getBusinessIcon(type: string) {
  switch (type) {
    case "car_wash": return Car;
    case "dry_cleaner": return Shirt;
    default: return Droplets;
  }
}

function getBusinessLabel(type: string) {
  switch (type) {
    case "car_wash": return "Car Wash";
    case "dry_cleaner": return "Dry Cleaner";
    default: return "Laundromat";
  }
}
