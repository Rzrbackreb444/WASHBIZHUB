import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Store, Search, Shield, Star, MapPin, Package, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VendorStore } from "@shared/schema";

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Fetch all vendor stores
  const { data: stores, isLoading } = useQuery<VendorStore[]>({
    queryKey: ["/api/vendor-stores"],
  });

  // Filter and sort stores
  const filteredStores = stores?.filter(store => {
    const matchesSearch = !searchQuery || 
      store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "verified" && store.verified) ||
      (statusFilter === "featured" && store.featured);
    
    // Category filter removed - vendors don't have categories, only products do

    return matchesSearch && matchesStatus && store.status === "active";
  })?.sort((a, b) => {
    if (sortBy === "featured") {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return Number(b.totalSales || "0") - Number(a.totalSales || "0");
    }
    if (sortBy === "sales") return Number(b.totalSales || "0") - Number(a.totalSales || "0");
    if (sortBy === "rating") return Number(b.avgRating || "0") - Number(a.avgRating || "0");
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  // Categories removed - vendors don't have categories, only products do

  return (
    <>
      <Helmet>
        <title>WashBizHub Vendors | Laundromat Equipment & Service Providers</title>
        <meta name="description" content="Discover verified laundromat vendors offering equipment, parts, supplies, maintenance services, consulting, and financial solutions. Browse ratings, reviews, and featured stores." />
        <meta name="keywords" content="laundromat vendors, laundromat equipment suppliers, laundromat services, parts suppliers, maintenance contractors, laundromat financing, business consulting" />
        <link rel="canonical" href="https://washbizhub.com/vendors" />
        <meta property="og:title" content="WashBizHub Vendors | Laundromat Equipment & Services" />
        <meta property="og:description" content="Verified vendors for laundromat equipment, parts, services, and solutions." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Hero Section */}
        <div className="bg-primary/20 backdrop-blur border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Store className="w-12 h-12 text-accent" />
              </div>
              <h1 className="text-5xl font-black text-white mb-4">
                Vendor Marketplace
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Discover trusted vendors offering equipment, supplies, services, and digital products 
                for the laundromat industry. Powered by our verified seller network.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    data-testid="input-vendor-search"
                    type="text"
                    placeholder="Search vendors, products, services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/50 h-14 text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white/5 backdrop-blur border-b border-white/10 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter" className="w-[160px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort-by" className="w-[160px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="sales">Top Sales</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-white/70">
                {filteredStores?.length || 0} vendors found
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="bg-white/10 backdrop-blur border-white/20 animate-pulse">
                  <CardHeader className="h-48 bg-white/5" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-white/10 rounded mb-2" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStores && filteredStores.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {filteredStores.map(store => (
                <Link key={store.id} href={`/vendors/${store.storeSlug}`}>
                  <Card 
                    data-testid={`card-vendor-${store.id}`}
                    className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group h-full"
                  >
                    {/* Store Banner */}
                    {store.banner ? (
                      <div className="h-32 overflow-hidden rounded-t-xl">
                        <img 
                          src={store.banner} 
                          alt={store.storeName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-primary/40 to-accent/40 rounded-t-xl flex items-center justify-center">
                        <Store className="w-16 h-16 text-white/30" />
                      </div>
                    )}

                    {/* Store Logo (overlapping) */}
                    <div className="relative -mt-10 px-6 mb-4">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur border-4 border-gray-900 flex items-center justify-center overflow-hidden">
                        {store.logo ? (
                          <img src={store.logo} alt={store.storeName} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-8 h-8 text-white/50" />
                        )}
                      </div>
                    </div>

                    <CardHeader className="pt-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                          {store.storeName}
                        </CardTitle>
                        <div className="flex gap-1 flex-shrink-0">
                          {store.verified && (
                            <Badge variant="outline" className="border-accent/50 text-accent text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {store.featured && (
                            <Star className="w-5 h-5 text-accent fill-accent" />
                          )}
                        </div>
                      </div>
                      
                      <CardDescription className="text-white/70 line-clamp-2">
                        {store.description || "Professional vendor offering quality products and services."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold text-white">{store.totalProducts || 0}</div>
                          <div className="text-xs text-white/60 flex items-center justify-center gap-1">
                            <Package className="w-3 h-3" />
                            Products
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold text-accent">
                            {store.avgRating ? Number(store.avgRating).toFixed(1) : "-"}
                          </div>
                          <div className="text-xs text-white/60 flex items-center justify-center gap-1">
                            <Star className="w-3 h-3" />
                            Rating
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold text-white">{store.totalSales || 0}</div>
                          <div className="text-xs text-white/60 flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Sales
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      {(store.city || store.state) && (
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <MapPin className="w-4 h-4" />
                          <span>{[store.city, store.state].filter(Boolean).join(", ")}</span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="border-t border-white/10 pt-4">
                      <Button data-testid={`button-view-store-${store.id}`} variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent/10">
                        View Store
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-white/10 backdrop-blur border-white/20 p-12 text-center">
              <Store className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No vendors found</h3>
              <p className="text-white/70 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search query."
                  : "Be the first to create a vendor store!"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button variant="default" className="bg-accent text-primary">
                  Become a Vendor
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur border-y border-white/10 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h2 className="text-4xl font-black text-white mb-4">
              Want to Sell on WashBizHub?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join our verified vendor network and reach 73,000+ laundromat operators. 
              List your products, manage orders, and grow your business.
            </p>
            <Button size="lg" className="bg-accent text-primary font-bold px-8 py-6 text-lg">
              Apply to Become a Vendor
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
