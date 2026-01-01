/**
 * MegaMenu - High-Authority Navigation with 4 Pillars
 * Marketplace | Analysis Hub | Growth | Academy
 * Solid-State Glassmorphism - No transparent backgrounds
 */

import { useState, useCallback, memo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu, X, ChevronRight, ChevronDown, LogOut, User,
  MapPin, Building2, Search, ShoppingBag, Map,
  Calculator, BarChart3, Target, Brain, Zap, LineChart,
  DollarSign, Landmark, TrendingUp, PiggyBank, Megaphone,
  BookOpen, GraduationCap, Users, FileText, Award, Crown,
  Bell, Settings, Star, Wrench, MessageSquare
} from "lucide-react";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";
import customIconUrl from "@assets/generated_images/premium_saas_navigation_icon.png";
import dashboardBgUrl from "@assets/generated_images/business_dashboard_preview_background.png";
import { PersonaSwitcher } from "@/components/PersonaNav";

interface NavItem {
  href: string;
  label: string;
  desc?: string;
  featured?: boolean;
  icon?: any;
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
  tagline: "Find Your Perfect Laundromat",
  sections: [
    {
      title: "Listings",
      icon: Building2,
      items: [
        { href: "/laundromat-listings", label: "Laundromats for Sale", desc: "Browse active listings", featured: true },
        { href: "/buy-laundromat", label: "Buy a Laundromat", desc: "Complete buying guide" },
        { href: "/marketplace", label: "Full Marketplace", desc: "All opportunities" },
        { href: "/equipment-for-sale", label: "Equipment for Sale", desc: "Used & new marketplace" },
      ]
    },
    {
      title: "Maps & Discovery",
      icon: Map,
      items: [
        { href: "/cleanbi-explorer", label: "CLEANBI Explorer", desc: "AI location scoring", featured: true },
        { href: "/brokers", label: "Find a Broker", desc: "Verified industry brokers" },
        { href: "/directory", label: "Vendor Directory", desc: "Service providers" },
        { href: "/equipment", label: "Equipment Hub", desc: "Dexter & Continental Girbau" },
      ]
    },
  ]
};

const ANALYSIS_HUB_PILLAR: NavPillar = {
  id: "analysis",
  label: "Analysis Hub",
  icon: BarChart3,
  color: "#C8A661",
  tagline: "Data-Driven Investment Decisions",
  sections: [
    {
      title: "CLEANBI Intelligence",
      icon: Target,
      items: [
        { href: "/cleanbi-explorer", label: "CLEANBI Explorer", desc: "17-factor location scoring", featured: true },
        { href: "/cleanbi-reports", label: "Premium Reports", desc: "Detailed PDF analysis" },
        { href: "/bulk-analysis", label: "Bulk Analysis", desc: "Analyze 100+ locations" },
        { href: "/competitor-dashboard", label: "Competition Intel", desc: "Competitor mapping" },
      ]
    },
    {
      title: "Calculators",
      icon: Calculator,
      items: [
        { href: "/calculators", label: "Calculator Suite", desc: "50+ professional tools", featured: true },
        { href: "/valuation-calculator", label: "Valuation", desc: "4 valuation methods" },
        { href: "/roi-calculator", label: "ROI Analysis", desc: "5-year projections" },
        { href: "/wdf-margin-master", label: "WDF Margin Master", desc: "Wash-Dry-Fold profitability", featured: true },
        { href: "/loan-calculator", label: "Loan Calculator", desc: "Amortization analysis" },
      ]
    },
  ]
};

