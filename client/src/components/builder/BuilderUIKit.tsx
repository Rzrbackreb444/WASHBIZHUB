import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DollarSign, Percent, Hash, TrendingUp, TrendingDown, 
  Info, Star, CheckCircle, AlertTriangle, Clock, 
  Calculator, BarChart3, PieChart, LineChart,
  ArrowUp, ArrowDown, Minus
} from "lucide-react";

// ============================================================================
// COLOR SYSTEM - Calculoid/Calconic Style
// ============================================================================

export const METRIC_COLORS = {
  teal: {
    border: "border-[#00A699]",
    bg: "bg-[#00A699]/10",
    text: "text-[#00A699]",
    solid: "bg-[#00A699]",
    hex: "#00A699"
  },
  orange: {
    border: "border-[#FF6B35]",
    bg: "bg-[#FF6B35]/10",
    text: "text-[#FF6B35]",
    solid: "bg-[#FF6B35]",
    hex: "#FF6B35"
  },
  salmon: {
    border: "border-[#FF8A80]",
    bg: "bg-[#FF8A80]/10",
    text: "text-[#FF8A80]",
    solid: "bg-[#FF8A80]",
    hex: "#FF8A80"
  },
  green: {
    border: "border-[#4CAF50]",
    bg: "bg-[#4CAF50]/10",
    text: "text-[#4CAF50]",
    solid: "bg-[#4CAF50]",
    hex: "#4CAF50"
  },
  blue: {
    border: "border-[#2196F3]",
    bg: "bg-[#2196F3]/10",
    text: "text-[#2196F3]",
    solid: "bg-[#2196F3]",
    hex: "#2196F3"
  },
  purple: {
    border: "border-[#9C27B0]",
    bg: "bg-[#9C27B0]/10",
    text: "text-[#9C27B0]",
    solid: "bg-[#9C27B0]",
    hex: "#9C27B0"
  },
  yellow: {
    border: "border-[#FFC107]",
    bg: "bg-[#FFC107]/10",
    text: "text-[#FFC107]",
    solid: "bg-[#FFC107]",
    hex: "#FFC107"
  },
  pink: {
    border: "border-[#E91E63]",
    bg: "bg-[#E91E63]/10",
    text: "text-[#E91E63]",
    solid: "bg-[#E91E63]",
    hex: "#E91E63"
  },
  indigo: {
    border: "border-[#3F51B5]",
    bg: "bg-[#3F51B5]/10",
    text: "text-[#3F51B5]",
    solid: "bg-[#3F51B5]",
    hex: "#3F51B5"
  },
  cyan: {
    border: "border-[#00BCD4]",
    bg: "bg-[#00BCD4]/10",
    text: "text-[#00BCD4]",
    solid: "bg-[#00BCD4]",
    hex: "#00BCD4"
  }
} as const;

export type MetricColor = keyof typeof METRIC_COLORS;

