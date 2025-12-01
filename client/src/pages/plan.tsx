import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Lightbulb, ArrowRight, Chrome, Calculator, DollarSign, 
  TrendingUp, BookOpen, MessageSquare, Users, Shield,
  Clock, Percent, HelpCircle, ChevronDown
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const whyLaundromatStats = [
  {
    icon: Percent,
    stat: "20-30%",
    label: "Average ROI",
    description: "Industry-leading returns on investment"
  },
  {
    icon: Shield,
    stat: "Recession",
    label: "Resistant",
    description: "People always need clean clothes"
  },
  {
    icon: Clock,
    stat: "Low",
    label: "Staffing",
    description: "Self-service model minimizes labor costs"
  }
];

const featuredTools = [
  {
    id: "roi-calculator",
    title: "ROI Calculator",
    description: "Calculate your potential return on investment before buying",
    icon: Calculator,
    link: "/calculators",
    testId: "card-roi-calculator"
  },
  {
    id: "startup-costs",
    title: "Startup Costs Calculator",
    description: "Estimate total investment needed to open your laundromat",
    icon: DollarSign,
    link: "/calculators",
    testId: "card-startup-costs"
  },
  {
    id: "funding",
    title: "Get Funding",
    description: "Connect with lenders specializing in laundromat financing",
    icon: TrendingUp,
    link: "/startup-funding",
    badge: "Popular",
    testId: "card-get-funding"
  }
];

const educationalResources = [
  {
    id: "book",
    title: "The Laundromat Bible",
    description: "The comprehensive guide to laundromat ownership",
    icon: BookOpen,
    link: "/book",
    testId: "card-laundromat-bible"
  },
  {
    id: "blog",
    title: "Blog & Guides",
    description: "Expert articles and industry insights",
    icon: MessageSquare,
    link: "/blog",
    testId: "card-blog-guides"
  },
  {
    id: "consultation",
    title: "Book a Consultation",
    description: "Get personalized advice from industry experts",
    icon: Users,
    link: "/consultation",
    testId: "card-book-consultation"
  }
];

const planningFaqs = [
  {
    question: "How do I plan a laundromat business from scratch?",
    answer: "Planning a laundromat business involves 7 key steps: 1) Research your target market and competition, 2) Create a detailed business plan with financial projections, 3) Secure financing through SBA loans, equipment financing, or investors, 4) Find the right location with high foot traffic and demographics, 5) Choose between buying existing or building new, 6) Select equipment (washers, dryers, payment systems), and 7) Plan your grand opening marketing strategy. Use our ROI Calculator and CLEANBI Score tools to validate your business plan with real data."
  },
  {
    question: "What permits and licenses do I need to open a laundromat?",
    answer: "To open a laundromat, you typically need: 1) Business license from your city/county, 2) Seller's permit for retail sales (soap, snacks), 3) Building permit for construction/renovation, 4) Plumbing permit for water connections, 5) Electrical permit for high-voltage equipment, 6) Health department permit in some jurisdictions, 7) Sign permit for exterior signage, 8) Fire safety inspection approval, 9) Certificate of occupancy. Requirements vary by location - contact your local city hall and county clerk for specific requirements. Most permits cost $50-$500 each, with total permitting typically $2,000-$10,000."
  },
  {
    question: "How much does it cost to start a laundromat business?",
    answer: "Laundromat startup costs typically range from $200,000 to $500,000 for a new build, and $100,000 to $300,000 for acquiring an existing business. Key costs include: equipment ($100K-$300K), leasehold improvements ($50K-$150K), initial working capital ($20K-$50K), licenses and permits ($2K-$10K), and marketing ($5K-$15K). Location, size, and equipment quality significantly impact total investment. Use our Startup Costs Calculator for a personalized estimate."
  },
  {
    question: "How do I write a laundromat business plan?",
    answer: "A comprehensive laundromat business plan includes: Executive Summary, Market Analysis (demographics, competition, demand), Location Analysis, Equipment Plan, Financial Projections (5-year P&L, cash flow, break-even), Marketing Strategy, Operations Plan, and Funding Requirements. Include specific metrics like turns per day (TPD), average ticket size, and operating costs. Download our free business plan template in the Resources section."
  },
  {
    question: "What is the average ROI for a laundromat investment?",
    answer: "Well-run laundromats typically generate 20-30% cash-on-cash returns annually, making them one of the most profitable small business investments. Factors affecting ROI include location quality, equipment efficiency, operational costs, and pricing strategy. A $300,000 laundromat investment can generate $60,000-$90,000 in annual cash flow. Use our ROI Calculator to project returns based on your specific situation."
  },
  {
    question: "How do I finance a laundromat purchase?",
    answer: "Common laundromat financing options include: SBA 7(a) loans (up to $5M, 10-25 year terms), SBA 504 loans (for real estate/equipment), equipment financing (80-100% of equipment cost), conventional bank loans, and seller financing. Most lenders require 10-30% down payment and good credit (680+). Our Funding Matcher connects you with lenders specializing in laundromat acquisitions."
  },
  {
    question: "Is owning a laundromat a good investment in 2024?",
    answer: "Yes, laundromats remain excellent investments in 2024 due to: recession-resistant demand, high cash flow potential (20-30% ROI), relatively passive income model, tax advantages (depreciation), and growing population in urban areas. The $5 billion U.S. laundromat industry grows 5% annually. Key success factors include location selection, equipment quality, and operational efficiency."
  },
  {
    question: "How long does it take to open a laundromat?",
    answer: "Opening a new laundromat typically takes 6-12 months from planning to grand opening. Timeline includes: business planning (1-2 months), site selection and lease negotiation (1-3 months), permits and approvals (1-3 months), construction/renovation (2-4 months), equipment installation (2-4 weeks), and soft opening (2-4 weeks). Buying an existing laundromat can close in 30-90 days."
  }
];

