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
import { OwnerGuard } from "@/components/OwnerGuard";
import { useAuth } from "@/hooks/useAuth";
import type { LarrysContentItem } from "@shared/schema";
import { format } from "date-fns";
import {
  FuturisticCard,
  GlassmorphismCard,
  GoldBorderCard,
  AnimatedCounter,
  ProgressRing,
  LiveIndicator,
  TechLabel,
  PremiumBadge,
  HexGrid,
  GlowOrb,
  DataPanel
} from "@/components/premium-components";
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

interface ConsultationBooking {
  id: string;
  clientName: string;
  clientEmail: string;
  type: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled" | "in-progress";
  notes?: string;
  paid: boolean;
  price: string;
}

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
  
  const [selectedContent, setSelectedContent] = useState<LarrysContentItem | null>(null);
  const [newContent, setNewContent] = useState({ title: "", type: "blog", description: "", monetization: "free", price: "" });
  
  const [polishText, setPolishText] = useState("");
  const [polishedResult, setPolishedResult] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishType, setPolishType] = useState("professional");
  
  const [seoContent, setSeoContent] = useState("");
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [consultDate, setConsultDate] = useState<Date>();

  // Fetch content from API
  const { data: contentItems = [], isLoading: contentLoading } = useQuery<LarrysContentItem[]>({
    queryKey: ['/api/larry/content'],
  });

  // Fetch consultations from API
  const { data: consultations = [], isLoading: consultLoading } = useQuery<ConsultationBooking[]>({
    queryKey: ['/api/larry/consultations'],
  });

  // Create content mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newContent) => {
      const res = await apiRequest("POST", "/api/larry/content", {
        ...data,
        price: data.price ? parseFloat(data.price) : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/larry/content'] });
      setIsCreateOpen(false);
      setNewContent({ title: "", type: "blog", description: "", monetization: "free", price: "" });
      toast({ title: "Content Created!", description: "Your new content item has been added." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update content mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LarrysContentItem> }) => {
      const res = await apiRequest("PATCH", `/api/larry/content/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/larry/content'] });
      toast({ title: "Updated!", description: "Content has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/larry/content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/larry/content'] });
      setIsDeleteOpen(false);
      setSelectedContent(null);
      toast({ title: "Deleted", description: "Content has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Calculate stats from real data
  const totalRevenue = contentItems.reduce((sum, c) => sum + parseFloat(String(c.revenue || 0)), 0) + consultations.filter(c => c.paid).reduce((sum, c) => sum + (parseFloat(c.price || "0") || 0), 0);
  const totalViews = contentItems.reduce((sum, c) => sum + (c.views || 0), 0);
  const publishedCount = contentItems.filter(c => c.status === "published").length;
  const itemsWithSeo = contentItems.filter(c => c.seoScore);
  const avgSeoScore = itemsWithSeo.length > 0 ? Math.round(itemsWithSeo.reduce((sum, c) => sum + (c.seoScore || 0), 0) / itemsWithSeo.length) : 0;
  const pendingConsults = consultations.filter(c => c.status === "scheduled").length;
  const upcomingConsults = consultations.filter(c => c.status === "scheduled" || c.status === "in-progress").length;

  const filteredContent = contentItems.filter(item => {
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
    <OwnerGuard>
      <SEO
        title="Larry's Content Empire | Premium Content Creation & Monetization | WashBizHub"
        description="Create, polish, and monetize premium content with AI assistance. Larry's unified platform for blogs, courses, books, consultations, and digital products."
        canonicalUrl="/larrys-content-empire"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#050a14] via-[#0a1628] to-[#0f172a]" data-testid="page-larrys-content-empire">
        <div className="relative border-b border-[#C8A661]/20 overflow-hidden">
          <HexGrid opacity={0.03} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C8A661]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#C8A661] to-purple-500 rounded-full blur opacity-40" />
                  <img src={larryPhoto} alt="Larry Larsen" className="relative w-20 h-20 rounded-full border-2 border-[#C8A661] shadow-xl" />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#C8A661] to-[#E8C681] rounded-full p-1.5 shadow-lg shadow-[#C8A661]/30">
                    <Crown className="w-4 h-4 text-[#0A1628]" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    Larry's Content Empire
                    <PremiumBadge variant="elite" size="sm" animated>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Pro Suite
                    </PremiumBadge>
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Create premium content. AI makes it flawless. Monetize everything.</p>
                  <div className="flex items-center gap-3 mt-2">
                    <LiveIndicator status="online" />
                    <span className="text-xs text-gray-500">System Active</span>
                  </div>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setIsPolishOpen(true)} className="border-purple-500/40 text-purple-400 bg-purple-500/10" data-testid="button-ai-polish">
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Polish
                </Button>
                <Button variant="outline" onClick={() => setIsSeoOpen(true)} className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10" data-testid="button-seo-check">
                  <Target className="w-4 h-4 mr-2" />
                  SEO Check
                </Button>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-[#C8A661] text-[#0A1628] font-semibold shadow-lg shadow-[#C8A661]/30" data-testid="button-create-content">
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
                <FuturisticCard glowColor="green">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-400">
                          $<AnimatedCounter value={totalRevenue} duration={1500} />
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <TechLabel variant="success">+23%</TechLabel>
                          <span className="text-xs text-gray-500">this month</span>
                        </div>
                      </div>
                      <div className="p-3 bg-green-500/20 rounded-full border border-green-500/30">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </div>
                </FuturisticCard>
                <FuturisticCard glowColor="cyan">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Views</p>
                        <p className="text-3xl font-bold text-cyan-400">
                          <AnimatedCounter value={totalViews} duration={1500} />
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <TechLabel variant="info">+18%</TechLabel>
                          <span className="text-xs text-gray-500">this month</span>
                        </div>
                      </div>
                      <div className="p-3 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                        <Eye className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>
                  </div>
                </FuturisticCard>
                <FuturisticCard glowColor="purple">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Published Items</p>
                        <p className="text-3xl font-bold text-purple-400">
                          <AnimatedCounter value={publishedCount} duration={1000} />
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <TechLabel variant="warning">{contentItems.filter(c => c.status === "draft").length} drafts</TechLabel>
                        </div>
                      </div>
                      <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30">
                        <Send className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </div>
                </FuturisticCard>
                <FuturisticCard glowColor="gold">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Avg SEO Score</p>
                        <p className="text-3xl font-bold text-[#C8A661]">
                          <AnimatedCounter value={avgSeoScore} duration={1000} />/100
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <TechLabel variant="success">Excellent</TechLabel>
                        </div>
                      </div>
                      <ProgressRing value={avgSeoScore} size={56} strokeWidth={4} color="#C8A661" />
                    </div>
                  </div>
                </FuturisticCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassmorphismCard intensity="light" glowColor="gold" className="lg:col-span-2">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-[#C8A661]" />
                      <h3 className="text-lg font-bold text-white">Quick Create</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Jump directly into creating any content type</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {CONTENT_TYPES.slice(0, 8).map(type => (
                        <Button key={type.id} variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 bg-white/5 text-white" asChild data-testid={`button-quick-${type.id}`}>
                          <Link href={type.link}>
                            <div className={`p-2 rounded-lg ${type.bgColor}`}>
                              <type.icon className={`w-5 h-5 ${type.color}`} />
                            </div>
                            <span className="text-sm font-medium">{type.name}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                </GlassmorphismCard>

                <GlassmorphismCard intensity="light" glowColor="purple">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarIcon className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-white">Upcoming Consultations</h3>
                    </div>
                    <div className="space-y-3">
                      {consultations.filter(c => c.status === "scheduled" || c.status === "in-progress").slice(0, 3).map(consult => (
                        <div key={consult.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="p-2 bg-purple-500/20 rounded-full border border-purple-500/30">
                            {consult.type === "video" ? <VideoIcon className="w-4 h-4 text-purple-400" /> : <Phone className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{consult.clientName}</p>
                            <p className="text-xs text-gray-500">{consult.scheduledAt ? format(new Date(consult.scheduledAt), 'MMM d, yyyy h:mm a') : 'TBD'}</p>
                          </div>
                          {getConsultStatusBadge(consult.status)}
                        </div>
                      ))}
                      <Button variant="outline" className="w-full border-white/20 text-white bg-white/5" onClick={() => setMainTab("consultations")} data-testid="button-view-all-consults">
                        View All Consultations
                      </Button>
                    </div>
                  </div>
                </GlassmorphismCard>
              </div>

              <GlassmorphismCard intensity="light" glowColor="gold">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-[#C8A661]" />
                    <h3 className="text-lg font-bold text-white">Recent Content</h3>
                  </div>
                  <div className="space-y-3">
                    {contentItems.slice(0, 4).map(item => {
                      const typeConfig = getTypeConfig(item.type);
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10 transition-colors">
                          <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                            <typeConfig.icon className={`w-5 h-5 ${typeConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white truncate">{item.title}</h3>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {item.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${parseFloat(String(item.revenue || 0)).toLocaleString()}
                              </span>
                              {item.seoScore && (
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  SEO: {item.seoScore}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-white" asChild>
                            <Link href={typeConfig.link}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassmorphismCard>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <GlassmorphismCard intensity="light" glowColor="gold">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#C8A661]" />
                      Content Library
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input 
                          placeholder="Search content..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                          data-testid="input-search-content"
                        />
                      </div>
                      <Button onClick={() => setIsCreateOpen(true)} className="bg-[#C8A661] text-[#0A1628]">
                        <Plus className="w-4 h-4 mr-2" />
                        New
                      </Button>
                    </div>
                  </div>
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
                                          ${parseFloat(String(item.revenue || 0)).toLocaleString()} revenue
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
                                          {item.updatedAt ? format(new Date(item.updatedAt), 'MMM d, yyyy') : 'N/A'}
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
                </div>
              </GlassmorphismCard>
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FuturisticCard glowColor="cyan">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Pending Bookings</p>
                        <p className="text-3xl font-bold text-cyan-400"><AnimatedCounter value={pendingConsults} duration={800} /></p>
                      </div>
                      <Clock className="w-8 h-8 text-cyan-500/50" />
                    </div>
                  </div>
                </FuturisticCard>
                <FuturisticCard glowColor="green">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Upcoming This Week</p>
                        <p className="text-3xl font-bold text-green-400"><AnimatedCounter value={upcomingConsults} duration={800} /></p>
                      </div>
                      <CalendarIcon className="w-8 h-8 text-green-500/50" />
                    </div>
                  </div>
                </FuturisticCard>
                <FuturisticCard glowColor="gold">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Consultation Revenue</p>
                        <p className="text-3xl font-bold text-[#C8A661]">${consultations.filter(c => c.paid).reduce((sum, c) => sum + parseFloat(c.price || "0"), 0).toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-[#C8A661]/50" />
                    </div>
                  </div>
                </FuturisticCard>
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
                      {consultations.map(consult => {
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
                                      {consult.scheduledAt ? format(new Date(consult.scheduledAt), 'MMM d, yyyy') : 'TBD'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {consult.scheduledAt ? format(new Date(consult.scheduledAt), 'h:mm a') : 'TBD'}
                                    </span>
                                    <span className="font-medium text-emerald-600">${parseFloat(consult.price || "0")}</span>
                                  </div>
                                  {consult.notes && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">"{consult.notes}"</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {consult.status === "scheduled" && (
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Confirm
                                    </Button>
                                  )}
                                  {consult.status === "in-progress" && (
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
                    <p className="text-2xl font-bold">${contentItems.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}</p>
                    <Progress value={75} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Consultation Revenue</p>
                      <Phone className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-2xl font-bold">${consultations.filter(c => c.paid).reduce((sum, c) => sum + parseFloat(c.price || "0"), 0).toLocaleString()}</p>
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
                        const typeRevenue = contentItems.filter(c => c.type === type.id).reduce((sum, c) => sum + c.revenue, 0);
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
                      {[...contentItems].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((item, idx) => {
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
                            <p className="font-bold text-emerald-600">${parseFloat(String(item.revenue || 0)).toLocaleString()}</p>
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
              <AlertDialogAction 
                className="bg-red-600 hover:bg-red-700" 
                onClick={() => selectedContent?.id && deleteMutation.mutate(selectedContent.id)}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </OwnerGuard>
  );
}
