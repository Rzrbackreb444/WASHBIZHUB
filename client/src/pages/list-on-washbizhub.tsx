import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Building2, Package, Wrench, Users, Droplets, ArrowRight, 
  CheckCircle, Star, TrendingUp, Shield, Zap, ChevronRight
} from "lucide-react";

const CONSULT_EMAIL = "consult@washbizhub.com";

const listingCategories = [
  {
    id: "laundromat",
    title: "Sell Your Laundromat",
    subtitle: "Business for Sale",
    description: "List your laundromat business with or without real estate. Reach qualified buyers actively searching.",
    icon: Building2,
    color: "from-green-500 to-emerald-600",
    href: "/sell-your-laundromat",
    stats: { buyers: "120+", avgDays: "45" },
    features: ["CLEANBI Analysis Included", "Verified Buyers", "NDA Protection"],
    cta: "List Your Business",
    popular: true
  },
  {
    id: "equipment",
    title: "Sell Equipment",
    subtitle: "New & Used Machines",
    description: "List commercial washers, dryers, payment systems, and parts. Connect with operators nationwide.",
    icon: Package,
    color: "from-blue-500 to-blue-600",
    href: "/list-equipment",
    stats: { listings: "500+", views: "10K+" },
    features: ["12 Equipment Categories", "Brand Recognition", "Price Negotiable"],
    cta: "List Equipment",
    popular: false
  },
  {
    id: "supplies",
    title: "Sell Supplies",
    subtitle: "Detergents & Products",
    description: "List detergents, chemicals, vending products, and consumables. Reach laundromat owners directly.",
    icon: Droplets,
    color: "from-purple-500 to-purple-600",
    href: "/list-supplies",
    stats: { categories: "12", nationwide: "Yes" },
    features: ["Bulk Pricing Options", "Shipping Nationwide", "B2B Focus"],
    cta: "List Supplies",
    popular: false
  },
  {
    id: "services",
    title: "Offer Services",
    subtitle: "Professional Services",
    description: "List your repair, maintenance, consulting, or marketing services. Get found by laundromat owners.",
    icon: Wrench,
    color: "from-amber-500 to-orange-600",
    href: "/list-services",
    stats: { owners: "72K+", demand: "High" },
    features: ["Service Categories", "Geographic Targeting", "Lead Generation"],
    cta: "List Services",
    popular: false
  },
  {
    id: "directory",
    title: "Join Directory",
    subtitle: "Vendor Listing",
    description: "Add your company to our verified directory. Get discovered by operators looking for vendors.",
    icon: Users,
    color: "from-slate-500 to-slate-600",
    href: "/list-business",
    stats: { vendors: "200+", exposure: "Free" },
    features: ["Company Profile", "Service Areas", "Social Links"],
    cta: "Join Directory",
    popular: false
  }
];

const benefits = [
  {
    icon: TrendingUp,
    title: "72,000+ Industry Professionals",
    description: "Access the largest community of laundromat owners, operators, and investors."
  },
  {
    icon: Shield,
    title: "Verified & Trusted",
    description: "All listings reviewed for quality. Buyers and sellers trust WashBizHub."
  },
  {
    icon: Zap,
    title: "Fast Results",
    description: "Most sellers receive inquiries within 48 hours of listing."
  },
  {
    icon: Star,
    title: "Premium Features",
    description: "CLEANBI analysis, featured placement, and professional tools included."
  }
];

export default function ListOnWashBizHub() {
  return (
    <>
      <SEO 
        title="List on WashBizHub | Sell Equipment, Services & Businesses"
        description="The #1 marketplace for the laundromat industry. Sell your business, equipment, supplies, or offer professional services to 72,000+ industry professionals."
        keywords={["sell laundromat", "list equipment", "laundromat services", "laundry marketplace", "sell commercial washers"]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-6 border-amber-500/30 text-amber-400">
                <Star className="w-3 h-3 mr-1 fill-amber-400" />
                The #1 Laundromat Marketplace
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                List on
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> WashBizHub</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Reach 72,000+ laundromat professionals. Sell your business, equipment, supplies, or offer services.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {["Laundromats", "Equipment", "Supplies", "Services", "Vendors"].map((cat) => (
                  <Badge key={cat} variant="secondary" className="bg-slate-800/80 text-slate-300 px-3 py-1">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Listing Categories */}
        <section className="py-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                What would you like to list?
              </h2>
              <p className="text-slate-400">
                Choose a category to get started
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingCategories.map((category) => (
                <Card 
                  key={category.id}
                  className={`relative border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 ${
                    category.popular ? 'ring-2 ring-green-500/50' : ''
                  }`}
                  data-testid={`category-${category.id}`}
                >
                  {category.popular && (
                    <div className="absolute -top-3 left-4">
                      <Badge className="bg-green-500 text-white font-semibold">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color}`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{category.title}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">{category.subtitle}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300">{category.description}</p>
                    
                    <div className="flex gap-4 py-3 border-y border-slate-700/50">
                      {Object.entries(category.stats).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-lg font-bold text-white">{value}</p>
                          <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        </div>
                      ))}
                    </div>

                    <ul className="space-y-2">
                      {category.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link href={category.href}>
                      <Button 
                        className={`w-full gap-2 ${category.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        variant={category.popular ? "default" : "outline"}
                        data-testid={`button-${category.id}`}
                      >
                        {category.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Why List on WashBizHub?
              </h2>
              <p className="text-slate-400">
                The trusted marketplace for the laundromat industry
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => (
                <Card key={idx} className="border-slate-700/50 bg-slate-800/30 text-center" data-testid={`benefit-${idx}`}>
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-4">
                      <benefit.icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-slate-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-3">
                Already know what you want?
              </h2>
              <p className="text-slate-400">
                Jump directly to your listing type
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Sell Laundromat (Asset Sale)", href: "/listing-form?type=asset-sale", icon: Package },
                { label: "Sell Laundromat (With Real Estate)", href: "/listing-form?type=with-real-estate", icon: Building2 },
                { label: "Browse Equipment Marketplace", href: "/classifieds?category=equipment", icon: Package },
                { label: "View All Classifieds", href: "/classifieds", icon: Star },
              ].map((link) => (
                <Link key={link.label} href={link.href}>
                  <Card className="border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-colors" data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <link.icon className="w-5 h-5 text-slate-400" />
                        <span className="text-white font-medium">{link.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Need Help Getting Started?
            </h2>
            <p className="text-slate-400 mb-8">
              Our team can help you create the perfect listing to reach the right buyers.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-slate-600 hover:bg-slate-800"
              onClick={() => {
                window.location.href = `mailto:${CONSULT_EMAIL}?subject=${encodeURIComponent("Help Listing on WashBizHub")}`;
              }}
              data-testid="button-contact-help"
            >
              Contact Our Team
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
