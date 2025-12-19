import { cn } from "@/lib/utils";

// ============================================
// PREMIUM CHART THEME - Navy/Gold Art Deco
// Centralized chart styling for WashBizHub
// ============================================

// Premium Color Palette
export const premiumChartColors = {
  // Primary Navy palette
  navy: {
    900: "#0A1628",
    800: "#101D32",
    700: "#16213e",
    600: "#1e3a5f",
    500: "#2a4a6f",
    400: "#3a5a7f",
  },
  // Gold accent palette
  gold: {
    500: "#C8A661",
    400: "#D4B878",
    300: "#E5C98A",
    600: "#B8963F",
    gradient: "linear-gradient(135deg, #C8A661 0%, #E5C98A 50%, #C8A661 100%)",
  },
  // CLEANBI grade colors (do not change)
  grades: {
    A: "#22C55E",
    B: "#A3E635", 
    C: "#FBBF24",
    needsWork: "#C8A661",
  },
  // Chart series colors
  series: {
    primary: "#4A90D9",     // Blue
    secondary: "#C8A661",    // Gold
    tertiary: "#00CED1",     // Cyan
    quaternary: "#9B59B6",   // Purple
    quinary: "#E74C3C",      // Red-coral
  },
  // Bar chart gradients
  bars: {
    blue: ["#3B82F6", "#1D4ED8"],
    gold: ["#C8A661", "#B8963F"],
    cyan: ["#00CED1", "#008B8B"],
    purple: ["#8B5CF6", "#6D28D9"],
    coral: ["#F97316", "#EA580C"],
  },
};

// Chart configuration for Recharts
export const premiumChartConfig = {
  // Axis styling
  axis: {
    stroke: "#475569",
    fontSize: 11,
    fontFamily: "Inter, system-ui, sans-serif",
    tickMargin: 8,
  },
  // Grid styling
  grid: {
    stroke: "#334155",
    strokeDasharray: "3 3",
    opacity: 0.4,
  },
  // Tooltip styling
  tooltip: {
    backgroundColor: "#0A1628",
    borderColor: "#C8A661",
    borderRadius: 8,
    boxShadow: "0 4px 20px rgba(200, 166, 97, 0.2)",
  },
  // Legend styling
  legend: {
    fontSize: 12,
    fontWeight: 500,
  },
};

// Premium gradient definitions for SVG charts
export function PremiumChartGradients() {
  return (
    <defs>
      {/* Gold gradient */}
      <linearGradient id="premiumGoldGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E5C98A" stopOpacity={1} />
        <stop offset="50%" stopColor="#C8A661" stopOpacity={1} />
        <stop offset="100%" stopColor="#B8963F" stopOpacity={0.8} />
      </linearGradient>
      
      {/* Blue gradient */}
      <linearGradient id="premiumBlueGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#60A5FA" stopOpacity={1} />
        <stop offset="50%" stopColor="#3B82F6" stopOpacity={1} />
        <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.8} />
      </linearGradient>
      
      {/* Cyan gradient */}
      <linearGradient id="premiumCyanGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22D3EE" stopOpacity={1} />
        <stop offset="50%" stopColor="#00CED1" stopOpacity={1} />
        <stop offset="100%" stopColor="#008B8B" stopOpacity={0.8} />
      </linearGradient>
      
      {/* Purple gradient */}
      <linearGradient id="premiumPurpleGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A78BFA" stopOpacity={1} />
        <stop offset="50%" stopColor="#8B5CF6" stopOpacity={1} />
        <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.8} />
      </linearGradient>
      
      {/* Coral/Orange gradient */}
      <linearGradient id="premiumCoralGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FB923C" stopOpacity={1} />
        <stop offset="50%" stopColor="#F97316" stopOpacity={1} />
        <stop offset="100%" stopColor="#EA580C" stopOpacity={0.8} />
      </linearGradient>
      
      {/* Horizontal gold gradient for bars */}
      <linearGradient id="premiumGoldHorizontal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#B8963F" stopOpacity={1} />
        <stop offset="100%" stopColor="#E5C98A" stopOpacity={1} />
      </linearGradient>
      
      {/* Glow effect for gold */}
      <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood floodColor="#C8A661" floodOpacity="0.5" />
        <feComposite in2="blur" operator="in" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      
      {/* Radial gradient for gauges */}
      <radialGradient id="premiumRadialGold" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E5C98A" stopOpacity={0.8} />
        <stop offset="70%" stopColor="#C8A661" stopOpacity={0.6} />
        <stop offset="100%" stopColor="#B8963F" stopOpacity={0.3} />
      </radialGradient>
      
      {/* Area chart fill gradient */}
      <linearGradient id="premiumAreaFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C8A661" stopOpacity={0.4} />
        <stop offset="100%" stopColor="#C8A661" stopOpacity={0.05} />
      </linearGradient>
    </defs>
  );
}

