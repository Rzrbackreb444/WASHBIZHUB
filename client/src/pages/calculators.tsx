import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  FileText, BarChart3, Wrench, Shield, Zap, Crown, ArrowRight
} from "lucide-react";

interface Calculator {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'financial' | 'operational' | 'marketing' | 'due-diligence' | 'real-estate';
  isPremium: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  useCount?: number;
  rating?: number;
}

const CALCULATOR_CATEGORIES = [
  { id: 'all', name: 'All Calculators', icon: Calculator },
  { id: 'financial', name: 'Financial Analysis', icon: DollarSign },
  { id: 'due-diligence', name: 'Due Diligence', icon: Shield },
  { id: 'operational', name: 'Operations', icon: Wrench },
  { id: 'marketing', name: 'Marketing & Growth', icon: TrendingUp },
  { id: 'real-estate', name: 'Real Estate', icon: Building2 },
];

// Mock data - will be replaced with API call
const MOCK_CALCULATORS: Calculator[] = [
  {
    id: '1',
    name: 'ROI Calculator',
    slug: 'roi-calculator',
    description: 'Calculate return on investment for laundromat purchases with payback period analysis',
    category: 'financial',
    isPremium: false,
    difficulty: 'intermediate',
    useCount: 12450,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Revenue Calculator',
    slug: 'revenue-calculator',
    description: 'Project monthly and annual revenue based on machine count, turns, and utilization',
    category: 'financial',
    isPremium: false,
    difficulty: 'beginner',
    useCount: 15230,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Water Bill Analyzer',
    slug: 'water-bill-analyzer',
    description: 'Upload 36 months of water bills - AI detects fraud and calculates real load volume',
    category: 'due-diligence',
    isPremium: true,
    difficulty: 'advanced',
    useCount: 3420,
    rating: 5.0,
  },
  {
    id: '4',
    name: 'Lease Risk Scoring',
    slug: 'lease-risk-scoring',
    description: 'AI-powered lease analysis - identifies red flags, escalation risks, and negotiation opportunities',
    category: 'due-diligence',
    isPremium: true,
    difficulty: 'advanced',
    useCount: 2890,
    rating: 4.9,
  },
  {
    id: '5',
    name: 'Equipment Age Calculator',
    slug: 'equipment-age-calculator',
    description: 'Batch serial number lookup - calculates equipment age, remaining life, replacement timeline',
    category: 'due-diligence',
    isPremium: true,
    difficulty: 'intermediate',
    useCount: 4120,
    rating: 4.8,
  },
  {
    id: '6',
    name: 'Demographic Score',
    slug: 'demographic-score',
    description: 'Market profitability analysis using Census + ATTOM data - scores location potential 1-100',
    category: 'due-diligence',
    isPremium: true,
    difficulty: 'advanced',
    useCount: 1950,
    rating: 4.9,
  },
  {
    id: '7',
    name: 'Competitive Density Map',
    slug: 'competitive-density-map',
    description: 'Interactive Google Maps showing laundromats within 1-5 miles - calculates saturation index',
    category: 'due-diligence',
    isPremium: true,
    difficulty: 'intermediate',
    useCount: 3680,
    rating: 5.0,
  },
  {
    id: '8',
    name: 'Utility Cost Analyzer',
    slug: 'utility-cost-analyzer',
    description: 'Compare water, electric, gas costs against benchmarks - identify savings opportunities',
    category: 'operational',
    isPremium: false,
    difficulty: 'beginner',
    useCount: 8920,
    rating: 4.7,
  },
  {
    id: '9',
    name: 'Labor Cost Estimator',
    slug: 'labor-cost-estimator',
    description: 'Calculate optimal staffing requirements and labor costs for your location',
    category: 'operational',
    isPremium: false,
    difficulty: 'intermediate',
    useCount: 6140,
    rating: 4.6,
  },
  {
    id: '10',
    name: 'Per-Pound Pricing Optimizer',
    slug: 'per-pound-pricing-optimizer',
    description: 'AI recommends optimal per-pound pricing ($1.25-$2.25/lb) based on market analysis',
    category: 'operational',
    isPremium: true,
    difficulty: 'advanced',
    useCount: 2340,
    rating: 4.9,
  },
];

export default function CalculatorsHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter calculators
  const filteredCalculators = MOCK_CALCULATORS.filter(calc => {
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
        title="50+ Laundromat Calculators & Business Tools"
        description="Comprehensive suite of 50+ professional calculators for laundromat owners - ROI analysis, valuation tools, water bill fraud detection, lease risk scoring, demographic analysis, competitive mapping, and operational optimization. Free and premium tools available."
        canonicalUrl="/calculators"
        keywords={[
          "laundromat calculator",
          "laundry business ROI calculator",
          "laundromat valuation tool",
          "water bill fraud detection",
          "lease risk analysis",
          "equipment age calculator",
          "demographic profitability score",
          "competitive density mapping",
          "laundromat due diligence tools",
          "coin laundry financial calculators"
        ]}
        breadcrumbs={[
          { name: "Calculators", url: "/calculators" }
        ]}
        author={{
          name: "WashBizHub Analytics Team",
          expertise: "Laundromat Financial Analysis & Due Diligence",
          credentials: "Powered by 50+ years combined industry experience and AI-driven analytics"
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
              50+ Professional Tools
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
              Laundromat Calculator Suite
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
              From basic ROI analysis to advanced AI-powered due diligence - the most comprehensive 
              toolkit for laundromat investors, owners, and brokers.
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
                    <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                      {calc.useCount && (
                        <span>{calc.useCount.toLocaleString()} uses</span>
                      )}
                      {calc.rating && (
                        <span className="flex items-center gap-1">
                          ⭐ {calc.rating}
                        </span>
                      )}
                    </div>
                    <Link href={`/${calc.slug}`}>
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
