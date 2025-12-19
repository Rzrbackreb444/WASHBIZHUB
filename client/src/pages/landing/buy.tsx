import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Search, 
  MapPin, 
  Calculator, 
  DollarSign, 
  FileCheck, 
  Users,
  ArrowRight,
  CheckCircle2,
  Target,
  TrendingUp,
  Building2,
  Briefcase
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BuyPage() {
  const buyerTools = [
    {
      icon: MapPin,
      title: "CLEANBI Location Analysis",
      description: "AI-powered scoring of any address for laundromat viability. Demographics, competition, foot traffic.",
      link: "/cleanbi-explorer",
      cta: "Analyze Location",
      highlight: true
    },
    {
      icon: Search,
      title: "Laundromat Marketplace",
      description: "Browse verified listings with CLEANBI scores, financials, and detailed due diligence info.",
      link: "/marketplace",
      cta: "Browse Listings"
    },
    {
      icon: DollarSign,
      title: "Funding Wizard",
      description: "Get matched with pre-vetted lenders in 60 seconds. SBA, equipment financing, working capital.",
      link: "/funding-wizard",
      cta: "Find Funding"
    },
    {
      icon: Calculator,
      title: "Deal Calculators",
      description: "Valuation, ROI, cash flow, debt service coverage. Make data-driven offers.",
      link: "/calculators",
      cta: "Run Numbers"
    },
    {
      icon: FileCheck,
      title: "Due Diligence Toolkit",
      description: "Checklists, red flag alerts, and expert guides to avoid costly mistakes.",
      link: "/template-vault",
      cta: "Get Checklists"
    },
    {
      icon: Users,
      title: "Broker Directory",
      description: "Connect with verified laundromat brokers who specialize in your target market.",
      link: "/directory?category=brokers",
      cta: "Find Brokers"
    }
  ];

  const stats = [
    { value: "$25M+", label: "Funding Matched" },
    { value: "50,000+", label: "Locations Analyzed" },
    { value: "7", label: "Pre-Vetted Lenders" },
    { value: "500+", label: "Active Listings" }
  ];

  const steps = [
    { step: "1", title: "Analyze Locations", description: "Use CLEANBI to score potential markets" },
    { step: "2", title: "Find Deals", description: "Browse marketplace or connect with brokers" },
    { step: "3", title: "Run Numbers", description: "Validate financials with our calculators" },
    { step: "4", title: "Secure Funding", description: "Get matched with the right lender" },
    { step: "5", title: "Close the Deal", description: "Use our checklists for due diligence" }
  ];

  return (
    <>
      <Helmet>
        <title>Buy a Laundromat | Find, Analyze & Fund Your Deal | WashBizHub</title>
        <meta 
          name="description" 
          content="Buy a laundromat with confidence. AI-powered location analysis, verified marketplace listings, funding wizard, and due diligence tools. Join 73,000+ investors." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-[#0A1628] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#1e3a5f] to-[#0A1628] opacity-80" />
          
          <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge 
                variant="outline" 
                className="mb-6 border-[#22C55E]/40 text-[#22C55E] bg-[#22C55E]/10"
              >
                <Target className="w-3 h-3 mr-1.5" />
                For Buyers & Investors
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Find Your Perfect
                <span className="block text-[#22C55E]">Laundromat Investment</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                AI-powered location analysis, verified listings, instant funding matches, 
                and professional tools to help you buy with confidence.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/cleanbi-explorer">
                  <Button 
                    size="lg"
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold"
                    data-testid="button-analyze-location"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Analyze a Location
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    data-testid="button-browse-listings"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse Listings
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-[#22C55E]">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Buyer Journey Steps */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {steps.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#22C55E] text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{step.title}</div>
                      <div className="text-[10px] text-muted-foreground hidden md:block">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-1 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buyer Tools */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#22C55E]/40 text-[#22C55E]">
                <Briefcase className="w-3 h-3 mr-1.5" />
                Buyer Toolkit
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Everything You Need to Buy Smart
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional tools used by serious investors to find, analyze, and close laundromat deals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyerTools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className={`bg-card border shadow-sm overflow-hidden h-full hover-elevate ${tool.highlight ? 'ring-2 ring-[#22C55E]/50' : ''}`}>
                    <div className={`h-1 ${tool.highlight ? 'bg-[#22C55E]' : 'bg-[#C8A661]'}`} />
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-4">
                        <tool.icon className={`w-5 h-5 ${tool.highlight ? 'text-[#22C55E]' : 'text-[#C8A661]'}`} />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{tool.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>
                      <Link href={tool.link}>
                        <Button size="sm" variant={tool.highlight ? "default" : "outline"} className={tool.highlight ? "bg-[#22C55E] hover:bg-[#16A34A]" : ""}>
                          {tool.cta}
                          <ArrowRight className="w-3 h-3 ml-1.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#0A1628]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <TrendingUp className="w-12 h-12 text-[#22C55E] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Deal?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start with a free location analysis or browse our marketplace of verified listings.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/cleanbi-explorer">
                <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold">
                  <MapPin className="w-4 h-4 mr-2" />
                  Analyze Location Free
                </Button>
              </Link>
              <Link href="/funding-wizard">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Get Funding Matches
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
