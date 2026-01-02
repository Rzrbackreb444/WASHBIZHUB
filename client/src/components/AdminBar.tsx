import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Plus,
  Edit,
  FileText,
  Users,
  Store,
  Settings,
  LogOut,
  ChevronDown,
  Megaphone,
  BarChart3,
  BookOpen,
  MessageSquare,
  Ticket,
  Search,
  Mail,
  Package,
  MapPin,
  Home,
  User,
  Menu,
  X,
  Sparkles,
  Wand2,
  Loader2,
  Globe,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Image,
  Upload,
  Twitter,
  Share2,
  Target,
  Zap,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditContext {
  type: string;
  label: string;
  editUrl: string;
}

function getEditContext(pathname: string): EditContext | null {
  if (pathname.startsWith('/laundromat-listings/') && pathname !== '/laundromat-listings') {
    const slug = pathname.replace('/laundromat-listings/', '');
    return { type: 'listing', label: 'Edit Listing', editUrl: `/admin/listings/edit/${slug}` };
  }
  if (pathname.startsWith('/blog/') && pathname !== '/blog') {
    const slug = pathname.replace('/blog/', '');
    return { type: 'post', label: 'Edit Post', editUrl: `/admin/blog/edit/${slug}` };
  }
  if (pathname.startsWith('/courses/') && pathname !== '/courses') {
    return { type: 'course', label: 'Edit Course', editUrl: `/admin/courses` };
  }
  if (pathname === '/') {
    return { type: 'page', label: 'Edit Homepage', editUrl: '/admin/settings' };
  }
  if (pathname === '/directory') {
    return { type: 'directory', label: 'Manage Directory', editUrl: '/admin/marketplace' };
  }
  if (pathname === '/forum') {
    return { type: 'forum', label: 'Moderate Forum', editUrl: '/admin/forum' };
  }
  return null;
}

const BLOG_CATEGORIES = [
  "Industry News", "Guides", "Case Studies", "Tools", 
  "Equipment", "Operations", "Marketing", "Finance", "Growth"
];

