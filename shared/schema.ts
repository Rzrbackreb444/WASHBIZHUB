import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, decimal, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
// IMPORTANT: This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// Users table with Replit Auth + Stripe subscription support
// IMPORTANT: This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  // Keep varchar UUID for existing data compatibility
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Replit Auth fields
  email: varchar("email").unique(), // Nullable - some OAuth providers don't have emails
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(), // Public display name for forum
  
  // Personal/Contact Information
  phone: varchar("phone"),
  bio: text("bio"),
  tagline: varchar("tagline"), // Short bio for forum posts
  timezone: varchar("timezone").default("America/New_York"),
  
  // Business Information
  companyName: varchar("company_name"),
  role: varchar("role"), // Owner, Operator, Investor, Broker, Vendor, etc.
  industry: varchar("industry"), // Laundromat, Car Wash, Dry Cleaner, Multi-Unit
  numberOfLocations: integer("number_of_locations").default(1),
  
  // User Preferences
  preferredCurrency: varchar("preferred_currency").default("USD"), // USD, EUR, GBP, JPY, CNY, AUD, CAD
  preferredLanguage: varchar("preferred_language").default("en"), // en, es, fr, de, zh, ja
  
  // WashBizHub subscription fields
  isPro: boolean("is_pro").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  subscriptionTier: text("subscription_tier").default("free"), // "free", "accelerate", "scale", "summit"
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Replit Auth upsert type
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Equipment Placement Schema (for 2D/3D designs)
export const equipmentPlacementSchema = z.object({
  id: z.string(),
  equipmentId: z.string(), // Reference to equipmentLibrary item
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().optional(), // For 3D designs
  }),
  rotation: z.number().default(0), // Degrees
  notes: z.string().optional(),
});

export type EquipmentPlacement = z.infer<typeof equipmentPlacementSchema>;

// Room Dimensions Schema
export const roomDimensionsSchema = z.object({
  width: z.number(),
  depth: z.number(),
  height: z.number().optional(), // For 3D designs
});

export type RoomDimensions = z.infer<typeof roomDimensionsSchema>;

// Laundromat Designs (2D/3D)
export const designs = pgTable("designs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // "2d" or "3d"
  dimensions: jsonb("dimensions").notNull(), // { width, depth, height }
  equipment: jsonb("equipment").notNull(), // Array of equipment items with positions
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  tpd: integer("tpd").notNull(), // Turns per day
  aiScore: integer("ai_score"), // AI-generated optimization score
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDesignSchema = createInsertSchema(designs).omit({
  id: true,
  createdAt: true,
}).extend({
  dimensions: roomDimensionsSchema,
  equipment: z.array(equipmentPlacementSchema),
  totalCost: z.string(), // decimal as string
  aiScore: z.number().optional(),
});

export type InsertDesign = z.infer<typeof insertDesignSchema>;
export type Design = typeof designs.$inferSelect;

// CLEANBI™ Scores
export const cleanbiScores = pgTable("cleanbi_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  laundromatName: text("laundromat_name").notNull(),
  
  // 7 Categories (each 0-100)
  customerScore: integer("customer_score").notNull(),
  locationScore: integer("location_score").notNull(),
  equipmentScore: integer("equipment_score").notNull(),
  adaptabilityScore: integer("adaptability_score").notNull(),
  numbersScore: integer("numbers_score").notNull(),
  intelligenceScore: integer("intelligence_score").notNull(),
  brandScore: integer("brand_score").notNull(),
  
  totalScore: integer("total_score").notNull(), // Sum of all 7
  grade: text("grade").notNull(), // A, B, C, or "Needs Work"
  aiInsights: text("ai_insights"), // Gemini-generated recommendations
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCleanbiScoreSchema = createInsertSchema(cleanbiScores).omit({
  id: true,
  createdAt: true,
});

export type InsertCleanbiScore = z.infer<typeof insertCleanbiScoreSchema>;
export type CleanbiScore = typeof cleanbiScores.$inferSelect;

// Blog Posts (Manual/AI/UGB/UGE)
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "manual", "ai", "ugb" (user-generated blog), "uge" (user-generated expert)
  category: text("category").notNull(), // "Operations", "Marketing", "Maintenance", "Finance", etc.
  featured: boolean("featured").default(false).notNull(),
  published: boolean("published").default(true).notNull(),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  views: true,
  createdAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Calculator Scenarios
export const calculatorScenarios = pgTable("calculator_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  washers: integer("washers").notNull(),
  dryers: integer("dryers").notNull(),
  avgWashPrice: decimal("avg_wash_price", { precision: 10, scale: 2 }).notNull(),
  avgDryPrice: decimal("avg_dry_price", { precision: 10, scale: 2 }).notNull(),
  turnsPerDay: decimal("turns_per_day", { precision: 5, scale: 2 }).notNull(),
  utilization: decimal("utilization", { precision: 5, scale: 2 }).notNull(), // Stored as decimal (65.00 = 65%)
  monthlyExpenses: decimal("monthly_expenses", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCalculatorScenarioSchema = createInsertSchema(calculatorScenarios).omit({
  id: true,
  createdAt: true,
}).extend({
  avgWashPrice: z.string(),
  avgDryPrice: z.string(),
  turnsPerDay: z.string(),
  utilization: z.string(),
  monthlyExpenses: z.string(),
});

export type InsertCalculatorScenario = z.infer<typeof insertCalculatorScenarioSchema>;
export type CalculatorScenario = typeof calculatorScenarios.$inferSelect;

// Marketplace Vendors
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  companyName: text("company_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "Equipment", "Parts", "Services", "Consulting"
  logoUrl: text("logo_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  totalReviews: integer("total_reviews").default(0).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  rating: true,
  totalReviews: true,
  createdAt: true,
});

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// Parts Store Items
export const parts = pgTable("parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  partNumber: text("part_number").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // "Motors", "Belts", "Bearings", "Controls", etc.
  compatibility: jsonb("compatibility").notNull(), // Array of compatible equipment models
  inStock: boolean("in_stock").default(true).notNull(),
  imageUrl: text("image_url"),
});

export const insertPartSchema = createInsertSchema(parts).omit({
  id: true,
});

export type InsertPart = z.infer<typeof insertPartSchema>;
export type Part = typeof parts.$inferSelect;

// Affiliate System (20% Profit Share + UGC Content Platform)
export const affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Legacy field (keep for backwards compatibility)
  affiliateCode: text("affiliate_code").notNull().unique(), // "ABC123"
  
  // Enhanced Profile (nullable for backwards compatibility)
  displayName: text("display_name"), // Can backfill from username later
  bio: text("bio"),
  website: text("website"),
  socialLinks: jsonb("social_links"), // { youtube, instagram, twitter, etc. }
  
  // Affiliate Tag (new format for tracking - nullable, can auto-generate from code)
  affiliateTag: text("affiliate_tag").unique(), // "JOHN123" - used in URLs, defaults to affiliateCode if null
  
  // Legacy vendor link (optional - for vendor marketplace affiliates)
  vendorId: varchar("vendor_id").references(() => vendors.id),
  
  // Commission Rates
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("20"), // Default 20% profit share
  
  // Status & Approval
  status: text("status").notNull().default("pending"), // "pending", "active", "suspended", "terminated"
  approvedAt: timestamp("approved_at"),
  
  // Performance Tracking
  totalClicks: integer("total_clicks").default(0).notNull(),
  totalSales: integer("total_sales").default(0).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).default("0").notNull(),
  totalPaidOut: decimal("total_paid_out", { precision: 12, scale: 2 }).default("0").notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0").notNull(), // Legacy compatibility
  
  // Payout Info
  paypalEmail: text("paypal_email"),
  venmoUsername: text("venmo_username"),
  bankAccountLast4: text("bank_account_last4"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).omit({
  id: true,
  totalClicks: true,
  totalSales: true,
  totalRevenue: true,
  totalCommission: true,
  totalPaidOut: true,
  totalEarnings: true,
  approvedAt: true,
  createdAt: true,
});

export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

// Laundromat Locations (for locator)
export const laundromats = pgTable("laundromats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  phone: text("phone"),
  hours: jsonb("hours"), // Operating hours
  featured: boolean("featured").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
});

export const insertLaundromatSchema = createInsertSchema(laundromats).omit({
  id: true,
});

export type InsertLaundromat = z.infer<typeof insertLaundromatSchema>;
export type Laundromat = typeof laundromats.$inferSelect;

// Equipment Library (reference data)
export const equipmentLibrary = [
  {
    id: "dexter-t900",
    name: "Dexter T-900",
    type: "washer",
    capacity: "20lb",
    width: 27,
    depth: 31.5,
    height: 43,
    cost: 3500,
    tpdContribution: 8,
    color: "#4a90e2",
  },
  {
    id: "dexter-t1200",
    name: "Dexter T-1200",
    type: "washer",
    capacity: "30lb",
    width: 30,
    depth: 33,
    height: 45,
    cost: 4200,
    tpdContribution: 10,
    color: "#5ba3f5",
  },
  {
    id: "speed-queen-sfn",
    name: "Speed Queen SFN",
    type: "washer",
    capacity: "27lb",
    width: 27,
    depth: 32.25,
    height: 42.5,
    cost: 3800,
    tpdContribution: 9,
    color: "#e74c3c",
  },
  {
    id: "speed-queen-stack",
    name: "Speed Queen Stack",
    type: "dryer",
    capacity: "30lb",
    width: 27,
    depth: 31,
    height: 75,
    cost: 4500,
    tpdContribution: 12,
    color: "#c0392b",
  },
] as const;

export type EquipmentItem = typeof equipmentLibrary[number];

// Diagnostic Fault Codes (sample - would have 2,800+ in production)
export const faultCodes = [
  { code: "E01", description: "Water inlet valve failure", severity: "high" },
  { code: "E02", description: "Drain pump malfunction", severity: "high" },
  { code: "E03", description: "Door lock error", severity: "medium" },
  { code: "E04", description: "Temperature sensor fault", severity: "medium" },
  { code: "E05", description: "Motor overload", severity: "high" },
  // ... would continue to 2,800+ codes
] as const;

// ============================================================================
// PREMIUM REVENUE-GENERATING FEATURES
// ============================================================================

// Courses (Interactive Learning Platform)
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructorName: text("instructor_name").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // $97, $197, etc.
  stripePriceId: text("stripe_price_id"), // Stripe price ID for checkout
  level: text("level").notNull(), // "beginner", "intermediate", "advanced"
  category: text("category").notNull(), // "Operations", "Marketing", "Finance", "Startup"
  duration: integer("duration").notNull(), // Total minutes
  published: boolean("published").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  totalEnrollments: integer("total_enrollments").default(0).notNull(),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  totalEnrollments: true,
  averageRating: true,
  createdAt: true,
}).extend({
  price: z.string(),
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Course Lessons
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(), // Lesson sequence
  duration: integer("duration").notNull(), // Minutes
  videoUrl: text("video_url"), // URL to video content
  content: text("content"), // Text content/transcript
  resources: jsonb("resources"), // Array of downloadable resources
  quizData: jsonb("quiz_data"), // Quiz questions and answers
  isFree: boolean("is_free").default(false).notNull(), // Preview lesson
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Course Enrollments
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  stripePaymentId: text("stripe_payment_id"), // Stripe payment intent ID
  progress: integer("progress").default(0).notNull(), // Percentage completed
  currentLessonId: varchar("current_lesson_id"),
  completedLessons: jsonb("completed_lessons").default([]).notNull(), // Array of lesson IDs
  lastAccessedAt: timestamp("last_accessed_at"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  progress: true,
  enrolledAt: true,
});

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

// Digital Book Chapters
export const bookChapters = pgTable("book_chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  content: text("content").notNull(), // Markdown/HTML content
  embedWidgets: jsonb("embed_widgets"), // Array of embedded calculator configs
  isFree: boolean("is_free").default(false).notNull(), // Free preview chapter
  estimatedReadTime: integer("estimated_read_time").notNull(), // Minutes
});

export const insertBookChapterSchema = createInsertSchema(bookChapters).omit({
  id: true,
});

export type InsertBookChapter = z.infer<typeof insertBookChapterSchema>;
export type BookChapter = typeof bookChapters.$inferSelect;

