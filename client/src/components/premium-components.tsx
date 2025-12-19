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
