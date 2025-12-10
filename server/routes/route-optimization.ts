import { Router } from "express";
import { db } from "../db";
import { deliveryRoutes, deliveryStops, insertDeliveryRouteSchema, insertDeliveryStopSchema, users } from "@shared/schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

async function getCurrentUserId(req: any): Promise<string | null> {
  const userSub = req.user?.sub || (req.user as any)?.claims?.sub;
  return userSub || null;
}

// ========================================
// DELIVERY ROUTES CRUD
// ========================================

// Get all routes for current user (optionally filtered by date range)
router.get("/routes", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { startDate, endDate, status, driverId } = req.query;

    let query = db
      .select()
      .from(deliveryRoutes)
      .where(eq(deliveryRoutes.userId, userId))
      .orderBy(desc(deliveryRoutes.routeDate));

    const routes = await query;
    
    // Filter in JS for simpler query building
    let filteredRoutes = routes;
    if (startDate) {
      filteredRoutes = filteredRoutes.filter(r => new Date(r.routeDate) >= new Date(startDate as string));
    }
    if (endDate) {
      filteredRoutes = filteredRoutes.filter(r => new Date(r.routeDate) <= new Date(endDate as string));
    }
    if (status) {
      filteredRoutes = filteredRoutes.filter(r => r.status === status);
    }
    if (driverId) {
      filteredRoutes = filteredRoutes.filter(r => r.driverId === driverId);
    }

    res.json(filteredRoutes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

// Get single route with stops
router.get("/routes/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, id), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    const stops = await db
      .select()
      .from(deliveryStops)
      .where(eq(deliveryStops.routeId, id))
      .orderBy(asc(deliveryStops.sequence));

    res.json({ ...route, stops });
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ error: "Failed to fetch route" });
  }
});

// Create new route
router.post("/routes", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const validatedData = insertDeliveryRouteSchema.parse({
      ...req.body,
      userId,
    });

    const [newRoute] = await db
      .insert(deliveryRoutes)
      .values(validatedData)
      .returning();

    res.status(201).json(newRoute);
  } catch (error) {
    console.error("Error creating route:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create route" });
  }
});

// Update route
router.patch("/routes/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, id), eq(deliveryRoutes.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Route not found" });
    }

    const [updated] = await db
      .update(deliveryRoutes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(deliveryRoutes.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating route:", error);
    res.status(500).json({ error: "Failed to update route" });
  }
});

// Delete route
router.delete("/routes/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, id), eq(deliveryRoutes.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Route not found" });
    }

    await db.delete(deliveryRoutes).where(eq(deliveryRoutes.id, id));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting route:", error);
    res.status(500).json({ error: "Failed to delete route" });
  }
});

// ========================================
// DELIVERY STOPS CRUD
// ========================================

// Get stops for a route
router.get("/routes/:routeId/stops", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { routeId } = req.params;

    // Verify route ownership
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
      .where(eq(deliveryStops.routeId, routeId))
      .orderBy(asc(deliveryStops.sequence));

    res.json(stops);
  } catch (error) {
    console.error("Error fetching stops:", error);
    res.status(500).json({ error: "Failed to fetch stops" });
  }
});

// Add stop to route
router.post("/routes/:routeId/stops", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { routeId } = req.params;

    // Verify route ownership
    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, routeId), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    // Get current max sequence
    const [maxSeq] = await db
      .select({ maxSequence: sql<number>`COALESCE(MAX(${deliveryStops.sequence}), 0)` })
      .from(deliveryStops)
      .where(eq(deliveryStops.routeId, routeId));

    const validatedData = insertDeliveryStopSchema.parse({
      ...req.body,
      routeId,
      sequence: req.body.sequence ?? (maxSeq?.maxSequence ?? 0) + 1,
    });

    const [newStop] = await db
      .insert(deliveryStops)
      .values(validatedData)
      .returning();

    res.status(201).json(newStop);
  } catch (error) {
    console.error("Error creating stop:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create stop" });
  }
});

// Update stop
router.patch("/stops/:id", isAuthenticated, async (req, res) => {
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

    const [updated] = await db
      .update(deliveryStops)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(deliveryStops.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating stop:", error);
    res.status(500).json({ error: "Failed to update stop" });
  }
});

// Delete stop
router.delete("/stops/:id", isAuthenticated, async (req, res) => {
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

    await db.delete(deliveryStops).where(eq(deliveryStops.id, id));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting stop:", error);
    res.status(500).json({ error: "Failed to delete stop" });
  }
});

// Reorder stops (bulk update sequences)
router.post("/routes/:routeId/reorder", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { routeId } = req.params;
    const { stopOrder } = req.body; // Array of {id, sequence}

    // Verify route ownership
    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, routeId), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    // Update all sequences in order
    for (const item of stopOrder) {
      await db
        .update(deliveryStops)
        .set({ sequence: item.sequence, updatedAt: new Date() })
        .where(and(eq(deliveryStops.id, item.id), eq(deliveryStops.routeId, routeId)));
    }

    const updatedStops = await db
      .select()
      .from(deliveryStops)
      .where(eq(deliveryStops.routeId, routeId))
      .orderBy(asc(deliveryStops.sequence));

    res.json(updatedStops);
  } catch (error) {
    console.error("Error reordering stops:", error);
    res.status(500).json({ error: "Failed to reorder stops" });
  }
});

// ========================================
// ROUTE OPTIMIZATION (Google Routes API)
// ========================================

