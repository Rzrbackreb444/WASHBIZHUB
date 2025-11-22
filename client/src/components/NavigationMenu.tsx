import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { MapPin } from "lucide-react";
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
  User,
  Settings,
  Home,
  BookOpen,
  Calculator,
  Store,
  Wrench,
  Users,
  BarChart3,
} from "lucide-react";

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const mainLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/laundromat-listings", label: "Marketplace", icon: Store },
    { href: "/laundromat-locator", label: "Locator", icon: MapPin },
    { href: "/learning", label: "Courses", icon: BookOpen },
    { href: "/calculators", label: "Calculators", icon: Calculator },
  ];

  const toolsLinks = [
    { href: "/design-studio-pro", label: "Design Studio", icon: Wrench },
    { href: "/cleanbi-calculator", label: "CLEANBI Score", icon: BarChart3 },
    { href: "/forum", label: "Community", icon: Users },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="text-2xl font-bold text-accent flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span>🧺</span>
            <span>WashBizHub</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <a
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  }`}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
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
                      {toolsLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link key={link.href} href={link.href}>
                            <NavigationMenuLink
                              className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              data-testid={`nav-tool-${link.label.toLowerCase()}`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{link.label}</span>
                              </div>
                            </NavigationMenuLink>
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
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  data-testid="nav-settings-button"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.firstName || "Profile"}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                data-testid="nav-logout-button"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" data-testid="nav-login-button">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" data-testid="nav-signup-button">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="nav-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  data-testid="nav-mobile-close"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="space-y-2">
                {[...mainLinks, ...toolsLinks].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}>
                      <a
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                          isActive(link.href)
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        }`}
                        data-testid={`nav-mobile-${link.label.toLowerCase()}`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

import { MapPin } from "lucide-react";
