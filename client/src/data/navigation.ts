// Navigation configuration using icon name strings to avoid module-level icon resolution issues
// Icons are resolved at render time using the NavIcon component

export type IconName = 
  | 'Search' | 'Wrench' | 'Store' | 'Calculator' | 'LayoutDashboard' 
  | 'Palette' | 'Bot' | 'DollarSign' | 'ShoppingBag' | 'Star' 
  | 'Users' | 'BookOpen' | 'MessageSquare' | 'GraduationCap' | 'Network'
  | 'Phone' | 'FileText' | 'Building2' | 'Zap' | 'TrendingUp' | 'Gauge' | 'Receipt';

export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface NavItem {
  href: string;
  label: string;
  description: string;
  iconName: IconName;
  tier?: SubscriptionTier;
  featured?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  iconName: IconName;
  items: NavItem[];
}

export const cleanbiNavItem: NavItem = {
  href: "/cleanbi-explorer",
  label: "CLEANBI",
  description: "AI location intelligence",
  iconName: "Search",
  featured: true,
};

export const solutionsSection: NavSection = {
  id: "solutions",
  title: "Solutions",
  iconName: "Zap",
  items: [
    {
      href: "/pos-command-center",
      label: "POS Command Center",
      description: "Operations dashboard",
      iconName: "LayoutDashboard",
      tier: "pro",
      featured: true,
    },
    {
      href: "/website-builder",
      label: "Website Builder",
      description: "Build your laundromat site",
      iconName: "Building2",
      tier: "pro",
    },
    {
      href: "/service-guy-ai",
      label: "Service Guy AI",
      description: "Equipment diagnostics",
      iconName: "Bot",
      tier: "pro",
      featured: true,
    },
    {
      href: "/dashboard",
      label: "My Dashboard",
      description: "Your command center",
      iconName: "LayoutDashboard",
    },
    {
      href: "/design-studio",
      label: "Design Studio",
      description: "2D/3D floor plans",
      iconName: "Palette",
    },
  ],
};

export const marketplaceSection: NavSection = {
  id: "marketplace",
  title: "Marketplace",
  iconName: "ShoppingBag",
  items: [
    {
      href: "/buy-laundromat",
      label: "Buy a Laundromat",
      description: "Browse listings",
      iconName: "ShoppingBag",
      featured: true,
    },
    {
      href: "/equipment-marketplace",
      label: "Equipment Hub",
      description: "Buy/sell equipment",
      iconName: "Wrench",
    },
    {
      href: "/sell-your-laundromat",
      label: "Sell Your Laundromat",
      description: "List your business",
      iconName: "Store",
    },
    {
      href: "/brokers",
      label: "Broker Directory",
      description: "Find verified brokers",
      iconName: "Users",
    },
    {
      href: "/directory",
      label: "Business Directory",
      description: "Vendors & services",
      iconName: "Building2",
    },
  ],
};

export const toolsSection: NavSection = {
  id: "tools",
  title: "Tools",
  iconName: "Calculator",
  items: [
    {
      href: "/calculators",
      label: "Calculator Suite",
      description: "80+ professional tools",
      iconName: "Calculator",
      featured: true,
    },
    {
      href: "/valuation-calculator",
      label: "Valuation Calculator",
      description: "What's it worth?",
      iconName: "DollarSign",
    },
    {
      href: "/roi-calculator",
      label: "ROI Calculator",
      description: "Investment returns",
      iconName: "TrendingUp",
    },
    {
      href: "/utility-bill-auditor",
      label: "Utility Auditor",
      description: "Reduce costs",
      iconName: "Receipt",
    },
    {
      href: "/tpd-calculator",
      label: "TPD Calculator",
      description: "Turns per day",
      iconName: "Gauge",
    },
  ],
};

export const communitySection: NavSection = {
  id: "community",
  title: "Community",
  iconName: "Users",
  items: [
    {
      href: "/forum",
      label: "Community Forum",
      description: "Ask questions",
      iconName: "MessageSquare",
      featured: true,
    },
    {
      href: "/courses",
      label: "Courses",
      description: "Learn the business",
      iconName: "GraduationCap",
      tier: "pro",
    },
    {
      href: "/network",
      label: "Member Network",
      description: "Connect with owners",
      iconName: "Network",
    },
    {
      href: "/consultation",
      label: "Book Consultation",
      description: "Expert advice",
      iconName: "Phone",
    },
  ],
};

export const resourcesSection: NavSection = {
  id: "resources",
  title: "Resources",
  iconName: "BookOpen",
  items: [
    {
      href: "/book",
      label: "Laundromat Bible",
      description: "Complete guide",
      iconName: "BookOpen",
      featured: true,
    },
    {
      href: "/blog",
      label: "Blog",
      description: "Industry insights",
      iconName: "FileText",
    },
    {
      href: "/guides",
      label: "Resource Library",
      description: "Guides & templates",
      iconName: "FileText",
    },
    {
      href: "/about-us",
      label: "About Us",
      description: "Our mission",
      iconName: "Star",
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
