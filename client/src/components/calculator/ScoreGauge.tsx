import { ResponsiveRadialBar } from "@nivo/radial-bar";

interface ScoreGaugeProps {
  score: number; // 0-10
  label: string;
  subtitle?: string;
  size?: number;
  showValue?: boolean;
}

export function ScoreGauge({ score, label, subtitle, size = 200, showValue = true }: ScoreGaugeProps) {
  // Normalize score to 0-100 for radial bar
  const percentage = (score / 10) * 100;
  
  // Color coding based on score
  const getColor = (score: number) => {
    if (score >= 8) return '#10b981'; // green
    if (score >= 6) return '#f59e0b'; // yellow/gold
    if (score >= 4) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  // Rating text based on score
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

  const data = [
    {
      id: label,
      data: [
        {
          x: 'Score',
          y: percentage,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center" data-testid={`gauge-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div style={{ height: size, width: size }} className="relative">
        <ResponsiveRadialBar
          data={data}
          startAngle={-90}
          endAngle={270}
          innerRadius={0.65}
          padding={0.3}
          cornerRadius={8}
          colors={[color]}
          borderWidth={0}
          enableRadialGrid={false}
          enableCircularGrid={false}
          radialAxisStart={null}
          circularAxisOuter={null}
          enableTracks={true}
          tracksColor="rgba(255,255,255,0.1)"
        />
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-black" style={{ color }} data-testid="text-gauge-score">
              {score.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">/ 10</div>
          </div>
        )}
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm font-bold uppercase tracking-wide" style={{ color }}>
          {rating}
        </div>
        <div className="text-lg font-semibold text-foreground mt-1">{label}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
