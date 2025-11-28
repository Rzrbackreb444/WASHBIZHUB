import { useState, useRef, useEffect, memo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  DollarSign,
  MapPin,
  Wrench,
  Calculator,
  Trash2,
  Info,
  Crown,
  Zap,
  ArrowUpCircle,
  Target,
  Search,
  Settings,
  Handshake,
  AlertTriangle,
  Building,
  FileText,
  Users,
  Megaphone,
  Check,
  Star,
  ShoppingCart,
  Gift
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import serviceGuyAILogo from "@assets/service guy ai_1764034013003.png";

type JourneyType = 'plan' | 'evaluate' | 'operate' | 'partner' | null;

interface Message {
  role: "user" | "assistant";
  content: string;
  provider?: string;
  timestamp: Date;
}

interface ChatResponse {
  content: string;
  provider: string;
  model: string;
  quota?: {
    tier: string;
    used: number;
    limit: number;
    remaining: number;
    resetDate?: string;
  };
}

interface QuotaInfo {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
  resetDate?: string;
}

const DEFAULT_PROMPTS = [
  {
    icon: DollarSign,
    label: "Valuation",
    prompt: "How do I value a laundromat using the C.L.E.A.N. methodology?",
  },
  {
    icon: TrendingUp,
    label: "ROI Analysis",
    prompt: "What's a realistic ROI for a laundromat and how do I calculate it?",
  },
  {
    icon: MapPin,
    label: "Location",
    prompt: "Walk me through the Kremers Doctrine for location evaluation.",
  },
  {
    icon: Wrench,
    label: "Equipment",
    prompt: "Compare Speed Queen vs Dexter vs Electrolux washers for me.",
  },
  {
    icon: Calculator,
    label: "Pricing",
    prompt: "What vend prices should I use to hit 25-35% EBITDA targets?",
  },
];

const getJourneyPrompts = (journey: JourneyType) => {
  switch (journey) {
    case 'plan':
      return [
        { icon: TrendingUp, label: "ROI Reality", prompt: "What's a realistic ROI for a laundromat investment?" },
        { icon: DollarSign, label: "Capital Needed", prompt: "How much capital do I need to buy a laundromat?" },
        { icon: Calculator, label: "Passive Income?", prompt: "Is owning a laundromat really passive income?" },
        { icon: AlertTriangle, label: "Risks", prompt: "What are the biggest risks of buying a laundromat?" },
        { icon: MapPin, label: "Location", prompt: "How do I evaluate if a location is good?" },
      ];
    case 'evaluate':
      return [
        { icon: Search, label: "CLEANBI Score", prompt: "How do I use CLEANBI to score a location?" },
        { icon: FileText, label: "Due Diligence", prompt: "Walk me through due diligence for a laundromat" },
        { icon: Calculator, label: "Valuation", prompt: "How do I calculate what a laundromat is worth?" },
        { icon: AlertTriangle, label: "Red Flags", prompt: "What red flags should I look for when buying?" },
        { icon: DollarSign, label: "Negotiate", prompt: "How do I negotiate the purchase price?" },
      ];
    case 'operate':
      return [
        { icon: TrendingUp, label: "Revenue", prompt: "How do I increase my laundromat's revenue?" },
        { icon: DollarSign, label: "Pricing", prompt: "What vend prices maximize profit?" },
        { icon: Wrench, label: "Equipment", prompt: "When should I replace vs. repair equipment?" },
        { icon: Building, label: "Utilities", prompt: "How do I reduce utility costs?" },
        { icon: Users, label: "WDF Service", prompt: "How do I add wash-dry-fold service?" },
      ];
    case 'partner':
      return [
        { icon: FileText, label: "Sell", prompt: "How do I list my laundromat for sale?" },
        { icon: Wrench, label: "Equipment", prompt: "What makes a good equipment listing?" },
        { icon: Handshake, label: "Vendor", prompt: "How do I become a WashBizHub vendor?" },
        { icon: Users, label: "Affiliate", prompt: "What affiliate programs are available?" },
        { icon: Megaphone, label: "Advertise", prompt: "How do I advertise on WashBizHub?" },
      ];
    default:
      return DEFAULT_PROMPTS;
  }
};

const getWelcomeMessage = (journey: JourneyType): string => {
  switch (journey) {
    case 'plan':
      return "**Welcome! I'm your laundromat investment guide.**\n\nI can help you understand the industry, evaluate opportunities, and plan your first purchase.\n\nBacked by 60+ years of Kremers family expertise, I'm here to help you:\n• Understand realistic ROI expectations\n• Calculate capital requirements\n• Identify the best locations\n• Avoid common pitfalls\n\nWhat would you like to explore first?";
    case 'evaluate':
      return "**Ready to analyze opportunities? I'm here to help.**\n\nI can help you evaluate locations with CLEANBI, understand valuations, and navigate due diligence.\n\nBacked by 60+ years of Kremers family expertise, let me assist with:\n• CLEANBI location scoring\n• Business valuation methods\n• Due diligence checklists\n• Red flag identification\n\nWhat deal are you looking at?";
    case 'operate':
      return "**Let's optimize your laundromat!**\n\nI can help with pricing strategies, equipment decisions, marketing, and operational efficiency.\n\nBacked by 60+ years of Kremers family expertise, I'm here to help you:\n• Maximize revenue & profit margins\n• Optimize vend pricing\n• Make smart equipment decisions\n• Reduce operating costs\n\nWhat's your biggest challenge right now?";
    case 'partner':
      return "**Looking to connect with laundromat owners?**\n\nI can help you list equipment, advertise your services, and grow your business on WashBizHub.\n\nLet me assist with:\n• Listing laundromats for sale\n• Equipment marketplace strategies\n• Vendor partnership opportunities\n• Advertising best practices\n\nHow can I help you today?";
    default:
      return "**Welcome to Service Guy AI — your AI-powered equipment diagnostic expert.**\n\nI specialize in commercial laundry equipment troubleshooting with access to:\n• **2,200+ error codes** across 70+ brands\n• Step-by-step repair guides\n• Parts recommendations with instant ordering\n• Predictive maintenance insights\n\n**Try the 14-day free trial** to unlock:\n• AI-powered root cause analysis\n• Parts cross-referencing\n• Equipment health scoring\n\nDescribe your issue or enter an error code to get started!";
  }
};

const getJourneyBadge = (journey: JourneyType) => {
  switch (journey) {
    case 'plan':
      return (
        <Badge 
          variant="outline" 
          className="bg-blue-500/20 text-blue-300 border-blue-400/50 gap-1"
          data-testid="badge-journey-context"
        >
          <Target className="h-3 w-3" />
          Planning Mode
        </Badge>
      );
    case 'evaluate':
      return (
        <Badge 
          variant="outline" 
          className="bg-green-500/20 text-green-300 border-green-400/50 gap-1"
          data-testid="badge-journey-context"
        >
          <Search className="h-3 w-3" />
          Buyer Mode
        </Badge>
      );
    case 'operate':
      return (
        <Badge 
          variant="outline" 
          className="bg-orange-500/20 text-orange-300 border-orange-400/50 gap-1"
          data-testid="badge-journey-context"
        >
          <Settings className="h-3 w-3" />
          Owner Mode
        </Badge>
      );
    case 'partner':
      return (
        <Badge 
          variant="outline" 
          className="bg-purple-500/20 text-purple-300 border-purple-400/50 gap-1"
          data-testid="badge-journey-context"
        >
          <Handshake className="h-3 w-3" />
          Partner Mode
        </Badge>
      );
    default:
      return null;
  }
};

const SERVICE_GUY_PRICING = [
  {
    tier: "free",
    name: "Free",
    price: "$0",
    period: "/forever",
    messages: "5 chats/month",
    features: ["Basic error code lookup", "General troubleshooting tips", "Access to 2,200+ error codes"],
    cta: "Current Plan",
    popular: false,
  },
  {
    tier: "essentials",
    name: "Essentials",
    price: "$79",
    period: "/month",
    messages: "50 chats/month",
    features: ["AI-powered diagnostics", "Parts recommendations", "Step-by-step repair guides", "10% rebate on parts orders"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    tier: "pro",
    name: "Pro Shop",
    price: "$199",
    period: "/month",
    messages: "Unlimited",
    features: ["Everything in Essentials", "Multi-store access (5 seats)", "CRM export & analytics", "Priority support", "Custom equipment profiles"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    messages: "Unlimited + API",
    features: ["Everything in Pro", "Unlimited seats", "API access", "White-label options", "Dedicated account manager"],
    cta: "Contact Sales",
    popular: false,
  },
];

const getTierBadge = (tier: string, isTrialActive?: boolean) => {
  if (isTrialActive) {
    return (
      <Badge variant="default" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1">
        <Gift className="h-3 w-3" />
        Free Trial
      </Badge>
    );
  }
  switch (tier) {
    case "enterprise":
      return (
        <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-400 gap-1">
          <Crown className="h-3 w-3" />
          Enterprise
        </Badge>
      );
    case "pro":
      return (
        <Badge variant="default" className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-1">
          <Zap className="h-3 w-3" />
          Pro
        </Badge>
      );
    case "essentials":
      return (
        <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white gap-1">
          <Wrench className="h-3 w-3" />
          Essentials
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Free
        </Badge>
      );
  }
};

export const AIChatWidget = memo(function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userJourney, setUserJourney] = useState<JourneyType>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);

  // Read journey from localStorage on mount
  useEffect(() => {
    const storedJourney = localStorage.getItem('washbizhub_user_journey_type') as JourneyType;
    setUserJourney(storedJourney);
    
    // Set initial welcome message based on journey
    setMessages([
      {
        role: "assistant",
        content: getWelcomeMessage(storedJourney),
        provider: "system",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Fetch user quota on open
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    enabled: isOpen,
  });

  useEffect(() => {
    if (user) {
      setQuotaInfo({
        tier: user.aiConsultantTier || "free",
        used: user.aiMessagesUsed || 0,
        limit: user.aiMonthlyQuota || 10,
        remaining: (user.aiMonthlyQuota || 10) - (user.aiMessagesUsed || 0),
        resetDate: user.aiQuotaResetDate,
      });
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message: userMessage,
        conversationHistory: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
      });
      return response as unknown as ChatResponse;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          provider: data.provider,
          timestamp: new Date(),
        },
      ]);
      
      // Update quota if returned
      if (data.quota) {
        setQuotaInfo(data.quota);
        
        // Show upgrade prompts based on tier
        // Guest: After message 2, prompt to sign up
        // Free: When ≤2 remaining, prompt to upgrade
        if (data.quota.tier === "guest" && data.quota.remaining === 0) {
          setShowUpgradePrompt(true);
        } else if (data.quota.tier === "free" && data.quota.remaining <= 2) {
          setShowUpgradePrompt(true);
        }
      }
      
      setShowSuggestions(false);
    },
    onError: (error: any) => {
      // Handle quota exceeded errors
      if (error.message?.includes("guest_limit_exceeded")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `**You've used your 2 free guest messages!**\n\n**Sign up for a free account to get:**\n• 10 messages per month\n• Save your conversation history\n• Access to all platform features\n\nCreate your free account now!`,
            provider: "system",
            timestamp: new Date(),
          },
        ]);
        setShowUpgradePrompt(true);
      } else if (error.message?.includes("quota") || error.message?.includes("exceeded")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `**You've reached your ${quotaInfo?.tier || 'free'} tier message limit (${quotaInfo?.limit || 10} messages/month).**\n\n**Upgrade to unlock more:**\n\n**Pro ($29/mo)** — 500 messages/month + GPT-4 intelligence\n**Enterprise ($99/mo)** — Unlimited messages + Claude Opus priority\n\nClick "View Plans" below to upgrade!`,
            provider: "system",
            timestamp: new Date(),
          },
        ]);
        setShowUpgradePrompt(true);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I apologize, but I encountered an error. Please try again or contact support if the issue persists.",
            provider: "error",
            timestamp: new Date(),
          },
        ]);
      }
    },
  });

  const handleSend = (messageToSend?: string) => {
    const finalMessage = messageToSend || input;
    if (!finalMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      role: "user",
      content: finalMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(finalMessage);
    setInput("");
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: getWelcomeMessage(userJourney),
        provider: "system",
        timestamp: new Date(),
      },
    ]);
    setShowSuggestions(true);
    setShowUpgradePrompt(false);
  };

  const getUsagePercentage = () => {
    if (!quotaInfo) return 0;
    return (quotaInfo.used / quotaInfo.limit) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        data-testid="button-open-chat"
      >
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3 rounded-full shadow-2xl border-2 border-slate-700 flex items-center gap-3 transition-all duration-300 hover:shadow-slate-900/50 hover:scale-105 active:scale-95">
          <div className="relative">
            <img 
              src={serviceGuyAILogo} 
              alt="Service Guy AI" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-base font-bold text-white">Service Guy AI</span>
            <span className="text-xs font-medium text-emerald-400">Free Trial Available</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-2xl border border-border/50 flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-xl",
        isMinimized ? "h-16" : "h-[650px]",
        "w-[400px] rounded-2xl"
      )}
      data-testid="widget-ai-chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={serviceGuyAILogo} 
              alt="Service Guy AI" 
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              Service Guy AI
              {quotaInfo && getTierBadge(quotaInfo.tier, isTrialActive)}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/80 font-medium">Equipment Diagnostics</p>
              {userJourney && getJourneyBadge(userJourney)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              title="Clear conversation"
              data-testid="button-clear-chat"
              className="text-white hover:bg-white/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            data-testid="button-minimize-chat"
            className="text-white hover:bg-white/20"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-chat"
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quota Bar with Free Trial CTA */}
          {quotaInfo && (
            <div className="px-4 pt-3 pb-2 border-b bg-muted/30">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">
                  Monthly Usage: {quotaInfo.used} / {quotaInfo.limit === 999999 ? "∞" : quotaInfo.limit}
                </span>
                {quotaInfo.tier === "free" && !isTrialActive && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs gap-1 hover-elevate text-emerald-600"
                    onClick={() => setShowPricingModal(true)}
                    data-testid="button-start-trial"
                  >
                    <Gift className="h-3 w-3" />
                    14-Day Free Trial
                  </Button>
                )}
                {quotaInfo.tier !== "enterprise" && quotaInfo.tier !== "free" && quotaInfo.remaining <= 5 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs gap-1 hover-elevate"
                    onClick={() => setShowPricingModal(true)}
                    data-testid="button-upgrade"
                  >
                    <ArrowUpCircle className="h-3 w-3" />
                    Upgrade
                  </Button>
                )}
              </div>
              {quotaInfo.tier !== "enterprise" && (
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full transition-all", getUsageColor())}
                    style={{ width: `${getUsagePercentage()}%` }}
                  />
                </div>
              )}
              {quotaInfo.tier !== "enterprise" && quotaInfo.remaining <= 3 && (
                <p className="text-xs text-destructive font-medium mt-1.5">
                  ⚠️ Only {quotaInfo.remaining} messages remaining this month
                </p>
              )}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                  data-testid={`message-${message.role}-${index}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-primary/10">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl p-4 shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    {message.role === "assistant" && message.provider && message.provider !== "system" && message.provider !== "error" && (
                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {message.provider === "openai" && "GPT-4"}
                          {message.provider === "anthropic" && "Claude"}
                          {message.provider === "gemini" && "Gemini Pro"}
                          {message.provider === "perplexity" && "Perplexity"}
                          {message.provider === "grok" && "Grok"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center ring-2 ring-accent/10">
                        <User className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-primary/10">
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-4 bg-muted shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Upgrade Prompt - Tier-aware */}
          {showUpgradePrompt && quotaInfo && (
            <div className="px-4 pb-3">
              <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-3">
                <div className="flex items-start gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    {quotaInfo.tier === "guest" ? (
                      <>
                        <h4 className="font-semibold text-sm mb-1">Create Free Account</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Get 10 messages/month + save your conversations
                        </p>
                        <a href="/api/auth/login">
                          <Button size="sm" className="w-full gap-1" data-testid="button-signup-now">
                            <Sparkles className="h-3 w-3" />
                            Sign Up Free
                          </Button>
                        </a>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-sm mb-1">Unlock More AI Power</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {quotaInfo.tier === "free" 
                            ? "Get 500 messages/month with Pro or unlimited with Enterprise"
                            : "Upgrade to Enterprise for unlimited messages"}
                        </p>
                        <Link href="/settings">
                          <Button size="sm" className="w-full gap-1" data-testid="button-upgrade-now">
                            <Crown className="h-3 w-3" />
                            View Plans
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
            </div>
          )}

          {/* Suggested Prompts */}
          {showSuggestions && messages.length === 1 && !chatMutation.isPending && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">Try asking about:</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {getJourneyPrompts(userJourney).map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 text-left justify-start hover-elevate"
                    onClick={() => handleSend(suggestion.prompt)}
                    data-testid={`button-suggested-${idx}`}
                  >
                    <suggestion.icon className="h-3 w-3 mr-2 flex-shrink-0 text-primary" />
                    <span className="text-xs line-clamp-2">{suggestion.label}</span>
                  </Button>
                ))}
              </div>
              <Separator className="my-3" />
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your equipment issue or error code..."
                className="flex-1 bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                className="flex-shrink-0"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {quotaInfo && quotaInfo.tier !== "enterprise" && (
              <div className="mt-2 text-xs text-muted-foreground text-right font-mono">
                {quotaInfo.remaining} messages left
              </div>
            )}
          </div>
        </>
      )}

      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <img src={serviceGuyAILogo} alt="Service Guy AI" className="h-10 w-10 rounded-full" />
              Service Guy AI Pricing
            </DialogTitle>
            <DialogDescription>
              AI-powered equipment diagnostics for laundromat professionals. Start with a 14-day free trial.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-4 gap-4 mt-4">
            {SERVICE_GUY_PRICING.map((plan) => (
              <Card 
                key={plan.tier} 
                className={cn(
                  "relative",
                  plan.popular && "border-emerald-500 border-2"
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <Badge variant="outline" className="mb-4">{plan.messages}</Badge>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={cn(
                      "w-full",
                      plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : "",
                      plan.tier === "free" ? "bg-muted text-muted-foreground cursor-default" : ""
                    )}
                    disabled={plan.tier === "free"}
                    onClick={() => {
                      if (plan.tier === "enterprise") {
                        window.location.href = "/contact";
                      } else if (plan.tier !== "free") {
                        setIsTrialActive(true);
                        setQuotaInfo(prev => prev ? {...prev, tier: plan.tier, limit: plan.tier === "essentials" ? 50 : 999999} : null);
                        setShowPricingModal(false);
                      }
                    }}
                    data-testid={`button-select-${plan.tier}`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-emerald-500" />
              <div>
                <h4 className="font-semibold">14-Day Free Trial</h4>
                <p className="text-sm text-muted-foreground">
                  Try any paid plan free for 14 days. No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});
