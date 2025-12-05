import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, LogIn, LogOut, User, ChevronDown, ChevronRight, X,
  Settings as SettingsIcon, Zap, MapPin, FolderOpen, DollarSign, Calculator, 
  Store, Users, HelpCircle, Handshake, MessageSquare, BookOpen, TrendingUp,
  FileText, Wrench, BarChart3, Building2, Sparkles, Star
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearchTrigger } from "@/components/GlobalSearch";
import { UsageIndicator } from "@/components/UsageIndicator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import logoUrl from "@assets/6_1764040628012.png";

const megaMenuSections = [
  {
    id: "discover",
    title: "Discover",
    items: [
      { href: "/cleanbi-explorer", label: "Score Any Location", icon: MapPin, featured: true, description: "AI-powered location analysis" },
      { href: "/buy-laundromat", label: "Buy a Laundromat", icon: Store, description: "Browse listings for sale" },
      { href: "/directory", label: "Business Directory", icon: FolderOpen, description: "Find vendors & services" },
    ]
  },
  {
    id: "tools",
    title: "Business Tools",
    items: [
      { href: "/calculators", label: "Calculators Suite", icon: Calculator, description: "ROI, valuation & more" },
      { href: "/utility-bill-auditor", label: "Utility Bill Auditor", icon: BarChart3, description: "Reduce operating costs" },
      { href: "/equipment-diagnostics", label: "Equipment Diagnostics", icon: Wrench, description: "Troubleshoot machines" },
    ]
  },
  {
    id: "resources",
    title: "Resources",
    items: [
      { href: "/blog", label: "Industry Blog", icon: FileText, description: "Expert insights & news" },
      { href: "/courses", label: "Academy", icon: BookOpen, description: "Learn from pros" },
      { href: "/funding", label: "Funding Options", icon: TrendingUp, description: "Finance your growth" },
    ]
  },
  {
    id: "connect",
    title: "Connect",
    items: [
      { href: "/our-partnership", label: "Nick & Larry", icon: Handshake, description: "Meet our founders" },
      { href: "/brokers", label: "Find Brokers", icon: Users, description: "Verified professionals" },
      { href: "/forum", label: "Community Forum", icon: MessageSquare, description: "Join 72,000+ members" },
    ]
  }
];

const quickNavLinks = [
  { href: "/cleanbi-explorer", label: "Score Location", icon: MapPin, featured: true },
  { href: "/buy-laundromat", label: "Buy", icon: Store },
  { href: "/forum", label: "Community", icon: MessageSquare },
  { href: "/funding", label: "Funding", icon: DollarSign },
];

