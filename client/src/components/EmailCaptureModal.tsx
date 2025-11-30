import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Gift, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  FileText,
  Calculator,
  TrendingUp
} from "lucide-react";

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
    icon: Calculator,
    benefit: "Full 17-factor analysis + PDF report",
    color: "bg-[#39CCCC]"
  },
  guide: {
    title: "Free: Ultimate Laundromat Buyer's Guide",
    description: "50+ page guide covering due diligence, valuation, negotiation, and avoiding costly mistakes.",
    icon: FileText,
    benefit: "Instant PDF download",
    color: "bg-[#b8860b]"
  },
  checklist: {
    title: "Free: Due Diligence Checklist",
    description: "The same 47-point checklist our consultants use to evaluate laundromat purchases.",
    icon: CheckCircle2,
    benefit: "Used by 500+ buyers",
    color: "bg-green-600"
  },
  calculator: {
    title: "Unlock Advanced Calculators",
    description: "Get access to our full suite of ROI, valuation, and profitability calculators.",
    icon: TrendingUp,
    benefit: "7 professional calculators",
    color: "bg-blue-600"
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
  const Icon = config.icon;

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
        title: "Success!",
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
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're In!</h3>
            <p className="text-slate-600">Check your email for your free resource.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">
                  <Gift className="w-3 h-3 mr-1" />
                  FREE
                </Badge>
              </div>
              <DialogTitle className="text-xl">{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  data-testid="input-capture-firstname"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-capture-email"
                />
              </div>

              <div>
                <Label htmlFor="interest">I'm interested in</Label>
                <Select value={interest} onValueChange={setInterest}>
                  <SelectTrigger data-testid="select-interest">
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
                className={`w-full h-12 ${config.color} hover:opacity-90`}
                disabled={subscribeMutation.isPending}
                data-testid="button-capture-submit"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Get Free Access
              </Button>

              <p className="text-xs text-slate-500 text-center">
                {config.benefit} • No spam, unsubscribe anytime
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
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3 text-center">
          <Badge className="bg-[#b8860b] text-white border-0">
            <Gift className="w-3 h-3 mr-1" />
            FREE GUIDE
          </Badge>
          <span className="text-sm md:text-base">
            <strong>New:</strong> Download our 50-page Laundromat Buyer's Guide
          </span>
          <Button 
            size="sm" 
            className="bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] font-bold"
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
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 max-w-xs">
          <button 
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#b8860b] rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Free Buyer's Guide</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">50+ pages of expert advice</p>
              <Button 
                size="sm" 
                className="bg-[#b8860b] hover:bg-[#a07609] text-white w-full"
                onClick={() => setShowModal(true)}
                data-testid="button-floating-cta"
              >
                Download Free
              </Button>
            </div>
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
