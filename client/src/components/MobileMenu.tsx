import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, LogIn, LogOut, User, ChevronLeft, ChevronRight, X, 
  Settings as SettingsIcon, Search, Wrench, Store, Calculator, 
  LayoutDashboard, Palette, Bot, DollarSign, ShoppingBag, Star, 
  CreditCard, Bell, Heart, Bookmark, FileText, MessageSquare,
  TrendingUp, BarChart3, Calendar, Cpu, MapPin, Building2,
  Users, Package, Truck, BookOpen, HelpCircle, Phone, Briefcase,
  PiggyBank, ClipboardList, Smartphone, LineChart, Home, LayoutGrid, Info,
  Landmark, Award, GraduationCap, Zap, Factory, Shield, UserPlus,
  FolderOpen, AlertTriangle, Library
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSignOut } from "@/components/SignOutConfirmation";
import { useAuthModal } from "@/components/AuthModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/6_1764040628012.png";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  featured?: boolean;
  description?: string;
}

interface MenuSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

const mobilePillars: MenuSection[] = [
  {
    id: "platform",
    title: "Platform",
    icon: Zap,
    items: [
      // Launch Online
      { href: "/website-builder", label: "Website Builder", icon: Store, featured: true, description: "Build your site" },
      { href: "/seo-command-center", label: "SEO Dashboard", icon: TrendingUp, description: "Search optimization" },
      // Run In-Store
      { href: "/pos-command-center", label: "POS System", icon: Smartphone, featured: true, description: "Point of sale" },
      { href: "/operator-dashboard", label: "Operator Dashboard", icon: LayoutDashboard, description: "KPIs & operations" },
      { href: "/machine-booking", label: "Machine Booking", icon: Calendar, description: "Reservations" },
      { href: "/design-studio-pro", label: "Design Studio", icon: Palette, description: "2D/3D planning" },
      { href: "/service-guy-ai", label: "Service Guy AI", icon: Bot, featured: true, description: "Expert diagnostics" },
      // Grow Traffic
      { href: "/seo-command-center?tab=rankings", label: "Rank Tracking", icon: LineChart, description: "Position monitoring" },
      { href: "/seo-command-center?tab=citations", label: "Local Citations", icon: MapPin, description: "Local presence" },
    ]
  },
  {
    id: "calculators",
    title: "Calculators",
    icon: Calculator,
    items: [
      { href: "/calculators", label: "Calculator Suite", icon: Calculator, featured: true, description: "All calculators" },
      { href: "/valuation-calculator", label: "Valuation", icon: DollarSign, description: "4 methods" },
      { href: "/roi-calculator", label: "ROI", icon: TrendingUp, description: "5-year projections" },
      { href: "/loan-calculator", label: "Loan", icon: BarChart3, description: "Amortization" },
      { href: "/utility-calculator", label: "Utility", icon: Zap, description: "UPG benchmarking" },
      { href: "/labor-calculator", label: "Labor", icon: Users, description: "Staffing" },
      { href: "/tpd-calculator", label: "TPD", icon: LineChart, description: "Turns per day" },
    ]
  },
  {
    id: "marketplace",
    title: "Marketplace",
    icon: ShoppingBag,
    items: [
      { href: "/laundromat-listings", label: "Laundromats for Sale", icon: Building2, featured: true, description: "Browse listings" },
      { href: "/brokers", label: "Find a Broker", icon: Users, description: "Verified brokers" },
      { href: "/list-on-washbizhub", label: "List on WashBizHub", icon: Star, description: "Sell your business" },
      { href: "/equipment", label: "Equipment Hub", icon: Package, featured: true, description: "Dexter & CG" },
      { href: "/equipment-for-sale", label: "Equipment for Sale", icon: Wrench, description: "Used & new" },
      { href: "/directory", label: "Vendor Directory", icon: ClipboardList, description: "Service providers" },
    ]
  },
  {
    id: "templates",
    title: "Templates",
    icon: FolderOpen,
    items: [
      { href: "/template-vault", label: "Template Vault", icon: FolderOpen, featured: true, description: "All templates" },
      { href: "/vault/business-plan", label: "AI Business Plan", icon: FileText, featured: true, description: "Generate with AI" },
      { href: "/vault/lease-checklist", label: "Lease Red Flags", icon: AlertTriangle, description: "50+ trap alerts" },
      { href: "/vault/due-diligence", label: "Due Diligence", icon: ClipboardList, description: "100-point checklist" },
      { href: "/my-library", label: "My Library", icon: Library, description: "Your assets" },
    ]
  },
  {
    id: "resources",
    title: "Resources",
    icon: BookOpen,
    items: [
      { href: "/forum", label: "Community Forum", icon: Users, featured: true, description: "73K+ owners" },
      { href: "/consultation", label: "Consultations", icon: Phone, featured: true, description: "Expert advice" },
      { href: "/blog", label: "Blog", icon: Star, description: "News & insights" },
      { href: "/events", label: "Events", icon: Calendar, description: "Trade shows" },
      { href: "/courses", label: "Courses", icon: GraduationCap, description: "Training" },
      { href: "/help-center", label: "Help Center", icon: HelpCircle, description: "FAQs & support" },
      { href: "/larry-larsen", label: "Larry Larsen Expert", icon: Award, description: "50+ years" },
      { href: "/insurance-partners", label: "Insurance", icon: Shield, description: "Coverage options" },
      { href: "/about-us", label: "About Us", icon: Info, description: "Our mission" },
    ]
  },
  {
    id: "funding",
    title: "Funding",
    icon: Landmark,
    items: [
      { href: "/funding?tab=startup", label: "Startup Funding", icon: PiggyBank, featured: true, description: "First laundromat" },
      { href: "/funding?tab=acquisitions", label: "Buy a Laundromat", icon: Briefcase, description: "SBA loans" },
      { href: "/funding?tab=equipment", label: "Equipment Financing", icon: Factory, description: "Washers & dryers" },
      { href: "/funding?tab=realestate", label: "Commercial Real Estate", icon: Building2, description: "Property financing" },
      { href: "/funding?tab=fastcash", label: "Fast Cash", icon: Zap, description: "Same-day funding" },
      { href: "/funding/national-business-capital", label: "National Business Capital", icon: Landmark, description: "SBA $100K-$10M" },
      { href: "/funding/preferred-funding-group", label: "Preferred Funding", icon: CreditCard, description: "Up to $500K" },
    ]
  },
];

