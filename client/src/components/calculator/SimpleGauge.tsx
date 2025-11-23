// Pure SVG gauge - no external dependencies
interface SimpleGaugeProps {
  score: number; // 0-10
  label: string;
  subtitle?: string;
  size?: number;
}

export function SimpleGauge({ score, label, subtitle, size = 120 }: SimpleGaugeProps) {
  const percentage = (score / 10) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75; // 270 degrees

  // Color coding
  const getColor = (score: number) => {
    if (score >= 8) return '#10b981'; // green
    if (score >= 6) return '#f59e0b'; // yellow
    if (score >= 4) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getRating = (score: number) => {
    if (score >= 9) return 'EXCEPTIONAL';
    if (score >= 8) return 'EXCELLENT';
    if (score >= 7) return 'STRONG';
    if (score >= 6) return 'GOOD';
    if (score >= 5) return 'MODERATE';
    if (score >= 4) return 'FAIR';
    if (score >= 3) return 'WEAK';
    return 'POOR';
  };

  const color = getColor(score);
  const rating = getRating(score);

  return (
    <div className="flex flex-col items-center" data-testid={`gauge-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference * 0.75}
          strokeDashoffset={0}
          transform="rotate(135 50 50)"
        />
        
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference * 0.75}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(135 50 50)"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Center text */}
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fill={color}
          fontSize="24"
          fontWeight="900"
          data-testid="text-gauge-score"
        >
          {score.toFixed(1)}
        </text>
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="currentColor"
          fontSize="8"
          opacity="0.5"
        >
          / 10
        </text>
      </svg>
      
      <div className="mt-2 text-center">
        <div className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
          {rating}
        </div>
        <div className="text-sm font-semibold text-foreground mt-0.5">{label}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
  );
}
