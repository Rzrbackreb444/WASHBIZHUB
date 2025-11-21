import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: "calculator" | "guide" | "checklist" | "template" | "tool";
  category: string;
  targetAudience: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  isPremium: boolean;
  rating: number;
  useCount: number;
  url: string;
}

const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: "1",
    title: "ROI Calculator Pro",
    description: "Calculate return on investment with 17-factor CLEANBI™ analysis including equipment depreciation, utility costs, and market dynamics.",
    type: "calculator",
    category: "financial",
    targetAudience: ["owner", "investor", "broker"],
    difficulty: "intermediate",
    isPremium: false,
    rating: 4.8,
    useCount: 12453,
    url: "/roi-calculator",
  },
  {
    id: "2",
    title: "Equipment Maintenance Schedule Template",
    description: "Preventive maintenance tracking spreadsheet for washers, dryers, and payment systems with automated reminders.",
    type: "template",
    category: "operational",
    targetAudience: ["owner", "technician"],
    difficulty: "beginner",
    isPremium: true,
    rating: 4.9,
    useCount: 8921,
    url: "/templates",
  },
  {
    id: "3",
    title: "Due Diligence Checklist - Laundromat Acquisition",
    description: "Comprehensive 127-point checklist covering financials, equipment, lease terms, competition, and regulatory compliance.",
    type: "checklist",
    category: "legal",
    targetAudience: ["investor", "broker", "lender"],
    difficulty: "advanced",
    isPremium: true,
    rating: 5.0,
    useCount: 5643,
    url: "/resources/due-diligence",
  },
  {
    id: "4",
    title: "Revenue Per Square Foot Calculator",
    description: "Benchmark your space efficiency against industry standards. Includes zone analysis and optimization recommendations.",
    type: "calculator",
    category: "financial",
    targetAudience: ["owner", "investor", "broker"],
    difficulty: "beginner",
    isPremium: false,
    rating: 4.7,
    useCount: 15789,
    url: "/calculator",
  },
  {
    id: "5",
    title: "Service Call Efficiency Tracker",
    description: "Track time per service call, parts usage, and profitability by technician and equipment type.",
    type: "tool",
    category: "operational",
    targetAudience: ["technician", "distributor"],
    difficulty: "intermediate",
    isPremium: true,
    rating: 4.6,
    useCount: 3201,
    url: "/resources/service-tracker",
  },
  {
    id: "6",
    title: "Marketing Budget Allocator",
    description: "AI-powered budget distribution across Google Ads, Facebook, SEO, and local marketing with projected ROI.",
    type: "calculator",
    category: "marketing",
    targetAudience: ["owner", "marketing_agency"],
    difficulty: "intermediate",
    isPremium: false,
    rating: 4.5,
    useCount: 7234,
    url: "/resources/marketing-budget",
  },
  {
    id: "7",
    title: "Insurance Coverage Analyzer",
    description: "Evaluate coverage gaps and compare policies for property, liability, equipment breakdown, and business interruption.",
    type: "guide",
    category: "legal",
    targetAudience: ["owner", "insurance_provider"],
    difficulty: "advanced",
    isPremium: true,
    rating: 4.9,
    useCount: 2156,
    url: "/resources/insurance-guide",
  },
  {
    id: "8",
    title: "Loan Pre-Qualification Calculator",
    description: "Estimate qualification for SBA 7(a), conventional, and seller financing with debt service coverage analysis.",
    type: "calculator",
    category: "financial",
    targetAudience: ["investor", "lender", "broker"],
    difficulty: "intermediate",
    isPremium: false,
    rating: 4.8,
    useCount: 9876,
    url: "/funding-matcher",
  },
  {
    id: "9",
    title: "Grand Opening Marketing Pack",
    description: "Complete marketing templates: flyers, social media posts, email campaigns, and promotional pricing strategies.",
    type: "template",
    category: "marketing",
    targetAudience: ["owner", "marketing_agency"],
    difficulty: "beginner",
    isPremium: true,
    rating: 4.7,
    useCount: 4532,
    url: "/templates",
  },
  {
    id: "10",
    title: "Vended Laundry Market Analysis Tool",
    description: "Analyze demographics, competition, and market saturation within any radius using census and proprietary data.",
    type: "tool",
    category: "technical",
    targetAudience: ["investor", "broker", "owner"],
    difficulty: "advanced",
    isPremium: false,
    rating: 4.9,
    useCount: 6789,
    url: "/cleanbi",
  },
  {
    id: "11",
    title: "Equipment Replacement Timeline",
    description: "Plan capital expenditures with depreciation schedules, expected lifespans, and financing options by equipment type.",
    type: "guide",
    category: "operational",
    targetAudience: ["owner", "distributor", "contractor"],
    difficulty: "intermediate",
    isPremium: false,
    rating: 4.6,
    useCount: 5421,
    url: "/resources/equipment-replacement",
  },
  {
    id: "12",
    title: "Customer Loyalty Program Template",
    description: "Pre-built reward structures, mobile app integration guides, and retention analytics dashboards.",
    type: "template",
    category: "marketing",
    targetAudience: ["owner", "software_vendor"],
    difficulty: "intermediate",
    isPremium: true,
    rating: 4.8,
    useCount: 3987,
    url: "/templates",
  },
];

export default function ResourcesPage() {
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = MOCK_RESOURCES.filter((resource) => {
    const matchesSegment =
      selectedSegment === "all" || resource.targetAudience.includes(selectedSegment);
    const matchesType = !selectedType || resource.type === selectedType;
    const matchesSearch =
      !searchQuery ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSegment && matchesType && matchesSearch;
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

  return (
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
              <p className="text-muted-foreground" data-testid="text-results-count">
                {filteredResources.length} resources found
              </p>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const TypeIcon = getTypeIcon(resource.type);
                return (
                  <Link key={resource.id} href={resource.url}>
                    <Card className="h-full hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-resource-${resource.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getTypeBadgeColor(resource.type)} data-testid={`badge-type-${resource.id}`}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {resource.type}
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
                              <span>{resource.rating}</span>
                            </div>
                            <div className="flex items-center gap-1" data-testid={`text-uses-${resource.id}`}>
                              <Download className="h-4 w-4" />
                              <span>{resource.useCount.toLocaleString()} uses</span>
                            </div>
                          </div>

                          {/* Difficulty */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Difficulty:</span>
                            <span className={`text-xs font-semibold capitalize ${getDifficultyColor(resource.difficulty)}`} data-testid={`text-difficulty-${resource.id}`}>
                              {resource.difficulty}
                            </span>
                          </div>

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

            {/* Empty State */}
            {filteredResources.length === 0 && (
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
  );
}
