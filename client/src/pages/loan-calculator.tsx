import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from '@/components/PremiumCalculatorEngine';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calculator, DollarSign, Percent, Clock, HelpCircle, TrendingUp, Shield, CheckCircle2 } from 'lucide-react';

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
  "dateModified": "2025-12-05"
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
      name: "Enter Loan Amount",
      text: "Input the total purchase price or financing amount you need for your laundromat acquisition, equipment, or real estate."
    },
    {
      name: "Set Down Payment",
      text: "Enter your available down payment. Most lenders require 10-30% down depending on loan type and your qualifications."
    },
    {
      name: "Adjust Interest Rate",
      text: "Set the expected interest rate based on loan type: SBA loans (5.5-8.5%), equipment financing (6-14%), or conventional loans (6-10%)."
    },
    {
      name: "Choose Loan Term",
      text: "Select your repayment period in months. Equipment loans are typically 3-7 years, while real estate can be 15-25 years."
    },
    {
      name: "Review Results",
      text: "Analyze your monthly payment, total interest cost, and see the breakdown of principal vs interest over the loan life."
    },
    {
      name: "Export Your Analysis",
      text: "Download a PDF report or export to Google Sheets to share with lenders, partners, or for your business planning."
    }
  ]
};

const loanCalculatorConfig: PremiumCalculatorConfig = {
  id: 'laundromat-loan-calculator',
  name: 'Laundromat Loan Calculator',
  description: 'Calculate monthly payments, total interest, and visualize your loan breakdown for laundromat equipment, acquisition, or real estate financing.',
  category: 'Laundromat Financing',
  inputs: [
    {
      name: 'loanAmount',
      label: 'Total Loan Amount',
      type: 'slider',
      defaultValue: 250000,
      min: 10000,
      max: 2000000,
      step: 5000,
      prefix: '$',
      tooltip: 'The total purchase price or financing amount for your laundromat investment (equipment, acquisition, or property).'
    },
    {
      name: 'downPayment',
      label: 'Down Payment',
      type: 'slider',
      defaultValue: 50000,
      min: 0,
      max: 500000,
      step: 5000,
      prefix: '$',
      tooltip: 'Your upfront cash investment. Most lenders require 10-30% down. Higher down payments typically secure better rates.'
    },
    {
      name: 'interestRate',
      label: 'Annual Interest Rate',
      type: 'slider',
      defaultValue: 7.5,
      min: 3,
      max: 20,
      step: 0.25,
      suffix: '%',
      tooltip: 'Expected annual interest rate. SBA loans: 5.5-8.5%, Equipment: 6-14%, Conventional: 6-10%, Alternative: 10-20%.'
    },
    {
      name: 'loanTerm',
      label: 'Loan Term (Months)',
      type: 'slider',
      defaultValue: 120,
      min: 12,
      max: 360,
      step: 12,
      suffix: ' mo',
      tooltip: 'Loan repayment period. Equipment: 36-84 months, Acquisition: 84-120 months, Real Estate: 180-300 months.',
      formatDisplay: (value: number) => `${value} months (${(value / 12).toFixed(1)} years)`
    }
  ],
  outputs: [
    {
      name: 'financedAmount',
      label: 'Amount Financed',
      format: 'currency',
      decimals: 0,
      description: 'Loan amount after down payment'
    },
    {
      name: 'monthlyPayment',
      label: 'Monthly Payment',
      format: 'currency',
      decimals: 2,
      highlight: true,
      color: 'primary',
      description: 'Your fixed monthly loan payment'
    },
    {
      name: 'totalInterest',
      label: 'Total Interest Paid',
      format: 'currency',
      decimals: 0,
      color: 'destructive',
      description: 'Total interest over loan life'
    },
    {
      name: 'totalPaid',
      label: 'Total Amount Paid',
      format: 'currency',
      decimals: 0,
      description: 'Principal + Interest payments'
    },
    {
      name: 'totalCost',
      label: 'Total Investment Cost',
      format: 'currency',
      decimals: 0,
      highlight: true,
      description: 'Down payment + all loan payments'
    },
    {
      name: 'interestPercentage',
      label: 'Interest as % of Principal',
      format: 'percentage',
      decimals: 1,
      description: 'How much extra you pay in interest'
    },
    {
      name: 'principalPortion',
      label: 'Principal Portion',
      format: 'currency',
      decimals: 0,
      description: 'Amount going toward principal'
    },
    {
      name: 'interestPortion',
      label: 'Interest Portion',
      format: 'currency',
      decimals: 0,
      description: 'Amount going toward interest'
    }
  ],
  formulas: {
    financedAmount: 'loanAmount - downPayment',
    monthlyRate: 'interestRate / 100 / 12',
    monthlyPayment: '(interestRate === 0) ? (financedAmount / loanTerm) : (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1))',
    totalPaid: 'monthlyPayment * loanTerm',
    totalInterest: 'totalPaid - financedAmount',
    totalCost: 'totalPaid + downPayment',
    interestPercentage: '(financedAmount > 0) ? ((totalInterest / financedAmount) * 100) : 0',
    principalPortion: 'financedAmount',
    interestPortion: 'totalInterest'
  },
  charts: [
    {
      type: 'pie',
      title: 'Principal vs Interest Breakdown',
      dataKeys: ['principalPortion', 'interestPortion'],
      labels: ['Principal', 'Interest'],
      colors: ['#1e3a5f', '#C8A661']
    }
  ],
  comparisonOutputs: ['principalPortion', 'interestPortion'],
  tips: [
    "SBA 7(a) loans offer the best rates (5.5-8.5%) with 10-25 year terms for laundromat acquisitions. Requires 650+ credit score and 10-20% down payment.",
    "Equipment financing typically ranges 6-14% APR for 3-7 year terms. The equipment serves as collateral, often making approval easier for new operators.",
    "Aim for 20-30% down payment to secure better interest rates and improve your debt service coverage ratio (DSCR). Lenders prefer 1.25x DSCR or higher.",
    "Factor in equipment maintenance reserves (5-10% of revenue) when calculating affordability. Your true monthly cost includes loan payment plus operating reserves.",
    "Consider the total cost of ownership: A lower rate over a longer term may result in higher total interest paid. Balance monthly payment with total cost.",
    "Seller financing can bridge gaps when traditional financing falls short. Negotiate 5-10% seller carry with favorable terms to reduce required bank financing.",
    "For equipment-heavy deals, combine SBA loans for real estate with equipment financing for machines to optimize your overall financing structure."
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true
  }
};

