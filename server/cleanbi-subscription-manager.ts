// ========================================
// CLEANBI SUBSCRIPTION & USAGE MANAGER
// Maximizes MRR/ARR through tiered pricing
// ========================================

import { db } from "./db";
import { users } from "@shared/schema";
import { cleanbiUsage } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import Stripe from "stripe";
import { sendUsageMilestoneEmail } from "./subscription-emails";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null;

// ========================================
// PLATFORM ADMIN EMAILS - UNLIMITED ACCESS
// ========================================

export const PLATFORM_ADMIN_EMAILS = [
  "nick@washbizhub.com",
  "thelaundromatfb@gmail.com",
  "rzrbackreb444@gmail.com"
];

/**
 * Check if an email is a platform admin with unlimited access
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return PLATFORM_ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get user email by ID for admin check
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const [user] = await db.select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user?.email || null;
  } catch {
    return null;
  }
}

// ========================================
// HELPER: Get User's CLEANBI Tier
// ========================================

/**
 * Get user's CLEANBI subscription tier
 * Production: Uses dedicated cleanbiTier field, with Stripe fallback
 * ADMINS: Platform admins always get ENTERPRISE tier with unlimited access
 */
export async function getUserCLEANBITier(userId: string): Promise<keyof typeof CLEANBI_PRICING_TIERS> {
  try {
    const [user] = await db.select({ 
      tier: users.cleanbiTier,
      email: users.email,
      subscriptionId: users.cleanbiSubscriptionId,
      subscriptionStatus: users.cleanbiSubscriptionStatus,
      stripeCustomerId: users.stripeCustomerId
    })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return 'FREE';
    }
    
    // ADMIN CHECK: Platform admins get ENTERPRISE tier (unlimited access)
    if (isAdminEmail(user.email)) {
      return 'ENTERPRISE';
    }
    
    // If tier is set and subscription is valid (active, trialing, past_due), use it
    const validStatuses = ['active', 'trialing', 'past_due'];
    if (user.tier && user.subscriptionStatus && validStatuses.includes(user.subscriptionStatus)) {
      return normalizeTier(user.tier);
    }
    
    // Fallback: Query Stripe for active subscriptions
    if (stripe && user.stripeCustomerId) {
      const tier = await getStripeSubscriptionTier(user.stripeCustomerId);
      if (tier) {
        // Sync to database for faster future lookups
        await db.update(users)
          .set({ 
            cleanbiTier: tier.toLowerCase(),
            cleanbiSubscriptionStatus: 'active'
          })
          .where(eq(users.id, userId));
        
        return tier;
      }
    }
    
    // Default to stored tier or FREE
    return user.tier ? normalizeTier(user.tier) : 'FREE';
  } catch (error) {
    console.error('Error loading user CLEANBI tier:', error);
    return 'FREE'; // Safe default
  }
}

/**
 * Normalize tier string to CLEANBI_PRICING_TIERS key
 */
function normalizeTier(tier: string): keyof typeof CLEANBI_PRICING_TIERS {
  const tierMap: Record<string, keyof typeof CLEANBI_PRICING_TIERS> = {
    'free': 'FREE',
    'starter': 'STARTER',
    'pro': 'PRO',
    'enterprise': 'ENTERPRISE',
    'white_label': 'WHITE_LABEL',
    'api_basic': 'API_BASIC',
    'api_pro': 'API_PRO',
    'api_enterprise': 'API_ENTERPRISE'
  };
  
  return tierMap[tier.toLowerCase()] || 'FREE';
}

/**
 * Query Stripe for user's active CLEANBI subscription tier
 */
