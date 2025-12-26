import { useState, useEffect, memo, lazy, Suspense } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AutoSEO } from "@/components/AutoSEO";
import { FastHero } from "@/components/FastHero";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowRight, CheckCircle, Star, Users, Settings, MapPin, 
  Calculator, Wrench, FileText, TrendingUp, BarChart3, DollarSign
} from "lucide-react";

const LazyIndustryBenchmarks = lazy(() => import("@/components/IndustryBenchmarks").then(mod => ({ default: mod.IndustryBenchmarks })));
const LazyFAQSection = lazy(() => import("@/components/SuperSEOWrapper").then(mod => ({ default: mod.FAQSection })));

const trustStats = [
  { id: "professionals", value: "73,000+", label: "Professionals", icon: Users },
  { id: "tools", value: "50+", label: "Expert Tools", icon: Settings },
  { id: "states", value: "All 50", label: "States Covered", icon: MapPin }
];

const featuredTools = [
  {
    id: "cleanbi",
    title: "CLEANBI Location Score",
    description: "AI-powered location analysis with 17-factor scoring algorithm",
    icon: MapPin,
    href: "/cleanbi-explorer",
    highlight: "Free to Start",
    stats: "50M+ locations analyzed"
  },
  {
    id: "calculators",
    title: "Business Calculators",
    description: "ROI, valuation, utility costs, and 50+ industry calculators",
    icon: Calculator,
    href: "/calculators",
    highlight: "Most Popular",
    stats: "15K+ calculations/month"
  },
  {
    id: "service-guy",
    title: "Service Guy AI",
    description: "AI-powered equipment diagnostics and troubleshooting",
    icon: Wrench,
    href: "/service-guy-ai",
    highlight: "New",
    stats: "500+ issues resolved"
  },
  {
    id: "templates",
    title: "Business Templates",
    description: "Business plans, checklists, and operational templates",
    icon: FileText,
    href: "/templates",
    highlight: "Pro Feature",
    stats: "200+ templates"
  }
];

const testimonials = [
  {
    id: "testimonial-mike",
    quote: "CLEANBI saved me from a $180K mistake. The location I was about to buy scored a 42 - turns out there were 6 competitors within 2 miles I didn't know about.",
    name: "Mike R.",
    role: "First-Time Buyer",
    location: "Dallas, TX",
    highlight: "$180K saved",
    initials: "MR"
  },
  {
    id: "testimonial-sarah",
    quote: "I've bought 3 laundromats using WashBizHub. The scoring system is scary accurate - my highest scoring location is now my best performer.",
    name: "Sarah L.",
    role: "Multi-Location Operator",
    location: "Phoenix, AZ", 
    highlight: "3 locations",
    initials: "SL"
  },
  {
    id: "testimonial-james",
    quote: "As a broker, I use CLEANBI for every listing. It gives my buyers confidence and speeds up deals. Worth every penny of the Pro subscription.",
    name: "James T.",
    role: "Equipment Broker",
    location: "Atlanta, GA",
    highlight: "12 deals closed",
    initials: "JT"
  }
];

const homepageFaqs = [
  { question: "What is CLEANBI?", answer: "CLEANBI is our proprietary location intelligence algorithm that analyzes 17+ factors including demographics, competition density, foot traffic, and market potential to give any address a 0-100 investment score." },
  { question: "Is WashBizHub free to use?", answer: "Yes! You can start with 3 free CLEANBI location analyses and access to basic calculators. Paid plans unlock unlimited analyses and advanced features." },
  { question: "Who uses WashBizHub?", answer: "Over 73,000 laundromat professionals including first-time buyers, multi-location operators, equipment brokers, and industry vendors across all 50 states." },
  { question: "How accurate is the CLEANBI score?", answer: "CLEANBI has been validated against thousands of actual laundromat performance metrics. Users report 85%+ accuracy in predicting location viability." }
];

