import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export interface Insight {
  type: 'info' | 'warning' | 'success' | 'tip';
  title?: string;
  message: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  title?: string;
}

export function InsightsPanel({ insights, title = 'Insights & Recommendations' }: InsightsPanelProps) {
  if (insights.length === 0) return null;

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'tip':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getVariant = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, idx) => (
          <Alert key={idx} variant={getVariant(insight.type)} data-testid={`insight-${idx}`}>
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}
              <div className="flex-1">
                {insight.title && (
                  <div className="font-semibold mb-1">{insight.title}</div>
                )}
                <AlertDescription>{insight.message}</AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
