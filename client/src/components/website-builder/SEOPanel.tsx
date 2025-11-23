import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, Search, Facebook, Twitter, RefreshCw, CheckCircle, AlertCircle,
  ExternalLink, Eye, Monitor, Smartphone, Loader2
} from "lucide-react";

interface Block {
  id: string;
  type: string;
  content: any;
}

interface SEOPanelProps {
  pageTitle: string;
  pageId?: string;
  blocks: Block[];
  onUpdate: (seoData: any) => void;
}

// Helper: Extract text content from blocks
function extractContentFromBlocks(blocks: Block[]): string {
  return blocks
    .map((block) => {
      if (block.type === "hero" && block.content?.headline) {
        return block.content.headline + " " + (block.content.subtitle || "");
      }
      if (block.type === "text" && block.content?.text) {
        return block.content.text;
      }
      if (block.type === "features" && block.content?.items) {
        return block.content.items.map((item: any) => item.title + " " + item.description).join(" ");
      }
      if (block.type === "testimonials" && block.content?.testimonials) {
        return block.content.testimonials.map((t: any) => t.quote).join(" ");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export function SEOPanel({ pageTitle, pageId, blocks, onUpdate }: SEOPanelProps) {
  const { toast } = useToast();
  const [seoMode, setSeoMode] = useState<"auto" | "manual" | "hybrid">("auto");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  
  // Open Graph
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogType, setOgType] = useState("website");
  
  // Twitter
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [twitterTitle, setTwitterTitle] = useState("");
  const [twitterDescription, setTwitterDescription] = useState("");
  const [twitterImage, setTwitterImage] = useState("");
  
  // SEO Score
  const [seoScore, setSeoScore] = useState(0);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Extract real page content
  const pageContent = extractContentFromBlocks(blocks);

  // AI Suggestions Mutation
  const suggestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seo/suggest", {
        pageTitle: pageTitle || "Untitled Page",
        pageContent: pageContent || "Page content will appear here",
        industry: "laundromat",
        targetKeywords: [],
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (seoMode === "auto") {
        // Auto mode: Apply all suggestions
        setMetaTitle(data.metaTitle);
        setMetaDescription(data.metaDescription);
        setSlug(data.slug);
        setOgTitle(data.ogTitle);
        setOgDescription(data.ogDescription);
        setTwitterTitle(data.twitterTitle);
        setTwitterDescription(data.twitterDescription);
      } else if (seoMode === "hybrid") {
        // Hybrid: Only update empty fields
        if (!metaTitle) setMetaTitle(data.metaTitle);
        if (!metaDescription) setMetaDescription(data.metaDescription);
        if (!slug) setSlug(data.slug);
        if (!ogTitle) setOgTitle(data.ogTitle);
        if (!ogDescription) setOgDescription(data.ogDescription);
      }
      
      toast({
        title: "AI Suggestions Generated",
        description: "SEO metadata has been optimized",
      });
      
      // Trigger analyze after suggestions
      analyzeMutation.mutate();
    },
    onError: (error: Error) => {
      toast({
        title: "AI Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // SEO Analysis Mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      // Build minimal HTML from blocks for analysis
      const html = `
        <html>
          <head>
            <title>${metaTitle || pageTitle}</title>
            <meta name="description" content="${metaDescription}" />
            <link rel="canonical" href="${canonicalUrl}" />
            <meta property="og:title" content="${ogTitle || metaTitle}" />
            <meta property="og:description" content="${ogDescription || metaDescription}" />
            <meta property="og:image" content="${ogImage}" />
            <meta name="twitter:card" content="${twitterCard}" />
            <meta name="twitter:title" content="${twitterTitle || ogTitle}" />
            <meta name="twitter:description" content="${twitterDescription || ogDescription}" />
          </head>
          <body>
            <h1>${pageTitle}</h1>
            ${pageContent}
          </body>
        </html>
      `;

      const response = await apiRequest("POST", "/api/seo/analyze", {
        html,
        url: `https://example.com/${slug}`,
        keywords: [],
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSeoScore(data.score || 0);
      toast({
        title: "SEO Analysis Complete",
        description: `Your page scored ${data.score}/300 points`,
      });
    },
    onError: (error: Error) => {
      console.error("SEO analysis failed:", error);
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="w-4 h-4 text-primary" />
            SEO & Social
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => suggestMutation.mutate()}
            disabled={suggestMutation.isPending || analyzeMutation.isPending}
            className="hover-elevate active-elevate-2"
            data-testid="button-ai-seo-suggest"
          >
            {suggestMutation.isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                AI Suggest
              </>
            )}
          </Button>
        </div>
        <CardDescription className="text-xs">
          Optimize your page for search engines and social media
        </CardDescription>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          {/* SEO Mode Selector */}
          <div className="space-y-2">
            <Label className="text-xs">SEO Mode</Label>
            <Select value={seoMode} onValueChange={(v: any) => setSeoMode(v)}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-seo-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (AI-Powered)</SelectItem>
                <SelectItem value="manual">Manual (Full Control)</SelectItem>
                <SelectItem value="hybrid">Hybrid (AI + Manual)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overall SEO Score */}
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">SEO Score</span>
              <span className={`text-lg font-bold ${getScoreColor(seoScore)}`}>
                {seoScore}/100
              </span>
            </div>
            <Progress value={seoScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {seoScore >= 80 && "Excellent! Your page is well-optimized."}
              {seoScore >= 60 && seoScore < 80 && "Good, but there's room for improvement."}
              {seoScore < 60 && "Needs attention. Follow recommendations below."}
            </p>
          </div>

          <Tabs defaultValue="metadata" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="metadata" className="text-xs" data-testid="tab-metadata">Metadata</TabsTrigger>
              <TabsTrigger value="social" className="text-xs" data-testid="tab-social">Social</TabsTrigger>
              <TabsTrigger value="preview" className="text-xs" data-testid="tab-preview">Preview</TabsTrigger>
            </TabsList>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-3 mt-3">
              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Meta Title</Label>
                  <span className={`text-xs ${metaTitle.length > 60 ? "text-red-600" : "text-muted-foreground"}`}>
                    {metaTitle.length}/60
                  </span>
                </div>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Enter meta title (50-60 chars)"
                  className="h-8 text-xs"
                  data-testid="input-meta-title"
                />
                {metaTitle.length > 60 && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Title too long. Google may truncate it.
                  </p>
                )}
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Meta Description</Label>
                  <span className={`text-xs ${metaDescription.length > 160 ? "text-red-600" : "text-muted-foreground"}`}>
                    {metaDescription.length}/160
                  </span>
                </div>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Enter meta description (150-160 chars)"
                  className="text-xs resize-none h-20"
                  data-testid="input-meta-description"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label className="text-xs">URL Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="url-friendly-slug"
                  className="h-8 text-xs font-mono"
                  data-testid="input-slug"
                />
                <p className="text-xs text-muted-foreground">
                  https://example.com/{slug || "your-slug-here"}
                </p>
              </div>

              {/* Canonical URL */}
              <div className="space-y-1.5">
                <Label className="text-xs">Canonical URL (Optional)</Label>
                <Input
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://example.com/canonical-page"
                  className="h-8 text-xs"
                  data-testid="input-canonical-url"
                />
              </div>
            </TabsContent>

            {/* Social Media Tab */}
            <TabsContent value="social" className="space-y-4 mt-3">
              {/* Open Graph */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium">Open Graph (Facebook)</span>
                </div>
                <Separator />
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">OG Title</Label>
                    <Input
                      value={ogTitle}
                      onChange={(e) => setOgTitle(e.target.value)}
                      placeholder={metaTitle || "Open Graph title"}
                      className="h-8 text-xs mt-1"
                      data-testid="input-og-title"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">OG Description</Label>
                    <Textarea
                      value={ogDescription}
                      onChange={(e) => setOgDescription(e.target.value)}
                      placeholder={metaDescription || "Open Graph description"}
                      className="text-xs resize-none h-16 mt-1"
                      data-testid="input-og-description"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">OG Image URL</Label>
                    <Input
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="https://example.com/og-image.jpg"
                      className="h-8 text-xs mt-1"
                      data-testid="input-og-image"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1200x630px
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs">OG Type</Label>
                    <Select value={ogType} onValueChange={setOgType}>
                      <SelectTrigger className="h-8 text-xs mt-1" data-testid="select-og-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Twitter Card */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium">Twitter Card</span>
                </div>
                <Separator />
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Twitter Title</Label>
                    <Input
                      value={twitterTitle}
                      onChange={(e) => setTwitterTitle(e.target.value)}
                      placeholder={ogTitle || metaTitle || "Twitter card title"}
                      className="h-8 text-xs mt-1"
                      data-testid="input-twitter-title"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Twitter Description</Label>
                    <Textarea
                      value={twitterDescription}
                      onChange={(e) => setTwitterDescription(e.target.value)}
                      placeholder={ogDescription || metaDescription || "Twitter card description"}
                      className="text-xs resize-none h-16 mt-1"
                      data-testid="input-twitter-description"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Twitter Image URL</Label>
                    <Input
                      value={twitterImage}
                      onChange={(e) => setTwitterImage(e.target.value)}
                      placeholder={ogImage || "https://example.com/twitter-image.jpg"}
                      className="h-8 text-xs mt-1"
                      data-testid="input-twitter-image"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-3 mt-3">
              {/* Device Toggle */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={previewMode === "desktop" ? "default" : "outline"}
                  onClick={() => setPreviewMode("desktop")}
                  className="flex-1 h-7 text-xs"
                  data-testid="button-preview-desktop"
                >
                  <Monitor className="w-3 h-3 mr-1" />
                  Desktop
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === "mobile" ? "default" : "outline"}
                  onClick={() => setPreviewMode("mobile")}
                  className="flex-1 h-7 text-xs"
                  data-testid="button-preview-mobile"
                >
                  <Smartphone className="w-3 h-3 mr-1" />
                  Mobile
                </Button>
              </div>

              {/* Google Search Preview */}
              <div className="space-y-2">
                <span className="text-xs font-medium">Google Search Preview</span>
                <div className="p-3 bg-white rounded border text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <Search className="w-2 h-2 text-primary" />
                    </div>
                    <span className="text-green-700">example.com › {slug || "page"}</span>
                  </div>
                  <h3 className="text-blue-700 text-base font-normal hover:underline cursor-pointer line-clamp-1">
                    {metaTitle || pageTitle || "Your Page Title Will Appear Here"}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mt-0.5">
                    {metaDescription || "Your meta description will appear here. Make it compelling to improve click-through rates!"}
                  </p>
                </div>
              </div>

              {/* Facebook Preview */}
              <div className="space-y-2">
                <span className="text-xs font-medium flex items-center gap-1">
                  <Facebook className="w-3 h-3 text-blue-600" />
                  Facebook Preview
                </span>
                <div className="border rounded overflow-hidden bg-white">
                  {ogImage && (
                    <div className="aspect-[1.91/1] bg-gray-200 relative">
                      <img src={ogImage} alt="OG" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-2 text-xs bg-gray-50">
                    <p className="text-gray-500 uppercase text-[10px]">EXAMPLE.COM</p>
                    <h4 className="font-semibold text-gray-900 line-clamp-1">
                      {ogTitle || metaTitle || "Your Page Title"}
                    </h4>
                    <p className="text-gray-600 line-clamp-2 text-[11px]">
                      {ogDescription || metaDescription || "Description"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Twitter Preview */}
              <div className="space-y-2">
                <span className="text-xs font-medium flex items-center gap-1">
                  <Twitter className="w-3 h-3 text-blue-400" />
                  Twitter Preview
                </span>
                <div className="border rounded overflow-hidden bg-white">
                  {twitterImage && (
                    <div className="aspect-[2/1] bg-gray-200 relative">
                      <img src={twitterImage || ogImage} alt="Twitter" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-2 text-xs">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">
                      {twitterTitle || ogTitle || metaTitle || "Your Page Title"}
                    </h4>
                    <p className="text-gray-600 line-clamp-2 text-[11px] mt-0.5">
                      {twitterDescription || ogDescription || metaDescription || "Description"}
                    </p>
                    <p className="text-gray-400 text-[10px] mt-1">🔗 example.com</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
