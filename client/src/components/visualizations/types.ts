export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  benchmark?: number;
  target?: number;
}

export interface GaugeConfig {
  value: number;
  min?: number;
  max?: number;
  thresholds?: { value: number; color: string; label: string }[];
  unit?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface RadarConfig {
  data: { factor: string; value: number; benchmark?: number }[];
  maxValue?: number;
  showBenchmark?: boolean;
  colors?: { main: string; benchmark: string };
}

export interface SankeyConfig {
  nodes: { id: string; label: string }[];
  links: { source: string; target: string; value: number }[];
  colors?: string[];
}

export interface TrendLineConfig {
  data: { date: string; value: number; benchmark?: number }[];
  showArea?: boolean;
  showBenchmark?: boolean;
  unit?: string;
  yAxisLabel?: string;
}

export interface StackedBarConfig {
  data: { category: string; [key: string]: string | number }[];
  keys: string[];
  colors?: Record<string, string>;
  unit?: string;
  orientation?: 'horizontal' | 'vertical';
}

export interface DonutConfig {
  data: { name: string; value: number; color?: string }[];
  centerLabel?: string;
  centerValue?: string | number;
  unit?: string;
}

export interface WaterfallConfig {
  data: { name: string; value: number; type: 'start' | 'increase' | 'decrease' | 'total' }[];
  colors?: { increase: string; decrease: string; total: string };
  unit?: string;
}

export interface BenchmarkData {
  label: string;
  value: number;
  benchmark: number;
  unit?: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface CalculatorOutput {
  title: string;
  description?: string;
  primaryMetric: {
    label: string;
    value: number | string;
    unit?: string;
    status?: 'excellent' | 'good' | 'warning' | 'critical';
  };
  secondaryMetrics?: {
    label: string;
    value: number | string;
    unit?: string;
    icon?: string;
  }[];
  charts?: {
    type: 'gauge' | 'radar' | 'sankey' | 'stackedBar' | 'trendLine' | 'donut' | 'waterfall' | 'comparison';
    title: string;
    config: unknown;
  }[];
  recommendations?: {
    priority: 'high' | 'medium' | 'low';
    text: string;
    impact?: string;
  }[];
  benchmarks?: BenchmarkData[];
}