const accountMenuItems: MenuItem[] = [
  { href: "/dashboard", label: "My Dashboard", icon: Home, featured: true },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/account-subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard?tab=favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard?tab=searches", label: "Saved Searches", icon: Search },
  { href: "/dashboard?tab=calculators", label: "Saved Calculators", icon: Calculator },
  { href: "/dashboard?tab=templates", label: "Templates", icon: FileText },
];

function MobileMenuContent({ 
  onClose,
  mobileMenuOpen 
}: { 
  onClose: () => void;
  mobileMenuOpen: boolean;
}) {
  const [location, navigate] = useLocation();
  const [panelStack, setPanelStack] = useState<string[]>(['main']);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { signOut, isSigningOut } = useSignOut();
  const { openAuthModal } = useAuthModal();
  
  const { data: notifications } = useQuery<{ unreadCount: number }>({
    queryKey: ['/api/user-dashboard/notifications'],
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const currentPanel = panelStack[panelStack.length - 1];
  
  const goToPanel = (panelId: string) => {
    setPanelStack(prev => [...prev, panelId]);
  };
  
  const goBack = () => {
    setPanelStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const handleLinkClick = () => {
    setPanelStack(['main']);
    onClose();
  };

  const userInitials = user?.firstName 
    ? user.firstName.charAt(0).toUpperCase() 
    : user?.email?.charAt(0).toUpperCase() || 'U';
  
  const displayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.email?.split('@')[0] || 'User';
  
  const unreadCount = notifications?.unreadCount || 0;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const renderMainPanel = () => (
    <motion.div
      key="main"
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", duration: 0.2 }}
      className="absolute inset-0 flex flex-col"
    >
      {/* Top Utility Strip */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              handleLinkClick();
              navigate('/search');
            }}
            data-testid="button-mobile-search"
          >
            <Search className="h-4 w-4" />
          </Button>
          {isAuthenticated && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 relative"
                onClick={() => goToPanel('notifications')}
                data-testid="button-mobile-notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => {
                  handleLinkClick();
                  navigate('/messages');
                }}
                data-testid="button-mobile-messages"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {isAuthenticated && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1.5 px-2"
            onClick={() => goToPanel('account')}
            data-testid="button-mobile-account"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.profileImage || undefined} alt={displayName} />
              <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-[10px] font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-medium max-w-[60px] truncate">{displayName}</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Main Menu Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* 4 Pillars */}
        {mobilePillars.map((pillar) => (
          <button
            key={pillar.id}
            onClick={() => goToPanel(pillar.id)}
            className="flex items-center justify-between w-full px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors"
            data-testid={`button-mobile-pillar-${pillar.id}`}
          >
            <span className="flex items-center gap-2.5">
              <pillar.icon className="h-4 w-4 text-muted-foreground" />
              {pillar.title}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ))}

        {/* Divider */}
        <div className="my-2 mx-4 border-t border-border" />

        {/* Quick Links */}
        <Link href="/cleanbi-explorer" onClick={handleLinkClick}>
          <span className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-semibold text-[#C8A661] hover:bg-[#C8A661]/10 transition-colors cursor-pointer" data-testid="link-mobile-cleanbi-quick">
            <MapPin className="h-4 w-4" />
            CLEANBI Explorer
            <Badge variant="secondary" className="ml-auto text-[9px] py-0 px-1.5 h-4 bg-[#C8A661]/20 text-[#C8A661]">Featured</Badge>
          </span>
        </Link>
        <Link href="/marketplace" onClick={handleLinkClick}>
          <span className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer" data-testid="link-mobile-marketplace-quick">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            Marketplace
          </span>
        </Link>
        <Link href="/service-guy-ai" onClick={handleLinkClick}>
          <span className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer" data-testid="link-mobile-serviceguy-quick">
            <Bot className="h-4 w-4 text-muted-foreground" />
            Service Guy AI
          </span>
        </Link>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border space-y-2 bg-background">
        {!isLoading && (
          <>
            {isAuthenticated ? (
              <>
                <Link href="/pricing" onClick={handleLinkClick}>
                  <Button 
                    className="w-full h-9 bg-[#C8A661] hover:bg-[#b8963d] text-white text-[13px] font-semibold"
                    data-testid="link-mobile-pricing-bottom"
                  >
                    {user?.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-8 text-[12px] text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={signOut}
                  disabled={isSigningOut}
                  data-testid="button-mobile-signout-bottom"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-9 text-[13px]" 
                  onClick={() => {
                    onClose();
                    openAuthModal();
                  }}
                  data-testid="link-mobile-login-bottom"
                >
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                  Sign In
                </Button>
                <Link href="/pricing" onClick={handleLinkClick} className="flex-1">
                  <Button className="w-full h-9 bg-[#C8A661] hover:bg-[#b8963d] text-white text-[13px]" data-testid="link-mobile-getstarted-bottom">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );

  const renderSubPanel = (section: MenuSection) => (
    <motion.div
      key={section.id}
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", duration: 0.2 }}
      className="absolute inset-0 flex flex-col"
    >
      {/* Sub-panel Header */}
      <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-muted/30">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={goBack}
          data-testid={`button-back-${section.id}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <section.icon className="h-4 w-4 text-[#C8A661]" />
          <span className="text-[13px] font-semibold text-foreground">{section.title}</span>
        </div>
      </div>

      {/* Sub-panel Items */}
      <div className="flex-1 overflow-y-auto py-1">
        {section.items.map((item) => (
          <Link key={item.href} href={item.href} onClick={handleLinkClick}>
            <span 
              className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors cursor-pointer ${
                item.featured 
                  ? 'text-[#C8A661] font-semibold hover:bg-[#C8A661]/10' 
                  : 'text-foreground hover:bg-muted/50'
              } ${location === item.href ? 'bg-muted' : ''}`}
              data-testid={`link-mobile-${item.href.replace('/', '').replace(/\?.*/, '')}`}
            >
              <item.icon className={`h-4 w-4 ${item.featured ? 'text-[#C8A661]' : 'text-muted-foreground'}`} />
              <span className="flex-1">{item.label}</span>
              {item.description && (
                <span className="text-[10px] text-muted-foreground">{item.description}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );

  const renderAccountPanel = () => (
    <motion.div
      key="account"
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", duration: 0.2 }}
      className="absolute inset-0 flex flex-col"
    >
      {/* Account Header */}
      <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-muted/30">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={goBack}
          data-testid="button-back-account"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-[13px] font-semibold text-foreground">Account</span>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3" data-testid="mobile-account-user-info">
          <Avatar className="h-10 w-10 ring-2 ring-[#C8A661]/30">
            <AvatarImage src={user?.profileImage || undefined} alt={displayName} />
            <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-sm font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            {user?.subscriptionTier && user.subscriptionTier !== 'free' && (
              <Badge className="mt-1 text-[9px] py-0 px-1.5 h-4 bg-[#C8A661] text-white">
                {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Member
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Account Items */}
      <div className="flex-1 overflow-y-auto py-1">
        {accountMenuItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={handleLinkClick}>
            <span 
              className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors cursor-pointer ${
                item.featured 
                  ? 'text-[#C8A661] font-semibold hover:bg-[#C8A661]/10' 
                  : 'text-foreground hover:bg-muted/50'
              } ${location === item.href || location.startsWith(item.href.split('?')[0]) ? 'bg-muted' : ''}`}
              data-testid={`link-mobile-account-${item.href.replace('/', '').replace(/\?.*/, '')}`}
            >
              <item.icon className={`h-4 w-4 ${item.featured ? 'text-[#C8A661]' : 'text-muted-foreground'}`} />
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Account Actions */}
      <div className="p-3 border-t border-border space-y-2 bg-background">
        <Link href="/account-subscription" onClick={handleLinkClick}>
          <Button 
            className="w-full h-9 bg-[#C8A661] hover:bg-[#b8963d] text-white text-[13px] font-semibold"
            data-testid="link-mobile-subscription-action"
          >
            {user?.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-8 text-[12px] text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={signOut}
          disabled={isSigningOut}
          data-testid="button-mobile-signout-account"
        >
          <LogOut className="h-3 w-3 mr-1" />
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </motion.div>
  );

  const renderNotificationsPanel = () => (
    <motion.div
      key="notifications"
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", duration: 0.2 }}
      className="absolute inset-0 flex flex-col"
    >
      <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-muted/30">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={goBack}
          data-testid="button-back-notifications"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-[13px] font-semibold text-foreground">Notifications</span>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4">
            {unreadCount} new
          </Badge>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Bell className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-[13px]">View all notifications</p>
          <Link href="/dashboard" onClick={handleLinkClick}>
            <Button variant="link" size="sm" className="text-[12px] text-[#C8A661]" data-testid="link-mobile-view-notifications">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );

  const getCurrentSection = () => {
    return mobilePillars.find(p => p.id === currentPanel);
  };

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="popLayout" custom={panelStack.length}>
        {currentPanel === 'main' && renderMainPanel()}
        {currentPanel === 'account' && isAuthenticated && renderAccountPanel()}
        {currentPanel === 'notifications' && isAuthenticated && renderNotificationsPanel()}
        {getCurrentSection() && renderSubPanel(getCurrentSection()!)}
      </AnimatePresence>
    </div>
  );
}

export function MobileMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-foreground"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          data-testid="button-mobile-menu-trigger"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-[300px] bg-background border-l border-border p-0 flex flex-col"
        data-testid="mobile-drawer-panel"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
          <SheetHeader className="flex-1">
            <SheetTitle className="text-foreground text-[15px] font-bold flex items-center gap-2">
              <img src={logoUrl} alt="" className="h-7 w-auto" data-testid="img-mobile-menu-logo" />
              WashBizHub
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu
            </SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <button
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
              aria-label="Close menu"
              data-testid="button-mobile-close"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetClose>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MobileMenuContent 
            onClose={() => setMobileMenuOpen(false)} 
            mobileMenuOpen={mobileMenuOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileMenu;
