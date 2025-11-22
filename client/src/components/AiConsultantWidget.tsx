import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Minimize2, X, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AiConsultantWidget() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your WashBizHub AI Consultant. Ask me anything about laundromats, locations, equipment, financing, or operations. I have access to The Laundromat Bible, industry benchmarks, and 2,800+ diagnostic codes. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await apiRequest("POST", "/api/ai-consultant/chat", {
        message: input,
        conversationId: "web-widget",
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: (data as any).reply || "I'm having trouble responding. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI consultant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg hover-elevate flex items-center justify-center z-40 transition-all"
        data-testid="button-open-ai-widget"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 right-6 w-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg shadow-xl border border-primary/30 z-40 p-4 cursor-pointer hover-elevate"
        onClick={() => setIsMinimized(false)}
        data-testid="button-expand-ai-widget"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">AI Consultant</span>
          </div>
          <Badge variant="secondary" className="text-xs">Online</Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[600px] z-40 flex flex-col">
      <Card className="h-full flex flex-col border-2 border-primary/50">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-primary to-accent">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <CardTitle className="text-white">WashBizHub AI Consultant</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setIsMinimized(true)}
              data-testid="button-minimize-ai"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-ai"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="bg-muted px-4 py-2 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <CardContent className="p-4 border-t space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about locations, equipment, financing..."
              className="flex-1 px-3 py-2 bg-muted border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
              data-testid="input-ai-message"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              data-testid="button-send-ai-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Tips: Ask about C.L.E.A.N. location analysis, equipment ROI, or lease negotiation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
