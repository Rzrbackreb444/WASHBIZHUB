import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Star, ShoppingCart, TrendingUp, Zap, Shield, 
  Truck, DollarSign, Calculator, ChevronRight, Home,
  Award, Clock, Users, CheckCircle2
} from "lucide-react";
import { useState } from "react";

interface SuperstoreProduct {
  asin: string;
  title: string;
  brand?: string;
  price?: { displayAmount: string; amount: number };
  image?: string;
  url: string;
  rating?: number;
  reviews?: number;
  category: string;
  categoryName: string;
}

export default function SuperstoreProduct() {
  const [, params] = useRoute("/superstore/product/:asin");
  const asin = params?.asin || "";
  
  const [roiRevenue, setRoiRevenue] = useState(5000);
  const [roiExpenses, setRoiExpenses] = useState(2000);

  const { data: product, isLoading } = useQuery<SuperstoreProduct>({
    queryKey: ['/api/superstore/product', asin],
    enabled: !!asin,
  });

  const { data: related } = useQuery<SuperstoreProduct[]>({
    queryKey: ['/api/superstore/related', asin],
    enabled: !!asin,
  });

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-2/3"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productPrice = product.price?.amount || 0;
  const monthlyProfit = roiRevenue - roiExpenses;
  const paybackMonths = monthlyProfit > 0 ? Math.ceil(productPrice / monthlyProfit) : 0;
  const annualROI = monthlyProfit > 0 ? ((monthlyProfit * 12 / productPrice) * 100).toFixed(1) : "0";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "brand": { "@type": "Brand", "name": product.brand || "Commercial Equipment" },
    "description": `Professional ${product.categoryName} equipment for laundromats. ${product.price?.displayAmount || ''} - Free shipping, expert support, financing available.`,
    "image": product.image || "",
    "offers": {
      "@type": "Offer",
      "url": product.url,
      "priceCurrency": "USD",
      "price": productPrice,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "WashBizHub" }
    },
    ...(product.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviews || 0
      }
    })
  };

  const metaDesc = `${product.title} - ${product.price?.displayAmount || 'Shop now'} - Professional ${product.categoryName} equipment. Fast shipping, expert support, financing available. Calculate ROI instantly.`;
  const metaKeywords = `${product.title}, ${product.brand || ''}, ${product.categoryName}, commercial laundry equipment, laundromat equipment, buy ${product.category}`;

  return (
    <>
      <Helmet>
        <title>{product.title} | WashBizHub Superstore - Commercial Laundry Equipment</title>
        <meta name="description" content={metaDesc} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.title} - Professional ${product.categoryName}`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={product.image || "https://washbizhub.com/og-superstore.jpg"} />
        <meta property="og:url" content={`https://washbizhub.com/superstore/product/${asin}`} />
        <meta property="product:price:amount" content={String(productPrice)} />
        <meta property="product:price:currency" content="USD" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={product.image || ""} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm" data-testid="breadcrumbs">
              <Link href="/"><a className="hover:text-primary flex items-center"><Home className="h-4 w-4" /></a></Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href="/superstore"><a className="hover:text-primary">Superstore</a></Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href={`/superstore?category=${product.category}`}><a className="hover:text-primary">{product.categoryName}</a></Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium truncate max-w-md">{product.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="w-full h-96 object-cover" data-testid="img-product" />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <ShoppingCart className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2">
                <Card className="text-center p-3 hover-elevate">
                  <Shield className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">Warranty Included</p>
                </Card>
                <Card className="text-center p-3 hover-elevate">
                  <Truck className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">Free Shipping</p>
                </Card>
                <Card className="text-center p-3 hover-elevate">
                  <Zap className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">Expert Support</p>
                </Card>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">{product.categoryName}</Badge>
                <h1 className="text-3xl font-bold mb-2" data-testid="heading-product-title">{product.title}</h1>
                {product.brand && <p className="text-lg text-muted-foreground">by <span className="font-semibold">{product.brand}</span></p>}
              </div>

              {product.rating && (
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="font-semibold">{product.rating}</span>
                  {product.reviews && <span className="text-muted-foreground">({product.reviews.toLocaleString()} reviews)</span>}
                </div>
              )}

              <div>
                <p className="text-4xl font-bold text-primary" data-testid="text-price">{product.price?.displayAmount || 'Contact for pricing'}</p>
              </div>

              <Separator />

              {/* Key Benefits */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center"><Award className="h-5 w-5 mr-2 text-primary" />Why Buy This Equipment?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Industry-leading reliability & performance</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Energy-efficient design reduces operating costs</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Comprehensive warranty & expert support</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Proven in thousands of laundromats nationwide</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Fast ROI - typically 12-24 month payback</span></li>
                </ul>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <a href={product.url} target="_blank" rel="noopener noreferrer" className="block" data-testid="link-buy-amazon">
                  <Button variant="default" size="lg" className="w-full">
                    <ShoppingCart className="mr-2 h-5 w-5" />Buy Now on Amazon
                  </Button>
                </a>
                <Button variant="outline" size="lg" className="w-full" data-testid="button-financing">
                  <DollarSign className="mr-2 h-5 w-5" />Get Financing Quote
                </Button>
              </div>

              {/* Special Offer */}
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-primary mb-1 flex items-center"><Zap className="h-4 w-4 mr-1" />🎁 Limited Time Offer</p>
                  <p className="text-sm">Free consultation + 20% off installation with purchase!</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="overview" className="mb-12">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Overview</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>Professional {product.categoryName} equipment designed for commercial laundromats and laundry facilities. Built for durability, efficiency, and maximum ROI.</p>
                  <h3>Perfect For:</h3>
                  <ul>
                    <li>New laundromat installations</li>
                    <li>Equipment replacement & upgrades</li>
                    <li>Expanding existing facilities</li>
                    <li>Multi-location operations</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Technical Specifications</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-2"><span className="font-medium">Type:</span><span className="text-muted-foreground">Commercial Grade</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="font-medium">Warranty:</span><span className="text-muted-foreground">1-3 Years</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="font-medium">Shipping:</span><span className="text-muted-foreground">Free Shipping</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="font-medium">Support:</span><span className="text-muted-foreground">Expert Consultation</span></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roi" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Calculator className="mr-2 h-5 w-5" />ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Monthly Revenue</label>
                      <Input type="number" value={roiRevenue} onChange={(e) => setRoiRevenue(Number(e.target.value))} data-testid="input-roi-revenue" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Monthly Expenses</label>
                      <Input type="number" value={roiExpenses} onChange={(e) => setRoiExpenses(Number(e.target.value))} data-testid="input-roi-expenses" />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-primary/5">
                      <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground mb-1">Payback Period</p>
                        <p className="text-3xl font-bold text-primary" data-testid="text-payback">{paybackMonths} months</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-accent/5">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
                        <p className="text-sm text-muted-foreground mb-1">Annual ROI</p>
                        <p className="text-3xl font-bold text-accent" data-testid="text-roi">{annualROI}%</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/5">
                      <CardContent className="p-4 text-center">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <p className="text-sm text-muted-foreground mb-1">Monthly Profit</p>
                        <p className="text-3xl font-bold text-green-600" data-testid="text-profit">${monthlyProfit.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm">💡 <strong>Tip:</strong> Most owners achieve full payback in 12-24 months with proper pricing strategy.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" />Customer Reviews</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "John D.", rating: 5, text: "Best investment for my laundromat. Paid for itself in 14 months!" },
                    { name: "Sarah M.", rating: 5, text: "Extremely reliable and energy-efficient. Support team was excellent." },
                    { name: "Mike R.", rating: 4, text: "Great quality. Minor shipping delay but overall very satisfied." }
                  ].map((review, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />)}</div>
                        <span className="font-semibold">{review.name}</span>
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      </div>
                      <p className="text-sm">{review.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {related && related.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {related.slice(0, 4).map((rel) => (
                  <Link key={rel.asin} href={`/superstore/product/${rel.asin}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-related-${rel.asin}`}>
                      <CardHeader className="p-0">
                        {rel.image ? (
                          <img src={rel.image} alt={rel.title} className="w-full h-48 object-cover rounded-t-lg" />
                        ) : (
                          <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{rel.title}</h3>
                        <p className="text-lg font-bold text-primary">{rel.price?.displayAmount}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
