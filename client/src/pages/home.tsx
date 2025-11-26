import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { ValuePropCards } from "@/components/ValuePropCards";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { FeaturedListings } from "@/components/FeaturedListings";
import { FeaturedBlogsCarousel } from "@/components/FeaturedBlogsCarousel";
import { FeaturedListingsCarousel } from "@/components/FeaturedListingsCarousel";
import { AAdvantageSpotlight } from "@/components/AAdvantageSpotlight";
import { 
  BookOpen, GraduationCap, Phone, Download, DollarSign, 
  Building2, Rocket, TrendingUp, ArrowRight, Shield, Zap, Users, AlertTriangle,
  Calculator, Bot, Palette, BarChart3, Store, Wrench, Globe, Chrome, FileText, CreditCard
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import modernMachinesImg from "@assets/AdobeStock_832897447_1763779877616.jpeg";
import industrialRowImg from "@assets/AdobeStock_790549884_1763779877616.jpeg";
import washerDrumsImg from "@assets/AdobeStock_561067303_1763779877613.jpeg";
import colorfulLoadImg from "@assets/AdobeStock_711286802_1763779877615.jpeg";
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
    "contactPoint": { "@type": "ContactPoint", "contactType": "Customer Service", "email": "support@washbizhub.com", "telephone": "+1-479-883-4314", "areaServed": "Worldwide" }
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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BarChart3,
                title: "CLEANBI Score",
                description: "AI-powered location analysis and business valuation with comprehensive market insights",
                link: "/cleanbi",
                testId: "cleanbi-score"
              },
              {
                icon: Palette,
                title: "3D Design Studio",
                description: "Professional layout planning tool for optimizing your laundromat floor plan",
                link: "/design-studio",
                testId: "design-studio"
              },
              {
                icon: Bot,
                title: "WashBizHub Consultant",
                description: "AI chatbot trained on industry expertise for instant business guidance",
                link: "#",
                testId: "consultant"
              },
              {
                icon: Calculator,
                title: "Calculators Suite",
                description: "50+ professional calculators for ROI, valuations, pricing, and operations",
                link: "/calculators",
                testId: "calculators"
              },
              {
                icon: GraduationCap,
                title: "Premium Courses",
                description: "Comprehensive education platform for mastering the laundromat business",
                link: "/courses",
                testId: "courses"
              },
              {
                icon: BookOpen,
                title: "The Laundromat Bible",
                description: "The definitive industry guidebook with decades of expertise",
                link: "/book",
                testId: "book"
              },
              {
                icon: FileText,
                title: "Templates & Guides",
                description: "Professional documents, SOPs, and business templates",
                link: "/templates",
                testId: "templates"
              },
              {
                icon: Store,
                title: "Equipment Marketplace",
                description: "Buy and sell commercial laundry equipment with verified listings",
                link: "/marketplace",
                testId: "marketplace"
              },
              {
                icon: Building2,
                title: "Laundromat Listings",
                description: "Browse and list laundromats for sale across the country",
                link: "/laundromat-listings",
                testId: "listings"
              },
              {
                icon: CreditCard,
                title: "POS System",
                description: "Enterprise point-of-sale solution with real-time analytics",
                link: "/pos",
                testId: "pos-system"
              },
              {
                icon: Globe,
                title: "Website Hosting",
                description: "Custom professional websites designed for laundromats",
                link: "/website-hosting",
                testId: "website-hosting"
              },
              {
                icon: Chrome,
                title: "Chrome Extension",
                description: "CLEANBI browser tool for instant property analysis",
                link: "#",
                testId: "chrome-extension"
              },
              {
                icon: Wrench,
                title: "Service Guy AI",
                description: "2,800+ diagnostic codes with step-by-step repair guidance",
                link: "/service-guy-ai",
                testId: "service-guy-ai"
              },
              {
                icon: DollarSign,
                title: "Funding Matcher",
                description: "Connect with lenders and explore financing options",
                link: "/funding-matcher",
                testId: "funding-matcher"
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

      {/* Featured Blogs Carousel */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <FeaturedBlogsCarousel />
      </section>

      {/* Featured Listings Carousel */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <FeaturedListingsCarousel />
      </section>

      {/* AAdvantage Laundry Equipment Spotlight - Ultra SEO Optimized */}
      <AAdvantageSpotlight />

      {/* Newsletter Signup */}
      <section className="py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <NewsletterSignup variant="hero" source="home_page" />
        </div>
      </section>

      {/* Feature Section 1: Enterprise Equipment */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg order-2 lg:order-1">
              <img 
                src={modernMachinesImg} 
                alt="Modern commercial front-load washers and dryers in pristine white and silver finish - enterprise-grade laundromat equipment for professional laundry operations"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            </div>
            {/* Content */}
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Shield className="w-3 h-3 mr-1" />
                Enterprise Grade
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                Built For Professional Operations
              </h2>
              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                WashBizHub powers laundromats across North America with enterprise-grade POS systems, 
                IoT machine monitoring, and real-time business intelligence. Track every transaction, 
                monitor equipment health, and optimize operations from a single platform.
              </p>
              <div className="space-y-3 mb-8">
                {["Real-time POS & inventory tracking", "IoT machine diagnostics", "Multi-location dashboard"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/cleanbi">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                  data-testid="button-feature-cleanbi"
                >
                  Explore CLEANBI™
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: IoT Analytics */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                <Zap className="w-3 h-3 mr-1" />
                Smart Analytics
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 uppercase tracking-tight">
                Predictive Maintenance & Real-Time Insights
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Stop breakdowns before they happen. Our IoT sensors monitor temperature, vibration, 
                and water flow across all machines, alerting you to issues before customers notice. 
                Reduce downtime by 40% and extend equipment life.
              </p>
              <div className="space-y-3 mb-8">
                {["2,800+ diagnostic codes", "Automated maintenance alerts", "Energy consumption tracking"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    <span className="text-foreground/90">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/design-studio">
                <Button 
                  size="lg"
                  variant="outline"
                  className="hover-elevate active-elevate-2"
                  data-testid="button-feature-design"
                >
                  Design Your Layout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={industrialRowImg} 
                alt="Industrial row of heavy-duty commercial washers in professional laundry facility - high-capacity coin-operated laundromat machines for commercial use"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-accent/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Industry Heritage */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg order-2 lg:order-1">
              <img 
                src={washerDrumsImg} 
                alt="Commercial washing machine drums and interior - professional laundromat equipment maintenance and diagnostics"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
            </div>
            {/* Content */}
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Users className="w-3 h-3 mr-1" />
                Trusted Heritage
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                72,000 Owners. Decades Of Expertise.
              </h2>
              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                From Facebook's largest laundromat community to The Laundromat Bible—we've built 
                the industry's most comprehensive knowledge base. Now available as an AI-powered 
                consultant trained on every best practice, diagnostic code, and success story.
              </p>
              <div className="space-y-3 mb-8">
                {["72,000+ community members", "The Laundromat Bible + Courses", "AI-powered business consultant"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/book">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                  data-testid="button-feature-book"
                >
                  Get The Complete Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-templates-heading"
            >
              Start With Proven Templates & Guides
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional resources to launch and grow your business
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(templates || []).slice(0, 4).map((template: any, idx: number) => (
              <Card 
                key={template.id}
                className="overflow-hidden hover-elevate transition-all"
                data-testid={`card-template-${idx}`}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {template.imageUrl && (
                    <img 
                      src={template.imageUrl} 
                      alt={template.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {!template.isPremium && (
                    <Badge 
                      className="absolute top-3 left-3 bg-background text-foreground"
                      data-testid={`badge-free-${idx}`}
                    >
                      Free
                    </Badge>
                  )}
                  {template.isPremium && (
                    <Badge 
                      className="absolute top-3 left-3 bg-primary text-primary-foreground"
                      data-testid={`badge-premium-${idx}`}
                    >
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {template.category}
                  </div>
                  <h3 
                    className="mb-2 text-sm font-bold uppercase text-foreground"
                    data-testid={`text-template-title-${idx}`}
                  >
                    {template.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {template.isPremium ? `$${template.price}` : 'FREE'}
                    </span>
                    <Button 
                      size="sm" 
                      variant={template.isPremium ? "default" : "outline"}
                      data-testid={`button-template-${idx}`}
                    >
                      {template.isPremium ? (
                        <>Purchase</>
                      ) : (
                        <>
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/templates">
              <Button 
                variant="outline"
                size="lg"
                className="hover-elevate active-elevate-2"
                data-testid="button-see-all-templates"
              >
                See All Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Financing Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-financing-heading"
            >
              Secure Financing For Your Laundromat
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore financing options and get funded faster
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "SBA 7(A) LOAN", description: "Government-backed financing with favorable terms" },
              { icon: Building2, title: "COMMERCIAL REAL ESTATE", description: "Traditional commercial property financing" },
              { icon: DollarSign, title: "EQUIPMENT FINANCING", description: "Loans specifically for laundry equipment" },
              { icon: Rocket, title: "STARTUP FINANCING", description: "Funding packages for new laundromat builds" },
            ].map((option, idx) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={idx}
                  className="p-8 text-center hover-elevate transition-all"
                  data-testid={`card-financing-${idx}`}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/funding-matcher">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                data-testid="button-start-application"
              >
                Start Application
              </Button>
            </Link>
            <Link href="/consultation">
              <Button 
                size="lg"
                variant="outline"
                className="hover-elevate active-elevate-2"
                data-testid="button-book-consultation"
              >
                Book a Funding Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Guy AI Section - Honoring Guy Kremers */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={serviceGuyAI} 
                  alt="Service Guy AI - AI-Powered Repair Diagnostics honoring Guy Kremers"
                  className="h-16 w-auto"
                  loading="lazy"
                />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 uppercase tracking-tight">
                Service Guy AI
              </h2>
              <p className="text-sm text-white/60 italic mb-6">
                Honoring Guy Kremers - A lifetime of service excellence
              </p>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                Get instant access to 2,800+ diagnostic codes with step-by-step repair instructions, 
                safety warnings, and one-click parts ordering. Service Guy AI combines decades of 
                technician expertise with modern AI to help you troubleshoot and repair equipment faster.
              </p>
              <div className="space-y-3 mb-8">
                {["2,800+ diagnostic error codes", "Step-by-step repair instructions", "Amazon parts ordering integration", "Safety disclaimers & professional guidance"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60 mb-8 p-4 bg-white/5 rounded-md border border-white/10">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="italic">For educational purposes only. Always consult a certified professional technician.</span>
              </div>
              <Link href="/repair-guide">
                <Button 
                  size="lg"
                  className="bg-accent text-accent-foreground hover-elevate active-elevate-2"
                  data-testid="button-service-guy-ai"
                >
                  Launch Service Guy AI
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg order-first lg:order-last">
              <img 
                src={colorfulLoadImg} 
                alt="Professional laundromat service and maintenance - Service Guy AI diagnostic tools"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-education-heading"
            >
              Learn From The Experts
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive education and guidance for every stage
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "THE ULTIMATE LAUNDROMAT GUIDEBOOK",
                description: "The definitive guide to buying, operating, and scaling profitable laundromats",
                action: "Get the Book",
                link: "/book",
              },
              {
                icon: GraduationCap,
                title: "ONLINE COURSES",
                description: "Self-paced courses to master every aspect of the laundromat business",
                action: "Enroll Now",
                link: "/courses",
              },
              {
                icon: Phone,
                title: "CONSULTATIONS",
                description: "One-on-one guidance on acquisitions, operations, and growth strategy",
                action: "Book a Call",
                link: "/consultation",
              },
            ].map((edu, idx) => {
              const Icon = edu.icon;
              return (
                <Card 
                  key={idx}
                  className="p-8 text-center hover-elevate transition-all"
                  data-testid={`card-education-${idx}`}
                >
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
                    {edu.title}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                    {edu.description}
                  </p>
                  <Link href={edu.link}>
                    <Button 
                      className={idx === 2 ? "bg-primary text-primary-foreground" : ""}
                      variant={idx === 2 ? "default" : "outline"}
                      data-testid={`button-education-${idx}`}
                    >
                      {edu.action}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial Section - Enhanced 5-Testimonial Grid */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Background Image with Strong Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={washerDrumsImg} 
            alt="Satisfied laundromat customer smiling while loading washing machine - positive customer experience in modern self-service laundry facility demonstrating quality service"
            className="w-full h-full object-cover opacity-20"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <Users className="w-3 h-3 mr-1" />
              Customer Success Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 uppercase tracking-tight">
              Real Results From Real Owners
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Join thousands of laundromat owners who transformed their businesses with WashBizHub
            </p>
          </div>

          {/* 5-Testimonial Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { name: "Larry L.", location: "Dallas, TX", text: "Nick's CLEANBI saved me $180K on a bad deal. The valuation showed issues the seller never disclosed.", stars: 5 },
              { name: "Sarah M.", location: "Phoenix, AZ", text: "Made $127K profit in Year 1 using his templates. The ROI calculator was spot-on accurate.", stars: 5 },
              { name: "Mike T.", location: "Miami, FL", text: "Sold my store for 6.2x SDE thanks to the vault. Best investment I ever made.", stars: 5 },
            ].map((testimonial, idx) => (
              <Card 
                key={idx} 
                className="bg-white/10 backdrop-blur-lg border-primary/30 p-8 text-center hover-elevate"
                data-testid={`testimonial-card-${idx}`}
              >
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, j) => (
                    <span key={j} className="text-2xl text-primary">★</span>
                  ))}
                </div>
                <p className="text-lg text-white mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="text-xl font-bold text-primary">{testimonial.name}</p>
                  <p className="text-sm text-white/60">{testimonial.location}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Featured Testimonial */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <blockquote>
              <p className="text-2xl sm:text-3xl font-bold text-white mb-6 italic">
                "WashBizHub transformed how we run our 3 locations. The IoT monitoring caught a bearing 
                failure before it destroyed a $4,000 machine. The platform paid for itself in one month."
              </p>
              <footer className="flex items-center justify-center gap-4">
                <div className="text-left">
                  <div className="text-lg font-semibold text-white">Maria Gonzalez</div>
                  <div className="text-sm text-white/60">Owner, Clean Spin Laundromats • Chicago, IL</div>
                </div>
              </footer>
            </blockquote>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-4 gap-8 pt-12 border-t border-white/10">
            {[
              { value: stats?.blogPosts ? `${stats.blogPosts}+` : "90+", label: "SEO Blog Posts" },
              { value: "72,000+", label: "Industry Members" },
              { value: "40%", label: "Downtime Reduction" },
              { value: "$1.2M+", label: "Saved in Repairs" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center" data-testid={`stat-${idx}`}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-white/70 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 
            className="text-3xl font-bold uppercase tracking-tight text-foreground mb-6"
            data-testid="text-cta-heading"
          >
            Ready To Build A Stronger Laundry Business?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/templates">
              <Button 
                size="lg"
                variant="outline"
                className="hover-elevate active-elevate-2"
                data-testid="button-cta-templates"
              >
                Get Free Templates
              </Button>
            </Link>
            <Link href="/consultation">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                data-testid="button-cta-consultation"
              >
                Book a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
