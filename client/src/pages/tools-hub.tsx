import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Star, Target, Calculator, DollarSign, TrendingUp,
  FileText, ClipboardCheck, BookOpen, GraduationCap, Wrench,
  LayoutDashboard, Cpu, ShoppingCart, Building2, Wallet, Users,
  ArrowRight, ChevronDown, Check, Sparkles, Zap, Clock
} from "lucide-react";

type TierType = "free" | "pro" | "enterprise";

interface Tool {
  name: string;
  description: string;
  icon: any;
  link: string;
  tier: TierType;
  flagship?: boolean;
}

interface ToolCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  tools: Tool[];
}

const tierConfig: Record<TierType, { label: string; className: string }> = {
  free: { label: "Free", className: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", className: "bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30" },
  enterprise: { label: "Enterprise", className: "bg-[#0A1628] text-white" }
};

const toolCategories: ToolCategory[] = [
  {
    id: "location-intelligence",
    title: "Location Intelligence",
    description: "AI-powered tools to analyze and score any location for laundromat viability",
    icon: MapPin,
    tools: [
      { name: "CLEANBI Explorer", description: "AI-powered location scoring", icon: Target, link: "/cleanbi-explorer", tier: "pro", flagship: true },
      { name: "CLEANBI Auto", description: "Bulk address analysis", icon: Zap, link: "/cleanbi-auto", tier: "pro" },
      { name: "Smart Location Scout", description: "Find ideal locations", icon: MapPin, link: "/smart-location-scout", tier: "pro" }
    ]
  },
  {
    id: "financial-calculators",
    title: "Financial Calculators",
    description: "50+ professional calculators for valuations, ROI, financing, and operations",
    icon: Calculator,
    tools: [
      { name: "Valuation Calculator", description: "Business worth analysis", icon: DollarSign, link: "/valuation-calculator", tier: "free" },
      { name: "ROI Calculator", description: "Return projections", icon: TrendingUp, link: "/roi-calculator", tier: "free" },
      { name: "Loan Calculator", description: "Payment estimates", icon: Wallet, link: "/loan-calculator", tier: "free" },
      { name: "Utility Calculator", description: "Operating costs", icon: Zap, link: "/utility-calculator", tier: "pro" },
      { name: "TPD Calculator", description: "Turns per day analysis", icon: Clock, link: "/tpd-calculator", tier: "pro" },
      { name: "Labor Calculator", description: "Staffing costs", icon: Users, link: "/labor-calculator", tier: "pro" }
    ]
  },
  {
    id: "templates-documents",
    title: "Templates & Documents",
    description: "Professional templates, checklists, and document generators",
    icon: FileText,
    tools: [
      { name: "Business Plan Generator", description: "AI-powered business plans", icon: FileText, link: "/business-plan-generator", tier: "pro" },
      { name: "Due Diligence Checklist", description: "Larry's 50+ Trap Alerts", icon: ClipboardCheck, link: "/vault", tier: "pro" },
      { name: "LOI Template", description: "Letter of intent templates", icon: FileText, link: "/templates", tier: "free" },
      { name: "Lease Red Flag Checklist", description: "Spot lease issues fast", icon: ClipboardCheck, link: "/vault/lease-checklist", tier: "pro" },
      { name: "Financial Model Templates", description: "Pro Excel models", icon: Calculator, link: "/vault", tier: "pro" }
    ]
  },
  {
    id: "education-training",
    title: "Education & Training",
    description: "Expert courses, guides, and resources from industry veterans",
    icon: GraduationCap,
    tools: [
      { name: "Larry's Academy", description: "Video courses", icon: GraduationCap, link: "/courses", tier: "pro" },
      { name: "The Laundromat Bible", description: "Comprehensive guide", icon: BookOpen, link: "/laundromat-bible", tier: "free" },
      { name: "Equipment Guides", description: "Brand comparisons", icon: Wrench, link: "/equipment-guides", tier: "free" },
      { name: "Blog & Articles", description: "Latest insights", icon: FileText, link: "/blog", tier: "free" }
    ]
  },
  {
    id: "operator-tools",
    title: "Operator Tools",
    description: "Daily operations management, diagnostics, and monitoring",
    icon: Wrench,
    tools: [
      { name: "Service Guy AI", description: "Equipment diagnostics", icon: Wrench, link: "/service-guy-ai", tier: "pro" },
      { name: "POS Command Center", description: "Point of sale", icon: LayoutDashboard, link: "/pos-command-center", tier: "enterprise" },
      { name: "Operator Dashboard", description: "Business metrics", icon: LayoutDashboard, link: "/operator-dashboard", tier: "pro" },
      { name: "IoT Dashboard", description: "Machine monitoring", icon: Cpu, link: "/iot-dashboard", tier: "enterprise" }
    ]
  },
  {
    id: "marketplace-funding",
    title: "Marketplace & Funding",
    description: "Buy, sell, and finance laundromats with expert connections",
    icon: ShoppingCart,
    tools: [
      { name: "Laundromat Listings", description: "Buy/sell businesses", icon: Building2, link: "/laundromat-listings", tier: "free" },
      { name: "Equipment Marketplace", description: "New & used equipment", icon: ShoppingCart, link: "/equipment-marketplace", tier: "free" },
      { name: "Funding Matcher", description: "Lender connections", icon: Wallet, link: "/funding-matcher", tier: "pro" },
      { name: "Broker Directory", description: "Find trusted brokers", icon: Users, link: "/directory", tier: "free" }
    ]
  }
];

function TierBadge({ tier }: { tier: TierType }) {
  const config = tierConfig[tier];
  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${config.className}`}
      data-testid={`badge-tier-${tier}`}
    >
      {config.label}
    </Badge>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  
  return (
    <Link href={tool.link}>
      <div 
        className="group flex items-start gap-3 p-4 rounded-lg border bg-card hover-elevate cursor-pointer transition-all"
        data-testid={`card-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-[#C8A661]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-foreground group-hover:text-[#C8A661] transition-colors">
              {tool.name}
            </span>
            {tool.flagship && (
              <Badge variant="outline" className="text-xs bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30">
                <Star className="w-3 h-3 mr-1" />
                Flagship
              </Badge>
            )}
            <TierBadge tier={tool.tier} />
          </div>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#C8A661] transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

function CategoryCard({ category }: { category: ToolCategory }) {
  const Icon = category.icon;
  
  return (
    <Card 
      className="bg-card border shadow-sm overflow-hidden"
      data-testid={`card-category-${category.id}`}
    >
      <div className="h-1 bg-[#C8A661]" />
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-[#C8A661]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {category.tools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HeroSection() {
  const scrollToTools = () => {
    document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <section className="relative py-20 bg-[#0A1628] overflow-hidden" data-testid="section-hero">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A1628]/50 to-[#0A1628]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#C8A661] rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#C8A661] rounded-full blur-[128px]" />
      </div>
      
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <Badge 
          variant="outline" 
          className="mb-6 border-[#C8A661]/40 text-[#C8A661]"
          data-testid="badge-hero"
        >
          <Sparkles className="w-3 h-3 mr-1.5" />
          Power Tools Hub
        </Badge>
        
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          data-testid="text-hero-title"
        >
          Your Complete Laundromat<br />
          <span className="text-[#C8A661]">Intelligence Suite</span>
        </h1>
        
        <p 
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
          data-testid="text-hero-subtitle"
        >
          50+ AI-powered tools, calculators, templates, and expert resources to buy, 
          operate, and grow your laundromat business
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg"
            onClick={scrollToTools}
            className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold px-8"
            data-testid="button-explore-tools"
          >
            Explore Free Tools
            <ChevronDown className="ml-2 h-5 w-5" />
          </Button>
          <Link href="/pricing">
            <Button 
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8"
              data-testid="button-upgrade-pro"
            >
              Upgrade to Pro
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#C8A661]" />
            <span>50+ Pro Tools</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#C8A661]" />
            <span>AI-Powered Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#C8A661]" />
            <span>Expert Templates</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#C8A661]" />
            <span>Used by 73,000+ Professionals</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolsGrid() {
  return (
    <section id="tools-grid" className="py-20 bg-muted/30" data-testid="section-tools-grid">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            All Platform Tools
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our complete suite of tools organized by category. 
            Start with free tools or upgrade for unlimited access.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {toolCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TierComparisonSection() {
  const tiers = [
    { 
      name: "Free", 
      price: "$0", 
      description: "Get started with essential tools",
      features: ["3 CLEANBI analyses", "Basic calculators", "Limited templates", "Marketplace browsing"],
      buttonText: "Start Free",
      buttonLink: "/signup",
      highlight: false
    },
    { 
      name: "Pro", 
      price: "$24/mo", 
      priceNote: "billed annually",
      description: "Unlimited access to all tools",
      features: ["Unlimited CLEANBI", "All 50+ calculators", "Template Vault access", "AI Business Plans", "Service Guy AI", "Priority support"],
      buttonText: "Upgrade to Pro",
      buttonLink: "/pricing",
      highlight: true
    },
    { 
      name: "Enterprise", 
      price: "Custom", 
      description: "For multi-location operators",
      features: ["Everything in Pro", "API access", "White-label reports", "Team seats (up to 10)", "24/7 dedicated support", "Custom training"],
      buttonText: "Contact Sales",
      buttonLink: "/enterprise-onboarding",
      highlight: false
    }
  ];
  
  return (
    <section className="py-20 bg-[#0A1628]" data-testid="section-tier-comparison">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Ready to Unlock Everything?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your stage of the laundromat journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`relative rounded-xl p-6 ${
                tier.highlight 
                  ? 'bg-gradient-to-b from-[#C8A661]/20 to-transparent border-2 border-[#C8A661]/40' 
                  : 'bg-white/5 border border-white/10'
              }`}
              data-testid={`card-tier-${tier.name.toLowerCase()}`}
            >
              {tier.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8A661] text-[#0A1628]">
                  Most Chosen
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-[#C8A661]">{tier.price}</span>
                  {tier.priceNote && (
                    <span className="text-sm text-gray-400">{tier.priceNote}</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">{tier.description}</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-[#C8A661] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href={tier.buttonLink}>
                <Button 
                  className={`w-full ${
                    tier.highlight 
                      ? 'bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  data-testid={`button-tier-${tier.name.toLowerCase()}`}
                >
                  {tier.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickAccessSection() {
  const quickLinks = [
    { name: "CLEANBI Explorer", link: "/cleanbi-explorer", icon: Target },
    { name: "ROI Calculator", link: "/roi-calculator", icon: TrendingUp },
    { name: "Business Plan Generator", link: "/business-plan-generator", icon: FileText },
    { name: "Service Guy AI", link: "/service-guy-ai", icon: Wrench },
    { name: "Laundromat Listings", link: "/laundromat-listings", icon: Building2 },
    { name: "Funding Matcher", link: "/funding-matcher", icon: Wallet }
  ];
  
  return (
    <section className="py-16 bg-background border-t" data-testid="section-quick-access">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Quick Access
          </h2>
          <p className="text-muted-foreground">
            Jump directly to our most popular tools
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.link}>
                <div 
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card hover-elevate cursor-pointer text-center"
                  data-testid={`quick-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="h-12 w-12 rounded-full bg-[#0A1628] flex items-center justify-center">
                    <Icon className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function ToolsHub() {
  return (
    <>
      <SEO 
        title="Power Tools Hub - 50+ AI Tools & Calculators | WashBizHub"
        description="Access 50+ AI-powered tools, calculators, templates, and expert resources. Your complete laundromat intelligence suite for buying, operating, and growing your business."
        canonicalUrl="/tools"
        ogType="website"
        keywords={["laundromat tools", "CLEANBI", "laundromat calculators", "business plan generator", "ROI calculator"]}
      />
      
      <main className="min-h-screen bg-background" data-testid="page-tools-hub">
        <HeroSection />
        <QuickAccessSection />
        <ToolsGrid />
        <TierComparisonSection />
      </main>
    </>
  );
}