const featuredActions = [
  { href: "/list-on-washbizhub", label: "List Your Business", icon: Star, primary: true },
  { href: "/pricing", label: "View Pricing", icon: Sparkles },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    if (megaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [megaMenuOpen]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -8,
      scale: 0.96,
      transition: { duration: 0.15, ease: "easeIn" }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.03, duration: 0.15 }
    })
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 + i * 0.05, duration: 0.2, ease: "easeOut" }
    })
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
      
      {/* Top announcement bar */}
      <div className="bg-primary" data-testid="header-trust-bar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-primary-foreground font-medium" data-testid="text-member-count">72,000+ Members</span>
              <span className="text-primary-foreground/40 hidden sm:inline">|</span>
              <span className="text-primary-foreground/80 hidden sm:inline" data-testid="text-tools-count">50+ Business Tools</span>
              <span className="text-primary-foreground/40 hidden lg:inline">|</span>
              <span className="text-accent font-semibold hidden lg:inline" data-testid="text-platform-rank">#1 Laundromat Platform</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <a 
                href="mailto:consult@washbizhub.com" 
                className="text-primary-foreground/90 hover:text-primary-foreground font-medium hidden sm:flex items-center gap-1.5 transition-colors"
                data-testid="link-email-contact"
              >
                consult@washbizhub.com
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main header with smooth sticky shadow */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 bg-background/95 backdrop-blur-md ${
          isScrolled 
            ? 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_6px_16px_rgba(0,0,0,0.3)]' 
            : 'border-b border-border/60'
        }`}
        data-testid="header-main"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo with hover animation */}
            <Link href="/" aria-label="WashBizHub Home">
              <motion.div 
                className="flex items-center gap-3 cursor-pointer rounded-lg py-1" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
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
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {/* Quick nav links with hover animations */}
              {quickNavLinks.map((link, index) => (
                <Link href={link.href} key={link.href}>
                  <motion.span 
                    className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      link.featured
                        ? 'cleanbi-featured-nav'
                        : location === link.href || location.startsWith(link.href + '?')
                          ? 'text-accent bg-accent/10' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    data-testid={`link-nav-${link.href.replace('/', '')}`}
                  >
                    {link.featured && <link.icon className="w-4 h-4 cleanbi-icon" aria-hidden="true" />}
                    {link.label}
                  </motion.span>
                </Link>
              ))}

              {/* Mega Menu dropdown */}
              <div 
                className="relative"
                ref={megaMenuRef}
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <motion.button
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    megaMenuOpen
                      ? 'text-foreground bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  aria-expanded={megaMenuOpen}
                  aria-haspopup="true"
                  aria-label="More options menu"
                  data-testid="button-mega-menu-trigger"
                >
                  More
                  <motion.span
                    animate={{ rotate: megaMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  </motion.span>
                </motion.button>

                {/* Premium Mega Menu Panel */}
                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div 
                      className="absolute top-full right-0 pt-3 z-50"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      data-testid="mega-menu-panel"
                    >
                      <div className="bg-popover border border-border/80 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden min-w-[680px]">
                        {/* Menu Grid */}
                        <div className="p-5 grid grid-cols-2 gap-6">
                          {megaMenuSections.map((section, sectionIndex) => (
                            <div key={section.id} data-testid={`mega-menu-section-${section.id}`}>
                              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                                {section.title}
                              </h3>
                              <div className="space-y-1">
                                {section.items.map((item, itemIndex) => (
                                  <Link href={item.href} key={item.href}>
                                    <motion.div 
                                      className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                        item.featured 
                                          ? 'bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border border-accent/20' 
                                          : 'hover:bg-muted/80'
                                      }`}
                                      onClick={() => setMegaMenuOpen(false)}
                                      custom={sectionIndex * 3 + itemIndex}
                                      variants={menuItemVariants}
                                      initial="hidden"
                                      animate="visible"
                                      whileHover={{ x: 4 }}
                                      transition={{ duration: 0.15 }}
                                      data-testid={`link-mega-${item.href.replace('/', '')}`}
                                    >
                                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                                        item.featured 
                                          ? 'bg-accent text-accent-foreground' 
                                          : 'bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'
                                      } transition-colors`}>
                                        <item.icon className="w-4 h-4" aria-hidden="true" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${
                                          item.featured ? 'text-accent' : 'text-foreground'
                                        }`}>
                                          {item.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                          {item.description}
                                        </p>
                                      </div>
                                      {item.featured && (
                                        <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-1" aria-hidden="true" />
                                      )}
                                    </motion.div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Featured Actions Footer */}
                        <div className="px-5 py-4 bg-muted/50 border-t border-border/60 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {featuredActions.map((action) => (
                              <Link href={action.href} key={action.href}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button 
                                    variant={action.primary ? "default" : "outline"}
                                    size="sm"
                                    className={action.primary ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}
                                    onClick={() => setMegaMenuOpen(false)}
                                    data-testid={`button-mega-${action.href.replace('/', '')}`}
                                  >
                                    <action.icon className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                                    {action.label}
                                  </Button>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Press <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px] font-mono">/</kbd> to search
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                      
                      <motion.div 
                        className="hidden md:flex items-center gap-2 text-muted-foreground text-sm px-3 py-1.5 bg-muted/80 rounded-full border border-border/50"
                        whileHover={{ scale: 1.02 }}
                        data-testid="display-user-info"
                      >
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span className="font-medium max-w-[100px] truncate">
                          {user?.firstName || user?.email || 'User'}
                        </span>
                      </motion.div>
                      
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
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => window.location.href = '/api/login'}
                        variant="default"
                        size="sm"
                        className="hidden sm:flex font-medium"
                        data-testid="button-login"
                      >
                        <LogIn className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        Sign in
                      </Button>
                    </motion.div>
                  )}
                  
                  {/* Need Help Selling CTA */}
                  <Link href="/sell-your-laundromat" className="hidden md:block">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                    </motion.div>
                  </Link>
                  
                  {(!user?.isPro) && (
                    <Link href="/pricing" className="hidden sm:block">
                      <motion.div 
                        whileHover={{ scale: 1.03 }} 
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button 
                          className="btn-premium-gold text-white font-semibold rounded-lg px-4"
                          size="sm"
                          data-testid="button-upgrade"
                        >
                          <Zap className="w-4 h-4 mr-1.5" aria-hidden="true" />
                          <span className="hidden lg:inline">Upgrade to Pro</span>
                          <span className="lg:hidden">Pro</span>
                        </Button>
                      </motion.div>
                    </Link>
                  )}
                </>
              )}
              
              {/* Mobile menu with Sheet */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden text-foreground hover:text-foreground/80"
                      aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                      data-testid="button-mobile-menu-trigger"
                    >
                      <Menu className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[320px] sm:w-[380px] bg-card dark:bg-card border-l border-border p-0 overflow-hidden"
                  data-testid="mobile-drawer-panel"
                >
                  <div className="flex flex-col h-full">
                    {/* Mobile Header with Premium Close Button */}
                    <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-muted/50 to-background">
                      <SheetHeader className="flex-1">
                        <SheetTitle className="text-foreground text-xl font-bold flex items-center gap-2">
                          <img src={logoUrl} alt="" className="h-6 w-auto" />
                          Menu
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                          Navigation menu with links to all WashBizHub sections
                        </SheetDescription>
                      </SheetHeader>
                      <SheetClose asChild>
                        <motion.button
                          className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                          whileHover={{ scale: 1.05, rotate: 90 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Close menu"
                          data-testid="button-mobile-close"
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
                        </motion.button>
                      </SheetClose>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {/* Featured CLEANBI Explorer - Primary CTA */}
                      <motion.div 
                        className="p-4 pb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Link href="/cleanbi-explorer" onClick={() => setMobileMenuOpen(false)}>
                          <motion.div 
                            className="cleanbi-featured-mobile"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            data-testid="link-mobile-cleanbi-explorer"
                          >
                            <MapPin className="cleanbi-icon" aria-hidden="true" />
                            Score Any Location
                          </motion.div>
                        </Link>
                      </motion.div>
                      
                      {/* Mobile Menu Sections */}
                      <div className="px-4 pt-2 space-y-4">
                        {megaMenuSections.map((section, sectionIndex) => (
                          <Collapsible 
                            key={section.id}
                            open={expandedSections.includes(section.id)}
                            onOpenChange={() => toggleSection(section.id)}
                          >
                            <motion.div
                              custom={sectionIndex}
                              variants={mobileItemVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <CollapsibleTrigger 
                                className="flex items-center justify-between w-full py-3 px-2 text-left rounded-lg hover:bg-muted/50 transition-colors group"
                                data-testid={`button-mobile-section-${section.id}`}
                              >
                                <span className="text-foreground font-semibold text-sm">
                                  {section.title}
                                </span>
                                <motion.span
                                  animate={{ rotate: expandedSections.includes(section.id) ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight 
                                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" 
                                    aria-hidden="true" 
                                  />
                                </motion.span>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <AnimatePresence>
                                  <motion.div 
                                    className="pl-2 pt-1 pb-2 space-y-1"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {section.items.map((item, itemIndex) => (
                                      <Link href={item.href} key={item.href}>
                                        <motion.div 
                                          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                                            item.featured
                                              ? 'bg-accent/10 text-accent border border-accent/20'
                                              : location === item.href 
                                                ? 'bg-muted text-foreground'
                                                : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground'
                                          }`}
                                          onClick={() => setMobileMenuOpen(false)}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: itemIndex * 0.05 }}
                                          whileTap={{ scale: 0.98 }}
                                          data-testid={`link-mobile-${item.href.replace('/', '')}`}
                                        >
                                          <div className={`p-1.5 rounded-md ${
                                            item.featured 
                                              ? 'bg-accent/20 text-accent' 
                                              : 'bg-muted text-muted-foreground'
                                          }`}>
                                            <item.icon className="w-4 h-4" aria-hidden="true" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                        </motion.div>
                                      </Link>
                                    ))}
                                  </motion.div>
                                </AnimatePresence>
                              </CollapsibleContent>
                            </motion.div>
                          </Collapsible>
                        ))}
                      </div>
                    </div>
                    
                    {/* Bottom actions with gradient background */}
                    <motion.div 
                      className="p-5 border-t border-border space-y-3 bg-gradient-to-t from-muted/80 to-muted/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {!isAuthenticated && (
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button 
                            onClick={() => {
                              setMobileMenuOpen(false);
                              window.location.href = '/api/login';
                            }}
                            variant="default"
                            className="w-full justify-center font-medium h-11"
                            data-testid="button-mobile-login"
                          >
                            <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                            Sign in
                          </Button>
                        </motion.div>
                      )}
                      
                      {/* Need Help Selling CTA - Mobile */}
                      <Link href="/sell-your-laundromat" onClick={() => setMobileMenuOpen(false)}>
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button 
                            variant="outline"
                            className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground font-medium h-11"
                            data-testid="button-mobile-sell-help"
                          >
                            <HelpCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                            Need Help Selling?
                          </Button>
                        </motion.div>
                      </Link>
                      
                      {(!user?.isPro) && (
                        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                          <motion.div whileTap={{ scale: 0.98 }}>
                            <Button 
                              className="w-full btn-premium-gold text-white font-semibold h-11"
                              data-testid="button-mobile-upgrade"
                            >
                              <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                              Upgrade to Pro
                            </Button>
                          </motion.div>
                        </Link>
                      )}
                      
                      {isAuthenticated && (
                        <motion.div 
                          className="space-y-2 pt-2 border-t border-border/50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="flex items-center justify-between px-3 py-2.5 bg-background/80 dark:bg-background/50 rounded-xl border border-border/50">
                            <span className="text-sm text-foreground/90 font-medium">CLEANBI Usage</span>
                            <UsageIndicator />
                          </div>
                          <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                            <Button 
                              variant="ghost"
                              className="w-full justify-start text-foreground/90 hover:text-foreground h-10"
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
                            className="w-full justify-start text-foreground/90 hover:text-foreground h-10"
                            data-testid="button-mobile-logout"
                          >
                            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                            Sign out
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
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
