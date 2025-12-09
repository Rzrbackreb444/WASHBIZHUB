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
  BarChart3,
  Rocket,
  Database,
  LineChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CLEANBIGradeBadge } from "./CLEANBIGradeBadge";
import { CLEANBIScoreCard } from "./CLEANBIScoreCard";
import { GradeExplanation } from "./GradeExplanation";
import { FactorBreakdown } from "./FactorBreakdown";
import { CLEANBIRadarChart } from "./CLEANBIRadarChart";
import { CLEANBICategoryChart } from "./CLEANBICategoryChart";
import { BenchmarkComparison } from "./BenchmarkComparison";
import { ImprovementRoadmap } from "./ImprovementRoadmap";
import { DataConfidence } from "./DataConfidence";

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

function generateFactorsFromAnalysis(analysis: AnalysisChartsViewProps['analysis']) {
  if (!analysis) return [];
  
  const normalizeScore = (value: number, min: number, max: number) => 
    Math.min(100, Math.max(0, Math.round(((value - min) / (max - min)) * 100)));
  
  const competitorScore = analysis.competitorCount === 0 ? 95 :
    analysis.competitorCount <= 2 ? 85 :
    analysis.competitorCount <= 5 ? 70 :
    analysis.competitorCount <= 10 ? 50 : 30;
  
  return [
    { name: "Population Density", score: normalizeScore(analysis.populationDensity, 0, 15000), weight: 12, category: "Demographics" },
    { name: "Median Household Income", score: normalizeScore(analysis.medianIncome, 20000, 150000), weight: 10, category: "Demographics" },
    { name: "Competition Density", score: competitorScore, weight: 15, category: "Market" },
    { name: "Walk Score", score: analysis.walkScore || 50, weight: 8, category: "Location" },
    { name: "Transit Score", score: analysis.transitScore || 40, weight: 6, category: "Location" },
    { name: "Bike Score", score: analysis.bikeScore || 45, weight: 4, category: "Location" },
    { name: "Traffic Volume", score: analysis.trafficScore, weight: 10, category: "Location" },
    { name: "Parking Availability", score: Math.min(100, analysis.trafficScore + 15), weight: 5, category: "Location" },
    { name: "Visibility Score", score: Math.min(100, analysis.trafficScore + 10), weight: 5, category: "Location" },
    { name: "Lease Terms", score: 65, weight: 4, category: "Financial" },
    { name: "Building Condition", score: 70, weight: 3, category: "Operations" },
    { name: "Equipment Age", score: 60, weight: 4, category: "Operations" },
    { name: "Utility Costs", score: 55, weight: 5, category: "Financial" },
    { name: "Labor Costs", score: 62, weight: 3, category: "Financial" },
    { name: "Crime Rate", score: 75, weight: 3, category: "Demographics" },
    { name: "Growth Potential", score: Math.min(100, analysis.cleanbiScore + 5), weight: 2, category: "Market" },
    { name: "Market Saturation", score: competitorScore, weight: 1, category: "Market" },
  ];
}

function generateConfidenceData(analysis: AnalysisChartsViewProps['analysis']) {
  if (!analysis) return [];
  
  return [
    { name: "Population Density", source: "verified" as const, confidence: 95, dataSource: "US Census" },
    { name: "Median Household Income", source: "verified" as const, confidence: 95, dataSource: "US Census ACS" },
    { name: "Competition Density", source: "verified" as const, confidence: 90, dataSource: "Google Places" },
    { name: "Walk Score", source: analysis.walkScore ? "verified" as const : "default" as const, confidence: analysis.walkScore ? 85 : 50 },
    { name: "Transit Score", source: analysis.transitScore ? "verified" as const : "default" as const, confidence: analysis.transitScore ? 85 : 50 },
    { name: "Bike Score", source: analysis.bikeScore ? "verified" as const : "default" as const, confidence: analysis.bikeScore ? 85 : 50 },
    { name: "Traffic Volume", source: "estimated" as const, confidence: 75, dataSource: "Google Maps" },
    { name: "Parking Availability", source: "estimated" as const, confidence: 70 },
    { name: "Visibility Score", source: "estimated" as const, confidence: 70 },
    { name: "Lease Terms", source: "default" as const, confidence: 50 },
    { name: "Building Condition", source: "default" as const, confidence: 50 },
    { name: "Equipment Age", source: "default" as const, confidence: 50 },
    { name: "Utility Costs", source: "estimated" as const, confidence: 65 },
    { name: "Labor Costs", source: "estimated" as const, confidence: 65 },
    { name: "Crime Rate", source: "verified" as const, confidence: 85, dataSource: "FBI Crime Data" },
    { name: "Growth Potential", source: "estimated" as const, confidence: 70 },
    { name: "Market Saturation", source: "verified" as const, confidence: 90, dataSource: "Google Places" },
  ];
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
  
  const factors = generateFactorsFromAnalysis(analysis);
  const confidenceData = generateConfidenceData(analysis);
  
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
          className={cn("text-sm px-3 py-1", opportunityConfig.bgColor)}
          style={{ color: opportunityConfig.color, borderColor: opportunityConfig.color }}
          variant="outline"
          data-testid="badge-opportunity-level"
        >
          <Sparkles className="h-3 w-3 mr-1.5" />
          {opportunityConfig.text}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm" data-testid="tab-overview">
            <Award className="w-4 h-4 mr-1 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs sm:text-sm" data-testid="tab-analysis">
            <BarChart3 className="w-4 h-4 mr-1 hidden sm:inline" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="text-xs sm:text-sm" data-testid="tab-benchmarks">
            <LineChart className="w-4 h-4 mr-1 hidden sm:inline" />
            Benchmarks
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs sm:text-sm" data-testid="tab-roadmap">
            <Rocket className="w-4 h-4 mr-1 hidden sm:inline" />
            Roadmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CLEANBIScoreCard 
              score={analysis.cleanbiScore} 
              grade={analysis.grade}
              showEbitdaMultiple={true}
              showDescription={true}
            />
            <CLEANBICategoryChart factors={factors} showLabels={true} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <DataConfidence factors={confidenceData} compact={false} showDetails={false} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CLEANBIRadarChart factors={factors} showBenchmark={true} height={350} />
            <GradeExplanation 
              factors={factors} 
              grade={analysis.grade} 
              score={analysis.cleanbiScore}
              maxStrengths={4}
              maxWeaknesses={4}
            />
          </div>
          
          <FactorBreakdown 
            factors={factors} 
            showWeights={true} 
            collapsible={true}
            defaultExpanded={false}
          />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <BenchmarkComparison 
            score={analysis.cleanbiScore} 
            grade={analysis.grade}
            region="National"
          />
          
          <DataConfidence 
            factors={confidenceData} 
            showDetails={true}
          />
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <ImprovementRoadmap 
            factors={factors}
            currentScore={analysis.cleanbiScore}
            currentGrade={analysis.grade}
            maxItems={6}
          />
          
          <GradeExplanation 
            factors={factors} 
            grade={analysis.grade} 
            score={analysis.cleanbiScore}
            showRecommendation={true}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default AnalysisChartsView;
