import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { RecentlyViewedListings } from "@/components/RecentlyViewedListings";
import { PushNotificationOptIn, NotificationBell } from "@/components/PushNotificationOptIn";
import { RequestProfessionalAnalysisCTA } from "@/components/consultation/RequestProfessionalAnalysisCTA";
import CLEANBIGradeBadge from "@/components/cleanbi/CLEANBIGradeBadge";
import { LazyGoogleMapsProvider } from "@/components/maps/LazyGoogleMapsProvider";
import { VirtualizedGrid } from "@/components/VirtualizedGrid";
import { Link } from "wouter";
import { 
  MapPin, DollarSign, TrendingUp, Building2, Search, Filter,
  Zap, Phone, Mail, ExternalLink, Star, Clock, Users, ChevronRight,
  CheckCircle2, Crown, Facebook, Map, List, X, Save, Bell,
  Truck, User, Building, Briefcase, LayoutGrid, Home, Package
} from "lucide-react";
import { useState, useCallback, lazy, Suspense } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Listing, SavedSearch } from "@shared/schema";

const LazyMap = lazy(() => import("@vis.gl/react-google-maps").then(m => ({
  default: ({ markers, center }: { markers: Array<{lat: number, lng: number, title: string, id: string}>, center: {lat: number, lng: number} }) => {
    const { Map, Marker, AdvancedMarker } = m;
    return (
      <Map
        defaultCenter={center}
        defaultZoom={6}
        mapId="marketplace-map"
        className="w-full h-full rounded-lg"
      >
        {markers.map((marker) => (
          <AdvancedMarker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title}
          />
        ))}
      </Map>
    );
  }
})));

const CONSULT_EMAIL = "consult@washbizhub.com";

const PRIMARY_CATEGORIES = [
  { value: "retail_laundromat", label: "Retail Laundromat", icon: Home },
  { value: "hybrid", label: "Hybrid", icon: Building2 },
  { value: "route_pud", label: "Route/PUD", icon: Truck },
  { value: "equipment_package", label: "Equipment Package", icon: Package },
  { value: "development_site", label: "Development Site", icon: Building }
];

const DEAL_TYPES = [
  { value: "turnkey", label: "Turnkey" },
  { value: "value_add", label: "Value-Add" },
  { value: "distressed", label: "Distressed" },
  { value: "portfolio", label: "Portfolio" },
  { value: "franchise", label: "Franchise" }
];

const FINANCING_TAGS = [
  { value: "sba_ready", label: "SBA-Ready" },
  { value: "seller_financing", label: "Seller Financing" },
  { value: "assume_lease", label: "Assume Lease" }
];

const CLEANBI_GRADES = [
  { value: "A", label: "A (Excellent)", color: "#22C55E" },
  { value: "B", label: "B (Good)", color: "#A3E635" },
  { value: "C", label: "C (Fair)", color: "#FBBF24" },
  { value: "Needs Work", label: "Needs Work", color: "#C8A661" }
];

interface ListingWithDetails extends Listing {
  financials?: {
    monthlyGross?: string;
    monthlyNet?: string;
    roi?: string;
  };
  capRate?: string;
  annualRevenue?: string;
  isAttended?: boolean;
  hasPickupDelivery?: boolean;
  leaseYearsRemaining?: number;
  primaryCategory?: string;
  dealType?: string;
  financingTags?: string[];
  cleanbiScore?: number;
  cleanbiGrade?: string;
  squareFootage?: number;
}

interface SearchFilters {
  search: string;
  priceMin: number;
  priceMax: number;
  capRateMin: number;
  capRateMax: number;
  annualRevenueMin: number;
  annualRevenueMax: number;
  isAttended: boolean | null;
  hasPickupDelivery: boolean;
  leaseYearsMin: number;
  primaryCategory: string;
  dealType: string;
  financingTags: string[];
  cleanbiGrade: string;
  cleanbiScoreMin: number;
  radiusMiles: number;
  lat: number | null;
  lng: number | null;
  locationSearch: string;
  state: string;
}

const defaultFilters: SearchFilters = {
  search: "",
  priceMin: 50000,
  priceMax: 5000000,
  capRateMin: 4,
  capRateMax: 15,
  annualRevenueMin: 0,
  annualRevenueMax: 2000000,
  isAttended: null,
  hasPickupDelivery: false,
  leaseYearsMin: 0,
  primaryCategory: "",
  dealType: "",
  financingTags: [],
  cleanbiGrade: "",
  cleanbiScoreMin: 0,
  radiusMiles: 100,
  lat: null,
  lng: null,
  locationSearch: "",
  state: "all"
};

