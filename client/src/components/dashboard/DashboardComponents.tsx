import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Minus, LucideIcon,
  Users, DollarSign, BarChart3, Eye, Star, BookOpen,
  Calculator, FileText, Award, Target, Zap
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  variant?: 'pink' | 'yellow' | 'cyan' | 'green' | 'purple' | 'orange' | 'blue' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  pink: 'bg-gradient-to-br from-pink-500 to-pink-600 text-white',
  yellow: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900',
  cyan: 'bg-gradient-to-br from-cyan-400 to-cyan-500 text-gray-900',
  green: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
  orange: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
  default: 'bg-card text-foreground border',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', size = 'md' }: StatCardProps) {
  const sizeStyles = {
    sm: { card: 'p-3', value: 'text-2xl', title: 'text-xs', icon: 'w-8 h-8' },
    md: { card: 'p-4', value: 'text-3xl', title: 'text-sm', icon: 'w-10 h-10' },
    lg: { card: 'p-6', value: 'text-4xl', title: 'text-base', icon: 'w-12 h-12' },
  };

  const styles = sizeStyles[size];

  return (
    <div className={cn("rounded-xl shadow-lg", styles.card, variantStyles[variant])} data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium opacity-80 truncate", styles.title)}>{title}</p>
          <p className={cn("font-black tracking-tight", styles.value)}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend.value < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span className="text-xs font-bold">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && <span className="text-xs opacity-70">{trend.label}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-2 bg-white/20 flex-shrink-0", variant === 'default' && 'bg-primary/10')}>
            <Icon className={styles.icon} />
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'default';
}

