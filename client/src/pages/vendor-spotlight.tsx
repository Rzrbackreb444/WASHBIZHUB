import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Star, Zap, Award, TrendingUp } from 'lucide-react';
import { SEO } from '@/components/SEO';

const SPOTLIGHT_VENDORS = [
  {
    id: '1',
    name: 'Speed Queen Commercial',
    category: 'Equipment Manufacturer',
    description: 'Industry-leading washers and dryers for commercial laundromats. Premium quality, highest durability ratings.',
    logo: 'https://via.placeholder.com/100',
    rating: 4.9,
    reviews: 287,
    badge: 'Gold Partner',
    featured: true,
    productCount: 12,
  },
  {
    id: '2',
    name: 'eClean Solutions',
    category: 'Parts & Supplies',
    description: 'Complete parts supplier for maintenance and repairs. Fast shipping, competitive pricing, expert support.',
    logo: 'https://via.placeholder.com/100',
    rating: 4.8,
    reviews: 156,
    badge: 'Verified Distributor',
    featured: true,
    productCount: 89,
  },
  {
    id: '3',
    name: 'Detergent Pro',
    category: 'Supplies & Chemicals',
    description: 'Commercial-grade detergents optimized for laundromat equipment. Bulk discounts available.',
    logo: 'https://via.placeholder.com/100',
    rating: 4.7,
    reviews: 203,
    badge: 'Trusted Supplier',
    featured: true,
    productCount: 24,
  },
  {
    id: '4',
    name: 'LaundroTech Services',
    category: 'Maintenance & Support',
    description: '24/7 technical support for equipment issues. Preventive maintenance programs and emergency repairs.',
    logo: 'https://via.placeholder.com/100',
    rating: 4.9,
    reviews: 312,
    badge: 'Gold Partner',
    featured: true,
    productCount: 5,
  },
  {
    id: '5',
    name: 'NextGen Coin Systems',
    category: 'Payment Systems',
    description: 'Modern payment solutions: contactless, mobile pay, and traditional coin/card systems integrated.',
    logo: 'https://via.placeholder.com/100',
    rating: 4.6,
    reviews: 178,
    badge: 'Innovative',
    featured: true,
    productCount: 18,
  },
  {
    id: '6',
    name: 'Laundromat Academy',
    category: 'Education & Training',
    description: 'Comprehensive online courses for laundromat operators. Expert instructors, lifetime access to materials.',
    logo: 'https://via.placeholder.com/100',
    rating: 5.0,
    reviews: 542,
    badge: 'Top Rated',
    featured: true,
    productCount: 8,
  },
];

export default function VendorSpotlight() {
  return (
    <>
      <SEO
        title="Vendor Spotlight | Featured Suppliers & Partners | WashBizHub"
        description="Premium laundromat suppliers, equipment manufacturers, and service providers. Browse verified vendors with ratings and reviews."
        canonicalUrl="/vendor-spotlight"
        keywords={['laundromat suppliers', 'equipment vendors', 'service providers', 'commercial partners', 'verified vendors']}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white py-12 border-b border-purple-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Vendor Spotlight</h1>
            </div>
            <p className="text-purple-200">Premium suppliers and partners • Featured vendors • Verified ratings</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Featured Vendors Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2">Featured Partners</h2>
            <p className="text-muted-foreground mb-6">Our most trusted and highest-rated vendors</p>

            <div className="grid md:grid-cols-3 gap-6">
              {SPOTLIGHT_VENDORS.slice(0, 3).map(vendor => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
                  <Card className="hover-elevate h-full cursor-pointer" data-testid={`card-spotlight-${vendor.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-16 h-16 bg-muted rounded-lg" style={{ backgroundImage: `url(${vendor.logo})` }} />
                        <Badge className="bg-amber-500/20 text-amber-600">
                          <Star className="w-3 h-3 mr-1" />
                          {vendor.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{vendor.name}</CardTitle>
                      <CardDescription>{vendor.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{vendor.description}</p>

                      <div className="flex items-center justify-between py-2 border-t">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{vendor.rating}</span>
                          <span className="text-xs text-muted-foreground">({vendor.reviews} reviews)</span>
                        </div>
                        <Badge variant="outline">{vendor.productCount} products</Badge>
                      </div>

                      <Button className="w-full" size="sm" data-testid={`button-view-vendor-${vendor.id}`}>
                        Visit Store
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* All Vendors */}
          <div>
            <h2 className="text-2xl font-bold mb-6">All Featured Vendors</h2>
            <div className="space-y-3">
              {SPOTLIGHT_VENDORS.map(vendor => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`card-vendor-row-${vendor.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold">{vendor.name}</h4>
                            <p className="text-sm text-muted-foreground">{vendor.category}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-right">
                            <span className="text-sm font-bold">{vendor.rating}</span>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">({vendor.reviews})</span>
                          </div>
                          <Badge variant="outline" className="whitespace-nowrap">
                            {vendor.productCount} products
                          </Badge>
                          <Button variant="outline" size="sm" data-testid={`button-vendor-view-${vendor.id}`}>
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Are You a Vendor?</h2>
            <p className="mb-6">Join our network of 1,000+ suppliers serving 72,000+ laundromat owners</p>
            <Link href="/vendor-form">
              <Button className="bg-white text-blue-900 hover:bg-blue-50" data-testid="button-become-vendor">
                List Your Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