function formatPrice(price: string | null | undefined): string {
  if (!price) return "Contact for Price";
  const num = parseFloat(price);
  if (isNaN(num)) return "Contact for Price";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

function formatRevenue(revenue: string | number | null | undefined): string {
  if (!revenue) return "N/A";
  const num = typeof revenue === "string" ? parseFloat(revenue) : revenue;
  if (isNaN(num)) return "N/A";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M/yr`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K/yr`;
  return `$${num.toLocaleString()}/yr`;
}

function getCategoryLabel(value: string | undefined): string {
  if (!value) return "";
  const cat = PRIMARY_CATEGORIES.find(c => c.value === value);
  return cat?.label || value;
}

function getDealTypeLabel(value: string | undefined): string {
  if (!value) return "";
  const deal = DEAL_TYPES.find(d => d.value === value);
  return deal?.label || value;
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
          {listing.cleanbiGrade && (
            <Badge 
              className="shadow-lg" 
              style={{ 
                backgroundColor: CLEANBI_GRADES.find(g => g.value === listing.cleanbiGrade)?.color + '20',
                borderColor: CLEANBI_GRADES.find(g => g.value === listing.cleanbiGrade)?.color,
                color: CLEANBI_GRADES.find(g => g.value === listing.cleanbiGrade)?.color
              }}
              data-testid={`badge-cleanbi-grade-${listing.id}`}
            >
              CLEANBI: {listing.cleanbiGrade}
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {listing.status === 'active' ? 'Available' : listing.status}
          </Badge>
          {listing.primaryCategory && (
            <Badge variant="outline" className="bg-background/90 backdrop-blur text-xs">
              {getCategoryLabel(listing.primaryCategory)}
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="text-white font-bold text-xl">
            {formatPrice(price)}
          </div>
          {listing.capRate && (
            <div className="text-white/80 text-sm">
              {parseFloat(listing.capRate).toFixed(1)}% Cap Rate
            </div>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2 leading-tight">
          {listing.title}
        </CardTitle>
        <address className="flex items-center gap-1.5 text-muted-foreground text-sm not-italic" data-testid={`address-listing-${listing.id}`}>
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <span itemProp="addressLocality">{listing.city}</span>{listing.city && listing.region ? ', ' : ''}
            <span itemProp="addressRegion">{listing.region}</span>
            {listing.country && listing.country !== 'US' && (
              <>, <span itemProp="addressCountry">{listing.country}</span></>
            )}
          </span>
        </address>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {listing.dealType && (
            <Badge variant="outline" className="text-xs" data-testid={`badge-deal-type-${listing.id}`}>
              {getDealTypeLabel(listing.dealType)}
            </Badge>
          )}
          {listing.financingTags?.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs" data-testid={`badge-financing-${tag}-${listing.id}`}>
              {FINANCING_TAGS.find(t => t.value === tag)?.label || tag}
            </Badge>
          ))}
          {listing.isAttended !== undefined && (
            <Badge variant="outline" className="text-xs">
              {listing.isAttended ? <User className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
              {listing.isAttended ? "Attended" : "Unattended"}
            </Badge>
          )}
          {listing.hasPickupDelivery && (
            <Badge variant="outline" className="text-xs">
              <Truck className="w-3 h-3 mr-1" />
              P&D
            </Badge>
          )}
        </div>
        
        {listing.tagline && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.tagline}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {listing.annualRevenue && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-muted-foreground text-xs">Revenue</div>
                <div className="font-semibold">{formatRevenue(listing.annualRevenue)}</div>
              </div>
            </div>
          )}
          {listing.leaseYearsRemaining !== undefined && listing.leaseYearsRemaining > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <div>
                <div className="text-muted-foreground text-xs">Lease</div>
                <div className="font-semibold">{listing.leaseYearsRemaining} yrs</div>
              </div>
            </div>
          )}
          {listing.squareFootage && (
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground text-xs">Size</div>
                <div className="font-semibold">{listing.squareFootage.toLocaleString()} sqft</div>
              </div>
            </div>
          )}
        </div>
        
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

function FilterSidebar({ 
  filters, 
  setFilters, 
  onSaveSearch,
  isFiltersApplied 
}: { 
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  onSaveSearch: () => void;
  isFiltersApplied: boolean;
}) {
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h3>
        {isFiltersApplied && (
          <Button variant="ghost" size="sm" onClick={resetFilters} data-testid="button-reset-filters">
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground mb-2">
            <span>{formatPrice(filters.priceMin.toString())}</span>
            <span>-</span>
            <span>{filters.priceMax >= 5000000 ? "$5M+" : formatPrice(filters.priceMax.toString())}</span>
          </div>
          <Slider
            value={[filters.priceMin, filters.priceMax]}
            min={50000}
            max={5000000}
            step={50000}
            onValueChange={([min, max]) => setFilters({ ...filters, priceMin: min, priceMax: max })}
            data-testid="slider-price"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium">Cap Rate</Label>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground mb-2">
            <span>{filters.capRateMin}%</span>
            <span>-</span>
            <span>{filters.capRateMax >= 15 ? "15%+" : `${filters.capRateMax}%`}</span>
          </div>
          <Slider
            value={[filters.capRateMin, filters.capRateMax]}
            min={4}
            max={15}
            step={0.5}
            onValueChange={([min, max]) => setFilters({ ...filters, capRateMin: min, capRateMax: max })}
            data-testid="slider-caprate"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium">Annual Revenue</Label>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground mb-2">
            <span>{formatRevenue(filters.annualRevenueMin)}</span>
            <span>-</span>
            <span>{filters.annualRevenueMax >= 2000000 ? "$2M+/yr" : formatRevenue(filters.annualRevenueMax)}</span>
          </div>
          <Slider
            value={[filters.annualRevenueMin, filters.annualRevenueMax]}
            min={0}
            max={2000000}
            step={50000}
            onValueChange={([min, max]) => setFilters({ ...filters, annualRevenueMin: min, annualRevenueMax: max })}
            data-testid="slider-revenue"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium">Minimum Lease (Years)</Label>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground mb-2">
            <span>{filters.leaseYearsMin}+ years</span>
          </div>
          <Slider
            value={[filters.leaseYearsMin]}
            min={0}
            max={20}
            step={1}
            onValueChange={([val]) => setFilters({ ...filters, leaseYearsMin: val })}
            data-testid="slider-lease"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="attended-toggle" className="text-sm font-medium">Attended Only</Label>
          <Switch
            id="attended-toggle"
            checked={filters.isAttended === true}
            onCheckedChange={(checked) => setFilters({ ...filters, isAttended: checked ? true : null })}
            data-testid="switch-attended"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="unattended-toggle" className="text-sm font-medium">Unattended Only</Label>
          <Switch
            id="unattended-toggle"
            checked={filters.isAttended === false}
            onCheckedChange={(checked) => setFilters({ ...filters, isAttended: checked ? false : null })}
            data-testid="switch-unattended"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="pud-toggle" className="text-sm font-medium flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Pickup & Delivery
          </Label>
          <Switch
            id="pud-toggle"
            checked={filters.hasPickupDelivery}
            onCheckedChange={(checked) => setFilters({ ...filters, hasPickupDelivery: checked })}
            data-testid="switch-pud"
          />
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">Category</Label>
        <div className="flex flex-wrap gap-1.5">
          {PRIMARY_CATEGORIES.map(cat => (
            <Badge
              key={cat.value}
              variant={filters.primaryCategory === cat.value ? "default" : "outline"}
              className="cursor-pointer toggle-elevate"
              onClick={() => setFilters({ 
                ...filters, 
                primaryCategory: filters.primaryCategory === cat.value ? "" : cat.value 
              })}
              data-testid={`badge-category-${cat.value}`}
            >
              <cat.icon className="w-3 h-3 mr-1" />
              {cat.label}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">Deal Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {DEAL_TYPES.map(deal => (
            <Badge
              key={deal.value}
              variant={filters.dealType === deal.value ? "default" : "outline"}
              className="cursor-pointer toggle-elevate"
              onClick={() => setFilters({ 
                ...filters, 
                dealType: filters.dealType === deal.value ? "" : deal.value 
              })}
              data-testid={`badge-dealtype-${deal.value}`}
            >
              {deal.label}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">Financing</Label>
        <div className="flex flex-wrap gap-1.5">
          {FINANCING_TAGS.map(tag => (
            <Badge
              key={tag.value}
              variant={filters.financingTags.includes(tag.value) ? "default" : "outline"}
              className="cursor-pointer toggle-elevate"
              onClick={() => {
                const newTags = filters.financingTags.includes(tag.value)
                  ? filters.financingTags.filter(t => t !== tag.value)
                  : [...filters.financingTags, tag.value];
                setFilters({ ...filters, financingTags: newTags });
              }}
              data-testid={`badge-financing-filter-${tag.value}`}
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">CLEANBI Grade</Label>
        <div className="flex flex-wrap gap-1.5">
          {CLEANBI_GRADES.map(grade => (
            <Badge
              key={grade.value}
              variant={filters.cleanbiGrade === grade.value ? "default" : "outline"}
              className="cursor-pointer toggle-elevate"
              style={filters.cleanbiGrade === grade.value ? { 
                backgroundColor: grade.color + '20',
                borderColor: grade.color,
                color: grade.color
              } : undefined}
              onClick={() => setFilters({ 
                ...filters, 
                cleanbiGrade: filters.cleanbiGrade === grade.value ? "" : grade.value 
              })}
              data-testid={`badge-cleanbi-filter-${grade.value}`}
            >
              {grade.label}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">Search Radius</Label>
        <div className="space-y-2">
          <Input
            placeholder="Enter city or zip code..."
            value={filters.locationSearch}
            onChange={(e) => setFilters({ ...filters, locationSearch: e.target.value })}
            data-testid="input-location-search"
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Within {filters.radiusMiles} miles</span>
          </div>
          <Slider
            value={[filters.radiusMiles]}
            min={10}
            max={200}
            step={10}
            onValueChange={([val]) => setFilters({ ...filters, radiusMiles: val })}
            data-testid="slider-radius"
          />
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-2 block">State</Label>
        <Select 
          value={filters.state} 
          onValueChange={(val) => setFilters({ ...filters, state: val })}
        >
          <SelectTrigger data-testid="select-state">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="CA">California</SelectItem>
            <SelectItem value="TX">Texas</SelectItem>
            <SelectItem value="FL">Florida</SelectItem>
            <SelectItem value="NY">New York</SelectItem>
            <SelectItem value="PA">Pennsylvania</SelectItem>
            <SelectItem value="IL">Illinois</SelectItem>
            <SelectItem value="OH">Ohio</SelectItem>
            <SelectItem value="GA">Georgia</SelectItem>
            <SelectItem value="NC">North Carolina</SelectItem>
            <SelectItem value="MI">Michigan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isFiltersApplied && (
        <Button 
          className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
          onClick={onSaveSearch}
          data-testid="button-save-search"
        >
          <Save className="w-4 h-4 mr-2" />
          Save This Search
        </Button>
      )}
    </div>
  );
}

function SavedSearchesList({ 
  savedSearches, 
  onApply, 
  onDelete 
}: { 
  savedSearches: SavedSearch[];
  onApply: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
}) {
  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No saved searches yet</p>
        <p className="text-xs">Save a search to get alerts for new listings</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {savedSearches.map(search => (
        <Card key={search.id} className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{search.name}</p>
              <p className="text-xs text-muted-foreground">
                {search.alertFrequency} alerts • {search.isActive ? "Active" : "Paused"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onApply(search)}
                data-testid={`button-apply-search-${search.id}`}
              >
                Apply
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onDelete(search.id)}
                data-testid={`button-delete-search-${search.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function BuyLaundromat() {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [alertFrequency, setAlertFrequency] = useState("daily");
  const { toast } = useToast();

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.priceMin > 50000) params.append("priceMin", filters.priceMin.toString());
    if (filters.priceMax < 5000000) params.append("priceMax", filters.priceMax.toString());
    if (filters.capRateMin > 4) params.append("capRateMin", filters.capRateMin.toString());
    if (filters.capRateMax < 15) params.append("capRateMax", filters.capRateMax.toString());
    if (filters.annualRevenueMin > 0) params.append("annualRevenueMin", filters.annualRevenueMin.toString());
    if (filters.annualRevenueMax < 2000000) params.append("annualRevenueMax", filters.annualRevenueMax.toString());
    if (filters.isAttended !== null) params.append("isAttended", filters.isAttended.toString());
    if (filters.hasPickupDelivery) params.append("hasPickupDelivery", "true");
    if (filters.leaseYearsMin > 0) params.append("leaseYearsMin", filters.leaseYearsMin.toString());
    if (filters.primaryCategory) params.append("primaryCategory", filters.primaryCategory);
    if (filters.dealType) params.append("dealType", filters.dealType);
    if (filters.financingTags.length) params.append("financingTags", filters.financingTags.join(","));
    if (filters.cleanbiGrade) params.append("cleanbiGrade", filters.cleanbiGrade);
    if (filters.cleanbiScoreMin > 0) params.append("cleanbiScoreMin", filters.cleanbiScoreMin.toString());
    if (filters.lat && filters.lng) {
      params.append("lat", filters.lat.toString());
      params.append("lng", filters.lng.toString());
      params.append("radiusMiles", filters.radiusMiles.toString());
    }
    if (filters.state && filters.state !== "all") params.append("state", filters.state);
    return params.toString();
  }, [filters]);

  const { data: searchResult, isLoading } = useQuery<{ listings: ListingWithDetails[], total: number }>({
    queryKey: ['/api/marketplace/search', buildQueryString()],
  });

  const { data: savedSearches = [] } = useQuery<SavedSearch[]>({
    queryKey: ['/api/saved-searches'],
  });

  const saveSearchMutation = useMutation({
    mutationFn: async (data: { name: string; filters: SearchFilters; alertFrequency: string }) => {
      return apiRequest('/api/saved-searches', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-searches'] });
      toast({ title: "Search saved!", description: "You'll receive alerts for new matching listings." });
      setSaveDialogOpen(false);
      setSearchName("");
    },
    onError: () => {
      toast({ title: "Failed to save search", variant: "destructive" });
    }
  });

  const deleteSearchMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/saved-searches/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-searches'] });
      toast({ title: "Search deleted" });
    }
  });

  const listings = searchResult?.listings || [];
  
  const isFiltersApplied = filters.search !== "" ||
    filters.priceMin > 50000 || filters.priceMax < 5000000 ||
    filters.capRateMin > 4 || filters.capRateMax < 15 ||
    filters.annualRevenueMin > 0 || filters.annualRevenueMax < 2000000 ||
    filters.isAttended !== null || filters.hasPickupDelivery ||
    filters.leaseYearsMin > 0 || filters.primaryCategory !== "" ||
    filters.dealType !== "" || filters.financingTags.length > 0 ||
    filters.cleanbiGrade !== "" || (filters.state !== "" && filters.state !== "all");

  const handleSaveSearch = () => {
    setSaveDialogOpen(true);
  };

  const confirmSaveSearch = () => {
    if (!searchName.trim()) return;
    saveSearchMutation.mutate({
      name: searchName,
      filters,
      alertFrequency
    });
  };

  const handleApplySavedSearch = (search: SavedSearch) => {
    const savedFilters = search.filters as SearchFilters;
    setFilters({ ...defaultFilters, ...savedFilters });
  };

  const mapMarkers = listings
    .filter(l => l.latitude && l.longitude)
    .map(l => ({
      lat: parseFloat(l.latitude as string),
      lng: parseFloat(l.longitude as string),
      title: l.title,
      id: l.id
    }));

  return (
    <>
      <SEO 
        title="Laundromats For Sale Near You | Buy a Laundromat Business | WashBizHub"
        description="Browse verified laundromats for sale in California, Texas, Florida, New York & nationwide. Find coin laundry businesses with real financials, CLEANBI location scores, and owner financing options."
        canonicalUrl="/buy-laundromat"
        ogType="website"
        keywords={[
          "laundromat for sale",
          "buy laundromat",
          "laundromat business for sale",
          "coin laundry for sale",
          "laundromat listings",
          "laundromat investment",
          "buy coin laundry business",
          "laundromat for sale near me",
          "laundromats for sale California",
          "laundromats for sale Texas",
          "laundromats for sale Florida",
          "coin laundry business opportunity"
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Laundromats For Sale",
          "description": "Verified laundromat business listings with real financials and location analysis",
          "url": "https://washbizhub.com/buy-laundromat",
          "numberOfItems": listings.length
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Buy a Laundromat", url: "/buy-laundromat" }
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#0A1628] via-[#0A1628]/95 to-[#0A1628]/90 text-white py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                  <Building2 className="w-3 h-3 mr-1" />
                  US Marketplace
                </Badge>
                <NotificationBell />
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-3" data-testid="text-page-title">
                Laundromats For Sale
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Advanced search with CLEANBI location scoring, real financials, and verified listings.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by city, state, or keyword..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 h-12 bg-background text-foreground"
                  data-testid="input-search"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  className={viewMode === "grid" ? "bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" : "bg-background text-foreground"}
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <List className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  className={viewMode === "map" ? "bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" : "bg-background text-foreground"}
                  onClick={() => setViewMode("map")}
                  data-testid="button-view-map"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Map
                </Button>
                <Button
                  variant="outline"
                  className="bg-background text-foreground md:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            <aside className={`w-80 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden'} md:block`}>
              <Card className="p-4" data-testid="card-filters">
                <FilterSidebar 
                  filters={filters} 
                  setFilters={setFilters}
                  onSaveSearch={handleSaveSearch}
                  isFiltersApplied={isFiltersApplied}
                />
              </Card>
              
              <Card className="p-4" data-testid="card-saved-searches">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-4 h-4 text-[#C8A661]" />
                  <h3 className="font-semibold">Saved Searches</h3>
                </div>
                <SavedSearchesList 
                  savedSearches={savedSearches}
                  onApply={handleApplySavedSearch}
                  onDelete={(id) => deleteSearchMutation.mutate(id)}
                />
              </Card>
            </aside>
            
            <main className="flex-1 min-w-0">
              <RecentlyViewedListings />
              
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground" data-testid="text-results-count">
                  {isLoading ? "Loading..." : `${listings.length} listings found`}
                </p>
                
                <div className="flex gap-2">
                  <Link href="/sell-your-laundromat">
                    <Button variant="outline" size="sm" data-testid="button-list-yours">
                      List Your Laundromat
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              {viewMode === "map" ? (
                <Card className="h-[600px] overflow-hidden" data-testid="card-map-view">
                  <LazyGoogleMapsProvider>
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Skeleton className="w-full h-full" /></div>}>
                      <LazyMap 
                        markers={mapMarkers}
                        center={{ lat: 39.8283, lng: -98.5795 }}
                      />
                    </Suspense>
                  </LazyGoogleMapsProvider>
                </Card>
              ) : isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <ListingSkeleton key={i} />)}
                </div>
              ) : listings.length > 0 ? (
                <VirtualizedGrid
                  items={listings}
                  itemHeight={500}
                  minItemWidth={320}
                  gap={24}
                  containerHeight={900}
                  testIdPrefix="virtualized-listing"
                  renderItem={(listing) => (
                    <ListingCard listing={listing} />
                  )}
                />
              ) : (
                <Card className="p-12 text-center">
                  <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Listings Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to find more opportunities.
                  </p>
                  <Button onClick={() => setFilters(defaultFilters)} data-testid="button-clear-filters">
                    Clear All Filters
                  </Button>
                </Card>
              )}
              
              <Card className="mt-8 bg-gradient-to-r from-[#C8A661]/10 via-[#C8A661]/5 to-[#C8A661]/10 border-[#C8A661]/30">
                <CardContent className="py-4 px-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#C8A661] to-[#B8964F] shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Work with Verified Brokers</p>
                        <p className="text-sm text-muted-foreground">Connect with industry experts who specialize in laundromat sales</p>
                      </div>
                    </div>
                    <Link href="/brokers">
                      <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-find-broker-banner">
                        <Users className="w-4 h-4 mr-2" />
                        Find a Broker
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6 bg-gradient-to-r from-[#1877f2]/10 to-[#1877f2]/5 border-[#1877f2]/20">
                <CardContent className="py-4 px-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#1877f2]/20">
                        <Facebook className="w-5 h-5 text-[#1877f2]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Join 73,000+ Laundromat Owners</p>
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
            </main>
          </div>
        </div>
      </div>
      
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save This Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                placeholder="e.g., California Laundromats under $500K"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                data-testid="input-search-name"
              />
            </div>
            <div>
              <Label>Alert Frequency</Label>
              <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                <SelectTrigger data-testid="select-alert-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never (No Alerts)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
              onClick={confirmSaveSearch}
              disabled={!searchName.trim() || saveSearchMutation.isPending}
              data-testid="button-confirm-save-search"
            >
              <Bell className="w-4 h-4 mr-2" />
              Save & Get Alerts
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <PushNotificationOptIn />
    </>
  );
}
