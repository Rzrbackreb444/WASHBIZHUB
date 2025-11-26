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
  Home,
  BookOpen,
  Calculator,
  Store,
  Wrench,
  BarChart3,
  DollarSign,
  ShoppingBag,
  PlusCircle,
  Palette,
  Cpu,
  TrendingUp,
  GraduationCap,
  FileText,
  Library,
  Building2,
  Phone,
  ChevronDown,
  Sparkles,
  Newspaper,
  FolderOpen,
} from "lucide-react";
import { SiFacebook } from "react-icons/si";
import logoUrl from "@assets/6_1764040628012.png";

const FB_GROUP_URL = "https://facebook.com/groups/thelaundromat";

const MAIN_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/laundromat-listings", label: "Listings", icon: Store },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/resources", label: "Resources", icon: FolderOpen },
];

const TOOLS_LINKS = [
  { href: "/cleanbi", label: "CLEANBI Score", icon: BarChart3, description: "AI-powered location analysis" },
  { href: "/design-studio-pro", label: "Design Studio", icon: Palette, description: "3D laundromat designer" },
  { href: "/service-guy-ai", label: "Service Guy AI", icon: Wrench, description: "Equipment troubleshooting" },
  { href: "/equipment-diagnostics", label: "Equipment Diagnostics", icon: Cpu, description: "Machine health analysis" },
  { href: "/valuation-calculator", label: "Valuation Calculator", icon: DollarSign, description: "Business valuation tool" },
  { href: "/roi-calculator", label: "ROI Calculator", icon: TrendingUp, description: "Investment returns analysis" },
  { href: "/calculators", label: "All 50+ Calculators", icon: Calculator, description: "Complete calculator suite" },
];

const EDUCATION_LINKS = [
  { href: "/learning", label: "Premium Courses", icon: GraduationCap, description: "Expert-led training programs" },
  { href: "/book", label: "The Laundromat Bible", icon: BookOpen, description: "Comprehensive industry guide" },
  { href: "/templates", label: "Templates & Guides", icon: FileText, description: "Ready-to-use business documents" },
  { href: "/resources", label: "Resource Hub", icon: Library, description: "Articles, guides & downloads" },
];

const ACTION_LINKS = [
  { href: "/listing-form", label: "List Your Laundromat", icon: Store, description: "Sell your business" },
  { href: "/equipment-marketplace", label: "Sell Equipment", icon: ShoppingBag, description: "List equipment for sale" },
  { href: "/vendor-form", label: "Become a Vendor", icon: Building2, description: "Partner with us" },
  { href: "/startup-funding", label: "Get Funding", icon: DollarSign, highlight: true, description: "Access capital" },
  { href: "/consultation", label: "Book Consultation", icon: Phone, description: "Expert guidance" },
];

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = useMemo(() => (path: string) => location === path, [location]);

  return (
    <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-background via-background/95 to-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
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
              {MAIN_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={link.href}
                        className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                          isActive(link.href) ? "bg-accent/50 text-accent-foreground" : ""
                        }`}
                        data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}

              {/* Tools Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="h-9"
                  data-testid="dropdown-tools"
                >
                  <Wrench className="w-4 h-4 mr-2" />
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
                  <GraduationCap className="w-4 h-4 mr-2" />
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
                  <Sparkles className="w-4 h-4 mr-2" />
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

                <Accordion type="multiple" className="w-full" defaultValue={["navigation", "get-started"]}>
                  {/* Navigation Section */}
                  <AccordionItem value="navigation" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-navigation"
                    >
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Navigation
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        {MAIN_LINKS.map((link) => {
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
                                data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <Icon className="w-5 h-5" />
                                <span>{link.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Tools Section */}
                  <AccordionItem value="tools" className="border-none">
                    <AccordionTrigger 
                      className="font-bold text-lg text-primary hover:no-underline py-3"
                      data-testid="accordion-tools"
                    >
                      <div className="flex items-center gap-2">
                        <Wrench className="w-5 h-5" />
                        Tools
                      </div>
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
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Learn
                      </div>
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
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Get Started
                      </div>
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
