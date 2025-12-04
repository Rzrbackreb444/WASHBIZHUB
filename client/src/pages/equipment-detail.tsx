import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import {
  ArrowLeft, MapPin, Phone, Mail, DollarSign, Package, Tag, 
  Calendar, Eye, Clock, Banknote, TrendingUp, Building2, Wrench,
  ChevronLeft, ChevronRight, Star, ShieldCheck, CheckCircle
} from "lucide-react";
import { useState } from "react";
import type { EquipmentListing } from "@shared/schema";

const conditionColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "New" },
  "like-new": { bg: "bg-green-500/10", text: "text-green-600", label: "Like New" },
  excellent: { bg: "bg-blue-500/10", text: "text-blue-600", label: "Excellent" },
  good: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Good" },
  fair: { bg: "bg-orange-500/10", text: "text-orange-600", label: "Fair" },
  "for-parts": { bg: "bg-gray-500/10", text: "text-gray-600", label: "For Parts" },
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

const fundingPartners = [
  { name: "Beacon Funding", description: "Equipment financing specialists", minAmount: "$5,000" },
  { name: "Currency Capital", description: "Fast equipment loans", minAmount: "$2,500" },
  { name: "Direct Capital", description: "SBA & equipment financing", minAmount: "$10,000" },
];

export default function EquipmentDetail() {
  const [, params] = useRoute("/equipment/:id");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: listing, isLoading, error } = useQuery<EquipmentListing>({
    queryKey: ['/api/equipment-listings', params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/equipment-listings/${params?.id}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      return response.json();
    },
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Equipment Not Found</h1>
          <p className="text-muted-foreground mb-6">This listing may have been removed or sold.</p>
          <Link href="/equipment-marketplace">
            <Button data-testid="button-back-to-marketplace">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const condition = conditionColors[listing.condition] || conditionColors.good;
  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <SEO
        title={`${listing.title} | Equipment Marketplace | WashBizHub`}
        description={`${listing.description?.substring(0, 150)}... ${listing.city}, ${listing.state}. $${Number(listing.price).toLocaleString()}. Get financing options.`}
        canonicalUrl={`/equipment/${listing.id}`}
      />
      
      <div className="min-h-screen bg-background py-8" data-testid="page-equipment-detail">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link href="/equipment-marketplace" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      data-testid="img-equipment-main"
                    />
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                          data-testid="button-prev-image"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                          data-testid="button-next-image"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Badges overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={`${condition.bg} ${condition.text} border-0`}>
                    {condition.label}
                  </Badge>
                  {listing.brand && (
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {listing.brand}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail strip */}
              {hasMultipleImages && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-accent' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  {categoryLabels[listing.category] || "Equipment"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" data-testid="text-equipment-title">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.city}, {listing.state} {listing.zipCode}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-accent" data-testid="text-equipment-price">
                  ${Number(listing.price).toLocaleString()}
                </span>
                {listing.negotiable && (
                  <Badge variant="outline" className="text-muted-foreground">Negotiable</Badge>
                )}
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                {listing.brand && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span><strong>Brand:</strong> {listing.brand}</span>
                  </div>
                )}
                {listing.model && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span><strong>Model:</strong> {listing.model}</span>
                  </div>
                )}
                {listing.yearManufactured && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span><strong>Year:</strong> {listing.yearManufactured}</span>
                  </div>
                )}
                {listing.quantity && listing.quantity > 1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span><strong>Quantity:</strong> {listing.quantity} available</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-equipment-description">
                  {listing.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:consult@washbizhub.com?subject=Equipment Inquiry: ${listing.title}&body=I'm interested in the ${listing.title} listed for $${Number(listing.price).toLocaleString()}.`}
                    data-testid="button-contact-seller"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Seller
                  </Button>
                  {listing.sellerPhone && (
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => window.location.href = `tel:${listing.sellerPhone}`}
                      data-testid="button-call-seller"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                
                {/* Get Funding Button - Featured prominently */}
                <Link href="/funding" className="block">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full border-accent text-accent hover:bg-accent/10 group"
                    data-testid="button-get-funding"
                  >
                    <Banknote className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Get Funding for This Equipment
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Funding Partners Preview */}
              <Card className="border-accent/20 bg-accent/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    Financing Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Get pre-approved financing from our verified lending partners:
                  </p>
                  <div className="space-y-2">
                    {fundingPartners.map((partner, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span className="font-medium">{partner.name}</span>
                        </div>
                        <span className="text-muted-foreground">From {partner.minAmount}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/funding">
                    <Button variant="secondary" size="sm" className="w-full mt-2" data-testid="button-explore-financing">
                      Explore All Financing Options
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats & Trust Signals */}
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{listing.views || 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Verified on WashBizHub</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
