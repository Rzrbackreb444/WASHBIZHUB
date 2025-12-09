import { useState, useMemo } from "react";
import { Landmark, CheckCircle, XCircle, AlertTriangle, Calculator, Info, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SBALoanCheckerProps {
  cleanbiScore: number;
  grade: string;
  estimatedRevenue?: number;
  estimatedNOI?: number;
}

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  weight: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function SBALoanChecker({ 
  cleanbiScore, 
  grade,
  estimatedRevenue = 250000,
  estimatedNOI = 62500
}: SBALoanCheckerProps) {
  const [purchasePrice, setPurchasePrice] = useState(300000);
  const [downPayment, setDownPayment] = useState(10);
  const [creditScore, setCreditScore] = useState(700);
  const [yearsExperience, setYearsExperience] = useState(2);
  const [hasCollateral, setHasCollateral] = useState(true);
  const [hasBusinessPlan, setHasBusinessPlan] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  const loanAmount = purchasePrice * (1 - downPayment / 100);
  const downPaymentAmount = purchasePrice * (downPayment / 100);
  const interestRate = 0.08;
  const loanTermYears = 10;
  const monthlyPayment = (loanAmount * (interestRate / 12)) / (1 - Math.pow(1 + interestRate / 12, -loanTermYears * 12));
  const annualDebtService = monthlyPayment * 12;
  const dscr = estimatedNOI / annualDebtService;
  
  const checks = useMemo<CheckResult[]>(() => {
    const results: CheckResult[] = [];
    
    results.push({
      name: "Credit Score",
      status: creditScore >= 680 ? "pass" : creditScore >= 650 ? "warning" : "fail",
      message: creditScore >= 680 
        ? `${creditScore} exceeds SBA minimum (680+)`
        : creditScore >= 650 
        ? `${creditScore} may require additional documentation`
        : `${creditScore} below SBA minimum (680+)`,
      weight: 20
    });
    
    results.push({
      name: "Debt Service Coverage",
      status: dscr >= 1.25 ? "pass" : dscr >= 1.0 ? "warning" : "fail",
      message: dscr >= 1.25 
        ? `DSCR of ${dscr.toFixed(2)}x exceeds requirement (1.25x)`
        : dscr >= 1.0 
        ? `DSCR of ${dscr.toFixed(2)}x is borderline`
        : `DSCR of ${dscr.toFixed(2)}x below requirement`,
      weight: 25
    });
    
    results.push({
      name: "Down Payment",
      status: downPayment >= 10 ? "pass" : downPayment >= 5 ? "warning" : "fail",
      message: downPayment >= 10 
        ? `${downPayment}% meets SBA 7(a) requirement`
        : `${downPayment}% may require SBA Express or other program`,
      weight: 15
    });
    
    results.push({
      name: "Industry Experience",
      status: yearsExperience >= 2 ? "pass" : yearsExperience >= 1 ? "warning" : "fail",
      message: yearsExperience >= 2 
        ? `${yearsExperience}+ years experience is strong`
        : yearsExperience >= 1 
        ? "Limited experience - may need partner or training"
        : "No experience - consider franchise or consulting support",
      weight: 15
    });
    
    results.push({
      name: "Collateral",
      status: hasCollateral ? "pass" : "warning",
      message: hasCollateral 
        ? "Adequate collateral available"
        : "Limited collateral - may affect terms",
      weight: 10
    });
    
    results.push({
      name: "Business Plan",
      status: hasBusinessPlan ? "pass" : "fail",
      message: hasBusinessPlan 
        ? "Business plan prepared"
        : "Business plan required for SBA approval",
      weight: 10
    });
    
    results.push({
      name: "Location Quality",
      status: cleanbiScore >= 70 ? "pass" : cleanbiScore >= 55 ? "warning" : "fail",
      message: cleanbiScore >= 70 
        ? `CLEANBI ${grade} grade demonstrates strong location`
        : cleanbiScore >= 55 
        ? `CLEANBI ${grade} grade - lender may request additional justification`
        : `CLEANBI score ${cleanbiScore} may concern lenders`,
      weight: 5
    });
    
    return results;
  }, [creditScore, dscr, downPayment, yearsExperience, hasCollateral, hasBusinessPlan, cleanbiScore, grade]);
  
  const overallScore = checks.reduce((sum, check) => {
    const score = check.status === "pass" ? 100 : check.status === "warning" ? 60 : 0;
    return sum + (score * check.weight / 100);
  }, 0);
  
  const passCount = checks.filter(c => c.status === "pass").length;
  const warningCount = checks.filter(c => c.status === "warning").length;
  const failCount = checks.filter(c => c.status === "fail").length;
  
  const approvalLikelihood = overallScore >= 80 ? "High" : overallScore >= 60 ? "Moderate" : "Low";
  const approvalColor = overallScore >= 80 ? "text-green-600" : overallScore >= 60 ? "text-amber-600" : "text-red-600";
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-500" />
              SBA Loan Pre-Qualification
            </CardTitle>
            <CardDescription>
              Check your eligibility for SBA 7(a) financing
            </CardDescription>
          </div>
          <Badge className={cn("text-lg px-3", approvalColor)}>
            {approvalLikelihood} Likelihood
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Purchase Price
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Total acquisition cost including equipment</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              data-testid="input-purchase-price"
            />
          </div>
          <div className="space-y-2">
            <Label>Down Payment: {downPayment}%</Label>
            <Slider
              value={[downPayment]}
              onValueChange={([v]) => setDownPayment(v)}
              min={5}
              max={30}
              step={1}
            />
            <p className="text-xs text-muted-foreground">{formatCurrency(downPaymentAmount)}</p>
          </div>
          <div className="space-y-2">
            <Label>Credit Score: {creditScore}</Label>
            <Slider
              value={[creditScore]}
              onValueChange={([v]) => setCreditScore(v)}
              min={500}
              max={850}
              step={10}
            />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Years Experience: {yearsExperience}</Label>
            <Slider
              value={[yearsExperience]}
              onValueChange={([v]) => setYearsExperience(v)}
              min={0}
              max={10}
              step={1}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="collateral">Have Collateral?</Label>
            <Switch
              id="collateral"
              checked={hasCollateral}
              onCheckedChange={setHasCollateral}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="bizplan">Business Plan Ready?</Label>
            <Switch
              id="bizplan"
              checked={hasBusinessPlan}
              onCheckedChange={setHasBusinessPlan}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Loan Amount</p>
            <p className="text-lg font-bold">{formatCurrency(loanAmount)}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Monthly Payment</p>
            <p className="text-lg font-bold">{formatCurrency(monthlyPayment)}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">DSCR</p>
            <p className={cn("text-lg font-bold", dscr >= 1.25 ? "text-green-600" : dscr >= 1.0 ? "text-amber-600" : "text-red-600")}>
              {dscr.toFixed(2)}x
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Qualification Score</p>
            <p className={cn("text-lg font-bold", approvalColor)}>{overallScore.toFixed(0)}%</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Qualification</span>
            <div className="flex items-center gap-2">
              <span className="text-green-600">{passCount} Pass</span>
              <span className="text-amber-600">{warningCount} Warning</span>
              <span className="text-red-600">{failCount} Fail</span>
            </div>
          </div>
          <Progress value={overallScore} className="h-3" />
        </div>
        
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide" : "Show"} Detailed Requirements
        </Button>
        
        {showDetails && (
          <div className="space-y-3">
            {checks.map((check) => (
              <div 
                key={check.name}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  check.status === "pass" ? "bg-green-500/5 border-green-200" :
                  check.status === "warning" ? "bg-amber-500/5 border-amber-200" :
                  "bg-red-500/5 border-red-200"
                )}
              >
                {check.status === "pass" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : check.status === "warning" ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="p-4 bg-blue-500/10 rounded-lg">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4" />
            Loan Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Program:</span>
              <span className="ml-2 font-medium">SBA 7(a)</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rate:</span>
              <span className="ml-2 font-medium">{(interestRate * 100).toFixed(1)}% (Prime + 2.75%)</span>
            </div>
            <div>
              <span className="text-muted-foreground">Term:</span>
              <span className="ml-2 font-medium">{loanTermYears} years</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Interest:</span>
              <span className="ml-2 font-medium">{formatCurrency((monthlyPayment * loanTermYears * 12) - loanAmount)}</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          This is an estimate only. Actual SBA approval depends on lender review and complete documentation.
          Rates and terms subject to change.
        </p>
      </CardContent>
    </Card>
  );
}

export default SBALoanChecker;
