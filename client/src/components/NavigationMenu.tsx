import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  Menu,
  X,
  LogOut,
  Settings,
  Home,
  BookOpen,
  Calculator,
  Store,
  Wrench,
  Users,
  BarChart3,
  MapPin,
  Zap,
  DollarSign,
  ShoppingBag,
  Workflow,
  Megaphone,
  PlusCircle,
} from "lucide-react";
import { SiFacebook } from "react-icons/si";
import logoUrl from "@assets/6_1764040628012.png";

const FB_GROUP_URL = "https://facebook.com/groups/thelaundromat";
const FB_PAGE_URL = "https://facebook.com/washbizhub1";

const MAIN_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/laundromat-listings", label: "Listings", icon: Store },
  { href: "/laundromat-locator", label: "Locator", icon: MapPin },
  { href: "/learning", label: "Courses", icon: BookOpen },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/blog", label: "Blog", icon: BookOpen },
];

const ACTION_LINKS = [
  { href: "/listing-form", label: "List Your Laundromat", icon: Store },
  { href: "/equipment-marketplace", label: "List Equipment", icon: Wrench },
  { href: "/vendor-form", label: "Become a Vendor", icon: ShoppingBag },
  { href: "/advertise", label: "Advertise With Us", icon: Megaphone },
];

const TOOLS_LINKS = [
  { href: "/equipment-matcher", label: "Equipment Matcher", icon: Workflow },
  { href: "/service-guy-ai", label: "Service Guy AI", icon: Wrench },
  { href: "/equipment-diagnostics", label: "Equipment Diagnostics", icon: Zap },
  { href: "/design-studio-pro", label: "Design Studio", icon: Wrench },
  { href: "/cleanbi", label: "CLEANBI Score", icon: BarChart3 },
  { href: "/valuation-calculator", label: "Valuation Tool", icon: DollarSign },
  { href: "/calculators", label: "All Calculators", icon: Calculator },
  { href: "/forum", label: "Community", icon: Users },
];

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = useMemo(() => (path: string) => location === path, [location]);

  return (
    <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-background via-background/95 to-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 hover:opacity-85 active:opacity-75 transition-opacity cursor-pointer">
            <img 
              src={logoUrl} 
              alt="WashBizHub - The #1 Laundromat Resource" 
              className="h-24 sm:h-28 md:h-32 w-auto" 
              loading="lazy"
            />
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth */}
          {isLoading ? (
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
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
              <Button variant="outline" size="icon" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
              <div className="space-y-6 mt-8 pb-8">
                {/* FB Group CTA */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <a href={FB_GROUP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold">
                    <SiFacebook className="w-6 h-6" />
                    <div>
                      <div>Join 72K+ Members</div>
                      <div className="text-xs font-normal text-muted-foreground">FB Group: The Laundromat</div>
                    </div>
                  </a>
                </div>

                {/* Get Started Actions */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Get Started
                  </h3>
                  <div className="space-y-1">
                    {ACTION_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <div
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              isActive(link.href)
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4 text-primary">Navigation</h3>
                  <div className="space-y-1">
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
                          >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4 text-primary">Tools</h3>
                  <div className="space-y-1">
                    {TOOLS_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <div
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
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
