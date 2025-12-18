import { memo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, Settings, Building2, ChevronDown, ChevronRight, 
  MapPin, Calculator, DollarSign, Wrench, TrendingUp, Users,
  BarChart3, Target, FileText, Briefcase, Crown, Sparkles, X
} from "lucide-react";
import { usePersona, PERSONA_CONFIG, PersonaType } from "@/contexts/PersonaContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PERSONA_ICONS = {
  buyer: ShoppingCart,
  owner: Settings,
  seller: Building2,
} as const;

const PERSONA_LABELS = {
  buyer: "Buying",
  owner: "Operating", 
  seller: "Selling",
} as const;

export const PersonaSwitcher = memo(function PersonaSwitcher() {
  const { persona, setPersona, clearPersona, isPersonaSet } = usePersona();
  
  if (!isPersonaSet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 gap-1.5 text-xs border-[#C8A661]/30 hover:border-[#C8A661]/60"
            data-testid="button-select-journey"
          >
            <Target className="w-3 h-3 text-[#C8A661]" />
            <span className="hidden sm:inline">Select Your Path</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Personalize your experience
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(["buyer", "owner", "seller"] as const).map((p) => {
            const Icon = PERSONA_ICONS[p];
            const config = PERSONA_CONFIG[p];
            return (
              <DropdownMenuItem 
                key={p}
                onClick={() => setPersona(p)}
                className="cursor-pointer"
                data-testid={`menu-item-persona-${p}`}
              >
                <Icon className="w-4 h-4 mr-2" style={{ color: config.color }} />
                <div className="flex flex-col">
                  <span className="font-medium">{config.fullLabel}</span>
                  <span className="text-xs text-muted-foreground">{config.description}</span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const config = PERSONA_CONFIG[persona!];
  const Icon = PERSONA_ICONS[persona!];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 gap-1.5 text-xs"
          style={{ 
            borderColor: config.color + '40',
            color: config.color
          }}
          data-testid="button-current-journey"
        >
          <Icon className="w-3 h-3" />
          <span className="hidden sm:inline">{PERSONA_LABELS[persona!]}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
          Your journey
          <button 
            onClick={(e) => { e.stopPropagation(); clearPersona(); }}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-clear-journey"
          >
            <X className="w-3 h-3" />
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["buyer", "owner", "seller"] as const).map((p) => {
          const PIcon = PERSONA_ICONS[p];
          const pConfig = PERSONA_CONFIG[p];
          const isActive = persona === p;
          return (
            <DropdownMenuItem 
              key={p}
              onClick={() => setPersona(p)}
              className={`cursor-pointer ${isActive ? 'bg-muted' : ''}`}
              data-testid={`menu-item-persona-${p}`}
            >
              <PIcon className="w-4 h-4 mr-2" style={{ color: pConfig.color }} />
              <span className="font-medium">{pConfig.fullLabel}</span>
              {isActive && <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export const PersonaQuickLinks = memo(function PersonaQuickLinks() {
  const { persona, isPersonaSet } = usePersona();
  const [location] = useLocation();
  
  if (!isPersonaSet || !persona) return null;
  
  const config = PERSONA_CONFIG[persona];
  
  return (
    <div className="hidden lg:flex items-center gap-1">
      {config.primaryLinks.slice(0, 4).map((link) => (
        <Link key={link.href} href={link.href}>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 text-xs ${location === link.href ? 'bg-muted' : ''}`}
            data-testid={`link-quick-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {link.label}
          </Button>
        </Link>
      ))}
    </div>
  );
});

export const PersonaCTA = memo(function PersonaCTA() {
  const { persona, isPersonaSet } = usePersona();
  const [, setLocation] = useLocation();
  
  if (!isPersonaSet || !persona) {
    return (
      <Button 
        onClick={() => setLocation('/cleanbi-explorer')}
        className="hidden sm:flex h-9 px-4 font-semibold bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] border-0 shadow-lg shadow-[#C8A661]/25"
        data-testid="button-default-cta"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Try CLEANBI Free
      </Button>
    );
  }
  
  const config = PERSONA_CONFIG[persona];
  
  return (
    <Button 
      onClick={() => setLocation(config.cta.href)}
      className="hidden sm:flex h-9 px-4 font-semibold text-white border-0 shadow-lg"
      style={{ 
        backgroundColor: config.color,
        boxShadow: `0 10px 15px -3px ${config.color}40`
      }}
      data-testid="button-persona-cta"
    >
      <Crown className="w-4 h-4 mr-2" />
      {config.cta.label}
    </Button>
  );
});

export const PersonaNavBanner = memo(function PersonaNavBanner() {
  const { persona, isPersonaSet, setPersona } = usePersona();
  const [, setLocation] = useLocation();
  
  if (isPersonaSet && persona) {
    const config = PERSONA_CONFIG[persona];
    return (
      <div 
        className="bg-gradient-to-r py-1 px-4 text-center text-xs border-b border-border/30"
        style={{ 
          background: `linear-gradient(to right, ${config.color}15, ${config.color}05)` 
        }}
        data-testid="banner-persona-active"
      >
        <span className="text-muted-foreground">Your journey: </span>
        <span className="font-medium" style={{ color: config.color }} data-testid="banner-persona-label">
          {config.fullLabel}
        </span>
        <span className="text-muted-foreground mx-2">|</span>
        <Link href={config.cta.href}>
          <span 
            className="font-medium hover:underline cursor-pointer"
            style={{ color: config.color }}
            data-testid="banner-persona-cta"
          >
            {config.cta.sublabel} →
          </span>
        </Link>
      </div>
    );
  }
  
  return (
    <div 
      className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] py-1.5 px-4 text-center text-xs text-white/80 border-b border-white/5"
      data-testid="banner-persona-welcome"
    >
      <span>Welcome! </span>
      <span className="text-white/60">Select your journey: </span>
      {(["buyer", "owner", "seller"] as const).map((p, i) => {
        const config = PERSONA_CONFIG[p];
        return (
          <span key={p}>
            {i > 0 && <span className="text-white/40 mx-1">•</span>}
            <button 
              onClick={() => setPersona(p)}
              className="font-medium hover:underline"
              style={{ color: config.color }}
              data-testid={`banner-persona-${p}`}
            >
              {config.label}
            </button>
          </span>
        );
      })}
    </div>
  );
});

export const PersonaMobileMenu = memo(function PersonaMobileMenu({ onClose }: { onClose: () => void }) {
  const { persona, isPersonaSet, setPersona } = usePersona();
  const [, setLocation] = useLocation();
  
  if (!isPersonaSet) {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Select your journey</p>
        {(["buyer", "owner", "seller"] as const).map((p) => {
          const Icon = PERSONA_ICONS[p];
          const config = PERSONA_CONFIG[p];
          return (
            <button
              key={p}
              onClick={() => { setPersona(p); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-[#C8A661]/50 transition-colors"
              data-testid={`mobile-persona-${p}`}
            >
              <Icon className="w-5 h-5" style={{ color: config.color }} />
              <div className="text-left">
                <div className="font-medium">{config.fullLabel}</div>
                <div className="text-xs text-muted-foreground">{config.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  
  const config = PERSONA_CONFIG[persona!];
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          {(() => { const Icon = PERSONA_ICONS[persona!]; return <Icon className="w-4 h-4" style={{ color: config.color }} />; })()}
          <span className="font-medium" style={{ color: config.color }}>{config.fullLabel}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => setPersona(null)}
          data-testid="mobile-change-journey"
        >
          Change
        </Button>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground mb-2">Quick Access</p>
        {config.primaryLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => { setLocation(link.href); onClose(); }}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted text-left"
            data-testid={`mobile-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div>
              <div className="font-medium text-sm">{link.label}</div>
              <div className="text-xs text-muted-foreground">{link.desc}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      
      <div className="pt-2 border-t">
        <p className="text-xs font-medium text-muted-foreground mb-2">More Tools</p>
        <div className="grid grid-cols-2 gap-2">
          {config.secondaryLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => { setLocation(link.href); onClose(); }}
              className="p-2 rounded-lg border text-left text-xs hover:border-[#C8A661]/50"
              data-testid={`mobile-secondary-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
      
      <Button 
        className="w-full"
        style={{ backgroundColor: config.color }}
        onClick={() => { setLocation(config.cta.href); onClose(); }}
        data-testid="mobile-persona-cta"
      >
        <Crown className="w-4 h-4 mr-2" />
        {config.cta.label}
      </Button>
    </div>
  );
});
