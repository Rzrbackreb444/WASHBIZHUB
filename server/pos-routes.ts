/**
 * POS COMMAND CENTER API ROUTES
 * Full-featured Point of Sale system for WashBizHub
 * Feature parity with Curbside/Cents + UNIQUE advantages
 */

import type { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, like, or, count } from "drizzle-orm";
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
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

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
  
  // List orders with filters
  app.get("/api/pos/orders", async (req: Request, res: Response) => {
    try {
      const { status, laundromatId, customerId, startDate, endDate, limit = "50", offset = "0" } = req.query;
      
      const conditions: any[] = [];
      
      if (laundromatId) {
        conditions.push(eq(posTransactions.laundromatId, laundromatId as string));
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
  
  // Get single order with items
  app.get("/api/pos/orders/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [order] = await db
        .select()
        .from(posTransactions)
        .where(eq(posTransactions.id, id));
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
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
  
  // Create new order
  app.post("/api/pos/orders", async (req: Request, res: Response) => {
    try {
      const data = createOrderSchema.parse(req.body);
      
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
  
  // Update order status
  app.patch("/api/pos/orders/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const [order] = await db
        .update(posTransactions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(posTransactions.id, id))
        .returning();
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json({ order });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });
  
  // Add item to order
  app.post("/api/pos/orders/:id/items", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { itemType, description, quantity, weight, pricePerPound, unitPrice } = req.body;
      
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
  
  // Record weight measurement
  app.post("/api/pos/orders/:id/weigh", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { weight, scaleId, weighedBy, photoUrl } = req.body;
      
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
  
  // Process payment
  app.post("/api/pos/orders/:id/payment", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;
      
      const [order] = await db
        .select()
        .from(posTransactions)
        .where(eq(posTransactions.id, id));
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
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
  // CUSTOMERS (householdAccounts)
  // ========================================
  
  // List customers
  app.get("/api/pos/customers", async (req: Request, res: Response) => {
    try {
      const { laundromatId, search, limit = "50", offset = "0" } = req.query;
      
      const conditions: any[] = [];
      
      if (laundromatId) {
        conditions.push(eq(householdAccounts.laundromatId, laundromatId as string));
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
  
  // Get customer with stats
  app.get("/api/pos/customers/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [customer] = await db
        .select()
        .from(householdAccounts)
        .where(eq(householdAccounts.id, id));
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
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
  
  // Create customer
  app.post("/api/pos/customers", async (req: Request, res: Response) => {
    try {
      const data = createCustomerSchema.parse(req.body);
      
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
  
  // Update customer
  app.patch("/api/pos/customers/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const [customer] = await db
        .update(householdAccounts)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(householdAccounts.id, id))
        .returning();
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      res.json({ customer });
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });
  
  // ========================================
  // MACHINES (machineAssets)
  // ========================================
  
  // List machines
  app.get("/api/pos/machines", async (req: Request, res: Response) => {
    try {
      const { laundromatId, status, type } = req.query;
      
      const conditions: any[] = [];
      
      if (laundromatId) {
        conditions.push(eq(machineAssets.laundromatId, laundromatId as string));
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
  
  // Get machine with telemetry
  app.get("/api/pos/machines/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [machine] = await db
        .select()
        .from(machineAssets)
        .where(eq(machineAssets.id, id));
      
      if (!machine) {
        return res.status(404).json({ error: "Machine not found" });
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
  
  // Create machine
  app.post("/api/pos/machines", async (req: Request, res: Response) => {
    try {
      const data = createMachineSchema.parse(req.body);
      
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
  
  // Get maintenance alerts
  app.get("/api/pos/machines/alerts", async (req: Request, res: Response) => {
    try {
      const { laundromatId } = req.query;
      
      // Get machines needing maintenance
      const machines = await db
        .select()
        .from(machineAssets)
        .where(
          laundromatId
            ? and(
                eq(machineAssets.laundromatId, laundromatId as string),
                or(
                  eq(machineAssets.status, "needs_maintenance"),
                  eq(machineAssets.status, "out_of_order")
                )
              )
            : or(
                eq(machineAssets.status, "needs_maintenance"),
                eq(machineAssets.status, "out_of_order")
              )
        );
      
      // Get open repair tickets
      const tickets = await db
        .select()
        .from(repairTickets)
        .where(
          or(
            eq(repairTickets.status, "open"),
            eq(repairTickets.status, "in_progress")
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
  
  // Log maintenance
  app.post("/api/pos/machines/:id/maintenance", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, priority, assignedTo } = req.body;
      
      const ticketNumber = `TKT-${Date.now()}`;
      
      const [ticket] = await db
        .insert(repairTickets)
        .values({
          machineId: id,
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
  
  // List routes
  app.get("/api/pos/routes", async (req: Request, res: Response) => {
    try {
      const { laundromatId, date, status } = req.query;
      
      const conditions: any[] = [];
      
      if (laundromatId) {
        conditions.push(eq(routes.laundromatId, laundromatId as string));
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
  
  // Get route with stops
  app.get("/api/pos/routes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [route] = await db
        .select()
        .from(routes)
        .where(eq(routes.id, id));
      
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
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
  
  // Create route
  app.post("/api/pos/routes", async (req: Request, res: Response) => {
    try {
      const data = createRouteSchema.parse(req.body);
      
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
  
  // Add stop to route
  app.post("/api/pos/routes/:id/stops", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { transactionId, address, customerName, scheduledTime, notes } = req.body;
      
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
  
  // List inventory
  app.get("/api/pos/inventory", async (req: Request, res: Response) => {
    try {
      const { laundromatId, category, lowStock } = req.query;
      
      const conditions: any[] = [];
      
      if (laundromatId) {
        conditions.push(eq(partsInventory.laundromatId, laundromatId as string));
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
  
  // Add part
  app.post("/api/pos/inventory", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
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
  
  // Update stock
  app.patch("/api/pos/inventory/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const [part] = await db
        .update(partsInventory)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(partsInventory.id, id))
        .returning();
      
      if (!part) {
        return res.status(404).json({ error: "Part not found" });
      }
      
      res.json({ part });
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ error: "Failed to update inventory" });
    }
  });
  
  // ========================================
  // DASHBOARD ANALYTICS
  // ========================================
  
  // Dashboard stats
  app.get("/api/pos/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const { laundromatId } = req.query;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const conditions: any[] = [gte(posTransactions.createdAt, today)];
      if (laundromatId) {
        conditions.push(eq(posTransactions.laundromatId, laundromatId as string));
      }
      
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
      
      const weekConditions: any[] = [gte(posTransactions.createdAt, weekAgo)];
      if (laundromatId) {
        weekConditions.push(eq(posTransactions.laundromatId, laundromatId as string));
      }
      
      const weekOrders = await db
        .select()
        .from(posTransactions)
        .where(and(...weekConditions));
      
      const weekRevenue = weekOrders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
      
      // Customer count
      const customerConditions: any[] = [];
      if (laundromatId) {
        customerConditions.push(eq(householdAccounts.laundromatId, laundromatId as string));
      }
      
      const customers = await db
        .select()
        .from(householdAccounts)
        .where(customerConditions.length > 0 ? and(...customerConditions) : undefined);
      
      // Machine status
      const machineConditions: any[] = [];
      if (laundromatId) {
        machineConditions.push(eq(machineAssets.laundromatId, laundromatId as string));
      }
      
      const machines = await db
        .select()
        .from(machineAssets)
        .where(machineConditions.length > 0 ? and(...machineConditions) : undefined);
      
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
  
  // Chart data
  app.get("/api/pos/dashboard/charts", async (req: Request, res: Response) => {
    try {
      const { laundromatId, period = "7" } = req.query;
      const days = parseInt(period as string);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      
      const conditions: any[] = [gte(posTransactions.createdAt, startDate)];
      if (laundromatId) {
        conditions.push(eq(posTransactions.laundromatId, laundromatId as string));
      }
      
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
  
  console.log("✅ POS Command Center routes registered");
}
