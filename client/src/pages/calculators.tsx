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
  StatCard, MetricCard, Gauge, ProgressBar, DonutChart, MiniBarChart,
  DashboardGrid, SectionHeader, FilterPills
} from "@/components/dashboard/DashboardComponents";
import {
  Calculator, Search, DollarSign, TrendingUp, Users, Building2,
  FileText, BarChart3, Wrench, Shield, Zap, Crown, ArrowRight, Truck,
  Target, PieChart, Activity, Percent, Clock, Star
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
  { id: 'all', name: 'All', icon: Calculator, color: '#8b5cf6' },
  { id: 'financial', name: 'Financial', icon: DollarSign, color: '#10b981' },
  { id: 'operational', name: 'Operations', icon: Wrench, color: '#f59e0b' },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: '#ec4899' },
  { id: 'real-estate', name: 'Real Estate', icon: Building2, color: '#3b82f6' },
  { id: 'startup', name: 'Startup', icon: FileText, color: '#14b8a6' },
  { id: 'logistics', name: 'Logistics', icon: Truck, color: '#f97316' },
  { id: 'simulation', name: 'Simulation', icon: BarChart3, color: '#6366f1' },
];

const CALCULATOR_METADATA: Record<CalculatorType, Omit<CalculatorMeta, 'id'>> = {
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
  capRate: { name: 'Cap Rate', slug: 'cap-rate', description: 'Capitalization rate calculator', category: 'real-estate', isPremium: false, difficulty: 'intermediate' },
  dscr: { name: 'DSCR', slug: 'dscr', description: 'Debt service coverage ratio', category: 'real-estate', isPremium: false, difficulty: 'intermediate' },
  grm: { name: 'Gross Rent Multiplier', slug: 'grm', description: 'GRM property valuation', category: 'real-estate', isPremium: false, difficulty: 'beginner' },
  oer: { name: 'Operating Expense Ratio', slug: 'oer', description: 'Expense efficiency metric', category: 'real-estate', isPremium: false, difficulty: 'intermediate' },
  depreciation: { name: 'Depreciation', slug: 'depreciation', description: 'Straight-line & declining balance', category: 'real-estate', isPremium: false, difficulty: 'intermediate' },
  rentAffordability: { name: 'Rent Affordability', slug: 'rent-affordability', description: 'Max affordable rent calculator', category: 'real-estate', isPremium: false, difficulty: 'beginner' },
  startupCost: { name: 'Startup Costs', slug: 'startup-cost', description: 'Total capital requirements', category: 'startup', isPremium: false, difficulty: 'intermediate' },
  insurance: { name: 'Insurance Estimator', slug: 'insurance', description: 'Annual insurance costs', category: 'startup', isPremium: false, difficulty: 'beginner' },
  expansionROI: { name: 'Expansion ROI', slug: 'expansion-roi', description: 'Growth investment analysis', category: 'startup', isPremium: false, difficulty: 'intermediate' },
  profitMargin: { name: 'Profit Margin', slug: 'profit-margin', description: 'Gross & net margin calculator', category: 'startup', isPremium: false, difficulty: 'beginner' },
  paybackPeriod: { name: 'Payback Period', slug: 'payback', description: 'Investment recovery timeline', category: 'startup', isPremium: false, difficulty: 'beginner' },
  routeOptimization: { name: 'Route Optimization', slug: 'route-optimization', description: 'Delivery cost calculator', category: 'logistics', isPremium: false, difficulty: 'advanced' },
  pickupDeliveryProfitability: { name: 'Pickup/Delivery Profit', slug: 'pickup-delivery', description: 'Service margin analysis', category: 'logistics', isPremium: false, difficulty: 'intermediate' },
  monteCarlo: { name: 'Monte Carlo Revenue', slug: 'monte-carlo', description: '10,000 simulation revenue forecaster', category: 'simulation', isPremium: true, difficulty: 'advanced' },
};

const ALL_CALCULATORS: CalculatorMeta[] = Object.keys(CALCULATOR_REGISTRY).map((id) => ({
  id: id as CalculatorType,
  ...CALCULATOR_METADATA[id as CalculatorType]
}));

const FEATURED_CALCULATORS = ['roi', 'valuation', 'tpd', 'loan', 'capRate', 'startupCost'];

