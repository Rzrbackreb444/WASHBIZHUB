import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Search, MapPin, Calculator, BookOpen, Users, Wrench, DollarSign,
  Building2, TrendingUp, Palette, ShoppingCart, FileText, Zap,
  GraduationCap, MessageSquare, Award, BarChart3, Package, Globe,
  Shield, Briefcase, Heart, Phone, Calendar, Target, Lightbulb,
  PiggyBank, Truck, ClipboardList, Settings, Crown, Sparkles,
  ArrowRight, ExternalLink
} from "lucide-react";

interface FeatureItem {
  name: string;
  path: string;
  description: string;
  icon: any;
  badge?: string;
  isNew?: boolean;
  isPremium?: boolean;
}

interface FeatureCategory {
  name: string;
  icon: any;
  color: string;
  features: FeatureItem[];
}

const PLATFORM_FEATURES: FeatureCategory[] = [
  {
    name: "Location Intelligence",
    icon: MapPin,
    color: "text-green-500",
    features: [
      { name: "CLEANBI Explorer", path: "/cleanbi-explorer", description: "AI-powered location scoring for any US address", icon: MapPin, badge: "Flagship", isPremium: true },
      { name: "Laundromat Locator", path: "/laundromat-locator", description: "Find laundromats near any location", icon: MapPin },
      { name: "Distributor Locator", path: "/distributor-locator", description: "Find equipment dealers by brand & state", icon: Building2 },
      { name: "Smart Location Scout", path: "/smart-location-scout", description: "AI-powered site selection", icon: Target, isNew: true },
      { name: "Expansion Planner", path: "/expansion-planner", description: "Multi-location growth analysis", icon: TrendingUp, isPremium: true },
      { name: "Bulk Analysis", path: "/bulk-analysis", description: "Analyze multiple addresses at once", icon: BarChart3, isPremium: true },
    ]
  },
  {
    name: "Calculators & Tools",
    icon: Calculator,
    color: "text-blue-500",
    features: [
      { name: "Calculator Suite", path: "/calculators", description: "All professional calculators in one place", icon: Calculator },
      { name: "Valuation Calculator", path: "/valuation-calculator", description: "4 valuation methods for accurate pricing", icon: DollarSign },
      { name: "ROI Calculator", path: "/roi-calculator", description: "5-year projections with scenarios", icon: TrendingUp },
      { name: "What-If Analysis", path: "/what-if-analysis", description: "10-variable scenario modeling", icon: Lightbulb, isNew: true },
      { name: "Utility Calculator", path: "/utility-calculator", description: "UPG benchmarking & analysis", icon: Zap },
      { name: "Labor Calculator", path: "/labor-calculator", description: "Staffing optimization tool", icon: Users },
      { name: "TPD Calculator", path: "/tpd-calculator", description: "Turns per day analysis", icon: BarChart3 },
      { name: "Loan Calculator", path: "/loan-calculator", description: "SBA & equipment financing", icon: PiggyBank },
      { name: "Break-Even Calculator", path: "/break-even-calculator", description: "Find your profitability threshold", icon: Target },
      { name: "Utility Bill Auditor", path: "/utility-bill-auditor", description: "Scan bills for savings opportunities", icon: FileText },
    ]
  },
  {
    name: "Education & Courses",
    icon: GraduationCap,
    color: "text-purple-500",
    features: [
      { name: "Courses", path: "/courses", description: "Complete laundromat education library", icon: GraduationCap },
      { name: "Larry's Academy", path: "/larrys-academy", description: "Learn from 40-year veteran Larry Larsen", icon: Award },
      { name: "Laundromat Bible", path: "/laundromat-bible", description: "The complete owner's handbook", icon: BookOpen, badge: "Book" },
      { name: "Buyer's Guides", path: "/buyers-guides", description: "Due diligence & acquisition guides", icon: ClipboardList },
      { name: "Equipment Guides", path: "/equipment-guides", description: "Brand comparisons & specs", icon: Package },
      { name: "Template Vault", path: "/template-vault", description: "Business plans, checklists, LOIs", icon: FileText, isPremium: true },
    ]
  },
  {
    name: "Community & Network",
    icon: Users,
    color: "text-orange-500",
    features: [
      { name: "Member Network", path: "/network", description: "Connect with 73,000+ industry professionals", icon: Users },
      { name: "Forum", path: "/forum", description: "Discuss operations, deals, and more", icon: MessageSquare },
      { name: "Activity Feed", path: "/activity", description: "See what the community is doing", icon: Sparkles },
      { name: "Broker Directory", path: "/brokers", description: "Find verified laundromat brokers", icon: Briefcase },
      { name: "Vendor Directory", path: "/vendors", description: "Service providers & suppliers", icon: ShoppingCart },
      { name: "Industry Events", path: "/industry-events", description: "Conferences, trade shows, meetups", icon: Calendar },
    ]
  },
  {
    name: "Marketplace",
    icon: ShoppingCart,
    color: "text-red-500",
    features: [
      { name: "Laundromats for Sale", path: "/laundromat-listings", description: "Browse active business listings", icon: Building2 },
      { name: "Equipment Hub", path: "/equipment-hub", description: "New & used equipment marketplace", icon: Package },
      { name: "Equipment Matcher", path: "/equipment-matcher", description: "Find the right equipment for your needs", icon: Target },
      { name: "List Your Business", path: "/list-on-washbizhub", description: "Sell your laundromat or services", icon: DollarSign },
      { name: "Classifieds", path: "/classifieds", description: "Buy & sell equipment, services", icon: ShoppingCart },
      { name: "Superstore", path: "/superstore", description: "Supplies, accessories, merchandise", icon: Package },
    ]
  },
  {
    name: "Service Guy AI",
    icon: Wrench,
    color: "text-cyan-500",
    features: [
      { name: "Service Guy AI", path: "/service-guy-ai", description: "AI-powered equipment diagnostics", icon: Wrench, badge: "AI" },
      { name: "Error Code Database", path: "/error-codes", description: "20,000+ diagnostic codes", icon: FileText },
      { name: "Equipment Diagnostics", path: "/equipment-diagnostics", description: "Troubleshoot any machine", icon: Settings },
      { name: "Service Guy Demo", path: "/service-guy-demo", description: "Enterprise demo for distributors", icon: Zap, isNew: true },
    ]
  },
  {
    name: "Funding & Finance",
    icon: DollarSign,
    color: "text-emerald-500",
    features: [
      { name: "Funding Wizard", path: "/funding-wizard", description: "Match with 7+ vetted lenders", icon: PiggyBank },
      { name: "Startup Funding", path: "/startup-funding", description: "First-time buyer financing", icon: DollarSign },
      { name: "SBA Loans", path: "/funding", description: "Acquisition & expansion loans", icon: Building2 },
      { name: "Equipment Financing", path: "/equipment-financing", description: "New equipment loans & leases", icon: Package },
      { name: "Working Capital", path: "/working-capital-financing", description: "Cash flow solutions", icon: TrendingUp },
      { name: "Real Estate Financing", path: "/real-estate-financing", description: "Property purchase loans", icon: Building2 },
    ]
  },
  {
    name: "Operations & Management",
    icon: Settings,
    color: "text-indigo-500",
    features: [
      { name: "Command Center", path: "/command-center", description: "Customizable operator dashboard", icon: BarChart3, isPremium: true },
      { name: "Operator Dashboard", path: "/operator-dashboard", description: "Daily KPIs & operations", icon: Settings },
      { name: "POS Command Center", path: "/pos-command-center", description: "Complete point-of-sale system", icon: DollarSign },
      { name: "Machine Booking", path: "/machine-booking", description: "Online reservation system", icon: Calendar },
      { name: "Design Studio Pro", path: "/design-studio-pro", description: "2D/3D floor plan designer", icon: Palette },
      { name: "Delivery Route Optimizer", path: "/delivery-route-optimizer", description: "WDF pickup/delivery routes", icon: Truck },
    ]
  },
  {
    name: "Marketing & Growth",
    icon: TrendingUp,
    color: "text-pink-500",
    features: [
      { name: "Website Builder", path: "/website-builder", description: "Build your laundromat website", icon: Globe },
      { name: "SEO Command Center", path: "/seo-command-center", description: "Search optimization tools", icon: Search },
      { name: "AI Content Studio", path: "/ai-content-studio", description: "Generate marketing content", icon: Sparkles },
      { name: "Ad Builder", path: "/ad-builder", description: "Create social media ads", icon: Target },
      { name: "Referral Program", path: "/referrals", description: "Earn rewards for referrals", icon: Award },
    ]
  },
  {
    name: "AI Consultation",
    icon: Sparkles,
    color: "text-amber-500",
    features: [
      { name: "AI Consultation Council", path: "/ai-consultation-council", description: "Multi-AI expert panel analysis", icon: Sparkles, badge: "5 AIs", isPremium: true },
      { name: "Competitor Intelligence", path: "/competitor-intelligence", description: "Analyze local competition", icon: Target },
      { name: "Due Diligence Verifier", path: "/due-diligence-verifier", description: "AI-powered deal verification", icon: Shield },
      { name: "Business Plan Generator", path: "/business-plan-generator", description: "AI-generated business plans", icon: FileText },
    ]
  },
];

