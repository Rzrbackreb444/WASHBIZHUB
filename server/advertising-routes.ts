import { Router } from "express";
import { db } from "./db";
import { advertisingProducts, sponsors, sponsorships, bookCaseStudies, vendorLicenses } from "@shared/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-10-29.clover" });

// ============================================================================
// ADVERTISING PRODUCTS/PRICING
// ============================================================================

// Get all advertising products
router.get("/products", async (req, res) => {
  try {
    const products = await db.select().from(advertisingProducts).where(eq(advertisingProducts.active, true));
    res.json(products);
  } catch (error) {
    console.error("Error fetching advertising products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get products by category
router.get("/products/:category", async (req, res) => {
  try {
    const products = await db.select()
      .from(advertisingProducts)
      .where(eq(advertisingProducts.category, req.params.category));
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Seed default advertising products
router.post("/products/seed", async (req, res) => {
  try {
    const defaultProducts = [
      // Facebook Group Advertising - 72,000 Members
      {
        name: "Premium Sponsor",
        slug: "fb-premium-sponsor",
        description: "Top-tier visibility in our 72,000+ member laundromat owner Facebook group",
        category: "facebook_group",
        priceMonthly: "1400.00",
        pricingType: "monthly",
        features: JSON.stringify([
          "Featured placement in group feed",
          "Priority response from group admin",
          "Monthly spotlight post",
          "Logo on group cover photo",
          "Direct access to group owner",
          "Exclusive vendor status",
          "Access to 72,000+ laundromat owners & aspiring owners"
        ]),
        popular: true,
        displayOrder: 1
      },
      {
        name: "Vendor Partner Badge",
        slug: "fb-vendor-badge",
        description: "Official vendor partner status with credibility boost to 72,000 members",
        category: "facebook_group",
        priceMonthly: "499.00",
        pricingType: "monthly",
        features: JSON.stringify([
          "Vendor Partner Badge on profile",
          "Access to post promotions",
          "Listed in vendor directory",
          "Group shoutout upon joining",
          "Credibility with 72K decision-makers"
        ]),
        displayOrder: 2
      },
      {
        name: "Featured Post",
        slug: "fb-featured-post",
        description: "Priority placement in the feed with branded Canva template",
        category: "facebook_group",
        priceOneTime: "500.00",
        pricingType: "one_time",
        features: JSON.stringify([
          "Priority feed placement",
          "Branded Canva template",
          "Badge icon + CTA button",
          "24-hour sticky post option",
          "Reach 72,000+ targeted members"
        ]),
        displayOrder: 3
      },
      {
        name: "Logo Placement",
        slug: "fb-logo-placement",
        description: "Your logo on the group cover photo seen by 72,000 members",
        category: "facebook_group",
        priceMonthly: "499.00",
        pricingType: "monthly",
        features: JSON.stringify([
          "Logo on group cover photo",
          "Shoutout in pinned post",
          "Monthly visibility refresh",
          "Seen by every member who visits"
        ]),
        displayOrder: 4
      },
      
      // Website Advertising
      {
        name: "Homepage Banner",
        slug: "website-homepage-banner",
        description: "Premium banner placement on WashBizHub.com homepage",
        category: "website",
        priceMonthly: "799.00",
        pricingType: "monthly",
        features: JSON.stringify([
          "Above-the-fold placement",
          "High visibility to all visitors",
          "Click tracking & analytics",
          "Custom creative support"
        ]),
        popular: true,
        displayOrder: 1
      },
      {
        name: "Sponsored Content",
        slug: "website-sponsored-content",
        description: "SEO-optimized article featuring your business",
        category: "website",
        priceOneTime: "1500.00",
        pricingType: "one_time",
        features: JSON.stringify([
          "2000+ word SEO article",
          "Permanent placement",
          "Backlinks to your site",
          "Social media promotion"
        ]),
        displayOrder: 2
      },
      {
        name: "Vendor Directory Listing",
        slug: "website-vendor-listing",
        description: "Featured listing in the vendor directory",
        category: "website",
        priceMonthly: "199.00",
        pricingType: "monthly",
        features: JSON.stringify([
          "Featured vendor badge",
          "Priority listing",
          "Contact form integration",
          "Review display"
        ]),
        displayOrder: 3
      },
      
      // Book Case Study Features
      {
        name: "Book Case Study - Standard",
        slug: "book-case-study-standard",
        description: "Be featured as a case study in our upcoming laundromat industry book",
        category: "book_feature",
        priceOneTime: "2500.00",
        pricingType: "one_time",
        features: JSON.stringify([
          "1-2 page case study",
          "Your success story told",
          "Business name & photo",
          "Contact info included",
          "Permanent placement in published book"
        ]),
        displayOrder: 1
      },
      {
        name: "Book Case Study - Premium",
        slug: "book-case-study-premium",
        description: "Extended case study with full chapter feature",
        category: "book_feature",
        priceOneTime: "5000.00",
        pricingType: "one_time",
        features: JSON.stringify([
          "Full chapter dedicated to your story",
          "Professional photography session",
          "Video interview included",
          "Multiple photos & graphics",
          "Author introduction",
          "Premium book copies for distribution"
        ]),
        popular: true,
        displayOrder: 2
      },
      
      // Vendor Licensing
      {
        name: "Standard License",
        slug: "vendor-license-standard",
        description: "License your product/service to our 72K+ member network",
        category: "vendor_licensing",
        priceMonthly: "999.00",
        pricingType: "monthly",
        features: JSON.stringify([
          "Access to 72K laundromat owner network",
          "Product listing in marketplace",
          "Lead generation",
          "Monthly performance reports"
        ]),
        displayOrder: 1
      },
      {
        name: "Premium License",
        slug: "vendor-license-premium",
        description: "Enhanced licensing with exclusive territory options",
        category: "vendor_licensing",
        priceMonthly: "2499.00",
        pricingType: "monthly",
        features: JSON.stringify([
          "All Standard features",
          "Territory exclusivity options",
          "Priority lead routing",
          "Co-marketing opportunities",
          "Direct referral program",
          "Quarterly strategy calls"
        ]),
        popular: true,
        displayOrder: 2
      },
      {
        name: "Enterprise License",
        slug: "vendor-license-enterprise",
        description: "Full partnership with custom terms",
        category: "vendor_licensing",
        pricingType: "custom",
        features: JSON.stringify([
          "All Premium features",
          "Custom contract terms",
          "White-label options",
          "API access",
          "Dedicated account manager",
          "Custom integrations"
        ]),
        displayOrder: 3
      }
    ];
    
    for (const product of defaultProducts) {
      await db.insert(advertisingProducts).values(product as any).onConflictDoNothing();
    }
    
    res.json({ success: true, message: "Default products seeded" });
  } catch (error) {
    console.error("Error seeding products:", error);
    res.status(500).json({ error: "Failed to seed products" });
  }
});

// ============================================================================
// SPONSOR REGISTRATION
// ============================================================================

// Register as a sponsor
router.post("/sponsors", async (req, res) => {
  try {
    const { companyName, contactName, email, phone, website, tagline, description } = req.body;
    
    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
      name: companyName,
      metadata: { contactName, phone, website }
    });
    
    const [sponsor] = await db.insert(sponsors).values({
      companyName,
      contactName,
      email,
      phone,
      website,
      tagline,
      description,
      stripeCustomerId: stripeCustomer.id,
      status: "pending"
    }).returning();
    
    res.json(sponsor);
  } catch (error) {
    console.error("Error creating sponsor:", error);
    res.status(500).json({ error: "Failed to create sponsor" });
  }
});

// Get sponsor by ID
router.get("/sponsors/:id", async (req, res) => {
  try {
    const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, req.params.id));
    if (!sponsor) {
      return res.status(404).json({ error: "Sponsor not found" });
    }
    res.json(sponsor);
  } catch (error) {
    console.error("Error fetching sponsor:", error);
    res.status(500).json({ error: "Failed to fetch sponsor" });
  }
});

// ============================================================================
// PAYMENT/CHECKOUT
// ============================================================================

// Create checkout session for advertising product
router.post("/checkout", async (req, res) => {
  try {
    const { productId, sponsorId, billingCycle } = req.body;
    
    // Get product details
    const [product] = await db.select().from(advertisingProducts).where(eq(advertisingProducts.id, productId));
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Get sponsor details
    const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, sponsorId));
    if (!sponsor) {
      return res.status(404).json({ error: "Sponsor not found" });
    }
    
    const isSubscription = product.pricingType === "monthly";
    const amount = isSubscription ? product.priceMonthly : product.priceOneTime;
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: sponsor.stripeCustomerId || undefined,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description || undefined,
          },
          unit_amount: Math.round(parseFloat(amount || "0") * 100),
          ...(isSubscription && { recurring: { interval: "month" } })
        },
        quantity: 1
      }],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${process.env.REPLIT_DEV_DOMAIN || "https://washbizhub.com"}/advertise/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.REPLIT_DEV_DOMAIN || "https://washbizhub.com"}/advertise`,
      metadata: {
        productId,
        sponsorId,
        billingCycle: billingCycle || product.pricingType
      }
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Webhook for Stripe events
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    let event: Stripe.Event;
    
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }
    
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { productId, sponsorId, billingCycle } = session.metadata || {};
        
        if (productId && sponsorId) {
          const [product] = await db.select().from(advertisingProducts).where(eq(advertisingProducts.id, productId));
          
          await db.insert(sponsorships).values({
            sponsorId,
            productId,
            stripeSubscriptionId: session.subscription as string || null,
            stripePaymentIntentId: session.payment_intent as string || null,
            billingCycle: billingCycle || "one_time",
            amount: (session.amount_total || 0) / 100 + "",
            status: "active",
            startDate: new Date(),
          });
          
          // Update sponsor status
          await db.update(sponsors).set({ status: "active" }).where(eq(sponsors.id, sponsorId));
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db.update(sponsorships)
          .set({ status: "cancelled" })
          .where(eq(sponsorships.stripeSubscriptionId, subscription.id));
        break;
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook error" });
  }
});

// ============================================================================
// BOOK CASE STUDIES
// ============================================================================

// Submit case study
router.post("/case-studies", async (req, res) => {
  try {
    const [caseStudy] = await db.insert(bookCaseStudies).values(req.body).returning();
    res.json(caseStudy);
  } catch (error) {
    console.error("Error creating case study:", error);
    res.status(500).json({ error: "Failed to create case study" });
  }
});

// Get case studies
router.get("/case-studies", async (req, res) => {
  try {
    const studies = await db.select().from(bookCaseStudies);
    res.json(studies);
  } catch (error) {
    console.error("Error fetching case studies:", error);
    res.status(500).json({ error: "Failed to fetch case studies" });
  }
});

// ============================================================================
// VENDOR LICENSING
// ============================================================================

// Apply for license
router.post("/licenses", async (req, res) => {
  try {
    const [license] = await db.insert(vendorLicenses).values(req.body).returning();
    res.json(license);
  } catch (error) {
    console.error("Error creating license:", error);
    res.status(500).json({ error: "Failed to create license" });
  }
});

// Get licenses
router.get("/licenses", async (req, res) => {
  try {
    const licenses = await db.select().from(vendorLicenses);
    res.json(licenses);
  } catch (error) {
    console.error("Error fetching licenses:", error);
    res.status(500).json({ error: "Failed to fetch licenses" });
  }
});

export default router;
