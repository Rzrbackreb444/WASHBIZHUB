import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Award,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface BenchmarkComparisonProps {
  score: number;
  grade: string;
  region?: string;
  className?: string;
}

const CLA_INDUSTRY_DATA = {
  totalLaundromats: 18375,
  averageScore: 62,
  medianScore: 58,
  topQuartile: 78,
  bottomQuartile: 45,
  gradeDistribution: {
    "A": { percent: 12, count: 2205, ebitdaMultiple: "4.0x - 5.5x" },
    "B": { percent: 28, count: 5145, ebitdaMultiple: "3.0x - 4.0x" },
    "C": { percent: 35, count: 6431, ebitdaMultiple: "2.0x - 3.0x" },
    "Needs Work": { percent: 25, count: 4594, ebitdaMultiple: "1.5x - 2.0x" }
  }
};

const REGIONAL_BENCHMARKS: Record<string, { averageScore: number; topPerformer: number; marketSize: number }> = {
  "Northeast": { averageScore: 68, topPerformer: 89, marketSize: 4250 },
  "Southeast": { averageScore: 61, topPerformer: 86, marketSize: 3890 },
  "Midwest": { averageScore: 58, topPerformer: 84, marketSize: 3520 },
  "Southwest": { averageScore: 64, topPerformer: 88, marketSize: 3180 },
  "West": { averageScore: 71, topPerformer: 92, marketSize: 3535 }
};

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635",
  "C": "#FBBF24",
  "Needs Work": "#C8A661"
};

function calculatePercentile(score: number): number {
  if (score >= 85) return Math.max(1, Math.round((100 - score) * 0.4));
  if (score >= 70) return Math.round(8 + (85 - score) * 0.8);
  if (score >= 55) return Math.round(20 + (70 - score) * 1.5);
  return Math.round(45 + (55 - score) * 1.1);
}

export function BenchmarkComparison({
  score,
  grade,
  region = "National",
  className
}: BenchmarkComparisonProps) {
  const percentile = calculatePercentile(score);
  const gradeColor = GRADE_COLORS[grade] || GRADE_COLORS["Needs Work"];
  const gradeData = CLA_INDUSTRY_DATA.gradeDistribution[grade as keyof typeof CLA_INDUSTRY_DATA.gradeDistribution];

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="benchmark-comparison">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Industry Benchmarks
          </span>
          <Badge variant="secondary" className="text-xs">
            CLA Data: {CLA_INDUSTRY_DATA.totalLaundromats.toLocaleString()} analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="national" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="national" data-testid="tab-national">National</TabsTrigger>
            <TabsTrigger value="regional" data-testid="tab-regional">Regional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="national" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${gradeColor}10`,
                borderColor: `${gradeColor}30`
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: gradeColor }} />
                  <span className="font-semibold">Your Ranking</span>
                </div>
                <Badge 
                  className="text-white font-bold"
                  style={{ backgroundColor: gradeColor }}
                >
                  Top {percentile}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your score of <strong>{score}</strong> places you in the top {percentile}% of {CLA_INDUSTRY_DATA.totalLaundromats.toLocaleString()} laundromats analyzed nationwide.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Industry Average</p>
                <p className="text-2xl font-bold">{CLA_INDUSTRY_DATA.averageScore}</p>
                <div className="flex items-center gap-1 mt-1">
                  {score > CLA_INDUSTRY_DATA.averageScore ? (
                    <Badge className="text-xs bg-green-500">+{score - CLA_INDUSTRY_DATA.averageScore} above</Badge>
                  ) : score < CLA_INDUSTRY_DATA.averageScore ? (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-500">{CLA_INDUSTRY_DATA.averageScore - score} below</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">At average</Badge>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Top Quartile</p>
                <p className="text-2xl font-bold">{CLA_INDUSTRY_DATA.topQuartile}</p>
                <div className="flex items-center gap-1 mt-1">
                  {score >= CLA_INDUSTRY_DATA.topQuartile ? (
                    <Badge className="text-xs bg-green-500">You're here!</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">{CLA_INDUSTRY_DATA.topQuartile - score} to reach</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Grade Distribution
              </h4>
              {Object.entries(CLA_INDUSTRY_DATA.gradeDistribution).map(([g, data], index) => (
                <motion.div
                  key={g}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg",
                    g === grade && "ring-2 ring-offset-2",
                  )}
                  style={g === grade ? { ringColor: GRADE_COLORS[g] } : {}}
                >
                  <Badge 
                    className="text-white w-20 justify-center"
                    style={{ backgroundColor: GRADE_COLORS[g] }}
                  >
                    {g}
                  </Badge>
                  <div className="flex-1">
                    <Progress value={data.percent} className="h-2" />
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-semibold">{data.percent}%</p>
                    <p className="text-xs text-muted-foreground">{data.count.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {gradeData && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm">EBITDA Multiple for Grade {grade}</span>
                  <span className="font-bold" style={{ color: gradeColor }}>
                    {gradeData.ebitdaMultiple}
                  </span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="regional" className="space-y-4">
            {Object.entries(REGIONAL_BENCHMARKS).map(([regionName, data], index) => (
              <motion.div
                key={regionName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  region === regionName && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{regionName}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.marketSize.toLocaleString()} laundromats
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Avg</p>
                    <p className="font-semibold">{data.averageScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Top</p>
                    <p className="font-semibold text-green-500">{data.topPerformer}</p>
                  </div>
                  {score > data.averageScore ? (
                    <Badge className="bg-green-500 text-white text-xs">
                      +{score - data.averageScore}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {data.averageScore - score > 0 ? `-${data.averageScore - score}` : "="}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default BenchmarkComparison;
