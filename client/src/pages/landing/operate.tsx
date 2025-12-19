import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Settings, 
  BarChart3, 
  Calculator, 
  Wrench, 
  DollarSign, 
  Smartphone,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Zap,
  Clock,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OperatePage() {
  const operatorTools = [
    {
      icon: BarChart3,
      title: "Operator Dashboard",
      description: "Real-time KPIs, revenue tracking, machine status, and operational insights in one command center.",
      link: "/operator-dashboard",
      cta: "View Dashboard",
      highlight: true
    },
    {
      icon: Calculator,
      title: "Business Calculators",
      description: "40+ professional calculators for pricing, payroll, equipment ROI, expense tracking, and more.",
      link: "/calculators",
      cta: "Run Calculations"
    },
    {
      icon: Wrench,
      title: "Service Guy AI",
      description: "AI-powered equipment diagnostics. Troubleshoot issues, order parts, and track repair history.",
      link: "/service-guy-ai",
      cta: "Diagnose Equipment"
    },
    {
      icon: DollarSign,
      title: "POS System",
      description: "Complete point-of-sale for wash-dry-fold, transactions, customer management, and reporting.",
      link: "/pos",
      cta: "Open POS"
    },
    {
      icon: Smartphone,
      title: "Machine Booking",
      description: "Let customers reserve machines online. Reduce wait times and increase utilization.",
      link: "/machine-booking",
      cta: "Set Up Booking"
    },
    {
      icon: TrendingUp,
      title: "Growth Tools",
      description: "CLEANBI analysis for expansion, funding options, and market intelligence for your locations.",
      link: "/cleanbi-explorer",
      cta: "Explore Growth"
    }
  ];

  const stats = [
    { value: "40+", label: "Business Calculators" },
    { value: "24/7", label: "AI Diagnostics" },
    { value: "$50K+", label: "Avg Savings/Year" },
    { value: "73,000+", label: "Community Members" }
  ];

  const benefits = [
    "Reduce equipment downtime with predictive maintenance",
    "Optimize pricing with real-time market data",
    "Track every dollar with integrated POS",
    "Grow revenue with machine booking system",
    "Make data-driven decisions with analytics",
    "Access expert community for advice"
  ];

  return (
    <>
      <Helmet>
        <title>Operate Your Laundromat | Management Tools & Dashboard | WashBizHub</title>
        <meta 
          name="description" 
          content="Run your laundromat smarter. Operator dashboard, 40+ calculators, AI diagnostics, POS system, and machine booking. Tools used by 73,000+ professionals." 
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
                <Settings className="w-3 h-3 mr-1.5" />
                For Owners & Operators
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Run Your Laundromat
                <span className="block text-[#C8A661]">Like a Pro</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Command center dashboard, 40+ calculators, AI diagnostics, POS system, 
                and machine booking — everything you need to maximize profits.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/operator-dashboard">
                  <Button 
                    size="lg"
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                    data-testid="button-open-dashboard"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Open Dashboard
                  </Button>
                </Link>
                <Link href="/calculators">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    data-testid="button-try-calculators"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Try Calculators
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

        {/* Benefits Section */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 bg-card border rounded-lg p-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#C8A661] shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Operator Tools */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Zap className="w-3 h-3 mr-1.5" />
                Operator Toolkit
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Everything You Need to Operate Efficiently
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional-grade tools to reduce costs, increase revenue, and run a better business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {operatorTools.map((tool, index) => (
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
            <Clock className="w-12 h-12 text-[#C8A661] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Saving Time & Money Today
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 73,000+ operators who use WashBizHub to run smarter, more profitable businesses.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/operator-dashboard">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Open Dashboard
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
