import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShoppingCart, Package, Zap, DollarSign, TrendingUp } from 'lucide-react';
import { SEO } from '@/components/SEO';

const PARTS_CATEGORIES = [
  {
    id: 'washers',
    name: 'Washers & Extraction',
    icon: '🌊',
    products: [
      { id: 1, name: 'Commercial Front-Load Washer (40lb)', price: 3499, asin: 'B0123456789', vendor: 'Speed Queen', image: 'https://via.placeholder.com/200?text=Washer' },
      { id: 2, name: 'Heavy-Duty Top-Load (50lb)', price: 2899, asin: 'B0123456790', vendor: 'Dexter', image: 'https://via.placeholder.com/200?text=TopLoad' },
    ],
  },
  {
    id: 'dryers',
    name: 'Dryers & Tumblers',
    icon: '🔥',
    products: [
      { id: 3, name: 'Commercial Gas Dryer (75lb)', price: 2299, asin: 'B0123456791', vendor: 'Speed Queen', image: 'https://via.placeholder.com/200?text=Dryer' },
      { id: 4, name: 'Electric Dryer (60lb)', price: 1899, asin: 'B0123456792', vendor: 'Huebsch', image: 'https://via.placeholder.com/200?text=Electric' },
    ],
  },
  {
    id: 'carts',
    name: 'Carts & Baskets',
    icon: '🛒',
    products: [
      { id: 5, name: 'Heavy-Duty Laundry Cart (stainless)', price: 149, asin: 'B0123456793', vendor: 'Rubbermaid', image: 'https://via.placeholder.com/200?text=Cart' },
      { id: 6, name: 'Industrial Rolling Basket', price: 89, asin: 'B0123456794', vendor: 'Wesco', image: 'https://via.placeholder.com/200?text=Basket' },
    ],
  },
  {
    id: 'tables',
    name: 'Folding Tables & Seating',
    icon: '🪑',
    products: [
      { id: 7, name: 'Commercial Folding Table (6ft)', price: 199, asin: 'B0123456795', vendor: 'Lifetime', image: 'https://via.placeholder.com/200?text=Table' },
      { id: 8, name: 'Heavy-Duty Fold-Up Bench', price: 129, asin: 'B0123456796', vendor: 'Cosco', image: 'https://via.placeholder.com/200?text=Bench' },
    ],
  },
  {
    id: 'dog-wash',
    name: 'Dog Wash Stations',
    icon: '🐕',
    products: [
      { id: 9, name: 'Self-Service Dog Wash (complete system)', price: 4499, asin: 'B0123456797', vendor: 'Happy Tails', image: 'https://via.placeholder.com/200?text=DogWash' },
      { id: 10, name: 'Elevated Pet Grooming Tub', price: 599, asin: 'B0123456798', vendor: 'Pro-Groom', image: 'https://via.placeholder.com/200?text=Tub' },
    ],
  },
  {
    id: 'soap',
    name: 'Soap & Supply Machines',
    icon: '🧼',
    products: [
      { id: 11, name: 'Detergent Vending Machine', price: 799, asin: 'B0123456799', vendor: 'eClean', image: 'https://via.placeholder.com/200?text=Soap' },
      { id: 12, name: 'Fabric Softener Dispenser', price: 349, asin: 'B0123456800', vendor: 'Smart Vend', image: 'https://via.placeholder.com/200?text=Dispenser' },
    ],
  },
  {
    id: 'coin-changers',
    name: 'Coin & Bill Changers',
    icon: '💰',
    products: [
      { id: 13, name: 'Bill Changer ($1-$100)', price: 1299, asin: 'B0123456801', vendor: 'Mars Inc', image: 'https://via.placeholder.com/200?text=BillChanger' },
      { id: 14, name: 'Coin Acceptor (multi-coin)', price: 299, asin: 'B0123456802', vendor: 'JCM', image: 'https://via.placeholder.com/200?text=CoinAcceptor' },
    ],
  },
];

export default function PartsCatalogue() {
  const [selectedCategory, setSelectedCategory] = useState('washers');
  const [searchQuery, setSearchQuery] = useState('');

  const category = PARTS_CATEGORIES.find(c => c.id === selectedCategory);
  const filteredProducts = category?.products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAmazonOrder = (product: any) => {
    // In production: redirect to Amazon affiliate link with nicholaskreme-20 tag
    const affiliateUrl = `https://amazon.com/s?k=${encodeURIComponent(product.name)}&tag=nicholaskreme-20`;
    window.open(affiliateUrl, '_blank');
  };

  return (
    <>
      <SEO
        title="Laundromat Parts & Equipment Catalogue | Washers, Dryers, Carts & More"
        description="Complete parts catalogue with instant Amazon ordering. Washers, dryers, carts, tables, dog wash stations, soap machines, and coin changers."
        canonicalUrl="/parts-catalogue"
        keywords={['laundromat parts', 'commercial washers', 'laundry equipment', 'maintenance supplies', 'coin changers']}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background text-foreground py-12 border-b">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Parts Catalogue</h1>
            </div>
            <p className="text-muted-foreground">Complete inventory of equipment, supplies, and accessories for laundromats</p>
            <Badge className="mt-4 bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Amazon Affiliate Integrated • Free Shipping on Bulk Orders
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="bg-muted/30 border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search parts by name or vendor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-parts"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
              {PARTS_CATEGORIES.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs" data-testid={`tab-category-${cat.id}`}>
                  <span className="mr-1">{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {PARTS_CATEGORIES.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{cat.icon} {cat.name}</h2>
                  <p className="text-muted-foreground">
                    {filteredProducts.length === 0 ? 'No products match your search.' : `${filteredProducts.length} products available`}
                  </p>
                </div>

                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No products found. Try a different search.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                      <Card key={product.id} className="hover-elevate flex flex-col" data-testid={`card-product-${product.id}`}>
                        <div
                          className="h-40 bg-cover bg-center"
                          style={{ backgroundImage: `url(${product.image})` }}
                        />
                        <CardHeader className="flex-1">
                          <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
                          <CardDescription>{product.vendor}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">${product.price.toLocaleString()}</span>
                            <Badge variant="outline">ASIN: {product.asin.slice(-6)}</Badge>
                          </div>
                          <Button
                            onClick={() => handleAmazonOrder(product)}
                            className="w-full hover-elevate active-elevate-2"
                            data-testid={`button-amazon-order-${product.id}`}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Order on Amazon
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Info */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-t">
          <h2 className="text-2xl font-bold mb-6">Why Our Catalogue?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <DollarSign className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">Affiliate Pricing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                All products through Amazon with nicholaskreme-20 affiliate tag. You earn commissions on every purchase.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">Verified Vendors</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Curated selection of trusted manufacturers and suppliers with proven track records in the laundromat industry.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">One-Click Ordering</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Seamless integration with Amazon ordering. Bulk discounts available through Amazon Business.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
