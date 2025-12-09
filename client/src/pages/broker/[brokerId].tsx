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
  Quote,
  BarChart3,
  Users
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
  testimonials: Array<{ name: string; text: string; rating: number; company?: string }> | null;
  totalListings: number | null;
  activeListings: number | null;
  soldListings: number | null;
  totalVolume: number | null;
  averageSalePrice: number | null;
  socialLinks: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  } | null;
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
const BASE_URL = "https://washbizhub.com";

function TestimonialsSection({ testimonials }: { testimonials: StorefrontProfile['testimonials'] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-12">
      <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
        <Quote className="w-3 h-3 mr-1.5" />
        Client Testimonials
      </Badge>
      <h2 className="text-2xl font-bold text-foreground mb-8">What Clients Say</h2>
      
      <Card className="bg-card border shadow-sm overflow-hidden">
        <div className="h-1 bg-[#C8A661]" />
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            {testimonials.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="shrink-0 mt-4"
                data-testid="button-testimonial-prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex-1 text-center">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < current.rating ? 'text-[#C8A661] fill-[#C8A661]' : 'text-muted'}`} 
                  />
                ))}
              </div>
              <blockquote className="text-lg text-foreground italic mb-4" data-testid="text-testimonial">
                "{current.text}"
              </blockquote>
              <div className="text-muted-foreground">
                <span className="font-semibold text-foreground">{current.name}</span>
                {current.company && <span className="text-sm ml-2">- {current.company}</span>}
              </div>
            </div>

            {testimonials.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="shrink-0 mt-4"
                data-testid="button-testimonial-next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-[#C8A661]' : 'bg-muted'}`}
                  data-testid={`button-testimonial-dot-${i}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const cleanbiScore = (listing as any).cleanbiScore || null;
  
  return (
    <Link href={`/listing/${listing.id}`}>
      <Card 
        className="bg-card border shadow-sm overflow-hidden hover-elevate cursor-pointer transition-all duration-300"
        data-testid={`card-listing-${listing.id}`}
      >
        <div className="h-1 bg-[#C8A661]" />
        <div className="relative h-40 bg-muted">
          {listing.images && listing.images[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title || "Laundromat"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {cleanbiScore && (
            <Badge className="absolute top-2 right-2 bg-[#0A1628] text-white no-default-hover-elevate">
              <BarChart3 className="w-3 h-3 mr-1" />
              CLEANBI: {cleanbiScore}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1" data-testid="text-listing-title">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.city}, {listing.state}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#C8A661] text-lg" data-testid="text-listing-price">
              ${listing.askingPrice?.toLocaleString() || 'Contact for Price'}
            </span>
            {listing.monthlyRevenue && (
              <span className="text-xs text-muted-foreground">
                ${(listing.monthlyRevenue / 1000).toFixed(0)}K/mo rev
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ContactFormSection({ brokerName, brokerEmail }: { brokerName: string; brokerEmail: string | null }) {
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

  const onSubmit = (values: ContactFormValues) => {
    const email = brokerEmail || CONSULT_EMAIL;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Inquiry from WashBizHub - ${values.name}`
    )}&body=${encodeURIComponent(
      `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone || 'Not provided'}\n\nMessage:\n${values.message}`
    )}`;
    toast({
      title: "Opening Email",
      description: "Your default email client will open to send your message.",
    });
    form.reset();
  };

  return (
    <section className="py-12">
      <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
        <Mail className="w-3 h-3 mr-1.5" />
        Get In Touch
      </Badge>
      <h2 className="text-2xl font-bold text-foreground mb-8">Contact {brokerName}</h2>
      
      <Card className="bg-card border shadow-sm overflow-hidden">
        <div className="h-1 bg-[#C8A661]" />
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Smith" 
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
                      <FormLabel>Email Address</FormLabel>
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
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
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
                        placeholder="I'm interested in learning more about your laundromat listings..." 
                        rows={4}
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
                className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                data-testid="button-submit-contact"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}

export default function BrokerStorefrontPage() {
  const { brokerId } = useParams<{ brokerId: string }>();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<StorefrontData>({
    queryKey: ["/api/brokers", brokerId, "storefront"],
    enabled: !!brokerId,
  });

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
  const initials = brokerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const primaryRegion = profile.regions?.[0] || "";
  const primarySpecialty = profile.specializations?.[0] || "Laundromat Sales";
  const totalVolume = profile.totalVolume || (profile.soldListings ? profile.soldListings * 250000 : 0);
  const avgSalePrice = profile.averageSalePrice || (profile.soldListings && totalVolume ? totalVolume / profile.soldListings : 0);

  const metaDescription = `${brokerName} - Expert ${primarySpecialty} broker${primaryRegion ? ` serving ${primaryRegion}` : ''}. ${profile.yearsExperience ? `${profile.yearsExperience}+ years experience.` : ''} ${profile.soldListings ? `${profile.soldListings} successful transactions.` : ''} Contact for laundromat buying and selling assistance.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${BASE_URL}/broker/${brokerId}#business`,
        "name": brokerName,
        "description": profile.bio || metaDescription,
        "url": `${BASE_URL}/broker/${brokerId}`,
        "image": profile.profileImageUrl || `${BASE_URL}/washbizhub-og-image.png`,
        "telephone": profile.phone || undefined,
        "email": profile.email || CONSULT_EMAIL,
        ...(profile.website && { "sameAs": [profile.website] }),
        "areaServed": profile.regions?.map(region => ({
          "@type": "State",
          "name": region
        })) || [],
        "priceRange": "$$",
        ...(profile.testimonials && profile.testimonials.length > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": (profile.testimonials.reduce((acc, t) => acc + t.rating, 0) / profile.testimonials.length).toFixed(1),
            "reviewCount": profile.testimonials.length,
            "bestRating": 5,
            "worstRating": 1
          }
        })
      },
      {
        "@type": "RealEstateAgent",
        "@id": `${BASE_URL}/broker/${brokerId}#agent`,
        "name": brokerName,
        "description": profile.bio || `Expert laundromat business broker with ${profile.yearsExperience || 'extensive'} years of experience.`,
        "url": `${BASE_URL}/broker/${brokerId}`,
        "image": profile.profileImageUrl || `${BASE_URL}/washbizhub-og-image.png`,
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
            "item": BASE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Brokers",
            "item": `${BASE_URL}/brokers`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": brokerName,
            "item": `${BASE_URL}/broker/${brokerId}`
          }
        ]
      },
      ...(profile.testimonials && profile.testimonials.length > 0 ? [{
        "@type": "Review",
        "itemReviewed": {
          "@type": "LocalBusiness",
          "name": brokerName
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": profile.testimonials[0].rating,
          "bestRating": 5
        },
        "author": {
          "@type": "Person",
          "name": profile.testimonials[0].name
        },
        "reviewBody": profile.testimonials[0].text
      }] : [])
    ]
  };

  return (
    <>
      <Helmet>
        <title>{brokerName} - Laundromat Broker | WashBizHub</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`${BASE_URL}/broker/${brokerId}`} />
        
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${brokerName} - Laundromat Broker | WashBizHub`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`${BASE_URL}/broker/${brokerId}`} />
        <meta property="og:image" content={profile.profileImageUrl || `${BASE_URL}/washbizhub-og-image.png`} />
        <meta property="og:site_name" content="WashBizHub" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${brokerName} - Laundromat Broker`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={profile.profileImageUrl || `${BASE_URL}/washbizhub-og-image.png`} />
        
        <meta name="keywords" content={`${brokerName}, laundromat broker, ${primaryRegion} laundromat, business broker, ${profile.specializations?.join(', ') || 'laundromat sales'}, coin laundry broker, sell laundromat`} />
        
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
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-[#C8A661]" />
                      <span>Serving: {profile.regions.join(", ")}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-years-experience">
                        {profile.yearsExperience || 0}+
                      </div>
                      <div className="text-xs text-muted-foreground">Years</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-listings-sold">
                        {profile.soldListings || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Sold</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-avg-sale-price">
                        ${avgSalePrice >= 1000000 ? `${(avgSalePrice / 1000000).toFixed(1)}M` : avgSalePrice >= 1000 ? `${(avgSalePrice / 1000).toFixed(0)}K` : avgSalePrice.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Sale</div>
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
                    Check back soon or contact {brokerName} directly for upcoming opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>

          <TestimonialsSection testimonials={profile.testimonials} />

          <ContactFormSection brokerName={brokerName} brokerEmail={profile.email} />
        </div>
      </div>
    </>
  );
}
