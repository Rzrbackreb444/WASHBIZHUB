import { cn } from "@/lib/utils";

interface TableColumn {
  width?: string;
  align?: "left" | "center" | "right";
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number | TableColumn[];
  showHeader?: boolean;
  showCheckbox?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  testId?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showCheckbox = false,
  showActions = false,
  compact = false,
  className,
  testId,
}: TableSkeletonProps) {
  const columnCount = typeof columns === "number" ? columns : columns.length;
  const columnConfigs: TableColumn[] = typeof columns === "number"
    ? Array.from({ length: columns }, () => ({ width: "flex-1" }))
    : columns;

  const cellPadding = compact ? "px-3 py-2" : "px-4 py-3";
  const headerPadding = compact ? "px-3 py-2" : "px-4 py-3";

  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card overflow-hidden",
        className
      )}
      data-testid={testId || "table-skeleton"}
    >
      {showHeader && (
        <div
          className={cn(
            "flex items-center gap-4 bg-muted/50 border-b border-border",
            headerPadding
          )}
          data-testid={`${testId || "table-skeleton"}-header`}
        >
          {showCheckbox && (
            <div
              className="skeleton-shimmer h-4 w-4 rounded flex-shrink-0"
              data-testid={`${testId || "table-skeleton"}-header-checkbox`}
            />
          )}
          {columnConfigs.map((col, i) => (
            <div
              key={i}
              className={cn(
                "skeleton-shimmer h-3 rounded",
                col.width || "flex-1",
                i === 0 && "w-1/4 flex-none"
              )}
              data-testid={`${testId || "table-skeleton"}-header-col-${i}`}
            />
          ))}
          {showActions && (
            <div
              className="skeleton-shimmer h-3 w-16 rounded flex-shrink-0"
              data-testid={`${testId || "table-skeleton"}-header-actions`}
            />
          )}
        </div>
      )}

      <div
        className="divide-y divide-border"
        data-testid={`${testId || "table-skeleton"}-body`}
      >
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={cn("flex items-center gap-4", cellPadding)}
            data-testid={`${testId || "table-skeleton"}-row-${rowIndex}`}
          >
            {showCheckbox && (
              <div
                className="skeleton-shimmer-subtle h-4 w-4 rounded flex-shrink-0"
                data-testid={`${testId || "table-skeleton"}-row-${rowIndex}-checkbox`}
              />
            )}
            {columnConfigs.map((col, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  "skeleton-shimmer-subtle h-4 rounded",
                  col.width || "flex-1",
                  colIndex === 0 && "w-1/4 flex-none skeleton-shimmer"
                )}
                style={{
                  animationDelay: `${rowIndex * 100 + colIndex * 50}ms`,
                }}
                data-testid={`${testId || "table-skeleton"}-cell-${rowIndex}-${colIndex}`}
              />
            ))}
            {showActions && (
              <div
                className="flex gap-2 flex-shrink-0"
                data-testid={`${testId || "table-skeleton"}-row-${rowIndex}-actions`}
              >
                <div className="skeleton-shimmer-subtle h-8 w-8 rounded" />
                <div className="skeleton-shimmer-subtle h-8 w-8 rounded" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TableSkeletonWithPaginationProps extends TableSkeletonProps {
  showPagination?: boolean;
}

export function TableSkeletonWithPagination({
  showPagination = true,
  ...props
}: TableSkeletonWithPaginationProps) {
  return (
    <div className="space-y-4">
      <TableSkeleton {...props} />
      {showPagination && (
        <div
          className="flex items-center justify-between"
          data-testid={`${props.testId || "table-skeleton"}-pagination`}
        >
          <div className="skeleton-shimmer-subtle h-4 w-32 rounded" />
          <div className="flex items-center gap-2">
            <div className="skeleton-shimmer-subtle h-9 w-9 rounded" />
            <div className="skeleton-shimmer-subtle h-9 w-9 rounded" />
            <div className="skeleton-shimmer-subtle h-9 w-9 rounded" />
            <div className="skeleton-shimmer-subtle h-9 w-9 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}

export type { TableSkeletonProps, TableColumn, TableSkeletonWithPaginationProps };
