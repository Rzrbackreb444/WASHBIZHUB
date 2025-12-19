import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Crown, TrendingUp, Shield, Sparkles, ArrowUpRight, ChevronRight, Zap, Activity, Radio } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Enterprise Design Tokens
export const ENTERPRISE_COLORS = {
  navy: "#0A1628",
  navyLight: "#0f172a",
  navyDark: "#050a14",
  gold: "#C8A661",
  goldLight: "#D4B878",
  goldDark: "#B8964F",
  cyan: "#22D3EE",
  orange: "#F97316",
  surface: "#1a1f2e",
  surfaceLight: "#252b3d",
};

// Futuristic Glow Card with animated border
interface FuturisticCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "gold" | "cyan" | "orange";
  animated?: boolean;
}

export function FuturisticCard({ 
  children, 
  className, 
  glowColor = "gold",
  animated = false 
}: FuturisticCardProps) {
  const glowStyles = {
    gold: "shadow-[0_0_30px_rgba(200,166,97,0.15)] hover:shadow-[0_0_40px_rgba(200,166,97,0.25)]",
    cyan: "shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:shadow-[0_0_40px_rgba(34,211,238,0.25)]",
    orange: "shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:shadow-[0_0_40px_rgba(249,115,22,0.25)]"
  };

  const borderStyles = {
    gold: "border-[#C8A661]/30 hover:border-[#C8A661]/50",
    cyan: "border-cyan-500/30 hover:border-cyan-500/50",
    orange: "border-orange-500/30 hover:border-orange-500/50"
  };

  return (
    <div className={cn(
      "relative rounded-xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border transition-all duration-300",
      glowStyles[glowColor],
      borderStyles[glowColor],
      animated && "animate-pulse-subtle",
      className
    )} data-testid="futuristic-card">
      {children}
    </div>
  );
}

// Premium HUD-style stat display
interface HUDStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  live?: boolean;
  format?: "currency" | "number" | "percent";
  size?: "sm" | "md" | "lg";
  glowColor?: "gold" | "cyan" | "orange";
}

