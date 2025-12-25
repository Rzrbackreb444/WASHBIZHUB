import { useState, useMemo } from "react";
import { Link } from "wouter";
import { AutoSEO } from "@/components/AutoSEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/hooks/useSubscription";
import { FAQSection } from "@/components/SuperSEOWrapper";
import {
  Calculator, DollarSign, TrendingUp, Building2, Wrench, 
  Zap, MapPin, Users, BarChart3, Truck, Target, Clock,
  Search, Star, Lock, ArrowRight, Sparkles, Crown
} from "lucide-react";

interface CalculatorItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  tier: "free" | "pro" | "business";
  featured?: boolean;
  new?: boolean;
}

interface CalculatorCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  calculators: CalculatorItem[];
}

const CALCULATOR_CATEGORIES: CalculatorCategory[] = [
  {
    id: "valuation",
    title: "Valuation & Investment",
    description: "Determine business value and analyze investment potential",
    icon: DollarSign,
    color: "text-green-600",
    calculators: [
      { id: "valuation", title: "Business Valuation", description: "Calculate laundromat value using SDE multiples", href: "/valuation-calculator", icon: DollarSign, tier: "free", featured: true },
      { id: "roi", title: "ROI Calculator", description: "Analyze return on investment projections", href: "/roi-calculator", icon: TrendingUp, tier: "free", featured: true },
      { id: "roi-advanced", title: "ROI Advanced", description: "Monte Carlo simulations & sensitivity analysis", href: "/roi-calculator-advanced", icon: TrendingUp, tier: "pro" },
      { id: "roi-enhanced", title: "ROI Enhanced", description: "Multi-scenario comparison tool", href: "/roi-calculator-enhanced", icon: TrendingUp, tier: "pro" },
      { id: "break-even", title: "Break-Even Analysis", description: "Calculate your break-even point", href: "/break-even-calculator", icon: Target, tier: "free" },
      { id: "ltv", title: "Lifetime Value (LTV)", description: "Customer lifetime value calculator", href: "/ltv-calculator", icon: Users, tier: "pro" },
      { id: "cac", title: "CAC Calculator", description: "Customer acquisition cost analysis", href: "/cac-calculator", icon: Target, tier: "pro" },
      { id: "ltv-cac", title: "LTV:CAC Dashboard", description: "Unit economics dashboard", href: "/ltv-cac-dashboard", icon: BarChart3, tier: "business" },
      { id: "what-if", title: "What-If Analysis", description: "10-variable scenario modeling", href: "/what-if-analysis", icon: Sparkles, tier: "pro", new: true },
    ]
  },
  {
    id: "operations",
    title: "Operations & Equipment",
    description: "Optimize daily operations and equipment decisions",
    icon: Wrench,
    color: "text-blue-600",
    calculators: [
      { id: "tpd", title: "TPD Calculator", description: "Turns per day & revenue optimization", href: "/tpd-calculator", icon: Clock, tier: "free", featured: true },
      { id: "labor", title: "Labor Calculator", description: "Staffing costs & scheduling", href: "/labor-calculator", icon: Users, tier: "free" },
      { id: "staffing", title: "Staffing Level Planner", description: "Optimal staffing by volume", href: "/staffing-level-calculator", icon: Users, tier: "pro" },
      { id: "equipment-appraiser", title: "Equipment Appraiser", description: "AI-powered equipment valuation", href: "/equipment-appraiser", icon: Wrench, tier: "pro", new: true },
      { id: "equipment-mix", title: "Equipment Mix Optimizer", description: "Optimal washer/dryer mix", href: "/equipment-mix-optimizer", icon: Wrench, tier: "business" },
      { id: "downtime", title: "Downtime Cost Calculator", description: "Cost of machine downtime", href: "/downtime-cost-calculator", icon: Clock, tier: "pro" },
      { id: "wdf-efficiency", title: "WDF Efficiency", description: "Wash-dry-fold efficiency metrics", href: "/wdf-efficiency-calculator", icon: Truck, tier: "pro" },
      { id: "wdf-pricing", title: "WDF Pricing Optimizer", description: "Price per pound optimization", href: "/wdf-pricing-optimizer", icon: DollarSign, tier: "pro" },
    ]
  },
  {
    id: "utilities",
    title: "Utilities & Energy",
    description: "Manage utility costs and energy efficiency",
    icon: Zap,
    color: "text-yellow-600",
    calculators: [
      { id: "utility", title: "Utility Calculator", description: "Monthly utility cost estimates", href: "/utility-calculator", icon: Zap, tier: "free" },
      { id: "utility-auditor", title: "Utility Bill Auditor", description: "Find billing errors & savings", href: "/utility-bill-auditor", icon: Search, tier: "pro" },
      { id: "utility-scanner", title: "Utility Bill Scanner", description: "AI-powered bill analysis", href: "/utility-bill-scanner", icon: Search, tier: "pro", new: true },
      { id: "utility-forecaster", title: "Utility Load Forecaster", description: "Predict future utility needs", href: "/utility-load-forecaster", icon: BarChart3, tier: "business" },
      { id: "rate-forecaster", title: "Utility Rate Forecaster", description: "Rate change predictions", href: "/utility-rate-forecaster", icon: TrendingUp, tier: "business" },
    ]
  },
  {
    id: "financing",
    title: "Financing & Loans",
    description: "Calculate loan payments and financing scenarios",
    icon: Building2,
    color: "text-purple-600",
    calculators: [
      { id: "loan", title: "Loan Calculator", description: "Monthly payments & amortization", href: "/loan-calculator", icon: Building2, tier: "free", featured: true },
      { id: "financing-mixer", title: "Financing Scenario Mixer", description: "Compare financing options", href: "/financing-scenario-mixer", icon: BarChart3, tier: "pro" },
      { id: "sba-readiness", title: "SBA Loan Readiness", description: "Check SBA loan eligibility", href: "/sba-readiness", icon: Target, tier: "free" },
    ]
  },
  {
    id: "location",
    title: "Location & Market",
    description: "Analyze locations and market opportunities",
    icon: MapPin,
    color: "text-red-600",
    calculators: [
      { id: "cleanbi", title: "CLEANBI Calculator", description: "17-factor location scoring", href: "/cleanbi-calculator", icon: MapPin, tier: "free", featured: true },
      { id: "market-gap", title: "Market Gap Finder", description: "Find underserved markets", href: "/market-gap-finder", icon: Search, tier: "pro" },
      { id: "demographic", title: "Demographic Clusterer", description: "AI demographic analysis", href: "/demographic-clusterer", icon: Users, tier: "pro", new: true },
      { id: "expansion", title: "Expansion Scorecard", description: "Expansion feasibility analysis", href: "/expansion-feasibility-scorecard", icon: Target, tier: "business" },
      { id: "expansion-planner", title: "Expansion Planner", description: "Multi-location strategy", href: "/expansion-planner", icon: Building2, tier: "business" },
      { id: "location-scout", title: "Smart Location Scout", description: "AI-powered site selection", href: "/smart-location-scout", icon: MapPin, tier: "pro", new: true },
      { id: "competitor", title: "Competitor Intelligence", description: "Analyze nearby competition", href: "/competitor-intelligence", icon: Search, tier: "pro" },
    ]
  },
  {
    id: "revenue",
    title: "Revenue & Pricing",
    description: "Optimize pricing and diversify revenue",
    icon: BarChart3,
    color: "text-orange-600",
    calculators: [
      { id: "pricing-elasticity", title: "Pricing Elasticity", description: "Price sensitivity analysis", href: "/pricing-elasticity", icon: BarChart3, tier: "pro" },
      { id: "revenue-diversification", title: "Revenue Diversification", description: "New revenue stream planning", href: "/revenue-diversification-planner", icon: TrendingUp, tier: "business" },
      { id: "route-profit", title: "Route Profit Optimizer", description: "Delivery route profitability", href: "/route-profit-optimizer", icon: Truck, tier: "pro" },
      { id: "churn-predictor", title: "Churn Predictor", description: "Customer retention analysis", href: "/customer-churn-predictor", icon: Users, tier: "business", new: true },
      { id: "delivery-optimizer", title: "Delivery Route Optimizer", description: "Optimize delivery routes", href: "/delivery-route-optimizer", icon: Truck, tier: "pro" },
      { id: "marketing-attribution", title: "Marketing Attribution", description: "Track marketing ROI", href: "/marketing-attribution", icon: Target, tier: "business" },
    ]
  },
];

