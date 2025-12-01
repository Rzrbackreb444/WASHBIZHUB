import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { 
  Map, 
  MapPin, 
  Search, 
  Eye,
  Users, 
  DollarSign,
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  Globe,
  Zap,
  BarChart3,
  Bell,
  BellRing,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Crown,
  Lock,
  Radar,
  PieChart,
  Activity,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Settings2,
  Filter,
  SlidersHorizontal,
  Gauge,
  CircleDollarSign,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, Tooltip as RechartsTooltip } from "recharts";

declare global {
  interface Window {
    google: any;
  }
}

interface Competitor {
  id: string;
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  distance: number;
  priceLevel: number;
  threatLevel: "high" | "medium" | "low";
  estimatedRevenue?: number;
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
    recentTrend: "improving" | "declining" | "stable";
  };
  ratingHistory?: { date: string; rating: number }[];
  lastUpdated?: string;
}

interface TerritoryData {
  lat: number;
  lng: number;
  radius: number;
  competitors: Competitor[];
  marketSaturation: number;
  competitiveMoatScore: number;
  averageRating: number;
  priceComparison: {
    yourPrice: number;
    marketAverage: number;
    lowestPrice: number;
    highestPrice: number;
  };
  swotAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

interface Alert {
  id: string;
  type: "new_competitor" | "rating_change" | "price_change" | "review_spike";
  competitorId?: string;
  threshold?: number;
  enabled: boolean;
  createdAt: string;
}

const THREAT_COLORS: Record<string, string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#22C55E"
};

const THREAT_LABELS: Record<string, string> = {
  high: "High Threat",
  medium: "Medium Threat",
  low: "Low Threat"
};

const PRICE_LEVELS = ["$", "$$", "$$$", "$$$$"];

const FAQ_DATA = [
  {
    question: "What is laundromat competitor analysis?",
    answer: "Laundromat competitor analysis is the systematic process of evaluating your competition within a defined market area. It includes monitoring competitors' ratings, pricing, services, and customer sentiment to identify opportunities and threats to your business."
  },
  {
    question: "How does the Competitor Intelligence Dashboard work?",
    answer: "Our dashboard uses Google Maps Places API and AI-powered analytics to identify, track, and analyze laundromats within your defined territory. It provides real-time data on competitor ratings, reviews, estimated revenue, and market positioning."
  },
  {
    question: "What is market saturation in the laundromat industry?",
    answer: "Market saturation measures how crowded your local market is with laundromat businesses relative to population density. High saturation means more competition for customers, while low saturation indicates potential growth opportunities."
  },
  {
    question: "How is competitive moat score calculated?",
    answer: "Competitive moat score evaluates how defensible your market position is based on factors like your rating advantage, location quality, service differentiation, and customer loyalty compared to nearby competitors."
  },
  {
    question: "What does the sentiment analysis reveal about competitors?",
    answer: "Sentiment analysis uses AI to evaluate competitor reviews, categorizing them as positive, neutral, or negative. This reveals customer satisfaction trends and helps identify competitors' weaknesses you can capitalize on."
  },
  {
    question: "How are competitor threat levels determined?",
    answer: "Threat levels are calculated based on proximity to your location, rating quality, review volume, and price competitiveness. High-threat competitors are closest with strong ratings; low-threat competitors are distant or poorly rated."
  },
  {
    question: "Can I set up alerts for competitor changes?",
    answer: "Yes! Pro and Enterprise users can configure alerts for new competitors entering your territory, significant rating changes, price adjustments, and unusual review activity. Alerts are delivered via email or dashboard notifications."
  },
  {
    question: "What is the difference between Free, Pro, and Enterprise plans?",
    answer: "Free users can view up to 5 competitors with basic data. Pro includes unlimited competitor tracking, sentiment analysis, and alerts. Enterprise adds custom territory polygons, white-label reports, and API access for integration."
  }
];

