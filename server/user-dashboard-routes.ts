/**
 * User Dashboard Routes
 * Connects saved searches, favorites, calculators, reports, and activity
 */

import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  savedSearches, favoriteListings, buyerListingHistory, activityEvents,
  listings, users, userConnections
} from "@shared/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";

const router = Router();

// Get user dashboard overview with stats
router.get("/overview", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get counts for dashboard stats
    const [searchCount, favoriteCount, historyCount, connectionCount] = await Promise.all([
      db.select({ count: count() }).from(savedSearches).where(eq(savedSearches.userId, userId)),
      db.select({ count: count() }).from(favoriteListings).where(eq(favoriteListings.userId, userId)),
      db.select({ count: count() }).from(buyerListingHistory).where(eq(buyerListingHistory.userId, userId)),
      db.select({ count: count() }).from(userConnections).where(eq(userConnections.followerId, userId)),
    ]);

    // Get recent activity
    const recentActivity = await db
      .select()
      .from(activityEvents)
      .where(eq(activityEvents.userId, userId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(10);

    // Get saved searches with match counts
    const userSavedSearches = await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.updatedAt))
      .limit(5);

    // Get favorite listings
    const userFavorites = await db
      .select({
        favorite: favoriteListings,
        listing: listings,
      })
      .from(favoriteListings)
      .leftJoin(listings, eq(favoriteListings.listingId, listings.id))
      .where(eq(favoriteListings.userId, userId))
      .orderBy(desc(favoriteListings.createdAt))
      .limit(5);

    // Get viewing history
    const viewingHistory = await db
      .select({
        history: buyerListingHistory,
        listing: listings,
      })
      .from(buyerListingHistory)
      .leftJoin(listings, eq(buyerListingHistory.listingId, listings.id))
      .where(eq(buyerListingHistory.userId, userId))
      .orderBy(desc(buyerListingHistory.lastViewedAt))
      .limit(5);

    res.json({
      stats: {
        savedSearches: searchCount[0]?.count || 0,
        favorites: favoriteCount[0]?.count || 0,
        listingsViewed: historyCount[0]?.count || 0,
        connections: connectionCount[0]?.count || 0,
      },
      recentActivity,
      savedSearches: userSavedSearches,
      favorites: userFavorites.map(f => ({
        ...f.favorite,
        listing: f.listing,
      })),
      viewingHistory: viewingHistory.map(h => ({
        ...h.history,
        listing: h.listing,
      })),
    });
  } catch (error: any) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Get user's saved searches
router.get("/saved-searches", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const searches = await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.updatedAt));

    res.json(searches);
  } catch (error: any) {
    console.error("Saved searches error:", error);
    res.status(500).json({ error: "Failed to fetch saved searches" });
  }
});

// Save a new search
router.post("/saved-searches", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, filters, alertFrequency = "daily" } = req.body;

    const [search] = await db
      .insert(savedSearches)
      .values({
        userId,
        name,
        filters,
        alertFrequency,
      })
      .returning();

    // Log activity
    await db.insert(activityEvents).values({
      userId,
      eventType: "saved_search",
      entityType: "search",
      entityId: search.id,
      metadata: { name },
    });

    res.json(search);
  } catch (error: any) {
    console.error("Save search error:", error);
    res.status(500).json({ error: "Failed to save search" });
  }
});

// Delete a saved search
router.delete("/saved-searches/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    await db
      .delete(savedSearches)
      .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete search error:", error);
    res.status(500).json({ error: "Failed to delete search" });
  }
});

