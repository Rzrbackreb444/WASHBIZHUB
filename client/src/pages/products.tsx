import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Check, X, MapPin, TrendingUp, Building2, Users, BarChart3, 
  FileText, Calculator, Target, Zap, Crown, Shield, Globe,
  ArrowRight, Play, Star, Sparkles, ChevronRight, LineChart,
  PieChart, Map, Layers, Lock, Unlock, Brain, Rocket,
  DollarSign, Award, CheckCircle2, Clock, Infinity
} from "lucide-react";

function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function GlassCard({ children, className = "", highlight = false }: { children: React.ReactNode; className?: string; highlight?: boolean }) {
  return (
    <div className={`relative rounded-2xl border ${highlight ? 'border-[#C8A661]/50 bg-[#C8A661]/5' : 'border-white/10 bg-white/5'} backdrop-blur-xl ${className}`}>
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-[#C8A661] to-[#b8860b] text-white border-0 px-4 py-1">
            <Star className="w-3 h-3 mr-1" /> Most Popular
          </Badge>
        </div>
      )}
      {children}
    </div>
  );
}

const PRICING_TIERS = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Get started with essential tools",
    icon: Unlock,
    color: "from-slate-500 to-slate-600",
    features: [
      { name: "CLEANBI Explorer", included: true, limit: "1 analysis/day" },
      { name: "Basic Location Score", included: true },
      { name: "Valuation Calculator", included: true, limit: "Limited" },
      { name: "ROI Calculator", included: true },
      { name: "Industry Resources", included: true },
      { name: "Premium Reports", included: false },
      { name: "Competitor Dashboard", included: false },
      { name: "Expansion Planner", included: false },
      { name: "Bulk Analysis", included: false },
      { name: "API Access", included: false },
    ],
    cta: "Start Free",
    ctaLink: "/cleanbi-explorer",
  },
  {
    name: "Starter",
    price: 29,
    period: "/month",
    description: "For serious buyers & new owners",
    icon: Rocket,
    color: "from-blue-500 to-blue-600",
    features: [
      { name: "CLEANBI Explorer", included: true, limit: "20 analyses/day" },
      { name: "Full Location Score", included: true },
      { name: "Valuation Calculator", included: true, limit: "Unlimited" },
      { name: "ROI Calculator Pro", included: true },
      { name: "Industry Resources", included: true },
      { name: "Premium Reports", included: true, limit: "3/month" },
      { name: "Competitor Dashboard", included: true, limit: "Basic" },
      { name: "Expansion Planner", included: false },
      { name: "Bulk Analysis", included: false },
      { name: "API Access", included: false },
    ],
    cta: "Get Starter",
    ctaLink: "/subscribe?plan=starter",
  },
  {
    name: "Pro",
    price: 99,
    period: "/month",
    description: "For owners & active investors",
    icon: Crown,
    color: "from-[#C8A661] to-[#b8860b]",
    highlight: true,
    features: [
      { name: "CLEANBI Explorer", included: true, limit: "100 analyses/day" },
      { name: "Full Location Score + AI", included: true },
      { name: "Valuation Calculator", included: true, limit: "Unlimited" },
      { name: "ROI Calculator Pro", included: true },
      { name: "Industry Resources", included: true },
      { name: "Premium Reports", included: true, limit: "Unlimited" },
      { name: "Competitor Dashboard", included: true, limit: "Full" },
      { name: "Expansion Planner", included: true },
      { name: "Bulk Analysis", included: true, limit: "50 locations" },
      { name: "API Access", included: false },
    ],
    cta: "Get Pro",
    ctaLink: "/subscribe?plan=pro",
  },
  {
    name: "Enterprise",
    price: 299,
    period: "/month",
    description: "For brokers & multi-location owners",
    icon: Building2,
    color: "from-[#1e3a5f] to-[#1e3a5f]/80",
    features: [
      { name: "CLEANBI Explorer", included: true, limit: "Unlimited" },
      { name: "Full Location Score + AI", included: true },
      { name: "Valuation Calculator", included: true, limit: "White-label" },
      { name: "ROI Calculator Pro", included: true },
      { name: "Industry Resources", included: true },
      { name: "Premium Reports", included: true, limit: "White-label" },
      { name: "Competitor Dashboard", included: true, limit: "Multi-location" },
      { name: "Expansion Planner", included: true },
      { name: "Bulk Analysis", included: true, limit: "500 locations" },
      { name: "API Access", included: true },
    ],
    cta: "Contact Sales",
    ctaLink: "/contact?inquiry=enterprise",
  },
];

