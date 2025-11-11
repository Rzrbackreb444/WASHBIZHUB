import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Star, Search, Store, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useVendors } from "@/hooks/use-vendors";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const { data: vendors = [], isLoading } = useVendors(selectedCategory || undefined);

  const sampleVendors = [
    {
      id: "1",
      companyName: "Pro Laundry Equipment Co",
      category: "Equipment",
      description: "Commercial-grade washers and dryers with 10-year warranties",
      rating: 4.8,
      reviews: 342,
      verified: true,
    },
    {
      id: "2",
      companyName: "SpeedClean Parts Supply",
      category: "Parts",
      description: "Genuine OEM parts for all major laundromat equipment brands",
      rating: 4.9,
      reviews: 567,
      verified: true,
    },
    {
      id: "3",
      companyName: "LaundryPro Consulting",
      category: "Consulting",
      description: "Business optimization and expansion strategy experts",
      rating: 4.7,
      reviews: 128,
      verified: true,
    },
    {
      id: "4",
      companyName: "Maintenance Masters",
      category: "Services",
      description: "24/7 emergency repair and preventive maintenance contracts",
      rating: 4.6,
      reviews: 234,
      verified: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <ShoppingBag className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-marketplace-title">
            Marketplace
          </h1>
          <p className="text-xl text-white/70" data-testid="text-marketplace-subtitle">
            Verified vendors with storefronts and affiliate tracking
          </p>
        </div>

        {/* Search */}
        <Card className="bg-white/10 backdrop-blur border-white/20 mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                type="search"
                placeholder="Search vendors, equipment, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/50"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vendor Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sampleVendors.map((vendor) => (
            <Card 
              key={vendor.id} 
              className="bg-white/10 backdrop-blur border-white/20 hover-elevate active-elevate-2"
              data-testid={`card-vendor-${vendor.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Store className="h-6 w-6 text-accent" />
                    <CardTitle className="text-white text-xl">{vendor.companyName}</CardTitle>
                    {vendor.verified && (
                      <CheckCircle className="h-5 w-5 text-accent" data-testid={`verified-${vendor.id}`} />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold" data-testid={`rating-${vendor.id}`}>
                      {vendor.rating}
                    </span>
                  </div>
                  <span className="text-white/60 text-sm">
                    ({vendor.reviews} reviews)
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {vendor.category}
                  </Badge>
                </div>
                <CardDescription className="text-white/70">
                  {vendor.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                    data-testid={`button-visit-${vendor.id}`}
                  >
                    Visit Storefront
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
                    data-testid={`button-affiliate-${vendor.id}`}
                  >
                    Get Affiliate Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Affiliate CTA */}
        <Card className="bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur border-accent/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-black text-white mb-4">Earn 10-20% Commissions</h2>
            <p className="text-xl text-white/80 mb-6 max-w-2xl mx-auto">
              Join our affiliate program and earn commissions on every sale. 
              Track your performance with our comprehensive dashboard.
            </p>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-6 text-lg"
              data-testid="button-become-affiliate"
            >
              Become an Affiliate Partner
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
