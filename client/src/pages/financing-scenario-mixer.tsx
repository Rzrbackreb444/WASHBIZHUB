import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calculator, TrendingUp, DollarSign, Percent, Calendar, 
  BarChart3, Building2, AlertTriangle, CheckCircle, Info,
  ArrowRight, Shield, PiggyBank, Scale, Sparkles
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip, Cell } from "recharts";

interface ScenarioResult {
  name: string;
  interestRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  dscr: number;
  cashFlowAfterDebt: number;
  annualDebtService: number;
}

const SCENARIO_COLORS = {
  conservative: "#22C55E",
  moderate: "#F59E0B", 
  aggressive: "#EF4444"
};

export default function FinancingScenarioMixer() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(10);
  const [monthlyRevenue, setMonthlyRevenue] = useState(35000);
  const [operatingExpenses, setOperatingExpenses] = useState(15000);
  const [conservativeRate, setConservativeRate] = useState(6.5);
  const [moderateRate, setModerateRate] = useState(8.0);
  const [aggressiveRate, setAggressiveRate] = useState(10.5);
  const [showResults, setShowResults] = useState(false);

  const calculateScenario = (interestRate: number, name: string): ScenarioResult => {
    const downPayment = loanAmount * (downPaymentPercent / 100);
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                       (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = principal / numberOfPayments;
    }
    
    const totalPayments = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayments - principal;
    const totalCost = totalPayments + downPayment;
    const annualDebtService = monthlyPayment * 12;
    const netOperatingIncome = (monthlyRevenue - operatingExpenses) * 12;
    const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;
    const cashFlowAfterDebt = monthlyRevenue - operatingExpenses - monthlyPayment;

    return {
      name,
      interestRate,
      monthlyPayment,
      totalInterest,
      totalCost,
      dscr,
      cashFlowAfterDebt,
      annualDebtService
    };
  };

  const scenarios = useMemo(() => {
    if (!showResults) return [];
    return [
      calculateScenario(conservativeRate, "Conservative"),
      calculateScenario(moderateRate, "Moderate"),
      calculateScenario(aggressiveRate, "Aggressive")
    ];
  }, [showResults, loanAmount, downPaymentPercent, loanTermYears, monthlyRevenue, operatingExpenses, conservativeRate, moderateRate, aggressiveRate]);

  const chartData = useMemo(() => {
    if (scenarios.length === 0) return [];
    return [
      {
        metric: "Monthly Payment",
        Conservative: scenarios[0].monthlyPayment,
        Moderate: scenarios[1].monthlyPayment,
        Aggressive: scenarios[2].monthlyPayment
      },
      {
        metric: "Total Interest",
        Conservative: scenarios[0].totalInterest,
        Moderate: scenarios[1].totalInterest,
        Aggressive: scenarios[2].totalInterest
      },
      {
        metric: "Cash Flow",
        Conservative: scenarios[0].cashFlowAfterDebt,
        Moderate: scenarios[1].cashFlowAfterDebt,
        Aggressive: scenarios[2].cashFlowAfterDebt
      }
    ];
  }, [scenarios]);

  const formatCurrency = (value: number): string => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatFullCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getDSCRStatus = (dscr: number) => {
    if (dscr >= 1.25) return { color: "text-green-600", label: "Strong", icon: CheckCircle };
    if (dscr >= 1.0) return { color: "text-orange-600", label: "Marginal", icon: AlertTriangle };
    return { color: "text-red-600", label: "Risky", icon: AlertTriangle };
  };

  const downPayment = loanAmount * (downPaymentPercent / 100);
  const principal = loanAmount - downPayment;

  return (
    <>
      <SEO
        title="Financing Scenario Mixer Calculator | Compare Loan Options | WashBizHub"
        description="Compare 3 financing scenarios side-by-side for your laundromat investment. Calculate monthly payments, DSCR, cash flow, and total cost across conservative, moderate, and aggressive interest rates."
        canonicalUrl="/financing-scenario-mixer"
        ogType="website"
        keywords={[
          "laundromat financing calculator",
          "loan comparison calculator",
          "DSCR calculator",
          "debt service coverage ratio",
          "laundromat loan calculator",
          "financing scenario comparison",
          "business loan calculator",
          "laundromat investment financing"
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Financing Scenario Mixer", url: "/financing-scenario-mixer" }
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Scale className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661] mb-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium Calculator
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="calculator-title">
                  Financing Scenario Mixer
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-3xl" data-testid="calculator-description">
              Compare three financing scenarios side-by-side to find the optimal loan structure for your laundromat acquisition. 
              Analyze monthly payments, total interest, DSCR, and cash flow across conservative, moderate, and aggressive interest rates.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="bg-card border shadow-sm sticky top-4">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#C8A661]" />
                    Input Parameters
                  </CardTitle>
                  <CardDescription>Configure your financing scenarios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Total Purchase Price
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Total acquisition cost including equipment and business value</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="text-right font-mono"
                      data-testid="input-loan-amount"
                    />
                    <Slider
                      value={[loanAmount]}
                      onValueChange={([v]) => setLoanAmount(v)}
                      min={100000}
                      max={2000000}
                      step={10000}
                      data-testid="slider-loan-amount"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$100K</span>
                      <span className="font-medium text-foreground">{formatCurrency(loanAmount)}</span>
                      <span>$2M</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                        Down Payment
                      </Label>
                      <span className="text-sm font-medium text-[#C8A661]">{formatCurrency(downPayment)}</span>
                    </div>
                    <Slider
                      value={[downPaymentPercent]}
                      onValueChange={([v]) => setDownPaymentPercent(v)}
                      min={0}
                      max={50}
                      step={1}
                      data-testid="slider-down-payment"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="font-medium text-foreground">{downPaymentPercent}%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Loan Term
                      </Label>
                    </div>
                    <Slider
                      value={[loanTermYears]}
                      onValueChange={([v]) => setLoanTermYears(v)}
                      min={5}
                      max={25}
                      step={1}
                      data-testid="slider-loan-term"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 yrs</span>
                      <span className="font-medium text-foreground">{loanTermYears} years</span>
                      <span>25 yrs</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Interest Rate Scenarios</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          Conservative
                        </span>
                        <span className="text-sm font-medium">{conservativeRate}%</span>
                      </div>
                      <Slider
                        value={[conservativeRate]}
                        onValueChange={([v]) => setConservativeRate(v)}
                        min={4}
                        max={12}
                        step={0.25}
                        data-testid="slider-conservative-rate"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          Moderate
                        </span>
                        <span className="text-sm font-medium">{moderateRate}%</span>
                      </div>
                      <Slider
                        value={[moderateRate]}
                        onValueChange={([v]) => setModerateRate(v)}
                        min={4}
                        max={15}
                        step={0.25}
                        data-testid="slider-moderate-rate"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          Aggressive
                        </span>
                        <span className="text-sm font-medium">{aggressiveRate}%</span>
                      </div>
                      <Slider
                        value={[aggressiveRate]}
                        onValueChange={([v]) => setAggressiveRate(v)}
                        min={6}
                        max={18}
                        step={0.25}
                        data-testid="slider-aggressive-rate"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Revenue & Expenses</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                        <span className="text-sm font-medium">{formatCurrency(monthlyRevenue)}</span>
                      </div>
                      <Slider
                        value={[monthlyRevenue]}
                        onValueChange={([v]) => setMonthlyRevenue(v)}
                        min={10000}
                        max={100000}
                        step={1000}
                        data-testid="slider-monthly-revenue"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Operating Expenses</span>
                        <span className="text-sm font-medium">{formatCurrency(operatingExpenses)}</span>
                      </div>
                      <Slider
                        value={[operatingExpenses]}
                        onValueChange={([v]) => setOperatingExpenses(v)}
                        min={5000}
                        max={50000}
                        step={500}
                        data-testid="slider-operating-expenses"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => setShowResults(true)} 
                    className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                    data-testid="button-calculate"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Compare Scenarios
                  </Button>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Loan Principal:</span>
                        <span className="font-medium text-foreground" data-testid="text-principal">{formatCurrency(principal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly NOI:</span>
                        <span className="font-medium text-foreground" data-testid="text-monthly-noi">{formatCurrency(monthlyRevenue - operatingExpenses)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {showResults && scenarios.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    {scenarios.map((scenario, index) => {
                      const dscrStatus = getDSCRStatus(scenario.dscr);
                      const StatusIcon = dscrStatus.icon;
                      const colorKey = scenario.name.toLowerCase() as keyof typeof SCENARIO_COLORS;
                      const borderColor = SCENARIO_COLORS[colorKey];
                      
                      return (
                        <Card 
                          key={scenario.name} 
                          className="bg-card border shadow-sm overflow-hidden"
                          data-testid={`card-scenario-${scenario.name.toLowerCase()}`}
                        >
                          <div className="h-1" style={{ backgroundColor: borderColor }} />
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Badge 
                                className="text-white"
                                style={{ backgroundColor: borderColor }}
                              >
                                {scenario.name}
                              </Badge>
                              <span className="text-lg font-bold">{scenario.interestRate}%</span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <div className="text-xs text-muted-foreground mb-1">Monthly Payment</div>
                                <div 
                                  className="text-xl font-bold text-[#C8A661]"
                                  data-testid={`value-monthly-payment-${scenario.name.toLowerCase()}`}
                                >
                                  {formatFullCurrency(scenario.monthlyPayment)}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-muted/30 rounded p-2">
                                  <div className="text-xs text-muted-foreground">Total Interest</div>
                                  <div 
                                    className="font-semibold text-red-600"
                                    data-testid={`value-total-interest-${scenario.name.toLowerCase()}`}
                                  >
                                    {formatCurrency(scenario.totalInterest)}
                                  </div>
                                </div>
                                <div className="bg-muted/30 rounded p-2">
                                  <div className="text-xs text-muted-foreground">Total Cost</div>
                                  <div 
                                    className="font-semibold"
                                    data-testid={`value-total-cost-${scenario.name.toLowerCase()}`}
                                  >
                                    {formatCurrency(scenario.totalCost)}
                                  </div>
                                </div>
                              </div>

                              <div className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-muted-foreground">DSCR</span>
                                  <div className="flex items-center gap-1">
                                    <StatusIcon className={`h-4 w-4 ${dscrStatus.color}`} />
                                    <span className={`text-xs font-medium ${dscrStatus.color}`}>
                                      {dscrStatus.label}
                                    </span>
                                  </div>
                                </div>
                                <div 
                                  className={`text-2xl font-bold ${dscrStatus.color}`}
                                  data-testid={`value-dscr-${scenario.name.toLowerCase()}`}
                                >
                                  {scenario.dscr.toFixed(2)}x
                                </div>
                              </div>

                              <div className="bg-muted/50 rounded-lg p-3">
                                <div className="text-xs text-muted-foreground mb-1">Cash Flow After Debt</div>
                                <div 
                                  className={`text-lg font-bold ${scenario.cashFlowAfterDebt >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                  data-testid={`value-cash-flow-${scenario.name.toLowerCase()}`}
                                >
                                  {formatFullCurrency(scenario.cashFlowAfterDebt)}/mo
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                        Scenario Comparison Chart
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80" data-testid="chart-comparison">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="metric" className="text-xs" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} className="text-xs" />
                            <RechartsTooltip
                              formatter={(value: number) => formatFullCurrency(value)}
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="Conservative" fill={SCENARIO_COLORS.conservative} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Moderate" fill={SCENARIO_COLORS.moderate} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Aggressive" fill={SCENARIO_COLORS.aggressive} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[#C8A661]" />
                        Detailed Comparison Table
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" data-testid="table-comparison">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Metric</th>
                              <th className="text-right py-3 px-4 font-medium text-green-600">Conservative</th>
                              <th className="text-right py-3 px-4 font-medium text-orange-600">Moderate</th>
                              <th className="text-right py-3 px-4 font-medium text-red-600">Aggressive</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-3 px-4 text-muted-foreground">Interest Rate</td>
                              {scenarios.map(s => (
                                <td key={s.name} className="text-right py-3 px-4 font-medium" data-testid={`cell-rate-${s.name.toLowerCase()}`}>
                                  {s.interestRate}%
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 text-muted-foreground">Monthly Payment</td>
                              {scenarios.map(s => (
                                <td key={s.name} className="text-right py-3 px-4 font-medium">
                                  {formatFullCurrency(s.monthlyPayment)}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 text-muted-foreground">Annual Debt Service</td>
                              {scenarios.map(s => (
                                <td key={s.name} className="text-right py-3 px-4 font-medium" data-testid={`cell-annual-debt-${s.name.toLowerCase()}`}>
                                  {formatFullCurrency(s.annualDebtService)}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 text-muted-foreground">Total Interest Paid</td>
                              {scenarios.map(s => (
                                <td key={s.name} className="text-right py-3 px-4 font-medium text-red-600">
                                  {formatFullCurrency(s.totalInterest)}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 text-muted-foreground">Total Cost of Financing</td>
                              {scenarios.map(s => (
                                <td key={s.name} className="text-right py-3 px-4 font-medium">
                                  {formatFullCurrency(s.totalCost)}
                                </td>
                              ))}
                            </tr>
                            <tr className="border-b bg-muted/30">
                              <td className="py-3 px-4 font-medium">DSCR</td>
                              {scenarios.map(s => {
                                const status = getDSCRStatus(s.dscr);
                                return (
                                  <td key={s.name} className={`text-right py-3 px-4 font-bold ${status.color}`}>
                                    {s.dscr.toFixed(2)}x
                                  </td>
                                );
                              })}
                            </tr>
                            <tr className="bg-muted/30">
                              <td className="py-3 px-4 font-medium">Monthly Cash Flow</td>
                              {scenarios.map(s => (
                                <td 
                                  key={s.name} 
                                  className={`text-right py-3 px-4 font-bold ${s.cashFlowAfterDebt >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                >
                                  {formatFullCurrency(s.cashFlowAfterDebt)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="py-20 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Scale className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Configure Your Scenarios</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Adjust the loan parameters and interest rate scenarios on the left, then click "Compare Scenarios" to see detailed analysis.
                    </p>
                    <Button 
                      onClick={() => setShowResults(true)}
                      className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                      data-testid="button-get-started"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-[#C8A661]" />
                    Understanding Your Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#C8A661]" />
                        DSCR Guidelines
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span><strong>1.25x+:</strong> Strong - Comfortable debt coverage</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          <span><strong>1.0-1.24x:</strong> Marginal - Lender may require more down payment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span><strong>&lt;1.0x:</strong> Risky - Cash flow doesn't cover debt</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#C8A661]" />
                        Key Formulas
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li><strong>Monthly Payment:</strong> P × [r(1+r)^n] / [(1+r)^n – 1]</li>
                        <li><strong>Total Interest:</strong> (Payment × Months) - Principal</li>
                        <li><strong>DSCR:</strong> NOI / Annual Debt Service</li>
                        <li><strong>Cash Flow:</strong> Revenue - Expenses - Debt Service</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[#0A1628] rounded-lg p-4 text-white">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#C8A661]" />
                      Pro Tips
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• SBA loans typically offer 6-8% rates with 10-25 year terms</li>
                      <li>• Most lenders require minimum DSCR of 1.20-1.25x</li>
                      <li>• Higher down payments can secure better interest rates</li>
                      <li>• Consider loan terms that match your investment timeline</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <CalculatorDisclaimer calculatorType="Financing Scenario Mixer Calculator" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
