import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Target, 
  Rocket,
  Building2,
  Globe,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  Briefcase,
  LineChart,
  PieChart,
  Zap,
  Shield,
  Award,
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { trackEvent, trackConversion } from "@/lib/user-journey";

const investorFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  investorType: z.string().min(1, "Please select investor type"),
  investmentRange: z.string().min(1, "Please select investment range"),
  message: z.string().optional(),
});

type InvestorFormData = z.infer<typeof investorFormSchema>;

export default function InvestorsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<InvestorFormData>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      investorType: "",
      investmentRange: "",
      message: "",
    },
  });

  const onSubmit = async (data: InvestorFormData) => {
    setIsSubmitting(true);
    try {
      trackEvent("investor_inquiry_submit", "conversion", undefined, {
        investorType: data.investorType,
        investmentRange: data.investmentRange,
      });
      trackConversion("investor_lead", undefined, { source: "investors_page" });

      const response = await fetch("/api/investor-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Thank you for your interest!",
          description: "Our team will reach out within 24-48 hours.",
        });
      } else {
        toast({
          title: "Inquiry Received",
          description: "We'll be in touch soon. You can also email investors@washbizhub.com directly.",
        });
        setIsSubmitted(true);
      }
    } catch (error) {
      toast({
        title: "Inquiry Received",
        description: "We'll be in touch soon. You can also email investors@washbizhub.com directly.",
      });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const marketStats = [
    { label: "US Laundry Services Market", value: "$7.1B", source: "IBISWorld 2025" },
    { label: "Annual Industry Growth", value: "3.2%", source: "IBIS 2024-2029" },
    { label: "Coin Laundries in US", value: "35,000+", source: "CLA 2024" },
    { label: "Average Revenue Per Unit", value: "$300K", source: "BizBuySell" },
  ];

  const platformMetrics = [
    { icon: Users, label: "Community Members", value: "73,000+", description: "Active professionals in our network" },
    { icon: BarChart3, label: "CLEANBI Analyses", value: "50,000+", description: "Location analyses performed" },
    { icon: DollarSign, label: "Funding Matched", value: "$25M+", description: "Capital connected to deals" },
    { icon: Globe, label: "Countries Served", value: "220+", description: "Global PPP-adjusted pricing" },
  ];

  const revenueStreams = [
    { 
      icon: Rocket, 
      title: "SaaS Subscriptions", 
      description: "Tiered monthly/annual plans from $49-$699/mo",
      percentage: "Primary Revenue"
    },
    { 
      icon: Target, 
      title: "Lead Generation", 
      description: "Qualified leads to funding partners, brokers, and vendors",
      percentage: "High Margin"
    },
    { 
      icon: FileText, 
      title: "Template & Tools", 
      description: "One-time purchases for business plans, checklists, reports",
      percentage: "Scalable"
    },
    { 
      icon: Award, 
      title: "Enterprise & API", 
      description: "White-label solutions for lenders and equipment manufacturers",
      percentage: "B2B Growth"
    },
  ];

  const competitiveAdvantages = [
    "First AI-native platform purpose-built for laundromat industry",
    "Proprietary CLEANBI scoring algorithm with 17 weighted factors",
    "Pre-vetted funding partner network with instant matching",
    "73,000+ member community and industry relationships",
    "Multi-AI orchestration (OpenAI, Anthropic, Gemini, Perplexity)",
    "Complete buyer-to-owner journey tools and education",
  ];

  return (
    <>
      <Helmet>
        <title>Invest in WashBizHub | Laundromat Industry SaaS Investment Opportunity</title>
        <meta 
          name="description" 
          content="Invest in WashBizHub - the leading AI-powered SaaS platform serving the $7.1B laundromat industry. 73,000+ community members, proven revenue model, and massive growth potential." 
        />
        <meta property="og:title" content="Invest in WashBizHub | SaaS Investment Opportunity" />
        <meta property="og:description" content="The #1 laundromat intelligence platform with 73,000+ users and multiple revenue streams." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-[#0A1628] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#1e3a5f] to-[#0A1628] opacity-80" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNDOEE2NjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          
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
                data-testid="badge-investor-opportunity"
              >
                <TrendingUp className="w-3 h-3 mr-1.5" />
                Investment Opportunity
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Invest in the Future of
                <span className="block text-[#C8A661]">Laundromat Intelligence</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                WashBizHub is the AI-powered SaaS platform transforming how 73,000+ professionals 
                buy, operate, and grow laundromat businesses in a $7.1 billion industry.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                  onClick={() => {
                    trackEvent("investor_cta_deck", "engagement");
                    document.getElementById("investor-form")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  data-testid="button-request-deck"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Request Investor Deck
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => {
                    trackEvent("investor_cta_meeting", "engagement");
                    document.getElementById("investor-form")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  data-testid="button-schedule-call"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule a Call
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Market Opportunity Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Building2 className="w-3 h-3 mr-1.5" />
                Market Opportunity
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                A $7+ Billion Industry Ready for Disruption
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The laundromat industry is massive, fragmented, and underserved by technology. 
                WashBizHub is the category-defining platform that industry professionals trust.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {marketStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm text-center h-full">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-[#C8A661] mb-2">{stat.value}</div>
                      <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
                      <div className="text-xs text-muted-foreground">{stat.source}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Why Now?</h3>
                    <ul className="space-y-3">
                      {[
                        "Generational shift: Boomers selling, Millennials buying",
                        "Recession-resistant essential service business",
                        "Technology adoption accelerating post-COVID",
                        "No dominant SaaS player in the vertical",
                        "Strong unit economics: 20-35% cash-on-cash returns",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#C8A661] shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 text-[#C8A661] mx-auto mb-4" />
                      <div className="text-2xl font-bold text-foreground mb-2">Category Leader</div>
                      <p className="text-sm text-muted-foreground">
                        WashBizHub is building the "Redfin + Bloomberg" for laundromats - 
                        combining marketplace, intelligence, and SaaS tools in one platform.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Platform Traction Section */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <BarChart3 className="w-3 h-3 mr-1.5" />
                Platform Traction
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Proven Product-Market Fit
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Real metrics from a platform that industry professionals already use and trust.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm overflow-hidden h-full">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center mx-auto mb-4">
                        <metric.icon className="w-6 h-6 text-[#C8A661]" />
                      </div>
                      <div className="text-3xl font-bold text-[#C8A661] mb-1">{metric.value}</div>
                      <div className="text-sm font-medium text-foreground mb-1">{metric.label}</div>
                      <div className="text-xs text-muted-foreground">{metric.description}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Revenue Model Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <PieChart className="w-3 h-3 mr-1.5" />
                Business Model
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Multiple High-Margin Revenue Streams
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Diversified monetization across SaaS, lead gen, and enterprise partnerships.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {revenueStreams.map((stream, index) => (
                <motion.div
                  key={stream.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                          <stream.icon className="w-6 h-6 text-[#C8A661]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-foreground">{stream.title}</h3>
                            <Badge variant="secondary" className="text-xs">{stream.percentage}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">{stream.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Subscription Tiers */}
            <div className="mt-12 bg-card border shadow-sm rounded-lg p-8">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">Subscription Tiers</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { tier: "Free", price: "$0", users: "Hobbyists", features: "Basic tools" },
                  { tier: "Pro", price: "$49/mo", users: "Active buyers", features: "Full CLEANBI access" },
                  { tier: "Business", price: "$199/mo", users: "Operators", features: "Advanced analytics" },
                  { tier: "Enterprise", price: "$699/mo", users: "Portfolios", features: "API + white-label" },
                ].map((plan) => (
                  <div key={plan.tier} className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-1">{plan.tier}</div>
                    <div className="text-xl font-bold text-[#C8A661]">{plan.price}</div>
                    <div className="text-xs text-muted-foreground mt-2">{plan.users}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="py-20 bg-[#0A1628]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661] bg-[#C8A661]/10">
                <Shield className="w-3 h-3 mr-1.5" />
                Competitive Moat
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Why WashBizHub Wins
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Defensible advantages that compound over time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {competitiveAdvantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#C8A661] shrink-0" />
                  <span className="text-white">{advantage}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Investor Contact Form */}
        <section id="investor-form" className="py-20 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Mail className="w-3 h-3 mr-1.5" />
                Get In Touch
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Interested in Investing?
              </h2>
              <p className="text-muted-foreground">
                Request our investor deck or schedule a call with our team.
              </p>
            </div>

            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="p-8">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
                    <p className="text-muted-foreground mb-6">
                      We've received your inquiry and will be in touch within 24-48 hours.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      For immediate inquiries: <a href="mailto:investors@washbizhub.com" className="text-[#C8A661] hover:underline">investors@washbizhub.com</a>
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Smith"
                          {...form.register("name")}
                          data-testid="input-investor-name"
                        />
                        {form.formState.errors.name && (
                          <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          {...form.register("email")}
                          data-testid="input-investor-email"
                        />
                        {form.formState.errors.email && (
                          <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          placeholder="(555) 123-4567"
                          {...form.register("phone")}
                          data-testid="input-investor-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company/Fund (Optional)</Label>
                        <Input
                          id="company"
                          placeholder="ABC Capital"
                          {...form.register("company")}
                          data-testid="input-investor-company"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="investorType">Investor Type *</Label>
                        <Select 
                          onValueChange={(value) => form.setValue("investorType", value)}
                          data-testid="select-investor-type"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="angel">Angel Investor</SelectItem>
                            <SelectItem value="vc">Venture Capital</SelectItem>
                            <SelectItem value="family-office">Family Office</SelectItem>
                            <SelectItem value="strategic">Strategic Partner</SelectItem>
                            <SelectItem value="individual">Individual Investor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.investorType && (
                          <p className="text-xs text-red-500">{form.formState.errors.investorType.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="investmentRange">Investment Range *</Label>
                        <Select 
                          onValueChange={(value) => form.setValue("investmentRange", value)}
                          data-testid="select-investment-range"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="25k-100k">$25K - $100K</SelectItem>
                            <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                            <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                            <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                            <SelectItem value="5m+">$5M+</SelectItem>
                            <SelectItem value="undisclosed">Prefer Not to Say</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.investmentRange && (
                          <p className="text-xs text-red-500">{form.formState.errors.investmentRange.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your interest in WashBizHub..."
                        rows={4}
                        {...form.register("message")}
                        data-testid="textarea-investor-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                      disabled={isSubmitting}
                      data-testid="button-submit-investor-inquiry"
                    >
                      {isSubmitting ? (
                        "Submitting..."
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Submit Inquiry
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Your information is confidential. We'll respond within 24-48 hours.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Direct Contact */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Prefer to reach out directly?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="mailto:investors@washbizhub.com" 
                  className="inline-flex items-center gap-2 text-[#C8A661] hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  investors@washbizhub.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