// Book Access (Stripe-gated)
export const bookAccess = pgTable("book_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stripePaymentId: text("stripe_payment_id"), // One-time payment
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

export const insertBookAccessSchema = createInsertSchema(bookAccess).omit({
  id: true,
  purchasedAt: true,
});

export type InsertBookAccess = z.infer<typeof insertBookAccessSchema>;
export type BookAccess = typeof bookAccess.$inferSelect;

// AI Blog Tasks (Multi-AI Orchestration)
export const aiBlogTasks = pgTable("ai_blog_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  keywords: jsonb("keywords").notNull(), // Target keywords array
  providers: jsonb("providers").notNull(), // ["openai", "anthropic", "gemini", "perplexity", "grok"]
  status: text("status").notNull(), // "queued", "processing", "completed", "failed"
  drafts: jsonb("drafts"), // Results from each AI provider
  selectedDraft: text("selected_draft"), // Final chosen content
  seoScore: integer("seo_score"), // 0-100 SEO optimization score
  metadata: jsonb("metadata"), // Title, meta description, schema markup
  publishedPostId: varchar("published_post_id").references(() => blogPosts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertAiBlogTaskSchema = createInsertSchema(aiBlogTasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertAiBlogTask = z.infer<typeof insertAiBlogTaskSchema>;
export type AiBlogTask = typeof aiBlogTasks.$inferSelect;

// SEO Keyword Research
export const seoKeywords = pgTable("seo_keywords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull(),
  searchVolume: integer("search_volume"), // Monthly searches
  competition: text("competition"), // "low", "medium", "high"
  cpc: decimal("cpc", { precision: 10, scale: 2 }), // Cost per click
  difficulty: integer("difficulty"), // 0-100
  relevanceScore: integer("relevance_score"), // Custom relevance to laundromats
  relatedKeywords: jsonb("related_keywords"), // LSI keywords array
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSeoKeywordSchema = createInsertSchema(seoKeywords).omit({
  id: true,
  createdAt: true,
});

export type InsertSeoKeyword = z.infer<typeof insertSeoKeywordSchema>;
export type SeoKeyword = typeof seoKeywords.$inferSelect;

// Competitor Analysis
export const competitorAnalysis = pgTable("competitor_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorUrl: text("competitor_url").notNull(),
  keyword: text("keyword").notNull(), // Target keyword they rank for
  serpPosition: integer("serp_position"), // Their ranking position
  pageTitle: text("page_title"),
  metaDescription: text("meta_description"),
  contentLength: integer("content_length"), // Word count
  backlinks: integer("backlinks"),
  domainAuthority: integer("domain_authority"),
  contentGaps: jsonb("content_gaps"), // Topics they cover that we don't
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const insertCompetitorAnalysisSchema = createInsertSchema(competitorAnalysis).omit({
  id: true,
  analyzedAt: true,
});

export type InsertCompetitorAnalysis = z.infer<typeof insertCompetitorAnalysisSchema>;
export type CompetitorAnalysis = typeof competitorAnalysis.$inferSelect;

// Consultation Bookings
export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Request Details
  consultationType: text("consultation_type").notNull(), // "site_selection", "business_plan", "equipment", "operations", "marketing", "exit_strategy"
  businessStage: text("business_stage").notNull(), // "researching", "planning", "acquiring", "operating", "selling"
  
  // Contact Info
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  
  // Details
  location: text("location"),
  budget: text("budget"),
  timeline: text("timeline"),
  message: text("message").notNull(),
  
  // Scheduling
  preferredDate: timestamp("preferred_date"),
  scheduledDate: timestamp("scheduled_date"),
  
  // Status & Assignment
  status: text("status").notNull().default("new"), // "new", "contacted", "scheduled", "completed", "cancelled"
  assignedTo: varchar("assigned_to").references(() => users.id), // Consultant/expert
  priority: text("priority").default("normal"), // "low", "normal", "high"
  
  // Payment
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  paid: boolean("paid").default(false).notNull(),
  stripePaymentId: text("stripe_payment_id"),
  
  // Notes
  internalNotes: text("internal_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  paid: true,
  createdAt: true,
  completedAt: true,
});

export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;

// Vendor Storefronts
export const vendorStorefronts = pgTable("vendor_storefronts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Company Info
  companyName: text("company_name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  bannerImage: text("banner_image"),
  description: text("description"),
  
  // Contact
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  
  // Categories
  categories: jsonb("categories").notNull(), // ["washers", "dryers", "parts", "chemicals", "services"]
  
  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: jsonb("seo_keywords"),
  
  // Features
  featured: boolean("featured").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  
  // Stats
  productCount: integer("product_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  
  // Subscription
  subscriptionTier: text("subscription_tier").default("basic"), // "basic", "pro", "enterprise"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVendorStorefrontSchema = createInsertSchema(vendorStorefronts).omit({
  id: true,
  productCount: true,
  reviewCount: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVendorStorefront = z.infer<typeof insertVendorStorefrontSchema>;
export type VendorStorefront = typeof vendorStorefronts.$inferSelect;

// Reviews (for listings, vendors, brokers)
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Target
  targetType: text("target_type").notNull(), // "listing", "vendor", "broker", "course"
  targetId: varchar("target_id").notNull(),
  
  // Review Content
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  content: text("content").notNull(),
  
  // Verification
  verified: boolean("verified").default(false).notNull(),
  
  // Engagement
  helpfulCount: integer("helpful_count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  helpfulCount: true,
  createdAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Competition Intelligence
export const competitionIntelligence = pgTable("competition_intelligence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Location
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  
  // Analysis Radius
  radiusMiles: decimal("radius_miles", { precision: 4, scale: 2 }).default("3.00"),
  
  // Competition Data
  competitorCount: integer("competitor_count"),
  nearestCompetitor: decimal("nearest_competitor", { precision: 5, scale: 2 }), // Miles
  avgPricing: jsonb("avg_pricing"), // { wash: 2.50, dry: 0.25, ... }
  marketSaturation: text("market_saturation"), // "low", "medium", "high"
  
  // Demographics
  population: integer("population"),
  medianIncome: decimal("median_income", { precision: 10, scale: 2 }),
  householdCount: integer("household_count"),
  renterPercentage: decimal("renter_percentage", { precision: 5, scale: 2 }),
  
  // Opportunity Score
  opportunityScore: integer("opportunity_score"), // 0-100
  recommendedPricing: jsonb("recommended_pricing"),
  strengths: jsonb("strengths"), // Array of opportunity factors
  concerns: jsonb("concerns"), // Array of risk factors
  
  // AI Analysis
  aiInsights: text("ai_insights"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Cache for 30 days
});

export const insertCompetitionIntelligenceSchema = createInsertSchema(competitionIntelligence).omit({
  id: true,
  createdAt: true,
});

export type InsertCompetitionIntelligence = z.infer<typeof insertCompetitionIntelligenceSchema>;
export type CompetitionIntelligence = typeof competitionIntelligence.$inferSelect;

// Advertisement Placements (Logo strip, banner ads) with Canva-style builder
export const advertisements = pgTable("advertisements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendorStorefronts.id),
  userId: varchar("user_id").references(() => users.id), // Who created it
  
  // Company Info
  companyName: text("company_name").notNull(),
  companyWebsite: text("company_website"),
  contactEmail: text("contact_email"),
  logoUrl: text("logo_url"),
  
  // Ad Details
  title: text("title").notNull(),
  type: text("type").notNull(), // "logo_strip", "banner", "sidebar", "featured_listing", "header", "footer", "inline"
  placement: text("placement").notNull(), // "homepage", "marketplace", "blog", "design_studio", "calculators", "all"
  imageUrl: text("image_url"), // Final rendered ad image
  linkUrl: text("link_url").notNull(),
  altText: text("alt_text"),
  
  // Canva-style Template Data
  templateId: text("template_id"), // Reference to pre-built templates
  templateData: jsonb("template_data"), // {elements: [...], styles: {...}}
  htmlContent: text("html_content"), // Custom HTML for advanced ads
  
  // Scheduling
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Performance
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  
  // Approval Workflow
  status: text("status").default("pending").notNull(), // "pending", "approved", "rejected", "active", "inactive"
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Priority & Display
  priority: integer("priority").default(1).notNull(), // 1-10
  
  // Pricing
  costPerDay: decimal("cost_per_day", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImageUrl: text("og_image_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  impressions: true,
  clicks: true,
  status: true, // Set by system
  reviewedBy: true, // Set by admin
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type Advertisement = typeof advertisements.$inferSelect;

// Machine Integration & IoT
export const machines = pgTable("machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  locationId: varchar("location_id"), // Laundromat location
  
  // Machine Details
  machineType: text("machine_type").notNull(), // "washer", "dryer", "combo"
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  capacity: decimal("capacity", { precision: 5, scale: 2 }), // Pounds
  
  // Integration
  iotDeviceId: text("iot_device_id").unique(), // IoT hardware ID
  connectionStatus: text("connection_status").default("offline"), // "online", "offline", "error"
  firmwareVersion: text("firmware_version"),
  lastPing: timestamp("last_ping"),
  
  // Pricing
  pricePerCycle: decimal("price_per_cycle", { precision: 6, scale: 2 }),
  currentPrice: decimal("current_price", { precision: 6, scale: 2 }), // Dynamic pricing
  
  // Usage Analytics
  totalCycles: integer("total_cycles").default(0).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0").notNull(),
  avgTurnsPerDay: decimal("avg_turns_per_day", { precision: 5, scale: 2 }),
  
  // Status
  operationalStatus: text("operational_status").default("operational"), // "operational", "maintenance", "out_of_service"
  lastServiceDate: timestamp("last_service_date"),
  nextServiceDate: timestamp("next_service_date"),
  
  // ROI Tracking
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  installDate: timestamp("install_date"),
  warrantyExpiration: timestamp("warranty_expiration"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMachineSchema = createInsertSchema(machines).omit({
  id: true,
  totalCycles: true,
  totalRevenue: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type Machine = typeof machines.$inferSelect;

// Machine Sensor Data (for predictive maintenance)
export const machineSensorData = pgTable("machine_sensor_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machines.id),
  
  // Sensor Readings
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // Celsius
  vibration: decimal("vibration", { precision: 7, scale: 4 }), // G-force
  humidity: decimal("humidity", { precision: 5, scale: 2 }), // Percentage
  waterPressure: decimal("water_pressure", { precision: 6, scale: 2 }), // PSI
  powerConsumption: decimal("power_consumption", { precision: 8, scale: 2 }), // Watts
  
  // Operational Metrics
  cycleTime: integer("cycle_time"), // Seconds
  waterUsage: decimal("water_usage", { precision: 6, scale: 2 }), // Gallons
  errorCodes: jsonb("error_codes"), // Array of fault codes
  
  // Anomaly Detection
  anomalyScore: decimal("anomaly_score", { precision: 5, scale: 4 }), // 0-1, AI-generated
  predictedFailure: text("predicted_failure"), // "bearing", "motor", "pump", "valve", null
  daysToFailure: integer("days_to_failure"), // AI prediction
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMachineSensorDataSchema = createInsertSchema(machineSensorData).omit({
  id: true,
  timestamp: true,
});

export type InsertMachineSensorData = z.infer<typeof insertMachineSensorDataSchema>;
export type MachineSensorData = typeof machineSensorData.$inferSelect;

// Dynamic Pricing Rules
export const pricingRules = pgTable("pricing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  locationId: varchar("location_id"),
  
  // Rule Configuration
  name: text("name").notNull(),
  ruleType: text("rule_type").notNull(), // "time_of_day", "day_of_week", "surge", "competition", "demand"
  active: boolean("active").default(true).notNull(),
  priority: integer("priority").default(0).notNull(),
  
  // Conditions
  conditions: jsonb("conditions").notNull(), // { dayOfWeek: [1,2,3], timeStart: "18:00", timeEnd: "22:00" }
  
  // Pricing Adjustment
  adjustmentType: text("adjustment_type").notNull(), // "percentage", "fixed", "absolute"
  adjustmentValue: decimal("adjustment_value", { precision: 6, scale: 2 }).notNull(),
  minPrice: decimal("min_price", { precision: 6, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 6, scale: 2 }),
  
  // AI Recommendations
  aiSuggested: boolean("ai_suggested").default(false).notNull(),
  estimatedRevenueImpact: decimal("estimated_revenue_impact", { precision: 10, scale: 2 }),
  
  // Performance
  totalApplications: integer("total_applications").default(0).notNull(),
  revenueGenerated: decimal("revenue_generated", { precision: 12, scale: 2 }).default("0").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPricingRuleSchema = createInsertSchema(pricingRules).omit({
  id: true,
  totalApplications: true,
  revenueGenerated: true,
  createdAt: true,
});

export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;
export type PricingRule = typeof pricingRules.$inferSelect;

// Predictive Maintenance Schedules
export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machines.id),
  
  // Schedule Details
  maintenanceType: text("maintenance_type").notNull(), // "preventive", "predictive", "corrective"
  predictedIssue: text("predicted_issue"), // AI-detected issue
  severity: text("severity").notNull(), // "low", "medium", "high", "critical"
  
  // Scheduling
  scheduledDate: timestamp("scheduled_date").notNull(),
  estimatedDuration: integer("estimated_duration"), // Minutes
  status: text("status").notNull().default("scheduled"), // "scheduled", "in_progress", "completed", "cancelled"
  
  // Parts & Costs
  requiredParts: jsonb("required_parts"), // Array of part IDs/names
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  
  // Assignment
  technicianId: varchar("technician_id").references(() => users.id),
  
  // AI Insights
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 4 }), // 0-1
  aiRecommendations: text("ai_recommendations"),
  preventedDowntime: integer("prevented_downtime"), // Hours saved
  
  // Completion
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedules).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;

// AI Chatbot Conversations
export const chatbotConversations = pgTable("chatbot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  locationId: varchar("location_id"),
  
  // Conversation Details
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  
  // Context
  conversationType: text("conversation_type").notNull(), // "support", "booking", "faq", "sales"
  intent: text("intent"), // AI-detected intent
  sentiment: text("sentiment"), // "positive", "neutral", "negative"
  
  // Messages
  messages: jsonb("messages").notNull(), // Array of { role, content, timestamp }
  
  // Resolution
  resolved: boolean("resolved").default(false).notNull(),
  handoffToHuman: boolean("handoff_to_human").default(false).notNull(),
  assignedAgentId: varchar("assigned_agent_id").references(() => users.id),
  
  // Outcome
  appointmentBooked: boolean("appointment_booked").default(false).notNull(),
  leadGenerated: boolean("lead_generated").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChatbotConversation = z.infer<typeof insertChatbotConversationSchema>;
export type ChatbotConversation = typeof chatbotConversations.$inferSelect;

// Marketing Campaigns
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  locationId: varchar("location_id"),
  
  // Campaign Details
  name: text("name").notNull(),
  campaignType: text("campaign_type").notNull(), // "email", "sms", "social", "seo", "ppc"
  status: text("status").notNull().default("draft"), // "draft", "scheduled", "active", "paused", "completed"
  
  // Content
  subject: text("subject"),
  content: text("content"),
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  
  // AI Generation
  aiGenerated: boolean("ai_generated").default(false).notNull(),
  aiProvider: text("ai_provider"), // "openai", "anthropic", "gemini"
  
  // Targeting
  targetAudience: jsonb("target_audience"), // Demographic filters
  
  // Scheduling
  scheduledDate: timestamp("scheduled_date"),
  endDate: timestamp("end_date"),
  
  // Performance
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  impressions: true,
  clicks: true,
  conversions: true,
  revenue: true,
  cost: true,
  createdAt: true,
});

export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;

// ============================================================================
// DISTRIBUTOR LOCATOR (Lead Capture for Commission)
// ============================================================================
export const distributors = pgTable("distributors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Brand & Company Info
  brandName: text("brand_name").notNull(), // "Speed Queen", "Dexter", "Huebsch", etc.
  distributorName: text("distributor_name").notNull(),
  
  // Coverage
  regions: text("regions").array().notNull(), // ["Northeast", "Mid-Atlantic", etc.]
  states: text("states").array().notNull(), // ["NY", "NJ", "PA", etc.]
  
  // Equipment Types
  equipmentTypes: text("equipment_types").array().notNull(), // ["washers", "dryers", "folders", etc.]
  
  // Private Contact Info (not shown to users)
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  website: text("website"),
  
  // Commission Info
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }), // Our commission %
  
  // Status
  active: boolean("active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDistributorSchema = createInsertSchema(distributors).omit({
  id: true,
  createdAt: true,
});

export type InsertDistributor = z.infer<typeof insertDistributorSchema>;
export type Distributor = typeof distributors.$inferSelect;

// Distributor Inquiry (Lead Capture)
export const distributorInquiries = pgTable("distributor_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  distributorId: varchar("distributor_id").references(() => distributors.id),
  
  // Lead Info
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  businessName: text("business_name"),
  
  // Inquiry Details
  equipmentInterest: text("equipment_interest").array(), // What they're looking for
  message: text("message"),
  urgency: text("urgency").notNull().default("normal"), // "low", "normal", "high"
  
  // Status Tracking
  status: text("status").notNull().default("new"), // "new", "contacted", "qualified", "converted", "lost"
  
  // Commission Tracking
  convertedToSale: boolean("converted_to_sale").default(false).notNull(),
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }),
  commissionEarned: decimal("commission_earned", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  contactedAt: timestamp("contacted_at"),
  convertedAt: timestamp("converted_at"),
});

export const insertDistributorInquirySchema = createInsertSchema(distributorInquiries).omit({
  id: true,
  createdAt: true,
  contactedAt: true,
  convertedAt: true,
});

export type InsertDistributorInquiry = z.infer<typeof insertDistributorInquirySchema>;
export type DistributorInquiry = typeof distributorInquiries.$inferSelect;

// Affiliate Content (UGC Blogs & Videos)
export const affiliateContent = pgTable("affiliate_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id),
  
  // Content Details
  contentType: text("content_type").notNull(), // "blog", "video", "social"
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"), // HTML for blogs
  excerpt: text("excerpt"),
  
  // Video Details (if video)
  videoUrl: text("video_url"), // YouTube/Vimeo embed URL
  videoThumbnail: text("video_thumbnail"),
  videoDuration: integer("video_duration"), // seconds
  
  // SEO
  metaDescription: text("meta_description"),
  keywords: text("keywords").array(),
  
  // Product/Service Links
  relatedProducts: text("related_products").array(), // Product IDs being promoted
  affiliateLinks: jsonb("affiliate_links"), // Tracked links within content
  
  // Moderation
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected", "archived"
  moderatorNotes: text("moderator_notes"),
  
  // Performance
  views: integer("views").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAffiliateContentSchema = createInsertSchema(affiliateContent).omit({
  id: true,
  views: true,
  clicks: true,
  conversions: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAffiliateContent = z.infer<typeof insertAffiliateContentSchema>;
export type AffiliateContent = typeof affiliateContent.$inferSelect;

// Affiliate Click Tracking
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id),
  contentId: varchar("content_id").references(() => affiliateContent.id), // Optional: which content drove click
  
  // Click Details
  affiliateTag: text("affiliate_tag").notNull(),
  targetUrl: text("target_url").notNull(), // Where they clicked to
  referrerUrl: text("referrer_url"), // Where they came from
  
  // Visitor Info
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  device: text("device"), // "mobile", "tablet", "desktop"
  
  // Conversion Tracking
  convertedToSale: boolean("converted_to_sale").default(false).notNull(),
  saleId: varchar("sale_id"), // Reference to order/purchase
  
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({
  id: true,
  clickedAt: true,
});

export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;

// Affiliate Sales (Revenue Attribution)
export const affiliateSales = pgTable("affiliate_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id),
  clickId: varchar("click_id").references(() => affiliateClicks.id),
  
  // Sale Details
  productType: text("product_type").notNull(), // "course", "book", "consultation", "design_export", etc.
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  
  // Financials
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(), // Our cost
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(), // Sale price - cost
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("20"), // Default 20%
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Customer
  customerId: varchar("customer_id"),
  customerEmail: text("customer_email"),
  
  // Payment Status
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "completed", "refunded"
  stripePaymentId: text("stripe_payment_id"),
  
  // Commission Payout
  commissionStatus: text("commission_status").notNull().default("pending"), // "pending", "approved", "paid"
  payoutId: varchar("payout_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  refundedAt: timestamp("refunded_at"),
});

export const insertAffiliateSaleSchema = createInsertSchema(affiliateSales).omit({
  id: true,
  createdAt: true,
  refundedAt: true,
});

export type InsertAffiliateSale = z.infer<typeof insertAffiliateSaleSchema>;
export type AffiliateSale = typeof affiliateSales.$inferSelect;

// Affiliate Commissions (Aggregated by Period)
export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id),
  
  // Period
  period: text("period").notNull(), // "2024-01", "2024-02", etc.
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Performance Summary
  totalClicks: integer("total_clicks").notNull(),
  totalSales: integer("total_sales").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
  totalProfit: decimal("total_profit", { precision: 12, scale: 2 }).notNull(),
  totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).notNull(),
  
  // Status
  status: text("status").notNull().default("pending"), // "pending", "approved", "paid"
  approvedAt: timestamp("approved_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffiliateCommissionSchema = createInsertSchema(affiliateCommissions).omit({
  id: true,
  approvedAt: true,
  createdAt: true,
});

export type InsertAffiliateCommission = z.infer<typeof insertAffiliateCommissionSchema>;
export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;

// Affiliate Payouts
export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id),
  commissionId: varchar("commission_id").references(() => affiliateCommissions.id),
  
  // Payout Details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // "paypal", "venmo", "bank_transfer", "stripe"
  
  // Payment Info
  paymentReference: text("payment_reference"), // PayPal transaction ID, etc.
  recipientEmail: text("recipient_email"),
  recipientAccount: text("recipient_account"),
  
  // Status
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  failureReason: text("failure_reason"),
  
  // Dates
  requestedAt: timestamp("requested_at").notNull(),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffiliatePayoutSchema = createInsertSchema(affiliatePayouts).omit({
  id: true,
  processedAt: true,
  completedAt: true,
  createdAt: true,
});

export type InsertAffiliatePayout = z.infer<typeof insertAffiliatePayoutSchema>;
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;

// ============================================================================
// GLOBAL MARKETPLACE - Listings for Laundromats, Car Washes, Dry Cleaners
// ============================================================================

// Main Listings Table (Global Support)
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Owner or Broker
  
  // Listing Type
  businessType: text("business_type").notNull(), // "laundromat", "car_wash", "dry_cleaner"
  listingType: text("listing_type").notNull(), // "owner", "broker"
  
  // Basic Info
  title: text("title").notNull(),
  description: text("description").notNull(),
  tagline: text("tagline"), // Short summary for cards
  
  // Pricing (Dual-Currency Architecture: Original + USD normalized)
  priceOriginal: decimal("price_original", { precision: 12, scale: 2 }), // Price in original currency
  currency: text("currency").notNull().default("USD"), // ISO 4217: USD, EUR, GBP, etc.
  priceInUSD: decimal("price_in_usd", { precision: 12, scale: 2 }), // Normalized USD equivalent for search/sort
  priceVisibility: text("price_visibility").notNull().default("public"), // "public", "nda_required", "hidden"
  
  // Real Estate
  includesRealEstate: boolean("includes_real_estate").notNull().default(false),
  realEstateValue: decimal("real_estate_value", { precision: 12, scale: 2 }),
  
  // Financing
  ownerFinancing: boolean("owner_financing").notNull().default(false),
  downPaymentPercent: integer("down_payment_percent"),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  financingTermMonths: integer("financing_term_months"),
  
  // Location (Country-first for global support)
  country: text("country").notNull().default("US"), // ISO 3166-1 alpha-2
  region: text("region"), // State/Province/Prefecture
  city: text("city"),
  generalLocation: text("general_location"), // "Northeast Philadelphia" for broker listings
  exactAddress: text("exact_address"), // Full address (hidden until NDA for broker listings)
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  addressVisibility: text("address_visibility").notNull().default("public"), // "public", "general", "nda_required"
  
  // Featured Image
  featuredImage: text("featured_image"),
  
  // Status
  status: text("status").notNull().default("draft"), // "draft", "active", "pending", "sold", "expired"
  featured: boolean("featured").notNull().default(false), // Premium tier: homepage featured
  prioritySearch: boolean("priority_search").notNull().default(false), // Premium tier: top of search
  visibilityBoost: integer("visibility_boost").default(0), // Premium tier: 0 (normal), 1-5 (boosted)
  
  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array(),
  slug: text("slug").unique(),
  
  // NDA Protection (for Broker Listings)
  // NOTE: Application logic MUST verify NDA approval before showing protected fields
  // Protected fields: exactAddress, listingMedia where requiresNDA=true, detailed financials
  requiresNDA: boolean("requires_nda").notNull().default(false),
  ndaDocument: text("nda_document"), // URL to NDA template
  
  // Premium Features
  cleanbiReportId: varchar("cleanbi_report_id"), // Link to pre-generated CLEANBI report
  hasValuationReport: boolean("has_valuation_report").default(false),
  
  // Metrics
  viewCount: integer("view_count").default(0).notNull(),
  inquiryCount: integer("inquiry_count").default(0).notNull(),
  ndaRequestCount: integer("nda_request_count").default(0).notNull(),
  
  // Dates
  listedAt: timestamp("listed_at"),
  expiresAt: timestamp("expires_at"),
  soldAt: timestamp("sold_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Unique index on slug for SEO-friendly URLs
    slugIdx: uniqueIndex("listings_slug_idx").on(table.slug),
    // Composite index for marketplace search performance
    marketplaceSearchIdx: index("listings_marketplace_search_idx").on(table.status, table.country, table.featured, table.prioritySearch),
    // Index for owner/broker lookups
    userIdx: index("listings_user_idx").on(table.userId),
  };
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  viewCount: true,
  inquiryCount: true,
  ndaRequestCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

// Listing Financial Details (Revenue, Expenses, Cash Flow)
// Dual-Currency Architecture: Store both original currency and USD normalized values
export const listingFinancials = pgTable("listing_financials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id),
  
  // Revenue (Original Currency)
  grossRevenueOriginal: decimal("gross_revenue_original", { precision: 12, scale: 2 }),
  netRevenueOriginal: decimal("net_revenue_original", { precision: 12, scale: 2 }),
  averageMonthlyRevenueOriginal: decimal("average_monthly_revenue_original", { precision: 12, scale: 2 }),
  
  // Revenue (USD Normalized)
  grossRevenueUSD: decimal("gross_revenue_usd", { precision: 12, scale: 2 }),
  netRevenueUSD: decimal("net_revenue_usd", { precision: 12, scale: 2 }),
  averageMonthlyRevenueUSD: decimal("average_monthly_revenue_usd", { precision: 12, scale: 2 }),
  
  // Expenses (Original Currency)
  rentOriginal: decimal("rent_original", { precision: 10, scale: 2 }),
  utilitiesOriginal: decimal("utilities_original", { precision: 10, scale: 2 }),
  laborOriginal: decimal("labor_original", { precision: 10, scale: 2 }),
  maintenanceOriginal: decimal("maintenance_original", { precision: 10, scale: 2 }),
  insuranceOriginal: decimal("insurance_original", { precision: 10, scale: 2 }),
  otherExpensesOriginal: decimal("other_expenses_original", { precision: 10, scale: 2 }),
  totalExpensesOriginal: decimal("total_expenses_original", { precision: 10, scale: 2 }),
  
  // Expenses (USD Normalized)
  rentUSD: decimal("rent_usd", { precision: 10, scale: 2 }),
  utilitiesUSD: decimal("utilities_usd", { precision: 10, scale: 2 }),
  laborUSD: decimal("labor_usd", { precision: 10, scale: 2 }),
  maintenanceUSD: decimal("maintenance_usd", { precision: 10, scale: 2 }),
  insuranceUSD: decimal("insurance_usd", { precision: 10, scale: 2 }),
  otherExpensesUSD: decimal("other_expenses_usd", { precision: 10, scale: 2 }),
  totalExpensesUSD: decimal("total_expenses_usd", { precision: 10, scale: 2 }),
  
  // Profitability (Original Currency)
  netIncomeOriginal: decimal("net_income_original", { precision: 12, scale: 2 }),
  ebitdaOriginal: decimal("ebitda_original", { precision: 12, scale: 2 }),
  cashFlowOriginal: decimal("cash_flow_original", { precision: 12, scale: 2 }),
  
  // Profitability (USD Normalized)
  netIncomeUSD: decimal("net_income_usd", { precision: 12, scale: 2 }),
  ebitdaUSD: decimal("ebitda_usd", { precision: 12, scale: 2 }),
  cashFlowUSD: decimal("cash_flow_usd", { precision: 12, scale: 2 }),
  
  // Metrics (Currency-agnostic percentages)
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }), // Percentage
  roi: decimal("roi", { precision: 5, scale: 2 }), // Percentage
  paybackPeriodMonths: integer("payback_period_months"),
  
  // Period
  financialYear: integer("financial_year"), // 2023, 2024
  currency: text("currency").notNull().default("USD"), // Original currency for this financial record
  exchangeRateToUSD: decimal("exchange_rate_to_usd", { precision: 10, scale: 6 }), // Exchange rate used for conversion
  
  // Verification
  verified: boolean("verified").default(false),
  verificationDocument: text("verification_document"), // URL to tax returns, etc.
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for listing financial lookups
    listingIdx: index("listing_financials_listing_idx").on(table.listingId),
  };
});

export const insertListingFinancialSchema = createInsertSchema(listingFinancials).omit({
  id: true,
  createdAt: true,
});

export type InsertListingFinancial = z.infer<typeof insertListingFinancialSchema>;
export type ListingFinancial = typeof listingFinancials.$inferSelect;

// Listing Equipment Inventory
export const listingEquipment = pgTable("listing_equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id),
  
  // Equipment Details
  equipmentType: text("equipment_type").notNull(), // "washer", "dryer", "folder", "vending", "payment_system"
  brand: text("brand").notNull(), // "Speed Queen", "Dexter", "Huebsch"
  model: text("model"),
  capacity: integer("capacity"), // lbs or kg
  quantity: integer("quantity").notNull(),
  
  // Condition
  condition: text("condition").notNull(), // "new", "excellent", "good", "fair", "poor"
  yearInstalled: integer("year_installed"),
  ageYears: integer("age_years"),
  
  // Value
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  replacementCost: decimal("replacement_cost", { precision: 10, scale: 2 }),
  
  // Performance
  turnsPerDay: integer("turns_per_day"),
  efficiency: text("efficiency"), // "Energy Star", "Standard"
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for listing equipment lookups
    listingIdx: index("listing_equipment_listing_idx").on(table.listingId),
  };
});

export const insertListingEquipmentSchema = createInsertSchema(listingEquipment).omit({
  id: true,
  createdAt: true,
});

export type InsertListingEquipment = z.infer<typeof insertListingEquipmentSchema>;
export type ListingEquipment = typeof listingEquipment.$inferSelect;

// Listing Media (Images, Documents)
export const listingMedia = pgTable("listing_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id),
  
  // Media Details
  type: text("type").notNull(), // "image", "video", "document", "floor_plan"
  url: text("url").notNull(),
  filename: text("filename"),
  
  // Metadata
  title: text("title"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  
  // Visibility & NDA Protection
  // IMPORTANT: Application logic MUST ensure media.requiresNDA matches parent listings.requiresNDA
  // If listings.requiresNDA = true, ALL sensitive media MUST have requiresNDA = true
  // Application MUST verify user has approved NDA (ndaRequests.status = 'approved') before serving this media
  requiresNDA: boolean("requires_nda").default(false), // Some images only visible after NDA
  
  // Image-specific
  width: integer("width"),
  height: integer("height"),
  thumbnail: text("thumbnail"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for listing media lookups
    listingIdx: index("listing_media_listing_idx").on(table.listingId),
  };
});

export const insertListingMediaSchema = createInsertSchema(listingMedia).omit({
  id: true,
  createdAt: true,
});

export type InsertListingMedia = z.infer<typeof insertListingMediaSchema>;
export type ListingMedia = typeof listingMedia.$inferSelect;

// Broker Portfolios (Brokers managing multiple listings)
export const brokerProfiles = pgTable("broker_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Business Info
  companyName: text("company_name").notNull(),
  licenseNumber: text("license_number"),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  
  // Profile
  bio: text("bio"),
  specializations: text("specializations").array(), // ["laundromats", "car_washes"]
  yearsExperience: integer("years_experience"),
  
  // Service Areas
  countries: text("countries").array(),
  regions: text("regions").array(),
  
  // Metrics
  totalListings: integer("total_listings").default(0),
  activeListings: integer("active_listings").default(0),
  soldListings: integer("sold_listings").default(0),
  averageDaysToSell: integer("average_days_to_sell"),
  
  // Verification
  verified: boolean("verified").default(false),
  verificationDocument: text("verification_document"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for broker user lookups
    userIdx: index("broker_profiles_user_idx").on(table.userId),
  };
});

