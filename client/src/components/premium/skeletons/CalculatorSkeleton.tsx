import { cn } from "@/lib/utils";

interface CalculatorSkeletonProps {
  showHeader?: boolean;
  inputGroups?: number;
  fieldsPerGroup?: number;
  showInsights?: boolean;
  showBenchmarks?: boolean;
  className?: string;
  testId?: string;
}

function ResultPanelSkeleton({
  className,
  testId,
}: {
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card overflow-hidden",
        className
      )}
      data-testid={testId || "result-panel-skeleton"}
    >
      <div className="relative bg-gradient-to-br from-muted/50 via-card to-muted/30 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer h-5 w-5 rounded" />
              <div className="skeleton-shimmer-subtle h-3 w-24 rounded" />
            </div>
            <div className="skeleton-shimmer h-12 w-48 rounded-lg" />
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer-subtle h-4 w-4 rounded" />
              <div className="skeleton-shimmer-subtle h-4 w-16 rounded" />
            </div>
          </div>
          <div className="skeleton-shimmer h-9 w-36 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card p-4 md:p-5 space-y-2"
            data-testid={`${testId || "result-panel-skeleton"}-metric-${i}`}
          >
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer-subtle h-3 w-3 rounded" />
              <div className="skeleton-shimmer-subtle h-3 w-20 rounded" />
            </div>
            <div className="skeleton-shimmer h-6 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function InputGroupSkeleton({
  fields = 4,
  className,
  testId,
}: {
  fields?: number;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card p-6 space-y-6",
        className
      )}
      data-testid={testId || "input-group-skeleton"}
    >
      <div className="space-y-1">
        <div className="skeleton-shimmer h-5 w-32 rounded" />
        <div className="skeleton-shimmer-subtle h-3 w-48 rounded" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div
            key={i}
            className="space-y-2"
            data-testid={`${testId || "input-group-skeleton"}-field-${i}`}
          >
            <div className="skeleton-shimmer-subtle h-4 w-28 rounded" />
            <div className="skeleton-shimmer h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsPanelSkeleton({
  className,
  testId,
}: {
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card p-6 space-y-6",
        className
      )}
      data-testid={testId || "insights-panel-skeleton"}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-4 w-4 rounded" />
          <div className="skeleton-shimmer h-4 w-24 rounded" />
        </div>
        <div className="skeleton-shimmer-subtle h-4 w-4 rounded" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-4 w-4 rounded" />
          <div className="skeleton-shimmer h-4 w-32 rounded" />
          <div className="skeleton-shimmer-subtle h-5 w-12 rounded-full" />
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border p-3 space-y-2"
            data-testid={`${testId || "insights-panel-skeleton"}-insight-${i}`}
          >
            <div className="flex items-start gap-2.5">
              <div className="skeleton-shimmer h-4 w-4 rounded mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                <div className="skeleton-shimmer-subtle h-3 w-full rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <div className="skeleton-shimmer h-4 w-28 rounded" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2"
            data-testid={`${testId || "insights-panel-skeleton"}-benchmark-${i}`}
          >
            <div className="flex justify-between">
              <div className="skeleton-shimmer-subtle h-3 w-24 rounded" />
              <div className="skeleton-shimmer-subtle h-3 w-16 rounded" />
            </div>
            <div className="skeleton-shimmer h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButtonsSkeleton({
  className,
  testId,
}: {
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 pt-4",
        className
      )}
      data-testid={testId || "action-buttons-skeleton"}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="skeleton-shimmer h-10 w-32 rounded-lg" />
        <div className="skeleton-shimmer-subtle h-10 w-24 rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <div className="skeleton-shimmer-subtle h-9 w-9 rounded-lg" />
        <div className="skeleton-shimmer-subtle h-9 w-9 rounded-lg" />
        <div className="skeleton-shimmer-subtle h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

export function CalculatorSkeleton({
  showHeader = true,
  inputGroups = 1,
  fieldsPerGroup = 4,
  showInsights = true,
  showBenchmarks = true,
  className,
  testId,
}: CalculatorSkeletonProps) {
  return (
    <div
      className={cn("space-y-8", className)}
      data-testid={testId || "calculator-skeleton"}
    >
      {showHeader && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <div className="skeleton-shimmer h-7 w-64 rounded" />
              <div className="skeleton-shimmer-subtle h-4 w-96 rounded" />
            </div>
          </div>
        </div>
      )}

      <ResultPanelSkeleton testId={`${testId || "calculator-skeleton"}-result`} />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {Array.from({ length: inputGroups }).map((_, i) => (
            <InputGroupSkeleton
              key={i}
              fields={fieldsPerGroup}
              testId={`${testId || "calculator-skeleton"}-input-group-${i}`}
            />
          ))}
        </div>

        {(showInsights || showBenchmarks) && (
          <InsightsPanelSkeleton
            testId={`${testId || "calculator-skeleton"}-insights`}
          />
        )}
      </div>

      <ActionButtonsSkeleton
        testId={`${testId || "calculator-skeleton"}-actions`}
      />
    </div>
  );
}

export {
  ResultPanelSkeleton,
  InputGroupSkeleton,
  InsightsPanelSkeleton,
  ActionButtonsSkeleton,
};

export type { CalculatorSkeletonProps };