// ============================================================================
// METRIC CARD - Colorful bordered card for displaying values
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string | number;
  color?: MetricColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
  highlight?: boolean;
  format?: 'currency' | 'number' | 'percentage' | 'text' | 'years' | 'months';
  prefix?: string;
  suffix?: string;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  color = 'teal',
  size = 'md',
  icon,
  trend,
  trendValue,
  subtitle,
  highlight = false,
  format = 'text',
  prefix,
  suffix,
  className,
  onClick
}: MetricCardProps) {
  const colors = METRIC_COLORS[color];
  
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
        return val.toLocaleString('en-US');
      case 'years':
        return `${val.toFixed(1)} years`;
      case 'months':
        return `${Math.round(val)} months`;
      default:
        return String(val);
    }
  };
  
  const sizeClasses = {
    sm: { card: 'p-3', label: 'text-xs', value: 'text-lg', icon: 'w-4 h-4' },
    md: { card: 'p-4', label: 'text-sm', value: 'text-2xl', icon: 'w-5 h-5' },
    lg: { card: 'p-5', label: 'text-base', value: 'text-3xl', icon: 'w-6 h-6' },
    xl: { card: 'p-6', label: 'text-lg', value: 'text-4xl', icon: 'w-8 h-8' }
  };
  
  const sizes = sizeClasses[size];
  
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
  
  return (
    <div
      data-testid={`metric-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn(
        "rounded-lg border-l-4 bg-card transition-all",
        colors.border,
        highlight && colors.bg,
        onClick && "cursor-pointer hover-elevate",
        sizes.card,
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn("text-muted-foreground font-medium truncate", sizes.label)}>
            {label}
          </p>
          <p className={cn("font-bold tracking-tight mt-1", colors.text, sizes.value)}>
            {prefix}{formatValue(value)}{suffix}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("flex-shrink-0 p-2 rounded-lg", colors.bg)}>
            <div className={cn(colors.text, sizes.icon)}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// METRIC GRID - Responsive grid for metric cards
// ============================================================================

interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MetricGrid({ 
  children, 
  columns = 4, 
  gap = 'md',
  className 
}: MetricGridProps) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  };
  
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  return (
    <div className={cn("grid", colClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// ============================================================================
// HIGHLIGHT BOX - Large featured metric with colored background
// ============================================================================

interface HighlightBoxProps {
  label: string;
  value: string | number;
  color?: MetricColor;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  className?: string;
}

export function HighlightBox({
  label,
  value,
  color = 'teal',
  icon,
  description,
  badge,
  className
}: HighlightBoxProps) {
  const colors = METRIC_COLORS[color];
  
  return (
    <div
      data-testid={`highlight-box-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn(
        "relative rounded-xl p-6 text-white overflow-hidden",
        colors.solid,
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <div className="w-full h-full rounded-full bg-white/30 -translate-x-8 -translate-y-8" />
      </div>
      
      <div className="relative z-10">
        {badge && (
          <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
            {badge}
          </Badge>
        )}
        
        <div className="flex items-center gap-3 mb-2">
          {icon && <div className="w-8 h-8">{icon}</div>}
          <p className="text-white/80 font-medium">{label}</p>
        </div>
        
        <p className="text-4xl font-bold tracking-tight">{value}</p>
        
        {description && (
          <p className="text-white/70 text-sm mt-2">{description}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STYLED INPUT - Colorful input fields for calculators
// ============================================================================

interface StyledInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'number' | 'currency' | 'percentage' | 'text';
  color?: MetricColor;
  placeholder?: string;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function StyledInput({
  label,
  name,
  value,
  onChange,
  type = 'number',
  color = 'teal',
  placeholder,
  tooltip,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  required = false,
  disabled = false,
  className
}: StyledInputProps) {
  const colors = METRIC_COLORS[color];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (type === 'number' || type === 'currency' || type === 'percentage') {
      const num = parseFloat(val);
      onChange(isNaN(num) ? '' : num);
    } else {
      onChange(val);
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'currency': return <DollarSign className="w-4 h-4" />;
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'number': return <Hash className="w-4 h-4" />;
      default: return null;
    }
  };
  
  return (
    <div data-testid={`input-${name}`} className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      <div className="relative">
        {(prefix || getIcon()) && (
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1",
            colors.text
          )}>
            {getIcon()}
            {prefix && <span className="text-sm">{prefix}</span>}
          </div>
        )}
        
        <Input
          id={name}
          name={name}
          type={type === 'text' ? 'text' : 'number'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            "focus:border-2",
            colors.border.replace('border-', 'focus:border-'),
            (prefix || getIcon()) && "pl-10",
            suffix && "pr-12"
          )}
        />
        
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className={cn("text-sm", colors.text)}>{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STYLED SLIDER - Colorful slider with value display
// ============================================================================

interface StyledSliderProps {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: MetricColor;
  format?: 'currency' | 'number' | 'percentage';
  tooltip?: string;
  showValue?: boolean;
  className?: string;
}

export function StyledSlider({
  label,
  name,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  color = 'teal',
  format = 'number',
  tooltip,
  showValue = true,
  className
}: StyledSliderProps) {
  const colors = METRIC_COLORS[color];
  
  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };
  
  return (
    <div data-testid={`slider-${name}`} className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{label}</Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {showValue && (
          <span className={cn("text-sm font-bold", colors.text)}>
            {formatValue(value)}
          </span>
        )}
      </div>
      
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className={cn(
          "[&_[role=slider]]:border-2",
          colors.border.replace('border-', '[&_[role=slider]]:border-'),
          "[&_.bg-primary]:" + colors.solid.replace('bg-', 'bg-')
        )}
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// COMPARISON CARD - Side-by-side comparison display
// ============================================================================

interface ComparisonCardProps {
  title: string;
  items: Array<{
    label: string;
    current: string | number;
    projected: string | number;
    change?: 'positive' | 'negative' | 'neutral';
  }>;
  currentLabel?: string;
  projectedLabel?: string;
  color?: MetricColor;
  className?: string;
}

export function ComparisonCard({
  title,
  items,
  currentLabel = "Current",
  projectedLabel = "Projected",
  color = 'teal',
  className
}: ComparisonCardProps) {
  const colors = METRIC_COLORS[color];
  
  return (
    <Card data-testid={`comparison-card-${title.toLowerCase().replace(/\s+/g, '-')}`} className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("py-3", colors.bg)}>
        <CardTitle className={cn("text-base", colors.text)}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground border-b py-2 px-4">
          <span>Metric</span>
          <span className="text-center">{currentLabel}</span>
          <span className="text-center">{projectedLabel}</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-3 py-3 px-4 border-b last:border-0">
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-sm text-center text-muted-foreground">{item.current}</span>
            <span className={cn(
              "text-sm text-center font-medium",
              item.change === 'positive' && "text-green-600",
              item.change === 'negative' && "text-red-600"
            )}>
              {item.projected}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SCORE DISPLAY - Large score with rating visualization
// ============================================================================

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  label?: string;
  color?: MetricColor;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export function ScoreDisplay({
  score,
  maxScore = 10,
  label = "Score",
  color = 'teal',
  size = 'md',
  showPercentage = false,
  className
}: ScoreDisplayProps) {
  const colors = METRIC_COLORS[color];
  const percentage = (score / maxScore) * 100;
  
  const sizeClasses = {
    sm: { wrapper: 'w-16 h-16', text: 'text-xl', label: 'text-xs' },
    md: { wrapper: 'w-24 h-24', text: 'text-3xl', label: 'text-sm' },
    lg: { wrapper: 'w-32 h-32', text: 'text-4xl', label: 'text-base' }
  };
  
  const sizes = sizeClasses[size];
  
  return (
    <div data-testid={`score-display-${label.toLowerCase().replace(/\s+/g, '-')}`} className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn(
        "relative rounded-full flex items-center justify-center",
        colors.bg,
        sizes.wrapper
      )}>
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={colors.hex}
            strokeWidth="8"
            strokeDasharray={`${percentage * 2.83} 283`}
            strokeLinecap="round"
          />
        </svg>
        <span className={cn("font-bold", colors.text, sizes.text)}>
          {showPercentage ? `${Math.round(percentage)}%` : score.toFixed(1)}
        </span>
      </div>
      <span className={cn("text-muted-foreground font-medium", sizes.label)}>{label}</span>
    </div>
  );
}

// ============================================================================
// ACTION BADGE - Colored badge with icon for status/actions
// ============================================================================

interface ActionBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ActionBadge({
  label,
  variant = 'neutral',
  icon,
  size = 'md',
  className
}: ActionBadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-muted text-muted-foreground'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };
  
  const defaultIcons = {
    success: <CheckCircle className="w-3.5 h-3.5" />,
    warning: <AlertTriangle className="w-3.5 h-3.5" />,
    error: <AlertTriangle className="w-3.5 h-3.5" />,
    info: <Info className="w-3.5 h-3.5" />,
    neutral: null
  };
  
  return (
    <span
      data-testid={`badge-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon || defaultIcons[variant]}
      {label}
    </span>
  );
}

// ============================================================================
// STAT ROW - Horizontal stat display for dense layouts
// ============================================================================

interface StatRowProps {
  label: string;
  value: string | number;
  color?: MetricColor;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatRow({
  label,
  value,
  color = 'teal',
  icon,
  trend,
  className
}: StatRowProps) {
  const colors = METRIC_COLORS[color];
  
  return (
    <div data-testid={`stat-row-${label.toLowerCase().replace(/\s+/g, '-')}`} className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-2">
        {icon && <span className={colors.text}>{icon}</span>}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("font-semibold", colors.text)}>{value}</span>
        {trend && (
          <span className={cn(
            "text-xs",
            trend === 'up' && "text-green-500",
            trend === 'down' && "text-red-500"
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CHART PLACEHOLDER - For chart integration
// ============================================================================

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  color?: MetricColor;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  color = 'teal',
  children,
  className
}: ChartContainerProps) {
  const colors = METRIC_COLORS[color];
  
  return (
    <Card data-testid={`chart-${title.toLowerCase().replace(/\s+/g, '-')}`} className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("py-3 border-b", colors.bg)}>
        <div className="flex items-center gap-2">
          <BarChart3 className={cn("w-4 h-4", colors.text)} />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TIPS PANEL - Helpful tips display
// ============================================================================

interface TipsPanelProps {
  tips: string[];
  title?: string;
  color?: MetricColor;
  className?: string;
}

export function TipsPanel({
  tips,
  title = "Pro Tips",
  color = 'blue',
  className
}: TipsPanelProps) {
  const colors = METRIC_COLORS[color];
  
  return (
    <Card data-testid="tips-panel" className={cn("border-l-4", colors.border, className)}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Star className={cn("w-4 h-4", colors.text)} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", colors.text)} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Export all color options for use in builders
export const AVAILABLE_COLORS: MetricColor[] = [
  'teal', 'orange', 'salmon', 'green', 'blue', 
  'purple', 'yellow', 'pink', 'indigo', 'cyan'
];
