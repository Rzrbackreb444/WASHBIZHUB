import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  NavigationMenu as NavMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Menu,
  LogOut,
  Lightbulb,
  Target,
  Settings,
  Users,
  Calculator,
  DollarSign,
  BookOpen,
  GraduationCap,
  BarChart3,
  Store,
  ClipboardCheck,
  Monitor,
  Bot,
  Activity,
  Palette,
  Wrench,
  Library,
  Building2,
  TrendingUp,
  Mail,
  Search,
  MapPin,
  ChevronRight,
  X,
} from "lucide-react";
import logoUrl from "@assets/6_1764040628012.png";

const FB_GROUP_URL = "https://facebook.com/groups/thelaundromat";
const CHROME_EXTENSION_URL = "https://chrome.google.com/webstore/detail/cleanbi-anywhere";

const PLAN_LINKS = [
  { href: "/sba-readiness", label: "SBA Readiness Check", icon: Target, description: "Free 2-min loan qualification quiz" },
  { href: "/business-plan-generator", label: "Business Plan Generator", icon: BookOpen, description: "AI-powered SBA-ready plans" },
  { href: "/ai-consultation", label: "AI Consultation", icon: Bot, description: "Expert AI analysis for your deal" },
  { href: "/larry-larsen", label: "Expert Consulting", icon: Users, description: "50+ year industry veteran" },
  { href: "/calculators", label: "ROI Calculator", icon: Calculator, description: "Calculate potential returns" },
  { href: "/startup-funding", label: "Funding Options", icon: DollarSign, description: "Access capital for your business" },
  { href: "/blog", label: "Insights", icon: Lightbulb, description: "Articles and industry news" },
];

const EVALUATE_LINKS = [
  { href: "/cleanbi-auto", label: "CLEANBI Score", icon: BarChart3, description: "Location & business analysis" },
  { href: "/laundromat-listings", label: "Listings", icon: Store, description: "Browse available businesses" },
  { href: "/valuation-calculator", label: "Valuation", icon: DollarSign, description: "Fair market value calculator" },
  { href: "/distributor-locator", label: "Distributors", icon: MapPin, description: "Find authorized dealers" },
  { href: "/laundromat-locator", label: "Locator", icon: MapPin, description: "Search laundromat database" },
  { href: "/resources", label: "Due Diligence", icon: ClipboardCheck, description: "Pre-purchase checklist" },
];

const OPERATE_LINKS = [
  { href: "/pos-command-center", label: "POS System", icon: Monitor, description: "Payment & operations management" },
  { href: "/equipment-wizard", label: "Equipment Wizard", icon: Settings, description: "Machine selection tool" },
  { href: "/equipment-guides", label: "Equipment Guides", icon: BookOpen, description: "Brand comparisons" },
  { href: "/service-guy-ai", label: "Service AI", icon: Bot, description: "Equipment troubleshooting" },
  { href: "/equipment-diagnostics", label: "Diagnostics", icon: Activity, description: "Machine issue diagnosis" },
  { href: "/design-studio-pro", label: "Design Studio", icon: Palette, description: "Floor layout planning" },
  { href: "/equipment-marketplace", label: "Marketplace", icon: Wrench, description: "Equipment & parts" },
  { href: "/resources", label: "Resources", icon: Library, description: "Guides & templates" },
];

const PARTNER_LINKS = [
  { href: "/sell", label: "Sell Your Laundromat", icon: Store, description: "120+ buyers searching now", badge: "HOT" },
  { href: "/add-listing", label: "Add Listing", icon: Store, description: "List your business or service" },
  { href: "/list-equipment", label: "Sell Equipment", icon: Wrench, description: "List machines & parts" },
  { href: "/vendor-form", label: "Vendor Partnership", icon: Building2, description: "Become a supplier" },
  { href: "/advertise", label: "Advertising", icon: TrendingUp, description: "Reach industry professionals" },
];

const SECTION_NAV: Record<string, { label: string; links: { href: string; label: string }[] }> = {
  "/plan": {
    label: "Planning Tools",
    links: [
      { href: "/ai-consultation", label: "AI Council" },
      { href: "/calculators", label: "Calculators" },
      { href: "/startup-funding", label: "Funding" },
      { href: "/book", label: "The Bible" },
      { href: "/blog", label: "Blog" },
    ],
  },
  "/evaluate": {
    label: "Evaluation Tools",
    links: [
      { href: "/ai-consultation", label: "AI Council" },
      { href: "/cleanbi-auto", label: "CLEANBI" },
      { href: "/laundromat-listings", label: "Listings" },
      { href: "/valuation-calculator", label: "Valuation" },
      { href: "/distributor-locator", label: "Distributors" },
      { href: "/laundromat-locator", label: "Find Laundromats" },
    ],
  },
  "/operate": {
    label: "Operations",
    links: [
      { href: "/pos-command-center", label: "POS" },
      { href: "/equipment-wizard", label: "Equipment Wizard" },
      { href: "/equipment-guides", label: "Guides" },
      { href: "/service-guy-ai", label: "Service AI" },
      { href: "/equipment-diagnostics", label: "Diagnostics" },
    ],
  },
  "/partner": {
    label: "Partner With Us",
    links: [
      { href: "/sell", label: "Sell Laundromat" },
      { href: "/add-listing", label: "Add a Listing" },
      { href: "/vendor-form", label: "Become Vendor" },
      { href: "/advertise", label: "Advertise" },
    ],
  },
};

