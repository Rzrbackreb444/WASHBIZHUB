import type { Express, Request, Response } from "express";
import { db } from "./db";
import { blogPosts, users } from "@shared/schema";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";
import { isAdmin } from "./replitAuth";

const BLOG_CATEGORIES = [
  "Industry News",
  "Guides", 
  "Case Studies",
  "Tools",
  "Equipment",
  "Operations",
  "Marketing",
  "Finance",
  "Growth"
] as const;

export default function blogRoutes(app: Express) {
  
  app.get("/api/blog/posts", async (req: Request, res: Response) => {
    try {
      const { 
        page = "1", 
        limit = "12", 
        category, 
        search,
        featured
      } = req.query;
      
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 12));
      const offset = (pageNum - 1) * limitNum;
      
      let conditions = [eq(blogPosts.published, true)];
      
      if (category && category !== "all") {
        conditions.push(eq(blogPosts.category, category as string));
      }
      
      if (featured === "true") {
        conditions.push(eq(blogPosts.featured, true));
      }
      
      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          or(
            ilike(blogPosts.title, searchTerm),
            ilike(blogPosts.excerpt, searchTerm),
            ilike(blogPosts.content, searchTerm)
          )!
        );
      }
      
      const whereClause = conditions.length > 1 
        ? and(...conditions) 
        : conditions[0];
      
      const [posts, totalResult] = await Promise.all([
        db.select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          metaTitle: blogPosts.metaTitle,
          metaDescription: blogPosts.metaDescription,
          featuredImage: blogPosts.featuredImage,
          featuredImageAlt: blogPosts.featuredImageAlt,
          category: blogPosts.category,
          subcategory: blogPosts.subcategory,
          authorName: blogPosts.authorName,
          authorImage: blogPosts.authorImage,
          datePublished: blogPosts.datePublished,
          dateModified: blogPosts.dateModified,
          views: blogPosts.views,
          featured: blogPosts.featured,
          seoScore: blogPosts.seoScore,
          readabilityScore: blogPosts.readabilityScore,
        })
          .from(blogPosts)
          .where(whereClause)
          .orderBy(desc(blogPosts.datePublished))
          .limit(limitNum)
          .offset(offset),
        db.select({ count: count() })
          .from(blogPosts)
          .where(whereClause)
      ]);
      
      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limitNum);
      
      res.json({
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const [post] = await db.select()
        .from(blogPosts)
        .where(and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.published, true)
        ))
        .limit(1);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      await db.update(blogPosts)
        .set({ views: (post.views || 0) + 1 })
        .where(eq(blogPosts.id, post.id));
      
      let relatedPosts: any[] = [];
      if (post.relatedPosts && Array.isArray(post.relatedPosts)) {
        relatedPosts = await db.select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          category: blogPosts.category,
          datePublished: blogPosts.datePublished,
        })
          .from(blogPosts)
          .where(and(
            sql`${blogPosts.id} = ANY(${post.relatedPosts})`,
            eq(blogPosts.published, true)
          ))
          .limit(3);
      }
      
      if (relatedPosts.length < 3) {
        const additionalPosts = await db.select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          category: blogPosts.category,
          datePublished: blogPosts.datePublished,
        })
          .from(blogPosts)
          .where(and(
            eq(blogPosts.category, post.category),
            eq(blogPosts.published, true),
            sql`${blogPosts.id} != ${post.id}`
          ))
          .orderBy(desc(blogPosts.datePublished))
          .limit(3 - relatedPosts.length);
        
        relatedPosts = [...relatedPosts, ...additionalPosts];
      }
      
      res.json({ 
        ...post, 
        relatedPosts,
        views: (post.views || 0) + 1
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.get("/api/blog/categories", async (_req: Request, res: Response) => {
    try {
      const categoryStats = await db.select({
        category: blogPosts.category,
        count: count()
      })
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .groupBy(blogPosts.category)
        .orderBy(desc(count()));
      
      const categories = BLOG_CATEGORIES.map(cat => {
        const stat = categoryStats.find(s => s.category === cat);
        return {
          name: cat,
          count: stat?.count ?? 0,
          slug: cat.toLowerCase().replace(/\s+/g, "-")
        };
      });
      
      res.json({ 
        categories,
        total: categoryStats.reduce((sum, s) => sum + (s.count || 0), 0)
      });
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/blog/featured", async (_req: Request, res: Response) => {
    try {
      const posts = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        featuredImageAlt: blogPosts.featuredImageAlt,
        category: blogPosts.category,
        authorName: blogPosts.authorName,
        datePublished: blogPosts.datePublished,
      })
        .from(blogPosts)
        .where(and(
          eq(blogPosts.published, true),
          eq(blogPosts.featured, true)
        ))
        .orderBy(desc(blogPosts.datePublished))
        .limit(6);
      
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      res.status(500).json({ error: "Failed to fetch featured posts" });
    }
  });

  app.post("/api/blog/posts", isAdmin, async (req: Request, res: Response) => {
    try {
      const {
        title,
        content,
        excerpt,
        slug,
        category = "Guides",
        subcategory,
        featuredImage,
        featuredImageAlt,
        metaTitle,
        metaDescription,
        metaKeywords,
        focusKeyphrases,
        ogImage,
        authorName = "WashBizHub Research Team",
        authorImage,
        schemaMarkup,
        relatedPosts,
        internalLinks,
        featured = false,
        published = false,
        market = "us",
        language = "en",
        type = "manual"
      } = req.body;
      
      if (!title || !content || !excerpt) {
        return res.status(400).json({ 
          error: "Title, content, and excerpt are required" 
        });
      }
      
      const generatedSlug = slug || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      
      const [existingPost] = await db.select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, generatedSlug))
        .limit(1);
      
      if (existingPost) {
        return res.status(400).json({ error: "A post with this slug already exists" });
      }
      
      const [newPost] = await db.insert(blogPosts)
        .values({
          title,
          content,
          excerpt,
          slug: generatedSlug,
          category,
          subcategory,
          featuredImage,
          featuredImageAlt,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          metaKeywords: metaKeywords || [],
          focusKeyphrases: focusKeyphrases || [title],
          ogImage,
          ogTitle: title,
          ogDescription: excerpt,
          authorName,
          authorImage,
          schemaMarkup,
          relatedPosts,
          internalLinks,
          featured,
          published,
          status: published ? "published" : "draft",
          market,
          language,
          type,
          linkToCleanbi: true,
          cleanbiAnchorText: "Try our free CLEANBI property analysis tool",
        })
        .returning();
      
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.patch("/api/blog/posts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (updates.dateModified === undefined) {
        updates.dateModified = new Date();
      }
      if (updates.updatedAt === undefined) {
        updates.updatedAt = new Date();
      }
      
      const [updatedPost] = await db.update(blogPosts)
        .set(updates)
        .where(eq(blogPosts.id, id))
        .returning();
      
      if (!updatedPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog/posts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [deletedPost] = await db.delete(blogPosts)
        .where(eq(blogPosts.id, id))
        .returning({ id: blogPosts.id });
      
      if (!deletedPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json({ success: true, id: deletedPost.id });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  app.get("/api/blog/search", async (req: Request, res: Response) => {
    try {
      const { q, limit = "10" } = req.query;
      
      if (!q || typeof q !== "string" || q.length < 2) {
        return res.json({ results: [] });
      }
      
      const searchTerm = `%${q}%`;
      const results = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        category: blogPosts.category,
        featuredImage: blogPosts.featuredImage,
      })
        .from(blogPosts)
        .where(and(
          eq(blogPosts.published, true),
          or(
            ilike(blogPosts.title, searchTerm),
            ilike(blogPosts.excerpt, searchTerm)
          )
        ))
        .orderBy(desc(blogPosts.datePublished))
        .limit(Math.min(20, parseInt(limit as string) || 10));
      
      res.json({ results });
    } catch (error) {
      console.error("Error searching blog posts:", error);
      res.status(500).json({ error: "Failed to search posts" });
    }
  });
}