export function MetricCard({ label, value, change, changeLabel, prefix = '', suffix = '', color = 'default' }: MetricCardProps) {
  const colorStyles = {
    green: 'text-emerald-500',
    red: 'text-red-500',
    yellow: 'text-amber-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    default: 'text-foreground',
  };

  return (
    <Card className="hover-elevate" data-testid={`metric-card-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className={cn("text-3xl font-black mt-1", colorStyles[color])}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {change > 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : change < 0 ? (
              <TrendingDown className="w-3 h-3 text-red-500" />
            ) : (
              <Minus className="w-3 h-3 text-muted-foreground" />
            )}
            <span className={cn("text-sm font-semibold", change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground')}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface GaugeProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  size?: number;
  thickness?: number;
  color?: string;
  showPercentage?: boolean;
}

export function Gauge({ value, max = 100, label, sublabel, size = 120, thickness = 12, color, showPercentage = true }: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const autoColor = color || (
    percentage >= 80 ? '#10b981' :
    percentage >= 60 ? '#f59e0b' :
    percentage >= 40 ? '#f97316' :
    '#ef4444'
  );

  return (
    <div className="flex flex-col items-center" data-testid={`gauge-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={thickness}
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={autoColor}
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color: autoColor }}>
            {showPercentage ? `${percentage.toFixed(0)}%` : value.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="font-semibold text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'pink' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ value, max = 100, label, showValue = true, color = 'blue', size = 'md' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorStyles = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500',
  };

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full" data-testid={`progress-bar-${label?.toLowerCase().replace(/\s/g, '-') || 'default'}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-muted-foreground">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({ data, size = 160, thickness = 24, showLegend = true, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const segments = data.map((item) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const strokeDasharray = (percentage / 100) * circumference;
    const segment = {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset: -currentOffset,
    };
    currentOffset += strokeDasharray;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-4" data-testid="donut-chart">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={`${segment.strokeDasharray} ${circumference}`}
              strokeDashoffset={segment.strokeDashoffset}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-2xl font-black text-foreground">{centerValue}</span>}
            {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
          </div>
        )}
      </div>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MiniBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showLabels?: boolean;
  maxValue?: number;
}

export function MiniBarChart({ data, height = 100, showLabels = true, maxValue }: MiniBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="w-full" data-testid="mini-bar-chart">
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full rounded-t transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: item.color || colors[index % colors.length],
                  minHeight: '4px',
                }}
              />
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <span key={index} className="text-xs text-muted-foreground text-center flex-1 truncate">
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface DataTableProps {
  columns: { key: string; label: string; align?: 'left' | 'center' | 'right'; format?: (value: any) => ReactNode }[];
  data: Record<string, any>[];
  highlightColumn?: string;
}

export function DataTable({ columns, data, highlightColumn }: DataTableProps) {
  return (
    <div className="overflow-x-auto" data-testid="data-table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "py-3 px-4 font-semibold text-muted-foreground",
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
              {columns.map((col) => {
                const value = row[col.key];
                const isHighlight = col.key === highlightColumn;
                const isNegative = typeof value === 'number' && value < 0;
                const isPositive = typeof value === 'number' && value > 0;

                return (
                  <td
                    key={col.key}
                    className={cn(
                      "py-3 px-4",
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                      isHighlight && isNegative && 'text-red-500 font-semibold',
                      isHighlight && isPositive && 'text-emerald-500 font-semibold'
                    )}
                  >
                    {col.format ? col.format(value) : (typeof value === 'number' ? value.toLocaleString() : value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PipelineStepsProps {
  steps: { label: string; value: number; isActive?: boolean; color?: string }[];
}

export function PipelineSteps({ steps }: PipelineStepsProps) {
  const max = Math.max(...steps.map(s => s.value));
  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#14b8a6'];

  return (
    <div className="flex items-end justify-between gap-2 py-4" data-testid="pipeline-steps">
      {steps.map((step, index) => {
        const height = (step.value / max) * 100;
        const color = step.color || colors[index % colors.length];

        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <span className="text-lg font-bold mb-2" style={{ color }}>{step.value}</span>
            <div
              className={cn(
                "w-full rounded-full transition-all duration-300",
                step.isActive ? 'ring-2 ring-offset-2 ring-offset-background' : ''
              )}
              style={{
                height: `${Math.max(height, 20)}px`,
                backgroundColor: color,
                boxShadow: step.isActive ? `0 0 10px ${color}` : 'none',
              }}
            />
            <span className="text-xs text-muted-foreground mt-2 text-center">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

interface FilterPillProps {
  options: { value: string; label: string; color?: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterPills({ options, value, onChange }: FilterPillProps) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="filter-pills">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all",
            value === option.value
              ? "text-white shadow-lg"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          style={value === option.value ? { backgroundColor: option.color || '#8b5cf6' } : {}}
          data-testid={`filter-pill-${option.value}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  color?: string;
}

export function SectionHeader({ title, subtitle, action, icon: Icon, color = '#8b5cf6' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6" data-testid={`section-header-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface GradeCardProps {
  grade: 'A' | 'B' | 'C' | 'Needs Work' | string;
  label: string;
  value?: number;
  sublabel?: string;
}

export function GradeCard({ grade, label, value, sublabel }: GradeCardProps) {
  const gradeStyles: Record<string, { bg: string; text: string; border: string }> = {
    'A': { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]', border: 'border-[#22C55E]/30' },
    'B': { bg: 'bg-[#A3E635]/20', text: 'text-[#A3E635]', border: 'border-[#A3E635]/30' },
    'C': { bg: 'bg-[#FBBF24]/20', text: 'text-[#FBBF24]', border: 'border-[#FBBF24]/30' },
    'Needs Work': { bg: 'bg-[#C8A661]/20', text: 'text-[#C8A661]', border: 'border-[#C8A661]/30' },
  };

  const style = gradeStyles[grade] || gradeStyles['Needs Work'];

  return (
    <div className={cn("rounded-xl p-4 border", style.bg, style.border)} data-testid={`grade-card-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {value !== undefined && <p className="text-lg font-semibold text-foreground">{value.toLocaleString()}</p>}
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        <div className={cn("text-4xl font-black", style.text)}>{grade}</div>
      </div>
    </div>
  );
}

export function DashboardGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 | 5 | 6 }) {
  const colStyles = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={cn("grid gap-4", colStyles[cols])} data-testid="dashboard-grid">
      {children}
    </div>
  );
}

export {
  Users, DollarSign, BarChart3, Eye, Star, BookOpen,
  Calculator, FileText, Award, Target, Zap
};
