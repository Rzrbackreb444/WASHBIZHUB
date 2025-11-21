import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingCart, Star, Package, ExternalLink, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  availability?: string;
}

interface PartsOrderWidgetProps {
  defaultSearch?: string;
  category?: 'washer' | 'dryer' | 'commercial' | 'maintenance';
  compact?: boolean;
}

export function PartsOrderWidget({ defaultSearch, category, compact = false }: PartsOrderWidgetProps) {
  const [searchQuery, setSearchQuery] = useState(defaultSearch || '');
  const [activeCategory, setActiveCategory] = useState(category || 'washer');
  const { toast } = useToast();

  const { data: products, isLoading, refetch } = useQuery<AmazonProduct[]>({
    queryKey: ['/api/amazon/search', searchQuery, activeCategory],
    enabled: !!searchQuery,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    refetch();
  };

  const handleQuickSearch = (partType: string) => {
    const queries: Record<string, Record<string, string>> = {
      washer: {
        motor: 'commercial washer motor replacement',
        belt: 'washing machine drive belt heavy duty',
        pump: 'washer drain pump commercial',
        valve: 'washing machine inlet valve',
      },
      dryer: {
        motor: 'commercial dryer motor replacement',
        belt: 'dryer belt heavy duty commercial',
        heating: 'dryer heating element commercial',
        roller: 'dryer drum roller heavy duty',
      },
      commercial: {
        coins: 'commercial coin box laundromat',
        payment: 'card reader laundromat payment',
        supplies: 'laundry detergent commercial bulk',
        carts: 'commercial laundry cart rolling',
      },
      maintenance: {
        tools: 'appliance repair tool kit professional',
        cleaning: 'washing machine cleaner commercial',
        lubricant: 'appliance grease high temp',
      },
    };

    const query = queries[activeCategory]?.[partType];
    if (query) {
      handleSearch(query);
    }
  };

  const handleOrderNow = (product: AmazonProduct) => {
    // Track affiliate click
    fetch('/api/amazon/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin: product.asin, source: 'parts-widget' }),
    });

    // Open Amazon in new tab
    window.open(product.url, '_blank');
    
    toast({
      title: "Redirecting to Amazon",
      description: `Opening ${product.title.slice(0, 50)}...`,
    });
  };

  if (compact) {
    return (
      <Card className="hover-elevate">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Quick Parts Order</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              1-Click
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && refetch()}
              data-testid="input-parts-search"
            />
            <Button onClick={() => refetch()} size="icon" data-testid="button-search-parts">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {products && products.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {products.slice(0, 3).map((product) => (
                <div key={product.asin} className="flex items-center gap-3 p-2 rounded-md hover-elevate border">
                  {product.image && (
                    <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground">{product.price?.displayAmount}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOrderNow(product)}
                    data-testid={`button-order-${product.asin}`}
                  >
                    Order
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Amazon Parts Ordering
            </CardTitle>
            <CardDescription>One-click parts ordering from your nicholaskreme-20 storefront</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Zap className="h-4 w-4" />
            Instant Delivery
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for parts, equipment, or supplies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && refetch()}
            data-testid="input-parts-search-full"
          />
          <Button onClick={() => refetch()} data-testid="button-search-parts-full">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="washer" data-testid="tab-washer">Washer</TabsTrigger>
            <TabsTrigger value="dryer" data-testid="tab-dryer">Dryer</TabsTrigger>
            <TabsTrigger value="commercial" data-testid="tab-commercial">Commercial</TabsTrigger>
            <TabsTrigger value="maintenance" data-testid="tab-maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="washer" className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('motor')}>Motors</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('belt')}>Belts</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('pump')}>Pumps</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('valve')}>Valves</Button>
            </div>
          </TabsContent>

          <TabsContent value="dryer" className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('motor')}>Motors</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('belt')}>Belts</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('heating')}>Heating</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('roller')}>Rollers</Button>
            </div>
          </TabsContent>

          <TabsContent value="commercial" className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('coins')}>Coin Systems</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('payment')}>Card Readers</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('supplies')}>Supplies</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('carts')}>Carts</Button>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('tools')}>Tool Kits</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('cleaning')}>Cleaners</Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSearch('lubricant')}>Lubricants</Button>
            </div>
          </TabsContent>
        </Tabs>

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            Searching Amazon catalog...
          </div>
        )}

        {products && products.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.asin} className="hover-elevate overflow-hidden">
                {product.image && (
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.title}</h3>
                  
                  {product.brand && (
                    <p className="text-xs text-muted-foreground mb-2">by {product.brand}</p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {product.reviewCount && (
                      <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                    )}
                    {product.isPrimeEligible && (
                      <Badge variant="secondary" className="text-xs">Prime</Badge>
                    )}
                  </div>

                  {product.price && (
                    <p className="text-lg font-bold text-primary mb-3">{product.price.displayAmount}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleOrderNow(product)}
                      data-testid={`button-order-${product.asin}`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Order Now
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(product.url, '_blank')}
                      data-testid={`button-view-${product.asin}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  {product.availability && (
                    <p className="text-xs text-muted-foreground mt-2">{product.availability}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products && products.length === 0 && !isLoading && searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2" />
            No products found. Try a different search term.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
