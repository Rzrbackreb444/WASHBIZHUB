import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DollarSign, TrendingUp } from 'lucide-react';
import { SEO } from '@/components/SEO';

const FUNDING_TYPES = {
  startup: {
    label: 'Startup Funding',
    lenders: [
      { name: 'GoCapital', minRate: 8, maxRate: 18, minAmount: 10000, maxAmount: 250000 },
      { name: 'Preferred Funding Group', minRate: 10, maxRate: 20, minAmount: 5000, maxAmount: 150000 },
    ],
  },
  equipment: {
    label: 'Equipment Financing',
    lenders: [
      { name: 'Advance Funds Network', minRate: 6, maxRate: 14, minAmount: 15000, maxAmount: 1000000 },
      { name: 'MyPartner.io', minRate: 7, maxRate: 16, minAmount: 5000, maxAmount: 500000 },
      { name: 'Preferred Funding Group', minRate: 8, maxRate: 15, minAmount: 10000, maxAmount: 250000 },
    ],
  },
  realEstate: {
    label: 'Real Estate Financing',
    lenders: [
      { name: 'David Allen Capital', minRate: 5.5, maxRate: 7.5, minAmount: 100000, maxAmount: 5000000 },
      { name: 'Advance Funds Network', minRate: 6, maxRate: 8, minAmount: 75000, maxAmount: 2500000 },
      { name: 'South End Capital', minRate: 5, maxRate: 8, minAmount: 50000, maxAmount: 2000000 },
    ],
  },
  workingCapital: {
    label: 'Working Capital',
    lenders: [
      { name: 'Advance Funds Network', minRate: 8, maxRate: 16, minAmount: 10000, maxAmount: 500000 },
      { name: 'MyPartner.io', minRate: 9, maxRate: 18, minAmount: 5000, maxAmount: 250000 },
    ],
  },
  acquisitions: {
    label: 'Acquisitions Financing',
    lenders: [
      { name: 'National Business Capital', minRate: 5.5, maxRate: 8.5, minAmount: 100000, maxAmount: 5000000 },
    ],
  },
};

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export default function LoanCalculator() {
  const [fundingType, setFundingType] = useState<keyof typeof FUNDING_TYPES>('equipment');
  const [lenderName, setLenderName] = useState('Advance Funds Network');
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanTerm, setLoanTerm] = useState(60);
  const [interestRate, setInterestRate] = useState(9);

  const fundingConfig = FUNDING_TYPES[fundingType];
  const selectedLender = fundingConfig.lenders.find((l) => l.name === lenderName) || fundingConfig.lenders[0];

  // Reset lender when funding type changes
  if (lenderName && !fundingConfig.lenders.find((l) => l.name === lenderName)) {
    setLenderName(fundingConfig.lenders[0].name);
  }

  const calculations = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm;

    if (monthlyRate === 0) {
      const monthlyPayment = loanAmount / numPayments;
      const totalPaid = loanAmount;
      const totalInterest = 0;

      return { monthlyPayment, totalPaid, totalInterest, monthlyRate, numPayments };
    }

    const monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPaid = monthlyPayment * numPayments;
    const totalInterest = totalPaid - loanAmount;

    return { monthlyPayment, totalPaid, totalInterest, monthlyRate, numPayments };
  }, [loanAmount, loanTerm, interestRate]);

  const amortizationSchedule = useMemo((): AmortizationRow[] => {
    const schedule: AmortizationRow[] = [];
    let balance = loanAmount;
    const monthlyRate = calculations.monthlyRate;

    for (let month = 1; month <= calculations.numPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = calculations.monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        payment: calculations.monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }

    return schedule;
  }, [loanAmount, calculations]);

  return (
    <>
      <SEO
        title="Laundromat Loan Calculator | Financing Payment Estimator"
        description="Calculate monthly payments for laundromat financing. Equipment, real estate, working capital, and startup loans. Compare by lender."
        canonicalUrl="/loan-calculator"
        keywords={['loan calculator', 'payment calculator', 'financing', 'monthly payment', 'laundromat financing']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-12 border-b border-blue-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Loan Payment Calculator</h1>
            </div>
            <p className="text-blue-200">Calculate monthly payments for laundromat financing by type and lender</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Calculator Panel */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Financing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Funding Type */}
                <div className="space-y-2">
                  <Label htmlFor="funding-type">Funding Type</Label>
                  <Select value={fundingType} onValueChange={(value: any) => setFundingType(value)}>
                    <SelectTrigger id="funding-type" data-testid="select-funding-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FUNDING_TYPES).map(([key, config]) => (
                        <SelectItem key={key} value={key} data-testid={`option-${key}`}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lender */}
                <div className="space-y-2">
                  <Label htmlFor="lender">Lender</Label>
                  <Select value={lenderName} onValueChange={setLenderName}>
                    <SelectTrigger id="lender" data-testid="select-lender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fundingConfig.lenders.map((lender) => (
                        <SelectItem key={lender.name} value={lender.name} data-testid={`lender-${lender.name}`}>
                          {lender.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="loan-amount">Loan Amount</Label>
                    <span className="text-sm font-semibold text-primary">${loanAmount.toLocaleString()}</span>
                  </div>
                  <Input
                    id="loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    min={selectedLender.minAmount}
                    max={selectedLender.maxAmount}
                    step={5000}
                    data-testid="input-loan-amount"
                  />
                  <p className="text-xs text-muted-foreground">
                    Range: ${selectedLender.minAmount.toLocaleString()} - ${selectedLender.maxAmount.toLocaleString()}
                  </p>
                </div>

                {/* Loan Term */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="loan-term">Loan Term (months)</Label>
                    <span className="text-sm font-semibold text-primary">{loanTerm} months</span>
                  </div>
                  <Slider
                    id="loan-term"
                    value={[loanTerm]}
                    onValueChange={(val) => setLoanTerm(val[0])}
                    min={6}
                    max={360}
                    step={6}
                    data-testid="slider-loan-term"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>6 mo</span>
                    <span>{(loanTerm / 12).toFixed(1)} years</span>
                    <span>30 years</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                    <span className="text-sm font-semibold text-primary">{interestRate.toFixed(2)}%</span>
                  </div>
                  <Slider
                    id="interest-rate"
                    value={[interestRate]}
                    onValueChange={(val) => setInterestRate(val[0])}
                    min={selectedLender.minRate}
                    max={selectedLender.maxRate}
                    step={0.1}
                    data-testid="slider-interest-rate"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{selectedLender.minRate.toFixed(1)}%</span>
                    <span>{selectedLender.maxRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
                <CardDescription>{selectedLender.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary">
                      ${calculations.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                    <p className="text-2xl font-bold text-destructive">
                      ${calculations.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount Paid</p>
                    <p className="text-2xl font-bold">
                      ${calculations.totalPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {/* Loan Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Loan Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Loan Amount:</span>
                      <span className="font-semibold">${loanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate:</span>
                      <span className="font-semibold">{interestRate.toFixed(2)}% APR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Term:</span>
                      <span className="font-semibold">{loanTerm} months ({(loanTerm / 12).toFixed(1)} years)</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-muted-foreground">Total Interest Paid:</span>
                      <span className="font-bold text-destructive">
                        ${calculations.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <a href={`https://google.com/search?q=${encodeURIComponent(selectedLender.name + ' laundromat financing')}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" data-testid="button-learn-more">
                      Learn More
                    </Button>
                  </a>
                  <a href="/funding">
                    <Button variant="outline" size="sm" data-testid="button-all-options">
                      View All Options
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Amortization Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Amortization Schedule
              </CardTitle>
              <CardDescription>First 24 months and last month of your loan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-semibold py-2 px-2">Month</th>
                      <th className="text-right font-semibold py-2 px-2">Payment</th>
                      <th className="text-right font-semibold py-2 px-2">Principal</th>
                      <th className="text-right font-semibold py-2 px-2">Interest</th>
                      <th className="text-right font-semibold py-2 px-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationSchedule.slice(0, 24).map((row) => (
                      <tr key={row.month} className="border-b hover:bg-muted/50" data-testid={`row-month-${row.month}`}>
                        <td className="text-left py-2 px-2">{row.month}</td>
                        <td className="text-right py-2 px-2">${row.payment.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                        <td className="text-right py-2 px-2">${row.principal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                        <td className="text-right py-2 px-2">${row.interest.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                        <td className="text-right py-2 px-2 font-semibold">${row.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                    {amortizationSchedule.length > 25 && (
                      <>
                        <tr className="border-t-2">
                          <td colSpan={5} className="text-center py-2 px-2 text-muted-foreground text-xs">
                            ... {amortizationSchedule.length - 25} more months ...
                          </td>
                        </tr>
                        <tr className="border-b bg-muted/30" data-testid={`row-month-final`}>
                          <td className="text-left py-2 px-2 font-semibold">{amortizationSchedule[amortizationSchedule.length - 1].month}</td>
                          <td className="text-right py-2 px-2 font-semibold">
                            ${amortizationSchedule[amortizationSchedule.length - 1].payment.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-right py-2 px-2 font-semibold">
                            ${amortizationSchedule[amortizationSchedule.length - 1].principal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-right py-2 px-2 font-semibold">
                            ${amortizationSchedule[amortizationSchedule.length - 1].interest.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-right py-2 px-2 font-semibold text-green-600">$0</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
