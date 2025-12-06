import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  CheckCircle2, 
  Loader2, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  FileText,
  Sparkles,
  ArrowRight,
  Users,
  Shield
} from "lucide-react";

const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address"),
  firstName: z.string().optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface HomepageNewsletterProps {
  source?: string;
}

const benefits = [
  {
    icon: TrendingUp,
    title: "Weekly CLEANBI Market Reports",
    description: "Data-driven insights on market trends and location scores"
  },
  {
    icon: Zap,
    title: "First Access to New Listings",
    description: "Get notified before deals hit the public marketplace"
  },
  {
    icon: DollarSign,
    title: "Funding Partner Exclusive Offers",
    description: "Special rates and programs from our vetted lenders"
  },
  {
    icon: FileText,
    title: "Due Diligence Tips from Experts",
    description: "Avoid costly mistakes with insider knowledge"
  }
];

export function HomepageNewsletter({ source = "homepage" }: HomepageNewsletterProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
      firstName: "",
    },
    mode: "onTouched",
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; firstName?: string; source: string }) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", data);
      return response.json();
    },
    onSuccess: () => {
      form.reset();
      setShowSuccess(true);
      toast({
        title: "Welcome to the community!",
        description: "Check your inbox for your first market insights.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to subscribe",
        description: error.message || "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = (data: NewsletterFormData) => {
    subscribeMutation.mutate({
      email: data.email,
      firstName: data.firstName || undefined,
      source,
    });
  };

  return (
    <section 
      className="relative py-16 sm:py-24 overflow-hidden"
      data-testid="section-homepage-newsletter"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#253f5f] to-[#1e3a5f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C8A661]/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#C8A661]/10 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8A661]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center bg-[#C8A661]/20 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-[#C8A661]" data-testid="badge-newsletter-label">
                  Free Weekly Intelligence
                </span>
              </div>
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
                data-testid="text-newsletter-section-headline"
              >
                Join 1,000+ Laundromat Investors
              </h2>
              <p className="text-lg text-white/80 max-w-lg" data-testid="text-newsletter-section-description">
                Get exclusive market intelligence that helps you find better deals, avoid costly mistakes, and grow your portfolio faster.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 group"
                  data-testid={`benefit-item-${index}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-[#C8A661]/20 rounded-lg flex items-center justify-center group-hover:bg-[#C8A661]/30 transition-colors">
                    <benefit.icon className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white" data-testid={`text-benefit-title-${index}`}>
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-white/70" data-testid={`text-benefit-description-${index}`}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-white/80">
              <span data-testid="text-subscriber-count">72,000+ subscribers</span>
              <span data-testid="text-no-spam">No spam, ever</span>
            </div>
          </div>

          <div>
            <Card 
              className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl shadow-black/20"
              data-testid="card-newsletter-form"
            >
              <CardContent className="p-6 sm:p-8">
                {showSuccess ? (
                  <div 
                    className="flex flex-col items-center justify-center gap-4 py-8"
                    data-testid="container-newsletter-success"
                  >
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="text-center">
                      <h3 
                        className="text-2xl font-bold text-gray-900 mb-2"
                        data-testid="text-success-title"
                      >
                        Welcome to the Community!
                      </h3>
                      <p 
                        className="text-gray-600"
                        data-testid="text-success-message"
                      >
                        Check your inbox for a welcome email with your first market insights.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1e3a5f]/10 rounded-xl mb-4">
                        <Mail className="h-7 w-7 text-[#1e3a5f]" />
                      </div>
                      <h3 
                        className="text-xl font-bold text-gray-900 mb-1"
                        data-testid="text-form-headline"
                      >
                        Get Your Free Market Intel
                      </h3>
                      <p 
                        className="text-gray-600 text-sm"
                        data-testid="text-form-subheadline"
                      >
                        Join thousands of successful investors
                      </p>
                    </div>

                    <Form {...form}>
                      <form 
                        onSubmit={form.handleSubmit(handleSubmit)} 
                        className="space-y-4"
                        data-testid="form-homepage-newsletter"
                      >
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="First Name"
                                  disabled={subscribeMutation.isPending}
                                  className="h-12 bg-gray-50 border-gray-200 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/20"
                                  data-testid="input-homepage-newsletter-firstname"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Email Address"
                                  disabled={subscribeMutation.isPending}
                                  className={`h-12 bg-gray-50 border-gray-200 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/20 ${fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                                  data-testid="input-homepage-newsletter-email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={subscribeMutation.isPending}
                          className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white font-semibold shadow-lg shadow-[#1e3a5f]/25"
                          data-testid="button-homepage-newsletter-subscribe"
                        >
                          {subscribeMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            <>
                              Get Free Access
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>

                    <p 
                      className="text-xs text-gray-500 text-center mt-4"
                      data-testid="text-privacy-note"
                    >
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-sm text-blue-100/60" data-testid="text-social-proof">
                Trusted by operators nationwide
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
