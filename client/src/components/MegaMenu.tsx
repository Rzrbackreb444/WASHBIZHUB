/**
 * MegaMenu - Elite Simplicity Navigation
 * 4 Primary Pillars: Marketplace | Business Analysis | Funding | Academy
 * Clean, enterprise-grade with glassmorphism effects
 */

import { useState, useCallback, memo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu, X, ChevronRight, ChevronDown, LogOut,
  ShoppingBag, Building2, MapPin, Tag,
  BarChart3, Calculator, Target, LineChart,
  Landmark, DollarSign, Briefcase, FileCheck,
  GraduationCap, BookOpen, MessageSquare, Users,
  Star, Settings, Plus
} from "lucide-react";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";
import { PersonaSwitcher } from "@/components/PersonaNav";

interface NavItem {
  href: string;
  label: string;
  desc?: string;
  featured?: boolean;
  icon?: any;
  badge?: string;
}

interface NavPillar {
  id: string;
  label: string;
  icon: any;
  color: string;
  tagline: string;
  sections: {
    title: string;
    icon: any;
    items: NavItem[];
  }[];
}

const MARKETPLACE_PILLAR: NavPillar = {
  id: "marketplace",
  label: "Marketplace",
  icon: ShoppingBag,
  color: "#3B82F6",
  tagline: "Buy, Sell & Discover Laundromats",
  sections: [
    {
      title: "Buy",
      icon: Building2,
      items: [
        { href: "/marketplace", label: "Browse Listings", desc: "All laundromats for sale", featured: true, icon: ShoppingBag },
        { href: "/laundromat-listings", label: "Active Listings", desc: "Latest opportunities", icon: Building2 },
        { href: "/buy-laundromat", label: "Buyer's Guide", desc: "Complete buying process", icon: FileCheck },
        { href: "/brokers", label: "Find a Broker", desc: "Verified industry brokers", icon: Users },
      ]
    },
    {
      title: "Sell & List",
      icon: Tag,
      items: [
        { href: "/list-your-laundromat", label: "List Your Laundromat", desc: "Reach qualified buyers", featured: true, icon: Plus },
        { href: "/sell-your-laundromat", label: "Seller Resources", desc: "Maximize sale value", icon: DollarSign },
        { href: "/equipment-for-sale", label: "Equipment Marketplace", desc: "Buy & sell equipment", icon: MapPin },
        { href: "/directory", label: "Vendor Directory", desc: "Service providers", icon: Briefcase },
      ]
    },
  ]
};

const ANALYSIS_PILLAR: NavPillar = {
  id: "analysis",
  label: "Business Analysis",
  icon: BarChart3,
  color: "#C8A661",
  tagline: "Data-Driven Investment Decisions",
  sections: [
    {
      title: "CLEANBI Intelligence",
      icon: Target,
      items: [
        { href: "/cleanbi-explorer", label: "CLEANBI Explorer", desc: "17-factor location scoring", featured: true, icon: Target },
        { href: "/cleanbi-reports", label: "Premium Reports", desc: "Detailed PDF analysis", icon: FileCheck },
        { href: "/competitor-dashboard", label: "Competition Intel", desc: "Competitor mapping", icon: Users },
        { href: "/bulk-analysis", label: "Bulk Analysis", desc: "Analyze 100+ locations", icon: LineChart },
      ]
    },
    {
      title: "Calculators & Tools",
      icon: Calculator,
      items: [
        { href: "/wdf-margin-master", label: "WDF Margin Master", desc: "Wash-Dry-Fold profitability", featured: true, icon: Calculator, badge: "Popular" },
        { href: "/calculators", label: "Calculator Suite", desc: "50+ professional tools", icon: BarChart3 },
        { href: "/valuation-calculator", label: "Valuation Calculator", desc: "4 valuation methods", icon: DollarSign },
        { href: "/industry-benchmarks", label: "Industry Benchmarks", desc: "Compare your metrics", icon: LineChart },
      ]
    },
  ]
};

const FUNDING_PILLAR: NavPillar = {
  id: "funding",
  label: "Funding",
  icon: Landmark,
  color: "#22C55E",
  tagline: "Finance Your Laundromat Journey",
  sections: [
    {
      title: "Funding Solutions",
      icon: DollarSign,
      items: [
        { href: "/funding", label: "FundingHub", desc: "Compare all lenders", featured: true, icon: Landmark },
        { href: "/funding-wizard", label: "Funding Wizard", desc: "Get matched to lenders", icon: Target, badge: "Smart Match" },
        { href: "/funding?tab=startup", label: "Startup Funding", desc: "First laundromat", icon: Plus },
        { href: "/funding?tab=acquisitions", label: "SBA Loans", desc: "Acquisition financing", icon: FileCheck },
      ]
    },
    {
      title: "Financial Planning",
      icon: Briefcase,
      items: [
        { href: "/loan-calculator", label: "Loan Calculator", desc: "Amortization analysis", icon: Calculator },
        { href: "/roi-calculator", label: "ROI Analysis", desc: "5-year projections", icon: LineChart },
        { href: "/laundromat-financing", label: "Financing Guide", desc: "Complete funding overview", icon: BookOpen },
        { href: "/laundromat-business-plan", label: "Business Plan Tools", desc: "Plan your success", icon: FileCheck },
      ]
    },
  ]
};