function getBreadcrumb(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  
  const breadcrumbs: { label: string; href: string }[] = [{ label: "Home", href: "/" }];
  
  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    breadcrumbs.push({ label, href: path });
  }
  
  return breadcrumbs;
}

function getContextualSection(pathname: string): string | null {
  if (pathname.startsWith("/calculator") || pathname.startsWith("/startup") || pathname.startsWith("/book") || pathname.startsWith("/blog") || pathname.startsWith("/consultation") || pathname.startsWith("/ai-consultation")) {
    return "/plan";
  }
  if (pathname.startsWith("/cleanbi") || pathname.startsWith("/laundromat-listing") || pathname.startsWith("/valuation") || pathname.startsWith("/resources") || pathname.startsWith("/distributor-locator") || pathname.startsWith("/laundromat-locator")) {
    return "/evaluate";
  }
  if (pathname.startsWith("/pos") || pathname.startsWith("/service") || pathname.startsWith("/equipment") || pathname.startsWith("/design")) {
    return "/operate";
  }
  if (pathname.startsWith("/listing-form") || pathname.startsWith("/list-") || pathname.startsWith("/vendor") || pathname.startsWith("/advertise")) {
    return "/partner";
  }
  return null;
}

interface MegamenuItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
  onClick?: () => void;
}

