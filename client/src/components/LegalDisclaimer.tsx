import { AlertTriangle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LegalDisclaimerProps {
  variant?: "compact" | "full";
  className?: string;
}

export function LegalDisclaimer({ variant = "full", className = "" }: LegalDisclaimerProps) {
  if (variant === "compact") {
    return (
      <div className={`flex items-start gap-2 text-xs text-foreground/80 dark:text-foreground/90 bg-amber-500/10 dark:bg-amber-500/15 p-3 rounded-lg border border-amber-500/20 ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Educational Content Only.</strong> Always consult a licensed professional technician before attempting repairs. 
          Working on commercial laundry equipment can be dangerous.
        </p>
      </div>
    );
  }

  return (
    <Card className={`border-amber-500/30 bg-amber-500/5 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/20 p-3 rounded-full">
            <Shield className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Important Safety Notice
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>This content is provided for educational and informational purposes only.</strong>
              </p>
              <p>
                Service Guy AI diagnostic information, repair guides, and troubleshooting steps are intended 
                to help you understand commercial laundry equipment issues. However:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Always consult a licensed, certified professional technician before attempting any repairs</li>
                <li>Working on commercial laundry equipment involves electrical, gas, and mechanical hazards</li>
                <li>Improper repairs can result in injury, death, property damage, or voided warranties</li>
                <li>Part numbers and specifications may vary by model and region - verify before ordering</li>
                <li>WashBizHub and Service Guy AI assume no liability for actions taken based on this information</li>
              </ul>
              <p className="font-semibold text-foreground mt-4">
                When in doubt, call a professional. Your safety is more important than any repair.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
