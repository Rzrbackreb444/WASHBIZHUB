import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, MapPin, Palette, Wrench, ArrowRight, ArrowLeft, X,
  Calculator, ShoppingBag, CreditCard, ChevronRight, Store,
  TrendingUp, DollarSign, Users, Briefcase, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ONBOARDING_STORAGE_KEY = 'hasSeenOnboarding';
const PERSONA_STORAGE_KEY = 'userPersona';

interface OnboardingFlowProps {
  forceOpen?: boolean;
  onComplete?: () => void;
}

interface Persona {
  id: string;
  icon: typeof Store;
  title: string;
  description: string;
  color: string;
  dashboardPath: string;
}

interface Tool {
  icon: typeof MapPin;
  title: string;
  description: string;
  color: string;
}

interface QuickAction {
  icon: typeof Calculator;
  title: string;
  path: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'buyer',
    icon: ShoppingBag,
    title: 'Buy a Laundromat',
    description: 'Find and analyze properties to purchase',
    color: 'bg-blue-500',
    dashboardPath: '/buyer-dashboard',
  },
  {
    id: 'seller',
    icon: DollarSign,
    title: 'Sell My Laundromat',
    description: 'List and market your business for sale',
    color: 'bg-green-500',
    dashboardPath: '/seller-dashboard',
  },
  {
    id: 'operator',
    icon: Store,
    title: 'Operate & Grow',
    description: 'Manage operations and increase profits',
    color: 'bg-purple-500',
    dashboardPath: '/operator-dashboard',
  },
  {
    id: 'investor',
    icon: TrendingUp,
    title: 'Invest & Analyze',
    description: 'Evaluate deals and portfolio opportunities',
    color: 'bg-amber-500',
    dashboardPath: '/investor-dashboard',
  },
  {
    id: 'service',
    icon: Wrench,
    title: 'Service & Repair',
    description: 'Equipment diagnostics and maintenance',
    color: 'bg-orange-500',
    dashboardPath: '/service-guy-ai',
  },
];

