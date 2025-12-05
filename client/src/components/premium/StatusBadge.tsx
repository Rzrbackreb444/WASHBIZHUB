import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatusVariant = "success" | "warning" | "error" | "info" | "neutral" | "premium";

interface StatusBadgeProps {
  variant?: StatusVariant;
  label: string;
  icon?: LucideIcon;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  testId?: string;
}

const variantStyles: Record<
  StatusVariant,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  neutral: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
  premium: {
    bg: "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50",
    text: "text-amber-800 dark:text-amber-200",
    border: "border-amber-300 dark:border-amber-700",
    dot: "bg-gradient-to-r from-amber-500 to-yellow-500",
  },
};

const sizeStyles = {
  sm: {
    container: "px-2 py-0.5 text-xs gap-1",
    icon: "h-3 w-3",
    dot: "h-1.5 w-1.5",
  },
  md: {
    container: "px-2.5 py-1 text-xs gap-1.5",
    icon: "h-3.5 w-3.5",
    dot: "h-2 w-2",
  },
  lg: {
    container: "px-3 py-1.5 text-sm gap-2",
    icon: "h-4 w-4",
    dot: "h-2.5 w-2.5",
  },
};

export function StatusBadge({
  variant = "neutral",
  label,
  icon: Icon,
  pulse = false,
  size = "md",
  className,
  testId,
}: StatusBadgeProps) {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center font-semibold rounded-full border",
        "whitespace-nowrap",
        styles.bg,
        styles.text,
        styles.border,
        sizes.container,
        className
      )}
      data-testid={testId || `status-badge-${variant}`}
    >
      {pulse && !Icon && (
        <span className="relative flex" data-testid={`${testId || "status-badge"}-pulse`}>
          <span
            className={cn(
              "absolute inline-flex rounded-full opacity-75 animate-ping",
              styles.dot,
              sizes.dot
            )}
          />
          <span className={cn("relative inline-flex rounded-full", styles.dot, sizes.dot)} />
        </span>
      )}

      {Icon && (
        <Icon
          className={cn(sizes.icon, pulse && "animate-pulse")}
          data-testid={`${testId || "status-badge"}-icon`}
        />
      )}

      <span data-testid={`${testId || "status-badge"}-label`}>{label}</span>
    </motion.div>
  );
}

interface StatusDotProps {
  variant?: StatusVariant;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  testId?: string;
}

export function StatusDot({
  variant = "neutral",
  pulse = false,
  size = "md",
  className,
  testId,
}: StatusDotProps) {
  const styles = variantStyles[variant];
  const dotSizes = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      data-testid={testId || `status-dot-${variant}`}
    >
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex rounded-full opacity-75 animate-ping",
            styles.dot,
            dotSizes[size]
          )}
          data-testid={`${testId || "status-dot"}-ping`}
        />
      )}
      <span
        className={cn("relative inline-flex rounded-full", styles.dot, dotSizes[size])}
        data-testid={`${testId || "status-dot"}-core`}
      />
    </span>
  );
}

export type { StatusBadgeProps, StatusDotProps, StatusVariant };
