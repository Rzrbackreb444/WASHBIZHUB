import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, DollarSign, TrendingUp, Phone, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface FeaturedListing {
  id: string;
  name: string;
  location: string;
  state: string;
  image?: string;
  price: string;
  annualRevenue: string;
  netIncome: string;
  rating: number;
  broker: string;
  brokerPhone: string;
  machines: number;
  description: string;
  highlights: string[];
  featured: boolean;
}

const FEATURED_LISTINGS: FeaturedListing[] = [
  {
    id: "newport-beach-1",
    name: "Newport Laundry",
    location: "Newport Beach",
    state: "California",
    price: "$200,000",
    annualRevenue: "$82,753",
    netIncome: "$11,393",
    rating: 4.8,
    broker: "Lawrence Larsen (Laundromat Larry)",
    brokerPhone: "714-390-9969",
    machines: 27,
    description: "Premium opportunity in high-income Orange County location. Unique fluff & fold development potential with graduated lease terms. 20-year lease available for qualified buyers.",
    highlights: [
      "High-income demographic",
      "Fluff & fold expansion ready",
      "Graduated lease to reduce startup costs",
      "Full security/IT infrastructure",
      "PayRange + coin system",
      "Up to 20-year lease term",
    ],
    featured: true,
  },
];

export function FeaturedListings() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-3 mx-auto">Featured Opportunities</Badge>
          <h2 className="text-4xl font-bold mb-3">Premium Laundromat Listings</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Curated opportunities from industry experts with verified financials and professional broker support
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid gap-6">
          {FEATURED_LISTINGS.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover-elevate">
              <div className="grid md:grid-cols-3 gap-0">
                {/* Image/Visual Section */}
                <div className="md:col-span-1 bg-gradient-to-br from-accent/20 to-primary/20 p-6 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{listing.name}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}, {listing.state}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{listing.rating}</span>
                        <span className="text-sm text-muted-foreground">Premium Listing</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Broker: {listing.broker}</p>
                        <p className="text-sm text-accent font-semibold">{listing.brokerPhone}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Active</Badge>
                    </div>
                    <p className="text-muted-foreground mt-3">{listing.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Equipment Value</p>
                        <p className="text-xl font-bold">{listing.price}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Annual Revenue</p>
                        <p className="text-xl font-bold text-green-600">{listing.annualRevenue}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Net Income</p>
                        <p className="text-xl font-bold text-blue-600">{listing.netIncome}</p>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Key Highlights:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {listing.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="outline" className="justify-center">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Equipment Summary */}
                    <div className="bg-muted/30 rounded-lg p-4 border border-muted">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <p className="text-sm font-semibold">Equipment Summary</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {listing.machines} total machines including Dexter washer/dryer lineup, PayRange + coin systems, full camera security network, Wi-Fi infrastructure
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Link href="/laundromat-listings">
                        <Button className="gap-2 flex-1">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" className="gap-2 flex-1">
                        <Phone className="w-4 h-4" />
                        Contact Broker
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Browse All */}
        <div className="text-center mt-12">
          <Link href="/laundromat-listings">
            <Button size="lg" variant="outline" className="gap-2">
              Browse All Listings
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
