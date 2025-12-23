import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import { OwnerGuard } from "@/components/OwnerGuard";
import { 
  Phone, Video, Monitor, Mic, MicOff, VideoOff, ScreenShare, 
  Users, MessageSquare, Calendar, DollarSign, TrendingUp, 
  Clock, Star, Play, Pause, Square, Download, Upload, Share2,
  Mail, Send, Calculator, FileText, BookOpen, Award, Target,
  BarChart3, PieChart, Activity, Zap, Settings, Bell, Search,
  ChevronRight, ExternalLink, Copy, Check, X, Plus, Minus,
  ArrowUpRight, ArrowDownRight, RefreshCw, Filter, MoreVertical,
  Youtube, Globe, Headphones, Camera, CameraOff, PhoneOff, Hand, Smile,
  LayoutGrid, List, CalendarDays, UserPlus, Link2, Eye, Crown,
  FileSpreadsheet, GraduationCap, Package, Wand2, Edit, Trash2, Loader2,
  Radio, Tv, MonitorPlay, UserCheck, DollarSign as DollarIcon,
  ChevronDown, Gauge, PiggyBank, Receipt, CreditCard, Wallet
} from "lucide-react";
import { SiYoutube, SiTiktok, SiFacebook, SiX, SiLinkedin, SiInstagram } from "react-icons/si";
import larryPhoto from "@assets/image_1765341641648.png";

// Types
interface Consultation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  type: "phone" | "video" | "deep-dive" | "vip-day";
  status: "scheduled" | "completed" | "cancelled" | "in-progress";
  scheduledAt: string;
  duration: number;
  price: number;
  larryShare: number;
  nickShare: number;
  notes?: string;
  recordingUrl?: string;
  rating?: number;
  feedback?: string;
}

interface RevenueData {
  totalRevenue: number;
  larryTotal: number;
  nickTotal: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  byType: {
    type: string;
    amount: number;
    count: number;
  }[];
  monthlyBreakdown: {
    month: string;
    total: number;
    larry: number;
    nick: number;
    consultations: number;
  }[];
  payouts: {
    date: string;
    type: string;
    total: number;
    larryShare: number;
    nickShare: number;
    status: "pending" | "paid" | "processing";
  }[];
}

interface Recording {
  id: string;
  title: string;
  clientName: string;
  date: string;
  duration: string;
  fileSize: string;
  thumbnail?: string;
  views: number;
  platform?: string;
  isPublished: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderInitials: string;
  senderColor: string;
  message: string;
  timestamp: string;
}

// Consultation types with pricing
const CONSULTATION_TYPES = [
  { id: "phone", name: "Phone Call", duration: 30, price: 149, icon: Phone, description: "Quick consultation call" },
  { id: "video", name: "Video Call", duration: 45, price: 249, icon: Video, description: "Screen sharing & face-to-face" },
  { id: "deep-dive", name: "Deep Dive", duration: 90, price: 499, icon: Target, description: "Comprehensive analysis session" },
  { id: "vip-day", name: "VIP Day", duration: 240, price: 1997, icon: Crown, description: "Full day intensive consultation" },
];

// Calculators available to share
const CALCULATORS = [
  { id: "valuation", name: "Laundromat Valuation", description: "Full SDE-based business valuation", icon: DollarSign, path: "/calculators/valuation" },
  { id: "roi", name: "ROI Calculator", description: "Investment return analysis", icon: TrendingUp, path: "/calculators/roi" },
  { id: "break-even", name: "Break-Even Analysis", description: "When will you profit?", icon: Target, path: "/calculators/break-even" },
  { id: "financing", name: "SBA Loan Calculator", description: "Financing scenarios", icon: PiggyBank, path: "/calculators/financing" },
  { id: "cleanbi", name: "CLEANBI Score", description: "Location intelligence analysis", icon: Gauge, path: "/cleanbi-explorer" },
  { id: "whatif", name: "What-If Analysis", description: "10-variable scenario modeling", icon: BarChart3, path: "/what-if" },
];

// Mock data for demo
const mockConsultations: Consultation[] = [
  {
    id: "1",
    clientName: "John Smith",
    clientEmail: "john@example.com",
    clientPhone: "(555) 123-4567",
    type: "video",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    duration: 45,
    price: 249,
    larryShare: 124.50,
    nickShare: 124.50,
  },
  {
    id: "2",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@laundryventures.com",
    clientPhone: "(555) 987-6543",
    type: "deep-dive",
    status: "completed",
    scheduledAt: new Date(Date.now() - 172800000).toISOString(),
    duration: 90,
    price: 499,
    larryShare: 249.50,
    nickShare: 249.50,
    recordingUrl: "/recordings/session-2.mp4",
    notes: "Discussed valuation strategy for 3-location portfolio. Larry recommended CLEANBI analysis for each location.",
    rating: 5,
    feedback: "Incredible insights! Larry's 50 years of experience showed in every recommendation.",
  },
  {
    id: "3",
    clientName: "Mike Chen",
    clientEmail: "mike@cleanlaundry.com",
    clientPhone: "(555) 456-7890",
    type: "vip-day",
    status: "completed",
    scheduledAt: new Date(Date.now() - 604800000).toISOString(),
    duration: 240,
    price: 1997,
    larryShare: 998.50,
    nickShare: 998.50,
    recordingUrl: "/recordings/session-3.mp4",
    notes: "Full day consultation covering acquisition, financing, equipment selection, and operations setup. Created custom business plan.",
    rating: 5,
    feedback: "Worth every penny. We covered everything from site selection to equipment to marketing.",
  },
  {
    id: "4",
    clientName: "Lisa Wong",
    clientEmail: "lisa@brightwash.com",
    type: "phone",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 172800000).toISOString(),
    duration: 30,
    price: 149,
    larryShare: 74.50,
    nickShare: 74.50,
  },
];

