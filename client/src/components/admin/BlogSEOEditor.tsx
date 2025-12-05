import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Search, Share2, Code2, Image as ImageIcon, Sparkles, Loader2,
  Check, X, AlertTriangle, Info, ExternalLink, Globe, Facebook, Twitter,
  Linkedin, Eye, Monitor, Smartphone, RefreshCw, Copy, Wand2, Target,
  BookOpen, Link2, Hash, FileCode, ChevronDown, ChevronUp, CircleCheck,
  CircleX, CircleMinus, Lightbulb
} from "lucide-react";

interface BlogSEOEditorProps {
  formData: BlogFormData;
  setFormData: (data: BlogFormData) => void;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  subcategory: string;
  tags: string;
  published: boolean;
  featured: boolean;
  featuredImage: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyphrase: string;
  secondaryKeyphrases: string;
  slug: string;
  canonicalUrl: string;
  breadcrumbTitle: string;
  pageType: string;
  articleType: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  authorName: string;
}

interface SEOAnalysis {
  score: number;
  problems: string[];
  improvements: string[];
  goodResults: string[];
}

interface ReadabilityAnalysis {
  score: number;
  fleschReadingEase: number;
  grade: string;
  recommendations: string[];
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "industry-news", label: "Industry News" },
  { value: "guides", label: "Guides" },
  { value: "case-studies", label: "Case Studies" },
  { value: "tools", label: "Tools" },
  { value: "equipment", label: "Equipment" },
  { value: "operations", label: "Operations" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "growth", label: "Growth" },
];

const PAGE_TYPES = [
  { value: "WebPage", label: "Web Page" },
  { value: "Article", label: "Article" },
  { value: "BlogPosting", label: "Blog Posting" },
  { value: "NewsArticle", label: "News Article" },
];

const ARTICLE_TYPES = [
  { value: "Article", label: "Article (Default)" },
  { value: "NewsArticle", label: "News Article" },
  { value: "BlogPosting", label: "Blog Posting" },
  { value: "TechArticle", label: "Technical Article" },
  { value: "HowTo", label: "How-To Guide" },
  { value: "FAQPage", label: "FAQ Page" },
];

type GenerationMode = "manual" | "auto" | "hybrid";
type AIProvider = "anthropic" | "gemini" | "multi";

const AI_PROVIDERS = [
  { value: "multi" as const, label: "Multi-AI (Best Quality)", description: "Uses multiple AI models for optimal results" },
  { value: "anthropic" as const, label: "Claude (Anthropic)", description: "Excellent for long-form, detailed content" },
  { value: "gemini" as const, label: "Gemini (Google)", description: "Great for research and data-driven content" },
];

const GENERATION_MODES = [
  { value: "manual" as const, label: "Manual", description: "Write content yourself with SEO guidance", icon: FileText },
  { value: "hybrid" as const, label: "Hybrid", description: "AI generates outline, you refine content", icon: Wand2 },
  { value: "auto" as const, label: "Full Auto", description: "AI generates complete SEO-optimized post", icon: Sparkles },
];

