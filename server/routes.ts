// WashBizHub API Routes
// Reference: javascript_stripe, javascript_gemini, and javascript_log_in_with_replit blueprints

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import { generateBlogContent, generateCleanbiInsights, optimizeLayout } from "./gemini";
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
  insertDistributorSchema,
  insertDistributorInquirySchema,
  insertAffiliateContentSchema,
  insertAffiliateClickSchema,
  insertAffiliateSaleSchema,
  insertAffiliateCommissionSchema,
  insertAffiliatePayoutSchema,
} from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== AUTH ====================
  
  // Setup Replit Auth (login, logout, callback routes)
  await setupAuth(app);
  
  // Get authenticated user data
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  app.post("/api/designs", async (req, res) => {
    try {
      const validated = insertDesignSchema.parse(req.body);
      const design = await storage.createDesign(validated);
      res.json(design);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/designs/:id", async (req, res) => {
    try {
      const validated = insertDesignSchema.parse(req.body);
      const updated = await storage.updateDesign(req.params.id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Design not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update design" });
    }
  });

  app.post("/api/designs/:id/optimize", async (req, res) => {
    try {
      const design = await storage.getDesign(req.params.id);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
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

  app.delete("/api/designs/:id", async (req, res) => {
    try {
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

  app.post("/api/cleanbi", async (req, res) => {
    try {
      const validated = insertCleanbiScoreSchema.parse(req.body);
      const score = await storage.createCleanbiScore(validated);
      res.json(score);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/cleanbi/:id/insights", async (req, res) => {
    try {
      const cleanbiScore = await storage.getCleanbiScore(req.params.id);
      if (!cleanbiScore) {
        return res.status(404).json({ message: "Score not found" });
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

  app.post("/api/blog", async (req, res) => {
    try {
      const validated = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validated);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/blog/generate", async (req, res) => {
    try {
      const { topic, category } = req.body;
      const content = await generateBlogContent(topic, category);
      res.json({ content });
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

  app.post("/api/calculator/scenarios", async (req, res) => {
    try {
      const validated = insertCalculatorScenarioSchema.parse(req.body);
      const scenario = await storage.createCalculatorScenario(validated);
      res.json(scenario);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/calculator/scenarios/:id", async (req, res) => {
    try {
      await storage.deleteCalculatorScenario(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

  app.post("/api/vendors", async (req, res) => {
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

  app.post("/api/parts", async (req, res) => {
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

  app.post("/api/affiliates", async (req, res) => {
    try {
      const validated = insertAffiliateSchema.parse(req.body);
      const affiliate = await storage.createAffiliate(validated);
      res.json(affiliate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/affiliates/:id/track-click", async (req, res) => {
    try {
      await storage.trackAffiliateClick(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/affiliates/:id/track-sale", async (req, res) => {
    try {
      const { amount } = req.body;
      await storage.trackAffiliateSale(req.params.id, amount);
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

  app.post("/api/laundromats", async (req, res) => {
    try {
      const validated = insertLaundromatSchema.parse(req.body);
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
              product_data: {
                name: "WashBizHub Pro",
                description: "Complete platform access with all premium features",
              },
              recurring: {
                interval: "month",
              },
              unit_amount: 9700, // $97.00
            },
          },
        ],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

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

  app.post("/api/courses", async (req, res) => {
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
  
  // Get lessons by courseId (supports both URL param and query param)
  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons(req.params.courseId);
      res.json(lessons);
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
      res.json(lessons);
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
      res.json(lesson);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/lessons", async (req, res) => {
    try {
      const validated = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(validated);
      res.json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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

  app.put("/api/enrollments/:id/progress", async (req, res) => {
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

  app.post("/api/book/chapters", async (req, res) => {
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

  app.post("/api/ai-blog-tasks", async (req, res) => {
    try {
      const validated = insertAiBlogTaskSchema.parse(req.body);
      const task = await storage.createAiBlogTask(validated);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/ai-blog-tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateAiBlogTask(req.params.id, req.body);
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate blog content using multi-AI providers
  app.post("/api/ai-blog-tasks/:id/generate", async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getAiBlogTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Import AI provider service
      const { aiProviderService } = await import("./ai-providers");
      
      // Generate content using selected AI provider
      const messages = [
        {
          role: "system" as const,
          content: `You are a professional laundromat industry content writer. Write SEO-optimized, informative blog posts.`
        },
        {
          role: "user" as const,
          content: `Write a blog post with the following details:
Topic: ${task.topic}
Keywords: ${task.keywords.join(", ")}
Target word count: ${task.targetWordCount || 1500}

Create engaging, well-researched content that provides value to laundromat owners and operators.`
        }
      ];

      const response = await aiProviderService.generate(
        task.aiProvider,
        messages
      );

      // Update task with generated content
      const updatedTask = await storage.updateAiBlogTask(id, {
        content: response.content,
        status: "completed",
        completedAt: new Date().toISOString(),
      });

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

  app.post("/api/seo-keywords", async (req, res) => {
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

  app.post("/api/competitor-analysis", async (req, res) => {
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

  app.put("/api/consultations/:id", async (req, res) => {
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

  app.post("/api/listings", async (req, res) => {
    try {
      const validated = insertListingSchema.parse(req.body);
      const listing = await storage.createListing(validated);
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/listings/:id", async (req, res) => {
    try {
      const validated = insertListingSchema.partial().parse(req.body);
      const updated = await storage.updateListing(req.params.id, validated);
      if (!updated) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/listings/:id", async (req, res) => {
    try {
      await storage.deleteListing(req.params.id);
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

  app.post("/api/distributors", async (req, res) => {
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

  app.patch("/api/distributor-inquiries/:id", async (req, res) => {
    try {
      const validated = insertDistributorInquirySchema.partial().parse(req.body);
      const updated = await storage.updateDistributorInquiry(req.params.id, validated);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== AFFILIATE SYSTEM ====================
  
  app.post("/api/affiliates", async (req, res) => {
    try {
      const validated = insertAffiliateSchema.parse(req.body);
      const affiliate = await storage.createAffiliate(validated);
      res.json(affiliate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

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

  app.post("/api/affiliate/content", async (req, res) => {
    try {
      const validated = insertAffiliateContentSchema.parse(req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
