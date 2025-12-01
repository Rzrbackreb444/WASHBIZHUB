import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  MapPin,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Brain,
  Target,
  Loader2,
  Crown,
  Zap,
  Check,
  X,
  Download,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Map,
  BarChart3,
  Shield,
  Sparkles,
  AlertTriangle,
  Info,
  Lock,
  Play,
  FileText,
  Globe,
  Layers,
  Star,
  ArrowRight
} from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface LocationAnalysis {
  address: string;
  lat: number;
  lng: number;
  cleanbiScore: number;
  grade: string;
  competitorCount: number;
  populationDensity: number;
  medianIncome: number;
  trafficScore: number;
  estimatedRevenue: number;
  opportunityLevel: "goldmine" | "promising" | "moderate" | "saturated" | "oversaturated";
  cannibalizationRisk?: number;
  roiPotential?: number;
}

interface ExpansionAnalysisResult {
  locations: LocationAnalysis[];
  portfolioScore: number;
  aiRecommendations: string[];
  territoryWarnings: string[];
  optimizedOrder: number[];
  totalInvestmentPotential: number;
}

interface PricingTier {
  id: "free" | "pro" | "enterprise";
  name: string;
  price: number;
  priceLabel: string;
  maxLocations: number;
  icon: any;
  iconBg: string;
  iconColor: string;
  popular?: boolean;
  description: string;
  features: string[];
}

const GRADE_COLORS: Record<string, string> = {
  "A": "bg-green-500/20 text-green-400 border-green-500/30",
  "B": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "C": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Needs Work": "bg-orange-500/20 text-orange-400 border-orange-500/30"
};

const OPPORTUNITY_COLORS: Record<string, string> = {
  "goldmine": "bg-amber-500/20 text-amber-400",
  "promising": "bg-green-500/20 text-green-400",
  "moderate": "bg-blue-500/20 text-blue-400",
  "saturated": "bg-yellow-500/20 text-yellow-400",
  "oversaturated": "bg-red-500/20 text-red-400"
};

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free",
    maxLocations: 3,
    icon: Target,
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    description: "Test the waters with basic comparison",
    features: [
      "Compare up to 3 locations",
      "CLEANBI Score for each",
      "Basic grade assessment",
      "Competition count",
      "Map visualization"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceLabel: "$49/analysis",
    maxLocations: 10,
    icon: Zap,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    popular: true,
    description: "Full comparison suite for serious investors",
    features: [
      "Compare up to 10 locations",
      "Everything in Free, plus:",
      "AI Portfolio Optimization",
      "Investment Prioritization",
      "Estimated Revenue Projections",
      "ROI Potential Ranking",
      "Demographic Deep Dive"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    priceLabel: "$149/analysis",
    maxLocations: 25,
    icon: Crown,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    description: "Full enterprise suite for franchisees",
    features: [
      "Compare up to 25 locations",
      "Everything in Pro, plus:",
      "Territory Cannibalization Analysis",
      "Market Saturation Mapping",
      "Export to PDF/CSV",
      "Priority Processing",
      "Dedicated Support"
    ]
  }
];

const seoFaqs = [
  {
    question: "How do I analyze multiple laundromat locations at once?",
    answer: "Use our Multi-Location Expansion Planner to enter up to 25 addresses and receive side-by-side CLEANBI scores, demographic analysis, competition data, and AI-powered investment prioritization for each location simultaneously."
  },
  {
    question: "What is laundromat franchise expansion analysis?",
    answer: "Franchise expansion analysis evaluates multiple potential locations for new laundromat sites using data-driven metrics including population density, median income, competition levels, and market saturation to identify the best investment opportunities."
  },
  {
    question: "How do you prevent cannibalization between laundromat locations?",
    answer: "Our territory analysis feature calculates the overlap between potential locations based on drive-time radiuses and population demographics, alerting you when two locations might compete for the same customers."
  },
  {
    question: "What is portfolio optimization for laundromat investors?",
    answer: "Portfolio optimization uses AI to recommend the ideal mix of locations across different demographics and income levels, balancing risk and potential returns to maximize your overall investment performance."
  },
  {
    question: "How accurate is the CLEANBI score for site selection?",
    answer: "CLEANBI scores are calculated using 17 real-time data factors including census demographics, Google Places competition data, traffic patterns, and regional benchmarks with 85%+ accuracy in predicting location viability."
  },
  {
    question: "What ROI should I expect from a good laundromat location?",
    answer: "Grade A locations typically achieve 20-30% ROI with payback periods of 3-5 years. Our Expansion Planner estimates revenue potential and ranks locations by investment priority based on local market conditions."
  },
  {
    question: "Can I export my multi-location analysis?",
    answer: "Enterprise tier users can export complete analysis reports to PDF and CSV formats, including all CLEANBI scores, demographic data, competition analysis, and AI recommendations for presentations and business plans."
  },
  {
    question: "How many locations can I analyze at once?",
    answer: "Free users can compare 3 locations, Pro users up to 10 locations, and Enterprise users can analyze up to 25 locations simultaneously with full territory and cannibalization analysis."
  }
];

