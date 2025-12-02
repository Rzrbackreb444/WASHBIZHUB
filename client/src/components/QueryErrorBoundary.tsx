import { ReactNode } from "react";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { ErrorFallback } from "./ErrorFallback";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface QueryErrorBoundaryProps {
  children: ReactNode;
  query: UseQueryResult<unknown, Error>;
  loadingFallback?: ReactNode;
  errorTitle?: string;
  errorDescription?: string;
  showError?: boolean;
  variant?: "page" | "component" | "data-fetch";
  inline?: boolean;
}

export function QueryErrorBoundary({
  children,
  query,
  loadingFallback,
  errorTitle,
  errorDescription,
  showError = false,
  variant = "data-fetch",
  inline = false,
}: QueryErrorBoundaryProps) {
  if (query.isLoading) {
    return loadingFallback ? <>{loadingFallback}</> : null;
  }

  if (query.isError) {
    if (inline) {
      return (
        <InlineQueryError
          error={query.error}
          onRetry={() => query.refetch()}
          title={errorTitle}
          description={errorDescription}
        />
      );
    }

    return (
      <ErrorFallback
        variant={variant}
        error={query.error}
        onRetry={() => query.refetch()}
        title={errorTitle}
        description={errorDescription}
        showError={showError}
      />
    );
  }

  return <>{children}</>;
}

interface InlineQueryErrorProps {
  error: Error | null;
  onRetry: () => void;
  title?: string;
  description?: string;
}

function InlineQueryError({
  error,
  onRetry,
  title = "Failed to load",
  description = "Something went wrong while loading this content.",
}: InlineQueryErrorProps) {
  return (
    <div
      className="bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/10 p-6"
      data-testid="inline-query-error"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white" data-testid="text-inline-error-title">
            {title}
          </h3>
          <p className="mt-1 text-xs text-white/60" data-testid="text-inline-error-description">
            {description}
          </p>
          {error?.message && (
            <p className="mt-2 text-xs text-white/40 font-mono truncate">
              {error.message}
            </p>
          )}
        </div>
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs border-amber-500/30 text-amber-400 bg-amber-500/5"
          data-testid="button-inline-retry"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </Button>
      </div>
    </div>
  );
}

interface MutationErrorDisplayProps {
  mutation: UseMutationResult<unknown, Error, unknown>;
  className?: string;
}

export function MutationErrorDisplay({
  mutation,
  className = "",
}: MutationErrorDisplayProps) {
  if (!mutation.isError) return null;

  return (
    <div
      className={`bg-red-500/10 border border-red-500/20 rounded-lg p-4 ${className}`}
      data-testid="mutation-error-display"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-400">
            Action Failed
          </p>
          <p className="mt-1 text-xs text-red-300/70">
            {mutation.error?.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <Button
          onClick={() => mutation.reset()}
          size="sm"
          variant="ghost"
          className="text-xs text-red-400"
          data-testid="button-dismiss-mutation-error"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

export default QueryErrorBoundary;
