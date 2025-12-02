import { useState, lazy, Suspense } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { 
  DollarSign, CheckCircle2, Building2, Zap, Clock, Shield, 
  ArrowRight, Star, TrendingUp, ExternalLink, Phone, Mail,
  CreditCard, Loader2, Users, Award, Target, Truck, Factory,
  Briefcase, PiggyBank, FileText, Calculator, ChevronDown,
  HelpCircle, Wrench, Receipt, Landmark, BadgeCheck
} from "lucide-react";
import fundingHeroImg from "@assets/WBH FUNDING MATCHER SEARCH IMAGE_1763780009740.png";

interface FundingPartner {
  id: string;
  name: string;
  logo?: string;
  type: string;
  description: string;
  products: string[];
  minLoan: number;
  maxLoan: number;
  minCredit: number;
  minTimeInBusiness: number;
  approvalSpeed: string;
  fundingSpeed: string;
  rates: string;
  bestFor: string[];
  loanPurposes: string[];
  affiliateUrl: string;
  isRealEstate?: boolean;
  specialFeatures: string[];
  matchScore?: number;
}

const FUNDING_PARTNERS: FundingPartner[] = [
  {
    id: "gokapital",
    name: "GoKapital",
    type: "Commercial Real Estate & Business Loans",
    description: "Premier commercial real estate lender with fast approvals. Specializes in laundromat property purchases, bridge loans, and equipment financing.",
    products: ["Commercial Real Estate Loans", "Bridge Loans", "Equipment Financing", "Term Loans", "SBA Express", "Merchant Cash Advance"],
    minLoan: 25000,
    maxLoan: 50000000,
    minCredit: 500,
    minTimeInBusiness: 0,
    approvalSpeed: "24-48 hours",
    fundingSpeed: "7-14 days (CRE) / 3-5 days (Business)",
    rates: "6% - 18% (varies by product)",
    bestFor: ["Real estate purchases", "Bridge financing", "Equipment", "Fast capital"],
    loanPurposes: ["real-estate", "business-acquisition", "equipment", "working-capital", "startup"],
    affiliateUrl: "gokapital-form",
    isRealEstate: true,
    specialFeatures: ["Up to 80% LTV", "All 50 states", "Investment properties", "DSCR loans available"]
  },
  {
    id: "rok-financial",
    name: "ROK Financial",
    type: "Fast Business Lending Marketplace",
    description: "LoanTech-powered platform with 75+ lenders. Processes 80% faster than traditional banks. Ideal for startups and established laundromats needing fast capital.",
    products: ["Term Loans", "Lines of Credit", "Equipment Financing", "SBA Loans", "Merchant Cash Advance", "Revenue-Based Financing"],
    minLoan: 5000,
    maxLoan: 5000000,
    minCredit: 550,
    minTimeInBusiness: 6,
    approvalSpeed: "4 hours (80% of apps)",
    fundingSpeed: "Same day - 48 hours",
    rates: "Starting at 5.99%",
    bestFor: ["Startups with 6+ months", "Fast capital needs", "Lower credit scores", "Equipment purchases"],
    loanPurposes: ["business-acquisition", "equipment", "working-capital", "startup"],
    affiliateUrl: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1",
    specialFeatures: ["75+ lender network", "LoanTech AI platform", "72% approval rate", "Same-day funding available"]
  },
  {
    id: "national-business-capital",
    name: "National Business Capital",
    type: "SBA & Business Financing Marketplace",
    description: "Access 75+ lenders through one application. Specialists in SBA 7(a) loans with the fastest SBA processing (45 days vs 90+ days typical).",
    products: ["SBA 7(a) Loans", "SBA Express", "Term Loans", "Equipment Financing", "Lines of Credit", "Revenue-Based Financing"],
    minLoan: 10000,
    maxLoan: 10000000,
    minCredit: 580,
    minTimeInBusiness: 6,
    approvalSpeed: "24-48 hours",
    fundingSpeed: "1-3 days (Term) / 45+ days (SBA)",
    rates: "Prime + 2.75% (SBA) / 6-18% (Term)",
    bestFor: ["SBA loans", "Business acquisitions", "Established operators", "Portfolio expansion"],
    loanPurposes: ["business-acquisition", "equipment", "working-capital", "real-estate"],
    affiliateUrl: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1",
    specialFeatures: ["75+ lender network", "90% approval rate", "Dedicated advisor", "Hybridge fast SBA"]
  },
  {
    id: "south-end-capital",
    name: "South End Capital",
    type: "Preferred SBA Lender (Stearns Bank)",
    description: "Division of $3.2B Stearns Bank. Preferred SBA lender with $0 guarantee fees on loans up to $1M through 2025. Story-based underwriting for complex situations.",
    products: ["SBA 7(a) Loans", "Conventional Loans", "Equipment Financing", "Fast Capital", "Business Lines of Credit"],
    minLoan: 1000,
    maxLoan: 15000000,
    minCredit: 600,
    minTimeInBusiness: 0,
    approvalSpeed: "Same day - 48 hours",
    fundingSpeed: "Same day (Fast) / 45-90 days (SBA)",
    rates: "Prime + 1.5% (SBA) / 8.25%+ (Conv)",
    bestFor: ["SBA loans under $1M", "Lower credit scores", "Complex situations", "Equipment purchases"],
    loanPurposes: ["business-acquisition", "equipment", "working-capital", "startup", "real-estate"],
    affiliateUrl: "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat",
    specialFeatures: ["$0 SBA fees up to $1M", "Story-based underwriting", "No prepayment penalty", "Same-day equipment funding"]
  },
  {
    id: "advance-funds-network",
    name: "Advance Funds Network",
    type: "Fast Business Capital",
    description: "Same-day funding specialist since 2007. Best for urgent working capital needs when speed matters more than cost. Revenue-based repayment.",
    products: ["Merchant Cash Advance", "Working Capital Loans", "Business Term Loans", "Equipment Financing", "Lines of Credit", "Accounts Receivable Financing"],
    minLoan: 5000,
    maxLoan: 2000000,
    minCredit: 0,
    minTimeInBusiness: 3,
    approvalSpeed: "Same day",
    fundingSpeed: "24-48 hours",
    rates: "Factor rate 1.1-1.5 (10-50% cost)",
    bestFor: ["Emergency capital", "Cash flow gaps", "Low credit situations", "Fast funding needs"],
    loanPurposes: ["working-capital", "equipment", "business-acquisition", "ar-financing"],
    affiliateUrl: "https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3",
    specialFeatures: ["No minimum credit", "Same-day funding", "Revenue-based repayment", "15+ years experience"]
  },
  {
    id: "david-allen-capital",
    name: "David Allen Capital",
    type: "Revenue-Based Funding Platform",
    description: "BankBreezy platform connects to 20+ funders with one application. Zero-interest early payoff options and competitive rates.",
    products: ["Revenue-Based Funding", "Equipment Financing", "Business Lines of Credit", "Select Funding", "Invoice Factoring"],
    minLoan: 10000,
    maxLoan: 2000000,
    minCredit: 500,
    minTimeInBusiness: 4,
    approvalSpeed: "24 hours",
    fundingSpeed: "24-48 hours",
    rates: "50% less than competitors (claimed)",
    bestFor: ["Revenue-based funding", "Multiple offers", "Early payoff savings", "Equipment financing"],
    loanPurposes: ["working-capital", "equipment", "business-acquisition", "ar-financing"],
    affiliateUrl: "https://davidallencapital.com/nicholaskremers",
    specialFeatures: ["20+ lender network", "Zero-interest early payoff", "80% approval rate", "$500 beat-any-offer guarantee"]
  },
  {
    id: "preferred-funding-group",
    name: "Preferred Funding Group",
    type: "Personal Credit-Based Financing",
    description: "Leverage strong personal credit for business funding. 0% intro rates on credit cards, no business revenue required. Perfect for startups.",
    products: ["Personal Term Loans", "0% Business Credit Cards", "Personal Credit Cards", "Unsecured Lines of Credit"],
    minLoan: 50000,
    maxLoan: 500000,
    minCredit: 700,
    minTimeInBusiness: 0,
    approvalSpeed: "60 seconds pre-approval",
    fundingSpeed: "7 days after docs",
    rates: "< 7% APR (personal loans) / 0% intro (cards)",
    bestFor: ["Startups", "High personal credit", "No business history", "0% financing"],
    loanPurposes: ["startup", "equipment", "working-capital"],
    affiliateUrl: "https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/",
    specialFeatures: ["No business revenue required", "0% intro APR cards", "95% approval rate", "Startups welcome"]
  }
];

