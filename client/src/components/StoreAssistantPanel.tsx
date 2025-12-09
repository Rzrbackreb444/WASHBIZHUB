import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  X,
  Send,
  Minimize2,
  Maximize2,
  User,
  ShoppingCart,
  DollarSign,
  Users,
  Truck,
  Wrench,
  BarChart3,
  Mic,
  MicOff,
  Loader2,
  Sparkles,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/use-voice-input";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: any;
  actions?: string[];
}

interface AssistantResponse {
  response: string;
  data?: any;
  actions?: string[];
}

const QUICK_ACTIONS = [
  { icon: ShoppingCart, label: "Today's Orders", prompt: "Show me today's orders" },
  { icon: DollarSign, label: "Revenue", prompt: "What's my revenue today?" },
  { icon: Users, label: "Top Customers", prompt: "Show me top customers" },
  { icon: Wrench, label: "Machine Status", prompt: "Any machines down?" },
  { icon: Truck, label: "Deliveries", prompt: "How many deliveries today?" },
  { icon: Clock, label: "Pending Pickup", prompt: "What orders are pending pickup?" },
];

const WELCOME_MESSAGE = `**Welcome to Store Assistant AI!**

I'm your AI-powered operations manager. I can help you with:

• **Orders** - View, search, and manage orders
• **Revenue** - Financial insights and reports
• **Customers** - Look up accounts and activity
• **Routes** - Delivery scheduling and optimization
• **Equipment** - Machine status and maintenance

What would you like to know?`;

export function StoreAssistantPanel({ laundromatId }: { laundromatId?: string }) {
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
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    onFinalTranscript: (transcript) => {
      setInput(transcript);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/pos/ai-assistant", {
        message: userMessage,
        context: { laundromatId },
      });
      return response as unknown as AssistantResponse;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          data: data.data,
          actions: data.actions,
        },
      ]);
      setShowQuickActions(false);
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I apologize, but I encountered an error: ${error.message || "Please try again."}`,
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
    resetTranscript();
    setShowQuickActions(false);
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
    setShowQuickActions(true);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const formatData = (data: any) => {
    if (!data) return null;

    if (data.orders && Array.isArray(data.orders)) {
      return (
        <div className="mt-3 space-y-2">
          {data.orders.slice(0, 5).map((order: any, idx: number) => (
            <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">#{order.id?.slice(-6) || idx + 1}</span>
                <Badge variant="secondary" className="text-xs">{order.status}</Badge>
              </div>
              <div className="text-muted-foreground mt-1">
                {order.customerName} • ${order.total?.toFixed(2) || '0.00'}
              </div>
            </div>
          ))}
          {data.orders.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              +{data.orders.length - 5} more orders
            </p>
          )}
        </div>
      );
    }

    if (data.revenue !== undefined) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-[#C8A661]">
              ${data.revenue?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
          {data.orderCount !== undefined && (
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#C8A661]">{data.orderCount}</div>
              <div className="text-xs text-muted-foreground">Orders</div>
            </div>
          )}
        </div>
      );
    }

    if (data.customers && Array.isArray(data.customers)) {
      return (
        <div className="mt-3 space-y-2">
          {data.customers.slice(0, 5).map((customer: any, idx: number) => (
            <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <span className="font-medium">{customer.accountName || customer.name}</span>
                <div className="text-xs text-muted-foreground">{customer.phone || customer.email}</div>
              </div>
              {customer.totalSpend !== undefined && (
                <Badge variant="outline">${customer.totalSpend?.toLocaleString()}</Badge>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (data.machines && Array.isArray(data.machines)) {
      return (
        <div className="mt-3 space-y-2">
          {data.machines.map((machine: any, idx: number) => (
            <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <span className="font-medium">{machine.machineName || `Machine ${idx + 1}`}</span>
                <div className="text-xs text-muted-foreground">{machine.manufacturer} {machine.model}</div>
              </div>
              <Badge 
                variant={machine.status === 'operational' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {machine.status}
              </Badge>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        data-testid="button-open-store-assistant"
      >
        <div className="bg-[#0A1628] px-5 py-3 rounded-full shadow-2xl border-2 border-[#C8A661]/50 flex items-center gap-3 transition-all duration-300 hover:border-[#C8A661] hover:scale-105 active:scale-95">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-[#C8A661]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A1628] animate-pulse" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-base font-bold text-white">Store Assistant</span>
            <span className="text-xs font-medium text-gray-400">AI Operations Manager</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-2xl border border-border/50 flex flex-col overflow-hidden transition-all duration-300",
        isMinimized ? "h-16" : "h-[600px]",
        "w-[400px] rounded-2xl bg-card"
      )}
      data-testid="panel-store-assistant"
    >
      <div className="flex items-center justify-between p-4 bg-[#0A1628] border-b border-[#C8A661]/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#C8A661]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A1628] animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              Store Assistant
              <Badge className="bg-[#C8A661] text-[#0A1628] text-xs">AI</Badge>
            </h3>
            <p className="text-xs text-gray-400">Your AI Operations Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              title="Clear conversation"
              data-testid="button-clear-assistant-chat"
              className="text-white hover:bg-white/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            data-testid="button-minimize-assistant"
            className="text-white hover:bg-white/20"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-assistant"
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
                    "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-[#C8A661]" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[85%]",
                      message.role === "user"
                        ? "bg-[#C8A661] text-[#0A1628]"
                        : "bg-muted"
                    )}
                  >
                    <div 
                      className={cn(
                        "text-sm leading-relaxed whitespace-pre-wrap",
                        message.role === "user" ? "text-[#0A1628]" : "text-foreground"
                      )}
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                      }}
                    />
                    {message.data && formatData(message.data)}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSend(action)}
                            data-testid={`button-action-${idx}`}
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-[#C8A661]" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing your request...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {showQuickActions && (
            <div className="px-4 pb-2 border-t">
              <p className="text-xs text-muted-foreground pt-3 pb-2">Quick Actions</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_ACTIONS.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-2 flex flex-col items-center gap-1 text-xs hover-elevate"
                    onClick={() => handleSend(action.prompt)}
                    data-testid={`button-quick-action-${idx}`}
                  >
                    <action.icon className="h-4 w-4 text-[#C8A661]" />
                    <span className="text-center leading-tight">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about orders, revenue, customers..."
                  className="pr-10 bg-background"
                  disabled={chatMutation.isPending}
                  data-testid="input-assistant-message"
                />
                {voiceSupported && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7",
                      isListening && "text-red-500"
                    )}
                    onClick={toggleVoice}
                    data-testid="button-voice-input"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || chatMutation.isPending}
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                data-testid="button-send-assistant"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isListening && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Listening...
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
