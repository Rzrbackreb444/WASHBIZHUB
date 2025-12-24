import { Router, Request, Response } from "express";
import { getUserEntitlements, checkFeatureAccess } from "../entitlements";
import Stripe from "stripe";

const router = Router();

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn("[Entitlements] STRIPE_SECRET_KEY not configured - payment features disabled");
    return null;
  }
  return new Stripe(key, { apiVersion: "2025-04-30.basil" });
}

router.get("/me", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.json({
        tier: "free",
        isOwner: false,
        isPro: false,
        isEnterprise: false,
        authenticated: false,
        features: {
          mediaStudio: false,
          backgroundRemoval: false,
          aiEditing: false,
          logoGeneration: false,
          bookStudio: false,
          contentEditor: false,
          realTimeCollab: false,
          consultations: false,
          unlimitedAiMessages: false,
        },
        limits: {
          aiMessagesPerMonth: 0,
          aiMessagesUsed: 0,
          backgroundRemovalsPerMonth: 0,
          backgroundRemovalsUsed: 0,
        },
      });
    }
    
    const entitlements = await getUserEntitlements(user.id, user.email);
    res.json({ ...entitlements, authenticated: true });
  } catch (error: any) {
    console.error("[Entitlements] Error fetching entitlements:", error);
    res.status(500).json({ error: "Failed to fetch entitlements" });
  }
});

router.get("/check/:feature", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const feature = req.params.feature as any;
    
    if (!user) {
      return res.json({ allowed: false, reason: "Authentication required" });
    }
    
    const result = await checkFeatureAccess(user.id, user.email, feature);
    res.json(result);
  } catch (error: any) {
    console.error("[Entitlements] Error checking feature:", error);
    res.status(500).json({ error: "Failed to check feature access" });
  }
});

router.post("/create-checkout", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing not available" });
    }
    
    const { tier, successUrl, cancelUrl } = req.body;
    
    const prices: Record<string, { monthly: number; name: string }> = {
      pro: { monthly: 2900, name: "Pro" },
      enterprise: { monthly: 9900, name: "Enterprise" },
    };
    
    const priceInfo = prices[tier];
    if (!priceInfo) {
      return res.status(400).json({ error: "Invalid tier" });
    }
    
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Larry's Content Empire - ${priceInfo.name}`,
            description: tier === "pro" 
              ? "AI Media Studio, Book Studio, Content Editor, 500 AI messages/month"
              : "Everything in Pro + Real-time Collaboration, Unlimited AI, Priority Support",
          },
          unit_amount: priceInfo.monthly,
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      success_url: successUrl || `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/pricing`,
      metadata: {
        userId: user.id,
        tier,
      },
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("[Entitlements] Checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.get("/pricing", async (req: Request, res: Response) => {
  res.json({
    tiers: [
      {
        id: "free",
        name: "Free",
        price: 0,
        features: [
          "10 AI messages per month",
          "Basic calculators",
          "Marketplace access",
        ],
        limits: {
          aiMessages: 10,
          backgroundRemovals: 0,
        },
      },
      {
        id: "pro",
        name: "Pro",
        price: 29,
        features: [
          "AI Media Studio (background removal, filters, upscaling)",
          "Book Studio with AI illustrations",
          "Content Editor with embeds",
          "500 AI messages per month",
          "50 background removals per month",
          "Priority support",
        ],
        limits: {
          aiMessages: 500,
          backgroundRemovals: 50,
        },
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 99,
        features: [
          "Everything in Pro",
          "Real-time collaboration",
          "AI Logo Generation",
          "Unlimited AI messages",
          "500 background removals per month",
          "Dedicated support",
          "Custom integrations",
        ],
        limits: {
          aiMessages: 999999,
          backgroundRemovals: 500,
        },
      },
    ],
  });
});

export function registerEntitlementRoutes(app: any) {
  app.use("/api/entitlements", router);
  console.log("✅ Entitlements routes registered");
}

export default router;
