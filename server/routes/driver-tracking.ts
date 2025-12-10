import { Router } from "express";
import { db } from "../db";
import { deliveryRoutes, deliveryStops, users } from "@shared/schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

async function getCurrentUserId(req: any): Promise<string | null> {
  const userSub = req.user?.sub || (req.user as any)?.claims?.sub;
  return userSub || null;
}

function generateTrackingToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ========================================
// PUBLIC TRACKING ENDPOINTS (No Auth Required)
// ========================================

// Get tracking info by token (public - no auth required)
router.get("/track/:token", async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length !== 64) {
      return res.status(400).json({ error: "Invalid tracking token" });
    }

    const [stop] = await db
      .select()
      .from(deliveryStops)
      .where(eq(deliveryStops.trackingToken, token));

    if (!stop) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Get route info for driver details
    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(eq(deliveryRoutes.id, stop.routeId));

    // Build status timeline
    const timeline = [
      {
        status: "order_placed",
        label: "Order Placed",
        completed: true,
        timestamp: stop.createdAt,
      },
      {
        status: "en_route",
        label: stop.serviceType === "pickup" ? "Driver En Route for Pickup" : "Driver En Route",
        completed: ["en_route", "arrived", "completed"].includes(stop.status),
        timestamp: stop.status === "en_route" ? stop.updatedAt : null,
      },
      {
        status: "arrived",
        label: stop.serviceType === "pickup" ? "Driver Arrived for Pickup" : "Driver Arrived",
        completed: ["arrived", "completed"].includes(stop.status),
        timestamp: stop.arrivedAt,
      },
      {
        status: "completed",
        label: stop.serviceType === "pickup" ? "Picked Up" : "Delivered",
        completed: stop.status === "completed",
        timestamp: stop.completedAt,
      },
    ];

    // Only show driver location if location sharing is enabled
    const driverLocation = stop.locationSharingEnabled && route?.locationSharingActive
      ? stop.driverLocation
      : null;

    res.json({
      id: stop.id,
      status: stop.status,
      customerName: stop.customerName,
      address: stop.address,
      city: stop.city,
      state: stop.state,
      serviceType: stop.serviceType,
      timeline,
      estimatedArrival: stop.estimatedArrival,
      etaMinutes: stop.etaMinutes,
      timeWindowStart: stop.timeWindowStart,
      timeWindowEnd: stop.timeWindowEnd,
      specialInstructions: stop.specialInstructions,
      driverLocation,
      locationSharingEnabled: stop.locationSharingEnabled && route?.locationSharingActive,
      lastLocationUpdate: stop.lastLocationUpdate,
      driver: route ? {
        name: route.driverName,
        phone: route.driverPhone,
        photoUrl: route.driverPhotoUrl,
        vehicle: route.vehicleDescription,
      } : null,
      completedAt: stop.completedAt,
      arrivedAt: stop.arrivedAt,
    });
  } catch (error) {
    console.error("Error fetching tracking info:", error);
    res.status(500).json({ error: "Failed to fetch tracking info" });
  }
});

// ========================================
// DRIVER ENDPOINTS (Authenticated)
// ========================================

// Generate tracking token for a stop
router.post("/stops/:id/generate-token", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Get stop and verify ownership through route
    const [stop] = await db.select().from(deliveryStops).where(eq(deliveryStops.id, id));
    if (!stop) {
      return res.status(404).json({ error: "Stop not found" });
    }

    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, stop.routeId), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Generate new token if none exists, or return existing
    const token = stop.trackingToken || generateTrackingToken();

    if (!stop.trackingToken) {
      await db
        .update(deliveryStops)
        .set({ trackingToken: token, updatedAt: new Date() })
        .where(eq(deliveryStops.id, id));
    }

    const trackingUrl = `${process.env.BASE_URL || "https://washbizhub.com"}/track/${token}`;

    res.json({
      token,
      trackingUrl,
      stopId: stop.id,
    });
  } catch (error) {
    console.error("Error generating tracking token:", error);
    res.status(500).json({ error: "Failed to generate tracking token" });
  }
});

