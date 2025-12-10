import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, LogIn, LogOut, User, ChevronDown, ChevronRight, X, Settings as SettingsIcon, Zap, Search, Wrench, Store, Calculator, LayoutDashboard, Palette, Bot, DollarSign, ShoppingBag, Star, CreditCard, Globe, Package, Truck, BookOpen, Users, Bell, Heart, Bookmark, FileText, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearchTrigger } from "@/components/GlobalSearch";
import { UsageIndicator } from "@/components/UsageIndicator";
import { useSignOut } from "@/components/SignOutConfirmation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import logoUrl from "@assets/6_1764040628012.png";

const navLinks = [
  { href: "/cleanbi-explorer", label: "CLEANBI Explorer", featured: true, icon: Search },
  { href: "/marketplace", label: "Marketplace", featured: false, icon: ShoppingBag },
  { href: "/design-studio", label: "Design Studio", featured: false, icon: Palette },
  { href: "/service-guy-ai", label: "Service Guy AI", featured: false, icon: Bot },
  { href: "/pricing", label: "Pricing", featured: true, icon: DollarSign },
];

const calculatorItems = [
  { href: "/calculators", label: "All Calculators", description: "50+ professional tools", icon: Calculator },
  { href: "/valuation-calculator", label: "Valuation Calculator", description: "What's your laundromat worth?", icon: DollarSign },
  { href: "/roi-calculator", label: "ROI Calculator", description: "Investment returns", icon: Calculator },
  { href: "/tpd-calculator", label: "TPD Calculator", description: "Turns per day analysis", icon: Calculator },
  { href: "/utility-bill-auditor", label: "Utility Auditor", description: "Reduce operating costs", icon: Wrench },
];

const megaMenuSections = [
  {
    id: "discover",
    title: "Discover",
    icon: Search,
    items: [
      { href: "/cleanbi-explorer", label: "CLEANBI Explorer", featured: true, description: "AI-powered location analysis", icon: Search },
      { href: "/buy-laundromat", label: "Buy a Laundromat", description: "Browse listings for sale", icon: ShoppingBag },
      { href: "/brokers", label: "Find a Broker", featured: true, description: "Verified laundromat brokers", icon: Users },
      { href: "/directory", label: "Business Directory", description: "Find vendors & services", icon: Store },
    ]
  },
  {
    id: "equipment",
    title: "Equipment",
    icon: Wrench,
    items: [
      { href: "/equipment", label: "Equipment Hub", featured: true, description: "Dexter & Continental Girbau", icon: Wrench },
      { href: "/equipment-builder", label: "Get Equipment Quotes", description: "585+ distributors", icon: Store },
      { href: "/equipment-financing", label: "Equipment Financing", description: "Financing options", icon: DollarSign },
    ]
  },
  {
    id: "tools",
    title: "Tools",
    icon: Calculator,
    items: [
      { href: "/valuation-calculator", label: "Valuation Calculator", featured: true, description: "What's it worth?", icon: Calculator },
      { href: "/calculators", label: "All Calculators", description: "50+ professional tools", icon: Calculator },
      { href: "/design-studio", label: "Design Studio", description: "2D/3D floor plans", icon: Palette },
    ]
  },
  {
    id: "resources",
    title: "Learn",
    icon: Star,
    items: [
      { href: "/blog", label: "Blog", description: "Expert insights & news", icon: Star },
      { href: "/forum", label: "Community Forum", description: "Ask questions, share tips", icon: User },
      { href: "/book", label: "The Bible", description: "Complete guide", icon: Star },
    ]
  },
  {
    id: "connect",
    title: "Connect",
    icon: Bot,
    items: [
      { href: "/service-guy-ai", label: "Service Guy AI", featured: true, description: "AI equipment diagnostics", icon: Bot },
      { href: "/consultation", label: "Book a Consultation", description: "Expert advice", icon: User },
      { href: "/brokers", label: "Brokers", description: "Verified professionals", icon: Store },
    ]
  }
];