const GROWTH_PILLAR: NavPillar = {
  id: "growth",
  label: "Growth",
  icon: TrendingUp,
  color: "#22C55E",
  tagline: "Fund & Scale Your Business",
  sections: [
    {
      title: "Funding",
      icon: Landmark,
      items: [
        { href: "/funding", label: "FundingHub", desc: "Compare all lenders", featured: true },
        { href: "/funding?tab=startup", label: "Startup Funding", desc: "First laundromat" },
        { href: "/funding?tab=acquisitions", label: "SBA Loans", desc: "Acquisition financing" },
        { href: "/funding-wizard", label: "Funding Wizard", desc: "Get matched to lenders" },
      ]
    },
    {
      title: "Marketing & Operations",
      icon: Megaphone,
      items: [
        { href: "/website-builder", label: "Website Builder", desc: "Build your site", featured: true },
        { href: "/seo-command-center", label: "SEO Dashboard", desc: "Search optimization" },
        { href: "/pos-command-center", label: "POS System", desc: "Point of sale" },
        { href: "/design-studio-pro", label: "Design Studio", desc: "2D/3D floor planning" },
      ]
    },
  ]
};

const ACADEMY_PILLAR: NavPillar = {
  id: "academy",
  label: "Academy",
  icon: GraduationCap,
  color: "#8B5CF6",
  tagline: "Learn from Industry Experts",
  sections: [
    {
      title: "Education",
      icon: BookOpen,
      items: [
        { href: "/laundromat-bible", label: "Laundromat Bible", desc: "Complete owner's guide", featured: true },
        { href: "/courses", label: "Courses & Training", desc: "Learn from experts" },
        { href: "/template-vault", label: "Template Vault", desc: "Business documents" },
        { href: "/blog", label: "Blog", desc: "News & insights" },
      ]
    },
    {
      title: "Expert Access",
      icon: Award,
      items: [
        { href: "/laundromat-expert", label: "Laundromat Expert AI", desc: "AI consultant", featured: true },
        { href: "/consultation", label: "Book Consultation", desc: "Expert business advice" },
        { href: "/service-guy-ai", label: "Service Guy AI", desc: "Equipment diagnostics", featured: true },
        { href: "/forum", label: "Community Forum", desc: "Connect with 73K+ owners" },
      ]
    },
  ]
};

const ALL_PILLARS = [MARKETPLACE_PILLAR, ANALYSIS_HUB_PILLAR, GROWTH_PILLAR, ACADEMY_PILLAR];

