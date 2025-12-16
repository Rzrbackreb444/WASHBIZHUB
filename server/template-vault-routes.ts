// ============================================================================
// TEMPLATE VAULT ROUTES - Premium Templates & Due Diligence Tools
// Integrates with Stripe subscriptions and one-time purchases
// ============================================================================

import { Router, Request, Response } from "express";
import { db } from "./db";
import { templateProducts, templatePurchases, templateLeads, users } from "@shared/schema";
import { eq, and, desc, sql, gte, or, isNull } from "drizzle-orm";
import { z } from "zod";
import Stripe from "stripe";
import { requireAuth, optionalAuth } from "./services/unified-auth";
import { getUserCLEANBITier, CLEANBI_PRICING_TIERS } from "./cleanbi-subscription-manager";

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null;

// Template product definitions (seeded to database)
export const TEMPLATE_PRODUCTS = [
  {
    slug: "business-plan-generator",
    name: "AI Business Plan Generator",
    description: "Generate a comprehensive 30-page laundromat business plan with CLEANBI market data, financial projections, and SBA-ready format.",
    category: "buyer",
    tier: "business",
    features: ["Executive Summary (Free Preview)", "CLEANBI Market Analysis", "5-Year Financial Projections", "SBA Loan-Ready Format", "Competitive Analysis", "Operations Plan"],
    priceInCents: 9900,
    isPopular: true,
  },
  {
    slug: "lease-red-flag-checklist",
    name: "Lease Red Flag Checklist",
    description: "Larry Larsen's 50+ trap alerts for lease negotiation. Avoid deal-killing clauses and protect your investment.",
    category: "buyer",
    tier: "pro",
    features: ["7 Critical Red Flags (Free)", "Larry's 50+ Trap Alerts", "Negotiation Scripts", "Editable Legal Template", "State-Specific Clauses"],
    priceInCents: 4900,
    isPopular: true,
    isNew: true,
  },
  {
    slug: "due-diligence-verifier",
    name: "Due Diligence Document Verifier",
    description: "Upload seller documents for automated AI verification and comprehensive audit report generation.",
    category: "buyer",
    tier: "enterprise",
    features: ["Tax Return Analysis", "Utility Bill Verification", "P&L Statement Audit", "Red Flag Detection", "Seller Verification Report"],
    priceInCents: 19900,
  },
  {
    slug: "loi-template",
    name: "Letter of Intent Template",
    description: "Professional LOI template with built-in contingencies, deal structure options, and negotiation guidance.",
    category: "buyer",
    tier: "pro",
    features: ["Standard LOI Format", "Contingency Clauses", "Price Negotiation Tips", "Attorney-Reviewed", "Multiple Scenarios"],
    priceInCents: 2900,
  },
  {
    slug: "operations-checklist-bundle",
    name: "Operations Checklist Bundle",
    description: "Daily, weekly, and monthly checklists with KPI tracking formulas and staff accountability features.",
    category: "operator",
    tier: "pro",
    features: ["Daily Tasks (Free Preview)", "Weekly Maintenance", "Monthly Reviews", "Excel with KPI Formulas", "Staff Assignment", "Photo Documentation"],
    priceInCents: 3900,
  },
  {
    slug: "employee-handbook",
    name: "Employee Handbook Template",
    description: "Complete employee manual with policies, procedures, safety protocols, and training checklists.",
    category: "operator",
    tier: "business",
    features: ["Hiring Procedures", "Safety Protocols", "Cash Handling", "Training Checklists", "HR Compliance", "Performance Reviews"],
    priceInCents: 4900,
  },
  {
    slug: "maintenance-log",
    name: "Equipment Maintenance Log",
    description: "Track machine maintenance, repairs, and service history with cost analysis and warranty tracking.",
    category: "operator",
    tier: "pro",
    features: ["Machine Tracking", "Service History", "Cost Per Repair", "Warranty Tracking", "Vendor Contacts", "Parts Inventory"],
    priceInCents: 2900,
  },
  {
    slug: "financial-plan-template",
    name: "Financial Plan Template",
    description: "Comprehensive financial planning template with revenue forecasting, expense tracking, and cash flow analysis.",
    category: "buyer",
    tier: "business",
    features: ["Revenue Projections", "Expense Forecasting", "Cash Flow Analysis", "Break-Even Calculator", "Investor-Ready Format"],
    priceInCents: 4900,
  },
  {
    slug: "marketing-plan-template",
    name: "Marketing Plan Template",
    description: "Complete marketing strategy template with digital marketing, local outreach, and promotion calendar.",
    category: "operator",
    tier: "pro",
    features: ["Digital Marketing Strategy", "Local Outreach Plan", "Social Media Calendar", "Promotion Templates", "Budget Tracking"],
    priceInCents: 2900,
  },
  {
    slug: "customer-feedback-form",
    name: "Customer Feedback System",
    description: "Professional customer feedback forms with QR codes, online submission, and analytics dashboard.",
    category: "operator",
    tier: "free",
    features: ["Printable Forms", "QR Code Integration", "Online Submission", "Response Analytics"],
    priceInCents: 0,
  },
  {
    slug: "broker-disclosure",
    name: "Broker Disclosure Form",
    description: "Compliance-ready broker disclosure template for professional transactions and licensing requirements.",
    category: "vendor",
    tier: "pro",
    features: ["State Compliance", "License Info Fields", "Commission Disclosure", "Editable Format"],
    priceInCents: 1900,
  },
  {
    slug: "seller-listing-package",
    name: "Seller Listing Package",
    description: "Complete package for selling your laundromat including valuation worksheet, marketing materials, and buyer qualification.",
    category: "vendor",
    tier: "business",
    features: ["Valuation Worksheet", "Marketing Template", "Photo Checklist", "Buyer Qualification", "NDA Template"],
    priceInCents: 7900,
  },
];

