import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeatureGate, InlineUpgradePrompt } from "@/components/monetization";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Star, 
  Download, 
  Lock, 
  Search, 
  Briefcase, 
  TrendingUp, 
  Megaphone, 
  Settings, 
  Scale,
  FileText,
  ShoppingCart,
  Crown,
  Eye,
  CheckCircle2,
  X,
  Filter,
  Unlock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  StatCard, DonutChart, DashboardGrid, SectionHeader
} from "@/components/dashboard/DashboardComponents";
import laundromatInterior2 from "@assets/Twin Cities Laundromat_1763780009740.jpg";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  preview?: string;
  isPremium: boolean;
  price?: number;
  rating?: number;
  downloadCount: number;
  tags?: string[];
  featured: boolean;
}

const categories = [
  { value: "all", label: "All Templates", icon: FileText },
  { value: "business-plans", label: "Business Plans", icon: Briefcase },
  { value: "financial", label: "Financial", icon: TrendingUp },
  { value: "marketing", label: "Marketing", icon: Megaphone },
  { value: "operations", label: "Operations", icon: Settings },
  { value: "legal", label: "Legal", icon: Scale },
];

const templateSampleContent: Record<string, { sections: string[]; features: string[] }> = {
  "business-plans": {
    sections: [
      "Executive Summary",
      "Company Description",
      "Market Analysis",
      "Organization & Management",
      "Service Line",
      "Marketing & Sales Strategy",
      "Funding Request",
      "Financial Projections",
      "Appendix"
    ],
    features: [
      "5-year revenue projections",
      "Break-even analysis",
      "Competitive landscape matrix",
      "SWOT analysis template",
      "Investor pitch deck slides"
    ]
  },
  "financial": {
    sections: [
      "Income Statement",
      "Balance Sheet",
      "Cash Flow Statement",
      "Revenue Projections",
      "Expense Categories",
      "KPI Dashboard"
    ],
    features: [
      "Auto-calculating formulas",
      "Monthly/quarterly/annual views",
      "Variance analysis",
      "Profit margin tracking",
      "Equipment depreciation schedules"
    ]
  },
  "marketing": {
    sections: [
      "Brand Guidelines",
      "Social Media Calendar",
      "Ad Copy Templates",
      "Email Campaigns",
      "Customer Personas",
      "Competitive Analysis"
    ],
    features: [
      "Ready-to-post social content",
      "Grand opening promotions",
      "Loyalty program templates",
      "Customer testimonial forms",
      "Referral program materials"
    ]
  },
  "operations": {
    sections: [
      "Daily Checklists",
      "Equipment Maintenance Log",
      "Staff Training Manual",
      "Safety Procedures",
      "Inventory Management",
      "Customer Service Scripts"
    ],
    features: [
      "Opening/closing procedures",
      "Machine maintenance schedules",
      "Employee onboarding docs",
      "Health & safety compliance",
      "Quality control checklists"
    ]
  },
  "legal": {
    sections: [
      "Lease Agreement Template",
      "Employee Contract",
      "Customer Waiver",
      "Privacy Policy",
      "Terms of Service",
      "Vendor Agreements"
    ],
    features: [
      "State-compliant templates",
      "Customizable clauses",
      "Insurance requirements",
      "Liability protection",
      "ADA compliance guidance"
    ]
  }
};

