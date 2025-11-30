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
import { Mail, CheckCircle2, Sparkles, Loader2 } from "lucide-react";

const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address (e.g., name@example.com)"),
  firstName: z.string().optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterSignupProps {
  variant?: "default" | "compact" | "hero";
  source?: string;
}

export function NewsletterSignup({ variant = "default", source = "unknown" }: NewsletterSignupProps) {
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
        title: "Successfully subscribed!",
        description: "You'll receive industry insights, calculator updates, and exclusive offers.",
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
      const timer = setTimeout(() => setShowSuccess(false), 4000);
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

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center gap-3 py-4 px-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <span className="text-green-800 dark:text-green-200 font-medium" data-testid="text-newsletter-success">
          You're subscribed! Check your inbox for a welcome email.
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="flex-1 space-y-0">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your email"
                    disabled={subscribeMutation.isPending}
                    className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                    data-testid="input-newsletter-email"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={subscribeMutation.isPending || !form.formState.isValid}
            data-testid="button-newsletter-subscribe"
          >
            {subscribeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </form>
      </Form>
    );
  }

  if (variant === "hero") {
    return (
      <Card className="bg-card/95 border-2 border-primary/40 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="bg-primary/20 p-3 rounded-full flex-shrink-0">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Industry Intelligence Newsletter
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Weekly insights, calculator updates, and exclusive marketplace deals
              </p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="First Name"
                          disabled={subscribeMutation.isPending}
                          className="bg-background border-border"
                          data-testid="input-newsletter-firstname"
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
                    <FormItem className="flex-1 space-y-1">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Your email address"
                          disabled={subscribeMutation.isPending}
                          className={`bg-background border-border ${fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          data-testid="input-newsletter-email"
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 sm:px-8 whitespace-nowrap"
                  data-testid="button-newsletter-subscribe"
                >
                  {subscribeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    "Get Updates"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            No spam. Unsubscribe anytime. 72,000+ industry professionals trust us.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-accent/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-accent/20 p-3 rounded-lg">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Stay Informed</h3>
            <p className="text-muted-foreground text-sm">
              Get industry news, new calculators, and exclusive deals
            </p>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1">
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      disabled={subscribeMutation.isPending}
                      className={`bg-background border-border ${fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      data-testid="input-newsletter-email"
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
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
              data-testid="button-newsletter-subscribe"
            >
              {subscribeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Subscribe Now
                </>
              )}
            </Button>
          </form>
        </Form>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          No spam. Unsubscribe anytime. 72,000+ industry professionals trust us.
        </p>
      </CardContent>
    </Card>
  );
}
