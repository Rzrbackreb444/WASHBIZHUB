import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Target, BarChart3, DollarSign, Zap } from "lucide-react";

interface AdvertisementProps {
  placement: "header" | "banner" | "sidebar" | "footer" | "inline" | "compact";
  className?: string;
}

export function Advertisement({ placement, className = "" }: AdvertisementProps) {
  // Different ad content based on placement
  const ads = {
    header: {
      title: "List Your Laundromat",
      description: "Sell faster with our 72,000+ buyer network",
      cta: "List Now - Free",
      link: "/listings/create",
      bgClass: "bg-gradient-to-r from-primary/10 to-accent/10",
      icon: Target
    },
    banner: {
      title: "List Your Laundromat",
      description: "Sell faster with our 72,000+ buyer network",
      cta: "List Now - Free",
      link: "/listings/create",
      bgClass: "bg-gradient-to-r from-primary/10 to-accent/10",
      icon: Target
    },
    sidebar: {
      title: "CLEANBI™ Valuation",
      description: "Get your laundromat's market value in 60 seconds",
      cta: "Calculate Value",
      link: "/cleanbi",
      bgClass: "bg-gradient-to-br from-primary/5 to-accent/5",
      icon: BarChart3
    },
    footer: {
      title: "20% Affiliate Commission",
      description: "Earn commissions on every equipment sale you refer",
      cta: "Join Affiliate Program",
      link: "/affiliate",
      bgClass: "bg-gradient-to-r from-accent/10 to-primary/10",
      icon: DollarSign
    },
    inline: {
      title: "Pro Subscription",
      description: "Unlock advanced analytics, AI consultant, and priority support",
      cta: "Upgrade to Pro",
      link: "/subscribe",
      bgClass: "bg-gradient-to-r from-primary/10 to-accent/10",
      icon: Zap
    },
    compact: {
      title: "Pro Subscription",
      description: "Unlock advanced analytics, AI consultant, and priority support",
      cta: "Upgrade to Pro",
      link: "/subscribe",
      bgClass: "bg-gradient-to-r from-primary/10 to-accent/10",
      icon: Zap
    }
  };

  const ad = ads[placement];

  const Icon = ad.icon;

  // Compact version for header
  if (placement === "header" || placement === "compact") {
    return (
      <a 
        href={ad.link}
        data-testid={`ad-${placement}`}
        className={`block ${className}`}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 hover-elevate active-elevate-2 border border-primary/20">
          <Icon className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">{ad.title}</span>
          <ExternalLink className="w-3 h-3 text-primary/70" />
        </div>
      </a>
    );
  }

  // Banner version for prominent placement
  if (placement === "banner") {
    return (
      <a 
        href={ad.link}
        data-testid={`ad-${placement}`}
        className={`block ${className}`}
      >
        <Card className={`p-6 hover-elevate active-elevate-2 ${ad.bgClass} border-primary/20`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-foreground">{ad.title}</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                    Ad
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {ad.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary whitespace-nowrap">
              {ad.cta}
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </a>
    );
  }

  // Card version for sidebar, footer, inline
  return (
    <a 
      href={ad.link}
      data-testid={`ad-${placement}`}
      className={`block ${className}`}
    >
      <Card className={`p-4 hover-elevate active-elevate-2 ${ad.bgClass} border-primary/20`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{ad.title}</h3>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
            Ad
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          {ad.description}
        </p>
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          {ad.cta}
          <ExternalLink className="w-3 h-3" />
        </div>
      </Card>
    </a>
  );
}
