import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp } from "lucide-react";

const STORAGE_KEY = "washbizhub_exit_modal_shown";

interface ExitIntentModalProps {
  enabled?: boolean;
  delay?: number;
}

export function ExitIntentModal({ enabled = true, delay = 2000 }: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const hasBeenShown = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }, []);

  const markAsShown = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage not available
    }
  }, []);

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string }) => {
      return apiRequest("POST", "/api/newsletter/subscribe", {
        email: data.email,
        firstName: data.firstName,
        primaryIndustry: "laundromat",
        industries: ["laundromat"],
        source: "exit_intent_modal",
        leadMagnet: "cleanbi",
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Check your email for your free CLEANBI Score access.",
      });
      setTimeout(() => {
        handleClose();
      }, 2500);
    },
    onError: (error: Error) => {
      if (error?.message?.includes("already subscribed")) {
        setSubmitted(true);
        toast({
          title: "You're already subscribed!",
          description: "Access CLEANBI scores anytime from our site.",
        });
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSubmitted(false);
    setEmail("");
    setFirstName("");
  }, []);

  const handleDismiss = useCallback(() => {
    markAsShown();
    handleClose();
  }, [markAsShown, handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, firstName });
    markAsShown();
  };

  useEffect(() => {
    if (!enabled || hasBeenShown()) return;

    let timeout: NodeJS.Timeout | null = null;
    let hasTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggered) return;
      
      // Trigger when mouse moves toward the top of the viewport (browser chrome)
      if (e.clientY <= 5 && e.relatedTarget === null) {
        hasTriggered = true;
        timeout = setTimeout(() => {
          if (!hasBeenShown()) {
            setIsOpen(true);
            markAsShown();
          }
        }, 100);
      }
    };

    // Add a small delay before enabling exit intent detection
    const enableTimeout = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, delay);

    return () => {
      clearTimeout(enableTimeout);
      if (timeout) clearTimeout(timeout);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled, delay, hasBeenShown, markAsShown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent 
        className="sm:max-w-md"
        data-testid="exit-intent-modal"
      >
        {submitted ? (
          <div className="py-10 text-center" data-testid="exit-intent-success">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">You're All Set!</h3>
            <p className="text-muted-foreground">Check your email for your free CLEANBI Score access.</p>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-3">
              <div className="inline-flex">
                <span className="text-xs font-medium tracking-wider uppercase text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 px-3 py-1 rounded-full">
                  Free Tool
                </span>
              </div>
              <DialogTitle className="text-xl font-semibold" data-testid="text-exit-intent-headline">
                Wait! Don't Miss Your Free CLEANBI Score
              </DialogTitle>
              <DialogDescription data-testid="text-exit-intent-subheadline">
                See how any laundromat location scores before you go
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="exit-firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="exit-firstName"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11"
                  data-testid="input-exit-intent-firstname"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit-email" className="text-sm font-medium">
                  Email Address <span className="text-muted-foreground">*</span>
                </Label>
                <Input
                  id="exit-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  data-testid="input-exit-intent-email"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-white font-semibold"
                disabled={subscribeMutation.isPending}
                data-testid="button-exit-intent-submit"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Get My Free Score"
                )}
              </Button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                data-testid="button-exit-intent-dismiss"
              >
                No thanks, I'll skip this
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Instant access to location intelligence. No spam, unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ExitIntentModal;
