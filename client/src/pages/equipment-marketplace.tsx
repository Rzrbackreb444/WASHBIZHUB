import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Search, ShoppingCart, Package, Truck, Wrench, Table2, Box, Award } from "lucide-react";
import { Star } from "@/lib/icon-registry";
import industrialMachines from "@assets/dexter_laundromat_corner_shot_1765330859864.jpg";
import dexterStock from "@assets/Dexter_Laundromat_Stock_photo_1765330872542.jpg";

interface AmazonProduct {
  asin: string;
  title: string;
  brand?: string;
  price?: {
    amount: number;
    currency: string;
    displayAmount: string;
  };
  image?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  isPrimeEligible?: boolean;
  category: string;
}

const EQUIPMENT_CATEGORIES = [
  { id: "all", label: "All Equipment", icon: Package, searches: [] },
  { 
    id: "washers", 
    label: "Commercial Washers", 
    icon: Package,
    searches: [
      "commercial washing machine coin operated",
      "speed queen commercial washer",
      "maytag commercial washer"
    ]
  },
  { 
    id: "dryers", 
    label: "Commercial Dryers", 
    icon: Box,
    searches: [
      "commercial dryer coin operated",
      "speed queen commercial dryer",
      "huebsch commercial dryer"
    ]
  },
  { 
    id: "tables", 
    label: "Folding Tables", 
    icon: Table2,
    searches: [
      "commercial folding table laundry",
      "laundromat folding table commercial",
      "heavy duty folding table laundry"
    ]
  },
  { 
    id: "carts", 
    label: "Laundry Carts", 
    icon: Truck,
    searches: [
      "commercial laundry cart heavy duty",
      "rolling laundry basket commercial",
      "laundromat cart with wheels"
    ]
  },
  { 
    id: "parts", 
    label: "Parts & Repairs", 
    icon: Wrench,
    searches: [
      "commercial washer parts",
      "dryer replacement parts commercial",
      "laundry machine repair kit"
    ]
  },
  { 
    id: "supplies", 
    label: "Supplies", 
    icon: ShoppingCart,
    searches: [
      "laundry detergent commercial bulk",
      "fabric softener commercial gallon",
      "laundromat supplies vending"
    ]
  },
];

