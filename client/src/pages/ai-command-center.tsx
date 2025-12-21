import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Cpu,
  Zap,
  Globe,
  Camera,
  Video,
  FileText,
  Map,
  Search,
  Wrench,
  BookOpen,
  BarChart3,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ExternalLink,
  Gauge,
  Sun,
  Wind,
  Eye,
  Mic,
  Languages,
  Bot,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Users,
  Settings
} from "lucide-react";

interface CapabilityCategory {
  title: string;
  icon: any;
  color: string;
  capabilities: Capability[];
}

interface Capability {
  name: string;
  description: string;
  apiKey: string;
  icon: any;
  status: "active" | "available" | "coming_soon";
  link?: string;
  revenue?: string;
}

const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  {
    title: "AI Models",
    icon: Brain,
    color: "#8B5CF6",
    capabilities: [
      { name: "Claude (Anthropic)", description: "Long-form writing, complex reasoning", apiKey: "ANTHROPIC_API_KEY", icon: Brain, status: "active", link: "/ai-book-suite", revenue: "$997/book" },
      { name: "GPT-4 (OpenAI)", description: "General AI, editing, code", apiKey: "OPENAI_API_KEY", icon: Sparkles, status: "active", link: "/ai-book-suite" },
      { name: "Gemini (Google)", description: "Multimodal, vision, analysis", apiKey: "GEMINI_API_KEY", icon: Zap, status: "active", link: "/service-guy-ai" },
      { name: "Perplexity", description: "Real-time research, citations", apiKey: "PERPLEXITY_API_KEY", icon: Search, status: "active", link: "/ai-book-suite" },
      { name: "Grok", description: "Trending topics, current events", apiKey: "GROK_API_KEY", icon: MessageSquare, status: "active" },
    ],
  },
  {
    title: "Vision & Media",
    icon: Camera,
    color: "#EC4899",
    capabilities: [
      { name: "Cloud Vision AI", description: "Image analysis, OCR, object detection", apiKey: "CLOUD_VISION_API_KEY", icon: Eye, status: "active", link: "/service-guy-ai", revenue: "$49/mo" },
      { name: "Veo Video Generation", description: "AI video from text/images", apiKey: "GOOGLE_VERTEX_API_KEY", icon: Video, status: "available", revenue: "$29-99/video" },
      { name: "Street View Static", description: "Property visualization", apiKey: "STREET_VIEW_STATIC_API_KEY", icon: Map, status: "active", link: "/cleanbi-explorer" },
      { name: "Aerial View", description: "Bird's eye property views", apiKey: "AERIAL_VIEW_API_KEY", icon: Globe, status: "available" },
    ],
  },
  {
    title: "Location Intelligence",
    icon: Map,
    color: "#3B82F6",
    capabilities: [
      { name: "Google Maps Suite", description: "Maps, Places, Geocoding, Routes", apiKey: "GOOGLE_MAPS_API_KEY", icon: Map, status: "active", link: "/cleanbi-explorer", revenue: "$99/mo" },
      { name: "Solar API", description: "Rooftop solar potential, utility savings", apiKey: "SOLAR_API_KEY", icon: Sun, status: "active", link: "/cleanbi-explorer" },
      { name: "Air Quality API", description: "Environmental scoring", apiKey: "AIR_QUALITY_API_KEY", icon: Wind, status: "available" },
      { name: "Walk Score", description: "Walkability and transit scores", apiKey: "WALK_SCORE_API_KEY", icon: Users, status: "active", link: "/cleanbi-explorer" },
      { name: "Route Optimization", description: "Delivery route planning", apiKey: "ROUTE_OPTIMIZATION_API_KEY", icon: TrendingUp, status: "active", link: "/route-optimization" },
    ],
  },
  {
    title: "Performance & SEO",
    icon: Gauge,
    color: "#10B981",
    capabilities: [
      { name: "PageSpeed Insights", description: "Website performance audits", apiKey: "PAGESPEED_INSIGHTS_API_KEY", icon: Gauge, status: "active", link: "/seo-command-center", revenue: "$29/audit" },
      { name: "Search Console API", description: "SEO analytics, indexing", apiKey: "GOOGLE_SEARCH_CONSOLE_API_KEY", icon: BarChart3, status: "active", link: "/seo-command-center" },
      { name: "IndexNow", description: "Instant search engine indexing", apiKey: "INDEXNOW_API_KEY", icon: Zap, status: "active" },
      { name: "Knowledge Graph", description: "Entity and business data", apiKey: "KNOWLEDGE_GRAPH_SEARCH_API_KEY", icon: Brain, status: "available" },
    ],
  },
  {
    title: "Voice & Language",
    icon: Mic,
    color: "#F59E0B",
    capabilities: [
      { name: "Speech-to-Text", description: "Voice transcription", apiKey: "CLOUD_SPEECH_TO_TEXT_API_KEY", icon: Mic, status: "active", link: "/service-guy-ai" },
      { name: "Text-to-Speech", description: "AI voice generation", apiKey: "CLOUD_TEXT_TO_SPEECH_API_KEY", icon: MessageSquare, status: "available", revenue: "Audio courses" },
      { name: "Translation", description: "100+ languages", apiKey: "CLOUD_TRANSLATION_API_KEY", icon: Languages, status: "available", revenue: "Global market" },
      { name: "Dialogflow", description: "Conversational AI chatbots", apiKey: "DIAGFLOW_API_KEY", icon: Bot, status: "available" },
    ],
  },
  {
    title: "Workspace & Publishing",
    icon: FileText,
    color: "#6366F1",
    capabilities: [
      { name: "Google Blogger", description: "Auto-publish content for SEO", apiKey: "GOOGLE_BLOGGER_API_KEY", icon: FileText, status: "active", link: "/ai-book-suite" },
      { name: "Google Drive", description: "Cloud storage, vault access", apiKey: "GOOGLE_DRIVE_API_KEY", icon: Globe, status: "active", link: "/forensic-academy" },
      { name: "Google Classroom", description: "Course enrollment automation", apiKey: "GOOGLE_CLASSROOM_API_KEY", icon: BookOpen, status: "active", link: "/forensic-academy", revenue: "$997/course" },
      { name: "Google Sheets", description: "Data export, reports", apiKey: "GOOGLE_SHEETS_API_KEY", icon: BarChart3, status: "active" },
    ],
  },
];

