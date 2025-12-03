import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, Target, ArrowRight, ArrowLeft, X, Check, Star, 
  Lightbulb, Settings, Users, Calculator, BookOpen, Chrome,
  MapPin, DollarSign, Wrench, Layout, ShoppingBag, Megaphone,
  ListPlus, Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserJourney } from '@/hooks/useUserJourney';

type OnboardingStep = 'welcome' | 'journey' | 'experience' | 'recommendations';

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type JourneyType = 'plan' | 'evaluate' | 'operate' | 'partner';

interface Journey {
  id: JourneyType;
  label: string;
  title: string;
  description: string;
  icon: typeof Lightbulb;
  color: string;
  bgColor: string;
  borderColor: string;
}

const JOURNEYS: Journey[] = [
  {
    id: 'plan',
    label: 'PLAN',
    title: "I'm Thinking About Buying",
    description: "I'm researching if owning a laundromat is right for me",
    icon: Lightbulb,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
  },
  {
    id: 'evaluate',
    label: 'EVALUATE',
    title: "I'm Ready to Buy",
    description: "I'm actively searching for a laundromat to purchase",
    icon: Target,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-500',
  },
  {
    id: 'operate',
    label: 'OPERATE',
    title: "I Already Own One",
    description: "I own a laundromat and want to run it better",
    icon: Settings,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
  },
  {
    id: 'partner',
    label: 'PARTNER',
    title: "I Sell or Provide Services",
    description: "I'm an equipment vendor, broker, or service provider",
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: "I'm new to the laundromat industry",
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: "I have some experience or own 1-2 locations",
  },
  {
    id: 'expert',
    label: 'Expert',
    description: 'I own multiple locations or have 5+ years experience',
  },
];

interface Recommendation {
  title: string;
  description: string;
  path: string;
  icon: typeof Calculator;
  priority: 'high' | 'medium';
  isExternal?: boolean;
}

const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/cleanbi-anywhere';

function getRecommendationsByJourney(journey: JourneyType): Recommendation[] {
  const recommendationsByJourney: Record<JourneyType, Recommendation[]> = {
    plan: [
      {
        title: 'Calculate Your ROI',
        description: 'Estimate potential returns on your investment',
        path: '/calculators',
        icon: Calculator,
        priority: 'high',
      },
      {
        title: 'Explore Funding Options',
        description: 'Find financing for your laundromat purchase',
        path: '/startup-funding',
        icon: DollarSign,
        priority: 'high',
      },
      {
        title: 'Read The Laundromat Bible',
        description: 'Master the industry with our comprehensive guide',
        path: '/book',
        icon: BookOpen,
        priority: 'medium',
      },
      {
        title: 'Install Chrome Extension',
        description: 'Get CLEANBI scores on BizBuySell & LoopNet',
        path: CHROME_EXTENSION_URL,
        icon: Chrome,
        priority: 'medium',
        isExternal: true,
      },
    ],
    evaluate: [
      {
        title: 'Score a Location with CLEANBI',
        description: 'AI-powered location analysis and scoring',
        path: '/cleanbi-explorer',
        icon: MapPin,
        priority: 'high',
      },
      {
        title: 'Browse Laundromats for Sale',
        description: 'Find listings in your target market',
        path: '/laundromat-listings',
        icon: Store,
        priority: 'high',
      },
      {
        title: 'Use Valuation Calculator',
        description: 'Determine fair market value before buying',
        path: '/valuation-calculator',
        icon: Calculator,
        priority: 'high',
      },
      {
        title: 'Install Chrome Extension',
        description: 'Get CLEANBI scores on BizBuySell & LoopNet',
        path: CHROME_EXTENSION_URL,
        icon: Chrome,
        priority: 'medium',
        isExternal: true,
      },
    ],
    operate: [
      {
        title: 'Set Up Your POS',
        description: 'Modern point-of-sale for your laundromat',
        path: '/pos',
        icon: DollarSign,
        priority: 'high',
      },
      {
        title: 'Try Service Guy AI',
        description: 'AI-powered equipment diagnostics & repair guides',
        path: '/service-guy-ai',
        icon: Wrench,
        priority: 'high',
      },
      {
        title: 'Design Your Layout',
        description: 'Optimize your floor plan with our 3D studio',
        path: '/design-studio-pro',
        icon: Layout,
        priority: 'medium',
      },
      {
        title: 'Browse Equipment',
        description: 'Find new and used equipment for your store',
        path: '/equipment',
        icon: ShoppingBag,
        priority: 'medium',
      },
    ],
    partner: [
      {
        title: 'List Equipment for Sale',
        description: 'Sell your equipment to our network',
        path: '/list-equipment',
        icon: ListPlus,
        priority: 'high',
      },
      {
        title: 'List Your Laundromat',
        description: 'Create a listing for your laundromat',
        path: '/listing-form',
        icon: Store,
        priority: 'high',
      },
      {
        title: 'Become a Vendor',
        description: 'Join our vendor network',
        path: '/vendor-form',
        icon: Users,
        priority: 'medium',
      },
      {
        title: 'View Advertising Options',
        description: 'Reach thousands of laundromat owners',
        path: '/advertise',
        icon: Megaphone,
        priority: 'medium',
      },
    ],
  };

  return recommendationsByJourney[journey] || [];
}

