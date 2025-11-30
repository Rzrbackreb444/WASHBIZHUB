import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { 
  ChevronRight, ChevronLeft, Star, Award, Zap, DollarSign, Leaf, Shield, 
  Factory, Wrench, CheckCircle2, Target, AlertTriangle, Settings, Gauge,
  RefreshCw, ThumbsUp, ThumbsDown, Sparkles, HardHat, ArrowRight
} from "lucide-react";
import { Link } from "wouter";

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
  cons: string[];
  bestFor: string;
  score: number;
  type: "washer" | "dryer" | "stack";
  philosophy: "workhorse" | "premium" | "balanced";
}

const STEPS: WizardStep[] = [
  { id: "goal", title: "Your Goal", description: "What are you looking to accomplish?" },
  { id: "facility", title: "Facility Size", description: "Tell us about your laundromat" },
  { id: "philosophy", title: "Equipment Philosophy", description: "Workhorse or bells & whistles?" },
  { id: "budget", title: "Budget Per Machine", description: "Investment capacity for equipment" },
  { id: "priorities", title: "Top Priorities", description: "What matters most to you?" },
  { id: "results", title: "Your Recommendations", description: "Personalized equipment matches" },
];

const GOALS = [
  { value: "new-store", label: "Opening a New Store", description: "First-time owner or new location", icon: Sparkles },
  { value: "retool", label: "Retooling Existing Store", description: "Replacing aging equipment", icon: RefreshCw },
  { value: "expand", label: "Adding Capacity", description: "Growing existing operation", icon: Factory },
  { value: "upgrade", label: "Premium Upgrade", description: "Elevating customer experience", icon: Award },
];

const FACILITY_SIZES = [
  { value: "small", label: "Neighborhood (Under 1,500 sq ft)", machines: "8-15 machines" },
  { value: "medium", label: "Community (1,500-3,000 sq ft)", machines: "16-30 machines" },
  { value: "large", label: "High-Traffic (3,000-5,000 sq ft)", machines: "31-50 machines" },
  { value: "mega", label: "Super Store (5,000+ sq ft)", machines: "50+ machines" },
];

const PHILOSOPHY_OPTIONS = [
  { 
    value: "workhorse", 
    label: "Reliable Workhorse", 
    description: "Proven technology, easy repairs, lower upfront cost. May have higher utility costs but parts are readily available and any technician can service them.",
    icon: HardHat,
    color: "text-amber-500"
  },
  { 
    value: "balanced", 
    label: "Best of Both Worlds", 
    description: "Modern efficiency with proven reliability. Mid-range price point with good ROI on utility savings.",
    icon: Gauge,
    color: "text-blue-500"
  },
  { 
    value: "premium", 
    label: "Bells & Whistles", 
    description: "Latest technology, app connectivity, maximum efficiency. Higher upfront cost but lowest operating expenses and premium customer experience.",
    icon: Sparkles,
    color: "text-purple-500"
  },
];

const BUDGET_RANGES = [
  { value: "economy", label: "$5,000 - $8,000", description: "Entry-level commercial" },
  { value: "mid", label: "$8,000 - $12,000", description: "Standard commercial grade" },
  { value: "premium", label: "$12,000 - $18,000", description: "High-efficiency premium" },
  { value: "ultra", label: "$18,000+", description: "Top-tier with all features" },
];

const PRIORITY_OPTIONS = [
  { id: "energy", label: "Energy Efficiency", icon: Leaf, description: "Lower utility costs" },
  { id: "durability", label: "30+ Year Lifespan", icon: Shield, description: "Built to last" },
  { id: "speed", label: "Fast Cycles", icon: Zap, description: "Higher throughput" },
  { id: "maintenance", label: "Easy Service", icon: Wrench, description: "Simple repairs" },
  { id: "roi", label: "Fast Payback", icon: DollarSign, description: "Quick ROI" },
  { id: "tech", label: "Smart Features", icon: Settings, description: "App & connectivity" },
];