// Premium Chart Card wrapper
interface PremiumChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function PremiumChartCard({
  title,
  subtitle,
  badge,
  children,
  className,
  actions
}: PremiumChartCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#C8A661]/20",
        "bg-gradient-to-br from-[#0A1628] via-[#101D32] to-[#16213e]",
        "p-6 shadow-xl shadow-[#C8A661]/5",
        className
      )}
      data-testid="premium-chart-card"
    >
      {/* Gold corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#C8A661]/10 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 
              className="text-lg font-bold text-white uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
            >
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-[#C8A661]/20 text-[#C8A661] rounded-full border border-[#C8A661]/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Chart content */}
      <div className="relative">
        {children}
      </div>
      
      {/* Bottom gold line accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-[#C8A661]/50 to-transparent" />
    </div>
  );
}

// Premium KPI Card for dashboards
interface PremiumKPICardProps {
  label: string;
  value: string | number;
  change?: { value: number; label?: string };
  icon?: React.ReactNode;
  accentColor?: "gold" | "blue" | "cyan" | "green";
  className?: string;
}

export function PremiumKPICard({
  label,
  value,
  change,
  icon,
  accentColor = "gold",
  className
}: PremiumKPICardProps) {
  const accentStyles = {
    gold: "border-t-[#C8A661] text-[#C8A661]",
    blue: "border-t-blue-500 text-blue-400",
    cyan: "border-t-cyan-500 text-cyan-400",
    green: "border-t-green-500 text-green-400",
  };
  
  const isPositive = change && change.value >= 0;
  
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/10",
        "bg-gradient-to-br from-[#0A1628] to-[#16213e]",
        "p-4 border-t-2",
        accentStyles[accentColor],
        className
      )}
      data-testid="premium-kpi-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p 
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div className={cn("p-2 rounded-lg bg-white/5", accentStyles[accentColor])}>
            {icon}
          </div>
        )}
      </div>
      
      {change && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn(
            "text-xs font-medium",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            {isPositive ? "+" : ""}{change.value}%
          </span>
          {change.label && (
            <span className="text-xs text-gray-500">{change.label}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Premium Legend component
interface LegendItem {
  name: string;
  color: string;
  value?: string | number;
}

interface PremiumChartLegendProps {
  items: LegendItem[];
  layout?: "horizontal" | "vertical";
  className?: string;
}

export function PremiumChartLegend({
  items,
  layout = "horizontal",
  className
}: PremiumChartLegendProps) {
  return (
    <div 
      className={cn(
        "flex gap-4",
        layout === "vertical" ? "flex-col" : "flex-wrap items-center justify-center",
        className
      )}
      data-testid="premium-chart-legend"
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-400">{item.name}</span>
          {item.value !== undefined && (
            <span className="text-xs font-semibold text-white">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Premium Semi-circular Gauge component
interface PremiumGaugeProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  color?: "gold" | "blue" | "cyan" | "green" | "grade";
  grade?: "A" | "B" | "C" | "needsWork";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PremiumGauge({
  value,
  max = 100,
  label,
  sublabel,
  color = "gold",
  grade,
  size = "md",
  className
}: PremiumGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = size === "sm" ? 50 : size === "md" ? 70 : 90;
  const strokeWidth = size === "sm" ? 8 : size === "md" ? 10 : 12;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorStyles = {
    gold: "#C8A661",
    blue: "#3B82F6",
    cyan: "#00CED1",
    green: "#22C55E",
  };
  
  const gradeColors = {
    A: "#22C55E",
    B: "#A3E635",
    C: "#FBBF24",
    needsWork: "#C8A661",
  };
  
  const strokeColor = grade ? gradeColors[grade] : colorStyles[color];
  const svgSize = radius * 2 + strokeWidth * 2;
  
  return (
    <div className={cn("flex flex-col items-center", className)} data-testid="premium-gauge">
      <div className="relative" style={{ width: svgSize, height: svgSize / 2 + 10 }}>
        <svg
          width={svgSize}
          height={svgSize / 2 + 10}
          viewBox={`0 0 ${svgSize} ${svgSize / 2 + 10}`}
          className="transform -rotate-180"
        >
          <PremiumChartGradients />
          
          {/* Background arc */}
          <path
            d={`M ${strokeWidth} ${svgSize / 2} A ${radius} ${radius} 0 0 1 ${svgSize - strokeWidth} ${svgSize / 2}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <path
            d={`M ${strokeWidth} ${svgSize / 2} A ${radius} ${radius} 0 0 1 ${svgSize - strokeWidth} ${svgSize / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: grade ? "drop-shadow(0 0 8px currentColor)" : undefined }}
          />
        </svg>
        
        {/* Center value */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
          style={{ paddingBottom: 5 }}
        >
          <span 
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)' }}
          >
            {grade || value}
          </span>
        </div>
      </div>
      
      <p className="text-sm font-medium text-white mt-2">{label}</p>
      {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}

