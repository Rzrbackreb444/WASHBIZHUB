import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { FeaturedListings } from "@/components/FeaturedListings";
import { StickyActionBar, FloatingCTAButton } from "@/components/StickyActionBar";
import { PlatformStats, TrustBadges, EnterpriseFeatures } from "@/components/PlatformStats";
import { PartnerActionsSection, QuickListBanner } from "@/components/PartnerActions";
import { 
  Lightbulb, Target, Settings, Users, ArrowRight, 
  Chrome, MessageCircle, Sparkles
} from "lucide-react";
import aadvantageLogoUrl from "@assets/als_logo_1763778178009.png";
import londrLogoUrl from "@assets/Londr_1763778448894.png";
import serviceGuyAiLogoUrl from "@assets/SERVICE GUY_1764436998885.png";

const journeyPaths = [
  {
    id: "plan",
    icon: Lightbulb,
    headline: "Thinking About It?",
    description: "Learn if owning a laundromat is right for you",
    features: "ROI Calculator • Funding Options • Industry Guides",
    link: "/startup-funding",
    colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    hoverBg: "hover:border-blue-500/50",
    testId: "plan"
  },
  {
    id: "evaluate",
    icon: Target,
    headline: "Ready to Buy or Sell?",
    description: "Browse active listings or list your own",
    features: "Marketplace • CLEANBI Score • Valuations",
    link: "/listings",
    secondaryLink: "/add-listing",
    secondaryText: "Add a Listing",
    colorClass: "bg-green-500/20 text-green-400 border-green-500/30",
    hoverBg: "hover:border-green-500/50",
    testId: "evaluate"
  },
  {
    id: "operate",
    icon: Settings,
    headline: "Already Own One?",
    description: "Run your laundromat like a pro",
    features: "POS System • Diagnostics • Design Studio",
    link: "/pos-command-center",
    colorClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    hoverBg: "hover:border-orange-500/50",
    testId: "operate"
  },
  {
    id: "partner",
    icon: Users,
    headline: "Sell or Serve?",
    description: "Connect with laundromat owners",
    features: "List Equipment • Advertise • Affiliates",
    link: "/listing-form",
    colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    hoverBg: "hover:border-purple-500/50",
    testId: "partner"
  }
];