const ACADEMY_PILLAR: NavPillar = {
  id: "academy",
  label: "Academy",
  icon: GraduationCap,
  color: "#8B5CF6",
  tagline: "Expert Knowledge & Consulting",
  sections: [
    {
      title: "Learn",
      icon: BookOpen,
      items: [
        { href: "/laundromat-bible", label: "Laundromat Bible", desc: "Complete owner's guide", featured: true, icon: BookOpen },
        { href: "/courses", label: "Courses & Training", desc: "Expert-led education", icon: GraduationCap },
        { href: "/blog", label: "Blog & Insights", desc: "Latest industry news", icon: FileCheck },
        { href: "/template-vault", label: "Template Vault", desc: "Business documents", icon: Briefcase },
      ]
    },
    {
      title: "Expert Access",
      icon: MessageSquare,
      items: [
        { href: "/consultation", label: "Book Consultation", desc: "1-on-1 with Larry Larsen", featured: true, icon: MessageSquare, badge: "Direct Access" },
        { href: "/laundromat-expert", label: "Laundromat Expert AI", desc: "24/7 AI consultant", icon: Target },
        { href: "/service-guy-ai", label: "Service Guy AI", desc: "Equipment diagnostics", icon: Calculator },
        { href: "/forum", label: "Community Forum", desc: "Connect with 73K+ owners", icon: Users },
      ]
    },
  ]
};

const ALL_PILLARS = [MARKETPLACE_PILLAR, ANALYSIS_PILLAR, FUNDING_PILLAR, ACADEMY_PILLAR];

