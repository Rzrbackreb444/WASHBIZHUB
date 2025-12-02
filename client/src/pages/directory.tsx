import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { 
  Search, 
  MapPin, 
  Globe, 
  Phone, 
  Star, 
  Building2, 
  Plus,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Package,
  Wrench,
  ShoppingBag,
  DollarSign,
  Mail
} from "lucide-react";

interface DirectoryListing {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: "laundromats" | "equipment" | "products" | "services";
  subcategory?: string;
  price?: string;
  location?: string;
  city?: string;
  state?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  image?: string;
  isFeatured: boolean;
  isVerified: boolean;
  viewCount: number;
  tags?: string[];
  createdAt?: string;
}

const CATEGORIES = [
  {
    id: "laundromats",
    name: "Laundromats for Sale",
    description: "Find laundromats available for purchase",
    icon: Building2,
    color: "from-blue-600 to-indigo-600",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
  },
  {
    id: "equipment",
    name: "Equipment",
    description: "Washers, dryers, changers & more",
    icon: Package,
    color: "from-emerald-600 to-teal-600",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
  },
  {
    id: "products",
    name: "Products & Supplies",
    description: "Detergent, vending items, supplies",
    icon: ShoppingBag,
    color: "from-orange-600 to-amber-600",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600",
  },
  {
    id: "services",
    name: "Service Providers",
    description: "Repair techs, brokers, consultants",
    icon: Wrench,
    color: "from-purple-600 to-violet-600",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
  },
];

const SAMPLE_LISTINGS: DirectoryListing[] = [
  {
    id: "1",
    title: "Profitable Coin Laundry - Los Angeles",
    slug: "profitable-coin-laundry-la",
    description: "Turn-key 2,800 sq ft laundromat with 32 washers, 24 dryers. Gross $28K/month. Lease has 8 years remaining. Owner financing available.",
    category: "laundromats",
    subcategory: "For Sale",
    price: "$425,000",
    city: "Los Angeles",
    state: "CA",
    isFeatured: true,
    isVerified: true,
    viewCount: 1247,
    tags: ["Owner Financing", "High Volume", "Turn-Key"],
  },
  {
    id: "2",
    title: "Speed Queen Washer SC40 - Like New",
    slug: "speed-queen-sc40-washer",
    description: "2022 Speed Queen SC40 front-load washer. Excellent condition, low usage. Includes warranty transfer.",
    category: "equipment",
    subcategory: "Washers",
    price: "$4,200",
    city: "Phoenix",
    state: "AZ",
    isFeatured: false,
    isVerified: true,
    viewCount: 342,
    tags: ["Speed Queen", "Like New", "Warranty"],
  },
  {
    id: "3",
    title: "Dexter Stacked Dryers (Set of 4)",
    slug: "dexter-stacked-dryers-set",
    description: "Four Dexter T-50 stacked dryers. Recently refurbished, coin ready. Great for expansion or replacement.",
    category: "equipment",
    subcategory: "Dryers",
    price: "$6,800",
    city: "Houston",
    state: "TX",
    isFeatured: true,
    isVerified: true,
    viewCount: 521,
    tags: ["Dexter", "Refurbished", "Stacked"],
  },
  {
    id: "4",
    title: "Bulk Laundry Detergent - 55 Gallon Drums",
    slug: "bulk-detergent-55-gallon",
    description: "Commercial-grade liquid detergent. HE compatible. Free delivery on orders over $500. Volume discounts available.",
    category: "products",
    subcategory: "Detergent",
    price: "$185/drum",
    location: "Nationwide Shipping",
    isFeatured: false,
    isVerified: true,
    viewCount: 189,
    tags: ["Bulk", "Free Shipping", "HE Compatible"],
  },
  {
    id: "5",
    title: "Larry Larsen Business Brokerage",
    slug: "larry-larsen-brokerage",
    description: "30+ years experience in laundromat sales. Specialized in Southern California coin laundry transactions. Over 500 successful deals closed.",
    category: "services",
    subcategory: "Business Brokers",
    city: "Newport Beach",
    state: "CA",
    website: "https://example.com",
    isFeatured: true,
    isVerified: true,
    viewCount: 2847,
    tags: ["30+ Years", "SBA Approved", "SoCal"],
  },
  {
    id: "6",
    title: "Commercial Laundry Repair - 24/7 Service",
    slug: "commercial-laundry-repair-247",
    description: "Factory-trained technicians for Speed Queen, Dexter, Huebsch, and more. Emergency service available. Serving Greater Chicago area.",
    category: "services",
    subcategory: "Repair & Maintenance",
    city: "Chicago",
    state: "IL",
    contactPhone: "(312) 555-0123",
    isFeatured: false,
    isVerified: true,
    viewCount: 892,
    tags: ["24/7", "All Brands", "Emergency Service"],
  },
  {
    id: "7",
    title: "Card Payment System Installation",
    slug: "card-payment-installation",
    description: "Complete card and mobile payment solutions for laundromats. CyclePay certified installer. Free site assessment.",
    category: "services",
    subcategory: "Technology",
    location: "Nationwide",
    isFeatured: true,
    isVerified: true,
    viewCount: 1456,
    tags: ["Card Systems", "Mobile Pay", "CyclePay"],
  },
  {
    id: "8",
    title: "Vending Machine Supplies - Wholesale",
    slug: "vending-supplies-wholesale",
    description: "Snacks, drinks, and laundry supplies for your vending machines. Minimum order $200. Next-day delivery in most areas.",
    category: "products",
    subcategory: "Vending",
    location: "East Coast",
    isFeatured: false,
    isVerified: true,
    viewCount: 234,
    tags: ["Wholesale", "Fast Delivery", "Full Line"],
  },
];

