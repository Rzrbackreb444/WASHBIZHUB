import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Star, Zap, Award, TrendingUp } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    url: 'https://speedqueen.com',
    foundedYear: 1908,
    headquarters: 'Ripon, WI, USA',
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
    url: 'https://ecleansolutions.com',
    foundedYear: 2005,
    headquarters: 'Chicago, IL, USA',
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
    url: 'https://detergentpro.com',
    foundedYear: 2010,
    headquarters: 'Dallas, TX, USA',
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
    url: 'https://laundrotechservices.com',
    foundedYear: 2015,
    headquarters: 'Los Angeles, CA, USA',
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
    url: 'https://nextgencoinsystems.com',
    foundedYear: 2018,
    headquarters: 'San Francisco, CA, USA',
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
    url: 'https://laundromatacademy.com',
    foundedYear: 2019,
    headquarters: 'New York, NY, USA',
  },
];

const VENDOR_SPOTLIGHT_FAQS = [
  {
    question: "What are the best laundromat equipment manufacturers in 2025?",
    answer: "The top laundromat equipment manufacturers include Speed Queen (known for durability and reliability), Dexter Laundry (innovation leader with smart connectivity), Continental Girbau (energy efficiency focus), Huebsch (Alliance Laundry Systems brand), Maytag Commercial (household name with commercial line), Wascomat (European engineering), and Electrolux Professional. Each manufacturer excels in different areas - Speed Queen leads in build quality, Dexter in IoT features, and Continental in water/energy savings. Consider your priorities: durability, technology, efficiency, or price point."
  },
  {
    question: "Speed Queen vs Dexter: Which is better for laundromats?",
    answer: "Speed Queen and Dexter are both excellent choices with different strengths. Speed Queen is renowned for exceptional durability (25+ year lifespan), simple controls, and lower long-term maintenance costs. Dexter leads in technology with Dexter Live app integration, advanced diagnostics, and cycle customization. Speed Queen typically has lower upfront costs while Dexter offers better remote monitoring. For traditional coin laundries prioritizing reliability, Speed Queen excels. For tech-forward operations wanting detailed analytics and customer apps, Dexter has the edge. Many successful laundromats mix both brands strategically."
  },
  {
    question: "How do I find authorized laundromat equipment distributors?",
    answer: "Finding authorized distributors ensures warranty protection and genuine parts. Start with manufacturer websites (Speed Queen, Dexter, Continental) which have dealer locators. WashBizHub's vendor directory lists verified distributors with ratings and reviews. Attend industry trade shows like Clean Show and CLA events where distributors exhibit. Join Facebook groups like Laundromat Owners and Coin Laundry Exchange for owner recommendations. Key questions for distributors: Are you factory-authorized? What's your service territory? Do you offer financing? What's your parts inventory and response time for emergency repairs?"
  },
  {
    question: "What should I look for when comparing laundromat equipment suppliers?",
    answer: "Key factors when comparing laundromat equipment suppliers: 1) Authorization status - factory-authorized dealers ensure valid warranties. 2) Service capabilities - local technicians, response time, after-hours support. 3) Parts inventory - stock levels of common replacement parts. 4) Financing options - equipment loans, leases, promotional rates. 5) Installation services - delivery, utility connections, setup, testing. 6) Training programs - operator and staff training included. 7) Customer reviews - ratings from other laundromat owners. 8) Territory coverage - service area for your location. 9) Equipment lines carried - single brand vs multi-brand dealer."
  },
  {
    question: "Which laundromat parts suppliers offer the fastest shipping?",
    answer: "Top laundromat parts suppliers with fast shipping include: PWS (Parts World Solutions) with same-day shipping on orders before 2pm CST, Coin Laundry Parts Direct offering next-day delivery in most areas, Laundry Replacement Parts with 2-hour emergency delivery in major metros, and manufacturer direct parts from Speed Queen and Dexter. For emergency repairs, keep critical spare parts on-site: belts, bearings, door latches, coin mechanisms, and electronic boards for your specific machines. Many suppliers offer subscription programs for regular maintenance parts at discounted rates."
  },
  {
    question: "What are the top-rated laundromat POS and payment system vendors?",
    answer: "Leading laundromat POS and payment system vendors include: Cents (modern app-based with customer loyalty), LaundroWorks (comprehensive management + payments), Speed Queen Insights (integrated with Speed Queen equipment), Dexter Live (seamless Dexter machine integration), SetPoint Systems (flexible multi-brand support), and CleanCloud (wash-dry-fold focused). Key features to compare: mobile payment options, customer app availability, loyalty programs, remote monitoring, multi-location support, reporting/analytics, integration with existing equipment, and monthly fees vs transaction costs. Most offer free demos - test before committing."
  },
  {
    question: "How do I become a preferred vendor partner for laundromats?",
    answer: "To become a preferred laundromat vendor partner: 1) Build industry expertise - understand laundromat operations, pain points, and equipment specifics. 2) Offer competitive pricing with transparent terms. 3) Provide exceptional service - fast response times, knowledgeable support, flexible scheduling. 4) Develop a track record with references from satisfied laundromat owners. 5) Attend industry events (Clean Show, CLA conferences) for networking. 6) Get listed on directories like WashBizHub Vendor Spotlight. 7) Partner with equipment manufacturers for authorized dealer status. 8) Create valuable content (guides, webinars) establishing thought leadership."
  },
  {
    question: "What financing options do laundromat equipment vendors typically offer?",
    answer: "Laundromat equipment vendors offer various financing options: 1) Equipment loans (60-84 month terms, 5-12% rates based on credit) through partners like Eastern Funding, Direct Capital, Navitas. 2) Equipment leases with lower monthly payments and potential tax advantages. 3) Rent-to-own programs for those building credit. 4) Manufacturer promotional financing (0% for 12-24 months during special events). 5) SBA loans through vendor referral networks. 6) In-house financing from larger distributors. Typical requirements: 650+ credit score, 2+ years business history, 10-20% down payment. New entrepreneurs may need personal guarantees or collateral."
  }
];

