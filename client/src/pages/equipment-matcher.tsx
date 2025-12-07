import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronLeft, Users, Star, Award, Zap, DollarSign, Leaf, Shield, Factory, Wrench, ArrowRight, ExternalLink, CheckCircle2, Target, TrendingUp } from "lucide-react";
import { SiMeta, SiFacebook } from "react-icons/si";
import { Link } from "wouter";

const FB_GROUP_URL = "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry";
const AADVANTAGE_URL = "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

interface EquipmentRecommendation {
  name: string;
  brand: string;
  model: string;
  capacity: string;
  priceRange: string;
  features: string[];
  pros: string[];
  bestFor: string;
  score: number;
}

const STEPS: WizardStep[] = [
  { id: "facility", title: "Facility Size", description: "Tell us about your laundromat" },
  { id: "budget", title: "Budget Range", description: "Investment capacity for equipment" },
  { id: "priorities", title: "Top Priorities", description: "What matters most to you?" },
  { id: "operations", title: "Operations", description: "How do you plan to run your business?" },
  { id: "results", title: "Your Recommendations", description: "Personalized equipment matches" },
];

const FACILITY_SIZES = [
  { value: "small", label: "Small (Under 1,500 sq ft)", machines: "8-15 machines", description: "Neighborhood laundromat" },
  { value: "medium", label: "Medium (1,500-3,000 sq ft)", machines: "16-30 machines", description: "Community-serving" },
  { value: "large", label: "Large (3,000-5,000 sq ft)", machines: "31-50 machines", description: "High-traffic location" },
  { value: "mega", label: "Mega (5,000+ sq ft)", machines: "50+ machines", description: "Multi-service facility" },
];

const BUDGET_RANGES = [
  { value: "starter", label: "$50,000 - $150,000", description: "New owner budget" },
  { value: "growth", label: "$150,000 - $300,000", description: "Expansion investment" },
  { value: "premium", label: "$300,000 - $500,000", description: "Premium buildout" },
  { value: "enterprise", label: "$500,000+", description: "Full-scale operation" },
];

const PRIORITY_OPTIONS = [
  { id: "energy", label: "Energy Efficiency", icon: Leaf, description: "Lower utility costs" },
  { id: "durability", label: "Durability & Lifespan", icon: Shield, description: "30+ year equipment life" },
  { id: "speed", label: "Cycle Speed", icon: Zap, description: "Higher throughput" },
  { id: "capacity", label: "Large Capacity", icon: Factory, description: "Handle bulky items" },
  { id: "maintenance", label: "Easy Maintenance", icon: Wrench, description: "Lower service costs" },
  { id: "roi", label: "Fast ROI", icon: DollarSign, description: "Quick payback period" },
];

const OPERATION_TYPES = [
  { value: "attended", label: "Fully Attended", description: "Staff on-site during all hours" },
  { value: "hybrid", label: "Hybrid (Peak Hours)", description: "Staff during busy times only" },
  { value: "unattended", label: "Unattended", description: "Self-service with remote monitoring" },
];

const SERVICE_OPTIONS = [
  { id: "self-service", label: "Self-Service Only" },
  { id: "wash-fold", label: "Wash & Fold Service" },
  { id: "pickup-delivery", label: "Pickup & Delivery" },
  { id: "commercial", label: "Commercial Accounts" },
];

