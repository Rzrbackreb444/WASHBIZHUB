import { AlertCircle, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import type { UsageInfo, GatingTier } from '@/lib/feature-gating-config';

interface UsageLimitBannerProps {
  usageInfo: UsageInfo;
  currentTier: GatingTier;
  featureName: string;
  onUpgrade?: () => void;
  compact?: boolean;
}

export function UsageLimitBanner({
  usageInfo,
  currentTier,
  featureName,
  onUpgrade,
  compact = false,
}: UsageLimitBannerProps) {
  const [, navigate] = useLocation();
  const { used, limit, remaining, isExceeded, resetDate } = usageInfo;

  if (currentTier === 'pro' || currentTier === 'enterprise') {
    return null;
  }

  const progressPercent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isWarning = remaining <= 1 && !isExceeded;
  const formatFeatureName = featureName.replace(/([A-Z])/g, ' $1').trim();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  if (compact) {
    return (
      <div 
        className="flex items-center gap-2 text-sm"
        data-testid="banner-usage-compact"
      >
        <Badge 
          variant={isExceeded ? "destructive" : isWarning ? "secondary" : "outline"}
          className={isExceeded ? "" : isWarning ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : ""}
        >
          {isExceeded ? (
            <span className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Limit reached
            </span>
          ) : (
            <span>{remaining} of {limit} {formatFeatureName} left</span>
          )}
        </Badge>
        
        {(isExceeded || isWarning) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpgrade}
            className="text-[#C8A661] hover:text-[#B8964F] h-7 px-2"
            data-testid="button-upgrade-compact"
          >
            <Zap className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`rounded-lg border p-4 ${
        isExceeded 
          ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900' 
          : isWarning 
            ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900' 
            : 'bg-muted/50 border-border'
      }`}
      data-testid="banner-usage-limit"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isExceeded ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-[#C8A661]" />
            )}
            <span 
              className="font-medium text-sm"
              data-testid="text-usage-status"
            >
              {isExceeded 
                ? `${formatFeatureName} limit reached` 
                : `${used} of ${limit} free ${formatFeatureName.toLowerCase()} used`
              }
            </span>
            
            {currentTier === 'teaser' && (
              <Badge variant="outline" className="text-xs">
                Anonymous
              </Badge>
            )}
          </div>

          <Progress 
            value={progressPercent} 
            className="h-2 mb-2"
            data-testid="progress-usage"
          />

          <p className="text-xs text-muted-foreground">
            {isExceeded ? (
              currentTier === 'teaser' 
                ? 'Create a free account or upgrade to continue using this feature.'
                : 'Upgrade to Pro for unlimited access.'
            ) : (
              resetDate 
                ? `Resets ${resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'Limited trial usage'
            )}
          </p>
        </div>

        <Button
          onClick={handleUpgrade}
          size="sm"
          className={isExceeded 
            ? "bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" 
            : "bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
          }
          data-testid="button-upgrade-banner"
        >
          <Zap className="h-3 w-3 mr-1.5" />
          {isExceeded ? 'Upgrade Now' : 'Go Pro'}
        </Button>
      </div>
    </div>
  );
}

interface TeaserBannerProps {
  usageRemaining: number;
  featureName: string;
  onUpgrade?: () => void;
}

export function TeaserBanner({
  usageRemaining,
  featureName,
  onUpgrade,
}: TeaserBannerProps) {
  const [, navigate] = useLocation();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  if (usageRemaining <= 0) {
    return (
      <div 
        className="rounded-lg bg-[#0A1628] text-white p-4 flex items-center justify-between gap-4"
        data-testid="banner-teaser-limit"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-[#C8A661]" />
          </div>
          <div>
            <p className="font-medium text-sm">Free trial complete</p>
            <p className="text-xs text-gray-300">Unlock unlimited {featureName}</p>
          </div>
        </div>
        <Button
          onClick={handleUpgrade}
          className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
          data-testid="button-upgrade-teaser"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="rounded-lg bg-muted/50 border p-3 flex items-center justify-between gap-4"
      data-testid="banner-teaser"
    >
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-[#C8A661]" />
        <span className="text-sm">
          <span className="font-medium">{usageRemaining}</span>
          <span className="text-muted-foreground"> free {featureName} remaining</span>
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUpgrade}
        className="text-[#C8A661] hover:text-[#B8964F]"
        data-testid="button-go-pro-teaser"
      >
        Go Pro
      </Button>
    </div>
  );
}
