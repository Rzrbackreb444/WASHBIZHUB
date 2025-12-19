import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Handshake, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Megaphone, 
  Building2,
  ArrowRight,
  CheckCircle2,
  Target,
  Award,
  Mail,
  Globe
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

const partnerFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().min(2, "Company name is required"),
  partnerType: z.string().min(1, "Please select partner type"),
  message: z.string().optional(),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

export default function PartnerPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      partnerType: "",
      message: "",
    },
  });

  const onSubmit = async (data: PartnerFormData) => {
    setIsSubmitting(true);
    try {
      setIsSubmitted(true);
      toast({
        title: "Partnership inquiry received!",
        description: "Our team will reach out within 24-48 hours.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnerTypes = [
    {
      icon: Building2,
      title: "Equipment Distributors",
      description: "List in our directory, access our operator network, and integrate with Service Guy AI.",
      benefits: ["Directory listing", "Lead generation", "Parts API integration", "Service network access"]
    },
    {
      icon: DollarSign,
      title: "Lenders & Financing",
      description: "Join our funding wizard and get matched with pre-qualified laundromat buyers.",
      benefits: ["Funding wizard placement", "Pre-qualified leads", "Deal flow access", "Co-marketing"]
    },
    {
      icon: Megaphone,
      title: "Advertisers & Sponsors",
      description: "Reach 73,000+ laundromat professionals through targeted advertising.",
      benefits: ["Banner placements", "Newsletter sponsorship", "Event sponsorship", "Content marketing"]
    },
    {
      icon: Users,
      title: "Affiliates",
      description: "Earn commissions by referring customers to WashBizHub subscriptions and services.",
      benefits: ["Revenue share", "Tracking dashboard", "Marketing materials", "Dedicated support"]
    }
  ];

  const stats = [
    { value: "73,000+", label: "Community Members" },
    { value: "$25M+", label: "Deals Facilitated" },
    { value: "50,000+", label: "Monthly Visitors" },
    { value: "7", label: "Funding Partners" }
  ];

  return (
    <>
      <Helmet>
        <title>Partner With WashBizHub | Distributors, Lenders, Affiliates | WashBizHub</title>
        <meta 
          name="description" 
          content="Partner with WashBizHub. Equipment distributors, lenders, advertisers, and affiliates. Reach 73,000+ laundromat professionals." 
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
                <Handshake className="w-3 h-3 mr-1.5" />
                Partnership Opportunities
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Partner With
                <span className="block text-[#C8A661]">WashBizHub</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Reach 73,000+ laundromat professionals. Equipment distributors, lenders, 
                advertisers, and affiliates — grow your business with us.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                  onClick={() => document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" })}
                  data-testid="button-become-partner"
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Become a Partner
                </Button>
                <Link href="/directory">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    View Directory
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

        {/* Partner Types */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Target className="w-3 h-3 mr-1.5" />
                Partnership Types
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                How We Can Work Together
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {partnerTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm overflow-hidden h-full">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                          <type.icon className="w-6 h-6 text-[#C8A661]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2">{type.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                          <div className="space-y-2">
                            {type.benefits.map((benefit, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-[#C8A661]" />
                                <span className="text-muted-foreground">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Form */}
        <section id="partner-form" className="py-20 bg-background">
          <div className="max-w-2xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Mail className="w-3 h-3 mr-1.5" />
                Get Started
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Partner Inquiry
              </h2>
              <p className="text-muted-foreground">
                Tell us about your business and how you'd like to partner.
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
                      For immediate inquiries: <a href="mailto:partners@washbizhub.com" className="text-[#C8A661] hover:underline">partners@washbizhub.com</a>
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
                          data-testid="input-partner-name"
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
                          data-testid="input-partner-email"
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
                          placeholder="Your Company"
                          {...form.register("company")}
                          data-testid="input-partner-company"
                        />
                        {form.formState.errors.company && (
                          <p className="text-xs text-red-500">{form.formState.errors.company.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partnerType">Partnership Type *</Label>
                        <Select onValueChange={(value) => form.setValue("partnerType", value)}>
                          <SelectTrigger data-testid="select-partner-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="distributor">Equipment Distributor</SelectItem>
                            <SelectItem value="lender">Lender / Financing</SelectItem>
                            <SelectItem value="advertiser">Advertiser / Sponsor</SelectItem>
                            <SelectItem value="affiliate">Affiliate</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.partnerType && (
                          <p className="text-xs text-red-500">{form.formState.errors.partnerType.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tell us more (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="How would you like to partner with WashBizHub?"
                        rows={4}
                        {...form.register("message")}
                        data-testid="textarea-partner-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                      disabled={isSubmitting}
                      data-testid="button-submit-partner"
                    >
                      {isSubmitting ? "Submitting..." : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Submit Inquiry
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
