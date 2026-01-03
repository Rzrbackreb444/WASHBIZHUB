import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  MapPin,
  FileText,
  Download,
  RefreshCw,
  Check,
  X,
  Crown,
  Zap,
  Star,
  Users,
  DollarSign,
  Building2,
  Camera,
  Eye,
  Brain,
  Target,
  TrendingUp,
  Map,
  BarChart3,
  Home,
  Car,
  Clock,
  Loader2,
  Lock,
  ChevronRight,
  Sparkles,
  Shield,
  Globe,
  Image,
  Video,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Calculator,
  PieChart,
  LineChart,
  Briefcase,
  Award,
  Send,
  CalendarCheck,
  UserCheck
} from "lucide-react";
import {
  GlassmorphismCard,
  GoldBorderCard,
  PremiumBadge,
  HexGrid,
  GlowOrb,
  AnimatedCounter,
  LiveIndicator
} from "@/components/premium-components";

declare global {
  interface Window {
    google: any;
  }
}

interface ReportTier {
  id: "quick" | "standard" | "pro" | "enterprise";
  name: string;
  price: number;
  originalPrice?: number;
  icon: any;
  popular?: boolean;
  bestValue?: boolean;
  description: string;
  deliveryTime: string;
  pageCount: string;
  features: string[];
  charts: string[];
  excluded?: string[];
}

interface ConsultationAddon {
  id: "quick-call" | "deep-dive" | "full-consult";
  name: string;
  duration: string;
  price: number;
  description: string;
  includes: string[];
}

interface PurchasedReport {
  id: string;
  address: string;
  tier: "quick" | "standard" | "pro" | "enterprise";
  status: "pending" | "processing" | "completed" | "failed";
  cleanbiScore?: number;
  grade?: string;
  createdAt: string;
  completedAt?: string;
  pdfUrl?: string;
  consultationBooked?: boolean;
}

const reportTiers: ReportTier[] = [
  {
    id: "quick",
    name: "Quick Score",
    price: 29,
    icon: Zap,
    bestValue: true,
    description: "Instant grade + verdict. Perfect for initial screening.",
    deliveryTime: "Instant",
    pageCount: "1-page",
    features: [
      "CLEANBI Letter Grade (A/B/C)",
      "Pass/Fail Verdict",
      "3 Key Risk Factors",
      "Competition Count",
      "Email Delivery"
    ],
    charts: [],
    excluded: [
      "Demographic Breakdown",
      "Full Competitor Map",
      "Financial Projections",
      "AI Recommendations"
    ]
  },
  {
    id: "standard",
    name: "Location Intelligence",
    price: 149,
    originalPrice: 199,
    icon: Target,
    popular: true,
    description: "Complete location analysis with charts and data.",
    deliveryTime: "2-4 hours",
    pageCount: "12-page",
    features: [
      "Everything in Quick Score, plus:",
      "17-Factor CLEANBI Score",
      "Population & Demographics",
      "Median Income Analysis",
      "Competitor Mapping (3-mile)",
      "Traffic Pattern Score",
      "Renter % Analysis",
      "PDF Report Download",
      "Email Delivery"
    ],
    charts: [
      "Demographics Pie Chart",
      "Competition Heat Map",
      "Income Distribution Bar"
    ],
    excluded: [
      "Vision AI Analysis",
      "ROI Projections",
      "Larry Consultation"
    ]
  },
  {
    id: "pro",
    name: "Due Diligence",
    price: 349,
    icon: Briefcase,
    description: "Bank-ready package with AI insights and valuations.",
    deliveryTime: "24 hours",
    pageCount: "25-page",
    features: [
      "Everything in Location Intelligence, plus:",
      "Vision AI Photo Analysis",
      "Street View Assessment",
      "Parking & Visibility Score",
      "Property Condition Rating",
      "Competitor Deep Dive (ratings, reviews)",
      "AI-Generated Recommendations",
      "3-Method Valuation Range",
      "ROI Projections (3-5 year)",
      "SBA Loan Readiness Score",
      "Priority Processing"
    ],
    charts: [
      "All Standard Charts, plus:",
      "Traffic Trends Line Chart",
      "Valuation Comparison Bar",
      "ROI Projection Graph",
      "Competitor Rating Radar"
    ],
    excluded: [
      "Aerial Flyover Video",
      "Analyst Review"
    ]
  },
  {
    id: "enterprise",
    name: "Acquisition Ready",
    price: 599,
    originalPrice: 799,
    icon: Crown,
    description: "Complete investor package with expert review.",
    deliveryTime: "48-72 hours",
    pageCount: "40+ page",
    features: [
      "Everything in Due Diligence, plus:",
      "Aerial View 3D Flyover",
      "Satellite Imagery Analysis",
      "Video Walkthrough Export",
      "Custom Location Comparisons",
      "Investment ROI Projections",
      "Market Trend Forecasting",
      "Dedicated Analyst Review",
      "30-min Larry Consultation INCLUDED",
      "White-Label Report Option"
    ],
    charts: [
      "All Pro Charts, plus:",
      "Market Growth Forecast",
      "Investment Timeline",
      "Break-Even Analysis",
      "5-Year Cash Flow"
    ]
  }
];

