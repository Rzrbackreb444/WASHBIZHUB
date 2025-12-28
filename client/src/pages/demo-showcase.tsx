import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  MapPin, Calculator, Bot, TrendingUp, Building2, 
  Sparkles, Crown, Zap, Shield, BarChart3, 
  GraduationCap, Users, Globe, Monitor, BookOpen,
  DollarSign, Landmark, Package, Play, ArrowRight,
  CheckCircle2, Star, Clock, Target
} from "lucide-react";
import { HelmetProvider, Helmet } from "react-helmet-async";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

const aiCapabilities = [
  {
    id: "cleanbi",
    title: "CLEANBI Explorer",
    description: "AI-powered location intelligence with 17-factor weighted scoring",
    icon: MapPin,
    color: "from-[#C8A661] to-[#a88c4d]",
    href: "/cleanbi-explorer",
    features: ["Demographics analysis", "Competition mapping", "Traffic patterns", "Market potential"],
    badge: "Most Popular"
  },
  {
    id: "laundromat-expert",
    title: "Laundromat Expert AI",
    description: "50+ years of industry knowledge in your pocket",
    icon: Bot,
    color: "from-blue-500 to-blue-700",
    href: "/laundromat-expert",
    features: ["Deal analysis", "Due diligence", "Negotiations", "Operations advice"],
    badge: "AI Powered"
  },
  {
    id: "service-guy",
    title: "Service Guy AI",
    description: "Equipment diagnostics and repair guidance",
    icon: Zap,
    color: "from-green-500 to-green-700",
    href: "/service-guy-ai",
    features: ["Photo diagnosis", "Parts lookup", "Repair guides", "Cost estimates"],
    badge: "Field Ready"
  },
  {
    id: "calculators",
    title: "Calculator Suite",
    description: "80+ formulas for valuation and financial analysis",
    icon: Calculator,
    color: "from-purple-500 to-purple-700",
    href: "/calculators",
    features: ["4 valuation methods", "ROI projections", "Loan analysis", "Cash flow modeling"],
    badge: "Pro Tools"
  }
];

const platformFeatures = [
  {
    id: "pos",
    title: "POS Command Center",
    description: "Complete point-of-sale system for laundromat operations",
    icon: Monitor,
    href: "/pos-command-center",
    stats: { label: "Transactions", value: "100K+" }
  },
  {
    id: "funding",
    title: "Funding Marketplace",
    description: "Compare lenders and find the best financing options",
    icon: Landmark,
    href: "/funding",
    stats: { label: "Partners", value: "7+" }
  },
  {
    id: "listings",
    title: "Laundromat Marketplace",
    description: "Browse active listings with CLEANBI scores",
    icon: Building2,
    href: "/laundromat-listings",
    stats: { label: "Listings", value: "500+" }
  },
  {
    id: "courses",
    title: "Training Academy",
    description: "Learn from industry experts like Larry Larsen",
    icon: GraduationCap,
    href: "/courses",
    stats: { label: "Hours", value: "40+" }
  },
  {
    id: "templates",
    title: "Template Vault",
    description: "Business plans, checklists, and operational documents",
    icon: BookOpen,
    href: "/template-vault",
    stats: { label: "Templates", value: "25+" }
  },
  {
    id: "forum",
    title: "Community Forum",
    description: "Connect with 73K+ laundromat owners",
    icon: Users,
    href: "/forum",
    stats: { label: "Members", value: "73K+" }
  }
];

const pricingTiers = [
  { name: "Free", price: "$0", features: ["Basic calculators", "Limited searches", "Community access"] },
  { name: "Pro", price: "$29/mo", features: ["All calculators", "Unlimited CLEANBI", "AI consultations", "Template vault"], popular: true },
  { name: "Enterprise", price: "$99/mo", features: ["Everything in Pro", "White-label reports", "Priority support", "API access"] }
];

