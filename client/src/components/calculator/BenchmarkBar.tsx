import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface BenchmarkData {
  yourValue: number;
  industryAverage: number;
  top10Threshold: number;
  top25Threshold: number;
  label: string;
  unit?: string;
}

interface BenchmarkBarProps {
  data: BenchmarkData;
  formatValue?: (value: number) => string;
}

export function BenchmarkBar({ data, formatValue }: BenchmarkBarProps) {
  const max = Math.max(data.yourValue, data.top10Threshold) * 1.1;
  
  const yourPercent = (data.yourValue / max) * 100;
  const avgPercent = (data.industryAverage / max) * 100;
  const top25Percent = (data.top25Threshold / max) * 100;
  const top10Percent = (data.top10Threshold / max) * 100;

  // Determine user's ranking
  let ranking = '';
  let rankColor = '';
  if (data.yourValue >= data.top10Threshold) {
    ranking = 'TOP 10%';
    rankColor = 'bg-green-500/20 text-green-400 border-green-500/30';
  } else if (data.yourValue >= data.top25Threshold) {
    ranking = 'TOP 25%';
    rankColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  } else if (data.yourValue >= data.industryAverage) {
    ranking = 'ABOVE AVERAGE';
    rankColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  } else {
    ranking = 'BELOW AVERAGE';
    rankColor = 'bg-red-500/20 text-red-400 border-red-500/30';
  }

  const formatter = formatValue || ((v: number) => 
    `${v.toFixed(1)}${data.unit || ''}`
  );

  return (
    <Card className="bg-card border-border" data-testid="card-benchmark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{data.label}</CardTitle>
          <Badge className={rankColor} data-testid="badge-ranking">
            {ranking}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Your Performance */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-primary">Your Performance</span>
            <span className="text-lg font-bold text-primary" data-testid="text-your-value">
              {formatter(data.yourValue)}
            </span>
          </div>
          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${yourPercent}%` }}
            />
          </div>
        </div>

        {/* Industry Average */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Industry Average</span>
            <span className="text-sm font-semibold text-muted-foreground">
              {formatter(data.industryAverage)}
            </span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-muted-foreground/50 rounded-full transition-all duration-1000"
              style={{ width: `${avgPercent}%` }}
            />
          </div>
        </div>

        {/* Top 25% */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-500/80">Top 25% Threshold</span>
            <span className="text-sm font-semibold text-yellow-500/80">
              {formatter(data.top25Threshold)}
            </span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500/50 rounded-full transition-all duration-1000"
              style={{ width: `${top25Percent}%` }}
            />
          </div>
        </div>

        {/* Top 10% */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-500/80">Top 10% Threshold</span>
            <span className="text-sm font-semibold text-green-500/80">
              {formatter(data.top10Threshold)}
            </span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500/50 rounded-full transition-all duration-1000"
              style={{ width: `${top10Percent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
