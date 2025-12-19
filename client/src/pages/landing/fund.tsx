import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  DollarSign, 
  Building2, 
  Wrench, 
  TrendingUp, 
  FileText, 
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FundPage() {
  const fundingTypes = [
    {
      icon: Building2,
      title: "SBA Loans",
      description: "7(a) and 504 loans for acquisitions and construction. Lower down payments, longer terms.",
      link: "/sba-loans",
      cta: "Learn More"
    },
    {
      icon: Wrench,
      title: "Equipment Financing",
      description: "Finance new or used equipment. Quick approval, equipment as collateral.",
      link: "/funding-wizard",
      cta: "Get Matched"
    },
    {
      icon: TrendingUp,
      title: "Working Capital",
      description: "Short-term funding for operations, marketing, or unexpected expenses.",
      link: "/funding-wizard",
      cta: "Apply Now"
    },
    {
      icon: DollarSign,
      title: "Acquisition Financing",
      description: "Buy an existing laundromat with competitive rates and flexible terms.",
      link: "/acquisitions-funding",
      cta: "Explore Options"
    }
  ];

  const partners = [
    { name: "Preferred Funding Group", specialty: "SBA Loans" },
    { name: "GoKapital", specialty: "Equipment" },
    { name: "South End Capital", specialty: "Acquisitions" },
    { name: "ROK Financial", specialty: "Working Capital" },
    { name: "AAdvantage Laundry", specialty: "Equipment Packages" },
    { name: "National Business Capital", specialty: "All Types" },
    { name: "David Allen Capital", specialty: "Fast Funding" }
  ];

  const stats = [
    { value: "$25M+", label: "Funding Matched" },
    { value: "7", label: "Pre-Vetted Partners" },
    { value: "48hrs", label: "Avg Response Time" },
    { value: "85%+", label: "Approval Rate" }
  ];

  const benefits = [
    "Pre-vetted lenders who understand laundromats",
    "One application, multiple offers",
    "SBA specialists for lower rates",
    "Equipment financing with quick approval",
    "Working capital in as fast as 24 hours",
    "Free SBA readiness assessment"
  ];

  return (
    <>
      <Helmet>
        <title>Laundromat Financing | SBA Loans, Equipment & Working Capital | WashBizHub</title>
        <meta 
          name="description" 
          content="Get funding for your laundromat. SBA loans, equipment financing, working capital. Pre-vetted lenders, $25M+ matched. Get matched in 60 seconds." 
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
                <DollarSign className="w-3 h-3 mr-1.5" />
                Financing Hub
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Get Funding for
                <span className="block text-[#C8A661]">Your Laundromat</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Pre-vetted lenders who specialize in laundromats. SBA loans, equipment financing, 
                and working capital — get matched in 60 seconds.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/funding-wizard">
                  <Button 
                    size="lg"
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                    data-testid="button-get-matched"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Get Matched in 60 Seconds
                  </Button>
                </Link>
                <Link href="/sba-readiness">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    data-testid="button-sba-check"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Free SBA Readiness Check
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

        {/* Funding Types */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <TrendingUp className="w-3 h-3 mr-1.5" />
                Funding Options
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                The Right Funding for Your Needs
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Whether you're buying, building, or growing — we have lending partners for every situation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {fundingTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm overflow-hidden h-full hover-elevate">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                          <type.icon className="w-6 h-6 text-[#C8A661]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2">{type.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                          <Link href={type.link}>
                            <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                              {type.cta}
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

        {/* Lending Partners */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Shield className="w-3 h-3 mr-1.5" />
                Pre-Vetted Partners
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Trusted Lending Partners
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every lender in our network has been vetted for laundromat expertise and fair terms.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm h-full">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm font-semibold text-foreground mb-1">{partner.name}</div>
                      <div className="text-xs text-muted-foreground">{partner.specialty}</div>
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
              Get Matched in 60 Seconds
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Answer a few questions and get matched with lenders who fit your needs. No obligation.
            </p>
            <Link href="/funding-wizard">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                Start Funding Wizard
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