// Get user's favorites
router.get("/favorites", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const favorites = await db
      .select({
        favorite: favoriteListings,
        listing: listings,
      })
      .from(favoriteListings)
      .leftJoin(listings, eq(favoriteListings.listingId, listings.id))
      .where(eq(favoriteListings.userId, userId))
      .orderBy(desc(favoriteListings.createdAt));

    res.json(favorites.map(f => ({
      ...f.favorite,
      listing: f.listing,
    })));
  } catch (error: any) {
    console.error("Favorites error:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Add to favorites
router.post("/favorites", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { listingId, notes } = req.body;

    const [favorite] = await db
      .insert(favoriteListings)
      .values({
        userId,
        listingId,
        notes,
      })
      .onConflictDoNothing()
      .returning();

    // Log activity
    await db.insert(activityEvents).values({
      userId,
      eventType: "favorite_listing",
      entityType: "listing",
      entityId: listingId,
    });

    res.json(favorite);
  } catch (error: any) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// Remove from favorites
router.delete("/favorites/:listingId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { listingId } = req.params;

    await db
      .delete(favoriteListings)
      .where(and(eq(favoriteListings.listingId, listingId), eq(favoriteListings.userId, userId)));

    res.json({ success: true });
  } catch (error: any) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// Track listing view
router.post("/history", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { listingId } = req.body;

    // Upsert view history
    await db
      .insert(buyerListingHistory)
      .values({
        userId,
        listingId,
      })
      .onConflictDoUpdate({
        target: [buyerListingHistory.userId, buyerListingHistory.listingId],
        set: {
          viewCount: sql`${buyerListingHistory.viewCount} + 1`,
          lastViewedAt: new Date(),
        },
      });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Track view error:", error);
    res.status(500).json({ error: "Failed to track view" });
  }
});

// Get viewing history
router.get("/history", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const history = await db
      .select({
        history: buyerListingHistory,
        listing: listings,
      })
      .from(buyerListingHistory)
      .leftJoin(listings, eq(buyerListingHistory.listingId, listings.id))
      .where(eq(buyerListingHistory.userId, userId))
      .orderBy(desc(buyerListingHistory.lastViewedAt))
      .limit(20);

    res.json(history.map(h => ({
      ...h.history,
      listing: h.listing,
    })));
  } catch (error: any) {
    console.error("History error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get activity feed
router.get("/activity", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const activity = await db
      .select()
      .from(activityEvents)
      .where(eq(activityEvents.userId, userId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(50);

    res.json(activity);
  } catch (error: any) {
    console.error("Activity error:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

// Get user connections (following)
router.get("/connections", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const connections = await db
      .select({
        connection: userConnections,
        user: users,
      })
      .from(userConnections)
      .leftJoin(users, eq(userConnections.followingId, users.id))
      .where(eq(userConnections.followerId, userId))
      .orderBy(desc(userConnections.createdAt));

    res.json(connections.map(c => ({
      ...c.connection,
      user: c.user,
    })));
  } catch (error: any) {
    console.error("Connections error:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// Follow a user
router.post("/connections/follow", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { targetUserId } = req.body;

    if (userId === targetUserId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const [connection] = await db
      .insert(userConnections)
      .values({
        followerId: userId,
        followingId: targetUserId,
      })
      .onConflictDoNothing()
      .returning();

    // Log activity
    await db.insert(activityEvents).values({
      userId,
      eventType: "follow",
      entityType: "user",
      entityId: targetUserId,
    });

    res.json(connection);
  } catch (error: any) {
    console.error("Follow error:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
});

// Unfollow a user
router.delete("/connections/unfollow/:targetUserId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { targetUserId } = req.params;

    await db
      .delete(userConnections)
      .where(and(
        eq(userConnections.followerId, userId),
        eq(userConnections.followingId, targetUserId)
      ));

    res.json({ success: true });
  } catch (error: any) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

// Get engagement metrics for charts
router.get("/metrics", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get activity by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await db
      .select({
        date: sql<string>`DATE(${activityEvents.createdAt})`,
        count: count(),
      })
      .from(activityEvents)
      .where(and(
        eq(activityEvents.userId, userId),
        sql`${activityEvents.createdAt} >= ${sevenDaysAgo}`
      ))
      .groupBy(sql`DATE(${activityEvents.createdAt})`)
      .orderBy(sql`DATE(${activityEvents.createdAt})`);

    // Get activity by type
    const activityByType = await db
      .select({
        type: activityEvents.eventType,
        count: count(),
      })
      .from(activityEvents)
      .where(eq(activityEvents.userId, userId))
      .groupBy(activityEvents.eventType);

    res.json({
      dailyActivity,
      activityByType,
    });
  } catch (error: any) {
    console.error("Metrics error:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;
