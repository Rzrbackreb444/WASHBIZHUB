import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartSearch } from "@/components/SmartSearch";
import { 
  Package, ShoppingCart, ExternalLink, Star, Wrench, 
  Filter, X, Check, AlertCircle, Box, Truck
} from "lucide-react";

interface AmazonProduct {
  asin: string;
  title: string;
  brand?: string;
  price?: { amount: number; currency: string; displayAmount: string };
  image?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  isPrimeEligible?: boolean;
  category: string;
  machineType?: string;
}

const PART_CATEGORIES = [
  { id: "all", label: "All Parts", icon: Package },
  { id: "motors", label: "Motors", searches: ["washer motor commercial", "dryer motor commercial replacement"] },
  { id: "belts", label: "Belts & Pulleys", searches: ["washer belt commercial", "dryer belt heavy duty"] },
  { id: "pumps", label: "Pumps & Valves", searches: ["washer drain pump commercial", "water inlet valve commercial"] },
  { id: "heating", label: "Heating Elements", searches: ["dryer heating element commercial", "thermal fuse replacement"] },
  { id: "controls", label: "Controls & Timers", searches: ["washer control board commercial", "dryer timer replacement"] },
  { id: "doors", label: "Doors & Seals", searches: ["washer door seal commercial", "dryer door latch replacement"] },
  { id: "drums", label: "Drums & Rollers", searches: ["dryer drum roller commercial", "washer tub bearing kit"] },
  { id: "coin", label: "Coin Mechanisms", searches: ["commercial coin box laundromat", "coin acceptor timer"] },
  { id: "tools", label: "Tools & Supplies", searches: ["appliance repair tool kit", "multimeter digital commercial"] },
];

const BRANDS = ["All Brands", "Speed Queen", "Maytag", "Huebsch", "Dexter", "Wascomat", "Electrolux", "Whirlpool"];
const MACHINE_TYPES = ["All Machines", "Washer", "Dryer", "Stacker", "Commercial"];
const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under $25", min: undefined, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $250", min: 100, max: 250 },
  { label: "Over $250", min: 250, max: undefined },
];

