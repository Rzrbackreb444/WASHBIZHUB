import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShoppingCart, Package, Zap, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PARTS_CATEGORIES = [
  {
    id: 'washers',
    name: 'Washers & Extraction',
    icon: '🌊',
    products: [
      { id: 1, name: 'Commercial Front-Load Washer (40lb)', price: 3499, asin: 'B0123456789', vendor: 'Speed Queen', image: 'https://via.placeholder.com/200?text=Washer' },
      { id: 2, name: 'Heavy-Duty Top-Load (50lb)', price: 2899, asin: 'B0123456790', vendor: 'Dexter', image: 'https://via.placeholder.com/200?text=TopLoad' },
    ],
  },
  {
    id: 'dryers',
    name: 'Dryers & Tumblers',
    icon: '🔥',
    products: [
      { id: 3, name: 'Commercial Gas Dryer (75lb)', price: 2299, asin: 'B0123456791', vendor: 'Speed Queen', image: 'https://via.placeholder.com/200?text=Dryer' },
      { id: 4, name: 'Electric Dryer (60lb)', price: 1899, asin: 'B0123456792', vendor: 'Huebsch', image: 'https://via.placeholder.com/200?text=Electric' },
    ],
  },
  {
    id: 'carts',
    name: 'Carts & Baskets',
    icon: '🛒',
    products: [
      { id: 5, name: 'Heavy-Duty Laundry Cart (stainless)', price: 149, asin: 'B0123456793', vendor: 'Rubbermaid', image: 'https://via.placeholder.com/200?text=Cart' },
      { id: 6, name: 'Industrial Rolling Basket', price: 89, asin: 'B0123456794', vendor: 'Wesco', image: 'https://via.placeholder.com/200?text=Basket' },
    ],
  },
  {
    id: 'tables',
    name: 'Folding Tables & Seating',
    icon: '🪑',
    products: [
      { id: 7, name: 'Commercial Folding Table (6ft)', price: 199, asin: 'B0123456795', vendor: 'Lifetime', image: 'https://via.placeholder.com/200?text=Table' },
      { id: 8, name: 'Heavy-Duty Fold-Up Bench', price: 129, asin: 'B0123456796', vendor: 'Cosco', image: 'https://via.placeholder.com/200?text=Bench' },
    ],
  },
  {
    id: 'dog-wash',
    name: 'Dog Wash Stations',
    icon: '🐕',
    products: [
      { id: 9, name: 'Self-Service Dog Wash (complete system)', price: 4499, asin: 'B0123456797', vendor: 'Happy Tails', image: 'https://via.placeholder.com/200?text=DogWash' },
      { id: 10, name: 'Elevated Pet Grooming Tub', price: 599, asin: 'B0123456798', vendor: 'Pro-Groom', image: 'https://via.placeholder.com/200?text=Tub' },
    ],
  },
  {
    id: 'soap',
    name: 'Soap & Supply Machines',
    icon: '🧼',
    products: [
      { id: 11, name: 'Detergent Vending Machine', price: 799, asin: 'B0123456799', vendor: 'eClean', image: 'https://via.placeholder.com/200?text=Soap' },
      { id: 12, name: 'Fabric Softener Dispenser', price: 349, asin: 'B0123456800', vendor: 'Smart Vend', image: 'https://via.placeholder.com/200?text=Dispenser' },
    ],
  },
  {
    id: 'coin-changers',
    name: 'Coin & Bill Changers',
    icon: '💰',
    products: [
      { id: 13, name: 'Bill Changer ($1-$100)', price: 1299, asin: 'B0123456801', vendor: 'Mars Inc', image: 'https://via.placeholder.com/200?text=BillChanger' },
      { id: 14, name: 'Coin Acceptor (multi-coin)', price: 299, asin: 'B0123456802', vendor: 'JCM', image: 'https://via.placeholder.com/200?text=CoinAcceptor' },
    ],
  },
];

