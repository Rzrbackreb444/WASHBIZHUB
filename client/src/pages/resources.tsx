import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Advertisement } from "@/components/Advertisement";
import type { Resource } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calculator,
  FileText,
  CheckSquare,
  Zap,
  Search,
  Star,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Wrench,
  Briefcase,
  GraduationCap,
  ShoppingCart,
  Shield,
  Megaphone,
  Code,
  MapPin,
  Crown,
  Lock,
  BookOpen,
  Target,
} from "lucide-react";
import { Link } from "wouter";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StatCard, DashboardGrid, DonutChart } from "@/components/dashboard/DashboardComponents";
import resourcesHeroImg from "@assets/AdobeStock_824530835_1763779877616.jpeg";

const INDUSTRY_SEGMENTS = [
  { id: "all", label: "All Resources", icon: Zap },
  { id: "owner", label: "Owners & Operators", icon: Building },
  { id: "investor", label: "Investors", icon: TrendingUp },
  { id: "broker", label: "Brokers & Agents", icon: Briefcase },
  { id: "technician", label: "Technicians", icon: Wrench },
  { id: "distributor", label: "Distributors", icon: ShoppingCart },
  { id: "contractor", label: "Contractors", icon: Users },
  { id: "lender", label: "Lenders & Banks", icon: DollarSign },
  { id: "marketing_agency", label: "Marketing Agencies", icon: Megaphone },
  { id: "software_vendor", label: "Software Vendors", icon: Code },
  { id: "insurance_provider", label: "Insurance", icon: Shield },
  { id: "customer", label: "Customers", icon: MapPin },
];

// Removed MOCK_RESOURCES - using real API data now