// Income/Expense Chart with trend arrow (inspired by reference image)
interface IncomeExpenseData {
  period: string;
  income: number;
  expense: number;
}

interface PremiumIncomeExpenseChartProps {
  data: IncomeExpenseData[];
  showTrendArrow?: boolean;
  className?: string;
}

export function PremiumIncomeExpenseChart({
  data,
  showTrendArrow = true,
  className
}: PremiumIncomeExpenseChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense])) * 1.2;
  
  return (
    <div className={cn("relative", className)} data-testid="premium-income-expense-chart">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#1D4ED8] to-[#60A5FA]" />
          <span className="text-xs text-gray-400">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#EA580C] to-[#FB923C]" />
          <span className="text-xs text-gray-400">Expense</span>
        </div>
      </div>
      
      {/* Chart area */}
      <div className="relative h-48">
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 right-0 border-t border-dashed border-gray-700/50"
            style={{ bottom: `${tick}%` }}
          />
        ))}
        
        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around px-4">
          {data.map((item, index) => (
            <div key={index} className="flex gap-1 items-end">
              {/* Income bar */}
              <div
                className="w-6 rounded-t bg-gradient-to-t from-[#1D4ED8] to-[#60A5FA] transition-all duration-500"
                style={{ height: `${(item.income / maxValue) * 100}%` }}
              />
              {/* Expense bar */}
              <div
                className="w-6 rounded-t bg-gradient-to-t from-[#EA580C] to-[#FB923C] transition-all duration-500"
                style={{ height: `${(item.expense / maxValue) * 100}%` }}
              />
            </div>
          ))}
        </div>
        
        {/* Trend arrow */}
        {showTrendArrow && (
          <div className="absolute top-4 right-4 flex items-center gap-1 text-[#C8A661]">
            <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
              <path
                d="M4 20C8 16 16 12 24 8C28 6 32 4 36 2"
                stroke="#C8A661"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polygon points="36,2 32,8 38,6" fill="#C8A661" />
            </svg>
          </div>
        )}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-around mt-2 px-4">
        {data.map((item, index) => (
          <span key={index} className="text-xs text-gray-500">{item.period}</span>
        ))}
      </div>
    </div>
  );
}

// Export chart gradient IDs for use in Recharts
export const chartGradientIds = {
  gold: "url(#premiumGoldGradient)",
  blue: "url(#premiumBlueGradient)",
  cyan: "url(#premiumCyanGradient)",
  purple: "url(#premiumPurpleGradient)",
  coral: "url(#premiumCoralGradient)",
  goldHorizontal: "url(#premiumGoldHorizontal)",
  areaFill: "url(#premiumAreaFill)",
};
