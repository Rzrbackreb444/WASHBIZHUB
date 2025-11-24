import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LegalDisclaimer() {
  return (
    <Alert className="border-yellow-600/50 bg-yellow-950/20 text-sm">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground">Important Disclaimer</p>
        <p>
          This CLEANBI score is for <strong>informational and educational purposes only</strong>. 
          It does NOT constitute professional business valuation, appraisal services, financial advice, 
          investment advice, legal advice, tax advice, or accounting advice.
        </p>
        <p>
          <strong>Limitations:</strong> Scores are estimates based on publicly available Google Places 
          data and may not reflect actual business performance. Not suitable for legal proceedings, 
          tax filings, M&A transactions, financial reporting, or regulatory compliance.
        </p>
        <p>
          <strong>Professional Advice Required:</strong> For official business valuations, engage a 
          certified business appraiser (ASA, CPA/ABV, CVA). Consult qualified professionals before 
          making business purchase, investment, or financial decisions.
        </p>
        <p>
          <strong>Liability:</strong> WashBizHub and its affiliates are not liable for any financial 
          losses or consequences arising from reliance on CLEANBI scores or reports.
        </p>
      </AlertDescription>
    </Alert>
  );
}
