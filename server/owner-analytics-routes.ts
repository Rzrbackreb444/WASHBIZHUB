import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { 
  users, listings, forumTopics, forumReplies, courses, enrollments,
  vendors, blogPosts, cleanbiUsage, cleanbiReports,
  newsletterSubscribers, emailSubscribers, posTransactions
} from "@shared/schema";
import { eq, sql, desc, count, sum, gte, and, lt, isNotNull } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

const router = Router();

const OWNER_EMAIL = "rzrbackreb444@gmail.com";

async function requireOwner(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Invalid session" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    const isOwner = user.isAdmin === true || user.email === OWNER_EMAIL;
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied - Owner only" });
    }
    
    next();
  } catch (error) {
    console.error("Owner auth error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
}

router.get("/stats", isAuthenticated, requireOwner, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousMonth = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [newUsersThisMonth] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));
    const [newUsersPrevMonth] = await db.select({ count: count() })
      .from(users)
      .where(and(gte(users.createdAt, previousMonth), lt(users.createdAt, thirtyDaysAgo)));
    const [activeUsers] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.updatedAt, sevenDaysAgo));
    const [proUsersResult] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.isPro, true));

    let cleanbiAnalyses = 0;
    let cleanbiThisMonth = 0;
    try {
      const [cleanbiResult] = await db.select({ count: count() }).from(cleanbiUsage);
      cleanbiAnalyses = cleanbiResult?.count || 0;
      const [cleanbiMonthResult] = await db.select({ count: count() })
        .from(cleanbiUsage)
        .where(gte(cleanbiUsage.createdAt, thirtyDaysAgo));
      cleanbiThisMonth = cleanbiMonthResult?.count || 0;
    } catch (e) {}

    let emailSubscriberCount = 0;
    try {
      const [emailSubResult] = await db.select({ count: count() }).from(emailSubscribers);
      emailSubscriberCount = emailSubResult?.count || 0;
    } catch (e) {}

    let newsletterCount = 0;
    try {
      const [newsletterResult] = await db.select({ count: count() }).from(newsletterSubscribers);
      newsletterCount = newsletterResult?.count || 0;
    } catch (e) {}

    const totalSubscribers = emailSubscriberCount + newsletterCount;

    const userTiers = await db.select({
      tier: users.subscriptionTier,
      count: count()
    }).from(users).groupBy(users.subscriptionTier);

    const tierBreakdown = {
      free: 0,
      accelerate: 0,
      scale: 0,
      summit: 0
    };
    userTiers.forEach(t => {
      const tier = t.tier?.toLowerCase() || 'free';
      if (tier in tierBreakdown) {
        tierBreakdown[tier as keyof typeof tierBreakdown] = Number(t.count) || 0;
      } else {
        tierBreakdown.free += Number(t.count) || 0;
      }
    });

    const userGrowthPercent = newUsersPrevMonth?.count 
      ? Math.round(((newUsersThisMonth?.count || 0) - (newUsersPrevMonth?.count || 0)) / (newUsersPrevMonth?.count || 1) * 100)
      : 0;

    res.json({
      totalUsers: totalUsersResult?.count || 0,
      newUsersThisMonth: newUsersThisMonth?.count || 0,
      activeUsers: activeUsers?.count || 0,
      proSubscribers: proUsersResult?.count || 0,
      cleanbiAnalyses,
      cleanbiThisMonth,
      emailSubscribers: totalSubscribers,
      userGrowthPercent,
      tierBreakdown,
      monthlyRevenue: 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Owner stats error:", error);
    res.status(500).json({ error: "Failed to fetch owner stats" });
  }
});

router.get("/users", isAuthenticated, requireOwner, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const tier = req.query.tier as string;

    let query = db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username,
      isPro: users.isPro,
      isAdmin: users.isAdmin,
      subscriptionTier: users.subscriptionTier,
      cleanbiTier: users.cleanbiTier,
      companyName: users.companyName,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);

    if (tier && tier !== 'all') {
      query = query.where(eq(users.subscriptionTier, tier)) as any;
    }

    const recentUsers = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db.select({ count: count() }).from(users);

    res.json({
      users: recentUsers,
      total: totalResult?.count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error("Owner users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/revenue", isAuthenticated, requireOwner, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalRevenue = 0;
    let recentTransactions: any[] = [];
    let revenueByProduct: Record<string, number> = {
      cleanbiReports: 0,
      subscriptions: 0,
      other: 0
    };

    try {
      const [reportsRevenue] = await db.select({ 
        total: sum(cleanbiReports.price) 
      }).from(cleanbiReports)
        .where(and(
          isNotNull(cleanbiReports.stripePaymentId),
          eq(cleanbiReports.status, 'completed')
        ));
      revenueByProduct.cleanbiReports = Number(reportsRevenue?.total || 0) / 100;
    } catch (e) {}

    try {
      const transactions = await db.select({
        id: posTransactions.id,
        amount: posTransactions.total,
        type: posTransactions.paymentMethod,
        createdAt: posTransactions.createdAt
      }).from(posTransactions)
        .where(gte(posTransactions.createdAt, thirtyDaysAgo))
        .orderBy(desc(posTransactions.createdAt))
        .limit(10);
      recentTransactions = transactions;
    } catch (e) {}

    totalRevenue = Object.values(revenueByProduct).reduce((a, b) => a + b, 0);

    const [proCount] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.isPro, true));
    const mrr = (proCount?.count || 0) * 47;

    res.json({
      totalRevenue,
      monthlyRevenue: mrr,
      mrr,
      revenueByProduct,
      recentTransactions,
      stripeConnected: !!process.env.STRIPE_SECRET_KEY,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Owner revenue error:", error);
    res.status(500).json({ error: "Failed to fetch revenue" });
  }
});

