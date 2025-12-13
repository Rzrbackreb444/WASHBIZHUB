import { usePremiumGating } from "@/hooks/usePremiumGating";
import { PremiumGate } from "@/components/PremiumGate";
import { ResultsToolbar } from "@/components/ResultsToolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PremiumResultsSummary {
  headline: string;
  metrics: { label: string; value: string }[];
}

export interface PremiumResultsProps {
  children: React.ReactNode;
  featureName: string;
  analysisType: string;
  title: string;
  data: Record<string, any>;
  summary?: PremiumResultsSummary;
  previewPercent?: number;
  benefits?: string[];
  className?: string;
  showToolbar?: boolean;
  showTitle?: boolean;
  cardWrapper?: boolean;
}

const DEFAULT_BENEFITS = [
  "Full access to all calculation results",
  "Export to PDF and Google Sheets",
  "Save analyses to your dashboard",
  "Professional sharing options",
];

export function PremiumResults({
  children,
  featureName,
  analysisType,
  title,
  data,
  summary,
  previewPercent = 30,
  benefits = DEFAULT_BENEFITS,
  className,
  showToolbar = true,
  showTitle = true,
  cardWrapper = true,
}: PremiumResultsProps) {
  const { isPremium, isLoading, canAccessFeature } = usePremiumGating();
  
  const hasAccess = canAccessFeature(featureName);

  if (isLoading) {
    return (
      <div 
        className={cn("space-y-4", className)}
        data-testid="premium-results-loading"
      >
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const toolbarSection = showToolbar && (
    <ResultsToolbar
      analysisType={analysisType}
      title={title}
      data={data}
      summary={summary}
      isPremiumFeature={!hasAccess}
      className="mb-4"
    />
  );

  const titleSection = showTitle && (
    <div 
      className="flex items-center justify-between gap-4 mb-6"
      data-testid="premium-results-header"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-[#C8A661]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {summary?.headline && (
            <p className="text-sm text-muted-foreground">{summary.headline}</p>
          )}
        </div>
      </div>
      {isPremium && (
        <Badge 
          className="bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30"
          data-testid="premium-results-badge"
        >
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      )}
    </div>
  );

  const content = (
    <div 
      className={cn("space-y-4", className)}
      data-testid="premium-results-container"
    >
      {toolbarSection}
      
      {hasAccess ? (
        <div data-testid="premium-results-content">
          {titleSection}
          {children}
        </div>
      ) : (
        <PremiumGate
          featureName={featureName}
          previewPercent={previewPercent}
          benefits={benefits}
          title={`Unlock Full ${title}`}
          description="Get complete insights and professional export options"
          data-testid="premium-results-gate"
        >
          {titleSection}
          {children}
        </PremiumGate>
      )}
    </div>
  );

  if (cardWrapper) {
    return (
      <Card 
        className="bg-card border shadow-sm overflow-hidden"
        data-testid="premium-results-card"
      >
        <div className="h-1 bg-[#C8A661]" />
        <CardContent className="p-6 md:p-8">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}

export function withPremiumEnhancements<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: {
    featureName: string;
    analysisType: string;
    title: string;
    previewPercent?: number;
    benefits?: string[];
  }
) {
  return function EnhancedComponent(
    props: P & { 
      data: Record<string, any>; 
      summary?: PremiumResultsSummary;
    }
  ) {
    const { data, summary, ...restProps } = props;
    
    return (
      <PremiumResults
        featureName={config.featureName}
        analysisType={config.analysisType}
        title={config.title}
        data={data}
        summary={summary}
        previewPercent={config.previewPercent}
        benefits={config.benefits}
      >
        <WrappedComponent {...(restProps as P)} data={data} summary={summary} />
      </PremiumResults>
    );
  };
}

export function PremiumResultsSection({
  children,
  featureName,
  analysisType,
  title,
  data,
  summary,
  previewPercent = 30,
  benefits = DEFAULT_BENEFITS,
  className,
}: Omit<PremiumResultsProps, 'showToolbar' | 'showTitle' | 'cardWrapper'>) {
  return (
    <PremiumResults
      featureName={featureName}
      analysisType={analysisType}
      title={title}
      data={data}
      summary={summary}
      previewPercent={previewPercent}
      benefits={benefits}
      className={className}
      showToolbar={true}
      showTitle={true}
      cardWrapper={false}
    >
      {children}
    </PremiumResults>
  );
}

export default PremiumResults;
