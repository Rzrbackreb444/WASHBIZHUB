import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { 
  Building2, MapPin, DollarSign, Star, ArrowRight, 
  TrendingUp, ChevronRight, Sparkles, Crown, Gem
} from 'lucide-react';
import type { Listing } from '@shared/schema';

const CONSULT_EMAIL = 'consult@washbizhub.com';

interface ListingWithDetails extends Listing {
  financials?: {
    monthlyGross?: string;
    annualRevenue?: string;
    cashFlow?: string;
  };
  subscriptionTier?: string;
}

function formatPrice(price: string | null | undefined): string {
  if (!price) return "Contact for Price";
  const num = parseFloat(price);
  if (isNaN(num)) return "Contact for Price";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

function ListingSlide({ listing }: { listing: ListingWithDetails }) {
  const price = listing.priceInUSD || listing.priceOriginal;
  const cleanbiUrl = `/cleanbi-explorer?address=${encodeURIComponent(
    listing.exactAddress || `${listing.city}, ${listing.region}`
  )}`;

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-xl h-full">
      <div className="relative aspect-[16/9] overflow-hidden">
        {listing.featuredImage ? (
          <img 
            src={listing.featuredImage} 
            alt={listing.title}
            className="w-full h-full object-cover scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Building2 className="w-20 h-20 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex gap-2">
          {listing.subscriptionTier === 'diamond' ? (
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border-0">
              <Crown className="w-3 h-3 mr-1" />
              Diamond VIP
            </Badge>
          ) : listing.subscriptionTier === 'showcase' ? (
            <Badge className="bg-gradient-to-r from-[#C8A661] to-amber-500 text-white shadow-lg border-0">
              <Gem className="w-3 h-3 mr-1" />
              Showcase
            </Badge>
          ) : listing.subscriptionTier === 'basic' ? (
            <Badge className="bg-emerald-500 text-white shadow-lg border-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              Enhanced
            </Badge>
          ) : (
            <Badge className="bg-accent text-accent-foreground shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
          <div className="text-white">
            <div className="text-3xl font-bold mb-1">
              {formatPrice(price)}
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4" />
              <span>{listing.city}, {listing.region}</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-bold text-lg line-clamp-2 mb-3">
          {listing.title}
        </h3>
        
        {listing.tagline && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {listing.tagline}
          </p>
        )}
        
        {listing.financials?.monthlyGross && (
          <div className="flex items-center gap-2 text-sm bg-green-500/10 text-green-600 dark:text-green-400 rounded-md px-3 py-2 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">${listing.financials.monthlyGross}/mo revenue</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Link href={`/listing/${listing.slug || listing.id}`} className="flex-1">
            <Button className="w-full" data-testid={`button-view-listing-${listing.id}`}>
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href={cleanbiUrl}>
            <Button 
              variant="outline" 
              className="cleanbi-featured-nav"
              data-testid={`button-carousel-cleanbi-${listing.id}`}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ListYourLaundromatSlide() {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-xl h-full">
      <div className="flex flex-col justify-center items-center text-center p-8 h-full min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10" />
        </div>
        
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          List Your Laundromat
        </h3>
        
        <p className="text-primary-foreground/80 mb-6 max-w-sm">
          Get your laundromat in front of thousands of qualified buyers. 
          Featured listings sell 3x faster.
        </p>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/sell-your-laundromat">
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-full"
              data-testid="button-carousel-list-laundromat"
            >
              Start Selling
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a href={`mailto:${CONSULT_EMAIL}?subject=Listing%20Inquiry`}>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full border-white/30 text-white hover:bg-white/10"
              data-testid="button-carousel-contact-sell"
            >
              Talk to an Expert
            </Button>
          </a>
        </div>
        
        <div className="mt-6 flex items-center gap-4 text-sm text-primary-foreground/70">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span>Free Valuation</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>No Upfront Fees</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CarouselSkeleton() {
  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
            <Card className="overflow-hidden">
              <Skeleton className="aspect-[16/9] w-full" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturedListingsCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const autoplayPausedRef = useRef(false);
  const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { data: listings, isLoading } = useQuery<ListingWithDetails[]>({
    queryKey: ['/api/listings/featured-carousel'],
    staleTime: 60000,
  });

  const pauseAutoplay = useCallback(() => {
    autoplayPausedRef.current = true;
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    autoplayTimeoutRef.current = setTimeout(() => {
      autoplayPausedRef.current = false;
    }, 15000);
  }, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    setCurrent(api.selectedScrollSnap());
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    
    const onPointerDown = () => pauseAutoplay();
    api.on('pointerDown', onPointerDown);
    
    const interval = setInterval(() => {
      if (!autoplayPausedRef.current) {
        api.scrollNext();
      }
    }, 10000);
    
    return () => {
      api.off('pointerDown', onPointerDown);
      clearInterval(interval);
    };
  }, [api, pauseAutoplay]);

  const scrollTo = useCallback((index: number) => {
    pauseAutoplay();
    api?.scrollTo(index);
  }, [api, pauseAutoplay]);

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Opportunities</h2>
            <p className="text-muted-foreground">Verified laundromat listings with real financials</p>
          </div>
          <CarouselSkeleton />
        </div>
      </section>
    );
  }

  const featuredListings = listings || [];
  const totalSlides = featuredListings.length + 1;

  return (
    <section className="py-12 bg-muted/30" data-testid="section-featured-carousel">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">
            <Star className="w-3 h-3 mr-1" />
            Featured Listings
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Investment Opportunities</h2>
          <p className="text-muted-foreground">
            Verified laundromat listings with real financials and CLEANBI analysis
          </p>
        </div>
        
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
            dragFree: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {featuredListings.map((listing) => (
              <CarouselItem 
                key={listing.id} 
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <ListingSlide listing={listing} />
              </CarouselItem>
            ))}
            <CarouselItem className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <ListYourLaundromatSlide />
            </CarouselItem>
          </CarouselContent>
          
          <div className="hidden md:block">
            <CarouselPrevious className="left-0 -translate-x-1/2" />
            <CarouselNext className="right-0 translate-x-1/2" />
          </div>
        </Carousel>
        
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                current === index 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              data-testid={`button-carousel-dot-${index}`}
            />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/buy-laundromat">
            <Button variant="outline" size="lg" data-testid="button-view-all-listings">
              View All Listings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedListingsCarousel;
