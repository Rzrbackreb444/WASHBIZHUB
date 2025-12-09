import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle,
  CheckCircle2,
  Database,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FactorConfidence {
  name: string;
  source: "verified" | "estimated" | "default";
  confidence: number;
  dataSource?: string;
}

interface DataConfidenceProps {
  factors: FactorConfidence[];
  overallConfidence?: number;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const SOURCE_CONFIG = {
  verified: { 
    icon: CheckCircle2, 
    color: "#22C55E", 
    bg: "bg-green-500/10",
    label: "Verified",
    description: "Data from authoritative sources"
  },
  estimated: { 
    icon: RefreshCw, 
    color: "#F59E0B", 
    bg: "bg-amber-500/10",
    label: "Estimated",
    description: "Calculated from related data"
  },
  default: { 
    icon: HelpCircle, 
    color: "#6B7280", 
    bg: "bg-gray-500/10",
    label: "Default",
    description: "Industry standard values applied"
  }
};

export function DataConfidence({
  factors,
  overallConfidence,
  showDetails = true,
  compact = false,
  className
}: DataConfidenceProps) {
  const verifiedCount = factors.filter(f => f.source === "verified").length;
  const estimatedCount = factors.filter(f => f.source === "estimated").length;
  const defaultCount = factors.filter(f => f.source === "default").length;
  
  const calculatedConfidence = overallConfidence ?? Math.round(
    (verifiedCount * 100 + estimatedCount * 70 + defaultCount * 40) / factors.length
  );
  
  const completenessPercent = Math.round((verifiedCount / factors.length) * 100);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return "#22C55E";
    if (confidence >= 60) return "#A3E635";
    if (confidence >= 40) return "#FBBF24";
    return "#C8A661";
  };

  const confidenceColor = getConfidenceColor(calculatedConfidence);

  if (compact) {
    return (
      <div 
        className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/50", className)}
        data-testid="data-confidence-compact"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" style={{ color: confidenceColor }} />
          <span className="text-sm font-medium">Data Confidence</span>
        </div>
        <div className="flex-1">
          <Progress 
            value={calculatedConfidence} 
            className="h-2"
            style={{ ["--progress-background" as string]: confidenceColor }}
          />
        </div>
        <Badge 
          variant="outline"
          className="text-xs"
          style={{ borderColor: confidenceColor, color: confidenceColor }}
        >
          {calculatedConfidence}%
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)} data-testid="data-confidence">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Quality
          </span>
          <Badge 
            className="text-white"
            style={{ backgroundColor: confidenceColor }}
          >
            {calculatedConfidence}% Confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Confidence</span>
            <span className="font-semibold" style={{ color: confidenceColor }}>
              {calculatedConfidence}%
            </span>
          </div>
          <Progress 
            value={calculatedConfidence} 
            className="h-3"
            style={{ ["--progress-background" as string]: confidenceColor }}
          />
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(SOURCE_CONFIG).map(([source, config], index) => {
            const count = source === "verified" ? verifiedCount 
              : source === "estimated" ? estimatedCount 
              : defaultCount;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={source}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn("p-3 rounded-lg text-center", config.bg)}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: config.color }} />
                <p className="text-xl font-bold" style={{ color: config.color }}>{count}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Completeness</span>
            <span className="text-sm font-semibold">{completenessPercent}%</span>
          </div>
          <Progress value={completenessPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {verifiedCount} of {factors.length} factors have verified data sources
          </p>
        </div>

        {showDetails && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              Factor Sources
            </h4>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {factors.map((factor, index) => {
                const config = SOURCE_CONFIG[factor.source];
                const Icon = config.icon;
                
                return (
                  <Tooltip key={factor.name}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded text-xs cursor-help",
                          config.bg
                        )}
                      >
                        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
                        <span className="truncate">{factor.name}</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{factor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                      {factor.dataSource && (
                        <p className="text-xs mt-1">Source: {factor.dataSource}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-600">Improve Confidence</p>
              <p className="text-xs text-muted-foreground">
                {defaultCount > 0 
                  ? `Provide actual data for ${defaultCount} default factors to improve accuracy.`
                  : estimatedCount > 0
                    ? `Verify ${estimatedCount} estimated factors with actual measurements.`
                    : "All factors have verified data sources!"
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DataConfidence;
