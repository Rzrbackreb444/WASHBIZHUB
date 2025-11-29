import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  ListSkeleton,
  FormSkeleton,
  PageSkeleton
} from "@/components/ui/skeleton"

type LoadingType = "page" | "section" | "card" | "list" | "table" | "dashboard" | "form"

interface LoadingFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: LoadingType
  count?: number
  showHeader?: boolean
  showSidebar?: boolean
  columns?: number
  rows?: number
  showImage?: boolean
  showAvatar?: boolean
  showActions?: boolean
  message?: string
}

function LoadingFallback({
  className,
  type = "section",
  count = 3,
  showHeader = true,
  showSidebar = false,
  columns = 4,
  rows = 5,
  showImage = false,
  showAvatar = true,
  showActions = true,
  message,
  ...props
}: LoadingFallbackProps) {
  const renderContent = () => {
    switch (type) {
      case "page":
        return (
          <PageSkeleton
            showHeader={showHeader}
            showSidebar={showSidebar}
            contentType="cards"
          />
        )

      case "dashboard":
        return (
          <div className="space-y-6 p-6" data-testid="loading-fallback-dashboard">
            {showHeader && (
              <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <Skeleton className="h-8 w-48" data-testid="loading-dashboard-title" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-32 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            )}
            <DashboardSkeleton kpiCount={count} />
          </div>
        )

      case "table":
        return (
          <div className="space-y-4 p-6" data-testid="loading-fallback-table">
            {showHeader && (
              <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                <Skeleton className="h-8 w-48" data-testid="loading-table-title" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-40 rounded-md" data-testid="loading-table-search" />
                  <Skeleton className="h-9 w-24 rounded-md" data-testid="loading-table-filter" />
                </div>
              </div>
            )}
            <TableSkeleton rows={rows} columns={columns} />
            <div className="flex flex-wrap gap-4 items-center justify-between pt-4">
              <Skeleton className="h-4 w-32" data-testid="loading-table-count" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="h-8 w-8 rounded-md" 
                    data-testid={`loading-table-page-${i}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )

      case "list":
        return (
          <div className="space-y-4 p-6" data-testid="loading-fallback-list">
            {showHeader && (
              <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                <Skeleton className="h-8 w-48" data-testid="loading-list-title" />
                <Skeleton className="h-9 w-32 rounded-md" data-testid="loading-list-action" />
              </div>
            )}
            <ListSkeleton 
              items={count} 
              showAvatar={showAvatar}
              showAction={showActions}
            />
          </div>
        )

      case "card":
        return (
          <div className="p-6" data-testid="loading-fallback-cards">
            {showHeader && (
              <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <Skeleton className="h-8 w-48" data-testid="loading-cards-title" />
                <Skeleton className="h-9 w-32 rounded-md" data-testid="loading-cards-action" />
              </div>
            )}
            <div 
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              data-testid="loading-cards-grid"
            >
              {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton
                  key={i}
                  showImage={showImage}
                  showActions={showActions}
                  data-testid={`loading-card-${i}`}
                />
              ))}
            </div>
          </div>
        )

      case "form":
        return (
          <div className="max-w-2xl mx-auto p-6" data-testid="loading-fallback-form">
            {showHeader && (
              <div className="mb-6">
                <Skeleton className="h-8 w-48 mb-2" data-testid="loading-form-title" />
                <Skeleton className="h-4 w-80" data-testid="loading-form-description" />
              </div>
            )}
            <FormSkeleton fields={count} columns={columns > 1 ? 2 : 1} />
          </div>
        )

      case "section":
      default:
        return (
          <div className="space-y-4 p-6" data-testid="loading-fallback-section">
            {showHeader && (
              <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" data-testid="loading-section-title" />
                  <Skeleton className="h-4 w-64" data-testid="loading-section-subtitle" />
                </div>
                <Skeleton className="h-9 w-28 rounded-md" data-testid="loading-section-action" />
              </div>
            )}
            <div className="space-y-3">
              {Array.from({ length: count }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className={cn("h-4", i === count - 1 ? "w-3/4" : "w-full")}
                  data-testid={`loading-section-line-${i}`}
                />
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div
      className={cn("animate-in fade-in-50 duration-300", className)}
      role="status"
      aria-label={message || "Loading content"}
      data-testid="loading-fallback"
      {...props}
    >
      {renderContent()}
      {message && (
        <p 
          className="text-sm text-muted-foreground text-center mt-4"
          data-testid="loading-message"
        >
          {message}
        </p>
      )}
      <span className="sr-only">{message || "Loading..."}</span>
    </div>
  )
}

interface InlineLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

function InlineLoading({ className, size = "md", ...props }: InlineLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-24",
    md: "h-5 w-32",
    lg: "h-6 w-40"
  }

  return (
    <Skeleton 
      className={cn(sizeClasses[size], className)} 
      data-testid="loading-inline"
      {...props}
    />
  )
}

interface ButtonLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "wide"
}

function ButtonLoading({ className, variant = "default", ...props }: ButtonLoadingProps) {
  return (
    <Skeleton 
      className={cn(
        "h-10 rounded-md",
        variant === "wide" ? "w-full" : "w-28",
        className
      )} 
      data-testid="loading-button"
      {...props}
    />
  )
}

function SpinnerLoading() {
  return (
    <div 
      className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      data-testid="spinner-loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-accent animate-spin" />
          <Loader2 className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-white/70 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}

function FullPageLoadingFallback() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      data-testid="fullpage-loading-fallback"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-accent animate-spin" />
          <Loader2 className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-white/80 text-base font-medium">Loading...</p>
      </div>
    </div>
  )
}

export { 
  LoadingFallback, 
  InlineLoading, 
  ButtonLoading, 
  SpinnerLoading, 
  FullPageLoadingFallback 
}

export default LoadingFallback
