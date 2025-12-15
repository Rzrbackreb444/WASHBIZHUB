import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  MapPin, TrendingUp, Search, ArrowRight, Building2, DollarSign
} from "lucide-react";
import { STATE_DATA } from "@/data/state-laundromat-data";

export default function StatesDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const states = Object.entries(STATE_DATA);
  const filteredStates = states.filter(([_, data]) => 
    data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.abbr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalListings = states.reduce((acc, [_, data]) => 
    acc + parseInt(data.laundromatCount.replace(/\D/g, '')), 0
  );

  const pageTitle = "Laundromats for Sale by State | All 50 States | WashBizHub";
  const pageDescription = `Find laundromats for sale in all 50 US states. ${totalListings}+ active listings with CLEANBI scores, valuation tools, and market data. Browse by state to find your perfect investment opportunity.`;

  const statesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Laundromats for Sale by State",
    "description": pageDescription,
    "numberOfItems": 50,
    "itemListElement": states.slice(0, 20).map(([slug, data], i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://washbizhub.com/laundromats-for-sale/${slug}`,
      "name": `Laundromats for Sale in ${data.name}`
    }))
  };

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://washbizhub.com/laundromats-for-sale"
        keywords={[
          "laundromats for sale",
          "coin laundry for sale",
          "buy laundromat",
          "laundromat investment",
          "laundry business for sale",
          ...states.slice(0, 10).map(([_, d]) => `laundromat for sale ${d.name}`)
        ]}
      />
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(statesSchema) }} />

      <div className="min-h-screen bg-background">
        <header className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Building2 className="w-3 h-3 mr-1" /> {totalListings.toLocaleString()}+ Active Listings
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Laundromats for Sale by State
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Explore laundromat investment opportunities across all 50 US states. 
              Each state page includes market data, recent sales, CLEANBI scores, and expert insights.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search states..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-states"
              />
            </div>
          </div>
        </header>

        <section className="py-12 container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStates.map(([slug, data]) => (
              <Link key={slug} href={`/laundromats-for-sale/${slug}`}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group" data-testid={`card-state-${slug}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {data.name}
                        </h2>
                        <Badge variant="secondary" className="mt-1">{data.abbr}</Badge>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Listings
                        </span>
                        <span className="font-medium">{data.laundromatCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Avg. Price
                        </span>
                        <span className="font-medium">{data.avgSalePrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Growth
                        </span>
                        <span className="font-medium text-green-500">{data.marketGrowth}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        Top: {data.topCities.slice(0, 3).join(", ")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredStates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No states found matching "{searchQuery}"</p>
              <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Find Your Laundromat?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Use our free CLEANBI score calculator to analyze any address, 
              or browse our marketplace for active listings.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/cleanbi-auto">Get Free CLEANBI Score</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/laundromat-listings">Browse All Listings</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