export default function ResourcesPage() {
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Build query parameters for API
  const queryParams = new URLSearchParams();
  if (selectedType) queryParams.append("resourceType", selectedType);
  if (selectedSegment !== "all") queryParams.append("targetAudience", selectedSegment);
  if (searchQuery) queryParams.append("searchQuery", searchQuery);
  
  const queryString = queryParams.toString();
  const apiUrl = queryString ? `/api/resources?${queryString}` : "/api/resources";

  // Fetch resources from API with filters
  const { data: resources = [], isLoading, error } = useQuery<Resource[]>({
    queryKey: [apiUrl],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey as [string];
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Failed to fetch resources: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: true,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "calculator":
        return Calculator;
      case "guide":
        return FileText;
      case "checklist":
        return CheckSquare;
      case "template":
        return FileText;
      case "tool":
        return Zap;
      default:
        return FileText;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "calculator":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "guide":
        return "bg-green-100 text-green-700 border-green-200";
      case "checklist":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "template":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "tool":
        return "bg-pink-100 text-pink-700 border-pink-200";
      default:
        return "";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-amber-600";
      case "advanced":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Laundromat Industry Resources Library",
    "description": "Comprehensive collection of 100+ calculators, guides, templates, and tools for laundromat owners, investors, brokers, and operators.",
    "numberOfItems": resources.length,
  };

  return (
    <>
      <SEO
        title="Laundromat Resources Library - 100+ Free Calculators, Guides & Templates | WashBizHub"
        description="Access 100+ free laundromat resources: ROI calculators, valuation tools, business plans, checklists, equipment guides. For owners, investors, brokers, and operators."
        canonicalUrl="/resources"
        ogType="website"
        keywords={[
          "laundromat calculator",
          "laundromat ROI calculator",
          "laundromat valuation",
          "laundromat business plan",
          "laundromat guides",
          "laundromat templates",
          "coin laundry resources",
          "laundromat investment calculator",
          "laundromat due diligence checklist",
          "laundromat startup guide",
          "how to start a laundromat",
          "laundromat financial analysis",
          "laundromat equipment guide",
          "laundromat marketing templates",
          "laundry business resources"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" }
        ]}
        faqs={[
          {
            question: "How do I start a laundromat business?",
            answer: "Starting a laundromat involves: 1) Market research using tools like CLEANBI, 2) Creating a business plan with financial projections, 3) Securing financing ($200K-$1M+ depending on size), 4) Finding the right location, 5) Designing your layout, 6) Purchasing equipment, and 7) Setting up operations. WashBizHub offers free guides and calculators for each step."
          },
          {
            question: "What resources do laundromat owners need?",
            answer: "Essential laundromat resources include: ROI calculators, business valuation tools, due diligence checklists, equipment guides, marketing templates, financial projections spreadsheets, operations manuals, and industry benchmarks. WashBizHub provides 100+ free and premium resources for every role in the industry."
          },
          {
            question: "How do I calculate laundromat ROI?",
            answer: "Calculate laundromat ROI using: (Annual Net Operating Income / Total Investment) × 100. Our ROI Calculator factors in equipment costs, lease expenses, utilities, labor, and projected revenue based on your location's demographics. Most laundromats target 15-35% cash-on-cash returns."
          },
          {
            question: "What is the best laundromat valuation calculator?",
            answer: "WashBizHub's Valuation Calculator uses industry-standard methods: multiple of monthly gross (15-40x), SDE multiple (2.5-4x), and cap rate analysis (8-15%). Our calculator compares all methods and provides a valuation range based on your specific financials and market data."
          },
          {
            question: "Where can I find laundromat business plan templates?",
            answer: "WashBizHub offers free laundromat business plan templates that include: executive summary, market analysis, financial projections, equipment specifications, marketing strategy, and operational plans. Download customizable templates in our Resources Library."
          },
          {
            question: "What checklists do I need for buying a laundromat?",
            answer: "Essential due diligence checklists include: financial document review (P&L, tax returns, utilities), equipment inspection, lease analysis, competition assessment, demographic analysis, and environmental review. Our Resources Library has comprehensive checklists for each phase of acquisition."
          },
          {
            question: "How do I use the laundromat calculators?",
            answer: "WashBizHub calculators are designed to be intuitive: 1) Select the calculator type (ROI, Valuation, TPD, etc.), 2) Enter your data (revenue, costs, equipment mix), 3) Get instant results with industry benchmarks, 4) Download or share your analysis. Most calculations take under 5 minutes."
          },
          {
            question: "Are the laundromat resources free?",
            answer: "Many WashBizHub resources are completely free, including basic calculators, starter guides, and checklists. Premium resources with advanced features, detailed templates, and expert analysis are available to Pro members. The Resources Library clearly labels free vs premium content."
          }
        ]}
        howTo={{
          name: "How to Use WashBizHub Resources to Plan Your Laundromat",
          description: "Step-by-step guide to finding and using the right calculators, guides, and templates for your laundromat business",
          totalTime: "PT10M",
          steps: [
            {
              name: "Define Your Goal",
              text: "Determine what you're trying to accomplish: starting a laundromat, buying an existing one, optimizing operations, or evaluating an investment. This helps you find the right resources."
            },
            {
              name: "Filter by Industry Segment",
              text: "Use the segment filters to find resources for your role: Owner/Operator, Investor, Broker, Technician, or other. Each segment has tailored tools and guides."
            },
            {
              name: "Choose Resource Type",
              text: "Select the type of resource you need: Calculators for financial analysis, Guides for step-by-step instructions, Checklists for due diligence, or Templates for documents."
            },
            {
              name: "Search for Specific Topics",
              text: "Use the search bar to find resources on specific topics like 'ROI', 'valuation', 'equipment', or 'marketing'. Results are sorted by relevance."
            },
            {
              name: "Access the Resource",
              text: "Click on any resource to view details, then access the tool or download the document. Free resources are available immediately; premium content requires a Pro subscription."
            },
            {
              name: "Apply Insights to Your Business",
              text: "Use the calculator results, guide recommendations, or checklist items to make informed decisions about your laundromat business."
            }
          ]
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Laundromat Industry Resources Library",
          "description": "Comprehensive collection of 100+ calculators, guides, templates, and tools for laundromat owners, investors, brokers, and operators.",
          "numberOfItems": 100,
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "ROI Calculator",
                "description": "Calculate return on investment for laundromat purchases",
                "url": "https://washbizhub.com/roi-calculator"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Valuation Calculator",
                "description": "Determine fair market value for laundromat businesses",
                "url": "https://washbizhub.com/valuation-calculator"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "TPD Calculator",
                "description": "Calculate Turns Per Day for equipment optimization",
                "url": "https://washbizhub.com/tpd-calculator"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Due Diligence Checklists",
                "description": "Comprehensive checklists for buying laundromats",
                "url": "https://washbizhub.com/resources"
              },
              {
                "@type": "ListItem",
                "position": 5,
                "name": "Business Plan Templates",
                "description": "Professional laundromat business plan templates",
                "url": "https://washbizhub.com/resources"
              }
            ]
          },
          "provider": {
            "@type": "Organization",
            "name": "WashBizHub",
            "url": "https://washbizhub.com"
          }
        }}
      />
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Resources", url: "/resources" }]} />
          </div>
        </div>

        {/* Dashboard Header with Stats */}
        <section className="bg-background border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-resources-title">Industry Resources Library</h1>
                <p className="text-muted-foreground" data-testid="text-resources-subtitle">100+ calculators, guides, templates, and tools for every role</p>
              </div>
            </div>

            <DashboardGrid cols={4}>
              <StatCard
                title="Total Resources"
                value={isLoading ? "..." : resources.length}
                subtitle="Professional tools"
                icon={Zap}
                variant="blue"
              />
              <StatCard
                title="Calculators"
                value={isLoading ? "..." : resources.filter(r => r.resourceType === 'calculator').length}
                subtitle="Financial analysis"
                icon={Calculator}
                variant="green"
              />
              <StatCard
                title="Guides & Checklists"
                value={isLoading ? "..." : resources.filter(r => ['guide', 'checklist'].includes(r.resourceType || '')).length}
                subtitle="Step-by-step"
                icon={FileText}
                variant="purple"
              />
              <StatCard
                title="Industry Segments"
                value={INDUSTRY_SEGMENTS.length - 1}
                subtitle="Target audiences"
                icon={Target}
                variant="pink"
              />
            </DashboardGrid>

            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-background border-border"
                  data-testid="input-search-resources"
                />
              </div>
            </div>
          </div>
        </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Column */}
            <div className="flex-1">
          <Tabs value={selectedSegment} onValueChange={setSelectedSegment} className="w-full">
            {/* Industry Segment Filters */}
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-auto bg-transparent p-0 mb-8">
              {INDUSTRY_SEGMENTS.map((segment) => {
                const Icon = segment.icon;
                return (
                  <TabsTrigger
                    key={segment.id}
                    value={segment.id}
                    className="flex flex-col gap-2 p-4 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`tab-segment-${segment.id}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{segment.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Button
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(null)}
                data-testid="button-type-all"
              >
                All Types
              </Button>
              <Button
                variant={selectedType === "calculator" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("calculator")}
                data-testid="button-type-calculator"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculators
              </Button>
              <Button
                variant={selectedType === "guide" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("guide")}
                data-testid="button-type-guide"
              >
                <FileText className="h-4 w-4 mr-2" />
                Guides
              </Button>
              <Button
                variant={selectedType === "checklist" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("checklist")}
                data-testid="button-type-checklist"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklists
              </Button>
              <Button
                variant={selectedType === "template" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("template")}
                data-testid="button-type-template"
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant={selectedType === "tool" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("tool")}
                data-testid="button-type-tool"
              >
                <Zap className="h-4 w-4 mr-2" />
                Tools
              </Button>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <p className="text-muted-foreground" data-testid="text-results-count">
                  {resources.length} resources found
                </p>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader>
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-16 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Failed to load resources</h3>
                <p className="text-muted-foreground mb-6">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            )}

            {/* Resources Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => {
                  const TypeIcon = getTypeIcon(resource.resourceType);
                  const resourceUrl = `/resources/${resource.slug}`;
                  return (
                    <Link key={resource.id} href={resourceUrl}>
                      <Card className="h-full hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-resource-${resource.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getTypeBadgeColor(resource.resourceType)} data-testid={`badge-type-${resource.id}`}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {resource.resourceType}
                            </Badge>
                            {resource.isPremium && (
                              <Badge className="bg-accent/10 text-accent border-accent/20" data-testid={`badge-premium-${resource.id}`}>
                                <Crown className="h-3 w-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg" data-testid={`text-title-${resource.id}`}>{resource.title}</CardTitle>
                          <CardDescription data-testid={`text-description-${resource.id}`}>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1" data-testid={`text-rating-${resource.id}`}>
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span>{resource.rating ?? "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1" data-testid={`text-uses-${resource.id}`}>
                                <Download className="h-4 w-4" />
                                <span>{(resource.useCount || 0).toLocaleString()} uses</span>
                              </div>
                            </div>

                            {/* Difficulty */}
                            {resource.difficulty && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Difficulty:</span>
                                <span className={`text-xs font-semibold capitalize ${getDifficultyColor(resource.difficulty)}`} data-testid={`text-difficulty-${resource.id}`}>
                                  {resource.difficulty}
                                </span>
                              </div>
                            )}

                            {/* Action Button */}
                            <Button className="w-full" size="sm" data-testid={`button-access-${resource.id}`}>
                              {resource.isPremium && <Lock className="h-4 w-4 mr-2" />}
                              {resource.isPremium ? "Unlock with Pro" : "Access Free"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && resources.length === 0 && (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2" data-testid="text-no-results">No resources found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button
                  onClick={() => {
                    setSelectedSegment("all");
                    setSelectedType(null);
                    setSearchQuery("");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </Tabs>
            </div>

            {/* Sidebar - Ads */}
            <aside className="hidden lg:block lg:w-80">
              <div className="sticky top-24 space-y-6">
                <Advertisement placement="sidebar" />
                <Advertisement placement="inline" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-background to-primary/5 border-t border-border py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <GraduationCap className="h-16 w-16 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Unlock All Premium Resources</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get unlimited access to 50+ premium calculators, templates, and tools with Pro membership
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="button-upgrade-pro">
                <Crown className="h-5 w-5 mr-2" />
                View Pricing Plans
              </Button>
            </Link>
            <Link href="/vendors">
              <Button size="lg" variant="outline" data-testid="button-vendor-directory">
                Explore Vendor Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
