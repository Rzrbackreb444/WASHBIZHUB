import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { ValuePropCards } from "@/components/ValuePropCards";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { FeaturedListings } from "@/components/FeaturedListings";
import { 
  BookOpen, Phone, DollarSign, Building2, ArrowRight, 
  Calculator, Bot, Store, Wrench, Globe, Chrome
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dexterLaundromat from "@assets/Dexter Laundromat_1763779877618.jpg";
import serviceGuyAI from "@assets/service guy ai_1763780009739.png";

interface PlatformStats {
  blogPosts: number;
  resources: number;
  listings: number;
  industryMembers: number;
  downtimeReduction: number;
  savedInRepairs: number;
}

export default function Home() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";
  
  // MAXIMUM AEO: Multiple structured data schemas for answer engine optimization
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

  // Combined structured data array for maximum AEO
  const structuredData = [websiteSchema, organizationSchema, faqSchema, softwareSchema, howToSchema];
  
  // Fetch platform stats for dynamic display
  const { data: stats } = useQuery<PlatformStats>({
    queryKey: ['/api/platform-stats'],
  });
  
  // Fetch templates for display
  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ['/api/templates'],
  });
  
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
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <Hero />
      
      {/* Value Props */}
      <ValuePropCards />

      {/* What We Offer - Complete Services Showcase */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-what-we-offer">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
              <Zap className="w-3 h-3 mr-1" />
              Complete Platform
            </Badge>
            <h2 
              className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white mb-4"
              data-testid="text-what-we-offer-heading"
            >
              Everything You Need To Succeed
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              The most comprehensive laundromat business platform with AI-powered tools, 
              professional resources, and enterprise-grade solutions
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Building2,
                title: "Laundromat Listings",
                description: "Browse and list laundromats for sale - connect with buyers and sellers",
                link: "/laundromat-listings",
                testId: "listings"
              },
              {
                icon: Store,
                title: "Equipment Marketplace",
                description: "Buy and sell commercial washers, dryers, and laundry equipment",
                link: "/equipment-marketplace",
                testId: "marketplace"
              },
              {
                icon: BarChart3,
                title: "CLEANBI Score",
                description: "Free AI-powered location analysis - score any address instantly",
                link: "/cleanbi",
                testId: "cleanbi-score"
              },
              {
                icon: Wrench,
                title: "Service Guy AI",
                description: "Equipment troubleshooting with 2,800+ diagnostic codes",
                link: "/service-guy-ai",
                testId: "service-guy-ai"
              },
              {
                icon: DollarSign,
                title: "Get Funding",
                description: "Connect with lenders and explore financing options",
                link: "/startup-funding",
                testId: "funding-matcher"
              },
              {
                icon: BookOpen,
                title: "Resources",
                description: "Industry guides, blog posts, and educational content",
                link: "/resources",
                testId: "resources"
              }
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link key={idx} href={service.link}>
                  <Card 
                    className="p-6 h-full bg-white/5 border-white/10 hover-elevate active-elevate-2 transition-all cursor-pointer group"
                    data-testid={`card-offer-${service.testId}`}
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 text-accent group-hover:bg-accent/30 transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 
                      className="mb-2 text-sm font-bold uppercase tracking-wide text-white"
                      data-testid={`text-offer-title-${service.testId}`}
                    >
                      {service.title}
                    </h3>
                    <p 
                      className="text-sm text-white/60 leading-relaxed"
                      data-testid={`text-offer-desc-${service.testId}`}
                    >
                      {service.description}
                    </p>
                    <div className="mt-4 flex items-center text-accent text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Learn More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/50 text-sm mb-6">
              Trusted by 72,000+ laundromat owners, investors, and operators worldwide
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/cleanbi">
                <Button 
                  size="lg"
                  className="bg-accent text-accent-foreground hover-elevate active-elevate-2"
                  data-testid="button-explore-cleanbi"
                >
                  Start with CLEANBI
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover-elevate active-elevate-2"
                  data-testid="button-book-demo"
                >
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <FeaturedListings />

      {/* Newsletter Signup */}
      <section className="py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <NewsletterSignup variant="hero" source="home_page" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground mb-4">
            Ready To Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of laundromat owners and investors using WashBizHub
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/laundromat-listings">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                data-testid="button-cta-listings"
              >
                Browse Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/listing-form">
              <Button 
                size="lg"
                variant="outline"
                className="hover-elevate active-elevate-2"
                data-testid="button-cta-list"
              >
                List Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