export const insertBrokerProfileSchema = createInsertSchema(brokerProfiles).omit({
  id: true,
  totalListings: true,
  activeListings: true,
  soldListings: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBrokerProfile = z.infer<typeof insertBrokerProfileSchema>;
export type BrokerProfile = typeof brokerProfiles.$inferSelect;

// NDA Requests (Digital NDA Workflow)
export const ndaRequests = pgTable("nda_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Requester Info
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name"),
  
  // NDA Details
  ndaDocument: text("nda_document"), // URL to signed NDA PDF
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Digital Signature
  signature: text("signature"), // Base64 signature image or text signature
  signedAt: timestamp("signed_at"),
  
  // Status
  status: text("status").notNull().default("pending"), // "pending", "signed", "approved", "rejected"
  approvedBy: varchar("approved_by").references(() => users.id), // Broker who approved
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  
  // Access Expiration
  expiresAt: timestamp("expires_at"), // NDA access expires after X days
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Composite index for NDA request queries (by listing and status)
    listingStatusIdx: index("nda_requests_listing_status_idx").on(table.listingId, table.status),
  };
});

export const insertNdaRequestSchema = createInsertSchema(ndaRequests).omit({
  id: true,
  signedAt: true,
  approvedAt: true,
  createdAt: true,
});

export type InsertNdaRequest = z.infer<typeof insertNdaRequestSchema>;
export type NdaRequest = typeof ndaRequests.$inferSelect;

// Listing Inquiries (Interest from buyers)
export const listingInquiries = pgTable("listing_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Inquirer Info
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  
  // Inquiry Details
  message: text("message").notNull(),
  investmentBudget: decimal("investment_budget", { precision: 12, scale: 2 }),
  financingPreApproved: boolean("financing_pre_approved").default(false),
  timeline: text("timeline"), // "immediate", "3_months", "6_months", "1_year"
  
  // Status
  status: text("status").notNull().default("new"), // "new", "contacted", "viewing_scheduled", "offer_made", "closed"
  response: text("response"),
  respondedAt: timestamp("responded_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for listing inquiry lookups
    listingIdx: index("listing_inquiries_listing_idx").on(table.listingId),
  };
});

export const insertListingInquirySchema = createInsertSchema(listingInquiries).omit({
  id: true,
  respondedAt: true,
  createdAt: true,
});

export type InsertListingInquiry = z.infer<typeof insertListingInquirySchema>;
export type ListingInquiry = typeof listingInquiries.$inferSelect;

// Listing Views (Analytics)
export const listingViews = pgTable("listing_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id),
  userId: varchar("user_id").references(() => users.id), // null for anonymous
  
  // Session Info
  sessionId: text("session_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  
  // Location
  country: text("country"),
  region: text("region"),
  city: text("city"),
  
  // Engagement
  timeOnPage: integer("time_on_page"), // seconds
  scrollDepth: integer("scroll_depth"), // percentage
  
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Index for listing view analytics
    listingIdx: index("listing_views_listing_idx").on(table.listingId),
  };
});

export const insertListingViewSchema = createInsertSchema(listingViews).omit({
  id: true,
  viewedAt: true,
});

export type InsertListingView = z.infer<typeof insertListingViewSchema>;
export type ListingView = typeof listingViews.$inferSelect;

// Premium Packages (Paywall Tiers)
export const premiumPackages = pgTable("premium_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Package Details
  name: text("name").notNull(), // "Featured Homepage", "Priority Search", "Visibility Boost"
  description: text("description").notNull(),
  features: text("features").array(),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  billingPeriod: text("billing_period").notNull(), // "one_time", "monthly", "yearly"
  
  // Benefits
  featuredHomepage: boolean("featured_homepage").default(false),
  prioritySearch: boolean("priority_search").default(false),
  visibilityBoostLevel: integer("visibility_boost_level").default(0), // 0-5
  cleanbiReportsIncluded: integer("cleanbi_reports_included").default(0),
  valuationReportsIncluded: integer("valuation_reports_included").default(0),
  
  // Status
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPremiumPackageSchema = createInsertSchema(premiumPackages).omit({
  id: true,
  createdAt: true,
});

export type InsertPremiumPackage = z.infer<typeof insertPremiumPackageSchema>;
export type PremiumPackage = typeof premiumPackages.$inferSelect;

// Listing Premium Purchases (Track premium upgrades)
export const listingPremiumPurchases = pgTable("listing_premium_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id),
  packageId: varchar("package_id").references(() => premiumPackages.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Payment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  
  // Duration
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Status
  status: text("status").notNull().default("active"), // "active", "expired", "cancelled"
  
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

export const insertListingPremiumPurchaseSchema = createInsertSchema(listingPremiumPurchases).omit({
  id: true,
  purchasedAt: true,
});

export type InsertListingPremiumPurchase = z.infer<typeof insertListingPremiumPurchaseSchema>;
export type ListingPremiumPurchase = typeof listingPremiumPurchases.$inferSelect;

// ============================================================================
// PREMIUM TEMPLATES (Design, Business Setup, Marketing Packages)
// ============================================================================

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Template Metadata
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "design", "business", "marketing", "operations"
  subcategory: text("subcategory"), // "layout", "equipment", "branding", "social_media", etc.
  
  // Content
  preview: text("preview"), // Preview image/thumbnail
  content: jsonb("content").notNull(), // Template data (layout, config, checklist, etc)
  
  // Pricing & Access
  isPremium: boolean("is_premium").notNull().default(true),
  price: decimal("price", { precision: 10, scale: 2 }), // USD price for individual purchase
  stripeProductId: text("stripe_product_id"), // Stripe product ID for payment
  
  // Metadata
  tags: text("tags").array(), // Search tags
  featured: boolean("featured").notNull().default(false),
  viewCount: integer("view_count").default(0).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }), // Average rating 0-5
  reviewCount: integer("review_count").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  viewCount: true,
  downloadCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Template Downloads (Track user access to templates)
export const templateDownloads = pgTable("template_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => templates.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Payment
  isPaid: boolean("is_paid").notNull().default(false),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  stripePaymentId: text("stripe_payment_id"),
  
  // Timestamps
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
});

export const insertTemplateDownloadSchema = createInsertSchema(templateDownloads).omit({
  id: true,
  downloadedAt: true,
});

export type InsertTemplateDownload = z.infer<typeof insertTemplateDownloadSchema>;
export type TemplateDownload = typeof templateDownloads.$inferSelect;

// ============================================================================
// COMPREHENSIVE RESOURCE LIBRARY (Industry Ecosystem)
// ============================================================================

// Resources (Calculators, Guides, Tools for entire industry)
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Resource Details
  title: text("title").notNull(),
  description: text("description").notNull(),
  slug: text("slug").notNull().unique(),
  
  // Type & Category
  resourceType: text("resource_type").notNull(), // "calculator", "guide", "checklist", "template", "tool"
  category: text("category").notNull(), // "financial", "operational", "marketing", "legal", "technical"
  
  // Target Audience (Industry Segment)
  targetAudience: text("target_audience").array().notNull(), // ["owner", "investor", "broker", "technician", "distributor", "contractor", "lender", "marketing_agency", "software_vendor", "insurance_provider", "customer"]
  businessStage: text("business_stage").array(), // ["researching", "planning", "acquiring", "operating", "selling", "multi_store"]
  
  // Content
  content: text("content"), // Markdown/HTML content for guides
  embedUrl: text("embed_url"), // For calculator embeds
  previewImage: text("preview_image"),
  
  // Calculator-specific fields
  calculatorInputs: jsonb("calculator_inputs"), // Input field definitions
  calculatorFormulas: jsonb("calculator_formulas"), // Calculation logic
  
  // Access Control
  isPremium: boolean("is_premium").notNull().default(false),
  requiredTier: text("required_tier"), // "free", "pro", "enterprise"
  price: decimal("price", { precision: 10, scale: 2 }), // One-time purchase price
  
  // Metadata
  tags: text("tags").array(),
  difficulty: text("difficulty"), // "beginner", "intermediate", "advanced"
  estimatedTime: integer("estimated_time"), // Minutes to complete/read
  featured: boolean("featured").notNull().default(false),
  
  // Engagement Stats
  viewCount: integer("view_count").default(0).notNull(),
  useCount: integer("use_count").default(0).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0).notNull(),
  
  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: uniqueIndex("resources_slug_idx").on(table.slug),
    typeIdx: index("resources_type_idx").on(table.resourceType),
    categoryIdx: index("resources_category_idx").on(table.category),
  };
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  viewCount: true,
  useCount: true,
  downloadCount: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Resource Usage Tracking
export const resourceUsage = pgTable("resource_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resourceId: varchar("resource_id").references(() => resources.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  
  // Usage Details
  actionType: text("action_type").notNull(), // "view", "use", "download", "save"
  inputData: jsonb("input_data"), // For calculators: capture inputs
  resultData: jsonb("result_data"), // For calculators: capture outputs
  
  // Session Info
  sessionId: text("session_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  usedAt: timestamp("used_at").defaultNow().notNull(),
}, (table) => {
  return {
    resourceIdx: index("resource_usage_resource_idx").on(table.resourceId),
    userIdx: index("resource_usage_user_idx").on(table.userId),
  };
});

export const insertResourceUsageSchema = createInsertSchema(resourceUsage).omit({
  id: true,
  usedAt: true,
});

export type InsertResourceUsage = z.infer<typeof insertResourceUsageSchema>;
export type ResourceUsage = typeof resourceUsage.$inferSelect;

// Vendor Directory (Enhanced with Reviews & Ratings)
export const vendorDirectory = pgTable("vendor_directory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Company Info
  companyName: text("company_name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  
  // Category & Services
  primaryCategory: text("primary_category").notNull(), // "equipment_distributor", "parts_supplier", "service_technician", "marketing_agency", "software_vendor", "insurance_provider", "lender", "contractor", "consultant"
  services: text("services").array().notNull(), // Detailed service offerings
  brands: text("brands").array(), // Equipment brands they carry
  
  // Contact
  website: text("website"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  
  // Coverage Area
  serviceAreas: text("service_areas").array(), // States/regions they serve
  nationwide: boolean("nationwide").default(false),
  
  // Media
  logo: text("logo"),
  images: jsonb("images"), // Gallery images
  
  // Verification
  verified: boolean("verified").default(false).notNull(),
  certifications: text("certifications").array(), // Industry certifications
  yearsInBusiness: integer("years_in_business"),
  
  // Ratings & Stats
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0).notNull(),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }), // % of inquiries responded to
  avgResponseTime: integer("avg_response_time"), // Hours
  
  // Engagement
  viewCount: integer("view_count").default(0).notNull(),
  inquiryCount: integer("inquiry_count").default(0).notNull(),
  
  // Premium Features
  featured: boolean("featured").default(false),
  premiumTier: text("premium_tier"), // "basic", "pro", "enterprise"
  
  // Status
  status: text("status").notNull().default("active"), // "active", "inactive", "suspended"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: uniqueIndex("vendor_directory_slug_idx").on(table.slug),
    categoryIdx: index("vendor_directory_category_idx").on(table.primaryCategory),
  };
});

export const insertVendorDirectorySchema = createInsertSchema(vendorDirectory).omit({
  id: true,
  rating: true,
  reviewCount: true,
  viewCount: true,
  inquiryCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVendorDirectory = z.infer<typeof insertVendorDirectorySchema>;
export type VendorDirectory = typeof vendorDirectory.$inferSelect;

// Vendor Reviews
export const vendorReviews = pgTable("vendor_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendorDirectory.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Review Content
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  content: text("content").notNull(),
  
  // Detailed Ratings
  qualityRating: integer("quality_rating"), // 1-5
  valueRating: integer("value_rating"), // 1-5
  serviceRating: integer("service_rating"), // 1-5
  responsiveness: integer("responsiveness"), // 1-5
  
  // Transaction Details
  serviceUsed: text("service_used"),
  projectCost: decimal("project_cost", { precision: 10, scale: 2 }),
  wouldRecommend: boolean("would_recommend").notNull(),
  
  // Verification
  verified: boolean("verified").default(false), // Verified purchase/service
  
  // Engagement
  helpfulCount: integer("helpful_count").default(0).notNull(),
  notHelpfulCount: integer("not_helpful_count").default(0).notNull(),
  
  // Response
  vendorResponse: text("vendor_response"),
  vendorRespondedAt: timestamp("vendor_responded_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    vendorIdx: index("vendor_reviews_vendor_idx").on(table.vendorId),
    userIdx: index("vendor_reviews_user_idx").on(table.userId),
  };
});

export const insertVendorReviewSchema = createInsertSchema(vendorReviews).omit({
  id: true,
  helpfulCount: true,
  notHelpfulCount: true,
  vendorRespondedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVendorReview = z.infer<typeof insertVendorReviewSchema>;
export type VendorReview = typeof vendorReviews.$inferSelect;

// Industry Benchmarks (For comparison and analysis)
export const industryBenchmarks = pgTable("industry_benchmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Benchmark Category
  category: text("category").notNull(), // "revenue", "expenses", "equipment", "labor", "marketing"
  metric: text("metric").notNull(), // "revenue_per_sqft", "utility_cost_percentage", "turns_per_day", etc.
  
  // Geographic Filters
  country: text("country").default("US"),
  region: text("region"), // State or multi-state region
  
  // Business Filters
  businessType: text("business_type").default("laundromat"), // "laundromat", "car_wash", "dry_cleaner"
  storeSize: text("store_size"), // "small", "medium", "large"
  
  // Statistical Data
  sampleSize: integer("sample_size").notNull(),
  median: decimal("median", { precision: 12, scale: 4 }).notNull(),
  average: decimal("average", { precision: 12, scale: 4 }).notNull(),
  percentile25: decimal("percentile_25", { precision: 12, scale: 4 }),
  percentile75: decimal("percentile_75", { precision: 12, scale: 4 }),
  minimum: decimal("minimum", { precision: 12, scale: 4 }),
  maximum: decimal("maximum", { precision: 12, scale: 4 }),
  
  // Unit & Context
  unit: text("unit").notNull(), // "USD", "percentage", "count", "sqft", etc.
  description: text("description").notNull(),
  
  // Data Period
  periodType: text("period_type").notNull(), // "annual", "monthly", "quarterly"
  year: integer("year").notNull(),
  quarter: integer("quarter"),
  
  // Source
  dataSource: text("data_source"), // "industry_survey", "user_submitted", "third_party"
  
  // Status
  published: boolean("published").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    categoryMetricIdx: index("industry_benchmarks_category_metric_idx").on(table.category, table.metric),
    yearIdx: index("industry_benchmarks_year_idx").on(table.year),
  };
});

export const insertIndustryBenchmarkSchema = createInsertSchema(industryBenchmarks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIndustryBenchmark = z.infer<typeof insertIndustryBenchmarkSchema>;
export type IndustryBenchmark = typeof industryBenchmarks.$inferSelect;

// ============================================================================
// PROFESSIONAL FORUM SYSTEM
// ============================================================================

// Forum Categories
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // Icon name from lucide-react
  slug: text("slug").notNull().unique(),
  order: integer("order").notNull().default(0),
  color: text("color").default("#C8A661"), // Bloomberg gold by default
  parentId: varchar("parent_id"),
  
  // Stats
  totalTopics: integer("total_topics").default(0).notNull(),
  totalPosts: integer("total_posts").default(0).notNull(),
  
  // Settings
  requiresAuth: boolean("requires_auth").default(false),
  isPro: boolean("is_pro").default(false), // Pro members only
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("forum_categories_slug_idx").on(table.slug),
}));

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
  totalTopics: true,
  totalPosts: true,
  createdAt: true,
});

export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumCategory = typeof forumCategories.$inferSelect;

// Forum Topics
export const forumTopics = pgTable("forum_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => forumCategories.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown content
  slug: text("slug").notNull(),
  
  // Tags
  tags: jsonb("tags").default([]).notNull(), // Array of tag strings
  
  // Stats
  views: integer("views").default(0).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  score: integer("score").default(0).notNull(), // upvotes - downvotes
  
  // Status
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  isSolved: boolean("is_solved").default(false),
  bestAnswerId: varchar("best_answer_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("forum_topics_category_idx").on(table.categoryId),
  userIdx: index("forum_topics_user_idx").on(table.userId),
  slugIdx: index("forum_topics_slug_idx").on(table.slug),
  activityIdx: index("forum_topics_activity_idx").on(table.lastActivityAt),
}));

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  views: true,
  replyCount: true,
  upvotes: true,
  downvotes: true,
  score: true,
  createdAt: true,
  updatedAt: true,
  lastActivityAt: true,
});

export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;

// Forum Replies
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").references(() => forumTopics.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  parentId: varchar("parent_id"), // For nested replies
  
  content: text("content").notNull(), // Markdown content
  
  // Stats
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  score: integer("score").default(0).notNull(),
  
  // Status
  isBestAnswer: boolean("is_best_answer").default(false),
  isEdited: boolean("is_edited").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  topicIdx: index("forum_replies_topic_idx").on(table.topicId),
  userIdx: index("forum_replies_user_idx").on(table.userId),
  parentIdx: index("forum_replies_parent_idx").on(table.parentId),
}));

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  score: true,
  isBestAnswer: true,
  isEdited: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

// Forum Votes
export const forumVotes = pgTable("forum_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  entityType: text("entity_type").notNull(), // "topic" or "reply"
  entityId: varchar("entity_id").notNull(), // topicId or replyId
  voteType: integer("vote_type").notNull(), // 1 for upvote, -1 for downvote
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userEntityIdx: uniqueIndex("forum_votes_user_entity_idx").on(table.userId, table.entityType, table.entityId),
  entityIdx: index("forum_votes_entity_idx").on(table.entityType, table.entityId),
}));

export const insertForumVoteSchema = createInsertSchema(forumVotes).omit({
  id: true,
  createdAt: true,
});

export type InsertForumVote = z.infer<typeof insertForumVoteSchema>;
export type ForumVote = typeof forumVotes.$inferSelect;

// ==================== PLATFORM SETTINGS ====================

export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category").notNull(), // "general", "email", "security", "payments"
  key: varchar("key").notNull().unique(),
  value: jsonb("value").notNull(),
  dataType: varchar("data_type").notNull(), // "string", "number", "boolean", "json"
  label: text("label").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(), // Can be accessed by non-admins
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;

// ==================== NEWSLETTER CAMPAIGNS ====================

export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(), // HTML content
  status: varchar("status").notNull().default("draft"), // "draft", "scheduled", "sending", "sent", "failed"
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  
  // Targeting
  recipientFilter: jsonb("recipient_filter"), // Filter criteria for email_subscribers
  recipientCount: integer("recipient_count").default(0),
  
  // Delivery Stats
  totalSent: integer("total_sent").default(0),
  totalDelivered: integer("total_delivered").default(0),
  totalFailed: integer("total_failed").default(0),
  totalOpened: integer("total_opened").default(0),
  totalClicked: integer("total_clicked").default(0),
  
  // Meta
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNewsletterCampaignSchema = createInsertSchema(newsletterCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  recipientFilter: z.record(z.any()).optional(),
});

export type InsertNewsletterCampaign = z.infer<typeof insertNewsletterCampaignSchema>;
export type NewsletterCampaign = typeof newsletterCampaigns.$inferSelect;

// Enriched forum types with author information
export type ForumAuthor = {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  tagline: string | null;
  role: string | null;
};

export type EnrichedForumTopic = ForumTopic & {
  author: ForumAuthor;
};

export type EnrichedForumReply = ForumReply & {
  author: ForumAuthor;
};

// User Reputation Events
export const reputationEvents = pgTable("reputation_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(), // Positive or negative
  reason: text("reason").notNull(), // "topic_upvoted", "reply_marked_best", etc.
  entityType: text("entity_type"), // "topic", "reply"
  entityId: varchar("entity_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("reputation_events_user_idx").on(table.userId),
}));

export const insertReputationEventSchema = createInsertSchema(reputationEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertReputationEvent = z.infer<typeof insertReputationEventSchema>;
export type ReputationEvent = typeof reputationEvents.$inferSelect;

// Badges
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // Icon name or URL
  tier: text("tier").notNull(), // "bronze", "silver", "gold", "platinum"
  category: text("category").notNull(), // "participation", "quality", "moderation"
  requirement: text("requirement").notNull(), // Description of how to earn
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// Badge Awards
export const badgeAwards = pgTable("badge_awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: varchar("badge_id").references(() => badges.id).notNull(),
  
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
}, (table) => ({
  userBadgeIdx: uniqueIndex("badge_awards_user_badge_idx").on(table.userId, table.badgeId),
}));

export const insertBadgeAwardSchema = createInsertSchema(badgeAwards).omit({
  id: true,
  awardedAt: true,
});

export type InsertBadgeAward = z.infer<typeof insertBadgeAwardSchema>;
export type BadgeAward = typeof badgeAwards.$inferSelect;

// ============================================================================
// AI AGENT BUILDER
// ============================================================================

// AI Agents
export const aiAgents = pgTable("ai_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry").default("laundromat"), // laundromat, car_wash, dry_cleaner
  
  // Configuration
  primaryModel: text("primary_model").notNull(), // "openai", "anthropic", "gemini", "perplexity"
  systemPrompt: text("system_prompt").notNull(),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default("0.7"),
  
  // Widget Settings
  widgetTitle: text("widget_title").default("Chat with us"),
  widgetColor: text("widget_color").default("#C8A661"),
  widgetPosition: text("widget_position").default("bottom-right"), // bottom-right, bottom-left
  
  // Knowledge Base
  knowledgeBase: jsonb("knowledge_base").default([]).notNull(), // Array of text chunks
  
  // Stats
  totalConversations: integer("total_conversations").default(0).notNull(),
  totalMessages: integer("total_messages").default(0).notNull(),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  
  // Status
  isPublished: boolean("is_published").default(false),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("ai_agents_user_idx").on(table.userId),
}));

export const insertAiAgentSchema = createInsertSchema(aiAgents).omit({
  id: true,
  totalConversations: true,
  totalMessages: true,
  averageRating: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiAgent = z.infer<typeof insertAiAgentSchema>;
export type AiAgent = typeof aiAgents.$inferSelect;

// Agent Conversation Flows
export const agentFlows = pgTable("agent_flows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => aiAgents.id).notNull(),
  
  name: text("name").notNull(),
  description: text("description"),
  
  // Flow data (visual flow builder)
  nodes: jsonb("nodes").notNull(), // Array of flow nodes
  edges: jsonb("edges").notNull(), // Array of connections
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("agent_flows_agent_idx").on(table.agentId),
}));

export const insertAgentFlowSchema = createInsertSchema(agentFlows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentFlow = z.infer<typeof insertAgentFlowSchema>;
export type AgentFlow = typeof agentFlows.$inferSelect;

// Agent Knowledge Sources
export const agentKnowledgeSources = pgTable("agent_knowledge_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => aiAgents.id).notNull(),
  
  type: text("type").notNull(), // "text", "url", "file", "faq"
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url"),
  
  // Processing
  isProcessed: boolean("is_processed").default(false),
  chunkCount: integer("chunk_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("agent_knowledge_sources_agent_idx").on(table.agentId),
}));

