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
  LogOut, Search, ChevronRight, Sparkles, Globe, Crown,
  MapPin, Building2, DollarSign, Calculator, Palette,
  ShoppingCart, Package, Handshake,
  BookOpen, GraduationCap, HelpCircle, Wallet,
  BarChart3, Zap, Landmark, Factory, CreditCard, 
  Briefcase, TrendingUp, PiggyBank, Receipt, Users,
  LineChart, PieChart, Calendar, Shield, Monitor, Award, Tag, LayoutGrid, Info
} from "lucide-react";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";
import { MobileMenu } from "@/components/MobileMenu";
import { PersonaSwitcher, PersonaCTA, PersonaNavBanner } from "@/components/PersonaNav";
import { usePersona, PERSONA_CONFIG } from "@/contexts/PersonaContext";

const PLATFORM_LAUNCH_ONLINE = {
  title: "Launch Online",
  subtitle: "Your digital presence, done right",
  icon: Globe,
  featured: { href: "/website-builder", label: "Website Builder", desc: "Build a professional site in minutes" },
  links: [
    { href: "/website-builder", label: "Website Builder", icon: Globe, desc: "Drag-and-drop site creator" },
    { href: "/seo-command-center", label: "SEO Dashboard", icon: Search, desc: "Optimize for search engines" },
  ],
  hostingFeatures: [
    "Managed CDN & Edge Caching",
    "99.9% Uptime Monitoring",
    "Real-time Visitor Analytics",
    "Staging Environments",
    "Multi-site Management"
  ]
};

const PLATFORM_RUN_INSTORE = {
  title: "Run In-Store",
  subtitle: "Everything to run your operation",
  icon: Monitor,
  featured: { href: "/pos-command-center", label: "POS Command Center", desc: "Complete point-of-sale system" },
  links: [
    { href: "/pos-command-center", label: "POS System", icon: Monitor, desc: "Sales, customers & transactions" },
    { href: "/operator-dashboard", label: "Operator Dashboard", icon: LayoutGrid, desc: "KPIs & daily operations" },
    { href: "/machine-booking", label: "Machine Booking", icon: Calendar, desc: "Online reservations" },
    { href: "/design-studio-pro", label: "Design Studio", icon: Palette, desc: "2D/3D floor planning" },
    { href: "/service-guy-ai", label: "Service Guy AI", icon: Zap, desc: "Equipment diagnostics" },
  ]
};

const PLATFORM_GROW_TRAFFIC = {
  title: "Grow Traffic",
  subtitle: "Get found by more customers",
  icon: TrendingUp,
  featured: { href: "/seo-command-center", label: "SEO Command Center", desc: "All-in-one SEO optimization" },
  links: [
    { href: "/seo-command-center", label: "SEO Auto-Fix Engine", icon: Zap, desc: "1-click issue resolution" },
    { href: "/seo-command-center?tab=rankings", label: "Rank Tracking", icon: LineChart, desc: "Daily position monitoring" },
    { href: "/seo-command-center?tab=citations", label: "Local Citations", icon: MapPin, desc: "Build local presence" },
    { href: "/seo-command-center?tab=backlinks", label: "Backlink Builder", icon: Users, desc: "Authority & outreach" },
    { href: "/seo-command-center?tab=llm", label: "AI Visibility", icon: Sparkles, desc: "Track ChatGPT, Gemini mentions" },
  ],
  stat: { value: "219", label: "fixes automated this week" }
};

