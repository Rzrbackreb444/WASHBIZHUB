/**
 * MARKETING & LOYALTY ENGINE API ROUTES
 * Enterprise-grade marketing features for WashBizHub
 */

import type { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import {
  loyaltyPrograms,
  loyaltyBalances,
  loyaltyLedger,
  coupons,
  couponRedemptions,
  operatorCampaigns,
  winBackRules,
  winBackEvents,
  householdAccounts,
  posTransactions,
  laundromats,
  users,
} from "@shared/schema";

interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
    };
  };
}

async function getUserId(req: AuthenticatedRequest): Promise<string | null> {
  const replitId = req.user?.claims?.sub;
  if (!replitId) return null;
  
  const [user] = await db.select().from(users).where(eq(users.id, replitId));
  return user?.id || null;
}

async function getUserLaundromats(userId: string): Promise<string[]> {
  const userLaundromats = await db
    .select({ id: laundromats.id })
    .from(laundromats)
    .where(eq(laundromats.userId, userId));
  return userLaundromats.map(l => l.id);
}

function generateCouponCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function registerMarketingLoyaltyRoutes(app: Express) {
  
  // ============================================================================
  // LOYALTY PROGRAM ROUTES (using existing schema with userId)
  // ============================================================================

  // Get loyalty program for a user
  app.get("/api/marketing/loyalty-program/:userId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      
      const [program] = await db
        .select()
        .from(loyaltyPrograms)
        .where(eq(loyaltyPrograms.userId, userId));
      
      res.json(program || null);
    } catch (error) {
      console.error("Error fetching loyalty program:", error);
      res.status(500).json({ error: "Failed to fetch loyalty program" });
    }
  });

  // Create or update loyalty program
  app.post("/api/marketing/loyalty-program", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const data = req.body;

      // Check if program exists
      const [existing] = await db
        .select()
        .from(loyaltyPrograms)
        .where(eq(loyaltyPrograms.userId, userId));

      if (existing) {
        const [updated] = await db
          .update(loyaltyPrograms)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(loyaltyPrograms.id, existing.id))
          .returning();
        return res.json(updated);
      }

      const [program] = await db
        .insert(loyaltyPrograms)
        .values({ ...data, userId })
        .returning();

      res.status(201).json(program);
    } catch (error) {
      console.error("Error saving loyalty program:", error);
      res.status(500).json({ error: "Failed to save loyalty program" });
    }
  });

  // Get customer loyalty balance
  app.get("/api/marketing/loyalty/customer/:customerId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { customerId } = req.params;
      
      const [balance] = await db
        .select()
        .from(loyaltyBalances)
        .where(eq(loyaltyBalances.customerId, customerId));

      const ledger = await db
        .select()
        .from(loyaltyLedger)
        .where(balance ? eq(loyaltyLedger.balanceId, balance.id) : sql`false`)
        .orderBy(desc(loyaltyLedger.createdAt))
        .limit(10);

      res.json({
        balance,
        recentTransactions: ledger,
      });
    } catch (error) {
      console.error("Error fetching customer loyalty:", error);
      res.status(500).json({ error: "Failed to fetch customer loyalty data" });
    }
  });

  // Award points (used by POS integration)
  app.post("/api/marketing/loyalty/award", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { programId, customerId, orderId, orderTotal, description } = req.body;
      
      const [program] = await db
        .select()
        .from(loyaltyPrograms)
        .where(eq(loyaltyPrograms.id, programId));

      if (!program || !program.isActive) {
        return res.json({ awarded: false, reason: "No active loyalty program" });
      }

      const pointsPerDollar = parseFloat(program.pointsPerDollar?.toString() || "1");
      const points = Math.floor(orderTotal * pointsPerDollar);

      // Get or create balance
      let [balance] = await db
        .select()
        .from(loyaltyBalances)
        .where(and(
          eq(loyaltyBalances.programId, programId),
          eq(loyaltyBalances.customerId, customerId)
        ));

      if (!balance) {
        [balance] = await db
          .insert(loyaltyBalances)
          .values({
            programId,
            customerId,
            currentPoints: 0,
            lifetimePoints: 0,
            lifetimeSpend: "0",
          })
          .returning();
      }

      const newPoints = (balance.currentPoints || 0) + points;
      const newLifetimePoints = (balance.lifetimePoints || 0) + points;

      // Update balance
      await db
        .update(loyaltyBalances)
        .set({
          currentPoints: newPoints,
          lifetimePoints: newLifetimePoints,
          lifetimeSpend: sql`${loyaltyBalances.lifetimeSpend} + ${orderTotal}`,
          lastActivityAt: new Date(),
        })
        .where(eq(loyaltyBalances.id, balance.id));

      // Create ledger entry
      const [ledgerEntry] = await db
        .insert(loyaltyLedger)
        .values({
          balanceId: balance.id,
          transactionType: "earn",
          pointsChange: points,
          orderId,
          description: description || `Earned ${points} points from order`,
          balanceAfter: newPoints,
        })
        .returning();

      res.json({
        awarded: true,
        pointsAwarded: points,
        newBalance: newPoints,
        transaction: ledgerEntry,
      });
    } catch (error) {
      console.error("Error awarding points:", error);
      res.status(500).json({ error: "Failed to award points" });
    }
  });

  // Redeem points
  app.post("/api/marketing/loyalty/redeem", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { programId, customerId, pointsToRedeem, orderId } = req.body;
      
      const [program] = await db
        .select()
        .from(loyaltyPrograms)
        .where(eq(loyaltyPrograms.id, programId));

      if (!program) {
        return res.status(400).json({ error: "Program not found" });
      }

      const minPoints = program.minimumPointsToRedeem || 100;
      if (pointsToRedeem < minPoints) {
        return res.status(400).json({ error: `Minimum ${minPoints} points required` });
      }

      const [balance] = await db
        .select()
        .from(loyaltyBalances)
        .where(and(
          eq(loyaltyBalances.programId, programId),
          eq(loyaltyBalances.customerId, customerId)
        ));

      if (!balance || (balance.currentPoints || 0) < pointsToRedeem) {
        return res.status(400).json({ error: "Insufficient points" });
      }

      const newPoints = (balance.currentPoints || 0) - pointsToRedeem;
      const redemptionRate = parseFloat(program.pointsRedemptionRate?.toString() || "0.01");
      const discountValue = pointsToRedeem * redemptionRate;

      await db
        .update(loyaltyBalances)
        .set({
          currentPoints: newPoints,
          rewardsRedeemed: sql`${loyaltyBalances.rewardsRedeemed} + 1`,
          lastActivityAt: new Date(),
        })
        .where(eq(loyaltyBalances.id, balance.id));

      const [ledgerEntry] = await db
        .insert(loyaltyLedger)
        .values({
          balanceId: balance.id,
          transactionType: "redeem",
          pointsChange: -pointsToRedeem,
          orderId,
          description: `Redeemed ${pointsToRedeem} points for $${discountValue.toFixed(2)} off`,
          redemptionValue: discountValue.toString(),
          balanceAfter: newPoints,
        })
        .returning();

      res.json({
        redeemed: true,
        pointsRedeemed: pointsToRedeem,
        discountValue,
        newBalance: newPoints,
        transaction: ledgerEntry,
      });
    } catch (error) {
      console.error("Error redeeming points:", error);
      res.status(500).json({ error: "Failed to redeem points" });
    }
  });

  // Get loyalty ledger for a user
  app.get("/api/marketing/loyalty-transactions/:userId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = "50" } = req.query;

      const [program] = await db
        .select()
        .from(loyaltyPrograms)
        .where(eq(loyaltyPrograms.userId, userId));

      if (!program) {
        return res.json([]);
      }

      const balances = await db
        .select({ id: loyaltyBalances.id })
        .from(loyaltyBalances)
        .where(eq(loyaltyBalances.programId, program.id));

      const balanceIds = balances.map(b => b.id);
      if (balanceIds.length === 0) {
        return res.json([]);
      }

      const transactions = await db
        .select()
        .from(loyaltyLedger)
        .orderBy(desc(loyaltyLedger.createdAt))
        .limit(parseInt(limit as string));

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching loyalty transactions:", error);
      res.status(500).json({ error: "Failed to fetch loyalty transactions" });
    }
  });

  // ============================================================================
  // COUPON ROUTES
  // ============================================================================

  // Get all coupons for a laundromat
  app.get("/api/marketing/coupons/:laundromatId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.params;
      
      const allCoupons = await db
        .select()
        .from(coupons)
        .where(eq(coupons.laundromatId, laundromatId))
        .orderBy(desc(coupons.createdAt));

      res.json(allCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  // Create coupon
  app.post("/api/marketing/coupons", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const data = req.body;
      const userLaundromatIds = await getUserLaundromats(userId);
      
      if (!userLaundromatIds.includes(data.laundromatId)) {
        return res.status(403).json({ error: "Access denied to this laundromat" });
      }

      if (!data.code) {
        data.code = generateCouponCode();
      }

      const [coupon] = await db
        .insert(coupons)
        .values({
          ...data,
          createdBy: userId,
        })
        .returning();

      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });

  // Update coupon
  app.patch("/api/marketing/coupons/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { id } = req.params;
      const data = req.body;

      const [updated] = await db
        .update(coupons)
        .set(data)
        .where(eq(coupons.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  // Delete coupon
  app.delete("/api/marketing/coupons/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { id } = req.params;
      await db.delete(coupons).where(eq(coupons.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  // Validate and apply coupon
  app.post("/api/marketing/coupons/validate", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, code, customerId, orderTotal } = req.body;

      const [coupon] = await db
        .select()
        .from(coupons)
        .where(and(
          eq(coupons.code, code.toUpperCase()),
          eq(coupons.laundromatId, laundromatId),
          eq(coupons.isActive, true)
        ));

      if (!coupon) {
        return res.status(400).json({ valid: false, error: "Invalid coupon code" });
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ valid: false, error: "Coupon has expired" });
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ valid: false, error: "Coupon usage limit reached" });
      }

      if (coupon.minimumOrderAmount && orderTotal < parseFloat(coupon.minimumOrderAmount.toString())) {
        return res.status(400).json({ 
          valid: false, 
          error: `Minimum order of $${coupon.minimumOrderAmount} required` 
        });
      }

      let discount = 0;
      const discountValue = parseFloat(coupon.discountValue.toString());
      
      if (coupon.discountType === "percentage") {
        discount = orderTotal * (discountValue / 100);
      } else if (coupon.discountType === "fixed_amount") {
        discount = Math.min(discountValue, orderTotal);
      }

      res.json({
        valid: true,
        coupon,
        discount: Math.round(discount * 100) / 100,
        discountType: coupon.discountType,
        discountValue,
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });

  // Redeem coupon
  app.post("/api/marketing/coupons/redeem", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { couponId, customerId, transactionId, discountApplied, orderTotal } = req.body;

      const [redemption] = await db
        .insert(couponRedemptions)
        .values({
          couponId,
          customerId,
          transactionId,
          discountApplied: discountApplied.toString(),
          orderTotal: orderTotal?.toString(),
        })
        .returning();

      await db
        .update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(eq(coupons.id, couponId));

      res.json({ success: true, redemption });
    } catch (error) {
      console.error("Error redeeming coupon:", error);
      res.status(500).json({ error: "Failed to redeem coupon" });
    }
  });

  // ============================================================================
  // CAMPAIGN ROUTES
  // ============================================================================

  // Get all campaigns
  app.get("/api/marketing/campaigns/:laundromatId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.params;

      const campaigns = await db
        .select()
        .from(operatorCampaigns)
        .where(eq(operatorCampaigns.laundromatId, laundromatId))
        .orderBy(desc(operatorCampaigns.createdAt));

      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  // Create campaign
  app.post("/api/marketing/campaigns", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const data = req.body;
      const userLaundromatIds = await getUserLaundromats(userId);
      
      if (!userLaundromatIds.includes(data.laundromatId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const [campaign] = await db
        .insert(operatorCampaigns)
        .values({
          ...data,
          createdBy: userId,
        })
        .returning();

      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  // Update campaign
  app.patch("/api/marketing/campaigns/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { id } = req.params;
      const data = req.body;

      const [updated] = await db
        .update(operatorCampaigns)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(operatorCampaigns.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  // Delete campaign
  app.delete("/api/marketing/campaigns/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { id } = req.params;
      await db.delete(operatorCampaigns).where(eq(operatorCampaigns.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // ============================================================================
  // WIN-BACK AUTOMATION ROUTES
  // ============================================================================

  // Get win-back rules
  app.get("/api/marketing/win-back/:laundromatId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.params;

      const rules = await db
        .select()
        .from(winBackRules)
        .where(eq(winBackRules.laundromatId, laundromatId));

      res.json(rules);
    } catch (error) {
      console.error("Error fetching win-back rules:", error);
      res.status(500).json({ error: "Failed to fetch win-back rules" });
    }
  });

  // Create win-back rule
  app.post("/api/marketing/win-back", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const data = req.body;
      const userLaundromatIds = await getUserLaundromats(userId);
      
      if (!userLaundromatIds.includes(data.laundromatId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const [rule] = await db
        .insert(winBackRules)
        .values(data)
        .returning();

      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating win-back rule:", error);
      res.status(500).json({ error: "Failed to create win-back rule" });
    }
  });

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================

  // Get marketing dashboard stats
  app.get("/api/marketing/dashboard/:laundromatId", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.params;

      // Get coupon stats
      const [couponStats] = await db
        .select({
          totalCoupons: count(),
          totalRedemptions: sql<number>`COALESCE(SUM(${coupons.usedCount}), 0)`,
        })
        .from(coupons)
        .where(eq(coupons.laundromatId, laundromatId));

      // Get campaign stats
      const [campaignStats] = await db
        .select({
          totalCampaigns: count(),
          totalSent: sql<number>`COALESCE(SUM(${operatorCampaigns.totalSent}), 0)`,
          totalOpens: sql<number>`COALESCE(SUM(${operatorCampaigns.totalOpens}), 0)`,
          totalClicks: sql<number>`COALESCE(SUM(${operatorCampaigns.totalClicks}), 0)`,
        })
        .from(operatorCampaigns)
        .where(eq(operatorCampaigns.laundromatId, laundromatId));

      // Get win-back stats
      const [winBackStats] = await db
        .select({
          totalRules: count(),
          totalTriggered: sql<number>`COALESCE(SUM(${winBackRules.totalTriggered}), 0)`,
          totalConverted: sql<number>`COALESCE(SUM(${winBackRules.totalConverted}), 0)`,
        })
        .from(winBackRules)
        .where(eq(winBackRules.laundromatId, laundromatId));

      res.json({
        loyalty: { totalPointsIssued: 0, totalPointsRedeemed: 0 },
        coupons: couponStats,
        campaigns: campaignStats,
        winBack: winBackStats,
      });
    } catch (error) {
      console.error("Error fetching marketing dashboard:", error);
      res.status(500).json({ error: "Failed to fetch marketing dashboard" });
    }
  });

  console.log("Marketing & Loyalty routes registered");
}
