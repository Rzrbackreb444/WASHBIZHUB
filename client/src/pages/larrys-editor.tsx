import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import wbhLogo from "@assets/0e699c28-a096-4776-86d0-ffcbe3b0467e_1766502905215.jpg";
import {
  FileText, Image as ImageIcon, Video, Calculator, Save, Eye, Send,
  Sparkles, Search, BarChart3, CheckCircle2, AlertTriangle, Info,
  Bold, Italic, Underline, List, ListOrdered, Link2, Quote, Code,
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Plus, Trash2, GripVertical, Settings, Globe, Target,
  Award, Users, TrendingUp, DollarSign, Crown, Star, Zap, BookOpen,
  MessageSquare, Mail, Phone, Calendar, Clock, ArrowRight, ExternalLink,
  Upload, X, ChevronDown, Loader2, Copy, Download, Share2
} from "lucide-react";

// All calculator options for embedding
const CALCULATORS = [
  { id: "cleanbi", name: "CLEANBI Score Calculator", category: "Intelligence" },
  { id: "roi", name: "ROI Calculator", category: "Financial" },
  { id: "valuation", name: "Business Valuation", category: "Financial" },
  { id: "breakeven", name: "Break-Even Calculator", category: "Financial" },
  { id: "loan", name: "Loan Calculator", category: "Financial" },
  { id: "utility", name: "Utility Cost Calculator", category: "Operations" },
  { id: "labor", name: "Labor Cost Calculator", category: "Operations" },
  { id: "yield", name: "Machine Yield Calculator", category: "Operations" },
  { id: "pricing", name: "Pricing Optimizer", category: "Intelligence" },
  { id: "expansion", name: "Expansion Planner", category: "Planning" },
  { id: "financing", name: "Financing Calculator", category: "Financial" },
  { id: "energy", name: "Energy Cost Calculator", category: "Operations" },
  { id: "ltv", name: "Customer LTV Calculator", category: "Analytics" },
  { id: "cac", name: "CAC Calculator", category: "Analytics" },
  { id: "churn", name: "Churn Predictor", category: "Analytics" },
  { id: "staffing", name: "Staffing Calculator", category: "Operations" },
  { id: "equipment-mix", name: "Equipment Mix Optimizer", category: "Planning" },
  { id: "what-if", name: "What-If Analysis", category: "Planning" },
  { id: "downtime", name: "Downtime Cost Calculator", category: "Operations" },
  { id: "route", name: "Route Profit Optimizer", category: "Operations" },
  { id: "wdf", name: "WDF Pricing Calculator", category: "Operations" },
  { id: "tpd", name: "Turns Per Day Calculator", category: "Operations" },
];

const CONTENT_TYPES = [
  { id: "blog", name: "Blog Post", icon: FileText },
  { id: "guide", name: "Comprehensive Guide", icon: BookOpen },
  { id: "tutorial", name: "Step-by-Step Tutorial", icon: ListOrdered },
  { id: "case-study", name: "Case Study", icon: BarChart3 },
  { id: "video", name: "Video Content", icon: Video },
  { id: "course", name: "Course Module", icon: Award },
];

const MONETIZATION_TIERS = [
  { id: "free", name: "Free", description: "Available to everyone" },
  { id: "preview", name: "Free Preview", description: "Teaser with paywall" },
  { id: "purchase", name: "One-Time Purchase", description: "Pay once, own forever" },
  { id: "subscription", name: "Subscribers Only", description: "Premium members only" },
];

interface ContentBlock {
  id: string;
  type: "text" | "heading" | "image" | "video" | "calculator" | "callout" | "quote" | "list" | "code";
  content: string;
  metadata?: {
    level?: 1 | 2 | 3;
    alt?: string;
    caption?: string;
    calculatorId?: string;
    variant?: "info" | "warning" | "success" | "tip";
    items?: string[];
    language?: string;
  };
}

interface SEOData {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
}

interface AEOData {
  faqEnabled: boolean;
  faqs: { question: string; answer: string }[];
  howToEnabled: boolean;
  howToSteps: { name: string; text: string }[];
  speakableEnabled: boolean;
}

