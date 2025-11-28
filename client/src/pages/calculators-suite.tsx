import { useState, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Calculator, DollarSign, TrendingUp, Zap, Building2, 
  BarChart3, Lightbulb, Wallet, ChevronRight, Share2,
  Download, Crown, Sparkles, Target, Clock, Users,
  ArrowRight, Check, Star, Shield, Gauge
} from "lucide-react";

// CLEANBI Grade Conversion (A, B, C only per project standards)
function getCleanbiGrade(score: number): { grade: string; color: string; bg: string; label: string } {
  if (score >= 85) return { grade: "A", color: "text-green-400", bg: "bg-green-500/20 border-green-500/30", label: "Excellent" };
  if (score >= 70) return { grade: "B", color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30", label: "Good" };
  if (score >= 50) return { grade: "C", color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30", label: "Needs Work" };
  return { grade: "C", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", label: "Critical" };
}

interface CalculatorDef {
  id: string;
  title: string;
  icon: any;
  description: string;
  category: "intelligence" | "financial" | "operations" | "planning";
}

const CALCULATORS: CalculatorDef[] = [
  { id: "cleanbi", title: "CLEANBI Score", icon: Target, description: "AI-powered property intelligence scoring", category: "intelligence" },
  { id: "roi", title: "ROI Calculator", icon: TrendingUp, description: "Project returns and payback period", category: "financial" },
  { id: "yield", title: "Machine Yield", icon: BarChart3, description: "Revenue per machine analysis", category: "operations" },
  { id: "breakeven", title: "Break-Even", icon: DollarSign, description: "When your store turns profitable", category: "financial" },
  { id: "energy", title: "Energy Cost", icon: Lightbulb, description: "Utility expense projections", category: "operations" },
  { id: "pricing", title: "Pricing Optimizer", icon: Zap, description: "Optimal wash/dry pricing", category: "intelligence" },
  { id: "expansion", title: "Expansion Planner", icon: Building2, description: "Growth and scaling simulator", category: "planning" },
  { id: "financing", title: "Financing Calc", icon: Wallet, description: "Loan and lease analysis", category: "financial" },
];

const CATEGORY_COLORS = {
  intelligence: "from-cyan-500 to-teal-500",
  financial: "from-emerald-500 to-green-500",
  operations: "from-amber-500 to-orange-500",
  planning: "from-violet-500 to-purple-500",
};

export default function CalculatorsSuite() {
  const { toast } = useToast();
  const [activeCalc, setActiveCalc] = useState("cleanbi");
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "Share this calculator with others" });
  };

  const selectedCalc = CALCULATORS.find(c => c.id === activeCalc)!;

  return (
    <>
      <SEO
        title="Professional Calculators | WashBizHub"
        description="8 powerful calculators for laundromat owners - CLEANBI Score, ROI, Machine Yield, Break-Even, Energy Costs, Pricing Optimizer, Expansion Planner, and Financing."
        canonicalUrl="/calculators-suite"
        keywords={["laundromat calculator", "CLEANBI score", "laundry ROI calculator", "machine yield"]}
        breadcrumbs={[{ name: "Calculators", url: "/calculators-suite" }]}
      />

      {/* Premium Navy/Teal Gradient Background */}
      <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#001F3F]">
        <div className="bg-muted/10 border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Calculators", url: "/calculators-suite" }]} />
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-12 px-6">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4 bg-[#39CCCC]/20 text-[#39CCCC] border-[#39CCCC]/30 hover:bg-[#39CCCC]/30">
              <Calculator className="w-3 h-3 mr-1" />
              God-Tier Business Intelligence
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              WASHBIZHUB <span className="text-[#39CCCC]">CALCULATORS</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              8 professional calculators with AI-powered insights, CLEANBI grading, and one-click exports.
              The tools every successful laundromat owner bookmarks.
            </p>
          </div>
        </section>

        {/* Calculator Grid */}
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
              {CALCULATORS.map((calc) => {
                const Icon = calc.icon;
                const isActive = activeCalc === calc.id;
                return (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalc(calc.id)}
                    className={`relative p-4 rounded-xl border transition-all duration-300 text-center ${
                      isActive 
                        ? "bg-[#39CCCC]/20 border-[#39CCCC] shadow-lg shadow-[#39CCCC]/20" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                    data-testid={`button-calc-${calc.id}`}
                  >
                    <div className={`mx-auto w-10 h-10 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br ${CATEGORY_COLORS[calc.category]}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`text-xs font-semibold ${isActive ? "text-[#39CCCC]" : "text-white/80"}`}>
                      {calc.title}
                    </div>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#39CCCC] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Calculator Card */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calculator Panel */}
              <div className="lg:col-span-2">
                <Card className="bg-white/10 backdrop-blur-xl border-white/10 shadow-2xl">
                  <CardHeader className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[selectedCalc.category]}`}>
                          <selectedCalc.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">{selectedCalc.title}</CardTitle>
                          <CardDescription className="text-white/60">{selectedCalc.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={handleShare}
                          data-testid="button-share"
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-[#39CCCC]/30 text-[#39CCCC] hover:bg-[#39CCCC]/10"
                          data-testid="button-export"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6" ref={resultsRef}>
                    {activeCalc === "cleanbi" && <CLEANBICalculator />}
                    {activeCalc === "roi" && <ROICalculator />}
                    {activeCalc === "yield" && <MachineYieldCalculator />}
                    {activeCalc === "breakeven" && <BreakEvenCalculator />}
                    {activeCalc === "energy" && <EnergyCostCalculator />}
                    {activeCalc === "pricing" && <PricingOptimizer />}
                    {activeCalc === "expansion" && <ExpansionPlanner />}
                    {activeCalc === "financing" && <FinancingCalculator />}
                  </CardContent>
                </Card>
              </div>

              {/* Pro Upgrade Panel */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-[#39CCCC]/20 to-cyan-600/20 border-[#39CCCC]/30 backdrop-blur-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-5 h-5 text-[#39CCCC]" />
                      <span className="text-white font-semibold">Upgrade to Pro</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {["AI-powered forecasts", "Custom branding", "API access", "Priority support"].map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-white/80 text-sm">
                          <Check className="w-4 h-4 text-[#39CCCC]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/subscribe">
                      <Button className="w-full bg-[#39CCCC] hover:bg-[#39CCCC]/80 text-[#001F3F] font-bold" data-testid="button-upgrade">
                        <Sparkles className="w-4 h-4 mr-2" />
                        $9/month
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardContent className="pt-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      Why 70K+ Owners Trust Us
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">Industry Standard</div>
                          <div className="text-white/50 text-xs">Vetted by real operators</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Gauge className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">CLEANBI™ Grading</div>
                          <div className="text-white/50 text-xs">Universal A-C scoring</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ==================== CALCULATOR COMPONENTS ====================

function CLEANBICalculator() {
  const [values, setValues] = useState({
    revenue: 25000,
    machines: 30,
    utilization: 65,
    cleanliness: 80,
    location: 75,
  });

  // CLEANBI Score formula with weighted factors
  const rawScore = (
    (values.revenue / 1000) * 0.25 + // Revenue weight
    values.machines * 1.5 + // Machine count weight
    values.utilization * 0.3 + // Utilization weight
    values.cleanliness * 0.25 + // Cleanliness weight
    values.location * 0.2 // Location weight
  );
  const score = Math.min(100, Math.max(0, rawScore));
  const grade = getCleanbiGrade(score);

  const formatCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-white/80">Monthly Revenue</Label>
            <Input
              type="number"
              value={values.revenue}
              onChange={(e) => setValues({ ...values, revenue: Number(e.target.value) })}
              className="mt-1 bg-white/10 border-white/20 text-white"
              data-testid="input-cleanbi-revenue"
            />
          </div>
          <div>
            <Label className="text-white/80">Number of Machines</Label>
            <Input
              type="number"
              value={values.machines}
              onChange={(e) => setValues({ ...values, machines: Number(e.target.value) })}
              className="mt-1 bg-white/10 border-white/20 text-white"
              data-testid="input-cleanbi-machines"
            />
          </div>
          <div>
            <Label className="text-white/80">Utilization Rate: {values.utilization}%</Label>
            <Slider
              value={[values.utilization]}
              onValueChange={(v) => setValues({ ...values, utilization: v[0] })}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-white/80">Cleanliness Score: {values.cleanliness}%</Label>
            <Slider
              value={[values.cleanliness]}
              onValueChange={(v) => setValues({ ...values, cleanliness: v[0] })}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-white/80">Location Quality: {values.location}%</Label>
            <Slider
              value={[values.location]}
              onValueChange={(v) => setValues({ ...values, location: v[0] })}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className={`w-40 h-40 rounded-full border-4 ${grade.bg} flex flex-col items-center justify-center mb-4`}>
            <span className={`text-6xl font-black ${grade.color}`} data-testid="text-cleanbi-grade">{grade.grade}</span>
            <span className="text-white/60 text-sm">{grade.label}</span>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-sm">CLEANBI Score</div>
            <div className="text-3xl font-bold text-[#39CCCC]" data-testid="text-cleanbi-score">{score.toFixed(0)}/100</div>
          </div>
          <div className="mt-4 p-3 bg-white/5 rounded-lg text-center">
            <div className="text-white/60 text-xs">Est. Monthly Potential</div>
            <div className="text-lg font-semibold text-green-400">{formatCurrency(values.revenue * (1 + (score / 200)))}</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#39CCCC]/10 rounded-lg border border-[#39CCCC]/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#39CCCC]" />
          <span className="text-[#39CCCC] font-semibold text-sm">AI Insight</span>
        </div>
        <p className="text-white/80 text-sm">
          {score >= 85 && "Excellent performance! Your store is in the top 15% nationwide. Consider expansion opportunities."}
          {score >= 70 && score < 85 && "Solid performance with room to grow. Focus on improving utilization and cleanliness ratings."}
          {score < 70 && "Significant improvement opportunities exist. Review operational efficiency and marketing strategies."}
        </p>
      </div>

      <Button className="w-full bg-[#39CCCC]/20 border border-[#39CCCC]/30 text-[#39CCCC] hover:bg-[#39CCCC]/30" data-testid="button-ai-forecast">
        <Crown className="w-4 h-4 mr-2" />
        AI Pro Forecast → Upgrade
      </Button>
    </div>
  );
}

function ROICalculator() {
  const [values, setValues] = useState({
    purchasePrice: 400000,
    downPayment: 100000,
    interestRate: 7,
    loanTerm: 10,
    grossRevenue: 300000,
    operatingExpenses: 180000,
  });

  const loanAmount = values.purchasePrice - values.downPayment;
  const monthlyRate = values.interestRate / 100 / 12;
  const numPayments = values.loanTerm * 12;
  const monthlyPayment = monthlyRate === 0 
    ? loanAmount / numPayments 
    : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const annualDebtService = monthlyPayment * 12;
  const noi = values.grossRevenue - values.operatingExpenses;
  const cashFlow = noi - annualDebtService;
  const cashOnCash = (cashFlow / values.downPayment) * 100;
  const capRate = (noi / values.purchasePrice) * 100;
  const paybackYears = values.downPayment / Math.max(cashFlow, 1);
  const roiScore = Math.min(100, (cashOnCash + capRate * 2 + (10 - Math.min(paybackYears, 10)) * 5));
  const grade = getCleanbiGrade(roiScore);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <Label className="text-white/80">Purchase Price</Label>
            <Input type="number" value={values.purchasePrice} onChange={(e) => setValues({ ...values, purchasePrice: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" data-testid="input-roi-price" />
          </div>
          <div>
            <Label className="text-white/80">Down Payment</Label>
            <Input type="number" value={values.downPayment} onChange={(e) => setValues({ ...values, downPayment: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" data-testid="input-roi-down" />
          </div>
          <div>
            <Label className="text-white/80">Interest Rate (%)</Label>
            <Input type="number" step="0.1" value={values.interestRate} onChange={(e) => setValues({ ...values, interestRate: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Annual Gross Revenue</Label>
            <Input type="number" value={values.grossRevenue} onChange={(e) => setValues({ ...values, grossRevenue: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Annual Operating Expenses</Label>
            <Input type="number" value={values.operatingExpenses} onChange={(e) => setValues({ ...values, operatingExpenses: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${grade.bg} text-center`}>
            <div className="text-white/60 text-sm mb-1">Investment Grade</div>
            <div className={`text-5xl font-black ${grade.color}`} data-testid="text-roi-grade">{grade.grade}</div>
            <div className="text-white/60 text-xs">{grade.label}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/60 text-xs">Cash-on-Cash</div>
              <div className="text-xl font-bold text-[#39CCCC]">{cashOnCash.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/60 text-xs">Cap Rate</div>
              <div className="text-xl font-bold text-white">{capRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-white/60 text-sm">Annual Cash Flow</div>
            <div className="text-3xl font-bold text-green-400" data-testid="text-roi-cashflow">{fmt(cashFlow)}</div>
          </div>

          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <div className="text-white/60 text-xs">Payback Period</div>
            <div className="text-lg font-semibold text-amber-400">{paybackYears.toFixed(1)} years</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MachineYieldCalculator() {
  const [values, setValues] = useState({
    machines: 30,
    cyclesPerDay: 6,
    pricePerCycle: 4.50,
    daysOpen: 30,
  });

  const dailyYield = values.cyclesPerDay * values.pricePerCycle;
  const monthlyYieldPerMachine = dailyYield * values.daysOpen;
  const totalMonthlyRevenue = monthlyYieldPerMachine * values.machines;
  const annualRevenue = totalMonthlyRevenue * 12;
  const yieldScore = Math.min(100, (monthlyYieldPerMachine / 10) + (values.cyclesPerDay * 8));
  const grade = getCleanbiGrade(yieldScore);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <Label className="text-white/80">Number of Machines</Label>
            <Input type="number" value={values.machines} onChange={(e) => setValues({ ...values, machines: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" data-testid="input-yield-machines" />
          </div>
          <div>
            <Label className="text-white/80">Avg Cycles per Day (per machine)</Label>
            <Input type="number" step="0.5" value={values.cyclesPerDay} onChange={(e) => setValues({ ...values, cyclesPerDay: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Price per Cycle ($)</Label>
            <Input type="number" step="0.25" value={values.pricePerCycle} onChange={(e) => setValues({ ...values, pricePerCycle: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Days Open per Month</Label>
            <Input type="number" value={values.daysOpen} onChange={(e) => setValues({ ...values, daysOpen: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${grade.bg} text-center`}>
            <div className="text-white/60 text-sm mb-1">Yield Grade</div>
            <div className={`text-5xl font-black ${grade.color}`} data-testid="text-yield-grade">{grade.grade}</div>
          </div>

          <div className="p-4 bg-[#39CCCC]/10 rounded-lg border border-[#39CCCC]/30">
            <div className="text-white/60 text-sm">Monthly Yield per Machine</div>
            <div className="text-3xl font-bold text-[#39CCCC]">{fmt(monthlyYieldPerMachine)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/60 text-xs">Daily Yield</div>
              <div className="text-lg font-bold text-white">{fmt(dailyYield)}</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-white/60 text-xs">Total Monthly</div>
              <div className="text-lg font-bold text-green-400">{fmt(totalMonthlyRevenue)}</div>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-white/60 text-xs">Annual Revenue</div>
            <div className="text-2xl font-bold text-white">{fmt(annualRevenue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakEvenCalculator() {
  const [values, setValues] = useState({
    fixedCosts: 8000,
    variableCostPerCycle: 0.50,
    pricePerCycle: 4.50,
    machines: 30,
  });

  const contributionMargin = values.pricePerCycle - values.variableCostPerCycle;
  const breakEvenCycles = values.fixedCosts / contributionMargin;
  const breakEvenPerMachine = breakEvenCycles / values.machines;
  const breakEvenDays = breakEvenPerMachine / 6; // Assuming 6 cycles/day
  const breakEvenScore = Math.min(100, Math.max(0, 100 - (breakEvenDays * 3)));
  const grade = getCleanbiGrade(breakEvenScore);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <Label className="text-white/80">Monthly Fixed Costs ($)</Label>
            <Input type="number" value={values.fixedCosts} onChange={(e) => setValues({ ...values, fixedCosts: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" data-testid="input-breakeven-fixed" />
          </div>
          <div>
            <Label className="text-white/80">Variable Cost per Cycle ($)</Label>
            <Input type="number" step="0.10" value={values.variableCostPerCycle} onChange={(e) => setValues({ ...values, variableCostPerCycle: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Price per Cycle ($)</Label>
            <Input type="number" step="0.25" value={values.pricePerCycle} onChange={(e) => setValues({ ...values, pricePerCycle: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Number of Machines</Label>
            <Input type="number" value={values.machines} onChange={(e) => setValues({ ...values, machines: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${grade.bg} text-center`}>
            <div className="text-white/60 text-sm mb-1">Break-Even Grade</div>
            <div className={`text-5xl font-black ${grade.color}`} data-testid="text-breakeven-grade">{grade.grade}</div>
          </div>

          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <div className="text-white/60 text-sm">Break-Even Point</div>
            <div className="text-3xl font-bold text-amber-400">{breakEvenCycles.toFixed(0)} cycles</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/60 text-xs">Per Machine</div>
              <div className="text-lg font-bold text-white">{breakEvenPerMachine.toFixed(0)} cycles</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/60 text-xs">Est. Days</div>
              <div className="text-lg font-bold text-white">{breakEvenDays.toFixed(1)} days</div>
            </div>
          </div>

          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-white/60 text-xs">Contribution Margin</div>
            <div className="text-lg font-bold text-green-400">${contributionMargin.toFixed(2)}/cycle</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnergyCostCalculator() {
  const [values, setValues] = useState({
    kwhPerMonth: 15000,
    electricRate: 0.12,
    gasUsage: 500,
    gasRate: 1.20,
    waterUsage: 50000,
    waterRate: 0.005,
  });

  const electricCost = values.kwhPerMonth * values.electricRate;
  const gasCost = values.gasUsage * values.gasRate;
  const waterCost = values.waterUsage * values.waterRate;
  const totalMonthlyCost = electricCost + gasCost + waterCost;
  const annualCost = totalMonthlyCost * 12;
  const efficiencyScore = Math.max(0, Math.min(100, 100 - (totalMonthlyCost / 50)));
  const grade = getCleanbiGrade(efficiencyScore);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/80">kWh/Month</Label>
              <Input type="number" value={values.kwhPerMonth} onChange={(e) => setValues({ ...values, kwhPerMonth: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" data-testid="input-energy-kwh" />
            </div>
            <div>
              <Label className="text-white/80">$/kWh</Label>
              <Input type="number" step="0.01" value={values.electricRate} onChange={(e) => setValues({ ...values, electricRate: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/80">Therms/Month</Label>
              <Input type="number" value={values.gasUsage} onChange={(e) => setValues({ ...values, gasUsage: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white/80">$/Therm</Label>
              <Input type="number" step="0.01" value={values.gasRate} onChange={(e) => setValues({ ...values, gasRate: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/80">Gallons/Month</Label>
              <Input type="number" value={values.waterUsage} onChange={(e) => setValues({ ...values, waterUsage: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white/80">$/Gallon</Label>
              <Input type="number" step="0.001" value={values.waterRate} onChange={(e) => setValues({ ...values, waterRate: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${grade.bg} text-center`}>
            <div className="text-white/60 text-sm mb-1">Efficiency Grade</div>
            <div className={`text-5xl font-black ${grade.color}`} data-testid="text-energy-grade">{grade.grade}</div>
          </div>

          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="text-white/60 text-sm">Total Monthly Cost</div>
            <div className="text-3xl font-bold text-red-400">{fmt(totalMonthlyCost)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-white/60 text-sm flex items-center gap-2"><Zap className="w-3 h-3" /> Electric</span>
              <span className="text-white font-medium">{fmt(electricCost)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-white/60 text-sm flex items-center gap-2"><Lightbulb className="w-3 h-3" /> Gas</span>
              <span className="text-white font-medium">{fmt(gasCost)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-white/60 text-sm flex items-center gap-2">💧 Water</span>
              <span className="text-white font-medium">{fmt(waterCost)}</span>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-white/60 text-xs">Annual Projection</div>
            <div className="text-xl font-bold text-white">{fmt(annualCost)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingOptimizer() {
  const [values, setValues] = useState({
    currentWashPrice: 4.00,
    currentDryPrice: 3.00,
    competitorWash: 4.50,
    competitorDry: 3.50,
    demandLevel: 70,
    costPerWash: 0.80,
    costPerDry: 0.40,
  });

  const optimalWash = Math.max(values.costPerWash * 4, (values.currentWashPrice + values.competitorWash) / 2 + (values.demandLevel > 70 ? 0.50 : -0.25));
  const optimalDry = Math.max(values.costPerDry * 4, (values.currentDryPrice + values.competitorDry) / 2 + (values.demandLevel > 70 ? 0.25 : -0.15));
  const potentialUplift = ((optimalWash - values.currentWashPrice) + (optimalDry - values.currentDryPrice)) * 1000;
  const pricingScore = Math.min(100, 50 + (values.demandLevel / 2) + ((optimalWash > values.currentWashPrice ? 15 : -10)));
  const grade = getCleanbiGrade(pricingScore);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/80">Your Wash Price</Label>
              <Input type="number" step="0.25" value={values.currentWashPrice} onChange={(e) => setValues({ ...values, currentWashPrice: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" data-testid="input-pricing-wash" />
            </div>
            <div>
              <Label className="text-white/80">Your Dry Price</Label>
              <Input type="number" step="0.25" value={values.currentDryPrice} onChange={(e) => setValues({ ...values, currentDryPrice: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/80">Competitor Wash</Label>
              <Input type="number" step="0.25" value={values.competitorWash} onChange={(e) => setValues({ ...values, competitorWash: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white/80">Competitor Dry</Label>
              <Input type="number" step="0.25" value={values.competitorDry} onChange={(e) => setValues({ ...values, competitorDry: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
            </div>
          </div>
          <div>
            <Label className="text-white/80">Demand Level: {values.demandLevel}%</Label>
            <Slider value={[values.demandLevel]} onValueChange={(v) => setValues({ ...values, demandLevel: v[0] })} max={100} step={5} className="mt-2" />
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${grade.bg} text-center`}>
            <div className="text-white/60 text-sm mb-1">Pricing Grade</div>
            <div className={`text-5xl font-black ${grade.color}`} data-testid="text-pricing-grade">{grade.grade}</div>
          </div>

          <div className="p-4 bg-[#39CCCC]/10 rounded-lg border border-[#39CCCC]/30">
            <div className="text-white/60 text-sm mb-2">Optimal Prices</div>
            <div className="flex justify-between">
              <div>
                <div className="text-white/60 text-xs">Wash</div>
                <div className="text-2xl font-bold text-[#39CCCC]">${optimalWash.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Dry</div>
                <div className="text-2xl font-bold text-[#39CCCC]">${optimalDry.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-white/60 text-xs">Est. Monthly Uplift</div>
            <div className="text-lg font-bold text-green-400">+${potentialUplift.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpansionPlanner() {
  const [values, setValues] = useState({
    currentStores: 1,
    currentRevenue: 25000,
    newMachines: 10,
    machineRevenue: 800,
    expansionCost: 50000,
  });

  const additionalRevenue = values.newMachines * values.machineRevenue;
  const newTotalRevenue = values.currentRevenue + additionalRevenue;
  const roi = ((additionalRevenue * 12) / values.expansionCost) * 100;
  const paybackMonths = values.expansionCost / additionalRevenue;
  const expansionScore = Math.min(100, roi / 2 + (12 - Math.min(paybackMonths, 12)) * 4);
  const grade = getCleanbiGrade(expansionScore);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <Label className="text-white/80">Current Stores</Label>
            <Input type="number" value={values.currentStores} onChange={(e) => setValues({ ...values, currentStores: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" data-testid="input-expansion-stores" />
          </div>
          <div>
            <Label className="text-white/80">Current Monthly Revenue</Label>
            <Input type="number" value={values.currentRevenue} onChange={(e) => setValues({ ...values, currentRevenue: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">New Machines to Add</Label>
            <Input type="number" value={values.newMachines} onChange={(e) => setValues({ ...values, newMachines: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Revenue per Machine ($)</Label>
            <Input type="number" value={values.machineRevenue} onChange={(e) => setValues({ ...values, machineRevenue: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Expansion Cost ($)</Label>
            <Input type="number" value={values.expansionCost} onChange={(e) => setValues({ ...values, expansionCost: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${grade.bg} text-center`}>
            <div className="text-white/60 text-sm mb-1">Expansion Grade</div>
            <div className={`text-5xl font-black ${grade.color}`} data-testid="text-expansion-grade">{grade.grade}</div>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-white/60 text-sm">New Total Revenue</div>
            <div className="text-3xl font-bold text-green-400">{fmt(newTotalRevenue)}/mo</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/60 text-xs">Annual ROI</div>
              <div className="text-lg font-bold text-[#39CCCC]">{roi.toFixed(0)}%</div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="text-white/60 text-xs">Payback</div>
              <div className="text-lg font-bold text-amber-400">{paybackMonths.toFixed(1)} mo</div>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/60 text-xs">Additional Monthly Revenue</div>
            <div className="text-lg font-bold text-white">+{fmt(additionalRevenue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancingCalculator() {
  const [values, setValues] = useState({
    loanAmount: 200000,
    interestRate: 7,
    loanTerm: 10,
    downPayment: 50000,
  });

  const principal = values.loanAmount - values.downPayment;
  const monthlyRate = values.interestRate / 100 / 12;
  const numPayments = values.loanTerm * 12;
  const monthlyPayment = monthlyRate === 0 
    ? principal / numPayments 
    : principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalPayments = monthlyPayment * numPayments;
  const totalInterest = totalPayments - principal;
  const financingScore = Math.max(0, Math.min(100, 100 - (values.interestRate * 5) - (values.loanTerm * 2)));
  const grade = getCleanbiGrade(financingScore);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <Label className="text-white/80">Loan Amount ($)</Label>
            <Input type="number" value={values.loanAmount} onChange={(e) => setValues({ ...values, loanAmount: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" data-testid="input-financing-amount" />
          </div>
          <div>
            <Label className="text-white/80">Down Payment ($)</Label>
            <Input type="number" value={values.downPayment} onChange={(e) => setValues({ ...values, downPayment: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Interest Rate (%)</Label>
            <Input type="number" step="0.25" value={values.interestRate} onChange={(e) => setValues({ ...values, interestRate: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white/80">Loan Term (Years)</Label>
            <Input type="number" value={values.loanTerm} onChange={(e) => setValues({ ...values, loanTerm: Number(e.target.value) })} className="mt-1 bg-white/10 border-white/20 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${grade.bg} text-center`}>
            <div className="text-white/60 text-sm mb-1">Financing Grade</div>
            <div className={`text-5xl font-black ${grade.color}`} data-testid="text-financing-grade">{grade.grade}</div>
          </div>

          <div className="p-4 bg-[#39CCCC]/10 rounded-lg border border-[#39CCCC]/30">
            <div className="text-white/60 text-sm">Monthly Payment</div>
            <div className="text-3xl font-bold text-[#39CCCC]">{fmt(monthlyPayment)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-white/60 text-xs">Principal</div>
              <div className="text-lg font-bold text-white">{fmt(principal)}</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="text-white/60 text-xs">Total Interest</div>
              <div className="text-lg font-bold text-red-400">{fmt(totalInterest)}</div>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/60 text-xs">Total Cost</div>
            <div className="text-lg font-bold text-white">{fmt(totalPayments)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