const TEMPLATE_FAQS = [
  {
    question: "Where can I find a laundromat business plan template?",
    answer: "WashBizHub offers professional laundromat business plan templates including executive summary sections, market analysis frameworks, 5-year financial projections, equipment cost breakdowns, and competitive analysis tools. Our templates are designed specifically for coin laundry businesses and include industry-specific benchmarks. Free basic templates are available, with premium versions including auto-calculating financials and investor-ready formatting."
  },
  {
    question: "What should be included in a laundromat due diligence checklist?",
    answer: "A comprehensive laundromat due diligence checklist should cover: financial verification (3 years P&L, tax returns, utility bills), equipment inventory and condition assessment, lease terms and rent escalations, competition analysis within 3-mile radius, demographic data, building inspection, environmental compliance, existing employee contracts, vendor agreements, and title search. Our templates include 100+ checkpoint items organized by category."
  },
  {
    question: "How do I create a P&L statement for my laundromat?",
    answer: "WashBizHub's laundromat P&L templates help you track revenue (coin/card income, wash-dry-fold, vending), operating expenses (utilities, rent, insurance, maintenance, supplies), and calculate gross/net margins. Our Excel templates include auto-calculating formulas, industry benchmark comparisons, and variance analysis. Track monthly performance and generate year-over-year comparisons automatically."
  },
  {
    question: "What financial templates do laundromat owners need?",
    answer: "Essential laundromat financial templates include: monthly P&L statements, cash flow projections, break-even analysis, equipment ROI calculators, revenue-per-machine tracking, utility cost analysis, employee payroll spreadsheets, and annual budget templates. Our premium package includes all templates with formulas pre-configured for laundromat-specific expense categories and revenue streams."
  },
  {
    question: "Are there free laundromat operations checklists available?",
    answer: "Yes, WashBizHub offers free laundromat operations checklists including daily opening/closing procedures, weekly machine maintenance logs, monthly deep cleaning schedules, and quarterly equipment inspections. Premium templates add staff training manuals, safety compliance documentation, inventory management systems, and customer service scripts. Download free basic versions or upgrade for complete operations packages."
  },
  {
    question: "What marketing templates work best for laundromats?",
    answer: "Effective laundromat marketing templates include: grand opening promotion flyers, loyalty program cards, social media content calendars, Google Business Profile optimization guides, Yelp response templates, referral program materials, email campaign sequences, and local SEO checklists. Our templates are designed for laundromat owners with limited marketing experience and include editable Canva designs."
  },
  {
    question: "How do I value a laundromat using a valuation template?",
    answer: "WashBizHub's laundromat valuation templates use multiple methods: income approach (2-4x net operating income), asset approach (equipment value + goodwill), and market comparables. Input your revenue, expenses, equipment age, and lease terms to generate a valuation range. Our calculators account for location quality, equipment condition, lease favorability, and growth potential using CLEANBI scoring methodology."
  },
  {
    question: "What legal documents does a laundromat owner need?",
    answer: "Essential legal documents for laundromat owners include: commercial lease agreements (or lease assignment templates), employee contracts and handbooks, customer liability waivers, privacy policies for card payment systems, vendor service agreements, insurance requirement summaries, ADA compliance checklists, and LLC operating agreements. Our legal templates are reviewed by attorneys familiar with coin laundry regulations."
  }
];