async function getStripeSubscriptionTier(stripeCustomerId: string): Promise<keyof typeof CLEANBI_PRICING_TIERS | null> {
  if (!stripe) return null;
  
  try {
    // Query all valid subscription statuses (not just "active")
    const allSubs = await Promise.all([
      stripe.subscriptions.list({ customer: stripeCustomerId, status: 'active', limit: 5 }),
      stripe.subscriptions.list({ customer: stripeCustomerId, status: 'trialing', limit: 5 }),
      stripe.subscriptions.list({ customer: stripeCustomerId, status: 'past_due', limit: 5 })
    ]);
    
    const subscriptions = {
      data: [...allSubs[0].data, ...allSubs[1].data, ...allSubs[2].data]
    };
    
    // Find CLEANBI subscription by metadata
    for (const sub of subscriptions.data) {
      if (sub.metadata.tierId) {
        return normalizeTier(sub.metadata.tierId);
      }
      
      // Fallback: Check price IDs
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        
        // Match against known CLEANBI price IDs
        for (const [tierKey, tierConfig] of Object.entries(CLEANBI_PRICING_TIERS)) {
          if (priceId === tierConfig.stripePriceId || 
              ('annualStripePriceId' in tierConfig && priceId === tierConfig.annualStripePriceId)) {
            return tierKey as keyof typeof CLEANBI_PRICING_TIERS;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error querying Stripe subscriptions:', error);
    return null;
  }
}

// ========================================
// PRICING TIERS
// ========================================

export const CLEANBI_PRICING_TIERS = {
  // ========================================
  // FREE TIER: 3 analyses total (lifetime)
  // ========================================
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: {
      reportsTotal: 3, // 3 FREE ANALYSES TOTAL (lifetime) - then must upgrade
      reportsPerDay: -1, // No daily limit - just total
      reportsPerMonth: -1, // No monthly limit - just total
      basicScore: true, // Show score only - no breakdown
      detailedBreakdown: false, // Requires Starter+
      competitorAnalysis: false, // Requires Starter+
      demographicData: false, // Requires Starter+
      pdfExport: false, // Requires Starter+
      savedReports: false, // Requires Starter+
      emailAlerts: false, // Requires Starter+
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      bulkReports: false,
      ownershipData: false,
      motivatedSellerScore: false
    },
    stripeProductId: null,
    stripePriceId: null
  },
  
  // ========================================
  // STARTER TIER: $29/mo - Unlimited analyses
  // ========================================
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: {
      reportsPerDay: -1, // Unlimited per day
      reportsPerMonth: -1, // Unlimited per month
      basicScore: true,
      detailedBreakdown: true, // Full 6-factor breakdown
      competitorAnalysis: true, // Nearby competitor mapping
      demographicData: true, // Census data
      pdfExport: true, // Download reports
      savedReports: true, // Save to dashboard (100 max)
      emailAlerts: true, // Get notified of score changes
      aerialView: true, // 3D flyover
      walkScore: true, // Walk & Transit scores
      solarAnalysis: true, // Solar potential
      propertyValue: true, // Property value estimates
      apiAccess: false, // Pro+ only
      prioritySupport: true,
      whiteLabel: false,
      bulkReports: false,
      ownershipData: false,
      motivatedSellerScore: false
    },
    stripeProductId: process.env.STRIPE_PRODUCT_STARTER || 'prod_cleanbi_starter',
    stripePriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_cleanbi_starter_monthly',
    annualPrice: 290, // 2 months free
    annualStripePriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_cleanbi_starter_annual'
  },
  
  // ========================================
  // PRO TIER: $99/mo - Unlimited + API access
  // ========================================
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    interval: 'month',
    features: {
      reportsPerDay: -1, // Unlimited per day
      reportsPerMonth: -1, // Unlimited per month
      basicScore: true,
      detailedBreakdown: true,
      competitorAnalysis: true,
      demographicData: true,
      pdfExport: true,
      savedReports: true, // Unlimited
      emailAlerts: true,
      aerialView: true,
      walkScore: true,
      solarAnalysis: true,
      propertyValue: true,
      roiCalculator: true, // Pro+ only
      monteCarloSimulation: true, // Pro+ only
      utilityRateAnalysis: true, // Pro+ only
      catchmentMaps: true, // Drive-time catchment
      revenueProjections: true, // Pro+ only
      apiAccess: true, // 500 calls/month
      apiCallsPerMonth: 500,
      prioritySupport: true,
      phoneSupport: true, // Pro+ only
      whiteLabel: false,
      bulkReports: true,
      ownershipData: false,
      motivatedSellerScore: false
    },
    stripeProductId: process.env.STRIPE_PRODUCT_PRO || 'prod_cleanbi_pro',
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_cleanbi_pro_monthly',
    annualPrice: 990, // 2 months free
    annualStripePriceId: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_cleanbi_pro_annual'
  },
  
  // ========================================
  // ENTERPRISE TIER: $699/mo - Full access + white label + ownership data
  // ========================================
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 699,
    interval: 'month',
    features: {
      reportsPerDay: -1, // Unlimited
      reportsPerMonth: -1, // Unlimited
      basicScore: true,
      detailedBreakdown: true,
      competitorAnalysis: true,
      demographicData: true,
      pdfExport: true,
      savedReports: true,
      emailAlerts: true,
      aerialView: true,
      walkScore: true,
      solarAnalysis: true,
      propertyValue: true,
      roiCalculator: true,
      monteCarloSimulation: true,
      utilityRateAnalysis: true,
      catchmentMaps: true,
      revenueProjections: true,
      apiAccess: true,
      apiCallsPerMonth: -1, // Unlimited API calls
      prioritySupport: true,
      phoneSupport: true,
      slackSupport: true, // Enterprise only
      dedicatedAccountManager: true, // Enterprise only
      whiteLabel: true, // Custom branding
      bulkReports: true,
      ownershipData: true, // Enterprise only - ownership & lien data
      motivatedSellerScore: true, // Enterprise only - distressed seller detection
      propertyTaxRecords: true, // Enterprise only
      teamCollaboration: true // Enterprise only - unlimited team members
    },
    stripeProductId: process.env.STRIPE_PRODUCT_ENTERPRISE || 'prod_cleanbi_enterprise',
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_cleanbi_enterprise_monthly',
    annualPrice: 6990, // 2 months free
    annualStripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_cleanbi_enterprise_annual'
  },
  
  // ========================================
  // WHITE LABEL TIER: Legacy/Custom pricing
  // ========================================
  WHITE_LABEL: {
    id: 'white_label',
    name: 'White Label',
    price: 999,
    interval: 'month',
    features: {
      reportsPerDay: -1,
      reportsPerMonth: -1,
      basicScore: true,
      detailedBreakdown: true,
      pdfExport: true,
      apiAccess: true,
      apiCallsPerMonth: -1,
      prioritySupport: true,
      whiteLabel: true,
      bulkReports: true,
      ownershipData: true,
      motivatedSellerScore: true
    },
    stripeProductId: 'prod_cleanbi_whitelabel',
    stripePriceId: 'price_cleanbi_whitelabel_monthly',
    annualPrice: 9990,
    annualStripePriceId: 'price_cleanbi_whitelabel_annual'
  },
  
  // API-only tiers for developers
  API_BASIC: {
    id: 'api_basic',
    name: 'API Basic',
    price: 99,
    interval: 'month',
    features: {
      apiCallsPerMonth: 1000,
      rateLimitPerMinute: 10,
      webhookSupport: false,
      dedicatedSupport: false
    },
    stripeProductId: 'prod_cleanbi_api_basic',
    stripePriceId: 'price_cleanbi_api_basic'
  },
  
  API_PRO: {
    id: 'api_pro',
    name: 'API Pro',
    price: 299,
    interval: 'month',
    features: {
      apiCallsPerMonth: 5000,
      rateLimitPerMinute: 30,
      webhookSupport: true,
      dedicatedSupport: false
    },
    stripeProductId: 'prod_cleanbi_api_pro',
    stripePriceId: 'price_cleanbi_api_pro'
  },
  
  API_ENTERPRISE: {
    id: 'api_enterprise',
    name: 'API Enterprise',
    price: 499,
    interval: 'month',
    features: {
      apiCallsPerMonth: -1, // Unlimited
      rateLimitPerMinute: 100,
      webhookSupport: true,
      dedicatedSupport: true
    },
    stripeProductId: 'prod_cleanbi_api_enterprise',
    stripePriceId: 'price_cleanbi_api_enterprise'
  }
};

