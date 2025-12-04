import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, LogIn, LogOut, User, ChevronDown, ChevronRight,
  Settings as SettingsIcon, Zap, MapPin, FolderOpen, DollarSign, Calculator, CreditCard,
  Store, Users, HelpCircle, Building2, Handshake
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearchTrigger } from "@/components/GlobalSearch";
import { UsageIndicator } from "@/components/UsageIndicator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoUrl from "@assets/6_1764040628012.png";

const primaryNavLinks = [
  { href: "/our-partnership", label: "Nick & Larry", icon: Handshake },
  { href: "/buy-laundromat", label: "Buy", icon: Store },
  { href: "/brokers", label: "Brokers", icon: Users },
  { href: "/directory", label: "Directory", icon: FolderOpen },
  { href: "/funding", label: "Funding", icon: DollarSign },
];

const secondaryLinks = [
  { href: "/list-on-washbizhub", label: "List on WashBizHub", featured: true },
  { href: "/calculators", label: "Calculators" },
  { href: "/utility-bill-auditor", label: "Utility Bill Auditor" },
  { href: "/blog", label: "Industry Blog" },
  { href: "/pricing", label: "Pricing" },
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-accent focus:text-accent-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-accent-foreground focus:ring-offset-2"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
      {/* Stripe-style top announcement bar */}
      <div className="bg-primary" data-testid="trust-bar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-primary-foreground font-medium">72,000+ Members</span>
              <span className="text-primary-foreground/40 hidden sm:inline">|</span>
              <span className="text-primary-foreground/80 hidden sm:inline">50+ Business Tools</span>
              <span className="text-primary-foreground/40 hidden lg:inline">|</span>
              <span className="text-accent font-semibold hidden lg:inline">#1 Laundromat Platform</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <a 
                href="mailto:consult@washbizhub.com" 
                className="text-primary-foreground/90 hover:text-primary-foreground font-medium hidden sm:flex items-center gap-1.5"
                data-testid="link-email"
              >
                consult@washbizhub.com
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stripe-style clean header with dark mode support */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 bg-background ${
          isScrolled 
            ? 'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)]' 
            : 'border-b border-border'
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
                <span className="hidden sm:block text-xl font-bold text-primary dark:text-foreground tracking-tight">
                  WashBizHub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Stripe style */}
            <nav className="hidden lg:flex items-center gap-2" role="navigation" aria-label="Main navigation">
              {/* Featured CLEANBI Explorer - THE main feature */}
              <Link href="/cleanbi-explorer">
                <span 
                  className="cleanbi-featured-nav"
                  data-testid="link-nav-cleanbi-explorer-featured"
                >
                  <MapPin className="w-4 h-4 cleanbi-icon" aria-hidden="true" />
                  Score Any Location
                </span>
              </Link>
              
              {primaryNavLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  <span 
                    className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      location === link.href || location.startsWith(link.href + '?')
                        ? 'text-accent bg-accent/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                      ? 'text-foreground bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                  <div className="bg-popover border border-border rounded-xl shadow-xl p-2 min-w-[220px]">
                    {secondaryLinks.map((link) => (
                      <Link href={link.href} key={link.href}>
                        <div 
                          className={`px-4 py-2.5 text-sm rounded-lg transition-colors cursor-pointer font-medium ${
                            (link as any).featured 
                              ? 'text-accent bg-accent/10 hover:bg-accent/20' 
                              : 'text-popover-foreground hover:bg-muted hover:text-foreground'
                          }`}
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
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Settings"
                          data-testid="button-settings"
                        >
                          <SettingsIcon className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                      
                      <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm px-3 py-1.5 bg-muted rounded-full">
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span className="font-medium max-w-[100px] truncate">
                          {user?.firstName || user?.email || 'User'}
                        </span>
                      </div>
                      
                      <div className="hidden sm:block">
                        <UsageIndicator compact />
                      </div>
                      
                      <Button 
                        onClick={() => window.location.href = '/api/logout'}
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex text-muted-foreground hover:text-foreground"
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
                      className="hidden sm:flex text-muted-foreground hover:text-foreground font-medium"
                      data-testid="button-login"
                    >
                      <LogIn className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Sign in
                    </Button>
                  )}
                  
                  {/* Need Help Selling CTA */}
                  <Link href="/sell-your-laundromat" className="hidden md:block">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-medium"
                      data-testid="button-sell-help"
                    >
                      <HelpCircle className="w-4 h-4 mr-1.5" aria-hidden="true" />
                      <span className="hidden lg:inline">Need Help Selling?</span>
                      <span className="lg:hidden">Sell</span>
                    </Button>
                  </Link>
                  
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
                    className="lg:hidden text-white dark:text-muted-foreground hover:text-white/80 dark:hover:text-foreground"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[320px] sm:w-[380px] bg-card dark:bg-card border-l border-border p-0"
                  data-testid="nav-mobile-drawer"
                >
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-6 border-b border-border">
                      <SheetTitle className="text-card-foreground dark:text-white text-xl font-bold">
                        Menu
                      </SheetTitle>
                      <SheetDescription className="sr-only">
                        Navigation menu with links to all WashBizHub sections
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto">
                      {/* Featured CLEANBI Explorer - Primary CTA */}
                      <div className="p-4 pb-2">
                        <Link href="/cleanbi-explorer" onClick={() => setMobileMenuOpen(false)}>
                          <div 
                            className="cleanbi-featured-mobile"
                            data-testid="link-mobile-cleanbi-explorer-featured"
                          >
                            <MapPin className="cleanbi-icon" aria-hidden="true" />
                            Score Any Location
                          </div>
                        </Link>
                      </div>
                      
                      {/* Primary Links */}
                      <div className="p-4 pt-2 space-y-1">
                        {primaryNavLinks.map((link) => (
                          <Link href={link.href} key={link.href}>
                            <div 
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                location === link.href || location.startsWith(link.href + '?')
                                  ? 'bg-accent/15 text-accent dark:text-accent border border-accent/30'
                                  : 'text-card-foreground dark:text-white/90 hover:bg-muted dark:hover:bg-white/10'
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
                      <div className="border-t border-border py-2">
                        <Collapsible 
                          open={expandedSections.includes('more')}
                          onOpenChange={() => toggleSection('more')}
                        >
                          <CollapsibleTrigger 
                            className="flex items-center justify-between w-full px-6 py-3 text-left hover:bg-muted dark:hover:bg-white/10 transition-colors"
                            data-testid="button-mobile-section-more"
                          >
                            <span className="text-card-foreground/70 dark:text-white/70 font-medium text-sm">
                              More Options
                            </span>
                            <ChevronRight 
                              className={`w-4 h-4 text-card-foreground/70 dark:text-white/70 transition-transform duration-200 ${
                                expandedSections.includes('more') ? 'rotate-90' : ''
                              }`} 
                              aria-hidden="true" 
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="bg-muted/30 dark:bg-white/5">
                            {secondaryLinks.map((link) => (
                              <Link href={link.href} key={link.href}>
                                <div 
                                  className="px-6 pl-10 py-3 text-card-foreground/80 dark:text-white/80 hover:bg-muted dark:hover:bg-white/10 hover:text-card-foreground dark:hover:text-white transition-colors cursor-pointer text-sm font-medium"
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
                    <div className="p-6 border-t border-border space-y-3 bg-muted/30 dark:bg-white/5">
                      {!isAuthenticated && (
                        <Button 
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.location.href = '/api/login';
                          }}
                          variant="outline"
                          className="w-full justify-center font-medium text-card-foreground dark:text-white border-border dark:border-white/20"
                          data-testid="button-mobile-login"
                        >
                          <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                          Sign in with Replit
                        </Button>
                      )}
                      
                      {/* Need Help Selling CTA - Mobile */}
                      <Link href="/sell-your-laundromat" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          variant="outline"
                          className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground font-medium"
                          data-testid="button-mobile-sell-help"
                        >
                          <HelpCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                          Need Help Selling?
                        </Button>
                      </Link>
                      
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
                          <div className="flex items-center justify-between px-4 py-2 mb-2 bg-muted/50 rounded-lg">
                            <span className="text-sm text-card-foreground/70 dark:text-white/70 font-medium">CLEANBI Usage</span>
                            <UsageIndicator />
                          </div>
                          <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                            <Button 
                              variant="ghost"
                              className="w-full justify-start text-card-foreground/80 dark:text-white/80 hover:text-card-foreground dark:hover:text-white"
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
                            className="w-full justify-start text-card-foreground/80 dark:text-white/80 hover:text-card-foreground dark:hover:text-white"
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
