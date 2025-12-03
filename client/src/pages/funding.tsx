import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, Building2, TrendingUp, CheckCircle2, ExternalLink, Shield,
  Zap, Clock, Star, Briefcase, Factory, Landmark, PiggyBank, Users,
  ArrowRight, Mail, Phone, CreditCard, Loader2
} from "lucide-react";
import { SEO } from "@/components/SEO";

interface FundingPartner {
  id: string;
  name: string;
  type: string;
  description: string;
  minAmount: string;
  maxAmount: string;
  approvalSpeed: string;
  minCredit: string;
  bestFor: string[];
  alsoOffers: string[];
  affiliateUrl: string;
  isPrimary?: boolean;
  specialFeature?: string;
}

const FUNDING_CATEGORIES = {
  startup: {
    title: "Startup Funding",
    subtitle: "Launch Your First Laundromat",
    description: "Perfect for first-time buyers with strong personal credit. Get funding without business history or revenue requirements.",
    icon: PiggyBank,
    color: "from-orange-600 to-amber-600",
    partners: [
      {
        id: "preferred-funding-group",
        name: "Preferred Funding Group",
        type: "Personal Credit-Based Financing",
        description: "Leverage your personal credit to fund your first laundromat. 0% intro rates on business credit cards, no business revenue required. Perfect for startups with 700+ personal credit.",
        minAmount: "$50,000",
        maxAmount: "$500,000",
        approvalSpeed: "60 seconds pre-approval",
        minCredit: "700+",
        bestFor: ["First-time buyers", "No business history", "High personal credit"],
        alsoOffers: ["0% intro business credit cards", "Personal term loans", "Unsecured lines of credit"],
        affiliateUrl: "https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/",
        isPrimary: true,
        specialFeature: "No business revenue required"
      },
      {
        id: "gokapital-startup",
        name: "GoKapital",
        type: "Startup Using Business Credit",
        description: "Alternative startup funding for those building business credit. Fast approvals with flexible terms for new laundromat owners.",
        minAmount: "$25,000",
        maxAmount: "$250,000",
        approvalSpeed: "24-48 hours",
        minCredit: "500+",
        bestFor: ["Building business credit", "Lower personal credit", "Fast funding needs"],
        alsoOffers: ["Equipment financing", "Bridge loans", "Commercial RE"],
        affiliateUrl: "gokapital-form",
        specialFeature: "Works with 500+ credit"
      }
    ]
  },
  acquisitions: {
    title: "Acquisitions & SBA",
    subtitle: "Buy an Existing Laundromat",
    description: "The best rates and longest terms for buying established laundromats. SBA loans offer 10-25 year terms with low down payments.",
    icon: Briefcase,
    color: "from-blue-600 to-indigo-600",
    partners: [
      {
        id: "south-end-capital",
        name: "South End Capital",
        type: "Preferred SBA Lender (Stearns Bank)",
        description: "Division of $3.2B Stearns Bank. Preferred SBA lender with $0 guarantee fees on loans up to $1M through 2025. Story-based underwriting for complex situations.",
        minAmount: "$1,000",
        maxAmount: "$15,000,000",
        approvalSpeed: "Same day - 48 hours",
        minCredit: "600+",
        bestFor: ["SBA loans under $1M", "Lower credit scores", "Complex situations"],
        alsoOffers: ["Equipment financing", "Conventional loans", "Fast capital"],
        affiliateUrl: "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat",
        isPrimary: true,
        specialFeature: "$0 SBA fees up to $1M"
      },
      {
        id: "national-business-capital",
        name: "National Business Capital",
        type: "Large Acquisitions ($1M+)",
        description: "Access 75+ lenders through one application. Specialists in SBA 7(a) loans with dedicated advisors for complex, multi-unit acquisitions.",
        minAmount: "$100,000",
        maxAmount: "$10,000,000",
        approvalSpeed: "24-48 hours",
        minCredit: "580+",
        bestFor: ["$1M+ acquisitions", "Multi-unit portfolios", "Experienced operators"],
        alsoOffers: ["SBA 7(a) loans", "Term loans", "Equipment financing"],
        affiliateUrl: "consultation",
        specialFeature: "Dedicated acquisition advisor"
      }
    ]
  },
  equipment: {
    title: "Equipment Financing",
    subtitle: "Finance Washers, Dryers & Systems",
    description: "Get the machines you need with flexible terms. Equipment serves as collateral, making approval easier than unsecured loans.",
    icon: Factory,
    color: "from-emerald-600 to-teal-600",
    partners: [
      {
        id: "rok-financial",
        name: "ROK Financial",
        type: "Fast Equipment Lending",
        description: "LoanTech-powered platform with 75+ lenders. Processes 80% faster than traditional banks. Same-day to 48-hour funding available.",
        minAmount: "$5,000",
        maxAmount: "$5,000,000",
        approvalSpeed: "4 hours (80% of apps)",
        minCredit: "550+",
        bestFor: ["Fast equipment funding", "Multiple offers", "Lower credit scores"],
        alsoOffers: ["Term loans", "Lines of credit", "Revenue-based financing"],
        affiliateUrl: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1",
        isPrimary: true,
        specialFeature: "Same-day funding available"
      },
      {
        id: "south-end-equipment",
        name: "South End Capital",
        type: "Equipment & SBA Financing",
        description: "Same-day equipment funding through Stearns Bank. No prepayment penalties and story-based underwriting for unique situations.",
        minAmount: "$1,000",
        maxAmount: "$500,000",
        approvalSpeed: "Same day",
        minCredit: "600+",
        bestFor: ["Quick equipment needs", "No prepayment penalty", "SBA equipment loans"],
        alsoOffers: ["SBA 7(a)", "Conventional loans", "Working capital"],
        affiliateUrl: "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat"
      }
    ]
  },
  realestate: {
    title: "Commercial Real Estate",
    subtitle: "Purchase or Refinance Property",
    description: "Own your building instead of leasing. Commercial RE loans for laundromat property purchases, refinancing, and investment properties.",
    icon: Building2,
    color: "from-purple-600 to-violet-600",
    partners: [
      {
        id: "gokapital",
        name: "GoKapital",
        type: "Commercial Real Estate Specialist",
        description: "Premier commercial real estate lender with fast approvals. Up to 80% LTV, DSCR loans available. Specializes in laundromat property purchases and investment properties.",
        minAmount: "$100,000",
        maxAmount: "$50,000,000",
        approvalSpeed: "24-48 hours",
        minCredit: "500+",
        bestFor: ["Property purchases", "Bridge financing", "Investment properties"],
        alsoOffers: ["Bridge loans", "Equipment financing", "Business term loans"],
        affiliateUrl: "gokapital-form",
        isPrimary: true,
        specialFeature: "Up to 80% LTV"
      },
      {
        id: "rok-realestate",
        name: "ROK Financial",
        type: "Commercial RE Marketplace",
        description: "Access 75+ lenders for commercial real estate financing. Competitive rates with fast processing for qualified borrowers.",
        minAmount: "$50,000",
        maxAmount: "$5,000,000",
        approvalSpeed: "24-72 hours",
        minCredit: "580+",
        bestFor: ["Multiple lender options", "Fast processing", "Refinancing"],
        alsoOffers: ["Equipment financing", "Term loans", "Lines of credit"],
        affiliateUrl: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1"
      }
    ]
  },
  fastcash: {
    title: "Fast Cash Flow",
    subtitle: "Working Capital & Emergency Funding",
    description: "Need cash fast? Revenue-based financing and merchant cash advances when speed matters more than cost. Same-day funding available.",
    icon: Zap,
    color: "from-red-600 to-rose-600",
    partners: [
      {
        id: "advance-funds-network",
        name: "Advance Funds Network",
        type: "Same-Day Funding Specialist",
        description: "Same-day funding since 2007. Best for urgent working capital needs when speed matters. Revenue-based repayment with no minimum credit score.",
        minAmount: "$5,000",
        maxAmount: "$2,000,000",
        approvalSpeed: "Same day",
        minCredit: "No minimum",
        bestFor: ["Emergency capital", "Cash flow gaps", "Any credit situation"],
        alsoOffers: ["Merchant cash advance", "Equipment financing", "AR financing"],
        affiliateUrl: "https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3",
        isPrimary: true,
        specialFeature: "No minimum credit score"
      },
      {
        id: "david-allen-capital",
        name: "David Allen Capital",
        type: "Revenue-Based Funding Platform",
        description: "BankBreezy platform connects to 20+ funders with one application. Zero-interest early payoff options and competitive rates.",
        minAmount: "$10,000",
        maxAmount: "$2,000,000",
        approvalSpeed: "24 hours",
        minCredit: "500+",
        bestFor: ["Revenue-based funding", "Early payoff savings", "Multiple offers"],
        alsoOffers: ["Equipment financing", "Invoice factoring", "Lines of credit"],
        affiliateUrl: "https://davidallencapital.com/nicholaskremers",
        specialFeature: "Zero-interest early payoff"
      }
    ]
  }
};