function MegamenuItem({ href, label, icon: Icon, description, onClick }: MegamenuItemProps) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        onClick={onClick}
        className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-muted focus:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-2"
        data-testid={`link-megamenu-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-foreground">{label}</span>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

interface MobileNavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  testId: string;
}

function MobileNavLink({ href, label, icon: Icon, isActive, onClick, testId }: MobileNavLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Link href={href} ref={linkRef}>
      <motion.div
        className={`flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm transition-colors cursor-pointer select-none ${
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "hover:bg-muted active:bg-muted/80"
        }`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
            linkRef.current?.click();
          }
        }}
        tabIndex={0}
        role="menuitem"
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        data-testid={testId}
      >
        <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
        <span className="flex-1">{label}</span>
        {isActive && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </Link>
  );
}

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openAccordions, setOpenAccordions] = useState<string[]>(["plan"]);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);

  const isActive = useMemo(() => (path: string) => location === path, [location]);
  const breadcrumbs = useMemo(() => getBreadcrumb(location), [location]);
  const contextSection = useMemo(() => getContextualSection(location), [location]);
  const isHomePage = location === "/" || location === "";
  const showUtilityRail = !isHomePage && (breadcrumbs.length > 1 || contextSection);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (mobileOpen && firstFocusableRef.current) {
      const timer = setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  useEffect(() => {
    closeMobileMenu();
  }, [location, closeMobileMenu]);

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
    <header className="sticky top-0 z-50">
      <div className="bg-[#0a1628] text-white/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 flex items-center justify-between text-xs">
            <a 
              href="mailto:nick@washbizhub.com" 
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors min-h-[44px] px-1"
              data-testid="link-contact-email"
            >
              <Mail className="w-3 h-3" />
              <span>nick@washbizhub.com</span>
            </a>
            <span className="sm:hidden text-white/60">WashBizHub</span>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              
              {isLoading ? (
                <div className="w-12 h-4 bg-white/10 rounded animate-pulse" data-testid="skeleton-auth" />
              ) : isAuthenticated && user ? (
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 hover:text-white transition-colors min-h-[44px] min-w-[44px] px-2 justify-center"
                  data-testid="button-logout"
                  aria-label="Sign out of your account"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              ) : (
                <a 
                  href="/api/login"
                  className="hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2"
                  data-testid="link-login"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f1a2b] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link 
              href="/" 
              data-testid="link-logo" 
              aria-label="WashBizHub Home"
              className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1"
            >
              <img 
                src={logoUrl} 
                alt="WashBizHub" 
                className="h-10 w-auto" 
                loading="eager"
                decoding="async"
                {...{ fetchpriority: "high" }}
                width={40}
                height={40}
                data-testid="img-logo"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              <NavMenu>
                <NavigationMenuList className="gap-0">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-10 px-4 text-sm font-medium bg-transparent"
                      data-testid="dropdown-plan"
                    >
                      Plan
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-3 bg-popover">
                        <ul className="space-y-0.5" role="menu">
                          {PLAN_LINKS.map((link) => (
                            <li key={link.href + link.label} role="none">
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-10 px-4 text-sm font-medium bg-transparent"
                      data-testid="dropdown-evaluate"
                    >
                      Evaluate
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-3 bg-popover">
                        <ul className="space-y-0.5" role="menu">
                          {EVALUATE_LINKS.map((link) => (
                            <li key={link.href + link.label} role="none">
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-10 px-4 text-sm font-medium bg-transparent"
                      data-testid="dropdown-operate"
                    >
                      Operate
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-3 bg-popover">
                        <ul className="space-y-0.5" role="menu">
                          {OPERATE_LINKS.map((link) => (
                            <li key={link.href + link.label} role="none">
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-10 px-4 text-sm font-medium bg-transparent"
                      data-testid="dropdown-partner"
                    >
                      Partner
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[280px] p-3 bg-popover">
                        <ul className="space-y-0.5" role="menu">
                          {PARTNER_LINKS.map((link) => (
                            <li key={link.href + link.label} role="none">
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavMenu>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-11 w-11"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={searchOpen ? "Close search" : "Open search"}
                aria-expanded={searchOpen}
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </Button>

              <Link href="/pricing">
                <Button 
                  size="sm"
                  className="hidden sm:flex min-h-[44px] px-4"
                  data-testid="button-start-trial"
                >
                  Get Started
                </Button>
              </Link>

              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden h-11 w-11" 
                    data-testid="button-mobile-menu"
                    aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-navigation"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={mobileOpen ? "close" : "menu"}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {mobileOpen ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <Menu className="w-5 h-5" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[300px] sm:w-[340px] overflow-y-auto p-0"
                  id="mobile-navigation"
                  aria-label="Mobile navigation menu"
                >
                  <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
                    <SheetTitle className="flex items-center gap-3">
                      <img 
                        src={logoUrl} 
                        alt="" 
                        className="h-8 w-auto" 
                        width={32} 
                        height={32}
                        aria-hidden="true"
                      />
                      <span className="font-semibold">WashBizHub</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <motion.div 
                    ref={mobileMenuRef}
                    className="p-4 space-y-5"
                    variants={mobileMenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div className="relative" variants={itemVariants}>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input 
                        ref={firstFocusableRef}
                        placeholder="Search..." 
                        className="pl-10 h-11 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search WashBizHub"
                        data-testid="input-mobile-search"
                      />
                    </motion.div>

                    <motion.div className="flex gap-3" variants={itemVariants}>
                      <Link href="/cleanbi-auto" onClick={closeMobileMenu} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full h-11 text-sm font-medium" 
                          data-testid="link-cleanbi-mobile"
                        >
                          CLEANBI
                        </Button>
                      </Link>
                      <Link href="/pricing" onClick={closeMobileMenu} className="flex-1">
                        <Button 
                          className="w-full h-11 text-sm font-medium" 
                          data-testid="link-pricing-mobile"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </motion.div>

                    <motion.nav 
                      variants={itemVariants} 
                      aria-label="Mobile site navigation"
                    >
                      <Accordion 
                        type="multiple" 
                        className="w-full" 
                        value={openAccordions}
                        onValueChange={setOpenAccordions}
                      >
                        <AccordionItem value="plan" className="border-b border-border/50">
                          <AccordionTrigger 
                            className="text-sm font-semibold hover:no-underline py-0 min-h-[48px] gap-3 [&[data-state=open]>svg]:rotate-180"
                            data-testid="accordion-plan"
                            aria-label="Plan section, expandable"
                          >
                            <span className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              Plan
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 pt-1">
                            <motion.div 
                              className="space-y-1 pl-1"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: { transition: { staggerChildren: 0.03 } }
                              }}
                              role="menu"
                              aria-label="Plan navigation links"
                            >
                              {PLAN_LINKS.map((link) => (
                                <motion.div key={link.href + link.label} variants={itemVariants}>
                                  <MobileNavLink
                                    href={link.href}
                                    label={link.label}
                                    icon={link.icon}
                                    isActive={isActive(link.href)}
                                    onClick={closeMobileMenu}
                                    testId={`link-mobile-plan-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="evaluate" className="border-b border-border/50">
                          <AccordionTrigger 
                            className="text-sm font-semibold hover:no-underline py-0 min-h-[48px] gap-3 [&[data-state=open]>svg]:rotate-180"
                            data-testid="accordion-evaluate"
                            aria-label="Evaluate section, expandable"
                          >
                            <span className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-muted-foreground" />
                              Evaluate
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 pt-1">
                            <motion.div 
                              className="space-y-1 pl-1"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: { transition: { staggerChildren: 0.03 } }
                              }}
                              role="menu"
                              aria-label="Evaluate navigation links"
                            >
                              {EVALUATE_LINKS.map((link) => (
                                <motion.div key={link.href + link.label} variants={itemVariants}>
                                  <MobileNavLink
                                    href={link.href}
                                    label={link.label}
                                    icon={link.icon}
                                    isActive={isActive(link.href)}
                                    onClick={closeMobileMenu}
                                    testId={`link-mobile-evaluate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="operate" className="border-b border-border/50">
                          <AccordionTrigger 
                            className="text-sm font-semibold hover:no-underline py-0 min-h-[48px] gap-3 [&[data-state=open]>svg]:rotate-180"
                            data-testid="accordion-operate"
                            aria-label="Operate section, expandable"
                          >
                            <span className="flex items-center gap-2">
                              <Settings className="w-4 h-4 text-muted-foreground" />
                              Operate
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 pt-1">
                            <motion.div 
                              className="space-y-1 pl-1"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: { transition: { staggerChildren: 0.03 } }
                              }}
                              role="menu"
                              aria-label="Operate navigation links"
                            >
                              {OPERATE_LINKS.map((link) => (
                                <motion.div key={link.href + link.label} variants={itemVariants}>
                                  <MobileNavLink
                                    href={link.href}
                                    label={link.label}
                                    icon={link.icon}
                                    isActive={isActive(link.href)}
                                    onClick={closeMobileMenu}
                                    testId={`link-mobile-operate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="partner" className="border-b-0">
                          <AccordionTrigger 
                            className="text-sm font-semibold hover:no-underline py-0 min-h-[48px] gap-3 [&[data-state=open]>svg]:rotate-180"
                            data-testid="accordion-partner"
                            aria-label="Partner section, expandable"
                          >
                            <span className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              Partner
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 pt-1">
                            <motion.div 
                              className="space-y-1 pl-1"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: { transition: { staggerChildren: 0.03 } }
                              }}
                              role="menu"
                              aria-label="Partner navigation links"
                            >
                              {PARTNER_LINKS.map((link) => (
                                <motion.div key={link.href + link.label} variants={itemVariants}>
                                  <MobileNavLink
                                    href={link.href}
                                    label={link.label}
                                    icon={link.icon}
                                    isActive={isActive(link.href)}
                                    onClick={closeMobileMenu}
                                    testId={`link-mobile-partner-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </motion.nav>

                    <motion.div 
                      variants={itemVariants}
                      className="pt-4 border-t border-border/50"
                    >
                      {isAuthenticated && user ? (
                        <Button
                          variant="ghost"
                          className="w-full h-11 justify-start gap-3 text-sm"
                          onClick={() => {
                            logout();
                            closeMobileMenu();
                          }}
                          data-testid="button-mobile-logout"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      ) : (
                        <Link href="/api/login" onClick={closeMobileMenu}>
                          <Button
                            variant="outline"
                            className="w-full h-11 justify-start gap-3 text-sm"
                            data-testid="button-mobile-login"
                          >
                            <Users className="w-4 h-4" />
                            Sign In
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  </motion.div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div 
              className="hidden md:block border-t bg-background/95 backdrop-blur-sm"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <Input 
                    placeholder="Search calculators, guides, listings, resources..." 
                    className="pl-12 pr-12 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    aria-label="Search WashBizHub"
                    data-testid="input-search"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close search"
                    data-testid="button-close-search"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showUtilityRail && (
        <div className="bg-muted/50 dark:bg-muted/30 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="min-h-[40px] flex items-center justify-between gap-4 text-sm overflow-x-auto py-1">
              <nav 
                className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap" 
                aria-label="Breadcrumb"
              >
                {breadcrumbs.map((crumb, idx) => (
                  <div key={crumb.href} className="flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="font-medium text-foreground" aria-current="page">{crumb.label}</span>
                    ) : (
                      <Link 
                        href={crumb.href} 
                        className="hover:text-foreground transition-colors min-h-[32px] flex items-center px-0.5"
                        data-testid={`link-breadcrumb-${crumb.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {contextSection && SECTION_NAV[contextSection] && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1.5">{SECTION_NAV[contextSection].label}:</span>
                  {SECTION_NAV[contextSection].links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button 
                        variant={isActive(link.href) ? "secondary" : "ghost"} 
                        size="sm" 
                        className="h-8 text-xs px-3"
                        data-testid={`link-utility-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