export default function AdminBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickGenOpen, setQuickGenOpen] = useState(false);
  const [quickGenTopic, setQuickGenTopic] = useState("");
  const [quickGenCategory, setQuickGenCategory] = useState("Guides");
  const [seoEditorOpen, setSeoEditorOpen] = useState(false);
  const [seoTab, setSeoTab] = useState("basic");
  
  // Basic SEO fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  
  // Focus Keyphrase
  const [focusKeyphrase, setFocusKeyphrase] = useState("");
  const [secondaryKeyphrases, setSecondaryKeyphrases] = useState("");
  
  // Featured Image
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  
  // Social Media - Open Graph
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  
  // Social Media - Twitter
  const [twitterTitle, setTwitterTitle] = useState("");
  const [twitterDescription, setTwitterDescription] = useState("");
  const [twitterImageUrl, setTwitterImageUrl] = useState("");
  const [twitterCardType, setTwitterCardType] = useState("summary_large_image");
  
  // Optimization Mode
  const [optimizationMode, setOptimizationMode] = useState<"auto" | "manual" | "hybrid">("manual");
  
  // Audit
  const [seoAuditStatus, setSeoAuditStatus] = useState<"idle" | "loading" | "done">("idle");
  const [seoScore, setSeoScore] = useState(0);
  const [seoAuditResults, setSeoAuditResults] = useState<{
    overallScore: number;
    titleScore: number;
    descriptionScore: number;
    keyphraseScore: number;
    imageScore: number;
    socialScore: number;
    issues: { type: "error" | "warning" | "success"; message: string }[];
  } | null>(null);
  
  const [imageUploading, setImageUploading] = useState(false);
  const [liveAnalysis, setLiveAnalysis] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Image upload handlers
  const uploadImage = async (file: File, type: string = 'featured') => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      
      const response = await fetch('/api/admin/page-seo/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      if (type === 'featured') {
        setFeaturedImageUrl(result.url);
      } else if (type === 'og') {
        setOgImageUrl(result.url);
      } else if (type === 'twitter') {
        setTwitterImageUrl(result.url);
      }
      
      toast({ title: "Image Uploaded", description: "Your image has been uploaded successfully." });
    } catch (error) {
      toast({ title: "Upload Failed", description: "Could not upload image. Try again.", variant: "destructive" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      uploadImage(files[0], 'featured');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadImage(files[0], 'featured');
    }
  };

  // Live SEO Analysis - runs when fields change
  const runLiveAnalysis = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/page-seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pagePath: location,
          title: seoTitle,
          description: seoDescription,
          focusKeyphrase,
          secondaryKeyphrases: secondaryKeyphrases.split(',').map(k => k.trim()).filter(Boolean),
          featuredImageUrl,
          featuredImageAlt,
          ogTitle,
          ogDescription,
          twitterTitle,
          twitterDescription
        })
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setLiveAnalysis(analysis);
        setSeoScore(analysis.score);
      }
    } catch (error) {
      console.error('Live analysis error:', error);
    }
  }, [location, seoTitle, seoDescription, focusKeyphrase, secondaryKeyphrases, featuredImageUrl, featuredImageAlt, ogTitle, ogDescription, twitterTitle, twitterDescription]);

  const quickGenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/blog/ai-generate", {
        keyword: quickGenTopic,
        category: quickGenCategory.toLowerCase(),
        aiProvider: "multi",
        mode: "auto",
        targetWordCount: 1500,
        tone: "professional"
      });
      return response.json();
    },
    onSuccess: async (data) => {
      const slug = data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-post';
      const postResponse = await apiRequest("POST", "/api/admin/blog/posts", {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        focusKeyphrase: data.focusKeyphrases?.[0],
        category: quickGenCategory,
        published: false,
        featured: false
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setQuickGenOpen(false);
      setQuickGenTopic("");
      toast({ 
        title: "Blog Generated!", 
        description: "New draft created. Opening editor..." 
      });
      setLocation('/admin/blog');
    },
    onError: (error: Error) => {
      toast({ 
        title: "Generation Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const fetchSeoMutation = useMutation({
    mutationFn: async (pagePath: string) => {
      const response = await apiRequest("GET", `/api/admin/page-seo?pagePath=${encodeURIComponent(pagePath)}`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        // Basic SEO
        setSeoTitle(data.title || "");
        setSeoDescription(data.description || "");
        setSeoKeywords(Array.isArray(data.keywords) ? data.keywords.join(", ") : "");
        
        // Focus Keyphrase
        setFocusKeyphrase(data.focusKeyphrase || "");
        setSecondaryKeyphrases(Array.isArray(data.secondaryKeyphrases) ? data.secondaryKeyphrases.join(", ") : "");
        
        // Featured Image
        setFeaturedImageUrl(data.featuredImageUrl || "");
        setFeaturedImageAlt(data.featuredImageAlt || "");
        
        // Open Graph
        setOgTitle(data.ogTitle || "");
        setOgDescription(data.ogDescription || "");
        setOgImageUrl(data.ogImageUrl || "");
        
        // Twitter
        setTwitterTitle(data.twitterTitle || "");
        setTwitterDescription(data.twitterDescription || "");
        setTwitterImageUrl(data.twitterImageUrl || "");
        setTwitterCardType(data.twitterCardType || "summary_large_image");
        
        // Optimization Mode
        setOptimizationMode(data.optimizationMode || "manual");
        
        // Score
        setSeoScore(data.seoScore || 0);
      }
    }
  });

  const saveSeoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/page-seo", {
        pagePath: location,
        pageType: "content",
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords.split(",").map(k => k.trim()).filter(Boolean),
        focusKeyphrase,
        secondaryKeyphrases: secondaryKeyphrases.split(",").map(k => k.trim()).filter(Boolean),
        featuredImageUrl,
        featuredImageAlt,
        ogTitle: ogTitle || seoTitle,
        ogDescription: ogDescription || seoDescription,
        ogImageUrl: ogImageUrl || featuredImageUrl,
        twitterTitle: twitterTitle || ogTitle || seoTitle,
        twitterDescription: twitterDescription || ogDescription || seoDescription,
        twitterImageUrl: twitterImageUrl || ogImageUrl || featuredImageUrl,
        twitterCardType,
        optimizationMode,
        seoScore,
        isManuallyEdited: true,
        faqs: [],
        features: [],
        reviews: []
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-seo"] });
      setSeoEditorOpen(false);
      toast({ 
        title: "SEO Updated", 
        description: "All SEO metadata saved successfully." 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Save Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const openSeoEditor = () => {
    setSeoEditorOpen(true);
    setSeoTab("basic");
    setSeoAuditStatus("idle");
    setSeoAuditResults(null);
    fetchSeoMutation.mutate(location);
  };

  const runQuickAudit = () => {
    setSeoAuditStatus("loading");
    
    setTimeout(() => {
      const issues: { type: "error" | "warning" | "success"; message: string }[] = [];
      let titleScore = 0;
      let descriptionScore = 0;
      let keyphraseScore = 0;
      let imageScore = 0;
      let socialScore = 0;

      // Title analysis (max 25 points)
      if (seoTitle.length === 0) {
        issues.push({ type: "error", message: "Title is empty - add an SEO title" });
        titleScore = 0;
      } else if (seoTitle.length < 30) {
        issues.push({ type: "warning", message: "Title is too short (under 30 chars) - aim for 50-60" });
        titleScore = 10;
      } else if (seoTitle.length > 60) {
        issues.push({ type: "warning", message: "Title is too long (over 60 chars) - may be truncated" });
        titleScore = 15;
      } else {
        titleScore = 20;
      }
      
      // Check if focus keyphrase is in title
      if (focusKeyphrase && seoTitle.toLowerCase().includes(focusKeyphrase.toLowerCase())) {
        issues.push({ type: "success", message: "Focus keyphrase found in title" });
        titleScore += 5;
      } else if (focusKeyphrase) {
        issues.push({ type: "error", message: "Focus keyphrase not in title - add it for better SEO" });
      }

      // Description analysis (max 25 points)
      if (seoDescription.length === 0) {
        issues.push({ type: "error", message: "Meta description is empty - add a description" });
        descriptionScore = 0;
      } else if (seoDescription.length < 100) {
        issues.push({ type: "warning", message: "Description too short (under 100 chars) - aim for 150-160" });
        descriptionScore = 10;
      } else if (seoDescription.length > 160) {
        issues.push({ type: "warning", message: "Description too long (over 160 chars) - may be truncated" });
        descriptionScore = 15;
      } else {
        descriptionScore = 20;
      }
      
      // Check if focus keyphrase is in description
      if (focusKeyphrase && seoDescription.toLowerCase().includes(focusKeyphrase.toLowerCase())) {
        issues.push({ type: "success", message: "Focus keyphrase found in description" });
        descriptionScore += 5;
      } else if (focusKeyphrase) {
        issues.push({ type: "warning", message: "Consider adding focus keyphrase to description" });
      }

      // Focus Keyphrase analysis (max 25 points)
      if (!focusKeyphrase) {
        issues.push({ type: "error", message: "No focus keyphrase set - this is essential for SEO" });
        keyphraseScore = 0;
      } else {
        keyphraseScore = 15;
        issues.push({ type: "success", message: `Focus keyphrase: "${focusKeyphrase}"` });
        
        const secondaryList = secondaryKeyphrases.split(",").map(k => k.trim()).filter(Boolean);
        if (secondaryList.length >= 2) {
          keyphraseScore += 10;
          issues.push({ type: "success", message: `${secondaryList.length} secondary keyphrases defined` });
        } else if (secondaryList.length > 0) {
          keyphraseScore += 5;
          issues.push({ type: "warning", message: "Add more secondary keyphrases (aim for 2-5)" });
        } else {
          issues.push({ type: "warning", message: "No secondary keyphrases - add 2-5 for better coverage" });
        }
      }

      // Featured Image analysis (max 15 points)
      if (!featuredImageUrl) {
        issues.push({ type: "warning", message: "No featured image - add one for better engagement" });
        imageScore = 0;
      } else {
        imageScore = 10;
        issues.push({ type: "success", message: "Featured image is set" });
        
        if (featuredImageAlt) {
          imageScore += 5;
          issues.push({ type: "success", message: "Image alt text is set" });
        } else {
          issues.push({ type: "error", message: "Missing image alt text - important for accessibility" });
        }
      }

      // Social Media analysis (max 10 points)
      if (ogTitle || ogDescription || ogImageUrl) {
        socialScore += 5;
        issues.push({ type: "success", message: "Open Graph tags configured" });
      } else {
        issues.push({ type: "warning", message: "Open Graph tags not set - will use defaults" });
      }
      
      if (twitterTitle || twitterDescription || twitterImageUrl) {
        socialScore += 5;
        issues.push({ type: "success", message: "Twitter Card configured" });
      } else {
        issues.push({ type: "warning", message: "Twitter Card not set - will use defaults" });
      }

      const overallScore = titleScore + descriptionScore + keyphraseScore + imageScore + socialScore;
      setSeoScore(overallScore);
      
      setSeoAuditResults({ 
        overallScore,
        titleScore, 
        descriptionScore, 
        keyphraseScore,
        imageScore,
        socialScore,
        issues 
      });
      setSeoAuditStatus("done");
    }, 300);
  };

  // AI-powered optimization
  const aiOptimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/page-seo/ai-optimize", {
        pagePath: location,
        focusKeyphrase,
        currentTitle: seoTitle,
        currentDescription: seoDescription
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.title) setSeoTitle(data.title);
      if (data.description) setSeoDescription(data.description);
      if (data.keywords) setSeoKeywords(data.keywords.join(", "));
      if (data.ogTitle) setOgTitle(data.ogTitle);
      if (data.ogDescription) setOgDescription(data.ogDescription);
      toast({ 
        title: "AI Optimization Complete", 
        description: "SEO fields have been optimized based on your focus keyphrase." 
      });
      runQuickAudit();
    },
    onError: (error: Error) => {
      toast({ 
        title: "AI Optimization Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getOverallGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-green-400" };
    if (score >= 80) return { grade: "A", color: "text-green-400" };
    if (score >= 70) return { grade: "B", color: "text-lime-400" };
    if (score >= 60) return { grade: "C", color: "text-amber-400" };
    return { grade: "Needs Work", color: "text-[#C8A661]" };
  };

  const getScoreIcon = (score: "good" | "warning" | "error") => {
    switch (score) {
      case "good": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "error": return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const editContext = getEditContext(location);

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 z-[9999] bg-[#1d2327] text-[#c3c4c7] h-8 flex items-center px-2 text-sm shadow-md"
        data-testid="admin-bar"
      >
        <div className="flex items-center gap-1 flex-1">
          {/* Dashboard */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
            onClick={() => setLocation('/admin')}
            data-testid="admin-bar-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          {/* Edit This - Context Aware */}
          {editContext && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
              onClick={() => setLocation(editContext.editUrl)}
              data-testid="admin-bar-edit"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden md:inline">{editContext.label}</span>
            </Button>
          )}

          {/* New Content Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                data-testid="admin-bar-new"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/add-listing')}
                data-testid="admin-bar-new-listing"
              >
                <MapPin className="w-4 h-4 mr-2" /> Listing
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/blog')}
                data-testid="admin-bar-new-blog"
              >
                <FileText className="w-4 h-4 mr-2" /> Blog Post
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/courses')}
                data-testid="admin-bar-new-course"
              >
                <BookOpen className="w-4 h-4 mr-2" /> Course
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/promo-codes')}
                data-testid="admin-bar-new-promo"
              >
                <Ticket className="w-4 h-4 mr-2" /> Promo Code
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/ads')}
                data-testid="admin-bar-new-ad"
              >
                <Megaphone className="w-4 h-4 mr-2" /> Advertisement
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#3c4043]" />
              <DropdownMenuLabel className="text-[#8c8f91] text-xs px-2">AI Powered</DropdownMenuLabel>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setQuickGenOpen(true)}
                data-testid="admin-bar-ai-generate"
              >
                <Sparkles className="w-4 h-4 mr-2 text-amber-400" /> Quick Generate Blog
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* SEO Editor Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
            onClick={openSeoEditor}
            data-testid="admin-bar-seo"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">SEO</span>
          </Button>

          {/* Manual Indexing Button - MANUAL SEO MODE */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/manual-index-priority', {
                  method: 'POST',
                  credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                  toast({
                    title: "IndexNow Submitted",
                    description: `${data.pages?.length || 7} priority pages sent to search engines`,
                  });
                } else {
                  toast({
                    title: "Indexing Failed",
                    description: data.error || "Could not submit pages",
                    variant: "destructive"
                  });
                }
              } catch (error) {
                toast({
                  title: "Indexing Error",
                  description: "Network error submitting pages",
                  variant: "destructive"
                });
              }
            }}
            data-testid="admin-bar-index-now"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Index Now</span>
          </Button>

          {/* Quick AI Generate Dialog */}
          <Dialog open={quickGenOpen} onOpenChange={setQuickGenOpen}>
            <DialogContent className="sm:max-w-md bg-[#1d2327] text-[#c3c4c7] border-[#3c4043]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI Blog Generator
                </DialogTitle>
                <DialogDescription>
                  Enter a topic and category to generate an SEO-optimized blog post.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm">Topic / Keyword</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Laundromat investment tips"
                    value={quickGenTopic}
                    onChange={(e) => setQuickGenTopic(e.target.value)}
                    className="bg-[#32373c] border-[#3c4043] text-white"
                    data-testid="input-quick-gen-topic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">Category</Label>
                  <Select value={quickGenCategory} onValueChange={setQuickGenCategory}>
                    <SelectTrigger className="bg-[#32373c] border-[#3c4043] text-white" data-testid="select-quick-gen-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d2327] border-[#3c4043]">
                      {BLOG_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-[#c3c4c7] hover:text-white focus:text-white focus:bg-[#32373c]">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setQuickGenOpen(false)}
                  className="text-[#c3c4c7]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => quickGenerateMutation.mutate()}
                  disabled={!quickGenTopic || quickGenerateMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                  data-testid="button-quick-generate"
                >
                  {quickGenerateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Blog
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Enhanced SEO Editor Dialog */}
          <Dialog open={seoEditorOpen} onOpenChange={setSeoEditorOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] bg-[#1d2327] text-[#c3c4c7] border-[#3c4043]">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Page SEO Editor
                  </div>
                  {seoAuditResults && (
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getOverallGrade(seoAuditResults.overallScore).color}`}>
                        {getOverallGrade(seoAuditResults.overallScore).grade}
                      </span>
                      <span className="text-sm text-[#8c8f91]">{seoAuditResults.overallScore}/100</span>
                    </div>
                  )}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex items-center justify-between text-sm text-[#8c8f91]">
                    <span>Comprehensive SEO editor with focus keyphrase optimization</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Mode:</span>
                      <Select value={optimizationMode} onValueChange={(v: "auto" | "manual" | "hybrid") => setOptimizationMode(v)}>
                        <SelectTrigger className="h-6 w-24 bg-[#32373c] border-[#3c4043] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1d2327] border-[#3c4043]">
                          <SelectItem value="manual" className="text-[#c3c4c7] text-xs">Manual</SelectItem>
                          <SelectItem value="hybrid" className="text-[#c3c4c7] text-xs">Hybrid</SelectItem>
                          <SelectItem value="auto" className="text-[#c3c4c7] text-xs">Auto AI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex items-center gap-2 text-xs text-[#8c8f91] bg-[#32373c] px-3 py-2 rounded">
                <MapPin className="w-3 h-3" />
                <span className="font-mono flex-1 truncate">{location}</span>
                {optimizationMode !== "manual" && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2 text-amber-400 hover:text-amber-300"
                    onClick={() => aiOptimizeMutation.mutate()}
                    disabled={aiOptimizeMutation.isPending || !focusKeyphrase}
                  >
                    {aiOptimizeMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    AI Optimize
                  </Button>
                )}
              </div>

              <ScrollArea className="max-h-[50vh]">
                <Tabs value={seoTab} onValueChange={setSeoTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 bg-[#32373c]">
                    <TabsTrigger value="basic" className="text-xs data-[state=active]:bg-[#1d2327]" data-testid="tab-seo-basic">
                      <Target className="w-3 h-3 mr-1" />
                      Basic
                    </TabsTrigger>
                    <TabsTrigger value="image" className="text-xs data-[state=active]:bg-[#1d2327]" data-testid="tab-seo-image">
                      <Image className="w-3 h-3 mr-1" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="social" className="text-xs data-[state=active]:bg-[#1d2327]" data-testid="tab-seo-social">
                      <Share2 className="w-3 h-3 mr-1" />
                      Social
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="text-xs data-[state=active]:bg-[#1d2327]" data-testid="tab-seo-audit">
                      <Eye className="w-3 h-3 mr-1" />
                      Audit
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic SEO Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="p-3 bg-[#0f1215] rounded-lg border border-[#3c4043]">
                      <Label className="text-sm text-amber-400 flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4" />
                        Focus Keyphrase
                      </Label>
                      <Input
                        placeholder="e.g., laundromat equipment quotes"
                        value={focusKeyphrase}
                        onChange={(e) => setFocusKeyphrase(e.target.value)}
                        className="bg-[#32373c] border-[#3c4043] text-white mb-2"
                        data-testid="input-focus-keyphrase"
                      />
                      <Input
                        placeholder="Secondary keyphrases (comma-separated)"
                        value={secondaryKeyphrases}
                        onChange={(e) => setSecondaryKeyphrases(e.target.value)}
                        className="bg-[#32373c] border-[#3c4043] text-white text-xs"
                        data-testid="input-secondary-keyphrases"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">SEO Title</Label>
                        <span className={`text-xs ${seoTitle.length >= 50 && seoTitle.length <= 60 ? 'text-green-400' : seoTitle.length > 60 ? 'text-red-400' : 'text-amber-400'}`}>
                          {seoTitle.length}/60
                        </span>
                      </div>
                      <Input
                        placeholder="Page title for search engines"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="bg-[#32373c] border-[#3c4043] text-white"
                        data-testid="input-seo-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Meta Description</Label>
                        <span className={`text-xs ${seoDescription.length >= 150 && seoDescription.length <= 160 ? 'text-green-400' : seoDescription.length > 160 ? 'text-red-400' : 'text-amber-400'}`}>
                          {seoDescription.length}/160
                        </span>
                      </div>
                      <Textarea
                        placeholder="Brief description for search results"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className="bg-[#32373c] border-[#3c4043] text-white resize-none"
                        rows={3}
                        data-testid="input-seo-description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Keywords</Label>
                      <Input
                        placeholder="keyword1, keyword2, keyword3"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className="bg-[#32373c] border-[#3c4043] text-white"
                        data-testid="input-seo-keywords"
                      />
                    </div>

                    <div className="border border-[#3c4043] rounded-lg p-3 bg-[#0f1215]">
                      <p className="text-xs text-[#8c8f91] mb-2">Google Preview</p>
                      <div className="space-y-1">
                        <p className="text-blue-400 text-sm truncate">{seoTitle || "Page Title"}</p>
                        <p className="text-xs text-green-400">washbizhub.com{location}</p>
                        <p className="text-xs text-[#9aa0a6] line-clamp-2">{seoDescription || "Meta description..."}</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Image Tab */}
                  <TabsContent value="image" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Featured Image
                      </Label>
                      
                      <div 
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          imageUploading ? 'border-amber-500 bg-amber-500/10' : 'border-[#3c4043] hover:border-amber-500 hover:bg-[#32373c]'
                        }`}
                        onClick={() => !imageUploading && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={handleImageDrop}
                        data-testid="dropzone-featured-image"
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                        {imageUploading ? (
                          <div className="flex flex-col items-center gap-2 py-4">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                            <p className="text-sm text-amber-400">Uploading image...</p>
                          </div>
                        ) : featuredImageUrl ? (
                          <div className="relative">
                            <img 
                              src={featuredImageUrl} 
                              alt={featuredImageAlt || "Preview"} 
                              className="w-full h-32 object-cover rounded"
                              onError={(e) => (e.currentTarget.src = '')}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <p className="text-white text-sm">Click or drop to replace</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 py-4">
                            <Upload className="w-8 h-8 text-[#8c8f91]" />
                            <p className="text-sm text-[#8c8f91]">Drop image here or click to upload</p>
                            <p className="text-xs text-[#6b7280]">Recommended: 1200x630px for social sharing</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Or paste image URL"
                          value={featuredImageUrl}
                          onChange={(e) => setFeaturedImageUrl(e.target.value)}
                          className="bg-[#32373c] border-[#3c4043] text-white flex-1"
                          data-testid="input-featured-image-url"
                        />
                        {featuredImageUrl && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => { setFeaturedImageUrl(''); setFeaturedImageAlt(''); }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Image Alt Text</Label>
                      <Input
                        placeholder="Descriptive alt text for accessibility"
                        value={featuredImageAlt}
                        onChange={(e) => setFeaturedImageAlt(e.target.value)}
                        className="bg-[#32373c] border-[#3c4043] text-white"
                        data-testid="input-featured-image-alt"
                      />
                      {focusKeyphrase && !featuredImageAlt.toLowerCase().includes(focusKeyphrase.toLowerCase()) && (
                        <p className="text-xs text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Consider including focus keyphrase in alt text
                        </p>
                      )}
                      {focusKeyphrase && featuredImageAlt.toLowerCase().includes(focusKeyphrase.toLowerCase()) && (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Focus keyphrase found in alt text
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Social Tab */}
                  <TabsContent value="social" className="space-y-4 mt-4">
                    <div className="p-3 bg-[#0f1215] rounded-lg border border-[#3c4043]">
                      <p className="text-sm text-blue-400 flex items-center gap-2 mb-3">
                        <Share2 className="w-4 h-4" />
                        Open Graph (Facebook, LinkedIn)
                      </p>
                      <div className="space-y-3">
                        <Input
                          placeholder="OG Title (defaults to SEO title)"
                          value={ogTitle}
                          onChange={(e) => setOgTitle(e.target.value)}
                          className="bg-[#32373c] border-[#3c4043] text-white text-xs"
                        />
                        <Textarea
                          placeholder="OG Description (defaults to meta description)"
                          value={ogDescription}
                          onChange={(e) => setOgDescription(e.target.value)}
                          className="bg-[#32373c] border-[#3c4043] text-white resize-none text-xs"
                          rows={2}
                        />
                        <Input
                          placeholder="OG Image URL (1200x630 recommended)"
                          value={ogImageUrl}
                          onChange={(e) => setOgImageUrl(e.target.value)}
                          className="bg-[#32373c] border-[#3c4043] text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-[#0f1215] rounded-lg border border-[#3c4043]">
                      <p className="text-sm text-sky-400 flex items-center gap-2 mb-3">
                        <Twitter className="w-4 h-4" />
                        Twitter Card
                      </p>
                      <div className="space-y-3">
                        <Select value={twitterCardType} onValueChange={setTwitterCardType}>
                          <SelectTrigger className="bg-[#32373c] border-[#3c4043] text-xs">
                            <SelectValue placeholder="Card Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1d2327] border-[#3c4043]">
                            <SelectItem value="summary_large_image" className="text-[#c3c4c7] text-xs">Large Image</SelectItem>
                            <SelectItem value="summary" className="text-[#c3c4c7] text-xs">Summary</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Twitter Title (defaults to OG title)"
                          value={twitterTitle}
                          onChange={(e) => setTwitterTitle(e.target.value)}
                          className="bg-[#32373c] border-[#3c4043] text-white text-xs"
                        />
                        <Textarea
                          placeholder="Twitter Description"
                          value={twitterDescription}
                          onChange={(e) => setTwitterDescription(e.target.value)}
                          className="bg-[#32373c] border-[#3c4043] text-white resize-none text-xs"
                          rows={2}
                        />
                        <Input
                          placeholder="Twitter Image URL"
                          value={twitterImageUrl}
                          onChange={(e) => setTwitterImageUrl(e.target.value)}
                          className="bg-[#32373c] border-[#3c4043] text-white text-xs"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Audit Tab */}
                  <TabsContent value="audit" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={runQuickAudit}
                        disabled={seoAuditStatus === "loading"}
                        className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                        data-testid="button-run-audit"
                      >
                        {seoAuditStatus === "loading" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        Run SEO Audit
                      </Button>
                      {seoAuditResults && (
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getOverallGrade(seoAuditResults.overallScore).color}`}>
                            {seoAuditResults.overallScore}
                            <span className="text-sm text-[#8c8f91]">/100</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {seoAuditResults && (
                      <>
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center p-2 bg-[#0f1215] rounded">
                            <div className={`text-lg font-bold ${getScoreColor(seoAuditResults.titleScore, 25)}`}>
                              {seoAuditResults.titleScore}
                            </div>
                            <div className="text-xs text-[#8c8f91]">Title</div>
                          </div>
                          <div className="text-center p-2 bg-[#0f1215] rounded">
                            <div className={`text-lg font-bold ${getScoreColor(seoAuditResults.descriptionScore, 25)}`}>
                              {seoAuditResults.descriptionScore}
                            </div>
                            <div className="text-xs text-[#8c8f91]">Desc</div>
                          </div>
                          <div className="text-center p-2 bg-[#0f1215] rounded">
                            <div className={`text-lg font-bold ${getScoreColor(seoAuditResults.keyphraseScore, 25)}`}>
                              {seoAuditResults.keyphraseScore}
                            </div>
                            <div className="text-xs text-[#8c8f91]">Key</div>
                          </div>
                          <div className="text-center p-2 bg-[#0f1215] rounded">
                            <div className={`text-lg font-bold ${getScoreColor(seoAuditResults.imageScore, 15)}`}>
                              {seoAuditResults.imageScore}
                            </div>
                            <div className="text-xs text-[#8c8f91]">Image</div>
                          </div>
                          <div className="text-center p-2 bg-[#0f1215] rounded">
                            <div className={`text-lg font-bold ${getScoreColor(seoAuditResults.socialScore, 10)}`}>
                              {seoAuditResults.socialScore}
                            </div>
                            <div className="text-xs text-[#8c8f91]">Social</div>
                          </div>
                        </div>

                        <div className="border border-[#3c4043] rounded-lg p-3 bg-[#0f1215] max-h-48 overflow-y-auto">
                          <p className="text-xs text-[#8c8f91] mb-2">Audit Results</p>
                          <ul className="space-y-1">
                            {seoAuditResults.issues.map((issue, idx) => (
                              <li key={idx} className="text-xs text-[#c3c4c7] flex items-start gap-2">
                                <span className="mt-0.5 flex-shrink-0">
                                  {issue.type === "success" ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                  ) : issue.type === "error" ? (
                                    <AlertCircle className="w-3 h-3 text-red-400" />
                                  ) : (
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  )}
                                </span>
                                {issue.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {!seoAuditResults && (
                      <div className="text-center py-8 text-[#8c8f91]">
                        <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Run an audit to see detailed SEO analysis</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              <DialogFooter className="flex gap-2 sm:gap-2 border-t border-[#3c4043] pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setSeoEditorOpen(false)}
                  className="text-[#c3c4c7]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => saveSeoMutation.mutate()}
                  disabled={saveSeoMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  data-testid="button-seo-save"
                >
                  {saveSeoMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save All SEO"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Desktop Quick Links */}
          <div className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                  data-testid="admin-bar-content-menu"
                >
                  <Package className="w-4 h-4" />
                  Content
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/blog')}
                  data-testid="admin-bar-content-blog"
                >
                  <FileText className="w-4 h-4 mr-2" /> Blog Posts
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/courses')}
                  data-testid="admin-bar-content-courses"
                >
                  <BookOpen className="w-4 h-4 mr-2" /> Courses
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/resources')}
                  data-testid="admin-bar-content-resources"
                >
                  <Package className="w-4 h-4 mr-2" /> Resources
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/forum')}
                  data-testid="admin-bar-content-forum"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Forum
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                  data-testid="admin-bar-listings-menu"
                >
                  <Store className="w-4 h-4" />
                  Listings
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/laundromat-listings')}
                  data-testid="admin-bar-listings-all"
                >
                  <MapPin className="w-4 h-4 mr-2" /> All Listings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/add-listing')}
                  data-testid="admin-bar-listings-add"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add New
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/marketplace')}
                  data-testid="admin-bar-listings-vendors"
                >
                  <Store className="w-4 h-4 mr-2" /> Vendors
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                  data-testid="admin-bar-marketing-menu"
                >
                  <Megaphone className="w-4 h-4" />
                  Marketing
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/ads')}
                  data-testid="admin-bar-marketing-ads"
                >
                  <Megaphone className="w-4 h-4 mr-2" /> Ads
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/promo-codes')}
                  data-testid="admin-bar-marketing-promos"
                >
                  <Ticket className="w-4 h-4 mr-2" /> Promo Codes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/newsletter')}
                  data-testid="admin-bar-marketing-newsletter"
                >
                  <Mail className="w-4 h-4 mr-2" /> Newsletter
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                  onClick={() => setLocation('/admin/indexing')}
                  data-testid="admin-bar-marketing-seo"
                >
                  <Search className="w-4 h-4 mr-2" /> SEO/Indexing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
              onClick={() => setLocation('/admin/users')}
              data-testid="admin-bar-users"
            >
              <Users className="w-4 h-4" />
              Users
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
              onClick={() => setLocation('/admin/analytics')}
              data-testid="admin-bar-analytics"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
            onClick={() => setLocation('/')}
            data-testid="admin-bar-view-site"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">View Site</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] gap-1"
                data-testid="admin-bar-user-menu"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline max-w-24 truncate" data-testid="admin-bar-username">
                  {user?.firstName || user?.email?.split('@')[0] || 'Admin'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1d2327] border-[#3c4043] text-[#c3c4c7]">
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/settings')}
                data-testid="admin-bar-user-profile"
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer"
                onClick={() => setLocation('/admin/settings')}
                data-testid="admin-bar-user-settings"
              >
                <Settings className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#3c4043]" />
              <DropdownMenuItem 
                onClick={logout}
                className="hover:bg-[#32373c] hover:text-white focus:bg-[#32373c] focus:text-white cursor-pointer text-red-400"
                data-testid="admin-bar-logout"
              >
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="admin-bar-mobile-toggle"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed top-8 left-0 right-0 z-[9998] bg-[#1d2327] border-b border-[#3c4043] p-2 lg:hidden"
          data-testid="admin-bar-mobile-menu"
        >
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => { setLocation('/admin/blog'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-blog"
            >
              <FileText className="w-4 h-4" /> Blog
            </button>
            <button
              onClick={() => { setLocation('/admin/courses'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-courses"
            >
              <BookOpen className="w-4 h-4" /> Courses
            </button>
            <button
              onClick={() => { setLocation('/laundromat-listings'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-listings"
            >
              <MapPin className="w-4 h-4" /> Listings
            </button>
            <button
              onClick={() => { setLocation('/admin/marketplace'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-vendors"
            >
              <Store className="w-4 h-4" /> Vendors
            </button>
            <button
              onClick={() => { setLocation('/admin/ads'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-ads"
            >
              <Megaphone className="w-4 h-4" /> Ads
            </button>
            <button
              onClick={() => { setLocation('/admin/promo-codes'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-promos"
            >
              <Ticket className="w-4 h-4" /> Promos
            </button>
            <button
              onClick={() => { setLocation('/admin/users'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-users"
            >
              <Users className="w-4 h-4" /> Users
            </button>
            <button
              onClick={() => { setLocation('/admin/analytics'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 text-[#c3c4c7] hover:text-white hover:bg-[#32373c] rounded text-left"
              data-testid="admin-bar-mobile-analytics"
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </button>
          </div>
        </div>
      )}

      {/* Spacer to push content down when admin bar is visible */}
      <div className="h-8" data-testid="admin-bar-spacer" />
    </>
  );
}
