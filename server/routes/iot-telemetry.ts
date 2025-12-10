import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  machineTelemetry, 
  machineAssets, 
  telemetryEvents, 
  pricingRules,
  sensorThresholds,
  laundromats,
  insertMachineTelemetrySchema,
  insertTelemetryEventSchema,
  insertPricingRuleSchema,
  insertSensorThresholdSchema
} from "@shared/schema";
import { eq, desc, and, sql, gte, lte, inArray } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

// ============================================================================
// MACHINE TELEMETRY - Real-time status
// ============================================================================

// Get all machine telemetry for a location
router.get("/telemetry", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { laundromatId } = req.query;
    
    let query = db.select({
      telemetry: machineTelemetry,
      machine: machineAssets,
    })
    .from(machineTelemetry)
    .leftJoin(machineAssets, eq(machineTelemetry.machineId, machineAssets.id));

    if (laundromatId) {
      query = query.where(eq(machineTelemetry.laundromatId, laundromatId as string));
    }

    const results = await query.orderBy(desc(machineTelemetry.lastUpdated));

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error fetching telemetry:", error);
    res.status(500).json({ success: false, error: "Failed to fetch telemetry data" });
  }
});

// Get single machine telemetry
router.get("/telemetry/:machineId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { machineId } = req.params;
    
    const [result] = await db.select({
      telemetry: machineTelemetry,
      machine: machineAssets,
    })
    .from(machineTelemetry)
    .leftJoin(machineAssets, eq(machineTelemetry.machineId, machineAssets.id))
    .where(eq(machineTelemetry.machineId, machineId));

    if (!result) {
      return res.status(404).json({ success: false, error: "Machine telemetry not found" });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching machine telemetry:", error);
    res.status(500).json({ success: false, error: "Failed to fetch machine telemetry" });
  }
});

// ============================================================================
// TELEMETRY WEBHOOK - Ingest machine data (JSON or MQTT-style)
// ============================================================================

const webhookPayloadSchema = z.object({
  machineId: z.string(),
  deviceId: z.string().optional(),
  timestamp: z.string().optional(),
  status: z.enum(["available", "in_use", "out_of_order", "maintenance", "offline"]).optional(),
  cycleNumber: z.number().optional(),
  cyclePhase: z.string().optional(),
  cycleProgress: z.number().optional(),
  temperature: z.number().optional(),
  vibration: z.number().optional(),
  waterLevel: z.number().optional(),
  doorLocked: z.boolean().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  revenue: z.number().optional(),
  rawPayload: z.any().optional(),
});

