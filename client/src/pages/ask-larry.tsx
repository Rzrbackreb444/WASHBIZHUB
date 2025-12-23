import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import wbhLogo from "@assets/0e699c28-a096-4776-86d0-ffcbe3b0467e_1766502905215.jpg";
import {
  MessageSquare, Send, Clock, CheckCircle2, Star, Crown,
  User, Mail, Phone, Calendar, ArrowRight, Sparkles,
  ThumbsUp, Eye, Reply, Filter, Search, Loader2, Lock,
  Award, TrendingUp, FileText, BookOpen, Calculator
} from "lucide-react";

interface Question {
  id: string;
  userEmail: string;
  userName: string;
  question: string;
  category: string;
  status: "pending" | "answered" | "featured";
  answer?: string;
  createdAt: string;
  answeredAt?: string;
  upvotes: number;
  views: number;
}

// Mock questions for demo
const DEMO_QUESTIONS: Question[] = [
  {
    id: "1",
    userEmail: "investor@example.com",
    userName: "Michael R.",
    question: "Larry, I'm looking at a laundromat that's asking $400K with claimed revenue of $180K/year. The equipment is 8 years old. Is this a fair deal?",
    category: "Valuation",
    status: "answered",
    answer: "Great question, Michael! At $180K gross revenue, you're looking at about a 2.2x multiple which is on the lower end - typically good deals are 2.5-3.5x. However, 8-year-old equipment is a concern. You'll likely need $50-80K in equipment upgrades within 2-3 years. I'd negotiate down to $320-350K or ask for equipment credits. Also verify that revenue with utility bills - 8-year equipment at $180K means they're doing about 7 turns per day which is excellent. Always verify the numbers!",
    createdAt: "2024-12-20T10:30:00Z",
    answeredAt: "2024-12-20T14:15:00Z",
    upvotes: 47,
    views: 234,
  },
  {
    id: "2",
    userEmail: "newowner@example.com",
    userName: "Sarah L.",
    question: "Just bought my first laundromat. What's the first thing I should focus on in the first 90 days?",
    category: "Operations",
    status: "answered",
    answer: "Congratulations Sarah! The first 90 days are critical. Here's my 50-year-tested playbook: Days 1-30: Be there EVERY day. Watch everything. Learn your regulars' names. Check every machine's coin box daily to understand revenue patterns. Days 31-60: Deep clean everything. Fix every broken machine. Install better lighting if needed. Days 61-90: Implement small improvements based on what you learned. Start a loyalty program. Consider adding services like drop-off. The biggest mistake new owners make is trying to change too much too fast. Observe first, then optimize!",
    createdAt: "2024-12-19T08:00:00Z",
    answeredAt: "2024-12-19T16:30:00Z",
    upvotes: 89,
    views: 567,
  },
  {
    id: "3",
    userEmail: "operator@example.com",
    userName: "James T.",
    question: "My utility costs are eating 35% of my revenue. Is that normal? How can I reduce this?",
    category: "Operations",
    status: "featured",
    answer: "35% is way too high, James! Industry standard is 18-25% of gross for all utilities combined. Here's how to diagnose: 1) Check for water leaks - a single leaky fill valve can waste thousands of gallons monthly. 2) Verify gas rates - many owners are on the wrong rate class. 3) Check machine efficiency - older machines use 40% more water. 4) Install ozone systems - they reduce hot water needs by 80%. 5) LED lighting throughout. I've seen owners cut utility costs by 40% just by fixing hidden leaks and negotiating better gas rates. Start with a water audit!",
    createdAt: "2024-12-18T14:20:00Z",
    answeredAt: "2024-12-18T18:45:00Z",
    upvotes: 156,
    views: 892,
  },
  {
    id: "4",
    userEmail: "seller@example.com",
    userName: "Robert K.",
    question: "I'm ready to sell after 15 years. What's the best way to maximize my sale price?",
    category: "Selling",
    status: "pending",
    createdAt: "2024-12-21T09:00:00Z",
    upvotes: 12,
    views: 45,
  },
  {
    id: "5",
    userEmail: "startup@example.com",
    userName: "Amanda P.",
    question: "Should I buy an existing laundromat or build from scratch? I have $250K to invest.",
    category: "Buying",
    status: "pending",
    createdAt: "2024-12-21T11:30:00Z",
    upvotes: 8,
    views: 32,
  },
];

