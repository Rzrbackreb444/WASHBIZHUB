import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Lock, Sparkles, ArrowRight, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePremiumGating } from "@/hooks/usePremiumGating";
import { trackEvent } from "@/lib/user-journey";
import { cn } from "@/lib/utils";

export interface PremiumGateProps {
  children: React.ReactNode;
  isPremium?: boolean;
  previewPercent?: number;
  featureName?: string;
  benefits?: string[];
  title?: string;
  description?: string;
  className?: string;
  showLearnMore?: boolean;
  onUpgradeClick?: () => void;
}

const DEFAULT_BENEFITS = [
  "Unlimited access to all premium features",
  "Full CLEANBI location analyses",
  "80+ professional calculators",
  "Priority support & PDF exports",
];

export function PremiumGate({
  children,
  isPremium: isPremiumOverride,
  previewPercent = 30,
  featureName = "premium-content",
  benefits = DEFAULT_BENEFITS,
  title = "Upgrade to unlock full access",
  description = "Get complete insights and data to make informed decisions",
  className,
  showLearnMore = true,
  onUpgradeClick,
}: PremiumGateProps) {
  const { isPremium: isPremiumFromHook, isLoading, openUpgradeModalFor } = usePremiumGating();
  const hasTrackedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPremium = isPremiumOverride !== undefined ? isPremiumOverride : isPremiumFromHook;

  useEffect(() => {
    if (!isLoading && !isPremium && !hasTrackedRef.current) {
      trackEvent("premium_gate_shown", "engagement", undefined, { 
        featureName, 
        previewPercent 
      });
      hasTrackedRef.current = true;
    }
  }, [isLoading, isPremium, featureName, previewPercent]);

  const handleUpgradeClick = () => {
    trackEvent("premium_gate_upgrade_click", "conversion", undefined, { featureName });
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      openUpgradeModalFor(featureName);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("relative min-h-[200px]", className)}>
        <div className="absolute inset-0 bg-muted/30 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      data-testid="premium-gate-container"
    >
      <div 
        className="relative"
        style={{
          maskImage: `linear-gradient(to bottom, black 0%, black ${previewPercent - 10}%, transparent ${previewPercent + 15}%)`,
          WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${previewPercent - 10}%, transparent ${previewPercent + 15}%)`,
        }}
      >
        {children}
      </div>

      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, 
            transparent 0%, 
            transparent ${Math.max(0, previewPercent - 15)}%, 
            rgba(10, 22, 40, 0.03) ${previewPercent}%,
            rgba(10, 22, 40, 0.08) ${previewPercent + 10}%,
            rgba(10, 22, 40, 0.15) ${previewPercent + 20}%,
            rgba(10, 22, 40, 0.25) 100%
          )`,
        }}
        data-testid="premium-gate-blur-overlay"
      />

      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-auto"
        style={{ 
          top: `${Math.max(previewPercent - 5, 20)}%`,
          background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 30%)',
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%)',
          }}
        />

        <div className="relative pt-16 pb-8 px-6 flex flex-col items-center text-center">
          <div 
            className="mb-4 p-3 rounded-xl bg-[#0A1628] shadow-lg"
            data-testid="premium-gate-lock-icon"
          >
            <Lock className="h-6 w-6 text-[#C8A661]" />
          </div>

          <Badge 
            className="mb-3 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30"
            data-testid="premium-gate-badge"
          >
            <Crown className="h-3 w-3 mr-1" />
            All-Access Feature
          </Badge>

          <h3 
            className="text-xl md:text-2xl font-bold text-foreground mb-2"
            data-testid="premium-gate-title"
          >
            {title}
          </h3>
          
          <p 
            className="text-muted-foreground text-sm md:text-base max-w-md mb-6"
            data-testid="premium-gate-description"
          >
            {description}
          </p>

          {benefits.length > 0 && (
            <ul 
              className="text-left space-y-2 mb-6 max-w-sm"
              data-testid="premium-gate-benefits-list"
            >
              {benefits.slice(0, 4).map((benefit, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                  data-testid={`premium-gate-benefit-${index}`}
                >
                  <div className="mt-0.5 p-0.5 rounded bg-[#C8A661]/20">
                    <Check className="h-3 w-3 text-[#C8A661]" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/pricing">
              <Button 
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold px-6 group"
                onClick={handleUpgradeClick}
                data-testid="premium-gate-upgrade-button"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            {showLearnMore && (
              <Link href="/pricing">
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="premium-gate-learn-more-link"
                >
                  Learn more about pricing
                </Button>
              </Link>
            )}
          </div>

          <p 
            className="mt-4 text-xs text-muted-foreground"
            data-testid="premium-gate-guarantee"
          >
            30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

export function PremiumGateInline({
  featureName,
  title = "Premium Feature",
  className,
}: {
  featureName: string;
  title?: string;
  className?: string;
}) {
  const { isPremium, openUpgradeModalFor } = usePremiumGating();

  if (isPremium) return null;

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg bg-[#0A1628]/5 border border-[#C8A661]/20",
        className
      )}
      data-testid={`premium-gate-inline-${featureName}`}
    >
      <div className="p-2 rounded-lg bg-[#0A1628]">
        <Lock className="h-4 w-4 text-[#C8A661]" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">Upgrade to access this feature</p>
      </div>
      <Button 
        size="sm"
        className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
        onClick={() => {
          trackEvent("premium_gate_inline_click", "conversion", undefined, { featureName });
          openUpgradeModalFor(featureName);
        }}
        data-testid={`premium-gate-inline-upgrade-${featureName}`}
      >
        Upgrade
      </Button>
    </div>
  );
}

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <Badge 
      className={cn(
        "bg-gradient-to-r from-[#C8A661] to-[#B8964F] text-[#0A1628] border-0",
        className
      )}
      data-testid="premium-badge"
    >
      <Crown className="h-3 w-3 mr-1" />
      PRO
    </Badge>
  );
}
