import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, CheckCircle, Star } from 'lucide-react';
import { SEO } from '@/components/SEO';

const VENDORS = [
  {
    id: '1',
    name: 'American Laundry Solutions',
    category: 'Equipment Manufacturer',
    location: 'Charlotte, NC',
    specialties: ['Washers', 'Dryers', 'Maintenance'],
    rating: 4.9,
    verified: true,
    description: 'Leading manufacturer of commercial laundry equipment with 40+ years industry experience.',
  },
  {
    id: '2',
    name: 'Coin Laundry Parts Direct',
    category: 'Parts & Supplies',
    location: 'Dallas, TX',
    specialties: ['Parts', 'Supplies', 'Emergency Service'],
    rating: 4.8,
    verified: true,
    description: 'Nationwide distributor of laundromat parts and supplies with same-day shipping.',
  },
  {
    id: '3',
    name: 'WashTech Maintenance',
    category: 'Service Provider',
    location: 'Los Angeles, CA',
    specialties: ['Maintenance', 'Repairs', 'Installation'],
    rating: 4.7,
    verified: true,
    description: 'Professional maintenance and repair services for commercial laundromats.',
  },
  {
    id: '4',
    name: 'EcoClean Water Systems',
    category: 'Water Treatment',
    location: 'Denver, CO',
    specialties: ['Water Treatment', 'Recycling', 'Sustainability'],
    rating: 4.9,
    verified: true,
    description: 'Sustainable water treatment and recycling solutions for laundromats.',
  },
  {
    id: '5',
    name: 'Digital Laundry Control',
    category: 'Software & IoT',
    location: 'New York, NY',
    specialties: ['POS Systems', 'IoT Monitoring', 'Payment Processing'],
    rating: 4.8,
    verified: true,
    description: 'Advanced digital solutions for modern laundromat operations.',
  },
  {
    id: '6',
    name: 'Smart Vend Systems',
    category: 'Vending Equipment',
    location: 'Chicago, IL',
    specialties: ['Detergent Vending', 'Fabric Softener', 'Supplies'],
    rating: 4.6,
    verified: true,
    description: 'Integrated vending solutions for laundromat convenience.',
  },
];

const CATEGORIES = [
  'All',
  'Equipment Manufacturer',
  'Parts & Supplies',
  'Service Provider',
  'Water Treatment',
  'Software & IoT',
  'Vending Equipment',
];

export default function VendorsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredVendors = VENDORS.filter(vendor =>
    (selectedCategory === 'All' || vendor.category === selectedCategory) &&
    (vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     vendor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <>
      <SEO
        title="Vendor Directory | Equipment & Services | WashBizHub"
        description="Connect with verified vendors and service providers. Equipment manufacturers, parts suppliers, maintenance services, and more."
        canonicalUrl="/vendors"
        keywords={['laundromat vendors', 'equipment suppliers', 'laundry parts', 'maintenance services', 'laundry equipment']}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
          <div className="mx-auto max-w-5xl px-6">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Partners
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
              Vendor Directory
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl">
              Access vetted equipment manufacturers, parts suppliers, service providers, and technology partners.
            </p>

            {/* Search */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-vendors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <div className="bg-muted/30 border-b sticky top-0 z-20">
          <div className="mx-auto max-w-6xl px-6 py-4 overflow-x-auto">
            <div className="flex gap-2 flex-nowrap">
              {CATEGORIES.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0"
                  data-testid={`button-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="mx-auto max-w-6xl px-6 py-12">
          {filteredVendors.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No vendors match your criteria. Try adjusting your search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map(vendor => (
                <Card key={vendor.id} className="hover-elevate flex flex-col" data-testid={`card-vendor-${vendor.id}`}>
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <CardTitle className="line-clamp-1">{vendor.name}</CardTitle>
                        <CardDescription>{vendor.category}</CardDescription>
                      </div>
                      {vendor.verified && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" data-testid={`badge-verified-${vendor.id}`} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {vendor.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {vendor.specialties.map(specialty => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{vendor.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {vendor.location}
                      </span>
                    </div>
                    <Button className="w-full hover-elevate active-elevate-2 mt-2" data-testid={`button-contact-${vendor.id}`}>
                      Contact Vendor
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