export const insertAgentKnowledgeSourceSchema = createInsertSchema(agentKnowledgeSources).omit({
  id: true,
  isProcessed: true,
  chunkCount: true,
  createdAt: true,
});

export type InsertAgentKnowledgeSource = z.infer<typeof insertAgentKnowledgeSourceSchema>;
export type AgentKnowledgeSource = typeof agentKnowledgeSources.$inferSelect;

// Agent Conversations
export const agentConversations = pgTable("agent_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => aiAgents.id).notNull(),
  
  visitorId: text("visitor_id"), // Anonymous visitor ID
  userId: varchar("user_id").references(() => users.id), // If logged in
  
  messages: jsonb("messages").notNull(), // Array of messages
  
  // Metadata
  userEmail: text("user_email"),
  userName: text("user_name"),
  userPhone: text("user_phone"),
  
  // Stats
  messageCount: integer("message_count").default(0).notNull(),
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  
  // Status
  isResolved: boolean("is_resolved").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("agent_conversations_agent_idx").on(table.agentId),
  visitorIdx: index("agent_conversations_visitor_idx").on(table.visitorId),
}));

export const insertAgentConversationSchema = createInsertSchema(agentConversations).omit({
  id: true,
  messageCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentConversation = z.infer<typeof insertAgentConversationSchema>;
export type AgentConversation = typeof agentConversations.$inferSelect;

// Agent Templates
export const agentTemplates = pgTable("agent_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(), // "laundromat", "car_wash", "dry_cleaner"
  category: text("category").notNull(), // "customer_service", "sales", "support", "booking"
  
  // Template Data
  systemPrompt: text("system_prompt").notNull(),
  sampleQuestions: jsonb("sample_questions").notNull(), // Array of common questions
  knowledgeBaseTemplate: text("knowledge_base_template"),
  
  // Customization
  previewImage: text("preview_image"),
  isPro: boolean("is_pro").default(false),
  
  // Stats
  useCount: integer("use_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAgentTemplateSchema = createInsertSchema(agentTemplates).omit({
  id: true,
  useCount: true,
  rating: true,
  createdAt: true,
});

export type InsertAgentTemplate = z.infer<typeof insertAgentTemplateSchema>;
export type AgentTemplate = typeof agentTemplates.$inferSelect;

// ============================================================================
// WEBSITE BUILDER
// ============================================================================

// Website Projects
export const siteProjects = pgTable("site_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry").default("laundromat"), // laundromat, car_wash, dry_cleaner
  
  // Domain
  customDomain: text("custom_domain"),
  subdomain: text("subdomain").unique(), // washbizhub subdomain
  
  // Design
  theme: text("theme").default("modern"), // modern, classic, minimal
  primaryColor: text("primary_color").default("#C8A661"),
  secondaryColor: text("secondary_color").default("#1a2332"),
  fontFamily: text("font_family").default("Inter"),
  
  // SEO
  siteTitle: text("site_title"),
  siteDescription: text("site_description"),
  seoKeywords: jsonb("seo_keywords"),
  
  // Status
  isPublished: boolean("is_published").default(false),
  publishedUrl: text("published_url"),
  
  // Stats
  totalViews: integer("total_views").default(0).notNull(),
  totalLeads: integer("total_leads").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  userIdx: index("site_projects_user_idx").on(table.userId),
  subdomainIdx: uniqueIndex("site_projects_subdomain_idx").on(table.subdomain),
}));

export const insertSiteProjectSchema = createInsertSchema(siteProjects).omit({
  id: true,
  totalViews: true,
  totalLeads: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export type InsertSiteProject = z.infer<typeof insertSiteProjectSchema>;
export type SiteProject = typeof siteProjects.$inferSelect;

// Website Pages
export const sitePages = pgTable("site_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => siteProjects.id).notNull(),
  
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  order: integer("order").default(0).notNull(),
  
  // SEO
  metaDescription: text("meta_description"),
  metaKeywords: jsonb("meta_keywords"),
  ogImage: text("og_image"),
  
  // Status
  isPublished: boolean("is_published").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("site_pages_project_idx").on(table.projectId),
}));

export const insertSitePageSchema = createInsertSchema(sitePages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSitePage = z.infer<typeof insertSitePageSchema>;
export type SitePage = typeof sitePages.$inferSelect;

// Page Sections
export const pageSections = pgTable("page_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").references(() => sitePages.id).notNull(),
  
  type: text("type").notNull(), // "hero", "features", "testimonials", "cta", "gallery", etc.
  order: integer("order").notNull(),
  
  // Layout
  layout: text("layout").default("default"), // default, wide, narrow, full-width
  backgroundColor: text("background_color"),
  backgroundImage: text("background_image"),
  
  // Content (flexible JSON structure)
  content: jsonb("content").notNull(),
  
  // Settings
  padding: text("padding").default("normal"), // none, small, normal, large
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pageIdx: index("page_sections_page_idx").on(table.pageId),
}));

export const insertPageSectionSchema = createInsertSchema(pageSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPageSection = z.infer<typeof insertPageSectionSchema>;
export type PageSection = typeof pageSections.$inferSelect;

// Media Assets
export const mediaAssets = pgTable("media_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  projectId: varchar("project_id").references(() => siteProjects.id),
  
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // image/png, image/jpeg, etc.
  fileSize: integer("file_size").notNull(), // bytes
  url: text("url").notNull(),
  
  // Image metadata
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("media_assets_user_idx").on(table.userId),
  projectIdx: index("media_assets_project_idx").on(table.projectId),
}));

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});

export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;

// Website Templates
export const websiteTemplates = pgTable("website_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(), // "laundromat", "car_wash", "dry_cleaner"
  category: text("category").notNull(), // "business", "landing", "ecommerce", "portfolio"
  
  // Preview
  previewImage: text("preview_image").notNull(),
  demoUrl: text("demo_url"),
  
  // Template Data
  pages: jsonb("pages").notNull(), // Array of page configurations
  theme: jsonb("theme").notNull(), // Colors, fonts, spacing
  
  // Features
  features: jsonb("features").notNull(), // Array of feature names
  isPro: boolean("is_pro").default(false),
  
  // Stats
  useCount: integer("use_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebsiteTemplateSchema = createInsertSchema(websiteTemplates).omit({
  id: true,
  useCount: true,
  rating: true,
  createdAt: true,
});

export type InsertWebsiteTemplate = z.infer<typeof insertWebsiteTemplateSchema>;
export type WebsiteTemplate = typeof websiteTemplates.$inferSelect;

// Customer Websites (Deployed from Templates)
export const customerWebsites = pgTable("customer_websites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  templateId: varchar("template_id").references(() => websiteTemplates.id),
  
  // Site Identity
  businessName: text("business_name").notNull(),
  slug: text("slug").unique().notNull(), // subdomain like "joes-laundry"
  customDomain: text("custom_domain"), // Optional custom domain
  
  // Site Data (copied from template)
  pages: jsonb("pages").notNull(),
  theme: jsonb("theme").notNull(),
  
  // Status
  status: text("status").default("draft").notNull(), // draft, published, archived
  publishedAt: timestamp("published_at"),
  
  // Stats
  pageviews: integer("pageviews").default(0).notNull(),
  lastVisitedAt: timestamp("last_visited_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerWebsiteSchema = createInsertSchema(customerWebsites).omit({
  id: true,
  pageviews: true,
  lastVisitedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerWebsite = z.infer<typeof insertCustomerWebsiteSchema>;
export type CustomerWebsite = typeof customerWebsites.$inferSelect;

// ============================================================================
// LOGO BUILDER
// ============================================================================

// Logo Projects
export const logoProjects = pgTable("logo_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  name: text("name").notNull(),
  businessName: text("business_name").notNull(),
  tagline: text("tagline"),
  industry: text("industry").default("laundromat"),
  
  // Design Data
  design: jsonb("design").notNull(), // Canvas state, elements, fonts, colors
  
  // Export Settings
  backgroundColor: text("background_color").default("#FFFFFF"),
  exportFormats: jsonb("export_formats").default(["png", "svg"]).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("logo_projects_user_idx").on(table.userId),
}));

export const insertLogoProjectSchema = createInsertSchema(logoProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLogoProject = z.infer<typeof insertLogoProjectSchema>;
export type LogoProject = typeof logoProjects.$inferSelect;

// Logo Templates
export const logoTemplates = pgTable("logo_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(), // "laundromat", "car_wash", "dry_cleaner", "general"
  style: text("style").notNull(), // "modern", "classic", "minimal", "bold", "playful"
  
  // Template Data
  design: jsonb("design").notNull(), // Default design configuration
  previewImage: text("preview_image").notNull(),
  
  // Customization Options
  customizableElements: jsonb("customizable_elements").notNull(), // Array of editable parts
  colorSchemes: jsonb("color_schemes").notNull(), // Suggested color combinations
  
  isPro: boolean("is_pro").default(false),
  
  // Stats
  useCount: integer("use_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLogoTemplateSchema = createInsertSchema(logoTemplates).omit({
  id: true,
  useCount: true,
  rating: true,
  createdAt: true,
});

export type InsertLogoTemplate = z.infer<typeof insertLogoTemplateSchema>;
export type LogoTemplate = typeof logoTemplates.$inferSelect;

// ============================================================================
// AD BANNER BUILDER
// ============================================================================

// Banner Projects
export const bannerProjects = pgTable("banner_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  name: text("name").notNull(),
  size: text("size").notNull(), // "300x250", "728x90", "160x600", "320x50", "300x600"
  format: text("format").default("static"), // "static" or "animated"
  
  // Design Data
  design: jsonb("design").notNull(), // Canvas state, layers, animations
  
  // Ad Settings
  clickUrl: text("click_url"),
  
  // Export
  exportUrl: text("export_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("banner_projects_user_idx").on(table.userId),
}));

export const insertBannerProjectSchema = createInsertSchema(bannerProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBannerProject = z.infer<typeof insertBannerProjectSchema>;
export type BannerProject = typeof bannerProjects.$inferSelect;

// Banner Templates
export const bannerTemplates = pgTable("banner_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(),
  size: text("size").notNull(), // "300x250", "728x90", etc.
  
  // Template Data
  design: jsonb("design").notNull(),
  previewImage: text("preview_image").notNull(),
  
  // Features
  isAnimated: boolean("is_animated").default(false),
  isPro: boolean("is_pro").default(false),
  
  // Stats
  useCount: integer("use_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBannerTemplateSchema = createInsertSchema(bannerTemplates).omit({
  id: true,
  useCount: true,
  rating: true,
  createdAt: true,
});

export type InsertBannerTemplate = z.infer<typeof insertBannerTemplateSchema>;
export type BannerTemplate = typeof bannerTemplates.$inferSelect;

// ============================================================================
// ENHANCED CALCULATOR SYSTEM
// ============================================================================

// Calculator Configs
export const calculatorConfigs = pgTable("calculator_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "financial", "equipment", "roi", "energy", "custom"
  industry: text("industry").default("laundromat"),
  
  // Calculator Structure
  inputs: jsonb("inputs").notNull(), // Array of input field configurations
  formulas: jsonb("formulas").notNull(), // Array of calculation formulas
  outputs: jsonb("outputs").notNull(), // Array of result displays
  
  // Display
  icon: text("icon"),
  color: text("color").default("#C8A661"),
  
  // Embed Settings
  isEmbeddable: boolean("is_embeddable").default(true),
  embedCode: text("embed_code"),
  
  // Status
  isPublic: boolean("is_public").default(true),
  isPro: boolean("is_pro").default(false),
  
  // Stats
  useCount: integer("use_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("calculator_configs_user_idx").on(table.userId),
  categoryIdx: index("calculator_configs_category_idx").on(table.category),
}));

export const insertCalculatorConfigSchema = createInsertSchema(calculatorConfigs).omit({
  id: true,
  useCount: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCalculatorConfig = z.infer<typeof insertCalculatorConfigSchema>;
export type CalculatorConfig = typeof calculatorConfigs.$inferSelect;

// Calculator Instances (saved calculations)
export const calculatorInstances = pgTable("calculator_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").references(() => calculatorConfigs.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  
  name: text("name"),
  inputs: jsonb("inputs").notNull(), // User's input values
  results: jsonb("results").notNull(), // Calculated results
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  configIdx: index("calculator_instances_config_idx").on(table.configId),
  userIdx: index("calculator_instances_user_idx").on(table.userId),
}));

export const insertCalculatorInstanceSchema = createInsertSchema(calculatorInstances).omit({
  id: true,
  createdAt: true,
});

export type InsertCalculatorInstance = z.infer<typeof insertCalculatorInstanceSchema>;
export type CalculatorInstance = typeof calculatorInstances.$inferSelect;

// ============================================================================
// BLOG SUITE EXPANSION
// ============================================================================

// Blog Series/Collections
export const blogSeries = pgTable("blog_series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  slug: text("slug").notNull().unique(),
  coverImage: text("cover_image"),
  
  // Status
  isPublished: boolean("is_published").default(false),
  
  // Stats
  postCount: integer("post_count").default(0).notNull(),
  totalViews: integer("total_views").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("blog_series_slug_idx").on(table.slug),
}));

export const insertBlogSeriesSchema = createInsertSchema(blogSeries).omit({
  id: true,
  postCount: true,
  totalViews: true,
  createdAt: true,
});

export type InsertBlogSeries = z.infer<typeof insertBlogSeriesSchema>;
export type BlogSeries = typeof blogSeries.$inferSelect;

// Series Membership
export const blogSeriesMembers = pgTable("blog_series_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seriesId: varchar("series_id").references(() => blogSeries.id).notNull(),
  postId: varchar("post_id").references(() => blogPosts.id).notNull(),
  order: integer("order").notNull(),
  
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  seriesPostIdx: uniqueIndex("blog_series_members_series_post_idx").on(table.seriesId, table.postId),
}));

export const insertBlogSeriesMemberSchema = createInsertSchema(blogSeriesMembers).omit({
  id: true,
  addedAt: true,
});

export type InsertBlogSeriesMember = z.infer<typeof insertBlogSeriesMemberSchema>;
export type BlogSeriesMember = typeof blogSeriesMembers.$inferSelect;

// Blog Post Templates
export const blogPostTemplates = pgTable("blog_post_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "how-to", "listicle", "case-study", "news", "opinion"
  
  // Template Structure
  structure: jsonb("structure").notNull(), // Array of content blocks
  sampleContent: text("sample_content").notNull(),
  
  // SEO Template
  seoTitleTemplate: text("seo_title_template"),
  seoDescriptionTemplate: text("seo_description_template"),
  
  isPro: boolean("is_pro").default(false),
  
  // Stats
  useCount: integer("use_count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogPostTemplateSchema = createInsertSchema(blogPostTemplates).omit({
  id: true,
  useCount: true,
  createdAt: true,
});

export type InsertBlogPostTemplate = z.infer<typeof insertBlogPostTemplateSchema>;
export type BlogPostTemplate = typeof blogPostTemplates.$inferSelect;

// ============================================================================
// ENHANCED MARKETPLACE
// ============================================================================

// Marketplace Products
export const marketplaceProducts = pgTable("marketplace_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "washers", "dryers", "parts", "services", "software"
  subcategory: text("subcategory"),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  
  // Images
  images: jsonb("images").default([]).notNull(), // Array of image URLs
  
  // Specifications
  specifications: jsonb("specifications"), // Product specs
  
  // Inventory
  sku: text("sku"),
  stock: integer("stock").default(0),
  isInStock: boolean("is_in_stock").default(true),
  
  // SEO
  slug: text("slug").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  
  // Stats
  views: integer("views").default(0).notNull(),
  sales: integer("sales").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0).notNull(),
  
  // Status
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  vendorIdx: index("marketplace_products_vendor_idx").on(table.vendorId),
  categoryIdx: index("marketplace_products_category_idx").on(table.category),
  slugIdx: index("marketplace_products_slug_idx").on(table.slug),
}));

export const insertMarketplaceProductSchema = createInsertSchema(marketplaceProducts).omit({
  id: true,
  views: true,
  sales: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketplaceProduct = z.infer<typeof insertMarketplaceProductSchema>;
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;

// Advertisement Campaigns
export const adCampaigns = pgTable("ad_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  
  name: text("name").notNull(),
  description: text("description"),
  
  // Campaign Type
  type: text("type").notNull(), // "banner", "sponsored_listing", "featured_placement"
  placement: text("placement").notNull(), // "homepage", "sidebar", "search_results", "category_page"
  
  // Targeting
  targetIndustry: text("target_industry"), // null = all industries
  targetAudience: jsonb("target_audience"), // Demographics, interests, etc.
  
  // Budget & Pricing
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0").notNull(),
  bidAmount: decimal("bid_amount", { precision: 10, scale: 2 }),
  
  // Schedule
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Creative
  bannerUrl: text("banner_url"), // For banner ads
  clickUrl: text("click_url").notNull(),
  
  // Stats
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  
  // Status
  status: text("status").default("pending"), // pending, active, paused, completed, rejected
  isApproved: boolean("is_approved").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("ad_campaigns_user_idx").on(table.userId),
  statusIdx: index("ad_campaigns_status_idx").on(table.status),
}));

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({
  id: true,
  spent: true,
  impressions: true,
  clicks: true,
  conversions: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
export type AdCampaign = typeof adCampaigns.$inferSelect;

// Commission Ledger
export const commissionLedger = pgTable("commission_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Transaction Type
  type: text("type").notNull(), // "product_sale", "ad_revenue", "affiliate_commission", "subscription"
  
  // Parties
  vendorId: varchar("vendor_id").references(() => vendors.id),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id),
  
  // Financial
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  
  // Reference
  referenceType: text("reference_type"), // "product", "campaign", "listing"
  referenceId: varchar("reference_id"),
  
  // Payment
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  vendorIdx: index("commission_ledger_vendor_idx").on(table.vendorId),
  affiliateIdx: index("commission_ledger_affiliate_idx").on(table.affiliateId),
}));

export const insertCommissionLedgerSchema = createInsertSchema(commissionLedger).omit({
  id: true,
  paidAt: true,
  createdAt: true,
});

export type InsertCommissionLedger = z.infer<typeof insertCommissionLedgerSchema>;
export type CommissionLedger = typeof commissionLedger.$inferSelect;

// ============================================================================
// UNIFIED DASHBOARD & ANALYTICS
// ============================================================================

// Module Metrics
export const moduleMetrics = pgTable("module_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  module: text("module").notNull(), // "forum", "agent", "website", "marketplace", "calculator"
  metricType: text("metric_type").notNull(), // "views", "engagement", "revenue", "conversion"
  
  // Time Period
  date: timestamp("date").notNull(),
  period: text("period").notNull(), // "hour", "day", "week", "month"
  
  // Value
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  metadata: jsonb("metadata"), // Additional context
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  moduleIdx: index("module_metrics_module_idx").on(table.module),
  userModuleIdx: index("module_metrics_user_module_idx").on(table.userId, table.module),
  dateIdx: index("module_metrics_date_idx").on(table.date),
}));

export const insertModuleMetricSchema = createInsertSchema(moduleMetrics).omit({
  id: true,
  createdAt: true,
});

export type InsertModuleMetric = z.infer<typeof insertModuleMetricSchema>;
export type ModuleMetric = typeof moduleMetrics.$inferSelect;

// Activity Events
export const activityEvents = pgTable("activity_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  eventType: text("event_type").notNull(), // "forum_post", "agent_chat", "website_published", etc.
  module: text("module").notNull(),
  
  // Event Data
  title: text("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  
  // Reference
  entityType: text("entity_type"),
  entityId: varchar("entity_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("activity_events_user_idx").on(table.userId),
  moduleIdx: index("activity_events_module_idx").on(table.module),
  createdAtIdx: index("activity_events_created_at_idx").on(table.createdAt),
}));

export const insertActivityEventSchema = createInsertSchema(activityEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityEvent = z.infer<typeof insertActivityEventSchema>;
export type ActivityEvent = typeof activityEvents.$inferSelect;

// ============================================================================
// POS SYSTEM & OPERATIONS
// ============================================================================

// POS Transactions - Main order/transaction records
export const posTransactions = pgTable("pos_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Customer Information
  customerId: varchar("customer_id"), // Can be guest (null)
  customerName: text("customer_name"),
  customerPhone: varchar("customer_phone"),
  customerEmail: varchar("customer_email"),
  
  // Transaction Details
  transactionNumber: text("transaction_number").notNull().unique(), // e.g., "TXN-2025-001234"
  orderType: text("order_type").notNull(), // "wash_dry_fold", "dry_cleaning", "alterations", "pickup_delivery"
  status: text("status").notNull().default("pending"), // "pending", "weighing", "processing", "ready", "completed", "cancelled"
  
  // Pricing (per-pound model)
  totalWeight: decimal("total_weight", { precision: 10, scale: 2 }), // Pounds
  pricePerPound: decimal("price_per_pound", { precision: 10, scale: 2 }), // $1.25-$2.25
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  // Payment
  paymentMethod: text("payment_method"), // "cash", "card", "account", "online"
  paymentStatus: text("payment_status").default("unpaid"), // "unpaid", "paid", "refunded", "partially_refunded"
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  
  // Processing
  assignedTo: varchar("assigned_to").references(() => users.id), // Attendant
  machineIds: text("machine_ids").array(), // Machines used for this order
  
  // Timing
  dropoffTime: timestamp("dropoff_time"),
  promisedTime: timestamp("promised_time"),
  completedTime: timestamp("completed_time"),
  pickedupTime: timestamp("pickedup_time"),
  
  // Notes
  specialInstructions: text("special_instructions"),
  internalNotes: text("internal_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("pos_transactions_laundromat_idx").on(table.laundromatId),
  customerIdx: index("pos_transactions_customer_idx").on(table.customerId),
  statusIdx: index("pos_transactions_status_idx").on(table.status),
  createdAtIdx: index("pos_transactions_created_at_idx").on(table.createdAt),
}));

