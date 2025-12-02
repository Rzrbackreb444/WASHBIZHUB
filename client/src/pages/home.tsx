import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { 
  Lightbulb, Target, Settings, Users, ArrowRight, 
  Sparkles, MapPin, TrendingUp, Shield, Zap,
  CheckCircle, Star, Calculator, Calendar, Quote,
  Flame, X, FileText, DollarSign, AlertTriangle
} from "lucide-react";

// Testimonials data
const testimonials = [
  {
    quote: "CLEANBI saved me from a $180K mistake. The location I was about to buy scored a 42 - turns out there were 6 competitors within 2 miles I didn't know about.",
    name: "Mike R.",
    location: "Dallas, TX",
    dealSize: "$180K saved"
  },
  {
    quote: "I've bought 3 laundromats using WashBizHub. The scoring system is scary accurate - my highest scoring location is now my best performer.",
    name: "Sarah L.",
    location: "Phoenix, AZ", 
    dealSize: "3 locations"
  },
  {
    quote: "As a broker, I use CLEANBI for every listing. It gives my buyers confidence and speeds up deals. Worth every penny of the Pro subscription.",
    name: "James T.",
    location: "Atlanta, GA",
    dealSize: "12 deals closed"
  }
];

// Hot markets data (anonymized insights)
const hotMarkets = [
  { city: "Austin, TX", score: 87, trend: "up", insight: "Tech boom driving apartment demand" },
  { city: "Tampa, FL", score: 84, trend: "up", insight: "Population growth + aging laundromats" },
  { city: "Denver, CO", score: 82, trend: "up", insight: "High renter density, low saturation" },
  { city: "Nashville, TN", score: 79, trend: "up", insight: "Rapid expansion, underserved areas" },
  { city: "Charlotte, NC", score: 78, trend: "up", insight: "Growing suburbs, new construction" }
];

const journeyPaths = [
  {
    id: "plan",
    icon: Lightbulb,
    headline: "First-Time Buyer?",
    description: "Avoid the $200K mistakes new owners make",
    features: ["ROI Calculator", "Funding Options", "Due Diligence Guides"],
    link: "/startup-funding",
    color: "blue"
  },
  {
    id: "evaluate",
    icon: Target,
    headline: "Evaluating a Deal?",
    description: "Know if the asking price is fair before you sign",
    features: ["CLEANBI Location Score", "Instant Valuations", "Deal Listings"],
    link: "/laundromat-listings",
    color: "green"
  },
  {
    id: "operate",
    icon: Settings,
    headline: "Current Owner?",
    description: "Boost your revenue by 20-30% with proven tools",
    features: ["AI Diagnostics", "Design Studio", "Equipment Deals"],
    link: "/equipment-marketplace",
    color: "orange"
  },
  {
    id: "partner",
    icon: Users,
    headline: "Vendor or Broker?",
    description: "Get in front of 72,000+ serious buyers",
    features: ["List Products", "Premium Ads", "Affiliate Program"],
    link: "/directory",
    color: "purple"
  }
];

const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  blue: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" },
  green: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" },
  orange: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500", hover: "hover:border-amber-500/40" },
  purple: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" }
};

const stats = [
  { value: "72,000+", label: "Industry Professionals" },
  { value: "220+", label: "Countries Covered" },
  { value: "50+", label: "Business Tools" },
  { value: "4.9", label: "User Rating", icon: Star }
];

