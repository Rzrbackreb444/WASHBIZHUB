import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SEO } from "@/components/SEO";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, MessageSquare, Send, Sparkles, 
  ArrowRight, CheckCircle, Target, TrendingUp,
  Users, Shield, Zap, MapPin, Wrench, Calculator,
  FileText, DollarSign, Lightbulb, Bot, Award,
  ChevronRight, Star, Lock, Crown, Phone, Video,
  Calendar, Mail
} from "lucide-react";
import larryLarsenPhoto from "@assets/image_1765341641648.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const aiCapabilities = [
  { icon: MapPin, title: "Location Analysis", description: "CLEANBI scoring for any address" },
  { icon: Wrench, title: "Equipment Help", description: "Diagnose issues & find parts" },
  { icon: Calculator, title: "Valuations", description: "Fair price & ROI calculations" },
  { icon: FileText, title: "Due Diligence", description: "Lease & deal red flags" },
  { icon: DollarSign, title: "Funding", description: "SBA readiness & lender matching" },
  { icon: TrendingUp, title: "Operations", description: "Pricing & revenue optimization" }
];

const pricingPlans = [
  {
    name: "Essentials",
    price: "$149",
    period: "/month",
    description: "Core AI tools for getting started",
    features: [
      "50 AI consultations/month",
      "10 CLEANBI location analyses",
      "Equipment diagnostics",
      "ROI calculator access",
      "Email support"
    ],
    cta: "Start Essentials",
    popular: false
  },
  {
    name: "Pro",
    price: "$349",
    period: "/month",
    description: "Full power for serious investors",
    features: [
      "Unlimited AI consultations",
      "Unlimited CLEANBI analyses",
      "Full diagnostics + parts ordering",
      "What-If Simulator",
      "AI Business Plan Generator",
      "Priority support",
      "2 consultation credits/month"
    ],
    cta: "Go Pro",
    popular: true
  },
  {
    name: "Elite",
    price: "$799",
    period: "/month",
    description: "White-glove + human experts",
    features: [
      "Everything in Pro",
      "Larry Larsen review sessions",
      "Dedicated success manager",
      "Custom AI training on your data",
      "API access",
      "Multi-location dashboard",
      "Phone support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const exampleQuestions = [
  "Is 123 Main St a good laundromat location?",
  "My Dexter shows error E3, what's wrong?",
  "What's a fair price for $15K/month revenue?",
  "Red flags to watch in a laundromat lease?",
  "How do I qualify for SBA financing?",
  "Best equipment brands for a new store?"
];

const inquirySchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  topic: z.string().min(1, "Please select a topic"),
  message: z.string().min(10, "Please describe what you need help with"),
});

type InquiryData = z.infer<typeof inquirySchema>;