export function HUDStat({
  label,
  value,
  icon,
  trend,
  live = false,
  format = "number",
  size = "md",
  glowColor = "gold"
}: HUDStatProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    if (format === "currency") return `$${val.toLocaleString()}`;
    if (format === "percent") return `${val}%`;
    return val.toLocaleString();
  };

  const sizes = {
    sm: { value: "text-lg", label: "text-xs", icon: "w-8 h-8" },
    md: { value: "text-2xl", label: "text-sm", icon: "w-10 h-10" },
    lg: { value: "text-3xl", label: "text-base", icon: "w-12 h-12" }
  };

  const glowTextColors = {
    gold: "text-[#C8A661]",
    cyan: "text-cyan-400",
    orange: "text-orange-400"
  };

  return (
    <div className="relative p-4" data-testid={`hud-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-lg bg-gradient-to-br from-[#0A1628] to-[#1a2a4a] flex items-center justify-center border border-white/10",
          sizes[size].icon
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-medium text-gray-400", sizes[size].label)}>{label}</span>
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </div>
          <div className={cn("font-bold", sizes[size].value, glowTextColors[glowColor])}>
            {formatValue(value)}
          </div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-xs font-medium",
              trend >= 0 ? "text-[#C8A661]" : "text-red-400"
            )}>
              <TrendingUp className={cn("w-3 h-3", trend < 0 && "rotate-180")} />
              {trend >= 0 ? "+" : ""}{trend}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enterprise Dashboard Header with live status
interface EnterpriseDashboardHeaderProps {
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
  isLive?: boolean;
  lastUpdate?: Date;
  badges?: Array<{ label: string; variant?: "gold" | "cyan" | "security" }>;
  actions?: React.ReactNode;
}

export function EnterpriseDashboardHeader({
  title,
  subtitle,
  logo,
  isLive = false,
  lastUpdate,
  badges = [],
  actions
}: EnterpriseDashboardHeaderProps) {
  return (
    <div className="border-b border-white/10 bg-gradient-to-r from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a]" data-testid="enterprise-header">
      <div className="max-w-[1800px] mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {logo && (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8A661] to-[#8B7355] flex items-center justify-center shadow-lg shadow-[#C8A661]/20">
                {logo}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">{title}</h1>
                {badges.map((badge, i) => (
                  <Badge 
                    key={i}
                    className={cn(
                      badge.variant === "gold" && "bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30",
                      badge.variant === "cyan" && "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
                      badge.variant === "security" && "bg-green-500/10 text-green-400 border-green-500/20"
                    )}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-3 text-sm mt-1">
                {subtitle && <span className="text-gray-400">{subtitle}</span>}
                {isLive && (
                  <>
                    <span className="text-gray-700">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-green-400 text-xs font-medium">LIVE</span>
                    </div>
                  </>
                )}
                {lastUpdate && (
                  <span className="text-gray-500 text-xs">
                    Updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

// Futuristic KPI Grid with glow effects
interface FuturisticKPIGridProps {
  kpis: Array<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    live?: boolean;
    format?: "currency" | "number" | "percent";
  }>;
  columns?: 2 | 3 | 4 | 6 | 8;
}

export function FuturisticKPIGrid({ kpis, columns = 4 }: FuturisticKPIGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    8: "grid-cols-2 md:grid-cols-4 lg:grid-cols-8"
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns])} data-testid="kpi-grid">
      {kpis.map((kpi, i) => (
        <FuturisticCard key={i} glowColor="gold">
          <HUDStat {...kpi} size="sm" />
        </FuturisticCard>
      ))}
    </div>
  );
}

// Enterprise Section with title bar
interface EnterpriseSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function EnterpriseSection({
  title,
  subtitle,
  icon,
  badge,
  actions,
  children,
  className
}: EnterpriseSectionProps) {
  return (
    <div className={cn("rounded-xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1420] border border-white/5 overflow-hidden", className)} data-testid="enterprise-section">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0f1420]/50">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-[#0A1628] flex items-center justify-center border border-white/10">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{title}</h3>
              {badge && (
                <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 text-[10px]">
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

// Animated Progress Ring (circular gauge)
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "gold" | "cyan" | "orange";
  label?: string;
  showValue?: boolean;
}

export function ProgressRing({
  value,
  max = 100,
  size = "md",
  color = "gold",
  label,
  showValue = true
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const sizes = {
    sm: { ring: 60, stroke: 6 },
    md: { ring: 80, stroke: 8 },
    lg: { ring: 120, stroke: 10 }
  };
  
  const colors = {
    gold: "#C8A661",
    cyan: "#22D3EE",
    orange: "#F97316"
  };

  const { ring, stroke } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center" data-testid="progress-ring">
      <svg width={ring} height={ring} className="transform -rotate-90">
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={colors[color]}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
          style={{ filter: `drop-shadow(0 0 6px ${colors[color]})` }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      {label && <span className="text-xs text-gray-400 mt-2">{label}</span>}
    </div>
  );
}

// Live Activity Indicator
interface LiveIndicatorProps {
  status: "online" | "offline" | "warning" | "processing";
  label?: string;
  pulseIntensity?: "subtle" | "normal" | "strong";
}

export function LiveIndicator({ status, label, pulseIntensity = "normal" }: LiveIndicatorProps) {
  const statusStyles = {
    online: { color: "bg-green-500", glow: "shadow-green-500/50", text: "text-green-400" },
    offline: { color: "bg-red-500", glow: "shadow-red-500/50", text: "text-red-400" },
    warning: { color: "bg-[#C8A661]", glow: "shadow-[#C8A661]/50", text: "text-[#C8A661]" },
    processing: { color: "bg-cyan-500", glow: "shadow-cyan-500/50", text: "text-cyan-400" }
  };

  const pulseStyles = {
    subtle: "animate-pulse",
    normal: "animate-ping",
    strong: "animate-ping scale-150"
  };

  return (
    <div className="flex items-center gap-2" data-testid={`live-indicator-${status}`}>
      <span className="relative flex h-2.5 w-2.5">
        {status !== "offline" && (
          <span className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            statusStyles[status].color,
            pulseStyles[pulseIntensity]
          )}></span>
        )}
        <span className={cn(
          "relative inline-flex rounded-full h-2.5 w-2.5 shadow-lg",
          statusStyles[status].color,
          statusStyles[status].glow
        )}></span>
      </span>
      {label && (
        <span className={cn("text-xs font-medium", statusStyles[status].text)}>
          {label}
        </span>
      )}
    </div>
  );
}

// Futuristic Scan Line Effect
export function ScanLine({ color = "cyan" }: { color?: "cyan" | "gold" | "orange" }) {
  const colors = {
    cyan: "from-transparent via-cyan-400/30 to-transparent",
    gold: "from-transparent via-[#C8A661]/30 to-transparent",
    orange: "from-transparent via-orange-500/30 to-transparent"
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className={cn(
          "absolute inset-x-0 h-[2px] bg-gradient-to-r animate-scan",
          colors[color]
        )}
        style={{
          animation: "scan 3s linear infinite"
        }}
      />
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Hexagon Grid Background
export function HexGrid({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23C8A661' fill-opacity='0.4'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Animated Glow Orb
export function GlowOrb({ 
  size = "md", 
  color = "gold",
  className 
}: { 
  size?: "sm" | "md" | "lg"; 
  color?: "gold" | "cyan" | "orange";
  className?: string;
}) {
  const sizes = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" };
  const colors = {
    gold: "from-[#C8A661]/40 via-[#C8A661]/20 to-transparent shadow-[#C8A661]/30",
    cyan: "from-cyan-400/40 via-cyan-400/20 to-transparent shadow-cyan-400/30",
    orange: "from-orange-500/40 via-orange-500/20 to-transparent shadow-orange-500/30"
  };

  return (
    <div 
      className={cn(
        "rounded-full bg-gradient-radial animate-pulse shadow-2xl",
        sizes[size],
        colors[color],
        className
      )} 
    />
  );
}

// Futuristic Page Wrapper with ambient effects
interface FuturisticPageWrapperProps {
  children: React.ReactNode;
  showHexGrid?: boolean;
  showScanLine?: boolean;
  showGlowOrbs?: boolean;
  className?: string;
}

export function FuturisticPageWrapper({
  children,
  showHexGrid = true,
  showScanLine = false,
  showGlowOrbs = true,
  className
}: FuturisticPageWrapperProps) {
  return (
    <div className={cn("relative min-h-screen bg-gradient-to-br from-[#050a14] via-[#0a1020] to-[#0f172a]", className)}>
      {showHexGrid && <HexGrid opacity={0.03} />}
      {showScanLine && <ScanLine color="gold" />}
      {showGlowOrbs && (
        <>
          <div className="fixed top-20 right-10 opacity-30 pointer-events-none">
            <GlowOrb size="lg" color="gold" />
          </div>
          <div className="fixed bottom-40 left-10 opacity-20 pointer-events-none">
            <GlowOrb size="md" color="cyan" />
          </div>
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Futuristic Data Panel with animated border
interface DataPanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  glowColor?: "gold" | "cyan" | "orange";
  live?: boolean;
  className?: string;
}

export function DataPanel({
  title,
  subtitle,
  icon,
  children,
  glowColor = "gold",
  live = false,
  className
}: DataPanelProps) {
  const borderColors = {
    gold: "border-[#C8A661]/30",
    cyan: "border-cyan-500/30",
    orange: "border-orange-500/30"
  };

  const glowStyles = {
    gold: "shadow-[inset_0_1px_0_0_rgba(200,166,97,0.2)]",
    cyan: "shadow-[inset_0_1px_0_0_rgba(34,211,238,0.2)]",
    orange: "shadow-[inset_0_1px_0_0_rgba(249,115,22,0.2)]"
  };

  return (
    <div className={cn(
      "rounded-xl border bg-gradient-to-br from-[#1a1f2e]/90 to-[#0f1420]/90 backdrop-blur-sm overflow-hidden",
      borderColors[glowColor],
      glowStyles[glowColor],
      className
    )} data-testid="data-panel">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0A1628] to-[#1a2a4a] flex items-center justify-center border border-white/10">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {title}
              {live && <LiveIndicator status="online" />}
            </h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

// Animated Stat Counter
interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2000,
  className
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// Tech Label Badge
interface TechLabelProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "critical" | "info";
  animated?: boolean;
}

export function TechLabel({ children, variant = "default", animated = false }: TechLabelProps) {
  const variants = {
    default: "bg-[#0A1628] text-gray-300 border-white/10",
    success: "bg-green-500/10 text-green-400 border-green-500/30",
    warning: "bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30",
    critical: "bg-red-500/10 text-red-400 border-red-500/30",
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border",
      variants[variant],
      animated && "animate-pulse"
    )}>
      {children}
    </span>
  );
}

// Circular Gauge (smaller version)
interface MiniGaugeProps {
  value: number;
  max?: number;
  color?: "gold" | "cyan" | "orange" | "green";
  size?: number;
}

export function MiniGauge({ value, max = 100, color = "gold", size = 32 }: MiniGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    gold: "#C8A661",
    cyan: "#22D3EE",
    orange: "#F97316",
    green: "#22C55E"
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors[color]}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

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
            tier === "professional" && "bg-[#0A1628] text-[#C8A661] border border-[#C8A661]/40",
            tier === "starter" && "bg-[#1a3a5c] text-white border border-[#C8A661]/20",
            tier === "free" && "bg-muted text-muted-foreground"
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
                trend.value >= 0 ? "border-[#C8A661]/40 text-[#C8A661]" : "border-red-500/40 text-red-600"
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
              change >= 0 ? "border-[#C8A661]/40 text-[#C8A661]" : "border-red-500/40 text-red-600"
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
    warning: { bg: "bg-[#C8A661]/10 border-[#C8A661]/30", icon: "text-[#C8A661]", badge: "bg-[#C8A661]" },
    info: { bg: "bg-[#0A1628]/10 border-[#0A1628]/30", icon: "text-[#0A1628]", badge: "bg-[#0A1628]" },
    success: { bg: "bg-[#22C55E]/10 border-[#22C55E]/30", icon: "text-[#22C55E]", badge: "bg-[#22C55E]" }
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

// ============================================
// PREMIUM GOLD BUTTON VARIANTS
// Based on luxury navy/gold design reference
// ============================================

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: "gold-solid" | "gold-outline" | "navy-gold-border" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export function PremiumButton({
  children,
  variant = "gold-solid",
  size = "md",
  className,
  onClick,
  disabled = false,
  icon,
  iconPosition = "right"
}: PremiumButtonProps) {
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const variantStyles = {
    "gold-solid": "bg-gradient-to-r from-[#C8A661] to-[#D4B878] text-[#0A1628] font-bold border-2 border-[#C8A661] hover:from-[#D4B878] hover:to-[#E5C98A] shadow-lg shadow-[#C8A661]/30 hover:shadow-[#C8A661]/50",
    "gold-outline": "bg-transparent text-[#C8A661] font-semibold border-2 border-[#C8A661] hover:bg-[#C8A661]/10 hover:shadow-lg hover:shadow-[#C8A661]/20",
    "navy-gold-border": "bg-gradient-to-r from-[#0A1628] to-[#16213e] text-[#C8A661] font-semibold border-2 border-[#C8A661] hover:border-[#D4B878] hover:text-[#D4B878] shadow-lg shadow-[#C8A661]/20 hover:shadow-[#C8A661]/40",
    "gradient": "bg-gradient-to-r from-[#C8A661] via-[#D4B878] to-[#C8A661] text-[#0A1628] font-bold border-0 hover:from-[#D4B878] hover:via-[#E5C98A] hover:to-[#D4B878] shadow-xl shadow-[#C8A661]/40 animate-shimmer bg-[length:200%_100%]"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-lg transition-all duration-300 flex items-center justify-center gap-2 tracking-wide uppercase",
        sizeStyles[size],
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      data-testid="premium-button"
    >
      {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
}

// ============================================
// ART DECO DIVIDER
// Ornate gold decorative separators
// ============================================

interface ArtDecoDividerProps {
  variant?: "simple" | "ornate" | "diamond" | "dots";
  color?: "gold" | "white" | "cyan";
  className?: string;
}

export function ArtDecoDivider({ 
  variant = "simple", 
  color = "gold",
  className 
}: ArtDecoDividerProps) {
  const colorStyles = {
    gold: "border-[#C8A661]",
    white: "border-white/20",
    cyan: "border-cyan-400/50"
  };

  const bgColors = {
    gold: "bg-[#C8A661]",
    white: "bg-white/20",
    cyan: "bg-cyan-400/50"
  };

  if (variant === "simple") {
    return (
      <div className={cn("flex items-center gap-4", className)} data-testid="art-deco-divider">
        <div className={cn("flex-1 h-px", bgColors[color])} />
        <div className={cn("w-2 h-2 rotate-45 border-2", colorStyles[color])} />
        <div className={cn("flex-1 h-px", bgColors[color])} />
      </div>
    );
  }

  if (variant === "ornate") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)} data-testid="art-deco-divider">
        <div className={cn("w-16 h-px", bgColors[color])} />
        <div className={cn("w-1.5 h-1.5 rotate-45", bgColors[color])} />
        <div className={cn("w-2 h-2 rotate-45 border-2", colorStyles[color])} />
        <div className={cn("w-3 h-3 rotate-45 border-2", colorStyles[color])} />
        <div className={cn("w-2 h-2 rotate-45 border-2", colorStyles[color])} />
        <div className={cn("w-1.5 h-1.5 rotate-45", bgColors[color])} />
        <div className={cn("w-16 h-px", bgColors[color])} />
      </div>
    );
  }

  if (variant === "diamond") {
    return (
      <div className={cn("flex items-center justify-center gap-3", className)} data-testid="art-deco-divider">
        <div className={cn("flex-1 h-px max-w-24", bgColors[color])} />
        <div className={cn("w-4 h-4 rotate-45 border-2", colorStyles[color], "flex items-center justify-center")}>
          <div className={cn("w-1.5 h-1.5 rotate-45", bgColors[color])} />
        </div>
        <div className={cn("flex-1 h-px max-w-24", bgColors[color])} />
      </div>
    );
  }

  // dots variant
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} data-testid="art-deco-divider">
      <div className={cn("w-20 h-px", bgColors[color])} />
      <div className={cn("w-1.5 h-1.5 rounded-full", bgColors[color])} />
      <div className={cn("w-2 h-2 rounded-full", bgColors[color])} />
      <div className={cn("w-1.5 h-1.5 rounded-full", bgColors[color])} />
      <div className={cn("w-20 h-px", bgColors[color])} />
    </div>
  );
}

// ============================================
// GLASSMORPHISM CARD
// Frosted glass effect with backdrop blur
// ============================================

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "strong";
  borderGlow?: boolean;
  glowColor?: "gold" | "cyan" | "white";
}

export function GlassmorphismCard({
  children,
  className,
  intensity = "medium",
  borderGlow = true,
  glowColor = "gold"
}: GlassmorphismCardProps) {
  const intensityStyles = {
    light: "bg-white/5 backdrop-blur-sm",
    medium: "bg-white/10 backdrop-blur-md",
    strong: "bg-white/15 backdrop-blur-lg"
  };

  const borderGlowStyles = {
    gold: "border-[#C8A661]/30 shadow-[0_0_20px_rgba(200,166,97,0.1)]",
    cyan: "border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]",
    white: "border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
  };

  return (
    <div 
      className={cn(
        "rounded-xl border transition-all duration-300",
        intensityStyles[intensity],
        borderGlow && borderGlowStyles[glowColor],
        "hover:bg-white/15",
        className
      )}
      data-testid="glassmorphism-card"
    >
      {children}
    </div>
  );
}

// ============================================
// GOLD BORDER CARD
// Premium cards with animated gold gradient borders
// ============================================

interface GoldBorderCardProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  variant?: "default" | "thick" | "double";
}

export function GoldBorderCard({
  children,
  className,
  animated = false,
  variant = "default"
}: GoldBorderCardProps) {
  const borderWidth = {
    default: "p-[1px]",
    thick: "p-[2px]",
    double: "p-[3px]"
  };

  return (
    <div 
      className={cn(
        "rounded-xl bg-gradient-to-br from-[#C8A661] via-[#D4B878] to-[#B8964F]",
        borderWidth[variant],
        animated && "animate-gradient-rotate bg-[length:200%_200%]"
      )}
      data-testid="gold-border-card"
    >
      <div className={cn(
        "rounded-[10px] bg-gradient-to-br from-[#0A1628] to-[#16213e] h-full",
        className
      )}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// PREMIUM BADGE
// Enhanced badges with gold styling
// ============================================

interface PremiumBadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "gold-outline" | "elite" | "live" | "new";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function PremiumBadge({
  children,
  variant = "gold",
  size = "md",
  animated = false,
  className
}: PremiumBadgeProps) {
  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5"
  };

  const variantStyles = {
    gold: "bg-gradient-to-r from-[#C8A661] to-[#D4B878] text-[#0A1628] font-bold",
    "gold-outline": "bg-transparent border-2 border-[#C8A661] text-[#C8A661] font-semibold",
    elite: "bg-gradient-to-r from-[#C8A661] via-[#E5C98A] to-[#C8A661] text-[#0A1628] font-bold shadow-lg shadow-[#C8A661]/40",
    live: "bg-red-500/90 text-white font-bold animate-pulse",
    new: "bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold"
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider",
        sizeStyles[size],
        variantStyles[variant],
        animated && variant !== "live" && "animate-shimmer bg-[length:200%_100%]",
        className
      )}
      data-testid="premium-badge"
    >
      {variant === "elite" && <Crown className="w-3 h-3" />}
      {variant === "live" && <Radio className="w-3 h-3" />}
      {variant === "new" && <Sparkles className="w-3 h-3" />}
      {children}
    </span>
  );
}

// ============================================
// PREMIUM SECTION HEADER
// Luxurious section headers with Art Deco styling
// ============================================

interface PremiumSectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
  divider?: boolean;
  dividerVariant?: "simple" | "ornate" | "diamond";
  className?: string;
}

export function PremiumSectionHeader({
  title,
  subtitle,
  badge,
  centered = true,
  divider = true,
  dividerVariant = "diamond",
  className
}: PremiumSectionHeaderProps) {
  return (
    <div className={cn("mb-12", centered && "text-center", className)} data-testid="premium-section-header">
      {badge && (
        <PremiumBadge variant="gold-outline" size="sm" className="mb-4">
          {badge}
        </PremiumBadge>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          {subtitle}
        </p>
      )}
      {divider && (
        <ArtDecoDivider variant={dividerVariant} color="gold" className="mt-6" />
      )}
    </div>
  );
}

// ============================================
// ANIMATED SHINE EFFECT
// Gold shimmer animation for premium elements
// ============================================

interface ShineEffectProps {
  children: React.ReactNode;
  className?: string;
}

export function ShineEffect({ children, className }: ShineEffectProps) {
  return (
    <div className={cn("relative overflow-hidden", className)} data-testid="shine-effect">
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
}

// ============================================
// PREMIUM STAT CARD
// Luxurious stat display with gold accents
// ============================================

interface PremiumStatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: { value: number; direction: "up" | "down" };
  accentColor?: "gold" | "cyan" | "green";
  className?: string;
}

export function PremiumStatCardV2({
  value,
  label,
  icon,
  trend,
  accentColor = "gold",
  className
}: PremiumStatCardProps) {
  const accentStyles = {
    gold: "border-t-[#C8A661] text-[#C8A661]",
    cyan: "border-t-cyan-400 text-cyan-400",
    green: "border-t-green-400 text-green-400"
  };

  return (
    <GoldBorderCard className={cn("p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={cn("p-2 rounded-lg bg-white/5", accentStyles[accentColor])}>
            {icon}
          </div>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend.direction === "up" ? "text-green-400" : "text-red-400"
          )}>
            <TrendingUp className={cn("w-4 h-4", trend.direction === "down" && "rotate-180")} />
            {trend.value}%
          </div>
        )}
      </div>
      <div className={cn("text-3xl md:text-4xl font-bold mb-1", accentStyles[accentColor].split(" ")[1])}>
        {value}
      </div>
      <div className="text-gray-400 text-sm uppercase tracking-wider">
        {label}
      </div>
    </GoldBorderCard>
  );
}
