import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calculator, 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  ShoppingCart,
  Search,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  DollarSign,
  BarChart3,
  Building2,
  Zap,
  Bot,
  Globe,
  CreditCard,
  Truck,
  Wrench,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Plus,
  Filter,
  Grid3X3,
  List
} from "lucide-react";

type CalculatorTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  tags: string[];
  pricingType: 'free' | 'freemium' | 'paid' | 'subscription';
  price: string;
  iconName?: string;
  primaryColor?: string;
  viewCount: number;
  useCount: number;
  rating: string;
  reviewCount: number;
  featured: boolean;
  creatorId: string;
};

const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: Grid3X3, color: '#6366F1' },
  { id: 'calculators', name: 'Calculators', icon: Calculator, color: '#00A699' },
  { id: 'dashboards', name: 'Dashboards', icon: LayoutDashboard, color: '#F59E0B' },
  { id: 'templates', name: 'Templates', icon: FileText, color: '#8B5CF6' },
  { id: 'forms', name: 'Forms', icon: ClipboardList, color: '#EC4899' },
  { id: 'pos', name: 'POS Systems', icon: ShoppingCart, color: '#10B981' },
  { id: 'agents', name: 'AI Agents', icon: Bot, color: '#3B82F6' },
  { id: 'websites', name: 'Websites', icon: Globe, color: '#EF4444' },
];

const PRICING_FILTERS = [
  { id: 'all', name: 'All Pricing' },
  { id: 'free', name: 'Free' },
  { id: 'freemium', name: 'Freemium' },
  { id: 'paid', name: 'Premium' },
];

// Featured system tools with Calculoid-style colorful designs
const FEATURED_SYSTEM_TOOLS = [
  {
    id: 'wdf-calculator',
    name: 'Wash-Dry-Fold Calculator',
    shortDescription: 'Calculate pricing, profits, and capacity for your WDF service',
    category: 'calculators',
    icon: Sparkles,
    color: '#00A699',
    gradient: 'from-teal-500 to-cyan-600',
    stats: { users: '2.4K', rating: 4.9 },
    featured: true,
    pricingType: 'free',
    slug: '/calculators/wdf',
  },
  {
    id: 'pud-calculator',
    name: 'Pickup & Delivery Calculator',
    shortDescription: 'Route optimization, pricing, and delivery zone profitability',
    category: 'calculators',
    icon: Truck,
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    stats: { users: '1.8K', rating: 4.8 },
    featured: true,
    pricingType: 'free',
    slug: '/calculators/pud',
  },
  {
    id: 'roi-calculator',
    name: 'ROI & Investment Calculator',
    shortDescription: 'Analyze equipment investments and payback periods',
    category: 'calculators',
    icon: TrendingUp,
    color: '#10B981',
    gradient: 'from-emerald-500 to-green-600',
    stats: { users: '3.1K', rating: 4.9 },
    featured: true,
    pricingType: 'free',
    slug: '/calculators/roi',
  },
  {
    id: 'valuation-calculator',
    name: 'Business Valuation Tool',
    shortDescription: 'Get accurate laundromat valuations using industry multiples',
    category: 'calculators',
    icon: Building2,
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-600',
    stats: { users: '4.2K', rating: 4.9 },
    featured: true,
    pricingType: 'freemium',
    slug: '/calculators/valuation',
  },
  {
    id: 'competition-intel',
    name: 'Competition Intelligence',
    shortDescription: 'Analyze competitors and find market opportunities',
    category: 'dashboards',
    icon: BarChart3,
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-600',
    stats: { users: '1.2K', rating: 4.7 },
    featured: true,
    pricingType: 'paid',
    slug: '/competition-intelligence',
  },
  {
    id: 'cleanbi-tool',
    name: 'CLEANBI™ Score Analyzer',
    shortDescription: 'Universal business & property intelligence scoring',
    category: 'dashboards',
    icon: Zap,
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-600',
    stats: { users: '8.5K', rating: 4.9 },
    featured: true,
    pricingType: 'freemium',
    slug: '/cleanbi',
  },
  {
    id: 'service-guy-ai',
    name: 'Service Guy AI',
    shortDescription: 'AI-powered equipment diagnostics and maintenance',
    category: 'agents',
    icon: Wrench,
    color: '#EF4444',
    gradient: 'from-red-500 to-orange-600',
    stats: { users: '956', rating: 4.8 },
    featured: true,
    pricingType: 'subscription',
    slug: '/service-guy-ai',
  },
  {
    id: 'laundromat-pos',
    name: 'Laundromat POS System',
    shortDescription: 'Complete point-of-sale with inventory and reporting',
    category: 'pos',
    icon: CreditCard,
    color: '#14B8A6',
    gradient: 'from-teal-500 to-emerald-600',
    stats: { users: '678', rating: 4.6 },
    featured: true,
    pricingType: 'subscription',
    slug: '/pos',
  },
];

