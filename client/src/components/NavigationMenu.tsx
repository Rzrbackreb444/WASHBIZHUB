import { useState, memo, useCallback } from "react";
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
  MapPin, Building2, DollarSign, Calculator,
  ShoppingCart, Package, Handshake,
  BookOpen, GraduationCap, Wallet,
  BarChart3, Zap, Landmark, Factory,
  Briefcase, TrendingUp, PiggyBank, Users,
  LineChart, Monitor, Tag, LayoutGrid, 
  Globe, Calendar, Award, Crown
} from "lucide-react";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";
import { MobileMenu } from "@/components/MobileMenu";
import { PersonaSwitcher, PersonaCTA, PersonaNavBanner } from "@/components/PersonaNav";

interface NavLinkItem {
  href: string;
  label: string;
  desc?: string;
  featured?: boolean;
}

const DropdownLink = memo(function DropdownLink({ href, label, desc, featured }: NavLinkItem) {
  const handleClick = useCallback(() => {
    window.location.href = href;
  }, [href]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group w-full text-left flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A661]/50 ${
        featured 
          ? 'bg-[#C8A661]/10 hover:bg-[#C8A661]/20' 
          : 'hover:bg-muted'
      }`}
      data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex-1 min-w-0">
        <span className={`block text-sm font-medium ${featured ? 'text-[#C8A661]' : 'text-foreground'}`}>
          {label}
        </span>
        {desc && (
          <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
    </button>
  );
});

const BUY_LINKS = {
  discover: [
    { href: "/laundromat-listings", label: "Laundromats for Sale", desc: "Browse active listings", featured: true },
    { href: "/cleanbi-explorer", label: "CLEANBI Explorer", desc: "AI location scoring", featured: true },
    { href: "/brokers", label: "Find a Broker", desc: "Verified industry brokers" },
    { href: "/marketplace", label: "Full Marketplace", desc: "All opportunities" },
  ],
  calculators: [
    { href: "/calculators", label: "Calculator Suite", desc: "All professional calculators", featured: true },
    { href: "/valuation-calculator", label: "Valuation", desc: "4 valuation methods" },
    { href: "/roi-calculator", label: "ROI", desc: "5-year projections" },
    { href: "/loan-calculator", label: "Loan", desc: "Amortization analysis" },
  ],
  funding: [
    { href: "/funding", label: "Funding Marketplace", desc: "Compare all lenders", featured: true },
    { href: "/funding?tab=startup", label: "Startup Funding", desc: "First laundromat" },
    { href: "/funding?tab=acquisitions", label: "SBA Loans", desc: "Acquisition financing" },
    { href: "/funding/preferred-funding-group", label: "Preferred Funding", desc: "Up to $500K" },
  ],
};

const OPERATE_LINKS = {
  platform: [
    { href: "/pos-command-center", label: "POS System", desc: "Point of sale & transactions", featured: true },
    { href: "/operator-dashboard", label: "Operator Dashboard", desc: "KPIs & daily operations", featured: true },
    { href: "/machine-booking", label: "Machine Booking", desc: "Online reservations" },
    { href: "/command-center", label: "Command Center", desc: "Customizable dashboard" },
  ],
  tools: [
    { href: "/service-guy-ai", label: "Service Guy AI", desc: "Equipment diagnostics", featured: true },
    { href: "/design-studio-pro", label: "Design Studio", desc: "2D/3D floor planning" },
    { href: "/utility-calculator", label: "Utility Calculator", desc: "UPG benchmarking" },
    { href: "/labor-calculator", label: "Labor Calculator", desc: "Staffing optimization" },
  ],
  growth: [
    { href: "/website-builder", label: "Website Builder", desc: "Build your site", featured: true },
    { href: "/seo-command-center", label: "SEO Dashboard", desc: "Search optimization" },
    { href: "/seo-command-center?tab=citations", label: "Local Citations", desc: "Build local presence" },
    { href: "/seo-command-center?tab=llm", label: "AI Visibility", desc: "Track ChatGPT mentions" },
  ],
};

const SELL_LINKS = {
  listing: [
    { href: "/list-on-washbizhub", label: "List Your Business", desc: "Sell on WashBizHub", featured: true },
    { href: "/valuation-calculator", label: "Get Valuation", desc: "4 valuation methods", featured: true },
    { href: "/brokers", label: "Connect with Brokers", desc: "Verified industry brokers" },
  ],
  equipment: [
    { href: "/equipment", label: "Equipment Hub", desc: "Dexter & Continental Girbau", featured: true },
    { href: "/equipment-for-sale", label: "Equipment for Sale", desc: "Used & new marketplace" },
    { href: "/directory", label: "Vendor Directory", desc: "Service providers" },
  ],
};

const LEARN_LINKS = {
  education: [
    { href: "/courses", label: "Courses & Training", desc: "Learn from experts", featured: true },
    { href: "/laundromat-bible", label: "Laundromat Bible", desc: "Complete owner's guide", featured: true },
    { href: "/blog", label: "Blog", desc: "News & insights" },
    { href: "/template-vault", label: "Template Vault", desc: "Business documents" },
  ],
  experts: [
    { href: "/laundromat-expert", label: "Laundromat Expert AI", desc: "AI consultant - 50+ years knowledge", featured: true },
    { href: "/consultation", label: "Consultations", desc: "Expert business advice" },
    { href: "/larry-larsen", label: "Larry Larsen", desc: "Industry veteran" },
  ],
  community: [
    { href: "/forum", label: "Community Forum", desc: "Connect with 73K+ owners", featured: true },
    { href: "/network", label: "Member Network", desc: "Find professionals" },
    { href: "/events", label: "Events", desc: "Trade shows & meetups" },
  ],
};

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
        {/* Top utility bar */}
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
                      <span className="hover:text-[#C8A661] transition-colors cursor-pointer" data-testid="link-signin">
                        Sign In
                      </span>
                    </Link>
                    <span className="text-white/30">|</span>
                    <Link href="/signup">
                      <span className="text-[#C8A661] hover:text-[#d4b86a] transition-colors cursor-pointer font-medium" data-testid="link-signup">
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
              <Link href="/" data-testid="link-logo" className="shrink-0 flex items-center gap-2">
                <img src={logoUrl} alt="WashBizHub" className="h-10 w-auto" loading="eager" width={40} height={40} />
                <span className="hidden sm:block text-foreground font-bold text-lg tracking-tight">WashBizHub</span>
              </Link>

              {/* Desktop navigation - 4 clean sections */}
              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                <NavMenu>
                  <NavigationMenuList className="gap-0">
                    {/* BUY */}
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
                          transition={{ duration: 0.15 }}
                          className="w-[640px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-4 py-2.5 flex items-center gap-3">
                            <ShoppingCart className="h-4 w-4 text-[#C8A661]" />
                            <span className="text-white font-semibold text-sm">Find & Fund Your Laundromat</span>
                          </div>
                          <div className="grid grid-cols-3 gap-0 p-1">
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                                <Building2 className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Discover</span>
                              </div>
                              <div className="space-y-0.5">
                                {BUY_LINKS.discover.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                            <div className="p-3 border-x border-border">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                                <Calculator className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Analyze</span>
                              </div>
                              <div className="space-y-0.5">
                                {BUY_LINKS.calculators.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#C8A661]/30">
                                <Landmark className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-[#C8A661] uppercase">Fund</span>
                              </div>
                              <div className="space-y-0.5">
                                {BUY_LINKS.funding.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* OPERATE */}
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
                          transition={{ duration: 0.15 }}
                          className="w-[640px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-4 py-2.5 flex items-center gap-3">
                            <Monitor className="h-4 w-4 text-[#C8A661]" />
                            <span className="text-white font-semibold text-sm">Run & Grow Your Business</span>
                          </div>
                          <div className="grid grid-cols-3 gap-0 p-1">
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                                <LayoutGrid className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Platform</span>
                              </div>
                              <div className="space-y-0.5">
                                {OPERATE_LINKS.platform.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                            <div className="p-3 border-x border-border">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                                <Zap className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Tools</span>
                              </div>
                              <div className="space-y-0.5">
                                {OPERATE_LINKS.tools.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-green-500/30">
                                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Growth</span>
                              </div>
                              <div className="space-y-0.5">
                                {OPERATE_LINKS.growth.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* SELL */}
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
                          transition={{ duration: 0.15 }}
                          className="w-[420px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-4 py-2.5 flex items-center gap-3">
                            <Tag className="h-4 w-4 text-[#C8A661]" />
                            <span className="text-white font-semibold text-sm">Sell Your Business or Equipment</span>
                          </div>
                          <div className="grid grid-cols-2 gap-0 p-1">
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                                <Building2 className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Business</span>
                              </div>
                              <div className="space-y-0.5">
                                {SELL_LINKS.listing.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                            <div className="p-3 border-l border-border">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                                <Package className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Equipment</span>
                              </div>
                              <div className="space-y-0.5">
                                {SELL_LINKS.equipment.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* LEARN */}
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
                          transition={{ duration: 0.15 }}
                          className="w-[560px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-4 py-2.5 flex items-center gap-3">
                            <GraduationCap className="h-4 w-4 text-[#C8A661]" />
                            <span className="text-white font-semibold text-sm">Learn from Industry Experts</span>
                          </div>
                          <div className="grid grid-cols-3 gap-0 p-1">
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                                <BookOpen className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Education</span>
                              </div>
                              <div className="space-y-0.5">
                                {LEARN_LINKS.education.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                            <div className="p-3 border-x border-border">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#C8A661]/30">
                                <Sparkles className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-[#C8A661] uppercase">Experts</span>
                              </div>
                              <div className="space-y-0.5">
                                {LEARN_LINKS.experts.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-border">
                                <Users className="h-3.5 w-3.5 text-[#C8A661]" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Community</span>
                              </div>
                              <div className="space-y-0.5">
                                {LEARN_LINKS.community.map((link) => <DropdownLink key={link.href} {...link} />)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* FundingHub - Direct link */}
                    <NavigationMenuItem>
                      <button
                        onClick={() => window.location.href = '/funding'}
                        className="h-10 px-4 text-sm font-medium text-[#C8A661] hover:text-[#d4b86a] hover:bg-muted rounded-md inline-flex items-center transition-colors"
                        data-testid="link-nav-fundinghub"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        FundingHub
                      </button>
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
                <PersonaCTA />
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

          <PersonaNavBanner />
        </div>
      </header>
    </>
  );
}
