import { useState, useMemo } from "react";
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
  BookOpen, GraduationCap, HelpCircle, Wallet,
  BarChart3, Zap, Landmark, Factory, CreditCard, 
  Briefcase, TrendingUp, PiggyBank, Receipt, Users,
  LineChart, PieChart, Calendar, Shield, Monitor, Award, Tag
} from "lucide-react";
import logoUrl from "@assets/6_1764040628012.png";
import { MobileMenu } from "@/components/MobileMenu";

const PRODUCTS_LINKS = [
  { href: "/cleanbi-explorer", label: "CLEANBI Explorer", icon: MapPin, desc: "Location intelligence & scoring", featured: true },
  { href: "/service-guy-ai", label: "Service Guy AI", icon: Zap, desc: "AI-powered repair assistant", featured: true },
  { href: "/design-studio-pro", label: "Design Studio", icon: Palette, desc: "Store layout planning" },
  { href: "/pos-command-center", label: "POS Command Center", icon: Monitor, desc: "Point-of-sale management" },
];

const CALCULATORS_LINKS = [
  { href: "/calculators", label: "Calculator Suite", icon: Calculator, desc: "All professional calculators", featured: true },
  { href: "/valuation-calculator", label: "Valuation", icon: DollarSign, desc: "4 valuation methods" },
  { href: "/roi-calculator", label: "ROI", icon: TrendingUp, desc: "5-year projections" },
  { href: "/loan-calculator", label: "Loan", icon: BarChart3, desc: "Amortization analysis" },
  { href: "/utility-calculator", label: "Utility", icon: Zap, desc: "UPG benchmarking" },
  { href: "/labor-calculator", label: "Labor", icon: Users, desc: "Staffing optimization" },
  { href: "/tpd-calculator", label: "TPD", icon: LineChart, desc: "Turns per day analysis" },
];

const MARKETPLACE_LINKS = [
  { href: "/equipment", label: "Equipment Hub", icon: Package, desc: "Dexter & Continental Girbau - Buy, Parts, Service", featured: true },
  { href: "/list-on-washbizhub", label: "List on WashBizHub", icon: Sparkles, desc: "Sell your business, equipment, or services" },
  { href: "/laundromat-listings", label: "Laundromats for Sale", icon: Building2, desc: "Browse active listings" },
  { href: "/equipment-for-sale", label: "Equipment for Sale", icon: Tag, desc: "Used & new equipment marketplace" },
  { href: "/directory", label: "Vendor Directory", icon: Handshake, desc: "Find service providers" },
];

const RESOURCES_LINKS = [
  { href: "/forum", label: "Community Forum", icon: Users, desc: "Connect with 72K+ owners", featured: true },
  { href: "/consultation", label: "Consultations", icon: Handshake, desc: "Expert business advice", featured: true },
  { href: "/blog", label: "Blog", icon: BookOpen, desc: "News & insights" },
  { href: "/events", label: "Events", icon: Calendar, desc: "Trade shows & conferences" },
  { href: "/courses", label: "Courses", icon: GraduationCap, desc: "Courses & training" },
  { href: "/help-center", label: "Help Center", icon: HelpCircle, desc: "FAQs & support" },
  { href: "/larry-larsen", label: "Larry Larsen Expert", icon: Award, desc: "50+ years experience" },
  { href: "/larry-larsen", label: "Insurance", icon: Shield, desc: "Laundromat insurance services" },
];

const FUNDING_LINKS = [
  { href: "/funding", label: "Funding Hub", icon: DollarSign, desc: "Compare all 7 lenders", featured: true },
  { href: "/funding?tab=startup", label: "Startup Funding", icon: PiggyBank, desc: "No business history required" },
  { href: "/funding?tab=sba", label: "SBA Loans", icon: Briefcase, desc: "10-25 year terms" },
  { href: "/funding?tab=equipment", label: "Equipment Financing", icon: Factory, desc: "Same-day approval" },
  { href: "/funding?tab=realestate", label: "Commercial Real Estate", icon: Landmark, desc: "Up to 80% LTV" },
  { href: "/funding?tab=fastcash", label: "Working Capital", icon: TrendingUp, desc: "Same-day funding" },
];

interface NavLinkItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  desc?: string;
  featured?: boolean;
}

function DropdownLink({ href, label, desc, featured }: NavLinkItem) {
  const handleClick = () => {
    window.location.href = href;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = href;
    }
  };

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
}

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

        {/* Main nav bar - Premium Navy with clear hierarchy */}
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

              {/* Desktop navigation - 4 pillars */}
              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                <NavMenu>
                  <NavigationMenuList className="gap-0">
                    {/* Products */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-products"
                      >
                        Products
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[340px] p-3 bg-popover rounded-xl shadow-xl border border-border"
                        >
                          <div className="mb-2 pb-2 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Intelligence Tools
                            </span>
                          </div>
                          <div className="space-y-1">
                            {PRODUCTS_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Calculators */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-calculators"
                      >
                        Calculators
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[360px] p-3 bg-popover rounded-xl shadow-xl border border-border"
                        >
                          <div className="mb-2 pb-2 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Professional Calculators
                            </span>
                          </div>
                          <div className="space-y-1">
                            {CALCULATORS_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Marketplace */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-marketplace"
                      >
                        Marketplace
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[340px] p-3 bg-popover rounded-xl shadow-xl border border-border"
                        >
                          <div className="mb-2 pb-2 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Buy & Sell
                            </span>
                          </div>
                          <div className="space-y-1">
                            {MARKETPLACE_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Resources */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-resources"
                      >
                        Resources
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[340px] p-3 bg-popover rounded-xl shadow-xl border border-border"
                        >
                          <div className="mb-2 pb-2 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Learn & Grow
                            </span>
                          </div>
                          <div className="space-y-1">
                            {RESOURCES_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Funding - 7 Lending Partners */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-funding"
                      >
                        Funding
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[380px] p-3 bg-popover rounded-xl shadow-xl border border-border"
                        >
                          <div className="mb-2 pb-2 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              7 Trusted Lending Partners
                            </span>
                          </div>
                          <div className="space-y-1">
                            {FUNDING_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
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

                {/* Primary CTA - Gold CLEANBI button */}
                <Button 
                  onClick={() => window.location.href = '/cleanbi-explorer'}
                  className="hidden sm:flex h-10 px-5 font-semibold bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] border-0 shadow-lg shadow-[#C8A661]/25 transition-all duration-300"
                  data-testid="button-cleanbi-cta"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Try CLEANBI Free
                </Button>

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
        </div>
      </header>
    </>
  );
}
