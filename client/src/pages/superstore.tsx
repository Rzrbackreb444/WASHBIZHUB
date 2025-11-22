import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingCart, Package, Star, TrendingUp, Zap } from "lucide-react";
import { SUPERSTORE_TAXONOMY } from "@shared/superstore-taxonomy";

interface AmazonProduct {
  asin: string;
  title: string;
  brand?: string;
  price?: {
    displayAmount: string;
    amount: number;
  };
  image?: string;
  url: string;
  rating?: number;
  reviews?: number;
}

interface CatalogData {
  categories: any[];
  products: Record<string, AmazonProduct[]>;
  totalProducts: number;
  totalCategories: number;
  isFallback?: boolean;
}

export default function Superstore() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load entire catalog with batched backend endpoint
  const { data: catalogData, isLoading: catalogLoading } = useQuery<CatalogData>({
    queryKey: ['/api/superstore/catalog'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Search functionality
  const { data: searchResults, isLoading: searchLoading } = useQuery<AmazonProduct[]>({
    queryKey: ['/api/amazon/search', searchQuery],
    queryFn: async ({ queryKey }) => {
      const [, query] = queryKey;
      if (!query || typeof query !== 'string' || query.length === 0) return [];
      
      const response = await fetch(`/api/amazon/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.length > 0
  });

  const categoryProducts = catalogData?.products || {};
  const totalCategories = catalogData?.totalCategories || SUPERSTORE_TAXONOMY.length;
  const totalProducts = catalogData?.totalProducts || 0;

  const displayProducts = searchQuery.length > 0 
    ? searchResults || []
    : selectedCategory === 'all'
    ? Object.values(categoryProducts).flat().slice(0, 24)
    : categoryProducts[selectedCategory] || [];

  const isLoading = searchQuery.length > 0 ? searchLoading : catalogLoading;

  return (
    <>
      <Helmet>
        <title>Ultimate Laundromat Superstore - Complete Equipment & Supply Catalog | WashBizHub</title>
        <meta 
          name="description" 
          content="Browse 1,000+ commercial laundry products: washers, dryers, folding tables, R&B carts, supplies, HVAC, dog wash stations, vending machines, arcade games, parts, and more. One-click Amazon ordering with affiliate tracking." 
        />
        <meta 
          name="keywords" 
          content="commercial laundry equipment, washer dryer, folding tables, laundry carts, detergent supplies, air conditioner, water cooler, dog wash station, vending machine, arcade games, pinball, parts repair, coin changer, laundromat supplies" 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content="Ultimate Laundromat Superstore - Complete Equipment Catalog" />
        <meta property="og:description" content="1,000+ commercial laundry products with one-click ordering. Washers, dryers, supplies, HVAC, arcade games, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://washbizhub.com/superstore" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ultimate Laundromat Superstore" />
        <meta name="twitter:description" content="Complete commercial laundry equipment catalog with 1,000+ products" />
        
        {/* Structured Data - Product Catalog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Ultimate Laundromat Superstore",
            "description": "Complete commercial laundry equipment and supply catalog",
            "url": "https://washbizhub.com/superstore",
            "numberOfItems": totalProducts,
            "about": {
              "@type": "Product",
              "category": "Commercial Laundry Equipment"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#1a2332] via-[#2a3342] to-[#1a2332] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-[#C8A661] text-[#1a2332] border-0" data-testid="badge-superstore">
                <Package className="w-3 h-3 mr-1" />
                {totalCategories} Categories • {totalProducts}+ Products
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-superstore">
                Ultimate Laundromat Superstore
              </h1>
              <p className="text-xl text-gray-300 mb-8" data-testid="text-description">
                Everything you need to build, operate, and grow a world-class laundromat.
                From commercial washers to arcade games - all in one place.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search 1,000+ products: washers, dryers, carts, vending, arcade..."
                  className="pl-12 pr-4 py-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full h-auto flex flex-wrap justify-start gap-2 bg-transparent p-4">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#1a2332]"
                  data-testid="tab-all"
                >
                  All Equipment
                </TabsTrigger>
                {SUPERSTORE_TAXONOMY.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#1a2332]"
                    data-testid={`tab-${category.id}`}
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Fallback Mode Banner */}
        {catalogData?.isFallback && (
          <div className="bg-yellow-500/10 border-y border-yellow-500/20 py-3">
            <div className="container mx-auto px-4">
              <p className="text-sm text-center text-muted-foreground">
                <strong>Demo Mode:</strong> Showing curated product recommendations. Click any product to search Amazon with affiliate tracking.
              </p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-12">
          {isLoading && selectedCategory !== 'all' && searchQuery.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="w-full h-48 bg-muted rounded-md" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold" data-testid="heading-results">
                  {searchQuery 
                    ? `Search Results for "${searchQuery}"`
                    : selectedCategory === 'all'
                    ? 'Featured Products'
                    : SUPERSTORE_TAXONOMY.find(c => c.id === selectedCategory)?.label
                  }
                </h2>
                <p className="text-muted-foreground" data-testid="text-count">
                  {displayProducts.length} products
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProducts.map((product: AmazonProduct) => (
                  <Link key={product.asin} href={`/superstore/product/${product.asin}`}>
                  <Card className="flex flex-col hover-elevate cursor-pointer" data-testid={`card-product-${product.asin}`}>
                    <CardHeader className="p-0">
                      {product.image && (
                        <div className="relative w-full h-64 bg-muted rounded-t-lg overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-contain"
                            data-testid={`img-product-${product.asin}`}
                          />
                          {product.rating && (
                            <Badge className="absolute top-2 right-2 bg-[#C8A661] text-[#1a2332] border-0">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {product.rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 pt-4">
                      <h3 className="font-semibold line-clamp-2 mb-2" data-testid={`text-title-${product.asin}`}>
                        {product.title}
                      </h3>
                      {product.brand && (
                        <p className="text-sm text-muted-foreground mb-2" data-testid={`text-brand-${product.asin}`}>
                          {product.brand}
                        </p>
                      )}
                      {product.price && (
                        <p className="text-lg font-bold text-[#C8A661]" data-testid={`text-price-${product.asin}`}>
                          {product.price.displayAmount}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        className="w-full bg-[#C8A661] hover:bg-[#b89551] text-[#1a2332]"
                        onClick={() => window.open(product.url, '_blank')}
                        data-testid={`button-buy-${product.asin}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View on Amazon
                      </Button>
                    </CardFooter>
                  </Card>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2" data-testid="text-no-results">
                {selectedCategory === 'all' && searchQuery.length === 0
                  ? 'Loading products...'
                  : 'No products found'
                }
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try different search terms'
                  : 'Select a category to browse products'
                }
              </p>
            </div>
          )}
        </div>

        {/* Category Information */}
        {selectedCategory !== 'all' && (
          <div className="bg-muted/30 py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                {(() => {
                  const category = SUPERSTORE_TAXONOMY.find(c => c.id === selectedCategory);
                  if (!category) return null;
                  
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle data-testid={`heading-category-${selectedCategory}`}>
                          About {category.label}
                        </CardTitle>
                        <CardDescription data-testid={`text-category-desc-${selectedCategory}`}>
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Popular Searches:</h4>
                            <div className="flex flex-wrap gap-2">
                              {category.seoKeywords.map((keyword, idx) => (
                                <Badge key={idx} variant="outline" data-testid={`badge-keyword-${idx}`}>
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {category.subcategories && (
                            <div>
                              <h4 className="font-semibold mb-2">Subcategories:</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {category.subcategories.map((sub) => (
                                  <Button
                                    key={sub.id}
                                    variant="outline"
                                    className="justify-start"
                                    onClick={() => setSearchQuery(sub.amazonSearches[0])}
                                    data-testid={`button-subcategory-${sub.id}`}
                                  >
                                    {sub.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-[#1a2332] via-[#2a3342] to-[#1a2332] text-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="heading-benefits">
              Why Shop the Ultimate Superstore?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <Zap className="w-8 h-8 text-[#C8A661] mb-2" />
                  <CardTitle data-testid="heading-benefit-1">One-Click Ordering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Instant access to 1,000+ products through our Amazon partnership.
                    Fast shipping, easy returns, Prime eligible.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <TrendingUp className="w-8 h-8 text-[#C8A661] mb-2" />
                  <CardTitle data-testid="heading-benefit-2">Affiliate Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Earn commissions on referrals. Every purchase through our platform
                    supports the laundromat community.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <Star className="w-8 h-8 text-[#C8A661] mb-2" />
                  <CardTitle data-testid="heading-benefit-3">Expert Curated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Handpicked products from industry experts. Only the best equipment,
                    parts, and supplies for your business.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