export default function Home() {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [dealCalcPrice, setDealCalcPrice] = useState("");
  const [dealCalcRevenue, setDealCalcRevenue] = useState("");
  const [dealCalcResult, setDealCalcResult] = useState<{ verdict: string; color: string; multiple: number } | null>(null);
  
  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown) {
        setShowExitIntent(true);
        setExitIntentShown(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [exitIntentShown]);

  // Deal risk calculator logic
  const calculateDealRisk = () => {
    const price = parseFloat(dealCalcPrice.replace(/[^0-9.]/g, ""));
    const revenue = parseFloat(dealCalcRevenue.replace(/[^0-9.]/g, ""));
    if (!price || !revenue) return;
    
    const multiple = price / revenue;
    let verdict = "";
    let color = "";
    
    if (multiple <= 2.0) {
      verdict = "Great Deal - Below market value";
      color = "text-green-500";
    } else if (multiple <= 3.0) {
      verdict = "Fair Price - At market value";
      color = "text-amber-500";
    } else if (multiple <= 4.0) {
      verdict = "Premium Price - Negotiate down";
      color = "text-orange-500";
    } else {
      verdict = "Overpriced - Walk away or negotiate hard";
      color = "text-red-500";
    }
    
    setDealCalcResult({ verdict, color, multiple });
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": ["The Laundromat Bible", "The #1 Laundromat Resource Hub", "CLEANBI", "Laundromat Business Resources"],
    "url": baseUrl,
    "description": "The #1 laundromat resource and educational hub with CLEANBI scoring, marketplace, AI consulting, and professional tools.",
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "logo": { "@type": "ImageObject", "url": `${baseUrl}/washbizhub-logo.png` }
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${baseUrl}/cleanbi-auto?address={address_string}` },
        "query-input": "required name=address_string"
      }
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "description": "The #1 laundromat resource hub serving 72,000+ industry professionals worldwide with free tools, calculators, and business resources.",
    "foundingDate": "2024",
    "numberOfEmployees": { "@type": "QuantitativeValue", "value": "10-50" },
    "slogan": "The #1 Laundromat Resource Hub",
    "knowsAbout": ["laundromat business", "coin laundry operations", "laundromat investment", "commercial laundry equipment", "laundromat valuation"],
    "sameAs": ["https://www.facebook.com/washbizhub1", "https://twitter.com/washbizhub", "https://www.linkedin.com/company/washbizhub"]
  };

  const siteNavigationSchema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Main Navigation",
    "hasPart": [
      { "@type": "SiteNavigationElement", "name": "CLEANBI Score", "url": `${baseUrl}/cleanbi-auto` },
      { "@type": "SiteNavigationElement", "name": "Laundromat Listings", "url": `${baseUrl}/laundromat-listings` },
      { "@type": "SiteNavigationElement", "name": "Calculators", "url": `${baseUrl}/calculators` },
      { "@type": "SiteNavigationElement", "name": "Blog", "url": `${baseUrl}/blog` },
      { "@type": "SiteNavigationElement", "name": "Pricing", "url": `${baseUrl}/pricing` },
      { "@type": "SiteNavigationElement", "name": "About Us", "url": `${baseUrl}/about-us` },
      { "@type": "SiteNavigationElement", "name": "Courses", "url": `${baseUrl}/courses` },
      { "@type": "SiteNavigationElement", "name": "Directory", "url": `${baseUrl}/directory` }
    ]
  };

  const homepageFaqs = [
    {
      question: "What is WashBizHub?",
      answer: "WashBizHub is the #1 laundromat resource and educational hub, serving over 72,000 industry professionals worldwide. We provide CLEANBI™ universal business scoring, AI-powered consulting, marketplace for equipment and businesses, professional courses, 50+ calculators, and comprehensive industry resources for laundromat owners, investors, operators, and vendors."
    },
    {
      question: "What laundromat business resources does WashBizHub offer?",
      answer: "WashBizHub provides comprehensive laundromat business resources including: 50+ ROI and valuation calculators, CLEANBI location scoring for 220+ countries, Service Guy AI for equipment diagnostics, 2,200+ error code database, professional courses and certifications, marketplace for buying/selling businesses and equipment, design studio for floor plans, and access to 72,000+ member community forum."
    },
    {
      question: "What free laundromat tools are available on WashBizHub?",
      answer: "WashBizHub offers many free tools including: unlimited basic CLEANBI location scores, 50+ business calculators (ROI, valuation, break-even, TPD), Service Guy AI diagnostics (2 free messages), 2D Design Studio for floor planning, error code database access, community forum, blog content, and marketplace browsing. No login required for basic features."
    },
    {
      question: "What is the CLEANBI score?",
      answer: "CLEANBI is a proprietary location intelligence system that rates any business or property from 0-100 using a 17-factor weighted algorithm developed by industry veterans. It works for any business type or residential property in 220+ countries. One free analysis per day, premium reports from $99."
    },
    {
      question: "How much does it cost to open a laundromat?",
      answer: "Opening a laundromat typically costs between $200,000 to $1,000,000+ depending on location, size, and whether you're building new or retrofitting existing space. Key costs include: equipment ($100K-$500K), build-out/renovation ($50K-$300K), permits and licenses ($5K-$15K), initial inventory and supplies ($5K-$10K), and working capital. Use WashBizHub's ROI calculator to estimate costs for your specific situation."
    },
    {
      question: "What is the average ROI for a laundromat?",
      answer: "Laundromats typically generate 20-35% cash-on-cash returns, making them one of the most profitable small business investments. Average net operating margins range from 15-35%, with well-run operations achieving higher margins. Factors affecting ROI include location, machine efficiency, pricing strategy, and operating costs."
    },
    {
      question: "How do I value a laundromat for purchase?",
      answer: "Laundromats are typically valued at 2.5x to 4x annual net operating income (NOI). Key valuation factors include: gross revenue, net income, equipment age and condition, lease terms, location demographics, and competition. Premium valuations (3.5x-4x+) apply to turnkey operations with newer equipment. WashBizHub's valuation calculator provides instant estimates."
    },
    {
      question: "What laundromat software does WashBizHub provide?",
      answer: "WashBizHub offers enterprise-grade laundromat software including: WashBizPOS point-of-sale system with dynamic pricing, AI predictive maintenance alerts, IoT machine monitoring, route optimization for delivery, website builder with SEO, CLEANBI location intelligence, and comprehensive analytics dashboards. Start with a free 14-day trial."
    }
  ];

  const structuredData = [websiteSchema, organizationSchema, siteNavigationSchema];
  
  return (
    <>
      <SEO
        title="WashBizHub - #1 Laundromat Business Resources & Software Platform"
        description="Free laundromat tools: CLEANBI scoring, 50+ calculators, AI diagnostics. Join 72,000+ professionals. ROI calculators, marketplace, POS system."
        canonicalUrl="/"
        keywords={[
          "laundromat business resources",
          "laundromat software",
          "laundromat management software",
          "free laundromat tools",
          "laundromat marketplace",
          "CLEANBI business scoring",
          "laundromat investment calculator",
          "coin laundry business",
          "laundromat for sale",
          "laundromat ROI calculator",
          "how to buy a laundromat",
          "laundromat valuation",
          "laundromat POS system",
          "laundromat business plan",
          "laundromat industry resources"
        ]}
        structuredData={structuredData}
        faqs={homepageFaqs}
        speakableSelectors={["h1", "h2", ".speakable", "[data-testid='text-choose-path-heading']"]}
        breadcrumbs={[{ name: "Home", url: "/" }]}
      />
      
      <div className="min-h-screen bg-background">
        {/* 1. HERO - Primary value prop + CLEANBI demo */}
        <Hero />

        {/* Trust Indicators - Professional trust signals */}
        <section className="py-4 border-b border-border/30" data-testid="section-trust-indicators">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Trusted by 72,000+ owners</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calculator className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">50+ professional calculators</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">AI-powered insights</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Since 2024</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* 2. TRUST PROOF - Compact social proof bar */}
        <section className="py-8 border-b border-border/50 bg-muted/30" data-testid="section-trust-proof">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center" data-testid={`stat-${idx}`}>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl md:text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                    {stat.icon && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS - Social proof with real results */}
        <section className="py-16 bg-background" data-testid="section-testimonials">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
                Real Results from Real Investors
              </h2>
              <p className="text-muted-foreground">See why 72,000+ professionals trust WashBizHub</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="p-6 bg-card border border-border/50" data-testid={`testimonial-${idx}`}>
                  <Quote className="w-8 h-8 text-accent/30 mb-4" />
                  <p className="text-foreground mb-4 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      {testimonial.dealSize}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 3. CHOOSE YOUR PATH - Route visitors to deeper pages */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/20" data-testid="section-choose-path">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Your Next Step
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-choose-path-heading">
                What Brings You Here Today?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Pick your situation - we'll show you exactly what you need
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {journeyPaths.map((path) => {
                const Icon = path.icon;
                const colors = colorClasses[path.color];
                return (
                  <Link key={path.id} href={path.link}>
                    <Card 
                      className={`p-6 h-full border-2 ${colors.border} ${colors.hover} hover-elevate transition-all cursor-pointer group bg-card`}
                      data-testid={`card-path-${path.id}`}
                    >
                      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2" data-testid={`text-path-title-${path.id}`}>
                        {path.headline}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {path.description}
                      </p>
                      <ul className="space-y-2 mb-5">
                        {path.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className={`flex items-center ${colors.text} text-sm font-semibold group-hover:translate-x-1 transition-transform`}>
                        Explore
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* DEAL RISK CALCULATOR - Quick valuation widget */}
        <section className="py-16 bg-muted/20" data-testid="section-deal-calculator">
          <div className="max-w-2xl mx-auto px-6 lg:px-8">
            <Card className="p-6 md:p-8 bg-card border-2 border-accent/30">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-foreground">Quick Deal Check</h3>
              </div>
              <p className="text-muted-foreground text-center mb-6">
                Is the asking price reasonable? Find out in 10 seconds.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Asking Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="350,000"
                      value={dealCalcPrice}
                      onChange={(e) => setDealCalcPrice(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-accent"
                      data-testid="input-deal-price"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Annual Gross Revenue</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="120,000"
                      value={dealCalcRevenue}
                      onChange={(e) => setDealCalcRevenue(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-accent"
                      data-testid="input-deal-revenue"
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={calculateDealRisk} 
                className="w-full mb-4"
                data-testid="button-calculate-deal"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Check This Deal
              </Button>
              
              {dealCalcResult && (
                <div className="p-4 rounded-lg bg-muted/50 text-center" data-testid="deal-result">
                  <p className="text-sm text-muted-foreground mb-1">
                    Price-to-Revenue Multiple: <span className="font-bold text-foreground">{dealCalcResult.multiple.toFixed(1)}x</span>
                  </p>
                  <p className={`font-semibold ${dealCalcResult.color}`}>{dealCalcResult.verdict}</p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Based on industry-standard valuation multiples. For a complete analysis, use our full valuation calculator.
              </p>
            </Card>
          </div>
        </section>

        {/* 4. VALUE LADDER - Clear pricing progression */}
        <section className="py-16 bg-muted/30 border-t border-border/50" data-testid="section-value-ladder">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Start Free, Upgrade as You Grow
              </h2>
              <p className="text-muted-foreground">
                From free tools to enterprise solutions - pay only for what you need
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 border border-border/50 bg-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Free</div>
                  <div className="text-3xl font-bold text-accent mt-1">$0</div>
                  <p className="text-sm text-muted-foreground mt-2">1 CLEANBI/day, basic tools</p>
                  <Link href="/subscribe">
                    <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-free-tier">
                      Get Started
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">45,000+ users</p>
                </div>
              </Card>
              
              <Card className="p-5 border-2 border-accent/30 bg-card relative">
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs">
                  Most Popular
                </Badge>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Starter</div>
                  <div className="text-3xl font-bold text-accent mt-1">$29<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground mt-2">Unlimited CLEANBI, 3D views</p>
                  <Link href="/pricing">
                    <Button size="sm" className="mt-4 w-full" data-testid="button-starter-tier">
                      View Details
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">12,400+ active</p>
                </div>
              </Card>
              
              <Card className="p-5 border border-border/50 bg-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Pro</div>
                  <div className="text-3xl font-bold text-accent mt-1">$79<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground mt-2">AI insights, bulk analysis</p>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-pro-tier">
                      View Details
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">8,200+ active</p>
                </div>
              </Card>
              
              <Card className="p-5 border border-border/50 bg-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Enterprise</div>
                  <div className="text-3xl font-bold text-accent mt-1">$199<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground mt-2">API access, white-label</p>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-enterprise-tier">
                      View Details
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">320+ businesses</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* HOT MARKETS CAROUSEL */}
        <section className="py-12 bg-background border-t border-border/50" data-testid="section-hot-markets">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-bold text-foreground">Hot Markets This Week</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {hotMarkets.map((market, idx) => (
                <Card 
                  key={idx} 
                  className="flex-shrink-0 w-64 p-4 bg-card border border-border/50 snap-start"
                  data-testid={`hot-market-${idx}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{market.city}</span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      {market.score}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{market.insight}</p>
                  <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>Trending</span>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Based on aggregate CLEANBI scores and search volume. Updated weekly.
            </p>
          </div>
        </section>

        {/* PARTNER LOGOS / AS SEEN IN */}
        <section className="py-10 bg-muted/20" data-testid="section-partner-logos">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <p className="text-center text-sm text-muted-foreground mb-6">Trusted by industry leaders</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">SB</div>
                <span className="text-sm font-medium">Speed Queen</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">CD</div>
                <span className="text-sm font-medium">CoinDry</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">LO</div>
                <span className="text-sm font-medium">LaundryOwner</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">CL</div>
                <span className="text-sm font-medium">CLA</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">PD</div>
                <span className="text-sm font-medium">PayDry</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SINGLE SPOTLIGHT CTA - CLEANBI + Platform value */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-muted/20 to-background border-t border-border/50" data-testid="section-spotlight-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Trusted by 72,000+ Professionals
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Stop Guessing. Start Knowing.
            </h2>
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              Our proprietary algorithm crunches 17 weighted factors into one clear score. 
              Know if a location is worth it in 30 seconds - not 30 hours.
            </p>
            <p className="text-sm text-accent mb-10 italic">
              Developed by laundromat veterans with 50+ years combined experience
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/cleanbi-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 font-semibold" data-testid="button-try-cleanbi">
                  <Zap className="w-5 h-5 mr-2" />
                  Get Your Free Score
                </Button>
              </Link>
              <Link href="/cleanbi-explorer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" data-testid="button-explore-map">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore the Map
                </Button>
              </Link>
            </div>

            {/* Key benefits */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Spot Winners Fast</span>
                <span className="text-xs text-muted-foreground">Industry-calibrated scoring</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Avoid Bad Deals</span>
                <span className="text-xs text-muted-foreground">See red flags instantly</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Negotiate Smarter</span>
                <span className="text-xs text-muted-foreground">Data backs your offer</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SIMPLE FOOTER CTA */}
        <section className="py-16 bg-primary text-primary-foreground" data-testid="section-footer-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Your Next Laundromat Shouldn't Be a Gamble
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              72,000+ owners and investors trust WashBizHub to find winning locations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cleanbi-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 font-semibold" data-testid="button-get-started">
                  Score a Location Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-talk-expert">
                  See All Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border md:hidden z-50" data-testid="sticky-mobile-cta">
        <Link href="/cleanbi-auto">
          <Button className="w-full font-semibold" size="lg" data-testid="button-sticky-cta">
            <Zap className="w-5 h-5 mr-2" />
            Score a Location Free
          </Button>
        </Link>
      </div>

      {/* EXIT INTENT POPUP */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" data-testid="exit-intent-popup">
          <Card className="max-w-md w-full p-6 bg-card relative animate-in zoom-in-95">
            <button 
              onClick={() => setShowExitIntent(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              data-testid="button-close-exit-intent"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Wait! Don't Leave Empty-Handed
              </h3>
              <p className="text-muted-foreground">
                Get our free "7-Point Due Diligence Checklist" - the same one used by 8,000+ investors.
              </p>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Location red flags to watch for
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Financial verification steps
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Equipment inspection guide
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Lease negotiation tips
              </li>
            </ul>
            
            <Link href="/subscribe">
              <Button className="w-full mb-3" data-testid="button-get-checklist">
                <FileText className="w-4 h-4 mr-2" />
                Get Free Checklist
              </Button>
            </Link>
            <button 
              onClick={() => setShowExitIntent(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              data-testid="button-no-thanks"
            >
              No thanks, I'll skip this
            </button>
          </Card>
        </div>
      )}
    </>
  );
}