const TrustIndicators = memo(function TrustIndicators() {
  return (
    <section className="py-10 bg-muted/30 border-b border-border" data-testid="section-trust-indicators">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12" data-testid="trust-stats-row">
          {trustStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.id}
                className="flex items-center gap-3 px-4 py-2"
                data-testid={`trust-stat-${stat.id}`}
              >
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-[#C8A661]" data-testid={`stat-value-${stat.id}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

const FeaturedToolsGrid = memo(function FeaturedToolsGrid() {
  return (
    <section className="py-16 md:py-20 bg-background" data-testid="section-featured-tools">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-featured-tools">
            <Settings className="w-3 h-3 mr-1.5" />
            Expert Tools
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" data-testid="heading-featured-tools">
            Everything You Need in One Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-featured-tools-desc">
            From location analysis to business planning - tools built by industry veterans
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6" data-testid="tools-grid">
          {featuredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} href={tool.href}>
                <Card 
                  className="bg-card border shadow-sm overflow-hidden hover-elevate cursor-pointer h-full"
                  data-testid={`card-tool-${tool.id}`}
                >
                  <div className="h-1 bg-[#C8A661]" />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-[#C8A661]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-foreground" data-testid={`title-tool-${tool.id}`}>
                            {tool.title}
                          </h3>
                          <Badge 
                            className="bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/20 text-xs"
                            data-testid={`badge-tool-${tool.id}`}
                          >
                            {tool.highlight}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid={`desc-tool-${tool.id}`}>
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{tool.stats}</span>
                      <span className="text-sm text-[#C8A661] font-medium flex items-center gap-1">
                        Explore <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/products">
            <Button 
              variant="outline" 
              className="border-[#0A1628] text-[#0A1628]"
              data-testid="button-view-all-tools"
            >
              View All 50+ Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

const TestimonialsSection = memo(function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20 bg-muted/30 border-t border-b border-border" data-testid="section-testimonials">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-testimonials">
            <Star className="w-3 h-3 mr-1.5" />
            Trusted by Industry Leaders
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" data-testid="heading-testimonials">
            Real Results from Real Investors
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-testimonials-desc">
            Join 73,000+ laundromat professionals who trust WashBizHub for data-driven decisions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6" data-testid="testimonials-grid">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id}
              className="bg-card border shadow-sm overflow-hidden"
              data-testid={`card-${testimonial.id}`}
            >
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3" data-testid={`rating-${testimonial.id}`}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <Badge 
                  className="mb-3 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/20"
                  data-testid={`highlight-${testimonial.id}`}
                >
                  {testimonial.highlight}
                </Badge>
                
                <p 
                  className="text-muted-foreground mb-4 leading-relaxed"
                  data-testid={`quote-${testimonial.id}`}
                >
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Avatar className="h-10 w-10" data-testid={`avatar-${testimonial.id}`}>
                    <AvatarFallback className="bg-[#0A1628] text-[#C8A661] font-semibold text-sm">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-foreground" data-testid={`name-${testimonial.id}`}>
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`role-${testimonial.id}`}>
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

const FinalCTASection = memo(function FinalCTASection() {
  return (
    <section className="py-20 bg-[#0A1628]" data-testid="section-final-cta">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="heading-final-cta">
          Ready to Make Data-Driven Decisions?
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8" data-testid="text-final-cta">
          Join 73,000+ laundromat professionals. Start with a free location analysis today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/cleanbi-explorer">
            <Button 
              size="lg"
              className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-bold px-8"
              data-testid="button-final-cta-primary"
            >
              Try CLEANBI Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button 
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8"
              data-testid="button-final-cta-secondary"
            >
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="text-gray-400 text-sm mt-6" data-testid="text-final-cta-note">
          No credit card required. 3 free analyses included.
        </p>
      </div>
    </section>
  );
});

const LoadingFallback = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="h-8 w-8 border-2 border-[#C8A661] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 50);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="home-loading">
        <div className="h-10 w-10 border-2 border-[#C8A661] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";
  const currentYear = new Date().getFullYear();
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": ["The #1 Laundromat Resource Hub", "CLEANBI Location Intelligence"],
    "url": baseUrl,
    "description": "The laundromat industry's complete expert platform. Learn, start, operate, and expand with human-verified intelligence. 73,000+ professionals, 50+ expert tools.",
    "inLanguage": "en-US",
    "copyrightYear": currentYear,
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${baseUrl}/cleanbi-explorer?address={search_term_string}` },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "description": "The laundromat industry's complete expert platform with 50+ expert tools and 73,000+ professionals.",
    "foundingDate": "2024",
    "areaServed": { "@type": "Place", "name": "United States" },
    "sameAs": [
      "https://www.facebook.com/washbizhub1",
      "https://twitter.com/washbizhub",
      "https://www.linkedin.com/company/washbizhub"
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CLEANBI Location Intelligence",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "description": "AI-powered laundromat location analysis and scoring system. Analyze any address for laundromat business potential using our proprietary 17-factor algorithm.",
    "url": `${baseUrl}/cleanbi-explorer`,
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "699",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <AutoSEO 
        title="WashBizHub - #1 Laundromat Intelligence Platform | CLEANBI Location Score"
        description="The laundromat industry's complete expert platform. Score any location in 60 seconds with CLEANBI. 73,000+ professionals, 50+ expert tools. Free to start."
        keywords="laundromat for sale, buy a laundromat, laundromat business, laundromat valuation, CLEANBI, laundromat investment, laundromat ROI"
        canonical={baseUrl}
        schema={[websiteSchema, organizationSchema, softwareSchema]}
      />
      
      <main className="min-h-screen bg-background" data-testid="home-page">
        <FastHero />
        
        <TrustIndicators />
        
        <FeaturedToolsGrid />
        
        <Suspense fallback={<LoadingFallback />}>
          <section className="py-16 md:py-20 bg-background" data-testid="section-industry-benchmarks">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-benchmarks">
                  <BarChart3 className="w-3 h-3 mr-1.5" />
                  Industry Data
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" data-testid="heading-benchmarks">
                  Industry Benchmarks
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-benchmarks-desc">
                  Real performance data from thousands of laundromats nationwide
                </p>
              </div>
              <LazyIndustryBenchmarks />
            </div>
          </section>
        </Suspense>
        
        <TestimonialsSection />
        
        <Suspense fallback={<LoadingFallback />}>
          <section className="py-16 md:py-20 bg-background" data-testid="section-faqs">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
              <LazyFAQSection faqs={homepageFaqs} />
            </div>
          </section>
        </Suspense>
        
        <FinalCTASection />
      </main>
    </>
  );
}
