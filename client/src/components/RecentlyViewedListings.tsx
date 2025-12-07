import { useQueries } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Building2, MapPin, ChevronRight, Clock, X, Star, Crown, Gem, TrendingUp
} from 'lucide-react';
import { useRecentlyViewedListings } from '@/hooks/useRecentlyViewedListings';
import type { Listing } from '@shared/schema';

function formatPrice(price: string | null | undefined): string {
  if (!price) return "Contact for Price";
  const num = parseFloat(price);
  if (isNaN(num)) return "Contact for Price";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

function ListingCardSkeleton() {
  return (
    <Card className="min-w-[280px] max-w-[280px] overflow-hidden flex-shrink-0">
      <Skeleton className="aspect-[16/10] w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

interface ListingCardProps {
  listing: Listing;
}

function RecentListingCard({ listing }: ListingCardProps) {
  const price = listing.priceInUSD || listing.priceOriginal;

  return (
    <Card 
      className="min-w-[280px] max-w-[280px] overflow-hidden flex-shrink-0 hover-elevate transition-all duration-300"
      data-testid={`card-recently-viewed-${listing.id}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {listing.featuredImage ? (
          <img 
            src={listing.featuredImage} 
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Building2 className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex gap-1.5">
          {listing.subscriptionTier === 'diamond' ? (
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border-0 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              VIP
            </Badge>
          ) : listing.subscriptionTier === 'showcase' ? (
            <Badge className="bg-gradient-to-r from-[#C8A661] to-amber-500 text-white shadow-lg border-0 text-xs">
              <Gem className="w-3 h-3 mr-1" />
              Showcase
            </Badge>
          ) : listing.subscriptionTier === 'basic' ? (
            <Badge className="bg-emerald-500 text-white shadow-lg border-0 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Enhanced
            </Badge>
          ) : listing.featured ? (
            <Badge className="bg-accent text-accent-foreground shadow-lg text-xs">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          ) : null}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="text-white font-bold text-lg">
            {formatPrice(price)}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 leading-tight">
          {listing.title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{listing.city}, {listing.region}</span>
        </div>
        
        <Link href={`/listing/${listing.slug || listing.id}`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            data-testid={`button-view-recently-viewed-${listing.id}`}
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function RecentlyViewedListings() {
  const { recentlyViewedIds, clearRecentlyViewed } = useRecentlyViewedListings();
  
  const listingQueries = useQueries({
    queries: recentlyViewedIds.map((id) => ({
      queryKey: ['/api/listings', id],
      queryFn: async (): Promise<Listing | null> => {
        try {
          const response = await fetch(`/api/listings/${id}`);
          if (!response.ok) return null;
          return response.json();
        } catch {
          return null;
        }
      },
      staleTime: 60000,
      retry: 1,
    })),
  });

  const isLoading = listingQueries.some((query) => query.isLoading);
  const listings = listingQueries
    .map((query) => query.data)
    .filter((listing): listing is Listing => listing !== null && listing !== undefined);

  if (recentlyViewedIds.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-8 bg-muted/30"
      data-testid="section-recently-viewed"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C8A661]" />
            <h2 className="text-xl font-bold text-foreground">
              Recently Viewed
            </h2>
            <Badge variant="secondary" className="text-xs">
              {recentlyViewedIds.length}
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearRecentlyViewed}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-clear-recently-viewed"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {isLoading ? (
              Array.from({ length: Math.min(recentlyViewedIds.length, 4) }).map((_, index) => (
                <ListingCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : listings.length > 0 ? (
              listings.map((listing) => (
                <RecentListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="text-muted-foreground text-sm py-4">
                No listings found. They may have been removed.
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}

export default RecentlyViewedListings;
