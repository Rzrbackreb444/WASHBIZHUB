import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  value: string | number;
  label: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  icon?: LucideIcon;
  gradient?: boolean;
  loading?: boolean;
  className?: string;
  valueClassName?: string;
  testId?: string;
}

function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-visible rounded-xl border border-card-border bg-card p-6",
        "hover-elevate active-elevate-2",
        className
      )}
      data-testid="metric-card-skeleton"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function MetricCard({
  value,
  label,
  trend,
  icon: Icon,
  gradient = false,
  loading = false,
  className,
  valueClassName,
  testId,
}: MetricCardProps) {
  if (loading) {
    return <MetricCardSkeleton className={className} />;
  }

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend?.direction === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative overflow-visible rounded-xl border border-card-border bg-card p-6",
        "hover-elevate active-elevate-2",
        "transition-all duration-300",
        gradient && "bg-gradient-to-br from-card via-card to-muted/30",
        className
      )}
      data-testid={testId || "metric-card"}
    >
      {gradient && (
        <div
          className="absolute inset-0 rounded-xl opacity-5 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top right, hsl(var(--accent)), transparent 60%)",
          }}
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className={cn(
              "text-4xl font-bold tracking-tight text-foreground",
              valueClassName
            )}
            data-testid={`${testId || "metric-card"}-value`}
          >
            {value}
          </motion.div>
          <div
            className="text-sm font-medium text-muted-foreground"
            data-testid={`${testId || "metric-card"}-label`}
          >
            {label}
          </div>

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trendColor
              )}
              data-testid={`${testId || "metric-card"}-trend`}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              <span>
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
            </motion.div>
          )}
        </div>

        {Icon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            className="flex-shrink-0 p-2.5 rounded-lg bg-accent/10 text-accent"
            data-testid={`${testId || "metric-card"}-icon`}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export type { MetricCardProps };
