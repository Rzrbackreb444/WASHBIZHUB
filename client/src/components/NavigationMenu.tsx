import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SocialNavigation } from "./SocialNavigation";
import { ThemeToggle } from "./ThemeToggle";
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
} from "lucide-react";
import { SiFacebook } from "react-icons/si";
import logoUrl from "@assets/6_1764040628012.png";

const FB_GROUP_URL = "https://facebook.com/groups/thelaundromat";
const CHROME_EXTENSION_URL = "https://chrome.google.com/webstore/detail/cleanbi-anywhere";

const PLAN_LINKS = [
  { href: "/calculators", label: "ROI Calculator", icon: Calculator, description: "Calculate your potential return on investment" },
  { href: "/calculators", label: "Startup Costs Calculator", icon: Receipt, description: "Estimate total startup costs & equipment needs" },
  { href: "/startup-funding", label: "Get Funding", icon: DollarSign, description: "Access capital for your laundromat business", highlight: true },
  { href: "/book", label: "The Laundromat Bible", icon: BookOpen, description: "Comprehensive industry guide from experts" },
  { href: "/blog", label: "Blog & Education", icon: GraduationCap, description: "Articles, guides, and industry insights" },
  { href: "/consultation", label: "Book Consultation", icon: Phone, description: "1-on-1 expert guidance for your journey" },
];

const EVALUATE_LINKS = [
  { href: "/cleanbi-auto", label: "CLEANBI Score Tool", icon: BarChart3, description: "AI-powered location & business analysis" },
  { href: "/laundromat-listings", label: "Laundromats for Sale", icon: Store, description: "Browse businesses currently on the market" },
  { href: "/valuation-calculator", label: "Valuation Calculator", icon: DollarSign, description: "Determine fair market value of any laundromat" },
  { href: "/resources", label: "Due Diligence Guide", icon: ClipboardCheck, description: "What to check before buying" },
  { href: "/equipment", label: "Equipment Marketplace", icon: ShoppingCart, description: "Browse new & used equipment" },
];

const OPERATE_LINKS = [
  { href: "/pos", label: "POS Command Center", icon: Monitor, description: "Manage payments, loyalty & operations" },
  { href: "/service-guy-ai", label: "Service Guy AI", icon: Bot, description: "AI-powered equipment troubleshooting" },
  { href: "/equipment-diagnostics", label: "Equipment Diagnostics", icon: Activity, description: "Diagnose machine issues instantly" },
  { href: "/design-studio-pro", label: "Design Studio Pro", icon: Palette, description: "Plan your floor layout in 3D" },
  { href: "/equipment", label: "Equipment Marketplace", icon: Wrench, description: "Shop equipment, parts & supplies" },
  { href: "/resources", label: "Resources Hub", icon: Library, description: "Guides, templates & downloads" },
];

