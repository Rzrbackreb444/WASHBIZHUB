import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Phone, Mail, Share2, Heart } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ListingLocationMap } from '@/components/maps/ListingLocationMap';

export default function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();

  // Mock data
  const listing = {
    id: listingId,
    title: 'Premium Northeast Philadelphia Laundromat',
    price: 450000,
    location: 'Northeast Philadelphia, PA',
    description: 'Well-established laundromat with 32 machines in high-traffic location. Strong customer base with repeat customers.',
    images: ['https://via.placeholder.com/600x400'],
    latitude: 39.9526,
    longitude: -75.1652,
    equipment: [
      { type: 'Washers', count: 16, brand: 'Speed Queen' },
      { type: 'Dryers', count: 16, brand: 'Speed Queen' },
    ],
    contact: {
      name: 'John Doe',
      phone: '215-555-1234',
      email: 'john@example.com',
    },
  };

  return (
    <>
      <SEO
        title={`${listing.title} | Laundromat for Sale | WashBizHub`}
        description={listing.description.substring(0, 160)}
        canonicalUrl={`/listings/${listingId}`}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Image */}
        <div className="w-full h-96 bg-cover bg-center" style={{ backgroundImage: `url(${listing.images[0]})` }} />

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-8 -mt-20 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">{listing.title}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        {listing.location}
                      </div>
                      <div className="text-3xl font-bold text-primary mb-4">
                        ${listing.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" data-testid="button-favorite">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" data-testid="button-share">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">About This Business</h3>
                    <p className="text-muted-foreground">{listing.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Equipment</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {listing.equipment.map(eq => (
                        <Card key={eq.type} className="bg-muted/50">
                          <CardContent className="pt-4">
                            <div className="font-semibold">{eq.count}x {eq.type}</div>
                            <div className="text-sm text-muted-foreground">{eq.brand}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Maps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location & Directions
                  </CardTitle>
                  <CardDescription>
                    View on map, get directions, and see distance from WashBizHub HQ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                    <ListingLocationMap
                      latitude={listing.latitude}
                      longitude={listing.longitude}
                      title={listing.title}
                      address={listing.location}
                      price={`$${listing.price.toLocaleString()}`}
                      showHQ={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    📍 {listing.location}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Contact Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20" data-testid="card-contact">
                <CardHeader>
                  <CardTitle className="text-lg">Contact Seller</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold">{listing.contact.name}</p>
                    <Badge className="mt-2" variant="outline">
                      Verified Seller
                    </Badge>
                  </div>

                  <Button className="w-full" size="lg" data-testid="button-call">
                    <Phone className="w-4 h-4 mr-2" />
                    {listing.contact.phone}
                  </Button>

                  <Button className="w-full" size="lg" variant="outline" data-testid="button-email">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>

                  <Button className="w-full" size="lg" variant="outline" data-testid="button-inquiry">
                    Ask a Question
                  </Button>

                  <div className="border-t pt-4 text-sm text-muted-foreground">
                    <p className="mb-2">Response time: Usually within 2 hours</p>
                    <p>Safety tip: Meet in a public place. Never send money in advance.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
