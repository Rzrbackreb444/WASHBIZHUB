import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
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
  { href: "/ai-consultation", label: "AI Consultation", icon: Bot, description: "Expert AI analysis for your deal" },
  { href: "/larry-larsen", label: "Expert Consulting", icon: Users, description: "50+ year industry veteran" },
  { href: "/calculators", label: "ROI Calculator", icon: Calculator, description: "Calculate potential returns" },
  { href: "/startup-funding", label: "Funding Options", icon: DollarSign, description: "Access capital for your business" },
  { href: "/academy", label: "Tech Academy", icon: GraduationCap, description: "Professional certification programs" },
  { href: "/book", label: "Industry Guide", icon: BookOpen, description: "Comprehensive laundromat resource" },
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
  { href: "/add-listing", label: "Add Listing", icon: Store, description: "List your business or service" },
  { href: "/listing-form", label: "Sell Business", icon: Store, description: "List your laundromat" },
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
      { href: "/add-listing", label: "Add a Listing" },
      { href: "/listing-form", label: "Sell Laundromat" },
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
        className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-muted focus:bg-muted"
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

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = useMemo(() => (path: string) => location === path, [location]);
  const breadcrumbs = useMemo(() => getBreadcrumb(location), [location]);
  const contextSection = useMemo(() => getContextualSection(location), [location]);
  const isHomePage = location === "/" || location === "";
  const showUtilityRail = !isHomePage && (breadcrumbs.length > 1 || contextSection);

  return (
    <>
      {/* Skip to Content Link - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
    <header className="sticky top-0 z-50">
      {/* TIER 1: Utility Bar - Clean minimal */}
      <div className="bg-[#0a1628] text-white/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 flex items-center justify-between text-xs">
            {/* Left: Contact */}
            <a 
              href="mailto:nick@washbizhub.com" 
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
              data-testid="link-contact-email"
            >
              <Mail className="w-3 h-3" />
              <span>nick@washbizhub.com</span>
            </a>
            <span className="sm:hidden text-white/60">WashBizHub</span>

            {/* Right: Theme, Auth */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {isLoading ? (
                <div className="w-12 h-4 bg-white/10 rounded animate-pulse" data-testid="skeleton-auth" />
              ) : isAuthenticated && user ? (
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  data-testid="button-logout"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              ) : (
                <a 
                  href="/api/login"
                  className="hover:text-white transition-colors"
                  data-testid="link-login"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Main Navigation */}
      <div className="bg-white dark:bg-[#0f1a2b] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" data-testid="link-logo" aria-label="WashBizHub Home">
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavMenu>
                <NavigationMenuList className="gap-0">
                  {/* Plan */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-9 px-3 text-sm font-medium bg-transparent"
                      data-testid="dropdown-plan"
                    >
                      Plan
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-3 bg-popover">
                        <ul className="space-y-0.5">
                          {PLAN_LINKS.map((link) => (
                            <li key={link.href + link.label}>
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Evaluate */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-9 px-3 text-sm font-medium bg-transparent"
                      data-testid="dropdown-evaluate"
                    >
                      Evaluate
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-3 bg-popover">
                        <ul className="space-y-0.5">
                          {EVALUATE_LINKS.map((link) => (
                            <li key={link.href + link.label}>
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Operate */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-9 px-3 text-sm font-medium bg-transparent"
                      data-testid="dropdown-operate"
                    >
                      Operate
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-3 bg-popover">
                        <ul className="space-y-0.5">
                          {OPERATE_LINKS.map((link) => (
                            <li key={link.href + link.label}>
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Partner */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-9 px-3 text-sm font-medium bg-transparent"
                      data-testid="dropdown-partner"
                    >
                      Partner
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[280px] p-3 bg-popover">
                        <ul className="space-y-0.5">
                          {PARTNER_LINKS.map((link) => (
                            <li key={link.href + link.label}>
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

            {/* Right Section */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-9 w-9"
                onClick={() => setSearchOpen(!searchOpen)}
                data-testid="button-search"
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Get Started */}
              <Link href="/pricing">
                <Button 
                  size="sm"
                  className="hidden sm:flex"
                  data-testid="button-start-trial"
                >
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" data-testid="button-mobile-menu" aria-label="Menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 overflow-y-auto p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                      <img src={logoUrl} alt="WashBizHub" className="h-8 w-auto" width={32} height={32} />
                      <span className="font-semibold">WashBizHub</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="p-4 space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search..." 
                        className="pl-9 h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-mobile-search"
                      />
                    </div>

                    {/* Quick Links */}
                    <div className="flex gap-2">
                      <Link href="/cleanbi-auto" onClick={() => setMobileOpen(false)} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full" data-testid="link-cleanbi-mobile">
                          CLEANBI
                        </Button>
                      </Link>
                      <Link href="/pricing" onClick={() => setMobileOpen(false)} className="flex-1">
                        <Button size="sm" className="w-full" data-testid="link-pricing-mobile">
                          Get Started
                        </Button>
                      </Link>
                    </div>

                    {/* Navigation Accordion */}
                    <Accordion type="multiple" className="w-full" defaultValue={["plan"]}>
                      {/* PLAN Section */}
                      <AccordionItem value="plan" className="border-b">
                        <AccordionTrigger 
                          className="text-sm font-medium hover:no-underline py-3"
                          data-testid="accordion-plan"
                        >
                          Plan
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="space-y-1">
                            {PLAN_LINKS.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link key={link.href + link.label} href={link.href}>
                                  <div
                                    className={`flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors ${
                                      isActive(link.href) ? "bg-muted" : "hover:bg-muted"
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                    data-testid={`link-mobile-plan-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span>{link.label}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* EVALUATE Section */}
                      <AccordionItem value="evaluate" className="border-b">
                        <AccordionTrigger 
                          className="text-sm font-medium hover:no-underline py-3"
                          data-testid="accordion-evaluate"
                        >
                          Evaluate
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="space-y-1">
                            {EVALUATE_LINKS.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link key={link.href + link.label} href={link.href}>
                                  <div
                                    className={`flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors ${
                                      isActive(link.href) ? "bg-muted" : "hover:bg-muted"
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                    data-testid={`link-mobile-evaluate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span>{link.label}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* OPERATE Section */}
                      <AccordionItem value="operate" className="border-b">
                        <AccordionTrigger 
                          className="text-sm font-medium hover:no-underline py-3"
                          data-testid="accordion-operate"
                        >
                          Operate
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="space-y-1">
                            {OPERATE_LINKS.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link key={link.href + link.label} href={link.href}>
                                  <div
                                    className={`flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors ${
                                      isActive(link.href) ? "bg-muted" : "hover:bg-muted"
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                    data-testid={`link-mobile-operate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span>{link.label}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* PARTNER Section */}
                      <AccordionItem value="partner" className="border-b">
                        <AccordionTrigger 
                          className="text-sm font-medium hover:no-underline py-3"
                          data-testid="accordion-partner"
                        >
                          Partner
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="space-y-1">
                            {PARTNER_LINKS.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link key={link.href + link.label} href={link.href}>
                                  <div
                                    className={`flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors ${
                                      isActive(link.href) ? "bg-muted" : "hover:bg-muted"
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                    data-testid={`link-mobile-partner-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span>{link.label}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Search Overlay - Desktop */}
        {searchOpen && (
          <div className="hidden md:block border-t bg-background/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search calculators, guides, listings, resources..." 
                  className="pl-12 pr-10 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  data-testid="input-search"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TIER 3: Utility Rail (Contextual - only on inner pages) */}
      {showUtilityRail && (
        <div className="bg-muted/50 dark:bg-muted/30 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-10 flex items-center justify-between gap-4 text-sm overflow-x-auto">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-1 text-muted-foreground whitespace-nowrap" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, idx) => (
                  <div key={crumb.href} className="flex items-center gap-1">
                    {idx > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="font-medium text-foreground">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="hover:text-foreground transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Context Quick Links */}
              {contextSection && SECTION_NAV[contextSection] && (
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-2">{SECTION_NAV[contextSection].label}:</span>
                  {SECTION_NAV[contextSection].links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button 
                        variant={isActive(link.href) ? "secondary" : "ghost"} 
                        size="sm" 
                        className="h-7 text-xs"
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
