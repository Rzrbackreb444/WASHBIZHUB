import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  users, listings, forumTopics, forumReplies, courses, enrollments,
  vendors, blogPosts, aiAgents, posTransactions, cleanbiUsage,
  newsletterSubscribers, tenants
} from "@shared/schema";
import { eq, sql, desc, count, sum, gte, and } from "drizzle-orm";

const router = Router();

// Admin credentials - hardcoded for simplicity
const ADMIN_CREDENTIALS = {
  email: "nick@washbizhub.com",
  password: "admin2025"
};

// Simple session storage (in production, use Redis)
const adminSessions = new Map<string, { email: string; expiresAt: Date }>();

// Generate session token
function generateToken(): string {
  return `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Middleware to check admin auth
export function requireAdmin(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.cookies?.adminToken;
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const session = adminSessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    adminSessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  
  next();
}

// Admin login
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    adminSessions.set(token, { email, expiresAt });
    
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });
    
    return res.json({ success: true, token });
  }
  
  return res.status(401).json({ error: "Invalid credentials" });
});

// Admin logout
router.post("/logout", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.cookies?.adminToken;
  
  if (token) {
    adminSessions.delete(token);
  }
  
  res.clearCookie("adminToken");
  return res.json({ success: true });
});

// Check auth status
router.get("/check", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.cookies?.adminToken;
  
  if (!token) {
    return res.json({ authenticated: false });
  }
  
  const session = adminSessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    adminSessions.delete(token);
    return res.json({ authenticated: false });
  }
  
  return res.json({ authenticated: true, email: session.email });
});

// Dashboard overview stats
router.get("/dashboard/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // User stats
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [newUsersThisMonth] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));
    const [proUsersResult] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.isPro, true));

    // Listing stats
    const [totalListingsResult] = await db.select({ count: count() }).from(listings);
    const [activeListingsResult] = await db.select({ count: count() })
      .from(listings)
      .where(eq(listings.status, "active"));

    // Forum stats
    const [totalTopicsResult] = await db.select({ count: count() }).from(forumTopics);
    const [totalRepliesResult] = await db.select({ count: count() }).from(forumReplies);
    const [topicsThisWeek] = await db.select({ count: count() })
      .from(forumTopics)
      .where(gte(forumTopics.createdAt, sevenDaysAgo));

    // Course stats
    const [totalCoursesResult] = await db.select({ count: count() }).from(courses);
    const [totalEnrollmentsResult] = await db.select({ count: count() }).from(enrollments);

    // Blog stats
    const [totalBlogPostsResult] = await db.select({ count: count() }).from(blogPosts);
    const [publishedBlogsResult] = await db.select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    // Vendor stats
    const [totalVendorsResult] = await db.select({ count: count() }).from(vendors);

    // AI Agent stats
    const [totalAiAgentsResult] = await db.select({ count: count() }).from(aiAgents);

    // CLEANBI usage
    let cleanbiScans = 0;
    try {
      const [cleanbiResult] = await db.select({ count: count() }).from(cleanbiUsage);
      cleanbiScans = cleanbiResult?.count || 0;
    } catch (e) {
      // Table might not exist
    }

    // Newsletter subscribers
    let subscriberCount = 0;
    try {
      const [subscribersResult] = await db.select({ count: count() }).from(newsletterSubscribers);
      subscriberCount = subscribersResult?.count || 0;
    } catch (e) {
      // Table might not exist
    }

    // Tenants
    let tenantCount = 0;
    try {
      const [tenantsResult] = await db.select({ count: count() }).from(tenants);
      tenantCount = tenantsResult?.count || 0;
    } catch (e) {
      // Table might not exist
    }

    res.json({
      users: {
        total: totalUsersResult?.count || 0,
        newThisMonth: newUsersThisMonth?.count || 0,
        proUsers: proUsersResult?.count || 0,
      },
      listings: {
        total: totalListingsResult?.count || 0,
        active: activeListingsResult?.count || 0,
      },
      forum: {
        totalTopics: totalTopicsResult?.count || 0,
        totalReplies: totalRepliesResult?.count || 0,
        topicsThisWeek: topicsThisWeek?.count || 0,
      },
      courses: {
        total: totalCoursesResult?.count || 0,
        enrollments: totalEnrollmentsResult?.count || 0,
      },
      content: {
        blogPosts: totalBlogPostsResult?.count || 0,
        publishedBlogs: publishedBlogsResult?.count || 0,
      },
      vendors: {
        total: totalVendorsResult?.count || 0,
      },
      aiAgents: {
        total: totalAiAgentsResult?.count || 0,
      },
      cleanbi: {
        totalScans: cleanbiScans,
      },
      newsletter: {
        subscribers: subscriberCount,
      },
      tenants: {
        total: tenantCount,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Recent users
router.get("/dashboard/recent-users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isPro: users.isPro,
      subscriptionTier: users.subscriptionTier,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(20);
    
    res.json(recentUsers);
  } catch (error) {
    console.error("Recent users error:", error);
    res.status(500).json({ error: "Failed to fetch recent users" });
  }
});

// Recent listings
router.get("/dashboard/recent-listings", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentListings = await db.select({
      id: listings.id,
      title: listings.title,
      businessType: listings.businessType,
      status: listings.status,
      priceInUSD: listings.priceInUSD,
      city: listings.city,
      region: listings.region,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .orderBy(desc(listings.createdAt))
    .limit(20);
    
    res.json(recentListings);
  } catch (error) {
    console.error("Recent listings error:", error);
    res.status(500).json({ error: "Failed to fetch recent listings" });
  }
});

// Recent forum activity
router.get("/dashboard/recent-forum", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentTopics = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      categoryId: forumTopics.categoryId,
      views: forumTopics.views,
      replyCount: forumTopics.replyCount,
      createdAt: forumTopics.createdAt,
    })
    .from(forumTopics)
    .orderBy(desc(forumTopics.createdAt))
    .limit(15);
    
    res.json(recentTopics);
  } catch (error) {
    console.error("Recent forum error:", error);
    res.status(500).json({ error: "Failed to fetch recent forum activity" });
  }
});

// All users list
router.get("/dashboard/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username,
      isPro: users.isPro,
      isAdmin: users.isAdmin,
      subscriptionTier: users.subscriptionTier,
      aiConsultantTier: users.aiConsultantTier,
      cleanbiTier: users.cleanbiTier,
      role: users.role,
      companyName: users.companyName,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);
    
    res.json(allUsers);
  } catch (error) {
    console.error("Users list error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Recent blog posts
router.get("/dashboard/recent-blogs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentBlogs = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      status: blogPosts.status,
      category: blogPosts.category,
      type: blogPosts.type,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(15);
    
    res.json(recentBlogs);
  } catch (error) {
    console.error("Recent blogs error:", error);
    res.status(500).json({ error: "Failed to fetch recent blogs" });
  }
});

// CLEANBI usage stats
router.get("/dashboard/cleanbi-usage", requireAdmin, async (req: Request, res: Response) => {
  try {
    const usage = await db.select()
      .from(cleanbiUsage)
      .orderBy(desc(cleanbiUsage.createdAt))
      .limit(50);
    
    res.json(usage);
  } catch (error) {
    console.error("CLEANBI usage error:", error);
    res.json([]);
  }
});

// Tenant list
router.get("/dashboard/tenants", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allTenants = await db.select()
      .from(tenants)
      .orderBy(desc(tenants.createdAt));
    
    res.json(allTenants);
  } catch (error) {
    console.error("Tenants error:", error);
    res.json([]);
  }
});

export default router;
