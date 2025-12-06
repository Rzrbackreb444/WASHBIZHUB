import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { 
  WashingMachine, Zap, Shield, Award, ArrowRight, CheckCircle2, 
  Star, Building2, Hotel, GraduationCap, Church, Heart, Siren, Lock,
  Shirt, Trophy, Sparkles, Tent, Dog, UtensilsCrossed, Clock, DollarSign,
  Wrench, Settings, Cpu, Droplets, Flame, Wind, Coins, MapPin, Users,
  FileText, Calculator, TrendingUp, ExternalLink, ChevronRight, Play,
  BadgeCheck, Factory, Globe, Truck, HeadphonesIcon, BookOpen, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  AFFILIATE_LINK, PARTNER_NAME,
  brands, models, partCategories, industryVerticals, financingOptions, faqs,
  getPopularModels, getModelsByBrand, getFaqsByCategory
} from "@/data/equipment-catalog";
import { equipmentBlogs } from "@/data/equipment-blogs";

import dexterStackImg from "@assets/image_1765044323497.png";
import dexterEquipmentImg from "@assets/image_1765044343568.png";
import endOfYearSavingsImg from "@assets/end-of-year_savings_Dexter_graphic_Central_Region_(5)_1765044534652.png";
import vendedSolutionsImg from "@assets/Vended_Central_Region_(1)_1765044577960.png";

const equipmentPageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://washbizhub.com/equipment#webpage",
      "url": "https://washbizhub.com/equipment",
      "name": "Commercial Laundry Equipment | Dexter & Continental Girbau | WashBizHub",
      "description": "Buy commercial laundry equipment from authorized Dexter and Continental Girbau distributor. Washers, dryers, parts for laundromats, hotels, healthcare. Financing available.",
      "isPartOf": { "@id": "https://washbizhub.com/#website" },
      "about": { "@id": "https://washbizhub.com/equipment#service" },
      "breadcrumb": { "@id": "https://washbizhub.com/equipment#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://washbizhub.com/equipment#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "item": { "@id": "https://washbizhub.com/", "name": "Home" } },
        { "@type": "ListItem", "position": 2, "item": { "@id": "https://washbizhub.com/equipment", "name": "Commercial Laundry Equipment" } }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://washbizhub.com/equipment#service",
      "name": "Commercial Laundry Equipment Sales & Service",
      "provider": {
        "@type": "Organization",
        "name": "AAdvantage Laundry Systems",
        "telephone": "+1-800-880-2138",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "2510 National Drive",
          "addressLocality": "Garland",
          "addressRegion": "TX",
          "postalCode": "75041",
          "addressCountry": "US"
        }
      },
      "areaServed": { "@type": "Country", "name": "United States" },
      "serviceType": ["Equipment Sales", "Equipment Leasing", "Parts Supply", "Installation", "Maintenance"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Commercial Laundry Equipment",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Commercial Washers", "brand": ["Dexter", "Continental Girbau"] } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Commercial Dryers", "brand": ["Dexter", "Continental Girbau"] } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Stack Washer-Dryers", "brand": ["Dexter"] } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Replacement Parts", "brand": ["Dexter", "Continental Girbau", "Maytag", "Whirlpool"] } }
        ]
      }
    },
    {
      "@type": "Organization",
      "@id": "https://washbizhub.com/equipment#partner",
      "name": "AAdvantage Laundry Systems",
      "description": "Leading commercial laundry equipment distributor serving the Southern US since 1996. Authorized Dexter and Continental Girbau dealer with 65+ master technicians.",
      "foundingDate": "1996",
      "telephone": "+1-800-880-2138",
      "url": "https://aadvantagelaundry.com",
      "logo": "https://aadvantagelaundry.com/logo.png",
      "address": [
        { "@type": "PostalAddress", "name": "Corporate Headquarters", "streetAddress": "2510 National Drive", "addressLocality": "Garland", "addressRegion": "TX", "postalCode": "75041" },
        { "@type": "PostalAddress", "name": "Oklahoma Office", "streetAddress": "7626 East 46th Place", "addressLocality": "Tulsa", "addressRegion": "OK", "postalCode": "74145" },
        { "@type": "PostalAddress", "name": "North Carolina Office", "streetAddress": "101 High Hope Lane", "addressLocality": "Garner", "addressRegion": "NC", "postalCode": "27529" }
      ],
      "numberOfEmployees": { "@type": "QuantitativeValue", "value": "200+" },
      "knowsAbout": ["Commercial Laundry Equipment", "Dexter Laundry", "Continental Girbau", "Laundromat Equipment", "OPL Equipment"],
      "makesOffer": [
        { "@type": "Offer", "name": "CleanCare Lease Program" },
        { "@type": "Offer", "name": "Equipment Purchase Financing" },
        { "@type": "Offer", "name": "RightRoute Lease Program" }
      ]
    },
    {
      "@type": "Brand",
      "@id": "https://washbizhub.com/equipment#dexter",
      "name": "Dexter Laundry",
      "description": "Industry-leading commercial laundry equipment manufacturer. Made in America since 1894. 125+ years of excellence with industry-leading warranties.",
      "logo": "https://dexter.com/logo.png",
      "url": "https://dexter.com",
      "foundingDate": "1894",
      "slogan": "Built Better. Serviced Quicker. Made in America."
    },
    {
      "@type": "Brand",
      "@id": "https://washbizhub.com/equipment#continental",
      "name": "Continental Girbau",
      "description": "Commercial laundry equipment manufacturer with industry-leading 400+ G-force extraction. ExpressWash soft-mount technology.",
      "logo": "https://continental-laundry.com/logo.png",
      "url": "https://continental-laundry.com",
      "slogan": "Performance. Durability. Efficiency."
    },
    {
      "@type": "FAQPage",
      "@id": "https://washbizhub.com/equipment#faq",
      "mainEntity": faqs.slice(0, 10).map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
      }))
    },
    {
      "@type": "HowTo",
      "@id": "https://washbizhub.com/equipment#howto",
      "name": "How to Buy Commercial Laundry Equipment",
      "description": "Step-by-step guide to purchasing commercial laundry equipment for your business.",
      "step": [
        { "@type": "HowToStep", "position": 1, "name": "Assess Your Needs", "text": "Determine capacity requirements, space constraints, and budget for your laundry operation." },
        { "@type": "HowToStep", "position": 2, "name": "Choose Equipment Type", "text": "Select between vended (coin/card), on-premise (OPL), or industrial equipment based on your application." },
        { "@type": "HowToStep", "position": 3, "name": "Compare Brands", "text": "Compare Dexter (Made in USA, 10-year warranty) and Continental Girbau (400G extraction) for your needs." },
        { "@type": "HowToStep", "position": 4, "name": "Get a Quote", "text": "Contact an authorized distributor for equipment proposals and financing options." },
        { "@type": "HowToStep", "position": 5, "name": "Choose Financing", "text": "Select lease, purchase, or rental options that fit your budget and business model." },
        { "@type": "HowToStep", "position": 6, "name": "Schedule Installation", "text": "Professional installation ensures proper setup and optimal equipment performance." }
      ]
    }
  ]
};

const industryIcons: Record<string, any> = {
  'laundromats': WashingMachine,
  'hotels-motels': Hotel,
  'healthcare': Heart,
  'universities-schools': GraduationCap,
  'apartments-multi-housing': Building2,
  'churches-nonprofits': Church,
  'fire-departments': Siren,
  'correctional-facilities': Lock,
  'military-government': Shield,
  'dry-cleaners': Shirt,
  'sports-athletics': Trophy,
  'spas-salons': Sparkles,
  'rv-parks-campgrounds': Tent,
  'veterinary-animal': Dog,
  'restaurants-food-service': UtensilsCrossed
};

const partIcons: Record<string, any> = {
  'bearings-seals': Settings,
  'belts-pulleys': Settings,
  'motors-drives': Zap,
  'pumps-valves': Droplets,
  'controls-electronics': Cpu,
  'door-hardware': Settings,
  'coin-payment': Coins,
  'heating-elements': Flame,
  'filters-vents': Wind,
  'chemicals-supplies': Droplets
};