const consultationAddons: ConsultationAddon[] = [
  {
    id: "quick-call",
    name: "Quick Call with Larry",
    duration: "15 min",
    price: 49,
    description: "Get Larry's quick take on your location",
    includes: [
      "Review of your report findings",
      "Top 3 action items",
      "Go/No-Go recommendation"
    ]
  },
  {
    id: "deep-dive",
    name: "Deep Dive Session",
    duration: "30 min",
    price: 99,
    description: "Detailed analysis walk-through",
    includes: [
      "Full report review",
      "Negotiation strategies",
      "Equipment recommendations",
      "Financing guidance"
    ]
  },
  {
    id: "full-consult",
    name: "Full Consultation",
    duration: "60 min",
    price: 199,
    description: "Comprehensive deal evaluation",
    includes: [
      "Everything in Deep Dive",
      "Due diligence checklist review",
      "Lease red flag analysis",
      "Custom action plan",
      "Follow-up email summary"
    ]
  }
];

const featureComparison = [
  { feature: "CLEANBI Letter Grade", quick: true, standard: true, pro: true, enterprise: true },
  { feature: "Pass/Fail Verdict", quick: true, standard: true, pro: true, enterprise: true },
  { feature: "17-Factor Score Breakdown", quick: false, standard: true, pro: true, enterprise: true },
  { feature: "Demographics & Income Data", quick: false, standard: true, pro: true, enterprise: true },
  { feature: "Competitor Mapping (3-mile)", quick: false, standard: true, pro: true, enterprise: true },
  { feature: "Charts & Visualizations", quick: false, standard: true, pro: true, enterprise: true },
  { feature: "Vision AI Photo Analysis", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "3-Method Valuation", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "ROI Projections", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "AI Recommendations", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "Aerial 3D Flyover", quick: false, standard: false, pro: false, enterprise: true },
  { feature: "Dedicated Analyst Review", quick: false, standard: false, pro: false, enterprise: true },
  { feature: "30-min Larry Consultation", quick: false, standard: false, pro: false, enterprise: true },
  { feature: "White-Label Option", quick: false, standard: false, pro: false, enterprise: true },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: Clock },
  processing: { bg: "bg-blue-500/20", text: "text-blue-400", icon: Loader2 },
  completed: { bg: "bg-green-500/20", text: "text-green-400", icon: CheckCircle2 },
  failed: { bg: "bg-red-500/20", text: "text-red-400", icon: AlertCircle },
};