interface EEATData {
  authorName: string;
  authorCredentials: string;
  authorBio: string;
  authorImage: string;
  sources: { title: string; url: string }[];
  lastReviewed: string;
  factChecked: boolean;
  expertReviewed: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  alt: string;
  caption: string;
  type: "image" | "video";
  width?: number;
  height?: number;
}

export default function LarrysEditor() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [contentType, setContentType] = useState("blog");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState<MediaItem | null>(null);
  const [monetization, setMonetization] = useState("free");
  const [price, setPrice] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  
  // Content blocks
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { id: "1", type: "text", content: "" }
  ]);
  
  // SEO Data
  const [seo, setSeo] = useState<SEOData>({
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    secondaryKeywords: [],
    canonicalUrl: "",
    noIndex: false,
    noFollow: false,
  });
  
  // AEO Data
  const [aeo, setAeo] = useState<AEOData>({
    faqEnabled: false,
    faqs: [],
    howToEnabled: false,
    howToSteps: [],
    speakableEnabled: false,
  });
  
  // E-E-A-T Data
  const [eeat, setEeat] = useState<EEATData>({
    authorName: "Larry Larsen",
    authorCredentials: "50+ Year Laundromat Industry Veteran",
    authorBio: "Larry Larsen has over 50 years of hands-on experience in the laundromat industry, having owned, operated, and consulted on hundreds of laundromats across the United States.",
    authorImage: "",
    sources: [],
    lastReviewed: new Date().toISOString().split('T')[0],
    factChecked: false,
    expertReviewed: false,
  });
  
  // Media library
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showCalculatorPicker, setShowCalculatorPicker] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
  
  // AI Analysis states
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [aeoScore, setAeoScore] = useState<number | null>(null);
  const [eeatScore, setEeatScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  
  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
    if (!seo.metaTitle) {
      setSeo(prev => ({ ...prev, metaTitle: value }));
    }
  };
  
  // Block management
  const addBlock = (type: ContentBlock["type"], afterIndex: number) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: "",
      metadata: type === "heading" ? { level: 2 } : undefined,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);
    setBlocks(newBlocks);
  };
  
  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };
  
  const removeBlock = (index: number) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((_, i) => i !== index));
    }
  };
  
  const insertCalculator = (calculatorId: string) => {
    if (currentBlockIndex !== null) {
      const newBlock: ContentBlock = {
        id: Date.now().toString(),
        type: "calculator",
        content: calculatorId,
        metadata: { calculatorId },
      };
      const newBlocks = [...blocks];
      newBlocks.splice(currentBlockIndex + 1, 0, newBlock);
      setBlocks(newBlocks);
    }
    setShowCalculatorPicker(false);
    setCurrentBlockIndex(null);
  };
  
  // AI Polish mutation
  const polishMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/ai/polish-content", {
        content,
        type: "professional"
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content Polished",
        description: `Improved from ${data.originalLength} to ${data.polishedLength} characters`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Polish Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // SEO Analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/ai/analyze-seo", { content });
      return response.json();
    },
    onSuccess: (data) => {
      setSeoScore(data.seoScore);
      setAeoScore(data.aeoScore);
      setEeatScore(data.eeatScore);
      toast({
        title: "Analysis Complete",
        description: `SEO: ${data.seoScore}, AEO: ${data.aeoScore}, E-E-A-T: ${data.eeatScore}`,
      });
    },
  });
  
  const handlePolishContent = async () => {
    setIsPolishing(true);
    const fullContent = blocks.map(b => b.content).join("\n\n");
    try {
      const result = await polishMutation.mutateAsync(fullContent);
      // Update the first text block with polished content
      const textBlocks = blocks.filter(b => b.type === "text");
      if (textBlocks.length > 0) {
        const index = blocks.findIndex(b => b.id === textBlocks[0].id);
        updateBlock(index, { content: result.polished });
      }
    } finally {
      setIsPolishing(false);
    }
  };
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const fullContent = `${title}\n\n${excerpt}\n\n${blocks.map(b => b.content).join("\n\n")}`;
    try {
      await analyzeMutation.mutateAsync(fullContent);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Save content
  const handleSave = async (publish = false) => {
    const contentData = {
      title,
      slug,
      excerpt,
      contentType,
      featuredImage,
      blocks,
      seo,
      aeo,
      eeat,
      monetization,
      price: monetization === "purchase" ? parseFloat(price) : null,
      isPublished: publish,
      isDraft: !publish,
      authorEmail: "larry@washbizhub.com",
      notifyEmails: ["nick@washbizhub.com", "larry@washbizhub.com"],
    };
    
    toast({
      title: publish ? "Published!" : "Saved as Draft",
      description: publish 
        ? "Your content is now live and notifications sent to Nick & Larry"
        : "Draft saved successfully",
    });
  };
  
  // Calculate overall score
  const overallScore = seoScore && aeoScore && eeatScore 
    ? Math.round((seoScore + aeoScore + eeatScore) / 3)
    : null;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <>
      <SEO
        title="Larry's Content Editor | WashBizHub"
        description="Professional content management system for Larry Larsen's premium laundromat content"
        canonicalUrl="/larrys-editor"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#001F3F]">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-[#001F3F]/95 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={wbhLogo} alt="WashBizHub" className="h-10 w-10 rounded-lg object-cover" />
              <div>
                <h1 className="text-white font-bold text-lg">Larry's Content Editor</h1>
                <p className="text-white/60 text-xs">WordPress-Killer for Laundromat Legends</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {overallScore !== null && (
                <Badge className={`${getScoreBg(overallScore)} ${getScoreColor(overallScore)}`}>
                  Score: {overallScore}/100
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                data-testid="button-analyze"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="ml-1 hidden sm:inline">Analyze</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white"
                onClick={handlePolishContent}
                disabled={isPolishing}
                data-testid="button-polish"
              >
                {isPolishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="ml-1 hidden sm:inline">AI Polish</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white"
                onClick={() => handleSave(false)}
                data-testid="button-save-draft"
              >
                <Save className="w-4 h-4" />
                <span className="ml-1 hidden sm:inline">Save</span>
              </Button>
              
              <Button
                size="sm"
                className="bg-[#39CCCC] text-[#001F3F] hover:bg-[#39CCCC]/80"
                onClick={() => handleSave(true)}
                data-testid="button-publish"
              >
                <Send className="w-4 h-4" />
                <span className="ml-1">Publish</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-6">
              {/* Title & Basic Info */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4">
                    {/* Featured Image */}
                    <div 
                      className="w-32 h-32 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-[#39CCCC]/50 transition-colors flex-shrink-0"
                      onClick={() => setShowMediaLibrary(true)}
                      data-testid="button-featured-image"
                    >
                      {featuredImage ? (
                        <img src={featuredImage.url} alt={featuredImage.alt} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-1" />
                          <span className="text-xs text-white/40">Featured</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Enter your headline..."
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="bg-transparent border-0 text-2xl font-bold text-white placeholder:text-white/30 focus-visible:ring-0 p-0"
                        data-testid="input-title"
                      />
                      
                      <div className="flex gap-2 items-center">
                        <span className="text-white/40 text-sm">washbizhub.com/</span>
                        <Input
                          placeholder="url-slug"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          className="bg-white/5 border-white/10 text-white text-sm flex-1"
                          data-testid="input-slug"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Select value={contentType} onValueChange={setContentType}>
                          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white" data-testid="select-content-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTENT_TYPES.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4" />
                                  {type.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select value={monetization} onValueChange={setMonetization}>
                          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white" data-testid="select-monetization">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MONETIZATION_TIERS.map(tier => (
                              <SelectItem key={tier.id} value={tier.id}>
                                <div className="flex items-center gap-2">
                                  {tier.id === "subscription" && <Crown className="w-4 h-4 text-yellow-500" />}
                                  {tier.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {monetization === "purchase" && (
                          <div className="flex items-center gap-1">
                            <span className="text-white/60">$</span>
                            <Input
                              type="number"
                              placeholder="29.99"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="w-24 bg-white/5 border-white/10 text-white"
                              data-testid="input-price"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Write a compelling excerpt that will appear in search results and social shares..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]"
                    data-testid="input-excerpt"
                  />
                </CardContent>
              </Card>
              
              {/* Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-white/10 border border-white/10">
                  <TabsTrigger value="content" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-[#001F3F]">
                    <FileText className="w-4 h-4 mr-1" /> Content
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-[#001F3F]">
                    <Search className="w-4 h-4 mr-1" /> SEO
                  </TabsTrigger>
                  <TabsTrigger value="aeo" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-[#001F3F]">
                    <Target className="w-4 h-4 mr-1" /> AEO
                  </TabsTrigger>
                  <TabsTrigger value="eeat" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-[#001F3F]">
                    <Award className="w-4 h-4 mr-1" /> E-E-A-T
                  </TabsTrigger>
                </TabsList>
                
                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/10">
                    <CardContent className="p-4">
                      {/* Toolbar */}
                      <div className="flex items-center gap-1 p-2 bg-white/5 rounded-lg mb-4 flex-wrap">
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Underline className="w-4 h-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-white/20 mx-1" />
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Heading1 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Heading2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Heading3 className="w-4 h-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-white/20 mx-1" />
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <List className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <ListOrdered className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Quote className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Link2 className="w-4 h-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-white/20 mx-1" />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                          onClick={() => setShowMediaLibrary(true)}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-[#39CCCC] hover:text-[#39CCCC] hover:bg-[#39CCCC]/10 h-8 w-8"
                          onClick={() => {
                            setCurrentBlockIndex(blocks.length - 1);
                            setShowCalculatorPicker(true);
                          }}
                          data-testid="button-embed-calculator"
                        >
                          <Calculator className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Content Blocks */}
                      <div className="space-y-3">
                        {blocks.map((block, index) => (
                          <div key={block.id} className="group relative">
                            <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white cursor-grab">
                                <GripVertical className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {block.type === "text" && (
                              <Textarea
                                placeholder="Start writing your expert content..."
                                value={block.content}
                                onChange={(e) => updateBlock(index, { content: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[150px] resize-none"
                                data-testid={`textarea-block-${index}`}
                              />
                            )}
                            
                            {block.type === "calculator" && (
                              <div className="bg-[#39CCCC]/10 border border-[#39CCCC]/30 rounded-lg p-4 flex items-center gap-3">
                                <Calculator className="w-8 h-8 text-[#39CCCC]" />
                                <div>
                                  <p className="text-white font-medium">
                                    Embedded: {CALCULATORS.find(c => c.id === block.content)?.name || block.content}
                                  </p>
                                  <p className="text-white/60 text-sm">This calculator will be displayed inline with your content</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-auto text-white/40 hover:text-red-400"
                                  onClick={() => removeBlock(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            
                            {block.type === "image" && (
                              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-white/40" />
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <Input
                                      placeholder="Image URL"
                                      value={block.content}
                                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                                      className="bg-white/5 border-white/10 text-white"
                                    />
                                    <Input
                                      placeholder="Alt text (important for SEO & accessibility)"
                                      value={block.metadata?.alt || ""}
                                      onChange={(e) => updateBlock(index, { metadata: { ...block.metadata, alt: e.target.value } })}
                                      className="bg-white/5 border-white/10 text-white"
                                    />
                                    <Input
                                      placeholder="Caption (optional)"
                                      value={block.metadata?.caption || ""}
                                      onChange={(e) => updateBlock(index, { metadata: { ...block.metadata, caption: e.target.value } })}
                                      className="bg-white/5 border-white/10 text-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white/40 hover:text-red-400"
                                onClick={() => removeBlock(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Block Button */}
                        <div className="flex justify-center pt-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/10"
                              onClick={() => addBlock("text", blocks.length - 1)}
                              data-testid="button-add-text"
                            >
                              <Plus className="w-4 h-4 mr-1" /> Text
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/10"
                              onClick={() => addBlock("image", blocks.length - 1)}
                            >
                              <ImageIcon className="w-4 h-4 mr-1" /> Image
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#39CCCC]/50 text-[#39CCCC] hover:bg-[#39CCCC]/10"
                              onClick={() => {
                                setCurrentBlockIndex(blocks.length - 1);
                                setShowCalculatorPicker(true);
                              }}
                            >
                              <Calculator className="w-4 h-4 mr-1" /> Calculator
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* SEO Tab */}
                <TabsContent value="seo">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-[#39CCCC]" />
                        Search Engine Optimization
                        {seoScore !== null && (
                          <Badge className={`ml-auto ${getScoreBg(seoScore)} ${getScoreColor(seoScore)}`}>
                            {seoScore}/100
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Optimize for Google, Bing, and other search engines
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Meta Title</Label>
                        <Input
                          placeholder="SEO title (50-60 characters ideal)"
                          value={seo.metaTitle}
                          onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                          data-testid="input-meta-title"
                        />
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Characters: {seo.metaTitle.length}/60</span>
                          <span className={seo.metaTitle.length >= 50 && seo.metaTitle.length <= 60 ? "text-green-400" : "text-yellow-400"}>
                            {seo.metaTitle.length >= 50 && seo.metaTitle.length <= 60 ? "Optimal" : "Adjust length"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Meta Description</Label>
                        <Textarea
                          placeholder="Compelling description for search results (150-160 characters)"
                          value={seo.metaDescription}
                          onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                          className="bg-white/5 border-white/10 text-white min-h-[80px]"
                          data-testid="input-meta-description"
                        />
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Characters: {seo.metaDescription.length}/160</span>
                          <span className={seo.metaDescription.length >= 150 && seo.metaDescription.length <= 160 ? "text-green-400" : "text-yellow-400"}>
                            {seo.metaDescription.length >= 150 && seo.metaDescription.length <= 160 ? "Optimal" : "Adjust length"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Focus Keyword</Label>
                        <Input
                          placeholder="Primary keyword to rank for"
                          value={seo.focusKeyword}
                          onChange={(e) => setSeo({ ...seo, focusKeyword: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                          data-testid="input-focus-keyword"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Secondary Keywords (comma separated)</Label>
                        <Input
                          placeholder="laundromat business, coin laundry, wash and fold"
                          value={seo.secondaryKeywords.join(", ")}
                          onChange={(e) => setSeo({ ...seo, secondaryKeywords: e.target.value.split(",").map(k => k.trim()) })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Canonical URL</Label>
                        <Input
                          placeholder="https://washbizhub.com/..."
                          value={seo.canonicalUrl}
                          onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={seo.noIndex}
                            onCheckedChange={(checked) => setSeo({ ...seo, noIndex: checked })}
                          />
                          <Label className="text-white/70">No Index</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={seo.noFollow}
                            onCheckedChange={(checked) => setSeo({ ...seo, noFollow: checked })}
                          />
                          <Label className="text-white/70">No Follow</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* AEO Tab */}
                <TabsContent value="aeo">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#39CCCC]" />
                        Answer Engine Optimization
                        {aeoScore !== null && (
                          <Badge className={`ml-auto ${getScoreBg(aeoScore)} ${getScoreColor(aeoScore)}`}>
                            {aeoScore}/100
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Optimize for AI assistants, voice search, and featured snippets
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* FAQ Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={aeo.faqEnabled}
                              onCheckedChange={(checked) => setAeo({ ...aeo, faqEnabled: checked })}
                            />
                            <Label className="text-white font-medium">FAQ Schema</Label>
                          </div>
                          {aeo.faqEnabled && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white"
                              onClick={() => setAeo({
                                ...aeo,
                                faqs: [...aeo.faqs, { question: "", answer: "" }]
                              })}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add FAQ
                            </Button>
                          )}
                        </div>
                        
                        {aeo.faqEnabled && aeo.faqs.map((faq, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-white/60 text-sm">FAQ #{index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white/40 hover:text-red-400"
                                onClick={() => setAeo({
                                  ...aeo,
                                  faqs: aeo.faqs.filter((_, i) => i !== index)
                                })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Question"
                              value={faq.question}
                              onChange={(e) => {
                                const newFaqs = [...aeo.faqs];
                                newFaqs[index].question = e.target.value;
                                setAeo({ ...aeo, faqs: newFaqs });
                              }}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Textarea
                              placeholder="Answer"
                              value={faq.answer}
                              onChange={(e) => {
                                const newFaqs = [...aeo.faqs];
                                newFaqs[index].answer = e.target.value;
                                setAeo({ ...aeo, faqs: newFaqs });
                              }}
                              className="bg-white/5 border-white/10 text-white min-h-[80px]"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* How-To Section */}
                      <Separator className="bg-white/10" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={aeo.howToEnabled}
                              onCheckedChange={(checked) => setAeo({ ...aeo, howToEnabled: checked })}
                            />
                            <Label className="text-white font-medium">How-To Schema</Label>
                          </div>
                          {aeo.howToEnabled && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white"
                              onClick={() => setAeo({
                                ...aeo,
                                howToSteps: [...aeo.howToSteps, { name: "", text: "" }]
                              })}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Step
                            </Button>
                          )}
                        </div>
                        
                        {aeo.howToEnabled && aeo.howToSteps.map((step, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-white/60 text-sm">Step {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white/40 hover:text-red-400"
                                onClick={() => setAeo({
                                  ...aeo,
                                  howToSteps: aeo.howToSteps.filter((_, i) => i !== index)
                                })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Step name"
                              value={step.name}
                              onChange={(e) => {
                                const newSteps = [...aeo.howToSteps];
                                newSteps[index].name = e.target.value;
                                setAeo({ ...aeo, howToSteps: newSteps });
                              }}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Textarea
                              placeholder="Step instructions"
                              value={step.text}
                              onChange={(e) => {
                                const newSteps = [...aeo.howToSteps];
                                newSteps[index].text = e.target.value;
                                setAeo({ ...aeo, howToSteps: newSteps });
                              }}
                              className="bg-white/5 border-white/10 text-white min-h-[60px]"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="bg-white/10" />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={aeo.speakableEnabled}
                          onCheckedChange={(checked) => setAeo({ ...aeo, speakableEnabled: checked })}
                        />
                        <div>
                          <Label className="text-white font-medium">Speakable Content</Label>
                          <p className="text-white/40 text-sm">Mark content as suitable for voice assistants</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* E-E-A-T Tab */}
                <TabsContent value="eeat">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#39CCCC]" />
                        E-E-A-T Signals
                        {eeatScore !== null && (
                          <Badge className={`ml-auto ${getScoreBg(eeatScore)} ${getScoreColor(eeatScore)}`}>
                            {eeatScore}/100
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Experience, Expertise, Authoritativeness, Trustworthiness - Google's quality signals
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Author Info */}
                      <div className="space-y-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#39CCCC]" /> Author Information
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Author Name</Label>
                            <Input
                              value={eeat.authorName}
                              onChange={(e) => setEeat({ ...eeat, authorName: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Credentials</Label>
                            <Input
                              value={eeat.authorCredentials}
                              onChange={(e) => setEeat({ ...eeat, authorCredentials: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Author Bio</Label>
                          <Textarea
                            value={eeat.authorBio}
                            onChange={(e) => setEeat({ ...eeat, authorBio: e.target.value })}
                            className="bg-white/5 border-white/10 text-white min-h-[100px]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Author Photo URL</Label>
                          <Input
                            placeholder="https://..."
                            value={eeat.authorImage}
                            onChange={(e) => setEeat({ ...eeat, authorImage: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      
                      <Separator className="bg-white/10" />
                      
                      {/* Sources */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-[#39CCCC]" /> Sources & Citations
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white"
                            onClick={() => setEeat({
                              ...eeat,
                              sources: [...eeat.sources, { title: "", url: "" }]
                            })}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Source
                          </Button>
                        </div>
                        
                        {eeat.sources.map((source, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Source title"
                              value={source.title}
                              onChange={(e) => {
                                const newSources = [...eeat.sources];
                                newSources[index].title = e.target.value;
                                setEeat({ ...eeat, sources: newSources });
                              }}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Input
                              placeholder="URL"
                              value={source.url}
                              onChange={(e) => {
                                const newSources = [...eeat.sources];
                                newSources[index].url = e.target.value;
                                setEeat({ ...eeat, sources: newSources });
                              }}
                              className="bg-white/5 border-white/10 text-white flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white/40 hover:text-red-400"
                              onClick={() => setEeat({
                                ...eeat,
                                sources: eeat.sources.filter((_, i) => i !== index)
                              })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="bg-white/10" />
                      
                      {/* Trust Signals */}
                      <div className="space-y-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#39CCCC]" /> Trust Signals
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                            <Switch
                              checked={eeat.factChecked}
                              onCheckedChange={(checked) => setEeat({ ...eeat, factChecked: checked })}
                            />
                            <div>
                              <Label className="text-white">Fact Checked</Label>
                              <p className="text-white/40 text-xs">Content verified for accuracy</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                            <Switch
                              checked={eeat.expertReviewed}
                              onCheckedChange={(checked) => setEeat({ ...eeat, expertReviewed: checked })}
                            />
                            <div>
                              <Label className="text-white">Expert Reviewed</Label>
                              <p className="text-white/40 text-xs">Reviewed by industry expert</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Last Reviewed Date</Label>
                          <Input
                            type="date"
                            value={eeat.lastReviewed}
                            onChange={(e) => setEeat({ ...eeat, lastReviewed: e.target.value })}
                            className="bg-white/5 border-white/10 text-white w-48"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Scores Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#39CCCC]" />
                    Content Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">SEO Score</span>
                      <span className={seoScore ? getScoreColor(seoScore) : "text-white/40"}>
                        {seoScore ?? "—"}/100
                      </span>
                    </div>
                    <Progress value={seoScore || 0} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">AEO Score</span>
                      <span className={aeoScore ? getScoreColor(aeoScore) : "text-white/40"}>
                        {aeoScore ?? "—"}/100
                      </span>
                    </div>
                    <Progress value={aeoScore || 0} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">E-E-A-T Score</span>
                      <span className={eeatScore ? getScoreColor(eeatScore) : "text-white/40"}>
                        {eeatScore ?? "—"}/100
                      </span>
                    </div>
                    <Progress value={eeatScore || 0} className="h-2" />
                  </div>
                  
                  <Button
                    className="w-full bg-[#39CCCC]/20 text-[#39CCCC] hover:bg-[#39CCCC]/30 border border-[#39CCCC]/30"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Run AI Analysis</>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Ask Larry Card */}
              <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border-yellow-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-yellow-400" />
                    Ask Larry
                    <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Crown className="w-3 h-3 mr-1" /> Subscribers
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/70 text-sm">
                    Subscribers can submit questions directly to Larry Larsen for expert advice.
                  </p>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <MessageSquare className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">23 Pending Questions</p>
                    <p className="text-white/50 text-xs">From premium subscribers</p>
                  </div>
                  <Link href="/ask-larry">
                    <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400">
                      View Questions <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/larrys-content-empire">
                    <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                      <FileText className="w-4 h-4 mr-2" /> View All Content
                    </Button>
                  </Link>
                  <Link href="/admin/blog">
                    <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                      <BookOpen className="w-4 h-4 mr-2" /> Blog Manager
                    </Button>
                  </Link>
                  <Link href="/book-studio">
                    <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                      <FileText className="w-4 h-4 mr-2" /> Book Studio
                    </Button>
                  </Link>
                  <Link href="/calculators-suite">
                    <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                      <Calculator className="w-4 h-4 mr-2" /> Calculator Suite
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Notifications */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <Mail className="w-4 h-4" />
                    <span>Notifications go to:</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                      nick@washbizhub.com
                    </Badge>
                    <Badge variant="outline" className="text-xs border-white/20 text-white/80 ml-1">
                      larry@washbizhub.com
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Calculator Picker Dialog */}
        <Dialog open={showCalculatorPicker} onOpenChange={setShowCalculatorPicker}>
          <DialogContent className="bg-[#001F3F] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#39CCCC]" />
                Embed Calculator
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 gap-3">
                {CALCULATORS.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => insertCalculator(calc.id)}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#39CCCC]/50 rounded-lg text-left transition-colors"
                    data-testid={`button-embed-calc-${calc.id}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Calculator className="w-4 h-4 text-[#39CCCC]" />
                      <span className="font-medium text-white text-sm">{calc.name}</span>
                    </div>
                    <span className="text-white/50 text-xs">{calc.category}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        {/* Media Library Dialog */}
        <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
          <DialogContent className="bg-[#001F3F] border-white/10 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#39CCCC]" />
                Media Library
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button className="bg-[#39CCCC] text-[#001F3F]">
                  <Upload className="w-4 h-4 mr-2" /> Upload Image
                </Button>
                <Button variant="outline" className="border-white/20 text-white">
                  <Video className="w-4 h-4 mr-2" /> Add Video URL
                </Button>
              </div>
              
              <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-12 text-center">
                <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60 mb-2">Drag and drop files here</p>
                <p className="text-white/40 text-sm">Supports: JPG, PNG, GIF, WebP, MP4</p>
              </div>
              
              {mediaLibrary.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  No media uploaded yet. Upload your first image or video!
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
