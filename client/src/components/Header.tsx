import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, LogIn, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/LOGO REAL_1762809085350.png";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
              <img src={logoUrl} alt="WashBizHub" className="h-12 w-auto" />
            </div>
          </Link>

          {/* Desktop Navigation with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-2">
            {/* Platform Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground font-medium"
                  data-testid="dropdown-platform"
                >
                  Platform <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/design-studio">
                    <span className="cursor-pointer w-full" data-testid="link-nav-design-studio">
                      Design Studio 2D/3D
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cleanbi">
                    <span className="cursor-pointer w-full" data-testid="link-nav-cleanbi">
                      CLEANBI™ Analysis
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ai-blogging">
                    <span className="cursor-pointer w-full" data-testid="link-nav-ai-blogging">
                      AI Blogging Suite
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/seo-optimizer">
                    <span className="cursor-pointer w-full" data-testid="link-nav-seo-optimizer">
                      SEO Optimizer
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/templates">
                    <span className="cursor-pointer w-full" data-testid="link-nav-templates">
                      Premium Templates
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground font-medium"
                  data-testid="dropdown-resources"
                >
                  Resources <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/resources">
                    <span className="cursor-pointer w-full" data-testid="link-nav-resources">
                      Resource Hub
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/vendors">
                    <span className="cursor-pointer w-full" data-testid="link-nav-vendors">
                      Vendor Directory
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/templates">
                    <span className="cursor-pointer w-full" data-testid="link-nav-templates-menu">
                      Template Library
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/roi-calculator">
                    <span className="cursor-pointer w-full" data-testid="link-nav-roi-calculator">
                      ROI Calculator
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/calculator">
                    <span className="cursor-pointer w-full" data-testid="link-nav-calculator">
                      Revenue Calculator
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/funding-matcher">
                    <span className="cursor-pointer w-full" data-testid="link-nav-funding-matcher">
                      Funding Matcher
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/locator">
                    <span className="cursor-pointer w-full" data-testid="link-nav-locator">
                      Laundromat Locator
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/distributor-locator">
                    <span className="cursor-pointer w-full" data-testid="link-nav-distributor-locator">
                      Distributor Locator
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Marketplace Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground font-medium"
                  data-testid="dropdown-marketplace"
                >
                  Marketplace <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 ">
                <DropdownMenuItem asChild>
                  <Link href="/marketplace">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-marketplace">
                      Buy/Sell Laundromats
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/listings">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-listings">
                      Browse Listings
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/superstore">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-superstore">
                      Equipment Superstore
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/parts">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-parts">
                      Parts Marketplace
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Learn Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground font-medium"
                  data-testid="dropdown-learn"
                >
                  Learn <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 ">
                <DropdownMenuItem asChild>
                  <Link href="/courses">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-courses">
                      Premium Courses
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/book">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-book">
                      The Laundromat Bible
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/blog">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-blog">
                      Industry Blog
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary-border" />
                <DropdownMenuItem asChild>
                  <Link href="/facebook-group">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-facebook-group">
                      Join Facebook Community
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Consultations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground font-medium"
                  data-testid="dropdown-consultations"
                >
                  Consultations <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 ">
                <DropdownMenuItem asChild>
                  <Link href="/consultation">
                    <span className="cursor-pointer w-full cursor-pointer" data-testid="link-nav-consultation">
                      Book a Consultation
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary-border" />
                <div className="px-2 py-2">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Industry Experts</p>
                </div>
                <DropdownMenuItem asChild>
                  <a
                    href="https://laundromat123.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer cursor-pointer"
                    data-testid="link-nav-laundromat123"
                  >
                    Laundromat123.com
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://laundromat123.com/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer cursor-pointer"
                    data-testid="link-nav-larry-larsen"
                  >
                    Larry Larsen - Expert Coach
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground text-xs italic" data-testid="link-nav-sasquatch">
                    The Stroked-Out Sasquatch (from the book)
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Auth & CTA */}
          <div className="flex items-center gap-2">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    {/* User info */}
                    <div className="hidden md:flex items-center gap-2 text-primary-foreground/80 text-sm">
                      <User className="h-4 w-4" />
                      <span>{user?.firstName || user?.email || 'User'}</span>
                    </div>
                    
                    {/* Logout button */}
                    <Button 
                      onClick={() => window.location.href = '/api/logout'}
                      variant="outline"
                      size="sm"
                      className="border-border"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
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
                      className="border-border"
                      data-testid="button-login"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </>
                )}
                
                {/* Go Pro - show only if not already pro */}
                {(!user?.isPro) && (
                  <Link href="/subscribe">
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full"
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
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border space-y-4" data-testid="nav-mobile-menu">
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
