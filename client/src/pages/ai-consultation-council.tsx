import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation, useSearch } from "wouter";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SEO } from "@/components/SEO";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Users,
  Zap,
  TrendingUp,
  AlertTriangle,
  Shield,
  Target,
  DollarSign,
  MapPin,
  Building2,
  Calculator,
  Clock,
  Star,
  ChevronRight,
  FileText,
  BarChart3,
  Bot,
  Loader2,
  ArrowRight,
  Crown,
  Sparkles,
  Globe,
  Lock,
  CreditCard,
  Quote,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface ConsultationTier {
  id: string;
  name: string;
  price: number;
  popular?: boolean;
  features: string[];
  includes: Record<string, boolean | number>;
  turnaround: string;
}

interface ExpertAnalysis {
  expert: {
    name: string;
    title: string;
    expertise: string;
    icon: string;
  };
  analysis: string;
  keyFindings: string[];
  recommendation?: string;
  confidence?: number;
}

interface ConsultationResult {
  sessionId: string;
  address: string;
  timestamp: string;
  tier: ConsultationTier;
  calculatorResults: {
    cleanbi: { score: number; grade: string; factors: Record<string, number> };
    valuation: { estimatedValue: number; multiple: number };
    roi: { annualROI: number; monthlyROI: number };
    breakeven: { months: number; years: number };
  };
  expertAnalyses: ExpertAnalysis[];
  finalRecommendation: {
    verdict: string;
    confidence: number;
    summary: string;
    keyStrengths: string[];
    keyRisks: string[];
    actionItems: string[];
  };
  daveMenzReview?: {
    expert: { name: string; title: string; company: string };
    analysis: string;
  };
  competitionHeatmap?: {
    competitors: any[];
    marketSaturation: number;
  };
  pricingStrategy?: {
    recommendations: any[];
    projectedRevenueIncrease: number;
  };
  totalCost: number;
}

const EXPERT_ICONS: Record<string, any> = {
  marketAnalyst: BarChart3,
  financialAnalyst: DollarSign,
  operationsExpert: Building2,
  riskAssessor: AlertTriangle,
  strategicAdvisor: Target,
  daveMenz: Crown,
};

const VERDICT_COLORS: Record<string, string> = {
  "STRONG BUY": "bg-green-500",
  "BUY": "bg-green-400",
  "HOLD": "bg-yellow-500",
  "CAUTION": "bg-orange-500",
  "AVOID": "bg-red-500",
};

const FORM_STORAGE_KEY = "consultation_form_data";
const TIER_STORAGE_KEY = "consultation_selected_tier";

const EXPERTS_DATA = [
  {
    id: "sarah-chen",
    name: "Dr. Sarah Chen",
    title: "Market Analyst",
    specialty: "Demographics & competition analysis",
    bio: "Ph.D. in Market Research with 15+ years analyzing retail demographics and competitive landscapes.",
    icon: BarChart3,
  },
  {
    id: "michael-torres",
    name: "Michael Torres, CFA",
    title: "Financial Analyst",
    specialty: "Valuation & ROI projections",
    bio: "Chartered Financial Analyst specializing in small business valuations and investment returns.",
    icon: DollarSign,
  },
  {
    id: "james-williams",
    name: "James Williams",
    title: "Operations Expert",
    specialty: "Equipment & efficiency optimization",
    bio: "20+ years in commercial laundry operations, equipment selection, and workflow optimization.",
    icon: Building2,
  },
  {
    id: "emily-rodriguez",
    name: "Dr. Emily Rodriguez",
    title: "Risk Assessor",
    specialty: "Market threats & risk analysis",
    bio: "Risk management specialist with expertise in small business vulnerability assessment.",
    icon: AlertTriangle,
  },
  {
    id: "robert-anderson",
    name: "Robert Anderson",
    title: "Strategic Advisor",
    specialty: "Growth strategy & recommendations",
    bio: "Former McKinsey consultant focused on retail growth strategies and market expansion.",
    icon: Target,
  },
  {
    id: "larry-larsen",
    name: "Larry Larsen",
    title: '"Laundromat Larry"',
    specialty: "30+ years, 500+ acquisitions",
    bio: "Industry legend with three decades helping operators build profitable laundromat empires.",
    icon: Crown,
    featured: true,
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: "The AI Council identified issues my broker completely missed. Saved me from a $200K mistake.",
    name: "Marcus Johnson",
    location: "Dallas, TX",
    initials: "MJ",
    rating: 5,
  },
  {
    id: 2,
    quote: "Worth every penny. The CLEANBI score was spot-on and helped me negotiate $50K off the asking price.",
    name: "Sarah Mitchell",
    location: "Phoenix, AZ",
    initials: "SM",
    rating: 5,
  },
  {
    id: 3,
    quote: "Finally, professional-grade analysis without the $10K consulting fee. This is a game-changer.",
    name: "David Chen",
    location: "Los Angeles, CA",
    initials: "DC",
    rating: 5,
  },
  {
    id: 4,
    quote: "The Larry Larsen review alone was worth the Executive Package. His insights are gold.",
    name: "Jennifer Williams",
    location: "Chicago, IL",
    initials: "JW",
    rating: 5,
  },
];

