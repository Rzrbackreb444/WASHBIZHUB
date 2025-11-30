import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { 
  Store, Wrench, Package, Building2, Briefcase,
  ArrowRight, CheckCircle, Star, Users, TrendingUp,
  DollarSign, Clock, Shield, Sparkles
} from "lucide-react";

const listingCategories = [
  {
    id: "laundromat",
    href: "/listing-form",
    title: "Sell Your Laundromat",
    subtitle: "List your business for sale",
    description: "Get your laundromat in front of 72,000+ qualified buyers. Includes CLEANBI score, financing options display, and premium placement.",
    icon: Store,
    badge: "MOST POPULAR",
    badgeColor: "bg-green-500",
    highlight: true,
    features: [
      "CLEANBI score analysis included",
      "Financing pre-qualification display",
      "Featured placement available",
      "Verified buyer inquiries"
    ],
    stats: { buyers: "500+", avgDays: "45", conversions: "23%" },
    color: "from-green-500 to-emerald-600",
    bgGlow: "bg-green-500/20"
  },
  {
    id: "equipment",
    href: "/list-equipment",
    title: "Sell Equipment",
    subtitle: "Washers, dryers & parts",
    description: "List commercial laundry equipment for sale. Reach operators looking for used machinery, parts, and supplies.",
    icon: Wrench,
    badge: "FREE",
    badgeColor: "bg-blue-500",
    highlight: false,
    features: [
      "All major brands supported",
      "Parts & components welcome",
      "Price negotiation tools",
      "Direct buyer contact"
    ],
    stats: { listings: "1,200+", views: "15K/mo", response: "< 24hrs" },
    color: "from-blue-500 to-blue-600",
    bgGlow: "bg-blue-500/20"
  },
  {
    id: "service",
    href: "/vendor-form",
    title: "List Your Service",
    subtitle: "Become a vendor partner",
    description: "Join our vendor directory as a service provider. Connect with laundromat owners looking for repair, consulting, financing, and more.",
    icon: Briefcase,
    badge: "PARTNERS",
    badgeColor: "bg-purple-500",
    highlight: true,
    features: [
      "Featured in vendor directory",
      "Lead generation tools",
      "Review & rating system",
      "Service area targeting"
    ],
    stats: { vendors: "200+", leads: "5K/mo", satisfaction: "4.8/5" },
    color: "from-purple-500 to-purple-600",
    bgGlow: "bg-purple-500/20"
  },
  {
    id: "product",
    href: "/list-supplies",
    title: "List Products",
    subtitle: "Supplies & merchandise",
    description: "Sell laundry supplies, detergents, vending products, or retail merchandise to our network of laundromat operators.",
    icon: Package,
    badge: null,
    badgeColor: "",
    highlight: false,
    features: [
      "B2B wholesale options",
      "Bulk order support",
      "Shipping integration",
      "Recurring order setup"
    ],
    stats: { products: "800+", orders: "2K/mo", operators: "1,500+" },
    color: "from-orange-500 to-orange-600",
    bgGlow: "bg-orange-500/20"
  },
  {
    id: "business",
    href: "/list-business",
    title: "Add Your Business",
    subtitle: "Directory listing",
    description: "Get your business listed in our comprehensive industry directory. Perfect for distributors, manufacturers, and service companies.",
    icon: Building2,
    badge: "SEO BOOST",
    badgeColor: "bg-teal-500",
    highlight: false,
    features: [
      "SEO-optimized listing",
      "Google Maps integration",
      "Social media links",
      "Customer reviews enabled"
    ],
    stats: { businesses: "500+", visibility: "72K+", inquiries: "10K/mo" },
    color: "from-teal-500 to-teal-600",
    bgGlow: "bg-teal-500/20"
  },
];

const benefits = [
  { icon: Users, label: "72,000+ Monthly Visitors", description: "Largest laundromat industry audience online" },
  { icon: TrendingUp, label: "High Intent Buyers", description: "Actively searching for opportunities" },
  { icon: Shield, label: "Verified Inquiries", description: "Quality leads, not spam" },
  { icon: Clock, label: "Quick Setup", description: "List in under 5 minutes" },
];

