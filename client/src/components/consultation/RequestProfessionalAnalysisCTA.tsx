import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Users, Mail, Check, MapPin, Calculator, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ConsultationData {
  type: "location" | "design" | "listing" | "general";
  locationAddress?: string;
  locationScore?: number;
  locationGrade?: string;
  designSqft?: number;
  equipmentCount?: number;
  projectedRevenue?: number;
  viabilityScore?: number;
  listingName?: string;
  listingPrice?: number;
  listingId?: string;
}

interface RequestProfessionalAnalysisCTAProps {
  variant?: "button" | "card" | "inline";
  size?: "sm" | "md" | "lg";
  consultationData?: ConsultationData;
  className?: string;
  buttonText?: string;
}

export function RequestProfessionalAnalysisCTA({
  variant = "button",
  size = "md",
  consultationData,
  className = "",
  buttonText = "Request Professional Analysis",
}: RequestProfessionalAnalysisCTAProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      await apiRequest("/api/consultation-request", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          consultationType: consultationData?.type || "general",
          consultationData,
          timestamp: new Date().toISOString(),
        }),
      });

      setDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", notes: "" });

      toast({
        title: "Request Submitted!",
        description: "Our expert council will review your request and Nick Kremers will reach out within 24-48 hours.",
      });
    } catch (error) {
      console.error("Consultation request error:", error);
      toast({
        title: "Request Failed",
        description: "Could not submit request. Please try again or email consult@washbizhub.com directly.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getContextSummary = () => {
    if (!consultationData) return null;

    switch (consultationData.type) {
      case "location":
        return (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-[#39CCCC]" />
              <p className="text-white/80 font-semibold text-xs">Location Analysis</p>
            </div>
            <p className="text-white/60 text-xs truncate">{consultationData.locationAddress}</p>
            {consultationData.locationScore && (
              <p className="text-white/60 text-xs mt-1">
                CLEANBI Score: <span className="text-white font-semibold">{consultationData.locationScore}</span>
                {consultationData.locationGrade && (
                  <span className="ml-2 text-[#C8A661]">Grade {consultationData.locationGrade}</span>
                )}
              </p>
            )}
          </div>
        );
      case "design":
        return (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-[#39CCCC]" />
              <p className="text-white/80 font-semibold text-xs">Design Studio Project</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-white font-semibold">{consultationData.designSqft?.toLocaleString()}</p>
                <p className="text-white/50">sq ft</p>
              </div>
              <div>
                <p className="text-white font-semibold">{consultationData.equipmentCount}</p>
                <p className="text-white/50">Machines</p>
              </div>
              <div>
                <p className="text-green-400 font-semibold">${consultationData.projectedRevenue?.toLocaleString()}/mo</p>
                <p className="text-white/50">Projected</p>
              </div>
            </div>
          </div>
        );
      case "listing":
        return (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-[#39CCCC]" />
              <p className="text-white/80 font-semibold text-xs">Marketplace Listing</p>
            </div>
            <p className="text-white/60 text-xs truncate">{consultationData.listingName}</p>
            {consultationData.listingPrice && (
              <p className="text-green-400 font-semibold text-sm mt-1">
                ${consultationData.listingPrice.toLocaleString()}
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: "h-8 text-xs px-3",
    md: "h-10 text-sm px-4",
    lg: "h-12 text-base px-6",
  };

  if (variant === "card") {
    return (
      <>
        <div
          className={`bg-gradient-to-br from-[#0A1628] to-[#0D1F35] rounded-xl p-4 border border-[#C8A661]/30 cursor-pointer hover:border-[#C8A661]/50 transition-all ${className}`}
          onClick={() => setDialogOpen(true)}
          data-testid="cta-card-consultation"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8A661] to-[#B8955A] flex items-center justify-center">
              <Users className="h-6 w-6 text-[#001F3F]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Expert Council Review</p>
              <p className="text-white/60 text-xs">5 specialists + human oversight</p>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#C8A661] to-[#B8955A] text-[#001F3F] hover:from-[#D4B872] hover:to-[#C8A661] font-bold"
            data-testid="button-request-analysis-card"
          >
            <Mail className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </div>
        <ConsultationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isSending={isSending}
          contextSummary={getContextSummary()}
        />
      </>
    );
  }

  if (variant === "inline") {
    return (
      <>
        <button
          className={`flex items-center gap-2 text-[#C8A661] hover:text-[#D4B872] transition-colors ${className}`}
          onClick={() => setDialogOpen(true)}
          data-testid="cta-inline-consultation"
        >
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium underline">{buttonText}</span>
        </button>
        <ConsultationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isSending={isSending}
          contextSummary={getContextSummary()}
        />
      </>
    );
  }

  return (
    <>
      <Button
        className={`bg-gradient-to-r from-[#C8A661] via-[#D4B872] to-[#C8A661] text-[#001F3F] hover:from-[#D4B872] hover:via-[#E5C983] hover:to-[#D4B872] font-bold shadow-lg border border-[#B8955A]/30 ${sizeClasses[size]} ${className}`}
        onClick={() => setDialogOpen(true)}
        data-testid="button-request-analysis"
      >
        <Users className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
      <ConsultationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSending={isSending}
        contextSummary={getContextSummary()}
      />
    </>
  );
}

function ConsultationDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isSending,
  contextSummary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: { name: string; email: string; phone: string; notes: string };
  setFormData: (data: { name: string; email: string; phone: string; notes: string }) => void;
  onSubmit: () => void;
  isSending: boolean;
  contextSummary: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-b from-[#0A1628] to-[#0D1F35] border-[#C8A661]/30 text-white">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8A661] to-[#B8955A] flex items-center justify-center shadow-lg shadow-[#C8A661]/20">
              <Users className="h-8 w-8 text-[#001F3F]" />
            </div>
          </div>
          <div className="text-center">
            <DialogTitle className="text-xl font-bold text-white">
              Laundromat Consultation Council
            </DialogTitle>
            <DialogDescription className="text-white/70 mt-2">
              Expert analysis by our specialized panel with human verification
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-white/80 font-semibold text-xs mb-3">Your Expert Panel:</p>
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center">
                <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-[10px]">
                  OPS
                </div>
                <p className="text-white/80 text-[9px] mt-1 font-medium">Operations</p>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-[10px]">
                  FIN
                </div>
                <p className="text-white/80 text-[9px] mt-1 font-medium">Financial</p>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-[10px]">
                  MKT
                </div>
                <p className="text-white/80 text-[9px] mt-1 font-medium">Market</p>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-white font-bold text-[10px]">
                  EQP
                </div>
                <p className="text-white/80 text-[9px] mt-1 font-medium">Equipment</p>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-[10px]">
                  LOC
                </div>
                <p className="text-white/80 text-[9px] mt-1 font-medium">Location</p>
              </div>
            </div>
            <p className="text-white/50 text-[10px] mt-3 text-center italic">
              5 specialists discuss, delegate, and advise on your inquiry
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-r from-[#C8A661]/10 to-transparent rounded-lg p-3 border border-[#C8A661]/20">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8A661] to-[#B8955A] flex items-center justify-center text-[#001F3F] font-bold text-sm flex-shrink-0">
              NK
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Nick Kremers</p>
              <p className="text-[#C8A661] text-[10px]">Founder & Final Review</p>
              <p className="text-white/60 text-[10px]">Human oversight on every consultation</p>
            </div>
          </div>

          {contextSummary}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/80 text-xs mb-1.5 block">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="bg-white/5 border-white/20 text-white text-sm placeholder:text-white/40"
                  data-testid="input-consultation-name"
                />
              </div>
              <div>
                <Label className="text-white/80 text-xs mb-1.5 block">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(Optional)"
                  className="bg-white/5 border-white/20 text-white text-sm placeholder:text-white/40"
                  data-testid="input-consultation-phone"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80 text-xs mb-1.5 block">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="bg-white/5 border-white/20 text-white text-sm placeholder:text-white/40"
                data-testid="input-consultation-email"
                required
              />
            </div>
            <div>
              <Label className="text-white/80 text-xs mb-1.5 block">Questions or Goals</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tell us about your goals, timeline, concerns, or specific questions..."
                className="bg-white/5 border-white/20 text-white text-sm min-h-[80px] placeholder:text-white/40"
                data-testid="input-consultation-notes"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#C8A661]/10 to-transparent rounded-lg p-3 border border-[#C8A661]/20">
            <p className="text-[#C8A661] font-semibold text-xs mb-2">What You'll Receive:</p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-white/80 text-xs">
                <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Professional analysis from our expert council</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-xs">
                <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Personalized recommendations verified by Nick</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-xs">
                <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Complimentary 30-minute consultation call</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/20 text-white/70 hover:text-white"
              data-testid="button-cancel-consultation"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSending}
              className="flex-1 bg-gradient-to-r from-[#C8A661] to-[#B8955A] text-[#001F3F] hover:from-[#D4B872] hover:to-[#C8A661] font-bold"
              data-testid="button-submit-consultation"
            >
              {isSending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-[#001F3F] border-t-transparent rounded-full mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-white/40 text-[10px]">
            Response within 24-48 business hours • No obligation • 100% confidential
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RequestProfessionalAnalysisCTA;