// ========================================
// USAGE TRACKING
// ========================================

export async function trackCLEANBIUsage(userId: string, reportType: 'basic' | 'detailed' | 'api') {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  await db.insert(cleanbiUsage).values({
    userId,
    reportType,
    timestamp: now,
    month: monthStart.toISOString().slice(0, 7) // YYYY-MM
  });
  
  // Check if this was the user's 3rd free analysis (triggers milestone email)
  const FREE_TIER_LIMIT = 3;
  try {
    const totalUsage = await getUserUsageTotal(userId);
    if (totalUsage === FREE_TIER_LIMIT) {
      // User just hit the free tier limit - send milestone email
      const [user] = await db.select({ 
        email: users.email, 
        firstName: users.firstName,
        cleanbiTier: users.cleanbiTier,
        subscriptionTier: users.subscriptionTier 
      })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      // Only send to FREE tier users (not paid subscribers)
      if (user && (!user.cleanbiTier || user.cleanbiTier === 'FREE') && 
          (!user.subscriptionTier || user.subscriptionTier === 'free')) {
        sendUsageMilestoneEmail({
          email: user.email,
          firstName: user.firstName || undefined,
          usageCount: totalUsage,
          limit: FREE_TIER_LIMIT,
        }).catch(err => console.error("Failed to send milestone email:", err));
      }
    }
  } catch (err) {
    console.error("Error checking milestone email:", err);
    // Don't fail the main tracking function
  }
}

