import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Building2, 
  Cpu, 
  Users, 
  Package, 
  TrendingUp, 
  Wrench,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Truck,
  DollarSign,
  Shield,
  Zap,
  Phone,
  Mail,
  Globe,
  Bot,
  Route,
  FileText,
  Headphones
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const enterpriseFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().min(2, "Company name is required"),
  phone: z.string().optional(),
  locations: z.string().optional(),
  message: z.string().optional(),
});

type EnterpriseFormData = z.infer<typeof enterpriseFormSchema>;

export default function DistributorsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<EnterpriseFormData>({
    resolver: zodResolver(enterpriseFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      locations: "",
      message: "",
    },
  });

  const onSubmit = async (data: EnterpriseFormData) => {
    setIsSubmitting(true);
    try {
      setIsSubmitted(true);
      toast({
        title: "Enterprise inquiry received!",
        description: "Our team will reach out within 24 hours.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const aiModules = [
    {
      icon: Wrench,
      title: "Service Guy AI",
      description: "AI-powered equipment diagnostics for your entire technician network. Photo recognition, error code lookup, troubleshooting steps, and parts recommendations.",
      benefits: ["Reduce return trips by 50%", "Faster first-time fix rates", "Complete repair history per machine"]
    },
    {
      icon: Package,
      title: "Parts Intelligence",
      description: "Predictive parts ordering based on repair history and equipment lifecycle. Your techs always show up prepared.",
      benefits: ["Parts API integration", "Inventory forecasting", "Auto-reorder triggers"]
    },
    {
      icon: BarChart3,
      title: "Fleet Analytics Dashboard",
      description: "See equipment health across your entire customer base. Identify replacement opportunities before machines fail.",
      benefits: ["Equipment lifecycle tracking", "ROI per machine", "Replacement recommendations"]
    },
    {
      icon: Route,
      title: "Logistics & Dispatch",
      description: "AI-optimized technician routing and dispatch. Reduce drive time, increase jobs per day.",
      benefits: ["Route optimization", "Real-time tracking", "Customer notifications"]
    },
    {
      icon: Headphones,
      title: "AI Receptionist",
      description: "24/7 AI phone answering for service calls. Books appointments, answers questions, escalates urgent issues.",
      benefits: ["Never miss a call", "Appointment scheduling", "After-hours coverage"]
    },
    {
      icon: DollarSign,
      title: "Revenue Intelligence",
      description: "Track parts revenue, service margins, and identify upsell opportunities across your network.",
      benefits: ["Parts revenue tracking", "Margin analysis", "Upsell recommendations"]
    }
  ];

  const whyPartner = [
    {
      icon: TrendingUp,
      title: "Increase Parts Revenue",
      description: "Every diagnosis leads to parts orders. Your techs recommend, your parts department fulfills."
    },
    {
      icon: Users,
      title: "Retain Customers Longer",
      description: "Better service = stickier customers. When you solve problems faster, they don't shop competitors."
    },
    {
      icon: Shield,
      title: "Competitive Moat",
      description: "Your competitors don't have this. AI-powered service is a differentiator customers will pay for."
    },
    {
      icon: Zap,
      title: "Technician Efficiency",
      description: "Fewer return trips, faster diagnoses, less training time. Your techs become experts instantly."
    }
  ];

  const stats = [
    { value: "50%", label: "Fewer Return Trips" },
    { value: "3x", label: "Faster Diagnosis" },
    { value: "24/7", label: "AI Availability" },
    { value: "$$$", label: "Parts Revenue Increase" }
  ];

  return (
    <>
      <Helmet>
        <title>Enterprise AI for Equipment Distributors | WashBizHub</title>
        <meta 
          name="description" 
          content="AI-powered solutions for commercial laundry equipment distributors. Service diagnostics, parts intelligence, fleet analytics, and logistics optimization." 
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
                <Building2 className="w-3 h-3 mr-1.5" />
                Enterprise Solutions
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                AI-Powered Operations
                <span className="block text-[#C8A661]">For Equipment Distributors</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Transform your service, parts, and logistics operations with AI. 
                Reduce costs, increase revenue, and dominate your market.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                  onClick={() => document.getElementById("enterprise-form")?.scrollIntoView({ behavior: "smooth" })}
                  data-testid="button-schedule-demo"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule a Demo
                </Button>
                <Link href="/service">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    See Service Guy AI
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

        {/* Why Partner Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Why Leading Distributors Choose WashBizHub
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyPartner.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center mx-auto mb-4">
                        <item.icon className="w-6 h-6 text-[#C8A661]" />
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Modules */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Cpu className="w-3 h-3 mr-1.5" />
                AI Modules
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Complete AI Operating System
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Modular AI solutions that integrate with your existing operations. 
                Start with one, expand to all.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiModules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm overflow-hidden h-full">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-4">
                        <module.icon className="w-5 h-5 text-[#C8A661]" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{module.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{module.description}</p>
                      <div className="space-y-2">
                        {module.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#C8A661]" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-16 bg-[#0A1628]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661] bg-[#C8A661]/10">
                  <Globe className="w-3 h-3 mr-1.5" />
                  Integration
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Works With Your Systems
                </h2>
                <p className="text-gray-300 mb-6">
                  Our AI integrates with your existing parts inventory, CRM, and service management systems. 
                  No rip-and-replace required.
                </p>
                <ul className="space-y-3">
                  {[
                    "Parts inventory API integration",
                    "CRM and customer data sync",
                    "Existing service ticket systems",
                    "Accounting and invoicing platforms",
                    "White-label options available"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-[#C8A661]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                <div className="text-center">
                  <Bot className="w-16 h-16 text-[#C8A661] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">White-Label Ready</h3>
                  <p className="text-gray-400 text-sm">
                    Deploy Service Guy AI under your brand. Your customers see your logo, 
                    your colors, your name — powered by WashBizHub intelligence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Form */}
        <section id="enterprise-form" className="py-20 bg-muted/30">
          <div className="max-w-2xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Mail className="w-3 h-3 mr-1.5" />
                Get Started
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Schedule an Enterprise Demo
              </h2>
              <p className="text-muted-foreground">
                See how WashBizHub AI can transform your distributor operations.
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
                      Our enterprise team will reach out within 24 hours to schedule your demo.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      For immediate inquiries: <a href="mailto:enterprise@washbizhub.com" className="text-[#C8A661] hover:underline">enterprise@washbizhub.com</a>
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Smith"
                          {...form.register("name")}
                          data-testid="input-enterprise-name"
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
                          placeholder="john@company.com"
                          {...form.register("email")}
                          data-testid="input-enterprise-email"
                        />
                        {form.formState.errors.email && (
                          <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name *</Label>
                        <Input
                          id="company"
                          placeholder="Your Distributor Company"
                          {...form.register("company")}
                          data-testid="input-enterprise-company"
                        />
                        {form.formState.errors.company && (
                          <p className="text-xs text-red-500">{form.formState.errors.company.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          placeholder="(555) 123-4567"
                          {...form.register("phone")}
                          data-testid="input-enterprise-phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locations">Number of Locations (Optional)</Label>
                      <Input
                        id="locations"
                        placeholder="e.g., 5 locations, 50 technicians"
                        {...form.register("locations")}
                        data-testid="input-enterprise-locations"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">What are your biggest operational challenges? (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your current pain points..."
                        rows={4}
                        {...form.register("message")}
                        data-testid="textarea-enterprise-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                      disabled={isSubmitting}
                      data-testid="button-submit-enterprise"
                    >
                      {isSubmitting ? "Submitting..." : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Request Demo
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
