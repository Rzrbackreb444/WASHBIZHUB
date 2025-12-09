import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Award,
  CheckCircle2,
  Calendar,
  Star,
  DollarSign,
  Send,
  ExternalLink,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Facebook,
  Twitter
} from "lucide-react";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import type { Listing } from "@shared/schema";

interface StorefrontProfile {
  id: string;
  companyName: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  licenseNumber: string | null;
  specializations: string[] | null;
  yearsExperience: number | null;
  regions: string[] | null;
  verified: boolean | null;
  profileImageUrl: string | null;
  nickname: string | null;
  storefrontBanner: string | null;
  storefrontTheme: Record<string, unknown> | null;
  testimonials: Array<{ name: string; text: string; rating: number }> | null;
  totalListings: number | null;
  activeListings: number | null;
  soldListings: number | null;
  totalVolume: number | null;
  socialLinks: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  } | null;
  soldListingsData?: Array<{
    id: number;
    title: string;
    city: string;
    state: string;
    soldPrice: number;
    soldDate: string;
    images?: string[];
  }>;
}

interface StorefrontData {
  profile: StorefrontProfile;
  listings: Listing[];
}

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const CONSULT_EMAIL = "consult@washbizhub.com";

function SoldListingsCarousel({ soldListings }: { soldListings: StorefrontProfile['soldListingsData'] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!soldListings || soldListings.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % soldListings.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + soldListings.length) % soldListings.length);
  };

  const visibleCount = 3;
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < soldListings.length - visibleCount;

  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          disabled={!canScrollLeft}
          className="shrink-0"
          data-testid="button-carousel-prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 overflow-hidden" ref={carouselRef}>
          <div 
            className="flex gap-4 transition-transform duration-300"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
          >
            {soldListings.map((listing, i) => (
              <Card 
                key={listing.id}
                className="bg-card border shadow-sm overflow-hidden flex-shrink-0 w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)]"
                data-testid={`card-sold-listing-${listing.id}`}
              >
                <div className="h-1 bg-muted-foreground/30" />
                <div className="relative h-32 bg-muted">
                  {listing.images && listing.images[0] ? (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-[#0A1628] text-white no-default-hover-elevate">
                    SOLD
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground line-clamp-1 mb-1">
                    {listing.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {listing.city}, {listing.state}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C8A661]">
                      ${listing.soldPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(listing.soldDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          disabled={!canScrollRight}
          className="shrink-0"
          data-testid="button-carousel-next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function BrokerStorefront() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const { data, isLoading, error } = useQuery<StorefrontData>({
    queryKey: ["/api/brokers", slug, "storefront"],
    enabled: !!slug,
  });

  const contactMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const brokerEmail = data?.profile.email || CONSULT_EMAIL;
      window.location.href = `mailto:${brokerEmail}?subject=${encodeURIComponent(
        `Inquiry from WashBizHub - ${values.name}`
      )}&body=${encodeURIComponent(
        `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone || 'Not provided'}\n\nMessage:\n${values.message}`
      )}`;
    },
    onSuccess: () => {
      toast({
        title: "Opening Email",
        description: "Your default email client will open to send your message.",
      });
      form.reset();
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    contactMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-64 w-full" />
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <>
        <Helmet>
          <title>Broker Not Found | WashBizHub</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Broker Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This broker storefront doesn't exist or isn't public.
              </p>
              <Link href="/brokers">
                <Button data-testid="button-browse-brokers">Browse All Brokers</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const { profile, listings } = data;
  const brokerName = profile.companyName || profile.nickname || "Broker";
  const initials = brokerName.split(" ").map(w => w[0]).join("").slice(0, 2);
  const primaryRegion = profile.regions?.[0] || "";
  const primarySpecialty = profile.specializations?.[0] || "Laundromat Sales";

  const metaDescription = `${brokerName} - Expert ${primarySpecialty} broker${primaryRegion ? ` serving ${primaryRegion}` : ''}. ${profile.yearsExperience ? `${profile.yearsExperience}+ years experience.` : ''} ${profile.soldListings ? `${profile.soldListings} successful transactions.` : ''} Contact for laundromat buying and selling assistance.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `https://washbizhub.com/broker/${slug}#business`,
        "name": brokerName,
        "description": profile.bio || metaDescription,
        "url": `https://washbizhub.com/broker/${slug}`,
        "image": profile.profileImageUrl || "https://washbizhub.com/washbizhub-og-image.png",
        "telephone": profile.phone || undefined,
        "email": profile.email || CONSULT_EMAIL,
        ...(profile.website && { "sameAs": [profile.website] }),
        "areaServed": profile.regions?.map(region => ({
          "@type": "State",
          "name": region
        })) || [],
        "priceRange": "$$",
        "aggregateRating": profile.testimonials && profile.testimonials.length > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": (profile.testimonials.reduce((acc, t) => acc + t.rating, 0) / profile.testimonials.length).toFixed(1),
          "reviewCount": profile.testimonials.length
        } : undefined
      },
      {
        "@type": "RealEstateAgent",
        "@id": `https://washbizhub.com/broker/${slug}#agent`,
        "name": brokerName,
        "description": profile.bio || `Expert laundromat business broker with ${profile.yearsExperience || 'extensive'} years of experience.`,
        "url": `https://washbizhub.com/broker/${slug}`,
        "image": profile.profileImageUrl || "https://washbizhub.com/washbizhub-og-image.png",
        "telephone": profile.phone || undefined,
        "email": profile.email || CONSULT_EMAIL,
        "knowsAbout": profile.specializations || ["Laundromat Sales", "Business Valuation", "Due Diligence"],
        "areaServed": profile.regions?.map(region => ({
          "@type": "State", 
          "name": region
        })) || []
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://washbizhub.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Brokers",
            "item": "https://washbizhub.com/brokers"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": brokerName,
            "item": `https://washbizhub.com/broker/${slug}`
          }
        ]
      }
    ]
  };

  const totalVolume = profile.totalVolume || (profile.soldListings ? profile.soldListings * 250000 : 0);

  return (
    <>
      <Helmet>
        <title>{brokerName} - Laundromat Broker | WashBizHub</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://washbizhub.com/broker/${slug}`} />
        
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${brokerName} - Laundromat Broker | WashBizHub`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`https://washbizhub.com/broker/${slug}`} />
        <meta property="og:image" content={profile.profileImageUrl || "https://washbizhub.com/washbizhub-og-image.png"} />
        <meta property="og:site_name" content="WashBizHub" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${brokerName} - Laundromat Broker`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={profile.profileImageUrl || "https://washbizhub.com/washbizhub-og-image.png"} />
        
        <meta name="keywords" content={`${brokerName}, laundromat broker, ${primaryRegion} laundromat, business broker, ${profile.specializations?.join(', ') || 'laundromat sales'}, coin laundry broker`} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div 
          className="relative h-64 md:h-80 bg-[#0A1628]"
          style={profile.storefrontBanner ? {
            backgroundImage: `url(${profile.storefrontBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/80 to-[#0A1628]" />
          
          <nav className="absolute top-4 left-4 z-10">
            <Link href="/brokers">
              <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="link-back-brokers">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Directory
              </Button>
            </Link>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10">
          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-28 w-28 border-4 border-[#C8A661]">
                  <AvatarImage src={profile.profileImageUrl || undefined} alt={brokerName} />
                  <AvatarFallback className="text-2xl bg-[#0A1628] text-[#C8A661]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-broker-name">
                      {brokerName}
                    </h1>
                    {profile.verified && (
                      <Badge className="bg-[#C8A661] text-[#0A1628] no-default-hover-elevate">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {profile.nickname && profile.companyName && (
                    <p className="text-[#C8A661] font-medium mb-2">"{profile.nickname}"</p>
                  )}
                  
                  {profile.bio && (
                    <p className="text-muted-foreground mb-4" data-testid="text-broker-bio">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {profile.yearsExperience && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[#C8A661]" />
                        <span>{profile.yearsExperience}+ Years Experience</span>
                      </div>
                    )}
                    {profile.licenseNumber && (
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-[#C8A661]" />
                        <span>License #{profile.licenseNumber}</span>
                      </div>
                    )}
                  </div>

                  {profile.specializations && profile.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.specializations.map((spec, i) => (
                        <Badge key={i} variant="outline" className="border-[#C8A661]/40 text-[#C8A661]">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {profile.regions && profile.regions.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 text-[#C8A661]" />
                      <span>Serving: {profile.regions.join(", ")}</span>
                    </div>
                  )}

                  {profile.socialLinks && (
                    <div className="flex gap-2">
                      {profile.socialLinks.linkedin && (
                        <a 
                          href={profile.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid="link-social-linkedin"
                        >
                          <Button variant="outline" size="icon">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {profile.socialLinks.facebook && (
                        <a 
                          href={profile.socialLinks.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid="link-social-facebook"
                        >
                          <Button variant="outline" size="icon">
                            <Facebook className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {profile.socialLinks.twitter && (
                        <a 
                          href={profile.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid="link-social-twitter"
                        >
                          <Button variant="outline" size="icon">
                            <Twitter className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-years-experience">
                        {profile.yearsExperience || 0}+
                      </div>
                      <div className="text-xs text-muted-foreground">Years</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-deals-closed">
                        {profile.soldListings || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Closed</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-volume">
                        ${totalVolume >= 1000000 ? `${(totalVolume / 1000000).toFixed(1)}M` : `${(totalVolume / 1000).toFixed(0)}K`}
                      </div>
                      <div className="text-xs text-muted-foreground">Volume</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {profile.phone && (
                      <a href={`tel:${profile.phone}`} className="flex-1">
                        <Button className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-call-broker">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Now
                        </Button>
                      </a>
                    )}
                    <a href={`mailto:${profile.email || CONSULT_EMAIL}`}>
                      <Button variant="outline" size="icon" data-testid="button-email-broker">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </a>
                    {profile.website && (
                      <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" data-testid="button-website-broker">
                          <Globe className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge variant="outline" className="mb-3 border-[#C8A661]/40 text-[#C8A661]">
                  <Building2 className="w-3 h-3 mr-1.5" />
                  Active Listings
                </Badge>
                <h2 className="text-2xl font-bold text-foreground">
                  Available Opportunities
                </h2>
              </div>
              {listings.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {listings.length} Active
                </Badge>
              )}
            </div>

            {listings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Listings</h3>
                  <p className="text-muted-foreground">
                    This broker doesn't have any active listings at the moment. Contact them for off-market opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link key={listing.id} href={`/listing/${listing.id}`}>
                    <Card 
                      className="bg-card border shadow-sm overflow-hidden hover-elevate cursor-pointer"
                      data-testid={`card-listing-${listing.id}`}
                    >
                      <div className="h-1 bg-[#C8A661]" />
                      {listing.images && listing.images.length > 0 && (
                        <div className="h-48 bg-muted">
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title || "Listing"} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-foreground line-clamp-2">
                            {listing.title}
                          </h3>
                          {listing.status === "active" && (
                            <Badge className="bg-green-100 text-green-800 no-default-hover-elevate shrink-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        
                        {listing.city && listing.state && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{listing.city}, {listing.state}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-5 w-5 text-[#C8A661]" />
                            <span className="text-xl font-bold text-foreground">
                              {listing.askingPrice 
                                ? `$${Number(listing.askingPrice).toLocaleString()}`
                                : "Contact for Price"
                              }
                            </span>
                          </div>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {profile.soldListingsData && profile.soldListingsData.length > 0 && (
            <section className="py-12 border-t">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Badge variant="outline" className="mb-3 border-[#C8A661]/40 text-[#C8A661]">
                    <TrendingUp className="w-3 h-3 mr-1.5" />
                    Track Record
                  </Badge>
                  <h2 className="text-2xl font-bold text-foreground">
                    Recently Sold
                  </h2>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {profile.soldListingsData.length} Sold
                </Badge>
              </div>
              
              <SoldListingsCarousel soldListings={profile.soldListingsData} />
            </section>
          )}

          {profile.testimonials && profile.testimonials.length > 0 && (
            <section className="py-12 border-t">
              <Badge variant="outline" className="mb-3 border-[#C8A661]/40 text-[#C8A661]">
                <Star className="w-3 h-3 mr-1.5" />
                Client Testimonials
              </Badge>
              <h2 className="text-2xl font-bold text-foreground mb-8">
                What Clients Say
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.testimonials.map((testimonial, i) => (
                  <Card key={i} className="bg-card border shadow-sm" data-testid={`card-testimonial-${i}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star 
                            key={starIndex}
                            className={`h-4 w-4 ${
                              starIndex < testimonial.rating 
                                ? "text-[#C8A661] fill-[#C8A661]" 
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">
                        "{testimonial.text}"
                      </p>
                      <p className="font-semibold text-foreground">
                        — {testimonial.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section className="py-12 border-t">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <Badge variant="outline" className="mb-3 border-[#C8A661]/40 text-[#C8A661]">
                  <Mail className="w-3 h-3 mr-1.5" />
                  Contact
                </Badge>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Get in Touch
                </h2>
                
                <div className="space-y-4">
                  {profile.phone && (
                    <a 
                      href={`tel:${profile.phone}`} 
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="link-phone"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Phone className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <span>{profile.phone}</span>
                    </a>
                  )}
                  {profile.email && (
                    <a 
                      href={`mailto:${profile.email}`} 
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="link-email"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Mail className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <span>{profile.email}</span>
                    </a>
                  )}
                  {profile.website && (
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="link-website"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Globe className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <span>{profile.website}</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <Card className="bg-card border shadow-sm">
                  <CardHeader>
                    <CardTitle>Send a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe" 
                                  {...field} 
                                  data-testid="input-contact-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="john@example.com" 
                                  {...field} 
                                  data-testid="input-contact-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel" 
                                  placeholder="(555) 123-4567" 
                                  {...field} 
                                  data-testid="input-contact-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="I'm interested in learning more about your listings..." 
                                  className="min-h-[100px]"
                                  {...field} 
                                  data-testid="input-contact-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                          disabled={contactMutation.isPending}
                          data-testid="button-submit-contact"
                        >
                          {contactMutation.isPending ? (
                            "Opening..."
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>

        <div className="h-16" />
      </div>
    </>
  );
}