const EQUIPMENT_DATABASE: EquipmentRecommendation[] = [
  // SPEED QUEEN
  {
    name: "Speed Queen SC40",
    brand: "Speed Queen",
    model: "SC40",
    capacity: "40 lb",
    priceRange: "$8,500 - $10,500",
    features: ["Quantum Controls", "7-Year Warranty", "Steel Construction"],
    pros: ["Industry-leading 30+ year lifespan", "Best resale value", "Made in USA", "Simple & reliable"],
    cons: ["Higher utility costs vs newer tech", "Basic user interface", "Slower cycle times"],
    bestFor: "Owners prioritizing longevity and reliability over features",
    score: 0,
    type: "washer",
    philosophy: "workhorse"
  },
  {
    name: "Speed Queen ST40",
    brand: "Speed Queen",
    model: "ST40",
    capacity: "40 lb",
    priceRange: "$7,500 - $9,000",
    features: ["Digital Controls", "5-Year Warranty", "Proven Technology"],
    pros: ["Bulletproof reliability", "Parts readily available", "Any tech can service", "Great resale"],
    cons: ["Less energy efficient", "Fewer features", "Basic controls"],
    bestFor: "Budget-conscious owners wanting Speed Queen quality",
    score: 0,
    type: "dryer",
    philosophy: "workhorse"
  },
  // DEXTER
  {
    name: "Dexter T-600",
    brand: "Dexter",
    model: "T-600",
    capacity: "60 lb",
    priceRange: "$12,000 - $15,000",
    features: ["Express Wash", "High G-Force Extract", "DexterLive App"],
    pros: ["25-30 year lifespan", "Lower utility costs", "Great extraction", "Made in USA"],
    cons: ["Higher upfront cost", "Proprietary parts", "Dexter-trained techs preferred"],
    bestFor: "Operators wanting premium quality with modern efficiency",
    score: 0,
    type: "washer",
    philosophy: "premium"
  },
  {
    name: "Dexter T-900",
    brand: "Dexter",
    model: "T-900",
    capacity: "90 lb",
    priceRange: "$15,000 - $18,000",
    features: ["Express Dry", "Reversing Cylinder", "Triple Energy Shield"],
    pros: ["Industry-best energy efficiency", "Fastest dry times", "Premium build quality"],
    cons: ["Highest price point", "Complex technology", "Specialized service"],
    bestFor: "High-volume operations focused on efficiency and speed",
    score: 0,
    type: "dryer",
    philosophy: "premium"
  },
  {
    name: "Dexter T-400",
    brand: "Dexter",
    model: "T-400",
    capacity: "40 lb",
    priceRange: "$7,500 - $9,500",
    features: ["Proven Technology", "Simple Operation", "Solid Build"],
    pros: ["Dexter quality at lower price", "Good parts availability", "Reliable performance"],
    cons: ["Older technology", "Less efficient than T-600", "Basic controls"],
    bestFor: "Budget-minded owners who want Dexter quality",
    score: 0,
    type: "washer",
    philosophy: "balanced"
  },
  // MAYTAG COMMERCIAL
  {
    name: "Maytag MHN33",
    brand: "Maytag Commercial",
    model: "MHN33",
    capacity: "33 lb",
    priceRange: "$6,500 - $8,500",
    features: ["Commercial Controls", "PowerWash", "5-Year Warranty"],
    pros: ["Lower upfront cost", "Familiar brand", "Good parts network", "Solid performer"],
    cons: ["Shorter lifespan (15-20 years)", "More frequent repairs", "Less extraction"],
    bestFor: "New owners on a budget who need solid equipment",
    score: 0,
    type: "washer",
    philosophy: "workhorse"
  },
  {
    name: "Maytag MDG28",
    brand: "Maytag Commercial",
    model: "MDG28",
    capacity: "28 lb",
    priceRange: "$5,500 - $7,000",
    features: ["IntelliDry", "Commercial Build", "Simple Controls"],
    pros: ["Affordable entry point", "Easy to service", "Parts everywhere", "Good value"],
    cons: ["Shorter lifespan", "Higher utility costs", "Less capacity"],
    bestFor: "Smaller operations prioritizing upfront savings",
    score: 0,
    type: "dryer",
    philosophy: "workhorse"
  },
  // HUEBSCH
  {
    name: "Huebsch HC40",
    brand: "Huebsch",
    model: "HC40",
    capacity: "40 lb",
    priceRange: "$8,000 - $10,000",
    features: ["Galaxy Controls", "High Extract", "Alliance Quality"],
    pros: ["Same factory as Speed Queen", "Slightly lower price", "Great reliability"],
    cons: ["Less brand recognition", "Fewer service techs know it", "Limited resale market"],
    bestFor: "Savvy buyers who know Huebsch = Speed Queen DNA",
    score: 0,
    type: "washer",
    philosophy: "balanced"
  },
  // ELECTROLUX
  {
    name: "Electrolux W4180",
    brand: "Electrolux Professional",
    model: "W4180",
    capacity: "40 lb",
    priceRange: "$14,000 - $17,000",
    features: ["Clarus Compass Pro", "Automatic Dosing", "IoT Connected"],
    pros: ["Ultra-efficient", "Premium customer experience", "Advanced diagnostics", "Quiet operation"],
    cons: ["Highest price point", "Complex technology", "Specialized service required", "Steep learning curve"],
    bestFor: "Premium stores targeting upscale customers",
    score: 0,
    type: "washer",
    philosophy: "premium"
  },
  // CONTINENTAL
  {
    name: "Continental ExpressWash",
    brand: "Continental Girbau",
    model: "EH040",
    capacity: "40 lb",
    priceRange: "$11,000 - $14,000",
    features: ["High Extract", "Fast Cycles", "European Engineering"],
    pros: ["Excellent extraction", "Lower dry times", "Good efficiency", "Solid build"],
    cons: ["Less common in US", "Parts can be harder to find", "Fewer local techs"],
    bestFor: "Operators near Continental service centers wanting European quality",
    score: 0,
    type: "washer",
    philosophy: "balanced"
  },
];

