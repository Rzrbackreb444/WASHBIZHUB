import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  MapPin, 
  Globe, 
  Phone, 
  Star, 
  Building2, 
  Plus,
  Filter,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface BusinessListing {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId?: string;
  city?: string;
  state?: string;
  serviceArea?: string;
  website?: string;
  phone?: string;
  logo?: string;
  tier: string;
  isFeatured: boolean;
  hasVerifiedBadge: boolean;
  viewCount: number;
  servicesOffered?: string[];
  brandsCarried?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/directory/categories"],
  });

  const { data: featuredListings, isLoading: featuredLoading } = useQuery<BusinessListing[]>({
    queryKey: ["/api/directory/listings/featured"],
  });

  const { data: listings, isLoading: listingsLoading } = useQuery<BusinessListing[]>({
    queryKey: ["/api/directory/listings", { category: selectedCategory, state: selectedState, search: searchQuery }],
  });

  const filteredListings = listings?.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-[#39CCCC] text-white mb-4" data-testid="badge-directory">
            <Building2 className="w-3 h-3 mr-1" />
            Industry Directory
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Laundromat Industry Vendors & Services
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Connect with trusted equipment vendors, service providers, consultants, and more.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white/10 backdrop-blur rounded-lg p-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search businesses, services, or brands..."
                  className="pl-10 bg-white border-0 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Button className="bg-[#b8860b] hover:bg-[#a07609] h-12 px-6" data-testid="button-search">
                Search
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <Link href="/list-business">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="link-list-business">
                <Plus className="w-4 h-4 mr-2" />
                List Your Business Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categoriesLoading ? (
              Array(10).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))
            ) : (
              categories?.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? "" : category.id)}
                  className={`p-4 rounded-lg border text-center transition-all hover-elevate ${
                    selectedCategory === category.id 
                      ? "border-[#39CCCC] bg-[#39CCCC]/10" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  data-testid={`category-${category.slug}`}
                >
                  <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                    selectedCategory === category.id ? "text-[#39CCCC]" : "text-slate-600"
                  }`} />
                  <span className="text-sm font-medium text-slate-900">{category.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Featured Listings */}
        {featuredListings && featuredListings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-[#b8860b]" />
              <h2 className="text-2xl font-bold text-slate-900">Featured Businesses</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))
              ) : (
                featuredListings.map((listing) => (
                  <Link key={listing.id} href={`/directory/${listing.slug}`}>
                    <Card className="h-full hover-elevate cursor-pointer border-[#b8860b]/30 bg-gradient-to-br from-amber-50/50 to-white">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {listing.logo ? (
                              <img src={listing.logo} alt={listing.businessName} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-[#39CCCC]/20 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-[#39CCCC]" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {listing.businessName}
                                {listing.hasVerifiedBadge && (
                                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                )}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {listing.city}, {listing.state}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-[#b8860b]">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                          {listing.shortDescription || listing.description}
                        </p>
                        {listing.servicesOffered && listing.servicesOffered.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {listing.servicesOffered.slice(0, 3).map((service, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* Filters & Results */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="md:w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
                  <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
                    <SelectTrigger data-testid="filter-category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">State</label>
                  <Select value={selectedState || "all"} onValueChange={(val) => setSelectedState(val === "all" ? "" : val)}>
                    <SelectTrigger data-testid="filter-state">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="AR">Arkansas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => { setSelectedCategory(""); setSelectedState(""); setSearchQuery(""); }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Promo Card */}
            <Card className="mt-4 bg-gradient-to-br from-[#001F3F] to-slate-800 text-white border-0">
              <CardContent className="pt-6">
                <Sparkles className="w-8 h-8 text-[#b8860b] mb-3" />
                <h3 className="font-bold mb-2">Get More Visibility</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Upgrade to featured listing and get 10x more views
                </p>
                <Link href="/list-business">
                  <Button className="w-full bg-[#b8860b] hover:bg-[#a07609]" data-testid="button-upgrade">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {filteredListings?.length || 0} Businesses Found
              </h2>
            </div>

            {listingsLoading ? (
              <div className="grid gap-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : filteredListings && filteredListings.length > 0 ? (
              <div className="grid gap-4">
                {filteredListings.map((listing) => (
                  <Link key={listing.id} href={`/directory/${listing.slug}`}>
                    <Card className="hover-elevate cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {listing.logo ? (
                            <img src={listing.logo} alt={listing.businessName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-8 h-8 text-slate-400" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-slate-900">
                                {listing.businessName}
                              </h3>
                              {listing.hasVerifiedBadge && (
                                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              )}
                              {listing.isFeatured && (
                                <Badge className="bg-[#b8860b] flex-shrink-0">Featured</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                              {listing.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {listing.city}, {listing.state}
                                </span>
                              )}
                              {listing.serviceArea && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {listing.serviceArea}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                              {listing.shortDescription || listing.description}
                            </p>
                            
                            {listing.servicesOffered && listing.servicesOffered.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {listing.servicesOffered.slice(0, 4).map((service, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                                {listing.servicesOffered.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{listing.servicesOffered.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No businesses found</h3>
                  <p className="text-slate-500 mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Link href="/list-business">
                    <Button className="bg-[#39CCCC] hover:bg-[#2db3b3]" data-testid="button-be-first">
                      <Plus className="w-4 h-4 mr-2" />
                      Be the First to List
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
