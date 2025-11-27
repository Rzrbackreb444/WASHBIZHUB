import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, DollarSign, Download, Target, AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface YearlyProjection {
  year: number;
  revenue: number;
  expenses: number;
  netIncome: number;
  cumulativeCashFlow: number;
  roi: number;
}

export default function ROICalculatorAdvanced() {
  const [inputs, setInputs] = useState({
    purchasePrice: 250000,
    downPayment: 50000,
    loanRate: 7.5,
    loanTerm: 15,
    monthlyRevenue: 18000,
    monthlyExpenses: 12000,
    annualRevenueGrowth: 3,
    annualExpenseGrowth: 2.5,
    exitYear: 10,
    exitMultiple: 3.5,
  });

  const [projectionYears, setProjectionYears] = useState(10);

  // Loan calculations
  const loanAmount = inputs.purchasePrice - inputs.downPayment;
  const monthlyRate = inputs.loanRate / 100 / 12;
  const totalPayments = inputs.loanTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
  const annualDebtService = monthlyPayment * 12;

  // Generate yearly projections
  const generateProjections = (): YearlyProjection[] => {
    const projections: YearlyProjection[] = [];
    let cumulativeCashFlow = -inputs.downPayment; // Initial investment

    for (let year = 1; year <= projectionYears; year++) {
      const revenue = inputs.monthlyRevenue * 12 * Math.pow(1 + inputs.annualRevenueGrowth / 100, year - 1);
      const expenses = inputs.monthlyExpenses * 12 * Math.pow(1 + inputs.annualExpenseGrowth / 100, year - 1);
      const netIncome = revenue - expenses - annualDebtService;
      cumulativeCashFlow += netIncome;
      const roi = (cumulativeCashFlow / inputs.downPayment) * 100;

      projections.push({
        year,
        revenue,
        expenses: expenses + annualDebtService,
        netIncome,
        cumulativeCashFlow,
        roi,
      });
    }

    return projections;
  };

  const projections = generateProjections();
  const finalProjection = projections[projections.length - 1];

  // Exit valuation
  const exitRevenue = inputs.monthlyRevenue * 12 * Math.pow(1 + inputs.annualRevenueGrowth / 100, inputs.exitYear - 1);
  const exitValue = exitRevenue * inputs.exitMultiple;
  const totalGain = (finalProjection?.cumulativeCashFlow || 0) + exitValue;
  const totalROI = ((totalGain - inputs.downPayment) / inputs.downPayment) * 100;

  // DSCR (Debt Service Coverage Ratio)
  const firstYearNetOperatingIncome = inputs.monthlyRevenue * 12 - inputs.monthlyExpenses * 12;
  const dscr = firstYearNetOperatingIncome / annualDebtService;

  // Cash on Cash Return
  const firstYearCashFlow = firstYearNetOperatingIncome - annualDebtService;
  const cashOnCashReturn = (firstYearCashFlow / inputs.downPayment) * 100;

  // Payback period
  const paybackYear = projections.findIndex(p => p.cumulativeCashFlow >= 0) + 1;

  const exportResults = () => {
    const data = {
      inputs,
      metrics: {
        dscr: dscr.toFixed(2),
        cashOnCashReturn: cashOnCashReturn.toFixed(2),
        paybackPeriod: paybackYear,
        finalROI: finalProjection?.roi.toFixed(2),
        totalROI: totalROI.toFixed(2),
        exitValue: exitValue.toFixed(0),
      },
      projections,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roi-analysis-${Date.now()}.json`;
    a.click();
  };

  return (
    <>
      <Helmet>
        <title>Advanced ROI Calculator - WashBizHub</title>
        <meta name="description" content="Multi-year ROI projections with DSCR, cash-on-cash return, and exit valuation modeling for laundromat investments." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-10 h-10 text-green-400" />
              <h1 className="text-4xl font-bold text-foreground">
                Advanced ROI Calculator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {projectionYears}-year projections with DSCR, cash-on-cash return, and exit valuation modeling
            </p>
            <Badge variant="default" className="mt-4 bg-amber-600">
              Investment Analysis
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inputs */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Details</CardTitle>
                  <CardDescription>Enter deal parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={inputs.purchasePrice}
                      onChange={(e) => setInputs({ ...inputs, purchasePrice: parseFloat(e.target.value) || 0 })}
                      data-testid="input-purchase-price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={inputs.downPayment}
                      onChange={(e) => setInputs({ ...inputs, downPayment: parseFloat(e.target.value) || 0 })}
                      data-testid="input-down-payment"
                    />
                    <div className="text-xs text-muted-foreground">
                      {((inputs.downPayment / inputs.purchasePrice) * 100).toFixed(1)}% down
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanRate">Loan Rate (%)</Label>
                      <Input
                        id="loanRate"
                        type="number"
                        step="0.25"
                        value={inputs.loanRate}
                        onChange={(e) => setInputs({ ...inputs, loanRate: parseFloat(e.target.value) || 0 })}
                        data-testid="input-loan-rate"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loanTerm">Loan Term (yrs)</Label>
                      <Input
                        id="loanTerm"
                        type="number"
                        value={inputs.loanTerm}
                        onChange={(e) => setInputs({ ...inputs, loanTerm: parseInt(e.target.value) || 0 })}
                        data-testid="input-loan-term"
                      />
                    </div>
                  </div>

                  <div className="text-sm p-3 bg-muted/50 rounded-md">
                    <div className="font-medium mb-1">Monthly Payment</div>
                    <div className="text-2xl font-bold">${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="monthlyRevenue">Monthly Revenue</Label>
                    <Input
                      id="monthlyRevenue"
                      type="number"
                      value={inputs.monthlyRevenue}
                      onChange={(e) => setInputs({ ...inputs, monthlyRevenue: parseFloat(e.target.value) || 0 })}
                      data-testid="input-monthly-revenue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                    <Input
                      id="monthlyExpenses"
                      type="number"
                      value={inputs.monthlyExpenses}
                      onChange={(e) => setInputs({ ...inputs, monthlyExpenses: parseFloat(e.target.value) || 0 })}
                      data-testid="input-monthly-expenses"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualRevenueGrowth">Revenue Growth (%)</Label>
                      <Input
                        id="annualRevenueGrowth"
                        type="number"
                        step="0.5"
                        value={inputs.annualRevenueGrowth}
                        onChange={(e) => setInputs({ ...inputs, annualRevenueGrowth: parseFloat(e.target.value) || 0 })}
                        data-testid="input-revenue-growth"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="annualExpenseGrowth">Expense Growth (%)</Label>
                      <Input
                        id="annualExpenseGrowth"
                        type="number"
                        step="0.5"
                        value={inputs.annualExpenseGrowth}
                        onChange={(e) => setInputs({ ...inputs, annualExpenseGrowth: parseFloat(e.target.value) || 0 })}
                        data-testid="input-expense-growth"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="projectionYears">Projection Years</Label>
                    <Input
                      id="projectionYears"
                      type="number"
                      min="1"
                      max="30"
                      value={projectionYears}
                      onChange={(e) => setProjectionYears(parseInt(e.target.value) || 10)}
                      data-testid="input-projection-years"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exitYear">Exit Year</Label>
                      <Input
                        id="exitYear"
                        type="number"
                        value={inputs.exitYear}
                        onChange={(e) => setInputs({ ...inputs, exitYear: parseInt(e.target.value) || 0 })}
                        data-testid="input-exit-year"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exitMultiple">Exit Multiple</Label>
                      <Input
                        id="exitMultiple"
                        type="number"
                        step="0.5"
                        value={inputs.exitMultiple}
                        onChange={(e) => setInputs({ ...inputs, exitMultiple: parseFloat(e.target.value) || 0 })}
                        data-testid="input-exit-multiple"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                  <TabsTrigger value="projections">Projections</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">DSCR</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold ${dscr >= 1.25 ? 'text-green-600' : dscr >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`} data-testid="text-dscr">
                          {dscr.toFixed(2)}x
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {dscr >= 1.25 ? 'Excellent' : dscr >= 1.0 ? 'Acceptable' : 'Risky'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cash-on-Cash</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold ${cashOnCashReturn >= 15 ? 'text-green-600' : cashOnCashReturn >= 10 ? 'text-yellow-600' : 'text-red-600'}`} data-testid="text-coc">
                          {cashOnCashReturn.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Year 1 return
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Payback Period</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold" data-testid="text-payback">
                          {paybackYear > 0 ? `${paybackYear} yrs` : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Breakeven time
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{projectionYears}-Year ROI</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold ${(finalProjection?.roi || 0) >= 100 ? 'text-green-600' : 'text-yellow-600'}`} data-testid="text-final-roi">
                          {finalProjection?.roi.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          On cash invested
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Exit Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600" data-testid="text-exit-value">
                          ${(exitValue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Year {inputs.exitYear}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total ROI</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold ${totalROI >= 200 ? 'text-green-600' : 'text-yellow-600'}`} data-testid="text-total-roi">
                          {totalROI.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          With exit
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {dscr < 1.0 && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-800">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Low DSCR Warning
                        </div>
                        <div className="text-red-700 dark:text-red-300">
                          DSCR below 1.0 means operating income doesn't cover debt service. 
                          Lenders typically require 1.25x minimum. Consider increasing down payment or negotiating better terms.
                        </div>
                      </div>
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Investment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Price</span>
                        <span className="font-bold">${inputs.purchasePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Down Payment</span>
                        <span className="font-bold">${inputs.downPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loan Amount</span>
                        <span className="font-bold">${loanAmount.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cash Invested</span>
                        <span className="font-bold">${inputs.downPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{projectionYears}-Year Cash Flow</span>
                        <span className="font-bold">${(finalProjection?.cumulativeCashFlow || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exit Proceeds</span>
                        <span className="font-bold">${exitValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base">
                        <span className="font-semibold">Total Gain</span>
                        <span className="font-bold text-green-600">${totalGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full" onClick={exportResults} data-testid="button-export">
                    <Download className="w-4 h-4 mr-2" />
                    Export Analysis
                  </Button>
                </TabsContent>

                <TabsContent value="projections" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Year-by-Year Projections</CardTitle>
                      <CardDescription>{projectionYears} years of financial forecasting</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                          <div>Year</div>
                          <div className="text-right">Revenue</div>
                          <div className="text-right">Expenses</div>
                          <div className="text-right">Net Income</div>
                          <div className="text-right">ROI</div>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto space-y-1">
                          {projections.map((p) => (
                            <div key={p.year} className="grid grid-cols-5 gap-2 text-sm py-2 hover:bg-muted/50 rounded px-2">
                              <div className="font-medium">Year {p.year}</div>
                              <div className="text-right">${(p.revenue / 1000).toFixed(0)}K</div>
                              <div className="text-right">${(p.expenses / 1000).toFixed(0)}K</div>
                              <div className={`text-right font-medium ${p.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${(p.netIncome / 1000).toFixed(0)}K
                              </div>
                              <div className={`text-right font-medium ${p.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {p.roi.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
