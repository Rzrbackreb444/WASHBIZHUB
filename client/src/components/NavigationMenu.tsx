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
  Receipt,
  DollarSign,
  BookOpen,
  GraduationCap,
  Phone,
  BarChart3,
  Store,
  ClipboardCheck,
  ShoppingCart,
  Monitor,
  Bot,
  Activity,
  Palette,
  Wrench,
  Library,
  Package,
  Building2,
  TrendingUp,
  Download,
  Mail,
  ChevronRight,
  Search,
  Sparkles,
  Star,
  ArrowRight,
  X,
  MapPin,
} from "lucide-react";
import { SiFacebook, SiLinkedin, SiX } from "react-icons/si";
import logoUrl from "@assets/6_1764040628012.png";

const FB_GROUP_URL = "https://facebook.com/groups/thelaundromat";
const CHROME_EXTENSION_URL = "https://chrome.google.com/webstore/detail/cleanbi-anywhere";

const PLAN_LINKS = [
  { href: "/ai-consultation", label: "AI Consultation Council", icon: Bot, description: "8 AI experts analyze your deal - Creating millionaires one customer at a time", featured: true, highlight: true, badge: "HOT" },
  { href: "/calculators", label: "ROI Calculator", icon: Calculator, description: "Calculate your potential return on investment" },
  { href: "/calculators", label: "Startup Costs Calculator", icon: Receipt, description: "Estimate total startup costs & equipment needs" },
  { href: "/startup-funding", label: "Get Funding", icon: DollarSign, description: "Access capital for your laundromat business", highlight: true },
  { href: "/academy", label: "Laundry Tech Academy", icon: GraduationCap, description: "4-tier certification from FREE to Master Tech", highlight: true, badge: "NEW" },
  { href: "/book", label: "The Laundromat Bible", icon: BookOpen, description: "Comprehensive industry guide from experts" },
  { href: "/blog", label: "Blog & Education", icon: Lightbulb, description: "Articles, guides, and industry insights" },
  { href: "/consultation", label: "Book Consultation", icon: Phone, description: "1-on-1 expert guidance for your journey" },
];

const EVALUATE_LINKS = [
  { href: "/ai-consultation", label: "AI Consultation Council", icon: Bot, description: "8 AI experts + Dave Menz analyze any deal", featured: true, highlight: true, badge: "HOT" },
  { href: "/cleanbi-auto", label: "CLEANBI Score Tool", icon: BarChart3, description: "AI-powered location & business analysis" },
  { href: "/laundromat-listings", label: "Laundromats for Sale", icon: Store, description: "Browse businesses currently on the market" },
  { href: "/valuation-calculator", label: "Valuation Calculator", icon: DollarSign, description: "Determine fair market value of any laundromat" },
  { href: "/distributor-locator", label: "Equipment Distributors", icon: MapPin, description: "Find authorized distributors for 11+ brands", highlight: true },
  { href: "/laundromat-locator", label: "Find Laundromats", icon: MapPin, description: "Search or list your laundromat business" },
  { href: "/resources", label: "Due Diligence Guide", icon: ClipboardCheck, description: "What to check before buying" },
];

const OPERATE_LINKS = [
  { href: "/pos-command-center", label: "POS Command Center", icon: Monitor, description: "Manage payments, loyalty & operations", featured: true },
  { href: "/service-guy-ai", label: "Service Guy AI", icon: Bot, description: "AI-powered equipment troubleshooting" },
  { href: "/equipment-diagnostics", label: "Equipment Diagnostics", icon: Activity, description: "Diagnose machine issues instantly" },
  { href: "/design-studio-pro", label: "Design Studio Pro", icon: Palette, description: "Plan your floor layout in 3D" },
  { href: "/equipment-marketplace", label: "Equipment Marketplace", icon: Wrench, description: "Shop equipment, parts & supplies" },
  { href: "/resources", label: "Resources Hub", icon: Library, description: "Guides, templates & downloads" },
];

