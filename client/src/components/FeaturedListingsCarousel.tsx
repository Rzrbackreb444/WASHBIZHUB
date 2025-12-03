import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, ChevronRight, Target } from "lucide-react";

const FEATURED_LISTINGS = [
  {
    id: "1",
    name: "Modern Laundromat - Dallas, TX",
    location: "Dallas, TX",
    address: "2847 Main St, Dallas, TX 75201",
    revenue: "$15,000/month",
    type: "Laundromat",
    excerpt: "Updated equipment, high foot traffic location, established customer base"
  },
  {
    id: "2",
    name: "Car Wash - Oklahoma City",
    location: "Oklahoma City, OK",
    address: "1520 NW Expressway, Oklahoma City, OK 73118",
    revenue: "$22,000/month",
    type: "Car Wash",
    excerpt: "Automatic wash system, 8 bays, loyal customer base, growth potential"
  },
  {
    id: "3",
    name: "Dry Cleaning & Laundry Combo",
    location: "Little Rock, AR",
    address: "4200 W Markham St, Little Rock, AR 72205",
    revenue: "$18,500/month",
    type: "Multi-Service",
    excerpt: "Diversified revenue streams, professional staff, established brand"
  },
  {
    id: "4",
    name: "Premium Laundromat - Dallas Area",
    location: "Dallas, TX",
    address: "8350 Park Lane, Dallas, TX 75231",
    revenue: "$19,000/month",
    type: "Laundromat",
    excerpt: "New construction, premium amenities, strong demographic area"
  }
];

export function FeaturedListingsCarousel() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured Laundromat Listings</h2>
            <p className="text-white/70">High-performing businesses ready for acquisition in Dallas, Oklahoma, and Arkansas</p>
          </div>
          <Link href="/laundromat-listings">
            <Button variant="outline" className="gap-2">
              View All Listings <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_LISTINGS.map(listing => (
            <Card key={listing.id} className="bg-white/10 backdrop-blur border-white/20 hover-elevate transition-all group">
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2 text-xs">{listing.type}</Badge>
                <CardTitle className="text-base text-white group-hover:text-accent transition-colors">{listing.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{listing.revenue} revenue</span>
                  </div>
                </div>
                <p className="text-xs text-white/60">{listing.excerpt}</p>
                <div className="space-y-2">
                  <Link href="/laundromat-listings">
                    <Button size="sm" variant="default" className="w-full">View Details</Button>
                  </Link>
                  <Link href={`/cleanbi-explorer?address=${encodeURIComponent(listing.address)}`}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/10"
                      data-testid={`button-cleanbi-analyze-${listing.id}`}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      CLEANBI Score
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
