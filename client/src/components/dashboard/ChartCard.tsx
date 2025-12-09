import { ReactNode } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  filter?: {
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    placeholder?: string;
  };
  onRefresh?: () => void;
  headerAction?: ReactNode;
  className?: string;
  contentClassName?: string;
  minHeight?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  isLoading = false,
  isEmpty = false,
  emptyTitle = "No data available",
  emptyDescription = "There's no data to display for this period.",
  emptyAction,
  filter,
  onRefresh,
  headerAction,
  className,
  contentClassName,
  minHeight = "300px",
}: ChartCardProps) {
  return (
    <Card
      className={cn("bg-card border shadow-sm overflow-hidden", className)}
      data-testid={`card-chart-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold text-foreground truncate">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {filter && (
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger
                className="w-[140px] h-8 text-xs"
                data-testid="select-chart-filter"
              >
                <SelectValue placeholder={filter.placeholder || "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    data-testid={`option-filter-${option.value}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              className="h-8 w-8"
              data-testid="button-refresh-chart"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}

          {headerAction}
        </div>
      </CardHeader>

      <CardContent className={cn("pb-6", contentClassName)}>
        <div style={{ minHeight }}>
          {isLoading ? (
            <ChartLoadingState height={minHeight} />
          ) : isEmpty ? (
            <ChartEmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
              height={minHeight}
            />
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartLoadingStateProps {
  height: string;
}

function ChartLoadingState({ height }: ChartLoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ height }}
      data-testid="container-chart-loading"
    >
      <div className="space-y-3 w-full max-w-xs">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <div className="flex gap-2 justify-center">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

interface ChartEmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  height: string;
}

function ChartEmptyState({ title, description, action, height }: ChartEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-4"
      style={{ height }}
      data-testid="container-chart-empty"
    >
      <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center mb-4">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="text-sm font-medium text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
        {description}
      </p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          data-testid="button-chart-empty-action"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ChartLegendProps {
  items: {
    color: string;
    label: string;
  }[];
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-4 mt-4", className)}
      data-testid="container-chart-legend"
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