export default function DemoShowcase() {
  const [activeTab, setActiveTab] = useState("ai");

  return (
    <HelmetProvider>
      <Helmet>
        <title>Platform Demo | WashBizHub - The #1 Laundromat Intelligence Platform</title>
        <meta name="description" content="Explore WashBizHub's AI-powered tools for laundromat buyers, owners, and sellers. CLEANBI location scoring, expert AI consultations, calculators, and more." />
      </Helmet>

      <div className="min-h-screen bg-background" id="main-content">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-[#0A1628] via-[#0f2744] to-background overflow-hidden">
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A661' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <motion.div 
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 hover:bg-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Platform Demo
              </Badge>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                The Complete Laundromat
                <span className="block text-[#C8A661]">Intelligence Platform</span>
              </h1>
              
              <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                AI-powered tools for every stage of your laundromat journey. 
                From finding the perfect location to running profitable operations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cleanbi-explorer">
                  <Button size="lg" className="bg-[#C8A661] hover:bg-[#b8963d] text-[#0A1628] font-semibold gap-2" data-testid="button-try-cleanbi">
                    <MapPin className="w-4 h-4" />
                    Try CLEANBI Explorer
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2" data-testid="button-view-pricing">
                    <Crown className="w-4 h-4" />
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div 
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {[
                { value: "$6.8B+", label: "Industry Size" },
                { value: "73K+", label: "Community Members" },
                { value: "500+", label: "Active Listings" },
                { value: "94%", label: "Survival Rate" }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="ai" className="gap-2" data-testid="tab-ai-tools">
                <Sparkles className="w-4 h-4" />
                AI Tools
              </TabsTrigger>
              <TabsTrigger value="platform" className="gap-2" data-testid="tab-platform">
                <Globe className="w-4 h-4" />
                Platform
              </TabsTrigger>
              <TabsTrigger value="pricing" className="gap-2" data-testid="tab-pricing">
                <DollarSign className="w-4 h-4" />
                Pricing
              </TabsTrigger>
            </TabsList>

            {/* AI Tools Tab */}
            <TabsContent value="ai">
              <motion.div 
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {aiCapabilities.map((tool) => (
                  <motion.div key={tool.id} variants={fadeIn}>
                    <Card className="h-full hover-elevate transition-all duration-300 border-border/50 overflow-hidden group">
                      <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                            <tool.icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {tool.badge}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mt-4">{tool.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-6">
                          {tool.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Link href={tool.href}>
                          <Button className="w-full gap-2 group-hover:bg-[#C8A661] group-hover:text-[#0A1628] transition-colors" variant="outline" data-testid={`button-try-${tool.id}`}>
                            Try Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Platform Tab */}
            <TabsContent value="platform">
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {platformFeatures.map((feature) => (
                  <motion.div key={feature.id} variants={fadeIn}>
                    <Link href={feature.href}>
                      <Card className="h-full hover-elevate cursor-pointer transition-all duration-300 border-border/50 group" data-testid={`card-feature-${feature.id}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                              <feature.icon className="h-5 w-5 text-[#C8A661]" />
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-[#C8A661]">{feature.stats.value}</div>
                              <div className="text-xs text-muted-foreground">{feature.stats.label}</div>
                            </div>
                          </div>
                          <CardTitle className="text-lg group-hover:text-[#C8A661] transition-colors">
                            {feature.title}
                          </CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <motion.div 
                className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {pricingTiers.map((tier) => (
                  <motion.div key={tier.name} variants={fadeIn}>
                    <Card className={`h-full relative ${tier.popular ? 'border-[#C8A661] shadow-lg shadow-[#C8A661]/10' : 'border-border/50'}`}>
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-[#C8A661] text-[#0A1628]">
                            <Star className="w-3 h-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pt-8">
                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">{tier.price}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {tier.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Link href="/pricing">
                          <Button 
                            className={`w-full ${tier.popular ? 'bg-[#C8A661] hover:bg-[#b8963d] text-[#0A1628]' : ''}`}
                            variant={tier.popular ? "default" : "outline"}
                            data-testid={`button-tier-${tier.name.toLowerCase()}`}
                          >
                            Get Started
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </section>

        {/* CTA Section */}
        <section className="bg-[#0A1628] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Laundromat Business?
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of laundromat owners who trust WashBizHub for market intelligence, 
              operational tools, and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#b8963d] text-[#0A1628] font-semibold gap-2" data-testid="button-get-started">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2" data-testid="button-book-consultation">
                  <Users className="w-4 h-4" />
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </HelmetProvider>
  );
}
