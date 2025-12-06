import { 
  Gift, Zap, Star, Crown, Building2, Rocket, 
  Eye, TrendingUp, Search, FileText, Video, Shield,
  Award, Sparkles, Target, BarChart3
} from "lucide-react";

export type PlatformTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type ListingTier = 'free' | 'basic' | 'showcase' | 'diamond';

export interface TierFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlatformTierConfig {
  id: PlatformTier;
  name: string;
  tagline: string;
  description: string;
  price: number;
  priceAnnual: number;
  icon: typeof Gift;
  iconBg: string;
  iconColor: string;
  popular: boolean;
  features: TierFeature[];
  limits: {
    cleanbiAnalyses: number | 'unlimited';
    apiCalls: number | 'unlimited';
    savedReports: number | 'unlimited';
    teamMembers: number | 'unlimited';
  };
  cta: string;
  ctaVariant: 'default' | 'outline' | 'secondary';
  badge?: string;
  badgeColor?: string;
}

export interface ListingTierConfig {
  id: ListingTier;
  name: string;
  tagline: string;
  description: string;
  price: number;
  icon: typeof Gift;
  iconBg: string;
  iconColor: string;
  popular: boolean;
  features: TierFeature[];
  limits: {
    photos: number;
    videos: number;
    boostDays: number;
    analytics: boolean;
    seoOptimization: boolean;
    cleanbiReport: boolean;
    priorityPlacement: boolean;
    socialProofBadge: boolean;
  };
  cta: string;
  ctaVariant: 'default' | 'outline' | 'secondary';
  badge?: string;
  badgeColor?: string;
  roi?: string;
}

export const PLATFORM_TIERS: Record<PlatformTier, PlatformTierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Try it out',
    description: 'Get 3 free CLEANBI analyses plus essential tools',
    price: 0,
    priceAnnual: 0,
    icon: Gift,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    popular: false,
    features: [
      { text: '3 CLEANBI analyses total', included: true, highlight: true },
      { text: 'Browse marketplace listings', included: true },
      { text: 'View funding hub directory', included: true },
      { text: 'Read forum discussions', included: true },
      { text: 'Blog & help center access', included: true },
      { text: 'Street View access', included: true },
      { text: 'Competitor count display', included: true },
      { text: 'Full Calculator Hub', included: false },
      { text: 'Book & Courses access', included: false },
      { text: 'Forum posting', included: false },
    ],
    limits: {
      cleanbiAnalyses: 3,
      apiCalls: 0,
      savedReports: 3,
      teamMembers: 1,
    },
    cta: 'Start Free',
    ctaVariant: 'outline',
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For serious investors',
    description: 'Full access to all calculators, book, courses & unlimited CLEANBI',
    price: 29,
    priceAnnual: 290,
    icon: Zap,
    iconBg: 'bg-[#C8A661]/20',
    iconColor: 'text-[#C8A661]',
    popular: true,
    features: [
      { text: 'Unlimited CLEANBI analyses', included: true, highlight: true },
      { text: 'Full Calculator Hub (ROI, Loan, Utility, Labor, Valuation)', included: true, highlight: true },
      { text: 'Book & Courses access', included: true, highlight: true },
      { text: 'AI Business Plan Generator', included: true },
      { text: 'Premium templates & downloads', included: true },
      { text: 'Forum posting & community', included: true },
      { text: '3D Aerial View flyovers', included: true },
      { text: 'Walk Score & Transit Score', included: true },
      { text: 'Export PDF reports', included: true },
      { text: 'Priority email support', included: true },
    ],
    limits: {
      cleanbiAnalyses: 'unlimited',
      apiCalls: 0,
      savedReports: 100,
      teamMembers: 1,
    },
    cta: 'Get Started',
    ctaVariant: 'default',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-[#C8A661] text-white',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For power users & brokers',
    description: 'Advanced analytics, Monte Carlo simulations, and API access',
    price: 99,
    priceAnnual: 990,
    icon: Crown,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    popular: false,
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Monte Carlo simulations', included: true, highlight: true },
      { text: 'Drive-time catchment maps', included: true, highlight: true },
      { text: 'Bulk location analysis', included: true },
      { text: 'Due Diligence Toolkit', included: true },
      { text: 'Revenue projections', included: true },
      { text: 'Deal scoring AI insights', included: true },
      { text: 'Website builder', included: true },
      { text: 'API access (500 calls/mo)', included: true },
      { text: 'Priority phone support', included: true },
    ],
    limits: {
      cleanbiAnalyses: 'unlimited',
      apiCalls: 500,
      savedReports: 'unlimited',
      teamMembers: 3,
    },
    cta: 'Get Started',
    ctaVariant: 'default',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For brokers & multi-unit operators',
    description: 'White-label reports, ownership data, and dedicated support',
    price: 699,
    priceAnnual: 6990,
    icon: Building2,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    popular: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Ownership & lien data', included: true, highlight: true },
      { text: 'Motivated seller detection', included: true, highlight: true },
      { text: 'Property tax records', included: true },
      { text: 'White-label reports', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Unlimited API access', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Phone & Slack support', included: true },
    ],
    limits: {
      cleanbiAnalyses: 'unlimited',
      apiCalls: 'unlimited',
      savedReports: 'unlimited',
      teamMembers: 'unlimited',
    },
    cta: 'Contact Sales',
    ctaVariant: 'outline',
    badge: 'BEST VALUE',
    badgeColor: 'bg-blue-600 text-white',
  },
};

