import { cn } from "@/lib/utils";

type ListingSkeletonVariant = "card" | "horizontal" | "compact";

interface ListingSkeletonProps {
  variant?: ListingSkeletonVariant;
  showBadges?: boolean;
  showActions?: boolean;
  showMetrics?: boolean;
  className?: string;
  testId?: string;
}

export function ListingSkeleton({
  variant = "card",
  showBadges = true,
  showActions = true,
  showMetrics = true,
  className,
  testId,
}: ListingSkeletonProps) {
  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "rounded-xl border border-card-border bg-card overflow-hidden flex flex-col md:flex-row",
          className
        )}
        data-testid={testId || "listing-skeleton-horizontal"}
      >
        <div
          className="skeleton-shimmer w-full md:w-64 h-48 md:h-auto flex-shrink-0"
          data-testid={`${testId || "listing-skeleton"}-image`}
        />
        <div className="flex-1 p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="skeleton-shimmer h-6 w-3/4 rounded" />
              <div className="skeleton-shimmer-subtle h-4 w-1/2 rounded" />
            </div>
            <div className="skeleton-shimmer h-8 w-28 rounded-lg" />
          </div>

          {showBadges && (
            <div className="flex flex-wrap gap-2">
              <div className="skeleton-shimmer h-6 w-20 rounded-full" />
              <div className="skeleton-shimmer-subtle h-6 w-16 rounded-full" />
              <div className="skeleton-shimmer-subtle h-6 w-24 rounded-full" />
            </div>
          )}

          {showMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="skeleton-shimmer-subtle h-3 w-16 rounded" />
                  <div className="skeleton-shimmer h-5 w-20 rounded" />
                </div>
              ))}
            </div>
          )}

          {showActions && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="skeleton-shimmer h-10 w-28 rounded-lg" />
              <div className="skeleton-shimmer-subtle h-10 w-24 rounded-lg" />
              <div className="skeleton-shimmer-subtle h-9 w-9 rounded-lg ml-auto" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border border-card-border bg-card p-4 flex items-center gap-4",
          className
        )}
        data-testid={testId || "listing-skeleton-compact"}
      >
        <div
          className="skeleton-shimmer h-16 w-16 rounded-lg flex-shrink-0"
          data-testid={`${testId || "listing-skeleton"}-image`}
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer-subtle h-3 w-1/2 rounded" />
        </div>
        <div className="skeleton-shimmer h-6 w-20 rounded-lg flex-shrink-0" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card overflow-hidden",
        className
      )}
      data-testid={testId || "listing-skeleton-card"}
    >
      <div className="relative">
        <div
          className="skeleton-shimmer w-full h-48"
          data-testid={`${testId || "listing-skeleton"}-image`}
        />
        {showBadges && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <div className="skeleton-shimmer h-6 w-20 rounded-full bg-card/80 backdrop-blur-sm" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="skeleton-shimmer h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm" />
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="skeleton-shimmer h-5 w-4/5 rounded" />
            <div className="skeleton-shimmer-subtle h-3 w-2/3 rounded" />
          </div>
        </div>

        <div className="skeleton-shimmer h-7 w-32 rounded-lg" />

        {showMetrics && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="space-y-1 pt-3">
              <div className="skeleton-shimmer-subtle h-3 w-12 rounded" />
              <div className="skeleton-shimmer h-4 w-16 rounded" />
            </div>
            <div className="space-y-1 pt-3">
              <div className="skeleton-shimmer-subtle h-3 w-14 rounded" />
              <div className="skeleton-shimmer h-4 w-20 rounded" />
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer h-10 flex-1 rounded-lg" />
            <div className="skeleton-shimmer-subtle h-10 w-10 rounded-lg flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}

interface ListingSkeletonGridProps {
  count?: number;
  variant?: ListingSkeletonVariant;
  columns?: 1 | 2 | 3 | 4;
  showBadges?: boolean;
  showActions?: boolean;
  showMetrics?: boolean;
  className?: string;
  testId?: string;
}

export function ListingSkeletonGrid({
  count = 6,
  variant = "card",
  columns = 3,
  showBadges = true,
  showActions = true,
  showMetrics = true,
  className,
  testId,
}: ListingSkeletonGridProps) {
  const gridCols =
    variant === "horizontal"
      ? "grid-cols-1"
      : variant === "compact"
        ? "grid-cols-1 md:grid-cols-2"
        : {
            1: "grid-cols-1",
            2: "grid-cols-1 md:grid-cols-2",
            3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          }[columns];

  return (
    <div
      className={cn("grid gap-6", gridCols, className)}
      data-testid={testId || "listing-skeleton-grid"}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeleton
          key={i}
          variant={variant}
          showBadges={showBadges}
          showActions={showActions}
          showMetrics={showMetrics}
          testId={`${testId || "listing-skeleton-grid"}-item-${i}`}
        />
      ))}
    </div>
  );
}

export type { ListingSkeletonProps, ListingSkeletonGridProps, ListingSkeletonVariant };
