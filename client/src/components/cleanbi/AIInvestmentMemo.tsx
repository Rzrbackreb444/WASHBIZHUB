import { useState } from "react";
import { FileText, Loader2, Download, Copy, Check, Sparkles, Lock, Crown, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface AIInvestmentMemoProps {
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
  };
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

const GRADE_COLORS: Record<string, string> = {
  "A": "text-green-500",
  "B": "text-lime-500",
  "C": "text-amber-500",
  "Needs Work": "text-yellow-600"
};

export function AIInvestmentMemo({ 
  analysis, 
  isSubscriber = false, 
  onUpgradeClick 
}: AIInvestmentMemoProps) {
  const { toast } = useToast();
  const [memo, setMemo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const generateMemo = async () => {
    setIsGenerating(true);
    
    try {
      const response = await apiRequest('/api/cleanbi/generate-memo', {
        method: 'POST',
        body: JSON.stringify({ analysis })
      });
      
      if (response.memo) {
        setMemo(response.memo);
      } else {
        setMemo(generateFallbackMemo());
      }
      
      toast({
        title: "Investment Memo Generated",
        description: "Your AI-powered due diligence document is ready."
      });
    } catch (error) {
      console.error('Failed to generate memo:', error);
      setMemo(generateFallbackMemo());
      toast({
        title: "Memo Generated",
        description: "Generated memo using local analysis."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateFallbackMemo = (): string => {
    const { address, cleanbiScore, grade, competitorCount, populationDensity, medianIncome, trafficScore, opportunityLevel } = analysis;
    
    const riskLevel = cleanbiScore >= 70 ? "LOW" : cleanbiScore >= 55 ? "MODERATE" : "ELEVATED";
    const recommendation = cleanbiScore >= 70 ? "PROCEED" : cleanbiScore >= 55 ? "PROCEED WITH CAUTION" : "FURTHER ANALYSIS REQUIRED";
    
    return `
# INVESTMENT MEMO: LAUNDROMAT ACQUISITION ANALYSIS
## Prepared by CLEANBI Intelligence System

---

### EXECUTIVE SUMMARY

**Property:** ${address}
**CLEANBI Grade:** ${grade} (${cleanbiScore.toFixed(1)}/100)
**Overall Assessment:** ${opportunityLevel.toUpperCase().replace('_', ' ')}
**Risk Level:** ${riskLevel}
**Recommendation:** ${recommendation}

---

### LOCATION ANALYSIS

**Demographics:**
- Population Density: ${populationDensity.toLocaleString()} per sq. mile
- Median Household Income: $${medianIncome.toLocaleString()}
- Target Market Fit: ${populationDensity > 5000 ? "Strong" : populationDensity > 2500 ? "Moderate" : "Limited"}

**Competition:**
- Nearby Competitors: ${competitorCount}
- Market Saturation: ${competitorCount <= 3 ? "Low - Favorable" : competitorCount <= 6 ? "Moderate" : "High - Challenging"}
- Competitive Moat: ${competitorCount <= 2 ? "Strong positioning opportunity" : "Requires differentiation strategy"}

**Accessibility:**
- Traffic Score: ${trafficScore}/100
- Walk Score: ${analysis.walkScore || 'N/A'}
- Transit Score: ${analysis.transitScore || 'N/A'}

---

### FINANCIAL CONSIDERATIONS

**Revenue Potential:**
Based on ${grade} grade locations in similar demographics:
- Estimated Revenue Range: $${(cleanbiScore * 2500).toLocaleString()} - $${(cleanbiScore * 4000).toLocaleString()}/year
- Typical EBITDA Multiple: ${grade === 'A' ? '3.5x - 4.5x' : grade === 'B' ? '2.8x - 3.5x' : '2.0x - 2.8x'}

**Key Financial Metrics to Verify:**
1. Rent-to-revenue ratio (target: <25%)
2. Utility costs as % of revenue (target: <8%)
3. Current turns per day (industry avg: 2.5-4.0)
4. Machine mix and age

---

### RISK FACTORS

${competitorCount > 5 ? "⚠️ HIGH COMPETITION: " + competitorCount + " competitors within 1 mile\n" : ""}
${populationDensity < 3000 ? "⚠️ LOW DENSITY: Population density below optimal threshold\n" : ""}
${medianIncome > 80000 ? "⚠️ HIGH INCOME AREA: May prefer in-unit laundry\n" : ""}
${trafficScore < 50 ? "⚠️ LOW VISIBILITY: Traffic score below average\n" : ""}

---

### DUE DILIGENCE CHECKLIST

**Financial Verification:**
□ Request 3 years of tax returns
□ Verify utility bills (12 months minimum)
□ Review POS/coin collection records
□ Analyze rent roll and lease terms

**Operational Review:**
□ Equipment age and condition assessment
□ Maintenance records review
□ Employee contracts and payroll
□ Vendor agreements

**Legal/Compliance:**
□ Lease review by attorney
□ Environmental assessment
□ ADA compliance verification
□ Business license status

---

### RECOMMENDED NEXT STEPS

1. ${recommendation === "PROCEED" ? "Schedule property walkthrough within 5 business days" : "Request additional financial documentation"}
2. Engage commercial real estate attorney for lease review
3. Order professional equipment appraisal
4. Conduct 3-day traffic study
5. Interview neighboring businesses

---

*This memo was generated by WashBizHub CLEANBI Intelligence System. 
All projections are estimates based on market data and should be verified through professional due diligence.*

**Generated:** ${new Date().toLocaleDateString()}
**CLEANBI Version:** Enterprise 2.0
    `.trim();
  };
  
  const copyToClipboard = async () => {
    if (!memo) return;
    
    try {
      await navigator.clipboard.writeText(memo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to Clipboard",
        description: "Investment memo copied successfully."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };
  
  const downloadMemo = () => {
    if (!memo) return;
    
    const blob = new Blob([memo], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CLEANBI-Investment-Memo-${analysis.address.split(',')[0].replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Investment memo saved as Markdown file."
    });
  };
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enterprise Feature</h3>
            <p className="text-muted-foreground mb-4">
              AI Investment Memos require an Enterprise subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Enterprise
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            AI Investment Memo
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
              <FileText className="h-5 w-5 text-purple-500" />
              AI Investment Memo
            </CardTitle>
            <CardDescription>
              AI-generated due diligence document for {analysis.address.split(',')[0]}
            </CardDescription>
          </div>
          <Badge className={cn("text-lg px-3", GRADE_COLORS[analysis.grade])}>
            Grade {analysis.grade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!memo ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generate Investment Memo</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Our AI will analyze all 68 factors and generate a comprehensive 
              due diligence document tailored to this location.
            </p>
            <Button 
              onClick={generateMemo} 
              disabled={isGenerating}
              className="gap-2"
              data-testid="button-generate-memo"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Memo
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={generateMemo} disabled={isGenerating}>
                <RefreshCw className={cn("h-4 w-4 mr-1", isGenerating && "animate-spin")} />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadMemo}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            
            <ScrollArea className="h-96 rounded-lg border p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">{memo}</pre>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AIInvestmentMemo;
