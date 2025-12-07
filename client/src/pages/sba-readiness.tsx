import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  DollarSign,
  Building2,
  CreditCard,
  Clock,
  FileText,
  TrendingUp,
  Users,
  Shield,
  Sparkles,
  Download,
  Mail,
  Phone,
  ChevronRight
} from "lucide-react";
import { SEO } from "@/components/SEO";

interface Question {
  id: string;
  question: string;
  description: string;
  icon: React.ElementType;
  options: { label: string; value: number; description?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "credit_score",
    question: "What's your personal credit score range?",
    description: "SBA lenders typically require 650+ for approval",
    icon: CreditCard,
    options: [
      { label: "750+", value: 25, description: "Excellent" },
      { label: "700-749", value: 20, description: "Very Good" },
      { label: "650-699", value: 15, description: "Good" },
      { label: "600-649", value: 8, description: "Fair" },
      { label: "Below 600", value: 2, description: "Needs Work" },
    ],
  },
  {
    id: "down_payment",
    question: "How much can you contribute as a down payment?",
    description: "SBA loans typically require 10-20% equity injection",
    icon: DollarSign,
    options: [
      { label: "20%+ of purchase price", value: 25, description: "Ideal" },
      { label: "15-19%", value: 20, description: "Strong" },
      { label: "10-14%", value: 15, description: "Standard" },
      { label: "5-9%", value: 8, description: "Below Standard" },
      { label: "Less than 5%", value: 2, description: "Challenging" },
    ],
  },
  {
    id: "business_experience",
    question: "Do you have laundromat or business ownership experience?",
    description: "Industry experience significantly improves approval odds",
    icon: Building2,
    options: [
      { label: "5+ years laundromat experience", value: 20, description: "Excellent" },
      { label: "1-4 years laundromat experience", value: 18, description: "Strong" },
      { label: "Other business ownership", value: 14, description: "Good" },
      { label: "Management experience only", value: 10, description: "Fair" },
      { label: "No business experience", value: 4, description: "Will need support" },
    ],
  },
  {
    id: "collateral",
    question: "Do you have additional collateral (real estate, equipment)?",
    description: "Collateral reduces lender risk and improves terms",
    icon: Shield,
    options: [
      { label: "Significant real estate equity", value: 15, description: "Strong position" },
      { label: "Some real estate or assets", value: 12, description: "Good" },
      { label: "Equipment/vehicles only", value: 8, description: "Fair" },
      { label: "Limited collateral", value: 4, description: "Standard" },
      { label: "No additional collateral", value: 2, description: "Minimal" },
    ],
  },
  {
    id: "business_plan",
    question: "Do you have a formal business plan?",
    description: "A solid business plan is required for SBA approval",
    icon: FileText,
    options: [
      { label: "Complete with financials", value: 15, description: "Ready" },
      { label: "Draft in progress", value: 10, description: "Getting there" },
      { label: "Basic outline only", value: 6, description: "Needs work" },
      { label: "No business plan yet", value: 2, description: "Required" },
    ],
  },
];

const getGrade = (score: number): { grade: string; color: string; label: string } => {
  if (score >= 85) return { grade: "A", color: "#22C55E", label: "Excellent - SBA Ready" };
  if (score >= 70) return { grade: "B", color: "#A3E635", label: "Good - Minor Improvements Needed" };
  if (score >= 55) return { grade: "C", color: "#FBBF24", label: "Fair - Some Work Required" };
  return { grade: "Needs Work", color: "#C8A661", label: "Strategic Improvements Required" };
};

