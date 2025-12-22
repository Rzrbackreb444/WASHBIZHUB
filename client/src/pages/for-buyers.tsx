import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  MapPin, Calculator, DollarSign, FileText, 
  ArrowRight, CheckCircle, Target, TrendingUp,
  Users, Shield, Sparkles, Search
} from "lucide-react";

const buyerTools = [
  {
    icon: MapPin,
    title: "CLEANBI Location Intelligence",
    description: "AI-powered location scoring for any address. Know if a location will succeed before you invest.",
    features: ["17-factor analysis", "Competition mapping", "Demographics data", "Instant scores"],
    link: "/cleanbi-explorer",
    cta: "Analyze Location",
    highlight: true
  },
  {
    icon: Calculator,
    title: "What-If Simulator",
    description: "Model different scenarios before buying. See how changes impact your ROI.",
    features: ["10-variable modeling", "Revenue projections", "Break-even analysis", "Scenario comparison"],
    link: "/what-if-analysis",
    cta: "Run Simulation"
  },
  {
    icon: Search,
    title: "Laundromat Marketplace",
    description: "Browse verified laundromats for sale across all 50 states with CLEANBI scores.",
    features: ["Real listings", "CLEANBI integrated", "Broker contacts", "Due diligence info"],
    link: "/marketplace",
    cta: "Browse Listings"
  },
  {
    icon: DollarSign,
    title: "Funding Hub",
    description: "Connect with pre-vetted lenders. SBA loans, equipment financing, investor matching.",
    features: ["SBA 7(a) & 504", "Equipment financing", "Up to $750K available", "24-48hr approvals"],
    link: "/startup-funding",
    cta: "Explore Funding"
  },
  {
    icon: FileText,
    title: "Due Diligence Tools",
    description: "Professional checklists and verification tools to avoid costly mistakes.",
    features: ["50+ point checklist", "Lease red flags", "Financial verification", "Expert templates"],
    link: "/template-vault",
    cta: "Get Checklists"
  },
  {
    icon: Users,
    title: "Laundromat Expert AI",
    description: "Your AI consultant for any laundromat question. Location, equipment, deals, funding.",
    features: ["Instant answers", "50+ years knowledge", "Human verified", "Always learning"],
    link: "/laundromat-expert",
    cta: "Ask the Expert"
  }
];

const testimonials = [
  {
    quote: "CLEANBI saved me from a $180K mistake. The location I was about to buy scored a 42.",
    name: "Mike R.",
    location: "Dallas, TX"
  },
  {
    quote: "I've bought 3 laundromats using WashBizHub. The scoring system is scary accurate.",
    name: "Sarah L.",
    location: "Phoenix, AZ"
  }
];

export default function ForBuyers() {
  return (
    <>
      <SEO
        title="For Buyers & Investors | WashBizHub"
        description="Find, analyze, and fund your laundromat investment. CLEANBI location intelligence, What-If simulator, marketplace listings, and funding partners."
      />
      
      <div className="min-h-screen bg-background">
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#0A1628] to-[#1a3a5c]" data-testid="section-buyer-hero">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30" data-testid="badge-buyer-persona">
                <Target className="w-3 h-3 mr-1" />
                For Buyers & Investors
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-buyer-headline">
                Find Your Perfect Laundromat Investment
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8" data-testid="text-buyer-subheadline">
                Analyze any location, browse verified listings, and secure funding - all in one place.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/cleanbi-explorer">
                  <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold" data-testid="button-buyer-cta-primary">
                    <MapPin className="w-4 h-4 mr-2" />
                    Analyze a Location
                  </Button>
                </Link>
                <Link href="/laundromat-listings">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-buyer-cta-secondary">
                    Browse Listings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center" data-testid="buyer-stats">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">17</div>
                <div className="text-sm text-gray-400">Analysis Factors</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">All 50</div>
                <div className="text-sm text-gray-400">States Covered</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">$750K</div>
                <div className="text-sm text-gray-400">Funding Available</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">7+</div>
                <div className="text-sm text-gray-400">Lending Partners</div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-20" data-testid="section-buyer-tools">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3" data-testid="text-tools-heading">
                Your Buyer Toolkit
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to find, analyze, and acquire your laundromat
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyerTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card 
                    key={tool.title} 
                    className={`bg-card border shadow-sm overflow-hidden hover:border-[#C8A661]/50 hover-elevate transition-all ${tool.highlight ? 'ring-2 ring-[#C8A661]/30' : ''}`}
                    data-testid={`card-tool-${tool.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {tool.highlight && <div className="h-1 bg-[#C8A661]" />}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                          <Icon className="h-6 w-6 text-[#C8A661]" />
                        </div>
                        {tool.highlight && (
                          <Badge className="bg-[#C8A661] text-[#0A1628]">Most Popular</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                      <ul className="space-y-1.5 mb-5">
                        {tool.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-3.5 h-3.5 text-[#C8A661] flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link href={tool.link}>
                        <Button className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white">
                          {tool.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-muted/30" data-testid="section-buyer-testimonials">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">What Buyers Are Saying</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i} className="bg-card border" data-testid={`card-testimonial-${i}`}>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground italic mb-4">"{t.quote}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#C8A661]">{t.name[0]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.location}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-[#0A1628]" data-testid="section-buyer-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Find Your Investment?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start with a free CLEANBI analysis or browse our marketplace
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/cleanbi-explorer">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold" data-testid="button-buyer-final-cta">
                  Start Free Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
