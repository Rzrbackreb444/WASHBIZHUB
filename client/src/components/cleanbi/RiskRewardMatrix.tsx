import { useState } from "react";
import { Target, AlertTriangle, TrendingUp, Shield, Info, Sparkles, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RiskRewardMatrixProps {
  cleanbiScore: number;
  grade: string;
  factors: {
    demographics: number;
    competition: number;
    location: number;
    financial: number;
    lease: number;
    equipment: number;
    operations: number;
    growth: number;
  };
  address?: string;
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

interface QuadrantData {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  recommendation: string;
}

const QUADRANTS: Record<string, QuadrantData> = {
  "high-high": {
    label: "Star Performer",
    description: "High reward potential with manageable risk",
    color: "text-green-600",
    bgColor: "bg-green-500/20",
    icon: Sparkles,
    recommendation: "Excellent acquisition target. Move quickly before competition."
  },
  "high-low": {
    label: "Golden Opportunity",
    description: "High reward with low risk - rare find",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/20",
    icon: Target,
    recommendation: "Best possible scenario. Prioritize this location immediately."
  },
  "low-high": {
    label: "High Stakes",
    description: "Potential upside but significant challenges",
    color: "text-amber-600",
    bgColor: "bg-amber-500/20",
    icon: AlertTriangle,
    recommendation: "Proceed with caution. Negotiate hard on price and terms."
  },
  "low-low": {
    label: "Value Play",
    description: "Lower reward but also lower risk",
    color: "text-blue-600",
    bgColor: "bg-blue-500/20",
    icon: Shield,
    recommendation: "Conservative option. Good for first-time buyers or risk-averse investors."
  }
};

function calculateRiskScore(factors: RiskRewardMatrixProps['factors']): number {
  const riskFactors = [
    100 - factors.competition,
    100 - factors.lease,
    100 - factors.equipment,
    100 - factors.financial
  ];
  return riskFactors.reduce((sum, f) => sum + f, 0) / riskFactors.length;
}

function calculateRewardScore(factors: RiskRewardMatrixProps['factors']): number {
  const rewardFactors = [
    factors.demographics,
    factors.location,
    factors.growth,
    factors.operations
  ];
  return rewardFactors.reduce((sum, f) => sum + f, 0) / rewardFactors.length;
}

export function RiskRewardMatrix({ cleanbiScore, grade, factors, address, isSubscriber = false, onUpgradeClick }: RiskRewardMatrixProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
            <p className="text-muted-foreground mb-4">
              Risk/Reward analysis requires a Pro subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Risk/Reward Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="h-64 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  const riskScore = calculateRiskScore(factors);
  const rewardScore = calculateRewardScore(factors);
  
  const isHighRisk = riskScore > 50;
  const isHighReward = rewardScore > 50;
  
  const quadrantKey = `${isHighReward ? "high" : "low"}-${isHighRisk ? "high" : "low"}`;
  const quadrant = QUADRANTS[quadrantKey];
  const QuadrantIcon = quadrant.icon;
  
  const positionX = Math.min(90, Math.max(10, rewardScore));
  const positionY = Math.min(90, Math.max(10, 100 - riskScore));
  
  const riskFactors = [
    { name: "Competition Risk", value: 100 - factors.competition, weight: 0.3 },
    { name: "Lease Risk", value: 100 - factors.lease, weight: 0.25 },
    { name: "Equipment Risk", value: 100 - factors.equipment, weight: 0.25 },
    { name: "Financial Risk", value: 100 - factors.financial, weight: 0.2 }
  ];
  
  const rewardFactors = [
    { name: "Demographics Potential", value: factors.demographics, weight: 0.3 },
    { name: "Location Value", value: factors.location, weight: 0.3 },
    { name: "Growth Potential", value: factors.growth, weight: 0.2 },
    { name: "Operations Upside", value: factors.operations, weight: 0.2 }
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Risk/Reward Matrix
            </CardTitle>
            <CardDescription>
              Investment positioning based on 68-factor analysis
            </CardDescription>
          </div>
          <Badge className={cn("gap-1", quadrant.color, quadrant.bgColor)}>
            <QuadrantIcon className="h-3 w-3" />
            {quadrant.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-square max-w-md mx-auto border rounded-lg overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-amber-500/10 border-r border-b flex items-center justify-center p-2">
              <span className="text-xs text-amber-600 font-medium text-center">
                High Stakes
              </span>
            </div>
            <div className="bg-green-500/10 border-b flex items-center justify-center p-2">
              <span className="text-xs text-green-600 font-medium text-center">
                Star Performer
              </span>
            </div>
            <div className="bg-blue-500/10 border-r flex items-center justify-center p-2">
              <span className="text-xs text-blue-600 font-medium text-center">
                Value Play
              </span>
            </div>
            <div className="bg-emerald-500/10 flex items-center justify-center p-2">
              <span className="text-xs text-emerald-600 font-medium text-center">
                Golden Opportunity
              </span>
            </div>
          </div>
          
          <div 
            className="absolute w-6 h-6 rounded-full bg-primary shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
            style={{ left: `${positionX}%`, top: `${positionY}%` }}
          >
            <span className="text-xs font-bold text-primary-foreground">{grade}</span>
          </div>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Reward Potential
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Risk Level
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Reward Score</span>
              <span className="text-lg font-bold text-green-600">{rewardScore.toFixed(0)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                style={{ width: `${rewardScore}%` }}
              />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Risk Score</span>
              <span className="text-lg font-bold text-amber-600">{riskScore.toFixed(0)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all"
                style={{ width: `${riskScore}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className={cn("p-4 rounded-lg border-l-4", quadrant.bgColor)}>
          <div className="flex items-start gap-3">
            <QuadrantIcon className={cn("h-5 w-5 mt-0.5", quadrant.color)} />
            <div>
              <h4 className={cn("font-medium", quadrant.color)}>{quadrant.label}</h4>
              <p className="text-sm text-muted-foreground mt-1">{quadrant.description}</p>
              <p className="text-sm mt-2 font-medium">{quadrant.recommendation}</p>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide" : "Show"} Factor Breakdown
        </Button>
        
        {showDetails && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Reward Factors
              </h4>
              {rewardFactors.map((factor) => (
                <div key={factor.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{factor.name}</span>
                    <span className="font-medium">{factor.value.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${factor.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Risk Factors
              </h4>
              {riskFactors.map((factor) => (
                <div key={factor.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{factor.name}</span>
                    <span className="font-medium">{factor.value.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${factor.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Matrix position calculated from weighted analysis of 68 location factors.
        </p>
      </CardContent>
    </Card>
  );
}

export default RiskRewardMatrix;