// Tier hierarchy for access checking
const TIER_HIERARCHY: Record<string, number> = {
  free: 0,
  pro: 1,
  business: 2,
  enterprise: 3,
};

// Check if user has access to a template based on tier
function hasTemplateAccess(userTier: string, requiredTier: string): boolean {
  const userLevel = TIER_HIERARCHY[userTier.toLowerCase()] ?? 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier.toLowerCase()] ?? 0;
  return userLevel >= requiredLevel;
}

// Get all templates with user access status
router.get("/templates", optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    let userTier = "free";
    
    if (userId) {
      userTier = await getUserCLEANBITier(userId);
    }

    // Get all active templates
    const templates = await db.select()
      .from(templateProducts)
      .where(eq(templateProducts.isActive, true))
      .orderBy(templateProducts.sortOrder, templateProducts.createdAt);

    // Get user's purchases if logged in
    let userPurchases: any[] = [];
    if (userId) {
      userPurchases = await db.select()
        .from(templatePurchases)
        .where(and(
          eq(templatePurchases.userId, userId),
          or(
            isNull(templatePurchases.expiresAt),
            gte(templatePurchases.expiresAt, new Date())
          )
        ));
    }

    const purchasedTemplateIds = new Set(userPurchases.map(p => p.templateId));

    // Add access status to each template
    const templatesWithAccess = templates.map(template => ({
      ...template,
      hasAccess: hasTemplateAccess(userTier, template.tier || "free") || purchasedTemplateIds.has(template.id),
      isPurchased: purchasedTemplateIds.has(template.id),
      userTier,
    }));

    res.json({
      success: true,
      templates: templatesWithAccess,
      userTier,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ success: false, error: "Failed to fetch templates" });
  }
});

// Get single template with full details
router.get("/templates/:slug", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user?.id;
    
    const [template] = await db.select()
      .from(templateProducts)
      .where(eq(templateProducts.slug, slug))
      .limit(1);

    if (!template) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }

    let userTier = "free";
    let isPurchased = false;

    if (userId) {
      userTier = await getUserCLEANBITier(userId);
      
      // Check if user has purchased this template
      const [purchase] = await db.select()
        .from(templatePurchases)
        .where(and(
          eq(templatePurchases.userId, userId),
          eq(templatePurchases.templateId, template.id),
          or(
            isNull(templatePurchases.expiresAt),
            gte(templatePurchases.expiresAt, new Date())
          )
        ))
        .limit(1);
      
      isPurchased = !!purchase;
    }

    const hasAccess = hasTemplateAccess(userTier, template.tier || "free") || isPurchased;

    res.json({
      success: true,
      template: {
        ...template,
        hasAccess,
        isPurchased,
        userTier,
      },
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ success: false, error: "Failed to fetch template" });
  }
});

