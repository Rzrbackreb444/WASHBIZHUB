import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, CheckCircle2, Sparkles } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "default" | "compact" | "hero";
  source?: string;
}

export function NewsletterSignup({ variant = "default", source = "unknown" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; firstName?: string; source: string }) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", data);
      return response.json();
    },
    onSuccess: () => {
      setEmail("");
      setFirstName("");
      toast({
        title: "✅ Subscribed!",
        description: "You'll receive industry insights, calculator updates, and exclusive offers.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeMutation.mutate({
      email,
      firstName: firstName || undefined,
      source,
    });
  };

  if (variant === "compact") {
    return (
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={subscribeMutation.isPending}
          className="flex-1"
          data-testid="input-newsletter-email"
        />
        <Button
          onClick={handleSubmit}
          disabled={subscribeMutation.isPending || !email}
          data-testid="button-newsletter-subscribe"
        >
          {subscribeMutation.isPending ? "..." : <Mail className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30 backdrop-blur">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-accent/20 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Industry Intelligence Newsletter</h3>
              <p className="text-white/70">
                Weekly insights, calculator updates, and exclusive marketplace deals
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={subscribeMutation.isPending}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              data-testid="input-newsletter-firstname"
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeMutation.isPending}
              required
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              data-testid="input-newsletter-email"
            />
            <Button
              type="submit"
              disabled={subscribeMutation.isPending || !email}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8"
              data-testid="button-newsletter-subscribe"
            >
              {subscribeMutation.isPending ? "Subscribing..." : "Get Updates"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-accent/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-accent/20 p-3 rounded-lg">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Stay Informed</h3>
            <p className="text-white/70 text-sm">
              Get industry news, new calculators, and exclusive deals
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribeMutation.isPending}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            data-testid="input-newsletter-email"
          />
          <Button
            type="submit"
            disabled={subscribeMutation.isPending || !email}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            data-testid="button-newsletter-subscribe"
          >
            {subscribeMutation.isPending ? (
              "Subscribing..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Subscribe Now
              </>
            )}
          </Button>
        </form>
        <p className="text-xs text-white/50 mt-3 text-center">
          No spam. Unsubscribe anytime. 72,000+ industry professionals trust us.
        </p>
      </CardContent>
    </Card>
  );
}
