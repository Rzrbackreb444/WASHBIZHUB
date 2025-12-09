import { Router, Request, Response } from "express";
import { db } from "./db";
import { users, userProfiles, userSocialLinks, userConnections, activityEvents } from "@shared/schema";
import { eq, and, desc, sql, ne, inArray } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";
import { z } from "zod";

const router = Router();

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  headline: z.string().max(200).optional(),
  bio: z.string().optional(),
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  website: z.string().url().max(255).optional().or(z.literal("")),
  visibility: z.enum(["public", "private", "connections"]).optional(),
  showEmail: z.boolean().optional(),
  showLocation: z.boolean().optional(),
});

const updateAvatarSchema = z.object({
  avatarUrl: z.string().url().or(z.literal("")),
  avatarType: z.enum(["initials", "upload", "tenor", "google", "gravatar"]).optional(),
});

const socialLinksSchema = z.array(z.object({
  platform: z.string().max(50),
  url: z.string().url(),
  displayOrder: z.number().int().min(0).optional(),
}));

const createActivitySchema = z.object({
  eventType: z.string().max(50),
  entityType: z.string().max(50).optional(),
  entityId: z.string().optional(),
  metadata: z.any().optional(),
  isPublic: z.boolean().optional(),
});

const profileViewRateLimitMap = new Map<string, number>();
const PROFILE_VIEW_COOLDOWN = 1000 * 60 * 15; // 15 minutes

// ==================== PROFILE CRUD ====================

// GET /api/profile/me - Get current user's profile
router.get("/me", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      return res.json({
        userId,
        username: user?.username || null,
        headline: null,
        bio: null,
        location: null,
        company: null,
        website: null,
        avatarUrl: user?.profileImageUrl || null,
        avatarType: "initials",
        coverImageUrl: null,
        visibility: "public",
        profileViews: 0,
        showEmail: false,
        showLocation: true,
        user: user ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        } : null,
      });
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.json({
      ...profile,
      user: user ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// GET /api/profile/:username - Get public profile by username
router.get("/:username", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = (req as any).user?.id;

    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.username, username))
      .limit(1);

    if (!profile) {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json({
        userId: user.id,
        username: user.username,
        headline: null,
        bio: null,
        location: null,
        company: null,
        website: null,
        avatarUrl: user.profileImageUrl,
        avatarType: "initials",
        visibility: "public",
        profileViews: 0,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        isFollowing: false,
        followerCount: 0,
        followingCount: 0,
      });
    }

    if (profile.visibility === "private" && profile.userId !== currentUserId) {
      return res.status(403).json({ error: "This profile is private" });
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, profile.userId))
      .limit(1);

    const [followerCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(userConnections)
      .where(and(
        eq(userConnections.followingId, profile.userId),
        eq(userConnections.status, "active")
      ));

    const [followingCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(userConnections)
      .where(and(
        eq(userConnections.followerId, profile.userId),
        eq(userConnections.status, "active")
      ));

    let isFollowing = false;
    if (currentUserId && currentUserId !== profile.userId) {
      const [connection] = await db.select()
        .from(userConnections)
        .where(and(
          eq(userConnections.followerId, currentUserId),
          eq(userConnections.followingId, profile.userId),
          eq(userConnections.status, "active")
        ))
        .limit(1);
      isFollowing = !!connection;
    }

    res.json({
      ...profile,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        email: profile.showEmail ? user.email : undefined,
      } : null,
      isFollowing,
      followerCount: followerCount?.count || 0,
      followingCount: followingCount?.count || 0,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/profile/me - Update current user's profile
router.put("/me", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }

    const data = parsed.data;

    if (data.username) {
      const [existing] = await db.select()
        .from(userProfiles)
        .where(and(
          eq(userProfiles.username, data.username),
          ne(userProfiles.userId, userId)
        ))
        .limit(1);

      if (existing) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const [existingUser] = await db.select()
        .from(users)
        .where(and(
          eq(users.username, data.username),
          ne(users.id, userId)
        ))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    const [existingProfile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    let profile;
    if (existingProfile) {
      [profile] = await db.update(userProfiles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId))
        .returning();
    } else {
      [profile] = await db.insert(userProfiles)
        .values({
          userId,
          ...data,
        })
        .returning();
    }

    if (data.username) {
      await db.update(users)
        .set({ username: data.username })
        .where(eq(users.id, userId));
    }

    res.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// PATCH /api/profile/me/avatar - Update avatar
router.patch("/me/avatar", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = updateAvatarSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }

    const { avatarUrl, avatarType } = parsed.data;

    const [existingProfile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    let profile;
    if (existingProfile) {
      [profile] = await db.update(userProfiles)
        .set({
          avatarUrl,
          avatarType: avatarType || "upload",
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId))
        .returning();
    } else {
      [profile] = await db.insert(userProfiles)
        .values({
          userId,
          avatarUrl,
          avatarType: avatarType || "upload",
        })
        .returning();
    }

    await db.update(users)
      .set({ profileImageUrl: avatarUrl })
      .where(eq(users.id, userId));

    res.json(profile);
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

// ==================== SOCIAL LINKS ====================

// GET /api/profile/me/social-links - Get user's social links
router.get("/me/social-links", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const links = await db.select()
      .from(userSocialLinks)
      .where(eq(userSocialLinks.userId, userId))
      .orderBy(userSocialLinks.displayOrder);

    res.json(links);
  } catch (error) {
    console.error("Error fetching social links:", error);
    res.status(500).json({ error: "Failed to fetch social links" });
  }
});

// PUT /api/profile/me/social-links - Update all social links
router.put("/me/social-links", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = socialLinksSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }

    const links = parsed.data;

    await db.delete(userSocialLinks)
      .where(eq(userSocialLinks.userId, userId));

    if (links.length > 0) {
      const insertData = links.map((link, index) => ({
        userId,
        platform: link.platform,
        url: link.url,
        displayOrder: link.displayOrder ?? index,
      }));

      await db.insert(userSocialLinks).values(insertData);
    }

    const updatedLinks = await db.select()
      .from(userSocialLinks)
      .where(eq(userSocialLinks.userId, userId))
      .orderBy(userSocialLinks.displayOrder);

    res.json(updatedLinks);
  } catch (error) {
    console.error("Error updating social links:", error);
    res.status(500).json({ error: "Failed to update social links" });
  }
});

