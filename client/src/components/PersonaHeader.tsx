/**
 * PersonaHeader - Simplified header that adapts based on user's selected journey
 * 
 * Three personas: Buyer, Owner, Seller
 * Each shows relevant navigation links + universal items
 */

import { memo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, Settings, Building2, ChevronDown, Menu, X,
  MapPin, Calculator, DollarSign, Wrench, TrendingUp, Users,
  Target, FileText, Crown, Sparkles, Search, LayoutGrid,
  GraduationCap, MessageSquare, Phone, BookOpen
} from "lucide-react";
import { usePersona, PERSONA_CONFIG, UNIVERSAL_LINKS, PersonaType } from "@/contexts/PersonaContext";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearchTrigger } from "@/components/GlobalSearch";
import { MobileMenu } from "@/components/MobileMenu";
import { useAuthModal } from "@/components/AuthModal";
import { useSignOut } from "@/components/SignOutConfirmation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";

const PERSONA_ICONS = {
  buyer: ShoppingCart,
  owner: Settings,
  seller: Building2,
} as const;

const PERSONA_COLORS = {
  buyer: "#22C55E",
  owner: "#C8A661", 
  seller: "#3B82F6",
} as const;

// Default links when no persona is selected
const DEFAULT_LINKS = [
  { href: "/cleanbi-explorer", label: "CLEANBI Explorer", icon: MapPin },
  { href: "/marketplace", label: "Marketplace", icon: Target },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/consultation", label: "Consultation", icon: Phone },
];