const PRODUCTS = [
  {
    id: "cleanbi-explorer",
    name: "CLEANBI Explorer™",
    tagline: "The Viral Location Intelligence Tool",
    description: "Analyze any address instantly with our proprietary scoring algorithm. Get demographic data, competitor mapping, and investment grades in seconds.",
    icon: Map,
    color: "from-[#C8A661] to-[#b8860b]",
    link: "/cleanbi-explorer",
    features: ["A/B/C Grading System", "Competitor Mapping", "Demographics Analysis", "Street View Integration", "Shareable Reports"],
    forWho: ["Buyers", "Investors", "Brokers"],
    stats: { label: "Analyses Run", value: "10,000+" },
  },
  {
    id: "premium-reports",
    name: "Premium CLEANBI Reports",
    tagline: "Professional Investment Reports",
    description: "Generate comprehensive PDF reports with AI-powered insights, Vision AI photo analysis, and detailed market breakdowns for any location.",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    link: "/cleanbi-reports",
    features: ["AI Market Analysis", "Vision AI Photos", "PDF Export", "Competitor Intel", "Investment Scoring"],
    forWho: ["Buyers", "Sellers", "Brokers"],
    stats: { label: "Starting at", value: "$199" },
  },
  {
    id: "expansion-planner",
    name: "Expansion Planner",
    tagline: "Multi-Location Analysis",
    description: "Compare up to 25 locations side-by-side. Detect territory cannibalization, optimize your portfolio, and find your next winning location.",
    icon: Layers,
    color: "from-[#1e3a5f] to-[#C8A661]",
    link: "/expansion-planner",
    features: ["25 Location Comparison", "Cannibalization Detection", "Portfolio Optimization", "Territory Mapping", "ROI Projections"],
    forWho: ["Multi-location Owners", "Franchises"],
    stats: { label: "Locations Analyzed", value: "5,000+" },
  },
  {
    id: "competitor-dashboard",
    name: "Competitor Intelligence",
    tagline: "Real-Time Market Monitoring",
    description: "Monitor your competition 24/7. Get alerts on new openings, pricing changes, sentiment analysis, and SWOT breakdowns for any market.",
    icon: Target,
    color: "from-red-500 to-pink-500",
    link: "/competitor-dashboard",
    features: ["Real-time Alerts", "Sentiment Analysis", "SWOT Analysis", "Pricing Intel", "Market Share Tracking"],
    forWho: ["Owners", "Investors"],
    stats: { label: "Markets Tracked", value: "500+" },
  },
  {
    id: "bulk-analysis",
    name: "Bulk Analysis Tool",
    tagline: "Enterprise-Grade Processing",
    description: "Upload CSV/XLSX with up to 500 locations. Perfect for brokers, REITs, and portfolio managers who need to analyze at scale.",
    icon: BarChart3,
    color: "from-[#1e3a5f] to-[#1e3a5f]/80",
    link: "/bulk-analysis",
    features: ["500 Location Upload", "Google Sheets Sync", "API Integration", "Batch Processing", "Export Options"],
    forWho: ["Brokers", "REITs", "Enterprises"],
    stats: { label: "Enterprise Price", value: "$999/mo" },
  },
  {
    id: "valuation-calculator",
    name: "Valuation Calculator",
    tagline: "Know Your True Value",
    description: "Industry-standard valuation using SDE/EBITDA multiples, lease adjustments, and equipment depreciation. Compare to market benchmarks.",
    icon: Calculator,
    color: "from-[#1e3a5f] to-[#C8A661]",
    link: "/valuation-calculator",
    features: ["SDE/EBITDA Methods", "Lease Impact Analysis", "Equipment Depreciation", "Market Comparables", "PDF Reports"],
    forWho: ["Sellers", "Buyers", "Brokers"],
    stats: { label: "Avg Accuracy", value: "95%" },
  },
];

