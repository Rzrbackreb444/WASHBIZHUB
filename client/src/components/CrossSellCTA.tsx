import { Link } from "wouter";
import { 
  DollarSign, 
  MapPin, 
  Calculator, 
  Store,
  ArrowRight,
  type LucideIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTAContext = "cleanbi" | "funding" | "marketplace" | "calculator";
type CTAVariant = "inline" | "card" | "banner";

interface CrossSellCTAProps {
  context: CTAContext;
  variant?: CTAVariant;
  className?: string;
}

interface CTAConfig {
  icon: LucideIcon;
  headline: string;
  description: string;
  buttonText: string;
  link: string;
}

const CTA_CONFIGS: Record<CTAContext, CTAConfig> = {
  cleanbi: {
    icon: DollarSign,
    headline: "Get Funding for This Location",
    description: "Ready to move forward? Match with lenders who specialize in laundromat acquisitions.",
    buttonText: "Explore Funding Options",
    link: "/funding"
  },
  funding: {
    icon: MapPin,
    headline: "Analyze Your Target Location with CLEANBI",
    description: "Get a comprehensive location score before you commit. Know exactly what you're buying into.",
    buttonText: "Run Location Analysis",
    link: "/cleanbi-explorer"
  },
  marketplace: {
    icon: Calculator,
    headline: "Calculate ROI Before You Buy",
    description: "Crunch the numbers with our professional-grade calculators. Make data-driven decisions.",
    buttonText: "Open Calculators",
    link: "/calculators"
  },
  calculator: {
    icon: Store,
    headline: "Find Laundromats For Sale",
    description: "Browse verified listings and find your next opportunity. New locations added daily.",
    buttonText: "Browse Listings",
    link: "/buy-laundromat"
  }
};

function InlineVariant({ config, context }: { config: CTAConfig; context: CTAContext }) {
  const Icon = config.icon;
  
  return (
    <div 
      className="flex items-center gap-4 py-3 px-4 rounded-lg bg-accent/10 border border-accent/20"
      data-testid={`crosssell-inline-${context}`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{config.headline}</p>
        <p className="text-xs text-muted-foreground truncate">{config.description}</p>
      </div>
      <Link href={config.link}>
        <Button 
          size="sm" 
          className="bg-accent text-accent-foreground flex-shrink-0"
          data-testid={`crosssell-inline-button-${context}`}
        >
          {config.buttonText}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}

function CardVariant({ config, context }: { config: CTAConfig; context: CTAContext }) {
  const Icon = config.icon;
  
  return (
    <Card 
      className="overflow-visible border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 hover-elevate"
      data-testid={`crosssell-card-${context}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
            <Icon className="w-7 h-7 text-accent" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground">{config.headline}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{config.description}</p>
          </div>
          <Link href={config.link} className="w-full">
            <Button 
              className="w-full bg-accent text-accent-foreground"
              data-testid={`crosssell-card-button-${context}`}
            >
              {config.buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function BannerVariant({ config, context }: { config: CTAConfig; context: CTAContext }) {
  const Icon = config.icon;
  
  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-accent/15 via-accent/10 to-accent/5 border border-accent/20 p-6"
      data-testid={`crosssell-banner-${context}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground mb-1">{config.headline}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Link href={config.link} className="flex-shrink-0 w-full sm:w-auto">
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-accent text-accent-foreground"
            data-testid={`crosssell-banner-button-${context}`}
          >
            {config.buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function CrossSellCTA({ context, variant = "card", className }: CrossSellCTAProps) {
  const config = CTA_CONFIGS[context];
  
  if (!config) {
    console.warn(`CrossSellCTA: Unknown context "${context}"`);
    return null;
  }
  
  return (
    <div className={cn("w-full", className)} data-testid={`crosssell-cta-${context}`}>
      {variant === "inline" && <InlineVariant config={config} context={context} />}
      {variant === "card" && <CardVariant config={config} context={context} />}
      {variant === "banner" && <BannerVariant config={config} context={context} />}
    </div>
  );
}

export type { CTAContext, CTAVariant, CrossSellCTAProps };
