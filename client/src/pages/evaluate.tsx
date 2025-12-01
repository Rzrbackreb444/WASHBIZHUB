import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Target, ArrowRight, Chrome, Search, Calculator, 
  ClipboardCheck, ShoppingCart, Sparkles, CheckCircle, HelpCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const cleanbiFeatures = [
  "AI-powered location scoring (0-100)",
  "Competition analysis within radius",
  "Foot traffic and demographics",
  "Real-time Google data integration"
];

const featuredTools = [
  {
    id: "listings",
    title: "Laundromats for Sale",
    description: "Browse verified laundromat listings across the US",
    icon: Search,
    link: "/laundromat-listings",
    testId: "card-laundromats-for-sale"
  },
  {
    id: "valuation",
    title: "Valuation Calculator",
    description: "Get an accurate estimate of any laundromat's value",
    icon: Calculator,
    link: "/valuation-calculator",
    testId: "card-valuation-calculator"
  },
  {
    id: "due-diligence",
    title: "Due Diligence Checklist",
    description: "Complete checklist for evaluating a laundromat purchase",
    icon: ClipboardCheck,
    link: "/resources",
    testId: "card-due-diligence"
  }
];

const evaluationFaqs = [
  {
    question: "How do I evaluate a laundromat for sale?",
    answer: "Evaluating a laundromat involves analyzing 5 key areas: 1) Financial performance - review 3+ years of tax returns, P&L statements, and verify gross revenue with utility bills, 2) Location quality - use CLEANBI Score for demographics, competition, and foot traffic analysis, 3) Equipment condition - age, maintenance history, and remaining useful life of all machines, 4) Lease terms - rent amount, escalations, renewal options, and landlord relationship, 5) Growth potential - identify revenue opportunities like wash-dry-fold, pickup/delivery, or vending additions."
  },
  {
    question: "What is the CLEANBI Score and how does it work?",
    answer: "CLEANBI Score is WashBizHub's proprietary AI-powered location analysis tool that rates any address from 0-100 for laundromat potential. It analyzes: competition within 1-3 mile radius, population density and renter ratios, household income levels, foot traffic patterns, nearby businesses (apartments, gyms, hotels), and growth trends. A score of 80+ indicates an excellent location, 60-79 is good, 40-59 is fair, and below 40 suggests caution. Available free via our Chrome extension."
  },
  {
    question: "What should I look for when buying a laundromat?",
    answer: "Key factors to examine: 1) Verified financials - request tax returns, not just internal P&Ls, 2) Equipment age - machines over 15 years may need imminent replacement ($100K+ cost), 3) Lease security - minimum 5+ years remaining or renewal options, 4) Utility costs - water, gas, and electric as % of revenue (should be 25-35%), 5) Competition - new competitors can devastate revenue, 6) Demographics - stable or growing renter population, 7) Seller motivation - why are they selling? Verify their story."
  },
  {
    question: "What is the due diligence checklist for buying a laundromat?",
    answer: "Complete due diligence checklist includes: Financial Documents (3 years tax returns, P&L statements, bank statements, utility bills), Legal Documents (lease agreement, licenses, permits, environmental reports), Equipment (inventory list, age, maintenance records, warranties), Operations (employee info, vendor contracts, customer data), Property (building condition, HVAC, plumbing, parking), Market Analysis (CLEANBI Score, competition survey, demographic study). Allow 30-60 days for thorough due diligence."
  },
  {
    question: "How do I calculate the value of a laundromat?",
    answer: "Laundromats are typically valued using multiples of Seller's Discretionary Earnings (SDE) or EBITDA. Common valuation methods: 1) Income approach - 2.5x to 4x annual SDE depending on location, equipment age, and lease terms, 2) Asset approach - value of equipment plus goodwill, 3) Comparable sales - what similar laundromats sold for in the area. A laundromat with $100K annual SDE might sell for $250K-$400K. Use our Valuation Calculator for instant estimates."
  },
  {
    question: "What are red flags when buying a laundromat?",
    answer: "Major red flags include: 1) Seller won't provide tax returns (only internal books), 2) Revenue declining year-over-year, 3) New competition recently opened nearby, 4) Lease expiring soon with no renewal option, 5) Equipment mostly 15+ years old, 6) Below-market rent that will increase dramatically, 7) Environmental issues (soil contamination from dry cleaners), 8) Seller rushing the sale, 9) Vague answers about reason for selling, 10) Cash-heavy business with unverifiable income."
  },
  {
    question: "How do I verify a laundromat's revenue claims?",
    answer: "Revenue verification methods: 1) Compare reported revenue to utility bills - water usage should correlate with washer cycles, 2) Review tax returns not just P&L (owners don't lie to IRS), 3) Check coin counts or card system reports, 4) Observe operations during different days/times, 5) Review bank deposits against claimed revenue, 6) Ask for meter readings on machines, 7) Compare to industry benchmarks ($15-25/sqft annual revenue). Request 12-24 months of documentation minimum."
  },
  {
    question: "Should I buy an existing laundromat or build new?",
    answer: "Buy existing if: proven cash flow is important, you want immediate income, financing is easier with established business, good locations are scarce. Build new if: you have strong location secured, existing businesses are overpriced, you want modern equipment and layout, you have construction/development experience. Existing typically costs $100K-$400K with 2-4x SDE multiples. New build costs $200K-$500K+ but takes 6-12 months before first revenue. Most first-time buyers should acquire existing businesses."
  }
];