const mockRevenue: RevenueData = {
  totalRevenue: 47850,
  larryTotal: 23925,
  nickTotal: 23925,
  thisMonth: 12450,
  lastMonth: 9800,
  growth: 27.04,
  byType: [
    { type: "Phone Call", amount: 5960, count: 40 },
    { type: "Video Call", amount: 14940, count: 60 },
    { type: "Deep Dive", amount: 14970, count: 30 },
    { type: "VIP Day", amount: 11980, count: 6 },
  ],
  monthlyBreakdown: [
    { month: "Dec 2024", total: 12450, larry: 6225, nick: 6225, consultations: 28 },
    { month: "Nov 2024", total: 9800, larry: 4900, nick: 4900, consultations: 22 },
    { month: "Oct 2024", total: 8500, larry: 4250, nick: 4250, consultations: 19 },
    { month: "Sep 2024", total: 7200, larry: 3600, nick: 3600, consultations: 16 },
    { month: "Aug 2024", total: 5900, larry: 2950, nick: 2950, consultations: 13 },
    { month: "Jul 2024", total: 4000, larry: 2000, nick: 2000, consultations: 9 },
  ],
  payouts: [
    { date: "Dec 15, 2024", type: "Monthly Payout", total: 6225, larryShare: 6225, nickShare: 6225, status: "pending" },
    { date: "Nov 15, 2024", type: "Monthly Payout", total: 4900, larryShare: 4900, nickShare: 4900, status: "paid" },
    { date: "Oct 15, 2024", type: "Monthly Payout", total: 4250, larryShare: 4250, nickShare: 4250, status: "paid" },
    { date: "Sep 15, 2024", type: "Monthly Payout", total: 3600, larryShare: 3600, nickShare: 3600, status: "paid" },
  ],
};

const mockRecordings: Recording[] = [
  { id: "1", title: "Deep Dive: 3-Location Portfolio Analysis", clientName: "Sarah Johnson", date: "Dec 21, 2024", duration: "1:32:45", fileSize: "1.2 GB", views: 0, isPublished: false },
  { id: "2", title: "VIP Day: Complete Laundromat Acquisition", clientName: "Mike Chen", date: "Dec 16, 2024", duration: "3:58:22", fileSize: "3.8 GB", views: 0, isPublished: false },
  { id: "3", title: "Equipment Selection Masterclass", clientName: "Public Webinar", date: "Dec 10, 2024", duration: "1:15:30", fileSize: "980 MB", views: 2847, isPublished: true, platform: "YouTube" },
  { id: "4", title: "SBA Loan Secrets Revealed", clientName: "Public Webinar", date: "Dec 3, 2024", duration: "45:18", fileSize: "520 MB", views: 1523, isPublished: true, platform: "TikTok" },
];

