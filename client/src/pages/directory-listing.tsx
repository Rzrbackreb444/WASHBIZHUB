import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, 
  Globe, 
  Phone, 
  Mail,
  Building2, 
  CheckCircle2,
  ExternalLink,
  Calendar,
  Users,
  Star,
  Sparkles,
  ArrowLeft,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Send,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

interface BusinessListing {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId?: string;
  ownerEmail: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  serviceArea?: string;
  logo?: string;
  coverImage?: string;
  yearEstablished?: number;
  employeeCount?: string;
  servicesOffered?: string[];
  brandsCarried?: string[];
  certifications?: string[];
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  tier: string;
  isFeatured: boolean;
  hasVerifiedBadge: boolean;
  isVerified: boolean;
  viewCount: number;
  clickCount: number;
}

export default function DirectoryListingPage() {
  const [, params] = useRoute("/directory/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  const { data: listing, isLoading } = useQuery<BusinessListing>({
    queryKey: ["/api/directory/listings", slug],
    enabled: !!slug,
  });

  const trackClickMutation = useMutation({
    mutationFn: async (type: string) => {
      return apiRequest(`/api/directory/listings/${listing?.id}/track`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/directory/inquiries", {
        method: "POST",
        body: JSON.stringify({
          listingId: listing?.id,
          ...data,
          source: "directory"
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Your inquiry has been sent to the business.",
      });
      setShowInquiryForm(false);
      setInquiryForm({ name: "", email: "", phone: "", company: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleWebsiteClick = () => {
    trackClickMutation.mutate("website");
  };

  const handlePhoneClick = () => {
    trackClickMutation.mutate("phone");
  };

  const handleEmailClick = () => {
    trackClickMutation.mutate("email");
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inquiryMutation.mutate(inquiryForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-64 rounded-lg mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Business Not Found</h1>
        <p className="text-slate-500 mb-6">This listing may have been removed or doesn't exist.</p>
        <Link href="/directory">
          <Button data-testid="button-back-directory">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-slate-800 to-slate-900 relative">
        {listing.coverImage && (
          <img 
            src={listing.coverImage} 
            alt={listing.businessName}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-12">
        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {listing.logo ? (
                  <img 
                    src={listing.logo} 
                    alt={listing.businessName}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-[#39CCCC]/20 rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                    <Building2 className="w-12 h-12 text-[#39CCCC]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {listing.businessName}
                  </h1>
                  {listing.hasVerifiedBadge && (
                    <Badge className="bg-blue-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {listing.isFeatured && (
                    <Badge className="bg-[#b8860b]">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-4">
                  {listing.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.city}, {listing.state}
                    </span>
                  )}
                  {listing.serviceArea && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {listing.serviceArea}
                    </span>
                  )}
                  {listing.yearEstablished && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Est. {listing.yearEstablished}
                    </span>
                  )}
                  {listing.employeeCount && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {listing.employeeCount} employees
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  {listing.website && (
                    <a 
                      href={listing.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={handleWebsiteClick}
                    >
                      <Button className="bg-[#39CCCC] hover:bg-[#2db3b3]" data-testid="button-website">
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </a>
                  )}
                  {listing.phone && (
                    <a href={`tel:${listing.phone}`} onClick={handlePhoneClick}>
                      <Button variant="outline" data-testid="button-phone">
                        <Phone className="w-4 h-4 mr-2" />
                        {listing.phone}
                      </Button>
                    </a>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInquiryForm(true)}
                    data-testid="button-contact"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Services */}
            {listing.servicesOffered && listing.servicesOffered.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {listing.servicesOffered.map((service, i) => (
                      <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Brands */}
            {listing.brandsCarried && listing.brandsCarried.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Brands We Carry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {listing.brandsCarried.map((brand, i) => (
                      <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inquiry Form */}
            {showInquiryForm && (
              <Card className="border-[#39CCCC]">
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                  <CardDescription>
                    Contact {listing.businessName} directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          required
                          value={inquiryForm.name}
                          onChange={(e) => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                          data-testid="input-inquiry-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                          data-testid="input-inquiry-email"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                          data-testid="input-inquiry-phone"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={inquiryForm.company}
                          onChange={(e) => setInquiryForm(f => ({ ...f, company: e.target.value }))}
                          data-testid="input-inquiry-company"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        required
                        rows={4}
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="How can they help you?"
                        data-testid="input-inquiry-message"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        className="bg-[#39CCCC] hover:bg-[#2db3b3]"
                        disabled={inquiryMutation.isPending}
                        data-testid="button-send-inquiry"
                      >
                        {inquiryMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Message
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowInquiryForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {listing.address && (
                  <div>
                    <Label className="text-slate-500">Address</Label>
                    <p className="text-slate-900">
                      {listing.address}<br />
                      {listing.city}, {listing.state} {listing.zip}
                    </p>
                  </div>
                )}
                {listing.phone && (
                  <div>
                    <Label className="text-slate-500">Phone</Label>
                    <a 
                      href={`tel:${listing.phone}`} 
                      className="text-[#39CCCC] hover:underline block"
                      onClick={handlePhoneClick}
                    >
                      {listing.phone}
                    </a>
                  </div>
                )}
                {listing.email && (
                  <div>
                    <Label className="text-slate-500">Email</Label>
                    <a 
                      href={`mailto:${listing.email}`} 
                      className="text-[#39CCCC] hover:underline block"
                      onClick={handleEmailClick}
                    >
                      {listing.email}
                    </a>
                  </div>
                )}
                {listing.website && (
                  <div>
                    <Label className="text-slate-500">Website</Label>
                    <a 
                      href={listing.website} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#39CCCC] hover:underline flex items-center gap-1"
                      onClick={handleWebsiteClick}
                    >
                      {listing.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            {(listing.facebook || listing.instagram || listing.linkedin || listing.twitter || listing.youtube) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {listing.facebook && (
                      <a href={listing.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        <Facebook className="w-5 h-5 text-blue-600" />
                      </a>
                    )}
                    {listing.instagram && (
                      <a href={listing.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        <Instagram className="w-5 h-5 text-pink-600" />
                      </a>
                    )}
                    {listing.linkedin && (
                      <a href={listing.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        <Linkedin className="w-5 h-5 text-blue-700" />
                      </a>
                    )}
                    {listing.twitter && (
                      <a href={listing.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        <Twitter className="w-5 h-5 text-sky-500" />
                      </a>
                    )}
                    {listing.youtube && (
                      <a href={listing.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        <Youtube className="w-5 h-5 text-red-600" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back Link */}
            <Link href="/directory">
              <Button variant="outline" className="w-full" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
