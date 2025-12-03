import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Menu, LogOut, Search, X, ChevronRight,
  FileText, Brain, Users, Calculator, Wallet, BookOpen,
  MapPin, Building2, DollarSign, Truck, Navigation, ClipboardCheck,
  ShoppingCart, Wand2, BookMarked, Bot, Wrench, Palette, FileStack,
  Store, PlusCircle, Package, Handshake, Megaphone
} from "lucide-react";
import logoUrl from "@assets/6_1764040628012.png";

const PLAN_LINKS = [
  { href: "/sba-readiness", label: "SBA Readiness Check", icon: ClipboardCheck, desc: "Check loan eligibility" },
  { href: "/business-plan-generator", label: "Business Plan Generator", icon: FileText, desc: "AI-powered plans" },
  { href: "/ai-consultation", label: "AI Consultation", icon: Brain, desc: "Strategic guidance" },
  { href: "/larry-larsen", label: "Expert Consulting", icon: Users, desc: "1-on-1 with pros" },
  { href: "/calculators", label: "ROI Calculator", icon: Calculator, desc: "Financial projections" },
  { href: "/startup-funding", label: "Funding Options", icon: Wallet, desc: "Explore financing" },
  { href: "/blog", label: "Insights", icon: BookOpen, desc: "Industry articles" },
];

const EVALUATE_LINKS = [
  { href: "/cleanbi-explorer", label: "CLEANBI Explorer", icon: MapPin, desc: "Full map intelligence", featured: true },
  { href: "/laundromat-listings", label: "Listings", icon: Building2, desc: "Browse for sale" },
  { href: "/valuation-calculator", label: "Valuation", icon: DollarSign, desc: "What's it worth?" },
  { href: "/distributor-locator", label: "Distributors", icon: Truck, desc: "Find equipment" },
  { href: "/laundromat-locator", label: "Locator", icon: Navigation, desc: "Find laundromats" },
  { href: "/resources", label: "Due Diligence", icon: ClipboardCheck, desc: "Verify deals" },
];

const OPERATE_LINKS = [
  { href: "/equipment-marketplace", label: "Marketplace", icon: ShoppingCart, desc: "Buy & sell equipment" },
  { href: "/equipment-wizard", label: "Equipment Wizard", icon: Wand2, desc: "Find the right fit" },
  { href: "/equipment-guides", label: "Equipment Guides", icon: BookMarked, desc: "Maintenance tips" },
  { href: "/service-guy-ai", label: "Service AI", icon: Bot, desc: "AI technician help" },
  { href: "/equipment-diagnostics", label: "Diagnostics", icon: Wrench, desc: "Troubleshoot issues" },
  { href: "/design-studio-pro", label: "Design Studio", icon: Palette, desc: "Layout planning" },
  { href: "/resources", label: "Resources", icon: FileStack, desc: "Operator toolkit" },
];

const PARTNER_LINKS = [
  { href: "/sell", label: "Sell Your Laundromat", icon: Store, desc: "List your business" },
  { href: "/listing-form", label: "Add Listing", icon: PlusCircle, desc: "Post for sale" },
  { href: "/list-equipment", label: "Sell Equipment", icon: Package, desc: "Equipment listings" },
  { href: "/vendor-form", label: "Vendor Partnership", icon: Handshake, desc: "Join our network" },
  { href: "/advertise", label: "Advertising", icon: Megaphone, desc: "Promote your brand" },
];

interface NavLinkItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  desc?: string;
  featured?: boolean;
}

