import { cn } from "@/lib/utils";

interface DashboardSkeletonProps {
  kpiCount?: number;
  showChart?: boolean;
  chartHeight?: number;
  showActivityList?: boolean;
  activityItems?: number;
  showCardGrid?: boolean;
  cardCount?: number;
  className?: string;
  testId?: string;
}

function KPIRibbonSkeleton({
  count = 4,
  className,
  testId,
}: {
  count?: number;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden",
        className
      )}
      data-testid={testId || "kpi-ribbon-skeleton"}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card p-5 space-y-3"
          data-testid={`${testId || "kpi-ribbon-skeleton"}-item-${i}`}
        >
          <div className="flex items-center gap-2">
            <div className="skeleton-shimmer h-4 w-4 rounded" />
            <div className="skeleton-shimmer-subtle h-3 w-16 rounded" />
          </div>
          <div className="skeleton-shimmer h-7 w-24 rounded" />
          <div className="skeleton-shimmer-subtle h-3 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({
  height = 300,
  className,
  testId,
}: {
  height?: number;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card overflow-hidden",
        className
      )}
      data-testid={testId || "chart-skeleton"}
    >
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="skeleton-shimmer h-5 w-40 rounded" />
            <div className="skeleton-shimmer-subtle h-3 w-56 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton-shimmer-subtle h-9 w-28 rounded-lg" />
            <div className="skeleton-shimmer-subtle h-9 w-24 rounded-lg" />
          </div>
        </div>

        <div
          className="skeleton-shimmer-subtle rounded-lg"
          style={{ height }}
          data-testid={`${testId || "chart-skeleton"}-area`}
        />

        <div className="flex flex-wrap justify-center gap-6 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="skeleton-shimmer h-3 w-3 rounded-full" />
              <div className="skeleton-shimmer-subtle h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityListSkeleton({
  items = 5,
  className,
  testId,
}: {
  items?: number;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card overflow-hidden",
        className
      )}
      data-testid={testId || "activity-list-skeleton"}
    >
      <div className="p-6 pb-4 border-b border-border">
        <div className="skeleton-shimmer h-5 w-32 rounded" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: items }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4"
            style={{ animationDelay: `${i * 100}ms` }}
            data-testid={`${testId || "activity-list-skeleton"}-item-${i}`}
          >
            <div className="skeleton-shimmer h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="skeleton-shimmer h-4 w-3/4 rounded" />
              <div className="skeleton-shimmer-subtle h-3 w-1/2 rounded" />
            </div>
            <div className="skeleton-shimmer-subtle h-3 w-16 rounded flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CardGridSkeleton({
  count = 4,
  columns = 2,
  className,
  testId,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
  testId?: string;
}) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn("grid gap-6", gridCols[columns], className)}
      data-testid={testId || "card-grid-skeleton"}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-card-border bg-card p-6 space-y-4"
          data-testid={`${testId || "card-grid-skeleton"}-item-${i}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
            <div className="skeleton-shimmer-subtle h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="skeleton-shimmer h-4 w-2/3 rounded" />
            <div className="skeleton-shimmer-subtle h-3 w-full rounded" />
          </div>
          <div className="skeleton-shimmer h-8 w-28 rounded" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton({
  kpiCount = 4,
  showChart = true,
  chartHeight = 300,
  showActivityList = true,
  activityItems = 5,
  showCardGrid = false,
  cardCount = 4,
  className,
  testId,
}: DashboardSkeletonProps) {
  return (
    <div
      className={cn("space-y-6", className)}
      data-testid={testId || "dashboard-skeleton"}
    >
      <KPIRibbonSkeleton
        count={kpiCount}
        testId={`${testId || "dashboard-skeleton"}-kpi`}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {showChart && (
            <ChartSkeleton
              height={chartHeight}
              testId={`${testId || "dashboard-skeleton"}-chart`}
            />
          )}
          {showCardGrid && (
            <CardGridSkeleton
              count={cardCount}
              testId={`${testId || "dashboard-skeleton"}-cards`}
            />
          )}
        </div>
        {showActivityList && (
          <ActivityListSkeleton
            items={activityItems}
            testId={`${testId || "dashboard-skeleton"}-activity`}
          />
        )}
      </div>
    </div>
  );
}

export {
  KPIRibbonSkeleton,
  ChartSkeleton,
  ActivityListSkeleton,
  CardGridSkeleton,
};

export type { DashboardSkeletonProps };