const PARTNER_LINKS = [
  { href: "/listing-form", label: "List Your Laundromat", icon: Store, description: "Sell your laundromat business", highlight: true, badge: "FREE" },
  { href: "/list-equipment", label: "List Equipment", icon: Wrench, description: "Sell washers, dryers & parts" },
  { href: "/list-supplies", label: "List Supplies", icon: Package, description: "Sell detergents, chemicals & products" },
  { href: "/vendor-form", label: "Become a Vendor", icon: Building2, description: "Partner with us as a supplier" },
  { href: "/resources", label: "Affiliate Program", icon: TrendingUp, description: "Earn commissions on referrals" },
];

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = useMemo(() => (path: string) => location === path, [location]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" data-testid="link-logo">
          <div className="flex items-center gap-2 hover:opacity-85 active:opacity-75 transition-opacity cursor-pointer">
            <img 
              src={logoUrl} 
              alt="WashBizHub - The #1 Laundromat Resource" 
              className="h-16 sm:h-20 md:h-24 w-auto" 
              loading="lazy"
              data-testid="img-logo"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavMenu>
            <NavigationMenuList className="gap-1">
              {/* PLAN Megamenu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-plan"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  PLAN
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-[480px]">
                    <div className="mb-3 pb-2 border-b">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">For Dreamers</span>
                      <p className="text-sm text-muted-foreground">Thinking about buying a laundromat?</p>
                    </div>
                    <ul className="grid gap-2">
                      {PLAN_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href + link.label}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={link.href}
                                className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  link.highlight ? "bg-primary/5 border border-primary/20" : ""
                                }`}
                                data-testid={`link-plan-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                  <Icon className="w-4 h-4 text-primary" />
                                  {link.label}
                                  {link.highlight && (
                                    <Badge variant="default" className="ml-1 text-xs">Popular</Badge>
                                  )}
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                  {link.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* EVALUATE Megamenu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-evaluate"
                >
                  <Target className="w-4 h-4 mr-1" />
                  EVALUATE
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-[480px]">
                    <div className="mb-3 pb-2 border-b">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">For Buyers</span>
                      <p className="text-sm text-muted-foreground">Actively searching for a laundromat?</p>
                    </div>
                    <ul className="grid gap-2">
                      {EVALUATE_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href + link.label}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={link.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                data-testid={`link-evaluate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                  <Icon className="w-4 h-4 text-primary" />
                                  {link.label}
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                  {link.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* OPERATE Megamenu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-operate"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  OPERATE
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-[480px]">
                    <div className="mb-3 pb-2 border-b">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">For Owners</span>
                      <p className="text-sm text-muted-foreground">Running your laundromat business?</p>
                    </div>
                    <ul className="grid gap-2">
                      {OPERATE_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href + link.label}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={link.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                data-testid={`link-operate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                  <Icon className="w-4 h-4 text-primary" />
                                  {link.label}
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                  {link.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* PARTNER Megamenu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-partner"
                >
                  <Users className="w-4 h-4 mr-1" />
                  PARTNER
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-[480px]">
                    <div className="mb-3 pb-2 border-b">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">For Vendors & Brokers</span>
                      <p className="text-sm text-muted-foreground">Service providers & sellers welcome</p>
                    </div>
                    <ul className="grid gap-2">
                      {PARTNER_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href + link.label}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={link.href}
                                className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  link.highlight ? "bg-primary/5 border border-primary/20" : ""
                                }`}
                                data-testid={`link-partner-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                  <Icon className="w-4 h-4 text-primary" />
                                  {link.label}
                                  {link.badge && (
                                    <Badge variant="secondary" className="ml-1 text-xs">{link.badge}</Badge>
                                  )}
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                  {link.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavMenu>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Install CLEANBI Extension CTA - Desktop */}
          <a
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            data-testid="link-extension-desktop"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold">Install CLEANBI</span>
          </a>

          {/* FB Group CTA - Desktop */}
          <a
            href={FB_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            data-testid="link-fb-group-desktop"
          >
            <SiFacebook className="w-4 h-4" />
            <span className="text-sm font-semibold">72K+</span>
          </a>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth */}
          {isLoading ? (
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" data-testid="skeleton-auth" />
          ) : isAuthenticated && user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          ) : (
            <a href="/api/login">
              <Button size="sm" data-testid="button-login">
                Sign In
              </Button>
            </a>
          )}

          {/* Hamburger Drawer */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" data-testid="button-mobile-menu" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
              <div className="space-y-6 mt-6 pb-8">
                {/* Install CLEANBI Extension CTA */}
                <a
                  href={CHROME_EXTENSION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors"
                  data-testid="link-extension-mobile"
                >
                  <Download className="w-7 h-7" />
                  <div>
                    <div className="font-bold text-lg">Install CLEANBI</div>
                    <div className="text-xs opacity-90">Chrome Extension - Analyze Any Location</div>
                  </div>
                </a>

                {/* FB Group CTA */}
                <a
                  href={FB_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  data-testid="link-fb-group-mobile"
                >
                  <SiFacebook className="w-7 h-7" />
                  <div>
                    <div className="font-bold text-lg">72K+ Members</div>
                    <div className="text-xs opacity-90">Join The Laundromat FB Group</div>
                  </div>
                </a>

                <Accordion type="multiple" className="w-full" defaultValue={["plan", "evaluate"]}>
                  {/* PLAN Section */}
                  <AccordionItem value="plan" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-plan"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        PLAN
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-2 pb-2">
                        <span className="text-xs text-muted-foreground">For Dreamers - Thinking about buying</span>
                      </div>
                      <div className="space-y-1 pl-2">
                        {PLAN_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href + link.label} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  link.highlight
                                    ? "bg-primary/10 border border-primary/20"
                                    : isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-plan-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <Icon className="w-5 h-5 text-primary" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{link.label}</span>
                                    {link.highlight && (
                                      <Badge variant="default" className="text-xs">Popular</Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{link.description}</span>
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
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-evaluate"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        EVALUATE
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-2 pb-2">
                        <span className="text-xs text-muted-foreground">For Buyers - Actively searching</span>
                      </div>
                      <div className="space-y-1 pl-2">
                        {EVALUATE_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href + link.label} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-evaluate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <Icon className="w-5 h-5 text-primary" />
                                <div>
                                  <span className="block font-medium">{link.label}</span>
                                  <span className="text-xs text-muted-foreground">{link.description}</span>
                                </div>
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
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-operate"
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        OPERATE
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-2 pb-2">
                        <span className="text-xs text-muted-foreground">For Owners - Running your business</span>
                      </div>
                      <div className="space-y-1 pl-2">
                        {OPERATE_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href + link.label} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-operate-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <Icon className="w-5 h-5 text-primary" />
                                <div>
                                  <span className="block font-medium">{link.label}</span>
                                  <span className="text-xs text-muted-foreground">{link.description}</span>
                                </div>
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
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-partner"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        PARTNER
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-2 pb-2">
                        <span className="text-xs text-muted-foreground">For Vendors & Brokers</span>
                      </div>
                      <div className="space-y-1 pl-2">
                        {PARTNER_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href + link.label} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  link.highlight
                                    ? "bg-primary/10 border border-primary/20"
                                    : isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-partner-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <Icon className="w-5 h-5 text-primary" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{link.label}</span>
                                    {link.badge && (
                                      <Badge variant="secondary" className="text-xs">{link.badge}</Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{link.description}</span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Social Links */}
                <div className="pt-4 border-t">
                  <SocialNavigation />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
