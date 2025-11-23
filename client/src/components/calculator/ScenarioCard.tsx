import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export interface Scenario {
  type: 'worst' | 'likely' | 'best';
  label: string;
  value: number;
  probability?: number;
  description?: string;
}

interface ScenarioCardProps {
  scenarios: Scenario[];
  formatValue?: (value: number) => string;
}

export function ScenarioCard({ scenarios, formatValue = (v) => `$${v.toLocaleString()}` }: ScenarioCardProps) {
  const getIcon = (type: Scenario['type']) => {
    switch (type) {
      case 'worst': return <TrendingDown className="w-5 h-5" />;
      case 'best': return <TrendingUp className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getColor = (type: Scenario['type']) => {
    switch (type) {
      case 'worst': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'best': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  return (
    <Card className="bg-card border-border" data-testid="card-scenarios">
      <CardHeader>
        <CardTitle className="text-lg">Scenario Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.type}
            className={`p-4 rounded-lg border-2 ${getColor(scenario.type)}`}
            data-testid={`scenario-${scenario.type}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getIcon(scenario.type)}
                <span className="font-bold uppercase text-sm tracking-wide">
                  {scenario.label}
                </span>
              </div>
              {scenario.probability !== undefined && (
                <div className="text-xs opacity-70">
                  {(scenario.probability * 100).toFixed(0)}% chance
                </div>
              )}
            </div>
            <div className="text-2xl font-black mb-1" data-testid={`text-scenario-${scenario.type}-value`}>
              {formatValue(scenario.value)}
            </div>
            {scenario.description && (
              <div className="text-xs opacity-80 mt-2">
                {scenario.description}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
