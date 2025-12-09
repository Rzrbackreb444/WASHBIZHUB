import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { RecentlyViewedListings } from "@/components/RecentlyViewedListings";
import { PushNotificationOptIn, NotificationBell } from "@/components/PushNotificationOptIn";
import { RequestProfessionalAnalysisCTA } from "@/components/consultation/RequestProfessionalAnalysisCTA";
import { Link } from "wouter";
import { 
  MapPin, DollarSign, TrendingUp, Building2, Search, Filter,
  Zap, Phone, Mail, ExternalLink, Star, Clock, Users, ChevronRight,
  CheckCircle2, Crown, Facebook
} from "lucide-react";
import { useState } from "react";
import type { Listing } from "@shared/schema";

const CONSULT_EMAIL = "consult@washbizhub.com";

interface ListingWithDetails extends Listing {
  financials?: {
    monthlyGross?: string;
    monthlyNet?: string;
    roi?: string;
  };
}

function formatPrice(price: string | null | undefined): string {
  if (!price) return "Contact for Price";
  const num = parseFloat(price);
  if (isNaN(num)) return "Contact for Price";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

function ListingCard({ listing }: { listing: ListingWithDetails }) {
  const price = listing.priceInUSD || listing.priceOriginal;
  const cleanbiUrl = `/cleanbi-explorer?address=${encodeURIComponent(
    listing.exactAddress || `${listing.city}, ${listing.region}`
  )}`;
  
  const handleInquiry = () => {
    const subject = encodeURIComponent(`Inquiry: ${listing.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in learning more about:\n\n${listing.title}\nLocation: ${listing.city}, ${listing.region}\nAsking Price: ${formatPrice(price)}\n\nPlease contact me with more details.\n\nThank you!`
    );
    window.location.href = `mailto:${CONSULT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <Card 
      className="group overflow-hidden hover-elevate transition-all duration-300 flex flex-col h-full"
      data-testid={`card-listing-${listing.id}`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {listing.featuredImage ? (
          <img 
            src={listing.featuredImage} 
            alt={listing.title}
            className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Building2 className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {listing.featured && (
            <Badge className="bg-accent text-accent-foreground shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {(listing as any).larryVerified && (
            <Badge className="bg-[#C8A661] text-[#1e3a5f] shadow-lg border border-[#C8A661]">
              <Crown className="w-3 h-3 mr-1" />
              Larry Verified
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {listing.status === 'active' ? 'Available' : listing.status}
          </Badge>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="text-white font-bold text-xl">
            {formatPrice(price)}
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2 leading-tight">
          {listing.title}
        </CardTitle>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{listing.city}, {listing.region}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {listing.tagline && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.tagline}
          </p>
        )}
        
        {listing.brokerName && (
          <div className="flex items-center gap-2 text-sm bg-accent/10 rounded-md px-3 py-2">
            <Users className="w-4 h-4 text-accent shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-foreground truncate">{listing.brokerName}</div>
              {listing.brokerPhone && (
                <a href={`tel:${listing.brokerPhone}`} className="text-accent hover:underline text-xs">
                  {listing.brokerPhone}
                </a>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {listing.financials?.monthlyGross && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-muted-foreground text-xs">Monthly Gross</div>
                <div className="font-semibold">${listing.financials.monthlyGross}</div>
              </div>
            </div>
          )}
          {listing.financials?.roi && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <div>
                <div className="text-muted-foreground text-xs">ROI</div>
                <div className="font-semibold">{listing.financials.roi}%</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-auto space-y-2">
          <Link href={cleanbiUrl}>
            <Button 
              className="w-full cleanbi-featured-nav text-sm h-9"
              data-testid={`button-cleanbi-${listing.id}`}
            >
              <Zap className="w-4 h-4 mr-2" />
              Analyze with CLEANBI
            </Button>
          </Link>
          
          <Link href={`/ai-consultation-council?address=${encodeURIComponent(listing.exactAddress || `${listing.city}, ${listing.region}`)}&listing=${listing.id}`}>
            <Button 
              variant="outline"
              size="sm"
              className="w-full"
              data-testid={`button-council-${listing.id}`}
            >
              <Users className="w-4 h-4 mr-2" />
              AI Expert Council — From $49
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Link href={`/listing/${listing.slug}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm" data-testid={`button-view-${listing.id}`}>
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleInquiry}
              data-testid={`button-inquire-${listing.id}`}
            >
              <Mail className="w-4 h-4" />
            </Button>
          </div>
          
          <RequestProfessionalAnalysisCTA
            variant="inline"
            consultationData={{
              type: "listing",
              listingName: listing.title,
              listingPrice: parseFloat(price || "0"),
              listingId: listing.id?.toString()
            }}
            buttonText="Get Expert Analysis"
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ListingSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video" />
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-9 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

export default function BuyLaundromat() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const { data: listings = [], isLoading } = useQuery<ListingWithDetails[]>({
    queryKey: ['/api/listings?status=active'],
  });

  const filteredListings = listings
    .filter(listing => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          listing.title.toLowerCase().includes(query) ||
          listing.city?.toLowerCase().includes(query) ||
          listing.region?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(listing => {
      if (priceFilter === "all") return true;
      const priceVal = parseFloat(listing.priceInUSD || listing.priceOriginal || "0");
      switch (priceFilter) {
        case "under100k": return priceVal < 100000;
        case "100k-250k": return priceVal >= 100000 && priceVal < 250000;
        case "250k-500k": return priceVal >= 250000 && priceVal < 500000;
        case "500k-1m": return priceVal >= 500000 && priceVal < 1000000;
        case "over1m": return priceVal >= 1000000;
        default: return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "featured":
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        case "price-low":
          return parseFloat(a.priceInUSD || a.priceOriginal || "0") - parseFloat(b.priceInUSD || b.priceOriginal || "0");
        case "price-high":
          return parseFloat(b.priceInUSD || b.priceOriginal || "0") - parseFloat(a.priceInUSD || a.priceOriginal || "0");
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

  return (
    <>
      <SEO 
        title="Laundromats For Sale | Buy a Laundromat Business | WashBizHub"
        description="Browse verified laundromat listings for sale. Real financials, CLEANBI location analysis, and direct broker connections. Find your perfect laundromat investment."
        canonicalUrl="/buy-laundromat"
        ogType="website"
        keywords={[
          "laundromat for sale",
          "buy laundromat",
          "laundromat business for sale",
          "coin laundry for sale",
          "laundromat listings",
          "laundromat investment",
          "buy coin laundry business"
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Laundromats For Sale",
          "description": "Verified laundromat business listings with real financials and location analysis",
          "url": "https://washbizhub.com/buy-laundromat",
          "numberOfItems": filteredListings.length
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Buy a Laundromat", url: "/buy-laundromat" }
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  <Building2 className="w-3 h-3 mr-1" />
                  Verified Listings Only
                </Badge>
                <NotificationBell />
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4" data-testid="text-page-title">
                Laundromats For Sale
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                Real financials. Real locations. CLEANBI-verified opportunities.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by city, state, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background text-foreground"
                  data-testid="input-search"
                />
              </div>
              
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-background text-foreground" data-testid="select-price">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under100k">Under $100K</SelectItem>
                  <SelectItem value="100k-250k">$100K - $250K</SelectItem>
                  <SelectItem value="250k-500k">$250K - $500K</SelectItem>
                  <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                  <SelectItem value="over1m">Over $1M</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40 h-12 bg-background text-foreground" data-testid="select-sort">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured First</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <RecentlyViewedListings />
          
          <div className="mb-8">
            <RequestProfessionalAnalysisCTA
              variant="card"
              consultationData={{
                type: "general"
              }}
              buttonText="Request Marketplace Consultation"
            />
          </div>
          
          <Card className="mb-8 bg-gradient-to-r from-[#1877f2]/10 to-[#1877f2]/5 border-[#1877f2]/20">
            <CardContent className="py-4 px-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-[#1877f2]/20">
                    <Facebook className="w-5 h-5 text-[#1877f2]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Join 72,000+ Laundromat Owners</p>
                    <p className="text-sm text-muted-foreground">Get real-time deals, advice, and industry insights</p>
                  </div>
                </div>
                <a
                  href="https://facebook.com/groups/thelaundromat"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-[#1877f2] hover:bg-[#1877f2]/90 text-white" data-testid="button-join-community">
                    <Facebook className="w-4 h-4 mr-2" />
                    Join Free Community
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : `${filteredListings.length} listings found`}
            </p>
            
            <Link href="/sell-your-laundromat">
              <Button variant="outline" size="sm" data-testid="button-list-yours">
                List Your Laundromat
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <ListingSkeleton key={i} />)}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Listings Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find more opportunities.
              </p>
              <Button onClick={() => { setSearchQuery(""); setPriceFilter("all"); }}>
                Clear Filters
              </Button>
            </Card>
          )}
          
          <Card className="mt-12 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-2">Looking for Something Specific?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Our network of verified brokers can help you find the perfect laundromat opportunity. 
                Get personalized recommendations based on your investment criteria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/brokers">
                  <Button size="lg" data-testid="button-browse-brokers">
                    Browse Broker Directory
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    window.location.href = `mailto:${CONSULT_EMAIL}?subject=${encodeURIComponent("Laundromat Buyer Inquiry")}&body=${encodeURIComponent("Hi,\n\nI'm looking for a laundromat to purchase. Here are my criteria:\n\nBudget: \nPreferred Location: \nOther Requirements: \n\nPlease help me find suitable opportunities.\n\nThank you!")}`;
                  }}
                  data-testid="button-contact-us"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Our Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <PushNotificationOptIn />
    </>
  );
}