export const insertPosTransactionSchema = createInsertSchema(posTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPosTransaction = z.infer<typeof insertPosTransactionSchema>;
export type PosTransaction = typeof posTransactions.$inferSelect;

// POS Items - Line items for transactions
export const posItems = pgTable("pos_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").references(() => posTransactions.id).notNull(),
  
  // Item Details
  itemType: text("item_type").notNull(), // "wash_dry_fold", "dry_clean_piece", "alteration", "supply"
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  
  // Pricing
  weight: decimal("weight", { precision: 10, scale: 2 }), // For per-pound items
  pricePerPound: decimal("price_per_pound", { precision: 10, scale: 2 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  
  // Processing
  status: text("status").notNull().default("pending"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  transactionIdx: index("pos_items_transaction_idx").on(table.transactionId),
}));

export const insertPosItemSchema = createInsertSchema(posItems).omit({
  id: true,
  createdAt: true,
});

export type InsertPosItem = z.infer<typeof insertPosItemSchema>;
export type PosItem = typeof posItems.$inferSelect;

// Weigh Events - Track scale measurements
export const weighEvents = pgTable("weigh_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").references(() => posTransactions.id).notNull(),
  
  // Weight Data
  weight: decimal("weight", { precision: 10, scale: 2 }).notNull(), // Pounds
  scaleId: text("scale_id"), // Hardware scale identifier
  weighedBy: varchar("weighed_by").references(() => users.id).notNull(),
  
  // Photo Evidence
  photoUrl: text("photo_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  transactionIdx: index("weigh_events_transaction_idx").on(table.transactionId),
  createdAtIdx: index("weigh_events_created_at_idx").on(table.createdAt),
}));

export const insertWeighEventSchema = createInsertSchema(weighEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertWeighEvent = z.infer<typeof insertWeighEventSchema>;
export type WeighEvent = typeof weighEvents.$inferSelect;

// Payment Settlements - Stripe reconciliation
export const paymentSettlements = pgTable("payment_settlements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Settlement Details
  settlementDate: timestamp("settlement_date").notNull(),
  stripePayoutId: text("stripe_payout_id"),
  
  // Amounts
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Transactions Included
  transactionIds: text("transaction_ids").array(),
  transactionCount: integer("transaction_count").notNull(),
  
  // Status
  status: text("status").notNull().default("pending"), // "pending", "paid", "failed"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("payment_settlements_laundromat_idx").on(table.laundromatId),
  dateIdx: index("payment_settlements_date_idx").on(table.settlementDate),
}));

export const insertPaymentSettlementSchema = createInsertSchema(paymentSettlements).omit({
  id: true,
  createdAt: true,
});

export type InsertPaymentSettlement = z.infer<typeof insertPaymentSettlementSchema>;
export type PaymentSettlement = typeof paymentSettlements.$inferSelect;

// Household Accounts - Customer accounts with credit
export const householdAccounts = pgTable("household_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Account Details
  accountNumber: text("account_number").notNull().unique(),
  accountName: text("account_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  
  // Address
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: varchar("zip"),
  
  // Billing
  billingCycle: text("billing_cycle").default("monthly"), // "weekly", "biweekly", "monthly"
  paymentTerms: integer("payment_terms").default(30), // Net-30, Net-60, etc.
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).default("0.00"),
  
  // Status
  status: text("status").default("active"), // "active", "suspended", "closed"
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("household_accounts_laundromat_idx").on(table.laundromatId),
  statusIdx: index("household_accounts_status_idx").on(table.status),
}));

export const insertHouseholdAccountSchema = createInsertSchema(householdAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHouseholdAccount = z.infer<typeof insertHouseholdAccountSchema>;
export type HouseholdAccount = typeof householdAccounts.$inferSelect;

// Service Orders - Recurring subscription orders
export const serviceOrders = pgTable("service_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  customerId: varchar("customer_id"),
  
  // Order Details
  orderNumber: text("order_number").notNull().unique(),
  serviceType: text("service_type").notNull(), // "pickup_delivery", "commercial_contract", "subscription"
  frequency: text("frequency"), // "daily", "weekly", "biweekly", "monthly"
  
  // Pricing
  recurringAmount: decimal("recurring_amount", { precision: 10, scale: 2 }),
  
  // Schedule
  nextServiceDate: timestamp("next_service_date"),
  lastServiceDate: timestamp("last_service_date"),
  
  // Status
  status: text("status").default("active"), // "active", "paused", "cancelled", "completed"
  
  // Route Assignment
  routeId: varchar("route_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("service_orders_laundromat_idx").on(table.laundromatId),
  customerIdx: index("service_orders_customer_idx").on(table.customerId),
  statusIdx: index("service_orders_status_idx").on(table.status),
}));

export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type ServiceOrder = typeof serviceOrders.$inferSelect;

// Order Items - Items for service orders
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceOrderId: varchar("service_order_id").references(() => serviceOrders.id).notNull(),
  posTransactionId: varchar("pos_transaction_id").references(() => posTransactions.id),
  
  // Item Details
  description: text("description").notNull(),
  quantity: integer("quantity").default(1),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  
  // Pricing
  pricePerPound: decimal("price_per_pound", { precision: 10, scale: 2 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Service Date
  serviceDate: timestamp("service_date"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  serviceOrderIdx: index("order_items_service_order_idx").on(table.serviceOrderId),
}));

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Subscriptions - Customer subscription plans
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  customerId: varchar("customer_id"),
  
  // Plan Details
  planName: text("plan_name").notNull(),
  planType: text("plan_type").notNull(), // "pounds_per_month", "unlimited", "commercial"
  
  // Limits
  poundLimit: integer("pound_limit"), // e.g., 40 pounds/month
  poundsUsed: integer("pounds_used").default(0),
  
  // Pricing
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  overageRate: decimal("overage_rate", { precision: 10, scale: 2 }), // Price per pound over limit
  
  // Billing
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  
  // Status
  status: text("status").default("active"), // "active", "paused", "cancelled", "past_due"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("subscriptions_laundromat_idx").on(table.laundromatId),
  customerIdx: index("subscriptions_customer_idx").on(table.customerId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
}));

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Scale Calibrations - Track scale accuracy
export const scaleCalibrations = pgTable("scale_calibrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Scale Details
  scaleId: text("scale_id").notNull(),
  scaleName: text("scale_name"),
  
  // Calibration Data
  calibrationDate: timestamp("calibration_date").notNull(),
  calibratedBy: varchar("calibrated_by").references(() => users.id).notNull(),
  testWeight: decimal("test_weight", { precision: 10, scale: 2 }).notNull(),
  measuredWeight: decimal("measured_weight", { precision: 10, scale: 2 }).notNull(),
  variance: decimal("variance", { precision: 10, scale: 2 }).notNull(),
  
  // Status
  passed: boolean("passed").notNull(),
  notes: text("notes"),
  
  // Next Due
  nextCalibrationDue: timestamp("next_calibration_due"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("scale_calibrations_laundromat_idx").on(table.laundromatId),
  scaleIdx: index("scale_calibrations_scale_idx").on(table.scaleId),
  dateIdx: index("scale_calibrations_date_idx").on(table.calibrationDate),
}));

export const insertScaleCalibrationSchema = createInsertSchema(scaleCalibrations).omit({
  id: true,
  createdAt: true,
});

export type InsertScaleCalibration = z.infer<typeof insertScaleCalibrationSchema>;
export type ScaleCalibration = typeof scaleCalibrations.$inferSelect;

// ============================================================================
// IOT & MACHINE MONITORING
// ============================================================================

// Machine Assets - Track all laundromat equipment
export const machineAssets = pgTable("machine_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Machine Details
  machineNumber: text("machine_number").notNull(), // Display number (e.g., "W-1", "D-3")
  machineName: text("machine_name"),
  machineType: text("machine_type").notNull(), // "washer", "dryer", "combo", "folder", "press"
  
  // Specifications
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  capacity: decimal("capacity", { precision: 10, scale: 2 }), // Pounds
  installDate: timestamp("install_date"),
  
  // IoT Configuration
  iotDeviceId: text("iot_device_id"), // Sensor/controller ID
  mqttTopic: text("mqtt_topic"), // MQTT subscription topic
  ipAddress: varchar("ip_address"),
  
  // Status
  status: text("status").default("active"), // "active", "maintenance", "offline", "retired"
  lastOnlineAt: timestamp("last_online_at"),
  
  // Maintenance
  warrantyExpiration: timestamp("warranty_expiration"),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  
  // Performance Tracking
  totalCycles: integer("total_cycles").default(0),
  totalRuntimeHours: decimal("total_runtime_hours", { precision: 10, scale: 2 }).default("0.00"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("machine_assets_laundromat_idx").on(table.laundromatId),
  typeIdx: index("machine_assets_type_idx").on(table.machineType),
  statusIdx: index("machine_assets_status_idx").on(table.status),
  iotIdx: index("machine_assets_iot_idx").on(table.iotDeviceId),
}));

export const insertMachineAssetSchema = createInsertSchema(machineAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMachineAsset = z.infer<typeof insertMachineAssetSchema>;
export type MachineAsset = typeof machineAssets.$inferSelect;

// Telemetry Events - Real-time sensor data
export const telemetryEvents = pgTable("telemetry_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  
  // Event Data
  eventType: text("event_type").notNull(), // "cycle_start", "cycle_end", "temperature", "vibration", "energy", "error"
  
  // Sensor Readings
  temperature: decimal("temperature", { precision: 10, scale: 2 }), // Celsius
  vibration: decimal("vibration", { precision: 10, scale: 2 }), // G-force
  waterFlow: decimal("water_flow", { precision: 10, scale: 2 }), // Gallons per minute
  waterPressure: decimal("water_pressure", { precision: 10, scale: 2 }), // PSI
  energyUsage: decimal("energy_usage", { precision: 10, scale: 2 }), // kWh
  doorStatus: text("door_status"), // "open", "closed"
  cyclePhase: text("cycle_phase"), // "wash", "rinse", "spin", "dry", "cool"
  
  // Timing
  cycleId: varchar("cycle_id"), // Group telemetry by cycle
  cycleStartTime: timestamp("cycle_start_time"),
  cycleEndTime: timestamp("cycle_end_time"),
  cycleDuration: integer("cycle_duration"), // Seconds
  
  // Error Detection
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  
  // Raw Data
  rawPayload: jsonb("raw_payload"), // Full MQTT/API payload
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("telemetry_events_machine_idx").on(table.machineId),
  eventTypeIdx: index("telemetry_events_type_idx").on(table.eventType),
  cycleIdx: index("telemetry_events_cycle_idx").on(table.cycleId),
  timestampIdx: index("telemetry_events_timestamp_idx").on(table.timestamp),
}));

export const insertTelemetryEventSchema = createInsertSchema(telemetryEvents).omit({
  id: true,
  timestamp: true,
});

export type InsertTelemetryEvent = z.infer<typeof insertTelemetryEventSchema>;
export type TelemetryEvent = typeof telemetryEvents.$inferSelect;

// Sensor Thresholds - Alert configuration
export const sensorThresholds = pgTable("sensor_thresholds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  
  // Threshold Configuration
  sensorType: text("sensor_type").notNull(), // "temperature", "vibration", "water_flow", "energy"
  
  // Limits
  minValue: decimal("min_value", { precision: 10, scale: 2 }),
  maxValue: decimal("max_value", { precision: 10, scale: 2 }),
  criticalMin: decimal("critical_min", { precision: 10, scale: 2 }),
  criticalMax: decimal("critical_max", { precision: 10, scale: 2 }),
  
  // Alert Settings
  alertEnabled: boolean("alert_enabled").default(true),
  alertRecipients: text("alert_recipients").array(), // Email addresses
  alertSeverity: text("alert_severity").default("warning"), // "info", "warning", "critical"
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("sensor_thresholds_machine_idx").on(table.machineId),
  sensorIdx: index("sensor_thresholds_sensor_idx").on(table.sensorType),
}));

export const insertSensorThresholdSchema = createInsertSchema(sensorThresholds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSensorThreshold = z.infer<typeof insertSensorThresholdSchema>;
export type SensorThreshold = typeof sensorThresholds.$inferSelect;

// Diagnostic Codes - Equipment error codes library
export const diagnosticCodes = pgTable("diagnostic_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Code Details
  code: text("code").notNull().unique(), // e.g., "E01", "F12", "dE"
  manufacturer: text("manufacturer"), // "Speed Queen", "Maytag", "Dexter", etc.
  machineType: text("machine_type"), // "washer", "dryer"
  
  // Description
  title: text("title").notNull(),
  description: text("description").notNull(),
  possibleCauses: text("possible_causes").array(),
  
  // Solution
  troubleshootingSteps: text("troubleshooting_steps").array(),
  requiredParts: text("required_parts").array(),
  estimatedRepairTime: integer("estimated_repair_time"), // Minutes
  skillLevel: text("skill_level"), // "basic", "intermediate", "professional"
  
  // Priority
  severity: text("severity").default("medium"), // "low", "medium", "high", "critical"
  
  // Reference
  manualReference: text("manual_reference"),
  videoUrl: text("video_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex("diagnostic_codes_code_idx").on(table.code),
  manufacturerIdx: index("diagnostic_codes_manufacturer_idx").on(table.manufacturer),
  severityIdx: index("diagnostic_codes_severity_idx").on(table.severity),
}));

export const insertDiagnosticCodeSchema = createInsertSchema(diagnosticCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDiagnosticCode = z.infer<typeof insertDiagnosticCodeSchema>;
export type DiagnosticCode = typeof diagnosticCodes.$inferSelect;

// ============================================================================
// PREVENTIVE MAINTENANCE & REPAIRS
// ============================================================================

// Maintenance Plans - Scheduled preventive maintenance
export const maintenancePlans = pgTable("maintenance_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  
  // Plan Details
  planName: text("plan_name").notNull(),
  description: text("description"),
  taskType: text("task_type").notNull(), // "daily", "weekly", "monthly", "quarterly", "annual", "cycle_based"
  
  // Schedule
  frequency: integer("frequency").notNull(), // Number of days/cycles between maintenance
  frequencyUnit: text("frequency_unit").notNull(), // "days", "cycles"
  lastCompletedDate: timestamp("last_completed_date"),
  nextDueDate: timestamp("next_due_date"),
  
  // Tasks
  checklistItems: text("checklist_items").array(),
  requiredParts: text("required_parts").array(),
  estimatedDuration: integer("estimated_duration"), // Minutes
  
  // Assignment
  assignedTo: varchar("assigned_to").references(() => users.id),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("maintenance_plans_machine_idx").on(table.machineId),
  nextDueIdx: index("maintenance_plans_next_due_idx").on(table.nextDueDate),
}));

export const insertMaintenancePlanSchema = createInsertSchema(maintenancePlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMaintenancePlan = z.infer<typeof insertMaintenancePlanSchema>;
export type MaintenancePlan = typeof maintenancePlans.$inferSelect;

// Repair Tickets - Track service requests and repairs
export const repairTickets = pgTable("repair_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  
  // Ticket Details
  ticketNumber: text("ticket_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").default("medium"), // "low", "medium", "high", "urgent"
  
  // Problem Details
  problemType: text("problem_type"), // "mechanical", "electrical", "software", "plumbing"
  diagnosticCode: text("diagnostic_code"), // Reference to diagnostic_codes.code
  symptoms: text("symptoms").array(),
  
  // Assignment & Tracking
  reportedBy: varchar("reported_by").references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  vendorId: varchar("vendor_id"), // External repair service
  
  // Status & Timing
  status: text("status").default("open"), // "open", "in_progress", "waiting_parts", "completed", "cancelled"
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Resolution
  resolutionNotes: text("resolution_notes"),
  partsUsed: jsonb("parts_used"), // [{partId, quantity, cost}]
  laborHours: decimal("labor_hours", { precision: 10, scale: 2 }),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  
  // Photos & Documentation
  photoUrls: text("photo_urls").array(),
  attachments: text("attachments").array(),
  
  // Follow-up
  warrantyApplied: boolean("warranty_applied").default(false),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("repair_tickets_laundromat_idx").on(table.laundromatId),
  machineIdx: index("repair_tickets_machine_idx").on(table.machineId),
  statusIdx: index("repair_tickets_status_idx").on(table.status),
  priorityIdx: index("repair_tickets_priority_idx").on(table.priority),
  reportedAtIdx: index("repair_tickets_reported_at_idx").on(table.reportedAt),
}));

export const insertRepairTicketSchema = createInsertSchema(repairTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRepairTicket = z.infer<typeof insertRepairTicketSchema>;
export type RepairTicket = typeof repairTickets.$inferSelect;

// Parts Inventory - Track replacement parts
export const partsInventory = pgTable("parts_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Part Details
  partNumber: text("part_number").notNull(),
  partName: text("part_name").notNull(),
  description: text("description"),
  category: text("category"), // "belt", "motor", "pump", "valve", "seal", "bearing", etc.
  
  // Compatibility
  manufacturer: text("manufacturer"),
  machineModels: text("machine_models").array(), // Compatible machine models
  
  // Inventory
  quantityOnHand: integer("quantity_on_hand").default(0),
  quantityReserved: integer("quantity_reserved").default(0),
  reorderPoint: integer("reorder_point").default(2),
  reorderQuantity: integer("reorder_quantity").default(5),
  
  // Pricing
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
  
  // Storage Location
  binLocation: text("bin_location"),
  
  // Vendor Information
  preferredVendorId: varchar("preferred_vendor_id"),
  vendorPartNumber: text("vendor_part_number"),
  
  // Status
  isActive: boolean("is_active").default(true),
  discontinuedDate: timestamp("discontinued_date"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("parts_inventory_laundromat_idx").on(table.laundromatId),
  partNumberIdx: index("parts_inventory_part_number_idx").on(table.partNumber),
  categoryIdx: index("parts_inventory_category_idx").on(table.category),
  lowStockIdx: index("parts_inventory_low_stock_idx").on(table.quantityOnHand),
}));

export const insertPartsInventorySchema = createInsertSchema(partsInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPartsInventory = z.infer<typeof insertPartsInventorySchema>;
export type PartsInventory = typeof partsInventory.$inferSelect;

// Warranty Records - Track equipment warranties
export const warrantyRecords = pgTable("warranty_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  
  // Warranty Details
  warrantyType: text("warranty_type").notNull(), // "manufacturer", "extended", "service_contract"
  warrantyProvider: text("warranty_provider").notNull(),
  policyNumber: text("policy_number"),
  
  // Coverage Period
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Coverage Details
  coverageType: text("coverage_type"), // "parts_only", "labor_only", "parts_and_labor", "full_coverage"
  coverageDescription: text("coverage_description"),
  exclusions: text("exclusions").array(),
  
  // Cost
  cost: decimal("cost", { precision: 10, scale: 2 }),
  
  // Contact Information
  contactName: text("contact_name"),
  contactPhone: varchar("contact_phone"),
  contactEmail: varchar("contact_email"),
  
  // Document Storage
  documentUrl: text("document_url"),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("warranty_records_machine_idx").on(table.machineId),
  endDateIdx: index("warranty_records_end_date_idx").on(table.endDate),
  activeIdx: index("warranty_records_active_idx").on(table.isActive),
}));

export const insertWarrantyRecordSchema = createInsertSchema(warrantyRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWarrantyRecord = z.infer<typeof insertWarrantyRecordSchema>;
export type WarrantyRecord = typeof warrantyRecords.$inferSelect;

// Vendor Purchase Orders - Track parts orders
export const vendorPurchaseOrders = pgTable("vendor_purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  vendorId: varchar("vendor_id"),
  
  // Order Details
  poNumber: text("po_number").notNull().unique(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  
  // Items (stored as JSON array)
  items: jsonb("items").notNull(), // [{partId, partNumber, description, quantity, unitCost, total}]
  
  // Totals
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  // Status & Tracking
  status: text("status").default("pending"), // "pending", "ordered", "shipped", "delivered", "cancelled"
  orderedBy: varchar("ordered_by").references(() => users.id).notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  trackingNumber: text("tracking_number"),
  
  // Payment
  paymentStatus: text("payment_status").default("unpaid"), // "unpaid", "paid", "partial"
  paymentMethod: text("payment_method"),
  paidDate: timestamp("paid_date"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("vendor_purchase_orders_laundromat_idx").on(table.laundromatId),
  vendorIdx: index("vendor_purchase_orders_vendor_idx").on(table.vendorId),
  statusIdx: index("vendor_purchase_orders_status_idx").on(table.status),
  orderDateIdx: index("vendor_purchase_orders_order_date_idx").on(table.orderDate),
}));

export const insertVendorPurchaseOrderSchema = createInsertSchema(vendorPurchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVendorPurchaseOrder = z.infer<typeof insertVendorPurchaseOrderSchema>;
export type VendorPurchaseOrder = typeof vendorPurchaseOrders.$inferSelect;

// ============================================================================
// LOGISTICS & ROUTE OPTIMIZATION
// ============================================================================

// Routes - Pickup/delivery route planning
export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Route Details
  routeName: text("route_name").notNull(),
  routeType: text("route_type").notNull(), // "pickup", "delivery", "pickup_delivery"
  routeDate: timestamp("route_date").notNull(),
  
  // Assignment
  driverId: varchar("driver_id").references(() => users.id),
  vehicleId: text("vehicle_id"),
  
  // Optimization Parameters
  optimizedSequence: jsonb("optimized_sequence"), // Array of stop IDs in optimal order
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }), // Miles
  estimatedDuration: integer("estimated_duration"), // Minutes
  
  // Status & Tracking
  status: text("status").default("planned"), // "planned", "in_progress", "completed", "cancelled"
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  actualDistance: decimal("actual_distance", { precision: 10, scale: 2 }),
  actualDuration: integer("actual_duration"), // Minutes
  
  // Performance Metrics
  onTimeStops: integer("on_time_stops").default(0),
  lateStops: integer("late_stops").default(0),
  totalStops: integer("total_stops").default(0),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("routes_laundromat_idx").on(table.laundromatId),
  driverIdx: index("routes_driver_idx").on(table.driverId),
  dateIdx: index("routes_date_idx").on(table.routeDate),
  statusIdx: index("routes_status_idx").on(table.status),
}));

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

// Route Stops - Individual stops on a route
export const routeStops = pgTable("route_stops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id").references(() => routes.id).notNull(),
  transactionId: varchar("transaction_id").references(() => posTransactions.id),
  
  // Stop Details
  stopNumber: integer("stop_number").notNull(), // Sequence in route
  stopType: text("stop_type").notNull(), // "pickup", "delivery"
  
  // Customer & Location
  customerName: text("customer_name").notNull(),
  customerPhone: varchar("customer_phone"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  specialInstructions: text("special_instructions"),
  
  // Timing
  scheduledArrival: timestamp("scheduled_arrival"),
  actualArrival: timestamp("actual_arrival"),
  completedAt: timestamp("completed_at"),
  
  // Status
  status: text("status").default("pending"), // "pending", "in_transit", "arrived", "completed", "failed", "skipped"
  
  // Proof of Service
  signatureUrl: text("signature_url"),
  photoUrls: text("photo_urls").array(),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  routeIdx: index("route_stops_route_idx").on(table.routeId),
  transactionIdx: index("route_stops_transaction_idx").on(table.transactionId),
  statusIdx: index("route_stops_status_idx").on(table.status),
}));

export const insertRouteStopSchema = createInsertSchema(routeStops).omit({
  id: true,
  createdAt: true,
});

