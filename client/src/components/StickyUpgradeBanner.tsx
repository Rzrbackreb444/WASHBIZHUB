import { useState, useEffect } from 'react';
import { X, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useSmartGating } from '@/hooks/useSmartGating';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_STORAGE_KEY = 'washbizhub_upgrade_banner_dismissed';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StickyUpgradeBannerProps {
  position?: 'bottom' | 'top';
  dismissible?: boolean;
  variant?: 'full' | 'compact';
}

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
  if (!dismissedAt) return false;
  
  const timestamp = parseInt(dismissedAt, 10);
  const now = Date.now();
  
  if (now - timestamp > DISMISS_DURATION_MS) {
    localStorage.removeItem(DISMISS_STORAGE_KEY);
    return false;
  }
  
  return true;
}

function setDismissed(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
}

export function StickyUpgradeBanner({
  position = 'bottom',
  dismissible = true,
  variant = 'full',
}: StickyUpgradeBannerProps) {
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  const calculatorGating = useSmartGating('calculator');
  const cleanbiGating = useSmartGating('cleanbi');
  
  const { isPro, isEnterprise, currentTier } = calculatorGating;

  useEffect(() => {
    setHasMounted(true);
    
    const timer = setTimeout(() => {
      if (!isDismissed() && !isPro && !isEnterprise) {
        setIsVisible(true);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [isPro, isEnterprise]);

  if (!hasMounted) return null;
  if (isPro || isEnterprise) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (dismissible) {
      setDismissed();
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const totalUsed = calculatorGating.usageInfo.used + cleanbiGating.usageInfo.used;
  const totalLimit = calculatorGating.usageInfo.limit + cleanbiGating.usageInfo.limit;
  const displayUsed = Math.min(totalUsed, totalLimit);

  const positionClasses = position === 'bottom' 
    ? 'bottom-0 left-0 right-0' 
    : 'top-0 left-0 right-0';

  const slideVariants = {
    hidden: position === 'bottom' 
      ? { y: '100%', opacity: 0 } 
      : { y: '-100%', opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: position === 'bottom' 
      ? { y: '100%', opacity: 0 } 
      : { y: '-100%', opacity: 0 },
  };

  if (variant === 'compact') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`fixed ${positionClasses} z-50`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            data-testid="banner-upgrade-sticky"
          >
            <div 
              className="bg-[#0A1628]/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
              style={{ boxShadow: position === 'bottom' ? '0 -4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.15)' }}
            >
              <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-white text-sm">
                  <TrendingUp className="h-4 w-4 text-[#C8A661]" />
                  <span data-testid="text-usage-summary">
                    {displayUsed} of {totalLimit} free tools used
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleUpgrade}
                    size="sm"
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] h-7 px-3"
                    data-testid="button-upgrade-sticky"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Upgrade
                  </Button>
                  
                  {dismissible && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDismiss}
                      className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                      data-testid="button-dismiss-banner"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses} z-50`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideVariants}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          data-testid="banner-upgrade-sticky"
        >
          <div 
            className="bg-[#0A1628]/95 backdrop-blur-sm"
            style={{ boxShadow: position === 'bottom' ? '0 -4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="hidden sm:flex h-10 w-10 rounded-full bg-[#C8A661]/20 items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <TrendingUp className="h-4 w-4 text-[#C8A661] sm:hidden" />
                      <span className="font-medium text-sm sm:text-base" data-testid="text-usage-summary">
                        You've used {displayUsed} of {totalLimit} free tools
                        {currentTier === 'free' && ' this month'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm mt-0.5" data-testid="text-benefit-teaser">
                      Upgrade for unlimited access + PDF exports
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    onClick={handleUpgrade}
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] flex-1 sm:flex-none"
                    data-testid="button-upgrade-sticky"
                  >
                    <Zap className="h-4 w-4 mr-1.5" />
                    Upgrade to Pro - $29/mo
                  </Button>
                  
                  {dismissible && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDismiss}
                      className="text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                      data-testid="button-dismiss-banner"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