export default function EquipmentHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const popularModels = getPopularModels();
  const dexterBrand = brands.find(b => b.id === 'dexter');
  const continentalBrand = brands.find(b => b.id === 'continental-girbau');

  return (
    <>
      <Helmet>
        <title>Commercial Laundry Equipment | Dexter & Continental Girbau Authorized Dealer | WashBizHub</title>
        <meta name="description" content="Buy commercial laundry equipment from authorized Dexter and Continental Girbau distributor. Washers, dryers, parts for laundromats, hotels, healthcare, universities. Financing available. Made in USA." />
        <meta name="keywords" content="commercial laundry equipment, Dexter washers, Continental Girbau, laundromat equipment, commercial washers, commercial dryers, laundry parts, OPL equipment, hotel laundry, healthcare laundry" />
        <link rel="canonical" href="https://washbizhub.com/equipment" />
        <meta property="og:title" content="Commercial Laundry Equipment | Dexter & Continental Girbau | WashBizHub" />
        <meta property="og:description" content="Authorized distributor of Dexter and Continental Girbau commercial laundry equipment. Washers, dryers, parts, financing for laundromats, hotels, healthcare." />
        <meta property="og:url" content="https://washbizhub.com/equipment" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://washbizhub.com/equipment-hero.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <script type="application/ld+json">{JSON.stringify(equipmentPageSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section with Promotional Banner */}
        <section className="relative bg-gradient-to-br from-[#0A1628] via-[#0f2744] to-[#1a3a5c] text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <div className="absolute inset-0 bg-gradient-to-l from-[#C8A661]/30 to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Badge className="bg-[#C8A661] text-[#0A1628] hover:bg-[#C8A661]/90 px-4 py-1">
                    <BadgeCheck className="w-4 h-4 mr-1" />
                    Authorized Distributor
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white">
                    <Factory className="w-4 h-4 mr-1" />
                    Made in USA
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Commercial Laundry
                  <span className="block text-[#C8A661]">Equipment & Parts</span>
                </h1>

                <p className="text-xl text-gray-300 max-w-xl">
                  Authorized <strong>Dexter</strong> and <strong>Continental Girbau</strong> distributor. 
                  Industry-leading warranties, 200+ master technicians, and financing options for 
                  laundromats, hotels, healthcare, universities, and more.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-bold text-lg px-8"
                    asChild
                    data-testid="button-hero-quote"
                  >
                    <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                      Get Equipment Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10"
                    asChild
                    data-testid="button-hero-parts"
                  >
                    <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                      <Wrench className="mr-2 h-5 w-5" />
                      Order Parts
                    </a>
                  </Button>
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#C8A661]">125+</div>
                    <div className="text-sm text-gray-400">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#C8A661]">200+</div>
                    <div className="text-sm text-gray-400">Master Technicians</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#C8A661]">50+</div>
                    <div className="text-sm text-gray-400">States Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#C8A661]">10yr</div>
                    <div className="text-sm text-gray-400">Warranty</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img 
                  src={vendedSolutionsImg} 
                  alt="Dexter Commercial Laundry Equipment - Coin-Operated Washers and Dryers" 
                  className="rounded-xl shadow-2xl w-full"
                  loading="eager"
                />
                {/* Special Offer Badge */}
                <div className="absolute -bottom-4 -right-4 bg-red-600 text-white rounded-lg p-4 shadow-xl">
                  <div className="text-sm font-bold">LIMITED TIME</div>
                  <div className="text-2xl font-bold">6.99% APR</div>
                  <div className="text-xs">Through 12/31/2025</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Financing Banner */}
        <section className="bg-gradient-to-r from-red-700 to-red-600 text-white py-4">
          <div className="container mx-auto px-4">
            <a 
              href={AFFILIATE_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col md:flex-row items-center justify-center gap-4 hover:opacity-90 transition"
              data-testid="link-financing-banner"
            >
              <span className="text-xl font-bold">🎉 END OF YEAR SAVINGS!</span>
              <span className="text-lg">APR Offer of 6.99% — Now Through 12/31/2025</span>
              <Button size="sm" variant="secondary" className="bg-white text-red-700 hover:bg-gray-100">
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>

        {/* Brand Showcase */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Industry-Leading Equipment Brands</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We're proud to be an authorized distributor of the most trusted commercial laundry brands. 
                Each brand offers unique advantages for different applications.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Dexter */}
              <Card className="border-2 hover:border-[#C8A661] transition-colors overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-white text-blue-900 mb-2">Made in USA</Badge>
                      <h3 className="text-2xl font-bold">Dexter Laundry</h3>
                      <p className="text-blue-200">{dexterBrand?.tagline}</p>
                    </div>
                    <img 
                      src={dexterStackImg} 
                      alt="Dexter Stack Washer Dryer" 
                      className="h-32 object-contain"
                    />
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">{dexterBrand?.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">200 G-Force Express</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">10-Year Warranty</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">DexterLive Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">DexterPay Mobile</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-blue-900 hover:bg-blue-800" asChild data-testid="button-dexter-quote">
                      <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                        Get Dexter Quote
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href="https://dexter.com" target="_blank" rel="noopener noreferrer" aria-label="Visit Dexter website">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Continental Girbau */}
              <Card className="border-2 hover:border-[#C8A661] transition-colors overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-white text-emerald-800 mb-2">405 G-Force</Badge>
                      <h3 className="text-2xl font-bold">Continental Girbau</h3>
                      <p className="text-emerald-200">{continentalBrand?.tagline}</p>
                    </div>
                    <WashingMachine className="h-24 w-24 text-white/80" />
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">{continentalBrand?.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">400-405 G-Force</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">ProfitPlus Controls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Soft-Mount Design</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">65% Less Dry Time</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-emerald-800 hover:bg-emerald-700" asChild data-testid="button-continental-quote">
                      <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                        Get Continental Quote
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href="https://continental-laundry.com" target="_blank" rel="noopener noreferrer" aria-label="Visit Continental website">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Brands */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">We also service and supply parts for:</p>
              <div className="flex flex-wrap justify-center gap-4">
                {brands.filter(b => !b.isPrimary).map(brand => (
                  <Badge key={brand.id} variant="secondary" className="text-base px-4 py-2">
                    {brand.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Equipment */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Popular Equipment</h2>
                <p className="text-muted-foreground">Best-selling commercial washers and dryers</p>
              </div>
              <Button variant="outline" asChild data-testid="button-view-all-equipment">
                <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                  View All Equipment <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularModels.slice(0, 8).map(model => (
                <Card key={model.id} className="hover:shadow-lg transition-shadow" data-testid={`card-equipment-${model.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{model.capacity}</Badge>
                      {model.isNewSeries && (
                        <Badge className="bg-[#C8A661] text-[#0A1628]">NEW</Badge>
                      )}
                      {model.isExpress && (
                        <Badge className="bg-blue-600">Express</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{model.name}</CardTitle>
                    <CardDescription>{model.seriesName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {model.gForce && (
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-[#C8A661]" />
                          <span>{model.gForce} G-Force Extraction</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{model.features[0]}</span>
                      </div>
                    </div>
                    <Button className="w-full" asChild data-testid={`button-quote-${model.id}`}>
                      <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                        Get Quote
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Verticals - SEO Powerhouse */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Equipment for Every Industry</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From laundromats to hospitals, hotels to fire departments — we provide specialized 
                commercial laundry solutions for every application.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {industryVerticals.map(industry => {
                const Icon = industryIcons[industry.id] || Building2;
                return (
                  <a
                    key={industry.id}
                    href={AFFILIATE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                    data-testid={`link-industry-${industry.id}`}
                  >
                    <Card className="h-full hover:border-[#C8A661] hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#0A1628] flex items-center justify-center group-hover:bg-[#C8A661] transition-colors">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{industry.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{industry.capacityRange}</p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Parts Section - Proves Parts Capability */}
        <section className="py-16 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c] text-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge className="bg-[#C8A661] text-[#0A1628]">
                  <Wrench className="w-4 h-4 mr-1" />
                  Parts & Service
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Largest Parts Inventory
                  <span className="block text-[#C8A661]">in the Region</span>
                </h2>
                <p className="text-lg text-gray-300">
                  Keep your equipment running with genuine OEM and quality aftermarket parts. 
                  Our technicians have access to the largest parts inventory for Dexter, 
                  Continental Girbau, Maytag, Whirlpool, and more.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-[#C8A661]" />
                    </div>
                    <span>24-Hour Parts Availability</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#C8A661]" />
                    </div>
                    <span>65+ Master Technicians</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-[#C8A661]" />
                    </div>
                    <span>7 States Coverage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                      <HeadphonesIcon className="h-5 w-5 text-[#C8A661]" />
                    </div>
                    <span>Lifetime Tech Support</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-bold"
                  asChild
                  data-testid="button-order-parts"
                >
                  <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                    Order Parts Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {partCategories.slice(0, 8).map(category => {
                  const Icon = partIcons[category.id] || Settings;
                  return (
                    <a
                      key={category.id}
                      href={AFFILIATE_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                      data-testid={`link-parts-${category.id}`}
                    >
                      <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <Icon className="h-8 w-8 text-[#C8A661] mb-2" />
                          <h3 className="font-semibold text-white text-sm">{category.name}</h3>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{category.description.slice(0, 60)}...</p>
                        </CardContent>
                      </Card>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Equipment Guides - SEO Content */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#C8A661] text-[#0A1628]">Expert Guides</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Equipment Buying Guides</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                In-depth guides on equipment costs, brand comparisons, and ROI analysis to help you make informed decisions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipmentBlogs.slice(0, 3).map((blog, index) => (
                <Card key={blog.slug} className="hover-elevate transition-all duration-300 border-2 hover:border-[#C8A661]/50">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {blog.subcategory === 'retool' ? 'Retool Guide' :
                       blog.subcategory === 'comparison' ? 'Brand Comparison' :
                       blog.subcategory === 'hospitality' ? 'Hospitality' :
                       blog.subcategory === 'pricing' ? 'Pricing Guide' : 'Regional'}
                    </Badge>
                    <CardTitle className="text-lg leading-tight">
                      <Link 
                        href={`/equipment/blog/${blog.slug}`}
                        className="hover:text-[#C8A661] transition-colors"
                        data-testid={`link-guide-${index}`}
                      >
                        {blog.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    <Button asChild className="w-full bg-[#0A1628] hover:bg-[#1a3a5c]">
                      <Link href={`/equipment/blog/${blog.slug}`} data-testid={`button-read-guide-${index}`}>
                        Read Guide
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/equipment/blog" data-testid="link-view-all-guides">
                  <BookOpen className="mr-2 h-5 w-5" />
                  View All Equipment Guides
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Financing Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Flexible Financing Options</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Get the equipment you need with financing options designed for every budget. 
                From $0 down leases to equipment purchase financing.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {financingOptions.slice(0, 3).map(option => (
                <Card key={option.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    option.type === 'lease' ? 'bg-blue-600' : 
                    option.type === 'purchase' ? 'bg-green-600' : 'bg-purple-600'
                  }`} />
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {option.type === 'lease' ? 'LEASE' : option.type === 'purchase' ? 'BUY' : 'RENTAL'}
                    </Badge>
                    <CardTitle>{option.name}</CardTitle>
                    <CardDescription>{option.provider}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{option.description}</p>
                    <ul className="space-y-2">
                      {option.benefits.slice(0, 4).map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" asChild data-testid={`button-financing-${option.id}`}>
                      <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                        Learn More
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* End of Year Savings Banner */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <a 
              href={AFFILIATE_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-savings-banner"
            >
              <img 
                src={endOfYearSavingsImg} 
                alt="End of Year Savings - 6.99% APR through December 31, 2025 - AAdvantage Laundry Systems" 
                className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                loading="lazy"
              />
            </a>
          </div>
        </section>

        {/* Why Choose AAdvantage */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src={dexterEquipmentImg} 
                  alt="Dexter Commercial Laundry Equipment Lineup" 
                  className="rounded-xl shadow-xl"
                  loading="lazy"
                />
              </div>
              <div className="space-y-6">
                <Badge variant="secondary">
                  <Award className="w-4 h-4 mr-1" />
                  Since 1996
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Why Choose {PARTNER_NAME}?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Founded in 1996, AAdvantage Laundry Systems has grown to become one of the 
                  largest volume distributors in the South. We specialize in turn-key solutions 
                  for vended, on-premise, and industrial laundries.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                      <Globe className="h-6 w-6 text-[#C8A661]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Nationwide Service Network</h3>
                      <p className="text-muted-foreground text-sm">200+ master technicians across 50+ states ensure fast repairs and replacements.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-[#C8A661]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Complete Business Solutions</h3>
                      <p className="text-muted-foreground text-sm">Design, layout, financing, construction consultation, and site demographics analysis.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-[#C8A661]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Industry-Leading Warranties</h3>
                      <p className="text-muted-foreground text-sm">Dexter's 10-year warranty on major components plus lifetime technical support.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button size="lg" className="bg-[#0A1628] hover:bg-[#1a3a5c]" asChild data-testid="button-contact-partner">
                    <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                      Contact Us Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - E-E-A-T */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-lg text-muted-foreground">
                  Expert answers to common questions about commercial laundry equipment
                </p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {faqs.slice(0, 12).map((faq, index) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline" data-testid={`accordion-faq-${index}`}>
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="text-center mt-8">
                <p className="text-muted-foreground mb-4">Have more questions? Our equipment experts are here to help.</p>
                <Button size="lg" asChild data-testid="button-faq-contact">
                  <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ask an Expert
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-[#0A1628] to-[#1a3a5c] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Upgrade Your Laundry Operation?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a free consultation and equipment quote from our expert team. 
              Financing available with rates as low as 6.99% APR.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-bold text-lg px-8"
                asChild
                data-testid="button-final-cta-quote"
              >
                <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                asChild
                data-testid="button-final-cta-parts"
              >
                <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                  <Wrench className="mr-2 h-5 w-5" />
                  Order Parts
                </a>
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm text-gray-400 mb-4">Proudly partnered with industry leaders:</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <span className="text-xl font-bold">DEXTER</span>
                <span className="text-xl font-bold">Continental Girbau</span>
                <span className="text-xl">Maytag</span>
                <span className="text-xl">Whirlpool</span>
                <span className="text-xl">LG</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Block - Hidden but indexed */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <h2>Commercial Laundry Equipment: The Complete Buyer's Guide</h2>
              <p>
                Whether you're starting a new laundromat, upgrading hotel laundry facilities, or 
                equipping a healthcare operation, choosing the right commercial laundry equipment 
                is critical to your success. At WashBizHub, we've partnered with AAdvantage Laundry 
                Systems — one of America's largest volume distributors — to bring you access to 
                industry-leading brands like <strong>Dexter Laundry</strong> and <strong>Continental Girbau</strong>.
              </p>

              <h3>Understanding G-Force in Commercial Washers</h3>
              <p>
                G-force measures the centrifugal extraction force during the spin cycle. Higher 
                G-force means more water is removed from clothes, directly reducing drying time 
                and utility costs. Dexter Express machines offer 200 G-force extraction, while 
                Continental Girbau's ExpressWash achieves an industry-leading 400-405 G-force — 
                reducing dry times by up to 65%.
              </p>

              <h3>Equipment for Every Commercial Application</h3>
              <p>
                Commercial laundry needs vary dramatically by industry. Laundromats require 
                durable, coin-operated equipment with fast cycle times. Hotels need high-capacity 
                on-premise laundry (OPL) for linens and towels. Healthcare facilities require 
                barrier washers with sanitization cycles. Fire departments need specialized 
                equipment for turnout gear. We provide expert consultation to match the right 
                equipment to your specific application.
              </p>

              <h3>Parts and Service: Keeping Your Equipment Running</h3>
              <p>
                Equipment downtime costs money. That's why AAdvantage maintains the largest parts 
                inventory in the region, with 24-hour availability and 65+ master technicians 
                ready to service your equipment. From bearings and seals to control boards and 
                coin mechanisms, we stock genuine OEM parts for Dexter, Continental Girbau, 
                Maytag, Whirlpool, and other major brands.
              </p>

              <h3>Financing Your Commercial Laundry Investment</h3>
              <p>
                Commercial laundry equipment is a significant investment, but flexible financing 
                makes it accessible. Options include the CleanCare lease program (no capital 
                outlay, service included), equipment purchase financing (keep 100% of revenue), 
                and the RightRoute lease for multi-housing properties. Current promotional rates 
                start at 6.99% APR through December 31, 2025.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
