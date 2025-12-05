import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
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
  AlertTriangle
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
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoAuditStatus, setSeoAuditStatus] = useState<"idle" | "loading" | "done">("idle");
  const [seoAuditResults, setSeoAuditResults] = useState<{
    titleScore: "good" | "warning" | "error";
    descriptionScore: "good" | "warning" | "error";
    keywordsScore: "good" | "warning" | "error";
    issues: string[];
  } | null>(null);
  const { toast } = useToast();

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
        setSeoTitle(data.title || "");
        setSeoDescription(data.description || "");
        setSeoKeywords(Array.isArray(data.keywords) ? data.keywords.join(", ") : "");
      }
    }
  });

  const saveSeoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/page-seo", {
        pagePath: location,
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords.split(",").map(k => k.trim()).filter(Boolean)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-seo"] });
      setSeoEditorOpen(false);
      toast({ 
        title: "SEO Updated", 
        description: "Page SEO metadata saved successfully." 
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
    setSeoAuditStatus("idle");
    setSeoAuditResults(null);
    fetchSeoMutation.mutate(location);
  };

  const runQuickAudit = () => {
    setSeoAuditStatus("loading");
    
    setTimeout(() => {
      const issues: string[] = [];
      let titleScore: "good" | "warning" | "error" = "good";
      let descriptionScore: "good" | "warning" | "error" = "good";
      let keywordsScore: "good" | "warning" | "error" = "good";

      if (seoTitle.length === 0) {
        titleScore = "error";
        issues.push("Title is empty - add an SEO title");
      } else if (seoTitle.length < 30) {
        titleScore = "warning";
        issues.push("Title is too short (under 30 chars) - aim for 50-60");
      } else if (seoTitle.length > 60) {
        titleScore = "warning";
        issues.push("Title is too long (over 60 chars) - may be truncated");
      }

      if (seoDescription.length === 0) {
        descriptionScore = "error";
        issues.push("Meta description is empty - add a description");
      } else if (seoDescription.length < 100) {
        descriptionScore = "warning";
        issues.push("Description is too short (under 100 chars) - aim for 150-160");
      } else if (seoDescription.length > 160) {
        descriptionScore = "warning";
        issues.push("Description is too long (over 160 chars) - may be truncated");
      }

      const keywordsArray = seoKeywords.split(",").map(k => k.trim()).filter(Boolean);
      if (keywordsArray.length === 0) {
        keywordsScore = "error";
        issues.push("No keywords defined - add 3-5 relevant keywords");
      } else if (keywordsArray.length < 3) {
        keywordsScore = "warning";
        issues.push("Few keywords (under 3) - consider adding more");
      } else if (keywordsArray.length > 10) {
        keywordsScore = "warning";
        issues.push("Too many keywords (over 10) - focus on most relevant");
      }

      if (issues.length === 0) {
        issues.push("All SEO fields look good!");
      }

      setSeoAuditResults({ titleScore, descriptionScore, keywordsScore, issues });
      setSeoAuditStatus("done");
    }, 500);
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

          {/* SEO Editor Dialog */}
          <Dialog open={seoEditorOpen} onOpenChange={setSeoEditorOpen}>
            <DialogContent className="sm:max-w-lg bg-[#1d2327] text-[#c3c4c7] border-[#3c4043]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Page SEO Editor
                </DialogTitle>
                <DialogDescription>
                  Edit SEO metadata for the current page. Changes will be applied immediately.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 text-xs text-[#8c8f91] bg-[#32373c] px-3 py-2 rounded">
                  <MapPin className="w-3 h-3" />
                  <span className="font-mono">{location}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-title" className="text-sm flex items-center gap-2">
                      SEO Title
                      {seoAuditResults && getScoreIcon(seoAuditResults.titleScore)}
                    </Label>
                    <span className={`text-xs ${seoTitle.length >= 50 && seoTitle.length <= 60 ? 'text-green-400' : seoTitle.length > 60 ? 'text-red-400' : 'text-amber-400'}`}>
                      {seoTitle.length}/60
                    </span>
                  </div>
                  <Input
                    id="seo-title"
                    placeholder="Page title for search engines (50-60 chars ideal)"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="bg-[#32373c] border-[#3c4043] text-white"
                    data-testid="input-seo-title"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-description" className="text-sm flex items-center gap-2">
                      Meta Description
                      {seoAuditResults && getScoreIcon(seoAuditResults.descriptionScore)}
                    </Label>
                    <span className={`text-xs ${seoDescription.length >= 150 && seoDescription.length <= 160 ? 'text-green-400' : seoDescription.length > 160 ? 'text-red-400' : 'text-amber-400'}`}>
                      {seoDescription.length}/160
                    </span>
                  </div>
                  <Textarea
                    id="seo-description"
                    placeholder="Brief description for search results (150-160 chars ideal)"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="bg-[#32373c] border-[#3c4043] text-white resize-none"
                    rows={3}
                    data-testid="input-seo-description"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="seo-keywords" className="text-sm flex items-center gap-2">
                      Keywords
                      {seoAuditResults && getScoreIcon(seoAuditResults.keywordsScore)}
                    </Label>
                  </div>
                  <Input
                    id="seo-keywords"
                    placeholder="keyword1, keyword2, keyword3 (comma-separated)"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="bg-[#32373c] border-[#3c4043] text-white"
                    data-testid="input-seo-keywords"
                  />
                  <p className="text-xs text-[#8c8f91]">
                    {seoKeywords.split(",").map(k => k.trim()).filter(Boolean).length} keywords defined
                  </p>
                </div>

                <div className="border border-[#3c4043] rounded-lg p-3 bg-[#0f1215]">
                  <p className="text-xs text-[#8c8f91] mb-2">Google Preview</p>
                  <div className="space-y-1">
                    <p className="text-blue-400 text-sm truncate hover:underline cursor-pointer">
                      {seoTitle || "Page Title Will Appear Here"}
                    </p>
                    <p className="text-xs text-green-400 truncate">
                      washbizhub.com{location}
                    </p>
                    <p className="text-xs text-[#9aa0a6] line-clamp-2">
                      {seoDescription || "Your meta description will appear here. Make it compelling and include your target keywords."}
                    </p>
                  </div>
                </div>

                {seoAuditResults && (
                  <div className="border border-[#3c4043] rounded-lg p-3 bg-[#0f1215]">
                    <p className="text-xs text-[#8c8f91] mb-2">Quick Audit Results</p>
                    <ul className="space-y-1">
                      {seoAuditResults.issues.map((issue, idx) => (
                        <li key={idx} className="text-xs text-[#c3c4c7] flex items-start gap-2">
                          <span className="mt-0.5">
                            {issue.includes("look good") ? (
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                            ) : issue.includes("empty") || issue.includes("No keywords") ? (
                              <AlertCircle className="w-3 h-3 text-red-400" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                            )}
                          </span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button
                  variant="ghost"
                  onClick={runQuickAudit}
                  disabled={seoAuditStatus === "loading"}
                  className="text-[#c3c4c7] gap-2"
                  data-testid="button-seo-audit"
                >
                  {seoAuditStatus === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Quick Audit
                </Button>
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
                    "Save SEO"
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
