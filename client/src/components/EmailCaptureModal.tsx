import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  leadMagnet?: "cleanbi" | "guide" | "checklist" | "calculator";
  source?: string;
}

const leadMagnetConfig = {
  cleanbi: {
    title: "Unlock Your Full CLEANBI Score",
    description: "Enter your email to see your complete property intelligence report with actionable insights.",
    benefit: "Full 17-factor analysis + PDF report"
  },
  guide: {
    title: "Free: Ultimate Laundromat Buyer's Guide",
    description: "50+ page guide covering due diligence, valuation, negotiation, and avoiding costly mistakes.",
    benefit: "Instant PDF download"
  },
  checklist: {
    title: "Free: Due Diligence Checklist",
    description: "The same 47-point checklist our consultants use to evaluate laundromat purchases.",
    benefit: "Used by 500+ buyers"
  },
  calculator: {
    title: "Unlock Advanced Calculators",
    description: "Get access to our full suite of ROI, valuation, and profitability calculators.",
    benefit: "7 professional calculators"
  }
};

export function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  leadMagnet = "cleanbi",
  source = "modal"
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [interest, setInterest] = useState("laundromat");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const config = leadMagnetConfig[leadMagnet];

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string; interest: string; source: string; leadMagnet: string }) => {
      return apiRequest("POST", "/api/newsletter/subscribe", {
        email: data.email,
        firstName: data.firstName,
        primaryIndustry: data.interest,
        industries: [data.interest],
        source: data.source,
        leadMagnet: data.leadMagnet
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Success",
        description: "Check your email for your free resource.",
      });
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
        setEmail("");
        setFirstName("");
      }, 2000);
    },
    onError: (error: any) => {
      if (error?.message?.includes("already subscribed")) {
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ 
      email, 
      firstName, 
      interest,
      source,
      leadMagnet
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="py-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">✓</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">You're In</h3>
            <p className="text-muted-foreground">Check your email for your free resource.</p>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-3">
              <div className="inline-flex">
                <span className="text-xs font-medium tracking-wider uppercase text-[#C8A661] bg-[#C8A661]/10 px-3 py-1 rounded-full">
                  Free Access
                </span>
              </div>
              <DialogTitle className="text-xl font-semibold">{config.title}</DialogTitle>
              <DialogDescription className="text-muted-foreground">{config.description}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11"
                  data-testid="input-capture-firstname"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address <span className="text-muted-foreground">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  data-testid="input-capture-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest" className="text-sm font-medium">I'm interested in</Label>
                <Select value={interest} onValueChange={setInterest}>
                  <SelectTrigger className="h-11" data-testid="select-interest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laundromat">Buying/Owning a Laundromat</SelectItem>
                    <SelectItem value="business_buying">Buying a Business (General)</SelectItem>
                    <SelectItem value="real_estate">Real Estate Investing</SelectItem>
                    <SelectItem value="vendor">I'm a Vendor/Service Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#C8A661] hover:bg-[#a07609] text-white font-medium"
                disabled={subscribeMutation.isPending}
                data-testid="button-capture-submit"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Get Free Access"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center pt-2">
                {config.benefit} · No spam, unsubscribe anytime
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LeadMagnetBanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-[#001F3F] to-slate-800 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-center">
          <span className="text-xs font-medium tracking-wider uppercase text-[#C8A661]">
            Free Guide
          </span>
          <span className="text-sm md:text-base">
            Download our 50-page Laundromat Buyer's Guide
          </span>
          <Button 
            size="sm" 
            className="bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] font-semibold"
            onClick={() => setShowModal(true)}
            data-testid="button-banner-cta"
          >
            Get It Free
          </Button>
        </div>
      </div>

      <EmailCaptureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {}}
        leadMagnet="guide"
        source="top_banner"
      />
    </>
  );
}

export function FloatingCTA() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="hidden sm:block fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
        <div className="bg-background/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/10 border border-border/50 p-4 max-w-xs">
          <button 
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
          <div className="pr-6">
            <p className="font-semibold text-foreground text-sm mb-1">Free Buyer's Guide</p>
            <p className="text-xs text-muted-foreground mb-3">50+ pages of expert advice</p>
            <Button 
              size="sm" 
              className="bg-[#C8A661] hover:bg-[#a07609] text-white w-full font-medium"
              onClick={() => setShowModal(true)}
              data-testid="button-floating-cta"
            >
              Download Free
            </Button>
          </div>
        </div>
      </div>

      <EmailCaptureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => setDismissed(true)}
        leadMagnet="guide"
        source="floating_cta"
      />
    </>
  );
}