export default function AICommandCenter() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: aiBookStatus } = useQuery({
    queryKey: ["/api/ai-book/status"],
  });

  const totalCapabilities = CAPABILITY_CATEGORIES.reduce((sum, cat) => sum + cat.capabilities.length, 0);
  const activeCapabilities = CAPABILITY_CATEGORIES.reduce(
    (sum, cat) => sum + cat.capabilities.filter(c => c.status === "active").length,
    0
  );

  return (
    <AuthGuard>
      <SEO
        title="AI Command Center | WashBizHub"
        description="Your complete AI arsenal: Claude, GPT-4, Gemini, Vision AI, and 50+ APIs powering the ultimate laundromat intelligence platform."
        canonicalUrl="/ai-command-center"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-background">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl animate-pulse">
                <Cpu className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  AI Command Center
                </h1>
                <p className="text-white/70">Your complete AI arsenal for laundromat intelligence</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{activeCapabilities}/{totalCapabilities}</div>
              <p className="text-white/50 text-sm">APIs Active</p>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">System Status</h3>
                <Badge className="bg-green-500">Operational</Badge>
              </div>
              <Progress value={(activeCapabilities / totalCapabilities) * 100} className="h-2 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">5</div>
                  <div className="text-xs text-white/50">AI Models</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-400">4</div>
                  <div className="text-xs text-white/50">Vision APIs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">5</div>
                  <div className="text-xs text-white/50">Location APIs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">4</div>
                  <div className="text-xs text-white/50">SEO Tools</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {CAPABILITY_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.title;
              
              return (
                <Card
                  key={category.title}
                  className="bg-white/5 border-white/10 overflow-hidden"
                >
                  <CardHeader
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: category.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-white">{category.title}</CardTitle>
                          <CardDescription className="text-white/50">
                            {category.capabilities.filter(c => c.status === "active").length}/{category.capabilities.length} active
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {category.capabilities.map((cap, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              cap.status === "active" ? "bg-green-400" : 
                              cap.status === "available" ? "bg-yellow-400" : "bg-white/20"
                            }`}
                          />
                        ))}
                        <ArrowRight className={`w-5 h-5 text-white/50 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.capabilities.map((cap) => {
                          const CapIcon = cap.icon;
                          return (
                            <div
                              key={cap.name}
                              className={`p-4 rounded-lg border ${
                                cap.status === "active" 
                                  ? "bg-green-500/10 border-green-500/30" 
                                  : cap.status === "available"
                                  ? "bg-yellow-500/10 border-yellow-500/30"
                                  : "bg-white/5 border-white/10"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <CapIcon className="w-4 h-4 text-white/70" />
                                  <span className="font-medium text-white text-sm">{cap.name}</span>
                                </div>
                                {cap.status === "active" ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : cap.status === "available" ? (
                                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-white/30" />
                                )}
                              </div>
                              <p className="text-xs text-white/50 mb-3">{cap.description}</p>
                              <div className="flex items-center justify-between">
                                {cap.revenue && (
                                  <Badge variant="outline" className="text-[#C8A661] border-[#C8A661]/30 text-xs">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {cap.revenue}
                                  </Badge>
                                )}
                                {cap.link && cap.status === "active" && (
                                  <Link href={cap.link}>
                                    <Button size="sm" variant="ghost" className="text-white/50 hover:text-white h-7 px-2">
                                      Open <ExternalLink className="w-3 h-3 ml-1" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Link href="/ai-book-suite">
              <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30 hover:border-orange-400/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <BookOpen className="w-10 h-10 text-orange-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">AI Book Suite</h3>
                  <p className="text-white/60 text-sm">Write your book with Claude + Perplexity + GPT-4. Publish to Blogger.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/service-guy-ai">
              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30 hover:border-blue-400/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <Wrench className="w-10 h-10 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Service Guy AI</h3>
                  <p className="text-white/60 text-sm">Vision AI equipment diagnosis. Photo-based troubleshooting.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/cleanbi-explorer">
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 hover:border-green-400/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <Map className="w-10 h-10 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">CLEANBI Explorer</h3>
                  <p className="text-white/60 text-sm">Street View, Solar, Walk Score, and 17-factor location intelligence.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
