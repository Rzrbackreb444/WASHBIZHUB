import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
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
  ArrowRight
} from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface ReportTier {
  id: "quick" | "standard" | "pro" | "enterprise";
  name: string;
  price: number;
  icon: any;
  iconBg: string;
  iconColor: string;
  popular?: boolean;
  bestValue?: boolean;
  description: string;
  features: string[];
  excluded?: string[];
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
}

const reportTiers: ReportTier[] = [
  {
    id: "quick",
    name: "Quick Valuation",
    price: 99,
    icon: DollarSign,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    bestValue: true,
    description: "Fast valuation estimate for quick decisions",
    features: [
      "17-Factor CLEANBI Score",
      "A/B/C Grade Assessment",
      "Estimated Business Value Range",
      "Location Overview",
      "3-Page PDF Report",
      "Email Delivery"
    ],
    excluded: [
      "Competitor Analysis",
      "Demographic Data",
      "Vision AI Analysis",
      "AI Recommendations"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    price: 199,
    icon: FileText,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    description: "Essential location analysis for quick evaluations",
    features: [
      "17-Factor CLEANBI Score",
      "A/B/C Grade Assessment",
      "Population & Demographics",
      "Median Income Analysis",
      "Competitor Count (3-mile radius)",
      "Basic Traffic Score",
      "PDF Report Download",
      "Email Delivery"
    ],
    excluded: [
      "Vision AI Photo Analysis",
      "Street View Imagery",
      "Aerial View Analysis",
      "AI Recommendations",
      "Competitor Deep Dive"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 349,
    icon: Zap,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    popular: true,
    description: "Comprehensive analysis with AI-powered insights",
    features: [
      "Everything in Standard, plus:",
      "Vision AI Photo Analysis",
      "Parking Visibility Score",
      "Property Condition Assessment",
      "Street View Imagery",
      "Competitor Mapping & Details",
      "AI-Generated Recommendations",
      "Renter Percentage Data",
      "Traffic Pattern Analysis",
      "Priority Processing"
    ],
    excluded: [
      "Aerial View Flyover",
      "Video Walkthrough",
      "Custom Comparisons"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    icon: Crown,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    description: "Full analysis with aerial views & custom insights",
    features: [
      "Everything in Pro, plus:",
      "Aerial View 3D Flyover",
      "Satellite Imagery Analysis",
      "Video Walkthrough Export",
      "Custom Location Comparisons",
      "Investment ROI Projections",
      "Market Trend Forecasting",
      "Dedicated Analyst Review",
      "Phone Consultation (30 min)",
      "White-Label Report Option"
    ]
  }
];

const featureComparison = [
  { feature: "17-Factor CLEANBI Score", quick: true, standard: true, pro: true, enterprise: true },
  { feature: "A/B/C Grade Assessment", quick: true, standard: true, pro: true, enterprise: true },
  { feature: "Estimated Business Value", quick: true, standard: false, pro: true, enterprise: true },
  { feature: "Population & Demographics", quick: false, standard: true, pro: true, enterprise: true },
  { feature: "Median Income Analysis", quick: false, standard: true, pro: true, enterprise: true },
  { feature: "Competitor Count (3-mile)", quick: false, standard: true, pro: true, enterprise: true },
  { feature: "PDF Report Download", quick: true, standard: true, pro: true, enterprise: true },
  { feature: "Vision AI Photo Analysis", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "Street View Imagery", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "Parking & Visibility Score", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "AI Recommendations", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "Competitor Deep Dive", quick: false, standard: false, pro: true, enterprise: true },
  { feature: "Aerial View 3D Flyover", quick: false, standard: false, pro: false, enterprise: true },
  { feature: "Investment ROI Projections", quick: false, standard: false, pro: false, enterprise: true },
  { feature: "Phone Consultation", quick: false, standard: false, pro: false, enterprise: true },
  { feature: "White-Label Report", quick: false, standard: false, pro: false, enterprise: true },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Clock },
  processing: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Loader2 },
  completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle2 },
  failed: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: AlertCircle },
};