export default function DirectoryPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category && CATEGORIES.find(c => c.id === category)) {
      setActiveCategory(category);
    }
  }, [location]);

  // Use sample listings directly (API integration can be added later)
  const listings = SAMPLE_LISTINGS;

  const filteredListings = listings.filter(listing => {
    const matchesCategory = activeCategory === "all" || listing.category === activeCategory;
    const matchesState = selectedState === "all" || listing.state === selectedState;
    const matchesSearch = !searchQuery || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesState && matchesSearch;
  });

  const featuredListings = filteredListings.filter(l => l.isFeatured);
  const regularListings = filteredListings.filter(l => !l.isFeatured);

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || Building2;
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.textColor || "text-slate-600";
  };

  return (
    <>
      <SEO
        title="Laundromat Directory | Equipment, Products & Services for Sale | WashBizHub"
        description="Find laundromats for sale, commercial laundry equipment, supplies, and trusted service providers. The #1 directory for the laundromat industry."
        canonicalUrl="/directory"
        ogType="website"
        keywords={[
          "laundromat for sale",
          "laundry equipment for sale",
          "commercial laundry supplies",
          "laundromat broker",
          "laundry repair service",
          "coin laundry equipment",
          "laundromat directory"
        ]}
        faqs={[
          {
            question: "How do I list my laundromat for sale?",
            answer: "Click 'Add Listing' and fill out the form. Basic listings are free. Featured listings with priority placement are available for premium members."
          },
          {
            question: "Are the listings verified?",
            answer: "Verified listings display a blue checkmark badge. Our team reviews seller information to confirm business legitimacy."
          },
          {
            question: "How do I contact a seller?",
            answer: "Each listing includes contact information. Click on the listing to view phone, email, or website details to reach the seller directly."
          }
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Directory", url: "/directory" }
        ]}
      />

      <div className="min-h-screen bg-white">
        {/* Premium Hero Section */}
        <div className="mesh-gradient-hero py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 mb-6">
              <Building2 className="w-4 h-4 text-[#b8860b]" />
              <span className="text-sm font-medium text-[#1e3a5f]">Industry Directory</span>
            </div>
            <h1 className="hero-title text-[#1e3a5f] mb-4">
              The #1 Laundromat{' '}
              <span className="text-gradient-gold">Marketplace</span>
            </h1>
            <p className="hero-subtitle max-w-3xl mx-auto mb-10">
              Find laundromats for sale, equipment, supplies, and trusted service providers. Everything you need in one place.
            </p>

            {/* Premium Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="premium-card flex gap-2 p-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search listings..."
                    className="input-premium pl-12 h-12 border-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-directory-search"
                  />
                </div>
                <Button className="btn-premium-gold text-white h-12 px-6" data-testid="button-search">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Add Listing CTA */}
            <Link href="/add-listing">
              <Button variant="outline" className="border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/5" data-testid="link-add-listing">
                <Plus className="w-4 h-4 mr-2" />
                Add Your Listing Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Cards */}
        <div className="max-w-6xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(isActive ? "all" : category.id)}
                  className={`p-4 md:p-6 rounded-xl border-2 text-left transition-all shadow-lg ${
                    isActive 
                      ? "border-[#b8860b] bg-white dark:bg-slate-800 ring-2 ring-[#b8860b]/20" 
                      : "border-white dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                  }`}
                  data-testid={`category-${category.id}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${category.textColor}`} />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeCategory === "all" 
                  ? "All Listings" 
                  : CATEGORIES.find(c => c.id === activeCategory)?.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-[140px]" data-testid="filter-state">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="AZ">Arizona</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                </SelectContent>
              </Select>
              {(activeCategory !== "all" || selectedState !== "all" || searchQuery) && (
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setActiveCategory("all"); 
                    setSelectedState("all"); 
                    setSearchQuery(""); 
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Featured Listings */}
          {featuredListings.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-[#b8860b]" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Featured Listings</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredListings.map((listing) => {
                  const CategoryIcon = getCategoryIcon(listing.category);
                  return (
                    <Link key={listing.id} href={`/directory/${listing.slug}`}>
                      <Card className="h-full hover-elevate cursor-pointer border-[#b8860b]/30 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-800/50 dark:to-slate-800">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge className="bg-[#b8860b] text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                            {listing.isVerified && (
                              <Badge variant="outline" className="border-blue-500/30 text-blue-600">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg mt-3 line-clamp-2">{listing.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <CategoryIcon className={`w-4 h-4 ${getCategoryColor(listing.category)}`} />
                            <span>{listing.subcategory || CATEGORIES.find(c => c.id === listing.category)?.name}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                            {listing.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {listing.price && (
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {listing.price}
                              </Badge>
                            )}
                            {(listing.city || listing.location) && (
                              <Badge variant="secondary">
                                <MapPin className="w-3 h-3 mr-1" />
                                {listing.city ? `${listing.city}, ${listing.state}` : listing.location}
                              </Badge>
                            )}
                          </div>

                          {listing.tags && listing.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {listing.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Listings */}
          {regularListings.length > 0 ? (
            <div className="space-y-4">
              {regularListings.map((listing) => {
                const CategoryIcon = getCategoryIcon(listing.category);
                return (
                  <Link key={listing.id} href={`/directory/${listing.slug}`}>
                    <Card className="hover-elevate cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-lg ${CATEGORIES.find(c => c.id === listing.category)?.bgColor} flex items-center justify-center flex-shrink-0`}>
                            <CategoryIcon className={`w-7 h-7 ${getCategoryColor(listing.category)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                {listing.title}
                              </h3>
                              {listing.isVerified && (
                                <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 flex-shrink-0 gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-2">
                              <span>{listing.subcategory || CATEGORIES.find(c => c.id === listing.category)?.name}</span>
                              {(listing.city || listing.location) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {listing.city ? `${listing.city}, ${listing.state}` : listing.location}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                              {listing.description}
                            </p>
                            
                            <div className="flex items-center gap-3 flex-wrap">
                              {listing.price && (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {listing.price}
                                </Badge>
                              )}
                              {listing.tags?.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : filteredListings.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No listings found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Link href="/add-listing">
                  <Button className="bg-[#b8860b] hover:bg-[#a07609]" data-testid="button-be-first">
                    <Plus className="w-4 h-4 mr-2" />
                    Be the First to List
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Premium CTA Section */}
          <div className="mt-16 premium-card bg-gradient-to-br from-[#1e3a5f] to-[#1e3a5f]/90 p-10 md:p-14 text-center rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#b8860b]/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-[#b8860b]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">List Your Business or Equipment</h3>
            <p className="text-white/70 max-w-xl mx-auto mb-8 text-lg">
              Reach thousands of laundromat owners, buyers, and operators. Basic listings are free. Featured listings get 10x more visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/add-listing">
                <Button className="btn-premium-gold text-white px-8 py-6 text-lg font-semibold" data-testid="button-list-free">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Free Listing
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold" data-testid="button-featured">
                  <Star className="w-5 h-5 mr-2" />
                  Get Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
