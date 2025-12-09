import { useState } from "react";
import { MessageSquare, AlertTriangle, CheckCircle, TrendingDown, DollarSign, FileText, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NegotiationGuideProps {
  cleanbiScore: number;
  grade: string;
  factors: {
    name: string;
    score: number;
    category: string;
  }[];
  askingPrice?: number;
}

interface NegotiationPoint {
  issue: string;
  leverage: "high" | "medium" | "low";
  talkingPoint: string;
  targetReduction: number;
  evidence: string;
}

function generateNegotiationPoints(factors: NegotiationGuideProps['factors'], askingPrice: number): NegotiationPoint[] {
  const weakFactors = factors.filter(f => f.score < 60).sort((a, b) => a.score - b.score);
  const points: NegotiationPoint[] = [];
  
  weakFactors.slice(0, 8).forEach(factor => {
    let point: NegotiationPoint;
    
    if (factor.category === "Equipment") {
      point = {
        issue: `Equipment: ${factor.name} (Score: ${factor.score.toFixed(0)})`,
        leverage: factor.score < 40 ? "high" : "medium",
        talkingPoint: `The ${factor.name.toLowerCase()} indicates significant capital expenditure will be needed. Industry data shows equipment replacement costs of $3,000-8,000 per machine.`,
        targetReduction: Math.round(askingPrice * (0.05 + (60 - factor.score) / 1000)),
        evidence: "Request equipment manifest and maintenance records to verify condition."
      };
    } else if (factor.category === "Lease") {
      point = {
        issue: `Lease: ${factor.name} (Score: ${factor.score.toFixed(0)})`,
        leverage: "high",
        talkingPoint: `The ${factor.name.toLowerCase()} presents risk. Lease terms significantly impact valuation multiples - unfavorable terms typically reduce value by 10-20%.`,
        targetReduction: Math.round(askingPrice * 0.08),
        evidence: "Review lease agreement with attorney. Negotiate assignment terms."
      };
    } else if (factor.category === "Market" || factor.category === "Competition") {
      point = {
        issue: `Market: ${factor.name} (Score: ${factor.score.toFixed(0)})`,
        leverage: factor.score < 50 ? "high" : "medium",
        talkingPoint: `The competitive landscape shows ${factor.name.toLowerCase()} concerns. Higher competition typically means lower sustainable margins and revenue.`,
        targetReduction: Math.round(askingPrice * (0.03 + (60 - factor.score) / 2000)),
        evidence: "Document competitor locations, services, and pricing for comparison."
      };
    } else if (factor.category === "Financial") {
      point = {
        issue: `Financial: ${factor.name} (Score: ${factor.score.toFixed(0)})`,
        leverage: "high",
        talkingPoint: `The ${factor.name.toLowerCase()} is below industry benchmarks. This directly impacts NOI and therefore valuation.`,
        targetReduction: Math.round(askingPrice * 0.06),
        evidence: "Request 3 years of financials and verify utility/rent costs."
      };
    } else if (factor.category === "Location") {
      point = {
        issue: `Location: ${factor.name} (Score: ${factor.score.toFixed(0)})`,
        leverage: "medium",
        talkingPoint: `The ${factor.name.toLowerCase()} is suboptimal. Location factors are difficult to change and represent permanent value constraints.`,
        targetReduction: Math.round(askingPrice * 0.04),
        evidence: "Conduct traffic study and verify walk score data."
      };
    } else {
      point = {
        issue: `${factor.category}: ${factor.name} (Score: ${factor.score.toFixed(0)})`,
        leverage: "low",
        talkingPoint: `The ${factor.name.toLowerCase()} score indicates room for improvement but also represents upside potential with proper management.`,
        targetReduction: Math.round(askingPrice * 0.02),
        evidence: "Document current state for post-acquisition improvement planning."
      };
    }
    
    points.push(point);
  });
  
  return points;
}

export function NegotiationGuide({ 
  cleanbiScore, 
  grade, 
  factors,
  askingPrice = 300000 
}: NegotiationGuideProps) {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const negotiationPoints = generateNegotiationPoints(factors, askingPrice);
  const totalPotentialReduction = negotiationPoints.reduce((sum, p) => sum + p.targetReduction, 0);
  const targetPrice = askingPrice - totalPotentialReduction;
  
  const highLeverageCount = negotiationPoints.filter(p => p.leverage === "high").length;
  const negotiatingPosition = highLeverageCount >= 3 ? "Strong" : highLeverageCount >= 1 ? "Moderate" : "Limited";
  
  const copyTalkingPoint = async (index: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied",
        description: "Talking point copied to clipboard."
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };
  
  const copyAllPoints = async () => {
    const allPoints = negotiationPoints.map((p, i) => 
      `${i + 1}. ${p.issue}\n   Talking Point: ${p.talkingPoint}\n   Evidence: ${p.evidence}\n   Target Reduction: $${p.targetReduction.toLocaleString()}`
    ).join("\n\n");
    
    const summary = `NEGOTIATION GUIDE FOR: ${grade} Grade Location (Score: ${cleanbiScore.toFixed(1)})\n\nAsking Price: $${askingPrice.toLocaleString()}\nTarget Price: $${targetPrice.toLocaleString()}\nPotential Savings: $${totalPotentialReduction.toLocaleString()}\n\n${allPoints}`;
    
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Copied All Points",
        description: "Complete negotiation guide copied to clipboard."
      });
    } catch {
      toast({
        title: "Copy Failed",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              Negotiation Guide
            </CardTitle>
            <CardDescription>
              Leverage points based on CLEANBI analysis weaknesses
            </CardDescription>
          </div>
          <Badge className={cn(
            negotiatingPosition === "Strong" ? "bg-green-500" :
            negotiatingPosition === "Moderate" ? "bg-amber-500" : "bg-blue-500"
          )}>
            {negotiatingPosition} Position
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Asking Price</p>
            <p className="text-lg font-bold">${askingPrice.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Target Price</p>
            <p className="text-lg font-bold text-green-600">${targetPrice.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Potential Savings</p>
            <p className="text-lg font-bold text-amber-600">${totalPotentialReduction.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={copyAllPoints}>
            <FileText className="h-4 w-4 mr-1" />
            Copy All Points
          </Button>
        </div>
        
        <Accordion type="multiple" className="space-y-2">
          {negotiationPoints.map((point, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className={cn(
                "border rounded-lg px-4",
                point.leverage === "high" ? "border-red-200 bg-red-500/5" :
                point.leverage === "medium" ? "border-amber-200 bg-amber-500/5" :
                "border-blue-200 bg-blue-500/5"
              )}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <AlertTriangle className={cn(
                    "h-4 w-4",
                    point.leverage === "high" ? "text-red-500" :
                    point.leverage === "medium" ? "text-amber-500" : "text-blue-500"
                  )} />
                  <div>
                    <p className="font-medium">{point.issue}</p>
                    <p className="text-xs text-muted-foreground">
                      Leverage: {point.leverage.charAt(0).toUpperCase() + point.leverage.slice(1)} | 
                      Target Reduction: ${point.targetReduction.toLocaleString()}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <div className="p-3 bg-background rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium mb-1">Talking Point:</p>
                      <p className="text-sm text-muted-foreground">{point.talkingPoint}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyTalkingPoint(index, point.talkingPoint)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Evidence to Gather: </span>
                    <span className="text-muted-foreground">{point.evidence}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    Target Reduction: ${point.targetReduction.toLocaleString()}
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-200">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            Negotiation Tips
          </h4>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Present concerns professionally - sellers respond better to data-driven discussions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Don't reveal all issues at once - use strongest points strategically
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Consider asking for seller financing or equipment warranties instead of price reductions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Always have your walkaway price determined before negotiations
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default NegotiationGuide;
