import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  FundingPartnerCard, 
  FundingPartnerComparisonTable,
  type FundingPartner 
} from "@/components/FundingPartnerCard";
import { SEO } from "@/components/SEO";
import { 
  DollarSign, Building2, CheckCircle2, Clock, CreditCard, 
  TrendingUp, FileText, Shield, Zap, ArrowRight, ChevronRight,
  HelpCircle, Star, Users, Landmark, Calculator
} from "lucide-react";
import { Link } from "wouter";
import { AuthorExpertise, TrustSignals, RelatedFundingPaths, FundingDisclaimer, ConsultationCTA } from "@/components/FundingEEAT";

const SBA_PARTNERS: FundingPartner[] = [
  {
    id: "south-end-capital",
    name: "South End Capital",
    type: "Preferred SBA Lender (Stearns Bank)",
    description: "Division of $3.2B Stearns Bank. Preferred SBA lender with $0 guarantee fees on loans up to $1M through 2025. Story-based underwriting for complex situations.",
    requirements: {
      minCreditScore: "600+",
      timeInBusiness: "Any (startups OK)",
      minAnnualRevenue: "Any",
      downPayment: "10-15%"
    },
    loanDetails: {
      minAmount: "$1,000",
      maxAmount: "$15,000,000",
      termLength: "Up to 25 years",
      approvalSpeed: "Same day - 48 hours",
      interestRate: "Prime + 2.75%"
    },
    documentation: {
      bankStatements: "6 months",
      taxReturns: "2-3 years",
      financials: "P&L, Balance Sheet",
      other: ["Business plan", "Collateral list"]
    },
    bestFor: ["First-time buyers", "Lower credit scores", "Complex situations", "SBA under $1M"],
    alsoOffers: ["Equipment financing", "Conventional loans", "Fast capital"],
    affiliateUrl: "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat",
    isPrimary: true,
    specialFeature: "$0 SBA Fees up to $1M",
    trustSignals: ["Division of $3.2B Stearns Bank", "Preferred SBA Lender", "Story-based underwriting"]
  },
  {
    id: "rok-financial",
    name: "ROK Financial",
    type: "SBA Loan Marketplace (75+ Lenders)",
    description: "LoanTech-powered platform connecting you to 75+ SBA lenders. No-cost advisor service with 24-48 hour approvals. Simple application process for government-backed funding.",
    requirements: {
      minCreditScore: "675+",
      timeInBusiness: "2+ years",
      minAnnualRevenue: "$120,000+",
      downPayment: "10-20%"
    },
    loanDetails: {
      minAmount: "$50,000",
      maxAmount: "$5,000,000",
      termLength: "Up to 25 years",
      approvalSpeed: "24-48 hours",
      interestRate: "Prime + 2.25-2.75%"
    },
    documentation: {
      bankStatements: "6 months",
      taxReturns: "3 years (personal & business)",
      financials: "YTD P&L, Balance Sheet",
      other: ["SBA Questionnaire", "Business debt schedule", "Signed application"]
    },
    bestFor: ["Experienced operators", "Established businesses", "Refinancing debt", "Expansion"],
    alsoOffers: ["Equipment financing", "Term loans", "Lines of credit", "Revenue-based financing"],
    affiliateUrl: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1",
    specialFeature: "No-Cost Advisor",
    trustSignals: ["75+ lender network", "Government-backed funds", "24-48hr approvals"]
  },
  {
    id: "national-business-capital",
    name: "National Business Capital",
    type: "Large Acquisitions Specialist ($1M+)",
    description: "Access 75+ lenders through one application. Specialists in SBA 7(a) loans with dedicated advisors for complex, multi-unit acquisitions over $1M.",
    requirements: {
      minCreditScore: "580+",
      timeInBusiness: "Any",
      minAnnualRevenue: "Varies by deal",
      downPayment: "10-20%"
    },
    loanDetails: {
      minAmount: "$100,000",
      maxAmount: "$10,000,000",
      termLength: "Up to 25 years",
      approvalSpeed: "24-48 hours"
    },
    documentation: {
      bankStatements: "6 months",
      taxReturns: "2-3 years",
      financials: "P&L, Balance Sheet",
      other: ["Business plan", "Acquisition details"]
    },
    bestFor: ["$1M+ acquisitions", "Multi-unit portfolios", "Experienced operators"],
    alsoOffers: ["SBA 7(a) loans", "Term loans", "Equipment financing"],
    affiliateUrl: "consultation",
    specialFeature: "Dedicated Acquisition Advisor",
    trustSignals: ["75+ lender network", "Large deal specialists"]
  }
];

