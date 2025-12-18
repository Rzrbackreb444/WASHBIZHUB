import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePersona } from "@/contexts/PersonaContext";
import { 
  Calendar, MapPin, Users, ExternalLink, Sparkles, 
  Building2, DollarSign, TrendingUp, Handshake
} from "lucide-react";

const HOUSTON_ROADSHOW = {
  name: "Houston Roadshow",
  date: "Coming Soon",
  location: "Houston, TX",
  venue: "TBA",
  link: "https://www.eventzilla.net/e/houston-roadshow-2138678638",
  host: "AAdvantage Laundry Systems",
  hostLink: "https://www.eventzilla.net/e/houston-roadshow-2138678638"
};

const PERSONA_MESSAGING = {
  buyer: {
    headline: "Meet Lenders & Find Deals Live",
    description: "Network with funding partners, see equipment demos, and get exclusive show pricing",
    cta: "Reserve Your Spot",
    icon: DollarSign,
    color: "#22C55E"
  },
  owner: {
    headline: "Boost Operations & Revenue",
    description: "Learn proven strategies from top operators and discover equipment upgrades",
    cta: "Join the Roadshow",
    icon: TrendingUp,
    color: "#C8A661"
  },
  seller: {
    headline: "Connect with Qualified Buyers",
    description: "Meet serious investors and get your listing in front of active acquirers",
    cta: "Network with Buyers",
    icon: Handshake,
    color: "#3B82F6"
  },
  default: {
    headline: "Join the Houston Roadshow",
    description: "Network with industry professionals, see live equipment demos, and explore opportunities",
    cta: "Learn More",
    icon: Users,
    color: "#C8A661"
  }
};

interface RoadshowPromoProps {
  variant?: "banner" | "card" | "compact";
  className?: string;
}

export const RoadshowPromo = memo(function RoadshowPromo({ 
  variant = "card",
  className = ""
}: RoadshowPromoProps) {
  const { persona } = usePersona();
  const messaging = persona ? PERSONA_MESSAGING[persona] : PERSONA_MESSAGING.default;
  const Icon = messaging.icon;

  if (variant === "banner") {
    return (
      <div 
        className={`bg-gradient-to-r from-[#0A1628] via-[#122040] to-[#0A1628] border-y border-[#C8A661]/30 py-3 px-4 ${className}`}
        data-testid="banner-roadshow-promo"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3 text-center sm:text-left">
          <Badge className="bg-[#C8A661] text-[#0A1628] shrink-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Live Event
          </Badge>
          <span className="text-white font-medium">
            {HOUSTON_ROADSHOW.name}
          </span>
          <span className="text-white/60 hidden sm:inline">|</span>
          <span className="text-white/80 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {HOUSTON_ROADSHOW.location}
          </span>
          <span className="text-white/60 hidden sm:inline">|</span>
          <span className="text-white/80 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Hosted by {HOUSTON_ROADSHOW.host}
          </span>
          <Button 
            asChild 
            size="sm" 
            className="ml-2 h-7 px-3 text-xs font-semibold"
            style={{ backgroundColor: messaging.color }}
            data-testid="button-roadshow-banner-cta"
          >
            <a href={HOUSTON_ROADSHOW.link} target="_blank" rel="noopener noreferrer">
              {messaging.cta}
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card 
        className={`border-[#C8A661]/30 bg-gradient-to-br from-[#C8A661]/5 to-transparent overflow-hidden ${className}`}
        data-testid="card-roadshow-compact"
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${messaging.color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: messaging.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-foreground truncate">
                {HOUSTON_ROADSHOW.name}
              </span>
              <Badge variant="outline" className="shrink-0 text-xs border-[#C8A661]/50 text-[#C8A661]">
                {HOUSTON_ROADSHOW.location}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {messaging.description}
            </p>
          </div>
          <Button 
            asChild 
            size="sm"
            variant="outline"
            className="shrink-0 border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/10"
            data-testid="button-roadshow-compact-cta"
          >
            <a href={HOUSTON_ROADSHOW.link} target="_blank" rel="noopener noreferrer">
              RSVP
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 border-[#C8A661]/30 bg-gradient-to-br from-[#C8A661]/5 via-transparent to-[#0A1628]/5 overflow-hidden ${className}`}
      data-testid="card-roadshow-promo"
    >
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 mx-auto sm:mx-0"
            style={{ 
              backgroundColor: `${messaging.color}15`,
              border: `2px solid ${messaging.color}30`
            }}
          >
            <Icon className="w-8 h-8" style={{ color: messaging.color }} />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <Badge className="bg-[#C8A661] text-[#0A1628]">
                <Sparkles className="w-3 h-3 mr-1" />
                Live Event
              </Badge>
              <Badge variant="outline" className="border-[#C8A661]/50 text-[#C8A661]">
                <Building2 className="w-3 h-3 mr-1" />
                {HOUSTON_ROADSHOW.host}
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-1">
              {messaging.headline}
            </h3>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" style={{ color: messaging.color }} />
                {HOUSTON_ROADSHOW.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" style={{ color: messaging.color }} />
                {HOUSTON_ROADSHOW.date}
              </span>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {messaging.description}
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <Button 
                asChild 
                className="font-semibold"
                style={{ backgroundColor: messaging.color }}
                data-testid="button-roadshow-rsvp"
              >
                <a href={HOUSTON_ROADSHOW.link} target="_blank" rel="noopener noreferrer">
                  {messaging.cta}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button 
                asChild 
                variant="outline"
                className="border-[#C8A661]/50"
                data-testid="button-roadshow-host"
              >
                <a href={HOUSTON_ROADSHOW.hostLink} target="_blank" rel="noopener noreferrer">
                  About {HOUSTON_ROADSHOW.host}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export const RoadshowBanner = memo(function RoadshowBanner() {
  return <RoadshowPromo variant="banner" />;
});

export const RoadshowCard = memo(function RoadshowCard({ className = "" }: { className?: string }) {
  return <RoadshowPromo variant="card" className={className} />;
});

export const RoadshowCompact = memo(function RoadshowCompact({ className = "" }: { className?: string }) {
  return <RoadshowPromo variant="compact" className={className} />;
});