const DropdownLink = memo(function DropdownLink({ href, label, desc, featured, icon: Icon, badge }: NavItem) {
  return (
    <Link href={href}>
      <div 
        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
          featured 
            ? 'bg-[#C8A661]/10 hover:bg-[#C8A661]/20 border border-[#C8A661]/20' 
            : 'hover:bg-white/10'
        }`}
        data-testid={`link-mega-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className={`h-4 w-4 ${featured ? 'text-[#C8A661]' : 'text-slate-400'}`} />}
          <div>
            <div className="flex items-center gap-2">
              <span className={`block text-sm font-medium ${featured ? 'text-[#C8A661]' : 'text-white'}`}>
                {label}
              </span>
              {badge && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-[#C8A661]/20 text-[#C8A661] border-0">
                  {badge}
                </Badge>
              )}
            </div>
            {desc && (
              <span className="block text-xs text-slate-400 mt-0.5">{desc}</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
});

function DesktopPillarDropdown({ pillar, isOpen, onToggle }: { pillar: NavPillar; isOpen: boolean; onToggle: () => void }) {
  const Icon = pillar.icon;
  
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          isOpen 
            ? 'bg-slate-800 text-white' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        }`}
        data-testid={`dropdown-${pillar.id}`}
      >
        <Icon className="h-4 w-4" style={{ color: pillar.color }} />
        {pillar.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-[520px] rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50"
          style={{ 
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
          }}
        >
          <div 
            className="px-5 py-3 border-b border-slate-700/50"
            style={{ background: `linear-gradient(135deg, ${pillar.color}15 0%, transparent 100%)` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${pillar.color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color: pillar.color }} />
              </div>
              <div>
                <h3 className="text-white font-semibold">{pillar.label}</h3>
                <p className="text-xs text-slate-400">{pillar.tagline}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-0">
            {pillar.sections.map((section, idx) => (
              <div 
                key={section.title} 
                className={`p-4 ${idx === 0 ? 'border-r border-slate-700/50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/30">
                  <section.icon className="h-3.5 w-3.5" style={{ color: pillar.color }} />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <DropdownLink key={item.href} {...item} />
                  ))}
                </div>
              </div>
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
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
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
      
      {/* Prominent List CTA for Mobile */}
      <div className="p-4 border-b border-slate-800 bg-slate-950">
        <Link href="/list-your-laundromat" onClick={onClose}>
          <Button className="w-full bg-[#C8A661] hover:bg-[#b8963f] text-slate-900 font-semibold h-12" data-testid="mobile-list-cta">
            <Plus className="h-5 w-5 mr-2" />
            List Your Laundromat
          </Button>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 bg-slate-950">
        <div className="p-4 space-y-2">
          {ALL_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isExpanded = expandedPillar === pillar.id;
            
            return (
              <div key={pillar.id} className="rounded-lg overflow-hidden bg-slate-900/50 border border-slate-800/50">
                <button
                  onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  data-testid={`mobile-pillar-${pillar.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${pillar.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: pillar.color }} />
                    </div>
                    <div>
                      <span className="text-white font-medium">{pillar.label}</span>
                      <span className="block text-xs text-slate-500">{pillar.tagline}</span>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 bg-slate-950/50">
                    {pillar.sections.map((section) => (
                      <div key={section.title}>
                        <div className="flex items-center gap-2 mb-2">
                          <section.icon className="h-3 w-3" style={{ color: pillar.color }} />
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            {section.title}
                          </span>
                        </div>
                        <div className="space-y-1 pl-5">
                          {section.items.map((item) => (
                            <Link key={item.href} href={item.href} onClick={onClose}>
                              <div 
                                className={`px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                                  item.featured 
                                    ? 'text-[#C8A661] bg-[#C8A661]/10 border border-[#C8A661]/20' 
                                    : 'text-slate-300 hover:bg-slate-800/50'
                                }`}
                              >
                                {item.icon && <item.icon className="h-4 w-4 opacity-60" />}
                                {item.label}
                                {item.badge && (
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-[#C8A661]/20 text-[#C8A661] border-0 ml-auto">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Link href="/pricing" onClick={onClose}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#C8A661]/10 text-[#C8A661] border border-[#C8A661]/20">
                <Star className="h-4 w-4" />
                <span className="font-medium">View Pricing</span>
              </div>
            </Link>
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-[#C8A661] flex items-center justify-center text-slate-900 font-bold">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{user.email}</div>
                <div className="text-xs text-slate-500 capitalize">{user.subscriptionTier || 'Free'} Plan</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings" onClick={onClose} className="flex-1">
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => { logout(); onClose(); }}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" onClick={onClose} className="flex-1">
              <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" onClick={onClose} className="flex-1">
              <Button className="w-full bg-[#C8A661] hover:bg-[#b8963f] text-slate-900 font-semibold">
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
      
      <header className="sticky top-0 z-50">
        {/* Top utility bar */}
        <div className="bg-slate-900 border-b border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 hidden sm:inline">The #1 Laundromat Intelligence Platform</span>
                <span className="sm:hidden text-[#C8A661] font-medium">WashBizHub</span>
              </div>
              
              <div className="flex items-center gap-3">
                <PersonaSwitcher />
                <span className="text-slate-700 hidden sm:inline">|</span>
                <ThemeToggle />
                
                {isLoading ? (
                  <div className="w-12 h-4 bg-slate-700 rounded animate-pulse" />
                ) : isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <Link href="/account/subscription">
                      <span className="text-slate-400 hover:text-[#C8A661] transition-colors cursor-pointer hidden sm:inline">
                        {user.email}
                      </span>
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-[#C8A661] transition-colors"
                      data-testid="button-logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <span className="text-slate-400 hover:text-[#C8A661] transition-colors cursor-pointer" data-testid="link-signin">
                        Sign In
                      </span>
                    </Link>
                    <span className="text-slate-700">|</span>
                    <Link href="/signup">
                      <span className="text-[#C8A661] hover:text-[#d4b86a] transition-colors cursor-pointer font-medium" data-testid="link-signup">
                        Sign Up
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main navigation bar */}
        <div className="bg-slate-950 border-b border-slate-800/50" onClick={closePillars}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between gap-4">
              {/* Logo */}
              <Link href="/" data-testid="link-logo" className="shrink-0 flex items-center gap-2">
                <img src={logoUrl} alt="WashBizHub" className="h-10 w-auto" loading="eager" width={40} height={40} />
                <span className="hidden sm:block text-white font-bold text-lg tracking-tight">WashBizHub</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {ALL_PILLARS.map((pillar) => (
                  <DesktopPillarDropdown
                    key={pillar.id}
                    pillar={pillar}
                    isOpen={openPillar === pillar.id}
                    onToggle={() => handlePillarToggle(pillar.id)}
                  />
                ))}
                
                <Link href="/pricing">
                  <Button 
                    variant="ghost" 
                    className="text-[#C8A661] hover:bg-[#C8A661]/10 font-medium"
                    data-testid="link-pricing"
                  >
                    <Star className="h-4 w-4 mr-1.5" />
                    Pricing
                  </Button>
                </Link>
              </nav>
              
              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* High-Contrast List Your Laundromat CTA - Desktop */}
                <Link href="/list-your-laundromat" className="hidden lg:block">
                  <Button 
                    className="bg-[#C8A661] hover:bg-[#b8963f] text-slate-900 font-semibold shadow-lg shadow-[#C8A661]/20 border border-[#d4b86a]"
                    data-testid="button-list-laundromat"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    List Your Laundromat
                  </Button>
                </Link>
                
                {/* Mobile menu trigger */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="lg:hidden text-white hover:bg-slate-800"
                      data-testid="button-mobile-menu"
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full max-w-sm p-0 border-slate-800 bg-slate-950">
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
          className="fixed inset-0 z-40 bg-black/20" 
          onClick={closePillars}
          style={{ top: '96px', backdropFilter: 'blur(2px)' }}
        />
      )}
    </>
  );
}

export default MegaMenu;
