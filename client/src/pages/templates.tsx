import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Crown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
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

export default function Templates() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates", selectedCategory],
    enabled: true,
  });

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
    "name": "Business Templates for Laundromat Owners",
    "description": "Professional templates including business plans, financial models, marketing materials, operations guides, and legal documents for laundromat businesses.",
    "url": `${baseUrl}/templates`,
    "numberOfItems": templates.length,
    "itemListElement": templates.slice(0, 10).map((template, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": template.name,
        "description": template.description,
        "offers": {
          "@type": "Offer",
          "price": template.isPremium ? (template.price || 9.99) : 0,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  const productCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Business Templates | WashBizHub",
    "description": "Download professional business templates for laundromat owners. Business plans, financial models, marketing templates, operations guides, and legal documents.",
    "url": `${baseUrl}/templates`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": templates.length
    }
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
        title="Business Templates - Plans, Financial Models & Legal Documents"
        description="Download professional business templates for laundromat owners. Business plans, financial projections, marketing materials, operations checklists, and legal documents. Free and premium templates available."
        canonicalUrl="/templates"
        ogType="website"
        keywords={[
          "laundromat business plan template",
          "laundromat financial model",
          "laundry business templates",
          "laundromat marketing templates",
          "laundromat operations checklist",
          "laundromat legal documents",
          "business plan templates",
          "financial projections template"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Templates", url: "/templates" }
        ]}
        structuredData={[templateListSchema, productCollectionSchema]}
      />

      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 sm:py-20">
        <div className="absolute inset-0 opacity-30">
          <img 
            src={laundromatInterior2} 
            alt="Professional laundromat interior - modern equipment and design"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Badge variant="secondary" className="mb-4" data-testid="badge-template-marketplace">
            Template Marketplace
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Premium Business Templates
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mb-6">
            Download professional templates for business plans, financial models, marketing materials, 
            operations guides, and legal documents. Everything you need to run a successful laundromat.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="border-white/30 text-white">
              <Crown className="w-3 h-3 mr-1" />
              {templates.filter(t => t.isPremium).length} Premium
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white">
              <FileText className="w-3 h-3 mr-1" />
              {templates.filter(t => !t.isPremium).length} Free
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
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

                    <div className="mt-auto border-t pt-3">
                      {template.isPremium ? (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-500" />
                              <span className="font-semibold text-lg" data-testid={`text-price-${template.id}`}>
                                ${template.price || "9.99"}
                              </span>
                            </div>
                            {user?.isPro && (
                              <Badge variant="secondary" className="text-xs">
                                Included with Pro
                              </Badge>
                            )}
                          </div>
                          <Button
                            className="w-full gap-2"
                            size="sm"
                            data-testid={`button-download-template-${template.id}`}
                          >
                            {user?.isPro ? (
                              <>
                                <Download className="w-4 h-4" />
                                Download Now
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                Purchase for ${template.price || "9.99"}
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
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

        <div className="mt-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Get All Templates with Pro</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Unlock access to all premium templates, plus exclusive features like CLEANBI analysis, 
            advanced calculators, and priority support.
          </p>
          <Button size="lg" className="gap-2" data-testid="button-upgrade-pro">
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
}
