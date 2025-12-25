import { useState } from "react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FileText, Download, Lock, Crown, Building2, Zap, 
  CheckCircle, AlertTriangle, ClipboardList, FileSignature,
  Calculator, TrendingUp, Shield, Star, ArrowRight,
  Briefcase, Home, Wrench, Users, BookOpen, Search
} from "lucide-react";

interface TemplateCard {
  id: string;
  title: string;
  description: string;
  category: "buyer" | "operator" | "vendor";
  tier: "free" | "pro" | "business" | "enterprise";
  icon: typeof FileText;
  features: string[];
  downloadCount?: number;
  price?: number;
  route: string;
  popular?: boolean;
  isNew?: boolean;
}

const templates: TemplateCard[] = [
  // BUYER PATH
  {
    id: "business-plan",
    title: "AI Business Plan Generator",
    description: "Generate a comprehensive 30-page laundromat business plan with CLEANBI market data and financial projections.",
    category: "buyer",
    tier: "business",
    icon: Briefcase,
    features: [
      "Executive Summary (Free Preview)",
      "CLEANBI Market Analysis",
      "Financial Projections",
      "SBA-Ready Format"
    ],
    downloadCount: 2847,
    route: "/vault/business-plan",
    popular: true,
  },
  {
    id: "lease-checklist",
    title: "Lease Red Flag Checklist",
    description: "Larry Larsen's 50+ trap alerts for lease negotiation. Avoid deal-killing clauses.",
    category: "buyer",
    tier: "pro",
    icon: AlertTriangle,
    features: [
      "7 Critical Red Flags (Free)",
      "Larry's 50+ Trap Alerts",
      "Negotiation Scripts",
      "Editable Legal Template"
    ],
    downloadCount: 4521,
    route: "/vault/lease-checklist",
    popular: true,
    isNew: true,
  },
  {
    id: "due-diligence",
    title: "Due Diligence Verifier",
    description: "Upload seller documents for automated AI verification and audit report generation.",
    category: "buyer",
    tier: "enterprise",
    icon: Shield,
    features: [
      "Tax Return Analysis",
      "Utility Bill Verification",
      "P&L Statement Audit",
      "Red Flag Detection"
    ],
    downloadCount: 892,
    route: "/vault/due-diligence",
  },
  {
    id: "loi-template",
    title: "Letter of Intent Template",
    description: "Professional LOI template with built-in contingencies and deal structure options.",
    category: "buyer",
    tier: "pro",
    icon: FileSignature,
    features: [
      "Standard LOI Format",
      "Contingency Clauses",
      "Price Negotiation Tips",
      "Attorney-Reviewed"
    ],
    downloadCount: 1823,
    route: "/vault/loi-template",
  },
  
  // OPERATOR PATH
  {
    id: "operations-checklist",
    title: "Operations Checklist Bundle",
    description: "Daily, weekly, and monthly checklists with KPI tracking formulas built-in.",
    category: "operator",
    tier: "pro",
    icon: ClipboardList,
    features: [
      "Daily Tasks (Free Preview)",
      "Weekly Maintenance",
      "Monthly Reviews",
      "Excel with KPI Formulas"
    ],
    downloadCount: 3156,
    route: "/vault/operations-checklist",
  },
  {
    id: "employee-handbook",
    title: "Employee Handbook Template",
    description: "Complete employee manual with policies, procedures, and training checklists.",
    category: "operator",
    tier: "business",
    icon: Users,
    features: [
      "Hiring Procedures",
      "Safety Protocols",
      "Cash Handling",
      "Training Checklists"
    ],
    downloadCount: 1567,
    route: "/vault/employee-handbook",
  },
  {
    id: "maintenance-log",
    title: "Equipment Maintenance Log",
    description: "Track machine maintenance, repairs, and service history with cost analysis.",
    category: "operator",
    tier: "pro",
    icon: Wrench,
    features: [
      "Machine Tracking",
      "Service History",
      "Cost Per Repair",
      "Warranty Tracking"
    ],
    downloadCount: 2341,
    route: "/vault/maintenance-log",
  },
  
  // VENDOR PATH
  {
    id: "broker-disclosure",
    title: "Broker Disclosure Form",
    description: "Compliance-ready broker disclosure template for professional transactions.",
    category: "vendor",
    tier: "pro",
    icon: FileText,
    features: [
      "State Compliance",
      "License Info Fields",
      "Commission Disclosure",
      "Editable Format"
    ],
    downloadCount: 876,
    route: "/vault/broker-disclosure",
  },
  {
    id: "listing-package",
    title: "Seller Listing Package",
    description: "Complete package for selling your laundromat including valuation worksheet and marketing materials.",
    category: "vendor",
    tier: "business",
    icon: Home,
    features: [
      "Valuation Worksheet",
      "Marketing Template",
      "Photo Checklist",
      "Buyer Qualification"
    ],
    downloadCount: 654,
    route: "/vault/listing-package",
  },
];

