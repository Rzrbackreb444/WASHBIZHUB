/**
 * MegaMenu - Radically Simplified Navigation
 * 3 Primary Pillars: Marketplace | Analysis Suite | Expert Consultation
 * Obsidian Glass aesthetic with Matte Gold accents
 */

import { useState, useCallback, memo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu, X, ChevronRight, ChevronDown, LogOut,
  ShoppingBag, Building2, MapPin, Plus,
  BarChart3, Calculator, Target, LineChart,
  MessageSquare, Calendar, Star, Settings, Phone,
  Wallet, Landmark, Briefcase, Wrench, ExternalLink
} from "lucide-react";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";

interface NavItem {
  href: string;
  label: string;
  desc?: string;
  featured?: boolean;
  icon?: any;
  badge?: string;
  external?: boolean;
}

interface NavPillar {
  id: string;
  label: string;
  icon: any;
  color: string;
  tagline: string;
  items: NavItem[];
}

const MARKETPLACE_PILLAR: NavPillar = {
  id: "marketplace",
  label: "Marketplace",
  icon: ShoppingBag,
  color: "#d4af37",
  tagline: "Buy, Sell & Discover Laundromats",
  items: [
    { href: "/marketplace", label: "Browse Listings", desc: "All laundromats for sale", featured: true, icon: ShoppingBag },
    { href: "/list-your-laundromat", label: "List Your Laundromat", desc: "Reach qualified buyers", icon: Plus },
    { href: "/brokers", label: "Find a Broker", desc: "Verified industry brokers", icon: Building2 },
    { href: "/equipment-for-sale", label: "Equipment Marketplace", desc: "Buy & sell equipment", icon: MapPin },
  ]
};

const ANALYSIS_PILLAR: NavPillar = {
  id: "analysis",
  label: "Analysis Suite",
  icon: BarChart3,
  color: "#d4af37",
  tagline: "CLEANBI & Professional Calculators",
  items: [
    { href: "/cleanbi-explorer", label: "CLEANBI Explorer", desc: "17-factor location scoring", featured: true, icon: Target },
    { href: "/calculators", label: "Calculator Suite", desc: "50+ professional tools", icon: Calculator },
    { href: "/wdf-margin-master", label: "WDF Margin Master", desc: "Wash-Dry-Fold profitability", icon: LineChart, badge: "Popular" },
    { href: "/valuation-calculator", label: "Valuation Calculator", desc: "4 valuation methods", icon: BarChart3 },
  ]
};

const EXPERT_PILLAR: NavPillar = {
  id: "expert",
  label: "Expert Consultation",
  icon: MessageSquare,
  color: "#d4af37",
  tagline: "1-on-1 with Larry Larsen",
  items: [
    { href: "/consultation", label: "Book Strategy Session", desc: "Direct access to 50+ years expertise", featured: true, icon: Calendar, badge: "High-Ticket" },
    { href: "/laundromat-expert", label: "Ask Larry AI", desc: "24/7 AI-powered consultation", icon: MessageSquare },
    { href: "/laundromat-bible", label: "Laundromat Bible", desc: "Complete owner's guide", icon: Star },
    { href: "/service-guy-ai", label: "Service Guy AI", desc: "Equipment diagnostics", icon: Calculator },
  ]
};

const FUNDING_PILLAR: NavPillar = {
  id: "funding",
  label: "Funding",
  icon: Wallet,
  color: "#d4af37",
  tagline: "Finance Your Laundromat Investment",
  items: [
    { 
      href: "/funding-wizard", 
      label: "Funding Wizard", 
      desc: "Find your best lender match in 5 steps", 
      featured: true, 
      icon: Target,
      badge: "Recommended"
    },
    { 
      href: "https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/", 
      label: "Startup Capital", 
      desc: "First-time buyer & startup funding", 
      icon: Wallet,
      external: true
    },
    { 
      href: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1", 
      label: "Commercial Real Estate", 
      desc: "Property & equipment acquisition", 
      icon: Landmark,
      external: true
    },
    { 
      href: "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat", 
      label: "SBA Programs", 
      desc: "Government-backed SBA 7(a) loans", 
      icon: Briefcase,
      external: true
    },
    { 
      href: "https://davidallencapital.com/nicholaskremers", 
      label: "Working Capital", 
      desc: "Fast funding & equipment financing", 
      icon: Wrench,
      external: true
    },
  ]
};