const SEO_KEYWORDS = [
  "laundromat financing",
  "laundromat loan",
  "laundromat business loan",
  "SBA loan for laundromat",
  "SBA 7a laundromat",
  "commercial real estate loan laundromat",
  "laundromat equipment financing",
  "coin laundry financing",
  "laundromat acquisition loan",
  "buy a laundromat loan",
  "laundromat startup loan",
  "small business loan laundromat",
  "term loan laundromat",
  "working capital laundromat",
  "laundromat business acquisition financing",
  "commercial washer dryer financing",
  "laundromat equipment loan",
  "self service laundry financing",
  "washateria financing",
  "laundromat bridge loan",
  "merchant cash advance laundromat",
  "revenue based financing laundromat",
  "laundromat line of credit",
  "accounts receivable financing laundromat",
  "personal credit business loan",
  "startup laundromat financing",
  "laundromat refinance",
  "DSCR loan laundromat",
  "laundromat investor loan",
  "coin op laundry loan"
];

const FAQ_DATA = [
  {
    question: "What is the best loan for buying a laundromat?",
    answer: "The best loan for buying a laundromat is typically an SBA 7(a) loan, which offers the lowest interest rates (Prime + 2.75%) and longest terms (up to 25 years for real estate). For faster funding, conventional term loans or revenue-based financing can close in 1-14 days vs. 45-90 days for SBA loans."
  },
  {
    question: "Can I get a laundromat loan with bad credit?",
    answer: "Yes, you can get laundromat financing with credit scores as low as 500-550. Options include revenue-based financing, merchant cash advances, and some equipment financing programs. Partners like Advance Funds Network and David Allen Capital specialize in lower credit situations with same-day approvals."
  },
  {
    question: "How much down payment do I need to buy a laundromat?",
    answer: "Down payment requirements vary: SBA loans typically require 10-20% down, conventional commercial real estate loans require 20-30%, and some equipment financing requires 0-10% down. Personal credit-based financing through Preferred Funding Group requires no down payment for startups with 700+ credit scores."
  },
  {
    question: "What is laundromat equipment financing?",
    answer: "Laundromat equipment financing allows you to purchase commercial washers, dryers, and related equipment with terms of 2-7 years. Many lenders offer same-day approval with rates starting at 5.99%. Equipment serves as collateral, making it easier to qualify than unsecured loans."
  },
  {
    question: "How long does it take to get a laundromat business loan?",
    answer: "Funding timelines vary by loan type: Same-day to 48 hours for merchant cash advances and working capital loans, 3-14 days for term loans and equipment financing, and 45-90 days for SBA loans. Our partners include fast-funding specialists for urgent capital needs."
  },
  {
    question: "What is an SBA 7(a) loan for laundromat business?",
    answer: "An SBA 7(a) loan is a government-backed small business loan ideal for laundromat purchases, with up to $5 million available, 10-25 year terms, and competitive rates (Prime + 2.75%). Through 2025, loans up to $1M have $0 guarantee fees through preferred lenders like South End Capital."
  },
  {
    question: "Can I finance a laundromat with no experience?",
    answer: "Yes, several financing options are available for first-time laundromat buyers. SBA loans consider industry inexperience with strong business plans, and personal credit-based financing through Preferred Funding Group requires no business experience. Equipment financing is also available for startups."
  },
  {
    question: "What is accounts receivable financing for laundromats?",
    answer: "Accounts receivable (AR) financing allows laundromats with commercial accounts (hotels, gyms, healthcare) to borrow against unpaid invoices. This provides immediate cash flow without taking on traditional debt. Partners like David Allen Capital and Advance Funds Network offer invoice factoring solutions."
  },
  {
    question: "How do I qualify for commercial real estate loan for a laundromat?",
    answer: "Commercial real estate loans for laundromats typically require: 620+ credit score, 20-30% down payment, property as collateral, and demonstration of cash flow to cover debt payments (DSCR of 1.25+). GoKapital specializes in laundromat property financing with up to 80% LTV."
  },
  {
    question: "What is revenue-based financing for laundromats?",
    answer: "Revenue-based financing (RBF) provides capital based on your laundromat's monthly revenue rather than credit score. Repayments are a percentage of daily/weekly revenue, making it flexible for seasonal fluctuations. Funding is fast (24-48 hours) but costs more than traditional loans."
  }
];

