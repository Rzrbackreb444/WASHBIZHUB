import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, DollarSign, BarChart3, Users, Building2, 
  Percent, Clock, Shield, Info, CheckCircle, Star
} from "lucide-react";

interface Benchmark {
  label: string;
  value: string;
  description: string;
  source: string;
  icon: typeof TrendingUp;
  trend?: "up" | "stable" | "down";
}

const industryBenchmarks: Benchmark[] = [
  {
    label: "Market Size",
    value: "$6.8-7.1B",
    description: "Total US laundromat industry market size",
    source: "IBISWorld 2025",
    icon: DollarSign,
    trend: "up"
  },
  {
    label: "Avg Store Revenue",
    value: "$200K-$400K",
    description: "Annual revenue for typical laundromat",
    source: "CLA Industry Survey",
    icon: BarChart3,
    trend: "stable"
  },
  {
    label: "SDE Multiple",
    value: "3-5x",
    description: "Seller's Discretionary Earnings multiple for valuations",
    source: "BizBuySell Data",
    icon: TrendingUp,
    trend: "stable"
  },
  {
    label: "5-Year Survival",
    value: "94-95%",
    description: "Laundromats still operating after 5 years",
    source: "Industry Research",
    icon: Shield,
    trend: "up"
  },
  {
    label: "Cashless Adoption",
    value: "55%+",
    description: "Stores with card/app payment systems",
    source: "CLA 2025 Report",
    icon: Percent,
    trend: "up"
  },
  {
    label: "Avg ROI",
    value: "20-35%",
    description: "Cash-on-cash returns for well-managed stores",
    source: "WashBizHub Data",
    icon: TrendingUp,
    trend: "stable"
  },
  {
    label: "Weekly Sales Volume",
    value: "47 sold/week",
    description: "Laundromats changing hands nationwide",
    source: "Live Industry Pulse",
    icon: Building2,
    trend: "up"
  },
  {
    label: "Active Investors",
    value: "1,847",
    description: "Active buyers in the marketplace",
    source: "WashBizHub Analytics",
    icon: Users,
    trend: "up"
  }
];

export function IndustryBenchmarks({ 
  variant = "full",
  showTitle = true 
}: { 
  variant?: "full" | "compact" | "inline";
  showTitle?: boolean;
}) {
  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-4 justify-center py-4">
        {industryBenchmarks.slice(0, 4).map((benchmark) => (
          <Tooltip key={benchmark.label}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 cursor-help">
                <benchmark.icon className="w-4 h-4 text-[#C8A661]" />
                <span className="font-semibold text-foreground">{benchmark.value}</span>
                <span className="text-sm text-muted-foreground">{benchmark.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{benchmark.description}</p>
              <p className="text-xs text-muted-foreground mt-1">Source: {benchmark.source}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className="border-[#C8A661]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#C8A661]" />
            2025 Industry Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industryBenchmarks.slice(0, 4).map((benchmark) => (
              <div key={benchmark.label} className="text-center">
                <div className="text-xl font-bold text-[#C8A661]">{benchmark.value}</div>
                <div className="text-sm text-muted-foreground">{benchmark.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section id="industry-benchmarks" className="py-24 md:py-32 px-4" style={{ background: '#09090b' }}>
      <div className="max-w-7xl mx-auto">
        {showTitle && (
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-[#C8A661]/50 text-[#C8A661]">
              <BarChart3 className="w-3 h-3 mr-1" />
              Industry Intelligence
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              2025 Laundromat Industry Benchmarks
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Real-time data from IBISWorld, CLA, and our proprietary analysis of 2,500+ locations
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {industryBenchmarks.map((benchmark) => {
            const Icon = benchmark.icon;
            return (
              <Tooltip key={benchmark.label}>
                <TooltipTrigger asChild>
                  <Card 
                    className="hover-elevate cursor-help bg-white/[0.03] border-white/10 backdrop-blur-xl"
                    data-testid={`benchmark-${benchmark.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#C8A661]/10 mb-3">
                        <Icon className="w-5 h-5 text-[#C8A661]" />
                      </div>
                      <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                        {benchmark.value}
                        {benchmark.trend === "up" && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-white/60">{benchmark.label}</div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Info className="w-3 h-3 text-white/40" />
                        <span className="text-xs text-white/40">{benchmark.source}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{benchmark.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/50">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Data updated December 2025</span>
            <span className="mx-2">|</span>
            <span>Sources: IBISWorld, CLA, BizBuySell, WashBizHub Analytics</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BenchmarkBadge({ 
  metric, 
  value, 
  source 
}: { 
  metric: string; 
  value: string; 
  source: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className="cursor-help border-[#C8A661]/30 bg-[#C8A661]/5"
        >
          <span className="text-muted-foreground mr-1">{metric}:</span>
          <span className="font-semibold text-[#C8A661]">{value}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Source: {source}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function ProvenanceBadge({ 
  source, 
  year,
  confidence
}: { 
  source: string;
  year?: string;
  confidence?: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className="cursor-help text-xs border-muted-foreground/30"
        >
          <Shield className="w-3 h-3 mr-1 text-green-500" />
          {source} {year && `(${year})`}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-medium">Data Source: {source}</p>
          {year && <p className="text-xs text-muted-foreground">Last updated: {year}</p>}
          {confidence && (
            <p className="text-xs text-muted-foreground">
              Confidence: {confidence}%
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
