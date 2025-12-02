import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Calculator, DollarSign, TrendingUp, Building2, Wrench, 
  Plus, ExternalLink, RefreshCw, Loader2
} from "lucide-react";

interface CalculatorType {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
}

interface CalculatorSheet {
  id: string;
  name: string;
  url: string;
}

const CALCULATOR_TYPES: CalculatorType[] = [
  {
    id: 'valuation',
    title: 'Business Valuation',
    icon: DollarSign,
    color: '#10b981',
    description: 'Calculate laundromat value using SDE multiples and asset-based methods',
  },
  {
    id: 'roi',
    title: 'ROI Calculator',
    icon: TrendingUp,
    color: '#8b5cf6',
    description: 'Analyze return on investment with detailed annual projections',
  },
  {
    id: 'startup',
    title: 'Startup Costs',
    icon: Building2,
    color: '#3b82f6',
    description: 'Estimate total capital requirements for opening a laundromat',
  },
  {
    id: 'operations',
    title: 'Operating Costs',
    icon: Wrench,
    color: '#f59e0b',
    description: 'Calculate utilities, labor, and maintenance expenses',
  },
];

export default function CalculatorsHub() {
  const { toast } = useToast();
  const [activeCalculator, setActiveCalculator] = useState<string>('valuation');
  const [sheetData, setSheetData] = useState<any[][] | null>(null);

  // Fetch existing calculator sheets
  const { data: sheets, isLoading: sheetsLoading } = useQuery<CalculatorSheet[]>({
    queryKey: ['/api/calculators/list'],
  });

  // Fetch calculator data for a specific sheet
  const { data: calcData, isLoading: dataLoading, refetch: refetchData } = useQuery({
    queryKey: ['/api/calculators/data', sheets?.[0]?.id],
    enabled: !!sheets?.[0]?.id,
  });

  // Create new calculator mutation
  const createCalcMutation = useMutation({
    mutationFn: async (type: string) => {
      return apiRequest('/api/calculators/create', {
        method: 'POST',
        body: JSON.stringify({ type }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Calculator Created",
        description: "Your Google Sheet calculator is ready!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calculators/list'] });
      // Open the sheet in a new tab
      if (data.spreadsheetUrl) {
        window.open(data.spreadsheetUrl, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create calculator",
        variant: "destructive",
      });
    },
  });

  const selectedType = CALCULATOR_TYPES.find(c => c.id === activeCalculator) || CALCULATOR_TYPES[0];
  const existingSheet = sheets?.find(s => s.name.toLowerCase().includes(activeCalculator));

  return (
    <AuthGuard title="Sign In to Access Calculators" description="Sign in to access this calculator and track your usage.">
      <SEO
        title="Laundromat Calculators | WashBizHub"
        description="Professional calculators for laundromat owners - Business valuation, ROI analysis, startup costs, and operating expenses powered by Google Sheets."
        canonicalUrl="/calculators"
        keywords={["laundromat calculator", "laundry business ROI", "laundromat valuation"]}
        breadcrumbs={[{ name: "Calculators", url: "/calculators" }]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Calculators", url: "/calculators" }]} />
          </div>
        </div>

        <section className="py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <Badge className="mb-3 sm:mb-4 bg-primary/20 text-primary border-primary/30">
                <Calculator className="w-3 h-3 mr-1" />
                Professional Tools
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Laundromat Calculators
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                Professional calculators powered by Google Sheets. Create your own copy to save calculations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Left sidebar - Calculator types */}
              <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                {CALCULATOR_TYPES.map(calc => {
                  const isActive = activeCalculator === calc.id;
                  const Icon = calc.icon;
                  return (
                    <button
                      key={calc.id}
                      onClick={() => setActiveCalculator(calc.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                          : 'bg-card hover:bg-muted border-border'
                      }`}
                      data-testid={`button-calc-${calc.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${calc.color}20` }}
                        >
                          <Icon 
                            className="w-5 h-5" 
                            style={{ color: isActive ? 'currentColor' : calc.color }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold">{calc.title}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Existing sheets */}
                {sheets && sheets.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Your Calculators</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {sheetsLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </div>
                      ) : (
                        sheets.map(sheet => (
                          <a
                            key={sheet.id}
                            href={sheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded hover:bg-muted text-sm"
                          >
                            <span className="truncate">{sheet.name.replace('WashBizHub - ', '')}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main content */}
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 sm:p-3 rounded-xl flex-shrink-0"
                        style={{ backgroundColor: `${selectedType.color}20` }}
                      >
                        <selectedType.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: selectedType.color }} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-xl">{selectedType.title}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{selectedType.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      {existingSheet ? (
                        <a href={existingSheet.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" data-testid="button-open-sheet">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Sheet
                          </Button>
                        </a>
                      ) : (
                        <Button
                          onClick={() => createCalcMutation.mutate(activeCalculator)}
                          disabled={createCalcMutation.isPending}
                          size="sm"
                          data-testid="button-create-calc"
                        >
                          {createCalcMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          Create Calculator
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Calculator Preview/Embed */}
                    <div className="space-y-6">
                      {activeCalculator === 'valuation' && (
                        <ValuationCalculator />
                      )}
                      {activeCalculator === 'roi' && (
                        <ROICalculator />
                      )}
                      {activeCalculator === 'startup' && (
                        <StartupCalculator />
                      )}
                      {activeCalculator === 'operations' && (
                        <OperationsCalculator />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}

// Interactive Valuation Calculator Component
function ValuationCalculator() {
  const [values, setValues] = useState({
    revenue: 300000,
    cogs: 45000,
    operatingExpenses: 120000,
    ownerSalary: 50000,
    depreciation: 15000,
    interest: 8000,
    oneTimeExpenses: 5000,
    equipmentValue: 150000,
    inventory: 5000,
    improvements: 25000,
  });

  const grossProfit = values.revenue - values.cogs;
  const sde = grossProfit - values.operatingExpenses + values.ownerSalary + values.depreciation + values.interest + values.oneTimeExpenses;
  const lowValue = sde * 2;
  const midValue = sde * 2.5;
  const highValue = sde * 3;
  const assetValue = values.equipmentValue + values.inventory + values.improvements;
  const minValue = Math.max(lowValue, assetValue);

  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Income Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Income Data</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs sm:text-sm text-muted-foreground">Annual Gross Revenue</label>
              <Input
                type="number"
                value={values.revenue}
                onChange={(e) => setValues({...values, revenue: Number(e.target.value)})}
                className="mt-1"
                data-testid="input-revenue"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Cost of Goods Sold</label>
              <Input
                type="number"
                value={values.cogs}
                onChange={(e) => setValues({...values, cogs: Number(e.target.value)})}
                className="mt-1"
                data-testid="input-cogs"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Operating Expenses</label>
              <Input
                type="number"
                value={values.operatingExpenses}
                onChange={(e) => setValues({...values, operatingExpenses: Number(e.target.value)})}
                className="mt-1"
                data-testid="input-opex"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Owner Salary Add-back</label>
              <Input
                type="number"
                value={values.ownerSalary}
                onChange={(e) => setValues({...values, ownerSalary: Number(e.target.value)})}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Depreciation Add-back</label>
              <Input
                type="number"
                value={values.depreciation}
                onChange={(e) => setValues({...values, depreciation: Number(e.target.value)})}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Valuation Results</h3>
          
          <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-xs sm:text-sm text-muted-foreground">Seller's Discretionary Earnings (SDE)</div>
            <div className="text-2xl sm:text-3xl font-bold text-primary">{formatCurrency(sde)}</div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-muted rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Low (2.0x)</div>
              <div className="text-xs sm:text-sm font-semibold">{formatCurrency(lowValue)}</div>
            </div>
            <div className="p-2 sm:p-3 bg-primary/20 rounded-lg text-center border border-primary/30">
              <div className="text-xs text-muted-foreground">Mid (2.5x)</div>
              <div className="text-xs sm:text-sm font-bold text-primary">{formatCurrency(midValue)}</div>
            </div>
            <div className="p-2 sm:p-3 bg-muted rounded-lg text-center">
              <div className="text-xs text-muted-foreground">High (3.0x)</div>
              <div className="text-xs sm:text-sm font-semibold">{formatCurrency(highValue)}</div>
            </div>
          </div>

          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-sm text-muted-foreground">Asset-Based Value</div>
            <div className="text-xl font-semibold">{formatCurrency(assetValue)}</div>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-sm text-muted-foreground">Recommended Value Range</div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(minValue)} - {formatCurrency(highValue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interactive ROI Calculator Component
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
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const annualDebtService = monthlyPayment * 12;
  const noi = values.grossRevenue - values.operatingExpenses;
  const cashFlow = noi - annualDebtService;
  const cashOnCash = (cashFlow / values.downPayment) * 100;
  const capRate = (noi / values.purchasePrice) * 100;
  const paybackPeriod = values.downPayment / cashFlow;

  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  const formatPercent = (num: number) => `${num.toFixed(1)}%`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Investment Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs sm:text-sm text-muted-foreground">Purchase Price</label>
              <Input
                type="number"
                value={values.purchasePrice}
                onChange={(e) => setValues({...values, purchasePrice: Number(e.target.value)})}
                className="mt-1"
                data-testid="input-price"
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-muted-foreground">Down Payment</label>
              <Input
                type="number"
                value={values.downPayment}
                onChange={(e) => setValues({...values, downPayment: Number(e.target.value)})}
                className="mt-1"
                data-testid="input-down"
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-muted-foreground">Interest Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={values.interestRate}
                onChange={(e) => setValues({...values, interestRate: Number(e.target.value)})}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-muted-foreground">Annual Gross Revenue</label>
              <Input
                type="number"
                value={values.grossRevenue}
                onChange={(e) => setValues({...values, grossRevenue: Number(e.target.value)})}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-muted-foreground">Annual Operating Expenses</label>
              <Input
                type="number"
                value={values.operatingExpenses}
                onChange={(e) => setValues({...values, operatingExpenses: Number(e.target.value)})}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-base sm:text-lg border-b pb-2">ROI Metrics</h3>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-xs sm:text-sm text-muted-foreground">Cash-on-Cash Return</div>
              <div className="text-lg sm:text-2xl font-bold text-primary">{formatPercent(cashOnCash)}</div>
            </div>
            <div className="p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="text-xs sm:text-sm text-muted-foreground">Cap Rate</div>
              <div className="text-lg sm:text-2xl font-bold">{formatPercent(capRate)}</div>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-xs sm:text-sm text-muted-foreground">Annual Cash Flow</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(cashFlow)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Net Operating Income</div>
              <div className="text-xs sm:text-sm font-semibold">{formatCurrency(noi)}</div>
            </div>
            <div className="p-2 sm:p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Annual Debt Service</div>
              <div className="text-xs sm:text-sm font-semibold">{formatCurrency(annualDebtService)}</div>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="text-xs sm:text-sm text-muted-foreground">Payback Period</div>
            <div className="text-lg sm:text-xl font-bold">{paybackPeriod.toFixed(1)} years</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Startup Costs Calculator
function StartupCalculator() {
  const [values, setValues] = useState({
    washers: 20,
    washerCost: 5000,
    dryers: 20,
    dryerCost: 4000,
    leaseDeposit: 9000,
    plumbing: 15000,
    electrical: 10000,
    hvac: 8000,
    flooring: 5000,
    rentReserve: 9000,
    utilities: 3000,
    marketing: 2500,
    insurance: 5000,
  });

  const equipmentTotal = (values.washers * values.washerCost) + (values.dryers * values.dryerCost);
  const buildoutTotal = values.leaseDeposit + values.plumbing + values.electrical + values.hvac + values.flooring;
  const operatingTotal = values.rentReserve + values.utilities + values.marketing + values.insurance;
  const subtotal = equipmentTotal + buildoutTotal + operatingTotal;
  const contingency = subtotal * 0.1;
  const grandTotal = subtotal + contingency;

  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Equipment */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Equipment</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Washers</label>
                <Input type="number" value={values.washers} onChange={(e) => setValues({...values, washers: Number(e.target.value)})} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Cost Each</label>
                <Input type="number" value={values.washerCost} onChange={(e) => setValues({...values, washerCost: Number(e.target.value)})} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Dryers</label>
                <Input type="number" value={values.dryers} onChange={(e) => setValues({...values, dryers: Number(e.target.value)})} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Cost Each</label>
                <Input type="number" value={values.dryerCost} onChange={(e) => setValues({...values, dryerCost: Number(e.target.value)})} />
              </div>
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
            <div className="text-xs text-muted-foreground">Equipment Total</div>
            <div className="text-sm sm:text-base font-bold text-primary">{formatCurrency(equipmentTotal)}</div>
          </div>
        </div>

        {/* Build-out */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Build-out</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Lease Deposit</label>
              <Input type="number" value={values.leaseDeposit} onChange={(e) => setValues({...values, leaseDeposit: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Plumbing</label>
              <Input type="number" value={values.plumbing} onChange={(e) => setValues({...values, plumbing: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Electrical</label>
              <Input type="number" value={values.electrical} onChange={(e) => setValues({...values, electrical: Number(e.target.value)})} />
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-accent/10 rounded-lg">
            <div className="text-xs text-muted-foreground">Build-out Total</div>
            <div className="text-sm sm:text-base font-bold">{formatCurrency(buildoutTotal)}</div>
          </div>
        </div>

        {/* Operating Capital */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Operating Capital</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Rent Reserve (3mo)</label>
              <Input type="number" value={values.rentReserve} onChange={(e) => setValues({...values, rentReserve: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Marketing</label>
              <Input type="number" value={values.marketing} onChange={(e) => setValues({...values, marketing: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Insurance</label>
              <Input type="number" value={values.insurance} onChange={(e) => setValues({...values, insurance: Number(e.target.value)})} />
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-amber-500/10 rounded-lg">
            <div className="text-xs text-muted-foreground">Operating Total</div>
            <div className="text-sm sm:text-base font-bold">{formatCurrency(operatingTotal)}</div>
          </div>
        </div>
      </div>

      {/* Grand Total */}
      <div className="p-4 sm:p-6 bg-green-500/10 rounded-lg border border-green-500/20">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground">Subtotal</div>
            <div className="text-sm sm:text-lg md:text-xl font-semibold">{formatCurrency(subtotal)}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground">Contingency (10%)</div>
            <div className="text-sm sm:text-lg md:text-xl font-semibold">{formatCurrency(contingency)}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground">Grand Total</div>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-green-600">{formatCurrency(grandTotal)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Operations Calculator
function OperationsCalculator() {
  const [values, setValues] = useState({
    rent: 3000,
    insurance: 500,
    loanPayment: 2500,
    water: 800,
    gas: 600,
    electric: 1200,
    sewer: 720,
    supplies: 400,
    maintenance: 500,
    attendantWages: 4000,
    monthlyRevenue: 25000,
  });

  const fixedCosts = values.rent + values.insurance + values.loanPayment;
  const variableCosts = values.water + values.gas + values.electric + values.sewer + values.supplies + values.maintenance;
  const payrollTaxes = values.attendantWages * 0.1;
  const workersComp = values.attendantWages * 0.03;
  const laborCosts = values.attendantWages + payrollTaxes + workersComp;
  const totalMonthly = fixedCosts + variableCosts + laborCosts;
  const monthlyProfit = values.monthlyRevenue - totalMonthly;
  const profitMargin = (monthlyProfit / values.monthlyRevenue) * 100;

  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Fixed Costs */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Fixed Costs</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Rent</label>
              <Input type="number" value={values.rent} onChange={(e) => setValues({...values, rent: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Insurance</label>
              <Input type="number" value={values.insurance} onChange={(e) => setValues({...values, insurance: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Loan Payment</label>
              <Input type="number" value={values.loanPayment} onChange={(e) => setValues({...values, loanPayment: Number(e.target.value)})} />
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
            <div className="text-xs text-muted-foreground">Fixed Total</div>
            <div className="text-sm sm:text-base font-bold text-primary">{formatCurrency(fixedCosts)}/mo</div>
          </div>
        </div>

        {/* Variable Costs */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Utilities</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Water</label>
              <Input type="number" value={values.water} onChange={(e) => setValues({...values, water: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Gas</label>
              <Input type="number" value={values.gas} onChange={(e) => setValues({...values, gas: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Electric</label>
              <Input type="number" value={values.electric} onChange={(e) => setValues({...values, electric: Number(e.target.value)})} />
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-accent/10 rounded-lg">
            <div className="text-xs text-muted-foreground">Utilities Total</div>
            <div className="text-sm sm:text-base font-bold">{formatCurrency(variableCosts)}/mo</div>
          </div>
        </div>

        {/* Labor */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Labor</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Attendant Wages</label>
              <Input type="number" value={values.attendantWages} onChange={(e) => setValues({...values, attendantWages: Number(e.target.value)})} />
            </div>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              <div>+ Payroll Taxes: {formatCurrency(payrollTaxes)}</div>
              <div>+ Workers Comp: {formatCurrency(workersComp)}</div>
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-amber-500/10 rounded-lg">
            <div className="text-xs text-muted-foreground">Labor Total</div>
            <div className="text-sm sm:text-base font-bold">{formatCurrency(laborCosts)}/mo</div>
          </div>
        </div>
      </div>

      {/* Revenue & Profit */}
      <div className="p-4 sm:p-6 bg-muted rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs sm:text-sm text-muted-foreground">Monthly Revenue</label>
            <Input type="number" value={values.monthlyRevenue} onChange={(e) => setValues({...values, monthlyRevenue: Number(e.target.value)})} className="mt-1" />
          </div>
          <div className="p-2 sm:p-3 bg-card rounded-lg">
            <div className="text-xs text-muted-foreground">Total Expenses</div>
            <div className="text-sm sm:text-base font-bold text-destructive">{formatCurrency(totalMonthly)}</div>
          </div>
          <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-xs text-muted-foreground">Monthly Profit</div>
            <div className="text-sm sm:text-base font-bold text-green-600">{formatCurrency(monthlyProfit)}</div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-xs text-muted-foreground">Profit Margin</div>
            <div className="text-sm sm:text-base font-bold text-primary">{profitMargin.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
