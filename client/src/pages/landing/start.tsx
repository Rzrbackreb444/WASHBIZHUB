import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Wrench, 
  FileText, 
  Users,
  ArrowRight,
  CheckCircle2,
  Ruler,
  Truck,
  Calculator,
  Target
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StartPage() {
  const startupTools = [
    {
      icon: MapPin,
      title: "Site Selection with CLEANBI",
      description: "AI-powered location analysis. Score any address for demographics, competition, and foot traffic.",
      link: "/cleanbi-explorer",
      cta: "Analyze Locations",
      highlight: true
    },
    {
      icon: Calculator,
      title: "Startup Cost Calculator",
      description: "Estimate total investment: equipment, build-out, permits, working capital, and more.",
      link: "/calculators",
      cta: "Calculate Costs"
    },
    {
      icon: DollarSign,
      title: "Construction Financing",
      description: "Get matched with lenders who finance new laundromat builds. SBA and equipment packages.",
      link: "/funding-wizard",
      cta: "Find Funding"
    },
    {
      icon: Truck,
      title: "Equipment Partners",
      description: "Connect with authorized distributors for Dexter, Speed Queen, Continental, and more.",
      link: "/directory?category=equipment",
      cta: "Find Distributors"
    },
    {
      icon: FileText,
      title: "Business Plan Generator",
      description: "AI-powered business plans that lenders actually approve. SBA-ready format.",
      link: "/business-plan-generator",
      cta: "Generate Plan"
    },
    {
      icon: Ruler,
      title: "Layout & Design Tools",
      description: "Plan your floor layout, equipment mix, and utility requirements before you build.",
      link: "/layout-studio",
      cta: "Design Layout"
    }
  ];

  const stats = [
    { value: "$150K-$500K", label: "Typical Build Cost" },
    { value: "12-18 mo", label: "Avg Build Timeline" },
    { value: "25-35%", label: "Target ROI" },
    { value: "50,000+", label: "Sites Analyzed" }
  ];

  const buildSteps = [
    { step: "1", title: "Site Selection", description: "Use CLEANBI to find the perfect location" },
    { step: "2", title: "Feasibility", description: "Run numbers with our calculators" },
    { step: "3", title: "Financing", description: "Get approved with our lending partners" },
    { step: "4", title: "Equipment", description: "Select and order from distributors" },
    { step: "5", title: "Build & Launch", description: "Open your doors with confidence" }
  ];

  return (
    <>
      <Helmet>
        <title>Start a Laundromat | Build From Scratch | WashBizHub</title>
        <meta 
          name="description" 
          content="Build a new laundromat from scratch. Site selection tools, startup cost calculators, construction financing, equipment partners, and business plan generator." 
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
                className="mb-6 border-[#C8A661]/40 text-[#C8A661] bg-[#C8A661]/10"
              >
                <Building className="w-3 h-3 mr-1.5" />
                Build From Scratch
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Start a New Laundromat
                <span className="block text-[#C8A661]">From the Ground Up</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Site selection, financing, equipment partners, and business planning tools 
                to build a profitable laundromat from scratch.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/cleanbi-explorer">
                  <Button 
                    size="lg"
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                    data-testid="button-find-location"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Find a Location
                  </Button>
                </Link>
                <Link href="/calculators">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    data-testid="button-calculate-costs"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Costs
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
                  <div className="text-2xl font-bold text-[#C8A661]">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Build Journey Steps */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {buildSteps.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#C8A661] text-[#0A1628] text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{step.title}</div>
                      <div className="text-[10px] text-muted-foreground hidden md:block">{step.description}</div>
                    </div>
                  </div>
                  {index < buildSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-1 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Startup Tools */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Target className="w-3 h-3 mr-1.5" />
                Startup Toolkit
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Everything You Need to Build
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From site selection to grand opening — tools and partners to make your build successful.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startupTools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className={`bg-card border shadow-sm overflow-hidden h-full hover-elevate ${tool.highlight ? 'ring-2 ring-[#C8A661]/50' : ''}`}>
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-4">
                        <tool.icon className="w-5 h-5 text-[#C8A661]" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{tool.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>
                      <Link href={tool.link}>
                        <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
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
            <Building className="w-12 h-12 text-[#C8A661] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start with a free location analysis to find the perfect site for your new laundromat.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/cleanbi-explorer">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold">
                  <MapPin className="w-4 h-4 mr-2" />
                  Analyze Location Free
                </Button>
              </Link>
              <Link href="/funding-wizard">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Explore Financing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