export const PersonaHeader = memo(function PersonaHeader() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { persona, setPersona, isPersonaSet } = usePersona();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { signOut, isSigningOut } = useSignOut();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentConfig = persona ? PERSONA_CONFIG[persona] : null;
  const navLinks = currentConfig?.primaryLinks || DEFAULT_LINKS;
  const PersonaIcon = persona ? PERSONA_ICONS[persona] : Target;
  const personaColor = persona ? PERSONA_COLORS[persona] : "#C8A661";

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b' 
          : 'bg-background border-b border-border/60'
      }`}
      data-testid="header-persona"
    >
      {/* Persona Banner - shows current journey */}
      {isPersonaSet && persona && (
        <div 
          className="h-8 flex items-center justify-center gap-2 text-xs border-b"
          style={{ background: `linear-gradient(to right, ${personaColor}15, ${personaColor}05)` }}
          data-testid="banner-current-persona"
        >
          <PersonaIcon className="w-3 h-3" style={{ color: personaColor }} />
          <span className="text-muted-foreground">Your journey:</span>
          <span className="font-medium" style={{ color: personaColor }}>
            {currentConfig?.fullLabel}
          </span>
          <span className="text-muted-foreground mx-1">|</span>
          <button 
            onClick={() => setPersona(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
            data-testid="button-change-persona"
          >
            Change
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
            <img src={logoUrl} alt="WashBizHub" className="h-9 w-auto" />
            <span className="hidden sm:block text-lg font-bold tracking-tight">WashBizHub</span>
          </Link>

          {/* Desktop Nav - Persona-Driven Links */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" data-testid="nav-desktop">
            {!isPersonaSet && (
              <PersonaSelectorDropdown onSelect={setPersona} />
            )}
            
            {navLinks.slice(0, 5).map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 text-sm ${location === link.href ? 'bg-muted' : ''}`}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            {/* More dropdown for secondary links */}
            {currentConfig && currentConfig.secondaryLinks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9" data-testid="dropdown-more">
                    More <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {currentConfig.secondaryLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <DropdownMenuItem className="cursor-pointer" data-testid={`link-more-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        {link.label}
                      </DropdownMenuItem>
                    </Link>
                  ))}
                  <DropdownMenuSeparator />
                  <Link href="/platform-directory">
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      All Features
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            <GlobalSearchTrigger />
            <ThemeToggle />

            {/* Primary CTA */}
            {currentConfig ? (
              <Link href={currentConfig.cta.href}>
                <Button 
                  className="hidden sm:flex h-9 font-semibold text-white"
                  style={{ backgroundColor: personaColor }}
                  data-testid="button-persona-cta"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {currentConfig.cta.label}
                </Button>
              </Link>
            ) : (
              <Link href="/cleanbi-explorer">
                <Button 
                  className="hidden sm:flex h-9 font-semibold bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                  data-testid="button-default-cta"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try CLEANBI
                </Button>
              </Link>
            )}

            {/* Auth */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <UserDropdown user={user} signOut={signOut} isSigningOut={isSigningOut} />
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openAuthModal()}
                data-testid="button-signin"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <MobilePersonaMenu 
                  persona={persona} 
                  setPersona={setPersona}
                  onClose={() => setMobileOpen(false)} 
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
});

// Persona Selector Dropdown for users who haven't selected yet
function PersonaSelectorDropdown({ onSelect }: { onSelect: (p: PersonaType) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 gap-2 border-[#C8A661]/30 hover:border-[#C8A661]"
          data-testid="dropdown-select-journey"
        >
          <Target className="w-4 h-4 text-[#C8A661]" />
          Select Your Journey
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 z-[100]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          PERSONALIZE YOUR EXPERIENCE
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["buyer", "owner", "seller"] as const).map((p) => {
          const Icon = PERSONA_ICONS[p];
          const config = PERSONA_CONFIG[p];
          return (
            <DropdownMenuItem 
              key={p}
              onSelect={() => onSelect(p)}
              className="cursor-pointer py-3"
              data-testid={`menu-persona-${p}`}
            >
              <Icon className="w-5 h-5 mr-3" style={{ color: PERSONA_COLORS[p] }} />
              <div>
                <div className="font-medium">{config.fullLabel}</div>
                <div className="text-xs text-muted-foreground">{config.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// User Dropdown
function UserDropdown({ user, signOut, isSigningOut }: { 
  user: any; 
  signOut: () => void; 
  isSigningOut: boolean;
}) {
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const userInitials = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
          <Avatar className="h-8 w-8 ring-2 ring-[#C8A661]/30">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback className="bg-[#0A1628] text-[#C8A661]">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-medium">{displayName}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard">
          <DropdownMenuItem className="cursor-pointer">Dashboard</DropdownMenuItem>
        </Link>
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive"
          onClick={signOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile Menu Content
function MobilePersonaMenu({ 
  persona, 
  setPersona, 
  onClose 
}: { 
  persona: PersonaType; 
  setPersona: (p: PersonaType) => void;
  onClose: () => void;
}) {
  const [, setLocation] = useLocation();
  
  const navigate = (href: string) => {
    setLocation(href);
    onClose();
  };

  if (!persona) {
    return (
      <div className="py-4 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Choose your journey</p>
        {(["buyer", "owner", "seller"] as const).map((p) => {
          const Icon = PERSONA_ICONS[p];
          const config = PERSONA_CONFIG[p];
          return (
            <button
              key={p}
              onClick={() => setPersona(p)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-[#C8A661]/50"
              data-testid={`mobile-persona-${p}`}
            >
              <Icon className="w-5 h-5" style={{ color: PERSONA_COLORS[p] }} />
              <div className="text-left">
                <div className="font-medium">{config.fullLabel}</div>
                <div className="text-xs text-muted-foreground">{config.description}</div>
              </div>
            </button>
          );
        })}
        
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Quick Links</p>
          {DEFAULT_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className="w-full text-left p-2 rounded hover:bg-muted text-sm"
              data-testid={`mobile-quick-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const config = PERSONA_CONFIG[persona];
  const Icon = PERSONA_ICONS[persona];

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: PERSONA_COLORS[persona] }} />
          <span className="font-medium" style={{ color: PERSONA_COLORS[persona] }}>
            {config.fullLabel}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setPersona(null)} data-testid="mobile-change-persona">
          Change
        </Button>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground mb-2">Quick Access</p>
        {config.primaryLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => navigate(link.href)}
            className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left"
            data-testid={`mobile-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span className="font-medium text-sm">{link.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-3 border-t space-y-1">
        <p className="text-xs font-medium text-muted-foreground mb-2">More Tools</p>
        {config.secondaryLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => navigate(link.href)}
            className="w-full text-left p-2 rounded hover:bg-muted text-sm"
            data-testid={`mobile-secondary-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className="pt-3 border-t">
        <p className="text-xs font-medium text-muted-foreground mb-2">Resources</p>
        {UNIVERSAL_LINKS.slice(0, 4).map((link) => (
          <button
            key={link.href}
            onClick={() => navigate(link.href)}
            className="w-full text-left p-2 rounded hover:bg-muted text-sm text-muted-foreground"
            data-testid={`mobile-universal-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {link.label}
          </button>
        ))}
      </div>

      <Button 
        className="w-full mt-4"
        style={{ backgroundColor: PERSONA_COLORS[persona] }}
        onClick={() => navigate(config.cta.href)}
        data-testid="mobile-cta"
      >
        <Crown className="w-4 h-4 mr-2" />
        {config.cta.label}
      </Button>
    </div>
  );
}

export default PersonaHeader;
