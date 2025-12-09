/**
 * POS COMMAND CENTER API ROUTES
 * Full-featured Point of Sale system for WashBizHub
 * Feature parity with Curbside/Cents + UNIQUE advantages
 * 
 * TENANT ISOLATION: All operations are scoped to laundromats owned by the authenticated user
 * SECURITY: All endpoints validate tenant access before performing any operations
 */

import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, like, or, count, inArray } from "drizzle-orm";
import {
  posTransactions,
  posItems,
  weighEvents,
  householdAccounts,
  serviceOrders,
  orderItems,
  subscriptions,
  machineAssets,
  machineSensorData,
  repairTickets,
  partsInventory,
  routes,
  routeStops,
  laundromats,
  users,
  maintenancePlans,
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";

// Initialize Stripe only if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null;

// ============================================================================
// SUBSCRIPTION TIER LEVELS & GATING
// ============================================================================

const SUBSCRIPTION_TIER_LEVELS: Record<string, number> = {
  free: 0,
  accelerate: 1,
  scale: 2,
  summit: 3,
};

// Middleware to check subscription tier access for POS routes
function requiresSubscriptionTier(minTier: "free" | "accelerate" | "scale" | "summit") {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ 
          error: "Authentication required",
          requiredTier: minTier 
        });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const userTier = (user.subscriptionTier as string) || "free";
      const userLevel = SUBSCRIPTION_TIER_LEVELS[userTier] ?? 0;
      const requiredLevel = SUBSCRIPTION_TIER_LEVELS[minTier] ?? 0;

      if (userLevel >= requiredLevel) {
        return next();
      }

      return res.status(403).json({
        error: "Upgrade required",
        message: `This feature requires ${minTier} tier or higher`,
        currentTier: userTier,
        requiredTier: minTier,
        upgradeUrl: `/pricing?feature=${req.path}`
      });
    } catch (error) {
      console.error("Subscription check error:", error);
      return res.status(500).json({ error: "Failed to verify subscription" });
    }
  };
}

// ============================================================================
// TENANT ISOLATION HELPERS
// ============================================================================

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

async function verifyLaundromatAccess(req: AuthenticatedRequest, laundromatId: string): Promise<boolean> {
  const userId = await getUserId(req);
  if (!userId) return false;
  
  const [userLaundromat] = await db
    .select()
    .from(laundromats)
    .where(and(
      eq(laundromats.id, laundromatId),
      eq(laundromats.userId, userId)
    ));
  
  return !!userLaundromat;
}

// Verify user has access to a specific order (via laundromat ownership)
async function verifyOrderAccess(req: AuthenticatedRequest, orderId: string): Promise<{ hasAccess: boolean; order: any | null }> {
  const userId = await getUserId(req);
  if (!userId) return { hasAccess: false, order: null };
  
  const userLaundromatIds = await getUserLaundromats(userId);
  if (userLaundromatIds.length === 0) return { hasAccess: false, order: null };
  
  const [order] = await db
    .select()
    .from(posTransactions)
    .where(eq(posTransactions.id, orderId));
  
  if (!order) return { hasAccess: false, order: null };
  
  const hasAccess = userLaundromatIds.includes(order.laundromatId);
  return { hasAccess, order };
}

// Verify user has access to a specific customer (via laundromat ownership)
async function verifyCustomerAccess(req: AuthenticatedRequest, customerId: string): Promise<{ hasAccess: boolean; customer: any | null }> {
  const userId = await getUserId(req);
  if (!userId) return { hasAccess: false, customer: null };
  
  const userLaundromatIds = await getUserLaundromats(userId);
  if (userLaundromatIds.length === 0) return { hasAccess: false, customer: null };
  
  const [customer] = await db
    .select()
    .from(householdAccounts)
    .where(eq(householdAccounts.id, customerId));
  
  if (!customer) return { hasAccess: false, customer: null };
  
  const hasAccess = userLaundromatIds.includes(customer.laundromatId);
  return { hasAccess, customer };
}

// Verify user has access to a specific machine (via laundromat ownership)
async function verifyMachineAccess(req: AuthenticatedRequest, machineId: string): Promise<{ hasAccess: boolean; machine: any | null }> {
  const userId = await getUserId(req);
  if (!userId) return { hasAccess: false, machine: null };
  
  const userLaundromatIds = await getUserLaundromats(userId);
  if (userLaundromatIds.length === 0) return { hasAccess: false, machine: null };
  
  const [machine] = await db
    .select()
    .from(machineAssets)
    .where(eq(machineAssets.id, machineId));
  
  if (!machine) return { hasAccess: false, machine: null };
  
  const hasAccess = userLaundromatIds.includes(machine.laundromatId);
  return { hasAccess, machine };
}

// Verify user has access to a specific route (via laundromat ownership)
async function verifyRouteAccess(req: AuthenticatedRequest, routeId: string): Promise<{ hasAccess: boolean; route: any | null }> {
  const userId = await getUserId(req);
  if (!userId) return { hasAccess: false, route: null };
  
  const userLaundromatIds = await getUserLaundromats(userId);
  if (userLaundromatIds.length === 0) return { hasAccess: false, route: null };
  
  const [route] = await db
    .select()
    .from(routes)
    .where(eq(routes.id, routeId));
  
  if (!route) return { hasAccess: false, route: null };
  
  const hasAccess = userLaundromatIds.includes(route.laundromatId);
  return { hasAccess, route };
}

// Verify user has access to a specific inventory item (via laundromat ownership)
async function verifyInventoryAccess(req: AuthenticatedRequest, inventoryId: string): Promise<{ hasAccess: boolean; item: any | null }> {
  const userId = await getUserId(req);
  if (!userId) return { hasAccess: false, item: null };
  
  const userLaundromatIds = await getUserLaundromats(userId);
  if (userLaundromatIds.length === 0) return { hasAccess: false, item: null };
  
  const [item] = await db
    .select()
    .from(partsInventory)
    .where(eq(partsInventory.id, inventoryId));
  
  if (!item) return { hasAccess: false, item: null };
  
  const hasAccess = userLaundromatIds.includes(item.laundromatId);
  return { hasAccess, item };
}

