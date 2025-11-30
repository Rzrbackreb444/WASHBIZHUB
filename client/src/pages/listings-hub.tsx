import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, MapPin, DollarSign, TrendingUp, Search, 
  Star, Eye, Clock, ArrowRight, Plus, Crown, Sparkles,
  Image as ImageIcon, Gem
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import type { Listing } from '@shared/schema';

function generateListingsStructuredData(listings: Listing[], baseUrl: string) {
  if (!listings || listings.length === 0) return null;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Laundromat and Business Listings For Sale",
    "description": "Browse premium laundromat business opportunities with CLEANBI™ scoring, owner financing options, and professional broker support.",
    "numberOfItems": listings.length,
    "itemListElement": listings.map((listing, index) => {
      const locationParts = [];
      if (listing.city) locationParts.push(listing.city);
      if (listing.region) locationParts.push(listing.region);
      if (listing.country) locationParts.push(listing.country);
      
      const addressLocality = listing.city || listing.generalLocation || undefined;
      const addressRegion = listing.region || undefined;
      const addressCountry = listing.country || 'US';

      const price = listing.priceInUSD ? parseFloat(listing.priceInUSD) : undefined;

      const listItem: Record<string, unknown> = {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "LocalBusiness",
          "@id": `${baseUrl}/listing/${listing.slug || listing.id}`,
          "name": listing.title,
          "description": listing.tagline || listing.description?.substring(0, 160) || `${listing.businessType} business opportunity`,
          "url": `${baseUrl}/listing/${listing.slug || listing.id}`,
          "image": listing.featuredImage || `${baseUrl}/washbizhub-logo.png`,
          ...(addressLocality || addressRegion ? {
            "address": {
              "@type": "PostalAddress",
              ...(addressLocality && { "addressLocality": addressLocality }),
              ...(addressRegion && { "addressRegion": addressRegion }),
              "addressCountry": addressCountry
            }
          } : {}),
          ...(listing.latitude && listing.longitude ? {
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": parseFloat(listing.latitude as string),
              "longitude": parseFloat(listing.longitude as string)
            }
          } : {}),
          "additionalType": `https://schema.org/${listing.businessType === 'laundromat' ? 'Laundromat' : 'LocalBusiness'}`,
          ...(price ? {
            "priceRange": price >= 1000000 ? "$$$$$" : price >= 500000 ? "$$$$" : price >= 250000 ? "$$$" : "$$",
            "makesOffer": {
              "@type": "Offer",
              "price": price,
              "priceCurrency": listing.currency || "USD",
              "availability": listing.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
              "itemOffered": {
                "@type": "Product",
                "name": listing.title,
                "category": listing.businessType
              }
            }
          } : {})
        }
      };

      return listItem;
    })
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Laundromats For Sale | Premium Business Listings",
    "description": "Discover vetted laundromat opportunities with CLEANBI™ scoring. Browse premium listings from $60K to $650K+ with owner financing, NDA protection, and professional broker support.",
    "url": `${baseUrl}/listings-hub`,
    "mainEntity": {
      "@id": `${baseUrl}/listings-hub#itemlist`
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Listings",
          "item": `${baseUrl}/listings-hub`
        }
      ]
    }
  };

  return [itemListSchema, collectionPageSchema];
}

type SubscriptionTier = 'free' | 'basic' | 'showcase' | 'diamond';

const tierOrder: Record<SubscriptionTier, number> = {
  diamond: 0,
  showcase: 1,
  basic: 2,
  free: 3,
};

function TierBadge({ tier }: { tier: SubscriptionTier }) {
  if (tier === 'free') return null;
  
  if (tier === 'diamond') {
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/20 border-0 gap-1">
        <Crown className="w-3 h-3" />
        Diamond
      </Badge>
    );
  }
  
  if (tier === 'showcase') {
    return (
      <Badge className="bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0 gap-1">
        <Star className="w-3 h-3" />
        Showcase
      </Badge>
    );
  }
  
  if (tier === 'basic') {
    return (
      <Badge className="bg-primary/10 text-primary border border-primary/20 gap-1">
        <Gem className="w-3 h-3" />
        Basic
      </Badge>
    );
  }
  
  return null;
}