export default function EquipmentMatcher() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    facilitySize: "",
    budget: "",
    priorities: [] as string[],
    operationType: "",
    services: [] as string[],
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePriority = (priority: string) => {
    setAnswers(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : prev.priorities.length < 3
          ? [...prev.priorities, priority]
          : prev.priorities
    }));
  };

  const toggleService = (service: string) => {
    setAnswers(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const getRecommendations = (): EquipmentRecommendation[] => {
    const { facilitySize, budget, priorities } = answers;
    const recs: EquipmentRecommendation[] = [];

    const hasDurability = priorities.includes("durability");
    const hasEnergy = priorities.includes("energy");
    const hasCapacity = priorities.includes("capacity");
    const hasSpeed = priorities.includes("speed");

    if (hasDurability || hasEnergy) {
      recs.push({
        name: "Dexter T-900 Express",
        brand: "Dexter",
        model: "T-900",
        capacity: "90 lb",
        priceRange: "$15,000 - $18,000",
        features: ["Express Dry Technology", "Reversing Cylinder", "Triple Energy Shield"],
        pros: ["30+ year lifespan", "Industry-leading energy efficiency", "Made in USA"],
        bestFor: "Operators prioritizing longevity and low utility costs",
        score: 98,
      });
    }

    if (hasCapacity || facilitySize === "large" || facilitySize === "mega") {
      recs.push({
        name: "Dexter T-80 Stack Dryer",
        brand: "Dexter",
        model: "T-80 Stack",
        capacity: "80 lb per pocket",
        priceRange: "$22,000 - $28,000",
        features: ["Dual Pocket Design", "Space Maximization", "High Capacity"],
        pros: ["Double the drying capacity", "Perfect for high-volume", "Reduced footprint"],
        bestFor: "High-traffic laundromats needing maximum throughput",
        score: 95,
      });
    }

    recs.push({
      name: "Dexter T-600 Commercial Washer",
      brand: "Dexter",
      model: "T-600",
      capacity: "60 lb",
      priceRange: "$12,000 - $15,000",
      features: ["Flexible Cycle Options", "Large Door Opening", "Premium Build Quality"],
      pros: ["Industry workhorse", "Perfect for wash-fold operations", "Easy maintenance"],
      bestFor: "Mixed-use facilities with self-service and commercial",
      score: 94,
    });

    if (hasSpeed || answers.services.includes("wash-fold")) {
      recs.push({
        name: "Dexter C-Series Express Washer",
        brand: "Dexter",
        model: "C-Series",
        capacity: "30 lb",
        priceRange: "$8,000 - $11,000",
        features: ["30-Minute Cycles", "High G-Force Extract", "Smart Controls"],
        pros: ["Fastest cycles in class", "Lower drying time needed", "Great customer satisfaction"],
        bestFor: "High-turnover operations and wash-fold services",
        score: 92,
      });
    }

    if (budget === "starter" || budget === "growth") {
      recs.push({
        name: "Dexter T-400 Entry Pro",
        brand: "Dexter",
        model: "T-400",
        capacity: "40 lb",
        priceRange: "$7,500 - $9,500",
        features: ["Proven Technology", "Simple Operation", "Reliable Performance"],
        pros: ["Best value in commercial", "Low maintenance", "Same Dexter quality"],
        bestFor: "New owners and budget-conscious operators",
        score: 90,
      });
    }

    return recs.sort((a, b) => b.score - a.score).slice(0, 4);
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case "facility": return answers.facilitySize !== "";
      case "budget": return answers.budget !== "";
      case "priorities": return answers.priorities.length > 0;
      case "operations": return answers.operationType !== "";
      default: return true;
    }
  };

  const renderStep = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case "facility":
        return (
          <div className="space-y-4">
            <RadioGroup value={answers.facilitySize} onValueChange={(v) => setAnswers(prev => ({ ...prev, facilitySize: v }))}>
              {FACILITY_SIZES.map((size) => (
                <label
                  key={size.value}
                  data-testid={`radio-facility-${size.value}`}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover-elevate ${
                    answers.facilitySize === size.value ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value={size.value} id={size.value} />
                  <div className="flex-1">
                    <div className="font-semibold">{size.label}</div>
                    <div className="text-sm text-muted-foreground">{size.description} • {size.machines}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        );

      case "budget":
        return (
          <div className="space-y-4">
            <RadioGroup value={answers.budget} onValueChange={(v) => setAnswers(prev => ({ ...prev, budget: v }))}>
              {BUDGET_RANGES.map((range) => (
                <label
                  key={range.value}
                  data-testid={`radio-budget-${range.value}`}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover-elevate ${
                    answers.budget === range.value ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value={range.value} id={range.value} />
                  <div className="flex-1">
                    <div className="font-semibold">{range.label}</div>
                    <div className="text-sm text-muted-foreground">{range.description}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        );

      case "priorities":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Select up to 3 priorities that matter most</p>
            <div className="grid gap-3 md:grid-cols-2">
              {PRIORITY_OPTIONS.map((priority) => {
                const Icon = priority.icon;
                const isSelected = answers.priorities.includes(priority.id);
                return (
                  <button
                    key={priority.id}
                    data-testid={`checkbox-priority-${priority.id}`}
                    onClick={() => togglePriority(priority.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                      isSelected ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{priority.label}</div>
                      <div className="text-sm text-muted-foreground">{priority.description}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
            {answers.priorities.length > 0 && (
              <div className="flex gap-2 mt-4">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {answers.priorities.map(p => (
                  <Badge key={p} variant="secondary">
                    {PRIORITY_OPTIONS.find(o => o.id === p)?.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case "operations":
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Staffing Model</h4>
              <RadioGroup value={answers.operationType} onValueChange={(v) => setAnswers(prev => ({ ...prev, operationType: v }))}>
                {OPERATION_TYPES.map((type) => (
                  <label
                    key={type.value}
                    data-testid={`radio-operation-${type.value}`}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover-elevate ${
                      answers.operationType === type.value ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value={type.value} id={type.value} />
                    <div className="flex-1">
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Services Offered (Optional)</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICE_OPTIONS.map((service) => (
                  <label
                    key={service.id}
                    data-testid={`checkbox-service-${service.id}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover-elevate ${
                      answers.services.includes(service.id) ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Checkbox
                      checked={answers.services.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <span>{service.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case "results":
        const recommendations = getRecommendations();
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Your Profile
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>{FACILITY_SIZES.find(s => s.value === answers.facilitySize)?.label}</Badge>
                <Badge variant="secondary">{BUDGET_RANGES.find(b => b.value === answers.budget)?.label}</Badge>
                {answers.priorities.map(p => (
                  <Badge key={p} variant="outline">{PRIORITY_OPTIONS.find(o => o.id === p)?.label}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Recommended Equipment</h4>
              {recommendations.map((rec, idx) => (
                <Card key={rec.model} className={idx === 0 ? "border-primary ring-2 ring-primary/20" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {idx === 0 && <Badge className="mb-2 bg-primary">Best Match</Badge>}
                        <CardTitle className="text-lg">{rec.name}</CardTitle>
                        <CardDescription>{rec.capacity} capacity • {rec.priceRange}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{rec.score}%</div>
                        <div className="text-xs text-muted-foreground">Match Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {rec.features.map((f) => (
                        <Badge key={f} variant="secondary">{f}</Badge>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Best For:</strong> {rec.bestFor}
                    </div>
                    <ul className="grid gap-1 text-sm">
                      {rec.pros.map((pro) => (
                        <li key={pro} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <SiFacebook className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Join 72,000+ Laundromat Owners</h3>
                <p className="text-blue-100 mb-4">
                  Get exclusive equipment deals, owner advice, and connect with the largest laundromat community online.
                </p>
                <a
                  href={FB_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-join-fb-group"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Join AAdvantage Laundry FB Group
                  <ExternalLink className="w-4 h-4" />
                </a>
                <div className="mt-4 flex justify-center gap-4 text-sm text-blue-200">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> 72K Members
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" /> Expert Advice
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" /> Free to Join
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent rounded-full">
                    <TrendingUp className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Ready to Get Quotes?</h4>
                    <p className="text-sm text-muted-foreground">Connect with authorized Dexter distributors in your area</p>
                  </div>
                  <a
                    href={AADVANTAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-aadvantage"
                  >
                    <Button variant="outline" className="gap-2">
                      Visit AAdvantage Laundry
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthGuard title="Sign In to Match Equipment" description="Sign in to access this feature.">
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto py-8 px-4">
          <div className="text-center mb-8">
          <Badge className="mb-2">Free Tool</Badge>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Equipment Matcher Wizard</h1>
          <p className="text-muted-foreground mt-2">Find the perfect commercial laundry equipment for your operation</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{STEPS[currentStep].title}</span>
            <span>Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-wizard" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep].title}</CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            {currentStep > 0 && currentStep < STEPS.length - 1 && (
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {currentStep === 0 && <div />}
            {currentStep < STEPS.length - 1 && (
              <Button onClick={handleNext} disabled={!canProceed()} data-testid="button-next">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            {currentStep === STEPS.length - 1 && (
              <div className="flex gap-2 w-full justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(0)} data-testid="button-start-over">
                  Start Over
                </Button>
                <Link href="/blog/dexter-equipment" data-testid="link-blog">
                  <Button variant="secondary" className="gap-2">
                    Read Dexter Equipment Guides
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Powered by WashBizHub • Connecting laundromat owners with the right equipment</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