interface QuizAnswer {
  creditScore?: string;
  timeInBusiness?: string;
  annualRevenue?: string;
  loanAmount?: string;
}

export default function SBALoans() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer>({});
  const [matchedPartner, setMatchedPartner] = useState<FundingPartner | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const quizQuestions = [
    {
      id: "creditScore",
      question: "What's your personal credit score?",
      options: [
        { value: "750+", label: "Excellent (750+)" },
        { value: "700-749", label: "Very Good (700-749)" },
        { value: "650-699", label: "Good (650-699)" },
        { value: "600-649", label: "Fair (600-649)" },
        { value: "below-600", label: "Below 600" }
      ]
    },
    {
      id: "timeInBusiness",
      question: "How long have you been in business?",
      options: [
        { value: "none", label: "This will be my first business" },
        { value: "under-2", label: "Less than 2 years" },
        { value: "2-5", label: "2-5 years" },
        { value: "5+", label: "5+ years" }
      ]
    },
    {
      id: "annualRevenue",
      question: "What's your current annual revenue?",
      options: [
        { value: "none", label: "No current business" },
        { value: "under-120k", label: "Under $120,000" },
        { value: "120k-500k", label: "$120,000 - $500,000" },
        { value: "500k+", label: "Over $500,000" }
      ]
    },
    {
      id: "loanAmount",
      question: "How much funding do you need?",
      options: [
        { value: "under-250k", label: "Under $250,000" },
        { value: "250k-1m", label: "$250,000 - $1,000,000" },
        { value: "1m-5m", label: "$1,000,000 - $5,000,000" },
        { value: "5m+", label: "Over $5,000,000" }
      ]
    }
  ];

  const findBestPartner = (answers: QuizAnswer): FundingPartner => {
    const creditScore = answers.creditScore || "";
    const timeInBiz = answers.timeInBusiness || "";
    const revenue = answers.annualRevenue || "";
    const loanAmount = answers.loanAmount || "";

    if (loanAmount === "5m+" || loanAmount === "1m-5m") {
      if (creditScore === "750+" || creditScore === "700-749") {
        return SBA_PARTNERS.find(p => p.id === "rok-financial")!;
      }
      return SBA_PARTNERS.find(p => p.id === "national-business-capital")!;
    }

    if (timeInBiz === "2-5" || timeInBiz === "5+") {
      if (revenue === "120k-500k" || revenue === "500k+") {
        if (creditScore === "750+" || creditScore === "700-749") {
          return SBA_PARTNERS.find(p => p.id === "rok-financial")!;
        }
      }
    }

    return SBA_PARTNERS.find(p => p.id === "south-end-capital")!;
  };

  const handleQuizAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...quizAnswers, [questionId]: value };
    setQuizAnswers(newAnswers);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      const bestPartner = findBestPartner(newAnswers);
      setMatchedPartner(bestPartner);
    }
  };

  const handleApply = (partner: FundingPartner) => {
    if (partner.affiliateUrl === "consultation") {
      window.location.href = "mailto:consult@washbizhub.com?subject=SBA%20Loan%20Consultation%20Request";
    } else {
      window.open(partner.affiliateUrl, "_blank");
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setMatchedPartner(null);
    setShowQuiz(false);
  };

  return (
    <>
      <SEO
        title="SBA Loans for Laundromats | SBA 7(a) Financing up to $15M | WashBizHub"
        description="Get SBA 7(a) loans for laundromat acquisition. $0 SBA fees up to $1M, 10% down payment, 25-year terms. Compare 3 trusted SBA lenders. Pre-qualify in minutes."
        canonicalUrl="/sba-loans"
        ogType="website"
        keywords={[
          "SBA loan laundromat",
          "SBA 7a laundromat",
          "laundromat acquisition loan",
          "buy laundromat financing",
          "SBA loan 10% down",
          "laundromat business loan",
          "SBA lender laundromat"
        ]}
        faqs={[
          {
            question: "What is the minimum down payment for an SBA laundromat loan?",
            answer: "Most SBA loans require 10-15% down payment (equity injection). Some lenders like South End Capital may work with as low as 10% for well-qualified borrowers."
          },
          {
            question: "What credit score do I need for an SBA loan?",
            answer: "Requirements vary: South End Capital works with 600+, ROK Financial requires 675+, and National Business Capital accepts 580+. Higher credit scores get better rates."
          },
          {
            question: "How long does SBA loan approval take?",
            answer: "Pre-approval can happen in 24-48 hours. Full funding typically takes 30-90 days depending on deal complexity and documentation."
          },
          {
            question: "Can I get an SBA loan with no business experience?",
            answer: "Yes. South End Capital specializes in first-time buyers and uses story-based underwriting. Industry experience helps but isn't always required."
          }
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Funding", url: "/funding" },
          { name: "SBA Loans", url: "/sba-loans" }
        ]}
        author={{
          name: "Nicholas Kremers",
          expertise: "Laundromat Industry Advisor",
          credentials: "Founder of WashBizHub, helping entrepreneurs secure laundromat financing"
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8f] to-[#1e3a5f] text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm mb-4">
              <Link href="/funding" className="text-white/70 hover:text-white">Funding</Link>
              <ChevronRight className="w-4 h-4 text-white/50" />
              <span>SBA Loans</span>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-[#b8860b] text-white mb-4">
                  <Landmark className="w-3 h-3 mr-1" /> Government-Backed Financing
                </Badge>
                <div className="mb-6">
                  <TrustSignals variant="horizontal" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  SBA Loans for{' '}
                  <span className="text-[#b8860b]">Laundromat</span>{' '}
                  Acquisition
                </h1>
                <p className="text-lg text-white/80 mb-6">
                  The gold standard for buying a laundromat. SBA 7(a) loans offer the lowest rates, 
                  longest terms (up to 25 years), and as little as 10% down payment.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg" 
                    className="bg-[#b8860b] hover:bg-[#9a7209] text-white"
                    onClick={() => setShowQuiz(true)}
                    data-testid="start-qualifier"
                  >
                    Find Your Best SBA Lender <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Link href="/sba-readiness">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Calculator className="w-4 h-4 mr-2" /> Check SBA Readiness
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "$0", label: "SBA Fees up to $1M*", icon: DollarSign },
                  { value: "10%", label: "Minimum Down Payment", icon: TrendingUp },
                  { value: "25 yrs", label: "Maximum Term Length", icon: Clock },
                  { value: "24-48hr", label: "Pre-Approval Speed", icon: Zap }
                ].map((stat, i) => (
                  <Card key={i} className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <stat.icon className="w-6 h-6 text-[#b8860b] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-white/70">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showQuiz && !matchedPartner && (
          <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
            <Card className="shadow-xl border-2 border-[#b8860b]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#b8860b]" />
                    Find Your Best SBA Lender
                  </CardTitle>
                  <Badge variant="outline">Step {quizStep + 1} of {quizQuestions.length}</Badge>
                </div>
                <Progress value={((quizStep + 1) / quizQuestions.length) * 100} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">{quizQuestions[quizStep].question}</h3>
                  <RadioGroup
                    onValueChange={(value) => handleQuizAnswer(quizQuestions[quizStep].id, value)}
                    className="space-y-3"
                  >
                    {quizQuestions[quizStep].options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button variant="ghost" onClick={resetQuiz} className="w-full">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {matchedPartner && (
          <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
            <Card className="shadow-xl border-2 border-green-500">
              <CardHeader className="bg-green-50 dark:bg-green-900/20">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-6 h-6" />
                  We Found Your Best Match!
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on your profile, this lender is the best fit for your SBA loan needs.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <FundingPartnerCard 
                  partner={matchedPartner} 
                  onApply={handleApply}
                  showDocumentation={true}
                />
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={resetQuiz} className="flex-1">
                    Try Again
                  </Button>
                  <Link href="#all-partners" className="flex-1">
                    <Button variant="ghost" className="w-full">
                      View All Partners
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Government Backed</h3>
              <p className="text-sm text-muted-foreground">
                SBA guarantees up to 85% of the loan, reducing lender risk and getting you better terms.
              </p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Lowest Rates</h3>
              <p className="text-sm text-muted-foreground">
                Prime + 2.25-2.75% rates are typically lower than conventional business loans.
              </p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 dark:bg-[#1e3a5f]/30 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-[#1e3a5f]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Longer Terms</h3>
              <p className="text-sm text-muted-foreground">
                Up to 25-year terms mean lower monthly payments and better cash flow from day one.
              </p>
            </Card>
          </div>

          <div id="all-partners" className="scroll-mt-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                  Our Trusted SBA Lending Partners
                </h2>
                <p className="text-muted-foreground mt-1">
                  Pre-screened lenders who specialize in laundromat acquisitions
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                <Button 
                  variant={viewMode === "cards" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  data-testid="view-cards"
                >
                  Cards
                </Button>
                <Button 
                  variant={viewMode === "table" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewMode("table")}
                  data-testid="view-table"
                >
                  Compare
                </Button>
              </div>
            </div>

            {viewMode === "cards" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SBA_PARTNERS.map((partner) => (
                  <FundingPartnerCard 
                    key={partner.id}
                    partner={partner}
                    onApply={handleApply}
                    showDocumentation={false}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <FundingPartnerComparisonTable 
                    partners={SBA_PARTNERS}
                    onApply={handleApply}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">SBA 7(a) Loan Requirements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-[#b8860b]" />
                    Documentation Typically Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "6 months of business bank statements",
                      "2-3 years of personal & business tax returns",
                      "Year-to-date profit & loss statement",
                      "Current balance sheet",
                      "Business debt schedule",
                      "SBA loan application (Form 1919)",
                      "Personal financial statement (Form 413)"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-[#b8860b]" />
                    Who Qualifies for SBA Loans?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "U.S. citizens or legal permanent residents",
                      "For-profit businesses operating in the U.S.",
                      "Owners with at least 20% stake in the business",
                      "Demonstrated ability to repay (cash flow analysis)",
                      "No prior defaults on government loans",
                      "Good character (background check required)"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Not Sure If You Qualify for SBA?
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Take our free SBA Readiness Assessment to see your approval odds and get personalized recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/sba-readiness">
                <Button size="lg" className="bg-[#b8860b] hover:bg-[#9a7209]">
                  <Calculator className="w-4 h-4 mr-2" /> Take SBA Readiness Quiz
                </Button>
              </Link>
              <Link href="/funding">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Explore Other Funding Options
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16">
            <AuthorExpertise variant="full" />
          </div>

          <div className="mt-16">
            <RelatedFundingPaths currentPath="/sba-loans" />
          </div>

          <div className="mt-16">
            <ConsultationCTA />
          </div>

          <div className="mt-16">
            <FundingDisclaimer />
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              * $0 SBA guarantee fees apply to loans under $1M through South End Capital (Stearns Bank) through 2025. 
              Terms and conditions apply. WashBizHub may receive compensation from lending partners for referrals.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
