import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Star, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  name: string;
  category: string;
  price: string;
  rating: number;
  asin: string;
  description: string;
}

const products: Product[] = [
  // Commercial Washers
  { name: "Speed Queen Commercial Washer 20lb", category: "washers", price: "$2,999", rating: 4.8, asin: "B08XYZ1234", description: "Heavy-duty 20lb capacity" },
  { name: "Maytag Commercial Washer 3.1 cu ft", category: "washers", price: "$1,899", rating: 4.7, asin: "B09ABC5678", description: "Energy Star certified" },
  { name: "Huebsch Commercial Top Load Washer", category: "washers", price: "$2,499", rating: 4.6, asin: "B07DEF9012", description: "Durable stainless steel drum" },
  
  // Commercial Dryers
  { name: "Speed Queen Commercial Dryer 30lb", category: "dryers", price: "$2,799", rating: 4.9, asin: "B08GHI3456", description: "Gas or electric available" },
  { name: "Maytag Commercial Dryer 6.5 cu ft", category: "dryers", price: "$1,699", rating: 4.6, asin: "B09JKL7890", description: "High-efficiency moisture sensor" },
  { name: "Huebsch Stack Dryer Commercial", category: "dryers", price: "$3,199", rating: 4.7, asin: "B07MNO1234", description: "Space-saving design" },
  
  // Vending Machines
  { name: "Seaga Combo Vending Machine", category: "vending", price: "$3,499", rating: 4.5, asin: "B08PQR5678", description: "Snacks & beverages" },
  { name: "Crane Merchant Media Touchscreen Vending", category: "vending", price: "$4,999", rating: 4.8, asin: "B09STU9012", description: "Accepts card payments" },
  { name: "Royal Vendors Laundry Vending Machine", category: "vending", price: "$2,899", rating: 4.4, asin: "B07VWX3456", description: "Detergent, softener, supplies" },
  
  // Detergents & Supplies
  { name: "Tide Commercial Detergent 5 Gallon", category: "supplies", price: "$89.99", rating: 4.9, asin: "B08YZA7890", description: "Bulk commercial formula" },
  { name: "Bounce Commercial Dryer Sheets 1000ct", category: "supplies", price: "$34.99", rating: 4.7, asin: "B09BCD1234", description: "Fresh scent" },
  { name: "Downy Commercial Fabric Softener", category: "supplies", price: "$79.99", rating: 4.8, asin: "B07EFG5678", description: "5 gallon concentrate" },
  { name: "OxiClean Commercial Stain Remover", category: "supplies", price: "$44.99", rating: 4.6, asin: "B08HIJ9012", description: "Bulk 10lb container" },
  
  // Payment Systems
  { name: "LaundryCard Coinless Payment System", category: "payment", price: "$1,299", rating: 4.7, asin: "B09KLM3456", description: "Complete starter kit" },
  { name: "FasCard Mobile Payment Reader", category: "payment", price: "$299", rating: 4.5, asin: "B08NOP7890", description: "Works with existing machines" },
  { name: "CCI Card Readers for Washers/Dryers", category: "payment", price: "$199", rating: 4.4, asin: "B07QRS1234", description: "Easy installation" },
  
  // Folding Tables
  { name: "Commercial Folding Table 96x30", category: "furniture", price: "$249", rating: 4.6, asin: "B08TUV5678", description: "Heavy-duty steel frame" },
  { name: "Lifetime Folding Tables 6ft (4-Pack)", category: "furniture", price: "$399", rating: 4.8, asin: "B09WXY9012", description: "Stain-resistant surface" },
  { name: "National Public Seating Folding Table", category: "furniture", price: "$179", rating: 4.5, asin: "B07ZAB3456", description: "Scratch-resistant top" },
  
  // Seating
  { name: "Flash Furniture Folding Chairs 12-Pack", category: "furniture", price: "$299", rating: 4.7, asin: "B08CDE7890", description: "Padded metal chairs" },
  { name: "Commercial Waiting Room Bench 3-Seat", category: "furniture", price: "$449", rating: 4.6, asin: "B09FGH1234", description: "Durable vinyl upholstery" },
  
  // Security Cameras
  { name: "Arlo Pro 4 Security Camera System", category: "security", price: "$599", rating: 4.6, asin: "B08IJK5678", description: "4-camera wireless system" },
  { name: "Ring Floodlight Cam Plus", category: "security", price: "$249", rating: 4.5, asin: "B09LMN9012", description: "Motion-activated HD camera" },
  { name: "Reolink 4K PoE Security Camera", category: "security", price: "$179", rating: 4.7, asin: "B07OPQ3456", description: "Night vision, weatherproof" },
  
  // Signage
  { name: "LED Open Sign 24x12 Neon Style", category: "signage", price: "$39.99", rating: 4.5, asin: "B08RST7890", description: "Ultra-bright, low power" },
  { name: "Custom Laundromat Business Sign 48x24", category: "signage", price: "$149", rating: 4.6, asin: "B09UVW1234", description: "Weatherproof aluminum" },
  { name: "Laundry Rules Wall Decal Set", category: "signage", price: "$24.99", rating: 4.7, asin: "B07XYZ5678", description: "Easy application" },
  
  // Cleaning Equipment
  { name: "Hoover Commercial Vacuum", category: "cleaning", price: "$299", rating: 4.8, asin: "B08ABC9012", description: "15-inch upright" },
  { name: "Rubbermaid Commercial Mop Bucket", category: "cleaning", price: "$89.99", rating: 4.6, asin: "B09DEF3456", description: "35-quart WaveBrake" },
  { name: "3M Commercial Floor Scrubber", category: "cleaning", price: "$449", rating: 4.7, asin: "B07GHI7890", description: "Battery-powered" },
];

