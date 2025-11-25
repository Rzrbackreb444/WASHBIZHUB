import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Brain,
  Sparkles,
  MessageSquare,
  Send,
  User,
  Bot,
  Upload,
  FileText,
  BookOpen,
  GraduationCap,
  Film,
  ScrollText,
  Zap,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Search,
  Globe,
  Target,
  Lightbulb,
  Wand2,
  Save,
  Download,
  Eye,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  BarChart3,
  PieChart,
  LineChart,
  Image as ImageIcon,
  Quote,
  Star,
  Heart,
  Award,
  Factory,
  Rocket,
  DollarSign,
  Gauge,
  Activity,
  Layers,
  GitBranch,
  Database,
  Cpu,
  Cloud,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import sosLogo from "@assets/sos logo_1764087549375.png";

// Types
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  analysis?: StyleAnalysis;
}

interface StyleAnalysis {
  vocabularyLevel: string;
  toneDetected: string[];
  sentenceComplexity: string;
  emotionalIntensity: number;
  formalityLevel: number;
  favoriteWords: string[];
  favoritePhrases: string[];
}

interface VoiceProfile {
  id: string;
  profileName: string;
  confidenceScore: number;
  vocabularyLevel: string;
  toneProfile: { primary: string; secondary: string[] };
  emotionalRange: { intensity: number; types: string[] };
  formalityLevel: number;
  sampleCount: number;
  totalWordsAnalyzed: number;
  favoriteWords: string[];
  favoritePhrases: string[];
}

interface Industry {
  id: string;
  industrySlug: string;
  displayName: string;
  description: string;
  relatedIndustries: string[];
  primaryKeywords: string[];
}

interface ContentFormat {
  id: string;
  name: string;
  icon: typeof BookOpen;
  description: string;
  targetWords: string;
  estimatedTime: string;
}

// Content Format Options
const contentFormats: ContentFormat[] = [
  { id: "book", name: "Full Book", icon: BookOpen, description: "Complete manuscript (50-200k words)", targetWords: "50,000-200,000", estimatedTime: "15-45 mins" },
  { id: "course", name: "Course", icon: GraduationCap, description: "Educational modules with lessons", targetWords: "20,000-50,000", estimatedTime: "10-20 mins" },
  { id: "screenplay", name: "Screenplay", icon: Film, description: "Movie/TV script with dialogue", targetWords: "15,000-30,000", estimatedTime: "8-15 mins" },
  { id: "doctrine", name: "Doctrine/Manifesto", icon: ScrollText, description: "Guiding principles document", targetWords: "5,000-20,000", estimatedTime: "5-10 mins" },
  { id: "memoir", name: "Memoir", icon: Heart, description: "Personal story autobiography", targetWords: "40,000-80,000", estimatedTime: "12-25 mins" },
  { id: "medical_guide", name: "Medical Guide", icon: Activity, description: "Health/recovery guide with citations", targetWords: "30,000-60,000", estimatedTime: "15-30 mins" },
];

// Intelligence Tiers
const intelligenceTiers = [
  { id: "economy", name: "Economy", description: "Gemini FREE tier (1.5M tokens/day)", cost: "$0-5/book", providers: ["Gemini"], color: "text-green-500" },
  { id: "standard", name: "Standard", description: "Multi-AI orchestration", cost: "$18-42/book", providers: ["Gemini", "Claude", "GPT-4"], color: "text-blue-500" },
  { id: "premium", name: "Premium", description: "Full agent pipeline", cost: "$42-86/book", providers: ["Claude", "GPT-4", "Perplexity"], color: "text-purple-500" },
  { id: "ultra", name: "Ultra", description: "Maximum quality + images", cost: "$86-140/book", providers: ["All AI", "DALL-E 3", "Research"], color: "text-orange-500" },
];

// Sample Industries for Auto-Pivot
const sampleIndustries: Industry[] = [
  { id: "1", industrySlug: "stroke_recovery", displayName: "Stroke Recovery", description: "Brain injury rehabilitation and recovery", relatedIndustries: ["dropfoot", "neuroplasticity", "physical_therapy"], primaryKeywords: ["stroke recovery", "brain rehabilitation", "neuroplasticity"] },
  { id: "2", industrySlug: "dropfoot", displayName: "Drop Foot", description: "Foot drop condition and treatments", relatedIndustries: ["stroke_recovery", "afo_braces", "gait_training"], primaryKeywords: ["drop foot exercises", "AFO braces", "foot drop recovery"] },
  { id: "3", industrySlug: "physical_therapy", displayName: "Physical Therapy", description: "Movement and rehabilitation exercises", relatedIndustries: ["stroke_recovery", "sports_rehab", "occupational_therapy"], primaryKeywords: ["PT exercises", "rehab techniques", "movement therapy"] },
  { id: "4", industrySlug: "laundromat", displayName: "Laundromat Business", description: "Commercial laundry operations", relatedIndustries: ["car_wash", "dry_cleaning", "retail"], primaryKeywords: ["laundromat investment", "coin laundry", "commercial laundry"] },
];