export default function LaundromatExpert() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your Laundromat Expert - an AI trained on 50+ years of industry knowledge. I learn from every interaction and am verified by Nick Kremers and Larry Larsen.\n\nAsk me anything about:\n• Location analysis & CLEANBI scores\n• Equipment diagnostics & repairs\n• Valuations & deal analysis\n• Funding & SBA loans\n• Operations & pricing\n\nWhat can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/laundromat-chat", {
        message,
        context: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || "I apologize, I couldn't process that request. Please try again or contact our human experts.",
        timestamp: new Date()
      }]);
      setIsTyping(false);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again or speak with our human experts below.",
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  });

  const form = useForm<InquiryData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      topic: "",
      message: "",
    },
    mode: "onTouched",
  });

  const submitInquiry = useMutation({
    mutationFn: async (data: InquiryData) => {
      return apiRequest("POST", "/api/consultant/inquiry", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Our team will respond within 24 hours.",
      });
      setSubmitted(true);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send. Please email consult@washbizhub.com directly.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    sendMessage.mutate(userMessage.content);
  };

  return (
    <>
      <SEO
        title="Laundromat Expert - AI Consultant & Industry Advisor | WashBizHub"
        description="Get instant expert advice on laundromat investing, equipment, valuations, and operations. AI trained on 50+ years of industry knowledge, verified by human experts. Free consultation available."
        canonicalUrl="/laundromat-expert"
        keywords={[
          "laundromat consultant",
          "laundromat expert",
          "laundromat advisor",
          "coin laundry consultant",
          "laundromat business help",
          "laundromat valuation",
          "laundromat due diligence",
          "laundromat investment advice"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Laundromat Expert", url: "/laundromat-expert" }
        ]}
        faqs={[
          {
            question: "What is Laundromat Expert?",
            answer: "Laundromat Expert is an AI-powered consultant trained on 50+ years of laundromat industry knowledge. It can help with location analysis, equipment diagnostics, valuations, due diligence, funding guidance, and operations optimization. All responses are verified by human industry experts."
          },
          {
            question: "How much does Laundromat Expert cost?",
            answer: "We offer tiered plans: Starter ($49/mo) for basic AI access, Professional ($149/mo) for unlimited AI plus tools, and Enterprise ($349/mo) which includes monthly reviews with Larry Larsen. A free trial is available."
          },
          {
            question: "Who are the experts behind Laundromat Expert?",
            answer: "Laundromat Expert is trained on knowledge from Larry 'Laundromat Larry' Larsen (50+ years experience, 50+ laundromats owned) and Nick Kremers (WashBizHub founder). Human experts verify AI accuracy and handle complex consultations."
          },
          {
            question: "Can I talk to a human instead of AI?",
            answer: "Yes! You can submit an inquiry form on the page and our team will respond within 24 hours. Enterprise subscribers get monthly 1-on-1 sessions with Larry Larsen."
          }
        ]}
        author={{
          name: "WashBizHub Expert Team",
          expertise: "Laundromat Industry Consulting",
          credentials: "Larry Larsen (50+ years), Nick Kremers (Founder), AI Neural Network"
        }}
      />
      
      <div className="min-h-screen bg-background">
        <section className="py-16 md:py-20 bg-gradient-to-b from-[#0A1628] via-[#0A1628] to-[#1a3a5c]" data-testid="section-expert-hero">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#C8A661] to-[#B8964F] flex items-center justify-center shadow-lg shadow-[#C8A661]/20">
                  <Brain className="h-8 w-8 text-[#0A1628]" />
                </div>
              </div>
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 px-4 py-1.5" data-testid="badge-neural">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                AI + Human Experts • Gets Smarter Every Day
              </Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4" data-testid="text-headline">
                Laundromat Expert
              </h1>
              <p className="text-xl md:text-2xl text-[#C8A661] font-medium mb-4" data-testid="text-tagline">
                Your AI-Powered Industry Consultant
              </p>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="text-description">
                Instant expert advice on locations, equipment, valuations, funding, and operations. 
                Trained on 50+ years of knowledge. Verified by real industry experts.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-10">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold text-lg px-8" data-testid="button-try-expert" onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Ask the Expert Free
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  View Plans
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10 border-2 border-[#C8A661]">
                    <AvatarImage src={larryLarsenPhoto} alt="Larry Larsen" />
                    <AvatarFallback>LL</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">Larry Larsen</div>
                    <div className="text-xs text-gray-400">50+ Years Experience</div>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10 border-2 border-[#C8A661]">
                    <AvatarFallback className="bg-[#0A1628] text-[#C8A661]">NK</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">Nick Kremers</div>
                    <div className="text-xs text-gray-400">WashBizHub Founder</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="capabilities-grid">
              {aiCapabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.title} className="text-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#C8A661]/30 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-[#C8A661]/20 flex items-center justify-center mx-auto mb-2">
                      <Icon className="h-4 w-4 text-[#C8A661]" />
                    </div>
                    <div className="text-xs font-medium text-white">{cap.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-8 bg-muted/30 border-y" data-testid="section-trust">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-center">
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">73,000+</div>
                <div className="text-xs text-muted-foreground">Industry Professionals</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">50+ Years</div>
                <div className="text-xs text-muted-foreground">Expert Knowledge</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">1,000+</div>
                <div className="text-xs text-muted-foreground">Questions Answered</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground">Human</div>
                <div className="text-xs text-muted-foreground">Verified Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        <section id="chat-section" className="py-16 md:py-20" data-testid="section-chat">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-[#0A1628] text-[#C8A661] border-[#C8A661]/30">
                <Bot className="w-3 h-3 mr-1" />
                Try It Now
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="text-chat-heading">
                Ask the Laundromat Expert
              </h2>
              <p className="text-muted-foreground">
                Free to try - ask about locations, equipment, deals, or anything laundromat-related
              </p>
            </div>

            <Card className="bg-card border shadow-lg overflow-hidden" data-testid="card-chat">
              <div className="h-1 bg-gradient-to-r from-[#C8A661] via-[#0A1628] to-[#C8A661]" />
              <CardContent className="p-0">
                <div className="h-[350px] overflow-y-auto p-4 space-y-3 bg-muted/20" data-testid="chat-messages">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          message.role === "user"
                            ? "bg-[#0A1628] text-white"
                            : "bg-card border"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="h-5 w-5 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                              <Brain className="h-3 w-3 text-[#C8A661]" />
                            </div>
                            <span className="text-xs font-medium text-[#C8A661]">Laundromat Expert</span>
                          </div>
                        )}
                        <p className={`text-sm whitespace-pre-wrap ${message.role === "assistant" ? "text-foreground" : ""}`}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-card border rounded-2xl px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                            <Brain className="h-3 w-3 text-[#C8A661] animate-pulse" />
                          </div>
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-3 border-t bg-card">
                  <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                    {exampleQuestions.slice(0, 3).map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap text-xs flex-shrink-0"
                        onClick={() => { setInputValue(q); inputRef.current?.focus(); }}
                        data-testid={`button-example-${i}`}
                      >
                        {q.substring(0, 35)}...
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask anything about laundromats..."
                      className="flex-1"
                      disabled={sendMessage.isPending}
                      data-testid="input-chat"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || sendMessage.isPending}
                      className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                      data-testid="button-send"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 bg-muted/30" data-testid="section-how-learns">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">How the Expert Gets Smarter</h2>
              <p className="text-sm text-muted-foreground">A neural network that learns from every interaction</p>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { num: "1", title: "You Ask", desc: "Questions about any laundromat topic" },
                { num: "2", title: "AI Analyzes", desc: "Draws from 50+ years of knowledge" },
                { num: "3", title: "Experts Verify", desc: "Nick & Larry review accuracy" },
                { num: "4", title: "System Learns", desc: "Better answers for everyone" }
              ].map((step) => (
                <Card key={step.num} className="bg-card border text-center p-4">
                  <div className="h-10 w-10 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-[#C8A661]">{step.num}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing-section" className="py-16 md:py-20" data-testid="section-pricing">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-[#0A1628] text-[#C8A661] border-[#C8A661]/30">
                <Crown className="w-3 h-3 mr-1" />
                Simple Pricing
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="text-pricing-heading">
                Choose Your Expert Level
              </h2>
              <p className="text-muted-foreground">
                All AI tools included. Upgrade for more power and human expert access.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <Card 
                  key={plan.name}
                  className={`bg-card border overflow-hidden relative ${plan.popular ? 'ring-2 ring-[#C8A661] shadow-lg' : ''}`}
                  data-testid={`card-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.popular && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#C8A661]" />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-[#C8A661] text-[#0A1628]">Most Popular</Badge>
                      </div>
                    </>
                  )}
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/subscribe">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]' : 'bg-[#0A1628] hover:bg-[#1a3a5c] text-white'}`}
                        data-testid={`button-plan-${plan.name.toLowerCase()}`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30" data-testid="section-human-experts">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Users className="w-3 h-3 mr-1" />
                Human Experts
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Need to Talk to a Real Person?
              </h2>
              <p className="text-muted-foreground">
                Our AI is backed by real industry veterans ready to help
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <Card className="bg-card border overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-[#C8A661]">
                      <AvatarImage src={larryLarsenPhoto} alt="Larry Larsen" />
                      <AvatarFallback>LL</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">Larry Larsen</h3>
                        <Badge className="bg-[#C8A661] text-[#0A1628] text-xs">
                          <Award className="w-2.5 h-2.5 mr-0.5" />
                          Legend
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        50+ years experience. Owned 50+ laundromats. Designed 135+ stores. 
                        Expert witness. The most trusted name in the industry.
                      </p>
                      <Link href="/consultation">
                        <Button size="sm" className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white">
                          Book Consultation
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-[#C8A661]">
                      <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-xl">NK</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">Nick Kremers</h3>
                        <Badge className="bg-[#0A1628] text-white text-xs">Founder</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        WashBizHub founder. Tech-forward laundromat investor. 
                        Oversees all AI training and platform development.
                      </p>
                      <a href="mailto:nick@washbizhub.com">
                        <Button size="sm" variant="outline">
                          <Mail className="w-3 h-3 mr-1" />
                          Email Nick
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!submitted ? (
              <Card className="bg-card border" data-testid="card-inquiry-form">
                <CardHeader>
                  <CardTitle className="text-lg">Send Us a Message</CardTitle>
                  <CardDescription>
                    Our team responds within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => submitInquiry.mutate(data))} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} data-testid="input-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="555-123-4567" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="topic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Topic</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-topic">
                                    <SelectValue placeholder="Select topic" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="buying">Buying a Laundromat</SelectItem>
                                  <SelectItem value="selling">Selling a Laundromat</SelectItem>
                                  <SelectItem value="operations">Operations Help</SelectItem>
                                  <SelectItem value="equipment">Equipment Questions</SelectItem>
                                  <SelectItem value="funding">Funding & Financing</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us how we can help..." 
                                className="min-h-24"
                                {...field} 
                                data-testid="textarea-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={submitInquiry.isPending} data-testid="button-submit">
                        <Send className="w-4 h-4 mr-2" />
                        {submitInquiry.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border text-center p-8" data-testid="card-success">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-4">We'll get back to you within 24 hours.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Send Another Message
                </Button>
              </Card>
            )}
          </div>
        </section>

        <section className="py-12 bg-[#0A1628]" data-testid="section-final-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready for Expert Guidance?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Try the Laundromat Expert free or subscribe for full access to AI + human expertise
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold" onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-final-cta">
                Try It Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link href="/">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
