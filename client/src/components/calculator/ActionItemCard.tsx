import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp } from "lucide-react";

export interface ActionItem {
  priority: number; // 1 = highest
  title: string;
  impact: string; // e.g., "+$12K/yr" or "+27% ROI"
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ActionItemCardProps {
  actions: ActionItem[];
  title?: string;
}

export function ActionItemCard({ actions, title = "Recommended Actions" }: ActionItemCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  // Sort by priority (lowest number = highest priority)
  const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

  return (
    <Card className="bg-card border-border" data-testid="card-actions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedActions.map((action, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-muted/30 hover-elevate border border-border/50"
            data-testid={`action-item-${idx}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                  {action.priority}
                </div>
                <h4 className="font-semibold text-foreground">{action.title}</h4>
              </div>
              {action.difficulty && (
                <Badge className={getDifficultyColor(action.difficulty)}>
                  {action.difficulty}
                </Badge>
              )}
            </div>
            
            <div className="ml-10">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-green-500" data-testid={`text-action-impact-${idx}`}>
                  {action.impact}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