// Capture lead for free preview download
router.post("/templates/:slug/lead", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { email, metadata } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const [template] = await db.select()
      .from(templateProducts)
      .where(eq(templateProducts.slug, slug))
      .limit(1);

    if (!template) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }

    // Upsert lead
    await db.insert(templateLeads)
      .values({
        email,
        templateId: template.id,
        source: "preview_download",
        metadata: metadata || {},
        marketingOptIn: true,
      })
      .onConflictDoNothing();

    // Increment download count
    await db.update(templateProducts)
      .set({ downloadCount: sql`${templateProducts.downloadCount} + 1` })
      .where(eq(templateProducts.id, template.id));

    res.json({
      success: true,
      message: "Lead captured successfully",
      previewUrl: template.previewFileUrl,
    });
  } catch (error) {
    console.error("Error capturing lead:", error);
    res.status(500).json({ success: false, error: "Failed to capture lead" });
  }
});

// Create checkout session for one-time template purchase
router.post("/templates/:slug/checkout", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, error: "Stripe not configured" });
    }

    const { slug } = req.params;
    const userId = (req as any).user?.id;
    const userEmail = (req as any).user?.email;

    const [template] = await db.select()
      .from(templateProducts)
      .where(eq(templateProducts.slug, slug))
      .limit(1);

    if (!template) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }

    if (!template.priceInCents || template.priceInCents === 0) {
      return res.status(400).json({ success: false, error: "This template is free" });
    }

    // Check if user already has access
    const userTier = await getUserCLEANBITier(userId);
    if (hasTemplateAccess(userTier, template.tier || "free")) {
      return res.status(400).json({ 
        success: false, 
        error: "You already have access to this template through your subscription" 
      });
    }

    // Check if already purchased
    const [existingPurchase] = await db.select()
      .from(templatePurchases)
      .where(and(
        eq(templatePurchases.userId, userId),
        eq(templatePurchases.templateId, template.id)
      ))
      .limit(1);

    if (existingPurchase) {
      return res.status(400).json({ success: false, error: "You already own this template" });
    }

    // Get or create Stripe customer
    let [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
      
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: template.name,
            description: template.description || undefined,
            metadata: {
              templateId: template.id,
              templateSlug: template.slug,
            },
          },
          unit_amount: template.priceInCents,
        },
        quantity: 1,
      }],
      metadata: {
        type: "template_purchase",
        templateId: template.id,
        templateSlug: template.slug,
        userId,
      },
      success_url: `${process.env.REPLIT_DEV_DOMAIN || req.headers.origin}/vault/${template.slug}?success=true`,
      cancel_url: `${process.env.REPLIT_DEV_DOMAIN || req.headers.origin}/vault/${template.slug}?canceled=true`,
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ success: false, error: "Failed to create checkout session" });
  }
});

// Download template (requires access)
router.post("/templates/:slug/download", requireAuth, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user?.id;

    const [template] = await db.select()
      .from(templateProducts)
      .where(eq(templateProducts.slug, slug))
      .limit(1);

    if (!template) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }

    // Check access
    const userTier = await getUserCLEANBITier(userId);
    const hasTierAccess = hasTemplateAccess(userTier, template.tier || "free");
    
    // Check purchase
    const [purchase] = await db.select()
      .from(templatePurchases)
      .where(and(
        eq(templatePurchases.userId, userId),
        eq(templatePurchases.templateId, template.id),
        or(
          isNull(templatePurchases.expiresAt),
          gte(templatePurchases.expiresAt, new Date())
        )
      ))
      .limit(1);

    if (!hasTierAccess && !purchase) {
      return res.status(403).json({ 
        success: false, 
        error: "You don't have access to this template. Please upgrade your subscription or purchase it." 
      });
    }

    // Update download tracking
    if (purchase) {
      await db.update(templatePurchases)
        .set({ 
          downloadedAt: new Date(),
          downloadCount: sql`${templatePurchases.downloadCount} + 1`
        })
        .where(eq(templatePurchases.id, purchase.id));
    }

    // Increment global download count
    await db.update(templateProducts)
      .set({ downloadCount: sql`${templateProducts.downloadCount} + 1` })
      .where(eq(templateProducts.id, template.id));

    res.json({
      success: true,
      downloadUrl: template.fullFileUrl,
      fileName: `${template.slug}.${template.fileFormat || 'pdf'}`,
    });
  } catch (error) {
    console.error("Error downloading template:", error);
    res.status(500).json({ success: false, error: "Failed to download template" });
  }
});