const NEWS_PILLAR: NavPillar = {
  id: "news",
  label: "News & Insights",
  icon: Star,
  color: "#d4af37",
  tagline: "Expert Guides & Industry Updates",
  items: [
    { 
      href: "/blog", 
      label: "Blog", 
      desc: "Expert articles & industry news", 
      featured: true, 
      icon: Star,
      badge: "New"
    },
    { 
      href: "/blog/how-to-buy-a-laundromat-complete-guide", 
      label: "Buying Guide", 
      desc: "Complete acquisition walkthrough", 
      icon: ShoppingBag
    },
    { 
      href: "/blog/laundromat-valuation-guide", 
      label: "Valuation Guide", 
      desc: "How to calculate true worth", 
      icon: BarChart3
    },
    { 
      href: "/blog/commercial-laundry-equipment-guide", 
      label: "Equipment Guide", 
      desc: "Choosing machines for max ROI", 
      icon: Wrench
    },
    { 
      href: "/blog/how-to-run-profitable-laundromat-operations-guide", 
      label: "Operations Guide", 
      desc: "Running a profitable store", 
      icon: Target
    },
  ]
};

const ALL_PILLARS = [MARKETPLACE_PILLAR, ANALYSIS_PILLAR, EXPERT_PILLAR, FUNDING_PILLAR, NEWS_PILLAR];

const DropdownLink = memo(function DropdownLink({ href, label, desc, featured, icon: Icon, badge, external }: NavItem) {
  const content = (
    <div 
      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
        featured 
          ? 'bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30' 
          : 'hover:bg-white/10'
      }`}
      data-testid={`link-mega-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`h-4 w-4 ${featured ? 'text-[#d4af37]' : 'text-white/50'}`} />}
        <div>
          <div className="flex items-center gap-2">
            <span className={`block text-sm font-medium ${featured ? 'text-[#d4af37]' : 'text-white'}`}>
              {label}
            </span>
            {badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-[#d4af37]/20 text-[#d4af37] border-0">
                {badge}
              </Badge>
            )}
          </div>
          {desc && (
            <span className="block text-xs text-white/40 mt-0.5">{desc}</span>
          )}
        </div>
      </div>
      {external ? (
        <ExternalLink className="w-4 h-4 text-[#d4af37]/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      ) : (
        <ChevronRight className="w-4 h-4 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
});