export default function VendorSpotlight() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';

  const vendorOrganizationListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Featured Laundromat Equipment Vendors & Partners",
    "description": "Curated list of premium laundromat equipment manufacturers, parts suppliers, service providers, and technology vendors. Verified partners with ratings and reviews from the coin laundry industry.",
    "url": `${baseUrl}/vendor-spotlight`,
    "numberOfItems": SPOTLIGHT_VENDORS.length,
    "itemListElement": SPOTLIGHT_VENDORS.map((vendor, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": vendor.name,
        "description": vendor.description,
        "url": vendor.url,
        "foundingDate": vendor.foundedYear.toString(),
        "address": {
          "@type": "PostalAddress",
          "addressLocality": vendor.headquarters.split(', ')[0],
          "addressRegion": vendor.headquarters.split(', ')[1],
          "addressCountry": "USA"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": vendor.rating,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": vendor.reviews
        },
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "minValue": 10,
          "maxValue": 500
        }
      }
    }))
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Vendor Spotlight - Featured Laundromat Suppliers & Partners | WashBizHub",
    "description": "Premium laundromat equipment vendors, parts suppliers, and service providers. Compare Speed Queen vs Dexter, find authorized distributors, and connect with verified industry partners.",
    "url": `${baseUrl}/vendor-spotlight`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": SPOTLIGHT_VENDORS.length
    },
    "about": {
      "@type": "Thing",
      "name": "Laundromat Equipment Vendors",
      "description": "Commercial laundry equipment manufacturers, distributors, parts suppliers, and service providers serving the coin laundry industry."
    }
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Vendor Spotlight | Top Laundromat Equipment Suppliers & Partners",
    "description": "Compare leading laundromat equipment manufacturers including Speed Queen, Dexter, and Continental. Find verified distributors, parts suppliers, and service providers.",
    "url": `${baseUrl}/vendor-spotlight`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "WashBizHub",
      "url": baseUrl
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
        { "@type": "ListItem", "position": 2, "name": "Vendors", "item": `${baseUrl}/vendors` },
        { "@type": "ListItem", "position": 3, "name": "Vendor Spotlight", "item": `${baseUrl}/vendor-spotlight` }
      ]
    }
  };

  return (
    <>
      <SEO
        title="Vendor Spotlight | Speed Queen vs Dexter | Top Laundromat Equipment Suppliers"
        description="Compare leading laundromat equipment manufacturers: Speed Queen, Dexter, Continental, Huebsch. Find authorized distributors, parts suppliers, POS systems, and verified service providers for your coin laundry business."
        canonicalUrl="/vendor-spotlight"
        ogType="website"
        keywords={[
          'laundromat equipment suppliers',
          'commercial laundry distributors',
          'Speed Queen dealer near me',
          'Dexter laundry distributor',
          'Speed Queen vs Dexter',
          'laundromat equipment manufacturers',
          'commercial washer suppliers',
          'coin laundry parts suppliers',
          'laundromat service providers',
          'laundry equipment financing',
          'laundromat POS vendors',
          'commercial dryer manufacturers',
          'laundromat payment systems',
          'authorized laundry equipment dealer',
          'best laundromat equipment brands'
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Vendors", url: "/vendors" },
          { name: "Vendor Spotlight", url: "/vendor-spotlight" }
        ]}
        faqs={VENDOR_SPOTLIGHT_FAQS}
        structuredData={[vendorOrganizationListSchema, collectionPageSchema, webPageSchema]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Vendors", url: "/vendors" },
              { name: "Vendor Spotlight", url: "/vendor-spotlight" }
            ]} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white py-12 border-b border-purple-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Vendor Spotlight</h1>
            </div>
            <p className="text-purple-200">Premium suppliers and partners • Speed Queen, Dexter, Continental & more • Verified ratings</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2">Featured Partners</h2>
            <p className="text-muted-foreground mb-6">Our most trusted and highest-rated laundromat equipment vendors</p>

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

          <section className="mt-16 bg-muted/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions About Laundromat Vendors</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              {VENDOR_SPOTLIGHT_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`accordion-spotlight-faq-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

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
