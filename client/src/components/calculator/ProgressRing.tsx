interface ProgressRingProps {
  value: number; // actual value
  max: number; // maximum value
  label: string;
  unit?: string;
  percentile?: number; // where user ranks (0-100)
  color?: string;
}

export function ProgressRing({ value, max, label, unit = '', percentile, color }: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Auto-select color based on percentage if not provided
  const ringColor = color || (
    percentage >= 80 ? '#10b981' :
    percentage >= 60 ? '#f59e0b' :
    percentage >= 40 ? '#f97316' :
    '#ef4444'
  );

  return (
    <div className="flex flex-col items-center" data-testid={`progress-ring-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={ringColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-black" style={{ color: ringColor }} data-testid="text-ring-percentage">
            {percentage.toFixed(0)}%
          </div>
          {percentile !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">
              Top {(100 - percentile).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <div className="text-lg font-semibold text-foreground">{label}</div>
        <div className="text-sm text-muted-foreground">
          {value.toLocaleString()}{unit} / {max.toLocaleString()}{unit}
        </div>
      </div>
    </div>
  );
}
