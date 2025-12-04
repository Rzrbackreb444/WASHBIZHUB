import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Users, TrendingUp, DollarSign, Shield, Clock, CheckCircle, 
  ArrowRight, Star, Zap, Crown, ChevronRight, MessageSquare,
  Eye, BarChart3, Target, Sparkles, FileEdit, PartyPopper, Phone, Mail,
  Building2, Package, Key, HelpCircle
} from "lucide-react";

const CONSULT_EMAIL = "consult@washbizhub.com";
const OWNER_PHONE = "479-883-4314";

const saleTypes = [
  {
    id: "asset-sale",
    title: "Asset Sale Only",
    subtitle: "Equipment + Lease Assignment",
    description: "Sell your equipment, customer base, and assign your lease to the buyer. You don't own the real estate.",
    icon: Package,
    color: "from-blue-500 to-blue-600",
    features: [
      "Equipment inventory included",
      "Customer base transfer",
      "Lease assignment to buyer",
      "Faster closing process",
      "Lower transaction costs"
    ],
    avgPrice: "$75K - $300K",
    timeline: "30-60 days"
  },
  {
    id: "with-real-estate",
    title: "Business + Real Estate",
    subtitle: "Complete Property Sale",
    description: "Sell your entire operation including the building and land. Maximum value for owner-operators.",
    icon: Building2,
    color: "from-emerald-500 to-emerald-600",
    features: [
      "Building & land included",
      "All equipment included",
      "No landlord negotiations",
      "Higher total sale price",
      "Attractive to investors"
    ],
    avgPrice: "$500K - $2M+",
    timeline: "60-120 days"
  }
];

const buyerStats = {
  activeUsers: 120,
  monthlySearches: "2,400+",
  avgDaysToSell: 45,
  verifiedBuyers: "500+",
};

const valueProps = [
  {
    icon: Users,
    title: "120+ Active Buyers Right Now",
    description: "Qualified buyers are actively searching for laundromats on WashBizHub today. Your listing gets in front of serious investors.",
    stat: "11,900% growth this month"
  },
  {
    icon: Target,
    title: "Targeted Audience",
    description: "No tire-kickers. Our buyers come from the largest laundromat Facebook communities and are pre-qualified for financing.",
    stat: "72K+ industry members"
  },
  {
    icon: BarChart3,
    title: "CLEANBI Score Included",
    description: "Every listing gets our proprietary CLEANBI analysis - showing buyers exactly why your location is valuable.",
    stat: "Increases inquiries 3x"
  },
  {
    icon: Shield,
    title: "Protected Information",
    description: "Sensitive financials are protected behind NDA requests. You control who sees your numbers.",
    stat: "100% seller control"
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started and test the market",
    icon: Star,
    color: "from-slate-500 to-slate-600",
    features: [
      "Basic listing with photos",
      "5 images included",
      "Buyer inquiry notifications",
      "30-day visibility",
      "Basic analytics"
    ],
    cta: "List for Free",
    popular: false
  },
  {
    name: "Showcase",
    price: "$89",
    period: "/month",
    description: "For serious sellers who want results",
    icon: Crown,
    color: "from-amber-500 to-amber-600",
    features: [
      "Everything in Free, plus:",
      "Featured placement",
      "30 images + 5 videos",
      "CLEANBI score badge",
      "Priority search ranking",
      "Advanced analytics",
      "Verified seller badge"
    ],
    cta: "Get Featured",
    popular: true
  },
  {
    name: "Diamond",
    price: "$199",
    period: "/month",
    description: "Maximum exposure for premium properties",
    icon: Sparkles,
    color: "from-purple-500 to-purple-600",
    features: [
      "Everything in Showcase, plus:",
      "Homepage carousel feature",
      "Unlimited media",
      "Dedicated account manager",
      "Social media promotion",
      "Email blast to buyers",
      "Premium support"
    ],
    cta: "Go Diamond",
    popular: false
  }
];