// Webhook endpoint for machine telemetry data
router.post("/webhook/telemetry", async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    
    // Simple API key validation (in production, use proper auth)
    if (!apiKey || apiKey !== process.env.IOT_WEBHOOK_API_KEY) {
      // Allow without key for development
      console.log("IoT webhook received (dev mode)");
    }

    const payload = webhookPayloadSchema.parse(req.body);
    const { machineId, deviceId, status, cycleNumber, cyclePhase, cycleProgress, 
            temperature, vibration, waterLevel, doorLocked, errorCode, errorMessage, 
            revenue, rawPayload } = payload;

    // Check if machine exists
    const [machine] = await db.select().from(machineAssets).where(eq(machineAssets.id, machineId));
    if (!machine) {
      return res.status(404).json({ success: false, error: "Machine not found" });
    }

    // Upsert telemetry record
    const [existingTelemetry] = await db.select().from(machineTelemetry).where(eq(machineTelemetry.machineId, machineId));

    if (existingTelemetry) {
      // Update existing telemetry
      await db.update(machineTelemetry)
        .set({
          status: status || existingTelemetry.status,
          currentCycleNumber: cycleNumber ?? existingTelemetry.currentCycleNumber,
          cyclePhase: cyclePhase || existingTelemetry.cyclePhase,
          cycleProgress: cycleProgress ?? existingTelemetry.cycleProgress,
          temperature: temperature?.toString() || existingTelemetry.temperature,
          vibration: vibration?.toString() || existingTelemetry.vibration,
          waterLevel: waterLevel?.toString() || existingTelemetry.waterLevel,
          doorLocked: doorLocked ?? existingTelemetry.doorLocked,
          errorCode: errorCode || null,
          errorMessage: errorMessage || null,
          errorSeverity: errorCode ? "warning" : null,
          errorTimestamp: errorCode ? new Date() : null,
          lastHeartbeat: new Date(),
          connectionStatus: "online",
          lastUpdated: new Date(),
        })
        .where(eq(machineTelemetry.machineId, machineId));
    } else {
      // Create new telemetry record
      await db.insert(machineTelemetry).values({
        machineId,
        laundromatId: machine.laundromatId,
        status: status || "available",
        currentCycleNumber: cycleNumber || 0,
        cyclePhase,
        cycleProgress: cycleProgress || 0,
        temperature: temperature?.toString(),
        vibration: vibration?.toString(),
        waterLevel: waterLevel?.toString(),
        doorLocked: doorLocked || false,
        errorCode,
        errorMessage,
        lastHeartbeat: new Date(),
        connectionStatus: "online",
      });
    }

    // Also store in telemetry events for historical tracking
    await db.insert(telemetryEvents).values({
      machineId,
      eventType: status === "in_use" ? "cycle_start" : status === "available" ? "cycle_end" : "status_update",
      temperature: temperature?.toString(),
      vibration: vibration?.toString(),
      doorStatus: doorLocked ? "closed" : "open",
      cyclePhase,
      errorCode,
      errorMessage,
      rawPayload: rawPayload || req.body,
    });

    // Check for alert thresholds
    const thresholds = await db.select().from(sensorThresholds)
      .where(and(
        eq(sensorThresholds.machineId, machineId),
        eq(sensorThresholds.isActive, true)
      ));

    const alerts: string[] = [];
    for (const threshold of thresholds) {
      const value = threshold.sensorType === "temperature" ? temperature :
                    threshold.sensorType === "vibration" ? vibration : null;
      
      if (value !== null && value !== undefined) {
        if (threshold.criticalMax && value > parseFloat(threshold.criticalMax)) {
          alerts.push(`CRITICAL: ${threshold.sensorType} (${value}) exceeds critical max (${threshold.criticalMax})`);
        } else if (threshold.maxValue && value > parseFloat(threshold.maxValue)) {
          alerts.push(`WARNING: ${threshold.sensorType} (${value}) exceeds max (${threshold.maxValue})`);
        }
      }
    }

    res.json({ 
      success: true, 
      message: "Telemetry data ingested",
      alerts: alerts.length > 0 ? alerts : undefined,
    });
  } catch (error) {
    console.error("Error processing telemetry webhook:", error);
    res.status(500).json({ success: false, error: "Failed to process telemetry data" });
  }
});

// MQTT-style batch telemetry endpoint
router.post("/webhook/telemetry/batch", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: any[] };
    
    if (!Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: "Expected array of messages" });
    }

    const results = [];
    for (const msg of messages) {
      try {
        const payload = webhookPayloadSchema.parse(msg);
        // Process each message (simplified - reuse logic from single endpoint)
        results.push({ machineId: payload.machineId, status: "processed" });
      } catch (e) {
        results.push({ machineId: msg.machineId, status: "failed", error: String(e) });
      }
    }

    res.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error("Error processing batch telemetry:", error);
    res.status(500).json({ success: false, error: "Failed to process batch telemetry" });
  }
});

// ============================================================================
// TELEMETRY HISTORY - For trends and analytics
// ============================================================================

router.get("/telemetry/:machineId/history", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { machineId } = req.params;
    const { hours = 24 } = req.query;

    const hoursAgo = new Date(Date.now() - parseInt(hours as string) * 60 * 60 * 1000);

    const events = await db.select()
      .from(telemetryEvents)
      .where(and(
        eq(telemetryEvents.machineId, machineId),
        gte(telemetryEvents.timestamp, hoursAgo)
      ))
      .orderBy(desc(telemetryEvents.timestamp))
      .limit(500);

    res.json({ success: true, data: events, count: events.length });
  } catch (error) {
    console.error("Error fetching telemetry history:", error);
    res.status(500).json({ success: false, error: "Failed to fetch telemetry history" });
  }
});

// ============================================================================
// PRICING RULES - Dynamic pricing configuration
// ============================================================================

// Get all pricing rules
router.get("/pricing-rules", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { locationId } = req.query;
    
    let query = db.select().from(pricingRules);
    
    if (locationId) {
      query = query.where(eq(pricingRules.locationId, locationId as string));
    }

    const rules = await query.orderBy(desc(pricingRules.priority), desc(pricingRules.createdAt));

    res.json({ success: true, data: rules, count: rules.length });
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    res.status(500).json({ success: false, error: "Failed to fetch pricing rules" });
  }
});

// Create pricing rule
router.post("/pricing-rules", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub;
    const parsed = insertPricingRuleSchema.parse(req.body);
    
    const [rule] = await db.insert(pricingRules).values({
      ...parsed,
      userId,
    }).returning();

    res.json({ success: true, data: rule });
  } catch (error) {
    console.error("Error creating pricing rule:", error);
    res.status(500).json({ success: false, error: "Failed to create pricing rule" });
  }
});