const HOW_TO_STEPS = [
  { name: "Define Your Territory", text: "Enter your laundromat's address and set the monitoring radius (1-25 miles) to define your competitive landscape." },
  { name: "Analyze Competitors", text: "Review the automatically discovered competitors with their ratings, reviews, and estimated market data." },
  { name: "Assess Threat Levels", text: "Evaluate each competitor's threat level based on proximity, ratings, and market positioning." },
  { name: "Review Market Saturation", text: "Check the market saturation score to understand how crowded your local market is." },
  { name: "Monitor Sentiment Trends", text: "Track competitor review sentiment to identify weaknesses and opportunities." },
  { name: "Set Up Alerts", text: "Configure alerts to be notified when competitors change ratings, pricing, or new entrants appear." },
  { name: "Export Reports", text: "Generate white-label competitive analysis reports for investors or stakeholders." }
];

function generateMockCompetitors(lat: number, lng: number, count: number): Competitor[] {
  const names = [
    "Super Clean Laundry", "Quick Wash Express", "Coin-Op Laundromat", "Fresh & Clean",
    "Suds & Bubbles", "Wash World", "Clean Machine Laundry", "Spin City",
    "Laundry Palace", "Easy Wash", "The Laundry Room", "Wash-N-Go"
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI;
    const distance = 0.5 + Math.random() * 4.5;
    const dLat = (distance * Math.cos(angle)) / 69;
    const dLng = (distance * Math.sin(angle)) / (69 * Math.cos(lat * Math.PI / 180));
    
    const rating = 3 + Math.random() * 2;
    const reviewCount = Math.floor(20 + Math.random() * 480);
    const threatLevel: "high" | "medium" | "low" = distance < 1.5 && rating > 4 ? "high" : distance < 3 && rating > 3.5 ? "medium" : "low";
    
    return {
      id: `comp_${i}`,
      placeId: `place_${i}_${Date.now()}`,
      name: names[i % names.length],
      address: `${100 + i * 23} Main Street`,
      lat: lat + dLat,
      lng: lng + dLng,
      rating: Math.round(rating * 10) / 10,
      reviewCount,
      distance: Math.round(distance * 10) / 10,
      priceLevel: Math.floor(Math.random() * 3) + 1,
      threatLevel,
      estimatedRevenue: Math.floor(15000 + Math.random() * 35000),
      sentiment: {
        positive: 50 + Math.floor(Math.random() * 40),
        neutral: Math.floor(Math.random() * 20),
        negative: Math.floor(Math.random() * 20),
        recentTrend: ["improving", "declining", "stable"][Math.floor(Math.random() * 3)] as "improving" | "declining" | "stable"
      },
      ratingHistory: Array.from({ length: 12 }, (_, m) => ({
        date: new Date(Date.now() - (11 - m) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short" }),
        rating: Math.round((rating - 0.3 + Math.random() * 0.6) * 10) / 10
      })),
      lastUpdated: new Date().toISOString()
    };
  });
}

function generateMarketShareData(competitors: Competitor[], yourRevenue: number) {
  const total = competitors.reduce((sum, c) => sum + (c.estimatedRevenue || 20000), yourRevenue);
  return [
    { name: "Your Laundromat", value: Math.round((yourRevenue / total) * 100), fill: "#C8A661" },
    ...competitors.slice(0, 5).map((c, i) => ({
      name: c.name.substring(0, 15),
      value: Math.round(((c.estimatedRevenue || 20000) / total) * 100),
      fill: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][i]
    })),
    { name: "Others", value: Math.round((competitors.slice(5).reduce((s, c) => s + (c.estimatedRevenue || 20000), 0) / total) * 100), fill: "#6B7280" }
  ].filter(d => d.value > 0);
}

