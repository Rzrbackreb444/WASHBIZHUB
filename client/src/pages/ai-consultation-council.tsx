import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SEO } from "@/components/SEO";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Users,
  Zap,
  TrendingUp,
  AlertTriangle,
  Shield,
  Target,
  DollarSign,
  MapPin,
  Building2,
  Calculator,
  Clock,
  Star,
  ChevronRight,
  FileText,
  BarChart3,
  Bot,
  Loader2,
  ArrowRight,
  Crown,
  Sparkles
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface ConsultationTier {
  id: string;
  name: string;
  price: number;
  popular?: boolean;
  features: string[];
  includes: Record<string, boolean | number>;
  turnaround: string;
}

interface ExpertAnalysis {
  expert: {
    name: string;
    title: string;
    expertise: string;
    icon: string;
  };
  analysis: string;
  keyFindings: string[];
  recommendation?: string;
  confidence?: number;
}

interface ConsultationResult {
  sessionId: string;
  address: string;
  timestamp: string;
  tier: ConsultationTier;
  calculatorResults: {
    cleanbi: { score: number; grade: string; factors: Record<string, number> };
    valuation: { estimatedValue: number; multiple: number };
    roi: { annualROI: number; monthlyROI: number };
    breakeven: { months: number; years: number };
  };
  expertAnalyses: ExpertAnalysis[];
  finalRecommendation: {
    verdict: string;
    confidence: number;
    summary: string;
    keyStrengths: string[];
    keyRisks: string[];
    actionItems: string[];
  };
  daveMenzReview?: {
    expert: { name: string; title: string; company: string };
    analysis: string;
  };
  competitionHeatmap?: {
    competitors: any[];
    marketSaturation: number;
  };
  pricingStrategy?: {
    recommendations: any[];
    projectedRevenueIncrease: number;
  };
  totalCost: number;
}

const EXPERT_ICONS: Record<string, any> = {
  marketAnalyst: BarChart3,
  financialAnalyst: DollarSign,
  operationsExpert: Building2,
  riskAssessor: AlertTriangle,
  strategicAdvisor: Target,
  daveMenz: Crown,
};

const VERDICT_COLORS: Record<string, string> = {
  "STRONG BUY": "bg-green-500",
  "BUY": "bg-green-400",
  "HOLD": "bg-yellow-500",
  "CAUTION": "bg-orange-500",
  "AVOID": "bg-red-500",
};

const FORM_STORAGE_KEY = "consultation_form_data";
const TIER_STORAGE_KEY = "consultation_selected_tier";