export default function CleanbiReports() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [address, setAddress] = useState("");
  const [selectedTier, setSelectedTier] = useState<"quick" | "standard" | "pro" | "enterprise">("quick");
  const [activeTab, setActiveTab] = useState("order");

  const { data: myReports, isLoading: reportsLoading } = useQuery<PurchasedReport[]>({
    queryKey: ["/api/cleanbi/reports"],
    enabled: isAuthenticated,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: { address: string; tier: string }) => {
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

  const reanalyzeMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest("POST", `/api/cleanbi/reports/${reportId}/reanalyze`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Re-analysis Started",
        description: "Your report is being regenerated. Check back shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cleanbi/reports"] });
    },
    onError: () => {
      toast({
        title: "Re-analysis Failed",
        description: "Unable to re-analyze. Please try again.",
        variant: "destructive",
      });
    },
  });

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

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = loadGooglePlaces;
      document.head.appendChild(script);
    } else {
      loadGooglePlaces();
    }
  }, []);

  const handleGenerateReport = () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a valid address to analyze.",
        variant: "destructive",
      });
      return;
    }

    checkoutMutation.mutate({ address, tier: selectedTier });
  };

  const selectedTierData = reportTiers.find(t => t.id === selectedTier)!;

  const seoFaqs = [
    {
      question: "What is a CLEANBI Location Report?",
      answer: "A CLEANBI Location Report is a comprehensive AI-powered analysis of any potential laundromat location. It evaluates 17 critical factors including demographics, competition, traffic patterns, and economic indicators to generate a professional feasibility score (0-100) with A/B/C grading."
    },
    {
      question: "How accurate is the CLEANBI scoring system?",
      answer: "The CLEANBI scoring system analyzes real-time data from multiple sources including US Census demographics, Google Places competitor data, traffic pattern APIs, and Vision AI photo analysis. Our 17-factor algorithm has been validated against 1,000+ actual laundromat performance metrics with 89% accuracy."
    },
    {
      question: "What's included in the Vision AI photo analysis?",
      answer: "Vision AI analysis evaluates street-level imagery to assess parking availability, building visibility from main roads, property condition, signage potential, and foot traffic indicators. This automated visual inspection supplements traditional data analysis for a more complete picture."
    },
    {
      question: "How long does it take to receive my report?",
      answer: "Standard reports are typically delivered within 24 hours. Pro reports with Vision AI analysis take 24-48 hours. Enterprise reports with aerial views and analyst review are delivered within 3-5 business days, including your 30-minute consultation."
    },
    {
      question: "Can I compare multiple locations?",
      answer: "Yes! Enterprise reports include custom location comparisons. You can also purchase multiple Standard or Pro reports to compare different addresses. Each report provides the same consistent scoring methodology for easy comparison."
    },
    {
      question: "What if I'm not satisfied with my report?",
      answer: "We offer a 30-day satisfaction guarantee. If your report doesn't meet expectations or contains data errors, contact our support team for a full refund or complimentary re-analysis at a higher tier."
    },
    {
      question: "Is the report suitable for investor presentations?",
      answer: "Absolutely. All CLEANBI reports are professionally formatted PDFs suitable for bank presentations, investor meetings, and due diligence documentation. Enterprise reports include white-label options for your company branding."
    },
    {
      question: "What areas do you cover?",
      answer: "CLEANBI reports are available for any address in the United States. Our data sources provide comprehensive coverage across all 50 states, with enhanced data density in urban and suburban markets."
    }
  ];

  const productOffers = [
    {
      name: "CLEANBI Standard Report",
      description: "Essential 17-factor location analysis with demographics, competition count, and PDF report delivery.",
      price: "199",
      priceCurrency: "USD",
      availability: "InStock" as const
    },
    {
      name: "CLEANBI Pro Report",
      description: "Comprehensive analysis with Vision AI photo assessment, Street View imagery, competitor mapping, and AI recommendations.",
      price: "349",
      priceCurrency: "USD",
      availability: "InStock" as const
    },
    {
      name: "CLEANBI Enterprise Report",
      description: "Full analysis with aerial 3D flyover, investment projections, 30-minute consultation, and white-label options.",
      price: "499",
      priceCurrency: "USD",
      availability: "InStock" as const
    }
  ];

  const howToSteps = [
    { name: "Enter Your Address", text: "Use the address search to input the exact location you want to analyze. Our Google Places integration ensures accurate geocoding." },
    { name: "Select Report Tier", text: "Choose between Standard ($199), Pro ($349), or Enterprise ($499) based on your analysis needs. Pro is recommended for most investors." },
    { name: "Review Features", text: "Compare the feature table to ensure your selected tier includes the analysis components you need, such as Vision AI or aerial views." },
    { name: "Complete Checkout", text: "Click 'Generate Report' to proceed to secure Stripe checkout. You'll receive email confirmation immediately after purchase." },
    { name: "Receive Your Report", text: "Standard reports deliver within 24 hours. Check your email or return to this page to download your professional PDF analysis." }
  ];

  return (
    <AuthGuard title="Sign In to Access Reports" description="Sign in to access this feature.">
      <SEO
        title="Premium CLEANBI Location Reports - AI-Powered Laundromat Feasibility Analysis"
        description="Get professional laundromat location analysis with Vision AI, Street View imagery, and 17-factor CLEANBI scoring. Reports from $199. Competitor mapping, demographics, and AI recommendations for informed investment decisions."
        canonicalUrl="/cleanbi-reports"
        ogType="product"
        keywords={[
          "laundromat location report",
          "laundromat feasibility study PDF",
          "coin laundry site analysis",
          "laundromat demographic report",
          "CLEANBI score",
          "laundromat competition analysis",
          "laundry business feasibility study",
          "laundromat investment analysis",
          "commercial laundry location report",
          "laundromat market research",
          "Vision AI property analysis",
          "laundromat due diligence report"
        ]}
        faqs={seoFaqs}
        productOffers={productOffers}
        howTo={{
          name: "How to Order a Professional Location Analysis",
          description: "Follow these steps to order a comprehensive CLEANBI location report for any potential laundromat site in the United States.",
          steps: howToSteps,
          totalTime: "PT5M"
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI", url: "/cleanbi" },
          { name: "Premium Reports", url: "/cleanbi-reports" }
        ]}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30" data-testid="badge-premium-reports">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Location Intelligence
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" data-testid="text-hero-title">
              Premium CLEANBI Location Reports
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-8" data-testid="text-hero-subtitle">
              AI-Powered Analysis with Vision AI, Street View & Aerial Imagery.
              Make confident investment decisions with professional feasibility reports.
            </p>

            {/* Pricing Tiers Preview */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
              {reportTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`flex flex-col items-center p-4 rounded-xl ${
                    tier.popular
                      ? "bg-accent/20 border-2 border-accent"
                      : "bg-white/10 border border-white/20"
                  }`}
                  data-testid={`tier-preview-${tier.id}`}
                >
                  {tier.popular && (
                    <Badge className="mb-2 bg-accent text-primary text-xs">Most Popular</Badge>
                  )}
                  <span className="text-white font-bold">{tier.name}</span>
                  <span className="text-3xl font-black text-white">${tier.price}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setActiveTab("order")}
              className="bg-accent text-primary font-bold text-lg px-8 py-6"
              data-testid="button-hero-cta"
            >
              <FileText className="h-5 w-5 mr-2" />
              Order Your Report
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Features Highlight */}
        <section className="py-12 bg-muted/50 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 text-center">
              {[
                { icon: Brain, label: "17-Factor Score", color: "text-purple-500" },
                { icon: Camera, label: "Vision AI Analysis", color: "text-blue-500" },
                { icon: Map, label: "Competitor Mapping", color: "text-red-500" },
                { icon: Users, label: "Demographics", color: "text-green-500" },
                { icon: Sparkles, label: "AI Recommendations", color: "text-accent" },
                { icon: Video, label: "Aerial Flyover", color: "text-indigo-500" },
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full bg-background ${feature.color}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Tabs */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="order" data-testid="tab-order">
                  <FileText className="h-4 w-4 mr-2" />
                  Order Report
                </TabsTrigger>
                <TabsTrigger value="my-reports" data-testid="tab-my-reports">
                  <Download className="h-4 w-4 mr-2" />
                  My Reports
                  {myReports && myReports.length > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {myReports.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Order Report Tab */}
              <TabsContent value="order" className="space-y-12">
                {/* Address Input */}
                <Card className="max-w-2xl mx-auto" data-testid="card-address-input">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-accent" />
                      Enter Location Address
                    </CardTitle>
                    <CardDescription>
                      Search for any US address to analyze its potential as a laundromat location
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Input
                        ref={addressInputRef}
                        type="text"
                        placeholder="Enter address (e.g., 123 Main St, City, State)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-10 py-6 text-lg"
                        data-testid="input-address"
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    {address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Address selected: {address}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {reportTiers.map((tier) => {
                    const Icon = tier.icon;
                    const isSelected = selectedTier === tier.id;

                    return (
                      <Card
                        key={tier.id}
                        className={`relative cursor-pointer transition-all hover:shadow-lg ${
                          isSelected
                            ? "ring-2 ring-accent shadow-lg"
                            : "hover:ring-1 hover:ring-accent/50"
                        } ${tier.popular ? "md:scale-105 z-10" : ""}`}
                        onClick={() => setSelectedTier(tier.id)}
                        data-testid={`card-tier-${tier.id}`}
                      >
                        {tier.popular && (
                          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary">
                            <Star className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        {tier.bestValue && (
                          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        )}

                        <CardHeader className="text-center pb-4">
                          <div className={`mx-auto mb-3 p-4 rounded-full ${tier.iconBg} w-fit`}>
                            <Icon className={`h-8 w-8 ${tier.iconColor}`} />
                          </div>
                          <CardTitle className="text-2xl font-black">{tier.name}</CardTitle>
                          <CardDescription className="text-sm">{tier.description}</CardDescription>
                          <div className="mt-4">
                            <span className="text-4xl font-black text-foreground">${tier.price}</span>
                            <span className="text-muted-foreground">/report</span>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <ul className="space-y-2">
                            {tier.features.slice(0, 6).map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                            {tier.features.length > 6 && (
                              <li className="text-sm text-muted-foreground pl-6">
                                +{tier.features.length - 6} more features
                              </li>
                            )}
                          </ul>

                          {tier.excluded && tier.excluded.length > 0 && (
                            <>
                              <Separator />
                              <ul className="space-y-2">
                                {tier.excluded.slice(0, 3).map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <X className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                                    <span className="line-through">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}

                          <Button
                            className={`w-full ${
                              isSelected
                                ? "bg-accent text-primary"
                                : tier.popular
                                ? "bg-accent/20 text-accent border border-accent"
                                : tier.bestValue
                                ? "bg-green-600/20 text-green-600 border border-green-600"
                                : ""
                            }`}
                            variant={isSelected ? "default" : "outline"}
                            data-testid={`button-select-${tier.id}`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Selected
                              </>
                            ) : (
                              "Select Plan"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Feature Comparison Table */}
                <Card data-testid="card-comparison-table">
                  <CardHeader>
                    <CardTitle>Feature Comparison</CardTitle>
                    <CardDescription>
                      Compare what's included in each report tier
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 pr-4 font-medium">Feature</th>
                          <th className="text-center py-3 px-4 font-medium">Standard</th>
                          <th className="text-center py-3 px-4 font-medium bg-accent/10">Pro</th>
                          <th className="text-center py-3 px-4 font-medium">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody>
                        {featureComparison.map((row, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 pr-4">{row.feature}</td>
                            <td className="text-center py-3 px-4">
                              {row.standard ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-4 bg-accent/5">
                              {row.pro ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-4">
                              {row.enterprise ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-muted/50 font-bold">
                          <td className="py-3 pr-4">Price</td>
                          <td className="text-center py-3 px-4">$199</td>
                          <td className="text-center py-3 px-4 bg-accent/10">$349</td>
                          <td className="text-center py-3 px-4">$499</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Generate Report CTA */}
                <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-accent/30">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <div className={`p-3 rounded-full ${selectedTierData.iconBg}`}>
                        <selectedTierData.icon className={`h-8 w-8 ${selectedTierData.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">{selectedTierData.name} Report</p>
                        <p className="text-muted-foreground">{address || "Enter address above"}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-3xl font-black text-accent">${selectedTierData.price}</p>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleGenerateReport}
                      disabled={checkoutMutation.isPending || !address}
                      className="w-full bg-accent text-primary font-bold text-lg py-6"
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
                          Generate Report — ${selectedTierData.price}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Lock className="h-4 w-4" />
                      Secure checkout powered by Stripe
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My Reports Tab */}
              <TabsContent value="my-reports" className="space-y-8">
                {authLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Loading your reports...</p>
                  </div>
                ) : !isAuthenticated ? (
                  <Card className="max-w-md mx-auto text-center">
                    <CardContent className="py-12 space-y-4">
                      <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="text-xl font-bold">Sign In Required</h3>
                      <p className="text-muted-foreground">
                        Please sign in to view your purchased reports.
                      </p>
                      <Button
                        onClick={() => (window.location.href = "/login")}
                        data-testid="button-sign-in"
                      >
                        Sign In
                      </Button>
                    </CardContent>
                  </Card>
                ) : reportsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Loading your reports...</p>
                  </div>
                ) : myReports && myReports.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Your Reports</h2>
                      <Badge variant="outline">{myReports.length} reports</Badge>
                    </div>

                    <div className="grid gap-4">
                      {myReports.map((report) => {
                        const statusConfig = STATUS_COLORS[report.status];
                        const StatusIcon = statusConfig.icon;
                        const tierData = reportTiers.find((t) => t.id === report.tier);

                        return (
                          <Card key={report.id} data-testid={`card-report-${report.id}`}>
                            <CardContent className="p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{report.address}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {tierData?.name}
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <Badge className={`${statusConfig.bg} ${statusConfig.text}`}>
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
                                      variant="default"
                                      size="sm"
                                      onClick={() => window.open(report.pdfUrl, "_blank")}
                                      data-testid={`button-download-${report.id}`}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </Button>
                                  )}

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => reanalyzeMutation.mutate(report.id)}
                                    disabled={reanalyzeMutation.isPending || report.status === "processing"}
                                    data-testid={`button-reanalyze-${report.id}`}
                                  >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${reanalyzeMutation.isPending ? "animate-spin" : ""}`} />
                                    Re-analyze
                                  </Button>
                                </div>
                              </div>

                              {report.status === "processing" && (
                                <div className="mt-4 space-y-2">
                                  <Progress value={66} className="h-2" />
                                  <p className="text-xs text-muted-foreground">
                                    Analyzing location data... This may take a few minutes.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Card className="max-w-md mx-auto text-center">
                    <CardContent className="py-12 space-y-4">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="text-xl font-bold">No Reports Yet</h3>
                      <p className="text-muted-foreground">
                        You haven't purchased any location reports yet.
                        Order your first analysis to get started.
                      </p>
                      <Button onClick={() => setActiveTab("order")} data-testid="button-order-first">
                        <FileText className="h-4 w-4 mr-2" />
                        Order Your First Report
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* What You Get Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                What's Inside Your CLEANBI Report
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every report delivers actionable intelligence to help you make confident investment decisions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "17-Factor CLEANBI Score",
                  description: "Comprehensive 0-100 scoring with A/B/C grading based on customer potential, location quality, equipment needs, adaptability, financial metrics, brand strength, and market intelligence.",
                  color: "text-purple-500"
                },
                {
                  icon: Camera,
                  title: "Vision AI Photo Analysis",
                  description: "AI-powered street-level imagery assessment evaluating parking availability, building visibility, signage potential, and property condition. (Pro & Enterprise)",
                  color: "text-blue-500"
                },
                {
                  icon: Map,
                  title: "Competitor Mapping",
                  description: "Detailed 3-mile radius competitor analysis including names, ratings, review counts, and distance. Identify market gaps and positioning opportunities.",
                  color: "text-red-500"
                },
                {
                  icon: Users,
                  title: "Demographic Breakdown",
                  description: "Population density, median household income, renter percentage, and age distribution. Understand your potential customer base.",
                  color: "text-green-500"
                },
                {
                  icon: Sparkles,
                  title: "AI Recommendations",
                  description: "Machine-generated strategic recommendations covering pricing, services, marketing, and operational improvements. (Pro & Enterprise)",
                  color: "text-accent"
                },
                {
                  icon: Video,
                  title: "Aerial View Flyover",
                  description: "3D satellite imagery and aerial video flyover showing traffic patterns, parking, and surrounding development. (Enterprise only)",
                  color: "text-indigo-500"
                }
              ].map((feature, index) => (
                <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className={`p-3 rounded-xl bg-muted w-fit ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8 text-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <span>Secure Stripe Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <span>Reports in 24-48 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                <span>All 50 US States Covered</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-foreground mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {seoFaqs.map((faq, index) => (
                <Card key={index} data-testid={`faq-${index}`}>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
              Ready to Analyze Your Next Location?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Get the data-driven insights you need to make confident investment decisions.
              Professional reports starting at just $199.
            </p>
            <Button
              size="lg"
              onClick={() => {
                setActiveTab("order");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-accent text-primary font-bold text-lg px-8 py-6"
              data-testid="button-final-cta"
            >
              <FileText className="h-5 w-5 mr-2" />
              Order Your CLEANBI Report
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
