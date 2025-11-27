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
  BookOpen,
  Calculator,
  Store,
  Wrench,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Palette,
  Cpu,
  TrendingUp,
  GraduationCap,
  FileText,
  Library,
  Building2,
  Phone,
  Package,
  Search,
  Plus,
  Tag,
  MessageSquare,
} from "lucide-react";
import { SiFacebook } from "react-icons/si";
import logoUrl from "@assets/6_1764040628012.png";

const FB_GROUP_URL = "https://facebook.com/groups/thelaundromat";

const MAIN_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
];

const SELL_LIST_LINKS = [
  { href: "/listing-form", label: "List Your Laundromat", icon: Store, description: "Sell your laundromat business", highlight: true },
  { href: "/list-equipment", label: "List Equipment", icon: Wrench, description: "Sell washers, dryers & parts" },
  { href: "/list-supplies", label: "List Supplies", icon: Package, description: "Sell detergents, chemicals & products" },
  { href: "/vendor-form", label: "Become a Vendor", icon: Building2, description: "Partner with us as a supplier" },
];

const BUY_BROWSE_LINKS = [
  { href: "/laundromat-listings", label: "Laundromats for Sale", icon: Store, description: "Browse businesses to buy" },
  { href: "/equipment-marketplace", label: "Equipment Marketplace", icon: Wrench, description: "Shop washers, dryers & parts" },
  { href: "/marketplace", label: "Supplies & Products", icon: ShoppingBag, description: "Shop detergents & accessories" },
];

const TOOLS_LINKS = [
  { href: "/cleanbi", label: "CLEANBI Score", icon: BarChart3, description: "AI-powered location analysis" },
  { href: "/valuation-calculator", label: "Valuation Calculator", icon: DollarSign, description: "Business valuation tool" },
  { href: "/service-guy-ai", label: "Service Guy AI", icon: Wrench, description: "Equipment troubleshooting" },
];

const EDUCATION_LINKS = [
  { href: "/book", label: "The Laundromat Bible", icon: BookOpen, description: "Comprehensive industry guide" },
  { href: "/resources", label: "Resource Hub", icon: Library, description: "Articles, guides & downloads" },
];

const ACTION_LINKS = [
  { href: "/startup-funding", label: "Get Funding", icon: DollarSign, highlight: true, description: "Access capital for your business" },
  { href: "/consultation", label: "Book Consultation", icon: Phone, description: "Expert guidance & advice" },
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
              className="h-20 sm:h-24 md:h-28 w-auto" 
              loading="lazy"
              data-testid="img-logo"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavMenu>
            <NavigationMenuList className="gap-1">
              {/* Main Links */}
              {MAIN_LINKS.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={link.href}
                        className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                          isActive(link.href) ? "bg-accent/50 text-accent-foreground" : ""
                        }`}
                        data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

              {/* Sell/List Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-sell-list"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Sell/List
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[350px] gap-2 p-4">
                    {SELL_LIST_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                link.highlight ? "bg-primary/5 border border-primary/20" : ""
                              }`}
                              data-testid={`link-sell-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Icon className="w-4 h-4 text-primary" />
                                {link.label}
                                {link.highlight && (
                                  <Badge variant="secondary" className="ml-1 text-xs">FREE</Badge>
                                )}
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Buy/Browse Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-buy-browse"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Buy/Browse
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[350px] gap-2 p-4">
                    {BUY_BROWSE_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              data-testid={`link-buy-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Icon className="w-4 h-4 text-primary" />
                                {link.label}
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Tools Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-tools"
                >
                  Tools
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {TOOLS_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              data-testid={`link-tool-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Icon className="w-4 h-4 text-primary" />
                                {link.label}
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Learn Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-learn"
                >
                  Learn
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2">
                    {EDUCATION_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              data-testid={`link-learn-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Icon className="w-4 h-4 text-primary" />
                                {link.label}
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Get Started Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  data-testid="dropdown-get-started"
                >
                  Get Started
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4">
                    {ACTION_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                link.highlight ? "bg-primary/5 border border-primary/20" : ""
                              }`}
                              data-testid={`link-action-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Icon className={`w-4 h-4 ${link.highlight ? "text-primary" : "text-muted-foreground"}`} />
                                {link.label}
                                {link.highlight && (
                                  <Badge variant="default" className="ml-1 text-xs">Popular</Badge>
                                )}
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavMenu>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* FB Group CTA - Desktop */}
          <a
            href={FB_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            data-testid="link-fb-group-desktop"
          >
            <SiFacebook className="w-4 h-4" />
            <span className="text-sm font-semibold">72K+ Members</span>
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
            <Link href="/login">
              <Button size="sm" data-testid="button-login">
                Sign In
              </Button>
            </Link>
          )}

          {/* Hamburger Drawer */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
              <div className="space-y-6 mt-6 pb-8">
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

                <Accordion type="multiple" className="w-full" defaultValue={["sell-list", "buy-browse"]}>
                  {/* Sell/List Section */}
                  <AccordionItem value="sell-list" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-sell-list"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Sell / List
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        {SELL_LIST_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  link.highlight
                                    ? "bg-primary/10 border border-primary/20"
                                    : isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-sell-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <Icon className="w-5 h-5 text-primary" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{link.label}</span>
                                    {link.highlight && (
                                      <Badge variant="secondary" className="text-xs">FREE</Badge>
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

                  {/* Buy/Browse Section */}
                  <AccordionItem value="buy-browse" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-buy-browse"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Buy / Browse
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        {BUY_BROWSE_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-buy-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
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

                  {/* Navigation Section */}
                  <AccordionItem value="navigation" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-navigation"
                    >
                      Navigation
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        {MAIN_LINKS.map((link) => (
                            <Link key={link.href} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <span>{link.label}</span>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Tools Section */}
                  <AccordionItem value="tools" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-tools"
                    >
                      Tools
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        {TOOLS_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-tool-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
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

                  {/* Learn Section */}
                  <AccordionItem value="learn" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-learn"
                    >
                      Learn
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        {EDUCATION_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-learn-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
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

                  {/* Get Started Section */}
                  <AccordionItem value="get-started" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-get-started"
                    >
                      Get Started
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        {ACTION_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link key={link.href} href={link.href}>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  link.highlight
                                    ? "bg-primary/10 border border-primary/20"
                                    : isActive(link.href)
                                    ? "bg-accent text-accent-foreground font-semibold"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`link-mobile-action-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <Icon className={`w-5 h-5 ${link.highlight ? "text-primary" : ""}`} />
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