const planningHowTo = {
  name: "How to Plan Your Laundromat Business",
  description: "Complete step-by-step guide to planning your laundromat investment, from initial research to securing funding and finding the perfect location. Learn what permits you need, how much to invest, and create a winning business plan.",
  totalTime: "PT30D",
  steps: [
    {
      name: "Research the Laundromat Industry",
      text: "Study the laundromat industry fundamentals including average ROI (20-30%), typical operating costs, and market trends. Read The Laundromat Bible for comprehensive insights from industry experts."
    },
    {
      name: "Define Your Investment Goals",
      text: "Determine your budget ($100K-$500K typical), desired income level, and whether you want to buy an existing business or build new. Consider passive vs. active ownership models."
    },
    {
      name: "Calculate Startup Costs and ROI",
      text: "Use our Startup Costs Calculator to estimate total investment needed. Input equipment costs, lease expenses, and working capital requirements to project your return on investment."
    },
    {
      name: "Analyze Target Markets with CLEANBI",
      text: "Use the CLEANBI Score tool to analyze potential locations. Get AI-powered insights on competition, demographics, foot traffic, and market saturation for any address."
    },
    {
      name: "Create Your Business Plan",
      text: "Develop a comprehensive business plan including market analysis, financial projections, equipment specifications, and operational strategy. Download our free template from Resources."
    },
    {
      name: "Secure Financing",
      text: "Apply for financing through SBA loans, equipment financing, or our Funding Matcher to connect with lenders specializing in laundromat investments. Most require 10-30% down payment."
    },
    {
      name: "Book a Consultation",
      text: "Schedule a consultation with our laundromat industry experts for personalized advice on your business plan, location selection, and investment strategy."
    }
  ]
};