export default function PlatformDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCategories = useMemo(() => {
    if (!searchQuery && activeCategory === "all") return PLATFORM_FEATURES;
    
    return PLATFORM_FEATURES.map(category => ({
      ...category,
      features: category.features.filter(feature => {
        const matchesSearch = !searchQuery || 
          feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "all" || category.name === activeCategory;
        return matchesSearch && matchesCategory;
      })
    })).filter(category => category.features.length > 0);
  }, [searchQuery, activeCategory]);

  const totalFeatures = PLATFORM_FEATURES.reduce((sum, cat) => sum + cat.features.length, 0);

  return (
    <>
      <Helmet>
        <title>Platform Directory - All 100+ Features | WashBizHub</title>
        <meta name="description" content="Explore all WashBizHub features: CLEANBI location intelligence, calculators, courses, community, marketplace, Service Guy AI, funding tools, and more." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#16213e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <Badge className="bg-[#C8A661] text-[#0A1628] mb-4">
              {totalFeatures}+ FEATURES
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" data-testid="text-page-title">
              Platform Directory
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to buy, operate, grow, and sell laundromats. 
              The most comprehensive platform in the industry.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search all features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-[#16213e]/80 border-[#C8A661]/20 text-white placeholder:text-gray-500 h-14 text-lg"
                data-testid="input-search-features"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-12">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              className={activeCategory === "all" ? "bg-[#C8A661] text-[#0A1628]" : "border-[#C8A661]/40 text-gray-300"}
              data-testid="button-filter-all"
            >
              All Features
            </Button>
            {PLATFORM_FEATURES.map(category => (
              <Button
                key={category.name}
                variant={activeCategory === category.name ? "default" : "outline"}
                onClick={() => setActiveCategory(category.name)}
                className={activeCategory === category.name ? "bg-[#C8A661] text-[#0A1628]" : "border-[#C8A661]/40 text-gray-300"}
                data-testid={`button-filter-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>

          <div className="space-y-12">
            {filteredCategories.map(category => (
              <div key={category.name}>
                <div className="flex items-center gap-3 mb-6">
                  <category.icon className={`w-8 h-8 ${category.color}`} />
                  <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                  <Badge variant="outline" className="border-[#C8A661]/40 text-gray-400">
                    {category.features.length} tools
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.features.map(feature => (
                    <Link key={feature.path} href={feature.path}>
                      <Card className="bg-[#16213e]/60 border-[#C8A661]/20 hover:border-[#C8A661]/50 transition-all cursor-pointer group h-full" data-testid={`card-feature-${feature.path.slice(1)}`}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-lg bg-[#C8A661]/10">
                              <feature.icon className={`w-5 h-5 ${category.color}`} />
                            </div>
                            <div className="flex gap-1">
                              {feature.isNew && (
                                <Badge className="bg-green-500/20 text-green-400 text-xs">NEW</Badge>
                              )}
                              {feature.isPremium && (
                                <Badge className="bg-[#C8A661]/20 text-[#C8A661] text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  PRO
                                </Badge>
                              )}
                              {feature.badge && (
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs">{feature.badge}</Badge>
                              )}
                            </div>
                          </div>
                          <h3 className="font-semibold text-white mb-1 group-hover:text-[#C8A661] transition-colors">
                            {feature.name}
                          </h3>
                          <p className="text-sm text-gray-400">{feature.description}</p>
                          <div className="mt-3 flex items-center text-[#C8A661] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Explore <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-[#C8A661]/20 to-[#D4B878]/20 border-[#C8A661]/40 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Can't Find What You Need?</h3>
                <p className="text-gray-400 mb-6">
                  Our platform is constantly growing. Contact us to request a feature or get help finding the right tool.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button className="bg-[#C8A661] text-[#0A1628] hover:bg-[#D4B878]" data-testid="button-contact-us">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                  <Link href="/forum">
                    <Button variant="outline" className="border-[#C8A661]/40 text-gray-300" data-testid="button-ask-community">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask the Community
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
