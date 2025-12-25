import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, Crown, Building2, Check, ArrowRight, Sparkles,
  MapPin, Calculator, TrendingUp, Users, Shield, Clock, Loader2
} from "lucide-react";
import { useSubscription, type SubscriptionTier } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { PLATFORM_TIERS, type PlatformTier } from "@/lib/tier-config";
import { trackEvent, trackConversion } from "@/lib/user-journey";
import { useToast } from "@/hooks/use-toast";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  suggestedTier?: PlatformTier;
  title?: string;
  description?: string;
}

// Default tier config for safety
const DEFAULT_TIER_CONFIG = {
  name: "Pro",
  tagline: "Everything you need to succeed",
  price: 29,
  iconBg: "bg-[#C8A661]/10",
  iconColor: "text-[#C8A661]",
  popular: true
};

const TIER_ICONS = {
  free: Zap,
  pro: Crown,
  enterprise: Building2,
};

const UPGRADE_BENEFITS = {
  pro: [
    { icon: MapPin, text: "Unlimited CLEANBI location analyses" },
    { icon: Calculator, text: "All 50+ professional calculators" },
    { icon: Shield, text: "Unlimited PDF exports & reports" },
    { icon: TrendingUp, text: "Template Vault full access" },
    { icon: Star, text: "Priority support & forum posting" },
  ],
  enterprise: [
    { icon: Building2, text: "API access for integrations" },
    { icon: Shield, text: "White-label reports & branding" },
    { icon: Users, text: "Team collaboration (10+ seats)" },
    { icon: Star, text: "Dedicated account manager" },
  ]
};

export function UpgradeModal({
  open,
  onOpenChange,
  feature,
  suggestedTier = "pro",
  title,
  description
}: UpgradeModalProps) {
  const { tier: currentTier } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  // Always suggest pro since that's our main paid tier
  const [selectedTier, setSelectedTier] = useState<PlatformTier>(suggestedTier === 'free' ? 'pro' : (suggestedTier || 'pro'));
  const [isLoading, setIsLoading] = useState(false);
  
  // Safely get tier config with fallback
  const tierConfig = PLATFORM_TIERS[selectedTier] || PLATFORM_TIERS.pro;
  const TierIcon = TIER_ICONS[selectedTier] || Crown;
  const benefits = UPGRADE_BENEFITS[selectedTier] || UPGRADE_BENEFITS.pro;

  const handleUpgradeClick = async () => {
    setIsLoading(true);
    
    trackConversion("upgrade_modal_click", tierConfig.price, { 
      tier: selectedTier, 
      feature,
      from: currentTier 
    });

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: selectedTier,
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
        const errorMessage = data?.error || data?.message || `Server error (${response.status})`;
        throw new Error(errorMessage);
      }
      
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
      
      const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
      
      toast({
        title: isNetworkError ? "Connection Error" : "Checkout Error",
        description: isNetworkError 
          ? "Unable to connect to the server. Please check your internet connection and try again."
          : errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const currentTierPrice = PLATFORM_TIERS[currentTier as PlatformTier]?.price || 0;
  const availableTiers: PlatformTier[] = (["pro", "enterprise"] as PlatformTier[]).filter(
    t => {
      const config = PLATFORM_TIERS[t];
      return config && config.price > currentTierPrice;
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 rounded-full bg-accent/10 w-fit">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            {title || "Unlock Premium Features"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description || "Upgrade to access advanced tools and grow your business faster."}
          </DialogDescription>
        </DialogHeader>

        {availableTiers.length > 1 && (
          <div className="flex justify-center gap-2 py-2">
            {availableTiers.map((tier) => {
              const config = PLATFORM_TIERS[tier];
              return (
                <Button
                  key={tier}
                  variant={selectedTier === tier ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTier(tier)}
                  className={selectedTier === tier ? "bg-accent text-accent-foreground" : ""}
                  data-testid={`button-select-tier-${tier}`}
                >
                  {config.name}
                </Button>
              );
            })}
          </div>
        )}

        <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tierConfig.iconBg}`}>
                  <TierIcon className={`h-5 w-5 ${tierConfig.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{tierConfig.name}</h3>
                  <p className="text-sm text-muted-foreground">{tierConfig.tagline}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-card-foreground">
                  ${tierConfig.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                {tierConfig.popular && (
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                    Most Popular
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="p-1 rounded bg-accent/10">
                    <benefit.icon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="text-card-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 pt-2">
          <Button 
            onClick={handleUpgradeClick}
            disabled={isLoading}
            className="w-full btn-premium-gold text-white font-semibold h-12 group"
            data-testid="button-upgrade-modal-cta"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Checkout...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Get Started Now
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
          
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
