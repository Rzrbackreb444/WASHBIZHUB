import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Star, Mail, ExternalLink, Droplets, Dog, Sparkles, WashingMachine, Refrigerator, Wrench, MapPin, Building2, Zap, Search, Plus, Store, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import heroImage from "@assets/AdobeStock_711286802_1765733834364.jpeg";
import { Link } from "wouter";

const CONSULT_EMAIL = "consult@washbizhub.com";
const AADVANTAGE_LINK = "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry";
const AMAZON_TAG = "nicholaskreme-20";

const equipmentShowcase = [
  {
    id: "washer-continental",
    name: "Continental Girbau Commercial Washer",
    brand: "Continental Girbau",
    category: "Washers",
    description: "High-efficiency 60lb commercial washer with programmable controls. Industry-leading water extraction and energy savings.",
    priceRange: "$8,000 - $15,000",
    features: ["Programmable Controls", "High G-Force Extract", "Stainless Steel Drum", "5-Year Warranty"],
    image: "washer"
  },
  {
    id: "dryer-dexter",
    name: "Dexter Stack Dryer T-50x2",
    brand: "Dexter",
    category: "Dryers",
    description: "Double-stack commercial dryer maximizing floor space. Coin/card ready with reversing drum technology.",
    priceRange: "$6,500 - $12,000",
    features: ["Space Efficient", "Reversing Drum", "Coin/Card Ready", "Micro Display Controls"],
    image: "dryer"
  },
  {
    id: "washer-speed-queen",
    name: "Speed Queen Hardmount Washer",
    brand: "Speed Queen",
    category: "Washers",
    description: "Built for the toughest commercial environments. Legendary durability with quantum controls.",
    priceRange: "$7,500 - $14,000",
    features: ["Quantum Controls", "Out-of-Balance Switch", "Heavy-Duty Bearings", "Made in USA"],
    image: "washer"
  },
  {
    id: "changer-hamilton",
    name: "Hamilton Bill Changer",
    brand: "Hamilton",
    category: "Payment Systems",
    description: "High-capacity bill changer accepting $1-$20 bills. Dispenses quarters with anti-theft features.",
    priceRange: "$2,500 - $4,500",
    features: ["Anti-Theft Cabinet", "High Capacity", "Multi-Bill Accept", "Adjustable Hopper"],
    image: "changer"
  },
];

const partsShowcase = [
  {
    id: "part-bearing",
    name: "Commercial Washer Bearing Kit",
    brand: "OEM Parts",
    category: "Parts",
    description: "Heavy-duty bearing replacement kit for commercial washers. Includes seals and installation hardware.",
    priceRange: "$150 - $400",
    features: ["OEM Quality", "Complete Kit", "All Major Brands"],
    image: "part"
  },
  {
    id: "part-motor",
    name: "Drive Motor Assembly",
    brand: "OEM Parts", 
    category: "Parts",
    description: "Replacement drive motors for commercial washers and dryers. Multiple HP options available.",
    priceRange: "$300 - $800",
    features: ["Direct Replacement", "Warranty Included", "Fast Shipping"],
    image: "part"
  },
];

const aadvantageProducts = [
  {
    id: "aa-washer-1",
    name: "Continental Girbau E-Series Washer",
    category: "Commercial Washers",
    description: "Energy-efficient commercial washer with advanced controls. Perfect for new installations or upgrades.",
    highlight: "Best Seller"
  },
  {
    id: "aa-dryer-1", 
    name: "Continental Girbau Express Dryer",
    category: "Commercial Dryers",
    description: "High-performance stack dryers with quick-dry technology. Maximizes throughput and floor space.",
    highlight: "Popular"
  },
  {
    id: "aa-package-1",
    name: "Complete Store Package",
    category: "Turnkey Solutions",
    description: "Full laundromat equipment package including washers, dryers, and payment systems. Volume discounts available.",
    highlight: "Best Value"
  },
];

