import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, LogIn, LogOut, User, ChevronDown, Building2, Calculator, ShoppingCart, GraduationCap, Phone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/LOGO REAL_1762809085350.png";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 py-2">
          {/* Logo - Professional size */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2" data-testid="link-logo">
              <img src={logoUrl} alt="WashBizHub" className="h-12 w-auto" />
            </div>
          </Link>

          {/* Desktop Navigation - Mega Menu Trigger */}
          <nav className="hidden lg:flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-sm font-medium"
              onMouseEnter={() => setMegaMenuOpen(true)}
              data-testid="button-mega-menu"
            >
              Explore Platform <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </nav>

          {/* Auth & CTA */}
          <div className="flex items-center gap-2">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    {/* User info */}
                    <div className="hidden md:flex items-center gap-2 text-foreground/80 text-sm mr-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{user?.firstName || user?.email || 'User'}</span>
                    </div>
                    
                    {/* Logout button */}
                    <Button 
                      onClick={() => window.location.href = '/api/logout'}
                      variant="outline"
                      size="sm"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-1.5" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Login button */}
                    <Button 
                      onClick={() => window.location.href = '/api/login'}
                      variant="outline"
                      size="sm"
                      data-testid="button-login"
                    >
                      <LogIn className="h-4 w-4 mr-1.5" />
                      Login
                    </Button>
                  </>
                )}
                
                {/* Go Pro - show only if not already pro */}
                {(!user?.isPro) && (
                  <Link href="/subscribe">
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-md"
                      size="sm"
                      data-testid="button-go-pro"
                    >
                      Go Pro
                    </Button>
                  </Link>
                )}
              </>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mega Menu Panel */}
        {megaMenuOpen && (
          <div 
            className="absolute left-0 right-0 top-16 bg-card border-b border-border shadow-2xl z-50"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
            data-testid="mega-menu-panel"
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-5 gap-6">
                {/* Platform Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Platform</h3>
                  </div>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/design-studio">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-design-studio">
                          Design Studio 2D/3D
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/cleanbi">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-cleanbi">
                          CLEANBI™ Analysis
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/ai-blogging">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-ai-blogging">
                          AI Blogging Suite
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/seo-optimizer">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-seo-optimizer">
                          SEO Optimizer
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/templates">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-templates">
                          Premium Templates
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/website-templates">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-website-templates">
                          Website Templates
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/website-builder">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-website-builder">
                          Website Builder
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Resources Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Resources</h3>
                  </div>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/resources">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-resources">
                          Resource Hub
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/vendors">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-vendors">
                          Vendor Directory
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/roi-calculator">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-roi-calculator">
                          ROI Calculator
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/calculator">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-calculator">
                          Revenue Calculator
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/funding-matcher">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-funding-matcher">
                          Funding Matcher
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/locator">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-locator">
                          Laundromat Locator
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/distributor-locator">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-distributor-locator">
                          Distributor Locator
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Marketplace Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Marketplace</h3>
                  </div>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/marketplace">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-marketplace">
                          Buy/Sell Laundromats
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/listings">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-listings">
                          Browse Listings
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/superstore">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-superstore">
                          Equipment Superstore
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/parts">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-parts">
                          Parts Marketplace
                        </div>
                      </Link>
                    </li>
                    <li className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Partners</p>
                    </li>
                    <li>
                      <Link href="/atm-services">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-atm-depot">
                          ATM Depot Services
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Learn Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Learn</h3>
                  </div>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/courses">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-courses">
                          Premium Courses
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/book">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-book">
                          The Laundromat Bible
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-blog">
                          Industry Blog
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/facebook-group">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-facebook-group">
                          Facebook Community
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Consultations Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Expert Help</h3>
                  </div>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/consultation">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-consultation">
                          Book Consultation
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/affiliate">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-affiliate">
                          Affiliate Program
                        </div>
                      </Link>
                    </li>
                    <li className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Industry Experts</p>
                    </li>
                    <li>
                      <a
                        href="https://laundromat123.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5"
                        data-testid="link-nav-laundromat123"
                      >
                        Laundromat123.com
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://laundromat123.com/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5"
                        data-testid="link-nav-larry-larsen"
                      >
                        Larry Larsen
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-6 border-t border-border space-y-6" data-testid="nav-mobile-menu">
            {/* Platform Section */}
            <div>
              <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Platform</div>
              <Link href="/design-studio"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-design-studio">Design Studio 2D/3D</div></Link>
              <Link href="/cleanbi"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-cleanbi">CLEANBI™ Analysis</div></Link>
              <Link href="/ai-blogging"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-ai-blogging">AI Blogging Suite</div></Link>
            </div>
            
            {/* Tools Section */}
            <div>
              <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Tools</div>
              <Link href="/roi-calculator"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-roi-calculator">ROI Calculator</div></Link>
              <Link href="/calculator"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-calculator">Revenue Calculator</div></Link>
              <Link href="/funding-matcher"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-funding-matcher">Funding Matcher</div></Link>
            </div>
            
            {/* Marketplace Section */}
            <div>
              <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Marketplace</div>
              <Link href="/marketplace"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-marketplace">Buy/Sell Laundromats</div></Link>
              <Link href="/superstore"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-superstore">Equipment Superstore</div></Link>
            </div>
            
            {/* Learn Section */}
            <div>
              <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Learn</div>
              <Link href="/courses"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-courses">Premium Courses</div></Link>
              <Link href="/book"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-book">The Laundromat Bible</div></Link>
              <Link href="/blog"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-blog">Industry Blog</div></Link>
            </div>
            
            {/* Consultations Section */}
            <div>
              <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Consultations</div>
              <Link href="/consultation"><div className="block px-3 py-2 text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer" onClick={() => setMobileMenuOpen(false)} data-testid="link-mobile-consultation">Book a Consultation</div></Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