const FINANCING_TYPES = [
  {
    id: "sba-loans",
    title: "SBA Loans for Laundromats",
    icon: Landmark,
    description: "Government-backed loans with the lowest rates and longest terms. SBA 7(a) loans offer up to $5M with 10-25 year terms.",
    features: ["Prime + 2.75% rates", "Up to 25-year terms", "$0 fees up to $1M (2025)", "Low down payment"],
    bestFor: "Established operators buying or expanding laundromats"
  },
  {
    id: "equipment-financing",
    title: "Equipment Financing",
    icon: Wrench,
    description: "Finance commercial washers, dryers, and laundromat equipment with the machines as collateral. Same-day approvals available.",
    features: ["2-7 year terms", "Equipment as collateral", "Same-day approval", "Preserve working capital"],
    bestFor: "Equipment upgrades, new machine installations"
  },
  {
    id: "commercial-real-estate",
    title: "Commercial Real Estate Loans",
    icon: Building2,
    description: "Purchase or refinance laundromat properties with competitive rates. DSCR and bridge loan options available.",
    features: ["Up to $50M+", "Up to 80% LTV", "DSCR loans available", "Bridge financing"],
    bestFor: "Property purchases, refinancing, investor portfolios"
  },
  {
    id: "term-loans",
    title: "Business Term Loans",
    icon: FileText,
    description: "Fixed-rate loans with predictable monthly payments. Fast funding for acquisitions and growth capital.",
    features: ["$10K - $10M", "1-5 year terms", "Fixed payments", "Fast 1-14 day funding"],
    bestFor: "Business acquisitions, growth capital, major purchases"
  },
  {
    id: "working-capital",
    title: "Working Capital & Lines of Credit",
    icon: PiggyBank,
    description: "Flexible funding for operational expenses, payroll, inventory, and cash flow management.",
    features: ["Revolving credit", "Draw as needed", "Same-day funding", "Revenue-based options"],
    bestFor: "Cash flow gaps, seasonal needs, operational expenses"
  },
  {
    id: "startup-financing",
    title: "Startup Laundromat Financing",
    icon: Target,
    description: "Funding options for first-time laundromat buyers. Personal credit-based and SBA options for new operators.",
    features: ["No business history required", "0% intro rates", "Personal credit based", "Startup-friendly"],
    bestFor: "First-time buyers, career changers, new investors"
  },
  {
    id: "ar-financing",
    title: "Accounts Receivable Financing",
    icon: Receipt,
    description: "Turn unpaid invoices from commercial accounts (hotels, gyms) into immediate cash flow.",
    features: ["Invoice factoring", "Fast cash access", "No new debt", "Flexible terms"],
    bestFor: "Laundromats with commercial/route accounts"
  },
  {
    id: "fast-capital",
    title: "Fast Capital & MCAs",
    icon: Zap,
    description: "Same-day to 48-hour funding for urgent needs. Revenue-based repayment tied to daily sales.",
    features: ["Same-day funding", "No minimum credit", "Revenue-based", "Emergency capital"],
    bestFor: "Emergency repairs, urgent opportunities, cash flow crises"
  }
];