export default function Home() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": ["The Laundromat Bible", "The #1 Laundromat Resource Hub", "CLEANBI"],
    "url": baseUrl,
    "description": "The #1 laundromat resource and educational hub. Enterprise-grade SaaS with CLEANBI universal scoring, POS Command Center, AI consulting, marketplace, courses, 50+ calculators, and industry resources for 72,000+ professionals.",
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${baseUrl}/resources?searchQuery={search_term_string}` },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${baseUrl}/cleanbi-auto?address={address_string}` },
        "query-input": "required name=address_string"
      }
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "alternateName": ["The Laundromat Bible", "The #1 Laundromat Resource Hub"],
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "description": "The #1 laundromat resource and educational hub serving 72,000+ industry professionals worldwide with CLEANBI universal scoring, AI-powered business intelligence, marketplace, courses, and professional tools.",
    "foundingDate": "2024",
    "sameAs": ["https://www.facebook.com/washbizhub1", "https://twitter.com/washbizhub", "https://www.linkedin.com/company/washbizhub"],
    "contactPoint": { "@type": "ContactPoint", "contactType": "Customer Service", "email": "support@washbizhub.com", "areaServed": "Worldwide" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is WashBizHub?", "acceptedAnswer": { "@type": "Answer", "text": "WashBizHub is the #1 laundromat resource and educational hub, serving over 72,000 industry professionals worldwide. We provide CLEANBI universal business scoring, AI-powered consulting, marketplace for equipment and businesses, professional courses, 50+ calculators, and comprehensive industry resources for laundromat owners, investors, operators, and vendors." } },
      { "@type": "Question", "name": "What is CLEANBI and how does it work?", "acceptedAnswer": { "@type": "Answer", "text": "CLEANBI is a free, Google-powered universal scoring system that rates any business or property location from 0-100 based on foot traffic, competition, reviews, and location quality. It works for ANY business type (restaurants, retail, laundromats, car washes, gyms, etc.) or residential property in 220+ countries. Scores 90+ = A grade, 80-89 = B, 70-79 = C, below 70 = Needs Work. Premium $97 reports available for deep analysis." } },
      { "@type": "Question", "name": "Is CLEANBI free to use?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! The basic CLEANBI score is 100% free with unlimited searches for any address globally. No login required. Premium $97 reports are available for deeper analysis, business valuations, AI-powered investment recommendations, and comprehensive market data." } },
      { "@type": "Question", "name": "What business types can CLEANBI score?", "acceptedAnswer": { "@type": "Answer", "text": "CLEANBI scores ANY business type including restaurants, retail stores, laundromats, car washes, gyms, salons, gas stations, hotels, coffee shops, convenience stores, and any business with a Google Places listing. It also scores residential properties including single-family homes, condos, townhouses, and investment properties." } },
      { "@type": "Question", "name": "What countries does CLEANBI cover?", "acceptedAnswer": { "@type": "Answer", "text": "CLEANBI provides global coverage across 220+ countries including USA, Canada, UK, Australia, Japan, Philippines, Germany, France, Spain, Italy, Brazil, Mexico, India, China, South Africa, Singapore, UAE, and everywhere Google Maps/Places data is available." } },
      { "@type": "Question", "name": "How can WashBizHub help me buy a laundromat?", "acceptedAnswer": { "@type": "Answer", "text": "WashBizHub provides comprehensive tools for laundromat buyers including CLEANBI location scoring, ROI calculators, valuation tools, marketplace listings, due diligence guides, funding options through AAdvantage and partner lenders, and AI-powered consulting. Our platform helps you analyze opportunities and make data-driven investment decisions." } }
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CLEANBI Universal Business & Property Score Calculator",
    "alternateName": ["CLEANBI Score", "CLEANBI Anywhere", "Universal Address Scorer"],
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "2847", "bestRating": "5", "worstRating": "1" },
    "description": "Score ANY business or residential property worldwide in seconds. Uses Google Places API to analyze foot traffic, competition, reviews, location quality. Works for all business types in 220+ countries. 100% free basic scores.",
    "featureList": ["Universal Address Scoring for ANY business type", "Global Coverage - 220+ countries", "Real-Time Google Data", "Instant A-F Grades", "Free Chrome Extension", "$97 Premium Reports"]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Get a CLEANBI Score for Any Business or Property",
    "description": "Step-by-step guide to score any business or property location worldwide using the free CLEANBI tool",
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Visit CLEANBI", "text": "Go to washbizhub.com/cleanbi-auto to access the free universal address scoring tool" },
      { "@type": "HowToStep", "position": 2, "name": "Enter Address", "text": "Type any business or residential address including street, city, state, and country" },
      { "@type": "HowToStep", "position": 3, "name": "Click Calculate", "text": "Press 'Calculate CLEANBI Score' to analyze the location with Google Places data in seconds" },
      { "@type": "HowToStep", "position": 4, "name": "View Results", "text": "Receive your 0-100 score with A-F grade, category breakdown, and AI recommendations" },
      { "@type": "HowToStep", "position": 5, "name": "Get Premium Report", "text": "Optionally upgrade to $97 premium report for deep analysis, valuations, and investment recommendations" }
    ],
    "totalTime": "PT30S"
  };

  const structuredData = [websiteSchema, organizationSchema, faqSchema, softwareSchema, howToSchema];
  
  return (
    <>
      <SEO
        title="WashBizHub - Enterprise Laundromat Management Software & Marketplace"
        description="Professional laundromat business management platform with POS systems, IoT monitoring, AI consulting, marketplace, CLEANBI™ scoring, design studio, ROI calculators, and industry resources. Serving 72,000+ laundromat owners, investors, and operators worldwide with enterprise-grade coin laundry solutions."
        canonicalUrl="/"
        keywords={[
          "laundromat management software",
          "coin laundry business platform",
          "laundromat POS system",
          "commercial laundry equipment marketplace",
          "laundromat investment calculator",
          "CLEANBI business valuation",
          "laundromat IoT monitoring",
          "self-service laundry management",
          "coin-operated laundry software",
          "laundromat design studio",
          "commercial washing machine business",
          "laundromat ROI calculator",
          "coin laundry consulting",
          "laundromat ROI calculator"
        ]}
        structuredData={structuredData}
      />
      <StickyActionBar />
      <FloatingCTAButton />
      <div className="min-h-screen bg-background">
        <Hero />
        
        <TrustBadges />

        {/* Choose Your Path Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-choose-path">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Choose Your Path
              </Badge>
              <h2 
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4"
                data-testid="text-choose-path-heading"
              >
                Where Are You On Your Journey?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Select your path and we'll show you the tools and resources designed just for you
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {journeyPaths.map((path) => {
                const Icon = path.icon;
                return (
                  <Link key={path.id} href={path.link}>
                    <Card 
                      className={`p-6 h-full bg-white/5 border-2 border-white/10 hover-elevate active-elevate-2 transition-all cursor-pointer group ${path.hoverBg}`}
                      data-testid={`card-path-${path.testId}`}
                    >
                      <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${path.colorClass}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 
                        className="mb-2 text-xl font-bold text-white"
                        data-testid={`text-path-title-${path.testId}`}
                      >
                        {path.headline}
                      </h3>
                      <p 
                        className="text-sm text-white/70 mb-4 leading-relaxed"
                        data-testid={`text-path-desc-${path.testId}`}
                      >
                        {path.description}
                      </p>
                      <p className="text-xs text-white/50 mb-4">
                        {path.features}
                      </p>
                      <div className="flex items-center text-accent text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Get Started
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLEANBI Chrome Extension Banner */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border-y border-accent/20" data-testid="section-chrome-extension">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Chrome className="w-10 h-10 text-accent mr-3" />
              <h2 
                className="text-2xl sm:text-3xl font-bold text-foreground"
                data-testid="text-extension-heading"
              >
                Score Any Address in Seconds — Free
              </h2>
            </div>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Works on BizBuySell, LoopNet, Zillow, and anywhere online. Get instant CLEANBI scores 
              for any business or property listing you're browsing.
            </p>
            <a 
              href="https://chrome.google.com/webstore/detail/cleanbi-anywhere" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                className="bg-accent text-accent-foreground hover-elevate active-elevate-2 font-bold shadow-lg shadow-accent/20"
                data-testid="button-install-extension"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Install CLEANBI Anywhere Extension
              </Button>
            </a>
          </div>
        </section>

        <PlatformStats />
        
        <EnterpriseFeatures />

        {/* Social Proof Section */}
        <section className="py-12 bg-background" data-testid="section-social-proof">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="text-center mb-8">
              <p 
                className="text-sm font-bold tracking-wider text-muted-foreground uppercase"
                data-testid="text-trusted-by"
              >
                Serving 72,000+ laundromat owners, investors & operators
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
              <a 
                href="https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-14 flex items-center opacity-70 hover:opacity-100 transition-all hover:scale-105"
                data-testid="brand-logo-aadvantage"
              >
                <img 
                  src={aadvantageLogoUrl} 
                  alt="AAdvantage Laundry Systems" 
                  className="h-full w-auto object-contain"
                />
              </a>
              
              <a 
                href="https://londr.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-14 flex items-center opacity-70 hover:opacity-100 transition-all hover:scale-105"
                data-testid="brand-logo-londr"
              >
                <img 
                  src={londrLogoUrl} 
                  alt="LONDR" 
                  className="h-full w-auto object-contain"
                />
              </a>
              
              <Link href="/service-guy-ai">
                <div
                  className="h-24 flex items-center opacity-70 hover:opacity-100 transition-all hover:scale-105 cursor-pointer"
                  data-testid="brand-logo-service-guy-ai"
                >
                  <img 
                    src={serviceGuyAiLogoUrl} 
                    alt="Service Guy AI - AI-Powered Equipment Diagnostics" 
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Link>
            </div>
          </div>
        </section>

        <FeaturedListings />

        <PartnerActionsSection />

        <QuickListBanner />

        {/* Newsletter Signup */}
        <section className="py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <NewsletterSignup variant="hero" source="home_page" />
          </div>
        </section>

        {/* Final CTA - AI Consultant */}
        <section className="py-16 sm:py-24 bg-muted/30" data-testid="section-final-cta">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-6">
              <MessageCircle className="w-8 h-8 text-accent" />
            </div>
            <h2 
              className="text-3xl font-bold tracking-tight text-foreground mb-4"
              data-testid="text-final-cta-heading"
            >
              Not Sure Where to Start?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our AI Consultant can help you figure out the best path forward based on your goals, 
              budget, and experience level.
            </p>
            <Link href="/consultant-inquiry">
              <Button 
                size="lg"
                className="bg-accent text-accent-foreground hover-elevate active-elevate-2 font-bold"
                data-testid="button-chat-ai-consultant"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat with AI Consultant
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