export default function Templates() {
  const { user } = useAuth();
  const { hasFeatureAccess } = useSubscription();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  
  const canDownloadPremium = hasFeatureAccess("templates-premium").hasAccess;

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
    enabled: true,
  });

  const getSampleContent = (category: string) => {
    return templateSampleContent[category] || templateSampleContent["business-plans"];
  };

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';

  const templateListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Laundromat Business Templates & Checklists",
    "description": "Professional templates for laundromat owners including business plans, financial models, due diligence checklists, marketing materials, operations guides, and legal documents. Free and premium downloads.",
    "url": `${baseUrl}/templates`,
    "numberOfItems": templates.length,
    "itemListElement": templates.slice(0, 10).map((template, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "CreativeWork",
        "name": template.name,
        "description": template.description,
        "creator": {
          "@type": "Organization",
          "name": "WashBizHub"
        },
        "about": {
          "@type": "Thing",
          "name": "Laundromat Business",
          "description": "Coin laundry and laundromat business operations"
        },
        "isAccessibleForFree": !template.isPremium,
        "license": template.isPremium ? "https://washbizhub.com/terms" : "https://creativecommons.org/licenses/by-nc/4.0/",
        "inLanguage": "en-US",
        "educationalLevel": "Professional",
        "learningResourceType": "Template",
        "audience": {
          "@type": "Audience",
          "audienceType": "Laundromat Owners, Investors, Entrepreneurs"
        }
      }
    }))
  };

  const productCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Laundromat Business Templates | WashBizHub",
    "description": "Download professional business templates for laundromat owners. Business plans, P&L templates, due diligence checklists, marketing materials, operations guides, and legal documents.",
    "url": `${baseUrl}/templates`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": templates.length
    }
  };

  const howToUseTemplatesSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Use Laundromat Business Templates",
    "description": "Step-by-step guide to downloading and customizing business templates for your laundromat.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Browse Templates",
        "text": "Search templates by category: business plans, financial models, marketing, operations, or legal documents."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Preview Sample Content",
        "text": "Click 'Preview Sample' to see template sections and features before downloading."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Download Template",
        "text": "Download free templates instantly or purchase premium templates for advanced features."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Customize for Your Business",
        "text": "Open in Excel, Word, or Google Docs and fill in your laundromat-specific information."
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Apply to Your Operations",
        "text": "Use completed templates for business planning, investor presentations, daily operations, or legal compliance."
      }
    ],
    "totalTime": "PT30M"
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    if (cat) {
      const IconComponent = cat.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
      <div className="min-h-screen bg-background">
        <SEO
        title="Laundromat Business Plan Templates | P&L, Due Diligence Checklists"
        description="Download professional laundromat business plan templates, P&L spreadsheets, due diligence checklists, financial models, and operations guides. Free and premium templates for coin laundry owners."
        canonicalUrl="/templates"
        ogType="website"
        keywords={[
          "laundromat business plan template",
          "laundromat P&L template",
          "laundromat due diligence checklist",
          "coin laundry business plan",
          "laundromat financial model",
          "laundry business templates",
          "laundromat operations checklist",
          "laundromat valuation template",
          "laundromat marketing templates",
          "laundromat legal documents",
          "laundromat budget template",
          "laundromat cash flow template",
          "laundromat employee handbook",
          "laundromat lease template",
          "laundromat startup checklist"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Templates", url: "/templates" }
        ]}
        faqs={TEMPLATE_FAQS}
        howTo={howToUseTemplatesSchema}
        structuredData={[templateListSchema, productCollectionSchema, howToUseTemplatesSchema]}
      />

      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Breadcrumb items={[{ name: "Templates", url: "/templates" }]} />
        </div>
      </div>

      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Laundromat Business Templates</h1>
              <p className="text-muted-foreground">Business plans, P&L templates, due diligence checklists, and more</p>
            </div>
          </div>

          <DashboardGrid cols={4}>
            <StatCard
              title="Total Templates"
              value={isLoading ? "..." : templates.length}
              subtitle="Ready to download"
              icon={FileText}
              variant="purple"
            />
            <StatCard
              title="Free Templates"
              value={isLoading ? "..." : templates.filter(t => !t.isPremium).length}
              subtitle="No signup required"
              icon={Unlock}
              variant="green"
            />
            <StatCard
              title="Premium Templates"
              value={isLoading ? "..." : templates.filter(t => t.isPremium).length}
              subtitle="Pro access"
              icon={Crown}
              variant="yellow"
            />
            <StatCard
              title="Total Downloads"
              value={isLoading ? "..." : `${(templates.reduce((acc, t) => acc + t.downloadCount, 0) / 1000).toFixed(1)}K`}
              subtitle="By professionals"
              icon={Download}
              variant="pink"
            />
          </DashboardGrid>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates (business plan, P&L, checklist)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-templates"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-64" data-testid="select-category">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <SelectItem key={cat.value} value={cat.value} data-testid={`select-item-${cat.value}`}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = selectedCategory === cat.value;
            return (
              <Button
                key={cat.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="gap-2"
                data-testid={`button-category-${cat.value}`}
              >
                <IconComponent className="w-4 h-4" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No templates found</p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              {searchQuery ? `No results for "${searchQuery}"` : "No templates in this category"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              data-testid="button-reset-filters"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                Showing {filtered.length} template{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((template) => (
                <Card
                  key={template.id}
                  className="overflow-hidden hover-elevate flex flex-col h-full"
                  data-testid={`card-template-${template.id}`}
                >
                  {template.preview && (
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        data-testid={`img-template-preview-${template.id}`}
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {template.isPremium ? (
                          <Badge className="bg-amber-500/90 text-white border-0" data-testid={`badge-premium-${template.id}`}>
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/90 text-white border-0" data-testid={`badge-free-${template.id}`}>
                            Free
                          </Badge>
                        )}
                        {template.featured && (
                          <Badge variant="default" data-testid={`badge-featured-${template.id}`}>
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {!template.preview && (
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      {getCategoryIcon(template.category)}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {template.isPremium ? (
                          <Badge className="bg-amber-500/90 text-white border-0" data-testid={`badge-premium-${template.id}`}>
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/90 text-white border-0" data-testid={`badge-free-${template.id}`}>
                            Free
                          </Badge>
                        )}
                        {template.featured && (
                          <Badge variant="default" data-testid={`badge-featured-${template.id}`}>
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(template.category)}
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            {categories.find(c => c.value === template.category)?.label || template.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg line-clamp-2" data-testid={`text-template-name-${template.id}`}>
                          {template.name}
                        </h3>
                        {template.subcategory && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.subcategory}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-template-description-${template.id}`}>
                      {template.description}
                    </p>

                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs" data-testid={`badge-tag-${template.id}-${tag}`}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1" data-testid={`rating-${template.id}`}>
                        {template.rating ? (
                          <>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{template.rating.toFixed(1)}</span>
                          </>
                        ) : (
                          <span>No ratings</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1" data-testid={`downloads-${template.id}`}>
                        <Download className="w-3 h-3" />
                        <span>{template.downloadCount} downloads</span>
                      </div>
                    </div>

                    <div className="mt-auto border-t pt-3 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                        data-testid={`button-preview-template-${template.id}`}
                      >
                        <Eye className="w-4 h-4" />
                        Preview Sample
                      </Button>
                      {template.isPremium ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-500" />
                              <span className="font-semibold text-lg" data-testid={`text-price-${template.id}`}>
                                ${template.price || "9.99"}
                              </span>
                            </div>
                            {canDownloadPremium && (
                              <Badge variant="secondary" className="text-xs">
                                Included with Pro
                              </Badge>
                            )}
                          </div>
                          {canDownloadPremium ? (
                            <Button
                              className="w-full gap-2"
                              size="sm"
                              data-testid={`button-download-template-${template.id}`}
                            >
                              <Download className="w-4 h-4" />
                              Download Now
                            </Button>
                          ) : (
                            <FeatureGate 
                              feature="templates-premium"
                              showUpgradePrompt={true}
                              title="Premium Template"
                              description="Upgrade to download this premium template and access our full library."
                            >
                              <Button
                                className="w-full gap-2"
                                size="sm"
                                data-testid={`button-download-template-${template.id}`}
                              >
                                <Download className="w-4 h-4" />
                                Download Now
                              </Button>
                            </FeatureGate>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="w-full gap-2"
                          size="sm"
                          data-testid={`button-download-free-${template.id}`}
                        >
                          <Download className="w-4 h-4" />
                          Download Free
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        <section className="mt-16 bg-muted/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions About Laundromat Templates</h2>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            {TEMPLATE_FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left" data-testid={`accordion-template-faq-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <div className="mt-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Get All Templates with Pro</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Unlock access to all premium templates, plus exclusive features like CLEANBI analysis, 
            advanced calculators, and priority support.
          </p>
          <Button size="lg" className="gap-2" onClick={() => setLocation("/pricing")} data-testid="button-upgrade-pro">
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Button>
        </div>
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-template-preview">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {previewTemplate.isPremium ? (
                    <Badge className="bg-amber-500/90 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium Template
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500/90 text-white border-0">
                      Free Template
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{previewTemplate.name}</DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Template Sections
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getSampleContent(previewTemplate.category).sections.map((section, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Key Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getSampleContent(previewTemplate.category).features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4 flex gap-3">
                  {previewTemplate.isPremium ? (
                    <>
                      {canDownloadPremium ? (
                        <Button className="flex-1 gap-2" data-testid="button-dialog-download">
                          <Download className="w-4 h-4" />
                          Download Now
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 gap-2" 
                          variant="outline"
                          onClick={() => setLocation("/pricing")}
                          data-testid="button-dialog-upgrade"
                        >
                          <Lock className="w-4 h-4" />
                          Upgrade to Download
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setPreviewTemplate(null)} data-testid="button-dialog-close">
                        Close
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="flex-1 gap-2" data-testid="button-dialog-download">
                        <Download className="w-4 h-4" />
                        Download Free
                      </Button>
                      <Button variant="outline" onClick={() => setPreviewTemplate(null)} data-testid="button-dialog-close">
                        Close
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