export default function PlanPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Plan Your Laundromat Investment",
    "description": "Everything you need to decide if owning a laundromat is right for you. ROI calculators, funding options, and educational resources.",
    "url": "https://washbizhub.com/plan",
    "mainEntity": {
      "@type": "Article",
      "headline": "How to Plan a Laundromat Business Investment",
      "description": "Complete guide to planning your laundromat investment with ROI calculators, startup cost estimates, funding options, and expert resources.",
      "author": {
        "@type": "Organization",
        "name": "WashBizHub"
      }
    }
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Plan Your Investment", url: "/plan" }
  ];

  return (
    <>
      <SEO
        title="Plan Your Laundromat Investment - ROI Calculators, Startup Costs & Funding Guide"
        description="Planning to buy a laundromat? Access ROI calculators, startup cost estimators, funding options, and educational resources. Learn if laundromat ownership is right for you with 20-30% average returns. Free business plan templates and expert guidance."
        canonicalUrl="/plan"
        keywords={[
          "how to start a laundromat",
          "laundromat business plan",
          "laundromat startup guide",
          "laundromat startup costs",
          "laundromat permits and licenses",
          "laundromat investment planning",
          "laundromat ROI calculator",
          "laundromat funding",
          "buy a laundromat",
          "coin laundry investment",
          "laundromat ownership",
          "laundromat financing options",
          "laundromat business plan template",
          "self-service laundry business",
          "how much to open a laundromat"
        ]}
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
        faqs={planningFaqs}
        howTo={planningHowTo}
        author={{
          name: "WashBizHub Team",
          expertise: "Laundromat Industry Experts",
          credentials: "Combined 50+ years of laundromat ownership, brokerage, and consulting experience"
        }}
      />

      <div className="min-h-screen bg-background" data-testid="page-plan">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900">
          <div className="absolute inset-0 bg-blue-500/10" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Lightbulb className="w-3 h-3 mr-1" />
                For Dreamers
              </Badge>
              <h1 
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-white"
                data-testid="text-plan-hero-title"
              >
                Planning Your <span className="text-blue-400">Laundromat Investment</span>
              </h1>
              <p 
                className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
                data-testid="text-plan-hero-subtitle"
              >
                Everything you need to decide if owning a laundromat is right for you
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/calculators">
                  <Button 
                    size="lg"
                    className="bg-blue-500 text-white hover-elevate active-elevate-2 font-semibold"
                    data-testid="button-plan-calculators"
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    Try Our Calculators
                  </Button>
                </Link>
                <Link href="/startup-funding">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover-elevate active-elevate-2 font-semibold backdrop-blur-sm"
                    data-testid="button-plan-funding"
                  >
                    Explore Funding Options
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-why-laundromats">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-why-heading">
                Why Laundromats?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Laundromats are one of the most reliable small business investments
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {whyLaundromatStats.map((item) => {
                const Icon = item.icon;
                return (
                  <Card 
                    key={item.stat} 
                    className="p-6 bg-white/5 border border-white/10 text-center"
                    data-testid={`card-stat-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{item.stat}</div>
                    <div className="text-lg font-semibold text-blue-400 mb-2">{item.label}</div>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-background" data-testid="section-featured-tools">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-500/20 text-blue-500 border-blue-500/30">
                <Calculator className="w-3 h-3 mr-1" />
                Featured Tools
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-tools-heading">
                Start Your Research
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Use our professional calculators to analyze your investment potential
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
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                            <Icon className="w-5 h-5 text-blue-500" />
                          </div>
                          {tool.badge && (
                            <Badge className="bg-accent/20 text-accent border-accent/30">
                              {tool.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl group-hover:text-blue-500 transition-colors">
                          {tool.title}
                        </CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center text-sm font-medium text-blue-500">
                          Try Now <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-resources">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
                <BookOpen className="w-3 h-3 mr-1" />
                Educational Resources
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-resources-heading">
                Learn From the Experts
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Access comprehensive guides, articles, and expert consultation
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {educationalResources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Link key={resource.id} href={resource.link}>
                    <Card 
                      className="h-full bg-white/5 border border-white/10 hover-elevate active-elevate-2 cursor-pointer group transition-all"
                      data-testid={resource.testId}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 mb-3">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                          {resource.title}
                        </CardTitle>
                        <CardDescription className="text-white/60">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center text-sm font-medium text-blue-400">
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

        <section className="py-16 sm:py-24 bg-background" data-testid="section-faqs">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-500/20 text-blue-500 border-blue-500/30">
                <HelpCircle className="w-3 h-3 mr-1" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-faq-heading">
                Laundromat Planning FAQs
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get answers to the most common questions about planning your laundromat investment
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {planningFaqs.map((faq, index) => (
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

        <section className="py-16 sm:py-24 bg-blue-600" data-testid="section-chrome-cta">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Chrome className="w-16 h-16 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-chrome-cta-heading">
                Research Any Listing with CLEANBI
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Install our free Chrome extension to instantly score any laundromat listing on BizBuySell, LoopNet, or any website
              </p>
              <a 
                href="https://chrome.google.com/webstore/detail/cleanbi-anywhere" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover-elevate active-elevate-2 font-semibold"
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
