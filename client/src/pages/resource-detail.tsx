import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Users, TrendingUp, Award, FileText } from "lucide-react";
import type { Resource } from "@shared/schema";

export default function ResourceDetail() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  const { data: resource, isLoading } = useQuery<Resource>({
    queryKey: ["/api/resources", slug],
    queryFn: async ({ queryKey }) => {
      const [, resourceSlug] = queryKey;
      const params = new URLSearchParams({ slug: resourceSlug as string });
      const response = await fetch(`/api/resources?${params}`);
      if (!response.ok) throw new Error("Failed to fetch resource");
      const data = await response.json();
      return data[0];
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h1 className="text-3xl font-bold mb-4">Resource Not Found</h1>
        <p className="text-muted-foreground mb-8">The resource you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/resources")} data-testid="button-back-to-resources">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>
      </div>
    );
  }

  const resourceTypeLabels: Record<string, string> = {
    calculator: "Calculator",
    guide: "Guide",
    template: "Template",
    checklist: "Checklist",
    "case-study": "Case Study",
  };

  const difficultyLabels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  const targetAudienceLabels: Record<string, string> = {
    owner: "Owners",
    investor: "Investors",
    broker: "Brokers",
    operator: "Operators",
    technician: "Technicians",
    startup: "Startups",
    buyer: "Buyers",
    distributor: "Distributors",
    contractor: "Contractors",
    agent: "Real Estate Agents",
    lender: "Lenders",
    agency: "Marketing Agencies",
    vendor: "Software Vendors",
    insurance: "Insurance Providers",
    customer: "Customers",
  };

  const getStructuredData = () => {
    const baseUrl = window.location.origin;
    
    if (resource.resourceType === "calculator") {
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": resource.title,
        "description": resource.description,
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": resource.isPremium ? "19.99" : "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": resource.rating ? {
          "@type": "AggregateRating",
          "ratingValue": resource.rating,
          "bestRating": "5",
          "ratingCount": resource.useCount || 1
        } : undefined
      };
    } else if (resource.resourceType === "guide") {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": resource.title,
        "description": resource.description,
        "author": {
          "@type": "Organization",
          "name": "WashBizHub"
        },
        "publisher": {
          "@type": "Organization",
          "name": "WashBizHub",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`
          }
        }
      };
    } else {
      return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": resource.title,
        "description": resource.description,
        "totalTime": "PT30M"
      };
    }
  };

  const keywords = [
    "laundromat",
    resource.resourceType,
    resource.category,
    ...(resource.tags || []),
    ...resource.targetAudience.map((t: string) => targetAudienceLabels[t] || t)
  ];

  return (
    <>
      <SEO
        title={resource.title}
        description={resource.description}
        canonicalUrl={`/resources/${resource.slug}`}
        ogType="article"
        keywords={keywords}
        structuredData={getStructuredData()}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => setLocation("/resources")}
            className="mb-6"
            data-testid="button-back-to-resources"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Button>

          <div className="grid gap-8">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" data-testid={`badge-type-${resource.resourceType}`}>
                        {resourceTypeLabels[resource.resourceType] || resource.resourceType}
                      </Badge>
                      {resource.isPremium && (
                        <Badge className="bg-gradient-to-r from-primary to-primary/80" data-testid="badge-pro">
                          <Award className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                      {resource.difficulty && (
                        <Badge variant="outline" data-testid={`badge-difficulty-${resource.difficulty}`}>
                          {difficultyLabels[resource.difficulty] || resource.difficulty}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="heading-resource-title">
                      {resource.title}
                    </h1>
                  </div>
                </div>
                <CardDescription className="text-lg leading-relaxed" data-testid="text-resource-description">
                  {resource.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Target Audience
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {resource.targetAudience.map((audience: string) => (
                        <Badge key={audience} variant="outline" data-testid={`badge-audience-${audience}`}>
                          {targetAudienceLabels[audience] || audience}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {resource.tags && resource.tags.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Tags
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag}`}>
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    {resource.rating !== null && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Rating</h3>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 fill-primary text-primary" />
                          <span className="text-2xl font-bold" data-testid="text-rating">
                            {resource.rating.toFixed(1)}
                          </span>
                          <span className="text-muted-foreground">/  5.0</span>
                        </div>
                      </div>
                    )}
                    {resource.useCount !== null && resource.useCount > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Times Used</h3>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-bold" data-testid="text-use-count">
                            {resource.useCount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <Button size="lg" className="w-full sm:w-auto" data-testid="button-access-resource">
                      {resource.isPremium ? "Unlock with Pro" : "Access Resource"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