export default function ListingsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under-250k' | '250k-500k' | '500k-1m' | 'over-1m'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'featured'>('all');

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
  });

  const formatPrice = (price: string | null | undefined): string => {
    if (!price) return 'Call for Price';
    const num = parseFloat(price);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const getLocation = (listing: Listing): string => {
    const parts = [];
    if (listing.city) parts.push(listing.city);
    if (listing.region) parts.push(listing.region);
    return parts.join(', ') || listing.generalLocation || 'Location Available';
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.generalLocation || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (statusFilter === 'featured' && !listing.featured) return false;
    if (statusFilter === 'active' && listing.status !== 'active') return false;
    
    if (priceFilter !== 'all' && listing.priceInUSD) {
      const price = parseFloat(listing.priceInUSD);
      if (priceFilter === 'under-250k' && price >= 250000) return false;
      if (priceFilter === '250k-500k' && (price < 250000 || price >= 500000)) return false;
      if (priceFilter === '500k-1m' && (price < 500000 || price >= 1000000)) return false;
      if (priceFilter === 'over-1m' && price < 1000000) return false;
    }
    
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    const tierA = (a.subscriptionTier as SubscriptionTier) || 'free';
    const tierB = (b.subscriptionTier as SubscriptionTier) || 'free';
    
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    return tierOrder[tierA] - tierOrder[tierB];
  });

  const featuredListings = sortedListings.filter(l => l.featured);
  const regularListings = sortedListings.filter(l => !l.featured);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';
  const structuredData = useMemo(() => 
    generateListingsStructuredData(listings, baseUrl), 
    [listings, baseUrl]
  );

  return (
    <>
      <SEO
        title="Laundromats For Sale | Premium Business Listings | WashBizHub"
        description="Discover vetted laundromat opportunities with CLEANBI™ scoring. Browse premium listings from $60K to $650K+ with owner financing, NDA protection, and professional broker support."
        canonicalUrl="/listings-hub"
        keywords={['laundromat for sale', 'buy laundromat', 'laundromat listings', 'CLEANBI score', 'laundry business opportunity', 'coin laundry for sale']}
        structuredData={structuredData || undefined}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-background">
        <section 
          className="relative py-20 bg-gradient-to-br from-[#001F3F] via-[#002B5C] to-[#001F3F] overflow-hidden"
          data-testid="section-listings-hero"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#39CCCC] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#D4AF37] rounded-full blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-1.5">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                Business Opportunities
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-1.5">
                {listings.length} Active Listings
              </Badge>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Premium Laundromat Listings
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl">
              Vetted opportunities with detailed financials, CLEANBI™ location scoring, 
              and direct broker contact. From $60K turnkey to $650K+ premium locations.
            </p>

            <div className="max-w-3xl">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  placeholder="Search by city, state, or listing name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg rounded-xl"
                  data-testid="input-search-listings"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-white/60 text-sm self-center mr-2">Status:</span>
                {(['all', 'active', 'featured'] as const).map((status) => (
                  <Button 
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                    size="sm"
                    className={statusFilter === status 
                      ? 'bg-[#39CCCC] hover:bg-[#39CCCC]/90 text-[#001F3F]' 
                      : 'border-white/30 text-white hover:bg-white/10'}
                    data-testid={`button-filter-${status}`}
                  >
                    {status === 'featured' && <Crown className="w-3.5 h-3.5 mr-1" />}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-white/60 text-sm self-center mr-2">Price:</span>
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: 'under-250k', label: 'Under $250K' },
                  { value: '250k-500k', label: '$250K - $500K' },
                  { value: '500k-1m', label: '$500K - $1M' },
                  { value: 'over-1m', label: '$1M+' },
                ].map(({ value, label }) => (
                  <Button 
                    key={value}
                    variant={priceFilter === value ? 'default' : 'outline'}
                    onClick={() => setPriceFilter(value as typeof priceFilter)}
                    size="sm"
                    className={priceFilter === value 
                      ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F]' 
                      : 'border-white/30 text-white hover:bg-white/10'}
                    data-testid={`button-price-${value}`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {sortedListings.length} {sortedListings.length === 1 ? 'Listing' : 'Listings'} Available
              </h2>
              <p className="text-muted-foreground">
                {featuredListings.length > 0 && `${featuredListings.length} featured • `}
                Updated daily with new opportunities
              </p>
            </div>
            <Link href="/listing-form">
              <Button 
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F] font-semibold gap-2"
                data-testid="button-add-listing"
              >
                <Plus className="w-4 h-4" />
                List Your Business
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedListings.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="pt-12 pb-12 text-center">
                <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Listings Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? `No listings match "${searchQuery}". Try adjusting your search or filters.`
                    : 'No listings match your current filters. Try adjusting your criteria.'}
                </p>
                <div className="flex justify-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => { setSearchQuery(''); setPriceFilter('all'); setStatusFilter('all'); }}
                  >
                    Clear Filters
                  </Button>
                  <Link href="/listing-form">
                    <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F]">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your Listing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {featuredListings.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-xl font-bold">Featured Listings</h3>
                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">Premium</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {featuredListings.map(listing => (
                      <ListingCard key={listing.id} listing={listing} featured />
                    ))}
                  </div>
                </div>
              )}

              {regularListings.length > 0 && (
                <div>
                  {featuredListings.length > 0 && (
                    <h3 className="text-xl font-bold mb-4">All Listings</h3>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularListings.map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <Card className="mt-12 bg-gradient-to-r from-[#001F3F] to-[#002B5C] border-[#39CCCC]/30">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Sell Your Laundromat?</h3>
                  <p className="text-white/70 max-w-xl">
                    List with WashBizHub and reach 72,000+ qualified buyers. 
                    Get a free CLEANBI™ score and professional listing support.
                  </p>
                </div>
                <Link href="/listing-form">
                  <Button 
                    size="lg" 
                    className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F] font-semibold whitespace-nowrap"
                    data-testid="button-cta-list-business"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ListingCard({ listing, featured = false }: { listing: Listing; featured?: boolean }) {
  const tier = (listing.subscriptionTier as SubscriptionTier) || 'free';
  const isDiamond = tier === 'diamond';
  const isShowcase = tier === 'showcase';
  
  const formatPrice = (price: string | null | undefined): string => {
    if (!price) return 'Call for Price';
    const num = parseFloat(price);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const getLocation = (): string => {
    const parts = [];
    if (listing.city) parts.push(listing.city);
    if (listing.region) parts.push(listing.region);
    return parts.join(', ') || listing.generalLocation || 'Location Available';
  };

  const defaultImage = 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=600&h=400&fit=crop';

  const getCardClasses = () => {
    const baseClasses = 'overflow-hidden flex flex-col transition-all duration-300 group relative';
    
    if (isDiamond) {
      return `${baseClasses} ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1`;
    }
    
    if (isShowcase) {
      return `${baseClasses} ring-1 ring-slate-400/30 hover:shadow-xl hover:-translate-y-1`;
    }
    
    if (featured) {
      return `${baseClasses} ring-2 ring-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/5 to-transparent hover:shadow-xl hover:-translate-y-1`;
    }
    
    return `${baseClasses} hover:shadow-lg hover:-translate-y-0.5`;
  };

  return (
    <Card 
      className={getCardClasses()}
      data-testid={`card-listing-${listing.id}`}
    >
      {featured && (
        <div className="absolute top-0 right-0 z-20">
          <div className="bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#001F3F] text-xs font-bold px-3 py-1.5 rounded-bl-lg shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            FEATURED
          </div>
        </div>
      )}
      
      <div className="relative">
        <div 
          className="h-48 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${listing.featuredImage || defaultImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {isDiamond && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-amber-500/5 pointer-events-none" />
        )}
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <TierBadge tier={tier} />
          {listing.ownerFinancing && (
            <Badge className="bg-green-500 text-white border-0 shadow-lg">
              Owner Financing
            </Badge>
          )}
          {listing.requiresNDA && (
            <Badge className="bg-blue-500 text-white border-0 shadow-lg">
              NDA Required
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="text-2xl font-black text-white drop-shadow-lg">
            {formatPrice(listing.priceOriginal || listing.priceInUSD)}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          <Eye className="w-3 h-3" />
          {listing.viewCount || 0}
        </div>
      </div>

      <CardHeader className="flex-1 pb-3 pt-4">
        <CardTitle className="line-clamp-2 text-lg leading-tight group-hover:text-[#39CCCC] transition-colors">
          {listing.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{getLocation()}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 pb-5">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {listing.tagline || listing.description?.slice(0, 120) + '...'}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-muted/50 rounded-lg p-2.5">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Type</div>
            <div className="font-semibold capitalize">{listing.businessType}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">Listing</div>
            <div className="font-semibold capitalize">{listing.listingType}</div>
          </div>
        </div>

        <Link href={`/listing/${listing.slug || listing.id}`}>
          <Button 
            className={`w-full group/btn ${
              isDiamond 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white' 
                : 'bg-[#001F3F] hover:bg-[#002B5C] text-white'
            }`}
            data-testid={`button-view-${listing.id}`}
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
