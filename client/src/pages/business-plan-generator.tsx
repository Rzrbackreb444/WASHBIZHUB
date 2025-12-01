import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Users, 
  MapPin,
  CheckCircle2,
  Sparkles,
  Download,
  ArrowRight,
  Building2,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Lock,
  CreditCard
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface BusinessPlanData {
  businessName: string;
  address: string;
  purchasePrice: string;
  downPayment: string;
  monthlyRevenue: string;
  monthlyExpenses: string;
  numWashers: string;
  numDryers: string;
  squareFeet: string;
  loanType: string;
  ownerExperience: string;
  businessDescription: string;
}

const FEATURES = [
  { icon: FileText, title: "Executive Summary", description: "Professional overview for lenders" },
  { icon: BarChart3, title: "Financial Projections", description: "5-year P&L, cash flow, balance sheet" },
  { icon: MapPin, title: "Market Analysis", description: "Demographics, competition, opportunity" },
  { icon: TrendingUp, title: "Growth Strategy", description: "Marketing and expansion plans" },
  { icon: Users, title: "Management Team", description: "Organization and key personnel" },
  { icon: Shield, title: "Risk Analysis", description: "SWOT and mitigation strategies" },
];

const TESTIMONIALS = [
  {
    quote: "Got my SBA loan approved in 3 weeks. The business plan was exactly what my lender needed.",
    name: "Michael R.",
    role: "New Laundromat Owner, Texas",
  },
  {
    quote: "Saved me $3,000 on hiring a consultant. The AI generated everything I needed.",
    name: "Sarah T.",
    role: "First-time Buyer, Ohio",
  },
];