function calculateMatchScore(partner: FundingPartner, inputs: any): number {
  let score = 50;
  
  const amount = parseFloat(inputs.loanAmount) || 0;
  if (amount >= partner.minLoan && amount <= partner.maxLoan) score += 15;
  else if (amount < partner.minLoan) score -= 20;
  else if (amount > partner.maxLoan) score -= 30;
  
  if (partner.loanPurposes.includes(inputs.loanPurpose)) score += 20;
  
  const creditMap: Record<string, number> = { excellent: 750, good: 690, fair: 650, poor: 580, very_poor: 500 };
  const userCredit = creditMap[inputs.creditScore] || 600;
  if (userCredit >= partner.minCredit) score += 10;
  else score -= 15;
  
  const timeMap: Record<string, number> = { startup: 0, "1year": 6, "2years": 18, "3plus": 36 };
  const userTime = timeMap[inputs.timeInBusiness] || 0;
  if (userTime >= partner.minTimeInBusiness) score += 5;
  else score -= 10;
  
  if (inputs.loanPurpose === "real-estate" && partner.isRealEstate) score += 15;
  if (inputs.urgency === "asap" && partner.fundingSpeed.includes("Same day")) score += 10;
  if (inputs.urgency === "asap" && partner.fundingSpeed.includes("24")) score += 5;
  if (inputs.loanPurpose === "ar-financing" && partner.loanPurposes.includes("ar-financing")) score += 15;
  
  return Math.max(0, Math.min(100, score));
}

function getGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 85) return { grade: "A", color: "bg-green-500", label: "Excellent Match" };
  if (score >= 70) return { grade: "B", color: "bg-lime-500", label: "Good Match" };
  if (score >= 55) return { grade: "C", color: "bg-amber-500", label: "Fair Match" };
  return { grade: "NW", color: "bg-yellow-600", label: "Needs Work" };
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "WashBizHub Laundromat Funding Matcher",
  "description": "Find the best laundromat financing from 7 vetted lenders. Compare SBA loans, equipment financing, commercial real estate loans, term loans, and startup funding options.",
  "url": "https://washbizhub.com/funding-matcher",
  "areaServed": "United States",
  "serviceType": [
    "Small Business Loans",
    "SBA Loans",
    "Equipment Financing",
    "Commercial Real Estate Loans",
    "Working Capital Loans",
    "Business Acquisition Financing"
  ],
  "provider": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "1000",
    "highPrice": "50000000",
    "priceCurrency": "USD",
    "offerCount": "7"
  }
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_DATA.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