router.get("/cleanbi", isAuthenticated, requireOwner, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalAnalyses = 0;
    let analysesThisMonth = 0;
    let analysesByType: Record<string, number> = { basic: 0, detailed: 0, api: 0 };
    let popularLocations: { address: string; count: number }[] = [];
    let dailyUsage: { date: string; count: number }[] = [];

    try {
      const [totalResult] = await db.select({ count: count() }).from(cleanbiUsage);
      totalAnalyses = totalResult?.count || 0;

      const [monthResult] = await db.select({ count: count() })
        .from(cleanbiUsage)
        .where(gte(cleanbiUsage.createdAt, thirtyDaysAgo));
      analysesThisMonth = monthResult?.count || 0;

      const typeBreakdown = await db.select({
        type: cleanbiUsage.reportType,
        count: count()
      }).from(cleanbiUsage).groupBy(cleanbiUsage.reportType);
      
      typeBreakdown.forEach(t => {
        const type = t.type?.toLowerCase() || 'basic';
        if (type in analysesByType) {
          analysesByType[type as keyof typeof analysesByType] = Number(t.count) || 0;
        }
      });

      const locations = await db.select({
        address: cleanbiUsage.addressScored,
        count: count()
      }).from(cleanbiUsage)
        .where(isNotNull(cleanbiUsage.addressScored))
        .groupBy(cleanbiUsage.addressScored)
        .orderBy(desc(count()))
        .limit(10);
      
      popularLocations = locations
        .filter(l => l.address)
        .map(l => ({ address: l.address!, count: Number(l.count) }));

    } catch (e) {
      console.error("CLEANBI stats error:", e);
    }

    res.json({
      totalAnalyses,
      analysesThisMonth,
      analysesByType,
      popularLocations,
      dailyUsage,
      paidVsFree: {
        paid: analysesByType.detailed + analysesByType.api,
        free: analysesByType.basic
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Owner CLEANBI error:", error);
    res.status(500).json({ error: "Failed to fetch CLEANBI stats" });
  }
});

router.get("/engagement", isAuthenticated, requireOwner, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalTopics] = await db.select({ count: count() }).from(forumTopics);
    const [totalReplies] = await db.select({ count: count() }).from(forumReplies);
    const [topicsThisWeek] = await db.select({ count: count() })
      .from(forumTopics)
      .where(gte(forumTopics.createdAt, sevenDaysAgo));
    const [repliesThisWeek] = await db.select({ count: count() })
      .from(forumReplies)
      .where(gte(forumReplies.createdAt, sevenDaysAgo));

    let emailGrowth = 0;
    let totalEmailSubs = 0;
    try {
      const [totalSubs] = await db.select({ count: count() }).from(emailSubscribers);
      totalEmailSubs = totalSubs?.count || 0;
      
      const [newSubs] = await db.select({ count: count() })
        .from(emailSubscribers)
        .where(gte(emailSubscribers.subscribedAt, thirtyDaysAgo));
      emailGrowth = newSubs?.count || 0;
    } catch (e) {}

    let newsletterGrowth = 0;
    let totalNewsletter = 0;
    try {
      const [totalNl] = await db.select({ count: count() }).from(newsletterSubscribers);
      totalNewsletter = totalNl?.count || 0;
      
      const [newNl] = await db.select({ count: count() })
        .from(newsletterSubscribers)
        .where(gte(newsletterSubscribers.subscribedAt, thirtyDaysAgo));
      newsletterGrowth = newNl?.count || 0;
    } catch (e) {}

    const [totalBlogs] = await db.select({ count: count() }).from(blogPosts);
    const [publishedBlogs] = await db.select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.published, true));

    const [totalCourses] = await db.select({ count: count() }).from(courses);
    const [totalEnrollments] = await db.select({ count: count() }).from(enrollments);

    res.json({
      forum: {
        totalTopics: totalTopics?.count || 0,
        totalReplies: totalReplies?.count || 0,
        topicsThisWeek: topicsThisWeek?.count || 0,
        repliesThisWeek: repliesThisWeek?.count || 0,
        activeUsers: 0
      },
      email: {
        totalSubscribers: totalEmailSubs + totalNewsletter,
        emailSubscribers: totalEmailSubs,
        newsletterSubscribers: totalNewsletter,
        growthThisMonth: emailGrowth + newsletterGrowth
      },
      content: {
        totalBlogs: totalBlogs?.count || 0,
        publishedBlogs: publishedBlogs?.count || 0,
        totalCourses: totalCourses?.count || 0,
        totalEnrollments: totalEnrollments?.count || 0
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Owner engagement error:", error);
    res.status(500).json({ error: "Failed to fetch engagement stats" });
  }
});

router.get("/user-growth", isAuthenticated, requireOwner, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const dailyGrowth: { date: string; count: number; cumulative: number }[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const [result] = await db.select({ count: count() })
        .from(users)
        .where(and(
          gte(users.createdAt, date),
          lt(users.createdAt, nextDate)
        ));
      
      const [cumulative] = await db.select({ count: count() })
        .from(users)
        .where(lt(users.createdAt, nextDate));
      
      dailyGrowth.push({
        date: date.toISOString().split('T')[0],
        count: result?.count || 0,
        cumulative: cumulative?.count || 0
      });
    }

    res.json({
      dailyGrowth,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("User growth error:", error);
    res.status(500).json({ error: "Failed to fetch user growth" });
  }
});

export default router;