export const LISTING_TIERS: Record<ListingTier, ListingTierConfig> = {
  free: {
    id: 'free',
    name: 'Basic',
    tagline: 'Get discovered',
    description: 'Standard listing visibility for your laundromat',
    price: 0,
    icon: Eye,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    popular: false,
    features: [
      { text: 'Listed in marketplace', included: true },
      { text: '5 photos allowed', included: true },
      { text: 'Basic contact form', included: true },
      { text: 'Standard search placement', included: true },
      { text: 'Auto-featured in carousel', included: false },
      { text: 'AI blog about your listing', included: false },
      { text: 'Auto-indexed to Google/Bing', included: false },
      { text: 'CLEANBI report included', included: false },
    ],
    limits: {
      photos: 5,
      videos: 0,
      boostDays: 0,
      analytics: false,
      seoOptimization: false,
      cleanbiReport: false,
      priorityPlacement: false,
      socialProofBadge: false,
    },
    cta: 'List for Free',
    ctaVariant: 'outline',
  },
  basic: {
    id: 'basic',
    name: 'Enhanced',
    tagline: '2x more visibility',
    description: 'Stand out with enhanced listing features and analytics',
    price: 49,
    icon: TrendingUp,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    popular: false,
    features: [
      { text: 'Everything in Basic tier', included: true },
      { text: '15 photos allowed', included: true, highlight: true },
      { text: 'Enhanced listing badge', included: true, highlight: true },
      { text: 'Listing analytics dashboard', included: true },
      { text: 'Buyer inquiry tracking', included: true },
      { text: 'Priority in category search', included: true },
      { text: 'Auto-featured in carousel', included: false },
      { text: 'AI blog about your listing', included: false },
    ],
    limits: {
      photos: 15,
      videos: 0,
      boostDays: 0,
      analytics: true,
      seoOptimization: false,
      cleanbiReport: false,
      priorityPlacement: false,
      socialProofBadge: false,
    },
    cta: 'Upgrade to Enhanced',
    ctaVariant: 'default',
    roi: '2x more buyer inquiries on average',
  },
  showcase: {
    id: 'showcase',
    name: 'Showcase',
    tagline: 'Auto-Featured Premium',
    description: 'Auto-featured in homepage carousel with priority placement',
    price: 149,
    icon: Star,
    iconBg: 'bg-[#C8A661]/20',
    iconColor: 'text-[#C8A661]',
    popular: true,
    features: [
      { text: 'Everything in Enhanced tier', included: true },
      { text: 'AUTO-FEATURED in homepage carousel', included: true, highlight: true },
      { text: 'Priority search ranking', included: true, highlight: true },
      { text: '30 photos + 2 video tours', included: true },
      { text: '"Showcase" badge on listing', included: true },
      { text: 'CLEANBI report included', included: true },
      { text: 'Weekly email blast inclusion', included: true },
      { text: 'AI blog about your listing', included: false },
    ],
    limits: {
      photos: 30,
      videos: 2,
      boostDays: 7,
      analytics: true,
      seoOptimization: false,
      cleanbiReport: true,
      priorityPlacement: true,
      socialProofBadge: true,
    },
    cta: 'Get Showcase',
    ctaVariant: 'default',
    badge: 'BEST SELLER',
    badgeColor: 'bg-[#C8A661] text-white',
    roi: '5x more visibility vs Basic',
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    tagline: 'Maximum Visibility VIP',
    description: 'Full auto-features: carousel, AI blog, Google indexing, concierge service',
    price: 499,
    icon: Rocket,
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    iconColor: 'text-white',
    popular: false,
    features: [
      { text: 'Everything in Showcase tier', included: true },
      { text: 'AUTO-BLOG: AI writes article about your listing', included: true, highlight: true },
      { text: 'AUTO-INDEX: Submitted to Google & Bing instantly', included: true, highlight: true },
      { text: 'Homepage spotlight banner', included: true, highlight: true },
      { text: 'Social media promotion', included: true },
      { text: 'Email blast to 72K+ members', included: true },
      { text: 'Unlimited photos & videos', included: true },
      { text: 'Concierge listing setup + priority support', included: true },
    ],
    limits: {
      photos: 999,
      videos: 20,
      boostDays: 30,
      analytics: true,
      seoOptimization: true,
      cleanbiReport: true,
      priorityPlacement: true,
      socialProofBadge: true,
    },
    cta: 'Go Diamond',
    ctaVariant: 'default',
    badge: 'VIP',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
    roi: 'Sell 3x faster with full automation',
  },
};