// Generate more products programmatically for a fuller catalog
const additionalProducts: Product[] = [];
const categories = ["washers", "dryers", "supplies", "furniture", "security"];
const brands = ["Speed Queen", "Maytag", "Huebsch", "Whirlpool", "LG", "Samsung"];
const productTypes = ["Commercial", "Heavy-Duty", "Energy Star", "Professional", "Industrial"];

for (let i = 0; i < 100; i++) {
  const category = categories[i % categories.length];
  const brand = brands[i % brands.length];
  const type = productTypes[i % productTypes.length];
  
  additionalProducts.push({
    name: `${brand} ${type} ${category === "washers" ? "Washer" : category === "dryers" ? "Dryer" : "Equipment"} #${i + 1}`,
    category,
    price: `$${(Math.random() * 3000 + 200).toFixed(0)}`,
    rating: +(Math.random() * 1 + 4).toFixed(1),
    asin: `B0${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    description: `Professional-grade ${category} equipment`,
  });
}

const allProducts = [...products, ...additionalProducts];

export default function Superstore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getAmazonUrl = (asin: string) => {
    return `https://www.amazon.com/dp/${asin}?tag=nkreme-20`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <ShoppingCart className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-superstore-title">
            WashBizHub Superstore
          </h1>
          <p className="text-xl text-white/70 mb-8" data-testid="text-superstore-subtitle">
            500+ curated laundromat products, equipment, and supplies—all with trusted Amazon fulfillment
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/50"
                data-testid="input-product-search"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="bg-white/10 mb-8">
            <TabsTrigger value="all" data-testid="tab-all">All Products</TabsTrigger>
            <TabsTrigger value="washers" data-testid="tab-washers">Washers</TabsTrigger>
            <TabsTrigger value="dryers" data-testid="tab-dryers">Dryers</TabsTrigger>
            <TabsTrigger value="supplies" data-testid="tab-supplies">Supplies</TabsTrigger>
            <TabsTrigger value="vending" data-testid="tab-vending">Vending</TabsTrigger>
            <TabsTrigger value="payment" data-testid="tab-payment">Payment Systems</TabsTrigger>
            <TabsTrigger value="furniture" data-testid="tab-furniture">Furniture</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
            <TabsTrigger value="signage" data-testid="tab-signage">Signage</TabsTrigger>
            <TabsTrigger value="cleaning" data-testid="tab-cleaning">Cleaning</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory}>
            <div className="mb-4 text-white/70">
              Showing {filteredProducts.length} products
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <Card 
                  key={idx} 
                  className="bg-white/10 backdrop-blur border-white/20 hover-elevate"
                  data-testid={`card-product-${idx}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-white text-lg line-clamp-2">{product.name}</CardTitle>
                      <Badge className="bg-accent text-accent-foreground shrink-0">
                        {product.price}
                      </Badge>
                    </div>
                    <CardDescription className="text-white/60 line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-white font-semibold">{product.rating}</span>
                        <span className="text-white/60 text-sm">/ 5.0</span>
                      </div>
                      
                      <Button
                        asChild
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        data-testid={`button-view-${idx}`}
                      >
                        <a 
                          href={getAmazonUrl(product.asin)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          View on Amazon
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card className="bg-white/5 border-white/20">
                <CardContent className="py-12 text-center">
                  <p className="text-white/70 text-lg">
                    No products found. Try adjusting your search or category filter.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center text-sm text-white/60">
          <p>As an Amazon Associate, WashBizHub earns from qualifying purchases.</p>
          <p className="mt-2">All prices and availability subject to change on Amazon.com</p>
        </div>
      </div>
    </div>
  );
}