export default function AddListingPage() {
  return (
    <>
      <Helmet>
        <title>Add a Listing | Sell Laundromats, Equipment, Services & Products | WashBizHub</title>
        <meta name="description" content="List your laundromat for sale, sell equipment, become a vendor, or add your business to the #1 laundromat industry platform. Reach 72,000+ qualified buyers monthly." />
        <meta name="keywords" content="sell laundromat, list equipment, laundromat for sale, vendor directory, laundry equipment marketplace, laundromat business listing" />
        <link rel="canonical" href="https://washbizhub.com/add-listing" />
        <meta property="og:title" content="Add a Listing | WashBizHub Marketplace" />
        <meta property="og:description" content="List your laundromat, equipment, or services. Reach 72,000+ industry professionals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://washbizhub.com/add-listing" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Add a Listing | WashBizHub" />
        <meta name="twitter:description" content="Reach 72,000+ laundromat industry buyers and operators." />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Add a Listing - WashBizHub",
            "description": "Create listings for laundromats, equipment, services, products, or businesses on the leading laundromat industry platform.",
            "url": "https://washbizhub.com/add-listing",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": listingCategories.map((cat, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": cat.title,
                "description": cat.description,
                "url": `https://washbizhub.com${cat.href}`
              }))
            },
            "publisher": {
              "@type": "Organization",
              "name": "WashBizHub",
              "url": "https://washbizhub.com"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            "name": "WashBizHub Listing Services",
            "description": "Comprehensive listing services for laundromat industry professionals",
            "url": "https://washbizhub.com/add-listing",
            "itemListElement": [
              {
                "@type": "Offer",
                "name": "Laundromat Business Listing",
                "description": "List your laundromat business for sale to 72,000+ qualified buyers with CLEANBI score analysis",
                "url": "https://washbizhub.com/listing-form",
                "category": "Business For Sale",
                "seller": {
                  "@type": "Organization",
                  "name": "WashBizHub"
                },
                "availability": "https://schema.org/InStock",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "Offer",
                "name": "Commercial Laundry Equipment Listing",
                "description": "Sell commercial washers, dryers, and laundry equipment parts to operators nationwide",
                "url": "https://washbizhub.com/list-equipment",
                "category": "Equipment",
                "availability": "https://schema.org/InStock",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "Offer",
                "name": "Vendor Service Listing",
                "description": "Join vendor directory to offer repair, consulting, financing and other services to laundromat owners",
                "url": "https://washbizhub.com/vendor-form",
                "category": "Professional Services",
                "availability": "https://schema.org/InStock",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "Offer",
                "name": "Laundry Supplies & Products Listing",
                "description": "List detergents, chemicals, vending products and retail merchandise for B2B wholesale",
                "url": "https://washbizhub.com/list-supplies",
                "category": "Products",
                "availability": "https://schema.org/InStock",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "Offer",
                "name": "Business Directory Listing",
                "description": "Add your company to the laundromat industry directory with SEO-optimized profile",
                "url": "https://washbizhub.com/list-business",
                "category": "Business Directory",
                "availability": "https://schema.org/InStock",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://washbizhub.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Add a Listing",
                "item": "https://washbizhub.com/add-listing"
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I list my laundromat for sale?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Click 'Sell Your Laundromat' on the Add a Listing page, fill out your business details, pricing, and upload photos. Your listing will be visible to 72,000+ qualified buyers and includes a free CLEANBI score analysis."
                }
              },
              {
                "@type": "Question",
                "name": "Is it free to list equipment on WashBizHub?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, basic equipment listings are completely free. You can list washers, dryers, parts, and accessories at no cost. Premium placement options are available for faster sales."
                }
              },
              {
                "@type": "Question",
                "name": "How do I become a vendor partner?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Select 'List Your Service' to join our vendor directory. As a vendor, you'll be featured in our directory, receive lead generation tools, and connect with laundromat owners looking for repair, consulting, and other services."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <section 
          className="relative py-16 sm:py-20 bg-gradient-to-br from-[#001F3F] via-[#002B5C] to-[#001F3F] overflow-hidden"
          data-testid="section-add-listing-hero"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#39CCCC] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-500 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#39CCCC]/20 text-[#39CCCC] border-[#39CCCC]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Reach 72,000+ Industry Professionals
              </Badge>
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                data-testid="text-add-listing-title"
              >
                What Would You Like to List?
              </h1>
              <p className="text-white/70 max-w-2xl mx-auto text-lg sm:text-xl">
                Choose your listing type below. All listings reach our engaged audience of laundromat buyers, owners, and operators.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#39CCCC]/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-[#39CCCC]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{benefit.label}</p>
                    <p className="text-white/50 text-xs">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 px-4 sm:px-6" data-testid="section-listing-categories">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listingCategories.map((category) => (
                <Link key={category.id} href={category.href}>
                  <Card 
                    className={`
                      p-6 h-full bg-card border-2 
                      hover:border-[#39CCCC]/50 hover-elevate active-elevate-2 
                      transition-all cursor-pointer group relative overflow-visible
                      ${category.highlight ? 'ring-2 ring-[#39CCCC]/30 border-[#39CCCC]/20' : 'border-border'}
                    `}
                    data-testid={`card-listing-${category.id}`}
                  >
                    {category.badge && (
                      <Badge 
                        className={`absolute -top-3 right-4 ${category.badgeColor} text-white text-xs font-bold shadow-lg`}
                      >
                        {category.badge}
                      </Badge>
                    )}
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`
                        inline-flex items-center justify-center w-14 h-14 rounded-xl 
                        bg-gradient-to-br ${category.color} text-white flex-shrink-0
                        group-hover:scale-110 transition-transform shadow-lg
                      `}>
                        <category.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-[#39CCCC] transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{category.subtitle}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {category.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex gap-3 text-xs">
                        {Object.entries(category.stats).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <p className="font-bold text-foreground">{value}</p>
                            <p className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          </div>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-[#39CCCC] to-[#2db3b3] hover:from-[#2db3b3] hover:to-[#39CCCC] text-white gap-1"
                      >
                        Start <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Card className="inline-block p-6 bg-gradient-to-r from-[#001F3F]/5 to-[#39CCCC]/5 border-[#39CCCC]/20">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#39CCCC]/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-[#39CCCC]" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-bold text-foreground">Need Help Deciding?</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact our team for personalized guidance on the best listing type for your needs.
                    </p>
                  </div>
                  <Link href="/contact">
                    <Button variant="outline" className="border-[#39CCCC] text-[#39CCCC] hover:bg-[#39CCCC]/10">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30 px-4 sm:px-6" data-testid="section-why-list">
          <div className="max-w-4xl mx-auto text-center">
            <h2 
              className="text-2xl sm:text-3xl font-bold text-foreground mb-8"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Why List on WashBizHub?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Free Basic Listings</h3>
                <p className="text-sm text-muted-foreground">
                  Start listing for free. Upgrade to featured placement when you're ready for more visibility.
                </p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Targeted Audience</h3>
                <p className="text-sm text-muted-foreground">
                  Every visitor is interested in the laundromat industry. No wasted impressions.
                </p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Verified Buyers</h3>
                <p className="text-sm text-muted-foreground">
                  We screen inquiries to ensure you only hear from serious, qualified prospects.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
