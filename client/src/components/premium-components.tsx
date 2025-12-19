import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Crown, TrendingUp, Shield, Sparkles, ArrowUpRight, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  goldAccent?: boolean;
  locked?: boolean;
  tier?: "free" | "starter" | "professional" | "enterprise";
  onClick?: () => void;
}

export function PremiumCard({ 
  children, 
  className, 
  goldAccent = true, 
  locked = false,
  tier,
  onClick 
}: PremiumCardProps) {
  return (
    <Card 
      className={cn(
        "bg-card border shadow-sm overflow-hidden transition-all duration-200 relative group",
        locked && "opacity-75",
        onClick && "cursor-pointer hover:shadow-md hover:border-[#C8A661]/30",
        className
      )}
      onClick={onClick}
      data-testid="premium-card"
    >
      {goldAccent && <div className="h-1 bg-[#C8A661]" />}
      {locked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-[#C8A661]" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Premium Feature</p>
            <p className="text-xs text-muted-foreground mb-3">Upgrade to access</p>
            <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" asChild>
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </div>
        </div>
      )}
      {tier && (
        <Badge 
          className={cn(
            "absolute top-3 right-3 z-5",
            tier === "enterprise" && "bg-[#C8A661] text-[#0A1628]",
            tier === "professional" && "bg-blue-500 text-white",
            tier === "starter" && "bg-green-500 text-white",
            tier === "free" && "bg-gray-500 text-white"
          )}
        >
          {tier === "enterprise" && <Crown className="w-3 h-3 mr-1" />}
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Badge>
      )}
      {children}
    </Card>
  );
}

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  goldValue?: boolean;
}

export function PremiumStatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  className,
  goldValue = true 
}: PremiumStatCardProps) {
  return (
    <Card className={cn("bg-card border shadow-sm overflow-hidden", className)} data-testid="stat-card">
      <div className="h-1 bg-[#C8A661]" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
              {icon}
            </div>
          )}
          {trend && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                trend.value >= 0 ? "border-green-500/40 text-green-600" : "border-red-500/40 text-red-600"
              )}
            >
              <TrendingUp className={cn("w-3 h-3 mr-1", trend.value < 0 && "rotate-180")} />
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </Badge>
          )}
        </div>
        <div className={cn("text-3xl font-bold mb-1", goldValue ? "text-[#C8A661]" : "text-foreground")}>
          {value}
        </div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
        {trend && <div className="text-xs text-muted-foreground mt-2">{trend.label}</div>}
      </CardContent>
    </Card>
  );
}

interface PremiumFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
  cta?: { label: string; href: string };
  locked?: boolean;
  className?: string;
}