export default function EquipmentWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    goal: "",
    facilitySize: "",
    philosophy: "",
    budget: "",
    priorities: [] as string[],
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

  const getRecommendations = (): EquipmentRecommendation[] => {
    const { philosophy, budget, priorities } = answers;
    
    return EQUIPMENT_DATABASE.map(eq => {
      let score = 50;
      
      if (eq.philosophy === philosophy) score += 25;
      else if (philosophy === "balanced") score += 15;
      
      const budgetMap: Record<string, number[]> = {
        economy: [5000, 8000],
        mid: [8000, 12000],
        premium: [12000, 18000],
        ultra: [18000, 50000],
      };
      const [min, max] = budgetMap[budget] || [0, 50000];
      const priceMatch = eq.priceRange.match(/\$([0-9,]+)/);
      const eqPrice = priceMatch ? parseInt(priceMatch[1].replace(",", "")) : 10000;
      if (eqPrice >= min && eqPrice <= max) score += 20;
      else if (eqPrice < min) score += 5;
      
      if (priorities.includes("energy") && eq.philosophy === "premium") score += 10;
      if (priorities.includes("durability") && (eq.brand === "Speed Queen" || eq.brand === "Dexter")) score += 15;
      if (priorities.includes("maintenance") && eq.philosophy === "workhorse") score += 10;
      if (priorities.includes("roi") && eq.philosophy !== "premium") score += 10;
      if (priorities.includes("tech") && eq.philosophy === "premium") score += 15;
      if (priorities.includes("speed") && eq.features.some(f => f.toLowerCase().includes("express"))) score += 10;
      
      return { ...eq, score: Math.min(99, score) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case "goal": return answers.goal !== "";
      case "facility": return answers.facilitySize !== "";
      case "philosophy": return answers.philosophy !== "";
      case "budget": return answers.budget !== "";
      case "priorities": return answers.priorities.length > 0;
      default: return true;
    }
  };

  const renderStep = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case "goal":
        return (
          <div className="space-y-4">
            <RadioGroup value={answers.goal} onValueChange={(v) => setAnswers(prev => ({ ...prev, goal: v }))}>
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                return (
                  <label
                    key={goal.value}
                    data-testid={`radio-goal-${goal.value}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      answers.goal === goal.value 
                        ? "border-[#39CCCC] bg-[#39CCCC]/10" 
                        : "border-border hover:border-[#39CCCC]/50"
                    }`}
                  >
                    <RadioGroupItem value={goal.value} id={goal.value} className="sr-only" />
                    <div className={`p-3 rounded-lg ${answers.goal === goal.value ? "bg-[#39CCCC] text-[#001F3F]" : "bg-muted"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{goal.label}</div>
                      <div className="text-sm text-muted-foreground">{goal.description}</div>
                    </div>
                    {answers.goal === goal.value && <CheckCircle2 className="w-6 h-6 text-[#39CCCC]" />}
                  </label>
                );
              })}
            </RadioGroup>
          </div>
        );

      case "facility":
        return (
          <div className="space-y-4">
            <RadioGroup value={answers.facilitySize} onValueChange={(v) => setAnswers(prev => ({ ...prev, facilitySize: v }))}>
              {FACILITY_SIZES.map((size) => (
                <label
                  key={size.value}
                  data-testid={`radio-facility-${size.value}`}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers.facilitySize === size.value 
                      ? "border-[#39CCCC] bg-[#39CCCC]/10" 
                      : "border-border hover:border-[#39CCCC]/50"
                  }`}
                >
                  <RadioGroupItem value={size.value} id={size.value} className="sr-only" />
                  <div className="flex-1">
                    <div className="font-semibold">{size.label}</div>
                    <div className="text-sm text-muted-foreground">{size.machines}</div>
                  </div>
                  {answers.facilitySize === size.value && <CheckCircle2 className="w-6 h-6 text-[#39CCCC]" />}
                </label>
              ))}
            </RadioGroup>
          </div>
        );

      case "philosophy":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-4">This is the most important decision. Each approach has trade-offs.</p>
            <RadioGroup value={answers.philosophy} onValueChange={(v) => setAnswers(prev => ({ ...prev, philosophy: v }))}>
              {PHILOSOPHY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.value}
                    data-testid={`radio-philosophy-${opt.value}`}
                    className={`block p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      answers.philosophy === opt.value 
                        ? "border-[#39CCCC] bg-[#39CCCC]/10" 
                        : "border-border hover:border-[#39CCCC]/50"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${answers.philosophy === opt.value ? "bg-[#39CCCC] text-[#001F3F]" : "bg-muted"}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{opt.label}</span>
                          {answers.philosophy === opt.value && <CheckCircle2 className="w-5 h-5 text-[#39CCCC]" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </div>
        );

      case "budget":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-4">Per machine budget (washers and dryers)</p>
            <RadioGroup value={answers.budget} onValueChange={(v) => setAnswers(prev => ({ ...prev, budget: v }))}>
              {BUDGET_RANGES.map((range) => (
                <label
                  key={range.value}
                  data-testid={`radio-budget-${range.value}`}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers.budget === range.value 
                      ? "border-[#39CCCC] bg-[#39CCCC]/10" 
                      : "border-border hover:border-[#39CCCC]/50"
                  }`}
                >
                  <RadioGroupItem value={range.value} id={range.value} className="sr-only" />
                  <div className="flex-1">
                    <div className="font-semibold">{range.label}</div>
                    <div className="text-sm text-muted-foreground">{range.description}</div>
                  </div>
                  {answers.budget === range.value && <CheckCircle2 className="w-6 h-6 text-[#39CCCC]" />}
                </label>
              ))}
            </RadioGroup>
          </div>
        );

      case "priorities":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-4">Select up to 3 priorities that matter most</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PRIORITY_OPTIONS.map((priority) => {
                const Icon = priority.icon;
                const isSelected = answers.priorities.includes(priority.id);
                return (
                  <button
                    key={priority.id}
                    data-testid={`checkbox-priority-${priority.id}`}
                    onClick={() => togglePriority(priority.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected 
                        ? "border-[#39CCCC] bg-[#39CCCC]/10" 
                        : "border-border hover:border-[#39CCCC]/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-[#39CCCC] text-[#001F3F]" : "bg-muted"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{priority.label}</div>
                      <div className="text-xs text-muted-foreground">{priority.description}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#39CCCC]" />}
                  </button>
                );
              })}
            </div>
            {answers.priorities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {answers.priorities.map(p => (
                  <Badge key={p} className="bg-[#39CCCC] text-[#001F3F]">
                    {PRIORITY_OPTIONS.find(o => o.id === p)?.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case "results":
        const recommendations = getRecommendations();
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-[#001F3F]/10 to-[#39CCCC]/10 rounded-xl border border-[#39CCCC]/30">
              <h4 className="font-semibold flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-[#39CCCC]" />
                Your Equipment Profile
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-[#001F3F] text-white">{PHILOSOPHY_OPTIONS.find(p => p.value === answers.philosophy)?.label}</Badge>
                <Badge variant="secondary">{BUDGET_RANGES.find(b => b.value === answers.budget)?.label}</Badge>
                {answers.priorities.map(p => (
                  <Badge key={p} variant="outline">{PRIORITY_OPTIONS.find(o => o.id === p)?.label}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-xl">Top Equipment Matches</h4>
              {recommendations.map((rec, idx) => (
                <Card key={`${rec.brand}-${rec.model}`} className={`overflow-hidden ${idx === 0 ? "ring-2 ring-[#39CCCC]" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {idx === 0 && <Badge className="mb-2 bg-[#39CCCC] text-[#001F3F]">Best Match</Badge>}
                        <CardTitle className="text-lg">{rec.name}</CardTitle>
                        <CardDescription>{rec.capacity} • {rec.priceRange}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#39CCCC]">{rec.score}%</div>
                        <div className="text-xs text-muted-foreground">Match</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {rec.features.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                          <ThumbsUp className="w-4 h-4" />
                          Pros
                        </div>
                        <ul className="space-y-1">
                          {rec.pros.map((pro) => (
                            <li key={pro} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                          <ThumbsDown className="w-4 h-4" />
                          Considerations
                        </div>
                        <ul className="space-y-1">
                          {rec.cons.map((con) => (
                            <li key={con} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t text-sm text-muted-foreground">
                      <strong>Best For:</strong> {rec.bestFor}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-[#001F3F] to-[#002B5C] text-white">
              <CardContent className="p-6 text-center">
                <h4 className="text-xl font-bold mb-2">Need Expert Guidance?</h4>
                <p className="text-white/80 mb-4">Our AI Consultation Council can analyze your specific situation and provide personalized recommendations.</p>
                <Link href="/ai-consultation-council">
                  <Button className="bg-[#39CCCC] text-[#001F3F] hover:bg-[#2db8b8]">
                    Talk to AI Experts
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SEO 
        title="Equipment Wizard | Find Your Perfect Laundry Equipment | WashBizHub"
        description="Interactive wizard to find the best commercial laundry equipment for your laundromat. Compare Speed Queen, Dexter, Maytag, and more with honest pros and cons."
        canonicalUrl="/equipment-wizard"
        keywords={["laundromat equipment", "commercial washer", "Speed Queen", "Dexter", "laundry equipment comparison"]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3">
            <Breadcrumb items={[
              { name: "Resources", url: "/resources" },
              { name: "Equipment Wizard", url: "/equipment-wizard" }
            ]} />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#001F3F] to-[#002B5C] text-white py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Badge className="mb-4 bg-[#39CCCC] text-[#001F3F]">Interactive Tool</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Equipment Selection Wizard
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Answer a few questions and we'll recommend the best commercial laundry equipment for your specific needs - with honest pros and cons.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-xl">{STEPS[currentStep].title}</CardTitle>
              <CardDescription>{STEPS[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {renderStep()}
            </CardContent>
          </Card>

          {currentStep < STEPS.length - 1 && (
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 0}
                data-testid="button-back"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-[#001F3F] hover:bg-[#002B5C]"
                data-testid="button-next"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === STEPS.length - 1 && (
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                data-testid="button-back"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Adjust Answers
              </Button>
              <Button 
                onClick={() => setCurrentStep(0)}
                variant="outline"
                data-testid="button-restart"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