export default function AIConsultationCouncil() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [selectedTier, setSelectedTier] = useState<string>("professional");
  const [step, setStep] = useState<"select" | "input" | "processing" | "results">("select");
  const [consultationResult, setConsultationResult] = useState<ConsultationResult | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    lat: "",
    lng: "",
    population: "",
    medianIncome: "",
    competitors: "",
    rentPerSqFt: "",
    squareFootage: "",
    walkScore: "",
    trafficCount: "",
    monthlyRevenue: "",
    monthlyRent: "",
    monthlyExpenses: "",
    askingPrice: "",
    downPaymentPercent: "20",
    loanRate: "7.5",
    loanTerm: "10",
    washers: "",
    dryers: "",
    equipmentAge: "",
    additionalContext: "",
  });

  const { data: tiers, isLoading: tiersLoading } = useQuery<ConsultationTier[]>({
    queryKey: ["/api/consultation-council/tiers"],
  });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const sessionId = params.get("session_id");
    const success = params.get("success");

    if (sessionId && success === "true" && !paymentVerified) {
      setPaymentVerified(true);

      const savedFormData = sessionStorage.getItem(FORM_STORAGE_KEY);
      const savedTier = sessionStorage.getItem(TIER_STORAGE_KEY);

      if (savedFormData && savedTier) {
        const parsedFormData = JSON.parse(savedFormData);
        setFormData(parsedFormData);
        setSelectedTier(savedTier);
        setStep("processing");
        setProcessingProgress(0);

        toast({
          title: "Payment Successful",
          description: "Starting your AI Consultation Council analysis...",
        });

        const progressInterval = setInterval(() => {
          setProcessingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 15;
          });
        }, 500);

        consultationMutation.mutate({ ...parsedFormData, tier: savedTier });

        sessionStorage.removeItem(FORM_STORAGE_KEY);
        sessionStorage.removeItem(TIER_STORAGE_KEY);

        navigate("/ai-consultation", { replace: true });
      } else {
        toast({
          title: "Session Expired",
          description: "Please fill in your property details again.",
          variant: "destructive",
        });
        setStep("select");
      }
    }

    if (params.get("canceled") === "true") {
      toast({
        title: "Payment Canceled",
        description: "Your consultation was not purchased.",
        variant: "destructive",
      });
      const savedTier = sessionStorage.getItem(TIER_STORAGE_KEY);
      if (savedTier) setSelectedTier(savedTier);
      setStep("input");
      navigate("/ai-consultation", { replace: true });
    }
  }, [searchString, paymentVerified, navigate, toast]);

  const consultationMutation = useMutation({
    mutationFn: async (data: typeof formData & { tier: string }) => {
      const response = await apiRequest("POST", "/api/consultation-council/tiered", {
        tier: data.tier,
        address: data.address,
        lat: parseFloat(data.lat) || undefined,
        lng: parseFloat(data.lng) || undefined,
        population: parseInt(data.population) || undefined,
        medianIncome: parseInt(data.medianIncome) || undefined,
        competitors: parseInt(data.competitors) || undefined,
        rentPerSqFt: parseFloat(data.rentPerSqFt) || undefined,
        squareFootage: parseInt(data.squareFootage) || undefined,
        walkScore: parseInt(data.walkScore) || undefined,
        trafficCount: parseInt(data.trafficCount) || undefined,
        monthlyRevenue: parseInt(data.monthlyRevenue) || undefined,
        monthlyRent: parseInt(data.monthlyRent) || undefined,
        monthlyExpenses: parseInt(data.monthlyExpenses) || undefined,
        askingPrice: parseInt(data.askingPrice) || undefined,
        downPaymentPercent: parseInt(data.downPaymentPercent) || undefined,
        loanRate: parseFloat(data.loanRate) || undefined,
        loanTerm: parseInt(data.loanTerm) || undefined,
        washers: parseInt(data.washers) || undefined,
        dryers: parseInt(data.dryers) || undefined,
        equipmentAge: parseInt(data.equipmentAge) || undefined,
        additionalContext: data.additionalContext || undefined,
      });
      return response.json();
    },
    onSuccess: (result) => {
      setConsultationResult(result);
      setStep("results");
      toast({
        title: "Analysis Complete",
        description: `Your ${result.tier.name} consultation is ready!`,
      });
    },
    onError: (error: Error) => {
      setStep("input");
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const response = await apiRequest("POST", "/api/consultation-council/checkout", {
        tierId,
        address: formData.address,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
          if (error) {
            toast({ title: "Payment Error", description: error.message, variant: "destructive" });
          }
        } else {
          toast({
            title: "Payment Configuration Error",
            description: "Stripe is not configured correctly. Please contact support.",
            variant: "destructive",
          });
        }
      }
    },
    onError: (error: Error) => {
      toast({ title: "Checkout Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartAnalysis = () => {
    if (!formData.address) {
      toast({ title: "Address Required", description: "Please enter the property address", variant: "destructive" });
      return;
    }

    setStep("processing");
    setProcessingProgress(0);

    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    consultationMutation.mutate({ ...formData, tier: selectedTier });
  };

  const handlePurchase = (tierId: string) => {
    setSelectedTier(tierId);
    setStep("input");
  };

  const handleProceedToCheckout = () => {
    if (!formData.address) {
      toast({ title: "Address Required", description: "Please enter the property address", variant: "destructive" });
      return;
    }

    const tier = tiers?.find(t => t.id === selectedTier);
    if (tier && tier.price > 0) {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
      sessionStorage.setItem(TIER_STORAGE_KEY, selectedTier);
      checkoutMutation.mutate(selectedTier);
    } else {
      handleStartAnalysis();
    }
  };

  const selectedTierData = tiers?.find(t => t.id === selectedTier);

  return (
    <>
      <SEO
        title="AI Consultation Council | Expert Laundromat Analysis | WashBizHub"
        description="Get instant expert analysis from our AI Council of 6 specialists. CLEANBI scoring, competition heatmaps, Dave Menz review, and actionable recommendations starting at $49."
        canonicalUrl="/ai-consultation"
        keywords={["laundromat analysis", "AI consultation", "business valuation", "CLEANBI", "Dave Menz"]}
      />

      <div className="min-h-screen bg-background">
        {step === "select" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="secondary">
                <Bot className="w-3 h-3 mr-1" />
                Powered by Multi-AI Orchestration
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-page-title">
                AI Consultation Council
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
                Get instant expert analysis from our council of 6 AI specialists
              </p>
              <p className="text-muted-foreground">
                Traditional consulting: <span className="line-through">$5,000 - $10,000</span> | Our AI Council: <span className="text-accent font-bold">$49 - $999</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {tiersLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-32 bg-muted" />
                    <CardContent className="h-48 bg-muted/50" />
                  </Card>
                ))
              ) : (
                tiers?.map((tier) => (
                  <Card
                    key={tier.id}
                    className={`relative flex flex-col transition-all ${
                      selectedTier === tier.id ? "ring-2 ring-accent" : ""
                    } ${tier.popular ? "border-accent" : ""}`}
                    data-testid={`card-tier-${tier.id}`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-accent text-accent-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pt-8">
                      <CardTitle className="flex items-center gap-2">
                        {tier.id === "premium" && <Crown className="w-5 h-5 text-yellow-500" />}
                        {tier.name}
                      </CardTitle>
                      <CardDescription className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">${tier.price}</span>
                        <span className="text-muted-foreground">one-time</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="w-4 h-4" />
                        <span>Delivery: {tier.turnaround}</span>
                      </div>
                      <ul className="space-y-2">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full gap-2"
                        variant={tier.popular ? "default" : "outline"}
                        onClick={() => handlePurchase(tier.id)}
                        data-testid={`button-select-${tier.id}`}
                      >
                        {tier.price === 0 ? "Start Free Analysis" : `Get ${tier.name}`}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>

            <div className="bg-muted/50 border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Meet Your AI Council</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: "Dr. Sarah Chen", title: "Market Analyst", icon: BarChart3 },
                  { name: "Michael Torres", title: "Financial Analyst", icon: DollarSign },
                  { name: "James Williams", title: "Operations Expert", icon: Building2 },
                  { name: "Dr. Emily Rodriguez", title: "Risk Assessor", icon: AlertTriangle },
                  { name: "Robert Anderson", title: "Strategic Advisor", icon: Target },
                  { name: "Dave Menz", title: "Laundromat123.com", icon: Crown },
                ].map((expert) => (
                  <div key={expert.name} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
                      <expert.icon className="w-8 h-8 text-accent" />
                    </div>
                    <p className="font-medium text-sm">{expert.name}</p>
                    <p className="text-xs text-muted-foreground">{expert.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "input" && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <Button
              variant="ghost"
              onClick={() => setStep("select")}
              className="mb-6"
              data-testid="button-back-to-tiers"
            >
              <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
              Back to tier selection
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Property Analysis Form</CardTitle>
                    <CardDescription>
                      {selectedTierData?.name} - ${selectedTierData?.price}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedTierData?.turnaround}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="address" className="text-base font-medium">
                      Property Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street, City, State 12345"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="mt-1"
                      data-testid="input-address"
                    />
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="financial">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Financial Information
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2 gap-4 pt-4">
                        <div>
                          <Label htmlFor="askingPrice">Asking Price ($)</Label>
                          <Input
                            id="askingPrice"
                            type="number"
                            placeholder="500000"
                            value={formData.askingPrice}
                            onChange={(e) => handleInputChange("askingPrice", e.target.value)}
                            data-testid="input-asking-price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthlyRevenue">Monthly Revenue ($)</Label>
                          <Input
                            id="monthlyRevenue"
                            type="number"
                            placeholder="25000"
                            value={formData.monthlyRevenue}
                            onChange={(e) => handleInputChange("monthlyRevenue", e.target.value)}
                            data-testid="input-monthly-revenue"
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                          <Input
                            id="monthlyRent"
                            type="number"
                            placeholder="4500"
                            value={formData.monthlyRent}
                            onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                            data-testid="input-monthly-rent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
                          <Input
                            id="monthlyExpenses"
                            type="number"
                            placeholder="8000"
                            value={formData.monthlyExpenses}
                            onChange={(e) => handleInputChange("monthlyExpenses", e.target.value)}
                            data-testid="input-monthly-expenses"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="equipment">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Equipment & Property
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-3 gap-4 pt-4">
                        <div>
                          <Label htmlFor="washers">Number of Washers</Label>
                          <Input
                            id="washers"
                            type="number"
                            placeholder="30"
                            value={formData.washers}
                            onChange={(e) => handleInputChange("washers", e.target.value)}
                            data-testid="input-washers"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dryers">Number of Dryers</Label>
                          <Input
                            id="dryers"
                            type="number"
                            placeholder="25"
                            value={formData.dryers}
                            onChange={(e) => handleInputChange("dryers", e.target.value)}
                            data-testid="input-dryers"
                          />
                        </div>
                        <div>
                          <Label htmlFor="equipmentAge">Equipment Age (years)</Label>
                          <Input
                            id="equipmentAge"
                            type="number"
                            placeholder="5"
                            value={formData.equipmentAge}
                            onChange={(e) => handleInputChange("equipmentAge", e.target.value)}
                            data-testid="input-equipment-age"
                          />
                        </div>
                        <div>
                          <Label htmlFor="squareFootage">Square Footage</Label>
                          <Input
                            id="squareFootage"
                            type="number"
                            placeholder="2500"
                            value={formData.squareFootage}
                            onChange={(e) => handleInputChange("squareFootage", e.target.value)}
                            data-testid="input-square-footage"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rentPerSqFt">Rent per Sq Ft ($)</Label>
                          <Input
                            id="rentPerSqFt"
                            type="number"
                            step="0.01"
                            placeholder="15.00"
                            value={formData.rentPerSqFt}
                            onChange={(e) => handleInputChange("rentPerSqFt", e.target.value)}
                            data-testid="input-rent-per-sqft"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="location">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location & Demographics
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-3 gap-4 pt-4">
                        <div>
                          <Label htmlFor="population">Population (within 3 mi)</Label>
                          <Input
                            id="population"
                            type="number"
                            placeholder="45000"
                            value={formData.population}
                            onChange={(e) => handleInputChange("population", e.target.value)}
                            data-testid="input-population"
                          />
                        </div>
                        <div>
                          <Label htmlFor="medianIncome">Median Household Income ($)</Label>
                          <Input
                            id="medianIncome"
                            type="number"
                            placeholder="55000"
                            value={formData.medianIncome}
                            onChange={(e) => handleInputChange("medianIncome", e.target.value)}
                            data-testid="input-median-income"
                          />
                        </div>
                        <div>
                          <Label htmlFor="competitors">Competitors within 1 mi</Label>
                          <Input
                            id="competitors"
                            type="number"
                            placeholder="2"
                            value={formData.competitors}
                            onChange={(e) => handleInputChange("competitors", e.target.value)}
                            data-testid="input-competitors"
                          />
                        </div>
                        <div>
                          <Label htmlFor="walkScore">Walk Score (0-100)</Label>
                          <Input
                            id="walkScore"
                            type="number"
                            placeholder="70"
                            value={formData.walkScore}
                            onChange={(e) => handleInputChange("walkScore", e.target.value)}
                            data-testid="input-walk-score"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trafficCount">Daily Traffic Count</Label>
                          <Input
                            id="trafficCount"
                            type="number"
                            placeholder="15000"
                            value={formData.trafficCount}
                            onChange={(e) => handleInputChange("trafficCount", e.target.value)}
                            data-testid="input-traffic-count"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="additional">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Additional Context
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4">
                        <Label htmlFor="additionalContext">Tell us more about this deal</Label>
                        <Textarea
                          id="additionalContext"
                          placeholder="Owner retiring, lease terms, unique features, concerns, etc."
                          value={formData.additionalContext}
                          onChange={(e) => handleInputChange("additionalContext", e.target.value)}
                          className="mt-2 min-h-24"
                          data-testid="textarea-additional-context"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleProceedToCheckout}
                  disabled={!formData.address || consultationMutation.isPending || checkoutMutation.isPending}
                  data-testid="button-start-analysis"
                >
                  {consultationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting to Checkout...
                    </>
                  ) : selectedTierData && selectedTierData.price > 0 ? (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Proceed to Checkout (${selectedTierData.price})
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Start Free Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "processing" && (
          <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="max-w-lg w-full">
              <CardContent className="py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-10 h-10 text-accent animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2">AI Council Convening...</h2>
                <p className="text-muted-foreground mb-6">
                  {selectedTierData?.includes.expertCount || 5} expert AI analysts are reviewing your deal
                </p>
                <Progress value={processingProgress} className="mb-4" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  {processingProgress > 10 && <p className="animate-fade-in">Calculating CLEANBI Score...</p>}
                  {processingProgress > 30 && <p className="animate-fade-in">Running financial projections...</p>}
                  {processingProgress > 50 && <p className="animate-fade-in">Analyzing competition...</p>}
                  {processingProgress > 70 && <p className="animate-fade-in">Synthesizing expert opinions...</p>}
                  {processingProgress > 85 && <p className="animate-fade-in">Generating recommendations...</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "results" && consultationResult && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-results-title">
                  Consultation Results
                </h1>
                <p className="text-muted-foreground">
                  {consultationResult.address} | Session: {consultationResult.sessionId}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("select");
                  setConsultationResult(null);
                }}
                data-testid="button-new-consultation"
              >
                New Consultation
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card className={`${VERDICT_COLORS[consultationResult.finalRecommendation?.verdict ?? "HOLD"]} text-white`}>
                <CardContent className="py-8 text-center">
                  <h2 className="text-lg font-medium opacity-90">AI Council Verdict</h2>
                  <p className="text-4xl font-bold my-2" data-testid="text-verdict">
                    {consultationResult.finalRecommendation?.verdict ?? "Analyzing..."}
                  </p>
                  <p className="text-lg opacity-90">
                    {consultationResult.finalRecommendation?.confidence ?? 0}% Confidence
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-8 text-center">
                  <h2 className="text-lg font-medium text-muted-foreground">CLEANBI Score</h2>
                  <p className="text-4xl font-bold my-2" data-testid="text-cleanbi-score">
                    {consultationResult.calculatorResults?.cleanbi?.score ?? "N/A"}/100
                  </p>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    Grade: {consultationResult.calculatorResults?.cleanbi?.grade ?? "N/A"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-8 text-center">
                  <h2 className="text-lg font-medium text-muted-foreground">Projected ROI</h2>
                  <p className="text-4xl font-bold my-2" data-testid="text-roi">
                    {consultationResult.calculatorResults?.roi?.annualROI?.toFixed(1) ?? "N/A"}%
                  </p>
                  <p className="text-muted-foreground">
                    Breakeven: {consultationResult.calculatorResults?.breakeven?.months ?? "N/A"} months
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 border rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
              <p className="text-muted-foreground mb-6">
                {consultationResult.finalRecommendation?.summary ?? "Analysis in progress..."}
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {(consultationResult.finalRecommendation?.keyStrengths ?? []).map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">+</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Key Risks
                  </h4>
                  <ul className="space-y-2">
                    {(consultationResult.finalRecommendation?.keyRisks ?? []).map((risk, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500">!</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-accent" />
                    Action Items
                  </h4>
                  <ol className="space-y-2">
                    {(consultationResult.finalRecommendation?.actionItems ?? []).map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="font-medium text-accent">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {consultationResult.daveMenzReview && (
              <Card className="mb-8 border-yellow-500/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {consultationResult.daveMenzReview.expert.name}
                        <Badge variant="secondary">Laundromat123.com</Badge>
                      </CardTitle>
                      <CardDescription>30+ years experience | 500+ acquisitions consulted</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {consultationResult.daveMenzReview.analysis}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="experts" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="experts" data-testid="tab-experts">Expert Analyses</TabsTrigger>
                <TabsTrigger value="calculators" data-testid="tab-calculators">Calculator Results</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="experts">
                <div className="grid md:grid-cols-2 gap-4">
                  {(consultationResult.expertAnalyses ?? []).map((expert, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{expert.expert.name}</CardTitle>
                            <CardDescription>{expert.expert.title}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-48">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {expert.analysis.substring(0, 800)}
                            {expert.analysis.length > 800 && "..."}
                          </p>
                        </ScrollArea>
                        {expert.keyFindings.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-medium mb-2">Key Findings:</p>
                            <div className="flex flex-wrap gap-1">
                              {expert.keyFindings.slice(0, 3).map((finding, j) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  {finding.substring(0, 40)}...
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calculators">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Valuation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ${(consultationResult.calculatorResults?.valuation?.estimatedValue ?? 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(consultationResult.calculatorResults?.valuation?.multiple ?? 0).toFixed(1)}x Multiple
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        ROI Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {(consultationResult.calculatorResults?.roi?.annualROI ?? 0).toFixed(1)}% Annual
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(consultationResult.calculatorResults?.roi?.monthlyROI ?? 0).toFixed(2)}% Monthly
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Breakeven
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {consultationResult.calculatorResults?.breakeven?.months ?? "N/A"} months
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(consultationResult.calculatorResults?.breakeven?.years ?? 0).toFixed(1)} years
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        CLEANBI Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {Object.entries(consultationResult.calculatorResults?.cleanbi?.factors || {})
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span>{(value as number)?.toFixed?.(0) ?? value}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced">
                <div className="grid md:grid-cols-2 gap-4">
                  {consultationResult.competitionHeatmap && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Competition Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Competitors Found</span>
                            <Badge variant="secondary">
                              {consultationResult.competitionHeatmap.competitors?.length || 0}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Market Saturation</span>
                            <Badge
                              variant={
                                consultationResult.competitionHeatmap.marketSaturation > 80
                                  ? "destructive"
                                  : consultationResult.competitionHeatmap.marketSaturation > 50
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {consultationResult.competitionHeatmap.marketSaturation}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {consultationResult.pricingStrategy && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Dynamic Pricing Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {(consultationResult.pricingStrategy?.recommendations ?? []).slice(0, 3).map((rec: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{rec?.machineType ?? "N/A"}</span>
                              <span>
                                ${rec?.recommendedBase ?? 0} (Peak: ${rec?.peakPrice ?? 0})
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                AI Processing Cost: ${(consultationResult.totalCost ?? 0).toFixed(4)} |
                Generated: {consultationResult.timestamp ? new Date(consultationResult.timestamp).toLocaleString() : "Just now"}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