const TOOLS: Tool[] = [
  {
    icon: MapPin,
    title: 'CLEANBI Explorer',
    description: 'AI-powered location analysis and scoring for any address',
    color: 'bg-blue-500',
  },
  {
    icon: Palette,
    title: 'Design Studio',
    description: 'Create stunning 3D laundromat floor plans',
    color: 'bg-purple-500',
  },
  {
    icon: Wrench,
    title: 'Service Guy AI',
    description: 'Instant equipment diagnostics and repair guidance',
    color: 'bg-orange-500',
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: Calculator,
    title: 'Try CLEANBI',
    path: '/cleanbi-explorer',
  },
  {
    icon: ShoppingBag,
    title: 'Browse Marketplace',
    path: '/laundromat-listings',
  },
  {
    icon: CreditCard,
    title: 'View Pricing',
    path: '/pricing',
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export function OnboardingFlow({ forceOpen = false, onComplete }: OnboardingFlowProps) {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const totalSteps = 4;

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    try {
      const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!hasSeenOnboarding) {
        setIsOpen(true);
      }
    } catch (error) {
      console.warn('Failed to check onboarding status:', error);
    }
  }, [forceOpen]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      if (selectedPersona) {
        localStorage.setItem(PERSONA_STORAGE_KEY, selectedPersona);
      }
    } catch (error) {
      console.warn('Failed to save onboarding status:', error);
    }
    setIsOpen(false);
    onComplete?.();
    
    if (selectedPersona) {
      const persona = PERSONAS.find(p => p.id === selectedPersona);
      if (persona) {
        setLocation(persona.dashboardPath);
      }
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('Failed to save onboarding status:', error);
    }
    setIsOpen(false);
    onComplete?.();
  };

  const handleQuickAction = (path: string) => {
    handleComplete();
    setLocation(path);
  };

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
  };

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden border-0 bg-white dark:bg-[#0A1628]" 
        data-testid="dialog-onboarding"
      >
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-10 text-muted-foreground hover:text-foreground"
            onClick={handleSkip}
            data-testid="button-skip-onboarding"
          >
            <X className="w-4 h-4" />
          </Button>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="p-6 pt-10"
            >
              {currentStep === 0 && (
                <div className="text-center space-y-6" data-testid="step-welcome">
                  <motion.div {...fadeInUp} className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-[#1e3a5f] flex items-center justify-center shadow-lg">
                      <Sparkles className="w-10 h-10 text-[#C8A661]" />
                    </div>
                    <div>
                      <h2 
                        className="text-2xl font-bold text-[#1e3a5f] dark:text-white"
                        data-testid="text-welcome-title"
                      >
                        Welcome to WashBizHub!
                      </h2>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        The #1 platform for the laundromat industry. Buy, sell, operate, and grow your laundromat business.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    {...fadeInUp}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div className="bg-muted/50 dark:bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-[#C8A661]" data-testid="text-stat-professionals">73K+</p>
                      <p className="text-[10px] text-muted-foreground">Community</p>
                    </div>
                    <div className="bg-muted/50 dark:bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-[#C8A661]" data-testid="text-stat-analyzed">$50M+</p>
                      <p className="text-[10px] text-muted-foreground">Analyzed</p>
                    </div>
                    <div className="bg-muted/50 dark:bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-[#C8A661]" data-testid="text-stat-tools">50+</p>
                      <p className="text-[10px] text-muted-foreground">Pro Tools</p>
                    </div>
                  </motion.div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-5" data-testid="step-persona-select">
                  <div className="text-center">
                    <h2 
                      className="text-2xl font-bold text-[#1e3a5f] dark:text-white"
                      data-testid="text-persona-title"
                    >
                      What brings you here?
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Select your primary goal to personalize your experience
                    </p>
                  </div>

                  <div className="space-y-2">
                    {PERSONAS.map((persona, index) => {
                      const Icon = persona.icon;
                      const isSelected = selectedPersona === persona.id;
                      return (
                        <motion.button
                          key={persona.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handlePersonaSelect(persona.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                            isSelected 
                              ? "bg-[#C8A661]/20 border-2 border-[#C8A661]" 
                              : "bg-muted/30 dark:bg-white/5 hover:bg-muted/50 dark:hover:bg-white/10 border-2 border-transparent"
                          )}
                          data-testid={`persona-${persona.id}`}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            persona.color
                          )}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-sm text-foreground">{persona.title}</h3>
                            <p className="text-xs text-muted-foreground">{persona.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#C8A661] flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5" data-testid="step-explore-tools">
                  <div className="text-center">
                    <h2 
                      className="text-2xl font-bold text-[#1e3a5f] dark:text-white"
                      data-testid="text-explore-title"
                    >
                      Explore Our Tools
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Powerful features to grow your business
                    </p>
                  </div>

                  <div className="space-y-3">
                    {TOOLS.map((tool, index) => {
                      const Icon = tool.icon;
                      return (
                        <motion.div
                          key={tool.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 dark:bg-white/5 hover-elevate"
                          data-testid={`tool-${index}`}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            tool.color
                          )}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-foreground">{tool.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5" data-testid="step-get-started">
                  <div className="text-center">
                    <h2 
                      className="text-2xl font-bold text-[#1e3a5f] dark:text-white"
                      data-testid="text-get-started-title"
                    >
                      Get Started
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Jump right in with these quick actions
                    </p>
                  </div>

                  <div className="space-y-2">
                    {QUICK_ACTIONS.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={action.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleQuickAction(action.path)}
                          className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5 hover:bg-muted/50 dark:hover:bg-white/10 transition-colors group"
                          data-testid={`quick-action-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[#C8A661]" />
                            </div>
                            <span className="font-medium text-foreground">{action.title}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#C8A661] transition-colors" />
                        </motion.button>
                      );
                    })}
                  </div>

                  {selectedPersona && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center pt-2"
                    >
                      <p className="text-xs text-muted-foreground">
                        Or go to your personalized{' '}
                        <span className="text-[#C8A661] font-medium">
                          {PERSONAS.find(p => p.id === selectedPersona)?.title} Dashboard
                        </span>
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="px-6 pb-6 space-y-4">
            <div className="flex justify-center gap-2" data-testid="navigation-dots">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentStep === index 
                      ? "w-6 bg-[#C8A661]" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  data-testid={`dot-${index}`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="w-24">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    className="text-muted-foreground"
                    data-testid="button-previous"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
                data-testid="button-skip"
              >
                Skip
              </Button>

              <div className="w-24 flex justify-end">
                {currentStep < totalSteps - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                    data-testid="button-next"
                    disabled={currentStep === 1 && !selectedPersona}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleComplete}
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#1e3a5f] font-semibold"
                    data-testid="button-complete"
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getUserPersona(): string | null {
  try {
    return localStorage.getItem(PERSONA_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setUserPersona(persona: string): void {
  try {
    localStorage.setItem(PERSONA_STORAGE_KEY, persona);
  } catch (error) {
    console.warn('Failed to save persona:', error);
  }
}

export default OnboardingFlow;
