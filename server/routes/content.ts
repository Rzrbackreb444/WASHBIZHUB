import { Router, Request, Response } from "express";
import { db } from "../db";
import { contentDocuments } from "@shared/schema";
import { eq, or, sql, desc } from "drizzle-orm";
import { getUserEntitlements } from "../entitlements";

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

function generateSlug(title: string, existingSlugs: string[] = []): string {
  let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const entitlements = await getUserEntitlements(user.id, user.email);
    
    if (!entitlements.features.contentEditor) {
      return res.status(403).json({ 
        error: "Content Editor requires Pro subscription",
        upgrade: true 
      });
    }
    
    const docs = await db.select()
      .from(contentDocuments)
      .where(
        or(
          eq(contentDocuments.authorId, user.id),
          eq(contentDocuments.authorEmail, user.email || "")
        )
      )
      .orderBy(desc(contentDocuments.updatedAt));
    
    res.json(docs);
  } catch (error: any) {
    console.error("[Content] Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const entitlements = await getUserEntitlements(user.id, user.email);
    
    if (!entitlements.features.contentEditor) {
      return res.status(403).json({ 
        error: "Content Editor requires Pro subscription",
        upgrade: true 
      });
    }
    
    const { id } = req.params;
    
    const [doc] = await db.select()
      .from(contentDocuments)
      .where(eq(contentDocuments.id, id))
      .limit(1);
    
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    const isAuthor = doc.authorId === user.id || doc.authorEmail === user.email;
    const isCollaborator = doc.collaboratorIds?.includes(user.id) || doc.collaboratorIds?.includes(user.email);
    
    if (!isAuthor && !isCollaborator) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(doc);
  } catch (error: any) {
    console.error("[Content] Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const entitlements = await getUserEntitlements(user.id, user.email);
    
    if (!entitlements.features.contentEditor) {
      return res.status(403).json({ 
        error: "Content Editor requires Pro subscription",
        upgrade: true 
      });
    }
    
    const { title, blocks, status } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const existingSlugs = (await db.select({ slug: contentDocuments.slug }).from(contentDocuments)).map(d => d.slug);
    const slug = generateSlug(title, existingSlugs);
    
    const [doc] = await db.insert(contentDocuments)
      .values({
        authorId: user.id,
        authorEmail: user.email || "",
        title,
        slug,
        blocks: blocks || [],
        status: status || "draft",
        collaboratorIds: [],
      })
      .returning();
    
    console.log(`[Content] Created document: ${doc.id} by ${user.email}`);
    res.status(201).json(doc);
  } catch (error: any) {
    console.error("[Content] Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
});

router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const entitlements = await getUserEntitlements(user.id, user.email);
    
    if (!entitlements.features.contentEditor) {
      return res.status(403).json({ 
        error: "Content Editor requires Pro subscription",
        upgrade: true 
      });
    }
    
    const { id } = req.params;
    
    const [existingDoc] = await db.select()
      .from(contentDocuments)
      .where(eq(contentDocuments.id, id))
      .limit(1);
    
    if (!existingDoc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    const isAuthor = existingDoc.authorId === user.id || existingDoc.authorEmail === user.email;
    const isCollaborator = existingDoc.collaboratorIds?.includes(user.id) || existingDoc.collaboratorIds?.includes(user.email);
    
    if (!isAuthor && !isCollaborator) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { title, slug, blocks, status, collaboratorIds } = req.body;
    
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (blocks !== undefined) updateData.blocks = blocks;
    if (status !== undefined) updateData.status = status;
    if (collaboratorIds !== undefined && isAuthor) updateData.collaboratorIds = collaboratorIds;
    
    const [updated] = await db.update(contentDocuments)
      .set(updateData)
      .where(eq(contentDocuments.id, id))
      .returning();
    
    console.log(`[Content] Updated document: ${id}`);
    res.json(updated);
  } catch (error: any) {
    console.error("[Content] Error updating document:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const entitlements = await getUserEntitlements(user.id, user.email);
    
    if (!entitlements.features.contentEditor) {
      return res.status(403).json({ 
        error: "Content Editor requires Pro subscription",
        upgrade: true 
      });
    }
    
    const { id } = req.params;
    
    const [doc] = await db.select()
      .from(contentDocuments)
      .where(eq(contentDocuments.id, id))
      .limit(1);
    
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    if (doc.authorId !== user.id && doc.authorEmail !== user.email) {
      return res.status(403).json({ error: "Only the author can delete this document" });
    }
    
    await db.delete(contentDocuments).where(eq(contentDocuments.id, id));
    
    console.log(`[Content] Deleted document: ${id}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Content] Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

router.post("/:id/collaborators", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const entitlements = await getUserEntitlements(user.id, user.email);
    
    if (!entitlements.features.realTimeCollab) {
      return res.status(403).json({ 
        error: "Real-time collaboration requires Enterprise subscription",
        upgrade: true 
      });
    }
    
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Collaborator email is required" });
    }
    
    const [doc] = await db.select()
      .from(contentDocuments)
      .where(eq(contentDocuments.id, id))
      .limit(1);
    
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    if (doc.authorId !== user.id && doc.authorEmail !== user.email) {
      return res.status(403).json({ error: "Only the author can add collaborators" });
    }
    
    const collaborators = doc.collaboratorIds || [];
    if (!collaborators.includes(email)) {
      collaborators.push(email);
      
      await db.update(contentDocuments)
        .set({ collaboratorIds: collaborators, updatedAt: new Date() })
        .where(eq(contentDocuments.id, id));
    }
    
    res.json({ success: true, collaborators });
  } catch (error: any) {
    console.error("[Content] Error adding collaborator:", error);
    res.status(500).json({ error: "Failed to add collaborator" });
  }
});

export function registerContentRoutes(app: any) {
  app.use("/api/content", router);
  console.log("✅ Content Editor routes registered");
}

export default router;
