import type { Express, Request, Response } from "express";
import { db } from "./db";
import { 
  cleanbiUsage, cleanbiReports, users, userJourney,
  userAchievements, achievements, userActivityLog
} from "@shared/schema";
import { eq, desc, and, sql, gte, count } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";
import crypto from "crypto";

export function registerEngagementRoutes(app: Express) {

  app.get("/api/cleanbi/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const usageRecords = await db
        .select()
        .from(cleanbiUsage)
        .where(eq(cleanbiUsage.userId, userId))
        .orderBy(desc(cleanbiUsage.createdAt))
        .limit(100);

      const journey = await db
        .select()
        .from(userJourney)
        .where(eq(userJourney.userId, userId))
        .limit(1);

      const scores = usageRecords.map(record => {
        const metadata = record.metadata as any || {};
        return {
          id: record.id,
          address: record.addressScored || "Unknown Address",
          businessName: metadata.businessName,
          score: metadata.score || 0,
          grade: metadata.grade || "N/A",
          confidence: metadata.confidence || 0,
          industry: metadata.industry,
          breakdown: metadata.breakdown,
          createdAt: record.createdAt,
          isFavorite: metadata.isFavorite || false,
        };
      });

      const totalAnalyses = await db
        .select({ count: count() })
        .from(cleanbiUsage)
        .where(eq(cleanbiUsage.userId, userId));

      res.json({
        scores,
        total: scores.length,
        totalAnalyses: totalAnalyses[0]?.count || scores.length,
        streak: journey[0]?.streak || 0,
      });
    } catch (error) {
      console.error("Error fetching score history:", error);
      res.status(500).json({ error: "Failed to fetch score history" });
    }
  });

  app.delete("/api/cleanbi/history/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      await db
        .delete(cleanbiUsage)
        .where(and(eq(cleanbiUsage.id, id), eq(cleanbiUsage.userId, userId)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting score:", error);
      res.status(500).json({ error: "Failed to delete score" });
    }
  });

  app.get("/api/referrals/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      let referralCode = (user[0] as any).referralCode;
      if (!referralCode) {
        referralCode = `WBH${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        await db
          .update(users)
          .set({ referralCode } as any)
          .where(eq(users.id, userId));
      }

      const referralLink = `https://washbizhub.com?ref=${referralCode}`;

      const referredUsers = await db
        .select()
        .from(users)
        .where(eq((users as any).referredBy, referralCode))
        .orderBy(desc(users.createdAt))
        .limit(20);

      const convertedCount = referredUsers.filter(u => u.isPro || u.subscriptionTier !== 'free').length;
      const totalEarnings = convertedCount * 8.70;

      res.json({
        referralCode,
        referralLink,
        totalReferrals: referredUsers.length,
        pendingReferrals: referredUsers.length - convertedCount,
        convertedReferrals: convertedCount,
        totalEarnings,
        pendingEarnings: 0,
        tier: referredUsers.length >= 50 ? "Elite" : 
              referredUsers.length >= 15 ? "Ambassador" : 
              referredUsers.length >= 5 ? "Partner" : "Starter",
        nextTierAt: referredUsers.length >= 50 ? 100 : 
                    referredUsers.length >= 15 ? 50 : 
                    referredUsers.length >= 5 ? 15 : 5,
        recentReferrals: referredUsers.slice(0, 10).map(u => ({
          id: u.id,
          email: u.email ? u.email.replace(/(.{2}).*(@.*)/, '$1***$2') : 'Anonymous',
          status: u.isPro || u.subscriptionTier !== 'free' ? 'converted' : 'pending',
          createdAt: u.createdAt,
          earnings: u.isPro || u.subscriptionTier !== 'free' ? 8.70 : undefined,
        })),
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ error: "Failed to fetch referral stats" });
    }
  });

  app.post("/api/streak/check-in", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let journey = await db
        .select()
        .from(userJourney)
        .where(eq(userJourney.userId, userId))
        .limit(1);

      if (!journey[0]) {
        const [newJourney] = await db
          .insert(userJourney)
          .values({
            userId,
            stage: "exploring",
            stageProgress: 0,
            totalPoints: 10,
            streak: 1,
            lastActiveDate: new Date(),
            completedMilestones: [],
            savedListings: 0,
            savedCalculations: 0,
            savedReports: 0,
          })
          .returning();

        return res.json({
          streak: 1,
          points: 10,
          isNewStreak: true,
          message: "Welcome! You've started your streak!",
        });
      }

      const lastActive = journey[0].lastActiveDate;
      let newStreak = journey[0].streak;
      let pointsEarned = 0;
      let message = "";

      if (lastActive) {
        const lastActiveDate = new Date(lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);

        if (lastActiveDate.getTime() === today.getTime()) {
          return res.json({
            streak: newStreak,
            points: 0,
            isNewStreak: false,
            message: "You've already checked in today!",
          });
        } else if (lastActiveDate.getTime() === yesterday.getTime()) {
          newStreak += 1;
          pointsEarned = 10 + (newStreak >= 7 ? 15 : newStreak >= 3 ? 5 : 0);
          message = newStreak >= 7 
            ? `Amazing! ${newStreak} day streak! Bonus +15 points!`
            : newStreak >= 3 
            ? `${newStreak} day streak! Bonus +5 points!`
            : `${newStreak} day streak! Keep it going!`;
        } else {
          newStreak = 1;
          pointsEarned = 10;
          message = "Streak reset. Start fresh today!";
        }
      } else {
        newStreak = 1;
        pointsEarned = 10;
        message = "First check-in! Welcome!";
      }

      await db
        .update(userJourney)
        .set({
          streak: newStreak,
          lastActiveDate: new Date(),
          totalPoints: sql`${userJourney.totalPoints} + ${pointsEarned}`,
        })
        .where(eq(userJourney.userId, userId));

      await db.insert(userActivityLog).values({
        userId,
        activityType: "streak_checkin",
        activityTarget: "/",
        metadata: { streak: newStreak, pointsEarned },
      });

      res.json({
        streak: newStreak,
        points: pointsEarned,
        isNewStreak: newStreak === 1,
        message,
      });
    } catch (error) {
      console.error("Error checking in streak:", error);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  app.get("/api/streak/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const journey = await db
        .select()
        .from(userJourney)
        .where(eq(userJourney.userId, userId))
        .limit(1);

      if (!journey[0]) {
        return res.json({
          streak: 0,
          totalPoints: 0,
          canCheckIn: true,
          lastCheckIn: null,
          stage: "exploring",
          stageProgress: 0,
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActive = journey[0].lastActiveDate;
      let canCheckIn = true;
      
      if (lastActive) {
        const lastActiveDate = new Date(lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);
        canCheckIn = lastActiveDate.getTime() < today.getTime();
      }

      res.json({
        streak: journey[0].streak,
        totalPoints: journey[0].totalPoints,
        canCheckIn,
        lastCheckIn: journey[0].lastActiveDate,
        stage: journey[0].stage,
        stageProgress: journey[0].stageProgress,
        savedListings: journey[0].savedListings,
        savedCalculations: journey[0].savedCalculations,
        savedReports: journey[0].savedReports,
      });
    } catch (error) {
      console.error("Error fetching streak status:", error);
      res.status(500).json({ error: "Failed to fetch streak status" });
    }
  });

  app.get("/api/achievements", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const allAchievements = await db.select().from(achievements);
      const earned = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const earnedCodes = new Set(earned.map(e => e.achievementCode));

      const result = allAchievements.map(a => ({
        ...a,
        earned: earnedCodes.has(a.code),
        earnedAt: earned.find(e => e.achievementCode === a.code)?.earnedAt,
      }));

      res.json({
        achievements: result,
        totalEarned: earned.length,
        totalAvailable: allAchievements.length,
        totalPoints: earned.reduce((sum, e) => sum + (e.pointsAwarded || 0), 0),
      });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  console.log("✅ Engagement routes registered (history, referrals, streaks, achievements)");
}