const suppliesProducts = [
  {
    id: "detergent-1",
    name: "Tide Professional Powder Detergent",
    category: "Detergent",
    description: "Commercial-grade powder detergent, 40lb bucket. Professional cleaning power for high-volume operations.",
    price: "$89.99",
    amazonUrl: `https://www.amazon.com/s?k=tide+professional+powder+detergent+commercial&tag=${AMAZON_TAG}`,
    rating: 4.8,
    reviews: 2341,
    icon: Droplets
  },
  {
    id: "softener-1",
    name: "Downy Professional Fabric Softener",
    category: "Fabric Softener",
    description: "5-gallon commercial fabric softener. Reduces static and adds fresh scent to every load.",
    price: "$45.99",
    amazonUrl: `https://www.amazon.com/s?k=downy+professional+fabric+softener+commercial&tag=${AMAZON_TAG}`,
    rating: 4.7,
    reviews: 892,
    icon: Sparkles
  },
  {
    id: "dog-shampoo-1",
    name: "Earthbath Oatmeal & Aloe Dog Shampoo",
    category: "Dog Wash",
    description: "Gallon-size professional dog shampoo. Gentle, tearless formula perfect for self-service dog washes.",
    price: "$34.99",
    amazonUrl: `https://www.amazon.com/s?k=earthbath+oatmeal+aloe+dog+shampoo+gallon&tag=${AMAZON_TAG}`,
    rating: 4.9,
    reviews: 5672,
    icon: Dog
  },
  {
    id: "dog-conditioner-1",
    name: "TropiClean Dog Conditioner Gallon",
    category: "Dog Wash",
    description: "Professional grooming conditioner. Detangles and adds shine for all coat types.",
    price: "$29.99",
    amazonUrl: `https://www.amazon.com/s?k=tropiclean+dog+conditioner+gallon+professional&tag=${AMAZON_TAG}`,
    rating: 4.6,
    reviews: 1823,
    icon: Dog
  },
  {
    id: "cleaner-1",
    name: "Simple Green Industrial Cleaner",
    category: "Cleaning Supplies",
    description: "5-gallon industrial degreaser. Non-toxic formula for machines, floors, and surfaces.",
    price: "$52.99",
    amazonUrl: `https://www.amazon.com/s?k=simple+green+industrial+cleaner+5+gallon&tag=${AMAZON_TAG}`,
    rating: 4.7,
    reviews: 3421,
    icon: Sparkles
  },
  {
    id: "bags-1",
    name: "Commercial Laundry Bags (50 pack)",
    category: "Supplies",
    description: "Heavy-duty mesh laundry bags for wash-dry-fold service. Drawstring closure, multiple sizes.",
    price: "$79.99",
    amazonUrl: `https://www.amazon.com/s?k=commercial+laundry+bags+mesh+bulk&tag=${AMAZON_TAG}`,
    rating: 4.5,
    reviews: 567,
    icon: ShoppingBag
  },
  {
    id: "dog-dryer-1",
    name: "XPOWER B-24 Force Pet Dryer",
    category: "Dog Wash",
    description: "Professional-grade pet dryer with variable speed. Quiet operation, 3HP motor.",
    price: "$299.99",
    amazonUrl: `https://www.amazon.com/s?k=xpower+pet+dryer+professional+grooming&tag=${AMAZON_TAG}`,
    rating: 4.8,
    reviews: 2134,
    icon: Dog
  },
  {
    id: "coins-1",
    name: "Quarter Wrappers & Coin Trays",
    category: "Supplies",
    description: "Bulk quarter wrappers (1000 count) with sorting trays. Essential for coin-op management.",
    price: "$24.99",
    amazonUrl: `https://www.amazon.com/s?k=quarter+coin+wrappers+bulk+1000&tag=${AMAZON_TAG}`,
    rating: 4.4,
    reviews: 892,
    icon: Sparkles
  },
];

function EquipmentIcon({ type }: { type: string }) {
  switch (type) {
    case "washer":
      return <WashingMachine className="h-10 w-10 text-accent" />;
    case "dryer":
      return <Refrigerator className="h-10 w-10 text-accent" />;
    case "changer":
      return <Wrench className="h-10 w-10 text-accent" />;
    case "part":
      return <Wrench className="h-10 w-10 text-accent" />;
    default:
      return <WashingMachine className="h-10 w-10 text-accent" />;
  }
}

// CLEANBI grade colors
const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635", 
  "C": "#FBBF24",
  "Needs Work": "#d4af37"
};

