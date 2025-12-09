import { ReactNode } from "react";
import { ChevronRight, Download, FileSpreadsheet, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DateRangePicker, DateRange } from "./DateRangePicker";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  showDatePicker?: boolean;
  showExportButtons?: boolean;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  sidebar?: ReactNode;
  sidebarTitle?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  className?: string;
}

export function DashboardShell({
  title,
  subtitle,
  breadcrumbs,
  dateRange,
  onDateRangeChange,
  showDatePicker = true,
  showExportButtons = true,
  onExportCSV,
  onExportPDF,
  sidebar,
  sidebarTitle = "Filters",
  children,
  headerActions,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("min-h-screen bg-muted/30", className)}>
      <header className="sticky top-0 z-40 bg-[#0A1628] border-b border-[#1a3a5c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {sidebar && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden text-white hover:bg-white/10"
                      data-testid="button-toggle-sidebar"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-card p-0">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-foreground">{sidebarTitle}</h3>
                    </div>
                    <div className="p-4">{sidebar}</div>
                  </SheetContent>
                </Sheet>
              )}
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white truncate" data-testid="text-dashboard-title">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-400 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {showDatePicker && onDateRangeChange && (
                <DateRangePicker
                  value={dateRange}
                  onChange={onDateRangeChange}
                  className="hidden sm:flex"
                />
              )}

              {showExportButtons && (
                <div className="hidden md:flex items-center gap-2">
                  {onExportCSV && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onExportCSV}
                      className="text-white hover:bg-white/10"
                      data-testid="button-export-csv"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                      CSV
                    </Button>
                  )}
                  {onExportPDF && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onExportPDF}
                      className="text-white hover:bg-white/10"
                      data-testid="button-export-pdf"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      PDF
                    </Button>
                  )}
                </div>
              )}

              {headerActions}
            </div>
          </div>

          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 pb-3 text-sm overflow-x-auto" data-testid="nav-breadcrumbs">
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-1 flex-shrink-0">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-gray-500" />}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-gray-400 hover:text-[#C8A661] transition-colors"
                      data-testid={`link-breadcrumb-${index}`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-white" data-testid={`text-breadcrumb-${index}`}>
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showDatePicker && onDateRangeChange && (
          <div className="sm:hidden mb-4">
            <DateRangePicker
              value={dateRange}
              onChange={onDateRangeChange}
            />
          </div>
        )}

        <div className={cn("flex gap-6", sidebar && "lg:grid lg:grid-cols-[280px_1fr]")}>
          {sidebar && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-card border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">{sidebarTitle}</h3>
                {sidebar}
              </div>
            </aside>
          )}

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({ children, columns = 4, className }: DashboardGridProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-4", colsClass, className)} data-testid="grid-dashboard">
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  description,
  children,
  action,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-foreground" data-testid="text-section-title">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