const TESTIMONIALS = [
  {
    quote: "CLEANBI Explorer helped me find a location that increased my revenue by 40%. The competitor mapping alone is worth the subscription.",
    author: "Mike R.",
    role: "Multi-location Owner, Texas",
    rating: 5,
  },
  {
    quote: "I use the Premium Reports for every deal I present to clients. It's professional, comprehensive, and closes deals faster.",
    author: "Sarah L.",
    role: "Business Broker, California",
    rating: 5,
  },
  {
    quote: "The Expansion Planner saved me from opening a location that would have cannibalized my existing store. Worth every penny.",
    author: "James T.",
    role: "Franchise Owner, Florida",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "What's included in the free plan?",
    a: "The free plan includes 5 CLEANBI analyses total, basic valuation calculator access, ROI calculator, and access to our industry resources library. Perfect for getting started and exploring the platform.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, you'll keep your current plan until the end of your billing cycle.",
  },
  {
    q: "What's the difference between Pro and Enterprise?",
    a: "Pro is designed for individual owners and investors with generous limits. Enterprise includes white-label reports, API access, unlimited analyses, and priority support - perfect for brokers and multi-location operators.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 14 days for a full refund.",
  },
  {
    q: "How accurate is the CLEANBI scoring?",
    a: "CLEANBI uses real-time data from Google Maps, US Census, and proprietary algorithms. Our location scores have a 95%+ correlation with actual business performance based on our validation studies.",
  },
];