export default function AIConsultationCouncil() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [selectedTier, setSelectedTier] = useState<string>("professional");
  const [step, setStep] = useState<"select" | "input" | "processing" | "results">("select");
  const [consultationResult, setConsultationResult] = useState<ConsultationResult | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    lat: "",
    lng: "",
    population: "",
    medianIncome: "",
    competitors: "",
    rentPerSqFt: "",
    squareFootage: "",
    walkScore: "",
    trafficCount: "",
    monthlyRevenue: "",
    monthlyRent: "",
    monthlyExpenses: "",
    askingPrice: "",
    downPaymentPercent: "20",
    loanRate: "7.5",
    loanTerm: "10",
    washers: "",
    dryers: "",
    equipmentAge: "",
    additionalContext: "",
  });

  const { data: tiers, isLoading: tiersLoading } = useQuery<ConsultationTier[]>({
    queryKey: ["/api/consultation-council/tiers"],
  });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const sessionId = params.get("session_id");
    const success = params.get("success");

    if (sessionId && success === "true" && !paymentVerified) {
      setPaymentVerified(true);

      const savedFormData = sessionStorage.getItem(FORM_STORAGE_KEY);
      const savedTier = sessionStorage.getItem(TIER_STORAGE_KEY);

      if (savedFormData && savedTier) {
        const parsedFormData = JSON.parse(savedFormData);
        setFormData(parsedFormData);
        setSelectedTier(savedTier);
        setStep("processing");
        setProcessingProgress(0);

        toast({
          title: "Payment Successful",
          description: "Starting your AI Consultation Council analysis...",
        });

        const progressInterval = setInterval(() => {
          setProcessingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 15;
          });
        }, 500);

        consultationMutation.mutate({ ...parsedFormData, tier: savedTier });

        sessionStorage.removeItem(FORM_STORAGE_KEY);
        sessionStorage.removeItem(TIER_STORAGE_KEY);

        navigate("/ai-consultation", { replace: true });
      } else {
        toast({
          title: "Session Expired",
          description: "Please fill in your property details again.",
          variant: "destructive",
        });
        setStep("select");
      }
    }

    if (params.get("canceled") === "true") {
      toast({
        title: "Payment Canceled",
        description: "Your consultation was not purchased.",
        variant: "destructive",
      });
      const savedTier = sessionStorage.getItem(TIER_STORAGE_KEY);
      if (savedTier) setSelectedTier(savedTier);
      setStep("input");
      navigate("/ai-consultation", { replace: true });
    }
  }, [searchString, paymentVerified, navigate, toast]);

  const consultationMutation = useMutation({
    mutationFn: async (data: typeof formData & { tier: string }) => {
      const response = await apiRequest("POST", "/api/consultation-council/tiered", {
        tier: data.tier,
        address: data.address,
        lat: parseFloat(data.lat) || undefined,
        lng: parseFloat(data.lng) || undefined,
        population: parseInt(data.population) || undefined,
        medianIncome: parseInt(data.medianIncome) || undefined,
        competitors: parseInt(data.competitors) || undefined,
        rentPerSqFt: parseFloat(data.rentPerSqFt) || undefined,
        squareFootage: parseInt(data.squareFootage) || undefined,
        walkScore: parseInt(data.walkScore) || undefined,
        trafficCount: parseInt(data.trafficCount) || undefined,
        monthlyRevenue: parseInt(data.monthlyRevenue) || undefined,
        monthlyRent: parseInt(data.monthlyRent) || undefined,
        monthlyExpenses: parseInt(data.monthlyExpenses) || undefined,
        askingPrice: parseInt(data.askingPrice) || undefined,
        downPaymentPercent: parseInt(data.downPaymentPercent) || undefined,
        loanRate: parseFloat(data.loanRate) || undefined,
        loanTerm: parseInt(data.loanTerm) || undefined,
        washers: parseInt(data.washers) || undefined,
        dryers: parseInt(data.dryers) || undefined,
        equipmentAge: parseInt(data.equipmentAge) || undefined,
        additionalContext: data.additionalContext || undefined,
      });
      return response.json();
    },
    onSuccess: (result) => {
      setConsultationResult(result);
      setStep("results");
      toast({
        title: "Analysis Complete",
        description: `Your ${result.tier.name} consultation is ready!`,
      });
    },
    onError: (error: Error) => {
      setStep("input");
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const response = await apiRequest("POST", "/api/consultation-council/checkout", {
        tierId,
        address: formData.address,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
          if (error) {
            toast({ title: "Payment Error", description: error.message, variant: "destructive" });
          }
        } else {
          toast({
            title: "Payment Configuration Error",
            description: "Stripe is not configured correctly. Please contact support.",
            variant: "destructive",
          });
        }
      }
    },
    onError: (error: Error) => {
      toast({ title: "Checkout Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartAnalysis = () => {
    if (!formData.address) {
      toast({ title: "Address Required", description: "Please enter the property address", variant: "destructive" });
      return;
    }

    setStep("processing");
    setProcessingProgress(0);

    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    consultationMutation.mutate({ ...formData, tier: selectedTier });
  };

  const handlePurchase = (tierId: string) => {
    setSelectedTier(tierId);
    setStep("input");
  };

  const handleProceedToCheckout = () => {
    if (!formData.address) {
      toast({ title: "Address Required", description: "Please enter the property address", variant: "destructive" });
      return;
    }

    const tier = tiers?.find(t => t.id === selectedTier);
    if (tier && tier.price > 0) {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
      sessionStorage.setItem(TIER_STORAGE_KEY, selectedTier);
      checkoutMutation.mutate(selectedTier);
    } else {
      handleStartAnalysis();
    }
  };

  const selectedTierData = tiers?.find(t => t.id === selectedTier);

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI Consultation Council",
    "description": "6 AI experts + 'Laundromat' Larry Larsen analyze any laundromat deal. Get CLEANBI scoring, competition heatmaps, valuation analysis, and actionable recommendations.",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Quick Analysis",
        "price": "49",
        "priceCurrency": "USD",
        "description": "CLEANBI Score, basic valuation, 1 AI Market Analyst review"
      },
      {
        "@type": "Offer",
        "name": "Full Council Review",
        "price": "149",
        "priceCurrency": "USD",
        "description": "Full 5-Expert AI Council with complete calculator suite and PDF report"
      },
      {
        "@type": "Offer",
        "name": "Deep Dive Analysis",
        "price": "499",
        "priceCurrency": "USD",
        "description": "Competition heatmap, pricing optimizer, foot traffic analysis, Larry Larsen review"
      },
      {
        "@type": "Offer",
        "name": "Executive Package",
        "price": "999",
        "priceCurrency": "USD",
        "description": "30-minute live consultation, POS integration, ongoing 30-day support, direct Larry Larsen access"
      }
    ],
    "areaServed": "Worldwide",
    "serviceType": "Business Consulting"
  };

  const faqItems = [
    {
      question: "What is the AI Consultation Council?",
      answer: "The AI Consultation Council is a panel of 6 AI specialists that analyze laundromat deals using multiple data sources including CLEANBI scoring, market analysis, financial projections, and industry expertise from 'Laundromat' Larry Larsen."
    },
    {
      question: "How is this different from traditional consulting?",
      answer: "Traditional consulting costs $5,000-$10,000 and takes weeks. Our AI Council delivers comprehensive analysis starting at just $49 for Quick Analysis, up to $999 for the full Executive Package with live consultation and ongoing support."
    },
    {
      question: "What is the CLEANBI Score?",
      answer: "CLEANBI is our proprietary 17-factor scoring system that analyzes any property address globally, evaluating demographics, competition, traffic, income levels, and market saturation to give you a grade from A to F."
    },
    {
      question: "Who is Larry Larsen?",
      answer: "Larry Larsen, known industry-wide as 'Laundromat Larry,' has 30+ years of experience and has consulted on 500+ acquisitions. Our Deep Dive ($499) and Executive Package ($999) tiers include his personal review of your deal."
    },
    {
      question: "Can I use this to evaluate any laundromat?",
      answer: "Yes! Our system works for existing laundromats for sale, new location scouting, competitor analysis, or evaluating your own business. We analyze properties in 220+ countries worldwide."
    },
    {
      question: "What's included in each tier?",
      answer: "Quick Analysis ($49) includes CLEANBI score and basic valuation. Full Council Review ($149) adds 5 AI experts and PDF report. Deep Dive ($499) includes competition heatmaps and Larry Larsen review. Executive Package ($999) adds live consultation and 30-day support."
    }
  ];

  return (
    <AuthGuard title="Sign In for AI Consultation" description="Sign in to access this feature.">
      <SEO
        title="AI Consultation Council | 6 AI Experts + Larry Larsen Analyze Your Laundromat Deal | WashBizHub"
        description="Get expert laundromat analysis from 6 AI specialists + 'Laundromat' Larry Larsen. CLEANBI scoring, competition heatmaps, valuation analysis, and actionable recommendations. Starting at $49 - a fraction of traditional $5K-$10K consulting. Creating millionaires one customer at a time."
        canonicalUrl="/ai-consultation"
        keywords={[
          "laundromat consultation",
          "AI laundromat analysis",
          "CLEANBI score",
          "laundromat valuation",
          "Larry Larsen consultation",
          "laundromat business analysis",
          "buy laundromat",
          "laundromat investment",
          "laundromat ROI calculator",
          "laundromat due diligence"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Plan", url: "/plan" },
          { name: "AI Consultation Council", url: "/ai-consultation" }
        ]}
        structuredData={[serviceStructuredData]}
        faqs={faqItems}
        ogType="website"
        author={{
          name: "WashBizHub AI Council",
          expertise: "Laundromat Business Intelligence",
          credentials: "Powered by OpenAI, Anthropic, Google Gemini, and Perplexity AI"
        }}
      />

      <div className="min-h-screen bg-background">
        {step === "select" && (
          <div className="relative">
            {/* Premium Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#001428] via-[#001F3F] to-[#002B5C] py-20 lg:py-32">
              {/* Animated floating orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-40 right-[15%] w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
                <div className="absolute top-10 right-[40%] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>

              <div className="relative max-w-7xl mx-auto px-4">
                <div className="text-center">
                  {/* Premium badge */}
                  <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30" data-testid="badge-premium">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-medium text-sm">Creating Millionaires One Customer at a Time</span>
                  </div>

                  {/* Main headline */}
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight" data-testid="text-page-title">
                    AI Consultation
                    <span className="block bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Council
                    </span>
                  </h1>

                  {/* Subheadline */}
                  <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed">
                    6 AI Experts + "Laundromat" Larry Larsen analyze your deal with 
                    <span className="text-teal-400 font-semibold"> enterprise-grade precision</span>
                  </p>

                  {/* Trust badges row */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mb-10" data-testid="trust-badges">
                    <div className="flex items-center gap-2 text-white/70">
                      <Users className="w-5 h-5 text-teal-400" />
                      <span className="font-medium">72K+ Community</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Globe className="w-5 h-5 text-teal-400" />
                      <span className="font-medium">220+ Countries</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Lock className="w-5 h-5 text-teal-400" />
                      <span className="font-medium">Secure Payments</span>
                    </div>
                  </div>

                  {/* Premium price comparison box */}
                  <div className="inline-block" data-testid="price-comparison-box">
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-xl">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-4" variant="secondary">
                          SAVE $9,000+
                        </Badge>
                      </div>
                      <div className="space-y-3 mt-2">
                        <p className="text-white/60 text-lg">
                          Traditional consulting:
                          <span className="line-through ml-2 text-white/40">$5,000 - $10,000</span>
                        </p>
                        <p className="text-3xl sm:text-4xl font-black">
                          <span className="text-white">AI Council: </span>
                          <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Starting at $49</span>
                        </p>
                        <p className="text-white/50 text-sm">
                          Same insights, fraction of the cost, delivered in hours not weeks
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10">
                        <CreditCard className="w-5 h-5 text-white/40" />
                        <span className="text-white/40 text-sm">Powered by Stripe</span>
                      </div>
                    </div>
                  </div>

                  {/* Scroll indicator */}
                  <div className="mt-12 animate-bounce">
                    <ChevronDown className="w-8 h-8 text-white/40 mx-auto" />
                  </div>
                </div>
              </div>
            </section>

            {/* Visual Process Flow Section */}
            <section className="py-20 bg-background border-b" data-testid="section-process-flow">
              <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
                  <p className="text-muted-foreground text-lg">Three simple steps to professional-grade analysis</p>
                </div>

                <div className="relative">
                  {/* Connecting line */}
                  <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-teal-500 via-amber-500 to-green-500" />

                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="relative text-center" data-testid="process-step-1">
                      <div className="relative z-10 w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-600/20 border-2 border-teal-500/30 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-teal-500" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm">1</div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Enter Address</h3>
                      <p className="text-muted-foreground">Provide the property address and any available financial details</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative text-center" data-testid="process-step-2">
                      <div className="relative z-10 w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-2 border-amber-500/30 flex items-center justify-center">
                        <Bot className="w-12 h-12 text-amber-500" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-sm">2</div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
                      <p className="text-muted-foreground">Our 6-expert council analyzes 17+ data points in minutes</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative text-center" data-testid="process-step-3">
                      <div className="relative z-10 w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/30 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-500" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 text-white font-bold flex items-center justify-center text-sm">3</div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Get Report</h3>
                      <p className="text-muted-foreground">Receive comprehensive analysis with actionable recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Premium Tier Cards Section */}
            <section className="py-20 bg-muted/30" data-testid="section-tiers">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Analysis Level</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    From quick insights to comprehensive executive analysis, we have a tier for every need
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {tiersLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="h-32 bg-muted" />
                        <CardContent className="h-48 bg-muted/50" />
                      </Card>
                    ))
                  ) : (
                    tiers?.map((tier) => {
                      const isPopular = tier.popular;
                      const isPremium = tier.id === "premium" || tier.name.toLowerCase().includes("executive");

                      return (
                        <Card
                          key={tier.id}
                          className={`relative flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                            selectedTier === tier.id ? "ring-2 ring-accent" : ""
                          } ${isPopular ? "ring-2 ring-teal-500/50 shadow-lg shadow-teal-500/10" : ""} ${
                            isPremium ? "border-amber-500/30" : ""
                          }`}
                          data-testid={`card-tier-${tier.id}`}
                        >
                          {/* Premium tier gold header */}
                          {isPremium && (
                            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-t-lg" />
                          )}

                          {isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                              <Badge className="bg-teal-500 text-white font-bold shadow-lg">
                                <Star className="w-3 h-3 mr-1" />
                                Most Popular
                              </Badge>
                            </div>
                          )}

                          <CardHeader className={`pt-8 ${isPremium ? "pt-10" : ""}`}>
                            <CardTitle className="flex items-center gap-2">
                              {isPremium && <Crown className="w-5 h-5 text-amber-500" />}
                              {tier.name}
                            </CardTitle>
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-4xl font-black">${tier.price}</span>
                              <Badge variant="outline" className="text-xs">one-time</Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-4 border-b">
                              <Clock className="w-4 h-4" />
                              <span>Delivery: {tier.turnaround}</span>
                            </div>
                            <ul className="space-y-3">
                              {tier.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>

                          <CardFooter>
                            <Button
                              className={`w-full gap-2 ${
                                isPremium
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
                                  : isPopular
                                  ? "bg-teal-500 hover:bg-teal-600"
                                  : ""
                              }`}
                              variant={isPopular || isPremium ? "default" : "outline"}
                              onClick={() => handlePurchase(tier.id)}
                              data-testid={`button-select-${tier.id}`}
                            >
                              {tier.price === 0 ? "Start Free Analysis" : `Get ${tier.name}`}
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

            {/* Expert Council Section */}
            <section className="py-20 bg-gradient-to-br from-[#001428] via-[#001F3F] to-[#002B5C]" data-testid="section-experts">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Meet Your AI Council</h2>
                  <p className="text-white/60 text-lg max-w-2xl mx-auto">
                    Six specialized AI experts, each trained on decades of industry data, working together to analyze your deal
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {EXPERTS_DATA.map((expert) => (
                    <div
                      key={expert.id}
                      className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 ${
                        expert.featured ? "lg:col-span-1 ring-2 ring-amber-500/30" : ""
                      }`}
                      data-testid={`card-expert-${expert.id}`}
                    >
                      {expert.featured && (
                        <div className="absolute -top-3 left-4">
                          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold">
                            <Crown className="w-3 h-3 mr-1" />
                            Featured Expert
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-start gap-4 mt-2">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          expert.featured
                            ? "bg-gradient-to-br from-amber-500/30 to-amber-600/30 border border-amber-500/30"
                            : "bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20"
                        }`}>
                          <expert.icon className={`w-8 h-8 ${expert.featured ? "text-amber-400" : "text-teal-400"}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">{expert.name}</h3>
                          <p className={`text-sm font-medium ${expert.featured ? "text-amber-400" : "text-teal-400"}`}>
                            {expert.title}
                          </p>
                          <p className="text-white/50 text-sm mt-1">{expert.specialty}</p>
                        </div>
                      </div>

                      <p className="text-white/60 text-sm mt-4 leading-relaxed">{expert.bio}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Social Proof Section */}
            <section className="py-20 bg-muted/30" data-testid="section-testimonials">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Customers Say</h2>
                  <p className="text-muted-foreground text-lg">Real results from laundromat investors who used our AI Council</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {TESTIMONIALS.map((testimonial) => (
                    <Card key={testimonial.id} className="bg-card/50 backdrop-blur" data-testid={`card-testimonial-${testimonial.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">{testimonial.initials}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1 mb-2">
                              {Array(testimonial.rating).fill(0).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <Quote className="w-6 h-6 text-muted-foreground/30 mb-2" />
                            <p className="text-foreground leading-relaxed mb-4">{testimonial.quote}</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-background" data-testid="section-faq">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-faq-heading">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-muted-foreground text-lg">Everything you need to know about the AI Consultation Council</p>
                </div>

                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <Card key={index} className="overflow-hidden" data-testid={`card-faq-${index}`}>
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`faq-${index}`} className="border-none">
                          <AccordionTrigger className="px-6 py-4 text-left hover:no-underline" data-testid={`accordion-faq-${index}`}>
                            <span className="text-base font-semibold">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Trust Footer Section */}
            <section className="py-16 bg-gradient-to-br from-[#001428] via-[#001F3F] to-[#002B5C]" data-testid="section-trust-footer">
              <div className="max-w-5xl mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  {/* Security */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Secure Platform</h3>
                    <p className="text-white/50 text-sm">Your data and transactions are protected with industry-standard security</p>
                  </div>

                  {/* Secure Payments */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                      <CreditCard className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Powered by Stripe</h3>
                    <p className="text-white/50 text-sm">Secure payment processing trusted by millions of businesses</p>
                  </div>

                  {/* Guarantee */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Satisfaction Guaranteed</h3>
                    <p className="text-white/50 text-sm">100% money-back guarantee if you're not satisfied with your analysis</p>
                  </div>
                </div>

                {/* Partner logos placeholder */}
                <div className="mt-12 pt-8 border-t border-white/10 text-center">
                  <p className="text-white/30 text-sm mb-4">Trusted Technology Partners</p>
                  <div className="flex items-center justify-center gap-8 text-white/20">
                    <span className="text-sm font-medium">OpenAI</span>
                    <span className="text-sm font-medium">Anthropic</span>
                    <span className="text-sm font-medium">Google Gemini</span>
                    <span className="text-sm font-medium">Stripe</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {step === "input" && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <Button
              variant="ghost"
              onClick={() => setStep("select")}
              className="mb-6"
              data-testid="button-back-to-tiers"
            >
              <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
              Back to tier selection
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-2xl">Property Analysis Form</CardTitle>
                    <CardDescription>
                      {selectedTierData?.name} - ${selectedTierData?.price}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedTierData?.turnaround}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="address" className="text-base font-medium">
                      Property Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street, City, State 12345"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="mt-1"
                      data-testid="input-address"
                    />
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="financial">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Financial Information
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2 gap-4 pt-4">
                        <div>
                          <Label htmlFor="askingPrice">Asking Price ($)</Label>
                          <Input
                            id="askingPrice"
                            type="number"
                            placeholder="500000"
                            value={formData.askingPrice}
                            onChange={(e) => handleInputChange("askingPrice", e.target.value)}
                            data-testid="input-asking-price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthlyRevenue">Monthly Revenue ($)</Label>
                          <Input
                            id="monthlyRevenue"
                            type="number"
                            placeholder="25000"
                            value={formData.monthlyRevenue}
                            onChange={(e) => handleInputChange("monthlyRevenue", e.target.value)}
                            data-testid="input-monthly-revenue"
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                          <Input
                            id="monthlyRent"
                            type="number"
                            placeholder="4500"
                            value={formData.monthlyRent}
                            onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                            data-testid="input-monthly-rent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
                          <Input
                            id="monthlyExpenses"
                            type="number"
                            placeholder="8000"
                            value={formData.monthlyExpenses}
                            onChange={(e) => handleInputChange("monthlyExpenses", e.target.value)}
                            data-testid="input-monthly-expenses"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="equipment">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Equipment & Property
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-3 gap-4 pt-4">
                        <div>
                          <Label htmlFor="washers">Number of Washers</Label>
                          <Input
                            id="washers"
                            type="number"
                            placeholder="30"
                            value={formData.washers}
                            onChange={(e) => handleInputChange("washers", e.target.value)}
                            data-testid="input-washers"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dryers">Number of Dryers</Label>
                          <Input
                            id="dryers"
                            type="number"
                            placeholder="25"
                            value={formData.dryers}
                            onChange={(e) => handleInputChange("dryers", e.target.value)}
                            data-testid="input-dryers"
                          />
                        </div>
                        <div>
                          <Label htmlFor="equipmentAge">Equipment Age (years)</Label>
                          <Input
                            id="equipmentAge"
                            type="number"
                            placeholder="5"
                            value={formData.equipmentAge}
                            onChange={(e) => handleInputChange("equipmentAge", e.target.value)}
                            data-testid="input-equipment-age"
                          />
                        </div>
                        <div>
                          <Label htmlFor="squareFootage">Square Footage</Label>
                          <Input
                            id="squareFootage"
                            type="number"
                            placeholder="2500"
                            value={formData.squareFootage}
                            onChange={(e) => handleInputChange("squareFootage", e.target.value)}
                            data-testid="input-square-footage"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rentPerSqFt">Rent per Sq Ft ($)</Label>
                          <Input
                            id="rentPerSqFt"
                            type="number"
                            step="0.01"
                            placeholder="15.00"
                            value={formData.rentPerSqFt}
                            onChange={(e) => handleInputChange("rentPerSqFt", e.target.value)}
                            data-testid="input-rent-per-sqft"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="location">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location & Demographics
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-3 gap-4 pt-4">
                        <div>
                          <Label htmlFor="population">Population (within 3 mi)</Label>
                          <Input
                            id="population"
                            type="number"
                            placeholder="45000"
                            value={formData.population}
                            onChange={(e) => handleInputChange("population", e.target.value)}
                            data-testid="input-population"
                          />
                        </div>
                        <div>
                          <Label htmlFor="medianIncome">Median Household Income ($)</Label>
                          <Input
                            id="medianIncome"
                            type="number"
                            placeholder="55000"
                            value={formData.medianIncome}
                            onChange={(e) => handleInputChange("medianIncome", e.target.value)}
                            data-testid="input-median-income"
                          />
                        </div>
                        <div>
                          <Label htmlFor="competitors">Competitors within 1 mi</Label>
                          <Input
                            id="competitors"
                            type="number"
                            placeholder="2"
                            value={formData.competitors}
                            onChange={(e) => handleInputChange("competitors", e.target.value)}
                            data-testid="input-competitors"
                          />
                        </div>
                        <div>
                          <Label htmlFor="walkScore">Walk Score (0-100)</Label>
                          <Input
                            id="walkScore"
                            type="number"
                            placeholder="70"
                            value={formData.walkScore}
                            onChange={(e) => handleInputChange("walkScore", e.target.value)}
                            data-testid="input-walk-score"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trafficCount">Daily Traffic Count</Label>
                          <Input
                            id="trafficCount"
                            type="number"
                            placeholder="15000"
                            value={formData.trafficCount}
                            onChange={(e) => handleInputChange("trafficCount", e.target.value)}
                            data-testid="input-traffic-count"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="additional">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Additional Context
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4">
                        <Label htmlFor="additionalContext">Tell us more about this deal</Label>
                        <Textarea
                          id="additionalContext"
                          placeholder="Owner retiring, lease terms, unique features, concerns, etc."
                          value={formData.additionalContext}
                          onChange={(e) => handleInputChange("additionalContext", e.target.value)}
                          className="mt-2 min-h-24"
                          data-testid="textarea-additional-context"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleProceedToCheckout}
                  disabled={!formData.address || consultationMutation.isPending || checkoutMutation.isPending}
                  data-testid="button-start-analysis"
                >
                  {consultationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting to Checkout...
                    </>
                  ) : selectedTierData && selectedTierData.price > 0 ? (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Proceed to Checkout (${selectedTierData.price})
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Start Free Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "processing" && (
          <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="max-w-lg w-full">
              <CardContent className="py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-10 h-10 text-accent animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2">AI Council Convening...</h2>
                <p className="text-muted-foreground mb-6">
                  {selectedTierData?.includes.expertCount || 5} expert AI analysts are reviewing your deal
                </p>
                <Progress value={processingProgress} className="mb-4" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  {processingProgress > 10 && <p className="animate-fade-in">Calculating CLEANBI Score...</p>}
                  {processingProgress > 30 && <p className="animate-fade-in">Running financial projections...</p>}
                  {processingProgress > 50 && <p className="animate-fade-in">Analyzing competition...</p>}
                  {processingProgress > 70 && <p className="animate-fade-in">Synthesizing expert opinions...</p>}
                  {processingProgress > 85 && <p className="animate-fade-in">Generating recommendations...</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "results" && consultationResult && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-results-title">
                  Consultation Results
                </h1>
                <p className="text-muted-foreground">
                  {consultationResult.address} | Session: {consultationResult.sessionId}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("select");
                  setConsultationResult(null);
                }}
                data-testid="button-new-consultation"
              >
                New Consultation
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card className={`${VERDICT_COLORS[consultationResult.finalRecommendation?.verdict ?? "HOLD"]} text-white`}>
                <CardContent className="py-8 text-center">
                  <h2 className="text-lg font-medium opacity-90">AI Council Verdict</h2>
                  <p className="text-4xl font-bold my-2" data-testid="text-verdict">
                    {consultationResult.finalRecommendation?.verdict ?? "Analyzing..."}
                  </p>
                  <p className="text-lg opacity-90">
                    {consultationResult.finalRecommendation?.confidence ?? 0}% Confidence
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-8 text-center">
                  <h2 className="text-lg font-medium text-muted-foreground">CLEANBI Score</h2>
                  <p className="text-4xl font-bold my-2" data-testid="text-cleanbi-score">
                    {consultationResult.calculatorResults?.cleanbi?.score ?? "N/A"}/100
                  </p>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    Grade: {consultationResult.calculatorResults?.cleanbi?.grade ?? "N/A"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-8 text-center">
                  <h2 className="text-lg font-medium text-muted-foreground">Projected ROI</h2>
                  <p className="text-4xl font-bold my-2" data-testid="text-roi">
                    {consultationResult.calculatorResults?.roi?.annualROI?.toFixed(1) ?? "N/A"}%
                  </p>
                  <p className="text-muted-foreground">
                    Breakeven: {consultationResult.calculatorResults?.breakeven?.months ?? "N/A"} months
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 border rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
              <p className="text-muted-foreground mb-6">
                {consultationResult.finalRecommendation?.summary ?? "Analysis in progress..."}
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {(consultationResult.finalRecommendation?.keyStrengths ?? []).map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">+</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Key Risks
                  </h4>
                  <ul className="space-y-2">
                    {(consultationResult.finalRecommendation?.keyRisks ?? []).map((risk, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500">!</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-accent" />
                    Action Items
                  </h4>
                  <ol className="space-y-2">
                    {(consultationResult.finalRecommendation?.actionItems ?? []).map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="font-medium text-accent">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {consultationResult.daveMenzReview && (
              <Card className="mb-8 border-yellow-500/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {consultationResult.daveMenzReview.expert.name}
                        <Badge variant="secondary">Laundromat123.com</Badge>
                      </CardTitle>
                      <CardDescription>30+ years experience | 500+ acquisitions consulted</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {consultationResult.daveMenzReview.analysis}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="experts" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="experts" data-testid="tab-experts">Expert Analyses</TabsTrigger>
                <TabsTrigger value="calculators" data-testid="tab-calculators">Calculator Results</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="experts">
                <div className="grid md:grid-cols-2 gap-4">
                  {(consultationResult.expertAnalyses ?? []).map((expert, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{expert.expert.name}</CardTitle>
                            <CardDescription>{expert.expert.title}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-48">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {expert.analysis.substring(0, 800)}
                            {expert.analysis.length > 800 && "..."}
                          </p>
                        </ScrollArea>
                        {expert.keyFindings.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-medium mb-2">Key Findings:</p>
                            <div className="flex flex-wrap gap-1">
                              {expert.keyFindings.slice(0, 3).map((finding, j) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  {finding.substring(0, 40)}...
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calculators">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Valuation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ${(consultationResult.calculatorResults?.valuation?.estimatedValue ?? 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(consultationResult.calculatorResults?.valuation?.multiple ?? 0).toFixed(1)}x Multiple
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        ROI Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {(consultationResult.calculatorResults?.roi?.annualROI ?? 0).toFixed(1)}% Annual
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(consultationResult.calculatorResults?.roi?.monthlyROI ?? 0).toFixed(2)}% Monthly
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Breakeven
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {consultationResult.calculatorResults?.breakeven?.months ?? "N/A"} months
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(consultationResult.calculatorResults?.breakeven?.years ?? 0).toFixed(1)} years
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        CLEANBI Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {Object.entries(consultationResult.calculatorResults?.cleanbi?.factors || {})
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span>{(value as number)?.toFixed?.(0) ?? value}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced">
                <div className="grid md:grid-cols-2 gap-4">
                  {consultationResult.competitionHeatmap && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Competition Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Competitors Found</span>
                            <Badge variant="secondary">
                              {consultationResult.competitionHeatmap.competitors?.length || 0}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Market Saturation</span>
                            <Badge
                              variant={
                                consultationResult.competitionHeatmap.marketSaturation > 80
                                  ? "destructive"
                                  : consultationResult.competitionHeatmap.marketSaturation > 50
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {consultationResult.competitionHeatmap.marketSaturation}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {consultationResult.pricingStrategy && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Dynamic Pricing Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {(consultationResult.pricingStrategy?.recommendations ?? []).slice(0, 3).map((rec: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{rec?.machineType ?? "N/A"}</span>
                              <span>
                                ${rec?.recommendedBase ?? 0} (Peak: ${rec?.peakPrice ?? 0})
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                AI Processing Cost: ${(consultationResult.totalCost ?? 0).toFixed(4)} |
                Generated: {consultationResult.timestamp ? new Date(consultationResult.timestamp).toLocaleString() : "Just now"}
              </p>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