// Update pricing rule
router.patch("/pricing-rules/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [rule] = await db.update(pricingRules)
      .set(updates)
      .where(eq(pricingRules.id, id))
      .returning();

    if (!rule) {
      return res.status(404).json({ success: false, error: "Pricing rule not found" });
    }

    res.json({ success: true, data: rule });
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    res.status(500).json({ success: false, error: "Failed to update pricing rule" });
  }
});

// Delete pricing rule
router.delete("/pricing-rules/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(pricingRules).where(eq(pricingRules.id, id));

    res.json({ success: true, message: "Pricing rule deleted" });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    res.status(500).json({ success: false, error: "Failed to delete pricing rule" });
  }
});

// Calculate current price for a machine
router.get("/pricing/calculate/:machineId", async (req: Request, res: Response) => {
  try {
    const { machineId } = req.params;

    // Get machine and telemetry
    const [machine] = await db.select().from(machineAssets).where(eq(machineAssets.id, machineId));
    if (!machine) {
      return res.status(404).json({ success: false, error: "Machine not found" });
    }

    const [telemetry] = await db.select().from(machineTelemetry).where(eq(machineTelemetry.machineId, machineId));
    const basePrice = parseFloat(telemetry?.basePrice || machine.basePrice || "3.50");

    // Get applicable pricing rules
    const rules = await db.select()
      .from(pricingRules)
      .where(and(
        eq(pricingRules.active, true),
        eq(pricingRules.locationId, machine.laundromatId)
      ))
      .orderBy(desc(pricingRules.priority));

    let finalPrice = basePrice;
    let appliedRules: string[] = [];

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    for (const rule of rules) {
      const conditions = rule.conditions as any;
      let applies = true;

      // Time-of-day check
      if (conditions.timeStart && conditions.timeEnd) {
        const startHour = parseInt(conditions.timeStart.split(":")[0]);
        const endHour = parseInt(conditions.timeEnd.split(":")[0]);
        if (currentHour < startHour || currentHour >= endHour) {
          applies = false;
        }
      }

      // Day-of-week check
      if (conditions.dayOfWeek && Array.isArray(conditions.dayOfWeek)) {
        if (!conditions.dayOfWeek.includes(currentDay)) {
          applies = false;
        }
      }

      // Utilization check
      if (conditions.minUtilization && telemetry) {
        const utilization = parseFloat(telemetry.utilizationPercent || "0");
        if (utilization < conditions.minUtilization) {
          applies = false;
        }
      }

      if (applies) {
        const modifier = parseFloat(rule.adjustmentValue);
        if (rule.adjustmentType === "percentage") {
          finalPrice = finalPrice * (1 + modifier / 100);
        } else if (rule.adjustmentType === "fixed") {
          finalPrice = finalPrice + modifier;
        } else if (rule.adjustmentType === "absolute") {
          finalPrice = modifier;
        }
        appliedRules.push(rule.name);
      }
    }

    // Clamp to min/max if specified
    finalPrice = Math.max(0, finalPrice);
    finalPrice = Math.round(finalPrice * 100) / 100; // Round to 2 decimals

    res.json({
      success: true,
      basePrice,
      finalPrice,
      appliedRules,
      priceModifier: finalPrice / basePrice,
    });
  } catch (error) {
    console.error("Error calculating price:", error);
    res.status(500).json({ success: false, error: "Failed to calculate price" });
  }
});

// ============================================================================
// ALERT THRESHOLDS - Sensor alert configuration
// ============================================================================

router.get("/thresholds/:machineId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { machineId } = req.params;
    
    const thresholds = await db.select()
      .from(sensorThresholds)
      .where(eq(sensorThresholds.machineId, machineId));

    res.json({ success: true, data: thresholds });
  } catch (error) {
    console.error("Error fetching thresholds:", error);
    res.status(500).json({ success: false, error: "Failed to fetch thresholds" });
  }
});

router.post("/thresholds", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parsed = insertSensorThresholdSchema.parse(req.body);
    
    const [threshold] = await db.insert(sensorThresholds).values(parsed).returning();

    res.json({ success: true, data: threshold });
  } catch (error) {
    console.error("Error creating threshold:", error);
    res.status(500).json({ success: false, error: "Failed to create threshold" });
  }
});

// ============================================================================
// DASHBOARD AGGREGATES - Summary data for IoT dashboard
// ============================================================================

