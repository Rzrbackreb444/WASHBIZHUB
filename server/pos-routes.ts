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

  // 1. GET /api/pos/analytics/kpis - Comprehensive KPIs
  app.get("/api/pos/analytics/kpis", async (req: Request, res: Response) => {
    try {
      const { laundromatId } = req.query;

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

        if (laundromatId) {
          baseConditions.push(eq(posTransactions.laundromatId, laundromatId as string));
          prevConditions.push(eq(posTransactions.laundromatId, laundromatId as string));
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
        if (laundromatId) {
          customerConditions.push(eq(householdAccounts.laundromatId, laundromatId as string));
        }
        const newCustomers = await db
          .select()
          .from(householdAccounts)
          .where(and(...customerConditions));

        const machineConditions: any[] = [];
        if (laundromatId) {
          machineConditions.push(eq(machineAssets.laundromatId, laundromatId as string));
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

  // 2. GET /api/pos/analytics/revenue-trends - Daily revenue for charts
  app.get("/api/pos/analytics/revenue-trends", async (req: Request, res: Response) => {
    try {
      const { laundromatId, period = "month" } = req.query;
      const { start, end } = getDateRange(period as string);

      const conditions: any[] = [
        gte(posTransactions.createdAt, start),
        lte(posTransactions.createdAt, end),
      ];
      if (laundromatId) {
        conditions.push(eq(posTransactions.laundromatId, laundromatId as string));
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

  // 3. GET /api/pos/analytics/customer-insights - Customer analytics
  app.get("/api/pos/analytics/customer-insights", async (req: Request, res: Response) => {
    try {
      const { laundromatId, period = "month" } = req.query;
      const { start, end } = getDateRange(period as string);

      const conditions: any[] = [
        gte(posTransactions.createdAt, start),
        lte(posTransactions.createdAt, end),
      ];
      if (laundromatId) {
        conditions.push(eq(posTransactions.laundromatId, laundromatId as string));
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
      if (laundromatId) {
        customerConditions.push(eq(householdAccounts.laundromatId, laundromatId as string));
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

  // 4. GET /api/pos/analytics/machine-utilization - Machine analytics
  app.get("/api/pos/analytics/machine-utilization", async (req: Request, res: Response) => {
    try {
      const { laundromatId, period = "month" } = req.query;
      const { start, end } = getDateRange(period as string);

      const machineConditions: any[] = [];
      if (laundromatId) {
        machineConditions.push(eq(machineAssets.laundromatId, laundromatId as string));
      }

      const machines = await db
        .select()
        .from(machineAssets)
        .where(machineConditions.length > 0 ? and(...machineConditions) : undefined);

      const orderConditions: any[] = [
        gte(posTransactions.createdAt, start),
        lte(posTransactions.createdAt, end),
      ];
      if (laundromatId) {
        orderConditions.push(eq(posTransactions.laundromatId, laundromatId as string));
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

  // 5. GET /api/pos/analytics/route-performance - Route metrics
  app.get("/api/pos/analytics/route-performance", async (req: Request, res: Response) => {
    try {
      const { laundromatId } = req.query;
      const { start, end } = getDateRange("today");

      const routeConditions: any[] = [
        gte(routes.routeDate, start),
        lte(routes.routeDate, end),
      ];
      if (laundromatId) {
        routeConditions.push(eq(routes.laundromatId, laundromatId as string));
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
      if (laundromatId) {
        recentConditions.push(eq(routes.laundromatId, laundromatId as string));
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
  
  console.log("✅ POS Command Center routes registered");
}
