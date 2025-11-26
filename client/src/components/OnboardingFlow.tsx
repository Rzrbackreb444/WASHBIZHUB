import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, Target, TrendingUp, GraduationCap, 
  ArrowRight, ArrowLeft, X, Check, Star, 
  Building2, Calculator, BookOpen, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserJourney } from '@/hooks/useUserJourney';

type OnboardingStep = 'welcome' | 'goals' | 'experience' | 'recommendations';

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface Goal {
  id: string;
  label: string;
  description: string;
  icon: typeof Building2;
}

const GOALS: Goal[] = [
  {
    id: 'buy_laundromat',
    label: 'Buy a Laundromat',
    description: 'I want to purchase my first or next laundromat',
    icon: Building2,
  },
  {
    id: 'sell_laundromat',
    label: 'Sell a Laundromat',
    description: 'I want to list or sell my laundromat business',
    icon: TrendingUp,
  },
  {
    id: 'improve_operations',
    label: 'Improve Operations',
    description: 'I want to optimize my current laundromat',
    icon: Calculator,
  },
  {
    id: 'learn',
    label: 'Learn the Industry',
    description: 'I want to learn about the laundromat business',
    icon: GraduationCap,
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
  icon: typeof Building2;
  priority: 'high' | 'medium' | 'low';
}

function getRecommendations(goals: string[], experience: string): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (goals.includes('buy_laundromat')) {
    recommendations.push({
      title: 'Location Analysis',
      description: 'Use CLEANBI to analyze potential locations',
      path: '/cleanbi',
      icon: Target,
      priority: 'high',
    });
    recommendations.push({
      title: 'Browse Listings',
      description: 'Find laundromats for sale in your area',
      path: '/listings',
      icon: Building2,
      priority: 'high',
    });
  }

  if (goals.includes('sell_laundromat')) {
    recommendations.push({
      title: 'Valuation Calculator',
      description: 'Calculate your laundromat value',
      path: '/valuation-calculator',
      icon: Calculator,
      priority: 'high',
    });
    recommendations.push({
      title: 'List Your Business',
      description: 'Create a listing to sell your laundromat',
      path: '/listing-form',
      icon: TrendingUp,
      priority: 'high',
    });
  }

  if (goals.includes('improve_operations')) {
    recommendations.push({
      title: 'ROI Calculator',
      description: 'Analyze your current performance',
      path: '/calculator',
      icon: Calculator,
      priority: 'high',
    });
    recommendations.push({
      title: 'Equipment Marketplace',
      description: 'Find the best equipment deals',
      path: '/equipment-marketplace',
      icon: Building2,
      priority: 'medium',
    });
  }

  if (goals.includes('learn') || experience === 'beginner') {
    recommendations.push({
      title: 'Laundromat Courses',
      description: 'Learn from industry experts',
      path: '/courses',
      icon: GraduationCap,
      priority: 'high',
    });
    recommendations.push({
      title: 'Read the Blog',
      description: 'Get insights and tips',
      path: '/blog',
      icon: BookOpen,
      priority: 'medium',
    });
  }

  recommendations.push({
    title: 'Join the Community',
    description: 'Connect with other laundromat owners',
    path: '/forum',
    icon: Users,
    priority: 'low',
  });

  return recommendations.slice(0, 4);
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [, setLocation] = useLocation();
  const { updateOnboarding, setGoals: setJourneyGoals, setExperience: setJourneyExperience, trackEvent } = useUserJourney(false);
  
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const steps: OnboardingStep[] = ['welcome', 'goals', 'experience', 'recommendations'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    updateOnboarding(currentStepIndex);
  }, [currentStepIndex, updateOnboarding]);

  useEffect(() => {
    if (step === 'recommendations') {
      const recs = getRecommendations(selectedGoals, selectedExperience);
      setRecommendations(recs);
    }
  }, [step, selectedGoals, selectedExperience]);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
      
      if (steps[nextIndex] === 'recommendations') {
        setJourneyGoals(selectedGoals);
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

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleRecommendationClick = (path: string) => {
    handleComplete();
    setLocation(path);
  };

  const canProceed = () => {
    switch (step) {
      case 'welcome':
        return true;
      case 'goals':
        return selectedGoals.length > 0;
      case 'experience':
        return selectedExperience !== '';
      case 'recommendations':
        return true;
      default:
        return false;
    }
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
                {step === 'goals' && 'What are your goals?'}
                {step === 'experience' && 'Your experience level'}
                {step === 'recommendations' && 'Your personalized plan'}
              </DialogTitle>
              <DialogDescription>
                {step === 'welcome' && "Let's get you set up for success"}
                {step === 'goals' && 'Select all that apply'}
                {step === 'experience' && 'Help us tailor your experience'}
                {step === 'recommendations' && 'Based on your goals, we recommend:'}
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
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-operators">70K+</p>
                  <p className="text-xs text-muted-foreground">Operators</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-revenue">$12M+</p>
                  <p className="text-xs text-muted-foreground">Revenue Generated</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-listings">5K+</p>
                  <p className="text-xs text-muted-foreground">Listings</p>
                </div>
              </div>
            </div>
          )}

          {step === 'goals' && (
            <div className="space-y-3" data-testid="step-goals">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoals.includes(goal.id);
                
                return (
                  <Card
                    key={goal.id}
                    className={cn(
                      "cursor-pointer transition-all hover-elevate",
                      isSelected && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleGoalToggle(goal.id)}
                    data-testid={`goal-${goal.id}`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => handleGoalToggle(goal.id)}
                        data-testid={`checkbox-goal-${goal.id}`}
                      />
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{goal.label}</p>
                        <p className="text-xs text-muted-foreground">{goal.description}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
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
              {recommendations.map((rec, index) => {
                const Icon = rec.icon;
                
                return (
                  <Card
                    key={index}
                    className="cursor-pointer transition-all hover-elevate"
                    onClick={() => handleRecommendationClick(rec.path)}
                    data-testid={`recommendation-${index}`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        rec.priority === 'high' && "bg-primary text-primary-foreground",
                        rec.priority === 'medium' && "bg-accent text-accent-foreground",
                        rec.priority === 'low' && "bg-muted"
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
