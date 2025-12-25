import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface TeaserResultsOverlayProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onUnlock?: () => void;
  showLoginPrompt?: boolean;
  featureName?: string;
}

export function TeaserResultsOverlay({
  title = 'Unlock Full Results',
  description = 'Sign up or upgrade to see the complete analysis with detailed insights.',
  ctaText = 'Unlock Now',
  onUnlock,
  showLoginPrompt = false,
  featureName,
}: TeaserResultsOverlayProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (onUnlock) {
      onUnlock();
    } else if (showLoginPrompt) {
      navigate('/signup');
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div 
      className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-background via-background/95 to-transparent"
      data-testid="overlay-teaser-results"
    >
      <div className="text-center max-w-md px-6 py-8">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-[#0A1628] flex items-center justify-center">
          <Lock className="h-7 w-7 text-[#C8A661]" />
        </div>
        
        <h3 
          className="text-xl font-bold text-foreground mb-2"
          data-testid="text-teaser-title"
        >
          {title}
        </h3>
        
        <p 
          className="text-muted-foreground mb-6 text-sm leading-relaxed"
          data-testid="text-teaser-description"
        >
          {description}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleClick}
            className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
            data-testid="button-unlock-results"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {ctaText}
          </Button>
          
          {showLoginPrompt && (
            <Button
              variant="outline"
              onClick={() => navigate('/signup')}
              className="border-[#0A1628] text-[#0A1628]"
              data-testid="button-signup-teaser"
            >
              Create Free Account
            </Button>
          )}
        </div>

        {featureName && (
          <p className="text-xs text-muted-foreground mt-4">
            Unlocking: {featureName}
          </p>
        )}
      </div>
    </div>
  );
}

interface BlurredContentProps {
  children: React.ReactNode;
  isBlurred: boolean;
  overlayProps?: TeaserResultsOverlayProps;
  className?: string;
}

export function BlurredContent({
  children,
  isBlurred,
  overlayProps,
  className = '',
}: BlurredContentProps) {
  return (
    <div className={`relative ${className}`} data-testid="container-blurred-content">
      <div 
        className={isBlurred ? 'blur-sm pointer-events-none select-none' : ''}
        data-testid="content-blurred"
      >
        {children}
      </div>
      
      {isBlurred && overlayProps && (
        <TeaserResultsOverlay {...overlayProps} />
      )}
    </div>
  );
}