export async function getUserUsageThisMonth(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
}> {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
  
  // Use indexed query on (userId, month) for performance
  const usage = await db
    .select({
      reportType: cleanbiUsage.reportType,
      count: sql<number>`count(*)::int`
    })
    .from(cleanbiUsage)
    .where(
      and(
        eq(cleanbiUsage.userId, userId),
        eq(cleanbiUsage.month, currentMonth)
      )
    )
    .groupBy(cleanbiUsage.reportType);
  
  const total = usage.reduce((sum, item) => sum + item.count, 0);
  const byType = Object.fromEntries(
    usage.map(item => [item.reportType, item.count])
  );
  
  return { total, byType };
}

// ========================================
// QUOTA CHECKING
// ========================================

export async function checkCLEANBIQuota(userId: string, tier: keyof typeof CLEANBI_PRICING_TIERS): Promise<{
  allowed: boolean;
  remainingToday: number;
  remainingMonth: number;
  remainingTotal: number;
  dailyLimit: number;
  monthlyLimit: number;
  totalLimit: number;
  requiresUpgrade: boolean;
  reason?: string;
}> {
  // ADMIN CHECK: Platform admins get UNLIMITED access
  const userEmail = await getUserEmail(userId);
  if (isAdminEmail(userEmail)) {
    return {
      allowed: true,
      remainingToday: -1,
      remainingMonth: -1,
      remainingTotal: -1,
      dailyLimit: -1,
      monthlyLimit: -1,
      totalLimit: -1,
      requiresUpgrade: false,
      reason: "Platform Admin - Unlimited Access"
    };
  }
  
  const tierConfig = CLEANBI_PRICING_TIERS[tier];
  const features = tierConfig.features as any;
  
  // Get limits
  const totalLimit = features.reportsTotal ?? -1; // Lifetime total (FREE tier = 3)
  const dailyLimit = features.reportsPerDay ?? -1;
  const monthlyLimit = features.reportsPerMonth ?? features.apiCallsPerMonth ?? -1;
  
  // FREE tier: Check TOTAL LIFETIME limit (3 analyses total)
  if (tier === 'FREE' && totalLimit !== -1) {
    const totalUsage = await getUserUsageTotal(userId);
    const remaining = Math.max(0, totalLimit - totalUsage);
    
    if (totalUsage >= totalLimit) {
      return {
        allowed: false,
        remainingToday: 0,
        remainingMonth: 0,
        remainingTotal: 0,
        dailyLimit: -1,
        monthlyLimit: -1,
        totalLimit,
        requiresUpgrade: true,
        reason: `You've used all ${totalLimit} free analyses. Upgrade to Starter for unlimited access!`
      };
    }
    
    return {
      allowed: true,
      remainingToday: remaining, // For display compatibility
      remainingMonth: remaining,
      remainingTotal: remaining,
      dailyLimit: totalLimit, // For display compatibility (shows as "X remaining")
      monthlyLimit: -1,
      totalLimit,
      requiresUpgrade: false
    };
  }
  
  // Paid plans: Unlimited (Pro, Enterprise)
  if (dailyLimit === -1 && monthlyLimit === -1) {
    return {
      allowed: true,
      remainingToday: -1,
      remainingMonth: -1,
      remainingTotal: -1,
      dailyLimit: -1,
      monthlyLimit: -1,
      totalLimit: -1,
      requiresUpgrade: false
    };
  }
  
  // Get usage stats for paid tiers with monthly limits
  const monthlyUsage = await getUserUsageThisMonth(userId);
  const dailyUsage = await getUserUsageToday(userId);
  
  // Check daily limit first (if applicable)
  if (dailyLimit !== -1 && dailyUsage >= dailyLimit) {
    return {
      allowed: false,
      remainingToday: 0,
      remainingMonth: Math.max(0, monthlyLimit - monthlyUsage.total),
      remainingTotal: -1,
      dailyLimit,
      monthlyLimit,
      totalLimit: -1,
      requiresUpgrade: true,
      reason: `Analysis limit reached (${dailyLimit} analyses). Upgrade for more reports.`
    };
  }
  
  // Check monthly limit
  if (monthlyLimit !== -1 && monthlyUsage.total >= monthlyLimit) {
    return {
      allowed: false,
      remainingToday: 0,
      remainingMonth: 0,
      remainingTotal: -1,
      dailyLimit,
      monthlyLimit,
      totalLimit: -1,
      requiresUpgrade: true,
      reason: `Monthly limit reached (${monthlyLimit}/month). Upgrade for more reports.`
    };
  }
  
  return {
    allowed: true,
    remainingToday: dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - dailyUsage),
    remainingMonth: monthlyLimit === -1 ? -1 : Math.max(0, monthlyLimit - monthlyUsage.total),
    remainingTotal: -1,
    dailyLimit,
    monthlyLimit,
    totalLimit: -1,
    requiresUpgrade: false
  };
}

