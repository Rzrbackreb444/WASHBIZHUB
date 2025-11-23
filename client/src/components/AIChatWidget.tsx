import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  ArrowUpCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

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

const SUGGESTED_PROMPTS = [
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

const getTierBadge = (tier: string) => {
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
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Free
        </Badge>
      );
  }
};

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Welcome to **WashBizHub AI Consultant** - Powered by The Laundromat Bible.\n\n**Trained on 60+ years of Kremers family expertise:**\n\n📊 **C.L.E.A.N. Methodology** — Location evaluation framework\n🏆 **Kremers Doctrine** — Foundation First, Systems Over Hustle\n💰 **Financial Benchmarks** — 2.5-4.5x SDE valuations, 8-15% rent ratios\n🔧 **Equipment Intelligence** — Speed Queen, Dexter, Electrolux comparisons\n📈 **Revenue Optimization** — Pricing strategies, wash-dry-fold, commercial accounts\n\n**Ask me anything! I'll give you Bloomberg Terminal-grade insights.**",
      provider: "system",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Fetch user quota on open
  const { data: user } = useQuery<any>({
    queryKey: ["/api/user"],
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
        
        // Show upgrade prompt if running low
        if (data.quota.remaining <= 2 && data.quota.tier === "free") {
          setShowUpgradePrompt(true);
        }
      }
      
      setShowSuggestions(false);
    },
    onError: (error: any) => {
      // Handle quota exceeded error
      if (error.message?.includes("quota") || error.message?.includes("exceeded")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ **You've reached your ${quotaInfo?.tier || 'free'} tier message limit (${quotaInfo?.limit || 10} messages/month).**\n\n**Upgrade to unlock more:**\n\n🚀 **Pro ($29/mo)** — 500 messages/month + GPT-4 intelligence\n👑 **Enterprise ($99/mo)** — Unlimited messages + Claude Opus priority\n\nClick the "Upgrade" button below to continue chatting!`,
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
            content: "I apologize, but I encountered an error. Please try again or contact support.",
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
        content: "👋 Welcome to **WashBizHub AI Consultant** - Powered by The Laundromat Bible.\n\n**Trained on 60+ years of Kremers family expertise:**\n\n📊 **C.L.E.A.N. Methodology** — Location evaluation framework\n🏆 **Kremers Doctrine** — Foundation First, Systems Over Hustle\n💰 **Financial Benchmarks** — 2.5-4.5x SDE valuations, 8-15% rent ratios\n🔧 **Equipment Intelligence** — Speed Queen, Dexter, Electrolux comparisons\n📈 **Revenue Optimization** — Pricing strategies, wash-dry-fold, commercial accounts\n\n**Ask me anything! I'll give you Bloomberg Terminal-grade insights.**",
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
        className="fixed bottom-6 right-6 z-50 group hover-elevate active-elevate-2"
        data-testid="button-open-chat"
      >
        <div className="bg-gradient-to-r from-primary to-accent px-4 py-2.5 rounded-lg shadow-lg border border-primary/20 flex items-center gap-2.5 transition-all duration-200">
          <div className="relative">
            <Bot className="h-5 w-5 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-primary-foreground">AI Consultant</span>
        </div>
      </button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-2xl border-2 border-primary/30 flex flex-col overflow-hidden transition-all duration-300",
        isMinimized ? "h-16" : "h-[700px]",
        "w-[420px]"
      )}
      data-testid="widget-ai-chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/15 via-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              AI Consultant
              {quotaInfo && getTierBadge(quotaInfo.tier)}
            </h3>
            <p className="text-xs text-muted-foreground">The Laundromat Bible • Live</p>
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
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            data-testid="button-minimize-chat"
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
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quota Bar */}
          {quotaInfo && (
            <div className="px-4 pt-3 pb-2 border-b bg-muted/30">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">
                  Monthly Usage: {quotaInfo.used} / {quotaInfo.limit === 999999 ? "∞" : quotaInfo.limit}
                </span>
                {quotaInfo.tier !== "enterprise" && quotaInfo.remaining <= 5 && (
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 hover-elevate">
                      <ArrowUpCircle className="h-3 w-3" />
                      Upgrade
                    </Button>
                  </Link>
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

          {/* Upgrade Prompt */}
          {showUpgradePrompt && quotaInfo && quotaInfo.tier === "free" && (
            <div className="px-4 pb-3">
              <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-3">
                <div className="flex items-start gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Unlock Unlimited AI Insights</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Get 500 messages/month with Pro or unlimited with Enterprise
                    </p>
                    <Link href="/settings">
                      <Button size="sm" className="w-full gap-1" data-testid="button-upgrade-now">
                        <Crown className="h-3 w-3" />
                        View Plans
                      </Button>
                    </Link>
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
                {SUGGESTED_PROMPTS.map((suggestion, idx) => (
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
                placeholder="Ask about C.L.E.A.N., valuations, equipment..."
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
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-accent" />
                Trained on The Laundromat Bible
              </span>
              {quotaInfo && (
                <span className="font-mono">
                  {quotaInfo.tier === "enterprise" ? "∞" : quotaInfo.remaining} left
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
