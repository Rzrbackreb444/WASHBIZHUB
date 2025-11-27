import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { MapPin, DollarSign, TrendingUp, Zap, Star } from 'lucide-react';
import { SEO } from '@/components/SEO';

const FEATURED_LISTINGS = [
  {
    id: '1',
    title: 'Premium Northeast Philadelphia Laundromat - $450K',
    location: 'Northeast Philadelphia, PA',
    price: 450000,
    cleanbi: 'A',
    image: 'https://via.placeholder.com/400x300',
    revenue: '$125K/year',
    machines: 32,
    description: 'High-traffic location with 32 machines, established customer base, strong cash flow.',
    featured: true,
    daysListed: 8,
  },
  {
    id: '2',
    title: 'Modern Downtown Chicago Laundromat - $650K',
    location: 'Downtown Chicago, IL',
    price: 650000,
    cleanbi: 'A',
    image: 'https://via.placeholder.com/400x300',
    revenue: '$185K/year',
    machines: 48,
    description: 'Premium downtown location with newer equipment, high foot traffic, excellent margins.',
    featured: true,
    daysListed: 5,
  },
  {
    id: '3',
    title: 'Austin Texas Multi-Unit Opportunity - $1.2M',
    location: 'Austin, TX',
    price: 1200000,
    cleanbi: 'B',
    image: 'https://via.placeholder.com/400x300',
    revenue: '$350K/year',
    machines: 96,
    description: 'Three locations, established operations, scalable systems, growth potential.',
    featured: true,
    daysListed: 12,
  },
  {
    id: '4',
    title: 'Miami Beach Premium Laundromat - $380K',
    location: 'Miami Beach, FL',
    price: 380000,
    cleanbi: 'A',
    image: 'https://via.placeholder.com/400x300',
    revenue: '$98K/year',
    machines: 28,
    description: 'Tourist destination with year-round high traffic, excellent brand positioning.',
    featured: true,
    daysListed: 15,
  },
  {
    id: '5',
    title: 'Seattle Washington Industrial Complex - $920K',
    location: 'Seattle, WA',
    price: 920000,
    cleanbi: 'B',
    image: 'https://via.placeholder.com/400x300',
    revenue: '$220K/year',
    machines: 64,
    description: 'Industrial area with strong B2B clientele, stable revenue, growth opportunity.',
    featured: true,
    daysListed: 20,
  },
  {
    id: '6',
    title: 'Denver Colorado Modern Facility - $580K',
    location: 'Denver, CO',
    price: 580000,
    cleanbi: 'A',
    image: 'https://via.placeholder.com/400x300',
    revenue: '$155K/year',
    machines: 40,
    description: 'State-of-the-art equipment, mobile app enabled, premium customer experience.',
    featured: true,
    daysListed: 3,
  },
];

export default function FeaturedListings() {
  const topListings = FEATURED_LISTINGS.slice(0, 3);
  const newListings = FEATURED_LISTINGS.sort((a, b) => a.daysListed - b.daysListed).slice(0, 3);

  return (
    <>
      <SEO
        title="Featured Laundromat Listings | Buy or Invest | WashBizHub"
        description="Premium featured laundromat businesses for sale. Top-performing locations across the USA with verified CLEANBI scores and financial data."
        canonicalUrl="/featured-listings"
        keywords={['laundromat for sale', 'business opportunity', 'featured listings', 'laundromat investment', 'commercial real estate']}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-12 border-b">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Featured Listings</h1>
            </div>
            <p className="text-primary-foreground/80">Premium laundromat businesses • Verified metrics • Ready to operate</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="featured" data-testid="tab-featured">
                Top Featured (6)
              </TabsTrigger>
              <TabsTrigger value="recent" data-testid="tab-recent">
                Recently Added (3)
              </TabsTrigger>
            </TabsList>

            {/* Featured Tab */}
            <TabsContent value="featured" className="space-y-8 mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                {topListings.map(listing => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card className="hover-elevate h-full cursor-pointer" data-testid={`card-featured-${listing.id}`}>
                      <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${listing.image})` }} />
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge className="bg-amber-500/20 text-amber-600">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                          <Badge className={listing.cleanbi === 'A' ? 'bg-green-500/20 text-green-600' : 'bg-yellow-500/20 text-yellow-600'}>
                            {listing.cleanbi}
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2 text-lg">{listing.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{listing.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="text-xl font-bold">${(listing.price / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Annual Revenue</p>
                            <p className="text-lg font-bold text-green-600">{listing.revenue}</p>
                          </div>
                        </div>
                        <Button className="w-full" size="sm" data-testid={`button-view-${listing.id}`}>
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* All Featured */}
              <div>
                <h2 className="text-2xl font-bold mb-6">All Featured Opportunities</h2>
                <div className="space-y-3">
                  {FEATURED_LISTINGS.map(listing => (
                    <Link key={listing.id} href={`/listings/${listing.id}`}>
                      <Card className="hover-elevate cursor-pointer" data-testid={`card-row-${listing.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{listing.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {listing.location}
                                </span>
                                <span>{listing.machines} machines</span>
                                <span>{listing.revenue} revenue/year</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">${(listing.price / 1000).toFixed(0)}K</div>
                              <Badge variant="outline" className="mt-2">
                                {listing.cleanbi}
                              </Badge>
                            </div>
                            <Button variant="outline" className="ml-4" data-testid={`button-view-row-${listing.id}`}>
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Recent Tab */}
            <TabsContent value="recent" className="space-y-8 mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                {newListings.map(listing => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card className="hover-elevate h-full cursor-pointer" data-testid={`card-new-${listing.id}`}>
                      <div className="relative">
                        <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${listing.image})` }} />
                        <Badge className="absolute top-2 right-2 bg-blue-500/90">New</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="line-clamp-2 text-lg">{listing.title}</CardTitle>
                        <CardDescription>{listing.daysListed} days ago</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" data-testid={`button-inquire-${listing.id}`}>
                          Inquire Now
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA */}
          <div className="bg-muted text-foreground rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Looking for something specific?</h2>
            <p className="text-muted-foreground mb-6">Browse 1,000+ listings or post your own business for sale</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/listings">
                <Button variant="secondary" data-testid="button-browse-all">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Browse All Listings
                </Button>
              </Link>
              <Link href="/listing-form">
                <Button variant="outline" data-testid="button-create-listing">
                  <Zap className="w-4 h-4 mr-2" />
                  Sell Your Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