const evaluationHowTo = {
  name: "How to Evaluate a Laundromat for Purchase",
  description: "Complete step-by-step guide to evaluating a laundromat investment opportunity, from initial screening to making an informed offer.",
  totalTime: "PT14D",
  steps: [
    {
      name: "Screen Listings with CLEANBI Score",
      text: "Use the CLEANBI Score tool to instantly analyze the location quality of any listing. Filter out low-scoring locations (below 60) to focus your time on viable opportunities."
    },
    {
      name: "Review Financial Documentation",
      text: "Request and analyze 3+ years of tax returns, P&L statements, bank statements, and utility bills. Verify that reported revenue aligns with utility usage and deposits."
    },
    {
      name: "Conduct Location Analysis",
      text: "Visit the location at different times to observe traffic patterns. Survey the competition within a 3-mile radius. Check for new construction that might bring competitors."
    },
    {
      name: "Inspect Equipment Condition",
      text: "Create an inventory of all equipment with age, brand, and condition. Calculate remaining useful life and estimate replacement costs. Check maintenance records and repair history."
    },
    {
      name: "Review Lease Terms",
      text: "Analyze the lease agreement for rent amount, escalations, renewal options, and transfer provisions. Ensure at least 5-10 years of secure tenure post-acquisition."
    },
    {
      name: "Calculate Fair Market Value",
      text: "Use our Valuation Calculator to determine fair market value based on SDE multiples, equipment value, and location quality. Compare to asking price to assess deal viability."
    },
    {
      name: "Make an Informed Offer",
      text: "Based on your analysis, make an offer with appropriate contingencies for financing, due diligence, and lease assignment. Include a clear timeline for closing."
    }
  ]
};

