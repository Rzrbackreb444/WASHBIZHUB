import { useState } from "react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator, Search, DollarSign, TrendingUp, Users, Building2,
  FileText, BarChart3, Wrench, Shield, Zap, Crown, ArrowRight, Truck
} from "lucide-react";
import { CALCULATOR_REGISTRY, type CalculatorType } from "@shared/calculators";

interface CalculatorMeta {
  id: CalculatorType;
  name: string;
  slug: string;
  description: string;
  category: 'financial' | 'operational' | 'marketing' | 'real-estate' | 'startup' | 'logistics' | 'simulation';
  isPremium: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const CALCULATOR_CATEGORIES = [
  { id: 'all', name: 'All Calculators', icon: Calculator },
  { id: 'financial', name: 'Financial Analysis', icon: DollarSign },
  { id: 'operational', name: 'Operations', icon: Wrench },
  { id: 'marketing', name: 'Marketing & Growth', icon: TrendingUp },
  { id: 'real-estate', name: 'Real Estate', icon: Building2 },
  { id: 'startup', name: 'Startup & Planning', icon: FileText },
  { id: 'logistics', name: 'Logistics', icon: Truck },
  { id: 'simulation', name: 'Simulation', icon: BarChart3 },
];

// Metadata mapping for all calculators in CALCULATOR_REGISTRY
const CALCULATOR_METADATA: Record<CalculatorType, Omit<CalculatorMeta, 'id'>> = {
  // Financial Analysis (11)
  valuation: { name: 'Business Valuation', slug: 'valuation', description: 'SDE multiples + asset-based valuation', category: 'financial', isPremium: false, difficulty: 'intermediate' },
  roi: { name: 'ROI Calculator', slug: 'roi', description: 'Return on investment with annual breakdown', category: 'financial', isPremium: false, difficulty: 'intermediate' },
  npv: { name: 'Net Present Value', slug: 'npv', description: 'Discounted cash flow analysis', category: 'financial', isPremium: false, difficulty: 'advanced' },
  irr: { name: 'Internal Rate of Return', slug: 'irr', description: 'Newton-Raphson IRR calculation', category: 'financial', isPremium: false, difficulty: 'advanced' },
  loan: { name: 'Loan Calculator', slug: 'loan', description: 'Monthly payment & amortization schedule', category: 'financial', isPremium: false, difficulty: 'beginner' },
  leaseVsBuy: { name: 'Lease vs Buy', slug: 'lease-vs-buy', description: 'Comprehensive NPV comparison', category: 'financial', isPremium: false, difficulty: 'intermediate' },
  clv: { name: 'Customer Lifetime Value', slug: 'clv', description: 'LTV with retention curves', category: 'financial', isPremium: false, difficulty: 'intermediate' },
  cac: { name: 'Customer Acquisition Cost', slug: 'cac', description: 'Marketing CAC & payback period', category: 'financial', isPremium: false, difficulty: 'beginner' },
  taxDeduction: { name: 'Tax Deductions', slug: 'tax-deduction', description: 'Annual tax savings estimator', category: 'financial', isPremium: false, difficulty: 'intermediate' },
  exitValuation: { name: 'Exit Valuation', slug: 'exit-valuation', description: 'Future business valuation projector', category: 'financial', isPremium: false, difficulty: 'advanced' },
  subscriptionRevenue: { name: 'Subscription Revenue', slug: 'subscription-revenue', description: 'MRR/ARR with churn modeling', category: 'financial', isPremium: false, difficulty: 'advanced' },
  // Operational (11)
  tpd: { name: 'Turns Per Day', slug: 'tpd', description: 'Equipment utilization & capacity', category: 'operational', isPremium: false, difficulty: 'beginner' },
  utilities: { name: 'Utility Costs', slug: 'utilities', description: 'Water, gas, electric projections', category: 'operational', isPremium: false, difficulty: 'beginner' },
  energyCost: { name: 'Energy Cost', slug: 'energy-cost', description: 'Peak/off-peak electric analysis', category: 'operational', isPremium: false, difficulty: 'intermediate' },
  waterCost: { name: 'Water Cost', slug: 'water-cost', description: 'Consumption + sewer analysis', category: 'operational', isPremium: false, difficulty: 'beginner' },
  laborCost: { name: 'Labor Cost', slug: 'labor-cost', description: 'Payroll + taxes + benefits', category: 'operational', isPremium: false, difficulty: 'intermediate' },
  machineUtilization: { name: 'Machine Utilization', slug: 'machine-utilization', description: 'Capacity & efficiency metrics', category: 'operational', isPremium: false, difficulty: 'intermediate' },
  staffing: { name: 'Staffing Requirements', slug: 'staffing', description: 'FTE requirements by volume', category: 'operational', isPremium: false, difficulty: 'intermediate' },
  staffProductivity: { name: 'Staff Productivity', slug: 'staff-productivity', description: 'Orders/hour & labor efficiency', category: 'operational', isPremium: false, difficulty: 'intermediate' },
  maintenanceCost: { name: 'Maintenance Cost', slug: 'maintenance-cost', description: 'Annual budget projector', category: 'operational', isPremium: false, difficulty: 'intermediate' },
  peakHourAnalysis: { name: 'Peak Hour Analysis', slug: 'peak-hour', description: 'Staffing multiplier calculator', category: 'operational', isPremium: false, difficulty: 'intermediate' },
  seasonalDemand: { name: 'Seasonal Demand', slug: 'seasonal-demand', description: 'Annual revenue forecaster', category: 'operational', isPremium: false, difficulty: 'intermediate' },
  // Marketing & Growth (11)
  pricing: { name: 'Pricing Optimizer', slug: 'pricing', description: 'Demand-based pricing engine', category: 'marketing', isPremium: false, difficulty: 'advanced' },
  pricingOptimizer: { name: 'Price Per Pound', slug: 'price-per-pound', description: 'Competitive pricing analysis', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  revenuePerSqFt: { name: 'Revenue Per Sq Ft', slug: 'revenue-sqft', description: 'Space utilization metric', category: 'marketing', isPremium: false, difficulty: 'beginner' },
  marketingROI: { name: 'Marketing ROI', slug: 'marketing-roi', description: 'Campaign return calculator', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  churnRate: { name: 'Churn Rate', slug: 'churn-rate', description: 'Customer retention analysis', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  emailROI: { name: 'Email Campaign ROI', slug: 'email-roi', description: 'Email marketing analyzer', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  referralProgram: { name: 'Referral Program', slug: 'referral-program', description: 'Referral ROI calculator', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  loyaltyProgramROI: { name: 'Loyalty Program ROI', slug: 'loyalty-roi', description: 'Retention program value', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  socialMediaROI: { name: 'Social Media ROI', slug: 'social-roi', description: 'Social campaign analyzer', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  websiteConversion: { name: 'Website Conversion', slug: 'conversion', description: 'Conversion rate optimizer', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  competitivePricing: { name: 'Competitive Pricing', slug: 'competitive-pricing', description: 'Market position analysis', category: 'marketing', isPremium: false, difficulty: 'intermediate' },
  // Real Estate (6)
  capRate: { name: 'Cap Rate', slug: 'cap-rate', description: 'Capitalization rate calculator', category: 'real-estate', isPremium: false, difficulty: 'intermediate' },
  dscr: { name: 'DSCR', slug: 'dscr', description: 'Debt service coverage ratio', category: 'real-estate', isPremium: false, difficulty: 'intermediate' },
  grm: { name: 'Gross Rent Multiplier', slug: 'grm', description: 'GRM property valuation', category: 'real-estate', isPremium: false, difficulty: 'beginner' },
  oer: { name: 'Operating Expense Ratio', slug: 'oer', description: 'Expense efficiency metric', category: 'real-estate', isPremium: false, difficulty: 'intermediate' },
  depreciation: { name: 'Depreciation', slug: 'depreciation', description: 'Straight-line & declining balance', category: 'real-estate', isPremium: false, difficulty: 'intermediate' },
  rentAffordability: { name: 'Rent Affordability', slug: 'rent-affordability', description: 'Max affordable rent calculator', category: 'real-estate', isPremium: false, difficulty: 'beginner' },
  // Startup & Planning (5)
  startupCost: { name: 'Startup Costs', slug: 'startup-cost', description: 'Total capital requirements', category: 'startup', isPremium: false, difficulty: 'intermediate' },
  insurance: { name: 'Insurance Estimator', slug: 'insurance', description: 'Annual insurance costs', category: 'startup', isPremium: false, difficulty: 'beginner' },
  expansionROI: { name: 'Expansion ROI', slug: 'expansion-roi', description: 'Growth investment analysis', category: 'startup', isPremium: false, difficulty: 'intermediate' },
  profitMargin: { name: 'Profit Margin', slug: 'profit-margin', description: 'Gross & net margin calculator', category: 'startup', isPremium: false, difficulty: 'beginner' },
  paybackPeriod: { name: 'Payback Period', slug: 'payback', description: 'Investment recovery timeline', category: 'startup', isPremium: false, difficulty: 'beginner' },
  // Logistics (2)
  routeOptimization: { name: 'Route Optimization', slug: 'route-optimization', description: 'Delivery cost calculator', category: 'logistics', isPremium: false, difficulty: 'advanced' },
  pickupDeliveryProfitability: { name: 'Pickup/Delivery Profit', slug: 'pickup-delivery', description: 'Service margin analysis', category: 'logistics', isPremium: false, difficulty: 'intermediate' },
  // Simulation (1)
  monteCarlo: { name: 'Monte Carlo Revenue', slug: 'monte-carlo', description: '10,000 simulation revenue forecaster', category: 'simulation', isPremium: true, difficulty: 'advanced' },
};

// Generate calculator list from registry + metadata
const ALL_CALCULATORS: CalculatorMeta[] = Object.keys(CALCULATOR_REGISTRY).map((id) => ({
  id: id as CalculatorType,
  ...CALCULATOR_METADATA[id as CalculatorType]
}));

export default function CalculatorsHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter calculators
  const filteredCalculators = ALL_CALCULATORS.filter(calc => {
    const matchesCategory = selectedCategory === 'all' || calc.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <>
      <SEO
        title="47 Laundromat Calculators & Business Tools | WashBizHub"
        description="Comprehensive suite of 47 professional calculators for laundromat owners - Business valuation, ROI analysis, NPV, IRR, pricing optimization, staffing requirements, route optimization, and 40+ more tools. Production-grade formulas with instant results."
        canonicalUrl="/calculators"
        keywords={[
          "laundromat calculator",
          "laundry business ROI calculator",
          "laundromat valuation tool",
          "NPV calculator",
          "IRR calculator",
          "equipment depreciation",
          "cap rate calculator",
          "pricing optimization",
          "laundromat financial tools",
          "coin laundry business calculators"
        ]}
        breadcrumbs={[
          { name: "Calculators", url: "/calculators" }
        ]}
        author={{
          name: "WashBizHub Analytics Team",
          expertise: "Laundromat Financial Analysis & Operations",
          credentials: "Production-grade calculators with industry-standard formulas"
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Laundromat Calculator Suite",
          "description": "Comprehensive suite of 47 professional calculators for laundromat business analysis",
          "numberOfItems": 47,
          "itemListElement": [
            {
              "@type": "SoftwareApplication",
              "position": 1,
              "name": "Business Valuation Calculator",
              "applicationCategory": "BusinessApplication",
              "url": "/valuation-calculator"
            },
            {
              "@type": "SoftwareApplication",
              "position": 2,
              "name": "ROI Calculator",
              "applicationCategory": "BusinessApplication",
              "url": "/roi-calculator"
            },
            {
              "@type": "SoftwareApplication",
              "position": 3,
              "name": "CLEANBI Scorecard",
              "applicationCategory": "BusinessApplication",
              "url": "/cleanbi-calculator"
            },
            {
              "@type": "SoftwareApplication",
              "position": 4,
              "name": "Loan Calculator",
              "applicationCategory": "BusinessApplication",
              "url": "/loan-calculator"
            },
            {
              "@type": "SoftwareApplication",
              "position": 5,
              "name": "Turns Per Day Calculator",
              "applicationCategory": "BusinessApplication",
              "url": "/tpd-calculator"
            }
          ]
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Calculators", url: "/calculators" }]} />
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <Calculator className="w-3 h-3 mr-1" />
              47 Professional Tools
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
              Laundromat Calculator Suite
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
              From valuation and ROI analysis to route optimization and seasonal forecasting - the most comprehensive 
              toolkit for laundromat investors, owners, and operators. All with production-grade formulas and instant results.
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-card border-border"
                  data-testid="input-search-calculators"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-muted/30 p-2">
                {CALCULATOR_CATEGORIES.map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`tab-${category.id}`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Results Count */}
            <div className="mb-6 text-muted-foreground">
              Showing {filteredCalculators.length} calculator{filteredCalculators.length !== 1 ? 's' : ''}
            </div>

            {/* Calculator Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculators.map(calc => (
                <Card key={calc.id} className="hover-elevate group" data-testid={`card-calculator-${calc.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getDifficultyColor(calc.difficulty)}>
                        {calc.difficulty}
                      </Badge>
                      {calc.isPremium && (
                        <Badge className="bg-accent/20 text-accent border-accent/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {calc.name}
                    </CardTitle>
                    <CardDescription>{calc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/calc/${calc.slug}`}>
                      <Button className="w-full hover-elevate active-elevate-2" data-testid={`button-use-calculator-${calc.id}`}>
                        Use Calculator
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredCalculators.length === 0 && (
              <div className="text-center py-20">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No calculators found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters
                </p>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Need Custom Analysis?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Our AI consultant can provide personalized recommendations based on your specific situation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/consultation">
                <Button size="lg" className="bg-primary hover-elevate active-elevate-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Talk to AI Consultant
                </Button>
              </Link>
              <Link href="/subscribe">
                <Button size="lg" variant="outline" className="hover-elevate active-elevate-2">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
// SEO data for calculators page already has SEO via imported component at line 3
