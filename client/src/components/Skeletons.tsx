import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface GlassSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function GlassSkeleton({ className, ...props }: GlassSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/5 backdrop-blur-sm",
        className
      )}
      data-testid="glass-skeleton"
      {...props}
    />
  );
}

interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showHero?: boolean;
  showStats?: boolean;
  cardsCount?: number;
}

function PageSkeleton({
  className,
  showHero = true,
  showStats = true,
  cardsCount = 4,
  ...props
}: PageSkeletonProps) {
  return (
    <div
      className={cn("min-h-screen bg-background", className)}
      data-testid="skeleton-page-full"
      {...props}
    >
      {showHero && (
        <div 
          className="relative py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          data-testid="skeleton-hero"
        >
          <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
            <GlassSkeleton className="h-16 w-3/4 mx-auto rounded-xl" />
            <GlassSkeleton className="h-6 w-1/2 mx-auto" />
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <GlassSkeleton className="h-14 w-48 rounded-full" />
              <GlassSkeleton className="h-14 w-40 rounded-full" />
            </div>
            <div className="pt-8 max-w-2xl mx-auto">
              <GlassSkeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div 
          className="py-8 border-b bg-white/5 backdrop-blur-sm"
          data-testid="skeleton-stats"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <GlassSkeleton className="h-8 w-20 mx-auto" />
                  <GlassSkeleton className="h-4 w-32 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <GlassSkeleton className="h-10 w-64 mx-auto" />
          <GlassSkeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: cardsCount }).map((_, i) => (
            <CardSkeleton key={i} variant="glass" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "feature";
  showImage?: boolean;
  showActions?: boolean;
  showIcon?: boolean;
  lines?: number;
}

function CardSkeleton({
  className,
  variant = "default",
  showImage = false,
  showActions = true,
  showIcon = true,
  lines = 2,
  ...props
}: CardSkeletonProps) {
  const baseClasses = variant === "glass" 
    ? "bg-white/5 backdrop-blur-sm border border-white/10" 
    : "bg-card border";

  return (
    <div
      className={cn(
        "rounded-xl p-6 space-y-4",
        baseClasses,
        className
      )}
      data-testid="skeleton-card-premium"
      {...props}
    >
      {showImage && (
        <GlassSkeleton 
          className="h-40 w-full rounded-lg" 
          data-testid="skeleton-card-image"
        />
      )}
      <div className="space-y-3">
        {showIcon && (
          <GlassSkeleton className="h-12 w-12 rounded-lg" />
        )}
        <GlassSkeleton className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <GlassSkeleton
            key={i}
            className={cn("h-4", i === lines - 1 ? "w-1/2" : "w-full")}
          />
        ))}
      </div>
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-2">
          <GlassSkeleton className="h-9 w-24 rounded-md" />
          <GlassSkeleton className="h-9 w-20 rounded-md" />
        </div>
      )}
    </div>
  );
}

interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  variant?: "default" | "glass";
}