export default function SBAReadiness() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const progress = ((currentStep + 1) / (totalQuestions + 1)) * 100;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentStep < totalQuestions - 1) {
      setTimeout(() => setCurrentStep((prev) => prev + 1), 300);
    } else {
      setTimeout(() => setCurrentStep(totalQuestions), 300);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          source: "sba-readiness",
          score: calculateScore(),
          answers,
        }),
      });
    } catch (error) {
      console.error("Failed to save lead:", error);
    }
    
    setEmailSubmitted(true);
    setShowResults(true);
  };

  const score = calculateScore();
  const gradeInfo = getGrade(score);

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <AuthGuard title="Sign In to Check SBA Readiness" description="Sign in to access this feature.">
      <SEO
        title="SBA Loan Readiness Checker for Laundromats"
        description="Free 2-minute SBA loan readiness assessment for laundromat buyers. Get your instant score and personalized recommendations to qualify for financing."
        canonicalUrl="/sba-readiness"
        keywords={[
          "SBA loan readiness",
          "laundromat financing qualification",
          "SBA loan requirements laundromat",
          "laundromat loan pre-qualification",
          "SBA 7a loan laundromat",
          "laundromat financing checklist",
          "qualify for laundromat loan",
          "SBA loan credit score requirements",
          "laundromat down payment requirements",
          "coin laundry financing",
          "laundromat acquisition financing",
          "SBA loan eligibility checker",
          "laundromat business loan",
          "small business loan laundromat"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Funding", url: "/funding" },
          { name: "SBA Readiness Checker", url: "/sba-readiness" }
        ]}
        faqs={[
          {
            question: "What credit score do I need for an SBA laundromat loan?",
            answer: "SBA lenders typically require a minimum credit score of 650 for approval, though 700+ is preferred for better rates. Scores above 750 are considered excellent and offer the best terms and highest approval chances."
          },
          {
            question: "How much down payment is required for an SBA laundromat loan?",
            answer: "SBA loans typically require a 10-20% equity injection (down payment). A 20% or higher down payment is ideal and significantly improves your approval odds and loan terms."
          },
          {
            question: "Do I need laundromat experience to get an SBA loan?",
            answer: "While not strictly required, industry experience significantly improves approval odds. Having 1+ years of laundromat experience is considered strong. Other business ownership or management experience can also help qualify you."
          },
          {
            question: "What is the SBA Readiness Checker?",
            answer: "Our free 2-minute assessment evaluates key factors that SBA lenders consider: credit score, down payment capacity, business experience, available collateral, and business plan readiness. You receive an instant score and personalized recommendations."
          },
          {
            question: "Is a business plan required for SBA loan approval?",
            answer: "Yes, a comprehensive business plan with financial projections is required for SBA loan approval. The plan should include an executive summary, market analysis, financial statements, and growth projections."
          },
          {
            question: "What types of SBA loans are available for laundromats?",
            answer: "The most common SBA loans for laundromats are the SBA 7(a) loan (for general business purposes including acquisitions) and SBA 504 loan (for real estate and equipment). Conventional bank loans and seller financing are also options."
          }
        ]}
        howTo={{
          name: "How to Check Your SBA Loan Readiness",
          description: "Complete our free 2-minute assessment to determine if you qualify for SBA financing to buy or expand your laundromat.",
          totalTime: "PT2M",
          steps: [
            {
              name: "Answer Credit Score Question",
              text: "Select your personal credit score range from the options provided. SBA lenders typically require 650+ for approval, with 700+ being preferred."
            },
            {
              name: "Indicate Down Payment Capacity",
              text: "Choose how much you can contribute as a down payment. SBA loans typically require 10-20% equity injection."
            },
            {
              name: "Share Your Experience Level",
              text: "Select your laundromat or business ownership experience. Industry experience significantly improves approval odds."
            },
            {
              name: "Describe Available Collateral",
              text: "Indicate if you have additional collateral such as real estate equity, equipment, or other assets that reduce lender risk."
            },
            {
              name: "Confirm Business Plan Status",
              text: "Select whether you have a formal business plan with financials, as this is required for SBA approval. Get your instant readiness score and personalized recommendations."
            }
          ]
        }}
        author={{
          name: "WashBizHub",
          expertise: "Laundromat Financing Specialists",
          credentials: "Industry experts helping laundromat buyers navigate SBA loans and alternative financing options"
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4" data-testid="badge-free">
              <Sparkles className="w-3 h-3 mr-1" />
              Free 2-Minute Assessment
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="text-title">
              SBA Loan Readiness Checker
            </h1>
            
            <p className="text-lg text-slate-400 max-w-2xl mx-auto" data-testid="text-subtitle">
              Find out if you qualify for SBA financing to buy or expand your laundromat. 
              Get your instant readiness score and personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Question {Math.min(currentStep + 1, totalQuestions)} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {/* Questions */}
          {currentStep < totalQuestions && currentQuestion && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-4">
                    <currentQuestion.icon className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2" data-testid="text-question">
                    {currentQuestion.question}
                  </h2>
                  <p className="text-slate-400">{currentQuestion.description}</p>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(currentQuestion.id, option.value)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        answers[currentQuestion.id] === option.value
                          ? "bg-green-500/20 border-green-500/50 text-white"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                      data-testid={`option-${currentQuestion.id}-${i}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <Badge variant="outline" className="text-xs border-white/20">
                            {option.description}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="mt-6 text-slate-400"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
              </Card>
            </motion.div>
          )}

          {/* Email Capture */}
          {currentStep >= totalQuestions && !showResults && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4">
                    <Mail className="w-8 h-8 text-amber-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Your Results Are Ready!
                  </h2>
                  <p className="text-slate-400">
                    Enter your email to get your personalized SBA Readiness Score, 
                    detailed recommendations, and a free funding guide.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      data-testid="input-phone"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg rounded-xl"
                    data-testid="button-get-results"
                  >
                    Get My Readiness Score
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <p className="text-xs text-slate-500 text-center">
                    We respect your privacy. No spam, unsubscribe anytime.
                  </p>
                </form>

                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="mt-4 text-slate-400 w-full"
                  data-testid="button-back-email"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Questions
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          {showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Score Card */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 sm:p-8 text-center">
                <h2 className="text-lg text-slate-400 mb-4">Your SBA Readiness Score</h2>
                
                <div 
                  className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4"
                  style={{ 
                    background: `conic-gradient(${gradeInfo.color} ${score}%, transparent ${score}%)`,
                    padding: "8px"
                  }}
                >
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <span 
                      className="text-4xl font-bold"
                      style={{ color: gradeInfo.color }}
                      data-testid="text-grade"
                    >
                      {gradeInfo.grade}
                    </span>
                  </div>
                </div>
                
                <p className="text-xl font-semibold text-white mb-2" data-testid="text-score">
                  {score} / 100 Points
                </p>
                <p className="text-slate-400" style={{ color: gradeInfo.color }}>
                  {gradeInfo.label}
                </p>
              </Card>

              {/* Recommendations */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Personalized Recommendations
                </h3>
                
                <div className="space-y-3">
                  {score < 85 && answers.credit_score && answers.credit_score < 20 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Improve Credit Score</p>
                        <p className="text-sm text-slate-400">Work on raising your credit score above 700 for better rates and approval odds.</p>
                      </div>
                    </div>
                  )}
                  
                  {answers.business_plan && answers.business_plan < 15 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Complete Your Business Plan</p>
                        <p className="text-sm text-slate-400">A comprehensive business plan with financial projections is required for SBA approval.</p>
                      </div>
                    </div>
                  )}
                  
                  {answers.down_payment && answers.down_payment < 15 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Increase Down Payment</p>
                        <p className="text-sm text-slate-400">Aim for at least 15-20% equity injection to improve approval chances.</p>
                      </div>
                    </div>
                  )}
                  
                  {score >= 70 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">You're on Track!</p>
                        <p className="text-sm text-slate-400">Your profile looks strong for SBA financing. Consider scheduling a consultation to discuss your options.</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* CTA Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card 
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-6 cursor-pointer hover:border-green-500/50 transition-all"
                  onClick={() => setLocation("/startup-funding")}
                  data-testid="card-funding-options"
                >
                  <DollarSign className="w-8 h-8 text-green-400 mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">Explore Funding Options</h4>
                  <p className="text-sm text-slate-400 mb-4">Browse SBA lenders, equipment financing, and alternative funding sources.</p>
                  <span className="text-green-400 text-sm font-medium flex items-center">
                    View Options <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </Card>

                <Card 
                  className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 p-6 cursor-pointer hover:border-amber-500/50 transition-all"
                  onClick={() => setLocation("/larry-larsen")}
                  data-testid="card-expert-consultation"
                >
                  <Users className="w-8 h-8 text-amber-400 mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">Expert Consultation</h4>
                  <p className="text-sm text-slate-400 mb-4">Work with Larry Larsen, 50+ year industry veteran, for personalized guidance.</p>
                  <span className="text-amber-400 text-sm font-medium flex items-center">
                    Book Consultation <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </Card>
              </div>

              {/* Premium Upsell */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-1">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-3">
                      Premium
                    </Badge>
                    <h3 className="text-xl font-bold text-white mb-2">
                      AI Business Plan Generator
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Get a complete, SBA-ready business plan generated in minutes. Includes financial projections, 
                      market analysis, and everything lenders require.
                    </p>
                    <ul className="space-y-2 mb-4">
                      {[
                        "Full financial projections",
                        "Market analysis & competition",
                        "Executive summary",
                        "SBA-compliant format",
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-3xl font-bold text-white mb-1">$299</p>
                    <p className="text-sm text-slate-400 mb-4">One-time purchase</p>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                      onClick={() => setLocation("/business-plan-generator")}
                      data-testid="button-business-plan"
                    >
                      Generate My Plan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Back to Start */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentStep(0);
                    setAnswers({});
                    setShowResults(false);
                    setEmailSubmitted(false);
                  }}
                  className="text-slate-400"
                  data-testid="button-restart"
                >
                  Take Assessment Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </AuthGuard>
  );
}