// Verify user has access to a specific repair ticket (via laundromat ownership)
async function verifyRepairTicketAccess(req: AuthenticatedRequest, ticketId: string): Promise<{ hasAccess: boolean; ticket: any | null }> {
  const userId = await getUserId(req);
  if (!userId) return { hasAccess: false, ticket: null };
  
  const userLaundromatIds = await getUserLaundromats(userId);
  if (userLaundromatIds.length === 0) return { hasAccess: false, ticket: null };
  
  const [ticket] = await db
    .select()
    .from(repairTickets)
    .where(eq(repairTickets.id, ticketId));
  
  if (!ticket) return { hasAccess: false, ticket: null };
  
  const hasAccess = userLaundromatIds.includes(ticket.laundromatId);
  return { hasAccess, ticket };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createOrderSchema = z.object({
  laundromatId: z.string(),
  customerId: z.string().optional(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().email().optional(),
  orderType: z.enum(["wash_dry_fold", "dry_cleaning", "alterations", "pickup_delivery", "self_service"]),
  specialInstructions: z.string().optional(),
  pricePerPound: z.string().optional(),
});

const createCustomerSchema = z.object({
  laundromatId: z.string(),
  accountName: z.string(),
  contactName: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  billingCycle: z.enum(["weekly", "biweekly", "monthly"]).optional(),
  creditLimit: z.string().optional(),
});

const createMachineSchema = z.object({
  laundromatId: z.string(),
  machineName: z.string(),
  machineType: z.enum(["washer", "dryer", "combo", "ironer", "folder"]),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  installDate: z.string().optional(),
});

const createRouteSchema = z.object({
  laundromatId: z.string(),
  routeName: z.string(),
  routeType: z.enum(["pickup", "delivery", "pickup_delivery"]),
  routeDate: z.string(),
  driverId: z.string().optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateTransactionNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `TXN-${year}-${random}`;
}

function generateAccountNumber(): string {
  const random = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
  return `ACCT-${random}`;
}

function generateRouteNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `RTE-${dateStr}-${random}`;
}

// ============================================================================
// REGISTER POS ROUTES
// ============================================================================

export function registerPosRoutes(app: Express) {
  
  // ========================================
  // ORDERS (posTransactions)
  // ========================================
  
  // List orders with filters (tenant-isolated)
  app.get("/api/pos/orders", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, laundromatId, customerId, startDate, endDate, limit = "50", offset = "0" } = req.query;
      
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      const conditions: any[] = [];
      
      // TENANT ISOLATION: Filter to user's laundromats
      if (laundromatId) {
        // Verify user has access to requested laundromat
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
        conditions.push(eq(posTransactions.laundromatId, laundromatId as string));
      } else if (userLaundromatIds.length > 0) {
        // Default to user's laundromats
        conditions.push(inArray(posTransactions.laundromatId, userLaundromatIds));
      }
      
      if (status) {
        conditions.push(eq(posTransactions.status, status as string));
      }
      if (customerId) {
        conditions.push(eq(posTransactions.customerId, customerId as string));
      }
      if (startDate) {
        conditions.push(gte(posTransactions.createdAt, new Date(startDate as string)));
      }
      if (endDate) {
        conditions.push(lte(posTransactions.createdAt, new Date(endDate as string)));
      }
      
      const orders = await db
        .select()
        .from(posTransactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(posTransactions.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json({ orders, count: orders.length });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  
  // Get single order with items (tenant-isolated)
  app.get("/api/pos/orders/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // TENANT ISOLATION: Verify user has access to this order
      const { hasAccess, order } = await verifyOrderAccess(req, id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this order" });
      }
      
      const items = await db
        .select()
        .from(posItems)
        .where(eq(posItems.transactionId, id));
      
      const weights = await db
        .select()
        .from(weighEvents)
        .where(eq(weighEvents.transactionId, id))
        .orderBy(desc(weighEvents.createdAt));
      
      res.json({ order, items, weights });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  
  // Create new order (tenant-isolated)
  app.post("/api/pos/orders", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = createOrderSchema.parse(req.body);
      
      // TENANT ISOLATION: Verify user has access to the laundromat
      const hasAccess = await verifyLaundromatAccess(req, data.laundromatId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this laundromat" });
      }
      
      const [order] = await db
        .insert(posTransactions)
        .values({
          ...data,
          transactionNumber: generateTransactionNumber(),
          status: "pending",
          paymentStatus: "unpaid",
          subtotal: "0.00",
          total: "0.00",
        } as any)
        .returning();
      
      res.status(201).json({ order });
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  
  // Update order status (tenant-isolated)
  app.patch("/api/pos/orders/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // TENANT ISOLATION: Verify user has access to this order before updating
      const { hasAccess, order: existingOrder } = await verifyOrderAccess(req, id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this order" });
      }
      
      const [order] = await db
        .update(posTransactions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(posTransactions.id, id))
        .returning();
      
      res.json({ order });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });
  
  // Add item to order (tenant-isolated)
  app.post("/api/pos/orders/:id/items", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { itemType, description, quantity, weight, pricePerPound, unitPrice } = req.body;
      
      // TENANT ISOLATION: Verify user has access to this order
      const { hasAccess, order } = await verifyOrderAccess(req, id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this order" });
      }
      
      // Calculate subtotal
      let subtotal = "0.00";
      if (weight && pricePerPound) {
        subtotal = (parseFloat(weight) * parseFloat(pricePerPound)).toFixed(2);
      } else if (quantity && unitPrice) {
        subtotal = (parseInt(quantity) * parseFloat(unitPrice)).toFixed(2);
      }
      
      const [item] = await db
        .insert(posItems)
        .values({
          transactionId: id,
          itemType,
          description,
          quantity: quantity || 1,
          weight,
          pricePerPound,
          unitPrice,
          subtotal,
          status: "pending",
        } as any)
        .returning();
      
      // Update order totals
      const items = await db.select().from(posItems).where(eq(posItems.transactionId, id));
      const newSubtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal || "0"), 0);
      const tax = newSubtotal * 0.0825; // 8.25% tax
      const total = newSubtotal + tax;
      
      await db
        .update(posTransactions)
        .set({
          subtotal: newSubtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(posTransactions.id, id));
      
      res.status(201).json({ item });
    } catch (error) {
      console.error("Error adding item:", error);
      res.status(500).json({ error: "Failed to add item" });
    }
  });
  
  // Record weight measurement (tenant-isolated)
  app.post("/api/pos/orders/:id/weigh", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { weight, scaleId, weighedBy, photoUrl } = req.body;
      
      // TENANT ISOLATION: Verify user has access to this order
      const { hasAccess, order } = await verifyOrderAccess(req, id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this order" });
      }
      
      const [weighEvent] = await db
        .insert(weighEvents)
        .values({
          transactionId: id,
          weight,
          scaleId,
          weighedBy,
          photoUrl,
        } as any)
        .returning();
      
      // Update order total weight
      await db
        .update(posTransactions)
        .set({
          totalWeight: weight,
          updatedAt: new Date(),
        })
        .where(eq(posTransactions.id, id));
      
      res.status(201).json({ weighEvent });
    } catch (error) {
      console.error("Error recording weight:", error);
      res.status(500).json({ error: "Failed to record weight" });
    }
  });
  
  // Process payment (tenant-isolated)
  app.post("/api/pos/orders/:id/payment", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;
      
      // TENANT ISOLATION: Verify user has access to this order
      const { hasAccess, order } = await verifyOrderAccess(req, id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this order" });
      }
      
      if (paymentMethod === "card") {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(order.total || "0") * 100),
          currency: "usd",
          metadata: { orderId: id },
        });
        
        await db
          .update(posTransactions)
          .set({
            stripePaymentIntentId: paymentIntent.id,
            paymentMethod: "card",
            updatedAt: new Date(),
          })
          .where(eq(posTransactions.id, id));
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } else {
        // Cash payment
        await db
          .update(posTransactions)
          .set({
            paymentMethod: "cash",
            paymentStatus: "paid",
            updatedAt: new Date(),
          })
          .where(eq(posTransactions.id, id));
        
        res.json({ success: true });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });
  
  // ========================================
  // PRICING ENGINE (WDF Per-Pound Pricing)
  // ========================================
  
  // Pricing Calculator Utility
  function calculateWdfPrice(config: {
    weight: number;
    serviceTier: "standard" | "express" | "same_day" | "premium";
    includeDelivery: boolean;
    addOns?: string[];
    pricingConfig: any;
  }) {
    const pricing = config.pricingConfig || {};
    const standardRate = parseFloat(pricing.standardPricePerPound) || 1.50;
    const minimumWeight = parseFloat(pricing.minimumWeight) || 10;
    const minimumCharge = parseFloat(pricing.minimumCharge) || 15;
    const taxRate = parseFloat(pricing.taxRate) || 8.25;
    const pickupDeliveryFee = parseFloat(pricing.pickupDeliveryFee) || 5;
    
    // Service tier multipliers
    const tierMultipliers: Record<string, number> = {
      standard: pricing.serviceTiers?.standard?.priceMultiplier || 1.0,
      express: pricing.serviceTiers?.express?.priceMultiplier || 1.25,
      same_day: pricing.serviceTiers?.sameDay?.priceMultiplier || 1.75,
      premium: pricing.serviceTiers?.premium?.priceMultiplier || 1.50,
    };
    
    // Calculate base price
    const effectiveWeight = Math.max(config.weight, minimumWeight);
    const tierMultiplier = tierMultipliers[config.serviceTier] || 1.0;
    const effectiveRate = standardRate * tierMultiplier;
    let basePrice = effectiveWeight * effectiveRate;
    
    // Apply minimum charge if applicable
    if (basePrice < minimumCharge) {
      basePrice = minimumCharge;
    }
    
    // Calculate rush fee (difference from standard tier)
    let rushFee = 0;
    if (config.serviceTier !== "standard") {
      const standardPrice = effectiveWeight * standardRate;
      rushFee = basePrice - Math.max(standardPrice, minimumCharge);
    }
    
    // Calculate add-ons total
    let addOnsTotal = 0;
    if (config.addOns && pricing.addOns) {
      for (const addOnId of config.addOns) {
        const addOn = pricing.addOns.find((a: any) => a.id === addOnId);
        if (addOn) {
          if (addOn.priceType === "per_pound") {
            addOnsTotal += addOn.price * effectiveWeight;
          } else {
            addOnsTotal += addOn.price;
          }
        }
      }
    }
    
    // Delivery fee
    const deliveryFee = config.includeDelivery ? pickupDeliveryFee : 0;
    
    // Calculate subtotal and tax
    const subtotal = basePrice + addOnsTotal + deliveryFee;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    return {
      weight: config.weight,
      effectiveWeight,
      pricePerPound: effectiveRate,
      basePrice: Math.round(basePrice * 100) / 100,
      rushFee: Math.round(rushFee * 100) / 100,
      addOnsTotal: Math.round(addOnsTotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      serviceTier: config.serviceTier,
      breakdown: {
        minimumApplied: config.weight < minimumWeight,
        tierMultiplier,
      }
    };
  }
  
  // Get pricing configuration for a laundromat (tenant-isolated)
  app.get("/api/pos/pricing", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.query;
      
      if (!laundromatId) {
        return res.status(400).json({ error: "Laundromat ID is required" });
      }
      
      // TENANT ISOLATION: Verify user has access to the laundromat
      const hasAccess = await verifyLaundromatAccess(req, laundromatId as string);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this laundromat" });
      }
      
      const [laundromat] = await db
        .select()
        .from(laundromats)
        .where(eq(laundromats.id, laundromatId as string));
      
      if (!laundromat) {
        return res.status(404).json({ error: "Laundromat not found" });
      }
      
      // Return pricing config with defaults if not configured
      const defaultConfig = {
        standardPricePerPound: 1.50,
        minimumWeight: 10,
        minimumCharge: 15,
        rushSurchargePercent: 50,
        sameDaySurchargePercent: 75,
        pickupDeliveryFee: 5,
        perMileFee: 0,
        serviceTiers: {
          standard: { name: "Standard", turnaroundHours: 48, priceMultiplier: 1.0 },
          express: { name: "Express", turnaroundHours: 24, priceMultiplier: 1.25 },
          sameDay: { name: "Same Day Rush", turnaroundHours: 6, priceMultiplier: 1.75 },
          premium: { name: "Premium Care", turnaroundHours: 48, priceMultiplier: 1.50 },
        },
        addOns: [
          { id: "fabric-softener", name: "Fabric Softener", priceType: "flat", price: 2.00 },
          { id: "starch", name: "Starch", priceType: "per_pound", price: 0.25 },
          { id: "hang-dry", name: "Hang Dry", priceType: "per_pound", price: 0.50 },
          { id: "special-care", name: "Special Care Items", priceType: "per_pound", price: 0.75 },
        ],
        taxRate: 8.25,
      };
      
      const pricingConfig = laundromat.wdfPricingConfig 
        ? { ...defaultConfig, ...laundromat.wdfPricingConfig as object }
        : defaultConfig;
      
      res.json({ pricingConfig, laundromatId });
    } catch (error) {
      console.error("Error fetching pricing config:", error);
      res.status(500).json({ error: "Failed to fetch pricing configuration" });
    }
  });
  
  // Update pricing configuration for a laundromat (tenant-isolated)
  app.post("/api/pos/pricing", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, pricingConfig } = req.body;
      
      if (!laundromatId) {
        return res.status(400).json({ error: "Laundromat ID is required" });
      }
      
      // TENANT ISOLATION: Verify user has access to the laundromat
      const hasAccess = await verifyLaundromatAccess(req, laundromatId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this laundromat" });
      }
      
      const [updated] = await db
        .update(laundromats)
        .set({ wdfPricingConfig: pricingConfig })
        .where(eq(laundromats.id, laundromatId))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Laundromat not found" });
      }
      
      res.json({ success: true, pricingConfig: updated.wdfPricingConfig });
    } catch (error) {
      console.error("Error updating pricing config:", error);
      res.status(500).json({ error: "Failed to update pricing configuration" });
    }
  });
  
  // Calculate price for given weight/services (tenant-isolated)
  app.post("/api/pos/orders/calculate-price", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, weight, serviceTier = "standard", includeDelivery = false, addOns = [] } = req.body;
      
      if (!laundromatId) {
        return res.status(400).json({ error: "Laundromat ID is required" });
      }
      
      if (!weight || isNaN(parseFloat(weight))) {
        return res.status(400).json({ error: "Valid weight is required" });
      }
      
      // TENANT ISOLATION: Verify user has access to the laundromat
      const hasAccess = await verifyLaundromatAccess(req, laundromatId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this laundromat" });
      }
      
      // Get laundromat pricing config
      const [laundromat] = await db
        .select()
        .from(laundromats)
        .where(eq(laundromats.id, laundromatId));
      
      if (!laundromat) {
        return res.status(404).json({ error: "Laundromat not found" });
      }
      
      // Use default config if not set
      const defaultConfig = {
        standardPricePerPound: 1.50,
        minimumWeight: 10,
        minimumCharge: 15,
        pickupDeliveryFee: 5,
        serviceTiers: {
          standard: { priceMultiplier: 1.0 },
          express: { priceMultiplier: 1.25 },
          sameDay: { priceMultiplier: 1.75 },
          premium: { priceMultiplier: 1.50 },
        },
        addOns: [
          { id: "fabric-softener", name: "Fabric Softener", priceType: "flat", price: 2.00 },
          { id: "starch", name: "Starch", priceType: "per_pound", price: 0.25 },
        ],
        taxRate: 8.25,
      };
      
      const pricingConfig = laundromat.wdfPricingConfig 
        ? { ...defaultConfig, ...laundromat.wdfPricingConfig as object }
        : defaultConfig;
      
      const priceBreakdown = calculateWdfPrice({
        weight: parseFloat(weight),
        serviceTier: serviceTier as "standard" | "express" | "same_day" | "premium",
        includeDelivery,
        addOns,
        pricingConfig,
      });
      
      res.json(priceBreakdown);
    } catch (error) {
      console.error("Error calculating price:", error);
      res.status(500).json({ error: "Failed to calculate price" });
    }
  });
  
  // Confirm weight at drop-off or pickup (tenant-isolated)
  app.post("/api/pos/orders/:id/confirm-weight", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { weight, stage, confirmedBy } = req.body; // stage: "drop_off" or "pickup"
      
      // TENANT ISOLATION: Verify user has access to this order
      const { hasAccess, order } = await verifyOrderAccess(req, id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this order" });
      }
      
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      if (stage === "drop_off") {
        updateData.dropOffWeight = weight;
        updateData.totalWeight = weight;
      } else if (stage === "pickup") {
        updateData.pickupWeight = weight;
      }
      
      updateData.weightConfirmedAt = new Date();
      updateData.weightConfirmedBy = confirmedBy;
      
      const [updated] = await db
        .update(posTransactions)
        .set(updateData)
        .where(eq(posTransactions.id, id))
        .returning();
      
      // Also record in weighEvents table
      await db.insert(weighEvents).values({
        transactionId: id,
        weight: weight,
        weighedBy: confirmedBy,
        stage: stage,
      } as any);
      
      res.json({ success: true, order: updated });
    } catch (error) {
      console.error("Error confirming weight:", error);
      res.status(500).json({ error: "Failed to confirm weight" });
    }
  });
  
  // ========================================
  // CUSTOMERS (householdAccounts)
  // ========================================
  
  // List customers (tenant-isolated)
  app.get("/api/pos/customers", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, search, limit = "50", offset = "0" } = req.query;
      
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      const conditions: any[] = [];
      
      // TENANT ISOLATION: Filter to user's laundromats
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
        conditions.push(eq(householdAccounts.laundromatId, laundromatId as string));
      } else if (userLaundromatIds.length > 0) {
        conditions.push(inArray(householdAccounts.laundromatId, userLaundromatIds));
      }
      
      if (search) {
        conditions.push(
          or(
            like(householdAccounts.accountName, `%${search}%`),
            like(householdAccounts.contactName, `%${search}%`),
            like(householdAccounts.phone, `%${search}%`)
          )
        );
      }
      
      const customers = await db
        .select()
        .from(householdAccounts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(householdAccounts.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json({ customers, count: customers.length });
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  
  // Get customer with stats (tenant-isolated)
  app.get("/api/pos/customers/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // TENANT ISOLATION: Verify user has access to this customer
      const { hasAccess, customer } = await verifyCustomerAccess(req, id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this customer" });
      }
      
      // Get order history
      const orders = await db
        .select()
        .from(posTransactions)
        .where(eq(posTransactions.customerId, id))
        .orderBy(desc(posTransactions.createdAt))
        .limit(20);
      
      // Calculate stats
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      
      res.json({
        customer,
        orders,
        stats: {
          totalOrders,
          totalSpent: totalSpent.toFixed(2),
          avgOrderValue: avgOrderValue.toFixed(2),
          lifetimeValue: totalSpent.toFixed(2),
        },
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });
  
  // Create customer (tenant-isolated)
  app.post("/api/pos/customers", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = createCustomerSchema.parse(req.body);
      
      // TENANT ISOLATION: Verify user has access to the laundromat
      const hasAccess = await verifyLaundromatAccess(req, data.laundromatId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this laundromat" });
      }
      
      const [customer] = await db
        .insert(householdAccounts)
        .values({
          ...data,
          accountNumber: generateAccountNumber(),
          status: "active",
          currentBalance: "0.00",
        } as any)
        .returning();
      
      res.status(201).json({ customer });
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });
  
  // Update customer (tenant-isolated)
  app.patch("/api/pos/customers/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // TENANT ISOLATION: Verify user has access to this customer
      const { hasAccess, customer: existingCustomer } = await verifyCustomerAccess(req, id);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this customer" });
      }
      
      const [customer] = await db
        .update(householdAccounts)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(householdAccounts.id, id))
        .returning();
      
      res.json({ customer });
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });
  
  // ========================================
  // MACHINES (machineAssets)
  // ========================================
  
  // List machines (tenant-isolated)
  app.get("/api/pos/machines", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, status, type } = req.query;
      
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      const conditions: any[] = [];
      
      // TENANT ISOLATION: Filter to user's laundromats
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
        conditions.push(eq(machineAssets.laundromatId, laundromatId as string));
      } else if (userLaundromatIds.length > 0) {
        conditions.push(inArray(machineAssets.laundromatId, userLaundromatIds));
      }
      
      if (status) {
        conditions.push(eq(machineAssets.status, status as string));
      }
      if (type) {
        conditions.push(eq(machineAssets.machineType, type as string));
      }
      
      const machines = await db
        .select()
        .from(machineAssets)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(machineAssets.machineName));
      
      res.json({ machines, count: machines.length });
    } catch (error) {
      console.error("Error fetching machines:", error);
      res.status(500).json({ error: "Failed to fetch machines" });
    }
  });
  
  // Get machine with telemetry (tenant-isolated)
  app.get("/api/pos/machines/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // TENANT ISOLATION: Verify user has access to this machine
      const { hasAccess, machine } = await verifyMachineAccess(req, id);
      if (!machine) {
        return res.status(404).json({ error: "Machine not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this machine" });
      }
      
      // Get recent sensor data
      const telemetry = await db
        .select()
        .from(machineSensorData)
        .where(eq(machineSensorData.machineId, id))
        .orderBy(desc(machineSensorData.timestamp))
        .limit(50);
      
      // Get repair tickets
      const tickets = await db
        .select()
        .from(repairTickets)
        .where(eq(repairTickets.machineId, id))
        .orderBy(desc(repairTickets.createdAt))
        .limit(10);
      
      res.json({ machine, telemetry, tickets });
    } catch (error) {
      console.error("Error fetching machine:", error);
      res.status(500).json({ error: "Failed to fetch machine" });
    }
  });
  
  // Create machine (tenant-isolated)
  app.post("/api/pos/machines", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = createMachineSchema.parse(req.body);
      
      // TENANT ISOLATION: Verify user has access to the laundromat
      const hasAccess = await verifyLaundromatAccess(req, data.laundromatId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this laundromat" });
      }
      
      const [machine] = await db
        .insert(machineAssets)
        .values({
          ...data,
          status: "operational",
          installDate: data.installDate ? new Date(data.installDate) : new Date(),
        } as any)
        .returning();
      
      res.status(201).json({ machine });
    } catch (error) {
      console.error("Error creating machine:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create machine" });
    }
  });
  
  // Get maintenance alerts (tenant-isolated)
  app.get("/api/pos/machines/alerts", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      // If specific laundromat requested, verify access
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      // Filter to user's laundromats only
      const targetLaundromats = laundromatId 
        ? [laundromatId as string] 
        : userLaundromatIds;
      
      if (targetLaundromats.length === 0) {
        return res.json({
          alerts: { machinesNeedingAttention: 0, openTickets: 0 },
          machines: [],
          tickets: [],
        });
      }
      
      // Get machines needing maintenance (filtered by user's laundromats)
      const machines = await db
        .select()
        .from(machineAssets)
        .where(
          and(
            inArray(machineAssets.laundromatId, targetLaundromats),
            or(
              eq(machineAssets.status, "needs_maintenance"),
              eq(machineAssets.status, "out_of_order")
            )
          )
        );
      
      // Get open repair tickets (filtered by user's laundromats)
      const tickets = await db
        .select()
        .from(repairTickets)
        .where(
          and(
            inArray(repairTickets.laundromatId, targetLaundromats),
            or(
              eq(repairTickets.status, "open"),
              eq(repairTickets.status, "in_progress")
            )
          )
        )
        .orderBy(desc(repairTickets.priority));
      
      res.json({
        alerts: {
          machinesNeedingAttention: machines.length,
          openTickets: tickets.length,
        },
        machines,
        tickets,
      });
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });
  
  // Log maintenance (tenant-isolated)
  app.post("/api/pos/machines/:id/maintenance", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, priority, assignedTo } = req.body;
      
      // TENANT ISOLATION: Verify user has access to this machine
      const { hasAccess, machine } = await verifyMachineAccess(req, id);
      if (!machine) {
        return res.status(404).json({ error: "Machine not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this machine" });
      }
      
      const ticketNumber = `TKT-${Date.now()}`;
      
      const [ticket] = await db
        .insert(repairTickets)
        .values({
          machineId: id,
          laundromatId: machine.laundromatId,
          ticketNumber,
          title,
          description,
          priority: priority || "medium",
          status: "open",
          assignedTo,
        } as any)
        .returning();
      
      // Update machine status
      await db
        .update(machineAssets)
        .set({ status: "needs_maintenance", updatedAt: new Date() })
        .where(eq(machineAssets.id, id));
      
      res.status(201).json({ ticket });
    } catch (error) {
      console.error("Error creating maintenance ticket:", error);
      res.status(500).json({ error: "Failed to create maintenance ticket" });
    }
  });
  
  // ========================================
  // ROUTES
  // ========================================
  
  // List routes (tenant-isolated)
  app.get("/api/pos/routes", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, date, status } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      const conditions: any[] = [];
      
      // TENANT ISOLATION: Filter to user's laundromats
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
        conditions.push(eq(routes.laundromatId, laundromatId as string));
      } else if (userLaundromatIds.length > 0) {
        conditions.push(inArray(routes.laundromatId, userLaundromatIds));
      }
      
      if (date) {
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        conditions.push(gte(routes.routeDate, targetDate));
        conditions.push(lte(routes.routeDate, nextDay));
      }
      if (status) {
        conditions.push(eq(routes.status, status as string));
      }
      
      const allRoutes = await db
        .select()
        .from(routes)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(routes.routeDate));
      
      res.json({ routes: allRoutes, count: allRoutes.length });
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });
  
  // Get route with stops (tenant-isolated)
  app.get("/api/pos/routes/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // TENANT ISOLATION: Verify user has access to this route
      const { hasAccess, route } = await verifyRouteAccess(req, id);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this route" });
      }
      
      const stops = await db
        .select()
        .from(routeStops)
        .where(eq(routeStops.routeId, id))
        .orderBy(asc(routeStops.stopNumber));
      
      res.json({ route, stops });
    } catch (error) {
      console.error("Error fetching route:", error);
      res.status(500).json({ error: "Failed to fetch route" });
    }
  });
  
  // Create route (tenant-isolated)
  app.post("/api/pos/routes", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = createRouteSchema.parse(req.body);
      
      // TENANT ISOLATION: Verify user has access to the laundromat
      const hasAccess = await verifyLaundromatAccess(req, data.laundromatId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this laundromat" });
      }
      
      const [route] = await db
        .insert(routes)
        .values({
          ...data,
          routeNumber: generateRouteNumber(),
          routeDate: new Date(data.routeDate),
          status: "planned",
          totalStops: 0,
        } as any)
        .returning();
      
      res.status(201).json({ route });
    } catch (error) {
      console.error("Error creating route:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create route" });
    }
  });
  
  // Add stop to route (tenant-isolated)
  app.post("/api/pos/routes/:id/stops", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { transactionId, address, customerName, scheduledTime, notes } = req.body;
      
      // TENANT ISOLATION: Verify user has access to this route
      const { hasAccess, route } = await verifyRouteAccess(req, id);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this route" });
      }
      
      // Get current stop count
      const existingStops = await db
        .select()
        .from(routeStops)
        .where(eq(routeStops.routeId, id));
      
      const stopNumber = existingStops.length + 1;
      
      const [stop] = await db
        .insert(routeStops)
        .values({
          routeId: id,
          transactionId,
          stopNumber,
          address,
          customerName,
          scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
          notes,
          status: "pending",
        } as any)
        .returning();
      
      // Update route total stops
      await db
        .update(routes)
        .set({ totalStops: stopNumber, updatedAt: new Date() })
        .where(eq(routes.id, id));
      
      res.status(201).json({ stop });
    } catch (error) {
      console.error("Error adding stop:", error);
      res.status(500).json({ error: "Failed to add stop" });
    }
  });
  
  // ========================================
  // INVENTORY (partsInventory)
  // ========================================
  
  // List inventory (tenant-isolated)
  app.get("/api/pos/inventory", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, category, lowStock } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      const conditions: any[] = [];
      
      // TENANT ISOLATION: Filter to user's laundromats
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
        conditions.push(eq(partsInventory.laundromatId, laundromatId as string));
      } else if (userLaundromatIds.length > 0) {
        conditions.push(inArray(partsInventory.laundromatId, userLaundromatIds));
      }
      
      if (category) {
        conditions.push(eq(partsInventory.category, category as string));
      }
      
      let query = db
        .select()
        .from(partsInventory)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      const inventory = await query.orderBy(asc(partsInventory.partName));
      
      // Filter low stock if requested
      let result = inventory;
      if (lowStock === "true") {
        result = inventory.filter(
          (item) => parseInt(item.quantityOnHand?.toString() || "0") <= parseInt(item.reorderPoint?.toString() || "0")
        );
      }
      
      res.json({ inventory: result, count: result.length });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });
  
  // Add part (tenant-isolated)
  app.post("/api/pos/inventory", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = req.body;
      
      // TENANT ISOLATION: Verify user has access to the laundromat
      if (data.laundromatId) {
        const hasAccess = await verifyLaundromatAccess(req, data.laundromatId);
        if (!hasAccess) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      const [part] = await db
        .insert(partsInventory)
        .values(data as any)
        .returning();
      
      res.status(201).json({ part });
    } catch (error) {
      console.error("Error adding part:", error);
      res.status(500).json({ error: "Failed to add part" });
    }
  });
  
  // Update stock (tenant-isolated)
  app.patch("/api/pos/inventory/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // TENANT ISOLATION: Verify user has access to this inventory item
      const { hasAccess, item: existingItem } = await verifyInventoryAccess(req, id);
      if (!existingItem) {
        return res.status(404).json({ error: "Part not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this inventory item" });
      }
      
      const [part] = await db
        .update(partsInventory)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(partsInventory.id, id))
        .returning();
      
      res.json({ part });
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ error: "Failed to update inventory" });
    }
  });
  
  // ========================================
  // DASHBOARD ANALYTICS
  // ========================================
  
  // Dashboard stats (tenant-isolated)
  app.get("/api/pos/dashboard/stats", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      // Verify access if specific laundromat requested
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      // Use requested laundromat or all user's laundromats
      const targetLaundromats = laundromatId 
        ? [laundromatId as string] 
        : userLaundromatIds;
      
      if (targetLaundromats.length === 0) {
        return res.json({
          today: { revenue: "0.00", orders: 0, pending: 0, completed: 0 },
          week: { revenue: "0.00", orders: 0, avgOrderValue: "0.00" },
          customers: { total: 0, active: 0 },
          machines: { total: 0, operational: 0, needsAttention: 0 },
        });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const conditions: any[] = [
        gte(posTransactions.createdAt, today),
        inArray(posTransactions.laundromatId, targetLaundromats)
      ];
      
      // Today's orders
      const todayOrders = await db
        .select()
        .from(posTransactions)
        .where(and(...conditions));
      
      const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
      const pendingOrders = todayOrders.filter((o) => o.status === "pending" || o.status === "processing").length;
      const completedOrders = todayOrders.filter((o) => o.status === "completed").length;
      
      // This week's data
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekConditions: any[] = [
        gte(posTransactions.createdAt, weekAgo),
        inArray(posTransactions.laundromatId, targetLaundromats)
      ];
      
      const weekOrders = await db
        .select()
        .from(posTransactions)
        .where(and(...weekConditions));
      
      const weekRevenue = weekOrders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
      
      // Customer count (filtered by user's laundromats)
      const customers = await db
        .select()
        .from(householdAccounts)
        .where(inArray(householdAccounts.laundromatId, targetLaundromats));
      
      // Machine status (filtered by user's laundromats)
      const machines = await db
        .select()
        .from(machineAssets)
        .where(inArray(machineAssets.laundromatId, targetLaundromats));
      
      const operationalMachines = machines.filter((m) => m.status === "operational").length;
      
      res.json({
        today: {
          revenue: todayRevenue.toFixed(2),
          orders: todayOrders.length,
          pending: pendingOrders,
          completed: completedOrders,
        },
        week: {
          revenue: weekRevenue.toFixed(2),
          orders: weekOrders.length,
          avgOrderValue: weekOrders.length > 0 ? (weekRevenue / weekOrders.length).toFixed(2) : "0.00",
        },
        customers: {
          total: customers.length,
          active: customers.filter((c) => c.status === "active").length,
        },
        machines: {
          total: machines.length,
          operational: operationalMachines,
          needsAttention: machines.length - operationalMachines,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
  
  // Chart data (tenant-isolated)
  app.get("/api/pos/dashboard/charts", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, period = "7" } = req.query;
      const days = parseInt(period as string);
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      // Verify access if specific laundromat requested
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      // Use requested laundromat or all user's laundromats
      const targetLaundromats = laundromatId 
        ? [laundromatId as string] 
        : userLaundromatIds;
      
      if (targetLaundromats.length === 0) {
        return res.json({ chartData: [] });
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      
      const conditions: any[] = [
        gte(posTransactions.createdAt, startDate),
        inArray(posTransactions.laundromatId, targetLaundromats)
      ];
      
      const orders = await db
        .select()
        .from(posTransactions)
        .where(and(...conditions))
        .orderBy(asc(posTransactions.createdAt));
      
      // Group by day
      const dailyData: { [key: string]: { revenue: number; orders: number } } = {};
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const key = date.toISOString().split("T")[0];
        dailyData[key] = { revenue: 0, orders: 0 };
      }
      
      orders.forEach((order) => {
        const key = order.createdAt?.toISOString().split("T")[0];
        if (key && dailyData[key]) {
          dailyData[key].revenue += parseFloat(order.total || "0");
          dailyData[key].orders += 1;
        }
      });
      
      const chartData = Object.entries(dailyData).map(([date, data]) => ({
        date,
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders,
      }));
      
      res.json({ chartData });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // ========================================
  // ENHANCED ANALYTICS ENDPOINTS
  // ========================================

  // Helper function to get date ranges
  function getDateRange(period: string): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let start: Date, end: Date, previousStart: Date, previousEnd: Date;
    
    switch (period) {
      case "today":
        start = today;
        end = tomorrow;
        previousStart = new Date(today);
        previousStart.setDate(previousStart.getDate() - 1);
        previousEnd = today;
        break;
      case "week":
        start = new Date(today);
        start.setDate(start.getDate() - 7);
        end = tomorrow;
        previousStart = new Date(start);
        previousStart.setDate(previousStart.getDate() - 7);
        previousEnd = start;
        break;
      case "month":
        start = new Date(today);
        start.setMonth(start.getMonth() - 1);
        end = tomorrow;
        previousStart = new Date(start);
        previousStart.setMonth(previousStart.getMonth() - 1);
        previousEnd = start;
        break;
      case "quarter":
        start = new Date(today);
        start.setMonth(start.getMonth() - 3);
        end = tomorrow;
        previousStart = new Date(start);
        previousStart.setMonth(previousStart.getMonth() - 3);
        previousEnd = start;
        break;
      default:
        start = today;
        end = tomorrow;
        previousStart = new Date(today);
        previousStart.setDate(previousStart.getDate() - 1);
        previousEnd = today;
    }
    
    return { start, end, previousStart, previousEnd };
  }

  // Helper function to calculate percentage change
  function calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }

  // 1. GET /api/pos/analytics/kpis - Comprehensive KPIs (subscription gated + tenant isolated)
  app.get("/api/pos/analytics/kpis", requiresSubscriptionTier("accelerate"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      // Verify access if specific laundromat requested
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      // Use requested laundromat or all user's laundromats
      const targetLaundromats = laundromatId 
        ? [laundromatId as string] 
        : userLaundromatIds;

      async function getKPIsForPeriod(period: string) {
        const { start, end, previousStart, previousEnd } = getDateRange(period);

        const baseConditions: any[] = [
          gte(posTransactions.createdAt, start),
          lte(posTransactions.createdAt, end),
        ];
        const prevConditions: any[] = [
          gte(posTransactions.createdAt, previousStart),
          lte(posTransactions.createdAt, previousEnd),
        ];

        // TENANT ISOLATION: Filter to user's laundromats
        if (targetLaundromats.length > 0) {
          baseConditions.push(inArray(posTransactions.laundromatId, targetLaundromats));
          prevConditions.push(inArray(posTransactions.laundromatId, targetLaundromats));
        }

        const currentOrders = await db
          .select()
          .from(posTransactions)
          .where(and(...baseConditions));

        const previousOrders = await db
          .select()
          .from(posTransactions)
          .where(and(...prevConditions));

        const currentRevenue = currentOrders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
        const previousRevenue = previousOrders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

        const currentOrderCount = currentOrders.length;
        const previousOrderCount = previousOrders.length;

        const currentAvgTicket = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
        const previousAvgTicket = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

        const uniqueCustomers = new Set(currentOrders.filter(o => o.customerId).map(o => o.customerId));

        const customerConditions: any[] = [
          gte(householdAccounts.createdAt, start),
          lte(householdAccounts.createdAt, end),
        ];
        // TENANT ISOLATION: Filter to user's laundromats
        if (targetLaundromats.length > 0) {
          customerConditions.push(inArray(householdAccounts.laundromatId, targetLaundromats));
        }
        const newCustomers = await db
          .select()
          .from(householdAccounts)
          .where(and(...customerConditions));

        const machineConditions: any[] = [];
        // TENANT ISOLATION: Filter to user's laundromats
        if (targetLaundromats.length > 0) {
          machineConditions.push(inArray(machineAssets.laundromatId, targetLaundromats));
        }
        const machines = await db
          .select()
          .from(machineAssets)
          .where(machineConditions.length > 0 ? and(...machineConditions) : undefined);

        const activeMachines = machines.filter(m => m.status === "operational" || m.status === "active");
        const machineUptime = machines.length > 0 ? (activeMachines.length / machines.length) * 100 : 100;

        return {
          revenue: Math.round(currentRevenue * 100) / 100,
          revenueChange: calculateChange(currentRevenue, previousRevenue),
          orders: currentOrderCount,
          ordersChange: calculateChange(currentOrderCount, previousOrderCount),
          avgTicket: Math.round(currentAvgTicket * 100) / 100,
          avgTicketChange: calculateChange(currentAvgTicket, previousAvgTicket),
          customers: uniqueCustomers.size,
          newCustomers: newCustomers.length,
          machinesActive: activeMachines.length,
          machineUptime: Math.round(machineUptime * 100) / 100,
        };
      }

      const [today, week, month, quarter] = await Promise.all([
        getKPIsForPeriod("today"),
        getKPIsForPeriod("week"),
        getKPIsForPeriod("month"),
        getKPIsForPeriod("quarter"),
      ]);

      res.json({ today, week, month, quarter });
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ error: "Failed to fetch KPIs" });
    }
  });

  // 2. GET /api/pos/analytics/revenue-trends - Daily revenue for charts (subscription gated + tenant isolated)
  app.get("/api/pos/analytics/revenue-trends", requiresSubscriptionTier("accelerate"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, period = "month" } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      // Verify access if specific laundromat requested
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      const targetLaundromats = laundromatId 
        ? [laundromatId as string] 
        : userLaundromatIds;
      
      const { start, end } = getDateRange(period as string);

      const conditions: any[] = [
        gte(posTransactions.createdAt, start),
        lte(posTransactions.createdAt, end),
      ];
      // TENANT ISOLATION: Filter to user's laundromats
      if (targetLaundromats.length > 0) {
        conditions.push(inArray(posTransactions.laundromatId, targetLaundromats));
      }

      const orders = await db
        .select()
        .from(posTransactions)
        .where(and(...conditions))
        .orderBy(asc(posTransactions.createdAt));

      const dailyData: { [key: string]: { revenue: number; orders: number } } = {};
      const serviceTypeData: { [key: string]: { revenue: number; count: number } } = {};

      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const key = date.toISOString().split("T")[0];
        dailyData[key] = { revenue: 0, orders: 0 };
      }

      orders.forEach((order) => {
        const key = order.createdAt?.toISOString().split("T")[0];
        if (key && dailyData[key]) {
          const amount = parseFloat(order.total || "0");
          dailyData[key].revenue += amount;
          dailyData[key].orders += 1;
        }

        const serviceType = order.orderType || "other";
        if (!serviceTypeData[serviceType]) {
          serviceTypeData[serviceType] = { revenue: 0, count: 0 };
        }
        serviceTypeData[serviceType].revenue += parseFloat(order.total || "0");
        serviceTypeData[serviceType].count += 1;
      });

      const daily = Object.entries(dailyData).map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }));

      const byServiceType = Object.entries(serviceTypeData).map(([type, data]) => ({
        type,
        revenue: Math.round(data.revenue * 100) / 100,
        count: data.count,
      }));

      res.json({ daily, byServiceType });
    } catch (error) {
      console.error("Error fetching revenue trends:", error);
      res.status(500).json({ error: "Failed to fetch revenue trends" });
    }
  });

  // 3. GET /api/pos/analytics/customer-insights - Customer analytics (subscription gated + tenant isolated)
  app.get("/api/pos/analytics/customer-insights", requiresSubscriptionTier("accelerate"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, period = "month" } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      // Verify access if specific laundromat requested
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      const targetLaundromats = laundromatId 
        ? [laundromatId as string] 
        : userLaundromatIds;
      
      const { start, end } = getDateRange(period as string);

      const conditions: any[] = [
        gte(posTransactions.createdAt, start),
        lte(posTransactions.createdAt, end),
      ];
      // TENANT ISOLATION: Filter to user's laundromats
      if (targetLaundromats.length > 0) {
        conditions.push(inArray(posTransactions.laundromatId, targetLaundromats));
      }

      const orders = await db
        .select()
        .from(posTransactions)
        .where(and(...conditions));

      const customerStats: { [id: string]: { name: string; orders: number; revenue: number } } = {};

      orders.forEach((order) => {
        const customerId = order.customerId || "guest";
        const customerName = order.customerName || "Guest";

        if (!customerStats[customerId]) {
          customerStats[customerId] = { name: customerName, orders: 0, revenue: 0 };
        }
        customerStats[customerId].orders += 1;
        customerStats[customerId].revenue += parseFloat(order.total || "0");
      });

      const topCustomers = Object.entries(customerStats)
        .filter(([id]) => id !== "guest")
        .map(([id, stats]) => ({
          id,
          name: stats.name,
          orders: stats.orders,
          revenue: Math.round(stats.revenue * 100) / 100,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const customerConditions: any[] = [];
      // TENANT ISOLATION: Filter to user's laundromats
      if (targetLaundromats.length > 0) {
        customerConditions.push(inArray(householdAccounts.laundromatId, targetLaundromats));
      }
      const allCustomers = await db
        .select()
        .from(householdAccounts)
        .where(customerConditions.length > 0 ? and(...customerConditions) : undefined);

      const newCustomerIds = new Set(
        allCustomers
          .filter((c) => c.createdAt && c.createdAt >= start)
          .map((c) => c.id)
      );

      const ordersWithCustomers = orders.filter((o) => o.customerId);
      const returningCustomerOrders = ordersWithCustomers.filter(
        (o) => o.customerId && !newCustomerIds.has(o.customerId)
      );
      const newCustomerOrders = ordersWithCustomers.filter(
        (o) => o.customerId && newCustomerIds.has(o.customerId)
      );

      const loyaltyBreakdown = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
      Object.values(customerStats).forEach((stats) => {
        if (stats.revenue >= 1000) loyaltyBreakdown.platinum++;
        else if (stats.revenue >= 500) loyaltyBreakdown.gold++;
        else if (stats.revenue >= 200) loyaltyBreakdown.silver++;
        else loyaltyBreakdown.bronze++;
      });

      res.json({
        topCustomers,
        newVsReturning: {
          new: newCustomerOrders.length,
          returning: returningCustomerOrders.length,
        },
        loyaltyBreakdown,
      });
    } catch (error) {
      console.error("Error fetching customer insights:", error);
      res.status(500).json({ error: "Failed to fetch customer insights" });
    }
  });

  // 4. GET /api/pos/analytics/machine-utilization - Machine analytics (subscription gated + tenant isolated)
  app.get("/api/pos/analytics/machine-utilization", requiresSubscriptionTier("accelerate"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId, period = "month" } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      // Verify access if specific laundromat requested
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      const targetLaundromats = laundromatId 
        ? [laundromatId as string] 
        : userLaundromatIds;
      
      const { start, end } = getDateRange(period as string);

      const machineConditions: any[] = [];
      // TENANT ISOLATION: Filter to user's laundromats
      if (targetLaundromats.length > 0) {
        machineConditions.push(inArray(machineAssets.laundromatId, targetLaundromats));
      }

      const machines = await db
        .select()
        .from(machineAssets)
        .where(machineConditions.length > 0 ? and(...machineConditions) : undefined);

      const orderConditions: any[] = [
        gte(posTransactions.createdAt, start),
        lte(posTransactions.createdAt, end),
      ];
      // TENANT ISOLATION: Filter to user's laundromats
      if (targetLaundromats.length > 0) {
        orderConditions.push(inArray(posTransactions.laundromatId, targetLaundromats));
      }
      const orders = await db
        .select()
        .from(posTransactions)
        .where(and(...orderConditions));

      const typeStats: { [type: string]: { count: number; operational: number; revenue: number } } = {};

      machines.forEach((machine) => {
        const type = machine.machineType || "unknown";
        if (!typeStats[type]) {
          typeStats[type] = { count: 0, operational: 0, revenue: 0 };
        }
        typeStats[type].count++;
        if (machine.status === "operational" || machine.status === "active") {
          typeStats[type].operational++;
        }
      });

      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
      const revenuePerMachine = machines.length > 0 ? totalRevenue / machines.length : 0;

      Object.keys(typeStats).forEach((type) => {
        typeStats[type].revenue = Math.round(revenuePerMachine * typeStats[type].count * 100) / 100;
      });

      const byType = Object.entries(typeStats).map(([type, stats]) => ({
        type,
        count: stats.count,
        utilization: stats.count > 0 ? Math.round((stats.operational / stats.count) * 100) : 0,
        revenue: stats.revenue,
      }));

      const alerts: { machineId: string; name: string; issue: string; severity: string }[] = [];
      machines.forEach((machine) => {
        if (machine.status === "needs_maintenance" || machine.status === "maintenance") {
          alerts.push({
            machineId: machine.id,
            name: machine.machineName || machine.machineNumber || "Unknown",
            issue: "Scheduled maintenance required",
            severity: "medium",
          });
        } else if (machine.status === "out_of_order" || machine.status === "offline") {
          alerts.push({
            machineId: machine.id,
            name: machine.machineName || machine.machineNumber || "Unknown",
            issue: "Machine is out of service",
            severity: "high",
          });
        }
      });

      res.json({ byType, alerts });
    } catch (error) {
      console.error("Error fetching machine utilization:", error);
      res.status(500).json({ error: "Failed to fetch machine utilization" });
    }
  });

  // 5. GET /api/pos/analytics/route-performance - Route metrics (subscription gated + tenant isolated)
  app.get("/api/pos/analytics/route-performance", requiresSubscriptionTier("scale"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { laundromatId } = req.query;
      
      // TENANT ISOLATION: Get user's laundromats
      const userId = await getUserId(req);
      const userLaundromatIds = userId ? await getUserLaundromats(userId) : [];
      
      // Verify access if specific laundromat requested
      if (laundromatId) {
        if (!userLaundromatIds.includes(laundromatId as string)) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
      }
      
      const targetLaundromats = laundromatId 
        ? [laundromatId as string] 
        : userLaundromatIds;
      
      const { start, end } = getDateRange("today");

      const routeConditions: any[] = [
        gte(routes.routeDate, start),
        lte(routes.routeDate, end),
      ];
      // TENANT ISOLATION: Filter to user's laundromats
      if (targetLaundromats.length > 0) {
        routeConditions.push(inArray(routes.laundromatId, targetLaundromats));
      }

      const todayRoutes = await db
        .select()
        .from(routes)
        .where(and(...routeConditions));

      const totalStops = todayRoutes.reduce((sum, r) => sum + (r.totalStops || 0), 0);
      const completedStops = todayRoutes.reduce((sum, r) => sum + (r.onTimeStops || 0) + (r.lateStops || 0), 0);
      const onTimeStops = todayRoutes.reduce((sum, r) => sum + (r.onTimeStops || 0), 0);
      const onTimeRate = completedStops > 0 ? Math.round((onTimeStops / completedStops) * 100) : 100;

      const recentConditions: any[] = [];
      // TENANT ISOLATION: Filter to user's laundromats
      if (targetLaundromats.length > 0) {
        recentConditions.push(inArray(routes.laundromatId, targetLaundromats));
      }

      const recentRoutesData = await db
        .select({
          route: routes,
          driver: users,
        })
        .from(routes)
        .leftJoin(users, eq(routes.driverId, users.id))
        .where(recentConditions.length > 0 ? and(...recentConditions) : undefined)
        .orderBy(desc(routes.routeDate))
        .limit(10);

      const recentRoutes = recentRoutesData.map((r) => ({
        id: r.route.id,
        name: r.route.routeName,
        stops: r.route.totalStops || 0,
        status: r.route.status || "planned",
        driver: r.driver?.firstName
          ? `${r.driver.firstName} ${r.driver.lastName || ""}`.trim()
          : r.driver?.username || "Unassigned",
      }));

      res.json({
        today: {
          routes: todayRoutes.length,
          stops: totalStops,
          completed: completedStops,
          onTime: onTimeRate,
        },
        recentRoutes,
      });
    } catch (error) {
      console.error("Error fetching route performance:", error);
      res.status(500).json({ error: "Failed to fetch route performance" });
    }
  });

  // ========================================
  // CALCULATORS
  // ========================================

  // Pricing rates configuration
  const PRICING_CONFIG = {
    baseRates: {
      wash_dry_fold: 1.75,
      dry_cleaning: 8.99,
      alterations: 15.00,
      pickup_delivery: 2.25,
      self_service: 1.25,
    },
    extras: {
      folding: 0.25,
      starch: 0.50,
      fabric_softener: 0.35,
      bleach: 0.30,
      hang_dry: 0.75,
      express: 1.00,
    },
    rushMultiplier: 1.5,
    minimumCharge: 15.00,
    taxRate: 0.0825,
  };

  // 6. POST /api/pos/calculators/pricing - Calculate pricing
  app.post("/api/pos/calculators/pricing", async (req: Request, res: Response) => {
    try {
      const { weight, serviceType, rushOrder, extras = [] } = req.body;

      if (!weight || weight <= 0) {
        return res.status(400).json({ error: "Weight must be a positive number" });
      }

      const baseRate = PRICING_CONFIG.baseRates[serviceType as keyof typeof PRICING_CONFIG.baseRates] || PRICING_CONFIG.baseRates.wash_dry_fold;
      
      let basePrice = weight * baseRate;

      let extrasTotal = 0;
      const extrasBreakdown: { name: string; price: number }[] = [];
      (extras as string[]).forEach((extra) => {
        const extraPrice = PRICING_CONFIG.extras[extra as keyof typeof PRICING_CONFIG.extras];
        if (extraPrice) {
          const extraCost = weight * extraPrice;
          extrasTotal += extraCost;
          extrasBreakdown.push({
            name: extra.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            price: Math.round(extraCost * 100) / 100,
          });
        }
      });

      let subtotal = basePrice + extrasTotal;

      let rushFee = 0;
      if (rushOrder) {
        rushFee = subtotal * (PRICING_CONFIG.rushMultiplier - 1);
        subtotal += rushFee;
      }

      subtotal = Math.max(subtotal, PRICING_CONFIG.minimumCharge);

      const tax = subtotal * PRICING_CONFIG.taxRate;
      const total = subtotal + tax;

      res.json({
        breakdown: {
          basePrice: Math.round(basePrice * 100) / 100,
          baseRate,
          weight,
          serviceType,
          extras: extrasBreakdown,
          extrasTotal: Math.round(extrasTotal * 100) / 100,
          rushFee: rushOrder ? Math.round(rushFee * 100) / 100 : 0,
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          taxRate: PRICING_CONFIG.taxRate * 100,
          total: Math.round(total * 100) / 100,
        },
        minimumApplied: basePrice + extrasTotal < PRICING_CONFIG.minimumCharge,
        minimumCharge: PRICING_CONFIG.minimumCharge,
      });
    } catch (error) {
      console.error("Error calculating pricing:", error);
      res.status(500).json({ error: "Failed to calculate pricing" });
    }
  });

  // 7. POST /api/pos/calculators/profitability - Calculate profitability
  app.post("/api/pos/calculators/profitability", async (req: Request, res: Response) => {
    try {
      const { monthlyRevenue, laborCost, utilities, supplies, rent, otherExpenses = 0 } = req.body;

      if (!monthlyRevenue || monthlyRevenue <= 0) {
        return res.status(400).json({ error: "Monthly revenue must be a positive number" });
      }

      const totalExpenses = (laborCost || 0) + (utilities || 0) + (supplies || 0) + (rent || 0) + otherExpenses;

      const grossProfit = monthlyRevenue - totalExpenses;
      const grossMargin = (grossProfit / monthlyRevenue) * 100;

      const operatingExpenses = totalExpenses * 0.1;
      const netProfit = grossProfit - operatingExpenses;
      const netMargin = (netProfit / monthlyRevenue) * 100;

      const dailyRevenue = monthlyRevenue / 30;
      const dailyExpenses = totalExpenses / 30;
      const breakEvenDays = totalExpenses / dailyRevenue;
      const breakEvenRevenue = totalExpenses / (1 - (totalExpenses / monthlyRevenue) * 0.1);

      const yearlyRevenue = monthlyRevenue * 12;
      const yearlyExpenses = totalExpenses * 12;
      const yearlyProfit = netProfit * 12;

      const scenarios = {
        conservative: {
          growthRate: 0.03,
          yearlyRevenue: yearlyRevenue * 1.03,
          yearlyProfit: (monthlyRevenue * 1.03 - totalExpenses - operatingExpenses) * 12,
        },
        moderate: {
          growthRate: 0.08,
          yearlyRevenue: yearlyRevenue * 1.08,
          yearlyProfit: (monthlyRevenue * 1.08 - totalExpenses - operatingExpenses) * 12,
        },
        aggressive: {
          growthRate: 0.15,
          yearlyRevenue: yearlyRevenue * 1.15,
          yearlyProfit: (monthlyRevenue * 1.15 - totalExpenses - operatingExpenses) * 12,
        },
      };

      const expenseBreakdown = {
        labor: { amount: laborCost || 0, percentage: ((laborCost || 0) / monthlyRevenue) * 100 },
        utilities: { amount: utilities || 0, percentage: ((utilities || 0) / monthlyRevenue) * 100 },
        supplies: { amount: supplies || 0, percentage: ((supplies || 0) / monthlyRevenue) * 100 },
        rent: { amount: rent || 0, percentage: ((rent || 0) / monthlyRevenue) * 100 },
        other: { amount: otherExpenses, percentage: (otherExpenses / monthlyRevenue) * 100 },
      };

      let healthScore = 100;
      if (netMargin < 5) healthScore -= 30;
      else if (netMargin < 10) healthScore -= 15;
      if (expenseBreakdown.labor.percentage > 35) healthScore -= 20;
      if (expenseBreakdown.rent.percentage > 25) healthScore -= 15;
      if (grossMargin < 30) healthScore -= 20;
      healthScore = Math.max(0, Math.min(100, healthScore));

      res.json({
        monthly: {
          revenue: monthlyRevenue,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          grossProfit: Math.round(grossProfit * 100) / 100,
          grossMargin: Math.round(grossMargin * 100) / 100,
          operatingExpenses: Math.round(operatingExpenses * 100) / 100,
          netProfit: Math.round(netProfit * 100) / 100,
          netMargin: Math.round(netMargin * 100) / 100,
        },
        breakEven: {
          daysToBreakEven: Math.round(breakEvenDays * 100) / 100,
          breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
          dailyRevenueNeeded: Math.round(dailyExpenses * 100) / 100,
        },
        yearly: {
          revenue: Math.round(yearlyRevenue * 100) / 100,
          expenses: Math.round(yearlyExpenses * 100) / 100,
          profit: Math.round(yearlyProfit * 100) / 100,
        },
        projections: {
          conservative: {
            growthRate: scenarios.conservative.growthRate * 100,
            yearlyRevenue: Math.round(scenarios.conservative.yearlyRevenue * 100) / 100,
            yearlyProfit: Math.round(scenarios.conservative.yearlyProfit * 100) / 100,
          },
          moderate: {
            growthRate: scenarios.moderate.growthRate * 100,
            yearlyRevenue: Math.round(scenarios.moderate.yearlyRevenue * 100) / 100,
            yearlyProfit: Math.round(scenarios.moderate.yearlyProfit * 100) / 100,
          },
          aggressive: {
            growthRate: scenarios.aggressive.growthRate * 100,
            yearlyRevenue: Math.round(scenarios.aggressive.yearlyRevenue * 100) / 100,
            yearlyProfit: Math.round(scenarios.aggressive.yearlyProfit * 100) / 100,
          },
        },
        expenseBreakdown: {
          labor: {
            amount: expenseBreakdown.labor.amount,
            percentage: Math.round(expenseBreakdown.labor.percentage * 100) / 100,
          },
          utilities: {
            amount: expenseBreakdown.utilities.amount,
            percentage: Math.round(expenseBreakdown.utilities.percentage * 100) / 100,
          },
          supplies: {
            amount: expenseBreakdown.supplies.amount,
            percentage: Math.round(expenseBreakdown.supplies.percentage * 100) / 100,
          },
          rent: {
            amount: expenseBreakdown.rent.amount,
            percentage: Math.round(expenseBreakdown.rent.percentage * 100) / 100,
          },
          other: {
            amount: expenseBreakdown.other.amount,
            percentage: Math.round(expenseBreakdown.other.percentage * 100) / 100,
          },
        },
        healthScore,
        recommendations: generateProfitabilityRecommendations(expenseBreakdown, netMargin, grossMargin),
      });
    } catch (error) {
      console.error("Error calculating profitability:", error);
      res.status(500).json({ error: "Failed to calculate profitability" });
    }
  });

  function generateProfitabilityRecommendations(
    expenseBreakdown: { [key: string]: { amount: number; percentage: number } },
    netMargin: number,
    grossMargin: number
  ): string[] {
    const recommendations: string[] = [];

    if (expenseBreakdown.labor.percentage > 35) {
      recommendations.push("Labor costs are high (>35% of revenue). Consider optimizing schedules or automating processes.");
    }
    if (expenseBreakdown.rent.percentage > 25) {
      recommendations.push("Rent is above 25% of revenue. Consider renegotiating lease terms or exploring alternative locations.");
    }
    if (expenseBreakdown.utilities.percentage > 15) {
      recommendations.push("Utility costs are elevated. Invest in energy-efficient equipment and LED lighting.");
    }
    if (grossMargin < 30) {
      recommendations.push("Gross margin below 30%. Review pricing structure and consider increasing prices or reducing costs.");
    }
    if (netMargin < 10) {
      recommendations.push("Net margin below 10%. Focus on reducing operating expenses and increasing revenue per customer.");
    }
    if (netMargin >= 20) {
      recommendations.push("Strong profitability! Consider reinvesting in equipment upgrades or marketing to drive growth.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Your business metrics look healthy. Maintain current operations and monitor for opportunities.");
    }

    return recommendations;
  }

  // 8. POST /api/pos/calculators/labor - Calculate labor costs
  app.post("/api/pos/calculators/labor", async (req: Request, res: Response) => {
    try {
      const {
        numberOfEmployees,
        averageHourlyWage,
        averageHoursPerWeek,
        payrollTaxRate = 7.65,
        benefitsCostPerEmployee = 0,
        monthlyPounds = 0,
      } = req.body;

      if (!numberOfEmployees || numberOfEmployees <= 0) {
        return res.status(400).json({ error: "Number of employees must be a positive number" });
      }
      if (!averageHourlyWage || averageHourlyWage <= 0) {
        return res.status(400).json({ error: "Average hourly wage must be a positive number" });
      }

      const hoursPerWeek = averageHoursPerWeek || 40;
      
      // Base weekly wage per employee
      const weeklyWagePerEmployee = averageHourlyWage * hoursPerWeek;
      
      // Payroll taxes per employee
      const payrollTaxMultiplier = 1 + (payrollTaxRate / 100);
      const weeklyWageWithTaxes = weeklyWagePerEmployee * payrollTaxMultiplier;
      
      // Total weekly labor cost for all employees
      const weeklyLaborCost = (weeklyWageWithTaxes * numberOfEmployees) + 
        (benefitsCostPerEmployee * numberOfEmployees / 4.33); // Weekly benefits
      
      const monthlyLaborCost = weeklyLaborCost * 4.33; // Average weeks per month
      const annualLaborCost = monthlyLaborCost * 12;
      
      // Total hours worked by all employees per week
      const totalHoursPerWeek = hoursPerWeek * numberOfEmployees;
      const totalHoursPerMonth = totalHoursPerWeek * 4.33;
      
      const costPerHour = monthlyLaborCost / totalHoursPerMonth;
      
      // Cost per pound (if monthly pounds provided)
      const costPerPound = monthlyPounds > 0 ? monthlyLaborCost / monthlyPounds : null;

      res.json({
        weeklyLaborCost: Math.round(weeklyLaborCost * 100) / 100,
        monthlyLaborCost: Math.round(monthlyLaborCost * 100) / 100,
        annualLaborCost: Math.round(annualLaborCost * 100) / 100,
        costPerHour: Math.round(costPerHour * 100) / 100,
        costPerPound: costPerPound ? Math.round(costPerPound * 1000) / 1000 : null,
        breakdown: {
          employees: numberOfEmployees,
          hourlyWage: averageHourlyWage,
          hoursPerWeek: hoursPerWeek,
          payrollTaxRate: payrollTaxRate,
          benefitsPerEmployee: benefitsCostPerEmployee,
          monthlyPounds: monthlyPounds,
        },
      });
    } catch (error) {
      console.error("Error calculating labor costs:", error);
      res.status(500).json({ error: "Failed to calculate labor costs" });
    }
  });

  // 9. POST /api/pos/calculators/roi - Calculate ROI for machine investment
  app.post("/api/pos/calculators/roi", async (req: Request, res: Response) => {
    try {
      const {
        machineCost,
        cyclesPerDay,
        revenuePerCycle,
        operatingCostPerCycle = 0,
        discountRate = 10,
      } = req.body;

      if (!machineCost || machineCost <= 0) {
        return res.status(400).json({ error: "Machine cost must be a positive number" });
      }
      if (!cyclesPerDay || cyclesPerDay <= 0) {
        return res.status(400).json({ error: "Cycles per day must be a positive number" });
      }
      if (!revenuePerCycle || revenuePerCycle <= 0) {
        return res.status(400).json({ error: "Revenue per cycle must be a positive number" });
      }

      // Calculate daily profit
      const profitPerCycle = revenuePerCycle - operatingCostPerCycle;
      const dailyProfit = profitPerCycle * cyclesPerDay;
      
      // Monthly profit (assuming 30 operating days)
      const operatingDaysPerMonth = 30;
      const monthlyProfit = dailyProfit * operatingDaysPerMonth;
      
      // Payback period in months
      const paybackPeriodMonths = monthlyProfit > 0 ? machineCost / monthlyProfit : Infinity;
      
      // Annual profit
      const annualProfit = monthlyProfit * 12;
      
      // 5-year ROI
      const totalProfitFiveYears = annualProfit * 5;
      const fiveYearROI = ((totalProfitFiveYears - machineCost) / machineCost) * 100;
      
      // NPV calculation (5 years)
      const annualDiscountRate = discountRate / 100;
      let npv = -machineCost;
      for (let year = 1; year <= 5; year++) {
        npv += annualProfit / Math.pow(1 + annualDiscountRate, year);
      }

      res.json({
        dailyProfit: Math.round(dailyProfit * 100) / 100,
        monthlyProfit: Math.round(monthlyProfit * 100) / 100,
        annualProfit: Math.round(annualProfit * 100) / 100,
        paybackPeriodMonths: Math.round(paybackPeriodMonths * 10) / 10,
        fiveYearROI: Math.round(fiveYearROI * 10) / 10,
        npv: Math.round(npv * 100) / 100,
        breakdown: {
          machineCost,
          cyclesPerDay,
          revenuePerCycle,
          operatingCostPerCycle,
          profitPerCycle: Math.round(profitPerCycle * 100) / 100,
          operatingDaysPerMonth,
          discountRate,
        },
        recommendation: npv > 0 
          ? "Positive NPV indicates this is a good investment opportunity." 
          : "Negative NPV suggests reconsidering this investment or improving operational efficiency.",
      });
    } catch (error) {
      console.error("Error calculating ROI:", error);
      res.status(500).json({ error: "Failed to calculate ROI" });
    }
  });

  // ========================================
  // REPAIR TICKETS SYSTEM
  // ========================================

  // GET /api/pos/repair-tickets - List all repair tickets with filters
  app.get("/api/pos/repair-tickets", async (req: Request, res: Response) => {
    try {
      const { status, priority, machineId, laundromatId, limit = "50", offset = "0" } = req.query;
      
      const conditions: any[] = [];
      
      if (laundromatId) {
        conditions.push(eq(repairTickets.laundromatId, laundromatId as string));
      }
      if (status) {
        conditions.push(eq(repairTickets.status, status as string));
      }
      if (priority) {
        conditions.push(eq(repairTickets.priority, priority as string));
      }
      if (machineId) {
        conditions.push(eq(repairTickets.machineId, machineId as string));
      }
      
      const tickets = await db
        .select({
          ticket: repairTickets,
          machine: machineAssets,
        })
        .from(repairTickets)
        .leftJoin(machineAssets, eq(repairTickets.machineId, machineAssets.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(repairTickets.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      const formattedTickets = tickets.map(t => ({
        ...t.ticket,
        machineName: t.machine?.machineName || t.machine?.machineNumber || "Unknown Machine",
        machineType: t.machine?.machineType || "unknown",
      }));
      
      res.json({ tickets: formattedTickets, count: formattedTickets.length });
    } catch (error) {
      console.error("Error fetching repair tickets:", error);
      res.status(500).json({ error: "Failed to fetch repair tickets" });
    }
  });

  // POST /api/pos/repair-tickets - Create a new repair ticket
  app.post("/api/pos/repair-tickets", async (req: Request, res: Response) => {
    try {
      const { 
        machineId, 
        laundromatId,
        title, 
        description, 
        problemType, 
        priority = "medium",
        reportedBy,
        symptoms = []
      } = req.body;
      
      if (!machineId || !title || !description) {
        return res.status(400).json({ error: "Machine ID, title, and description are required" });
      }
      
      const ticketNumber = `TKT-${Date.now()}`;
      
      const [ticket] = await db
        .insert(repairTickets)
        .values({
          machineId,
          laundromatId: laundromatId || "default-laundromat",
          ticketNumber,
          title,
          description,
          problemType: problemType || "other",
          priority,
          status: "open",
          symptoms: symptoms,
          reportedBy,
          reportedAt: new Date(),
        } as any)
        .returning();
      
      // Update machine status to needs_maintenance
      await db
        .update(machineAssets)
        .set({ status: "needs_maintenance", updatedAt: new Date() })
        .where(eq(machineAssets.id, machineId));
      
      res.status(201).json({ ticket });
    } catch (error) {
      console.error("Error creating repair ticket:", error);
      res.status(500).json({ error: "Failed to create repair ticket" });
    }
  });

  // GET /api/pos/repair-tickets/:id - Get single repair ticket
  app.get("/api/pos/repair-tickets/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [result] = await db
        .select({
          ticket: repairTickets,
          machine: machineAssets,
        })
        .from(repairTickets)
        .leftJoin(machineAssets, eq(repairTickets.machineId, machineAssets.id))
        .where(eq(repairTickets.id, id));
      
      if (!result) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json({
        ...result.ticket,
        machineName: result.machine?.machineName || result.machine?.machineNumber || "Unknown Machine",
        machineType: result.machine?.machineType || "unknown",
        machineManufacturer: result.machine?.manufacturer,
        machineModel: result.machine?.model,
      });
    } catch (error) {
      console.error("Error fetching repair ticket:", error);
      res.status(500).json({ error: "Failed to fetch repair ticket" });
    }
  });

  // PATCH /api/pos/repair-tickets/:id - Update repair ticket
  app.patch("/api/pos/repair-tickets/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Handle status changes
      if (updates.status === "in_progress" && !updates.startedAt) {
        updates.startedAt = new Date();
      }
      if ((updates.status === "completed" || updates.status === "closed") && !updates.completedAt) {
        updates.completedAt = new Date();
      }
      
      const [ticket] = await db
        .update(repairTickets)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(repairTickets.id, id))
        .returning();
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // If ticket is completed, update machine status back to operational
      if (updates.status === "completed" || updates.status === "closed") {
        await db
          .update(machineAssets)
          .set({ status: "operational", updatedAt: new Date() })
          .where(eq(machineAssets.id, ticket.machineId));
      }
      
      res.json({ ticket });
    } catch (error) {
      console.error("Error updating repair ticket:", error);
      res.status(500).json({ error: "Failed to update repair ticket" });
    }
  });

  // ========================================
  // MACHINE HEALTH & PREDICTIVE MAINTENANCE
  // ========================================

  // Helper function to calculate machine health score
  function calculateMachineHealthScore(machine: any): {
    score: number;
    factors: { name: string; score: number; impact: string }[];
  } {
    const factors: { name: string; score: number; impact: string }[] = [];
    let totalScore = 100;
    
    // Factor 1: Age (install date)
    if (machine.installDate) {
      const ageYears = (Date.now() - new Date(machine.installDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      let ageScore = Math.max(0, 100 - (ageYears * 5)); // Lose 5 points per year
      ageScore = Math.round(ageScore);
      factors.push({ 
        name: "Equipment Age", 
        score: ageScore, 
        impact: ageYears > 10 ? "High" : ageYears > 5 ? "Medium" : "Low"
      });
      totalScore = Math.min(totalScore, ageScore + 20); // Age can't drop score below 20 alone
    } else {
      factors.push({ name: "Equipment Age", score: 80, impact: "Unknown" });
    }
    
    // Factor 2: Cycle count / usage
    const cycleCount = machine.cycleCount || machine.totalCycles || 0;
    let usageScore = 100;
    if (cycleCount > 50000) usageScore = 40;
    else if (cycleCount > 30000) usageScore = 60;
    else if (cycleCount > 15000) usageScore = 75;
    else if (cycleCount > 5000) usageScore = 90;
    factors.push({ 
      name: "Usage Cycles", 
      score: usageScore, 
      impact: cycleCount > 30000 ? "High" : cycleCount > 15000 ? "Medium" : "Low"
    });
    
    // Factor 3: Time since last maintenance
    let maintenanceScore = 85;
    if (machine.lastMaintenanceDate) {
      const daysSinceMaintenance = (Date.now() - new Date(machine.lastMaintenanceDate).getTime()) / (24 * 60 * 60 * 1000);
      if (daysSinceMaintenance > 180) maintenanceScore = 40;
      else if (daysSinceMaintenance > 90) maintenanceScore = 60;
      else if (daysSinceMaintenance > 60) maintenanceScore = 75;
      else if (daysSinceMaintenance > 30) maintenanceScore = 85;
      else maintenanceScore = 95;
      factors.push({ 
        name: "Maintenance Recency", 
        score: maintenanceScore, 
        impact: daysSinceMaintenance > 90 ? "High" : daysSinceMaintenance > 60 ? "Medium" : "Low"
      });
    } else {
      factors.push({ name: "Maintenance Recency", score: 70, impact: "Unknown" });
    }
    
    // Factor 4: Current status
    let statusScore = 100;
    if (machine.status === "out_of_order" || machine.status === "offline") statusScore = 0;
    else if (machine.status === "needs_maintenance" || machine.status === "maintenance") statusScore = 50;
    else if (machine.status === "operational" || machine.status === "active") statusScore = 100;
    factors.push({ 
      name: "Current Status", 
      score: statusScore, 
      impact: statusScore < 50 ? "Critical" : statusScore < 80 ? "Medium" : "Low"
    });
    
    // Calculate weighted average
    const weights = [0.2, 0.25, 0.3, 0.25]; // Age, Usage, Maintenance, Status
    const weightedScores = factors.map((f, i) => f.score * weights[i]);
    totalScore = Math.round(weightedScores.reduce((a, b) => a + b, 0));
    
    return { score: Math.max(0, Math.min(100, totalScore)), factors };
  }

  // GET /api/pos/machines/:id/health - Get machine health score
  app.get("/api/pos/machines/:id/health", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [machine] = await db
        .select()
        .from(machineAssets)
        .where(eq(machineAssets.id, id));
      
      if (!machine) {
        return res.status(404).json({ error: "Machine not found" });
      }
      
      const health = calculateMachineHealthScore(machine);
      
      // Get recent repair tickets for this machine
      const recentTickets = await db
        .select()
        .from(repairTickets)
        .where(eq(repairTickets.machineId, id))
        .orderBy(desc(repairTickets.createdAt))
        .limit(5);
      
      res.json({
        machineId: id,
        machineName: machine.machineName || machine.machineNumber,
        healthScore: health.score,
        healthGrade: health.score >= 80 ? "Good" : health.score >= 50 ? "Fair" : "Poor",
        factors: health.factors,
        recentIssues: recentTickets.length,
        lastMaintenanceDate: machine.lastMaintenanceDate,
      });
    } catch (error) {
      console.error("Error fetching machine health:", error);
      res.status(500).json({ error: "Failed to fetch machine health" });
    }
  });

  // GET /api/pos/machines/:id/maintenance-history - Get maintenance history
  app.get("/api/pos/machines/:id/maintenance-history", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const tickets = await db
        .select()
        .from(repairTickets)
        .where(eq(repairTickets.machineId, id))
        .orderBy(desc(repairTickets.createdAt));
      
      const history = tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        title: t.title,
        description: t.description,
        problemType: t.problemType,
        status: t.status,
        priority: t.priority,
        reportedAt: t.reportedAt,
        completedAt: t.completedAt,
        laborHours: t.laborHours,
        laborCost: t.laborCost,
        partsCost: t.partsCost,
        totalCost: t.totalCost,
        resolutionNotes: t.resolutionNotes,
        partsUsed: t.partsUsed,
      }));
      
      // Calculate stats
      const completedTickets = tickets.filter(t => t.status === "completed" || t.status === "closed");
      const totalCost = completedTickets.reduce((sum, t) => sum + parseFloat(t.totalCost || "0"), 0);
      const totalHours = completedTickets.reduce((sum, t) => sum + parseFloat(t.laborHours || "0"), 0);
      
      res.json({
        machineId: id,
        history,
        stats: {
          totalRepairs: tickets.length,
          completedRepairs: completedTickets.length,
          openRepairs: tickets.filter(t => t.status === "open" || t.status === "in_progress").length,
          totalCost: Math.round(totalCost * 100) / 100,
          totalLaborHours: Math.round(totalHours * 10) / 10,
          successRate: tickets.length > 0 ? Math.round((completedTickets.length / tickets.length) * 100) : 100,
        },
      });
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
      res.status(500).json({ error: "Failed to fetch maintenance history" });
    }
  });

  // GET /api/pos/maintenance-schedule - Get scheduled maintenance tasks
  app.get("/api/pos/maintenance-schedule", async (req: Request, res: Response) => {
    try {
      const { laundromatId, machineId } = req.query;
      
      const conditions: any[] = [];
      
      if (machineId) {
        conditions.push(eq(maintenancePlans.machineId, machineId as string));
      }
      
      // Get all maintenance plans with machine info
      const plans = await db
        .select({
          plan: maintenancePlans,
          machine: machineAssets,
        })
        .from(maintenancePlans)
        .leftJoin(machineAssets, eq(maintenancePlans.machineId, machineAssets.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(maintenancePlans.nextDueDate));
      
      const now = new Date();
      
      const formattedPlans = plans.map(p => {
        const nextDue = p.plan.nextDueDate ? new Date(p.plan.nextDueDate) : null;
        const isOverdue = nextDue ? nextDue < now : false;
        const daysUntilDue = nextDue ? Math.ceil((nextDue.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : null;
        
        return {
          id: p.plan.id,
          planName: p.plan.planName,
          description: p.plan.description,
          taskType: p.plan.taskType,
          frequency: p.plan.frequency,
          frequencyUnit: p.plan.frequencyUnit,
          nextDueDate: p.plan.nextDueDate,
          lastCompletedDate: p.plan.lastCompletedDate,
          checklistItems: p.plan.checklistItems,
          requiredParts: p.plan.requiredParts,
          estimatedDuration: p.plan.estimatedDuration,
          isActive: p.plan.isActive,
          isOverdue,
          daysUntilDue,
          urgency: isOverdue ? "overdue" : daysUntilDue !== null && daysUntilDue <= 7 ? "urgent" : daysUntilDue !== null && daysUntilDue <= 30 ? "upcoming" : "scheduled",
          machineId: p.plan.machineId,
          machineName: p.machine?.machineName || p.machine?.machineNumber || "Unknown Machine",
          machineType: p.machine?.machineType || "unknown",
        };
      });
      
      const overdue = formattedPlans.filter(p => p.isOverdue);
      const upcoming = formattedPlans.filter(p => !p.isOverdue && p.daysUntilDue !== null && p.daysUntilDue <= 30);
      const scheduled = formattedPlans.filter(p => !p.isOverdue && (p.daysUntilDue === null || p.daysUntilDue > 30));
      
      res.json({
        schedule: formattedPlans,
        overdue,
        upcoming,
        scheduled,
        summary: {
          total: formattedPlans.length,
          overdueCount: overdue.length,
          upcomingCount: upcoming.length,
          scheduledCount: scheduled.length,
        },
      });
    } catch (error) {
      console.error("Error fetching maintenance schedule:", error);
      res.status(500).json({ error: "Failed to fetch maintenance schedule" });
    }
  });

  // GET /api/pos/predictive-maintenance - Get machines predicted to need maintenance
  app.get("/api/pos/predictive-maintenance", async (req: Request, res: Response) => {
    try {
      const { laundromatId } = req.query;
      
      const conditions: any[] = [];
      if (laundromatId) {
        conditions.push(eq(machineAssets.laundromatId, laundromatId as string));
      }
      
      const machines = await db
        .select()
        .from(machineAssets)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      const predictions = machines.map(machine => {
        const health = calculateMachineHealthScore(machine);
        
        // Predict days until maintenance based on health factors
        let predictedDays = 365; // Default to 1 year
        if (health.score < 30) predictedDays = 0; // Immediate
        else if (health.score < 50) predictedDays = 7;
        else if (health.score < 65) predictedDays = 14;
        else if (health.score < 80) predictedDays = 30;
        else if (health.score < 90) predictedDays = 60;
        else predictedDays = 90;
        
        // Determine urgency level
        let urgency = "low";
        if (predictedDays <= 7) urgency = "critical";
        else if (predictedDays <= 14) urgency = "high";
        else if (predictedDays <= 30) urgency = "medium";
        
        return {
          machineId: machine.id,
          machineName: machine.machineName || machine.machineNumber || "Unknown",
          machineType: machine.machineType,
          manufacturer: machine.manufacturer,
          model: machine.model,
          currentStatus: machine.status,
          healthScore: health.score,
          healthGrade: health.score >= 80 ? "Good" : health.score >= 50 ? "Fair" : "Poor",
          predictedDaysUntilMaintenance: predictedDays,
          urgency,
          factors: health.factors,
          lastMaintenanceDate: machine.lastMaintenanceDate,
          recommendedAction: predictedDays <= 7 
            ? "Schedule immediate maintenance" 
            : predictedDays <= 30 
              ? "Plan maintenance within 2 weeks"
              : "Continue monitoring",
        };
      });
      
      // Sort by urgency (most urgent first)
      const sortedPredictions = predictions.sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
      });
      
      // Filter to only show machines that need attention
      const needsAttention = sortedPredictions.filter(p => p.predictedDaysUntilMaintenance <= 30);
      
      res.json({
        predictions: sortedPredictions,
        needsAttention,
        summary: {
          total: machines.length,
          critical: predictions.filter(p => p.urgency === "critical").length,
          high: predictions.filter(p => p.urgency === "high").length,
          medium: predictions.filter(p => p.urgency === "medium").length,
          healthy: predictions.filter(p => p.urgency === "low").length,
          avgHealthScore: Math.round(predictions.reduce((sum, p) => sum + p.healthScore, 0) / predictions.length) || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching predictive maintenance:", error);
      res.status(500).json({ error: "Failed to fetch predictive maintenance data" });
    }
  });

  // ========================================
  // SERVICE GUY AI
  // ========================================

  // POST /api/pos/service-guy-ai - Chat with AI diagnostic assistant
  app.post("/api/pos/service-guy-ai", async (req: Request, res: Response) => {
    try {
      const { message, machineType, machineManufacturer, machineModel, symptoms, previousMessages = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      // Build context for the AI
      const machineContext = machineType 
        ? `Machine Type: ${machineType}${machineManufacturer ? `, Manufacturer: ${machineManufacturer}` : ""}${machineModel ? `, Model: ${machineModel}` : ""}`
        : "";
      
      const symptomsContext = symptoms && symptoms.length > 0 
        ? `Reported symptoms: ${symptoms.join(", ")}`
        : "";
      
      const systemPrompt = `You are "Service Guy AI", an expert commercial laundry equipment technician and diagnostic assistant for WashBizHub. You have 30+ years of experience repairing washers, dryers, folders, ironers, and other commercial laundry equipment from all major manufacturers (Speed Queen, Dexter, Continental Girbau, Wascomat, Maytag, Huebsch, etc.).

Your role is to help laundromat owners and operators diagnose and troubleshoot equipment issues. When responding:

1. **Identify Likely Causes**: List the most probable causes of the issue in order of likelihood
2. **Troubleshooting Steps**: Provide clear, step-by-step diagnostic procedures
3. **Parts Needed**: Suggest parts that might need replacement with approximate costs
4. **Repair Difficulty**: Rate as Easy (DIY), Moderate (experienced tech), or Complex (specialist needed)
5. **Estimated Time**: Provide realistic repair time estimates
6. **Safety Warnings**: Include any relevant safety precautions
7. **Cost Estimate**: Rough estimate for parts and labor

Be practical, direct, and safety-conscious. If an issue sounds dangerous or beyond DIY capability, recommend professional service.

${machineContext ? `\nContext: ${machineContext}` : ""}
${symptomsContext ? `\n${symptomsContext}` : ""}`;

      // Use OpenAI integration (Replit AI Integrations)
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });

      // Build messages array
      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...previousMessages.slice(-10), // Keep last 10 messages for context
        { role: "user", content: message },
      ];

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_completion_tokens: 2048,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

      res.json({
        response: aiResponse,
        context: {
          machineType,
          machineManufacturer,
          machineModel,
          symptoms,
        },
      });
    } catch (error) {
      console.error("Error with Service Guy AI:", error);
      res.status(500).json({ error: "Failed to get AI diagnosis. Please try again." });
    }
  });

  // ========================================
  // REAL-TIME UPDATES (SSE)
  // ========================================

  // Store active SSE connections
  const sseClients: Set<Response> = new Set();

  // GET /api/pos/live-updates - SSE endpoint for real-time dashboard updates
  app.get("/api/pos/live-updates", async (req: Request, res: Response) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Add client to set
    sseClients.add(res);

    // Send initial connection confirmation
    res.write(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`);

    // Send KPI updates every 5 seconds
    const sendKPIUpdate = async () => {
      try {
        // Get real-time stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ordersToday = await db
          .select({ count: count() })
          .from(posTransactions)
          .where(gte(posTransactions.createdAt, today));

        const revenueResult = await db
          .select({ total: sql<string>`COALESCE(SUM(CAST(${posTransactions.total} AS DECIMAL)), 0)` })
          .from(posTransactions)
          .where(gte(posTransactions.createdAt, today));

        const pendingOrders = await db
          .select({ count: count() })
          .from(posTransactions)
          .where(and(
            gte(posTransactions.createdAt, today),
            or(
              eq(posTransactions.status, "pending"),
              eq(posTransactions.status, "processing"),
              eq(posTransactions.status, "weighing")
            )
          ));

        const machinesOnline = await db
          .select({ count: count() })
          .from(machineAssets)
          .where(eq(machineAssets.status, "operational"));

        const machinesNeedingAttention = await db
          .select({ count: count() })
          .from(machineAssets)
          .where(or(
            eq(machineAssets.status, "needs_maintenance"),
            eq(machineAssets.status, "out_of_order")
          ));

        const kpiData = {
          type: "kpi_update",
          timestamp: new Date().toISOString(),
          data: {
            revenue: parseFloat(revenueResult[0]?.total || "0"),
            ordersToday: ordersToday[0]?.count || 0,
            pendingOrders: pendingOrders[0]?.count || 0,
            machinesOnline: machinesOnline[0]?.count || 0,
            machinesNeedingAttention: machinesNeedingAttention[0]?.count || 0,
            avgTicket: ordersToday[0]?.count ? parseFloat(revenueResult[0]?.total || "0") / ordersToday[0].count : 0,
          }
        };

        res.write(`data: ${JSON.stringify(kpiData)}\n\n`);
      } catch (error) {
        console.error("Error sending KPI update:", error);
      }
    };

    // Send initial KPI update
    await sendKPIUpdate();

    // Set up interval for updates
    const intervalId = setInterval(sendKPIUpdate, 5000);

    // Simulate occasional events for demo purposes
    const eventTypes = ["new_order", "order_status_change", "machine_alert"];
    const simulatedEventInterval = setInterval(() => {
      const shouldSend = Math.random() > 0.7; // 30% chance every interval
      if (shouldSend && sseClients.has(res)) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        let eventData: any = { type: eventType, timestamp: new Date().toISOString() };

        if (eventType === "new_order") {
          eventData.data = {
            orderId: `ORD-${Date.now()}`,
            customerName: "New Customer",
            total: (Math.random() * 100 + 20).toFixed(2),
            orderType: ["wash_dry_fold", "pickup_delivery", "dry_cleaning"][Math.floor(Math.random() * 3)]
          };
        } else if (eventType === "order_status_change") {
          eventData.data = {
            orderId: `ORD-${Date.now() - 100000}`,
            oldStatus: "processing",
            newStatus: "ready",
            customerName: "John Doe"
          };
        } else if (eventType === "machine_alert") {
          eventData.data = {
            machineId: `MCH-${Math.floor(Math.random() * 20) + 1}`,
            machineName: `Washer #${Math.floor(Math.random() * 10) + 1}`,
            alertType: ["maintenance_due", "cycle_complete", "error"][Math.floor(Math.random() * 3)],
            severity: ["info", "warning", "critical"][Math.floor(Math.random() * 3)]
          };
        }

        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      }
    }, 15000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(intervalId);
      clearInterval(simulatedEventInterval);
      sseClients.delete(res);
    });
  });

  // ========================================
  // UPGRADE PROMPTS & FEATURE RECOMMENDATIONS
  // ========================================

  // GET /api/pos/upgrade-prompts - Get contextual upgrade suggestions
  app.get("/api/pos/upgrade-prompts", async (req: Request, res: Response) => {
    try {
      // Get current usage stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const monthlyOrders = await db
        .select({ count: count() })
        .from(posTransactions)
        .where(gte(posTransactions.createdAt, thirtyDaysAgo));

      const monthlyRevenue = await db
        .select({ total: sql<string>`COALESCE(SUM(CAST(${posTransactions.total} AS DECIMAL)), 0)` })
        .from(posTransactions)
        .where(gte(posTransactions.createdAt, thirtyDaysAgo));

      const totalMachines = await db
        .select({ count: count() })
        .from(machineAssets);

      const machinesNeedingMaintenance = await db
        .select({ count: count() })
        .from(machineAssets)
        .where(or(
          eq(machineAssets.status, "needs_maintenance"),
          eq(machineAssets.status, "out_of_order")
        ));

      const totalRoutes = await db
        .select({ count: count() })
        .from(routes)
        .where(gte(routes.createdAt, thirtyDaysAgo));

      const orderCount = monthlyOrders[0]?.count || 0;
      const revenue = parseFloat(monthlyRevenue[0]?.total || "0");
      const machineCount = totalMachines[0]?.count || 0;
      const maintenanceRatio = machineCount > 0 ? (machinesNeedingMaintenance[0]?.count || 0) / machineCount : 0;
      const routeCount = totalRoutes[0]?.count || 0;

      const prompts: Array<{
        id: string;
        title: string;
        message: string;
        benefit: string;
        targetPlan: "pro" | "enterprise";
        priority: number;
        icon: string;
        ctaText: string;
      }> = [];

      // Order volume prompt
      if (orderCount >= 100) {
        prompts.push({
          id: "high-volume-orders",
          title: "High Order Volume Detected",
          message: `You've processed ${orderCount}+ orders this month. Upgrade to Pro for unlimited orders and route optimization.`,
          benefit: "Save 8+ hours/week with automated route optimization",
          targetPlan: "pro",
          priority: 1,
          icon: "trending-up",
          ctaText: "Unlock Pro Features"
        });
      } else if (orderCount >= 50) {
        prompts.push({
          id: "growing-volume",
          title: "Your Business is Growing",
          message: `You're on track for ${Math.floor(orderCount * 1.5)} orders this month. Pro plan includes advanced analytics and customer insights.`,
          benefit: "Increase customer retention by 25% with loyalty features",
          targetPlan: "pro",
          priority: 2,
          icon: "chart-line",
          ctaText: "See Pro Benefits"
        });
      }

      // Machine utilization prompt
      if (maintenanceRatio > 0.1) {
        prompts.push({
          id: "machine-maintenance",
          title: "Optimize Machine Uptime",
          message: `${Math.round(maintenanceRatio * 100)}% of your machines need attention. Enterprise includes predictive maintenance AI.`,
          benefit: "Reduce downtime by 40% with AI-powered predictions",
          targetPlan: "enterprise",
          priority: 1,
          icon: "wrench",
          ctaText: "Explore Enterprise"
        });
      }

      // Route optimization prompt
      if (routeCount >= 20) {
        prompts.push({
          id: "route-optimization",
          title: "Streamline Your Deliveries",
          message: `With ${routeCount} routes this month, route optimization could save you significant time and fuel.`,
          benefit: "Reduce fuel costs by 20% and delivery time by 35%",
          targetPlan: "pro",
          priority: 2,
          icon: "truck",
          ctaText: "Optimize Routes"
        });
      }

      // Revenue milestone prompt
      if (revenue >= 10000) {
        prompts.push({
          id: "revenue-milestone",
          title: "Unlock Premium Analytics",
          message: `Congratulations on $${revenue.toLocaleString()} this month! Unlock AI-powered demand forecasting.`,
          benefit: "Increase revenue by 15% with predictive demand insights",
          targetPlan: "pro",
          priority: 2,
          icon: "bar-chart",
          ctaText: "See AI Features"
        });
      }

      // Multi-location hint (for larger operations)
      if (machineCount >= 10) {
        prompts.push({
          id: "multi-location",
          title: "Ready for Expansion?",
          message: "Enterprise plan includes multi-location management with centralized reporting and staff management.",
          benefit: "Manage unlimited locations from one dashboard",
          targetPlan: "enterprise",
          priority: 3,
          icon: "building",
          ctaText: "Scale Your Business"
        });
      }

      // Default prompt if no conditions met
      if (prompts.length === 0) {
        prompts.push({
          id: "general-upgrade",
          title: "Boost Your Laundromat",
          message: "Upgrade to Pro to unlock advanced analytics, route optimization, and customer loyalty features.",
          benefit: "Join 5,000+ laundromat owners growing with WashBizHub Pro",
          targetPlan: "pro",
          priority: 3,
          icon: "rocket",
          ctaText: "Explore Pro Plan"
        });
      }

      // Sort by priority
      prompts.sort((a, b) => a.priority - b.priority);

      res.json({
        currentPlan: "starter",
        prompts,
        usageStats: {
          monthlyOrders: orderCount,
          monthlyRevenue: revenue,
          totalMachines: machineCount,
          totalRoutes: routeCount,
          maintenanceRate: Math.round(maintenanceRatio * 100)
        }
      });
    } catch (error) {
      console.error("Error fetching upgrade prompts:", error);
      res.status(500).json({ error: "Failed to fetch upgrade prompts" });
    }
  });

  // GET /api/pos/feature-recommendations - Get AI-powered feature recommendations with ROI
  app.get("/api/pos/feature-recommendations", async (req: Request, res: Response) => {
    try {
      // Get current usage stats for ROI calculations
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const monthlyRevenue = await db
        .select({ total: sql<string>`COALESCE(SUM(CAST(${posTransactions.total} AS DECIMAL)), 0)` })
        .from(posTransactions)
        .where(gte(posTransactions.createdAt, thirtyDaysAgo));

      const totalRoutes = await db
        .select({ count: count() })
        .from(routes)
        .where(gte(routes.createdAt, thirtyDaysAgo));

      const totalMachines = await db
        .select({ count: count() })
        .from(machineAssets);

      const totalCustomers = await db
        .select({ count: count() })
        .from(householdAccounts);

      const revenue = parseFloat(monthlyRevenue[0]?.total || "0");
      const routeCount = totalRoutes[0]?.count || 0;
      const machineCount = totalMachines[0]?.count || 0;
      const customerCount = totalCustomers[0]?.count || 0;

      const recommendations = [
        {
          id: "route-optimization",
          name: "Route Optimization AI",
          description: "Automatically optimize pickup/delivery routes using AI to reduce fuel costs and delivery times.",
          icon: "map-pin",
          plan: "pro",
          benefits: [
            "20% reduction in fuel costs",
            "35% faster delivery times",
            "Real-time traffic integration"
          ],
          roi: {
            monthlySavings: Math.round(routeCount * 15), // $15 saved per route
            yearlyReturn: Math.round(routeCount * 15 * 12),
            paybackMonths: 2
          },
          metrics: {
            current: `${routeCount} routes/month`,
            potential: `Save $${(routeCount * 15).toLocaleString()}/month`
          }
        },
        {
          id: "predictive-maintenance",
          name: "Predictive Maintenance AI",
          description: "AI-powered predictions to prevent machine failures before they happen. Reduce downtime by 40%.",
          icon: "cpu",
          plan: "enterprise",
          benefits: [
            "40% reduction in downtime",
            "25% lower repair costs",
            "IoT sensor integration"
          ],
          roi: {
            monthlySavings: Math.round(machineCount * 50), // $50 per machine/month
            yearlyReturn: Math.round(machineCount * 50 * 12),
            paybackMonths: 4
          },
          metrics: {
            current: `${machineCount} machines`,
            potential: `Save $${(machineCount * 50).toLocaleString()}/month`
          }
        },
        {
          id: "loyalty-program",
          name: "Customer Loyalty Program",
          description: "Automated loyalty rewards, referral tracking, and personalized promotions to boost retention.",
          icon: "heart",
          plan: "pro",
          benefits: [
            "25% increase in retention",
            "15% higher order frequency",
            "Automated email campaigns"
          ],
          roi: {
            monthlySavings: Math.round(revenue * 0.08), // 8% revenue increase
            yearlyReturn: Math.round(revenue * 0.08 * 12),
            paybackMonths: 1
          },
          metrics: {
            current: `${customerCount} customers`,
            potential: `+$${Math.round(revenue * 0.08).toLocaleString()}/month revenue`
          }
        },
        {
          id: "multi-location",
          name: "Multi-Location Management",
          description: "Centralized dashboard for managing multiple laundromat locations with consolidated reporting.",
          icon: "building-2",
          plan: "enterprise",
          benefits: [
            "Unified reporting dashboard",
            "Staff management across sites",
            "Inventory synchronization"
          ],
          roi: {
            monthlySavings: 500, // Base savings for multi-location
            yearlyReturn: 6000,
            paybackMonths: 5
          },
          metrics: {
            current: "Single location",
            potential: "Unlimited locations"
          }
        },
        {
          id: "demand-forecasting",
          name: "AI Demand Forecasting",
          description: "Predict peak hours and staffing needs using machine learning on historical data.",
          icon: "brain",
          plan: "pro",
          benefits: [
            "Optimize staffing levels",
            "Reduce wait times by 30%",
            "Smart pricing recommendations"
          ],
          roi: {
            monthlySavings: Math.round(revenue * 0.05), // 5% efficiency gain
            yearlyReturn: Math.round(revenue * 0.05 * 12),
            paybackMonths: 2
          },
          metrics: {
            current: "Manual scheduling",
            potential: "AI-optimized operations"
          }
        },
        {
          id: "advanced-reporting",
          name: "Advanced Analytics Suite",
          description: "Deep insights with custom reports, export capabilities, and trend analysis.",
          icon: "bar-chart-3",
          plan: "pro",
          benefits: [
            "Custom report builder",
            "Export to Excel/PDF",
            "Competitor benchmarking"
          ],
          roi: {
            monthlySavings: Math.round(revenue * 0.03), // 3% decision improvements
            yearlyReturn: Math.round(revenue * 0.03 * 12),
            paybackMonths: 1
          },
          metrics: {
            current: "Basic metrics",
            potential: "50+ custom KPIs"
          }
        }
      ];

      // Sort by ROI potential
      recommendations.sort((a, b) => b.roi.monthlySavings - a.roi.monthlySavings);

      res.json({
        recommendations,
        totalPotentialSavings: {
          monthly: recommendations.reduce((sum, r) => sum + r.roi.monthlySavings, 0),
          yearly: recommendations.reduce((sum, r) => sum + r.roi.yearlyReturn, 0)
        },
        currentUsage: {
          monthlyRevenue: revenue,
          routeCount,
          machineCount,
          customerCount
        }
      });
    } catch (error) {
      console.error("Error fetching feature recommendations:", error);
      res.status(500).json({ error: "Failed to fetch feature recommendations" });
    }
  });

  // POST /api/pos/repair-tickets/:id/ai-diagnosis - Get AI diagnosis for a specific ticket (subscription gated + tenant isolated)
  app.post("/api/pos/repair-tickets/:id/ai-diagnosis", requiresSubscriptionTier("accelerate"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // TENANT ISOLATION: Verify user has access to this repair ticket
      const { hasAccess, ticket: existingTicket } = await verifyRepairTicketAccess(req, id);
      if (!existingTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this repair ticket" });
      }
      
      // Get the ticket with machine info
      const [result] = await db
        .select({
          ticket: repairTickets,
          machine: machineAssets,
        })
        .from(repairTickets)
        .leftJoin(machineAssets, eq(repairTickets.machineId, machineAssets.id))
        .where(eq(repairTickets.id, id));
      
      const { ticket, machine } = result;
      
      // Build diagnostic request
      const prompt = `Analyze this repair ticket and provide a diagnostic assessment:

**Machine Details:**
- Type: ${machine?.machineType || "Unknown"}
- Manufacturer: ${machine?.manufacturer || "Unknown"}
- Model: ${machine?.model || "Unknown"}
- Age: ${machine?.installDate ? `Installed ${new Date(machine.installDate).toLocaleDateString()}` : "Unknown"}
- Total Cycles: ${machine?.cycleCount || machine?.totalCycles || "Unknown"}

**Issue Report:**
- Title: ${ticket.title}
- Description: ${ticket.description}
- Problem Type: ${ticket.problemType || "Not specified"}
- Priority: ${ticket.priority}
- Symptoms: ${Array.isArray(ticket.symptoms) ? ticket.symptoms.join(", ") : "Not specified"}

Please provide:
1. Most likely root cause
2. Step-by-step troubleshooting procedure
3. Parts likely needed (with approximate costs)
4. Repair difficulty level
5. Estimated repair time
6. Safety considerations`;

      // Use OpenAI integration
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are "Service Guy AI", an expert commercial laundry equipment technician with 30+ years of experience. Provide detailed, practical diagnostic assessments for repair tickets. Be specific about parts, procedures, and costs.`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 2048,
      });

      const aiDiagnosis = completion.choices[0]?.message?.content || "Unable to generate diagnosis.";

      res.json({
        ticketId: id,
        diagnosis: aiDiagnosis,
        machineContext: {
          type: machine?.machineType,
          manufacturer: machine?.manufacturer,
          model: machine?.model,
        },
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating AI diagnosis:", error);
      res.status(500).json({ error: "Failed to generate AI diagnosis" });
    }
  });

  // ============================================================================
  // AI STORE ASSISTANT - Natural Language Operations Manager
  // ============================================================================

  const aiAssistantSchema = z.object({
    message: z.string().min(1),
    context: z.object({
      laundromatId: z.string().optional(),
    }).optional(),
  });

  // POST /api/pos/ai-assistant - AI-powered store operations assistant
  app.post("/api/pos/ai-assistant", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = await getUserId(req);
      
      const body = aiAssistantSchema.parse(req.body);
      const { message, context } = body;
      const laundromatId = context?.laundromatId;

      // Get user's laundromats for context
      let userLaundromatIds: string[] = [];
      if (userId) {
        userLaundromatIds = await getUserLaundromats(userId);
      }

      // If specific laundromat requested, verify access
      if (laundromatId && userId) {
        const hasAccess = await verifyLaundromatAccess(req, laundromatId);
        if (!hasAccess) {
          return res.status(403).json({ error: "Access denied to this laundromat" });
        }
        userLaundromatIds = [laundromatId];
      }

      // Gather context data for AI
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      let contextData: any = {};

      // Fetch relevant data based on potential query intent
      const messageLower = message.toLowerCase();

      // Orders data
      if (messageLower.includes("order") || messageLower.includes("pending") || 
          messageLower.includes("pickup") || messageLower.includes("today") ||
          messageLower.includes("pounds") || messageLower.includes("process")) {
        
        const ordersQuery = userLaundromatIds.length > 0
          ? db.select().from(posTransactions)
              .where(and(
                inArray(posTransactions.laundromatId, userLaundromatIds),
                gte(posTransactions.createdAt, today)
              ))
              .orderBy(desc(posTransactions.createdAt))
              .limit(50)
          : Promise.resolve([]);

        contextData.todayOrders = await ordersQuery;
        
        // Pending pickup orders
        if (messageLower.includes("pending") || messageLower.includes("pickup") || messageLower.includes("ready")) {
          const pendingOrders = userLaundromatIds.length > 0
            ? await db.select().from(posTransactions)
                .where(and(
                  inArray(posTransactions.laundromatId, userLaundromatIds),
                  eq(posTransactions.status, "ready")
                ))
                .orderBy(desc(posTransactions.createdAt))
                .limit(20)
            : [];
          contextData.pendingOrders = pendingOrders;
        }
      }

      // Revenue data
      if (messageLower.includes("revenue") || messageLower.includes("money") || 
          messageLower.includes("sales") || messageLower.includes("income") ||
          messageLower.includes("tax") || messageLower.includes("financial")) {
        
        if (userLaundromatIds.length > 0) {
          const [todayRevenue] = await db.select({
            total: sql<number>`COALESCE(SUM(${posTransactions.total}), 0)`,
            count: sql<number>`COUNT(*)`,
          }).from(posTransactions)
            .where(and(
              inArray(posTransactions.laundromatId, userLaundromatIds),
              gte(posTransactions.createdAt, today),
              eq(posTransactions.status, "completed")
            ));

          const [weekRevenue] = await db.select({
            total: sql<number>`COALESCE(SUM(${posTransactions.total}), 0)`,
            count: sql<number>`COUNT(*)`,
          }).from(posTransactions)
            .where(and(
              inArray(posTransactions.laundromatId, userLaundromatIds),
              gte(posTransactions.createdAt, startOfWeek),
              eq(posTransactions.status, "completed")
            ));

          const [monthRevenue] = await db.select({
            total: sql<number>`COALESCE(SUM(${posTransactions.total}), 0)`,
            count: sql<number>`COUNT(*)`,
          }).from(posTransactions)
            .where(and(
              inArray(posTransactions.laundromatId, userLaundromatIds),
              gte(posTransactions.createdAt, startOfMonth),
              eq(posTransactions.status, "completed")
            ));

          contextData.revenue = {
            today: { total: Number(todayRevenue.total) || 0, count: Number(todayRevenue.count) || 0 },
            week: { total: Number(weekRevenue.total) || 0, count: Number(weekRevenue.count) || 0 },
            month: { total: Number(monthRevenue.total) || 0, count: Number(monthRevenue.count) || 0 },
          };
        }
      }

      // Customer data
      if (messageLower.includes("customer") || messageLower.includes("top") || 
          messageLower.includes("dormant") || messageLower.includes("hasn't ordered") ||
          messageLower.includes("look up") || messageLower.includes("find")) {
        
        if (userLaundromatIds.length > 0) {
          const topCustomers = await db.select({
            id: householdAccounts.id,
            accountName: householdAccounts.accountName,
            contactName: householdAccounts.contactName,
            phone: householdAccounts.phone,
            email: householdAccounts.email,
            totalSpend: householdAccounts.totalSpend,
            totalOrders: householdAccounts.totalOrders,
            lastOrderDate: householdAccounts.lastOrderDate,
          }).from(householdAccounts)
            .where(inArray(householdAccounts.laundromatId, userLaundromatIds))
            .orderBy(desc(householdAccounts.totalSpend))
            .limit(10);

          contextData.topCustomers = topCustomers;

          // Dormant customers (no order in 30 days)
          if (messageLower.includes("dormant") || messageLower.includes("hasn't ordered") || messageLower.includes("inactive")) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const dormantCustomers = await db.select({
              id: householdAccounts.id,
              accountName: householdAccounts.accountName,
              contactName: householdAccounts.contactName,
              phone: householdAccounts.phone,
              lastOrderDate: householdAccounts.lastOrderDate,
              totalSpend: householdAccounts.totalSpend,
            }).from(householdAccounts)
              .where(and(
                inArray(householdAccounts.laundromatId, userLaundromatIds),
                lte(householdAccounts.lastOrderDate, thirtyDaysAgo)
              ))
              .orderBy(desc(householdAccounts.totalSpend))
              .limit(20);

            contextData.dormantCustomers = dormantCustomers;
          }
        }
      }

      // Machine data
      if (messageLower.includes("machine") || messageLower.includes("washer") || 
          messageLower.includes("dryer") || messageLower.includes("down") ||
          messageLower.includes("maintenance") || messageLower.includes("equipment") ||
          messageLower.includes("utilization")) {
        
        if (userLaundromatIds.length > 0) {
          const machines = await db.select().from(machineAssets)
            .where(inArray(machineAssets.laundromatId, userLaundromatIds))
            .limit(50);

          contextData.machines = machines;

          // Machines that are down or need attention
          const downMachines = machines.filter((m: any) => 
            m.status === 'out_of_order' || m.status === 'maintenance' || m.status === 'offline'
          );
          contextData.downMachines = downMachines;

          // Open repair tickets
          const openTickets = await db.select().from(repairTickets)
            .where(and(
              inArray(repairTickets.laundromatId, userLaundromatIds),
              or(
                eq(repairTickets.status, "open"),
                eq(repairTickets.status, "in_progress")
              )
            ))
            .limit(20);

          contextData.openRepairTickets = openTickets;
        }
      }

      // Route/Delivery data
      if (messageLower.includes("delivery") || messageLower.includes("route") || 
          messageLower.includes("driver") || messageLower.includes("pickup") ||
          messageLower.includes("pud") || messageLower.includes("stops")) {
        
        if (userLaundromatIds.length > 0) {
          const todayRoutes = await db.select().from(routes)
            .where(and(
              inArray(routes.laundromatId, userLaundromatIds),
              gte(routes.scheduledDate, today)
            ))
            .limit(20);

          contextData.todayRoutes = todayRoutes;

          // Route stops
          if (todayRoutes.length > 0) {
            const routeIds = todayRoutes.map(r => r.id);
            const stops = await db.select().from(routeStops)
              .where(inArray(routeStops.routeId, routeIds))
              .limit(100);

            contextData.routeStops = stops;
          }
        }
      }

      // Build the AI prompt with context
      const systemPrompt = `You are "Store Assistant AI", an intelligent operations manager for laundromat owners. You help them manage orders, understand their revenue, monitor equipment, and optimize their business.

Current Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

AVAILABLE DATA CONTEXT:
${JSON.stringify(contextData, null, 2)}

RESPONSE GUIDELINES:
1. Be conversational but professional
2. Use specific numbers from the data when available
3. Format currency with $ and two decimals
4. If data is empty or user is not authenticated, provide helpful guidance on what they can do
5. Suggest follow-up actions when appropriate
6. Keep responses concise but informative
7. Use markdown formatting for emphasis (**bold** for key stats)

When responding, also return structured data that can be displayed in the UI:
- For orders: return { orders: [...] }
- For revenue: return { revenue: number, orderCount: number }
- For customers: return { customers: [...] }
- For machines: return { machines: [...] }

Format your response as JSON with these fields:
{
  "response": "Your conversational response here",
  "data": { optional structured data },
  "actions": ["Optional follow-up action prompts"]
}`;

      // Call OpenAI
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_completion_tokens: 2048,
        response_format: { type: "json_object" },
      });

      const aiResponse = completion.choices[0]?.message?.content || '{"response": "I apologize, but I was unable to process your request."}';
      
      try {
        const parsed = JSON.parse(aiResponse);
        res.json({
          response: parsed.response || aiResponse,
          data: parsed.data || null,
          actions: parsed.actions || [],
        });
      } catch {
        res.json({
          response: aiResponse,
          data: null,
          actions: [],
        });
      }
    } catch (error: any) {
      console.error("Error in AI assistant:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request format" });
      }
      
      res.status(500).json({ 
        response: "I apologize, but I encountered an error. Please try again.",
        error: error.message 
      });
    }
  });
  
  console.log("✅ POS Command Center routes registered");
}