export default function ProductsHub() {
  const [, setLocation] = useLocation();
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeProduct, setActiveProduct] = useState("cleanbi-explorer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8A661]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A661] to-[#b8860b] border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-slate-300">
                Trusted by <span className="text-[#C8A661] font-semibold">72,600+</span> laundromat professionals
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              The Complete Toolkit for
              <span className="block mt-2 bg-gradient-to-r from-[#C8A661] via-[#C8A661] to-[#b8860b] bg-clip-text text-transparent">
                Laundromat Success
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
              From location analysis to business valuation, competitor intelligence to expansion planning — 
              everything you need to buy, run, and grow a profitable laundromat business.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#C8A661] to-[#b8860b] hover:from-[#b8860b] hover:to-[#996f0a] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#C8A661]/25"
                onClick={() => setLocation("/cleanbi-explorer")}
                data-testid="button-try-free"
              >
                <Play className="w-5 h-5 mr-2" />
                Try CLEANBI Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-view-pricing"
              >
                View Pricing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Facebook Community", value: 72600, suffix: "+", icon: Users, id: "facebook" },
              { label: "Locations Analyzed", value: 50000, suffix: "+", icon: MapPin, id: "locations" },
              { label: "Active Users", value: 2500, suffix: "+", icon: TrendingUp, id: "users" },
              { label: "Premium Reports", value: 1200, suffix: "+", icon: FileText, id: "reports" },
            ].map((stat, i) => (
              <div key={i} className="text-center" data-testid={`stat-${stat.id}`}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#C8A661]/10 mb-3">
                  <stat.icon className="w-6 h-6 text-[#C8A661]" />
                </div>
                <p className="text-3xl font-bold text-white" data-testid={`stat-value-${stat.id}`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding & Business Plan Section - Conversion Funnel */}
      <section className="py-16 border-b border-white/10" id="funding-tools">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="outline" className="border-green-500/50 text-green-500 mb-4">
              <DollarSign className="w-3 h-3 mr-1" />
              Get Funded
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Secure Funding?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Start with our free SBA Readiness Check, then get an AI-generated business plan that lenders love.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* SBA Readiness Checker */}
            <GlassCard className="p-6 hover-elevate">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">SBA Readiness Check</h3>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">FREE</Badge>
                  </div>
                  <p className="text-slate-400 mb-4">
                    2-minute quiz to see if you qualify for SBA financing. Get your readiness score and personalized recommendations.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 2 min
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Instant results
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> No credit check
                    </span>
                  </div>
                  <Button
                    onClick={() => setLocation("/sba-readiness")}
                    className="bg-gradient-to-r from-green-500 to-green-600"
                    data-testid="button-sba-readiness"
                  >
                    Check My Readiness
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Business Plan Generator */}
            <GlassCard className="p-6 hover-elevate" highlight>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8A661] to-[#b8860b] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">AI Business Plan</h3>
                    <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">$299</Badge>
                  </div>
                  <p className="text-slate-400 mb-4">
                    Generate a complete, SBA-ready business plan in minutes. Professional financial projections lenders require.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI-Powered
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> PDF & Word
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" /> 5-Year Projections
                    </span>
                  </div>
                  <Button
                    onClick={() => setLocation("/business-plan-generator")}
                    className="bg-gradient-to-r from-[#C8A661] to-[#b8860b]"
                    data-testid="button-business-plan"
                  >
                    Generate Business Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Funnel Flow Indicator */}
          <div className="flex items-center justify-center gap-4 mt-8 text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 text-sm font-bold">1</span>
              </div>
              <span className="text-sm">Check Readiness</span>
            </div>
            <ChevronRight className="w-4 h-4" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                <span className="text-[#C8A661] text-sm font-bold">2</span>
              </div>
              <span className="text-sm">Get Business Plan</span>
            </div>
            <ChevronRight className="w-4 h-4" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-sm font-bold">3</span>
              </div>
              <Link href="/larry-larsen" className="text-sm text-blue-400 hover:text-blue-300">
                Expert Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="py-20" id="products">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="border-[#C8A661]/50 text-[#C8A661] mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Our Products
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powerful Tools for Every Stage
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Whether you're buying your first laundromat or managing a portfolio, we have the tools you need.
            </p>
          </div>

          {/* Product Tabs */}
          <Tabs value={activeProduct} onValueChange={setActiveProduct} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0 mb-8">
              {PRODUCTS.map((product) => (
                <TabsTrigger
                  key={product.id}
                  value={product.id}
                  className="data-[state=active]:bg-[#C8A661]/20 data-[state=active]:text-[#C8A661] data-[state=active]:border-[#C8A661]/50 border border-white/10 rounded-lg px-4 py-2 text-slate-400 hover:text-white transition-all"
                  data-testid={`tab-${product.id}`}
                >
                  <product.icon className="w-4 h-4 mr-2" />
                  {product.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {PRODUCTS.map((product) => (
              <TabsContent key={product.id} value={product.id} className="mt-0">
                <GlassCard className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${product.color} mb-6`}>
                        <product.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                      <p className="text-[#C8A661] font-medium mb-4">{product.tagline}</p>
                      <p className="text-slate-400 mb-6">{product.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {product.forWho.map((who) => (
                          <Badge key={who} variant="outline" className="border-white/20 text-slate-300">
                            {who}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-3 mb-8">
                        {product.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        className={`bg-gradient-to-r ${product.color} hover:opacity-90 text-white px-6 py-3 rounded-xl`}
                        onClick={() => setLocation(product.link)}
                        data-testid={`button-try-${product.id}`}
                      >
                        Try {product.name.split(' ')[0]}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center">
                        <div className="text-center p-8">
                          <product.icon className={`w-24 h-24 mx-auto mb-4 text-transparent bg-gradient-to-br ${product.color} bg-clip-text`} style={{ stroke: 'url(#gradient)' }} />
                          <p className="text-2xl font-bold text-white">{product.stats.value}</p>
                          <p className="text-slate-400">{product.stats.label}</p>
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${product.color} rounded-full blur-2xl opacity-30`}></div>
                      <div className={`absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br ${product.color} rounded-full blur-3xl opacity-20`}></div>
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-slate-950/50" id="pricing">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="border-[#C8A661]/50 text-[#C8A661] mb-4">
              <DollarSign className="w-3 h-3 mr-1" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Start free, upgrade when you're ready. All plans include our core tools.
            </p>

            {/* Annual Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-full bg-white/5 border border-white/10">
              <span className={`px-4 py-2 rounded-full transition-all ${!isAnnual ? 'bg-[#C8A661] text-white' : 'text-slate-400'}`}>
                Monthly
              </span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} data-testid="switch-billing-toggle" />
              <span className={`px-4 py-2 rounded-full transition-all ${isAnnual ? 'bg-[#C8A661] text-white' : 'text-slate-400'}`}>
                Annual <span className="text-green-400 text-sm">(Save 20%)</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => (
              <GlassCard key={tier.name} highlight={tier.highlight} className="p-6 flex flex-col">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} mb-4`}>
                  <tier.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{tier.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${isAnnual && tier.price > 0 ? Math.floor(tier.price * 0.8) : tier.price}
                  </span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>

                <div className="space-y-3 flex-1 mb-6">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                        {feature.name}
                        {feature.limit && feature.included && (
                          <span className="text-xs text-slate-500 ml-1">({feature.limit})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${tier.highlight ? 'bg-gradient-to-r from-[#C8A661] to-[#b8860b] hover:from-[#b8860b] hover:to-[#996f0a] text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  onClick={() => setLocation(tier.ctaLink)}
                  data-testid={`button-${tier.name.toLowerCase()}-plan`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </GlassCard>
            ))}
          </div>

          {/* Enterprise CTA */}
          <div className="mt-12 text-center">
            <GlassCard className="inline-flex items-center gap-4 px-6 py-4">
              <Building2 className="w-8 h-8 text-[#1e3a5f]" />
              <div className="text-left">
                <p className="text-white font-medium">Need a custom solution?</p>
                <p className="text-sm text-slate-400">We offer white-label and API access for brokers & enterprises</p>
              </div>
              <Button variant="outline" className="border-[#1e3a5f]/50 text-[#C8A661] hover:bg-[#1e3a5f]/10" onClick={() => setLocation("/contact?inquiry=enterprise")} data-testid="button-enterprise-contact">
                Contact Sales
              </Button>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="border-[#C8A661]/50 text-[#C8A661] mb-4">
              <Star className="w-3 h-3 mr-1" />
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by Laundromat Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <GlassCard key={i} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-[#C8A661] fill-[#C8A661]" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8A661] to-[#b8860b] flex items-center justify-center text-white font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.author}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-gradient-to-b from-transparent to-slate-950/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Full Feature Comparison</h2>
            <p className="text-slate-400">See exactly what's included in each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Feature</th>
                  {PRICING_TIERS.map((tier) => (
                    <th key={tier.name} className="text-center py-4 px-4">
                      <span className={`text-white font-bold ${tier.highlight ? 'text-[#C8A661]' : ''}`}>
                        {tier.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRICING_TIERS[0].features.map((feature, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-slate-300">{feature.name}</td>
                    {PRICING_TIERS.map((tier) => {
                      const tierFeature = tier.features[i];
                      return (
                        <td key={tier.name} className="text-center py-4 px-4">
                          {tierFeature.included ? (
                            <div className="flex flex-col items-center">
                              <Check className="w-5 h-5 text-green-500" />
                              {tierFeature.limit && (
                                <span className="text-xs text-slate-500 mt-1">{tierFeature.limit}</span>
                              )}
                            </div>
                          ) : (
                            <X className="w-5 h-5 text-slate-600 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4" data-testid="accordion-faq">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-white/10 rounded-xl px-6 bg-white/5" data-testid={`accordion-item-faq-${i}`}>
                <AccordionTrigger className="text-white hover:text-[#C8A661] py-4" data-testid={`accordion-trigger-faq-${i}`}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 pb-4" data-testid={`accordion-content-faq-${i}`}>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <GlassCard className="p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C8A661]/10 to-[#b8860b]/10"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C8A661] to-[#b8860b] mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Grow Your Laundromat Business?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                Join 72,600+ laundromat professionals who trust WashBizHub for location intelligence, 
                business analysis, and growth tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#C8A661] to-[#b8860b] hover:from-[#b8860b] hover:to-[#996f0a] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#C8A661]/25"
                  onClick={() => setLocation("/cleanbi-explorer")}
                  data-testid="button-final-cta"
                >
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                  onClick={() => setLocation("/subscribe?plan=pro")}
                  data-testid="button-final-pro"
                >
                  Get Pro Access
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-20"></div>
    </div>
  );
}
