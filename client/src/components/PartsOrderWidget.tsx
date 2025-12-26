import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, ShoppingCart, Package, ExternalLink, Zap, Wrench, Store, Truck } from "lucide-react";
import { Star } from "@/lib/icon-registry";
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
  parts?: string[];
}

function extractPartNumber(partStr: string): { name: string; partNumber: string | null } {
  const match = partStr.match(/\(([A-Z0-9\-]+P?)\)/i) || partStr.match(/([A-Z]{1,4}[\-]?\d{3,}P?)/i);
  return {
    name: partStr.replace(/\([^)]+\)/g, '').trim(),
    partNumber: match ? match[1] : null
  };
}

const SUPPLIERS = [
  {
    id: 'pwslaundry',
    name: 'PWS Laundry',
    searchUrl: (part: string) => `https://www.pwslaundry.com/search?q=${encodeURIComponent(part)}`,
    color: 'bg-[#0A1628] hover:bg-[#0A1628]/90',
    icon: Package,
    priority: true,
    description: '#1 Commercial Laundry Parts'
  },
  {
    id: 'aadvantage',
    name: 'AAdvantage',
    searchUrl: (part: string) => `https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry`,
    color: 'bg-[#C8A661] hover:bg-[#C8A661]/90 text-[#0A1628]',
    icon: Star,
    priority: true,
    description: 'Authorized Dexter Dealer - All Major Brands'
  },
  {
    id: 'marcone',
    name: 'Marcone',
    searchUrl: (part: string) => `https://www.marcone.com/search/${encodeURIComponent(part)}`,
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: Wrench,
    priority: false,
    description: 'Appliance Parts Distributor'
  },
  {
    id: 'alliance',
    name: 'Alliance OEM',
    searchUrl: (part: string) => `https://parts.alliancelaundry.com/search/?searchText=${encodeURIComponent(part)}`,
    color: 'bg-red-600 hover:bg-red-700',
    icon: Package,
    priority: false,
    description: 'Speed Queen/UniMac OEM Parts'
  },
  {
    id: 'repairclinic',
    name: 'RepairClinic',
    searchUrl: (part: string) => `https://www.repairclinic.com/Shop-For-Parts?q=${encodeURIComponent(part)}`,
    color: 'bg-orange-600 hover:bg-orange-700',
    icon: Wrench,
    priority: false,
    description: 'DIY Repair Parts'
  },
  {
    id: 'partstown',
    name: 'Parts Town',
    searchUrl: (part: string) => `https://www.partstown.com/search?searchstr=${encodeURIComponent(part)}`,
    color: 'bg-emerald-600 hover:bg-emerald-700',
    icon: Store,
    priority: false,
    description: 'Restaurant & Commercial Equipment'
  }
];

