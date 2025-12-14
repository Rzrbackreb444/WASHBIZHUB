import { useState, useEffect } from "react";
import { useSearch, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, Building2, CheckCircle2, Shield,
  Zap, Clock, Star, Briefcase, Factory, Landmark, PiggyBank, Users,
  ArrowRight, Mail, Phone, CreditCard, Loader2
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { FundingPartnerCard, FundingPartner } from "@/components/FundingPartnerCard";

const FUNDING_CATEGORIES: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: typeof PiggyBank;
  partners: FundingPartner[];
}> = {
  startup: {
    title: "Startup Funding",
    subtitle: "Launch Your First Laundromat",
    description: "Perfect for first-time buyers with strong personal credit. Get funding without business history or revenue requirements.",
    icon: PiggyBank,
    partners: [
      {
        id: "preferred-funding-group",
        name: "Preferred Funding Group",
        type: "Personal Credit Loans + Business Credit Cards",
        description: "Two funding paths in one: (1) Unsecured 5-7 year term loans based on personal credit with fixed payments, no collateral, rates from 9-15%. (2) Business credit cards with 0% interest for 6-12 months that report only to business credit. BBB Accredited with 10,000+ businesses funded.",
        requirements: {
          minCreditScore: "680+ (all 3 bureaus)",
          timeInBusiness: "N/A (Startup OK)",
          minAnnualRevenue: "$50,000+ taxable income",
          downPayment: "None required"
        },
        loanDetails: {
          minAmount: "$25,000",
          maxAmount: "$500,000",
          termLength: "5-7 years (term) or Revolving (cards)",
          approvalSpeed: "7-15 business days",
          interestRate: "9-15% (term) or 0% intro (cards)"
        },
        documentation: {
          bankStatements: "3 months",
          taxReturns: "2 years personal",
          financials: "Personal credit report (all 3 bureaus)",
          other: ["Valid ID", "Proof of address"]
        },
        bestFor: ["First-time buyers", "Strong personal credit", "No business history needed"],
        alsoOffers: ["0% intro business cards", "No prepayment penalty", "Protects personal credit with business cards"],
        affiliateUrl: "https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/",
        isPrimary: true,
        specialFeature: "No assets or collateral required",
        trustSignals: ["BBB Accredited", "10,000+ funded businesses", "No upfront fees"],
        detailPageUrl: "/funding/preferred-funding-group"
      },
      {
        id: "gokapital-startup",
        name: "GoKapital",
        type: "Startup Using Business Credit",
        description: "Alternative startup funding utilizing business credit. Fast approvals with flexible terms for new laundromat owners. A+ BBB rated with 500+ laundromats funded.",
        requirements: {
          minCreditScore: "500+",
          timeInBusiness: "N/A (Startup OK)",
          minAnnualRevenue: "None required",
          downPayment: "10-20%"
        },
        loanDetails: {
          minAmount: "$25,000",
          maxAmount: "$250,000",
          termLength: "1-3 years",
          approvalSpeed: "24-48 hours",
          interestRate: "8-18%"
        },
        documentation: {
          bankStatements: "3 months",
          taxReturns: "Not required for startups",
          financials: "Business plan",
          other: ["Valid ID", "Business registration"]
        },
        bestFor: ["Building business credit", "Lower personal credit OK", "Fast funding needs"],
        alsoOffers: ["Equipment financing", "Bridge loans", "Commercial RE"],
        affiliateUrl: "mailto:deals@gokapital.com?cc=consult@washbizhub.com&subject=Laundromat%20Startup%20Funding%20-%20Nicholas%20Kremers%20Referral",
        specialFeature: "Works with 500+ credit",
        trustSignals: ["A+ BBB Rating", "500+ laundromats funded", "Fast 24-48hr approval"],
        detailPageUrl: "/funding/gokapital"
      }
    ]
  },
  acquisitions: {
    title: "Acquisitions & SBA",
    subtitle: "Buy an Existing Laundromat",
    description: "The best rates and longest terms for buying established laundromats. SBA loans offer 10-25 year terms with low down payments.",
    icon: Briefcase,
    partners: [
      {
        id: "south-end-capital",
        name: "South End Capital",
        type: "Preferred SBA Lender (Stearns Bank)",
        description: "Division of $3.2B Stearns Bank. Preferred SBA lender with $0 guarantee fees on loans up to $1M through 2025. Story-based underwriting for complex situations.",
        requirements: {
          minCreditScore: "650+",
          timeInBusiness: "6+ months (or acquisition)",
          minAnnualRevenue: "$50,000+",
          downPayment: "10% (SBA)"
        },
        loanDetails: {
          minAmount: "$1,000",
          maxAmount: "$15,000,000",
          termLength: "10-25 years (SBA)",
          approvalSpeed: "Same day - 48 hours",
          interestRate: "Prime + 2.75%"
        },
        documentation: {
          bankStatements: "3-6 months",
          taxReturns: "2-3 years",
          financials: "P&L, Balance Sheet",
          other: ["Business plan", "Purchase agreement"]
        },
        bestFor: ["SBA loans under $1M", "Lower credit scores", "Complex situations"],
        alsoOffers: ["Equipment financing", "Conventional loans", "Fast capital"],
        affiliateUrl: "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat",
        isPrimary: true,
        specialFeature: "$0 SBA fees up to $1M",
        trustSignals: ["$3.2B Stearns Bank", "Preferred SBA Lender", "Story-based underwriting"],
        detailPageUrl: "/funding/south-end-capital"
      },
      {
        id: "national-business-capital",
        name: "National Business Capital",
        type: "Large Acquisitions ($1M+)",
        description: "Access 75+ lenders through one application. Specialists in SBA 7(a) loans with dedicated advisors for complex, multi-unit acquisitions.",
        requirements: {
          minCreditScore: "650+",
          timeInBusiness: "2+ years",
          minAnnualRevenue: "$100,000+",
          downPayment: "10-20%"
        },
        loanDetails: {
          minAmount: "$100,000",
          maxAmount: "$10,000,000",
          termLength: "10-25 years",
          approvalSpeed: "24-48 hours",
          interestRate: "Prime + 2.75% (SBA)"
        },
        documentation: {
          bankStatements: "6 months",
          taxReturns: "3 years",
          financials: "Full financials",
          other: ["Business plan", "Projections", "Purchase agreement"]
        },
        bestFor: ["$1M+ acquisitions", "Multi-unit portfolios", "Experienced operators"],
        alsoOffers: ["SBA 7(a) loans", "Term loans", "Equipment financing"],
        affiliateUrl: "mailto:trosado@national.biz?cc=consult@washbizhub.com&subject=Laundromat%20Acquisition%20Funding%20-%20Nicholas%20Kremers%20Referral",
        specialFeature: "Dedicated acquisition advisor",
        trustSignals: ["75+ lender network", "Dedicated advisors", "Inc. 5000 company"],
        detailPageUrl: "/funding/national-business-capital"
      }
    ]
  },
  equipment: {
    title: "Equipment Financing",
    subtitle: "Finance Washers, Dryers & Systems",
    description: "Get the machines you need with flexible terms. Equipment serves as collateral, making approval easier than unsecured loans.",
    icon: Factory,
    partners: [
      {
        id: "rok-financial",
        name: "ROK Financial",
        type: "Fast Equipment Lending",
        description: "LoanTech-powered platform with 75+ lenders. Processes 80% faster than traditional banks. Same-day to 48-hour funding available.",
        requirements: {
          minCreditScore: "550+",
          timeInBusiness: "2+ years (for SBA)",
          minAnnualRevenue: "Any revenue",
          downPayment: "0-10%"
        },
        loanDetails: {
          minAmount: "$5,000",
          maxAmount: "$5,000,000",
          termLength: "2-7 years",
          approvalSpeed: "4 hours (80% of apps)",
          interestRate: "6-24%"
        },
        documentation: {
          bankStatements: "3 months",
          taxReturns: "1-2 years",
          financials: "Equipment quote",
          other: ["Valid ID", "Voided check"]
        },
        bestFor: ["Fast equipment funding", "Multiple offers", "Lower credit scores"],
        alsoOffers: ["Term loans", "Lines of credit", "Revenue-based financing"],
        affiliateUrl: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1",
        isPrimary: true,
        specialFeature: "Same-day funding available",
        trustSignals: ["75+ lender network", "80% faster processing", "A+ BBB Rating"],
        detailPageUrl: "/funding/rok-financial"
      },
      {
        id: "south-end-equipment",
        name: "South End Capital",
        type: "Equipment & SBA Financing",
        description: "Same-day equipment funding through Stearns Bank. No prepayment penalties and story-based underwriting for unique situations.",
        requirements: {
          minCreditScore: "650+",
          timeInBusiness: "6+ months",
          minAnnualRevenue: "$50,000+",
          downPayment: "0-10%"
        },
        loanDetails: {
          minAmount: "$1,000",
          maxAmount: "$500,000",
          termLength: "2-7 years",
          approvalSpeed: "Same day",
          interestRate: "7-15%"
        },
        documentation: {
          bankStatements: "3 months",
          taxReturns: "1-2 years",
          financials: "Equipment invoice",
          other: ["Valid ID"]
        },
        bestFor: ["Quick equipment needs", "No prepayment penalty", "SBA equipment loans"],
        alsoOffers: ["SBA 7(a)", "Conventional loans", "Working capital"],
        affiliateUrl: "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat",
        trustSignals: ["$3.2B Stearns Bank", "No prepayment penalty", "Same-day funding"]
      },
      {
        id: "gokapital-equipment",
        name: "GoKapital",
        type: "Equipment Financing",
        description: "Fast equipment financing for laundromat washers, dryers, and systems. Flexible terms with quick approvals for new and used equipment.",
        requirements: {
          minCreditScore: "500+",
          timeInBusiness: "6+ months",
          minAnnualRevenue: "$50,000+",
          downPayment: "10-20%"
        },
        loanDetails: {
          minAmount: "$10,000",
          maxAmount: "$500,000",
          termLength: "2-5 years",
          approvalSpeed: "24-48 hours",
          interestRate: "8-18%"
        },
        documentation: {
          bankStatements: "3 months",
          taxReturns: "1-2 years",
          financials: "Equipment quote",
          other: ["Valid ID", "Business registration"]
        },
        bestFor: ["New & used equipment", "Lower credit scores", "Fast funding"],
        alsoOffers: ["Commercial RE", "Bridge loans", "Working capital"],
        affiliateUrl: "mailto:deals@gokapital.com?cc=consult@washbizhub.com&subject=Equipment%20Financing%20-%20Nicholas%20Kremers%20Referral",
        specialFeature: "Works with 500+ credit",
        trustSignals: ["A+ BBB Rating", "500+ laundromats funded", "Fast 24-48hr approval"],
        detailPageUrl: "/funding/gokapital"
      }
    ]
  },
  realestate: {
    title: "Commercial Real Estate",
    subtitle: "Purchase or Refinance Property",
    description: "Own your building instead of leasing. Commercial RE loans for laundromat property purchases, refinancing, and investment properties.",
    icon: Building2,
    partners: [
      {
        id: "gokapital",
        name: "GoKapital",
        type: "Commercial Real Estate Specialist",
        description: "Premier commercial real estate lender with fast approvals. Up to 80% LTV, DSCR loans available. Specializes in laundromat property purchases and investment properties.",
        requirements: {
          minCreditScore: "500+",
          timeInBusiness: "N/A for DSCR",
          minAnnualRevenue: "Property cash flow",
          downPayment: "20-25%"
        },
        loanDetails: {
          minAmount: "$100,000",
          maxAmount: "$50,000,000",
          termLength: "5-30 years",
          approvalSpeed: "24-48 hours",
          interestRate: "6.5-10%"
        },
        documentation: {
          bankStatements: "3 months",
          taxReturns: "2 years (or DSCR)",
          financials: "Property appraisal",
          other: ["Purchase contract", "Rent roll (if applicable)"]
        },
        bestFor: ["Property purchases", "Bridge financing", "Investment properties"],
        alsoOffers: ["Bridge loans", "Equipment financing", "Business term loans"],
        affiliateUrl: "mailto:deals@gokapital.com?cc=consult@washbizhub.com&subject=Commercial%20Real%20Estate%20Financing%20-%20Nicholas%20Kremers%20Referral",
        isPrimary: true,
        specialFeature: "Up to 80% LTV",
        trustSignals: ["A+ BBB Rating", "$500M+ funded", "DSCR loans available"],
        detailPageUrl: "/funding/gokapital"
      },
      {
        id: "rok-realestate",
        name: "ROK Financial",
        type: "Commercial RE Marketplace",
        description: "Access 75+ lenders for commercial real estate financing. Competitive rates with fast processing for qualified borrowers.",
        requirements: {
          minCreditScore: "580+",
          timeInBusiness: "1+ year",
          minAnnualRevenue: "$100,000+",
          downPayment: "15-25%"
        },
        loanDetails: {
          minAmount: "$50,000",
          maxAmount: "$5,000,000",
          termLength: "5-25 years",
          approvalSpeed: "24-72 hours",
          interestRate: "6-12%"
        },
        documentation: {
          bankStatements: "3 months",
          taxReturns: "2 years",
          financials: "Property financials",
          other: ["Appraisal", "Environmental report"]
        },
        bestFor: ["Multiple lender options", "Fast processing", "Refinancing"],
        alsoOffers: ["Equipment financing", "Term loans", "Lines of credit"],
        affiliateUrl: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1",
        trustSignals: ["75+ lender network", "Fast processing", "Competitive rates"]
      }
    ]
  },
  fastcash: {
    title: "Fast Cash Flow",
    subtitle: "Working Capital & Emergency Funding",
    description: "Need cash fast? Revenue-based financing and merchant cash advances when speed matters more than cost. Same-day funding available.",
    icon: Zap,
    partners: [
      {
        id: "advance-funds-network",
        name: "Advance Funds Network",
        type: "Same-Day Funding Specialist",
        description: "Same-day funding since 2007. Best for urgent working capital needs when speed matters. Revenue-based repayment with no minimum credit score.",
        requirements: {
          minCreditScore: "No minimum",
          timeInBusiness: "6+ months",
          minAnnualRevenue: "$120,000+",
          downPayment: "None"
        },
        loanDetails: {
          minAmount: "$5,000",
          maxAmount: "$2,000,000",
          termLength: "3-18 months",
          approvalSpeed: "Same day",
          interestRate: "Factor rate 1.1-1.5"
        },
        documentation: {
          bankStatements: "4 months",
          taxReturns: "Not required",
          financials: "None required",
          other: ["Valid ID", "Voided check"]
        },
        bestFor: ["Emergency capital", "Cash flow gaps", "Any credit situation"],
        alsoOffers: ["Merchant cash advance", "Equipment financing", "AR financing"],
        affiliateUrl: "https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3",
        isPrimary: true,
        specialFeature: "No minimum credit score",
        trustSignals: ["Since 2007", "Same-day funding", "A+ BBB Rating"],
        detailPageUrl: "/funding/advance-funds-network"
      },
      {
        id: "david-allen-capital",
        name: "David Allen Capital",
        type: "Revenue-Based Funding Platform",
        description: "BankBreezy platform connects to 20+ funders with one application. Zero-interest early payoff options and competitive rates.",
        requirements: {
          minCreditScore: "500+",
          timeInBusiness: "6+ months",
          minAnnualRevenue: "$120,000+",
          downPayment: "None"
        },
        loanDetails: {
          minAmount: "$10,000",
          maxAmount: "$2,000,000",
          termLength: "3-24 months",
          approvalSpeed: "24 hours",
          interestRate: "Factor rate 1.1-1.4"
        },
        documentation: {
          bankStatements: "3 months",
          taxReturns: "Not required",
          financials: "None required",
          other: ["Valid ID"]
        },
        bestFor: ["Revenue-based funding", "Early payoff savings", "Multiple offers"],
        alsoOffers: ["Equipment financing", "Invoice factoring", "Lines of credit"],
        affiliateUrl: "https://davidallencapital.com/nicholaskremers",
        specialFeature: "Zero-interest early payoff",
        trustSignals: ["20+ funder network", "Early payoff options", "Fast approvals"],
        detailPageUrl: "/funding/david-allen-capital"
      }
    ]
  }
};

