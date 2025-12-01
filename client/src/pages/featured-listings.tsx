import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { MapPin, DollarSign, TrendingUp, Zap, Star } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const LISTING_FAQS = [
  {
    question: "How much does a laundromat cost to buy?",
    answer: "Laundromats typically sell for 2-4x annual net operating income (NOI), with average purchase prices ranging from $200,000 to $1,000,000+. Factors affecting price include location, equipment age, lease terms, revenue, and profit margins. Small neighborhood laundromats may start around $100,000-$250,000, while premium locations in major metros can exceed $1.5 million. Use our CLEANBI valuation tool for accurate market pricing."
  },
  {
    question: "Where can I find laundromats for sale near me?",
    answer: "WashBizHub features thousands of laundromats for sale across the USA including New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, and all major markets. Our listings include verified financial data, CLEANBI scores, and direct broker contacts. You can also find laundromats for sale on BizBuySell, LoopNet, and through local business brokers. Set up alerts to be notified of new listings in your target area."
  },
  {
    question: "What is a good ROI for a laundromat investment?",
    answer: "A well-run laundromat typically generates 20-35% cash-on-cash returns, with some achieving 40%+ ROI. Industry averages show 15-25% net profit margins on gross revenue. Key factors affecting ROI include location demographics, equipment efficiency, utility costs, labor expenses, and loan terms. Our CLEANBI analysis helps identify high-performing opportunities with verified financial metrics."
  },
  {
    question: "How do I evaluate a laundromat for sale?",
    answer: "Key due diligence steps include: reviewing 3 years of tax returns and P&L statements, verifying utility bills and lease terms, inspecting equipment condition and age, analyzing local competition, checking foot traffic patterns, reviewing customer demographics, and calculating true valuation multiples. WashBizHub's CLEANBI score analyzes 27+ factors to help you quickly identify quality opportunities."
  },
  {
    question: "Can I buy a laundromat with no money down?",
    answer: "While rare, zero-down laundromat acquisitions are possible through SBA loans (up to 90% financing), seller financing, investor partnerships, or lease-to-own arrangements. Most buyers need 10-30% down payment. Some sellers offer owner financing with 10-20% down to qualified buyers. Consider equipment financing, which may cover 100% of machine costs, reducing your initial capital requirements."
  },
  {
    question: "What makes a laundromat listing 'featured' on WashBizHub?",
    answer: "Featured listings on WashBizHub meet premium criteria including: verified financial statements, CLEANBI scores of B+ or higher, complete equipment inventories, professional photos, responsive broker/seller contacts, and competitive pricing. Featured listings receive priority placement, increased visibility, and are vetted for accuracy. Sellers can apply for featured status when listing their business."
  },
  {
    question: "How long does it take to close on a laundromat purchase?",
    answer: "Typical laundromat transactions close in 60-120 days from offer acceptance. Timeline depends on financing type (SBA loans take 60-90 days, conventional 30-45 days, cash 15-30 days), lease assignment complexity, due diligence findings, and any equipment negotiations. Use our transaction timeline tools and work with experienced laundromat business brokers to streamline the process."
  },
  {
    question: "What financing options are available for buying a laundromat?",
    answer: "Common laundromat financing options include: SBA 7(a) loans (10-25% down, 10-25 year terms), conventional bank loans (20-30% down), equipment financing (covers machines specifically), seller financing (negotiable terms), and private investors. Interest rates range from 6-12% depending on credit, experience, and loan type. WashBizHub partners with lenders specializing in laundromat acquisitions including GoKapital and Eastern Funding."
  }
];

