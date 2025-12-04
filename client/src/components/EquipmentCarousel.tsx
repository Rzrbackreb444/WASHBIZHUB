import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wrench, DollarSign, MapPin, ArrowRight, Plus, Sparkles,
  ChevronLeft, ChevronRight, Package, Star, TrendingUp, Banknote
} from "lucide-react";
import { useState, useRef } from "react";
import type { EquipmentListing } from "@shared/schema";

interface EquipmentCarouselProps {
  showListCTA?: boolean;
  maxItems?: number;
}

const conditionColors: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  "like-new": { bg: "bg-green-500/10", text: "text-green-600" },
  excellent: { bg: "bg-blue-500/10", text: "text-blue-600" },
  good: { bg: "bg-amber-500/10", text: "text-amber-600" },
  fair: { bg: "bg-orange-500/10", text: "text-orange-600" },
  "for-parts": { bg: "bg-gray-500/10", text: "text-gray-600" },
};

const categoryLabels: Record<string, string> = {
  washers: "Commercial Washer",
  dryers: "Commercial Dryer",
  stacked: "Stacked Unit",
  "coin-op": "Coin Mechanism",
  "card-systems": "Card System",
  parts: "Parts & Components",
  "water-heaters": "Water Heater",
  "carts-baskets": "Cart/Basket",
  "folding-tables": "Folding Table",
  vending: "Vending Machine",
  signage: "Signage",
  other: "Equipment",
};

function EquipmentCard({ listing }: { listing: EquipmentListing }) {
  const condition = conditionColors[listing.condition] || conditionColors.good;
  
  return (
    <Card 
      className="group flex-shrink-0 w-[280px] sm:w-[320px] border-border/50 hover:border-accent/30 transition-all duration-300 hover-elevate overflow-hidden"
      data-testid={`card-equipment-${listing.id}`}
    >
      <div className="relative h-44 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`${condition.bg} ${condition.text} border-0 text-xs font-medium`}>
            {listing.condition?.replace("-", " ") || "Good"}
          </Badge>
          {listing.brand && (
            <Badge variant="secondary" className="text-xs font-medium bg-background/80 backdrop-blur-sm">
              {listing.brand}
            </Badge>
          )}
        </div>
        
        {listing.price && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-accent text-accent-foreground border-0 text-sm font-bold px-3 py-1">
              ${Number(listing.price).toLocaleString()}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">
            {categoryLabels[listing.category] || "Equipment"}
          </p>
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
            {listing.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{listing.city}, {listing.state}</span>
        </div>
        
        <div className="flex gap-2 pt-1">
          <Link href={`/equipment/${listing.id}`} className="flex-1">
            <Button size="sm" className="w-full" data-testid={`button-view-equipment-${listing.id}`}>
              View Details
            </Button>
          </Link>
          <Link href="/funding">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-accent/30 text-accent hover:bg-accent/10"
              data-testid={`button-funding-equipment-${listing.id}`}
            >
              <Banknote className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderEquipmentCard() {
  return (
    <Card 
      className="group flex-shrink-0 w-[280px] sm:w-[320px] border-dashed border-2 border-accent/30 hover:border-accent/50 transition-all duration-300 hover-elevate overflow-hidden bg-accent/5"
      data-testid="card-equipment-placeholder"
    >
      <div className="relative h-44 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <p className="text-sm font-medium text-accent">Your Equipment Here</p>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-xs text-accent/70 font-medium mb-1">
            Featured Listing Spot
          </p>
          <h3 className="font-semibold text-foreground">
            Sell Your Equipment Today
          </h3>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Reach 72,000+ laundromat owners actively looking for quality equipment.
        </p>
        
        <Link href="/list-equipment" className="block">
          <Button size="sm" className="w-full bg-accent hover:bg-accent/90" data-testid="button-list-equipment-placeholder">
            <Plus className="w-4 h-4 mr-2" />
            List Equipment Free
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function EquipmentCarousel({ showListCTA = true, maxItems = 10 }: EquipmentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: equipment, isLoading } = useQuery<EquipmentListing[]>({
    queryKey: ['/api/equipment-listings', { status: 'active' }],
  });

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const displayItems = equipment?.slice(0, maxItems) || [];
  const showPlaceholder = displayItems.length === 0;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30" data-testid="section-equipment-carousel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10">
                <Wrench className="w-3.5 h-3.5 mr-1" />
                Equipment Marketplace
              </Badge>
              {displayItems.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {displayItems.length} Available
                </Badge>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Buy & Sell Commercial Equipment
            </h2>
            <p className="text-muted-foreground mt-1">
              Quality washers, dryers, and parts from verified sellers
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="rounded-full"
                data-testid="button-carousel-left"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="rounded-full"
                data-testid="button-carousel-right"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Link href="/equipment-marketplace">
              <Button variant="outline" className="group" data-testid="button-view-all-equipment">
                View All
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="flex-shrink-0 w-[280px] sm:w-[320px]">
                <Skeleton className="h-44 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayItems.map((item) => (
              <div key={item.id} className="snap-start">
                <EquipmentCard listing={item} />
              </div>
            ))}
            
            {showPlaceholder && (
              <>
                <PlaceholderEquipmentCard />
                <PlaceholderEquipmentCard />
                <PlaceholderEquipmentCard />
              </>
            )}
            
            {showListCTA && displayItems.length > 0 && (
              <PlaceholderEquipmentCard />
            )}
          </div>
        )}

        {showListCTA && (
          <div className="mt-10 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-2xl p-6 sm:p-8 border border-accent/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  <span className="text-sm font-medium text-accent">FREE Listing</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Have Equipment to Sell?
                </h3>
                <p className="text-muted-foreground max-w-lg">
                  List your commercial washers, dryers, or parts and reach 72,000+ laundromat owners. 
                  Includes financing options for your buyers through our funding partners.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/list-equipment">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 min-w-[180px]" data-testid="button-list-equipment-cta">
                    <Plus className="w-5 h-5 mr-2" />
                    List Your Equipment
                  </Button>
                </Link>
                <Link href="/funding">
                  <Button size="lg" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10" data-testid="button-equipment-funding">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Explore Funding
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
