import { useState, useMemo, useCallback, memo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  NavigationMenu as NavMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  LogOut, Search, ChevronRight, Sparkles, 
  MapPin, Building2, DollarSign, Calculator, Palette,
  ShoppingCart, Package, Handshake,
  BookOpen, GraduationCap, Users,
  BarChart3, Zap, Landmark, 
  TrendingUp, 
  Calendar, Monitor, Tag, LayoutGrid, Info
} from "lucide-react";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";
import { MobileMenu } from "@/components/MobileMenu";
import { PersonaSwitcher, PersonaCTA, PersonaNavBanner } from "@/components/PersonaNav";

// BUY - For buyers and investors
const BUY_LINKS = [
  { href: "/laundromat-listings", label: "Laundromats for Sale", icon: Building2, desc: "Browse active listings", featured: true },
  { href: "/cleanbi-explorer", label: "CLEANBI Explorer", icon: MapPin, desc: "AI-powered location intelligence", featured: true },
  { href: "/brokers", label: "Find a Broker", icon: Users, desc: "Verified industry brokers" },
  { href: "/funding", label: "Funding Options", icon: Landmark, desc: "SBA loans & financing" },
  { href: "/roi-calculator", label: "ROI Calculator", icon: TrendingUp, desc: "5-year projections" },
  { href: "/valuation-calculator", label: "Valuation Calculator", icon: DollarSign, desc: "4 valuation methods" },
];

// OPERATE - For current owners
const OPERATE_LINKS = [
  { href: "/pos-command-center", label: "POS Command Center", icon: Monitor, desc: "Sales, customers & transactions", featured: true },
  { href: "/operator-dashboard", label: "Operator Dashboard", icon: LayoutGrid, desc: "KPIs & daily operations" },
  { href: "/equipment", label: "Equipment Hub", icon: Package, desc: "Dexter & Continental Girbau", featured: true },
  { href: "/service-guy-ai", label: "Service Guy AI", icon: Zap, desc: "AI equipment diagnostics" },
  { href: "/design-studio-pro", label: "Design Studio", icon: Palette, desc: "2D/3D floor planning" },
  { href: "/machine-booking", label: "Machine Booking", icon: Calendar, desc: "Online reservations" },
  { href: "/utility-calculator", label: "Utility Calculator", icon: BarChart3, desc: "UPG benchmarking" },
];

// SELL - For sellers
const SELL_LINKS = [
  { href: "/list-on-washbizhub", label: "List on WashBizHub", icon: Sparkles, desc: "Sell your business or equipment", featured: true },
  { href: "/valuation-calculator", label: "Valuation Calculator", icon: DollarSign, desc: "Know your business worth", featured: true },
  { href: "/brokers", label: "Find a Broker", icon: Users, desc: "Connect with verified brokers" },
  { href: "/equipment-for-sale", label: "Equipment for Sale", icon: Tag, desc: "List used equipment" },
  { href: "/directory", label: "Vendor Directory", icon: Handshake, desc: "Find service providers" },
];

// LEARN - Resources and education
const LEARN_LINKS = [
  { href: "/laundromat-expert", label: "Laundromat Expert AI", icon: Sparkles, desc: "AI consultant - 50+ years knowledge", featured: true },
  { href: "/courses", label: "Courses & Training", icon: GraduationCap, desc: "Learn from industry experts" },
  { href: "/laundromat-bible", label: "Laundromat Bible", icon: BookOpen, desc: "The complete owner's guide", featured: true },
  { href: "/forum", label: "Community Forum", icon: Users, desc: "Connect with 73K+ owners" },
  { href: "/blog", label: "Blog", icon: BookOpen, desc: "News & insights" },
  { href: "/consultation", label: "Consultations", icon: Handshake, desc: "Expert business advice" },
  { href: "/about-us", label: "About Us", icon: Info, desc: "Our mission & team" },
];

interface NavLinkItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  desc?: string;
  featured?: boolean;
}