// ==================== FOLLOW SYSTEM ====================

// POST /api/profile/:userId/follow - Follow a user
router.post("/:userId/follow", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user?.id;
    const { userId: followingId } = req.params;

    if (!followerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const [targetUser] = await db.select()
      .from(users)
      .where(eq(users.id, followingId))
      .limit(1);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const [existingConnection] = await db.select()
      .from(userConnections)
      .where(and(
        eq(userConnections.followerId, followerId),
        eq(userConnections.followingId, followingId)
      ))
      .limit(1);

    if (existingConnection) {
      if (existingConnection.status === "active") {
        return res.status(400).json({ error: "Already following this user" });
      }
      await db.update(userConnections)
        .set({ status: "active", createdAt: new Date() })
        .where(eq(userConnections.id, existingConnection.id));
    } else {
      await db.insert(userConnections)
        .values({
          followerId,
          followingId,
          status: "active",
        });
    }

    await db.insert(activityEvents)
      .values({
        userId: followerId,
        eventType: "follow",
        entityType: "user",
        entityId: followingId,
        isPublic: true,
      });

    res.json({ success: true, message: "Successfully followed user" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
});

// DELETE /api/profile/:userId/follow - Unfollow a user
router.delete("/:userId/follow", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user?.id;
    const { userId: followingId } = req.params;

    if (!followerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await db.delete(userConnections)
      .where(and(
        eq(userConnections.followerId, followerId),
        eq(userConnections.followingId, followingId)
      ));

    res.json({ success: true, message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

// GET /api/profile/:username/followers - Get followers list (paginated)
router.get("/:username/followers", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.username, username))
      .limit(1);

    let targetUserId: string;
    if (profile) {
      targetUserId = profile.userId;
    } else {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      targetUserId = user.id;
    }

    const connections = await db.select({
      connection: userConnections,
      follower: users,
      followerProfile: userProfiles,
    })
      .from(userConnections)
      .leftJoin(users, eq(userConnections.followerId, users.id))
      .leftJoin(userProfiles, eq(userConnections.followerId, userProfiles.userId))
      .where(and(
        eq(userConnections.followingId, targetUserId),
        eq(userConnections.status, "active")
      ))
      .orderBy(desc(userConnections.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(userConnections)
      .where(and(
        eq(userConnections.followingId, targetUserId),
        eq(userConnections.status, "active")
      ));

    const followers = connections.map(c => ({
      id: c.follower?.id,
      username: c.followerProfile?.username || c.follower?.username,
      firstName: c.follower?.firstName,
      lastName: c.follower?.lastName,
      profileImageUrl: c.followerProfile?.avatarUrl || c.follower?.profileImageUrl,
      headline: c.followerProfile?.headline,
      followedAt: c.connection.createdAt,
    }));

    res.json({
      followers,
      total: totalCount?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

// GET /api/profile/:username/following - Get following list (paginated)
router.get("/:username/following", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.username, username))
      .limit(1);

    let targetUserId: string;
    if (profile) {
      targetUserId = profile.userId;
    } else {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      targetUserId = user.id;
    }

    const connections = await db.select({
      connection: userConnections,
      following: users,
      followingProfile: userProfiles,
    })
      .from(userConnections)
      .leftJoin(users, eq(userConnections.followingId, users.id))
      .leftJoin(userProfiles, eq(userConnections.followingId, userProfiles.userId))
      .where(and(
        eq(userConnections.followerId, targetUserId),
        eq(userConnections.status, "active")
      ))
      .orderBy(desc(userConnections.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(userConnections)
      .where(and(
        eq(userConnections.followerId, targetUserId),
        eq(userConnections.status, "active")
      ));

    const following = connections.map(c => ({
      id: c.following?.id,
      username: c.followingProfile?.username || c.following?.username,
      firstName: c.following?.firstName,
      lastName: c.following?.lastName,
      profileImageUrl: c.followingProfile?.avatarUrl || c.following?.profileImageUrl,
      headline: c.followingProfile?.headline,
      followedAt: c.connection.createdAt,
    }));

    res.json({
      following,
      total: totalCount?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
});

// GET /api/profile/me/suggestions - Get suggested users to follow
router.get("/me/suggestions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const alreadyFollowing = await db.select({ followingId: userConnections.followingId })
      .from(userConnections)
      .where(and(
        eq(userConnections.followerId, userId),
        eq(userConnections.status, "active")
      ));

    const excludeIds = [userId, ...alreadyFollowing.map(f => f.followingId)];

    const suggestions = await db.select({
      user: users,
      profile: userProfiles,
      activityCount: sql<number>`(SELECT count(*) FROM activity_events WHERE user_id = ${users.id})::int`,
    })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(and(
        sql`${users.id} NOT IN (${sql.join(excludeIds.map(id => sql`${id}`), sql`, `)})`,
        eq(sql`COALESCE(${userProfiles.visibility}, 'public')`, "public")
      ))
      .orderBy(desc(sql`(SELECT count(*) FROM user_connections WHERE following_id = ${users.id})`))
      .limit(limit);

    const result = suggestions.map(s => ({
      id: s.user.id,
      username: s.profile?.username || s.user.username,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      profileImageUrl: s.profile?.avatarUrl || s.user.profileImageUrl,
      headline: s.profile?.headline,
      company: s.profile?.company,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// ==================== PROFILE VIEWS ====================

// POST /api/profile/:username/view - Track profile view
router.post("/:username/view", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const viewerId = (req as any).user?.id;
    const viewerIp = req.ip || req.connection.remoteAddress || "unknown";
    const rateLimitKey = `${viewerIp}-${username}`;

    const lastView = profileViewRateLimitMap.get(rateLimitKey);
    const now = Date.now();

    if (lastView && now - lastView < PROFILE_VIEW_COOLDOWN) {
      return res.json({ success: false, message: "View already counted recently" });
    }

    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.username, username))
      .limit(1);

    if (profile) {
      if (viewerId && viewerId === profile.userId) {
        return res.json({ success: false, message: "Cannot count own profile view" });
      }

      await db.update(userProfiles)
        .set({ profileViews: sql`${userProfiles.profileViews} + 1` })
        .where(eq(userProfiles.id, profile.id));

      profileViewRateLimitMap.set(rateLimitKey, now);

      res.json({ success: true, message: "Profile view counted" });
    } else {
      res.status(404).json({ error: "Profile not found" });
    }
  } catch (error) {
    console.error("Error tracking profile view:", error);
    res.status(500).json({ error: "Failed to track profile view" });
  }
});

// ==================== SOCIAL LINKS BY USERNAME ====================

// GET /api/profile/:username/social-links - Get user's social links by username
router.get("/:username/social-links", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.username, username))
      .limit(1);

    let targetUserId: string;
    if (profile) {
      targetUserId = profile.userId;
    } else {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      targetUserId = user.id;
    }

    const links = await db.select()
      .from(userSocialLinks)
      .where(eq(userSocialLinks.userId, targetUserId))
      .orderBy(userSocialLinks.displayOrder);

    res.json(links);
  } catch (error) {
    console.error("Error fetching social links:", error);
    res.status(500).json({ error: "Failed to fetch social links" });
  }
});

// ==================== ACTIVITY FEED ====================

// Create activity router for /api/activity routes
export const activityRouter = Router();

// GET /api/activity/feed - Get activity feed for current user
activityRouter.get("/feed", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const following = await db.select({ followingId: userConnections.followingId })
      .from(userConnections)
      .where(and(
        eq(userConnections.followerId, userId),
        eq(userConnections.status, "active")
      ));

    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      return res.json({ activities: [], total: 0, limit, offset });
    }

    const activities = await db.select({
      activity: activityEvents,
      user: users,
      profile: userProfiles,
    })
      .from(activityEvents)
      .leftJoin(users, eq(activityEvents.userId, users.id))
      .leftJoin(userProfiles, eq(activityEvents.userId, userProfiles.userId))
      .where(and(
        inArray(activityEvents.userId, followingIds),
        eq(activityEvents.isPublic, true)
      ))
      .orderBy(desc(activityEvents.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(activityEvents)
      .where(and(
        inArray(activityEvents.userId, followingIds),
        eq(activityEvents.isPublic, true)
      ));

    const result = activities.map(a => ({
      ...a.activity,
      user: {
        id: a.user?.id,
        username: a.profile?.username || a.user?.username,
        firstName: a.user?.firstName,
        lastName: a.user?.lastName,
        profileImageUrl: a.profile?.avatarUrl || a.user?.profileImageUrl,
      },
    }));

    res.json({
      activities: result,
      total: totalCount?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    res.status(500).json({ error: "Failed to fetch activity feed" });
  }
});

// GET /api/profile/:username/activity - Get public activity for a user
router.get("/:username/activity", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.username, username))
      .limit(1);

    let targetUserId: string;
    if (profile) {
      targetUserId = profile.userId;
    } else {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      targetUserId = user.id;
    }

    const activities = await db.select()
      .from(activityEvents)
      .where(and(
        eq(activityEvents.userId, targetUserId),
        eq(activityEvents.isPublic, true)
      ))
      .orderBy(desc(activityEvents.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(activityEvents)
      .where(and(
        eq(activityEvents.userId, targetUserId),
        eq(activityEvents.isPublic, true)
      ));

    res.json({
      activities,
      total: totalCount?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
});

// POST /api/activity - Create activity event (internal use)
activityRouter.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = createActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }

    const { eventType, entityType, entityId, metadata, isPublic } = parsed.data;

    const [activity] = await db.insert(activityEvents)
      .values({
        userId,
        eventType,
        entityType,
        entityId,
        metadata,
        isPublic: isPublic ?? true,
      })
      .returning();

    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

export default router;
