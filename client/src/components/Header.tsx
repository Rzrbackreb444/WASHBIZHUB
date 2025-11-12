import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import logoUrl from "@assets/LOGO REAL_1762809085350.png";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Design Studio", href: "/design-studio" },
    { name: "CLEANBI™", href: "/cleanbi" },
    { name: "Courses", href: "/courses" },
    { name: "Book", href: "/book" },
    { name: "Calculator", href: "/calculator" },
    { name: "ROI Calculator", href: "/roi-calculator" },
    { name: "Funding Matcher", href: "/funding-matcher" },
    { name: "Superstore", href: "/superstore" },
    { name: "AI Blogging", href: "/ai-blogging" },
    { name: "SEO Optimizer", href: "/seo-optimizer" },
    { name: "Blog", href: "/blog" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Parts", href: "/parts" },
    { name: "Locator", href: "/locator" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-primary-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer" data-testid="link-logo">
              <img src={logoUrl} alt="WashBizHub" className="h-10" />
              <span className="text-xl font-black text-primary-foreground hidden sm:inline">
                WashBizHub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === item.href
                      ? "bg-primary-foreground/10 text-primary-foreground"
                      : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/5"
                  }`}
                  data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link href="/subscribe">
              <Button 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full"
                data-testid="button-go-pro"
              >
                Go Pro
              </Button>
            </Link>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-primary-border" data-testid="nav-mobile-menu">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                    location === item.href
                      ? "bg-primary-foreground/10 text-primary-foreground"
                      : "text-primary-foreground/80"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
