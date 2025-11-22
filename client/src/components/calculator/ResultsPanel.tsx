import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ResultValue {
  label: string;
  value: number | string;
  format?: 'currency' | 'percent' | 'number';
  trend?: 'up' | 'down' | 'neutral';
  decimals?: number;
}

interface ResultsPanelProps {
  title?: string;
  results: ResultValue[];
  columns?: 1 | 2 | 3;
}

export function ResultsPanel({ title, results, columns = 2 }: ResultsPanelProps) {
  const formatValue = (value: number | string, format?: 'currency' | 'percent' | 'number', decimals = 2) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
      case 'percent':
        return `${value.toFixed(decimals)}%`;
      case 'number':
        return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      default:
        return value.toLocaleString();
    }
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-2xl font-bold">{title}</h3>
      )}
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {results.map((result, idx) => (
          <Card key={idx} className="hover-elevate" data-testid={`result-card-${idx}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm text-muted-foreground">{result.label}</div>
                {result.trend && result.trend !== 'neutral' && (
                  result.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )
                )}
              </div>
              <div className="text-3xl font-bold text-primary" data-testid={`result-value-${idx}`}>
                {formatValue(result.value, result.format, result.decimals)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
