import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import {
  Crown,
  FileText,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  Sparkles,
  Wand2,
  CheckCircle,
  Clock,
  Send,
  BarChart3,
  ExternalLink,
  Copy,
  Settings,
  Loader2,
  Lock,
  Unlock,
  Star,
  Zap,
  Target,
  PenTool,
  Image,
  Video,
  Mic,
  Download,
  Share2,
  Calendar
} from "lucide-react";
import larryPhoto from "@assets/image_1765341641648.png";

const CONTENT_TYPES = [
  { id: "blog", name: "Blog Post", icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", description: "SEO-optimized articles" },
  { id: "course", name: "Course", icon: GraduationCap, color: "text-purple-500", bgColor: "bg-purple-500/10", description: "Video lessons & modules" },
  { id: "book", name: "Book", icon: BookOpen, color: "text-amber-500", bgColor: "bg-amber-500/10", description: "Illustrated or text books" },
  { id: "document", name: "Document", icon: FileSpreadsheet, color: "text-green-500", bgColor: "bg-green-500/10", description: "PDFs, sheets, guides" },
  { id: "product", name: "Product", icon: Package, color: "text-rose-500", bgColor: "bg-rose-500/10", description: "Templates, tools, downloads" },
];

const MONETIZATION_OPTIONS = [
  { id: "free", name: "Free", icon: Unlock, description: "Available to everyone" },
  { id: "preview", name: "Free Preview", icon: Eye, description: "Preview free, full content paid" },
  { id: "paid", name: "One-Time Purchase", icon: DollarSign, description: "Single payment to access" },
  { id: "subscription", name: "Subscription Only", icon: Crown, description: "Requires active subscription" },
];

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: "draft" | "review" | "published";
  monetization: string;
  price?: number;
  views: number;
  revenue: number;
  seoScore?: number;
  lastEdited: string;
  publishedAt?: string;
}

const mockContent: ContentItem[] = [
  { id: "1", title: "The Ultimate Guide to Laundromat Due Diligence", type: "blog", status: "published", monetization: "preview", price: 29, views: 2847, revenue: 1247, seoScore: 94, lastEdited: "2024-01-15", publishedAt: "2024-01-10" },
  { id: "2", title: "Laundromat 101: From Zero to Owner", type: "course", status: "published", monetization: "paid", price: 299, views: 523, revenue: 8970, seoScore: 88, lastEdited: "2024-01-12", publishedAt: "2024-01-01" },
  { id: "3", title: "Larry's Lease Red Flag Checklist", type: "document", status: "published", monetization: "subscription", views: 1892, revenue: 0, lastEdited: "2024-01-08", publishedAt: "2023-12-20" },
  { id: "4", title: "The Little Washer That Could", type: "book", status: "draft", monetization: "paid", price: 14.99, views: 0, revenue: 0, lastEdited: "2024-01-18" },
  { id: "5", title: "Equipment ROI Calculator Pro", type: "product", status: "review", monetization: "paid", price: 49, views: 0, revenue: 0, seoScore: 76, lastEdited: "2024-01-17" },
];