export default function FeaturedListings() {
  const topListings = FEATURED_LISTINGS.slice(0, 3);
  const newListings = [...FEATURED_LISTINGS].sort((a, b) => a.daysListed - b.daysListed).slice(0, 3);
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';

  const listingsItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Featured Laundromats for Sale",
    "description": "Premium laundromat businesses for sale across the USA. Verified financial metrics, CLEANBI scores, and broker contacts for qualified buyers.",
    "url": `${baseUrl}/featured-listings`,
    "numberOfItems": FEATURED_LISTINGS.length,
    "itemListElement": FEATURED_LISTINGS.map((listing, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": listing.title,
        "description": listing.description,
        "offers": {
          "@type": "Offer",
          "price": listing.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "WashBizHub Marketplace"
          }
        },
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Annual Revenue",
            "value": listing.revenue
          },
          {
            "@type": "PropertyValue",
            "name": "Number of Machines",
            "value": listing.machines
          },
          {
            "@type": "PropertyValue",
            "name": "CLEANBI Score",
            "value": listing.cleanbi
          }
        ]
      }
    }))
  };

  const realEstateListingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Featured Laundromats for Sale | Buy a Laundromat | WashBizHub",
    "description": "Browse premium laundromats for sale across the USA. Verified CLEANBI scores, financial data, and direct broker contacts. Find your next laundromat investment.",
    "url": `${baseUrl}/featured-listings`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": FEATURED_LISTINGS.length
    }
  };

  const howToBuySchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Buy a Laundromat",
    "description": "Step-by-step guide to purchasing a laundromat business through WashBizHub marketplace.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Browse Listings",
        "text": "Search featured laundromats for sale filtered by location, price range, and CLEANBI score."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Review Financials",
        "text": "Analyze verified financial data including revenue, expenses, and profit margins using our CLEANBI analysis."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Contact Broker",
        "text": "Connect with the listing broker or seller directly through WashBizHub to schedule a showing."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Conduct Due Diligence",
        "text": "Perform thorough due diligence including equipment inspection, lease review, and competition analysis."
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Secure Financing",
        "text": "Apply for SBA loans, conventional financing, or seller financing through our lending partners."
      },
      {
        "@type": "HowToStep",
        "position": 6,
        "name": "Close Transaction",
        "text": "Complete the purchase with help from experienced laundromat business transaction professionals."
      }
    ],
    "totalTime": "P90D"
  };

  return (
    <>
      <SEO
        title="Laundromats for Sale | Buy a Laundromat Business | Featured Listings"
        description="Browse premium laundromats for sale across the USA. Verified CLEANBI scores, financial metrics, and direct broker contacts. Find coin laundry businesses for sale near you with prices from $200K-$2M+."
        canonicalUrl="/featured-listings"
        ogType="website"
        keywords={[
          'laundromats for sale',
          'buy a laundromat',
          'laundromat for sale near me',
          'coin laundry for sale',
          'laundromat business for sale',
          'laundry business opportunity',
          'laundromat investment',
          'laundromat listings',
          'commercial laundry for sale',
          'how much is a laundromat',
          'laundromat purchase price',
          'laundromat ROI',
          'buy coin laundry business',
          'laundromat acquisition',
          'laundry mat for sale'
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Listings", url: "/listings" },
          { name: "Featured Listings", url: "/featured-listings" }
        ]}
        faqs={LISTING_FAQS}
        howTo={howToBuySchema}
        structuredData={[listingsItemListSchema, realEstateListingSchema, howToBuySchema]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Listings", url: "/listings" },
              { name: "Featured Listings", url: "/featured-listings" }
            ]} />
          </div>
        </div>

        <div className="bg-primary text-primary-foreground py-12 border-b">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Laundromats for Sale</h1>
            </div>
            <p className="text-primary-foreground/80">Premium laundromat businesses for sale across the USA with verified CLEANBI scores and financial data</p>
          </div>
        </div>

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

              <div>
                <h2 className="text-2xl font-bold mb-6">All Featured Laundromats for Sale</h2>
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

          <section className="bg-muted/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions About Buying a Laundromat</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              {LISTING_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`accordion-listing-faq-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="bg-muted text-foreground rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Looking for something specific?</h2>
            <p className="text-muted-foreground mb-6">Browse 1,000+ laundromats for sale or list your own business</p>
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
                  Sell Your Laundromat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