export default function Funding() {
  const searchString = useSearch();
  const validTabs = ["startup", "acquisitions", "equipment", "realestate", "fastcash"];
  
  // Parse initial tab from URL query parameter
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
  
  // Update tab when URL query parameter changes
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
    
    // Create mailto link with form data
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

  const handlePrequalify = (partner: FundingPartner) => {
    if (partner.affiliateUrl === "consultation") {
      setConsultationOpen(true);
    } else if (partner.affiliateUrl === "gokapital-form") {
      window.open("/gokapital", "_blank");
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

      <div className="min-h-screen bg-white">
        {/* Premium Hero Section */}
        <div className="mesh-gradient-hero py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 mb-6">
              <DollarSign className="w-4 h-4 text-[#b8860b]" />
              <span className="text-sm font-medium text-[#1e3a5f]">7 Trusted Lending Partners</span>
            </div>
            <h1 className="hero-title text-[#1e3a5f] mb-4">
              Laundromat{' '}
              <span className="text-gradient-gold">Funding</span>{' '}
              Made Simple
            </h1>
            <p className="hero-subtitle max-w-3xl mx-auto mb-12">
              From startup to acquisition, find the right financing for your laundromat. Compare rates, terms, and get pre-qualified in minutes.
            </p>
            
            {/* Premium Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { value: "$5K-$50M", label: "Funding Range" },
                { value: "7", label: "Lending Partners" },
                { value: "Same Day", label: "Fastest Approval" },
                { value: "500+", label: "Min Credit Score" }
              ].map((stat, i) => (
                <div key={i} className="premium-card p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-[#b8860b]">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funding Type Tabs */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-3">What type of funding do you need?</h2>
            <p className="text-gray-500 text-lg">Select a category to see your best options</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0 mb-8">
              {Object.entries(FUNDING_CATEGORIES).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all data-[state=active]:border-[#b8860b] data-[state=active]:bg-[#b8860b]/10 data-[state=inactive]:border-slate-200 data-[state=inactive]:dark:border-slate-700 data-[state=inactive]:hover:border-slate-300`}
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
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${category.color} rounded-xl p-6 md:p-8 text-white mb-8`}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <CategoryIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{category.title}</h3>
                      <p className="text-white/90 text-lg mb-2">{category.subtitle}</p>
                      <p className="text-white/80">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Partner Cards */}
                <div className="space-y-6">
                  {category.partners.map((partner, idx) => (
                    <Card 
                      key={partner.id} 
                      className={`overflow-hidden ${partner.isPrimary ? 'ring-2 ring-[#b8860b] shadow-lg' : ''}`}
                      data-testid={`card-partner-${partner.id}`}
                    >
                      {partner.isPrimary && (
                        <div className="bg-gradient-to-r from-[#b8860b] to-[#d4a030] text-white text-center py-2 text-sm font-medium">
                          <Star className="w-4 h-4 inline mr-1" />
                          Recommended Partner for {category.title}
                        </div>
                      )}
                      <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1">{partner.name}</CardTitle>
                            <CardDescription className="text-base">{partner.type}</CardDescription>
                          </div>
                          {partner.specialFeature && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 whitespace-nowrap self-start">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {partner.specialFeature}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <p className="text-slate-600 dark:text-slate-400">{partner.description}</p>
                        
                        {/* Key Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Funding Range</div>
                            <div className="font-semibold text-slate-900 dark:text-white">{partner.minAmount} - {partner.maxAmount}</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Approval Speed</div>
                            <div className="font-semibold text-slate-900 dark:text-white">{partner.approvalSpeed}</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Min Credit</div>
                            <div className="font-semibold text-slate-900 dark:text-white">{partner.minCredit}</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Best For</div>
                            <div className="font-semibold text-slate-900 dark:text-white text-sm">{partner.bestFor[0]}</div>
                          </div>
                        </div>

                        {/* Best For & Also Offers */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Best For:</h4>
                            <div className="flex flex-wrap gap-2">
                              {partner.bestFor.map((item, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Also Offers:</h4>
                            <div className="flex flex-wrap gap-2">
                              {partner.alsoOffers.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Button 
                          onClick={() => handlePrequalify(partner)}
                          className={`w-full md:w-auto ${partner.isPrimary ? 'bg-[#b8860b] hover:bg-[#a07609]' : ''}`}
                          size="lg"
                          data-testid={`button-prequalify-${partner.id}`}
                        >
                          {partner.affiliateUrl === "consultation" ? (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Request Consultation
                            </>
                          ) : (
                            <>
                              Get Pre-Qualified
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Need Help Section */}
                <Card className="mt-8 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6 md:p-8 text-center">
                    <Users className="w-10 h-10 mx-auto mb-4 text-[#b8860b]" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Not Sure Which Option Is Right?</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-xl mx-auto">
                      Our team can help you navigate funding options and match you with the right lender for your situation.
                    </p>
                    <Button 
                      variant="outline" 
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

        {/* How It Works */}
        <div className="bg-slate-100 dark:bg-slate-900/50 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: 1, icon: CreditCard, title: "Choose Your Type", desc: "Select the funding category that matches your needs" },
                { step: 2, icon: CheckCircle2, title: "Compare Partners", desc: "Review terms, rates, and specialties" },
                { step: 3, icon: ArrowRight, title: "Get Pre-Qualified", desc: "Click through to apply (5-10 minutes)" },
                { step: 4, icon: DollarSign, title: "Get Funded", desc: "Receive funds as fast as same-day" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-[#b8860b] text-white font-bold mb-4">
                        {item.step}
                      </div>
                      <Icon className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
                      <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-wrap justify-center gap-6 items-center text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Same-Day Approvals</span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5" />
                <span className="text-sm">Licensed Lenders</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="text-sm">Trusted by 10,000+ Owners</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Dialog */}
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
            <Button type="submit" className="w-full bg-[#b8860b] hover:bg-[#a07609]" disabled={isSubmitting} data-testid="button-submit-consultation">
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