router.post("/routes/:routeId/optimize", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { routeId } = req.params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Google Maps API key not configured" });
    }

    // Verify route ownership and get route
    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(and(eq(deliveryRoutes.id, routeId), eq(deliveryRoutes.userId, userId)));

    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    // Get all stops
    const stops = await db
      .select()
      .from(deliveryStops)
      .where(eq(deliveryStops.routeId, routeId))
      .orderBy(asc(deliveryStops.sequence));

    if (stops.length < 2) {
      return res.status(400).json({ error: "Need at least 2 stops to optimize" });
    }

    // Prepare waypoints for Google Routes API
    const origin = route.startAddress || stops[0].address;
    const destination = route.endAddress || stops[stops.length - 1].address;
    
    const waypoints = stops.map(stop => ({
      location: {
        latLng: stop.latitude && stop.longitude 
          ? { latitude: parseFloat(stop.latitude.toString()), longitude: parseFloat(stop.longitude.toString()) }
          : undefined,
        address: stop.address,
      },
      via: false,
    }));

    // Call Google Routes API for optimization
    const routesApiUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";
    
    const requestBody = {
      origin: {
        address: origin,
      },
      destination: {
        address: destination,
      },
      intermediates: waypoints.slice(1, -1).map(w => ({
        address: w.location.address,
      })),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
      },
      optimizeWaypointOrder: true,
      languageCode: "en-US",
      units: "IMPERIAL",
    };

    const response = await fetch(routesApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex,routes.legs",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Routes API error:", errorText);
      return res.status(500).json({ error: "Route optimization failed", details: errorText });
    }

    const routeData = await response.json();
    const optimizedRoute = routeData.routes?.[0];

    if (!optimizedRoute) {
      return res.status(500).json({ error: "No route returned from optimization" });
    }

    // Extract optimization results
    const optimizedOrder = optimizedRoute.optimizedIntermediateWaypointIndex || [];
    const totalDistanceMeters = optimizedRoute.distanceMeters || 0;
    const totalDurationSeconds = parseInt(optimizedRoute.duration?.replace("s", "") || "0");
    const polyline = optimizedRoute.polyline?.encodedPolyline;

    // Convert meters to miles
    const totalDistanceMiles = (totalDistanceMeters / 1609.34).toFixed(2);
    const totalDurationMinutes = Math.ceil(totalDurationSeconds / 60);

    // Update stop sequences based on optimized order
    const middleStops = stops.slice(1, -1);
    for (let i = 0; i < optimizedOrder.length; i++) {
      const originalIndex = optimizedOrder[i];
      const stop = middleStops[originalIndex];
      if (stop) {
        await db
          .update(deliveryStops)
          .set({ sequence: i + 1, updatedAt: new Date() })
          .where(eq(deliveryStops.id, stop.id));
      }
    }

    // Update route with optimization results
    const [updatedRoute] = await db
      .update(deliveryRoutes)
      .set({
        optimizedPath: polyline ? { encoded: polyline } : null,
        optimizedOrder: optimizedOrder,
        totalDistance: totalDistanceMiles,
        totalDuration: totalDurationMinutes,
        updatedAt: new Date(),
      })
      .where(eq(deliveryRoutes.id, routeId))
      .returning();

    // Get updated stops
    const updatedStops = await db
      .select()
      .from(deliveryStops)
      .where(eq(deliveryStops.routeId, routeId))
      .orderBy(asc(deliveryStops.sequence));

    res.json({
      route: updatedRoute,
      stops: updatedStops,
      optimization: {
        totalDistance: `${totalDistanceMiles} miles`,
        totalDuration: `${totalDurationMinutes} minutes`,
        polyline,
      },
    });
  } catch (error) {
    console.error("Error optimizing route:", error);
    res.status(500).json({ error: "Failed to optimize route" });
  }
});

// Mark stop as complete
router.post("/stops/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { notes, signatureUrl, photoProofUrls } = req.body;

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
        status: "completed",
        completedAt: new Date(),
        completionNotes: notes,
        signatureUrl,
        photoProofUrls: photoProofUrls || [],
        updatedAt: new Date(),
      })
      .where(eq(deliveryStops.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error completing stop:", error);
    res.status(500).json({ error: "Failed to complete stop" });
  }
});

// Get today's route for driver view
router.get("/today", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const routes = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.userId, userId),
          gte(deliveryRoutes.routeDate, today),
          lte(deliveryRoutes.routeDate, tomorrow)
        )
      );

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
    console.error("Error fetching today's routes:", error);
    res.status(500).json({ error: "Failed to fetch today's routes" });
  }
});

// Geocode address using Google Geocoding API
router.post("/geocode", isAuthenticated, async (req, res) => {
  try {
    const { address } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Google Maps API key not configured" });
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.[0]) {
      return res.status(400).json({ error: "Could not geocode address" });
    }

    const result = data.results[0];
    res.json({
      formattedAddress: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      placeId: result.place_id,
    });
  } catch (error) {
    console.error("Error geocoding address:", error);
    res.status(500).json({ error: "Failed to geocode address" });
  }
});

// Get available drivers (team members)
router.get("/drivers", isAuthenticated, async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // For now, return the current user as a driver
    // In a real implementation, this would query team members
    const [currentUser] = await db
      .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email })
      .from(users)
      .where(eq(users.id, userId));

    const drivers = currentUser ? [{
      id: currentUser.id,
      name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || 'Driver',
      email: currentUser.email,
    }] : [];

    res.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

export default router;