const DropdownLink = memo(function DropdownLink({ href, label, desc, featured }: NavLinkItem) {
  const handleClick = useCallback(() => {
    window.location.href = href;
  }, [href]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = href;
    }
  }, [href]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group w-full text-left flex items-center justify-between px-4 py-2.5 rounded-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A661]/50 ${
        featured 
          ? 'bg-[#C8A661]/10 hover:bg-[#C8A661]/20' 
          : 'hover:bg-muted'
      }`}
      data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
      aria-label={`Navigate to ${label}`}
    >
      <div className="flex-1 min-w-0">
        <span className={`block text-sm font-medium ${featured ? 'text-[#C8A661]' : 'text-foreground'}`}>
          {label}
        </span>
        {desc && (
          <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
    </button>
  );
});

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = useMemo(() => (path: string) => location === path, [location]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
      <header className="sticky top-0 z-50">
        {/* Top utility bar - slim and professional */}
        <div className="bg-[#0a1929] text-white/60 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline">The #1 Laundromat Intelligence Platform</span>
                <span className="sm:hidden text-[#C8A661] font-medium">WashBizHub</span>
              </div>

              <div className="flex items-center gap-3">
                <PersonaSwitcher />
                <span className="text-white/20 hidden sm:inline">|</span>
                <ThemeToggle />
                
                {isLoading ? (
                  <div className="w-12 h-4 bg-white/10 rounded animate-pulse" />
                ) : isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <Link href="/account/subscription">
                      <span className="text-white/70 hover:text-[#C8A661] transition-colors cursor-pointer hidden sm:inline">
                        {user.email}
                      </span>
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-1.5 hover:text-[#C8A661] transition-colors"
                      data-testid="button-logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <span 
                        className="hover:text-[#C8A661] transition-colors cursor-pointer"
                        data-testid="link-signin"
                      >
                        Sign In
                      </span>
                    </Link>
                    <span className="text-white/30">|</span>
                    <Link href="/signup">
                      <span 
                        className="text-[#C8A661] hover:text-[#d4b86a] transition-colors cursor-pointer font-medium"
                        data-testid="link-signup"
                      >
                        Sign Up
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between gap-6">
              {/* Logo */}
              <Link 
                href="/" 
                data-testid="link-logo" 
                className="shrink-0 flex items-center gap-2"
              >
                <img 
                  src={logoUrl} 
                  alt="WashBizHub" 
                  className="h-10 w-auto" 
                  loading="eager"
                  width={40}
                  height={40}
                />
                <span className="hidden sm:block text-foreground font-bold text-lg tracking-tight">
                  WashBizHub
                </span>
              </Link>

              {/* Desktop navigation - 4 core paths */}
              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                <NavMenu>
                  <NavigationMenuList className="gap-0">
                    {/* BUY - For buyers/investors */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-buy"
                      >
                        Buy
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[380px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          {/* Header */}
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                                <ShoppingCart className="h-3.5 w-3.5 text-[#C8A661]" />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">Find & Fund Your Laundromat</p>
                                <p className="text-white/60 text-xs">Tools for buyers and investors</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Links */}
                          <div className="p-3 space-y-1">
                            {BUY_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                          
                          {/* Footer CTA */}
                          <div className="bg-muted/50 border-t border-border px-4 py-3 flex items-center justify-between">
                            <button
                              onClick={() => window.location.href = '/for-buyers'}
                              className="text-sm font-medium text-[#C8A661] hover:text-[#B8964F] transition-colors flex items-center gap-1.5"
                              data-testid="link-buyer-hub"
                            >
                              Buyer's Hub
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <Button
                              size="sm"
                              onClick={() => window.location.href = '/cleanbi-explorer'}
                              className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-8"
                              data-testid="button-explore-locations"
                            >
                              <MapPin className="w-3.5 h-3.5 mr-1.5" />
                              Explore Locations
                            </Button>
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* OPERATE - For current owners */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-operate"
                      >
                        Operate
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[380px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          {/* Header */}
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                                <Monitor className="h-3.5 w-3.5 text-[#C8A661]" />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">Run Your Laundromat</p>
                                <p className="text-white/60 text-xs">Operations, equipment & revenue tools</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Links */}
                          <div className="p-3 space-y-1">
                            {OPERATE_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                          
                          {/* Footer CTA */}
                          <div className="bg-muted/50 border-t border-border px-4 py-3 flex items-center justify-between">
                            <button
                              onClick={() => window.location.href = '/for-owners'}
                              className="text-sm font-medium text-[#C8A661] hover:text-[#B8964F] transition-colors flex items-center gap-1.5"
                              data-testid="link-owner-hub"
                            >
                              Owner's Hub
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <Button
                              size="sm"
                              onClick={() => window.location.href = '/operator-dashboard'}
                              className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-8"
                              data-testid="button-open-dashboard"
                            >
                              <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                              Open Dashboard
                            </Button>
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* SELL - For sellers */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-sell"
                      >
                        Sell
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[380px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          {/* Header */}
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                                <Tag className="h-3.5 w-3.5 text-[#C8A661]" />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">Sell Your Business or Equipment</p>
                                <p className="text-white/60 text-xs">Valuations, listings & broker connections</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Links */}
                          <div className="p-3 space-y-1">
                            {SELL_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                          
                          {/* Footer CTA */}
                          <div className="bg-muted/50 border-t border-border px-4 py-3 flex items-center justify-between">
                            <button
                              onClick={() => window.location.href = '/for-sellers'}
                              className="text-sm font-medium text-[#C8A661] hover:text-[#B8964F] transition-colors flex items-center gap-1.5"
                              data-testid="link-seller-hub"
                            >
                              Seller's Hub
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <Button
                              size="sm"
                              onClick={() => window.location.href = '/list-on-washbizhub'}
                              className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-8"
                              data-testid="button-list-now"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              List Now
                            </Button>
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* LEARN - Resources */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-learn"
                      >
                        Learn
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[380px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          {/* Header */}
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                                <GraduationCap className="h-3.5 w-3.5 text-[#C8A661]" />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">Learn & Grow</p>
                                <p className="text-white/60 text-xs">Education, community & expert resources</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Links */}
                          <div className="p-3 space-y-1">
                            {LEARN_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                          
                          {/* Footer CTA */}
                          <div className="bg-muted/50 border-t border-border px-4 py-3 flex items-center justify-between">
                            <button
                              onClick={() => window.location.href = '/platform-directory'}
                              className="text-sm font-medium text-[#C8A661] hover:text-[#B8964F] transition-colors flex items-center gap-1.5"
                              data-testid="link-all-features"
                            >
                              All Features
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <Button
                              size="sm"
                              onClick={() => window.location.href = '/laundromat-expert'}
                              className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-8"
                              data-testid="button-ask-expert"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              Ask Expert AI
                            </Button>
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Pricing - Direct link */}
                    <NavigationMenuItem>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="h-10 px-4 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md inline-flex items-center transition-colors"
                        data-testid="link-nav-pricing"
                      >
                        Pricing
                      </button>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavMenu>
              </nav>

              {/* Right side actions */}
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Search"
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4" />
                </Button>

                {/* Primary CTA - Persona-aware */}
                <PersonaCTA />

                {/* Mobile menu */}
                <MobileMenu />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div 
                className="hidden md:block border-t border-white/10 bg-[#0f2744]"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search tools, listings, resources..."
                      className="pl-11 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      data-testid="input-search-desktop"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persona journey banner */}
          <PersonaNavBanner />
        </div>
      </header>
    </>
  );
}