const PARTS_FAQS = [
  {
    question: "Where can I find laundromat parts?",
    answer: "Laundromat parts are available through multiple channels: 1) Manufacturer distributors like Alliance Laundry Systems (Speed Queen/Huebsch), Dexter Laundry, and Maytag Commercial, 2) Online marketplaces including Amazon and specialized sites like WashBizHub Parts Catalogue, 3) Local appliance parts suppliers, 4) Used equipment dealers for discontinued parts. For genuine OEM parts, always verify the part number matches your machine's model and serial number."
  },
  {
    question: "What are the most common washer and dryer replacement parts?",
    answer: "The most frequently replaced laundromat parts include: bearings and seals (typically $50-200), door latches and locks ($25-75), belts ($15-50), drain pumps ($75-200), heating elements for dryers ($50-150), coin mechanisms and acceptors ($100-300), control boards ($200-600), and water inlet valves ($30-80). Regular maintenance can extend the life of these components significantly."
  },
  {
    question: "Where can I buy Speed Queen parts?",
    answer: "Speed Queen parts are available through: 1) Authorized Alliance Laundry Systems distributors (the official channel), 2) Online retailers like Amazon with the 'nicholaskreme-20' affiliate tag for discounts, 3) Parts warehouses specializing in commercial laundry, 4) WashBizHub Parts Catalogue for curated selection. For warranty coverage, purchase from authorized distributors. Common Speed Queen parts include door locks, coin slides, bearings, and control boards."
  },
  {
    question: "How do I find the right replacement parts for my commercial washer?",
    answer: "To find correct replacement parts: 1) Locate your machine's model and serial number (usually on a plate inside the door or on the back), 2) Use the manufacturer's parts lookup tool or call their parts department, 3) Cross-reference with your maintenance manual, 4) Consult with a qualified technician if unsure. Never use residential parts in commercial machines as they won't withstand the usage demands."
  },
  {
    question: "What Dexter laundry parts are available?",
    answer: "Dexter Laundry offers a full range of OEM parts including: T-Series washer and dryer components, door assemblies and seals, control boards and touchpads, heating elements, motors and bearings, coin mechanisms, and Express technology components. Parts are available through Dexter distributors, authorized service providers, and online marketplaces. Dexter also offers DexterLive diagnostics to help identify failing parts."
  },
  {
    question: "How much do laundromat equipment parts typically cost?",
    answer: "Laundromat parts pricing varies by type: Simple components (belts, hoses, door parts): $15-75. Medium repairs (pumps, valves, heating elements): $50-200. Major components (motors, bearings, drums): $150-500. Control systems (boards, touchpads): $200-800. Complete coin mechanisms: $200-500. Budget 2-5% of equipment value annually for parts and maintenance to keep machines running optimally."
  },
  {
    question: "Can I use aftermarket parts in my commercial laundry equipment?",
    answer: "While aftermarket parts are often cheaper (30-50% less than OEM), consider: 1) Warranty implications - using non-OEM parts may void equipment warranty, 2) Quality concerns - aftermarket parts may fail sooner, 3) Compatibility issues - not all aftermarket parts fit correctly, 4) Safety - electrical and heating components should be OEM or UL-listed. For critical components like control boards and safety switches, OEM parts are recommended."
  },
  {
    question: "What laundromat maintenance supplies do I need?",
    answer: "Essential laundromat maintenance supplies include: cleaning agents (stainless steel cleaner, descaler, drum cleaner), lubricants (bearing grease, door hinge oil), replacement consumables (lint screens, drain filters), tools (coin mechanism keys, specialty wrenches), and diagnostic equipment. Stock commonly needed parts like door handles, coin slides, and drain pump screens for quick repairs that minimize downtime."
  }
];

const PARTS_HOWTO = {
  name: "How to Find and Order Laundromat Replacement Parts",
  description: "Step-by-step guide to identifying, sourcing, and ordering the correct replacement parts for your commercial laundry equipment.",
  steps: [
    {
      name: "Identify the Part Needed",
      text: "Determine exactly which part has failed by observing symptoms, checking error codes, or consulting a technician. Common failure signs include strange noises, leaks, error codes on display, or machine not completing cycles."
    },
    {
      name: "Find Your Machine's Model Information",
      text: "Locate the model and serial number plate on your equipment. For washers, check inside the door frame. For dryers, check inside the door or on the back panel. Record the full model number, serial number, and manufacture date."
    },
    {
      name: "Look Up the Correct Part Number",
      text: "Use the manufacturer's parts lookup tool, your equipment manual, or contact the manufacturer's parts department. Cross-reference the part number with your model to ensure compatibility."
    },
    {
      name: "Compare Suppliers and Pricing",
      text: "Check multiple sources: manufacturer distributors for warranty parts, Amazon for convenience (use affiliate tag nicholaskreme-20), specialized commercial laundry parts suppliers, and local distributors for same-day availability."
    },
    {
      name: "Verify OEM vs Aftermarket",
      text: "Decide between OEM (Original Equipment Manufacturer) parts that guarantee compatibility and warranty compliance, or aftermarket parts that may be cheaper but carry more risk. For safety-critical components, always use OEM."
    },
    {
      name: "Place Your Order",
      text: "Order through your chosen supplier. Consider expedited shipping if the machine is down. Keep records of part numbers and invoices for warranty claims and tax purposes. WashBizHub Parts Catalogue offers one-click Amazon ordering."
    },
    {
      name: "Install or Schedule Service",
      text: "For simple parts like door handles or lint screens, DIY installation may be appropriate. For electrical, plumbing, or complex mechanical parts, schedule a qualified technician to ensure proper installation and safety."
    }
  ],
  totalTime: "PT2H"
};