export type InsertRouteStop = z.infer<typeof insertRouteStopSchema>;
export type RouteStop = typeof routeStops.$inferSelect;

// Driver Sessions - Track driver activity
export const driverSessions = pgTable("driver_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").references(() => users.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Session Details
  sessionDate: timestamp("session_date").defaultNow().notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  
  // Activity
  routeIds: text("route_ids").array(), // Routes completed during session
  totalMiles: decimal("total_miles", { precision: 10, scale: 2 }).default("0.00"),
  totalStops: integer("total_stops").default(0),
  
  // Performance
  onTimeRate: decimal("on_time_rate", { precision: 5, scale: 2 }), // Percentage
  customerRating: decimal("customer_rating", { precision: 3, scale: 2 }), // 1-5 stars
  
  // Vehicle
  vehicleId: text("vehicle_id"),
  startingMileage: decimal("starting_mileage", { precision: 10, scale: 1 }),
  endingMileage: decimal("ending_mileage", { precision: 10, scale: 1 }),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  driverIdx: index("driver_sessions_driver_idx").on(table.driverId),
  laundromatIdx: index("driver_sessions_laundromat_idx").on(table.laundromatId),
  dateIdx: index("driver_sessions_date_idx").on(table.sessionDate),
}));

export const insertDriverSessionSchema = createInsertSchema(driverSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDriverSession = z.infer<typeof insertDriverSessionSchema>;
export type DriverSession = typeof driverSessions.$inferSelect;

// Proof of Delivery - Delivery confirmation records
export const proofOfDelivery = pgTable("proof_of_delivery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stopId: varchar("stop_id").references(() => routeStops.id).notNull(),
  transactionId: varchar("transaction_id").references(() => posTransactions.id).notNull(),
  
  // Delivery Details
  deliveredAt: timestamp("delivered_at").notNull(),
  deliveredBy: varchar("delivered_by").references(() => users.id).notNull(),
  
  // Recipient Information
  recipientName: text("recipient_name"),
  recipientRelation: text("recipient_relation"), // "customer", "spouse", "neighbor", "doorman", etc.
  
  // Proof
  signatureUrl: text("signature_url"),
  photoUrls: text("photo_urls").array(), // Photos of delivery location
  gpsCoordinates: jsonb("gps_coordinates"), // {lat, lng, accuracy}
  
  // Delivery Method
  deliveryMethod: text("delivery_method"), // "handed_to_customer", "left_at_door", "safe_location", "mailroom"
  deliveryLocation: text("delivery_location"), // Specific location description
  
  // Customer Feedback
  customerRating: integer("customer_rating"), // 1-5 stars
  customerFeedback: text("customer_feedback"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  stopIdx: index("proof_of_delivery_stop_idx").on(table.stopId),
  transactionIdx: index("proof_of_delivery_transaction_idx").on(table.transactionId),
  deliveredAtIdx: index("proof_of_delivery_delivered_at_idx").on(table.deliveredAt),
}));

export const insertProofOfDeliverySchema = createInsertSchema(proofOfDelivery).omit({
  id: true,
  createdAt: true,
});

export type InsertProofOfDelivery = z.infer<typeof insertProofOfDeliverySchema>;
export type ProofOfDelivery = typeof proofOfDelivery.$inferSelect;

// Geofence Zones - Service area definitions
export const geofenceZones = pgTable("geofence_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Zone Details
  zoneName: text("zone_name").notNull(),
  zoneType: text("zone_type").notNull(), // "service_area", "delivery_zone", "rush_zone", "no_service"
  
  // Geography (stored as GeoJSON polygon)
  geometry: jsonb("geometry").notNull(), // GeoJSON Polygon or MultiPolygon
  centerPoint: jsonb("center_point"), // {lat, lng} for display
  
  // Service Configuration
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }),
  estimatedDeliveryTime: integer("estimated_delivery_time"), // Minutes
  
  // Schedule
  serviceHours: jsonb("service_hours"), // {monday: {start: "09:00", end: "17:00"}, ...}
  
  // Status
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0), // Higher priority zones checked first
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("geofence_zones_laundromat_idx").on(table.laundromatId),
  typeIdx: index("geofence_zones_type_idx").on(table.zoneType),
  activeIdx: index("geofence_zones_active_idx").on(table.isActive),
}));

export const insertGeofenceZoneSchema = createInsertSchema(geofenceZones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGeofenceZone = z.infer<typeof insertGeofenceZoneSchema>;
export type GeofenceZone = typeof geofenceZones.$inferSelect;

// Delivery Windows - Customer preferred time slots
export const deliveryWindows = pgTable("delivery_windows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Window Details
  windowName: text("window_name").notNull(), // "Morning", "Afternoon", "Evening"
  dayOfWeek: integer("day_of_week"), // 0-6 (Sunday-Saturday), null = all days
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  
  // Capacity
  maxCapacity: integer("max_capacity").notNull(), // Maximum stops/orders in this window
  currentBookings: integer("current_bookings").default(0),
  
  // Pricing
  surcharge: decimal("surcharge", { precision: 10, scale: 2 }).default("0.00"), // Extra fee for this window
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("delivery_windows_laundromat_idx").on(table.laundromatId),
  dayIdx: index("delivery_windows_day_idx").on(table.dayOfWeek),
  activeIdx: index("delivery_windows_active_idx").on(table.isActive),
}));

export const insertDeliveryWindowSchema = createInsertSchema(deliveryWindows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDeliveryWindow = z.infer<typeof insertDeliveryWindowSchema>;
export type DeliveryWindow = typeof deliveryWindows.$inferSelect;

// Mileage Logs - Driver mileage tracking for reimbursement
export const mileageLogs = pgTable("mileage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").references(() => users.id).notNull(),
  sessionId: varchar("session_id").references(() => driverSessions.id),
  
  // Trip Details
  tripDate: timestamp("trip_date").defaultNow().notNull(),
  startLocation: text("start_location"),
  endLocation: text("end_location"),
  purpose: text("purpose"), // "route_delivery", "parts_pickup", "bank_deposit", etc.
  
  // Mileage
  startOdometer: decimal("start_odometer", { precision: 10, scale: 1 }),
  endOdometer: decimal("end_odometer", { precision: 10, scale: 1 }),
  totalMiles: decimal("total_miles", { precision: 10, scale: 2 }).notNull(),
  
  // Reimbursement
  reimbursementRate: decimal("reimbursement_rate", { precision: 10, scale: 2 }), // Per mile
  reimbursementAmount: decimal("reimbursement_amount", { precision: 10, scale: 2 }),
  reimbursementStatus: text("reimbursement_status").default("pending"), // "pending", "approved", "paid"
  
  // Vehicle
  vehicleId: text("vehicle_id"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  driverIdx: index("mileage_logs_driver_idx").on(table.driverId),
  sessionIdx: index("mileage_logs_session_idx").on(table.sessionId),
  dateIdx: index("mileage_logs_date_idx").on(table.tripDate),
  statusIdx: index("mileage_logs_status_idx").on(table.reimbursementStatus),
}));

export const insertMileageLogSchema = createInsertSchema(mileageLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertMileageLog = z.infer<typeof insertMileageLogSchema>;
export type MileageLog = typeof mileageLogs.$inferSelect;

// ============================================================================
// ANALYTICS & BUSINESS INTELLIGENCE (Fact Tables for Dashboards)
// ============================================================================

// Daily Revenue Fact - Aggregated daily revenue metrics
export const dailyRevenueFact = pgTable("daily_revenue_fact", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Time Dimension
  date: timestamp("date").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6
  week: integer("week").notNull(),
  quarter: integer("quarter").notNull(),
  
  // Revenue Metrics
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  cashRevenue: decimal("cash_revenue", { precision: 10, scale: 2 }).default("0.00"),
  cardRevenue: decimal("card_revenue", { precision: 10, scale: 2 }).default("0.00"),
  accountRevenue: decimal("account_revenue", { precision: 10, scale: 2 }).default("0.00"),
  
  // Service Type Breakdown
  wdfRevenue: decimal("wdf_revenue", { precision: 10, scale: 2 }).default("0.00"), // Wash-dry-fold
  drycleanRevenue: decimal("dryclean_revenue", { precision: 10, scale: 2 }).default("0.00"),
  alterationsRevenue: decimal("alterations_revenue", { precision: 10, scale: 2 }).default("0.00"),
  deliveryRevenue: decimal("delivery_revenue", { precision: 10, scale: 2 }).default("0.00"),
  
  // Volume Metrics
  totalOrders: integer("total_orders").default(0),
  totalPounds: decimal("total_pounds", { precision: 10, scale: 2 }).default("0.00"),
  avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }).default("0.00"),
  avgPricePerPound: decimal("avg_price_per_pound", { precision: 10, scale: 2 }).default("0.00"),
  
  // Customer Metrics
  newCustomers: integer("new_customers").default(0),
  returningCustomers: integer("returning_customers").default(0),
  uniqueCustomers: integer("unique_customers").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("daily_revenue_fact_laundromat_idx").on(table.laundromatId),
  dateIdx: index("daily_revenue_fact_date_idx").on(table.date),
  yearMonthIdx: index("daily_revenue_fact_year_month_idx").on(table.year, table.month),
}));

export const insertDailyRevenueFactSchema = createInsertSchema(dailyRevenueFact).omit({
  id: true,
  createdAt: true,
});

export type InsertDailyRevenueFact = z.infer<typeof insertDailyRevenueFactSchema>;
export type DailyRevenueFact = typeof dailyRevenueFact.$inferSelect;

// Machine Turn Fact - Machine performance metrics
export const machineTurnFact = pgTable("machine_turn_fact", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Time Dimension
  date: timestamp("date").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  
  // Turn Metrics
  totalCycles: integer("total_cycles").default(0),
  avgCycleDuration: integer("avg_cycle_duration"), // Minutes
  totalRuntime: integer("total_runtime"), // Minutes
  utilizationRate: decimal("utilization_rate", { precision: 5, scale: 2 }), // Percentage
  
  // Revenue Per Machine
  revenueGenerated: decimal("revenue_generated", { precision: 10, scale: 2 }).default("0.00"),
  revenuePerCycle: decimal("revenue_per_cycle", { precision: 10, scale: 2 }),
  
  // Efficiency Metrics
  avgLoadWeight: decimal("avg_load_weight", { precision: 10, scale: 2 }),
  avgEnergyPerCycle: decimal("avg_energy_per_cycle", { precision: 10, scale: 2 }), // kWh
  avgWaterPerCycle: decimal("avg_water_per_cycle", { precision: 10, scale: 2 }), // Gallons
  
  // Downtime
  downtimeMinutes: integer("downtime_minutes").default(0),
  errorCount: integer("error_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("machine_turn_fact_machine_idx").on(table.machineId),
  laundromatIdx: index("machine_turn_fact_laundromat_idx").on(table.laundromatId),
  dateIdx: index("machine_turn_fact_date_idx").on(table.date),
}));

export const insertMachineTurnFactSchema = createInsertSchema(machineTurnFact).omit({
  id: true,
  createdAt: true,
});

export type InsertMachineTurnFact = z.infer<typeof insertMachineTurnFactSchema>;
export type MachineTurnFact = typeof machineTurnFact.$inferSelect;

// Driver Route Fact - Route performance analytics
export const driverRouteFact = pgTable("driver_route_fact", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id").references(() => routes.id).notNull(),
  driverId: varchar("driver_id").references(() => users.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Time Dimension
  date: timestamp("date").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  
  // Route Metrics
  totalStops: integer("total_stops").default(0),
  completedStops: integer("completed_stops").default(0),
  failedStops: integer("failed_stops").default(0),
  onTimeStops: integer("on_time_stops").default(0),
  
  // Distance & Time
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }), // Miles
  totalDuration: integer("total_duration"), // Minutes
  avgStopDuration: integer("avg_stop_duration"), // Minutes
  
  // Revenue
  routeRevenue: decimal("route_revenue", { precision: 10, scale: 2 }),
  revenuePerMile: decimal("revenue_per_mile", { precision: 10, scale: 2 }),
  revenuePerStop: decimal("revenue_per_stop", { precision: 10, scale: 2 }),
  
  // Customer Satisfaction
  avgCustomerRating: decimal("avg_customer_rating", { precision: 3, scale: 2 }), // 1-5 stars
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  routeIdx: index("driver_route_fact_route_idx").on(table.routeId),
  driverIdx: index("driver_route_fact_driver_idx").on(table.driverId),
  laundromatIdx: index("driver_route_fact_laundromat_idx").on(table.laundromatId),
  dateIdx: index("driver_route_fact_date_idx").on(table.date),
}));

export const insertDriverRouteFactSchema = createInsertSchema(driverRouteFact).omit({
  id: true,
  createdAt: true,
});

export type InsertDriverRouteFact = z.infer<typeof insertDriverRouteFactSchema>;
export type DriverRouteFact = typeof driverRouteFact.$inferSelect;

// Customer LTV Fact - Customer lifetime value tracking
export const customerLtvFact = pgTable("customer_ltv_fact", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Time Window
  asOfDate: timestamp("as_of_date").notNull(),
  firstOrderDate: timestamp("first_order_date").notNull(),
  lastOrderDate: timestamp("last_order_date").notNull(),
  daysSinceFirstOrder: integer("days_since_first_order").notNull(),
  daysSinceLastOrder: integer("days_since_last_order").notNull(),
  
  // Transaction Metrics
  totalOrders: integer("total_orders").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  totalPounds: decimal("total_pounds", { precision: 10, scale: 2 }).default("0.00"),
  avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }),
  avgOrderFrequency: decimal("avg_order_frequency", { precision: 10, scale: 2 }), // Days between orders
  
  // Projected Metrics
  projectedLtv: decimal("projected_ltv", { precision: 10, scale: 2 }),
  churnProbability: decimal("churn_probability", { precision: 5, scale: 2 }), // Percentage
  
  // Segmentation
  customerSegment: text("customer_segment"), // "high_value", "medium_value", "low_value", "at_risk", "churned"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("customer_ltv_fact_customer_idx").on(table.customerId),
  laundromatIdx: index("customer_ltv_fact_laundromat_idx").on(table.laundromatId),
  dateIdx: index("customer_ltv_fact_date_idx").on(table.asOfDate),
  segmentIdx: index("customer_ltv_fact_segment_idx").on(table.customerSegment),
}));

export const insertCustomerLtvFactSchema = createInsertSchema(customerLtvFact).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerLtvFact = z.infer<typeof insertCustomerLtvFactSchema>;
export type CustomerLtvFact = typeof customerLtvFact.$inferSelect;

// Conversion Funnels - Track customer journey
export const conversionFunnels = pgTable("conversion_funnels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Time Dimension
  date: timestamp("date").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  
  // Funnel Type
  funnelType: text("funnel_type").notNull(), // "website_visitor", "quote_request", "first_order", "retention"
  
  // Stage Metrics
  stage1Count: integer("stage1_count").default(0), // e.g., Website visitors
  stage2Count: integer("stage2_count").default(0), // e.g., Quote requests
  stage3Count: integer("stage3_count").default(0), // e.g., First orders
  stage4Count: integer("stage4_count").default(0), // e.g., Repeat orders
  stage5Count: integer("stage5_count").default(0), // e.g., Loyal customers
  
  // Conversion Rates
  stage1To2Rate: decimal("stage1_to2_rate", { precision: 5, scale: 2 }),
  stage2To3Rate: decimal("stage2_to3_rate", { precision: 5, scale: 2 }),
  stage3To4Rate: decimal("stage3_to4_rate", { precision: 5, scale: 2 }),
  stage4To5Rate: decimal("stage4_to5_rate", { precision: 5, scale: 2 }),
  overallConversionRate: decimal("overall_conversion_rate", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("conversion_funnels_laundromat_idx").on(table.laundromatId),
  dateIdx: index("conversion_funnels_date_idx").on(table.date),
  funnelTypeIdx: index("conversion_funnels_funnel_type_idx").on(table.funnelType),
}));

export const insertConversionFunnelSchema = createInsertSchema(conversionFunnels).omit({
  id: true,
  createdAt: true,
});

export type InsertConversionFunnel = z.infer<typeof insertConversionFunnelSchema>;
export type ConversionFunnel = typeof conversionFunnels.$inferSelect;

// Cohort Analysis - Customer cohort performance tracking
export const cohortAnalysis = pgTable("cohort_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Cohort Definition
  cohortMonth: timestamp("cohort_month").notNull(), // First month of customer acquisition
  cohortSize: integer("cohort_size").notNull(), // Number of customers in cohort
  
  // Time Period (months since cohort start)
  monthOffset: integer("month_offset").notNull(), // 0, 1, 2, 3... months since acquisition
  
  // Retention Metrics
  activeCustomers: integer("active_customers").default(0),
  retentionRate: decimal("retention_rate", { precision: 5, scale: 2 }), // Percentage
  
  // Revenue Metrics
  cohortRevenue: decimal("cohort_revenue", { precision: 10, scale: 2 }).default("0.00"),
  cumulativeRevenue: decimal("cumulative_revenue", { precision: 10, scale: 2 }).default("0.00"),
  avgRevenuePerCustomer: decimal("avg_revenue_per_customer", { precision: 10, scale: 2 }),
  
  // Transaction Metrics
  totalOrders: integer("total_orders").default(0),
  avgOrdersPerCustomer: decimal("avg_orders_per_customer", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("cohort_analysis_laundromat_idx").on(table.laundromatId),
  cohortIdx: index("cohort_analysis_cohort_idx").on(table.cohortMonth),
  offsetIdx: index("cohort_analysis_offset_idx").on(table.monthOffset),
}));

export const insertCohortAnalysisSchema = createInsertSchema(cohortAnalysis).omit({
  id: true,
  createdAt: true,
});

export type InsertCohortAnalysis = z.infer<typeof insertCohortAnalysisSchema>;
export type CohortAnalysis = typeof cohortAnalysis.$inferSelect;

// ============================================================================
// ADVANCED SEO/AEO SUITE (Beat SearchAtlas, Ahrefs, Yoast)
// ============================================================================

// Content Analyses - Real-time on-page SEO scoring
export const contentAnalyses = pgTable("content_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  content: text("content").notNull(),
  
  // Target Keywords
  primaryKeyword: text("primary_keyword").notNull(),
  secondaryKeywords: text("secondary_keywords").array(),
  
  // SEO Scores (0-100)
  overallScore: integer("overall_score").notNull(),
  keywordOptimization: integer("keyword_optimization"),
  readabilityScore: integer("readability_score"),
  technicalSeoScore: integer("technical_seo_score"),
  contentQualityScore: integer("content_quality_score"),
  eeatScore: integer("eeat_score"), // E-E-A-T: Experience, Expertise, Authority, Trust
  
  // Content Metrics
  wordCount: integer("word_count"),
  readingTime: integer("reading_time"), // Minutes
  keywordDensity: decimal("keyword_density", { precision: 5, scale: 2 }), // Percentage
  headingStructure: jsonb("heading_structure"), // H1, H2, H3 analysis
  
  // Technical SEO
  metaTitle: text("meta_title"),
  metaTitleLength: integer("meta_title_length"),
  metaDescription: text("meta_description"),
  metaDescriptionLength: integer("meta_description_length"),
  canonicalUrl: text("canonical_url"),
  openGraphTags: jsonb("open_graph_tags"),
  twitterCardTags: jsonb("twitter_card_tags"),
  schemaMarkup: jsonb("schema_markup"),
  
  // Image Optimization
  totalImages: integer("total_images"),
  imagesWithAlt: integer("images_with_alt"),
  imageOptimizationScore: integer("image_optimization_score"),
  
  // Internal Linking
  internalLinks: integer("internal_links"),
  externalLinks: integer("external_links"),
  brokenLinks: integer("broken_links"),
  linkingScore: integer("linking_score"),
  
  // AI Suggestions
  aiSuggestions: jsonb("ai_suggestions"), // Array of improvement recommendations
  contentGaps: jsonb("content_gaps"), // Topics to add
  lsiKeywords: text("lsi_keywords").array(), // Latent Semantic Indexing keywords
  
  // Competitor Comparison
  topCompetitors: jsonb("top_competitors"), // [{url, score, gaps}]
  competitiveAdvantage: text("competitive_advantage").array(),
  
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  urlIdx: index("content_analyses_url_idx").on(table.url),
  primaryKeywordIdx: index("content_analyses_primary_keyword_idx").on(table.primaryKeyword),
  analyzedAtIdx: index("content_analyses_analyzed_at_idx").on(table.analyzedAt),
}));

export const insertContentAnalysisSchema = createInsertSchema(contentAnalyses).omit({
  id: true,
  analyzedAt: true,
  updatedAt: true,
});

export type InsertContentAnalysis = z.infer<typeof insertContentAnalysisSchema>;
export type ContentAnalysis = typeof contentAnalyses.$inferSelect;

// SERP Tracking - Live rank tracking (better than Ahrefs)
export const serpTracking = pgTable("serp_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull(),
  targetUrl: text("target_url").notNull(),
  
  // Current Position
  currentPosition: integer("current_position"),
  previousPosition: integer("previous_position"),
  positionChange: integer("position_change"), // +/- from previous
  
  // SERP Features
  hasFeaturedSnippet: boolean("has_featured_snippet").default(false),
  hasLocalPack: boolean("has_local_pack").default(false),
  hasPeopleAlsoAsk: boolean("has_people_also_ask").default(false),
  hasKnowledgePanel: boolean("has_knowledge_panel").default(false),
  hasVideoCarousel: boolean("has_video_carousel").default(false),
  hasImagePack: boolean("has_image_pack").default(false),
  
  // Opportunity Flags
  featuredSnippetOpportunity: boolean("featured_snippet_opportunity").default(false),
  quickWinOpportunity: boolean("quick_win_opportunity").default(false), // Position 4-10
  
  // SERP Data
  serpFeatures: jsonb("serp_features"), // Detailed SERP analysis
  topCompetitors: jsonb("top_competitors"), // Top 10 results with details
  
  // Search Intent
  searchIntent: text("search_intent"), // "informational", "navigational", "transactional", "commercial"
  intentConfidence: decimal("intent_confidence", { precision: 5, scale: 2 }),
  
  // Metrics
  searchVolume: integer("search_volume"),
  cpc: decimal("cpc", { precision: 10, scale: 2 }),
  difficulty: integer("difficulty"), // 0-100
  
  // Location & Device
  location: text("location").default("US"), // Country code
  device: text("device").default("desktop"), // "desktop", "mobile", "tablet"
  
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
}, (table) => ({
  keywordIdx: index("serp_tracking_keyword_idx").on(table.keyword),
  targetUrlIdx: index("serp_tracking_target_url_idx").on(table.targetUrl),
  positionIdx: index("serp_tracking_position_idx").on(table.currentPosition),
  checkedAtIdx: index("serp_tracking_checked_at_idx").on(table.checkedAt),
}));

