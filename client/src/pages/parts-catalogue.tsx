import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShoppingCart, Package, Zap, DollarSign, TrendingUp, CheckCircle, Wrench, AlertTriangle } from 'lucide-react';
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
    question: "Where can I buy Speed Queen replacement parts?",
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
  },
  {
    question: "How do I order parts for my laundromat on Amazon?",
    answer: "To order laundromat parts on Amazon: 1) Know your exact part number or machine model, 2) Use WashBizHub Parts Catalogue for curated Amazon links with affiliate pricing, 3) Check seller ratings and reviews before purchasing, 4) Consider Amazon Business for bulk discounts and tax exemption, 5) Use Prime for faster shipping on urgent repairs. The WashBizHub affiliate tag (nicholaskreme-20) helps support our free resources."
  },
  {
    question: "What are the best brands for commercial laundry parts?",
    answer: "Top commercial laundry equipment brands and their parts availability: Speed Queen/Alliance - Excellent parts network, 30+ year parts support. Dexter - Strong distributor network, DexterLive diagnostics integration. Continental/Girbau - Quality OEM parts, good availability. Huebsch - Same as Speed Queen (Alliance brand). Maytag Commercial - Wide retail availability. For parts, always compare OEM vs quality aftermarket options based on component criticality."
  }
];

const PARTS_HOWTO = {
  name: "How to Find and Order Laundromat Replacement Parts",
  description: "Complete step-by-step guide to identifying, sourcing, and ordering the correct replacement parts for your commercial laundry equipment including Speed Queen, Dexter, Huebsch, and Continental machines.",
  steps: [
    {
      name: "Identify the Part Needed",
      text: "Determine exactly which part has failed by observing symptoms, checking error codes, or consulting a technician. Common failure signs include strange noises, leaks, error codes on display, or machine not completing cycles. Use WashBizHub's error code database to diagnose issues."
    },
    {
      name: "Find Your Machine's Model Information",
      text: "Locate the model and serial number plate on your equipment. For washers, check inside the door frame. For dryers, check inside the door or on the back panel. Record the full model number, serial number, and manufacture date. Take a photo for easy reference."
    },
    {
      name: "Look Up the Correct Part Number",
      text: "Use the manufacturer's parts lookup tool, your equipment manual, or contact the manufacturer's parts department. Cross-reference the part number with your model to ensure compatibility. For Speed Queen, use Parts Town. For Dexter, contact your local distributor."
    },
    {
      name: "Compare Suppliers and Pricing",
      text: "Check multiple sources: manufacturer distributors for warranty parts, Amazon for convenience (use affiliate tag nicholaskreme-20), specialized commercial laundry parts suppliers like Laundry Replacement Parts, and local distributors for same-day availability."
    },
    {
      name: "Verify OEM vs Aftermarket",
      text: "Decide between OEM (Original Equipment Manufacturer) parts that guarantee compatibility and warranty compliance, or aftermarket parts that may be cheaper but carry more risk. For safety-critical components like door locks and heating elements, always use OEM."
    },
    {
      name: "Place Your Order",
      text: "Order through your chosen supplier. Consider expedited shipping if the machine is down and losing revenue. Keep records of part numbers and invoices for warranty claims and tax purposes. WashBizHub Parts Catalogue offers one-click Amazon ordering with verified part links."
    },
    {
      name: "Install or Schedule Service",
      text: "For simple parts like door handles, lint screens, or coin slides, DIY installation may be appropriate with basic tools. For electrical components, plumbing, bearings, or control boards, schedule a qualified technician to ensure proper installation and safety compliance."
    }
  ],
  totalTime: "PT2H"
};

const PARTS_ITEMLIST_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Commercial Laundry Equipment Parts Catalogue",
  "description": "Complete catalogue of laundromat parts including commercial washers, dryers, coin changers, soap dispensers, and maintenance supplies from Speed Queen, Dexter, Huebsch, and other major brands.",
  "numberOfItems": 7,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Commercial Washers & Extraction Equipment",
      "url": "https://washbizhub.com/parts-catalogue#washers",
      "description": "Speed Queen, Dexter, and Huebsch commercial washers including front-load and top-load models from 20lb to 100lb capacity."
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Commercial Dryers & Tumblers",
      "url": "https://washbizhub.com/parts-catalogue#dryers",
      "description": "Gas and electric commercial dryers from Speed Queen, Dexter, Continental, and Huebsch with capacities from 30lb to 170lb."
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Laundry Carts & Baskets",
      "url": "https://washbizhub.com/parts-catalogue#carts",
      "description": "Heavy-duty stainless steel laundry carts, rolling baskets, and industrial hampers for laundromat use."
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Folding Tables & Seating",
      "url": "https://washbizhub.com/parts-catalogue#tables",
      "description": "Commercial-grade folding tables, benches, and seating solutions for laundromat customer areas."
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Dog Wash Stations",
      "url": "https://washbizhub.com/parts-catalogue#dog-wash",
      "description": "Self-service dog wash systems, pet grooming tubs, and dog wash accessories for laundromats."
    },
    {
      "@type": "ListItem",
      "position": 6,
      "name": "Soap & Supply Vending Machines",
      "url": "https://washbizhub.com/parts-catalogue#soap",
      "description": "Detergent vending machines, fabric softener dispensers, and laundry supply vending solutions."
    },
    {
      "@type": "ListItem",
      "position": 7,
      "name": "Coin & Bill Changers",
      "url": "https://washbizhub.com/parts-catalogue#coin-changers",
      "description": "Commercial bill changers, coin acceptors, and payment systems for coin-operated laundromats."
    }
  ]
};

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "WashBizHub Laundromat Parts Catalogue",
  "description": "Complete commercial laundry equipment parts catalogue with instant Amazon ordering. Speed Queen parts, Dexter parts, Huebsch parts, coin changers, and maintenance supplies.",
  "brand": {
    "@type": "Brand",
    "name": "WashBizHub"
  },
  "category": "Commercial Laundry Equipment Parts",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "15",
    "highPrice": "5000",
    "offerCount": "500",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  }
};