export default function LocationReports() {
  const { toast } = useToast();
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [address, setAddress] = useState("");
  const [selectedTier, setSelectedTier] = useState<"quick" | "standard" | "pro" | "enterprise">("standard");
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("order");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [captureEmail, setCaptureEmail] = useState("");
  const [showTeaserPreview, setShowTeaserPreview] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState(847);
  const [teaserData, setTeaserData] = useState<{
    grade: string;
    score: number;
    competitorCount: number;
    marketPotential: "High" | "Moderate" | "Research Needed";
    dataQuality: string;
    disclaimer: string;
  } | null>(null);
  const [teaserLoading, setTeaserLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const addressParam = params.get("address");
    if (addressParam) {
      setAddress(addressParam);
      // Automatically fetch teaser for addresses coming from homepage
      setShowEmailCapture(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentAnalyses(prev => prev + Math.floor(Math.random() * 2));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const { data: myReports, isLoading: reportsLoading } = useQuery<PurchasedReport[]>({
    queryKey: ["/api/cleanbi/reports"],
    enabled: isAuthenticated,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: { address: string; tier: string; consultationAddon?: string }) => {
      const response = await apiRequest("POST", "/api/cleanbi/checkout", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Checkout Error",
          description: "Failed to create checkout session.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const emailCaptureMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", {
        email,
        source: "location_reports_teaser",
        leadMagnet: "cleanbi_teaser_preview"
      });
      return response.json();
    },
    onSuccess: () => {
      setShowEmailCapture(false);
      // After email capture, fetch the real teaser
      fetchTeaser();
    }
  });

  const fetchTeaser = async () => {
    if (!address.trim()) return;
    
    setTeaserLoading(true);
    try {
      const response = await apiRequest("POST", "/api/cleanbi/teaser", { address });
      const data = await response.json();
      
      if (data.success && data.teaser) {
        setTeaserData(data.teaser);
        setShowTeaserPreview(true);
        toast({
          title: "Location Analyzed!",
          description: "See your real CLEANBI score below.",
        });
      } else if (data.fallback) {
        // API failed, show fallback
        toast({
          title: "Analysis Unavailable",
          description: "Unable to analyze this location. Please try a different address.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      if (error.message?.includes("429")) {
        toast({
          title: "Rate Limit Reached",
          description: "You've used your free previews. Purchase a report for full analysis.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setTeaserLoading(false);
    }
  };

  useEffect(() => {
    const loadGooglePlaces = () => {
      if (window.google && addressInputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          { types: ["address"], componentRestrictions: { country: "us" } }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            setAddress(place.formatted_address);
          }
        });
      }
    };

    if (window.google) {
      loadGooglePlaces();
    }
  }, []);

  const handleAnalyzeTeaser = () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to analyze.",
        variant: "destructive",
      });
      return;
    }
    setShowEmailCapture(true);
  };

  const handleGenerateReport = () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a valid address to analyze.",
        variant: "destructive",
      });
      return;
    }

    checkoutMutation.mutate({ 
      address, 
      tier: selectedTier,
      consultationAddon: selectedConsultation || undefined
    });
  };

  const selectedTierData = reportTiers.find(t => t.id === selectedTier)!;
  const selectedConsultationData = consultationAddons.find(c => c.id === selectedConsultation);
  
  const totalPrice = selectedTierData.price + (selectedConsultationData?.price || 0);
  const enterpriseHasConsultation = selectedTier === "enterprise";

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  // Comprehensive SEO/AEO/E-E-A-T structured data
  const locationReportsSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${baseUrl}/location-reports#service`,
    "name": "CLEANBI Location Intelligence Reports",
    "alternateName": ["Laundromat Location Analysis", "Location Intelligence Reports", "CLEANBI Reports"],
    "description": "Professional location intelligence reports for laundromat investments. Get demographics, competition analysis, traffic patterns, ROI projections, and expert consultation. AI-powered analysis with human expert review.",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": baseUrl,
      "logo": `${baseUrl}/washbizhub-logo.png`
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "serviceType": "Location Intelligence Analysis",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Location Report Tiers",
      "itemListElement": [
        {
          "@type": "Offer",
          "name": "Quick Score Report",
          "description": "Instant CLEANBI grade with pass/fail verdict and 3 key risk factors",
          "price": "29.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Location Intelligence Report",
          "description": "12-page comprehensive analysis with demographics, competition mapping, and traffic patterns",
          "price": "149.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Due Diligence Pro Report",
          "description": "25-page deep-dive with Vision AI analysis, ROI projections, and negotiation leverage",
          "price": "349.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Acquisition Ready Report",
          "description": "Complete 40+ page investment package with Larry Larsen consultation included",
          "price": "599.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "847",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <>
      <SEO
        title="Premium Location Reports - AI-Powered Laundromat Analysis | WashBizHub"
        description="Get data-rich location intelligence reports with demographics, competition analysis, ROI projections, and expert Larry consultation. Reports from $29. Make confident investment decisions."
        canonicalUrl="/location-reports"
        ogType="product"
        keywords={[
          "laundromat location analysis",
          "laundromat due diligence",
          "laundromat investment report",
          "CLEANBI score",
          "laundromat demographics",
          "laundromat competition analysis",
          "laundromat ROI calculator",
          "laundromat valuation",
          "coin laundry location report",
          "laundromat site selection"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Analysis Suite", url: "/cleanbi" },
          { name: "Location Reports", url: "/location-reports" }
        ]}
        author={{
          name: "Larry Larsen",
          expertise: "Laundromat Industry Expert & Consultant",
          credentials: "40+ years laundromat experience, 500+ deals analyzed, industry educator and speaker"
        }}
        faqs={[
          {
            question: "What is a CLEANBI Location Intelligence Report?",
            answer: "A CLEANBI Location Intelligence Report is a comprehensive analysis of any US address for laundromat investment potential. It includes demographics (population, income, renter percentage), competition mapping within 3 miles, traffic patterns, and an AI-calculated CLEANBI score from A to C grade. Reports range from $29 Quick Score to $599 Acquisition Ready packages."
          },
          {
            question: "How accurate is the CLEANBI scoring system?",
            answer: "CLEANBI uses a proprietary 17-factor weighted algorithm analyzing demographics, competition density, traffic patterns, income levels, renter percentages, and more. The system has been validated against 500+ actual laundromat transactions and is continuously refined based on real-world performance data."
          },
          {
            question: "What's included in the $29 Quick Score report?",
            answer: "The Quick Score provides an instant CLEANBI letter grade (A/B/C), pass/fail verdict, 3 key risk factors, competition count within the area, and email delivery. It's perfect for initial screening before investing in a full analysis."
          },
          {
            question: "Can I speak with an expert about my report?",
            answer: "Yes! All report tiers offer optional Larry Larsen consultation add-ons: 15-minute Quick Call ($49), 30-minute Deep Dive ($99), or 60-minute Full Consultation ($199). The Enterprise tier ($599) includes a 60-minute consultation at no extra cost."
          },
          {
            question: "How long does it take to receive my report?",
            answer: "Quick Score reports are delivered instantly. Location Intelligence reports take 2-4 hours. Due Diligence Pro reports take 4-8 hours. Acquisition Ready reports take 24-48 hours due to the comprehensive human review and analysis involved."
          }
        ]}
        howTo={{
          name: "How to Order a CLEANBI Location Report",
          description: "Step-by-step guide to ordering your laundromat location intelligence report",
          steps: [
            { name: "Enter Address", text: "Enter any US address in the search box. Our Google Places integration ensures accurate address formatting." },
            { name: "Preview Free Teaser", text: "Click 'Free Preview' to see a blurred sample of what your report will include. Enter your email to unlock the teaser." },
            { name: "Select Report Tier", text: "Choose from Quick Score ($29), Location Intelligence ($149), Due Diligence Pro ($349), or Acquisition Ready ($599) based on your needs." },
            { name: "Add Consultation (Optional)", text: "Optionally add a Larry Larsen consultation call for expert guidance on your specific location." },
            { name: "Complete Purchase", text: "Securely checkout with Stripe. Your report will be delivered to your email within the specified timeframe." }
          ],
          totalTime: "PT5M"
        }}
        productOffers={[
          { name: "Quick Score Report", description: "Instant CLEANBI grade with pass/fail verdict", price: "29", priceCurrency: "USD", availability: "InStock" },
          { name: "Location Intelligence Report", description: "12-page comprehensive location analysis", price: "149", priceCurrency: "USD", availability: "InStock" },
          { name: "Due Diligence Pro Report", description: "25-page deep-dive with Vision AI", price: "349", priceCurrency: "USD", availability: "InStock" },
          { name: "Acquisition Ready Report", description: "40+ page complete investment package", price: "599", priceCurrency: "USD", availability: "InStock" }
        ]}
        softwareApplication={{
          name: "CLEANBI Location Intelligence",
          alternateName: ["CLEANBI Analyzer", "Laundromat Location Score", "CLEANBI Reports"],
          description: "AI-powered location intelligence platform for laundromat investments. Analyzes demographics, competition, traffic, and generates comprehensive investment reports.",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web Browser",
          featureList: [
            "17-Factor CLEANBI Scoring Algorithm",
            "Demographics Analysis",
            "Competition Heat Mapping",
            "Traffic Pattern Analysis",
            "ROI Projections",
            "Vision AI Property Analysis",
            "PDF Report Generation",
            "Expert Consultation Booking"
          ],
          offers: [
            { name: "Quick Score", description: "Instant screening report", price: "29", priceCurrency: "USD", availability: "InStock" },
            { name: "Location Intelligence", description: "Comprehensive analysis", price: "149", priceCurrency: "USD", availability: "InStock" }
          ],
          ratingValue: 4.9,
          reviewCount: 847
        }}
        aggregateRating={{
          itemName: "CLEANBI Location Reports",
          itemType: "Service",
          itemDescription: "Professional location intelligence reports for laundromat investments",
          ratingValue: 4.9,
          reviewCount: 847,
          bestRating: 5,
          worstRating: 1
        }}
        structuredData={locationReportsSchema}
        speakableContent={[
          "CLEANBI Location Intelligence Reports provide comprehensive analysis for laundromat investments.",
          "Reports start at $29 for Quick Score and go up to $599 for Acquisition Ready packages.",
          "All reports include demographics, competition analysis, and AI-powered insights."
        ]}
      />

      <div className="min-h-screen" style={{ background: '#09090b' }}>
        <HexGrid opacity={0.02} />
        
        <section className="relative py-16 overflow-hidden">
          <div className="absolute top-20 right-20 opacity-15 pointer-events-none">
            <GlowOrb size="lg" color="gold" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <LiveIndicator status="online" />
                <span className="text-sm text-gray-400">
                  <AnimatedCounter value={recentAnalyses} duration={1000} /> locations analyzed this month
                </span>
              </div>

              <h1 
                className="text-white leading-tight mb-4"
                style={{ fontFamily: 'var(--font-bebas)' }}
                data-testid="heading-location-reports"
              >
                <span className="block text-[clamp(2.5rem,6vw,4.5rem)] tracking-tight">
                  PREMIUM LOCATION
                </span>
                <span className="block text-[clamp(2.5rem,6vw,4.5rem)] tracking-tight text-[#d4af37]">
                  INTELLIGENCE REPORTS
                </span>
              </h1>

              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
                Data-rich reports with charts, valuations, AI insights, and optional Larry consultation.
                Make confident investment decisions.
              </p>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                {[
                  { icon: PieChart, label: "Demographics Charts" },
                  { icon: Map, label: "Competition Heat Maps" },
                  { icon: LineChart, label: "ROI Projections" },
                  { icon: MessageCircle, label: "Larry Consultation" }
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-[#C8A661]" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="order" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#09090b]" data-testid="tab-order">
                  <FileText className="h-4 w-4 mr-2" />
                  Order Report
                </TabsTrigger>
                <TabsTrigger value="my-reports" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#09090b]" data-testid="tab-my-reports">
                  <Download className="h-4 w-4 mr-2" />
                  My Reports
                  {myReports && myReports.length > 0 && (
                    <Badge className="ml-2 bg-white/20" variant="secondary">
                      {myReports.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="order" className="space-y-12">
                <GoldBorderCard variant="thin">
                  <div className="p-6 bg-[#0a0a0c]">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-[#C8A661]" />
                      <h2 className="text-xl font-bold text-white">Enter Location Address</h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Search for any US address to analyze its potential as a laundromat location
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8A661]" />
                        <Input
                          ref={addressInputRef}
                          type="text"
                          placeholder="Enter address (e.g., 123 Main St, City, State)"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="pl-12 h-14 text-lg bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                          data-testid="input-address"
                        />
                      </div>
                      <Button
                        onClick={handleAnalyzeTeaser}
                        disabled={!address.trim()}
                        className="h-14 px-6 bg-transparent border border-[#C8A661] text-[#C8A661] hover:bg-[#C8A661]/10"
                        data-testid="button-free-preview"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Free Preview
                      </Button>
                    </div>
                    
                    {address && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Address selected: {address}</span>
                      </div>
                    )}
                  </div>
                </GoldBorderCard>

                {(showTeaserPreview || teaserLoading) && address && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-center text-sm text-gray-500 mb-3 italic">
                      Built for laundromats. Works anywhere.
                    </p>
                    <GlassmorphismCard intensity="medium" glowColor="gold">
                      <div className="p-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b]/90 pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                            Free Preview
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {teaserLoading ? "Analyzing..." : "AI-Analyzed"}
                          </Badge>
                        </div>

                        {teaserLoading ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-10 h-10 text-[#C8A661] animate-spin mb-4" />
                            <p className="text-white font-medium">Analyzing location...</p>
                            <p className="text-gray-400 text-sm mt-1">Checking competitors, demographics, and market data</p>
                          </div>
                        ) : teaserData ? (
                          <>
                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                              <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className={`text-4xl font-black mb-1 ${
                                  teaserData.grade === 'A' ? 'text-green-400' :
                                  teaserData.grade === 'B' ? 'text-[#C8A661]' :
                                  teaserData.grade === 'C' ? 'text-amber-400' :
                                  'text-orange-400'
                                }`} data-testid="text-teaser-grade">{teaserData.grade}</div>
                                <div className="text-sm text-gray-400">CLEANBI Grade</div>
                                <div className="text-xs text-gray-500 mt-1">{teaserData.score}/100</div>
                              </div>
                              <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className="text-4xl font-black text-white mb-1" data-testid="text-competitor-count">{teaserData.competitorCount}</div>
                                <div className="text-sm text-gray-400">Competitors (5mi)</div>
                              </div>
                              <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className={`text-2xl font-black mb-1 ${
                                  teaserData.marketPotential === 'High' ? 'text-green-400' :
                                  teaserData.marketPotential === 'Moderate' ? 'text-amber-400' :
                                  'text-orange-400'
                                }`} data-testid="text-market-potential">{teaserData.marketPotential}</div>
                                <div className="text-sm text-gray-400">Market Potential</div>
                              </div>
                            </div>

                            <div className="relative">
                              <div className="blur-sm opacity-50 pointer-events-none">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="p-3 bg-white/5 rounded">
                                    <span className="text-gray-400">Population (1mi):</span>
                                    <span className="text-white ml-2">••,•••</span>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded">
                                    <span className="text-gray-400">Median Income:</span>
                                    <span className="text-white ml-2">$••,•••</span>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded">
                                    <span className="text-gray-400">Renter %:</span>
                                    <span className="text-white ml-2">••%</span>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded">
                                    <span className="text-gray-400">Traffic Score:</span>
                                    <span className="text-white ml-2">••/100</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center p-4 bg-[#09090b]/90 rounded-lg border border-[#C8A661]/30">
                                  <Lock className="w-6 h-6 text-[#C8A661] mx-auto mb-2" />
                                  <p className="text-white font-semibold mb-1">Unlock Full Analysis</p>
                                  <p className="text-gray-400 text-sm">Purchase a report to see all data</p>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4 italic">
                              {teaserData.disclaimer}
                            </p>
                          </>
                        ) : null}
                      </div>
                    </GlassmorphismCard>
                  </motion.div>
                )}

                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Choose Your Report</h2>
                    <p className="text-gray-400">Select the analysis depth that fits your needs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportTiers.map((tier) => {
                      const Icon = tier.icon;
                      const isSelected = selectedTier === tier.id;

                      return (
                        <motion.div
                          key={tier.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <GlassmorphismCard 
                            intensity={isSelected ? "medium" : "light"} 
                            glowColor={isSelected ? "gold" : undefined}
                            className={`cursor-pointer h-full ${isSelected ? 'ring-2 ring-[#C8A661]' : ''}`}
                            onClick={() => setSelectedTier(tier.id)}
                          >
                            <div className="p-5 relative" data-testid={`card-tier-${tier.id}`}>
                              {tier.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8A661] text-[#09090b]">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Most Popular
                                </Badge>
                              )}
                              {tier.bestValue && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Best Value
                                </Badge>
                              )}

                              <div className="text-center mb-4 pt-2">
                                <div className={`mx-auto mb-3 p-3 rounded-xl w-fit ${
                                  isSelected ? 'bg-[#C8A661]/20' : 'bg-white/10'
                                }`}>
                                  <Icon className={`h-6 w-6 ${isSelected ? 'text-[#C8A661]' : 'text-white'}`} />
                                </div>
                                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">{tier.description}</p>
                                
                                <div className="mt-3">
                                  {tier.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through mr-2">
                                      ${tier.originalPrice}
                                    </span>
                                  )}
                                  <span className="text-3xl font-black text-white">${tier.price}</span>
                                </div>
                                
                                <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {tier.deliveryTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {tier.pageCount}
                                  </span>
                                </div>
                              </div>

                              <Separator className="bg-white/10 my-4" />

                              <ul className="space-y-2">
                                {tier.features.slice(0, 5).map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs">
                                    <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-300">{feature}</span>
                                  </li>
                                ))}
                                {tier.features.length > 5 && (
                                  <li className="text-xs text-[#C8A661] pl-5">
                                    +{tier.features.length - 5} more
                                  </li>
                                )}
                              </ul>

                              {tier.charts.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" />
                                    Included Charts:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {tier.charts.slice(0, 2).map((chart, i) => (
                                      <Badge key={i} variant="outline" className="text-[10px] border-white/20 text-gray-400">
                                        {chart}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <Button
                                className={`w-full mt-4 ${
                                  isSelected
                                    ? "bg-[#C8A661] text-[#09090b] hover:bg-[#b8963d]"
                                    : "bg-white/10 text-white hover:bg-white/20"
                                }`}
                                data-testid={`button-select-${tier.id}`}
                              >
                                {isSelected ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Selected
                                  </>
                                ) : (
                                  "Select"
                                )}
                              </Button>
                            </div>
                          </GlassmorphismCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {selectedTier !== "enterprise" && (
                  <div>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <MessageCircle className="w-5 h-5 text-[#C8A661]" />
                        Add Larry Consultation
                      </h2>
                      <p className="text-gray-400 text-sm">Get expert guidance from Laundromat Larry with 50+ years experience</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      {consultationAddons.map((addon) => {
                        const isSelected = selectedConsultation === addon.id;
                        
                        return (
                          <GlassmorphismCard 
                            key={addon.id}
                            intensity={isSelected ? "medium" : "light"}
                            glowColor={isSelected ? "cyan" : undefined}
                            className={`cursor-pointer ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
                            onClick={() => setSelectedConsultation(isSelected ? null : addon.id)}
                          >
                            <div className="p-4" data-testid={`addon-${addon.id}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-cyan-400" />
                                  <span className="font-semibold text-white text-sm">{addon.name}</span>
                                </div>
                                <Checkbox 
                                  checked={isSelected}
                                  className="border-white/30 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                                />
                              </div>
                              
                              <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-2xl font-bold text-white">+${addon.price}</span>
                                <span className="text-gray-400 text-sm">{addon.duration}</span>
                              </div>
                              
                              <p className="text-gray-400 text-xs mb-3">{addon.description}</p>
                              
                              <ul className="space-y-1">
                                {addon.includes.map((item, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-300">
                                    <Check className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </GlassmorphismCard>
                        );
                      })}
                    </div>
                  </div>
                )}

                {enterpriseHasConsultation && (
                  <div className="max-w-2xl mx-auto">
                    <GlassmorphismCard intensity="light" glowColor="gold">
                      <div className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#C8A661]/20">
                          <CalendarCheck className="w-6 h-6 text-[#C8A661]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">30-min Larry Consultation Included</p>
                          <p className="text-gray-400 text-sm">Enterprise reports include a complimentary strategy call with Larry</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          FREE
                        </Badge>
                      </div>
                    </GlassmorphismCard>
                  </div>
                )}

                <GoldBorderCard variant="thick" animated className="max-w-2xl mx-auto">
                  <div className="p-6 bg-[#0a0a0c]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#C8A661]/20">
                          <selectedTierData.icon className="h-6 w-6 text-[#C8A661]" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{selectedTierData.name} Report</p>
                          <p className="text-sm text-gray-400">{address || "Enter address above"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#C8A661]">${totalPrice}</p>
                        {selectedConsultationData && (
                          <p className="text-xs text-gray-400">
                            Includes {selectedConsultationData.duration} call
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        <FileText className="w-3 h-3 mr-1" />
                        {selectedTierData.pageCount} PDF
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        <Clock className="w-3 h-3 mr-1" />
                        {selectedTierData.deliveryTime}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        <Mail className="w-3 h-3 mr-1" />
                        Email Delivery
                      </Badge>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleGenerateReport}
                      disabled={checkoutMutation.isPending || !address}
                      className="w-full bg-[#C8A661] text-[#09090b] font-bold text-lg py-6 hover:bg-[#b8963d]"
                      data-testid="button-generate-report"
                    >
                      {checkoutMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileText className="h-5 w-5 mr-2" />
                          Generate Report — ${totalPrice}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Lock className="h-4 w-4" />
                        Secure Stripe
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        30-day guarantee
                      </span>
                    </div>
                  </div>
                </GoldBorderCard>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Feature Comparison</CardTitle>
                    <CardDescription className="text-gray-400">
                      Compare what's included in each report tier
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 pr-4 font-medium text-gray-300">Feature</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-300">$29</th>
                          <th className="text-center py-3 px-4 font-medium text-[#C8A661] bg-[#C8A661]/5">$149</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-300">$349</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-300">$599</th>
                        </tr>
                      </thead>
                      <tbody>
                        {featureComparison.map((row, index) => (
                          <tr key={index} className="border-b border-white/5 last:border-0">
                            <td className="py-3 pr-4 text-gray-300">{row.feature}</td>
                            <td className="text-center py-3 px-4">
                              {row.quick ? (
                                <Check className="h-4 w-4 text-green-400 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-gray-600 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-4 bg-[#C8A661]/5">
                              {row.standard ? (
                                <Check className="h-4 w-4 text-green-400 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-gray-600 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-4">
                              {row.pro ? (
                                <Check className="h-4 w-4 text-green-400 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-gray-600 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-4">
                              {row.enterprise ? (
                                <Check className="h-4 w-4 text-green-400 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-gray-600 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="my-reports" className="space-y-8">
                {authLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-400">Loading your reports...</p>
                  </div>
                ) : !isAuthenticated ? (
                  <GlassmorphismCard intensity="light" className="max-w-md mx-auto text-center">
                    <div className="py-12 px-6 space-y-4">
                      <Lock className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="text-xl font-bold text-white">Sign In Required</h3>
                      <p className="text-gray-400">
                        Please sign in to view your purchased reports.
                      </p>
                      <Button
                        onClick={() => (window.location.href = "/api/login")}
                        className="bg-[#C8A661] text-[#09090b] hover:bg-[#b8963d]"
                        data-testid="button-sign-in"
                      >
                        Sign In
                      </Button>
                    </div>
                  </GlassmorphismCard>
                ) : reportsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-400">Loading your reports...</p>
                  </div>
                ) : myReports && myReports.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">Your Reports</h2>
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        {myReports.length} reports
                      </Badge>
                    </div>

                    <div className="grid gap-4">
                      {myReports.map((report) => {
                        const statusConfig = STATUS_COLORS[report.status];
                        const StatusIcon = statusConfig.icon;
                        const tierData = reportTiers.find((t) => t.id === report.tier);

                        return (
                          <GlassmorphismCard key={report.id} intensity="light">
                            <div className="p-6" data-testid={`card-report-${report.id}`}>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[#C8A661]" />
                                    <span className="font-medium text-white">{report.address}</span>
                                    <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                                      {tierData?.name}
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                    <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                                      <StatusIcon className={`h-3 w-3 mr-1 ${report.status === "processing" ? "animate-spin" : ""}`} />
                                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                    </Badge>

                                    {report.cleanbiScore && (
                                      <span className="flex items-center gap-1">
                                        <BarChart3 className="h-4 w-4" />
                                        Score: {report.cleanbiScore}/100 (Grade {report.grade})
                                      </span>
                                    )}

                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {report.status === "completed" && report.pdfUrl && (
                                    <Button
                                      size="sm"
                                      onClick={() => window.open(report.pdfUrl, "_blank")}
                                      className="bg-[#C8A661] text-[#09090b] hover:bg-[#b8963d]"
                                      data-testid={`button-download-${report.id}`}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {report.status === "processing" && (
                                <div className="mt-4 space-y-2">
                                  <Progress value={66} className="h-2 bg-white/10" />
                                  <p className="text-xs text-gray-400">
                                    Analyzing location data... This may take a few minutes.
                                  </p>
                                </div>
                              )}
                            </div>
                          </GlassmorphismCard>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <GlassmorphismCard intensity="light" className="max-w-md mx-auto text-center">
                    <div className="py-12 px-6 space-y-4">
                      <FileText className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="text-xl font-bold text-white">No Reports Yet</h3>
                      <p className="text-gray-400">
                        You haven't purchased any location reports yet.
                        Order your first analysis to get started.
                      </p>
                      <Button 
                        onClick={() => setActiveTab("order")} 
                        className="bg-[#C8A661] text-[#09090b] hover:bg-[#b8963d]"
                        data-testid="button-order-first"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Order Your First Report
                      </Button>
                    </div>
                  </GlassmorphismCard>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="py-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                What's Inside Your Report
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Every report delivers actionable intelligence with rich visualizations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: "17-Factor CLEANBI Score",
                  description: "Comprehensive 0-100 scoring with A/B/C grading based on demographics, competition, visibility, and market potential.",
                  color: "text-purple-400"
                },
                {
                  icon: PieChart,
                  title: "Demographics Charts",
                  description: "Visual breakdowns of population, age distribution, income levels, and renter percentages in pie and bar formats.",
                  color: "text-cyan-400"
                },
                {
                  icon: Map,
                  title: "Competition Heat Map",
                  description: "Interactive map showing all laundromats within 3 miles with ratings, reviews, and distance calculations.",
                  color: "text-red-400"
                },
                {
                  icon: LineChart,
                  title: "ROI Projections",
                  description: "3-5 year financial projections with break-even analysis and cash flow forecasting charts.",
                  color: "text-green-400"
                },
                {
                  icon: Camera,
                  title: "Vision AI Analysis",
                  description: "AI-powered assessment of street-level imagery for parking, visibility, signage potential, and property condition.",
                  color: "text-blue-400"
                },
                {
                  icon: MessageCircle,
                  title: "Larry Consultation",
                  description: "Optional live call with industry expert Larry Larsen to review findings and provide personalized guidance.",
                  color: "text-[#C8A661]"
                }
              ].map((feature, index) => (
                <GlassmorphismCard key={index} intensity="light">
                  <div className="p-6 space-y-4">
                    <div className={`p-3 rounded-xl bg-white/5 w-fit ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </GlassmorphismCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8 text-center text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-400" />
                <span>Secure Stripe Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#C8A661]" />
                <span>Reports in 2-48 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-400" />
                <span>All 50 US States Covered</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={showEmailCapture} onOpenChange={setShowEmailCapture}>
        <DialogContent className="bg-[#0a0a0c] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#C8A661]" />
              Unlock Free Preview
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your email to see a free teaser of your location analysis
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Email Address</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={captureEmail}
                onChange={(e) => setCaptureEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                data-testid="input-capture-email"
              />
            </div>
            
            <Button
              onClick={() => emailCaptureMutation.mutate(captureEmail)}
              disabled={!captureEmail.trim() || emailCaptureMutation.isPending}
              className="w-full bg-[#C8A661] text-[#09090b] hover:bg-[#b8963d]"
              data-testid="button-unlock-preview"
            >
              {emailCaptureMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Unlock Free Preview
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              We'll also send you exclusive laundromat insights. Unsubscribe anytime.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