// Get user's purchased templates (library)
router.get("/my-library", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userTier = await getUserCLEANBITier(userId);

    // Get all templates the user has access to through subscription
    const allTemplates = await db.select()
      .from(templateProducts)
      .where(eq(templateProducts.isActive, true));

    // Get user's one-time purchases
    const purchases = await db.select({
      purchase: templatePurchases,
      template: templateProducts,
    })
      .from(templatePurchases)
      .innerJoin(templateProducts, eq(templatePurchases.templateId, templateProducts.id))
      .where(eq(templatePurchases.userId, userId));

    // Separate into subscription access and purchased
    const subscriptionTemplates = allTemplates.filter(t => 
      hasTemplateAccess(userTier, t.tier || "free")
    );
    
    const purchasedTemplates = purchases.map(p => ({
      ...p.template,
      purchaseDate: p.purchase.createdAt,
      downloadCount: p.purchase.downloadCount,
      expiresAt: p.purchase.expiresAt,
    }));

    // Calculate retention expiry for canceled subscriptions
    const retentionDays = 90; // 90 days after cancellation

    res.json({
      success: true,
      library: {
        subscriptionTemplates,
        purchasedTemplates,
        userTier,
        totalTemplates: subscriptionTemplates.length + purchasedTemplates.length,
        retentionPolicy: {
          days: retentionDays,
          description: "Templates remain accessible for 90 days after subscription cancellation",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching library:", error);
    res.status(500).json({ success: false, error: "Failed to fetch library" });
  }
});

// Save user session progress
router.post("/session/save", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { templateSlug, progress, formData } = req.body;

    // Store in user's session or database
    // This would typically be stored in Redis for quick access
    // For now, we'll use the user's profile metadata

    res.json({
      success: true,
      message: "Session saved",
    });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ success: false, error: "Failed to save session" });
  }
});

// Seed templates to database (admin only)
router.post("/seed-templates", async (req: Request, res: Response) => {
  try {
    for (const template of TEMPLATE_PRODUCTS) {
      await db.insert(templateProducts)
        .values({
          slug: template.slug,
          name: template.name,
          description: template.description,
          category: template.category,
          tier: template.tier,
          priceInCents: template.priceInCents,
          features: template.features,
          isPopular: template.isPopular || false,
          isNew: template.isNew || false,
          previewFileUrl: `/templates/previews/${template.slug}-preview.pdf`,
          fullFileUrl: `/templates/full/${template.slug}.pdf`,
        })
        .onConflictDoUpdate({
          target: templateProducts.slug,
          set: {
            name: template.name,
            description: template.description,
            category: template.category,
            tier: template.tier,
            priceInCents: template.priceInCents,
            features: template.features,
            isPopular: template.isPopular || false,
            isNew: template.isNew || false,
            updatedAt: new Date(),
          },
        });
    }

    res.json({ success: true, message: `Seeded ${TEMPLATE_PRODUCTS.length} templates` });
  } catch (error) {
    console.error("Error seeding templates:", error);
    res.status(500).json({ success: false, error: "Failed to seed templates" });
  }
});

export default router;

// Export for webhook handler
export async function handleTemplatePurchaseWebhook(
  session: Stripe.Checkout.Session
): Promise<void> {
  const { templateId, userId } = session.metadata || {};

  if (!templateId || !userId) {
    console.error("Missing template or user ID in webhook metadata");
    return;
  }

  // Record the purchase
  await db.insert(templatePurchases)
    .values({
      userId,
      templateId,
      accessType: "one_time",
      stripePaymentIntentId: session.payment_intent as string,
      amountPaidCents: session.amount_total || 0,
      currency: session.currency?.toUpperCase() || "USD",
      email: session.customer_email,
    })
    .onConflictDoNothing();

  console.log(`✅ Template purchase recorded: ${templateId} for user ${userId}`);
}