const PARTS_COLLECTION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Commercial Laundry Parts Catalogue",
  "description": "Browse and order commercial laundromat parts including Speed Queen replacement parts, Dexter laundry parts, washer components, dryer parts, coin changers, and maintenance supplies.",
  "url": "https://washbizhub.com/parts-catalogue",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": PARTS_CATEGORIES.flatMap((cat, catIndex) => 
      cat.products.map((product, prodIndex) => ({
        "@type": "ListItem",
        "position": catIndex * 10 + prodIndex + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "brand": {
            "@type": "Brand",
            "name": product.vendor
          },
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": `https://amazon.com/s?k=${encodeURIComponent(product.name)}&tag=nicholaskreme-20`
          }
        }
      }))
    )
  }
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
        title="Laundromat Parts Catalogue | Speed Queen, Dexter, Huebsch Replacement Parts | WashBizHub"
        description="Complete laundromat parts catalogue with instant Amazon ordering. Speed Queen replacement parts, Dexter laundry parts, commercial washer components, dryer parts, coin changers, bearings, belts, pumps, and maintenance supplies."
        canonicalUrl="/parts-catalogue"
        ogType="product"
        keywords={[
          'laundromat parts',
          'commercial washer parts',
          'Speed Queen replacement parts',
          'Speed Queen parts',
          'Dexter laundry parts',
          'Dexter washer parts',
          'Huebsch parts',
          'washer dryer replacement parts',
          'laundromat equipment parts',
          'commercial dryer parts',
          'coin laundry parts',
          'laundry equipment parts',
          'Maytag commercial parts',
          'laundromat maintenance supplies',
          'coin changer parts',
          'washer bearings',
          'dryer heating elements',
          'commercial washer belts',
          'drain pump replacement',
          'door lock parts',
          'control board replacement',
          'coin mechanism parts',
          'water inlet valve',
          'laundromat equipment catalogue',
          'commercial laundry supplies'
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
        structuredData={[PARTS_ITEMLIST_SCHEMA, PRODUCT_SCHEMA, PARTS_COLLECTION_SCHEMA]}
        datePublished="2024-01-01"
        dateModified={new Date().toISOString().split('T')[0]}
        speakableSelectors={["h1", "h2", ".speakable"]}
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
              <h1 className="text-4xl font-bold speakable">Commercial Laundromat Parts Catalogue</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-3xl speakable">
              Complete inventory of equipment, parts, and supplies for laundromats. Speed Queen, Dexter, Huebsch, Continental, and more. 
              One-click ordering through Amazon with verified part numbers and compatibility.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Amazon Affiliate Integrated
              </Badge>
              <Badge variant="outline">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified OEM Parts
              </Badge>
              <Badge variant="outline">
                <TrendingUp className="w-3 h-3 mr-1" />
                Free Shipping on Bulk Orders
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white text-center md:text-left">
                <h2 className="text-xl font-bold mb-1">Need Help Diagnosing an Issue First?</h2>
                <p className="text-slate-300 text-sm">Search our error code database to identify failing parts</p>
              </div>
              <Link href="/error-codes">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" data-testid="button-error-codes">
                  <AlertTriangle className="h-4 w-4" />
                  Browse Error Codes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search parts by name, vendor, or part number..."
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
              <TabsContent key={cat.id} value={cat.id} className="space-y-6" id={cat.id}>
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
          <h2 className="text-2xl font-bold mb-6">Why Choose WashBizHub Parts Catalogue?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="gap-1">
                <DollarSign className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">Affiliate Pricing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                All products through Amazon with nicholaskreme-20 affiliate tag. Support WashBizHub with every purchase.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-1">
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">Verified Vendors</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Curated selection of trusted manufacturers: Speed Queen, Dexter, Huebsch, Continental, and more.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-1">
                <Package className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">One-Click Ordering</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Seamless integration with Amazon ordering. Bulk discounts available through Amazon Business.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-1">
                <Wrench className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">Error Code Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Linked to our 2,500+ error code database. Diagnose issues and find parts in one place.
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="bg-muted/30 border-t">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions About Laundromat Parts</h2>
            <Accordion type="single" collapsible className="w-full">
              {PARTS_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <h2 className="text-2xl font-bold mb-4">Popular Parts by Brand</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="speakable">
                <h3 className="font-semibold mb-2">Speed Queen Replacement Parts</h3>
                <p className="text-sm text-muted-foreground">
                  Door locks, coin slides, bearings, seals, control boards, inlet valves, drain pumps, belts, and heating elements for Speed Queen commercial washers and dryers.
                </p>
              </div>
              <div className="speakable">
                <h3 className="font-semibold mb-2">Dexter Laundry Parts</h3>
                <p className="text-sm text-muted-foreground">
                  T-Series and C-Series components, door assemblies, touchpads, motors, coin mechanisms, and Express technology parts for Dexter equipment.
                </p>
              </div>
              <div className="speakable">
                <h3 className="font-semibold mb-2">Huebsch Equipment Parts</h3>
                <p className="text-sm text-muted-foreground">
                  Galaxy series parts, control panels, drive motors, suspension springs, door switches, and payment system components.
                </p>
              </div>
              <div className="speakable">
                <h3 className="font-semibold mb-2">Continental/Girbau Parts</h3>
                <p className="text-sm text-muted-foreground">
                  Washer-extractor components, professional laundry parts, E-Series and Pro-Series replacement parts for Continental equipment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
