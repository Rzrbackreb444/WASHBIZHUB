import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type SpinnerSize = "sm" | "md" | "lg";

interface PageLoadingStateProps {
  message?: string;
  description?: string;
  showProgress?: boolean;
  progress?: number;
  size?: SpinnerSize;
  variant?: "default" | "minimal" | "branded";
  fullScreen?: boolean;
  className?: string;
  testId?: string;
}

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const premiumSpinnerSizes: Record<SpinnerSize, string> = {
  sm: "spinner-premium-sm",
  md: "spinner-premium",
  lg: "spinner-premium-lg",
};

export function PageLoadingState({
  message,
  description,
  showProgress = false,
  progress = 0,
  size = "md",
  variant = "default",
  fullScreen = true,
  className,
  testId,
}: PageLoadingStateProps) {
  const containerStyles = fullScreen
    ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    : "w-full py-16";

  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          containerStyles,
          "flex items-center justify-center",
          className
        )}
        data-testid={testId || "page-loading-minimal"}
      >
        <Loader2
          className={cn(
            spinnerSizes[size],
            "animate-spin text-accent"
          )}
          data-testid={`${testId || "page-loading"}-spinner`}
        />
      </motion.div>
    );
  }

  if (variant === "branded") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          containerStyles,
          "flex items-center justify-center",
          className
        )}
        data-testid={testId || "page-loading-branded"}
      >
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className={cn(premiumSpinnerSizes[size])} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-accent/20 blur-xl"
            />
          </motion.div>

          {(message || description) && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2"
            >
              {message && (
                <h3
                  className="text-lg font-semibold text-foreground"
                  data-testid={`${testId || "page-loading"}-message`}
                >
                  {message}
                </h3>
              )}
              {description && (
                <p
                  className="text-sm text-muted-foreground max-w-xs"
                  data-testid={`${testId || "page-loading"}-description`}
                >
                  {description}
                </p>
              )}
            </motion.div>
          )}

          {showProgress && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-64"
            >
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-accent rounded-full"
                  data-testid={`${testId || "page-loading"}-progress-bar`}
                />
              </div>
              <p
                className="text-xs text-muted-foreground text-center mt-2"
                data-testid={`${testId || "page-loading"}-progress-text`}
              >
                {Math.round(progress)}%
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        containerStyles,
        "flex items-center justify-center",
        className
      )}
      data-testid={testId || "page-loading-default"}
    >
      <div className="flex flex-col items-center gap-5">
        <div className={cn(premiumSpinnerSizes[size])} />

        {(message || description) && (
          <div className="text-center space-y-1.5">
            {message && (
              <h3
                className="text-base font-medium text-foreground"
                data-testid={`${testId || "page-loading"}-message`}
              >
                {message}
              </h3>
            )}
            {description && (
              <p
                className="text-sm text-muted-foreground"
                data-testid={`${testId || "page-loading"}-description`}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {showProgress && (
          <div className="w-48">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-accent rounded-full"
                data-testid={`${testId || "page-loading"}-progress-bar`}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface InlineLoadingProps {
  message?: string;
  size?: SpinnerSize;
  className?: string;
  testId?: string;
}

export function InlineLoading({
  message,
  size = "sm",
  className,
  testId,
}: InlineLoadingProps) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      data-testid={testId || "inline-loading"}
    >
      <Loader2
        className={cn(spinnerSizes[size], "animate-spin text-accent")}
        data-testid={`${testId || "inline-loading"}-spinner`}
      />
      {message && (
        <span
          className="text-sm text-muted-foreground"
          data-testid={`${testId || "inline-loading"}-message`}
        >
          {message}
        </span>
      )}
    </div>
  );
}

interface ButtonLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLoading({
  loading,
  children,
  className,
}: ButtonLoadingProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {children}
    </span>
  );
}

export type { PageLoadingStateProps, InlineLoadingProps, SpinnerSize };
