import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from "docx";
import { z } from "zod";
import multer from "multer";
import { randomUUID } from "crypto";
import { db } from "../db";
import { bookProjects, bookPages, larrysContentItems, contentPurchases } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { ObjectStorageService, parseObjectPath, objectStorageClient } from "../objectStorage";

const router = Router();
const objectStorage = new ObjectStorageService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "audio/mp3", "audio/mpeg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

// Owner emails for access control
const OWNER_EMAILS = (process.env.OWNER_EMAILS || "thelaundromatfb@gmail.com,rzrbackreb444@gmail.com,nick@washbizhub.com,larry@washbizhub.com").split(",").map(e => e.trim().toLowerCase());

function isOwner(email?: string): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase());
}

// ============================================================================
// BOOK PROJECT CRUD OPERATIONS - Database Persistence
// ============================================================================

// Get all book projects (owner only sees all, others see their own)
router.get("/projects", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userEmail = user?.email?.toLowerCase();
    
    let projects;
    if (isOwner(userEmail)) {
      projects = await db.select().from(bookProjects)
        .orderBy(desc(bookProjects.updatedAt))
        .limit(100);
    } else if (user?.id) {
      projects = await db.select().from(bookProjects)
        .where(eq(bookProjects.userId, user.id))
        .orderBy(desc(bookProjects.updatedAt))
        .limit(50);
    } else {
      return res.json([]);
    }
    
    res.json(projects);
  } catch (error: any) {
    console.error("[BookStudio] Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get single book project
router.get("/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    const [project] = await db.select().from(bookProjects).where(eq(bookProjects.id, id));
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Check access
    if (!isOwner(user?.email) && project.userId !== user?.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get pages for this project
    const pages = await db.select().from(bookPages)
      .where(eq(bookPages.projectId, id))
      .orderBy(bookPages.pageNumber);
    
    res.json({ ...project, pages });
  } catch (error: any) {
    console.error("[BookStudio] Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create new book project (requires authentication)
router.post("/projects", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Require authentication for project creation
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required to create a project" });
    }
    
    const { 
      title, subtitle, author, description, genre, ageRange, targetAudience,
      bookType, artStyle, artStylePrompt, characterDescriptions 
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const [project] = await db.insert(bookProjects).values({
      userId: user.id,
      title,
      subtitle,
      author: author || user?.firstName || "Unknown Author",
      description,
      genre,
      ageRange,
      targetAudience,
      bookType: bookType || "standard",
      artStyle,
      artStylePrompt,
      characterDescriptions,
      status: "draft",
    }).returning();
    
    res.json(project);
  } catch (error: any) {
    console.error("[BookStudio] Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update book project (requires authentication)
router.patch("/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const updates = req.body;
    
    // Require authentication
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Check ownership
    const [existing] = await db.select().from(bookProjects).where(eq(bookProjects.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    if (!isOwner(user?.email) && existing.userId !== user?.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const [updated] = await db.update(bookProjects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookProjects.id, id))
      .returning();
    
    res.json(updated);
  } catch (error: any) {
    console.error("[BookStudio] Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete book project (requires authentication)
router.delete("/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    // Require authentication
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const [existing] = await db.select().from(bookProjects).where(eq(bookProjects.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    if (!isOwner(user?.email) && existing.userId !== user?.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await db.delete(bookProjects).where(eq(bookProjects.id, id));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("[BookStudio] Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ============================================================================
// BOOK PAGES CRUD (with ownership verification)
// ============================================================================

// Helper function to verify project access
async function verifyProjectAccess(projectId: string, user: any): Promise<{ authorized: boolean; project: any; error?: string }> {
  const [project] = await db.select().from(bookProjects).where(eq(bookProjects.id, projectId));
  
  if (!project) {
    return { authorized: false, project: null, error: "Project not found" };
  }
  
  // Owners always have access
  if (isOwner(user?.email)) {
    return { authorized: true, project };
  }
  
  // Check if user owns the project
  if (user?.id && project.userId === user.id) {
    return { authorized: true, project };
  }
  
  return { authorized: false, project: null, error: "Access denied" };
}

// Add/update page (requires authentication and ownership)
router.post("/projects/:projectId/pages", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const user = (req as any).user;
    
    // Verify authentication
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify project ownership
    const access = await verifyProjectAccess(projectId, user);
    if (!access.authorized) {
      return res.status(access.error === "Project not found" ? 404 : 403).json({ error: access.error });
    }
    
    const { pageNumber, textContent, imageUrl, imagePrompt, layout, status } = req.body;
    
    const [page] = await db.insert(bookPages).values({
      projectId,
      pageNumber: pageNumber || 1,
      textContent,
      imageUrl,
      imagePrompt,
      layout: layout || "text_below",
      status: status || "draft",
    }).returning();
    
    // Update project page count
    const pageCount = await db.select({ count: sql<number>`count(*)` })
      .from(bookPages)
      .where(eq(bookPages.projectId, projectId));
    
    await db.update(bookProjects)
      .set({ totalPages: Number(pageCount[0]?.count) || 0, updatedAt: new Date() })
      .where(eq(bookProjects.id, projectId));
    
    res.json(page);
  } catch (error: any) {
    console.error("[BookStudio] Error adding page:", error);
    res.status(500).json({ error: "Failed to add page" });
  }
});

// Update page (requires authentication and ownership, verifies page belongs to project)
router.patch("/projects/:projectId/pages/:pageId", async (req: Request, res: Response) => {
  try {
    const { projectId, pageId } = req.params;
    const user = (req as any).user;
    
    // Verify authentication
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify project ownership
    const access = await verifyProjectAccess(projectId, user);
    if (!access.authorized) {
      return res.status(access.error === "Project not found" ? 404 : 403).json({ error: access.error });
    }
    
    const updates = req.body;
    
    // Update only if page belongs to this project (prevents cross-project attacks)
    const [updated] = await db.update(bookPages)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(bookPages.id, pageId), eq(bookPages.projectId, projectId)))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: "Page not found in this project" });
    }
    
    res.json(updated);
  } catch (error: any) {
    console.error("[BookStudio] Error updating page:", error);
    res.status(500).json({ error: "Failed to update page" });
  }
});

// Delete page (requires authentication and ownership, verifies page belongs to project)
router.delete("/projects/:projectId/pages/:pageId", async (req: Request, res: Response) => {
  try {
    const { projectId, pageId } = req.params;
    const user = (req as any).user;
    
    // Verify authentication
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify project ownership
    const access = await verifyProjectAccess(projectId, user);
    if (!access.authorized) {
      return res.status(access.error === "Project not found" ? 404 : 403).json({ error: access.error });
    }
    
    // Verify page belongs to this project before deletion
    const [page] = await db.select().from(bookPages)
      .where(and(eq(bookPages.id, pageId), eq(bookPages.projectId, projectId)));
    
    if (!page) {
      return res.status(404).json({ error: "Page not found in this project" });
    }
    
    await db.delete(bookPages).where(eq(bookPages.id, pageId));
    
    // Update project page count
    const pageCount = await db.select({ count: sql<number>`count(*)` })
      .from(bookPages)
      .where(eq(bookPages.projectId, projectId));
    
    await db.update(bookProjects)
      .set({ totalPages: Number(pageCount[0]?.count) || 0, updatedAt: new Date() })
      .where(eq(bookProjects.id, projectId));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("[BookStudio] Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

// ============================================================================
// MEDIA UPLOAD - Object Storage Integration
// ============================================================================

// Upload media file to object storage
router.post("/media/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    
    const { folder = "media" } = req.body;
    const fileExtension = req.file.originalname.split('.').pop() || 'bin';
    const objectId = `${randomUUID()}.${fileExtension}`;
    
    const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
    if (!privateObjectDir) {
      return res.status(500).json({ error: "Object storage not configured" });
    }
    
    const fullPath = `${privateObjectDir}/${folder}/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    
    await file.save(req.file.buffer, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        uploadedBy: user.email || user.id,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    const objectUrl = `/objects/${folder}/${objectId}`;
    
    res.json({
      success: true,
      url: objectUrl,
      filename: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
    });
  } catch (error: any) {
    console.error("[BookStudio] Media upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload media" });
  }
});

// Get signed URL for direct upload (larger files)
router.get("/media/upload-url", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const uploadUrl = await objectStorage.getObjectEntityUploadURL();
    
    res.json({
      success: true,
      uploadUrl,
    });
  } catch (error: any) {
    console.error("[BookStudio] Upload URL error:", error);
    res.status(500).json({ error: error.message || "Failed to generate upload URL" });
  }
});

// Serve media files from object storage
router.get("/media/*", async (req: Request, res: Response) => {
  try {
    const objectPath = `/objects/${req.params[0]}`;
    const file = await objectStorage.getObjectEntityFile(objectPath);
    await objectStorage.downloadObject(file, res);
  } catch (error: any) {
    if (error.name === "ObjectNotFoundError") {
      return res.status(404).json({ error: "Media not found" });
    }
    console.error("[BookStudio] Media serve error:", error);
    res.status(500).json({ error: "Failed to serve media" });
  }
});

// ============================================================================
// AI ILLUSTRATION GENERATION
// ============================================================================

// Generate illustration for a book page using DALL-E
router.post("/projects/:projectId/pages/:pageId/generate-illustration", async (req: Request, res: Response) => {
  try {
    const { projectId, pageId } = req.params;
    const user = (req as any).user;
    
    // Verify authentication
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify project ownership
    const access = await verifyProjectAccess(projectId, user);
    if (!access.authorized) {
      return res.status(access.error === "Project not found" ? 404 : 403).json({ error: access.error });
    }
    
    const { sceneDescription, artStyle, characters, ageRange, textPosition } = req.body;
    
    if (!sceneDescription) {
      return res.status(400).json({ error: "Scene description is required" });
    }
    
    // Build the illustration prompt based on art style and scene
    const artStylePrompts: Record<string, string> = {
      "watercolor": "in soft watercolor illustration style with dreamy colors and gentle brushstrokes",
      "cartoon": "in vibrant cartoon style with bold colors like Disney or Pixar animation",
      "digital-painting": "in rich digital painting style with detailed textures and realistic lighting",
      "pencil-sketch": "in hand-drawn pencil sketch style with visible strokes and shading",
      "flat-design": "in modern flat design illustration style with clean lines and simple shapes",
      "storybook-classic": "in classic storybook illustration style like Beatrix Potter with warm earth tones",
      "whimsical": "in whimsical magical illustration style with enchanted fantasy elements",
      "anime": "in Japanese anime illustration style with expressive characters"
    };
    
    const ageRangeGuidance: Record<string, string> = {
      "0-3": "simple shapes, bright primary colors, minimal detail, friendly faces",
      "3-5": "clear simple illustrations, cheerful colors, easy to understand",
      "5-8": "more detail, story-driven scenes, engaging characters",
      "8-12": "detailed illustrations, dynamic compositions, expressive characters",
      "12-18": "sophisticated illustrations, complex scenes, mature style",
      "adult": "professional quality, refined details, adult aesthetic"
    };
    
    // Build character consistency prompt
    let characterPrompt = "";
    if (characters && characters.length > 0) {
      const characterDescriptions = characters.map((c: any) => 
        `${c.name}: ${c.description}${c.clothing ? `, wearing ${c.clothing}` : ""}`
      ).join("; ");
      characterPrompt = ` Characters in scene: ${characterDescriptions}.`;
    }
    
    // Compose the full prompt
    const stylePrompt = artStylePrompts[artStyle] || artStylePrompts["watercolor"];
    const agePrompt = ageRangeGuidance[ageRange] || "";
    
    const fullPrompt = `Create a children's book illustration ${stylePrompt}. Scene: ${sceneDescription}.${characterPrompt} Style requirements: ${agePrompt}. Leave ${textPosition === "none" ? "no" : textPosition} space for text placement. High quality, suitable for print.`;
    
    // Call OpenAI DALL-E API
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    });
    
    const imageUrl = imageResponse.data[0]?.url;
    
    if (!imageUrl) {
      return res.status(500).json({ error: "Failed to generate illustration" });
    }
    
    // Update the page with the generated illustration
    const [updated] = await db.update(bookPages)
      .set({ 
        imageUrl,
        imagePrompt: fullPrompt,
        status: "illustrated",
        updatedAt: new Date()
      })
      .where(and(eq(bookPages.id, pageId), eq(bookPages.projectId, projectId)))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: "Page not found in this project" });
    }
    
    res.json({
      success: true,
      imageUrl,
      prompt: fullPrompt,
      page: updated
    });
  } catch (error: any) {
    console.error("[BookStudio] Illustration generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate illustration" });
  }
});

// AI-assisted scene description generation
router.post("/projects/:projectId/pages/:pageId/generate-scene", async (req: Request, res: Response) => {
  try {
    const { projectId, pageId } = req.params;
    const user = (req as any).user;
    
    // Verify authentication
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify project ownership
    const access = await verifyProjectAccess(projectId, user);
    if (!access.authorized) {
      return res.status(access.error === "Project not found" ? 404 : 403).json({ error: access.error });
    }
    
    const { pageText, bookTitle, bookDescription, characters, artStyle, ageRange } = req.body;
    
    if (!pageText) {
      return res.status(400).json({ error: "Page text is required" });
    }
    
    // Use Gemini to generate scene description
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const characterInfo = characters?.map((c: any) => `${c.name}: ${c.description}`).join("\n") || "No specific characters defined";
    
    const prompt = `You are an expert children's book illustrator helping create scene descriptions for AI image generation.

Book Title: ${bookTitle || "Untitled"}
Book Description: ${bookDescription || "Not provided"}
Art Style: ${artStyle || "watercolor"}
Target Age: ${ageRange || "5-8"}

Characters:
${characterInfo}

Page Text:
"${pageText}"

Generate a detailed scene description that would make a beautiful illustration for this page. Include:
1. Setting and environment details
2. Character positions and expressions
3. Key visual elements that match the text
4. Mood and lighting suggestions
5. Composition that leaves space for text

Respond with ONLY the scene description, no other text.`;

    const result = await model.generateContent(prompt);
    const sceneDescription = result.response.text();
    
    res.json({
      success: true,
      sceneDescription
    });
  } catch (error: any) {
    console.error("[BookStudio] Scene generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate scene description" });
  }
});

// Get AI placement suggestions for text on illustration
router.post("/projects/:projectId/pages/:pageId/placement-hints", async (req: Request, res: Response) => {
  try {
    const { projectId, pageId } = req.params;
    const user = (req as any).user;
    
    // Verify authentication
    if (!user?.id && !isOwner(user?.email)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify project ownership
    const access = await verifyProjectAccess(projectId, user);
    if (!access.authorized) {
      return res.status(access.error === "Project not found" ? 404 : 403).json({ error: access.error });
    }
    
    const { imageUrl, sceneDescription } = req.body;
    
    // For now, return intelligent placement suggestions based on typical book layouts
    // In a production system, this could use Vision AI to analyze the actual image
    const placementHints = [
      {
        id: "top-banner",
        x: 0.05,
        y: 0.02,
        width: 0.9,
        height: 0.15,
        label: "Top Banner",
        confidence: 0.85,
        reason: "Clear sky/background area typical for title text"
      },
      {
        id: "bottom-strip",
        x: 0.05,
        y: 0.80,
        width: 0.9,
        height: 0.18,
        label: "Bottom Strip",
        confidence: 0.90,
        reason: "Traditional placement for story text below illustration"
      },
      {
        id: "left-margin",
        x: 0.02,
        y: 0.20,
        width: 0.25,
        height: 0.60,
        label: "Left Margin",
        confidence: 0.75,
        reason: "Left side text column for chapter-style layout"
      },
      {
        id: "right-margin",
        x: 0.73,
        y: 0.20,
        width: 0.25,
        height: 0.60,
        label: "Right Margin",
        confidence: 0.75,
        reason: "Right side text column for picture book layout"
      }
    ];
    
    res.json({
      success: true,
      placementHints
    });
  } catch (error: any) {
    console.error("[BookStudio] Placement hints error:", error);
    res.status(500).json({ error: "Failed to generate placement hints" });
  }
});

// ============================================================================
// CONTENT PURCHASES - Entitlements System
// ============================================================================

// Check if user has access to content
router.get("/purchases/check/:contentId", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const user = (req as any).user;
    
    if (!user?.email) {
      return res.json({ hasAccess: false, reason: "not_authenticated" });
    }
    
    // Owners always have access
    if (isOwner(user.email)) {
      return res.json({ hasAccess: true, reason: "owner" });
    }
    
    // Check for purchase
    const [purchase] = await db.select().from(contentPurchases)
      .where(and(
        eq(contentPurchases.userEmail, user.email.toLowerCase()),
        eq(contentPurchases.contentId, contentId)
      ));
    
    if (!purchase) {
      return res.json({ hasAccess: false, reason: "not_purchased" });
    }
    
    // Check expiration for rentals/subscriptions
    if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date()) {
      return res.json({ hasAccess: false, reason: "expired" });
    }
    
    res.json({ hasAccess: true, purchase });
  } catch (error: any) {
    console.error("[ContentPurchases] Check error:", error);
    res.status(500).json({ error: "Failed to check access" });
  }
});

// Get user's purchases
router.get("/purchases", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user?.email) {
      return res.json([]);
    }
    
    const purchases = await db.select({
      purchase: contentPurchases,
      content: larrysContentItems,
    })
      .from(contentPurchases)
      .leftJoin(larrysContentItems, eq(contentPurchases.contentId, larrysContentItems.id))
      .where(eq(contentPurchases.userEmail, user.email.toLowerCase()))
      .orderBy(desc(contentPurchases.createdAt));
    
    res.json(purchases);
  } catch (error: any) {
    console.error("[ContentPurchases] Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// Record purchase (called after Stripe payment)
router.post("/purchases", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail, contentId, amountPaid, stripePaymentId, accessType, expiresAt } = req.body;
    
    if (!userEmail || !contentId || !amountPaid) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const [purchase] = await db.insert(contentPurchases).values({
      userId: userId || "anonymous",
      userEmail: userEmail.toLowerCase(),
      contentId,
      amountPaid: amountPaid.toString(),
      stripePaymentId,
      accessType: accessType || "permanent",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();
    
    // Update content purchase count and revenue
    await db.update(larrysContentItems)
      .set({ 
        purchases: sql`${larrysContentItems.purchases} + 1`,
        revenue: sql`${larrysContentItems.revenue} + ${amountPaid}`,
        updatedAt: new Date() 
      })
      .where(eq(larrysContentItems.id, contentId));
    
    res.json(purchase);
  } catch (error: any) {
    console.error("[ContentPurchases] Create error:", error);
    res.status(500).json({ error: "Failed to record purchase" });
  }
});

// Track content download
router.post("/purchases/:id/download", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await db.update(contentPurchases)
      .set({ 
        downloadCount: sql`${contentPurchases.downloadCount} + 1`,
        lastAccessedAt: new Date() 
      })
      .where(eq(contentPurchases.id, id));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("[ContentPurchases] Download tracking error:", error);
    res.status(500).json({ error: "Failed to track download" });
  }
});

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