export const insertSerpTrackingSchema = createInsertSchema(serpTracking).omit({
  id: true,
  checkedAt: true,
});

export type InsertSerpTracking = z.infer<typeof insertSerpTrackingSchema>;
export type SerpTracking = typeof serpTracking.$inferSelect;

// Backlink Profiles - Comprehensive backlink intelligence
export const backlinkProfiles = pgTable("backlink_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetUrl: text("target_url").notNull(),
  sourceUrl: text("source_url").notNull(),
  
  // Link Attributes
  anchorText: text("anchor_text"),
  linkType: text("link_type"), // "dofollow", "nofollow", "ugc", "sponsored"
  linkPlacement: text("link_placement"), // "content", "footer", "sidebar", "navigation"
  isImageLink: boolean("is_image_link").default(false),
  
  // Authority Metrics
  sourceDomainAuthority: integer("source_domain_authority"), // 0-100
  sourcePageAuthority: integer("source_page_authority"), // 0-100
  sourceTrustFlow: integer("source_trust_flow"), // 0-100
  sourceCitationFlow: integer("source_citation_flow"), // 0-100
  
  // Link Quality
  linkQualityScore: integer("link_quality_score"), // 0-100
  isSpam: boolean("is_spam").default(false),
  isToxic: boolean("is_toxic").default(false),
  
  // Discovery
  firstSeenDate: timestamp("first_seen_date"),
  lastSeenDate: timestamp("last_seen_date"),
  isLive: boolean("is_live").default(true),
  lostDate: timestamp("lost_date"),
  
  // Context
  sourcePageTitle: text("source_page_title"),
  sourcePageContent: text("source_page_content"), // Surrounding text
  
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
}, (table) => ({
  targetUrlIdx: index("backlink_profiles_target_url_idx").on(table.targetUrl),
  sourceUrlIdx: index("backlink_profiles_source_url_idx").on(table.sourceUrl),
  qualityIdx: index("backlink_profiles_quality_idx").on(table.linkQualityScore),
  liveIdx: index("backlink_profiles_live_idx").on(table.isLive),
}));

export const insertBacklinkProfileSchema = createInsertSchema(backlinkProfiles).omit({
  id: true,
  analyzedAt: true,
});

export type InsertBacklinkProfile = z.infer<typeof insertBacklinkProfileSchema>;
export type BacklinkProfile = typeof backlinkProfiles.$inferSelect;

// Site Audits - Technical SEO crawling
export const siteAudits = pgTable("site_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domain: text("domain").notNull(),
  
  // Crawl Stats
  totalPages: integer("total_pages"),
  crawledPages: integer("crawled_pages"),
  errorPages: integer("error_pages"),
  redirectPages: integer("redirect_pages"),
  
  // Technical Issues
  brokenLinks: integer("broken_links"),
  missingTitles: integer("missing_titles"),
  duplicateTitles: integer("duplicate_titles"),
  missingDescriptions: integer("missing_descriptions"),
  duplicateDescriptions: integer("duplicate_descriptions"),
  missingH1: integer("missing_h1"),
  multipleH1: integer("multiple_h1"),
  missingAltTags: integer("missing_alt_tags"),
  
  // Performance
  avgPageSpeed: integer("avg_page_speed"), // Milliseconds
  avgFirstContentfulPaint: integer("avg_first_contentful_paint"),
  avgLargestContentfulPaint: integer("avg_largest_contentful_paint"),
  avgCumulativeLayoutShift: decimal("avg_cumulative_layout_shift", { precision: 5, scale: 3 }),
  avgTimeToInteractive: integer("avg_time_to_interactive"),
  
  // Core Web Vitals
  coreWebVitalsScore: integer("core_web_vitals_score"), // 0-100
  mobileFriendly: boolean("mobile_friendly").default(true),
  httpsEnabled: boolean("https_enabled").default(true),
  
  // Security
  hasSecurityHeaders: boolean("has_security_headers").default(false),
  hasSitemap: boolean("has_sitemap").default(false),
  hasRobotsTxt: boolean("has_robots_txt").default(false),
  
  // Indexing
  indexablePages: integer("indexable_pages"),
  blockedByRobots: integer("blocked_by_robots"),
  noindexPages: integer("noindex_pages"),
  canonicalIssues: integer("canonical_issues"),
  
  // Overall Health
  overallHealthScore: integer("overall_health_score"), // 0-100
  criticalIssues: integer("critical_issues"),
  warningIssues: integer("warning_issues"),
  
  // Detailed Results
  issueBreakdown: jsonb("issue_breakdown"), // Categorized issues
  recommendations: jsonb("recommendations"), // AI-generated fixes
  
  auditedAt: timestamp("audited_at").defaultNow().notNull(),
}, (table) => ({
  domainIdx: index("site_audits_domain_idx").on(table.domain),
  healthScoreIdx: index("site_audits_health_score_idx").on(table.overallHealthScore),
  auditedAtIdx: index("site_audits_audited_at_idx").on(table.auditedAt),
}));

export const insertSiteAuditSchema = createInsertSchema(siteAudits).omit({
  id: true,
  auditedAt: true,
});

export type InsertSiteAudit = z.infer<typeof insertSiteAuditSchema>;
export type SiteAudit = typeof siteAudits.$inferSelect;

// Schema Markup Library - Auto-generated structured data
export const schemaMarkupLibrary = pgTable("schema_markup_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  
  // Schema Type
  schemaType: text("schema_type").notNull(), // "Article", "Product", "LocalBusiness", "FAQ", "HowTo", etc.
  schemaData: jsonb("schema_data").notNull(), // Complete Schema.org JSON-LD
  
  // Validation
  isValid: boolean("is_valid").default(true),
  validationErrors: jsonb("validation_errors"),
  
  // Status
  isDeployed: boolean("is_deployed").default(false),
  deployedAt: timestamp("deployed_at"),
  
  // Rich Results Eligibility
  eligibleForRichResults: boolean("eligible_for_rich_results").default(false),
  richResultTypes: text("rich_result_types").array(), // ["Recipe", "Review", "FAQ"]
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  urlIdx: index("schema_markup_library_url_idx").on(table.url),
  schemaTypeIdx: index("schema_markup_library_schema_type_idx").on(table.schemaType),
  deployedIdx: index("schema_markup_library_deployed_idx").on(table.isDeployed),
}));

export const insertSchemaMarkupLibrarySchema = createInsertSchema(schemaMarkupLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSchemaMarkupLibrary = z.infer<typeof insertSchemaMarkupLibrarySchema>;
export type SchemaMarkupLibrary = typeof schemaMarkupLibrary.$inferSelect;

// AEO Optimization - Answer Engine Optimization (voice search, featured snippets)
export const aeoOptimization = pgTable("aeo_optimization", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull(),
  url: text("url").notNull(),
  
  // Question-Answer Pairs
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  answerFormat: text("answer_format"), // "paragraph", "list", "table", "steps"
  
  // Voice Search
  voiceSearchOptimized: boolean("voice_search_optimized").default(false),
  conversationalKeywords: text("conversational_keywords").array(),
  questionWords: text("question_words").array(), // "who", "what", "where", "when", "why", "how"
  
  // Featured Snippet Targeting
  targetingFeaturedSnippet: boolean("targeting_featured_snippet").default(true),
  featuredSnippetType: text("featured_snippet_type"), // "paragraph", "list", "table"
  currentlyFeatured: boolean("currently_featured").default(false),
  
  // Entity Relationships
  primaryEntity: text("primary_entity"),
  relatedEntities: text("related_entities").array(),
  entitySalienceScore: decimal("entity_salience_score", { precision: 5, scale: 2 }), // 0-100
  
  // Knowledge Graph
  hasKnowledgeGraphEntry: boolean("has_knowledge_graph_entry").default(false),
  knowledgeGraphData: jsonb("knowledge_graph_data"),
  
  // People Also Ask (PAA)
  relatedPaaQuestions: jsonb("related_paa_questions"), // Array of related PAA questions
  
  // AI Suggestions
  optimizationSuggestions: jsonb("optimization_suggestions"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  keywordIdx: index("aeo_optimization_keyword_idx").on(table.keyword),
  urlIdx: index("aeo_optimization_url_idx").on(table.url),
  featuredIdx: index("aeo_optimization_featured_idx").on(table.currentlyFeatured),
}));

export const insertAeoOptimizationSchema = createInsertSchema(aeoOptimization).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAeoOptimization = z.infer<typeof insertAeoOptimizationSchema>;
export type AeoOptimization = typeof aeoOptimization.$inferSelect;

// SEO Automation Tasks - AI agent task queue
export const seoAutomationTasks = pgTable("seo_automation_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Task Details
  taskType: text("task_type").notNull(), // "keyword_research", "content_optimization", "link_building", "schema_generation", "rank_tracking"
  taskName: text("task_name").notNull(),
  description: text("description"),
  
  // Target
  targetUrl: text("target_url"),
  targetKeyword: text("target_keyword"),
  
  // Scheduling
  frequency: text("frequency"), // "once", "daily", "weekly", "monthly"
  nextRunAt: timestamp("next_run_at"),
  lastRunAt: timestamp("last_run_at"),
  
  // Status
  status: text("status").default("pending"), // "pending", "running", "completed", "failed", "cancelled"
  priority: integer("priority").default(5), // 1-10
  
  // AI Agent Configuration
  aiModel: text("ai_model"), // "gpt-4", "claude-3-opus", "gemini-pro"
  agentPrompt: text("agent_prompt"),
  agentConfig: jsonb("agent_config"),
  
  // Results
  executionResults: jsonb("execution_results"),
  errorMessage: text("error_message"),
  
  // Owner
  userId: varchar("user_id").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  taskTypeIdx: index("seo_automation_tasks_task_type_idx").on(table.taskType),
  statusIdx: index("seo_automation_tasks_status_idx").on(table.status),
  nextRunIdx: index("seo_automation_tasks_next_run_idx").on(table.nextRunAt),
  userIdx: index("seo_automation_tasks_user_idx").on(table.userId),
}));

export const insertSeoAutomationTaskSchema = createInsertSchema(seoAutomationTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSeoAutomationTask = z.infer<typeof insertSeoAutomationTaskSchema>;
export type SeoAutomationTask = typeof seoAutomationTasks.$inferSelect;

// Content Calendar - AI-powered editorial calendar
export const contentCalendar = pgTable("content_calendar", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Content Details
  title: text("title").notNull(),
  slug: text("slug"),
  contentType: text("content_type").notNull(), // "blog_post", "landing_page", "product_page", "video", "infographic"
  
  // Target Keywords
  primaryKeyword: text("primary_keyword").notNull(),
  secondaryKeywords: text("secondary_keywords").array(),
  
  // Scheduling
  scheduledPublishDate: timestamp("scheduled_publish_date"),
  actualPublishDate: timestamp("actual_publish_date"),
  
  // Status
  status: text("status").default("idea"), // "idea", "researching", "outlining", "writing", "editing", "scheduled", "published"
  
  // Assignment
  assignedTo: varchar("assigned_to").references(() => users.id),
  author: varchar("author").references(() => users.id),
  editor: varchar("editor").references(() => users.id),
  
  // AI Generation
  aiGenerated: boolean("ai_generated").default(false),
  aiModel: text("ai_model"),
  contentBrief: text("content_brief"), // AI-generated outline
  
  // SEO Target
  targetSearchVolume: integer("target_search_volume"),
  targetDifficulty: integer("target_difficulty"),
  estimatedTraffic: integer("estimated_traffic"),
  
  // Performance (after publishing)
  actualViews: integer("actual_views").default(0),
  actualRank: integer("actual_rank"),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("content_calendar_status_idx").on(table.status),
  publishDateIdx: index("content_calendar_publish_date_idx").on(table.scheduledPublishDate),
  assignedToIdx: index("content_calendar_assigned_to_idx").on(table.assignedTo),
}));

export const insertContentCalendarSchema = createInsertSchema(contentCalendar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertContentCalendar = z.infer<typeof insertContentCalendarSchema>;
export type ContentCalendar = typeof contentCalendar.$inferSelect;

// ============================================================================
// UGC + AFFILIATE MARKETING ECOSYSTEM (Users as Marketers - 20% Commission)
// ============================================================================
// Note: Core affiliate tables (affiliates, affiliateClicks, affiliateSales, etc.) already exist above

// User Content - UGC blogs, videos, reviews
export const userContent = pgTable("user_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Content Details
  contentType: text("content_type").notNull(), // "blog", "video", "review", "tutorial", "case_study"
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  
  // Media
  featuredImage: text("featured_image"),
  videoUrl: text("video_url"), // YouTube, Vimeo, etc.
  videoEmbedCode: text("video_embed_code"),
  galleryImages: text("gallery_images").array(),
  
  // Target (what they're writing about)
  targetType: text("target_type"), // "product", "service", "laundromat", "course", "tool"
  targetId: varchar("target_id"), // ID of product/service/etc
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords").array(),
  internalLinks: text("internal_links").array(), // Auto-generated internal links
  externalLinks: text("external_links").array(),
  
  // Affiliate Integration
  affiliateLinksEnabled: boolean("affiliate_links_enabled").default(true),
  affiliateCode: text("affiliate_code"), // Author's affiliate code
  
  // Engagement
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  comments: integer("comments").default(0),
  
  // Quality Metrics
  seoScore: integer("seo_score"), // 0-100
  readabilityScore: integer("readability_score"), // 0-100
  contentQuality: integer("content_quality"), // 0-100
  
  // Moderation
  status: text("status").default("draft"), // "draft", "pending", "approved", "published", "rejected"
  moderatedBy: varchar("moderated_by").references(() => users.id),
  moderationNotes: text("moderation_notes"),
  
  // Publishing
  publishedAt: timestamp("published_at"),
  featured: boolean("featured").default(false),
  featuredOrder: integer("featured_order"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_content_user_idx").on(table.userId),
  typeIdx: index("user_content_type_idx").on(table.contentType),
  statusIdx: index("user_content_status_idx").on(table.status),
  publishedAtIdx: index("user_content_published_at_idx").on(table.publishedAt),
  slugIdx: index("user_content_slug_idx").on(table.slug),
}));

export const insertUserContentSchema = createInsertSchema(userContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserContent = z.infer<typeof insertUserContentSchema>;
export type UserContent = typeof userContent.$inferSelect;

// Social Shares - Track social sharing
export const socialShares = pgTable("social_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Content Being Shared
  contentType: text("content_type").notNull(), // "user_content", "blog", "product", "service", "course"
  contentId: varchar("content_id").notNull(),
  contentUrl: text("content_url").notNull(),
  
  // Share Details
  platform: text("platform").notNull(), // "facebook", "twitter", "linkedin", "pinterest", "email"
  shareUrl: text("share_url").notNull(),
  
  // Affiliate Integration
  affiliateCode: text("affiliate_code"), // Auto-appended to share URL
  
  // Tracking
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  
  sharedAt: timestamp("shared_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("social_shares_user_idx").on(table.userId),
  contentIdx: index("social_shares_content_idx").on(table.contentId),
  platformIdx: index("social_shares_platform_idx").on(table.platform),
  affiliateIdx: index("social_shares_affiliate_idx").on(table.affiliateCode),
}));

export const insertSocialShareSchema = createInsertSchema(socialShares).omit({
  id: true,
  sharedAt: true,
});

export type InsertSocialShare = z.infer<typeof insertSocialShareSchema>;
export type SocialShare = typeof socialShares.$inferSelect;

// Consultant Profiles - Enhanced consultant management
export const consultantProfiles = pgTable("consultant_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Profile Details
  displayName: text("display_name").notNull(),
  title: text("title"), // "Certified Laundromat Consultant"
  bio: text("bio").notNull(),
  profileImage: text("profile_image"),
  
  // Expertise
  specializations: text("specializations").array(), // ["site_selection", "operations", "marketing"]
  experienceYears: integer("experience_years"),
  certifications: text("certifications").array(),
  
  // Service Offerings
  servicesOffered: jsonb("services_offered"), // [{service, price, duration}]
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  packagePrices: jsonb("package_prices"), // {basic: 500, pro: 1000, premium: 2500}
  
  // Availability
  availableHours: jsonb("available_hours"), // {monday: ["09:00-12:00", "14:00-17:00"]}
  timezone: text("timezone").default("America/New_York"),
  maxBookingsPerWeek: integer("max_bookings_per_week").default(10),
  
  // Performance
  totalConsultations: integer("total_consultations").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0.00"),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  
  // Status
  status: text("status").default("pending"), // "pending", "active", "inactive"
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  
  // Links
  websiteUrl: text("website_url"),
  linkedinUrl: text("linkedin_url"),
  videoIntro: text("video_intro"), // YouTube/Vimeo URL
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("consultant_profiles_user_idx").on(table.userId),
  statusIdx: index("consultant_profiles_status_idx").on(table.status),
  featuredIdx: index("consultant_profiles_featured_idx").on(table.featured),
}));

export const insertConsultantProfileSchema = createInsertSchema(consultantProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConsultantProfile = z.infer<typeof insertConsultantProfileSchema>;
export type ConsultantProfile = typeof consultantProfiles.$inferSelect;

// ============================================================================
// ENHANCED BOOK & COURSES - Advanced Learning Features
// ============================================================================
// Note: Base courses, lessons, bookChapters, enrollments, bookAccess tables exist above

// Reading Progress
export const readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  chapterId: varchar("chapter_id").references(() => bookChapters.id).notNull(),
  
  // Progress
  progressPercent: integer("progress_percent").default(0), // 0-100
  completed: boolean("completed").default(false),
  
  // Engagement
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  lastPosition: integer("last_position"), // Scroll position
  
  // Bookmarks & Highlights
  bookmarked: boolean("bookmarked").default(false),
  highlights: jsonb("highlights"), // [{text, position, note}]
  notes: text("notes"),
  
  lastReadAt: timestamp("last_read_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userChapterIdx: index("reading_progress_user_chapter_idx").on(table.userId, table.chapterId),
}));

export const insertReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
  lastReadAt: true,
});

export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

// Course Modules (organize lessons)
export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  
  // Module Info
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  
  // Stats
  lessonCount: integer("lesson_count").default(0),
  durationMinutes: integer("duration_minutes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  courseIdx: index("course_modules_course_idx").on(table.courseId),
  orderIdx: index("course_modules_order_idx").on(table.orderIndex),
}));

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
});

export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type CourseModule = typeof courseModules.$inferSelect;

// Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").references(() => lessons.id).notNull(),
  
  // Question
  question: text("question").notNull(),
  questionType: text("question_type").notNull(), // "multiple_choice", "true_false", "fill_blank"
  
  // Options
  options: jsonb("options").notNull(), // [{text, isCorrect}]
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
  
  // Points
  points: integer("points").default(1),
  orderIndex: integer("order_index").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  lessonIdx: index("quiz_questions_lesson_idx").on(table.lessonId),
}));

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  createdAt: true,
});

export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

// Lesson Progress
export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  lessonId: varchar("lesson_id").references(() => lessons.id).notNull(),
  
  // Progress
  completed: boolean("completed").default(false),
  progressPercent: integer("progress_percent").default(0),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  
  // Quiz Results
  quizAttempts: integer("quiz_attempts").default(0),
  quizScore: integer("quiz_score"),
  quizPassed: boolean("quiz_passed"),
  
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userLessonIdx: index("lesson_progress_user_lesson_idx").on(table.userId, table.lessonId),
}));

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({
  id: true,
  lastAccessedAt: true,
});

export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;

// ============================================================================
// VENDOR MARKETPLACE - Dokan Pro Style Multi-Vendor System
// ============================================================================

// Vendor Stores (Storefronts)
export const vendorStores = pgTable("vendor_stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  
  // Store Details
  storeName: text("store_name").notNull(),
  storeSlug: text("store_slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  banner: text("banner"),
  
  // Contact
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country").default("US"),
  
  // Revenue Sharing
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("15.00"), // 15% to platform
  
  // Stats
  totalProducts: integer("total_products").default(0),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0.00"),
  totalOrders: integer("total_orders").default(0),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  
  // Status
  status: text("status").default("pending"), // "pending", "active", "suspended"
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  
  // Payout
  stripeAccountId: text("stripe_account_id"), // Stripe Connect
  payoutSchedule: text("payout_schedule").default("monthly"), // "weekly", "monthly"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index("vendor_stores_owner_idx").on(table.ownerId),
  slugIdx: index("vendor_stores_slug_idx").on(table.storeSlug),
  statusIdx: index("vendor_stores_status_idx").on(table.status),
}));

export const insertVendorStoreSchema = createInsertSchema(vendorStores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVendorStore = z.infer<typeof insertVendorStoreSchema>;
export type VendorStore = typeof vendorStores.$inferSelect;

// Vendor Products
export const vendorProducts = pgTable("vendor_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").references(() => vendorStores.id).notNull(),
  
  // Product Details
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  
  // Categorization
  category: text("category").notNull(), // "equipment", "detergent", "services", "digital", "consulting"
  subcategory: text("subcategory"),
  tags: text("tags").array(),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  cost: decimal("cost", { precision: 10, scale: 2 }), // Vendor's cost for commission calc
  
  // Media
  images: text("images").array(),
  featuredImage: text("featured_image"),
  videoUrl: text("video_url"),
  
  // Inventory
  sku: text("sku"),
  stock: integer("stock"),
  trackInventory: boolean("track_inventory").default(false),
  
  // Digital Product
  isDigital: boolean("is_digital").default(false),
  downloadUrl: text("download_url"),
  downloadLimit: integer("download_limit"),
  
  // Stats
  views: integer("views").default(0),
  sales: integer("sales").default(0),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords").array(),
  
  // Status
  status: text("status").default("draft"), // "draft", "active", "outofstock", "archived"
  featured: boolean("featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  storeIdx: index("vendor_products_store_idx").on(table.storeId),
  categoryIdx: index("vendor_products_category_idx").on(table.category),
  statusIdx: index("vendor_products_status_idx").on(table.status),
  slugIdx: index("vendor_products_slug_idx").on(table.slug),
}));

