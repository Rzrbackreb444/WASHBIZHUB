import { motion } from "framer-motion";
import { 
  Rocket, 
  Clock, 
  DollarSign, 
  Zap,
  ChevronRight,
  Target,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Factor {
  name: string;
  score: number;
  weight: number;
  category: string;
}

interface ImprovementRoadmapProps {
  factors: Factor[];
  currentScore: number;
  currentGrade: string;
  maxItems?: number;
  className?: string;
}

interface ImprovementGuide {
  factor: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cost: "Low" | "Medium" | "High";
  timeframe: "Quick" | "Medium" | "Long";
  potentialImpact: number;
}

const IMPROVEMENT_GUIDES: Record<string, Omit<ImprovementGuide, "factor" | "potentialImpact">> = {
  "Population Density": {
    title: "Optimize Marketing Reach",
    description: "Target adjacent high-density areas with mobile/pickup services to expand your customer base.",
    difficulty: "Medium",
    cost: "Medium",
    timeframe: "Medium"
  },
  "Median Household Income": {
    title: "Adjust Pricing Strategy",
    description: "Review pricing relative to local income levels. Consider premium services for higher-income areas.",
    difficulty: "Easy",
    cost: "Low",
    timeframe: "Quick"
  },
  "Competition Density": {
    title: "Differentiate Services",
    description: "Add unique offerings (24/7 access, mobile app, pickup/delivery) to stand out from competitors.",
    difficulty: "Medium",
    cost: "Medium",
    timeframe: "Medium"
  },
  "Walk Score": {
    title: "Improve Accessibility",
    description: "Partner with local transit, add bike parking, or offer shuttle services to increase foot traffic.",
    difficulty: "Hard",
    cost: "Medium",
    timeframe: "Long"
  },
  "Transit Score": {
    title: "Transit Partnerships",
    description: "Coordinate with local transit authorities for stop proximity or advertise at nearby stations.",
    difficulty: "Medium",
    cost: "Low",
    timeframe: "Medium"
  },
  "Traffic Volume": {
    title: "Enhance Visibility",
    description: "Improve signage, add lighting, or consider a street-facing redesign to capture drive-by traffic.",
    difficulty: "Medium",
    cost: "Medium",
    timeframe: "Medium"
  },
  "Parking Availability": {
    title: "Parking Solutions",
    description: "Negotiate with neighboring businesses for shared parking or validate parking at nearby lots.",
    difficulty: "Medium",
    cost: "Low",
    timeframe: "Quick"
  },
  "Visibility Score": {
    title: "Signage Upgrade",
    description: "Invest in prominent, lit signage. Consider digital displays or eye-catching exterior improvements.",
    difficulty: "Easy",
    cost: "Medium",
    timeframe: "Quick"
  },
  "Lease Terms": {
    title: "Lease Renegotiation",
    description: "Negotiate better terms, longer lease duration, or rent reduction with demonstrated improvements.",
    difficulty: "Hard",
    cost: "Low",
    timeframe: "Long"
  },
  "Equipment Age": {
    title: "Equipment Modernization",
    description: "Phase in newer, more efficient machines. Consider leasing to reduce upfront capital.",
    difficulty: "Hard",
    cost: "High",
    timeframe: "Long"
  },
  "Utility Costs": {
    title: "Energy Efficiency",
    description: "Install LED lighting, high-efficiency machines, and smart HVAC to reduce utility expenses.",
    difficulty: "Medium",
    cost: "Medium",
    timeframe: "Medium"
  },
  "Building Condition": {
    title: "Facility Refresh",
    description: "Renovate restrooms, improve flooring, add fresh paint. First impressions drive customer retention.",
    difficulty: "Medium",
    cost: "Medium",
    timeframe: "Medium"
  }
};

const DIFFICULTY_CONFIG = {
  "Easy": { color: "#22C55E", bg: "bg-green-500/10" },
  "Medium": { color: "#F59E0B", bg: "bg-amber-500/10" },
  "Hard": { color: "#EF4444", bg: "bg-red-500/10" }
};

const COST_CONFIG = {
  "Low": { color: "#22C55E", icon: "$" },
  "Medium": { color: "#F59E0B", icon: "$$" },
  "High": { color: "#EF4444", icon: "$$$" }
};

const TIMEFRAME_CONFIG = {
  "Quick": { label: "1-2 weeks", color: "#22C55E" },
  "Medium": { label: "1-3 months", color: "#F59E0B" },
  "Long": { label: "3-6 months", color: "#EF4444" }
};

function calculateImpact(factor: Factor): number {
  const potentialGain = Math.min(100, factor.score + 25) - factor.score;
  return Math.round((potentialGain * factor.weight) / 100 * 10) / 10;
}

function getProjectedGrade(currentScore: number, improvement: number): string {
  const newScore = currentScore + improvement;
  if (newScore >= 85) return "A";
  if (newScore >= 70) return "B";
  if (newScore >= 55) return "C";
  return "Needs Work";
}

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635",
  "C": "#FBBF24",
  "Needs Work": "#C8A661"
};

export function ImprovementRoadmap({
  factors,
  currentScore,
  currentGrade,
  maxItems = 5,
  className
}: ImprovementRoadmapProps) {
  const improvableFactors = factors
    .filter(f => f.score < 80 && IMPROVEMENT_GUIDES[f.name])
    .map(f => ({
      ...f,
      guide: IMPROVEMENT_GUIDES[f.name],
      impact: calculateImpact(f)
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, maxItems);

  const totalPotentialImprovement = improvableFactors.reduce((sum, f) => sum + f.impact, 0);
  const projectedScore = Math.min(100, Math.round(currentScore + totalPotentialImprovement));
  const projectedGrade = getProjectedGrade(currentScore, totalPotentialImprovement);

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="improvement-roadmap">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Improvement Roadmap
          </span>
          <Badge variant="secondary" className="text-xs">
            {improvableFactors.length} opportunities
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {improvableFactors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Projected Improvement</span>
              <div className="flex items-center gap-2">
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: GRADE_COLORS[currentGrade] }}
                >
                  {currentScore}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: GRADE_COLORS[projectedGrade] }}
                >
                  {projectedScore}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Implementing all recommendations could improve your score by up to <strong>+{Math.round(totalPotentialImprovement)} points</strong>
              {projectedGrade !== currentGrade && (
                <span className="text-green-500 font-medium"> and upgrade to Grade {projectedGrade}!</span>
              )}
            </p>
          </motion.div>
        )}

        <div className="space-y-3">
          {improvableFactors.length > 0 ? (
            improvableFactors.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{item.guide.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>
                  <Badge 
                    className="text-white text-xs"
                    style={{ backgroundColor: "#C8A661" }}
                  >
                    +{item.impact} pts
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {item.guide.description}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: DIFFICULTY_CONFIG[item.guide.difficulty].color,
                      color: DIFFICULTY_CONFIG[item.guide.difficulty].color
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {item.guide.difficulty}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: COST_CONFIG[item.guide.cost].color,
                      color: COST_CONFIG[item.guide.cost].color
                    }}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    {item.guide.cost}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: TIMEFRAME_CONFIG[item.guide.timeframe].color,
                      color: TIMEFRAME_CONFIG[item.guide.timeframe].color
                    }}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {TIMEFRAME_CONFIG[item.guide.timeframe].label}
                  </Badge>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No improvement opportunities identified</p>
              <p className="text-xs">Your factors are performing well!</p>
            </div>
          )}
        </div>

        {improvableFactors.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center">
              Improvements sorted by ROI (quick wins first)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ImprovementRoadmap;
