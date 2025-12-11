/**
 * Operator Dashboard Routes
 * Real data for Command Center - KPIs, POS, Machines, Service Tickets
 */

import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  posTransactions, machineAssets, repairTickets,
  laundromats, users, activityEvents, courses, enrollments
} from "@shared/schema";
import { eq, desc, and, sql, count, sum, gte, lte, inArray } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";

const router = Router();

// Helper to get user's laundromat IDs
async function getUserLaundromatIds(userId: string): Promise<string[]> {
  const userLaundromats = await db.select({ id: laundromats.id })
    .from(laundromats)
    .where(eq(laundromats.tenantId, userId));
  return userLaundromats.map(l => l.id);
}

// Helper to get or create a laundromat for user
async function getOrCreateLaundromat(userId: string): Promise<string> {
  const [existing] = await db.select({ id: laundromats.id })
    .from(laundromats)
    .where(eq(laundromats.tenantId, userId))
    .limit(1);
  
  if (existing) return existing.id;
  
  const id = crypto.randomUUID();
  await db.insert(laundromats).values({
    id,
    tenantId: userId,
    name: "My Laundromat",
    address: "123 Main St",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
  });
  return id;
}

// Get operator dashboard KPIs with real data
router.get("/kpis", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const laundromatIds = await getUserLaundromatIds(userId);
    
    if (laundromatIds.length === 0) {
      return res.json({
        revenue: { today: 0, month: 0, transactions: 0 },
        machines: { total: 0, running: 0, available: 0, maintenance: 0, offline: 0 },
        tickets: { total: 0, urgent: 0, pending: 0 },
      });
    }

    // Revenue queries with IN clause
    const [todayRevenue] = await db.select({ 
      total: sql<number>`COALESCE(SUM(CAST(${posTransactions.total} AS DECIMAL)), 0)` 
    })
      .from(posTransactions)
      .where(and(
        inArray(posTransactions.laundromatId, laundromatIds),
        gte(posTransactions.createdAt, today)
      ));

    const [monthRevenue] = await db.select({ 
      total: sql<number>`COALESCE(SUM(CAST(${posTransactions.total} AS DECIMAL)), 0)` 
    })
      .from(posTransactions)
      .where(and(
        inArray(posTransactions.laundromatId, laundromatIds),
        gte(posTransactions.createdAt, startOfMonth)
      ));

    const [transactionCount] = await db.select({ count: count() })
      .from(posTransactions)
      .where(and(
        inArray(posTransactions.laundromatId, laundromatIds),
        gte(posTransactions.createdAt, today)
      ));

    // Machine status counts
    const [machineStats] = await db.select({
      total: count(),
      running: sql<number>`COUNT(CASE WHEN ${machineAssets.status} = 'running' THEN 1 END)`,
      available: sql<number>`COUNT(CASE WHEN ${machineAssets.status} = 'available' OR ${machineAssets.status} = 'active' THEN 1 END)`,
      maintenance: sql<number>`COUNT(CASE WHEN ${machineAssets.status} = 'maintenance' THEN 1 END)`,
      offline: sql<number>`COUNT(CASE WHEN ${machineAssets.status} = 'offline' THEN 1 END)`,
    })
      .from(machineAssets)
      .where(inArray(machineAssets.laundromatId, laundromatIds));

    // Active service tickets
    const [ticketStats] = await db.select({
      total: count(),
      urgent: sql<number>`COUNT(CASE WHEN ${repairTickets.priority} = 'urgent' THEN 1 END)`,
      pending: sql<number>`COUNT(CASE WHEN ${repairTickets.status} = 'pending' THEN 1 END)`,
    })
      .from(repairTickets)
      .where(and(
        inArray(repairTickets.machineId, laundromatIds),
        sql`${repairTickets.status} != 'completed'`
      ));

    res.json({
      revenue: {
        today: Number(todayRevenue?.total) || 0,
        month: Number(monthRevenue?.total) || 0,
        transactions: Number(transactionCount?.count) || 0,
      },
      machines: {
        total: Number(machineStats?.total) || 0,
        running: Number(machineStats?.running) || 0,
        available: Number(machineStats?.available) || 0,
        maintenance: Number(machineStats?.maintenance) || 0,
        offline: Number(machineStats?.offline) || 0,
      },
      tickets: {
        total: Number(ticketStats?.total) || 0,
        urgent: Number(ticketStats?.urgent) || 0,
        pending: Number(ticketStats?.pending) || 0,
      },
    });
  } catch (error: any) {
    console.error("Operator KPIs error:", error);
    res.status(500).json({ error: "Failed to fetch KPIs" });
  }
});