const howItWorks = [
  {
    step: 1,
    title: "Create Your Listing",
    description: "Add photos, describe your business, and set your asking price. Takes under 10 minutes.",
    icon: FileEdit
  },
  {
    step: 2,
    title: "Get CLEANBI Analysis",
    description: "We analyze your location and provide a score that helps buyers understand the opportunity.",
    icon: BarChart3
  },
  {
    step: 3,
    title: "Receive Inquiries",
    description: "Qualified buyers reach out through our platform. You control who gets access to sensitive info.",
    icon: MessageSquare
  },
  {
    step: 4,
    title: "Close the Deal",
    description: "Work with our recommended professionals or your own team to complete the sale.",
    icon: PartyPopper
  }
];

const faqs = [
  {
    q: "How long does it take to list my laundromat?",
    a: "Most sellers complete their listing in under 10 minutes. You can save drafts and come back anytime."
  },
  {
    q: "Is my financial information protected?",
    a: "Yes. Sensitive data like P&L statements and tax returns are protected behind NDA requests. Buyers must request access and you approve each one."
  },
  {
    q: "What if I'm not ready to sell yet?",
    a: "You can create a draft listing to test interest levels. Many sellers use our CLEANBI tool first to understand their property's value."
  },
  {
    q: "Do you charge a commission?",
    a: "No. WashBizHub charges a flat monthly fee, not a percentage of your sale. You keep what you earn."
  },
  {
    q: "Can I use my own broker?",
    a: "Absolutely. Many sellers list here for exposure while working with their preferred broker. We also have recommended partners if you need one."
  }
];

