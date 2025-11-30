import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { 
  Lightbulb, Target, Settings, Users, ArrowRight, 
  Sparkles, MapPin, TrendingUp, Shield, Zap,
  CheckCircle, Star
} from "lucide-react";

const journeyPaths = [
  {
    id: "plan",
    icon: Lightbulb,
    headline: "Thinking About It?",
    description: "Learn if owning a laundromat is right for you",
    features: ["ROI Calculator", "Funding Options", "Industry Guides"],
    link: "/startup-funding",
    color: "blue"
  },
  {
    id: "evaluate",
    icon: Target,
    headline: "Ready to Buy?",
    description: "Find and analyze laundromat opportunities",
    features: ["Marketplace Listings", "CLEANBI Scoring", "Valuations"],
    link: "/listings",
    color: "green"
  },
  {
    id: "operate",
    icon: Settings,
    headline: "Already Own One?",
    description: "Optimize operations and grow revenue",
    features: ["POS System", "AI Diagnostics", "Design Studio"],
    link: "/pos-command-center",
    color: "orange"
  },
  {
    id: "partner",
    icon: Users,
    headline: "Industry Partner?",
    description: "Connect with laundromat owners",
    features: ["List Products", "Advertise", "Affiliates"],
    link: "/directory",
    color: "purple"
  }
];

const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  blue: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" },
  green: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" },
  orange: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500", hover: "hover:border-amber-500/40" },
  purple: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" }
};

const stats = [
  { value: "72,000+", label: "Industry Professionals" },
  { value: "220+", label: "Countries Covered" },
  { value: "50+", label: "Business Tools" },
  { value: "4.9", label: "User Rating", icon: Star }
];

export default function Home() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": ["The Laundromat Bible", "The #1 Laundromat Resource Hub", "CLEANBI"],
    "url": baseUrl,
    "description": "The #1 laundromat resource and educational hub with CLEANBI scoring, marketplace, AI consulting, and professional tools.",
    "potentialAction": [
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
    "url": baseUrl,
    "description": "The #1 laundromat resource hub serving 72,000+ industry professionals worldwide.",
    "foundingDate": "2024",
    "sameAs": ["https://www.facebook.com/washbizhub1"]
  };

  const structuredData = [websiteSchema, organizationSchema];
  
  return (
    <>
      <SEO
        title="WashBizHub - The #1 Laundromat Resource Hub"
        description="Professional laundromat platform with CLEANBI scoring, marketplace, AI consulting, POS systems, and 50+ business tools. Serving 72,000+ industry professionals worldwide."
        canonicalUrl="/"
        keywords={[
          "laundromat management software",
          "laundromat marketplace",
          "CLEANBI business scoring",
          "laundromat investment calculator",
          "coin laundry business"
        ]}
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-background">
        {/* 1. HERO - Primary value prop + CLEANBI demo */}
        <Hero />
        
        {/* 2. TRUST PROOF - Compact social proof bar */}
        <section className="py-8 border-b border-border/50 bg-muted/30" data-testid="section-trust-proof">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center" data-testid={`stat-${idx}`}>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl md:text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                    {stat.icon && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. CHOOSE YOUR PATH - Route visitors to deeper pages */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/20" data-testid="section-choose-path">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Get Started
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-choose-path-heading">
                Where Are You On Your Journey?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select your path to access tailored tools and resources
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {journeyPaths.map((path) => {
                const Icon = path.icon;
                const colors = colorClasses[path.color];
                return (
                  <Link key={path.id} href={path.link}>
                    <Card 
                      className={`p-6 h-full border-2 ${colors.border} ${colors.hover} hover-elevate transition-all cursor-pointer group bg-card`}
                      data-testid={`card-path-${path.id}`}
                    >
                      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2" data-testid={`text-path-title-${path.id}`}>
                        {path.headline}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {path.description}
                      </p>
                      <ul className="space-y-2 mb-5">
                        {path.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className={`flex items-center ${colors.text} text-sm font-semibold group-hover:translate-x-1 transition-transform`}>
                        Explore
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. SINGLE SPOTLIGHT CTA - CLEANBI + Platform value */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-muted/20 to-background border-t border-border/50" data-testid="section-spotlight-cta">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Powered by Google Maps API
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Score Any Location Instantly
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              CLEANBI analyzes demographics, competition, traffic, and market potential for any address worldwide. 
              Free basic scores, premium reports from $97.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/cleanbi-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 font-semibold" data-testid="button-try-cleanbi">
                  <Zap className="w-5 h-5 mr-2" />
                  Try CLEANBI Free
                </Button>
              </Link>
              <Link href="/cleanbi-explorer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" data-testid="button-explore-map">
                  <MapPin className="w-5 h-5 mr-2" />
                  Open Map Explorer
                </Button>
              </Link>
            </div>

            {/* Key benefits */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Data-Driven Decisions</span>
                <span className="text-xs text-muted-foreground">Real market intelligence</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Reduce Risk</span>
                <span className="text-xs text-muted-foreground">Before you invest</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm font-medium text-foreground">AI-Powered</span>
                <span className="text-xs text-muted-foreground">Smart recommendations</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SIMPLE FOOTER CTA */}
        <section className="py-16 bg-primary text-primary-foreground" data-testid="section-footer-cta">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Make Smarter Decisions?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join 72,000+ laundromat professionals using WashBizHub to grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscribe">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 font-semibold" data-testid="button-get-started">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/larry-larsen">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-talk-expert">
                  Talk to an Expert
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