function getGradeFromScore(score: number): string {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "Needs Work";
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch laundromat listings
  const { data: listings, isLoading: listingsLoading } = useQuery<any[]>({
    queryKey: ['/api/listings'],
  });

  const handleDistributorInquiry = (itemName: string, itemType: string) => {
    const subject = encodeURIComponent(`Distributor Inquiry: ${itemName}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in purchasing:\n\n${itemName} (${itemType})\n\nPlease connect me with an authorized distributor in my area.\n\nThank you!`);
    window.location.href = `mailto:${CONSULT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // Filter listings by search
  const filteredListings = listings?.filter(listing => 
    !searchQuery || 
    listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.state?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <SEO 
        title="Laundromat Equipment & Supplies Marketplace | Commercial Washers & Dryers For Sale | WashBizHub" 
        description="Shop commercial laundromat equipment, parts & supplies. Speed Queen, Dexter, Continental Girbau washers/dryers. Authorized distributors, best prices. Free quotes." 
        canonicalUrl="/marketplace"
        ogType="website"
        keywords={[
          "laundromat equipment for sale",
          "commercial washer dryer",
          "laundromat supplies wholesale",
          "coin laundry equipment",
          "laundromat parts distributor",
          "Speed Queen commercial washer",
          "Dexter laundry equipment",
          "Continental Girbau washer",
          "commercial laundry machines",
          "laundromat startup equipment",
          "used laundromat equipment",
          "dog wash station commercial",
          "laundry payment systems",
          "coin changer laundromat",
          "commercial dryer for sale"
        ]}
        faqs={[
          {
            question: "How much does laundromat equipment cost?",
            answer: "Commercial washers range from $7,500-$15,000, dryers from $6,500-$12,000, and payment systems from $2,500-$4,500. A full store equipment package typically costs $150,000-$500,000 depending on size and machine count."
          },
          {
            question: "What equipment do I need to start a laundromat?",
            answer: "Essential equipment includes commercial washers (various sizes), stack dryers, bill changers, folding tables, carts, seating, and a payment system. Most startups need 20-40 machines total. Consider dog wash stations for additional revenue streams."
          },
          {
            question: "Should I buy new or used laundromat equipment?",
            answer: "New equipment offers warranties (typically 3-5 years), energy efficiency, and reliability. Used equipment costs 40-60% less but may have higher maintenance costs. For startups, a mix of new and quality refurbished equipment balances cost and reliability."
          },
          {
            question: "Who are the best commercial laundry equipment manufacturers?",
            answer: "Top manufacturers include Speed Queen (known for durability), Dexter (innovative technology), Continental Girbau (energy efficiency), Huebsch (value), and Maytag Commercial. Each brand offers different advantages depending on your needs and budget."
          },
          {
            question: "How do I find authorized laundromat equipment distributors?",
            answer: "WashBizHub connects you with authorized distributors nationwide. Use our distributor locator or submit an inquiry through our marketplace. Authorized distributors provide genuine parts, proper warranties, installation support, and financing options."
          },
          {
            question: "What supplies do laundromats need to stock?",
            answer: "Essential supplies include commercial detergent, fabric softener, dryer sheets, laundry bags, coin wrappers, cleaning supplies, and vending machine products. For dog wash services, stock professional pet shampoo, conditioner, and dryers."
          },
          {
            question: "Can I finance laundromat equipment?",
            answer: "Yes, most distributors offer equipment financing with terms from 3-7 years. Options include equipment loans, leases, and SBA-backed financing. Down payments typically range from 10-20%. Visit our Funding page for lender partners."
          },
          {
            question: "What is the lifespan of commercial laundry equipment?",
            answer: "Quality commercial washers last 10-15 years with proper maintenance, while dryers can last 15-20 years. Speed Queen equipment is known for 25+ year lifespans. Regular maintenance and using genuine parts extends equipment life significantly."
          }
        ]}
        howTo={{
          name: "How to Buy Laundromat Equipment on WashBizHub",
          description: "Complete guide to purchasing commercial laundry equipment through WashBizHub's authorized distributor network and marketplace.",
          steps: [
            {
              name: "Browse Equipment Categories",
              text: "Explore our marketplace tabs: Supplies for immediate Amazon purchases, AAdvantage for Continental Girbau equipment, and Equipment for commercial washers, dryers, and payment systems from all major brands."
            },
            {
              name: "Select Your Equipment Needs",
              text: "Review equipment specifications, features, and price ranges. Consider your store size, target market, and budget. Our CLEANBI calculator can help determine optimal machine mix."
            },
            {
              name: "Request Distributor Quotes",
              text: "Click 'Request Distributor Quote' on any equipment. We'll connect you with authorized distributors in your area who can provide competitive pricing, financing options, and installation support."
            },
            {
              name: "Compare Offers and Financing",
              text: "Review quotes from multiple distributors. Compare total cost including installation, warranties, and financing terms. Use our loan calculator to estimate monthly payments."
            },
            {
              name: "Complete Purchase and Installation",
              text: "Finalize your order with the selected distributor. Schedule delivery and professional installation. Authorized distributors provide training, warranty registration, and ongoing support."
            }
          ],
          totalTime: "P7D"
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Commercial Laundromat Equipment Marketplace",
          "description": "Shop commercial washers, dryers, payment systems, parts, and supplies for laundromats",
          "url": "https://washbizhub.com/marketplace",
          "numberOfItems": 15,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "Product",
                "name": "Continental Girbau Commercial Washer",
                "description": "High-efficiency 60lb commercial washer with programmable controls",
                "brand": { "@type": "Brand", "name": "Continental Girbau" },
                "offers": { "@type": "AggregateOffer", "lowPrice": "8000", "highPrice": "15000", "priceCurrency": "USD" }
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "Product",
                "name": "Dexter Stack Dryer T-50x2",
                "description": "Double-stack commercial dryer with reversing drum technology",
                "brand": { "@type": "Brand", "name": "Dexter" },
                "offers": { "@type": "AggregateOffer", "lowPrice": "6500", "highPrice": "12000", "priceCurrency": "USD" }
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Product",
                "name": "Speed Queen Hardmount Washer",
                "description": "Commercial washer built for toughest environments with quantum controls",
                "brand": { "@type": "Brand", "name": "Speed Queen" },
                "offers": { "@type": "AggregateOffer", "lowPrice": "7500", "highPrice": "14000", "priceCurrency": "USD" }
              }
            },
            {
              "@type": "ListItem",
              "position": 4,
              "item": {
                "@type": "Product",
                "name": "Hamilton Bill Changer",
                "description": "High-capacity bill changer with anti-theft features",
                "brand": { "@type": "Brand", "name": "Hamilton" },
                "offers": { "@type": "AggregateOffer", "lowPrice": "2500", "highPrice": "4500", "priceCurrency": "USD" }
              }
            }
          ]
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Marketplace", url: "/marketplace" }
        ]}
        speakableSelectors={["h1", "h2", ".speakable"]}
      />
      <div className="min-h-screen bg-[#09090b] pt-16">
        {/* Hero Section with Obsidian Glass */}
        <div className="relative py-16 md:py-24">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#09090b]/80 to-[#09090b]" />
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4" data-testid="text-marketplace-title">
                Laundromat <span className="text-[#d4af37]">Marketplace</span>
              </h1>
              <p className="text-lg text-white/60 max-w-xl mx-auto mb-8" data-testid="text-marketplace-subtitle">
                Find. Analyze. Acquire.
              </p>
              
              {/* Search Bar and CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    placeholder="Search by city, state, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]/50"
                    data-testid="input-marketplace-search"
                  />
                </div>
                <Link href="/list-your-laundromat">
                  <Button 
                    size="lg"
                    className="bg-[#d4af37] hover:bg-[#c49f2f] text-black font-semibold h-12 px-6 whitespace-nowrap"
                    data-testid="button-list-laundromat"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    List Your Laundromat
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="laundromats" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/5 border border-white/10 h-auto rounded-xl p-1">
              <TabsTrigger 
                value="laundromats" 
                className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-black text-white py-3 text-xs sm:text-sm rounded-lg"
                data-testid="tab-laundromats"
              >
                <Store className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                <span className="truncate">Laundromats</span>
              </TabsTrigger>
              <TabsTrigger 
                value="equipment" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 py-3 text-xs sm:text-sm rounded-lg"
                data-testid="tab-equipment"
              >
                <WashingMachine className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                <span className="truncate">Equipment</span>
              </TabsTrigger>
              <TabsTrigger 
                value="supplies" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 py-3 text-xs sm:text-sm rounded-lg"
                data-testid="tab-supplies"
              >
                <Droplets className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                <span className="truncate">Supplies</span>
              </TabsTrigger>
              <TabsTrigger 
                value="aadvantage" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-white/60 py-3 text-xs sm:text-sm rounded-lg"
                data-testid="tab-aadvantage"
              >
                <Zap className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                <span className="truncate">AAdvantage</span>
              </TabsTrigger>
            </TabsList>

            {/* LAUNDROMATS TAB - Primary listing feed */}
            <TabsContent value="laundromats">
              {listingsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-20">
                  <Store className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Listings Found</h3>
                  <p className="text-white/50 mb-6">Try adjusting your search or check back soon for new listings.</p>
                  <Link href="/list-your-laundromat">
                    <Button className="bg-[#d4af37] hover:bg-[#c49f2f] text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      List Your Laundromat
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing: any) => {
                    const grade = listing.cleanbiGrade || getGradeFromScore(listing.cleanbiScore || 0);
                    const gradeColor = GRADE_COLORS[grade] || "#d4af37";
                    return (
                      <Link key={listing.id} href={`/listing/${listing.id}`}>
                        <Card 
                          className="h-full cursor-pointer transition-all hover:scale-[1.02] overflow-hidden"
                          style={{ 
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                          data-testid={`card-listing-${listing.id}`}
                        >
                          {/* Image placeholder */}
                          <div className="h-48 bg-gradient-to-br from-white/5 to-white/10 relative">
                            {listing.featured && (
                              <Badge className="absolute top-3 left-3 bg-[#d4af37] text-black">Featured</Badge>
                            )}
                            {listing.cleanbiScore && (
                              <div 
                                className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
                                style={{ backgroundColor: gradeColor }}
                              >
                                {grade}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Store className="h-16 w-16 text-white/20" />
                            </div>
                          </div>
                          
                          <CardContent className="p-5">
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                              {listing.title}
                            </h3>
                            <div className="flex items-center gap-1 text-white/50 text-sm mb-4">
                              <MapPin className="h-4 w-4" />
                              <span>{listing.location}, {listing.state}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                                  <DollarSign className="h-3 w-3" />
                                  Asking Price
                                </div>
                                <div className="text-[#d4af37] font-bold">
                                  ${(listing.price || 0).toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Revenue
                                </div>
                                <div className="text-white font-bold">
                                  ${(listing.annualRevenue || 0).toLocaleString()}/yr
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              {listing.includesRealEstate && (
                                <Badge variant="outline" className="border-[#d4af37]/30 text-[#d4af37]">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Includes RE
                                </Badge>
                              )}
                              <span className="text-[#d4af37] text-sm font-medium ml-auto">View Details →</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
              
              {/* CTA to view all listings */}
              <div className="text-center mt-12">
                <Link href="/laundromat-listings">
                  <Button variant="outline" size="lg" className="border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10">
                    View All Listings
                  </Button>
                </Link>
              </div>
            </TabsContent>

            {/* Supplies Tab - Amazon Affiliates */}
            <TabsContent value="supplies">
              <div className="mb-6">
                <p className="text-white/60 text-center text-sm">
                  Shop supplies through our affiliate links. We may earn a commission at no extra cost to you.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {suppliesProducts.map((product) => {
                  const IconComponent = product.icon;
                  return (
                    <Card 
                      key={product.id} 
                      className="bg-white/10 backdrop-blur border-white/20 hover-elevate flex flex-col"
                      data-testid={`card-supply-${product.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-accent/20">
                            <IconComponent className="h-6 w-6 text-accent" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-white text-base leading-tight">
                          {product.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-white text-xs font-medium">{product.rating}</span>
                          </div>
                          <span className="text-white/40 text-xs">({product.reviews.toLocaleString()})</span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <CardDescription className="text-white/60 text-sm mb-4 flex-1">
                          {product.description}
                        </CardDescription>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-accent text-xl font-bold">{product.price}</span>
                        </div>
                        <Button 
                          asChild
                          className="w-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold"
                          data-testid={`button-buy-${product.id}`}
                        >
                          <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Amazon
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="mt-8 bg-gradient-to-br from-[#FF9900]/20 to-[#FF9900]/5 border-[#FF9900]/30">
                <CardContent className="p-6 text-center">
                  <p className="text-white/80 text-sm">
                    As an Amazon Associate, WashBizHub earns from qualifying purchases. 
                    Prices and availability subject to change.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AAdvantage Partner Tab */}
            <TabsContent value="aadvantage">
              <Card className="mb-6 bg-gradient-to-br from-orange-500/30 to-orange-600/20 border-orange-500/40">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap className="h-8 w-8 text-orange-400" />
                    <h2 className="text-2xl md:text-3xl font-black text-white">AAdvantage Laundry Equipment</h2>
                  </div>
                  <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                    Official partner for Continental Girbau commercial laundry equipment. 
                    Join the WashBizHub Facebook group for special pricing, industry insights, and direct access to equipment specialists.
                  </p>
                  <Button 
                    asChild
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8"
                    data-testid="button-aadvantage-main"
                  >
                    <a href={AADVANTAGE_LINK} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Join WashBizHub Facebook Group
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {aadvantageProducts.map((product) => (
                  <Card 
                    key={product.id}
                    className="bg-white/10 backdrop-blur border-white/20 hover-elevate"
                    data-testid={`card-aadvantage-${product.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-orange-500 text-white">{product.highlight}</Badge>
                        <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/70 mb-4">
                        {product.description}
                      </CardDescription>
                      <Button 
                        asChild
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                        data-testid={`button-aadvantage-${product.id}`}
                      >
                        <a href={AADVANTAGE_LINK} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Pricing
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <p className="text-white/60 text-sm">
                    AAdvantage Laundry Equipment is an authorized Continental Girbau distributor. 
                    All equipment inquiries are handled through their dedicated team.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Equipment & Parts Tab - Distributor Routing */}
            <TabsContent value="equipment">
              <Card className="mb-6 bg-accent/20 border-accent/30">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <div className="p-3 rounded-full bg-accent/30 shrink-0">
                      <Building2 className="h-8 w-8 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">Authorized Distributor Network</h3>
                      <p className="text-white/70 text-sm">
                        All commercial equipment and parts are sourced through our network of authorized distributors. 
                        This ensures genuine products, proper warranties, and professional installation support.
                      </p>
                    </div>
                    <Button 
                      asChild
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground shrink-0"
                      data-testid="button-find-distributor"
                    >
                      <Link href="/distributor-locator">
                        <MapPin className="h-4 w-4 mr-2" />
                        Find a Distributor
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <h3 className="text-white font-bold text-xl mb-4">Commercial Equipment</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {equipmentShowcase.map((equipment) => (
                  <Card 
                    key={equipment.id} 
                    className="bg-white/10 backdrop-blur border-white/20 hover-elevate"
                    data-testid={`card-equipment-${equipment.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-accent/20 shrink-0">
                          <EquipmentIcon type={equipment.image} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="secondary">{equipment.category}</Badge>
                            <Badge variant="outline" className="border-accent/50 text-accent text-xs">
                              {equipment.brand}
                            </Badge>
                          </div>
                          <CardTitle className="text-white text-lg leading-tight">
                            {equipment.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/70 mb-4">
                        {equipment.description}
                      </CardDescription>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {equipment.features.map((feature, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="border-white/20 text-white/80 text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-white/50 text-xs block">Typical Range</span>
                          <span className="text-accent text-lg font-bold">{equipment.priceRange}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleDistributorInquiry(equipment.name, "Equipment")}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                        data-testid={`button-quote-${equipment.id}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Request Distributor Quote
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h3 className="text-white font-bold text-xl mb-4">Replacement Parts</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {partsShowcase.map((part) => (
                  <Card 
                    key={part.id} 
                    className="bg-white/10 backdrop-blur border-white/20 hover-elevate"
                    data-testid={`card-part-${part.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-accent/20 shrink-0">
                          <Wrench className="h-10 w-10 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="secondary">{part.category}</Badge>
                          </div>
                          <CardTitle className="text-white text-lg leading-tight">
                            {part.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/70 mb-4">
                        {part.description}
                      </CardDescription>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {part.features.map((feature, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="border-white/20 text-white/80 text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-white/50 text-xs block">Typical Range</span>
                          <span className="text-accent text-lg font-bold">{part.priceRange}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleDistributorInquiry(part.name, "Parts")}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                        data-testid={`button-quote-${part.id}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Request Parts Quote
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <h3 className="text-white font-bold text-xl mb-2">Need Help Finding Equipment?</h3>
                  <p className="text-white/60 mb-4 max-w-2xl mx-auto">
                    Our team will connect you with authorized distributors in your area for personalized quotes, 
                    installation support, and warranty coverage.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => {
                        const subject = encodeURIComponent("Equipment Consultation Request");
                        const body = encodeURIComponent("Hi,\n\nI'd like to schedule a consultation to discuss equipment options for my laundromat.\n\nPlease connect me with distributors in my area.\n\nThank you!");
                        window.location.href = `mailto:${CONSULT_EMAIL}?subject=${subject}&body=${body}`;
                      }}
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      data-testid="button-schedule-consultation"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Schedule Consultation
                    </Button>
                    <Button 
                      asChild
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                      data-testid="button-distributor-locator"
                    >
                      <Link href="/distributor-locator">
                        <MapPin className="h-4 w-4 mr-2" />
                        Find Distributors Near Me
                      </Link>
                    </Button>
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