function DropdownLink({ href, label, icon: Icon, desc, featured, onClick }: NavLinkItem & { onClick?: () => void }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        onClick={onClick}
        className={`group flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          featured 
            ? 'bg-gradient-to-r from-[#b8860b]/10 to-transparent border border-[#b8860b]/20 hover:border-[#b8860b]/40' 
            : 'hover:bg-[#1e3a5f]/5'
        }`}
        data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {Icon && (
          <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            featured 
              ? 'bg-[#b8860b]/20 text-[#b8860b] group-hover:bg-[#b8860b]/30' 
              : 'bg-[#1e3a5f]/10 text-[#1e3a5f] group-hover:bg-[#1e3a5f]/20'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={`block text-sm font-semibold ${featured ? 'text-[#b8860b]' : 'text-gray-900'} group-hover:text-[#1e3a5f]`}>
            {label}
          </span>
          {desc && (
            <span className="block text-xs text-gray-500 mt-0.5">{desc}</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-0.5" />
      </Link>
    </NavigationMenuLink>
  );
}

function MobileNavLink({ href, label, isActive, onClick, testId }: { 
  href: string; 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
  testId: string;
}) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors cursor-pointer ${
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-foreground/80 hover:bg-muted hover:text-foreground"
        }`}
        onClick={onClick}
        data-testid={testId}
      >
        <span>{label}</span>
        {isActive && <ChevronRight className="w-4 h-4" />}
      </div>
    </Link>
  );
}

export function NavigationMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openAccordions, setOpenAccordions] = useState<string[]>(["plan"]);
  
  const firstFocusableRef = useRef<HTMLInputElement>(null);

  const isActive = useMemo(() => (path: string) => location === path, [location]);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (mobileOpen && firstFocusableRef.current) {
      const timer = setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  useEffect(() => {
    closeMobileMenu();
  }, [location, closeMobileMenu]);

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
        <div className="bg-[#0f2744] text-white/70 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 flex items-center justify-between text-xs">
              <span className="hidden sm:inline">nick@washbizhub.com</span>
              <span className="sm:hidden text-[#b8860b]">WashBizHub</span>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                
                {isLoading ? (
                  <div className="w-12 h-4 bg-white/10 rounded animate-pulse" />
                ) : isAuthenticated && user ? (
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-1.5 hover:text-[#b8860b] transition-colors px-2 py-1"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                ) : (
                  <a 
                    href="/api/login"
                    className="hover:text-[#b8860b] transition-colors px-2 py-1"
                    data-testid="link-login"
                  >
                    Sign In
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main nav bar - Premium Navy */}
        <div className="bg-[#1e3a5f] border-b border-[#2a4a73]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between gap-4">
              <Link 
                href="/" 
                data-testid="link-logo" 
                className="shrink-0 flex items-center"
              >
                <img 
                  src={logoUrl} 
                  alt="WashBizHub" 
                  className="h-10 w-auto" 
                  loading="eager"
                  width={40}
                  height={40}
                />
              </Link>

              {/* Desktop navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                <NavMenu>
                  <NavigationMenuList className="gap-0">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-white/90 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10"
                        data-testid="dropdown-plan"
                      >
                        Plan
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[320px] p-3 bg-white rounded-xl shadow-xl border border-gray-100"
                        >
                          <div className="mb-3 pb-2 border-b border-gray-100">
                            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Plan Your Journey</span>
                          </div>
                          <div className="space-y-1">
                            {PLAN_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-white/90 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10"
                        data-testid="dropdown-evaluate"
                      >
                        Evaluate
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[320px] p-3 bg-white rounded-xl shadow-xl border border-gray-100"
                        >
                          <div className="mb-3 pb-2 border-b border-gray-100">
                            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Evaluate Opportunities</span>
                          </div>
                          <div className="space-y-1">
                            {EVALUATE_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-white/90 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10"
                        data-testid="dropdown-operate"
                      >
                        Operate
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[320px] p-3 bg-white rounded-xl shadow-xl border border-gray-100"
                        >
                          <div className="mb-3 pb-2 border-b border-gray-100">
                            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Operate & Grow</span>
                          </div>
                          <div className="space-y-1">
                            {OPERATE_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="h-10 px-4 text-sm font-medium bg-transparent text-white/90 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10"
                        data-testid="dropdown-partner"
                      >
                        Partner
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-[320px] p-3 bg-white rounded-xl shadow-xl border border-gray-100"
                        >
                          <div className="mb-3 pb-2 border-b border-gray-100">
                            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Partner With Us</span>
                          </div>
                          <div className="space-y-1">
                            {PARTNER_LINKS.map((link) => (
                              <DropdownLink key={link.href} {...link} />
                            ))}
                          </div>
                        </motion.div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavMenu>
              </nav>

              {/* Right side actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-10 w-10 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Search"
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4" />
                </Button>

                <Link href="/signup">
                  <Button 
                    size="sm"
                    className="hidden sm:flex h-10 px-5 font-semibold bg-[#b8860b] hover:bg-[#9a7209] text-white border-0"
                    data-testid="button-start-trial"
                  >
                    Get Started
                  </Button>
                </Link>

                {/* Mobile menu */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="lg:hidden h-10 w-10 text-white/80 hover:text-white hover:bg-white/10" 
                      data-testid="button-mobile-menu"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={mobileOpen ? "close" : "menu"}
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="flex items-center gap-3">
                        <img src={logoUrl} alt="" className="h-8 w-auto" />
                        <span className="font-semibold">WashBizHub</span>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="p-4 space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          ref={firstFocusableRef}
                          placeholder="Search..." 
                          className="pl-10 h-11"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-mobile-search"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Link href="/cleanbi-explorer" onClick={closeMobileMenu} className="flex-1">
                          <Button variant="outline" className="w-full h-10 text-sm font-medium">
                            CLEANBI Explorer
                          </Button>
                        </Link>
                        <Link href="/pricing" onClick={closeMobileMenu} className="flex-1">
                          <Button className="w-full h-10 text-sm font-medium">
                            Get Started
                          </Button>
                        </Link>
                      </div>

                      <Accordion 
                        type="multiple" 
                        className="w-full" 
                        value={openAccordions}
                        onValueChange={setOpenAccordions}
                      >
                        <AccordionItem value="plan" className="border-b border-border/50">
                          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                            Plan
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <div className="space-y-1">
                              {PLAN_LINKS.map((link) => (
                                <MobileNavLink
                                  key={link.href}
                                  href={link.href}
                                  label={link.label}
                                  isActive={isActive(link.href)}
                                  onClick={closeMobileMenu}
                                  testId={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="evaluate" className="border-b border-border/50">
                          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                            Evaluate
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <div className="space-y-1">
                              {EVALUATE_LINKS.map((link) => (
                                <MobileNavLink
                                  key={link.href}
                                  href={link.href}
                                  label={link.label}
                                  isActive={isActive(link.href)}
                                  onClick={closeMobileMenu}
                                  testId={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="operate" className="border-b border-border/50">
                          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                            Operate
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <div className="space-y-1">
                              {OPERATE_LINKS.map((link) => (
                                <MobileNavLink
                                  key={link.href}
                                  href={link.href}
                                  label={link.label}
                                  isActive={isActive(link.href)}
                                  onClick={closeMobileMenu}
                                  testId={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="partner" className="border-b-0">
                          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                            Partner
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <div className="space-y-1">
                              {PARTNER_LINKS.map((link) => (
                                <MobileNavLink
                                  key={link.href}
                                  href={link.href}
                                  label={link.label}
                                  isActive={isActive(link.href)}
                                  onClick={closeMobileMenu}
                                  testId={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="pt-4 border-t">
                        {isAuthenticated && user ? (
                          <Button
                            variant="ghost"
                            className="w-full h-10 justify-start text-sm"
                            onClick={() => {
                              logout();
                              closeMobileMenu();
                            }}
                            data-testid="button-mobile-logout"
                          >
                            Sign Out
                          </Button>
                        ) : (
                          <Link href="/api/login" onClick={closeMobileMenu}>
                            <Button variant="outline" className="w-full h-10 text-sm">
                              Sign In
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div 
                className="hidden md:block border-t bg-background"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tools, resources, listings..."
                      className="pl-11 h-12 text-base"
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
