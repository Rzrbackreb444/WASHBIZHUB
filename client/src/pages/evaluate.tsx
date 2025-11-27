import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Target, ArrowRight, Chrome, Search, Calculator, 
  ClipboardCheck, ShoppingCart, Sparkles, CheckCircle
} from "lucide-react";

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

export default function EvaluatePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Evaluate Laundromat Investments",
    "description": "Powerful tools to analyze and compare laundromat opportunities. CLEANBI scoring, valuation calculators, and due diligence resources.",
    "url": "https://washbizhub.com/evaluate"
  };

  return (
    <>
      <SEO
        title="Evaluate Laundromat Investments - CLEANBI Score & Valuation Tools"
        description="Analyze and compare laundromat opportunities with CLEANBI AI-powered scoring, valuation calculators, and due diligence tools. Find the perfect laundromat investment."
        canonicalUrl="/evaluate"
        keywords={[
          "laundromat evaluation",
          "CLEANBI score",
          "laundromat valuation",
          "buy laundromat",
          "laundromat for sale",
          "laundromat due diligence",
          "coin laundry investment",
          "laundromat analysis"
        ]}
        structuredData={structuredData}
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