// Icon mapping for dynamic icons
const ICON_MAP: Record<string, any> = {
  Calculator, LayoutDashboard, FileText, ClipboardList, ShoppingCart,
  Star, Users, TrendingUp, Sparkles, DollarSign, BarChart3, Building2,
  Zap, Bot, Globe, CreditCard, Truck, Wrench, BookOpen, CheckCircle2
};

function ToolCard({ tool, isSystemTool = false }: { tool: any; isSystemTool?: boolean }) {
  const [, setLocation] = useLocation();
  const IconComponent = isSystemTool ? tool.icon : (ICON_MAP[tool.iconName] || Calculator);
  const color = tool.color || tool.primaryColor || '#00A699';
  
  const getPricingBadge = (pricingType: string, price?: string) => {
    switch (pricingType) {
      case 'free':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Free</Badge>;
      case 'freemium':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Freemium</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">${price || '0'}</Badge>;
      case 'subscription':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pro</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 overflow-hidden"
      style={{ borderColor: `${color}20` }}
      onClick={() => setLocation(tool.slug || `/calculator-marketplace/${tool.id}`)}
      data-testid={`card-tool-${tool.id}`}
    >
      {/* Colorful top bar */}
      <div 
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div 
            className="p-3 rounded-xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${color}15` }}
          >
            <IconComponent className="h-6 w-6" style={{ color }} />
          </div>
          <div className="flex flex-col items-end gap-1">
            {tool.featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Star className="h-3 w-3 mr-1" fill="currentColor" />
                Featured
              </Badge>
            )}
            {getPricingBadge(tool.pricingType, tool.price)}
          </div>
        </div>
        <CardTitle className="text-lg mt-3 line-clamp-1">{tool.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {tool.shortDescription || tool.description}
        </CardDescription>
      </CardHeader>
      
      <CardFooter className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {isSystemTool ? tool.stats.users : tool.useCount?.toLocaleString() || '0'}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
            {isSystemTool ? tool.stats.rating : (parseFloat(tool.rating) || 0).toFixed(1)}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="group-hover:bg-primary group-hover:text-primary-foreground"
          data-testid={`button-use-${tool.id}`}
        >
          Use Tool <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function ToolCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-2 w-full bg-muted" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-3/4 mt-3" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardFooter className="pt-0">
        <Skeleton className="h-4 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function CalculatorMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPricing, setSelectedPricing] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [, setLocation] = useLocation();

  // Fetch community calculators
  const { data: communityTools, isLoading } = useQuery<CalculatorTemplate[]>({
    queryKey: ['/api/calculator-marketplace', selectedCategory, selectedPricing],
  });

  // Filter tools based on search and filters
  const filteredSystemTools = FEATURED_SYSTEM_TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesPricing = selectedPricing === 'all' || tool.pricingType === selectedPricing;
    return matchesSearch && matchesCategory && matchesPricing;
  });

  const filteredCommunityTools = (communityTools || []).filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tool.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesPricing = selectedPricing === 'all' || tool.pricingType === selectedPricing;
    return matchesSearch && matchesCategory && matchesPricing;
  });

  return (
    <AuthGuard title="Sign In to Access Calculator Marketplace" description="Sign in to access this calculator and track your usage.">
      <Helmet>
        <title>Business Tools Marketplace | WashBizHub</title>
        <meta name="description" content="Discover calculators, dashboards, templates, POS systems, and AI agents for your laundromat business. Build, customize, and monetize your own tools." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
          <div className="container mx-auto px-4 py-12 md:py-16 relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
                <Sparkles className="h-3 w-3 mr-1" />
                Community-Powered Tools
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Your Business,{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Your Tools
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Calculators, dashboards, templates, POS systems, AI agents, and more. 
                Build, customize, share, and monetize tools for your laundromat business.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search tools, calculators, templates..."
                  className="pl-12 pr-4 h-14 text-lg rounded-full border-2 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-tools"
                />
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">8+</div>
                  <div className="text-sm text-muted-foreground">Pro Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">15K+</div>
                  <div className="text-sm text-muted-foreground">Monthly Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.8</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">$0</div>
                  <div className="text-sm text-muted-foreground">To Start</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-8">
          {/* Category Tabs & Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {TOOL_CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <Button
                    key={cat.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`gap-2 ${isActive ? '' : 'hover:border-primary/50'}`}
                    style={isActive ? { backgroundColor: cat.color } : {}}
                    onClick={() => setSelectedCategory(cat.id)}
                    data-testid={`button-category-${cat.id}`}
                  >
                    <IconComp className="h-4 w-4" />
                    {cat.name}
                  </Button>
                );
              })}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Pricing Filter */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                {PRICING_FILTERS.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={selectedPricing === filter.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPricing(filter.id)}
                    data-testid={`button-pricing-${filter.id}`}
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                  data-testid="button-view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Create Tool Button */}
              <Button 
                className="gap-2"
                onClick={() => setLocation('/calculator-builder')}
                data-testid="button-create-tool"
              >
                <Plus className="h-4 w-4" />
                Create Tool
              </Button>
            </div>
          </div>

          {/* Featured WashBizHub Tools */}
          {filteredSystemTools.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">WashBizHub Pro Tools</h2>
                <Badge variant="outline" className="ml-2">Official</Badge>
              </div>
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {filteredSystemTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} isSystemTool />
                ))}
              </div>
            </div>
          )}

          {/* Community Tools */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Community Tools</h2>
              <Badge variant="outline" className="ml-2">Built by Users</Badge>
            </div>

            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(8)].map((_, i) => (
                  <ToolCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredCommunityTools.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {filteredCommunityTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Calculator className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No Community Tools Yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Be the first to create and share a tool with the laundromat community!
                  </p>
                  <Button 
                    className="gap-2 mt-2"
                    onClick={() => setLocation('/calculator-builder')}
                    data-testid="button-create-first-tool"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Tool
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Become a Creator CTA */}
          <Card className="mt-12 overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
              <CardContent className="relative p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <Badge className="mb-4" variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Creator Program
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                      Build Tools. Earn Money.
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-lg">
                      Create calculators, dashboards, templates, and more. 
                      Share them with the community and earn 80% of every sale. 
                      Your expertise, your income.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button size="lg" className="gap-2" onClick={() => setLocation('/calculator-builder')}>
                        Start Creating <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button size="lg" variant="outline" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Learn More
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">80% Revenue Share</div>
                        <div className="text-sm text-muted-foreground">You keep most of the earnings</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium">No Coding Required</div>
                        <div className="text-sm text-muted-foreground">Visual drag-and-drop builder</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium">Instant Publishing</div>
                        <div className="text-sm text-muted-foreground">Go live in minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </section>
      </div>
    </AuthGuard>
  );
}
