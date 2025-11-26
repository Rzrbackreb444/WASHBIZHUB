import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Check, Users, Globe, BookOpen, Award, Zap, Star, Crown, ExternalLink, Megaphone, Store, Wrench, ShoppingBag, ThumbsUp } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";

const FB_GROUP_URL = "https://facebook.com/groups/thelaundromat";
const FB_PAGE_URL = "https://facebook.com/washbizhub1";

interface AdvertisingProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  priceMonthly: string | null;
  priceOneTime: string | null;
  pricingType: string;
  features: string;
  popular: boolean;
  displayOrder: number;
}

interface SponsorFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  tagline: string;
  description: string;
}

export default function AdvertisePage() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<AdvertisingProduct | null>(null);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [sponsorForm, setSponsorForm] = useState<SponsorFormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    tagline: "",
    description: ""
  });

  const { data: products, isLoading } = useQuery<AdvertisingProduct[]>({
    queryKey: ["/api/advertising/products"],
  });

  const createSponsorMutation = useMutation({
    mutationFn: async (data: SponsorFormData) => {
      const res = await apiRequest("POST", "/api/advertising/sponsors", data);
      return res.json();
    },
    onSuccess: async (sponsor) => {
      if (selectedProduct) {
        const checkoutRes = await apiRequest("POST", "/api/advertising/checkout", {
          productId: selectedProduct.id,
          sponsorId: sponsor.id,
          billingCycle: selectedProduct.pricingType
        });
        const { url } = await checkoutRes.json();
        if (url) {
          window.location.href = url;
        }
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSelectProduct = (product: AdvertisingProduct) => {
    setSelectedProduct(product);
    setShowSponsorForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSponsorMutation.mutate(sponsorForm);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "facebook_group": return <Users className="h-5 w-5" />;
      case "website": return <Globe className="h-5 w-5" />;
      case "book_feature": return <BookOpen className="h-5 w-5" />;
      case "vendor_licensing": return <Award className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const formatPrice = (product: AdvertisingProduct) => {
    if (product.pricingType === "custom") return "Custom Pricing";
    const price = product.priceMonthly || product.priceOneTime;
    if (!price) return "Contact Us";
    const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(price));
    return product.pricingType === "monthly" ? `${formatted}/mo` : formatted;
  };

  const groupedProducts = products?.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, AdvertisingProduct[]>) || {};

  const categoryLabels: Record<string, string> = {
    facebook_group: "Facebook Group (72K Members)",
    website: "Website Advertising",
    book_feature: "Book Case Studies",
    vendor_licensing: "Vendor Licensing"
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-muted rounded w-1/3 mx-auto" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Advertise With WashBizHub | Reach 72,000+ Laundromat Owners"
        description="Promote your business to 72,000+ laundromat owners, investors, and operators. Facebook group advertising, website placements, sponsored content, and book features."
        canonicalUrl="/advertise"
        keywords={["laundromat advertising", "vendor marketing", "B2B advertising", "laundry industry", "72K members"]}
      />
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Users className="w-3 h-3 mr-1" />
              72,000+ Member Community
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-page-title">
              Advertise With WashBizHub
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Connect with the largest community of laundromat owners, investors, and operators online
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">72K+</div>
                <div className="text-sm text-blue-200">FB Group Members</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm text-blue-200">Monthly Visitors</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <Store className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-blue-200">Industry Focused</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <ThumbsUp className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">5.2%</div>
                <div className="text-sm text-blue-200">Avg CTR</div>
              </CardContent>
            </Card>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consultation">
              <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600" data-testid="button-hero-launch-special">
                <Crown className="w-5 h-5" />
                Get Launch Special — $500
                <Zap className="w-4 h-4" />
              </Button>
            </Link>
            <a href={FB_GROUP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="link-join-group">
                <SiFacebook className="w-5 h-5" />
                Join the 72K FB Group
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10" data-testid="link-follow-page">
                <SiFacebook className="w-5 h-5" />
                Follow @WashBizHub1
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Launch Special Banner */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Crown className="w-8 h-8" />
              <div>
                <div className="font-bold text-lg">Launch Partner Special — Only $500</div>
                <div className="text-sm text-amber-100">Save $998 off regular pricing — Limited Time Only!</div>
              </div>
            </div>
            <Link href="/consultation">
              <Button variant="secondary" className="gap-2" data-testid="button-launch-special">
                Claim Launch Pricing
                <Zap className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* User Journey CTAs */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/listing-form">
            <Card className="hover-elevate cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <Store className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">List Your Laundromat</h3>
                <p className="text-sm text-muted-foreground">Sell or find a laundromat</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/equipment-marketplace">
            <Card className="hover-elevate cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <Wrench className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">List Equipment</h3>
                <p className="text-sm text-muted-foreground">Buy or sell equipment</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor-form">
            <Card className="hover-elevate cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">Become a Vendor</h3>
                <p className="text-sm text-muted-foreground">Sell products & services</p>
              </CardContent>
            </Card>
          </Link>
          <Card className="bg-primary/5 border-primary h-full">
            <CardContent className="pt-6 text-center">
              <Megaphone className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold mb-1">Advertise</h3>
              <p className="text-sm text-muted-foreground">You're in the right place!</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4">

        <Tabs defaultValue="facebook_group" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            {Object.keys(categoryLabels).map(cat => (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-2 py-3" data-testid={`tab-${cat}`}>
                {getCategoryIcon(cat)}
                <span className="hidden md:inline">{categoryLabels[cat]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(categoryLabels).map(([category, label]) => (
            <TabsContent key={category} value={category}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{label}</h2>
                <p className="text-muted-foreground">
                  {category === "facebook_group" && "Get your brand in front of 72,000+ laundromat owners and aspiring entrepreneurs."}
                  {category === "website" && "Premium placement on WashBizHub.com with SEO-optimized content."}
                  {category === "book_feature" && "Be featured as a success story in our upcoming industry books."}
                  {category === "vendor_licensing" && "License your products and services to our network."}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupedProducts[category]?.sort((a, b) => a.displayOrder - b.displayOrder).map(product => {
                  const features = JSON.parse(product.features || "[]") as string[];
                  return (
                    <Card key={product.id} className={`relative ${product.popular ? "border-primary" : ""}`}>
                      {product.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                          <Star className="h-3 w-3 mr-1" /> Most Popular
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          {product.name}
                        </CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">{formatPrice(product)}</div>
                        <ul className="space-y-2">
                          {features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handleSelectProduct(product)}
                          data-testid={`button-select-${product.slug}`}
                        >
                          {product.pricingType === "custom" ? "Contact Us" : "Get Started"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={showSponsorForm} onOpenChange={setShowSponsorForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
              <DialogDescription>
                {selectedProduct && (
                  <>You're signing up for: <strong>{selectedProduct.name}</strong> - {formatPrice(selectedProduct)}</>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={sponsorForm.companyName}
                    onChange={e => setSponsorForm({ ...sponsorForm, companyName: e.target.value })}
                    required
                    data-testid="input-company-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={sponsorForm.contactName}
                    onChange={e => setSponsorForm({ ...sponsorForm, contactName: e.target.value })}
                    required
                    data-testid="input-contact-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={sponsorForm.email}
                    onChange={e => setSponsorForm({ ...sponsorForm, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={sponsorForm.phone}
                    onChange={e => setSponsorForm({ ...sponsorForm, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={sponsorForm.website}
                    onChange={e => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                    placeholder="https://"
                    data-testid="input-website"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={createSponsorMutation.isPending}
                data-testid="button-submit-sponsor"
              >
                {createSponsorMutation.isPending ? "Processing..." : "Proceed to Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Current Sponsors */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Current Sponsors & Partners</h2>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <div className="text-lg font-semibold">AAdvantage Laundry</div>
            <div className="text-lg font-semibold">Dexter Laundry</div>
            <div className="text-lg font-semibold">ATM Depot</div>
            <div className="text-lg font-semibold">Londr</div>
          </div>
        </div>

        {/* Final CTA with FB Links */}
        <section className="mt-16">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="py-12 text-center">
              <SiFacebook className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Connect with 72,000+ laundromat owners, find equipment deals, list your business, and grow your network in the largest laundry industry community online.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href={FB_GROUP_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2" data-testid="cta-join-fb-group">
                    <SiFacebook className="w-5 h-5" />
                    Join the FB Group
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
                <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2" data-testid="cta-follow-fb-page">
                    <SiFacebook className="w-5 h-5" />
                    Follow @WashBizHub1
                  </Button>
                </a>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Store className="w-4 h-4" />
                  Laundromats for Sale
                </span>
                <span className="flex items-center gap-1">
                  <Wrench className="w-4 h-4" />
                  Equipment Listings
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  Vendors & Suppliers
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Industry Community
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
    </>
  );
}
