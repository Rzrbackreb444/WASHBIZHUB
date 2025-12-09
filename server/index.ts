import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import path from "path";
import { registerRoutes } from "./routes";
import { registerSitemapRoutes } from "./sitemap";
import { registerPosRoutes } from "./pos-routes";
import { registerCustomerPortalRoutes } from "./customer-portal-routes";
import { registerPromoCodeRoutes } from "./promo-code-routes";
import blogRoutes, { adminBlogRoutes } from "./blog-routes";
import feedbackRoutes from "./routes/feedback";
import referralRoutes from "./routes/referrals";
import { setupVite, serveStatic, log } from "./vite";
import Stripe from "stripe";
import { storage } from "./storage";
import { initializeCacheLayer } from "./cleanbi-cache-layer";
import { notifyPurchase, notifySubscriptionEvent } from "./notifications";
import { 
  sendWelcomeEmail, 
  sendUpgradeConfirmationEmail, 
  sendPaymentFailedEmail, 
  sendRefundConfirmationEmail,
  sendCancellationEmail,
  sendTrialEndingEmail 
} from "./subscription-emails";

// Idempotency cache for webhook events (prevents duplicate processing)
// Uses Map with TTL to auto-cleanup old entries
const processedWebhookEvents = new Map<string, number>();
const WEBHOOK_EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isEventProcessed(eventId: string): boolean {
  const processedAt = processedWebhookEvents.get(eventId);
  if (processedAt) {
    // Event was already processed
    console.log(`⚠️ Duplicate webhook event detected: ${eventId} (processed ${Date.now() - processedAt}ms ago)`);
    return true;
  }
  return false;
}

function markEventProcessed(eventId: string): void {
  processedWebhookEvents.set(eventId, Date.now());
  
  // Cleanup old entries periodically (every 100 events)
  if (processedWebhookEvents.size % 100 === 0) {
    const now = Date.now();
    for (const [id, timestamp] of processedWebhookEvents.entries()) {
      if (now - timestamp > WEBHOOK_EVENT_TTL_MS) {
        processedWebhookEvents.delete(id);
      }
    }
    console.log(`🧹 Cleaned up old webhook events. Current cache size: ${processedWebhookEvents.size}`);
  }
}
import { db } from "./db";
import { promoCodes, promoCodeRedemptions, adminActivityLog } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// Activity logging helper
async function logActivity(type: string, description: string, email?: string, metadata?: Record<string, any>) {
  try {
    await db.insert(adminActivityLog).values({
      type,
      description,
      email: email || null,
      metadata: metadata || null,
      tenant: 'washbizhub.com',
    });
  } catch (e: any) {
    console.error('Activity log error:', e.message);
  }
}
import { securityHeaders, sanitizeInput, corsMiddleware, authRateLimiter } from "./security-middleware";

const app = express();

// Enable gzip compression for all responses (major performance boost)
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression's default filter
    return compression.filter(req, res);
  }
}));

// Add caching headers for static assets
app.use((req, res, next) => {
  const url = req.url;
  // JavaScript and CSS files (with content hashes) - aggressive caching
  if (url.match(/\.(js|css)(\?.*)?$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Images and fonts - long cache (30 days)
  else if (url.match(/\.(png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)(\?.*)?$/)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
  next();
});

// Serve attached_assets as static files for real listing images
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets'), {
  maxAge: '30d',
  etag: true,
}));

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// CRITICAL: Stripe webhook MUST use raw body BEFORE global JSON parsing
// This route is registered FIRST to intercept before express.json() middleware
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

// Helper: Sync CLEANBI subscription from Stripe to database
async function syncCLEANBISubscription(subscription: Stripe.Subscription) {
  const { db } = await import("./db");
  const { users } = await import("@shared/schema");
  const { eq } = await import("drizzle-orm");
  const { CLEANBI_PRICING_TIERS } = await import("./cleanbi-subscription-manager");
  
  try {
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id;
    
    // Determine CLEANBI tier from subscription metadata or price ID
    let tier: string | null = subscription.metadata.tierId || null;
    
    // Fallback: Match price ID to tier
    if (!tier) {
      for (const item of subscription.items.data) {
        const priceId = item.price.id;
        
        for (const [tierKey, tierConfig] of Object.entries(CLEANBI_PRICING_TIERS)) {
          if (priceId === tierConfig.stripePriceId || 
              ('annualStripePriceId' in tierConfig && priceId === tierConfig.annualStripePriceId)) {
            tier = tierKey.toLowerCase();
            break;
          }
        }
        
        if (tier) break;
      }
    }
    
    // Only sync if this is a CLEANBI subscription
    if (tier) {
      await db.update(users)
        .set({
          cleanbiTier: tier,
          cleanbiSubscriptionId: subscription.id,
          cleanbiSubscriptionStatus: subscription.status
        })
        .where(eq(users.stripeCustomerId, customerId));
      
      console.log(`✅ CLEANBI tier synced: customer ${customerId} → ${tier.toUpperCase()} (${subscription.status})`);
    }
  } catch (error: any) {
    console.error(`❌ Failed to sync CLEANBI subscription: ${error.message}`);
  }
}