export default function LarrysCommandCenter() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPolishOpen, setIsPolishOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [newContent, setNewContent] = useState({ title: "", type: "blog", description: "" });
  const [polishText, setPolishText] = useState("");
  const [polishedResult, setPolishedResult] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);

  const totalRevenue = mockContent.reduce((sum, c) => sum + c.revenue, 0);
  const totalViews = mockContent.reduce((sum, c) => sum + c.views, 0);
  const publishedCount = mockContent.filter(c => c.status === "published").length;
  const avgSeoScore = Math.round(mockContent.filter(c => c.seoScore).reduce((sum, c) => sum + (c.seoScore || 0), 0) / mockContent.filter(c => c.seoScore).length);

  const filteredContent = mockContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === "all" || item.type === activeTab;
    return matchesSearch && matchesType;
  });

  const handlePolish = async () => {
    if (!polishText.trim()) return;
    setIsPolishing(true);
    try {
      const response = await apiRequest("/api/ai/polish-content", {
        method: "POST",
        body: JSON.stringify({ content: polishText, type: "professional" }),
      });
      setPolishedResult(response.polished || "Polished content would appear here...");
      toast({ title: "Content Polished!", description: "AI has improved your content for professional quality." });
    } catch (error) {
      setPolishedResult(`**Polished Version:**\n\n${polishText.replace(/\b(i|im|i'm)\b/gi, "I").replace(/\s{2,}/g, " ").trim()}\n\n*[AI would enhance grammar, readability, and professional tone]*`);
    } finally {
      setIsPolishing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Published</Badge>;
      case "review": return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">In Review</Badge>;
      default: return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Draft</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    const config = CONTENT_TYPES.find(t => t.id === type);
    if (!config) return FileText;
    return config.icon;
  };

  const getTypeColor = (type: string) => {
    const config = CONTENT_TYPES.find(t => t.id === type);
    return config?.color || "text-gray-500";
  };

  const getContentLink = (item: ContentItem) => {
    switch (item.type) {
      case "blog": return "/admin/blog";
      case "course": return "/larrys-academy";
      case "book": return "/book-studio";
      case "document": return "/vault";
      case "product": return "/templates";
      default: return "#";
    }
  };

  return (
    <AuthGuard>
      <SEO
        title="Larry's Content Command Center | WashBizHub"
        description="Create, polish, and monetize premium content. Larry's unified dashboard for blogs, courses, books, and digital products."
        canonicalUrl="/larrys-command-center"
      />
      <div className="min-h-screen bg-background" data-testid="page-larrys-command-center">
        <div className="border-b bg-gradient-to-r from-[#0A1628] to-[#1a2d4a]">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={larryPhoto} alt="Larry Larsen" className="w-16 h-16 rounded-full border-2 border-[#C8A661]" />
                <div className="absolute -bottom-1 -right-1 bg-[#C8A661] rounded-full p-1">
                  <Crown className="w-3 h-3 text-[#0A1628]" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Larry's Content Command Center
                  <Badge className="bg-[#C8A661] text-[#0A1628]">Creator Suite</Badge>
                </h1>
                <p className="text-gray-300 text-sm">Create premium content. AI makes it flawless.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsPolishOpen(true)} className="border-[#C8A661] text-[#C8A661] hover:bg-[#C8A661]/10" data-testid="button-ai-polish">
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Polish
                </Button>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-create-content">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-full">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold text-purple-600">{publishedCount} items</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Send className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg SEO Score</p>
                    <p className="text-2xl font-bold text-amber-600">{avgSeoScore}/100</p>
                  </div>
                  <div className="p-3 bg-amber-500/20 rounded-full">
                    <Target className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C8A661]" />
                  Content Library
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search content..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                      data-testid="input-search-content"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  {CONTENT_TYPES.map(type => (
                    <TabsTrigger key={type.id} value={type.id} data-testid={`tab-${type.id}`}>
                      <type.icon className={`w-4 h-4 mr-1 ${type.color}`} />
                      {type.name}s
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="space-y-3">
                  {filteredContent.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No content found</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Content
                      </Button>
                    </div>
                  ) : (
                    filteredContent.map(item => {
                      const TypeIcon = getTypeIcon(item.type);
                      return (
                        <Card key={item.id} className="hover:border-[#C8A661]/50 transition-colors" data-testid={`card-content-${item.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${CONTENT_TYPES.find(t => t.id === item.type)?.bgColor}`}>
                                <TypeIcon className={`w-5 h-5 ${getTypeColor(item.type)}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium truncate">{item.title}</h3>
                                  {getStatusBadge(item.status)}
                                  {item.monetization === "paid" && item.price && (
                                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                                      ${item.price}
                                    </Badge>
                                  )}
                                  {item.monetization === "subscription" && (
                                    <Badge variant="outline" className="text-purple-600 border-purple-500/30">
                                      <Crown className="w-3 h-3 mr-1" />
                                      Pro
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {item.views.toLocaleString()} views
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    ${item.revenue.toLocaleString()}
                                  </span>
                                  {item.seoScore && (
                                    <span className="flex items-center gap-1">
                                      <Target className="w-3 h-3" />
                                      SEO: {item.seoScore}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.lastEdited}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" asChild data-testid={`button-edit-${item.id}`}>
                                  <Link href={getContentLink(item)}>
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Link>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" data-testid={`button-more-${item.id}`}>
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Wand2 className="w-4 h-4 mr-2" />
                                      AI Polish
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Target className="w-4 h-4 mr-2" />
                                      SEO Analysis
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <DollarSign className="w-4 h-4 mr-2" />
                                      Monetization
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C8A661]" />
                  AI-Powered Tools
                </CardTitle>
                <CardDescription>Let AI make your content flawless and professional</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto py-3" onClick={() => setIsPolishOpen(true)} data-testid="button-polish-tool">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Wand2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Content Polisher</p>
                      <p className="text-sm text-muted-foreground">Grammar, readability, professional tone</p>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3" data-testid="button-seo-tool">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Target className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">SEO/AEO Optimizer</p>
                      <p className="text-sm text-muted-foreground">Keywords, meta tags, search optimization</p>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3" data-testid="button-image-tool">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Image className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Image Generator</p>
                      <p className="text-sm text-muted-foreground">Professional images for any content</p>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3" data-testid="button-format-tool">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <PenTool className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Format & Structure</p>
                      <p className="text-sm text-muted-foreground">Headers, bullets, professional layout</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#C8A661]" />
                  Quick Create
                </CardTitle>
                <CardDescription>Jump directly into creating content</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {CONTENT_TYPES.map(type => (
                  <Button key={type.id} variant="outline" className="h-auto py-4 flex-col gap-2" asChild data-testid={`button-quick-create-${type.id}`}>
                    <Link href={getContentLink({ id: "", title: "", type: type.id, status: "draft", monetization: "free", views: 0, revenue: 0, lastEdited: "" })}>
                      <div className={`p-2 rounded-lg ${type.bgColor}`}>
                        <type.icon className={`w-5 h-5 ${type.color}`} />
                      </div>
                      <span className="text-sm font-medium">{type.name}</span>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C8A661]" />
                Create New Content
              </DialogTitle>
              <DialogDescription>Choose what type of content you want to create</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_TYPES.map(type => (
                    <Button
                      key={type.id}
                      variant={newContent.type === type.id ? "default" : "outline"}
                      className={`h-auto py-3 flex-col gap-1 ${newContent.type === type.id ? "bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" : ""}`}
                      onClick={() => setNewContent({ ...newContent, type: type.id })}
                      data-testid={`button-select-type-${type.id}`}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-xs">{type.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter content title..."
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  data-testid="input-new-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description..."
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  data-testid="input-new-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button 
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                disabled={!newContent.title}
                asChild
                data-testid="button-start-creating"
              >
                <Link href={getContentLink({ id: "", title: "", type: newContent.type, status: "draft", monetization: "free", views: 0, revenue: 0, lastEdited: "" })}>
                  Start Creating
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPolishOpen} onOpenChange={setIsPolishOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500" />
                AI Content Polisher
              </DialogTitle>
              <DialogDescription>Paste your content and let AI make it flawless and professional</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Your Content</Label>
                <Textarea
                  placeholder="Paste your content here..."
                  value={polishText}
                  onChange={(e) => setPolishText(e.target.value)}
                  className="min-h-[300px] resize-none"
                  data-testid="textarea-polish-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Polished Result
                  {polishedResult && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6"
                      onClick={() => {
                        navigator.clipboard.writeText(polishedResult);
                        toast({ title: "Copied!", description: "Polished content copied to clipboard." });
                      }}
                      data-testid="button-copy-polished"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </Label>
                <div className="min-h-[300px] p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap overflow-auto">
                  {isPolishing ? (
                    <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Polishing your content...
                    </div>
                  ) : polishedResult ? (
                    polishedResult
                  ) : (
                    <span className="text-muted-foreground">Polished content will appear here...</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPolishOpen(false)}>Close</Button>
              <Button 
                onClick={handlePolish}
                disabled={!polishText.trim() || isPolishing}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-polish-now"
              >
                {isPolishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Polishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Polish Content
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
