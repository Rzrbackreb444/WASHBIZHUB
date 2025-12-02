import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, LogIn, LogOut, User, ChevronDown, ChevronRight, Building2, Calculator, 
  ShoppingCart, GraduationCap, Phone, Settings as SettingsIcon, Users, X, 
  Shield, Zap, Globe, Award, CheckCircle, Wrench, BookOpen, BarChart3,
  FileText, DollarSign, Layout, Bot, Search, TrendingUp, Store, MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Advertisement } from "@/components/Advertisement";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoUrl from "@assets/6_1764040628012.png";

const navigationSections = [
  {
    id: "platform",
    title: "Platform",
    icon: Building2,
    items: [
      { href: "/design-studio", label: "Design Studio 2D/3D", icon: Layout },
      { href: "/cleanbi", label: "CLEANBI™ Analysis", icon: BarChart3 },
      { href: "/ai-blogging", label: "AI Blogging Suite", icon: Bot },
      { href: "/seo-optimizer", label: "SEO Optimizer", icon: Search },
      { href: "/templates", label: "Premium Templates", icon: FileText },
      { href: "/repair-guide", label: "Service Guy AI", icon: Wrench },
    ]
  },
  {
    id: "resources",
    title: "Resources",
    icon: Calculator,
    items: [
      { href: "/resources", label: "Resource Hub", icon: BookOpen },
      { href: "/vendors", label: "Vendor Directory", icon: Store },
      { href: "/roi-calculator", label: "ROI Calculator", icon: TrendingUp },
      { href: "/calculator", label: "Revenue Calculator", icon: Calculator },
      { href: "/funding-matcher", label: "Funding Matcher", icon: DollarSign },
    ]
  },
  {
    id: "marketplace",
    title: "Marketplace",
    icon: ShoppingCart,
    items: [
      { href: "/listings", label: "Browse Listings", icon: Search },
      { href: "/listing-form", label: "Add a Listing", icon: FileText },
      { href: "/seller-dashboard", label: "Seller Dashboard", icon: BarChart3 },
      { href: "/superstore", label: "Equipment Superstore", icon: ShoppingCart },
    ]
  },
  {
    id: "learn",
    title: "Learn",
    icon: GraduationCap,
    items: [
      { href: "/courses", label: "Premium Courses", icon: GraduationCap },
      { href: "/book", label: "The Laundromat Bible", icon: BookOpen },
      { href: "/blog", label: "Industry Blog", icon: FileText },
    ]
  },
  {
    id: "community",
    title: "Community",
    icon: Users,
    items: [
      { href: "/forum", label: "Discussion Forum", icon: MessageSquare },
      { href: "/facebook-group", label: "Facebook Community", icon: Users },
    ]
  },
  {
    id: "expert",
    title: "Expert Help",
    icon: Phone,
    items: [
      { href: "/consultation", label: "Book Consultation", icon: Phone },
      { href: "/about", label: "About Us", icon: Users },
      { href: "/pricing", label: "Pricing", icon: DollarSign },
    ]
  }
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-gold-500 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
      <div className="bg-[#1e3a5f] border-b border-gold-500/20" data-testid="trust-bar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-2 gap-6 sm:gap-8 text-xs sm:text-sm flex-wrap">
            <div className="hidden sm:flex items-center gap-2 text-white/90">
              <Globe className="w-4 h-4 text-gold-400" aria-hidden="true" />
              <span className="font-medium">220+ Countries</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Users className="w-4 h-4 text-gold-400" aria-hidden="true" />
              <span className="font-semibold text-white">72,000+ Members</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/90">
              <Zap className="w-4 h-4 text-gold-400" aria-hidden="true" />
              <span className="font-medium">80+ Tools</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-white/90">
              <Award className="w-4 h-4 text-gold-400" aria-hidden="true" />
              <span className="font-medium">#1 Laundromat Platform</span>
            </div>
          </div>
        </div>
      </div>
      
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#1e3a5f]/95 backdrop-blur-md shadow-xl' 
            : 'bg-[#1e3a5f]'
        }`}
        data-testid="header-main"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4 gap-4">
            <Link href="/" aria-label="WashBizHub Home">
              <div 
                className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 transition-all duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e3a5f]" 
                data-testid="link-logo"
              >
                <img 
                  src={logoUrl} 
                  alt="WashBizHub - Laundromat Business Hub" 
                  className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto" 
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width={96}
                  height={96}
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-6" role="navigation" aria-label="Main navigation">
              <div 
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2.5 text-white font-medium text-sm tracking-wide rounded-lg transition-all duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 group"
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  aria-expanded={megaMenuOpen}
                  aria-haspopup="true"
                  aria-label="Explore Platform - Open navigation menu"
                  data-testid="button-mega-menu"
                >
                  <span className="relative">
                    Explore Platform
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover:w-full" />
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} 
                    aria-hidden="true" 
                  />
                </button>

                <div 
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                    megaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                  data-testid="mega-menu-panel"
                >
                  <div className="bg-[#1e3a5f]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 min-w-[800px]">
                    <div className="grid grid-cols-3 gap-8">
                      {navigationSections.slice(0, 3).map((section) => (
                        <div key={section.id}>
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                            <section.icon className="w-4 h-4 text-gold-400" aria-hidden="true" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-bebas text-base">
                              {section.title}
                            </h3>
                          </div>
                          <ul className="space-y-1">
                            {section.items.map((item) => (
                              <li key={item.href}>
                                <Link href={item.href}>
                                  <div 
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer group"
                                    onClick={() => setMegaMenuOpen(false)}
                                    data-testid={`link-nav-${item.href.replace('/', '')}`}
                                  >
                                    <item.icon className="w-4 h-4 text-white/50 group-hover:text-gold-400 transition-colors" aria-hidden="true" />
                                    <span className="relative">
                                      {item.label}
                                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold-400 transition-all duration-200 group-hover:w-full" />
                                    </span>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 mt-6 pt-6 border-t border-white/10">
                      {navigationSections.slice(3).map((section) => (
                        <div key={section.id}>
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                            <section.icon className="w-4 h-4 text-gold-400" aria-hidden="true" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-bebas text-base">
                              {section.title}
                            </h3>
                          </div>
                          <ul className="space-y-1">
                            {section.items.map((item) => (
                              <li key={item.href}>
                                <Link href={item.href}>
                                  <div 
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer group"
                                    onClick={() => setMegaMenuOpen(false)}
                                    data-testid={`link-nav-${item.href.replace('/', '')}`}
                                  >
                                    <item.icon className="w-4 h-4 text-white/50 group-hover:text-gold-400 transition-colors" aria-hidden="true" />
                                    <span className="relative">
                                      {item.label}
                                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold-400 transition-all duration-200 group-hover:w-full" />
                                    </span>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/cleanbi">
                <span 
                  className="text-white/90 font-medium text-sm hover:text-white transition-colors relative group cursor-pointer"
                  data-testid="link-nav-cleanbi-quick"
                >
                  CLEANBI™
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>

              <Link href="/listings">
                <span 
                  className="text-white/90 font-medium text-sm hover:text-white transition-colors relative group cursor-pointer"
                  data-testid="link-nav-listings-quick"
                >
                  Marketplace
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>

              <Link href="/courses">
                <span 
                  className="text-white/90 font-medium text-sm hover:text-white transition-colors relative group cursor-pointer"
                  data-testid="link-nav-courses-quick"
                >
                  Academy
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden xl:block">
                <Advertisement placement="header" />
              </div>
              
              <ThemeToggle />
              
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link href="/settings" className="hidden sm:block">
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="text-white/80 hover:text-white hover:bg-white/10"
                          aria-label="Settings"
                          data-testid="button-settings"
                        >
                          <SettingsIcon className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                      
                      <div className="hidden md:flex items-center gap-2 text-white/80 text-sm px-3 py-1.5 bg-white/5 rounded-lg">
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span className="font-medium max-w-[100px] truncate">
                          {user?.firstName || user?.email || 'User'}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => window.location.href = '/api/logout'}
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                        data-testid="button-logout"
                      >
                        <LogOut className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        <span className="hidden md:inline">Logout</span>
                      </Button>
                      
                      <Button 
                        onClick={() => window.location.href = '/api/logout'}
                        variant="ghost"
                        size="icon"
                        className="sm:hidden text-white/80 hover:text-white hover:bg-white/10"
                        aria-label="Logout"
                        data-testid="button-logout-mobile"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => window.location.href = '/api/login'}
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
                        data-testid="button-login"
                      >
                        <LogIn className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        Login
                      </Button>
                      
                      <Button 
                        onClick={() => window.location.href = '/api/login'}
                        variant="ghost"
                        size="icon"
                        className="sm:hidden text-white/80 hover:text-white hover:bg-white/10"
                        aria-label="Login"
                        data-testid="button-login-mobile"
                      >
                        <LogIn className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </>
                  )}
                  
                  {(!user?.isPro) && (
                    <Link href="/pricing" className="hidden sm:block">
                      <Button 
                        className="bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg shadow-lg shadow-gold-500/20 transition-all duration-200"
                        size="sm"
                        data-testid="button-upgrade"
                      >
                        <Zap className="w-4 h-4 mr-1.5" aria-hidden="true" />
                        <span className="hidden lg:inline">Upgrade to Pro</span>
                        <span className="lg:hidden">Upgrade</span>
                      </Button>
                    </Link>
                  )}
                </>
              )}
              
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-white hover:bg-white/10"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[320px] sm:w-[380px] bg-[#1e3a5f]/98 backdrop-blur-xl border-l border-white/10 p-0"
                  data-testid="nav-mobile-drawer"
                >
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-6 border-b border-white/10">
                      <SheetTitle className="text-white font-bebas text-2xl tracking-wide">
                        Navigation
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto py-4">
                      {navigationSections.map((section) => (
                        <Collapsible 
                          key={section.id}
                          open={expandedSections.includes(section.id)}
                          onOpenChange={() => toggleSection(section.id)}
                        >
                          <CollapsibleTrigger 
                            className="flex items-center justify-between w-full px-6 py-3 min-h-[44px] text-left hover:bg-white/5 transition-colors"
                            data-testid={`button-mobile-section-${section.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <section.icon className="w-5 h-5 text-gold-400" aria-hidden="true" />
                              <span className="text-white font-semibold text-sm uppercase tracking-wide">
                                {section.title}
                              </span>
                            </div>
                            <ChevronRight 
                              className={`w-4 h-4 text-white/60 transition-transform duration-200 ${
                                expandedSections.includes(section.id) ? 'rotate-90' : ''
                              }`} 
                              aria-hidden="true" 
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="bg-white/5">
                            {section.items.map((item) => (
                              <Link href={item.href} key={item.href}>
                                <div 
                                  className="flex items-center gap-3 px-6 pl-14 py-3 min-h-[44px] text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                  onClick={() => setMobileMenuOpen(false)}
                                  data-testid={`link-mobile-${item.href.replace('/', '')}`}
                                >
                                  <item.icon className="w-4 h-4 text-white/50" aria-hidden="true" />
                                  <span className="text-sm">{item.label}</span>
                                </div>
                              </Link>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                    
                    <div className="p-6 border-t border-white/10 space-y-3">
                      {!isAuthenticated && (
                        <Button 
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.location.href = '/api/login';
                          }}
                          variant="ghost"
                          className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 border border-white/20 min-h-[44px]"
                          data-testid="button-mobile-login"
                        >
                          <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                          Login with Replit
                        </Button>
                      )}
                      
                      {(!user?.isPro) && (
                        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                          <Button 
                            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-semibold shadow-lg min-h-[44px]"
                            data-testid="button-mobile-upgrade"
                          >
                            <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                            Upgrade to Pro
                          </Button>
                        </Link>
                      )}
                      
                      {isAuthenticated && (
                        <>
                          <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                            <Button 
                              variant="ghost"
                              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 min-h-[44px]"
                              data-testid="button-mobile-settings"
                            >
                              <SettingsIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                              Settings
                            </Button>
                          </Link>
                          <Button 
                            onClick={() => {
                              setMobileMenuOpen(false);
                              window.location.href = '/api/logout';
                            }}
                            variant="ghost"
                            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 min-h-[44px]"
                            data-testid="button-mobile-logout"
                          >
                            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                            Logout
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