export default function EquipmentMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<AmazonProduct[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const category = EQUIPMENT_CATEGORIES.find(c => c.id === selectedCategory) || EQUIPMENT_CATEGORIES[0];

  // Eager-load all categories on mount
  useEffect(() => {
    const loadAllCategories = async () => {
      const allResults: AmazonProduct[] = [];
      
      for (const cat of EQUIPMENT_CATEGORIES.slice(1)) { // Skip "all" category
        if (!cat.searches || cat.searches.length === 0) continue;
        
        for (const searchTerm of cat.searches) {
          try {
            const response = await fetch(`/api/amazon/search?keywords=${encodeURIComponent(searchTerm)}&itemCount=3`);
            if (response.ok) {
              const data = await response.json();
              const productsWithCategory = data.products.map((p: any) => ({
                ...p,
                category: cat.id
              }));
              allResults.push(...productsWithCategory);
            }
          } catch (error) {
            console.error('Failed to fetch products for:', searchTerm);
          }
        }
      }
      
      setAllProducts(allResults);
      setIsInitialLoad(false);
    };

    loadAllCategories();
  }, []);

  // Fetch products for selected category
  const { data: products = [], isLoading } = useQuery<AmazonProduct[]>({
    queryKey: ['/api/amazon/products', selectedCategory],
    queryFn: async () => {
      if (selectedCategory === "all" || !category.searches || category.searches.length === 0) {
        return allProducts;
      }

      const allResults: AmazonProduct[] = [];
      
      for (const searchTerm of category.searches) {
        try {
          const response = await fetch(`/api/amazon/search?keywords=${encodeURIComponent(searchTerm)}&itemCount=5`);
          if (response.ok) {
            const data = await response.json();
            const productsWithCategory = data.products.map((p: any) => ({
              ...p,
              category: selectedCategory
            }));
            allResults.push(...productsWithCategory);
          }
        } catch (error) {
          console.error('Failed to fetch products for:', searchTerm);
        }
      }
      
      return allResults;
    },
    enabled: selectedCategory !== "all" && !isInitialLoad,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Load products when category changes
  useEffect(() => {
    if (selectedCategory !== "all" && products.length > 0) {
      setAllProducts(prev => {
        const filtered = prev.filter(p => p.category !== selectedCategory);
        return [...filtered, ...products];
      });
    }
  }, [products, selectedCategory]);

  const displayProducts = selectedCategory === "all" 
    ? allProducts 
    : products;

  const filteredProducts = displayProducts.filter(p =>
    searchQuery === "" || 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SEO: Structured data for products
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Commercial Laundromat Equipment Marketplace",
    "description": "Buy commercial washers, dryers, folding tables, laundry carts, parts and supplies for your laundromat. Wholesale prices with Amazon Prime delivery.",
    "url": "https://washbizhub.com/equipment",
    "mainEntity": {
      "@type": "OfferCatalog",
      "name": "Laundromat Equipment & Supplies",
      "itemListElement": filteredProducts.slice(0, 10).map((product, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Product",
          "name": product.title,
          "brand": product.brand,
          "image": product.image,
          "offers": {
            "@type": "Offer",
            "price": product.price?.amount,
            "priceCurrency": product.price?.currency || "USD",
            "availability": "https://schema.org/InStock",
            "url": product.url
          },
          "aggregateRating": product.rating ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviewCount || 0
          } : undefined
        }
      }))
    }
  };

  return (
    <>
      <Helmet>
        <title>Commercial Laundromat Equipment Marketplace | Washers, Dryers, Folding Tables & Parts | WashBizHub</title>
        <meta name="description" content="Buy commercial laundromat equipment at wholesale prices. Speed Queen & Maytag washers, coin-op dryers, folding tables, laundry carts, parts & supplies. Amazon Prime delivery available." />
        <meta name="keywords" content="commercial laundromat equipment, coin operated washers, commercial dryers, folding tables laundry, laundry carts, laundromat parts, wholesale laundry equipment" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Commercial Laundromat Equipment Marketplace - WashBizHub" />
        <meta property="og:description" content="Buy commercial washers, dryers, folding tables, carts, parts and supplies for your laundromat at wholesale prices." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://washbizhub.com/equipment" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Commercial Laundromat Equipment Marketplace" />
        <meta name="twitter:description" content="Wholesale laundromat equipment: washers, dryers, folding tables, carts & parts" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Premium Hero Section */}
        <section className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
          <img 
            src={industrialMachines} 
            alt="Premium commercial laundromat equipment - industrial washers and dryers" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/90 via-[#0A1628]/70 to-transparent" />
          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
            <Badge className="w-fit mb-4 bg-[#C8A661] text-[#0A1628] hover:bg-[#C8A661]" data-testid="badge-affiliate">
              <Award className="w-3 h-3 mr-1.5" />
              Amazon Affiliate Partner
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3" data-testid="hero-headline">
              Premium Laundromat Equipment
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-xl mb-6" data-testid="hero-subheadline">
              Commercial-Grade Washers, Dryers & Supplies
            </p>
            <p className="text-gray-300 max-w-lg text-sm md:text-base">
              Shop wholesale prices on Speed Queen, Maytag, and Dexter equipment with Prime delivery
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

          {/* Search & Category Filter */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment by name or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-equipment-search"
                    aria-label="Search equipment"
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <nav aria-label="Equipment categories">
                <div className="flex gap-2 flex-wrap">
                  {EQUIPMENT_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Badge
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        className="cursor-pointer hover-elevate active-elevate-2 gap-1.5 px-3 py-1.5"
                        onClick={() => setSelectedCategory(cat.id)}
                        data-testid={`filter-${cat.id}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </Badge>
                    );
                  })}
                </div>
              </nav>
            </CardContent>
          </Card>

          {/* Results count */}
          {!isLoading && !isInitialLoad && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} products {selectedCategory !== "all" && `in ${category.label}`}
            </p>
          )}

          {/* Equipment Grid */}
          <section aria-label="Product listings">
            {(isLoading || isInitialLoad) ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-48 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory !== "all" 
                    ? "Try selecting a different category or search term" 
                    : "Start by selecting a category above to browse products"}
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.asin} 
                    className="hover-elevate flex flex-col" 
                    data-testid={`product-${product.asin}`}
                    itemScope
                    itemType="https://schema.org/Product"
                  >
                    {/* Product Image */}
                    {product.image && (
                      <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-contain p-4"
                          itemProp="image"
                          loading="lazy"
                        />
                        {product.isPrimeEligible && (
                          <Badge className="absolute top-2 right-2 bg-blue-600">
                            Prime
                          </Badge>
                        )}
                      </div>
                    )}

                    <CardHeader className="flex-1">
                      <div>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground mb-1" itemProp="brand">
                            {product.brand}
                          </p>
                        )}
                        <CardTitle className="text-sm line-clamp-2" itemProp="name">
                          {product.title}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center gap-1" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating!) 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            <meta itemProp="ratingValue" content={product.rating.toString()} />
                            {product.rating} ({product.reviewCount || 0})
                            <meta itemProp="reviewCount" content={(product.reviewCount || 0).toString()} />
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      {product.price && (
                        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                          <p className="text-2xl font-bold text-primary" itemProp="price" content={product.price.amount.toString()}>
                            {product.price.displayAmount}
                          </p>
                          <meta itemProp="priceCurrency" content={product.price.currency} />
                          <link itemProp="availability" href="https://schema.org/InStock" />
                          <link itemProp="url" href={product.url} />
                        </div>
                      )}

                      {/* CTA */}
                      <Button 
                        className="w-full gap-2" 
                        asChild
                        data-testid={`button-view-${product.asin}`}
                      >
                        <a 
                          href={product.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => {
                            fetch('/api/amazon/track-click', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ asin: product.asin })
                            }).catch(() => {});
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          View on Amazon
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* SEO content section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>About Our Commercial Laundromat Equipment</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-3">Premium Equipment for Laundromat Owners</h2>
              <p className="text-muted-foreground mb-4">
                WashBizHub connects laundromat owners with the best commercial laundry equipment from trusted brands like Speed Queen, Maytag, Huebsch, and Electrolux. Whether you're starting a new laundromat or upgrading existing equipment, we offer wholesale pricing through our Amazon affiliate partnership.
              </p>
              
              <h3 className="text-lg font-semibold mb-2 mt-6">Commercial Washers & Dryers</h3>
              <p className="text-muted-foreground mb-4">
                Our marketplace features coin-operated washers and dryers built for high-volume commercial use. All equipment comes with manufacturer warranties and Prime delivery options.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-6">Folding Tables & Laundry Carts</h3>
              <p className="text-muted-foreground mb-4">
                Complete your laundromat setup with heavy-duty folding tables and rolling laundry carts. Essential equipment for customer convenience and efficient operations.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-6">Parts & Repair Supplies</h3>
              <p className="text-muted-foreground mb-4">
                Keep your equipment running with genuine replacement parts, repair kits, and maintenance supplies. Fast shipping through Amazon ensures minimal downtime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