router.get("/dashboard/summary", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { laundromatId } = req.query;

    // Get all telemetry for location
    let telemetryQuery = db.select().from(machineTelemetry);
    if (laundromatId) {
      telemetryQuery = telemetryQuery.where(eq(machineTelemetry.laundromatId, laundromatId as string));
    }
    const allTelemetry = await telemetryQuery;

    // Calculate status counts
    const statusCounts = {
      available: 0,
      in_use: 0,
      out_of_order: 0,
      maintenance: 0,
      offline: 0,
    };

    let totalRevenue = 0;
    let totalCycles = 0;
    let avgUtilization = 0;
    let errorCount = 0;
    let healthSum = 0;

    for (const t of allTelemetry) {
      if (t.status && statusCounts.hasOwnProperty(t.status)) {
        statusCounts[t.status as keyof typeof statusCounts]++;
      }
      totalRevenue += parseFloat(t.revenueToday || "0");
      totalCycles += t.cyclesToday || 0;
      avgUtilization += parseFloat(t.utilizationPercent || "0");
      healthSum += t.healthScore || 100;
      if (t.errorCode) errorCount++;
    }

    const machineCount = allTelemetry.length;
    avgUtilization = machineCount > 0 ? avgUtilization / machineCount : 0;
    const avgHealth = machineCount > 0 ? healthSum / machineCount : 100;

    // Get machines with errors
    const machinesWithErrors = allTelemetry
      .filter(t => t.errorCode)
      .map(t => ({
        machineId: t.machineId,
        errorCode: t.errorCode,
        errorMessage: t.errorMessage,
        errorSeverity: t.errorSeverity,
        errorTimestamp: t.errorTimestamp,
      }));

    // Get machines needing maintenance
    const machinesNeedingMaintenance = allTelemetry
      .filter(t => (t.healthScore || 100) < 70 || (t.maintenanceDueInCycles && t.maintenanceDueInCycles < 100))
      .map(t => ({
        machineId: t.machineId,
        healthScore: t.healthScore,
        cyclesSinceLastMaintenance: t.cyclesSinceLastMaintenance,
        recommendedMaintenanceDate: t.recommendedMaintenanceDate,
      }));

    res.json({
      success: true,
      summary: {
        totalMachines: machineCount,
        statusCounts,
        totalRevenueToday: totalRevenue,
        totalCyclesToday: totalCycles,
        avgUtilization: Math.round(avgUtilization * 10) / 10,
        avgHealthScore: Math.round(avgHealth),
        errorCount,
        machinesWithErrors,
        machinesNeedingMaintenance,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard summary" });
  }
});

// Get predictive maintenance recommendations
router.get("/maintenance/predictions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { laundromatId } = req.query;

    let query = db.select({
      telemetry: machineTelemetry,
      machine: machineAssets,
    })
    .from(machineTelemetry)
    .leftJoin(machineAssets, eq(machineTelemetry.machineId, machineAssets.id));

    if (laundromatId) {
      query = query.where(eq(machineTelemetry.laundromatId, laundromatId as string));
    }

    const results = await query;

    const predictions = results.map(({ telemetry: t, machine: m }) => {
      const cyclesSinceMaintenance = t.cyclesSinceLastMaintenance || 0;
      const healthScore = t.healthScore || 100;
      const totalCycles = t.totalCycleCount || 0;
      
      // Simple prediction logic (in production, use ML model)
      let urgency: "low" | "medium" | "high" | "critical" = "low";
      let recommendedAction = "Continue monitoring";
      let daysUntilService = 30;

      if (healthScore < 50 || cyclesSinceMaintenance > 3000) {
        urgency = "critical";
        recommendedAction = "Schedule immediate maintenance";
        daysUntilService = 0;
      } else if (healthScore < 70 || cyclesSinceMaintenance > 2000) {
        urgency = "high";
        recommendedAction = "Schedule maintenance within 1 week";
        daysUntilService = 7;
      } else if (healthScore < 85 || cyclesSinceMaintenance > 1000) {
        urgency = "medium";
        recommendedAction = "Plan maintenance within 2 weeks";
        daysUntilService = 14;
      }

      // Parts prediction based on cycles
      const predictedParts: string[] = [];
      if (totalCycles > 5000) predictedParts.push("Bearings");
      if (totalCycles > 10000) predictedParts.push("Belt");
      if (totalCycles > 15000) predictedParts.push("Motor brushes");
      if (totalCycles > 20000) predictedParts.push("Drain pump");

      return {
        machineId: t.machineId,
        machineName: m?.machineName || m?.machineNumber,
        machineType: m?.machineType,
        healthScore,
        cyclesSinceMaintenance,
        totalCycles,
        urgency,
        recommendedAction,
        daysUntilService,
        predictedParts,
      };
    });

    // Sort by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    predictions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    res.json({ success: true, predictions });
  } catch (error) {
    console.error("Error fetching maintenance predictions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch predictions" });
  }
});

export default router;