export function PartsOrderWidget({ defaultSearch, category, compact = false, parts = [] }: PartsOrderWidgetProps) {
  const [searchQuery, setSearchQuery] = useState(defaultSearch || '');
  const [activeCategory, setActiveCategory] = useState(category || 'washer');
  const { toast } = useToast();

  const { data: products, isLoading, refetch } = useQuery<AmazonProduct[]>({
    queryKey: ['/api/amazon/search', searchQuery, activeCategory],
    enabled: !!searchQuery,
  });

  const partsWithNumbers = parts
    .map(part => ({ original: part, ...extractPartNumber(part) }))
    .filter(part => part.partNumber !== null);

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
    fetch('/api/amazon/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin: product.asin, source: 'parts-widget' }),
    });

    window.open(product.url, '_blank');
    
    toast({
      title: "Redirecting to Amazon",
      description: `Opening ${product.title.slice(0, 50)}...`,
    });
  };

  const handleSupplierClick = (supplier: typeof SUPPLIERS[0], partNumber: string, partName: string) => {
    const url = supplier.searchUrl(partNumber);
    window.open(url, '_blank', 'noopener,noreferrer');
    
    toast({
      title: `Opening ${supplier.name}`,
      description: `Searching for ${partNumber}...`,
    });
  };

  const handleAmazonPartClick = (partNumber: string) => {
    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(partNumber)}&tag=nicholaskreme-20`;
    window.open(amazonUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Opening Amazon",
      description: `Searching for ${partNumber}...`,
    });
  };

  const sortedSuppliers = [...SUPPLIERS].sort((a, b) => {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return 0;
  });

  const QuickOrderSection = () => {
    if (partsWithNumbers.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#C8A661]" />
          <h3 className="font-semibold text-foreground">Quick Order by Part Number</h3>
          <Badge variant="outline" className="text-xs">Commercial Suppliers</Badge>
        </div>
        
        <div className="space-y-3">
          {partsWithNumbers.map((part, index) => (
            <div 
              key={`${part.partNumber}-${index}`} 
              className="p-4 rounded-lg border bg-muted/30"
              data-testid={`part-row-${part.partNumber}`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Part:</span>
                  <Badge variant="secondary" className="font-medium">
                    {part.name || part.original}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs bg-[#0A1628] text-white border-[#0A1628]">
                    {part.partNumber}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {sortedSuppliers.map((supplier) => {
                    const IconComponent = supplier.icon;
                    return (
                      <a
                        key={supplier.id}
                        href={supplier.searchUrl(part.partNumber!)}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        title={supplier.description}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSupplierClick(supplier, part.partNumber!, part.name);
                        }}
                        data-testid={`button-order-${supplier.id}-${part.partNumber}`}
                      >
                        <Button
                          size="sm"
                          className={`${supplier.color} ${!supplier.color.includes('text-') ? 'text-white' : ''}`}
                        >
                          <IconComponent className="h-3 w-3 mr-1.5" />
                          {supplier.name}
                          {supplier.priority && <Star className="h-3 w-3 ml-1 fill-current" />}
                        </Button>
                      </a>
                    );
                  })}
                  
                  <a
                    href={`https://www.amazon.com/s?k=${encodeURIComponent(part.partNumber!)}&tag=nicholaskreme-20`}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    title="Search Amazon (limited commercial parts availability)"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAmazonPartClick(part.partNumber!);
                    }}
                    data-testid={`button-order-amazon-${part.partNumber}`}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                    >
                      <ShoppingCart className="h-3 w-3 mr-1.5" />
                      Amazon
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SupplierDirectory = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-[#C8A661]" />
        <h3 className="font-semibold text-foreground">Commercial Laundry Parts Suppliers</h3>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2">
        <a
          href="https://www.pwslaundry.com/parts"
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="p-4 rounded-lg border bg-gradient-to-r from-[#0A1628] to-[#0A1628]/90 text-white hover-elevate"
          data-testid="link-pws"
        >
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-[#C8A661]" />
            <div className="flex-1">
              <p className="font-semibold">PWS Laundry</p>
              <p className="text-sm text-gray-300">#1 Commercial Laundry Parts Distributor</p>
            </div>
            <ExternalLink className="h-4 w-4 text-[#C8A661]" />
          </div>
        </a>
        
        <a
          href="https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry"
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="p-4 rounded-lg border bg-gradient-to-r from-[#C8A661] to-[#C8A661]/90 text-[#0A1628] hover-elevate"
          data-testid="link-aadvantage"
        >
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8" />
            <div className="flex-1">
              <p className="font-semibold">AAdvantage Laundry</p>
              <p className="text-sm text-[#0A1628]/70">Authorized Dexter Dealer - All Major Brands</p>
            </div>
            <ExternalLink className="h-4 w-4" />
          </div>
        </a>

        <a
          href="https://parts.alliancelaundry.com"
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="p-4 rounded-lg border bg-muted/30 hover-elevate"
          data-testid="link-alliance"
        >
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Alliance Laundry</p>
              <p className="text-sm text-muted-foreground">Speed Queen & UniMac OEM Parts</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </a>

        <a
          href="https://www.marcone.com/laundry-parts"
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="p-4 rounded-lg border bg-muted/30 hover-elevate"
          data-testid="link-marcone"
        >
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Marcone</p>
              <p className="text-sm text-muted-foreground">Major Appliance Parts Distributor</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </a>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Most commercial laundry parts are NOT available on Amazon. Use authorized dealers above for genuine OEM parts.
      </p>
    </div>
  );

  if (compact) {
    return (
      <Card className="hover-elevate">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
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
        <CardContent className="space-y-4">
          {partsWithNumbers.length > 0 && (
            <>
              <QuickOrderSection />
              <Separator />
            </>
          )}
          
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
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Parts Ordering
            </CardTitle>
            <CardDescription>One-click parts ordering from multiple suppliers</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Zap className="h-4 w-4" />
            Instant Delivery
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {partsWithNumbers.length > 0 && (
          <>
            <QuickOrderSection />
            <Separator />
          </>
        )}

        <SupplierDirectory />

        <Separator />

        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Search Amazon (Limited Availability)
          </h3>
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

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
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