// Notification Bell Component for Social Network Features
function NotificationBell() {
  const { isAuthenticated } = useAuth();
  
  const { data: notifications } = useQuery<{
    unreadCount: number;
    items: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      createdAt: string;
      read: boolean;
    }>;
  }>({
    queryKey: ['/api/user-dashboard/notifications'],
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const unreadCount = notifications?.unreadCount || 0;
  const recentNotifications = notifications?.items?.slice(0, 5) || [];

  if (!isAuthenticated) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'favorite': return Heart;
      case 'message': return MessageSquare;
      case 'saved': return Bookmark;
      case 'report': return FileText;
      default: return Bell;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover-elevate"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[280px]">
          {recentNotifications.length > 0 ? (
            <div className="divide-y">
              {recentNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3 hover-elevate cursor-pointer ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t px-4 py-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full text-xs" data-testid="link-view-all-notifications">
              View All Activity
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Saved Items Quick Access
function SavedItemsDropdown() {
  const { isAuthenticated } = useAuth();
  
  const { data: savedItems } = useQuery<{
    savedSearches: number;
    savedCalculators: number;
    favoriteListings: number;
    savedTemplates: number;
  }>({
    queryKey: ['/api/user-dashboard/saved-counts'],
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  if (!isAuthenticated) return null;

  const totalSaved = (savedItems?.savedSearches || 0) + 
                     (savedItems?.savedCalculators || 0) + 
                     (savedItems?.favoriteListings || 0) +
                     (savedItems?.savedTemplates || 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover-elevate"
          data-testid="button-saved-items"
        >
          <Bookmark className="h-5 w-5" />
          {totalSaved > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#C8A661] text-[10px] font-bold text-white flex items-center justify-center">
              {totalSaved > 9 ? '9+' : totalSaved}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Your Saved Items
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link href="/dashboard?tab=searches">
          <DropdownMenuItem className="cursor-pointer" data-testid="link-saved-searches">
            <Search className="mr-2 h-4 w-4 text-blue-500" />
            <span className="flex-1">Saved Searches</span>
            <Badge variant="secondary" className="text-[10px]">
              {savedItems?.savedSearches || 0}
            </Badge>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/dashboard?tab=calculators">
          <DropdownMenuItem className="cursor-pointer" data-testid="link-saved-calculators">
            <Calculator className="mr-2 h-4 w-4 text-green-500" />
            <span className="flex-1">Saved Calculators</span>
            <Badge variant="secondary" className="text-[10px]">
              {savedItems?.savedCalculators || 0}
            </Badge>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/dashboard?tab=favorites">
          <DropdownMenuItem className="cursor-pointer" data-testid="link-favorite-listings">
            <Heart className="mr-2 h-4 w-4 text-red-500" />
            <span className="flex-1">Favorite Listings</span>
            <Badge variant="secondary" className="text-[10px]">
              {savedItems?.favoriteListings || 0}
            </Badge>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/dashboard?tab=templates">
          <DropdownMenuItem className="cursor-pointer" data-testid="link-saved-templates">
            <FileText className="mr-2 h-4 w-4 text-purple-500" />
            <span className="flex-1">Saved Templates</span>
            <Badge variant="secondary" className="text-[10px]">
              {savedItems?.savedTemplates || 0}
            </Badge>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        <Link href="/dashboard">
          <DropdownMenuItem className="cursor-pointer text-xs text-muted-foreground" data-testid="link-manage-saved">
            Manage all saved items
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserDropdown() {
  const { user } = useAuth();
  const { signOut, isSigningOut } = useSignOut();
  
  const userInitials = user?.firstName 
    ? user.firstName.charAt(0).toUpperCase() 
    : user?.email?.charAt(0).toUpperCase() || 'U';
  
  const displayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const membershipTier = user?.subscriptionTier || 'free';
  const tierBadge = membershipTier === 'free' ? null : membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 gap-2 px-2 rounded-full hover-elevate"
          data-testid="button-user-menu"
        >
          <Avatar className="h-8 w-8 ring-2 ring-[#C8A661]/30">
            <AvatarImage src={user?.profileImage || undefined} alt={displayName} />
            <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-sm font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
            {displayName}
          </span>
          {tierBadge && (
            <span className="hidden md:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C8A661] text-white">
              {tierBadge}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64" 
        align="end" 
        sideOffset={8}
        data-testid="dropdown-user-menu"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-[#C8A661]/30">
              <AvatarImage src={user?.profileImage || undefined} alt={displayName} />
              <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-semibold leading-none text-foreground" data-testid="text-user-name">
                {displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                {displayEmail}
              </p>
              {tierBadge && (
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C8A661] text-white w-fit mt-1">
                  {tierBadge} Member
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer" data-testid="link-dropdown-profile">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </DropdownMenuItem>
        </Link>
        
        <Link href="/dashboard">
          <DropdownMenuItem className="cursor-pointer" data-testid="link-dropdown-dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
        </Link>
        
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer" data-testid="link-dropdown-settings">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </Link>
        
        <Link href="/account-subscription">
          <DropdownMenuItem className="cursor-pointer" data-testid="link-dropdown-subscription">
            <CreditCard className="mr-2 h-4 w-4" />
            {user?.isPro ? 'Pro Subscription' : 'Upgrade to Pro'}
          </DropdownMenuItem>
        </Link>
        
        <div className="px-2 py-1.5">
          <UsageIndicator compact />
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={signOut}
          disabled={isSigningOut}
          data-testid="button-dropdown-signout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthLoadingSkeleton() {
  return (
    <div className="flex items-center gap-2" data-testid="skeleton-auth-loading">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="hidden sm:block h-8 w-20 rounded-md" />
    </div>
  );
}

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { signOut, isSigningOut } = useSignOut();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    if (megaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [megaMenuOpen]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -8,
      transition: { duration: 0.15, ease: "easeIn" }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:p-4 focus:bg-accent focus:text-accent-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-accent-foreground focus:ring-offset-2"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-border supports-[backdrop-filter]:bg-background/80' 
            : 'bg-background border-border/60'
        }`}
        data-testid="header-main"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" aria-label="WashBizHub Home">
              <div 
                className="flex items-center gap-2.5 cursor-pointer" 
                data-testid="link-logo"
              >
                <img 
                  src={logoUrl} 
                  alt="WashBizHub" 
                  className="h-12 w-auto" 
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width={48}
                  height={48}
                />
                <span className="hidden sm:block text-lg font-bold text-foreground tracking-tight">
                  WashBizHub
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  <span 
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      link.featured
                        ? 'text-[#C8A661] hover:text-[#d4a030] font-semibold'
                        : location === link.href || location.startsWith(link.href + '?')
                          ? 'text-foreground bg-muted' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    data-testid={`link-nav-${link.href.replace('/', '')}`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}

              <div className="relative group">
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 group-hover:text-foreground group-hover:bg-muted"
                  data-testid="button-calculators-dropdown"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Calculators
                  <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-popover border border-border rounded-lg shadow-lg py-2 min-w-[220px]">
                    {calculatorItems.map((item) => (
                      <Link href={item.href} key={item.href}>
                        <div 
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted cursor-pointer transition-colors"
                          data-testid={`link-calc-${item.href.replace('/', '')}`}
                        >
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {isAuthenticated && (
                <Link href="/dashboard">
                  <span 
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      location === '/dashboard' || location.startsWith('/dashboard/')
                        ? 'text-foreground bg-muted' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    data-testid="link-nav-dashboard"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </span>
                </Link>
              )}

              <div 
                className="relative"
                ref={megaMenuRef}
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    megaMenuOpen
                      ? 'text-foreground bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  aria-expanded={megaMenuOpen}
                  aria-haspopup="true"
                  aria-label="More options menu"
                  data-testid="button-mega-menu-trigger"
                >
                  More
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div 
                      className="absolute top-full right-0 pt-2 z-50"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      data-testid="mega-menu-panel"
                    >
                      <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[560px]">
                        <div className="p-4 grid grid-cols-2 gap-6">
                          {megaMenuSections.map((section) => (
                            <div key={section.id} data-testid={`mega-menu-section-${section.id}`}>
                              <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                <section.icon className="w-3.5 h-3.5" />
                                {section.title}
                              </h3>
                              <div className="space-y-1">
                                {section.items.map((item) => (
                                  <Link href={item.href} key={item.href}>
                                    <div 
                                      className={`flex items-start gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${
                                        item.featured 
                                          ? 'bg-[#C8A661]/10 hover:bg-[#C8A661]/20' 
                                          : 'hover:bg-muted'
                                      }`}
                                      onClick={() => setMegaMenuOpen(false)}
                                      data-testid={`link-mega-${item.href.replace('/', '')}`}
                                    >
                                      <item.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                        item.featured ? 'text-[#C8A661]' : 'text-muted-foreground'
                                      }`} />
                                      <div>
                                        <p className={`text-sm font-medium ${
                                          item.featured ? 'text-[#C8A661]' : 'text-foreground'
                                        }`}>
                                          {item.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {item.description}
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="px-4 py-3 bg-muted/30 border-t border-border/60 flex items-center justify-between">
                          <Link href="/pricing">
                            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                              View Pricing →
                            </span>
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            Press <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px] font-mono">/</kbd> to search
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="flex items-center gap-2">
              <GlobalSearchTrigger />
              
              <ThemeToggle />
              
              {isLoading ? (
                <AuthLoadingSkeleton />
              ) : (
                <>
                  {isAuthenticated ? (
                    <div className="hidden sm:flex items-center gap-1">
                      <SavedItemsDropdown />
                      <NotificationBell />
                      <UserDropdown />
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center gap-2">
                      <Link href="/login">
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="text-sm"
                          data-testid="button-signin"
                        >
                          <LogIn className="h-4 w-4 mr-1.5" />
                          Sign In
                        </Button>
                      </Link>
                      
                      <Link href="/signup">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-sm border-[#C8A661] text-[#C8A661] hover:bg-[#C8A661]/10"
                          data-testid="button-signup"
                        >
                          Sign Up
                        </Button>
                      </Link>
                      
                      <Link href="/pricing">
                        <Button 
                          className="bg-[#C8A661] hover:bg-[#b8963d] text-white font-medium text-sm"
                          size="sm"
                          data-testid="button-get-started"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
              
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
                  <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                    <SheetHeader className="flex-1">
                      <SheetTitle className="text-foreground text-lg font-bold flex items-center gap-2">
                        <img src={logoUrl} alt="" className="h-8 w-auto" />
                        Menu
                      </SheetTitle>
                      <SheetDescription className="sr-only">
                        Navigation menu
                      </SheetDescription>
                    </SheetHeader>
                    <SheetClose asChild>
                      <button
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close menu"
                        data-testid="button-mobile-close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </SheetClose>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0 py-4">
                    {isAuthenticated && (
                      <div className="px-4 mb-4">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted/50 mb-3" data-testid="mobile-user-info">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.profileImage || undefined} alt={user?.firstName || 'User'} />
                            <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-sm font-medium">
                              {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate" data-testid="text-mobile-user-name">
                              {user?.firstName || user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate" data-testid="text-mobile-user-email">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        
                        <SheetClose asChild>
                          <Link href="/dashboard">
                            <span 
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                                location === '/dashboard'
                                  ? 'text-foreground bg-muted'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                              }`}
                              data-testid="link-mobile-dashboard"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </span>
                          </Link>
                        </SheetClose>
                      </div>
                    )}

                    <div className="px-4 mb-6">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Main
                      </p>
                      <div className="space-y-1">
                        {navLinks.map((link) => (
                          <SheetClose asChild key={link.href}>
                            <Link href={link.href}>
                              <span 
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                                  link.featured
                                    ? 'text-[#C8A661] bg-[#C8A661]/10'
                                    : location === link.href
                                      ? 'text-foreground bg-muted'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                                data-testid={`link-mobile-${link.href.replace('/', '')}`}
                              >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                              </span>
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    </div>

                    <Collapsible
                      open={expandedSections.includes('calculators')}
                      onOpenChange={() => toggleSection('calculators')}
                      className="px-4 mb-2"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors">
                        <span className="flex items-center gap-3">
                          <Calculator className="w-4 h-4" />
                          Calculators
                        </span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${
                          expandedSections.includes('calculators') ? 'rotate-90' : ''
                        }`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1 ml-3 space-y-1">
                        {calculatorItems.map((item) => (
                          <SheetClose asChild key={item.href}>
                            <Link href={item.href}>
                              <span 
                                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                data-testid={`link-mobile-calc-${item.href.replace('/', '')}`}
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </span>
                            </Link>
                          </SheetClose>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {megaMenuSections.map((section) => (
                      <Collapsible
                        key={section.id}
                        open={expandedSections.includes(section.id)}
                        onOpenChange={() => toggleSection(section.id)}
                        className="px-4 mb-2"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors">
                          <span className="flex items-center gap-3">
                            <section.icon className="w-4 h-4" />
                            {section.title}
                          </span>
                          <ChevronRight className={`h-4 w-4 transition-transform ${
                            expandedSections.includes(section.id) ? 'rotate-90' : ''
                          }`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-1 ml-3 space-y-1">
                          {section.items.map((item) => (
                            <SheetClose asChild key={item.href}>
                              <Link href={item.href}>
                                <span 
                                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                                    item.featured
                                      ? 'text-[#C8A661]'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                  }`}
                                  data-testid={`link-mobile-mega-${item.href.replace('/', '')}`}
                                >
                                  <item.icon className={`w-4 h-4 ${item.featured ? 'text-[#C8A661]' : ''}`} />
                                  {item.label}
                                </span>
                              </Link>
                            </SheetClose>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>

                  <div className="p-4 border-t border-border space-y-3 flex-shrink-0 bg-background">
                    <SheetClose asChild>
                      <Link href="/pricing">
                        <Button 
                          className="w-full bg-[#C8A661] hover:bg-[#b8963d] text-white font-semibold"
                          data-testid="link-pricing-mobile"
                        >
                          View Pricing
                        </Button>
                      </Link>
                    </SheetClose>
                    
                    {!isLoading && (
                      <>
                        {isAuthenticated ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <SheetClose asChild>
                                <Link href="/settings" className="flex-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs"
                                    data-testid="link-mobile-settings"
                                  >
                                    <SettingsIcon className="h-3.5 w-3.5 mr-1.5" />
                                    Settings
                                  </Button>
                                </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                <Link href="/account-subscription" className="flex-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs"
                                    data-testid="link-mobile-subscription"
                                  >
                                    <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                                    {user?.isPro ? 'Pro' : 'Upgrade'}
                                  </Button>
                                </Link>
                              </SheetClose>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                              onClick={signOut}
                              disabled={isSigningOut}
                              data-testid="button-mobile-signout"
                            >
                              <LogOut className="h-3.5 w-3.5 mr-1.5" />
                              {isSigningOut ? 'Signing out...' : 'Sign Out'}
                            </Button>
                          </div>
                        ) : (
                          <SheetClose asChild>
                            <Link href="/login">
                              <Button 
                                className="w-full"
                                data-testid="link-mobile-signin"
                              >
                                <LogIn className="h-4 w-4 mr-1.5" />
                                Sign in
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                        
                        {(!user?.isPro && !isAuthenticated) && (
                          <SheetClose asChild>
                            <Link href="/pricing">
                              <Button 
                                className="w-full bg-[#C8A661] hover:bg-[#b8963d] text-white"
                                data-testid="link-mobile-getstarted"
                              >
                                Get Started Free
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
