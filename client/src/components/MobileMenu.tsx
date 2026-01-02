import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, LogIn, LogOut, User, ChevronLeft, ChevronRight, X, 
  Settings as SettingsIcon, Search, Calculator, 
  LayoutDashboard, Palette, Bot, DollarSign, ShoppingBag,
  CreditCard, Bell, Bookmark, MessageSquare,
  TrendingUp, BarChart3, Calendar, MapPin, Building2,
  Users, Package, BookOpen, Briefcase,
  PiggyBank, LineChart, Home, LayoutGrid,
  Landmark, GraduationCap, Zap, Monitor, Tag, Sparkles, Globe
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSignOut } from "@/components/SignOutConfirmation";
import { useAuthModal } from "@/components/AuthModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  featured?: boolean;
}

interface MenuSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

const mobileSections: MenuSection[] = [
  {
    id: "buy",
    title: "Buy",
    icon: ShoppingBag,
    items: [
      { href: "/laundromat-listings", label: "Laundromats for Sale", icon: Building2, featured: true },
      { href: "/cleanbi-explorer", label: "CLEANBI Explorer", icon: MapPin, featured: true },
      { href: "/brokers", label: "Find a Broker", icon: Users },
      { href: "/calculators", label: "Calculator Suite", icon: Calculator, featured: true },
      { href: "/valuation-calculator", label: "Valuation", icon: DollarSign },
      { href: "/roi-calculator", label: "ROI Calculator", icon: TrendingUp },
      { href: "/funding", label: "Funding Marketplace", icon: Landmark, featured: true },
      { href: "/funding?tab=startup", label: "Startup Funding", icon: PiggyBank },
      { href: "/funding?tab=acquisitions", label: "SBA Loans", icon: Briefcase },
    ]
  },
  {
    id: "operate",
    title: "Operate",
    icon: Monitor,
    items: [
      { href: "/pos-command-center", label: "POS System", icon: Monitor, featured: true },
      { href: "/operator-dashboard", label: "Operator Dashboard", icon: LayoutDashboard, featured: true },
      { href: "/machine-booking", label: "Machine Booking", icon: Calendar },
      { href: "/service-guy-ai", label: "Service Guy AI", icon: Bot, featured: true },
      { href: "/design-studio-pro", label: "Design Studio", icon: Palette },
      { href: "/seo-command-center", label: "SEO Dashboard", icon: TrendingUp, featured: true },
      { href: "/utility-calculator", label: "Utility Calculator", icon: Zap },
    ]
  },
  {
    id: "sell",
    title: "Sell",
    icon: Tag,
    items: [
      { href: "/list-on-washbizhub", label: "List Your Business", icon: Sparkles, featured: true },
      { href: "/valuation-calculator", label: "Get Valuation", icon: DollarSign, featured: true },
      { href: "/brokers", label: "Connect with Brokers", icon: Users },
      { href: "/equipment", label: "Equipment Hub", icon: Package, featured: true },
      { href: "/equipment-for-sale", label: "Equipment for Sale", icon: Package },
      { href: "/directory", label: "Vendor Directory", icon: LayoutGrid },
    ]
  },
  {
    id: "learn",
    title: "Learn",
    icon: GraduationCap,
    items: [
      { href: "/courses", label: "Courses & Training", icon: GraduationCap, featured: true },
      { href: "/laundromat-bible", label: "Laundromat Bible", icon: BookOpen, featured: true },
      { href: "/blog", label: "Blog", icon: BookOpen },
      { href: "/template-vault", label: "Template Vault", icon: Bookmark },
      { href: "/laundromat-expert", label: "Laundromat Expert AI", icon: Sparkles, featured: true },
      { href: "/consultation", label: "Consultations", icon: Users },
      { href: "/forum", label: "Community Forum", icon: Users, featured: true },
      { href: "/network", label: "Member Network", icon: Users },
    ]
  },
];

const accountMenuItems: MenuItem[] = [
  { href: "/dashboard", label: "My Dashboard", icon: Home, featured: true },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/account-subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard?tab=favorites", label: "Favorites", icon: Bookmark },
  { href: "/dashboard?tab=calculators", label: "Saved Calculators", icon: Calculator },
];