export const PLATFORM_TIER_ORDER: PlatformTier[] = ['free', 'starter', 'pro', 'enterprise'];
export const LISTING_TIER_ORDER: ListingTier[] = ['free', 'basic', 'showcase', 'diamond'];

export function getPlatformTier(tierId: string): PlatformTierConfig | undefined {
  return PLATFORM_TIERS[tierId as PlatformTier];
}

export function getListingTier(tierId: string): ListingTierConfig | undefined {
  return LISTING_TIERS[tierId as ListingTier];
}

export function formatPrice(price: number, period: 'month' | 'year' = 'month'): string {
  if (price === 0) return 'Free';
  return `$${price}/${period === 'month' ? 'mo' : 'yr'}`;
}

export function getSavingsPercent(monthly: number, annual: number): number {
  if (monthly === 0) return 0;
  const yearlyMonthly = monthly * 12;
  return Math.round(((yearlyMonthly - annual) / yearlyMonthly) * 100);
}

export const PLATFORM_PRICING_FAQS = [
  {
    question: "What is CLEANBI?",
    answer: "CLEANBI is our proprietary AI-powered location intelligence system that scores any address for laundromat investment potential. It analyzes 6 key factors: Competition, Location, Equipment, Accessibility, Neighborhood, and Business metrics to give you a comprehensive A-F grade."
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No credit card is needed for the Free tier - just sign up and start analyzing locations immediately with 3 free CLEANBI analyses. For paid plans (Starter, Pro, Enterprise), a credit card is required at checkout. All paid plans include a 30-day money-back guarantee."
  },
  {
    question: "What is the money-back guarantee?",
    answer: "All paid plans include a 30-day money-back guarantee. If you're not completely satisfied within the first 30 days, contact us for a full refund - no questions asked. We're confident you'll love the value WashBizHub provides."
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle. We'll prorate any charges."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processing. Enterprise plans can also pay via invoice."
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes! If you're not satisfied within the first 30 days of your paid subscription, contact us for a full refund. No questions asked."
  },
  {
    question: "What's included in API access?",
    answer: "Pro plan includes 500 API calls per month for integrating CLEANBI data into your own applications. Enterprise includes unlimited API access with dedicated endpoints and priority rate limits."
  }
];

export const LISTING_PRICING_FAQS = [
  {
    question: "How long do listing tiers last?",
    answer: "All listing tiers are monthly subscriptions that auto-renew. Your listing stays active as long as your subscription is active. You can cancel or change tiers anytime."
  },
  {
    question: "What happens if my listing sells?",
    answer: "Congratulations! Simply mark your listing as 'Sold' in your dashboard. Your subscription will continue until the end of your billing period, or you can cancel it immediately."
  },
  {
    question: "Can I upgrade my listing tier later?",
    answer: "Absolutely! You can upgrade your listing at any time and the new features take effect immediately. We'll prorate the difference for the remaining billing period."
  },
  {
    question: "How does the CLEANBI report help sell my laundromat?",
    answer: "Buyers love seeing a professional CLEANBI analysis. It provides third-party validation of location quality, competition analysis, and growth potential - building buyer confidence and often leading to faster sales at better prices."
  },
  {
    question: "What's included in professional photography credit?",
    answer: "Spotlight tier includes a $250 credit toward professional photography services in select markets. We'll connect you with our network of commercial real estate photographers."
  }
];