const JOURNEY_STORAGE_KEY = 'washbizhub_user_journey_type';

function saveJourneyToStorage(journey: JourneyType): void {
  try {
    localStorage.setItem(JOURNEY_STORAGE_KEY, journey);
  } catch (error) {
    console.warn('Failed to save journey to localStorage:', error);
  }
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [, setLocation] = useLocation();
  const { updateOnboarding, setGoals: setJourneyGoals, setExperience: setJourneyExperience, trackEvent } = useUserJourney(false);
  
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedJourney, setSelectedJourney] = useState<JourneyType | ''>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const steps: OnboardingStep[] = ['welcome', 'journey', 'experience', 'recommendations'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    updateOnboarding(currentStepIndex);
  }, [currentStepIndex, updateOnboarding]);

  useEffect(() => {
    if (step === 'recommendations' && selectedJourney) {
      const recs = getRecommendationsByJourney(selectedJourney);
      setRecommendations(recs);
    }
  }, [step, selectedJourney]);

  const handleJourneySelect = (journey: JourneyType) => {
    setSelectedJourney(journey);
    trackEvent('journey_selected', 'action', 10, { journey });
    saveJourneyToStorage(journey);
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
      
      if (steps[nextIndex] === 'recommendations') {
        setJourneyGoals([selectedJourney]);
        setJourneyExperience(selectedExperience);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleComplete = () => {
    updateOnboarding(steps.length - 1, true);
    trackEvent('onboarding_complete', 'conversion', 20);
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    trackEvent('onboarding_skipped', 'action');
    onClose();
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    trackEvent('recommendation_clicked', 'action', 5, { 
      title: rec.title, 
      path: rec.path,
      journey: selectedJourney 
    });
    
    if (rec.isExternal) {
      window.open(rec.path, '_blank');
    } else {
      handleComplete();
      setLocation(rec.path);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'welcome':
        return true;
      case 'journey':
        return selectedJourney !== '';
      case 'experience':
        return selectedExperience !== '';
      case 'recommendations':
        return true;
      default:
        return false;
    }
  };

  const getSelectedJourneyData = () => {
    return JOURNEYS.find(j => j.id === selectedJourney);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-onboarding">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {step === 'welcome' && 'Welcome to WashBizHub!'}
                {step === 'journey' && "What's your journey?"}
                {step === 'experience' && 'Your experience level'}
                {step === 'recommendations' && 'Your personalized plan'}
              </DialogTitle>
              <DialogDescription>
                {step === 'welcome' && "Let's get you set up for success"}
                {step === 'journey' && 'Select the option that best describes you'}
                {step === 'experience' && 'Help us tailor your experience'}
                {step === 'recommendations' && 'Based on your journey, we recommend:'}
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSkip}
              data-testid="button-skip-onboarding"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-onboarding" />
          </div>
        </DialogHeader>

        <div className="py-4">
          {step === 'welcome' && (
            <div className="space-y-6" data-testid="step-welcome">
              <div className="text-center py-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2" data-testid="text-welcome-title">
                  Your Laundromat Success Journey Starts Here
                </h3>
                <p className="text-muted-foreground text-sm">
                  WashBizHub is your all-in-one platform for buying, selling, and operating 
                  successful laundromats. Let us personalize your experience.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-professionals">72K+</p>
                  <p className="text-xs text-muted-foreground">Professionals</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-analyzed">$50M+</p>
                  <p className="text-xs text-muted-foreground">Analyzed</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-countries">220+</p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
              </div>
            </div>
          )}

          {step === 'journey' && (
            <div className="space-y-3" data-testid="step-journey">
              <RadioGroup 
                value={selectedJourney} 
                onValueChange={(value) => handleJourneySelect(value as JourneyType)}
                className="space-y-3"
              >
                {JOURNEYS.map((journey) => {
                  const Icon = journey.icon;
                  const isSelected = selectedJourney === journey.id;
                  
                  return (
                    <Card
                      key={journey.id}
                      className={cn(
                        "cursor-pointer transition-all hover-elevate",
                        isSelected && `${journey.borderColor} border-2 ${journey.bgColor}`
                      )}
                      onClick={() => handleJourneySelect(journey.id)}
                      data-testid={`journey-${journey.id}`}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <RadioGroupItem 
                          value={journey.id} 
                          id={journey.id}
                          data-testid={`radio-journey-${journey.id}`}
                        />
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isSelected ? journey.bgColor : "bg-muted",
                          journey.color
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <Label htmlFor={journey.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] font-semibold",
                                isSelected && journey.color
                              )}
                            >
                              {journey.label}
                            </Badge>
                          </div>
                          <p className="font-medium mt-1">{journey.title}</p>
                          <p className="text-xs text-muted-foreground">{journey.description}</p>
                        </Label>
                        {isSelected && (
                          <Check className={cn("w-5 h-5", journey.color)} />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {step === 'experience' && (
            <div className="space-y-3" data-testid="step-experience">
              <RadioGroup 
                value={selectedExperience} 
                onValueChange={setSelectedExperience}
                className="space-y-3"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <Card
                    key={level.id}
                    className={cn(
                      "cursor-pointer transition-all hover-elevate",
                      selectedExperience === level.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedExperience(level.id)}
                    data-testid={`experience-${level.id}`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <RadioGroupItem 
                        value={level.id} 
                        id={level.id}
                        data-testid={`radio-experience-${level.id}`}
                      />
                      <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                        <p className="font-medium">{level.label}</p>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                      </Label>
                      {selectedExperience === level.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 'recommendations' && (
            <div className="space-y-3" data-testid="step-recommendations">
              {(() => {
                const journeyData = getSelectedJourneyData();
                return journeyData && (
                  <div className={cn(
                    "flex items-center gap-2 p-2 rounded-lg mb-2",
                    journeyData.bgColor
                  )}>
                    <journeyData.icon className={cn("w-4 h-4", journeyData.color)} />
                    <span className={cn("text-sm font-medium", journeyData.color)}>
                      {journeyData.label} Journey
                    </span>
                  </div>
                );
              })()}
              
              {recommendations.map((rec, index) => {
                const Icon = rec.icon;
                
                return (
                  <Card
                    key={index}
                    className="cursor-pointer transition-all hover-elevate"
                    onClick={() => handleRecommendationClick(rec)}
                    data-testid={`recommendation-${index}`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        rec.priority === 'high' ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rec.title}</p>
                          {rec.priority === 'high' && (
                            <Badge variant="default" className="text-[10px] px-1.5">
                              Recommended
                            </Badge>
                          )}
                          {rec.isExternal && (
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              External
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              })}
              
              <p className="text-xs text-muted-foreground text-center pt-2">
                Click any recommendation to get started, or finish setup to explore on your own.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <div>
            {currentStepIndex > 0 && (
              <Button 
                variant="ghost" 
                onClick={handleBack}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              data-testid="button-skip"
            >
              Skip for now
            </Button>
            
            {step === 'recommendations' ? (
              <Button 
                onClick={handleComplete}
                data-testid="button-complete"
              >
                Finish Setup
                <Check className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                data-testid="button-next"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingFlow;