// Get revenue chart data (last 7 days)
router.get("/revenue-chart", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const laundromatIds = await getUserLaundromatIds(userId);
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      let revenue = 0;
      if (laundromatIds.length > 0) {
        const [dayRevenue] = await db.select({ 
          total: sql<number>`COALESCE(SUM(CAST(${posTransactions.total} AS DECIMAL)), 0)` 
        })
          .from(posTransactions)
          .where(and(
            inArray(posTransactions.laundromatId, laundromatIds),
            gte(posTransactions.createdAt, date),
            lte(posTransactions.createdAt, nextDate)
          ));
        revenue = Number(dayRevenue?.total) || 0;
      }
      
      days.push({
        name: dayNames[date.getDay()],
        revenue,
        date: date.toISOString().split('T')[0],
      });
    }

    res.json(days);
  } catch (error: any) {
    console.error("Revenue chart error:", error);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});

// Get recent POS transactions (order queue)
router.get("/transactions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const laundromatIds = await getUserLaundromatIds(userId);
    
    if (laundromatIds.length === 0) {
      return res.json([]);
    }

    const transactions = await db
      .select()
      .from(posTransactions)
      .where(inArray(posTransactions.laundromatId, laundromatIds))
      .orderBy(desc(posTransactions.createdAt))
      .limit(20);

    res.json(transactions);
  } catch (error: any) {
    console.error("Transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Create a new POS transaction
router.post("/transactions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { customerName, serviceType, weight, total, paymentMethod } = req.body;

    // Generate transaction number
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const transactionNumber = `TXN-${year}-${random}`;

    const laundromatId = await getOrCreateLaundromat(userId);

    const pricePerPound = serviceType === "express" ? 2.25 : 1.75;
    const weightNum = parseFloat(weight) || 0;
    const subtotal = weightNum * pricePerPound;
    const tax = subtotal * 0.08;
    const calculatedTotal = total || (subtotal + tax);

    const [transaction] = await db.insert(posTransactions).values({
      id: crypto.randomUUID(),
      laundromatId,
      transactionNumber,
      customerName: customerName || "Walk-in Customer",
      orderType: serviceType || "wash_dry_fold",
      totalWeight: String(weightNum),
      pricePerPound: String(pricePerPound),
      subtotal: String(subtotal.toFixed(2)),
      tax: String(tax.toFixed(2)),
      total: String(calculatedTotal.toFixed(2)),
      paymentMethod: paymentMethod || "cash",
      paymentStatus: "paid",
      status: "pending",
      dropoffTime: new Date(),
    }).returning();

    res.json(transaction);
  } catch (error: any) {
    console.error("Create transaction error:", error);
    res.status(500).json({ error: "Failed to create transaction", details: error.message });
  }
});

// Get machine status list
router.get("/machines", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const laundromatIds = await getUserLaundromatIds(userId);
    
    if (laundromatIds.length === 0) {
      return res.json([]);
    }

    const machines = await db
      .select()
      .from(machineAssets)
      .where(inArray(machineAssets.laundromatId, laundromatIds))
      .orderBy(machineAssets.machineNumber)
      .limit(50);

    res.json(machines);
  } catch (error: any) {
    console.error("Machines error:", error);
    res.status(500).json({ error: "Failed to fetch machines" });
  }
});

// Get service/repair tickets
router.get("/tickets", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get tickets assigned to this user or for their laundromats
    const laundromatIds = await getUserLaundromatIds(userId);
    
    const tickets = await db
      .select()
      .from(repairTickets)
      .where(sql`${repairTickets.status} != 'completed'`)
      .orderBy(desc(repairTickets.createdAt))
      .limit(20);

    res.json(tickets);
  } catch (error: any) {
    console.error("Tickets error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Get courses for operator learning
router.get("/courses", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const courseList = await db
      .select()
      .from(courses)
      .where(eq(courses.isPublished, true))
      .orderBy(courses.title)
      .limit(20);

    res.json(courseList);
  } catch (error: any) {
    console.error("Courses error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Update transaction status
router.patch("/transactions/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (status === "completed") updates.completedTime = new Date();

    const [transaction] = await db
      .update(posTransactions)
      .set(updates)
      .where(eq(posTransactions.id, id))
      .returning();

    res.json(transaction);
  } catch (error: any) {
    console.error("Update transaction error:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

export default router;