function DesktopPillarDropdown({ pillar, isOpen, onToggle }: { pillar: NavPillar; isOpen: boolean; onToggle: () => void }) {
  const Icon = pillar.icon;
  
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          isOpen 
            ? 'bg-white/10 text-white' 
            : 'text-white/70 hover:text-white hover:bg-white/5'
        }`}
        data-testid={`dropdown-${pillar.id}`}
      >
        <Icon className="h-4 w-4" style={{ color: pillar.color }} />
        {pillar.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-[320px] rounded-xl border border-[#d4af37]/20 overflow-hidden z-50"
          style={{ 
            background: 'rgba(9, 9, 11, 0.95)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' 
          }}
        >
          <div 
            className="px-4 py-3 border-b border-white/10"
            style={{ background: `linear-gradient(135deg, ${pillar.color}10 0%, transparent 100%)` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${pillar.color}20`, border: `1px solid ${pillar.color}30` }}
              >
                <Icon className="h-4 w-4" style={{ color: pillar.color }} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{pillar.label}</h3>
                <p className="text-xs text-white/50">{pillar.tagline}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 space-y-1">
            {pillar.items.map((item) => (
              <DropdownLink key={item.href} {...item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenuContent({ onClose }: { onClose: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  
  return (
    <div className="flex flex-col h-full" style={{ background: '#09090b' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link href="/" onClick={onClose}>
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="WashBizHub" className="h-8 w-auto" />
            <span className="text-white font-bold">WashBizHub</span>
          </div>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Primary CTAs for Mobile */}
      <div className="p-4 space-y-3 border-b border-white/10">
        <Link href="/list-your-laundromat" onClick={onClose}>
          <Button className="w-full bg-[#d4af37] hover:bg-[#c49f2f] text-black font-semibold h-12" data-testid="mobile-list-cta">
            <Plus className="h-5 w-5 mr-2" />
            List Your Laundromat
          </Button>
        </Link>
        <Link href="/consultation" onClick={onClose}>
          <Button variant="outline" className="w-full border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/10 h-12" data-testid="mobile-consult-cta">
            <Phone className="h-5 w-5 mr-2" />
            Book Strategy Session with Larry
          </Button>
        </Link>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {ALL_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isExpanded = expandedPillar === pillar.id;
            
            return (
              <div key={pillar.id} className="rounded-lg overflow-hidden backdrop-blur-md bg-white/5 border border-white/10">
                <button
                  onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  data-testid={`mobile-pillar-${pillar.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${pillar.color}15`, border: `1px solid ${pillar.color}30` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: pillar.color }} />
                    </div>
                    <div>
                      <span className="text-white font-medium">{pillar.label}</span>
                      <span className="block text-xs text-white/40">{pillar.tagline}</span>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-1 bg-black/20">
                    {pillar.items.map((item) => (
                      <Link key={item.href} href={item.href} onClick={onClose}>
                        <div 
                          className={`px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                            item.featured 
                              ? 'text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30' 
                              : 'text-white/70 hover:bg-white/5'
                          }`}
                        >
                          {item.icon && <item.icon className="h-4 w-4 opacity-60" />}
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-[#d4af37]/20 text-[#d4af37] border-0 ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-white/10">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-bold">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{user.email}</div>
                <div className="text-xs text-white/40 capitalize">{user.subscriptionTier || 'Free'} Plan</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings" onClick={onClose} className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white/70 hover:bg-white/5">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => { logout(); onClose(); }}
                className="border-white/20 text-white/70 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" onClick={onClose} className="flex-1">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" onClick={onClose} className="flex-1">
              <Button className="w-full bg-[#d4af37] hover:bg-[#c49f2f] text-black font-semibold">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function MegaMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Initialize scroll state immediately to avoid flicker
  const [scrolled, setScrolled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY > 50;
    }
    return false;
  });
  
  // Track scroll for transparent → solid header transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    // Check immediately on mount
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handlePillarToggle = useCallback((pillarId: string) => {
    setOpenPillar(prev => prev === pillarId ? null : pillarId);
  }, []);
  
  const closePillars = useCallback(() => {
    setOpenPillar(null);
  }, []);
  
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
      <header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ 
          background: scrolled ? 'rgba(9, 9, 11, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none'
        }}
      >
        {/* Single streamlined navigation bar */}
        <div className={`border-b transition-colors duration-300 ${scrolled ? 'border-[#d4af37]/10' : 'border-transparent'}`} onClick={closePillars}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between gap-4">
              {/* Logo */}
              <Link href="/" data-testid="link-logo" className="shrink-0 flex items-center gap-2">
                <img src={logoUrl} alt="WashBizHub" className="h-10 w-auto" loading="eager" width={40} height={40} />
                <span className="hidden sm:block text-white font-bold text-lg tracking-tight">WashBizHub</span>
              </Link>
              
              {/* Desktop Navigation - 3 Pillars */}
              <nav className="hidden lg:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {ALL_PILLARS.map((pillar) => (
                  <DesktopPillarDropdown
                    key={pillar.id}
                    pillar={pillar}
                    isOpen={openPillar === pillar.id}
                    onToggle={() => handlePillarToggle(pillar.id)}
                  />
                ))}
              </nav>
              
              {/* Right side actions */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                
                {/* Auth state */}
                <div className="hidden lg:flex items-center gap-3">
                  {isLoading ? (
                    <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                  ) : isAuthenticated && user ? (
                    <div className="flex items-center gap-3">
                      <Link href="/account/subscription">
                        <span className="text-sm text-white/60 hover:text-[#d4af37] transition-colors cursor-pointer">
                          {user.email}
                        </span>
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-1.5 text-white/60 hover:text-[#d4af37] transition-colors"
                        data-testid="button-logout"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="/login">
                        <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5" data-testid="link-signin">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Primary CTA - Desktop */}
                <Link href="/list-your-laundromat" className="hidden lg:block">
                  <Button 
                    className="bg-[#d4af37] hover:bg-[#c49f2f] text-black font-semibold border border-[#d4af37]"
                    data-testid="button-list-laundromat"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    List Laundromat
                  </Button>
                </Link>
                
                {/* Mobile menu trigger */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="lg:hidden text-white hover:bg-white/10"
                      data-testid="button-mobile-menu"
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full max-w-sm p-0 border-white/10" style={{ background: '#09090b' }}>
                    <MobileMenuContent onClose={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Backdrop overlay when dropdown is open */}
      {openPillar && (
        <div 
          className="fixed inset-0 z-40 bg-black/40" 
          onClick={closePillars}
          style={{ top: '64px', backdropFilter: 'blur(4px)' }}
        />
      )}
    </>
  );
}

export default MegaMenu;