// Get usage for today only
export async function getUserUsageToday(userId: string): Promise<number> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cleanbiUsage)
    .where(
      and(
        eq(cleanbiUsage.userId, userId),
        gte(cleanbiUsage.timestamp, todayStart)
      )
    );
  
  return result[0]?.count || 0;
}

// Get TOTAL LIFETIME usage for a user (for free tier limit)
export async function getUserUsageTotal(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cleanbiUsage)
    .where(eq(cleanbiUsage.userId, userId));
  
  return result[0]?.count || 0;
}

// Check quota for anonymous users by IP
export async function checkAnonymousQuota(ipAddress: string): Promise<{
  allowed: boolean;
  remaining: number;
  requiresLogin: boolean;
  reason?: string;
}> {
  // Anonymous users get 1 free report EVER (then must login)
  const { rateLimitLog } = await import('@shared/schema');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if this IP has used their free report today
  const existing = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rateLimitLog)
    .where(
      and(
        eq(rateLimitLog.ipAddress, ipAddress),
        eq(rateLimitLog.endpoint, 'cleanbi_anonymous'),
        gte(rateLimitLog.windowStart, today)
      )
    );
  
  const used = existing[0]?.count || 0;
  
  if (used >= 1) {
    return {
      allowed: false,
      remaining: 0,
      requiresLogin: true,
      reason: "Create a free account to get more CLEANBI reports"
    };
  }
  
  return {
    allowed: true,
    remaining: 1 - used,
    requiresLogin: false
  };
}

// Track anonymous usage by IP
export async function trackAnonymousUsage(ipAddress: string): Promise<void> {
  const { rateLimitLog } = await import('@shared/schema');
  
  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  await db.insert(rateLimitLog).values({
    ipAddress,
    endpoint: 'cleanbi_anonymous',
    requestCount: 1,
    windowStart,
    expiresAt: new Date(windowStart.getTime() + 24 * 60 * 60 * 1000) // 24 hours
  }).onConflictDoUpdate({
    target: [rateLimitLog.ipAddress, rateLimitLog.endpoint, rateLimitLog.windowStart],
    set: { requestCount: sql`${rateLimitLog.requestCount} + 1` }
  });
}

// ========================================
// SUBSCRIPTION MANAGEMENT
// ========================================

export async function createCLEANBISubscription(
  userId: string,
  tierId: keyof typeof CLEANBI_PRICING_TIERS,
  interval: 'month' | 'year' = 'month'
) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  
  const tier = CLEANBI_PRICING_TIERS[tierId];
  
  if (!tier.stripePriceId) {
    throw new Error('This tier does not support subscriptions');
  }
  
  const priceId = interval === 'year' && 'annualStripePriceId' in tier && tier.annualStripePriceId
    ? tier.annualStripePriceId
    : tier.stripePriceId;
  
  // Get or create Stripe customer
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  let customerId = user.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined, // Convert null to undefined
      metadata: {
        userId: user.id
      }
    });
    customerId = customer.id;
    
    await db.update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId));
  }
  
  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{
      price: priceId
    }],
    metadata: {
      userId,
      tierId,
      interval
    }
  });
  
  // Sync tier to database immediately (webhook will sync again, but this is faster)
  await db.update(users)
    .set({
      cleanbiTier: tierId.toLowerCase(),
      cleanbiSubscriptionId: subscription.id,
      cleanbiSubscriptionStatus: subscription.status
    })
    .where(eq(users.id, userId));
  
  console.log(`✅ CLEANBI subscription created and synced: ${userId} → ${tierId}`);
  
  return subscription;
}

