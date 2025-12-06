import { AlertTriangle, Shield, Info, Calculator, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type DisclaimerType = "service" | "calculator" | "valuation" | "investment" | "general";

interface LegalDisclaimerProps {
  variant?: "compact" | "full" | "inline";
  type?: DisclaimerType;
  className?: string;
}

const DISCLAIMER_TEXT: Record<DisclaimerType, { short: string; title: string; full: string[] }> = {
  service: {
    short: "Educational Content Only. Always consult a licensed professional technician before attempting repairs. Working on commercial laundry equipment can be dangerous.",
    title: "Important Safety Notice",
    full: [
      "Always consult a licensed, certified professional technician before attempting any repairs",
      "Working on commercial laundry equipment involves electrical, gas, and mechanical hazards",
      "Improper repairs can result in injury, death, property damage, or voided warranties",
      "Part numbers and specifications may vary by model and region - verify before ordering",
      "WashBizHub and Service Guy AI assume no liability for actions taken based on this information",
    ],
  },
  calculator: {
    short: "For Informational Purposes Only. All calculations are estimates and should not be considered financial advice. Consult qualified professionals before making business decisions.",
    title: "Calculator Disclaimer",
    full: [
      "All calculations are estimates based on industry averages and user-provided inputs",
      "Results do not constitute financial, legal, or professional advice",
      "Actual results may vary significantly based on local market conditions",
      "Always verify calculations with qualified accountants and business advisors",
      "WashBizHub makes no guarantees regarding accuracy or suitability for any purpose",
    ],
  },
  valuation: {
    short: "Estimates Only. Valuation estimates are based on industry multiples and user inputs. Always obtain professional appraisals before buying or selling a business.",
    title: "Valuation Disclaimer",
    full: [
      "Valuations are estimates based on industry averages and SDE multiples",
      "Actual business values may vary significantly based on location, equipment, and market conditions",
      "These estimates do not replace professional business appraisals",
      "Always hire a certified business appraiser for transactions",
      "WashBizHub is not responsible for investment decisions based on these estimates",
    ],
  },
  investment: {
    short: "Not Investment Advice. Investment projections involve risk and are not guarantees. Past results do not predict future outcomes. Consult financial advisors before investing.",
    title: "Investment Disclaimer",
    full: [
      "Investment projections involve substantial risk and are not guarantees of future performance",
      "Past results and industry averages do not predict future outcomes",
      "Always conduct thorough due diligence before any business investment",
      "Consult with licensed financial advisors, attorneys, and accountants",
      "WashBizHub is not a licensed investment advisor and does not provide investment advice",
    ],
  },
  general: {
    short: "For Educational Purposes Only. Information provided does not constitute professional advice. Always consult qualified professionals for your specific situation.",
    title: "Disclaimer",
    full: [
      "All content is for educational and informational purposes only",
      "Information does not constitute financial, legal, or professional advice",
      "Always consult qualified professionals for your specific situation",
      "WashBizHub makes no guarantees regarding accuracy or completeness",
    ],
  },
};

export function LegalDisclaimer({ variant = "full", type = "general", className = "" }: LegalDisclaimerProps) {
  const content = DISCLAIMER_TEXT[type];

  if (variant === "inline") {
    return (
      <p 
        className={`text-xs text-muted-foreground flex items-start gap-1.5 ${className}`}
        data-testid={`text-inline-disclaimer-${type}`}
      >
        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>{content.short}</span>
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div 
        className={`flex items-start gap-2 text-xs text-foreground/80 dark:text-foreground/90 bg-amber-500/10 dark:bg-amber-500/15 p-3 rounded-lg border border-amber-500/20 ${className}`}
        data-testid={`box-compact-disclaimer-${type}`}
      >
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p>
          <strong>{content.title}:</strong> {content.short}
        </p>
      </div>
    );
  }

  return (
    <Card className={`border-amber-500/30 bg-amber-500/5 ${className}`} data-testid={`card-full-disclaimer-${type}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/20 p-3 rounded-full">
            <Shield className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {content.title}
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>This content is provided for educational and informational purposes only.</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {content.full.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p className="font-semibold text-foreground mt-4">
                When in doubt, consult a qualified professional.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CalculatorDisclaimer({ className }: { className?: string }) {
  return <LegalDisclaimer type="calculator" variant="compact" className={className} />;
}

export function ValuationDisclaimer({ className }: { className?: string }) {
  return <LegalDisclaimer type="valuation" variant="compact" className={className} />;
}

export function InvestmentDisclaimer({ className }: { className?: string }) {
  return <LegalDisclaimer type="investment" variant="compact" className={className} />;
}

export function ServiceDisclaimer({ className }: { className?: string }) {
  return <LegalDisclaimer type="service" variant="compact" className={className} />;
}