const CATEGORIES = [
  "All Questions",
  "Valuation",
  "Operations",
  "Buying",
  "Selling",
  "Equipment",
  "Marketing",
  "Financing",
];

export default function AskLarry() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [category, setCategory] = useState("All Questions");
  const [searchQuery, setSearchQuery] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("Operations");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  
  // Filter questions
  const filteredQuestions = DEMO_QUESTIONS.filter(q => {
    const matchesCategory = category === "All Questions" || q.category === category;
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.answer?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const pendingQuestions = DEMO_QUESTIONS.filter(q => q.status === "pending");
  const answeredQuestions = DEMO_QUESTIONS.filter(q => q.status === "answered" || q.status === "featured");
  const featuredQuestions = DEMO_QUESTIONS.filter(q => q.status === "featured");
  
  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your question for Larry.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call - in production this would send to nick@washbizhub.com and larry@washbizhub.com
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Question Submitted!",
      description: "Larry will review your question and respond soon. You'll receive an email notification when answered.",
    });
    
    setNewQuestion("");
    setIsSubmitting(false);
  };
  
  const handleAnswerQuestion = async () => {
    if (!answerText.trim() || !selectedQuestion) return;
    
    // Simulate sending answer
    toast({
      title: "Answer Submitted!",
      description: `Your answer to ${selectedQuestion.userName}'s question has been published.`,
    });
    
    setShowAnswerDialog(false);
    setAnswerText("");
    setSelectedQuestion(null);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <SEO
        title="Ask Larry - Expert Laundromat Advice | WashBizHub"
        description="Get your laundromat questions answered by Larry Larsen, 50+ year industry veteran. Premium subscriber feature for expert advice on buying, selling, operations, and more."
        canonicalUrl="/ask-larry"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#001F3F]">
        {/* Hero Section */}
        <section className="relative py-12 px-6 border-b border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 p-1">
                  <div className="w-full h-full rounded-full bg-[#001F3F] flex items-center justify-center">
                    <img src={wbhLogo} alt="WashBizHub" className="w-24 h-24 rounded-full object-cover" />
                  </div>
                </div>
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black">
                  <Award className="w-3 h-3 mr-1" /> 50+ Years
                </Badge>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  ASK <span className="text-yellow-400">LARRY</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl">
                  Get expert answers from Larry Larsen, the industry's most experienced laundromat consultant. 
                  50+ years of hands-on experience at your fingertips.
                </p>
                
                <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-white/60">
                    <MessageSquare className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">{answeredQuestions.length} Questions Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Eye className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">{DEMO_QUESTIONS.reduce((sum, q) => sum + q.views, 0).toLocaleString()} Total Views</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <ThumbsUp className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">{DEMO_QUESTIONS.reduce((sum, q) => sum + q.upvotes, 0)} Upvotes</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <Card className="bg-yellow-500/10 border-yellow-500/30 w-64">
                  <CardContent className="p-4 text-center">
                    <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h3 className="text-white font-bold mb-1">Premium Feature</h3>
                    <p className="text-white/60 text-sm mb-3">
                      Subscribers can ask Larry directly and get personalized answers.
                    </p>
                    <Link href="/pricing">
                      <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400" data-testid="button-subscribe">
                        Subscribe Now <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/10 border border-white/10">
              <TabsTrigger value="browse" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-[#001F3F]" data-testid="tab-browse">
                <MessageSquare className="w-4 h-4 mr-1" /> Browse Q&A
              </TabsTrigger>
              <TabsTrigger value="ask" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black" data-testid="tab-ask">
                <Send className="w-4 h-4 mr-1" /> Ask Larry
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-[#001F3F]" data-testid="tab-manage">
                <Reply className="w-4 h-4 mr-1" /> Manage ({pendingQuestions.length})
              </TabsTrigger>
            </TabsList>
            
            {/* Browse Tab */}
            <TabsContent value="browse" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search questions and answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    data-testid="input-search"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategory(cat)}
                      className={category === cat 
                        ? "bg-[#39CCCC] text-[#001F3F]" 
                        : "border-white/20 text-white hover:bg-white/10"
                      }
                      data-testid={`button-category-${cat.toLowerCase().replace(' ', '-')}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Featured Questions */}
              {featuredQuestions.length > 0 && category === "All Questions" && (
                <div className="space-y-4">
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" /> Featured Answers
                  </h2>
                  {featuredQuestions.map((q) => (
                    <Card key={q.id} className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-yellow-500/20 text-yellow-400">
                              {q.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-white font-medium">{q.userName}</span>
                              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                {q.category}
                              </Badge>
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                <Star className="w-3 h-3 mr-1" /> Featured
                              </Badge>
                            </div>
                            <p className="text-white mb-4">{q.question}</p>
                            
                            {q.answer && (
                              <div className="bg-white/5 rounded-lg p-4 border-l-4 border-yellow-500">
                                <div className="flex items-center gap-2 mb-2">
                                  <img src={wbhLogo} alt="Larry" className="w-6 h-6 rounded-full" />
                                  <span className="text-yellow-400 font-medium text-sm">Larry Larsen</span>
                                  <span className="text-white/40 text-xs">answered {formatDate(q.answeredAt!)}</span>
                                </div>
                                <p className="text-white/80 text-sm whitespace-pre-line">{q.answer}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 mt-4 text-white/50 text-sm">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" /> {q.upvotes}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" /> {q.views}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* All Questions */}
              <div className="space-y-4">
                <h2 className="text-white font-bold">
                  {category === "All Questions" ? "All Questions" : `${category} Questions`}
                  <span className="text-white/50 font-normal ml-2">({filteredQuestions.length})</span>
                </h2>
                
                {filteredQuestions.filter(q => q.status !== "featured").map((q) => (
                  <Card key={q.id} className="bg-white/10 border-white/10 hover:bg-white/15 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-[#39CCCC]/20 text-[#39CCCC]">
                            {q.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-medium">{q.userName}</span>
                            <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                              {q.category}
                            </Badge>
                            {q.status === "pending" && (
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                <Clock className="w-3 h-3 mr-1" /> Pending
                              </Badge>
                            )}
                            {q.status === "answered" && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Answered
                              </Badge>
                            )}
                            <span className="text-white/40 text-xs ml-auto">{formatDate(q.createdAt)}</span>
                          </div>
                          <p className="text-white mb-4">{q.question}</p>
                          
                          {q.answer && (
                            <div className="bg-white/5 rounded-lg p-4 border-l-4 border-[#39CCCC]">
                              <div className="flex items-center gap-2 mb-2">
                                <img src={wbhLogo} alt="Larry" className="w-6 h-6 rounded-full" />
                                <span className="text-[#39CCCC] font-medium text-sm">Larry Larsen</span>
                                <span className="text-white/40 text-xs">answered {formatDate(q.answeredAt!)}</span>
                              </div>
                              <p className="text-white/80 text-sm whitespace-pre-line">{q.answer}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-4 text-white/50 text-sm">
                            <button className="flex items-center gap-1 hover:text-[#39CCCC] transition-colors">
                              <ThumbsUp className="w-4 h-4" /> {q.upvotes}
                            </button>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" /> {q.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Ask Tab */}
            <TabsContent value="ask">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-white/10 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Send className="w-5 h-5 text-yellow-400" />
                        Ask Larry a Question
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Premium subscribers get personalized answers from Larry Larsen himself.
                        Questions are answered within 24-48 hours.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Your Question</Label>
                        <Textarea
                          placeholder="Ask Larry anything about buying, selling, operating, or valuing a laundromat..."
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[150px]"
                          data-testid="textarea-question"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Category</Label>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.filter(c => c !== "All Questions").map((cat) => (
                            <Button
                              key={cat}
                              variant={newCategory === cat ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewCategory(cat)}
                              className={newCategory === cat 
                                ? "bg-yellow-500 text-black" 
                                : "border-white/20 text-white hover:bg-white/10"
                              }
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-white font-medium mb-1">Premium Subscribers Only</h4>
                            <p className="text-white/60 text-sm">
                              This feature is available to premium subscribers. Your question will be sent to Larry
                              and you'll receive an email notification when it's answered.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                        onClick={handleSubmitQuestion}
                        disabled={isSubmitting}
                        data-testid="button-submit-question"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                        ) : (
                          <><Send className="w-4 h-4 mr-2" /> Submit Question</>
                        )}
                      </Button>
                      
                      <p className="text-white/40 text-xs text-center">
                        Notifications sent to nick@washbizhub.com and larry@washbizhub.com
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card className="bg-white/10 border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">Popular Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { topic: "Valuation & Pricing", count: 47 },
                        { topic: "Due Diligence", count: 38 },
                        { topic: "Equipment Selection", count: 32 },
                        { topic: "Utility Optimization", count: 28 },
                        { topic: "Marketing & Growth", count: 25 },
                      ].map((item) => (
                        <div key={item.topic} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-white/80 text-sm">{item.topic}</span>
                          <Badge variant="outline" className="text-xs border-white/20 text-white/50">
                            {item.count} Q's
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-[#39CCCC]/20 to-[#39CCCC]/5 border-[#39CCCC]/30">
                    <CardContent className="p-4 text-center">
                      <Sparkles className="w-8 h-8 text-[#39CCCC] mx-auto mb-2" />
                      <h3 className="text-white font-bold mb-1">Need Faster Help?</h3>
                      <p className="text-white/60 text-sm mb-3">
                        Book a consultation with Larry for immediate expert guidance.
                      </p>
                      <Link href="/consultation">
                        <Button variant="outline" className="w-full border-[#39CCCC] text-[#39CCCC] hover:bg-[#39CCCC]/10">
                          Book Consultation <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Manage Tab (Admin Only) */}
            <TabsContent value="manage">
              <Card className="bg-white/10 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Reply className="w-5 h-5 text-[#39CCCC]" />
                    Pending Questions
                    <Badge className="ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {pendingQuestions.length} Pending
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Answer questions from subscribers. Answers are emailed to the asker and published publicly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingQuestions.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-white font-bold mb-2">All Caught Up!</h3>
                      <p className="text-white/60">No pending questions to answer.</p>
                    </div>
                  ) : (
                    pendingQuestions.map((q) => (
                      <div key={q.id} className="bg-white/5 rounded-lg p-4 border border-orange-500/20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-orange-500/20 text-orange-400 text-xs">
                                  {q.userName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white font-medium">{q.userName}</span>
                              <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                                {q.category}
                              </Badge>
                              <span className="text-white/40 text-xs">{formatDate(q.createdAt)}</span>
                            </div>
                            <p className="text-white">{q.question}</p>
                          </div>
                          <Button
                            className="bg-[#39CCCC] text-[#001F3F]"
                            onClick={() => {
                              setSelectedQuestion(q);
                              setShowAnswerDialog(true);
                            }}
                            data-testid={`button-answer-${q.id}`}
                          >
                            <Reply className="w-4 h-4 mr-1" /> Answer
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Answer Dialog */}
        <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
          <DialogContent className="bg-[#001F3F] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Reply className="w-5 h-5 text-[#39CCCC]" />
                Answer Question
              </DialogTitle>
            </DialogHeader>
            
            {selectedQuestion && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-medium">{selectedQuestion.userName}</span>
                    <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                      {selectedQuestion.category}
                    </Badge>
                  </div>
                  <p className="text-white/80">{selectedQuestion.question}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Your Answer (as Larry)</Label>
                  <Textarea
                    placeholder="Write your expert answer..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[200px]"
                    data-testid="textarea-answer"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white"
                    onClick={() => setShowAnswerDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#39CCCC] text-[#001F3F]"
                    onClick={handleAnswerQuestion}
                    data-testid="button-submit-answer"
                  >
                    <Send className="w-4 h-4 mr-2" /> Publish Answer
                  </Button>
                </div>
                
                <p className="text-white/40 text-xs text-center">
                  Answer will be emailed to {selectedQuestion.userEmail} and published publicly
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
