import { useState } from "react";
import { Link } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Crown, Check, X, ArrowRight, Sparkles, Shield, Clock, 
  Star, Users, Zap, MapPin, Calculator, BarChart3, 
  BookOpen, Loader2, Quote
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { PLATFORM_TIERS } from "@/lib/tier-config";
import { trackEvent, trackConversion } from "@/lib/user-journey";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  title?: string;
  description?: string;
}

const TESTIMONIALS = [
  {
    quote: "WashBizHub's CLEANBI analysis helped me find 3 undervalued laundromats. The ROI calculators paid for themselves 100x over.",
    author: "Michael R.",
    role: "Multi-unit Owner, Texas",
    rating: 5,
  },
  {
    quote: "The Design Studio saved me $5K on architect fees. I planned my entire retool before breaking ground.",
    author: "Sarah K.",
    role: "First-time Buyer, Florida",
    rating: 5,
  },
];

const TRUST_BADGES = [
  { icon: Users, text: "73,000+ Members" },
  { icon: Star, text: "4.9/5 Rating" },
  { icon: Shield, text: "30-Day Guarantee" },
];

const PLAN_COMPARISON = [
  { 
    feature: "CLEANBI Location Analyses", 
    free: "3 total", 
    allAccess: "Unlimited",
    highlight: true 
  },
  { 
    feature: "Professional Calculators", 
    free: "Preview only", 
    allAccess: "80+ Full Access",
    highlight: true 
  },
  { 
    feature: "Design Studio", 
    free: false, 
    allAccess: true 
  },
  { 
    feature: "Service Guy AI Diagnostics", 
    free: false, 
    allAccess: true 
  },
  { 
    feature: "The Laundromat Bible (Book)", 
    free: false, 
    allAccess: true 
  },
  { 
    feature: "Video Courses & Certifications", 
    free: false, 
    allAccess: true 
  },
  { 
    feature: "Forum Posting & Community", 
    free: false, 
    allAccess: true 
  },
  { 
    feature: "PDF Exports & Reports", 
    free: false, 
    allAccess: true 
  },
  { 
    feature: "AI Business Plan Generator", 
    free: false, 
    allAccess: true 
  },
  { 
    feature: "Priority Support", 
    free: false, 
    allAccess: true 
  },
];

const FEATURE_CONTEXTS: Record<string, { title: string; benefit: string }> = {
  "cleanbi-full": { 
    title: "Full CLEANBI Analysis", 
    benefit: "Get complete location intelligence with AI-powered recommendations" 
  },
  "cleanbi-unlimited": { 
    title: "Unlimited Analyses", 
    benefit: "Analyze as many locations as you need without restrictions" 
  },
  "calculators-all": { 
    title: "Pro Calculator Suite", 
    benefit: "Access 80+ professional calculators for ROI, valuation, and more" 
  },
  "design-studio": { 
    title: "Design Studio", 
    benefit: "Plan your laundromat layout with 2D and 3D visualization tools" 
  },
  "book-access": { 
    title: "The Laundromat Bible", 
    benefit: "500+ pages of expert knowledge from industry veterans" 
  },
  "courses-access": { 
    title: "Education Hub", 
    benefit: "Video courses and certifications to master laundromat ownership" 
  },
  "forum-post": { 
    title: "Community Access", 
    benefit: "Connect with 73,000+ laundromat professionals" 
  },
  "service-guy-ai": { 
    title: "Service Guy AI", 
    benefit: "Diagnose equipment issues instantly with AI-powered troubleshooting" 
  },
};

