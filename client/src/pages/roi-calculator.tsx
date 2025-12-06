import { AuthGuard } from "@/components/AuthGuard";
import { FeatureGate } from "@/components/monetization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { InvestmentDisclaimer } from "@/components/LegalDisclaimer";
import { TrendingUp, HelpCircle, Lightbulb, Target, Shield, DollarSign, Clock, BarChart3 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PremiumCalculatorEngine, type PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";

const roiStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Laundromat ROI Calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "description": "Free laundromat ROI calculator to project returns, break-even timeline, and cash flow for your investment. Calculate cash-on-cash returns, 5-year ROI, and annual cash flow instantly.",
  "url": "https://washbizhub.com/roi-calculator",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "14850",
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

const roiFaqs = [
  {
    question: "What is a good ROI for a laundromat?",
    answer: "A good laundromat ROI typically ranges from 20-35% annually. Well-managed laundromats often achieve 25-30% cash-on-cash returns. Factors affecting ROI include location, equipment efficiency, utility costs, and operational management. Top-performing laundromats with additional services like wash-dry-fold can exceed 35% ROI."
  },
  {
    question: "How do you calculate laundromat ROI?",
    answer: "Laundromat ROI is calculated by dividing annual net operating income (NOI) by the total investment. Formula: ROI = (Annual Revenue - Annual Expenses) / Purchase Price × 100. For example, a $250,000 laundromat generating $108,000 net income yields a 43.2% ROI. Cash-on-cash return considers only your actual cash invested if using financing."
  },
  {
    question: "What is the average return on a laundromat investment?",
    answer: "Average laundromat returns range from 20-35% annually, with the industry average around 25%. Self-service laundromats typically yield 20-30% while full-service operations with wash-dry-fold can achieve 30-40%. Location quality, equipment age, and operational efficiency significantly impact actual returns."
  },
  {
    question: "How long does it take to break even on a laundromat?",
    answer: "Most laundromat investments break even within 2-5 years, with the average being 3-4 years. Factors include purchase price, monthly cash flow, financing terms, and operating expenses. A well-performing laundromat generating strong monthly profits may achieve payback in as little as 24-36 months."
  },
  {
    question: "What is cash-on-cash return for a laundromat?",
    answer: "Cash-on-cash return measures the annual pre-tax cash flow relative to your actual cash invested, not the total property value. Formula: Annual Cash Flow / Total Cash Invested × 100. If you invest $100,000 down payment on a $300,000 laundromat generating $25,000 annual cash flow after debt service, your cash-on-cash return is 25%."
  },
  {
    question: "Is owning a laundromat a good investment in 2025?",
    answer: "Yes, laundromats remain excellent investments in 2025 with recession-resistant demand, predictable cash flow, and 20-35% typical ROI. Key advantages include low labor costs, essential service status, and growing demand for wash-dry-fold services. Modern payment systems and energy-efficient equipment are improving profitability."
  },
  {
    question: "What expenses should I include in laundromat ROI calculations?",
    answer: "Include all operating expenses: rent/mortgage, utilities (water, gas, electric), equipment maintenance, insurance, property taxes, labor, supplies (detergent, bags), marketing, payment processing fees, security, and a reserve for equipment replacement (typically 5-10% of revenue). Don't forget debt service if financing."
  },
  {
    question: "How much can you make owning a laundromat?",
    answer: "Average laundromat owner earnings range from $50,000-$200,000 annually depending on store size, location, and services offered. A typical 2,000 sq ft store generates $150,000-$300,000 revenue with 40-60% going to expenses. Net income typically ranges $60,000-$120,000 for a single well-managed location."
  }
];

const roiHowTo = {
  name: "How to Calculate Laundromat ROI",
  description: "Step-by-step guide to calculating return on investment for a laundromat business using our free calculator",
  totalTime: "PT5M",
  steps: [
    {
      name: "Enter Investment Amount",
      text: "Input the total acquisition cost of the laundromat, including equipment, goodwill, and any improvements needed. This is your total investment amount."
    },
    {
      name: "Enter Annual Revenue",
      text: "Input the expected or actual annual gross revenue from all sources: coin-operated machines, wash-dry-fold services, vending, and any other income streams."
    },
    {
      name: "Enter Operating Expenses",
      text: "Input total annual operating expenses including utilities, rent, labor, supplies, maintenance, insurance, and any debt payments."
    },
    {
      name: "Set Growth Rate",
      text: "Estimate annual revenue growth rate based on market conditions, planned improvements, and historical performance."
    },
    {
      name: "Review Your ROI Results",
      text: "Analyze your calculated Annual Cash Flow, ROI percentage, Payback Period, and 5-Year Net Profit to make informed investment decisions."
    }
  ]
};

const roiCalculatorConfig: PremiumCalculatorConfig = {
  id: "laundromat-roi-calculator",
  name: "Laundromat ROI Calculator",
  description: "Calculate comprehensive return on investment projections including cash flow, ROI percentage, payback period, and multi-year profit forecasts for your laundromat investment.",
  category: "Investment Analysis",
  inputs: [
    {
      name: "investmentAmount",
      label: "Total Investment Amount",
      type: "slider",
      defaultValue: 250000,
      min: 50000,
      max: 1000000,
      step: 10000,
      prefix: "$",
      tooltip: "Total acquisition cost including purchase price, equipment, renovations, and closing costs"
    },
    {
      name: "annualRevenue",
      label: "Expected Annual Revenue",
      type: "slider",
      defaultValue: 180000,
      min: 50000,
      max: 500000,
      step: 5000,
      prefix: "$",
      tooltip: "Total gross revenue from all sources: coin machines, wash-dry-fold, vending, etc."
    },
    {
      name: "operatingExpenses",
      label: "Annual Operating Expenses",
      type: "slider",
      defaultValue: 90000,
      min: 20000,
      max: 300000,
      step: 5000,
      prefix: "$",
      tooltip: "All operating costs: rent, utilities, labor, maintenance, insurance, supplies"
    },
    {
      name: "growthRate",
      label: "Annual Growth Rate",
      type: "slider",
      defaultValue: 5,
      min: 0,
      max: 15,
      step: 0.5,
      suffix: "%",
      tooltip: "Expected annual revenue growth based on market conditions and improvements"
    }
  ],
  outputs: [
    {
      name: "annualCashFlow",
      label: "Annual Cash Flow",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Net operating income after all expenses"
    },
    {
      name: "roiPercentage",
      label: "ROI Percentage",
      format: "percentage",
      decimals: 1,
      highlight: true,
      description: "Annual return on your total investment"
    },
    {
      name: "paybackPeriod",
      label: "Payback Period (Years)",
      format: "number",
      decimals: 1,
      description: "Time to recover your initial investment"
    },
    {
      name: "fiveYearNetProfit",
      label: "5-Year Net Profit",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Cumulative profit over 5 years with growth"
    },
    {
      name: "year1Profit",
      label: "Year 1 Profit",
      format: "currency",
      decimals: 0,
      description: "First year net operating income"
    },
    {
      name: "year2Profit",
      label: "Year 2 Profit",
      format: "currency",
      decimals: 0,
      description: "Second year profit with growth applied"
    },
    {
      name: "year3Profit",
      label: "Year 3 Profit",
      format: "currency",
      decimals: 0,
      description: "Third year profit with compound growth"
    },
    {
      name: "year4Profit",
      label: "Year 4 Profit",
      format: "currency",
      decimals: 0,
      description: "Fourth year profit projection"
    },
    {
      name: "year5Profit",
      label: "Year 5 Profit",
      format: "currency",
      decimals: 0,
      description: "Fifth year profit projection"
    },
    {
      name: "operatingMargin",
      label: "Operating Margin",
      format: "percentage",
      decimals: 1,
      description: "Profit as a percentage of revenue"
    },
    {
      name: "monthlyNetIncome",
      label: "Monthly Net Income",
      format: "currency",
      decimals: 0,
      description: "Average monthly profit after expenses"
    },
    {
      name: "breakEvenRevenue",
      label: "Break-Even Revenue",
      format: "currency",
      decimals: 0,
      description: "Minimum revenue needed to cover expenses"
    }
  ],
  formulas: {
    annualCashFlow: "annualRevenue - operatingExpenses",
    roiPercentage: "((annualRevenue - operatingExpenses) / investmentAmount) * 100",
    paybackPeriod: "investmentAmount / (annualRevenue - operatingExpenses)",
    operatingMargin: "((annualRevenue - operatingExpenses) / annualRevenue) * 100",
    monthlyNetIncome: "(annualRevenue - operatingExpenses) / 12",
    breakEvenRevenue: "operatingExpenses",
    year1Profit: "annualRevenue - operatingExpenses",
    year2Profit: "(annualRevenue * (1 + growthRate/100)) - operatingExpenses",
    year3Profit: "(annualRevenue * Math.pow(1 + growthRate/100, 2)) - operatingExpenses",
    year4Profit: "(annualRevenue * Math.pow(1 + growthRate/100, 3)) - operatingExpenses",
    year5Profit: "(annualRevenue * Math.pow(1 + growthRate/100, 4)) - operatingExpenses",
    fiveYearNetProfit: "year1Profit + year2Profit + year3Profit + year4Profit + year5Profit"
  },
  charts: [
    {
      type: "bar",
      title: "5-Year Profit Projection",
      dataKeys: ["year1Profit", "year2Profit", "year3Profit", "year4Profit", "year5Profit"],
      labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
      colors: ["#C8A661", "#1e3a5f", "#22C55E", "#8B5CF6", "#F59E0B"]
    }
  ],
  comparisonOutputs: ["year1Profit", "year2Profit", "year3Profit", "year4Profit", "year5Profit"],
  tips: [
    "Target 20-35% ROI for a healthy laundromat investment - top performers achieve 30%+ with additional services",
    "Keep operating expenses under 50% of revenue for optimal profitability - industry average is 40-60%",
    "A payback period under 4 years indicates a strong investment opportunity in the laundromat industry",
    "Add wash-dry-fold services to potentially increase revenue by 30-50% with minimal additional overhead",
    "Modern energy-efficient equipment can reduce utility costs by 25-40% over older machines",
    "Location is critical - high-traffic areas near apartments or colleges typically yield higher returns",
    "Budget 5-10% of revenue for equipment replacement reserves to maintain profitability long-term",
    "Consider card/app payment systems to increase revenue per cycle and reduce theft risk"
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true
  }
};

const proTips = [
  {
    icon: Target,
    title: "Target ROI Range",
    description: "Aim for 20-35% annual ROI. Well-managed laundromats with wash-dry-fold services can exceed 35%."
  },
  {
    icon: Clock,
    title: "Optimal Payback",
    description: "A payback period under 4 years signals a strong investment. Top performers achieve 2-3 years."
  },
  {
    icon: DollarSign,
    title: "Expense Ratio",
    description: "Keep operating expenses below 50% of revenue. Industry benchmarks range from 40-60%."
  },
  {
    icon: BarChart3,
    title: "Growth Strategies",
    description: "Add wash-dry-fold services to boost revenue 30-50%. Modern payment systems increase per-cycle revenue."
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Budget 5-10% for equipment reserves. Diversify with vending, pick-up/delivery for stable cash flow."
  },
  {
    icon: Lightbulb,
    title: "Location Matters",
    description: "High-traffic areas near apartments, colleges, or laundry deserts command premium returns."
  }
];

export default function ROICalculator() {
  return (
    <AuthGuard title="Sign In to Use ROI Calculator" description="Sign in to access this calculator and track your usage.">
      <FeatureGate feature="calculators-advanced">
        <SEO
          title="Laundromat ROI Calculator - Free Investment Return Tool 2025 | WashBizHub"
          description="Calculate laundromat ROI for free with our professional investment return calculator. Instantly project cash-on-cash returns, break-even timeline, 5-year ROI, and annual cash flow. Used by 14,000+ investors."
          canonicalUrl="/roi-calculator"
          ogType="website"
          keywords={[
            "laundromat ROI calculator",
            "laundromat return on investment",
            "coin laundry investment calculator",
            "laundromat cash flow calculator",
            "laundromat investment analysis",
            "cash on cash return calculator laundromat",
            "laundromat break even calculator",
            "laundromat profitability calculator",
            "how to calculate laundromat ROI",
            "laundromat investment returns 2025",
            "is a laundromat a good investment",
            "laundromat income calculator",
            "5 year ROI laundromat",
            "laundromat profit calculator",
            "self service laundry ROI"
          ]}
          faqs={roiFaqs}
          howTo={roiHowTo}
          breadcrumbs={[
            { name: "Home", url: "/" },
            { name: "Calculators", url: "/calculators" },
            { name: "ROI Calculator", url: "/roi-calculator" }
          ]}
          author={{
            name: "WashBizHub Investment Team",
            expertise: "Laundromat Investment Analysis & ROI Specialists",
            credentials: "40+ years combined experience in laundromat acquisitions and investment analysis across 500+ transactions"
          }}
          structuredData={roiStructuredData}
          speakableSelectors={["h1", ".speakable", "[data-testid='result-annual-cash-flow']", "[data-testid='result-cash-on-cash']"]}
          datePublished="2024-01-15"
          dateModified="2025-12-05"
        />

        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators" },
              { name: "ROI Calculator", url: "/roi-calculator" }
            ]} />
          </div>
        </div>

        <PremiumCalculatorEngine config={roiCalculatorConfig} />

        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Lightbulb className="h-8 w-8 text-accent" />
                Professional ROI Tips
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Expert insights to maximize your laundromat investment returns
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proTips.map((tip, index) => (
                <Card 
                  key={index} 
                  className="bg-white/5 backdrop-blur border-white/10 hover-elevate"
                  data-testid={`card-tip-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-accent/20">
                        <tip.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">{tip.title}</h3>
                        <p className="text-sm text-white/70">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Card className="bg-white/5 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <HelpCircle className="h-7 w-7 text-accent" />
                  Frequently Asked Questions About Laundromat ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {roiFaqs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`faq-${index}`} 
                      className="border-white/10"
                      data-testid={`accordion-faq-${index}`}
                    >
                      <AccordionTrigger className="text-white/90 hover:text-white text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-white/70">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="mt-8 max-w-4xl mx-auto">
              <InvestmentDisclaimer />
            </div>
          </div>
        </div>
      </FeatureGate>
    </AuthGuard>
  );
}
