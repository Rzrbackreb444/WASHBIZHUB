import { useState } from "react";
import { DollarSign, TrendingUp, Calculator, Info, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ValuationEstimatorProps {
  cleanbiScore: number;
  grade: string;
  address?: string;
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

const GRADE_MULTIPLES: Record<string, { min: number; max: number; ebitda: string }> = {
  "A": { min: 3.5, max: 4.5, ebitda: "3.5x - 4.5x" },
  "B": { min: 2.8, max: 3.5, ebitda: "2.8x - 3.5x" },
  "C": { min: 2.2, max: 2.8, ebitda: "2.2x - 2.8x" },
  "Needs Work": { min: 1.5, max: 2.2, ebitda: "1.5x - 2.2x" }
};

const GRADE_COLORS: Record<string, string> = {
  "A": "text-green-500",
  "B": "text-lime-500",
  "C": "text-amber-500",
  "Needs Work": "text-yellow-600"
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function ValuationEstimator({ 
  cleanbiScore, 
  grade, 
  address,
  isSubscriber = false,
  onUpgradeClick 
}: ValuationEstimatorProps) {
  const [annualRevenue, setAnnualRevenue] = useState<number>(250000);
  const [profitMargin, setProfitMargin] = useState<number>(25);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const multiples = GRADE_MULTIPLES[grade] || GRADE_MULTIPLES["Needs Work"];
  
  const ebitda = annualRevenue * (profitMargin / 100);
  const valuationLow = ebitda * multiples.min;
  const valuationHigh = ebitda * multiples.max;
  const valuationMid = (valuationLow + valuationHigh) / 2;
  
  const scoreMultiplier = 0.8 + (cleanbiScore / 100) * 0.4;
  const adjustedValuationMid = valuationMid * scoreMultiplier;
  
  const sbaDownPayment = adjustedValuationMid * 0.10;
  const monthlyPayment = (adjustedValuationMid * 0.90 * 0.08) / 12;
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              Unlock business valuation estimates with a Pro subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Valuation Estimator
          </CardTitle>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="h-64 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Valuation Estimator
            </CardTitle>
            <CardDescription>
              Based on CLEANBI Grade {grade} ({cleanbiScore.toFixed(1)}/100)
            </CardDescription>
          </div>
          <Badge className={cn("text-lg px-3 py-1", GRADE_COLORS[grade])}>
            {multiples.ebitda} EBITDA
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Annual Revenue
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Total annual gross revenue from all services
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
              className="text-lg"
              data-testid="input-annual-revenue"
            />
            <Slider
              value={[annualRevenue]}
              onValueChange={([value]) => setAnnualRevenue(value)}
              min={50000}
              max={1000000}
              step={10000}
              className="mt-2"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Profit Margin
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Net operating income as % of revenue (industry avg: 20-35%)
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(Number(e.target.value))}
                className="text-lg w-24"
                data-testid="input-profit-margin"
              />
              <span className="text-lg">%</span>
            </div>
            <Slider
              value={[profitMargin]}
              onValueChange={([value]) => setProfitMargin(value)}
              min={10}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-1">Estimated Business Value</p>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(adjustedValuationMid)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Range: {formatCurrency(valuationLow * scoreMultiplier)} - {formatCurrency(valuationHigh * scoreMultiplier)}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-green-500/20">
            <div>
              <p className="text-xs text-muted-foreground">EBITDA</p>
              <p className="text-lg font-semibold">{formatCurrency(ebitda)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Multiple</p>
              <p className="text-lg font-semibold">{((adjustedValuationMid / ebitda) || 0).toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Per Machine*</p>
              <p className="text-lg font-semibold">{formatCurrency(adjustedValuationMid / 25)}</p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide" : "Show"} SBA Financing Details
        </Button>
        
        {showAdvanced && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              SBA 7(a) Loan Estimate
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Down Payment (10%)</p>
                <p className="font-semibold text-lg">{formatCurrency(sbaDownPayment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. Monthly Payment</p>
                <p className="font-semibold text-lg">{formatCurrency(monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Debt Service Coverage</p>
                <p className="font-semibold text-lg">{((ebitda / 12) / monthlyPayment).toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cash-on-Cash Return</p>
                <p className="font-semibold text-lg">
                  {(((ebitda - (monthlyPayment * 12)) / sbaDownPayment) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              *Estimates based on SBA 7(a) at 8% APR, 10-year term. Actual rates may vary.
            </p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Valuation based on industry EBITDA multiples adjusted for CLEANBI location score. 
            For accurate valuations, consult a professional business appraiser.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ValuationEstimator;
