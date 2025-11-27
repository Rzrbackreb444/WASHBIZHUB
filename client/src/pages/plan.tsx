import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Lightbulb, ArrowRight, Chrome, Calculator, DollarSign, 
  TrendingUp, BookOpen, MessageSquare, Users, Shield,
  Clock, Percent
} from "lucide-react";

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

export default function PlanPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Plan Your Laundromat Investment",
    "description": "Everything you need to decide if owning a laundromat is right for you. ROI calculators, funding options, and educational resources.",
    "url": "https://washbizhub.com/plan"
  };

  return (
    <>
      <SEO
        title="Plan Your Laundromat Investment - ROI Calculators & Funding"
        description="Planning to buy a laundromat? Access ROI calculators, startup cost estimators, funding options, and educational resources. Learn if laundromat ownership is right for you with 20-30% average returns."
        canonicalUrl="/plan"
        keywords={[
          "laundromat investment planning",
          "laundromat ROI calculator",
          "laundromat startup costs",
          "laundromat funding",
          "buy a laundromat",
          "laundromat business plan",
          "coin laundry investment",
          "laundromat ownership"
        ]}
        structuredData={structuredData}
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
