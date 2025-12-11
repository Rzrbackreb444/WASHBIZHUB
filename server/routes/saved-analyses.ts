import { Router } from "express";
import { db } from "../db";
import { savedAnalyses, insertSavedAnalysisSchema } from "@shared/schema";
import { eq, desc, and, ilike, gte, lte } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const parsed = insertSavedAnalysisSchema.safeParse({
      ...req.body,
      userId,
    });

    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.format() });
    }

    const [analysis] = await db
      .insert(savedAnalyses)
      .values(parsed.data)
      .returning();

    res.status(201).json(analysis);
  } catch (error) {
    console.error("Error saving analysis:", error);
    res.status(500).json({ error: "Failed to save analysis" });
  }
});

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { 
      page = "1", 
      limit = "20", 
      type, 
      search, 
      startDate, 
      endDate 
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(savedAnalyses.userId, userId)];

    if (type && typeof type === "string") {
      conditions.push(eq(savedAnalyses.analysisType, type));
    }

    if (search && typeof search === "string") {
      conditions.push(ilike(savedAnalyses.title, `%${search}%`));
    }

    if (startDate && typeof startDate === "string") {
      conditions.push(gte(savedAnalyses.createdAt, new Date(startDate)));
    }

    if (endDate && typeof endDate === "string") {
      conditions.push(lte(savedAnalyses.createdAt, new Date(endDate)));
    }

    const results = await db
      .select()
      .from(savedAnalyses)
      .where(and(...conditions))
      .orderBy(desc(savedAnalyses.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: db.$count(savedAnalyses, and(...conditions)) })
      .from(savedAnalyses)
      .limit(1);

    res.json({
      analyses: results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching analyses:", error);
    res.status(500).json({ error: "Failed to fetch analyses" });
  }
});

router.get("/types", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const types = await db
      .selectDistinct({ analysisType: savedAnalyses.analysisType })
      .from(savedAnalyses)
      .where(eq(savedAnalyses.userId, userId));

    res.json(types.map((t) => t.analysisType));
  } catch (error) {
    console.error("Error fetching analysis types:", error);
    res.status(500).json({ error: "Failed to fetch analysis types" });
  }
});

router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid analysis ID" });
    }

    const [analysis] = await db
      .select()
      .from(savedAnalyses)
      .where(and(eq(savedAnalyses.id, id), eq(savedAnalyses.userId, userId)));

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(analysis);
  } catch (error) {
    console.error("Error fetching analysis:", error);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});

router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid analysis ID" });
    }

    const updateSchema = z.object({
      title: z.string().min(1).max(255).optional(),
      notes: z.string().optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.format() });
    }

    const [existing] = await db
      .select()
      .from(savedAnalyses)
      .where(and(eq(savedAnalyses.id, id), eq(savedAnalyses.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    const [updated] = await db
      .update(savedAnalyses)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(savedAnalyses.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating analysis:", error);
    res.status(500).json({ error: "Failed to update analysis" });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid analysis ID" });
    }

    const [existing] = await db
      .select()
      .from(savedAnalyses)
      .where(and(eq(savedAnalyses.id, id), eq(savedAnalyses.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    await db
      .delete(savedAnalyses)
      .where(eq(savedAnalyses.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting analysis:", error);
    res.status(500).json({ error: "Failed to delete analysis" });
  }
});

export default router;
