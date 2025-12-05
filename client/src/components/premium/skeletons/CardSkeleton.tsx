import { cn } from "@/lib/utils";

type CardSkeletonVariant = "small" | "medium" | "large";

interface CardSkeletonProps {
  variant?: CardSkeletonVariant;
  showHeader?: boolean;
  showIcon?: boolean;
  contentRows?: number;
  showFooter?: boolean;
  showImage?: boolean;
  className?: string;
  testId?: string;
}

const variantStyles: Record<CardSkeletonVariant, {
  padding: string;
  headerHeight: string;
  contentHeight: string;
  imageHeight: string;
}> = {
  small: {
    padding: "p-4",
    headerHeight: "h-4",
    contentHeight: "h-3",
    imageHeight: "h-24",
  },
  medium: {
    padding: "p-6",
    headerHeight: "h-5",
    contentHeight: "h-4",
    imageHeight: "h-36",
  },
  large: {
    padding: "p-8",
    headerHeight: "h-6",
    contentHeight: "h-4",
    imageHeight: "h-48",
  },
};

export function CardSkeleton({
  variant = "medium",
  showHeader = true,
  showIcon = false,
  contentRows = 3,
  showFooter = false,
  showImage = false,
  className,
  testId,
}: CardSkeletonProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card overflow-hidden",
        className
      )}
      data-testid={testId || "card-skeleton"}
    >
      {showImage && (
        <div
          className={cn(
            "skeleton-shimmer w-full",
            styles.imageHeight
          )}
          data-testid={`${testId || "card-skeleton"}-image`}
        />
      )}

      <div className={cn(styles.padding, "space-y-4")}>
        {showHeader && (
          <div
            className="flex items-start gap-3"
            data-testid={`${testId || "card-skeleton"}-header`}
          >
            {showIcon && (
              <div
                className="skeleton-shimmer h-10 w-10 rounded-lg flex-shrink-0"
                data-testid={`${testId || "card-skeleton"}-icon`}
              />
            )}
            <div className="flex-1 space-y-2">
              <div
                className={cn("skeleton-shimmer rounded w-3/4", styles.headerHeight)}
                data-testid={`${testId || "card-skeleton"}-title`}
              />
              <div
                className="skeleton-shimmer-subtle rounded h-3 w-1/2"
                data-testid={`${testId || "card-skeleton"}-subtitle`}
              />
            </div>
          </div>
        )}

        <div className="space-y-3" data-testid={`${testId || "card-skeleton"}-content`}>
          {Array.from({ length: contentRows }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "skeleton-shimmer-subtle rounded",
                styles.contentHeight,
                i === contentRows - 1 ? "w-2/3" : "w-full"
              )}
              data-testid={`${testId || "card-skeleton"}-row-${i}`}
            />
          ))}
        </div>

        {showFooter && (
          <div
            className="flex items-center justify-between gap-4 pt-2 border-t border-border"
            data-testid={`${testId || "card-skeleton"}-footer`}
          >
            <div className="skeleton-shimmer rounded h-9 w-24" />
            <div className="skeleton-shimmer-subtle rounded h-9 w-20" />
          </div>
        )}
      </div>
    </div>
  );
}

interface CardSkeletonGridProps {
  count?: number;
  variant?: CardSkeletonVariant;
  columns?: 1 | 2 | 3 | 4;
  showHeader?: boolean;
  showIcon?: boolean;
  contentRows?: number;
  showFooter?: boolean;
  showImage?: boolean;
  className?: string;
  testId?: string;
}

export function CardSkeletonGrid({
  count = 6,
  variant = "medium",
  columns = 3,
  showHeader = true,
  showIcon = false,
  contentRows = 3,
  showFooter = false,
  showImage = false,
  className,
  testId,
}: CardSkeletonGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn("grid gap-6", gridCols[columns], className)}
      data-testid={testId || "card-skeleton-grid"}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton
          key={i}
          variant={variant}
          showHeader={showHeader}
          showIcon={showIcon}
          contentRows={contentRows}
          showFooter={showFooter}
          showImage={showImage}
          testId={`${testId || "card-skeleton-grid"}-item-${i}`}
        />
      ))}
    </div>
  );
}

export type { CardSkeletonProps, CardSkeletonGridProps, CardSkeletonVariant };