const DropdownLink = memo(function DropdownLink({ href, label, desc, featured, icon: Icon }: NavItem) {
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
            <span className={`block text-sm font-medium ${featured ? 'text-[#C8A661]' : 'text-white'}`}>
              {label}
            </span>
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

function JourneyStatusBar() {
  const { isAuthenticated, user } = useAuth();
  
  const isEnterprise = user?.subscriptionTier === 'enterprise' || 
    user?.stripeSubscriptionId?.includes('enterprise');
  
  const completedMilestones = 3;
  const totalMilestones = 20;
  const progress = Math.round((completedMilestones / totalMilestones) * 100);
  
  const handleRequestAudit = async () => {
    try {
      await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `🔔 Enterprise Audit Request from ${user?.email || 'Enterprise User'}`,
          type: 'audit_request'
        })
      });
      alert('Audit request sent! Larry will contact you within 24 hours.');
    } catch (error) {
      console.error('Failed to send audit request:', error);
    }
  };
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#C8A661] text-slate-900 flex items-center justify-center text-xs font-bold">
          {progress}
        </div>
        <div className="hidden sm:block">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Journey</div>
          <Progress value={progress} className="h-1 w-16 bg-slate-700" />
        </div>
      </div>
      
      {isEnterprise && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleRequestAudit}
          className="h-6 text-[10px] border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/20"
          data-testid="button-request-audit"
        >
          <Crown className="h-3 w-3 mr-1" />
          Request Audit
        </Button>
      )}
    </div>
  );
}

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
          className="absolute top-full left-0 mt-2 w-[520px] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
        >
          {/* Dashboard preview background for Analysis Hub & Marketplace */}
          {(pillar.id === 'analysis' || pillar.id === 'marketplace') && (
            <div 
              className="absolute inset-0 opacity-[0.15] pointer-events-none"
              style={{ 
                backgroundImage: `url(${dashboardBgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
          <div 
            className="px-5 py-3 border-b border-slate-700 relative"
            style={{ background: `linear-gradient(135deg, ${pillar.color}20 0%, transparent 100%)` }}
          >
            <div className="flex items-center gap-3">
              {/* Custom premium icon for header */}
              {(pillar.id === 'analysis' || pillar.id === 'marketplace') ? (
                <img src={customIconUrl} alt="" className="h-5 w-5 rounded-sm" />
              ) : (
                <Icon className="h-5 w-5" style={{ color: pillar.color }} />
              )}
              <div>
                <h3 className="text-white font-semibold">{pillar.label}</h3>
                <p className="text-xs text-slate-400">{pillar.tagline}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-0 relative">
            {pillar.sections.map((section, idx) => (
              <div 
                key={section.title} 
                className={`p-4 ${idx === 0 ? 'border-r border-slate-700' : ''}`}
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50">
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-950">
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
      
      <ScrollArea className="flex-1 bg-slate-950">
        <div className="p-4 space-y-2">
          {ALL_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isExpanded = expandedPillar === pillar.id;
            
            return (
              <div key={pillar.id} className="rounded-lg overflow-hidden bg-slate-800/50">
                <button
                  onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  data-testid={`mobile-pillar-${pillar.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${pillar.color}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: pillar.color }} />
                    </div>
                    <div>
                      <span className="text-white font-medium">{pillar.label}</span>
                      <span className="block text-xs text-slate-400">{pillar.tagline}</span>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 bg-slate-950">
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
                                className={`px-3 py-2 rounded-md text-sm ${
                                  item.featured 
                                    ? 'text-[#C8A661] bg-[#C8A661]/10' 
                                    : 'text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                {item.label}
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
          
          <div className="pt-4 border-t border-slate-700 space-y-2">
            <Link href="/pricing" onClick={onClose}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#C8A661]/10 text-[#C8A661]">
                <Star className="h-4 w-4" />
                <span className="font-medium">Pricing</span>
              </div>
            </Link>
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-slate-700 bg-slate-950">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800">
              <div className="w-8 h-8 rounded-full bg-[#C8A661] flex items-center justify-center text-slate-900 font-bold text-sm">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{user.email}</div>
                <div className="text-xs text-slate-400 capitalize">{user.subscriptionTier || 'Free'} Plan</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings" onClick={onClose} className="flex-1">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => { logout(); onClose(); }}
                className="border-slate-600 text-slate-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" onClick={onClose} className="flex-1">
              <Button variant="outline" className="w-full border-slate-600 text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" onClick={onClose} className="flex-1">
              <Button className="w-full bg-[#C8A661] hover:bg-[#b8963f] text-slate-900">
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
  const [location] = useLocation();
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
        <div className="bg-slate-900 border-b border-slate-800">
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
                    <span className="text-slate-600">|</span>
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
        
        <div className="bg-slate-950 border-b border-slate-800" onClick={closePillars}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between gap-6">
              <Link href="/" data-testid="link-logo" className="shrink-0 flex items-center gap-2">
                <img src={logoUrl} alt="WashBizHub" className="h-10 w-auto" loading="eager" width={40} height={40} />
                <span className="hidden sm:block text-white font-bold text-lg tracking-tight">WashBizHub</span>
              </Link>
              
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
              
              <div className="flex items-center gap-3">
                <div className="hidden lg:block">
                  <JourneyStatusBar />
                </div>
                
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
                  <SheetContent side="right" className="w-full max-w-sm p-0 border-slate-700 bg-slate-950">
                    <MobileMenuContent onClose={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {openPillar && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closePillars}
          style={{ top: '96px' }}
        />
      )}
    </>
  );
}

export default MegaMenu;