export async function upgradeCLEANBISubscription(
  userId: string,
  newTierId: keyof typeof CLEANBI_PRICING_TIERS
) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  
  if (!user || !user.stripeCustomerId) {
    throw new Error('No active subscription found');
  }
  
  // Get current subscriptions
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId || undefined,
    status: 'active',
    limit: 1
  });
  
  if (subscriptions.data.length === 0) {
    // No active subscription, create new one
    return createCLEANBISubscription(userId, newTierId);
  }
  
  const currentSub = subscriptions.data[0];
  const newTier = CLEANBI_PRICING_TIERS[newTierId];
  
  // Update subscription
  const updated = await stripe.subscriptions.update(currentSub.id, {
    items: [{
      id: currentSub.items.data[0].id,
      price: newTier.stripePriceId || undefined
    }],
    proration_behavior: 'always_invoice',
    metadata: {
      ...currentSub.metadata,
      tierId: newTierId
    }
  });
  
  return updated;
}

// ========================================
// MRR/ARR CALCULATIONS
// ========================================

export async function calculateMRR(): Promise<{
  total: number;
  byTier: Record<string, { count: number; mrr: number }>;
}> {
  if (!stripe) {
    return { total: 0, byTier: {} };
  }
  
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100 // TODO: Paginate for large customer base
  });
  
  let totalMRR = 0;
  const byTier: Record<string, { count: number; mrr: number }> = {};
  
  for (const sub of subscriptions.data) {
    const tierId = sub.metadata.tierId;
    const amount = sub.items.data[0].price.unit_amount || 0;
    const interval = sub.items.data[0].price.recurring?.interval || 'month';
    
    // Normalize to monthly
    const monthlyAmount = interval === 'year' ? amount / 12 : amount;
    const mrr = monthlyAmount / 100; // Convert cents to dollars
    
    totalMRR += mrr;
    
    if (!byTier[tierId]) {
      byTier[tierId] = { count: 0, mrr: 0 };
    }
    
    byTier[tierId].count++;
    byTier[tierId].mrr += mrr;
  }
  
  return { total: totalMRR, byTier };
}

export async function calculateARR(): Promise<number> {
  const { total: mrr } = await calculateMRR();
  return mrr * 12;
}

// ========================================
// EMAIL CAPTURE FOR FREE REPORTS
// ========================================

export async function captureCLEANBILead(email: string, address: string, score: number) {
  // Store in newsletter_subscribers with special tag
  await db.insert(cleanbiUsage).values({
    userId: 'anonymous', // Will be linked when user signs up
    reportType: 'basic',
    timestamp: new Date(),
    month: new Date().toISOString().slice(0, 7),
    metadata: {
      email,
      address,
      score,
      leadSource: 'cleanbi_free_report',
      capturedAt: new Date().toISOString()
    }
  });
  
  // TODO: Send to email marketing (Resend/SendGrid)
  // Welcome email + nurture sequence to paid plan
}

// ========================================
// OVERAGE BILLING
// ========================================

export async function calculateOverageCharges(userId: string, tier: keyof typeof CLEANBI_PRICING_TIERS): Promise<{
  overage: number;
  charge: number;
}> {
  const usage = await getUserUsageThisMonth(userId);
  const tierConfig = CLEANBI_PRICING_TIERS[tier];
  
  // Check if this is an API tier or report tier
  const features = tierConfig.features as any;
  const monthlyLimit = features.reportsPerMonth ?? features.apiCallsPerMonth ?? 0;
  
  if (monthlyLimit === -1) {
    return { overage: 0, charge: 0 };
  }
  
  const limit = monthlyLimit;
  const overage = Math.max(0, usage.total - limit);
  
  // Charge $2 per report over limit
  const chargePerReport = 2.00;
  const charge = overage * chargePerReport;
  
  return { overage, charge };
}
