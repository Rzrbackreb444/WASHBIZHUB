// ========================================
// CLEANBI SUBSCRIPTION & USAGE MANAGER
// Maximizes MRR/ARR through tiered pricing
// ========================================

import { db } from "./db";
import { users } from "@shared/schema";
import { cleanbiUsage } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-10-29.clover" })
  : null;

// ========================================
// HELPER: Get User's CLEANBI Tier
// ========================================

/**
 * Get user's CLEANBI subscription tier
 * MVP: Uses aiConsultantTier field, defaults to FREE
 * Production TODO: Add dedicated cleanbiTier field to users table
 */
export async function getUserCLEANBITier(userId: string): Promise<keyof typeof CLEANBI_PRICING_TIERS> {
  try {
    const [user] = await db.select({ tier: users.aiConsultantTier })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user || !user.tier) {
      return 'FREE';
    }
    
    // Map aiConsultantTier values to CLEANBI tiers
    const tierMap: Record<string, keyof typeof CLEANBI_PRICING_TIERS> = {
      'free': 'FREE',
      'pro': 'PRO',
      'enterprise': 'ENTERPRISE',
      'white_label': 'WHITE_LABEL',
      'api_basic': 'API_BASIC',
      'api_pro': 'API_PRO',
      'api_enterprise': 'API_ENTERPRISE'
    };
    
    return tierMap[user.tier.toLowerCase()] || 'FREE';
  } catch (error) {
    console.error('Error loading user CLEANBI tier:', error);
    return 'FREE'; // Safe default
  }
}

// ========================================
// PRICING TIERS
// ========================================

export const CLEANBI_PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: {
      reportsPerMonth: 3,
      basicScore: true,
      detailedBreakdown: false,
      pdfExport: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      bulkReports: false
    },
    stripeProductId: null,
    stripePriceId: null
  },
  
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: {
      reportsPerMonth: 50,
      basicScore: true,
      detailedBreakdown: true,
      pdfExport: true,
      apiAccess: false,
      prioritySupport: true,
      whiteLabel: false,
      bulkReports: false
    },
    stripeProductId: 'prod_cleanbi_pro',
    stripePriceId: 'price_cleanbi_pro_monthly',
    annualPrice: 290, // 2 months free
    annualStripePriceId: 'price_cleanbi_pro_annual'
  },
  
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    interval: 'month',
    features: {
      reportsPerMonth: -1, // Unlimited
      basicScore: true,
      detailedBreakdown: true,
      pdfExport: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: false,
      bulkReports: true
    },
    stripeProductId: 'prod_cleanbi_enterprise',
    stripePriceId: 'price_cleanbi_enterprise_monthly',
    annualPrice: 1490, // 2 months free
    annualStripePriceId: 'price_cleanbi_enterprise_annual'
  },
  
  WHITE_LABEL: {
    id: 'white_label',
    name: 'White Label',
    price: 999,
    interval: 'month',
    features: {
      reportsPerMonth: -1, // Unlimited
      basicScore: true,
      detailedBreakdown: true,
      pdfExport: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: true,
      bulkReports: true
    },
    stripeProductId: 'prod_cleanbi_whitelabel',
    stripePriceId: 'price_cleanbi_whitelabel_monthly',
    annualPrice: 9990, // 2 months free
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
  remaining: number;
  limit: number;
  requiresUpgrade: boolean;
}> {
  const tierConfig = CLEANBI_PRICING_TIERS[tier];
  const usage = await getUserUsageThisMonth(userId);
  
  // Check if this is an API tier (has apiCallsPerMonth instead of reportsPerMonth)
  const features = tierConfig.features as any;
  const monthlyLimit = features.reportsPerMonth ?? features.apiCallsPerMonth ?? 0;
  
  // Unlimited plans
  if (monthlyLimit === -1) {
    return {
      allowed: true,
      remaining: -1, // Unlimited
      limit: -1,
      requiresUpgrade: false
    };
  }
  
  const limit = monthlyLimit;
  const remaining = Math.max(0, limit - usage.total);
  const allowed = usage.total < limit;
  
  return {
    allowed,
    remaining,
    limit,
    requiresUpgrade: !allowed
  };
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
  
  const priceId = interval === 'year' && tier.annualStripePriceId
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
      price: newTier.stripePriceId
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