const howToSteps = [
  {
    name: "Enter Your Target Addresses",
    text: "Paste up to 25 potential laundromat addresses, one per line, into the analysis form. Include full street addresses with city, state, and ZIP for best accuracy."
  },
  {
    name: "Run Multi-Location Analysis",
    text: "Click 'Analyze All Locations' to simultaneously process each address through our CLEANBI scoring engine, gathering demographic, competition, and market data."
  },
  {
    name: "Review Comparison Matrix",
    text: "Examine the side-by-side comparison table showing CLEANBI scores, grades, competition levels, estimated revenue, and opportunity ratings for each location."
  },
  {
    name: "Check AI Recommendations",
    text: "Review AI-powered insights including portfolio optimization suggestions, investment priority rankings, and territory cannibalization warnings."
  },
  {
    name: "Make Your Investment Decision",
    text: "Use the ranked results and export capabilities to make data-driven decisions about which locations to pursue for your laundromat expansion."
  }
];

type SortField = "cleanbiScore" | "grade" | "competitorCount" | "medianIncome" | "estimatedRevenue" | "roiPotential";
type SortDirection = "asc" | "desc";

export default function ExpansionPlanner() {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [addresses, setAddresses] = useState("");
  const [selectedTier, setSelectedTier] = useState<"free" | "pro" | "enterprise">("free");
  const [analysisResult, setAnalysisResult] = useState<ExpansionAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sortField, setSortField] = useState<SortField>("cleanbiScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeTab, setActiveTab] = useState("input");
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const tierLimits: Record<string, number> = {
    free: 3,
    pro: 10,
    enterprise: 25
  };

  const addressList = addresses.split("\n").filter(a => a.trim().length > 0);
  const currentLimit = tierLimits[selectedTier];
  const isOverLimit = addressList.length > currentLimit;

  const analyzeMutation = useMutation({
    mutationFn: async (data: { addresses: string[]; tier: string }) => {
      const response = await apiRequest("POST", "/api/expansion-planner/analyze", data);
      return response.json();
    },
    onSuccess: (data: ExpansionAnalysisResult) => {
      setAnalysisResult(data);
      setActiveTab("results");
      setIsAnalyzing(false);
      setAnalysisProgress(100);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${data.locations.length} locations`,
      });
    },
    onError: (error: Error) => {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze locations",
        variant: "destructive"
      });
    }
  });

  const handleAnalyze = () => {
    if (addressList.length === 0) {
      toast({
        title: "No Addresses",
        description: "Please enter at least one address to analyze",
        variant: "destructive"
      });
      return;
    }

    if (isOverLimit) {
      toast({
        title: "Limit Exceeded",
        description: `${selectedTier} tier allows up to ${currentLimit} locations. Upgrade to analyze more.`,
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    analyzeMutation.mutate({ addresses: addressList, tier: selectedTier });
  };

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && mapRef.current && !mapInstance.current) {
        initializeMap();
      }
    };

    if (!window.google) {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=visualization,places`;
        script.async = true;
        script.defer = true;
        script.onload = loadGoogleMaps;
        document.head.appendChild(script);
      }
    } else {
      loadGoogleMaps();
    }

    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(m => m.setMap(null));
      }
    };
  }, []);

  useEffect(() => {
    if (analysisResult && mapInstance.current) {
      renderLocationMarkers();
    }
  }, [analysisResult]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const darkStyle = [
      { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
      { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#333355" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] }
    ];

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4,
      styles: darkStyle,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });
  };

  const renderLocationMarkers = () => {
    if (!mapInstance.current || !analysisResult) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    analysisResult.locations.forEach((location, index) => {
      const gradeColor = location.grade === "A" ? "#22C55E" :
                         location.grade === "B" ? "#A3E635" :
                         location.grade === "C" ? "#FBBF24" : "#F97316";

      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstance.current,
        label: {
          text: `${index + 1}`,
          color: "#FFFFFF",
          fontWeight: "bold"
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 18,
          fillColor: gradeColor,
          fillOpacity: 0.9,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 200px; color: #1a1a2e;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${location.address}</h3>
            <div style="display: flex; gap: 12px; margin-bottom: 8px;">
              <span style="font-size: 24px; font-weight: bold; color: ${gradeColor};">${location.cleanbiScore}</span>
              <span style="background: ${gradeColor}20; padding: 4px 12px; border-radius: 4px; font-weight: bold;">Grade ${location.grade}</span>
            </div>
            <p style="font-size: 12px; color: #666;">
              ${location.competitorCount} competitors · $${(location.medianIncome/1000).toFixed(0)}K income
            </p>
            <p style="font-size: 14px; font-weight: 600; margin-top: 8px;">
              Est. Revenue: $${(location.estimatedRevenue/1000).toFixed(0)}K/yr
            </p>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: location.lat, lng: location.lng });
    });

    if (analysisResult.locations.length > 0) {
      mapInstance.current.fitBounds(bounds);
    }
  };

  const sortedLocations = analysisResult?.locations?.slice().sort((a, b) => {
    let aVal: number, bVal: number;
    switch (sortField) {
      case "cleanbiScore":
        aVal = a.cleanbiScore;
        bVal = b.cleanbiScore;
        break;
      case "grade":
        aVal = a.grade === "A" ? 4 : a.grade === "B" ? 3 : a.grade === "C" ? 2 : 1;
        bVal = b.grade === "A" ? 4 : b.grade === "B" ? 3 : b.grade === "C" ? 2 : 1;
        break;
      case "competitorCount":
        aVal = a.competitorCount;
        bVal = b.competitorCount;
        break;
      case "medianIncome":
        aVal = a.medianIncome;
        bVal = b.medianIncome;
        break;
      case "estimatedRevenue":
        aVal = a.estimatedRevenue;
        bVal = b.estimatedRevenue;
        break;
      case "roiPotential":
        aVal = a.roiPotential || 0;
        bVal = b.roiPotential || 0;
        break;
      default:
        return 0;
    }
    return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
  }) || [];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortDirection === "desc" ? 
      <ChevronDown className="w-4 h-4 ml-1" /> : 
      <ChevronUp className="w-4 h-4 ml-1" />;
  };

  return (
    <>
      <SEO
        title="Multi-Location Expansion Planner | Laundromat Franchise Site Selection"
        description="Analyze up to 25 laundromat locations simultaneously. AI-powered site selection, portfolio optimization, and territory analysis for franchise operators and investors."
        canonicalUrl="/expansion-planner"
        keywords={[
          "laundromat franchise expansion",
          "multi-location site selection",
          "portfolio optimization",
          "laundromat investment analysis",
          "franchise territory planning",
          "CLEANBI score comparison",
          "laundromat ROI calculator",
          "multi-unit laundromat investment"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI", url: "/cleanbi" },
          { name: "Expansion Planner", url: "/expansion-planner" }
        ]}
        faqs={seoFaqs}
        howTo={{
          name: "How to Evaluate Multiple Laundromat Locations",
          description: "Step-by-step guide to analyzing and comparing multiple potential laundromat sites for franchise expansion using AI-powered tools.",
          steps: howToSteps
        }}
        author={{
          name: "WashBizHub Team",
          expertise: "Laundromat Investment Analysis",
          credentials: "Industry-leading CLEANBI scoring methodology"
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "CLEANBI", href: "/cleanbi" },
              { label: "Expansion Planner" }
            ]}
          />

          {/* Hero Section */}
          <div className="text-center py-12 mb-8">
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
              <Crown className="w-3 h-3 mr-1" />
              Premium Tool
            </Badge>
            <h1 className="text-5xl font-black text-white mb-4">
              Multi-Location Expansion Planner
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              AI-Powered Site Selection for Scaling Your Laundromat Empire
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> Franchise Operators
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" /> Multi-Unit Investors
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Portfolio Managers
              </span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/10">
              <TabsTrigger value="input" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
                <MapPin className="w-4 h-4 mr-2" />
                Input
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-accent data-[state=active]:text-primary" disabled={!analysisResult}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-accent data-[state=active]:text-primary" disabled={!analysisResult}>
                <Map className="w-4 h-4 mr-2" />
                Map
              </TabsTrigger>
            </TabsList>

            {/* Input Tab */}
            <TabsContent value="input" className="space-y-8">
              {/* Tier Selection */}
              <div className="grid md:grid-cols-3 gap-6">
                {pricingTiers.map((tier) => (
                  <Card 
                    key={tier.id}
                    data-testid={`card-tier-${tier.id}`}
                    className={`bg-white/10 backdrop-blur border-2 cursor-pointer transition-all ${
                      selectedTier === tier.id 
                        ? "border-accent shadow-lg shadow-accent/20" 
                        : "border-white/10 hover:border-white/30"
                    } ${tier.popular ? "relative" : ""}`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className={`w-12 h-12 rounded-full ${tier.iconBg} flex items-center justify-center mx-auto mb-3`}>
                        <tier.icon className={`w-6 h-6 ${tier.iconColor}`} />
                      </div>
                      <CardTitle className="text-white">{tier.name}</CardTitle>
                      <p className="text-2xl font-bold text-accent">{tier.priceLabel}</p>
                      <CardDescription className="text-gray-400">
                        Up to {tier.maxLocations} locations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Address Input */}
              <Card className="bg-white/10 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Enter Addresses to Analyze
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter one address per line. Include full street address, city, state, and ZIP for best results.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    data-testid="input-addresses"
                    placeholder={`123 Main Street, Los Angeles, CA 90001\n456 Oak Avenue, San Diego, CA 92101\n789 Pine Road, Phoenix, AZ 85001`}
                    value={addresses}
                    onChange={(e) => setAddresses(e.target.value)}
                    className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Badge variant={isOverLimit ? "destructive" : "secondary"} className="text-sm">
                        {addressList.length} / {currentLimit} locations
                      </Badge>
                      {isOverLimit && (
                        <span className="text-sm text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Upgrade tier to analyze more locations
                        </span>
                      )}
                    </div>
                    
                    <Button
                      data-testid="button-analyze"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || addressList.length === 0 || isOverLimit}
                      className="bg-accent text-primary hover:bg-accent/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Analyze All Locations
                        </>
                      )}
                    </Button>
                  </div>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <Progress value={analysisProgress} className="h-2" />
                      <p className="text-sm text-gray-400 text-center">
                        Analyzing {addressList.length} locations... This may take a moment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features Overview */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { icon: Brain, title: "AI Portfolio Optimization", desc: "Balance demographics across locations", tier: "pro" },
                  { icon: TrendingUp, title: "Investment Prioritization", desc: "Rank by ROI potential", tier: "pro" },
                  { icon: Shield, title: "Territory Analysis", desc: "Prevent cannibalization", tier: "enterprise" },
                  { icon: Download, title: "Export Reports", desc: "PDF & CSV downloads", tier: "enterprise" }
                ].map((feature, idx) => (
                  <Card key={idx} className="bg-white/5 backdrop-blur border-white/10">
                    <CardContent className="pt-6 text-center">
                      <feature.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{feature.desc}</p>
                      <Badge variant="outline" className="text-xs">
                        {feature.tier === "pro" ? "Pro+" : "Enterprise"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {analysisResult && (
                <>
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-400 text-sm mb-1">Locations Analyzed</p>
                        <p className="text-4xl font-black text-white">{analysisResult.locations.length}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-400 text-sm mb-1">Portfolio Score</p>
                        <p className="text-4xl font-black text-accent">{analysisResult.portfolioScore}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-400 text-sm mb-1">Grade A Locations</p>
                        <p className="text-4xl font-black text-green-400">
                          {analysisResult.locations.filter(l => l.grade === "A").length}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-400 text-sm mb-1">Est. Total Revenue</p>
                        <p className="text-4xl font-black text-white">
                          ${(analysisResult.totalInvestmentPotential / 1000).toFixed(0)}K
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Recommendations */}
                  {selectedTier !== "free" && analysisResult.aiRecommendations.length > 0 && (
                    <Card className="bg-gradient-to-r from-accent/20 to-purple-500/20 backdrop-blur border-accent/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Brain className="w-5 h-5 text-accent" />
                          AI Portfolio Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {analysisResult.aiRecommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-200">
                              <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Territory Warnings */}
                  {selectedTier === "enterprise" && analysisResult.territoryWarnings.length > 0 && (
                    <Card className="bg-yellow-500/10 backdrop-blur border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          Territory Cannibalization Warnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.territoryWarnings.map((warning, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-yellow-200">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-1" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Comparison Table */}
                  <Card className="bg-white/10 backdrop-blur border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-accent" />
                        Location Comparison Matrix
                      </CardTitle>
                      {selectedTier === "enterprise" && (
                        <Button variant="outline" size="sm" data-testid="button-export">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10">
                              <TableHead className="text-gray-300">#</TableHead>
                              <TableHead className="text-gray-300 min-w-[200px]">Address</TableHead>
                              <TableHead 
                                className="text-gray-300 cursor-pointer hover:text-white"
                                onClick={() => handleSort("cleanbiScore")}
                              >
                                <span className="flex items-center">
                                  CLEANBI Score <SortIcon field="cleanbiScore" />
                                </span>
                              </TableHead>
                              <TableHead 
                                className="text-gray-300 cursor-pointer hover:text-white"
                                onClick={() => handleSort("grade")}
                              >
                                <span className="flex items-center">
                                  Grade <SortIcon field="grade" />
                                </span>
                              </TableHead>
                              <TableHead 
                                className="text-gray-300 cursor-pointer hover:text-white"
                                onClick={() => handleSort("competitorCount")}
                              >
                                <span className="flex items-center">
                                  Competition <SortIcon field="competitorCount" />
                                </span>
                              </TableHead>
                              <TableHead 
                                className="text-gray-300 cursor-pointer hover:text-white"
                                onClick={() => handleSort("medianIncome")}
                              >
                                <span className="flex items-center">
                                  Med. Income <SortIcon field="medianIncome" />
                                </span>
                              </TableHead>
                              <TableHead 
                                className="text-gray-300 cursor-pointer hover:text-white"
                                onClick={() => handleSort("estimatedRevenue")}
                              >
                                <span className="flex items-center">
                                  Est. Revenue <SortIcon field="estimatedRevenue" />
                                </span>
                              </TableHead>
                              <TableHead className="text-gray-300">Opportunity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedLocations.map((location, idx) => (
                              <TableRow 
                                key={idx} 
                                className="border-white/10 hover:bg-white/5"
                                data-testid={`row-location-${idx}`}
                              >
                                <TableCell className="text-white font-bold">{idx + 1}</TableCell>
                                <TableCell className="text-white text-sm max-w-[200px] truncate">
                                  {location.address}
                                </TableCell>
                                <TableCell>
                                  <span className="text-2xl font-black text-accent">
                                    {location.cleanbiScore}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge className={GRADE_COLORS[location.grade]}>
                                    {location.grade}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-white">
                                  {location.competitorCount} nearby
                                </TableCell>
                                <TableCell className="text-white">
                                  ${(location.medianIncome / 1000).toFixed(0)}K
                                </TableCell>
                                <TableCell className="text-green-400 font-semibold">
                                  ${(location.estimatedRevenue / 1000).toFixed(0)}K/yr
                                </TableCell>
                                <TableCell>
                                  <Badge className={OPPORTUNITY_COLORS[location.opportunityLevel]}>
                                    {location.opportunityLevel === "goldmine" ? "Gold Mine" :
                                     location.opportunityLevel === "promising" ? "High" :
                                     location.opportunityLevel === "moderate" ? "Moderate" :
                                     location.opportunityLevel === "saturated" ? "Saturated" : "Over-saturated"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Upsell for Free Users */}
                  {selectedTier === "free" && (
                    <Card className="bg-gradient-to-r from-accent/20 to-purple-500/20 backdrop-blur border-accent/30">
                      <CardContent className="py-8 text-center">
                        <Lock className="w-12 h-12 text-accent mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                          Unlock Full Analysis Power
                        </h3>
                        <p className="text-gray-300 mb-4 max-w-md mx-auto">
                          Upgrade to Pro for AI recommendations, ROI projections, and analyze up to 10 locations.
                        </p>
                        <Button 
                          className="bg-accent text-primary hover:bg-accent/90"
                          onClick={() => setSelectedTier("pro")}
                        >
                          Upgrade to Pro
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Map Tab */}
            <TabsContent value="map" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur border-white/10 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Map className="w-5 h-5 text-accent" />
                    Location Map View
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {analysisResult?.locations.length || 0} markers
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div 
                    ref={mapRef} 
                    className="w-full h-[500px]"
                    data-testid="map-container"
                  />
                </CardContent>
              </Card>

              {/* Map Legend */}
              <Card className="bg-white/10 backdrop-blur border-white/10">
                <CardContent className="py-4">
                  <div className="flex flex-wrap justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-300">Grade A</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-lime-500" />
                      <span className="text-sm text-gray-300">Grade B</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500" />
                      <span className="text-sm text-gray-300">Grade C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500" />
                      <span className="text-sm text-gray-300">Needs Work</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Separator className="bg-white/10 mb-8" />
            <p className="text-gray-400 mb-4">
              Need help with your expansion analysis?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/cleanbi">
                <Button variant="outline" data-testid="link-cleanbi">
                  <Globe className="w-4 h-4 mr-2" />
                  Single Location Analysis
                </Button>
              </Link>
              <Link href="/consultation">
                <Button className="bg-accent text-primary" data-testid="link-consultation">
                  <Users className="w-4 h-4 mr-2" />
                  Book Expert Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
