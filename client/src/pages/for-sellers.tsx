import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Calculator, DollarSign, FileText, Users,
  ArrowRight, CheckCircle, Handshake, TrendingUp,
  Building, Shield, Sparkles, BarChart3
} from "lucide-react";

const sellerTools = [
  {
    icon: Calculator,
    title: "Business Valuation Calculator",
    description: "Get an accurate valuation using SDE multiples, revenue, and market comps.",
    features: ["SDE-based valuation", "Market comparables", "Instant estimate", "PDF reports"],
    link: "/valuation-calculator",
    cta: "Get Valuation",
    highlight: true
  },
  {
    icon: FileText,
    title: "Exit Preparation Checklist",
    description: "Everything you need to maximize your sale price and attract buyers.",
    features: ["Pre-sale improvements", "Documentation prep", "Financial cleanup", "Due diligence ready"],
    link: "/template-vault",
    cta: "Get Checklist"
  },
  {
    icon: Users,
    title: "Broker Directory",
    description: "Connect with verified laundromat brokers across all 50 states.",
    features: ["Verified brokers", "Commission rates", "Specializations", "Direct contact"],
    link: "/directory",
    cta: "Find Brokers"
  },
  {
    icon: Building,
    title: "List Your Laundromat",
    description: "List on the WashBizHub marketplace - reach serious buyers directly.",
    features: ["73K+ professionals", "CLEANBI integration", "Lead tracking", "Premium visibility"],
    link: "/list-your-laundromat",
    cta: "List Now"
  },
  {
    icon: DollarSign,
    title: "Buyer Financing Partners",
    description: "Pre-qualified lenders ready to fund your buyer's acquisition.",
    features: ["SBA-approved lenders", "Equipment financing", "Fast approvals", "Buyer assistance"],
    link: "/startup-funding",
    cta: "View Partners"
  },
  {
    icon: Handshake,
    title: "Talk to Larry Larsen",
    description: "50+ years experience. Expert guidance on maximizing your exit.",
    features: ["Exit strategy review", "Pricing guidance", "Deal structure", "Negotiation tips"],
    link: "/consultation",
    cta: "Book Consultation"
  }
];

const testimonials = [
  {
    quote: "Listed my laundromat on WashBizHub and had 5 qualified buyers within 2 weeks.",
    name: "James P.",
    location: "Atlanta, GA"
  },
  {
    quote: "The valuation calculator helped me price it right. Sold for 15% more than I expected.",
    name: "Maria S.",
    location: "Denver, CO"
  }
];

export default function ForSellers() {
  return (
    <>
      <SEO
        title="For Sellers & Brokers | WashBizHub"
        description="Sell your laundromat for maximum value. Business valuation tools, exit preparation checklists, verified broker directory, and marketplace listings."
      />
      
      <div className="min-h-screen bg-background">
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#0A1628] to-[#1a3a5c]" data-testid="section-seller-hero">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30" data-testid="badge-seller-persona">
                <Handshake className="w-3 h-3 mr-1" />
                For Sellers & Brokers
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-seller-headline">
                Sell Your Laundromat for Maximum Value
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8" data-testid="text-seller-subheadline">
                Accurate valuations, qualified buyers, and expert exit guidance - all in one place.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/valuation-calculator">
                  <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold" data-testid="button-seller-cta-primary">
                    <Calculator className="w-4 h-4 mr-2" />
                    Get Free Valuation
                  </Button>
                </Link>
                <Link href="/list-your-laundromat">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-seller-cta-secondary">
                    List Your Business
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center" data-testid="seller-stats">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">3-5x</div>
                <div className="text-sm text-gray-400">SDE Multiples</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">73K+</div>
                <div className="text-sm text-gray-400">Active Buyers</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">94%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">30+</div>
                <div className="text-sm text-gray-400">Verified Brokers</div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-20" data-testid="section-seller-tools">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3" data-testid="text-tools-heading">
                Your Seller Toolkit
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to prepare, price, and sell your laundromat
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerTools.map((tool) => {
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
        
        <section className="py-16 bg-muted/30" data-testid="section-seller-testimonials">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">What Sellers Are Saying</h2>
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
        
        <section className="py-16 bg-[#0A1628]" data-testid="section-seller-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Sell?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start with a free valuation or list directly on our marketplace
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/valuation-calculator">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold" data-testid="button-seller-final-cta">
                  Get Free Valuation
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