// Update driver location for a route
router.post("/routes/:routeId/update-location", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { routeId } = req.params;
    const { latitude, longitude, heading, speed } = req.body;

    // Verify route ownership or driver assignment
    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.id, routeId),
          eq(deliveryRoutes.userId, userId)
        )
      );

    if (!route) {
      return res.status(404).json({ error: "Route not found or access denied" });
    }

    // Update route with current driver location
    await db
      .update(deliveryRoutes)
      .set({
        currentDriverLat: latitude,
        currentDriverLng: longitude,
        lastDriverLocationUpdate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(deliveryRoutes.id, routeId));

    // Update current active stop with driver location
    const [activeStop] = await db
      .select()
      .from(deliveryStops)
      .where(
        and(
          eq(deliveryStops.routeId, routeId),
          eq(deliveryStops.status, "en_route")
        )
      )
      .orderBy(asc(deliveryStops.sequence))
      .limit(1);

    if (activeStop) {
      const driverLocationData = {
        lat: latitude,
        lng: longitude,
        heading: heading || 0,
        speed: speed || 0,
        updatedAt: new Date().toISOString(),
      };

      await db
        .update(deliveryStops)
        .set({
          driverLocation: driverLocationData,
          lastLocationUpdate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(deliveryStops.id, activeStop.id));
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating driver location:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// Toggle location sharing for a route
router.post("/routes/:routeId/toggle-location-sharing", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { routeId } = req.params;
    const { enabled } = req.body;

    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, routeId), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    const [updated] = await db
      .update(deliveryRoutes)
      .set({
        locationSharingActive: enabled,
        updatedAt: new Date(),
      })
      .where(eq(deliveryRoutes.id, routeId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error toggling location sharing:", error);
    res.status(500).json({ error: "Failed to toggle location sharing" });
  }
});

// Update stop status (driver updating status as they progress)
router.post("/stops/:id/update-status", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { status } = req.body; // "en_route", "arrived", "completed", "failed", "skipped"

    const validStatuses = ["pending", "en_route", "arrived", "completed", "failed", "skipped"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [stop] = await db.select().from(deliveryStops).where(eq(deliveryStops.id, id));
    if (!stop) {
      return res.status(404).json({ error: "Stop not found" });
    }

    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, stop.routeId), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "arrived") {
      updateData.arrivedAt = new Date();
    } else if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const [updated] = await db
      .update(deliveryStops)
      .set(updateData)
      .where(eq(deliveryStops.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating stop status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Update ETA for a stop
router.post("/stops/:id/update-eta", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { etaMinutes, estimatedArrival } = req.body;

    const [stop] = await db.select().from(deliveryStops).where(eq(deliveryStops.id, id));
    if (!stop) {
      return res.status(404).json({ error: "Stop not found" });
    }

    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, stop.routeId), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(403).json({ error: "Access denied" });
    }

    const [updated] = await db
      .update(deliveryStops)
      .set({
        etaMinutes,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
        updatedAt: new Date(),
      })
      .where(eq(deliveryStops.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating ETA:", error);
    res.status(500).json({ error: "Failed to update ETA" });
  }
});

// Get driver's current route with all stops
router.get("/my-route", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's routes in progress or scheduled
    const routes = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.userId, userId),
          gte(deliveryRoutes.routeDate, today),
          lte(deliveryRoutes.routeDate, tomorrow)
        )
      )
      .orderBy(asc(deliveryRoutes.routeDate));

    // Get stops for each route
    const routesWithStops = await Promise.all(
      routes.map(async (route) => {
        const stops = await db
          .select()
          .from(deliveryStops)
          .where(eq(deliveryStops.routeId, route.id))
          .orderBy(asc(deliveryStops.sequence));
        return { ...route, stops };
      })
    );

    res.json(routesWithStops);
  } catch (error) {
    console.error("Error fetching driver route:", error);
    res.status(500).json({ error: "Failed to fetch route" });
  }
});

// Generate tracking tokens for all stops in a route
router.post("/routes/:routeId/generate-all-tokens", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { routeId } = req.params;

    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, routeId), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    const stops = await db
      .select()
      .from(deliveryStops)
      .where(eq(deliveryStops.routeId, routeId));

    const baseUrl = process.env.BASE_URL || "https://washbizhub.com";
    const results = [];

    for (const stop of stops) {
      const token = stop.trackingToken || generateTrackingToken();
      
      if (!stop.trackingToken) {
        await db
          .update(deliveryStops)
          .set({ trackingToken: token, updatedAt: new Date() })
          .where(eq(deliveryStops.id, stop.id));
      }

      results.push({
        stopId: stop.id,
        customerName: stop.customerName,
        token,
        trackingUrl: `${baseUrl}/track/${token}`,
      });
    }

    res.json(results);
  } catch (error) {
    console.error("Error generating tracking tokens:", error);
    res.status(500).json({ error: "Failed to generate tracking tokens" });
  }
});

export default router;
