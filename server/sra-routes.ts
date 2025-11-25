import { Router, Request, Response } from "express";
import { z } from "zod";
import { IStorage } from "./storage";
import {
  insertMedicationSchema,
  insertMedicationLogSchema,
  insertAppointmentSchema,
  insertExerciseSchema,
  insertExerciseLogSchema,
  insertDailyCheckinSchema,
  insertRecoveryGoalSchema,
  insertProgressMilestoneSchema,
  insertAiCompanionSettingsSchema,
  insertAiCompanionChatSchema,
  insertGhostwritingProjectSchema,
  insertGhostwritingChapterSchema,
  insertVoiceProfileSchema,
  insertContentPipelineSchema,
  insertPipelineRunSchema,
  insertIndexingEventSchema,
  insertMarketplaceListingSchema,
  insertForumCategorySchema,
  insertForumTopicSchema,
  insertForumReplySchema,
  insertForumVoteSchema,
} from "@shared/schema";
import { db } from "./db";
import { 
  medications, 
  medicationLogs, 
  appointments, 
  exercises, 
  exerciseLogs,
  dailyCheckins,
  recoveryGoals,
  progressMilestones,
  aiCompanionSettings,
  aiCompanionChats,
  ghostwritingProjects,
  ghostwritingChapters,
  voiceProfiles,
  contentPipelines,
  pipelineRuns,
  indexingEvents,
  marketplaceListings,
  forumCategories,
  forumTopics,
  forumReplies,
  forumVotes,
} from "@shared/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: { claims?: { sub?: string }; sub?: string };
}

function getUserId(req: AuthenticatedRequest): string | null {
  return req.user?.claims?.sub || req.user?.sub || null;
}