export default function Funding() {
  const searchString = useSearch();
  const validTabs = ["startup", "acquisitions", "equipment", "realestate", "fastcash"];
  
  const getInitialTab = () => {
    const params = new URLSearchParams(searchString);
    const tabParam = params.get("tab");
    return tabParam && validTabs.includes(tabParam) ? tabParam : "startup";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    fundingAmount: "",
    message: ""
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const tabParam = params.get("tab");
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchString]);

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const subject = encodeURIComponent(`Acquisition Consultation Request - ${formData.fundingAmount}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone || 'Not provided'}\n` +
      `Funding Amount: ${formData.fundingAmount}\n\n` +
      `Message:\n${formData.message || 'No additional details provided.'}`
    );
    
    window.location.href = `mailto:consult@washbizhub.com?subject=${subject}&body=${body}`;
    
    toast({
      title: "Opening Email Client",
      description: "Complete your consultation request in your email app.",
    });
    
    setConsultationOpen(false);
    setFormData({ name: "", email: "", phone: "", fundingAmount: "", message: "" });
    setIsSubmitting(false);
  };

  const handleApply = (partner: FundingPartner) => {
    if (partner.affiliateUrl === "consultation") {
      setConsultationOpen(true);
    } else if (partner.affiliateUrl.startsWith("mailto:")) {
      window.location.href = partner.affiliateUrl;
    } else if (partner.affiliateUrl.startsWith("/")) {
      window.open(partner.affiliateUrl, "_blank");
    } else {
      window.open(partner.affiliateUrl, "_blank");
    }
  };

  const currentCategory = FUNDING_CATEGORIES[activeTab as keyof typeof FUNDING_CATEGORIES];
  const CategoryIcon = currentCategory.icon;

  return (
    <>
      <SEO
        title="Laundromat Financing & Business Loans | SBA, Equipment, Startup Funding | WashBizHub"
        description="Get laundromat financing: SBA loans, equipment financing, startup funding, commercial real estate. $5K-$50M available. Compare 7 specialized lenders. Fast approval."
        canonicalUrl="/funding"
        ogType="website"
        keywords={[
          "laundromat financing",
          "SBA loan for laundromat",
          "laundromat equipment financing",
          "laundromat startup funding",
          "laundromat business loan",
          "commercial real estate laundromat",
          "laundromat acquisition loan",
          "coin laundry financing"
        ]}
        faqs={[
          {
            question: "What is the best loan for buying a laundromat?",
            answer: "SBA 7(a) loans offer the best rates (Prime + 2.75%) and longest terms (up to 25 years). For faster funding, equipment financing or revenue-based options can close in 1-7 days."
          },
          {
            question: "Can I get laundromat funding with no business experience?",
            answer: "Yes. Preferred Funding Group specializes in startup funding using personal credit (700+ score). No business revenue or history required."
          },
          {
            question: "How fast can I get laundromat financing?",
            answer: "Same-day funding is available through Advance Funds Network and South End Capital. Most equipment loans close in 24-72 hours. SBA loans take 30-90 days."
          },
          {
            question: "What credit score do I need for laundromat financing?",
            answer: "It varies by lender: Advance Funds Network has no minimum, GoKapital works with 500+, most equipment lenders need 550+, and SBA loans typically require 600+."
          }
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Funding", url: "/funding" }
        ]}
      />

      <div className="min-h-screen bg-background">
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
            <Badge 
              variant="outline" 
              className="mb-6 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30"
            >
              <DollarSign className="w-3 h-3 mr-1.5" />
              7 Trusted Lending Partners
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Laundromat{' '}
              <span className="text-[#C8A661]">Funding</span>{' '}
              Made Simple
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              From startup to acquisition, find the right financing for your laundromat. Compare rates, terms, and get pre-qualified in minutes.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { value: "$5K-$50M", label: "Funding Range" },
                { value: "7", label: "Lending Partners" },
                { value: "Same Day", label: "Fastest Approval" },
                { value: "500+", label: "Min Credit Score" }
              ].map((stat, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-[#C8A661]">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">What type of funding do you need?</h2>
              <p className="text-muted-foreground text-lg">Select a category to see your best options</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0 mb-8">
                {Object.entries(FUNDING_CATEGORIES).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all data-[state=active]:border-[#C8A661] data-[state=active]:bg-[#C8A661]/10 data-[state=inactive]:border-border data-[state=inactive]:hover:border-muted-foreground/30"
                      data-testid={`tab-${key}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs md:text-sm font-medium text-center">{category.title}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.entries(FUNDING_CATEGORIES).map(([key, category]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  <Card className="bg-[#0A1628] border-0 mb-8 overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row items-start gap-4">
                        <div className="h-14 w-14 rounded-lg bg-[#C8A661]/20 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="w-7 h-7 text-[#C8A661]" />
                        </div>
                        <div className="text-white">
                          <h3 className="text-2xl font-bold mb-1">{category.title}</h3>
                          <p className="text-gray-300 text-lg mb-2">{category.subtitle}</p>
                          <p className="text-gray-400">{category.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {key === "acquisitions" && (
                    <Card className="mb-6 bg-card border shadow-sm overflow-hidden">
                      <div className="h-1 bg-[#C8A661]" />
                      <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                            <Landmark className="w-6 h-6 text-[#C8A661]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">Looking for SBA 7(a) Loans?</h3>
                            <p className="text-muted-foreground text-sm">
                              Visit our dedicated SBA Loans page for detailed requirements, a lender matching quiz, and side-by-side comparisons.
                            </p>
                          </div>
                        </div>
                        <Link href="/sba-loans">
                          <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] whitespace-nowrap" data-testid="link-sba-loans">
                            View SBA Loans Guide <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-6">
                    {category.partners.map((partner) => (
                      <FundingPartnerCard 
                        key={partner.id}
                        partner={partner} 
                        onApply={handleApply}
                        showDocumentation={true}
                      />
                    ))}
                  </div>

                  <Card className="mt-8 bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="p-6 md:p-8 text-center">
                      <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-[#C8A661]" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Not Sure Which Option Is Right?</h3>
                      <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
                        Our team can help you navigate funding options and match you with the right lender for your situation.
                      </p>
                      <Button 
                        className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                        onClick={() => setConsultationOpen(true)}
                        data-testid="button-get-help"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Get Personalized Help
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: 1, icon: CreditCard, title: "Choose Your Type", desc: "Select the funding category that matches your needs" },
                { step: 2, icon: CheckCircle2, title: "Compare Partners", desc: "Review terms, rates, and specialties" },
                { step: 3, icon: ArrowRight, title: "Get Pre-Qualified", desc: "Click through to apply (5-10 minutes)" },
                { step: 4, icon: DollarSign, title: "Get Funded", desc: "Receive funds as fast as same-day" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} className="bg-card border shadow-sm overflow-hidden text-center">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="pt-6 p-6">
                      <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-lg bg-[#0A1628] text-[#C8A661] font-bold mb-4 text-lg">
                        {item.step}
                      </div>
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2 text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-wrap justify-center gap-6 items-center text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#C8A661]" />
                <span className="text-sm">Secure Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C8A661]" />
                <span className="text-sm">Same-Day Approvals</span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#C8A661]" />
                <span className="text-sm">Licensed Lenders</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#C8A661]" />
                <span className="text-sm">Trusted by 10,000+ Owners</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={consultationOpen} onOpenChange={setConsultationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Consultation</DialogTitle>
            <DialogDescription>
              Tell us about your funding needs and we'll connect you with the right partner.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConsultationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required 
                data-testid="input-consultation-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required 
                data-testid="input-consultation-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                data-testid="input-consultation-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Funding Amount Needed</Label>
              <Input 
                id="amount" 
                placeholder="e.g., $500,000"
                value={formData.fundingAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, fundingAmount: e.target.value }))}
                required 
                data-testid="input-consultation-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Tell us about your situation</Label>
              <Textarea 
                id="message" 
                placeholder="Describe your acquisition plans, timeline, and any questions..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                data-testid="input-consultation-message"
              />
            </div>
            <Button type="submit" className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" disabled={isSubmitting} data-testid="button-submit-consultation">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
