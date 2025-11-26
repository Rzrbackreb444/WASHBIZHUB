import { useState } from "react";
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
import { Check, Users, Globe, BookOpen, Award, Zap, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">
            Advertise to 72,000+ Laundromat Owners
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reach decision-makers in the laundromat industry through our Facebook group, website, books, and licensing programs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-12">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary">72K+</div>
            <div className="text-sm text-muted-foreground">Facebook Members</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary">50K+</div>
            <div className="text-sm text-muted-foreground">Monthly Website Visitors</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary">10+</div>
            <div className="text-sm text-muted-foreground">Industry Books</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary">$2B+</div>
            <div className="text-sm text-muted-foreground">Industry Reach</div>
          </Card>
        </div>

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

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Current Sponsors</h2>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <div className="text-lg font-semibold">AAdvantage Laundry</div>
            <div className="text-lg font-semibold">Dexter Laundry</div>
            <div className="text-lg font-semibold">ATM Depot</div>
          </div>
        </div>
      </div>
    </div>
  );
}
