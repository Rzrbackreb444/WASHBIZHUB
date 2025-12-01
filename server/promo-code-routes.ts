import { Express } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { db } from "./db";
import { promoCodes, promoCodeRedemptions } from "@shared/schema";
import { eq, and, gte, lte, isNull, or, sql } from "drizzle-orm";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null;

const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(50).transform(s => s.toUpperCase().replace(/\s+/g, '')),
  description: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]),
  discountAmount: z.number().min(1),
  maxRedemptions: z.number().min(1).optional(),
  maxRedemptionsPerUser: z.number().min(1).default(1),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  applicableProducts: z.array(z.string()).optional(),
  syncToStripe: z.boolean().default(true),
});

const validatePromoCodeSchema = z.object({
  code: z.string().min(1),
  productType: z.string().optional(),
  email: z.string().email().optional(),
});

export function registerPromoCodeRoutes(app: Express) {
  
  // ==================== ADMIN: CREATE PROMO CODE ====================
  app.post("/api/admin/promo-codes", async (req: any, res) => {
    try {
      const isAdmin = req.user?.claims?.isAdmin || req.user?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const data = createPromoCodeSchema.parse(req.body);
      
      const existing = await db.select().from(promoCodes).where(eq(promoCodes.code, data.code)).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Promo code already exists" });
      }

      let stripeCouponId: string | undefined;
      let stripePromotionCodeId: string | undefined;

      if (data.syncToStripe && stripe) {
        try {
          const coupon = await stripe.coupons.create({
            ...(data.discountType === "percent" 
              ? { percent_off: data.discountAmount }
              : { amount_off: data.discountAmount, currency: "usd" }
            ),
            duration: "once",
            max_redemptions: data.maxRedemptions || undefined,
            redeem_by: data.expiresAt ? Math.floor(new Date(data.expiresAt).getTime() / 1000) : undefined,
            metadata: { source: "washbizhub", code: data.code },
          });
          stripeCouponId = coupon.id;

          const promotionCode = await stripe.promotionCodes.create({
            coupon: coupon.id,
            code: data.code,
            max_redemptions: data.maxRedemptions || undefined,
            expires_at: data.expiresAt ? Math.floor(new Date(data.expiresAt).getTime() / 1000) : undefined,
            metadata: { source: "washbizhub" },
          });
          stripePromotionCodeId = promotionCode.id;

          console.log(`✅ Created Stripe coupon ${coupon.id} and promo code ${promotionCode.id}`);
        } catch (stripeError: any) {
          console.error("Stripe promo code creation error:", stripeError.message);
        }
      }

      const [promoCode] = await db.insert(promoCodes).values({
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountAmount: data.discountAmount,
        stripeCouponId,
        stripePromotionCodeId,
        maxRedemptions: data.maxRedemptions,
        maxRedemptionsPerUser: data.maxRedemptionsPerUser,
        startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        applicableProducts: data.applicableProducts,
        createdBy: req.user?.claims?.sub || req.user?.sub,
      }).returning();

      res.json({ 
        success: true, 
        promoCode,
        stripeSync: !!stripeCouponId,
      });
    } catch (error: any) {
      console.error("Create promo code error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== ADMIN: LIST PROMO CODES ====================
  app.get("/api/admin/promo-codes", async (req: any, res) => {
    try {
      const isAdmin = req.user?.claims?.isAdmin || req.user?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const codes = await db.select().from(promoCodes).orderBy(promoCodes.createdAt);
      
      const codesWithStats = await Promise.all(codes.map(async (code) => {
        const redemptions = await db.select()
          .from(promoCodeRedemptions)
          .where(eq(promoCodeRedemptions.promoCodeId, code.id));
        
        return {
          ...code,
          redemptionCount: redemptions.length,
          totalDiscountGiven: redemptions.reduce((sum, r) => sum + r.discountAmount, 0),
          remainingUses: code.maxRedemptions ? code.maxRedemptions - code.currentRedemptions : null,
        };
      }));

      res.json(codesWithStats);
    } catch (error: any) {
      console.error("List promo codes error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ADMIN: UPDATE PROMO CODE ====================
  app.patch("/api/admin/promo-codes/:id", async (req: any, res) => {
    try {
      const isAdmin = req.user?.claims?.isAdmin || req.user?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const updates = req.body;

      const [updated] = await db.update(promoCodes)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(promoCodes.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Promo code not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Update promo code error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== ADMIN: DEACTIVATE PROMO CODE ====================
  app.delete("/api/admin/promo-codes/:id", async (req: any, res) => {
    try {
      const isAdmin = req.user?.claims?.isAdmin || req.user?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;

      const [existing] = await db.select().from(promoCodes).where(eq(promoCodes.id, id));
      if (!existing) {
        return res.status(404).json({ error: "Promo code not found" });
      }

      if (existing.stripePromotionCodeId && stripe) {
        try {
          await stripe.promotionCodes.update(existing.stripePromotionCodeId, { active: false });
          console.log(`✅ Deactivated Stripe promo code ${existing.stripePromotionCodeId}`);
        } catch (stripeError: any) {
          console.error("Stripe deactivation error:", stripeError.message);
        }
      }

      const [updated] = await db.update(promoCodes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(promoCodes.id, id))
        .returning();

      res.json({ success: true, promoCode: updated });
    } catch (error: any) {
      console.error("Deactivate promo code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PUBLIC: VALIDATE PROMO CODE ====================
  app.post("/api/promo-codes/validate", async (req: any, res) => {
    try {
      const { code, productType, email } = validatePromoCodeSchema.parse(req.body);
      const normalizedCode = code.toUpperCase().trim();

      const now = new Date();
      const [promoCode] = await db.select()
        .from(promoCodes)
        .where(and(
          eq(promoCodes.code, normalizedCode),
          eq(promoCodes.isActive, true),
          lte(promoCodes.startsAt, now),
          or(
            isNull(promoCodes.expiresAt),
            gte(promoCodes.expiresAt, now)
          )
        ))
        .limit(1);

      if (!promoCode) {
        return res.status(400).json({ 
          valid: false, 
          error: "Invalid or expired promo code" 
        });
      }

      if (promoCode.maxRedemptions && promoCode.currentRedemptions >= promoCode.maxRedemptions) {
        return res.status(400).json({ 
          valid: false, 
          error: "This promo code has reached its maximum redemptions" 
        });
      }

      if (productType && promoCode.applicableProducts && promoCode.applicableProducts.length > 0) {
        if (!promoCode.applicableProducts.includes(productType)) {
          return res.status(400).json({ 
            valid: false, 
            error: `This promo code is not valid for ${productType}` 
          });
        }
      }

      if (email && promoCode.maxRedemptionsPerUser) {
        const userRedemptions = await db.select()
          .from(promoCodeRedemptions)
          .where(and(
            eq(promoCodeRedemptions.promoCodeId, promoCode.id),
            eq(promoCodeRedemptions.email, email.toLowerCase())
          ));
        
        if (userRedemptions.length >= promoCode.maxRedemptionsPerUser) {
          return res.status(400).json({ 
            valid: false, 
            error: "You have already used this promo code" 
          });
        }
      }

      res.json({
        valid: true,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountAmount: promoCode.discountAmount,
        stripePromotionCodeId: promoCode.stripePromotionCodeId,
        description: promoCode.description,
      });
    } catch (error: any) {
      console.error("Validate promo code error:", error);
      res.status(400).json({ valid: false, error: error.message });
    }
  });

  // ==================== INTERNAL: RECORD REDEMPTION ====================
  app.post("/api/promo-codes/redeem", async (req: any, res) => {
    try {
      const { 
        code, 
        email, 
        productType, 
        originalAmount, 
        discountAmount, 
        finalAmount,
        stripeCheckoutSessionId,
        stripePaymentIntentId,
      } = req.body;

      const normalizedCode = code.toUpperCase().trim();
      const [promoCode] = await db.select()
        .from(promoCodes)
        .where(eq(promoCodes.code, normalizedCode))
        .limit(1);

      if (!promoCode) {
        return res.status(400).json({ error: "Promo code not found" });
      }

      const userId = req.user?.claims?.sub || req.user?.sub || null;

      await db.insert(promoCodeRedemptions).values({
        promoCodeId: promoCode.id,
        userId,
        email: email.toLowerCase(),
        productType,
        originalAmount,
        discountAmount,
        finalAmount,
        stripeCheckoutSessionId,
        stripePaymentIntentId,
      });

      await db.update(promoCodes)
        .set({ 
          currentRedemptions: sql`${promoCodes.currentRedemptions} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(promoCodes.id, promoCode.id));

      console.log(`✅ Promo code ${code} redeemed by ${email} for ${productType}`);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Record redemption error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ADMIN: GET REDEMPTION HISTORY ====================
  app.get("/api/admin/promo-codes/:id/redemptions", async (req: any, res) => {
    try {
      const isAdmin = req.user?.claims?.isAdmin || req.user?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;

      const redemptions = await db.select()
        .from(promoCodeRedemptions)
        .where(eq(promoCodeRedemptions.promoCodeId, id))
        .orderBy(promoCodeRedemptions.redeemedAt);

      res.json(redemptions);
    } catch (error: any) {
      console.error("Get redemptions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  console.log("✅ Promo code routes registered");
}