const PRODUCTS_INTELLIGENCE = [
  { href: "/cleanbi-explorer", label: "CLEANBI Explorer", icon: MapPin, desc: "AI-powered location scoring", featured: true },
  { href: "/command-center", label: "Command Center", icon: LayoutGrid, desc: "Customizable dashboard", featured: true },
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

const MARKETPLACE_BUY_LINKS = [
  { href: "/laundromat-listings", label: "Laundromats for Sale", icon: Building2, desc: "Browse active listings", featured: true },
  { href: "/brokers", label: "Find a Broker", icon: Users, desc: "Verified industry brokers" },
];

const ACQUISITION_LENDERS = [
  { href: "/funding/national-business-capital", label: "National Business Capital", icon: Landmark, desc: "SBA acquisitions $100K-$10M" },
  { href: "/funding/south-end-capital", label: "South End Capital", icon: Landmark, desc: "SBA preferred lender" },
  { href: "/funding/rok-financial", label: "ROK Financial", icon: Factory, desc: "75+ lender network" },
];

const MARKETPLACE_SELL_LINKS = [
  { href: "/list-on-washbizhub", label: "List on WashBizHub", icon: Sparkles, desc: "Sell your business, equipment, or services" },
  { href: "/equipment", label: "Equipment Hub", icon: Package, desc: "Dexter & Continental Girbau - Buy, Parts, Service", featured: true },
  { href: "/equipment-for-sale", label: "Equipment for Sale", icon: Tag, desc: "Used & new equipment marketplace" },
  { href: "/directory", label: "Vendor Directory", icon: Handshake, desc: "Find service providers" },
];

const PERSONA_HUB_LINKS = [
  { href: "/for-buyers", label: "For Buyers", icon: ShoppingCart, desc: "Tools for finding & funding your laundromat", featured: true },
  { href: "/for-owners", label: "For Owners", icon: Monitor, desc: "Operations, equipment & revenue tools", featured: true },
  { href: "/for-sellers", label: "For Sellers", icon: Building2, desc: "Valuations, listings & broker connections", featured: true },
  { href: "/laundromat-expert", label: "Laundromat Expert AI", icon: Sparkles, desc: "Your AI consultant for everything laundromat", featured: true },
];

const RESOURCES_LINKS = [
  { href: "/platform-directory", label: "All Features", icon: LayoutGrid, desc: "Explore 100+ platform tools", featured: true },
  { href: "/laundromat-expert", label: "Laundromat Expert AI", icon: Sparkles, desc: "AI consultant - 50+ years knowledge" },
  { href: "/forum", label: "Community Forum", icon: Users, desc: "Connect with 73K+ owners" },
  { href: "/network", label: "Member Network", icon: Users, desc: "Find & connect with professionals" },
  { href: "/courses", label: "Courses & Training", icon: GraduationCap, desc: "Learn from industry experts" },
  { href: "/laundromat-bible", label: "Laundromat Bible", icon: BookOpen, desc: "The complete owner's guide" },
  { href: "/distributor-locator", label: "Distributor Locator", icon: MapPin, desc: "Find equipment dealers" },
  { href: "/laundromat-locator", label: "Laundromat Locator", icon: MapPin, desc: "Find laundromats near you" },
  { href: "/service-guy-ai", label: "Service Guy AI", icon: Zap, desc: "AI equipment diagnostics" },
  { href: "/consultation", label: "Consultations", icon: Handshake, desc: "Expert business advice" },
  { href: "/blog", label: "Blog", icon: BookOpen, desc: "News & insights" },
  { href: "/about-us", label: "About Us", icon: Info, desc: "Our mission & team" },
];

// Funding organized by PURPOSE for guided journey
const FUNDING_BY_PURPOSE = [
  { href: "/funding?tab=startup", label: "Startup Funding", icon: PiggyBank, desc: "First laundromat? Start here (680+ credit)", featured: true },
  { href: "/funding?tab=acquisitions", label: "Buy a Laundromat", icon: Briefcase, desc: "SBA loans, 10-25 year terms" },
  { href: "/funding?tab=equipment", label: "Equipment Financing", icon: Factory, desc: "Washers, dryers & systems" },
  { href: "/funding?tab=realestate", label: "Commercial Real Estate", icon: Building2, desc: "Purchase or refinance property" },
  { href: "/funding?tab=fastcash", label: "Fast Cash / Working Capital", icon: Zap, desc: "Same-day funding, any credit" },
];

const FUNDING_PARTNERS = [
  { href: "/funding/preferred-funding-group", label: "Preferred Funding Group", icon: CreditCard, desc: "Personal credit up to $500K" },
  { href: "/funding/gokapital", label: "GoKapital", icon: Briefcase, desc: "Build business credit" },
  { href: "/funding/advance-funds-network", label: "Advance Funds Network", icon: TrendingUp, desc: "Same-day funding" },
  { href: "/funding/david-allen-capital", label: "David Allen Capital", icon: PiggyBank, desc: "Zero-interest early payoff" },
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
                    {/* Platform - 3-Pillar Mega Menu */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted data-[state=open]:bg-muted"
                        data-testid="dropdown-platform"
                      >
                        Platform
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[780px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          {/* Hero Row */}
                          <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d45] px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                                <Zap className="h-4 w-4 text-[#C8A661]" />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">The Complete Laundromat Platform</p>
                                <p className="text-white/60 text-xs">Website, POS, SEO & Hosting - all in one place</p>
                              </div>
                            </div>
                            <span className="bg-[#C8A661] text-[#0A1628] text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                              All-in-One
                            </span>
                          </div>

                          {/* 3-Column Layout */}
                          <div className="grid grid-cols-3 gap-0">
                            {/* Column 1 - Launch Online */}
                            <div className="p-4 border-r border-border">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded bg-[#C8A661]/15 flex items-center justify-center">
                                  <Globe className="h-3 w-3 text-[#C8A661]" />
                                </div>
                                <span className="text-xs font-bold text-[#C8A661] uppercase tracking-wider">
                                  Launch Online
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mb-3">Your digital presence, done right</p>
                              <div className="space-y-1 mb-3">
                                {PLATFORM_LAUNCH_ONLINE.links.map((link) => (
                                  <DropdownLink key={link.href} {...link} />
                                ))}
                              </div>
                              <div className="bg-muted/50 rounded-lg p-2.5 space-y-1">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Includes Hosting</p>
                                {PLATFORM_LAUNCH_ONLINE.hostingFeatures.map((feature, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <div className="h-1 w-1 rounded-full bg-[#C8A661]" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 2 - Run In-Store */}
                            <div className="p-4 border-r border-border">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded bg-[#0A1628] flex items-center justify-center">
                                  <Monitor className="h-3 w-3 text-[#C8A661]" />
                                </div>
                                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                                  Run In-Store
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mb-3">Everything to run your operation</p>
                              <div className="space-y-1">
                                {PLATFORM_RUN_INSTORE.links.map((link) => (
                                  <DropdownLink key={link.href} {...link} />
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 3 - Grow Traffic */}
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded bg-green-500/15 flex items-center justify-center">
                                  <TrendingUp className="h-3 w-3 text-green-500" />
                                </div>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                                  Grow Traffic
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mb-3">Get found by more customers</p>
                              <div className="space-y-1 mb-3">
                                {PLATFORM_GROW_TRAFFIC.links.map((link) => (
                                  <DropdownLink key={link.href} {...link} />
                                ))}
                              </div>
                              <div className="bg-green-500/10 rounded-lg p-2.5 flex items-center gap-2">
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">{PLATFORM_GROW_TRAFFIC.stat.value}</span>
                                <span className="text-[10px] text-green-600/80 dark:text-green-400/80">{PLATFORM_GROW_TRAFFIC.stat.label}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Bottom CTA Bar */}
                          <div className="bg-muted/50 border-t border-border px-4 py-3 flex items-center justify-between">
                            <button
                              onClick={() => window.location.href = '/cleanbi-explorer'}
                              className="text-sm font-medium text-[#C8A661] hover:text-[#B8964F] transition-colors flex items-center gap-1.5"
                              data-testid="link-explore-cleanbi"
                            >
                              Explore CLEANBI Intelligence
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = '/demo'}
                                className="h-8"
                                data-testid="button-book-demo"
                              >
                                Book Demo
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => window.location.href = '/pricing'}
                                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-8"
                                data-testid="button-view-pricing"
                              >
                                <Crown className="w-3.5 h-3.5 mr-1.5" />
                                View Pricing
                              </Button>
                            </div>
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
                          className="w-[680px] bg-popover rounded-xl shadow-xl border border-border overflow-hidden"
                        >
                          <div className="grid grid-cols-3 gap-0">
                            {/* Column 1 - Buy a Laundromat */}
                            <div className="p-4 border-r border-border">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                                <div className="h-6 w-6 rounded bg-[#0A1628] flex items-center justify-center">
                                  <Building2 className="h-3 w-3 text-[#C8A661]" />
                                </div>
                                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                  Buy a Laundromat
                                </span>
                              </div>
                              <div className="space-y-1">
                                {MARKETPLACE_BUY_LINKS.map((link) => (
                                  <DropdownLink key={link.href} {...link} />
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 2 - Financing for Buyers */}
                            <div className="p-4 border-r border-border">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#C8A661]/30">
                                <div className="h-6 w-6 rounded bg-[#C8A661]/20 flex items-center justify-center">
                                  <Landmark className="h-3 w-3 text-[#C8A661]" />
                                </div>
                                <span className="text-xs font-semibold text-[#C8A661] uppercase tracking-wider">
                                  Financing for Buyers
                                </span>
                              </div>
                              <div className="space-y-1">
                                {ACQUISITION_LENDERS.map((link) => (
                                  <DropdownLink key={link.href} {...link} />
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 3 - Sell & Equipment */}
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                                <div className="h-6 w-6 rounded bg-[#0A1628] flex items-center justify-center">
                                  <Package className="h-3 w-3 text-[#C8A661]" />
                                </div>
                                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                  Sell & Equipment
                                </span>
                              </div>
                              <div className="space-y-1">
                                {MARKETPLACE_SELL_LINKS.map((link) => (
                                  <DropdownLink key={link.href} {...link} />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Bottom CTA Bar */}
                          <div className="bg-muted/50 border-t border-border px-4 py-3 flex items-center justify-between">
                            <button
                              onClick={() => window.location.href = '/laundromat-listings'}
                              className="text-sm font-medium text-[#C8A661] hover:text-[#B8964F] transition-colors flex items-center gap-1.5"
                              data-testid="link-browse-all-listings"
                            >
                              Browse All Listings
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <Button
                              size="sm"
                              onClick={() => window.location.href = '/list-on-washbizhub'}
                              className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-8"
                              data-testid="button-list-your-business"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              List Your Business
                            </Button>
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

                    {/* Funding - Guided by Purpose */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-[#C8A661] hover:text-[#C8A661] hover:bg-[#C8A661]/10 data-[state=open]:bg-[#C8A661]/10 data-[state=open]:text-[#C8A661]"
                        data-testid="dropdown-funding"
                      >
                        Funding
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[560px] bg-popover rounded-xl shadow-xl border border-[#C8A661]/30 overflow-hidden"
                        >
                          {/* 2-Column Layout */}
                          <div className="grid grid-cols-2 gap-0">
                            {/* Left Column - What are you funding? */}
                            <div className="p-4 border-r border-[#C8A661]/20">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#C8A661]/20">
                                <div className="h-6 w-6 rounded bg-[#C8A661]/20 flex items-center justify-center">
                                  <DollarSign className="h-3 w-3 text-[#C8A661]" />
                                </div>
                                <span className="text-xs font-semibold text-[#C8A661] uppercase tracking-wider">
                                  What are you funding?
                                </span>
                              </div>
                              <div className="space-y-1">
                                {FUNDING_BY_PURPOSE.map((link) => (
                                  <DropdownLink key={link.href} {...link} />
                                ))}
                              </div>
                            </div>
                            
                            {/* Right Column - Startup & Working Capital */}
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                                <div className="h-6 w-6 rounded bg-[#0A1628] flex items-center justify-center">
                                  <PiggyBank className="h-3 w-3 text-[#C8A661]" />
                                </div>
                                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                  Startup & Working Capital
                                </span>
                              </div>
                              <div className="space-y-1">
                                {FUNDING_PARTNERS.map((link) => (
                                  <DropdownLink key={link.href} {...link} />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Bottom CTA Bar */}
                          <div className="bg-[#C8A661]/10 border-t border-[#C8A661]/20 px-4 py-3 flex items-center justify-between">
                            <button
                              onClick={() => window.location.href = '/funding'}
                              className="text-sm font-medium text-[#C8A661] hover:text-[#B8964F] transition-colors flex items-center gap-1.5"
                              data-testid="link-compare-all-lenders"
                            >
                              Compare All Lenders
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <Button
                              size="sm"
                              onClick={() => window.location.href = '/consultation'}
                              className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold h-8"
                              data-testid="button-funding-consultation"
                            >
                              <Handshake className="w-3.5 h-3.5 mr-1.5" />
                              Get Expert Help
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
