import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import { 
  Store, Shield, Star, MapPin, Package, TrendingUp, 
  Mail, Phone, Globe, ArrowLeft, Filter, Grid, List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VendorStore, VendorProduct } from "@shared/schema";

export default function VendorStorefront() {
  const params = useParams();
  const storeSlug = params.storeSlug;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch vendor store by slug
  const { data: store, isLoading: storeLoading } = useQuery<VendorStore>({
    queryKey: ["/api/vendor-stores/slug", storeSlug],
    enabled: !!storeSlug,
  });

  // Fetch products for this store
  const { data: products, isLoading: productsLoading } = useQuery<VendorProduct[]>({
    queryKey: ["/api/vendor-products/store", store?.id],
    enabled: !!store?.id,
  });

  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      product.category === categoryFilter;

    return matchesSearch && matchesCategory && product.status === "active";
  })?.sort((a, b) => {
    if (sortBy === "featured") {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.sales || 0) - (a.sales || 0);
    }
    if (sortBy === "sales") return (b.sales || 0) - (a.sales || 0);
    if (sortBy === "price-low") return Number(a.price || "0") - Number(b.price || "0");
    if (sortBy === "price-high") return Number(b.price || "0") - Number(a.price || "0");
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  const categories = [
    { value: "all", label: "All Products" },
    { value: "equipment", label: "Equipment" },
    { value: "detergent", label: "Detergents" },
    { value: "services", label: "Services" },
    { value: "digital", label: "Digital Products" },
    { value: "consulting", label: "Consulting" },
  ];

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading store...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur border-white/20 p-12 text-center">
          <Store className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Store not found</h3>
          <p className="text-white/70 mb-6">
            The vendor store you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/vendors">
            <Button variant="outline" className="border-accent/50 text-accent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pageTitle = `${store.storeName} | Vendor Marketplace | WashBizHub`;
  const pageDescription = store.description || `Shop quality products from ${store.storeName}, a verified vendor on WashBizHub marketplace.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Back Link */}
        <div className="bg-primary/10 backdrop-blur border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Link href="/vendors">
              <Button 
                data-testid="button-back-to-marketplace"
                variant="ghost" 
                className="text-white/70 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Store Header */}
        <div className="relative">
          {/* Banner */}
          {store.banner ? (
            <div className="h-64 overflow-hidden">
              <img 
                src={store.banner} 
                alt={store.storeName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-primary/40 to-accent/40" />
          )}

          {/* Store Info Overlay */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative -mt-32 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo */}
                <div className="w-32 h-32 rounded-xl bg-white/10 backdrop-blur border-4 border-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {store.logo ? (
                    <img src={store.logo} alt={store.storeName} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-12 h-12 text-white/50" />
                  )}
                </div>

                {/* Store Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-black text-white">{store.storeName}</h1>
                      {store.verified && (
                        <Badge variant="outline" className="border-accent/50 text-accent">
                          <Shield className="w-4 h-4 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {store.featured && (
                        <Star className="w-6 h-6 text-accent fill-accent" />
                      )}
                    </div>
                    {store.description && (
                      <p className="text-lg text-white/80">{store.description}</p>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-accent" />
                      <span className="text-white font-bold">{store.totalProducts || 0}</span>
                      <span className="text-white/60">Products</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-accent" />
                      <span className="text-white font-bold">
                        {store.avgRating ? Number(store.avgRating).toFixed(1) : "No reviews"}
                      </span>
                      {store.reviewCount ? (
                        <span className="text-white/60">({store.reviewCount} reviews)</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      <span className="text-white font-bold">{Number(store.totalSales || "0")}</span>
                      <span className="text-white/60">Sales</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {(store.city || store.state) && (
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="w-4 h-4" />
                        <span>{[store.city, store.state].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {store.email && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${store.email}`} className="hover:text-accent transition-colors">
                          {store.email}
                        </a>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${store.phone}`} className="hover:text-accent transition-colors">
                          {store.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Tabs defaultValue="products" className="space-y-8">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
              <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              {/* Product Filters */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex flex-wrap gap-3 items-center flex-1 w-full md:w-auto">
                  <Input
                    data-testid="input-product-search"
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger data-testid="select-category-filter" className="w-[180px] bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-testid="select-sort-by" className="w-[160px] bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="sales">Best Selling</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    data-testid="button-view-grid"
                    size="icon"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-accent text-primary" : "border-white/20 text-white"}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    data-testid="button-view-list"
                    size="icon"
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-accent text-primary" : "border-white/20 text-white"}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Product Count */}
              <div className="text-sm text-white/70">
                {filteredProducts?.length || 0} products found
              </div>

              {/* Products Grid/List */}
              {productsLoading ? (
                <div className={viewMode === "grid" ? "grid md:grid-cols-3 gap-6" : "space-y-4"}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="bg-white/10 backdrop-blur border-white/20 animate-pulse">
                      <div className="h-48 bg-white/5 rounded-t-xl" />
                      <CardContent className="p-6">
                        <div className="h-6 bg-white/10 rounded mb-2" />
                        <div className="h-4 bg-white/10 rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className={viewMode === "grid" ? "grid md:grid-cols-3 gap-6" : "space-y-4"}>
                  {filteredProducts.map(product => (
                    <Link 
                      key={product.id} 
                      href={`/vendors/${store.storeSlug}/products/${product.slug}`}
                    >
                      <Card 
                        data-testid={`card-product-${product.id}`}
                        className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full"
                      >
                        {/* Product Image */}
                        {product.featuredImage ? (
                          <div className="h-48 overflow-hidden rounded-t-xl">
                            <img 
                              src={product.featuredImage} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-xl flex items-center justify-center">
                            <Package className="w-16 h-16 text-white/30" />
                          </div>
                        )}

                        <CardHeader>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <CardTitle className="text-lg font-bold text-white group-hover:text-accent transition-colors line-clamp-2">
                              {product.name}
                            </CardTitle>
                            {product.featured && (
                              <Star className="w-5 h-5 text-accent fill-accent flex-shrink-0" />
                            )}
                          </div>

                          {product.shortDescription && (
                            <CardDescription className="text-white/70 line-clamp-2 text-sm">
                              {product.shortDescription}
                            </CardDescription>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-black text-accent">
                              ${Number(product.price).toFixed(2)}
                            </div>
                            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                              <div className="text-sm text-white/50 line-through">
                                ${Number(product.compareAtPrice).toFixed(2)}
                              </div>
                            )}
                          </div>

                          {product.category && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                          )}

                          {product.sales && product.sales > 0 && (
                            <div className="text-sm text-white/60">
                              {product.sales} sold
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="border-t border-white/10 pt-4">
                          <Button 
                            data-testid={`button-view-product-${product.id}`}
                            variant="outline" 
                            className="w-full border-accent/50 text-accent hover:bg-accent/10"
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/10 backdrop-blur border-white/20 p-12 text-center">
                  <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                  <p className="text-white/70">
                    {searchQuery || categoryFilter !== "all"
                      ? "Try adjusting your filters or search query."
                      : "This store hasn't added any products yet."}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">About {store.storeName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-white/80">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                    <p>{store.description || "No description provided."}</p>
                  </div>

                  {(store.address || store.city || store.state || store.zip) && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Location</h3>
                      <div className="space-y-1">
                        {store.address && <p>{store.address}</p>}
                        <p>{[store.city, store.state, store.zip].filter(Boolean).join(", ")}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Contact</h3>
                    <div className="space-y-2">
                      {store.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-accent" />
                          <a href={`mailto:${store.email}`} className="hover:text-accent transition-colors">
                            {store.email}
                          </a>
                        </div>
                      )}
                      {store.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-accent" />
                          <a href={`tel:${store.phone}`} className="hover:text-accent transition-colors">
                            {store.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
