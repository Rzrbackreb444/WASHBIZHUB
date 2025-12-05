import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, ReactNode } from "react";

type AccentPosition = "top" | "left" | "none";

interface PremiumCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  accentPosition?: AccentPosition;
  accentGradient?: boolean;
  elevated?: boolean;
  interactive?: boolean;
  loading?: boolean;
  testId?: string;
}

const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      children,
      accentPosition = "none",
      accentGradient = false,
      elevated = false,
      interactive = false,
      loading = false,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    if (loading) {
      return (
        <div
          className={cn(
            "rounded-xl border border-card-border bg-card overflow-hidden",
            className
          )}
          data-testid={`${testId || "premium-card"}-skeleton`}
        >
          <div className="p-6 space-y-4">
            <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-20 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      );
    }

    const accentStyles = {
      top: "border-t-2 border-t-accent",
      left: "border-l-4 border-l-accent rounded-l-none",
      none: "",
    };

    const gradientAccentStyles = {
      top: "before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-accent before:via-accent/80 before:to-amber-500",
      left: "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-1 before:bg-gradient-to-b before:from-accent before:via-accent/80 before:to-amber-500",
      none: "",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "relative rounded-xl border border-card-border bg-card overflow-visible",
          accentGradient && accentPosition !== "none"
            ? gradientAccentStyles[accentPosition]
            : accentStyles[accentPosition],
          elevated && "shadow-lg",
          interactive && "hover-elevate active-elevate-2 cursor-pointer",
          !interactive && "transition-shadow duration-300 hover:shadow-md",
          className
        )}
        data-testid={testId || "premium-card"}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

interface PremiumCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  testId?: string;
}

function PremiumCardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
  testId,
}: PremiumCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 p-6 pb-4",
        className
      )}
      data-testid={testId || "premium-card-header"}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon && (
          <div
            className="flex-shrink-0 p-2 rounded-lg bg-accent/10 text-accent"
            data-testid={`${testId || "premium-card-header"}-icon`}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <h3
            className="text-lg font-semibold text-foreground truncate"
            data-testid={`${testId || "premium-card-header"}-title`}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className="text-sm text-muted-foreground line-clamp-2"
              data-testid={`${testId || "premium-card-header"}-subtitle`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div
          className="flex-shrink-0"
          data-testid={`${testId || "premium-card-header"}-action`}
        >
          {action}
        </div>
      )}
    </div>
  );
}

interface PremiumCardContentProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  testId?: string;
}

function PremiumCardContent({
  children,
  className,
  noPadding = false,
  testId,
}: PremiumCardContentProps) {
  return (
    <div
      className={cn(!noPadding && "px-6 pb-6", className)}
      data-testid={testId || "premium-card-content"}
    >
      {children}
    </div>
  );
}

interface PremiumCardFooterProps {
  children: ReactNode;
  className?: string;
  divided?: boolean;
  testId?: string;
}

function PremiumCardFooter({
  children,
  className,
  divided = true,
  testId,
}: PremiumCardFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4",
        divided && "border-t border-border",
        className
      )}
      data-testid={testId || "premium-card-footer"}
    >
      {children}
    </div>
  );
}

interface PremiumCardMetricProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
  testId?: string;
}

function PremiumCardMetric({
  label,
  value,
  trend,
  className,
  testId,
}: PremiumCardMetricProps) {
  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend?.direction === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <div className={cn("space-y-1", className)} data-testid={testId || "premium-card-metric"}>
      <div
        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        data-testid={`${testId || "premium-card-metric"}-label`}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-2xl font-bold text-foreground"
          data-testid={`${testId || "premium-card-metric"}-value`}
        >
          {value}
        </span>
        {trend && (
          <span
            className={cn("text-xs font-semibold", trendColor)}
            data-testid={`${testId || "premium-card-metric"}-trend`}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  PremiumCardMetric,
};

export type {
  PremiumCardProps,
  PremiumCardHeaderProps,
  PremiumCardContentProps,
  PremiumCardFooterProps,
  PremiumCardMetricProps,
  AccentPosition,
};
