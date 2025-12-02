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
import { Menu, LogOut, Search, X, ChevronRight } from "lucide-react";
import logoUrl from "@assets/6_1764040628012.png";

const PLAN_LINKS = [
  { href: "/sba-readiness", label: "SBA Readiness Check" },
  { href: "/business-plan-generator", label: "Business Plan Generator" },
  { href: "/ai-consultation", label: "AI Consultation" },
  { href: "/larry-larsen", label: "Expert Consulting" },
  { href: "/calculators", label: "ROI Calculator" },
  { href: "/startup-funding", label: "Funding Options" },
  { href: "/blog", label: "Insights" },
];

const EVALUATE_LINKS = [
  { href: "/cleanbi-auto", label: "CLEANBI Score" },
  { href: "/laundromat-listings", label: "Listings" },
  { href: "/valuation-calculator", label: "Valuation" },
  { href: "/distributor-locator", label: "Distributors" },
  { href: "/laundromat-locator", label: "Locator" },
  { href: "/resources", label: "Due Diligence" },
];

const OPERATE_LINKS = [
  { href: "/equipment-marketplace", label: "Marketplace" },
  { href: "/equipment-wizard", label: "Equipment Wizard" },
  { href: "/equipment-guides", label: "Equipment Guides" },
  { href: "/service-guy-ai", label: "Service AI" },
  { href: "/equipment-diagnostics", label: "Diagnostics" },
  { href: "/design-studio-pro", label: "Design Studio" },
  { href: "/resources", label: "Resources" },
];

const PARTNER_LINKS = [
  { href: "/sell", label: "Sell Your Laundromat" },
  { href: "/listing-form", label: "Add Listing" },
  { href: "/list-equipment", label: "Sell Equipment" },
  { href: "/vendor-form", label: "Vendor Partnership" },
  { href: "/advertise", label: "Advertising" },
];

function DropdownLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        onClick={onClick}
        className="block px-4 py-2.5 text-sm text-foreground/80 rounded-md transition-colors hover:bg-muted hover:text-foreground"
        data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {label}
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
                        <div className="w-[200px] p-2">
                          {PLAN_LINKS.map((link) => (
                            <DropdownLink key={link.href} {...link} />
                          ))}
                        </div>
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
                        <div className="w-[200px] p-2">
                          {EVALUATE_LINKS.map((link) => (
                            <DropdownLink key={link.href} {...link} />
                          ))}
                        </div>
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
                        <div className="w-[200px] p-2">
                          {OPERATE_LINKS.map((link) => (
                            <DropdownLink key={link.href} {...link} />
                          ))}
                        </div>
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
                        <div className="w-[200px] p-2">
                          {PARTNER_LINKS.map((link) => (
                            <DropdownLink key={link.href} {...link} />
                          ))}
                        </div>
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
                        <Link href="/cleanbi-auto" onClick={closeMobileMenu} className="flex-1">
                          <Button variant="outline" className="w-full h-10 text-sm font-medium">
                            CLEANBI
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
