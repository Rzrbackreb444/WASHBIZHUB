import { motion } from "framer-motion";
import { 
  DollarSign, 
  Settings, 
  Users, 
  MapPin, 
  TrendingUp, 
  Wrench,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Factor {
  name: string;
  score: number;
  weight: number;
  category: string;
}

interface FactorBreakdownProps {
  factors: Factor[];
  showWeights?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

const CATEGORY_CONFIG: Record<string, { 
  icon: typeof DollarSign; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  "Financial": { 
    icon: DollarSign, 
    color: "#22C55E", 
    bgColor: "bg-green-500/10",
    label: "Financial Factors"
  },
  "Operations": { 
    icon: Settings, 
    color: "#3B82F6", 
    bgColor: "bg-blue-500/10",
    label: "Operations Factors"
  },
  "Demographics": { 
    icon: Users, 
    color: "#8B5CF6", 
    bgColor: "bg-purple-500/10",
    label: "Demographics Factors"
  },
  "Location": { 
    icon: MapPin, 
    color: "#F59E0B", 
    bgColor: "bg-amber-500/10",
    label: "Location Factors"
  },
  "Market": { 
    icon: TrendingUp, 
    color: "#EC4899", 
    bgColor: "bg-pink-500/10",
    label: "Market Factors"
  },
  "Services": { 
    icon: Wrench, 
    color: "#14B8A6", 
    bgColor: "bg-teal-500/10",
    label: "Services Factors"
  }
};

function getScoreColor(score: number): string {
  if (score >= 85) return "#22C55E";
  if (score >= 70) return "#A3E635";
  if (score >= 55) return "#FBBF24";
  return "#C8A661";
}

function CategorySection({ 
  category, 
  factors, 
  showWeights,
  collapsible,
  defaultExpanded = true
}: { 
  category: string; 
  factors: Factor[]; 
  showWeights: boolean;
  collapsible: boolean;
  defaultExpanded: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["Financial"];
  const Icon = config.icon;
  const avgScore = factors.length > 0 
    ? Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length)
    : 0;

  const content = (
    <div className="space-y-3 pt-3">
      {factors.map((factor, index) => (
        <motion.div
          key={factor.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="space-y-1"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium truncate flex-1 mr-2">{factor.name}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {showWeights && (
                <span className="text-xs text-muted-foreground">
                  {factor.weight}%
                </span>
              )}
              <Badge 
                variant="outline" 
                className="text-xs font-semibold min-w-[40px] justify-center"
                style={{ 
                  borderColor: getScoreColor(factor.score),
                  color: getScoreColor(factor.score)
                }}
              >
                {factor.score}
              </Badge>
            </div>
          </div>
          <Progress 
            value={factor.score} 
            className="h-1.5"
            style={{ 
              ["--progress-background" as string]: getScoreColor(factor.score)
            }}
          />
        </motion.div>
      ))}
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div 
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              config.bgColor,
              "hover:opacity-80"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: config.color }} />
              <span className="font-semibold text-sm">{config.label}</span>
              <Badge variant="secondary" className="text-xs">
                {factors.length} factors
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className="text-white text-xs"
                style={{ backgroundColor: getScoreColor(avgScore) }}
              >
                Avg: {avgScore}
              </Badge>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          {content}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div>
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg",
          config.bgColor
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: config.color }} />
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        <Badge 
          className="text-white text-xs"
          style={{ backgroundColor: getScoreColor(avgScore) }}
        >
          Avg: {avgScore}
        </Badge>
      </div>
      {content}
    </div>
  );
}

export function FactorBreakdown({
  factors,
  showWeights = true,
  collapsible = true,
  defaultExpanded = false,
  className
}: FactorBreakdownProps) {
  const groupedFactors = factors.reduce((acc, factor) => {
    const category = factor.category || "Financial";
    if (!acc[category]) acc[category] = [];
    acc[category].push(factor);
    return acc;
  }, {} as Record<string, Factor[]>);

  const categoryOrder = ["Financial", "Operations", "Demographics", "Location", "Market", "Services"];
  const sortedCategories = categoryOrder.filter(cat => groupedFactors[cat]?.length > 0);

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="factor-breakdown">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            17-Factor Breakdown
          </span>
          <Badge variant="secondary" className="text-xs">
            {factors.length} factors analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {sortedCategories.length > 0 ? (
          sortedCategories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CategorySection
                category={category}
                factors={groupedFactors[category]}
                showWeights={showWeights}
                collapsible={collapsible}
                defaultExpanded={defaultExpanded}
              />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No factor data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FactorBreakdown;
