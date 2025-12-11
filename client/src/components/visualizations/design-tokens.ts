export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  
  excellent: '#22C55E',
  good: '#A3E635',
  warning: '#FBBF24',
  critical: '#EF4444',
  needsWork: '#C8A661',
  
  gradeA: '#22C55E',
  gradeB: '#A3E635',
  gradeC: '#FBBF24',
  gradeNeedsWork: '#C8A661',
  
  categories: [
    '#3B82F6',
    '#22C55E',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#F97316',
    '#84CC16',
    '#6366F1',
  ],
  
  gradient: {
    blue: ['#3B82F6', '#1D4ED8'],
    green: ['#22C55E', '#15803D'],
    gold: ['#F59E0B', '#D97706'],
    purple: ['#8B5CF6', '#6D28D9'],
  },
  
  benchmark: '#94A3B8',
  benchmarkFill: 'rgba(148, 163, 184, 0.2)',
  
  utilities: {
    electric: '#FBBF24',
    water: '#3B82F6',
    gas: '#F97316',
    supplies: '#8B5CF6',
  },
  
  financial: {
    revenue: '#22C55E',
    expense: '#EF4444',
    profit: '#3B82F6',
    investment: '#8B5CF6',
  },
};

export const GAUGE_THRESHOLDS = {
  upg: [
    { value: 18, color: CHART_COLORS.excellent, label: 'Optimal' },
    { value: 24, color: CHART_COLORS.good, label: 'Acceptable' },
    { value: 29, color: CHART_COLORS.warning, label: 'High' },
    { value: 100, color: CHART_COLORS.critical, label: 'Critical' },
  ],
  profitMargin: [
    { value: 25, color: CHART_COLORS.excellent, label: 'Excellent' },
    { value: 20, color: CHART_COLORS.good, label: 'Good' },
    { value: 15, color: CHART_COLORS.warning, label: 'Below Average' },
    { value: 100, color: CHART_COLORS.critical, label: 'Poor' },
  ],
  tpd: [
    { value: 5, color: CHART_COLORS.excellent, label: 'Excellent' },
    { value: 4, color: CHART_COLORS.good, label: 'Good' },
    { value: 3, color: CHART_COLORS.warning, label: 'Average' },
    { value: 100, color: CHART_COLORS.critical, label: 'Poor' },
  ],
  ltvCac: [
    { value: 6, color: CHART_COLORS.excellent, label: 'Excellent' },
    { value: 4, color: CHART_COLORS.good, label: 'Good' },
    { value: 3, color: CHART_COLORS.warning, label: 'Minimum' },
    { value: 100, color: CHART_COLORS.critical, label: 'Poor' },
  ],
};

export const CHART_SIZES = {
  sm: { width: 200, height: 150 },
  md: { width: 300, height: 250 },
  lg: { width: 400, height: 350 },
  xl: { width: 500, height: 400 },
};

export const ANIMATION_CONFIG = {
  duration: 800,
  easing: 'easeOutQuart',
};

export const BENCHMARK_RANGES = {
  upg: { optimal: 18, acceptable: 24, high: 29 },
  rentRatio: { optimal: 20, acceptable: 25, high: 30 },
  profitMargin: { excellent: 25, good: 20, belowAverage: 15 },
  tpd: { excellent: 5, good: 4, average: 3 },
  ltvCac: { excellent: 6, good: 4, minimum: 3 },
  ebitdaMargin: { excellent: 25, good: 20, belowAverage: 15 },
  laborPercent: { optimal: 12, acceptable: 18, high: 22 },
};

export function getStatusFromValue(
  value: number, 
  thresholds: { excellent: number; good: number; warning?: number }
): 'excellent' | 'good' | 'warning' | 'critical' {
  if (value >= thresholds.excellent) return 'excellent';
  if (value >= thresholds.good) return 'good';
  if (thresholds.warning && value >= thresholds.warning) return 'warning';
  return 'critical';
}

export function getStatusColor(status: 'excellent' | 'good' | 'warning' | 'critical'): string {
  switch (status) {
    case 'excellent': return CHART_COLORS.excellent;
    case 'good': return CHART_COLORS.good;
    case 'warning': return CHART_COLORS.warning;
    case 'critical': return CHART_COLORS.critical;
    default: return CHART_COLORS.benchmark;
  }
}
