import { 
  Search, 
  Wrench, 
  Store, 
  Calculator, 
  LayoutDashboard, 
  Palette, 
  Bot, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  Users,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Network,
  Phone,
  FileText,
  Building2,
  Zap,
  TrendingUp,
  Gauge,
  Receipt,
  type LucideIcon
} from "lucide-react";

// Use the same tier types as useSubscription.ts for consistency
export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tier?: SubscriptionTier;
  featured?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const cleanbiNavItem: NavItem = {
  href: "/cleanbi-explorer",
  label: "CLEANBI",
  description: "AI location intelligence",
  icon: Search,
  featured: true,
};

export const solutionsSection: NavSection = {
  id: "solutions",
  title: "Solutions",
  icon: Zap,
  items: [
    {
      href: "/pos-command-center",
      label: "POS Command Center",
      description: "Operations dashboard",
      icon: LayoutDashboard,
      tier: "pro",
      featured: true,
    },
    {
      href: "/website-builder",
      label: "Website Builder",
      description: "Build your laundromat site",
      icon: Building2,
      tier: "pro",
    },
    {
      href: "/service-guy-ai",
      label: "Service Guy AI",
      description: "Equipment diagnostics",
      icon: Bot,
      tier: "pro",
      featured: true,
    },
    {
      href: "/dashboard",
      label: "My Dashboard",
      description: "Your command center",
      icon: LayoutDashboard,
    },
    {
      href: "/design-studio",
      label: "Design Studio",
      description: "2D/3D floor plans",
      icon: Palette,
    },
  ],
};

export const marketplaceSection: NavSection = {
  id: "marketplace",
  title: "Marketplace",
  icon: ShoppingBag,
  items: [
    {
      href: "/buy-laundromat",
      label: "Buy a Laundromat",
      description: "Browse listings",
      icon: ShoppingBag,
      featured: true,
    },
    {
      href: "/equipment-marketplace",
      label: "Equipment Hub",
      description: "Buy/sell equipment",
      icon: Wrench,
    },
    {
      href: "/sell-your-laundromat",
      label: "Sell Your Laundromat",
      description: "List your business",
      icon: Store,
    },
    {
      href: "/brokers",
      label: "Broker Directory",
      description: "Find verified brokers",
      icon: Users,
    },
    {
      href: "/directory",
      label: "Business Directory",
      description: "Vendors & services",
      icon: Building2,
    },
  ],
};

export const toolsSection: NavSection = {
  id: "tools",
  title: "Tools",
  icon: Calculator,
  items: [
    {
      href: "/calculators",
      label: "Calculator Suite",
      description: "80+ professional tools",
      icon: Calculator,
      featured: true,
    },
    {
      href: "/valuation-calculator",
      label: "Valuation Calculator",
      description: "What's it worth?",
      icon: DollarSign,
    },
    {
      href: "/roi-calculator",
      label: "ROI Calculator",
      description: "Investment returns",
      icon: TrendingUp,
    },
    {
      href: "/utility-bill-auditor",
      label: "Utility Auditor",
      description: "Reduce costs",
      icon: Receipt,
    },
    {
      href: "/tpd-calculator",
      label: "TPD Calculator",
      description: "Turns per day",
      icon: Gauge,
    },
  ],
};

export const communitySection: NavSection = {
  id: "community",
  title: "Community",
  icon: Users,
  items: [
    {
      href: "/forum",
      label: "Community Forum",
      description: "Ask questions",
      icon: MessageSquare,
      featured: true,
    },
    {
      href: "/courses",
      label: "Courses",
      description: "Learn the business",
      icon: GraduationCap,
      tier: "pro",
    },
    {
      href: "/network",
      label: "Member Network",
      description: "Connect with owners",
      icon: Network,
    },
    {
      href: "/consultation",
      label: "Book Consultation",
      description: "Expert advice",
      icon: Phone,
    },
  ],
};

export const resourcesSection: NavSection = {
  id: "resources",
  title: "Resources",
  icon: BookOpen,
  items: [
    {
      href: "/book",
      label: "Laundromat Bible",
      description: "Complete guide",
      icon: BookOpen,
      featured: true,
    },
    {
      href: "/blog",
      label: "Blog",
      description: "Industry insights",
      icon: FileText,
    },
    {
      href: "/guides",
      label: "Resource Library",
      description: "Guides & templates",
      icon: FileText,
    },
    {
      href: "/about-us",
      label: "About Us",
      description: "Our mission",
      icon: Star,
    },
  ],
};

export const megaMenuSections: NavSection[] = [
  solutionsSection,
  marketplaceSection,
  toolsSection,
  communitySection,
  resourcesSection,
];

export const tierLabels: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};

export const tierColors: Record<SubscriptionTier, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  business: 'bg-[#C8A661]/20 text-[#C8A661]',
  enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};
