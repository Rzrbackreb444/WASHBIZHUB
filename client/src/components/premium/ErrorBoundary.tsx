import { Component, ErrorInfo, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ErrorIllustration } from "./illustrations";
import { RefreshCw, MessageCircle, AlertTriangle, XCircle } from "lucide-react";

type ErrorBoundaryVariant = "page" | "section" | "inline";

interface ErrorBoundaryProps {
  children: ReactNode;
  variant?: ErrorBoundaryVariant;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  showReportLink?: boolean;
  reportUrl?: string;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  handleReport = (): void => {
    const { reportUrl } = this.props;
    const { error } = this.state;
    
    if (reportUrl) {
      const errorMessage = encodeURIComponent(error?.message || "Unknown error");
      const url = `${reportUrl}?error=${errorMessage}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const {
      children,
      variant = "section",
      fallback,
      showReportLink = true,
      reportUrl = "/help-center",
      className,
    } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <ErrorFallback
        variant={variant}
        error={error}
        onRetry={this.handleRetry}
        onReport={showReportLink ? this.handleReport : undefined}
        className={className}
      />
    );
  }
}

interface ErrorFallbackProps {
  variant: ErrorBoundaryVariant;
  error: Error | null;
  onRetry: () => void;
  onReport?: () => void;
  className?: string;
}

function ErrorFallback({
  variant,
  error,
  onRetry,
  onReport,
  className,
}: ErrorFallbackProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        config.container,
        className
      )}
      data-testid={`error-boundary-${variant}`}
      role="alert"
    >
      <div
        className={cn(
          "flex flex-col items-center text-center",
          config.content
        )}
      >
        {variant !== "inline" && (
          <div className={cn("mb-4", config.iconWrapper)}>
            {variant === "page" ? (
              <ErrorIllustration size={config.illustrationSize} />
            ) : (
              <div
                className="flex items-center justify-center rounded-full bg-destructive/10"
                style={{ width: config.iconSize, height: config.iconSize }}
              >
                <AlertTriangle
                  className="text-destructive"
                  style={{
                    width: config.iconSize * 0.5,
                    height: config.iconSize * 0.5,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {variant === "inline" && (
          <XCircle
            className="text-destructive mr-2 flex-shrink-0"
            size={18}
            data-testid="error-boundary-inline-icon"
          />
        )}

        <div className={cn("space-y-1", config.textWrapper)}>
          <h3
            className={cn("font-semibold text-foreground", config.title)}
            data-testid="error-boundary-title"
          >
            {config.titleText}
          </h3>
          {variant !== "inline" && (
            <p
              className={cn("text-muted-foreground", config.description)}
              data-testid="error-boundary-description"
            >
              {error?.message || "An unexpected error occurred. Please try again."}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-3",
            variant === "inline" ? "ml-3" : "mt-5"
          )}
        >
          <Button
            onClick={onRetry}
            size={variant === "inline" ? "sm" : "default"}
            className="gap-2"
            data-testid="error-boundary-retry-button"
          >
            <RefreshCw className="h-4 w-4" />
            {variant === "inline" ? "Retry" : "Try Again"}
          </Button>

          {onReport && variant !== "inline" && (
            <Button
              variant="ghost"
              onClick={onReport}
              size={variant === "inline" ? "sm" : "default"}
              className="gap-2 text-muted-foreground hover:text-foreground"
              data-testid="error-boundary-report-link"
            >
              <MessageCircle className="h-4 w-4" />
              Report Issue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

const variantConfig = {
  page: {
    container: "min-h-[60vh] w-full px-6 py-12",
    content: "max-w-md",
    iconWrapper: "mb-6",
    iconSize: 80,
    illustrationSize: 180,
    textWrapper: "space-y-2",
    title: "text-2xl",
    titleText: "Something went wrong",
    description: "text-base leading-relaxed",
  },
  section: {
    container: "w-full py-12 px-6",
    content: "max-w-sm",
    iconWrapper: "mb-4",
    iconSize: 56,
    illustrationSize: 120,
    textWrapper: "space-y-1",
    title: "text-lg",
    titleText: "Failed to load",
    description: "text-sm",
  },
  inline: {
    container: "w-full py-3 px-4 bg-destructive/5 rounded-lg border border-destructive/20",
    content: "flex-row",
    iconWrapper: "",
    iconSize: 18,
    illustrationSize: 0,
    textWrapper: "",
    title: "text-sm",
    titleText: "Error loading content",
    description: "text-xs",
  },
} as const;

interface PageErrorBoundaryProps extends Omit<ErrorBoundaryProps, "variant"> {}
interface SectionErrorBoundaryProps extends Omit<ErrorBoundaryProps, "variant"> {}
interface InlineErrorBoundaryProps extends Omit<ErrorBoundaryProps, "variant"> {}

export function PageErrorBoundary(props: PageErrorBoundaryProps) {
  return <ErrorBoundary variant="page" {...props} />;
}

export function SectionErrorBoundary(props: SectionErrorBoundaryProps) {
  return <ErrorBoundary variant="section" {...props} />;
}

export function InlineErrorBoundary(props: InlineErrorBoundaryProps) {
  return <ErrorBoundary variant="inline" showReportLink={false} {...props} />;
}

export type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorBoundaryVariant,
  ErrorFallbackProps,
  PageErrorBoundaryProps,
  SectionErrorBoundaryProps,
  InlineErrorBoundaryProps,
};
