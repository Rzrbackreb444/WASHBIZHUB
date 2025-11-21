// WashBizHub API Routes
// Reference: javascript_stripe, javascript_gemini, and javascript_log_in_with_replit blueprints

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
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
} from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});

// Helper function to load current authenticated user
async function getCurrentUser(req: any): Promise<{ userId: string; user: any; isAdmin: boolean } | null> {
  if (!req.user || !req.user.claims || !req.user.claims.sub) {
    return null;
  }
  const userId = req.user.claims.sub;
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

  app.post("/api/lessons", async (req, res) => {
    try {
      const validated = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(validated);
      res.json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Submit quiz answers for grading (server-side validation)
  app.post("/api/lessons/:lessonId/grade", async (req, res) => {
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const validated = insertVendorReviewSchema.partial().parse(req.body);
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
  app.post("/api/vendor-stores", async (req, res) => {
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
  app.patch("/api/vendor-stores/:id", async (req, res) => {
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
      const allowedFields = {
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
  app.post("/api/vendor-products", async (req, res) => {
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
  app.patch("/api/vendor-products/:id", async (req, res) => {
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
      const allowedFields = {
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
  app.delete("/api/vendor-products/:id", async (req, res) => {
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
  app.post("/api/equipment-inquiries", async (req, res) => {
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
      await storage.createSearchAnalytic({
        query: q,
        resultsCount: results.length,
        userId: req.user?.claims?.sub || null,
        sessionId: req.sessionID,
      });
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const projects = await storage.getSiteProjects(userId);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/websites/:id - Get single website project
  app.get("/api/websites/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getSiteProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Verify ownership
      const userId = req.user.claims.sub;
      if (project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/websites - Create new website project
  app.post("/api/websites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = {
        ...req.body,
        userId,
        isPublished: false,
        totalViews: 0,
        totalLeads: 0,
      };
      
      const project = await storage.createSiteProject(projectData);
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /api/websites/:id - Update website project
  app.put("/api/websites/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getSiteProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Verify ownership
      const userId = req.user.claims.sub;
      if (project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const updated = await storage.updateSiteProject(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/websites/:id - Delete website project
  app.delete("/api/websites/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getSiteProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Verify ownership
      const userId = req.user.claims.sub;
      if (project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      await storage.deleteSiteProject(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SEO: SITEMAP.XML ====================
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.VITE_BASE_URL || "https://washbizhub.com";
      
      // Fetch all resources for sitemap
      const resources = await storage.getResources({});
      
      // Static pages
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/resources", priority: "0.9", changefreq: "daily" },
        { url: "/design-studio", priority: "0.8", changefreq: "weekly" },
        { url: "/cleanbi", priority: "0.8", changefreq: "weekly" },
        { url: "/marketplace", priority: "0.8", changefreq: "daily" },
        { url: "/courses", priority: "0.7", changefreq: "weekly" },
        { url: "/book", priority: "0.7", changefreq: "weekly" },
        { url: "/blog", priority: "0.7", changefreq: "daily" },
        { url: "/roi-calculator", priority: "0.7", changefreq: "weekly" },
        { url: "/calculator", priority: "0.7", changefreq: "weekly" },
        { url: "/subscribe", priority: "0.6", changefreq: "monthly" },
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
      
      sitemap += '</urlset>';
      
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error: any) {
      res.status(500).send('Error generating sitemap');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
