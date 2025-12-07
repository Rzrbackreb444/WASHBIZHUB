import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  Users,
  Building2,
  DollarSign,
  Car,
  Footprints,
  Train,
  Bike,
  Target,
  TrendingUp,
  MapPin,
  Sparkles,
  Award,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AnalysisChartsViewProps {
  analysis: {
    address: string;
    cleanbiScore: number;
    grade: string;
    competitorCount: number;
    populationDensity: number;
    medianIncome: number;
    trafficScore: number;
    opportunityLevel: string;
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
  } | null;
  isLoading?: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635",
  "C": "#FBBF24",
  "Needs Work": "#C8A661"
};

const OPPORTUNITY_CONFIG: Record<string, { text: string; color: string; bgColor: string }> = {
  "goldmine": { text: "Gold Mine Zone", color: "#C8A661", bgColor: "bg-[#C8A661]/10" },
  "promising": { text: "High Opportunity", color: "#22C55E", bgColor: "bg-green-500/10" },
  "moderate": { text: "Good Potential", color: "#3B82F6", bgColor: "bg-blue-500/10" },
  "saturated": { text: "Room to Grow", color: "#F59E0B", bgColor: "bg-amber-500/10" },
  "oversaturated": { text: "Strategic Location", color: "#6B7280", bgColor: "bg-gray-500/10" }
};

function ScoreGaugeChart({ score, grade }: { score: number; grade: string }) {
  const gradeColor = GRADE_COLORS[grade] || "#C8A661";
  
  const data = [
    {
      name: "Score",
      value: score,
      fill: gradeColor,
    }
  ];

  return (
    <div className="relative w-full h-[280px] flex items-center justify-center" data-testid="score-gauge-chart">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          barSize={24}
          data={data}
          startAngle={180}
          endAngle={-180}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "hsl(var(--muted))" }}
            dataKey="value"
            cornerRadius={12}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div
            className="text-5xl font-bold"
            style={{ color: gradeColor }}
            data-testid="text-cleanbi-score"
          >
            {score}
          </div>
          <div className="text-sm text-muted-foreground mt-1">out of 100</div>
        </motion.div>
      </div>
    </div>
  );
}

function FactorBreakdownComingSoon() {
  return (
    <div 
      className="w-full h-[280px] flex flex-col items-center justify-center bg-muted/30 rounded-lg"
      data-testid="factor-breakdown-coming-soon"
    >
      <div className="h-12 w-12 rounded-full bg-[#0A1628] flex items-center justify-center mb-4">
        <Info className="h-6 w-6 text-[#C8A661]" />
      </div>
      <h4 className="text-base font-semibold text-foreground mb-2">Detailed Breakdown</h4>
      <p className="text-sm text-muted-foreground text-center max-w-xs px-4">
        Individual factor scores are calculated on the backend as part of the overall CLEANBI score. 
        Detailed factor breakdown visualization coming soon.
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  testId,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  subtext?: string;
  testId: string;
}) {
  return (
    <div
      className="bg-muted/50 rounded-lg p-4 flex items-start gap-3"
      data-testid={testId}
    >
      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-[#C8A661]" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-lg font-bold text-foreground truncate">{value}</div>
        {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
      </div>
    </div>
  );
}

function MobilityScoreCard({
  icon: Icon,
  label,
  score,
  testId,
}: {
  icon: typeof Footprints;
  label: string;
  score: number | undefined | null;
  testId: string;
}) {
  if (score === undefined || score === null) return null;
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return "#22C55E";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };
  
  const color = getScoreColor(score);
  
  return (
    <div
      className="bg-muted/50 rounded-lg p-3 text-center"
      data-testid={testId}
    >
      <Icon className="h-5 w-5 mx-auto mb-1" style={{ color }} />
      <div className="text-xl font-bold" style={{ color }}>{score}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6" data-testid="charts-loading-skeleton">
      <div className="flex items-center justify-center">
        <Skeleton className="h-[280px] w-[280px] rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      data-testid="charts-empty-state"
    >
      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Target className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No Analysis Data</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Enter an address and run an analysis to see detailed charts and metrics for your location.
      </p>
    </div>
  );
}

export function AnalysisChartsView({ analysis, isLoading }: AnalysisChartsViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  if (!analysis) {
    return <EmptyState />;
  }
  
  const gradeColor = GRADE_COLORS[analysis.grade] || "#C8A661";
  const opportunityConfig = OPPORTUNITY_CONFIG[analysis.opportunityLevel] || OPPORTUNITY_CONFIG["moderate"];
  
  const hasMobilityScores = analysis.walkScore || analysis.transitScore || analysis.bikeScore;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 space-y-6"
      data-testid="analysis-charts-view"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-[#C8A661]" />
          <span className="text-sm text-muted-foreground truncate max-w-md" data-testid="text-analysis-address">
            {analysis.address}
          </span>
        </div>
        <Badge
          className={cn(
            "text-sm px-3 py-1",
            opportunityConfig.bgColor
          )}
          style={{ color: opportunityConfig.color, borderColor: opportunityConfig.color }}
          variant="outline"
          data-testid="badge-opportunity-level"
        >
          <Sparkles className="h-3 w-3 mr-1.5" />
          {opportunityConfig.text}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border shadow-sm overflow-hidden">
          <div className="h-1 bg-[#C8A661]" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-[#C8A661]" />
              CLEANBI Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreGaugeChart score={analysis.cleanbiScore} grade={analysis.grade} />
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Grade:</span>
              <Badge
                className="text-lg font-bold px-3"
                style={{ backgroundColor: gradeColor, color: "#fff" }}
                data-testid="badge-grade"
              >
                {analysis.grade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm overflow-hidden">
          <div className="h-1 bg-[#C8A661]" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-[#C8A661]" />
              Factor Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FactorBreakdownComingSoon />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border shadow-sm overflow-hidden">
        <div className="h-1 bg-[#C8A661]" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-[#C8A661]" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              icon={Users}
              label="Population Density"
              value={`${analysis.populationDensity.toLocaleString()}`}
              subtext="per sq mile"
              testId="metric-population-density"
            />
            <MetricCard
              icon={DollarSign}
              label="Median Income"
              value={`$${(analysis.medianIncome / 1000).toFixed(0)}K`}
              subtext="household"
              testId="metric-median-income"
            />
            <MetricCard
              icon={Building2}
              label="Competitors"
              value={analysis.competitorCount}
              subtext="within radius"
              testId="metric-competitor-count"
            />
            <MetricCard
              icon={Car}
              label="Traffic Score"
              value={`${analysis.trafficScore}/100`}
              testId="metric-traffic-score"
            />
          </div>
        </CardContent>
      </Card>

      {hasMobilityScores && (
        <Card className="bg-card border shadow-sm overflow-hidden">
          <div className="h-1 bg-[#C8A661]" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Footprints className="h-5 w-5 text-[#C8A661]" />
              Mobility Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <MobilityScoreCard
                icon={Footprints}
                label="Walk Score"
                score={analysis.walkScore}
                testId="mobility-walk-score"
              />
              <MobilityScoreCard
                icon={Train}
                label="Transit Score"
                score={analysis.transitScore}
                testId="mobility-transit-score"
              />
              <MobilityScoreCard
                icon={Bike}
                label="Bike Score"
                score={analysis.bikeScore}
                testId="mobility-bike-score"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
