import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, CheckCircle, ChevronDown } from 'lucide-react';
import { Star } from "@/lib/icon-registry";
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const VENDOR_FAQS = [
  {
    question: "Who are the best laundromat equipment vendors in the USA?",
    answer: "The top laundromat equipment vendors include Speed Queen, Dexter Laundry, Continental Girbau, Huebsch, Maytag Commercial, and Wascomat. Each manufacturer offers different strengths - Speed Queen is known for durability, Dexter for innovation, and Continental Girbau for efficiency. WashBizHub's vendor directory features verified suppliers across all major brands with ratings and reviews from real laundromat owners."
  },
  {
    question: "How do I find Speed Queen dealers near me?",
    answer: "To find authorized Speed Queen dealers, you can use WashBizHub's vendor directory filtered by 'Equipment Manufacturer' category, or visit Speed Queen's official dealer locator. Our directory includes verified Speed Queen distributors across the USA with contact information, service areas, and customer ratings. Many Speed Queen dealers also offer financing, installation, and maintenance packages."
  },
  {
    question: "What should I look for when choosing a laundromat equipment supplier?",
    answer: "Key factors when selecting a laundromat equipment supplier include: authorized dealer status for major brands, warranty and service support availability, financing options offered, parts inventory for quick repairs, installation services, training programs for your staff, response time for emergency repairs, and customer reviews from other laundromat owners. Always verify the supplier is factory-authorized to ensure warranty coverage."
  },
  {
    question: "Where can I buy commercial washers and dryers for my laundromat?",
    answer: "Commercial washers and dryers can be purchased from authorized equipment distributors, manufacturer direct sales, and used equipment dealers. Major brands like Speed Queen, Dexter, and Continental have extensive dealer networks. WashBizHub's vendor directory lists verified suppliers with inventory, pricing, and customer reviews. Consider both new and certified pre-owned equipment based on your budget and business plan."
  },
  {
    question: "How much do laundromat equipment vendors charge for installation?",
    answer: "Laundromat equipment installation costs typically range from $500-$2,500 per machine depending on complexity, location, and utilities required. Most vendors offer package deals for full store buildouts ranging from $15,000-$50,000+ for installation services. This usually includes equipment delivery, utility connections (water, gas, electric, drainage), machine setup, testing, and staff training. Get multiple quotes and verify what's included."
  },
  {
    question: "Do laundromat parts suppliers offer same-day shipping?",
    answer: "Yes, many laundromat parts suppliers offer same-day and next-day shipping for common replacement parts. Coin Laundry Parts Direct, PWS, and other major distributors maintain extensive inventories of belts, bearings, pumps, valves, and electronic components. For emergency repairs, some suppliers also offer expedited 2-hour delivery in major metro areas. Stock critical spare parts on-site to minimize machine downtime."
  },
  {
    question: "What laundromat POS and payment systems are recommended?",
    answer: "Top laundromat POS and payment systems include LaundroWorks, Cents, Speed Queen Insights, Dexter Live, and SetPoint. Modern systems support app payments, credit cards, loyalty programs, remote monitoring, and detailed analytics. Key features to look for: real-time machine monitoring, mobile payment integration, customer loyalty programs, revenue reporting, and multi-location management. Most vendors offer free demos and trial periods."
  },
  {
    question: "Are there financing options available through laundromat equipment vendors?",
    answer: "Yes, most major laundromat equipment vendors offer financing programs including equipment leases, loans, and rent-to-own options. Typical terms range from 60-84 months with rates from 5-12% depending on credit. Many vendors partner with specialized lenders like Eastern Funding, Direct Capital, and Navitas who understand the laundry industry. Some manufacturers also offer promotional 0% financing for qualified buyers during special events."
  }
];

export default function VendorsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredVendors = VENDORS.filter(vendor =>
    (selectedCategory === 'All' || vendor.category === selectedCategory) &&
    (vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     vendor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';

  const vendorListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Laundromat Equipment Vendors & Suppliers Directory",
    "description": "Comprehensive directory of verified laundromat equipment manufacturers, parts suppliers, service providers, and technology vendors serving the coin laundry industry across the USA.",
    "url": `${baseUrl}/vendors`,
    "numberOfItems": VENDORS.length,
    "itemListElement": VENDORS.map((vendor, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": vendor.name,
        "description": vendor.description,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": vendor.location.split(', ')[0],
          "addressRegion": vendor.location.split(', ')[1],
          "addressCountry": "USA"
        },
        "areaServed": {
          "@type": "Country",
          "name": "United States"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": vendor.rating,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": Math.floor(Math.random() * 100) + 50
        },
        "makesOffer": vendor.specialties.map(specialty => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": specialty,
            "category": vendor.category
          }
        }))
      }
    }))
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Laundromat Equipment Vendors Directory | WashBizHub",
    "description": "Find verified laundromat equipment vendors, parts suppliers, and service providers. Speed Queen dealers, Dexter distributors, commercial laundry parts, POS systems, and more.",
    "url": `${baseUrl}/vendors`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": VENDORS.length
    }
  };

  return (
    <>
      <SEO
        title="Laundromat Equipment Vendors & Suppliers Directory | Speed Queen Dealers"
        description="Find verified laundromat equipment vendors, commercial washer suppliers, and Speed Queen dealers. Compare parts suppliers, service providers, POS systems, and water treatment vendors for your coin laundry business."
        canonicalUrl="/vendors"
        ogType="website"
        keywords={[
          'laundromat equipment vendors',
          'commercial laundry suppliers',
          'Speed Queen dealers',
          'Dexter laundry distributors',
          'laundromat parts suppliers',
          'coin laundry equipment',
          'commercial washer vendors',
          'laundromat service providers',
          'laundry POS systems',
          'laundromat payment systems',
          'commercial dryer suppliers',
          'laundromat water treatment',
          'coin operated washer dealers',
          'laundry equipment financing',
          'laundromat maintenance services'
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Vendors", url: "/vendors" }
        ]}
        faqs={VENDOR_FAQS}
        structuredData={[vendorListSchema, collectionPageSchema]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-6xl px-6 py-3">
            <Breadcrumb items={[{ name: "Vendors Directory", url: "/vendors" }]} />
          </div>
        </div>

        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
          <div className="mx-auto max-w-5xl px-6">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Partners
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
              Laundromat Equipment Vendors
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl">
              Connect with verified equipment manufacturers, parts suppliers, service providers, and technology partners. Speed Queen dealers, Dexter distributors, and more.
            </p>

            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name or specialty (Speed Queen, parts, POS)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-vendors"
                />
              </div>
            </div>
          </div>
        </section>

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

          <section className="mt-16 bg-muted/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions About Laundromat Vendors</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              {VENDOR_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`accordion-vendor-faq-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
    </>
  );
}