export default function ProductionConsole() {
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 **Welcome to the Style Learning Studio!**

I'm here to learn YOUR unique writing voice. The more we chat, the better I'll understand your style.

**How this works:**
1. Share writing samples (paste text, upload docs, or just chat naturally)
2. I'll analyze your vocabulary, tone, sentence patterns, and signature phrases
3. Your voice profile gets stored forever and used for ALL future content

**Ready to start?** You can:
• Paste a writing sample below
• Upload a document
• Just start chatting naturally - I'll learn from our conversation!

What would you like to do?`,
      timestamp: new Date(),
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice Profile State
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Content Generation State
  const [selectedFormat, setSelectedFormat] = useState<string>("book");
  const [selectedTier, setSelectedTier] = useState<string>("economy");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("stroke_recovery");
  const [contentTopic, setContentTopic] = useState("");
  const [targetWordCount, setTargetWordCount] = useState(50000);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(false);

  // Pipeline State
  const [pipelineStatus, setPipelineStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState("");

  // SERP Research State
  const [serpKeywords, setSerpKeywords] = useState<string[]>([]);
  const [serpLoading, setSerpLoading] = useState(false);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle sending chat message
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate AI analysis and response
    setTimeout(() => {
      const wordCount = currentMessage.split(/\s+/).length;
      const analysis: StyleAnalysis = {
        vocabularyLevel: wordCount > 50 ? "advanced" : "intermediate",
        toneDetected: ["conversational", "determined"],
        sentenceComplexity: "varied",
        emotionalIntensity: 65,
        formalityLevel: 45,
        favoriteWords: extractFrequentWords(currentMessage),
        favoritePhrases: [],
      };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateStyleFeedback(currentMessage, analysis),
        timestamp: new Date(),
        analysis,
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Update training progress
      setTrainingProgress(prev => Math.min(prev + 15, 100));

      // Update voice profile
      if (trainingProgress > 50) {
        setVoiceProfile({
          id: "profile-1",
          profileName: "My Voice",
          confidenceScore: Math.min(trainingProgress + 15, 95),
          vocabularyLevel: analysis.vocabularyLevel,
          toneProfile: { primary: analysis.toneDetected[0], secondary: analysis.toneDetected.slice(1) },
          emotionalRange: { intensity: analysis.emotionalIntensity, types: ["hope", "determination"] },
          formalityLevel: analysis.formalityLevel,
          sampleCount: chatMessages.filter(m => m.role === "user").length + 1,
          totalWordsAnalyzed: chatMessages.reduce((sum, m) => sum + m.content.split(/\s+/).length, 0) + wordCount,
          favoriteWords: analysis.favoriteWords,
          favoritePhrases: ["never give up", "one step at a time"],
        });
      }
    }, 1500);
  };

  // Extract frequent words from text
  const extractFrequentWords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "to", "of", "and", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from"]);
    const filtered = words.filter(w => w.length > 3 && !stopWords.has(w));
    const counts = filtered.reduce((acc, word) => ({ ...acc, [word]: (acc[word] || 0) + 1 }), {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([word]) => word);
  };

  // Generate style feedback
  const generateStyleFeedback = (text: string, analysis: StyleAnalysis): string => {
    const wordCount = text.split(/\s+/).length;
    return `**Excellent!** I'm learning your voice. Here's what I detected:

📊 **Quick Analysis:**
• **Words analyzed:** ${wordCount}
• **Vocabulary:** ${analysis.vocabularyLevel}
• **Tone:** ${analysis.toneDetected.join(", ")}
• **Formality:** ${analysis.formalityLevel}% (${analysis.formalityLevel < 40 ? "casual" : analysis.formalityLevel < 60 ? "balanced" : "formal"})
• **Emotional intensity:** ${analysis.emotionalIntensity}%

${analysis.favoriteWords.length > 0 ? `🔤 **Your signature words:** ${analysis.favoriteWords.join(", ")}` : ""}

**Training Progress: ${Math.min(trainingProgress + 15, 100)}%**

${trainingProgress + 15 >= 70 ? "🎉 Your voice profile is strong! Ready to generate content in YOUR style." : "Keep sharing more samples to strengthen your voice profile!"}`;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCurrentMessage(text.slice(0, 5000)); // Limit to 5000 chars
      };
      reader.readAsText(file);
    }
  };

  // Handle SERP keyword research
  const handleSerpResearch = async () => {
    setSerpLoading(true);
    // Simulate SERP API call
    setTimeout(() => {
      const industry = sampleIndustries.find(i => i.industrySlug === selectedIndustry);
      setSerpKeywords([
        ...industry?.primaryKeywords || [],
        `how to recover from ${industry?.displayName.toLowerCase()}`,
        `${industry?.displayName.toLowerCase()} exercises`,
        `best ${industry?.displayName.toLowerCase()} treatment`,
        `${industry?.displayName.toLowerCase()} success stories`,
      ]);
      setSerpLoading(false);
    }, 2000);
  };

  // Handle content generation
  const handleStartGeneration = async () => {
    setPipelineStatus("running");
    setPipelineProgress(0);

    const agents = ["Research Agent", "Outline Agent", "Writer Agent", "Creative Agent", "Editor Agent", "Image Agent"];
    
    for (let i = 0; i < agents.length; i++) {
      setCurrentAgent(agents[i]);
      setPipelineProgress((i + 1) / agents.length * 100);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setPipelineStatus("completed");
    setCurrentAgent("");
  };

  return (
    <>
      <Helmet>
        <title>Production Console | Stroke Lyfe Publishing Factory</title>
        <meta name="description" content="Industrial-scale book production with AI. Learn writing style through conversation, generate complete manuscripts without chunking, and publish across multiple formats." />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/sra">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <img src={sosLogo} alt="Stroke Lyfe Publishing" className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <Factory className="h-5 w-5 text-orange-500" />
                  Industrial Publishing Factory
                </h1>
                <p className="text-xs text-gray-400">Learn style → Generate complete manuscripts → Publish everywhere</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-500">
                <Zap className="h-3 w-3 mr-1" />
                FREE Tier Active
              </Badge>
              <Button variant="outline" size="sm" data-testid="button-settings">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-60px)]">
          {/* Left Panel - Style Learning Chat */}
          <div className="w-1/3 border-r border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <h2 className="font-semibold">Style Learning Studio</h2>
                </div>
                <Badge variant={voiceProfile ? "default" : "secondary"} className={voiceProfile ? "bg-purple-600" : ""}>
                  {voiceProfile ? `${voiceProfile.confidenceScore}% Learned` : "Training..."}
                </Badge>
              </div>
              
              {/* Training Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Voice Profile Strength</span>
                  <span>{trainingProgress}%</span>
                </div>
                <Progress value={trainingProgress} className="h-2" />
              </div>

              {/* Voice Profile Summary */}
              {voiceProfile && (
                <div className="mt-3 p-2 bg-gray-800/50 rounded-lg text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400">Tone:</span>
                      <span className="ml-1 text-purple-400">{voiceProfile.toneProfile.primary}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Formality:</span>
                      <span className="ml-1">{voiceProfile.formalityLevel}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Samples:</span>
                      <span className="ml-1">{voiceProfile.sampleCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Words:</span>
                      <span className="ml-1">{voiceProfile.totalWordsAnalyzed.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {msg.role === "user" ? (
                        <>
                          <AvatarFallback className="bg-orange-600">U</AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={sosLogo} />
                          <AvatarFallback className="bg-purple-600">AI</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-orange-600/20 border border-orange-600/30"
                          : "bg-gray-800/50 border border-gray-700"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={sosLogo} />
                      <AvatarFallback className="bg-purple-600">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
              <div className="flex gap-2 mb-2">
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" asChild className="cursor-pointer">
                    <span>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Sample
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  data-testid="input-file-upload"
                />
                <Button variant="outline" size="sm" data-testid="button-paste-sample">
                  <FileText className="h-4 w-4 mr-1" />
                  Paste Text
                </Button>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Chat naturally or paste a writing sample..."
                  className="min-h-[60px] resize-none bg-gray-800 border-gray-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Content Generation */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="generate" className="flex-1 flex flex-col">
              <div className="border-b border-gray-800 px-4">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="generate" className="data-[state=active]:bg-gray-800" data-testid="tab-generate">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate
                  </TabsTrigger>
                  <TabsTrigger value="research" className="data-[state=active]:bg-gray-800" data-testid="tab-research">
                    <Search className="h-4 w-4 mr-2" />
                    SERP Research
                  </TabsTrigger>
                  <TabsTrigger value="pipeline" className="data-[state=active]:bg-gray-800" data-testid="tab-pipeline">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Pipeline
                  </TabsTrigger>
                  <TabsTrigger value="outputs" className="data-[state=active]:bg-gray-800" data-testid="tab-outputs">
                    <Layers className="h-4 w-4 mr-2" />
                    Outputs
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Generate Tab */}
              <TabsContent value="generate" className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Configuration */}
                  <div className="space-y-6">
                    {/* Content Format Selection */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-orange-500" />
                          Content Format
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {contentFormats.map((format) => (
                            <button
                              key={format.id}
                              onClick={() => setSelectedFormat(format.id)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selectedFormat === format.id
                                  ? "bg-orange-600/20 border-orange-600"
                                  : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                              }`}
                              data-testid={`button-format-${format.id}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <format.icon className="h-4 w-4" />
                                <span className="font-medium text-sm">{format.name}</span>
                              </div>
                              <p className="text-[10px] text-gray-400">{format.description}</p>
                              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                <span>{format.targetWords} words</span>
                                <span>{format.estimatedTime}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Industry Selection (Auto-Pivot) */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          Industry / Topic
                          <Badge variant="outline" className="ml-auto text-xs border-blue-500 text-blue-500">
                            Auto-Pivot
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                          <SelectTrigger className="bg-gray-800 border-gray-700" data-testid="select-industry">
                            <SelectValue placeholder="Select industry..." />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            {sampleIndustries.map((industry) => (
                              <SelectItem key={industry.id} value={industry.industrySlug}>
                                {industry.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedIndustry && (
                          <div className="p-2 bg-gray-800/50 rounded text-xs">
                            <div className="text-gray-400 mb-1">Related topics for auto-pivot:</div>
                            <div className="flex flex-wrap gap-1">
                              {sampleIndustries
                                .find(i => i.industrySlug === selectedIndustry)
                                ?.relatedIndustries.map((related) => (
                                  <Badge key={related} variant="secondary" className="text-[10px]">
                                    {related.replace("_", " ")}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Intelligence Tier */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-purple-500" />
                          Intelligence Tier
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {intelligenceTiers.map((tier) => (
                            <button
                              key={tier.id}
                              onClick={() => setSelectedTier(tier.id)}
                              className={`w-full p-3 rounded-lg border text-left transition-all ${
                                selectedTier === tier.id
                                  ? "bg-purple-600/20 border-purple-600"
                                  : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                              }`}
                              data-testid={`button-tier-${tier.id}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${tier.color}`}>{tier.name}</span>
                                  {tier.id === "economy" && (
                                    <Badge className="bg-green-600 text-[10px]">FREE</Badge>
                                  )}
                                </div>
                                <span className="text-sm text-gray-400">{tier.cost}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                              <div className="flex gap-1 mt-2">
                                {tier.providers.map((p) => (
                                  <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Topic & Options */}
                  <div className="space-y-6">
                    {/* Topic/Brief */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Your Topic / Brief
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Textarea
                          value={contentTopic}
                          onChange={(e) => setContentTopic(e.target.value)}
                          placeholder="Describe what you want to create...

Example: 'A comprehensive guide to recovering from drop foot after stroke. Include exercises, AFO brace recommendations, real success stories, and a 12-week recovery plan.'"
                          className="min-h-[120px] bg-gray-800 border-gray-700"
                          data-testid="input-content-topic"
                        />
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Target Word Count</Label>
                          <span className="text-sm font-medium text-orange-500">{targetWordCount.toLocaleString()} words</span>
                        </div>
                        <Slider
                          value={[targetWordCount]}
                          onValueChange={([val]) => setTargetWordCount(val)}
                          min={5000}
                          max={200000}
                          step={5000}
                          className="py-2"
                          data-testid="slider-word-count"
                        />
                      </CardContent>
                    </Card>

                    {/* Options */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Settings className="h-4 w-4 text-gray-400" />
                          Generation Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-blue-400" />
                            <Label className="text-sm">Include AI Images</Label>
                          </div>
                          <Switch
                            checked={includeImages}
                            onCheckedChange={setIncludeImages}
                            data-testid="switch-include-images"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Quote className="h-4 w-4 text-green-400" />
                            <Label className="text-sm">Include Medical Citations</Label>
                          </div>
                          <Switch
                            checked={includeCitations}
                            onCheckedChange={setIncludeCitations}
                            data-testid="switch-include-citations"
                          />
                        </div>
                        <Separator className="bg-gray-700" />
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Brain className="h-4 w-4 text-purple-400" />
                          <span>Using voice profile: </span>
                          <Badge variant="secondary">{voiceProfile?.profileName || "Default"}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Generate Button */}
                    <Card className="bg-gradient-to-r from-orange-600/20 to-purple-600/20 border-orange-600/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">Ready to Generate</div>
                            <div className="text-sm text-gray-400">
                              {contentFormats.find(f => f.id === selectedFormat)?.name} •{" "}
                              {targetWordCount.toLocaleString()} words •{" "}
                              {intelligenceTiers.find(t => t.id === selectedTier)?.name} tier
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Estimated cost</div>
                            <div className="text-lg font-bold text-green-400">
                              {selectedTier === "economy" ? "FREE" : intelligenceTiers.find(t => t.id === selectedTier)?.cost}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleStartGeneration}
                          disabled={!contentTopic.trim() || pipelineStatus === "running"}
                          className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700"
                          size="lg"
                          data-testid="button-start-generation"
                        >
                          {pipelineStatus === "running" ? (
                            <>
                              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Rocket className="h-5 w-5 mr-2" />
                              Generate Complete Manuscript
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* SERP Research Tab */}
              <TabsContent value="research" className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Search className="h-4 w-4 text-blue-500" />
                        Keyword Research
                      </CardTitle>
                      <CardDescription>Find what people are searching for</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter seed keyword..."
                          className="bg-gray-800 border-gray-700"
                          data-testid="input-seed-keyword"
                        />
                        <Button
                          onClick={handleSerpResearch}
                          disabled={serpLoading}
                          data-testid="button-serp-research"
                        >
                          {serpLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {serpKeywords.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-400">Found Keywords:</Label>
                          <div className="flex flex-wrap gap-2">
                            {serpKeywords.map((kw, i) => (
                              <Badge key={i} variant="secondary" className="cursor-pointer hover-elevate">
                                {kw}
                                <Plus className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        GSC Performance
                      </CardTitle>
                      <CardDescription>Google Search Console metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Connect Google Search Console to see performance</p>
                        <Button variant="outline" size="sm" className="mt-3" data-testid="button-connect-gsc">
                          Connect GSC
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Pipeline Tab */}
              <TabsContent value="pipeline" className="flex-1 p-4 overflow-auto">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-purple-500" />
                      Multi-Agent Pipeline
                    </CardTitle>
                    <CardDescription>Watch your content being created by specialized AI agents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["Research Agent", "Outline Agent", "Writer Agent", "Creative Agent", "Editor Agent", "Image Agent"].map((agent, i) => {
                        const isComplete = pipelineProgress >= ((i + 1) / 6) * 100;
                        const isCurrent = currentAgent === agent;
                        return (
                          <div key={agent} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isComplete ? "bg-green-600" : isCurrent ? "bg-purple-600 animate-pulse" : "bg-gray-700"
                            }`}>
                              {isComplete ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : isCurrent ? (
                                <RefreshCw className="h-5 w-5 animate-spin" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{agent}</div>
                              <div className="text-xs text-gray-400">
                                {isComplete ? "Completed" : isCurrent ? "Running..." : "Pending"}
                              </div>
                            </div>
                            <Badge variant={isComplete ? "default" : "secondary"} className={isComplete ? "bg-green-600" : ""}>
                              {isComplete ? "Done" : isCurrent ? "Active" : "Waiting"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                    
                    {pipelineStatus !== "idle" && (
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>{Math.round(pipelineProgress)}%</span>
                        </div>
                        <Progress value={pipelineProgress} className="h-3" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Outputs Tab */}
              <TabsContent value="outputs" className="flex-1 p-4 overflow-auto">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-orange-500" />
                      Generated Content
                    </CardTitle>
                    <CardDescription>Your completed manuscripts and publications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pipelineStatus === "completed" ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                          <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Generation Complete!
                          </div>
                          <p className="text-sm text-gray-300">Your manuscript is ready. {targetWordCount.toLocaleString()} words generated in your unique voice.</p>
                        </div>
                        <div className="flex gap-2">
                          <Button data-testid="button-preview-output">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" data-testid="button-download-output">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" data-testid="button-publish-output">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Publish to Marketplace
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No content generated yet</p>
                        <p className="text-sm">Complete the generation process to see your outputs here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
