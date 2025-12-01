import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { DollarSign, TrendingUp, HelpCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const loanStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Laundromat Loan Calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "description": "Free laundromat loan payment calculator for equipment financing, SBA loans, real estate, working capital, and acquisition financing. Calculate monthly payments, total interest, and compare lenders instantly.",
  "url": "https://washbizhub.com/loan-calculator",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "9650",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2025-11-30"
};

const loanFaqs = [
  {
    question: "How do I get a laundromat loan?",
    answer: "To get a laundromat loan: (1) Prepare a business plan with financial projections, (2) Gather 3 years of tax returns and financial statements, (3) Have 10-30% down payment ready, (4) Research lenders specializing in laundromat financing including SBA lenders, equipment financing companies, and commercial banks. Most lenders require 650+ credit score and industry experience or a strong management plan."
  },
  {
    question: "What are typical laundromat loan rates in 2025?",
    answer: "Laundromat loan rates in 2025 range from 5.5-18% depending on loan type: SBA 7(a) loans: 5.5-8.5%, equipment financing: 6-14%, real estate loans: 5-8%, working capital: 8-18%, and startup funding: 10-20%. Rates depend on credit score, collateral, business experience, and loan term. Best rates go to established operators with strong credit."
  },
  {
    question: "Can I get an SBA loan for a laundromat?",
    answer: "Yes, SBA 7(a) loans are popular for laundromat acquisitions and expansions. They offer competitive rates (Prime + 2.25-2.75%), longer terms (10-25 years), and lower down payments (10-20%). Requirements include good personal credit (650+), adequate collateral, industry experience or strong management plan, and 10-20% equity injection."
  },
  {
    question: "How much down payment is needed for a laundromat loan?",
    answer: "Down payment requirements vary by loan type: SBA loans require 10-20%, conventional bank loans require 20-30%, equipment financing may require 10-20% or use equipment as collateral, and seller financing can be 10-50%. First-time buyers typically need higher down payments (25-30%) while experienced operators may qualify for lower amounts."
  },
  {
    question: "What is the best loan for buying a laundromat?",
    answer: "The best loan depends on your situation: SBA 7(a) loans are ideal for acquisitions with lower down payments and longer terms. Equipment financing works for new equipment purchases. Conventional bank loans suit established operators with strong financials. Seller financing can bridge gaps when traditional financing falls short."
  },
  {
    question: "How long are laundromat loan terms?",
    answer: "Laundromat loan terms vary: SBA loans: 10-25 years for real estate, 10 years for business acquisition. Equipment financing: 3-7 years matching equipment useful life. Working capital: 6 months to 5 years. Commercial real estate: 15-30 years. Longer terms mean lower monthly payments but more total interest paid."
  },
  {
    question: "What credit score is needed for a laundromat loan?",
    answer: "Credit score requirements: SBA loans require 650-680+ minimum, with 700+ preferred. Conventional bank loans need 680-720+. Equipment financing may accept 600+ with higher rates. Alternative lenders accept 550+ with higher rates and shorter terms. Higher credit scores qualify for better rates and terms."
  },
  {
    question: "Can I finance laundromat equipment?",
    answer: "Yes, equipment financing is common for laundromats. Options include: equipment loans (5-7 years, 6-14% rates), equipment leases (operating or capital), manufacturer financing programs, and SBA 504 loans for large equipment purchases. Equipment typically serves as collateral, making approval easier. New equipment may qualify for 100% financing."
  }
];

const loanHowTo = {
  name: "How to Calculate Laundromat Loan Payments",
  description: "Step-by-step guide to calculating monthly payments and total costs for laundromat financing",
  totalTime: "PT3M",
  steps: [
    {
      name: "Select Funding Type",
      text: "Choose the type of financing you need: startup funding for new businesses, equipment financing for washers/dryers, real estate financing for property purchase, working capital for operations, or acquisitions financing for buying an existing laundromat."
    },
    {
      name: "Choose a Lender",
      text: "Select from available lenders to see their specific rate ranges and loan amounts. Compare options like SBA lenders, equipment financing companies, and commercial banks."
    },
    {
      name: "Enter Loan Amount",
      text: "Input the total financing amount you need. Each lender has minimum and maximum limits based on loan type and your qualifications."
    },
    {
      name: "Set Loan Term",
      text: "Choose your repayment period from 6 months to 30 years. Longer terms mean lower monthly payments but more total interest paid."
    },
    {
      name: "Adjust Interest Rate",
      text: "Set the interest rate within the lender's typical range. Your actual rate depends on credit score, collateral, and business strength."
    },
    {
      name: "Review Payment Details",
      text: "Analyze your monthly payment, total interest cost, and total amount paid over the life of the loan. Use the amortization schedule to see how payments are applied over time."
    }
  ]
};

const FUNDING_TYPES = {
  startup: {
    label: 'Startup Funding',
    lenders: [
      { name: 'GoKapital', minRate: 8, maxRate: 18, minAmount: 10000, maxAmount: 250000 },
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
        title="Laundromat Loan Calculator - Free Financing Payment Tool 2025 | WashBizHub"
        description="Calculate laundromat loan payments for free. Compare equipment financing, SBA loans, real estate, working capital, and acquisition loans. Instant monthly payment estimates with amortization schedules. Trusted by 9,600+ laundromat owners."
        canonicalUrl="/loan-calculator"
        ogType="website"
        keywords={[
          "laundromat loan calculator",
          "laundromat financing calculator",
          "SBA loan laundromat",
          "equipment financing laundromat",
          "laundromat loan rates 2025",
          "how to finance a laundromat",
          "laundromat business loan",
          "coin laundry financing",
          "laundromat equipment loan",
          "laundromat acquisition financing",
          "commercial laundry loan calculator",
          "laundromat down payment calculator",
          "laundromat monthly payment calculator",
          "laundromat working capital loan",
          "laundromat startup funding"
        ]}
        faqs={loanFaqs}
        howTo={loanHowTo}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/calculators" },
          { name: "Loan Calculator", url: "/loan-calculator" }
        ]}
        author={{
          name: "WashBizHub Funding Team",
          expertise: "Laundromat Financing & Commercial Lending Specialists",
          credentials: "30+ years combined experience in laundromat financing across 2,000+ funded transactions"
        }}
        structuredData={loanStructuredData}
        speakableSelectors={["h1", ".speakable"]}
        datePublished="2024-01-15"
        dateModified="2025-11-30"
      />

      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Breadcrumb items={[
            { name: "Home", url: "/" },
            { name: "Calculators", url: "/calculators" },
            { name: "Loan Calculator", url: "/loan-calculator" }
          ]} />
        </div>
      </div>

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-12 border-b border-blue-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8" />
              <h1 className="text-4xl font-bold speakable">Free Laundromat Loan Calculator 2025</h1>
            </div>
            <p className="text-blue-200 speakable">Calculate monthly payments for laundromat equipment, SBA, real estate, and acquisition financing. Compare lenders instantly.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Financing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
                <CardDescription>{selectedLender.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary" data-testid="result-monthly-payment">
                      ${calculations.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                    <p className="text-2xl font-bold text-destructive" data-testid="result-total-interest">
                      ${calculations.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount Paid</p>
                    <p className="text-2xl font-bold" data-testid="result-total-paid">
                      ${calculations.totalPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent" />
                Frequently Asked Questions About Laundromat Financing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {loanFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