function TableSkeleton({
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
  variant = "default",
  ...props
}: TableSkeletonProps) {
  const baseClasses = variant === "glass"
    ? "bg-white/5 backdrop-blur-sm border-white/10"
    : "bg-card";

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        baseClasses,
        className
      )}
      data-testid="skeleton-table-premium"
      {...props}
    >
      {showHeader && (
        <div className="flex gap-4 p-4 border-b border-white/10 bg-white/5">
          {Array.from({ length: columns }).map((_, i) => (
            <GlassSkeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <GlassSkeleton
                key={colIndex}
                className={cn(
                  "h-4 flex-1",
                  colIndex === 0 && "w-1/4 flex-none"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DashboardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showHeader?: boolean;
  showOnboarding?: boolean;
  quickActionsCount?: number;
}

function DashboardSkeleton({
  className,
  showHeader = true,
  showOnboarding = true,
  quickActionsCount = 8,
  ...props
}: DashboardSkeletonProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 sm:p-6 lg:p-8",
        className
      )}
      data-testid="skeleton-dashboard-premium"
      {...props}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {showHeader && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        )}

        {showOnboarding && (
          <div 
            className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6 space-y-4"
            data-testid="skeleton-onboarding"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-transparent">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: quickActionsCount }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-4 p-4 rounded-xl border"
                >
                  <Skeleton className="h-11 w-11 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-14 w-14 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MapSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showControls?: boolean;
  showSidebar?: boolean;
  height?: string;
}

function MapSkeleton({
  className,
  showControls = true,
  showSidebar = true,
  height = "500px",
  ...props
}: MapSkeletonProps) {
  return (
    <div
      className={cn("flex gap-4", className)}
      data-testid="skeleton-map"
      {...props}
    >
      {showSidebar && (
        <div className="w-80 flex-shrink-0 space-y-4 hidden lg:block">
          <div className="rounded-xl border bg-white/5 backdrop-blur-sm p-4 space-y-4">
            <GlassSkeleton className="h-10 w-full rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <GlassSkeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <GlassSkeleton className="h-4 w-3/4" />
                    <GlassSkeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-white/5 backdrop-blur-sm p-4 space-y-3">
            <GlassSkeleton className="h-5 w-24" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <GlassSkeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <div 
          className="w-full rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden"
          style={{ height }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="relative">
                <GlassSkeleton className="h-16 w-16 rounded-full mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
              </div>
              <GlassSkeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
          
          {showControls && (
            <>
              <div className="absolute top-4 right-4 space-y-2">
                <GlassSkeleton className="h-8 w-8 rounded-md" />
                <GlassSkeleton className="h-8 w-8 rounded-md" />
              </div>
              <div className="absolute bottom-4 left-4">
                <GlassSkeleton className="h-6 w-20 rounded-md" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  fields?: number;
  showSubmit?: boolean;
  columns?: 1 | 2;
  variant?: "default" | "glass";
}

function FormSkeleton({
  className,
  fields = 4,
  showSubmit = true,
  columns = 1,
  variant = "default",
  ...props
}: FormSkeletonProps) {
  const SkeletonComponent = variant === "glass" ? GlassSkeleton : Skeleton;

  return (
    <div
      className={cn(
        "space-y-6",
        variant === "glass" && "bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10",
        className
      )}
      data-testid="skeleton-form-premium"
      {...props}
    >
      <div 
        className={cn(
          "grid gap-6",
          columns === 2 && "md:grid-cols-2"
        )}
      >
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonComponent className="h-4 w-24" />
            <SkeletonComponent className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      {showSubmit && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
          <SkeletonComponent className="h-10 w-32 rounded-md" />
          <SkeletonComponent className="h-10 w-24 rounded-md" />
        </div>
      )}
    </div>
  );
}

interface HomeSkeleton extends React.HTMLAttributes<HTMLDivElement> {}

function HomeSkeleton({ className, ...props }: HomeSkeleton) {
  return (
    <div
      className={cn("min-h-screen bg-background", className)}
      data-testid="skeleton-home"
      {...props}
    >
      <div 
        className="relative py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
        data-testid="skeleton-hero-section"
      >
        <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
          <GlassSkeleton className="h-6 w-48 mx-auto rounded-full" />
          <GlassSkeleton className="h-16 md:h-20 w-4/5 mx-auto rounded-xl" />
          <GlassSkeleton className="h-6 w-2/3 mx-auto" />
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <GlassSkeleton className="h-14 w-52 rounded-full" />
            <GlassSkeleton className="h-14 w-44 rounded-full" />
          </div>
          <div className="pt-8 max-w-2xl mx-auto">
            <GlassSkeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>

      <div className="py-8 border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-10 w-24 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="rounded-xl border bg-card p-6 space-y-4"
            >
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="space-y-2 pt-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-9 w-full rounded-md mt-4" />
            </div>
          ))}
        </div>
      </div>

      <div className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-8 w-56 mx-auto" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-5 w-72 mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-20 w-full" />
              <div className="space-y-2 pt-4 border-t">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CleanbiSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showScorePanel?: boolean;
}

function CleanbiSkeleton({
  className,
  showScorePanel = true,
  ...props
}: CleanbiSkeletonProps) {
  return (
    <div
      className={cn("min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black", className)}
      data-testid="skeleton-cleanbi"
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <GlassSkeleton className="h-10 w-64 mx-auto" />
          <GlassSkeleton className="h-5 w-96 mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto">
          <GlassSkeleton className="h-14 w-full rounded-lg" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MapSkeleton height="400px" showSidebar={false} />
          </div>
          
          {showScorePanel && (
            <div className="space-y-6">
              <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 space-y-6">
                <div className="text-center space-y-4">
                  <GlassSkeleton className="h-32 w-32 rounded-full mx-auto" />
                  <GlassSkeleton className="h-6 w-40 mx-auto" />
                  <GlassSkeleton className="h-4 w-56 mx-auto" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="text-center space-y-2 p-3 rounded-lg bg-white/5">
                      <GlassSkeleton className="h-6 w-12 mx-auto" />
                      <GlassSkeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 space-y-4">
                <GlassSkeleton className="h-5 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <GlassSkeleton className="h-4 w-4 rounded-full" />
                      <GlassSkeleton className="h-4 flex-1" />
                      <GlassSkeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export {
  GlassSkeleton,
  PageSkeleton,
  CardSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  MapSkeleton,
  FormSkeleton,
  HomeSkeleton,
  CleanbiSkeleton,
};