export function PremiumFeatureCard({
  icon,
  title,
  description,
  features,
  cta,
  locked = false,
  className
}: PremiumFeatureCardProps) {
  return (
    <PremiumCard className={className} locked={locked}>
      <CardContent className="p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        {features && features.length > 0 && (
          <ul className="space-y-2 mb-6">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
        {cta && !locked && (
          <Button className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white" asChild>
            <Link href={cta.href}>
              {cta.label}
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </PremiumCard>
  );
}

interface PremiumSectionHeaderProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function PremiumSectionHeader({
  badge,
  badgeIcon,
  title,
  subtitle,
  centered = true,
  className
}: PremiumSectionHeaderProps) {
  return (
    <div className={cn(centered && "text-center", "mb-14", className)}>
      {badge && (
        <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
          {badgeIcon}
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
      {subtitle && (
        <p className={cn("text-muted-foreground", centered && "max-w-2xl mx-auto")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface PremiumDataRowProps {
  label: string;
  value: string | number;
  valueColor?: "default" | "gold" | "green" | "red" | "muted";
  icon?: React.ReactNode;
  sublabel?: string;
  locked?: boolean;
}

export function PremiumDataRow({
  label,
  value,
  valueColor = "default",
  icon,
  sublabel,
  locked = false
}: PremiumDataRowProps) {
  const colorClasses = {
    default: "text-foreground",
    gold: "text-[#C8A661]",
    green: "text-green-600",
    red: "text-red-600",
    muted: "text-muted-foreground"
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          {sublabel && <div className="text-xs text-muted-foreground">{sublabel}</div>}
        </div>
      </div>
      <div className={cn("text-sm font-semibold", colorClasses[valueColor])}>
        {locked ? (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Upgrade</span>
          </div>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

interface PremiumDashboardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function PremiumDashboardGrid({
  children,
  columns = 3,
  className
}: PremiumDashboardGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {children}
    </div>
  );
}

export function PremiumLoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="bg-card border shadow-sm overflow-hidden">
      <div className="h-1 bg-muted animate-pulse" />
      <CardContent className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface PremiumGradeDisplayProps {
  grade: string;
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function PremiumGradeDisplay({
  grade,
  score,
  size = "md",
  showLabel = true
}: PremiumGradeDisplayProps) {
  const gradeColors: Record<string, string> = {
    A: "bg-green-500 text-white",
    B: "bg-lime-500 text-white",
    C: "bg-amber-500 text-white",
    "Needs Work": "bg-[#C8A661] text-[#0A1628]"
  };

  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-12 w-12 text-lg",
    lg: "h-16 w-16 text-2xl"
  };

  const displayGrade = grade === "Needs Work" ? "NW" : grade;

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "rounded-lg font-bold flex items-center justify-center",
        gradeColors[grade] || gradeColors["Needs Work"],
        sizes[size]
      )}>
        {displayGrade}
      </div>
      {showLabel && (
        <div>
          <div className="text-lg font-bold text-foreground">{score}/100</div>
          <div className="text-xs text-muted-foreground">CLEANBI Score</div>
        </div>
      )}
    </div>
  );
}

interface PremiumCtaBannerProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  variant?: "navy" | "gold";
}

export function PremiumCtaBanner({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  variant = "navy"
}: PremiumCtaBannerProps) {
  return (
    <section className={cn(
      "py-16",
      variant === "navy" ? "bg-[#0A1628]" : "bg-gradient-to-r from-[#C8A661] to-[#B8964F]"
    )}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className={cn(
          "text-2xl md:text-3xl font-bold mb-3",
          variant === "navy" ? "text-white" : "text-[#0A1628]"
        )}>
          {title}
        </h2>
        <p className={cn(
          "mb-6",
          variant === "navy" ? "text-gray-300" : "text-[#0A1628]/80"
        )}>
          {subtitle}
        </p>
        <Button 
          size="lg"
          className={cn(
            variant === "navy" 
              ? "bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" 
              : "bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
          )}
          asChild
        >
          <Link href={ctaHref}>
            {ctaLabel}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

interface SubscriptionGateProps {
  requiredTier: "starter" | "professional" | "enterprise" | "distributor";
  currentTier?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGate({
  requiredTier,
  currentTier = "free",
  children,
  fallback
}: SubscriptionGateProps) {
  const tierLevels: Record<string, number> = {
    free: 0,
    starter: 1,
    professional: 2,
    enterprise: 3,
    distributor: 4
  };

  const hasAccess = tierLevels[currentTier] >= tierLevels[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="bg-card border shadow-sm overflow-hidden">
      <div className="h-1 bg-[#C8A661]" />
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-[#C8A661]" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature
        </h3>
        <p className="text-muted-foreground mb-6">
          Upgrade to {requiredTier} to unlock this premium feature and get the most out of WashBizHub.
        </p>
        <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" asChild>
          <Link href="/pricing">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PremiumWatermark({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 pointer-events-none opacity-20 z-50">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Powered by WashBizHub</span>
      </div>
    </div>
  );
}

interface PremiumDashboardHeaderProps {
  title: string;
  subtitle?: string;
  isLive?: boolean;
  lastUpdate?: Date;
  actions?: React.ReactNode;
  badge?: string;
  className?: string;
}

export function PremiumDashboardHeader({
  title,
  subtitle,
  isLive = false,
  lastUpdate,
  actions,
  badge,
  className
}: PremiumDashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6", className)} data-testid="dashboard-header">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
            {badge && (
              <Badge className="bg-[#C8A661] text-[#0A1628]">
                <Crown className="w-3 h-3 mr-1" />
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isLive && (
          <Badge variant="outline" className="border-green-500/40 text-green-600 animate-pulse" data-testid="status-live">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            Live
          </Badge>
        )}
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}

interface PremiumKPIProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  format?: "currency" | "number" | "percent";
  size?: "sm" | "md" | "lg";
}

export function PremiumKPI({
  icon,
  label,
  value,
  change,
  changeLabel,
  format = "number",
  size = "md"
}: PremiumKPIProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    if (format === "currency") return `$${val.toLocaleString()}`;
    if (format === "percent") return `${val}%`;
    return val.toLocaleString();
  };

  const sizes = {
    sm: { value: "text-xl", icon: "h-8 w-8" },
    md: { value: "text-2xl md:text-3xl", icon: "h-10 w-10" },
    lg: { value: "text-3xl md:text-4xl", icon: "h-12 w-12" }
  };

  return (
    <div className="flex items-center gap-4" data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={cn("rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0", sizes[size].icon)}>
        {icon}
      </div>
      <div>
        <div className={cn("font-bold text-[#C8A661]", sizes[size].value)}>
          {formatValue(value)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          {change !== undefined && (
            <Badge variant="outline" className={cn(
              "text-xs",
              change >= 0 ? "border-green-500/40 text-green-600" : "border-red-500/40 text-red-600"
            )}>
              <TrendingUp className={cn("w-3 h-3 mr-1", change < 0 && "rotate-180")} />
              {change >= 0 ? "+" : ""}{change}%
            </Badge>
          )}
        </div>
        {changeLabel && <div className="text-xs text-muted-foreground">{changeLabel}</div>}
      </div>
    </div>
  );
}

interface PremiumAlertCardProps {
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  time?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function PremiumAlertCard({
  type,
  title,
  message,
  time,
  action,
  className
}: PremiumAlertCardProps) {
  const styles = {
    critical: { bg: "bg-red-500/10 border-red-500/30", icon: "text-red-500", badge: "bg-red-500" },
    warning: { bg: "bg-amber-500/10 border-amber-500/30", icon: "text-amber-500", badge: "bg-amber-500" },
    info: { bg: "bg-blue-500/10 border-blue-500/30", icon: "text-blue-500", badge: "bg-blue-500" },
    success: { bg: "bg-green-500/10 border-green-500/30", icon: "text-green-500", badge: "bg-green-500" }
  };

  return (
    <div className={cn("rounded-lg border p-4", styles[type].bg, className)} data-testid={`alert-${type}`}>
      <div className="flex items-start gap-3">
        <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", styles[type].badge)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-foreground truncate">{title}</span>
            {time && <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
          {action && (
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PremiumStatusIndicatorProps {
  status: "online" | "offline" | "warning" | "maintenance";
  label?: string;
  showPulse?: boolean;
}

export function PremiumStatusIndicator({
  status,
  label,
  showPulse = true
}: PremiumStatusIndicatorProps) {
  const styles = {
    online: { color: "bg-green-500", text: "text-green-600", label: "Online" },
    offline: { color: "bg-red-500", text: "text-red-600", label: "Offline" },
    warning: { color: "bg-amber-500", text: "text-amber-600", label: "Warning" },
    maintenance: { color: "bg-blue-500", text: "text-blue-600", label: "Maintenance" }
  };

  return (
    <div className="flex items-center gap-2" data-testid={`status-${status}`}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        styles[status].color,
        showPulse && status === "online" && "animate-pulse"
      )} />
      <span className={cn("text-sm font-medium", styles[status].text)}>
        {label || styles[status].label}
      </span>
    </div>
  );
}

interface DemoBannerProps {
  companyName?: string;
  onRequestAccess?: () => void;
}

export function DemoBanner({ companyName = "Enterprise", onRequestAccess }: DemoBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#0A1628] to-[#1a3a5c] text-white px-4 py-3" data-testid="demo-banner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Badge className="bg-[#C8A661] text-[#0A1628]">
            <Sparkles className="w-3 h-3 mr-1" />
            Demo Mode
          </Badge>
          <span className="text-sm">
            Experiencing {companyName} Command Center - <strong>Full access available with subscription</strong>
          </span>
        </div>
        {onRequestAccess && (
          <Button 
            size="sm" 
            className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
            onClick={onRequestAccess}
          >
            <Crown className="w-4 h-4 mr-1" />
            Request Full Access
          </Button>
        )}
      </div>
    </div>
  );
}

interface EnterprisePageWrapperProps {
  children: React.ReactNode;
  showDemoBanner?: boolean;
  companyName?: string;
  showWatermark?: boolean;
  className?: string;
}

export function EnterprisePageWrapper({
  children,
  showDemoBanner = true,
  companyName,
  showWatermark = true,
  className
}: EnterprisePageWrapperProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {showDemoBanner && <DemoBanner companyName={companyName} />}
      {children}
      {showWatermark && <PremiumWatermark />}
    </div>
  );
}

interface PremiumTableRowProps {
  data: Array<{ label: string; value: React.ReactNode; highlight?: boolean }>;
  onClick?: () => void;
  className?: string;
}

export function PremiumTableRow({ data, onClick, className }: PremiumTableRowProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between py-3 px-4 border-b border-border/50 last:border-0",
        onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={onClick}
      data-testid="table-row"
    >
      {data.map((item, idx) => (
        <div key={idx} className={cn("text-sm", item.highlight ? "font-semibold text-[#C8A661]" : "text-foreground")}>
          {item.value}
        </div>
      ))}
    </div>
  );
}

interface PremiumMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; period: string };
  status?: "positive" | "negative" | "neutral";
  footer?: React.ReactNode;
  className?: string;
}

export function PremiumMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  status = "neutral",
  footer,
  className
}: PremiumMetricCardProps) {
  const statusColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-[#C8A661]"
  };

  return (
    <Card className={cn("bg-card border shadow-sm overflow-hidden", className)} data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="h-1 bg-[#C8A661]" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && (
            <div className="h-9 w-9 rounded-lg bg-[#0A1628] flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        <div className={cn("text-2xl font-bold", statusColors[status])}>
          {value}
        </div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={cn("w-3 h-3", trend.value >= 0 ? "text-green-600" : "text-red-600 rotate-180")} />
            <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.period}</span>
          </div>
        )}
        {footer && <div className="mt-3 pt-3 border-t border-border/50">{footer}</div>}
      </CardContent>
    </Card>
  );
}

interface PremiumProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gold" | "success" | "warning" | "danger";
}

export function PremiumProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  variant = "default"
}: PremiumProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  const colors = {
    default: "bg-[#0A1628]",
    gold: "bg-[#C8A661]",
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-red-500"
  };

  return (
    <div className="w-full" data-testid="progress-bar">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showValue && <span className="text-sm font-medium text-foreground">{value}/{max}</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted/50", heights[size])}>
        <div 
          className={cn("rounded-full transition-all duration-500", colors[variant], heights[size])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" data-testid="dashboard-skeleton">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="overflow-hidden">
            <div className="h-1 bg-muted animate-pulse" />
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="h-1 bg-muted animate-pulse" />
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-muted animate-pulse" />
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