export function UpgradeModal({
  open,
  onOpenChange,
  feature,
  title,
  description,
}: UpgradeModalProps) {
  const { tier: currentTier } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const featureContext = feature ? FEATURE_CONTEXTS[feature] : null;
  const displayTitle = title || featureContext?.title || "Unlock Premium Features";
  const displayDescription = description || featureContext?.benefit || 
    "Get complete access to all tools and resources to grow your laundromat business.";

  const tierConfig = PLATFORM_TIERS.all_access;

  const handleUpgradeClick = async () => {
    setIsLoading(true);
    
    trackConversion("upgrade_modal_checkout", tierConfig.price, { 
      feature,
      from: currentTier 
    });

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: "all_access",
          interval: "month",
          userId: user?.id || "",
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server error (${response.status})`);
      }
      
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Unable to start checkout",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border"
        data-testid="upgrade-modal"
      >
        <DialogHeader className="text-center pb-2">
          <div 
            className="mx-auto mb-3 p-3 rounded-xl bg-[#0A1628]"
            data-testid="upgrade-modal-icon"
          >
            <Crown className="h-6 w-6 text-[#C8A661]" />
          </div>
          
          {feature && (
            <Badge 
              className="mx-auto mb-2 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30"
              data-testid="upgrade-modal-feature-badge"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {displayTitle}
            </Badge>
          )}
          
          <DialogTitle 
            className="text-2xl font-bold text-card-foreground"
            data-testid="upgrade-modal-title"
          >
            Upgrade to Business
          </DialogTitle>
          <DialogDescription 
            className="text-muted-foreground"
            data-testid="upgrade-modal-description"
          >
            {displayDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-6 py-3">
          {TRUST_BADGES.map((badge, i) => (
            <div 
              key={i} 
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
              data-testid={`upgrade-modal-trust-badge-${i}`}
            >
              <badge.icon className="h-3.5 w-3.5 text-[#C8A661]" />
              <span>{badge.text}</span>
            </div>
          ))}
        </div>

        <Card 
          className="border-[#C8A661]/30 bg-gradient-to-br from-[#0A1628]/5 to-[#C8A661]/5"
          data-testid="upgrade-modal-price-card"
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#C8A661] to-[#B8964F]">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground">{tierConfig.name}</h3>
                  <p className="text-sm text-muted-foreground">{tierConfig.tagline}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-card-foreground">
                  ${tierConfig.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <Badge className="bg-[#C8A661] text-[#0A1628] border-0 text-xs">
                  BEST VALUE
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-2 text-xs mb-4">
              <div className="font-medium text-muted-foreground">Feature</div>
              <div className="text-center font-medium text-muted-foreground">Free</div>
              <div className="text-center font-medium text-[#C8A661]">Business</div>
            </div>

            <div 
              className="space-y-2 max-h-[200px] overflow-y-auto pr-2"
              data-testid="upgrade-modal-comparison"
            >
              {PLAN_COMPARISON.map((row, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "grid grid-cols-3 gap-2 text-sm py-1.5 rounded",
                    row.highlight && "bg-[#C8A661]/5"
                  )}
                  data-testid={`upgrade-modal-comparison-row-${i}`}
                >
                  <div className="text-card-foreground text-xs">{row.feature}</div>
                  <div className="text-center">
                    {typeof row.free === "boolean" ? (
                      row.free ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">{row.free}</span>
                    )}
                  </div>
                  <div className="text-center">
                    {typeof row.allAccess === "boolean" ? (
                      row.allAccess ? (
                        <Check className="h-4 w-4 text-[#C8A661] mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs font-medium text-[#C8A661]">{row.allAccess}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-border/50 bg-muted/30"
          data-testid="upgrade-modal-testimonial"
        >
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start gap-3">
              <Quote className="h-5 w-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-card-foreground italic mb-2">
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-[#C8A661] text-[#C8A661]" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    — {TESTIMONIALS[activeTestimonial].author}, {TESTIMONIALS[activeTestimonial].role}
                  </span>
                </div>
              </div>
            </div>
            
            {TESTIMONIALS.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      i === activeTestimonial ? "bg-[#C8A661]" : "bg-muted-foreground/30"
                    )}
                    onClick={() => setActiveTestimonial(i)}
                    data-testid={`upgrade-modal-testimonial-dot-${i}`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3 pt-2">
          <Button 
            onClick={handleUpgradeClick}
            disabled={isLoading}
            className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-12 group"
            data-testid="upgrade-modal-cta-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Checkout...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Get Business for ${tierConfig.price}/mo
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              30-day money-back guarantee
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Cancel anytime
            </div>
          </div>

          <div className="text-center">
            <Link href="/pricing">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground text-xs"
                data-testid="upgrade-modal-view-pricing-link"
              >
                View full pricing details
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Partial<UpgradeModalProps>>({});

  const openUpgradeModal = (props?: Partial<UpgradeModalProps>) => {
    setModalProps(props || {});
    setIsOpen(true);
    trackEvent("upgrade_modal_opened", "engagement", undefined, props);
  };

  const closeUpgradeModal = () => {
    setIsOpen(false);
    setModalProps({});
  };

  return {
    isOpen,
    openUpgradeModal,
    closeUpgradeModal,
    UpgradeModalComponent: () => (
      <UpgradeModal
        open={isOpen}
        onOpenChange={setIsOpen}
        {...modalProps}
      />
    ),
  };
}
