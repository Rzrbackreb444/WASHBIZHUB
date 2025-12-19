import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle2,
  Calculator,
  Briefcase,
  Target,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SellPage() {
  const sellerTools = [
    {
      icon: Calculator,
      title: "Valuation Calculator",
      description: "Get an instant estimate of your laundromat's value based on real market data and SDE multiples.",
      link: "/calculators",
      cta: "Value My Business"
    },
    {
      icon: FileText,
      title: "Listing Preparation",
      description: "Templates for financials, operations summary, and marketing materials buyers want to see.",
      link: "/template-vault",
      cta: "Get Templates"
    },
    {
      icon: Users,
      title: "Broker Directory",
      description: "Connect with verified brokers who specialize in laundromat sales in your market.",
      link: "/directory?category=brokers",
      cta: "Find Brokers"
    },
    {
      icon: Target,
      title: "List on Marketplace",
      description: "Reach qualified buyers actively searching for laundromats. CLEANBI-scored listings get more views.",
      link: "/sell-laundromat",
      cta: "List My Business"
    }
  ];

  const benefits = [
    "Reach 73,000+ qualified buyers and investors",
    "CLEANBI score adds credibility to your listing",
    "Pre-qualified buyers through our funding wizard",
    "Verified broker network to assist with deals",
    "Professional templates for seller packages",
    "Valuation tools to price competitively"
  ];

  const stats = [
    { value: "73,000+", label: "Potential Buyers" },
    { value: "$25M+", label: "Deals Funded" },
    { value: "45", label: "Avg Days to Offer" },
    { value: "500+", label: "Active Listings" }
  ];

  return (
    <>
      <Helmet>
        <title>Sell Your Laundromat | Get Top Value | WashBizHub</title>
        <meta 
          name="description" 
          content="Sell your laundromat for top dollar. Free valuation tools, professional templates, verified broker directory, and access to 73,000+ qualified buyers." 
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
                className="mb-6 border-[#3B82F6]/40 text-[#3B82F6] bg-[#3B82F6]/10"
              >
                <DollarSign className="w-3 h-3 mr-1.5" />
                For Sellers & Brokers
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Sell Your Laundromat
                <span className="block text-[#3B82F6]">For Maximum Value</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Free valuation tools, professional seller templates, and access to 
                73,000+ qualified buyers ready to make offers.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/calculators">
                  <Button 
                    size="lg"
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold"
                    data-testid="button-value-business"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Value My Business
                  </Button>
                </Link>
                <Link href="/sell-laundromat">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    data-testid="button-list-business"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    List My Business
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
                  <div className="text-2xl font-bold text-[#3B82F6]">{stat.value}</div>
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
                  <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Seller Tools */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#3B82F6]/40 text-[#3B82F6]">
                <Briefcase className="w-3 h-3 mr-1.5" />
                Seller Toolkit
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Everything You Need to Sell Successfully
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional tools and resources to maximize your sale price and close faster.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sellerTools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm overflow-hidden h-full hover-elevate">
                    <div className="h-1 bg-[#3B82F6]" />
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                          <tool.icon className="w-6 h-6 text-[#3B82F6]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2">{tool.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>
                          <Link href={tool.link}>
                            <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                              {tool.cta}
                              <ArrowRight className="w-3 h-3 ml-1.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
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
            <Award className="w-12 h-12 text-[#3B82F6] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Sell?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start with a free valuation or connect with a verified broker in your market.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/calculators">
                <Button size="lg" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold">
                  <Calculator className="w-4 h-4 mr-2" />
                  Free Valuation
                </Button>
              </Link>
              <Link href="/directory?category=brokers">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Users className="w-4 h-4 mr-2" />
                  Find a Broker
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