export default function PartsCatalogue() {
  const [selectedCategory, setSelectedCategory] = useState('washers');
  const [searchQuery, setSearchQuery] = useState('');

  const category = PARTS_CATEGORIES.find(c => c.id === selectedCategory);
  const filteredProducts = category?.products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAmazonOrder = (product: any) => {
    const affiliateUrl = `https://amazon.com/s?k=${encodeURIComponent(product.name)}&tag=nicholaskreme-20`;
    window.open(affiliateUrl, '_blank');
  };

  return (
    <>
      <SEO
        title="Laundromat Parts & Equipment Catalogue | Commercial Washer & Dryer Parts"
        description="Complete laundromat parts catalogue with instant ordering. Speed Queen parts, Dexter parts, commercial washer replacement parts, dryer components, coin changers, and maintenance supplies."
        canonicalUrl="/parts-catalogue"
        keywords={[
          'laundromat parts',
          'washer dryer replacement parts',
          'Speed Queen parts',
          'Dexter laundry parts',
          'commercial washer parts',
          'coin laundry parts',
          'laundry equipment parts',
          'commercial dryer parts',
          'Huebsch parts',
          'Maytag commercial parts',
          'laundromat maintenance supplies',
          'coin changer parts',
          'washer bearings',
          'dryer heating elements',
          'laundromat equipment catalogue'
        ]}
        faqs={PARTS_FAQS}
        howTo={PARTS_HOWTO}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Parts Catalogue", url: "/parts-catalogue" }
        ]}
        author={{
          name: "WashBizHub Technical Team",
          expertise: "Commercial Laundry Equipment Specialists",
          credentials: "25+ years combined experience in laundromat equipment maintenance and parts sourcing"
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Home", url: "/" },
              { name: "Parts Catalogue", url: "/parts-catalogue" }
            ]} />
          </div>
        </div>

        <div className="bg-background text-foreground py-12 border-b">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Parts Catalogue</h1>
            </div>
            <p className="text-muted-foreground">Complete inventory of equipment, supplies, and accessories for laundromats</p>
            <Badge className="mt-4 bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Amazon Affiliate Integrated • Free Shipping on Bulk Orders
            </Badge>
          </div>
        </div>

        <div className="bg-muted/30 border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search parts by name or vendor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-parts"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
              {PARTS_CATEGORIES.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs" data-testid={`tab-category-${cat.id}`}>
                  <span className="mr-1">{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {PARTS_CATEGORIES.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{cat.icon} {cat.name}</h2>
                  <p className="text-muted-foreground">
                    {filteredProducts.length === 0 ? 'No products match your search.' : `${filteredProducts.length} products available`}
                  </p>
                </div>

                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No products found. Try a different search.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                      <Card key={product.id} className="hover-elevate flex flex-col" data-testid={`card-product-${product.id}`}>
                        <div
                          className="h-40 bg-cover bg-center"
                          style={{ backgroundImage: `url(${product.image})` }}
                        />
                        <CardHeader className="flex-1">
                          <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
                          <CardDescription>{product.vendor}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">${product.price.toLocaleString()}</span>
                            <Badge variant="outline">ASIN: {product.asin.slice(-6)}</Badge>
                          </div>
                          <Button
                            onClick={() => handleAmazonOrder(product)}
                            className="w-full hover-elevate active-elevate-2"
                            data-testid={`button-amazon-order-${product.id}`}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Order on Amazon
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 border-t">
          <h2 className="text-2xl font-bold mb-6">Why Our Catalogue?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <DollarSign className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">Affiliate Pricing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                All products through Amazon with nicholaskreme-20 affiliate tag. You earn commissions on every purchase.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">Verified Vendors</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Curated selection of trusted manufacturers and suppliers with proven track records in the laundromat industry.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">One-Click Ordering</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Seamless integration with Amazon ordering. Bulk discounts available through Amazon Business.
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="bg-muted/30 border-t">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {PARTS_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </>
  );
}
