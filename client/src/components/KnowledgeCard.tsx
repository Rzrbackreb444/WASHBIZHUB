import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lightbulb, 
  ShoppingCart,
  Wrench,
  Zap,
  Shield,
  BookOpen,
  ThumbsUp,
  ExternalLink,
  Database,
  Brain,
  HardDrive
} from "lucide-react";

interface Part {
  partNumber: string;
  name: string;
  estimatedPrice?: string;
  supplier?: string;
}

interface KnowledgeData {
  title: string;
  manufacturer: string;
  errorCode?: string;
  machineType?: string;
  modelSeries?: string;
  description: string;
  possibleCauses?: string[];
  troubleshootingSteps?: string[];
  safetyWarnings?: string[];
  requiredTools?: string[];
  partsWithPricing?: Part[];
  quickFix?: string;
  estimatedRepairTime?: number;
  skillLevel?: "basic" | "intermediate" | "professional";
  testModeEntry?: string;
  proTips?: string[];
  commonMistakes?: string[];
  whenToCallPro?: string[];
  confidence?: number;
}

interface KnowledgeCardProps {
  knowledge: KnowledgeData;
  source?: "cache" | "database" | "diagnostic_codes" | "grok_search";
  learned?: boolean;
  userTier?: string;
  onOrderPart?: (part: Part) => void;
}

const AMAZON_AFFILIATE_TAG = "nicholaskreme-20";

export function KnowledgeCard({ 
  knowledge, 
  source, 
  learned, 
  userTier = "free",
  onOrderPart 
}: KnowledgeCardProps) {
  const skillColors = {
    basic: "bg-green-100 text-green-800 border-green-200",
    intermediate: "bg-amber-100 text-amber-800 border-amber-200",
    professional: "bg-red-100 text-red-800 border-red-200",
  };

  const sourceIcons = {
    cache: HardDrive,
    database: Database,
    diagnostic_codes: BookOpen,
    grok_search: Brain,
  };

  const SourceIcon = source ? sourceIcons[source] || Database : Database;

  const generateAmazonLink = (part: Part) => {
    const searchQuery = encodeURIComponent(`${knowledge.manufacturer} ${part.partNumber} ${part.name}`);
    return `https://www.amazon.com/s?k=${searchQuery}&tag=${AMAZON_AFFILIATE_TAG}`;
  };

  const isPro = userTier === "pro" || userTier === "enterprise";
  const isStarter = userTier === "starter" || isPro;

  return (
    <Card className="bg-card border shadow-sm overflow-hidden" data-testid="knowledge-card">
      <div className="h-1 bg-[#C8A661]" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
              <Wrench className="h-6 w-6 text-[#C8A661]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground" data-testid="knowledge-title">
                {knowledge.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {knowledge.manufacturer}
                </Badge>
                {knowledge.errorCode && (
                  <Badge className="bg-[#0A1628] text-white text-xs">
                    {knowledge.errorCode}
                  </Badge>
                )}
                {knowledge.machineType && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {knowledge.machineType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {knowledge.skillLevel && (
              <Badge className={`${skillColors[knowledge.skillLevel]} text-xs`}>
                {knowledge.skillLevel.charAt(0).toUpperCase() + knowledge.skillLevel.slice(1)}
              </Badge>
            )}
            {knowledge.confidence && (
              <Badge variant="outline" className="text-xs border-[#C8A661]/40 text-[#C8A661]">
                {knowledge.confidence}% confidence
              </Badge>
            )}
            {source && (
              <Badge variant="outline" className="text-xs">
                <SourceIcon className="w-3 h-3 mr-1" />
                {source.replace("_", " ")}
              </Badge>
            )}
            {learned && (
              <Badge className="bg-green-600 text-white text-xs">
                <Brain className="w-3 h-3 mr-1" />
                Learned
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-muted-foreground" data-testid="knowledge-description">
          {knowledge.description}
        </p>

        {knowledge.quickFix && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-400">Quick Fix</span>
            </div>
            <p className="text-green-700 dark:text-green-300" data-testid="knowledge-quickfix">
              {knowledge.quickFix}
            </p>
          </div>
        )}

        {knowledge.safetyWarnings && knowledge.safetyWarnings.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800 dark:text-red-400">Safety Warnings</span>
            </div>
            <ul className="space-y-1">
              {knowledge.safetyWarnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2 text-red-700 dark:text-red-300 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {knowledge.possibleCauses && knowledge.possibleCauses.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#C8A661]" />
              Possible Causes
            </h4>
            <ul className="space-y-2">
              {knowledge.possibleCauses.slice(0, isStarter ? undefined : 2).map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                  <span className="h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center text-xs font-medium shrink-0">
                    {i + 1}
                  </span>
                  {cause}
                </li>
              ))}
              {!isStarter && knowledge.possibleCauses.length > 2 && (
                <li className="text-muted-foreground/60 text-sm italic pl-7">
                  +{knowledge.possibleCauses.length - 2} more causes (Upgrade to see all)
                </li>
              )}
            </ul>
          </div>
        )}

        {knowledge.troubleshootingSteps && knowledge.troubleshootingSteps.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#C8A661]" />
              Troubleshooting Steps
            </h4>
            <ol className="space-y-3">
              {knowledge.troubleshootingSteps.slice(0, isPro ? undefined : isStarter ? 3 : 1).map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="h-6 w-6 rounded-full bg-[#0A1628] text-[#C8A661] flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-foreground pt-0.5">{step}</span>
                </li>
              ))}
              {!isPro && knowledge.troubleshootingSteps.length > (isStarter ? 3 : 1) && (
                <li className="text-muted-foreground/60 text-sm italic pl-9">
                  +{knowledge.troubleshootingSteps.length - (isStarter ? 3 : 1)} more steps (Upgrade to Pro for full access)
                </li>
              )}
            </ol>
          </div>
        )}

        {knowledge.partsWithPricing && knowledge.partsWithPricing.length > 0 && isPro && (
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#C8A661]" />
              Parts & Pricing
            </h4>
            <div className="grid gap-2">
              {knowledge.partsWithPricing.map((part, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between bg-muted/30 rounded-lg p-3 gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{part.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Part #: {part.partNumber}
                      {part.supplier && ` • ${part.supplier}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {part.estimatedPrice && (
                      <span className="font-bold text-[#C8A661]">{part.estimatedPrice}</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => window.open(generateAmazonLink(part), '_blank')}
                      data-testid={`order-part-${i}`}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Affiliate links support WashBizHub at no extra cost to you
            </p>
          </div>
        )}

        {knowledge.proTips && knowledge.proTips.length > 0 && isPro && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-800 dark:text-amber-400">Pro Tips</span>
            </div>
            <ul className="space-y-1">
              {knowledge.proTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-700 dark:text-amber-300 text-sm">
                  <ThumbsUp className="h-4 w-4 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {knowledge.estimatedRepairTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                ~{knowledge.estimatedRepairTime} min
              </span>
            )}
            {knowledge.requiredTools && knowledge.requiredTools.length > 0 && (
              <span className="flex items-center gap-1">
                <Wrench className="h-4 w-4" />
                {knowledge.requiredTools.length} tools needed
              </span>
            )}
          </div>
          
          {!isPro && (
            <Button 
              size="sm" 
              className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
              data-testid="upgrade-cta"
            >
              Upgrade for Full Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function KnowledgeCardSkeleton() {
  return (
    <Card className="bg-card border shadow-sm overflow-hidden">
      <div className="h-1 bg-muted animate-pulse" />
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