export function createSraRoutes(storage: IStorage): Router {
  const router = Router();

  // ==================== MEDICATIONS API ====================

  router.get("/companion/medications", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(medications)
        .where(eq(medications.userId, userId))
        .orderBy(desc(medications.createdAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching medications:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/companion/medications", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertMedicationSchema.parse({ ...req.body, userId });
      const [medication] = await db.insert(medications).values(validatedData).returning();
      res.status(201).json(medication);
    } catch (error: any) {
      console.error("Error creating medication:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/companion/medications/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(medications)
        .set(req.body)
        .where(and(eq(medications.id, id), eq(medications.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Medication not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating medication:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/companion/medications/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      await db.delete(medications)
        .where(and(eq(medications.id, id), eq(medications.userId, userId)));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting medication:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Medication Logs
  router.post("/companion/medications/:id/log", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const validatedData = insertMedicationLogSchema.parse({
        ...req.body,
        medicationId: id,
        userId,
      });
      const [log] = await db.insert(medicationLogs).values(validatedData).returning();
      res.status(201).json(log);
    } catch (error: any) {
      console.error("Error logging medication:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/companion/medications/:id/logs", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const logs = await db.select().from(medicationLogs)
        .where(and(eq(medicationLogs.medicationId, id), eq(medicationLogs.userId, userId)))
        .orderBy(desc(medicationLogs.scheduledTime));
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching medication logs:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== APPOINTMENTS API ====================

  router.get("/companion/appointments", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(appointments)
        .where(eq(appointments.userId, userId))
        .orderBy(appointments.appointmentDate);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/companion/appointments", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertAppointmentSchema.parse({ ...req.body, userId });
      const [appointment] = await db.insert(appointments).values(validatedData).returning();
      res.status(201).json(appointment);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/companion/appointments/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(appointments)
        .set(req.body)
        .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Appointment not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/companion/appointments/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      await db.delete(appointments)
        .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== EXERCISES API ====================

  router.get("/companion/exercises", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(exercises)
        .where(eq(exercises.userId, userId))
        .orderBy(desc(exercises.createdAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/companion/exercises", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertExerciseSchema.parse({ ...req.body, userId });
      const [exercise] = await db.insert(exercises).values(validatedData).returning();
      res.status(201).json(exercise);
    } catch (error: any) {
      console.error("Error creating exercise:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/companion/exercises/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(exercises)
        .set(req.body)
        .where(and(eq(exercises.id, id), eq(exercises.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Exercise not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating exercise:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/companion/exercises/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      await db.delete(exercises)
        .where(and(eq(exercises.id, id), eq(exercises.userId, userId)));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting exercise:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Exercise Logs
  router.post("/companion/exercises/:id/log", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const validatedData = insertExerciseLogSchema.parse({
        ...req.body,
        exerciseId: id,
        userId,
      });
      const [log] = await db.insert(exerciseLogs).values(validatedData).returning();
      res.status(201).json(log);
    } catch (error: any) {
      console.error("Error logging exercise:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/companion/exercises/:id/logs", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const logs = await db.select().from(exerciseLogs)
        .where(and(eq(exerciseLogs.exerciseId, id), eq(exerciseLogs.userId, userId)))
        .orderBy(desc(exerciseLogs.completedAt));
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching exercise logs:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== DAILY CHECK-INS API ====================

  router.get("/companion/checkins", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const limit = parseInt(req.query.limit as string) || 30;
      const result = await db.select().from(dailyCheckins)
        .where(eq(dailyCheckins.userId, userId))
        .orderBy(desc(dailyCheckins.checkinDate))
        .limit(limit);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/companion/checkins/today", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = await db.select().from(dailyCheckins)
        .where(and(
          eq(dailyCheckins.userId, userId),
          gte(dailyCheckins.checkinDate, today)
        ))
        .limit(1);
      
      res.json(result[0] || null);
    } catch (error: any) {
      console.error("Error fetching today's check-in:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/companion/checkins", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertDailyCheckinSchema.parse({ ...req.body, userId });
      const [checkin] = await db.insert(dailyCheckins).values(validatedData).returning();
      res.status(201).json(checkin);
    } catch (error: any) {
      console.error("Error creating check-in:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/companion/checkins/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(dailyCheckins)
        .set(req.body)
        .where(and(eq(dailyCheckins.id, id), eq(dailyCheckins.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Check-in not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating check-in:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== RECOVERY GOALS API ====================

  router.get("/companion/goals", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(recoveryGoals)
        .where(eq(recoveryGoals.userId, userId))
        .orderBy(desc(recoveryGoals.createdAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/companion/goals", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertRecoveryGoalSchema.parse({ ...req.body, userId });
      const [goal] = await db.insert(recoveryGoals).values(validatedData).returning();
      res.status(201).json(goal);
    } catch (error: any) {
      console.error("Error creating goal:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/companion/goals/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(recoveryGoals)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(recoveryGoals.id, id), eq(recoveryGoals.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Goal not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating goal:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/companion/goals/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      await db.delete(recoveryGoals)
        .where(and(eq(recoveryGoals.id, id), eq(recoveryGoals.userId, userId)));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PROGRESS MILESTONES API ====================

  router.get("/companion/milestones", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(progressMilestones)
        .where(eq(progressMilestones.userId, userId))
        .orderBy(desc(progressMilestones.achievedAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/companion/milestones", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertProgressMilestoneSchema.parse({ ...req.body, userId });
      const [milestone] = await db.insert(progressMilestones).values(validatedData).returning();
      res.status(201).json(milestone);
    } catch (error: any) {
      console.error("Error creating milestone:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== AI COMPANION SETTINGS API ====================

  router.get("/companion/settings", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(aiCompanionSettings)
        .where(eq(aiCompanionSettings.userId, userId))
        .limit(1);
      res.json(result[0] || null);
    } catch (error: any) {
      console.error("Error fetching companion settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.put("/companion/settings", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const existing = await db.select().from(aiCompanionSettings)
        .where(eq(aiCompanionSettings.userId, userId))
        .limit(1);
      
      if (existing[0]) {
        const [updated] = await db.update(aiCompanionSettings)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(aiCompanionSettings.userId, userId))
          .returning();
        res.json(updated);
      } else {
        const validatedData = insertAiCompanionSettingsSchema.parse({ ...req.body, userId });
        const [created] = await db.insert(aiCompanionSettings).values(validatedData).returning();
        res.status(201).json(created);
      }
    } catch (error: any) {
      console.error("Error updating companion settings:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== AI COMPANION CHAT API ====================

  router.get("/companion/chats", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await db.select().from(aiCompanionChats)
        .where(eq(aiCompanionChats.userId, userId))
        .orderBy(desc(aiCompanionChats.createdAt))
        .limit(limit);
      res.json(result.reverse());
    } catch (error: any) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/companion/chats", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { message, topic } = req.body;
      
      const sessionId = req.body.sessionId || `session-${Date.now()}`;
      
      const [userChat] = await db.insert(aiCompanionChats).values({
        userId,
        sessionId,
        role: "user",
        content: message,
        topic: topic || "general",
      }).returning();
      
      const aiResponse = await generateCompanionResponse(message, userId);
      
      const [assistantChat] = await db.insert(aiCompanionChats).values({
        userId,
        sessionId,
        role: "assistant",
        content: aiResponse,
        topic: topic || "general",
      }).returning();
      
      res.status(201).json({ userMessage: userChat, assistantMessage: assistantChat });
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GHOSTWRITING API ====================

  router.get("/factory/projects", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(ghostwritingProjects)
        .where(eq(ghostwritingProjects.userId, userId))
        .orderBy(desc(ghostwritingProjects.createdAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/factory/projects", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertGhostwritingProjectSchema.parse({ ...req.body, userId });
      const [project] = await db.insert(ghostwritingProjects).values(validatedData).returning();
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/factory/projects/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const result = await db.select().from(ghostwritingProjects)
        .where(and(eq(ghostwritingProjects.id, id), eq(ghostwritingProjects.userId, userId)))
        .limit(1);
      
      if (!result[0]) return res.status(404).json({ error: "Project not found" });
      res.json(result[0]);
    } catch (error: any) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.patch("/factory/projects/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(ghostwritingProjects)
        .set(req.body)
        .where(and(eq(ghostwritingProjects.id, id), eq(ghostwritingProjects.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Project not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/factory/projects/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      await db.delete(ghostwritingProjects)
        .where(and(eq(ghostwritingProjects.id, id), eq(ghostwritingProjects.userId, userId)));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Project Chapters
  router.get("/factory/projects/:id/chapters", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const result = await db.select().from(ghostwritingChapters)
        .where(eq(ghostwritingChapters.projectId, id))
        .orderBy(ghostwritingChapters.chapterNumber);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/factory/projects/:id/chapters", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const validatedData = insertGhostwritingChapterSchema.parse({ ...req.body, projectId: id });
      const [chapter] = await db.insert(ghostwritingChapters).values(validatedData).returning();
      res.status(201).json(chapter);
    } catch (error: any) {
      console.error("Error creating chapter:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/factory/chapters/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(ghostwritingChapters)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(ghostwritingChapters.id, id))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Chapter not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating chapter:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== VOICE PROFILES API ====================

  router.get("/factory/voice-profiles", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(voiceProfiles)
        .where(eq(voiceProfiles.userId, userId))
        .orderBy(desc(voiceProfiles.createdAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching voice profiles:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/factory/voice-profiles", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertVoiceProfileSchema.parse({ ...req.body, userId });
      const [profile] = await db.insert(voiceProfiles).values(validatedData).returning();
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("Error creating voice profile:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/factory/voice-profiles/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(voiceProfiles)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(voiceProfiles.id, id), eq(voiceProfiles.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Voice profile not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating voice profile:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/factory/voice-profiles/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      await db.delete(voiceProfiles)
        .where(and(eq(voiceProfiles.id, id), eq(voiceProfiles.userId, userId)));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting voice profile:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CONTENT PIPELINES API ====================

  router.get("/factory/pipelines", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = await db.select().from(contentPipelines)
        .where(eq(contentPipelines.userId, userId))
        .orderBy(desc(contentPipelines.createdAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching pipelines:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/factory/pipelines", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertContentPipelineSchema.parse({ ...req.body, userId });
      const [pipeline] = await db.insert(contentPipelines).values(validatedData).returning();
      res.status(201).json(pipeline);
    } catch (error: any) {
      console.error("Error creating pipeline:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/factory/pipelines/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(contentPipelines)
        .set(req.body)
        .where(and(eq(contentPipelines.id, id), eq(contentPipelines.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Pipeline not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating pipeline:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Pipeline Runs
  router.get("/factory/pipelines/:id/runs", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const result = await db.select().from(pipelineRuns)
        .where(eq(pipelineRuns.pipelineId, id))
        .orderBy(desc(pipelineRuns.createdAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching pipeline runs:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/factory/pipelines/:id/run", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const validatedData = insertPipelineRunSchema.parse({
        ...req.body,
        pipelineId: id,
        userId,
        status: "queued",
      });
      const [run] = await db.insert(pipelineRuns).values(validatedData).returning();
      res.status(201).json(run);
    } catch (error: any) {
      console.error("Error starting pipeline run:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/factory/runs/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(pipelineRuns)
        .set(req.body)
        .where(eq(pipelineRuns.id, id))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Run not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating pipeline run:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== INDEXING EVENTS API ====================

  router.get("/factory/indexing", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      const result = await db.select().from(indexingEvents)
        .where(userId ? eq(indexingEvents.userId, userId) : sql`1=1`)
        .orderBy(desc(indexingEvents.createdAt))
        .limit(100);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching indexing events:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/factory/indexing", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertIndexingEventSchema.parse({ ...req.body, userId });
      const [event] = await db.insert(indexingEvents).values(validatedData).returning();
      res.status(201).json(event);
    } catch (error: any) {
      console.error("Error creating indexing event:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== MARKETPLACE API ====================

  router.get("/marketplace/listings", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { category, status } = req.query;
      let query = db.select().from(marketplaceListings);
      
      if (status) {
        query = query.where(eq(marketplaceListings.status, status as string));
      }
      if (category) {
        query = query.where(eq(marketplaceListings.category, category as string));
      }
      
      const result = await query.orderBy(desc(marketplaceListings.createdAt));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching marketplace listings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/marketplace/listings/:slug", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { slug } = req.params;
      const result = await db.select().from(marketplaceListings)
        .where(eq(marketplaceListings.slug, slug))
        .limit(1);
      
      if (!result[0]) return res.status(404).json({ error: "Listing not found" });
      res.json(result[0]);
    } catch (error: any) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/marketplace/listings", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertMarketplaceListingSchema.parse({ ...req.body, userId });
      const [listing] = await db.insert(marketplaceListings).values(validatedData).returning();
      res.status(201).json(listing);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.patch("/marketplace/listings/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const [updated] = await db.update(marketplaceListings)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(marketplaceListings.id, id), eq(marketplaceListings.userId, userId)))
        .returning();
      
      if (!updated) return res.status(404).json({ error: "Listing not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating listing:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/marketplace/listings/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      await db.delete(marketplaceListings)
        .where(and(eq(marketplaceListings.id, id), eq(marketplaceListings.userId, userId)));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== FORUM API ====================

  router.get("/forum/categories", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await db.select().from(forumCategories)
        .orderBy(forumCategories.order);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/forum/topics", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { categoryId } = req.query;
      let query = db.select().from(forumTopics);
      
      if (categoryId) {
        query = query.where(eq(forumTopics.categoryId, categoryId as string));
      }
      
      const result = await query.orderBy(desc(forumTopics.createdAt)).limit(50);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching forum topics:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/forum/topics/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const topic = await db.select().from(forumTopics)
        .where(eq(forumTopics.id, id))
        .limit(1);
      
      if (!topic[0]) return res.status(404).json({ error: "Topic not found" });
      
      await db.update(forumTopics)
        .set({ views: sql`views + 1` })
        .where(eq(forumTopics.id, id));
      
      const replies = await db.select().from(forumReplies)
        .where(eq(forumReplies.topicId, id))
        .orderBy(forumReplies.createdAt);
      
      res.json({ topic: topic[0], replies });
    } catch (error: any) {
      console.error("Error fetching topic:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/forum/topics", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const validatedData = insertForumTopicSchema.parse({ ...req.body, userId });
      const [topic] = await db.insert(forumTopics).values(validatedData).returning();
      res.status(201).json(topic);
    } catch (error: any) {
      console.error("Error creating topic:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/forum/topics/:id/replies", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const validatedData = insertForumReplySchema.parse({
        ...req.body,
        topicId: id,
        userId,
      });
      const [reply] = await db.insert(forumReplies).values(validatedData).returning();
      
      await db.update(forumTopics)
        .set({ 
          replyCount: sql`reply_count + 1`,
          lastActivityAt: new Date(),
        })
        .where(eq(forumTopics.id, id));
      
      res.status(201).json(reply);
    } catch (error: any) {
      console.error("Error creating reply:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/forum/vote", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { entityType, entityId, voteType } = req.body;
      
      const existing = await db.select().from(forumVotes)
        .where(and(
          eq(forumVotes.userId, userId),
          eq(forumVotes.entityType, entityType),
          eq(forumVotes.entityId, entityId)
        ))
        .limit(1);
      
      if (existing[0]) {
        if (existing[0].voteType === voteType) {
          await db.delete(forumVotes).where(eq(forumVotes.id, existing[0].id));
          res.json({ action: "removed" });
        } else {
          const [updated] = await db.update(forumVotes)
            .set({ voteType })
            .where(eq(forumVotes.id, existing[0].id))
            .returning();
          res.json({ action: "changed", vote: updated });
        }
      } else {
        const validatedData = insertForumVoteSchema.parse({
          userId,
          entityType,
          entityId,
          voteType,
        });
        const [vote] = await db.insert(forumVotes).values(validatedData).returning();
        res.status(201).json({ action: "created", vote });
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}

async function generateCompanionResponse(message: string, userId: string): Promise<string> {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const systemPrompt = `You are the AI Recovery Companion for Stroke Recovery Academy. You embody the wisdom of Nicholas "Stroked Out Sasquatch" Kremers, a stroke survivor who achieved 90% recovery.

Your core philosophy:
- "The grind is the gospel" - consistency beats perfection
- "A body in motion stays in motion" - any action counts
- "There's no wrong way to recover" - just do something every day
- Be encouraging but real - acknowledge struggles while motivating action

Respond with warmth, empathy, and practical motivation. Keep responses concise but impactful. End with an actionable suggestion when appropriate.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `User message: ${message}\n\nRespond as the AI Recovery Companion:` }
    ]);
    
    return result.response.text();
  } catch (error) {
    console.error("Error generating companion response:", error);
    return "I'm here with you, warrior. Sometimes technology hiccups, but what matters is that you showed up. What's one thing you can do right now for your recovery?";
  }
}
