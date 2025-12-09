import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KPIVariant = "default" | "success" | "warning" | "danger" | "gold";
type KPISize = "compact" | "large";

interface KPICardProps {
  value: number | string;
  label: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  icon?: LucideIcon;
  variant?: KPIVariant;
  size?: KPISize;
  prefix?: string;
  suffix?: string;
  formatValue?: boolean;
  className?: string;
  onClick?: () => void;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

const variantStyles: Record<KPIVariant, { bg: string; text: string; icon: string }> = {
  default: {
    bg: "bg-muted/50",
    text: "text-foreground",
    icon: "text-muted-foreground",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    icon: "text-green-600 dark:text-green-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: "text-amber-600 dark:text-amber-500",
  },
  danger: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    icon: "text-red-600 dark:text-red-500",
  },
  gold: {
    bg: "bg-[#C8A661]/10",
    text: "text-[#C8A661]",
    icon: "text-[#C8A661]",
  },
};

const trendColors = {
  up: "text-green-600 dark:text-green-500",
  down: "text-red-600 dark:text-red-500",
  neutral: "text-muted-foreground",
};

export function KPICard({
  value,
  label,
  subtitle,
  trend,
  icon: Icon,
  variant = "default",
  size = "large",
  prefix = "",
  suffix = "",
  formatValue = true,
  className,
  onClick,
}: KPICardProps) {
  const styles = variantStyles[variant];
  const isCompact = size === "compact";

  const displayValue =
    typeof value === "number" && formatValue ? formatNumber(value) : value;

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
      ? TrendingDown
      : Minus;

  return (
    <Card
      className={cn(
        "bg-card border shadow-sm transition-shadow",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
      data-testid={`card-kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardContent className={cn("p-4", !isCompact && "p-6")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-muted-foreground truncate",
                isCompact ? "text-xs" : "text-sm"
              )}
              data-testid="text-kpi-label"
            >
              {label}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              {prefix && (
                <span className={cn("text-muted-foreground", isCompact ? "text-sm" : "text-lg")}>
                  {prefix}
                </span>
              )}
              <span
                className={cn(
                  "font-bold truncate",
                  styles.text,
                  isCompact ? "text-xl" : "text-3xl"
                )}
                data-testid="text-kpi-value"
              >
                {displayValue}
              </span>
              {suffix && (
                <span className={cn("text-muted-foreground", isCompact ? "text-xs" : "text-sm")}>
                  {suffix}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2",
                  trendColors[trend.direction]
                )}
                data-testid="container-kpi-trend"
              >
                <TrendIcon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {trend.value > 0 ? "+" : ""}
                  {trend.value.toFixed(1)}%
                </span>
                {trend.label && (
                  <span className="text-xs text-muted-foreground ml-0.5">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {Icon && (
            <div
              className={cn(
                "rounded-lg flex items-center justify-center flex-shrink-0",
                styles.bg,
                isCompact ? "h-8 w-8" : "h-10 w-10"
              )}
            >
              <Icon className={cn(styles.icon, isCompact ? "h-4 w-4" : "h-5 w-5")} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface KPIGroupProps {
  children: ReactNode;
  className?: string;
}

export function KPIGroup({ children, className }: KPIGroupProps) {
  return (
    <div
      className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4", className)}
      data-testid="container-kpi-group"
    >
      {children}
    </div>
  );
}