const PARTNER_LINKS = [
  { href: "/listing-form", label: "List Your Laundromat", icon: Store, description: "Sell your laundromat business", highlight: true, badge: "FREE", featured: true },
  { href: "/list-equipment", label: "List Equipment", icon: Wrench, description: "Sell washers, dryers & parts" },
  { href: "/list-supplies", label: "List Supplies", icon: Package, description: "Sell detergents, chemicals & products" },
  { href: "/vendor-form", label: "Become a Vendor", icon: Building2, description: "Partner with us as a supplier" },
  { href: "/advertise", label: "Advertise With Us", icon: TrendingUp, description: "Reach 72,000+ laundromat professionals" },
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
      { href: "/service-guy-ai", label: "Service AI" },
      { href: "/equipment-diagnostics", label: "Diagnostics" },
    ],
  },
  "/partner": {
    label: "Partner With Us",
    links: [
      { href: "/listing-form", label: "List Business" },
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
  highlight?: boolean;
  badge?: string;
  featured?: boolean;
  onClick?: () => void;
}

function MegamenuItem({ href, label, icon: Icon, description, highlight, badge, featured, onClick }: MegamenuItemProps) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        onClick={onClick}
        className={`group flex items-start gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-muted/80 focus:bg-muted ${
          highlight ? "bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30" : ""
        } ${featured ? "col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20" : ""}`}
        data-testid={`link-megamenu-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
          featured 
            ? "bg-primary text-primary-foreground" 
            : highlight 
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" 
              : "bg-muted group-hover:bg-primary/10"
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{label}</span>
            {badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">{badge}</Badge>
            )}
            {highlight && !badge && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">Popular</Badge>
            )}
            {featured && (
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            )}
          </div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
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
    <header className="sticky top-0 z-50">
      {/* TIER 1: Brand Bar */}
      <div className="bg-navy-900 text-white/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 flex items-center justify-between gap-4 text-xs">
            {/* Left: Social Proof */}
            <div className="hidden sm:flex items-center gap-2">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-medium">Serving 72,000+ Laundromat Professionals</span>
            </div>
            <div className="flex sm:hidden items-center gap-2">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-medium">72K+ Professionals</span>
            </div>

            {/* Right: Contact, Social, Theme, Auth */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Contact */}
              <a 
                href="mailto:nick@washbizhub.com" 
                className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                data-testid="link-contact-email"
              >
                <Mail className="w-3 h-3" />
                <span>Contact</span>
              </a>

              {/* Social Links */}
              <div className="flex items-center gap-0.5">
                <a
                  href={FB_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  aria-label="Facebook Group"
                  data-testid="link-social-facebook"
                >
                  <SiFacebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://twitter.com/washbizhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  aria-label="Twitter"
                  data-testid="link-social-twitter"
                >
                  <SiX className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://linkedin.com/company/washbizhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:block p-1.5 rounded hover:bg-white/10 transition-colors"
                  aria-label="LinkedIn"
                  data-testid="link-social-linkedin"
                >
                  <SiLinkedin className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="w-px h-4 bg-white/20 mx-1" />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth */}
              {isLoading ? (
                <div className="w-6 h-6 bg-white/20 rounded animate-pulse" data-testid="skeleton-auth" />
              ) : isAuthenticated && user ? (
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  data-testid="button-logout"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <a 
                  href="/api/login"
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  data-testid="link-login"
                >
                  <span>Login</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Main Product Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[72px] flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" data-testid="link-logo">
              <div className="flex items-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer shrink-0">
                <img 
                  src={logoUrl} 
                  alt="WashBizHub - The #1 Laundromat Resource" 
                  className="h-12 sm:h-14 md:h-16 w-auto" 
                  loading="lazy"
                  data-testid="img-logo"
                />
              </div>
            </Link>

            {/* Desktop Navigation - Megamenus */}
            <nav className="hidden lg:flex items-center flex-1 justify-center">
              <NavMenu>
                <NavigationMenuList className="gap-1">
                  {/* PLAN Megamenu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-10 text-sm font-semibold tracking-wide"
                      data-testid="dropdown-plan"
                    >
                      <Lightbulb className="w-4 h-4 mr-1.5" />
                      PLAN
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[580px] p-5">
                        <div className="mb-4 pb-3 border-b flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">For Dreamers</span>
                            <p className="text-sm text-muted-foreground mt-0.5">Thinking about buying a laundromat?</p>
                          </div>
                          <Link href="/plan" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <ul className="grid grid-cols-2 gap-2">
                          {PLAN_LINKS.map((link) => (
                            <li key={link.href + link.label} className={link.featured ? "col-span-2" : ""}>
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* EVALUATE Megamenu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-10 text-sm font-semibold tracking-wide"
                      data-testid="dropdown-evaluate"
                    >
                      <Target className="w-4 h-4 mr-1.5" />
                      EVALUATE
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[580px] p-5">
                        <div className="mb-4 pb-3 border-b flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">For Buyers</span>
                            <p className="text-sm text-muted-foreground mt-0.5">Actively searching for a laundromat?</p>
                          </div>
                          <Link href="/evaluate" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <ul className="grid grid-cols-2 gap-2">
                          {EVALUATE_LINKS.map((link) => (
                            <li key={link.href + link.label} className={link.featured ? "col-span-2" : ""}>
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* OPERATE Megamenu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-10 text-sm font-semibold tracking-wide"
                      data-testid="dropdown-operate"
                    >
                      <Settings className="w-4 h-4 mr-1.5" />
                      OPERATE
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[580px] p-5">
                        <div className="mb-4 pb-3 border-b flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">For Owners</span>
                            <p className="text-sm text-muted-foreground mt-0.5">Running your laundromat business?</p>
                          </div>
                          <Link href="/operate" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <ul className="grid grid-cols-2 gap-2">
                          {OPERATE_LINKS.map((link) => (
                            <li key={link.href + link.label} className={link.featured ? "col-span-2" : ""}>
                              <MegamenuItem {...link} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* PARTNER Megamenu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="h-10 text-sm font-semibold tracking-wide"
                      data-testid="dropdown-partner"
                    >
                      <Users className="w-4 h-4 mr-1.5" />
                      PARTNER
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[580px] p-5">
                        <div className="mb-4 pb-3 border-b flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">For Vendors & Brokers</span>
                            <p className="text-sm text-muted-foreground mt-0.5">Service providers & sellers welcome</p>
                          </div>
                          <Link href="/partner" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <ul className="grid grid-cols-2 gap-2">
                          {PARTNER_LINKS.map((link) => (
                            <li key={link.href + link.label} className={link.featured ? "col-span-2" : ""}>
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
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Search Button - Desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setSearchOpen(!searchOpen)}
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Start Free Trial - Gold CTA */}
              <Link href="/pricing">
                <Button 
                  className="hidden sm:flex bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md"
                  data-testid="button-start-trial"
                >
                  <span className="hidden md:inline">Start Free Trial</span>
                  <span className="md:hidden">Free Trial</span>
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden" data-testid="button-mobile-menu" aria-label="Open menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto p-0">
                  <SheetHeader className="p-4 border-b bg-navy-900 text-white">
                    <SheetTitle className="text-white flex items-center gap-2">
                      <img src={logoUrl} alt="WashBizHub" className="h-8 w-auto" />
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="p-4 space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search tools & resources..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-mobile-search"
                      />
                    </div>

                    {/* Quick CTAs */}
                    <div className="grid grid-cols-3 gap-2">
                      <Link href="/ai-consultation" onClick={() => setMobileOpen(false)}>
                        <div className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black rounded-lg transition-colors text-center cursor-pointer h-full justify-center shadow-lg"
                        data-testid="link-ai-council-mobile"
                        >
                          <Bot className="w-5 h-5" />
                          <span className="text-[10px] font-bold">AI Council</span>
                        </div>
                      </Link>
                      <Link href="/cleanbi-auto" onClick={() => setMobileOpen(false)}>
                        <div className="flex flex-col items-center gap-1 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-center cursor-pointer h-full justify-center"
                        data-testid="link-cleanbi-mobile"
                        >
                          <MapPin className="w-5 h-5" />
                          <span className="text-[10px] font-medium">CLEANBI</span>
                        </div>
                      </Link>
                      <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                        <div className="flex flex-col items-center gap-1 p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-center cursor-pointer h-full justify-center">
                          <Sparkles className="w-5 h-5" />
                          <span className="text-[10px] font-semibold">Free Trial</span>
                        </div>
                      </Link>
                    </div>

                    {/* FB Group Banner */}
                    <a
                      href={FB_GROUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      data-testid="link-fb-group-mobile"
                    >
                      <SiFacebook className="w-6 h-6" />
                      <div>
                        <div className="font-semibold">Join 72K+ Professionals</div>
                        <div className="text-xs opacity-90">The Laundromat FB Group</div>
                      </div>
                    </a>

                    {/* Navigation Accordion */}
                    <Accordion type="multiple" className="w-full" defaultValue={["plan"]}>
                      {/* PLAN Section */}
                      <AccordionItem value="plan" className="border-none">
                        <AccordionTrigger 
                          className="font-semibold text-base hover:no-underline py-3 px-2 rounded-lg hover:bg-muted"
                          data-testid="accordion-plan"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                              <Lightbulb className="w-4 h-4 text-primary" />
                            </div>
                            PLAN
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="ml-10 space-y-1">
                            {PLAN_LINKS.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link key={link.href + link.label} href={link.href}>
                                  <div
                                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                      link.highlight
                                        ? "bg-amber-500/10 border border-amber-500/30"
                                        : isActive(link.href)
                                        ? "bg-primary/10"
                                        : "hover:bg-muted"
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                    data-testid={`link-mobile-plan-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{link.label}</span>
                                        {link.highlight && (
                                          <Badge variant="default" className="text-[10px] h-4">Popular</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* EVALUATE Section */}
                      <AccordionItem value="evaluate" className="border-none">
                        <AccordionTrigger 
                          className="font-semibold text-base hover:no-underline py-3 px-2 rounded-lg hover:bg-muted"
                          data-testid="accordion-evaluate"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                              <Target className="w-4 h-4 text-primary" />
                            </div>
                            EVALUATE
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="ml-10 space-y-1">
                            {EVALUATE_LINKS.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link key={link.href + link.label} href={link.href}>
                                  <div
                                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                      isActive(link.href)
                                        ? "bg-primary/10"
                                        : "hover:bg-muted"
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                    data-testid={`link-mobile-evaluate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{link.label}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* OPERATE Section */}
                      <AccordionItem value="operate" className="border-none">
                        <AccordionTrigger 
                          className="font-semibold text-base hover:no-underline py-3 px-2 rounded-lg hover:bg-muted"
                          data-testid="accordion-operate"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                              <Settings className="w-4 h-4 text-primary" />
                            </div>
                            OPERATE
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="ml-10 space-y-1">
                            {OPERATE_LINKS.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link key={link.href + link.label} href={link.href}>
                                  <div
                                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                      isActive(link.href)
                                        ? "bg-primary/10"
                                        : "hover:bg-muted"
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                    data-testid={`link-mobile-operate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{link.label}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* PARTNER Section */}
                      <AccordionItem value="partner" className="border-none">
                        <AccordionTrigger 
                          className="font-semibold text-base hover:no-underline py-3 px-2 rounded-lg hover:bg-muted"
                          data-testid="accordion-partner"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            PARTNER
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="ml-10 space-y-1">
                            {PARTNER_LINKS.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link key={link.href + link.label} href={link.href}>
                                  <div
                                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                      link.highlight
                                        ? "bg-amber-500/10 border border-amber-500/30"
                                        : isActive(link.href)
                                        ? "bg-primary/10"
                                        : "hover:bg-muted"
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                    data-testid={`link-mobile-partner-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{link.label}</span>
                                        {link.badge && (
                                          <Badge variant="secondary" className="text-[10px] h-4">{link.badge}</Badge>
                                        )}
                                      </div>
                                    </div>
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
  );
}
