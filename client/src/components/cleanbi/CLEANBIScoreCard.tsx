import { motion } from "framer-motion";
import { TrendingUp, Award, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CLEANBIGradeBadge } from "./CLEANBIGradeBadge";

interface CLEANBIScoreCardProps {
  score: number;
  grade: string;
  percentile?: number;
  showEbitdaMultiple?: boolean;
  showDescription?: boolean;
  compact?: boolean;
  className?: string;
}

const GRADE_CONFIG: Record<string, { 
  color: string; 
  bgColor: string; 
  label: string;
  description: string;
  ebitdaRange: string;
  ebitdaMin: number;
  ebitdaMax: number;
}> = {
  "A": { 
    color: "#22C55E", 
    bgColor: "bg-green-500/10", 
    label: "Excellent Opportunity",
    description: "This location has exceptional fundamentals with strong demographics, low competition, and high traffic potential. Prime acquisition target.",
    ebitdaRange: "4.0x - 5.5x",
    ebitdaMin: 4.0,
    ebitdaMax: 5.5
  },
  "B": { 
    color: "#A3E635", 
    bgColor: "bg-lime-500/10", 
    label: "Good Opportunity",
    description: "Solid location with good market dynamics. Some optimization potential exists but fundamentals are sound for investment.",
    ebitdaRange: "3.0x - 4.0x",
    ebitdaMin: 3.0,
    ebitdaMax: 4.0
  },
  "C": { 
    color: "#FBBF24", 
    bgColor: "bg-amber-500/10", 
    label: "Fair Opportunity",
    description: "Location has potential but requires strategic improvements. Careful due diligence recommended before acquisition.",
    ebitdaRange: "2.0x - 3.0x",
    ebitdaMin: 2.0,
    ebitdaMax: 3.0
  },
  "Needs Work": { 
    color: "#C8A661", 
    bgColor: "bg-[#C8A661]/10", 
    label: "Strategic Location",
    description: "Requires significant improvements to reach optimal performance. May present turnaround opportunity for experienced operators.",
    ebitdaRange: "1.5x - 2.0x",
    ebitdaMin: 1.5,
    ebitdaMax: 2.0
  }
};

function getPercentileFromScore(score: number): number {
  if (score >= 85) return Math.max(1, Math.round((100 - score) * 0.5));
  if (score >= 70) return Math.round(10 + (85 - score) * 0.8);
  if (score >= 55) return Math.round(25 + (70 - score) * 1.5);
  return Math.round(50 + (55 - score) * 1.2);
}

export function CLEANBIScoreCard({
  score,
  grade,
  percentile,
  showEbitdaMultiple = true,
  showDescription = true,
  compact = false,
  className
}: CLEANBIScoreCardProps) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG["Needs Work"];
  const calculatedPercentile = percentile ?? getPercentileFromScore(score);

  if (compact) {
    return (
      <Card className={cn("overflow-hidden", className)} data-testid="cleanbi-score-card-compact">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <CLEANBIGradeBadge score={score} grade={grade} size="sm" percentile={calculatedPercentile} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge 
                  className="text-white font-semibold"
                  style={{ backgroundColor: config.color }}
                  data-testid="badge-grade"
                >
                  Grade {grade}
                </Badge>
                <span className="text-sm text-muted-foreground">Top {calculatedPercentile}%</span>
              </div>
              <p className="text-sm font-medium mt-1 truncate">{config.label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="cleanbi-score-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className="text-white font-semibold px-3 py-1"
                style={{ backgroundColor: config.color }}
                data-testid="badge-grade-large"
              >
                Grade {grade}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">
                {config.label}
              </span>
            </div>
            {showDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {config.description}
              </p>
            )}
          </div>
          <CLEANBIGradeBadge 
            score={score} 
            grade={grade} 
            size="lg" 
            percentile={calculatedPercentile}
            showPercentile={true}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Award className="w-4 h-4" />
              Industry Percentile
            </span>
            <span className="font-semibold" style={{ color: config.color }}>
              Top {calculatedPercentile}%
            </span>
          </div>
          <Progress 
            value={100 - calculatedPercentile} 
            className="h-2"
            style={{ 
              ["--progress-background" as string]: config.color 
            }}
          />
        </motion.div>

        {showEbitdaMultiple && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: config.bgColor }}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: config.color }} />
              <span className="text-sm font-medium">EBITDA Multiple Range</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: config.color }} />
              <span className="font-bold" style={{ color: config.color }}>
                {config.ebitdaRange}
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default CLEANBIScoreCard;
