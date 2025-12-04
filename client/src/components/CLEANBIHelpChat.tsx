import { useState, useRef, useEffect, memo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  MapPin,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  Car,
  Trash2,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  content: string;
  provider: string;
  model: string;
}

const CLEANBI_PROMPTS = [
  {
    icon: Target,
    label: "What is CLEANBI?",
    prompt: "What does CLEANBI score mean and how is it calculated?",
  },
  {
    icon: TrendingUp,
    label: "Good Score",
    prompt: "What's considered a good CLEANBI score for investing?",
  },
  {
    icon: Users,
    label: "Demographics",
    prompt: "How does the demographics factor affect my CLEANBI score?",
  },
  {
    icon: Building2,
    label: "Competition",
    prompt: "How does competition impact the location score?",
  },
  {
    icon: Car,
    label: "Traffic",
    prompt: "What traffic score should I look for in a location?",
  },
  {
    icon: DollarSign,
    label: "Economic",
    prompt: "How do economic factors influence the CLEANBI grade?",
  },
];

const WELCOME_MESSAGE = `**Welcome! I'm your CLEANBI Analysis Guide.**

I can help you understand:
• **What each CLEANBI factor means** (Demographics, Competition, Traffic, Accessibility, Economic, Location Quality)
• **How to interpret your scores** (A, B, C, or "Needs Work")
• **What actions to take** based on your analysis
• **Why certain locations score higher** than others

**Click a topic below or ask me anything about your CLEANBI analysis!**`;

const CLEANBI_SYSTEM_PROMPT = `You are a CLEANBI Analysis Expert for WashBizHub, the #1 laundromat industry platform. 

CLEANBI is a proprietary 6-factor scoring system for evaluating laundromat locations:

1. **Demographics (25%)** - Population density, renter percentage, household size, apartment density. Higher scores = more potential customers.

2. **Competition (20%)** - Number of competitors within radius, their ratings, review counts, and market saturation. Lower competition = higher opportunity.

3. **Traffic (15%)** - Vehicle traffic patterns, foot traffic, visibility from major roads. Higher traffic = more walk-in customers.

4. **Accessibility (15%)** - Walk Score, Transit Score, parking availability, ease of access. Better accessibility = more convenient for customers.

5. **Economic (15%)** - Median household income, employment rates, economic stability. Sweet spot is $35K-$75K income (not too rich, not too poor).

6. **Location Quality (10%)** - Nearby amenities, retail density, neighborhood safety, complementary businesses.

GRADING SYSTEM (Chrome Web Store style - positive only):
- **A (85+)** = Excellent opportunity - Gold Mine Zone
- **B (70-84)** = Good opportunity - High Potential  
- **C (55-69)** = Fair opportunity - Room to Grow
- **Needs Work (<55)** = Requires strategic improvements

KEY INSIGHTS TO SHARE:
- Best laundromat locations have 3,000+ population within 1 mile
- Ideal renter percentage is 40%+
- Competition within 1 mile: 0-2 is ideal, 3-5 is competitive, 6+ is saturated
- Traffic score of 70+ indicates strong visibility
- Walk Score of 50+ helps in urban areas

Always be encouraging and solution-oriented. If a score is low, explain what could improve it. Remember: we use positive language - no D or F grades.`;

export const CLEANBIHelpChat = memo(function CLEANBIHelpChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/ai/cleanbi-help", {
        message: userMessage,
        systemPrompt: CLEANBI_SYSTEM_PROMPT,
        conversationHistory: messages.slice(-6).map(m => ({
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
          content: "I apologize, but I encountered an issue. Please try again or contact support at consult@washbizhub.com.",
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
        content: WELCOME_MESSAGE,
        timestamp: new Date(),
      },
    ]);
    setShowSuggestions(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        data-testid="button-open-cleanbi-help"
      >
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 rounded-full shadow-2xl border-2 border-amber-400/50 flex items-center gap-3 transition-all duration-300 hover:shadow-amber-500/30 hover:scale-105 active:scale-95">
          <div className="relative">
            <HelpCircle className="h-6 w-6 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-amber-500 animate-pulse" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-white">CLEANBI Help</span>
            <span className="text-xs font-medium text-white/80">Ask anything</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-2xl border-2 border-amber-500/30 flex flex-col overflow-hidden transition-all duration-300",
        isMinimized ? "h-16" : "h-[550px]",
        "w-[380px] rounded-2xl"
      )}
      data-testid="widget-cleanbi-help"
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="flex items-center gap-3">
          <div className="relative bg-white/20 p-2 rounded-full">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              CLEANBI Help
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </h3>
            <p className="text-xs text-white/80 font-medium">Location Analysis Expert</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              title="Clear conversation"
              data-testid="button-clear-cleanbi-chat"
              className="text-white hover:bg-white/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            data-testid="button-minimize-cleanbi-chat"
            className="text-white hover:bg-white/20"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-cleanbi-chat"
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <div 
                      className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mt-1 [&>ul]:mb-2 [&>ul>li]:mb-1"
                      dangerouslySetInnerHTML={{ 
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br/>')
                          .replace(/• /g, '<li>')
                      }}
                    />
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {showSuggestions && messages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {CLEANBI_PROMPTS.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto py-2 px-3 flex items-center gap-2 justify-start text-left hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30"
                        onClick={() => handleSend(prompt.prompt)}
                        data-testid={`button-prompt-${index}`}
                      >
                        <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{prompt.label}</span>
                      </Button>
                    );
                  })}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about CLEANBI scores..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={chatMutation.isPending}
                className="flex-1"
                data-testid="input-cleanbi-chat"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                className="bg-amber-500 hover:bg-amber-600"
                data-testid="button-send-cleanbi-chat"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Need human help? Email <a href="mailto:consult@washbizhub.com" className="text-amber-600 hover:underline">consult@washbizhub.com</a>
            </p>
          </div>
        </>
      )}
    </Card>
  );
});
