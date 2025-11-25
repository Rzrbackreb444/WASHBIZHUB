// WashBizHub API Routes
// Reference: javascript_stripe, javascript_gemini, and javascript_log_in_with_replit blueprints

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { ObjectStorageService } from "./objectStorage";
import { resolveTenant } from "./tenant-middleware";
import Stripe from "stripe";
import { db } from "./db";
import { listings } from "@shared/schema";
import { eq, or, isNull } from "drizzle-orm";

// Type definition for AI providers
type AIProvider = "openai" | "anthropic" | "gemini" | "perplexity" | "grok";
import { generateBlogContent, generateCleanbiInsights, optimizeLayout } from "./gemini";
import { notifyNewSubscription, notifyNewProSubscription, notifyNewEnrollment, notifyConsultationRequest, notifyInsuranceLeadRequest, notifyAIChatMessage } from "./notifications";
import { calculateCleanbi, type CleanbiInput } from "./cleanbi-calculator";
import { rateLimiter } from "./rate-limit-middleware";
import { submitAllToGoogle, submitAllViaIndexNow } from "./auto-indexing";
import { generateBlogWithMultiAI, generateBlogsInBatch } from "./ai-blog-generator";
import { optimizeBlogForSEO } from "./seo-optimizer";
import { readFileSync } from "fs";
import { join } from "path";
import multer from "multer";

// Configure multer for file uploads (memory storage for PDF processing)
const multerUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});
import {
  insertDesignSchema,
  insertCleanbiScoreSchema,
  insertBlogPostSchema,
  insertCalculatorScenarioSchema,
  insertVendorSchema,
  insertPartSchema,
  insertAffiliateSchema,
  insertLaundromatSchema,
  insertCourseSchema,
  insertLessonSchema,
  insertEnrollmentSchema,
  insertBookChapterSchema,
  insertBookAccessSchema,
  insertAiBlogTaskSchema,
  insertSeoKeywordSchema,
  insertCompetitorAnalysisSchema,
  insertConsultationSchema,
  insertListingSchema,
  insertListingMediaSchema,
  insertDistributorSchema,
  insertTemplateSchema,
  insertTemplateDownloadSchema,
  insertDistributorInquirySchema,
  insertAffiliateContentSchema,
  insertAffiliateClickSchema,
  insertAffiliateSaleSchema,
  insertAffiliateCommissionSchema,
  insertAffiliatePayoutSchema,
  insertResourceSchema,
  insertResourceUsageSchema,
  insertVendorDirectorySchema,
  insertVendorReviewSchema,
  insertIndustryBenchmarkSchema,
  insertVendorStoreSchema,
  insertVendorProductSchema,
  insertEquipmentInquirySchema,
  insertSearchIndexSchema,
  insertSearchAnalyticSchema,
  insertEmailSubscriberSchema,
  insertAdvertisementSchema,
  insertForumCategorySchema,
  insertForumTopicSchema,
  insertForumReplySchema,
  insertForumVoteSchema,
  insertPlatformSettingSchema,
  insertNewsletterCampaignSchema,
} from "@shared/schema";

// Stripe optional - payments disabled if key not set
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });
} else {
  console.warn("⚠️  STRIPE_SECRET_KEY not configured - payment processing disabled");
}

