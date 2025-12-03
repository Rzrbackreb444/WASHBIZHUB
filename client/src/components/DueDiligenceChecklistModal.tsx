import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, CheckCircle2, FileSearch, Calculator, 
  Building2, FileText, Shield, TrendingUp, Users,
  Download, Star, Award, MapPin
} from "lucide-react";

interface DueDiligenceChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  source?: string;
}

const checklistSteps = [
  { 
    number: "01", 
    title: "Financial Verification", 
    icon: Calculator,
    description: "3 years tax returns, bank deposits, P&L reconciliation"
  },
  { 
    number: "02", 
    title: "Equipment Assessment", 
    icon: Building2,
    description: "Age, condition, remaining life, maintenance logs"
  },
  { 
    number: "03", 
    title: "Lease & Real Estate", 
    icon: FileText,
    description: "Terms, CAM, rent escalations, renewal options"
  },
  { 
    number: "04", 
    title: "Market & Competition", 
    icon: FileSearch,
    description: "CLEANBI score, competitor mapping, demographics"
  },
  { 
    number: "05", 
    title: "Legal & Compliance", 
    icon: Shield,
    description: "Permits, ADA, environmental, zoning verification"
  },
  { 
    number: "06", 
    title: "Operations Analysis", 
    icon: Users,
    description: "Utility costs, staffing, vendor contracts, TPD metrics"
  },
  { 
    number: "07", 
    title: "Valuation & Upside", 
    icon: TrendingUp,
    description: "SDE multiples, growth potential, improvement ROI"
  },
];

export function DueDiligenceChecklistModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  source = "modal"
}: DueDiligenceChecklistModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setSubmitted(false);
    setEmail("");
    setFirstName("");
    onClose();
  };

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string; source: string }) => {
      return apiRequest("POST", "/api/newsletter/subscribe", {
        email: data.email,
        firstName: data.firstName,
        primaryIndustry: "laundromat",
        industries: ["laundromat"],
        source: data.source,
        leadMagnet: "7-point-checklist"
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Checklist Sent!",
        description: "Check your email for your free 7-point checklist.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      if (error?.message?.includes("already subscribed")) {
        toast({
          title: "You're Already Subscribed",
          description: "Check your email - we've sent the checklist again.",
        });
        onSuccess?.();
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
    subscribeMutation.mutate({ email, firstName, source });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background border-border" data-testid="due-diligence-modal">
        <VisuallyHidden>
          <DialogDescription>
            Get the free 7-point due diligence checklist used by experts to evaluate 300+ laundromat deals
          </DialogDescription>
        </VisuallyHidden>
        
        {submitted ? (
          <div className="p-8 sm:p-10 text-center bg-gradient-to-br from-emerald-500/10 via-background to-emerald-500/5" data-testid="dd-success-state">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30" data-testid="dd-success-checkmark">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2" data-testid="dd-success-title">Your Checklist is On Its Way!</h3>
            <p className="text-muted-foreground mb-6">Check your inbox in the next few minutes for your free 7-point due diligence checklist.</p>
            
            {/* Next Steps */}
            <div className="bg-muted/30 rounded-xl p-5 mb-6 text-left">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                While You Wait, Here's What to Do Next:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Score your target location with <strong className="text-foreground">CLEANBI Explorer</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Browse <strong className="text-foreground">verified listings</strong> in our marketplace</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Compare <strong className="text-foreground">7 funding partners</strong> for financing</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => {
                  handleClose();
                  window.location.href = '/cleanbi-explorer';
                }}
                className="flex-1 bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-700/90"
                data-testid="button-dd-explore"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Try CLEANBI Free
              </Button>
              <Button 
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                data-testid="button-dd-close"
              >
                Close
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground/60 mt-4">Join 2,500+ buyers who've used this checklist to evaluate deals.</p>
          </div>
        ) : (
          <>
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-primary via-primary to-blue-900 text-white p-6 pb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-3 py-1 bg-amber-500/90 rounded-full text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <Star className="w-3 h-3" />
                    Free Download
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">
                    2,500+ Downloads
                  </div>
                </div>
                
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                    7-Point Due Diligence Checklist
                  </DialogTitle>
                  <p className="text-white/80 text-base">
                    The same proven checklist used by Larry Larsen to evaluate 300+ laundromat deals
                  </p>
                </DialogHeader>
              </div>
            </div>

            <div className="p-6">
              {/* Circular Diagram - 7 Steps (hidden on small screens) */}
              <div className="mb-6">
                {/* Desktop circular diagram */}
                <div className="hidden sm:block">
                  <div className="relative flex items-center justify-center py-4">
                    {/* Center circle */}
                    <div className="absolute w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center shadow-xl shadow-primary/20 z-10">
                      <div className="text-center text-white">
                        <div className="text-2xl md:text-3xl font-bold">7</div>
                        <div className="text-xs md:text-sm font-medium opacity-90">Critical<br/>Steps</div>
                      </div>
                    </div>
                    
                    {/* Connecting ring */}
                    <div className="absolute w-56 h-56 md:w-64 md:h-64 rounded-full border-2 border-dashed border-border" />
                    
                    {/* Step nodes positioned in a circle */}
                    <div className="w-[320px] h-[320px] md:w-[360px] md:h-[360px] relative">
                      {checklistSteps.map((step, index) => {
                        const angle = (index * 360 / 7) - 90;
                        const radius = 130;
                        const x = Math.cos((angle * Math.PI) / 180) * radius;
                        const y = Math.sin((angle * Math.PI) / 180) * radius;
                        const Icon = step.icon;
                        
                        return (
                          <div
                            key={step.number}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                            style={{
                              left: `calc(50% + ${x}px)`,
                              top: `calc(50% + ${y}px)`,
                            }}
                            role="listitem"
                            aria-label={`Step ${step.number}: ${step.title}`}
                          >
                            <div className="relative">
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-background border-2 border-border shadow-lg flex items-center justify-center transition-all duration-300 group-hover:border-primary group-hover:shadow-xl group-hover:scale-110">
                                <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary text-white text-[10px] md:text-xs font-bold flex items-center justify-center shadow-md">
                                {step.number}
                              </div>
                            </div>
                            
                            {/* Tooltip on hover */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                              <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-xl text-center whitespace-nowrap border border-border">
                                <div className="font-semibold text-sm">{step.title}</div>
                                <div className="text-xs text-muted-foreground">{step.description}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile step list - always visible on small screens */}
                <div className="sm:hidden grid grid-cols-2 gap-2">
                  {checklistSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.number} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-foreground">{step.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-primary">47+</div>
                  <div className="text-xs text-muted-foreground">Checklist Items</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-emerald-500">$0</div>
                  <div className="text-xs text-muted-foreground">Completely Free</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-amber-500">PDF</div>
                  <div className="text-xs text-muted-foreground">Instant Download</div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="dd-firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="dd-firstName"
                      placeholder="Your name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11"
                      data-testid="input-dd-firstname"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dd-email" className="text-sm font-medium">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="dd-email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                      data-testid="input-dd-email"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-700/90 text-white font-semibold text-base shadow-lg shadow-primary/25"
                  disabled={subscribeMutation.isPending}
                  data-testid="button-dd-submit"
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Get My Free Checklist
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    No spam
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    Expert-vetted
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Instant access
                  </span>
                </div>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