export default function EvaluatePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Evaluate Laundromat Investments",
    "description": "Powerful tools to analyze and compare laundromat opportunities. CLEANBI scoring, valuation calculators, and due diligence resources.",
    "url": "https://washbizhub.com/evaluate",
    "mainEntity": {
      "@type": "Article",
      "headline": "How to Evaluate a Laundromat for Purchase",
      "description": "Complete guide to evaluating laundromat investments with CLEANBI AI scoring, valuation calculators, due diligence checklists, and buyer tools.",
      "author": {
        "@type": "Organization",
        "name": "WashBizHub"
      }
    }
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Evaluate Investments", url: "/evaluate" }
  ];

  return (
    <>
      <SEO
        title="Evaluate Laundromat Investments - CLEANBI Score, Valuation & Due Diligence Tools"
        description="Analyze and compare laundromat opportunities with CLEANBI AI-powered scoring, valuation calculators, and due diligence tools. Find the perfect laundromat investment with our comprehensive buyer resources and checklists."
        canonicalUrl="/evaluate"
        keywords={[
          "laundromat due diligence",
          "how to buy a laundromat",
          "laundromat inspection checklist",
          "how to evaluate a laundromat",
          "what to look for buying laundromat",
          "laundromat evaluation checklist",
          "CLEANBI score",
          "laundromat valuation calculator",
          "laundromat for sale",
          "coin laundry investment analysis",
          "laundromat purchase due diligence",
          "laundromat financial analysis",
          "laundromat location analysis",
          "buy a laundromat business",
          "laundromat red flags buying"
        ]}
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
        faqs={evaluationFaqs}
        howTo={evaluationHowTo}
        author={{
          name: "WashBizHub Team",
          expertise: "Laundromat Investment Analysts",
          credentials: "Analyzed 10,000+ laundromat locations with CLEANBI AI technology"
        }}
      />

      <div className="min-h-screen bg-background" data-testid="page-evaluate">
        <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-gray-900">
          <div className="absolute inset-0 bg-green-500/10" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30">
                <Target className="w-3 h-3 mr-1" />
                For Buyers
              </Badge>
              <h1 
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-white"
                data-testid="text-evaluate-hero-title"
              >
                Evaluate Your <span className="text-green-400">Next Investment</span>
              </h1>
              <p 
                className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
                data-testid="text-evaluate-hero-subtitle"
              >
                Powerful tools to analyze and compare laundromat opportunities
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/cleanbi-auto">
                  <Button 
                    size="lg"
                    className="bg-green-500 text-white hover-elevate active-elevate-2 font-semibold"
                    data-testid="button-evaluate-cleanbi"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Try CLEANBI Score Free
                  </Button>
                </Link>
                <Link href="/laundromat-listings">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover-elevate active-elevate-2 font-semibold backdrop-blur-sm"
                    data-testid="button-evaluate-listings"
                  >
                    Browse Listings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-cleanbi-tool">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered Analysis
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-cleanbi-heading">
                  CLEANBI Score Tool
                </h2>
                <p className="text-lg text-white/70 mb-6">
                  Get an instant AI-powered score for any laundromat location. Our proprietary algorithm analyzes competition, foot traffic, demographics, and more.
                </p>
                <ul className="space-y-3 mb-8">
                  {cleanbiFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-white/80">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/cleanbi-auto">
                  <Button 
                    size="lg"
                    className="bg-green-500 text-white hover-elevate active-elevate-2 font-semibold"
                    data-testid="button-try-cleanbi"
                  >
                    Try Now - It's Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Card className="bg-white/5 border border-green-500/20 p-8" data-testid="card-cleanbi-preview">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6">
                      <span className="text-4xl font-bold text-green-400">87</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sample CLEANBI Score</h3>
                    <p className="text-white/60 mb-4">Grade: A - Excellent Location</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-green-400 font-semibold">Low</div>
                        <div className="text-white/60">Competition</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-green-400 font-semibold">High</div>
                        <div className="text-white/60">Foot Traffic</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-background" data-testid="section-featured-tools">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-500/20 text-green-500 border-green-500/30">
                <Target className="w-3 h-3 mr-1" />
                Buyer Tools
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-tools-heading">
                Everything You Need to Buy Smart
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional tools to help you find, analyze, and acquire the perfect laundromat
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={tool.link}>
                    <Card 
                      className="h-full hover-elevate active-elevate-2 cursor-pointer group transition-all"
                      data-testid={tool.testId}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 mb-3">
                          <Icon className="w-5 h-5 text-green-500" />
                        </div>
                        <CardTitle className="text-xl group-hover:text-green-500 transition-colors">
                          {tool.title}
                        </CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center text-sm font-medium text-green-500">
                          Explore <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-equipment">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
                <ShoppingCart className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-equipment-heading">
                Equipment Marketplace
              </h2>
              <p className="text-lg text-white/70 mb-8">
                Browse new and used commercial laundry equipment from trusted vendors. Compare prices, specs, and find the best deals for your investment.
              </p>
              <Link href="/equipment-marketplace">
                <Button 
                  size="lg"
                  className="bg-green-500 text-white hover-elevate active-elevate-2 font-semibold"
                  data-testid="button-equipment-marketplace"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Equipment
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-background" data-testid="section-faqs">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-500/20 text-green-500 border-green-500/30">
                <HelpCircle className="w-3 h-3 mr-1" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-faq-heading">
                Laundromat Evaluation FAQs
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Expert answers to the most common questions about evaluating and buying laundromats
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {evaluationFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border border-border rounded-lg px-6 data-[state=open]:bg-muted/30"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-green-600" data-testid="section-chrome-cta">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Chrome className="w-16 h-16 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-chrome-cta-heading">
                Install CLEANBI Anywhere
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Score any listing on BizBuySell, LoopNet, or anywhere on the web. Get instant CLEANBI scores right on the listing page.
              </p>
              <a 
                href="https://chrome.google.com/webstore/detail/cleanbi-anywhere" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  className="bg-white text-green-600 hover-elevate active-elevate-2 font-semibold"
                  data-testid="button-chrome-extension"
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Install Free Chrome Extension
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
