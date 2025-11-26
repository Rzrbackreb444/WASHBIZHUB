import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Mail, Gift, Sparkles, CheckCircle, Loader2 } from "lucide-react";

interface EmailCaptureWidgetProps {
  businessName?: string;
  primaryColor?: string;
  variant?: "popup" | "inline" | "slide-in" | "banner";
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  incentive?: string;
  position?: "bottom-left" | "bottom-right" | "center";
  onSuccess?: (email: string) => void;
  onClose?: () => void;
  segments?: string[];
  source?: string;
}

export function EmailCaptureWidget({
  businessName = "Our Laundromat",
  primaryColor = "#C8A661",
  variant = "popup",
  headline = "Get 10% Off Your First Order!",
  subheadline = "Join our newsletter for exclusive deals and laundry tips.",
  ctaText = "Subscribe",
  incentive = "Plus free pickup on your first order!",
  position = "bottom-right",
  onSuccess,
  onClose,
  segments = ["newsletter"],
  source = "website_widget",
}: EmailCaptureWidgetProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; name?: string; segments: string[]; source: string }) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "Welcome aboard!",
        description: "Check your inbox for your discount code.",
      });
      onSuccess?.(email);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, name, segments, source });
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  if (variant === "inline") {
    return (
      <Card 
        className="border-2 overflow-hidden"
        style={{ borderColor: `${primaryColor}30` }}
        data-testid="email-capture-inline"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Mail className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <Badge variant="secondary" className="text-xs">
              <Gift className="w-3 h-3 mr-1" />
              Special Offer
            </Badge>
          </div>
          <CardTitle className="text-xl">{headline}</CardTitle>
          <CardDescription>{subheadline}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-4 text-center"
            >
              <CheckCircle className="w-12 h-12 mb-3" style={{ color: primaryColor }} />
              <p className="font-semibold text-lg">You're subscribed!</p>
              <p className="text-sm text-muted-foreground">Check your email for your discount code.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
                data-testid="input-capture-name"
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                data-testid="input-capture-email"
              />
              <Button
                type="submit"
                className="w-full h-11"
                style={{ backgroundColor: primaryColor }}
                disabled={subscribeMutation.isPending}
                data-testid="button-capture-submit"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {ctaText}
              </Button>
            </form>
          )}
        </CardContent>
        {incentive && !isSubmitted && (
          <CardFooter className="bg-muted/30 border-t py-3">
            <p className="text-sm text-center w-full flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
              {incentive}
            </p>
          </CardFooter>
        )}
      </Card>
    );
  }

  if (variant === "banner") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50"
          style={{ backgroundColor: primaryColor }}
          data-testid="email-capture-banner"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 text-white">
              <Gift className="w-5 h-5" />
              <span className="font-medium">{headline}</span>
            </div>
            {isSubmitted ? (
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5" />
                <span>Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-48 bg-white/90"
                  required
                  data-testid="input-banner-email"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={subscribeMutation.isPending}
                  data-testid="button-banner-submit"
                >
                  {subscribeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : ctaText}
                </Button>
              </form>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
              data-testid="button-banner-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`fixed ${positionClasses[position]} z-50 w-80`}
        data-testid="email-capture-popup"
      >
        <Card className="shadow-2xl border-2" style={{ borderColor: `${primaryColor}40` }}>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClose}
            className="absolute top-2 right-2 h-8 w-8"
            data-testid="button-popup-close"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <CardHeader className="text-center pt-8 pb-3">
            <div 
              className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Gift className="w-7 h-7" style={{ color: primaryColor }} />
            </div>
            <CardTitle className="text-xl">{headline}</CardTitle>
            <CardDescription>{subheadline}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-4 text-center"
              >
                <CheckCircle className="w-12 h-12 mb-3" style={{ color: primaryColor }} />
                <p className="font-semibold text-lg">You're subscribed!</p>
                <p className="text-sm text-muted-foreground">Check your email for your discount code.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  data-testid="input-popup-name"
                />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  data-testid="input-popup-email"
                />
                <Button
                  type="submit"
                  className="w-full h-11"
                  style={{ backgroundColor: primaryColor }}
                  disabled={subscribeMutation.isPending}
                  data-testid="button-popup-submit"
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {ctaText}
                </Button>
              </form>
            )}
          </CardContent>
          
          {incentive && !isSubmitted && (
            <CardFooter className="bg-muted/30 border-t py-3">
              <p className="text-xs text-muted-foreground text-center w-full">
                {incentive}
              </p>
            </CardFooter>
          )}
          
          <div className="px-6 pb-4">
            <p className="text-xs text-muted-foreground text-center">
              By subscribing, you agree to receive emails from {businessName}. 
              Unsubscribe anytime.
            </p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default EmailCaptureWidget;