export default function PartsStore() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [selectedMachineType, setSelectedMachineType] = useState("All Machines");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<AmazonProduct[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const category = PART_CATEGORIES.find(c => c.id === selectedCategory) || PART_CATEGORIES[0];
  const priceRange = PRICE_RANGES[selectedPriceRange];

  // Eager-load featured parts on mount
  useEffect(() => {
    const loadFeaturedParts = async () => {
      const featured: AmazonProduct[] = [];
      
      for (const cat of PART_CATEGORIES.slice(1, 6)) {
        if (!cat.searches) continue;
        
        for (const search of cat.searches.slice(0, 1)) {
          try {
            const response = await fetch(`/api/amazon/search?keywords=${encodeURIComponent(search)}&itemCount=4`);
            if (response.ok) {
              const data = await response.json();
              const products = data.products.map((p: any) => ({
                ...p,
                category: cat.id
              }));
              featured.push(...products);
            }
          } catch (error) {
            console.error('Failed to load featured parts');
          }
        }
      }
      
      setAllProducts(featured);
      setIsInitialLoad(false);
    };

    loadFeaturedParts();
  }, []);

  // Fetch parts for selected category
  const { data: products = [], isLoading } = useQuery<AmazonProduct[]>({
    queryKey: ['/api/parts-search', selectedCategory, selectedBrand, selectedMachineType],
    queryFn: async () => {
      if (selectedCategory === "all") return allProducts;
      if (!category.searches) return [];

      const results: AmazonProduct[] = [];
      
      for (const search of category.searches) {
        let keywords = search;
        
        if (selectedBrand !== "All Brands") {
          keywords += ` ${selectedBrand}`;
        }
        if (selectedMachineType !== "All Machines") {
          keywords += ` ${selectedMachineType}`;
        }

        try {
          const response = await fetch(`/api/amazon/search?keywords=${encodeURIComponent(keywords)}&itemCount=6`);
          if (response.ok) {
            const data = await response.json();
            const products = data.products.map((p: any) => ({
              ...p,
              category: selectedCategory,
              machineType: selectedMachineType !== "All Machines" ? selectedMachineType : undefined
            }));
            results.push(...products);
          }
        } catch (error) {
          console.error('Failed to fetch parts');
        }
      }
      
      return results;
    },
    enabled: selectedCategory !== "all" && !isInitialLoad,
    staleTime: 5 * 60 * 1000,
  });

  const displayProducts = selectedCategory === "all" ? allProducts : products;

  // Apply filters
  const filteredProducts = displayProducts.filter(p => {
    // Price filter
    if (priceRange.min !== undefined && p.price && p.price.amount < priceRange.min) return false;
    if (priceRange.max !== undefined && p.price && p.price.amount > priceRange.max) return false;
    
    // Brand filter (if not "all")
    if (selectedBrand !== "All Brands" && p.brand && !p.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const activeFiltersCount = [
    selectedBrand !== "All Brands",
    selectedMachineType !== "All Machines",
    selectedPriceRange !== 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedBrand("All Brands");
    setSelectedMachineType("All Machines");
    setSelectedPriceRange(0);
  };

  return (
    <>
      <Helmet>
        <title>Commercial Laundromat Parts Store | Motors, Belts, Pumps, Controls & More | WashBizHub</title>
        <meta name="description" content="Buy commercial laundromat replacement parts: motors, belts, pumps, heating elements, controls, coin mechanisms. Fast Amazon Prime delivery with expert support." />
        <meta name="keywords" content="commercial laundromat parts, washer parts, dryer parts, coin mechanism, control board, heating element, motor replacement, pump valve" />
        
        <meta property="og:title" content="Commercial Laundromat Parts Store - WashBizHub" />
        <meta property="og:description" content="Complete parts catalog for commercial laundromats. Motors, belts, pumps, controls, and more with fast delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://washbizhub.com/parts" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Commercial Laundromat Parts Store" />
        <meta name="twitter:description" content="Complete parts catalog with fast Amazon Prime delivery" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">Commercial Parts Store</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Complete catalog of commercial laundromat replacement parts - Motors, Belts, Pumps, Controls & More
            </p>
          </header>

          {/* Smart Search */}
          <SmartSearch 
            placeholder="Search for parts, diagnostic codes, or repairs..."
            className="max-w-2xl"
          />

          {/* Filters Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                  data-testid="button-toggle-filters"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </Button>
                )}

                <div className="flex-1" />

                {!isLoading && !isInitialLoad && (
                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} parts found
                  </p>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand</label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger data-testid="select-brand">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANDS.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Machine Type</label>
                    <Select value={selectedMachineType} onValueChange={setSelectedMachineType}>
                      <SelectTrigger data-testid="select-machine-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MACHINE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <Select value={selectedPriceRange.toString()} onValueChange={(v) => setSelectedPriceRange(parseInt(v))}>
                      <SelectTrigger data-testid="select-price-range">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_RANGES.map((range, index) => (
                          <SelectItem key={index} value={index.toString()}>{range.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Tabs */}
          <nav aria-label="Part categories">
            <div className="flex gap-2 flex-wrap">
              {PART_CATEGORIES.map((cat) => {
                const Icon = cat.icon || Box;
                return (
                  <Badge
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    className="cursor-pointer hover-elevate active-elevate-2 gap-1.5 px-3 py-2"
                    onClick={() => setSelectedCategory(cat.id)}
                    data-testid={`category-${cat.id}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </Badge>
                );
              })}
            </div>
          </nav>

          {/* Parts Grid */}
          <section aria-label="Parts catalog">
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
                <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No parts found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search for different keywords
                </p>
                {activeFiltersCount > 0 && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.asin} 
                    className="hover-elevate flex flex-col"
                    data-testid={`part-${product.asin}`}
                  >
                    {product.image && (
                      <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-contain p-4"
                          loading="lazy"
                        />
                        {product.isPrimeEligible && (
                          <Badge className="absolute top-2 right-2 bg-blue-600 gap-1">
                            <Truck className="w-3 h-3" />
                            Prime
                          </Badge>
                        )}
                      </div>
                    )}

                    <CardHeader className="flex-1">
                      <div>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground mb-1 font-medium">
                            {product.brand}
                          </p>
                        )}
                        <CardTitle className="text-sm line-clamp-2">
                          {product.title}
                        </CardTitle>
                        {product.category && (
                          <Badge variant="outline" className="text-xs mt-2">
                            {PART_CATEGORIES.find(c => c.id === product.category)?.label || product.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {product.rating && (
                        <div className="flex items-center gap-1">
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
                            {product.rating} ({product.reviewCount || 0})
                          </span>
                        </div>
                      )}

                      {product.price && (
                        <p className="text-2xl font-bold text-primary">
                          {product.price.displayAmount}
                        </p>
                      )}

                      <Button 
                        className="w-full gap-2" 
                        asChild
                        data-testid={`button-order-${product.asin}`}
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
                          Order Now
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* SEO Content */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>About Our Commercial Laundromat Parts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-3">Genuine OEM & Aftermarket Parts</h2>
              <p className="text-muted-foreground mb-4">
                WashBizHub connects laundromat owners with genuine OEM and high-quality aftermarket parts for all major commercial laundry brands including Speed Queen, Maytag, Huebsch, Dexter, Wascomat, and Electrolux. Every part is backed by our Amazon affiliate partnership for fast, reliable delivery.
              </p>
              
              <h3 className="text-lg font-semibold mb-2 mt-6">Complete Parts Catalog</h3>
              <p className="text-muted-foreground mb-4">
                From motors and belts to control boards and coin mechanisms, we offer a comprehensive selection of replacement parts for washers, dryers, and stacked units. All parts come with detailed compatibility information and installation guides.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-6">Fast Delivery with Amazon Prime</h3>
              <p className="text-muted-foreground mb-4">
                Most parts qualify for Amazon Prime 2-day shipping, minimizing downtime and keeping your laundromat running smoothly. Track your orders in real-time and get them delivered directly to your location.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-6">Expert Support & AI Diagnostics</h3>
              <p className="text-muted-foreground mb-4">
                Not sure which part you need? Use our AI-powered diagnostic tool to identify the right parts based on error codes and symptoms. Get step-by-step repair instructions and compatibility verification before you order.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
