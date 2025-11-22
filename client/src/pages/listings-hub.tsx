import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, DollarSign, TrendingUp, Search } from 'lucide-react';
import { SEO } from '@/components/SEO';

const LISTINGS = [
  {
    id: '1',
    title: 'Premium Northeast Philadelphia Laundromat',
    location: 'Northeast Philadelphia, PA',
    price: 450000,
    revenue: 18000,
    cleanbi: 89,
    machines: 32,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'Established Location - College Town',
    location: 'State College, PA',
    price: 350000,
    revenue: 14500,
    cleanbi: 76,
    machines: 24,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'High-Traffic Shopping Center',
    location: 'Pittsburgh, PA',
    price: 550000,
    revenue: 22000,
    cleanbi: 92,
    machines: 40,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c800?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    title: 'Urban Residential District',
    location: 'Philadelphia, PA',
    price: 380000,
    revenue: 16000,
    cleanbi: 82,
    machines: 28,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
];

export default function ListingsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [minCleanBI, setMinCleanBI] = useState(0);

  const filteredListings = LISTINGS.filter(listing => 
    (listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     listing.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
    listing.cleanbi >= minCleanBI
  );

  const getCleanBIColor = (score: number) => {
    if (score >= 85) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <>
      <SEO
        title="Laundromat Listings | Buy/Sell Businesses | CLEANBI Scored | WashBizHub"
        description="Discover vetted laundromat opportunities. Every listing scored with CLEANBI™ (17-factor scoring system) for true business quality assessment."
        canonicalUrl="/listings"
        keywords={['laundromat for sale', 'buy laundromat', 'laundromat listings', 'CLEANBI score', 'laundry business opportunity']}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
          <div className="mx-auto max-w-5xl px-6">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <Building2 className="w-3 h-3 mr-1" />
              Business Opportunities
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
              Premium Laundromat Listings
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl">
              Vetted opportunities scored with CLEANBI™ - our 17-factor quality assessment system.
            </p>

            {/* Search */}
            <div className="max-w-2xl">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location or business name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-listings"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={minCleanBI === 0 ? 'default' : 'outline'}
                  onClick={() => setMinCleanBI(0)}
                  data-testid="button-filter-all-cleanbi"
                  size="sm"
                >
                  All
                </Button>
                <Button 
                  variant={minCleanBI === 70 ? 'default' : 'outline'}
                  onClick={() => setMinCleanBI(70)}
                  data-testid="button-filter-cleanbi-70"
                  size="sm"
                >
                  70+ CLEANBI
                </Button>
                <Button 
                  variant={minCleanBI === 80 ? 'default' : 'outline'}
                  onClick={() => setMinCleanBI(80)}
                  data-testid="button-filter-cleanbi-80"
                  size="sm"
                >
                  80+ CLEANBI
                </Button>
                <Button 
                  variant={minCleanBI === 90 ? 'default' : 'outline'}
                  onClick={() => setMinCleanBI(90)}
                  data-testid="button-filter-cleanbi-90"
                  size="sm"
                >
                  90+ CLEANBI
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        <div className="mx-auto max-w-6xl px-6 py-12">
          {filteredListings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No listings match your criteria. Try adjusting your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredListings.map(listing => (
                <Card key={listing.id} className="hover-elevate overflow-hidden flex flex-col" data-testid={`card-listing-${listing.id}`}>
                  <div 
                    className="h-40 bg-cover bg-center"
                    style={{ backgroundImage: `url(${listing.image})` }}
                  />
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
                      <Badge className={getCleanBIColor(listing.cleanbi)} data-testid={`badge-cleanbi-${listing.id}`}>
                        CLEANBI {listing.cleanbi}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Ask Price</div>
                          <div className="text-lg font-bold flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {(listing.price / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Monthly Revenue</div>
                          <div className="text-lg font-bold flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            ${listing.revenue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Machines</div>
                          <div className="text-lg font-bold">{listing.machines}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Status</div>
                          <Badge variant="outline" className="mt-1">{listing.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full hover-elevate active-elevate-2" data-testid={`button-view-${listing.id}`}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