export default function SellYourLaundromat() {
  const [selectedSaleType, setSelectedSaleType] = useState<string | null>(null);

  return (
    <>
      <SEO 
        title="Sell Your Laundromat | List for Free | WashBizHub"
        description="120+ active buyers searching right now. List your laundromat for free and reach the largest community of laundromat investors. CLEANBI analysis included."
        keywords={["sell laundromat", "laundromat for sale", "sell my laundromat", "laundromat buyers", "laundromat listing"]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
            <div className="text-center max-w-4xl mx-auto">
              {/* Live Buyer Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-sm font-medium">
                  {buyerStats.activeUsers} buyers active right now
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Sell Your Laundromat to
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Qualified Buyers</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                List for free and reach the largest community of laundromat investors. 
                Our buyers come pre-qualified and ready to move.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link href="/listing-form">
                  <Button size="lg" className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700 text-lg px-8 py-6" data-testid="button-list-free">
                    List for Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/cleanbi">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-lg px-8 py-6 border-slate-600 hover:bg-slate-800" data-testid="button-get-valuation">
                    Get Free Valuation First
                  </Button>
                </Link>
              </div>
              
              <div className="flex justify-center mb-12">
                <Link href="/add-listing-from-image">
                  <Button variant="ghost" className="gap-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" data-testid="button-quick-list">
                    <Sparkles className="w-4 h-4" />
                    Have a broker flyer? Upload image for instant listing
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { label: "Active Buyers", value: buyerStats.activeUsers + "+", testId: "stat-active-buyers" },
                  { label: "Monthly Searches", value: buyerStats.monthlySearches, testId: "stat-monthly-searches" },
                  { label: "Avg Days to Sell", value: buyerStats.avgDaysToSell, testId: "stat-avg-days" },
                  { label: "Verified Buyers", value: buyerStats.verifiedBuyers, testId: "stat-verified-buyers" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50" data-testid={stat.testId}>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sale Type Selector */}
        <section className="py-16 border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-400">
                <HelpCircle className="w-3 h-3 mr-1" />
                First, tell us about your sale
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                What are you selling?
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Choose your sale type to get the right valuation and connect with the right buyers
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {saleTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedSaleType === type.id 
                      ? 'ring-2 ring-green-500 bg-slate-800/80' 
                      : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                  }`}
                  onClick={() => setSelectedSaleType(type.id)}
                  data-testid={`sale-type-${type.id}`}
                >
                  {selectedSaleType === type.id && (
                    <div className="absolute -top-3 -right-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${type.color}`}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{type.title}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">{type.subtitle}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300">{type.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-700/50">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Typical Price</p>
                        <p className="text-lg font-bold text-white">{type.avgPrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Timeline</p>
                        <p className="text-lg font-bold text-white">{type.timeline}</p>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {type.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedSaleType && (
              <div className="mt-8 text-center">
                <Link href={`/listing-form?type=${selectedSaleType}`}>
                  <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-8 py-6" data-testid="button-continue-listing">
                    Continue to List Your {selectedSaleType === 'asset-sale' ? 'Business' : 'Property'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Not sure which option fits your situation?{" "}
                <a 
                  href={`mailto:${CONSULT_EMAIL}?subject=Help%20Choosing%20Sale%20Type`}
                  className="text-green-400 hover:text-green-300 underline"
                >
                  Talk to an expert
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Why Sell Here */}
        <section className="py-20 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Sellers Choose WashBizHub
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                The only marketplace built specifically for laundromat transactions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {valueProps.map((prop, idx) => (
                <Card key={idx} className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 transition-colors" data-testid={`value-prop-${idx}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <prop.icon className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{prop.title}</CardTitle>
                        <Badge variant="outline" className="mt-2 text-green-400 border-green-500/30">
                          {prop.stat}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400">{prop.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-slate-400">
                From listing to closing in 4 simple steps
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, idx) => (
                <div key={idx} className="relative" data-testid={`step-${step.step}`}>
                  <Card className="border-slate-700/50 bg-slate-800/30 h-full">
                    <CardContent className="pt-6 text-center">
                      <div className="flex justify-center mb-4">
                        <step.icon className="w-10 h-10 text-green-400" />
                      </div>
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold text-sm mb-4">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-400">{step.description}</p>
                    </CardContent>
                  </Card>
                  {idx < howItWorks.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-slate-600 -translate-y-1/2 z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-slate-400">
                No commissions. No hidden fees. Start free.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingTiers.map((tier, idx) => (
                <Card 
                  key={idx} 
                  className={`relative border-slate-700/50 bg-slate-800/30 ${
                    tier.popular ? 'ring-2 ring-amber-500/50 scale-105' : ''
                  }`}
                  data-testid={`pricing-tier-${tier.name.toLowerCase()}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 text-black font-semibold">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} mx-auto mb-4`}>
                      <tier.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{tier.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-slate-400">{tier.period}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{tier.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {tier.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/listing-form">
                      <Button 
                        className={`w-full ${tier.popular ? 'bg-amber-500 hover:bg-amber-600 text-black' : ''}`}
                        variant={tier.popular ? "default" : "outline"}
                        data-testid={`button-tier-${tier.name.toLowerCase()}`}
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="border-slate-700/50 bg-slate-800/30" data-testid={`faq-${idx}`}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-slate-400">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-400 text-sm font-medium">
                Buyers are searching right now
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Sell Your Laundromat?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Join {buyerStats.verifiedBuyers} other sellers who trust WashBizHub to find qualified buyers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listing-form">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700 text-lg px-8 py-6" data-testid="button-list-now">
                  List Your Laundromat Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto gap-2 text-lg px-8 py-6 border-slate-600 hover:bg-slate-800"
                  onClick={() => {
                    window.location.href = `mailto:${CONSULT_EMAIL}?subject=${encodeURIComponent("Help Selling My Laundromat")}&body=${encodeURIComponent("Hi,\n\nI'm interested in selling my laundromat and would like to speak with an expert.\n\nPlease contact me at your earliest convenience.\n\nThank you!")}`;
                  }}
                >
                  <Mail className="w-5 h-5" />
                  Talk to an Expert
                </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
