import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { 
  DollarSign, CheckCircle2, Building2, Zap, Clock, Shield, 
  ArrowRight, Star, TrendingUp, ExternalLink, Phone, Mail,
  CreditCard, Loader2, Users, Award, Target
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
    products: ["Commercial Real Estate", "Bridge Loans", "Equipment Financing", "Term Loans", "SBA Express", "Merchant Cash Advance"],
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
    products: ["Merchant Cash Advance", "Working Capital Loans", "Business Term Loans", "Equipment Financing", "Lines of Credit"],
    minLoan: 5000,
    maxLoan: 2000000,
    minCredit: 0,
    minTimeInBusiness: 3,
    approvalSpeed: "Same day",
    fundingSpeed: "24-48 hours",
    rates: "Factor rate 1.1-1.5 (10-50% cost)",
    bestFor: ["Emergency capital", "Cash flow gaps", "Low credit situations", "Fast funding needs"],
    loanPurposes: ["working-capital", "equipment", "business-acquisition"],
    affiliateUrl: "https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3",
    specialFeatures: ["No minimum credit", "Same-day funding", "Revenue-based repayment", "15+ years experience"]
  },
  {
    id: "david-allen-capital",
    name: "David Allen Capital",
    type: "Revenue-Based Funding Platform",
    description: "BankBreezy platform connects to 20+ funders with one application. Zero-interest early payoff options and competitive rates.",
    products: ["Revenue-Based Funding", "Equipment Financing", "Business Lines of Credit", "Select Funding"],
    minLoan: 10000,
    maxLoan: 2000000,
    minCredit: 500,
    minTimeInBusiness: 4,
    approvalSpeed: "24 hours",
    fundingSpeed: "24-48 hours",
    rates: "50% less than competitors (claimed)",
    bestFor: ["Revenue-based funding", "Multiple offers", "Early payoff savings", "Equipment financing"],
    loanPurposes: ["working-capital", "equipment", "business-acquisition"],
    affiliateUrl: "https://davidallencapital.com/nicholaskremers",
    specialFeatures: ["20+ lender network", "Zero-interest early payoff", "80% approval rate", "$500 beat-any-offer guarantee"]
  },
  {
    id: "preferred-funding-group",
    name: "Preferred Funding Group",
    type: "Personal Credit-Based Financing",
    description: "Leverage strong personal credit for business funding. 0% intro rates on credit cards, no business revenue required. Perfect for startups.",
    products: ["Personal Term Loans", "0% Business Credit Cards", "Personal Credit Cards", "Unsecured Lines"],
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

function calculateMatchScore(partner: FundingPartner, inputs: any): number {
  let score = 50;
  
  const amount = parseFloat(inputs.loanAmount) || 0;
  if (amount >= partner.minLoan && amount <= partner.maxLoan) score += 15;
  else if (amount < partner.minLoan) score -= 20;
  else if (amount > partner.maxLoan) score -= 30;
  
  if (partner.loanPurposes.includes(inputs.loanPurpose)) score += 20;
  
  const creditMap: Record<string, number> = { excellent: 750, good: 690, fair: 650, poor: 580 };
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
  
  return Math.max(0, Math.min(100, score));
}

function getGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 85) return { grade: "A", color: "bg-green-500", label: "Excellent Match" };
  if (score >= 70) return { grade: "B", color: "bg-lime-500", label: "Good Match" };
  if (score >= 55) return { grade: "C", color: "bg-amber-500", label: "Fair Match" };
  return { grade: "NW", color: "bg-yellow-600", label: "Needs Work" };
}

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
              placeholder="you@example.com"
              value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder-white/40 mt-2"
              required
              data-testid="input-email"
            />
          </div>

          <div>
            <Label className="text-white/90 font-medium">Phone (Optional)</Label>
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
              disabled={isSubmitting || !inputs.email || !inputs.name}
              data-testid="button-find-lenders"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Find My Matches
            </Button>
          </div>

          <p className="text-xs text-white/50 text-center">
            By submitting, you agree to receive funding information from WashBizHub and our partners.
          </p>
        </div>
      )}
    </form>
  );

  const renderResults = () => {
    const topMatches = matchedPartners.filter(p => (p.matchScore || 0) >= 55);
    const fallbacks = matchedPartners.filter(p => (p.matchScore || 0) < 55 && (p.matchScore || 0) >= 30);

    return (
      <div className="space-y-8">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Your Personalized Funding Matches</h2>
          <p className="text-white/70">Based on ${parseInt(inputs.loanAmount).toLocaleString()} for {inputs.loanPurpose.replace("-", " ")}</p>
        </div>

        {topMatches.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" /> Top Recommendations
            </h3>
            {topMatches.map((partner, idx) => {
              const { grade, color, label } = getGrade(partner.matchScore || 0);
              const isPrimary = idx === 0;
              
              return (
                <Card 
                  key={partner.id} 
                  className={`${isPrimary ? 'border-accent bg-accent/10' : 'bg-white/5 border-white/10'}`}
                  data-testid={`card-partner-${partner.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {isPrimary && <Badge className="bg-accent text-accent-foreground">Best Match</Badge>}
                          <Badge className={`${color} text-white`}>{grade} - {label}</Badge>
                        </div>
                        <CardTitle className="text-white text-xl">{partner.name}</CardTitle>
                        <CardDescription className="text-white/60">{partner.type}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">{partner.matchScore}%</div>
                        <div className="text-xs text-white/50">Match Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/80 text-sm">{partner.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/50 text-xs">Loan Range</div>
                        <div className="text-white font-semibold">
                          ${(partner.minLoan / 1000).toFixed(0)}K - ${partner.maxLoan >= 1000000 ? (partner.maxLoan / 1000000).toFixed(0) + 'M' : (partner.maxLoan / 1000).toFixed(0) + 'K'}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/50 text-xs">Rates</div>
                        <div className="text-white font-semibold">{partner.rates.split('(')[0].trim()}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/50 text-xs">Approval</div>
                        <div className="text-white font-semibold">{partner.approvalSpeed}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/50 text-xs">Funding</div>
                        <div className="text-white font-semibold">{partner.fundingSpeed.split('/')[0].trim()}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {partner.specialFeatures.slice(0, 4).map((feature, i) => (
                        <Badge key={i} variant="outline" className="border-white/20 text-white/80 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {partner.products.slice(0, 5).map((product, i) => (
                        <Badge key={i} className="bg-white/10 text-white/90 text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      onClick={() => handlePartnerClick(partner)}
                      className={`w-full ${isPrimary ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'bg-white/10 hover:bg-white/20 text-white'} font-bold`}
                      data-testid={`button-apply-${partner.id}`}
                    >
                      {partner.affiliateUrl === "gokapital-form" ? "Start Application" : "Apply Now"}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {fallbacks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/80 flex items-center gap-2">
              <Target className="h-5 w-5" /> Alternative Options
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {fallbacks.map((partner) => (
                <Card key={partner.id} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{partner.name}</CardTitle>
                      <Badge variant="outline" className="border-white/20 text-white/60">{partner.matchScore}%</Badge>
                    </div>
                    <CardDescription className="text-white/50 text-xs">{partner.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/60 text-xs mb-3">{partner.bestFor.join(" • ")}</p>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handlePartnerClick(partner)}
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-white">Need Expert Guidance?</h4>
                <p className="text-white/70 text-sm">
                  Schedule a consultation with Laundromat Larry for personalized funding strategy
                </p>
              </div>
              <Button 
                className="bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap"
                onClick={() => window.location.href = "/larry-larsen"}
              >
                <Phone className="mr-2 h-4 w-4" />
                Book Consultation
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => { setShowResults(false); setStep(1); }}
            className="border-white/30 text-white hover:bg-white/10"
          >
            Start Over
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/sba-readiness"}
            className="border-white/30 text-white hover:bg-white/10"
          >
            Check SBA Readiness
          </Button>
        </div>
      </div>
    );
  };

  const renderGoKapitalForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">GoKapital Real Estate Application</h3>
          <p className="text-white/60 text-sm">Commercial property financing from $150K - $50M</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => setShowGoKapitalForm(false)}
          className="text-white/60 hover:text-white"
        >
          Back to Results
        </Button>
      </div>

      <form onSubmit={handleGoKapitalSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/90">Property Address *</Label>
            <Input
              placeholder="123 Main St, City, State ZIP"
              value={goKapitalForm.propertyAddress}
              onChange={(e) => setGoKapitalForm({ ...goKapitalForm, propertyAddress: e.target.value })}
              className="bg-white/10 border-white/20 text-white mt-1"
              required
              data-testid="input-property-address"
            />
          </div>
          <div>
            <Label className="text-white/90">Property Type *</Label>
            <Select value={goKapitalForm.propertyType} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, propertyType: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1" data-testid="select-property-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laundromat">Laundromat</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="mixed-use">Mixed Use</SelectItem>
                <SelectItem value="industrial">Industrial/Warehouse</SelectItem>
                <SelectItem value="multi-family">Multi-Family</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/90">Transaction Type *</Label>
            <Select value={goKapitalForm.transactionType} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, transactionType: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1" data-testid="select-transaction-type">
                <SelectValue placeholder="Purchase or Refinance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="refinance">Refinance</SelectItem>
                <SelectItem value="cash-out-refi">Cash-Out Refinance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/90">Closing Under</Label>
            <Select value={goKapitalForm.closingEntity} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, closingEntity: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1" data-testid="select-closing-entity">
                <SelectValue placeholder="Entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llc">LLC</SelectItem>
                <SelectItem value="inc">Inc / Corporation</SelectItem>
                <SelectItem value="personal">Personal Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {goKapitalForm.transactionType === "purchase" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/90">Purchase Price *</Label>
              <Input
                type="number"
                placeholder="500000"
                value={goKapitalForm.purchasePrice}
                onChange={(e) => setGoKapitalForm({ ...goKapitalForm, purchasePrice: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-1"
                data-testid="input-purchase-price"
              />
            </div>
            <div>
              <Label className="text-white/90">Down Payment Available</Label>
              <Input
                type="number"
                placeholder="100000"
                value={goKapitalForm.downPayment}
                onChange={(e) => setGoKapitalForm({ ...goKapitalForm, downPayment: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-1"
                data-testid="input-down-payment"
              />
            </div>
          </div>
        )}

        {(goKapitalForm.transactionType === "refinance" || goKapitalForm.transactionType === "cash-out-refi") && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/90">Estimated Property Value</Label>
              <Input
                type="number"
                placeholder="750000"
                value={goKapitalForm.estimatedValue}
                onChange={(e) => setGoKapitalForm({ ...goKapitalForm, estimatedValue: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-1"
                data-testid="input-estimated-value"
              />
            </div>
            <div>
              <Label className="text-white/90">Amount Currently Owed</Label>
              <Input
                type="number"
                placeholder="400000"
                value={goKapitalForm.amountOwed}
                onChange={(e) => setGoKapitalForm({ ...goKapitalForm, amountOwed: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-1"
                data-testid="input-amount-owed"
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/90">Liquid Assets Available</Label>
            <Select value={goKapitalForm.liquidAssets} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, liquidAssets: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1" data-testid="select-liquid-assets">
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
          <div>
            <Label className="text-white/90">Properties Owned (Last 36 months)</Label>
            <Select value={goKapitalForm.propertiesOwned} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, propertiesOwned: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1" data-testid="select-properties-owned">
                <SelectValue placeholder="Select count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - First time investor</SelectItem>
                <SelectItem value="1-2">1-2 properties</SelectItem>
                <SelectItem value="3-5">3-5 properties</SelectItem>
                <SelectItem value="6-10">6-10 properties</SelectItem>
                <SelectItem value="10+">10+ properties</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/90">Estimated Credit Score</Label>
            <Select value={goKapitalForm.creditScore} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, creditScore: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1" data-testid="select-gk-credit-score">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720+">720+</SelectItem>
                <SelectItem value="680-719">680-719</SelectItem>
                <SelectItem value="640-679">640-679</SelectItem>
                <SelectItem value="600-639">600-639</SelectItem>
                <SelectItem value="under600">Under 600</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/90">Is Property Generating Income?</Label>
            <Select value={goKapitalForm.generatingIncome} onValueChange={(val) => setGoKapitalForm({ ...goKapitalForm, generatingIncome: val })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1" data-testid="select-generating-income">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Currently operating</SelectItem>
                <SelectItem value="will-be">Will be after purchase</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-white/90">Rate & Term Expectations</Label>
          <Textarea
            placeholder="Share any specific rate, term, or timeline requirements..."
            value={goKapitalForm.rateTermExpectations}
            onChange={(e) => setGoKapitalForm({ ...goKapitalForm, rateTermExpectations: e.target.value })}
            className="bg-white/10 border-white/20 text-white placeholder-white/40 mt-1 min-h-[80px]"
            data-testid="input-rate-expectations"
          />
        </div>

        <div className="border-t border-white/10 pt-4 mt-4">
          <h4 className="text-white font-semibold mb-3">Contact Information</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white/90">Full Name *</Label>
              <Input
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

        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
          disabled={isSubmitting}
          data-testid="button-submit-gokapital"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Building2 className="h-4 w-4 mr-2" />}
          Submit to GoKapital
        </Button>

        <p className="text-xs text-white/50 text-center">
          Application sent to deals@gokapital.com • Affiliate: Nicholas Kremers
        </p>
      </form>
    </div>
  );

  return (
    <>
      <SEO
        title="Laundromat Funding Matcher - Find Your Perfect Lender | WashBizHub"
        description="Match with 6 vetted lenders for laundromat financing. SBA loans, equipment financing, real estate loans, and more. Get personalized recommendations in 60 seconds."
        keywords={["laundromat financing", "SBA loans laundromat", "equipment financing", "commercial real estate loans", "business acquisition loan"]}
        url="/funding-matcher"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={fundingHeroImg} 
              alt="Find Funding for Your Laundromat Business"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900" />
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">
              6 Vetted Lending Partners
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4" data-testid="text-funding-title">
              Laundromat Funding Matcher
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto" data-testid="text-funding-subtitle">
              Answer a few questions and get matched with the best financing options for your situation - from SBA loans to fast capital
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
            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <Building2 className="h-10 w-10 text-accent mx-auto mb-3" />
                  <h3 className="text-white font-bold mb-2">Real Estate Loans</h3>
                  <p className="text-white/60 text-sm">Purchase or refinance laundromat properties up to $50M</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <Award className="h-10 w-10 text-accent mx-auto mb-3" />
                  <h3 className="text-white font-bold mb-2">SBA Loans</h3>
                  <p className="text-white/60 text-sm">Preferred SBA lenders with $0 guarantee fees up to $1M</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <Zap className="h-10 w-10 text-accent mx-auto mb-3" />
                  <h3 className="text-white font-bold mb-2">Fast Capital</h3>
                  <p className="text-white/60 text-sm">Same-day approvals and 24-48 hour funding when speed matters</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-white font-bold mb-4 text-center">Our Lending Partners</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {FUNDING_PARTNERS.map((partner) => (
                  <div key={partner.id} className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-white font-semibold text-sm">{partner.name}</div>
                    <div className="text-white/50 text-xs mt-1">{partner.type.split(' ').slice(0, 3).join(' ')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
