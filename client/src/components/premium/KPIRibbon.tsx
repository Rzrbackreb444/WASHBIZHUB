import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  icon?: LucideIcon;
}

interface KPIRibbonProps {
  metrics: KPIMetric[];
  loading?: boolean;
  className?: string;
  testId?: string;
}

function KPIRibbonSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden",
        className
      )}
      data-testid="kpi-ribbon-skeleton"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card p-5 space-y-2"
          data-testid={`kpi-ribbon-skeleton-item-${i}`}
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-7 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function KPIRibbon({
  metrics,
  loading = false,
  className,
  testId,
}: KPIRibbonProps) {
  if (loading) {
    return <KPIRibbonSkeleton count={metrics.length || 4} className={className} />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "grid gap-px bg-border rounded-xl overflow-hidden",
        metrics.length === 2 && "grid-cols-2",
        metrics.length === 3 && "grid-cols-3",
        metrics.length >= 4 && "grid-cols-2 md:grid-cols-4",
        className
      )}
      data-testid={testId || "kpi-ribbon"}
    >
      {metrics.map((metric, index) => {
        const TrendIcon =
          metric.trend?.direction === "up"
            ? TrendingUp
            : metric.trend?.direction === "down"
              ? TrendingDown
              : Minus;

        const trendColor =
          metric.trend?.direction === "up"
            ? "text-emerald-600 dark:text-emerald-400"
            : metric.trend?.direction === "down"
              ? "text-red-600 dark:text-red-400"
              : "text-muted-foreground";

        const Icon = metric.icon;

        return (
          <motion.div
            key={metric.id}
            variants={itemVariants}
            className={cn(
              "relative bg-card p-5",
              "hover-elevate transition-colors duration-200"
            )}
            data-testid={`${testId || "kpi-ribbon"}-item-${metric.id}`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {Icon && (
                  <Icon
                    className="h-4 w-4 text-muted-foreground"
                    data-testid={`${testId || "kpi-ribbon"}-icon-${metric.id}`}
                  />
                )}
                <span
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  data-testid={`${testId || "kpi-ribbon"}-label-${metric.id}`}
                >
                  {metric.label}
                </span>
              </div>

              <div
                className="text-2xl font-bold tracking-tight text-foreground"
                data-testid={`${testId || "kpi-ribbon"}-value-${metric.id}`}
              >
                {metric.value}
              </div>

              {metric.trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold",
                    trendColor
                  )}
                  data-testid={`${testId || "kpi-ribbon"}-trend-${metric.id}`}
                >
                  <TrendIcon className="h-3 w-3" />
                  <span>
                    {metric.trend.value > 0 ? "+" : ""}
                    {metric.trend.value}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export type { KPIRibbonProps, KPIMetric };
