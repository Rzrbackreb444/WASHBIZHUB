import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, DollarSign, Building2, MapPin, AlertTriangle } from "lucide-react";
import { DesignStudioFeatureGate } from "@/components/design-studio/FeatureGate";
import { RequestProfessionalAnalysisCTA } from "@/components/consultation/RequestProfessionalAnalysisCTA";

interface ValuationEstimatesPanelProps {
  monthlyRevenue: number;
  annualRevenue: number;
  totalEquipmentCost: number;
  locationScore?: number;
  locationGrade?: string;
  sqft: number;
}

interface ValuationRange {
  low: number;
  high: number;
  method: string;
  description: string;
}

function getLocationAdjustment(grade?: string): number {
  switch (grade?.toUpperCase()) {
    case "A":
      return 0.15;
    case "B":
      return 0.05;
    case "C":
      return 0;
    case "D":
    case "NEEDS WORK":
      return -0.10;
    default:
      return 0;
  }
}

function calculateValuations(
  annualRevenue: number,
  totalEquipmentCost: number,
  sqft: number,
  locationGrade?: string
): ValuationRange[] {
  const locationAdjustment = getLocationAdjustment(locationGrade);
  const adjustmentMultiplier = 1 + locationAdjustment;

  const sdeBase = annualRevenue * 0.35;
  const sdeLow = sdeBase * 2.5 * adjustmentMultiplier;
  const sdeHigh = sdeBase * 3.5 * adjustmentMultiplier;

  const revenueLow = annualRevenue * 0.8 * adjustmentMultiplier;
  const revenueHigh = annualRevenue * 1.2 * adjustmentMultiplier;

  const estimatedLeaseValue = sqft * 12 * 12;
  const assetBaseLow = totalEquipmentCost * 0.6 + estimatedLeaseValue * 0.8;
  const assetBaseHigh = totalEquipmentCost * 0.8 + estimatedLeaseValue * 1.2;
  const assetLow = assetBaseLow * adjustmentMultiplier;
  const assetHigh = assetBaseHigh * adjustmentMultiplier;

  return [
    {
      method: "SDE Multiple",
      description: "Seller's Discretionary Earnings × 2.5-3.5x",
      low: sdeLow,
      high: sdeHigh,
    },
    {
      method: "Revenue Multiple",
      description: "Annual Revenue × 0.8-1.2x",
      low: revenueLow,
      high: revenueHigh,
    },
    {
      method: "Asset-Based",
      description: "Equipment value + lease value",
      low: assetLow,
      high: assetHigh,
    },
  ];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${Math.round(value).toLocaleString()}`;
}

function ValuationContent({
  monthlyRevenue,
  annualRevenue,
  totalEquipmentCost,
  locationScore,
  locationGrade,
  sqft,
}: ValuationEstimatesPanelProps) {
  const valuations = calculateValuations(annualRevenue, totalEquipmentCost, sqft, locationGrade);
  const locationAdjustment = getLocationAdjustment(locationGrade);

  const overallLow = Math.min(...valuations.map(v => v.low));
  const overallHigh = Math.max(...valuations.map(v => v.high));

  return (
    <Card className="bg-card border shadow-sm overflow-hidden" data-testid="valuation-estimates-panel">
      <div className="h-1 bg-[#C8A661]" />
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-[#C8A661]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-foreground">Business Valuation Estimates</h3>
              <Badge className="bg-[#C8A661] text-[#0A1628]">Pro</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Based on industry-standard valuation methods</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Estimated Business Value Range</p>
            <div className="text-2xl md:text-3xl font-bold text-[#C8A661]" data-testid="text-valuation-range">
              {formatCurrency(overallLow)} - {formatCurrency(overallHigh)}
            </div>
          </div>
        </div>

        {locationGrade && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
            <MapPin className="h-4 w-4 text-[#C8A661]" />
            <span className="text-sm text-muted-foreground">Location Grade:</span>
            <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]">
              Grade {locationGrade}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {locationAdjustment > 0 ? `+${(locationAdjustment * 100).toFixed(0)}%` : 
               locationAdjustment < 0 ? `${(locationAdjustment * 100).toFixed(0)}%` : 
               'No adjustment'}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {valuations.map((valuation, index) => (
            <div key={valuation.method} data-testid={`valuation-method-${index}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{valuation.method}</span>
                </div>
                <span className="font-bold text-foreground">
                  {formatCurrency(valuation.low)} - {formatCurrency(valuation.high)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground pl-6">{valuation.description}</p>
              {index < valuations.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground" data-testid="text-monthly-revenue">
              ${monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Monthly Revenue</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground" data-testid="text-equipment-cost">
              ${totalEquipmentCost.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Equipment Cost</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground" data-testid="text-sqft">
              {sqft.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Sq Ft</div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6">
          <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            These are estimates only based on industry averages. A professional appraisal is recommended for accurate business valuation before any transaction.
          </p>
        </div>

        <RequestProfessionalAnalysisCTA
          variant="button"
          size="md"
          buttonText="Request Professional Valuation"
          className="w-full"
          consultationData={{
            type: "design",
            designSqft: sqft,
            projectedRevenue: monthlyRevenue,
          }}
        />
      </CardContent>
    </Card>
  );
}

export function ValuationEstimatesPanel(props: ValuationEstimatesPanelProps) {
  return (
    <DesignStudioFeatureGate
      feature="valuation-estimates"
      blurContent={true}
      variant="card"
      title="Business Valuation Estimates"
      description="Get estimated business valuations based on your equipment, location, and revenue projections."
    >
      <ValuationContent {...props} />
    </DesignStudioFeatureGate>
  );
}
