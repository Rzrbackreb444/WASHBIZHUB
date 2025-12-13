import { useState } from "react";
import { useSubscription, type SubscriptionTier } from "@/hooks/useSubscription";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Lock, Crown, Check, ArrowRight, Sparkles, Shield, Clock,
  Calculator, BookOpen, MapPin, Users, Zap, LayoutDashboard
} from "lucide-react";
import { Loader2 } from "lucide-react";

interface AccessGateProps {
  requiredTier: 'free' | 'pro' | 'business' | 'enterprise' | 'all_access';
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  inline?: boolean;
}

const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  "cleanbi-full": "Full CLEANBI Analysis",
  "cleanbi-unlimited": "Unlimited CLEANBI Analyses",
  "calculators-all": "Complete Calculator Suite",
  "book-access": "The Laundromat Bible",
  "courses-access": "Video Courses & Training",
  "design-studio": "Design Studio",
  "forum-post": "Community Forum",
  "service-guy-ai": "Service Guy AI",
  "ai-council-basic": "AI Consultation Council",
  "business-plan-generator": "AI Business Plan Generator",
  "due-diligence": "Due Diligence Toolkit",
  "bulk-analysis": "Bulk Location Analysis",
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  "cleanbi-full": "Get detailed location intelligence with AI-powered insights and recommendations.",
  "cleanbi-unlimited": "Analyze unlimited locations without restrictions.",
  "calculators-all": "Access 50+ professional calculators for ROI, valuation, and projections.",
  "book-access": "The complete 500+ page guide to buying, operating, and scaling laundromats.",
  "courses-access": "Expert-led video courses and certifications for laundromat mastery.",
  "design-studio": "Create professional 2D and 3D floor plans for your laundromat.",
  "forum-post": "Join 72,000+ professionals to share insights and get advice.",
  "service-guy-ai": "AI-powered equipment diagnostics and troubleshooting.",
  "ai-council-basic": "Get guidance from a panel of AI experts on any laundromat topic.",
  "business-plan-generator": "Generate SBA-ready business plans with AI assistance.",
  "due-diligence": "Comprehensive checklists and verification tools for acquisitions.",
  "bulk-analysis": "Analyze hundreds of locations at once with batch processing.",
};

const ALL_ACCESS_BENEFITS = [
  { icon: MapPin, text: "Unlimited CLEANBI location analyses" },
  { icon: Calculator, text: "50+ professional calculators" },
  { icon: BookOpen, text: "Complete book & video courses" },
  { icon: LayoutDashboard, text: "Design Studio (2D/3D plans)" },
  { icon: Users, text: "Full forum & community access" },
  { icon: Zap, text: "AI tools & priority support" },
];

export function AccessGate({
  requiredTier,
  feature,
  children,
  fallback,
  inline = false,
}: AccessGateProps) {
  const { canAccessTier, isLoading } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Map 'all_access' to 'business' for backwards compatibility
  const effectiveTier = requiredTier === 'all_access' ? 'business' : requiredTier;
  const hasAccess = canAccessTier(effectiveTier as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureName = FEATURE_DISPLAY_NAMES[feature] || feature;
  const featureDescription = FEATURE_DESCRIPTIONS[feature] || "Upgrade to access this premium feature.";

  if (inline) {
    return (
      <div className="relative">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/50 z-10 flex items-center justify-center rounded-lg">
          <div className="text-center p-6 max-w-sm">
            <div className="mx-auto mb-4 p-3 rounded-full bg-[#C8A661]/10 w-fit">
              <Lock className="h-6 w-6 text-[#C8A661]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{featureName}</h3>
            <p className="text-sm text-muted-foreground mb-4">{featureDescription}</p>
            <Link href="/pricing">
              <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid={`button-upgrade-${feature}`}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Business
              </Button>
            </Link>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={() => setShowModal(true)}
        data-testid={`access-gate-trigger-${feature}`}
      >
        <div className="relative">
          <div className="absolute inset-0 backdrop-blur-sm bg-background/50 z-10 flex items-center justify-center rounded-lg">
            <div className="text-center p-6">
              <div className="mx-auto mb-3 p-3 rounded-full bg-[#C8A661]/10 w-fit">
                <Lock className="h-5 w-5 text-[#C8A661]" />
              </div>
              <Badge className="bg-[#C8A661] text-[#0A1628] mb-2">
                <Crown className="h-3 w-3 mr-1" />
                Business Feature
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">Click to learn more</p>
            </div>
          </div>
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
        </div>
      </div>

      <UpgradeModal
        open={showModal}
        onOpenChange={setShowModal}
        feature={feature}
        featureName={featureName}
        featureDescription={featureDescription}
      />
    </>
  );
}

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  featureName: string;
  featureDescription: string;
}

function UpgradeModal({
  open,
  onOpenChange,
  feature,
  featureName,
  featureDescription,
}: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-[#C8A661]/20 to-[#C8A661]/5 w-fit">
            <Crown className="h-8 w-8 text-[#C8A661]" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-foreground">
            Unlock {featureName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {featureDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#C8A661] to-[#B8964F]">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Business</h3>
                  <p className="text-xs text-muted-foreground">Most Popular</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  $149<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {ALL_ACCESS_BENEFITS.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="p-1 rounded bg-[#C8A661]/10 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-[#C8A661]" />
                  </div>
                  <span className="text-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/pricing">
            <Button 
              className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-12 group"
              data-testid={`button-upgrade-modal-cta-${feature}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Business
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              30-day guarantee
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Cancel anytime
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AccessGate;
