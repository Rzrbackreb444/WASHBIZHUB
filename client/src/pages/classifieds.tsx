import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, Plus, MapPin, Tag, ShoppingBag, Store, Wrench, Building2,
  Eye, Clock, Filter
} from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All Categories", icon: ShoppingBag },
  { value: "equipment", label: "Equipment", icon: ShoppingBag },
  { value: "parts", label: "Parts & Supplies", icon: Wrench },
  { value: "business", label: "Businesses for Sale", icon: Store },
  { value: "services", label: "Services", icon: Building2 },
];

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price?: number;
  price_type: string;
  city?: string;
  state?: string;
  manufacturer?: string;
  model?: string;
  condition?: string;
  images?: string[];
  views: number;
  created_at: string;
  featured: boolean;
}

function formatPrice(price?: number, priceType?: string): string {
  if (!price && priceType === "call") return "Call for Price";
  if (!price) return "Contact for Price";
  if (priceType === "negotiable") return `$${price.toLocaleString()} (OBO)`;
  if (priceType === "auction") return `Starting at $${price.toLocaleString()}`;
  return `$${price.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "equipment": return ShoppingBag;
    case "parts": return Wrench;
    case "business": return Store;
    case "services": return Building2;
    default: return ShoppingBag;
  }
}

function ListingSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-40 w-full mb-4 rounded-md" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const CategoryIcon = getCategoryIcon(listing.category);
  
  return (
    <Link href={`/classifieds/${listing.id}`}>
      <Card className="h-full hover-elevate cursor-pointer transition-all overflow-hidden">
        {listing.featured && (
          <div className="bg-[#C8A661] text-white text-xs font-semibold px-3 py-1 text-center">
            Featured Listing
          </div>
        )}
        <CardContent className="p-4">
          <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <CategoryIcon className="w-12 h-12 text-muted-foreground/30" />
            )}
          </div>
          
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground line-clamp-2 flex-1" data-testid={`listing-title-${listing.id}`}>
              {listing.title}
            </h3>
          </div>
          
          <div className="text-lg font-bold text-[#C8A661] mb-2" data-testid={`listing-price-${listing.id}`}>
            {formatPrice(listing.price, listing.price_type)}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {listing.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              <CategoryIcon className="w-3 h-3 mr-1" />
              {listing.category}
            </Badge>
            {listing.condition && (
              <Badge variant="outline" className="text-xs">
                {listing.condition}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
            <div className="flex items-center gap-1">
              {(listing.city || listing.state) && (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>{[listing.city, listing.state].filter(Boolean).join(", ")}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.views}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(listing.created_at)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Classifieds() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: listings, isLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/marketplace/listings", selectedCategory],
  });

  const filteredListings = listings?.filter((listing) => {
    const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const featuredListings = filteredListings?.filter(l => l.featured) || [];
  const regularListings = filteredListings?.filter(l => !l.featured) || [];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Buy & Sell Laundry Equipment | WashBizHub Classifieds</title>
        <meta name="description" content="Buy and sell used laundry equipment, parts, services, and laundromats. Free listings for laundry industry professionals." />
      </Helmet>

      <div className="bg-gradient-to-r from-[#001F3F] to-[#0d4f8b] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">WashBizHub Classifieds</h1>
              <p className="text-lg text-white/80">
                Buy & sell equipment, parts, services, and laundromats
              </p>
            </div>
            <Button 
              asChild 
              className="bg-[#C8A661] hover:bg-[#a07609] text-white"
            >
              <Link href="/classifieds/submit">
                <Plus className="w-4 h-4 mr-2" />
                Post Free Listing
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.value;
            return (
              <Button
                key={cat.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className={isActive ? "bg-[#001F3F]" : ""}
                data-testid={`filter-${cat.value}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ListingSkeleton key={i} />
            ))}
          </div>
        ) : filteredListings && filteredListings.length > 0 ? (
          <>
            {featuredListings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#C8A661]" />
                  Featured Listings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">
                {regularListings.length} {selectedCategory !== "all" ? selectedCategory : ""} Listing{regularListings.length !== 1 ? "s" : ""}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Listings Yet</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? `No results for "${searchQuery}"`
                  : "Be the first to list something!"}
              </p>
              <Button asChild className="bg-[#C8A661] hover:bg-[#a07609]">
                <Link href="/classifieds/submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Free Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-muted py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Sell?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Laundry-related listings are completely FREE. Reach thousands of 
            industry professionals looking to buy equipment, services, and businesses.
          </p>
          <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#a07609]">
            <Link href="/classifieds/submit">
              <Plus className="w-5 h-5 mr-2" />
              Post Your Listing for Free
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}