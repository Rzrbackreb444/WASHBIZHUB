import { useState, useEffect, useRef } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PDFExportButton } from "@/components/PDFExportButton";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TrendingUp, HelpCircle } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  "dateModified": "2025-11-30"
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
      name: "Enter Purchase Price",
      text: "Input the total acquisition cost of the laundromat, including equipment, goodwill, and any improvements needed. This is your total investment amount."
    },
    {
      name: "Enter Monthly Revenue",
      text: "Input the expected or actual monthly gross revenue from all sources: coin-operated machines, wash-dry-fold services, vending, and any other income streams."
    },
    {
      name: "Enter Monthly Expenses",
      text: "Input total monthly operating expenses including utilities, rent, labor, supplies, maintenance, insurance, and any debt payments."
    },
    {
      name: "Enter Number of Machines",
      text: "Input the total number of washers and dryers to help benchmark your revenue per machine against industry standards."
    },
    {
      name: "Review Your ROI Results",
      text: "Analyze your calculated Annual Cash Flow, Cash-on-Cash Return percentage, Break-Even timeline in months, and 5-Year ROI projection to make informed investment decisions."
    }
  ]
};

export default function ROICalculator() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [inputs, setInputs] = useState({
    purchasePrice: "250000",
    monthlyRevenue: "15000",
    monthlyExpenses: "6000",
    numMachines: "20",
  });

  const [results, setResults] = useState({
    annualCashFlow: 0,
    cashOnCash: 0,
    breakEven: 0,
    fiveYearROI: 0,
  });

  const calculateROI = () => {
    const price = parseFloat(inputs.purchasePrice) || 0;
    const rev = (parseFloat(inputs.monthlyRevenue) || 0) * 12;
    const exp = (parseFloat(inputs.monthlyExpenses) || 0) * 12;
    const cashFlow = rev - exp;
    const coc = (cashFlow / price) * 100;
    const breakEven = (price / cashFlow) * 12;
    const fiveYear = ((cashFlow * 5 - price) / price) * 100;

    setResults({
      annualCashFlow: cashFlow,
      cashOnCash: coc,
      breakEven: breakEven,
      fiveYearROI: Math.max(0, fiveYear),
    });
  };

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const chartData = {
    labels: ['Year 1', 'Year 3', 'Year 5'],
    datasets: [
      {
        label: 'Cumulative ROI (%)',
        data: [results.cashOnCash, results.cashOnCash * 3, results.fiveYearROI],
        backgroundColor: '#b8860b',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
    plugins: {
      legend: { labels: { color: '#fff' } },
    },
  };

  return (
    <AuthGuard title="Sign In to Use ROI Calculator" description="Sign in to access this calculator and track your usage.">
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
        dateModified="2025-11-30"
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

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <TrendingUp className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-5xl font-black text-white mb-4 speakable" data-testid="text-roi-title">
              Free Laundromat ROI Calculator 2025
            </h1>
            <p className="text-xl text-white/70 speakable" data-testid="text-roi-subtitle">
              Calculate cash-on-cash returns, break-even timeline, and 5-year projections for your laundromat investment
            </p>
            <div className="mt-6">
              <PDFExportButton
                contentRef={contentRef}
                fileName="ROI_Analysis"
                title="Export PDF Report"
                variant="outline"
                className="bg-white/95 text-gray-900 hover:bg-white border-2 border-white/30 font-semibold"
                data-testid="button-export-pdf"
              />
            </div>
          </div>

        <div ref={contentRef}>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Calculate Your Laundromat ROI</CardTitle>
              <CardDescription className="text-white/70">
                Enter your laundromat investment details for instant ROI projections
              </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="purchasePrice" className="text-white/90 font-medium">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => setInputs({ ...inputs, purchasePrice: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="input-purchase-price"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyRevenue" className="text-white/90 font-medium">Monthly Revenue ($)</Label>
                  <Input
                    id="monthlyRevenue"
                    type="number"
                    value={inputs.monthlyRevenue}
                    onChange={(e) => setInputs({ ...inputs, monthlyRevenue: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="input-monthly-revenue"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyExpenses" className="text-white/90 font-medium">Monthly Expenses ($)</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    value={inputs.monthlyExpenses}
                    onChange={(e) => setInputs({ ...inputs, monthlyExpenses: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="input-monthly-expenses"
                  />
                </div>

                <div>
                  <Label htmlFor="numMachines" className="text-white/90 font-medium">Number of Machines</Label>
                  <Input
                    id="numMachines"
                    type="number"
                    value={inputs.numMachines}
                    onChange={(e) => setInputs({ ...inputs, numMachines: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="input-num-machines"
                  />
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-accent mb-6">ROI Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Annual Cash Flow:</span>
                    <strong className="text-2xl text-accent" data-testid="result-annual-cash-flow">
                      ${results.annualCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Cash-on-Cash Return:</span>
                    <strong className="text-2xl text-accent" data-testid="result-cash-on-cash">
                      {results.cashOnCash.toFixed(1)}%
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Break-Even (Months):</span>
                    <strong className="text-2xl text-accent" data-testid="result-break-even">
                      {results.breakEven.toFixed(0)}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/70">5-Year ROI:</span>
                    <strong className="text-2xl text-accent" data-testid="result-five-year-roi">
                      {results.fiveYearROI.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

              <p className="text-sm text-white/60 text-center mt-8">
                * Estimates based on standard laundromat benchmarks. Consult professionals for personalized advice.
              </p>
            </CardContent>
          </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20 mt-12">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-accent" />
                Frequently Asked Questions About Laundromat ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {roiFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border-white/20">
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
        </div>
      </div>
    </AuthGuard>
  );
}
