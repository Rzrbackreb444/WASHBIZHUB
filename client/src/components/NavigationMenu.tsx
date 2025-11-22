import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import logoUrl from "@assets/LOGO REAL_1763715525600.png";

const MAIN_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/laundromat-listings", label: "Marketplace", icon: Store },
  { href: "/laundromat-locator", label: "Locator", icon: MapPin },
  { href: "/learning", label: "Courses", icon: BookOpen },
  { href: "/calculators", label: "Calculators", icon: Calculator },
];

const TOOLS_LINKS = [
  { href: "/design-studio-pro", label: "Design Studio", icon: Wrench },
  { href: "/cleanbi", label: "CLEANBI Score", icon: BarChart3 },
  { href: "/forum", label: "Community", icon: Users },
];

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = useMemo(() => (path: string) => location === path, [location]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <img src={logoUrl} alt="WashBizHub" className="h-8 w-auto" />
            <span className="hidden sm:inline text-xl font-bold text-accent">WashBizHub</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1 px-6">
          {MAIN_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <a
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                    isActive(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Desktop Tools Menu */}
          <div className="hidden lg:block">
            <NavMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="gap-1" data-testid="nav-tools-menu">
                    Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-2 p-4 w-60">
                      {TOOLS_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link key={link.href} href={link.href}>
                            <a
                              className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              data-testid={`nav-tool-${link.label.toLowerCase()}`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{link.label}</span>
                              </div>
                            </a>
                          </Link>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavMenu>
          </div>

          {/* Auth Section */}
          {isLoading ? (
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <a>
                <Button size="sm" data-testid="button-login">
                  Sign In
                </Button>
              </a>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-6 mt-8">
                <div>
                  <h3 className="font-semibold mb-3">Main</h3>
                  <div className="space-y-2">
                    {MAIN_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <a
                            className="flex items-center gap-2 p-2 rounded hover:bg-muted"
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            {link.label}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Tools</h3>
                  <div className="space-y-2">
                    {TOOLS_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <a
                            className="flex items-center gap-2 p-2 rounded hover:bg-muted"
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            {link.label}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
