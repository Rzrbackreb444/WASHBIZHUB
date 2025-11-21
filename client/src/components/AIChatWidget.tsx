import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Info
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

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
}

const SUGGESTED_PROMPTS = [
  {
    icon: DollarSign,
    label: "Valuation",
    prompt: "How do I value a laundromat business I'm interested in buying?",
  },
  {
    icon: TrendingUp,
    label: "ROI Analysis",
    prompt: "What's a realistic ROI for a laundromat and how do I calculate it?",
  },
  {
    icon: MapPin,
    label: "Location",
    prompt: "What demographics and location factors make a great laundromat site?",
  },
  {
    icon: Wrench,
    label: "Equipment",
    prompt: "Which commercial washer and dryer brands are most reliable?",
  },
  {
    icon: Calculator,
    label: "Pricing",
    prompt: "How should I price my washers and dryers to maximize revenue?",
  },
];

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Welcome to WashBizHub AI - **THE world's most advanced laundromat business consultant.**\n\nI have deep expertise in:\n• Business valuation & acquisition\n• Equipment selection & maintenance\n• Financial analysis & ROI optimization\n• Location analysis & market research\n• Operations & revenue optimization\n• Industry benchmarks & trends\n\n**Ask me anything about laundromats and commercial laundry equipment!**",
      provider: "system",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

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
      return response as ChatResponse;
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
      setShowSuggestions(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again or contact support.",
          provider: "error",
          timestamp: new Date(),
        },
      ]);
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
        content: "👋 Welcome to WashBizHub AI - **THE world's most advanced laundromat business consultant.**\n\nI have deep expertise in:\n• Business valuation & acquisition\n• Equipment selection & maintenance\n• Financial analysis & ROI optimization\n• Location analysis & market research\n• Operations & revenue optimization\n• Industry benchmarks & trends\n\n**Ask me anything about laundromats and commercial laundry equipment!**",
        provider: "system",
        timestamp: new Date(),
      },
    ]);
    setShowSuggestions(true);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-2xl relative overflow-hidden group"
          data-testid="button-open-chat"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-center">
            <MessageCircle className="h-7 w-7" />
            <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-accent animate-pulse" />
          </div>
        </Button>
        <div className="absolute -top-12 right-0 bg-popover text-popover-foreground px-3 py-1 rounded-lg shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ask AI Consultant
        </div>
      </div>
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
            <h3 className="font-bold text-sm flex items-center gap-1">
              WashBizHub AI
              <Sparkles className="h-3 w-3 text-accent" />
            </h3>
            <p className="text-xs text-muted-foreground">Laundromat Expert • Always Online</p>
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
                          Powered by {message.provider}
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

          {/* Suggested Prompts */}
          {showSuggestions && messages.length === 1 && !chatMutation.isPending && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">Popular questions:</p>
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
                placeholder="Ask about valuations, equipment, ROI..."
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
              <span>Powered by 5 AI models</span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-accent" />
                Enterprise-grade insights
              </span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