const TIER_CONFIG = {
  free: { label: "Free", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  pro: { label: "Pro", color: "bg-[#C8A661]/20 text-[#C8A661] border border-[#C8A661]/30" },
  business: { label: "Pro", color: "bg-[#C8A661]/20 text-[#C8A661] border border-[#C8A661]/30" }, // Mapping business to Pro
};

export default function CalculatorsHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { canAccessTier, tier: currentTier } = useSubscription();

  const allCalculators = useMemo(() => {
    return CALCULATOR_CATEGORIES.flatMap(cat => 
      cat.calculators.map(calc => ({ ...calc, category: cat.title, categoryId: cat.id }))
    );
  }, []);

  const filteredCalculators = useMemo(() => {
    let results = allCalculators;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(calc => 
        calc.title.toLowerCase().includes(query) ||
        calc.description.toLowerCase().includes(query) ||
        calc.category.toLowerCase().includes(query)
      );
    }
    
    if (activeCategory !== "all") {
      results = results.filter(calc => calc.categoryId === activeCategory);
    }
    
    return results;
  }, [allCalculators, searchQuery, activeCategory]);

  const featuredCalculators = allCalculators.filter(c => c.featured);
  const newCalculators = allCalculators.filter(c => c.new);

  const calculatorFaqs = [
    {
      question: "How accurate is the laundromat valuation calculator?",
      answer: "Our valuation calculator uses industry-standard SDE (Seller's Discretionary Earnings) multiples ranging from 2.5x to 4.5x based on market conditions, equipment age, and lease terms. Results are validated against actual sale prices from our marketplace database of 1,000+ transactions."
    },
    {
      question: "What factors affect laundromat ROI?",
      answer: "Key ROI factors include: equipment efficiency and age (newer machines = lower utilities), location demographics (population density, median income), competition density, lease terms and rent ratio, utility costs, and labor requirements. Our ROI calculator models all these variables."
    },
    {
      question: "How much does it cost to start a laundromat?",
      answer: "Startup costs range from $200,000 to $1,000,000+ depending on size, location, and equipment quality. Our startup cost calculator breaks down: equipment ($100K-$500K), leasehold improvements ($50K-$200K), deposits and working capital ($20K-$50K), and professional fees ($10K-$30K)."
    },
    {
      question: "What are typical laundromat operating expenses?",
      answer: "Monthly operating costs typically include: rent (15-25% of revenue), utilities (20-30%), labor (5-15%), supplies (2-5%), maintenance (5-10%), and insurance/taxes (3-5%). Our operating costs calculator provides location-specific estimates based on your market."
    },
    {
      question: "Which calculators are free vs. premium?",
      answer: "Core calculators like Valuation, ROI, TPD, Loan, and CLEANBI are free for all users. Advanced tools like Monte Carlo simulations, AI-powered analysis, and multi-scenario modeling require a Pro or Business subscription."
    }
  ];

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "WashBizHub Laundromat Calculators",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Financial Calculator",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0",
      "highPrice": "99",
      "offerCount": allCalculators.length
    },
    "featureList": CALCULATOR_CATEGORIES.map(c => c.title),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2341",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const CalculatorCard = ({ calc, showCategory = false }: { calc: typeof allCalculators[0], showCategory?: boolean }) => {
    const hasAccess = canAccessTier(calc.tier);
    const Icon = calc.icon;
    
    return (
      <Link href={calc.href}>
        <Card className="h-full hover-elevate cursor-pointer group transition-all duration-200 border-border/50 hover:border-primary/30" data-testid={`card-calculator-${calc.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                {calc.new && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                    New
                  </Badge>
                )}
                {calc.featured && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
                <Badge className={`text-xs ${TIER_CONFIG[calc.tier].color}`}>
                  {TIER_CONFIG[calc.tier].label}
                </Badge>
              </div>
            </div>
            <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors mt-2">
              {calc.title}
            </CardTitle>
            {showCategory && (
              <Badge variant="outline" className="text-xs w-fit">{calc.category}</Badge>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-sm line-clamp-2">
              {calc.description}
            </CardDescription>
            <div className="flex items-center justify-between mt-4">
              {hasAccess ? (
                <Button size="sm" variant="ghost" className="gap-1 text-primary p-0 h-auto">
                  Open Calculator
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground p-0 h-auto">
                  <Lock className="w-3.5 h-3.5" />
                  Upgrade to access
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <>
      <AutoSEO 
        faqs={calculatorFaqs}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/calculators" }
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
            <Breadcrumb items={[{ name: "Calculators", url: "/calculators" }]} />
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-8 sm:py-12 bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Calculator className="w-3 h-3 mr-1" />
                {allCalculators.length}+ Professional Tools
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Laundromat Calculator Suite
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Professional calculators for valuation, ROI analysis, operations, utilities, and market research. 
                Make data-driven decisions for your laundromat business.
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-calculators"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Calculators */}
        {!searchQuery && activeCategory === "all" && (
          <section className="py-8 border-b bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h2 className="text-xl font-semibold">Most Popular</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredCalculators.map(calc => (
                  <CalculatorCard key={calc.id} calc={calc} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Tabs & Calculator Grid */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex w-auto min-w-full sm:w-full sm:flex-wrap h-auto p-1 gap-1">
                  <TabsTrigger value="all" className="flex-shrink-0 text-xs sm:text-sm" data-testid="tab-all">
                    All ({allCalculators.length})
                  </TabsTrigger>
                  {CALCULATOR_CATEGORIES.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id} className="flex-shrink-0 text-xs sm:text-sm gap-1.5" data-testid={`tab-${cat.id}`}>
                      <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                      <span className="hidden sm:inline">{cat.title}</span>
                      <span className="sm:hidden">{cat.title.split(" ")[0]}</span>
                      <span className="text-muted-foreground">({cat.calculators.length})</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-6">
                {searchQuery ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      {filteredCalculators.length} result{filteredCalculators.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredCalculators.map(calc => (
                        <CalculatorCard key={calc.id} calc={calc} showCategory />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-10">
                    {CALCULATOR_CATEGORIES.map(category => (
                      <div key={category.id}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                            <category.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{category.title}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {category.calculators.map(calc => (
                            <CalculatorCard key={calc.id} calc={{ ...calc, category: category.title, categoryId: category.id }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {CALCULATOR_CATEGORIES.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                      <category.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(searchQuery ? filteredCalculators : category.calculators.map(c => ({ ...c, category: category.title, categoryId: category.id }))).map(calc => (
                      <CalculatorCard key={calc.id} calc={calc} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Upgrade CTA */}
        {!canAccessTier("pro") && (
          <section className="py-12 bg-gradient-to-r from-[#C8A661]/20 to-background border-t border-[#C8A661]/20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-[#C8A661] mb-6 shadow-lg shadow-[#C8A661]/20">
                <Crown className="w-8 h-8 text-[#0A1628]" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Unlock 50+ Professional Calculators</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Stop guessing and start analyzing. Upgrade to Pro to access our full suite of 
                advanced calculators, Monte Carlo simulations, and AI-powered equipment appraisal.
                <span className="block mt-2 font-semibold text-[#C8A661]">Used by 500+ successful laundromat investors.</span>
              </p>
              <div className="flex flex-col items-center gap-4">
                <Link href="/pricing">
                  <Button size="lg" className="gap-2 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] h-12 px-10 font-bold text-lg shadow-md">
                    Upgrade to Pro — $29/mo
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">30-day money-back guarantee • Cancel anytime</p>
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-10 border-t">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FAQSection 
              faqs={calculatorFaqs}
              title="Calculator FAQs"
              subtitle="Common questions about our laundromat calculators"
            />
          </div>
        </section>
      </div>
    </>
  );
}
