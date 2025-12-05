import { AlertTriangle, RefreshCw, Home, Database, Component } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ErrorFallbackVariant = "page" | "component" | "data-fetch";

interface ErrorFallbackProps {
  variant?: ErrorFallbackVariant;
  error?: Error | null;
  onRetry?: () => void;
  onGoHome?: () => void;
  title?: string;
  description?: string;
  showError?: boolean;
}

const variantConfig = {
  page: {
    icon: AlertTriangle,
    defaultTitle: "Something went wrong",
    defaultDescription: "We encountered an unexpected error. Our team has been notified.",
    containerClass: "min-h-screen flex items-center justify-center p-4",
    cardClass: "w-full max-w-lg",
  },
  component: {
    icon: Component,
    defaultTitle: "Component Error",
    defaultDescription: "This section couldn't be loaded. Try refreshing or continue using the rest of the page.",
    containerClass: "flex items-center justify-center p-6",
    cardClass: "w-full max-w-md",
  },
  "data-fetch": {
    icon: Database,
    defaultTitle: "Unable to Load Data",
    defaultDescription: "We couldn't fetch the requested data. Please check your connection and try again.",
    containerClass: "flex items-center justify-center p-6",
    cardClass: "w-full max-w-md",
  },
};

export function ErrorFallback({
  variant = "page",
  error,
  onRetry,
  onGoHome,
  title,
  description,
  showError = false,
}: ErrorFallbackProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = "/";
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={`${config.containerClass} bg-gradient-to-br from-slate-900 via-slate-800 to-black`}
      data-testid="error-fallback-container"
    >
      <div
        className={`${config.cardClass} bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden`}
      >
        <div className="p-8 text-center">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30">
            <IconComponent className="w-10 h-10 text-amber-500" />
          </div>

          <div className="mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20">
              WashBizHub
            </span>
          </div>

          <h1
            className="text-2xl font-bold text-white mb-3"
            data-testid="text-error-fallback-title"
          >
            {title || config.defaultTitle}
          </h1>

          <p
            className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto"
            data-testid="text-error-fallback-description"
          >
            {description || config.defaultDescription}
          </p>

          {showError && error?.message && (
            <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2 font-medium">
                Technical Details
              </p>
              <p
                className="text-sm text-white/80 font-mono break-words"
                data-testid="text-error-fallback-message"
              >
                {error.message}
              </p>
              {error.name && (
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/50">
                  <span className="px-2 py-1 bg-white/10 rounded text-amber-400 font-medium">
                    {error.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1 gap-2 border-amber-500/30 text-amber-400 bg-amber-500/5"
              data-testid="button-error-retry"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600"
              data-testid="button-error-go-home"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
        </div>

        <div className="px-8 pb-6">
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-center text-white/40">
              Need help?{" "}
              <a
                href="mailto:support@washbizhub.com"
                className="text-amber-400/70 hover:text-amber-400 transition-colors"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