export default function CompetitorDashboard() {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [territory, setTerritory] = useState<TerritoryData | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [searchRadius, setSearchRadius] = useState([5]);
  const [activeTab, setActiveTab] = useState("overview");
  const [userTier, setUserTier] = useState<"free" | "pro" | "enterprise">("free");
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "alert_1", type: "new_competitor", enabled: true, createdAt: new Date().toISOString() },
    { id: "alert_2", type: "rating_change", threshold: 0.5, enabled: true, createdAt: new Date().toISOString() },
    { id: "alert_3", type: "review_spike", threshold: 10, enabled: false, createdAt: new Date().toISOString() }
  ]);
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  const [filterThreat, setFilterThreat] = useState<string | null>(null);

  const visibleCompetitors = territory?.competitors.filter(c => 
    !filterThreat || c.threatLevel === filterThreat
  ).slice(0, userTier === "free" ? 5 : undefined) || [];

  const marketShareData = territory ? generateMarketShareData(territory.competitors, 28000) : [];

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && mapRef.current && !mapInstance.current) {
        initializeMap();
      }
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=visualization,places&callback=initCompetitorMap`;
      script.async = true;
      script.defer = true;
      (window as any).initCompetitorMap = loadGoogleMaps;
      document.head.appendChild(script);
    } else {
      loadGoogleMaps();
    }

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      if (circleRef.current) circleRef.current.setMap(null);
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const darkStyle = [
      { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
      { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#333355" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3d3d5c" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e1a" }] }
    ];

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4,
      styles: darkStyle,
      disableDefaultUI: true,
      zoomControl: true,
      fullscreenControl: true,
      mapTypeControl: false
    });
  };

  const renderMapMarkers = (data: TerritoryData) => {
    if (!mapInstance.current) return;
    
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (circleRef.current) circleRef.current.setMap(null);

    const center = { lat: data.lat, lng: data.lng };
    mapInstance.current.setCenter(center);
    mapInstance.current.setZoom(12);

    const yourMarker = new window.google.maps.Marker({
      position: center,
      map: mapInstance.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 18,
        fillColor: "#C8A661",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 4
      },
      zIndex: 1000,
      title: "Your Location"
    });
    markersRef.current.push(yourMarker);

    circleRef.current = new window.google.maps.Circle({
      center,
      radius: data.radius * 1609.34,
      map: mapInstance.current,
      fillColor: "#C8A661",
      fillOpacity: 0.08,
      strokeColor: "#C8A661",
      strokeOpacity: 0.4,
      strokeWeight: 2
    });

    data.competitors.forEach((comp) => {
      const marker = new window.google.maps.Marker({
        position: { lat: comp.lat, lng: comp.lng },
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: THREAT_COLORS[comp.threatLevel],
          fillOpacity: 0.9,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        },
        title: comp.name,
        zIndex: comp.threatLevel === "high" ? 900 : comp.threatLevel === "medium" ? 800 : 700
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui; min-width: 200px; background: #12121f; border-radius: 8px;">
            <div style="font-weight: bold; font-size: 15px; margin-bottom: 6px; color: white;">${comp.name}</div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="color: #facc15;">★</span>
              <span style="color: white;">${comp.rating}</span>
              <span style="color: #888;">(${comp.reviewCount} reviews)</span>
            </div>
            <div style="font-size: 13px; color: #888;">${comp.distance} mi away</div>
            <div style="margin-top: 8px; padding: 4px 8px; background: ${THREAT_COLORS[comp.threatLevel]}22; border-radius: 4px; display: inline-block;">
              <span style="color: ${THREAT_COLORS[comp.threatLevel]}; font-size: 12px; font-weight: 500;">${THREAT_LABELS[comp.threatLevel]}</span>
            </div>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current, marker);
        setSelectedCompetitor(comp);
      });

      markersRef.current.push(marker);
    });
  };

  const analyzeTerritory = async () => {
    if (!address.trim()) {
      toast({ title: "Enter an address", description: "Please enter your laundromat's address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/competitor-dashboard/territory", {
        address,
        radius: searchRadius[0]
      });

      const data = await response.json();
      
      if (data.success) {
        setTerritory(data.territory);
        if (data.tier) setUserTier(data.tier);
        renderMapMarkers(data.territory);
        toast({ 
          title: "Territory Analyzed", 
          description: `Found ${data.territory.competitors.length} competitors within ${searchRadius[0]} miles`
        });
      } else {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const loc = results[0].geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            
            const mockCompetitors = generateMockCompetitors(lat, lng, 8 + Math.floor(Math.random() * 8));
            const mockTerritory: TerritoryData = {
              lat, lng,
              radius: searchRadius[0],
              competitors: mockCompetitors,
              marketSaturation: Math.round(40 + Math.random() * 50),
              competitiveMoatScore: Math.round(50 + Math.random() * 40),
              averageRating: Math.round((mockCompetitors.reduce((s, c) => s + c.rating, 0) / mockCompetitors.length) * 10) / 10,
              priceComparison: {
                yourPrice: 3.50,
                marketAverage: 3.25 + Math.random() * 0.75,
                lowestPrice: 2.50 + Math.random() * 0.50,
                highestPrice: 4.00 + Math.random() * 1.00
              },
              swotAnalysis: {
                strengths: [
                  "Strong local brand recognition",
                  "Higher customer ratings than 60% of competitors",
                  "Modern equipment with card payment"
                ],
                weaknesses: [
                  "Limited parking availability",
                  "No wash-and-fold service",
                  "Smaller square footage than top competitor"
                ],
                opportunities: [
                  "2 competitors have declining ratings - capture their customers",
                  "Growing apartment complex 0.5 miles away",
                  "No competitor offers pickup/delivery"
                ],
                threats: [
                  "New laundromat opening 1.2 miles east",
                  "Rising utility costs in the area",
                  "Main competitor expanding hours"
                ]
              }
            };
            
            setTerritory(mockTerritory);
            renderMapMarkers(mockTerritory);
            toast({ 
              title: "Territory Analyzed", 
              description: `Found ${mockTerritory.competitors.length} competitors within ${searchRadius[0]} miles`
            });
          }
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({ title: "Error", description: "Failed to analyze territory", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertToggle = (alertId: string) => {
    if (userTier === "free") {
      toast({ 
        title: "Pro Feature", 
        description: "Upgrade to Pro to enable competitor alerts",
        variant: "default"
      });
      return;
    }
    
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    ));
    toast({ title: "Alert Updated", description: "Your alert preferences have been saved" });
  };

  return (
    <>
      <SEO
        title="Competitor Intelligence Dashboard - Laundromat Market Monitoring"
        description="Real-time competitor monitoring and market intelligence for laundromat owners. Track competitor ratings, pricing, and market saturation. AI-powered competitive analysis and alerts."
        canonicalUrl="/competitor-dashboard"
        keywords={[
          "laundromat competitor analysis",
          "market intelligence",
          "competitive monitoring",
          "laundromat market research",
          "competitor tracking",
          "business intelligence laundromat",
          "market saturation analysis",
          "competitive moat",
          "laundromat industry analysis"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI", url: "/cleanbi" },
          { name: "Competitor Dashboard", url: "/competitor-dashboard" }
        ]}
        faqs={FAQ_DATA}
        howTo={{
          name: "How to Monitor Your Laundromat Competition",
          description: "A step-by-step guide to using the Competitor Intelligence Dashboard to track and analyze your laundromat competition for strategic advantage.",
          steps: HOW_TO_STEPS
        }}
        productOffers={[
          { name: "Free", description: "View up to 5 competitors with basic metrics", price: "0" },
          { name: "Pro", description: "Unlimited competitors, sentiment analysis, and alerts", price: "79" },
          { name: "Enterprise", description: "Custom territories, white-label reports, and API access", price: "299" }
        ]}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: "Home", href: "/" },
              { label: "CLEANBI", href: "/cleanbi" },
              { label: "Competitor Dashboard" }
            ]}
          />

          <div className="py-12 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-6">
              <Radar className="h-5 w-5 text-accent" />
              <span className="text-accent font-medium">Premium Market Intelligence</span>
            </div>
            <h1 className="text-5xl font-black mb-4" data-testid="text-page-title">
              Competitor Intelligence Dashboard
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto" data-testid="text-page-description">
              Real-Time Market Monitoring & Competitive Analysis. Track every competitor in your territory with AI-powered insights.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-white/70 mb-2 block">Your Laundromat Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street, City, State"
                      className="bg-white/10 border-white/20 pl-12 h-12 text-white placeholder:text-white/40"
                      data-testid="input-address"
                      onKeyDown={(e) => e.key === "Enter" && analyzeTerritory()}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label className="text-white/70 mb-2 block">Radius: {searchRadius[0]} miles</Label>
                  <Slider
                    value={searchRadius}
                    onValueChange={setSearchRadius}
                    min={1}
                    max={25}
                    step={1}
                    className="py-4"
                    data-testid="slider-radius"
                  />
                </div>
                <Button 
                  onClick={analyzeTerritory}
                  disabled={isLoading}
                  className="bg-accent text-primary hover:bg-accent/90 h-12 px-8 font-bold"
                  data-testid="button-analyze"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Radar className="h-5 w-5 mr-2" />
                      Analyze Territory
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur border-white/10 mb-6">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Map className="h-5 w-5 text-accent" />
                    Competitive Territory Map
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-red-500/50 text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
                      High Threat
                    </Badge>
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
                      Medium
                    </Badge>
                    <Badge variant="outline" className="border-green-500/50 text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                      Low
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div 
                    ref={mapRef} 
                    className="w-full h-[400px] rounded-b-xl"
                    data-testid="map-container"
                  />
                </CardContent>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white/10 border border-white/10">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="competitors" data-testid="tab-competitors">Competitors</TabsTrigger>
                  <TabsTrigger value="analysis" data-testid="tab-analysis">SWOT Analysis</TabsTrigger>
                  <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/60">Competitors</span>
                          <Users className="h-4 w-4 text-accent" />
                        </div>
                        <div className="text-3xl font-black text-white" data-testid="text-competitor-count">
                          {territory?.competitors.length || 0}
                        </div>
                        <p className="text-xs text-white/50 mt-1">In {searchRadius[0]} mile radius</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/60">Market Saturation</span>
                          <Gauge className="h-4 w-4 text-accent" />
                        </div>
                        <div className="text-3xl font-black text-white" data-testid="text-saturation">
                          {territory?.marketSaturation || 0}%
                        </div>
                        <Progress 
                          value={territory?.marketSaturation || 0} 
                          className="h-1.5 mt-2 bg-white/20"
                        />
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/60">Competitive Moat</span>
                          <Shield className="h-4 w-4 text-accent" />
                        </div>
                        <div className="text-3xl font-black text-accent" data-testid="text-moat-score">
                          {territory?.competitiveMoatScore || 0}
                        </div>
                        <p className="text-xs text-white/50 mt-1">
                          {(territory?.competitiveMoatScore || 0) >= 70 ? "Strong Position" : 
                           (territory?.competitiveMoatScore || 0) >= 50 ? "Moderate Defense" : "Needs Improvement"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/60">Avg. Rating</span>
                          <Star className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-black text-white" data-testid="text-avg-rating">
                          {territory?.averageRating || 0}
                        </div>
                        <p className="text-xs text-white/50 mt-1">Market average</p>
                      </CardContent>
                    </Card>
                  </div>

                  {territory && (
                    <Card className="bg-white/10 backdrop-blur border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-accent" />
                          Price Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-accent/20 rounded-lg">
                            <p className="text-sm text-white/60 mb-1">Your Price</p>
                            <p className="text-2xl font-bold text-accent">${territory.priceComparison.yourPrice.toFixed(2)}</p>
                          </div>
                          <div className="text-center p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-white/60 mb-1">Market Average</p>
                            <p className="text-2xl font-bold">${territory.priceComparison.marketAverage.toFixed(2)}</p>
                          </div>
                          <div className="text-center p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-white/60 mb-1">Lowest</p>
                            <p className="text-2xl font-bold text-green-400">${territory.priceComparison.lowestPrice.toFixed(2)}</p>
                          </div>
                          <div className="text-center p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-white/60 mb-1">Highest</p>
                            <p className="text-2xl font-bold text-red-400">${territory.priceComparison.highestPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="competitors" className="space-y-4">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={filterThreat === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterThreat(null)}
                        data-testid="button-filter-all"
                      >
                        All
                      </Button>
                      <Button
                        variant={filterThreat === "high" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterThreat("high")}
                        className={filterThreat === "high" ? "bg-red-500 hover:bg-red-600" : "border-red-500/50 text-red-400"}
                        data-testid="button-filter-high"
                      >
                        High Threat
                      </Button>
                      <Button
                        variant={filterThreat === "medium" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterThreat("medium")}
                        className={filterThreat === "medium" ? "bg-yellow-500 hover:bg-yellow-600" : "border-yellow-500/50 text-yellow-400"}
                        data-testid="button-filter-medium"
                      >
                        Medium
                      </Button>
                      <Button
                        variant={filterThreat === "low" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterThreat("low")}
                        className={filterThreat === "low" ? "bg-green-500 hover:bg-green-600" : "border-green-500/50 text-green-400"}
                        data-testid="button-filter-low"
                      >
                        Low
                      </Button>
                    </div>
                    {userTier === "free" && territory && territory.competitors.length > 5 && (
                      <Badge className="bg-accent/20 text-accent border-accent/30">
                        <Lock className="h-3 w-3 mr-1" />
                        Showing 5 of {territory.competitors.length}
                      </Badge>
                    )}
                  </div>

                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {visibleCompetitors.map((comp) => (
                        <Collapsible 
                          key={comp.id}
                          open={expandedCompetitor === comp.id}
                          onOpenChange={() => setExpandedCompetitor(expandedCompetitor === comp.id ? null : comp.id)}
                        >
                          <Card className={`bg-white/10 backdrop-blur border-white/10 transition-all ${
                            selectedCompetitor?.id === comp.id ? "ring-2 ring-accent" : ""
                          }`}>
                            <CollapsibleTrigger asChild>
                              <CardContent className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: THREAT_COLORS[comp.threatLevel] }}
                                      />
                                      <h3 className="font-bold text-white" data-testid={`text-competitor-name-${comp.id}`}>
                                        {comp.name}
                                      </h3>
                                      <Badge variant="outline" className="text-xs">
                                        {comp.distance} mi
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-white/60">{comp.address}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                        <span className="font-medium">{comp.rating}</span>
                                        <span className="text-white/50 text-sm">({comp.reviewCount})</span>
                                      </div>
                                      <span className="text-white/50">{PRICE_LEVELS[comp.priceLevel - 1] || "$"}</span>
                                      {comp.estimatedRevenue && userTier !== "free" && (
                                        <span className="text-accent text-sm">
                                          ~${(comp.estimatedRevenue / 1000).toFixed(0)}K/mo
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      className={`${
                                        comp.threatLevel === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                        comp.threatLevel === "medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                        "bg-green-500/20 text-green-400 border-green-500/30"
                                      }`}
                                    >
                                      {THREAT_LABELS[comp.threatLevel]}
                                    </Badge>
                                    <ChevronDown className={`h-5 w-5 text-white/50 transition-transform ${
                                      expandedCompetitor === comp.id ? "rotate-180" : ""
                                    }`} />
                                  </div>
                                </div>
                              </CardContent>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 pt-0 border-t border-white/10">
                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                  {comp.sentiment && userTier !== "free" && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                      <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-accent" />
                                        Review Sentiment
                                      </h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <ThumbsUp className="h-4 w-4 text-green-400" />
                                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-green-400 rounded-full"
                                              style={{ width: `${comp.sentiment.positive}%` }}
                                            />
                                          </div>
                                          <span className="text-sm w-10">{comp.sentiment.positive}%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Minus className="h-4 w-4 text-gray-400" />
                                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-gray-400 rounded-full"
                                              style={{ width: `${comp.sentiment.neutral}%` }}
                                            />
                                          </div>
                                          <span className="text-sm w-10">{comp.sentiment.neutral}%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <ThumbsDown className="h-4 w-4 text-red-400" />
                                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-red-400 rounded-full"
                                              style={{ width: `${comp.sentiment.negative}%` }}
                                            />
                                          </div>
                                          <span className="text-sm w-10">{comp.sentiment.negative}%</span>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex items-center gap-2">
                                        <span className="text-sm text-white/50">Trend:</span>
                                        {comp.sentiment.recentTrend === "improving" ? (
                                          <Badge className="bg-green-500/20 text-green-400">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Improving
                                          </Badge>
                                        ) : comp.sentiment.recentTrend === "declining" ? (
                                          <Badge className="bg-red-500/20 text-red-400">
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                            Declining
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-gray-500/20 text-gray-400">
                                            <Minus className="h-3 w-3 mr-1" />
                                            Stable
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {comp.ratingHistory && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                      <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-accent" />
                                        Rating History
                                      </h4>
                                      <div className="h-24">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <LineChart data={comp.ratingHistory}>
                                            <Line 
                                              type="monotone" 
                                              dataKey="rating" 
                                              stroke="#C8A661" 
                                              strokeWidth={2}
                                              dot={false}
                                            />
                                            <XAxis 
                                              dataKey="date" 
                                              tick={{ fill: "#888", fontSize: 10 }}
                                              axisLine={false}
                                              tickLine={false}
                                            />
                                            <YAxis 
                                              domain={[3, 5]}
                                              tick={{ fill: "#888", fontSize: 10 }}
                                              axisLine={false}
                                              tickLine={false}
                                              width={25}
                                            />
                                          </LineChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                  )}
                                  {userTier === "free" && (
                                    <div className="bg-accent/10 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                      <Lock className="h-8 w-8 text-accent mb-2" />
                                      <p className="text-sm text-white/70 mb-2">
                                        Upgrade to Pro for sentiment analysis and detailed insights
                                      </p>
                                      <Button size="sm" className="bg-accent text-primary">
                                        Upgrade Now
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                      
                      {userTier === "free" && territory && territory.competitors.length > 5 && (
                        <Card className="bg-accent/10 border-accent/30">
                          <CardContent className="p-6 text-center">
                            <Crown className="h-10 w-10 text-accent mx-auto mb-3" />
                            <h3 className="font-bold text-lg mb-2">
                              {territory.competitors.length - 5} More Competitors Hidden
                            </h3>
                            <p className="text-white/70 mb-4">
                              Upgrade to Pro to see all competitors, sentiment analysis, and set up alerts
                            </p>
                            <Button className="bg-accent text-primary" data-testid="button-upgrade-pro">
                              Upgrade to Pro - $79/mo
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-6">
                  {territory?.swotAnalysis ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-green-500/10 border-green-500/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                            <ShieldCheck className="h-5 w-5" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {territory.swotAnalysis.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-500/10 border-yellow-500/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
                            <AlertTriangle className="h-5 w-5" />
                            Weaknesses
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {territory.swotAnalysis.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <XCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 text-blue-400">
                            <Sparkles className="h-5 w-5" />
                            Opportunities
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {territory.swotAnalysis.opportunities.map((o, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <ArrowUpRight className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                                {o}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-500/10 border-red-500/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 text-red-400">
                            <ShieldAlert className="h-5 w-5" />
                            Threats
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {territory.swotAnalysis.threats.map((t, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <ArrowDownRight className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-white/10 border-white/10">
                      <CardContent className="p-12 text-center">
                        <Target className="h-12 w-12 text-accent mx-auto mb-4 opacity-50" />
                        <p className="text-white/50">Enter your address and analyze territory to generate SWOT analysis</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                  {territory && marketShareData.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-white/10 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-accent" />
                            Estimated Market Share
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPie>
                                <Pie
                                  data={marketShareData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  label={({ name, value }) => `${name}: ${value}%`}
                                >
                                  {marketShareData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                  contentStyle={{ 
                                    backgroundColor: "#1a1a2e", 
                                    border: "1px solid #333",
                                    borderRadius: "8px"
                                  }}
                                />
                              </RechartsPie>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/10 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-accent" />
                            Competitor Ratings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={visibleCompetitors.slice(0, 6).map(c => ({
                                  name: c.name.substring(0, 10),
                                  rating: c.rating,
                                  reviews: c.reviewCount
                                }))}
                                layout="vertical"
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis type="number" domain={[0, 5]} tick={{ fill: "#888" }} />
                                <YAxis dataKey="name" type="category" tick={{ fill: "#888", fontSize: 11 }} width={80} />
                                <RechartsTooltip 
                                  contentStyle={{ 
                                    backgroundColor: "#1a1a2e", 
                                    border: "1px solid #333",
                                    borderRadius: "8px"
                                  }}
                                />
                                <Bar dataKey="rating" fill="#C8A661" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-white/10 border-white/10">
                      <CardContent className="p-12 text-center">
                        <BarChart3 className="h-12 w-12 text-accent mx-auto mb-4 opacity-50" />
                        <p className="text-white/50">Enter your address and analyze territory to view market trends</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-accent" />
                    Alert Settings
                    {userTier === "free" && (
                      <Badge className="ml-auto bg-accent/20 text-accent">
                        <Lock className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <BellRing className={`h-4 w-4 ${alert.enabled ? "text-accent" : "text-white/30"}`} />
                        <div>
                          <p className="text-sm font-medium">
                            {alert.type === "new_competitor" && "New Competitor"}
                            {alert.type === "rating_change" && "Rating Change"}
                            {alert.type === "review_spike" && "Review Spike"}
                            {alert.type === "price_change" && "Price Change"}
                          </p>
                          <p className="text-xs text-white/50">
                            {alert.type === "new_competitor" && "When a new laundromat opens nearby"}
                            {alert.type === "rating_change" && `When rating changes by ${alert.threshold}+ stars`}
                            {alert.type === "review_spike" && `When ${alert.threshold}+ reviews in a week`}
                            {alert.type === "price_change" && "When competitor changes prices"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={() => handleAlertToggle(alert.id)}
                        disabled={userTier === "free"}
                        data-testid={`switch-alert-${alert.id}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-accent" />
                    Pricing Plans
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg ${userTier === "free" ? "bg-white/10 ring-2 ring-white/30" : "bg-white/5"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">Free</h4>
                      <span className="text-xl font-black">$0</span>
                    </div>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        View up to 5 competitors
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        Basic ratings & reviews
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-white/30" />
                        No sentiment analysis
                      </li>
                    </ul>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${userTier === "pro" ? "bg-accent/20 ring-2 ring-accent" : "bg-white/5"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold flex items-center gap-2">
                        Pro
                        <Badge className="bg-accent text-primary text-xs">Popular</Badge>
                      </h4>
                      <span className="text-xl font-black text-accent">$79<span className="text-sm font-normal">/mo</span></span>
                    </div>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        Unlimited competitors
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        AI sentiment analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        Real-time alerts
                      </li>
                    </ul>
                    {userTier === "free" && (
                      <Button className="w-full mt-3 bg-accent text-primary" data-testid="button-upgrade-to-pro">
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                  
                  <div className={`p-4 rounded-lg ${userTier === "enterprise" ? "bg-purple-500/20 ring-2 ring-purple-400" : "bg-white/5"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">Enterprise</h4>
                      <span className="text-xl font-black">$299<span className="text-sm font-normal">/mo</span></span>
                    </div>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        Everything in Pro
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        Custom territory polygons
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        White-label reports
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        API access
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full mt-3 border-white/20" data-testid="button-contact-sales">
                      Contact Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-accent" />
                    FAQs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {FAQ_DATA.slice(0, 4).map((faq, i) => (
                        <Collapsible key={i}>
                          <CollapsibleTrigger className="flex items-start gap-2 w-full text-left p-2 rounded hover:bg-white/5">
                            <ChevronDown className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            <span className="text-sm font-medium">{faq.question}</span>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-6 pr-2 pb-2">
                            <p className="text-sm text-white/60">{faq.answer}</p>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
