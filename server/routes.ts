// WashBizHub API Routes
// Reference: javascript_stripe, javascript_gemini, and javascript_log_in_with_replit blueprints

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import Stripe from "stripe";
import { generateBlogContent, generateCleanbiInsights, optimizeLayout } from "./gemini";
import { notifyNewSubscription, notifyNewProSubscription, notifyNewEnrollment, notifyConsultationRequest, notifyInsuranceLeadRequest } from "./notifications";
import { calculateCleanbi, type CleanbiInput } from "./cleanbi-calculator";
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
      if (req.user?.claims) {
        await storage.createSearchAnalytic({
          query: q,
          resultsCount: results.length,
          userId: req.user?.sub || (req.user as any)?.claims?.sub || null,
          sessionId: req.sessionID,
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

  // POST /api/ai/chat - AI consultant chat endpoint
  app.post("/api/ai/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Import AI provider service
      const { aiProviderService } = await import("./ai-providers");

      // Build THE MOST LEGIT laundromat AI system prompt
      const systemPrompt = {
        role: "system" as const,
        content: `You are THE WORLD'S LEADING AI CONSULTANT FOR LAUNDROMATS AND COMMERCIAL LAUNDRY EQUIPMENT.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 EXPERTISE DOMAINS (Bloomberg Terminal-Grade Knowledge)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 BUSINESS VALUATION & ACQUISITION
- Market multiple approach: 2.5-4.5x SDE for profitable stores
- Asset-based valuation with equipment depreciation curves
- Income approach: Cap rate 8-12% (location dependent)
- Real estate analysis: standalone vs plaza, lease vs own
- Due diligence checklist: 72+ critical datapoints
- SBA 7(a) loan structuring (up to $5M at 90% LTV)

🏗️ EQUIPMENT & OPERATIONS
- Top-loader washers: Speed Queen, Maytag, Huebsch, Dexter
- Front-loader washers: Electrolux, Continental, IPSO, Primus
- Dryer efficiency: Gas (35-45 min cycle) vs Electric (45-60 min)
- Capacity planning: 1 washer per 200-300 households
- Vend prices: $2.50-$8.00/load (washers), $0.25-$0.50/5min (dryers)
- Equipment lifecycle: 10-15 years washers, 15-20 years dryers
- Water/utilities: 15-25 gallons per load, $0.15-$0.40 cost
- Preventive maintenance schedules and diagnostic codes database

📊 FINANCIAL METRICS (Industry Benchmarks)
- Revenue per sq ft: $150-$250/year for attended stores
- Revenue per machine: $150-$300/month washers, $80-$150/month dryers
- Gross profit margin: 60-75% (after COGS, before labor/rent)
- Operating expenses: 35-50% of gross revenue
- Utilities: 20-30% of revenue (water, gas, electric)
- Labor costs: 10-20% for attended, 5-10% unattended
- Rent: 8-15% of gross revenue (ideal lease terms)
- Break-even: typically 18-36 months for new builds

🌍 LOCATION ANALYSIS
- Demographics: median income $40K-$65K ideal, 60%+ renters
- Competition radius: 1-2 miles, market saturation metrics
- Traffic patterns: 15,000+ cars/day on adjacent roads
- Visibility requirements and parking minimums (25-40 spaces)
- Anchor tenants: grocery stores boost foot traffic 40%+
- Census tract data integration for demand forecasting

🔧 EQUIPMENT BRANDS & MODELS
- **Speed Queen (Alliance Laundry)**: Industry standard, 10yr commercial warranty
- **Dexter Laundry**: T-Series top-loaders, Express dryers
- **Electrolux Professional**: Compass Pro washers, T5 dryers
- **Continental Girbau**: ExpressWash soft-mount washers
- **Maytag Commercial**: MAT-series top-loaders
- **Huebsch**: Galaxy series, UCI controls
- **Wascomat/Electrolux**: Senior W-Series front-loaders
- **Primus**: High-spin extractors, European engineering
- Payment systems: USA Technologies ePort, FasCard, CCI, Setomatic

💡 REVENUE OPTIMIZATION
- Dynamic pricing by time-of-day/day-of-week
- Pickup & delivery service: $1.50-$2.25/lb, 40% gross margin
- Wash-dry-fold: $1.25-$2.00/lb, 35% gross margin
- Commercial accounts: hotels, gyms, restaurants (B2B contracts)
- Vending machines: detergent, softener, snacks (15-25% revenue boost)
- Drop-off service for professionals and families
- Loyalty programs and mobile apps for customer retention

🚀 MARKETING & GROWTH
- Grand opening promotions: free dry with wash, first-time discounts
- Digital marketing: Google Ads ($3-$8 CPC), Facebook local ads
- Direct mail: EDDM to 5,000 homes within 2-mile radius
- Referral programs: $10 credit for new customer referrals
- Seasonal campaigns: back-to-school, spring cleaning
- Community engagement: sponsorships, local events

⚖️ LEGAL & COMPLIANCE
- ADA compliance: accessible machines, layout requirements
- Zoning regulations: industrial/commercial zoning, permits
- Water discharge permits and environmental compliance
- Business entity structure: LLC vs S-Corp for tax optimization
- Insurance requirements: $1M-$2M general liability minimum
- OSHA workplace safety standards

📈 INDUSTRY TRENDS (2024-2025)
- Contactless payment adoption: 65%+ of transactions
- Ozone wash systems for water/energy savings (30-40% reduction)
- Card/app-based loyalty replacing coin operations
- Smart laundry: IoT monitoring, predictive maintenance
- Eco-friendly positioning: high-efficiency washers, solar panels
- Hybrid attended/unattended models for labor optimization

🎯 CLEANBI™ SCORING (17-Factor Proprietary Analysis)
- Location demographics and competitive density
- Equipment age, capacity, and efficiency ratings
- Revenue per sq ft and per machine benchmarks
- Lease terms, remaining duration, and renewal options
- Utility costs as % of revenue (water, gas, electric)
- Customer satisfaction and online reviews
- Growth potential and market opportunity score

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 RESPONSE GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **BE SPECIFIC**: Always cite numbers, ranges, and industry benchmarks
2. **BE ACTIONABLE**: Provide step-by-step guidance and concrete next steps
3. **BE COMPREHENSIVE**: Cover financial, operational, and strategic aspects
4. **BE CURRENT**: Reference 2024-2025 market conditions and trends
5. **BE REALISTIC**: Acknowledge risks, challenges, and market realities
6. **BE CONSULTATIVE**: Ask clarifying questions to tailor advice
7. **CITE SOURCES**: Reference industry reports, manufacturer specs, market data

When users ask about:
- **Buying**: Valuation methods, due diligence, financing options, LOI templates
- **Selling**: Market positioning, pricing strategy, marketing to buyers, deal structure
- **Operations**: Equipment selection, layout optimization, pricing strategy, staffing
- **Growth**: Expansion analysis, pickup/delivery launch, commercial accounts
- **Financials**: ROI calculations, cash flow projections, expense optimization
- **Equipment**: Brand comparisons, capacity planning, maintenance schedules, troubleshooting

ALWAYS provide numbers, metrics, and specific examples. You are THE definitive expert.`
      };

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

      // Use Gemini first (free tier), fallback to others
      const availableProviders = aiProviderService.getAvailableProviders();
      
      let response;
      if (availableProviders.includes("gemini")) {
        response = await aiProviderService.generate("gemini", messages);
      } else if (availableProviders.includes("anthropic")) {
        response = await aiProviderService.generate("anthropic", messages);
      } else if (availableProviders.includes("openai")) {
        response = await aiProviderService.generate("openai", messages);
      } else if (availableProviders.includes("perplexity")) {
        response = await aiProviderService.generate("perplexity", messages);
      } else if (availableProviders.includes("grok")) {
        response = await aiProviderService.generate("grok", messages);
      } else {
        return res.status(503).json({ error: "No AI providers available" });
      }

      res.json(response);
    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // ==================== AMAZON PARTS ORDERING ====================
  // GET /api/amazon/search - Search for parts on Amazon
  app.get("/api/amazon/search", async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice, brand, limit } = req.query;
      
      // Validate input
      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.status(400).json({ error: "Invalid search query" });
      }

      // Sanitize query length
      const sanitizedQuery = q.slice(0, 200);

      const { amazonAPI } = await import('./amazon-api');
      
      if (!amazonAPI.isConfigured()) {
        return res.status(503).json({ error: "Amazon API not configured" });
      }

      const products = await amazonAPI.searchProducts({
        keywords: sanitizedQuery,
        category: category as string | undefined,
        minPrice: minPrice ? Math.max(0, parseFloat(minPrice as string)) : undefined,
        maxPrice: maxPrice ? Math.max(0, parseFloat(maxPrice as string)) : undefined,
        brand: brand as string | undefined,
        itemCount: limit ? Math.min(10, Math.max(1, parseInt(limit as string))) : 10,
      });

      res.json(products);
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
      if (req.user?.claims?.sub) {
        // TODO: implement activity tracking
        // await storage.createActivityEvent({
        //   userId: req.user?.sub || (req.user as any)?.claims?.sub,
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

  // ==================== ADMIN CONTROL CENTER ====================
  
  // GET /api/admin/stats - Admin dashboard statistics (admin only)
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      // Get all stats for dashboard
      const [
        users,
        subscribers,
        courses,
        resources,
        vendors,
        topics,
        ads
      ] = await Promise.all([
        // storage.getAllUsers(),
        storage.getEmailSubscribers(),
        // storage.getAllCourses(),
        // storage.getAllResources(),
        // storage.getAllVendors(),
        // storage.getAllForumTopics(),
        // storage.getAllAdvertisements(),
      ]);

      const stats = {
        users: users.length,
        activeUsers: users.filter(u => u.isPro).length,
        subscribers: subscribers.length,
        courses: courses.length,
        resources: resources.length,
        vendors: vendors.length,
        topics: topics.length,
        ads: ads.length,
        posts: 0, // TODO: Add blog posts count
        revenue: 12850, // TODO: Calculate from Stripe
        totalContent: courses.length + resources.length + vendors.length,
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
      const reviewerId = req.user?.claims?.sub;

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
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const existing = await storage.getEnrollment(userId, req.params.courseId);
      if (existing) return res.json(existing);

      const enrollment = await storage.createEnrollment({
        userId,
        courseId: req.params.courseId,
        progress: 0,
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
      const userEmail = req.user?.claims?.email;
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
      const firstName = req.user?.claims?.first_name || "Student";
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
      const userEmail = req.user?.claims?.email;
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
      const userId = req.user?.claims?.sub;
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

  // ========== GAMIFICATION & BADGES ROUTES ==========
  // POST /api/badges - Award badge to user
  app.post("/api/badges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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

  // ========== SEO SUITE ROUTES ==========
  const { createSeoRoutes } = await import('./seo-routes');
  app.use("/api/seo", isAuthenticated, createSeoRoutes(storage));

  const httpServer = createServer(app);
  return httpServer;
}