export default function BusinessPlanGenerator() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [verifiedSessionId, setVerifiedSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BusinessPlanData>({
    businessName: "",
    address: "",
    purchasePrice: "",
    downPayment: "",
    monthlyRevenue: "",
    monthlyExpenses: "",
    numWashers: "",
    numDryers: "",
    squareFeet: "",
    loanType: "sba-7a",
    ownerExperience: "",
    businessDescription: "",
  });
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // Check for payment success from URL params and verify with backend
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const paymentStatus = params.get("payment");
    const sessionId = params.get("session_id");
    
    // Restore form data from sessionStorage
    const savedData = sessionStorage.getItem("businessPlanFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    
    if (paymentStatus === "success" && sessionId) {
      // Verify payment with backend before allowing generation
      const verifyPayment = async () => {
        try {
          const res = await apiRequest("POST", "/api/business-plan/verify-payment", { sessionId });
          const response = await res.json();
          
          if (response.verified) {
            setIsPaid(true);
            setVerifiedSessionId(sessionId);
            setStep(3);
            toast({
              title: "Payment Successful!",
              description: "You can now generate your business plan.",
            });
          } else {
            toast({
              title: "Payment Verification Failed",
              description: "Your payment could not be verified. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast({
            title: "Verification Error",
            description: "Unable to verify payment. Please contact support.",
            variant: "destructive",
          });
        }
      };
      verifyPayment();
      // Clear the URL params
      window.history.replaceState({}, "", "/business-plan-generator");
    } else if (paymentStatus === "cancelled") {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again when ready.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/business-plan-generator");
    }
  }, [searchString, toast]);

  const generateMutation = useMutation({
    mutationFn: async (data: BusinessPlanData & { sessionId: string }) => {
      const response = await apiRequest("POST", "/api/business-plan/generate", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      setGeneratedPlan(data.plan);
      setStep(4);
      sessionStorage.removeItem("businessPlanFormData");
      toast({
        title: "Business Plan Generated!",
        description: "Your SBA-ready business plan is ready for download.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof BusinessPlanData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    try {
      // Save form data to sessionStorage before redirecting
      sessionStorage.setItem("businessPlanFormData", JSON.stringify(formData));
      
      const response = await apiRequest("POST", "/api/business-plan/create-checkout", {
        businessName: formData.businessName,
      });
      
      const data = await response.json();
      
      // Use the checkout URL directly (Stripe's new approach)
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = () => {
    if (!isPaid) {
      handlePayment();
    } else {
      generateMutation.mutate(formData);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-4" data-testid="badge-premium">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Premium Tool
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="text-title">
              AI Business Plan Generator
            </h1>
            
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6" data-testid="text-subtitle">
              Generate a complete, SBA-ready business plan in minutes. 
              Professional financial projections, market analysis, and everything lenders require.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Ready in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>SBA-compliant format</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-500" />
                <span>PDF & Word export</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      {step < 4 && (
        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
              <span>Step {step} of 3</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-bar" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Step 1: Business Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Business Details</h2>
                  <p className="text-sm text-slate-400">Tell us about the laundromat</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-white">Business Name</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="e.g., Sunshine Laundromat"
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    data-testid="input-business-name"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <Label className="text-white">Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main St, City, State ZIP"
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    data-testid="input-address"
                  />
                </div>

                <div>
                  <Label className="text-white">Square Feet</Label>
                  <Input
                    type="number"
                    value={formData.squareFeet}
                    onChange={(e) => handleInputChange("squareFeet", e.target.value)}
                    placeholder="2,500"
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    data-testid="input-sqft"
                  />
                </div>

                <div>
                  <Label className="text-white">Number of Washers</Label>
                  <Input
                    type="number"
                    value={formData.numWashers}
                    onChange={(e) => handleInputChange("numWashers", e.target.value)}
                    placeholder="20"
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    data-testid="input-washers"
                  />
                </div>

                <div>
                  <Label className="text-white">Number of Dryers</Label>
                  <Input
                    type="number"
                    value={formData.numDryers}
                    onChange={(e) => handleInputChange("numDryers", e.target.value)}
                    placeholder="20"
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    data-testid="input-dryers"
                  />
                </div>

                <div>
                  <Label className="text-white">Your Experience</Label>
                  <Select
                    value={formData.ownerExperience}
                    onValueChange={(value) => handleInputChange("ownerExperience", value)}
                  >
                    <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white" data-testid="select-experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">First-time buyer</SelectItem>
                      <SelectItem value="business">Business owner (other industry)</SelectItem>
                      <SelectItem value="laundry-1-3">1-3 years laundromat experience</SelectItem>
                      <SelectItem value="laundry-3+">3+ years laundromat experience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-white">Business Description (Optional)</Label>
                  <Textarea
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                    placeholder="Brief description of the business, location advantages, services offered..."
                    className="mt-1 bg-white/10 border-white/20 text-white min-h-[100px]"
                    data-testid="textarea-description"
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                size="lg"
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                data-testid="button-next-1"
              >
                Continue to Financials
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Financial Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Financial Details</h2>
                  <p className="text-sm text-slate-400">Purchase price and operating numbers</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Purchase Price</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                      placeholder="350,000"
                      className="pl-9 bg-white/10 border-white/20 text-white"
                      data-testid="input-purchase-price"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Down Payment</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) => handleInputChange("downPayment", e.target.value)}
                      placeholder="70,000"
                      className="pl-9 bg-white/10 border-white/20 text-white"
                      data-testid="input-down-payment"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Monthly Revenue</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="number"
                      value={formData.monthlyRevenue}
                      onChange={(e) => handleInputChange("monthlyRevenue", e.target.value)}
                      placeholder="25,000"
                      className="pl-9 bg-white/10 border-white/20 text-white"
                      data-testid="input-monthly-revenue"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Monthly Expenses</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="number"
                      value={formData.monthlyExpenses}
                      onChange={(e) => handleInputChange("monthlyExpenses", e.target.value)}
                      placeholder="15,000"
                      className="pl-9 bg-white/10 border-white/20 text-white"
                      data-testid="input-monthly-expenses"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-white">Loan Type</Label>
                  <Select
                    value={formData.loanType}
                    onValueChange={(value) => handleInputChange("loanType", value)}
                  >
                    <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white" data-testid="select-loan-type">
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sba-7a">SBA 7(a) Loan</SelectItem>
                      <SelectItem value="sba-504">SBA 504 Loan</SelectItem>
                      <SelectItem value="conventional">Conventional Bank Loan</SelectItem>
                      <SelectItem value="seller-financing">Seller Financing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-white/20 text-white"
                  data-testid="button-back-2"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  data-testid="button-next-2"
                >
                  Review & Generate
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Review & Payment */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">Review Your Information</h2>
              
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-slate-400">Business Name</span>
                  <p className="text-white font-medium">{formData.businessName || "Not specified"}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-slate-400">Address</span>
                  <p className="text-white font-medium">{formData.address || "Not specified"}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-slate-400">Purchase Price</span>
                  <p className="text-white font-medium">${Number(formData.purchasePrice).toLocaleString() || "0"}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-slate-400">Monthly Revenue</span>
                  <p className="text-white font-medium">${Number(formData.monthlyRevenue).toLocaleString() || "0"}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-slate-400">Equipment</span>
                  <p className="text-white font-medium">{formData.numWashers} washers, {formData.numDryers} dryers</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-slate-400">Loan Type</span>
                  <p className="text-white font-medium capitalize">{formData.loanType.replace("-", " ")}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Generate Your Business Plan</h3>
                  <p className="text-slate-400 mb-4">
                    Your complete, SBA-ready business plan will include all sections required by lenders.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {FEATURES.slice(0, 4).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {feature.title}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  {!isPaid ? (
                    <>
                      <p className="text-4xl font-bold text-white mb-1">$299</p>
                      <p className="text-sm text-slate-400 mb-4">One-time purchase</p>
                      <Button
                        onClick={handlePayment}
                        size="lg"
                        disabled={isProcessingPayment}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-8"
                        data-testid="button-pay"
                      >
                        {isProcessingPayment ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay $299 & Generate
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-slate-500 mt-2">
                        <Lock className="w-3 h-3 inline mr-1" />
                        Secure payment via Stripe
                      </p>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-3">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Payment Complete
                      </Badge>
                      <Button
                        onClick={() => {
                          if (verifiedSessionId) {
                            generateMutation.mutate({ ...formData, sessionId: verifiedSessionId });
                          } else {
                            toast({
                              title: "Session Expired",
                              description: "Please complete payment again.",
                              variant: "destructive",
                            });
                          }
                        }}
                        size="lg"
                        disabled={generateMutation.isPending || !verifiedSessionId}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8"
                        data-testid="button-generate"
                      >
                        {generateMutation.isPending ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate My Plan
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="border-white/20 text-white"
              data-testid="button-back-3"
            >
              Back to Edit
            </Button>
          </motion.div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Business Plan is Ready!</h2>
              <p className="text-slate-400 mb-6">
                Download your complete, SBA-ready business plan below.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-amber-600"
                  data-testid="button-download-pdf"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white"
                  data-testid="button-download-word"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Word
                </Button>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4">What's Included</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{feature.title}</p>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="text-white font-medium">Review Your Business Plan</p>
                    <p className="text-sm text-slate-400">Customize any sections to match your vision</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="text-white font-medium">Apply for Financing</p>
                    <p className="text-sm text-slate-400">Submit to SBA lenders with confidence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="text-white font-medium">Close Your Deal</p>
                    <p className="text-sm text-slate-400">Start building your laundromat empire</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation("/funding-matcher")}
                className="border-white/20 text-white"
                data-testid="button-find-lenders"
              >
                Find SBA Lenders
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/larry-larsen")}
                className="border-white/20 text-white"
                data-testid="button-expert-review"
              >
                Get Expert Review
              </Button>
            </div>
          </motion.div>
        )}

        {/* Features Grid (shown on step 1) */}
        {step === 1 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white text-center mb-6">What's Included in Your Business Plan</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((feature, i) => (
                <Card key={i} className="bg-white/5 border-white/10 p-4">
                  <feature.icon className="w-8 h-8 text-amber-400 mb-3" />
                  <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {step === 1 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white text-center mb-6">What Buyers Are Saying</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {TESTIMONIALS.map((testimonial, i) => (
                <Card key={i} className="bg-white/5 border-white/10 p-6">
                  <p className="text-slate-300 mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
