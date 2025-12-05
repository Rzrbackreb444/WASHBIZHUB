import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LucideIcon,
  Inbox,
  AlertCircle,
  Search,
  Clock,
  FileQuestion,
  PackageOpen,
  FolderOpen,
} from "lucide-react";

type EmptyStateVariant = "no-data" | "error" | "no-results" | "coming-soon";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  testId?: string;
}

const variantDefaults: Record<EmptyStateVariant, {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}> = {
  "no-data": {
    icon: Inbox,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  "no-results": {
    icon: Search,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
  },
  "coming-soon": {
    icon: Clock,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
  },
};

export function EmptyState({
  variant = "no-data",
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  testId,
}: EmptyStateProps) {
  const defaults = variantDefaults[variant];
  const IconComponent = icon || defaults.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
      data-testid={testId || "empty-state"}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={cn(
          "flex items-center justify-center w-16 h-16 rounded-full mb-5",
          defaults.iconBg
        )}
        data-testid={`${testId || "empty-state"}-icon-container`}
      >
        <IconComponent
          className={cn("w-8 h-8", defaults.iconColor)}
          data-testid={`${testId || "empty-state"}-icon`}
        />
      </motion.div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-2 max-w-md"
      >
        <h3
          className="text-lg font-semibold text-foreground"
          data-testid={`${testId || "empty-state"}-title`}
        >
          {title}
        </h3>
        {description && (
          <p
            className="text-sm text-muted-foreground leading-relaxed"
            data-testid={`${testId || "empty-state"}-description`}
          >
            {description}
          </p>
        )}
      </motion.div>

      {(primaryAction || secondaryAction) && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3 mt-6"
        >
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              disabled={primaryAction.loading}
              className="min-w-[140px]"
              data-testid={`${testId || "empty-state"}-primary-action`}
            >
              {primaryAction.loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading...
                </span>
              ) : (
                primaryAction.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="text-muted-foreground hover:text-foreground"
              data-testid={`${testId || "empty-state"}-secondary-action`}
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

interface EmptyStateCardProps extends EmptyStateProps {
  bordered?: boolean;
  elevated?: boolean;
}

export function EmptyStateCard({
  bordered = true,
  elevated = false,
  className,
  ...props
}: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card",
        bordered && "border border-card-border",
        elevated && "shadow-md",
        className
      )}
    >
      <EmptyState {...props} />
    </div>
  );
}

export function NoDataState({
  title = "No data yet",
  description = "Get started by adding your first item.",
  icon,
  ...props
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      variant="no-data"
      icon={icon || FolderOpen}
      title={title}
      description={description}
      {...props}
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error while loading. Please try again.",
  ...props
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      {...props}
    />
  );
}

export function NoResultsState({
  title = "No results found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  icon,
  ...props
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      variant="no-results"
      icon={icon || FileQuestion}
      title={title}
      description={description}
      {...props}
    />
  );
}

export function ComingSoonState({
  title = "Coming soon",
  description = "We're working on this feature. Check back soon!",
  icon,
  ...props
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      variant="coming-soon"
      icon={icon || PackageOpen}
      title={title}
      description={description}
      {...props}
    />
  );
}

export type { EmptyStateProps, EmptyStateCardProps, EmptyStateVariant };