const loanTypeHighlights = [
  {
    icon: DollarSign,
    title: "SBA 7(a) Loans",
    rate: "5.5-8.5%",
    term: "10-25 years",
    downPayment: "10-20%"
  },
  {
    icon: TrendingUp,
    title: "Equipment Financing",
    rate: "6-14%",
    term: "3-7 years",
    downPayment: "10-20%"
  },
  {
    icon: Percent,
    title: "Conventional Loans",
    rate: "6-10%",
    term: "5-20 years",
    downPayment: "20-30%"
  },
  {
    icon: Clock,
    title: "Working Capital",
    rate: "8-18%",
    term: "6mo-5 years",
    downPayment: "0-10%"
  }
];

export default function LoanCalculator() {
  return (
    <>
      <SEO
        title="Laundromat Loan Calculator - Free Financing Payment Tool 2025 | WashBizHub"
        description="Calculate laundromat loan payments for free. Compare equipment financing, SBA loans, real estate, working capital, and acquisition loans. Instant monthly payment estimates with visual breakdowns. Trusted by 9,600+ laundromat owners."
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
        dateModified="2025-12-05"
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

      <section className="bg-muted/30 py-12 md:py-16 border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 mb-4" data-testid="badge-loan-calculator">
              <Calculator className="w-3.5 h-3.5 mr-1.5" />
              Free Financing Tool
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
              Laundromat Loan Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Calculate monthly payments, compare financing options, and plan your laundromat investment with our professional loan calculator.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loanTypeHighlights.map((item, index) => (
              <Card key={index} className="bg-card border shadow-sm overflow-hidden" data-testid={`card-loan-type-${index}`}>
                <div className="h-1 bg-[#C8A661]" />
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-[#C8A661]" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <div className="text-lg md:text-xl font-bold text-[#C8A661]">{item.rate}</div>
                      <div className="text-xs text-muted-foreground">Interest Rate</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <div className="text-xs font-medium text-foreground">{item.term}</div>
                        <div className="text-xs text-muted-foreground">Term</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <div className="text-xs font-medium text-foreground">{item.downPayment}</div>
                        <div className="text-xs text-muted-foreground">Down</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PremiumCalculatorEngine config={loanCalculatorConfig} />

      <section className="py-16 md:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 mb-4">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              Expert Answers
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Laundromat Financing FAQ
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Common questions about laundromat loans and financing options answered by industry experts.
            </p>
          </div>

          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {loanFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="border-b last:border-b-0"
                    data-testid={`accordion-faq-${index}`}
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/30 text-left">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="h-4 w-4 text-[#C8A661]" />
                        </div>
                        <span className="text-foreground font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-0">
                      <div className="ml-11 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#0A1628]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Finance Your Laundromat?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect with our network of trusted lenders specializing in laundromat financing. Get pre-qualified in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <a
              href="/funding-matcher"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold rounded-md transition-colors"
              data-testid="link-funding-matcher"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Find Lenders Now
            </a>
            <a
              href="/calculators"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white hover:bg-white/10 font-semibold rounded-md transition-colors"
              data-testid="link-more-calculators"
            >
              <Calculator className="w-4 h-4 mr-2" />
              More Calculators
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-gray-400 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Trusted by 9,600+ Owners</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Industry Verified</span>
            </div>
          </div>
        </div>
      </section>
      
      <div className="mx-auto max-w-4xl px-6 py-8">
        <CalculatorDisclaimer />
      </div>
    </>
  );
}
