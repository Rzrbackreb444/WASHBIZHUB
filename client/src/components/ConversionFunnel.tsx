import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, Sparkles, Zap, Crown, Trophy, 
  ChevronRight, Star, ArrowRight, Target, Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserJourney } from '@/hooks/useUserJourney';
import { JourneyStage, STAGE_INFO } from '@/lib/user-journey';

const STAGE_ICONS: Record<JourneyStage, typeof Eye> = {
  visitor: Eye,
  lead: Sparkles,
  trial: Zap,
  customer: Crown,
  advocate: Trophy,
};

const STAGE_ACTIONS: Record<JourneyStage, { label: string; path: string; description: string }> = {
  visitor: {
    label: 'Sign Up for Free',
    path: '/login',
    description: 'Create your account to unlock personalized features',
  },
  lead: {
    label: 'Get Started',
    path: '/pricing',
    description: 'Unlock premium features with 30-day guarantee',
  },
  trial: {
    label: 'Upgrade to Pro',
    path: '/pricing',
    description: 'Get full access to all tools',
  },
  customer: {
    label: 'Become an Advocate',
    path: '/affiliate-dashboard',
    description: 'Share WashBizHub and earn rewards',
  },
  advocate: {
    label: 'Exclusive Benefits',
    path: '/affiliate-dashboard',
    description: 'Access VIP features and higher commissions',
  },
};

const STAGE_BADGES: Record<JourneyStage, { label: string; unlocked: boolean }[]> = {
  visitor: [
    { label: 'First Steps', unlocked: true },
    { label: 'Explorer', unlocked: false },
  ],
  lead: [
    { label: 'Explorer', unlocked: true },
    { label: 'Learner', unlocked: false },
  ],
  trial: [
    { label: 'Learner', unlocked: true },
    { label: 'Analyst', unlocked: false },
  ],
  customer: [
    { label: 'Analyst', unlocked: true },
    { label: 'Expert', unlocked: false },
  ],
  advocate: [
    { label: 'Expert', unlocked: true },
    { label: 'Champion', unlocked: true },
  ],
};

interface ConversionFunnelProps {
  variant?: 'compact' | 'full' | 'minimal';
  showActions?: boolean;
  showBadges?: boolean;
  className?: string;
}

export function ConversionFunnel({
  variant = 'full',
  showActions = true,
  showBadges = true,
  className,
}: ConversionFunnelProps) {
  const [, setLocation] = useLocation();
  const { stage, stageProgress, engagementScore, nextBestAction } = useUserJourney(false);
  
  const stages: JourneyStage[] = ['visitor', 'lead', 'trial', 'customer', 'advocate'];
  const currentStageIndex = stages.indexOf(stage);
  
  const stageAction = STAGE_ACTIONS[stage];
  const stageBadges = STAGE_BADGES[stage];

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)} data-testid="funnel-minimal">
        <div className="flex items-center gap-1">
          {stages.map((s, index) => {
            const Icon = STAGE_ICONS[s];
            const isComplete = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            
            return (
              <div
                key={s}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isComplete && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                )}
                data-testid={`funnel-stage-${s}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            );
          })}
        </div>
        <span className="text-sm font-medium" data-testid="text-stage-label">
          {STAGE_INFO[stage].label}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn("overflow-visible", className)} data-testid="funnel-compact">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = STAGE_ICONS[stage];
                return <Icon className={cn("w-5 h-5", STAGE_INFO[stage].color)} />;
              })()}
              <div>
                <p className="font-semibold text-sm" data-testid="text-current-stage">{STAGE_INFO[stage].label}</p>
                <p className="text-xs text-muted-foreground">{stageProgress.percentage}% complete</p>
              </div>
            </div>
            <Badge variant="secondary" className="font-bold" data-testid="badge-score">
              <Star className="w-3 h-3 mr-1" />
              {engagementScore}
            </Badge>
          </div>
          
          <Progress value={stageProgress.percentage} className="h-2 mb-3" data-testid="progress-funnel" />
          
          {showActions && nextBestAction && (
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => nextBestAction.path && setLocation(nextBestAction.path)}
              data-testid="button-next-action"
            >
              {nextBestAction.action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-visible", className)} data-testid="funnel-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Journey
            </CardTitle>
            <CardDescription>Track your progress to success</CardDescription>
          </div>
          <Badge 
            variant="default" 
            className="text-lg px-3 py-1 font-bold"
            data-testid="badge-engagement-score"
          >
            <Star className="w-4 h-4 mr-1" />
            {engagementScore}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative mb-6">
          <div className="flex items-center justify-between gap-1">
            {stages.map((s, index) => {
              const Icon = STAGE_ICONS[s];
              const info = STAGE_INFO[s];
              const isComplete = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isLast = index === stages.length - 1;
              
              return (
                <div key={s} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all relative",
                        isComplete && "bg-primary text-primary-foreground shadow-lg",
                        isCurrent && "bg-gradient-to-br from-primary/20 to-accent/20 text-primary border-2 border-primary shadow-md",
                        !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                      )}
                      data-testid={`funnel-stage-icon-${s}`}
                    >
                      <Icon className="w-5 h-5" />
                      {isComplete && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold">✓</span>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    <span 
                      className={cn(
                        "text-xs mt-2 font-medium text-center",
                        isCurrent && "text-primary font-semibold",
                        isComplete && "text-foreground",
                        !isComplete && !isCurrent && "text-muted-foreground"
                      )}
                      data-testid={`funnel-stage-label-${s}`}
                    >
                      {info.label}
                    </span>
                  </div>
                  
                  {!isLast && (
                    <div className="flex-shrink-0 w-6 flex items-center justify-center -mt-4">
                      <ChevronRight 
                        className={cn(
                          "w-4 h-4",
                          index < currentStageIndex ? "text-primary" : "text-muted-foreground/50"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress to next stage</span>
              <span>{stageProgress.percentage}%</span>
            </div>
            <Progress value={stageProgress.percentage} className="h-2" data-testid="progress-overall" />
            {stageProgress.nextStage && (
              <p className="text-xs text-muted-foreground mt-1" data-testid="text-points-needed">
                {stageProgress.pointsToNextStage} points to {STAGE_INFO[stageProgress.nextStage].label}
              </p>
            )}
          </div>
        </div>

        {showBadges && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              Badges
            </p>
            <div className="flex flex-wrap gap-2">
              {stageBadges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.unlocked ? "default" : "outline"}
                  className={cn(
                    badge.unlocked 
                      ? "bg-gradient-to-r from-primary to-accent" 
                      : "opacity-50"
                  )}
                  data-testid={`badge-achievement-${index}`}
                >
                  {badge.unlocked && <Star className="w-3 h-3 mr-1" />}
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showActions && (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm mb-1" data-testid="text-next-step">
                    Next Step: {stageAction.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{stageAction.description}</p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setLocation(stageAction.path)}
                  data-testid="button-stage-action"
                >
                  Go
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {nextBestAction && stageAction.label !== nextBestAction.action && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" data-testid="text-suggested-action">
                  {nextBestAction.action}
                </p>
                <p className="text-xs text-muted-foreground">{nextBestAction.description}</p>
              </div>
              <Badge variant="secondary" data-testid="badge-action-points">
                +{nextBestAction.points} pts
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ConversionFunnel;
