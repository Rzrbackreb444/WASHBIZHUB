import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, DollarSign, Phone, Mail, Share2, Heart, 
  Building2, Crown, Lock, Calendar, Eye, FileText,
  ArrowLeft, ExternalLink, TrendingUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import ReactMarkdown from 'react-markdown';
import type { Listing, ListingMedia } from '@shared/schema';

export default function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: listing, isLoading: loadingListing, error } = useQuery<Listing | null>({
    queryKey: ['/api/listings/detail', listingId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/listings/${listingId}`);
        if (res.ok) return res.json();
        
        const bySlug = await fetch(`/api/listings?slug=${listingId}`);
        if (bySlug.ok) {
          const listings = await bySlug.json();
          if (listings.length > 0) return listings[0];
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!listingId,
    retry: false,
  });

  const { data: media = [] } = useQuery<ListingMedia[]>({
    queryKey: ['/api/listings/media', listing?.id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/listings/${listing?.id}/media`);
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
    enabled: !!listing?.id,
  });

  const images = media.filter(m => m.type === 'image' && !m.requiresNDA);
  const allImages = listing?.featuredImage 
    ? [{ id: 'featured', url: listing.featuredImage, type: 'image' as const }, ...images]
    : images;

  const formatPrice = (price: string | null | undefined): string => {
    if (!price) return 'Contact for Price';
    const num = parseFloat(price);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${Math.round(num / 1000)}K`;
    return `$${num.toLocaleString()}`;
  };

  const getLocation = (): string => {
    if (!listing) return '';
    const parts = [];
    if (listing.city) parts.push(listing.city);
    if (listing.region) parts.push(listing.region);
    if (listing.country && listing.country !== 'US') parts.push(listing.country);
    return parts.join(', ') || listing.generalLocation || 'Location Available';
  };

  const defaultImage = 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=1200&h=800&fit=crop';

  if (loadingListing) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="w-full h-[500px]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 -mt-24 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Listing Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This listing may have been removed or the URL is incorrect.
            </p>
            <Link href="/listings-hub">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Listings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${listing.title} | ${formatPrice(listing.priceOriginal || listing.priceInUSD)} | WashBizHub`}
        description={listing.tagline || listing.description?.substring(0, 160) || ''}
        canonicalUrl={`/listing/${listing.slug || listing.id}`}
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-background">
        <div className="relative h-[500px] bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{ 
              backgroundImage: `url(${allImages[currentImageIndex]?.url || defaultImage})` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(i => i === 0 ? allImages.length - 1 : i - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                data-testid="button-prev-image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(i => i === allImages.length - 1 ? 0 : i + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                data-testid="button-next-image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    data-testid={`button-image-dot-${idx}`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Link href="/listings-hub">
              <Button variant="outline" className="bg-black/50 border-white/20 text-white hover:bg-black/70">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="bg-black/50 border-white/20 text-white hover:bg-black/70" data-testid="button-favorite">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="bg-black/50 border-white/20 text-white hover:bg-black/70" data-testid="button-share">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
            {listing.featured && (
              <Badge className="bg-[#D4AF37] text-[#001F3F] border-0 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {listing.ownerFinancing && (
              <Badge className="bg-green-500 text-white border-0 shadow-lg">
                Owner Financing
              </Badge>
            )}
            {listing.requiresNDA && (
              <Badge className="bg-blue-500 text-white border-0 shadow-lg">
                <Lock className="w-3 h-3 mr-1" />
                NDA Required
              </Badge>
            )}
            {listing.includesRealEstate && (
              <Badge className="bg-purple-500 text-white border-0 shadow-lg">
                Includes Real Estate
              </Badge>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 -mt-24 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Badge variant="outline" className="capitalize">{listing.businessType}</Badge>
                        <span className="text-sm">•</span>
                        <span className="text-sm capitalize">{listing.listingType === 'broker' ? 'Broker Listing' : 'For Sale By Owner'}</span>
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl mb-3">{listing.title}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{getLocation()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl sm:text-4xl font-black text-[#39CCCC]">
                        {formatPrice(listing.priceOriginal || listing.priceInUSD)}
                      </div>
                      {listing.priceVisibility !== 'public' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {listing.priceVisibility === 'nda_required' ? 'NDA required for details' : 'Contact for pricing'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="pt-6 space-y-6">
                  {listing.tagline && (
                    <p className="text-lg text-muted-foreground italic">
                      "{listing.tagline}"
                    </p>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg mb-4">About This Business</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{listing.description || ''}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Eye className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                      <div className="text-2xl font-bold">{listing.viewCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <TrendingUp className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                      <div className="text-2xl font-bold">{listing.inquiryCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Inquiries</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Calendar className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                      <div className="text-sm font-semibold">
                        {listing.listedAt 
                          ? new Date(listing.listedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'New'}
                      </div>
                      <div className="text-xs text-muted-foreground">Listed</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <FileText className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                      <div className="text-2xl font-bold">{media.filter(m => m.type === 'document').length}</div>
                      <div className="text-xs text-muted-foreground">Documents</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {allImages.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                    <CardDescription>{allImages.length} photos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {allImages.slice(0, 8).map((img, idx) => (
                        <button
                          key={img.id || idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`aspect-square rounded-lg overflow-hidden relative group ${
                            idx === currentImageIndex ? 'ring-2 ring-[#39CCCC]' : ''
                          }`}
                        >
                          <img 
                            src={img.url} 
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          {idx === 7 && allImages.length > 8 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-bold">+{allImages.length - 8}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-xl sticky top-6">
                <CardHeader className="bg-gradient-to-r from-[#001F3F] to-[#002B5C] text-white rounded-t-lg">
                  <CardTitle>Contact Seller</CardTitle>
                  <CardDescription className="text-white/70">
                    Interested in this listing? Reach out directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <Button className="w-full bg-[#39CCCC] hover:bg-[#39CCCC]/90 text-[#001F3F] font-semibold" size="lg" data-testid="button-request-info">
                    <Mail className="w-4 h-4 mr-2" />
                    Request Information
                  </Button>
                  
                  <Button variant="outline" className="w-full" size="lg" data-testid="button-schedule-call">
                    <Phone className="w-4 h-4 mr-2" />
                    Schedule a Call
                  </Button>

                  {listing.requiresNDA && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-500 mb-2">
                        <Lock className="w-4 h-4" />
                        <span className="font-semibold">NDA Required</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sign a Non-Disclosure Agreement to view detailed financials and exact address.
                      </p>
                      <Button variant="outline" className="w-full mt-3" size="sm">
                        Request NDA
                      </Button>
                    </div>
                  )}

                  <Separator />

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Listing ID: <span className="font-mono text-foreground">{listing.id.slice(0, 8)}</span></p>
                    {listing.status && (
                      <p>Status: <Badge variant="outline" className="ml-1 capitalize">{listing.status}</Badge></p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {listing.ownerFinancing && (
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Financing Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      The seller offers owner financing for qualified buyers.
                    </p>
                    {listing.downPaymentPercent && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Min. Down Payment</span>
                        <span className="font-semibold">{listing.downPaymentPercent}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
