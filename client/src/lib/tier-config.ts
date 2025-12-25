import { 
  Gift, Zap, Star, Crown, Building2, Rocket, 
  Eye, TrendingUp, Search, FileText, Video, Shield,
  Award, Sparkles, Target, BarChart3, Users, Clock
} from "lucide-react";

export type PlatformTier = 'free' | 'pro' | 'enterprise';
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

export interface ConsultingAddon {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  priceType: 'one-time' | 'monthly' | 'starting';
  icon: typeof Gift;
  iconBg: string;
  iconColor: string;
  features: string[];
  cta: string;
  popular?: boolean;
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
    tagline: 'Get started',
    description: 'Explore the platform with essential tools and 3 free CLEANBI analyses',
    price: 0,
    priceAnnual: 0,
    icon: Gift,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    popular: false,
    features: [
      { text: '3 CLEANBI analyses total', included: true, highlight: true },
      { text: 'Basic investment calculators', included: true, highlight: true },
      { text: 'Limited template access', included: true },
      { text: 'Browse marketplace listings', included: true },
      { text: 'Read forum discussions', included: true },
      { text: 'Blog & help center access', included: true },
      { text: 'Unlimited CLEANBI analyses', included: false },
      { text: 'Full Calculator Suite', included: false },
      { text: 'Template Vault full access', included: false },
      { text: 'PDF exports', included: false },
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
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For serious investors',
    description: 'Unlimited CLEANBI analyses, full calculator suite, and PDF exports',
    price: 29,
    priceAnnual: 288,
    icon: Zap,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    popular: true,
    features: [
      { text: 'Unlimited CLEANBI analyses', included: true, highlight: true },
      { text: 'Full Calculator Suite (50+ tools)', included: true, highlight: true },
      { text: 'Unlimited PDF exports', included: true },
      { text: 'Template Vault full access', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Forum posting & community', included: true },
      { text: 'Save $60/yr vs monthly', included: true, highlight: true },
    ],
    limits: {
      cleanbiAnalyses: 'unlimited',
      apiCalls: 100,
      savedReports: 'unlimited',
      teamMembers: 1,
    },
    cta: 'Upgrade to Pro',
    ctaVariant: 'default',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-[#C8A661] text-white',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For brokers & firms',
    description: 'Everything in Pro plus API access, white-label reports, and dedicated support',
    price: 99,
    priceAnnual: 1068,
    icon: Crown,
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    iconColor: 'text-white',
    popular: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'API access for integrations', included: true, highlight: true },
      { text: 'White-label reports & branding', included: true, highlight: true },
      { text: 'Priority phone support', included: true, highlight: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Team collaboration (10+ seats)', included: true },
      { text: 'Used by 500+ brokers', included: true, highlight: true },
    ],
    limits: {
      cleanbiAnalyses: 'unlimited',
      apiCalls: 'unlimited',
      savedReports: 'unlimited',
      teamMembers: 'unlimited',
    },
    cta: 'Go Enterprise',
    ctaVariant: 'outline',
    badge: 'ENTERPRISE',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
  },
};

export const CONSULTING_ADDONS: ConsultingAddon[] = [
  {
    id: 'strategy-session',
    name: 'Strategy Session',
    tagline: '90-min intensive',
    description: 'Deep-dive consultation with expert analysis and actionable deliverables',
    price: 750,
    priceType: 'one-time',
    icon: Target,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    features: [
      '90-minute 1-on-1 consultation',
      'Custom CLEANBI analysis review',
      'Acquisition strategy roadmap',
      'Written deliverables & recommendations',
      'Recording of session',
    ],
    cta: 'Book Session',
    popular: true,
  },
  {
    id: 'monthly-advisory',
    name: 'Monthly Advisory',
    tagline: 'Ongoing expert support',
    description: 'Dedicated advisor access for continuous guidance on your laundromat journey',
    price: 1500,
    priceType: 'monthly',
    icon: Users,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    features: [
      '4 hours of advisory time per month',
      'Priority response within 24 hours',
      'Deal review & negotiation support',
      'Due diligence assistance',
      'Ongoing strategy refinement',
      'Cancel anytime',
    ],
    cta: 'Start Advisory',
  },
  {
    id: 'white-glove',
    name: 'White-Glove Service',
    tagline: 'Full acquisition support',
    description: 'Comprehensive hands-on support from search to close',
    price: 5000,
    priceType: 'starting',
    icon: Crown,
    iconBg: 'bg-gradient-to-br from-[#0A1628] to-[#1e3a5f]',
    iconColor: 'text-[#C8A661]',
    features: [
      'Dedicated acquisition manager',
      'Market search & property sourcing',
      'Full due diligence coordination',
      'Negotiation representation',
      'Financing introductions',
      'Closing support & transition planning',
      'On-site visits (travel included)',
    ],
    cta: 'Contact Sales',
  },
];

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
      { text: 'Email blast to 73K+ members', included: true },
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

export const PLATFORM_TIER_ORDER: PlatformTier[] = ['free', 'pro', 'enterprise'];
export const LISTING_TIER_ORDER: ListingTier[] = ['free', 'basic', 'showcase', 'diamond'];

export function getPlatformTier(tierId: string): PlatformTierConfig | undefined {
  // Handle legacy tier names
  if (tierId === 'starter' || tierId === 'business') return PLATFORM_TIERS['pro'];
  if (tierId === 'all_access') return PLATFORM_TIERS['pro'];
  if (tierId === 'accelerate' || tierId === 'scale') return PLATFORM_TIERS['pro'];
  if (tierId === 'summit') return PLATFORM_TIERS['enterprise'];
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
    answer: "CLEANBI is our proprietary AI-powered location intelligence system that scores any address for laundromat investment potential. It analyzes 6 key factors: Competition, Location, Equipment, Accessibility, Neighborhood, and Business metrics to give you a comprehensive grade."
  },
  {
    question: "What's included in All-Access?",
    answer: "Everything! Unlimited CLEANBI analyses, all 50+ calculators, complete book & courses, Design Studio, Service Guy AI, forum access, marketplace features, AI tools, bulk analysis, API access, and priority support. One membership, zero limitations."
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No credit card is needed for the Free tier - just sign up and start analyzing locations immediately with 3 free CLEANBI analyses. All paid plans include a 30-day money-back guarantee."
  },
  {
    question: "What is the money-back guarantee?",
    answer: "All paid plans include a 30-day money-back guarantee. If you're not completely satisfied within the first 30 days, contact us for a full refund - no questions asked."
  },
  {
    question: "What are consulting add-ons?",
    answer: "Our consulting add-ons provide personalized, human expert guidance. Strategy Sessions ($750) are 90-min deep dives. Monthly Advisory ($1,500/mo) gives you ongoing access to an expert. White-Glove Service ($5,000+) provides full acquisition support from search to close."
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processing."
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes! If you're not satisfied within the first 30 days of your paid subscription, contact us for a full refund. No questions asked."
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
  }
];
