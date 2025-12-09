import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Factor {
  name: string;
  score: number;
  weight: number;
  category: string;
}

interface CLEANBIRadarChartProps {
  factors: Factor[];
  benchmarkFactors?: Factor[];
  showBenchmark?: boolean;
  height?: number;
  className?: string;
}

const GRADE_COLORS = {
  primary: "#C8A661",
  benchmark: "#3B82F6",
  grid: "hsl(var(--border))",
  text: "hsl(var(--muted-foreground))"
};

function shortenFactorName(name: string): string {
  const abbreviations: Record<string, string> = {
    "Population Density": "Pop Density",
    "Median Household Income": "Med Income",
    "Competition Density": "Competition",
    "Walk Score": "Walk",
    "Transit Score": "Transit",
    "Bike Score": "Bike",
    "Traffic Volume": "Traffic",
    "Parking Availability": "Parking",
    "Visibility Score": "Visibility",
    "Lease Terms": "Lease",
    "Building Condition": "Building",
    "Equipment Age": "Equipment",
    "Utility Costs": "Utilities",
    "Labor Costs": "Labor",
    "Crime Rate": "Safety",
    "Growth Potential": "Growth",
    "Market Saturation": "Saturation"
  };
  return abbreviations[name] || name;
}

export function CLEANBIRadarChart({
  factors,
  benchmarkFactors,
  showBenchmark = false,
  height = 400,
  className
}: CLEANBIRadarChartProps) {
  const chartData = factors.map((factor, index) => ({
    subject: shortenFactorName(factor.name),
    score: factor.score,
    benchmark: benchmarkFactors?.[index]?.score || 70,
    fullMark: 100
  }));

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="cleanbi-radar-chart">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Factor Analysis Radar</span>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: GRADE_COLORS.primary, color: GRADE_COLORS.primary }}
            >
              Your Score
            </Badge>
            {showBenchmark && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: GRADE_COLORS.benchmark, color: GRADE_COLORS.benchmark }}
              >
                Industry Avg
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {factors.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke={GRADE_COLORS.grid} strokeOpacity={0.5} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ 
                  fill: GRADE_COLORS.text, 
                  fontSize: 10,
                  fontWeight: 500
                }}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: GRADE_COLORS.text, fontSize: 9 }}
                tickCount={5}
              />
              
              {showBenchmark && benchmarkFactors && (
                <Radar
                  name="Industry Average"
                  dataKey="benchmark"
                  stroke={GRADE_COLORS.benchmark}
                  fill={GRADE_COLORS.benchmark}
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
              
              <Radar
                name="Your Score"
                dataKey="score"
                stroke={GRADE_COLORS.primary}
                fill={GRADE_COLORS.primary}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div 
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            <p className="text-sm">No factor data available for radar chart</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CLEANBIRadarChart;
