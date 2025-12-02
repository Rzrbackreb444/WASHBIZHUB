import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, LogIn, LogOut, User, ChevronDown, ChevronRight,
  Settings as SettingsIcon, Zap, MapPin, FolderOpen, DollarSign, Calculator, CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearchTrigger } from "@/components/GlobalSearch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoUrl from "@assets/6_1764040628012.png";

const primaryNavLinks = [
  { href: "/cleanbi", label: "CLEANBI™", icon: MapPin },
  { href: "/directory", label: "Directory", icon: FolderOpen },
  { href: "/funding", label: "Funding", icon: DollarSign },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

const secondaryLinks = [
  { href: "/utility-bill-auditor", label: "Utility Bill Auditor" },
  { href: "/blog", label: "Industry Blog" },
  { href: "/about", label: "About Us" },
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-[#b8860b] focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
      {/* Stripe-style top announcement bar */}
      <div className="bg-[#1e3a5f]" data-testid="trust-bar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-2.5 gap-4 sm:gap-8 text-xs sm:text-sm">
            <span className="text-white/80 hidden sm:inline">220+ Countries</span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="text-white font-medium">72,000+ Members</span>
            <span className="text-white/40 hidden md:inline">|</span>
            <span className="text-white/80 hidden md:inline">50+ Business Tools</span>
            <span className="text-white/40 hidden lg:inline">|</span>
            <span className="text-[#d4a030] font-semibold hidden lg:inline">#1 Laundromat Platform</span>
          </div>
        </div>
      </div>
      
      {/* Stripe-style clean white header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 bg-white ${
          isScrolled 
            ? 'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]' 
            : 'border-b border-gray-100'
        }`}
        data-testid="header-main"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" aria-label="WashBizHub Home">
              <div 
                className="flex items-center gap-3 cursor-pointer rounded-lg py-1 transition-opacity duration-200 hover:opacity-80" 
                data-testid="link-logo"
              >
                <img 
                  src={logoUrl} 
                  alt="WashBizHub" 
                  className="h-10 w-auto" 
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width={40}
                  height={40}
                />
                <span className="hidden sm:block text-xl font-bold text-[#1e3a5f] tracking-tight">
                  WashBizHub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Stripe style */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {primaryNavLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  <span 
                    className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      location === link.href || location.startsWith(link.href + '?')
                        ? 'text-[#b8860b] bg-[#b8860b]/5' 
                        : 'text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-50'
                    }`}
                    data-testid={`link-nav-${link.href.replace('/', '')}-quick`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}

              {/* More dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                    megaMenuOpen
                      ? 'text-[#1e3a5f] bg-gray-50'
                      : 'text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-50'
                  }`}
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  aria-expanded={megaMenuOpen}
                  aria-haspopup="true"
                  aria-label="More options"
                  data-testid="button-mega-menu"
                >
                  More
                  <ChevronDown 
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} 
                    aria-hidden="true" 
                  />
                </button>

                {/* Dropdown menu - Stripe style */}
                <div 
                  className={`absolute top-full right-0 pt-2 transition-all duration-200 ${
                    megaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                  data-testid="mega-menu-panel"
                >
                  <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-2 min-w-[220px]">
                    {secondaryLinks.map((link) => (
                      <Link href={link.href} key={link.href}>
                        <div 
                          className="px-4 py-2.5 text-sm text-gray-700 rounded-lg transition-colors hover:bg-gray-50 hover:text-[#1e3a5f] cursor-pointer font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                          data-testid={`link-nav-${link.href.replace('/', '')}`}
                        >
                          {link.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <GlobalSearchTrigger />
              
              <ThemeToggle />
              
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link href="/settings" className="hidden sm:block">
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-[#1e3a5f] hover:bg-gray-100"
                          aria-label="Settings"
                          data-testid="button-settings"
                        >
                          <SettingsIcon className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                      
                      <div className="hidden md:flex items-center gap-2 text-gray-600 text-sm px-3 py-1.5 bg-gray-100 rounded-full">
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span className="font-medium max-w-[100px] truncate">
                          {user?.firstName || user?.email || 'User'}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => window.location.href = '/api/logout'}
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100"
                        data-testid="button-logout"
                      >
                        <LogOut className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        <span className="hidden md:inline">Logout</span>
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => window.location.href = '/api/login'}
                      variant="ghost"
                      size="sm"
                      className="hidden sm:flex text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100 font-medium"
                      data-testid="button-login"
                    >
                      <LogIn className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Sign in
                    </Button>
                  )}
                  
                  {(!user?.isPro) && (
                    <Link href="/pricing" className="hidden sm:block">
                      <Button 
                        className="btn-premium-gold text-white font-semibold rounded-lg px-4"
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
              
              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[320px] sm:w-[380px] bg-white border-l border-gray-200 p-0"
                  data-testid="nav-mobile-drawer"
                >
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-6 border-b border-gray-100">
                      <SheetTitle className="text-[#1e3a5f] text-xl font-bold">
                        Menu
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto">
                      {/* Primary Links */}
                      <div className="p-4 space-y-1">
                        {primaryNavLinks.map((link) => (
                          <Link href={link.href} key={link.href}>
                            <div 
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                location === link.href || location.startsWith(link.href + '?')
                                  ? 'bg-[#b8860b]/10 text-[#b8860b] border border-[#b8860b]/20'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                              data-testid={`link-mobile-${link.href.replace('/', '')}-quick`}
                            >
                              <link.icon className="w-5 h-5" />
                              {link.label}
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Secondary Links */}
                      <div className="border-t border-gray-100 py-2">
                        <Collapsible 
                          open={expandedSections.includes('more')}
                          onOpenChange={() => toggleSection('more')}
                        >
                          <CollapsibleTrigger 
                            className="flex items-center justify-between w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors"
                            data-testid="button-mobile-section-more"
                          >
                            <span className="text-gray-500 font-medium text-sm">
                              More Options
                            </span>
                            <ChevronRight 
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                expandedSections.includes('more') ? 'rotate-90' : ''
                              }`} 
                              aria-hidden="true" 
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="bg-gray-50">
                            {secondaryLinks.map((link) => (
                              <Link href={link.href} key={link.href}>
                                <div 
                                  className="px-6 pl-10 py-3 text-gray-600 hover:bg-gray-100 hover:text-[#1e3a5f] transition-colors cursor-pointer text-sm font-medium"
                                  onClick={() => setMobileMenuOpen(false)}
                                  data-testid={`link-mobile-${link.href.replace('/', '')}`}
                                >
                                  {link.label}
                                </div>
                              </Link>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                    
                    {/* Bottom actions */}
                    <div className="p-6 border-t border-gray-100 space-y-3 bg-gray-50">
                      {!isAuthenticated && (
                        <Button 
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.location.href = '/api/login';
                          }}
                          variant="outline"
                          className="w-full justify-center text-[#1e3a5f] border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5 font-medium"
                          data-testid="button-mobile-login"
                        >
                          <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                          Sign in with Replit
                        </Button>
                      )}
                      
                      {(!user?.isPro) && (
                        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                          <Button 
                            className="w-full btn-premium-gold text-white font-semibold"
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
                              className="w-full justify-start text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100"
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
                            className="w-full justify-start text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100"
                            data-testid="button-mobile-logout"
                          >
                            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                            Sign out
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
