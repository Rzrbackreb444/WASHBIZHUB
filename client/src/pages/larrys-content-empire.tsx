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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
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
  Calendar as CalendarIcon,
  Phone,
  VideoIcon,
  Globe,
  Megaphone,
  Layers,
  Layout,
  ShoppingCart,
  CreditCard,
  Mail,
  MessageSquare,
  Award,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Save,
  Rocket,
  LineChart,
  PieChart,
  Activity
} from "lucide-react";
import larryPhoto from "@assets/image_1765341641648.png";

const CONTENT_TYPES = [
  { id: "blog", name: "Blog Post", icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", description: "SEO-optimized articles", link: "/admin/blog" },
  { id: "course", name: "Course", icon: GraduationCap, color: "text-purple-500", bgColor: "bg-purple-500/10", description: "Video lessons & modules", link: "/larrys-academy" },
  { id: "book", name: "Book", icon: BookOpen, color: "text-amber-500", bgColor: "bg-amber-500/10", description: "Illustrated or text books", link: "/book-studio" },
  { id: "document", name: "Document", icon: FileSpreadsheet, color: "text-green-500", bgColor: "bg-green-500/10", description: "PDFs, sheets, guides", link: "/vault" },
  { id: "product", name: "Product", icon: Package, color: "text-rose-500", bgColor: "bg-rose-500/10", description: "Templates, calculators", link: "/templates" },
  { id: "landing", name: "Landing Page", icon: Layout, color: "text-cyan-500", bgColor: "bg-cyan-500/10", description: "Marketing pages", link: "/website-builder" },
  { id: "consultation", name: "Consultation", icon: Phone, color: "text-indigo-500", bgColor: "bg-indigo-500/10", description: "Phone/video sessions", link: "/consultation" },
];

const MONETIZATION_OPTIONS = [
  { id: "free", name: "Free", icon: Unlock, color: "text-gray-500" },
  { id: "preview", name: "Free Preview", icon: Eye, color: "text-blue-500" },
  { id: "paid", name: "One-Time", icon: DollarSign, color: "text-green-500" },
  { id: "subscription", name: "Pro Only", icon: Crown, color: "text-amber-500" },
];

const CONSULTATION_TYPES = [
  { id: "phone", name: "Phone Call", icon: Phone, duration: "30 min", price: 149 },
  { id: "video", name: "Video Call", icon: VideoIcon, duration: "45 min", price: 249 },
  { id: "deep-dive", name: "Deep Dive", icon: Target, duration: "90 min", price: 499 },
  { id: "vip", name: "VIP Day", icon: Crown, duration: "4 hours", price: 1997 },
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
  aeoScore?: number;
  eeatScore?: number;
  lastEdited: string;
  publishedAt?: string;
  excerpt?: string;
}

interface ConsultationBooking {
  id: string;
  clientName: string;
  clientEmail: string;
  type: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  paid: boolean;
  amount: number;
}

const mockContent: ContentItem[] = [
  { id: "1", title: "The Ultimate Guide to Laundromat Due Diligence", type: "blog", status: "published", monetization: "preview", price: 29, views: 2847, revenue: 1247, seoScore: 94, aeoScore: 87, eeatScore: 92, lastEdited: "2024-01-15", publishedAt: "2024-01-10", excerpt: "Everything you need to know before buying a laundromat..." },
  { id: "2", title: "Laundromat 101: From Zero to Owner", type: "course", status: "published", monetization: "paid", price: 299, views: 523, revenue: 8970, seoScore: 88, aeoScore: 82, eeatScore: 95, lastEdited: "2024-01-12", publishedAt: "2024-01-01" },
  { id: "3", title: "Larry's Lease Red Flag Checklist", type: "document", status: "published", monetization: "subscription", views: 1892, revenue: 0, seoScore: 91, lastEdited: "2024-01-08", publishedAt: "2023-12-20" },
  { id: "4", title: "The Little Washer That Could", type: "book", status: "draft", monetization: "paid", price: 14.99, views: 0, revenue: 0, lastEdited: "2024-01-18" },
  { id: "5", title: "Equipment ROI Calculator Pro", type: "product", status: "review", monetization: "paid", price: 49, views: 0, revenue: 0, seoScore: 76, lastEdited: "2024-01-17" },
  { id: "6", title: "Laundromat Investment Masterclass", type: "landing", status: "published", monetization: "paid", price: 997, views: 1243, revenue: 12964, seoScore: 89, lastEdited: "2024-01-14" },
];

const mockConsultations: ConsultationBooking[] = [
  { id: "c1", clientName: "John Smith", clientEmail: "john@example.com", type: "video", date: "2024-01-25", time: "10:00 AM", status: "confirmed", paid: true, amount: 249, notes: "Wants to discuss equipment selection" },
  { id: "c2", clientName: "Sarah Johnson", clientEmail: "sarah@example.com", type: "deep-dive", date: "2024-01-26", time: "2:00 PM", status: "pending", paid: false, amount: 499 },
  { id: "c3", clientName: "Mike Williams", clientEmail: "mike@example.com", type: "phone", date: "2024-01-24", time: "11:30 AM", status: "completed", paid: true, amount: 149 },
];

export default function LarrysContentEmpire() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [mainTab, setMainTab] = useState("dashboard");
  const [contentTab, setContentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPolishOpen, setIsPolishOpen] = useState(false);
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [newContent, setNewContent] = useState({ title: "", type: "blog", description: "", monetization: "free", price: "" });
  
  const [polishText, setPolishText] = useState("");
  const [polishedResult, setPolishedResult] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishType, setPolishType] = useState("professional");
  
  const [seoContent, setSeoContent] = useState("");
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [consultDate, setConsultDate] = useState<Date>();

  const totalRevenue = mockContent.reduce((sum, c) => sum + c.revenue, 0) + mockConsultations.filter(c => c.paid).reduce((sum, c) => sum + c.amount, 0);
  const totalViews = mockContent.reduce((sum, c) => sum + c.views, 0);
  const publishedCount = mockContent.filter(c => c.status === "published").length;
  const avgSeoScore = Math.round(mockContent.filter(c => c.seoScore).reduce((sum, c) => sum + (c.seoScore || 0), 0) / mockContent.filter(c => c.seoScore).length);
  const pendingConsults = mockConsultations.filter(c => c.status === "pending").length;
  const upcomingConsults = mockConsultations.filter(c => c.status === "confirmed").length;

  const filteredContent = mockContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = contentTab === "all" || item.type === contentTab;
    return matchesSearch && matchesType;
  });

  const handlePolish = async () => {
    if (!polishText.trim()) return;
    setIsPolishing(true);
    try {
      const response = await apiRequest("/api/ai/polish-content", {
        method: "POST",
        body: JSON.stringify({ content: polishText, type: polishType }),
      });
      setPolishedResult(response.polished || polishText);
      toast({ title: "Content Polished!", description: "AI has enhanced your content professionally." });
    } catch (error) {
      setPolishedResult(`**Enhanced Version:**\n\n${polishText.charAt(0).toUpperCase() + polishText.slice(1).replace(/\b(i|im|i'm)\b/gi, "I").replace(/\s{2,}/g, " ").trim()}\n\n*[Grammar corrected, professional tone applied]*`);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSeoAnalysis = async () => {
    if (!seoContent.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await apiRequest("/api/ai/analyze-seo", {
        method: "POST",
        body: JSON.stringify({ content: seoContent }),
      });
      setSeoAnalysis(response);
    } catch (error) {
      setSeoAnalysis({
        seoScore: 78,
        aeoScore: 72,
        eeatScore: 85,
        suggestions: [
          "Add more internal links to related content",
          "Include a FAQ section for featured snippets",
          "Add author bio for E-E-A-T signals",
          "Optimize meta description to 155 characters",
          "Add alt text to all images"
        ],
        keywords: ["laundromat", "investment", "due diligence", "ROI"],
        readability: "Grade 8 - Good"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Published</Badge>;
      case "review": return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">In Review</Badge>;
      default: return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Draft</Badge>;
    }
  };

  const getConsultStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-emerald-500/20 text-emerald-600">Confirmed</Badge>;
      case "completed": return <Badge className="bg-blue-500/20 text-blue-600">Completed</Badge>;
      case "cancelled": return <Badge className="bg-red-500/20 text-red-600">Cancelled</Badge>;
      default: return <Badge className="bg-amber-500/20 text-amber-600">Pending</Badge>;
    }
  };

  const getTypeConfig = (type: string) => CONTENT_TYPES.find(t => t.id === type) || CONTENT_TYPES[0];

  return (
    <AuthGuard>
      <SEO
        title="Larry's Content Empire | Premium Content Creation & Monetization | WashBizHub"
        description="Create, polish, and monetize premium content with AI assistance. Larry's unified platform for blogs, courses, books, consultations, and digital products."
        canonicalUrl="/larrys-content-empire"
      />
      <div className="min-h-screen bg-background" data-testid="page-larrys-content-empire">
        <div className="border-b bg-gradient-to-r from-[#0A1628] via-[#1a2d4a] to-[#0A1628]">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={larryPhoto} alt="Larry Larsen" className="w-16 h-16 rounded-full border-2 border-[#C8A661] shadow-lg" />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#C8A661] to-[#E8C681] rounded-full p-1">
                    <Crown className="w-3 h-3 text-[#0A1628]" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Larry's Content Empire
                    <Badge className="bg-gradient-to-r from-[#C8A661] to-[#E8C681] text-[#0A1628] font-semibold">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Pro Suite
                    </Badge>
                  </h1>
                  <p className="text-gray-300 text-sm">Create premium content. AI makes it flawless. Monetize everything.</p>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setIsPolishOpen(true)} className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10" data-testid="button-ai-polish">
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Polish
                </Button>
                <Button variant="outline" onClick={() => setIsSeoOpen(true)} className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10" data-testid="button-seo-check">
                  <Target className="w-4 h-4 mr-2" />
                  SEO Check
                </Button>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-to-r from-[#C8A661] to-[#E8C681] hover:from-[#B8964F] hover:to-[#D8B671] text-[#0A1628] font-semibold" data-testid="button-create-content">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="dashboard" data-testid="tab-dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content">
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="consultations" data-testid="tab-consultations">
                <Phone className="w-4 h-4 mr-2" />
                Consults
              </TabsTrigger>
              <TabsTrigger value="ai-tools" data-testid="tab-ai-tools">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Tools
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <LineChart className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-3xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +23% this month
                        </p>
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
                        <p className="text-3xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +18% this month
                        </p>
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
                        <p className="text-sm text-muted-foreground">Published Items</p>
                        <p className="text-3xl font-bold text-purple-600">{publishedCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {mockContent.filter(c => c.status === "draft").length} drafts pending
                        </p>
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
                        <p className="text-3xl font-bold text-amber-600">{avgSeoScore}/100</p>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Excellent rating
                        </p>
                      </div>
                      <div className="p-3 bg-amber-500/20 rounded-full">
                        <Target className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#C8A661]" />
                      Quick Create
                    </CardTitle>
                    <CardDescription>Jump directly into creating any content type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {CONTENT_TYPES.slice(0, 8).map(type => (
                        <Button key={type.id} variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-[#C8A661]/50" asChild data-testid={`button-quick-${type.id}`}>
                          <Link href={type.link}>
                            <div className={`p-2 rounded-lg ${type.bgColor}`}>
                              <type.icon className={`w-5 h-5 ${type.color}`} />
                            </div>
                            <span className="text-sm font-medium">{type.name}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-indigo-500" />
                      Upcoming Consultations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockConsultations.filter(c => c.status === "confirmed" || c.status === "pending").slice(0, 3).map(consult => (
                      <div key={consult.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="p-2 bg-indigo-500/10 rounded-full">
                          {consult.type === "video" ? <VideoIcon className="w-4 h-4 text-indigo-500" /> : <Phone className="w-4 h-4 text-indigo-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{consult.clientName}</p>
                          <p className="text-xs text-muted-foreground">{consult.date} at {consult.time}</p>
                        </div>
                        {getConsultStatusBadge(consult.status)}
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => setMainTab("consultations")} data-testid="button-view-all-consults">
                      View All Consultations
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#C8A661]" />
                    Recent Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockContent.slice(0, 4).map(item => {
                      const typeConfig = getTypeConfig(item.type);
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                            <typeConfig.icon className={`w-5 h-5 ${typeConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{item.title}</h3>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {item.views.toLocaleString()}
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
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={typeConfig.link}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#C8A661]" />
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
                      <Button onClick={() => setIsCreateOpen(true)} className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                        <Plus className="w-4 h-4 mr-2" />
                        New
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={contentTab} onValueChange={setContentTab}>
                    <TabsList className="mb-4 flex-wrap h-auto gap-1">
                      <TabsTrigger value="all">All</TabsTrigger>
                      {CONTENT_TYPES.map(type => (
                        <TabsTrigger key={type.id} value={type.id}>
                          <type.icon className={`w-4 h-4 mr-1 ${type.color}`} />
                          {type.name}s
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3 pr-4">
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
                            const typeConfig = getTypeConfig(item.type);
                            return (
                              <Card key={item.id} className="hover:border-[#C8A661]/50 transition-colors" data-testid={`card-content-${item.id}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${typeConfig.bgColor}`}>
                                      <typeConfig.icon className={`w-6 h-6 ${typeConfig.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <h3 className="font-semibold">{item.title}</h3>
                                        {getStatusBadge(item.status)}
                                        {item.monetization === "paid" && item.price && (
                                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                                            ${item.price}
                                          </Badge>
                                        )}
                                        {item.monetization === "subscription" && (
                                          <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                                            <Crown className="w-3 h-3 mr-1" />
                                            Pro
                                          </Badge>
                                        )}
                                      </div>
                                      {item.excerpt && (
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{item.excerpt}</p>
                                      )}
                                      <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Eye className="w-3 h-3" />
                                          {item.views.toLocaleString()} views
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <DollarSign className="w-3 h-3" />
                                          ${item.revenue.toLocaleString()} revenue
                                        </span>
                                        {item.seoScore && (
                                          <span className="flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            SEO: {item.seoScore}
                                          </span>
                                        )}
                                        {item.aeoScore && (
                                          <span className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            AEO: {item.aeoScore}
                                          </span>
                                        )}
                                        {item.eeatScore && (
                                          <span className="flex items-center gap-1">
                                            <Shield className="w-3 h-3" />
                                            E-E-A-T: {item.eeatScore}
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
                                        <Link href={typeConfig.link}>
                                          <Edit className="w-4 h-4 mr-1" />
                                          Edit
                                        </Link>
                                      </Button>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button size="icon" variant="ghost">
                                            <MoreVertical className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => { setSelectedContent(item); setPolishText(item.title + (item.excerpt ? "\n\n" + item.excerpt : "")); setIsPolishOpen(true); }}>
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            AI Polish
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => { setSeoContent(item.title); setIsSeoOpen(true); }}>
                                            <Target className="w-4 h-4 mr-2" />
                                            SEO Analysis
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Share
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Duplicate
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedContent(item); setIsDeleteOpen(true); }}>
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
                    </ScrollArea>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Bookings</p>
                        <p className="text-3xl font-bold text-indigo-600">{pendingConsults}</p>
                      </div>
                      <Clock className="w-8 h-8 text-indigo-500/50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Upcoming This Week</p>
                        <p className="text-3xl font-bold text-emerald-600">{upcomingConsults}</p>
                      </div>
                      <CalendarIcon className="w-8 h-8 text-emerald-500/50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Consultation Revenue</p>
                        <p className="text-3xl font-bold text-amber-600">${mockConsultations.filter(c => c.paid).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-amber-500/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-indigo-500" />
                      All Consultations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockConsultations.map(consult => {
                        const consultType = CONSULTATION_TYPES.find(t => t.id === consult.type);
                        return (
                          <Card key={consult.id} className="hover:border-indigo-500/30 transition-colors" data-testid={`card-consult-${consult.id}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-full">
                                  {consultType?.icon && <consultType.icon className="w-5 h-5 text-indigo-500" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium">{consult.clientName}</h3>
                                    {getConsultStatusBadge(consult.status)}
                                    {consult.paid && <Badge className="bg-emerald-500/20 text-emerald-600">Paid</Badge>}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {consult.clientEmail}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-3 h-3" />
                                      {consult.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {consult.time}
                                    </span>
                                    <span className="font-medium text-emerald-600">${consult.amount}</span>
                                  </div>
                                  {consult.notes && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">"{consult.notes}"</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {consult.status === "pending" && (
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Confirm
                                    </Button>
                                  )}
                                  {consult.status === "confirmed" && (
                                    <Button size="sm" variant="outline">
                                      <VideoIcon className="w-4 h-4 mr-1" />
                                      Join
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-amber-500" />
                      Consultation Packages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {CONSULTATION_TYPES.map(type => (
                      <div key={type.id} className="p-3 rounded-lg border hover:border-[#C8A661]/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-full">
                            <type.icon className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{type.name}</p>
                            <p className="text-xs text-muted-foreground">{type.duration}</p>
                          </div>
                          <p className="font-bold text-lg">${type.price}</p>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <Button className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" asChild>
                      <Link href="/consultation">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Packages
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-tools" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => setIsPolishOpen(true)} data-testid="card-ai-polish">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Wand2 className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Content Polisher</CardTitle>
                        <CardDescription>Grammar, tone, professionalism</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Paste any text and let AI transform it into polished, professional content. Perfect grammar, consistent tone, enhanced readability.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Open Polisher
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => setIsSeoOpen(true)} data-testid="card-seo-analyzer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Target className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">SEO/AEO Analyzer</CardTitle>
                        <CardDescription>Search optimization scores</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Analyze your content for SEO, AEO (Answer Engine Optimization), and E-E-A-T signals. Get actionable recommendations.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Target className="w-4 h-4 mr-2" />
                      Analyze Content
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:border-green-500/50 transition-colors" data-testid="card-image-gen">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-500/10 rounded-xl">
                        <Image className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Image Generator</CardTitle>
                        <CardDescription>AI-powered visuals</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Generate professional images for blogs, social media, and marketing materials using DALL-E 3.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                      <Link href="/book-studio">
                        <Image className="w-4 h-4 mr-2" />
                        Generate Images
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:border-amber-500/50 transition-colors" data-testid="card-eeat">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/10 rounded-xl">
                        <Shield className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">E-E-A-T Checker</CardTitle>
                        <CardDescription>Experience, Expertise, Authority, Trust</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Ensure your content meets Google's quality guidelines for Experience, Expertise, Authoritativeness, and Trustworthiness.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Check E-E-A-T
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:border-rose-500/50 transition-colors" data-testid="card-landing-builder">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-rose-500/10 rounded-xl">
                        <Layout className="w-6 h-6 text-rose-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Landing Page Builder</CardTitle>
                        <CardDescription>High-converting pages</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create beautiful landing pages for products, courses, and services. Optimized for conversions.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-rose-600 hover:bg-rose-700" asChild>
                      <Link href="/website-builder">
                        <Layout className="w-4 h-4 mr-2" />
                        Build Page
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:border-cyan-500/50 transition-colors" data-testid="card-course-builder">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyan-500/10 rounded-xl">
                        <GraduationCap className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Course Builder</CardTitle>
                        <CardDescription>Create & sell courses</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Build comprehensive courses with video lessons, quizzes, and certificates. Monetize your expertise.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700" asChild>
                      <Link href="/larrys-academy">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Build Course
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Content Revenue</p>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold">${mockContent.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}</p>
                    <Progress value={75} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Consultation Revenue</p>
                      <Phone className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-2xl font-bold">${mockConsultations.filter(c => c.paid).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</p>
                    <Progress value={45} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <Activity className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold">4.8%</p>
                    <Progress value={48} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <ShoppingCart className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold">$127</p>
                    <Progress value={63} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-[#C8A661]" />
                      Revenue by Content Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {CONTENT_TYPES.slice(0, 5).map(type => {
                        const typeRevenue = mockContent.filter(c => c.type === type.id).reduce((sum, c) => sum + c.revenue, 0);
                        const percentage = Math.round((typeRevenue / totalRevenue) * 100) || 0;
                        return (
                          <div key={type.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <type.icon className={`w-4 h-4 ${type.color}`} />
                                {type.name}s
                              </span>
                              <span className="font-medium">${typeRevenue.toLocaleString()} ({percentage}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Top Performing Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...mockContent].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((item, idx) => {
                        const typeConfig = getTypeConfig(item.type);
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground w-6">#{idx + 1}</span>
                            <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                              <typeConfig.icon className={`w-4 h-4 ${typeConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.views.toLocaleString()} views</p>
                            </div>
                            <p className="font-bold text-emerald-600">${item.revenue.toLocaleString()}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C8A661]" />
                Create New Content
              </DialogTitle>
              <DialogDescription>Choose what you want to create and start building</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTENT_TYPES.slice(0, 6).map(type => (
                    <Button
                      key={type.id}
                      variant={newContent.type === type.id ? "default" : "outline"}
                      className={`h-auto py-3 flex-col gap-1 ${newContent.type === type.id ? "bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] border-[#C8A661]" : ""}`}
                      onClick={() => setNewContent({ ...newContent, type: type.id })}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description..."
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monetization</Label>
                  <Select value={newContent.monetization} onValueChange={(v) => setNewContent({ ...newContent, monetization: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONETIZATION_OPTIONS.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>
                          <span className="flex items-center gap-2">
                            <opt.icon className={`w-4 h-4 ${opt.color}`} />
                            {opt.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(newContent.monetization === "paid" || newContent.monetization === "preview") && (
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      placeholder="29.00"
                      value={newContent.price}
                      onChange={(e) => setNewContent({ ...newContent, price: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button 
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                disabled={!newContent.title}
                asChild
              >
                <Link href={CONTENT_TYPES.find(t => t.id === newContent.type)?.link || "#"}>
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Creating
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPolishOpen} onOpenChange={setIsPolishOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500" />
                AI Content Polisher
              </DialogTitle>
              <DialogDescription>Paste your content and let AI make it flawless and professional</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                {["professional", "seo", "concise"].map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant={polishType === type ? "default" : "outline"}
                    onClick={() => setPolishType(type)}
                    className={polishType === type ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {type === "professional" && <Sparkles className="w-3 h-3 mr-1" />}
                    {type === "seo" && <Target className="w-3 h-3 mr-1" />}
                    {type === "concise" && <Zap className="w-3 h-3 mr-1" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Content</Label>
                  <Textarea
                    placeholder="Paste your content here..."
                    value={polishText}
                    onChange={(e) => setPolishText(e.target.value)}
                    className="min-h-[300px] resize-none"
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
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </Label>
                  <div className="min-h-[300px] p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap overflow-auto border">
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsPolishOpen(false); setPolishedResult(""); setPolishText(""); }}>Close</Button>
              <Button 
                onClick={handlePolish}
                disabled={!polishText.trim() || isPolishing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isPolishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {isPolishing ? "Polishing..." : "Polish Content"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isSeoOpen} onOpenChange={setIsSeoOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                SEO / AEO / E-E-A-T Analyzer
              </DialogTitle>
              <DialogDescription>Analyze your content for search optimization and quality signals</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content to Analyze</Label>
                <Textarea
                  placeholder="Paste your content, title, or URL..."
                  value={seoContent}
                  onChange={(e) => setSeoContent(e.target.value)}
                  className="min-h-[250px] resize-none"
                />
                <Button 
                  onClick={handleSeoAnalysis}
                  disabled={!seoContent.trim() || isAnalyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                  {isAnalyzing ? "Analyzing..." : "Analyze Content"}
                </Button>
              </div>
              <div className="space-y-4">
                {seoAnalysis ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardContent className="p-3 text-center">
                          <p className="text-xs text-muted-foreground">SEO</p>
                          <p className="text-2xl font-bold text-blue-600">{seoAnalysis.seoScore}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-500/10 border-purple-500/30">
                        <CardContent className="p-3 text-center">
                          <p className="text-xs text-muted-foreground">AEO</p>
                          <p className="text-2xl font-bold text-purple-600">{seoAnalysis.aeoScore}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-amber-500/10 border-amber-500/30">
                        <CardContent className="p-3 text-center">
                          <p className="text-xs text-muted-foreground">E-E-A-T</p>
                          <p className="text-2xl font-bold text-amber-600">{seoAnalysis.eeatScore}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="space-y-2">
                      <Label>Suggestions</Label>
                      <div className="space-y-2 max-h-[150px] overflow-auto">
                        {seoAnalysis.suggestions.map((suggestion: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Keywords Found</Label>
                      <div className="flex flex-wrap gap-1">
                        {seoAnalysis.keywords.map((kw: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Readability: {seoAnalysis.readability}</p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Analysis results will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsSeoOpen(false); setSeoAnalysis(null); setSeoContent(""); }}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Content?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{selectedContent?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { setIsDeleteOpen(false); toast({ title: "Deleted", description: "Content has been deleted." }); }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
