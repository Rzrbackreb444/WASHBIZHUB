import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Download, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

export default function Templates() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates", selectedCategory],
    enabled: true,
  });

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "design", label: "Design Templates" },
    { value: "business", label: "Business Setup" },
    { value: "marketing", label: "Marketing Packages" },
    { value: "operations", label: "Operations" },
  ];

  const filtered = templates.filter((t) =>
    selectedCategory === "all" ? true : t.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Premium Templates</h1>
          <p className="text-lg text-primary-foreground/90">
            Ready-to-use templates for design, operations, marketing, and business setup
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No templates found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((template) => (
              <Card
                key={template.id}
                className="overflow-hidden hover-elevate flex flex-col h-full"
                data-testid={`card-template-${template.id}`}
              >
                {/* Preview Image */}
                {template.preview && (
                  <div className="h-48 bg-muted overflow-hidden">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {template.name}
                      </h3>
                      {template.subcategory && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.subcategory}
                        </p>
                      )}
                    </div>
                    {template.featured && (
                      <Badge variant="default" className="shrink-0">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Rating & Downloads */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      {template.rating ? (
                        <>
                          <Star className="w-3 h-3 fill-current" />
                          <span>{template.rating.toFixed(1)}</span>
                        </>
                      ) : (
                        <span>No ratings</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{template.downloadCount} downloads</span>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="mt-auto border-t pt-3">
                    {template.isPremium ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span className="font-semibold">
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
                          className="w-full"
                          size="sm"
                          data-testid={`button-download-template-${template.id}`}
                        >
                          {user?.isPro ? "Download" : "Unlock for $" + (template.price || "9.99")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        data-testid={`button-download-free-${template.id}`}
                      >
                        Download Free
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