export default function CalculatorsHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = ALL_CALCULATORS.filter(calc => {
    const matchesCategory = selectedCategory === 'all' || calc.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return ALL_CALCULATORS.length;
    return ALL_CALCULATORS.filter(c => c.category === categoryId).length;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'intermediate': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'advanced': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
      default: return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
    }
  };

  const getCategoryColor = (category: string) => {
    return CALCULATOR_CATEGORIES.find(c => c.id === category)?.color || '#8b5cf6';
  };

  const categoryData = CALCULATOR_CATEGORIES.slice(1).map(cat => ({
    label: cat.name,
    value: getCategoryCount(cat.id),
    color: cat.color,
  }));

  return (
    <>
      <SEO
        title="47 Laundromat Calculators & Business Tools | WashBizHub"
        description="Comprehensive suite of 47 professional calculators for laundromat owners - Business valuation, ROI analysis, NPV, IRR, pricing optimization, staffing requirements, route optimization, and 40+ more tools."
        canonicalUrl="/calculators"
        keywords={[
          "laundromat calculator", "laundry business ROI calculator", "laundromat valuation tool",
          "NPV calculator", "IRR calculator", "equipment depreciation", "cap rate calculator"
        ]}
        breadcrumbs={[{ name: "Calculators", url: "/calculators" }]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Laundromat Calculator Suite",
          "description": "Comprehensive suite of 47 professional calculators",
          "numberOfItems": 47
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Calculators", url: "/calculators" }]} />
          </div>
        </div>

        {/* Dashboard Header with Stats */}
        <section className="bg-background border-b">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {/* Top Stats Row */}
            <DashboardGrid cols={4}>
              <StatCard
                title="Total Calculators"
                value={47}
                subtitle="Professional tools"
                icon={Calculator}
                variant="purple"
              />
              <StatCard
                title="Categories"
                value={7}
                subtitle="Business areas covered"
                icon={PieChart}
                variant="pink"
              />
              <StatCard
                title="Free Tools"
                value={46}
                subtitle="No signup required"
                icon={Zap}
                variant="cyan"
              />
              <StatCard
                title="Pro Tools"
                value={1}
                subtitle="Advanced simulation"
                icon={Crown}
                variant="yellow"
              />
            </DashboardGrid>

            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search calculators by name or function..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-card border"
                  data-testid="input-search-calculators"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Dashboard Content */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Left Sidebar - Category Filters */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {CALCULATOR_CATEGORIES.map(category => {
                      const count = getCategoryCount(category.id);
                      const isActive = selectedCategory === category.id;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg' 
                              : 'hover:bg-muted'
                          }`}
                          data-testid={`category-${category.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${category.color}20` }}
                            >
                              <category.icon 
                                className="w-4 h-4" 
                                style={{ color: isActive ? 'currentColor' : category.color }}
                              />
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <Badge variant={isActive ? "secondary" : "outline"} className="ml-2">
                            {count}
                          </Badge>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Category Distribution Chart */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart
                      data={categoryData}
                      size={140}
                      thickness={20}
                      centerValue="47"
                      centerLabel="Total"
                      showLegend={false}
                    />
                    <div className="mt-4 space-y-2">
                      {categoryData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground">{item.label}</span>
                          </div>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Featured Calculators */}
                {selectedCategory === 'all' && !searchQuery && (
                  <div className="mb-8">
                    <SectionHeader
                      title="Featured Calculators"
                      subtitle="Most popular tools for laundromat analysis"
                      icon={Star}
                      color="#f59e0b"
                    />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {FEATURED_CALCULATORS.map(id => {
                        const calc = ALL_CALCULATORS.find(c => c.id === id);
                        if (!calc) return null;
                        const catColor = getCategoryColor(calc.category);
                        return (
                          <Link key={id} href={`/calc/${calc.slug}`}>
                            <Card className="hover-elevate cursor-pointer h-full border-2 hover:border-primary/50 transition-all">
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div 
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: `${catColor}20` }}
                                  >
                                    <Calculator className="w-6 h-6" style={{ color: catColor }} />
                                  </div>
                                  <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                                    <Star className="w-3 h-3 mr-1" /> Featured
                                  </Badge>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{calc.name}</h3>
                                <p className="text-sm text-muted-foreground">{calc.description}</p>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Results Count & Difficulty Legend */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{filteredCalculators.length}</span>
                    <span className="text-muted-foreground">calculator{filteredCalculators.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Difficulty:</span>
                    <div className="flex gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Beginner</Badge>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Intermediate</Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Advanced</Badge>
                    </div>
                  </div>
                </div>

                {/* Calculator Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCalculators.map(calc => {
                    const diffStyle = getDifficultyColor(calc.difficulty);
                    const catColor = getCategoryColor(calc.category);
                    const CategoryIcon = CALCULATOR_CATEGORIES.find(c => c.id === calc.category)?.icon || Calculator;

                    return (
                      <Card 
                        key={calc.id} 
                        className="hover-elevate group relative overflow-hidden"
                        data-testid={`card-calculator-${calc.id}`}
                      >
                        {/* Category Color Bar */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: catColor }}
                        />
                        
                        <CardContent className="p-5 pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${catColor}15` }}
                            >
                              <CategoryIcon className="w-5 h-5" style={{ color: catColor }} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} text-xs`}>
                                {calc.difficulty}
                              </Badge>
                              {calc.isPremium && (
                                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                                  <Crown className="w-3 h-3" />
                                </Badge>
                              )}
                            </div>
                          </div>

                          <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">
                            {calc.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {calc.description}
                          </p>

                          <Link href={`/calc/${calc.slug}`}>
                            <Button size="sm" className="w-full" data-testid={`button-use-${calc.id}`}>
                              Use Calculator
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Empty State */}
                {filteredCalculators.length === 0 && (
                  <Card className="p-12 text-center">
                    <Calculator className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No calculators found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your search or category filter</p>
                    <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                      Clear Filters
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-muted/30 py-16 border-t">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need Custom Analysis?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our AI consultant can provide personalized recommendations for your specific laundromat situation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/consultation">
                <Button size="lg">
                  <Zap className="w-4 h-4 mr-2" />
                  Talk to AI Consultant
                </Button>
              </Link>
              <Link href="/cleanbi-auto">
                <Button size="lg" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Try CLEANBI Score
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
