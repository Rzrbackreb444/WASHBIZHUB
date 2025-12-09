import { motion } from "framer-motion";
import { 
  DollarSign, 
  Settings, 
  Users, 
  MapPin, 
  TrendingUp, 
  Wrench 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Factor {
  name: string;
  score: number;
  weight: number;
  category: string;
}

interface CLEANBICategoryChartProps {
  factors: Factor[];
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
}

const CATEGORY_CONFIG: Record<string, { 
  icon: typeof DollarSign; 
  color: string; 
  gradient: string;
}> = {
  "Financial": { 
    icon: DollarSign, 
    color: "#22C55E",
    gradient: "from-green-500 to-green-600"
  },
  "Operations": { 
    icon: Settings, 
    color: "#3B82F6",
    gradient: "from-blue-500 to-blue-600"
  },
  "Demographics": { 
    icon: Users, 
    color: "#8B5CF6",
    gradient: "from-purple-500 to-purple-600"
  },
  "Location": { 
    icon: MapPin, 
    color: "#F59E0B",
    gradient: "from-amber-500 to-amber-600"
  },
  "Market": { 
    icon: TrendingUp, 
    color: "#EC4899",
    gradient: "from-pink-500 to-pink-600"
  },
  "Services": { 
    icon: Wrench, 
    color: "#14B8A6",
    gradient: "from-teal-500 to-teal-600"
  }
};

function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "#22C55E" };
  if (score >= 70) return { label: "Good", color: "#A3E635" };
  if (score >= 55) return { label: "Fair", color: "#FBBF24" };
  return { label: "Needs Work", color: "#C8A661" };
}

export function CLEANBICategoryChart({
  factors,
  showLabels = true,
  compact = false,
  className
}: CLEANBICategoryChartProps) {
  const categoryScores = Object.entries(
    factors.reduce((acc, factor) => {
      const category = factor.category || "Financial";
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += factor.score;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([category, data]) => ({
    category,
    score: Math.round(data.total / data.count),
    factorCount: data.count
  }));

  const categoryOrder = ["Financial", "Operations", "Demographics", "Location", "Market", "Services"];
  const sortedCategories = categoryOrder
    .filter(cat => categoryScores.find(c => c.category === cat))
    .map(cat => categoryScores.find(c => c.category === cat)!);

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="cleanbi-category-chart">
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <CardTitle className={cn("text-lg", compact && "text-base")}>
          Category Performance
        </CardTitle>
      </CardHeader>
      
      <CardContent className={cn("space-y-4", compact && "space-y-3")}>
        {sortedCategories.length > 0 ? (
          sortedCategories.map((item, index) => {
            const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG["Financial"];
            const Icon = config.icon;
            const health = getHealthLabel(item.score);

            return (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div>
                      <span className={cn("font-medium", compact && "text-sm")}>
                        {item.category}
                      </span>
                      {showLabels && !compact && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({item.factorCount} factors)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {showLabels && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: health.color, color: health.color }}
                      >
                        {health.label}
                      </Badge>
                    )}
                    <span 
                      className="font-bold text-lg min-w-[40px] text-right"
                      style={{ color: config.color }}
                    >
                      {item.score}
                    </span>
                  </div>
                </div>
                
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", config.gradient)}
                  />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No category data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CLEANBICategoryChart;
