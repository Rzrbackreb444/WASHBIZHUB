import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      data-testid="skeleton-base"
      {...props}
    />
  )
}

interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showImage?: boolean
  showActions?: boolean
  lines?: number
}

function CardSkeleton({
  className,
  showImage = false,
  showActions = true,
  lines = 2,
  ...props
}: CardSkeletonProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card p-6 space-y-4", className)}
      data-testid="skeleton-card"
      {...props}
    >
      {showImage && (
        <Skeleton 
          className="h-40 w-full rounded-md" 
          data-testid="skeleton-card-image"
        />
      )}
      <div className="space-y-3">
        <Skeleton 
          className="h-5 w-3/4" 
          data-testid="skeleton-card-title"
        />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", i === lines - 1 ? "w-1/2" : "w-full")}
            data-testid={`skeleton-card-line-${i}`}
          />
        ))}
      </div>
      {showActions && (
        <div className="flex gap-2 pt-2" data-testid="skeleton-card-actions">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      )}
    </div>
  )
}

interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
  columns?: number
  showHeader?: boolean
}

function TableSkeleton({
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
  ...props
}: TableSkeletonProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card overflow-hidden", className)}
      data-testid="skeleton-table"
      {...props}
    >
      {showHeader && (
        <div 
          className="flex gap-4 p-4 border-b bg-muted/50"
          data-testid="skeleton-table-header"
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4 flex-1"
              data-testid={`skeleton-table-header-cell-${i}`}
            />
          ))}
        </div>
      )}
      <div className="divide-y" data-testid="skeleton-table-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex gap-4 p-4"
            data-testid={`skeleton-table-row-${rowIndex}`}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  "h-4 flex-1",
                  colIndex === 0 && "w-1/4 flex-none"
                )}
                data-testid={`skeleton-table-cell-${rowIndex}-${colIndex}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface DashboardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  kpiCount?: number
  showChart?: boolean
  chartHeight?: number
}

function DashboardSkeleton({
  className,
  kpiCount = 4,
  showChart = true,
  chartHeight = 300,
  ...props
}: DashboardSkeletonProps) {
  return (
    <div
      className={cn("space-y-6", className)}
      data-testid="skeleton-dashboard"
      {...props}
    >
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        data-testid="skeleton-dashboard-kpis"
      >
        {Array.from({ length: kpiCount }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-4 space-y-3"
            data-testid={`skeleton-dashboard-kpi-${i}`}
          >
            <Skeleton className="h-4 w-1/2" data-testid={`skeleton-kpi-label-${i}`} />
            <Skeleton className="h-8 w-3/4" data-testid={`skeleton-kpi-value-${i}`} />
            <Skeleton className="h-3 w-2/3" data-testid={`skeleton-kpi-trend-${i}`} />
          </div>
        ))}
      </div>
      {showChart && (
        <div
          className="rounded-lg border bg-card p-6"
          data-testid="skeleton-dashboard-chart"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <Skeleton className="h-5 w-40" data-testid="skeleton-chart-title" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-md" data-testid="skeleton-chart-filter-1" />
                <Skeleton className="h-8 w-24 rounded-md" data-testid="skeleton-chart-filter-2" />
              </div>
            </div>
            <Skeleton 
              className="w-full rounded-md" 
              style={{ height: chartHeight }}
              data-testid="skeleton-chart-area"
            />
            <div className="flex flex-wrap justify-center gap-6 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" data-testid={`skeleton-chart-legend-dot-${i}`} />
                  <Skeleton className="h-3 w-16" data-testid={`skeleton-chart-legend-label-${i}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ListSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number
  showAvatar?: boolean
  showSecondaryText?: boolean
  showAction?: boolean
}

function ListSkeleton({
  className,
  items = 5,
  showAvatar = true,
  showSecondaryText = true,
  showAction = false,
  ...props
}: ListSkeletonProps) {
  return (
    <div
      className={cn("space-y-1", className)}
      data-testid="skeleton-list"
      {...props}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-lg"
          data-testid={`skeleton-list-item-${i}`}
        >
          {showAvatar && (
            <Skeleton 
              className="h-10 w-10 rounded-full flex-shrink-0" 
              data-testid={`skeleton-list-avatar-${i}`}
            />
          )}
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton 
              className="h-4 w-3/4" 
              data-testid={`skeleton-list-primary-${i}`}
            />
            {showSecondaryText && (
              <Skeleton 
                className="h-3 w-1/2" 
                data-testid={`skeleton-list-secondary-${i}`}
              />
            )}
          </div>
          {showAction && (
            <Skeleton 
              className="h-8 w-8 rounded-md flex-shrink-0" 
              data-testid={`skeleton-list-action-${i}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

interface FormSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  fields?: number
  showSubmit?: boolean
  columns?: 1 | 2
}

function FormSkeleton({
  className,
  fields = 4,
  showSubmit = true,
  columns = 1,
  ...props
}: FormSkeletonProps) {
  return (
    <div
      className={cn("space-y-6", className)}
      data-testid="skeleton-form"
      {...props}
    >
      <div 
        className={cn(
          "grid gap-6",
          columns === 2 && "md:grid-cols-2"
        )}
        data-testid="skeleton-form-fields"
      >
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2" data-testid={`skeleton-form-field-${i}`}>
            <Skeleton 
              className="h-4 w-24" 
              data-testid={`skeleton-form-label-${i}`}
            />
            <Skeleton 
              className="h-10 w-full rounded-md" 
              data-testid={`skeleton-form-input-${i}`}
            />
          </div>
        ))}
      </div>
      {showSubmit && (
        <div 
          className="flex flex-wrap gap-3 pt-2"
          data-testid="skeleton-form-actions"
        >
          <Skeleton 
            className="h-10 w-32 rounded-md" 
            data-testid="skeleton-form-submit"
          />
          <Skeleton 
            className="h-10 w-24 rounded-md" 
            data-testid="skeleton-form-cancel"
          />
        </div>
      )}
    </div>
  )
}

interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showHeader?: boolean
  showSidebar?: boolean
  contentType?: "cards" | "table" | "list" | "dashboard"
}

function PageSkeleton({
  className,
  showHeader = true,
  showSidebar = false,
  contentType = "cards",
  ...props
}: PageSkeletonProps) {
  return (
    <div
      className={cn("min-h-screen", className)}
      data-testid="skeleton-page"
      {...props}
    >
      {showHeader && (
        <div 
          className="border-b p-4 flex flex-wrap gap-4 items-center justify-between"
          data-testid="skeleton-page-header"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-md" data-testid="skeleton-page-logo" />
            <Skeleton className="h-6 w-40" data-testid="skeleton-page-title" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" data-testid="skeleton-page-avatar" />
          </div>
        </div>
      )}
      <div className={cn("flex", showSidebar && "")}>
        {showSidebar && (
          <div 
            className="w-64 border-r p-4 space-y-2 hidden md:block"
            data-testid="skeleton-page-sidebar"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 p-6" data-testid="skeleton-page-content">
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
            <Skeleton className="h-8 w-48" data-testid="skeleton-content-title" />
            <Skeleton className="h-9 w-32 rounded-md" data-testid="skeleton-content-action" />
          </div>
          {contentType === "cards" && (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} data-testid={`skeleton-page-card-${i}`} />
              ))}
            </div>
          )}
          {contentType === "table" && <TableSkeleton />}
          {contentType === "list" && <ListSkeleton items={8} />}
          {contentType === "dashboard" && <DashboardSkeleton />}
        </div>
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  DashboardSkeleton, 
  ListSkeleton, 
  FormSkeleton,
  PageSkeleton 
}
