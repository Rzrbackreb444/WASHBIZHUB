import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { WIDGET_CATALOG, getWidgetById } from "@/lib/widget-catalog";
import { WIDGET_TYPES, type WidgetType } from "@shared/schema";
import {
  Settings,
  X,
  GripVertical,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Wrench,
  Clock,
  AlertTriangle,
  MapPin,
  Calculator,
  BarChart3,
  Bell,
  Activity,
  Sparkles,
  ChevronRight,
  Crown,
  Gauge,
  Zap,
  FileText,
  Bookmark,
  Eye,
  Palette,
  Store,
  Bot,
  Globe,
  Rocket,
  Target,
} from "lucide-react";

export interface WidgetConfig {
  id: string;
  widgetType: WidgetType;
  title?: string;
  settings?: Record<string, any>;
  isCollapsed?: boolean;
  showHeader?: boolean;
  showBorder?: boolean;
}

interface WidgetRendererProps {
  widget: WidgetConfig;
  isEditing?: boolean;
  isDragging?: boolean;
  onRemove?: (id: string) => void;
  onSettings?: (id: string) => void;
  onRefresh?: (id: string) => void;
  className?: string;
}

export function WidgetRenderer({
  widget,
  isEditing = false,
  isDragging = false,
  onRemove,
  onSettings,
  onRefresh,
  className,
}: WidgetRendererProps) {
  const definition = getWidgetById(widget.widgetType);
  if (!definition) {
    return <WidgetErrorState message="Widget type not found" />;
  }

  const Icon = definition.icon;
  const title = widget.title || definition.label;
  const showHeader = widget.showHeader ?? true;
  const showBorder = widget.showBorder ?? true;

  return (
    <Card
      className={cn(
        "h-full flex flex-col bg-card transition-all duration-200 overflow-hidden",
        showBorder ? "border shadow-sm" : "border-0 shadow-none",
        isDragging && "opacity-50 scale-[1.02] shadow-lg ring-2 ring-[#C8A661]/50",
        isEditing && "ring-1 ring-muted-foreground/20",
        className
      )}
      data-testid={`widget-${widget.widgetType}`}
    >
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4 border-b bg-muted/30">
          <div className="flex items-center gap-2 min-w-0">
            {isEditing && (
              <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <div className={cn(
              "h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0",
              definition.isPremium ? "bg-[#C8A661]/10" : "bg-primary/10"
            )}>
              <Icon className={cn(
                "h-4 w-4",
                definition.isPremium ? "text-[#C8A661]" : "text-primary"
              )} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                {title}
                {definition.isPremium && (
                  <Crown className="h-3 w-3 text-[#C8A661] flex-shrink-0" />
                )}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onRefresh && definition.refreshInterval > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onRefresh(widget.id)}
                data-testid={`button-refresh-${widget.id}`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
            {isEditing && onSettings && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onSettings(widget.id)}
                data-testid={`button-settings-${widget.id}`}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            {isEditing && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onRemove(widget.id)}
                data-testid={`button-remove-${widget.id}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 overflow-auto", showHeader ? "p-4" : "p-4 pt-4")}>
        <WidgetContent widget={widget} definition={definition} />
      </CardContent>
    </Card>
  );
}

function WidgetContent({ 
  widget, 
  definition 
}: { 
  widget: WidgetConfig; 
  definition: ReturnType<typeof getWidgetById>;
}) {
  if (!definition) return null;

  const { data, isLoading, error } = useQuery({
    queryKey: [definition.dataEndpoint],
    enabled: !!definition.dataEndpoint,
    refetchInterval: definition.refreshInterval > 0 ? definition.refreshInterval * 1000 : false,
  });

  if (isLoading && definition.dataEndpoint) {
    return <WidgetLoadingState />;
  }

  if (error) {
    return <WidgetErrorState message="Failed to load data" />;
  }

  switch (widget.widgetType) {
    case WIDGET_TYPES.POS_REVENUE_CARD:
      return <POSRevenueWidget data={data} />;
    case WIDGET_TYPES.POS_ORDERS_TODAY:
      return <POSOrdersWidget data={data} />;
    case WIDGET_TYPES.POS_MACHINE_STATUS:
      return <MachineStatusWidget data={data} />;
    case WIDGET_TYPES.POS_RECENT_ORDERS:
      return <RecentOrdersWidget data={data} />;
    case WIDGET_TYPES.POS_REVENUE_CHART:
    case WIDGET_TYPES.POS_SERVICE_BREAKDOWN:
    case WIDGET_TYPES.ANALYTICS_TREND_LINE:
    case WIDGET_TYPES.ANALYTICS_PIE_CHART:
    case WIDGET_TYPES.ANALYTICS_HEATMAP:
    case WIDGET_TYPES.CLEANBI_SCORE_CHART:
      return <ChartPlaceholderWidget type={widget.widgetType} />;
    case WIDGET_TYPES.SERVICE_REPAIR_TICKETS:
      return <RepairTicketsWidget data={data} />;
    case WIDGET_TYPES.SERVICE_MAINTENANCE_DUE:
      return <MaintenanceDueWidget data={data} />;
    case WIDGET_TYPES.SERVICE_DIAGNOSTIC_QUICK:
      return <QuickDiagnosticWidget />;
    case WIDGET_TYPES.SERVICE_PARTS_LOW:
      return <PartsLowWidget data={data} />;
    case WIDGET_TYPES.CLEANBI_RECENT_SCORES:
      return <CleanbiScoresWidget data={data} />;
    case WIDGET_TYPES.CLEANBI_SAVED_ANALYSES:
      return <CleanbiAnalysesWidget data={data} />;
    case WIDGET_TYPES.CLEANBI_QUOTA_STATUS:
      return <QuotaStatusWidget data={data} />;
    case WIDGET_TYPES.WEBSITE_PROJECTS:
      return <WebsiteProjectsWidget data={data} />;
    case WIDGET_TYPES.WEBSITE_QUICK_BUILD:
      return <QuickBuildWidget />;
    case WIDGET_TYPES.CALC_QUICK_ACCESS:
      return <QuickCalculatorsWidget />;
    case WIDGET_TYPES.CALC_SAVED_RESULTS:
      return <SavedResultsWidget data={data} />;
    case WIDGET_TYPES.CALC_ROI_SUMMARY:
      return <ROISummaryWidget data={data} />;
    case WIDGET_TYPES.ANALYTICS_KPI_GRID:
      return <KPIGridWidget data={data} />;
    case WIDGET_TYPES.ANALYTICS_GAUGE:
      return <GaugeMeterWidget data={data} />;
    case WIDGET_TYPES.ACTIVITY_FEED:
      return <ActivityFeedWidget data={data} />;
    case WIDGET_TYPES.NOTIFICATIONS:
      return <NotificationsWidget data={data} />;
    case WIDGET_TYPES.SAVED_ITEMS:
      return <SavedItemsWidget data={data} />;
    case WIDGET_TYPES.RECENT_VIEWED:
      return <RecentViewedWidget data={data} />;
    case WIDGET_TYPES.QUICK_ACTIONS:
      return <QuickActionsWidget />;
    case WIDGET_TYPES.SHORTCUTS:
      return <ShortcutsWidget data={data} />;
    default:
      return <WidgetPlaceholder type={widget.widgetType} />;
  }
}

function WidgetLoadingState() {
  return (
    <div className="flex flex-col gap-3 h-full" data-testid="widget-loading">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2 mt-auto">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

function WidgetErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4" data-testid="widget-error">
      <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function WidgetPlaceholder({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4" data-testid="widget-placeholder">
      <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">Widget Coming Soon</p>
      <p className="text-xs text-muted-foreground/70 mt-1">{type}</p>
    </div>
  );
}

function POSRevenueWidget({ data }: { data?: any }) {
  const revenue = data?.revenue || 0;
  const trend = data?.trend || 0;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        <DollarSign className="h-4 w-4" />
        Today's Revenue
      </div>
      <div className="text-3xl font-bold text-foreground">
        ${revenue.toLocaleString()}
      </div>
      <div className={cn(
        "flex items-center gap-1 mt-2 text-sm",
        trend >= 0 ? "text-green-600" : "text-red-600"
      )}>
        {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{Math.abs(trend)}% vs yesterday</span>
      </div>
      <Link href="/pos" className="mt-auto">
        <Button variant="outline" size="sm" className="w-full gap-1" data-testid="button-view-pos">
          View POS <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

function POSOrdersWidget({ data }: { data?: any }) {
  const orders = data?.count || 0;
  const pending = data?.pending || 0;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        <ShoppingCart className="h-4 w-4" />
        Orders Today
      </div>
      <div className="text-3xl font-bold text-foreground">{orders}</div>
      {pending > 0 && (
        <Badge variant="secondary" className="w-fit mt-2">
          {pending} pending
        </Badge>
      )}
      <Link href="/pos" className="mt-auto">
        <Button variant="outline" size="sm" className="w-full gap-1">
          Manage Orders <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

function MachineStatusWidget({ data }: { data?: any }) {
  const machines = data?.machines || [];
  const available = machines.filter((m: any) => m.status === 'available').length;
  const inUse = machines.filter((m: any) => m.status === 'in_use').length;
  const maintenance = machines.filter((m: any) => m.status === 'maintenance').length;
  
  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-green-500/10">
          <div className="text-lg font-bold text-green-600">{available}</div>
          <div className="text-xs text-muted-foreground">Available</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-blue-500/10">
          <div className="text-lg font-bold text-blue-600">{inUse}</div>
          <div className="text-xs text-muted-foreground">In Use</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-amber-500/10">
          <div className="text-lg font-bold text-amber-600">{maintenance}</div>
          <div className="text-xs text-muted-foreground">Maintenance</div>
        </div>
      </div>
      <Link href="/pos" className="mt-auto">
        <Button variant="outline" size="sm" className="w-full gap-1">
          Machine Overview <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

function RecentOrdersWidget({ data }: { data?: any }) {
  const orders = data?.orders || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {orders.length > 0 ? orders.slice(0, 5).map((order: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div>
              <div className="text-sm font-medium">#{order.id}</div>
              <div className="text-xs text-muted-foreground">{order.customer}</div>
            </div>
            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
              {order.status}
            </Badge>
          </div>
        )) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No recent orders
          </div>
        )}
      </div>
      <Link href="/pos" className="mt-2">
        <Button variant="outline" size="sm" className="w-full gap-1">
          View All Orders <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

function ChartPlaceholderWidget({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="h-24 w-full bg-gradient-to-r from-[#C8A661]/10 via-[#C8A661]/20 to-[#C8A661]/10 rounded-lg mb-4 flex items-end justify-around px-4 pb-2">
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <div
            key={i}
            className="w-4 bg-[#C8A661]/60 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Chart visualization</p>
    </div>
  );
}

function RepairTicketsWidget({ data }: { data?: any }) {
  const tickets = data?.tickets || [];
  const urgent = tickets.filter((t: any) => t.priority === 'urgent').length;
  return (
    <div className="flex flex-col h-full">
      {urgent > 0 && (
        <Badge variant="destructive" className="w-fit mb-3">
          {urgent} urgent tickets
        </Badge>
      )}
      <div className="space-y-2 flex-1 overflow-auto">
        {tickets.slice(0, 4).map((ticket: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <AlertTriangle className={cn(
              "h-4 w-4 flex-shrink-0",
              ticket.priority === 'urgent' ? 'text-red-500' : 'text-amber-500'
            )} />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{ticket.title}</div>
              <div className="text-xs text-muted-foreground">{ticket.machine}</div>
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No open tickets
          </div>
        )}
      </div>
      <Link href="/service-guy-ai" className="mt-2">
        <Button variant="outline" size="sm" className="w-full gap-1">
          Service Center <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

function MaintenanceDueWidget({ data }: { data?: any }) {
  const items = data?.items || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {items.slice(0, 4).map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm">{item.machine}</span>
            </div>
            <span className="text-xs text-muted-foreground">{item.dueIn}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No maintenance due
          </div>
        )}
      </div>
    </div>
  );
}

function QuickDiagnosticWidget() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="h-14 w-14 rounded-xl bg-[#C8A661]/10 flex items-center justify-center mb-3">
        <Zap className="h-7 w-7 text-[#C8A661]" />
      </div>
      <p className="text-sm font-medium mb-1">AI Diagnostics</p>
      <p className="text-xs text-muted-foreground mb-4">Instant machine troubleshooting</p>
      <Link href="/service-guy-ai">
        <Button size="sm" className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]">
          Start Diagnosis
        </Button>
      </Link>
    </div>
  );
}

function PartsLowWidget({ data }: { data?: any }) {
  const parts = data?.parts || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {parts.slice(0, 4).map((part: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm truncate">{part.name}</span>
            <Badge variant={part.qty <= 2 ? 'destructive' : 'secondary'}>
              {part.qty} left
            </Badge>
          </div>
        ))}
        {parts.length === 0 && (
          <div className="text-center py-4 text-green-600 text-sm">
            All parts stocked
          </div>
        )}
      </div>
    </div>
  );
}

function CleanbiScoresWidget({ data }: { data?: any }) {
  const scores = data?.scores || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {scores.slice(0, 4).map((score: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-[#C8A661] flex-shrink-0" />
              <span className="text-sm truncate">{score.address}</span>
            </div>
            <Badge className={cn(
              score.grade === 'A' ? 'bg-green-500' :
              score.grade === 'B' ? 'bg-lime-500' :
              score.grade === 'C' ? 'bg-amber-500' : 'bg-[#C8A661]'
            )}>
              {score.grade || score.score}
            </Badge>
          </div>
        ))}
        {scores.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No recent scores
          </div>
        )}
      </div>
      <Link href="/cleanbi-explorer" className="mt-2">
        <Button variant="outline" size="sm" className="w-full gap-1">
          CLEANBI Explorer <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

function CleanbiAnalysesWidget({ data }: { data?: any }) {
  const analyses = data?.analyses || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {analyses.slice(0, 5).map((analysis: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
            <Bookmark className="h-4 w-4 text-[#C8A661] flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{analysis.name}</div>
              <div className="text-xs text-muted-foreground">{analysis.date}</div>
            </div>
          </div>
        ))}
        {analyses.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No saved analyses
          </div>
        )}
      </div>
    </div>
  );
}

function QuotaStatusWidget({ data }: { data?: any }) {
  const used = data?.used || 0;
  const total = data?.total || 10;
  const percentage = (used / total) * 100;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Gauge className="h-8 w-8 text-[#C8A661] mb-2" />
      <div className="text-2xl font-bold">{used}/{total}</div>
      <p className="text-xs text-muted-foreground mb-3">Analyses this month</p>
      <Progress value={percentage} className="w-full h-2" />
    </div>
  );
}

function WebsiteProjectsWidget({ data }: { data?: any }) {
  const projects = data?.projects || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {projects.slice(0, 4).map((project: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{project.name}</div>
              <div className="text-xs text-muted-foreground">{project.status}</div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No website projects
          </div>
        )}
      </div>
    </div>
  );
}

function QuickBuildWidget() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
        <Rocket className="h-7 w-7 text-blue-500" />
      </div>
      <p className="text-sm font-medium mb-1">Quick Build</p>
      <p className="text-xs text-muted-foreground mb-4">Launch a new website</p>
      <Link href="/website-builder">
        <Button size="sm" variant="outline">
          Start Building
        </Button>
      </Link>
    </div>
  );
}

function QuickCalculatorsWidget() {
  const calculators = [
    { name: "Valuation", href: "/valuation-tool", icon: DollarSign },
    { name: "ROI", href: "/calculators", icon: Target },
    { name: "Loan", href: "/calculators", icon: FileText },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 h-full">
      {calculators.map((calc) => (
        <Link key={calc.name} href={calc.href}>
          <div className="flex flex-col items-center justify-center h-full p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
            <calc.icon className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-xs font-medium">{calc.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SavedResultsWidget({ data }: { data?: any }) {
  const results = data?.results || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {results.slice(0, 4).map((result: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-amber-500" />
              <span className="text-sm truncate">{result.name}</span>
            </div>
            <span className="text-sm font-medium">{result.value}</span>
          </div>
        ))}
        {results.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No saved results
          </div>
        )}
      </div>
    </div>
  );
}

function ROISummaryWidget({ data }: { data?: any }) {
  const roi = data?.roi || 0;
  const investment = data?.investment || 0;
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-green-600">{roi}%</div>
        <p className="text-xs text-muted-foreground">Projected ROI</p>
      </div>
      <div className="text-center">
        <div className="text-xl font-semibold">${investment.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Total Investment</p>
      </div>
      <Link href="/calculators" className="mt-auto">
        <Button variant="outline" size="sm" className="w-full gap-1">
          View Details <ChevronRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

function KPIGridWidget({ data }: { data?: any }) {
  const kpis = data?.kpis || [
    { label: "Revenue", value: "$0", trend: 0 },
    { label: "Orders", value: "0", trend: 0 },
    { label: "Customers", value: "0", trend: 0 },
    { label: "Avg Ticket", value: "$0", trend: 0 },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {kpis.map((kpi: any, i: number) => (
        <div key={i} className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="text-lg font-bold">{kpi.value}</div>
          <div className="text-xs text-muted-foreground">{kpi.label}</div>
          {kpi.trend !== 0 && (
            <div className={cn(
              "text-xs mt-1 flex items-center justify-center gap-1",
              kpi.trend > 0 ? "text-green-600" : "text-red-600"
            )}>
              {kpi.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(kpi.trend)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GaugeMeterWidget({ data }: { data?: any }) {
  const value = data?.value || 0;
  const max = data?.max || 100;
  const label = data?.label || "Performance";
  const percentage = (value / max) * 100;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="relative h-24 w-24 mb-3">
        <svg className="h-24 w-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            className="fill-none stroke-muted stroke-[8]"
          />
          <circle
            cx="50" cy="50" r="40"
            className="fill-none stroke-[#C8A661] stroke-[8]"
            strokeDasharray={`${percentage * 2.51} 251`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ActivityFeedWidget({ data }: { data?: any }) {
  const activities = data?.activities || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {activities.slice(0, 5).map((activity: any, i: number) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
            <Activity className="h-4 w-4 text-[#C8A661] flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm truncate">{activity.description}</div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsWidget({ data }: { data?: any }) {
  const notifications = data?.notifications || [];
  const unread = notifications.filter((n: any) => !n.read).length;
  return (
    <div className="flex flex-col h-full">
      {unread > 0 && (
        <Badge className="w-fit mb-3 bg-[#C8A661] text-[#0A1628]">
          {unread} new
        </Badge>
      )}
      <div className="space-y-2 flex-1 overflow-auto">
        {notifications.slice(0, 4).map((notif: any, i: number) => (
          <div key={i} className={cn(
            "flex items-start gap-2 p-2 rounded-lg",
            notif.read ? "bg-muted/30" : "bg-muted/50"
          )}>
            <Bell className="h-4 w-4 text-[#C8A661] flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm truncate">{notif.message}</div>
              <div className="text-xs text-muted-foreground">{notif.time}</div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}

function SavedItemsWidget({ data }: { data?: any }) {
  const items = data?.items || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {items.slice(0, 4).map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
            <Bookmark className="h-4 w-4 text-[#C8A661] flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.type}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No saved items
          </div>
        )}
      </div>
    </div>
  );
}

function RecentViewedWidget({ data }: { data?: any }) {
  const items = data?.items || [];
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1 overflow-auto">
        {items.slice(0, 4).map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
            <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm truncate">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.viewedAt}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No recent views
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionsWidget() {
  const actions = [
    { label: "CLEANBI", href: "/cleanbi-explorer", icon: BarChart3, color: "text-purple-500" },
    { label: "Design Studio", href: "/design-studio", icon: Palette, color: "text-blue-500" },
    { label: "Marketplace", href: "/marketplace", icon: Store, color: "text-emerald-500" },
    { label: "Calculators", href: "/calculators", icon: Calculator, color: "text-amber-500" },
    { label: "Service AI", href: "/service-guy-ai", icon: Bot, color: "text-orange-500" },
    { label: "Valuation", href: "/valuation-tool", icon: DollarSign, color: "text-teal-500" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 h-full">
      {actions.slice(0, 6).map((action) => (
        <Link key={action.label} href={action.href}>
          <div className="flex flex-col items-center justify-center h-full p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
            <action.icon className={cn("h-5 w-5 mb-1", action.color)} />
            <span className="text-[10px] font-medium text-center">{action.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ShortcutsWidget({ data }: { data?: any }) {
  const shortcuts = data?.shortcuts || [
    { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];
  return (
    <div className="flex flex-wrap gap-2 h-full content-start">
      {shortcuts.map((shortcut: any, i: number) => (
        <Link key={i} href={shortcut.href}>
          <Badge variant="secondary" className="cursor-pointer hover:bg-muted gap-1">
            {shortcut.icon && <shortcut.icon className="h-3 w-3" />}
            {shortcut.label}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export default WidgetRenderer;
