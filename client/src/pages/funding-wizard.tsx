import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, Building2, ArrowRight, ArrowLeft, CheckCircle2, 
  Shield, Zap, Clock, Star, User, MapPin, CreditCard, FileText,
  Loader2, Sparkles, TrendingUp, AlertCircle, Briefcase, PiggyBank
} from "lucide-react";

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const AADVANTAGE_STATES = ["Texas", "Oklahoma", "Louisiana", "Arkansas"];

interface FormData {
  fundingType: string[];
  fundingAmount: number;
  timeline: string;
  businessStage: string;
  annualRevenue: string;
  creditScore: string;
  state: string;
  name: string;
  email: string;
  phone: string;
  additionalInfo: string;
}

const initialFormData: FormData = {
  fundingType: [],
  fundingAmount: 250000,
  timeline: "",
  businessStage: "",
  annualRevenue: "",
  creditScore: "",
  state: "",
  name: "",
  email: "",
  phone: "",
  additionalInfo: ""
};

type PartnerMatch = {
  name: string;
  type: string;
  matchScore: number;
  reason: string;
  specialFeature: string;
  link: string;
};

export default function FundingWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedPartners, setMatchedPartners] = useState<PartnerMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const updateFormData = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleFundingType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      fundingType: prev.fundingType.includes(type)
        ? prev.fundingType.filter(t => t !== type)
        : [...prev.fundingType, type]
    }));
  };

  const calculateMatches = (): PartnerMatch[] => {
    const matches: PartnerMatch[] = [];
    const isStartup = formData.businessStage === "startup";
    const isEstablished = formData.businessStage === "established";
    const hasLowCredit = formData.creditScore === "500-600";
    const hasGoodCredit = formData.creditScore === "701+";
    const isEquipmentFocused = formData.fundingType.includes("equipment");
    const isAcquisition = formData.fundingType.includes("acquisition");
    const isInAAdvantageState = AADVANTAGE_STATES.includes(formData.state);
    const isLargeLoan = formData.fundingAmount >= 1000000;

    if (isStartup && hasGoodCredit) {
      matches.push({
        name: "Preferred Funding Group",
        type: "Personal Credit Loans + Business Credit",
        matchScore: 95,
        reason: "Perfect for startups with strong personal credit. No business history needed.",
        specialFeature: "Up to $500K with no collateral required",
        link: "/funding/preferred-funding-group"
      });
    }

    if (isStartup || hasLowCredit) {
      matches.push({
        name: "GoKapital",
        type: "Startup Business Credit",
        matchScore: hasLowCredit ? 90 : 80,
        reason: "Works with 500+ credit scores. Fast 24-48hr approval.",
        specialFeature: "A+ BBB rating, 500+ laundromats funded",
        link: "/funding/gokapital"
      });
    }

    if (isAcquisition || isEstablished) {
      matches.push({
        name: "South End Capital",
        type: "Preferred SBA Lender",
        matchScore: isLargeLoan ? 85 : 95,
        reason: "$0 SBA guarantee fees up to $1M through 2025.",
        specialFeature: "Same-day approval, story-based underwriting",
        link: "/funding/south-end-capital"
      });
    }

    if (isLargeLoan && isAcquisition) {
      matches.push({
        name: "National Business Capital",
        type: "Large Acquisitions ($1M+)",
        matchScore: 92,
        reason: "Access 75+ lenders through one application.",
        specialFeature: "Dedicated acquisition advisor",
        link: "/funding/national-business-capital"
      });
    }

    if (isEquipmentFocused) {
      matches.push({
        name: "ROK Financial",
        type: "Fast Equipment Lending",
        matchScore: 88,
        reason: "80% faster processing than traditional banks.",
        specialFeature: "Same-day funding available",
        link: "/funding/rok-financial"
      });
    }

    if (isEquipmentFocused && isInAAdvantageState) {
      matches.push({
        name: "AAdvantage Laundry Systems",
        type: "Turnkey Equipment + Financing",
        matchScore: 97,
        reason: "Dexter/Continental equipment with built-in financing in your state.",
        specialFeature: "Complete turnkey packages $500K-$1M+",
        link: "/equipment-marketplace"
      });
    }

    if (formData.fundingType.includes("working-capital")) {
      matches.push({
        name: "ROK Financial",
        type: "Revenue-Based Financing",
        matchScore: 82,
        reason: "Quick working capital based on revenue, not credit.",
        specialFeature: "Approval in 4 hours",
        link: "/funding/rok-financial"
      });
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const matches = calculateMatches();
    setMatchedPartners(matches);
    setShowResults(true);
    setIsSubmitting(false);
    
    toast({
      title: "Application Received!",
      description: `We've matched you with ${matches.length} funding partners based on your profile.`
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.fundingType.length > 0 && formData.timeline;
      case 2: return formData.businessStage && formData.annualRevenue;
      case 3: return formData.creditScore && formData.state;
      case 4: return formData.name && formData.email && formData.phone;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">
                What are you funding? (Select all that apply)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "startup", label: "New Build / Startup", icon: PiggyBank },
                  { id: "acquisition", label: "Acquisition", icon: Briefcase },
                  { id: "equipment", label: "Equipment Upgrade", icon: Building2 },
                  { id: "refinance", label: "Refinance", icon: TrendingUp },
                  { id: "working-capital", label: "Working Capital", icon: DollarSign },
                  { id: "expansion", label: "Expansion", icon: Sparkles }
                ].map(type => (
                  <div
                    key={type.id}
                    onClick={() => toggleFundingType(type.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.fundingType.includes(type.id)
                        ? "border-[#C8A661] bg-[#C8A661]/10"
                        : "border-border hover:border-[#C8A661]/50"
                    }`}
                    data-testid={`checkbox-funding-type-${type.id}`}
                  >
                    <type.icon className={`w-5 h-5 ${formData.fundingType.includes(type.id) ? "text-[#C8A661]" : "text-muted-foreground"}`} />
                    <span className="font-medium">{type.label}</span>
                    {formData.fundingType.includes(type.id) && (
                      <CheckCircle2 className="w-4 h-4 text-[#C8A661] ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-4 block">
                How much funding do you need?
              </Label>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-[#C8A661] text-center">
                  ${formData.fundingAmount.toLocaleString()}
                </div>
                <Slider
                  value={[formData.fundingAmount]}
                  onValueChange={([value]) => updateFormData("fundingAmount", value)}
                  min={10000}
                  max={5000000}
                  step={10000}
                  className="py-4"
                  data-testid="slider-funding-amount"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$10K</span>
                  <span>$5M+</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-4 block">
                When do you need funding?
              </Label>
              <RadioGroup
                value={formData.timeline}
                onValueChange={(value) => updateFormData("timeline", value)}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { value: "asap", label: "ASAP", icon: Zap },
                  { value: "30-60", label: "30-60 Days", icon: Clock },
                  { value: "90+", label: "90+ Days", icon: Clock }
                ].map(option => (
                  <div key={option.value}>
                    <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                    <Label
                      htmlFor={option.value}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-[#C8A661] peer-data-[state=checked]:bg-[#C8A661]/10 hover:border-[#C8A661]/50"
                      data-testid={`radio-timeline-${option.value}`}
                    >
                      <option.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Business Stage
              </Label>
              <RadioGroup
                value={formData.businessStage}
                onValueChange={(value) => updateFormData("businessStage", value)}
                className="grid grid-cols-1 gap-3"
              >
                {[
                  { value: "startup", label: "Startup / No Revenue Yet", desc: "First-time buyer or building from scratch" },
                  { value: "operating-under-2", label: "Operating < 2 Years", desc: "Established but building history" },
                  { value: "established", label: "Established 2+ Years", desc: "Proven track record with financials" }
                ].map(option => (
                  <div key={option.value}>
                    <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                    <Label
                      htmlFor={option.value}
                      className="flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-[#C8A661] peer-data-[state=checked]:bg-[#C8A661]/10 hover:border-[#C8A661]/50"
                      data-testid={`radio-stage-${option.value}`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold mb-4 block">
                Current/Projected Annual Revenue
              </Label>
              <Select value={formData.annualRevenue} onValueChange={(value) => updateFormData("annualRevenue", value)}>
                <SelectTrigger data-testid="select-annual-revenue">
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Revenue Yet</SelectItem>
                  <SelectItem value="under-100k">Under $100K</SelectItem>
                  <SelectItem value="100k-250k">$100K - $250K</SelectItem>
                  <SelectItem value="250k-500k">$250K - $500K</SelectItem>
                  <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                  <SelectItem value="1m+">$1M+</SelectItem>
                </SelectContent>
              </Select>
              {formData.businessStage === "startup" && (
                <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  No business history? We have startup-friendly options up to $750K combined!
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Personal Credit Score (Estimate)
              </Label>
              <RadioGroup
                value={formData.creditScore}
                onValueChange={(value) => updateFormData("creditScore", value)}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { value: "500-600", label: "500-600", color: "text-amber-500" },
                  { value: "601-700", label: "601-700", color: "text-[#C8A661]" },
                  { value: "701+", label: "701+", color: "text-green-500" }
                ].map(option => (
                  <div key={option.value}>
                    <RadioGroupItem value={option.value} id={`credit-${option.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`credit-${option.value}`}
                      className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-[#C8A661] peer-data-[state=checked]:bg-[#C8A661]/10 hover:border-[#C8A661]/50"
                      data-testid={`radio-credit-${option.value}`}
                    >
                      <CreditCard className={`w-5 h-5 mb-1 ${option.color}`} />
                      <span className="font-bold">{option.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold mb-4 block">
                Location (State)
              </Label>
              <Select value={formData.state} onValueChange={(value) => updateFormData("state", value)}>
                <SelectTrigger data-testid="select-state">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                      {AADVANTAGE_STATES.includes(state) && " ⭐"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {AADVANTAGE_STATES.includes(formData.state) && (
                <p className="mt-2 text-sm text-[#C8A661] flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" />
                  AAdvantage Laundry Systems coverage! Turnkey equipment packages available.
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-semibold">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="John Smith"
                className="mt-2"
                data-testid="input-name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="john@example.com"
                className="mt-2"
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-2"
                data-testid="input-phone"
              />
            </div>

            <div>
              <Label htmlFor="additional" className="text-base font-semibold">
                Additional Information (Optional)
              </Label>
              <textarea
                id="additional"
                value={formData.additionalInfo}
                onChange={(e) => updateFormData("additionalInfo", e.target.value)}
                placeholder="Tell us more about your laundromat project..."
                className="mt-2 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                data-testid="textarea-additional-info"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Review Your Information</h3>
              <p className="text-muted-foreground">Confirm your details before we match you with lenders</p>
            </div>

            <div className="grid gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Funding Needs</div>
                <div className="font-semibold">
                  ${formData.fundingAmount.toLocaleString()} for {formData.fundingType.join(", ")}
                </div>
                <div className="text-sm text-muted-foreground">Timeline: {formData.timeline}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Business Profile</div>
                <div className="font-semibold">{formData.businessStage}</div>
                <div className="text-sm text-muted-foreground">Revenue: {formData.annualRevenue}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Qualifications</div>
                <div className="font-semibold">Credit Score: {formData.creditScore}</div>
                <div className="text-sm text-muted-foreground">Location: {formData.state}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Contact</div>
                <div className="font-semibold">{formData.name}</div>
                <div className="text-sm text-muted-foreground">{formData.email} | {formData.phone}</div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[#C8A661]/30 bg-[#C8A661]/5">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Your information is secure</p>
                  <p className="text-muted-foreground">We only share your details with matched funding partners. No spam, ever.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <>
        <SEO
          title="Your Funding Matches | WashBizHub Funding Wizard"
          description="View your matched laundromat funding partners based on your profile."
          canonicalUrl="/funding-wizard"
        />
        <div className="min-h-screen bg-background py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                You're Matched with {matchedPartners.length} Partners!
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Based on your profile, here are your best funding options ranked by match score.
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              {matchedPartners.map((partner, index) => (
                <Card key={partner.name} className={`border-2 ${index === 0 ? "border-[#C8A661]" : "border-border"}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {index === 0 && (
                            <Badge className="bg-[#C8A661] text-white">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Best Match
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-green-500 border-green-500/30">
                            {partner.matchScore}% Match
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{partner.name}</h3>
                        <p className="text-sm text-[#C8A661] mb-2">{partner.type}</p>
                        <p className="text-muted-foreground mb-3">{partner.reason}</p>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#C8A661]" />
                          <span className="text-sm font-medium">{partner.specialFeature}</span>
                        </div>
                      </div>
                      <Button asChild className="flex-shrink-0">
                        <Link href={partner.link} data-testid={`button-partner-${partner.name.toLowerCase().replace(/\s+/g, '-')}`}>
                          Apply Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">87%</div>
                  <div className="text-sm text-muted-foreground">Avg approval rate</div>
                </CardContent>
              </Card>
              <Card className="border-[#C8A661]/20 bg-[#C8A661]/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#C8A661]">14 days</div>
                  <div className="text-sm text-muted-foreground">Avg funding time</div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">$0</div>
                  <div className="text-sm text-muted-foreground">Application fees</div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Want personalized guidance? Our experts can help you navigate the funding process.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/funding" data-testid="link-all-partners">
                    View All Partners
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/ai-council" data-testid="link-ai-council">
                    <Star className="w-4 h-4 mr-2" />
                    Talk to AI Council
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Funding Wizard | Get Matched with Laundromat Lenders | WashBizHub"
        description="Answer a few questions and get matched with WashBizHub's 7 pre-vetted lending partners. Up to $50M funding, rates from 0.5-2%, 500+ credit OK."
        canonicalUrl="/funding-wizard"
      />
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-[#C8A661]/50 text-[#C8A661]">
              <Sparkles className="w-3 h-3 mr-1" />
              Pre-Vetted Partners Only
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Get Matched with Funding Partners
            </h1>
            <p className="text-lg text-muted-foreground">
              5-minute questionnaire • Up to $50M • Rates from 0.5-2%
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Funding Needs"}
                {step === 2 && "Business Profile"}
                {step === 3 && "Personal Qualifications"}
                {step === 4 && "Contact Information"}
                {step === 5 && "Review & Submit"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us what you're looking to fund"}
                {step === 2 && "Help us understand your business"}
                {step === 3 && "A few quick qualification questions"}
                {step === 4 && "How can our partners reach you?"}
                {step === 5 && "Almost there! Review your information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {step < totalSteps ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    data-testid="button-next"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-[#C8A661] hover:bg-[#B8963D]"
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Finding Matches...
                      </>
                    ) : (
                      <>
                        Get My Matches
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>No credit check</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C8A661]" />
              <span>24-48hr approvals</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <span>$0 application fees</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
