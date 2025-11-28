import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, LogIn, LogOut, User, ChevronDown, Building2, Calculator, ShoppingCart, GraduationCap, Phone, Settings as SettingsIcon, Users, X, Shield, Zap, Globe, Award, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Advertisement } from "@/components/Advertisement";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoUrl from "@assets/6_1764040628012.png";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {/* Enterprise Trust Bar - Navy/Teal Theme */}
      <div className="bg-navy-900 border-b border-teal-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center py-1.5 gap-4 sm:gap-8 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-white/80">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Enterprise-Grade Security</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-white/80">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>220+ Countries</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold text-white">72,000+ Members</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-white/80">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>99.99% Uptime</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <Badge variant="outline" className="border-teal-400/50 text-teal-400 text-xs py-0 h-5 gap-1">
                <CheckCircle className="w-3 h-3" />
                SEO/AEO Optimized
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          {/* Logo - Responsive sizing */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2" data-testid="link-logo">
              <img 
                src={logoUrl} 
                alt="WashBizHub" 
                className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto" 
              />
            </div>
          </Link>

          {/* Desktop Navigation - Mega Menu Trigger - Hidden on mobile/tablet */}
          <nav className="hidden lg:flex items-center gap-2">
            <Button
              variant="default"
              size="lg"
              className="text-base font-bold bg-primary text-primary-foreground"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              data-testid="button-mega-menu"
            >
              Explore Platform <ChevronDown className={`ml-2 h-5 w-5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Advertisement - Only on XL screens */}
            <div className="hidden xl:block">
              <Advertisement placement="header" />
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    {/* Settings button - Hidden on xs */}
                    <Link href="/settings" className="hidden sm:block">
                      <Button 
                        variant="ghost"
                        size="icon"
                        data-testid="button-settings"
                      >
                        <SettingsIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {/* User info - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-2 text-foreground/80 text-sm mr-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium max-w-[120px] truncate">
                        {user?.firstName || user?.email || 'User'}
                      </span>
                    </div>
                    
                    {/* Logout button - Compact on mobile */}
                    <Button 
                      onClick={() => window.location.href = '/api/logout'}
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-1.5" />
                      <span className="hidden md:inline">Logout</span>
                    </Button>
                    
                    {/* Mobile logout - Icon only */}
                    <Button 
                      onClick={() => window.location.href = '/api/logout'}
                      variant="ghost"
                      size="icon"
                      className="sm:hidden"
                      data-testid="button-logout-mobile"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Login button - Text on desktop, icon on mobile */}
                    <Button 
                      onClick={() => window.location.href = '/api/login'}
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex"
                      data-testid="button-login"
                    >
                      <LogIn className="h-4 w-4 mr-1.5" />
                      Login
                    </Button>
                    
                    <Button 
                      onClick={() => window.location.href = '/api/login'}
                      variant="ghost"
                      size="icon"
                      className="sm:hidden"
                      data-testid="button-login-mobile"
                    >
                      <LogIn className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {/* Pricing Link - Hidden on mobile */}
                <Link href="/pricing" className="hidden md:block">
                  <Button 
                    variant="ghost"
                    size="sm"
                    data-testid="button-pricing"
                  >
                    Pricing
                  </Button>
                </Link>
                
                {/* Upgrade CTA - Responsive sizing */}
                {(!user?.isPro) && (
                  <Link href="/pricing" className="hidden sm:block">
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-md"
                      size="sm"
                      data-testid="button-upgrade"
                    >
                      <span className="hidden lg:inline">Upgrade</span>
                      <span className="lg:hidden">Pro</span>
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
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Desktop Mega Menu Panel */}
        {megaMenuOpen && (
          <div 
            className="hidden lg:block absolute left-0 right-0 top-full bg-card border-b border-border shadow-2xl z-50"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
            onClick={() => setMegaMenuOpen(false)}
            data-testid="mega-menu-panel"
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-2 xl:grid-cols-6 gap-6">
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
                      <Link href="/repair-guide">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-service-guy-ai">
                          Service Guy AI
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
                  </ul>
                </div>

                {/* Community Column */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Community</h3>
                  </div>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/forum">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-forum">
                          Discussion Forum
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

                {/* Expert Help Column */}
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
                      <Link href="/about">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-about">
                          About Us
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing">
                        <div className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors hover-elevate rounded-md px-2 py-1.5" data-testid="link-nav-pricing-menu">
                          Pricing
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border max-h-[80vh] overflow-y-auto" data-testid="nav-mobile-menu">
            <div className="space-y-4">
              {/* Platform Section */}
              <div>
                <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Platform</div>
                <Link href="/design-studio"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Design Studio 2D/3D</div></Link>
                <Link href="/cleanbi"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>CLEANBI™ Analysis</div></Link>
                <Link href="/repair-guide"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Service Guy AI</div></Link>
              </div>
              
              {/* Resources Section */}
              <div>
                <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Resources</div>
                <Link href="/resources"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Resource Hub</div></Link>
                <Link href="/roi-calculator"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>ROI Calculator</div></Link>
                <Link href="/funding-matcher"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Funding Matcher</div></Link>
              </div>
              
              {/* Marketplace Section */}
              <div>
                <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Marketplace</div>
                <Link href="/marketplace"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Buy/Sell Laundromats</div></Link>
                <Link href="/superstore"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Equipment Superstore</div></Link>
              </div>
              
              {/* Learn Section */}
              <div>
                <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Learn</div>
                <Link href="/courses"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Premium Courses</div></Link>
                <Link href="/book"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>The Laundromat Bible</div></Link>
                <Link href="/blog"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Industry Blog</div></Link>
              </div>
              
              {/* Community Section */}
              <div>
                <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Community</div>
                <Link href="/forum"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Discussion Forum</div></Link>
                <Link href="/consultation"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Book Consultation</div></Link>
              </div>
              
              {/* Pricing/About Section */}
              <div className="border-t border-border pt-4">
                <Link href="/pricing"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>Pricing</div></Link>
                <Link href="/about"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md" onClick={() => setMobileMenuOpen(false)}>About Us</div></Link>
                {isAuthenticated && (
                  <Link href="/settings"><div className="block px-3 py-2 text-foreground/80 hover:bg-muted/50 cursor-pointer rounded-md sm:hidden" onClick={() => setMobileMenuOpen(false)}>Settings</div></Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
    </>
  );
}