const tierConfig = {
  free: { label: "Free", color: "bg-emerald-500", icon: CheckCircle },
  pro: { label: "Pro", color: "bg-[#C8A661]", icon: Zap },
  business: { label: "Pro", color: "bg-[#C8A661]", icon: Crown }, // Mapping business to Pro for now as per requirements
  enterprise: { label: "Enterprise", color: "bg-slate-700", icon: Building2 },
};

const categoryConfig = {
  buyer: { label: "Buyer & Due Diligence", icon: Search, description: "Tools for evaluating and acquiring laundromats" },
  operator: { label: "Current Owners", icon: Wrench, description: "Operations and management templates" },
  vendor: { label: "Sellers & Brokers", icon: Briefcase, description: "Templates for selling and brokering deals" },
};

export default function TemplateVault() {
  const { user } = useAuth();
  const { canAccessTier, tier: currentTier } = useSubscription();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const buyerTemplates = filteredTemplates.filter(t => t.category === "buyer");
  const operatorTemplates = filteredTemplates.filter(t => t.category === "operator");
  const vendorTemplates = filteredTemplates.filter(t => t.category === "vendor");

  const TemplateCardComponent = ({ template }: { template: TemplateCard }) => {
    const hasAccess = canAccessTier(template.tier);
    const TierIcon = tierConfig[template.tier].icon;
    const TemplateIcon = template.icon;

    return (
      <Card 
        className={`relative overflow-hidden transition-all hover-elevate ${
          template.popular ? "ring-2 ring-primary" : ""
        }`}
        data-testid={`card-template-${template.id}`}
      >
        {template.popular && (
          <div className="absolute top-0 right-0">
            <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
        {template.isNew && (
          <div className="absolute top-0 left-0">
            <Badge className="rounded-none rounded-br-lg bg-green-500 text-white">
              New
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TemplateIcon className="w-6 h-6 text-primary" />
            </div>
            <Badge 
              variant="outline" 
              className={`${tierConfig[template.tier].color} text-white border-0`}
            >
              <TierIcon className="w-3 h-3 mr-1" />
              {tierConfig[template.tier].label}
            </Badge>
          </div>
          <CardTitle className="text-lg mt-3">{template.title}</CardTitle>
          <CardDescription className="text-sm">
            {template.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3">
          <ul className="space-y-2">
            {template.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className={feature.includes("Free") ? "text-green-600 font-medium" : ""}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
          
          {template.downloadCount && (
            <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              {template.downloadCount.toLocaleString()} downloads
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-3 border-t">
          <Link href={template.route} className="w-full">
            <Button 
              className="w-full gap-2" 
              variant={hasAccess ? "default" : "outline"}
              data-testid={`button-view-${template.id}`}
            >
              {hasAccess ? (
                <>
                  <FileText className="w-4 h-4" />
                  Open Template
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Unlock with {tierConfig[template.tier].label}
                </>
              )}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <SEO
        title="Laundromat Business Plan Template & Due Diligence Checklist | Template Vault | WashBizHub"
        description="Download premium laundromat templates: AI business plan generator, lease red flag checklist (50+ trap alerts), due diligence verifier, LOI templates. SBA-ready, attorney-reviewed. Larry Larsen's 50+ years expertise."
        canonicalUrl="/template-vault"
        ogType="website"
        keywords={[
          "laundromat business plan template",
          "laundromat due diligence checklist",
          "laundromat lease checklist",
          "laundromat LOI template",
          "laundromat acquisition templates",
          "laundromat operations manual template",
          "laundromat employee handbook template",
          "laundromat financial model template",
          "SBA laundromat business plan",
          "laundromat lease red flags",
          "laundromat purchase checklist",
          "how to buy a laundromat checklist",
          "laundromat investment templates",
          "coin laundry business plan",
          "laundromat startup checklist"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Template Vault", url: "/template-vault" }
        ]}
        faqs={[
          {
            question: "What is the Template Vault?",
            answer: "The Template Vault is WashBizHub's premium collection of professional templates, checklists, and tools for laundromat buyers, operators, and sellers. It includes AI-powered business plan generators, Larry Larsen's 50+ lease red flag alerts, due diligence checklists, LOI templates, and operational guides."
          },
          {
            question: "What's included in the Lease Red Flag Checklist?",
            answer: "The Lease Red Flag Checklist includes 50+ trap alerts from Larry Larsen's 50+ years of laundromat experience. It covers critical lease clauses like CAM charges, rent escalation caps, assignment rights, exclusivity provisions, and more. Free users get 7 critical alerts; Pro members get all 50+."
          },
          {
            question: "Is the AI Business Plan Generator SBA-ready?",
            answer: "Yes! Our AI Business Plan Generator creates comprehensive 30-page business plans in SBA-ready format. It integrates CLEANBI market data, financial projections, competitive analysis, and funding requirements automatically. Perfect for bank financing and SBA loan applications."
          },
          {
            question: "Can I download templates after my subscription ends?",
            answer: "Yes, any templates you've purchased or downloaded are yours to keep. Subscription members have access to all templates while subscribed. Individual template purchases provide lifetime access to that specific template."
          }
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl">
              <Badge className="mb-4" variant="outline">
                <BookOpen className="w-3 h-3 mr-1" />
                Premium Templates
              </Badge>
              <h1 className="text-4xl font-bold mb-4" data-testid="text-vault-title">
                Template Vault
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Premium templates, worksheets, and tools for laundromat buyers, operators, and sellers. 
                Featuring Larry Larsen's 50+ years of due diligence expertise.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SBA-Ready Templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Larry's Trap Alerts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Editable Formats</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>CLEANBI Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-templates"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                data-testid="button-filter-all"
              >
                All Templates
              </Button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="gap-1"
                  data-testid={`button-filter-${key}`}
                >
                  <config.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Template Sections */}
          <Tabs defaultValue="buyer" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
              <TabsTrigger value="buyer" className="gap-2" data-testid="tab-buyer">
                <Search className="w-4 h-4" />
                Buyers
              </TabsTrigger>
              <TabsTrigger value="operator" className="gap-2" data-testid="tab-operator">
                <Wrench className="w-4 h-4" />
                Operators
              </TabsTrigger>
              <TabsTrigger value="vendor" className="gap-2" data-testid="tab-vendor">
                <Briefcase className="w-4 h-4" />
                Sellers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buyer" className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Search className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Buyer & Due Diligence</h2>
                  <p className="text-sm text-muted-foreground">
                    Essential tools for evaluating and acquiring laundromats
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buyerTemplates.map(template => (
                  <TemplateCardComponent key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="operator" className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Wrench className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Current Owner Tools</h2>
                  <p className="text-sm text-muted-foreground">
                    Operations, maintenance, and management templates
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {operatorTemplates.map(template => (
                  <TemplateCardComponent key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="vendor" className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Seller & Broker Tools</h2>
                  <p className="text-sm text-muted-foreground">
                    Templates for listing, selling, and brokering laundromats
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendorTemplates.map(template => (
                  <TemplateCardComponent key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Upgrade CTA */}
          {!canAccessTier("pro") && (
            <Card className="mt-12 bg-gradient-to-r from-[#C8A661]/20 to-background border-[#C8A661]/30 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown className="w-32 h-32 text-[#C8A661]" />
              </div>
              <CardContent className="py-10 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-[#C8A661] shadow-lg shadow-[#C8A661]/20">
                      <Zap className="w-8 h-8 text-[#0A1628]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Upgrade to Pro for Full Access</h3>
                      <p className="text-muted-foreground text-lg max-w-lg">
                        Unlock all 50+ templates, Larry's Trap Alerts, and unlimited CLEANBI analyses. 
                        <span className="block mt-1 font-semibold text-[#C8A661]">Join 500+ successful brokers & operators.</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <Link href="/pricing">
                      <Button size="lg" className="gap-2 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] h-12 px-8 font-bold text-lg" data-testid="button-upgrade-vault">
                        Upgrade to Pro
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground">Only $29/mo — Cancel anytime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