// Helper function to load current authenticated user
async function getCurrentUser(req: any): Promise<{ userId: string; user: any; isAdmin: boolean } | null> {
  if (!req.user) {
    return null;
  }
  const userSub = (req.user as any)?.claims?.sub || req.user?.sub;
  if (!userSub) {
    return null;
  }
  const userId = req.user?.sub || (req.user as any)?.claims?.sub;
  const user = await storage.getUser(userId);
  if (!user) {
    return null;
  }
  return {
    userId,
    user,
    isAdmin: user.isAdmin || false,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== MULTI-TENANT MIDDLEWARE ====================
  
  // Apply tenant resolution to ALL requests
  // This attaches req.tenant based on domain (washbizhub.com, strokerecoveryacademy.com, strokelyfe.app)
  app.use(resolveTenant);
  
  // ==================== AUTH ====================
  
  // Setup Replit Auth (login, logout, callback routes)
  await setupAuth(app);
  
  // Get authenticated user data
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ==================== PLATFORM STATS (Public) ====================
  
  // Get platform stats for homepage (cached for 5 minutes)
  let cachedStats: any = null;
  let lastStatsUpdate = 0;
  const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  app.get('/api/platform-stats', async (_req, res) => {
    try {
      const now = Date.now();
      if (cachedStats && (now - lastStatsUpdate) < STATS_CACHE_TTL) {
        return res.json(cachedStats);
      }
      
      // Fetch real-time stats from database
      const [blogPosts, resources, listings] = await Promise.all([
        storage.getBlogPosts({ status: 'published' }),
        storage.getResources({}),
        storage.getListings({})
      ]);
      
      cachedStats = {
        blogPosts: blogPosts.length,
        resources: resources.length,
        listings: listings.length,
        industryMembers: 72000,
        downtimeReduction: 40,
        savedInRepairs: 1200000,
        updatedAt: new Date().toISOString()
      };
      lastStatsUpdate = now;
      
      res.json(cachedStats);
    } catch (error: any) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== OBJECT STORAGE (Private Media Serving) ====================
  
  // Serve private objects with ACL check
  app.get("/objects/:objectPath(*)", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId,
        requestedPermission: undefined, // Defaults to READ
      });
      
      if (!canAccess) {
        return res.sendStatus(403);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error accessing object:", error);
      return res.sendStatus(404);
    }
  });
  
  // ==================== DESIGNS ====================
  
  app.get("/api/designs", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const designs = await storage.getDesigns(userId);
      res.json(designs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/designs/:id", async (req, res) => {
    try {
      const design = await storage.getDesign(req.params.id);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/designs", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validated = insertDesignSchema.parse(req.body);
      const design = await storage.createDesign({
        ...validated,
        userId: currentUser.userId,
      });
      res.json(design);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/designs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const existing = await storage.getDesign(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Design not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden - you can only edit your own designs" });
      }

      const validated = insertDesignSchema.parse(req.body);
      const updated = await storage.updateDesign(req.params.id, validated);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update design" });
    }
  });

  app.post("/api/designs/:id/optimize", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const design = await storage.getDesign(req.params.id);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }

      // CRITICAL: Verify ownership
      if (design.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - can only optimize your own designs" });
      }

      const optimization = await optimizeLayout(
        design.equipment as any[],
        design.dimensions
      );

      await storage.updateDesign(req.params.id, { aiScore: optimization.score });

      res.json({
        score: optimization.score,
        recommendations: optimization.recommendations,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/designs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const existing = await storage.getDesign(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Design not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only delete your own designs" });
      }

      await storage.deleteDesign(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== CLEANBI SCORES ====================
  
  app.get("/api/cleanbi", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const scores = await storage.getCleanbiScores(userId);
      res.json(scores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cleanbi", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // CRITICAL: Force userId from authenticated user, ignore client input
      const validated = insertCleanbiScoreSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });
      const score = await storage.createCleanbiScore(validated);
      res.json(score);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/cleanbi/:id/insights", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const cleanbiScore = await storage.getCleanbiScore(req.params.id);
      if (!cleanbiScore) {
        return res.status(404).json({ message: "Score not found" });
      }

      // CRITICAL: Verify ownership
      if (cleanbiScore.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - can only view insights for your own CLEANBI scores" });
      }

      const insights = await generateCleanbiInsights({
        customer: cleanbiScore.customerScore,
        location: cleanbiScore.locationScore,
        equipment: cleanbiScore.equipmentScore,
        adaptability: cleanbiScore.adaptabilityScore,
        numbers: cleanbiScore.numbersScore,
        intelligence: cleanbiScore.intelligenceScore,
        brand: cleanbiScore.brandScore,
      });

      res.json({ insights });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== BLOG POSTS ====================
  
  app.get("/api/blog", async (req, res) => {
    try {
      const filters = {
        type: req.query.type as string | undefined,
        category: req.query.category as string | undefined,
      };
      const posts = await storage.getBlogPosts(filters);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      await storage.incrementBlogViews(req.params.id);
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog", isAdmin, async (req, res) => {
    try {
      const validated = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validated);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/blog/generate", isAdmin, async (req, res) => {
    try {
      const { topic, category } = req.body;
      const content = await generateBlogContent(topic, category);
      res.json({ content });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== MULTI-AI BLOG GENERATION ====================

  app.post("/api/blog/generate-multi-ai", isAdmin, async (req, res) => {
    try {
      const { keyword, category, targetWordCount, tone } = req.body;
      
      console.log(`🚀 Multi-AI blog generation started for: "${keyword}"`);
      
      // Generate blog using 4 AI providers
      const blogContent = await generateBlogWithMultiAI({
        keyword,
        category: category || "laundromat",
        targetWordCount: targetWordCount || 1500,
        tone: tone || "professional"
      });
      
      // Optimize for SEO
      const seoData = optimizeBlogForSEO(blogContent);
      
      // Create blog post in database
      const blogPost = await storage.createBlogPost({
        title: blogContent.title,
        content: seoData.optimizedContent,
        excerpt: blogContent.excerpt,
        slug: seoData.slug,
        canonicalUrl: seoData.canonicalUrl,
        metaTitle: blogContent.metaTitle,
        metaDescription: blogContent.metaDescription,
        focusKeyphrases: blogContent.focusKeyphrases,
        ogTitle: seoData.ogTitle,
        ogDescription: seoData.ogDescription,
        ogImage: seoData.ogImage,
        twitterCard: seoData.twitterCard,
        twitterTitle: seoData.twitterTitle,
        twitterDescription: seoData.twitterDescription,
        twitterImage: seoData.twitterImage,
        schemaMarkup: seoData.schemaMarkup,
        type: "ai_multi",
        category,
        market: "global",
        aiProviders: blogContent.allProviders || [blogContent.provider],
        aiQualityScore: blogContent.qualityScore,
        seoScore: seoData.seoScore,
        internalLinks: seoData.internalLinks,
        linkToCleanbi: true,
        cleanbiAnchorText: "Try our free property analysis tool",
        status: "published",
        published: true
      });
      
      console.log(`✅ Blog created: ${blogPost.id} (SEO Score: ${seoData.seoScore})`);
      
      res.json({ 
        success: true, 
        blog: blogPost,
        provider: blogContent.provider,
        qualityScore: blogContent.qualityScore,
        seoScore: seoData.seoScore
      });
    } catch (error: any) {
      console.error('❌ Multi-AI blog generation failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog/batch-generate", isAdmin, async (req, res) => {
    try {
      const { keywords, category } = req.body;
      
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ message: "Keywords array required" });
      }
      
      console.log(`📚 Batch generating ${keywords.length} blogs for ${category}...`);
      
      // Generate all blogs
      const blogContents = await generateBlogsInBatch(keywords, category);
      
      // Optimize and save each blog
      const savedBlogs = [];
      for (const blogContent of blogContents) {
        const seoData = optimizeBlogForSEO(blogContent);
        
        const blogPost = await storage.createBlogPost({
          title: blogContent.title,
          content: seoData.optimizedContent,
          excerpt: blogContent.excerpt,
          slug: seoData.slug,
          canonicalUrl: seoData.canonicalUrl,
          metaTitle: blogContent.metaTitle,
          metaDescription: blogContent.metaDescription,
          focusKeyphrases: blogContent.focusKeyphrases,
          ogTitle: seoData.ogTitle,
          ogDescription: seoData.ogDescription,
          ogImage: seoData.ogImage,
          twitterCard: seoData.twitterCard,
          twitterTitle: seoData.twitterTitle,
          twitterDescription: seoData.twitterDescription,
          twitterImage: seoData.twitterImage,
          schemaMarkup: seoData.schemaMarkup,
          type: "ai_multi",
          category,
          market: "global",
          aiProviders: blogContent.allProviders || [blogContent.provider],
          aiQualityScore: blogContent.qualityScore,
          seoScore: seoData.seoScore,
          internalLinks: seoData.internalLinks,
          linkToCleanbi: true,
          status: "published",
          published: true
        });
        
        savedBlogs.push(blogPost);
      }
      
      console.log(`✅ Batch complete: ${savedBlogs.length} blogs created`);
      
      res.json({ 
        success: true, 
        count: savedBlogs.length,
        blogs: savedBlogs 
      });
    } catch (error: any) {
      console.error('❌ Batch generation failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== AADVANTAGE LAUNDRY BULK BLOG GENERATION ====================
  
  app.get("/api/blog/aadvantage", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts({ category: "laundromat" });
      const aadvantagePosts = posts.filter(p => 
        p.subcategory?.includes("state-") || p.subcategory === "forum-community"
      );
      res.json(aadvantagePosts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blog/aadvantage/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const posts = await storage.getBlogPosts({ category: "laundromat" });
      const aadvantagePosts = posts
        .filter(p => p.subcategory?.includes("state-") || p.subcategory === "forum-community")
        .slice(0, limit);
      res.json(aadvantagePosts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog/aadvantage/generate-all", isAdmin, async (req, res) => {
    try {
      const { generateAllAAdvantageBlogs } = await import("./aadvantage-blog-generator");
      
      console.log("🚀 Starting AAdvantage Laundry bulk blog generation (120 posts)...");
      
      res.json({ 
        success: true, 
        message: "Bulk generation started. This will take approximately 30-45 minutes.",
        info: "Check server logs for progress updates."
      });
      
      // Run generation in background
      generateAllAAdvantageBlogs((progress) => {
        console.log(`📊 Progress: ${progress.completed}/${progress.total} (${progress.failed} failed)`);
      }).then(result => {
        console.log(`🎉 AAdvantage bulk generation complete: ${result.completed} blogs created`);
      }).catch(error => {
        console.error(`❌ Bulk generation failed: ${error.message}`);
      });
      
    } catch (error: any) {
      console.error('❌ Failed to start bulk generation:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Quick batch generation (generates 10 blogs at a time for faster results)
  // Protected with API key for automation scripts
  app.post("/api/blog/aadvantage/generate-batch", async (req, res) => {
    try {
      // Check for API key or admin auth
      const apiKey = req.headers['x-api-key'] || req.body.apiKey;
      const expectedKey = process.env.BLOG_GENERATION_API_KEY || process.env.SESSION_SECRET;
      
      if (apiKey !== expectedKey) {
        const user = await getCurrentUser(req).catch(() => null);
        if (!user?.isAdmin) {
          return res.status(401).json({ message: "Unauthorized - API key or admin access required" });
        }
      }
      
      const { batchSize = 10, startIndex = 0 } = req.body;
      const { STATES, BRANDS, EQUIPMENT_TOPICS, FORUM_TOPICS, generateEquipmentBlog, generateForumBlogPost } = await import("./aadvantage-blog-generator");
      
      const results: any[] = [];
      let currentIndex = startIndex;
      const maxBatch = Math.min(batchSize, 10); // Max 10 per batch
      
      // Calculate total equipment blogs needed
      const equipmentBlogsTotal = 100;
      const forumBlogsTotal = 20;
      
      for (let i = 0; i < maxBatch && currentIndex < 120; i++) {
        if (currentIndex < equipmentBlogsTotal) {
          // Generate equipment blog
          const stateIndex = Math.floor(currentIndex / (BRANDS.length * 4)) % STATES.length;
          const brandIndex = Math.floor(currentIndex / 4) % BRANDS.length;
          const topicIndex = currentIndex % 4;
          
          const state = STATES[stateIndex];
          const brand = BRANDS[brandIndex];
          const topic = EQUIPMENT_TOPICS[topicIndex % EQUIPMENT_TOPICS.length];
          
          console.log(`📄 Generating: ${state.name} + ${brand.name} (${currentIndex + 1}/120)`);
          const result = await generateEquipmentBlog(state, brand, topic, currentIndex);
          results.push(result);
        } else {
          // Generate forum blog
          const forumIndex = currentIndex - equipmentBlogsTotal;
          const topic = FORUM_TOPICS[forumIndex % FORUM_TOPICS.length];
          
          console.log(`📢 Generating forum blog ${forumIndex + 1}/20`);
          const result = await generateForumBlogPost(topic);
          results.push(result);
        }
        
        currentIndex++;
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      res.json({
        success: true,
        generated: results.length,
        successful,
        failed,
        nextIndex: currentIndex,
        remaining: 120 - currentIndex,
        results
      });
    } catch (error: any) {
      console.error('❌ Batch generation failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog/aadvantage/generate-single", isAdmin, async (req, res) => {
    try {
      const { state, brand, topic } = req.body;
      const { generateEquipmentBlog, STATES, BRANDS, EQUIPMENT_TOPICS } = await import("./aadvantage-blog-generator");
      
      const stateData = STATES.find(s => s.code === state || s.name === state);
      const brandData = BRANDS.find(b => b.id === brand || b.name === brand);
      const topicTemplate = topic || EQUIPMENT_TOPICS[0];
      
      if (!stateData || !brandData) {
        return res.status(400).json({ message: "Invalid state or brand" });
      }
      
      const result = await generateEquipmentBlog(stateData, brandData, topicTemplate, 0);
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog/aadvantage/generate-forum", isAdmin, async (req, res) => {
    try {
      const { topic } = req.body;
      const { generateForumBlogPost, FORUM_TOPICS } = await import("./aadvantage-blog-generator");
      
      const forumTopic = topic || FORUM_TOPICS[0];
      const result = await generateForumBlogPost(forumTopic);
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== CALCULATOR SCENARIOS ====================
  
  app.get("/api/calculator/scenarios", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const scenarios = await storage.getCalculatorScenarios(userId);
      res.json(scenarios);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/calculator/scenarios/:id", async (req, res) => {
    try {
      const scenario = await storage.getCalculatorScenario(req.params.id);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/calculator/scenarios", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // CRITICAL: Force userId from authenticated user, ignore client input
      const validated = insertCalculatorScenarioSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });
      const scenario = await storage.createCalculatorScenario(validated);
      res.json(scenario);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/calculator/scenarios/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify ownership
      const scenario = await storage.getCalculatorScenario(req.params.id);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      if (scenario.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - can only delete your own scenarios" });
      }

      await storage.deleteCalculatorScenario(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== GOOGLE-POWERED CLEANBI ====================
  
  // POST /api/cleanbi/auto - Calculate CLEANBI score for ANY address (business OR residential)
  app.post("/api/cleanbi/auto", async (req, res) => {
    try {
      // Rate limiting (30 req/min per IP)
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ error: "Rate limit exceeded. Try again in a minute." });
      }

      const { address, businessName } = req.body;
      
      // Validation
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: "Address is required" });
      }
      
      if (address.length > 500) {
        return res.status(400).json({ error: "Address too long" });
      }

      // UNIVERSAL SCORING: Detect if address is business or residential
      const { detectAddressType } = await import('./address-type-detector');
      const addressType = await detectAddressType(address, businessName);

      console.log(`🎯 Address type detected: ${addressType.type.toUpperCase()} (${addressType.confidence}% confidence)`);

      if (addressType.type === 'business') {
        // Score as BUSINESS using OPTIMIZED wrapper (caching + rate limiting + batching)
        const { calculateCLEANBIScore } = await import('./cleanbi-engine-wrapper');
        const { getUserCLEANBITier } = await import('./cleanbi-subscription-manager');
        
        // Get user info for quota tracking (if authenticated)
        const currentUser = await getCurrentUser(req).catch(() => null);
        
        // Load user's REAL subscription tier (defaults to FREE if not authenticated)
        let userTier: Awaited<ReturnType<typeof getUserCLEANBITier>> | undefined;
        if (currentUser) {
          userTier = await getUserCLEANBITier(currentUser.userId);
        }
        
        const result = await calculateCLEANBIScore({
          address,
          userId: currentUser?.userId,
          userTier
        });
        
        res.json({
          ...result,
          addressType: 'business',
          confidence: addressType.confidence
        });
      } else {
        // Score as RESIDENTIAL using new residential scoring engine
        const { scoreResidentialProperty } = await import('./residential-scoring-engine');
        const result = await scoreResidentialProperty({ address });
        
        res.json({
          ...result,
          addressType: 'residential',
          // Normalize structure to match business response
          industry: 'Residential Property',
          industryDisplay: 'Residential Property',
        });
      }
    } catch (error: any) {
      console.error('Universal CLEANBI error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to calculate score",
        hint: "Verify the address is correct"
      });
    }
  });

  // ==================== MARKETPLACE ====================
  
  app.get("/api/vendors", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const vendors = await storage.getVendors(category);
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vendors", isAdmin, async (req, res) => {
    try {
      const validated = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(validated);
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== PARTS ====================
  
  app.get("/api/parts", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        vendorId: req.query.vendorId as string | undefined,
      };
      const parts = await storage.getParts(filters);
      res.json(parts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/parts", isAdmin, async (req, res) => {
    try {
      const validated = insertPartSchema.parse(req.body);
      const part = await storage.createPart(validated);
      res.json(part);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== AFFILIATES ====================
  
  app.get("/api/affiliates", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const affiliates = await storage.getAffiliates(userId);
      res.json(affiliates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/affiliates", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // CRITICAL: Force userId from authenticated user
      const validated = insertAffiliateSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });
      const affiliate = await storage.createAffiliate(validated);
      res.json(affiliate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/affiliates/:id/track-click", async (req, res) => {
    try {
      await storage.trackAffiliateClick({
        affiliateTag: req.params.id,
        targetUrl: req.body.targetUrl || '',
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/affiliates/:id/track-sale", async (req, res) => {
    try {
      const { amount } = req.body;
      await storage.trackAffiliateSaleSimple(req.params.id, amount);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== LAUNDROMATS ====================
  
  app.get("/api/laundromats", async (req, res) => {
    try {
      const filters = {
        city: req.query.city as string | undefined,
        state: req.query.state as string | undefined,
        zipCode: req.query.zipCode as string | undefined,
      };
      const laundromats = await storage.getLaundromats(filters);
      res.json(laundromats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/laundromats", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // CRITICAL: Force userId from authenticated user
      const validated = insertLaundromatSchema.parse({
        ...req.body,
        ownerId: currentUser.userId,
      });
      const laundromat = await storage.createLaundromat(validated);
      res.json(laundromat);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Note: Stripe webhook handler is in server/index.ts (must be before JSON middleware)
  
  // ==================== STRIPE SUBSCRIPTION ====================
  
  app.post("/api/create-subscription", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const { email, name } = req.body;

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name,
      });

      // Create subscription ($97/month Pro plan)
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: "usd",
              product: "prod_washbizhub_pro",
              recurring: {
                interval: "month",
              },
              unit_amount: 9700, // $97.00
            } as any, // Stripe typing issue with inline product_data
          },
        ],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== COURSES (PREMIUM LEARNING PLATFORM) ====================
  
  app.get("/api/courses", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const published = req.query.published === "true" ? true : undefined;
      const courses = await storage.getCourses({ category, published });
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", isAdmin, async (req, res) => {
    try {
      const validated = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validated);
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create Stripe checkout session for course purchase
  app.post("/api/courses/:id/checkout", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Check if already enrolled
      const existing = await storage.getEnrollment(userId, course.id);
      if (existing) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: course.title,
                description: course.description,
              },
              unit_amount: Math.round(parseFloat(course.price) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/courses/${course.id}?success=true`,
        cancel_url: `${req.headers.origin}/courses/${course.id}?canceled=true`,
        metadata: {
          userId,
          courseId: course.id,
          type: "course_purchase",
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== LESSONS ====================
  
  // Sanitize quiz data to remove answers (security: prevent client-side answer exposure)
  const sanitizeQuiz = (quizData: any) => {
    if (!quizData || !quizData.questions) return null;
    
    return {
      ...quizData,
      questions: quizData.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        // SECURITY: Remove correctAnswer and explanation - validate server-side only
      }))
    };
  };

  // Transform lesson data to match frontend expectations
  // Security: Quiz answers now validated server-side via /grade endpoint (sanitized by default)
  const transformLesson = (lesson: any, includeAnswers: boolean = false) => ({
    ...lesson,
    content: {
      text: lesson.content || '',
      quiz: includeAnswers ? lesson.quizData : sanitizeQuiz(lesson.quizData),
      video: lesson.videoUrl || null,
      resources: lesson.resources || []
    }
  });

  // Get lessons by courseId (supports both URL param and query param)
  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons(req.params.courseId);
      const transformed = lessons.map(lesson => transformLesson(lesson, false));
      res.json(transformed);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/lessons", async (req, res) => {
    try {
      const { courseId } = req.query;
      if (!courseId || typeof courseId !== 'string') {
        return res.status(400).json({ message: "courseId query parameter is required" });
      }
      const lessons = await storage.getLessons(courseId);
      const transformed = lessons.map(lesson => transformLesson(lesson, false));
      res.json(transformed);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get a single lesson by ID
  app.get("/api/lessons/:lessonId", async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(transformLesson(lesson));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/lessons", isAdmin, async (req, res) => {
    try {
      const validated = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(validated);
      res.json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Submit quiz answers for grading (server-side validation)
  app.post("/api/lessons/:lessonId/grade", isAuthenticated, async (req, res) => {
    try {
      const { lessonId } = req.params;
      const { answers } = req.body; // { questionId: selectedOption }
      
      console.log("[GRADE] Grading lesson:", lessonId);
      console.log("[GRADE] Received answers:", answers);
      
      const lesson = await storage.getLesson(lessonId);
      if (!lesson || !lesson.quizData) {
        console.error("[GRADE] Lesson or quiz not found");
        return res.status(404).json({ message: "Lesson or quiz not found" });
      }

      const quizData = lesson.quizData as any;
      console.log("[GRADE] Quiz data structure:", JSON.stringify(quizData, null, 2).substring(0, 500));
      
      if (!quizData.questions) {
        console.error("[GRADE] No questions in quiz data");
        return res.status(400).json({ message: "Invalid quiz data" });
      }

      // Grade the quiz server-side
      let correct = 0;
      const total = quizData.questions.length;
      const results = quizData.questions.map((q: any) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) correct++;
        
        console.log(`[GRADE] Q${q.id}: user=${userAnswer}, correct=${q.correctAnswer}, match=${isCorrect}`);
        
        return {
          questionId: q.id,
          correct: isCorrect,
          // Only reveal explanation after submission
          explanation: q.explanation || null
        };
      });

      const score = correct;
      const passed = (score / total) >= (quizData.passingScore || 70) / 100;

      console.log(`[GRADE] Final score: ${score}/${total}, passed: ${passed}`);

      res.json({
        score,
        total,
        passed,
        results
      });
    } catch (error: any) {
      console.error("[GRADE] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== ENROLLMENTS ====================
  
  app.get("/api/enrollments", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      const enrollments = await storage.getEnrollments(userId);
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // SECURITY: Manual enrollment creation disabled - only Stripe webhook can create enrollments
  // This prevents users from bypassing payment
  /*
  app.post("/api/enrollments", async (req, res) => {
    try {
      const validated = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(validated);
      res.json(enrollment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  */

  app.put("/api/enrollments/:id/progress", isAuthenticated, async (req, res) => {
    try {
      const { progress, currentLessonId, completedLessons } = req.body;
      const updated = await storage.updateEnrollmentProgress(
        req.params.id,
        progress,
        currentLessonId,
        completedLessons
      );
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== BOOK CHAPTERS ====================
  
  app.get("/api/book/chapters", async (req, res) => {
    try {
      const chapters = await storage.getBookChapters();
      res.json(chapters);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/book/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.getBookChapter(req.params.id);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/book/chapters", isAdmin, async (req, res) => {
    try {
      const validated = insertBookChapterSchema.parse(req.body);
      const chapter = await storage.createBookChapter(validated);
      res.json(chapter);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== BOOK ACCESS ====================
  
  app.get("/api/book/access", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      const access = await storage.getUserBookAccess(userId);
      res.json({ hasAccess: !!access });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/book/purchase", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Check if already has access
      const existing = await storage.getUserBookAccess(userId);
      if (existing) {
        return res.status(400).json({ message: "Already has book access" });
      }

      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "The Complete Laundromat Playbook",
                description: "Interactive digital book with embedded calculators and tools",
              },
              unit_amount: 4700, // $47.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/book?success=true`,
        cancel_url: `${req.headers.origin}/book?canceled=true`,
        metadata: {
          userId,
          type: "book_purchase",
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== AI BLOG TASKS ====================
  
  app.get("/api/ai-blog-tasks", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const status = req.query.status as string | undefined;
      const tasks = await storage.getAiBlogTasks({ userId, status });
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/ai-blog-tasks/:id", async (req, res) => {
    try {
      const task = await storage.getAiBlogTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai-blog-tasks", isAdmin, async (req, res) => {
    try {
      const validated = insertAiBlogTaskSchema.parse(req.body);
      const task = await storage.createAiBlogTask(validated);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/ai-blog-tasks/:id", isAdmin, async (req, res) => {
    try {
      const task = await storage.updateAiBlogTask(req.params.id, req.body);
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate blog content using multi-AI providers
  app.post("/api/ai-blog-tasks/:id/generate", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getAiBlogTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Import AI provider service
      const { aiProviderService } = await import("./ai-providers");
      
      // Generate content using selected AI provider
      const keywords = Array.isArray(task.keywords) ? task.keywords : [];
      const metadata = task.metadata as any || {};
      const providers = task.providers as any || {};
      
      const messages = [
        {
          role: "system" as const,
          content: `You are a professional laundromat industry content writer. Write SEO-optimized, informative blog posts.`
        },
        {
          role: "user" as const,
          content: `Write a blog post with the following details:
Topic: ${task.topic}
Keywords: ${keywords.join(", ")}
Target word count: ${metadata.targetWordCount || 1500}

Create engaging, well-researched content that provides value to laundromat owners and operators.`
        }
      ];

      const selectedProvider = providers.selected || "openai";
      const response = await aiProviderService.generate(
        selectedProvider,
        messages
      );

      // Update task with generated content
      const drafts = task.drafts as any || {};
      drafts[selectedProvider] = response.content;
      
      const updatedTask = await storage.updateAiBlogTask(id, {
        drafts,
        status: "completed",
      } as any);

      res.json({
        task: updatedTask,
        usage: response.usage,
        model: response.model,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== SEO KEYWORDS ====================
  
  app.get("/api/seo-keywords", async (req, res) => {
    try {
      const minSearchVolume = req.query.minSearchVolume ? parseInt(req.query.minSearchVolume as string) : undefined;
      const maxDifficulty = req.query.maxDifficulty ? parseInt(req.query.maxDifficulty as string) : undefined;
      const keywords = await storage.getSeoKeywords({ minSearchVolume, maxDifficulty });
      res.json(keywords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/seo-keywords", isAdmin, async (req, res) => {
    try {
      const validated = insertSeoKeywordSchema.parse(req.body);
      const keyword = await storage.createSeoKeyword(validated);
      res.json(keyword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== COMPETITOR ANALYSIS ====================
  
  app.get("/api/competitor-analysis", async (req, res) => {
    try {
      const keyword = req.query.keyword as string | undefined;
      const analyses = await storage.getCompetitorAnalyses(keyword);
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/competitor-analysis", isAdmin, async (req, res) => {
    try {
      const validated = insertCompetitorAnalysisSchema.parse(req.body);
      const analysis = await storage.createCompetitorAnalysis(validated);
      res.json(analysis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== CONSULTATIONS ====================
  
  app.get("/api/consultations", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const status = req.query.status as string | undefined;
      const consultations = await storage.getConsultations(userId, status);
      res.json(consultations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/consultations/:id", async (req, res) => {
    try {
      const consultation = await storage.getConsultation(req.params.id);
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      res.json(consultation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/consultations", async (req, res) => {
    try {
      const validated = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(validated);
      res.json(consultation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/consultations/:id", isAdmin, async (req, res) => {
    try {
      const validated = insertConsultationSchema.partial().parse(req.body);
      const updated = await storage.updateConsultation(req.params.id, validated);
      if (!updated) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== LISTINGS (MARKETPLACE) ====================
  
  app.get("/api/listings", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const state = req.query.state as string | undefined;
      const listings = await storage.getListings(status, state);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/listings", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validated = insertListingSchema.parse(req.body);
      const listing = await storage.createListing({
        ...validated,
        userId: currentUser.userId,
      });
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/listings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const existing = await storage.getListing(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only edit your own listings" });
      }

      const validated = insertListingSchema.partial().parse(req.body);
      const updated = await storage.updateListing(req.params.id, validated);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/listings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const existing = await storage.getListing(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only delete your own listings" });
      }

      await storage.deleteListing(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== LISTING MEDIA (Images, Videos, Documents) ====================
  
  app.get("/api/listings/:id/media", async (req, res) => {
    try {
      const media = await storage.getListingMedia(req.params.id);
      res.json(media);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/listings/:id/media/upload-url", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only upload media to your own listings" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/listings/:id/media", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only add media to your own listings" });
      }

      const validated = insertListingMediaSchema.parse({
        ...req.body,
        listingId: req.params.id,
      });

      // Normalize the URL to use our /objects/ path
      const objectStorageService = new ObjectStorageService();
      const normalizedUrl = objectStorageService.normalizeObjectEntityPath(validated.url);
      
      // Set ACL policy for the uploaded media
      await objectStorageService.trySetObjectEntityAclPolicy(validated.url, {
        owner: currentUser.userId,
        visibility: validated.requiresNDA ? "private" : "public",
      });

      const media = await storage.createListingMedia({
        ...validated,
        url: normalizedUrl,
      });
      
      res.json(media);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/listings/:id/media/reorder", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only reorder media for your own listings" });
      }

      const { mediaIds } = req.body;
      if (!Array.isArray(mediaIds)) {
        return res.status(400).json({ message: "mediaIds must be an array" });
      }

      await storage.reorderListingMedia(req.params.id, mediaIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/listings/:id/media/:mediaId", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only delete media from your own listings" });
      }

      const media = await storage.getListingMediaItem(req.params.mediaId);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      if (media.listingId !== req.params.id) {
        return res.status(400).json({ message: "Media does not belong to this listing" });
      }

      await storage.deleteListingMedia(req.params.mediaId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== DISTRIBUTOR LOCATOR ====================
  
  app.get("/api/distributors", async (req, res) => {
    try {
      const filters = {
        brandName: req.query.brandName as string | undefined,
        state: req.query.state as string | undefined,
        equipmentType: req.query.equipmentType as string | undefined,
      };
      const distributors = await storage.getDistributors(filters);
      res.json(distributors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/distributors/:id", async (req, res) => {
    try {
      const distributor = await storage.getDistributor(req.params.id);
      if (!distributor) {
        return res.status(404).json({ message: "Distributor not found" });
      }
      res.json(distributor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/distributors", isAdmin, async (req, res) => {
    try {
      const validated = insertDistributorSchema.parse(req.body);
      const distributor = await storage.createDistributor(validated);
      res.json(distributor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/distributor-inquiries", async (req, res) => {
    try {
      const validated = insertDistributorInquirySchema.parse(req.body);
      const inquiry = await storage.createDistributorInquiry(validated);
      res.json(inquiry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/distributor-inquiries", async (req, res) => {
    try {
      const distributorId = req.query.distributorId as string | undefined;
      const inquiries = await storage.getDistributorInquiries(distributorId);
      res.json(inquiries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/distributor-inquiries/:id", isAdmin, async (req, res) => {
    try {
      const validated = insertDistributorInquirySchema.partial().parse(req.body);
      const updated = await storage.updateDistributorInquiry(req.params.id, validated);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== AFFILIATE SYSTEM ====================
  
  // DUPLICATE - Already defined at line ~463 with proper auth
  // app.post("/api/affiliates", ...) // REMOVED DUPLICATE

  app.get("/api/affiliates/:id", async (req, res) => {
    try {
      const affiliate = await storage.getAffiliate(req.params.id);
      if (!affiliate) {
        return res.status(404).json({ message: "Affiliate not found" });
      }
      res.json(affiliate);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/affiliate/by-tag/:tag", async (req, res) => {
    try {
      const affiliate = await storage.getAffiliateByTag(req.params.tag);
      if (!affiliate) {
        return res.status(404).json({ message: "Affiliate not found" });
      }
      res.json(affiliate);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/affiliate/click", async (req, res) => {
    try {
      const validated = insertAffiliateClickSchema.parse(req.body);
      const click = await storage.trackAffiliateClick(validated);
      res.json(click);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/affiliate/content", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // CRITICAL: Force affiliateId from authenticated user
      const validated = insertAffiliateContentSchema.parse({
        ...req.body,
        affiliateId: currentUser.userId,
      });
      const content = await storage.createAffiliateContent(validated);
      res.json(content);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/affiliate/content", async (req, res) => {
    try {
      const filters = {
        affiliateId: req.query.affiliateId as string | undefined,
        status: req.query.status as string | undefined,
        type: req.query.type as string | undefined,
      };
      const content = await storage.getAffiliateContent(filters);
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/affiliate/content/:slug", async (req, res) => {
    try {
      const content = await storage.getAffiliateContentBySlug(req.params.slug);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/affiliate/sales", async (req, res) => {
    try {
      const validated = insertAffiliateSaleSchema.parse(req.body);
      const sale = await storage.createAffiliateSale(validated);
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/affiliate/dashboard/:affiliateId", async (req, res) => {
    try {
      const { affiliateId } = req.params;
      
      const [
        affiliate,
        content,
        clicks,
        sales,
        commissions,
        payouts
      ] = await Promise.all([
        storage.getAffiliate(affiliateId),
        storage.getAffiliateContent({ affiliateId }),
        storage.getAffiliateClicks(affiliateId, 100),
        storage.getAffiliateSales(affiliateId),
        storage.getAffiliateCommissions(affiliateId),
        storage.getAffiliatePayouts(affiliateId),
      ]);

      if (!affiliate) {
        return res.status(404).json({ message: "Affiliate not found" });
      }

      res.json({
        affiliate,
        content,
        clicks,
        sales,
        commissions,
        payouts,
        stats: {
          totalClicks: affiliate.totalClicks,
          totalSales: affiliate.totalSales,
          totalRevenue: affiliate.totalRevenue,
          totalCommission: affiliate.totalCommission,
          totalPaidOut: affiliate.totalPaidOut,
          pendingPayout: Number(affiliate.totalCommission) - Number(affiliate.totalPaidOut),
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== TEMPLATES (PREMIUM) ====================

  app.get("/api/templates", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const featured = req.query.featured === "true";
      const templates = await storage.getTemplates({ category, featured });
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alias for /api/templates/all (frontend compatibility)
  app.get("/api/templates/all", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const featured = req.query.featured === "true";
      const templates = await storage.getTemplates({ category, featured });
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/templates/:id/download", isAuthenticated, async (req: any, res) => {
    try {
      const templateId = req.params.id;
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Record download
      const download = await storage.recordTemplateDownload(
        templateId,
        userId,
        template.isPremium,
        template.price ? Number(template.price) : undefined
      );

      res.json(download);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== RESOURCES HUB ====================
  
  // Get all resources with optional filters
  app.get("/api/resources", async (req, res) => {
    try {
      const filters = {
        resourceType: req.query.resourceType as string | undefined,
        category: req.query.category as string | undefined,
        targetAudience: req.query.targetAudience as string | undefined,
        searchQuery: req.query.searchQuery as string | undefined,
        featured: req.query.featured === "true" ? true : undefined,
        slug: req.query.slug as string | undefined,
      };
      const resources = await storage.getResources(filters);
      res.json(resources);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single resource by ID
  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resource = await storage.getResource(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Increment view count
      await storage.incrementResourceViews(req.params.id);
      
      res.json(resource);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get resource by slug
  app.get("/api/resources/slug/:slug", async (req, res) => {
    try {
      const resource = await storage.getResourceBySlug(req.params.slug);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Increment view count
      await storage.incrementResourceViews(resource.id);
      
      res.json(resource);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create resource (admin only)
  app.post("/api/resources", isAdmin, async (req: any, res) => {
    try {
      const validated = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(validated);
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update resource (admin only)
  app.put("/api/resources/:id", isAdmin, async (req: any, res) => {
    try {
      const validated = insertResourceSchema.partial().parse(req.body);
      const resource = await storage.updateResource(req.params.id, validated);
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Record resource usage
  app.post("/api/resources/:id/use", async (req, res) => {
    try {
      const resourceId = req.params.id;
      const userId = req.body.userId;
      const actionType = req.body.actionType || "use";
      
      // Increment use count
      await storage.incrementResourceUses(resourceId);
      
      // Record usage
      const usage = await storage.recordResourceUsage({
        resourceId,
        userId,
        actionType,
        inputData: req.body.inputData,
        resultData: req.body.resultData,
        sessionId: req.body.sessionId,
        ipAddress: req.body.ipAddress,
        userAgent: req.body.userAgent,
      });
      
      res.json(usage);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== VENDOR DIRECTORY ====================
  
  // Get all vendors with optional filters
  app.get("/api/vendors", async (req, res) => {
    try {
      const filters = {
        primaryCategory: req.query.primaryCategory as string | undefined,
        searchQuery: req.query.searchQuery as string | undefined,
        serviceArea: req.query.serviceArea as string | undefined,
        featured: req.query.featured === "true" ? true : undefined,
      };
      const vendors = await storage.getVendorDirectory(filters);
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single vendor by ID
  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.getVendorDirectoryItem(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Increment view count
      await storage.incrementVendorViews(req.params.id);
      
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get vendor by slug
  app.get("/api/vendors/slug/:slug", async (req, res) => {
    try {
      const vendor = await storage.getVendorDirectoryItemBySlug(req.params.slug);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Increment view count
      await storage.incrementVendorViews(vendor.id);
      
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create vendor (admin only)
  app.post("/api/vendors", isAdmin, async (req: any, res) => {
    try {
      const validated = insertVendorDirectorySchema.parse(req.body);
      const vendor = await storage.createVendorDirectoryItem(validated);
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update vendor (admin only)
  app.put("/api/vendors/:id", isAdmin, async (req: any, res) => {
    try {
      const validated = insertVendorDirectorySchema.partial().parse(req.body);
      const vendor = await storage.updateVendorDirectoryItem(req.params.id, validated);
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== VENDOR REVIEWS ====================
  
  // Get all reviews for a vendor
  app.get("/api/vendors/:vendorId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getVendorReviews(req.params.vendorId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create vendor review (authenticated)
  app.post("/api/vendors/:vendorId/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const validated = insertVendorReviewSchema.parse({
        ...req.body,
        vendorId: req.params.vendorId,
        userId,
      });
      const review = await storage.createVendorReview(validated);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update vendor review (authenticated)
  app.put("/api/vendors/:vendorId/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify ownership
      const existingReview = await storage.getVendorReview(req.params.id);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      if (existingReview.userId !== currentUser.userId) {
        return res.status(403).json({ message: "Forbidden - can only edit your own reviews" });
      }

      const validated = insertVendorReviewSchema.omit({ userId: true, vendorId: true, id: true }).partial().parse(req.body);
      const review = await storage.updateVendorReview(req.params.id, validated);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== INDUSTRY BENCHMARKS ====================
  
  // Get all industry benchmarks with optional filters
  app.get("/api/benchmarks", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        metric: req.query.metric as string | undefined,
        year: req.query.year ? Number(req.query.year) : undefined,
        region: req.query.region as string | undefined,
      };
      const benchmarks = await storage.getIndustryBenchmarks(filters);
      res.json(benchmarks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single benchmark by ID
  app.get("/api/benchmarks/:id", async (req, res) => {
    try {
      const benchmark = await storage.getIndustryBenchmark(req.params.id);
      if (!benchmark) {
        return res.status(404).json({ message: "Benchmark not found" });
      }
      res.json(benchmark);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create benchmark (admin only)
  app.post("/api/benchmarks", isAdmin, async (req: any, res) => {
    try {
      const validated = insertIndustryBenchmarkSchema.parse(req.body);
      const benchmark = await storage.createIndustryBenchmark(validated);
      res.json(benchmark);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== SEO: ROBOTS.TXT ====================
  app.get("/robots.txt", (_req, res) => {
    const baseUrl = process.env.VITE_BASE_URL || "https://washbizhub.com";
    const robotsTxt = `# WashBizHub - The Bloomberg of Laundromats
# ${baseUrl}

User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful bots
Crawl-delay: 1

# Specific rules for major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block sensitive areas
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // ==================== VENDOR MARKETPLACE ====================
  // GET /api/vendor-stores - List all vendor stores
  app.get("/api/vendor-stores", async (req, res) => {
    try {
      const { status, verified, featured } = req.query;
      const stores = await storage.getVendorStores({
        status: status as string,
        verified: verified === 'true',
        featured: featured === 'true',
      });
      res.json(stores);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/vendor-stores/:id - Get single vendor store
  app.get("/api/vendor-stores/:id", async (req, res) => {
    try {
      const store = await storage.getVendorStore(req.params.id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/vendor-stores/slug/:slug - Get vendor store by slug
  app.get("/api/vendor-stores/slug/:slug", async (req, res) => {
    try {
      const store = await storage.getVendorStoreBySlug(req.params.slug);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/vendor-stores - Create vendor store
  app.post("/api/vendor-stores", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Validate input using Zod schema - override server-controlled fields
      const validatedData = insertVendorStoreSchema.parse({
        ...req.body,
        ownerId: currentUser.userId, // Server-controlled
        status: 'pending', // Server-controlled - new stores start as pending
        verified: false, // Server-controlled
        featured: false, // Server-controlled
      });
      const store = await storage.createVendorStore(validatedData);
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/vendor-stores/:id - Update vendor store
  app.patch("/api/vendor-stores/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership or admin access
      const existingStore = await storage.getVendorStore(req.params.id);
      if (!existingStore) {
        return res.status(404).json({ error: "Store not found" });
      }
      if (existingStore.ownerId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden - you can only update your own stores" });
      }
      
      // Extract only allowed updatable fields (prevent client from overwriting protected fields)
      // NOTE: storeName and storeSlug REMOVED to prevent slug collisions - server-controlled
      const allowedFields: any = {
        description: req.body.description,
        logo: req.body.logo,
        banner: req.body.banner,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        website: req.body.website,
        socialLinks: req.body.socialLinks,
        categories: req.body.categories,
        returnPolicy: req.body.returnPolicy,
        shippingPolicy: req.body.shippingPolicy,
        paymentMethods: req.body.paymentMethods,
      };

      // Admins can update verified and featured status
      if (currentUser.isAdmin) {
        if (req.body.verified !== undefined) {
          allowedFields.verified = req.body.verified;
        }
        if (req.body.featured !== undefined) {
          allowedFields.featured = req.body.featured;
        }
      }
      
      // Remove undefined fields
      const updateData = Object.fromEntries(
        Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
      );
      
      // Validate using Zod schema (partial update)
      const validatedData = insertVendorStoreSchema.partial().parse(updateData);
      const store = await storage.updateVendorStore(req.params.id, validatedData);
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== VENDOR PRODUCTS ====================
  // GET /api/vendor-products - List vendor products
  app.get("/api/vendor-products", async (req, res) => {
    try {
      const { storeId, category, status, featured } = req.query;
      const products = await storage.getVendorProducts({
        storeId: storeId as string,
        category: category as string,
        status: status as string,
        featured: featured === 'true',
      });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/vendor-products/:id - Get single product
  app.get("/api/vendor-products/:id", async (req, res) => {
    try {
      const product = await storage.getVendorProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      // Increment views
      await storage.incrementProductViews(req.params.id);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/vendor-products/slug/:slug - Get product by slug
  app.get("/api/vendor-products/slug/:slug", async (req, res) => {
    try {
      const { storeId } = req.query;
      if (!storeId) {
        return res.status(400).json({ error: "storeId query parameter is required" });
      }
      const product = await storage.getVendorProductBySlug(req.params.slug, storeId as string);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      // Increment views
      await storage.incrementProductViews(product.id);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/vendor-products/store/:storeId - Get products for a store
  app.get("/api/vendor-products/store/:storeId", async (req, res) => {
    try {
      const products = await storage.getVendorProducts({
        storeId: req.params.storeId,
      });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/vendor-products - Create product
  app.post("/api/vendor-products", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Verify user owns the store
      const { storeId } = req.body;
      if (!storeId) {
        return res.status(400).json({ error: "storeId is required" });
      }
      const store = await storage.getVendorStore(storeId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      if (store.ownerId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden - you can only create products for your own stores" });
      }
      // Validate input using Zod schema - override server-controlled fields
      const validatedData = insertVendorProductSchema.parse({
        ...req.body,
        views: 0, // Server-controlled
        sales: 0, // Server-controlled
        reviewCount: 0, // Server-controlled
        status: 'draft', // Server-controlled - new products start as draft
        featured: false, // Server-controlled
      });
      const product = await storage.createVendorProduct(validatedData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/vendor-products/:id - Update product
  app.patch("/api/vendor-products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership or admin access
      const existingProduct = await storage.getVendorProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      const store = await storage.getVendorStore(existingProduct.storeId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      if (store.ownerId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden - you can only update products from your own stores" });
      }
      
      // Extract only allowed updatable fields (prevent client from overwriting protected fields)
      // NOTE: slug REMOVED to prevent collisions - server-controlled
      const allowedFields: any = {
        name: req.body.name,
        description: req.body.description,
        shortDescription: req.body.shortDescription,
        category: req.body.category,
        subcategory: req.body.subcategory,
        tags: req.body.tags,
        price: req.body.price,
        compareAtPrice: req.body.compareAtPrice,
        cost: req.body.cost,
        images: req.body.images,
        featuredImage: req.body.featuredImage,
        videoUrl: req.body.videoUrl,
        sku: req.body.sku,
        stock: req.body.stock,
        trackInventory: req.body.trackInventory,
        isDigital: req.body.isDigital,
        downloadUrl: req.body.downloadUrl,
        downloadLimit: req.body.downloadLimit,
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        keywords: req.body.keywords,
      };

      // Admins can update featured and status
      if (currentUser.isAdmin) {
        if (req.body.featured !== undefined) {
          allowedFields.featured = req.body.featured;
        }
        if (req.body.status !== undefined) {
          allowedFields.status = req.body.status;
        }
      }
      
      // Remove undefined fields
      const updateData = Object.fromEntries(
        Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
      );
      
      // Validate using Zod schema (partial update)
      const validatedData = insertVendorProductSchema.partial().parse(updateData);
      const product = await storage.updateVendorProduct(req.params.id, validatedData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/vendor-products/:id - Delete product
  app.delete("/api/vendor-products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership or admin access
      const existingProduct = await storage.getVendorProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      const store = await storage.getVendorStore(existingProduct.storeId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      if (store.ownerId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden - you can only delete products from your own stores" });
      }
      await storage.deleteVendorProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== EQUIPMENT INQUIRIES (to nick@washbizhub.com) ====================
  // POST /api/equipment-inquiries - Submit equipment inquiry
  app.post("/api/equipment-inquiries", isAuthenticated, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      // Validate input using Zod schema - override server-controlled fields
      const validatedData = insertEquipmentInquirySchema.parse({
        ...req.body,
        userId: currentUser?.userId, // Optional - can be null for anonymous inquiries
        assignedTo: 'nick@washbizhub.com', // Server-controlled
        status: 'new', // Server-controlled
        commissionRate: '10.00', // Server-controlled - 10% commission
        commissionStatus: 'pending', // Server-controlled
      });
      const inquiry = await storage.createEquipmentInquiry(validatedData);
      
      // TODO: Send email notification to nick@washbizhub.com with inquiry details
      // This would be done via SendGrid or similar service
      
      res.json(inquiry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/equipment-inquiries - List inquiries (admin only)
  app.get("/api/equipment-inquiries", isAdmin, async (req, res) => {
    try {
      const { status, email } = req.query;
      const inquiries = await storage.getEquipmentInquiries({
        status: status as string,
        email: email as string,
      });
      res.json(inquiries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/equipment-inquiries/:id - Update inquiry (admin only)
  app.patch("/api/equipment-inquiries/:id", isAdmin, async (req, res) => {
    try {
      const inquiry = await storage.updateEquipmentInquiry(req.params.id, req.body);
      res.json(inquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PLATFORM-WIDE SEARCH ====================
  // GET /api/search - Predictive autocomplete search
  app.get("/api/search", async (req, res) => {
    try {
      const { q, limit } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      
      const results = await storage.searchContent(q, limit ? parseInt(limit as string) : 10);
      
      // Track search analytics
      if ((req as any).user?.claims || (req as any).user?.sub) {
        await storage.createSearchAnalytic({
          query: q,
          resultsCount: results.length,
          userId: (req as any).user?.claims?.sub || (req as any).user?.sub || null,
          sessionId: (req as any).sessionID,
        });
      }
      
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/search/popular - Get popular searches
  app.get("/api/search/popular", async (req, res) => {
    try {
      const { limit } = req.query;
      const popular = await storage.getPopularSearches(limit ? parseInt(limit as string) : 20);
      res.json(popular);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/search/click - Track search result click
  app.post("/api/search/click", async (req, res) => {
    try {
      const { resultId } = req.body;
      if (resultId) {
        await storage.incrementSearchPopularity(resultId);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== EMAIL CAPTURE ====================
  // POST /api/email-subscribe - Email subscription
  app.post("/api/email-subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Check if already subscribed
      const existing = await storage.getEmailSubscriber(email);
      if (existing) {
        if (existing.status === 'unsubscribed') {
          // Resubscribe (partial validation for update)
          const validatedUpdate = insertEmailSubscriberSchema.partial().parse({
            status: 'subscribed',
            confirmedAt: new Date(),
          });
          const updated = await storage.updateEmailSubscriber(email, validatedUpdate);
          return res.json(updated);
        }
        return res.json(existing);
      }
      
      // Validate input using Zod schema
      const validatedData = insertEmailSubscriberSchema.parse({
        ...req.body,
        source: req.body.source || 'website',
        tags: req.body.tags || [],
        interests: req.body.interests || [],
        status: 'subscribed',
        confirmedAt: new Date(),
      });
      
      const subscriber = await storage.createEmailSubscriber(validatedData);
      
      // TODO: Send welcome email via SendGrid/Mailchimp
      
      res.json(subscriber);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/email-unsubscribe - Unsubscribe from emails
  app.post("/api/email-unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      await storage.unsubscribeEmail(email);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/email-subscribers - List subscribers (admin only)
  app.get("/api/email-subscribers", isAdmin, async (req, res) => {
    try {
      const { status, tag } = req.query;
      const subscribers = await storage.getEmailSubscribers({
        status: status as string,
        tag: tag as string,
      });
      res.json(subscribers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== WEBSITE TEMPLATES ====================
  
  // GET /api/website-templates - Browse website templates
  app.get("/api/website-templates", async (req, res) => {
    try {
      const filters = {
        industry: req.query.industry as string | undefined,
        category: req.query.category as string | undefined,
        isPro: req.query.isPro === "true" ? true : req.query.isPro === "false" ? false : undefined,
      };
      const templates = await storage.getWebsiteTemplates(filters);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/website-templates/:id - Get single template
  app.get("/api/website-templates/:id", async (req, res) => {
    try {
      const template = await storage.getWebsiteTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/websites/from-template - Create website from template
  app.post("/api/websites/from-template", isAuthenticated, async (req: any, res) => {
    try {
      const { templateId, businessName, subdomain } = req.body;
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      
      if (!templateId || !businessName || !subdomain) {
        return res.status(400).json({ error: "Missing required fields: templateId, businessName, subdomain" });
      }

      // Validate subdomain format (alphanumeric and hyphens only)
      if (!/^[a-z0-9-]+$/.test(subdomain)) {
        return res.status(400).json({ error: "Subdomain must contain only lowercase letters, numbers, and hyphens" });
      }
      
      const website = await storage.createWebsiteFromTemplate({
        userId,
        templateId,
        businessName,
        subdomain,
      });
      
      res.json(website);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/websites - Get current user's websites
  app.get("/api/websites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const websites = await storage.getUserWebsites(userId);
      res.json(websites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AFFILIATE SYSTEM ====================
  
  // Helper: Generate unique affiliate code
  function generateAffiliateCode(name: string): string {
    const sanitized = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${sanitized}${random}`;
  }

  // POST /api/affiliate/signup - Apply for affiliate program with auto-code generation
  app.post("/api/affiliate/signup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if already an affiliate
      const existing = await storage.getAffiliates(userId);
      if (existing.length > 0) {
        return res.json(existing[0]);
      }

      // Generate unique affiliate code
      const baseName = user.firstName || user.email || 'USER';
      let affiliateCode = generateAffiliateCode(baseName);
      let attempts = 0;
      while (attempts < 10) {
        const existingCode = await storage.getAffiliates();
        if (!existingCode.some(a => a.affiliateCode === affiliateCode)) {
          break;
        }
        affiliateCode = generateAffiliateCode(baseName) + Math.random().toString(36).substring(2, 3).toUpperCase();
        attempts++;
      }

      const { displayName, bio, website, socialLinks } = req.body;
      
      const emailFallback = user.email ? user.email.split('@')[0] : 'User';
      const affiliate = await storage.createAffiliate({
        userId,
        affiliateCode,
        affiliateTag: affiliateCode, // Use same as code by default
        displayName: displayName || user.firstName || emailFallback,
        bio: bio || null,
        website: website || null,
        socialLinks: socialLinks || null,
        commissionRate: "20", // Default 20%
        status: "active", // Auto-approve for launch
      });

      res.json(affiliate);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // GET /api/affiliate/profile - Get current user's affiliate profile
  app.get("/api/affiliate/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const affiliates = await storage.getAffiliates(userId);
      
      if (affiliates.length === 0) {
        return res.status(404).json({ error: "Not an affiliate" });
      }
      
      res.json(affiliates[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/affiliate/stats - Get affiliate performance stats
  app.get("/api/affiliate/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const affiliates = await storage.getAffiliates(userId);
      
      if (affiliates.length === 0) {
        return res.status(404).json({ error: "Not an affiliate" });
      }
      
      const affiliate = affiliates[0];
      const stats = {
        clicks: affiliate.totalClicks,
        sales: affiliate.totalSales,
        revenue: affiliate.totalRevenue,
        commission: affiliate.totalCommission,
        conversionRate: affiliate.totalClicks > 0 
          ? (affiliate.totalSales / affiliate.totalClicks) * 100 
          : 0,
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/affiliate/sales - Get recent affiliate sales
  app.get("/api/affiliate/sales", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const affiliates = await storage.getAffiliates(userId);
      
      if (affiliates.length === 0) {
        return res.json([]);
      }
      
      // Return empty array for now - sales tracking will be implemented with actual purchases
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/affiliate/content - Get affiliate's UGC content
  app.get("/api/affiliate/content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const affiliates = await storage.getAffiliates(userId);
      
      if (affiliates.length === 0) {
        return res.json([]);
      }
      
      // Return empty array for now - content submission will be implemented later
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== WEBSITE BUILDER ====================
  
  // GET /api/websites - List user's website projects
  app.get("/api/websites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const projects = await storage.getSiteProjects(userId);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/websites/:id - Get single website project
  app.get("/api/websites/:id", isAuthenticated, async (req: any, res) => {
    res.status(501).json({ error: "Website builder not yet implemented" });
  });

  // POST /api/websites - Create new website project
  app.post("/api/websites", isAuthenticated, async (req: any, res) => {
    res.status(501).json({ error: "Website builder not yet implemented" });
  });

  // PUT /api/websites/:id - Update website project
  app.put("/api/websites/:id", isAuthenticated, async (req: any, res) => {
    res.status(501).json({ error: "Website builder not yet implemented" });
  });

  // DELETE /api/websites/:id - Delete website project
  app.delete("/api/websites/:id", isAuthenticated, async (req: any, res) => {
    res.status(501).json({ error: "Website builder not yet implemented" });
  });

  // ==================== SEO: SITEMAP.XML ====================
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.VITE_BASE_URL || "https://washbizhub.com";
      
      // Fetch all resources and blog posts for sitemap
      const resources = await storage.getResources({});
      const blogPosts = await storage.getBlogPosts({ status: 'published' });
      
      // Static pages with comprehensive coverage
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/resources", priority: "0.9", changefreq: "daily" },
        { url: "/superstore", priority: "0.9", changefreq: "daily" },
        { url: "/design-studio", priority: "0.8", changefreq: "weekly" },
        { url: "/cleanbi", priority: "0.9", changefreq: "weekly" },
        { url: "/marketplace", priority: "0.9", changefreq: "daily" },
        { url: "/buyers-guides", priority: "0.8", changefreq: "monthly" },
        { url: "/superstore/compare", priority: "0.8", changefreq: "weekly" },
        { url: "/courses", priority: "0.7", changefreq: "weekly" },
        { url: "/book", priority: "0.7", changefreq: "weekly" },
        { url: "/blog", priority: "0.9", changefreq: "daily" },
        { url: "/affiliate-blogs", priority: "0.9", changefreq: "daily" },
        { url: "/roi-calculator", priority: "0.8", changefreq: "weekly" },
        { url: "/calculator", priority: "0.7", changefreq: "weekly" },
        { url: "/valuation-calculator", priority: "0.8", changefreq: "weekly" },
        { url: "/tpd-calculator", priority: "0.8", changefreq: "weekly" },
        { url: "/subscribe", priority: "0.6", changefreq: "monthly" },
        { url: "/funding", priority: "0.8", changefreq: "weekly" },
        { url: "/funding-matcher", priority: "0.8", changefreq: "weekly" },
        { url: "/consultation", priority: "0.8", changefreq: "monthly" },
        { url: "/about-us", priority: "0.7", changefreq: "monthly" },
        { url: "/pricing", priority: "0.8", changefreq: "weekly" },
        { url: "/why-washbizhub", priority: "0.8", changefreq: "monthly" },
        { url: "/vendors", priority: "0.7", changefreq: "weekly" },
        { url: "/forum", priority: "0.7", changefreq: "daily" },
        { url: "/laundromat-locator", priority: "0.7", changefreq: "weekly" },
        { url: "/equipment-diagnostics", priority: "0.7", changefreq: "weekly" },
        { url: "/insurance-partners", priority: "0.6", changefreq: "monthly" },
        { url: "/affiliate", priority: "0.6", changefreq: "monthly" },
      ];
      
      // Build sitemap XML
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Add static pages
      staticPages.forEach(page => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += '  </url>\n';
      });
      
      // Add dynamic resource pages
      resources.forEach(resource => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/resources/${resource.slug}</loc>\n`;
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.6</priority>\n`;
        sitemap += '  </url>\n';
      });
      
      // Add all blog posts (high priority for SEO)
      blogPosts.forEach(post => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        if (post.createdAt) {
          const date = new Date(post.createdAt).toISOString().split('T')[0];
          sitemap += `    <lastmod>${date}</lastmod>\n`;
        }
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += '  </url>\n';
      });
      
      sitemap += '</urlset>';
      
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error: any) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // ==================== NEWSLETTER ====================
  
  // POST /api/newsletter/subscribe - Subscribe to newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, firstName, source } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if already subscribed
      const existing = await storage.getEmailSubscriber(email);
      if (existing) {
        return res.json({ message: "Already subscribed", subscriber: existing });
      }

      const subscriber = await storage.createEmailSubscriber({
        email,
        firstName: firstName || null,
        source: source || 'website',
        status: 'active',
      });

      // 🚨 INSTANT NOTIFICATION: SMS + Email to admin (Nick)
      notifyNewSubscription({
        email,
        firstName: firstName || undefined,
        source: source || 'website',
      }).catch(err => {
        console.error('Failed to send notification:', err);
        // Don't block the response if notification fails
      });

      res.json({ message: "Successfully subscribed", subscriber });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/newsletter/subscribers - Get all subscribers (admin only)
  app.get("/api/newsletter/subscribers", isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const filters = status ? { status } : undefined;
      const subscribers = await storage.getEmailSubscribers(filters);
      res.json(subscribers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      await storage.unsubscribeEmail(email);
      res.json({ message: "Successfully unsubscribed" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/newsletter/send - Send newsletter to all active subscribers (admin only)

  // ==================== EMAIL ALERTS (SUPERSTORE) ====================
  
  // POST /api/alerts/price - Create price drop alert
  app.post("/api/alerts/price", rateLimiter("/api/alerts/price", 5, 1), async (req: any, res) => {
    try {
      const { email, productASIN, productName, currentPrice, targetPrice, userId } = req.body;
      
      // Validation
      if (!email || !productASIN || !productName || currentPrice === undefined || targetPrice === undefined) {
        return res.status(400).json({ error: "Email, productASIN, productName, currentPrice, and targetPrice are required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Price validation
      if (targetPrice >= currentPrice) {
        return res.status(400).json({ error: "Target price must be lower than current price" });
      }

      // Check for duplicate alert
      const existing = await storage.getPriceAlerts({ email, productASIN });
      if (existing.length > 0) {
        return res.json({ 
          message: "You already have a price alert for this product", 
          alert: existing[0] 
        });
      }

      // Create alert
      const alert = await storage.createPriceAlert({
        userId: userId || null,
        email,
        productASIN,
        productTitle: productName,
        currentPrice: currentPrice.toString(),
        targetPrice: targetPrice.toString(),
        alertSent: false,
      });

      res.status(201).json({ 
        message: "Price alert created! We'll notify you when the price drops.", 
        alert 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/alerts/price/:id - Delete price alert
  app.delete("/api/alerts/price/:id", async (req, res) => {
    try {
      await storage.deletePriceAlert(req.params.id);
      res.json({ message: "Price alert deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/alerts/price - Get user's price alerts (authenticated or by email)
  app.get("/api/alerts/price", async (req: any, res) => {
    try {
      const email = req.query.email as string | undefined;
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;

      if (!email && !userId) {
        return res.status(400).json({ error: "Email or authentication required" });
      }

      const filters = email ? { email } : userId ? { userId } : undefined;
      const alerts = await storage.getPriceAlerts(filters);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/alerts/stock - Create back-in-stock alert
  app.post("/api/alerts/stock", rateLimiter("/api/alerts/stock", 5, 1), async (req: any, res) => {
    try {
      const { email, productASIN, productName, userId } = req.body;
      
      // Validation
      if (!email || !productASIN || !productName) {
        return res.status(400).json({ error: "Email, productASIN, and productName are required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Check for duplicate alert
      const existing = await storage.getStockAlerts({ email, productASIN });
      if (existing.length > 0) {
        return res.json({ 
          message: "You already have a stock alert for this product", 
          alert: existing[0] 
        });
      }

      // Create alert
      const alert = await storage.createStockAlert({
        userId: userId || null,
        email,
        productASIN,
        productTitle: productName,
        alertSent: false,
      });

      res.status(201).json({ 
        message: "Stock alert created! We'll notify you when it's back in stock.", 
        alert 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/alerts/stock/:id - Delete stock alert
  app.delete("/api/alerts/stock/:id", async (req, res) => {
    try {
      await storage.deleteStockAlert(req.params.id);
      res.json({ message: "Stock alert deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/alerts/stock - Get user's stock alerts
  app.get("/api/alerts/stock", async (req: any, res) => {
    try {
      const email = req.query.email as string | undefined;
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;

      if (!email && !userId) {
        return res.status(400).json({ error: "Email or authentication required" });
      }

      const filters = email ? { email } : userId ? { userId } : undefined;
      const alerts = await storage.getStockAlerts(filters);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/alerts/new-products - Subscribe to new product alerts for category
  app.post("/api/alerts/new-products", rateLimiter("/api/alerts/new-products", 5, 1), async (req: any, res) => {
    try {
      const { email, category, userId } = req.body;
      
      // Validation
      if (!email || !category) {
        return res.status(400).json({ error: "Email and category are required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Check for duplicate alert
      const existing = await storage.getNewProductAlerts({ email, category });
      if (existing.length > 0) {
        return res.json({ 
          message: "You're already subscribed to new product alerts for this category", 
          alert: existing[0] 
        });
      }

      // Create alert
      const alert = await storage.createNewProductAlert({
        userId: userId || null,
        email,
        category,
      });

      res.status(201).json({ 
        message: `Subscribed to new product alerts for ${category}!`, 
        alert 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/alerts/new-products/:id - Unsubscribe from new product alerts
  app.delete("/api/alerts/new-products/:id", async (req, res) => {
    try {
      await storage.deleteNewProductAlert(req.params.id);
      res.json({ message: "New product alert deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/alerts/new-products - Get user's new product alerts
  app.get("/api/alerts/new-products", async (req: any, res) => {
    try {
      const email = req.query.email as string | undefined;
      const category = req.query.category as string | undefined;
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;

      if (!email && !userId) {
        return res.status(400).json({ error: "Email or authentication required" });
      }

      const filters: any = {};
      if (email) filters.email = email;
      if (category) filters.category = category;
      
      const alerts = await storage.getNewProductAlerts(filters);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/alerts/deals - Subscribe to deal alerts
  app.post("/api/alerts/deals", rateLimiter("/api/alerts/deals", 5, 1), async (req: any, res) => {
    try {
      const { email, categories, minDiscount, userId } = req.body;
      
      // Validation
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Check for duplicate alert
      const existing = await storage.getDealAlerts({ email });
      if (existing.length > 0) {
        return res.json({ 
          message: "You're already subscribed to deal alerts", 
          alert: existing[0] 
        });
      }

      // Create alert
      const alert = await storage.createDealAlert({
        userId: userId || null,
        email,
        categories: categories || null,
        minDiscount: minDiscount || null,
      });

      res.status(201).json({ 
        message: "Subscribed to deal alerts! We'll notify you of great deals.", 
        alert 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/alerts/deals/:id - Unsubscribe from deal alerts
  app.delete("/api/alerts/deals/:id", async (req, res) => {
    try {
      await storage.deleteDealAlert(req.params.id);
      res.json({ message: "Deal alert deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/alerts/deals - Get user's deal alerts
  app.get("/api/alerts/deals", async (req: any, res) => {
    try {
      const email = req.query.email as string | undefined;
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;

      if (!email && !userId) {
        return res.status(400).json({ error: "Email or authentication required" });
      }

      const filters = email ? { email } : undefined;
      const alerts = await storage.getDealAlerts(filters);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/alerts/browse-abandonment - Track browse abandonment (internal use)
  app.post("/api/alerts/browse-abandonment", async (req: any, res) => {
    try {
      const { sessionId, email, productASINs } = req.body;
      
      // Validation
      if (!sessionId || !productASINs) {
        return res.status(400).json({ error: "SessionId and productASINs are required" });
      }

      // Check if session already exists
      const existing = await storage.getBrowseAbandonment({ sessionId });
      
      if (existing.length > 0) {
        // Update email if provided
        const updated = await storage.updateBrowseAbandonment(existing[0].id, {
          email: email || existing[0].email,
          productASINs: productASINs,
        });
        res.json({ message: "Browse session updated", abandonment: updated });
      } else {
        // Create new browse abandonment record
        const abandonment = await storage.createBrowseAbandonment({
          sessionId,
          email: email || null,
          productASINs: productASINs,
          reminderSent: false,
        });
        res.status(201).json({ message: "Browse session tracked", abandonment });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== INSURANCE LEADS ====================
  
  // POST /api/insurance-leads - Submit insurance quote request
  app.post("/api/insurance-leads", async (req, res) => {
    try {
      const { name, email, phone, location, businessType, message } = req.body;
      
      if (!name || !email || !phone) {
        return res.status(400).json({ error: "Name, email, and phone are required" });
      }

      // Send notification to insurance team
      notifyInsuranceLeadRequest({
        name,
        email,
        phone,
        location: location || undefined,
        businessType: businessType || 'laundromat',
        message: message || undefined,
      }).catch(err => {
        console.error('Failed to send insurance lead notification:', err);
        // Don't block the response if notification fails
      });

      res.json({ message: "Quote request submitted successfully. We'll contact you soon!" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PLATFORM SETTINGS (ADMIN) ====================
  
  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const settings = await storage.getPlatformSettings(category);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/settings/:key", isAdmin, async (req, res) => {
    try {
      const setting = await storage.getPlatformSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/settings", isAdmin, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validated = insertPlatformSettingSchema.parse(req.body);
      const setting = await storage.upsertPlatformSetting({
        ...validated,
        updatedBy: currentUser.userId,
      });
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/settings/:key", isAdmin, async (req, res) => {
    try {
      await storage.deletePlatformSetting(req.params.key);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== NEWSLETTER CAMPAIGNS (ADMIN) ====================
  
  app.get("/api/admin/newsletter/campaigns", isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const campaigns = await storage.getNewsletterCampaigns({ status });
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/newsletter/campaigns/:id", isAdmin, async (req, res) => {
    try {
      const campaign = await storage.getNewsletterCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/newsletter/campaigns", isAdmin, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validated = insertNewsletterCampaignSchema.parse(req.body);
      const campaign = await storage.createNewsletterCampaign({
        ...validated,
        createdBy: currentUser.userId,
      });
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/newsletter/campaigns/:id", isAdmin, async (req, res) => {
    try {
      const validated = insertNewsletterCampaignSchema.omit({ id: true, createdBy: true, createdAt: true }).partial().parse(req.body);
      const updated = await storage.updateNewsletterCampaign(req.params.id, validated);
      if (!updated) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/newsletter/campaigns/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteNewsletterCampaign(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/newsletter/send", isAdmin, async (req, res) => {
    try {
      const { subject, content } = req.body;
      
      if (!subject || !content) {
        return res.status(400).json({ error: "Subject and content are required" });
      }

      // Get all active subscribers
      const subscribers = await storage.getEmailSubscribers({ status: 'active' });
      
      if (subscribers.length === 0) {
        return res.status(400).json({ error: "No active subscribers to send to" });
      }

      // Send via Resend
      const { getResendClient } = await import('./resend-client');
      const { client, fromEmail } = await getResendClient();

      // Send to each subscriber (Resend supports batch sending)
      const emailPromises = subscribers.map(subscriber => 
        client.emails.send({
          from: fromEmail,
          to: subscriber.email,
          subject,
          text: content,
        })
      );

      const results = await Promise.allSettled(emailPromises);
      
      // Check for failures
      const failures = results.filter(r => r.status === 'rejected');
      const successes = results.filter(r => r.status === 'fulfilled');

      if (failures.length > 0) {
        console.error(`❌ Resend errors: ${failures.length} failed out of ${subscribers.length}`);
        return res.status(500).json({ 
          error: `Failed to send ${failures.length} emails. ${successes.length} sent successfully.`,
          failedCount: failures.length,
          successCount: successes.length
        });
      }

      console.log(`✅ Newsletter sent: "${subject}" to ${subscribers.length} subscribers via Resend`);
      
      res.json({ 
        message: "Newsletter sent successfully",
        recipientCount: subscribers.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== BROKER DASHBOARD ====================

  // GET /api/broker/profile - Get broker profile for authenticated user
  app.get("/api/broker/profile", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const brokerProfile = await storage.getBrokerProfileByUserId(currentUser.userId);
      if (!brokerProfile) {
        return res.status(404).json({ error: "Broker profile not found" });
      }

      res.json(brokerProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/broker/listings - Get all listings for authenticated broker
  app.get("/api/broker/listings", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const listings = await storage.getListingsByUserId(currentUser.userId);
      
      // Calculate days listed for each
      const listingsWithStats = listings.map(listing => {
        const daysListed = listing.listedAt 
          ? Math.floor((Date.now() - new Date(listing.listedAt).getTime()) / (1000 * 60 * 60 * 24))
          : undefined;
        
        return {
          ...listing,
          daysListed,
        };
      });

      res.json(listingsWithStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AI CHAT ====================

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  // POST /api/subscriptions/upgrade - Upgrade subscription plan
  app.post("/api/subscriptions/upgrade", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { priceId, promoCode } = req.body;
      if (!priceId) {
        return res.status(400).json({ error: "Price ID required" });
      }

      // Validate promo code server-side
      const validPromoCode = process.env.SEO_SUITE_PROMO_CODE || "nickisthecoolest";
      const promoDiscount = parseFloat(process.env.SEO_SUITE_PROMO_DISCOUNT || "0.40");
      
      let discountPercentage = 0;
      if (promoCode && promoCode.toLowerCase() === validPromoCode.toLowerCase()) {
        discountPercentage = Math.floor(promoDiscount * 100); // Convert to percentage for Stripe (40)
      }

      // Create or update Stripe customer
      let customerId = currentUser.user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: currentUser.user.email,
          metadata: {
            userId: currentUser.userId,
          },
        });
        customerId = customer.id;
        await storage.updateUser(currentUser.userId, { stripeCustomerId: customerId });
      }

      // Check if user has existing subscription
      if (currentUser.user.stripeSubscriptionId) {
        // Update existing subscription with promo code support
        const subscription = await stripe.subscriptions.retrieve(currentUser.user.stripeSubscriptionId);
        
        const updateConfig: any = {
          items: [{
            id: subscription.items.data[0].id,
            price: priceId,
          }],
          proration_behavior: 'create_prorations',
          metadata: {
            promoCode: promoCode || '',
          },
        };

        // Apply discount if promo code is valid for existing subscriptions
        if (discountPercentage > 0) {
          updateConfig.coupon = await createOrGetCoupon(discountPercentage);
        }

        const updatedSubscription = await stripe.subscriptions.update(
          currentUser.user.stripeSubscriptionId,
          updateConfig
        );
        
        res.json({ subscription: updatedSubscription });
      } else {
        // Create new subscription with checkout
        const sessionConfig: any = {
          customer: customerId,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{
            price: priceId,
            quantity: 1,
          }],
          success_url: `${req.headers.origin}/settings?success=true`,
          cancel_url: `${req.headers.origin}/settings?canceled=true`,
          metadata: {
            promoCode: promoCode || '',
          },
        };

        // Apply discount if promo code is valid
        if (discountPercentage > 0) {
          sessionConfig.discounts = [{
            coupon: await createOrGetCoupon(discountPercentage),
          }];
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.json({ url: session.url });
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Helper function to create or get Stripe coupon for promo code
  async function createOrGetCoupon(percentOff: number): Promise<string> {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    
    const couponId = `promo-${percentOff}-percent`;
    
    try {
      // Try to retrieve existing coupon
      const coupon = await stripe.coupons.retrieve(couponId);
      return coupon.id;
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        // Create new coupon if it doesn't exist
        const coupon = await stripe.coupons.create({
          id: couponId,
          percent_off: percentOff,
          duration: 'forever',
          name: `${percentOff}% Off Promo`,
        });
        return coupon.id;
      }
      throw error;
    }
  }

  // POST /api/subscriptions/cancel - Cancel subscription
  app.post("/api/subscriptions/cancel", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!currentUser.user.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription" });
      }

      const { reason } = req.body;

      // Cancel at period end to allow access until paid period expires
      const subscription = await stripe.subscriptions.update(
        currentUser.user.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
          metadata: {
            cancellation_reason: reason || "No reason provided",
          },
        }
      );

      // Update user tier back to free
      await storage.updateUser(currentUser.userId, { 
        subscriptionTier: "free",
        isPro: false 
      });

      res.json({ 
        message: "Subscription will be cancelled at period end",
        subscription 
      });
    } catch (error: any) {
      console.error("Cancel error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== FORUM SYSTEM ====================

  // GET /api/forum/categories - List all forum categories
  app.get("/api/forum/categories", async (req, res) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/forum/categories - Create category (admin only)
  app.post("/api/forum/categories", isAdmin, async (req, res) => {
    try {
      const validated = insertForumCategorySchema.parse(req.body);
      const category = await storage.createForumCategory(validated);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/forum/topics - List topics (with filters)
  app.get("/api/forum/topics", async (req, res) => {
    try {
      const { categoryId, userId } = req.query;
      const topics = await storage.getForumTopics({
        categoryId: categoryId as string,
        userId: userId as string,
      });
      res.json(topics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/forum/topics/:id - Get single topic
  app.get("/api/forum/topics/:id", async (req, res) => {
    try {
      const topic = await storage.getForumTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }
      
      // Increment view count
      await storage.incrementTopicViews(req.params.id);
      
      res.json(topic);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/forum/topics - Create new topic (authenticated)
  app.post("/api/forum/topics", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validated = insertForumTopicSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });
      
      const topic = await storage.createForumTopic(validated);
      res.json(topic);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/forum/topics/:id - Update topic
  app.patch("/api/forum/topics/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const topic = await storage.getForumTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }

      // Only owner or admin can update
      if (topic.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const allowedFields = {
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags,
      };

      const updateData = Object.fromEntries(
        Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
      );

      const updated = await storage.updateForumTopic(req.params.id, updateData);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/forum/topics/:id - Delete topic
  app.delete("/api/forum/topics/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const topic = await storage.getForumTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }

      // Only owner or admin can delete
      if (topic.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteForumTopic(req.params.id);
      res.json({ message: "Topic deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/forum/topics/:topicId/replies - Get replies for topic
  app.get("/api/forum/topics/:topicId/replies", async (req, res) => {
    try {
      const replies = await storage.getForumReplies(req.params.topicId);
      res.json(replies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/forum/replies - Create reply (authenticated)
  app.post("/api/forum/replies", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validated = insertForumReplySchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });
      
      const reply = await storage.createForumReply(validated);
      res.json(reply);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/forum/replies/:id - Update reply
  app.patch("/api/forum/replies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const reply = await storage.getForumReply(req.params.id);
      if (!reply) {
        return res.status(404).json({ error: "Reply not found" });
      }

      // Only owner or admin can update
      if (reply.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await storage.updateForumReply(req.params.id, {
        content: req.body.content,
      });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/forum/replies/:id - Delete reply
  app.delete("/api/forum/replies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const reply = await storage.getForumReply(req.params.id);
      if (!reply) {
        return res.status(404).json({ error: "Reply not found" });
      }

      // Only owner or admin can delete
      if (reply.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteForumReply(req.params.id);
      res.json({ message: "Reply deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/forum/votes - Vote on topic/reply (authenticated)
  app.post("/api/forum/votes", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validated = insertForumVoteSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });
      
      const vote = await storage.createForumVote(validated);
      res.json(vote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/forum/votes - Remove vote (authenticated)
  app.delete("/api/forum/votes", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { entityType, entityId } = req.body;
      
      await storage.deleteForumVote(currentUser.userId, entityType, entityId);
      res.json({ message: "Vote removed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AI CHAT ====================

  // POST /api/ai/chat - Tiered chat access with optimal conversion funnel
  // Guests: 2 msgs → Free: 10/mo → Pro: 500/mo → Enterprise: unlimited
  app.post("/api/ai/chat", rateLimiter("/api/ai/chat", 10, 60), async (req, res) => {
    try {
      const { message, conversationHistory, guestSessionId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check if user is authenticated
      const currentUser = await getCurrentUser(req);
      let user = null;
      let tier = "guest"; // guest, free, pro, enterprise
      let messagesUsed = 0;
      let monthlyQuota = 2; // Guests get 2 messages to taste value

      if (currentUser) {
        // Authenticated user - check quotas
        user = await storage.getUser(currentUser.userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        tier = user.aiConsultantTier || "free";
        messagesUsed = user.aiMessagesUsed || 0;
        monthlyQuota = user.aiMonthlyQuota || 10; // Free: 10, Pro: 500, Enterprise: 999999
      } else {
        // Guest user - count messages in conversation history
        messagesUsed = (conversationHistory || []).filter((m: any) => m.role === "user").length;
        if (messagesUsed >= 2) {
          return res.status(429).json({ 
            error: "guest_limit_exceeded",
            message: "Sign up for a free account to get 10 messages per month!",
            tier: "guest",
            used: messagesUsed,
            quota: 2,
          });
        }
      }

      // For authenticated users, check quota reset and limits
      if (user) {
        const now = new Date();
        const quotaResetDate = user.aiQuotaResetDate ? new Date(user.aiQuotaResetDate) : now;
        
        if (now >= quotaResetDate) {
          // Reset quota for new billing period
          await storage.resetAiQuota(user.id);
          // Reload user with fresh quota
          const updatedUser = await storage.getUser(user.id);
          if (!updatedUser) {
            return res.status(500).json({ error: "Failed to reset quota" });
          }
          Object.assign(user, updatedUser);
          messagesUsed = 0;
        }

        // Check if authenticated user has exceeded their quota
        if (messagesUsed >= monthlyQuota) {
          return res.status(429).json({ 
            error: "quota_exceeded",
            message: `You've used all ${monthlyQuota} messages this month. Upgrade to Pro for 500 messages/month or Enterprise for unlimited.`,
            tier: tier,
            used: messagesUsed,
            quota: monthlyQuota,
            resetDate: user.aiQuotaResetDate,
          });
        }
      }
      // Note: Guest users are rate-limited by IP (10 req/min) via rateLimiter middleware

      // Get tenant from request (attached by tenant middleware)
      const tenant = (req as any).tenant;
      if (!tenant) {
        return res.status(503).json({ error: "Platform configuration error. Please try again." });
      }

      // Import AI provider service and tenant-aware AI system
      const { aiProviderService } = await import("./ai-providers");
      const { buildTenantAISystemPrompt, determineAIMode } = await import("./tenant-ai-system");

      // Determine AI mode based on tenant and user message (consultant, coach, or companion)
      const aiMode = determineAIMode(tenant, message);

      // Build tenant-specific AI system prompt
      // WashBizHub: Laundromat Bible + Professional consultant
      // StrokeRecoveryAcademy/StrokeLyfe: Stroke Recovery Bible + Empathetic coach/companion
      const systemPrompt = buildTenantAISystemPrompt(tenant, aiMode);

      console.log(`🤖 AI Mode: ${aiMode} | Tenant: ${tenant.name} | Knowledge: ${tenant.aiKnowledgeBasePath}`);

      const messages = [
        systemPrompt,
        ...(conversationHistory || []).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user" as const,
          content: message,
        },
      ];

      // Tier-based AI model routing with automatic fallback
      // Enterprise → Claude (preferred), Pro → GPT-4 (preferred), Free/Guest → Gemini (preferred)
      // All tiers fall back to: Gemini → OpenAI → Anthropic → Perplexity → Grok
      let preferredProvider: AIProvider = "gemini"; // Default for guests/free
      
      if (tier === "enterprise") {
        preferredProvider = "anthropic"; // Claude Opus for enterprise
      } else if (tier === "pro") {
        preferredProvider = "openai"; // GPT-4 for pro
      }

      const response = await aiProviderService.generateWithFallback(preferredProvider, messages);

      // CRITICAL: Only increment quota AFTER successful generation
      if (user) {
        await storage.incrementAiUsage(user.id);

        // Send SMS notification to owner (async, non-blocking)
        notifyAIChatMessage({
          userEmail: user.email,
          message: message,
          timestamp: new Date().toLocaleString('en-US', { 
            timeZone: 'America/Chicago',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
        }).catch(err => console.error('Failed to send chat notification:', err));
      }

      // Return response with tier-aware quota information
      const quotaData = user ? {
        tier: tier,
        used: messagesUsed + 1, // +1 for the message we just used
        limit: monthlyQuota,
        remaining: monthlyQuota - messagesUsed - 1,
        resetDate: user.aiQuotaResetDate,
      } : {
        // Guest quota info
        tier: "guest",
        used: messagesUsed + 1,
        limit: 2,
        remaining: 2 - messagesUsed - 1,
      };

      res.json({
        ...response,
        quota: quotaData,
      });
    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // GET /api/ai/health - Check AI provider availability (admin only)
  app.get("/api/ai/health", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { checkProviderHealth } = await import("./ai-router");
      const health = await checkProviderHealth();

      // Also check which providers are configured
      const { aiProviderService } = await import("./ai-providers");
      const availableProviders = aiProviderService.getAvailableProviders();

      res.json({
        health,
        availableProviders,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("AI health check error:", error);
      res.status(500).json({ error: error.message || "Health check failed" });
    }
  });

  // GET /api/ai/usage - Get AI usage report (admin only)
  app.get("/api/ai/usage", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { getDailyCostReport } = await import("./ai-router");
      const dailyReport = getDailyCostReport();

      res.json({
        daily: dailyReport,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("AI usage report error:", error);
      res.status(500).json({ error: error.message || "Usage report failed" });
    }
  });

  // ==================== GEOCODING & LOCATION SERVICES ====================
  
  // Simple rate limiter: Track requests per IP
  const geocodingRateLimit = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

  function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = geocodingRateLimit.get(ip);
    
    if (!record || now > record.resetTime) {
      geocodingRateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return true;
    }
    
    if (record.count >= RATE_LIMIT_MAX) {
      return false;
    }
    
    record.count++;
    return true;
  }

  // POST /api/geocode - Convert address to lat/lng (rate-limited)
  app.post("/api/geocode", async (req, res) => {
    try {
      // Rate limiting
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
      }

      const { address } = req.body;
      
      // Validation
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: "Address is required" });
      }
      
      if (address.length > 500) {
        return res.status(400).json({ error: "Address too long" });
      }

      const { geocodeAddress } = await import('./geocoding-service');
      const result = await geocodeAddress(address);
      
      if (!result) {
        return res.status(404).json({ error: "Unable to geocode address" });
      }

      res.json(result);
    } catch (error: any) {
      console.error('Geocoding error:', error);
      res.status(500).json({ error: "Failed to geocode address" });
    }
  });

  // POST /api/distance - Calculate distance between two points (rate-limited)
  app.post("/api/distance", async (req, res) => {
    try {
      // Rate limiting
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
      }

      const { origin, destination } = req.body;
      
      // Validation
      if (!origin || !destination) {
        return res.status(400).json({ error: "Origin and destination are required" });
      }

      const { calculateDistance } = await import('./geocoding-service');
      const result = await calculateDistance(origin, destination);
      
      if (!result) {
        return res.status(404).json({ error: "Unable to calculate distance" });
      }

      res.json(result);
    } catch (error: any) {
      console.error('Distance calculation error:', error);
      res.status(500).json({ error: "Failed to calculate distance" });
    }
  });

  // POST /api/admin/geocode-listings - Geocode all listings missing coordinates (admin only)
  app.post("/api/admin/geocode-listings", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { geocodeAddress } = await import('./geocoding-service');
      
      // Find all listings without coordinates
      const listingsToGeocode = await db
        .select()
        .from(listings)
        .where(
          or(
            isNull(listings.latitude),
            isNull(listings.longitude)
          )
        );

      const results = {
        total: listingsToGeocode.length,
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Geocode each listing
      for (const listing of listingsToGeocode) {
        try {
          // Build address from available fields
          const addressParts = [
            listing.exactAddress,
            listing.city,
            listing.region,
            listing.country
          ].filter(Boolean);
          
          if (addressParts.length === 0) {
            results.failed++;
            results.errors.push(`Listing ${listing.id}: No address information available`);
            continue;
          }

          const fullAddress = addressParts.join(', ');
          const geocoded = await geocodeAddress(fullAddress);
          
          if (geocoded) {
            // Update listing with coordinates
            await db
              .update(listings)
              .set({
                latitude: geocoded.lat.toString(),
                longitude: geocoded.lng.toString(),
                updatedAt: new Date()
              })
              .where(eq(listings.id, listing.id));
            
            results.successful++;
            console.log(`✅ Geocoded listing ${listing.id}: ${fullAddress}`);
          } else {
            results.failed++;
            results.errors.push(`Listing ${listing.id}: Geocoding failed for ${fullAddress}`);
          }
          
          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Listing ${listing.id}: ${error.message}`);
        }
      }

      res.json(results);
    } catch (error: any) {
      console.error('Batch geocoding error:', error);
      res.status(500).json({ error: "Failed to geocode listings" });
    }
  });

  // ==================== AMAZON PARTS ORDERING ====================
  // GET /api/amazon/search - Search for parts on Amazon
  app.get("/api/amazon/search", async (req, res) => {
    try {
      const { q, keywords, category, minPrice, maxPrice, brand, limit, itemCount } = req.query;
      
      // Accept either 'q' or 'keywords' parameter
      const searchQuery = (keywords || q) as string;
      
      // Validate input
      if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.length < 2) {
        return res.status(400).json({ error: "Invalid search query" });
      }

      // Sanitize query length
      const sanitizedQuery = searchQuery.slice(0, 200);

      const { amazonAPI } = await import('./amazon-api');
      
      if (!amazonAPI.isConfigured()) {
        return res.status(503).json({ error: "Amazon API not configured" });
      }

      // Use itemCount or limit parameter, default to 10
      const count = itemCount || limit;
      
      const products = await amazonAPI.searchProducts({
        keywords: sanitizedQuery,
        category: category as string | undefined,
        minPrice: minPrice ? Math.max(0, parseFloat(minPrice as string)) : undefined,
        maxPrice: maxPrice ? Math.max(0, parseFloat(maxPrice as string)) : undefined,
        brand: brand as string | undefined,
        itemCount: count ? Math.min(10, Math.max(1, parseInt(count as string))) : 10,
      });

      res.json({ products });
    } catch (error: any) {
      console.error('Amazon search error:', error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  // GET /api/amazon/product/:asin - Get product details
  app.get("/api/amazon/product/:asin", async (req, res) => {
    try {
      // Validate ASIN format
      const asin = req.params.asin;
      if (!/^[A-Z0-9]{10}$/.test(asin)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const { amazonAPI } = await import('./amazon-api');
      
      if (!amazonAPI.isConfigured()) {
        return res.status(503).json({ error: "Amazon API not configured" });
      }

      const product = await amazonAPI.getProductDetails(asin);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      console.error('Amazon product fetch error:', error);
      res.status(500).json({ error: "Failed to fetch product details" });
    }
  });

  // POST /api/amazon/track-click - Track affiliate click for analytics
  app.post("/api/amazon/track-click", async (req, res) => {
    try {
      const { asin, source } = req.body;
      
      // Validate ASIN
      if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Track click analytics only if user is logged in
      if ((req as any).user?.claims?.sub || (req as any).user?.sub) {
        // TODO: implement activity tracking
        // await storage.createActivityEvent({
        //   userId: (req as any).user?.claims?.sub || (req as any).user?.sub,
        //   eventType: 'amazon_click',
        //   module: source || 'parts-ordering',
        //   metadata: { asin },
        // });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Track click error:', error);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // GET /api/amazon/affiliate-link/:asin - Generate affiliate link
  app.get("/api/amazon/affiliate-link/:asin", async (req, res) => {
    try {
      const asin = req.params.asin;
      
      // Validate ASIN format
      if (!/^[A-Z0-9]{10}$/.test(asin)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const { amazonAPI } = await import('./amazon-api');
      const link = amazonAPI.generateAffiliateLink(asin);
      
      res.json({ url: link });
    } catch (error: any) {
      console.error('Affiliate link generation error:', error);
      res.status(500).json({ error: "Failed to generate link" });
    }
  });

  // GET /api/smart-search - Intelligent federated search
  app.get("/api/smart-search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.json([]);
      }

      const searchQuery = q.toLowerCase();
      const results: any[] = [];

      // Search Amazon products (limit 5)
      try {
        const { amazonAPI } = await import('./amazon-api');
        if (amazonAPI.isConfigured()) {
          const products = await amazonAPI.searchProducts({
            keywords: q,
            itemCount: 5
          });
          
          results.push(...products.map(p => ({
            type: 'amazon',
            id: p.asin,
            title: p.title,
            description: p.brand || 'Available on Amazon',
            category: 'Equipment',
            price: p.price?.displayAmount,
            url: p.url,
            image: p.image,
          })));
        }
      } catch (error) {
        console.error('Amazon search failed:', error);
      }

      res.json(results.slice(0, 10));
    } catch (error: any) {
      console.error('Smart search error:', error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // GET /api/superstore/catalog - Batch-fetch all superstore categories efficiently
  app.get("/api/superstore/catalog", async (req, res) => {
    try {
      const { SUPERSTORE_TAXONOMY } = await import('@shared/superstore-taxonomy');
      const { amazonAPI } = await import('./amazon-api');
      
      // ALWAYS use fallback for now due to Amazon API eligibility requirements
      // Amazon requires 3 qualified sales before granting API access
      console.log('Superstore catalog: using fallback products (Amazon PAAPI requires 3 sales for eligibility)');
      const fallbackProducts = generateFallbackProducts();
      return res.json({ 
        categories: SUPERSTORE_TAXONOMY, 
        products: fallbackProducts,
        totalProducts: Object.values(fallbackProducts).flat().length,
        totalCategories: SUPERSTORE_TAXONOMY.length,
        isFallback: true
      });

      // Batch all category searches with concurrency limit
      const CONCURRENT_LIMIT = 5;
      const productsByCategory: Record<string, any[]> = {};
      let hasApiErrors = false;
      
      for (let i = 0; i < SUPERSTORE_TAXONOMY.length; i += CONCURRENT_LIMIT) {
        const batch = SUPERSTORE_TAXONOMY.slice(i, i + CONCURRENT_LIMIT);
        
        const batchPromises = batch.map(async (category) => {
          if (!category.amazonSearches[0]) return null;
          
          try {
            const products = await amazonAPI.searchProducts({
              keywords: category.amazonSearches[0],
              itemCount: 10
            });
            return { categoryId: category.id, products };
          } catch (error: any) {
            console.error(`Failed to fetch ${category.id}:`, error);
            hasApiErrors = true;
            return { categoryId: category.id, products: [] };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
          if (result) {
            productsByCategory[result.categoryId] = result.products;
          }
        });
      }

      // If all categories failed, use fallback
      const totalProducts = Object.values(productsByCategory).flat().length;
      if (totalProducts === 0 && hasApiErrors) {
        const fallbackProducts = generateFallbackProducts();
        return res.json({
          categories: SUPERSTORE_TAXONOMY,
          products: fallbackProducts,
          totalProducts: Object.values(fallbackProducts).flat().length,
          totalCategories: SUPERSTORE_TAXONOMY.length,
          isFallback: true
        });
      }

      res.json({
        categories: SUPERSTORE_TAXONOMY,
        products: productsByCategory,
        totalProducts,
        totalCategories: SUPERSTORE_TAXONOMY.length,
        isFallback: false
      });
    } catch (error: any) {
      console.error('Superstore catalog error:', error);
      const { SUPERSTORE_TAXONOMY } = await import('@shared/superstore-taxonomy');
      const fallbackProducts = generateFallbackProducts();
      res.json({
        categories: SUPERSTORE_TAXONOMY,
        products: fallbackProducts,
        totalProducts: Object.values(fallbackProducts).flat().length,
        totalCategories: SUPERSTORE_TAXONOMY.length,
        isFallback: true
      });
    }
  });

  // Helper: Generate comprehensive product catalog (150+ products across 17 categories)
  function generateFallbackProducts(): Record<string, any[]> {
    return {
      washers: [
        { asin: 'B0BXYZ123', title: 'Speed Queen FF7 Commercial Front Load Washer 20lb Capacity', brand: 'Speed Queen', price: { displayAmount: '$2,999', amount: 2999 }, rating: 4.8, url: 'https://www.amazon.com/s?k=speed+queen+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0CXYZ124', title: 'Maytag MAF35 Commercial Front Load Washer 3.5 Cu Ft', brand: 'Maytag', price: { displayAmount: '$1,899', amount: 1899 }, rating: 4.7, url: 'https://www.amazon.com/s?k=maytag+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0DXYZ125', title: 'Huebsch HC20 Heavy Duty Commercial Washer 20lb', brand: 'Huebsch', price: { displayAmount: '$2,799', amount: 2799 }, rating: 4.6, url: 'https://www.amazon.com/s?k=huebsch+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0EXYZ126', title: 'Speed Queen SC18 Top Load Commercial Washer', brand: 'Speed Queen', price: { displayAmount: '$1,699', amount: 1699 }, rating: 4.5, url: 'https://www.amazon.com/s?k=speed+queen+top+load&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0FXYZ127', title: 'Continental Girbau EC20 Coin-Op Washer 20lb', brand: 'Continental', price: { displayAmount: '$3,299', amount: 3299 }, rating: 4.7, url: 'https://www.amazon.com/s?k=continental+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0GXYZ128', title: 'Dexter T-300 Front Load Washer 20lb Commercial', brand: 'Dexter', price: { displayAmount: '$2,599', amount: 2599 }, rating: 4.6, url: 'https://www.amazon.com/s?k=dexter+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0HXYZ129', title: 'Electrolux Professional WH6-14 Washer 40lb', brand: 'Electrolux', price: { displayAmount: '$4,999', amount: 4999 }, rating: 4.8, url: 'https://www.amazon.com/s?k=electrolux+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0IXYZ130', title: 'Milnor 30015 Front Load Washer 30lb Heavy Duty', brand: 'Milnor', price: { displayAmount: '$5,499', amount: 5499 }, rating: 4.9, url: 'https://www.amazon.com/s?k=milnor+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0JXYZ131', title: 'UniMac UC20 Commercial Washer 20lb Coin-Op', brand: 'UniMac', price: { displayAmount: '$2,899', amount: 2899 }, rating: 4.7, url: 'https://www.amazon.com/s?k=unimac+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' },
        { asin: 'B0KXYZ132', title: 'Wascomat W620 Front Load Washer 18lb Commercial', brand: 'Wascomat', price: { displayAmount: '$2,999', amount: 2999 }, rating: 4.6, url: 'https://www.amazon.com/s?k=wascomat+commercial+washer&tag=nicholaskreme-20', image: null, category: 'washers', categoryName: 'Commercial Washers' }
      ],
      dryers: [
        { asin: 'B0LXYZ201', title: 'Speed Queen DF7 Commercial Dryer 30lb Capacity', brand: 'Speed Queen', price: { displayAmount: '$2,799', amount: 2799 }, rating: 4.9, url: 'https://www.amazon.com/s?k=speed+queen+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0MXYZ202', title: 'Huebsch Stack Dryer Commercial 30lb Stacked', brand: 'Huebsch', price: { displayAmount: '$3,199', amount: 3199 }, rating: 4.7, url: 'https://www.amazon.com/s?k=huebsch+stack+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0NXYZ203', title: 'Maytag MDE20 Commercial Dryer 6.5 Cu Ft', brand: 'Maytag', price: { displayAmount: '$1,799', amount: 1799 }, rating: 4.6, url: 'https://www.amazon.com/s?k=maytag+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0OXYZ204', title: 'Continental Girbau ED45 Electric Dryer 45lb', brand: 'Continental', price: { displayAmount: '$3,499', amount: 3499 }, rating: 4.8, url: 'https://www.amazon.com/s?k=continental+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0PXYZ205', title: 'Dexter T-300 Commercial Dryer 30lb Coin-Op', brand: 'Dexter', price: { displayAmount: '$2,599', amount: 2599 }, rating: 4.7, url: 'https://www.amazon.com/s?k=dexter+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0QXYZ206', title: 'Electrolux T5350 Dryer 55lb Commercial Gas', brand: 'Electrolux', price: { displayAmount: '$5,299', amount: 5299 }, rating: 4.9, url: 'https://www.amazon.com/s?k=electrolux+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0RXYZ207', title: 'UniMac UD30 Commercial Dryer 30lb Reversing', brand: 'UniMac', price: { displayAmount: '$2,999', amount: 2999 }, rating: 4.6, url: 'https://www.amazon.com/s?k=unimac+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0SXYZ208', title: 'ADC AD-30 Dryer 30lb Commercial Coin Operated', brand: 'ADC', price: { displayAmount: '$2,399', amount: 2399 }, rating: 4.5, url: 'https://www.amazon.com/s?k=adc+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0TXYZ209', title: 'Wascomat TD30 Commercial Dryer 30lb Electric', brand: 'Wascomat', price: { displayAmount: '$3,099', amount: 3099 }, rating: 4.7, url: 'https://www.amazon.com/s?k=wascomat+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' },
        { asin: 'B0UXYZ210', title: 'Ipso DR45 Commercial Dryer 45lb Reversing Drum', brand: 'Ipso', price: { displayAmount: '$3,899', amount: 3899 }, rating: 4.8, url: 'https://www.amazon.com/s?k=ipso+commercial+dryer&tag=nicholaskreme-20', image: null, category: 'dryers', categoryName: 'Commercial Dryers' }
      ],
      'folding-tables': [
        { asin: 'B0VXYZ301', title: 'Lifetime 8ft Commercial Folding Table Heavy Duty', brand: 'Lifetime', price: { displayAmount: '$249', amount: 249 }, rating: 4.6, url: 'https://www.amazon.com/s?k=commercial+folding+table&tag=nicholaskreme-20', image: null, category: 'folding-tables', categoryName: 'Folding Tables & Workstations' },
        { asin: 'B0WXYZ302', title: 'Flash Furniture 6ft Folding Table Commercial Grade', brand: 'Flash Furniture', price: { displayAmount: '$189', amount: 189 }, rating: 4.5, url: 'https://www.amazon.com/s?k=flash+furniture+folding+table&tag=nicholaskreme-20', image: null, category: 'folding-tables', categoryName: 'Folding Tables & Workstations' },
        { asin: 'B0XXYZ303', title: 'National Public Seating BT3000 Folding Table 96"', brand: 'National Public', price: { displayAmount: '$329', amount: 329 }, rating: 4.7, url: 'https://www.amazon.com/s?k=national+public+folding+table&tag=nicholaskreme-20', image: null, category: 'folding-tables', categoryName: 'Folding Tables & Workstations' },
        { asin: 'B0YXYZ304', title: 'Midwest Folding Table 72x30 Steel Frame Commercial', brand: 'Midwest', price: { displayAmount: '$279', amount: 279 }, rating: 4.6, url: 'https://www.amazon.com/s?k=midwest+folding+table&tag=nicholaskreme-20', image: null, category: 'folding-tables', categoryName: 'Folding Tables & Workstations' },
        { asin: 'B0ZXYZ305', title: 'Correll CFA3096 Folding Table 30x96 Heavy Duty', brand: 'Correll', price: { displayAmount: '$299', amount: 299 }, rating: 4.8, url: 'https://www.amazon.com/s?k=correll+folding+table&tag=nicholaskreme-20', image: null, category: 'folding-tables', categoryName: 'Folding Tables & Workstations' }
      ],
      seating: [
        { asin: 'B1AXYZ401', title: 'Flash Furniture Waiting Room Chairs Set of 3', brand: 'Flash Furniture', price: { displayAmount: '$199', amount: 199 }, rating: 4.5, url: 'https://www.amazon.com/s?k=waiting+room+chairs&tag=nicholaskreme-20', image: null, category: 'seating', categoryName: 'Seating & Furniture' },
        { asin: 'B1BXYZ402', title: 'National Public Seating 1200 Series Stack Chairs 4pk', brand: 'National Public', price: { displayAmount: '$249', amount: 249 }, rating: 4.6, url: 'https://www.amazon.com/s?k=stackable+chairs+commercial&tag=nicholaskreme-20', image: null, category: 'seating', categoryName: 'Seating & Furniture' },
        { asin: 'B1CXYZ403', title: 'HON Ignition Mesh Chair Commercial Grade Office', brand: 'HON', price: { displayAmount: '$329', amount: 329 }, rating: 4.7, url: 'https://www.amazon.com/s?k=hon+office+chair&tag=nicholaskreme-20', image: null, category: 'seating', categoryName: 'Seating & Furniture' },
        { asin: 'B1DXYZ404', title: 'Virco 3000 Series Bench Seating 6ft Commercial', brand: 'Virco', price: { displayAmount: '$399', amount: 399 }, rating: 4.5, url: 'https://www.amazon.com/s?k=virco+bench&tag=nicholaskreme-20', image: null, category: 'seating', categoryName: 'Seating & Furniture' },
        { asin: 'B1EXYZ405', title: 'Boss Office Products Lobby Chair Heavy Duty', brand: 'Boss', price: { displayAmount: '$179', amount: 179 }, rating: 4.4, url: 'https://www.amazon.com/s?k=lobby+chairs+commercial&tag=nicholaskreme-20', image: null, category: 'seating', categoryName: 'Seating & Furniture' }
      ],
      carts: [
        { asin: 'B1FXYZ501', title: 'R&B Wire 200F Commercial Laundry Cart 6 Bushel', brand: 'R&B Wire', price: { displayAmount: '$189', amount: 189 }, rating: 4.8, url: 'https://www.amazon.com/s?k=rb+wire+laundry+cart&tag=nicholaskreme-20', image: null, category: 'carts', categoryName: 'Laundry Carts' },
        { asin: 'B1GXYZ502', title: 'R&B Wire 406S Rolling Basket Truck 8 Bushel', brand: 'R&B Wire', price: { displayAmount: '$249', amount: 249 }, rating: 4.7, url: 'https://www.amazon.com/s?k=rb+wire+rolling+basket&tag=nicholaskreme-20', image: null, category: 'carts', categoryName: 'Laundry Carts' },
        { asin: 'B1HXYZ503', title: 'Rubbermaid Commercial Heavy Duty Platform Cart', brand: 'Rubbermaid', price: { displayAmount: '$159', amount: 159 }, rating: 4.6, url: 'https://www.amazon.com/s?k=rubbermaid+platform+cart&tag=nicholaskreme-20', image: null, category: 'carts', categoryName: 'Laundry Carts' },
        { asin: 'B1IXYZ504', title: 'Seville Classics 3-Bag Laundry Sorter Cart Commercial', brand: 'Seville Classics', price: { displayAmount: '$129', amount: 129 }, rating: 4.5, url: 'https://www.amazon.com/s?k=seville+laundry+cart&tag=nicholaskreme-20', image: null, category: 'carts', categoryName: 'Laundry Carts' },
        { asin: 'B1JXYZ505', title: 'Luxor Industrial Strength Utility Cart 400lb Capacity', brand: 'Luxor', price: { displayAmount: '$179', amount: 179 }, rating: 4.7, url: 'https://www.amazon.com/s?k=luxor+utility+cart&tag=nicholaskreme-20', image: null, category: 'carts', categoryName: 'Laundry Carts' },
        { asin: 'B1KXYZ506', title: 'Steele Canvas 8 Bushel Rolling Laundry Basket', brand: 'Steele Canvas', price: { displayAmount: '$219', amount: 219 }, rating: 4.8, url: 'https://www.amazon.com/s?k=steele+canvas+laundry+basket&tag=nicholaskreme-20', image: null, category: 'carts', categoryName: 'Laundry Carts' },
        { asin: 'B1LXYZ507', title: 'CSL Foodservice Bellman Cart Heavy Duty 500lb', brand: 'CSL', price: { displayAmount: '$299', amount: 299 }, rating: 4.6, url: 'https://www.amazon.com/s?k=bellman+cart&tag=nicholaskreme-20', image: null, category: 'carts', categoryName: 'Laundry Carts' },
        { asin: 'B1MXYZ508', title: 'Alera 2-Shelf Rolling Cart Commercial Wire', brand: 'Alera', price: { displayAmount: '$99', amount: 99 }, rating: 4.4, url: 'https://www.amazon.com/s?k=alera+rolling+cart&tag=nicholaskreme-20', image: null, category: 'carts', categoryName: 'Laundry Carts' }
      ],
      supplies: [
        { asin: 'B1NXYZ601', title: 'Tide Professional Liquid Detergent 5 Gallon Pail', brand: 'Tide', price: { displayAmount: '$89.99', amount: 89.99 }, rating: 4.9, url: 'https://www.amazon.com/s?k=tide+commercial+detergent&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1OXYZ602', title: 'Gain Professional Powder Detergent 160 Load Bucket', brand: 'Gain', price: { displayAmount: '$59.99', amount: 59.99 }, rating: 4.7, url: 'https://www.amazon.com/s?k=gain+commercial+detergent&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1PXYZ603', title: 'Bounce Commercial Dryer Sheets 1000 Count Box', brand: 'Bounce', price: { displayAmount: '$34.99', amount: 34.99 }, rating: 4.7, url: 'https://www.amazon.com/s?k=bounce+dryer+sheets&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1QXYZ604', title: 'Downy Professional Fabric Softener 5 Gallon', brand: 'Downy', price: { displayAmount: '$79.99', amount: 79.99 }, rating: 4.8, url: 'https://www.amazon.com/s?k=downy+commercial&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1RXYZ605', title: 'Clorox Commercial Bleach 96oz Case of 6', brand: 'Clorox', price: { displayAmount: '$29.99', amount: 29.99 }, rating: 4.9, url: 'https://www.amazon.com/s?k=clorox+commercial+bleach&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1SXYZ606', title: 'Shout Commercial Stain Remover Gallon Refill', brand: 'Shout', price: { displayAmount: '$24.99', amount: 24.99 }, rating: 4.6, url: 'https://www.amazon.com/s?k=shout+stain+remover&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1TXYZ607', title: 'Glad Commercial Trash Bags 55 Gallon 100 Count', brand: 'Glad', price: { displayAmount: '$44.99', amount: 44.99 }, rating: 4.7, url: 'https://www.amazon.com/s?k=glad+commercial+trash+bags&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1UXYZ608', title: 'Febreze Professional Air Freshener 32oz Spray 4pk', brand: 'Febreze', price: { displayAmount: '$39.99', amount: 39.99 }, rating: 4.5, url: 'https://www.amazon.com/s?k=febreze+commercial&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1VXYZ609', title: 'Lysol Commercial Disinfectant Spray Case of 12', brand: 'Lysol', price: { displayAmount: '$49.99', amount: 49.99 }, rating: 4.8, url: 'https://www.amazon.com/s?k=lysol+commercial&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1WXYZ610', title: 'OxiClean Versatile Stain Remover 25lb Bucket', brand: 'OxiClean', price: { displayAmount: '$54.99', amount: 54.99 }, rating: 4.7, url: 'https://www.amazon.com/s?k=oxiclean+commercial&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1XXYZ611', title: 'Purex Liquid Detergent 300oz Commercial Jug', brand: 'Purex', price: { displayAmount: '$39.99', amount: 39.99 }, rating: 4.5, url: 'https://www.amazon.com/s?k=purex+commercial&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1YXYZ612', title: 'All Professional Free Clear Detergent 5 Gallon', brand: 'All', price: { displayAmount: '$69.99', amount: 69.99 }, rating: 4.6, url: 'https://www.amazon.com/s?k=all+commercial+detergent&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B1ZXYZ613', title: 'Snuggle Professional Fabric Softener 160oz Bottle', brand: 'Snuggle', price: { displayAmount: '$29.99', amount: 29.99 }, rating: 4.4, url: 'https://www.amazon.com/s?k=snuggle+commercial&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B2AXYZ614', title: 'Arm & Hammer Laundry Detergent 10lb Bucket', brand: 'Arm & Hammer', price: { displayAmount: '$44.99', amount: 44.99 }, rating: 4.7, url: 'https://www.amazon.com/s?k=arm+hammer+commercial&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' },
        { asin: 'B2BXYZ615', title: 'Seventh Generation Free Clear Detergent Commercial', brand: 'Seventh Generation', price: { displayAmount: '$64.99', amount: 64.99 }, rating: 4.8, url: 'https://www.amazon.com/s?k=seventh+generation+commercial&tag=nicholaskreme-20', image: null, category: 'supplies', categoryName: 'Laundry Supplies' }
      ],
      hvac: [
        { asin: 'B2CXYZ701', title: 'LG 12000 BTU Portable Air Conditioner Commercial', brand: 'LG', price: { displayAmount: '$499', amount: 499 }, rating: 4.5, url: 'https://www.amazon.com/s?k=lg+portable+air+conditioner&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2DXYZ702', title: 'Honeywell 14000 BTU Dual Hose AC Commercial Grade', brand: 'Honeywell', price: { displayAmount: '$599', amount: 599 }, rating: 4.6, url: 'https://www.amazon.com/s?k=honeywell+portable+ac&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2EXYZ703', title: 'Elkay EZH2O Water Bottle Filling Station Commercial', brand: 'Elkay', price: { displayAmount: '$899', amount: 899 }, rating: 4.8, url: 'https://www.amazon.com/s?k=elkay+water+fountain&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2FXYZ704', title: 'Avalon A5 Bottleless Water Cooler Dispenser', brand: 'Avalon', price: { displayAmount: '$449', amount: 449 }, rating: 4.7, url: 'https://www.amazon.com/s?k=avalon+water+cooler&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2GXYZ705', title: 'Lasko 30" Commercial Grade Oscillating Fan', brand: 'Lasko', price: { displayAmount: '$149', amount: 149 }, rating: 4.5, url: 'https://www.amazon.com/s?k=lasko+commercial+fan&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2HXYZ706', title: 'Air King 9720 Commercial Grade Exhaust Fan 20"', brand: 'Air King', price: { displayAmount: '$229', amount: 229 }, rating: 4.6, url: 'https://www.amazon.com/s?k=air+king+exhaust+fan&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2IXYZ707', title: 'Big Ass Fans Haiku Commercial Ceiling Fan 7ft', brand: 'Big Ass Fans', price: { displayAmount: '$1,299', amount: 1299 }, rating: 4.9, url: 'https://www.amazon.com/s?k=big+ass+fans&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2JXYZ708', title: 'Whirlpool 8000 BTU Window AC Commercial Unit', brand: 'Whirlpool', price: { displayAmount: '$349', amount: 349 }, rating: 4.4, url: 'https://www.amazon.com/s?k=whirlpool+window+ac&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2KXYZ709', title: 'Vornado 783 Commercial Air Circulator Full-Size', brand: 'Vornado', price: { displayAmount: '$199', amount: 199 }, rating: 4.7, url: 'https://www.amazon.com/s?k=vornado+commercial+fan&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' },
        { asin: 'B2LXYZ710', title: 'Frigidaire 18000 BTU Smart AC Commercial Wifi', brand: 'Frigidaire', price: { displayAmount: '$699', amount: 699 }, rating: 4.5, url: 'https://www.amazon.com/s?k=frigidaire+smart+ac&tag=nicholaskreme-20', image: null, category: 'hvac', categoryName: 'HVAC & Climate Control' }
      ],
      'dog-wash': [
        { asin: 'B2MXYZ801', title: 'Flying Pig Dog Bath Tub Professional Stainless Steel', brand: 'Flying Pig', price: { displayAmount: '$899', amount: 899 }, rating: 4.7, url: 'https://www.amazon.com/s?k=dog+grooming+tub&tag=nicholaskreme-20', image: null, category: 'dog-wash', categoryName: 'Dog Wash Stations' },
        { asin: 'B2NXYZ802', title: 'Master Equipment Stainless Steel Dog Bathing Tub', brand: 'Master Equipment', price: { displayAmount: '$799', amount: 799 }, rating: 4.6, url: 'https://www.amazon.com/s?k=master+equipment+dog+tub&tag=nicholaskreme-20', image: null, category: 'dog-wash', categoryName: 'Dog Wash Stations' },
        { asin: 'B2OXYZ803', title: 'Shernbao Elevated Dog Bath Station Professional', brand: 'Shernbao', price: { displayAmount: '$1,099', amount: 1099 }, rating: 4.8, url: 'https://www.amazon.com/s?k=shernbao+dog+bath&tag=nicholaskreme-20', image: null, category: 'dog-wash', categoryName: 'Dog Wash Stations' },
        { asin: 'B2PXYZ804', title: 'Scrub-A-Dub Walk-In Dog Wash Station Self-Service', brand: 'Scrub-A-Dub', price: { displayAmount: '$1,499', amount: 1499 }, rating: 4.5, url: 'https://www.amazon.com/s?k=self+service+dog+wash&tag=nicholaskreme-20', image: null, category: 'dog-wash', categoryName: 'Dog Wash Stations' },
        { asin: 'B2QXYZ805', title: 'K9 Shower Dog Washing System Complete Commercial Kit', brand: 'K9 Shower', price: { displayAmount: '$699', amount: 699 }, rating: 4.4, url: 'https://www.amazon.com/s?k=k9+shower+system&tag=nicholaskreme-20', image: null, category: 'dog-wash', categoryName: 'Dog Wash Stations' }
      ],
      'car-wash': [
        { asin: 'B2RXYZ901', title: 'JE Adams SuperVac Coin-Op Car Vacuum Commercial', brand: 'JE Adams', price: { displayAmount: '$2,999', amount: 2999 }, rating: 4.7, url: 'https://www.amazon.com/s?k=coin+car+vacuum&tag=nicholaskreme-20', image: null, category: 'car-wash', categoryName: 'Car Wash Supplies' },
        { asin: 'B2SXYZ902', title: 'Shop-Vac 16 Gallon Commercial Wet Dry Vacuum', brand: 'Shop-Vac', price: { displayAmount: '$249', amount: 249 }, rating: 4.6, url: 'https://www.amazon.com/s?k=shop+vac+commercial&tag=nicholaskreme-20', image: null, category: 'car-wash', categoryName: 'Car Wash Supplies' },
        { asin: 'B2TXYZ903', title: 'Armor All Car Wash Soap 5 Gallon Commercial', brand: 'Armor All', price: { displayAmount: '$89.99', amount: 89.99 }, rating: 4.5, url: 'https://www.amazon.com/s?k=car+wash+soap+bulk&tag=nicholaskreme-20', image: null, category: 'car-wash', categoryName: 'Car Wash Supplies' },
        { asin: 'B2UXYZ904', title: 'Chemical Guys Detailing Supplies Professional Kit', brand: 'Chemical Guys', price: { displayAmount: '$199', amount: 199 }, rating: 4.8, url: 'https://www.amazon.com/s?k=chemical+guys+professional&tag=nicholaskreme-20', image: null, category: 'car-wash', categoryName: 'Car Wash Supplies' },
        { asin: 'B2VXYZ905', title: 'Metro Air Force Master Blaster Car Dryer Commercial', brand: 'Metro', price: { displayAmount: '$349', amount: 349 }, rating: 4.7, url: 'https://www.amazon.com/s?k=metro+air+force+blaster&tag=nicholaskreme-20', image: null, category: 'car-wash', categoryName: 'Car Wash Supplies' }
      ],
      'coin-changers': [
        { asin: 'B2WXYZ1001', title: 'Standard Change-Makers SC83 Bill Changer', brand: 'Standard Change-Makers', price: { displayAmount: '$1,899', amount: 1899 }, rating: 4.6, url: 'https://www.amazon.com/s?k=bill+changer+machine&tag=nicholaskreme-20', image: null, category: 'coin-changers', categoryName: 'Coin Changers & Payment' },
        { asin: 'B2XXYZ1002', title: 'Hamilton QC4 Coin Changer Commercial Grade', brand: 'Hamilton', price: { displayAmount: '$2,299', amount: 2299 }, rating: 4.7, url: 'https://www.amazon.com/s?k=hamilton+coin+changer&tag=nicholaskreme-20', image: null, category: 'coin-changers', categoryName: 'Coin Changers & Payment' },
        { asin: 'B2YXYZ1003', title: 'Rowe BC-1400 Bill Changer Coin Operated', brand: 'Rowe', price: { displayAmount: '$1,799', amount: 1799 }, rating: 4.5, url: 'https://www.amazon.com/s?k=rowe+bill+changer&tag=nicholaskreme-20', image: null, category: 'coin-changers', categoryName: 'Coin Changers & Payment' },
        { asin: 'B2ZXYZ1004', title: 'APEX 7600 Series Change Machine Commercial', brand: 'APEX', price: { displayAmount: '$1,999', amount: 1999 }, rating: 4.6, url: 'https://www.amazon.com/s?k=apex+change+machine&tag=nicholaskreme-20', image: null, category: 'coin-changers', categoryName: 'Coin Changers & Payment' },
        { asin: 'B3AXYZ1005', title: 'American Changer AC1002 Coin Dispenser', brand: 'American Changer', price: { displayAmount: '$1,599', amount: 1599 }, rating: 4.4, url: 'https://www.amazon.com/s?k=american+changer&tag=nicholaskreme-20', image: null, category: 'coin-changers', categoryName: 'Coin Changers & Payment' }
      ],
      vending: [
        { asin: 'B3BXYZ1101', title: 'Seaga SM16SB Combo Vending Machine Snacks Drinks', brand: 'Seaga', price: { displayAmount: '$3,499', amount: 3499 }, rating: 4.5, url: 'https://www.amazon.com/s?k=seaga+vending+machine&tag=nicholaskreme-20', image: null, category: 'vending', categoryName: 'Vending Machines' },
        { asin: 'B3CXYZ1102', title: 'Crane Merchant Media 6 Drink Vending Machine', brand: 'Crane', price: { displayAmount: '$2,999', amount: 2999 }, rating: 4.6, url: 'https://www.amazon.com/s?k=crane+vending+machine&tag=nicholaskreme-20', image: null, category: 'vending', categoryName: 'Vending Machines' },
        { asin: 'B3DXYZ1103', title: 'Automatic Products LCM3 Snack Vending Machine', brand: 'Automatic Products', price: { displayAmount: '$3,299', amount: 3299 }, rating: 4.7, url: 'https://www.amazon.com/s?k=automatic+products+vending&tag=nicholaskreme-20', image: null, category: 'vending', categoryName: 'Vending Machines' },
        { asin: 'B3EXYZ1104', title: 'Royal Vendors RVV 500 Soda Vending Machine', brand: 'Royal Vendors', price: { displayAmount: '$2,799', amount: 2799 }, rating: 4.5, url: 'https://www.amazon.com/s?k=royal+vendors+soda&tag=nicholaskreme-20', image: null, category: 'vending', categoryName: 'Vending Machines' },
        { asin: 'B3FXYZ1105', title: 'Vendnet SnackShop Max Healthy Vending Machine', brand: 'Vendnet', price: { displayAmount: '$3,799', amount: 3799 }, rating: 4.6, url: 'https://www.amazon.com/s?k=healthy+vending+machine&tag=nicholaskreme-20', image: null, category: 'vending', categoryName: 'Vending Machines' },
        { asin: 'B3GXYZ1106', title: 'Fas Mini 5 Compact Snack Vending Machine', brand: 'Fas', price: { displayAmount: '$1,999', amount: 1999 }, rating: 4.4, url: 'https://www.amazon.com/s?k=fas+vending+machine&tag=nicholaskreme-20', image: null, category: 'vending', categoryName: 'Vending Machines' },
        { asin: 'B3HXYZ1107', title: 'Triple Laundry Soap Dispenser Commercial Vend', brand: 'Triple', price: { displayAmount: '$899', amount: 899 }, rating: 4.5, url: 'https://www.amazon.com/s?k=soap+vending+machine&tag=nicholaskreme-20', image: null, category: 'vending', categoryName: 'Vending Machines' },
        { asin: 'B3IXYZ1108', title: 'Northwestern Super 60 Candy Vending Machine Bank', brand: 'Northwestern', price: { displayAmount: '$599', amount: 599 }, rating: 4.6, url: 'https://www.amazon.com/s?k=candy+vending+machine&tag=nicholaskreme-20', image: null, category: 'vending', categoryName: 'Vending Machines' }
      ],
      arcade: [
        { asin: 'B3JXYZ1201', title: 'Stern Pinball Machine Full Size Commercial Coin-Op', brand: 'Stern', price: { displayAmount: '$5,999', amount: 5999 }, rating: 4.8, url: 'https://www.amazon.com/s?k=stern+pinball+machine&tag=nicholaskreme-20', image: null, category: 'arcade', categoryName: 'Arcade & Entertainment' },
        { asin: 'B3KXYZ1202', title: 'SmartIndustries Premium Claw Machine Commercial', brand: 'SmartIndustries', price: { displayAmount: '$1,299', amount: 1299 }, rating: 4.4, url: 'https://www.amazon.com/s?k=claw+machine+commercial&tag=nicholaskreme-20', image: null, category: 'arcade', categoryName: 'Arcade & Entertainment' },
        { asin: 'B3LXYZ1203', title: '1Up Arcade Cabinet Multi-Game Commercial Grade', brand: '1Up Arcade', price: { displayAmount: '$2,499', amount: 2499 }, rating: 4.6, url: 'https://www.amazon.com/s?k=1up+arcade+cabinet&tag=nicholaskreme-20', image: null, category: 'arcade', categoryName: 'Arcade & Entertainment' },
        { asin: 'B3MXYZ1204', title: 'Raw Thrills Big Buck Hunter Arcade Game', brand: 'Raw Thrills', price: { displayAmount: '$4,999', amount: 4999 }, rating: 4.7, url: 'https://www.amazon.com/s?k=raw+thrills+arcade&tag=nicholaskreme-20', image: null, category: 'arcade', categoryName: 'Arcade & Entertainment' },
        { asin: 'B3NXYZ1205', title: 'Namco Pac-Man Battle Royale Arcade Machine', brand: 'Namco', price: { displayAmount: '$3,999', amount: 3999 }, rating: 4.8, url: 'https://www.amazon.com/s?k=namco+pacman+arcade&tag=nicholaskreme-20', image: null, category: 'arcade', categoryName: 'Arcade & Entertainment' },
        { asin: 'B3OXYZ1206', title: 'Sega Racing Arcade Game Full Motion Simulator', brand: 'Sega', price: { displayAmount: '$8,999', amount: 8999 }, rating: 4.9, url: 'https://www.amazon.com/s?k=sega+racing+arcade&tag=nicholaskreme-20', image: null, category: 'arcade', categoryName: 'Arcade & Entertainment' },
        { asin: 'B3PXYZ1207', title: 'ICE Air Hockey Table Commercial Grade Coin-Op', brand: 'ICE', price: { displayAmount: '$3,499', amount: 3499 }, rating: 4.6, url: 'https://www.amazon.com/s?k=ice+air+hockey+commercial&tag=nicholaskreme-20', image: null, category: 'arcade', categoryName: 'Arcade & Entertainment' },
        { asin: 'B3QXYZ1208', title: 'Valley Dynamo Pool Table Commercial Coin Operated', brand: 'Valley Dynamo', price: { displayAmount: '$2,999', amount: 2999 }, rating: 4.5, url: 'https://www.amazon.com/s?k=valley+dynamo+pool+table&tag=nicholaskreme-20', image: null, category: 'arcade', categoryName: 'Arcade & Entertainment' }
      ],
      parts: [
        { asin: 'B3RXYZ1301', title: 'Universal Washer Drive Motor 1/2 HP Commercial', brand: 'Universal', price: { displayAmount: '$149', amount: 149 }, rating: 4.5, url: 'https://www.amazon.com/s?k=washer+motor+replacement&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B3SXYZ1302', title: 'Speed Queen Belt Kit Commercial Washer 27"', brand: 'Speed Queen', price: { displayAmount: '$39.99', amount: 39.99 }, rating: 4.7, url: 'https://www.amazon.com/s?k=speed+queen+belt&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B3TXYZ1303', title: 'Maytag Commercial Dryer Heating Element Replacement', brand: 'Maytag', price: { displayAmount: '$89.99', amount: 89.99 }, rating: 4.6, url: 'https://www.amazon.com/s?k=maytag+heating+element&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B3UXYZ1304', title: 'Water Inlet Valve Solenoid Commercial Washer Universal', brand: 'Universal', price: { displayAmount: '$29.99', amount: 29.99 }, rating: 4.4, url: 'https://www.amazon.com/s?k=water+inlet+valve&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B3VXYZ1305', title: 'Drain Pump for Commercial Washers Heavy Duty', brand: 'Universal', price: { displayAmount: '$49.99', amount: 49.99 }, rating: 4.5, url: 'https://www.amazon.com/s?k=washer+drain+pump&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B3WXYZ1306', title: 'Idler Pulley Kit Commercial Dryer Replacement', brand: 'Universal', price: { displayAmount: '$24.99', amount: 24.99 }, rating: 4.6, url: 'https://www.amazon.com/s?k=dryer+idler+pulley&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B3XXYZ1307', title: 'Commercial Washer Control Board Timer Assembly', brand: 'Universal', price: { displayAmount: '$129', amount: 129 }, rating: 4.4, url: 'https://www.amazon.com/s?k=washer+control+board&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B3YXYZ1308', title: 'Door Lock Latch Assembly Commercial Front Load Washer', brand: 'Universal', price: { displayAmount: '$44.99', amount: 44.99 }, rating: 4.5, url: 'https://www.amazon.com/s?k=washer+door+lock&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B3ZXYZ1309', title: 'Dryer Drum Support Roller Wheel Set Commercial', brand: 'Universal', price: { displayAmount: '$34.99', amount: 34.99 }, rating: 4.7, url: 'https://www.amazon.com/s?k=dryer+drum+roller&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' },
        { asin: 'B4AXYZ1310', title: 'Commercial Washer Shock Absorber Suspension Kit', brand: 'Universal', price: { displayAmount: '$59.99', amount: 59.99 }, rating: 4.6, url: 'https://www.amazon.com/s?k=washer+shock+absorber&tag=nicholaskreme-20', image: null, category: 'parts', categoryName: 'Parts & Repairs' }
      ],
      signage: [
        { asin: 'B4BXYZ1401', title: 'LED Open Sign Neon Effect Commercial Business', brand: 'Greenlight', price: { displayAmount: '$49.99', amount: 49.99 }, rating: 4.6, url: 'https://www.amazon.com/s?k=led+open+sign&tag=nicholaskreme-20', image: null, category: 'signage', categoryName: 'Signage & Lighting' },
        { asin: 'B4CXYZ1402', title: 'Outdoor LED Business Sign Programmable 48x24"', brand: 'VEVOR', price: { displayAmount: '$899', amount: 899 }, rating: 4.5, url: 'https://www.amazon.com/s?k=programmable+led+sign&tag=nicholaskreme-20', image: null, category: 'signage', categoryName: 'Signage & Lighting' },
        { asin: 'B4DXYZ1403', title: 'Commercial LED Ceiling Light Panel 2x4 Ft 40W', brand: 'Hyperikon', price: { displayAmount: '$79.99', amount: 79.99 }, rating: 4.7, url: 'https://www.amazon.com/s?k=hyperikon+led+panel&tag=nicholaskreme-20', image: null, category: 'signage', categoryName: 'Signage & Lighting' },
        { asin: 'B4EXYZ1404', title: 'Exit Sign Emergency Light Combo Commercial Code', brand: 'LFI Lights', price: { displayAmount: '$39.99', amount: 39.99 }, rating: 4.8, url: 'https://www.amazon.com/s?k=exit+sign+emergency+light&tag=nicholaskreme-20', image: null, category: 'signage', categoryName: 'Signage & Lighting' },
        { asin: 'B4FXYZ1405', title: 'LED Shop Light 8ft 110W Linkable Commercial Garage', brand: 'Barrina', price: { displayAmount: '$129', amount: 129 }, rating: 4.7, url: 'https://www.amazon.com/s?k=barrina+led+shop+light&tag=nicholaskreme-20', image: null, category: 'signage', categoryName: 'Signage & Lighting' }
      ],
      security: [
        { asin: 'B4GXYZ1501', title: 'Hikvision 8CH PoE Security Camera System 4K NVR', brand: 'Hikvision', price: { displayAmount: '$899', amount: 899 }, rating: 4.7, url: 'https://www.amazon.com/s?k=hikvision+security+system&tag=nicholaskreme-20', image: null, category: 'security', categoryName: 'Security Systems' },
        { asin: 'B4HXYZ1502', title: 'Reolink 4K PoE Camera System 8-Channel Commercial', brand: 'Reolink', price: { displayAmount: '$749', amount: 749 }, rating: 4.6, url: 'https://www.amazon.com/s?k=reolink+4k+camera&tag=nicholaskreme-20', image: null, category: 'security', categoryName: 'Security Systems' },
        { asin: 'B4IXYZ1503', title: 'Ring Alarm Pro 14-Piece Kit Commercial Security', brand: 'Ring', price: { displayAmount: '$499', amount: 499 }, rating: 4.5, url: 'https://www.amazon.com/s?k=ring+alarm+pro&tag=nicholaskreme-20', image: null, category: 'security', categoryName: 'Security Systems' },
        { asin: 'B4JXYZ1504', title: 'Arlo Pro 4 Wireless Security Camera System 6-Pack', brand: 'Arlo', price: { displayAmount: '$999', amount: 999 }, rating: 4.6, url: 'https://www.amazon.com/s?k=arlo+pro+4&tag=nicholaskreme-20', image: null, category: 'security', categoryName: 'Security Systems' },
        { asin: 'B4KXYZ1505', title: 'Lorex 4K Security Camera System 16CH Commercial', brand: 'Lorex', price: { displayAmount: '$1,299', amount: 1299 }, rating: 4.7, url: 'https://www.amazon.com/s?k=lorex+4k+system&tag=nicholaskreme-20', image: null, category: 'security', categoryName: 'Security Systems' },
        { asin: 'B4LXYZ1506', title: 'SimpliSafe Wireless Home Security System Commercial', brand: 'SimpliSafe', price: { displayAmount: '$399', amount: 399 }, rating: 4.4, url: 'https://www.amazon.com/s?k=simplisafe+commercial&tag=nicholaskreme-20', image: null, category: 'security', categoryName: 'Security Systems' },
        { asin: 'B4MXYZ1507', title: 'Swann 4K Security Camera System 8-Channel DVR', brand: 'Swann', price: { displayAmount: '$649', amount: 649 }, rating: 4.5, url: 'https://www.amazon.com/s?k=swann+4k+security&tag=nicholaskreme-20', image: null, category: 'security', categoryName: 'Security Systems' },
        { asin: 'B4NXYZ1508', title: 'Amcrest 4K Security System 16CH NVR Commercial Grade', brand: 'Amcrest', price: { displayAmount: '$1,099', amount: 1099 }, rating: 4.6, url: 'https://www.amazon.com/s?k=amcrest+4k+nvr&tag=nicholaskreme-20', image: null, category: 'security', categoryName: 'Security Systems' }
      ],
      cleaning: [
        { asin: 'B4OXYZ1601', title: 'Hoover Commercial WindTunnel Upright Vacuum C1660', brand: 'Hoover', price: { displayAmount: '$399', amount: 399 }, rating: 4.6, url: 'https://www.amazon.com/s?k=hoover+commercial+vacuum&tag=nicholaskreme-20', image: null, category: 'cleaning', categoryName: 'Cleaning Equipment' },
        { asin: 'B4PXYZ1602', title: 'ProTeam Super CoachVac Backpack Vacuum Commercial', brand: 'ProTeam', price: { displayAmount: '$549', amount: 549 }, rating: 4.7, url: 'https://www.amazon.com/s?k=proteam+backpack+vacuum&tag=nicholaskreme-20', image: null, category: 'cleaning', categoryName: 'Cleaning Equipment' },
        { asin: 'B4QXYZ1603', title: 'Rubbermaid WaveBrake Mop Bucket 35 Qt Commercial', brand: 'Rubbermaid', price: { displayAmount: '$129', amount: 129 }, rating: 4.5, url: 'https://www.amazon.com/s?k=rubbermaid+mop+bucket&tag=nicholaskreme-20', image: null, category: 'cleaning', categoryName: 'Cleaning Equipment' },
        { asin: 'B4RXYZ1604', title: 'Oreck Commercial XL Upright Vacuum Cleaner', brand: 'Oreck', price: { displayAmount: '$279', amount: 279 }, rating: 4.6, url: 'https://www.amazon.com/s?k=oreck+commercial+vacuum&tag=nicholaskreme-20', image: null, category: 'cleaning', categoryName: 'Cleaning Equipment' },
        { asin: 'B4SXYZ1605', title: 'Bissell BigGreen Commercial Floor Scrubber', brand: 'Bissell', price: { displayAmount: '$899', amount: 899 }, rating: 4.7, url: 'https://www.amazon.com/s?k=bissell+floor+scrubber&tag=nicholaskreme-20', image: null, category: 'cleaning', categoryName: 'Cleaning Equipment' },
        { asin: 'B4TXYZ1606', title: 'Sanitaire EON Commercial Vacuum HEPA Filter', brand: 'Sanitaire', price: { displayAmount: '$349', amount: 349 }, rating: 4.5, url: 'https://www.amazon.com/s?k=sanitaire+commercial+vacuum&tag=nicholaskreme-20', image: null, category: 'cleaning', categoryName: 'Cleaning Equipment' },
        { asin: 'B4UXYZ1607', title: 'Shark Navigator Lift-Away Professional Vacuum', brand: 'Shark', price: { displayAmount: '$199', amount: 199 }, rating: 4.6, url: 'https://www.amazon.com/s?k=shark+professional+vacuum&tag=nicholaskreme-20', image: null, category: 'cleaning', categoryName: 'Cleaning Equipment' },
        { asin: 'B4VXYZ1608', title: 'Tennant T300 Walk-Behind Floor Scrubber Commercial', brand: 'Tennant', price: { displayAmount: '$4,999', amount: 4999 }, rating: 4.8, url: 'https://www.amazon.com/s?k=tennant+floor+scrubber&tag=nicholaskreme-20', image: null, category: 'cleaning', categoryName: 'Cleaning Equipment' }
      ],
      pos: [
        { asin: 'B4WXYZ1701', title: 'Square Terminal All-in-One POS System Touchscreen', brand: 'Square', price: { displayAmount: '$299', amount: 299 }, rating: 4.7, url: 'https://www.amazon.com/s?k=square+terminal&tag=nicholaskreme-20', image: null, category: 'pos', categoryName: 'POS & Management' },
        { asin: 'B4XXYZ1702', title: 'Clover Station POS System Complete Business Solution', brand: 'Clover', price: { displayAmount: '$1,299', amount: 1299 }, rating: 4.6, url: 'https://www.amazon.com/s?k=clover+station+pos&tag=nicholaskreme-20', image: null, category: 'pos', categoryName: 'POS & Management' },
        { asin: 'B4YXYZ1703', title: 'Star Micronics TSP143IIIU USB Receipt Printer', brand: 'Star Micronics', price: { displayAmount: '$249', amount: 249 }, rating: 4.8, url: 'https://www.amazon.com/s?k=star+receipt+printer&tag=nicholaskreme-20', image: null, category: 'pos', categoryName: 'POS & Management' },
        { asin: 'B4ZXYZ1704', title: 'Epson TM-T88V Thermal Receipt Printer Commercial', brand: 'Epson', price: { displayAmount: '$299', amount: 299 }, rating: 4.7, url: 'https://www.amazon.com/s?k=epson+tm-t88v&tag=nicholaskreme-20', image: null, category: 'pos', categoryName: 'POS & Management' },
        { asin: 'B5AXYZ1705', title: 'APG Vasario Cash Drawer 16" Commercial Grade', brand: 'APG', price: { displayAmount: '$179', amount: 179 }, rating: 4.6, url: 'https://www.amazon.com/s?k=apg+cash+drawer&tag=nicholaskreme-20', image: null, category: 'pos', categoryName: 'POS & Management' }
      ],
      tools: [
        { asin: 'B5BXYZ1801', title: 'Appliance Repair Tool Kit Professional 120-Piece', brand: 'WORKPRO', price: { displayAmount: '$149', amount: 149 }, rating: 4.6, url: 'https://www.amazon.com/s?k=appliance+repair+tool+kit&tag=nicholaskreme-20', image: null, category: 'tools', categoryName: 'Tools & Maintenance' },
        { asin: 'B5CXYZ1802', title: 'Fluke 87V Digital Multimeter Industrial Commercial', brand: 'Fluke', price: { displayAmount: '$399', amount: 399 }, rating: 4.8, url: 'https://www.amazon.com/s?k=fluke+87v+multimeter&tag=nicholaskreme-20', image: null, category: 'tools', categoryName: 'Tools & Maintenance' },
        { asin: 'B5DXYZ1803', title: 'Klein Tools 32500 Multimeter Digital HVAC Clamp', brand: 'Klein Tools', price: { displayAmount: '$199', amount: 199 }, rating: 4.7, url: 'https://www.amazon.com/s?k=klein+multimeter&tag=nicholaskreme-20', image: null, category: 'tools', categoryName: 'Tools & Maintenance' },
        { asin: 'B5EXYZ1804', title: 'Milwaukee Tool Set M18 Cordless Combo Kit 9-Tool', brand: 'Milwaukee', price: { displayAmount: '$699', amount: 699 }, rating: 4.8, url: 'https://www.amazon.com/s?k=milwaukee+m18+combo&tag=nicholaskreme-20', image: null, category: 'tools', categoryName: 'Tools & Maintenance' },
        { asin: 'B5FXYZ1805', title: 'DeWalt 20V MAX Cordless Drill Combo Kit 10-Tool', brand: 'DeWalt', price: { displayAmount: '$599', amount: 599 }, rating: 4.7, url: 'https://www.amazon.com/s?k=dewalt+20v+combo+kit&tag=nicholaskreme-20', image: null, category: 'tools', categoryName: 'Tools & Maintenance' }
      ]
    };
  }

  // GET /api/superstore/product/:asin - Get individual product details
  app.get("/api/superstore/product/:asin", async (req, res) => {
    try {
      const { asin } = req.params;
      const fallbackProducts = generateFallbackProducts();
      
      // Search through all categories for the product
      for (const [category, products] of Object.entries(fallbackProducts)) {
        const product = products.find((p: any) => p.asin === asin);
        if (product) {
          return res.json(product);
        }
      }
      
      res.status(404).json({ error: "Product not found" });
    } catch (error: any) {
      console.error('Product detail error:', error);
      res.status(500).json({ error: "Failed to load product" });
    }
  });

  // GET /api/superstore/related/:asin - Get related products
  app.get("/api/superstore/related/:asin", async (req, res) => {
    try {
      const { asin } = req.params;
      const fallbackProducts = generateFallbackProducts();
      
      // Find product's category
      let productCategory = '';
      for (const [category, products] of Object.entries(fallbackProducts)) {
        if (products.find((p: any) => p.asin === asin)) {
          productCategory = category;
          break;
        }
      }
      
      if (!productCategory) {
        return res.json([]);
      }
      
      // Return other products from same category
      const related = fallbackProducts[productCategory]?.filter((p: any) => p.asin !== asin) || [];
      res.json(related);
    } catch (error: any) {
      console.error('Related products error:', error);
      res.status(500).json({ error: "Failed to load related products" });
    }
  });

  // ==================== ADMIN CONTROL CENTER ====================
  
  // GET /api/admin/stats - Admin dashboard statistics (admin only)
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      // Get all stats for dashboard - fetch subscribers which is the only working method
      const subscribers = await storage.getEmailSubscribers();
      
      // Use subscribers as a proxy for user data (the only method available)
      const stats = {
        users: subscribers.length,
        activeUsers: 0, // Would need getAllUsers to calculate
        subscribers: subscribers.length,
        courses: 0, // Would need getAllCourses
        resources: 0, // Would need getAllResources
        vendors: 0, // Would need getAllVendors
        topics: 0, // Would need getAllForumTopics
        ads: 0, // Would need getAllAdvertisements
        posts: 0, // TODO: Add blog posts count
        revenue: 12850, // TODO: Calculate from Stripe
        totalContent: 0,
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== ADVERTISEMENT SYSTEM API ROUTES ==========
  
  // GET /api/advertisements - Get active advertisements (public)
  app.get("/api/advertisements", async (req, res) => {
    try {
      const { placement, type } = req.query;
      const ads = await storage.getAdvertisements({
        status: 'active',
        placement: placement as string,
        type: type as string,
      });
      res.json(ads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/advertisements/:id/impression - Track ad impression
  app.post("/api/advertisements/:id/impression", async (req, res) => {
    try {
      await storage.trackAdImpression(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/advertisements/:id/click - Track ad click
  app.post("/api/advertisements/:id/click", async (req, res) => {
    try {
      await storage.trackAdClick(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/vendor/ads - Get vendor's advertisements (authenticated)
  app.get("/api/vendor/ads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const ads = await storage.getAdvertisements({ userId });
      res.json(ads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/vendor/ads - Submit new advertisement (authenticated)
  app.post("/api/vendor/ads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const adData = insertAdvertisementSchema.parse({
        ...req.body,
        userId,
        status: 'pending', // Always starts as pending
      });

      const ad = await storage.createAdvertisement(adData);
      
      // TODO: Send email notification to admin
      // await sendEmail({
      //   to: 'nick@washbizhub.com',
      //   subject: 'New Ad Submission Pending Review',
      //   html: `New ad from ${ad.companyName} needs approval`
      // });

      res.status(201).json(ad);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/vendor/ads/:id - Update own advertisement (authenticated)
  app.patch("/api/vendor/ads/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const existing = await storage.getAdvertisement(req.params.id);
      if (!existing) return res.status(404).json({ error: "Advertisement not found" });
      if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

      // Vendors can only update certain fields
      const allowedFields = ['title', 'companyName', 'companyWebsite', 'contactEmail', 'logoUrl', 'imageUrl', 'linkUrl', 'altText', 'templateData', 'htmlContent'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const ad = await storage.updateAdvertisement(req.params.id, updateData);
      res.json(ad);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/ads - Get all advertisements (admin only)
  app.get("/api/admin/ads", isAdmin, async (req, res) => {
    try {
      const { status, placement, type } = req.query;
      const ads = await storage.getAdvertisements({
        status: status as string,
        placement: placement as string,
        type: type as string,
      });
      res.json(ads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/admin/ads - Create advertisement (admin only)
  app.post("/api/admin/ads", isAdmin, async (req, res) => {
    try {
      const adData = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.createAdvertisement(adData);
      res.status(201).json(ad);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/admin/ads/:id - Update advertisement (admin only)
  app.patch("/api/admin/ads/:id", isAdmin, async (req, res) => {
    try {
      const ad = await storage.updateAdvertisement(req.params.id, req.body);
      res.json(ad);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/admin/ads/:id/status - Update ad status (admin only)
  app.patch("/api/admin/ads/:id/status", isAdmin, async (req: any, res) => {
    try {
      const { status, rejectionReason } = req.body;
      const reviewerId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;

      const ad = await storage.updateAdStatus(req.params.id, status, reviewerId, rejectionReason);
      
      // TODO: Send email notification to vendor
      // await sendEmail({
      //   to: ad.contactEmail,
      //   subject: status === 'approved' ? 'Ad Approved!' : 'Ad Update',
      //   html: `Your ad "${ad.title}" has been ${status}`
      // });

      res.json(ad);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/admin/ads/:id - Delete advertisement (admin only)
  app.delete("/api/admin/ads/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteAdvertisement(req.params.id);
      res.json({ message: "Advertisement deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== COURSES API ROUTES ==========
  // GET /api/courses - List all published courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses({ published: true });
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/courses/:courseId - Get single course
  app.get("/api/courses/:courseId", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/courses/:courseId/lessons - Get lessons for course
  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons(req.params.courseId);
      res.json(lessons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/courses/:courseId/enroll - Enroll in course
  app.post("/api/courses/:courseId/enroll", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const existing = await storage.getEnrollment(userId, req.params.courseId);
      if (existing) return res.json(existing);

      const enrollment = await storage.createEnrollment({
        userId,
        courseId: req.params.courseId,
        completedLessons: [],
      });
      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/enrollments - Get user's enrollments
  app.get("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const enrollments = await storage.getEnrollments(userId);
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/enrollments/:enrollmentId/progress - Update lesson progress
  app.put("/api/enrollments/:enrollmentId/progress", isAuthenticated, async (req: any, res) => {
    try {
      const enrollment = await storage.updateEnrollmentProgress(
        req.params.enrollmentId,
        req.body.progress,
        req.body.currentLessonId,
        req.body.completedLessons
      );
      res.json(enrollment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== BOOK API ROUTES ==========
  // GET /api/book/chapters - Get all book chapters
  app.get("/api/book/chapters", async (req, res) => {
    try {
      const chapters = await storage.getBookChapters();
      res.json(chapters);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/book/chapters/:chapterId - Get single chapter
  app.get("/api/book/chapters/:chapterId", async (req, res) => {
    try {
      const chapter = await storage.getBookChapter(req.params.chapterId);
      if (!chapter) return res.status(404).json({ error: "Chapter not found" });
      res.json(chapter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/book/access - Check user's book access
  app.get("/api/book/access", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const access = await storage.getUserBookAccess(userId);
      res.json(access || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/book/purchase - Create checkout session for book
  app.post("/api/book/purchase", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      const userEmail = (req.user as any)?.claims?.email;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "The Laundromat Bible",
                description: "Complete guide to building & scaling laundromat businesses",
              },
              unit_amount: 9700, // $97
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.hostname}/book?success=true`,
        cancel_url: `${req.protocol}://${req.hostname}/book`,
        customer_email: userEmail,
        metadata: { userId },
      });

      res.json({ sessionId: session.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== QUIZ & CERTIFICATES ROUTES ==========
  // POST /api/quizzes/:lessonId/attempt - Submit quiz attempt
  app.post("/api/quizzes/:lessonId/attempt", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { answers, score, totalQuestions, correctAnswers, timeSpent } = req.body;
      const passed = (correctAnswers / totalQuestions) >= 0.7;

      // Store quiz attempt (create if storage method exists)
      res.status(201).json({
        userId,
        lessonId: req.params.lessonId,
        score,
        totalQuestions,
        correctAnswers,
        answers,
        passed,
        timeSpent,
        completedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/certificates - Generate certificate on course completion
  app.post("/api/certificates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      const firstName = (req.user as any)?.claims?.first_name || "Student";
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { courseId, courseName } = req.body;
      const certificateNumber = `WBH-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const verificationUrl = `${req.protocol}://${req.hostname}/verify/${certificateNumber}`;

      // Generate certificate (store if method exists)
      res.status(201).json({
        id: `cert-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        courseId,
        certificateNumber,
        studentName: firstName,
        courseTitle: courseName,
        completionDate: new Date().toISOString(),
        verificationUrl,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== ANNOTATIONS (BOOKMARKS/NOTES/HIGHLIGHTS) ROUTES ==========
  // GET /api/annotations/:chapterId - Get user's annotations for chapter
  app.get("/api/annotations/:chapterId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      // Return empty array for now (storage method needed)
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/annotations - Create annotation (bookmark/note/highlight)
  app.post("/api/annotations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { chapterId, type, position, selectedText, noteContent, color } = req.body;

      const annotation = {
        id: `ann-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        chapterId,
        type, // "bookmark", "note", "highlight"
        position,
        selectedText,
        noteContent,
        color,
        createdAt: new Date().toISOString(),
      };

      res.status(201).json(annotation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/annotations/:annotationId - Delete annotation
  app.delete("/api/annotations/:annotationId", isAuthenticated, async (req: any, res) => {
    try {
      res.json({ message: "Annotation deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== PREMIUM COMBO PACKAGE ROUTES ==========
  // POST /api/premium-combo/checkout - Create combo package checkout session
  app.post("/api/premium-combo/checkout", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      const userEmail = (req.user as any)?.claims?.email;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Premium Learning Combo",
                description: "The Laundromat Bible + All Premium Courses + Lifetime Access",
              },
              unit_amount: 29700, // $297
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.hostname}/dashboard?combo=success`,
        cancel_url: `${req.protocol}://${req.hostname}/pricing`,
        customer_email: userEmail,
        metadata: { userId, comboType: "all-access" },
      });

      res.json({ sessionId: session.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/premium-combo/status - Check user's combo access
  app.get("/api/premium-combo/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      // Check if user has combo access
      res.json({
        hasCombo: false, // TODO: Query database
        comboExpires: null,
        allCoursesUnlocked: false,
        bookAccess: false,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== VAULT CHECKOUT ROUTES ==========
  
  // Vault template definitions (matching frontend)
  const vaultTemplates = [
    { id: "business-plan", name: "Full Business Plan (30+ Pages)", price: 197 },
    { id: "financial-proforma", name: "5-Year Financial Pro Forma", price: 147 },
    { id: "employee-handbook", name: "Employee Handbook (40+ Pages)", price: 97 },
    { id: "grand-opening", name: "Grand Opening Marketing Kit", price: 197 },
    { id: "due-diligence", name: "Due Diligence Master Packet", price: 197 },
    { id: "wdf-manual", name: "WDF Operations Manual", price: 127 },
    { id: "lease-script", name: "Lease Negotiation Script", price: 97 },
    { id: "cleanbi-template", name: "CLEANBI Report Template", price: 97 },
    { id: "pricing-calendar", name: "Dynamic Pricing Calendar", price: 77 },
    { id: "roi-calculator", name: "Equipment ROI Calculator", price: 97 },
    { id: "nda-template", name: "NDA Template", price: 47 },
    { id: "loi-template", name: "Letter of Intent (LOI)", price: 67 },
    { id: "purchase-agreement", name: "Purchase Agreement Outline", price: 127 },
    { id: "maintenance-schedule", name: "Preventative Maintenance Schedule", price: 77 },
    { id: "customer-survey", name: "Customer Survey System", price: 47 },
    { id: "emergency-plan", name: "Emergency Response Plan", price: 47 },
    { id: "insurance-checklist", name: "Insurance Checklist", price: 47 },
    { id: "exit-workbook", name: "Exit Strategy Workbook", price: 97 },
    { id: "broker-disclosure", name: "Broker Disclosure Form", price: 47 },
    { id: "ops-checklist", name: "Operations Checklist (D/W/M)", price: 97 },
  ];
  
  // POST /api/vault/checkout - Create Stripe checkout session for Vault products
  app.post("/api/vault/checkout", async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing is currently unavailable. Please try again later." });
      }
      
      const { type, templateId } = req.body;
      
      // Validate request body
      if (!type || (type !== 'bundle' && type !== 'template')) {
        return res.status(400).json({ message: "Invalid checkout type. Must be 'bundle' or 'template'." });
      }
      if (type === 'template' && !templateId) {
        return res.status(400).json({ message: "Template ID is required for individual template purchases." });
      }
      
      // Get user info if authenticated, allow guest checkout
      const userEmail = req.user?.claims?.email || req.user?.email || undefined;
      const userId = req.user?.claims?.sub || req.user?.sub || 'guest';
      
      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let productName = "";
      let productDescription = "";
      let successPath = "/vault?success=true";
      
      if (type === "bundle") {
        // Full Vault bundle - $997
        productName = "The Operator's Vault - Complete Bundle";
        productDescription = "All 20 premium laundromat templates ($5,917 value)";
        lineItems = [{
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: 99700, // $997
          },
          quantity: 1,
        }];
        successPath = "/vault?success=bundle";
      } else if (type === "template" && templateId) {
        // Individual template purchase
        const template = vaultTemplates.find(t => t.id === templateId);
        if (!template) {
          return res.status(400).json({ message: "Template not found" });
        }
        
        productName = template.name;
        productDescription = `Premium laundromat template from The Operator's Vault`;
        lineItems = [{
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: template.price * 100, // Convert to cents
          },
          quantity: 1,
        }];
        successPath = `/vault?success=${templateId}`;
      } else {
        return res.status(400).json({ message: "Invalid checkout type" });
      }
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `${req.protocol}://${req.hostname}`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${baseUrl}${successPath}`,
        cancel_url: `${baseUrl}/vault`,
        customer_email: userEmail,
        metadata: { 
          userId, 
          type, 
          templateId: templateId || 'bundle',
          product: productName 
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      console.error("Vault checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/cleanbi/checkout - Create Stripe checkout for $97 CLEANBI report
  app.post("/api/cleanbi/checkout", async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing is currently unavailable. Please try again later." });
      }
      
      const { address } = req.body;
      
      // Validate address is provided
      if (!address || typeof address !== 'string' || address.trim().length < 5) {
        return res.status(400).json({ message: "A valid property address is required for CLEANBI analysis." });
      }
      
      // Get user info if authenticated, allow guest checkout
      const userEmail = req.user?.claims?.email || req.user?.email || undefined;
      const userId = req.user?.claims?.sub || req.user?.sub || 'guest';
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `${req.protocol}://${req.hostname}`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "CLEANBI Professional Report",
              description: `17-factor property intelligence analysis${address ? ` for: ${address}` : ''}`,
            },
            unit_amount: 9700, // $97
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${baseUrl}/cleanbi?success=true&address=${encodeURIComponent(address || '')}`,
        cancel_url: `${baseUrl}/cleanbi`,
        customer_email: userEmail,
        metadata: { 
          userId, 
          type: 'cleanbi-report',
          address: address || ''
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      console.error("CLEANBI checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ========== GAMIFICATION & BADGES ROUTES ==========
  // POST /api/badges - Award badge to user
  app.post("/api/badges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { type, reason } = req.body;

      const badge = {
        id: `badge-${Date.now()}`,
        userId,
        type, // "first-course", "book-complete", "perfect-score", etc.
        reason,
        awardedAt: new Date().toISOString(),
      };

      res.status(201).json(badge);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/badges - Get user's badges
  app.get("/api/badges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      // Return mock badges for now
      res.json([
        { id: "1", type: "first-lesson", label: "First Step", icon: "🎯" },
        { id: "2", type: "perfect-score", label: "Perfect 100%", icon: "⭐" },
      ]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/learning-stats - Get user's learning statistics
  app.get("/api/learning-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      res.json({
        totalLessonsCompleted: 0,
        totalTimeSpent: 0, // minutes
        averageScore: 0,
        coursesEnrolled: 0,
        certificatesEarned: 0,
        currentStreak: 0, // days
        badges: [],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== GOOGLE INDEXING API ==========
  // POST /api/admin/index-all - Submit all URLs from sitemap to Google
  app.post("/api/admin/index-all", isAdmin, async (req: any, res) => {
    try {
      // Read sitemap.xml from public folder
      const sitemapPath = join(process.cwd(), "public", "sitemap.xml");
      const sitemapXml = readFileSync(sitemapPath, "utf-8");
      
      // Submit all URLs to Google
      const result = await submitAllToGoogle(sitemapXml);
      
      res.json({
        success: true,
        engine: "Google",
        ...result,
      });
    } catch (error: any) {
      console.error("Google bulk indexing failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // POST /api/admin/indexnow-all - Submit all URLs via IndexNow (Bing, Yahoo, Yandex, DuckDuckGo)
  app.post("/api/admin/indexnow-all", isAdmin, async (req: any, res) => {
    try {
      // Read sitemap.xml from public folder
      const sitemapPath = join(process.cwd(), "public", "sitemap.xml");
      const sitemapXml = readFileSync(sitemapPath, "utf-8");
      
      // Submit all URLs via IndexNow
      const result = await submitAllViaIndexNow(sitemapXml);
      
      res.json({
        success: true,
        engines: ["Bing", "Yahoo", "Yandex", "DuckDuckGo"],
        ...result,
      });
    } catch (error: any) {
      console.error("IndexNow bulk submission failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // ========== SERVICE GUY AI - Equipment Diagnostics ==========
  app.post("/api/service-guy-ai/diagnose", async (req, res) => {
    try {
      const { symptoms, manufacturer, machineType } = req.body;
      
      if (!symptoms) {
        return res.status(400).json({ error: "Symptoms description required" });
      }

      // Use Gemini for AI-powered diagnosis
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `You are Service Guy AI, an expert commercial laundry equipment diagnostic assistant named after a lifelong service industry professional.

EQUIPMENT CONTEXT:
- Manufacturer: ${manufacturer || "Unknown"}
- Machine Type: ${machineType || "Unknown"}

SYMPTOMS REPORTED:
${symptoms}

Provide a professional diagnosis including:
1. LIKELY CAUSES (ranked by probability)
2. IMMEDIATE CHECKS (what the operator can verify)
3. TROUBLESHOOTING STEPS (detailed step-by-step)
4. REQUIRED PARTS (with real part numbers if manufacturer is known)
5. SKILL LEVEL REQUIRED (Basic/Intermediate/Professional)
6. ESTIMATED REPAIR TIME
7. SAFETY WARNINGS (if applicable)
8. WHEN TO CALL A PROFESSIONAL

Format your response in a clear, numbered structure. Be specific and actionable.
If the manufacturer is Speed Queen, Dexter, Maytag, LG, Wascomat, Continental Girbau, Huebsch, IPSO, UniMac, or Electrolux, include actual part numbers.`;

      const result = await model.generateContent(prompt);
      const diagnosis = result.response.text();

      res.json({ 
        diagnosis,
        manufacturer: manufacturer || "Unknown",
        machineType: machineType || "Unknown",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Service Guy AI diagnosis error:", error);
      res.status(500).json({ 
        error: "Diagnosis failed",
        message: error.message,
        fallback: `Based on the reported symptoms, we recommend:
1. Check the error code display on the machine
2. Verify all water connections and valves
3. Inspect the drain system for clogs
4. Check electrical connections
5. Review the service manual for your specific model
6. Contact a certified technician if the issue persists

For immediate assistance, contact: 479-883-4314 or nick@washbizhub.com`
      });
    }
  });

  // Service Guy AI - PDF Manual Extraction
  app.post("/api/service-guy-ai/extract-manual", multerUpload.single("manual"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded" });
      }

      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(req.file.buffer);
      
      // Extract text and use AI to structure the data
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `Analyze this service manual excerpt and extract:
1. All ERROR CODES with their descriptions
2. All PART NUMBERS mentioned
3. Key TROUBLESHOOTING PROCEDURES
4. SAFETY WARNINGS

Format as structured JSON with arrays for each category.

MANUAL TEXT:
${pdfData.text.substring(0, 15000)}`;

      const result = await model.generateContent(prompt);
      const analysis = result.response.text();

      res.json({
        success: true,
        pages: pdfData.numpages,
        textLength: pdfData.text.length,
        analysis,
        extractedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("PDF extraction error:", error);
      res.status(500).json({ error: "PDF extraction failed", message: error.message });
    }
  });

  // ========== SEO SUITE ROUTES ==========
  const { createSeoRoutes } = await import('./seo-routes');
  app.use("/api/seo", isAuthenticated, createSeoRoutes(storage));

  const httpServer = createServer(app);
  return httpServer;
}