app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  if (!sig) {
    return res.status(400).send("No signature");
  }

  let event;
  try {
    // req.body is now a Buffer because of express.raw()
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ==================== WEBHOOK EVENT HANDLERS ====================
  
  // Idempotency check - prevent duplicate processing of the same event
  if (isEventProcessed(event.id)) {
    console.log(`↩️ Skipping already processed event: ${event.id} (${event.type})`);
    return res.json({ received: true, duplicate: true });
  }
  
  // Mark event as processed immediately to prevent race conditions
  markEventProcessed(event.id);
  
  try {
    // Handle checkout session completion (one-time purchases)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata) {
        return res.status(200).json({ received: true });
      }

      const paymentIntentId = session.payment_intent as string;
      const amountTotal = session.amount_total || 0; // in cents

      // Track promo code redemption if applicable
      if (session.total_details?.breakdown?.discounts && session.total_details.breakdown.discounts.length > 0) {
        try {
          const discount = session.total_details.breakdown.discounts[0];
          const promotionCode = discount.discount?.promotion_code;
          
          if (promotionCode && typeof promotionCode === 'string') {
            // Find our promo code by Stripe promotion code ID
            const [promoCode] = await db.select()
              .from(promoCodes)
              .where(eq(promoCodes.stripePromotionCodeId, promotionCode))
              .limit(1);
            
            if (promoCode) {
              const originalAmount = (session.amount_subtotal || 0);
              const discountAmount = (session.total_details?.amount_discount || 0);
              
              // Record the redemption
              await db.insert(promoCodeRedemptions).values({
                promoCodeId: promoCode.id,
                userId: metadata?.userId || null,
                email: session.customer_email || metadata?.userEmail || 'unknown',
                productType: metadata?.type || 'unknown',
                originalAmount,
                discountAmount,
                finalAmount: amountTotal,
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: paymentIntentId,
              });

              // Increment redemption count
              await db.update(promoCodes)
                .set({ 
                  currentRedemptions: sql`${promoCodes.currentRedemptions} + 1`,
                  updatedAt: new Date(),
                })
                .where(eq(promoCodes.id, promoCode.id));

              console.log(`✅ Promo code ${promoCode.code} redeemed by ${session.customer_email}`);
              
              // Log activity
              await logActivity('promo_redemption', `Promo code ${promoCode.code} redeemed`, session.customer_email || undefined, {
                promoCode: promoCode.code,
                discountAmount: discountAmount / 100,
                originalAmount: originalAmount / 100,
                finalAmount: amountTotal / 100,
              });
            }
          }
        } catch (promoError: any) {
          console.error(`⚠️ Failed to track promo code: ${promoError.message}`);
          // Don't fail the webhook - promo tracking is non-critical
        }
      }

      // Course purchase
      if (metadata.type === "course_purchase") {
        try {
          const existing = await storage.getEnrollment(metadata.userId, metadata.courseId);
          if (existing) {
            console.log(`⚠️  Enrollment already exists for user ${metadata.userId} in course ${metadata.courseId} (idempotent)`);
            return res.json({ received: true });
          }

          await storage.createEnrollment({
            userId: metadata.userId,
            courseId: metadata.courseId,
            stripePaymentId: paymentIntentId,
            currentLessonId: null,
            completedLessons: [],
            lastAccessedAt: null,
          });
          console.log(`✅ Enrollment created for user ${metadata.userId} in course ${metadata.courseId}`);
          
          // Log activity
          await logActivity('purchase', `Course purchased: ${metadata.courseName || 'Course'}`, session.customer_email || metadata.userEmail || undefined, {
            type: 'course',
            courseId: metadata.courseId,
            courseName: metadata.courseName,
            amount: amountTotal / 100,
          });
          
          // Send purchase notification
          await notifyPurchase({
            type: 'course',
            productName: metadata.courseName || 'Course',
            amount: amountTotal,
            customerEmail: session.customer_email || metadata.userEmail,
          });
        } catch (error: any) {
          console.error(`❌ Failed to create enrollment: ${error.message}`);
        }
      }

      // Book purchase
      if (metadata.type === "book_purchase") {
        try {
          const existing = await storage.getUserBookAccess(metadata.userId);
          if (existing) {
            console.log(`⚠️  Book access already exists for user ${metadata.userId} (idempotent)`);
            return res.json({ received: true });
          }

          await storage.createBookAccess({
            userId: metadata.userId,
            stripePaymentId: paymentIntentId,
          });
          console.log(`✅ Book access granted to user ${metadata.userId}`);
          
          // Log activity
          await logActivity('purchase', `Book purchased: ${metadata.bookTitle || 'Laundromat Bible'}`, session.customer_email || metadata.userEmail || undefined, {
            type: 'book',
            bookTitle: metadata.bookTitle,
            amount: amountTotal / 100,
          });
          
          // Send purchase notification
          await notifyPurchase({
            type: 'book',
            productName: metadata.bookTitle || 'Laundromat Bible',
            amount: amountTotal,
            customerEmail: session.customer_email || metadata.userEmail,
          });
        } catch (error: any) {
          console.error(`❌ Failed to grant book access: ${error.message}`);
        }
      }

      // Vendor product purchase - track commission
      if (metadata.type === "product_purchase" && metadata.productId) {
        try {
          const product = await storage.getVendorProduct(metadata.productId);
          if (!product) {
            console.error(`❌ Product ${metadata.productId} not found`);
            return res.json({ received: true });
          }

          const store = await storage.getVendorStore(product.storeId);
          if (!store) {
            console.error(`❌ Store ${product.storeId} not found`);
            return res.json({ received: true });
          }

          // Calculate commission (platform takes 10%, vendor gets 90%)
          const platformCommissionRate = 10; // 10%
          const totalAmount = amountTotal / 100; // convert from cents to dollars
          const platformCommission = totalAmount * (platformCommissionRate / 100);
          const vendorPayout = totalAmount - platformCommission;

          // Update product sales count
          const currentSales = product.sales || 0;
          await storage.updateVendorProduct(metadata.productId, {
            sales: currentSales + 1,
          });

          // TODO: Create commission record and payout tracking in database
          console.log(`✅ Product sale tracked: ${metadata.productId}, Platform: $${platformCommission.toFixed(2)}, Vendor: $${vendorPayout.toFixed(2)}`);
        } catch (error: any) {
          console.error(`❌ Failed to track product sale: ${error.message}`);
        }
      }
      
      // Listing subscription - Premium tier activation
      if (metadata.type === "listing_subscription" && metadata.listingId && metadata.tierId) {
        try {
          const listing = await storage.getListing(metadata.listingId);
          if (!listing) {
            console.error(`❌ Listing ${metadata.listingId} not found`);
            return res.json({ received: true });
          }
          
          // Tier benefit limits
          const tierBenefits: Record<string, { mediaLimit: number; videoLimit: number; featured: boolean; prioritySearch: boolean }> = {
            basic: { mediaLimit: 15, videoLimit: 2, featured: false, prioritySearch: false },
            showcase: { mediaLimit: 30, videoLimit: 5, featured: true, prioritySearch: true },
            diamond: { mediaLimit: 999, videoLimit: 20, featured: true, prioritySearch: true },
          };
          
          const benefits = tierBenefits[metadata.tierId] || tierBenefits.basic;
          const subscriptionId = session.subscription as string;
          
          // Update listing with subscription info
          await storage.updateListing(metadata.listingId, {
            subscriptionTier: metadata.tierId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            mediaLimit: benefits.mediaLimit,
            videoLimit: benefits.videoLimit,
            featured: benefits.featured,
            prioritySearch: benefits.prioritySearch,
          });
          
          console.log(`✅ Listing ${metadata.listingId} upgraded to ${metadata.tierId} tier`);
          
          // Send notification
          await notifyPurchase({
            type: 'subscription',
            productName: `Listing ${metadata.tierId.charAt(0).toUpperCase() + metadata.tierId.slice(1)} Tier`,
            amount: amountTotal,
            interval: 'month',
            customerEmail: session.customer_email || undefined,
          });
        } catch (error: any) {
          console.error(`❌ Failed to activate listing subscription: ${error.message}`);
        }
      }
      
      // Visibility add-on purchase - Trigger fulfillment automation
      if (metadata.type === "visibility_addon" && metadata.listingId && metadata.addOnId) {
        try {
          const { db } = await import("./db");
          const { listings, visibilityOrders, visibilityJobs } = await import("@shared/schema");
          const { eq, and } = await import("drizzle-orm");
          
          const listingId = metadata.listingId;
          const addOnId = metadata.addOnId;
          const addOnSlug = metadata.addOnSlug || '';
          const addOnName = metadata.addOnName || 'Visibility Add-on';
          const durationDays = parseInt(metadata.durationDays || '30');
          
          // Update order status to paid
          const [updatedOrder] = await db.update(visibilityOrders)
            .set({ 
              status: 'paid',
              stripePaymentIntentId: paymentIntentId,
              activatedAt: new Date(),
              expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
            })
            .where(eq(visibilityOrders.stripeCheckoutSessionId, session.id))
            .returning();
          
          if (!updatedOrder) {
            console.error(`❌ Visibility order not found for session ${session.id}`);
            return res.json({ received: true });
          }
          
          console.log(`✅ Visibility order ${updatedOrder.id} marked as paid`);
          
          // Schedule fulfillment jobs based on add-on features
          const jobsToCreate: { jobType: string; orderId: string; listingId: string }[] = [];
          
          if (metadata.includesCarousel === 'true') {
            jobsToCreate.push({ jobType: 'carousel', orderId: updatedOrder.id, listingId });
          }
          if (metadata.includesAutoBlog === 'true') {
            jobsToCreate.push({ jobType: 'auto-blog', orderId: updatedOrder.id, listingId });
          }
          if (metadata.includesIndexNow === 'true') {
            jobsToCreate.push({ jobType: 'index-now', orderId: updatedOrder.id, listingId });
          }
          if (metadata.includesGoogleIndexing === 'true') {
            jobsToCreate.push({ jobType: 'google-indexing', orderId: updatedOrder.id, listingId });
          }
          if (metadata.includesSocialCards === 'true') {
            jobsToCreate.push({ jobType: 'social-cards', orderId: updatedOrder.id, listingId });
          }
          
          // Insert all fulfillment jobs
          if (jobsToCreate.length > 0) {
            await db.insert(visibilityJobs).values(jobsToCreate);
            console.log(`📋 Created ${jobsToCreate.length} visibility fulfillment jobs for order ${updatedOrder.id}`);
          }
          
          // Immediately fulfill carousel (toggle flag) if included
          if (metadata.includesCarousel === 'true') {
            await db.update(listings)
              .set({ 
                carouselFeatured: true,
                featured: true,
                carouselExpiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
              })
              .where(eq(listings.id, listingId));
            console.log(`🎠 Carousel feature enabled for listing ${listingId}`);
          }
          
          // Log activity
          await logActivity('visibility_purchase', `Visibility add-on purchased: ${addOnName}`, session.customer_email || metadata.userEmail || undefined, {
            type: 'visibility_addon',
            addOnId,
            addOnName,
            listingId,
            amount: amountTotal / 100,
            jobsCreated: jobsToCreate.length,
          });
          
          // Send notification
          await notifyPurchase({
            type: 'visibility_addon',
            productName: addOnName,
            amount: amountTotal,
            customerEmail: session.customer_email || metadata.userEmail,
          });
          
          console.log(`✅ Visibility add-on ${addOnName} activated for listing ${listingId}`);
          
          // Trigger async job processing for non-carousel features
          if (jobsToCreate.length > 0) {
            // Process jobs asynchronously (don't await - let webhook complete quickly)
            import("./visibility-automation").then(({ processOrderJobs }) => {
              processOrderJobs(updatedOrder.id).catch((err: Error) => {
                console.error(`❌ Async job processing failed: ${err.message}`);
              });
            });
          }
        } catch (error: any) {
          console.error(`❌ Failed to fulfill visibility add-on: ${error.message}`);
        }
      }
    }

    // Handle subscription creation - CLEANBI tier sync + Welcome Email
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`✅ Subscription created: ${subscription.id} for customer ${subscription.customer}`);
      
      // Sync CLEANBI subscription to database
      await syncCLEANBISubscription(subscription);
      
      // Get subscription amount and product name
      const amount = subscription.items.data[0]?.price?.unit_amount || 0;
      const productName = subscription.metadata?.productName || 
                         subscription.items.data[0]?.price?.nickname || 
                         'Subscription';
      const interval = subscription.items.data[0]?.price?.recurring?.interval || 'month';
      const tier = subscription.metadata?.tierId || 'starter';
      
      // Get customer email - try metadata first, then fetch from Stripe
      let customerEmail = subscription.metadata?.customerEmail;
      let firstName = subscription.metadata?.firstName;
      
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer.id;
      
      // Fallback: Fetch customer data from Stripe if metadata is missing
      if (!customerEmail && customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (!('deleted' in customer)) {
            customerEmail = customer.email || undefined;
            firstName = firstName || customer.name?.split(' ')[0];
            console.log(`📧 Retrieved customer email from Stripe: ${customerEmail}`);
          }
        } catch (e: any) {
          console.error(`⚠️ Could not fetch customer: ${e.message}`);
        }
      }
      
      // Log activity
      await logActivity('subscription_created', `New subscription: ${productName}`, customerEmail || undefined, {
        subscriptionId: subscription.id,
        productName,
        amount: amount / 100,
        interval,
        status: subscription.status,
      });
      
      // Send admin notification
      await notifyPurchase({
        type: 'subscription',
        productName,
        amount,
        interval,
        customerEmail,
      });
      
      // Send welcome email to customer
      if (customerEmail) {
        try {
          await sendWelcomeEmail({
            email: customerEmail,
            firstName,
            tier,
            amount,
            interval,
          });
          console.log(`✅ Welcome email sent to ${customerEmail}`);
        } catch (emailError: any) {
          console.error(`⚠️ Failed to send welcome email: ${emailError.message}`);
        }
      } else {
        console.warn(`⚠️ No customer email available for welcome email - subscription ${subscription.id}`);
      }
    }

    // Handle subscription updates - CLEANBI tier sync + Upgrade Confirmation
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const previousAttributes = (event.data as any).previous_attributes;
      console.log(`✅ Subscription updated: ${subscription.id}, status: ${subscription.status}`);
      
      // Get customer ID for database lookup
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer.id;
      
      // Fetch old tier from database BEFORE syncing (reliable source of truth)
      let oldTierFromDb: string | null = null;
      try {
        const { db } = await import("./db");
        const { users } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        
        const [existingUser] = await db.select({ tier: users.cleanbiTier })
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);
        
        oldTierFromDb = existingUser?.tier || null;
      } catch (e: any) {
        console.error(`⚠️ Could not fetch old tier from DB: ${e.message}`);
      }
      
      // Sync CLEANBI subscription changes to database
      await syncCLEANBISubscription(subscription);
      
      // Get new tier from metadata or derive from price
      const newTier = subscription.metadata?.tierId || 'starter';
      const oldTier = oldTierFromDb || 'free';
      
      // Only proceed if tier actually changed and items/price changed
      const hasItemChange = previousAttributes?.items || previousAttributes?.default_payment_method;
      
      if (hasItemChange && newTier !== oldTier) {
        const amount = subscription.items.data[0]?.price?.unit_amount || 0;
        const interval = subscription.items.data[0]?.price?.recurring?.interval || 'month';
        
        // Get customer email - try metadata first, then fetch from Stripe
        let customerEmail = subscription.metadata?.customerEmail;
        let firstName = subscription.metadata?.firstName;
        
        if (!customerEmail) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (!('deleted' in customer)) {
              customerEmail = customer.email || undefined;
              firstName = customer.name?.split(' ')[0];
            }
          } catch (e: any) {
            console.error(`⚠️ Could not fetch customer: ${e.message}`);
          }
        }
        
        // Only send email if tier actually changed and it's an upgrade
        const tierRanks: Record<string, number> = { free: 0, starter: 1, pro: 2, enterprise: 3 };
        const isUpgrade = (tierRanks[newTier] || 0) > (tierRanks[oldTier] || 0);
        
        if (isUpgrade && customerEmail) {
          try {
            await sendUpgradeConfirmationEmail({
              email: customerEmail,
              firstName,
              oldTier,
              newTier,
              amount,
              interval,
            });
            console.log(`✅ Upgrade confirmation email sent to ${customerEmail}: ${oldTier} → ${newTier}`);
            
            // Log activity
            await logActivity('subscription_upgraded', `Upgrade: ${oldTier} → ${newTier}`, customerEmail, {
              subscriptionId: subscription.id,
              oldTier,
              newTier,
              amount: amount / 100,
            });
          } catch (emailError: any) {
            console.error(`⚠️ Failed to send upgrade email: ${emailError.message}`);
          }
        }
      }
    }

    // Handle subscription deletion/cancellation - Revert to FREE tier + Send Cancellation Email
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`⚠️  Subscription canceled: ${subscription.id}`);
      
      // Get customer ID
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer.id;
      
      // Get customer email - try metadata first, then fetch from Stripe
      let customerEmail = subscription.metadata?.customerEmail;
      let firstName = subscription.metadata?.firstName;
      const tier = subscription.metadata?.tierId || 'starter';
      
      // Fallback: Fetch customer data from Stripe if metadata is missing
      if (!customerEmail && customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (!('deleted' in customer)) {
            customerEmail = customer.email || undefined;
            firstName = firstName || customer.name?.split(' ')[0];
            console.log(`📧 Retrieved customer email from Stripe for cancellation: ${customerEmail}`);
          }
        } catch (e: any) {
          console.error(`⚠️ Could not fetch customer: ${e.message}`);
        }
      }
      
      // Log activity
      await logActivity('subscription_canceled', `Subscription canceled: ${subscription.id}`, customerEmail || undefined, {
        subscriptionId: subscription.id,
        customerId,
        tier,
      });
      
      // Revert CLEANBI tier to FREE
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      await db.update(users)
        .set({
          cleanbiTier: 'free',
          cleanbiSubscriptionId: null,
          cleanbiSubscriptionStatus: 'canceled'
        })
        .where(eq(users.stripeCustomerId, customerId));
      
      console.log(`✅ CLEANBI tier reverted to FREE for customer ${customerId}`);
      
      // Send cancellation email to customer
      if (customerEmail) {
        try {
          // Calculate when access ends (current_period_end)
          const endDate = new Date((subscription as any).current_period_end * 1000);
          
          await sendCancellationEmail({
            email: customerEmail,
            firstName,
            tier,
            endDate,
          });
          console.log(`✅ Cancellation email sent to ${customerEmail}`);
        } catch (emailError: any) {
          console.error(`⚠️ Failed to send cancellation email: ${emailError.message}`);
        }
      } else {
        console.warn(`⚠️ No customer email available for cancellation email - subscription ${subscription.id}`);
      }
    }

    // Handle trial ending notification (sent 3 days before trial ends)
    if (event.type === "customer.subscription.trial_will_end") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`⏰ Trial ending soon: ${subscription.id} for customer ${subscription.customer}`);
      
      try {
        // Sync subscription state
        await syncCLEANBISubscription(subscription);
        
        // Get customer ID
        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;
        
        // Get subscription details
        const tier = subscription.metadata?.tierId || 'starter';
        const amount = subscription.items.data[0]?.price?.unit_amount || 0;
        const interval = subscription.items.data[0]?.price?.recurring?.interval || 'month';
        const trialEndDate = new Date((subscription.trial_end || 0) * 1000);
        
        // Get customer email - try metadata first, then fetch from Stripe
        let customerEmail = subscription.metadata?.customerEmail;
        let firstName = subscription.metadata?.firstName;
        
        if (!customerEmail && customerId) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (!('deleted' in customer)) {
              customerEmail = customer.email || undefined;
              firstName = firstName || customer.name?.split(' ')[0];
              console.log(`📧 Retrieved customer email from Stripe for trial ending: ${customerEmail}`);
            }
          } catch (e: any) {
            console.error(`⚠️ Could not fetch customer for trial ending: ${e.message}`);
          }
        }
        
        // Log activity
        await logActivity('trial_ending', `Trial ending in 3 days: ${tier}`, customerEmail || undefined, {
          subscriptionId: subscription.id,
          customerId,
          tier,
          trialEndDate: trialEndDate.toISOString(),
          amount: amount / 100,
        });
        
        // Send trial ending notification email
        if (customerEmail) {
          try {
            await sendTrialEndingEmail({
              email: customerEmail,
              firstName,
              tier,
              trialEndDate,
              amount,
              interval,
            });
            console.log(`✅ Trial ending email sent to ${customerEmail}`);
            
            // Also send admin notification
            await notifySubscriptionEvent({
              type: 'trial_ending',
              customerEmail,
              tier,
              trialEndDate,
            });
          } catch (emailError: any) {
            console.error(`⚠️ Failed to send trial ending email: ${emailError.message}`);
          }
        } else {
          console.warn(`⚠️ No customer email available for trial ending notification - subscription ${subscription.id}`);
        }
      } catch (error: any) {
        console.error(`❌ Error handling trial_will_end event: ${error.message}`);
      }
    }

    // Handle successful subscription payments - Confirm renewal, log activity
    if (event.type === "invoice.payment_succeeded") {
      const invoice: any = event.data.object;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      console.log(`✅ Invoice paid: ${invoice.id} for subscription ${subscriptionId || 'none'}`);
      
      // Handle CLEANBI subscriptions
      if (subscriptionId) {
        try {
          // Retrieve subscription to sync
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const tier = subscription.metadata?.tierId || 'starter';
          const customerId = typeof subscription.customer === 'string' 
            ? subscription.customer 
            : subscription.customer.id;
          
          // Sync subscription state (sets status to 'active')
          await syncCLEANBISubscription(subscription);
          
          // Get customer email for logging
          let customerEmail = subscription.metadata?.customerEmail;
          if (!customerEmail && customerId) {
            try {
              const customer = await stripe.customers.retrieve(customerId);
              if (!('deleted' in customer)) {
                customerEmail = customer.email || undefined;
              }
            } catch (e: any) {
              console.error(`⚠️ Could not fetch customer email: ${e.message}`);
            }
          }
          
          // Check if this is a renewal (not initial payment)
          const isRenewal = invoice.billing_reason === 'subscription_cycle';
          const amountPaid = (invoice.amount_paid / 100).toFixed(2);
          
          // Log activity for subscription renewal
          await logActivity(
            isRenewal ? 'subscription_renewed' : 'subscription_payment', 
            `${isRenewal ? 'Subscription renewed' : 'Payment succeeded'}: ${tier} - $${amountPaid}`, 
            customerEmail || undefined, 
            {
              subscriptionId,
              customerId,
              tier,
              amount: parseFloat(amountPaid),
              invoiceId: invoice.id,
              billingReason: invoice.billing_reason,
            }
          );
          
          console.log(`✅ ${isRenewal ? 'Subscription renewed' : 'Payment confirmed'} for ${tier} tier - $${amountPaid}`);
        } catch (error: any) {
          console.error(`❌ Error handling invoice.payment_succeeded: ${error.message}`);
        }
      }
      
      // Handle advertising invoices (custom invoices like Benjamin/Londr)
      if (invoice.metadata?.type === "advertising") {
        const customerEmail = invoice.customer_email || 'unknown';
        const companyName = invoice.metadata?.companyName || 'Unknown Company';
        const amountPaid = (invoice.amount_paid / 100).toFixed(2);
        
        console.log(`💰 ADVERTISING INVOICE PAID: $${amountPaid} from ${companyName} (${customerEmail})`);
        
        // Log activity
        await logActivity('advertising_payment', `Advertising payment: $${amountPaid} from ${companyName}`, customerEmail || undefined, {
          companyName,
          amount: parseFloat(amountPaid),
          invoiceId: invoice.id,
        });
        
        // Send SMS notification to owner
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          // Email notification
          await resend.emails.send({
            from: "WashBizHub <notifications@washbizhub.com>",
            to: ["nick@washbizhub.com", "4798834314@txt.att.net"],
            subject: `💰 Advertising Payment: $${amountPaid} from ${companyName}`,
            text: `Invoice paid!\n\nCompany: ${companyName}\nAmount: $${amountPaid}\nEmail: ${customerEmail}\nInvoice ID: ${invoice.id}\n\nView in Stripe Dashboard: https://dashboard.stripe.com/invoices/${invoice.id}`
          });
          
          console.log(`✅ Payment notification sent for ${companyName}`);
        } catch (notifyError: any) {
          console.error(`⚠️ Failed to send payment notification: ${notifyError.message}`);
        }
      }
    }

    // Handle failed subscription payments - Mark at risk, sync state, send warning notification
    if (event.type === "invoice.payment_failed") {
      const invoice: any = event.data.object;
      console.error(`❌ Invoice payment failed: ${invoice.id} for customer ${invoice.customer}`);
      
      const subscriptionId = typeof invoice.subscription === 'string' 
        ? invoice.subscription 
        : invoice.subscription?.id;
      
      if (subscriptionId) {
        try {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const tier = subscription.metadata?.tierId;
          
          // Only process CLEANBI subscription payment failures
          if (!tier) {
            console.log(`⚠️ Invoice ${invoice.id} is not a CLEANBI subscription - skipping payment failed handling`);
            return res.json({ received: true });
          }
          
          // Sync subscription state (will set status to past_due based on Stripe status)
          await syncCLEANBISubscription(subscription);
          console.log(`⚠️ CLEANBI subscription marked at risk (past_due) for ${subscriptionId}`);
          
          // Get customer email - try invoice first, then Stripe customer
          let customerEmail = invoice.customer_email;
          let firstName = subscription.metadata?.firstName;
          
          const customerId = typeof invoice.customer === 'string' 
            ? invoice.customer 
            : invoice.customer?.id;
          
          if (!customerEmail && customerId) {
            try {
              const customer = await stripe.customers.retrieve(customerId);
              if (!('deleted' in customer)) {
                customerEmail = customer.email || undefined;
                firstName = firstName || customer.name?.split(' ')[0];
              }
            } catch (e: any) {
              console.error(`⚠️ Could not fetch customer for payment failed email: ${e.message}`);
            }
          }
          
          const amount = invoice.amount_due || 0;
          const attemptCount = invoice.attempt_count || 1;
          
          // Log activity for payment failure
          await logActivity('payment_failed', `Payment failed for ${tier} subscription (attempt ${attemptCount})`, customerEmail || undefined, {
            subscriptionId,
            customerId,
            tier,
            amount: amount / 100,
            invoiceId: invoice.id,
            attemptCount,
          });
          
          if (customerEmail) {
            // Send warning email to customer
            await sendPaymentFailedEmail({
              email: customerEmail,
              firstName,
              tier,
              amount,
            });
            console.log(`✅ Payment failed warning email sent to ${customerEmail}`);
            
            // Send admin notification for payment failure
            await notifySubscriptionEvent({
              type: 'payment_failed',
              customerEmail,
              tier,
              amount: amount / 100,
              attemptCount,
            });
          } else {
            console.warn(`⚠️ No customer email available for payment failed email - invoice ${invoice.id}`);
          }
        } catch (error: any) {
          console.error(`❌ Error handling invoice.payment_failed: ${error.message}`);
        }
      }
    }

    // Handle refunds - Auto-downgrade user + Send Refund Confirmation
    // Only processes FULL refunds on CLEANBI subscription charges
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const refundAmount = charge.amount_refunded;
      const originalAmount = charge.amount;
      const isFullRefund = refundAmount >= originalAmount;
      
      console.log(`💸 Charge refunded: ${charge.id}, amount: $${(refundAmount / 100).toFixed(2)} (${isFullRefund ? 'FULL' : 'PARTIAL'})`);
      
      // Only process full refunds to avoid accidentally downgrading users with partial refunds
      if (!isFullRefund) {
        console.log(`⚠️ Partial refund detected - not downgrading user. Full amount: $${(originalAmount / 100).toFixed(2)}, Refunded: $${(refundAmount / 100).toFixed(2)}`);
        // Still log activity for partial refunds
        await logActivity('partial_refund', `Partial refund: $${(refundAmount / 100).toFixed(2)} of $${(originalAmount / 100).toFixed(2)}`, charge.billing_details?.email || undefined, {
          chargeId: charge.id,
          refundAmount: refundAmount / 100,
          originalAmount: originalAmount / 100,
        });
        return res.json({ received: true });
      }
      
      // Try to find the subscription associated with this charge
      if (charge.invoice) {
        try {
          const invoiceId = typeof charge.invoice === 'string' ? charge.invoice : charge.invoice.id;
          const invoice = await stripe.invoices.retrieve(invoiceId);
          const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
          
          if (subscriptionId) {
            // Get subscription to find tier info
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const tier = subscription.metadata?.tierId;
            
            // IMPORTANT: Only process if this is a CLEANBI subscription (has tierId in metadata)
            if (!tier) {
              console.log(`⚠️ Charge ${charge.id} is not a CLEANBI subscription refund (no tierId in metadata) - skipping downgrade`);
              return res.json({ received: true });
            }
            
            const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id;
            
            // Get customer email - try multiple sources
            let customerEmail = charge.billing_details?.email || charge.receipt_email;
            let firstName = subscription.metadata?.firstName;
            
            if (!customerEmail && customerId) {
              try {
                const customer = await stripe.customers.retrieve(customerId);
                if (!('deleted' in customer)) {
                  customerEmail = customer.email || undefined;
                  firstName = firstName || customer.name?.split(' ')[0];
                }
              } catch (e: any) {
                console.error(`⚠️ Could not fetch customer for refund email: ${e.message}`);
              }
            }
            
            // Downgrade user to free tier
            if (customerId) {
              const { db } = await import("./db");
              const { users } = await import("@shared/schema");
              const { eq } = await import("drizzle-orm");
              
              await db.update(users)
                .set({
                  cleanbiTier: 'free',
                  cleanbiSubscriptionStatus: 'refunded'
                })
                .where(eq(users.stripeCustomerId, customerId));
              
              console.log(`✅ User ${customerId} downgraded to FREE due to full refund`);
            }
            
            // Send refund confirmation email
            if (customerEmail) {
              await sendRefundConfirmationEmail({
                email: customerEmail,
                firstName,
                tier,
                amount: refundAmount,
              });
              console.log(`✅ Refund confirmation email sent to ${customerEmail}`);
            }
            
            // Log activity
            await logActivity('refund_processed', `Full refund: $${(refundAmount / 100).toFixed(2)} for ${tier}`, customerEmail || undefined, {
              chargeId: charge.id,
              subscriptionId,
              amount: refundAmount / 100,
              tier,
            });
            
            // Notify admin
            await notifyPurchase({
              type: 'refund',
              productName: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Refund`,
              amount: -refundAmount,
              customerEmail,
            });
          }
        } catch (refundError: any) {
          console.error(`⚠️ Error processing refund webhook: ${refundError.message}`);
        }
      }
    }

    // Handle Stripe Connect account updates (for vendors)
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      console.log(`✅ Stripe Connect account updated: ${account.id}, charges_enabled: ${account.charges_enabled}`);
      // TODO: Update vendor store verification status if charges_enabled
    }

    // Handle successful payouts to vendors
    if (event.type === "payout.paid") {
      const payout = event.data.object as Stripe.Payout;
      console.log(`✅ Payout successful: ${payout.id}, amount: $${(payout.amount / 100).toFixed(2)}`);
      // TODO: Update payout status in database
    }

    // Handle failed payouts to vendors
    if (event.type === "payout.failed") {
      const payout = event.data.object as Stripe.Payout;
      console.error(`❌ Payout failed: ${payout.id}, status: ${payout.status}`);
      // TODO: Alert vendor, update payout status
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`❌ Webhook handler error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Now apply global JSON parsing for all other routes
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Security middleware - Headers, CORS, Input Sanitization
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(sanitizeInput);

// Rate limit authentication endpoints
app.use('/api/auth', authRateLimiter);
app.use('/api/login', authRateLimiter);
app.use('/api/register', authRateLimiter);

// CORS for Chrome Extension - Allow CLEANBI API calls from Google Maps, LoopNet, BizBuySell
app.use('/api/cleanbi/auto', (req, res, next) => {
  const allowedOrigins = [
    'https://www.google.com',
    'https://maps.google.com',
    'https://www.loopnet.com',
    'https://www.bizbuysell.com',
    'chrome-extension://' // Chrome extension context
  ];
  
  const origin = req.headers.origin || '';
  if (allowedOrigins.some(allowed => origin.startsWith(allowed)) || origin.startsWith('chrome-extension://')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  registerSitemapRoutes(app);
  registerPosRoutes(app);
  registerCustomerPortalRoutes(app);
  registerPromoCodeRoutes(app);
  blogRoutes(app);
  adminBlogRoutes(app);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/referrals', referralRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Seed website templates if needed
  async function seedTemplatesIfNeeded() {
    try {
      const { laundromatTemplates } = await import("./seed-templates.js");
      const existing = await storage.getWebsiteTemplates();
      const existingNames = new Set(existing.map(t => t.name));
      
      // Find templates that don't exist yet
      const newTemplates = laundromatTemplates.filter(t => !existingNames.has(t.name));
      
      if (newTemplates.length > 0) {
        log(`📦 Seeding ${newTemplates.length} new website templates...`);
        for (const template of newTemplates) {
          await storage.createWebsiteTemplate(template);
        }
        log(`✅ Seeded ${newTemplates.length} new templates (total: ${existing.length + newTemplates.length})`);
      } else {
        log(`✅ ${existing.length} templates already in database`);
      }
    } catch (error: any) {
      console.error("⚠️  Error seeding templates:", error.message);
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Initialize CLEANBI infrastructure
    const { runDatabaseMigrations } = await import('./db-migrations');
    await runDatabaseMigrations(); // Ensure critical tables exist
    
    const { initializeRedis } = await import('./redis-connection');
    await initializeRedis(); // Redis connection (with graceful fallback)
    
    await initializeCacheLayer(); // Cache layer (uses Redis if available)
    
    // Seed tenants (WashBizHub, StrokeRecoveryAcademy, HawgWash)
    const { seedTenants } = await import('./seed-tenants');
    await seedTenants();
    
    // Seed real laundromat listings (5 verified real listings)
    const { seedRealListings } = await import('./seed-real-listings');
    await seedRealListings();
    
    await seedTemplatesIfNeeded();
  });
})();