export const insertVendorProductSchema = createInsertSchema(vendorProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVendorProduct = z.infer<typeof insertVendorProductSchema>;
export type VendorProduct = typeof vendorProducts.$inferSelect;

// ============================================================================
// EQUIPMENT INQUIRY - Distributor Lead Gen to nick@washbizhub.com
// ============================================================================

// Equipment Inquiries (goes to nick@washbizhub.com)
export const equipmentInquiries = pgTable("equipment_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Requester Info
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company"),
  
  // Equipment Details
  equipmentType: text("equipment_type").notNull(), // "washer", "dryer", "folder", "complete_setup"
  brand: text("brand"),
  model: text("model"),
  quantity: integer("quantity").notNull(),
  
  // Location
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip"),
  
  // Additional Info
  timeline: text("timeline"), // "immediate", "1-3 months", "3-6 months", "planning"
  budget: text("budget"), // "under_50k", "50k_100k", "100k_250k", "250k_plus"
  message: text("message"),
  
  // Distributor Preferences
  preferredDistributor: text("preferred_distributor"),
  
  // Tracking
  source: text("source"), // "website", "locator", "affiliate"
  affiliateCode: text("affiliate_code"),
  
  // Commission Tracking
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"), // 10% to nick@washbizhub.com
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  commissionStatus: text("commission_status").default("pending"), // "pending", "qualified", "paid"
  
  // Status
  status: text("status").default("new"), // "new", "contacted", "quoted", "converted", "lost"
  assignedTo: text("assigned_to").default("nick@washbizhub.com"),
  notes: text("notes"),
  
  // Follow-up
  followUpDate: timestamp("follow_up_date"),
  convertedAt: timestamp("converted_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("equipment_inquiries_email_idx").on(table.email),
  statusIdx: index("equipment_inquiries_status_idx").on(table.status),
  createdAtIdx: index("equipment_inquiries_created_at_idx").on(table.createdAt),
}));

export const insertEquipmentInquirySchema = createInsertSchema(equipmentInquiries).omit({
  id: true,
  createdAt: true,
});

export type InsertEquipmentInquiry = z.infer<typeof insertEquipmentInquirySchema>;
export type EquipmentInquiry = typeof equipmentInquiries.$inferSelect;

// ============================================================================
// PLATFORM-WIDE SEARCH INDEX
// ============================================================================

// Search Index (for predictive autocomplete across entire platform)
export const searchIndex = pgTable("search_index", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Content Reference
  contentType: text("content_type").notNull(), // "product", "vendor", "listing", "course", "blog", "resource"
  contentId: varchar("content_id").notNull(),
  contentUrl: text("content_url").notNull(),
  
  // Searchable Content
  title: text("title").notNull(),
  description: text("description"),
  keywords: text("keywords").array(),
  category: text("category"),
  
  // Ranking
  searchRank: integer("search_rank").default(0), // Higher = better
  popularity: integer("popularity").default(0), // Click count
  
  // Metadata
  imageUrl: text("image_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  contentTypeIdx: index("search_index_content_type_idx").on(table.contentType),
  titleIdx: index("search_index_title_idx").on(table.title),
  rankIdx: index("search_index_rank_idx").on(table.searchRank),
  activeIdx: index("search_index_active_idx").on(table.isActive),
}));

export const insertSearchIndexSchema = createInsertSchema(searchIndex).omit({
  id: true,
  updatedAt: true,
});

export type InsertSearchIndex = z.infer<typeof insertSearchIndexSchema>;
export type SearchIndex = typeof searchIndex.$inferSelect;

// Search Analytics
export const searchAnalytics = pgTable("search_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Search Details
  query: text("query").notNull(),
  resultsCount: integer("results_count").default(0),
  clickedResult: varchar("clicked_result"), // Search index ID
  clickPosition: integer("click_position"),
  
  // User Info
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"),
  
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
}, (table) => ({
  queryIdx: index("search_analytics_query_idx").on(table.query),
  searchedAtIdx: index("search_analytics_searched_at_idx").on(table.searchedAt),
}));

export const insertSearchAnalyticSchema = createInsertSchema(searchAnalytics).omit({
  id: true,
  searchedAt: true,
});

export type InsertSearchAnalytic = z.infer<typeof insertSearchAnalyticSchema>;
export type SearchAnalytic = typeof searchAnalytics.$inferSelect;

// ============================================================================
// EMAIL CAPTURE & LIST MANAGEMENT
// ============================================================================

// Email Subscribers
export const emailSubscribers = pgTable("email_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Contact Info
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  
  // Source
  source: text("source").notNull(), // "popup", "footer", "landing_page", "checkout"
  referrerUrl: text("referrer_url"),
  
  // Segments
  tags: text("tags").array(), // ["prospect", "customer", "vip"]
  interests: text("interests").array(), // ["equipment", "marketing", "operations"]
  
  // Status
  status: text("status").default("subscribed"), // "subscribed", "unsubscribed", "bounced"
  confirmedAt: timestamp("confirmed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  
  // Engagement
  emailsSent: integer("emails_sent").default(0),
  emailsOpened: integer("emails_opened").default(0),
  linksClicked: integer("links_clicked").default(0),
  lastEngagedAt: timestamp("last_engaged_at"),
  
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_subscribers_email_idx").on(table.email),
  statusIdx: index("email_subscribers_status_idx").on(table.status),
}));

export const insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({
  id: true,
  subscribedAt: true,
});

export type InsertEmailSubscriber = z.infer<typeof insertEmailSubscriberSchema>;
export type EmailSubscriber = typeof emailSubscribers.$inferSelect;

// ============================================================================
// SEO SUITE - 300-POINT MASTER SYSTEM + AGENT BUILDER
// ============================================================================

// SEO Projects - User's SEO campaigns and websites
export const seoProjects = pgTable("seo_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Project Details
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  
  // Target Keywords
  primaryKeywords: text("primary_keywords").array().default(sql`ARRAY[]::text[]`),
  secondaryKeywords: text("secondary_keywords").array().default(sql`ARRAY[]::text[]`),
  
  // Competitors
  competitors: text("competitors").array().default(sql`ARRAY[]::text[]`),
  
  // Current Performance
  currentScore: integer("current_score").default(0), // 0-300
  targetScore: integer("target_score").default(250),
  
  // Settings
  enableLocalSEO: boolean("enable_local_seo").default(false),
  enableBacklinkTracking: boolean("enable_backlink_tracking").default(true),
  enableAutoIndexing: boolean("enable_auto_indexing").default(true),
  
  // Status
  status: text("status").default("active"), // "active", "paused", "completed"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("seo_projects_user_id_idx").on(table.userId),
  statusIdx: index("seo_projects_status_idx").on(table.status),
}));

export const insertSeoProjectSchema = createInsertSchema(seoProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSeoProject = z.infer<typeof insertSeoProjectSchema>;
export type SeoProject = typeof seoProjects.$inferSelect;

// SEO Audits - Complete 300-point analysis results
export const seoAudits = pgTable("seo_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => seoProjects.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Overall Score
  totalScore: integer("total_score").notNull(), // 0-300
  percentage: integer("percentage").notNull(), // 0-100
  grade: text("grade").notNull(), // "S+", "S", "A+", "A", "B+", "B", "C", "D", "F"
  
  // Category Scores (all out of max points)
  baseSEOScore: integer("base_seo_score").notNull(), // /100
  eeatScore: integer("eeat_score").notNull(), // /15
  coreWebVitalsScore: integer("core_web_vitals_score").notNull(), // /10
  backlinksScore: integer("backlinks_score").notNull(), // /15
  localSEOScore: integer("local_seo_score").notNull(), // /15
  mobileScore: integer("mobile_score").notNull(), // /15
  securityScore: integer("security_score").notNull(), // /15
  accessibilityScore: integer("accessibility_score").notNull(), // /15
  engagementScore: integer("engagement_score").notNull(), // /15
  freshnessScore: integer("freshness_score").notNull(), // /15
  internationalScore: integer("international_score").notNull(), // /15
  aeoScore: integer("aeo_score").notNull(), // /15
  technicalScore: integer("technical_score").notNull(), // /15
  brandScore: integer("brand_score").notNull(), // /15
  uxScore: integer("ux_score").notNull(), // /15
  conversionScore: integer("conversion_score").notNull(), // /10
  videoScore: integer("video_score").notNull(), // /10
  richResultsScore: integer("rich_results_score").notNull(), // /10
  competitiveScore: integer("competitive_score").notNull(), // /10
  contentDepthScore: integer("content_depth_score").notNull(), // /10
  
  // Detailed Breakdown (JSON)
  breakdown: jsonb("breakdown").notNull(), // Full ScoreBreakdown
  recommendations: jsonb("recommendations").notNull(), // PrioritizedRecommendation[]
  
  // Competitive Analysis
  competitiveAnalysis: jsonb("competitive_analysis"), // CompetitiveAnalysis
  
  auditedAt: timestamp("audited_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("seo_audits_project_id_idx").on(table.projectId),
  userIdIdx: index("seo_audits_user_id_idx").on(table.userId),
  auditedAtIdx: index("seo_audits_audited_at_idx").on(table.auditedAt),
}));

export const insertSeoAuditSchema = createInsertSchema(seoAudits).omit({
  id: true,
  auditedAt: true,
});

export type InsertSeoAudit = z.infer<typeof insertSeoAuditSchema>;
export type SeoAudit = typeof seoAudits.$inferSelect;

// SEO Metrics - Time-series tracking of scores
export const seoMetrics = pgTable("seo_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => seoProjects.id),
  
  // Snapshot Data
  totalScore: integer("total_score").notNull(),
  organicTraffic: integer("organic_traffic").default(0),
  avgPosition: decimal("avg_position", { precision: 5, scale: 2 }),
  backlinks: integer("backlinks").default(0),
  indexedPages: integer("indexed_pages").default(0),
  
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("seo_metrics_project_id_idx").on(table.projectId),
  recordedAtIdx: index("seo_metrics_recorded_at_idx").on(table.recordedAt),
}));

export const insertSeoMetricSchema = createInsertSchema(seoMetrics).omit({
  id: true,
  recordedAt: true,
});

export type InsertSeoMetric = z.infer<typeof insertSeoMetricSchema>;
export type SeoMetric = typeof seoMetrics.$inferSelect;

// SEO Tasks - Actionable recommendations from audits
export const seoTasks = pgTable("seo_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => seoProjects.id),
  auditId: varchar("audit_id").references(() => seoAudits.id),
  
  // Task Details
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "baseSEO", "eeat", "technical", etc.
  
  // Priority
  priority: text("priority").notNull(), // "critical", "high", "medium", "low"
  impact: integer("impact").notNull(), // Potential point gain
  effort: text("effort").notNull(), // "easy", "medium", "hard"
  estimatedTime: text("estimated_time").notNull(),
  
  // Status
  status: text("status").default("pending"), // "pending", "in_progress", "completed", "dismissed"
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("seo_tasks_project_id_idx").on(table.projectId),
  statusIdx: index("seo_tasks_status_idx").on(table.status),
  priorityIdx: index("seo_tasks_priority_idx").on(table.priority),
}));

export const insertSeoTaskSchema = createInsertSchema(seoTasks).omit({
  id: true,
  createdAt: true,
});

export type InsertSeoTask = z.infer<typeof insertSeoTaskSchema>;
export type SeoTask = typeof seoTasks.$inferSelect;

// SEO Agent Templates - Pre-built AI agent configurations
export const seoAgentTemplates = pgTable("seo_agent_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Template Details
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "content", "technical", "local", "link_building"
  icon: text("icon"), // Lucide icon name
  
  // Agent Configuration
  systemPrompt: text("system_prompt").notNull(),
  capabilities: text("capabilities").array().default(sql`ARRAY[]::text[]`),
  tools: text("tools").array().default(sql`ARRAY[]::text[]`), // "keyword_research", "content_generation", "link_finder"
  
  // AI Provider
  provider: text("provider").default("openai"), // "openai", "anthropic", "gemini", "perplexity", "grok"
  model: text("model").default("gpt-4"),
  
  // Metadata
  isPremium: boolean("is_premium").default(false),
  usageCount: integer("usage_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("seo_agent_templates_category_idx").on(table.category),
  premiumIdx: index("seo_agent_templates_premium_idx").on(table.isPremium),
}));

export const insertSeoAgentTemplateSchema = createInsertSchema(seoAgentTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertSeoAgentTemplate = z.infer<typeof insertSeoAgentTemplateSchema>;
export type SeoAgentTemplate = typeof seoAgentTemplates.$inferSelect;

// SEO Agents - User's configured AI agents
export const seoAgents = pgTable("seo_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => seoProjects.id),
  templateId: varchar("template_id").references(() => seoAgentTemplates.id),
  
  // Agent Details
  name: text("name").notNull(),
  description: text("description"),
  
  // Configuration (can override template)
  systemPrompt: text("system_prompt").notNull(),
  provider: text("provider").notNull(), // "openai", "anthropic", "gemini", "perplexity", "grok"
  model: text("model").notNull(),
  
  // Tools & Capabilities
  tools: text("tools").array().default(sql`ARRAY[]::text[]`),
  capabilities: text("capabilities").array().default(sql`ARRAY[]::text[]`),
  
  // Memory & Learning
  conversationHistory: jsonb("conversation_history").default(sql`'[]'::jsonb`),
  learningData: jsonb("learning_data").default(sql`'{}'::jsonb`), // Stores learned patterns
  
  // Performance
  tasksCompleted: integer("tasks_completed").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("seo_agents_user_id_idx").on(table.userId),
  projectIdIdx: index("seo_agents_project_id_idx").on(table.projectId),
  activeIdx: index("seo_agents_active_idx").on(table.isActive),
}));

export const insertSeoAgentSchema = createInsertSchema(seoAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSeoAgent = z.infer<typeof insertSeoAgentSchema>;
export type SeoAgent = typeof seoAgents.$inferSelect;

// Domain Orders - Domain purchasing through WashBizHub
export const domainOrders = pgTable("domain_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  seoProjectId: varchar("seo_project_id").references(() => seoProjects.id),
  
  // Domain Details
  domainName: text("domain_name").notNull(),
  tld: text("tld").notNull(), // "com", "net", "org", "io"
  
  // Pricing
  registrationPrice: decimal("registration_price", { precision: 10, scale: 2 }).notNull(),
  renewalPrice: decimal("renewal_price", { precision: 10, scale: 2 }).notNull(),
  washBizHubFee: decimal("washbizhub_fee", { precision: 10, scale: 2 }).notNull(), // Our markup
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  
  // Provider Info
  provider: text("provider").notNull(), // "namecheap", "godaddy"
  providerOrderId: text("provider_order_id"),
  
  // Registration Period
  years: integer("years").default(1),
  expiresAt: timestamp("expires_at"),
  
  // Payment
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  
  // Status
  status: text("status").default("pending"), // "pending", "processing", "completed", "failed", "refunded"
  errorMessage: text("error_message"),
  
  orderedAt: timestamp("ordered_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("domain_orders_user_id_idx").on(table.userId),
  statusIdx: index("domain_orders_status_idx").on(table.status),
  domainIdx: index("domain_orders_domain_idx").on(table.domainName),
}));

export const insertDomainOrderSchema = createInsertSchema(domainOrders).omit({
  id: true,
  orderedAt: true,
});

export type InsertDomainOrder = z.infer<typeof insertDomainOrderSchema>;
export type DomainOrder = typeof domainOrders.$inferSelect;

// SEO Indexing Jobs - Auto-submit to search engines
export const seoIndexingJobs = pgTable("seo_indexing_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => seoProjects.id),
  
  // URL Details
  url: text("url").notNull(),
  urlType: text("url_type").notNull(), // "page", "post", "product", "sitemap"
  
  // Submission Status
  googleStatus: text("google_status").default("pending"), // "pending", "submitted", "indexed", "failed"
  bingStatus: text("bing_status").default("pending"),
  googleIndexedAt: timestamp("google_indexed_at"),
  bingIndexedAt: timestamp("bing_indexed_at"),
  
  // Errors
  googleError: text("google_error"),
  bingError: text("bing_error"),
  
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("seo_indexing_jobs_project_id_idx").on(table.projectId),
  googleStatusIdx: index("seo_indexing_jobs_google_status_idx").on(table.googleStatus),
}));

export const insertSeoIndexingJobSchema = createInsertSchema(seoIndexingJobs).omit({
  id: true,
  submittedAt: true,
});

export type InsertSeoIndexingJob = z.infer<typeof insertSeoIndexingJobSchema>;
export type SeoIndexingJob = typeof seoIndexingJobs.$inferSelect;

// Course Certificates (Auto-generated on completion)
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  certificateNumber: text("certificate_number").notNull().unique(), // e.g., "WBH-2025-001234"
  studentName: text("student_name").notNull(),
  courseTitle: text("course_title").notNull(),
  completionDate: timestamp("completion_date").notNull(),
  finalScore: integer("final_score"), // Percentage if applicable
  verificationUrl: text("verification_url"), // Public verification link
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
}, (table) => ({
  userCourseIdx: index("certificates_user_course_idx").on(table.userId, table.courseId),
}));

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
});

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

// Book Bookmarks, Notes, Highlights (Interactive Reading)
export const bookAnnotations = pgTable("book_annotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  chapterId: varchar("chapter_id").references(() => bookChapters.id).notNull(),
  type: text("type").notNull(), // "bookmark", "note", "highlight"
  position: integer("position").notNull(), // Character offset or paragraph index
  selectedText: text("selected_text"), // For highlights/notes
  noteContent: text("note_content"), // User's note
  color: text("color").default("yellow"), // Highlight color
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userChapterIdx: index("book_annotations_user_chapter_idx").on(table.userId, table.chapterId),
}));

export const insertBookAnnotationSchema = createInsertSchema(bookAnnotations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBookAnnotation = z.infer<typeof insertBookAnnotationSchema>;
export type BookAnnotation = typeof bookAnnotations.$inferSelect;

// Quiz Attempts & Results (Detailed tracking)
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  lessonId: varchar("lesson_id").references(() => lessons.id).notNull(),
  score: integer("score").notNull(), // Percentage (0-100)
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  answers: jsonb("answers").notNull(), // Array of user answers
  passed: boolean("passed").notNull(), // Score >= 70%
  timeSpent: integer("time_spent"), // Seconds
  attemptNumber: integer("attempt_number").notNull(), // 1st, 2nd, 3rd attempt
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (table) => ({
  userLessonIdx: index("quiz_attempts_user_lesson_idx").on(table.userId, table.lessonId),
}));

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

// ==================== EMAIL ALERT SYSTEM ====================

// Price Alert Subscriptions - notify when product price drops below target
export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email").notNull(),
  productASIN: varchar("product_asin").notNull(),
  productTitle: varchar("product_title").notNull(),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  alertSent: boolean("alert_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastChecked: timestamp("last_checked"),
}, (table) => ({
  emailIdx: index("price_alerts_email_idx").on(table.email),
  asinIdx: index("price_alerts_asin_idx").on(table.productASIN),
}));

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true });
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

// Back-in-Stock Alerts - notify when out-of-stock product becomes available
export const stockAlerts = pgTable("stock_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email").notNull(),
  productASIN: varchar("product_asin").notNull(),
  productTitle: varchar("product_title").notNull(),
  alertSent: boolean("alert_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("stock_alerts_email_idx").on(table.email),
  asinIdx: index("stock_alerts_asin_idx").on(table.productASIN),
}));

export const insertStockAlertSchema = createInsertSchema(stockAlerts).omit({ id: true, createdAt: true });
export type InsertStockAlert = z.infer<typeof insertStockAlertSchema>;
export type StockAlert = typeof stockAlerts.$inferSelect;

// New Product Alerts - notify when new products added to category
export const newProductAlerts = pgTable("new_product_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email").notNull(),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailCategoryIdx: index("new_product_alerts_email_category_idx").on(table.email, table.category),
}));

export const insertNewProductAlertSchema = createInsertSchema(newProductAlerts).omit({ id: true, createdAt: true });
export type InsertNewProductAlert = z.infer<typeof insertNewProductAlertSchema>;
export type NewProductAlert = typeof newProductAlerts.$inferSelect;

// Deal Alerts - notify when products go on sale (minimum discount threshold)
export const dealAlerts = pgTable("deal_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email").notNull(),
  minDiscount: decimal("min_discount", { precision: 5, scale: 2 }).default('10.00'),
  categories: text("categories"), // JSON array of categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("deal_alerts_email_idx").on(table.email),
}));

export const insertDealAlertSchema = createInsertSchema(dealAlerts).omit({ id: true, createdAt: true });
export type InsertDealAlert = z.infer<typeof insertDealAlertSchema>;
export type DealAlert = typeof dealAlerts.$inferSelect;

// Browse Abandonment Tracking - follow up when users view products but don't purchase
export const browseAbandonment = pgTable("browse_abandonment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  email: varchar("email"),
  productASINs: text("product_asins").notNull(), // JSON array of viewed product ASINs
  lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
}, (table) => ({
  sessionIdx: index("browse_abandonment_session_idx").on(table.sessionId),
  emailIdx: index("browse_abandonment_email_idx").on(table.email),
}));

export const insertBrowseAbandonmentSchema = createInsertSchema(browseAbandonment).omit({ id: true, lastViewedAt: true });
export type InsertBrowseAbandonment = z.infer<typeof insertBrowseAbandonmentSchema>;
export type BrowseAbandonment = typeof browseAbandonment.$inferSelect;

// ============================================================================
// SECURITY: RATE LIMITING & EMAIL VERIFICATION
// ============================================================================

// Rate Limit Log - Track API requests per IP address to prevent abuse
export const rateLimitLog = pgTable("rate_limit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: varchar("ip_address").notNull(),
  endpoint: varchar("endpoint").notNull(), // e.g., "/api/alerts/price"
  requestCount: integer("request_count").default(1).notNull(),
  windowStart: timestamp("window_start").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // Auto-cleanup old entries
}, (table) => ({
  ipEndpointIdx: uniqueIndex("rate_limit_ip_endpoint_idx").on(table.ipAddress, table.endpoint, table.windowStart),
  expiresAtIdx: index("rate_limit_expires_at_idx").on(table.expiresAt),
}));

export const insertRateLimitLogSchema = createInsertSchema(rateLimitLog).omit({ id: true, windowStart: true });
export type InsertRateLimitLog = z.infer<typeof insertRateLimitLogSchema>;
export type RateLimitLog = typeof rateLimitLog.$inferSelect;

// Email Verification Tokens - Ensure users own the email addresses they register alerts for
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").unique().notNull(), // Random UUID token sent via email
  alertType: varchar("alert_type").notNull(), // "price", "stock", "new_product", "deal"
  alertData: jsonb("alert_data").notNull(), // Store alert details until verified
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // Tokens expire in 24 hours
}, (table) => ({
  tokenIdx: index("email_verification_token_idx").on(table.token),
  emailIdx: index("email_verification_email_idx").on(table.email),
  expiresAtIdx: index("email_verification_expires_at_idx").on(table.expiresAt),
}));

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).omit({ id: true, createdAt: true, verified: true });
export type InsertEmailVerificationToken = z.infer<typeof insertEmailVerificationTokenSchema>;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;

// ============================================================================
// END OF SCHEMA - Complete platform schema with max interactivity
// ============================================================================
