import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, X, Send, Bot, User, Clock, MapPin, Phone, Mail,
  DollarSign, Truck, Calendar, Loader2, Sparkles, ChevronDown
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface AIChatbotWidgetProps {
  businessName?: string;
  agentName?: string;
  primaryColor?: string;
  position?: "bottom-left" | "bottom-right";
  welcomeMessage?: string;
  awayMessage?: string;
  avatarUrl?: string | null;
  isEnabled?: boolean;
  canTakeOrders?: boolean;
  canSchedulePickups?: boolean;
  canAnswerPricing?: boolean;
  canProvideFaq?: boolean;
  businessHours?: Record<string, { open: string; close: string }>;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: string;
  services?: Array<{ title: string; price?: string; description?: string }>;
  commonQuestions?: Array<{ question: string; answer: string }>;
  onEmailCapture?: (email: string, name?: string) => void;
  tenantId?: string;
}

export function AIChatbotWidget({
  businessName = "Our Laundromat",
  agentName = "Store Assistant",
  primaryColor = "#C8A661",
  position = "bottom-right",
  welcomeMessage = "Hi! How can I help you today?",
  awayMessage = "We're currently closed but leave a message!",
  avatarUrl,
  isEnabled = true,
  canTakeOrders = false,
  canSchedulePickups = false,
  canAnswerPricing = true,
  canProvideFaq = true,
  businessHours,
  businessPhone,
  businessEmail,
  businessAddress,
  services = [],
  commonQuestions = [],
  onEmailCapture,
  tenantId,
}: AIChatbotWidgetProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [emailCaptureMode, setEmailCaptureMode] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickReplies = [
    { label: "Pricing", icon: DollarSign, query: "What are your prices?" },
    { label: "Hours", icon: Clock, query: "What are your hours?" },
    { label: "Location", icon: MapPin, query: "Where are you located?" },
    ...(canSchedulePickups ? [{ label: "Schedule Pickup", icon: Truck, query: "I want to schedule a pickup" }] : []),
    ...(canTakeOrders ? [{ label: "Place Order", icon: Calendar, query: "I want to place an order" }] : []),
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
        quickReplies: quickReplies.map(q => q.label),
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, welcomeMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/whitelabel/chat", {
        message,
        tenantId,
        context: {
          businessName,
          services,
          businessHours,
          businessPhone,
          businessEmail,
          businessAddress,
          commonQuestions,
          canTakeOrders,
          canSchedulePickups,
          canAnswerPricing,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        quickReplies: data.quickReplies,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      if (data.captureEmail) {
        setEmailCaptureMode(true);
      }
    },
    onError: (error: Error) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble connecting. Please try again or contact us directly.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    },
  });

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    if (emailCaptureMode) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(inputValue)) {
        setCapturedEmail(inputValue);
        onEmailCapture?.(inputValue);
        setEmailCaptureMode(false);
        const thankYouMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Thanks! I've saved your email (${inputValue}). We'll send you updates and special offers. Is there anything else I can help with?`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, thankYouMessage]);
        setIsTyping(false);
        return;
      }
    }

    chatMutation.mutate(inputValue);
  };

  const handleQuickReply = (query: string) => {
    setInputValue(query);
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: query,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);
      chatMutation.mutate(query);
    }, 100);
  };

  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  if (!isEnabled) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${positionClasses[position]} z-50 w-80 sm:w-96`}
            style={{ marginBottom: "70px" }}
            data-testid="chatbot-window"
          >
            <Card className="shadow-2xl border overflow-hidden max-h-[70vh] flex flex-col">
              <CardHeader 
                className="p-3 flex flex-row items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/30">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={agentName} />
                    ) : null}
                    <AvatarFallback className="bg-white/20 text-white">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white text-sm">{agentName}</p>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      <span className="text-xs text-white/80">Online</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                  data-testid="button-close-chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className={message.role === "user" ? "bg-muted" : ""} style={message.role === "assistant" ? { backgroundColor: `${primaryColor}20` } : {}}>
                            {message.role === "user" ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" style={{ color: primaryColor }} />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div
                            className={`rounded-2xl px-4 py-2 text-sm ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                            style={message.role === "user" ? { backgroundColor: primaryColor } : {}}
                          >
                            {message.content}
                          </div>
                          {message.quickReplies && message.quickReplies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.quickReplies.map((reply, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="cursor-pointer hover-elevate text-xs py-1"
                                  onClick={() => handleQuickReply(quickReplies.find(q => q.label === reply)?.query || reply)}
                                  data-testid={`quick-reply-${idx}`}
                                >
                                  {reply}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback style={{ backgroundColor: `${primaryColor}20` }}>
                          <Bot className="w-4 h-4" style={{ color: primaryColor }} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.slice(0, 4).map((item, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleQuickReply(item.query)}
                        data-testid={`quick-action-${idx}`}
                      >
                        <item.icon className="w-3 h-3 mr-1" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <CardFooter className="p-3 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex w-full gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={emailCaptureMode ? "Enter your email..." : "Type a message..."}
                    className="flex-1 h-10"
                    disabled={chatMutation.isPending}
                    data-testid="input-chat-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10"
                    style={{ backgroundColor: primaryColor }}
                    disabled={!inputValue.trim() || chatMutation.isPending}
                    data-testid="button-send-message"
                  >
                    {chatMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${positionClasses[position]} z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all`}
        style={{ backgroundColor: primaryColor }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-toggle-chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6 text-white" />
              {messages.length === 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

export default AIChatbotWidget;