export default function FundingMatcher() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showGoKapitalForm, setShowGoKapitalForm] = useState(false);
  const [matchedPartners, setMatchedPartners] = useState<FundingPartner[]>([]);
  
  const [inputs, setInputs] = useState({
    loanAmount: "",
    loanPurpose: "",
    creditScore: "",
    timeInBusiness: "",
    urgency: "",
    annualRevenue: "",
    hasCollateral: "",
    email: "",
    name: "",
    phone: "",
  });

  const [goKapitalForm, setGoKapitalForm] = useState({
    propertyAddress: "",
    propertyType: "",
    transactionType: "",
    purchasePrice: "",
    downPayment: "",
    estimatedValue: "",
    amountOwed: "",
    closingEntity: "",
    liquidAssets: "",
    propertiesOwned: "",
    creditScore: "",
    generatingIncome: "",
    rateTermExpectations: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputs.email || !inputs.name) {
      toast({ title: "Please enter your name and email to see your matches", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inputs.email,
          name: inputs.name,
          phone: inputs.phone,
          source: "funding-matcher",
          data: {
            loanAmount: inputs.loanAmount,
            loanPurpose: inputs.loanPurpose,
            creditScore: inputs.creditScore,
            timeInBusiness: inputs.timeInBusiness,
            urgency: inputs.urgency,
            annualRevenue: inputs.annualRevenue,
          }
        }),
      });

      const scored = FUNDING_PARTNERS.map(partner => ({
        ...partner,
        matchScore: calculateMatchScore(partner, inputs)
      })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      setMatchedPartners(scored);
      setShowResults(true);
      
      toast({ title: "Matches found!", description: `We found ${scored.filter(p => (p.matchScore || 0) >= 55).length} great funding options for you.` });
    } catch (error) {
      console.error("Error submitting:", error);
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoKapitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/gokapital-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...goKapitalForm,
          affiliateId: "nicholas kremers",
          source: "funding-matcher-cre"
        }),
      });

      toast({ 
        title: "Application Submitted!", 
        description: "GoKapital will contact you within 24-48 hours." 
      });
      setShowGoKapitalForm(false);
    } catch (error) {
      toast({ title: "Error submitting application", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerClick = (partner: FundingPartner) => {
    if (partner.affiliateUrl === "gokapital-form") {
      setShowGoKapitalForm(true);
      setGoKapitalForm(prev => ({
        ...prev,
        contactName: inputs.name,
        contactEmail: inputs.email,
        contactPhone: inputs.phone,
      }));
    } else {
      window.open(partner.affiliateUrl, "_blank");
    }
  };

  const renderQuestionnaire = () => (
    <form onSubmit={handleMatch} className="space-y-6">
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-2">Step 1 of 3</Badge>
            <h3 className="text-xl font-bold text-white">Funding Requirements</h3>
          </div>

          <div>
            <Label className="text-white/90 font-medium">How much funding do you need?</Label>
            <Input
              type="number"
              placeholder="e.g., 250000"
              value={inputs.loanAmount}
              onChange={(e) => setInputs({ ...inputs, loanAmount: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder-white/40 mt-2"
              required
              data-testid="input-loan-amount"
            />
          </div>

          <div>
            <Label className="text-white/90 font-medium">Primary purpose of funding?</Label>
            <Select value={inputs.loanPurpose} onValueChange={(val) => setInputs({ ...inputs, loanPurpose: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2" data-testid="select-loan-purpose">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business-acquisition">Buy Existing Laundromat</SelectItem>
                <SelectItem value="real-estate">Purchase Property / Real Estate</SelectItem>
                <SelectItem value="equipment">Equipment Purchase / Upgrade</SelectItem>
                <SelectItem value="working-capital">Working Capital / Operations</SelectItem>
                <SelectItem value="startup">New Laundromat Startup</SelectItem>
                <SelectItem value="ar-financing">Accounts Receivable / Invoice Financing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white/90 font-medium">How urgent is your funding need?</Label>
            <Select value={inputs.urgency} onValueChange={(val) => setInputs({ ...inputs, urgency: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2" data-testid="select-urgency">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">ASAP (Within 1-2 weeks)</SelectItem>
                <SelectItem value="30days">Within 30 days</SelectItem>
                <SelectItem value="60days">Within 60 days</SelectItem>
                <SelectItem value="exploring">Just exploring options</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="button" 
            onClick={() => setStep(2)}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            disabled={!inputs.loanAmount || !inputs.loanPurpose}
            data-testid="button-next-step-1"
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-2">Step 2 of 3</Badge>
            <h3 className="text-xl font-bold text-white">Your Profile</h3>
          </div>

          <div>
            <Label className="text-white/90 font-medium">Personal Credit Score (Estimate)</Label>
            <Select value={inputs.creditScore} onValueChange={(val) => setInputs({ ...inputs, creditScore: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2" data-testid="select-credit-score">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent (720+)</SelectItem>
                <SelectItem value="good">Good (680-719)</SelectItem>
                <SelectItem value="fair">Fair (640-679)</SelectItem>
                <SelectItem value="poor">Below 640</SelectItem>
                <SelectItem value="very_poor">Below 550 (Challenged)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white/90 font-medium">Time in Business / Industry Experience</Label>
            <Select value={inputs.timeInBusiness} onValueChange={(val) => setInputs({ ...inputs, timeInBusiness: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2" data-testid="select-time-in-business">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">New / First-time Buyer</SelectItem>
                <SelectItem value="1year">Less than 1 year</SelectItem>
                <SelectItem value="2years">1-2 years</SelectItem>
                <SelectItem value="3plus">3+ years experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white/90 font-medium">Annual Revenue (if existing business)</Label>
            <Select value={inputs.annualRevenue} onValueChange={(val) => setInputs({ ...inputs, annualRevenue: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2" data-testid="select-annual-revenue">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre-revenue">Pre-Revenue / Startup</SelectItem>
                <SelectItem value="under100k">Under $100,000</SelectItem>
                <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                <SelectItem value="over1m">Over $1,000,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 border-white/30 text-white hover:bg-white/10"
              data-testid="button-back-step-2"
            >
              Back
            </Button>
            <Button 
              type="button" 
              onClick={() => setStep(3)}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
              disabled={!inputs.creditScore || !inputs.timeInBusiness}
              data-testid="button-next-step-2"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-2">Step 3 of 3</Badge>
            <h3 className="text-xl font-bold text-white">Get Your Matches</h3>
            <p className="text-white/60 text-sm mt-1">Enter your info to see personalized funding recommendations</p>
          </div>

          <div>
            <Label className="text-white/90 font-medium">Full Name *</Label>
            <Input
              type="text"
              placeholder="John Smith"
              value={inputs.name}
              onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder-white/40 mt-2"
              required
              data-testid="input-name"
            />
          </div>

          <div>
            <Label className="text-white/90 font-medium">Email Address *</Label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder-white/40 mt-2"
              required
              data-testid="input-email"
            />
          </div>

          <div>
            <Label className="text-white/90 font-medium">Phone Number</Label>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={inputs.phone}
              onChange={(e) => setInputs({ ...inputs, phone: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder-white/40 mt-2"
              data-testid="input-phone"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1 border-white/30 text-white hover:bg-white/10"
              data-testid="button-back-step-3"
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
              disabled={isSubmitting}
              data-testid="button-find-lenders"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Target className="h-4 w-4 mr-2" />}
              Find My Matches
            </Button>
          </div>

          <p className="text-xs text-white/50 text-center">
            By submitting, you agree to receive communications about financing options. Your information is secure and never sold.
          </p>
        </div>
      )}
    </form>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Matches Found
        </Badge>
        <h2 className="text-2xl font-bold text-white">Your Personalized Funding Matches</h2>
        <p className="text-white/60 mt-2">
          ${parseFloat(inputs.loanAmount).toLocaleString()} for {inputs.loanPurpose.replace(/-/g, ' ')}
        </p>
      </div>

      <div className="space-y-4">
        {matchedPartners.map((partner, idx) => {
          const grade = getGrade(partner.matchScore || 0);
          return (
            <Card 
              key={partner.id} 
              className={`bg-white/5 border-white/10 overflow-hidden ${idx === 0 ? 'ring-2 ring-accent' : ''}`}
              data-testid={`card-partner-${partner.id}`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:w-20 flex-shrink-0">
                    <div className={`w-12 h-12 ${grade.color} rounded-xl flex items-center justify-center font-black text-white text-xl`}>
                      {grade.grade}
                    </div>
                    <div className="text-white/60 text-xs text-center hidden sm:block">
                      {partner.matchScore}% Match
                    </div>
                    <Badge className="sm:hidden bg-white/10 text-white/80 text-xs">
                      {partner.matchScore}%
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{partner.name}</h3>
                      {idx === 0 && <Badge className="bg-accent/20 text-accent text-xs">Top Match</Badge>}
                    </div>
                    <p className="text-white/50 text-sm mb-2">{partner.type}</p>
                    <p className="text-white/70 text-sm mb-3">{partner.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-white/50">Amount</div>
                        <div className="text-white font-medium">${(partner.minLoan/1000).toFixed(0)}K - ${partner.maxLoan >= 1000000 ? (partner.maxLoan/1000000).toFixed(0) + 'M' : (partner.maxLoan/1000).toFixed(0) + 'K'}</div>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-white/50">Min Credit</div>
                        <div className="text-white font-medium">{partner.minCredit || 'None'}</div>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-white/50">Approval</div>
                        <div className="text-white font-medium">{partner.approvalSpeed}</div>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <div className="text-white/50">Funding</div>
                        <div className="text-white font-medium">{partner.fundingSpeed.split('/')[0].trim()}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {partner.products.slice(0, 4).map((product, i) => (
                        <Badge key={i} variant="outline" className="text-white/60 border-white/20 text-xs">
                          {product}
                        </Badge>
                      ))}
                      {partner.products.length > 4 && (
                        <Badge variant="outline" className="text-white/60 border-white/20 text-xs">
                          +{partner.products.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <Button 
                      onClick={() => handlePartnerClick(partner)}
                      className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                      data-testid={`button-apply-${partner.id}`}
                    >
                      {partner.affiliateUrl === "gokapital-form" ? (
                        <>Start Application <ArrowRight className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>Apply Now <ExternalLink className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30">
        <CardContent className="p-6 text-center">
          <Users className="h-10 w-10 text-accent mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-2">Need Expert Guidance?</h3>
          <p className="text-white/70 text-sm mb-4">
            Schedule a consultation with Larry Larsen, 40-year industry veteran, to discuss your financing strategy.
          </p>
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
            Book Consultation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Button 
        variant="outline" 
        onClick={() => { setShowResults(false); setStep(1); }}
        className="w-full border-white/30 text-white hover:bg-white/10"
      >
        Start Over
      </Button>
    </div>
  );

  const renderGoKapitalForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2">
          <Building2 className="h-3 w-3 mr-1" /> Commercial Real Estate
        </Badge>
        <h2 className="text-2xl font-bold text-white">GoKapital Application</h2>
        <p className="text-white/60 mt-2">Complete this form for commercial real estate financing</p>
      </div>

      <form onSubmit={handleGoKapitalSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label className="text-white/90">1. Property Address *</Label>
            <Input
              placeholder="123 Main St, City, State ZIP"
              value={goKapitalForm.propertyAddress}
              onChange={(e) => setGoKapitalForm({ ...goKapitalForm, propertyAddress: e.target.value })}
              className="bg-white/10 border-white/20 text-white mt-1"
              required
              data-testid="input-gk-address"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/90">2. Property Type *</Label>
              <Select value={goKapitalForm.propertyType} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, propertyType: val })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail/Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="mixed-use">Mixed Use</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/90">3. Transaction Type *</Label>
              <Select value={goKapitalForm.transactionType} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, transactionType: val })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="refinance">Refinance</SelectItem>
                  <SelectItem value="cash-out">Cash-Out Refinance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {goKapitalForm.transactionType === "purchase" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/90">4a. Purchase Price *</Label>
                <Input
                  type="text"
                  placeholder="$500,000"
                  value={goKapitalForm.purchasePrice}
                  onChange={(e) => setGoKapitalForm({ ...goKapitalForm, purchasePrice: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/90">4b. Down Payment</Label>
                <Input
                  type="text"
                  placeholder="$100,000"
                  value={goKapitalForm.downPayment}
                  onChange={(e) => setGoKapitalForm({ ...goKapitalForm, downPayment: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>
            </div>
          )}

          {(goKapitalForm.transactionType === "refinance" || goKapitalForm.transactionType === "cash-out") && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/90">4a. Estimated Value *</Label>
                <Input
                  type="text"
                  placeholder="$600,000"
                  value={goKapitalForm.estimatedValue}
                  onChange={(e) => setGoKapitalForm({ ...goKapitalForm, estimatedValue: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/90">4b. Amount Owed</Label>
                <Input
                  type="text"
                  placeholder="$350,000"
                  value={goKapitalForm.amountOwed}
                  onChange={(e) => setGoKapitalForm({ ...goKapitalForm, amountOwed: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/90">5. Closing Entity</Label>
              <Select value={goKapitalForm.closingEntity} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, closingEntity: val })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/90">6. Liquid Assets</Label>
              <Select value={goKapitalForm.liquidAssets} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, liquidAssets: val })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under50k">Under $50,000</SelectItem>
                  <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                  <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                  <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                  <SelectItem value="over500k">Over $500,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/90">7. Properties Owned (36 mo)</Label>
              <Select value={goKapitalForm.propertiesOwned} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, propertiesOwned: val })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (First-time)</SelectItem>
                  <SelectItem value="1-2">1-2</SelectItem>
                  <SelectItem value="3-5">3-5</SelectItem>
                  <SelectItem value="6+">6+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/90">8. Credit Score</Label>
              <Select value={goKapitalForm.creditScore} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, creditScore: val })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="750+">750+</SelectItem>
                  <SelectItem value="700-749">700-749</SelectItem>
                  <SelectItem value="650-699">650-699</SelectItem>
                  <SelectItem value="600-649">600-649</SelectItem>
                  <SelectItem value="below600">Below 600</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white/90">9. Is property currently generating income?</Label>
            <Select value={goKapitalForm.generatingIncome} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, generatingIncome: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes-stable">Yes - Stable Income</SelectItem>
                <SelectItem value="yes-growing">Yes - Growing</SelectItem>
                <SelectItem value="partial">Partially</SelectItem>
                <SelectItem value="no">No - Vacant/New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white/90">10. Rate & Term Expectations</Label>
            <Textarea
              placeholder="Describe your ideal loan terms, timeline, and any special considerations..."
              value={goKapitalForm.rateTermExpectations}
              onChange={(e) => setGoKapitalForm({ ...goKapitalForm, rateTermExpectations: e.target.value })}
              className="bg-white/10 border-white/20 text-white mt-1 min-h-[80px]"
              data-testid="input-gk-expectations"
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 mt-6">
          <h4 className="text-white font-semibold mb-3">Contact Information</h4>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-white/90">Name *</Label>
              <Input
                type="text"
                value={goKapitalForm.contactName}
                onChange={(e) => setGoKapitalForm({ ...goKapitalForm, contactName: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-1"
                required
                data-testid="input-gk-name"
              />
            </div>
            <div>
              <Label className="text-white/90">Email *</Label>
              <Input
                type="email"
                value={goKapitalForm.contactEmail}
                onChange={(e) => setGoKapitalForm({ ...goKapitalForm, contactEmail: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-1"
                required
                data-testid="input-gk-email"
              />
            </div>
            <div>
              <Label className="text-white/90">Phone *</Label>
              <Input
                type="tel"
                value={goKapitalForm.contactPhone}
                onChange={(e) => setGoKapitalForm({ ...goKapitalForm, contactPhone: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-1"
                required
                data-testid="input-gk-phone"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowGoKapitalForm(false)}
            className="flex-1 border-white/30 text-white hover:bg-white/10"
          >
            Back to Results
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            disabled={isSubmitting}
            data-testid="button-submit-gokapital"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Building2 className="h-4 w-4 mr-2" />}
            Submit to GoKapital
          </Button>
        </div>

        <p className="text-xs text-white/50 text-center">
          Application sent to deals@gokapital.com • Affiliate: Nicholas Kremers
        </p>
      </form>
    </div>
  );

  return (
    <AuthGuard title="Sign In to Find Funding Options" description="Sign in to access this feature.">
      <SEO
        title="Laundromat Financing & Business Loans | Find SBA, Equipment & Real Estate Funding"
        description="Compare 7 vetted lenders for laundromat financing. SBA 7(a) loans, equipment financing, commercial real estate loans, term loans, startup funding, and working capital. Get matched in 60 seconds."
        keywords={SEO_KEYWORDS}
        url="/funding-matcher"
        ogType="website"
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={fundingHeroImg} 
              alt="Find Laundromat Financing - SBA Loans, Equipment Financing, Commercial Real Estate"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900" />
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">
              7 Vetted Lending Partners
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4" data-testid="text-funding-title">
              Laundromat Financing & Business Loans
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto" data-testid="text-funding-subtitle">
              Find the perfect loan for your laundromat - SBA loans, equipment financing, commercial real estate, term loans, and startup funding
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-sm">Vetted Partners</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">60-Second Match</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <DollarSign className="h-5 w-5 text-accent" />
                <span className="text-sm">$1K - $50M+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 -mt-8">
          <Card className="bg-gray-800/80 backdrop-blur border-white/10 shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              {showGoKapitalForm ? renderGoKapitalForm() : showResults ? renderResults() : renderQuestionnaire()}
            </CardContent>
          </Card>

          {!showResults && !showGoKapitalForm && (
            <>
              <section className="mt-16" aria-labelledby="financing-types-heading">
                <h2 id="financing-types-heading" className="text-2xl font-bold text-white text-center mb-8">
                  Laundromat Financing Options
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {FINANCING_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Card key={type.id} className="bg-white/5 border-white/10 hover-elevate">
                        <CardContent className="p-4">
                          <Icon className="h-8 w-8 text-accent mb-3" />
                          <h3 className="text-white font-bold text-sm mb-2">{type.title}</h3>
                          <p className="text-white/60 text-xs mb-3">{type.description}</p>
                          <ul className="space-y-1">
                            {type.features.slice(0, 3).map((feature, i) => (
                              <li key={i} className="flex items-center gap-1 text-xs text-white/50">
                                <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section className="mt-12">
                <div className="grid sm:grid-cols-3 gap-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 text-center">
                      <Building2 className="h-10 w-10 text-accent mx-auto mb-3" />
                      <h3 className="text-white font-bold mb-2">Commercial Real Estate Loans</h3>
                      <p className="text-white/60 text-sm">Purchase or refinance laundromat properties up to $50M with DSCR and bridge options</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 text-center">
                      <Award className="h-10 w-10 text-accent mx-auto mb-3" />
                      <h3 className="text-white font-bold mb-2">SBA 7(a) Loans</h3>
                      <p className="text-white/60 text-sm">Preferred SBA lenders with $0 guarantee fees up to $1M through 2025</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 text-center">
                      <Zap className="h-10 w-10 text-accent mx-auto mb-3" />
                      <h3 className="text-white font-bold mb-2">Fast Capital & Equipment</h3>
                      <p className="text-white/60 text-sm">Same-day approvals and 24-48 hour funding for equipment and working capital</p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-white font-bold mb-4 text-center">Our 7 Lending Partners</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {FUNDING_PARTNERS.map((partner) => (
                  <div key={partner.id} className="text-center p-3 rounded-lg bg-white/5 hover-elevate">
                    <div className="text-white font-semibold text-sm">{partner.name}</div>
                    <div className="text-white/50 text-xs mt-1">{partner.type.split(' ').slice(0, 2).join(' ')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12" aria-labelledby="faq-heading">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 justify-center mb-6">
                <HelpCircle className="h-6 w-6 text-accent" />
                <h2 id="faq-heading" className="text-xl font-bold text-white">
                  Frequently Asked Questions About Laundromat Financing
                </h2>
              </div>
              
              <Accordion type="single" collapsible className="space-y-2">
                {FAQ_DATA.map((faq, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`faq-${idx}`}
                    className="border border-white/10 rounded-lg overflow-hidden bg-white/5"
                  >
                    <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 text-left text-sm font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-white/70 text-sm">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12" aria-labelledby="seo-content-heading">
          <div className="prose prose-invert prose-sm max-w-none">
            <h2 id="seo-content-heading" className="text-xl font-bold text-white mb-4">
              Complete Guide to Laundromat Business Financing
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 text-white/70 text-sm">
              <div>
                <h3 className="text-white font-semibold text-base mb-2">SBA Loans for Laundromats</h3>
                <p className="mb-4">
                  SBA 7(a) loans are the gold standard for laundromat financing, offering the lowest interest rates 
                  (Prime + 2.75%) and longest repayment terms (up to 25 years for real estate). Through 2025, 
                  loans up to $1 million have $0 SBA guarantee fees through preferred lenders. Our partners include 
                  South End Capital (a division of $3.2B Stearns Bank) and National Business Capital with 75+ lender access.
                </p>
                
                <h3 className="text-white font-semibold text-base mb-2">Equipment Financing</h3>
                <p className="mb-4">
                  Commercial washer and dryer financing allows you to upgrade your laundromat without depleting 
                  working capital. Equipment serves as collateral, making approval easier. Terms range from 2-7 years 
                  with rates starting at 5.99%. Same-day approval is available through multiple partners.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold text-base mb-2">Commercial Real Estate Loans</h3>
                <p className="mb-4">
                  Purchase or refinance laundromat properties with commercial real estate financing. GoKapital 
                  specializes in laundromat property loans with up to 80% LTV, DSCR options, and bridge financing 
                  for faster closes. Loan amounts range from $25,000 to $50 million+.
                </p>
                
                <h3 className="text-white font-semibold text-base mb-2">Startup & Personal Credit Financing</h3>
                <p className="mb-4">
                  First-time laundromat buyers can access financing through personal credit-based options. 
                  Preferred Funding Group offers 0% intro APR credit cards and personal term loans under 7% APR 
                  for borrowers with 700+ credit scores - no business revenue or experience required.
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-white font-semibold text-base mb-2">Why Use WashBizHub Funding Matcher?</h3>
              <ul className="text-white/70 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">7 Vetted Partners:</strong> We've pre-screened lenders who specialize in laundromat and small business financing</span>
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Intelligent Matching:</strong> Our algorithm matches you with the best lenders based on your specific situation</span>
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">All Credit Levels:</strong> Options from 500+ credit scores to excellent credit with 0% intro rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Fast to Full SBA:</strong> Same-day funding to 45+ day SBA loans - we match your timeline</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
