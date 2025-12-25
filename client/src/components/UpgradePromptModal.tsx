import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, ArrowRight, X } from 'lucide-react';
import { useLocation } from 'wouter';
import type { GatingTier } from '@/lib/feature-gating-config';

interface UpgradePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  currentTier: GatingTier;
  onUpgrade?: () => void;
  onSignup?: () => void;
}

const PRO_FEATURES = [
  'Unlimited CLEANBI analyses',
  'All 50+ calculators',
  'Unlimited PDF exports',
  'Template Vault access',
  'AI Business Plan Generator',
  'Service Guy AI diagnostics',
  'Priority support',
];

const TEASER_BENEFITS = [
  'Create a free account to save your work',
  'Get 3 free analyses per month',
  'Access to basic calculators',
  'Browse the marketplace',
];

export function UpgradePromptModal({
  open,
  onOpenChange,
  featureName,
  currentTier,
  onUpgrade,
  onSignup,
}: UpgradePromptModalProps) {
  const [, navigate] = useLocation();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
    onOpenChange(false);
  };

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      navigate('/signup');
    }
    onOpenChange(false);
  };

  const isAnonymous = currentTier === 'teaser';
  const formatFeatureName = featureName.replace(/([A-Z])/g, ' $1').trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        data-testid="modal-upgrade-prompt"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[#C8A661]" />
            </div>
          </div>
          
          <DialogTitle 
            className="text-xl font-bold mt-4"
            data-testid="text-modal-title"
          >
            {isAnonymous 
              ? 'Continue Your Analysis'
              : `Unlock Unlimited ${formatFeatureName}`
            }
          </DialogTitle>
          
          <DialogDescription data-testid="text-modal-description">
            {isAnonymous 
              ? "You've used your free trial. Create an account or upgrade to continue."
              : `You've reached your monthly limit. Upgrade to Pro for unlimited ${formatFeatureName.toLowerCase()}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isAnonymous ? (
            <>
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]">
                    Free Account
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {TEASER_BENEFITS.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleSignup}
                  variant="outline"
                  className="w-full mt-4 border-[#0A1628] text-[#0A1628]"
                  data-testid="button-create-account"
                >
                  Create Free Account
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
            </>
          ) : null}

          <div className="rounded-lg border-2 border-[#C8A661] p-4 bg-[#C8A661]/5">
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-[#C8A661] text-[#0A1628]">
                <Zap className="h-3 w-3 mr-1" />
                Pro
              </Badge>
              <div className="text-right">
                <span className="text-2xl font-bold">$24</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
            </div>
            
            <ul className="space-y-2 mb-4">
              {PRO_FEATURES.slice(0, 5).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-[#C8A661] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleUpgrade}
              className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
              data-testid="button-upgrade-modal"
            >
              Upgrade to Pro
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-3">
              30-day money-back guarantee
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface QuickUpgradePromptProps {
  show: boolean;
  featureName: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export function QuickUpgradePrompt({
  show,
  featureName,
  onUpgrade,
  onDismiss,
}: QuickUpgradePromptProps) {
  const [, navigate] = useLocation();

  if (!show) return null;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300"
      data-testid="prompt-quick-upgrade"
    >
      <div className="rounded-lg bg-[#0A1628] text-white p-4 shadow-xl border border-[#C8A661]/20">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-[#C8A661]" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm mb-1">Unlock more {featureName}</p>
            <p className="text-xs text-gray-300 mb-3">
              Upgrade to Pro for unlimited access and premium features.
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleUpgrade}
                size="sm"
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                data-testid="button-upgrade-quick"
              >
                Upgrade
              </Button>
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                  data-testid="button-dismiss-quick"
                >
                  Later
                </Button>
              )}
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-white"
              data-testid="button-close-quick"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
