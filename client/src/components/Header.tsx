import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, LogIn, LogOut, User, ChevronDown, ChevronRight,
  Settings as SettingsIcon, Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Advertisement } from "@/components/Advertisement";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearchTrigger } from "@/components/GlobalSearch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoUrl from "@assets/6_1764040628012.png";

// Primary navigation links for quick access
const primaryNavLinks = [
  { href: "/cleanbi", label: "CLEANBI™" },
  { href: "/directory", label: "Directory" },
  { href: "/funding", label: "Funding" },
  { href: "/calculators", label: "Calculators" },
  { href: "/pricing", label: "Pricing" },
];

// Mega menu sections with sub-items
const navigationSections = [
  {
    id: "tools",
    title: "Business Tools",
    items: [
      { href: "/cleanbi", label: "CLEANBI™ Location Analysis" },
      { href: "/utility-bill-auditor", label: "Utility Bill Auditor" },
      { href: "/calculators", label: "All Calculators" },
    ]
  },
  {
    id: "directory",
    title: "Directory",
    items: [
      { href: "/directory", label: "Browse All Listings" },
      { href: "/directory?category=laundromats", label: "Laundromats for Sale" },
      { href: "/directory?category=equipment", label: "Equipment" },
      { href: "/directory?category=services", label: "Service Providers" },
    ]
  },
  {
    id: "resources",
    title: "Resources",
    items: [
      { href: "/funding", label: "Funding & Financing" },
      { href: "/blog", label: "Industry Blog" },
      { href: "/about", label: "About WashBizHub" },
      { href: "/pricing", label: "Pricing Plans" },
    ]
  },
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
      
      <div className="bg-[#1e3a5f] border-b border-gold-500/10" data-testid="trust-bar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-2 gap-4 sm:gap-6 md:gap-10 text-xs sm:text-sm">
            <span className="text-white/70 hidden sm:inline">220+ Countries</span>
            <span className="text-white/70 hidden sm:inline">•</span>
            <span className="text-white font-medium">72,000+ Members</span>
            <span className="text-white/70 hidden md:inline">•</span>
            <span className="text-white/70 hidden md:inline">50+ Business Tools</span>
            <span className="text-white/70 hidden lg:inline">•</span>
            <span className="text-gold-400 font-semibold hidden lg:inline">#1 Laundromat Platform</span>
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
              {/* Primary Nav Links */}
              {primaryNavLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  <span 
                    className={`text-sm font-medium transition-colors relative group cursor-pointer ${
                      location === link.href || location.startsWith(link.href + '?')
                        ? 'text-gold-400' 
                        : 'text-white/90 hover:text-white'
                    }`}
                    data-testid={`link-nav-${link.href.replace('/', '')}-quick`}
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              ))}

              {/* More dropdown for secondary items */}
              <div 
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  className="flex items-center gap-1.5 text-white/80 font-medium text-sm transition-all duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 group"
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  aria-expanded={megaMenuOpen}
                  aria-haspopup="true"
                  aria-label="More options"
                  data-testid="button-mega-menu"
                >
                  <span className="relative">
                    More
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover:w-full" />
                  </span>
                  <ChevronDown 
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} 
                    aria-hidden="true" 
                  />
                </button>

                <div 
                  className={`absolute top-full right-0 pt-2 transition-all duration-200 ${
                    megaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                  data-testid="mega-menu-panel"
                >
                  <div className="bg-[#1e3a5f]/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 min-w-[200px]">
                    <ul className="space-y-1">
                      <li>
                        <Link href="/utility-bill-auditor">
                          <div 
                            className="px-3 py-2 text-sm text-white/80 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer"
                            onClick={() => setMegaMenuOpen(false)}
                            data-testid="link-nav-utility-bill-auditor"
                          >
                            Utility Bill Auditor
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/blog">
                          <div 
                            className="px-3 py-2 text-sm text-white/80 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer"
                            onClick={() => setMegaMenuOpen(false)}
                            data-testid="link-nav-blog"
                          >
                            Industry Blog
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/about">
                          <div 
                            className="px-3 py-2 text-sm text-white/80 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer"
                            onClick={() => setMegaMenuOpen(false)}
                            data-testid="link-nav-about"
                          >
                            About Us
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden xl:block">
                <Advertisement placement="header" />
              </div>
              
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
                    
                    <div className="flex-1 overflow-y-auto">
                      {/* Primary Quick Links - Always Visible */}
                      <div className="p-4 space-y-2 border-b border-white/10">
                        {primaryNavLinks.map((link) => (
                          <Link href={link.href} key={link.href}>
                            <div 
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                location === link.href || location.startsWith(link.href + '?')
                                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                                  : 'text-white hover:bg-white/10'
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                              data-testid={`link-mobile-${link.href.replace('/', '')}-quick`}
                            >
                              {link.label}
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Secondary Links - Collapsible */}
                      <div className="py-2">
                        <Collapsible 
                          open={expandedSections.includes('more')}
                          onOpenChange={() => toggleSection('more')}
                        >
                          <CollapsibleTrigger 
                            className="flex items-center justify-between w-full px-6 py-3 min-h-[44px] text-left hover:bg-white/5 transition-colors"
                            data-testid="button-mobile-section-more"
                          >
                            <span className="text-white/70 font-medium text-sm">
                              More Options
                            </span>
                            <ChevronRight 
                              className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                                expandedSections.includes('more') ? 'rotate-90' : ''
                              }`} 
                              aria-hidden="true" 
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="bg-white/5">
                            <Link href="/utility-bill-auditor">
                              <div 
                                className="px-6 pl-10 py-3 min-h-[44px] text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                                data-testid="link-mobile-utility-bill-auditor"
                              >
                                Utility Bill Auditor
                              </div>
                            </Link>
                            <Link href="/blog">
                              <div 
                                className="px-6 pl-10 py-3 min-h-[44px] text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                                data-testid="link-mobile-blog"
                              >
                                Industry Blog
                              </div>
                            </Link>
                            <Link href="/about">
                              <div 
                                className="px-6 pl-10 py-3 min-h-[44px] text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                                data-testid="link-mobile-about"
                              >
                                About Us
                              </div>
                            </Link>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
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
