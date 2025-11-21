import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import { 
  Package, Shield, Star, MapPin, Store, ArrowLeft, 
  ShoppingCart, Check, AlertCircle, Truck, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VendorStore, VendorProduct } from "@shared/schema";

export default function ProductDetail() {
  const params = useParams();
  const { storeSlug, productSlug } = params;
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch vendor store by slug
  const { data: store } = useQuery<VendorStore>({
    queryKey: ["/api/vendor-stores/slug", storeSlug],
    enabled: !!storeSlug,
  });

  // Fetch product by slug (needs custom queryFn to pass storeId as query param)
  const { data: product, isLoading } = useQuery<VendorProduct>({
    queryKey: ["/api/vendor-products/slug", productSlug, store?.id],
    enabled: !!store?.id && !!productSlug,
    queryFn: async () => {
      const res = await fetch(`/api/vendor-products/slug/${productSlug}?storeId=${store?.id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading product...</div>
      </div>
    );
  }

  if (!product || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur border-white/20 p-12 text-center">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Product not found</h3>
          <p className="text-white/70 mb-6">
            The product you're looking for doesn't exist or has been removed.
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

  const images = product.images || [];
  const hasImages = images.length > 0 || product.featuredImage;
  const displayImages = product.featuredImage 
    ? [product.featuredImage, ...images]
    : images;

  const pageTitle = `${product.name} | ${store.storeName} | WashBizHub`;
  const pageDescription = product.shortDescription || product.description || `Buy ${product.name} from ${store.storeName} on WashBizHub marketplace.`;

  const isOutOfStock = !!(product.trackInventory && product.stock !== null && product.stock <= 0);
  const isLowStock = !!(product.trackInventory && product.stock !== null && product.stock > 0 && product.stock < 5);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Breadcrumb */}
        <div className="bg-primary/10 backdrop-blur border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/vendors">
                <span data-testid="link-breadcrumb-marketplace" className="text-white/70 hover:text-white cursor-pointer">Marketplace</span>
              </Link>
              <span className="text-white/50">/</span>
              <Link href={`/vendors/${store.storeSlug}`}>
                <span data-testid="link-breadcrumb-store" className="text-white/70 hover:text-white cursor-pointer">{store.storeName}</span>
              </Link>
              <span className="text-white/50">/</span>
              <span data-testid="text-breadcrumb-product" className="text-white">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white/10 backdrop-blur rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                {hasImages ? (
                  <img 
                    src={displayImages[selectedImage]} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="w-32 h-32 text-white/30" />
                )}
              </div>

              {/* Thumbnail Gallery */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      data-testid={`button-image-${idx}`}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square bg-white/10 backdrop-blur rounded-lg overflow-hidden ${
                        selectedImage === idx ? "ring-2 ring-accent" : "opacity-60 hover:opacity-100"
                      } transition-all`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.featured && <Star className="w-5 h-5 text-accent fill-accent" />}
                  <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                </div>
                <h1 className="text-4xl font-black text-white mb-4">{product.name}</h1>
                {product.shortDescription && (
                  <p className="text-lg text-white/80">{product.shortDescription}</p>
                )}
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-black text-accent">
                  ${Number(product.price).toFixed(2)}
                </div>
                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                  <div className="text-2xl text-white/50 line-through">
                    ${Number(product.compareAtPrice).toFixed(2)}
                  </div>
                )}
                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                  <Badge variant="outline" className="border-accent/50 text-accent">
                    Save {Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)}%
                  </Badge>
                )}
              </div>

              {/* Stock Status */}
              {product.trackInventory && product.stock !== null && (
                <div className="flex items-center gap-2">
                  {isOutOfStock ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-500 font-bold">Out of Stock</span>
                    </>
                  ) : isLowStock ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-500 font-bold">Only {product.stock} left!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-500 font-bold">In Stock ({product.stock} available)</span>
                    </>
                  )}
                </div>
              )}

              {/* Sales Count */}
              {product.sales && product.sales > 0 && (
                <div className="text-sm text-white/60">
                  {product.sales} sold
                </div>
              )}

              {/* Purchase Section */}
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-6 space-y-4">
                  {/* Quantity Selector */}
                  {!isOutOfStock && (
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Quantity</label>
                      <div className="flex items-center gap-3">
                        <Button
                          data-testid="button-decrease-quantity"
                          size="icon"
                          variant="outline"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="border-white/20 text-white"
                        >
                          -
                        </Button>
                        <span className="text-2xl font-bold text-white w-12 text-center">
                          {quantity}
                        </span>
                        <Button
                          data-testid="button-increase-quantity"
                          size="icon"
                          variant="outline"
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={!!(product.trackInventory && product.stock !== null && quantity >= product.stock)}
                          className="border-white/20 text-white"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    data-testid="button-add-to-cart"
                    size="lg"
                    disabled={isOutOfStock}
                    className="w-full bg-accent text-primary font-bold text-lg py-6"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>

                  {/* Delivery Info */}
                  <div className="space-y-2 text-sm text-white/70 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-accent" />
                      <span>Free shipping on orders over $500</span>
                    </div>
                    {product.isDigital && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>Instant digital delivery</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Info */}
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                      {store.logo ? (
                        <img src={store.logo} alt={store.storeName} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-white/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        {store.storeName}
                        {store.verified && (
                          <Shield className="w-4 h-4 text-accent" />
                        )}
                      </CardTitle>
                      {store.avgRating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-accent fill-accent" />
                          <span className="text-white/70">{Number(store.avgRating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/vendors/${store.storeSlug}`}>
                    <Button 
                      data-testid="button-visit-store"
                      variant="outline" 
                      className="w-full border-accent/50 text-accent hover:bg-accent/10"
                    >
                      Visit Store
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs: Description, Specs, Reviews */}
          <div className="mt-12">
            <Tabs defaultValue="description">
              <TabsList className="bg-white/10 border-white/20">
                <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
                <TabsTrigger value="specs" data-testid="tab-specs">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-8">
                    <div className="prose prose-invert max-w-none">
                      {product.description ? (
                        <div className="text-white/80 whitespace-pre-wrap">{product.description}</div>
                      ) : (
                        <p className="text-white/60">No description available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specs" className="mt-6">
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-8">
                    <dl className="grid grid-cols-2 gap-4 text-white/80">
                      {product.sku && (
                        <>
                          <dt className="font-bold">SKU:</dt>
                          <dd>{product.sku}</dd>
                        </>
                      )}
                      <dt className="font-bold">Category:</dt>
                      <dd className="capitalize">{product.category}</dd>
                      
                      {product.subcategory && (
                        <>
                          <dt className="font-bold">Subcategory:</dt>
                          <dd className="capitalize">{product.subcategory}</dd>
                        </>
                      )}
                      
                      <dt className="font-bold">Type:</dt>
                      <dd>{product.isDigital ? "Digital Product" : "Physical Product"}</dd>
                      
                      {product.tags && product.tags.length > 0 && (
                        <>
                          <dt className="font-bold">Tags:</dt>
                          <dd className="flex flex-wrap gap-2">
                            {product.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </dd>
                        </>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-8 text-center">
                    <Star className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">No reviews yet</h3>
                    <p className="text-white/70 mb-6">
                      Be the first to review this product!
                    </p>
                    <Button variant="outline" className="border-accent/50 text-accent">
                      Write a Review
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