function MobileMenuContent({ onClose }: { onClose: () => void }) {
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
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
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
      className="absolute inset-0 flex flex-col bg-background"
    >
      {/* Top Utility Strip */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => { handleLinkClick(); navigate('/search'); }}
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
                onClick={() => { handleLinkClick(); navigate('/messages'); }}
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
        {/* 4 Sections: Buy, Operate, Sell, Learn */}
        {mobileSections.map((section) => (
          <button
            key={section.id}
            onClick={() => goToPanel(section.id)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            data-testid={`button-mobile-section-${section.id}`}
          >
            <span className="flex items-center gap-3">
              <section.icon className="h-5 w-5 text-[#C8A661]" />
              {section.title}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}

        {/* Divider */}
        <div className="my-2 mx-4 border-t border-border" />

        {/* Quick Links */}
        <Link href="/cleanbi-explorer" onClick={handleLinkClick}>
          <span className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#C8A661] hover:bg-[#C8A661]/10 transition-colors cursor-pointer" data-testid="link-mobile-cleanbi-quick">
            <MapPin className="h-4 w-4" />
            CLEANBI Explorer
            <Badge variant="secondary" className="ml-auto text-[9px] py-0 px-1.5 h-4 bg-[#C8A661]/20 text-[#C8A661]">AI</Badge>
          </span>
        </Link>
        <Link href="/pricing" onClick={handleLinkClick}>
          <span className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer" data-testid="link-mobile-pricing-quick">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Pricing & Plans
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
                  <Button className="w-full h-10 bg-[#C8A661] hover:bg-[#b8963d] text-white font-semibold" data-testid="link-mobile-pricing-bottom">
                    {user?.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-9 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={signOut}
                  disabled={isSigningOut}
                  data-testid="button-mobile-signout-bottom"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-10" 
                  onClick={() => { onClose(); openAuthModal(); }}
                  data-testid="link-mobile-login-bottom"
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Sign In
                </Button>
                <Link href="/pricing" onClick={handleLinkClick} className="flex-1">
                  <Button className="w-full h-10 bg-[#C8A661] hover:bg-[#b8963d] text-white font-semibold" data-testid="link-mobile-getstarted-bottom">
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
      className="absolute inset-0 flex flex-col bg-background"
    >
      <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-muted/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack} data-testid={`button-back-${section.id}`}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <section.icon className="h-4 w-4 text-[#C8A661]" />
          <span className="text-sm font-semibold text-foreground">{section.title}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {section.items.map((item) => (
          <Link key={item.href} href={item.href} onClick={handleLinkClick}>
            <span 
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                item.featured 
                  ? 'text-[#C8A661] font-semibold hover:bg-[#C8A661]/10' 
                  : 'text-foreground hover:bg-muted/50'
              } ${location === item.href ? 'bg-muted' : ''}`}
              data-testid={`link-mobile-${item.href.replace(/^\//, '').replace(/\?.*/, '')}`}
            >
              <item.icon className={`h-4 w-4 ${item.featured ? 'text-[#C8A661]' : 'text-muted-foreground'}`} />
              {item.label}
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
      className="absolute inset-0 flex flex-col bg-background"
    >
      <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-muted/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack} data-testid="button-back-account">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground">Account</span>
      </div>

      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3" data-testid="mobile-account-user-info">
          <Avatar className="h-10 w-10 ring-2 ring-[#C8A661]/30">
            <AvatarImage src={user?.profileImage || undefined} alt={displayName} />
            <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-sm font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            {user?.subscriptionTier && user.subscriptionTier !== 'free' && (
              <Badge className="mt-1 text-[9px] py-0 px-1.5 h-4 bg-[#C8A661] text-white">
                {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Member
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {accountMenuItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={handleLinkClick}>
            <span 
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                item.featured 
                  ? 'text-[#C8A661] font-semibold hover:bg-[#C8A661]/10' 
                  : 'text-foreground hover:bg-muted/50'
              }`}
              data-testid={`link-mobile-account-${item.href.replace(/^\//, '').replace(/\?.*/, '')}`}
            >
              <item.icon className={`h-4 w-4 ${item.featured ? 'text-[#C8A661]' : 'text-muted-foreground'}`} />
              {item.label}
            </span>
          </Link>
        ))}
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
      className="absolute inset-0 flex flex-col bg-background"
    >
      <div className="flex items-center gap-2 px-2 py-2 border-b border-border bg-muted/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack} data-testid="button-back-notifications">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground">Notifications</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-muted-foreground text-sm py-8">
          No new notifications
        </div>
      </div>
    </motion.div>
  );

  const currentSection = mobileSections.find(s => s.id === currentPanel);

  return (
    <div className="relative h-full overflow-hidden bg-background">
      <AnimatePresence mode="popLayout" custom={panelStack.length}>
        {currentPanel === 'main' && renderMainPanel()}
        {currentPanel === 'account' && renderAccountPanel()}
        {currentPanel === 'notifications' && renderNotificationsPanel()}
        {currentSection && renderSubPanel(currentSection)}
      </AnimatePresence>
    </div>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-9 w-9"
          data-testid="button-mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-[300px] p-0 flex flex-col [&>button]:hidden bg-slate-950 z-50"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Mobile navigation for WashBizHub</SheetDescription>
        </SheetHeader>
        
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-[#0A1628]">
          <Link href="/" onClick={() => setOpen(false)}>
            <span className="flex items-center gap-2 cursor-pointer" data-testid="link-mobile-logo">
              <img src={logoUrl} alt="WashBizHub" className="h-7 w-auto" />
              <span className="text-white font-bold text-sm">WashBizHub</span>
            </span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setOpen(false)}
            data-testid="button-mobile-close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          <MobileMenuContent onClose={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