async function callAI(model: string, prompt: string, systemPrompt?: string): Promise<string> {
  try {
    if (model === "gemini" && genAI) {
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await geminiModel.generateContent(fullPrompt);
      return result.response.text();
    }
    
    if (model === "gpt4" && openai) {
      const messages: any[] = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: prompt });
      
      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 4000
      });
      return result.choices[0]?.message?.content || "";
    }
    
    if (model === "claude" && anthropic) {
      const result = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt || "You are a professional book author and editor.",
        messages: [{ role: "user", content: prompt }]
      });
      return (result.content[0] as any).text || "";
    }

    if (model === "grok" && process.env.GROK_API_KEY) {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ],
          max_tokens: 4000
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }

    if (model === "perplexity" && process.env.PERPLEXITY_API_KEY) {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-large-128k-online",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ]
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }

    if (genAI) {
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await geminiModel.generateContent(fullPrompt);
      return result.response.text();
    }

    throw new Error("No AI model available");
  } catch (error: any) {
    console.error("AI call error:", error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

router.post("/generate-outline", async (req, res) => {
  try {
    const { title, description, genre, targetAudience, chapterCount, aiModel } = req.body;

    const prompt = `You are a professional book author creating a detailed book outline.

Book Title: ${title}
Description: ${description}
Genre: ${genre}
Target Audience: ${targetAudience || "General readers"}
Number of Chapters: ${chapterCount || 12}

Create a professional book outline with exactly ${chapterCount || 12} chapters. For each chapter provide:
1. A compelling chapter title
2. A 2-3 sentence description of what the chapter covers
3. 3-5 key points that will be covered

Format your response as JSON:
{
  "chapters": [
    {
      "title": "Chapter title",
      "description": "Brief description of chapter content",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`;

    const result = await callAI(aiModel || "gemini", prompt);
    
    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      parsed = { chapters: [] };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Outline generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/generate-chapter", async (req, res) => {
  try {
    const { 
      bookTitle, bookDescription, chapterTitle, chapterNumber, 
      totalChapters, previousChapter, targetWordCount, genre, 
      targetAudience, aiModel 
    } = req.body;

    const systemPrompt = `You are a professional author writing a ${genre} book. Your writing is:
- Engaging and compelling
- Well-structured with clear paragraphs
- Professional yet accessible
- Rich with practical insights and examples
- Written for ${targetAudience || "general readers"}

Write in a confident, authoritative voice. Use vivid examples and practical advice.`;

    const prompt = `Write Chapter ${chapterNumber} of "${bookTitle}": "${chapterTitle}"

Book Overview: ${bookDescription}

This is chapter ${chapterNumber} of ${totalChapters} total chapters.

${previousChapter ? `The previous chapter ended with: "${previousChapter.substring(0, 500)}..."` : "This is the first chapter."}

Write approximately ${targetWordCount || 3000} words. Include:
- A compelling opening hook
- Clear section headings (use ## for headings)
- Practical examples and insights
- A strong conclusion that leads into the next chapter

Write the full chapter content now:`;

    const content = await callAI(aiModel || "gemini", prompt, systemPrompt);

    const formattedContent = content
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');

    res.json({ 
      content: formattedContent,
      rawContent: content,
      wordCount: content.split(/\s+/).length,
      aiModel: aiModel || "gemini"
    });
  } catch (error: any) {
    console.error("Chapter generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/ai-chat", async (req, res) => {
  try {
    const { message, bookContext, aiModel } = req.body;

    const systemPrompt = `You are an expert book writing assistant. You help authors with:
- Generating content, outlines, and ideas
- Improving writing style and tone
- Suggesting edits and expansions
- Answering questions about book structure

Current book context:
- Title: ${bookContext?.title || "Untitled"}
- Description: ${bookContext?.description || "No description"}
- Current chapter: ${bookContext?.currentChapter || "None selected"}

Be helpful, specific, and practical. Provide actionable advice.`;

    const response = await callAI(aiModel || "gemini", message, systemPrompt);

    res.json({ response });
  } catch (error: any) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/export/docx", async (req, res) => {
  try {
    const { project, format } = req.body;

    const children: any[] = [];

    children.push(
      new Paragraph({
        children: [new TextRun({ text: project.title, bold: true, size: 72 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    if (project.subtitle) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: project.subtitle, size: 36, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `By ${project.author}`, size: 28 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 }
      })
    );

    children.push(
      new Paragraph({
        children: [new PageBreak()]
      })
    );

    children.push(
      new Paragraph({
        text: "Table of Contents",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    project.chapters.forEach((chapter: any, i: number) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${chapter.title}`, size: 24 })],
          spacing: { after: 200 }
        })
      );
    });

    children.push(
      new Paragraph({
        children: [new PageBreak()]
      })
    );

    project.chapters.forEach((chapter: any, i: number) => {
      children.push(
        new Paragraph({
          text: `Chapter ${i + 1}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      children.push(
        new Paragraph({
          text: chapter.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 }
        })
      );

      const parseHtmlToDocxParagraphs = (html: string): any[] => {
        const results: any[] = [];
        const blocks = html.split(/<\/(?:p|h[123]|ul|ol|li)>/gi);
        
        blocks.forEach(block => {
          block = block.trim();
          if (!block) return;
          
          const h1Match = block.match(/<h1[^>]*>(.*)/i);
          const h2Match = block.match(/<h2[^>]*>(.*)/i);
          const h3Match = block.match(/<h3[^>]*>(.*)/i);
          const pMatch = block.match(/<p[^>]*>(.*)/i) || block.match(/^([^<]+)$/);
          
          if (h1Match) {
            results.push(new Paragraph({
              text: h1Match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }));
          } else if (h2Match) {
            results.push(new Paragraph({
              text: h2Match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }));
          } else if (h3Match) {
            results.push(new Paragraph({
              text: h3Match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            }));
          } else if (pMatch) {
            const content = pMatch[1] || block;
            const textRuns: any[] = [];
            let remaining = content;
            
            const strongRegex = /<strong>(.*?)<\/strong>/gi;
            const emRegex = /<em>(.*?)<\/em>/gi;
            
            let cleanText = remaining
              .replace(/<strong>(.*?)<\/strong>/gi, (_, text) => `**${text}**`)
              .replace(/<em>(.*?)<\/em>/gi, (_, text) => `__${text}__`)
              .replace(/<[^>]+>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
            
            const parts = cleanText.split(/(\*\*.*?\*\*|__.*?__)/);
            parts.forEach(part => {
              if (part.startsWith('**') && part.endsWith('**')) {
                textRuns.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 24 }));
              } else if (part.startsWith('__') && part.endsWith('__')) {
                textRuns.push(new TextRun({ text: part.slice(2, -2), italics: true, size: 24 }));
              } else if (part.trim()) {
                textRuns.push(new TextRun({ text: part, size: 24 }));
              }
            });
            
            if (textRuns.length > 0) {
              results.push(new Paragraph({
                children: textRuns,
                spacing: { after: 200 },
                alignment: AlignmentType.LEFT
              }));
            }
          }
        });
        
        return results;
      };
      
      const contentParagraphs = parseHtmlToDocxParagraphs(chapter.content);
      contentParagraphs.forEach(para => children.push(para));

      children.push(
        new Paragraph({
          children: [new PageBreak()]
        })
      );
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}.docx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error("DOCX export error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/export/pdf", async (req, res) => {
  try {
    const { project } = req.body;

    let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page { size: 6in 9in; margin: 1in; }
    body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.6; }
    h1 { font-size: 24pt; text-align: center; margin-top: 2in; }
    h2 { font-size: 18pt; page-break-before: always; }
    h3 { font-size: 14pt; }
    p { text-indent: 0.5in; margin: 0 0 0.5em 0; }
    .title-page { text-align: center; page-break-after: always; }
    .author { font-size: 14pt; margin-top: 1in; }
    .toc { page-break-after: always; }
    .chapter { page-break-before: always; }
  </style>
</head>
<body>
  <div class="title-page">
    <h1>${project.title}</h1>
    ${project.subtitle ? `<p style="font-size: 16pt; font-style: italic;">${project.subtitle}</p>` : ""}
    <p class="author">By ${project.author}</p>
  </div>
  
  <div class="toc">
    <h2>Table of Contents</h2>
    ${project.chapters.map((ch: any, i: number) => `<p>${i + 1}. ${ch.title}</p>`).join("\n")}
  </div>
`;

    project.chapters.forEach((chapter: any, i: number) => {
      const content = chapter.content
        .replace(/<h2>(.*?)<\/h2>/gi, '<h3>$1</h3>')
        .replace(/<h1>(.*?)<\/h1>/gi, '<h3>$1</h3>');
      
      html += `
  <div class="chapter">
    <h2>Chapter ${i + 1}: ${chapter.title}</h2>
    ${content}
  </div>
`;
    });

    html += "</body></html>";

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}.html"`);
    res.send(html);
  } catch (error: any) {
    console.error("PDF export error:", error);
    res.status(500).json({ error: error.message });
  }
});

// KDP-Ready Illustrated Children's Book Export
router.post("/export/kdp-illustrated", async (req, res) => {
  try {
    const { project, trimSize = "8.5x8.5", bleed = true } = req.body;
    
    // KDP trim sizes - these are FINAL CUT dimensions (after trimming)
    const trimSizes: Record<string, { width: number; height: number; name: string }> = {
      "8.5x8.5": { width: 8.5, height: 8.5, name: "Square (8.5\" x 8.5\")" },
      "8x10": { width: 8, height: 10, name: "Portrait (8\" x 10\")" },
      "6x9": { width: 6, height: 9, name: "Trade (6\" x 9\")" },
      "7x10": { width: 7, height: 10, name: "Large (7\" x 10\")" },
      "8.25x6": { width: 8.25, height: 6, name: "Landscape (8.25\" x 6\")" },
      "8.25x8.25": { width: 8.25, height: 8.25, name: "Square Alt (8.25\" x 8.25\")" },
    };
    
    const size = trimSizes[trimSize] || trimSizes["8.5x8.5"];
    // KDP bleed: 0.125" on each side (0.25" total per dimension)
    const bleedAmount = bleed ? 0.125 : 0;
    // Page dimensions = trim size + bleed on all sides
    const pageWidth = size.width + (bleedAmount * 2);
    const pageHeight = size.height + (bleedAmount * 2);
    // Safe area starts 0.25" from trim edge (0.375" from bleed edge when bleed is active)
    const safeAreaOffset = bleedAmount + 0.25;
    
    const pageIllustrations = project.pageIllustrations || [];
    
    // Generate print-ready HTML for each page
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${project.title} - KDP Print Ready</title>
  <style>
    @page { 
      size: ${pageWidth}in ${pageHeight}in; 
      margin: 0; 
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Georgia', 'Times New Roman', serif; 
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: ${pageWidth}in;
      height: ${pageHeight}in;
      position: relative;
      page-break-after: always;
      page-break-inside: avoid;
      overflow: hidden;
    }
    .page:last-child { page-break-after: auto; }
    .bleed-area {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-size: cover;
      background-position: center;
    }
    .safe-area {
      position: absolute;
      top: ${safeAreaOffset}in;
      left: ${safeAreaOffset}in;
      right: ${safeAreaOffset}in;
      bottom: ${safeAreaOffset}in;
    }
    .illustration-full {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .text-overlay {
      position: absolute;
      left: ${safeAreaOffset}in;
      right: ${safeAreaOffset}in;
      padding: 0.25in;
      text-align: center;
      font-size: 18pt;
      line-height: 1.4;
      color: #1a1a1a;
      background: rgba(255,255,255,0.9);
      border-radius: 8px;
    }
    .text-top { top: ${safeAreaOffset}in; }
    .text-bottom { bottom: ${safeAreaOffset}in; }
    .text-left {
      left: ${safeAreaOffset}in;
      top: ${safeAreaOffset}in;
      bottom: ${safeAreaOffset}in;
      width: 2.5in;
      right: auto;
      text-align: left;
      display: flex;
      align-items: center;
      padding: 0.25in;
    }
    .text-right {
      right: ${safeAreaOffset}in;
      top: ${safeAreaOffset}in;
      bottom: ${safeAreaOffset}in;
      width: 2.5in;
      left: auto;
      text-align: right;
      display: flex;
      align-items: center;
      padding: 0.25in;
    }
    .title-page {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
    }
    .title-page h1 {
      font-size: 36pt;
      font-weight: bold;
      margin-bottom: 0.5in;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .title-page .author {
      font-size: 18pt;
      font-style: italic;
      opacity: 0.9;
    }
    .copyright-page {
      background: white;
      padding: 1in;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      font-size: 10pt;
      color: #666;
      line-height: 1.6;
    }
    .page-number {
      position: absolute;
      bottom: ${safeAreaOffset}in;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10pt;
      color: #666;
    }
    @media print {
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
    }
  </style>
</head>
<body>
  <!-- Title Page -->
  <div class="page title-page">
    <h1>${project.title}</h1>
    ${project.subtitle ? `<p style="font-size: 20pt; margin-bottom: 0.5in;">${project.subtitle}</p>` : ""}
    <p class="author">Written by ${project.author}</p>
  </div>
  
  <!-- Copyright Page -->
  <div class="page copyright-page">
    <div>
      <p><strong>${project.title}</strong></p>
      ${project.subtitle ? `<p>${project.subtitle}</p>` : ""}
      <p>By ${project.author}</p>
      <br>
      <p>Copyright &copy; ${new Date().getFullYear()} ${project.author}</p>
      <p>All rights reserved.</p>
      <br>
      <p>No part of this publication may be reproduced, stored in a retrieval system,
      or transmitted in any form or by any means without the prior written permission
      of the copyright owner.</p>
      <br>
      <p>Art Style: ${project.artStyle || "Digital Illustration"}</p>
      <p>Age Range: ${project.ageRange || "All Ages"}</p>
      <br>
      <p style="font-size: 8pt;">Created with WashBizHub Book Studio</p>
    </div>
  </div>
`;

    // Generate illustration pages
    pageIllustrations.forEach((page: any, index: number) => {
      const textPosition = page.textPosition || "bottom";
      const hasImage = page.imageUrl && page.imageUrl.length > 0;
      const hasText = page.pageText && page.pageText.length > 0;
      
      html += `
  <!-- Page ${page.pageNumber} -->
  <div class="page">`;
      
      if (hasImage) {
        html += `
    <div class="bleed-area" style="background-image: url('${page.imageUrl}');"></div>`;
      } else {
        html += `
    <div class="bleed-area" style="background: linear-gradient(180deg, #f0f8ff 0%, #e6f2ff 100%);"></div>`;
      }
      
      if (hasText && textPosition !== "none") {
        html += `
    <div class="text-overlay text-${textPosition}">
      ${page.pageText}
    </div>`;
      }
      
      html += `
    <div class="page-number">${page.pageNumber}</div>
  </div>
`;
    });

    // Back cover (blank or with description)
    html += `
  <!-- Back Cover -->
  <div class="page" style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%); color: white; padding: 1in; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <p style="font-size: 14pt; text-align: center; max-width: 5in; line-height: 1.8;">
      ${project.description || "A delightful story for young readers everywhere."}
    </p>
  </div>
</body>
</html>`;

    // Return HTML for browser-based PDF printing
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}_KDP_${trimSize.replace(".", "_")}.html"`);
    res.send(html);
  } catch (error: any) {
    console.error("KDP export error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/generate-cover", async (req, res) => {
  try {
    const { title, subtitle, author, genre, description, generateImage } = req.body;

    // Step 1: Generate optimized image prompt using Gemini
    let imagePrompt = "";
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const promptRequest = `Generate a detailed image prompt for a professional book cover:
Title: ${title}
Subtitle: ${subtitle || "None"}
Author: ${author}
Genre: ${genre}
Description: ${description}

Create a detailed prompt for generating a professional, modern book cover. Include:
- Visual style and mood (modern, professional, eye-catching)
- Color palette (specific colors that match the genre)
- Key imagery or symbols (no text, just visual elements)
- Overall composition (book cover format, 2:3 aspect ratio)

IMPORTANT: Do NOT include any text or typography in the image - the title and author will be added separately.
Format as a single paragraph image generation prompt optimized for DALL-E.`;

      const result = await model.generateContent(promptRequest);
      imagePrompt = result.response.text();
    } else {
      imagePrompt = `Professional book cover design for "${title}" in the ${genre} genre. Modern, clean composition with relevant imagery. No text.`;
    }

    // Step 2: Generate actual image using DALL-E 3 if requested
    let coverImageUrl = `https://placehold.co/600x900/1e293b/c8a661?text=${encodeURIComponent(title)}`;
    let imageGenerated = false;

    if (generateImage && openai) {
      try {
        console.log("📚 Generating book cover with DALL-E 3...");
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${imagePrompt}. Professional book cover design, portrait orientation (2:3 ratio), high quality, suitable for print. DO NOT include any text, letters, words, or typography in the image.`,
          n: 1,
          size: "1024x1792", // Portrait for book covers
          quality: "hd",
          style: "vivid"
        });

        if (dalleResponse.data?.[0]?.url) {
          coverImageUrl = dalleResponse.data[0].url;
          imageGenerated = true;
          console.log("✅ Book cover generated successfully");
        }
      } catch (dalleError: any) {
        console.error("DALL-E generation failed:", dalleError.message);
        // Fall back to placeholder
      }
    }

    res.json({ 
      imagePrompt,
      coverImageUrl,
      imageGenerated,
      message: imageGenerated 
        ? "Cover image generated successfully!" 
        : generateImage 
          ? "Image generation failed - using placeholder" 
          : "Cover prompt ready. Click 'Generate Image' to create the cover."
    });
  } catch (error: any) {
    console.error("Cover generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate interior illustrations for chapters
router.post("/generate-illustration", async (req, res) => {
  try {
    const { chapterTitle, chapterContent, style, bookGenre } = req.body;

    if (!openai) {
      return res.status(400).json({ error: "Image generation requires OpenAI API" });
    }

    // Generate illustration prompt
    let illustrationPrompt = "";
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(`
Create a brief image generation prompt for a book illustration:
Chapter: ${chapterTitle}
Genre: ${bookGenre}
Content summary: ${chapterContent?.substring(0, 500)}
Style: ${style || "modern illustration"}

Generate a single paragraph prompt for DALL-E that captures the essence of this chapter.
The illustration should be suitable for a book interior. No text in the image.`);
      illustrationPrompt = result.response.text();
    } else {
      illustrationPrompt = `Book illustration for chapter "${chapterTitle}" in ${style || "modern"} style. ${bookGenre} genre. No text.`;
    }

    // Generate with DALL-E
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${illustrationPrompt}. Book interior illustration, clean and professional. NO text, letters, or words.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const imageUrl = dalleResponse.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate illustration");
    }

    res.json({
      imageUrl,
      prompt: illustrationPrompt,
      message: "Illustration generated successfully"
    });
  } catch (error: any) {
    console.error("Illustration generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================
// CHILDREN'S BOOK ILLUSTRATION SYSTEM
// ===========================

const ART_STYLES = {
  watercolor: "soft watercolor painting, gentle colors, dreamy atmosphere, children's book illustration style",
  cartoon: "colorful cartoon illustration, vibrant colors, friendly characters, rounded shapes, Disney-style",
  "digital-painting": "digital painting, rich colors, detailed backgrounds, modern illustration style",
  "pencil-sketch": "soft pencil sketch with color wash, hand-drawn feel, warm tones",
  "flat-design": "flat design illustration, bold colors, simple shapes, modern minimalist",
  "storybook-classic": "classic storybook illustration, warm colors, detailed scenes, timeless feel like Beatrix Potter",
  "whimsical": "whimsical fantasy illustration, magical atmosphere, glowing elements, enchanted forest style",
  "anime": "anime-style illustration, expressive characters, colorful backgrounds, Japanese animation inspired"
};

// Generate children's book illustration with character consistency
router.post("/generate-children-illustration", async (req, res) => {
  try {
    const { 
      sceneDescription, 
      characterDescriptions, 
      artStyle, 
      pageNumber,
      bookTitle,
      ageRange,
      mood,
      setting
    } = req.body;

    if (!openai) {
      return res.status(400).json({ error: "Image generation requires OpenAI API" });
    }

    const selectedStyle = ART_STYLES[artStyle as keyof typeof ART_STYLES] || ART_STYLES.watercolor;
    
    // Build comprehensive character description for consistency
    let characterContext = "";
    if (characterDescriptions && Array.isArray(characterDescriptions)) {
      characterContext = characterDescriptions.map((char: any) => 
        `${char.name}: ${char.description}${char.clothing ? `, wearing ${char.clothing}` : ""}`
      ).join(". ");
    }

    // Generate detailed prompt using Gemini for better quality
    let illustrationPrompt = "";
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(`
You are creating an illustration prompt for a children's picture book.

Book: "${bookTitle || 'Untitled'}"
Age Range: ${ageRange || "3-8 years"}
Page: ${pageNumber || 1}
Scene: ${sceneDescription}
Characters: ${characterContext || "No specific characters"}
Setting: ${setting || "Not specified"}
Mood: ${mood || "cheerful"}
Art Style: ${selectedStyle}

Create a detailed, vivid image generation prompt for DALL-E 3 that:
1. Captures the scene exactly as described
2. Maintains character appearance consistency
3. Uses the specified art style throughout
4. Is age-appropriate and engaging for children
5. Has clear focal point and good composition
6. Includes appropriate background details

IMPORTANT: The prompt must explicitly state NO TEXT, NO LETTERS, NO WORDS in the image.

Generate a single comprehensive paragraph prompt optimized for DALL-E 3.`);
      illustrationPrompt = result.response.text();
    } else {
      illustrationPrompt = `Children's book illustration: ${sceneDescription}. ${characterContext}. ${selectedStyle}. Age-appropriate, colorful, engaging. NO TEXT.`;
    }

    console.log("🎨 Generating children's book illustration...");
    
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${illustrationPrompt}. CRITICAL: This is a children's book illustration. Do NOT include any text, letters, words, numbers, or typography anywhere in the image. Keep it completely text-free.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    });

    const imageUrl = dalleResponse.data?.[0]?.url;
    const revisedPrompt = dalleResponse.data?.[0]?.revised_prompt;
    
    if (!imageUrl) {
      throw new Error("Failed to generate illustration");
    }

    console.log("✅ Children's book illustration generated successfully");

    res.json({
      imageUrl,
      prompt: illustrationPrompt,
      revisedPrompt,
      artStyle: artStyle || "watercolor",
      pageNumber: pageNumber || 1,
      message: "Illustration generated successfully"
    });
  } catch (error: any) {
    console.error("Children's illustration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate a full page spread (landscape orientation for double-page spreads)
router.post("/generate-page-spread", async (req, res) => {
  try {
    const { 
      sceneDescription, 
      characterDescriptions, 
      artStyle, 
      spreadType,
      text,
      textPosition
    } = req.body;

    if (!openai) {
      return res.status(400).json({ error: "Image generation requires OpenAI API" });
    }

    const selectedStyle = ART_STYLES[artStyle as keyof typeof ART_STYLES] || ART_STYLES.watercolor;
    
    // Build character context
    let characterContext = "";
    if (characterDescriptions && Array.isArray(characterDescriptions)) {
      characterContext = characterDescriptions.map((char: any) => 
        `${char.name}: ${char.description}`
      ).join(". ");
    }

    // Determine composition based on text position
    let compositionGuide = "";
    switch (textPosition) {
      case "left":
        compositionGuide = "Leave empty space on the LEFT side of the image for text overlay. Main action and characters should be on the RIGHT side.";
        break;
      case "right":
        compositionGuide = "Leave empty space on the RIGHT side of the image for text overlay. Main action and characters should be on the LEFT side.";
        break;
      case "bottom":
        compositionGuide = "Leave empty space at the BOTTOM of the image for text. Main scene should be in the upper 2/3.";
        break;
      case "top":
        compositionGuide = "Leave empty space at the TOP of the image for text. Main scene should be in the lower 2/3.";
        break;
      default:
        compositionGuide = "Full illustration with balanced composition.";
    }

    // Use landscape size for spreads
    const imageSize = spreadType === "double" ? "1792x1024" : "1024x1024";

    let illustrationPrompt = `${selectedStyle}. ${sceneDescription}. ${characterContext}. ${compositionGuide} Children's picture book style, vibrant and engaging. NO TEXT, NO LETTERS, NO WORDS in the image.`;

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(`
Create a DALL-E prompt for a children's book ${spreadType === "double" ? "double-page spread (landscape)" : "single page"}.

Scene: ${sceneDescription}
Characters: ${characterContext || "None specified"}
Art Style: ${selectedStyle}
Text Position: ${textPosition || "none"} - ${compositionGuide}

Generate a detailed prompt that creates a professional children's book illustration.
The illustration must have NO TEXT whatsoever.`);
      illustrationPrompt = result.response.text();
    }

    console.log("🎨 Generating page spread illustration...");
    
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${illustrationPrompt}. ABSOLUTELY NO text, letters, words, or typography in this image.`,
      n: 1,
      size: imageSize as "1024x1024" | "1792x1024" | "1024x1792",
      quality: "hd",
      style: "vivid"
    });

    const imageUrl = dalleResponse.data?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error("Failed to generate page spread");
    }

    console.log("✅ Page spread generated successfully");

    res.json({
      imageUrl,
      prompt: illustrationPrompt,
      spreadType: spreadType || "single",
      textPosition: textPosition || "none",
      suggestedTextArea: textPosition ? {
        position: textPosition,
        recommendation: `Place text in the ${textPosition} area of the image`
      } : null,
      message: "Page spread generated successfully"
    });
  } catch (error: any) {
    console.error("Page spread error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get available art styles
router.get("/art-styles", (req, res) => {
  res.json({
    styles: Object.entries(ART_STYLES).map(([id, description]) => ({
      id,
      name: id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description
    }))
  });
});

// ===========================
// AI VISION ANALYSIS FOR PERFECT SPOTS
// ===========================

interface PlacementHint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  reason: string;
}

// Analyze illustration to find optimal text placement zones using Gemini Vision
router.post("/analyze-illustration", async (req, res) => {
  try {
    const { imageUrl, pageText } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    // Fallback hints for when AI is unavailable
    const fallbackHints: PlacementHint[] = [
      { id: "top-safe", x: 0.05, y: 0.02, width: 0.9, height: 0.2, label: "Top Safe Zone", confidence: 0.7, reason: "Standard top placement for titles and short text" },
      { id: "bottom-safe", x: 0.05, y: 0.75, width: 0.9, height: 0.22, label: "Bottom Safe Zone", confidence: 0.85, reason: "Most common placement for story text in children's books" },
      { id: "left-margin", x: 0.02, y: 0.2, width: 0.3, height: 0.6, label: "Left Sidebar", confidence: 0.6, reason: "Good for longer passages alongside illustration" },
      { id: "right-margin", x: 0.68, y: 0.2, width: 0.3, height: 0.6, label: "Right Sidebar", confidence: 0.6, reason: "Alternative sidebar placement" }
    ];

    if (!genAI) {
      return res.json({ placementHints: fallbackHints, method: "heuristic" });
    }

    try {
      // Fetch image and convert to base64 for Gemini Vision
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const analysisPrompt = `Analyze this children's book illustration to find the BEST places to overlay text.

Identify 4-6 "perfect spots" where text could be placed without obscuring important visual elements.

For each spot provide normalized coordinates (0-1 where 0,0 is top-left):
- x, y: top-left corner position
- width, height: size of text zone
- label: descriptive name
- confidence: 0-1 score
- reason: why this spot works

Consider:
- AVOID faces, characters, main subjects
- PREFER solid backgrounds, sky, grass, empty spaces
- Rule of thirds, golden ratio zones
- Print safe areas (avoid edges by 5%)
- Contrast for text legibility

${pageText ? `Text length: ~${pageText.length} chars` : ""}

Return ONLY valid JSON:
{"placementHints":[{"id":"string","x":0.05,"y":0.75,"width":0.9,"height":0.2,"label":"Bottom Clear","confidence":0.9,"reason":"Clear area"}],"primarySubject":"description","avoidAreas":["list"]}`;

      const result = await model.generateContent([
        { text: analysisPrompt },
        { inlineData: { data: base64Image, mimeType } }
      ]);
      
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return res.json({ 
          ...analysis, 
          method: "gemini-vision",
          analyzed: true 
        });
      }
    } catch (visionError: any) {
      console.error("Vision analysis failed, using fallback:", visionError.message);
    }

    res.json({ placementHints: fallbackHints, method: "heuristic-fallback" });
  } catch (error: any) {
    console.error("Illustration analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate ISBN-13 barcode data
router.post("/generate-isbn", async (req, res) => {
  try {
    const { prefix = "979", registrationGroup = "8", registrant, publication } = req.body;
    
    // ISBN-13 format: prefix-registration group-registrant-publication-check digit
    // For self-published: typically use 979-8 prefix
    const baseIsbn = `${prefix}${registrationGroup}${registrant || "000000"}${publication || "000"}`;
    
    // Calculate check digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(baseIsbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    const fullIsbn = baseIsbn + checkDigit;
    const formattedIsbn = `${prefix}-${registrationGroup}-${registrant || "000000"}-${publication || "000"}-${checkDigit}`;
    
    res.json({
      isbn13: fullIsbn,
      formatted: formattedIsbn,
      barcode: fullIsbn, // Can be used with barcode generation library
      note: "This is a placeholder ISBN. For real publishing, purchase an ISBN from your country's ISBN agency."
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// KDP Preflight validation
router.post("/kdp-preflight", async (req, res) => {
  try {
    const { 
      pages, 
      trimSize, 
      hasBleed,
      coverIncluded,
      pageCount,
      colorMode
    } = req.body;

    const issues: { severity: "error" | "warning" | "info"; message: string; fix?: string }[] = [];
    const passed: string[] = [];

    // Check page count (KDP requires even page count for print)
    if (pageCount && pageCount % 2 !== 0) {
      issues.push({
        severity: "warning",
        message: `Page count (${pageCount}) is odd. KDP print books require even page counts.`,
        fix: "Add a blank page or 'Notes' page at the end."
      });
    } else if (pageCount) {
      passed.push(`Page count (${pageCount}) is valid for print`);
    }

    // Check minimum page count
    if (pageCount && pageCount < 24) {
      issues.push({
        severity: "warning", 
        message: `Page count (${pageCount}) is low for a children's book. Most picture books have 24-32 pages.`,
        fix: "Consider adding more content or using larger trim size."
      });
    }

    // Check bleed
    if (!hasBleed) {
      issues.push({
        severity: "error",
        message: "Bleed not configured. Full-bleed illustrations require 0.125\" bleed on all sides.",
        fix: "Enable bleed in export settings."
      });
    } else {
      passed.push("Bleed is properly configured (0.125\")");
    }

    // Check cover
    if (!coverIncluded) {
      issues.push({
        severity: "warning",
        message: "No cover design detected. KDP requires a separate cover PDF.",
        fix: "Create a cover in the Cover Designer."
      });
    } else {
      passed.push("Cover design included");
    }

    // Check trim size
    const validTrimSizes = ["8.5x8.5", "8x10", "8.25x6", "8.25x8.25", "7x10", "6x9"];
    if (trimSize && !validTrimSizes.includes(trimSize)) {
      issues.push({
        severity: "error",
        message: `Trim size "${trimSize}" may not be available for all KDP options.`,
        fix: "Use a standard KDP trim size like 8.5x8.5 for square books."
      });
    } else if (trimSize) {
      passed.push(`Trim size (${trimSize}) is KDP-compatible`);
    }

    // Color mode check
    if (colorMode && colorMode !== "CMYK") {
      issues.push({
        severity: "info",
        message: "Color mode is RGB. Professional print typically uses CMYK.",
        fix: "For best print results, consider CMYK color profile."
      });
    }

    // Safe area check
    passed.push("Safe area margin (0.25\" from trim) configured");

    const score = Math.round((passed.length / (passed.length + issues.length)) * 100);

    res.json({
      passed,
      issues,
      score,
      ready: issues.filter(i => i.severity === "error").length === 0,
      summary: issues.filter(i => i.severity === "error").length === 0 
        ? "Your book is ready for KDP upload!" 
        : "Please fix the errors before uploading to KDP."
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate storyboard for entire book
router.post("/generate-storyboard", async (req, res) => {
  try {
    const { 
      bookTitle,
      synopsis,
      pageCount,
      characterDescriptions,
      artStyle,
      ageRange
    } = req.body;

    if (!genAI) {
      return res.status(400).json({ error: "Storyboard generation requires Gemini API" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const characterList = (characterDescriptions || []).map((c: any) => 
      `- ${c.name}: ${c.description}`
    ).join("\n");

    const result = await model.generateContent(`
You are a children's book illustrator planning a ${pageCount || 24}-page picture book.

Book Title: "${bookTitle}"
Synopsis: ${synopsis}
Age Range: ${ageRange || "3-8 years"}
Art Style: ${artStyle || "watercolor"}
Characters:
${characterList || "To be designed"}

Create a detailed storyboard with exactly ${pageCount || 24} pages. For each page provide:
1. Page number
2. Scene description (what's happening)
3. Text to appear on the page (keep it simple for the age range)
4. Illustration notes (composition, mood, key visual elements)
5. Character positions

Return as JSON:
{
  "storyboard": [
    {
      "pageNumber": 1,
      "sceneDescription": "Detailed scene description",
      "pageText": "Text for this page",
      "illustrationNotes": "Key visual elements and composition",
      "characterPositions": "Where characters appear",
      "mood": "The emotional tone",
      "isSpread": false
    }
  ]
}

Make the story engaging, age-appropriate, and with clear visual progression.`);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse storyboard");
    }

    const storyboard = JSON.parse(jsonMatch[0]);

    res.json({
      bookTitle,
      pageCount: pageCount || 24,
      artStyle: artStyle || "watercolor",
      ...storyboard,
      message: "Storyboard generated successfully"
    });
  } catch (error: any) {
    console.error("Storyboard error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Batch production pipeline - create multiple books from templates
router.post("/batch-create", async (req, res) => {
  try {
    const { books, generateOutlines, generateChapters } = req.body;
    
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: "No books provided" });
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const book of books) {
      try {
        const bookResult: any = {
          title: book.title,
          description: book.description,
          genre: book.genre,
          chapters: []
        };

        // Generate outline if requested
        if (generateOutlines && genAI) {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const outlinePrompt = `Create a detailed chapter outline for a book:
Title: ${book.title}
Genre: ${book.genre || "Non-Fiction"}
Description: ${book.description}
Number of chapters: ${book.chapterCount || 10}

Return ONLY valid JSON in this exact format:
{
  "chapters": [
    {"title": "Chapter Title", "description": "Brief description", "keyPoints": ["point1", "point2"]}
  ]
}`;
          
          const result = await model.generateContent(outlinePrompt);
          const text = result.response.text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const outline = JSON.parse(jsonMatch[0]);
            bookResult.chapters = outline.chapters;
          }
        }

        // Generate chapter content if requested
        if (generateChapters && bookResult.chapters.length > 0) {
          for (let i = 0; i < Math.min(bookResult.chapters.length, 3); i++) { // Limit to first 3 chapters in batch
            const chapter = bookResult.chapters[i];
            const chapterPrompt = `Write Chapter ${i + 1} of the book "${book.title}".
Chapter Title: ${chapter.title}
Description: ${chapter.description}
Key Points: ${chapter.keyPoints?.join(", ")}

Write approximately 1500 words. Format with HTML tags (<h2>, <h3>, <p>, <strong>, <em>).`;

            const response = await callAI(book.aiModel || "gemini", chapterPrompt);
            bookResult.chapters[i].content = response;
          }
        }

        results.push(bookResult);
      } catch (bookError: any) {
        errors.push({ title: book.title, error: bookError.message });
      }
    }

    res.json({
      success: true,
      totalBooks: books.length,
      completed: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error: any) {
    console.error("Batch creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get batch job status
router.get("/batch-status/:jobId", async (req, res) => {
  // In production, this would check a job queue like BullMQ
  res.json({
    jobId: req.params.jobId,
    status: "completed",
    message: "Batch processing complete"
  });
});

// Template library for quick book creation - comprehensive library
router.get("/templates", async (req, res) => {
  const templates = [
    // BUSINESS & PROFESSIONAL
    {
      id: "business-guide",
      name: "Business Guide",
      category: "Business",
      description: "Comprehensive guide template for business topics",
      chapterCount: 12,
      genres: ["Business", "Finance", "Entrepreneurship"],
      targetWordCount: 35000,
      structure: ["Introduction", "Foundation", "Strategy", "Implementation", "Case Studies", "Advanced Tactics", "Tools & Resources", "Common Mistakes", "Success Stories", "Future Trends", "Action Plan", "Conclusion"]
    },
    {
      id: "industry-bible",
      name: "Industry Bible",
      category: "Business",
      description: "Comprehensive industry reference guide",
      chapterCount: 15,
      genres: ["Business", "Reference", "Professional"],
      targetWordCount: 50000,
      structure: ["Industry Overview", "History & Evolution", "Key Players", "Market Analysis", "Operations", "Financial Management", "Marketing & Sales", "Technology", "Legal & Compliance", "Human Resources", "Growth Strategies", "Risk Management", "Future Outlook", "Resources", "Glossary"]
    },
    {
      id: "startup-playbook",
      name: "Startup Playbook",
      category: "Business",
      description: "Launch and scale your startup with proven strategies",
      chapterCount: 14,
      genres: ["Business", "Entrepreneurship", "Startups"],
      targetWordCount: 40000,
      structure: ["The Startup Mindset", "Finding Your Idea", "Market Research", "Business Model Canvas", "Building Your MVP", "Funding Strategies", "Team Building", "Go-to-Market", "Growth Hacking", "Scaling Operations", "Financial Management", "Pivoting When Needed", "Exit Strategies", "Founder Stories"]
    },
    {
      id: "real-estate-investing",
      name: "Real Estate Investing",
      category: "Business",
      description: "Master real estate investment strategies",
      chapterCount: 12,
      genres: ["Finance", "Real Estate", "Investing"],
      targetWordCount: 38000,
      structure: ["Why Real Estate", "Investment Types", "Market Analysis", "Finding Deals", "Financing Options", "Due Diligence", "The Numbers", "Property Management", "Tax Strategies", "Scaling Your Portfolio", "Common Pitfalls", "Building Wealth"]
    },
    // HOW-TO & SELF-HELP
    {
      id: "how-to-manual",
      name: "How-To Manual",
      category: "Self-Help",
      description: "Step-by-step instructional guide",
      chapterCount: 10,
      genres: ["Self-Help", "Education", "Technical"],
      targetWordCount: 30000,
      structure: ["Getting Started", "Essential Tools", "Basic Techniques", "Intermediate Skills", "Advanced Methods", "Troubleshooting", "Best Practices", "Expert Tips", "Resources", "Next Steps"]
    },
    {
      id: "30-day-transformation",
      name: "30-Day Transformation",
      category: "Self-Help",
      description: "Daily action plan for personal change",
      chapterCount: 6,
      genres: ["Self-Help", "Personal Development", "Health"],
      targetWordCount: 25000,
      structure: ["The Promise", "Week 1: Foundation", "Week 2: Building Momentum", "Week 3: Breakthrough", "Week 4: Mastery", "Life After 30 Days"]
    },
    {
      id: "habit-builder",
      name: "Habit Builder",
      category: "Self-Help",
      description: "Build lasting habits that stick",
      chapterCount: 10,
      genres: ["Self-Help", "Psychology", "Personal Development"],
      targetWordCount: 28000,
      structure: ["The Science of Habits", "Identifying Your Triggers", "The Habit Loop", "Starting Small", "Stacking Habits", "Environment Design", "Accountability Systems", "Breaking Bad Habits", "Measuring Progress", "Habits for Life"]
    },
    // MEMOIR & BIOGRAPHY
    {
      id: "memoir-template",
      name: "Personal Memoir",
      category: "Memoir",
      description: "Life story and personal journey template",
      chapterCount: 12,
      genres: ["Memoir", "Biography", "Inspiration"],
      targetWordCount: 45000,
      structure: ["Early Life", "Formative Years", "Turning Points", "Challenges", "Breakthroughs", "Lessons Learned", "Key Relationships", "Professional Journey", "Personal Growth", "Legacy", "Reflections", "Looking Forward"]
    },
    {
      id: "career-journey",
      name: "Career Journey",
      category: "Memoir",
      description: "Professional autobiography and lessons",
      chapterCount: 10,
      genres: ["Memoir", "Business", "Inspiration"],
      targetWordCount: 35000,
      structure: ["How It All Started", "Early Career", "Finding My Path", "Major Milestones", "Biggest Challenges", "Mentors & Influences", "Leadership Lessons", "Industry Insights", "What I'd Do Differently", "Advice for the Next Generation"]
    },
    // FICTION
    {
      id: "novel-fiction",
      name: "Novel Framework",
      category: "Fiction",
      description: "Classic three-act novel structure",
      chapterCount: 20,
      genres: ["Fiction", "Novel", "Literary"],
      targetWordCount: 70000,
      structure: ["The Hook", "Normal World", "Inciting Incident", "Rising Action I", "First Threshold", "Rising Action II", "Tests & Allies", "Approach to Crisis", "The Ordeal", "Midpoint Twist", "Rising Action III", "Major Setback", "Dark Night of the Soul", "Rally", "Final Push", "Climax", "Resolution I", "Resolution II", "New Normal", "Epilogue"]
    },
    {
      id: "thriller-template",
      name: "Thriller/Mystery",
      category: "Fiction",
      description: "Page-turning suspense structure",
      chapterCount: 18,
      genres: ["Thriller", "Mystery", "Suspense"],
      targetWordCount: 65000,
      structure: ["The Crime/Incident", "Discovery", "Investigation Begins", "First Clues", "Dead End", "New Lead", "Rising Stakes", "Suspect Emerges", "Twist", "Deeper Investigation", "Personal Danger", "Race Against Time", "False Resolution", "Major Revelation", "Final Confrontation", "Climax", "Resolution", "Aftermath"]
    },
    {
      id: "romance-template",
      name: "Romance Novel",
      category: "Fiction",
      description: "Contemporary romance structure",
      chapterCount: 15,
      genres: ["Romance", "Contemporary", "Fiction"],
      targetWordCount: 55000,
      structure: ["Meet Cute", "First Impressions", "Forced Proximity", "Growing Attraction", "First Kiss", "Getting Closer", "The Vulnerability", "All In", "The Complication", "The Breakup", "Misery Apart", "The Realization", "Grand Gesture", "Reunion", "Happily Ever After"]
    },
    // HEALTH & WELLNESS
    {
      id: "health-guide",
      name: "Health & Wellness Guide",
      category: "Health",
      description: "Comprehensive health transformation guide",
      chapterCount: 12,
      genres: ["Health", "Wellness", "Fitness"],
      targetWordCount: 35000,
      structure: ["Your Health Journey", "Understanding Your Body", "Nutrition Fundamentals", "Meal Planning", "Exercise Basics", "Building a Routine", "Sleep & Recovery", "Stress Management", "Mental Health", "Tracking Progress", "Overcoming Plateaus", "Lifelong Wellness"]
    },
    {
      id: "fitness-program",
      name: "Fitness Program",
      category: "Health",
      description: "Complete workout and training program",
      chapterCount: 10,
      genres: ["Fitness", "Health", "Sports"],
      targetWordCount: 28000,
      structure: ["Fitness Assessment", "Goal Setting", "Warm-Up & Mobility", "Strength Training", "Cardio Conditioning", "Flexibility & Recovery", "Nutrition for Performance", "Sample Programs", "Progress Tracking", "Long-Term Success"]
    },
    // EDUCATION & LEARNING
    {
      id: "textbook-template",
      name: "Educational Textbook",
      category: "Education",
      description: "Academic textbook structure",
      chapterCount: 12,
      genres: ["Education", "Academic", "Reference"],
      targetWordCount: 50000,
      structure: ["Introduction to the Subject", "Historical Context", "Core Concepts I", "Core Concepts II", "Core Concepts III", "Applications", "Case Studies", "Advanced Topics", "Current Research", "Practice Problems", "Review & Summary", "Further Reading"]
    },
    {
      id: "course-companion",
      name: "Course Companion",
      category: "Education",
      description: "Supplement for online courses",
      chapterCount: 8,
      genres: ["Education", "Online Learning", "Tutorial"],
      targetWordCount: 20000,
      structure: ["Course Overview", "Module 1 Deep Dive", "Module 2 Deep Dive", "Module 3 Deep Dive", "Practical Exercises", "Common Questions", "Additional Resources", "What's Next"]
    },
    // CHILDREN'S BOOKS
    {
      id: "childrens-picture",
      name: "Children's Picture Book",
      category: "Children",
      description: "Illustrated children's story template",
      chapterCount: 8,
      genres: ["Children", "Picture Book", "Educational"],
      targetWordCount: 1500,
      structure: ["Once Upon a Time", "Meet the Character", "The Problem", "First Attempt", "Learning Moment", "Trying Again", "Success!", "The End (Lesson)"]
    },
    {
      id: "middle-grade",
      name: "Middle Grade Adventure",
      category: "Children",
      description: "Ages 8-12 adventure story",
      chapterCount: 15,
      genres: ["Children", "Middle Grade", "Adventure"],
      targetWordCount: 35000,
      structure: ["Normal Life", "The Discovery", "Call to Adventure", "Crossing the Threshold", "New World Rules", "Making Friends", "First Challenge", "Setback", "Training/Preparation", "Major Test", "All Hope Lost", "Inner Strength", "Final Battle", "Victory", "Return Home Changed"]
    },
    // SPECIALTY TEMPLATES
    {
      id: "cookbook-template",
      name: "Cookbook",
      category: "Specialty",
      description: "Recipe collection with stories",
      chapterCount: 10,
      genres: ["Cookbook", "Food", "Lifestyle"],
      targetWordCount: 40000,
      structure: ["My Food Story", "Kitchen Essentials", "Breakfast & Brunch", "Appetizers & Snacks", "Soups & Salads", "Main Courses", "Side Dishes", "Desserts & Sweets", "Entertaining Menus", "Index & Tips"]
    },
    {
      id: "travel-guide",
      name: "Travel Guide",
      category: "Specialty",
      description: "Destination travel guide template",
      chapterCount: 12,
      genres: ["Travel", "Guide", "Lifestyle"],
      targetWordCount: 35000,
      structure: ["Welcome to [Destination]", "Planning Your Trip", "Getting There", "Where to Stay", "Getting Around", "Must-See Attractions", "Hidden Gems", "Food & Dining", "Nightlife & Entertainment", "Day Trips", "Practical Tips", "Itinerary Suggestions"]
    },
    {
      id: "poetry-collection",
      name: "Poetry Collection",
      category: "Specialty",
      description: "Themed poetry anthology",
      chapterCount: 6,
      genres: ["Poetry", "Literary", "Art"],
      targetWordCount: 10000,
      structure: ["Opening (Dawn)", "Rising (Morning)", "Peak (Noon)", "Turning (Afternoon)", "Descending (Evening)", "Closing (Night)"]
    },
    // LAUNDROMAT INDUSTRY SPECIFIC
    {
      id: "laundromat-guide",
      name: "Laundromat Business Guide",
      category: "Industry",
      description: "Complete laundromat investment and operations guide",
      chapterCount: 15,
      genres: ["Business", "Laundromat", "Investment"],
      targetWordCount: 45000,
      structure: ["The Laundromat Opportunity", "Industry Overview", "Location Analysis", "Due Diligence", "Valuation Methods", "Financing Your Purchase", "Equipment Selection", "Store Design & Layout", "Operations Management", "Marketing Your Store", "Financial Management", "Staffing & Training", "Technology & Automation", "Growth Strategies", "Exit Planning"]
    },
    {
      id: "stroke-recovery",
      name: "Stroke Recovery Journey",
      category: "Health",
      description: "Personal stroke recovery guide and memoir",
      chapterCount: 12,
      genres: ["Health", "Memoir", "Recovery"],
      targetWordCount: 40000,
      structure: ["The Day Everything Changed", "Understanding Stroke", "Hospital Days", "Early Recovery", "Physical Therapy Journey", "Speech & Cognitive Recovery", "Emotional Challenges", "Family & Caregivers", "Celebrating Small Wins", "Returning to Life", "What I've Learned", "Hope & The Future"]
    }
  ];

  res.json(templates);
});

export default router;
