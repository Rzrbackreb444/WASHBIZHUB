import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
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
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
      await apiRequest("POST", `/api/contact/broker/${data?.profile.id}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "The broker will get back to you soon!",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
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
    );
  }

  const { profile, listings } = data;
  const initials = profile.companyName
    ? profile.companyName.split(" ").map(w => w[0]).join("").slice(0, 2)
    : profile.nickname?.slice(0, 2) || "B";

  return (
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
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10">
        <Card className="bg-card border shadow-sm overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-28 w-28 border-4 border-[#C8A661]">
                <AvatarImage src={profile.profileImageUrl || undefined} alt={profile.companyName || "Broker"} />
                <AvatarFallback className="text-2xl bg-[#0A1628] text-[#C8A661]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-broker-name">
                    {profile.companyName || profile.nickname || "Broker"}
                  </h1>
                  {profile.verified && (
                    <Badge className="bg-[#C8A661] text-[#0A1628] no-default-hover-elevate">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-listings">
                      {profile.totalListings || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-active-listings">
                      {profile.activeListings || listings.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-sold-listings">
                      {profile.soldListings || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Sold</div>
                  </div>
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
          </div>

          {listings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Listings</h3>
                <p className="text-muted-foreground">
                  This broker doesn't have any active listings at the moment.
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
                          "Sending..."
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
  );
}
