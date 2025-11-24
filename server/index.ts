import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerSitemapRoutes } from "./sitemap";
import { setupVite, serveStatic, log } from "./vite";
import Stripe from "stripe";
import { storage } from "./storage";
import { initializeCacheLayer } from "./cleanbi-cache-layer";

const app = express();

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
  apiVersion: "2025-10-29.clover",
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
    }

    // Handle subscription creation - CLEANBI tier sync
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`✅ Subscription created: ${subscription.id} for customer ${subscription.customer}`);
      
      // Sync CLEANBI subscription to database
      await syncCLEANBISubscription(subscription);
    }

    // Handle subscription updates - CLEANBI tier sync
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`✅ Subscription updated: ${subscription.id}, status: ${subscription.status}`);
      
      // Sync CLEANBI subscription changes to database
      await syncCLEANBISubscription(subscription);
    }

    // Handle subscription deletion/cancellation - Revert to FREE tier
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`⚠️  Subscription canceled: ${subscription.id}`);
      
      // Revert CLEANBI tier to FREE
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer.id;
      
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
    }

    // Handle successful subscription payments - Keep subscription active
    if (event.type === "invoice.payment_succeeded") {
      const invoice: any = event.data.object;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      console.log(`✅ Invoice paid: ${invoice.id} for subscription ${subscriptionId || 'none'}`);
      
      if (subscriptionId) {
        // Mark subscription as active (payment succeeded)
        const { db } = await import("./db");
        const { users } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        
        await db.update(users)
          .set({ cleanbiSubscriptionStatus: 'active' })
          .where(eq(users.cleanbiSubscriptionId, subscriptionId));
      }
    }

    // Handle failed subscription payments - Mark as past_due
    if (event.type === "invoice.payment_failed") {
      const invoice: any = event.data.object;
      console.error(`❌ Invoice payment failed: ${invoice.id} for customer ${invoice.customer}`);
      
      const subscriptionId = typeof invoice.subscription === 'string' 
        ? invoice.subscription 
        : invoice.subscription?.id;
      
      if (subscriptionId) {
        // Mark subscription as past_due
        const { db } = await import("./db");
        const { users } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        
        await db.update(users)
          .set({ cleanbiSubscriptionStatus: 'past_due' })
          .where(eq(users.cleanbiSubscriptionId, subscriptionId));
        
        console.log(`⚠️  CLEANBI subscription marked past_due for ${subscriptionId}`);
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
      if (existing.length === 0) {
        log("📦 Seeding website templates...");
        for (const template of laundromatTemplates) {
          await storage.createWebsiteTemplate(template);
        }
        log(`✅ Seeded ${laundromatTemplates.length} templates`);
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
    
    await seedTemplatesIfNeeded();
  });
})();
