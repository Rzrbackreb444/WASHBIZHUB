import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Factor {
  name: string;
  score: number;
  weight: number;
  category: string;
}

interface GradeExplanationProps {
  factors: Factor[];
  grade: string;
  score: number;
  maxStrengths?: number;
  maxWeaknesses?: number;
  showRecommendation?: boolean;
  className?: string;
}

const GRADE_RECOMMENDATIONS: Record<string, string> = {
  "A": "This location is prime for acquisition. Focus on maintaining operational excellence and consider premium pricing strategies given the strong market position.",
  "B": "Solid investment opportunity. Look for ways to optimize operations and address minor weaknesses to push toward an A-grade rating.",
  "C": "Proceed with caution. Develop a clear improvement plan before acquisition. Focus on the top weaknesses first for maximum ROI.",
  "Needs Work": "Requires significant strategic work. Only consider if you have operational expertise and capital for improvements. Could be a turnaround opportunity."
};

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635", 
  "C": "#FBBF24",
  "Needs Work": "#C8A661"
};

export function GradeExplanation({
  factors,
  grade,
  score,
  maxStrengths = 3,
  maxWeaknesses = 3,
  showRecommendation = true,
  className
}: GradeExplanationProps) {
  const sortedFactors = [...factors].sort((a, b) => b.score - a.score);
  
  const strengths = sortedFactors
    .filter(f => f.score >= 75)
    .slice(0, maxStrengths);
  
  const weaknesses = [...factors]
    .filter(f => f.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, maxWeaknesses);

  const gradeColor = GRADE_COLORS[grade] || GRADE_COLORS["Needs Work"];

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="grade-explanation">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Grade Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-sm">Top Strengths</h4>
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                {strengths.length} identified
              </Badge>
            </div>
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <motion.div
                  key={strength.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/20"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{strength.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {strength.weight}% weight
                    </span>
                    <Badge className="bg-green-500 text-white text-xs">
                      {strength.score}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-sm">Areas for Improvement</h4>
              <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
                {weaknesses.length} identified
              </Badge>
            </div>
            <div className="space-y-2">
              {weaknesses.map((weakness, index) => (
                <motion.div
                  key={weakness.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/20"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">{weakness.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {weakness.weight}% weight
                    </span>
                    <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                      {weakness.score}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {strengths.length === 0 && weaknesses.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Factor data not available for analysis</p>
          </div>
        )}

        {showRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: `${gradeColor}10`,
              borderColor: `${gradeColor}30`
            }}
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: gradeColor }} />
              <div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: gradeColor }}>
                  Recommendation for Grade {grade}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {GRADE_RECOMMENDATIONS[grade] || GRADE_RECOMMENDATIONS["Needs Work"]}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default GradeExplanation;
