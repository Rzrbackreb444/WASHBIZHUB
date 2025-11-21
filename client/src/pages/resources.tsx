import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
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
} from "lucide-react";
import { Link } from "wouter";

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
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "guide":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "checklist":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "template":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "tool":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      default:
        return "";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400";
      case "intermediate":
        return "text-yellow-400";
      case "advanced":
        return "text-red-400";
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
        title="Industry Resources Library - 100+ Calculators, Guides & Tools"
        description="Access 100+ enterprise-grade laundromat resources including ROI calculators, business valuation tools, financial templates, due diligence checklists, equipment guides, and marketing playbooks. Free and premium resources for owners, investors, and operators."
        canonicalUrl="/resources"
        keywords={[
          "laundromat calculator",
          "laundromat ROI",
          "laundromat valuation",
          "laundry business tools",
          "coin laundry resources",
          "laundromat templates",
          "laundromat business plan",
          "laundromat guides",
          "laundromat investment calculator"
        ]}
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20" data-testid="badge-resource-hub">
                <Zap className="w-3 h-3 mr-1" />
                Resource Hub
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-resources-title">
                Industry Resources Library
              </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-resources-subtitle">
              100+ calculators, guides, templates, and tools for every role in the laundromat ecosystem
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
                data-testid="input-search-resources"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
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
            <Link href="/subscribe">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="button-upgrade-pro">
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Pro - $49/mo
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