export function BlogSEOEditor({ 
  formData, 
  setFormData, 
  isEditing, 
  onSave, 
  onCancel, 
  isSaving 
}: BlogSEOEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [serpPreviewMode, setSerpPreviewMode] = useState<"mobile" | "desktop">("desktop");
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [isGeneratingKeyphrases, setIsGeneratingKeyphrases] = useState(false);
  const [suggestedKeyphrases, setSuggestedKeyphrases] = useState<string[]>([]);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("manual");
  const [aiProvider, setAiProvider] = useState<AIProvider>("multi");
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [synonyms, setSynonyms] = useState<string[]>([]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  useEffect(() => {
    if (formData.title && !formData.slug) {
      setFormData({ ...formData, slug: generateSlug(formData.title) });
    }
    if (formData.title && !formData.metaTitle) {
      setFormData({ ...formData, metaTitle: formData.title.substring(0, 70) });
    }
    if (formData.excerpt && !formData.metaDescription) {
      setFormData({ ...formData, metaDescription: formData.excerpt.substring(0, 160) });
    }
  }, [formData.title, formData.excerpt]);

  const seoAnalysis = useMemo((): SEOAnalysis => {
    const problems: string[] = [];
    const improvements: string[] = [];
    const goodResults: string[] = [];
    let score = 0;
    const maxScore = 100;

    if (!formData.focusKeyphrase) {
      problems.push("No focus keyphrase set. Add a keyphrase to optimize your content.");
    } else {
      score += 10;
      const keyphraseLower = formData.focusKeyphrase.toLowerCase();
      
      if (formData.title.toLowerCase().includes(keyphraseLower)) {
        goodResults.push("Focus keyphrase appears in the title. Great!");
        score += 10;
      } else {
        problems.push("Focus keyphrase doesn't appear in the title.");
      }
      
      if (formData.metaDescription.toLowerCase().includes(keyphraseLower)) {
        goodResults.push("Focus keyphrase appears in meta description.");
        score += 10;
      } else {
        improvements.push("Add the focus keyphrase to your meta description.");
      }
      
      if (formData.slug.toLowerCase().includes(keyphraseLower.replace(/\s+/g, '-'))) {
        goodResults.push("Focus keyphrase appears in the slug.");
        score += 10;
      } else {
        improvements.push("Consider adding the focus keyphrase to your URL slug.");
      }
      
      if (formData.content.toLowerCase().includes(keyphraseLower)) {
        goodResults.push("Focus keyphrase appears in the content.");
        score += 10;
      } else {
        problems.push("Focus keyphrase not found in content.");
      }
      
      if (formData.featuredImageAlt?.toLowerCase().includes(keyphraseLower)) {
        goodResults.push("Focus keyphrase appears in image alt text.");
        score += 5;
      } else if (formData.featuredImage) {
        improvements.push("Add the focus keyphrase to your featured image alt text.");
      }
    }

    if (!formData.metaTitle) {
      problems.push("No meta title set. Search engines will use your page title.");
    } else if (formData.metaTitle.length < 30) {
      improvements.push("Meta title is too short. Aim for 50-60 characters.");
    } else if (formData.metaTitle.length > 70) {
      problems.push("Meta title is too long and will be truncated in search results.");
    } else {
      goodResults.push("Meta title length is optimal.");
      score += 10;
    }

    if (!formData.metaDescription) {
      problems.push("No meta description set. Search engines will generate one automatically.");
    } else if (formData.metaDescription.length < 120) {
      improvements.push("Meta description is short. Aim for 150-160 characters.");
    } else if (formData.metaDescription.length > 160) {
      problems.push("Meta description is too long and will be truncated.");
    } else {
      goodResults.push("Meta description length is optimal.");
      score += 10;
    }

    if (!formData.featuredImage) {
      improvements.push("Add a featured image to improve engagement and social sharing.");
    } else {
      goodResults.push("Featured image is set.");
      score += 5;
    }

    const wordCount = formData.content.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 300) {
      problems.push(`Content is too short (${wordCount} words). Aim for at least 1000 words.`);
    } else if (wordCount < 1000) {
      improvements.push(`Content could be longer (${wordCount} words). 1500+ words rank better.`);
      score += 5;
    } else {
      goodResults.push(`Good content length (${wordCount} words).`);
      score += 10;
    }

    if (!formData.slug) {
      problems.push("No URL slug set.");
    } else if (formData.slug.length > 75) {
      improvements.push("URL slug is quite long. Shorter URLs tend to perform better.");
      score += 5;
    } else {
      goodResults.push("URL slug is set and reasonable length.");
      score += 5;
    }

    return { score: Math.min(score, maxScore), problems, improvements, goodResults };
  }, [formData]);

  const readabilityAnalysis = useMemo((): ReadabilityAnalysis => {
    const words = formData.content.split(/\s+/).filter(w => w.length > 0);
    const sentences = formData.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const syllables = words.reduce((count, word) => {
      return count + countSyllables(word);
    }, 0);

    const wordCount = words.length;
    const sentenceCount = Math.max(sentences.length, 1);
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllables / Math.max(wordCount, 1);

    const fleschScore = Math.round(206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord));
    const normalizedScore = Math.max(0, Math.min(100, fleschScore));

    let grade: string;
    const recommendations: string[] = [];

    if (fleschScore >= 90) {
      grade = "Very Easy";
    } else if (fleschScore >= 80) {
      grade = "Easy";
    } else if (fleschScore >= 70) {
      grade = "Fairly Easy";
    } else if (fleschScore >= 60) {
      grade = "Standard";
    } else if (fleschScore >= 50) {
      grade = "Fairly Difficult";
      recommendations.push("Try using shorter sentences to improve readability.");
    } else if (fleschScore >= 30) {
      grade = "Difficult";
      recommendations.push("Use simpler words and shorter sentences.");
      recommendations.push("Break up long paragraphs into smaller chunks.");
    } else {
      grade = "Very Difficult";
      recommendations.push("Significantly simplify your content.");
      recommendations.push("Use common words instead of technical jargon.");
      recommendations.push("Keep sentences under 20 words on average.");
    }

    if (avgWordsPerSentence > 20) {
      recommendations.push(`Average sentence length is ${avgWordsPerSentence.toFixed(1)} words. Try to keep it under 20.`);
    }

    return {
      score: normalizedScore,
      fleschReadingEase: fleschScore,
      grade,
      recommendations
    };
  }, [formData.content]);

  const generateMetaSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seo/generate-meta", {
        title: formData.title,
        content: formData.content.substring(0, 2000),
        focusKeyphrase: formData.focusKeyphrase
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.metaTitle) {
        setFormData({ ...formData, metaTitle: data.metaTitle });
      }
      if (data.metaDescription) {
        setFormData({ ...formData, metaDescription: data.metaDescription });
      }
      toast({ title: "AI Suggestions Generated", description: "Meta title and description updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const generateKeyphrasesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seo/suggest-keyphrases", {
        topic: formData.title,
        content: formData.content.substring(0, 1000),
        currentKeyphrase: formData.focusKeyphrase
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.keyphrases && Array.isArray(data.keyphrases)) {
        setSuggestedKeyphrases(data.keyphrases);
      }
      toast({ title: "Keyphrases Generated", description: `Found ${data.keyphrases?.length || 0} suggestions.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const generateBlogMutation = useMutation({
    mutationFn: async ({ topic, category, provider, mode, targetWordCount }: {
      topic: string;
      category: string;
      provider: AIProvider;
      mode: GenerationMode;
      targetWordCount: number;
    }) => {
      setGenerationProgress("Initializing AI engines...");
      const response = await apiRequest("POST", "/api/blog/ai-generate", {
        keyword: topic,
        category,
        aiProvider: provider,
        mode,
        targetWordCount,
        tone: "professional"
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.title) setFormData(prev => ({ ...prev, title: data.title }));
      if (data.content) setFormData(prev => ({ ...prev, content: data.content }));
      if (data.excerpt) setFormData(prev => ({ ...prev, excerpt: data.excerpt }));
      if (data.metaTitle) setFormData(prev => ({ ...prev, metaTitle: data.metaTitle }));
      if (data.metaDescription) setFormData(prev => ({ ...prev, metaDescription: data.metaDescription }));
      if (data.focusKeyphrases?.length) {
        setFormData(prev => ({ ...prev, focusKeyphrase: data.focusKeyphrases[0] }));
        setSuggestedKeyphrases(data.focusKeyphrases);
      }
      if (data.synonyms) setSynonyms(data.synonyms);
      setIsGeneratingBlog(false);
      setGenerationProgress("");
      toast({ 
        title: "Blog Generated!", 
        description: `${data.qualityScore ? `Quality Score: ${data.qualityScore}% - ` : ""}Content ready for review.`
      });
    },
    onError: (error: Error) => {
      setIsGeneratingBlog(false);
      setGenerationProgress("");
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    }
  });

  const generateSynonymsMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const response = await apiRequest("POST", "/api/seo/expand-synonyms", {
        keyword,
        content: formData.content.substring(0, 500)
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.synonyms && Array.isArray(data.synonyms)) {
        setSynonyms(data.synonyms);
        toast({ title: "LSI Keywords Generated", description: `Found ${data.synonyms.length} semantic variations.` });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleGenerateBlog = () => {
    if (!formData.focusKeyphrase && !formData.title) {
      toast({ title: "Topic Required", description: "Enter a title or focus keyphrase first.", variant: "destructive" });
      return;
    }
    setIsGeneratingBlog(true);
    generateBlogMutation.mutate({
      topic: formData.focusKeyphrase || formData.title,
      category: formData.category || "laundromat",
      provider: aiProvider,
      mode: generationMode,
      targetWordCount: 1500
    });
  };

  const generateSchemaMarkup = () => {
    const baseUrl = "https://washbizhub.com";
    const schema = {
      "@context": "https://schema.org",
      "@type": formData.articleType || "BlogPosting",
      "headline": formData.metaTitle || formData.title,
      "description": formData.metaDescription || formData.excerpt,
      "image": formData.featuredImage || `${baseUrl}/og-image.jpg`,
      "author": {
        "@type": "Person",
        "name": formData.authorName || "WashBizHub Research Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "WashBizHub",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/blog/${formData.slug}`
      },
      "keywords": formData.tags.split(',').map(t => t.trim()).filter(Boolean).join(', ')
    };
    return JSON.stringify(schema, null, 2);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-background">
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-editor-title">
            {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Enterprise-grade SEO optimization for maximum visibility
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={seoAnalysis.score >= 70 ? "default" : seoAnalysis.score >= 40 ? "secondary" : "destructive"} className="gap-1">
              <Target className="h-3 w-3" />
              SEO: {seoAnalysis.score}%
            </Badge>
            <Badge variant={readabilityAnalysis.score >= 60 ? "default" : readabilityAnalysis.score >= 40 ? "secondary" : "destructive"} className="gap-1">
              <BookOpen className="h-3 w-3" />
              Readability: {readabilityAnalysis.grade}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="content" className="gap-2" data-testid="tab-content">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2" data-testid="tab-seo">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="schema" className="gap-2" data-testid="tab-schema">
            <Code2 className="h-4 w-4" />
            Schema
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2" data-testid="tab-social">
            <Share2 className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <ContentTab 
            formData={formData} 
            setFormData={setFormData}
            wordCount={formData.content.split(/\s+/).filter(w => w.length > 0).length}
            generationMode={generationMode}
            setGenerationMode={setGenerationMode}
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
            isGeneratingBlog={isGeneratingBlog}
            generationProgress={generationProgress}
            synonyms={synonyms}
            onGenerateBlog={handleGenerateBlog}
            onGenerateSynonyms={(kw) => generateSynonymsMutation.mutate(kw)}
            isGeneratingSynonyms={generateSynonymsMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <SEOTab
            formData={formData}
            setFormData={setFormData}
            seoAnalysis={seoAnalysis}
            readabilityAnalysis={readabilityAnalysis}
            serpPreviewMode={serpPreviewMode}
            setSerpPreviewMode={setSerpPreviewMode}
            suggestedKeyphrases={suggestedKeyphrases}
            isGeneratingMeta={generateMetaSuggestionsMutation.isPending}
            isGeneratingKeyphrases={generateKeyphrasesMutation.isPending}
            onGenerateMeta={() => generateMetaSuggestionsMutation.mutate()}
            onGenerateKeyphrases={() => generateKeyphrasesMutation.mutate()}
            onSelectKeyphrase={(kp) => setFormData({ ...formData, focusKeyphrase: kp })}
          />
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          <SchemaTab
            formData={formData}
            setFormData={setFormData}
            schemaMarkup={generateSchemaMarkup()}
            showPreview={showSchemaPreview}
            setShowPreview={setShowSchemaPreview}
            onCopySchema={() => copyToClipboard(generateSchemaMarkup(), "Schema markup")}
          />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialTab
            formData={formData}
            setFormData={setFormData}
          />
        </TabsContent>
      </Tabs>

      <Separator className="my-6" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              data-testid="switch-published"
            />
            <Label htmlFor="published" className="cursor-pointer">Publish immediately</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              data-testid="switch-featured"
            />
            <Label htmlFor="featured" className="cursor-pointer">Featured post</Label>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving} data-testid="button-save">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? "Update Post" : "Create Post"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContentTab({ 
  formData, 
  setFormData,
  wordCount,
  generationMode,
  setGenerationMode,
  aiProvider,
  setAiProvider,
  isGeneratingBlog,
  generationProgress,
  synonyms,
  onGenerateBlog,
  onGenerateSynonyms,
  isGeneratingSynonyms
}: { 
  formData: BlogFormData; 
  setFormData: (data: BlogFormData) => void;
  wordCount: number;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  aiProvider: AIProvider;
  setAiProvider: (provider: AIProvider) => void;
  isGeneratingBlog: boolean;
  generationProgress: string;
  synonyms: string[];
  onGenerateBlog: () => void;
  onGenerateSynonyms: (keyword: string) => void;
  isGeneratingSynonyms: boolean;
}) {
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Blog Generation
              <Badge variant="secondary" className="text-xs ml-auto">
                {generationMode === "auto" ? "Full Auto" : generationMode === "hybrid" ? "Hybrid" : "Manual"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Generate SEO-optimized content with AI-powered synonym expansion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {GENERATION_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.value}
                    variant={generationMode === mode.value ? "default" : "outline"}
                    className="h-auto py-3 flex flex-col gap-1"
                    onClick={() => setGenerationMode(mode.value)}
                    data-testid={`button-mode-${mode.value}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{mode.label}</span>
                  </Button>
                );
              })}
            </div>
            
            {generationMode !== "manual" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">AI Provider</Label>
                  <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as AIProvider)}>
                    <SelectTrigger data-testid="select-ai-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex flex-col">
                            <span>{p.label}</span>
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={onGenerateBlog}
                  disabled={isGeneratingBlog || (!formData.focusKeyphrase && !formData.title)}
                  className="w-full gap-2"
                  data-testid="button-generate-blog"
                >
                  {isGeneratingBlog ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {generationProgress || "Generating..."}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      {generationMode === "auto" ? "Generate Full Blog Post" : "Generate Outline"}
                    </>
                  )}
                </Button>
              </>
            )}

            {synonyms.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  LSI Keywords
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Latent Semantic Indexing keywords help search engines understand your content context.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex flex-wrap gap-1">
                  {synonyms.map((syn, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-primary/20"
                      onClick={() => {
                        const newContent = formData.content + ` ${syn}`;
                        setFormData({ ...formData, content: newContent });
                      }}
                    >
                      {syn}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            Title <span className="text-destructive">*</span>
            <Badge variant="outline" className="text-xs font-normal">
              {formData.title.length}/70 chars
            </Badge>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter your blog post title or topic for AI generation..."
            className="text-lg font-medium"
            required
            data-testid="input-title"
          />
          {formData.title.length > 60 && (
            <p className="text-xs text-amber-500">Title is getting long. Keep it under 60 characters for best results.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt" className="flex items-center gap-2">
            Excerpt <span className="text-destructive">*</span>
            <Badge variant="outline" className="text-xs font-normal">
              {formData.excerpt.length}/160 chars
            </Badge>
          </Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="A brief summary of your post (shown in listings)..."
            rows={3}
            required
            data-testid="input-excerpt"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content" className="flex items-center gap-2">
              Content <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{wordCount} words</span>
              <Separator orientation="vertical" className="h-4" />
              <span>{readingTime} min read</span>
              {formData.focusKeyphrase && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => onGenerateSynonyms(formData.focusKeyphrase)}
                    disabled={isGeneratingSynonyms}
                    data-testid="button-expand-synonyms"
                  >
                    {isGeneratingSynonyms ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Expand LSI
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your blog post content here. Supports Markdown formatting..."
            rows={16}
            className="font-mono text-sm"
            required
            data-testid="input-content"
          />
          <p className="text-xs text-muted-foreground">
            Tip: Aim for 1,500+ words for better SEO performance. Use headers (##) to structure your content.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Featured Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.featuredImage ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={formData.featuredImage} 
                  alt={formData.featuredImageAlt || "Featured image preview"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/1200x630/1e3a5f/c8a661?text=Image+Preview";
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setFormData({ ...formData, featuredImage: "", featuredImageAlt: "" })}
                  data-testid="button-remove-image"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No image selected</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="featuredImage" className="text-sm">Image URL</Label>
              <Input
                id="featuredImage"
                type="url"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
                data-testid="input-featured-image"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredImageAlt" className="text-sm flex items-center gap-2">
                Alt Text
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Describe the image for accessibility and SEO. Include your focus keyphrase if relevant.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="featuredImageAlt"
                value={formData.featuredImageAlt}
                onChange={(e) => setFormData({ ...formData, featuredImageAlt: e.target.value })}
                placeholder="Descriptive alt text for the image..."
                data-testid="input-featured-image-alt"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="laundromat, roi, business"
                data-testid="input-tags"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name</Label>
              <Input
                id="authorName"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                placeholder="WashBizHub Research Team"
                data-testid="input-author"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SEOTab({
  formData,
  setFormData,
  seoAnalysis,
  readabilityAnalysis,
  serpPreviewMode,
  setSerpPreviewMode,
  suggestedKeyphrases,
  isGeneratingMeta,
  isGeneratingKeyphrases,
  onGenerateMeta,
  onGenerateKeyphrases,
  onSelectKeyphrase
}: {
  formData: BlogFormData;
  setFormData: (data: BlogFormData) => void;
  seoAnalysis: SEOAnalysis;
  readabilityAnalysis: ReadabilityAnalysis;
  serpPreviewMode: "mobile" | "desktop";
  setSerpPreviewMode: (mode: "mobile" | "desktop") => void;
  suggestedKeyphrases: string[];
  isGeneratingMeta: boolean;
  isGeneratingKeyphrases: boolean;
  onGenerateMeta: () => void;
  onGenerateKeyphrases: () => void;
  onSelectKeyphrase: (kp: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Focus Keyphrase
            </CardTitle>
            <CardDescription>
              Enter the main keyphrase you want this content to rank for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={formData.focusKeyphrase}
                onChange={(e) => setFormData({ ...formData, focusKeyphrase: e.target.value })}
                placeholder="e.g., laundromat ROI calculator"
                data-testid="input-focus-keyphrase"
              />
              <Button 
                variant="outline" 
                onClick={onGenerateKeyphrases}
                disabled={isGeneratingKeyphrases || !formData.title}
                data-testid="button-suggest-keyphrases"
              >
                {isGeneratingKeyphrases ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Suggest
                  </>
                )}
              </Button>
            </div>
            {suggestedKeyphrases.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Suggested keyphrases:</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeyphrases.map((kp, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer hover-elevate"
                      onClick={() => onSelectKeyphrase(kp)}
                      data-testid={`badge-keyphrase-${i}`}
                    >
                      {kp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="secondaryKeyphrases" className="text-sm">Secondary Keyphrases</Label>
              <Input
                id="secondaryKeyphrases"
                value={formData.secondaryKeyphrases}
                onChange={(e) => setFormData({ ...formData, secondaryKeyphrases: e.target.value })}
                placeholder="coin laundry profit, washateria business"
                data-testid="input-secondary-keyphrases"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Search Appearance
                </CardTitle>
                <CardDescription>How your post will appear in Google search results</CardDescription>
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={serpPreviewMode === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSerpPreviewMode("desktop")}
                  className="h-7 px-2"
                  data-testid="button-preview-desktop"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={serpPreviewMode === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSerpPreviewMode("mobile")}
                  className="h-7 px-2"
                  data-testid="button-preview-mobile"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`bg-white dark:bg-gray-900 rounded-lg p-4 border ${serpPreviewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                washbizhub.com › blog › {formData.slug || "post-url"}
              </div>
              <h3 className="text-lg text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mb-1 line-clamp-1">
                {formData.metaTitle || formData.title || "Your Post Title Here"}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {formData.metaDescription || formData.excerpt || "Your meta description will appear here. Make it compelling to encourage clicks from search results."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaTitle" className="flex items-center gap-2">
                    SEO Title
                    <Badge variant="outline" className={`text-xs font-normal ${formData.metaTitle.length > 70 ? "border-destructive text-destructive" : formData.metaTitle.length > 60 ? "border-amber-500 text-amber-500" : ""}`}>
                      {formData.metaTitle.length}/70
                    </Badge>
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGenerateMeta}
                    disabled={isGeneratingMeta || !formData.content}
                    data-testid="button-generate-meta"
                  >
                    {isGeneratingMeta ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-1" />
                        AI Suggest
                      </>
                    )}
                  </Button>
                </div>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO-optimized title (50-60 chars ideal)"
                  data-testid="input-meta-title"
                />
                <Progress 
                  value={Math.min((formData.metaTitle.length / 70) * 100, 100)} 
                  className={`h-1 ${formData.metaTitle.length > 70 ? "[&>div]:bg-destructive" : formData.metaTitle.length > 60 ? "[&>div]:bg-amber-500" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="flex items-center gap-2">
                  Meta Description
                  <Badge variant="outline" className={`text-xs font-normal ${formData.metaDescription.length > 160 ? "border-destructive text-destructive" : formData.metaDescription.length > 155 ? "border-amber-500 text-amber-500" : ""}`}>
                    {formData.metaDescription.length}/160
                  </Badge>
                </Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Compelling description with CTA (150-160 chars)"
                  rows={3}
                  data-testid="input-meta-description"
                />
                <Progress 
                  value={Math.min((formData.metaDescription.length / 160) * 100, 100)} 
                  className={`h-1 ${formData.metaDescription.length > 160 ? "[&>div]:bg-destructive" : formData.metaDescription.length > 155 ? "[&>div]:bg-amber-500" : ""}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              URL & Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="your-post-url"
                    data-testid="input-slug"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData({ ...formData, slug: formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') })}
                    data-testid="button-regenerate-slug"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">washbizhub.com/blog/{formData.slug || "your-post-url"}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl" className="flex items-center gap-2">
                  Canonical URL
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Use this if this content exists elsewhere to avoid duplicate content issues</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="canonicalUrl"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  placeholder="https://... (leave empty for default)"
                  data-testid="input-canonical"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breadcrumbTitle" className="flex items-center gap-2">
                Breadcrumb Title
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Short title for breadcrumb navigation (defaults to post title)</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="breadcrumbTitle"
                value={formData.breadcrumbTitle}
                onChange={(e) => setFormData({ ...formData, breadcrumbTitle: e.target.value })}
                placeholder="Short breadcrumb title..."
                data-testid="input-breadcrumb"
              />
              <p className="text-xs text-muted-foreground">
                Preview: Home › Blog › {formData.breadcrumbTitle || formData.title || "Post Title"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="56" 
                    fill="none" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${(seoAnalysis.score / 100) * 352} 352`}
                    className={seoAnalysis.score >= 70 ? "stroke-green-500" : seoAnalysis.score >= 40 ? "stroke-amber-500" : "stroke-red-500"}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${seoAnalysis.score >= 70 ? "text-green-500" : seoAnalysis.score >= 40 ? "text-amber-500" : "text-red-500"}`}>
                    {seoAnalysis.score}
                  </span>
                </div>
              </div>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-4">
                {seoAnalysis.problems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-destructive">
                      <CircleX className="h-4 w-4" />
                      Problems ({seoAnalysis.problems.length})
                    </h4>
                    <ul className="space-y-1">
                      {seoAnalysis.problems.map((p, i) => (
                        <li key={i} className="text-xs text-muted-foreground pl-6 relative">
                          <span className="absolute left-0 top-1 w-2 h-2 rounded-full bg-destructive" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {seoAnalysis.improvements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-amber-500">
                      <CircleMinus className="h-4 w-4" />
                      Improvements ({seoAnalysis.improvements.length})
                    </h4>
                    <ul className="space-y-1">
                      {seoAnalysis.improvements.map((p, i) => (
                        <li key={i} className="text-xs text-muted-foreground pl-6 relative">
                          <span className="absolute left-0 top-1 w-2 h-2 rounded-full bg-amber-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {seoAnalysis.goodResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-green-500">
                      <CircleCheck className="h-4 w-4" />
                      Good Results ({seoAnalysis.goodResults.length})
                    </h4>
                    <ul className="space-y-1">
                      {seoAnalysis.goodResults.map((p, i) => (
                        <li key={i} className="text-xs text-muted-foreground pl-6 relative">
                          <span className="absolute left-0 top-1 w-2 h-2 rounded-full bg-green-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Readability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{readabilityAnalysis.fleschReadingEase}</p>
                <p className="text-sm text-muted-foreground">Flesch Score</p>
              </div>
              <Badge variant={readabilityAnalysis.score >= 60 ? "default" : "secondary"}>
                {readabilityAnalysis.grade}
              </Badge>
            </div>
            <Progress value={readabilityAnalysis.score} className="h-2" />
            {readabilityAnalysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                  <Lightbulb className="h-3 w-3" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {readabilityAnalysis.recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SchemaTab({
  formData,
  setFormData,
  schemaMarkup,
  showPreview,
  setShowPreview,
  onCopySchema
}: {
  formData: BlogFormData;
  setFormData: (data: BlogFormData) => void;
  schemaMarkup: string;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  onCopySchema: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Schema.org Configuration
          </CardTitle>
          <CardDescription>
            Structured data helps search engines understand your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Page Type</Label>
            <Select
              value={formData.pageType || "WebPage"}
              onValueChange={(value) => setFormData({ ...formData, pageType: value })}
            >
              <SelectTrigger data-testid="select-page-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the type that best describes this page
            </p>
          </div>

          <div className="space-y-2">
            <Label>Article Type</Label>
            <Select
              value={formData.articleType || "BlogPosting"}
              onValueChange={(value) => setFormData({ ...formData, articleType: value })}
            >
              <SelectTrigger data-testid="select-article-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Specific article classification for rich snippets
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                JSON-LD Preview
              </Label>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPreview(!showPreview)}
                  data-testid="button-toggle-schema"
                >
                  {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={onCopySchema} data-testid="button-copy-schema">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {showPreview && (
              <ScrollArea className="h-64 w-full rounded-md border bg-muted/50 p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {schemaMarkup}
                </pre>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schema Benefits</CardTitle>
          <CardDescription>
            How structured data improves your visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Search className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Rich Snippets</p>
                <p className="text-xs text-muted-foreground">
                  Enhanced search results with author, date, and ratings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Globe className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Knowledge Graph</p>
                <p className="text-xs text-muted-foreground">
                  Potential inclusion in Google's knowledge panel
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Answers</p>
                <p className="text-xs text-muted-foreground">
                  Better chance of being featured in AI-generated answers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SocialTab({
  formData,
  setFormData
}: {
  formData: BlogFormData;
  setFormData: (data: BlogFormData) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Customize how your post appears when shared on social media. Leave fields empty to use defaults.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook / LinkedIn
            </CardTitle>
            <CardDescription>Open Graph metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <div className="aspect-[1.91/1] bg-muted relative">
                {formData.ogImage || formData.featuredImage ? (
                  <img 
                    src={formData.ogImage || formData.featuredImage} 
                    alt="Social preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/1200x630/1e3a5f/c8a661?text=Social+Preview";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3 bg-white dark:bg-gray-900">
                <p className="text-xs text-muted-foreground uppercase mb-1">washbizhub.com</p>
                <h4 className="font-bold text-sm line-clamp-2 mb-1">
                  {formData.ogTitle || formData.metaTitle || formData.title || "Post Title"}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {formData.ogDescription || formData.metaDescription || formData.excerpt || "Post description..."}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="ogTitle" className="text-sm">Title</Label>
                <Input
                  id="ogTitle"
                  value={formData.ogTitle}
                  onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                  placeholder={formData.metaTitle || "Use SEO title"}
                  data-testid="input-og-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogDescription" className="text-sm">Description</Label>
                <Textarea
                  id="ogDescription"
                  value={formData.ogDescription}
                  onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                  placeholder={formData.metaDescription || "Use meta description"}
                  rows={2}
                  data-testid="input-og-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogImage" className="text-sm">Image URL (1200×630)</Label>
                <Input
                  id="ogImage"
                  value={formData.ogImage}
                  onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                  placeholder={formData.featuredImage || "Use featured image"}
                  data-testid="input-og-image"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              X (Twitter)
            </CardTitle>
            <CardDescription>Twitter Card metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-2xl overflow-hidden">
              <div className="aspect-[2/1] bg-muted relative">
                {formData.twitterImage || formData.ogImage || formData.featuredImage ? (
                  <img 
                    src={formData.twitterImage || formData.ogImage || formData.featuredImage} 
                    alt="Twitter preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/1200x600/1e3a5f/c8a661?text=Twitter+Preview";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3 bg-white dark:bg-gray-900">
                <h4 className="font-bold text-sm line-clamp-1 mb-1">
                  {formData.twitterTitle || formData.ogTitle || formData.metaTitle || formData.title || "Post Title"}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {formData.twitterDescription || formData.ogDescription || formData.metaDescription || formData.excerpt || "Post description..."}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  washbizhub.com
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="twitterTitle" className="text-sm">Title</Label>
                <Input
                  id="twitterTitle"
                  value={formData.twitterTitle}
                  onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
                  placeholder={formData.ogTitle || "Use OG title"}
                  data-testid="input-twitter-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterDescription" className="text-sm">Description</Label>
                <Textarea
                  id="twitterDescription"
                  value={formData.twitterDescription}
                  onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
                  placeholder={formData.ogDescription || "Use OG description"}
                  rows={2}
                  data-testid="input-twitter-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterImage" className="text-sm">Image URL (2:1 ratio)</Label>
                <Input
                  id="twitterImage"
                  value={formData.twitterImage}
                  onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
                  placeholder={formData.ogImage || "Use OG image"}
                  data-testid="input-twitter-image"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-700" />
              Tips & Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-muted-foreground">Use high-quality images at recommended sizes for crisp previews</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-muted-foreground">Keep titles under 70 characters to avoid truncation</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-muted-foreground">Include a clear call-to-action in descriptions</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-muted-foreground">Test previews with Facebook Debugger and Twitter Card Validator</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-medium">Image Sizes</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium">Facebook/LinkedIn</p>
                  <p>1200 × 630px</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium">X (Twitter)</p>
                  <p>1200 × 600px</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4 mr-1" />
                  Debug
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4 mr-1" />
                  Validate
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}