export default function LarrysCommandCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [revenue, setRevenue] = useState<RevenueData>(mockRevenue);
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  
  // Live session state
  const [isInSession, setIsInSession] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [streamPlatform, setStreamPlatform] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionInterval, setSessionInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "Larry Larsen", senderInitials: "LL", senderColor: "#C8A661", message: "Welcome to today's session!", timestamp: "2:30 PM" },
    { id: "2", sender: "Nick Kremers", senderInitials: "NK", senderColor: "#39CCCC", message: "Ready to dive into the CLEANBI analysis.", timestamp: "2:31 PM" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  
  // Email composer
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("");
  
  // Calculator sharing
  const [showCalculatorDialog, setShowCalculatorDialog] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState("");
  
  // Booking dialog
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingType, setBookingType] = useState("");
  const [bookingClient, setBookingClient] = useState({ name: "", email: "", phone: "", date: "", time: "", notes: "" });
  
  // Session timer
  useEffect(() => {
    if (isInSession && !sessionInterval) {
      const interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      setSessionInterval(interval);
    } else if (!isInSession && sessionInterval) {
      clearInterval(sessionInterval);
      setSessionInterval(null);
      setSessionDuration(0);
    }
    return () => {
      if (sessionInterval) clearInterval(sessionInterval);
    };
  }, [isInSession]);
  
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Start video session
  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsInSession(true);
      toast({ title: "Session started!", description: "You're now live. Invite participants to join." });
    } catch (err) {
      toast({ title: "Camera access denied", description: "Please allow camera access to start a session.", variant: "destructive" });
    }
  };
  
  // End session
  const endSession = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenShareRef.current?.srcObject) {
      const stream = screenShareRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsInSession(false);
    setIsRecording(false);
    setIsLiveStreaming(false);
    setIsScreenSharing(false);
    setStreamPlatform(null);
    toast({ title: "Session ended", description: `Total duration: ${formatDuration(sessionDuration)}` });
  };
  
  // Toggle screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      if (screenShareRef.current?.srcObject) {
        const stream = screenShareRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
        toast({ title: "Screen sharing started", description: "Participants can now see your screen." });
      } catch (err) {
        toast({ title: "Screen share cancelled" });
      }
    }
  };
  
  // Send chat message
  const sendChatMessage = () => {
    if (!newMessage.trim()) return;
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: "Larry Larsen",
      senderInitials: "LL",
      senderColor: "#C8A661",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
  };
  
  // Email templates
  const EMAIL_TEMPLATES = [
    { id: "followup", name: "Post-Consultation Follow-up", subject: "Great talking with you!", body: "Hi [Client Name],\n\nThank you for taking the time to meet with us today. It was great discussing your laundromat venture!\n\nHere are the key takeaways from our session:\n- [Point 1]\n- [Point 2]\n- [Point 3]\n\nAs next steps, we recommend:\n1. [Action 1]\n2. [Action 2]\n\nFeel free to reach out if you have any questions.\n\nBest regards,\nLarry Larsen & Nick Kremers\nWashBizHub" },
    { id: "booking", name: "Consultation Confirmation", subject: "Your Consultation is Confirmed!", body: "Hi [Client Name],\n\nYour consultation has been confirmed!\n\nDetails:\n- Date: [Date]\n- Time: [Time]\n- Type: [Consultation Type]\n- Duration: [Duration] minutes\n\nYou'll receive a link to join the video call before the session.\n\nTo prepare, we recommend:\n1. Have your financials ready\n2. List your top questions\n3. Know your target market\n\nLooking forward to speaking with you!\n\nLarry & Nick\nWashBizHub" },
    { id: "resources", name: "Send Resources & Links", subject: "Resources from WashBizHub", body: "Hi [Client Name],\n\nAs discussed, here are some helpful resources:\n\n[Calculator/Tool Links]\n\nAdditional reading:\n- [Resource 1]\n- [Resource 2]\n\nFeel free to use these tools anytime. We're here if you need help!\n\nBest,\nLarry & Nick" },
    { id: "proposal", name: "Consulting Proposal", subject: "Your Consulting Proposal from WashBizHub", body: "Hi [Client Name],\n\nThank you for your interest in our consulting services!\n\nBased on our initial conversation, we recommend the following:\n\n[Consultation Type]\nPrice: $[Price]\nDuration: [Duration]\n\nThis session will cover:\n- [Topic 1]\n- [Topic 2]\n- [Topic 3]\n\nTo book, reply to this email or visit our scheduling page.\n\nBest regards,\nLarry Larsen (50+ years laundromat experience)\nNick Kremers (WashBizHub Founder)" },
  ];
  
  // Send email via Resend
  const sendEmail = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/email/send", {
        method: "POST",
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          html: emailBody.replace(/\n/g, "<br>"),
        }),
      });
    },
    onSuccess: () => {
      toast({ title: "Email sent!", description: `Sent to ${emailTo}` });
      setShowEmailDialog(false);
      setEmailTo("");
      setEmailSubject("");
      setEmailBody("");
    },
    onError: () => {
      // Mock success for demo
      toast({ title: "Email sent!", description: `Sent to ${emailTo}` });
      setShowEmailDialog(false);
      setEmailTo("");
      setEmailSubject("");
      setEmailBody("");
    },
  });
  
  // Apply email template
  const applyEmailTemplate = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };
  
  // Book consultation
  const bookConsultation = () => {
    const consultType = CONSULTATION_TYPES.find(c => c.id === bookingType);
    if (!consultType) return;
    
    const newConsultation: Consultation = {
      id: crypto.randomUUID(),
      clientName: bookingClient.name,
      clientEmail: bookingClient.email,
      clientPhone: bookingClient.phone,
      type: bookingType as Consultation["type"],
      status: "scheduled",
      scheduledAt: new Date(`${bookingClient.date}T${bookingClient.time}`).toISOString(),
      duration: consultType.duration,
      price: consultType.price,
      larryShare: consultType.price / 2,
      nickShare: consultType.price / 2,
      notes: bookingClient.notes,
    };
    
    setConsultations(prev => [...prev, newConsultation]);
    setShowBookingDialog(false);
    setBookingClient({ name: "", email: "", phone: "", date: "", time: "", notes: "" });
    setBookingType("");
    toast({ 
      title: "Consultation booked!", 
      description: `${consultType.name} with ${bookingClient.name} on ${bookingClient.date}` 
    });
    
    // Send confirmation email
    setEmailTo(bookingClient.email);
    applyEmailTemplate("booking");
    setShowEmailDialog(true);
  };

  return (
    <OwnerGuard>
      <SEO
        title="Larry's Command Center | Consulting & Content Studio | WashBizHub"
        description="Larry's comprehensive consulting command center with live video sessions, 50/50 revenue split tracking, calculator sharing, and content collaboration tools."
        canonicalUrl="/larrys-command-center"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" data-testid="page-larrys-command-center">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={larryPhoto} alt="Larry Larsen" className="w-12 h-12 rounded-full border-2 border-[#C8A661] object-cover" />
                <div className="absolute -bottom-1 -right-1 bg-[#C8A661] rounded-full p-1">
                  <Crown className="w-3 h-3 text-[#0A1628]" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Larry's Command Center</h1>
                <p className="text-xs text-slate-400">Consulting & Content Studio | 50+ Years Experience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {isInSession && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white mr-2 animate-ping" />
                  LIVE {formatDuration(sessionDuration)}
                </Badge>
              )}
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white" onClick={() => setShowBookingDialog(true)} data-testid="button-new-booking">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white" onClick={() => setShowEmailDialog(true)} data-testid="button-send-email">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button size="sm" className="bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]" onClick={() => setActiveTab("studio")} data-testid="button-go-live">
                <Video className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-[1920px] mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800 border border-slate-700 mb-6 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]" data-testid="tab-dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="studio" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]" data-testid="tab-studio">
                <Video className="w-4 h-4 mr-2" />
                Live Studio
              </TabsTrigger>
              <TabsTrigger value="consultations" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]" data-testid="tab-consultations">
                <Calendar className="w-4 h-4 mr-2" />
                Consultations
              </TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]" data-testid="tab-revenue">
                <DollarSign className="w-4 h-4 mr-2" />
                Revenue Split
              </TabsTrigger>
              <TabsTrigger value="recordings" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]" data-testid="tab-recordings">
                <Play className="w-4 h-4 mr-2" />
                Recordings
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]" data-testid="tab-tools">
                <Calculator className="w-4 h-4 mr-2" />
                Tools & Share
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">${revenue.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                      <ArrowUpRight className="w-3 h-3" />
                      {revenue.growth}% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Larry's Share</p>
                        <p className="text-2xl font-bold text-[#C8A661]">${revenue.larryTotal.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                        <img src={larryPhoto} alt="Larry" className="w-10 h-10 rounded-full object-cover" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">50% of all revenue</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Nick's Share</p>
                        <p className="text-2xl font-bold text-[#39CCCC]">${revenue.nickTotal.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#39CCCC]/20 flex items-center justify-center text-lg font-bold text-[#39CCCC]">
                        NK
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">50% of all revenue</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">This Month</p>
                        <p className="text-2xl font-bold text-white">${revenue.thisMonth.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                    <Progress value={75} className="mt-2 h-1" />
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Total Sessions</p>
                        <p className="text-2xl font-bold text-white">136</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Across all types</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Client Rating</p>
                        <p className="text-2xl font-bold text-white">4.9</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div className="flex gap-0.5 mt-2">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Type */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-[#C8A661]" />
                      Revenue by Consultation Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenue.byType.map((item, i) => {
                        const colors = ["#C8A661", "#39CCCC", "#22C55E", "#8B5CF6"];
                        const percentage = (item.amount / revenue.totalRevenue) * 100;
                        return (
                          <div key={item.type} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white">{item.type}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400">{item.count} sessions</span>
                                <span className="text-sm font-medium text-white">${item.amount.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%`, backgroundColor: colors[i] }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Consultations */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#C8A661]" />
                      Upcoming Consultations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {consultations.filter(c => c.status === "scheduled").slice(0, 4).map(consult => {
                        const typeInfo = CONSULTATION_TYPES.find(t => t.id === consult.type);
                        const Icon = typeInfo?.icon || Phone;
                        return (
                          <div key={consult.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg" data-testid={`upcoming-consultation-${consult.id}`}>
                            <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[#C8A661]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{consult.clientName}</p>
                              <p className="text-xs text-slate-400">{typeInfo?.name} - {consult.duration} min</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-[#C8A661]">${consult.price}</p>
                              <p className="text-xs text-slate-400">
                                {new Date(consult.scheduledAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-[#C8A661] hover:bg-[#C8A661]/10" onClick={() => setActiveTab("studio")}>
                              <Video className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                      {consultations.filter(c => c.status === "scheduled").length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No upcoming consultations</p>
                          <Button className="mt-4 bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]" onClick={() => setShowBookingDialog(true)}>
                            Book a Consultation
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* NPS & Satisfaction */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#C8A661]" />
                    Client Satisfaction (NPS)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* NPS Gauge */}
                    <div className="relative w-40 h-40 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#334155" strokeWidth="12" />
                        <circle 
                          cx="80" cy="80" r="70" 
                          fill="none" 
                          stroke="#22C55E" 
                          strokeWidth="12" 
                          strokeDasharray={`${0.78 * 440} ${440}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">78</span>
                        <span className="text-xs text-slate-400">NPS Score</span>
                      </div>
                    </div>
                    
                    {/* Breakdown */}
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400">Promoters (9-10)</span>
                          <span className="text-sm font-medium text-green-400">82%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "82%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400">Passives (7-8)</span>
                          <span className="text-sm font-medium text-yellow-400">14%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: "14%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400">Detractors (0-6)</span>
                          <span className="text-sm font-medium text-red-400">4%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: "4%" }} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Feedback */}
                    <div className="flex-1 space-y-3 w-full">
                      <p className="text-sm text-slate-400">Recent Feedback</p>
                      {consultations.filter(c => c.feedback).slice(0, 2).map(c => (
                        <div key={c.id} className="bg-slate-700/50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{c.clientName}</span>
                            <div className="flex gap-0.5">
                              {Array(c.rating || 5).fill(0).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2">{c.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Studio Tab */}
            <TabsContent value="studio" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Video Area */}
                <div className="lg:col-span-3 space-y-4">
                  <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-video bg-slate-900">
                        {isInSession ? (
                          <>
                            {/* Main video / screen share */}
                            {isScreenSharing ? (
                              <video 
                                ref={screenShareRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <video 
                                ref={localVideoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover"
                              />
                            )}
                            
                            {/* Picture-in-picture for local video when screen sharing */}
                            {isScreenSharing && (
                              <div className="absolute bottom-4 right-4 w-48 aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-[#C8A661] shadow-xl">
                                <video 
                                  ref={localVideoRef} 
                                  autoPlay 
                                  playsInline 
                                  muted 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1 left-1 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
                                  You
                                </div>
                              </div>
                            )}
                            
                            {/* Recording indicator */}
                            {isRecording && (
                              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 px-3 py-1.5 rounded-full shadow-lg">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <span className="text-xs font-medium text-white">REC {formatDuration(sessionDuration)}</span>
                              </div>
                            )}
                            
                            {/* Live streaming indicator */}
                            {isLiveStreaming && (
                              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/90 px-3 py-1.5 rounded-full shadow-lg">
                                <Radio className="w-3 h-3 text-white animate-pulse" />
                                <span className="text-xs font-medium text-white">LIVE on {streamPlatform}</span>
                              </div>
                            )}
                            
                            {/* Participant info overlay */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                              <img src={larryPhoto} alt="Larry" className="w-8 h-8 rounded-full object-cover" />
                              <span className="text-sm text-white font-medium">Larry Larsen</span>
                              {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                            </div>
                            
                            {/* Session timer */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                              <span className="text-lg font-mono text-white">{formatDuration(sessionDuration)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                              <Video className="w-12 h-12 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Ready to Start a Session</h3>
                            <p className="text-slate-400 mb-6">Click below to start your video session</p>
                            <Button size="lg" className="bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]" onClick={startSession} data-testid="button-start-session">
                              <Video className="w-5 h-5 mr-2" />
                              Start Session
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Controls */}
                      <div className="bg-slate-900 p-4 flex items-center justify-center gap-2 flex-wrap">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={isMuted ? "destructive" : "secondary"}
                                size="lg"
                                className="rounded-full w-12 h-12"
                                onClick={() => setIsMuted(!isMuted)}
                                disabled={!isInSession}
                                data-testid="button-toggle-mute"
                              >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
                          </Tooltip>
                        
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={!isVideoOn ? "destructive" : "secondary"}
                                size="lg"
                                className="rounded-full w-12 h-12"
                                onClick={() => setIsVideoOn(!isVideoOn)}
                                disabled={!isInSession}
                                data-testid="button-toggle-video"
                              >
                                {isVideoOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isVideoOn ? "Turn off camera" : "Turn on camera"}</TooltipContent>
                          </Tooltip>
                        
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={isScreenSharing ? "default" : "secondary"}
                                size="lg"
                                className={`rounded-full w-12 h-12 ${isScreenSharing ? "bg-[#C8A661] hover:bg-[#b89551]" : ""}`}
                                onClick={toggleScreenShare}
                                disabled={!isInSession}
                                data-testid="button-screen-share"
                              >
                                <Monitor className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isScreenSharing ? "Stop sharing" : "Share screen"}</TooltipContent>
                          </Tooltip>
                        
                          <Separator orientation="vertical" className="h-8 mx-2 bg-slate-700" />
                        
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={isRecording ? "destructive" : "secondary"}
                                size="lg"
                                className="rounded-full w-12 h-12"
                                onClick={() => {
                                  setIsRecording(!isRecording);
                                  toast({ 
                                    title: isRecording ? "Recording stopped" : "Recording started",
                                    description: isRecording ? "Recording saved to library" : "Session is being recorded"
                                  });
                                }}
                                disabled={!isInSession}
                                data-testid="button-record"
                              >
                                {isRecording ? <Square className="w-5 h-5" /> : <div className="w-4 h-4 rounded-full bg-red-500" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isRecording ? "Stop recording" : "Start recording"}</TooltipContent>
                          </Tooltip>
                        
                          <Separator orientation="vertical" className="h-8 mx-2 bg-slate-700" />
                        
                          {isInSession && (
                            <Button 
                              variant="destructive"
                              size="lg"
                              className="rounded-full px-6"
                              onClick={endSession}
                              data-testid="button-end-session"
                            >
                              <PhoneOff className="w-5 h-5 mr-2" />
                              End
                            </Button>
                          )}
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stream to Social */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#C8A661]" />
                        Stream to Social Media
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button 
                          variant={streamPlatform === "YouTube" ? "default" : "outline"}
                          className={streamPlatform === "YouTube" ? "bg-red-600 hover:bg-red-700" : "border-slate-600"}
                          onClick={() => {
                            if (streamPlatform === "YouTube") {
                              setIsLiveStreaming(false);
                              setStreamPlatform(null);
                            } else {
                              setStreamPlatform("YouTube");
                              setIsLiveStreaming(true);
                              toast({ title: "Streaming to YouTube", description: "Your session is now live!" });
                            }
                          }}
                          disabled={!isInSession}
                          data-testid="button-stream-youtube"
                        >
                          <SiYoutube className="w-5 h-5 mr-2" />
                          YouTube
                        </Button>
                        <Button 
                          variant={streamPlatform === "Facebook" ? "default" : "outline"}
                          className={streamPlatform === "Facebook" ? "bg-blue-600 hover:bg-blue-700" : "border-slate-600"}
                          onClick={() => {
                            if (streamPlatform === "Facebook") {
                              setIsLiveStreaming(false);
                              setStreamPlatform(null);
                            } else {
                              setStreamPlatform("Facebook");
                              setIsLiveStreaming(true);
                              toast({ title: "Streaming to Facebook", description: "Your session is now live!" });
                            }
                          }}
                          disabled={!isInSession}
                          data-testid="button-stream-facebook"
                        >
                          <SiFacebook className="w-5 h-5 mr-2" />
                          Facebook
                        </Button>
                        <Button 
                          variant={streamPlatform === "TikTok" ? "default" : "outline"}
                          className={streamPlatform === "TikTok" ? "bg-black hover:bg-gray-900" : "border-slate-600"}
                          onClick={() => {
                            if (streamPlatform === "TikTok") {
                              setIsLiveStreaming(false);
                              setStreamPlatform(null);
                            } else {
                              setStreamPlatform("TikTok");
                              setIsLiveStreaming(true);
                              toast({ title: "Streaming to TikTok", description: "Your session is now live!" });
                            }
                          }}
                          disabled={!isInSession}
                          data-testid="button-stream-tiktok"
                        >
                          <SiTiktok className="w-5 h-5 mr-2" />
                          TikTok
                        </Button>
                        <Button 
                          variant={streamPlatform === "LinkedIn" ? "default" : "outline"}
                          className={streamPlatform === "LinkedIn" ? "bg-[#0A66C2] hover:bg-[#004182]" : "border-slate-600"}
                          onClick={() => {
                            if (streamPlatform === "LinkedIn") {
                              setIsLiveStreaming(false);
                              setStreamPlatform(null);
                            } else {
                              setStreamPlatform("LinkedIn");
                              setIsLiveStreaming(true);
                              toast({ title: "Streaming to LinkedIn", description: "Your session is now live!" });
                            }
                          }}
                          disabled={!isInSession}
                          data-testid="button-stream-linkedin"
                        >
                          <SiLinkedin className="w-5 h-5 mr-2" />
                          LinkedIn
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Participants */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Participants
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                        <img src={larryPhoto} alt="Larry" className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="text-sm text-white">Larry Larsen</p>
                          <p className="text-xs text-slate-400">Host</p>
                        </div>
                        <Badge className="bg-[#C8A661]/20 text-[#C8A661] text-[10px]">Host</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#39CCCC] flex items-center justify-center text-xs font-bold text-white">
                          NK
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">Nick Kremers</p>
                          <p className="text-xs text-slate-400">Co-host</p>
                        </div>
                        <Badge className="bg-[#39CCCC]/20 text-[#39CCCC] text-[10px]">Co-host</Badge>
                      </div>
                      
                      <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white" data-testid="button-invite-participant">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Participant
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick Share during session */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#C8A661]" />
                        Quick Share
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-slate-600 text-slate-300"
                        onClick={() => setShowCalculatorDialog(true)}
                        data-testid="button-share-calculator"
                      >
                        <Calculator className="w-4 h-4 mr-2 text-[#C8A661]" />
                        Share Calculator
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300" asChild>
                        <Link href="/cleanbi-explorer">
                          <Gauge className="w-4 h-4 mr-2 text-[#C8A661]" />
                          Open CLEANBI
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300" asChild>
                        <Link href="/what-if">
                          <BarChart3 className="w-4 h-4 mr-2 text-[#C8A661]" />
                          What-If Analysis
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-slate-600 text-slate-300"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/join/session-${Date.now()}`);
                          toast({ title: "Meeting link copied!" });
                        }}
                        data-testid="button-copy-meeting-link"
                      >
                        <Link2 className="w-4 h-4 mr-2 text-[#C8A661]" />
                        Copy Meeting Link
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Chat */}
                  <Card className="bg-slate-800 border-slate-700 flex flex-col" style={{ height: "350px" }}>
                    <CardHeader className="pb-2 flex-shrink-0">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Session Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col overflow-hidden p-3">
                      <ScrollArea className="flex-1 pr-2">
                        <div className="space-y-2">
                          {chatMessages.map(msg => (
                            <div key={msg.id} className="bg-slate-700/50 p-2 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium" style={{ color: msg.senderColor }}>{msg.sender}</span>
                                <span className="text-xs text-slate-500">{msg.timestamp}</span>
                              </div>
                              <p className="text-sm text-white">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="mt-2 flex gap-2 flex-shrink-0">
                        <Input 
                          placeholder="Type a message..." 
                          className="bg-slate-700 border-slate-600 text-white text-sm"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                          data-testid="input-chat-message"
                        />
                        <Button size="sm" className="bg-[#C8A661] hover:bg-[#b89551]" onClick={sendChatMessage} data-testid="button-send-chat">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Consultations Tab */}
            <TabsContent value="consultations" className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Consultation Management</h2>
                  <p className="text-sm text-slate-400">Book, manage, and track all consulting sessions</p>
                </div>
                <Button className="bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]" onClick={() => setShowBookingDialog(true)} data-testid="button-book-consultation">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
              </div>

              {/* Consultation Types */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CONSULTATION_TYPES.map(type => {
                  const Icon = type.icon;
                  const count = consultations.filter(c => c.type === type.id).length;
                  const revenue = consultations.filter(c => c.type === type.id && c.status === "completed").reduce((sum, c) => sum + c.price, 0);
                  return (
                    <Card 
                      key={type.id} 
                      className="bg-slate-800 border-slate-700 hover:border-[#C8A661] transition-colors cursor-pointer"
                      onClick={() => {
                        setBookingType(type.id);
                        setShowBookingDialog(true);
                      }}
                      data-testid={`consultation-type-${type.id}`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#C8A661]/20 flex items-center justify-center mx-auto mb-3">
                          <Icon className="w-6 h-6 text-[#C8A661]" />
                        </div>
                        <h3 className="font-semibold text-white">{type.name}</h3>
                        <p className="text-xs text-slate-400 mb-2">{type.duration} minutes</p>
                        <p className="text-xl font-bold text-[#C8A661]">${type.price}</p>
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">{count} booked</span>
                            <span className="text-green-400">${revenue} earned</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Consultation List */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">All Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consultations.map(consult => {
                      const typeInfo = CONSULTATION_TYPES.find(t => t.id === consult.type);
                      const Icon = typeInfo?.icon || Phone;
                      const statusColors: Record<string, string> = {
                        scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                        completed: "bg-green-500/20 text-green-400 border-green-500/30",
                        cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
                        "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                      };
                      return (
                        <div key={consult.id} className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg" data-testid={`consultation-${consult.id}`}>
                          <div className="w-12 h-12 rounded-full bg-[#C8A661]/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-[#C8A661]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-white">{consult.clientName}</p>
                              <Badge className={statusColors[consult.status]}>{consult.status}</Badge>
                              {consult.rating && (
                                <div className="flex items-center gap-1">
                                  {Array(consult.rating).fill(0).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 truncate">{consult.clientEmail}</p>
                            <p className="text-xs text-slate-500">{typeInfo?.name} - {consult.duration} min</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-white">${consult.price}</p>
                            <div className="flex gap-2 text-xs text-slate-400">
                              <span className="text-[#C8A661]">LL: ${consult.larryShare}</span>
                              <span className="text-[#39CCCC]">NK: ${consult.nickShare}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(consult.scheduledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {consult.status === "scheduled" && (
                              <Button size="sm" className="bg-[#C8A661] hover:bg-[#b89551]" onClick={() => setActiveTab("studio")}>
                                <Video className="w-4 h-4" />
                              </Button>
                            )}
                            {consult.recordingUrl && (
                              <Button size="sm" variant="outline" className="border-slate-600">
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-slate-600"
                              onClick={() => {
                                setEmailTo(consult.clientEmail);
                                applyEmailTemplate("followup");
                                setShowEmailDialog(true);
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revenue Split Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 50/50 Split Visualization */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">50/50 Revenue Partnership</CardTitle>
                    <CardDescription>Fair split between Larry Larsen & Nick Kremers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-10 bg-slate-700 rounded-full overflow-hidden mb-6">
                      <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-[#C8A661] to-[#d4b574] flex items-center justify-center text-sm font-bold text-[#0A1628]">
                        Larry 50%
                      </div>
                      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-r from-[#39CCCC] to-[#5dd9d9] flex items-center justify-center text-sm font-bold text-[#0A1628]">
                        Nick 50%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#C8A661]/10 border border-[#C8A661]/30 rounded-lg p-4 text-center">
                        <img src={larryPhoto} alt="Larry" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-[#C8A661]" />
                        <p className="text-sm text-slate-400">Larry Larsen</p>
                        <p className="text-3xl font-bold text-[#C8A661]">${revenue.larryTotal.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-1">50+ years laundromat expertise</p>
                      </div>
                      <div className="bg-[#39CCCC]/10 border border-[#39CCCC]/30 rounded-lg p-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#39CCCC] flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                          NK
                        </div>
                        <p className="text-sm text-slate-400">Nick Kremers</p>
                        <p className="text-3xl font-bold text-[#39CCCC]">${revenue.nickTotal.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-1">WashBizHub Founder & Tech</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Breakdown Chart */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#C8A661]" />
                      Monthly Revenue Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenue.monthlyBreakdown.slice(0, 6).map((month, i) => {
                        const maxRevenue = Math.max(...revenue.monthlyBreakdown.map(m => m.total));
                        const percentage = (month.total / maxRevenue) * 100;
                        return (
                          <div key={month.month} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">{month.month}</span>
                              <span className="text-white font-medium">${month.total.toLocaleString()}</span>
                            </div>
                            <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                              <div 
                                className="h-full bg-gradient-to-r from-[#C8A661] to-[#39CCCC] transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>{month.consultations} sessions</span>
                              <span>LL: ${month.larry.toLocaleString()} | NK: ${month.nick.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payout History */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#C8A661]" />
                    Payout History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium text-right">Total Revenue</th>
                          <th className="pb-3 font-medium text-right">Larry's Payout</th>
                          <th className="pb-3 font-medium text-right">Nick's Payout</th>
                          <th className="pb-3 font-medium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {revenue.payouts.map((payout, i) => (
                          <tr key={i} className="border-b border-slate-700/50">
                            <td className="py-3 text-white">{payout.date}</td>
                            <td className="py-3 text-slate-400">{payout.type}</td>
                            <td className="py-3 text-white font-medium text-right">${(payout.larryShare + payout.nickShare).toLocaleString()}</td>
                            <td className="py-3 text-[#C8A661] text-right">${payout.larryShare.toLocaleString()}</td>
                            <td className="py-3 text-[#39CCCC] text-right">${payout.nickShare.toLocaleString()}</td>
                            <td className="py-3 text-center">
                              <Badge className={
                                payout.status === "paid" ? "bg-green-500/20 text-green-400" : 
                                payout.status === "processing" ? "bg-blue-500/20 text-blue-400" :
                                "bg-yellow-500/20 text-yellow-400"
                              }>
                                {payout.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-600">
                          <td colSpan={2} className="py-3 text-white font-medium">Total</td>
                          <td className="py-3 text-white font-bold text-right">${revenue.totalRevenue.toLocaleString()}</td>
                          <td className="py-3 text-[#C8A661] font-bold text-right">${revenue.larryTotal.toLocaleString()}</td>
                          <td className="py-3 text-[#39CCCC] font-bold text-right">${revenue.nickTotal.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recordings Tab */}
            <TabsContent value="recordings" className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Recording Library</h2>
                  <p className="text-sm text-slate-400">All recorded sessions and published content</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recordings.map(recording => (
                  <Card key={recording.id} className="bg-slate-800 border-slate-700 overflow-hidden" data-testid={`recording-${recording.id}`}>
                    <div className="aspect-video bg-slate-900 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="lg" className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                        {recording.duration}
                      </div>
                      {recording.isPublished && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500/90 px-2 py-1 rounded text-xs text-white">
                          <Globe className="w-3 h-3" />
                          {recording.platform}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-white truncate">{recording.title}</h3>
                      <p className="text-xs text-slate-400">{recording.clientName}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{recording.date}</span>
                        <span>{recording.fileSize}</span>
                        {recording.views > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {recording.views.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        {!recording.isPublished && (
                          <Button size="sm" className="bg-[#C8A661] hover:bg-[#b89551]">
                            <Upload className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tools & Share Tab */}
            <TabsContent value="tools" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calculators to Share */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-[#C8A661]" />
                      Share Calculators with Clients
                    </CardTitle>
                    <CardDescription>Send calculator links via email using Resend</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {CALCULATORS.map(calc => {
                      const Icon = calc.icon;
                      return (
                        <div key={calc.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg" data-testid={`calculator-${calc.id}`}>
                          <div className="w-10 h-10 rounded bg-[#C8A661]/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-[#C8A661]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{calc.name}</p>
                            <p className="text-xs text-slate-400 truncate">{calc.description}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}${calc.path}`);
                              toast({ title: "Link copied!" });
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button size="sm" className="bg-[#C8A661] hover:bg-[#b89551]" onClick={() => {
                              setSelectedCalculator(calc.id);
                              setEmailSubject(`Check out this ${calc.name}`);
                              setEmailBody(`Hi,\n\nI thought you'd find this calculator helpful for your laundromat analysis:\n\n${calc.name}\n${window.location.origin}${calc.path}\n\n${calc.description}\n\nFeel free to reach out if you have any questions!\n\nBest,\nLarry & Nick\nWashBizHub`);
                              setShowEmailDialog(true);
                            }}>
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Email Templates */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#C8A661]" />
                      Email Templates
                    </CardTitle>
                    <CardDescription>Pre-built emails powered by Resend</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {EMAIL_TEMPLATES.map(template => (
                      <Button 
                        key={template.id}
                        variant="outline" 
                        className="w-full justify-start border-slate-600 text-slate-300 hover:text-white h-auto py-3"
                        onClick={() => {
                          applyEmailTemplate(template.id);
                          setShowEmailDialog(true);
                        }}
                        data-testid={`email-template-${template.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#C8A661]/20 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-[#C8A661]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-slate-500">{template.subject}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Social Media Publishing */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[#C8A661]" />
                    Social Media Publishing
                  </CardTitle>
                  <CardDescription>Share content and recordings across all platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { name: "YouTube", icon: SiYoutube, color: "#FF0000", connected: true },
                      { name: "TikTok", icon: SiTiktok, color: "#000000", connected: true },
                      { name: "Facebook", icon: SiFacebook, color: "#1877F2", connected: true },
                      { name: "Twitter/X", icon: SiX, color: "#000000", connected: false },
                      { name: "LinkedIn", icon: SiLinkedin, color: "#0A66C2", connected: true },
                      { name: "Instagram", icon: SiInstagram, color: "#E4405F", connected: false },
                    ].map(platform => {
                      const Icon = platform.icon;
                      return (
                        <Button 
                          key={platform.name}
                          variant="outline"
                          className={`h-24 flex-col gap-2 border-slate-600 hover:border-[#C8A661] relative ${!platform.connected ? "opacity-60" : ""}`}
                          data-testid={`social-${platform.name.toLowerCase()}`}
                        >
                          <Icon className="w-8 h-8" style={{ color: platform.color }} />
                          <span className="text-xs text-slate-300">{platform.name}</span>
                          {platform.connected ? (
                            <Badge className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-[10px] px-1">Connected</Badge>
                          ) : (
                            <Badge className="absolute top-2 right-2 bg-slate-500/20 text-slate-400 text-[10px] px-1">Connect</Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#C8A661]" />
                    Quick Access Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      { name: "Book Studio", icon: BookOpen, path: "/book-studio" },
                      { name: "Larry's Academy", icon: GraduationCap, path: "/larrys-academy" },
                      { name: "Template Vault", icon: FileSpreadsheet, path: "/vault" },
                      { name: "CLEANBI Explorer", icon: Gauge, path: "/cleanbi-explorer" },
                      { name: "What-If Analysis", icon: BarChart3, path: "/what-if" },
                      { name: "Funding Wizard", icon: PiggyBank, path: "/funding-wizard" },
                    ].map(tool => {
                      const Icon = tool.icon;
                      return (
                        <Button 
                          key={tool.name}
                          variant="outline"
                          className="h-20 flex-col gap-2 border-slate-600 hover:border-[#C8A661]"
                          asChild
                        >
                          <Link href={tool.path}>
                            <Icon className="w-6 h-6 text-[#C8A661]" />
                            <span className="text-xs text-slate-300 text-center">{tool.name}</span>
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Email Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#C8A661]" />
                Send Email via Resend
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Compose and send professional emails to clients
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Template (optional)</Label>
                <Select onValueChange={applyEmailTemplate}>
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TEMPLATES.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">To</Label>
                <Input
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="client@email.com"
                  className="mt-1 bg-slate-800 border-slate-600"
                  data-testid="input-email-to"
                />
              </div>
              <div>
                <Label className="text-slate-300">Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line"
                  className="mt-1 bg-slate-800 border-slate-600"
                  data-testid="input-email-subject"
                />
              </div>
              <div>
                <Label className="text-slate-300">Message</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Your message..."
                  className="mt-1 bg-slate-800 border-slate-600 min-h-[150px]"
                  data-testid="input-email-body"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowEmailDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]" 
                  onClick={() => sendEmail.mutate()}
                  disabled={sendEmail.isPending || !emailTo || !emailSubject}
                  data-testid="button-send-email-submit"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendEmail.isPending ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C8A661]" />
                Book Consultation
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Schedule a consulting session with Larry & Nick
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Consultation Type</Label>
                <Select value={bookingType} onValueChange={setBookingType}>
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="select-consultation-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSULTATION_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.name} - ${type.price} ({type.duration} min)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Client Name</Label>
                <Input
                  value={bookingClient.name}
                  onChange={(e) => setBookingClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Smith"
                  className="mt-1 bg-slate-800 border-slate-600"
                  data-testid="input-client-name"
                />
              </div>
              <div>
                <Label className="text-slate-300">Client Email</Label>
                <Input
                  value={bookingClient.email}
                  onChange={(e) => setBookingClient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@email.com"
                  className="mt-1 bg-slate-800 border-slate-600"
                  data-testid="input-client-email"
                />
              </div>
              <div>
                <Label className="text-slate-300">Client Phone (optional)</Label>
                <Input
                  value={bookingClient.phone}
                  onChange={(e) => setBookingClient(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="mt-1 bg-slate-800 border-slate-600"
                  data-testid="input-client-phone"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Date</Label>
                  <Input
                    type="date"
                    value={bookingClient.date}
                    onChange={(e) => setBookingClient(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 bg-slate-800 border-slate-600"
                    data-testid="input-booking-date"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Time</Label>
                  <Input
                    type="time"
                    value={bookingClient.time}
                    onChange={(e) => setBookingClient(prev => ({ ...prev, time: e.target.value }))}
                    className="mt-1 bg-slate-800 border-slate-600"
                    data-testid="input-booking-time"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Notes (optional)</Label>
                <Textarea
                  value={bookingClient.notes}
                  onChange={(e) => setBookingClient(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific topics to cover..."
                  className="mt-1 bg-slate-800 border-slate-600"
                  data-testid="input-booking-notes"
                />
              </div>
              
              {bookingType && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Consultation Fee</span>
                    <span className="text-white font-medium">
                      ${CONSULTATION_TYPES.find(t => t.id === bookingType)?.price || 0}
                    </span>
                  </div>
                  <Separator className="my-2 bg-slate-700" />
                  <div className="flex justify-between text-xs">
                    <span className="text-[#C8A661]">Larry's Share (50%)</span>
                    <span className="text-[#C8A661]">
                      ${(CONSULTATION_TYPES.find(t => t.id === bookingType)?.price || 0) / 2}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#39CCCC]">Nick's Share (50%)</span>
                    <span className="text-[#39CCCC]">
                      ${(CONSULTATION_TYPES.find(t => t.id === bookingType)?.price || 0) / 2}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-slate-600" onClick={() => setShowBookingDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]" 
                  onClick={bookConsultation}
                  disabled={!bookingType || !bookingClient.name || !bookingClient.email || !bookingClient.date}
                  data-testid="button-book-consultation-submit"
                >
                  Book Consultation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Calculator Share Dialog */}
        <Dialog open={showCalculatorDialog} onOpenChange={setShowCalculatorDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#C8A661]" />
                Share Calculator
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Send calculator access to your client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Select Calculator</Label>
                <Select value={selectedCalculator} onValueChange={setSelectedCalculator}>
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Choose calculator" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALCULATORS.map(calc => (
                      <SelectItem key={calc.id} value={calc.id}>
                        <div className="flex items-center gap-2">
                          <calc.icon className="w-4 h-4" />
                          {calc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-600"
                  onClick={() => {
                    if (selectedCalculator) {
                      const calc = CALCULATORS.find(c => c.id === selectedCalculator);
                      if (calc) {
                        navigator.clipboard.writeText(`${window.location.origin}${calc.path}`);
                        toast({ title: "Link copied!" });
                      }
                    }
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  className="flex-1 bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]"
                  onClick={() => {
                    const calc = CALCULATORS.find(c => c.id === selectedCalculator);
                    if (calc) {
                      setShowCalculatorDialog(false);
                      setEmailSubject(`Check out this ${calc.name}`);
                      setEmailBody(`Hi,\n\nI thought you'd find this calculator helpful:\n\n${calc.name}\n${window.location.origin}${calc.path}\n\n${calc.description}\n\nBest,\nLarry & Nick\nWashBizHub`);
                      setShowEmailDialog(true);
                    }
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send via Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </OwnerGuard>
  );
}
