import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, decimal, index, uniqueIndex, serial } from "drizzle-orm/pg-core";
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
  
  // Email/Password Auth fields
  passwordHash: text("password_hash"), // For email/password auth (bcrypt hashed)
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  
  // OAuth Provider IDs
  googleId: varchar("google_id").unique(), // Google OAuth user ID
  
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
  trialEndDate: timestamp("trial_end_date"), // End date of free trial period
  
  // AI Consultant subscription (separate from platform subscription)
  aiConsultantTier: text("ai_consultant_tier").default("free"), // "free", "pro", "enterprise"
  aiMonthlyQuota: integer("ai_monthly_quota").default(10), // Free: 10, Pro: 500, Enterprise: 999999
  aiMessagesUsed: integer("ai_messages_used").default(0).notNull(),
  aiQuotaResetDate: timestamp("ai_quota_reset_date").default(sql`NOW() + INTERVAL '1 month'`),
  
  // CLEANBI subscription (dedicated field synced with Stripe)
  cleanbiTier: text("cleanbi_tier").default("free"), // "free", "pro", "enterprise", "white_label", "api_basic", "api_pro", "api_enterprise"
  cleanbiSubscriptionId: text("cleanbi_subscription_id"), // Stripe subscription ID for CLEANBI
  cleanbiSubscriptionStatus: text("cleanbi_subscription_status"), // "active", "canceled", "past_due", etc.
  cleanbiQuotaResetDate: timestamp("cleanbi_quota_reset_date").default(sql`NOW() + INTERVAL '1 month'`),
  
  // Onboarding & Getting Started
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingStep: integer("onboarding_step").default(0), // Current step in wizard (0 = not started)
  onboardingChecklist: jsonb("onboarding_checklist").default(sql`'{"profileComplete":false,"locationAdded":false,"machinesAdded":false,"firstSaleComplete":false,"teamInvited":false}'::jsonb`),
  
  // Referral Program
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Replit Auth upsert type
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ========================================
// USER PROFILE & SOCIAL SYSTEM
// ========================================

// User Profiles (extended profile info beyond auth)
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 50 }).unique(),
  headline: varchar("headline", { length: 200 }),
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  company: varchar("company", { length: 100 }),
  website: varchar("website", { length: 255 }),
  avatarUrl: text("avatar_url"),
  avatarType: varchar("avatar_type", { length: 20 }).default("initials"), // "initials", "upload", "tenor", "google", "gravatar"
  coverImageUrl: text("cover_image_url"),
  visibility: varchar("visibility", { length: 20 }).default("public"), // "public", "private", "connections"
  profileViews: integer("profile_views").default(0),
  showEmail: boolean("show_email").default(false),
  showLocation: boolean("show_location").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// User Social Links (external profile links)
export const userSocialLinks = pgTable("user_social_links", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(), // "linkedin", "twitter", "facebook", "instagram", "youtube", "tiktok", "github"
  url: text("url").notNull(),
  displayOrder: integer("display_order").default(0),
});

export const insertUserSocialLinkSchema = createInsertSchema(userSocialLinks).omit({
  id: true,
});

export type InsertUserSocialLink = z.infer<typeof insertUserSocialLinkSchema>;
export type UserSocialLink = typeof userSocialLinks.$inferSelect;

// User Connections (follow system)
export const userConnections = pgTable("user_connections", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("active"), // "active", "blocked", "pending"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserConnectionSchema = createInsertSchema(userConnections).omit({
  id: true,
  createdAt: true,
});

export type InsertUserConnection = z.infer<typeof insertUserConnectionSchema>;
export type UserConnection = typeof userConnections.$inferSelect;

// Activity Events (user activity feed)
export const activityEvents = pgTable("activity_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // "listing_created", "cleanbi_analysis", "forum_post", "forum_reply", "follow", "achievement"
  entityType: varchar("entity_type", { length: 50 }), // "listing", "cleanbi", "forum_topic", "user"
  entityId: varchar("entity_id"),
  metadata: jsonb("metadata"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityEventSchema = createInsertSchema(activityEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityEvent = z.infer<typeof insertActivityEventSchema>;
export type ActivityEvent = typeof activityEvents.$inferSelect;

// ==================== DIRECT MESSAGING SYSTEM ====================

// Conversations - Groups users into conversations
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 20 }).default("direct"), // "direct", "group"
  title: varchar("title"), // For group chats
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  lastMessageIdx: index("conversations_last_message_idx").on(table.lastMessageAt),
}));

// Conversation Participants
export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).default("member"), // "admin", "member"
  lastReadAt: timestamp("last_read_at"),
  mutedUntil: timestamp("muted_until"),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  conversationUserIdx: uniqueIndex("conversation_user_idx").on(table.conversationId, table.userId),
  userIdx: index("participant_user_idx").on(table.userId),
}));

// Direct Messages
export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"), // "text", "image", "file", "system"
  attachments: jsonb("attachments"), // Array of { url, type, name, size }
  replyToId: varchar("reply_to_id"), // For threaded replies
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"), // Soft delete
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdx: index("dm_conversation_idx").on(table.conversationId),
  senderIdx: index("dm_sender_idx").on(table.senderId),
  createdIdx: index("dm_created_idx").on(table.createdAt),
}));

// Member Directory - Enhanced profiles for networking
export const memberProfiles = pgTable("member_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  headline: varchar("headline"), // Professional headline
  specialties: text("specialties").array(), // Areas of expertise
  services: text("services").array(), // Services offered
  yearsInIndustry: integer("years_in_industry"),
  certifications: text("certifications").array(),
  websiteUrl: varchar("website_url"),
  linkedinUrl: varchar("linkedin_url"),
  facebookUrl: varchar("facebook_url"),
  location: varchar("location"),
  isOpenToNetwork: boolean("is_open_to_network").default(true),
  isAvailableForConsulting: boolean("is_available_for_consulting").default(false),
  showEmail: boolean("show_email").default(false),
  showPhone: boolean("show_phone").default(false),
  badges: text("badges").array(), // "verified", "pro", "contributor", "mentor"
  endorsements: integer("endorsements").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("member_profile_user_idx").on(table.userId),
}));

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;

export const insertMemberProfileSchema = createInsertSchema(memberProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMemberProfile = z.infer<typeof insertMemberProfileSchema>;
export type MemberProfile = typeof memberProfiles.$inferSelect;

// Saved Items - for storing user's saved analyses, designs, calculations
export const savedItems = pgTable("saved_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemType: text("item_type").notNull(), // "cleanbi_analysis", "design", "calculation", "listing", "template"
  itemId: varchar("item_id").notNull(),
  itemData: jsonb("item_data"), // Cached snapshot of the item data for quick access
  title: text("title").notNull(),
  notes: text("notes"),
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("saved_items_user_id_idx").on(table.userId),
  itemTypeIdx: index("saved_items_item_type_idx").on(table.itemType),
}));

export const insertSavedItemSchema = createInsertSchema(savedItems).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type SavedItem = typeof savedItems.$inferSelect;

// Recently Viewed - for tracking user's browsing history
export const recentlyViewed = pgTable("recently_viewed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemType: text("item_type").notNull(), // "listing", "cleanbi", "design", "calculator", "page"
  itemId: varchar("item_id").notNull(),
  itemData: jsonb("item_data"), // Basic snapshot for display
  title: text("title").notNull(),
  url: text("url").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  viewCount: integer("view_count").default(1).notNull(),
}, (table) => ({
  userIdIdx: index("recently_viewed_user_id_idx").on(table.userId),
  viewedAtIdx: index("recently_viewed_viewed_at_idx").on(table.viewedAt),
}));

export const insertRecentlyViewedSchema = createInsertSchema(recentlyViewed).omit({
  id: true,
  viewedAt: true,
  viewCount: true,
});

export type InsertRecentlyViewed = z.infer<typeof insertRecentlyViewedSchema>;
export type RecentlyViewed = typeof recentlyViewed.$inferSelect;

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

// CLEANBI Usage Tracking (for subscription quotas & MRR/ARR analytics)
export const cleanbiUsage = pgTable("cleanbi_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  reportType: text("report_type").notNull(), // "basic", "detailed", "api"
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  month: varchar("month").notNull(), // "YYYY-MM" for quota tracking
  addressScored: text("address_scored"), // Optional: which address was scored
  metadata: jsonb("metadata"), // Optional: capture email, score, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCleanbiUsageSchema = createInsertSchema(cleanbiUsage).omit({
  id: true,
  createdAt: true,
});

export type InsertCleanbiUsage = z.infer<typeof insertCleanbiUsageSchema>;
export type CleanbiUsage = typeof cleanbiUsage.$inferSelect;

// Premium CLEANBI Reports (Paid PDF Reports with Full Analysis)
export const cleanbiReports = pgTable("cleanbi_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  address: text("address").notNull(),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  cleanbiScore: integer("cleanbi_score"),
  cleanbiGrade: varchar("cleanbi_grade"), // A, B, C, Needs Work
  reportType: varchar("report_type").default("standard"), // standard, pro, enterprise
  reportData: jsonb("report_data"), // Full analysis JSON
  visionAnalysis: jsonb("vision_analysis"), // Vision AI results
  competitorData: jsonb("competitor_data"), // Places API results
  demographicData: jsonb("demographic_data"), // Census data
  pdfUrl: text("pdf_url"), // Object storage URL
  status: varchar("status").default("pending"), // pending, processing, completed, failed
  price: integer("price"), // Price paid in cents
  stripePaymentId: text("stripe_payment_id"),
  stripeSessionId: text("stripe_session_id"), // Stripe checkout session ID
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"), // When report was generated
});

export const insertCleanbiReportSchema = createInsertSchema(cleanbiReports).omit({
  id: true,
  createdAt: true,
  completedAt: true,
}).extend({
  lat: z.string().optional(),
  lng: z.string().optional(),
});

export type InsertCleanbiReport = z.infer<typeof insertCleanbiReportSchema>;
export type CleanbiReport = typeof cleanbiReports.$inferSelect;

// Residential Property Scores (for ANY address - homes, apartments, land)
export const residentialScores = pgTable("residential_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  address: text("address").notNull(),
  
  // Core Metrics (0-100 scale for consistency)
  propertyValueTrend: integer("property_value_trend").notNull(), // 0-30 points
  neighborhoodQuality: integer("neighborhood_quality").notNull(), // 0-25 points
  schoolRating: integer("school_rating").notNull(), // 0-20 points
  crimeScore: integer("crime_score").notNull(), // 0-15 points (higher = safer)
  walkability: integer("walkability").notNull(), // 0-10 points
  
  totalScore: integer("total_score").notNull(), // Sum (0-100)
  grade: text("grade").notNull(), // A+, A, A-, B+, B, etc.
  
  // Property Details (from ATTOM)
  propertyType: text("property_type"), // "single_family", "condo", "townhouse", "multi_family", "land"
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }), // Current market value
  yearBuilt: integer("year_built"),
  squareFeet: integer("square_feet"),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  lotSize: decimal("lot_size", { precision: 10, scale: 2 }), // Square feet
  
  // Neighborhood Data
  medianIncome: decimal("median_income", { precision: 10, scale: 2 }),
  populationDensity: integer("population_density"), // Per square mile
  avgSchoolRating: decimal("avg_school_rating", { precision: 3, scale: 1 }), // 0-10
  walkScore: integer("walk_score"), // 0-100
  
  // Investment Metrics
  rentalPotential: text("rental_potential"), // "excellent", "good", "fair", "poor"
  appreciationRate: decimal("appreciation_rate", { precision: 5, scale: 2 }), // Annual % (e.g., 8.50 = 8.5%)
  
  // AI Analysis
  aiInsights: text("ai_insights"), // Gemini-generated investment recommendations
  recommendations: jsonb("recommendations"), // Array of actionable insights
  
  // Breakdown for transparency
  breakdown: jsonb("breakdown").notNull(), // Detailed scoring breakdown
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResidentialScoreSchema = createInsertSchema(residentialScores).omit({
  id: true,
  createdAt: true,
}).extend({
  estimatedValue: z.string().optional(),
  bathrooms: z.string().optional(),
  lotSize: z.string().optional(),
  medianIncome: z.string().optional(),
  avgSchoolRating: z.string().optional(),
  appreciationRate: z.string().optional(),
});

export type InsertResidentialScore = z.infer<typeof insertResidentialScoreSchema>;
export type ResidentialScore = typeof residentialScores.$inferSelect;

// Regional Pricing (PPP-adjusted pricing for global markets)
export const regionalPricing = pgTable("regional_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Region/Country
  countryCode: varchar("country_code", { length: 2 }).notNull(), // ISO 3166-1 alpha-2 (US, PH, JP, AU, GB, etc.)
  countryName: text("country_name").notNull(), // "United States", "Philippines", "Japan"
  region: text("region").notNull(), // "North America", "Southeast Asia", "East Asia", "Europe", "Oceania"
  
  // Currency
  currency: varchar("currency", { length: 3 }).notNull(), // ISO 4217 (USD, PHP, JPY, EUR, GBP, AUD)
  currencySymbol: varchar("currency_symbol", { length: 5 }).notNull(), // "$", "₱", "¥", "€", "£"
  
  // CLEANBI Report Pricing (one-time purchases in cents/smallest currency unit)
  basicReportPrice: integer("basic_report_price").notNull(), // e.g., 4700 = $47.00, 250000 = ₱2,500
  standardReportPrice: integer("standard_report_price").notNull(), // e.g., 9700 = $97.00, 500000 = ₱5,000
  premiumReportPrice: integer("premium_report_price").notNull(), // e.g., 49700 = $497.00, 2500000 = ₱25,000
  
  // Subscription Pricing (monthly, in cents/smallest currency unit)
  monthlySubscriptionPrice: integer("monthly_subscription_price").notNull(), // e.g., 2900 = $29/mo, 80000 = ₱800/mo
  
  // Purchasing Power Parity Adjustment
  pppMultiplier: decimal("ppp_multiplier", { precision: 5, scale: 2 }).notNull(), // 1.00 = USA baseline, 0.50 = 50% of USA price
  
  // Display Settings
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(), // Sort order in dropdowns
  
  // Stripe Integration
  stripeBasicPriceId: text("stripe_basic_price_id"), // Stripe Price ID for basic report
  stripeStandardPriceId: text("stripe_standard_price_id"), // Stripe Price ID for standard report
  stripePremiumPriceId: text("stripe_premium_price_id"), // Stripe Price ID for premium report
  stripeSubscriptionPriceId: text("stripe_subscription_price_id"), // Stripe Price ID for monthly subscription
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  countryCodeIdx: uniqueIndex("country_code_idx").on(table.countryCode),
}));

export const insertRegionalPricingSchema = createInsertSchema(regionalPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  pppMultiplier: z.string(), // decimal as string
});

export type InsertRegionalPricing = z.infer<typeof insertRegionalPricingSchema>;
export type RegionalPricing = typeof regionalPricing.$inferSelect;

// ========================================
// GLOBAL SEO/AEO TRACKING SYSTEM
// ========================================

// Target Keywords (what we want to rank for globally)
export const seoKeywords = pgTable("seo_keywords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Keyword Details
  keyword: text("keyword").notNull(), // "cleanbi score", "laundromat investment calculator"
  language: varchar("language", { length: 5 }).notNull(), // ISO 639-1 (en, es, ja, zh, tl)
  countryCode: varchar("country_code", { length: 2 }).notNull(), // ISO 3166-1 (US, PH, JP, AU, GB)
  
  // Search Intent
  intent: text("intent").notNull(), // "commercial", "informational", "navigational", "transactional"
  category: text("category").notNull(), // "cleanbi", "real_estate", "business_buying", "laundromat"
  priority: integer("priority").default(5).notNull(), // 1-10 (10 = highest)
  
  // Target Metrics
  targetPosition: integer("target_position").default(1).notNull(), // Goal: rank #1-3
  monthlySearchVolume: integer("monthly_search_volume"), // From SERP API
  competitionLevel: text("competition_level"), // "low", "medium", "high"
  cpcEstimate: decimal("cpc_estimate", { precision: 6, scale: 2 }), // Cost per click in USD
  
  // Tracking Status
  isActive: boolean("is_active").default(true).notNull(),
  isTracking: boolean("is_tracking").default(true).notNull(), // Track rankings daily?
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  keywordCountryIdx: index("seo_keyword_country_idx").on(table.keyword, table.countryCode),
}));

export const insertSeoKeywordSchema = createInsertSchema(seoKeywords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  cpcEstimate: z.string().optional(),
});

export type InsertSeoKeyword = z.infer<typeof insertSeoKeywordSchema>;
export type SeoKeyword = typeof seoKeywords.$inferSelect;

// Keyword Rankings (daily tracking via SERP API)
export const keywordRankings = pgTable("keyword_rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  keywordId: varchar("keyword_id").references(() => seoKeywords.id).notNull(),
  
  // Ranking Data (from SERP API)
  position: integer("position"), // Our ranking position (1-100)
  previousPosition: integer("previous_position"), // Yesterday's position
  url: text("url"), // Which URL is ranking (e.g., /cleanbi-auto)
  title: text("title"), // Page title in SERP
  snippet: text("snippet"), // Meta description shown
  
  // SERP Features
  hasFeaturedSnippet: boolean("has_featured_snippet").default(false).notNull(),
  hasPeopleAlsoAsk: boolean("has_people_also_ask").default(false).notNull(),
  hasLocalPack: boolean("has_local_pack").default(false).notNull(),
  hasKnowledgeGraph: boolean("has_knowledge_graph").default(false).notNull(),
  
  // Competitor Analysis
  topCompetitors: jsonb("top_competitors"), // Top 3 competitors [{domain, position, url}]
  
  // Raw SERP API Response
  serpApiData: jsonb("serp_api_data"), // Full response for debugging
  
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
}, (table) => ({
  keywordCheckedIdx: index("keyword_checked_idx").on(table.keywordId, table.checkedAt),
}));

export const insertKeywordRankingSchema = createInsertSchema(keywordRankings).omit({
  id: true,
  checkedAt: true,
});

export type InsertKeywordRanking = z.infer<typeof insertKeywordRankingSchema>;
export type KeywordRanking = typeof keywordRankings.$inferSelect;

// Organic Traffic Analytics (Google Search Console + Custom)
export const organicTraffic = pgTable("organic_traffic", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Traffic Source
  source: text("source").notNull(), // "google", "bing", "yahoo", "duckduckgo", "baidu"
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  language: varchar("language", { length: 5 }).notNull(),
  
  // Traffic Metrics
  date: timestamp("date").notNull(), // Daily aggregation
  sessions: integer("sessions").default(0).notNull(),
  pageviews: integer("pageviews").default(0).notNull(),
  uniqueVisitors: integer("unique_visitors").default(0).notNull(),
  avgSessionDuration: integer("avg_session_duration"), // Seconds
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }), // 45.50 = 45.5%
  
  // Landing Pages
  topLandingPage: text("top_landing_page"), // Most visited page (/cleanbi-auto)
  landingPageBreakdown: jsonb("landing_page_breakdown"), // [{path, sessions, conversions}]
  
  // Conversions
  cleanbScoresGenerated: integer("cleanbi_scores_generated").default(0).notNull(),
  reportsPurchased: integer("reports_purchased").default(0).notNull(),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }), // 3.50 = 3.5%
  revenue: decimal("revenue", { precision: 12, scale: 2 }), // Total revenue from organic traffic
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  dateCountryIdx: index("traffic_date_country_idx").on(table.date, table.countryCode),
}));

export const insertOrganicTrafficSchema = createInsertSchema(organicTraffic).omit({
  id: true,
  createdAt: true,
}).extend({
  bounceRate: z.string().optional(),
  conversionRate: z.string().optional(),
  revenue: z.string().optional(),
});

export type InsertOrganicTraffic = z.infer<typeof insertOrganicTrafficSchema>;
export type OrganicTraffic = typeof organicTraffic.$inferSelect;

// AEO (Answer Engine Optimization) Performance
export const aeoPerformance = pgTable("aeo_performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Answer Engine
  engine: text("engine").notNull(), // "google_sge", "perplexity", "chatgpt", "claude", "gemini"
  query: text("query").notNull(), // User question
  language: varchar("language", { length: 5 }).notNull(),
  countryCode: varchar("country_code", { length: 2 }),
  
  // Citation Performance
  isCited: boolean("is_cited").default(false).notNull(), // Did we get cited?
  citationPosition: integer("citation_position"), // Position in citations (1-10)
  citedUrl: text("cited_url"), // Which URL was cited
  citationText: text("citation_text"), // Snippet that was cited
  
  // Answer Analysis
  answerContainsCleanbi: boolean("answer_contains_cleanbi").default(false).notNull(),
  answerSentiment: text("answer_sentiment"), // "positive", "neutral", "negative"
  
  // Raw Response
  fullResponse: text("full_response"), // Full AI-generated answer
  metadata: jsonb("metadata"), // Additional tracking data
  
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
}, (table) => ({
  engineQueryIdx: index("aeo_engine_query_idx").on(table.engine, table.query),
}));

export const insertAeoPerformanceSchema = createInsertSchema(aeoPerformance).omit({
  id: true,
  checkedAt: true,
});

export type InsertAeoPerformance = z.infer<typeof insertAeoPerformanceSchema>;
export type AeoPerformance = typeof aeoPerformance.$inferSelect;

// ========================================
// ULTIMATE SEO BLOG SYSTEM (300 BLOGS)
// ========================================

// Blog Posts (AI-Generated with Perfect SEO)
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // ===== CORE CONTENT =====
  title: text("title").notNull(), // H1 heading (50-60 chars)
  content: text("content").notNull(), // Full HTML content with semantic markup
  excerpt: text("excerpt").notNull(), // 150-160 char summary
  
  // ===== URL & ROUTING =====
  slug: text("slug").notNull().unique(), // URL-friendly: "how-to-buy-laundromat-2024"
  canonicalUrl: text("canonical_url"), // Absolute URL for duplicate content prevention
  
  // ===== SEO META TAGS =====
  metaTitle: text("meta_title").notNull(), // 50-60 chars, keyword-optimized
  metaDescription: text("meta_description").notNull(), // 150-160 chars, compelling CTA
  metaKeywords: jsonb("meta_keywords"), // Array of target keywords ["laundromat ROI", "buy laundromat"]
  focusKeyphrases: jsonb("focus_keyphrases").notNull(), // Primary + secondary keywords
  
  // ===== OPEN GRAPH (SOCIAL SHARING) =====
  ogTitle: text("og_title"), // Facebook/LinkedIn title (defaults to metaTitle)
  ogDescription: text("og_description"), // Social description (defaults to metaDescription)
  ogImage: text("og_image"), // Social share image URL (1200×630px)
  ogType: text("og_type").default("article"), // "article", "website"
  
  // ===== TWITTER CARDS =====
  twitterCard: text("twitter_card").default("summary_large_image"), // "summary", "summary_large_image"
  twitterTitle: text("twitter_title"), // Twitter-specific title
  twitterDescription: text("twitter_description"), // Twitter-specific description
  twitterImage: text("twitter_image"), // Twitter image (defaults to ogImage)
  
  // ===== SCHEMA.ORG STRUCTURED DATA =====
  schemaMarkup: jsonb("schema_markup"), // Article, BreadcrumbList, Organization JSON-LD
  authorName: text("author_name").default("WashBizHub Research Team"),
  authorImage: text("author_image"),
  datePublished: timestamp("date_published").defaultNow().notNull(),
  dateModified: timestamp("date_modified").defaultNow().notNull(),
  
  // ===== CONTENT CLASSIFICATION =====
  type: text("type").notNull(), // "ai_multi", "ai_single", "manual", "ugc"
  category: text("category").notNull(), // "business_buying", "real_estate", "laundromat"
  subcategory: text("subcategory"), // "due_diligence", "roi_analysis", "financing"
  market: text("market").notNull(), // "global", "us", "ph", "jp", "au", "uk", "eu"
  language: varchar("language", { length: 5 }).default("en").notNull(), // ISO 639-1
  
  // ===== AI GENERATION METADATA =====
  aiProviders: jsonb("ai_providers"), // ["anthropic", "gemini", "perplexity", "grok"]
  aiPrompt: text("ai_prompt"), // Original generation prompt
  aiQualityScore: integer("ai_quality_score"), // 0-100 content quality rating
  seoScore: integer("seo_score"), // 0-100 SEO optimization score
  readabilityScore: integer("readability_score"), // Flesch reading ease
  
  // ===== IMAGES & MEDIA =====
  featuredImage: text("featured_image"), // Hero image URL
  featuredImageAlt: text("featured_image_alt"), // Accessibility alt text
  imageGallery: jsonb("image_gallery"), // [{url, alt, caption}]
  
  // ===== INTERNAL LINKING =====
  relatedPosts: jsonb("related_posts"), // Array of related post IDs
  linkToCleanbi: boolean("link_to_cleanbi").default(true).notNull(), // Must link to CLEANBI tool
  cleanbiAnchorText: text("cleanbi_anchor_text").default("Try our free property analysis tool"),
  internalLinks: jsonb("internal_links"), // [{url, anchor, context}]
  
  // ===== PDF EXPORT =====
  pdfGenerated: boolean("pdf_generated").default(false).notNull(),
  pdfUrl: text("pdf_url"), // S3/CDN URL of downloadable PDF
  pdfDownloads: integer("pdf_downloads").default(0).notNull(),
  
  // ===== PUBLISHING & STATUS =====
  status: text("status").notNull().default("draft"), // "draft", "scheduled", "published", "archived"
  scheduledFor: timestamp("scheduled_for"), // Auto-publish date
  published: boolean("published").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  
  // ===== ANALYTICS & PERFORMANCE =====
  views: integer("views").default(0).notNull(),
  avgTimeOnPage: integer("avg_time_on_page"), // Seconds
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }), // 45.50 = 45.5%
  conversions: integer("conversions").default(0).notNull(), // CLEANBI reports generated from this blog
  organicTraffic: integer("organic_traffic").default(0).notNull(),
  
  // ===== SEO TRACKING =====
  targetKeywordId: varchar("target_keyword_id").references(() => seoKeywords.id), // Primary keyword tracking
  currentRanking: integer("current_ranking"), // Google position for target keyword
  lastRankingCheck: timestamp("last_ranking_check"),
  
  // ===== VISIBILITY ADD-ON LINK =====
  sourceListingId: varchar("source_listing_id"), // If generated from a listing's paid visibility add-on
  tenantId: varchar("tenant_id").references(() => tenants.id), // Multi-tenant support
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("blog_slug_idx").on(table.slug),
  categoryIdx: index("blog_category_idx").on(table.category),
  publishedIdx: index("blog_published_idx").on(table.published, table.datePublished),
  keywordIdx: index("blog_keyword_idx").on(table.targetKeywordId),
}));

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  views: true,
  pdfDownloads: true,
  conversions: true,
  organicTraffic: true,
  createdAt: true,
  updatedAt: true,
  datePublished: true,
  dateModified: true,
}).extend({
  bounceRate: z.string().optional(),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// ========================================
// GLOBAL EMAIL CAPTURE SUITE
// ========================================

// Newsletter Subscribers (Industry-Segmented)
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // ===== CONTACT INFO =====
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  
  // ===== INDUSTRY SEGMENTATION =====
  primaryIndustry: text("primary_industry").notNull(), // "business_buying", "real_estate", "laundromat", "general"
  industries: jsonb("industries").notNull(), // Array of all interests ["business_buying", "real_estate"]
  
  // ===== GEOGRAPHIC SEGMENTATION =====
  countryCode: varchar("country_code", { length: 2 }), // ISO 3166-1 (US, PH, JP, AU, GB)
  language: varchar("language", { length: 5 }).default("en").notNull(), // ISO 639-1
  timezone: text("timezone"), // "America/New_York"
  
  // ===== LEAD SOURCE TRACKING =====
  source: text("source").notNull(), // "blog_pdf", "cleanbi_tool", "homepage", "landing_page"
  sourceUrl: text("source_url"), // Original page URL
  sourceBlogId: varchar("source_blog_id").references(() => blogPosts.id), // Which blog captured them
  sourceKeyword: text("source_keyword"), // What keyword brought them
  utmSource: text("utm_source"), // UTM tracking
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  
  // ===== SUBSCRIPTION STATUS =====
  status: text("status").notNull().default("active"), // "active", "unsubscribed", "bounced", "complained"
  emailVerified: boolean("email_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  
  // ===== ENGAGEMENT PREFERENCES =====
  frequency: text("frequency").default("weekly"), // "daily", "weekly", "biweekly", "monthly"
  contentPreferences: jsonb("content_preferences"), // ["due_diligence", "roi_analysis", "market_trends"]
  emailFormat: text("email_format").default("html"), // "html", "text"
  
  // ===== ENGAGEMENT METRICS =====
  totalEmailsSent: integer("total_emails_sent").default(0).notNull(),
  totalEmailsOpened: integer("total_emails_opened").default(0).notNull(),
  totalLinksClicked: integer("total_links_clicked").default(0).notNull(),
  lastEmailSent: timestamp("last_email_sent"),
  lastEmailOpened: timestamp("last_email_opened"),
  lastLinkClicked: timestamp("last_link_clicked"),
  engagementScore: integer("engagement_score").default(0).notNull(), // 0-100 based on opens/clicks
  
  // ===== LEAD SCORING =====
  leadScore: integer("lead_score").default(0).notNull(), // 0-100 conversion likelihood
  leadStatus: text("lead_status").default("cold"), // "cold", "warm", "hot", "customer"
  cleanbReportsGenerated: integer("cleanbi_reports_generated").default(0).notNull(),
  pdfDownloads: integer("pdf_downloads").default(0).notNull(),
  
  // ===== UNSUBSCRIBE TRACKING =====
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeReason: text("unsubscribe_reason"),
  
  // ===== RESEND INTEGRATION =====
  resendContactId: text("resend_contact_id"), // Resend API contact ID
  resendAudienceId: text("resend_audience_id"), // Segmented audience ID
  
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("newsletter_email_idx").on(table.email),
  industryIdx: index("newsletter_industry_idx").on(table.primaryIndustry),
  statusIdx: index("newsletter_status_idx").on(table.status),
  countryIdx: index("newsletter_country_idx").on(table.countryCode),
  leadScoreIdx: index("newsletter_lead_score_idx").on(table.leadScore),
}));

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  totalEmailsSent: true,
  totalEmailsOpened: true,
  totalLinksClicked: true,
  engagementScore: true,
  leadScore: true,
  cleanbReportsGenerated: true,
  pdfDownloads: true,
  subscribedAt: true,
  updatedAt: true,
});

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Email Campaigns (Industry-Specific Blasts)
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // ===== CAMPAIGN DETAILS =====
  name: text("name").notNull(), // "Weekly Real Estate Digest"
  subject: text("subject").notNull(), // Email subject line
  preheader: text("preheader"), // Preview text
  
  // ===== CONTENT =====
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"), // Plain text fallback
  
  // ===== TARGETING =====
  targetIndustries: jsonb("target_industries").notNull(), // ["real_estate", "business_buying"]
  targetCountries: jsonb("target_countries"), // ["US", "PH", "JP"] or null = all
  targetLanguages: jsonb("target_languages"), // ["en", "es"] or null = all
  minLeadScore: integer("min_lead_score"), // Only send to leads with score >= X
  
  // ===== BLOG INTEGRATION =====
  featuredBlogIds: jsonb("featured_blog_ids"), // Array of blog post IDs to feature
  
  // ===== SCHEDULING =====
  status: text("status").notNull().default("draft"), // "draft", "scheduled", "sending", "sent", "failed"
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  
  // ===== PERFORMANCE METRICS =====
  totalRecipients: integer("total_recipients").default(0).notNull(),
  totalSent: integer("total_sent").default(0).notNull(),
  totalDelivered: integer("total_delivered").default(0).notNull(),
  totalOpened: integer("total_opened").default(0).notNull(),
  totalClicked: integer("total_clicked").default(0).notNull(),
  totalBounced: integer("total_bounced").default(0).notNull(),
  totalUnsubscribed: integer("total_unsubscribed").default(0).notNull(),
  
  // ===== CALCULATED RATES =====
  openRate: decimal("open_rate", { precision: 5, scale: 2 }), // 45.50 = 45.5%
  clickRate: decimal("click_rate", { precision: 5, scale: 2 }),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),
  
  // ===== RESEND INTEGRATION =====
  resendBatchId: text("resend_batch_id"), // Resend API batch ID
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("campaign_status_idx").on(table.status),
  scheduledIdx: index("campaign_scheduled_idx").on(table.scheduledFor),
}));

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  totalRecipients: true,
  totalSent: true,
  totalDelivered: true,
  totalOpened: true,
  totalClicked: true,
  totalBounced: true,
  totalUnsubscribed: true,
  createdAt: true,
}).extend({
  openRate: z.string().optional(),
  clickRate: z.string().optional(),
  conversionRate: z.string().optional(),
});

export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;

// Email Events (Individual Tracking)
export const emailEvents = pgTable("email_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  subscriberId: varchar("subscriber_id").references(() => newsletterSubscribers.id).notNull(),
  campaignId: varchar("campaign_id").references(() => emailCampaigns.id),
  
  eventType: text("event_type").notNull(), // "sent", "delivered", "opened", "clicked", "bounced", "complained", "unsubscribed"
  
  // ===== EVENT DETAILS =====
  clickedUrl: text("clicked_url"), // For click events
  bounceType: text("bounce_type"), // "hard", "soft"
  bounceReason: text("bounce_reason"),
  userAgent: text("user_agent"), // Browser/device info
  ipAddress: text("ip_address"),
  
  // ===== RESEND WEBHOOK DATA =====
  resendEventId: text("resend_event_id"),
  webhookPayload: jsonb("webhook_payload"), // Full Resend webhook data
  
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
}, (table) => ({
  subscriberEventIdx: index("email_event_subscriber_idx").on(table.subscriberId, table.eventType),
  campaignEventIdx: index("email_event_campaign_idx").on(table.campaignId, table.eventType),
  occurredIdx: index("email_event_occurred_idx").on(table.occurredAt),
}));

export const insertEmailEventSchema = createInsertSchema(emailEvents).omit({
  id: true,
  occurredAt: true,
});

export type InsertEmailEvent = z.infer<typeof insertEmailEventSchema>;
export type EmailEvent = typeof emailEvents.$inferSelect;

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
// WDF Pricing Configuration Schema
export const wdfPricingConfigSchema = z.object({
  standardPricePerPound: z.number().default(1.50),
  minimumWeight: z.number().default(10),
  minimumCharge: z.number().default(15),
  rushSurchargePercent: z.number().default(50),
  sameDaySurchargePercent: z.number().default(75),
  pickupDeliveryFee: z.number().default(5),
  perMileFee: z.number().default(0),
  freeDeliveryMinimum: z.number().optional(),
  serviceTiers: z.object({
    standard: z.object({
      name: z.string().default("Standard"),
      turnaroundHours: z.number().default(48),
      priceMultiplier: z.number().default(1.0),
    }),
    express: z.object({
      name: z.string().default("Express"),
      turnaroundHours: z.number().default(24),
      priceMultiplier: z.number().default(1.25),
    }),
    sameDay: z.object({
      name: z.string().default("Same Day Rush"),
      turnaroundHours: z.number().default(6),
      priceMultiplier: z.number().default(1.75),
    }),
    premium: z.object({
      name: z.string().default("Premium Care"),
      turnaroundHours: z.number().default(48),
      priceMultiplier: z.number().default(1.50),
    }),
  }).optional(),
  addOns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    priceType: z.enum(["flat", "per_pound"]),
    price: z.number(),
  })).optional(),
  taxRate: z.number().default(8.25),
});

export type WdfPricingConfig = z.infer<typeof wdfPricingConfigSchema>;

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
  wdfPricingConfig: jsonb("wdf_pricing_config"), // WDF per-pound pricing configuration
});

export const insertLaundromatSchema = createInsertSchema(laundromats).omit({
  id: true,
});

export type InsertLaundromat = z.infer<typeof insertLaundromatSchema>;
export type Laundromat = typeof laundromats.$inferSelect;

// Equipment Library (reference data) - 60+ machines from 15+ brands
export const equipmentLibrary = [
  // DEXTER WASHERS
  { id: "dexter-t300", name: "Dexter T-300", type: "washer", capacity: "20lb", width: 26, depth: 27, height: 42, cost: 5500, tpdContribution: 7, color: "#4a90e2" },
  { id: "dexter-t400", name: "Dexter T-400", type: "washer", capacity: "30lb", width: 28, depth: 30, height: 45, cost: 6500, tpdContribution: 8, color: "#3b82f6" },
  { id: "dexter-t600", name: "Dexter T-600", type: "washer", capacity: "40lb", width: 30, depth: 33, height: 48, cost: 8000, tpdContribution: 9, color: "#2563eb" },
  { id: "dexter-t900", name: "Dexter T-900", type: "washer", capacity: "60lb", width: 34, depth: 38, height: 52, cost: 10500, tpdContribution: 11, color: "#1d4ed8" },
  { id: "dexter-t1200", name: "Dexter T-1200", type: "washer", capacity: "100lb", width: 48, depth: 54, height: 78, cost: 15000, tpdContribution: 15, color: "#1e40af" },
  // DEXTER DRYERS
  { id: "dexter-dct030", name: "Dexter DCT030", type: "dryer", capacity: "30lb", width: 30, depth: 42, height: 70, cost: 4500, tpdContribution: 8, color: "#0891b2" },
  { id: "dexter-dct050", name: "Dexter DCT050", type: "dryer", capacity: "50lb", width: 35, depth: 47, height: 76, cost: 6500, tpdContribution: 10, color: "#0e7490" },
  { id: "dexter-dct080", name: "Dexter DCT080", type: "dryer", capacity: "80lb", width: 40, depth: 52, height: 82, cost: 9000, tpdContribution: 13, color: "#155e75" },
  { id: "dexter-stack-55", name: "Dexter Stack 55", type: "dryer", capacity: "55lb", width: 32, depth: 42, height: 80, cost: 7500, tpdContribution: 12, color: "#164e63" },
  // SPEED QUEEN WASHERS
  { id: "speed-queen-ff7005", name: "Speed Queen FF7005", type: "washer", capacity: "22lb", width: 27, depth: 28, height: 44, cost: 5000, tpdContribution: 8, color: "#1e40af" },
  { id: "speed-queen-sfn", name: "Speed Queen SFN", type: "washer", capacity: "27lb", width: 27, depth: 32, height: 43, cost: 3800, tpdContribution: 9, color: "#e74c3c" },
  { id: "speed-queen-sc60", name: "Speed Queen SC60", type: "washer", capacity: "60lb", width: 35, depth: 43, height: 56, cost: 11500, tpdContribution: 12, color: "#1e3a8a" },
  { id: "speed-queen-sc80", name: "Speed Queen SC80", type: "washer", capacity: "80lb", width: 38, depth: 48, height: 60, cost: 14500, tpdContribution: 14, color: "#1e3a8a" },
  // SPEED QUEEN DRYERS
  { id: "speed-queen-dr7", name: "Speed Queen DR7", type: "dryer", capacity: "50lb", width: 28, depth: 28, height: 43, cost: 4800, tpdContribution: 10, color: "#b91c1c" },
  { id: "speed-queen-stack", name: "Speed Queen Stack", type: "dryer", capacity: "30lb", width: 27, depth: 31, height: 75, cost: 4500, tpdContribution: 12, color: "#c0392b" },
  { id: "speed-queen-st075", name: "Speed Queen ST075", type: "dryer", capacity: "75lb", width: 28, depth: 32, height: 78, cost: 6800, tpdContribution: 14, color: "#991b1b" },
  // MAYTAG WASHERS
  { id: "maytag-mfr25", name: "Maytag MFR25", type: "washer", capacity: "25lb", width: 27, depth: 30, height: 46, cost: 5000, tpdContribution: 8, color: "#dc2626" },
  { id: "maytag-mfr40", name: "Maytag MFR40", type: "washer", capacity: "40lb", width: 31, depth: 38, height: 54, cost: 7500, tpdContribution: 10, color: "#b91c1c" },
  { id: "maytag-mfr65", name: "Maytag MFR65", type: "washer", capacity: "65lb", width: 36, depth: 44, height: 58, cost: 11000, tpdContribution: 12, color: "#991b1b" },
  // MAYTAG DRYERS
  { id: "maytag-mdg50", name: "Maytag MDG50", type: "dryer", capacity: "50lb", width: 32, depth: 44, height: 72, cost: 5500, tpdContribution: 9, color: "#ef4444" },
  { id: "maytag-mdg75", name: "Maytag MDG75", type: "dryer", capacity: "75lb", width: 38, depth: 53, height: 85, cost: 8500, tpdContribution: 12, color: "#dc2626" },
  // ELECTROLUX WASHERS
  { id: "electrolux-wh620", name: "Electrolux WH6-20", type: "washer", capacity: "20lb", width: 27, depth: 30, height: 44, cost: 6500, tpdContribution: 8, color: "#7c3aed" },
  { id: "electrolux-wh633", name: "Electrolux WH6-33", type: "washer", capacity: "33lb", width: 32, depth: 36, height: 52, cost: 10500, tpdContribution: 10, color: "#6d28d9" },
  { id: "electrolux-wh655", name: "Electrolux WH6-55", type: "washer", capacity: "55lb", width: 36, depth: 42, height: 56, cost: 14000, tpdContribution: 12, color: "#5b21b6" },
  // ELECTROLUX DRYERS
  { id: "electrolux-t5350", name: "Electrolux T5350", type: "dryer", capacity: "50lb", width: 34, depth: 44, height: 75, cost: 6500, tpdContribution: 10, color: "#8b5cf6" },
  { id: "electrolux-t5675", name: "Electrolux T5675", type: "dryer", capacity: "75lb", width: 38, depth: 49, height: 83, cost: 8500, tpdContribution: 12, color: "#7c3aed" },
  // MIELE WASHERS
  { id: "miele-pw818", name: "Miele PW818", type: "washer", capacity: "18lb", width: 28, depth: 35, height: 53, cost: 6500, tpdContribution: 7, color: "#059669" },
  { id: "miele-pw6080", name: "Miele PW6080", type: "washer", capacity: "80lb", width: 40, depth: 50, height: 62, cost: 18000, tpdContribution: 14, color: "#047857" },
  // MIELE DRYERS
  { id: "miele-pt8333", name: "Miele PT8333", type: "dryer", capacity: "33lb", width: 30, depth: 40, height: 55, cost: 7500, tpdContribution: 9, color: "#10b981" },
  // LG WASHERS
  { id: "lg-gcwp1069", name: "LG GCWP1069", type: "washer", capacity: "22lb", width: 27, depth: 28, height: 40, cost: 4200, tpdContribution: 7, color: "#a21caf" },
  { id: "lg-gcwp3500", name: "LG GCWP3500", type: "washer", capacity: "35lb", width: 30, depth: 34, height: 48, cost: 6500, tpdContribution: 9, color: "#86198f" },
  // CONTINENTAL GIRBAU WASHERS
  { id: "girbau-hs6008", name: "Girbau HS-6008", type: "washer", capacity: "20lb", width: 28, depth: 30, height: 45, cost: 6000, tpdContribution: 8, color: "#0d9488" },
  { id: "girbau-hs6018", name: "Girbau HS-6018", type: "washer", capacity: "40lb", width: 32, depth: 38, height: 52, cost: 9500, tpdContribution: 10, color: "#0f766e" },
  { id: "girbau-hs6028", name: "Girbau HS-6028", type: "washer", capacity: "65lb", width: 38, depth: 46, height: 58, cost: 13500, tpdContribution: 12, color: "#115e59" },
  // WASCOMAT WASHERS
  { id: "wascomat-su025", name: "Wascomat SU025", type: "washer", capacity: "25lb", width: 28, depth: 32, height: 46, cost: 5500, tpdContribution: 8, color: "#ea580c" },
  { id: "wascomat-su035", name: "Wascomat SU035", type: "washer", capacity: "35lb", width: 32, depth: 36, height: 52, cost: 7500, tpdContribution: 9, color: "#c2410c" },
  { id: "wascomat-su055", name: "Wascomat SU055", type: "washer", capacity: "55lb", width: 36, depth: 42, height: 56, cost: 10500, tpdContribution: 11, color: "#9a3412" },
  // UNIMAC WASHERS
  { id: "unimac-uw35", name: "UniMac UW35", type: "washer", capacity: "35lb", width: 30, depth: 35, height: 50, cost: 6500, tpdContribution: 9, color: "#ca8a04" },
  { id: "unimac-uw60", name: "UniMac UW60", type: "washer", capacity: "60lb", width: 36, depth: 42, height: 56, cost: 10500, tpdContribution: 11, color: "#a16207" },
  { id: "unimac-uw80", name: "UniMac UW80", type: "washer", capacity: "80lb", width: 36, depth: 42, height: 60, cost: 12500, tpdContribution: 13, color: "#854d0e" },
  // IPSO WASHERS
  { id: "ipso-hf234", name: "IPSO HF234", type: "washer", capacity: "23lb", width: 27, depth: 31, height: 45, cost: 5200, tpdContribution: 8, color: "#0284c7" },
  { id: "ipso-hf455", name: "IPSO HF455", type: "washer", capacity: "45lb", width: 32, depth: 38, height: 55, cost: 8500, tpdContribution: 10, color: "#0369a1" },
  { id: "ipso-hf665", name: "IPSO HF665", type: "washer", capacity: "65lb", width: 38, depth: 45, height: 58, cost: 12000, tpdContribution: 12, color: "#075985" },
  // HUEBSCH WASHERS
  { id: "huebsch-hf234", name: "Huebsch HF234", type: "washer", capacity: "23lb", width: 27, depth: 31, height: 45, cost: 4800, tpdContribution: 8, color: "#16a34a" },
  { id: "huebsch-hf455", name: "Huebsch HF455", type: "washer", capacity: "45lb", width: 32, depth: 38, height: 55, cost: 7800, tpdContribution: 10, color: "#15803d" },
  { id: "huebsch-hf665", name: "Huebsch HF665", type: "washer", capacity: "65lb", width: 38, depth: 45, height: 58, cost: 11000, tpdContribution: 12, color: "#166534" },
  // ADC DRYERS
  { id: "adc-ad25", name: "ADC AD-25", type: "dryer", capacity: "25lb", width: 28, depth: 38, height: 68, cost: 3800, tpdContribution: 7, color: "#f97316" },
  { id: "adc-ad50", name: "ADC AD-50", type: "dryer", capacity: "50lb", width: 34, depth: 46, height: 76, cost: 6500, tpdContribution: 10, color: "#ea580c" },
  { id: "adc-ad75", name: "ADC AD-75", type: "dryer", capacity: "75lb", width: 40, depth: 52, height: 82, cost: 9500, tpdContribution: 12, color: "#c2410c" },
  { id: "adc-ad120", name: "ADC AD-120", type: "dryer", capacity: "120lb", width: 48, depth: 58, height: 88, cost: 14000, tpdContribution: 15, color: "#9a3412" },
  // CHICAGO DRYERS
  { id: "chicago-king50", name: "Chicago King 50", type: "dryer", capacity: "50lb", width: 35, depth: 45, height: 74, cost: 8000, tpdContribution: 10, color: "#4f46e5" },
  { id: "chicago-king100", name: "Chicago King 100", type: "dryer", capacity: "100lb", width: 45, depth: 55, height: 80, cost: 15000, tpdContribution: 14, color: "#4338ca" },
  { id: "chicago-king170", name: "Chicago King 170", type: "dryer", capacity: "170lb", width: 52, depth: 62, height: 86, cost: 22000, tpdContribution: 17, color: "#3730a3" },
  // SPECIALTY EQUIPMENT
  { id: "hyosung-atm", name: "Hyosung 2700T ATM", type: "atm", capacity: "N/A", width: 16, depth: 18, height: 52, cost: 2420, tpdContribution: 0, color: "#1f2937" },
  { id: "american-changer", name: "American Changer BCX", type: "changer", capacity: "N/A", width: 18, depth: 18, height: 36, cost: 2500, tpdContribution: 0, color: "#fbbf24" },
  { id: "iclean-dogwash", name: "iClean Dog Wash", type: "dogwash", capacity: "N/A", width: 81, depth: 35, height: 73, cost: 14995, tpdContribution: 0, color: "#22c55e" },
  { id: "vending-dual", name: "Vend-Rite Dual", type: "vending", capacity: "N/A", width: 24, depth: 28, height: 72, cost: 1800, tpdContribution: 0, color: "#0ea5e9" },
  { id: "snack-vending", name: "Snack Vending", type: "vending", capacity: "N/A", width: 38, depth: 32, height: 72, cost: 3500, tpdContribution: 0, color: "#0369a1" },
  { id: "folding-table-48", name: "Folding Table 48\"", type: "table", capacity: "N/A", width: 48, depth: 30, height: 30, cost: 209, tpdContribution: 0, color: "#a8a29e" },
  { id: "folding-table-72", name: "Folding Table 72\"", type: "table", capacity: "N/A", width: 72, depth: 30, height: 30, cost: 289, tpdContribution: 0, color: "#d6d3d1" },
  { id: "laundry-cart-400", name: "Laundry Cart 400lb", type: "cart", capacity: "400lb", width: 24, depth: 36, height: 48, cost: 249, tpdContribution: 0, color: "#6b7280" },
  { id: "seating-bench", name: "Seating Bench", type: "furniture", capacity: "N/A", width: 60, depth: 18, height: 18, cost: 229, tpdContribution: 0, color: "#78716c" },
  { id: "arcade-bigbuck", name: "Big Buck Hunter", type: "arcade", capacity: "N/A", width: 30, depth: 30, height: 72, cost: 3000, tpdContribution: 0, color: "#a855f7" },
  
  // ARCHITECTURAL ELEMENTS
  { id: "door-entry-single", name: "Entry Door (Single)", type: "door", capacity: "N/A", width: 36, depth: 4, height: 84, cost: 800, tpdContribution: 0, color: "#8B4513" },
  { id: "door-entry-double", name: "Entry Door (Double)", type: "door", capacity: "N/A", width: 72, depth: 4, height: 84, cost: 1500, tpdContribution: 0, color: "#A0522D" },
  { id: "door-emergency", name: "Emergency Exit Door", type: "door", capacity: "N/A", width: 36, depth: 4, height: 84, cost: 1200, tpdContribution: 0, color: "#DC2626" },
  { id: "door-restroom", name: "Restroom Door", type: "door", capacity: "N/A", width: 32, depth: 4, height: 80, cost: 400, tpdContribution: 0, color: "#6B7280" },
  { id: "window-standard", name: "Window (4ft)", type: "window", capacity: "N/A", width: 48, depth: 4, height: 48, cost: 350, tpdContribution: 0, color: "#87CEEB" },
  { id: "window-large", name: "Window (6ft)", type: "window", capacity: "N/A", width: 72, depth: 4, height: 48, cost: 500, tpdContribution: 0, color: "#87CEEB" },
  { id: "window-storefront", name: "Storefront Window", type: "window", capacity: "N/A", width: 96, depth: 4, height: 72, cost: 1200, tpdContribution: 0, color: "#B0E0E6" },
  { id: "column-round", name: "Column (Round)", type: "column", capacity: "N/A", width: 12, depth: 12, height: 96, cost: 0, tpdContribution: 0, color: "#9CA3AF" },
  { id: "column-square", name: "Column (Square)", type: "column", capacity: "N/A", width: 18, depth: 18, height: 96, cost: 0, tpdContribution: 0, color: "#6B7280" },
  { id: "interior-wall-8", name: "Interior Wall (8ft)", type: "wall", capacity: "N/A", width: 96, depth: 6, height: 96, cost: 800, tpdContribution: 0, color: "#D1D5DB" },
  { id: "interior-wall-10", name: "Interior Wall (10ft)", type: "wall", capacity: "N/A", width: 120, depth: 6, height: 96, cost: 1000, tpdContribution: 0, color: "#D1D5DB" },
  { id: "interior-wall-12", name: "Interior Wall (12ft)", type: "wall", capacity: "N/A", width: 144, depth: 6, height: 96, cost: 1200, tpdContribution: 0, color: "#D1D5DB" },
  { id: "bulkhead-4", name: "Bulkhead (4ft)", type: "bulkhead", capacity: "N/A", width: 48, depth: 24, height: 12, cost: 200, tpdContribution: 0, color: "#E5E7EB" },
  { id: "bulkhead-6", name: "Bulkhead (6ft)", type: "bulkhead", capacity: "N/A", width: 72, depth: 24, height: 12, cost: 280, tpdContribution: 0, color: "#E5E7EB" },
  { id: "bulkhead-8", name: "Bulkhead (8ft)", type: "bulkhead", capacity: "N/A", width: 96, depth: 24, height: 12, cost: 350, tpdContribution: 0, color: "#E5E7EB" },
  
  // EXPANDED FURNITURE & FIXTURES
  { id: "folding-table-36", name: "Folding Table 36\"", type: "table", capacity: "N/A", width: 36, depth: 24, height: 30, cost: 159, tpdContribution: 0, color: "#a8a29e" },
  { id: "folding-table-96", name: "Folding Table 96\"", type: "table", capacity: "N/A", width: 96, depth: 30, height: 30, cost: 349, tpdContribution: 0, color: "#d6d3d1" },
  { id: "counter-checkout", name: "Checkout Counter", type: "counter", capacity: "N/A", width: 48, depth: 24, height: 36, cost: 800, tpdContribution: 0, color: "#78716c" },
  { id: "counter-folding-8", name: "Folding Counter (8ft)", type: "counter", capacity: "N/A", width: 96, depth: 24, height: 36, cost: 600, tpdContribution: 0, color: "#a8a29e" },
  { id: "counter-folding-12", name: "Folding Counter (12ft)", type: "counter", capacity: "N/A", width: 144, depth: 24, height: 36, cost: 850, tpdContribution: 0, color: "#a8a29e" },
  { id: "chair-plastic", name: "Plastic Chair", type: "seating", capacity: "N/A", width: 18, depth: 18, height: 32, cost: 45, tpdContribution: 0, color: "#3B82F6" },
  { id: "chair-metal", name: "Metal Chair", type: "seating", capacity: "N/A", width: 18, depth: 20, height: 33, cost: 75, tpdContribution: 0, color: "#6B7280" },
  { id: "bench-48", name: "Bench (4ft)", type: "seating", capacity: "N/A", width: 48, depth: 18, height: 18, cost: 189, tpdContribution: 0, color: "#78716c" },
  { id: "bench-72", name: "Bench (6ft)", type: "seating", capacity: "N/A", width: 72, depth: 18, height: 18, cost: 259, tpdContribution: 0, color: "#78716c" },
  { id: "waiting-area-set", name: "Waiting Area (3 Seats)", type: "seating", capacity: "N/A", width: 54, depth: 24, height: 32, cost: 450, tpdContribution: 0, color: "#6366F1" },
  { id: "tv-mount-wall", name: "Wall-Mount TV (55\")", type: "entertainment", capacity: "N/A", width: 50, depth: 4, height: 30, cost: 650, tpdContribution: 0, color: "#1F2937" },
  { id: "vending-island-2", name: "Vending Island (2-Unit)", type: "vending", capacity: "N/A", width: 76, depth: 32, height: 72, cost: 5500, tpdContribution: 0, color: "#0EA5E9" },
  { id: "vending-island-4", name: "Vending Island (4-Unit)", type: "vending", capacity: "N/A", width: 152, depth: 32, height: 72, cost: 10500, tpdContribution: 0, color: "#0284C7" },
  
  // UTILITY ROOMS & ELEMENTS
  { id: "restroom-single", name: "Restroom (Single)", type: "restroom", capacity: "N/A", width: 60, depth: 60, height: 96, cost: 5000, tpdContribution: 0, color: "#6B7280" },
  { id: "restroom-ada", name: "Restroom (ADA)", type: "restroom", capacity: "N/A", width: 84, depth: 72, height: 96, cost: 8000, tpdContribution: 0, color: "#4B5563" },
  { id: "storage-small", name: "Storage Room (6x8)", type: "storage", capacity: "N/A", width: 72, depth: 96, height: 96, cost: 1500, tpdContribution: 0, color: "#9CA3AF" },
  { id: "storage-medium", name: "Storage Room (8x10)", type: "storage", capacity: "N/A", width: 96, depth: 120, height: 96, cost: 2000, tpdContribution: 0, color: "#9CA3AF" },
  { id: "utility-closet", name: "Utility Closet", type: "utility", capacity: "N/A", width: 36, depth: 48, height: 96, cost: 800, tpdContribution: 0, color: "#6B7280" },
  { id: "water-heater-40", name: "Water Heater (40 gal)", type: "utility", capacity: "40 gal", width: 22, depth: 22, height: 60, cost: 1200, tpdContribution: 0, color: "#3B82F6" },
  { id: "water-heater-80", name: "Water Heater (80 gal)", type: "utility", capacity: "80 gal", width: 26, depth: 26, height: 62, cost: 2000, tpdContribution: 0, color: "#2563EB" },
  { id: "sink-utility", name: "Utility Sink", type: "sink", capacity: "N/A", width: 24, depth: 24, height: 36, cost: 350, tpdContribution: 0, color: "#E5E7EB" },
  { id: "sink-handwash", name: "Hand Wash Station", type: "sink", capacity: "N/A", width: 18, depth: 16, height: 32, cost: 250, tpdContribution: 0, color: "#F3F4F6" },
  { id: "electrical-panel", name: "Electrical Panel", type: "utility", capacity: "N/A", width: 24, depth: 6, height: 36, cost: 0, tpdContribution: 0, color: "#374151" },
  { id: "gas-shutoff", name: "Gas Shutoff Valve", type: "utility", capacity: "N/A", width: 8, depth: 8, height: 12, cost: 0, tpdContribution: 0, color: "#EAB308" },
  { id: "floor-drain", name: "Floor Drain", type: "utility", capacity: "N/A", width: 6, depth: 6, height: 2, cost: 150, tpdContribution: 0, color: "#4B5563" },
  
  // LAUNDRY CARTS & ACCESSORIES
  { id: "laundry-cart-200", name: "Laundry Cart 200lb", type: "cart", capacity: "200lb", width: 20, depth: 28, height: 36, cost: 149, tpdContribution: 0, color: "#6b7280" },
  { id: "laundry-cart-600", name: "Laundry Cart 600lb", type: "cart", capacity: "600lb", width: 30, depth: 42, height: 52, cost: 349, tpdContribution: 0, color: "#4b5563" },
  { id: "rolling-hamper", name: "Rolling Hamper", type: "cart", capacity: "150lb", width: 24, depth: 20, height: 32, cost: 89, tpdContribution: 0, color: "#9ca3af" },
  { id: "soap-dispenser-station", name: "Soap Dispenser Station", type: "accessory", capacity: "N/A", width: 18, depth: 12, height: 48, cost: 350, tpdContribution: 0, color: "#22C55E" },
  { id: "trash-can-large", name: "Trash Can (Large)", type: "accessory", capacity: "N/A", width: 24, depth: 24, height: 36, cost: 120, tpdContribution: 0, color: "#374151" },
  { id: "recycle-bin", name: "Recycling Bin", type: "accessory", capacity: "N/A", width: 24, depth: 24, height: 36, cost: 130, tpdContribution: 0, color: "#22C55E" },
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
  // Academy tier fields
  tierLevel: integer("tier_level"), // 1=FREE, 2=$199, 3=$399, 4=$799
  prerequisiteCourseId: varchar("prerequisite_course_id"), // Must complete before enrolling
  bundleGroupId: text("bundle_group_id"), // Group courses for bundle pricing
  isFree: boolean("is_free").default(false).notNull(), // Free course (no payment)
  autoEnroll: boolean("auto_enroll").default(false).notNull(), // Auto-enroll on signup
  certificateEnabled: boolean("certificate_enabled").default(false).notNull(), // Issue certificate on completion
  certificateTitle: text("certificate_title"), // "Certified Laundry Technician" etc.
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  totalEnrollments: true,
  averageRating: true,
  createdAt: true,
}).extend({
  price: z.string(),
  tierLevel: z.number().optional(),
  prerequisiteCourseId: z.string().optional(),
  bundleGroupId: z.string().optional(),
  isFree: z.boolean().optional(),
  autoEnroll: z.boolean().optional(),
  certificateEnabled: z.boolean().optional(),
  certificateTitle: z.string().optional(),
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

// NOTE: Comprehensive SEO/AEO tracking schema is defined earlier (after regionalPricing)
// The global seoKeywords, keywordRankings, organicTraffic, and aeoPerformance tables
// provide full international SEO tracking with SERP API integration

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

// =============================================
// MARKETPLACE LISTINGS (Equipment, Services, Businesses for Sale)
// =============================================
export const marketplaceListings = pgTable("marketplace_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Seller Information
  userId: varchar("user_id").references(() => users.id),
  sellerName: text("seller_name").notNull(),
  sellerEmail: text("seller_email").notNull(),
  sellerPhone: text("seller_phone"),
  
  // Listing Details
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Category System (Primary → Secondary → Tertiary)
  category: text("category").notNull(), // "laundromats", "equipment", "services", "other_businesses"
  subcategory: text("subcategory"), // "coin_op", "commercial", "routes", "car_wash", "restaurant", etc.
  
  // Pricing
  price: decimal("price", { precision: 12, scale: 2 }),
  priceType: text("price_type").default("fixed"), // "fixed", "negotiable", "call", "auction"
  currency: text("currency").default("USD"),
  
  // Location
  city: text("city"),
  state: text("state"),
  country: text("country").default("USA"),
  zipCode: text("zip_code"),
  
  // Equipment-specific fields
  manufacturer: text("manufacturer"),
  model: text("model"),
  yearMade: integer("year_made"),
  quantity: integer("quantity").default(1),
  condition: text("condition"), // "new", "like_new", "good", "fair", "for_parts"
  
  // Images (stored in object storage)
  images: text("images").array(), // Array of image URLs
  
  // Approval Workflow
  status: text("status").default("pending").notNull(), // "pending", "approved", "denied", "expired"
  approvalToken: text("approval_token"), // Secret token for approve/deny links
  denialReason: text("denial_reason"),
  
  // Premium Features
  featured: boolean("featured").default(false),
  listingTier: text("listing_tier").default("free"), // "free", "featured", "spotlight"
  
  // Analytics
  views: integer("views").default(0).notNull(),
  inquiries: integer("inquiries").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  expiresAt: timestamp("expires_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  approvalToken: true,
  views: true,
  inquiries: true,
  createdAt: true,
  approvedAt: true,
  updatedAt: true,
});

export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

// Marketplace Inquiries (leads from listings)
export const marketplaceInquiries = pgTable("marketplace_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => marketplaceListings.id),
  
  // Inquirer Info
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  
  // Status
  status: text("status").default("new"), // "new", "contacted", "closed"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMarketplaceInquirySchema = createInsertSchema(marketplaceInquiries).omit({
  id: true,
  createdAt: true,
});

export type InsertMarketplaceInquiry = z.infer<typeof insertMarketplaceInquirySchema>;
export type MarketplaceInquiry = typeof marketplaceInquiries.$inferSelect;

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
  
  // Premium Subscription Tiers
  subscriptionTier: text("subscription_tier").notNull().default("free"), // "free", "basic", "showcase", "diamond"
  stripeSubscriptionId: text("stripe_subscription_id"), // Stripe subscription ID for listing tier
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  mediaLimit: integer("media_limit").notNull().default(5), // free=5, basic=15, showcase=30, diamond=999
  videoLimit: integer("video_limit").notNull().default(0), // free=0, basic=2, showcase=5, diamond=20
  
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
  
  // Broker Information (for broker listings)
  brokerName: text("broker_name"), // e.g., "Lawrence Larsen"
  brokerPhone: text("broker_phone"), // e.g., "714-390-9969"
  brokerEmail: text("broker_email"), // e.g., "larry@laundromat123.com"
  brokerLicense: text("broker_license"), // e.g., "CA DRE 49460"
  brokerCompany: text("broker_company"), // e.g., "Laundromat Larry"
  
  // Premium Features
  cleanbiReportId: varchar("cleanbi_report_id"), // Link to pre-generated CLEANBI report
  hasValuationReport: boolean("has_valuation_report").default(false),
  
  // ===== MARKETPLACE FILTER FIELDS =====
  
  // Financial Metrics (for filtering)
  capRate: decimal("cap_rate", { precision: 5, scale: 2 }), // Cap rate percentage (e.g., 8.50 = 8.5%)
  annualRevenue: decimal("annual_revenue", { precision: 12, scale: 2 }), // Annual gross revenue in USD
  
  // Operations
  isAttended: boolean("is_attended").default(true), // Attended vs Unattended
  hasPickupDelivery: boolean("has_pickup_delivery").default(false), // Pickup & Delivery (PUD) service
  
  // Lease Terms
  leaseYearsRemaining: integer("lease_years_remaining"), // Years remaining on lease
  hasLeaseOptions: boolean("has_lease_options").default(false), // Extension options available
  
  // Primary Category: Retail Laundromat, Hybrid, Route/PUD, Equipment Package, Development Site
  primaryCategory: text("primary_category").default("retail_laundromat"), // "retail_laundromat", "hybrid", "route_pud", "equipment_package", "development_site"
  
  // Deal Type: Turnkey, Value-Add, Distressed, Portfolio, Franchise
  dealType: text("deal_type"), // "turnkey", "value_add", "distressed", "portfolio", "franchise"
  
  // Financing Tags (array)
  financingTags: text("financing_tags").array(), // ["sba_ready", "seller_financing", "assume_lease"]
  
  // CLEANBI Score (cached for search filtering)
  cleanbiScore: integer("cleanbi_score"), // 0-100 CLEANBI score
  cleanbiGrade: text("cleanbi_grade"), // "A", "B", "C", "Needs Work"
  
  // Square Footage (for search)
  squareFootage: integer("square_footage"),
  
  // Larry Larsen Verification
  larryVerified: boolean("larry_verified").default(false), // Verified by Larry Larsen
  larryVerifiedAt: timestamp("larry_verified_at"),
  larryVerificationNotes: text("larry_verification_notes"), // Larry's notes/recommendations
  
  // Listing Depth & Completeness (for adaptive wizard)
  detailLevel: text("detail_level").notNull().default("quick"), // "quick", "standard", "full"
  completenessScore: integer("completeness_score").default(0), // 0-100 based on fields filled
  
  // ===== PAID VISIBILITY ADD-ONS =====
  // These are activated upon Stripe payment completion
  
  // Featured Carousel (homepage rotation)
  carouselFeatured: boolean("carousel_featured").default(false),
  carouselFeaturedAt: timestamp("carousel_featured_at"),
  carouselExpiresAt: timestamp("carousel_expires_at"), // 30 days from activation
  
  // Auto-Generated SEO Blog Post
  autoBlogEnabled: boolean("auto_blog_enabled").default(false),
  autoBlogPostId: varchar("auto_blog_post_id").references(() => blogPosts.id),
  autoBlogGeneratedAt: timestamp("auto_blog_generated_at"),
  
  // Search Engine Indexing
  indexNowSubmitted: boolean("index_now_submitted").default(false),
  indexNowSubmittedAt: timestamp("index_now_submitted_at"),
  googleIndexingSubmitted: boolean("google_indexing_submitted").default(false),
  googleIndexingSubmittedAt: timestamp("google_indexing_submitted_at"),
  googleIndexingStatus: text("google_indexing_status"), // "submitted", "indexed", "failed"
  
  // Social Share Cards (Open Graph optimization)
  socialCardsGenerated: boolean("social_cards_generated").default(false),
  socialCardsGeneratedAt: timestamp("social_cards_generated_at"),
  socialCardsData: text("social_cards_data"), // JSON with OG, Twitter, and structured data
  ogImageUrl: text("og_image_url"),
  
  // Visibility Bundle Tier (what they paid for)
  visibilityPackage: text("visibility_package"), // "basic", "pro", "ultimate"
  visibilityPurchasedAt: timestamp("visibility_purchased_at"),
  visibilityStripePaymentId: text("visibility_stripe_payment_id"),
  
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

// ============================================
// LISTING ATTACHMENTS (File Uploads via Object Storage)
// Premium-grade document management for listings
// ============================================
export const listingAttachments = pgTable("listing_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  
  // File Information
  filename: text("filename").notNull(), // Original filename
  displayName: text("display_name"), // User-friendly name
  description: text("description"), // What this document contains
  
  // Storage Details (Object Storage)
  storageKey: text("storage_key").notNull(), // Object storage key/path
  storageUrl: text("storage_url").notNull(), // Public or signed URL
  mimeType: text("mime_type").notNull(), // "application/pdf", "image/jpeg", etc.
  fileSize: integer("file_size"), // Size in bytes
  
  // Document Classification
  category: text("category").notNull(), // "financial", "legal", "images", "floor_plan", "equipment", "marketing", "other"
  documentType: text("document_type"), // "profit_loss", "tax_return", "lease", "inspection", "appraisal", "floor_plan", "equipment_list", "photos"
  
  // Visibility & Access Control
  visibility: text("visibility").default("owner_only"), // "public", "buyer_preview", "nda_required", "owner_only"
  requiresNDA: boolean("requires_nda").default(false),
  
  // Verification
  verified: boolean("verified").default(false), // Admin verified authenticity
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  
  // Sorting & Display
  sortOrder: integer("sort_order").default(0),
  featured: boolean("featured").default(false), // Show in listing preview
  
  // Analytics
  downloadCount: integer("download_count").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  listingIdx: index("listing_attachments_listing_idx").on(table.listingId),
  categoryIdx: index("listing_attachments_category_idx").on(table.category),
}));

export const insertListingAttachmentSchema = createInsertSchema(listingAttachments).omit({
  id: true,
  downloadCount: true,
  viewCount: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertListingAttachment = z.infer<typeof insertListingAttachmentSchema>;
export type ListingAttachment = typeof listingAttachments.$inferSelect;

// ============================================
// ENHANCED LISTING DETAILS (Laundromat-Specific Fields)
// Extended data for premium listings with depth
// ============================================
export const listingExtendedDetails = pgTable("listing_extended_details", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id).notNull().unique(),
  
  // ===== LEASE INFORMATION =====
  leaseType: text("lease_type"), // "triple_net", "gross", "modified_gross"
  leaseMonthlyRent: decimal("lease_monthly_rent", { precision: 10, scale: 2 }),
  leaseTermRemaining: integer("lease_term_remaining"), // Months remaining
  leaseTermTotal: integer("lease_term_total"), // Total lease term in months
  leaseOptions: text("lease_options"), // "5+5", "10 year", etc.
  leaseEscalation: decimal("lease_escalation", { precision: 5, scale: 2 }), // Annual % increase
  leaseIncludes: text("lease_includes").array(), // ["water", "trash", "parking", "signage"]
  leaseNotes: text("lease_notes"),
  
  // ===== UTILITIES BREAKDOWN =====
  utilityElectricMonthly: decimal("utility_electric_monthly", { precision: 8, scale: 2 }),
  utilityGasMonthly: decimal("utility_gas_monthly", { precision: 8, scale: 2 }),
  utilityWaterMonthly: decimal("utility_water_monthly", { precision: 8, scale: 2 }),
  utilitySewerMonthly: decimal("utility_sewer_monthly", { precision: 8, scale: 2 }),
  utilityTrashMonthly: decimal("utility_trash_monthly", { precision: 8, scale: 2 }),
  utilityInternetMonthly: decimal("utility_internet_monthly", { precision: 8, scale: 2 }),
  utilitiesAsPercentOfGross: decimal("utilities_as_percent_of_gross", { precision: 5, scale: 2 }), // Key KPI
  
  // ===== FACILITY DETAILS =====
  squareFootage: integer("square_footage"),
  parkingSpaces: integer("parking_spaces"),
  hoursOfOperation: text("hours_of_operation"), // "24/7", "6am-10pm"
  yearEstablished: integer("year_established"),
  yearRenovated: integer("year_renovated"),
  attendedHours: text("attended_hours"), // "Full-time", "Part-time", "Unattended"
  
  // ===== EQUIPMENT SUMMARY =====
  totalWashers: integer("total_washers"),
  totalDryers: integer("total_dryers"),
  washerBreakdown: jsonb("washer_breakdown"), // {frontLoad: {20lb: 5, 40lb: 3}, topLoad: {25lb: 8}}
  dryerBreakdown: jsonb("dryer_breakdown"), // {stack: 10, single: 5}
  equipmentAge: text("equipment_age"), // "Mixed", "Under 5 years", "5-10 years"
  primaryBrand: text("primary_brand"), // "Dexter", "Speed Queen", "Continental"
  paymentSystem: text("payment_system"), // "Coin", "Card", "App", "Hybrid"
  
  // ===== REVENUE DETAILS =====
  averageWashPrice: decimal("average_wash_price", { precision: 6, scale: 2 }),
  averageDryPrice: decimal("average_dry_price", { precision: 6, scale: 2 }),
  turnsPerDayWasher: decimal("turns_per_day_washer", { precision: 4, scale: 2 }),
  turnsPerDayDryer: decimal("turns_per_day_dryer", { precision: 4, scale: 2 }),
  washAndFoldRevenue: decimal("wash_and_fold_revenue", { precision: 10, scale: 2 }), // Monthly
  dropOffRevenue: decimal("drop_off_revenue", { precision: 10, scale: 2 }), // Monthly
  vendingRevenue: decimal("vending_revenue", { precision: 10, scale: 2 }), // Monthly
  otherRevenue: decimal("other_revenue", { precision: 10, scale: 2 }), // Monthly
  
  // ===== LABOR DETAILS =====
  laborType: text("labor_type"), // "owner_operated", "employee", "manager", "mixed"
  laborMonthly: decimal("labor_monthly", { precision: 10, scale: 2 }),
  laborAsPercentOfGross: decimal("labor_as_percent_of_gross", { precision: 5, scale: 2 }),
  employeeCount: integer("employee_count"),
  
  // ===== PROPERTY/BUILDING =====
  buildingType: text("building_type"), // "standalone", "strip_mall", "shopping_center"
  visibilityRating: text("visibility_rating"), // "excellent", "good", "fair", "poor"
  signageType: text("signage_type"), // "monument", "pylon", "storefront", "none"
  adaCompliant: boolean("ada_compliant"),
  
  // ===== DEMOGRAPHICS (Nearby) =====
  populationRadius3Mile: integer("population_radius_3_mile"),
  medianIncomeRadius3Mile: decimal("median_income_radius_3_mile", { precision: 10, scale: 2 }),
  renterPercentageRadius3Mile: decimal("renter_percentage_radius_3_mile", { precision: 5, scale: 2 }),
  competitorCount3Mile: integer("competitor_count_3_mile"),
  
  // ===== ADDITIONAL FEATURES =====
  features: text("features").array(), // ["WiFi", "TV", "Folding Tables", "Changers", "Vending", "Restroom"]
  services: text("services").array(), // ["Drop-off", "Wash & Fold", "Pickup & Delivery", "Commercial Accounts"]
  
  // ===== SELLER MOTIVATION =====
  reasonForSelling: text("reason_for_selling"), // "Retirement", "Relocation", "Health", "Other Ventures"
  sellerFinancingTerms: text("seller_financing_terms"),
  trainingSupportOffered: text("training_support_offered"), // "2 weeks", "30 days", "Ongoing"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  listingIdx: index("listing_extended_details_listing_idx").on(table.listingId),
}));

export const insertListingExtendedDetailsSchema = createInsertSchema(listingExtendedDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertListingExtendedDetails = z.infer<typeof insertListingExtendedDetailsSchema>;
export type ListingExtendedDetails = typeof listingExtendedDetails.$inferSelect;

// ============================================
// EQUIPMENT DISTRIBUTORS (Distributor Locator)
// Searchable directory of equipment dealers by region/brand
// ============================================
export const equipmentDistributors = pgTable("equipment_distributors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Owner of this profile
  
  // ===== COMPANY INFO =====
  companyName: text("company_name").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"), // "Your trusted Dexter dealer since 1985"
  description: text("description").notNull(),
  
  // ===== CONTACT =====
  website: text("website"),
  email: text("email"),
  phone: text("phone"),
  tollFreePhone: text("toll_free_phone"),
  
  // ===== ADDRESS =====
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  country: text("country").default("US"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  
  // ===== SERVICE AREA =====
  serviceStates: text("service_states").array().notNull(), // ["TX", "LA", "OK", "AR"]
  serviceDescription: text("service_description"), // "We proudly serve the Gulf Coast region"
  nationwide: boolean("nationwide").default(false),
  
  // ===== BRANDS CARRIED =====
  brandsCarried: text("brands_carried").array().notNull(), // ["Dexter", "Speed Queen", "Continental"]
  primaryBrand: text("primary_brand"), // Their #1 brand
  isAuthorizedDealer: boolean("is_authorized_dealer").default(true),
  
  // ===== SERVICES OFFERED =====
  servicesOffered: text("services_offered").array(), // ["New Equipment Sales", "Used Equipment", "Parts", "Service", "Installation", "Financing", "Leasing"]
  specializations: text("specializations").array(), // ["Coin Laundry", "Multi-Housing", "On-Premise", "Commercial"]
  
  // ===== CREDENTIALS =====
  yearsInBusiness: integer("years_in_business"),
  certifications: text("certifications").array(), // ["Factory Trained", "EPA Certified"]
  licenses: text("licenses").array(), // State contractor licenses
  insurance: boolean("insurance").default(true),
  bondedAmount: decimal("bonded_amount", { precision: 10, scale: 2 }),
  
  // ===== MEDIA =====
  logo: text("logo"),
  coverImage: text("cover_image"),
  gallery: text("gallery").array(), // Showroom photos
  videoUrl: text("video_url"), // Company video
  
  // ===== BUSINESS HOURS =====
  businessHours: jsonb("business_hours"), // {mon: "8am-5pm", tue: "8am-5pm", ...}
  emergencyService: boolean("emergency_service").default(false),
  emergencyPhone: text("emergency_phone"),
  
  // ===== RATINGS & REVIEWS =====
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0).notNull(),
  
  // ===== PREMIUM FEATURES =====
  featured: boolean("featured").default(false),
  premiumTier: text("premium_tier").default("free"), // "free", "basic", "premium", "elite"
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // ===== STATUS =====
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verified_at"),
  status: text("status").default("active"), // "active", "pending", "suspended"
  
  // ===== ANALYTICS =====
  viewCount: integer("view_count").default(0).notNull(),
  inquiryCount: integer("inquiry_count").default(0).notNull(),
  websiteClicks: integer("website_clicks").default(0).notNull(),
  phoneClicks: integer("phone_clicks").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("equipment_distributors_slug_idx").on(table.slug),
  stateIdx: index("equipment_distributors_state_idx").on(table.state),
  featuredIdx: index("equipment_distributors_featured_idx").on(table.featured, table.status),
}));

export const insertEquipmentDistributorSchema = createInsertSchema(equipmentDistributors).omit({
  id: true,
  rating: true,
  reviewCount: true,
  viewCount: true,
  inquiryCount: true,
  websiteClicks: true,
  phoneClicks: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEquipmentDistributor = z.infer<typeof insertEquipmentDistributorSchema>;
export type EquipmentDistributor = typeof equipmentDistributors.$inferSelect;

// ============================================
// LAUNDROMAT LOCATIONS (Consumer Laundromat Finder)
// Public directory for consumers to find laundromats
// ============================================
export const laundromatLocations = pgTable("laundromat_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id), // Claimed by owner
  
  // ===== BASIC INFO =====
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  
  // ===== ADDRESS =====
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").default("US"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  
  // ===== CONTACT =====
  phone: text("phone"),
  website: text("website"),
  email: text("email"),
  
  // ===== HOURS =====
  hoursOfOperation: jsonb("hours_of_operation"), // {mon: "6am-10pm", tue: "6am-10pm", ...}
  is24Hours: boolean("is_24_hours").default(false),
  holidayHours: text("holiday_hours"),
  
  // ===== AMENITIES & FEATURES =====
  amenities: text("amenities").array(), // ["WiFi", "TV", "Folding Tables", "Changers", "Vending", "Restroom", "Parking", "AC"]
  services: text("services").array(), // ["Self-Service", "Drop-off", "Wash & Fold", "Pickup & Delivery", "Commercial"]
  paymentMethods: text("payment_methods").array(), // ["Coin", "Card", "App", "Cash"]
  
  // ===== EQUIPMENT =====
  washerCount: integer("washer_count"),
  dryerCount: integer("dryer_count"),
  equipmentBrand: text("equipment_brand"),
  hasLargeMachines: boolean("has_large_machines").default(false), // 40lb+ washers
  
  // ===== PRICING =====
  priceRangeWash: text("price_range_wash"), // "$2.50 - $6.00"
  priceRangeDry: text("price_range_dry"), // "$0.25 per 6 min"
  washAndFoldPrice: text("wash_and_fold_price"), // "$1.50/lb"
  
  // ===== MEDIA =====
  featuredImage: text("featured_image"),
  images: text("images").array(),
  
  // ===== RATINGS & REVIEWS =====
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0).notNull(),
  cleanlinessRating: decimal("cleanliness_rating", { precision: 3, scale: 2 }),
  equipmentRating: decimal("equipment_rating", { precision: 3, scale: 2 }),
  valueRating: decimal("value_rating", { precision: 3, scale: 2 }),
  staffRating: decimal("staff_rating", { precision: 3, scale: 2 }),
  
  // ===== OWNERSHIP =====
  claimed: boolean("claimed").default(false), // Owner has claimed this listing
  claimedAt: timestamp("claimed_at"),
  
  // ===== STATUS =====
  verified: boolean("verified").default(false),
  status: text("status").default("active"), // "active", "temporarily_closed", "permanently_closed", "pending"
  
  // ===== PREMIUM FEATURES =====
  featured: boolean("featured").default(false),
  premiumTier: text("premium_tier").default("free"), // "free", "claimed", "premium"
  
  // ===== SOURCE =====
  source: text("source"), // "manual", "google_places", "yelp", "owner_submitted"
  externalId: text("external_id"), // Google Places ID, etc.
  
  // ===== ANALYTICS =====
  viewCount: integer("view_count").default(0).notNull(),
  directionsClicks: integer("directions_clicks").default(0).notNull(),
  phoneClicks: integer("phone_clicks").default(0).notNull(),
  websiteClicks: integer("website_clicks").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("laundromat_locations_slug_idx").on(table.slug),
  cityStateIdx: index("laundromat_locations_city_state_idx").on(table.city, table.state),
  latLngIdx: index("laundromat_locations_lat_lng_idx").on(table.latitude, table.longitude),
  featuredIdx: index("laundromat_locations_featured_idx").on(table.featured, table.status),
}));

export const insertLaundromatLocationSchema = createInsertSchema(laundromatLocations).omit({
  id: true,
  rating: true,
  reviewCount: true,
  cleanlinessRating: true,
  equipmentRating: true,
  valueRating: true,
  staffRating: true,
  claimedAt: true,
  viewCount: true,
  directionsClicks: true,
  phoneClicks: true,
  websiteClicks: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLaundromatLocation = z.infer<typeof insertLaundromatLocationSchema>;
export type LaundromatLocation = typeof laundromatLocations.$inferSelect;

// Laundromat Location Reviews (from consumers)
export const laundromatReviews = pgTable("laundromat_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").references(() => laundromatLocations.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  
  // Guest info (if not logged in)
  guestName: text("guest_name"),
  guestEmail: text("guest_email"),
  
  // Ratings (1-5)
  overallRating: integer("overall_rating").notNull(),
  cleanlinessRating: integer("cleanliness_rating"),
  equipmentRating: integer("equipment_rating"),
  valueRating: integer("value_rating"),
  staffRating: integer("staff_rating"),
  
  // Review Content
  title: text("title"),
  content: text("content").notNull(),
  
  // Photos
  photos: text("photos").array(),
  
  // Verification
  verified: boolean("verified").default(false),
  visitDate: timestamp("visit_date"),
  
  // Engagement
  helpfulCount: integer("helpful_count").default(0).notNull(),
  
  // Owner Response
  ownerResponse: text("owner_response"),
  ownerRespondedAt: timestamp("owner_responded_at"),
  
  // Status
  status: text("status").default("published"), // "published", "pending", "flagged", "removed"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  locationIdx: index("laundromat_reviews_location_idx").on(table.locationId),
  userIdx: index("laundromat_reviews_user_idx").on(table.userId),
}));

export const insertLaundromatReviewSchema = createInsertSchema(laundromatReviews).omit({
  id: true,
  helpfulCount: true,
  ownerRespondedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLaundromatReview = z.infer<typeof insertLaundromatReviewSchema>;
export type LaundromatReview = typeof laundromatReviews.$inferSelect;

// ============================================
// PROMOTIONS & SEASONAL CAMPAIGNS
// December FREE listings and other promotions
// ============================================
export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Promotion Details
  name: text("name").notNull(), // "December FREE Listings"
  slug: text("slug").notNull().unique(), // "december-2024-free"
  description: text("description"),
  
  // Discount Settings
  discountType: text("discount_type").notNull(), // "percentage", "fixed", "free"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }), // 100 for 100% off
  
  // Applies To
  appliesToListingTiers: text("applies_to_listing_tiers").array(), // ["basic", "showcase", "diamond"]
  appliesToCategories: text("applies_to_categories").array(), // ["laundromats", "equipment", "vendors"]
  
  // Date Range
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Limits
  maxRedemptions: integer("max_redemptions"), // null = unlimited
  currentRedemptions: integer("current_redemptions").default(0).notNull(),
  perUserLimit: integer("per_user_limit").default(1),
  
  // Promo Code (optional)
  promoCode: text("promo_code"), // "DECEMBER2024"
  requiresCode: boolean("requires_code").default(false),
  
  // Display
  bannerText: text("banner_text"), // "All listings FREE in December!"
  bannerColor: text("banner_color").default("#C8A661"), // Gold
  showOnPricing: boolean("show_on_pricing").default(true),
  showOnListingForm: boolean("show_on_listing_form").default(true),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("promotions_slug_idx").on(table.slug),
  activeIdx: index("promotions_active_idx").on(table.active, table.startDate, table.endDate),
}));

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  currentRedemptions: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

// ============================================
// LISTING VISIBILITY ADD-ONS & ORDERS
// Paid visibility features to increase listing exposure
// ============================================

export const visibilityAddOns = pgTable("visibility_add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Product Info
  name: text("name").notNull(), // "Featured Carousel", "Auto SEO Blog", etc.
  slug: text("slug").notNull().unique(), // "carousel", "auto-blog", "index-now", "google-indexing", "social-cards"
  description: text("description"),
  
  // Pricing
  priceUSD: decimal("price_usd", { precision: 10, scale: 2 }).notNull(),
  stripePriceId: text("stripe_price_id"), // Stripe Price ID
  stripeProductId: text("stripe_product_id"), // Stripe Product ID
  
  // Duration
  durationDays: integer("duration_days").default(30), // How long the add-on lasts
  isOneTime: boolean("is_one_time").default(true), // One-time or subscription
  
  // Feature flags
  includesCarousel: boolean("includes_carousel").default(false),
  includesAutoBlog: boolean("includes_auto_blog").default(false),
  includesIndexNow: boolean("includes_index_now").default(false),
  includesGoogleIndexing: boolean("includes_google_indexing").default(false),
  includesSocialCards: boolean("includes_social_cards").default(false),
  visibilityBoostLevel: integer("visibility_boost_level").default(0), // 0-5
  
  // Status
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVisibilityAddOnSchema = createInsertSchema(visibilityAddOns).omit({
  id: true,
  createdAt: true,
});

export type InsertVisibilityAddOn = z.infer<typeof insertVisibilityAddOnSchema>;
export type VisibilityAddOn = typeof visibilityAddOns.$inferSelect;

// Visibility Orders (purchase records)
export const visibilityOrders = pgTable("visibility_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Relationships
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  addOnId: varchar("add_on_id").references(() => visibilityAddOns.id).notNull(),
  
  // Stripe
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  
  // Pricing
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  
  // Status
  status: text("status").notNull().default("pending"), // "pending", "paid", "fulfilled", "failed", "refunded"
  
  // Fulfillment tracking
  fulfilledAt: timestamp("fulfilled_at"),
  fulfillmentDetails: jsonb("fulfillment_details"), // { carouselEnabled: true, blogPostId: "...", etc. }
  
  // Duration
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  listingIdx: index("visibility_orders_listing_idx").on(table.listingId),
  userIdx: index("visibility_orders_user_idx").on(table.userId),
  statusIdx: index("visibility_orders_status_idx").on(table.status),
}));

export const insertVisibilityOrderSchema = createInsertSchema(visibilityOrders).omit({
  id: true,
  fulfilledAt: true,
  createdAt: true,
});

export type InsertVisibilityOrder = z.infer<typeof insertVisibilityOrderSchema>;
export type VisibilityOrder = typeof visibilityOrders.$inferSelect;

// Visibility automation jobs (for async processing)
export const visibilityJobs = pgTable("visibility_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  orderId: varchar("order_id").references(() => visibilityOrders.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  
  // Job type
  jobType: text("job_type").notNull(), // "carousel", "auto-blog", "index-now", "google-indexing", "social-cards"
  
  // Status
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  
  // Results
  result: jsonb("result"),
  error: text("error"),
  
  // Timing
  scheduledAt: timestamp("scheduled_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("visibility_jobs_order_idx").on(table.orderId),
  statusIdx: index("visibility_jobs_status_idx").on(table.status),
}));

export const insertVisibilityJobSchema = createInsertSchema(visibilityJobs).omit({
  id: true,
  attempts: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
});

export type InsertVisibilityJob = z.infer<typeof insertVisibilityJobSchema>;
export type VisibilityJob = typeof visibilityJobs.$inferSelect;

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
  profileImageUrl: text("profile_image_url"),
  nickname: text("nickname"), // e.g. "Laundromat Larry"
  
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
  
  // Storefront Settings
  slug: varchar("slug", { length: 100 }).unique(), // URL-friendly identifier like "laundromat-larry"
  storefrontEnabled: boolean("storefront_enabled").default(false),
  storefrontBanner: text("storefront_banner"), // Banner image URL
  storefrontTheme: jsonb("storefront_theme"), // Theme customization options
  
  // Testimonials (stored as JSON array for simplicity)
  testimonials: jsonb("testimonials"), // [{name, role, text, rating}]
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index("broker_profiles_user_idx").on(table.userId),
    slugIdx: uniqueIndex("broker_profiles_slug_idx").on(table.slug),
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
// BUYER ENGAGEMENT SYSTEM - Saved Searches, Favorites, Messaging, Due Diligence
// ============================================================================

// Saved Searches with Email Alerts
export const savedSearches = pgTable("saved_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Search Criteria
  name: text("name").notNull(), // "Philadelphia Laundromats under $500K"
  filters: jsonb("filters").notNull(), // { businessType, priceMin, priceMax, country, region, city, etc }
  
  // Alert Settings
  alertFrequency: text("alert_frequency").notNull().default("daily"), // "instant", "daily", "weekly", "never"
  isActive: boolean("is_active").notNull().default(true),
  lastNotifiedAt: timestamp("last_notified_at"),
  lastMatchCount: integer("last_match_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("saved_searches_user_idx").on(table.userId),
  activeAlertIdx: index("saved_searches_active_alert_idx").on(table.isActive, table.alertFrequency),
}));

export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({
  id: true,
  lastNotifiedAt: true,
  lastMatchCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;

// Saved Search Alert History (prevent duplicate notifications)
export const savedSearchAlerts = pgTable("saved_search_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  savedSearchId: varchar("saved_search_id").references(() => savedSearches.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  
  sentAt: timestamp("sent_at").defaultNow().notNull(),
}, (table) => ({
  searchListingIdx: uniqueIndex("saved_search_alerts_search_listing_idx").on(table.savedSearchId, table.listingId),
}));

export const insertSavedSearchAlertSchema = createInsertSchema(savedSearchAlerts).omit({
  id: true,
  sentAt: true,
});

export type InsertSavedSearchAlert = z.infer<typeof insertSavedSearchAlertSchema>;
export type SavedSearchAlert = typeof savedSearchAlerts.$inferSelect;

// Favorite Listings (Buyer Watchlist)
export const favoriteListings = pgTable("favorite_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  
  // Notes
  notes: text("notes"), // Private buyer notes about this listing
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userListingIdx: uniqueIndex("favorite_listings_user_listing_idx").on(table.userId, table.listingId),
  userIdx: index("favorite_listings_user_idx").on(table.userId),
}));

export const insertFavoriteListingSchema = createInsertSchema(favoriteListings).omit({
  id: true,
  createdAt: true,
});

export type InsertFavoriteListing = z.infer<typeof insertFavoriteListingSchema>;
export type FavoriteListing = typeof favoriteListings.$inferSelect;

// Buyer-Seller Message Threads
export const buyerMessageThreads = pgTable("buyer_message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  
  // Thread Status
  status: text("status").notNull().default("active"), // "active", "archived", "closed"
  subject: text("subject"), // Optional subject line
  
  // Read Status
  buyerUnreadCount: integer("buyer_unread_count").default(0).notNull(),
  sellerUnreadCount: integer("seller_unread_count").default(0).notNull(),
  
  // Last Activity
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"), // First 100 chars of last message
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  listingIdx: index("buyer_message_threads_listing_idx").on(table.listingId),
  buyerIdx: index("buyer_message_threads_buyer_idx").on(table.buyerId),
  sellerIdx: index("buyer_message_threads_seller_idx").on(table.sellerId),
  uniqueThreadIdx: uniqueIndex("buyer_message_threads_unique_idx").on(table.listingId, table.buyerId),
}));

export const insertBuyerMessageThreadSchema = createInsertSchema(buyerMessageThreads).omit({
  id: true,
  buyerUnreadCount: true,
  sellerUnreadCount: true,
  lastMessageAt: true,
  lastMessagePreview: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBuyerMessageThread = z.infer<typeof insertBuyerMessageThreadSchema>;
export type BuyerMessageThread = typeof buyerMessageThreads.$inferSelect;

// Individual Messages in Threads
export const buyerMessages = pgTable("buyer_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").references(() => buyerMessageThreads.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  
  // Message Content
  body: text("body").notNull(),
  attachments: jsonb("attachments"), // [{ name, url, type, size }]
  
  // Read Status
  readAt: timestamp("read_at"),
  
  // Metadata
  isSystemMessage: boolean("is_system_message").default(false), // For automated messages
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  threadIdx: index("buyer_messages_thread_idx").on(table.threadId),
  senderIdx: index("buyer_messages_sender_idx").on(table.senderId),
}));

export const insertBuyerMessageSchema = createInsertSchema(buyerMessages).omit({
  id: true,
  readAt: true,
  createdAt: true,
});

export type InsertBuyerMessage = z.infer<typeof insertBuyerMessageSchema>;
export type BuyerMessage = typeof buyerMessages.$inferSelect;

// Due Diligence Tasks (Checklist for NDA-approved buyers)
export const dueDiligenceTasks = pgTable("due_diligence_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ndaRequestId: varchar("nda_request_id").references(() => ndaRequests.id).notNull(),
  
  // Task Details
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "financial", "legal", "operational", "physical", "market"
  sortOrder: integer("sort_order").default(0),
  
  // Status
  status: text("status").notNull().default("pending"), // "pending", "in_progress", "completed", "na"
  completedAt: timestamp("completed_at"),
  
  // Notes & Documents
  notes: text("notes"),
  documents: jsonb("documents"), // [{ name, url, uploadedAt }]
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  ndaIdx: index("due_diligence_tasks_nda_idx").on(table.ndaRequestId),
}));

export const insertDueDiligenceTaskSchema = createInsertSchema(dueDiligenceTasks).omit({
  id: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDueDiligenceTask = z.infer<typeof insertDueDiligenceTaskSchema>;
export type DueDiligenceTask = typeof dueDiligenceTasks.$inferSelect;

// Listing Comparisons (Side-by-side comparison sets)
export const listingComparisons = pgTable("listing_comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Comparison Set
  name: text("name"), // Optional name like "Top 3 Philly Options"
  listingIds: text("listing_ids").array().notNull(), // Array of listing IDs (max 4)
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("listing_comparisons_user_idx").on(table.userId),
}));

export const insertListingComparisonSchema = createInsertSchema(listingComparisons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertListingComparison = z.infer<typeof insertListingComparisonSchema>;
export type ListingComparison = typeof listingComparisons.$inferSelect;

// Buyer Listing History (Track viewed listings)
export const buyerListingHistory = pgTable("buyer_listing_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  listingId: varchar("listing_id").references(() => listings.id).notNull(),
  
  // View History
  viewCount: integer("view_count").default(1).notNull(),
  firstViewedAt: timestamp("first_viewed_at").defaultNow().notNull(),
  lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
  
  // Engagement
  totalTimeSpent: integer("total_time_spent").default(0), // seconds
}, (table) => ({
  userListingIdx: uniqueIndex("buyer_listing_history_user_listing_idx").on(table.userId, table.listingId),
  userIdx: index("buyer_listing_history_user_idx").on(table.userId),
  lastViewedIdx: index("buyer_listing_history_last_viewed_idx").on(table.userId, table.lastViewedAt),
}));

export const insertBuyerListingHistorySchema = createInsertSchema(buyerListingHistory).omit({
  id: true,
  viewCount: true,
  firstViewedAt: true,
  lastViewedAt: true,
  totalTimeSpent: true,
});

export type InsertBuyerListingHistory = z.infer<typeof insertBuyerListingHistorySchema>;
export type BuyerListingHistory = typeof buyerListingHistory.$inferSelect;

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
// USER SAVED ITEMS - Calculators, Reports, Templates, Configurations
// ============================================================================

// Saved Calculator Configurations (User's saved calculator inputs/results)
export const savedCalculators = pgTable("saved_calculators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Calculator Reference
  calculatorType: text("calculator_type").notNull(), // "valuation", "roi", "cash_flow", "loan", "expense", "break_even", etc.
  name: text("name").notNull(), // User-defined name for this saved calculation
  description: text("description"),
  
  // Saved Configuration
  inputs: jsonb("inputs").notNull(), // All input values user entered
  results: jsonb("results"), // Calculated results for quick display
  
  // Associated Address/Business (optional)
  address: text("address"),
  businessName: text("business_name"),
  
  // Sharing
  isPublic: boolean("is_public").notNull().default(false),
  shareSlug: text("share_slug").unique(),
  
  // Metadata
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("saved_calculators_user_idx").on(table.userId),
  typeIdx: index("saved_calculators_type_idx").on(table.calculatorType),
  shareIdx: index("saved_calculators_share_idx").on(table.shareSlug),
}));

export const insertSavedCalculatorSchema = createInsertSchema(savedCalculators).omit({
  id: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSavedCalculator = z.infer<typeof insertSavedCalculatorSchema>;
export type SavedCalculator = typeof savedCalculators.$inferSelect;

// User Purchased Reports (Track purchased single-analysis reports)
export const userPurchasedReports = pgTable("user_purchased_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Report Details
  reportType: text("report_type").notNull(), // "demographic", "competition", "cleanbi_valuation", "complete_bundle"
  address: text("address").notNull(),
  
  // Status & Delivery
  status: text("status").notNull().default("processing"), // "processing", "completed", "failed"
  pdfUrl: text("pdf_url"),
  googleSheetsUrl: text("google_sheets_url"),
  googleSlidesUrl: text("google_slides_url"),
  
  // Payment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentId: text("stripe_payment_id"),
  
  // Metadata
  expiresAt: timestamp("expires_at"), // Optional expiration for time-limited access
  downloadCount: integer("download_count").default(0).notNull(),
  lastDownloadedAt: timestamp("last_downloaded_at"),
  
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_purchased_reports_user_idx").on(table.userId),
  statusIdx: index("user_purchased_reports_status_idx").on(table.status),
}));

export const insertUserPurchasedReportSchema = createInsertSchema(userPurchasedReports).omit({
  id: true,
  downloadCount: true,
  lastDownloadedAt: true,
  purchasedAt: true,
});

export type InsertUserPurchasedReport = z.infer<typeof insertUserPurchasedReportSchema>;
export type UserPurchasedReport = typeof userPurchasedReports.$inferSelect;

// User Activity Feed (Social network-style activity tracking)
export const userActivityFeed = pgTable("user_activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Activity Type
  activityType: text("activity_type").notNull(), // "saved_search", "favorite_listing", "purchased_report", "saved_calculator", "message_sent", "listing_created", "profile_updated"
  
  // Referenced Entity
  entityType: text("entity_type"), // "listing", "report", "calculator", "search", "message", "broker"
  entityId: varchar("entity_id"),
  
  // Activity Details
  title: text("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional context
  
  // Visibility
  isPublic: boolean("is_public").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_activity_feed_user_idx").on(table.userId),
  createdAtIdx: index("user_activity_feed_created_idx").on(table.createdAt),
  publicIdx: index("user_activity_feed_public_idx").on(table.isPublic),
}));

export const insertUserActivityFeedSchema = createInsertSchema(userActivityFeed).omit({
  id: true,
  createdAt: true,
});

export type InsertUserActivityFeed = z.infer<typeof insertUserActivityFeedSchema>;
export type UserActivityFeed = typeof userActivityFeed.$inferSelect;

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
  
  // Media (images and videos)
  images: text("images").array(), // Array of image URLs
  videos: text("videos").array(), // Array of video URLs (YouTube, Vimeo, or direct)
  featuredImage: text("featured_image"), // Main image for SEO/previews
  
  // SEO Fields
  seoTitle: text("seo_title"), // Custom title for search engines
  seoDescription: text("seo_description"), // Meta description
  seoKeywords: text("seo_keywords").array(), // Target keywords
  canonicalUrl: text("canonical_url"), // Canonical URL if needed
  
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
  
  // Media (images and videos)
  images: text("images").array(), // Array of image URLs
  videos: text("videos").array(), // Array of video URLs
  
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

// ==================== PREMIUM COMMUNITY FEATURES ====================

// User Preferences - Notifications, Privacy, Display Settings
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  
  // Notification Settings
  emailNotifications: boolean("email_notifications").default(true),
  emailDigest: text("email_digest").default("daily"), // "none", "daily", "weekly"
  notifyOnReply: boolean("notify_on_reply").default(true),
  notifyOnMention: boolean("notify_on_mention").default(true),
  notifyOnFollow: boolean("notify_on_follow").default(true),
  notifyOnReaction: boolean("notify_on_reaction").default(false),
  notifyOnNewTopic: boolean("notify_on_new_topic").default(false), // In followed categories
  
  // Privacy Settings
  showEmail: boolean("show_email").default(false),
  showPhone: boolean("show_phone").default(false),
  showActivity: boolean("show_activity").default(true),
  showOnlineStatus: boolean("show_online_status").default(true),
  allowDirectMessages: boolean("allow_direct_messages").default(true),
  profileVisibility: text("profile_visibility").default("public"), // "public", "members", "private"
  
  // Display Settings
  theme: text("theme").default("system"), // "light", "dark", "system"
  fontSize: text("font_size").default("medium"), // "small", "medium", "large"
  compactMode: boolean("compact_mode").default(false),
  showAvatars: boolean("show_avatars").default(true),
  animationsEnabled: boolean("animations_enabled").default(true),
  
  // Content Settings
  defaultSortOrder: text("default_sort_order").default("recent"), // "recent", "popular", "trending"
  postsPerPage: integer("posts_per_page").default(20),
  autoPlayGifs: boolean("auto_play_gifs").default(true),
  autoPlayVideos: boolean("auto_play_videos").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Forum Reactions - Emoji reactions beyond upvote/downvote
export const forumReactions = pgTable("forum_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  entityType: text("entity_type").notNull(), // "topic" or "reply"
  entityId: varchar("entity_id").notNull(),
  reactionType: text("reaction_type").notNull(), // "like", "love", "helpful", "insightful", "fire", "clap", "thinking"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userEntityReactionIdx: uniqueIndex("forum_reactions_user_entity_type_idx").on(table.userId, table.entityType, table.entityId, table.reactionType),
  entityIdx: index("forum_reactions_entity_idx").on(table.entityType, table.entityId),
}));

export const insertForumReactionSchema = createInsertSchema(forumReactions).omit({
  id: true,
  createdAt: true,
});

export type InsertForumReaction = z.infer<typeof insertForumReactionSchema>;
export type ForumReaction = typeof forumReactions.$inferSelect;

// Forum Bookmarks - Save topics and replies
export const forumBookmarks = pgTable("forum_bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  entityType: text("entity_type").notNull(), // "topic" or "reply"
  entityId: varchar("entity_id").notNull(),
  note: text("note"), // Optional personal note
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userEntityIdx: uniqueIndex("forum_bookmarks_user_entity_idx").on(table.userId, table.entityType, table.entityId),
  userIdx: index("forum_bookmarks_user_idx").on(table.userId),
}));

export const insertForumBookmarkSchema = createInsertSchema(forumBookmarks).omit({
  id: true,
  createdAt: true,
});

export type InsertForumBookmark = z.infer<typeof insertForumBookmarkSchema>;
export type ForumBookmark = typeof forumBookmarks.$inferSelect;

// Forum Follows - Follow topics, categories, or users
export const forumFollows = pgTable("forum_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  entityType: text("entity_type").notNull(), // "topic", "category", or "user"
  entityId: varchar("entity_id").notNull(),
  notifyOnActivity: boolean("notify_on_activity").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userEntityIdx: uniqueIndex("forum_follows_user_entity_idx").on(table.userId, table.entityType, table.entityId),
  userIdx: index("forum_follows_user_idx").on(table.userId),
  entityIdx: index("forum_follows_entity_idx").on(table.entityType, table.entityId),
}));

export const insertForumFollowSchema = createInsertSchema(forumFollows).omit({
  id: true,
  createdAt: true,
});

export type InsertForumFollow = z.infer<typeof insertForumFollowSchema>;
export type ForumFollow = typeof forumFollows.$inferSelect;

// User Badges & Achievements
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeType: text("badge_type").notNull(), // "verified_owner", "expert", "top_contributor", "founding_member", "helpful", "premium"
  badgeName: text("badge_name").notNull(),
  badgeDescription: text("badge_description"),
  badgeIcon: text("badge_icon"), // Icon name or emoji
  badgeColor: text("badge_color"), // Hex color for display
  
  // For progress-based badges
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress"),
  
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Some badges may expire
}, (table) => ({
  userIdx: index("user_badges_user_idx").on(table.userId),
  typeIdx: index("user_badges_type_idx").on(table.badgeType),
}));

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  awardedAt: true,
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// User Mentions in forum content
export const forumMentions = pgTable("forum_mentions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentionedUserId: varchar("mentioned_user_id").references(() => users.id).notNull(),
  mentionedByUserId: varchar("mentioned_by_user_id").references(() => users.id).notNull(),
  entityType: text("entity_type").notNull(), // "topic" or "reply"
  entityId: varchar("entity_id").notNull(),
  isRead: boolean("is_read").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  mentionedUserIdx: index("forum_mentions_mentioned_user_idx").on(table.mentionedUserId),
  entityIdx: index("forum_mentions_entity_idx").on(table.entityType, table.entityId),
}));

export const insertForumMentionSchema = createInsertSchema(forumMentions).omit({
  id: true,
  createdAt: true,
});

export type InsertForumMention = z.infer<typeof insertForumMentionSchema>;
export type ForumMention = typeof forumMentions.$inferSelect;

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
  
  // SEO (Yoast-style comprehensive fields)
  seoMode: text("seo_mode").default("auto"), // "auto", "manual", "hybrid"
  metaTitle: text("meta_title"), // Max 60 chars
  metaDescription: text("meta_description"), // Max 160 chars
  metaKeywords: jsonb("meta_keywords"),
  canonicalUrl: text("canonical_url"),
  
  // Open Graph Tags
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"), // URL to image (min 1200x630)
  ogType: text("og_type").default("website"), // website, article, product
  
  // Twitter Card Tags
  twitterCard: text("twitter_card").default("summary_large_image"), // summary, summary_large_image, player
  twitterTitle: text("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image"),
  
  // AI-Generated Tracking
  lastAIGenerated: timestamp("last_ai_generated"),
  manualOverrides: jsonb("manual_overrides"), // Track which fields user manually edited
  
  // SEO Score (0-100)
  seoScore: integer("seo_score").default(0),
  seoIssues: jsonb("seo_issues"), // Array of issues from analyzeSEO
  
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
  
  // Version Control
  version: integer("version").default(1).notNull(), // Current version number
  publishHistory: jsonb("publish_history").default(sql`'[]'::jsonb`), // Array of {version, pages, theme, publishedAt, publishedBy}
  
  // Status
  status: text("status").default("draft").notNull(), // draft, published, archived
  publishedAt: timestamp("published_at"),
  
  // Domain Management
  domainStatus: text("domain_status").default("none"), // none, pending, verified, active
  sslStatus: text("ssl_status").default("none"), // none, pending, active, failed
  dnsRecords: jsonb("dns_records"), // Required DNS records for verification
  domainVerifiedAt: timestamp("domain_verified_at"),
  
  // Stats
  pageviews: integer("pageviews").default(0).notNull(),
  lastVisitedAt: timestamp("last_visited_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerWebsiteSchema = createInsertSchema(customerWebsites).omit({
  id: true,
  version: true,
  publishHistory: true,
  domainStatus: true,
  sslStatus: true,
  dnsRecords: true,
  domainVerifiedAt: true,
  pageviews: true,
  lastVisitedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerWebsite = z.infer<typeof insertCustomerWebsiteSchema>;
export type CustomerWebsite = typeof customerWebsites.$inferSelect;

// Website Assets (CDN Asset Management)
export const websiteAssets = pgTable("website_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").references(() => customerWebsites.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Asset Info
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // image/png, image/jpeg, etc.
  fileSize: integer("file_size").notNull(), // bytes
  
  // Storage
  storagePath: text("storage_path").notNull(), // Object storage path
  publicUrl: text("public_url").notNull(), // CDN URL
  
  // Metadata
  category: text("category").default("image"), // image, logo, favicon, video
  width: integer("width"),
  height: integer("height"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  websiteIdx: index("website_assets_website_idx").on(table.websiteId),
  userIdx: index("website_assets_user_idx").on(table.userId),
}));

export const insertWebsiteAssetSchema = createInsertSchema(websiteAssets).omit({
  id: true,
  createdAt: true,
});

export type InsertWebsiteAsset = z.infer<typeof insertWebsiteAssetSchema>;
export type WebsiteAsset = typeof websiteAssets.$inferSelect;

// Custom Domains for Website Builder (Cloudflare for SaaS)
export const customDomains = pgTable("custom_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => siteProjects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Domain info
  domain: text("domain").unique().notNull(), // e.g., mylaundry.com
  
  // Cloudflare integration
  cloudflareHostnameId: text("cloudflare_hostname_id"), // Cloudflare custom hostname ID
  
  // Status
  status: text("status").default("pending").notNull(), // pending, verifying, verified, active, failed
  sslStatus: text("ssl_status").default("pending"), // pending, initializing, active, failed
  
  // Verification
  verificationMethod: text("verification_method").default("txt"), // txt, http, cname
  verificationRecord: jsonb("verification_record"), // {type: "TXT", name: "_cf-custom-hostname", value: "..."}
  verificationError: text("verification_error"),
  
  // Timestamps
  lastVerificationCheck: timestamp("last_verification_check"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("custom_domains_project_idx").on(table.projectId),
  userIdx: index("custom_domains_user_idx").on(table.userId),
  domainIdx: uniqueIndex("custom_domains_domain_idx").on(table.domain),
}));

export const insertCustomDomainSchema = createInsertSchema(customDomains).omit({
  id: true,
  cloudflareHostnameId: true,
  sslStatus: true,
  verificationRecord: true,
  verificationError: true,
  lastVerificationCheck: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomDomain = z.infer<typeof insertCustomDomainSchema>;
export type CustomDomain = typeof customDomains.$inferSelect;

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

// POS Shifts - Cash drawer and shift management
export const posShifts = pgTable("pos_shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Shift Timing
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  
  // Cash Drawer
  openingCash: decimal("opening_cash", { precision: 10, scale: 2 }).notNull(),
  closingCash: decimal("closing_cash", { precision: 10, scale: 2 }),
  expectedCash: decimal("expected_cash", { precision: 10, scale: 2 }),
  variance: decimal("variance", { precision: 10, scale: 2 }),
  
  // Shift Totals
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0.00"),
  totalCashSales: decimal("total_cash_sales", { precision: 10, scale: 2 }).default("0.00"),
  totalCardSales: decimal("total_card_sales", { precision: 10, scale: 2 }).default("0.00"),
  totalAccountSales: decimal("total_account_sales", { precision: 10, scale: 2 }).default("0.00"),
  transactionCount: integer("transaction_count").default(0),
  
  // Cash Breakdown at close
  cashBreakdown: jsonb("cash_breakdown"), // { hundreds: 0, fifties: 0, twenties: 5, tens: 3, fives: 2, ones: 10, quarters: 20, ... }
  
  // Notes
  notes: text("notes"),
  
  // Status
  status: text("status").notNull().default("open"), // "open", "closed", "reconciled"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("pos_shifts_laundromat_idx").on(table.laundromatId),
  userIdx: index("pos_shifts_user_idx").on(table.userId),
  statusIdx: index("pos_shifts_status_idx").on(table.status),
  startTimeIdx: index("pos_shifts_start_time_idx").on(table.startTime),
}));

export const insertPosShiftSchema = createInsertSchema(posShifts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPosShift = z.infer<typeof insertPosShiftSchema>;
export type PosShift = typeof posShifts.$inferSelect;

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
  serviceType: text("service_type").notNull(), // "wash_dry_fold", "pickup_delivery", "commercial_contract", "subscription"
  frequency: text("frequency"), // "daily", "weekly", "biweekly", "monthly"
  
  // WDF Pricing Fields
  totalWeight: decimal("total_weight", { precision: 10, scale: 2 }),
  pricePerPound: decimal("price_per_pound", { precision: 10, scale: 2 }),
  serviceTier: text("service_tier").default("standard"), // "standard", "express", "same_day", "premium"
  rushFee: decimal("rush_fee", { precision: 10, scale: 2 }),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
  addOnsTotal: decimal("add_ons_total", { precision: 10, scale: 2 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  
  // Pricing
  recurringAmount: decimal("recurring_amount", { precision: 10, scale: 2 }),
  
  // Weight Confirmation
  dropOffWeight: decimal("drop_off_weight", { precision: 10, scale: 2 }),
  pickupWeight: decimal("pickup_weight", { precision: 10, scale: 2 }),
  weightConfirmedAt: timestamp("weight_confirmed_at"),
  weightConfirmedBy: varchar("weight_confirmed_by"),
  
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

// WDF Pricing Tiers - Tiered per-pound pricing with weight breaks
export const wdfPricingTiers = pgTable("wdf_pricing_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Tier Configuration
  tierName: text("tier_name").notNull(), // "Standard", "Bulk", "Commercial"
  minWeight: decimal("min_weight", { precision: 10, scale: 2 }).notNull(), // e.g., 0, 10, 25
  maxWeight: decimal("max_weight", { precision: 10, scale: 2 }), // null = unlimited
  pricePerPound: decimal("price_per_pound", { precision: 10, scale: 2 }).notNull(),
  
  // Service Type
  serviceType: text("service_type").notNull().default("regular"), // "regular", "same_day", "express", "premium"
  serviceMultiplier: decimal("service_multiplier", { precision: 10, scale: 2 }).default("1.00"), // 1.0 = no change, 1.5 = 50% more
  
  // Display
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("wdf_pricing_tiers_laundromat_idx").on(table.laundromatId),
  serviceTypeIdx: index("wdf_pricing_tiers_service_type_idx").on(table.serviceType),
  activeIdx: index("wdf_pricing_tiers_active_idx").on(table.isActive),
}));

export const insertWdfPricingTierSchema = createInsertSchema(wdfPricingTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWdfPricingTier = z.infer<typeof insertWdfPricingTierSchema>;
export type WdfPricingTier = typeof wdfPricingTiers.$inferSelect;

// WDF Add-on Services - Optional services with pricing
export const wdfAddons = pgTable("wdf_addons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Add-on Details
  addonName: text("addon_name").notNull(), // "Stain Treatment", "Hang Dry", "Fabric Softener"
  addonType: text("addon_type").notNull(), // "per_pound", "flat_fee", "per_item"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  
  // Display
  description: text("description"),
  icon: text("icon"), // Lucide icon name
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("wdf_addons_laundromat_idx").on(table.laundromatId),
  activeIdx: index("wdf_addons_active_idx").on(table.isActive),
}));

export const insertWdfAddonSchema = createInsertSchema(wdfAddons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWdfAddon = z.infer<typeof insertWdfAddonSchema>;
export type WdfAddon = typeof wdfAddons.$inferSelect;

// WDF Subscriptions - Customer subscription plans with pound allocations
export const wdfSubscriptions = pgTable("wdf_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id),
  householdAccountId: varchar("household_account_id").references(() => householdAccounts.id),
  
  // Plan Details
  planName: text("plan_name").notNull(), // "Weekly Wash", "Monthly Bundle", "Family Plan"
  planType: text("plan_type").notNull(), // "weekly", "monthly"
  
  // Pound Allocation
  poundAllocation: integer("pound_allocation").notNull(), // e.g., 20, 40, 80 lbs
  usedPounds: decimal("used_pounds", { precision: 10, scale: 2 }).default("0"),
  rolloverPounds: decimal("rollover_pounds", { precision: 10, scale: 2 }).default("0"),
  maxRollover: integer("max_rollover").default(20), // Max pounds that can roll over
  
  // Pricing
  subscriptionPrice: decimal("subscription_price", { precision: 10, scale: 2 }).notNull(),
  overageRate: decimal("overage_rate", { precision: 10, scale: 2 }).notNull(), // Price per pound over allocation
  
  // Billing
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  nextBillingDate: timestamp("next_billing_date"),
  
  // Status
  status: text("status").default("active"), // "active", "paused", "cancelled", "past_due"
  pausedAt: timestamp("paused_at"),
  cancelledAt: timestamp("cancelled_at"),
  pauseReason: text("pause_reason"),
  
  // Service Preferences
  serviceType: text("service_type").default("regular"), // "regular", "same_day", "express"
  preferredPickupDay: text("preferred_pickup_day"), // "monday", "wednesday", etc.
  preferredDeliveryDay: text("preferred_delivery_day"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("wdf_subscriptions_laundromat_idx").on(table.laundromatId),
  customerIdx: index("wdf_subscriptions_customer_idx").on(table.customerId),
  statusIdx: index("wdf_subscriptions_status_idx").on(table.status),
  periodEndIdx: index("wdf_subscriptions_period_end_idx").on(table.currentPeriodEnd),
}));

export const insertWdfSubscriptionSchema = createInsertSchema(wdfSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWdfSubscription = z.infer<typeof insertWdfSubscriptionSchema>;
export type WdfSubscription = typeof wdfSubscriptions.$inferSelect;

// WDF Subscription Usage - Track pound usage per period
export const wdfSubscriptionUsage = pgTable("wdf_subscription_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").references(() => wdfSubscriptions.id).notNull(),
  transactionId: varchar("transaction_id").references(() => posTransactions.id),
  
  // Usage Details
  poundsUsed: decimal("pounds_used", { precision: 10, scale: 2 }).notNull(),
  isOverage: boolean("is_overage").default(false),
  overageAmount: decimal("overage_amount", { precision: 10, scale: 2 }),
  
  // Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  subscriptionIdx: index("wdf_subscription_usage_subscription_idx").on(table.subscriptionId),
  periodIdx: index("wdf_subscription_usage_period_idx").on(table.periodStart, table.periodEnd),
}));

export const insertWdfSubscriptionUsageSchema = createInsertSchema(wdfSubscriptionUsage).omit({
  id: true,
  createdAt: true,
});

export type InsertWdfSubscriptionUsage = z.infer<typeof insertWdfSubscriptionUsageSchema>;
export type WdfSubscriptionUsage = typeof wdfSubscriptionUsage.$inferSelect;

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

// Machine Telemetry - Real-time status tracking (current state snapshot)
export const machineTelemetry = pgTable("machine_telemetry", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id),
  
  // Current Status
  status: text("status").notNull().default("available"), // "available", "in_use", "out_of_order", "maintenance", "offline"
  currentCycleNumber: integer("current_cycle_number").default(0),
  totalCycleCount: integer("total_cycle_count").default(0),
  
  // Cycle Progress
  cyclePhase: text("cycle_phase"), // "wash", "rinse", "spin", "dry", "cool", "complete"
  cycleProgress: integer("cycle_progress").default(0), // 0-100 percent
  cycleStartTime: timestamp("cycle_start_time"),
  estimatedEndTime: timestamp("estimated_end_time"),
  cycleType: text("cycle_type"), // "normal", "heavy", "delicate", "quick"
  
  // Sensor Readings
  temperature: decimal("temperature", { precision: 6, scale: 2 }), // Celsius
  vibration: decimal("vibration", { precision: 6, scale: 2 }), // G-force
  waterLevel: decimal("water_level", { precision: 6, scale: 2 }), // Percentage
  doorLocked: boolean("door_locked").default(false),
  
  // Error/Fault Status
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  errorSeverity: text("error_severity"), // "warning", "error", "critical"
  errorTimestamp: timestamp("error_timestamp"),
  
  // Revenue Tracking
  revenueToday: decimal("revenue_today", { precision: 10, scale: 2 }).default("0.00"),
  revenueThisWeek: decimal("revenue_this_week", { precision: 10, scale: 2 }).default("0.00"),
  revenueThisMonth: decimal("revenue_this_month", { precision: 10, scale: 2 }).default("0.00"),
  averageRevenuePerCycle: decimal("average_revenue_per_cycle", { precision: 6, scale: 2 }),
  
  // Usage Analytics
  turnsPerDay: decimal("turns_per_day", { precision: 6, scale: 2 }).default("0.00"),
  utilizationPercent: decimal("utilization_percent", { precision: 5, scale: 2 }).default("0.00"),
  cyclesThisHour: integer("cycles_this_hour").default(0),
  cyclesToday: integer("cycles_today").default(0),
  
  // Maintenance Tracking
  cyclesSinceLastMaintenance: integer("cycles_since_last_maintenance").default(0),
  recommendedMaintenanceDate: timestamp("recommended_maintenance_date"),
  maintenanceDueInCycles: integer("maintenance_due_in_cycles"),
  healthScore: integer("health_score").default(100), // 0-100
  
  // Dynamic Pricing
  currentPrice: decimal("current_price", { precision: 6, scale: 2 }),
  basePrice: decimal("base_price", { precision: 6, scale: 2 }),
  priceModifier: decimal("price_modifier", { precision: 4, scale: 2 }).default("1.00"), // Multiplier
  activePricingRule: varchar("active_pricing_rule"),
  
  // IoT Connection
  lastHeartbeat: timestamp("last_heartbeat"),
  connectionStatus: text("connection_status").default("online"), // "online", "offline", "intermittent"
  firmwareVersion: text("firmware_version"),
  
  // Timestamps
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("machine_telemetry_machine_idx").on(table.machineId),
  laundromatIdx: index("machine_telemetry_laundromat_idx").on(table.laundromatId),
  statusIdx: index("machine_telemetry_status_idx").on(table.status),
  lastUpdatedIdx: index("machine_telemetry_last_updated_idx").on(table.lastUpdated),
}));

export const insertMachineTelemetrySchema = createInsertSchema(machineTelemetry).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export type InsertMachineTelemetry = z.infer<typeof insertMachineTelemetrySchema>;
export type MachineTelemetry = typeof machineTelemetry.$inferSelect;

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

// Machine Alerts - Real-time alerts for machine issues
export const machineAlerts = pgTable("machine_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id),
  
  // Alert Details
  alertType: text("alert_type").notNull(), // "error", "maintenance_due", "low_supplies", "revenue_anomaly", "offline", "temperature_warning"
  message: text("message").notNull(),
  severity: text("severity").notNull().default("warning"), // "info", "warning", "error", "critical"
  
  // Error Details (if applicable)
  errorCode: text("error_code"),
  errorDescription: text("error_description"),
  
  // Resolution
  isResolved: boolean("is_resolved").default(false).notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  
  // Notification Status
  notificationSent: boolean("notification_sent").default(false),
  notifiedAt: timestamp("notified_at"),
  
  // Metadata
  metadata: jsonb("metadata"), // Additional context data
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("machine_alerts_machine_idx").on(table.machineId),
  laundromatIdx: index("machine_alerts_laundromat_idx").on(table.laundromatId),
  alertTypeIdx: index("machine_alerts_type_idx").on(table.alertType),
  severityIdx: index("machine_alerts_severity_idx").on(table.severity),
  isResolvedIdx: index("machine_alerts_resolved_idx").on(table.isResolved),
  createdAtIdx: index("machine_alerts_created_at_idx").on(table.createdAt),
}));

export const insertMachineAlertSchema = createInsertSchema(machineAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMachineAlert = z.infer<typeof insertMachineAlertSchema>;
export type MachineAlert = typeof machineAlerts.$inferSelect;

// Diagnostic Codes - Equipment error codes library (2500+ codes across 60+ brands)
export const diagnosticCodes = pgTable("diagnostic_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Code Details - manufacturer+code is unique together
  code: text("code").notNull(), // e.g., "E01", "F12", "dE"
  manufacturer: text("manufacturer").notNull(), // "Speed Queen", "Maytag", "Dexter", etc.
  machineType: text("machine_type"), // "washer", "dryer", "both", "payment"
  
  // URL-friendly slug for SEO
  slug: text("slug").notNull().unique(), // e.g., "speed-queen-e01", "dexter-f12"
  
  // Description
  title: text("title").notNull(),
  description: text("description").notNull(),
  possibleCauses: text("possible_causes").array(),
  
  // Solution
  troubleshootingSteps: text("troubleshooting_steps").array(),
  requiredParts: text("required_parts").array(), // Part numbers with names
  partsWithPricing: jsonb("parts_with_pricing"), // [{partNumber, name, price, supplier}]
  estimatedRepairTime: integer("estimated_repair_time"), // Minutes
  skillLevel: text("skill_level"), // "basic", "intermediate", "professional"
  
  // Quick fix tips (pro tips from experienced techs)
  quickFix: text("quick_fix"), // "Clean pump filter first - fixes 70% of cases"
  
  // Repair techniques - detailed pro tips for experienced techs
  repairTechniques: text("repair_techniques").array(), // ["Use ESD mat for board work", "Test with known good card"]
  
  // Fix success rate based on historical data
  fixSuccessRate: integer("fix_success_rate"), // Percentage 0-100
  
  // Era/Model compatibility
  eraCompatibility: text("era_compatibility"), // "1990-2005", "2000-2025", etc.
  modelSeries: text("model_series"), // "Quantum", "C-Series", "Phase 5", etc.
  
  // Priority
  severity: text("severity").default("medium"), // "low", "medium", "high", "critical"
  
  // Reference
  manualReference: text("manual_reference"),
  videoUrl: text("video_url"),
  testModeEntry: text("test_mode_entry"), // How to enter test/diagnostic mode
  
  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  manufacturerCodeIdx: uniqueIndex("diagnostic_codes_manufacturer_code_idx").on(table.manufacturer, table.code),
  slugIdx: uniqueIndex("diagnostic_codes_slug_idx").on(table.slug),
  manufacturerIdx: index("diagnostic_codes_manufacturer_idx").on(table.manufacturer),
  severityIdx: index("diagnostic_codes_severity_idx").on(table.severity),
  codeIdx: index("diagnostic_codes_code_idx").on(table.code),
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

// Search Index (for full-text search across entire platform with PostgreSQL ts_vector)
export const searchIndex = pgTable("search_index", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Content Reference
  entityType: text("entity_type").notNull(), // "page", "calculator", "resource", "listing", "article", "course", "blog", "vendor"
  contentId: varchar("content_id"), // Optional - for dynamic content items
  url: text("url").notNull(),
  
  // Searchable Content
  title: text("title").notNull(),
  description: text("description"),
  keywords: text("keywords").array(),
  searchableContent: text("searchable_content"), // Full text content for ts_vector search
  category: text("category"),
  
  // Ranking
  searchRank: integer("search_rank").default(0), // Base rank priority (1-10)
  popularity: integer("popularity").default(0), // Click count boosts ranking
  
  // Metadata
  imageUrl: text("image_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  metadata: jsonb("metadata"), // Additional metadata for filtering
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  entityTypeIdx: index("search_index_entity_type_idx").on(table.entityType),
  titleIdx: index("search_index_title_idx").on(table.title),
  rankIdx: index("search_index_rank_idx").on(table.searchRank),
  activeIdx: index("search_index_active_idx").on(table.isActive),
  urlIdx: uniqueIndex("search_index_url_idx").on(table.url),
}));

export const insertSearchIndexSchema = createInsertSchema(searchIndex).omit({
  id: true,
  createdAt: true,
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
// PROMO CODE SYSTEM - For Facebook Group & Marketing Campaigns
// ============================================================================

// Promo Codes - Discount codes synced with Stripe Coupons/Promotion Codes
export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Code Details
  code: varchar("code").unique().notNull(), // e.g., "FBGROUP50", "LAUNCH2024"
  description: text("description"), // Internal note for admin
  
  // Discount Configuration
  discountType: varchar("discount_type").notNull(), // "percent" or "fixed"
  discountAmount: integer("discount_amount").notNull(), // Percentage (50 = 50%) or cents (5000 = $50)
  
  // Stripe Integration
  stripeCouponId: varchar("stripe_coupon_id"), // Stripe coupon ID
  stripePromotionCodeId: varchar("stripe_promotion_code_id"), // Stripe promotion code ID
  
  // Usage Limits
  maxRedemptions: integer("max_redemptions"), // Total uses allowed (null = unlimited)
  maxRedemptionsPerUser: integer("max_redemptions_per_user").default(1), // Per-user limit
  currentRedemptions: integer("current_redemptions").default(0).notNull(),
  
  // Validity Period
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // null = never expires
  
  // Applicable Products (null = all products)
  applicableProducts: text("applicable_products").array(), // ["starter", "pro", "enterprise", "business_plan"]
  
  // Status & Metadata
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by"), // Admin user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex("promo_code_idx").on(table.code),
  activeIdx: index("promo_active_idx").on(table.isActive),
  expiresIdx: index("promo_expires_idx").on(table.expiresAt),
}));

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ 
  id: true, 
  currentRedemptions: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

// Promo Code Redemptions - Track who used which codes
export const promoCodeRedemptions = pgTable("promo_code_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  promoCodeId: varchar("promo_code_id").notNull().references(() => promoCodes.id),
  userId: varchar("user_id"), // null for guest checkouts
  email: varchar("email").notNull(), // Always captured
  
  // Purchase Details
  productType: varchar("product_type").notNull(), // "starter", "pro", "enterprise", "business_plan"
  originalAmount: integer("original_amount").notNull(), // Original price in cents
  discountAmount: integer("discount_amount").notNull(), // Discount applied in cents
  finalAmount: integer("final_amount").notNull(), // Final charged amount in cents
  
  // Stripe Reference
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
}, (table) => ({
  promoCodeIdx: index("redemption_promo_code_idx").on(table.promoCodeId),
  userIdx: index("redemption_user_idx").on(table.userId),
  emailIdx: index("redemption_email_idx").on(table.email),
}));

export const insertPromoCodeRedemptionSchema = createInsertSchema(promoCodeRedemptions).omit({ 
  id: true, 
  redeemedAt: true 
});
export type InsertPromoCodeRedemption = z.infer<typeof insertPromoCodeRedemptionSchema>;
export type PromoCodeRedemption = typeof promoCodeRedemptions.$inferSelect;

// ============================================================================
// ADMIN ACTIVITY LOG
// Tracks all important events for the admin dashboard analytics
// ============================================================================

export const adminActivityLog = pgTable("admin_activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Event Classification
  type: varchar("type").notNull(), // "user_signup", "purchase", "subscription", "cleanbi_analysis", "promo_redemption"
  description: text("description").notNull(), // Human-readable description
  
  // User Reference (optional - some events are anonymous)
  userId: varchar("user_id"),
  email: varchar("email"),
  
  // Event Metadata (flexible JSON for different event types)
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`), // { amount, productName, tier, address, etc. }
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("activity_type_idx").on(table.type),
  createdAtIdx: index("activity_created_at_idx").on(table.createdAt),
  userIdIdx: index("activity_user_id_idx").on(table.userId),
}));

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLog).omit({
  id: true,
  createdAt: true,
});
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;
export type AdminActivityLog = typeof adminActivityLog.$inferSelect;

// ============================================================================
// REFERRAL PROGRAM
// Track referrals and rewards for growth
// ============================================================================

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Referrer (the user who shared the referral)
  referrerId: varchar("referrer_id").references(() => users.id).notNull(),
  referrerEmail: varchar("referrer_email"),
  
  // Referred (the new user who signed up)
  referredId: varchar("referred_id").references(() => users.id),
  referredEmail: varchar("referred_email").notNull(),
  
  // Referral Status
  status: varchar("status").default("pending").notNull(), // "pending", "signed_up", "converted", "rewarded"
  
  // Reward tracking
  referrerReward: varchar("referrer_reward"), // e.g., "1_month_free", "bonus_analyses"
  referredReward: varchar("referred_reward"), // e.g., "extra_analysis"
  rewardedAt: timestamp("rewarded_at"),
  
  // Timestamps
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  signedUpAt: timestamp("signed_up_at"),
  convertedAt: timestamp("converted_at"), // When they became a paid subscriber
}, (table) => ({
  referrerIdx: index("referral_referrer_idx").on(table.referrerId),
  referredIdx: index("referral_referred_idx").on(table.referredId),
  statusIdx: index("referral_status_idx").on(table.status),
}));

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  invitedAt: true,
});
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// ============================================================================
// FEEDBACK SUBMISSIONS
// Store user feedback for admin dashboard
// ============================================================================

export const feedbackSubmissions = pgTable("feedback_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Submitter Info
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  
  // Feedback Content
  category: varchar("category").notNull(), // "feature-request", "improvement", "bug-report", "general-feedback", "other"
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  page: varchar("page"), // Page/feature this is about
  
  // Admin Response
  status: varchar("status").default("new").notNull(), // "new", "reviewed", "in_progress", "resolved", "closed"
  adminNotes: text("admin_notes"),
  respondedAt: timestamp("responded_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("feedback_status_idx").on(table.status),
  categoryIdx: index("feedback_category_idx").on(table.category),
  createdAtIdx: index("feedback_created_at_idx").on(table.createdAt),
}));

export const insertFeedbackSubmissionSchema = createInsertSchema(feedbackSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFeedbackSubmission = z.infer<typeof insertFeedbackSubmissionSchema>;
export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;

// ============================================================================
// MULTI-TENANT PLATFORM ARCHITECTURE
// Powers both WashBizHub.com AND StrokeRecoveryAcademy.com with shared infra
// ============================================================================

// Tenants - Core platform configuration table
// Each tenant represents a distinct vertical (WashBizHub, StrokeRecoveryAcademy, etc.)
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Tenant Identity
  slug: varchar("slug").unique().notNull(), // "washbizhub", "strokerecoveryacademy"
  name: varchar("name").notNull(), // "WashBizHub", "Stroke Recovery Academy"
  domain: varchar("domain").unique().notNull(), // "washbizhub.com", "strokerecoveryacademy.com"
  
  // Branding & Theming
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color").default("#C8A661"), // Gold for WashBizHub, adjustable per tenant
  accentColor: varchar("accent_color").default("#1a2332"), // Navy for WashBizHub
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  tagline: text("tagline"),
  
  // SEO & Meta
  metaTitle: text("meta_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  ogImage: text("og_image"),
  
  // AI Configuration
  aiKnowledgeBasePath: text("ai_knowledge_base_path").notNull(), // "laundromat-bible", "stroke-recovery-bible"
  aiWelcomeMessage: text("ai_welcome_message").notNull(),
  aiSystemPromptOverride: text("ai_system_prompt_override"), // Optional tenant-specific AI behavior
  
  // Amazon Affiliate Configuration (same associate tag, different product catalogs)
  amazonCatalogType: varchar("amazon_catalog_type").notNull(), // "commercial_laundry", "stroke_recovery"
  
  // Features & Capabilities
  enableCourses: boolean("enable_courses").default(true),
  enableMarketplace: boolean("enable_marketplace").default(true),
  enableWhiteLabel: boolean("enable_white_label").default(false), // WashBizHub can white-label, SRA cannot
  enableCommunity: boolean("enable_community").default(true),
  
  // Status
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

// Tenant Users - Junction table for multi-tenant user access
// Allows users to have accounts on both WashBizHub AND StrokeRecoveryAcademy
export const tenantUsers = pgTable("tenant_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role").default("user"), // "user", "admin", "editor"
  
  // Tenant-specific subscription info
  isPro: boolean("is_pro").default(false),
  subscriptionTier: text("subscription_tier").default("free"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // Tenant-specific AI quota
  aiConsultantTier: text("ai_consultant_tier").default("free"),
  aiMonthlyQuota: integer("ai_monthly_quota").default(10),
  aiMessagesUsed: integer("ai_messages_used").default(0),
  aiQuotaResetDate: timestamp("ai_quota_reset_date").default(sql`NOW() + INTERVAL '1 month'`),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantUserIdx: uniqueIndex("tenant_user_unique_idx").on(table.tenantId, table.userId),
}));

export const insertTenantUserSchema = createInsertSchema(tenantUsers).omit({
  id: true,
  createdAt: true,
});

export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;
export type TenantUser = typeof tenantUsers.$inferSelect;

// ============================================================================
// AI RECOVERY COMPANION SYSTEM
// Daily coaching, reminders, accountability, and progress tracking
// Powers StrokeLyfe.app for stroke survivors
// ============================================================================

// Medication Schedule & Reminders
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: varchar("name").notNull(),
  dosage: varchar("dosage").notNull(), // "10mg", "2 tablets", etc.
  frequency: varchar("frequency").notNull(), // "daily", "twice_daily", "as_needed"
  timeOfDay: text("time_of_day"), // JSON array: ["08:00", "20:00"]
  purpose: text("purpose"), // "Blood pressure", "Pain management", etc.
  prescribedBy: varchar("prescribed_by"),
  
  reminderEnabled: boolean("reminder_enabled").default(true),
  reminderMethod: varchar("reminder_method").default("email"), // "email", "sms", "both"
  
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

// Medication Log - Track adherence
export const medicationLogs = pgTable("medication_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").references(() => medications.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  scheduledTime: timestamp("scheduled_time").notNull(),
  takenAt: timestamp("taken_at"),
  status: varchar("status").notNull(), // "taken", "missed", "skipped", "pending"
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;

// Appointments - Medical, PT, OT, Speech Therapy
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  title: varchar("title").notNull(),
  type: varchar("type").notNull(), // "doctor", "physical_therapy", "occupational_therapy", "speech_therapy", "lab", "other"
  providerName: varchar("provider_name"),
  location: text("location"),
  
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(60), // minutes
  
  reminderEnabled: boolean("reminder_enabled").default(true),
  reminderBefore: integer("reminder_before").default(24), // hours before
  reminderMethod: varchar("reminder_method").default("email"),
  
  notes: text("notes"),
  completed: boolean("completed").default(false),
  cancelled: boolean("cancelled").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Exercise Tracking & Accountability
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // "stretching", "strength", "balance", "walking", "pt_protocol"
  description: text("description"),
  instructions: text("instructions"),
  
  sets: integer("sets"),
  reps: integer("reps"),
  duration: integer("duration"), // minutes
  
  frequency: varchar("frequency").notNull(), // "daily", "3x_week", "custom"
  scheduledDays: text("scheduled_days"), // JSON array: ["monday", "wednesday", "friday"]
  scheduledTime: varchar("scheduled_time"), // "08:00"
  
  reminderEnabled: boolean("reminder_enabled").default(true),
  
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

// Exercise Logs - Track completion and progress
export const exerciseLogs = pgTable("exercise_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  setsCompleted: integer("sets_completed"),
  repsCompleted: integer("reps_completed"),
  durationCompleted: integer("duration_completed"), // minutes
  
  difficulty: varchar("difficulty"), // "easy", "moderate", "hard"
  painLevel: integer("pain_level"), // 0-10 scale
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertExerciseLog = z.infer<typeof insertExerciseLogSchema>;
export type ExerciseLog = typeof exerciseLogs.$inferSelect;

// Hydration Tracking
export const hydrationLogs = pgTable("hydration_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
  amount: integer("amount").notNull(), // ounces
  type: varchar("type").default("water"), // "water", "tea", "other"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index("hydration_user_date_idx").on(table.userId, table.loggedAt),
}));

export const insertHydrationLogSchema = createInsertSchema(hydrationLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertHydrationLog = z.infer<typeof insertHydrationLogSchema>;
export type HydrationLog = typeof hydrationLogs.$inferSelect;

// Hydration Goals & Reminders
export const hydrationGoals = pgTable("hydration_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  dailyGoal: integer("daily_goal").default(64).notNull(), // ounces
  reminderEnabled: boolean("reminder_enabled").default(true),
  reminderInterval: integer("reminder_interval").default(2), // hours
  reminderStartTime: varchar("reminder_start_time").default("08:00"),
  reminderEndTime: varchar("reminder_end_time").default("20:00"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHydrationGoalSchema = createInsertSchema(hydrationGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHydrationGoal = z.infer<typeof insertHydrationGoalSchema>;
export type HydrationGoal = typeof hydrationGoals.$inferSelect;

// Daily Check-ins - Mood, Progress, Challenges
export const dailyCheckins = pgTable("daily_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  checkinDate: timestamp("checkin_date").defaultNow().notNull(),
  
  // Physical Status
  painLevel: integer("pain_level"), // 0-10 scale
  energyLevel: integer("energy_level"), // 0-10 scale
  sleepQuality: integer("sleep_quality"), // 0-10 scale
  
  // Emotional Status
  mood: varchar("mood"), // "great", "good", "okay", "struggling", "bad"
  motivation: integer("motivation"), // 0-10 scale
  
  // Recovery Progress
  progressToday: text("progress_today"), // What went well
  challengesToday: text("challenges_today"), // What was difficult
  goalsForTomorrow: text("goals_for_tomorrow"),
  
  // AI Companion Response
  aiResponse: text("ai_response"), // Personalized encouragement/coaching
  aiSentiment: varchar("ai_sentiment"), // "encouraging", "motivating", "empathetic"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index("checkin_user_date_idx").on(table.userId, table.checkinDate),
}));

export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).omit({
  id: true,
  createdAt: true,
});

export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;

// Progress Milestones - Track recovery achievements
export const progressMilestones = pgTable("progress_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // "mobility", "strength", "speech", "cognitive", "independence"
  
  achievedAt: timestamp("achieved_at").defaultNow().notNull(),
  celebrationMessage: text("celebration_message"), // AI-generated encouragement
  
  photoUrl: text("photo_url"), // Optional photo/video proof
  notes: text("notes"),
  
  shared: boolean("shared").default(false), // Share with community?
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProgressMilestoneSchema = createInsertSchema(progressMilestones).omit({
  id: true,
  createdAt: true,
});

export type InsertProgressMilestone = z.infer<typeof insertProgressMilestoneSchema>;
export type ProgressMilestone = typeof progressMilestones.$inferSelect;

// Recovery Goals - Short-term and long-term
export const recoveryGoals = pgTable("recovery_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // "mobility", "strength", "speech", "cognitive", "independence"
  
  goalType: varchar("goal_type").notNull(), // "daily", "weekly", "monthly", "long_term"
  targetDate: timestamp("target_date"),
  
  status: varchar("status").default("in_progress"), // "not_started", "in_progress", "completed", "abandoned"
  completedAt: timestamp("completed_at"),
  
  milestoneId: varchar("milestone_id").references(() => progressMilestones.id), // Link to achievement
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRecoveryGoalSchema = createInsertSchema(recoveryGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRecoveryGoal = z.infer<typeof insertRecoveryGoalSchema>;
export type RecoveryGoal = typeof recoveryGoals.$inferSelect;

// AI Companion Settings - Personalized coaching preferences
export const aiCompanionSettings = pgTable("ai_companion_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique().notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Communication Preferences
  communicationStyle: varchar("communication_style").default("encouraging"), // "encouraging", "direct", "gentle", "tough_love"
  checkInTime: varchar("check_in_time").default("09:00"), // Daily check-in reminder time
  checkInEnabled: boolean("check_in_enabled").default(true),
  
  // Contact Preferences
  phoneNumber: varchar("phone_number"), // For SMS reminders
  emailAddress: varchar("email_address"),
  preferredMethod: varchar("preferred_method").default("email"), // "email", "sms", "both"
  
  // Coaching Focus Areas
  focusAreas: text("focus_areas"), // JSON array: ["mobility", "speech", "emotional"]
  
  // Privacy
  shareProgress: boolean("share_progress").default(false), // Share with community
  anonymousSharing: boolean("anonymous_sharing").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiCompanionSettingsSchema = createInsertSchema(aiCompanionSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiCompanionSettings = z.infer<typeof insertAiCompanionSettingsSchema>;
export type AiCompanionSettings = typeof aiCompanionSettings.$inferSelect;

// ============================================================================
// GHOSTWRITING SUITE - Help survivors write & publish their recovery stories
// ============================================================================

// Ghostwriting Projects - Book manuscripts for KDP publishing
export const ghostwritingProjects = pgTable("ghostwriting_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Book Details
  title: varchar("title").notNull(),
  subtitle: text("subtitle"),
  authorName: varchar("author_name").notNull(), // Pen name or real name
  genre: varchar("genre").default("memoir"), // "memoir", "self_help", "inspirational"
  
  // Project Status
  status: varchar("status").default("draft"), // "draft", "writing", "editing", "review", "published"
  currentChapter: integer("current_chapter").default(1),
  totalChapters: integer("total_chapters").default(10),
  wordCount: integer("word_count").default(0),
  targetWordCount: integer("target_word_count").default(50000),
  
  // Book Structure (JSON)
  outline: jsonb("outline"), // Array of chapter outlines
  frontMatter: jsonb("front_matter"), // Dedication, foreword, introduction
  backMatter: jsonb("back_matter"), // About author, resources, acknowledgments
  
  // KDP Publishing Info
  isbn: varchar("isbn"),
  asin: varchar("asin"), // Amazon ASIN
  kdpStatus: varchar("kdp_status").default("not_submitted"), // "not_submitted", "pending", "approved", "live"
  publishedAt: timestamp("published_at"),
  amazonUrl: text("amazon_url"),
  
  // Cover & Formatting
  coverImageUrl: text("cover_image_url"),
  trimSize: varchar("trim_size").default("6x9"), // "5x8", "6x9", "5.5x8.5"
  interiorType: varchar("interior_type").default("black_white"), // "black_white", "color"
  
  // AI Assistance Tracking
  aiAssistanceLevel: varchar("ai_assistance_level").default("guided"), // "minimal", "guided", "collaborative"
  aiSuggestionsUsed: integer("ai_suggestions_used").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userProjectIdx: index("ghostwriting_user_idx").on(table.userId),
  statusIdx: index("ghostwriting_status_idx").on(table.status),
}));

export const insertGhostwritingProjectSchema = createInsertSchema(ghostwritingProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGhostwritingProject = z.infer<typeof insertGhostwritingProjectSchema>;
export type GhostwritingProject = typeof ghostwritingProjects.$inferSelect;

// Ghostwriting Chapters - Individual chapters of the book
export const ghostwritingChapters = pgTable("ghostwriting_chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => ghostwritingProjects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Chapter Details
  chapterNumber: integer("chapter_number").notNull(),
  title: varchar("title").notNull(),
  theme: text("theme"), // e.g., "The rupture that rewrote everything"
  canonPrinciple: text("canon_principle"), // e.g., "You don't survive a stroke. You interrogate it."
  
  // Content
  content: text("content"), // Full chapter text
  wordCount: integer("word_count").default(0),
  targetWordCount: integer("target_word_count").default(3000),
  
  // Structure (JSON)
  sections: jsonb("sections"), // Array of section headers/content
  keyMoments: jsonb("key_moments"), // Important scenes/memories
  supportingCharacters: jsonb("supporting_characters"), // People mentioned
  beforeAfterMoments: jsonb("before_after_moments"), // Contrast moments
  
  // Writing Status
  status: varchar("status").default("outline"), // "outline", "draft", "revision", "final"
  draftVersion: integer("draft_version").default(1),
  
  // AI Assistance
  aiPrompts: jsonb("ai_prompts"), // Prompts used to generate content
  aiSuggestions: text("ai_suggestions"), // Suggestions for improvement
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectChapterIdx: index("chapter_project_idx").on(table.projectId, table.chapterNumber),
}));

export const insertGhostwritingChapterSchema = createInsertSchema(ghostwritingChapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGhostwritingChapter = z.infer<typeof insertGhostwritingChapterSchema>;
export type GhostwritingChapter = typeof ghostwritingChapters.$inferSelect;

// AI Companion Conversations - Chat history with recovery AI
export const aiCompanionChats = pgTable("ai_companion_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Conversation Context
  sessionId: varchar("session_id").notNull(), // Group messages in a session
  topic: varchar("topic"), // "motivation", "exercise", "medication", "emotional", "ghostwriting"
  
  // Message
  role: varchar("role").notNull(), // "user", "assistant"
  content: text("content").notNull(),
  
  // AI Metadata
  aiModel: varchar("ai_model"), // Which model responded
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  
  // Sentiment & Analysis
  userSentiment: varchar("user_sentiment"), // "positive", "neutral", "struggling", "crisis"
  responseType: varchar("response_type"), // "encouragement", "guidance", "exercise", "reminder"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userSessionIdx: index("chat_user_session_idx").on(table.userId, table.sessionId),
  topicIdx: index("chat_topic_idx").on(table.topic),
}));

export const insertAiCompanionChatSchema = createInsertSchema(aiCompanionChats).omit({
  id: true,
  createdAt: true,
});

export type InsertAiCompanionChat = z.infer<typeof insertAiCompanionChatSchema>;
export type AiCompanionChat = typeof aiCompanionChats.$inferSelect;

// Book Templates - Based on "The Stroked Out Sasquatch" structure
export const bookTemplates = pgTable("book_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  name: varchar("name").notNull(),
  description: text("description"),
  genre: varchar("genre").default("memoir"),
  
  // Template Structure
  chapterCount: integer("chapter_count").default(10),
  chapterTemplates: jsonb("chapter_templates"), // Array of chapter templates with themes/prompts
  frontMatterTemplate: jsonb("front_matter_template"),
  backMatterTemplate: jsonb("back_matter_template"),
  
  // Formatting
  trimSize: varchar("trim_size").default("6x9"),
  targetWordCount: integer("target_word_count").default(50000),
  
  // Source
  basedOn: varchar("based_on"), // "stroked_out_sasquatch", "custom"
  authorCredit: varchar("author_credit"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookTemplateSchema = createInsertSchema(bookTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertBookTemplate = z.infer<typeof insertBookTemplateSchema>;
export type BookTemplate = typeof bookTemplates.$inferSelect;

// ============================================================================
// VR RECOVERY SESSIONS - Future Neuro VR App tracking
// ============================================================================

export const vrRecoverySessions = pgTable("vr_recovery_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Session Details
  sessionType: varchar("session_type").notNull(), // "hand_therapy", "balance", "cognitive", "speech"
  exerciseName: varchar("exercise_name").notNull(),
  difficulty: varchar("difficulty").default("beginner"), // "beginner", "intermediate", "advanced"
  
  // Performance Metrics
  duration: integer("duration"), // seconds
  repetitions: integer("repetitions"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // percentage
  score: integer("score"),
  
  // Motion Tracking Data (JSON)
  motionData: jsonb("motion_data"), // Hand tracking, balance metrics, etc.
  
  // Progress
  improvement: decimal("improvement", { precision: 5, scale: 2 }), // vs previous session
  personalBest: boolean("personal_best").default(false),
  
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userSessionTypeIdx: index("vr_user_type_idx").on(table.userId, table.sessionType),
}));

export const insertVrRecoverySessionSchema = createInsertSchema(vrRecoverySessions).omit({
  id: true,
  createdAt: true,
});

export type InsertVrRecoverySession = z.infer<typeof insertVrRecoverySessionSchema>;
export type VrRecoverySession = typeof vrRecoverySessions.$inferSelect;

// ============================================================================
// INDUSTRIAL PUBLISHING FACTORY - Multi-AI Book Production System
// ============================================================================

// AI Agent Profiles - Define specialized agents and their capabilities
export const aiAgentProfiles = pgTable("ai_agent_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Agent Identity
  name: varchar("name").notNull(), // "Research Agent", "Outline Agent", etc.
  role: varchar("role").notNull(), // "research", "outline", "write", "analyze", "image", "edit", "cite"
  description: text("description"),
  
  // AI Provider & Model
  provider: varchar("provider").notNull(), // "openai", "anthropic", "gemini", "perplexity", "grok"
  model: varchar("model").notNull(), // "gpt-4o", "claude-sonnet-4-5", "gemini-1.5-pro", etc.
  
  // Intelligence Tiers (which tiers this agent serves)
  supportedTiers: jsonb("supported_tiers").default('["economy", "standard", "premium", "ultra"]'),
  
  // Cost Tracking
  inputCostPer1k: decimal("input_cost_per_1k", { precision: 10, scale: 6 }).default("0.001"),
  outputCostPer1k: decimal("output_cost_per_1k", { precision: 10, scale: 6 }).default("0.003"),
  
  // Agent Configuration
  maxTokens: integer("max_tokens").default(4096),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default("0.7"),
  systemPrompt: text("system_prompt"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiAgentProfileSchema = createInsertSchema(aiAgentProfiles).omit({
  id: true,
  createdAt: true,
});

export type InsertAiAgentProfile = z.infer<typeof insertAiAgentProfileSchema>;
export type AiAgentProfile = typeof aiAgentProfiles.$inferSelect;

// Production Jobs - Track batch book production
export const productionJobs = pgTable("production_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  projectId: varchar("project_id").references(() => ghostwritingProjects.id),
  
  // Job Configuration
  jobName: varchar("job_name").notNull(),
  bookType: varchar("book_type").notNull(), // "memoir", "autobiography", "manifesto", "medical_guide", "childrens_book", "recovery_guide", "course"
  intelligenceTier: varchar("intelligence_tier").default("standard"), // "economy", "standard", "premium", "ultra"
  targetWordCount: integer("target_word_count").default(50000),
  
  // Production Status
  status: varchar("status").default("queued"), // "queued", "research", "outline", "writing", "analyzing", "imaging", "review", "export", "completed", "failed"
  currentStage: integer("current_stage").default(0), // 0-7 for each pipeline stage
  progress: integer("progress").default(0), // 0-100
  
  // Stage Completion Timestamps
  researchCompletedAt: timestamp("research_completed_at"),
  outlineCompletedAt: timestamp("outline_completed_at"),
  writingCompletedAt: timestamp("writing_completed_at"),
  analysisCompletedAt: timestamp("analysis_completed_at"),
  imagingCompletedAt: timestamp("imaging_completed_at"),
  reviewCompletedAt: timestamp("review_completed_at"),
  exportCompletedAt: timestamp("export_completed_at"),
  
  // Cost Tracking
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  tokensUsed: integer("tokens_used").default(0),
  
  // Configuration (JSON)
  config: jsonb("config"), // { style, tone, pacing, imageStyle, citationStyle, etc. }
  
  // Error Handling
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  // Workflow Mode
  workflowMode: varchar("workflow_mode").default("auto"), // "auto", "manual", "hybrid"
  requiresApproval: boolean("requires_approval").default(false),
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userJobIdx: index("production_user_idx").on(table.userId),
  statusIdx: index("production_status_idx").on(table.status),
  queueIdx: index("production_queue_idx").on(table.createdAt),
}));

export const insertProductionJobSchema = createInsertSchema(productionJobs).omit({
  id: true,
  createdAt: true,
});

export type InsertProductionJob = z.infer<typeof insertProductionJobSchema>;
export type ProductionJob = typeof productionJobs.$inferSelect;

// Chapter Artifacts - Images, charts, tables with placement metadata
export const chapterArtifacts = pgTable("chapter_artifacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: varchar("chapter_id").references(() => ghostwritingChapters.id).notNull(),
  projectId: varchar("project_id").references(() => ghostwritingProjects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Artifact Type
  type: varchar("type").notNull(), // "image", "chart", "table", "diagram", "graph", "infographic"
  
  // Content
  title: varchar("title"),
  description: text("description"),
  altText: text("alt_text"), // Accessibility
  caption: text("caption"),
  
  // For Images
  imageUrl: text("image_url"),
  imagePrompt: text("image_prompt"), // AI generation prompt
  imageStyle: varchar("image_style"), // "realistic", "illustration", "watercolor", "cartoon", "medical"
  
  // For Charts/Graphs
  chartType: varchar("chart_type"), // "bar", "line", "pie", "scatter", "area", "radar"
  chartData: jsonb("chart_data"), // Data for rendering
  chartConfig: jsonb("chart_config"), // Colors, labels, etc.
  
  // For Tables
  tableData: jsonb("table_data"), // 2D array of cells
  tableHeaders: jsonb("table_headers"),
  tableStyle: varchar("table_style"), // "simple", "striped", "bordered"
  
  // Placement
  placementMode: varchar("placement_mode").default("auto"), // "auto", "manual", "suggested"
  position: jsonb("position"), // { page, x, y, width, height }
  anchorText: text("anchor_text"), // Text near which to place
  
  // Generation Status
  generationStatus: varchar("generation_status").default("pending"), // "pending", "generating", "completed", "failed"
  generatedBy: varchar("generated_by"), // "dalle", "gemini", "manual"
  
  // Quality
  qualityScore: integer("quality_score"), // 0-100
  isApproved: boolean("is_approved").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  chapterIdx: index("artifact_chapter_idx").on(table.chapterId),
  typeIdx: index("artifact_type_idx").on(table.type),
}));

export const insertChapterArtifactSchema = createInsertSchema(chapterArtifacts).omit({
  id: true,
  createdAt: true,
});

export type InsertChapterArtifact = z.infer<typeof insertChapterArtifactSchema>;
export type ChapterArtifact = typeof chapterArtifacts.$inferSelect;

// Book Content Analyses - Tone, pacing, readability scores for book production
export const bookContentAnalyses = pgTable("book_content_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: varchar("chapter_id").references(() => ghostwritingChapters.id),
  projectId: varchar("project_id").references(() => ghostwritingProjects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Scope
  analysisScope: varchar("analysis_scope").default("chapter"), // "chapter", "section", "full_book"
  contentSample: text("content_sample"), // The text that was analyzed
  
  // Tone Analysis (0-100)
  toneScore: integer("tone_score"), // Overall tone consistency
  emotionalIntensity: integer("emotional_intensity"), // How emotionally charged
  formalityLevel: integer("formality_level"), // Casual to formal
  primaryTone: varchar("primary_tone"), // "inspirational", "educational", "conversational", "authoritative"
  secondaryTones: jsonb("secondary_tones"), // Array of detected tones
  
  // Pacing Analysis (0-100)
  pacingScore: integer("pacing_score"), // Overall pacing quality
  narrativeTension: integer("narrative_tension"), // Build-up and release
  sceneVariety: integer("scene_variety"), // Action vs reflection balance
  pacingIssues: jsonb("pacing_issues"), // Array of { location, issue, suggestion }
  
  // Readability Metrics
  readabilityScore: integer("readability_score"), // 0-100 (higher = easier)
  fleschKincaid: decimal("flesch_kincaid", { precision: 5, scale: 2 }),
  averageSentenceLength: decimal("avg_sentence_length", { precision: 5, scale: 2 }),
  averageWordLength: decimal("avg_word_length", { precision: 5, scale: 2 }),
  gradeLevel: varchar("grade_level"), // "5th", "8th", "12th", "college"
  
  // Style Analysis
  styleConsistency: integer("style_consistency"), // 0-100
  voiceStrength: integer("voice_strength"), // Unique author voice
  dialogueBalance: integer("dialogue_balance"), // % dialogue vs narrative
  
  // Quality Metrics
  overallQuality: integer("overall_quality"), // 0-100
  publishReadiness: integer("publish_readiness"), // 0-100
  
  // AI Suggestions
  suggestions: jsonb("suggestions"), // Array of improvement suggestions
  highlightedIssues: jsonb("highlighted_issues"), // Problem areas
  strengthAreas: jsonb("strength_areas"), // What works well
  
  // Analysis Metadata
  analyzedBy: varchar("analyzed_by"), // "claude", "gemini", "gpt4"
  analysisVersion: varchar("analysis_version").default("1.0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("book_analysis_project_idx").on(table.projectId),
  chapterIdx: index("book_analysis_chapter_idx").on(table.chapterId),
}));

export const insertBookContentAnalysisSchema = createInsertSchema(bookContentAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertBookContentAnalysis = z.infer<typeof insertBookContentAnalysisSchema>;
export type BookContentAnalysis = typeof bookContentAnalyses.$inferSelect;

// Citations - Medical/academic references
export const bookCitations = pgTable("book_citations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => ghostwritingProjects.id).notNull(),
  chapterId: varchar("chapter_id").references(() => ghostwritingChapters.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Citation Details
  citationType: varchar("citation_type").notNull(), // "journal", "book", "website", "study", "guideline"
  citationStyle: varchar("citation_style").default("ama"), // "ama", "apa", "mla", "chicago", "vancouver"
  
  // Source Information
  title: text("title").notNull(),
  authors: jsonb("authors"), // Array of author names
  publicationDate: varchar("publication_date"),
  journal: varchar("journal"),
  volume: varchar("volume"),
  issue: varchar("issue"),
  pages: varchar("pages"),
  doi: varchar("doi"),
  pmid: varchar("pmid"), // PubMed ID
  url: text("url"),
  publisher: varchar("publisher"),
  accessDate: varchar("access_date"),
  
  // Formatted Citation
  formattedCitation: text("formatted_citation"),
  
  // Usage in Book
  inTextCitation: varchar("in_text_citation"), // e.g., "[1]" or "(Smith, 2024)"
  citationNumber: integer("citation_number"), // Order in references
  anchorText: text("anchor_text"), // The claim being cited
  
  // Verification
  isVerified: boolean("is_verified").default(false),
  verificationSource: varchar("verification_source"), // "pubmed", "crossref", "manual"
  verifiedAt: timestamp("verified_at"),
  
  // Medical Accuracy (for health content)
  medicalAccuracyScore: integer("medical_accuracy_score"), // 0-100
  evidenceLevel: varchar("evidence_level"), // "A", "B", "C", "D" (medical evidence grades)
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("citation_project_idx").on(table.projectId),
  pmidIdx: index("citation_pmid_idx").on(table.pmid),
}));

export const insertBookCitationSchema = createInsertSchema(bookCitations).omit({
  id: true,
  createdAt: true,
});

export type InsertBookCitation = z.infer<typeof insertBookCitationSchema>;
export type BookCitation = typeof bookCitations.$inferSelect;

// Production Queue - Batch book production management
export const productionQueue = pgTable("production_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Queue Configuration
  queueName: varchar("queue_name").notNull(),
  booksPerDay: integer("books_per_day").default(10),
  intelligenceTier: varchar("intelligence_tier").default("standard"),
  
  // Queue Status
  status: varchar("status").default("active"), // "active", "paused", "completed", "cancelled"
  totalBooks: integer("total_books").default(0),
  completedBooks: integer("completed_books").default(0),
  failedBooks: integer("failed_books").default(0),
  
  // Scheduling
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  nextRunAt: timestamp("next_run_at"),
  
  // Book Templates (JSON array)
  bookTemplates: jsonb("book_templates"), // Array of { templateId, count, customConfig }
  
  // Cost Tracking
  totalEstimatedCost: decimal("total_estimated_cost", { precision: 12, scale: 2 }),
  totalActualCost: decimal("total_actual_cost", { precision: 12, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("queue_user_idx").on(table.userId),
  statusIdx: index("queue_status_idx").on(table.status),
}));

export const insertProductionQueueSchema = createInsertSchema(productionQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProductionQueue = z.infer<typeof insertProductionQueueSchema>;
export type ProductionQueue = typeof productionQueue.$inferSelect;

// Book Production Templates - Pre-configured book types
export const bookProductionTemplates = pgTable("book_production_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  
  // Template Identity
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // "memoir", "medical", "childrens", "business", "educational"
  
  // Book Structure
  targetWordCount: integer("target_word_count").default(50000),
  chapterCount: integer("chapter_count").default(10),
  chapterStructure: jsonb("chapter_structure"), // Array of chapter templates
  
  // Content Guidelines
  toneGuidelines: text("tone_guidelines"),
  styleGuidelines: text("style_guidelines"),
  audienceDescription: text("audience_description"),
  
  // Image Configuration
  includeImages: boolean("include_images").default(true),
  imageStyle: varchar("image_style").default("realistic"), // "realistic", "illustration", "watercolor", "medical"
  imagesPerChapter: integer("images_per_chapter").default(2),
  imagePlacement: varchar("image_placement").default("auto"), // "auto", "chapter_start", "contextual"
  
  // Data Visualization (for guides/educational)
  includeCharts: boolean("include_charts").default(false),
  includeGraphs: boolean("include_graphs").default(false),
  includeTables: boolean("include_tables").default(false),
  includeBulletPoints: boolean("include_bullet_points").default(true),
  
  // Citations (for medical/academic)
  requireCitations: boolean("require_citations").default(false),
  citationStyle: varchar("citation_style").default("ama"),
  minCitationsPerChapter: integer("min_citations_per_chapter").default(0),
  
  // Agent Pipeline Configuration
  agentPipeline: jsonb("agent_pipeline"), // Array of { agentRole, provider, model, config }
  
  // Pricing
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).default("50.00"),
  perWordCost: decimal("per_word_cost", { precision: 10, scale: 6 }).default("0.001"),
  
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookProductionTemplateSchema = createInsertSchema(bookProductionTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertBookProductionTemplate = z.infer<typeof insertBookProductionTemplateSchema>;
export type BookProductionTemplate = typeof bookProductionTemplates.$inferSelect;

// ============================================================================
// VOICE PROFILES & STYLE LEARNING - Learn user's voice, store forever
// ============================================================================

// Voice Profiles - Stores user's learned writing style
export const voiceProfiles = pgTable("voice_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Profile Identity
  profileName: varchar("profile_name").notNull(),
  isDefault: boolean("is_default").default(false),
  
  // Voice Characteristics (learned from samples)
  vocabularyLevel: varchar("vocabulary_level"), // "simple", "intermediate", "advanced", "technical"
  sentenceComplexity: varchar("sentence_complexity"), // "short", "medium", "long", "varied"
  toneProfile: jsonb("tone_profile"), // { primary: "conversational", secondary: ["inspirational", "authoritative"] }
  emotionalRange: jsonb("emotional_range"), // { intensity: 0-100, types: ["hope", "determination", "empathy"] }
  formalityLevel: integer("formality_level"), // 0-100 (casual to formal)
  
  // Writing Patterns
  avgSentenceLength: decimal("avg_sentence_length", { precision: 5, scale: 2 }),
  avgParagraphLength: decimal("avg_paragraph_length", { precision: 5, scale: 2 }),
  dialogueFrequency: integer("dialogue_frequency"), // 0-100 (% of content that's dialogue)
  metaphorUsage: integer("metaphor_usage"), // 0-100
  humorLevel: integer("humor_level"), // 0-100
  
  // Signature Elements
  favoriteWords: text("favorite_words").array(), // Words user uses frequently
  favoritePhrases: text("favorite_phrases").array(), // Phrases user repeats
  avoidWords: text("avoid_words").array(), // Words to never use
  styleMarkers: jsonb("style_markers"), // Unique identifiers of their style
  
  // Voice Embeddings (for AI matching)
  voiceEmbedding: jsonb("voice_embedding"), // Vector embedding of their style
  embeddingModel: varchar("embedding_model").default("gemini"),
  
  // Training Data
  sampleCount: integer("sample_count").default(0),
  totalWordsAnalyzed: integer("total_words_analyzed").default(0),
  lastTrainedAt: timestamp("last_trained_at"),
  
  // Quality Metrics
  confidenceScore: integer("confidence_score"), // 0-100 (how well we know their style)
  consistencyScore: integer("consistency_score"), // 0-100 (how consistent samples are)
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("voice_profile_user_idx").on(table.userId),
  defaultIdx: index("voice_profile_default_idx").on(table.isDefault),
}));

export const insertVoiceProfileSchema = createInsertSchema(voiceProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVoiceProfile = z.infer<typeof insertVoiceProfileSchema>;
export type VoiceProfile = typeof voiceProfiles.$inferSelect;

// Style Training Sessions - Conversational learning history
export const styleTrainingSessions = pgTable("style_training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  voiceProfileId: varchar("voice_profile_id").references(() => voiceProfiles.id),
  
  // Session Info
  sessionType: varchar("session_type").notNull(), // "conversation", "sample_upload", "guided_interview", "book_analysis"
  status: varchar("status").default("active"), // "active", "completed", "abandoned"
  
  // Conversation History
  messages: jsonb("messages"), // Array of { role, content, timestamp, analysis }
  
  // Samples Provided
  writingSamples: jsonb("writing_samples"), // Array of { text, source, wordCount, analyzedAt }
  
  // Analysis Results
  analysisResults: jsonb("analysis_results"), // Detailed breakdown from each sample
  styleInsights: jsonb("style_insights"), // Key learnings from session
  
  // Progress
  samplesAnalyzed: integer("samples_analyzed").default(0),
  wordsAnalyzed: integer("words_analyzed").default(0),
  questionsAsked: integer("questions_asked").default(0),
  questionsAnswered: integer("questions_answered").default(0),
  
  // AI Provider Used
  aiProvider: varchar("ai_provider").default("gemini"),
  tokensUsed: integer("tokens_used").default(0),
  
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("style_session_user_idx").on(table.userId),
  profileIdx: index("style_session_profile_idx").on(table.voiceProfileId),
}));

export const insertStyleTrainingSessionSchema = createInsertSchema(styleTrainingSessions).omit({
  id: true,
  startedAt: true,
});

export type InsertStyleTrainingSession = z.infer<typeof insertStyleTrainingSessionSchema>;
export type StyleTrainingSession = typeof styleTrainingSessions.$inferSelect;

// ============================================================================
// INDUSTRY KNOWLEDGE BASES - Dynamic knowledge for any industry
// ============================================================================

export const industryKnowledgeBases = pgTable("industry_knowledge_bases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Identity
  industrySlug: varchar("industry_slug").notNull().unique(), // "stroke_recovery", "dropfoot", "laundromat", "restaurant"
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  
  // Knowledge Content
  coreKnowledge: text("core_knowledge"), // Main knowledge base text
  terminology: jsonb("terminology"), // Industry-specific terms and definitions
  statistics: jsonb("statistics"), // Key stats and data points
  bestPractices: jsonb("best_practices"), // Array of best practices
  commonMistakes: jsonb("common_mistakes"), // Mistakes to avoid
  
  // Content Templates
  bookTemplates: jsonb("book_templates"), // Pre-built book structures for this industry
  chapterTemplates: jsonb("chapter_templates"), // Chapter ideas
  contentPrompts: jsonb("content_prompts"), // Writing prompts
  
  // SEO & Keywords
  primaryKeywords: text("primary_keywords").array(),
  longTailKeywords: text("long_tail_keywords").array(),
  questionKeywords: text("question_keywords").array(), // "How to...", "What is..."
  
  // Related Industries (for auto-pivot)
  relatedIndustries: text("related_industries").array(), // Other industries that relate
  pivotSuggestions: jsonb("pivot_suggestions"), // How to pivot content to related industries
  
  // Vector Embeddings
  knowledgeEmbedding: jsonb("knowledge_embedding"),
  embeddingModel: varchar("embedding_model").default("gemini"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("industry_kb_slug_idx").on(table.industrySlug),
}));

export const insertIndustryKnowledgeBaseSchema = createInsertSchema(industryKnowledgeBases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIndustryKnowledgeBase = z.infer<typeof insertIndustryKnowledgeBaseSchema>;
export type IndustryKnowledgeBase = typeof industryKnowledgeBases.$inferSelect;

// ============================================================================
// SERP & KEYWORD RESEARCH - Find what people search for
// ============================================================================

export const keywordResearchJobs = pgTable("keyword_research_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Job Configuration
  seedKeywords: text("seed_keywords").array().notNull(),
  industryId: varchar("industry_id").references(() => industryKnowledgeBases.id),
  location: varchar("location").default("United States"),
  language: varchar("language").default("en"),
  depth: integer("depth").default(2), // How many levels to expand
  
  // Status
  status: varchar("status").default("pending"), // "pending", "running", "completed", "failed"
  progress: integer("progress").default(0), // 0-100
  
  // Results Summary
  keywordsFound: integer("keywords_found").default(0),
  questionsFound: integer("questions_found").default(0),
  relatedSearchesFound: integer("related_searches_found").default(0),
  
  // API Usage
  apiProvider: varchar("api_provider").default("serpapi"),
  apiCallsMade: integer("api_calls_made").default(0),
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("keyword_job_user_idx").on(table.userId),
  statusIdx: index("keyword_job_status_idx").on(table.status),
}));

export const insertKeywordResearchJobSchema = createInsertSchema(keywordResearchJobs).omit({
  id: true,
  createdAt: true,
});

export type InsertKeywordResearchJob = z.infer<typeof insertKeywordResearchJobSchema>;
export type KeywordResearchJob = typeof keywordResearchJobs.$inferSelect;

// SERP Results Cache
export const serpResultsCache = pgTable("serp_results_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => keywordResearchJobs.id),
  
  // Query Info
  keyword: text("keyword").notNull(),
  queryType: varchar("query_type").default("search"), // "search", "questions", "trends"
  location: varchar("location"),
  
  // SERP Data
  organicResults: jsonb("organic_results"), // Array of { position, title, url, snippet }
  relatedSearches: jsonb("related_searches"), // Array of { query }
  peopleAlsoAsk: jsonb("people_also_ask"), // Array of { question, snippet }
  serpFeatures: jsonb("serp_features"), // { featuredSnippet, localPack, knowledgePanel, etc. }
  
  // Metrics
  searchVolume: integer("search_volume"),
  difficulty: integer("difficulty"), // 0-100
  cpc: decimal("cpc", { precision: 10, scale: 2 }),
  
  // Content Opportunity Scoring
  opportunityScore: integer("opportunity_score"), // 0-100 (how good for content)
  contentSuggestions: jsonb("content_suggestions"), // AI-generated content ideas
  
  // Cache Management
  expiresAt: timestamp("expires_at"),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => ({
  keywordIdx: index("serp_cache_keyword_idx").on(table.keyword),
  jobIdx: index("serp_cache_job_idx").on(table.jobId),
}));

export const insertSerpResultsCacheSchema = createInsertSchema(serpResultsCache).omit({
  id: true,
  fetchedAt: true,
});

export type InsertSerpResultsCache = z.infer<typeof insertSerpResultsCacheSchema>;
export type SerpResultsCache = typeof serpResultsCache.$inferSelect;

// ============================================================================
// GSC METRICS - Google Search Console tracking
// ============================================================================

export const gscProperties = pgTable("gsc_properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Property Info
  siteUrl: text("site_url").notNull(),
  propertyType: varchar("property_type").default("domain"), // "domain", "url_prefix"
  
  // OAuth
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  
  // Sync Status
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: varchar("sync_status").default("pending"), // "pending", "syncing", "synced", "error"
  syncError: text("sync_error"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("gsc_property_user_idx").on(table.userId),
}));

export const insertGscPropertySchema = createInsertSchema(gscProperties).omit({
  id: true,
  createdAt: true,
});

export type InsertGscProperty = z.infer<typeof insertGscPropertySchema>;
export type GscProperty = typeof gscProperties.$inferSelect;

// GSC Query Metrics
export const gscQueryMetrics = pgTable("gsc_query_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => gscProperties.id).notNull(),
  
  // Query Data
  query: text("query").notNull(),
  page: text("page"),
  country: varchar("country"),
  device: varchar("device"), // "desktop", "mobile", "tablet"
  
  // Metrics
  clicks: integer("clicks").default(0),
  impressions: integer("impressions").default(0),
  ctr: decimal("ctr", { precision: 5, scale: 4 }), // 0.0000 to 1.0000
  position: decimal("position", { precision: 5, scale: 2 }),
  
  // Time Period
  date: varchar("date").notNull(), // YYYY-MM-DD
  
  // Trend Data
  positionChange: decimal("position_change", { precision: 5, scale: 2 }), // vs previous period
  clicksChange: integer("clicks_change"),
  impressionsChange: integer("impressions_change"),
  
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index("gsc_metrics_property_idx").on(table.propertyId),
  queryIdx: index("gsc_metrics_query_idx").on(table.query),
  dateIdx: index("gsc_metrics_date_idx").on(table.date),
}));

export const insertGscQueryMetricsSchema = createInsertSchema(gscQueryMetrics).omit({
  id: true,
  recordedAt: true,
});

export type InsertGscQueryMetrics = z.infer<typeof insertGscQueryMetricsSchema>;
export type GscQueryMetrics = typeof gscQueryMetrics.$inferSelect;

// ============================================================================
// WEB TEMPLATES - Cached templates for quick page building
// ============================================================================

export const webPageTemplates = pgTable("web_page_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Template Identity
  templateSlug: varchar("template_slug").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // "landing", "book", "course", "blog", "sales"
  
  // Template Content
  htmlStructure: text("html_structure"), // Base HTML template
  cssStyles: text("css_styles"), // Scoped CSS
  jsScripts: text("js_scripts"), // Optional JS
  
  // Dynamic Blocks
  contentBlocks: jsonb("content_blocks"), // Array of { id, type, defaultContent, placeholder }
  
  // Customization Options
  colorSchemes: jsonb("color_schemes"), // Available color palettes
  fontOptions: jsonb("font_options"), // Font combinations
  layoutOptions: jsonb("layout_options"), // Different layouts
  
  // SEO Template
  metaTitleTemplate: varchar("meta_title_template"),
  metaDescriptionTemplate: text("meta_description_template"),
  schemaTemplate: jsonb("schema_template"), // Schema.org template
  
  // Preview
  thumbnailUrl: text("thumbnail_url"),
  previewUrl: text("preview_url"),
  
  // Usage Stats
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  
  isActive: boolean("is_active").default(true),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("web_template_slug_idx").on(table.templateSlug),
  categoryIdx: index("web_template_category_idx").on(table.category),
}));

export const insertWebPageTemplateSchema = createInsertSchema(webPageTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertWebPageTemplate = z.infer<typeof insertWebPageTemplateSchema>;
export type WebPageTemplate = typeof webPageTemplates.$inferSelect;

// ============================================================================
// AUTO-INDEXING - IndexNow & Google Indexing API
// ============================================================================

export const indexingEvents = pgTable("indexing_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // URL Info
  url: text("url").notNull(),
  urlType: varchar("url_type"), // "book", "course", "blog", "page"
  
  // Indexing Status
  indexNowStatus: varchar("index_now_status").default("pending"), // "pending", "submitted", "success", "failed"
  indexNowSubmittedAt: timestamp("index_now_submitted_at"),
  indexNowResponse: jsonb("index_now_response"),
  
  googleIndexStatus: varchar("google_index_status").default("pending"),
  googleIndexSubmittedAt: timestamp("google_index_submitted_at"),
  googleIndexResponse: jsonb("google_index_response"),
  
  // Search Engines Notified
  bingNotified: boolean("bing_notified").default(false),
  yandexNotified: boolean("yandex_notified").default(false),
  duckDuckGoNotified: boolean("duck_duck_go_notified").default(false),
  
  // Verification
  isIndexed: boolean("is_indexed").default(false),
  indexedAt: timestamp("indexed_at"),
  lastCheckedAt: timestamp("last_checked_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  urlIdx: index("indexing_url_idx").on(table.url),
  statusIdx: index("indexing_status_idx").on(table.indexNowStatus),
}));

export const insertIndexingEventSchema = createInsertSchema(indexingEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertIndexingEvent = z.infer<typeof insertIndexingEventSchema>;
export type IndexingEvent = typeof indexingEvents.$inferSelect;

// ============================================================================
// DIGITAL PRODUCT LISTINGS - Sell books & courses (StrokeRecoveryAcademy)
// ============================================================================

export const digitalProductListings = pgTable("digital_product_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Product Info
  productType: varchar("product_type").notNull(), // "book", "course", "bundle", "template"
  title: varchar("title").notNull(),
  subtitle: varchar("subtitle"),
  description: text("description"),
  
  // Linked Artifacts
  projectId: varchar("project_id").references(() => ghostwritingProjects.id),
  bookId: varchar("book_id"), // If a published book
  courseId: varchar("course_id"), // If a course
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }), // Original price for discounts
  
  // Stripe Integration
  stripeProductId: varchar("stripe_product_id"),
  stripePriceId: varchar("stripe_price_id"),
  
  // Files/Delivery
  deliveryType: varchar("delivery_type").default("download"), // "download", "access", "email"
  downloadFiles: jsonb("download_files"), // Array of { fileName, url, format }
  accessUrl: text("access_url"), // For course access
  
  // Listing Details
  coverImageUrl: text("cover_image_url"),
  previewUrl: text("preview_url"),
  sampleChapters: jsonb("sample_chapters"), // Free preview content
  
  // SEO
  slug: varchar("slug").unique(),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  
  // Categories & Tags
  category: varchar("category"), // "stroke_recovery", "medical", "self_help", "business"
  tags: text("tags").array(),
  
  // Sales Stats
  salesCount: integer("sales_count").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0.00"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  
  // Status
  status: varchar("status").default("draft"), // "draft", "published", "archived"
  publishedAt: timestamp("published_at"),
  
  // Indexing
  isIndexed: boolean("is_indexed").default(false),
  indexedAt: timestamp("indexed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("digital_product_user_idx").on(table.userId),
  slugIdx: index("digital_product_slug_idx").on(table.slug),
  statusIdx: index("digital_product_status_idx").on(table.status),
  categoryIdx: index("digital_product_category_idx").on(table.category),
}));

export const insertDigitalProductListingSchema = createInsertSchema(digitalProductListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDigitalProductListing = z.infer<typeof insertDigitalProductListingSchema>;
export type DigitalProductListing = typeof digitalProductListings.$inferSelect;

// ============================================================================
// CONTENT PIPELINES - Multi-agent production orchestration
// ============================================================================

export const contentPipelines = pgTable("content_pipelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Pipeline Config
  pipelineName: varchar("pipeline_name").notNull(),
  pipelineType: varchar("pipeline_type").notNull(), // "book", "course", "screenplay", "doctrine", "blog_series"
  
  // Target Output
  targetFormat: varchar("target_format").notNull(), // "manuscript", "course_modules", "screenplay_format"
  targetWordCount: integer("target_word_count"),
  targetChapters: integer("target_chapters"),
  
  // Voice & Style
  voiceProfileId: varchar("voice_profile_id").references(() => voiceProfiles.id),
  industryId: varchar("industry_id").references(() => industryKnowledgeBases.id),
  
  // Agent Configuration
  agentPipeline: jsonb("agent_pipeline"), // Array of { agentRole, provider, model, priority }
  
  // Intelligence Tier
  intelligenceTier: varchar("intelligence_tier").default("standard"), // "economy", "standard", "premium", "ultra"
  
  // Settings
  includeImages: boolean("include_images").default(true),
  includeCitations: boolean("include_citations").default(false),
  includeCharts: boolean("include_charts").default(false),
  
  // Cost Estimation
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("pipeline_user_idx").on(table.userId),
}));

export const insertContentPipelineSchema = createInsertSchema(contentPipelines).omit({
  id: true,
  createdAt: true,
});

export type InsertContentPipeline = z.infer<typeof insertContentPipelineSchema>;
export type ContentPipeline = typeof contentPipelines.$inferSelect;

// Pipeline Runs - Individual execution instances
export const pipelineRuns = pgTable("pipeline_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pipelineId: varchar("pipeline_id").references(() => contentPipelines.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Run Configuration
  inputPrompt: text("input_prompt"), // User's brief/topic
  inputData: jsonb("input_data"), // Any additional input data
  
  // Status
  status: varchar("status").default("queued"), // "queued", "running", "paused", "completed", "failed"
  currentStage: varchar("current_stage"), // Current agent stage
  progress: integer("progress").default(0), // 0-100
  
  // Agent Execution Log
  agentLog: jsonb("agent_log"), // Array of { agent, startedAt, completedAt, tokensUsed, output }
  
  // Output
  outputArtifacts: jsonb("output_artifacts"), // Array of { type, url, size }
  generatedContent: text("generated_content"), // Full manuscript/content
  
  // Metrics
  totalTokensUsed: integer("total_tokens_used").default(0),
  totalCost: decimal("total_cost", { precision: 10, scale: 4 }).default("0.0000"),
  generationTimeSeconds: integer("generation_time_seconds"),
  
  // Quality
  qualityScore: integer("quality_score"), // 0-100
  humanReviewStatus: varchar("human_review_status").default("pending"), // "pending", "approved", "needs_revision"
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pipelineIdx: index("run_pipeline_idx").on(table.pipelineId),
  userIdx: index("run_user_idx").on(table.userId),
  statusIdx: index("run_status_idx").on(table.status),
}));

export const insertPipelineRunSchema = createInsertSchema(pipelineRuns).omit({
  id: true,
  createdAt: true,
});

export type InsertPipelineRun = z.infer<typeof insertPipelineRunSchema>;
export type PipelineRun = typeof pipelineRuns.$inferSelect;

// ============================================================================
// ADVERTISING & SPONSORSHIP SYSTEM
// ============================================================================

// Advertising Products/Tiers
export const advertisingProducts = pgTable("advertising_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Product Info
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // "facebook_group", "website", "book_feature", "vendor_licensing"
  
  // Pricing
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }),
  priceOneTime: decimal("price_one_time", { precision: 10, scale: 2 }),
  pricingType: varchar("pricing_type").notNull(), // "monthly", "one_time", "custom"
  
  // Stripe
  stripePriceIdMonthly: varchar("stripe_price_id_monthly"),
  stripePriceIdOneTime: varchar("stripe_price_id_one_time"),
  stripeProductId: varchar("stripe_product_id"),
  
  // Features
  features: jsonb("features"), // Array of feature strings
  
  // Display
  popular: boolean("popular").default(false),
  displayOrder: integer("display_order").default(0),
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdvertisingProductSchema = createInsertSchema(advertisingProducts).omit({
  id: true,
  createdAt: true,
});

export type InsertAdvertisingProduct = z.infer<typeof insertAdvertisingProductSchema>;
export type AdvertisingProduct = typeof advertisingProducts.$inferSelect;

// Sponsor/Advertiser Accounts
export const sponsors = pgTable("sponsors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Company Info
  companyName: varchar("company_name").notNull(),
  contactName: varchar("contact_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  website: varchar("website"),
  
  // Branding
  logoUrl: varchar("logo_url"),
  tagline: varchar("tagline"),
  description: text("description"),
  
  // Stripe
  stripeCustomerId: varchar("stripe_customer_id"),
  
  // Status
  status: varchar("status").default("pending"), // "pending", "active", "suspended", "cancelled"
  verifiedAt: timestamp("verified_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type Sponsor = typeof sponsors.$inferSelect;

// Sponsorship Subscriptions
export const sponsorships = pgTable("sponsorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").references(() => sponsors.id).notNull(),
  productId: varchar("product_id").references(() => advertisingProducts.id).notNull(),
  
  // Stripe Subscription
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  
  // Billing
  billingCycle: varchar("billing_cycle"), // "monthly", "annual", "one_time"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  
  // Status
  status: varchar("status").default("pending"), // "pending", "active", "paused", "cancelled", "expired"
  
  // Dates
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  
  // Content
  customContent: jsonb("custom_content"), // Featured post content, logo placement details, etc.
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sponsorIdx: index("sponsorship_sponsor_idx").on(table.sponsorId),
  statusIdx: index("sponsorship_status_idx").on(table.status),
}));

export const insertSponsorshipSchema = createInsertSchema(sponsorships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type Sponsorship = typeof sponsorships.$inferSelect;

// Book Case Study Features
export const bookCaseStudies = pgTable("book_case_studies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").references(() => sponsors.id).notNull(),
  
  // Case Study Info
  title: varchar("title").notNull(),
  businessName: varchar("business_name").notNull(),
  industry: varchar("industry"),
  location: varchar("location"),
  
  // Story
  challenge: text("challenge"),
  solution: text("solution"),
  results: text("results"),
  testimonial: text("testimonial"),
  
  // Media
  photos: jsonb("photos"), // Array of photo URLs
  videoUrl: varchar("video_url"),
  
  // Book Placement
  bookId: varchar("book_id"), // Reference to which book it will appear in
  chapterPlacement: varchar("chapter_placement"),
  
  // Payment
  sponsorshipId: varchar("sponsorship_id").references(() => sponsorships.id),
  feePaid: decimal("fee_paid", { precision: 10, scale: 2 }),
  
  // Status
  status: varchar("status").default("draft"), // "draft", "submitted", "approved", "published"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

export const insertBookCaseStudySchema = createInsertSchema(bookCaseStudies).omit({
  id: true,
  createdAt: true,
});

export type InsertBookCaseStudy = z.infer<typeof insertBookCaseStudySchema>;
export type BookCaseStudy = typeof bookCaseStudies.$inferSelect;

// Vendor Licensing
export const vendorLicenses = pgTable("vendor_licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").references(() => sponsors.id).notNull(),
  
  // License Info
  licenseType: varchar("license_type").notNull(), // "standard", "premium", "enterprise"
  territory: varchar("territory"), // Geographic territory
  exclusivity: boolean("exclusivity").default(false),
  
  // Product/Service
  productName: varchar("product_name").notNull(),
  productCategory: varchar("product_category"),
  productDescription: text("product_description"),
  
  // Terms
  licenseFee: decimal("license_fee", { precision: 10, scale: 2 }),
  royaltyPercent: decimal("royalty_percent", { precision: 5, scale: 2 }),
  termMonths: integer("term_months"),
  
  // Stripe
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  
  // Status
  status: varchar("status").default("pending"), // "pending", "active", "suspended", "expired"
  
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVendorLicenseSchema = createInsertSchema(vendorLicenses).omit({
  id: true,
  createdAt: true,
});

export type InsertVendorLicense = z.infer<typeof insertVendorLicenseSchema>;
export type VendorLicense = typeof vendorLicenses.$inferSelect;

// ============================================================================
// CALCULATOR MARKETPLACE SYSTEM
// Community-driven calculator creation, sharing, and monetization
// ============================================================================

// Calculator Templates - Main table for user-created calculators
export const calculatorTemplates = pgTable("calculator_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  
  // Basic Info
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  shortDescription: varchar("short_description"),
  category: varchar("category").notNull(), // "valuation", "roi", "operations", "finance", "marketing", "custom"
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Visuals
  thumbnailUrl: varchar("thumbnail_url"),
  iconName: varchar("icon_name"), // lucide icon name
  primaryColor: varchar("primary_color").default("#00A699"), // teal default
  
  // Configuration (stored as JSON)
  inputFields: jsonb("input_fields").$type<CalculatorFieldConfig[]>().notNull(),
  formulas: jsonb("formulas").$type<CalculatorFormulaConfig[]>().notNull(),
  outputCards: jsonb("output_cards").$type<CalculatorOutputConfig[]>().notNull(),
  charts: jsonb("charts").$type<CalculatorChartConfig[]>().default([]),
  tips: jsonb("tips").$type<string[]>().default([]),
  
  // Pricing
  pricingType: varchar("pricing_type").default("free"), // "free", "paid", "subscription"
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  stripePriceId: varchar("stripe_price_id"),
  
  // Stats
  viewCount: integer("view_count").default(0),
  useCount: integer("use_count").default(0),
  purchaseCount: integer("purchase_count").default(0),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  status: varchar("status").default("draft"), // "draft", "pending_review", "published", "rejected", "archived"
  featured: boolean("featured").default(false),
  
  // Version Control
  version: integer("version").default(1),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  creatorIdx: index("calc_template_creator_idx").on(table.creatorId),
  categoryIdx: index("calc_template_category_idx").on(table.category),
  statusIdx: index("calc_template_status_idx").on(table.status),
  slugIdx: uniqueIndex("calc_template_slug_idx").on(table.slug),
}));

// Calculator Field Configuration Type
export interface CalculatorFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'number' | 'currency' | 'percentage' | 'text' | 'select' | 'slider' | 'radio' | 'checkbox';
  defaultValue?: string | number | boolean;
  placeholder?: string;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  required?: boolean;
  order: number;
}

// Calculator Formula Configuration Type
export interface CalculatorFormulaConfig {
  id: string;
  name: string; // Variable name for result
  formula: string; // Mathematical formula using field names
  order: number; // Order of evaluation (for dependent formulas)
}

// Calculator Output Card Configuration Type
export interface CalculatorOutputConfig {
  id: string;
  name: string; // Reference to formula result
  label: string;
  format: 'currency' | 'number' | 'percentage' | 'text' | 'years' | 'months';
  decimals?: number;
  color: 'teal' | 'orange' | 'salmon' | 'green' | 'blue' | 'purple' | 'yellow' | 'pink';
  size: 'small' | 'medium' | 'large';
  highlight?: boolean;
  order: number;
}

// Calculator Chart Configuration Type
export interface CalculatorChartConfig {
  id: string;
  type: 'pie' | 'bar' | 'line' | 'gauge';
  title: string;
  dataKeys: string[]; // Formula result names to include
  colors?: string[];
  showLegend?: boolean;
}

export const insertCalculatorTemplateSchema = createInsertSchema(calculatorTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  viewCount: true,
  useCount: true,
  purchaseCount: true,
  avgRating: true,
  reviewCount: true,
});

export type InsertCalculatorTemplate = z.infer<typeof insertCalculatorTemplateSchema>;
export type CalculatorTemplate = typeof calculatorTemplates.$inferSelect;

// Calculator Reviews
export const calculatorReviews = pgTable("calculator_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  calculatorId: varchar("calculator_id").references(() => calculatorTemplates.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title"),
  content: text("content"),
  
  // Helpful votes
  helpfulCount: integer("helpful_count").default(0),
  
  // Moderation
  status: varchar("status").default("published"), // "pending", "published", "hidden"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  calculatorIdx: index("calc_review_calculator_idx").on(table.calculatorId),
  userIdx: index("calc_review_user_idx").on(table.userId),
}));

export const insertCalculatorReviewSchema = createInsertSchema(calculatorReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
});

export type InsertCalculatorReview = z.infer<typeof insertCalculatorReviewSchema>;
export type CalculatorReview = typeof calculatorReviews.$inferSelect;

// Calculator Usage Events (Analytics)
export const calculatorUsageEvents = pgTable("calculator_usage_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  calculatorId: varchar("calculator_id").references(() => calculatorTemplates.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // Nullable for anonymous
  
  eventType: varchar("event_type").notNull(), // "view", "calculate", "download_pdf", "share"
  
  // Context
  inputValues: jsonb("input_values"), // What values were used
  outputValues: jsonb("output_values"), // What results were generated
  
  // Meta
  sessionId: varchar("session_id"),
  userAgent: varchar("user_agent"),
  ipCountry: varchar("ip_country"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  calculatorIdx: index("calc_usage_calculator_idx").on(table.calculatorId),
  eventTypeIdx: index("calc_usage_event_type_idx").on(table.eventType),
  createdIdx: index("calc_usage_created_idx").on(table.createdAt),
}));

export const insertCalculatorUsageEventSchema = createInsertSchema(calculatorUsageEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertCalculatorUsageEvent = z.infer<typeof insertCalculatorUsageEventSchema>;
export type CalculatorUsageEvent = typeof calculatorUsageEvents.$inferSelect;

// Calculator Purchases (for paid calculators)
export const calculatorPurchases = pgTable("calculator_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  calculatorId: varchar("calculator_id").references(() => calculatorTemplates.id).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  
  // Payment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(), // 20%
  creatorEarnings: decimal("creator_earnings", { precision: 10, scale: 2 }).notNull(), // 80%
  currency: varchar("currency").default("USD"),
  
  // Stripe
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeSessionId: varchar("stripe_session_id"),
  
  // Status
  status: varchar("status").default("pending"), // "pending", "completed", "refunded", "disputed"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  calculatorIdx: index("calc_purchase_calculator_idx").on(table.calculatorId),
  buyerIdx: index("calc_purchase_buyer_idx").on(table.buyerId),
  creatorIdx: index("calc_purchase_creator_idx").on(table.creatorId),
}));

export const insertCalculatorPurchaseSchema = createInsertSchema(calculatorPurchases).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertCalculatorPurchase = z.infer<typeof insertCalculatorPurchaseSchema>;
export type CalculatorPurchase = typeof calculatorPurchases.$inferSelect;

// Creator Profiles (for marketplace)
export const creatorProfiles = pgTable("creator_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique().notNull(),
  
  // Profile
  displayName: varchar("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url"),
  websiteUrl: varchar("website_url"),
  linkedinUrl: varchar("linkedin_url"),
  
  // Expertise
  expertise: jsonb("expertise").$type<string[]>().default([]), // ["valuation", "operations", "finance"]
  yearsExperience: integer("years_experience"),
  
  // Stats
  totalCalculators: integer("total_calculators").default(0),
  totalSales: integer("total_sales").default(0),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0"),
  pendingEarnings: decimal("pending_earnings", { precision: 12, scale: 2 }).default("0"),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
  
  // Payout
  stripeConnectAccountId: varchar("stripe_connect_account_id"),
  payoutEnabled: boolean("payout_enabled").default(false),
  
  // Status
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: uniqueIndex("creator_profile_user_idx").on(table.userId),
}));

export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalCalculators: true,
  totalSales: true,
  totalEarnings: true,
  pendingEarnings: true,
  avgRating: true,
});

export type InsertCreatorProfile = z.infer<typeof insertCreatorProfileSchema>;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;

// Creator Payouts
export const creatorPayouts = pgTable("creator_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").references(() => creatorProfiles.id).notNull(),
  
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  
  // Stripe
  stripeTransferId: varchar("stripe_transfer_id"),
  stripePayoutId: varchar("stripe_payout_id"),
  
  // Status
  status: varchar("status").default("pending"), // "pending", "processing", "completed", "failed"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  creatorIdx: index("creator_payout_creator_idx").on(table.creatorId),
}));

export const insertCreatorPayoutSchema = createInsertSchema(creatorPayouts).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertCreatorPayout = z.infer<typeof insertCreatorPayoutSchema>;
export type CreatorPayout = typeof creatorPayouts.$inferSelect;

// ============================================================================
// WHITE-LABEL LAUNDROMAT PLATFORM
// Comprehensive business website builder with AI agents and integrations
// ============================================================================

// Business Profiles - White-label branding for each laundromat
export const businessProfiles = pgTable("business_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Business Identity
  businessName: varchar("business_name").notNull(),
  tagline: varchar("tagline"), // "Your neighborhood laundromat"
  description: text("description"),
  
  // Logo & Branding
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: varchar("primary_color").default("#C8A661"), // Gold
  secondaryColor: varchar("secondary_color").default("#1a2332"), // Navy
  accentColor: varchar("accent_color").default("#ffffff"),
  fontFamily: varchar("font_family").default("Inter"),
  
  // Contact Information
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default("USA"),
  
  // Business Hours
  businessHours: jsonb("business_hours"), // { monday: { open: "06:00", close: "22:00" }, ... }
  timezone: varchar("timezone").default("America/New_York"),
  
  // Social Media Links
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  googleMapsUrl: text("google_maps_url"),
  yelpUrl: text("yelp_url"),
  
  // Services Offered
  services: jsonb("services").$type<{
    name: string;
    description: string;
    price?: string;
    icon?: string;
    featured?: boolean;
  }[]>().default([]),
  
  // Pricing Configuration
  pricingMode: varchar("pricing_mode").default("per_pound"), // "flat_rate" or "per_pound"
  pricePerPound: decimal("price_per_pound", { precision: 10, scale: 2 }).default("1.75"),
  minimumWeight: integer("minimum_weight").default(10),
  rushSurcharge: integer("rush_surcharge").default(50), // Percentage
  flatRatePrices: jsonb("flat_rate_prices").$type<{
    small: string;
    medium: string;
    large: string;
    extraLarge: string;
  }>(),
  pickupDeliveryFee: decimal("pickup_delivery_fee", { precision: 10, scale: 2 }).default("5.00"),
  
  // Status
  isVerified: boolean("is_verified").default(false),
  isPublished: boolean("is_published").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("business_profiles_user_idx").on(table.userId),
}));

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
});

export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type BusinessProfile = typeof businessProfiles.$inferSelect;

// AI Agent Configurations - Chatbot for each business
export const aiAgentConfigs = pgTable("ai_agent_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessProfileId: varchar("business_profile_id").references(() => businessProfiles.id),
  
  // Agent Identity
  name: varchar("name").default("Store Assistant"),
  personality: varchar("personality").default("friendly"), // "friendly", "professional", "casual"
  avatarUrl: text("avatar_url"),
  
  // Knowledge Base
  knowledgeBase: text("knowledge_base"), // Custom FAQs and business info
  businessContext: text("business_context"), // Hours, services, policies, etc.
  
  // Capabilities
  canTakeOrders: boolean("can_take_orders").default(false),
  canSchedulePickups: boolean("can_schedule_pickups").default(false),
  canAnswerPricing: boolean("can_answer_pricing").default(true),
  canProvideFAQ: boolean("can_provide_faq").default(true),
  
  // Customization
  welcomeMessage: text("welcome_message").default("Hi! How can I help you today?"),
  awayMessage: text("away_message").default("We're currently closed. Leave a message and we'll get back to you!"),
  commonQuestions: jsonb("common_questions").$type<string[]>().default([]),
  
  // Appearance
  primaryColor: varchar("primary_color").default("#C8A661"),
  position: varchar("position").default("bottom-right"), // "bottom-right", "bottom-left"
  
  // Status
  isEnabled: boolean("is_enabled").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("ai_agent_configs_user_idx").on(table.userId),
  businessIdx: index("ai_agent_configs_business_idx").on(table.businessProfileId),
}));

export const insertAiAgentConfigSchema = createInsertSchema(aiAgentConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiAgentConfig = z.infer<typeof insertAiAgentConfigSchema>;
export type AiAgentConfig = typeof aiAgentConfigs.$inferSelect;

// User Integrations - Secure vault for third-party connections
export const userIntegrations = pgTable("user_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessProfileId: varchar("business_profile_id").references(() => businessProfiles.id),
  
  // Integration Type
  integrationType: varchar("integration_type").notNull(), // "facebook", "google_business", "quickbooks", "stripe", "twilio"
  integrationName: varchar("integration_name"), // User-friendly name
  
  // Connection Status
  isConnected: boolean("is_connected").default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  connectionError: text("connection_error"),
  
  // Encrypted Credentials (reference IDs - actual secrets stored in Replit Secrets)
  secretKeyRef: varchar("secret_key_ref"), // Reference to secret in vault, not the actual secret
  accessTokenRef: varchar("access_token_ref"),
  refreshTokenRef: varchar("refresh_token_ref"),
  
  // Integration-specific data
  externalAccountId: varchar("external_account_id"), // Facebook Page ID, Google Business ID, etc.
  externalAccountName: varchar("external_account_name"),
  metadata: jsonb("metadata"), // Additional integration-specific data
  
  // Permissions
  scopes: jsonb("scopes").$type<string[]>().default([]), // What permissions this integration has
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_integrations_user_idx").on(table.userId),
  typeIdx: index("user_integrations_type_idx").on(table.integrationType),
}));

export const insertUserIntegrationSchema = createInsertSchema(userIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isConnected: true,
  lastSyncedAt: true,
  connectionError: true,
});

export type InsertUserIntegration = z.infer<typeof insertUserIntegrationSchema>;
export type UserIntegration = typeof userIntegrations.$inferSelect;

// Service Cards - Website service sections
export const serviceCards = pgTable("service_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  projectId: varchar("project_id").references(() => siteProjects.id),
  businessProfileId: varchar("business_profile_id").references(() => businessProfiles.id),
  
  // Card Content
  title: varchar("title").notNull(),
  description: text("description"),
  icon: varchar("icon"), // Lucide icon name
  imageUrl: text("image_url"),
  
  // Pricing
  price: varchar("price"), // "$1.75/lb" or "$25 per load"
  pricingNote: varchar("pricing_note"), // "Starting at" or "From"
  
  // Call to Action
  ctaText: varchar("cta_text").default("Learn More"),
  ctaLink: varchar("cta_link"),
  
  // Display
  order: integer("order").default(0),
  isHighlighted: boolean("is_highlighted").default(false),
  isFeatured: boolean("is_featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("service_cards_user_idx").on(table.userId),
  projectIdx: index("service_cards_project_idx").on(table.projectId),
}));

export const insertServiceCardSchema = createInsertSchema(serviceCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServiceCard = z.infer<typeof insertServiceCardSchema>;
export type ServiceCard = typeof serviceCards.$inferSelect;

// Website Videos - Video content for websites
export const websiteVideos = pgTable("website_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  projectId: varchar("project_id").references(() => siteProjects.id),
  
  // Video Info
  title: varchar("title").notNull(),
  description: text("description"),
  
  // Video Source
  videoType: varchar("video_type").default("upload"), // "upload", "youtube", "vimeo", "embed"
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  
  // Metadata
  duration: integer("duration"), // In seconds
  fileSize: integer("file_size"), // In bytes
  
  // Display Settings
  autoplay: boolean("autoplay").default(false),
  loop: boolean("loop").default(false),
  muted: boolean("muted").default(true),
  
  // Status
  isPublished: boolean("is_published").default(true),
  order: integer("order").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("website_videos_user_idx").on(table.userId),
  projectIdx: index("website_videos_project_idx").on(table.projectId),
}));

export const insertWebsiteVideoSchema = createInsertSchema(websiteVideos).omit({
  id: true,
  createdAt: true,
});

export type InsertWebsiteVideo = z.infer<typeof insertWebsiteVideoSchema>;
export type WebsiteVideo = typeof websiteVideos.$inferSelect;

// Calculator Themes - White-label branding for calculators
export const calculatorThemes = pgTable("calculator_themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  calculatorId: varchar("calculator_id").references(() => calculatorTemplates.id),
  businessProfileId: varchar("business_profile_id").references(() => businessProfiles.id),
  
  // Branding
  name: varchar("name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color").default("#C8A661"),
  secondaryColor: varchar("secondary_color").default("#1a2332"),
  backgroundColor: varchar("background_color").default("#ffffff"),
  textColor: varchar("text_color").default("#1a2332"),
  
  // Typography
  fontFamily: varchar("font_family").default("Inter"),
  headingFont: varchar("heading_font").default("Inter"),
  
  // Custom CSS
  customCss: text("custom_css"),
  
  // Embed Settings
  showPoweredBy: boolean("show_powered_by").default(true), // "Powered by WashBizHub"
  embedToken: varchar("embed_token").unique(), // JWT token for embedding
  allowedDomains: jsonb("allowed_domains").$type<string[]>().default([]), // Domains where embed is allowed
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("calculator_themes_user_idx").on(table.userId),
  calculatorIdx: index("calculator_themes_calculator_idx").on(table.calculatorId),
}));

export const insertCalculatorThemeSchema = createInsertSchema(calculatorThemes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  embedToken: true,
});

export type InsertCalculatorTheme = z.infer<typeof insertCalculatorThemeSchema>;
export type CalculatorTheme = typeof calculatorThemes.$inferSelect;

// Online Orders - Orders placed through website/chatbot
export const onlineOrders = pgTable("online_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  businessProfileId: varchar("business_profile_id").references(() => businessProfiles.id).notNull(),
  
  // Order Info
  orderNumber: varchar("order_number").notNull(),
  orderType: varchar("order_type").notNull(), // "pickup", "dropoff", "delivery"
  status: varchar("status").default("pending"), // "pending", "confirmed", "in_progress", "ready", "completed", "cancelled"
  
  // Customer Info
  customerName: varchar("customer_name").notNull(),
  customerEmail: varchar("customer_email"),
  customerPhone: varchar("customer_phone"),
  
  // Service Details
  serviceType: varchar("service_type"), // "wash_fold", "dry_clean", "alterations", "ironing"
  items: jsonb("items").$type<{
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[]>().default([]),
  
  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  tax: decimal("tax", { precision: 10, scale: 2 }),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
  discount: decimal("discount", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  // Scheduling
  pickupDate: timestamp("pickup_date"),
  pickupTimeSlot: varchar("pickup_time_slot"),
  deliveryDate: timestamp("delivery_date"),
  deliveryTimeSlot: varchar("delivery_time_slot"),
  
  // Address
  pickupAddress: text("pickup_address"),
  deliveryAddress: text("delivery_address"),
  
  // Notes
  specialInstructions: text("special_instructions"),
  internalNotes: text("internal_notes"),
  
  // Source
  orderSource: varchar("order_source").default("website"), // "website", "chatbot", "phone", "walk_in"
  
  // Payment
  paymentStatus: varchar("payment_status").default("unpaid"), // "unpaid", "paid", "refunded"
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("online_orders_business_idx").on(table.businessProfileId),
  statusIdx: index("online_orders_status_idx").on(table.status),
  orderNumberIdx: uniqueIndex("online_orders_number_idx").on(table.orderNumber),
}));

export const insertOnlineOrderSchema = createInsertSchema(onlineOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOnlineOrder = z.infer<typeof insertOnlineOrderSchema>;
export type OnlineOrder = typeof onlineOrders.$inferSelect;

// ============================================================================
// ENTERPRISE SEO/AEO PLATFORM EXTENSIONS (Rivals SearchAtlas)
// ============================================================================

// Crawled Pages - Website audit data
export const crawledPages = pgTable("crawled_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => seoProjects.id).notNull(),
  
  // Page Info
  url: text("url").notNull(),
  canonicalUrl: text("canonical_url"),
  status: integer("status"), // HTTP status code (200, 301, 404, etc.)
  redirectUrl: text("redirect_url"), // If redirected
  
  // Content Analysis
  title: text("title"),
  metaDescription: text("meta_description"),
  h1: text("h1"),
  wordCount: integer("word_count"),
  
  // Technical SEO
  headings: jsonb("headings").$type<{
    h1Count: number;
    h2Count: number;
    h3Count: number;
    structure: string[];
  }>(),
  meta: jsonb("meta").$type<{
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    viewport?: string;
    charset?: string;
  }>(),
  
  // Core Web Vitals
  vitals: jsonb("vitals").$type<{
    lcp?: number; // Largest Contentful Paint (ms)
    fid?: number; // First Input Delay (ms)
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte (ms)
    speedScore?: number; // PageSpeed score 0-100
  }>(),
  
  // Images
  imagesWithoutAlt: integer("images_without_alt").default(0),
  totalImages: integer("total_images").default(0),
  
  // Links
  internalLinksCount: integer("internal_links_count").default(0),
  externalLinksCount: integer("external_links_count").default(0),
  brokenLinksCount: integer("broken_links_count").default(0),
  
  // Crawl Info
  depth: integer("depth").default(0), // Distance from homepage
  crawlTime: integer("crawl_time"), // Time to crawl in ms
  lastCrawledAt: timestamp("last_crawled_at").defaultNow().notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("crawled_pages_project_idx").on(table.projectId),
  urlIdx: index("crawled_pages_url_idx").on(table.url),
}));

export const insertCrawledPageSchema = createInsertSchema(crawledPages).omit({
  id: true,
  createdAt: true,
});

export type InsertCrawledPage = z.infer<typeof insertCrawledPageSchema>;
export type CrawledPage = typeof crawledPages.$inferSelect;

// Backlinks - Inbound link analysis
export const seoBacklinks = pgTable("seo_backlinks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => seoProjects.id).notNull(),
  
  // Link Details
  sourceUrl: text("source_url").notNull(), // Page linking TO us
  sourceDomain: text("source_domain").notNull(), // Domain of source
  targetUrl: text("target_url").notNull(), // Our page being linked
  anchorText: text("anchor_text"), // Link text
  
  // Link Attributes
  rel: text("rel"), // "dofollow", "nofollow", "sponsored", "ugc"
  isNofollow: boolean("is_nofollow").default(false).notNull(),
  linkType: text("link_type"), // "text", "image", "redirect"
  
  // Quality Metrics
  domainAuthority: integer("domain_authority"), // 0-100 (Moz-style)
  pageAuthority: integer("page_authority"), // 0-100
  spamScore: integer("spam_score"), // 0-100 (lower is better)
  linkQuality: text("link_quality"), // "high", "medium", "low", "toxic"
  
  // Discovery
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  isLive: boolean("is_live").default(true).notNull(),
  
  // Source (how we found this backlink)
  discoverySource: text("discovery_source"), // "commoncrawl", "crawler", "gsc", "manual"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("seo_backlinks_project_idx").on(table.projectId),
  sourceDomainIdx: index("seo_backlinks_source_domain_idx").on(table.sourceDomain),
}));

export const insertSeoBacklinkSchema = createInsertSchema(seoBacklinks).omit({
  id: true,
  createdAt: true,
});

export type InsertSeoBacklink = z.infer<typeof insertSeoBacklinkSchema>;
export type SeoBacklink = typeof seoBacklinks.$inferSelect;

// Audit Issues - SEO problems found
export const auditIssues = pgTable("audit_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => seoProjects.id).notNull(),
  pageId: varchar("page_id").references(() => crawledPages.id),
  
  // Issue Classification
  ruleId: varchar("rule_id").notNull(), // "missing_meta_description", "slow_lcp", "broken_link"
  severity: text("severity").notNull(), // "critical", "warning", "info"
  category: text("category").notNull(), // "technical", "content", "performance", "accessibility"
  
  // Issue Details
  title: text("title").notNull(), // "Missing meta description"
  description: text("description").notNull(), // Full explanation
  affectedUrl: text("affected_url"), // URL where issue was found
  affectedElement: text("affected_element"), // Element selector or HTML snippet
  
  // Impact
  estimatedImpact: text("estimated_impact"), // "high", "medium", "low"
  impactScore: integer("impact_score"), // 0-100
  
  // Fix Guidance
  howToFix: text("how_to_fix"), // Instructions to resolve
  autoFixable: boolean("auto_fixable").default(false).notNull(), // Can we auto-fix?
  fixCode: text("fix_code"), // Code snippet to fix
  
  // Status
  status: text("status").default("open"), // "open", "fixed", "ignored", "false_positive"
  fixedAt: timestamp("fixed_at"),
  ignoredReason: text("ignored_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("audit_issues_project_idx").on(table.projectId),
  severityIdx: index("audit_issues_severity_idx").on(table.severity),
  statusIdx: index("audit_issues_status_idx").on(table.status),
}));

export const insertAuditIssueSchema = createInsertSchema(auditIssues).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditIssue = z.infer<typeof insertAuditIssueSchema>;
export type AuditIssue = typeof auditIssues.$inferSelect;

// SEO Recommendations - AI-generated suggestions
export const seoRecommendations = pgTable("seo_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => seoProjects.id).notNull(),
  pageId: varchar("page_id").references(() => crawledPages.id),
  
  // Recommendation Type
  type: text("type").notNull(), // "content", "technical", "backlink", "keyword", "performance"
  priority: integer("priority").default(5), // 1-10 (10 = highest)
  
  // Recommendation Details
  title: text("title").notNull(),
  description: text("description").notNull(),
  rationale: text("rationale"), // Why this matters
  
  // Impact/Effort Matrix
  estimatedImpact: text("estimated_impact"), // "high", "medium", "low"
  estimatedEffort: text("estimated_effort"), // "quick_win", "moderate", "significant"
  
  // Implementation
  actionItems: jsonb("action_items").$type<string[]>(), // Step-by-step actions
  resourcesNeeded: jsonb("resources_needed").$type<string[]>(), // Tools/resources needed
  
  // Status
  status: text("status").default("pending"), // "pending", "in_progress", "completed", "dismissed"
  completedAt: timestamp("completed_at"),
  
  // AI Metadata
  aiGenerated: boolean("ai_generated").default(true).notNull(),
  aiProvider: text("ai_provider"), // "gemini", "anthropic", etc.
  confidence: integer("confidence"), // 0-100 AI confidence score
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("seo_recommendations_project_idx").on(table.projectId),
  typeIdx: index("seo_recommendations_type_idx").on(table.type),
  priorityIdx: index("seo_recommendations_priority_idx").on(table.priority),
}));

export const insertSeoRecommendationSchema = createInsertSchema(seoRecommendations).omit({
  id: true,
  createdAt: true,
});

export type InsertSeoRecommendation = z.infer<typeof insertSeoRecommendationSchema>;
export type SeoRecommendation = typeof seoRecommendations.$inferSelect;

// External Connections - WordPress/Shopify/Webhook integrations
export const externalConnections = pgTable("external_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  projectId: varchar("project_id").references(() => seoProjects.id),
  
  // Connection Info
  name: text("name").notNull(), // "Client ABC WordPress"
  type: text("type").notNull(), // "wordpress", "shopify", "webhook", "ghost", "medium"
  baseUrl: text("base_url").notNull(), // "https://clientabc.com"
  
  // Authentication (encrypted)
  authType: text("auth_type"), // "api_key", "oauth", "basic"
  auth: jsonb("auth").$type<{
    apiKey?: string;
    username?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  }>(),
  
  // Connection Status
  status: text("status").default("active"), // "active", "error", "disconnected"
  lastConnectedAt: timestamp("last_connected_at"),
  lastError: text("last_error"),
  
  // Settings
  settings: jsonb("settings").$type<{
    defaultCategory?: string;
    defaultAuthor?: string;
    autoPublish?: boolean;
    publishStatus?: "publish" | "draft" | "pending";
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("external_connections_user_idx").on(table.userId),
  typeIdx: index("external_connections_type_idx").on(table.type),
}));

export const insertExternalConnectionSchema = createInsertSchema(externalConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertExternalConnection = z.infer<typeof insertExternalConnectionSchema>;
export type ExternalConnection = typeof externalConnections.$inferSelect;

// SEO Publications - Content published to external sites
export const seoPublications = pgTable("seo_publications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  connectionId: varchar("connection_id").references(() => externalConnections.id).notNull(),
  blogPostId: varchar("blog_post_id").references(() => blogPosts.id),
  projectId: varchar("project_id").references(() => seoProjects.id),
  
  // External Post Info
  externalPostId: text("external_post_id"), // ID on external platform
  externalUrl: text("external_url"), // Published URL
  
  // Content (snapshot at time of publish)
  title: text("title").notNull(),
  slug: text("slug"),
  
  // Publication Status
  status: text("status").default("pending"), // "pending", "published", "failed", "deleted"
  publishedAt: timestamp("published_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  
  // Errors
  error: text("error"),
  retryCount: integer("retry_count").default(0),
  
  // Performance (if tracked)
  views: integer("views").default(0),
  engagement: jsonb("engagement").$type<{
    likes?: number;
    comments?: number;
    shares?: number;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  connectionIdx: index("seo_publications_connection_idx").on(table.connectionId),
  statusIdx: index("seo_publications_status_idx").on(table.status),
}));

export const insertSeoPublicationSchema = createInsertSchema(seoPublications).omit({
  id: true,
  createdAt: true,
});

export type InsertSeoPublication = z.infer<typeof insertSeoPublicationSchema>;
export type SeoPublication = typeof seoPublications.$inferSelect;

// Internal Link Graph - For site structure analysis
export const linkGraph = pgTable("link_graph", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => seoProjects.id).notNull(),
  
  // Link Relationship
  fromUrl: text("from_url").notNull(),
  toUrl: text("to_url").notNull(),
  anchorText: text("anchor_text"),
  
  // Link Attributes
  rel: text("rel"), // "follow", "nofollow", etc.
  isInternal: boolean("is_internal").default(true).notNull(),
  
  // Context
  context: text("context"), // "navigation", "content", "footer", "sidebar"
  surroundingText: text("surrounding_text"), // Text around the link
  
  discoveredAt: timestamp("discovered_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("link_graph_project_idx").on(table.projectId),
  fromUrlIdx: index("link_graph_from_url_idx").on(table.fromUrl),
  toUrlIdx: index("link_graph_to_url_idx").on(table.toUrl),
}));

export const insertLinkGraphSchema = createInsertSchema(linkGraph).omit({
  id: true,
  discoveredAt: true,
});

export type InsertLinkGraph = z.infer<typeof insertLinkGraphSchema>;
export type LinkGraph = typeof linkGraph.$inferSelect;

// SERP Snapshots - Historical ranking data for heatmaps
export const serpSnapshots = pgTable("serp_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => seoProjects.id).notNull(),
  keywordId: varchar("keyword_id").references(() => seoKeywords.id).notNull(),
  
  // Location (for geo heatmaps)
  locationName: text("location_name"), // "New York, NY" or "Austin, TX"
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  countryCode: varchar("country_code", { length: 2 }),
  
  // Ranking Data
  position: integer("position"), // 1-100 (null = not ranking)
  url: text("url"), // Which URL is ranking
  title: text("title"), // Title in SERP
  snippet: text("snippet"), // Description shown
  
  // SERP Features
  features: jsonb("features").$type<{
    hasFeaturedSnippet?: boolean;
    hasLocalPack?: boolean;
    hasPeopleAlsoAsk?: boolean;
    hasKnowledgePanel?: boolean;
    hasVideoCarousel?: boolean;
    hasImagePack?: boolean;
  }>(),
  
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (table) => ({
  projectKeywordIdx: index("serp_snapshots_project_keyword_idx").on(table.projectId, table.keywordId),
  fetchedAtIdx: index("serp_snapshots_fetched_at_idx").on(table.fetchedAt),
}));

export const insertSerpSnapshotSchema = createInsertSchema(serpSnapshots).omit({
  id: true,
  fetchedAt: true,
}).extend({
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type InsertSerpSnapshot = z.infer<typeof insertSerpSnapshotSchema>;
export type SerpSnapshot = typeof serpSnapshots.$inferSelect;

// Competitor Projects - Track competitor performance
export const seoCompetitors = pgTable("seo_competitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => seoProjects.id).notNull(),
  
  // Competitor Info
  domain: text("domain").notNull(),
  name: text("name"), // Friendly name
  
  // Metrics
  estimatedTraffic: integer("estimated_traffic"),
  domainAuthority: integer("domain_authority"),
  backlinksCount: integer("backlinks_count"),
  keywordsRanking: integer("keywords_ranking"), // Total keywords ranking for
  
  // Visibility Score (0-100)
  visibilityScore: integer("visibility_score"),
  
  // Last Analysis
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("seo_competitors_project_idx").on(table.projectId),
  domainIdx: index("seo_competitors_domain_idx").on(table.domain),
}));

export const insertSeoCompetitorSchema = createInsertSchema(seoCompetitors).omit({
  id: true,
  createdAt: true,
});

export type InsertSeoCompetitor = z.infer<typeof insertSeoCompetitorSchema>;
export type SeoCompetitor = typeof seoCompetitors.$inferSelect;

// ============================================================================
// AI CONTENT STUDIO - Conversational AI Content Creation Platform
// ============================================================================

// AI Conversations - Chat history with persistent memory
export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Conversation Context
  title: text("title").default("New Conversation"),
  type: text("type").default("general"), // "general", "blog", "book", "newsletter", "code"
  projectId: varchar("project_id"), // Link to content project if applicable
  
  // Conversation State
  messages: jsonb("messages").$type<Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>>().default([]),
  
  // Memory & Context
  systemPrompt: text("system_prompt"),
  memoryContext: jsonb("memory_context").$type<{
    topics: string[];
    preferences: Record<string, any>;
    recentActions: string[];
    userProfile?: Record<string, any>;
  }>(),
  
  // Token Usage
  totalTokensUsed: integer("total_tokens_used").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("ai_conversations_user_idx").on(table.userId),
  typeIdx: index("ai_conversations_type_idx").on(table.type),
}));

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

// Content Projects - Books, blogs, newsletters, etc.
export const contentProjects = pgTable("content_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Project Info
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "book", "blog_series", "newsletter", "course", "ebook"
  status: text("status").default("draft"), // "draft", "in_progress", "review", "published"
  
  // Content Structure
  content: jsonb("content").$type<{
    chapters?: Array<{
      id: string;
      title: string;
      content: string;
      order: number;
      wordCount: number;
    }>;
    metadata?: Record<string, any>;
    outline?: string[];
    notes?: string;
  }>(),
  
  // KDP/Publishing Settings
  kdpSettings: jsonb("kdp_settings").$type<{
    subtitle?: string;
    author?: string;
    isbn?: string;
    language?: string;
    keywords?: string[];
    categories?: string[];
    trimSize?: string;
    paperColor?: string;
    coverType?: string;
    pricing?: Record<string, number>;
    royaltyPlan?: "35" | "70";
    enrollInKdpSelect?: boolean;
  }>(),
  
  // Cover Image
  coverImageUrl: text("cover_image_url"),
  
  // Stats
  wordCount: integer("word_count").default(0),
  chapterCount: integer("chapter_count").default(0),
  lastEditedAt: timestamp("last_edited_at"),
  
  // Version Control
  version: integer("version").default(1),
  previousVersions: jsonb("previous_versions").$type<Array<{
    version: number;
    savedAt: string;
    changes: string;
  }>>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("content_projects_user_idx").on(table.userId),
  typeIdx: index("content_projects_type_idx").on(table.type),
  statusIdx: index("content_projects_status_idx").on(table.status),
}));

export const insertContentProjectSchema = createInsertSchema(contentProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertContentProject = z.infer<typeof insertContentProjectSchema>;
export type ContentProject = typeof contentProjects.$inferSelect;

// Generated Assets - Images, documents, exports
export const generatedAssets = pgTable("generated_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  projectId: varchar("project_id").references(() => contentProjects.id),
  conversationId: varchar("conversation_id").references(() => aiConversations.id),
  
  // Asset Info
  name: text("name").notNull(),
  type: text("type").notNull(), // "image", "pdf", "docx", "epub", "cover", "thumbnail"
  mimeType: text("mime_type"),
  
  // Storage
  url: text("url"), // Object storage URL
  base64Data: text("base64_data"), // For small inline assets
  fileSize: integer("file_size"),
  
  // Generation Details
  prompt: text("prompt"), // AI prompt used to generate
  model: text("model"), // AI model used
  
  // Metadata
  metadata: jsonb("metadata").$type<{
    width?: number;
    height?: number;
    format?: string;
    pageCount?: number;
    wordCount?: number;
    exportSettings?: Record<string, any>;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("generated_assets_user_idx").on(table.userId),
  projectIdx: index("generated_assets_project_idx").on(table.projectId),
  typeIdx: index("generated_assets_type_idx").on(table.type),
}));

export const insertGeneratedAssetSchema = createInsertSchema(generatedAssets).omit({
  id: true,
  createdAt: true,
});

export type InsertGeneratedAsset = z.infer<typeof insertGeneratedAssetSchema>;
export type GeneratedAsset = typeof generatedAssets.$inferSelect;

// Newsletter Email Contacts
export const emailContacts = pgTable("email_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Owner of this contact list
  
  // Contact Info
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  
  // Segmentation
  source: text("source"), // "website", "lead_magnet", "import", "manual"
  tags: text("tags").array(),
  segment: text("segment"), // "investor", "owner", "operator", "vendor"
  
  // Subscription Status
  status: text("status").default("subscribed"), // "subscribed", "unsubscribed", "bounced", "complained"
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  
  // Engagement
  lastOpenedAt: timestamp("last_opened_at"),
  lastClickedAt: timestamp("last_clicked_at"),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  
  // Lead Scoring
  leadScore: integer("lead_score").default(0),
  
  // Custom Fields
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("email_contacts_user_idx").on(table.userId),
  emailIdx: uniqueIndex("email_contacts_email_user_idx").on(table.email, table.userId),
  statusIdx: index("email_contacts_status_idx").on(table.status),
}));

export const insertEmailContactSchema = createInsertSchema(emailContacts).omit({
  id: true,
  createdAt: true,
});

export type InsertEmailContact = z.infer<typeof insertEmailContactSchema>;
export type EmailContact = typeof emailContacts.$inferSelect;

// AI Content Requests - Track AI usage and generations
export const aiContentRequests = pgTable("ai_content_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  conversationId: varchar("conversation_id").references(() => aiConversations.id),
  
  // Request Info
  type: text("type").notNull(), // "chat", "blog", "book_chapter", "image", "newsletter", "seo"
  prompt: text("prompt").notNull(),
  
  // AI Response
  response: text("response"),
  model: text("model").default("gemini-2.0-flash"),
  
  // Token Usage
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  
  // Status
  status: text("status").default("pending"), // "pending", "processing", "completed", "failed"
  error: text("error"),
  
  // Timing
  processingTimeMs: integer("processing_time_ms"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("ai_content_requests_user_idx").on(table.userId),
  typeIdx: index("ai_content_requests_type_idx").on(table.type),
  statusIdx: index("ai_content_requests_status_idx").on(table.status),
}));

export const insertAiContentRequestSchema = createInsertSchema(aiContentRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertAiContentRequest = z.infer<typeof insertAiContentRequestSchema>;
export type AiContentRequest = typeof aiContentRequests.$inferSelect;

// ============================================================================
// EQUIPMENT LISTINGS - Buy/Sell laundromat equipment
// ============================================================================

export const equipmentListings = pgTable("equipment_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Equipment Info
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "washer", "dryer", "changer", "folding_table", "cart", "vending", "other"
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number"),
  yearManufactured: integer("year_manufactured"),
  condition: text("condition").notNull(), // "new", "like_new", "good", "fair", "parts"
  
  // Specs
  capacity: text("capacity"), // "20lb", "30lb", etc.
  fuelType: text("fuel_type"), // "electric", "gas", "steam"
  voltage: text("voltage"), // "120V", "208V", "240V"
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  negotiable: boolean("negotiable").default(true),
  
  // Location
  city: text("city"),
  state: text("state"),
  country: text("country").default("US"),
  zipCode: text("zip_code"),
  
  // Media (images and videos)
  images: text("images").array(), // Array of image URLs
  videos: text("videos").array(), // Array of video URLs
  featuredImage: text("featured_image"),
  
  // Contact
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  preferredContact: text("preferred_contact").default("email"), // "email", "phone", "both"
  
  // Status
  status: text("status").default("active"), // "draft", "active", "sold", "expired"
  views: integer("views").default(0),
  inquiries: integer("inquiries").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("equipment_listings_user_idx").on(table.userId),
  categoryIdx: index("equipment_listings_category_idx").on(table.category),
  statusIdx: index("equipment_listings_status_idx").on(table.status),
}));

export const insertEquipmentListingSchema = createInsertSchema(equipmentListings).omit({
  id: true,
  views: true,
  inquiries: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEquipmentListing = z.infer<typeof insertEquipmentListingSchema>;
export type EquipmentListing = typeof equipmentListings.$inferSelect;

// ============================================================================
// SUPPLY LISTINGS - Buy/Sell laundromat supplies and products
// ============================================================================

export const supplyListings = pgTable("supply_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Product Info
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "detergent", "fabric_softener", "chemicals", "bags", "hangers", "signage", "other"
  brand: text("brand"),
  sku: text("sku"),
  
  // Quantity & Pricing
  quantity: integer("quantity").default(1),
  unit: text("unit").default("each"), // "each", "case", "gallon", "box", "pallet"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceType: text("price_type").default("each"), // "each", "per_case", "wholesale"
  currency: text("currency").default("USD"),
  minimumOrder: integer("minimum_order").default(1),
  
  // Condition
  condition: text("condition").default("new"), // "new", "open_box"
  expirationDate: timestamp("expiration_date"),
  
  // Location
  city: text("city"),
  state: text("state"),
  country: text("country").default("US"),
  shipsNationally: boolean("ships_nationally").default(true),
  localPickupOnly: boolean("local_pickup_only").default(false),
  
  // Media (images and videos)
  images: text("images").array(), // Array of image URLs
  videos: text("videos").array(), // Array of video URLs
  featuredImage: text("featured_image"),
  
  // Contact
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  
  // Status
  status: text("status").default("active"), // "draft", "active", "sold", "expired"
  views: integer("views").default(0),
  inquiries: integer("inquiries").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("supply_listings_user_idx").on(table.userId),
  categoryIdx: index("supply_listings_category_idx").on(table.category),
  statusIdx: index("supply_listings_status_idx").on(table.status),
}));

export const insertSupplyListingSchema = createInsertSchema(supplyListings).omit({
  id: true,
  views: true,
  inquiries: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplyListing = z.infer<typeof insertSupplyListingSchema>;
export type SupplyListing = typeof supplyListings.$inferSelect;

// ============================================================================
// CUSTOMER SELF-SERVICE PORTAL - Industry-Leading Customer Experience
// ============================================================================

export const customerPortalAccounts = pgTable("customer_portal_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  householdAccountId: varchar("household_account_id").references(() => householdAccounts.id),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Authentication
  email: varchar("email").notNull(),
  passwordHash: text("password_hash"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  
  // Profile
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phone: varchar("phone"),
  profileImage: text("profile_image"),
  
  // Address (for pickup/delivery)
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: varchar("zip"),
  deliveryInstructions: text("delivery_instructions"),
  
  // Loyalty Program
  loyaltyPoints: integer("loyalty_points").default(0),
  loyaltyTier: text("loyalty_tier").default("bronze"), // "bronze", "silver", "gold", "platinum"
  lifetimePoints: integer("lifetime_points").default(0),
  lifetimeSpend: decimal("lifetime_spend", { precision: 12, scale: 2 }).default("0.00"),
  
  // Subscription
  hasSubscription: boolean("has_subscription").default(false),
  subscriptionPlanId: varchar("subscription_plan_id"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  
  // Stripe
  stripeCustomerId: text("stripe_customer_id"),
  defaultPaymentMethodId: text("default_payment_method_id"),
  
  // Status
  status: text("status").default("active"), // "pending", "active", "suspended", "closed"
  lastLoginAt: timestamp("last_login_at"),
  loginCount: integer("login_count").default(0),
  
  // Referral
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  referralCount: integer("referral_count").default(0),
  
  // Communication Preferences
  smsNotifications: boolean("sms_notifications").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("customer_portal_email_idx").on(table.email),
  laundromatIdx: index("customer_portal_laundromat_idx").on(table.laundromatId),
  loyaltyTierIdx: index("customer_portal_loyalty_tier_idx").on(table.loyaltyTier),
  referralCodeIdx: index("customer_portal_referral_code_idx").on(table.referralCode),
}));

export const insertCustomerPortalAccountSchema = createInsertSchema(customerPortalAccounts).omit({
  id: true,
  loyaltyPoints: true,
  lifetimePoints: true,
  lifetimeSpend: true,
  loginCount: true,
  referralCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerPortalAccount = z.infer<typeof insertCustomerPortalAccountSchema>;
export type CustomerPortalAccount = typeof customerPortalAccounts.$inferSelect;

// Customer Preferences - Personalized laundry settings
export const customerPreferences = pgTable("customer_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPortalId: varchar("customer_portal_id").references(() => customerPortalAccounts.id).notNull(),
  
  // Detergent Preferences
  detergentType: text("detergent_type").default("standard"), // "standard", "hypoallergenic", "scent_free", "eco_friendly"
  detergentBrand: text("detergent_brand"),
  fabricSoftener: boolean("fabric_softener").default(true),
  fabricSoftenerType: text("fabric_softener_type"),
  
  // Wash Preferences
  waterTemperature: text("water_temperature").default("warm"), // "cold", "warm", "hot"
  dryerHeat: text("dryer_heat").default("medium"), // "low", "medium", "high", "air_dry"
  
  // Folding Preferences
  foldingStyle: text("folding_style").default("standard"), // "standard", "military", "hung", "rolled"
  hangDelicates: boolean("hang_delicates").default(true),
  separateColors: boolean("separate_colors").default(true),
  
  // Special Instructions
  allergies: text("allergies").array(),
  specialInstructions: text("special_instructions"),
  
  // Starch Preferences
  starchShirts: boolean("starch_shirts").default(false),
  starchLevel: text("starch_level").default("light"), // "light", "medium", "heavy"
  
  // Packaging
  packagingPreference: text("packaging_preference").default("folded_in_bag"), // "folded_in_bag", "on_hangers", "box"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  customerPortalIdx: index("customer_preferences_customer_idx").on(table.customerPortalId),
}));

export const insertCustomerPreferencesSchema = createInsertSchema(customerPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerPreferences = z.infer<typeof insertCustomerPreferencesSchema>;
export type CustomerPreferences = typeof customerPreferences.$inferSelect;

// Loyalty Transactions - Track points earned/redeemed
export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPortalId: varchar("customer_portal_id").references(() => customerPortalAccounts.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Transaction Details
  transactionType: text("transaction_type").notNull(), // "earned", "redeemed", "bonus", "expired", "adjusted"
  points: integer("points").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  
  // Reference
  referenceType: text("reference_type"), // "order", "referral", "promotion", "manual"
  referenceId: varchar("reference_id"),
  
  // Description
  description: text("description"),
  
  // Expiration (for earned points)
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  customerPortalIdx: index("loyalty_transactions_customer_idx").on(table.customerPortalId),
  laundromatIdx: index("loyalty_transactions_laundromat_idx").on(table.laundromatId),
  typeIdx: index("loyalty_transactions_type_idx").on(table.transactionType),
}));

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;

// ============================================================================
// REPAIR LOGS - Comprehensive Machine Service History (Industry First!)
// ============================================================================

export const repairLogs = pgTable("repair_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Repair Details
  repairNumber: text("repair_number").notNull().unique(),
  repairType: text("repair_type").notNull(), // "preventive", "corrective", "emergency", "installation", "upgrade"
  issueCategory: text("issue_category").notNull(), // "electrical", "mechanical", "plumbing", "electronic", "cosmetic", "software"
  
  // Issue Description
  issueTitle: text("issue_title").notNull(),
  issueDescription: text("issue_description"),
  symptomsReported: text("symptoms_reported").array(),
  errorCodes: text("error_codes").array(),
  
  // Severity
  severity: text("severity").default("medium"), // "low", "medium", "high", "critical"
  priority: integer("priority").default(5), // 1-10, 1 being highest
  
  // Resolution
  resolutionDescription: text("resolution_description"),
  rootCause: text("root_cause"),
  workPerformed: text("work_performed").array(),
  
  // Technician
  technicianId: varchar("technician_id"),
  technicianName: text("technician_name"),
  technicianCompany: text("technician_company"),
  
  // Timing
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Labor
  laborHours: decimal("labor_hours", { precision: 6, scale: 2 }),
  laborRate: decimal("labor_rate", { precision: 8, scale: 2 }),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  
  // Travel
  travelTime: decimal("travel_time", { precision: 4, scale: 2 }),
  travelCost: decimal("travel_cost", { precision: 8, scale: 2 }),
  
  // Parts (detailed in separate table, summary here)
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }).default("0.00"),
  
  // Total Cost
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).default("0.00"),
  
  // Warranty
  warrantyRepair: boolean("warranty_repair").default(false),
  warrantyClaimNumber: text("warranty_claim_number"),
  warrantyProvider: text("warranty_provider"),
  
  // Status
  status: text("status").default("open"), // "open", "assigned", "in_progress", "waiting_parts", "completed", "cancelled"
  
  // Follow-up
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  followUpNotes: text("follow_up_notes"),
  
  // Documentation
  photos: text("photos").array(),
  documents: text("documents").array(),
  
  // Machine readings at time of repair
  cycleCountAtRepair: integer("cycle_count_at_repair"),
  machineAgeAtRepair: integer("machine_age_days"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("repair_logs_machine_idx").on(table.machineId),
  laundromatIdx: index("repair_logs_laundromat_idx").on(table.laundromatId),
  statusIdx: index("repair_logs_status_idx").on(table.status),
  categoryIdx: index("repair_logs_category_idx").on(table.issueCategory),
  technicianIdx: index("repair_logs_technician_idx").on(table.technicianId),
}));

export const insertRepairLogSchema = createInsertSchema(repairLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRepairLog = z.infer<typeof insertRepairLogSchema>;
export type RepairLog = typeof repairLogs.$inferSelect;

// Repair Parts Used - Track every part in a repair
export const repairPartsUsed = pgTable("repair_parts_used", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repairLogId: varchar("repair_log_id").references(() => repairLogs.id).notNull(),
  partInventoryId: varchar("part_inventory_id").references(() => partsInventory.id),
  
  // Part Details
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  manufacturer: text("manufacturer"),
  
  // Quantity & Cost
  quantity: integer("quantity").default(1),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  
  // Source
  source: text("source").default("inventory"), // "inventory", "vendor_order", "warranty"
  vendorId: varchar("vendor_id"),
  vendorName: text("vendor_name"),
  
  // Warranty
  partWarrantyMonths: integer("part_warranty_months"),
  partWarrantyExpires: timestamp("part_warranty_expires"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  repairLogIdx: index("repair_parts_repair_idx").on(table.repairLogId),
  partInventoryIdx: index("repair_parts_inventory_idx").on(table.partInventoryId),
}));

export const insertRepairPartsUsedSchema = createInsertSchema(repairPartsUsed).omit({
  id: true,
  createdAt: true,
});

export type InsertRepairPartsUsed = z.infer<typeof insertRepairPartsUsedSchema>;
export type RepairPartsUsed = typeof repairPartsUsed.$inferSelect;

// ============================================================================
// PREDICTIVE MAINTENANCE AI - No Competitor Has This!
// ============================================================================

export const machinePredictiveMetrics = pgTable("machine_predictive_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Health Score (0-100)
  overallHealthScore: integer("overall_health_score").default(100),
  mechanicalScore: integer("mechanical_score").default(100),
  electricalScore: integer("electrical_score").default(100),
  componentScore: integer("component_score").default(100),
  
  // Failure Predictions
  predictedFailureDate: timestamp("predicted_failure_date"),
  failureProbability: decimal("failure_probability", { precision: 5, scale: 2 }), // 0.00 to 100.00
  mostLikelyFailureType: text("most_likely_failure_type"),
  predictedRepairCost: decimal("predicted_repair_cost", { precision: 10, scale: 2 }),
  
  // Maintenance Recommendations
  recommendedMaintenanceDate: timestamp("recommended_maintenance_date"),
  maintenancePriority: text("maintenance_priority").default("normal"), // "low", "normal", "high", "urgent"
  recommendedActions: text("recommended_actions").array(),
  
  // Cycle Analysis
  avgCyclesPerDay: decimal("avg_cycles_per_day", { precision: 8, scale: 2 }),
  cyclesTillMaintenance: integer("cycles_till_maintenance"),
  usagePattern: text("usage_pattern"), // "heavy", "normal", "light"
  
  // Component Tracking
  bearingWearLevel: decimal("bearing_wear_level", { precision: 5, scale: 2 }),
  beltCondition: text("belt_condition").default("good"), // "new", "good", "worn", "replace_soon", "critical"
  motorCondition: text("motor_condition").default("good"),
  pumpCondition: text("pump_condition").default("good"),
  drainCondition: text("drain_condition").default("good"),
  
  // Efficiency Metrics
  energyEfficiencyScore: integer("energy_efficiency_score").default(100),
  waterEfficiencyScore: integer("water_efficiency_score").default(100),
  estimatedMonthlyCost: decimal("estimated_monthly_cost", { precision: 10, scale: 2 }),
  
  // ROI Impact
  downTimeRisk: text("downtime_risk").default("low"), // "low", "medium", "high", "critical"
  estimatedRevenueLoss: decimal("estimated_revenue_loss", { precision: 10, scale: 2 }),
  
  // AI Model
  lastAnalyzedAt: timestamp("last_analyzed_at").defaultNow(),
  modelVersion: text("model_version").default("v1.0"),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }), // 0-100%
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("predictive_metrics_machine_idx").on(table.machineId),
  laundromatIdx: index("predictive_metrics_laundromat_idx").on(table.laundromatId),
  healthScoreIdx: index("predictive_metrics_health_idx").on(table.overallHealthScore),
  priorityIdx: index("predictive_metrics_priority_idx").on(table.maintenancePriority),
}));

export const insertMachinePredictiveMetricsSchema = createInsertSchema(machinePredictiveMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMachinePredictiveMetrics = z.infer<typeof insertMachinePredictiveMetricsSchema>;
export type MachinePredictiveMetrics = typeof machinePredictiveMetrics.$inferSelect;

// ============================================================================
// SERVICE GUY AI - AI-Powered Repair Assistant
// ============================================================================

export const serviceGuyAIConversations = pgTable("service_guy_ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  technicianId: varchar("technician_id"),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id),
  machineId: varchar("machine_id").references(() => machineAssets.id),
  repairLogId: varchar("repair_log_id").references(() => repairLogs.id),
  
  // Session
  sessionId: varchar("session_id").notNull(),
  
  // Message
  role: text("role").notNull(), // "user", "assistant", "system"
  content: text("content").notNull(),
  
  // Context
  errorCodes: text("error_codes").array(),
  machineType: text("machine_type"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  
  // AI Response Metadata
  suggestedParts: text("suggested_parts").array(),
  suggestedActions: text("suggested_actions").array(),
  videoLinks: text("video_links").array(),
  documentLinks: text("document_links").array(),
  estimatedRepairTime: decimal("estimated_repair_time", { precision: 4, scale: 2 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  
  // Feedback
  wasHelpful: boolean("was_helpful"),
  feedbackNotes: text("feedback_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index("service_guy_ai_session_idx").on(table.sessionId),
  technicianIdx: index("service_guy_ai_technician_idx").on(table.technicianId),
  machineIdx: index("service_guy_ai_machine_idx").on(table.machineId),
}));

export const insertServiceGuyAIConversationSchema = createInsertSchema(serviceGuyAIConversations).omit({
  id: true,
  createdAt: true,
});

export type InsertServiceGuyAIConversation = z.infer<typeof insertServiceGuyAIConversationSchema>;
export type ServiceGuyAIConversation = typeof serviceGuyAIConversations.$inferSelect;

// ============================================================================
// TECHNICIAN DISPATCH - Professional Service Management
// ============================================================================

export const technicians = pgTable("technicians", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id),
  
  // Profile
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  profileImage: text("profile_image"),
  
  // Company
  companyName: text("company_name"),
  isInternal: boolean("is_internal").default(false), // true = in-house, false = external vendor
  
  // Certifications
  certifications: text("certifications").array(),
  specializations: text("specializations").array(), // "washer", "dryer", "electrical", "plumbing"
  
  // Ratings
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalRepairs: integer("total_repairs").default(0),
  
  // Rates
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  calloutFee: decimal("callout_fee", { precision: 8, scale: 2 }),
  
  // Availability
  isAvailable: boolean("is_available").default(true),
  serviceRadius: integer("service_radius_miles").default(50),
  
  // Location
  baseAddress: text("base_address"),
  baseCity: text("base_city"),
  baseState: text("base_state"),
  baseZip: varchar("base_zip"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  
  // Status
  status: text("status").default("active"), // "active", "inactive", "suspended"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("technicians_laundromat_idx").on(table.laundromatId),
  statusIdx: index("technicians_status_idx").on(table.status),
}));

export const insertTechnicianSchema = createInsertSchema(technicians).omit({
  id: true,
  totalRepairs: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Technician = typeof technicians.$inferSelect;

// Technician Dispatch Assignments
export const technicianDispatches = pgTable("technician_dispatches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repairLogId: varchar("repair_log_id").references(() => repairLogs.id).notNull(),
  technicianId: varchar("technician_id").references(() => technicians.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Schedule
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTimeSlot: text("scheduled_time_slot"), // "morning", "afternoon", "evening"
  estimatedDuration: decimal("estimated_duration", { precision: 4, scale: 2 }),
  
  // Status
  status: text("status").default("scheduled"), // "scheduled", "en_route", "arrived", "in_progress", "completed", "cancelled", "rescheduled"
  
  // Tracking
  dispatchedAt: timestamp("dispatched_at"),
  enRouteAt: timestamp("en_route_at"),
  arrivedAt: timestamp("arrived_at"),
  completedAt: timestamp("completed_at"),
  
  // Location Tracking
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 7 }),
  currentLongitude: decimal("current_longitude", { precision: 10, scale: 7 }),
  estimatedArrival: timestamp("estimated_arrival"),
  
  // Notes
  dispatchNotes: text("dispatch_notes"),
  technicianNotes: text("technician_notes"),
  
  // Rating
  customerRating: integer("customer_rating"), // 1-5
  customerFeedback: text("customer_feedback"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  repairLogIdx: index("dispatches_repair_idx").on(table.repairLogId),
  technicianIdx: index("dispatches_technician_idx").on(table.technicianId),
  laundromatIdx: index("dispatches_laundromat_idx").on(table.laundromatId),
  statusIdx: index("dispatches_status_idx").on(table.status),
}));

export const insertTechnicianDispatchSchema = createInsertSchema(technicianDispatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTechnicianDispatch = z.infer<typeof insertTechnicianDispatchSchema>;
export type TechnicianDispatch = typeof technicianDispatches.$inferSelect;

// ============================================================================
// MACHINE LIFECYCLE MANAGEMENT - Total Cost of Ownership
// ============================================================================

export const machineLifecycleMetrics = pgTable("machine_lifecycle_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machineAssets.id).notNull(),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  
  // Purchase Information
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }),
  purchaseDate: timestamp("purchase_date"),
  financingType: text("financing_type"), // "cash", "lease", "loan"
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  financingTermMonths: integer("financing_term_months"),
  
  // Depreciation
  depreciationMethod: text("depreciation_method").default("straight_line"), // "straight_line", "declining_balance"
  usefulLifeYears: integer("useful_life_years").default(10),
  salvageValue: decimal("salvage_value", { precision: 10, scale: 2 }),
  currentBookValue: decimal("current_book_value", { precision: 12, scale: 2 }),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 12, scale: 2 }),
  
  // Revenue
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  averageRevenuePerMonth: decimal("average_revenue_per_month", { precision: 10, scale: 2 }),
  revenuePerCycle: decimal("revenue_per_cycle", { precision: 6, scale: 2 }),
  
  // Operating Costs
  totalRepairCosts: decimal("total_repair_costs", { precision: 12, scale: 2 }).default("0.00"),
  totalMaintenanceCosts: decimal("total_maintenance_costs", { precision: 12, scale: 2 }).default("0.00"),
  totalPartsCosts: decimal("total_parts_costs", { precision: 12, scale: 2 }).default("0.00"),
  estimatedUtilityCost: decimal("estimated_utility_cost", { precision: 10, scale: 2 }),
  insuranceCost: decimal("insurance_cost", { precision: 10, scale: 2 }),
  
  // Total Cost of Ownership
  tcoToDate: decimal("tco_to_date", { precision: 14, scale: 2 }).default("0.00"),
  projectedTCO: decimal("projected_tco", { precision: 14, scale: 2 }),
  costPerCycle: decimal("cost_per_cycle", { precision: 6, scale: 2 }),
  
  // ROI Metrics
  roi: decimal("roi", { precision: 8, scale: 2 }), // Return on Investment %
  paybackPeriodMonths: integer("payback_period_months"),
  netPresentValue: decimal("net_present_value", { precision: 12, scale: 2 }),
  
  // Energy Metrics
  estimatedKwhPerCycle: decimal("estimated_kwh_per_cycle", { precision: 6, scale: 2 }),
  estimatedWaterGallonsPerCycle: decimal("estimated_water_gallons_per_cycle", { precision: 6, scale: 2 }),
  energyStarRating: integer("energy_star_rating"),
  
  // Replacement Analysis
  recommendedReplacementDate: timestamp("recommended_replacement_date"),
  replacementReason: text("replacement_reason"), // "age", "efficiency", "repair_costs", "technology"
  estimatedReplacementCost: decimal("estimated_replacement_cost", { precision: 12, scale: 2 }),
  tradeInValue: decimal("trade_in_value", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  machineIdx: index("lifecycle_machine_idx").on(table.machineId),
  laundromatIdx: index("lifecycle_laundromat_idx").on(table.laundromatId),
}));

export const insertMachineLifecycleMetricsSchema = createInsertSchema(machineLifecycleMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMachineLifecycleMetrics = z.infer<typeof insertMachineLifecycleMetricsSchema>;
export type MachineLifecycleMetrics = typeof machineLifecycleMetrics.$inferSelect;

// ============================================================================
// UPGRADE PROMPTS & RECOMMENDATIONS
// ============================================================================

export const upgradeRecommendations = pgTable("upgrade_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  
  // Recommendation Type
  recommendationType: text("recommendation_type").notNull(), // "tier_upgrade", "feature_unlock", "equipment", "service", "addon"
  
  // Current State
  currentTier: text("current_tier"),
  currentFeatures: text("current_features").array(),
  
  // Recommended
  recommendedTier: text("recommended_tier"),
  recommendedFeature: text("recommended_feature"),
  
  // Reasoning
  triggerReason: text("trigger_reason").notNull(), // "usage_threshold", "cost_savings", "feature_request", "time_based"
  reasoningDetails: text("reasoning_details"),
  
  // Value Proposition
  estimatedMonthlySavings: decimal("estimated_monthly_savings", { precision: 10, scale: 2 }),
  estimatedROI: decimal("estimated_roi", { precision: 8, scale: 2 }),
  benefitsList: text("benefits_list").array(),
  
  // Pricing
  upgradeCost: decimal("upgrade_cost", { precision: 10, scale: 2 }),
  priceId: text("stripe_price_id"),
  
  // Status
  status: text("status").default("pending"), // "pending", "viewed", "accepted", "dismissed", "expired"
  viewedAt: timestamp("viewed_at"),
  actionTakenAt: timestamp("action_taken_at"),
  actionTaken: text("action_taken"), // "upgraded", "dismissed", "scheduled_demo"
  
  // Priority
  priority: integer("priority").default(5), // 1-10
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("upgrade_recs_laundromat_idx").on(table.laundromatId),
  userIdx: index("upgrade_recs_user_idx").on(table.userId),
  statusIdx: index("upgrade_recs_status_idx").on(table.status),
  typeIdx: index("upgrade_recs_type_idx").on(table.recommendationType),
}));

export const insertUpgradeRecommendationSchema = createInsertSchema(upgradeRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUpgradeRecommendation = z.infer<typeof insertUpgradeRecommendationSchema>;
export type UpgradeRecommendation = typeof upgradeRecommendations.$inferSelect;

// ============================================================================
// ONBOARDING PROGRESS - Professional Setup Wizard
// ============================================================================

export const onboardingProgress = pgTable("onboarding_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Overall Progress
  overallProgress: integer("overall_progress").default(0), // 0-100%
  currentStep: integer("current_step").default(1),
  totalSteps: integer("total_steps").default(10),
  
  // Step Completion
  businessProfileComplete: boolean("business_profile_complete").default(false),
  stripeConnected: boolean("stripe_connected").default(false),
  machinesAdded: boolean("machines_added").default(false),
  pricingConfigured: boolean("pricing_configured").default(false),
  staffAdded: boolean("staff_added").default(false),
  customersImported: boolean("customers_imported").default(false),
  routesConfigured: boolean("routes_configured").default(false),
  inventorySetup: boolean("inventory_setup").default(false),
  brandingCustomized: boolean("branding_customized").default(false),
  testOrderCompleted: boolean("test_order_completed").default(false),
  
  // Step Details
  stepsCompletedAt: jsonb("steps_completed_at"), // { "step_name": "2024-01-01T00:00:00Z", ... }
  stepNotes: jsonb("step_notes"), // { "step_name": "Note...", ... }
  
  // Training
  trainingVideosWatched: text("training_videos_watched").array(),
  quizScores: jsonb("quiz_scores"),
  
  // Support
  supportTicketIds: text("support_ticket_ids").array(),
  onboardingCallScheduled: boolean("onboarding_call_scheduled").default(false),
  onboardingCallDate: timestamp("onboarding_call_date"),
  
  // Status
  status: text("status").default("in_progress"), // "not_started", "in_progress", "completed", "paused"
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("onboarding_laundromat_idx").on(table.laundromatId),
  userIdx: index("onboarding_user_idx").on(table.userId),
  statusIdx: index("onboarding_status_idx").on(table.status),
}));

export const insertOnboardingProgressSchema = createInsertSchema(onboardingProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOnboardingProgress = z.infer<typeof insertOnboardingProgressSchema>;
export type OnboardingProgress = typeof onboardingProgress.$inferSelect;

// ============================================================================
// PARTS VENDORS - Preferred Supplier Management
// ============================================================================

export const partsVendors = pgTable("parts_vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id),
  
  // Vendor Info
  vendorName: text("vendor_name").notNull(),
  vendorCode: text("vendor_code"),
  
  // Contact
  contactName: text("contact_name"),
  email: varchar("email"),
  phone: varchar("phone"),
  website: text("website"),
  
  // Address
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: varchar("zip"),
  country: text("country").default("US"),
  
  // Specialization
  specializations: text("specializations").array(), // "washer", "dryer", "Speed Queen", "Dexter"
  brandsCarried: text("brands_carried").array(),
  
  // Terms
  paymentTerms: text("payment_terms"), // "Net 30", "COD", "Credit Card"
  shippingTerms: text("shipping_terms"),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }),
  
  // Performance
  averageDeliveryDays: integer("average_delivery_days"),
  reliabilityScore: integer("reliability_score"), // 1-100
  
  // Account
  accountNumber: text("account_number"),
  taxId: text("tax_id"),
  
  // Status
  isPreferred: boolean("is_preferred").default(false),
  status: text("status").default("active"), // "active", "inactive", "suspended"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("vendors_laundromat_idx").on(table.laundromatId),
  preferredIdx: index("vendors_preferred_idx").on(table.isPreferred),
}));

export const insertPartsVendorSchema = createInsertSchema(partsVendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPartsVendor = z.infer<typeof insertPartsVendorSchema>;
export type PartsVendor = typeof partsVendors.$inferSelect;

// ============================================================================
// BUSINESS DIRECTORY - Free Listings + Premium Visibility
// ============================================================================

export const businessListingCategories = pgTable("business_listing_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // Lucide icon name
  parentId: varchar("parent_id"), // For subcategories
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessListings = pgTable("business_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Owner (optional - allows anonymous listings)
  ownerId: varchar("owner_id").references(() => users.id),
  ownerEmail: varchar("owner_email").notNull(), // For contact even without account
  
  // Basic Info (Free tier)
  businessName: text("business_name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 160 }), // For SEO meta
  
  // Category
  categoryId: varchar("category_id").references(() => businessListingCategories.id),
  subcategories: text("subcategories").array(), // Additional tags
  
  // Contact
  email: varchar("email"),
  phone: varchar("phone"),
  website: text("website"),
  
  // Location
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: varchar("zip"),
  country: text("country").default("US"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  serviceArea: text("service_area"), // "Nationwide", "Arkansas", etc.
  
  // Media
  logo: text("logo"),
  coverImage: text("cover_image"),
  gallery: text("gallery").array(),
  
  // Business Details
  yearEstablished: integer("year_established"),
  employeeCount: text("employee_count"), // "1-5", "6-20", "21-50", "50+"
  servicesOffered: text("services_offered").array(),
  brandsCarried: text("brands_carried").array(),
  certifications: text("certifications").array(),
  
  // Social Links
  facebook: text("facebook"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  youtube: text("youtube"),
  
  // Premium Tier
  tier: text("tier").default("free").notNull(), // "free", "boost", "spotlight", "pro"
  tierExpiresAt: timestamp("tier_expires_at"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  
  // Premium Features (activated by tier)
  isFeatured: boolean("is_featured").default(false), // Boost+
  isHomepageHero: boolean("is_homepage_hero").default(false), // Spotlight+
  isPrioritySearch: boolean("is_priority_search").default(false), // Boost+
  showAnalytics: boolean("show_analytics").default(false), // Boost+
  hasVerifiedBadge: boolean("has_verified_badge").default(false), // Pro
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  focusKeyphrases: text("focus_keyphrases").array(),
  
  // Stats
  viewCount: integer("view_count").default(0),
  clickCount: integer("click_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),
  
  // Status
  status: text("status").default("pending").notNull(), // "pending", "active", "suspended", "expired"
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  slugIdx: index("business_listings_slug_idx").on(table.slug),
  categoryIdx: index("business_listings_category_idx").on(table.categoryId),
  tierIdx: index("business_listings_tier_idx").on(table.tier),
  statusIdx: index("business_listings_status_idx").on(table.status),
  featuredIdx: index("business_listings_featured_idx").on(table.isFeatured),
  cityStateIdx: index("business_listings_city_state_idx").on(table.city, table.state),
}));

export const insertBusinessListingSchema = createInsertSchema(businessListings).omit({
  id: true,
  viewCount: true,
  clickCount: true,
  inquiryCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBusinessListing = z.infer<typeof insertBusinessListingSchema>;
export type BusinessListing = typeof businessListings.$inferSelect;

// Analytics for premium listings
export const businessListingAnalytics = pgTable("business_listing_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => businessListings.id).notNull(),
  
  date: timestamp("date").notNull(),
  
  // Traffic
  views: integer("views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  
  // Engagement
  clicks: integer("clicks").default(0), // Website/phone/email clicks
  inquiries: integer("inquiries").default(0),
  
  // Source
  source: text("source"), // "directory", "homepage", "search", "calculator", "blog"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  listingDateIdx: index("listing_analytics_listing_date_idx").on(table.listingId, table.date),
}));

// Inquiries/leads for listings
export const businessListingInquiries = pgTable("business_listing_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => businessListings.id).notNull(),
  
  // Contact Info
  name: text("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  company: text("company"),
  
  // Message
  subject: text("subject"),
  message: text("message").notNull(),
  
  // Tracking
  source: text("source"), // Where they found the listing
  
  // Status
  status: text("status").default("new"), // "new", "read", "replied", "closed"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  listingIdx: index("biz_listing_inquiries_listing_idx").on(table.listingId),
  statusIdx: index("biz_listing_inquiries_status_idx").on(table.status),
}));

export const insertBusinessListingInquirySchema = createInsertSchema(businessListingInquiries).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertBusinessListingInquiry = z.infer<typeof insertBusinessListingInquirySchema>;
export type BusinessListingInquiry = typeof businessListingInquiries.$inferSelect;

// ============================================================================
// AI-POWERED SEO METADATA CACHE
// ============================================================================

// Cached SEO metadata for all pages - generated by Gemini AI
export const pageSeoMetadata = pgTable("page_seo_metadata", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Page identification
  pagePath: varchar("page_path").unique().notNull(), // e.g., "/cleanbi-explorer", "/pricing"
  pageType: varchar("page_type").notNull(), // "tool", "content", "marketplace", "pricing", "blog"
  
  // Focus Keyphrase - Core of SEO strategy
  focusKeyphrase: varchar("focus_keyphrase"), // Primary keyword to optimize for
  secondaryKeyphrases: jsonb("secondary_keyphrases"), // Array of additional keywords
  
  // Core SEO metadata
  title: varchar("title").notNull(), // 50-60 chars optimal
  description: text("description").notNull(), // 150-160 chars optimal
  keywords: jsonb("keywords").notNull(), // Array of 5-10 keywords
  
  // Featured Image
  featuredImageUrl: text("featured_image_url"), // URL to featured image
  featuredImageAlt: varchar("featured_image_alt"), // Alt text for accessibility
  featuredImageCaption: text("featured_image_caption"), // Optional caption
  
  // Rich snippets data
  faqs: jsonb("faqs").notNull(), // Array of { question: string, answer: string }
  features: jsonb("features").notNull(), // Array of feature highlight strings
  reviews: jsonb("reviews").notNull(), // Array of { author: string, text: string, rating: number }
  
  // Open Graph / Social
  ogTitle: varchar("og_title"),
  ogDescription: text("og_description"),
  ogImageUrl: text("og_image_url"), // Social share image
  ogImageAlt: varchar("og_image_alt"),
  
  // Twitter Card
  twitterTitle: varchar("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImageUrl: text("twitter_image_url"),
  twitterCardType: varchar("twitter_card_type").default("summary_large_image"), // summary, summary_large_image
  
  // SEO Audit Scores (0-100)
  seoScore: integer("seo_score").default(0), // Overall SEO score
  readabilityScore: integer("readability_score").default(0),
  keyphraseScore: integer("keyphrase_score").default(0), // How well optimized for focus keyphrase
  
  // Optimization Mode
  optimizationMode: varchar("optimization_mode").default("manual"), // "auto", "manual", "hybrid"
  
  // Tracking
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  aiModel: varchar("ai_model").default("gemini-2.0-flash-exp").notNull(),
  regenerateCount: integer("regenerate_count").default(0).notNull(),
  
  // Manual overrides
  isManuallyEdited: boolean("is_manually_edited").default(false).notNull(),
  lastEditedBy: varchar("last_edited_by"),
  lastEditedAt: timestamp("last_edited_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  pagePathIdx: uniqueIndex("page_seo_path_idx").on(table.pagePath),
  pageTypeIdx: index("page_seo_type_idx").on(table.pageType),
}));

export const insertPageSeoMetadataSchema = createInsertSchema(pageSeoMetadata).omit({
  id: true,
  generatedAt: true,
  regenerateCount: true,
  seoScore: true,
  readabilityScore: true,
  keyphraseScore: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  keywords: z.array(z.string()),
  secondaryKeyphrases: z.array(z.string()).optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  features: z.array(z.string()),
  reviews: z.array(z.object({
    author: z.string(),
    text: z.string(),
    rating: z.number().min(1).max(5),
  })),
  optimizationMode: z.enum(["auto", "manual", "hybrid"]).optional(),
});

export type InsertPageSeoMetadata = z.infer<typeof insertPageSeoMetadataSchema>;
export type PageSeoMetadata = typeof pageSeoMetadata.$inferSelect;

// ============================================================================
// GAMIFICATION & STICKY FEATURES - User Engagement System
// ============================================================================

// Achievement/Badge definitions
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(), // "first_cleanbi", "calculator_pro", etc.
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // "exploration", "learning", "analysis", "community"
  icon: varchar("icon"), // Icon name or emoji
  points: integer("points").default(10).notNull(),
  tier: varchar("tier").default("bronze").notNull(), // "bronze", "silver", "gold", "platinum"
  requirement: jsonb("requirement"), // { type: "count", target: "cleanbi_analyses", value: 5 }
  isSecret: boolean("is_secret").default(false), // Hidden until unlocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User earned achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: varchar("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  notified: boolean("notified").default(false),
}, (table) => ({
  userAchievementIdx: uniqueIndex("user_achievement_unique_idx").on(table.userId, table.achievementId),
}));

// Laundromat Journey - User's progress through the buying process
export const userJourney = pgTable("user_journey", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique().notNull(),
  
  // Current stage
  stage: varchar("stage").default("exploring").notNull(), // "exploring", "researching", "evaluating", "negotiating", "acquiring", "operating"
  stageProgress: integer("stage_progress").default(0).notNull(), // 0-100
  
  // Milestones completed (JSON array of milestone codes)
  completedMilestones: jsonb("completed_milestones").default(sql`'[]'::jsonb`).notNull(),
  
  // Activity tracking
  totalPoints: integer("total_points").default(0).notNull(),
  streak: integer("streak").default(0).notNull(), // Days active in a row
  lastActiveDate: timestamp("last_active_date"),
  
  // Preferences discovered
  preferredLocationRadius: integer("preferred_location_radius"), // miles
  preferredPriceRange: jsonb("preferred_price_range"), // { min: 100000, max: 500000 }
  preferredMarkets: jsonb("preferred_markets"), // ["Houston, TX", "Austin, TX"]
  
  // Saved items count
  savedListings: integer("saved_listings").default(0),
  savedCalculations: integer("saved_calculations").default(0),
  savedReports: integer("saved_reports").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Journey Milestones (static definitions)
export const journeyMilestones = pgTable("journey_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(),
  stage: varchar("stage").notNull(), // Which journey stage this belongs to
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(), // Display order within stage
  points: integer("points").default(25).notNull(),
  action: varchar("action"), // What action completes this: "visit_page", "use_calculator", "save_listing"
  actionTarget: varchar("action_target"), // Specific page/tool: "/cleanbi", "roi-calculator"
});

// Deal Scout - Personalized deal alerts for users
export const userDealScout = pgTable("user_deal_scout", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Alert criteria
  alertType: varchar("alert_type").notNull(), // "new_listing", "price_drop", "cleanbi_match", "market_trend"
  
  // Location preferences
  locations: jsonb("locations"), // Array of cities/states/zip codes
  radiusMiles: integer("radius_miles").default(50),
  
  // Price/value preferences  
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  minCleanbiScore: integer("min_cleanbi_score"),
  
  // Alert settings
  frequency: varchar("frequency").default("instant"), // "instant", "daily", "weekly"
  isActive: boolean("is_active").default(true),
  
  // Stats
  alertsSent: integer("alerts_sent").default(0),
  lastAlertAt: timestamp("last_alert_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Deal Scout Alert History - Sent alerts
export const dealScoutHistory = pgTable("deal_scout_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scoutId: varchar("scout_id").references(() => userDealScout.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Alert content
  title: text("title").notNull(),
  message: text("message").notNull(),
  listingId: varchar("listing_id"), // If referencing a specific listing
  
  // Tracking
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
  clickedAt: timestamp("clicked_at"),
});

// Industry Pulse - Live industry statistics (updated regularly)
export const industryPulse = pgTable("industry_pulse", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Time period
  date: timestamp("date").notNull(),
  period: varchar("period").notNull(), // "daily", "weekly", "monthly"
  
  // Market activity
  newListings: integer("new_listings").default(0),
  listingsSold: integer("listings_sold").default(0),
  averageAskingPrice: integer("average_asking_price"),
  averageSalePrice: integer("average_sale_price"),
  averageMultiple: decimal("average_multiple", { precision: 4, scale: 2 }),
  
  // CLEANBI stats
  analysesRun: integer("analyses_run").default(0),
  averageCleanbiScore: integer("average_cleanbi_score"),
  
  // User activity  
  newUsers: integer("new_users").default(0),
  activeUsers: integer("active_users").default(0),
  
  // Geographic hotspots
  hotMarkets: jsonb("hot_markets"), // [{ city: "Houston", state: "TX", count: 15 }]
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  datePeriodIdx: uniqueIndex("industry_pulse_date_period_idx").on(table.date, table.period),
}));

// Founding Member Status
export const foundingMembers = pgTable("founding_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique().notNull(),
  memberNumber: integer("member_number").notNull(), // #1, #2, #3, etc.
  tier: varchar("tier").default("founding").notNull(), // "founding", "early_adopter", "pioneer"
  perks: jsonb("perks"), // { "lifetime_discount": 0.20, "priority_support": true }
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// User Activity Log - For streak tracking and engagement
export const userActivityLog = pgTable("user_activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  activityType: varchar("activity_type").notNull(), // "page_view", "calculator_use", "listing_view", "cleanbi_analysis"
  activityTarget: varchar("activity_target"), // Page path or tool name
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index("user_activity_user_date_idx").on(table.userId, table.createdAt),
}));

export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, createdAt: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, unlockedAt: true });
export const insertUserJourneySchema = createInsertSchema(userJourney).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserDealScoutSchema = createInsertSchema(userDealScout).omit({ id: true, alertsSent: true, lastAlertAt: true, createdAt: true });
export const insertUserActivityLogSchema = createInsertSchema(userActivityLog).omit({ id: true, createdAt: true });

export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type UserJourney = typeof userJourney.$inferSelect;
export type UserDealScout = typeof userDealScout.$inferSelect;
export type DealScoutHistory = typeof dealScoutHistory.$inferSelect;
export type IndustryPulse = typeof industryPulse.$inferSelect;
export type FoundingMember = typeof foundingMembers.$inferSelect;
export type UserActivityLog = typeof userActivityLog.$inferSelect;

// ============================================================================
// UTILITY BILL AUDITOR - AI-Powered Bill Analysis
// ============================================================================

export const utilityBillAnalyses = pgTable("utility_bill_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Bill identification
  billType: varchar("bill_type").notNull(), // "electric", "water", "gas", "combined"
  billDate: timestamp("bill_date"),
  billPeriodStart: timestamp("bill_period_start"),
  billPeriodEnd: timestamp("bill_period_end"),
  
  // Electric usage
  electricKwh: decimal("electric_kwh", { precision: 10, scale: 2 }),
  electricCost: decimal("electric_cost", { precision: 10, scale: 2 }),
  electricRatePerKwh: decimal("electric_rate_per_kwh", { precision: 6, scale: 4 }),
  
  // Water usage
  waterGallons: decimal("water_gallons", { precision: 12, scale: 2 }),
  waterCost: decimal("water_cost", { precision: 10, scale: 2 }),
  waterRatePerGallon: decimal("water_rate_per_gallon", { precision: 8, scale: 6 }),
  
  // Gas usage
  gasTherms: decimal("gas_therms", { precision: 10, scale: 2 }),
  gasCost: decimal("gas_cost", { precision: 10, scale: 2 }),
  gasRatePerTherm: decimal("gas_rate_per_therm", { precision: 6, scale: 4 }),
  
  // Totals
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  
  // Laundromat-specific metrics
  grossRevenue: decimal("gross_revenue", { precision: 12, scale: 2 }),
  upgRatio: decimal("upg_ratio", { precision: 5, scale: 2 }), // Utilities as % of Gross
  costPerWasherLoad: decimal("cost_per_washer_load", { precision: 6, scale: 4 }),
  costPerDryerLoad: decimal("cost_per_dryer_load", { precision: 6, scale: 4 }),
  
  // AI Analysis
  anomalies: jsonb("anomalies").default(sql`'[]'::jsonb`), // Array of { type, severity, message }
  recommendations: jsonb("recommendations").default(sql`'[]'::jsonb`), // Array of { priority, action, expectedSavings }
  
  // Raw extracted data
  rawExtractedData: jsonb("raw_extracted_data"),
  
  // Image storage
  imageUrl: text("image_url"),
  
  // Confidence score from AI
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("utility_bill_user_idx").on(table.userId),
  billDateIdx: index("utility_bill_date_idx").on(table.billDate),
}));

export const insertUtilityBillAnalysisSchema = createInsertSchema(utilityBillAnalyses).omit({
  id: true,
  createdAt: true,
}).extend({
  electricKwh: z.string().optional(),
  electricCost: z.string().optional(),
  electricRatePerKwh: z.string().optional(),
  waterGallons: z.string().optional(),
  waterCost: z.string().optional(),
  waterRatePerGallon: z.string().optional(),
  gasTherms: z.string().optional(),
  gasCost: z.string().optional(),
  gasRatePerTherm: z.string().optional(),
  totalCost: z.string().optional(),
  grossRevenue: z.string().optional(),
  upgRatio: z.string().optional(),
  costPerWasherLoad: z.string().optional(),
  costPerDryerLoad: z.string().optional(),
  confidenceScore: z.string().optional(),
  anomalies: z.array(z.object({
    type: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    message: z.string(),
    percentChange: z.number().optional(),
  })).optional(),
  recommendations: z.array(z.object({
    priority: z.enum(["low", "medium", "high"]),
    action: z.string(),
    expectedSavings: z.string().optional(),
  })).optional(),
});

export type InsertUtilityBillAnalysis = z.infer<typeof insertUtilityBillAnalysisSchema>;
export type UtilityBillAnalysis = typeof utilityBillAnalyses.$inferSelect;

// ============================================================================
// SERVICE TECH ACADEMY - Premium Education & Certification Platform
// ============================================================================

// Service Tech Academy Courses - Structured learning paths
export const serviceTechCourses = pgTable("service_tech_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Course Details
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  
  // Course Structure
  track: text("track").notNull(), // "core_tech", "brand_specialist", "payment_systems", "business_skills"
  level: text("level").notNull(), // "beginner", "intermediate", "advanced", "expert"
  
  // Content
  thumbnailUrl: text("thumbnail_url"),
  previewVideoUrl: text("preview_video_url"),
  
  // Pricing & Access
  isFree: boolean("is_free").default(false),
  requiredTier: text("required_tier").default("starter"), // "free", "starter", "pro", "enterprise"
  price: decimal("price", { precision: 10, scale: 2 }), // One-time purchase price if applicable
  
  // Metadata
  estimatedHours: integer("estimated_hours"),
  lessonCount: integer("lesson_count").default(0),
  enrollmentCount: integer("enrollment_count").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  ratingCount: integer("rating_count").default(0),
  
  // Certification
  hasCertification: boolean("has_certification").default(false),
  certificationName: text("certification_name"),
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  
  // Status
  status: text("status").default("draft"), // "draft", "published", "archived"
  publishedAt: timestamp("published_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("service_tech_courses_slug_idx").on(table.slug),
  trackIdx: index("service_tech_courses_track_idx").on(table.track),
  levelIdx: index("service_tech_courses_level_idx").on(table.level),
  tierIdx: index("service_tech_courses_tier_idx").on(table.requiredTier),
}));

// Course Modules - Sections within a course
export const serviceTechModules = pgTable("service_tech_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => serviceTechCourses.id).notNull(),
  
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  
  // Module type
  moduleType: text("module_type").default("standard"), // "standard", "assessment", "hands_on", "certification_exam"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  courseIdx: index("service_tech_modules_course_idx").on(table.courseId),
  orderIdx: index("service_tech_modules_order_idx").on(table.orderIndex),
}));

// Course Lessons - Individual learning units
export const serviceTechLessons = pgTable("service_tech_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").references(() => serviceTechModules.id).notNull(),
  courseId: varchar("course_id").references(() => serviceTechCourses.id).notNull(),
  
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content"), // Rich markdown content
  
  // Media
  videoUrl: text("video_url"),
  videoDuration: integer("video_duration"), // Seconds
  
  // Linked diagnostic codes for hands-on practice
  linkedDiagnosticCodes: text("linked_diagnostic_codes").array(), // Array of diagnostic code IDs
  
  // Ordering
  orderIndex: integer("order_index").notNull(),
  
  // Access control
  isFreePreview: boolean("is_free_preview").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  moduleIdx: index("service_tech_lessons_module_idx").on(table.moduleId),
  courseIdx: index("service_tech_lessons_course_idx").on(table.courseId),
  slugIdx: index("service_tech_lessons_slug_idx").on(table.slug),
}));

// User Course Enrollments
export const serviceTechEnrollments = pgTable("service_tech_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => serviceTechCourses.id).notNull(),
  
  // Progress
  completedLessons: text("completed_lessons").array().default(sql`'{}'::text[]`),
  progressPercent: decimal("progress_percent", { precision: 5, scale: 2 }).default("0"),
  
  // Certification
  certificationEarned: boolean("certification_earned").default(false),
  certificationDate: timestamp("certification_date"),
  certificateUrl: text("certificate_url"),
  
  // Engagement
  lastAccessedAt: timestamp("last_accessed_at"),
  totalTimeSpent: integer("total_time_spent").default(0), // Seconds
  
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
}, (table) => ({
  userCourseIdx: uniqueIndex("service_tech_enrollments_user_course_idx").on(table.userId, table.courseId),
  userIdx: index("service_tech_enrollments_user_idx").on(table.userId),
  courseIdx: index("service_tech_enrollments_course_idx").on(table.courseId),
}));

// Repair Blueprints - Step-by-step procedures linked to diagnostic codes
export const repairBlueprints = pgTable("repair_blueprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  diagnosticCodeId: varchar("diagnostic_code_id").references(() => diagnosticCodes.id),
  
  // Blueprint details
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  
  // Safety & Warnings
  safetyWarnings: text("safety_warnings").array(), // Critical warnings shown first
  requiredPPE: text("required_ppe").array(), // "safety_glasses", "gloves", "steel_toe_boots"
  requiredTools: text("required_tools").array(), // Tools needed for repair
  
  // Step-by-step procedure
  steps: jsonb("steps").notNull(), // [{stepNumber, title, description, imageUrl, videoUrl, warningText, tipText, estimatedTime}]
  
  // Parts with affiliate links
  partsRequired: jsonb("parts_required"), // [{partNumber, name, price, affiliateUrl, supplier, isRequired}]
  
  // Metrics
  estimatedTotalTime: integer("estimated_total_time"), // Minutes
  difficultyLevel: text("difficulty_level"), // "beginner", "intermediate", "advanced", "expert"
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // From user feedback
  
  // Legal
  disclaimer: text("disclaimer"),
  requiresProfessional: boolean("requires_professional").default(false),
  
  // Access control - Gated content
  requiredTier: text("required_tier").default("pro"), // "free", "starter", "pro", "enterprise"
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  diagnosticCodeIdx: index("repair_blueprints_diagnostic_idx").on(table.diagnosticCodeId),
  slugIdx: uniqueIndex("repair_blueprints_slug_idx").on(table.slug),
  tierIdx: index("repair_blueprints_tier_idx").on(table.requiredTier),
}));

// ============================================================================
// ANTI-SCRAPING & USAGE TRACKING - Protect Premium Content
// ============================================================================

// Service Guy AI Usage Tracking - Per-user lookup limits
export const serviceGuyUsage = pgTable("service_guy_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"), // For anonymous users
  ipAddress: text("ip_address"),
  
  // Usage tracking
  lookupCount: integer("lookup_count").default(0),
  periodStart: timestamp("period_start").defaultNow().notNull(),
  periodEnd: timestamp("period_end"), // End of billing period
  
  // Rate limiting
  lastLookupAt: timestamp("last_lookup_at"),
  lookupThisMinute: integer("lookup_this_minute").default(0),
  minuteResetAt: timestamp("minute_reset_at"),
  
  // Tier limits
  tierLimit: integer("tier_limit").default(5), // Free tier: 5/month
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("service_guy_usage_user_idx").on(table.userId),
  sessionIdx: index("service_guy_usage_session_idx").on(table.sessionId),
  ipIdx: index("service_guy_usage_ip_idx").on(table.ipAddress),
}));

// API Access Logs - Track all diagnostic lookups for anti-scraping
export const diagnosticAccessLogs = pgTable("diagnostic_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"),
  ipAddress: text("ip_address").notNull(),
  
  // Request details
  diagnosticCodeId: varchar("diagnostic_code_id").references(() => diagnosticCodes.id),
  requestedCode: text("requested_code"),
  requestedManufacturer: text("requested_manufacturer"),
  
  // Bot detection signals
  userAgent: text("user_agent"),
  referer: text("referer"),
  acceptLanguage: text("accept_language"),
  
  // Honeypot detection
  honeypotTriggered: boolean("honeypot_triggered").default(false),
  
  // Response info
  responseType: text("response_type"), // "full", "preview", "rate_limited", "blocked"
  
  // Fingerprinting
  fingerprintHash: text("fingerprint_hash"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("diagnostic_access_user_idx").on(table.userId),
  ipIdx: index("diagnostic_access_ip_idx").on(table.ipAddress),
  codeIdx: index("diagnostic_access_code_idx").on(table.diagnosticCodeId),
  timestampIdx: index("diagnostic_access_timestamp_idx").on(table.createdAt),
  honeypotIdx: index("diagnostic_access_honeypot_idx").on(table.honeypotTriggered),
}));

// Blocked IPs/Users - Scraping prevention
export const scrapingBlocklist = pgTable("scraping_blocklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Block target
  ipAddress: text("ip_address"),
  userId: varchar("user_id").references(() => users.id),
  fingerprintHash: text("fingerprint_hash"),
  
  // Block reason
  reason: text("reason").notNull(), // "rate_limit_exceeded", "honeypot_triggered", "bot_detected", "bulk_scraping"
  evidence: jsonb("evidence"), // { requestCount, timeWindow, patterns }
  
  // Block duration
  blockedUntil: timestamp("blocked_until"),
  isPermanent: boolean("is_permanent").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ipIdx: index("scraping_blocklist_ip_idx").on(table.ipAddress),
  userIdx: index("scraping_blocklist_user_idx").on(table.userId),
  fingerprintIdx: index("scraping_blocklist_fingerprint_idx").on(table.fingerprintHash),
}));

// Diagnostic Issue Reports - User-submitted corrections/reports for diagnostic codes
export const diagnosticIssueReports = pgTable("diagnostic_issue_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  diagnosticCodeId: varchar("diagnostic_code_id").references(() => diagnosticCodes.id),
  
  // Report details
  codeReference: text("code_reference").notNull(), // The code being reported (e.g., "E01")
  manufacturer: text("manufacturer").notNull(),
  issueType: text("issue_type").notNull(), // "incorrect_info", "missing_info", "typo", "outdated", "other"
  description: text("description").notNull(),
  suggestedCorrection: text("suggested_correction"),
  
  // Status tracking
  status: text("status").default("pending").notNull(), // "pending", "reviewed", "resolved", "rejected"
  adminNotes: text("admin_notes"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("diagnostic_issue_reports_user_idx").on(table.userId),
  statusIdx: index("diagnostic_issue_reports_status_idx").on(table.status),
  codeIdx: index("diagnostic_issue_reports_code_idx").on(table.diagnosticCodeId),
}));

// Insert schemas and types for new tables
export const insertServiceTechCourseSchema = createInsertSchema(serviceTechCourses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  enrollmentCount: true,
  ratingCount: true,
});
export const insertServiceTechModuleSchema = createInsertSchema(serviceTechModules).omit({ id: true, createdAt: true });
export const insertServiceTechLessonSchema = createInsertSchema(serviceTechLessons).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceTechEnrollmentSchema = createInsertSchema(serviceTechEnrollments).omit({ id: true, enrolledAt: true });
export const insertRepairBlueprintSchema = createInsertSchema(repairBlueprints).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceGuyUsageSchema = createInsertSchema(serviceGuyUsage).omit({ id: true, updatedAt: true });
export const insertDiagnosticAccessLogSchema = createInsertSchema(diagnosticAccessLogs).omit({ id: true, createdAt: true });
export const insertScrapingBlocklistSchema = createInsertSchema(scrapingBlocklist).omit({ id: true, createdAt: true });
export const insertDiagnosticIssueReportSchema = createInsertSchema(diagnosticIssueReports).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  adminNotes: true,
  resolvedBy: true,
  resolvedAt: true,
});

export type ServiceTechCourse = typeof serviceTechCourses.$inferSelect;
export type ServiceTechModule = typeof serviceTechModules.$inferSelect;
export type ServiceTechLesson = typeof serviceTechLessons.$inferSelect;
export type ServiceTechEnrollment = typeof serviceTechEnrollments.$inferSelect;
export type RepairBlueprint = typeof repairBlueprints.$inferSelect;
export type ServiceGuyUsage = typeof serviceGuyUsage.$inferSelect;
export type DiagnosticAccessLog = typeof diagnosticAccessLogs.$inferSelect;
export type ScrapingBlocklist = typeof scrapingBlocklist.$inferSelect;
export type DiagnosticIssueReport = typeof diagnosticIssueReports.$inferSelect;
export type InsertDiagnosticIssueReport = z.infer<typeof insertDiagnosticIssueReportSchema>;

// ============================================================================
// SERVICE JOBS - Track Repair Work in Progress
// ============================================================================

export const serviceJobs = pgTable("service_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").default("in_progress"), // in_progress, on_hold, completed, cancelled
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  locationAddress: text("location_address"),
  manufacturer: text("manufacturer"),
  machineType: text("machine_type"),
  machineModel: text("machine_model"),
  serialNumber: text("serial_number"),
  errorCodes: text("error_codes").array(),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  repairNotes: text("repair_notes"),
  partsUsed: jsonb("parts_used"), // [{partNumber, name, quantity, cost}]
  laborHours: decimal("labor_hours"),
  totalCost: decimal("total_cost"),
  photos: text("photos").array(), // Array of image URLs/base64
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("service_jobs_user_idx").on(table.userId),
  statusIdx: index("service_jobs_status_idx").on(table.status),
  manufacturerIdx: index("service_jobs_manufacturer_idx").on(table.manufacturer),
}));

export const insertServiceJobSchema = createInsertSchema(serviceJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
}).extend({
  laborHours: z.string().optional(),
  totalCost: z.string().optional(),
});

export type InsertServiceJob = z.infer<typeof insertServiceJobSchema>;
export type ServiceJob = typeof serviceJobs.$inferSelect;

// ============================================================================
// FIX OUTCOME FEEDBACK - Track Repair Success Rates from Real Techs
// ============================================================================

export const fixOutcomeFeedback = pgTable("fix_outcome_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  diagnosticCodeId: varchar("diagnostic_code_id").references(() => diagnosticCodes.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"), // For anonymous feedback
  ipAddress: text("ip_address"),
  
  // Outcome tracking
  outcome: text("outcome").notNull(), // "fixed", "partially_fixed", "not_fixed", "wrong_diagnosis"
  additionalSteps: text("additional_steps"), // What else they had to do
  actualPartsUsed: text("actual_parts_used").array(), // Parts actually needed
  timeSpent: integer("time_spent_minutes"), // Actual repair time
  notes: text("notes"), // Free-form feedback
  
  // Context
  manufacturer: text("manufacturer").notNull(),
  errorCode: text("error_code").notNull(),
  machineType: text("machine_type"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  diagnosticCodeIdx: index("fix_feedback_diagnostic_code_idx").on(table.diagnosticCodeId),
  outcomeIdx: index("fix_feedback_outcome_idx").on(table.outcome),
  manufacturerIdx: index("fix_feedback_manufacturer_idx").on(table.manufacturer),
}));

export const insertFixOutcomeFeedbackSchema = createInsertSchema(fixOutcomeFeedback).omit({
  id: true,
  createdAt: true,
});

export type FixOutcomeFeedback = typeof fixOutcomeFeedback.$inferSelect;
export type InsertFixOutcomeFeedback = z.infer<typeof insertFixOutcomeFeedbackSchema>;

// ============================================================================
// SERVICE GUY AI - LEARNING KNOWLEDGE BASE
// ============================================================================

// Service Manuals - Uploaded PDFs, wiring diagrams, tech bulletins
export const serviceManuals = pgTable("service_manuals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploaderId: varchar("uploader_id").references(() => users.id),
  
  // Document metadata
  title: text("title").notNull(),
  manufacturer: text("manufacturer").notNull(),
  modelSeries: text("model_series"), // e.g., "Quantum Gold", "SC Series"
  machineType: text("machine_type"), // "washer", "dryer", "both"
  docType: text("doc_type").notNull(), // "service_manual", "wiring_diagram", "parts_list", "tech_bulletin", "user_submitted"
  
  // File info
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"), // bytes
  mimeType: text("mime_type"),
  storageKey: text("storage_key"), // Object storage key
  checksum: text("checksum"), // For deduplication
  
  // Processing status
  status: text("status").default("pending"), // "pending", "processing", "completed", "failed"
  pageCount: integer("page_count"),
  extractedText: text("extracted_text"), // Full text for search
  processingError: text("processing_error"),
  
  // Metadata
  sourceUrl: text("source_url"), // If downloaded from manufacturer site
  yearPublished: integer("year_published"),
  version: text("version"),
  language: text("language").default("en"),
  
  // Stats
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),
  helpfulVotes: integer("helpful_votes").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  manufacturerIdx: index("service_manuals_manufacturer_idx").on(table.manufacturer),
  docTypeIdx: index("service_manuals_doc_type_idx").on(table.docType),
  statusIdx: index("service_manuals_status_idx").on(table.status),
}));

export const insertServiceManualSchema = createInsertSchema(serviceManuals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ServiceManual = typeof serviceManuals.$inferSelect;
export type InsertServiceManual = z.infer<typeof insertServiceManualSchema>;

// Knowledge Chunks - Extracted pieces of knowledge from manuals
export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  manualId: varchar("manual_id").references(() => serviceManuals.id),
  
  // Content
  chunkType: text("chunk_type").notNull(), // "repair_procedure", "wiring_info", "parts_list", "safety_warning", "troubleshooting", "spec", "tip"
  title: text("title"),
  content: text("content").notNull(), // The extracted text
  summary: text("summary"), // AI-generated summary
  
  // Structured data (AI-extracted)
  structuredData: jsonb("structured_data"), // {steps: [], parts: [], warnings: [], tools: []}
  
  // Linking to diagnostic codes
  linkedErrorCodes: text("linked_error_codes").array(), // e.g., ["Er_dL", "E01"]
  manufacturer: text("manufacturer"),
  modelSeries: text("model_series"),
  machineType: text("machine_type"),
  
  // Source reference
  pageStart: integer("page_start"),
  pageEnd: integer("page_end"),
  sectionTitle: text("section_title"),
  
  // Quality metrics
  confidence: integer("confidence").default(80), // AI confidence 0-100
  helpfulVotes: integer("helpful_votes").default(0),
  notHelpfulVotes: integer("not_helpful_votes").default(0),
  usageCount: integer("usage_count").default(0), // How often shown in diagnoses
  
  // Verification status
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  manualIdx: index("knowledge_chunks_manual_idx").on(table.manualId),
  typeIdx: index("knowledge_chunks_type_idx").on(table.chunkType),
  manufacturerIdx: index("knowledge_chunks_manufacturer_idx").on(table.manufacturer),
}));

export const insertKnowledgeChunkSchema = createInsertSchema(knowledgeChunks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type InsertKnowledgeChunk = z.infer<typeof insertKnowledgeChunkSchema>;

// Tech Contributions - User-submitted fixes and knowledge
export const techContributions = pgTable("tech_contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // What they're contributing
  contributionType: text("contribution_type").notNull(), // "fix_procedure", "tip", "parts_update", "wiring_info", "correction"
  
  // Context
  manufacturer: text("manufacturer").notNull(),
  errorCode: text("error_code"),
  machineType: text("machine_type"),
  modelSeries: text("model_series"),
  
  // Content
  title: text("title").notNull(),
  content: text("content").notNull(),
  partsUsed: jsonb("parts_used"), // [{partNumber, name, price, supplier}]
  timeToFix: integer("time_to_fix"), // minutes
  difficultyLevel: text("difficulty_level"), // "easy", "medium", "hard", "pro_only"
  
  // Evidence
  photoUrls: text("photo_urls").array(),
  videoUrl: text("video_url"),
  
  // Validation
  status: text("status").default("pending"), // "pending", "approved", "rejected", "merged"
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // If merged into main knowledge base
  mergedToChunkId: varchar("merged_to_chunk_id").references(() => knowledgeChunks.id),
  mergedToDiagnosticId: varchar("merged_to_diagnostic_id").references(() => diagnosticCodes.id),
  
  // Community validation
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  verifiedWorksCount: integer("verified_works_count").default(0), // "This worked for me" clicks
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("tech_contributions_user_idx").on(table.userId),
  manufacturerIdx: index("tech_contributions_manufacturer_idx").on(table.manufacturer),
  statusIdx: index("tech_contributions_status_idx").on(table.status),
  errorCodeIdx: index("tech_contributions_error_code_idx").on(table.errorCode),
}));

export const insertTechContributionSchema = createInsertSchema(techContributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TechContribution = typeof techContributions.$inferSelect;
export type InsertTechContribution = z.infer<typeof insertTechContributionSchema>;

// ============================================================================
// DESIGN CONSULTING SERVICES - Professional Laundromat Design & Consultation
// ============================================================================

// Design Service Catalog - Available consulting services and pricing
export const designServiceCatalog = pgTable("design_service_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Service info
  serviceKey: text("service_key").notNull().unique(), // "feasibility", "3d-design", "equipment-sourcing", etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  
  // Pricing
  priceType: text("price_type").notNull(), // "fixed", "range", "percentage", "monthly"
  priceMin: decimal("price_min", { precision: 10, scale: 2 }), // Min price in dollars
  priceMax: decimal("price_max", { precision: 10, scale: 2 }), // Max price (for ranges)
  percentageBase: text("percentage_base"), // "equipment" or "project" (for percentage pricing)
  percentageRate: decimal("percentage_rate", { precision: 5, scale: 2 }), // e.g., 12.00 for 12%
  
  // Deliverables
  deliverables: text("deliverables").array(), // List of what's included
  timeline: text("timeline"), // Expected delivery time
  
  // Display
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDesignServiceCatalogSchema = createInsertSchema(designServiceCatalog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DesignServiceCatalog = typeof designServiceCatalog.$inferSelect;
export type InsertDesignServiceCatalog = z.infer<typeof insertDesignServiceCatalogSchema>;

// Design Quotes - Project quotes based on equipment/project selection
export const designQuotes = pgTable("design_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Quote reference
  quoteNumber: text("quote_number").notNull().unique(), // e.g., "WBH-Q-2025-00001"
  
  // Service requested
  serviceId: varchar("service_id").references(() => designServiceCatalog.id),
  serviceKey: text("service_key").notNull(),
  
  // Project details for pricing
  projectBudget: decimal("project_budget", { precision: 12, scale: 2 }), // Total project budget
  equipmentBudget: decimal("equipment_budget", { precision: 12, scale: 2 }), // Equipment portion
  squareFootage: integer("square_footage"),
  packageSize: text("package_size"), // "micro", "standard", "large", "mega"
  
  // Contact info (for non-logged-in users)
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  companyName: text("company_name"),
  
  // Quote details
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  calculatedPrice: decimal("calculated_price", { precision: 10, scale: 2 }).notNull(), // Final calculated price
  priceBreakdown: jsonb("price_breakdown"), // {basePrice, percentageFee, adjustments, total}
  
  // Status
  status: text("status").default("draft").notNull(), // "draft", "sent", "accepted", "declined", "expired"
  expiresAt: timestamp("expires_at"), // Quote valid until
  notes: text("notes"), // Internal notes or special requests
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("design_quotes_user_id_idx").on(table.userId),
  statusIdx: index("design_quotes_status_idx").on(table.status),
  quoteNumberIdx: index("design_quotes_quote_number_idx").on(table.quoteNumber),
}));

export const insertDesignQuoteSchema = createInsertSchema(designQuotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DesignQuote = typeof designQuotes.$inferSelect;
export type InsertDesignQuote = z.infer<typeof insertDesignQuoteSchema>;

// Design Orders - Stripe-linked orders for consulting services
export const designOrders = pgTable("design_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  quoteId: varchar("quote_id").references(() => designQuotes.id),
  
  // Order reference
  orderNumber: text("order_number").notNull().unique(), // e.g., "WBH-O-2025-00001"
  
  // Service details
  serviceId: varchar("service_id").references(() => designServiceCatalog.id),
  serviceKey: text("service_key").notNull(),
  serviceName: text("service_name").notNull(),
  
  // Pricing
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("usd").notNull(),
  
  // Stripe integration
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCustomerId: text("stripe_customer_id"),
  
  // Contact info
  customerName: text("customer_name"),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  companyName: text("company_name"),
  
  // Project metadata
  projectDetails: jsonb("project_details"), // {budget, sqft, packageSize, equipmentList, etc.}
  
  // Status
  paymentStatus: text("payment_status").default("pending").notNull(), // "pending", "paid", "failed", "refunded"
  fulfillmentStatus: text("fulfillment_status").default("pending").notNull(), // "pending", "in_progress", "completed", "cancelled"
  
  // Dates
  paidAt: timestamp("paid_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("design_orders_user_id_idx").on(table.userId),
  orderNumberIdx: index("design_orders_order_number_idx").on(table.orderNumber),
  paymentStatusIdx: index("design_orders_payment_status_idx").on(table.paymentStatus),
  stripeSessionIdx: index("design_orders_stripe_session_idx").on(table.stripeSessionId),
}));

export const insertDesignOrderSchema = createInsertSchema(designOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DesignOrder = typeof designOrders.$inferSelect;
export type InsertDesignOrder = z.infer<typeof insertDesignOrderSchema>;

// ============================================================================
// ENTERPRISE FEATURES - Notifications, Voice, Intelligence, Reports, Equipment
// ============================================================================

// Notification Preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Notification channels
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  
  // Phone for SMS
  phoneNumber: varchar("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  
  // Push subscription
  pushSubscription: jsonb("push_subscription"), // Web Push subscription object
  
  // Notification types
  equipmentAlerts: boolean("equipment_alerts").default(true),
  dealAlerts: boolean("deal_alerts").default(true),
  marketUpdates: boolean("market_updates").default(true),
  reportDelivery: boolean("report_delivery").default(true),
  priceChanges: boolean("price_changes").default(false),
  competitorUpdates: boolean("competitor_updates").default(false),
  
  // Frequency settings
  digestFrequency: text("digest_frequency").default("daily"), // "instant", "daily", "weekly"
  quietHoursStart: integer("quiet_hours_start"), // Hour 0-23
  quietHoursEnd: integer("quiet_hours_end"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;

// Notification Log
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  type: text("type").notNull(), // "equipment_alert", "deal_alert", "market_update", "report_ready", "competitor_update"
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional context data
  
  // Delivery status
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  pushSent: boolean("push_sent").default(false),
  
  read: boolean("read").default(false),
  readAt: timestamp("read_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  typeIdx: index("notifications_type_idx").on(table.type),
  readIdx: index("notifications_read_idx").on(table.read),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Competitor Tracking
export const competitors = pgTable("competitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  placeId: text("place_id"), // Google Place ID
  
  // Business details
  businessType: text("business_type").default("laundromat"), // "laundromat", "laundry_service", "dry_cleaner"
  washPrice: decimal("wash_price", { precision: 6, scale: 2 }),
  dryPrice: decimal("dry_price", { precision: 6, scale: 2 }),
  dropOffPrice: decimal("drop_off_price", { precision: 6, scale: 2 }), // per lb
  
  // Operating info
  hoursOpen: jsonb("hours_open"), // {mon: "6am-10pm", tue: ...}
  machineCount: integer("machine_count"),
  hasAttendant: boolean("has_attendant"),
  hasWifi: boolean("has_wifi"),
  hasParking: boolean("has_parking"),
  
  // Ratings and reviews
  googleRating: decimal("google_rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count"),
  
  // Tracking
  lastChecked: timestamp("last_checked"),
  priceHistory: jsonb("price_history"), // [{date, washPrice, dryPrice}]
  notes: text("notes"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("competitors_user_id_idx").on(table.userId),
  placeIdIdx: index("competitors_place_id_idx").on(table.placeId),
}));

export const insertCompetitorSchema = createInsertSchema(competitors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;

// Market Intelligence Alerts
export const marketAlerts = pgTable("market_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  alertType: text("alert_type").notNull(), // "new_competitor", "price_change", "closing", "for_sale"
  radius: integer("radius").default(5), // miles
  centerAddress: text("center_address"),
  centerLat: decimal("center_lat", { precision: 10, scale: 7 }),
  centerLng: decimal("center_lng", { precision: 10, scale: 7 }),
  
  priceThreshold: decimal("price_threshold", { precision: 6, scale: 2 }), // Alert if competitor below this price
  
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("market_alerts_user_id_idx").on(table.userId),
}));

export const insertMarketAlertSchema = createInsertSchema(marketAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketAlert = typeof marketAlerts.$inferSelect;
export type InsertMarketAlert = z.infer<typeof insertMarketAlertSchema>;

// Scheduled Reports
export const scheduledReports = pgTable("scheduled_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  reportType: text("report_type").notNull(), // "cleanbi_market", "competitor_analysis", "equipment_status", "financial_summary"
  reportName: text("report_name").notNull(),
  
  // Schedule
  frequency: text("frequency").notNull(), // "daily", "weekly", "monthly"
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  preferredHour: integer("preferred_hour").default(8), // Hour to send (0-23)
  timezone: text("timezone").default("America/New_York"),
  
  // Report configuration
  config: jsonb("config"), // Report-specific settings (addresses, metrics, etc.)
  
  // Delivery
  deliveryEmail: text("delivery_email"),
  includesPdf: boolean("includes_pdf").default(true),
  
  // Status
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  runCount: integer("run_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("scheduled_reports_user_id_idx").on(table.userId),
  nextRunIdx: index("scheduled_reports_next_run_idx").on(table.nextRun),
}));

export const insertScheduledReportSchema = createInsertSchema(scheduledReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ScheduledReport = typeof scheduledReports.$inferSelect;
export type InsertScheduledReport = z.infer<typeof insertScheduledReportSchema>;

// Report History
export const reportHistory = pgTable("report_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scheduledReportId: varchar("scheduled_report_id").references(() => scheduledReports.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  reportType: text("report_type").notNull(),
  reportName: text("report_name").notNull(),
  
  // File storage
  pdfUrl: text("pdf_url"),
  pdfKey: text("pdf_key"), // Object storage key
  
  // Delivery
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  recipientEmail: text("recipient_email"),
  
  // Status
  status: text("status").default("pending"), // "pending", "generated", "sent", "failed"
  errorMessage: text("error_message"),
  
  generatedAt: timestamp("generated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("report_history_user_id_idx").on(table.userId),
  scheduledReportIdIdx: index("report_history_scheduled_report_id_idx").on(table.scheduledReportId),
}));

export const insertReportHistorySchema = createInsertSchema(reportHistory).omit({
  id: true,
  generatedAt: true,
});

export type ReportHistory = typeof reportHistory.$inferSelect;
export type InsertReportHistory = z.infer<typeof insertReportHistorySchema>;

// Equipment Lifecycle Tracker
export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Equipment identification
  name: text("name").notNull(), // "Washer #1", "Dryer Bank A"
  type: text("type").notNull(), // "washer", "dryer", "folding_table", "change_machine", "soap_dispenser"
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number"),
  
  // Location
  locationName: text("location_name"), // If user has multiple locations
  locationAddress: text("location_address"),
  position: text("position"), // "Row 1 - Left", "Back Wall"
  
  // Purchase info
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  vendor: text("vendor"),
  warrantyExpires: timestamp("warranty_expires"),
  
  // Depreciation
  usefulLifeYears: integer("useful_life_years").default(10),
  salvageValue: decimal("salvage_value", { precision: 10, scale: 2 }).default("0"),
  depreciationMethod: text("depreciation_method").default("straight_line"), // "straight_line", "declining_balance"
  
  // Current status
  status: text("status").default("operational"), // "operational", "needs_service", "out_of_service", "retired"
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  lastValueUpdate: timestamp("last_value_update"),
  
  // Usage tracking
  cycleCount: integer("cycle_count").default(0),
  lastCycleReset: timestamp("last_cycle_reset"),
  averageCyclesPerDay: decimal("average_cycles_per_day", { precision: 6, scale: 2 }),
  
  // Revenue tracking
  pricePerCycle: decimal("price_per_cycle", { precision: 6, scale: 2 }),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  
  notes: text("notes"),
  imageUrl: text("image_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("equipment_user_id_idx").on(table.userId),
  typeIdx: index("equipment_type_idx").on(table.type),
  statusIdx: index("equipment_status_idx").on(table.status),
}));

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

// Equipment Maintenance Records
export const maintenanceRecords = pgTable("maintenance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  equipmentId: varchar("equipment_id").notNull().references(() => equipment.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Maintenance details
  type: text("type").notNull(), // "preventive", "repair", "inspection", "replacement"
  description: text("description").notNull(),
  performedBy: text("performed_by"), // Technician name/company
  
  // Costs
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  
  // Parts used
  partsUsed: jsonb("parts_used"), // [{name, partNumber, quantity, cost}]
  
  // Timing
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  downtime: integer("downtime"), // Hours equipment was out of service
  
  // Follow-up
  nextMaintenanceDue: timestamp("next_maintenance_due"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  equipmentIdIdx: index("maintenance_records_equipment_id_idx").on(table.equipmentId),
  userIdIdx: index("maintenance_records_user_id_idx").on(table.userId),
  typeIdx: index("maintenance_records_type_idx").on(table.type),
}));

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
});

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

// Equipment Maintenance Templates (recurring maintenance for equipment lifecycle)
export const equipmentMaintenanceTemplates = pgTable("equipment_maintenance_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  equipmentId: varchar("equipment_id").notNull().references(() => equipment.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(), // "Monthly Bearing Check", "Quarterly Belt Inspection"
  description: text("description"),
  
  // Schedule
  intervalType: text("interval_type").notNull(), // "days", "weeks", "months", "cycles"
  intervalValue: integer("interval_value").notNull(), // e.g., 30 for every 30 days
  
  // Reminders
  reminderDaysBefore: integer("reminder_days_before").default(7),
  lastCompleted: timestamp("last_completed"),
  nextDue: timestamp("next_due"),
  
  // Estimated costs
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // Minutes
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  equipmentIdIdx: index("equipment_maint_templates_equipment_id_idx").on(table.equipmentId),
  nextDueIdx: index("equipment_maint_templates_next_due_idx").on(table.nextDue),
}));

export const insertEquipmentMaintenanceTemplateSchema = createInsertSchema(equipmentMaintenanceTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EquipmentMaintenanceTemplate = typeof equipmentMaintenanceTemplates.$inferSelect;
export type InsertEquipmentMaintenanceTemplate = z.infer<typeof insertEquipmentMaintenanceTemplateSchema>;

// Voice Command Log (for AI Voice Assistant)
export const voiceCommands = pgTable("voice_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  transcript: text("transcript").notNull(), // Raw voice transcript
  intent: text("intent"), // Detected intent: "analyze_location", "check_equipment", "market_report"
  entities: jsonb("entities"), // Extracted entities: {address: "123 Main St", metric: "revenue"}
  
  // Processing
  processed: boolean("processed").default(false),
  response: text("response"), // AI response
  actionTaken: text("action_taken"), // What action was executed
  
  // Metadata
  confidence: decimal("confidence", { precision: 4, scale: 3 }), // Speech recognition confidence
  duration: integer("duration"), // Audio duration in ms
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("voice_commands_user_id_idx").on(table.userId),
  intentIdx: index("voice_commands_intent_idx").on(table.intent),
}));

export const insertVoiceCommandSchema = createInsertSchema(voiceCommands).omit({
  id: true,
  createdAt: true,
});

export type VoiceCommand = typeof voiceCommands.$inferSelect;
export type InsertVoiceCommand = z.infer<typeof insertVoiceCommandSchema>;

// ============================================================================
// POS COMMAND CENTER - ENTERPRISE MODULES
// ============================================================================

// ==================== PROMO REDEMPTION HISTORY ====================

// Promo redemption history
export const promoRedemptions = pgTable("promo_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promoCodeId: varchar("promo_code_id").notNull().references(() => promoCodes.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id"), // Customer who redeemed
  orderId: varchar("order_id"), // Related order
  
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).notNull(),
  orderTotal: decimal("order_total", { precision: 10, scale: 2 }),
  
  redeemedAt: timestamp("redeemed_at").defaultNow(),
}, (table) => ({
  promoCodeIdIdx: index("promo_redemptions_promo_id_idx").on(table.promoCodeId),
  customerIdIdx: index("promo_redemptions_customer_idx").on(table.customerId),
}));

export const insertPromoRedemptionSchema = createInsertSchema(promoRedemptions).omit({
  id: true,
  redeemedAt: true,
});

export type PromoRedemption = typeof promoRedemptions.$inferSelect;
export type InsertPromoRedemption = z.infer<typeof insertPromoRedemptionSchema>;

// ==================== DYNAMIC PRICING ====================

export const pricingProfiles = pgTable("pricing_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 100 }).notNull(), // "Peak Hours", "Weekend Special"
  description: text("description"),
  
  // Base pricing
  basePricePerPound: decimal("base_price_per_pound", { precision: 6, scale: 2 }),
  basePriceWasher: decimal("base_price_washer", { precision: 6, scale: 2 }),
  basePriceDryer: decimal("base_price_dryer", { precision: 6, scale: 2 }),
  
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("pricing_profiles_user_id_idx").on(table.userId),
}));

export const insertPricingProfileSchema = createInsertSchema(pricingProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PricingProfile = typeof pricingProfiles.$inferSelect;
export type InsertPricingProfile = z.infer<typeof insertPricingProfileSchema>;

// Special pricing overrides (holidays, events)
export const pricingOverrides = pgTable("pricing_overrides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 100 }).notNull(), // "Black Friday", "Memorial Day"
  description: text("description"),
  
  // Date range
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // All-day or specific hours
  isAllDay: boolean("is_all_day").default(true),
  startTime: varchar("start_time", { length: 5 }), // "00:00" if not all-day
  endTime: varchar("end_time", { length: 5 }),
  
  // Price adjustment
  adjustmentType: varchar("adjustment_type", { length: 20 }).notNull(),
  adjustmentValue: decimal("adjustment_value", { precision: 6, scale: 2 }).notNull(),
  
  // Recurrence
  isRecurringYearly: boolean("is_recurring_yearly").default(false),
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("pricing_overrides_user_id_idx").on(table.userId),
  dateRangeIdx: index("pricing_overrides_date_range_idx").on(table.startDate, table.endDate),
}));

export const insertPricingOverrideSchema = createInsertSchema(pricingOverrides).omit({
  id: true,
  createdAt: true,
});

export type PricingOverride = typeof pricingOverrides.$inferSelect;
export type InsertPricingOverride = z.infer<typeof insertPricingOverrideSchema>;

// ==================== LOYALTY & REWARDS ====================

export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 100 }).notNull(), // "WashBucks Rewards"
  description: text("description"),
  
  // Program type
  programType: varchar("program_type", { length: 20 }).notNull(), // "punch_card", "points", "tiered", "cashback"
  
  // Punch card settings
  punchesRequired: integer("punches_required"), // e.g., 10 punches = 1 free wash
  punchReward: varchar("punch_reward", { length: 100 }), // "Free Wash", "50% off"
  
  // Points settings
  pointsPerDollar: decimal("points_per_dollar", { precision: 4, scale: 2 }), // e.g., 1 point per $1
  pointsRedemptionRate: decimal("points_redemption_rate", { precision: 6, scale: 4 }), // e.g., 100 points = $1
  minimumPointsToRedeem: integer("minimum_points_to_redeem"),
  
  // Tier thresholds (for tiered programs)
  tierThresholds: jsonb("tier_thresholds"), // [{name: "Bronze", minSpend: 0}, {name: "Silver", minSpend: 500}...]
  tierBenefits: jsonb("tier_benefits"), // [{tier: "Bronze", discount: 5}, {tier: "Silver", discount: 10}...]
  
  // General settings
  expirationDays: integer("expiration_days"), // Points/punches expire after X days (null = no expiry)
  welcomeBonus: integer("welcome_bonus").default(0), // Bonus points/punches for joining
  birthdayBonus: integer("birthday_bonus").default(0), // Birthday reward
  referralBonus: integer("referral_bonus").default(0), // For referring friends
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("loyalty_programs_user_id_idx").on(table.userId),
}));

export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;
export type InsertLoyaltyProgram = z.infer<typeof insertLoyaltyProgramSchema>;

// Customer loyalty balances
export const loyaltyBalances = pgTable("loyalty_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull().references(() => loyaltyPrograms.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").notNull(), // References POS customer
  
  // Balance
  currentPoints: integer("current_points").default(0),
  currentPunches: integer("current_punches").default(0),
  lifetimePoints: integer("lifetime_points").default(0),
  lifetimeSpend: decimal("lifetime_spend", { precision: 12, scale: 2 }).default("0"),
  
  // Tier (for tiered programs)
  currentTier: varchar("current_tier", { length: 50 }),
  tierAchievedAt: timestamp("tier_achieved_at"),
  
  // Rewards earned
  rewardsEarned: integer("rewards_earned").default(0),
  rewardsRedeemed: integer("rewards_redeemed").default(0),
  
  // Engagement
  lastActivityAt: timestamp("last_activity_at"),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  
  // Birthday for birthday rewards
  customerBirthday: timestamp("customer_birthday"),
  
  isActive: boolean("is_active").default(true),
}, (table) => ({
  programIdIdx: index("loyalty_balances_program_id_idx").on(table.programId),
  customerIdIdx: index("loyalty_balances_customer_id_idx").on(table.customerId),
  programCustomerIdx: uniqueIndex("loyalty_balances_program_customer_idx").on(table.programId, table.customerId),
}));

export const insertLoyaltyBalanceSchema = createInsertSchema(loyaltyBalances).omit({
  id: true,
  currentPoints: true,
  currentPunches: true,
  lifetimePoints: true,
  lifetimeSpend: true,
  rewardsEarned: true,
  rewardsRedeemed: true,
  enrolledAt: true,
});

export type LoyaltyBalance = typeof loyaltyBalances.$inferSelect;
export type InsertLoyaltyBalance = z.infer<typeof insertLoyaltyBalanceSchema>;

// Loyalty transaction ledger
export const loyaltyLedger = pgTable("loyalty_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  balanceId: varchar("balance_id").notNull().references(() => loyaltyBalances.id, { onDelete: "cascade" }),
  
  // Transaction details
  transactionType: varchar("transaction_type", { length: 30 }).notNull(), // "earn", "redeem", "expire", "bonus", "adjust"
  pointsChange: integer("points_change").notNull(), // Positive or negative
  punchesChange: integer("punches_change"),
  
  // Reference
  orderId: varchar("order_id"),
  description: text("description"), // "Earned from order #123", "Birthday bonus", "Redeemed free wash"
  
  // For redemptions
  rewardRedeemed: varchar("reward_redeemed", { length: 100 }),
  redemptionValue: decimal("redemption_value", { precision: 10, scale: 2 }),
  
  // Balance after transaction
  balanceAfter: integer("balance_after").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  balanceIdIdx: index("loyalty_ledger_balance_id_idx").on(table.balanceId),
  createdAtIdx: index("loyalty_ledger_created_at_idx").on(table.createdAt),
}));

export const insertLoyaltyLedgerSchema = createInsertSchema(loyaltyLedger).omit({
  id: true,
  createdAt: true,
});

export type LoyaltyLedger = typeof loyaltyLedger.$inferSelect;
export type InsertLoyaltyLedger = z.infer<typeof insertLoyaltyLedgerSchema>;

// ==================== MACHINE BOOKING/RESERVATIONS ====================

export const machineBookings = pgTable("machine_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Store owner
  machineId: varchar("machine_id").notNull(), // References machine
  customerId: varchar("customer_id"), // Customer who booked
  
  // Booking details
  bookingDate: timestamp("booking_date").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(), // "14:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "15:00"
  duration: integer("duration").notNull(), // Minutes
  
  // Customer info (if not logged in)
  customerName: varchar("customer_name", { length: 100 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  
  // Status
  status: varchar("status", { length: 20 }).default("confirmed"), // "pending", "confirmed", "checked_in", "completed", "no_show", "cancelled"
  
  // Reminders
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  
  // Check-in
  checkedInAt: timestamp("checked_in_at"),
  
  // Cancellation
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  
  // Pricing
  bookingFee: decimal("booking_fee", { precision: 6, scale: 2 }).default("0"),
  depositPaid: decimal("deposit_paid", { precision: 6, scale: 2 }).default("0"),
  
  // QR Token for check-in
  qrToken: varchar("qr_token", { length: 64 }),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("machine_bookings_user_id_idx").on(table.userId),
  machineIdIdx: index("machine_bookings_machine_id_idx").on(table.machineId),
  dateIdx: index("machine_bookings_date_idx").on(table.bookingDate),
  statusIdx: index("machine_bookings_status_idx").on(table.status),
  qrTokenIdx: index("machine_bookings_qr_token_idx").on(table.qrToken),
}));

export const insertMachineBookingSchema = createInsertSchema(machineBookings).omit({
  id: true,
  reminderSent: true,
  reminderSentAt: true,
  checkedInAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
});

export type MachineBooking = typeof machineBookings.$inferSelect;
export type InsertMachineBooking = z.infer<typeof insertMachineBookingSchema>;

// Booking settings per location
export const bookingSettings = pgTable("booking_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Availability
  bookingEnabled: boolean("booking_enabled").default(true),
  advanceBookingDays: integer("advance_booking_days").default(7), // How far ahead customers can book
  minimumAdvanceMinutes: integer("minimum_advance_minutes").default(60), // Minimum notice required
  
  // Time slots
  slotDuration: integer("slot_duration").default(60), // Default booking duration in minutes
  bufferBetweenSlots: integer("buffer_between_slots").default(15), // Gap between bookings
  
  // Business hours for booking
  bookingHours: jsonb("booking_hours"), // {0: {open: "06:00", close: "22:00"}, 1: {...}}
  
  // No-show policy
  noShowFee: decimal("no_show_fee", { precision: 6, scale: 2 }).default("0"),
  noShowThreshold: integer("no_show_threshold").default(15), // Minutes late before no-show
  
  // Reminders
  sendEmailReminders: boolean("send_email_reminders").default(true),
  sendSmsReminders: boolean("send_sms_reminders").default(false),
  reminderHoursBefore: integer("reminder_hours_before").default(24),
  
  // Deposits
  requireDeposit: boolean("require_deposit").default(false),
  depositAmount: decimal("deposit_amount", { precision: 6, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: uniqueIndex("booking_settings_user_id_idx").on(table.userId),
}));

export const insertBookingSettingsSchema = createInsertSchema(bookingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BookingSettings = typeof bookingSettings.$inferSelect;
export type InsertBookingSettings = z.infer<typeof insertBookingSettingsSchema>;

// Machine time slots for blocking/availability management
export const machineSlots = pgTable("machine_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  machineId: varchar("machine_id").notNull(),
  
  // Slot timing
  date: timestamp("date").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(), // "14:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "15:00"
  
  // Blocking
  isBlocked: boolean("is_blocked").default(false),
  blockReason: varchar("block_reason", { length: 255 }), // "Maintenance", "Out of Order", etc.
  
  // Recurring blocks
  isRecurring: boolean("is_recurring").default(false),
  recurringDays: integer("recurring_days").array(), // [0, 1, 2, 3, 4, 5, 6] for days of week
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("machine_slots_user_id_idx").on(table.userId),
  machineIdIdx: index("machine_slots_machine_id_idx").on(table.machineId),
  dateIdx: index("machine_slots_date_idx").on(table.date),
}));

export const insertMachineSlotSchema = createInsertSchema(machineSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MachineSlot = typeof machineSlots.$inferSelect;
export type InsertMachineSlot = z.infer<typeof insertMachineSlotSchema>;

// ==================== CAMPAIGN DELIVERY LOG ====================

// Campaign message delivery log
export const campaignMessages = pgTable("campaign_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => marketingCampaigns.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").notNull(),
  
  // Delivery
  channel: varchar("channel", { length: 10 }).notNull(), // "sms", "email"
  recipient: varchar("recipient", { length: 255 }).notNull(), // Phone or email
  
  // Status
  status: varchar("status", { length: 20 }).default("pending"), // "pending", "sent", "delivered", "failed", "bounced"
  errorMessage: text("error_message"),
  
  // Engagement
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  convertedAt: timestamp("converted_at"),
  conversionOrderId: varchar("conversion_order_id"),
  
  // External IDs
  externalMessageId: varchar("external_message_id", { length: 100 }), // Twilio SID, SendGrid ID
  
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  campaignIdIdx: index("campaign_messages_campaign_id_idx").on(table.campaignId),
  customerIdIdx: index("campaign_messages_customer_id_idx").on(table.customerId),
  statusIdx: index("campaign_messages_status_idx").on(table.status),
}));

export const insertCampaignMessageSchema = createInsertSchema(campaignMessages).omit({
  id: true,
  sentAt: true,
  createdAt: true,
});

export type CampaignMessage = typeof campaignMessages.$inferSelect;
export type InsertCampaignMessage = z.infer<typeof insertCampaignMessageSchema>;

// Campaign templates
export const campaignTemplates = pgTable("campaign_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // null = system templates
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // "promotional", "retention", "feedback", "seasonal"
  
  // Template content
  subject: varchar("subject", { length: 200 }),
  smsTemplate: text("sms_template"),
  emailTemplate: text("email_template"),
  htmlTemplate: text("html_template"),
  
  // Preview image
  thumbnailUrl: text("thumbnail_url"),
  
  // Suggested timing
  suggestedAudience: varchar("suggested_audience", { length: 30 }),
  suggestedTiming: varchar("suggested_timing", { length: 100 }), // "Weekend mornings", "After 1st visit"
  
  isSystemTemplate: boolean("is_system_template").default(false),
  isActive: boolean("is_active").default(true),
  
  usageCount: integer("usage_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("campaign_templates_user_id_idx").on(table.userId),
  categoryIdx: index("campaign_templates_category_idx").on(table.category),
}));

export const insertCampaignTemplateSchema = createInsertSchema(campaignTemplates).omit({
  id: true,
  usageCount: true,
  createdAt: true,
});

export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type InsertCampaignTemplate = z.infer<typeof insertCampaignTemplateSchema>;

// ==================== FINANCIAL / BOOKS ====================

export const financialTransactions = pgTable("financial_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Transaction details
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // "revenue", "expense", "refund", "adjustment"
  category: varchar("category", { length: 50 }).notNull(), // "machine_revenue", "wash_fold", "utilities", "supplies", "labor", etc.
  subcategory: varchar("subcategory", { length: 50 }),
  
  // Amount
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Description
  description: text("description"),
  notes: text("notes"),
  
  // Reference
  orderId: varchar("order_id"),
  paymentMethod: varchar("payment_method", { length: 30 }), // "cash", "card", "mobile", "coin"
  
  // For expenses
  vendorName: varchar("vendor_name", { length: 100 }),
  receiptUrl: text("receipt_url"),
  
  // Tax
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  taxCategory: varchar("tax_category", { length: 50 }), // "sales_tax", "payroll_tax", "property_tax"
  isTaxDeductible: boolean("is_tax_deductible").default(false),
  
  // Reconciliation
  isReconciled: boolean("is_reconciled").default(false),
  reconciledAt: timestamp("reconciled_at"),
  
  transactionDate: timestamp("transaction_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("financial_transactions_user_id_idx").on(table.userId),
  typeIdx: index("financial_transactions_type_idx").on(table.transactionType),
  categoryIdx: index("financial_transactions_category_idx").on(table.category),
  dateIdx: index("financial_transactions_date_idx").on(table.transactionDate),
}));

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  isReconciled: true,
  reconciledAt: true,
  createdAt: true,
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;

// Daily reconciliation records
export const dailyReconciliations = pgTable("daily_reconciliations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  reconciliationDate: timestamp("reconciliation_date").notNull(),
  
  // Expected vs Actual
  expectedRevenue: decimal("expected_revenue", { precision: 12, scale: 2 }).notNull(),
  actualRevenue: decimal("actual_revenue", { precision: 12, scale: 2 }).notNull(),
  variance: decimal("variance", { precision: 12, scale: 2 }).notNull(),
  variancePercent: decimal("variance_percent", { precision: 6, scale: 2 }),
  
  // Breakdown
  cashRevenue: decimal("cash_revenue", { precision: 12, scale: 2 }).default("0"),
  cardRevenue: decimal("card_revenue", { precision: 12, scale: 2 }).default("0"),
  mobileRevenue: decimal("mobile_revenue", { precision: 12, scale: 2 }).default("0"),
  coinRevenue: decimal("coin_revenue", { precision: 12, scale: 2 }).default("0"),
  
  // Order counts
  totalOrders: integer("total_orders").default(0),
  totalRefunds: integer("total_refunds").default(0),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default("0"),
  
  // Notes
  notes: text("notes"),
  discrepancyNotes: text("discrepancy_notes"),
  
  // Status
  status: varchar("status", { length: 20 }).default("pending"), // "pending", "reviewed", "approved", "flagged"
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("daily_reconciliations_user_id_idx").on(table.userId),
  dateIdx: uniqueIndex("daily_reconciliations_date_idx").on(table.userId, table.reconciliationDate),
}));

export const insertDailyReconciliationSchema = createInsertSchema(dailyReconciliations).omit({
  id: true,
  reviewedAt: true,
  createdAt: true,
});

export type DailyReconciliation = typeof dailyReconciliations.$inferSelect;
export type InsertDailyReconciliation = z.infer<typeof insertDailyReconciliationSchema>;

// Tax categories for expense tracking
export const expenseCategories = pgTable("expense_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // null = system categories
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }), // Hex color
  
  // Tax info
  taxCategory: varchar("tax_category", { length: 50 }), // IRS category
  isTaxDeductible: boolean("is_tax_deductible").default(true),
  
  // Budget
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }),
  
  isSystemCategory: boolean("is_system_category").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("expense_categories_user_id_idx").on(table.userId),
}));

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({
  id: true,
  createdAt: true,
});

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;

// ==================== WEBSITE-POS INTEGRATION WIDGETS ====================

// Website-POS integration widgets
export const websiteWidgets = pgTable("website_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Widget type
  widgetType: varchar("widget_type", { length: 30 }).notNull(), // "machine_availability", "booking", "loyalty_portal", "promo_banner", "pricing", "order_status"
  
  // Configuration
  name: varchar("name", { length: 100 }).notNull(),
  config: jsonb("config").notNull(), // Widget-specific settings
  styles: jsonb("styles"), // Custom styling
  
  // Placement
  position: varchar("position", { length: 20 }), // "header", "footer", "sidebar", "popup", "inline"
  
  // Display rules
  displayRules: jsonb("display_rules"), // {pages: ["home", "services"], showOnMobile: true}
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("website_widgets_user_id_idx").on(table.userId),
  typeIdx: index("website_widgets_type_idx").on(table.widgetType),
}));

export const insertWebsiteWidgetSchema = createInsertSchema(websiteWidgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WebsiteWidget = typeof websiteWidgets.$inferSelect;
export type InsertWebsiteWidget = z.infer<typeof insertWebsiteWidgetSchema>;

// ============================================================================
// PARTS ORDERING & INVENTORY MANAGEMENT SYSTEM
// ============================================================================

// Parts Catalog - Supplier catalog with affiliate links
export const partsCatalog = pgTable("parts_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  partNumber: varchar("part_number", { length: 100 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  manufacturer: varchar("manufacturer", { length: 100 }),
  machineType: varchar("machine_type", { length: 50 }), // "washer", "dryer", "payment", "other"
  
  category: varchar("category", { length: 100 }), // "Motors", "Belts", "Bearings", "Controls", "Seals", etc.
  
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  supplierPrice: decimal("supplier_price", { precision: 10, scale: 2 }), // Our cost (if different)
  
  supplier: varchar("supplier", { length: 100 }).notNull(), // "Amazon", "AAdvantage Laundry", "Direct", etc.
  affiliateUrl: text("affiliate_url"), // Amazon affiliate link
  supplierSku: varchar("supplier_sku", { length: 100 }), // Supplier's part number
  
  inStock: boolean("in_stock").default(true).notNull(),
  leadTimeDays: integer("lead_time_days").default(3),
  
  imageUrl: text("image_url"),
  
  compatibleModels: text("compatible_models").array(), // Array of compatible machine models
  tags: text("tags").array(), // Search tags
  
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  partNumberIdx: index("parts_catalog_part_number_idx").on(table.partNumber),
  manufacturerIdx: index("parts_catalog_manufacturer_idx").on(table.manufacturer),
  supplierIdx: index("parts_catalog_supplier_idx").on(table.supplier),
  machineTypeIdx: index("parts_catalog_machine_type_idx").on(table.machineType),
}));

export const insertPartsCatalogSchema = createInsertSchema(partsCatalog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PartsCatalog = typeof partsCatalog.$inferSelect;
export type InsertPartsCatalog = z.infer<typeof insertPartsCatalogSchema>;

// Inventory Items - Stock tracking per location
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  locationId: varchar("location_id"), // References laundromat location, null = main warehouse
  locationName: varchar("location_name", { length: 200 }), // Denormalized for display
  
  partNumber: varchar("part_number", { length: 100 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  
  quantity: integer("quantity").default(0).notNull(),
  reorderPoint: integer("reorder_point").default(2).notNull(), // Alert when below this
  maxQuantity: integer("max_quantity"), // Target stock level
  
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  lastPurchasePrice: decimal("last_purchase_price", { precision: 10, scale: 2 }),
  
  supplier: varchar("supplier", { length: 100 }),
  preferredSupplierId: varchar("preferred_supplier_id"), // Foreign key to parts_catalog
  
  category: varchar("category", { length: 100 }),
  machineType: varchar("machine_type", { length: 50 }),
  
  binLocation: varchar("bin_location", { length: 50 }), // Physical storage location
  
  lastCountDate: timestamp("last_count_date"),
  lastUsedDate: timestamp("last_used_date"),
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("inventory_items_user_id_idx").on(table.userId),
  locationIdIdx: index("inventory_items_location_id_idx").on(table.locationId),
  partNumberIdx: index("inventory_items_part_number_idx").on(table.partNumber),
  reorderAlertIdx: index("inventory_items_reorder_alert_idx").on(table.quantity, table.reorderPoint),
}));

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

// Inventory Usage History - Track part usage
export const inventoryUsage = pgTable("inventory_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  
  quantityUsed: integer("quantity_used").notNull(),
  usageType: varchar("usage_type", { length: 30 }).notNull(), // "repair", "maintenance", "adjustment", "loss", "return"
  
  repairTicketId: varchar("repair_ticket_id"), // Link to repair ticket if applicable
  machineId: varchar("machine_id"), // Which machine used the part
  machineName: varchar("machine_name", { length: 200 }),
  
  notes: text("notes"),
  
  usedAt: timestamp("used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("inventory_usage_user_id_idx").on(table.userId),
  inventoryItemIdIdx: index("inventory_usage_item_id_idx").on(table.inventoryItemId),
  usedAtIdx: index("inventory_usage_used_at_idx").on(table.usedAt),
}));

export const insertInventoryUsageSchema = createInsertSchema(inventoryUsage).omit({
  id: true,
  createdAt: true,
});

export type InventoryUsage = typeof inventoryUsage.$inferSelect;
export type InsertInventoryUsage = z.infer<typeof insertInventoryUsageSchema>;

// Purchase Orders - Order management
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  poNumber: varchar("po_number", { length: 50 }).notNull(), // User-friendly order number
  
  supplierId: varchar("supplier_id"), // Optional foreign key to parts_catalog
  supplierName: varchar("supplier_name", { length: 100 }).notNull(),
  supplierContact: varchar("supplier_contact", { length: 200 }),
  
  status: varchar("status", { length: 30 }).notNull().default("draft"), // "draft", "ordered", "shipped", "partial", "received", "cancelled"
  
  items: jsonb("items").notNull(), // Array of {catalogId, partNumber, name, quantity, unitPrice, receivedQty}
  
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  
  locationId: varchar("location_id"), // Delivery location
  locationName: varchar("location_name", { length: 200 }),
  
  shippingAddress: text("shipping_address"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  
  notes: text("notes"),
  
  orderDate: timestamp("order_date"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  shippedDate: timestamp("shipped_date"),
  receivedDate: timestamp("received_date"),
  
  repairTicketId: varchar("repair_ticket_id"), // Link to repair ticket if ordering for specific repair
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("purchase_orders_user_id_idx").on(table.userId),
  poNumberIdx: uniqueIndex("purchase_orders_po_number_idx").on(table.userId, table.poNumber),
  statusIdx: index("purchase_orders_status_idx").on(table.status),
  orderDateIdx: index("purchase_orders_order_date_idx").on(table.orderDate),
}));

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

// Purchase Order Item Schema for validation
export const purchaseOrderItemSchema = z.object({
  catalogId: z.string().optional(),
  partNumber: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  receivedQty: z.number().min(0).default(0),
});

export type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;

// ============================================================================
// ROUTE OPTIMIZATION - Pickup & Delivery (PUD) Operations
// ============================================================================

// Delivery Routes - Daily routes for drivers
export const deliveryRoutes = pgTable("delivery_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  driverId: varchar("driver_id").references(() => users.id, { onDelete: "set null" }),
  driverName: varchar("driver_name", { length: 200 }),
  driverPhone: varchar("driver_phone", { length: 50 }),
  driverPhotoUrl: text("driver_photo_url"),
  vehicleDescription: varchar("vehicle_description", { length: 200 }), // "White Honda Civic"
  locationSharingActive: boolean("location_sharing_active").default(false),
  currentDriverLat: decimal("current_driver_lat", { precision: 10, scale: 7 }),
  currentDriverLng: decimal("current_driver_lng", { precision: 10, scale: 7 }),
  lastDriverLocationUpdate: timestamp("last_driver_location_update"),
  
  routeDate: timestamp("route_date").notNull(),
  routeName: varchar("route_name", { length: 200 }),
  
  status: varchar("status", { length: 30 }).notNull().default("draft"), // "draft", "scheduled", "in_progress", "completed", "cancelled"
  
  optimizedPath: jsonb("optimized_path"), // Array of coordinates for polyline rendering
  optimizedOrder: jsonb("optimized_order"), // Array of stop IDs in optimal order
  
  startAddress: text("start_address"),
  startLat: decimal("start_lat", { precision: 10, scale: 7 }),
  startLng: decimal("start_lng", { precision: 10, scale: 7 }),
  
  endAddress: text("end_address"),
  endLat: decimal("end_lat", { precision: 10, scale: 7 }),
  endLng: decimal("end_lng", { precision: 10, scale: 7 }),
  
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }), // in miles
  totalDuration: integer("total_duration"), // in minutes
  
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  
  vehicleInfo: jsonb("vehicle_info"), // {plateNumber, model, capacity}
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("delivery_routes_user_id_idx").on(table.userId),
  driverIdIdx: index("delivery_routes_driver_id_idx").on(table.driverId),
  routeDateIdx: index("delivery_routes_route_date_idx").on(table.routeDate),
  statusIdx: index("delivery_routes_status_idx").on(table.status),
}));

export const insertDeliveryRouteSchema = createInsertSchema(deliveryRoutes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DeliveryRoute = typeof deliveryRoutes.$inferSelect;
export type InsertDeliveryRoute = z.infer<typeof insertDeliveryRouteSchema>;

// Delivery Stops - Individual stops on a route
export const deliveryStops = pgTable("delivery_stops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  routeId: varchar("route_id").notNull().references(() => deliveryRoutes.id, { onDelete: "cascade" }),
  
  customerId: varchar("customer_id"),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  customerEmail: varchar("customer_email", { length: 200 }),
  
  address: text("address").notNull(),
  addressLine2: varchar("address_line_2", { length: 200 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  
  serviceType: varchar("service_type", { length: 30 }).notNull().default("both"), // "pickup", "delivery", "both"
  
  timeWindowStart: varchar("time_window_start", { length: 10 }), // "09:00"
  timeWindowEnd: varchar("time_window_end", { length: 10 }), // "12:00"
  
  estimatedServiceTime: integer("estimated_service_time").default(10), // in minutes
  estimatedArrival: timestamp("estimated_arrival"),
  
  sequence: integer("sequence").notNull().default(0),
  
  status: varchar("status", { length: 30 }).notNull().default("pending"), // "pending", "en_route", "arrived", "completed", "failed", "skipped"
  
  completedAt: timestamp("completed_at"),
  arrivedAt: timestamp("arrived_at"),
  
  signatureUrl: text("signature_url"),
  photoProofUrls: jsonb("photo_proof_urls"), // Array of photo URLs
  
  specialInstructions: text("special_instructions"),
  notes: text("notes"),
  completionNotes: text("completion_notes"),
  
  itemCount: integer("item_count").default(0), // Number of items to pickup/deliver
  itemWeight: decimal("item_weight", { precision: 8, scale: 2 }), // Weight in lbs
  
  // Live Tracking Fields
  trackingToken: varchar("tracking_token", { length: 64 }).unique(), // Unique token for public tracking URL
  driverLocation: jsonb("driver_location"), // {lat, lng, heading, speed, updatedAt}
  locationSharingEnabled: boolean("location_sharing_enabled").default(true),
  etaMinutes: integer("eta_minutes"), // Estimated time of arrival in minutes
  lastLocationUpdate: timestamp("last_location_update"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  routeIdIdx: index("delivery_stops_route_id_idx").on(table.routeId),
  customerIdIdx: index("delivery_stops_customer_id_idx").on(table.customerId),
  sequenceIdx: index("delivery_stops_sequence_idx").on(table.routeId, table.sequence),
  statusIdx: index("delivery_stops_status_idx").on(table.status),
  trackingTokenIdx: uniqueIndex("delivery_stops_tracking_token_idx").on(table.trackingToken),
}));

export const insertDeliveryStopSchema = createInsertSchema(deliveryStops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DeliveryStop = typeof deliveryStops.$inferSelect;
export type InsertDeliveryStop = z.infer<typeof insertDeliveryStopSchema>;

// ============================================================================
// MARKETING & LOYALTY ENGINE - Coupon & Promo System
// ============================================================================

// Coupons & Promo Codes
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id, { onDelete: "cascade" }).notNull(),
  
  // Code Details
  code: varchar("code", { length: 50 }).notNull(), // "SUMMER20", "FIRSTORDER"
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  
  // Discount Type
  discountType: varchar("discount_type", { length: 30 }).notNull(), // "percentage", "fixed_amount", "free_service", "buy_x_get_y", "points_multiplier"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(), // 20 for 20% or $20
  
  // For buy-x-get-y promotions
  buyQuantity: integer("buy_quantity"),
  getQuantity: integer("get_quantity"),
  applicableService: varchar("applicable_service", { length: 100 }), // Service type this applies to
  
  // Usage Limits
  usageLimit: integer("usage_limit"), // Total uses allowed (null = unlimited)
  usageLimitPerCustomer: integer("usage_limit_per_customer").default(1), // Per customer limit
  usedCount: integer("used_count").default(0).notNull(),
  
  // Conditions
  minimumOrderAmount: decimal("minimum_order_amount", { precision: 10, scale: 2 }),
  minimumWeight: decimal("minimum_weight", { precision: 10, scale: 2 }),
  
  // Targeting
  isFirstOrderOnly: boolean("is_first_order_only").default(false),
  targetTiers: jsonb("target_tiers"), // ["Gold", "Platinum"] - only available to these tiers
  targetCustomerIds: jsonb("target_customer_ids"), // Specific customer IDs
  
  // Validity
  startsAt: timestamp("starts_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Auto-generation (for unique codes)
  isAutoGenerated: boolean("is_auto_generated").default(false),
  parentCouponId: varchar("parent_coupon_id"), // For auto-generated codes linked to a campaign
  
  // Campaign Link
  campaignId: varchar("campaign_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => ({
  codeIdx: uniqueIndex("coupons_code_laundromat_idx").on(table.code, table.laundromatId),
  laundromatIdx: index("coupons_laundromat_idx").on(table.laundromatId),
  campaignIdx: index("coupons_campaign_idx").on(table.campaignId),
  activeIdx: index("coupons_active_idx").on(table.isActive),
}));

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  usedCount: true,
  createdAt: true,
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;

// Coupon Redemptions - Track individual redemptions
export const couponRedemptions = pgTable("coupon_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: "cascade" }).notNull(),
  customerId: varchar("customer_id").notNull(),
  transactionId: varchar("transaction_id").references(() => posTransactions.id, { onDelete: "set null" }),
  
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).notNull(),
  orderTotal: decimal("order_total", { precision: 10, scale: 2 }),
  
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
}, (table) => ({
  couponIdx: index("coupon_redemptions_coupon_idx").on(table.couponId),
  customerIdx: index("coupon_redemptions_customer_idx").on(table.customerId),
  redeemedAtIdx: index("coupon_redemptions_redeemed_idx").on(table.redeemedAt),
}));

export const insertCouponRedemptionSchema = createInsertSchema(couponRedemptions).omit({
  id: true,
  redeemedAt: true,
});

export type CouponRedemption = typeof couponRedemptions.$inferSelect;
export type InsertCouponRedemption = z.infer<typeof insertCouponRedemptionSchema>;

// Operator Marketing Campaigns - Multi-tenant campaigns for laundromats
export const operatorCampaigns = pgTable("operator_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id, { onDelete: "cascade" }).notNull(),
  
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 30 }).notNull(), // "email", "sms", "in_app", "push"
  subject: varchar("subject", { length: 500 }),
  content: text("content").notNull(),
  contentVariantB: text("content_variant_b"),
  abTestPercentage: integer("ab_test_percentage").default(50),
  
  audienceType: varchar("audience_type", { length: 50 }).notNull(),
  audienceFilters: jsonb("audience_filters"),
  estimatedReach: integer("estimated_reach").default(0),
  
  scheduleType: varchar("schedule_type", { length: 30 }).notNull().default("one_time"),
  scheduledFor: timestamp("scheduled_for"),
  recurringPattern: jsonb("recurring_pattern"),
  
  couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
  status: varchar("status", { length: 30 }).notNull().default("draft"),
  
  totalSent: integer("total_sent").default(0).notNull(),
  totalOpens: integer("total_opens").default(0).notNull(),
  totalClicks: integer("total_clicks").default(0).notNull(),
  totalConversions: integer("total_conversions").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("operator_campaigns_laundromat_idx").on(table.laundromatId),
  statusIdx: index("operator_campaigns_status_idx").on(table.status),
}));

export const insertOperatorCampaignSchema = createInsertSchema(operatorCampaigns).omit({
  id: true,
  totalSent: true,
  totalOpens: true,
  totalClicks: true,
  totalConversions: true,
  createdAt: true,
  updatedAt: true,
});

export type OperatorCampaign = typeof operatorCampaigns.$inferSelect;
export type InsertOperatorCampaign = z.infer<typeof insertOperatorCampaignSchema>;

// Campaign Recipients - Track individual sends
export const campaignRecipients = pgTable("campaign_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => operatorCampaigns.id, { onDelete: "cascade" }).notNull(),
  customerId: varchar("customer_id").notNull(),
  
  // Delivery
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  
  // Variant Assignment
  variant: varchar("variant", { length: 1 }).default("A"), // "A" or "B"
  
  // Personalized Coupon
  personalCouponCode: varchar("personal_coupon_code", { length: 50 }),
  
  // Status
  status: varchar("status", { length: 30 }).default("pending"), // "pending", "sent", "delivered", "bounced", "failed"
  
  // Engagement
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  convertedAt: timestamp("converted_at"),
  conversionAmount: decimal("conversion_amount", { precision: 10, scale: 2 }),
  
  // Error Tracking
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdx: index("campaign_recipients_campaign_idx").on(table.campaignId),
  customerIdx: index("campaign_recipients_customer_idx").on(table.customerId),
  statusIdx: index("campaign_recipients_status_idx").on(table.status),
}));

export const insertCampaignRecipientSchema = createInsertSchema(campaignRecipients).omit({
  id: true,
  createdAt: true,
});

export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = z.infer<typeof insertCampaignRecipientSchema>;

// Win-Back Automation Rules
export const winBackRules = pgTable("win_back_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  laundromatId: varchar("laundromat_id").references(() => laundromats.id, { onDelete: "cascade" }).notNull(),
  
  name: varchar("name", { length: 200 }).notNull(),
  
  // Trigger Condition
  daysSinceLastVisit: integer("days_since_last_visit").notNull(), // Trigger after X days of inactivity
  
  // Target Customers
  minLifetimeSpend: decimal("min_lifetime_spend", { precision: 10, scale: 2 }), // Only target high-value customers
  targetTiers: jsonb("target_tiers"), // ["Silver", "Gold", "Platinum"]
  
  // Action
  actionType: varchar("action_type", { length: 30 }).notNull(), // "email", "sms", "coupon"
  campaignTemplateId: varchar("campaign_template_id").references(() => operatorCampaigns.id, { onDelete: "set null" }),
  couponTemplateId: varchar("coupon_template_id").references(() => coupons.id, { onDelete: "set null" }),
  
  // Escalation (send another if no response)
  followUpDays: integer("follow_up_days"), // Send follow-up X days after initial
  followUpCampaignId: varchar("follow_up_campaign_id").references(() => operatorCampaigns.id, { onDelete: "set null" }),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Stats
  totalTriggered: integer("total_triggered").default(0).notNull(),
  totalConverted: integer("total_converted").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  laundromatIdx: index("win_back_rules_laundromat_idx").on(table.laundromatId),
  activeIdx: index("win_back_rules_active_idx").on(table.isActive),
}));

export const insertWinBackRuleSchema = createInsertSchema(winBackRules).omit({
  id: true,
  totalTriggered: true,
  totalConverted: true,
  createdAt: true,
  updatedAt: true,
});

export type WinBackRule = typeof winBackRules.$inferSelect;
export type InsertWinBackRule = z.infer<typeof insertWinBackRuleSchema>;

// Win-Back Events - Track triggered win-back automation
export const winBackEvents = pgTable("win_back_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").references(() => winBackRules.id, { onDelete: "cascade" }).notNull(),
  customerId: varchar("customer_id").notNull(),
  
  // Trigger
  lastVisitDate: timestamp("last_visit_date").notNull(),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
  
  // Action Taken
  campaignSentId: varchar("campaign_sent_id").references(() => operatorCampaigns.id, { onDelete: "set null" }),
  couponSentId: varchar("coupon_sent_id").references(() => coupons.id, { onDelete: "set null" }),
  
  // Outcome
  status: varchar("status", { length: 30 }).default("pending"), // "pending", "sent", "opened", "converted", "expired"
  returnVisitDate: timestamp("return_visit_date"),
  returnTransactionId: varchar("return_transaction_id").references(() => posTransactions.id, { onDelete: "set null" }),
  revenueRecovered: decimal("revenue_recovered", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ruleIdx: index("win_back_events_rule_idx").on(table.ruleId),
  customerIdx: index("win_back_events_customer_idx").on(table.customerId),
  statusIdx: index("win_back_events_status_idx").on(table.status),
}));

export const insertWinBackEventSchema = createInsertSchema(winBackEvents).omit({
  id: true,
  createdAt: true,
});

export type WinBackEvent = typeof winBackEvents.$inferSelect;
export type InsertWinBackEvent = z.infer<typeof insertWinBackEventSchema>;

// ============================================================================
// SAVED ANALYSES SYSTEM - User's saved calculator/AI results
// ============================================================================

export const savedAnalyses = pgTable("saved_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  analysisType: varchar("analysis_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("saved_analyses_user_idx").on(table.userId),
  typeIdx: index("saved_analyses_type_idx").on(table.analysisType),
  createdAtIdx: index("saved_analyses_created_at_idx").on(table.createdAt),
}));

export const insertSavedAnalysisSchema = createInsertSchema(savedAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SavedAnalysis = typeof savedAnalyses.$inferSelect;
export type InsertSavedAnalysis = z.infer<typeof insertSavedAnalysisSchema>;

// ============================================================================
// AUDIT LOGS - Enterprise compliance and security tracking
// ============================================================================

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  ipAddress: varchar("ip_address"),
  endpoint: varchar("endpoint").notNull(),
  method: varchar("method").notNull(),
  statusCode: integer("status_code"),
  duration: integer("duration_ms"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("audit_logs_user_idx").on(table.userId),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  statusCodeIdx: index("audit_logs_status_code_idx").on(table.statusCode),
}));

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// ============================================================================
// CUSTOMIZABLE DASHBOARD SYSTEM - Drag-and-Drop Widget Builder
// ============================================================================

// Widget Types Enum for type safety
export const WIDGET_TYPES = {
  // POS Widgets
  POS_REVENUE_CARD: "pos_revenue_card",
  POS_ORDERS_TODAY: "pos_orders_today",
  POS_MACHINE_STATUS: "pos_machine_status",
  POS_RECENT_ORDERS: "pos_recent_orders",
  POS_REVENUE_CHART: "pos_revenue_chart",
  POS_SERVICE_BREAKDOWN: "pos_service_breakdown",
  
  // Service Guy AI Widgets
  SERVICE_REPAIR_TICKETS: "service_repair_tickets",
  SERVICE_MAINTENANCE_DUE: "service_maintenance_due",
  SERVICE_DIAGNOSTIC_QUICK: "service_diagnostic_quick",
  SERVICE_PARTS_LOW: "service_parts_low",
  
  // CLEANBI Widgets
  CLEANBI_RECENT_SCORES: "cleanbi_recent_scores",
  CLEANBI_SAVED_ANALYSES: "cleanbi_saved_analyses",
  CLEANBI_QUOTA_STATUS: "cleanbi_quota_status",
  CLEANBI_SCORE_CHART: "cleanbi_score_chart",
  
  // Website Builder Widgets
  WEBSITE_PROJECTS: "website_projects",
  WEBSITE_QUICK_BUILD: "website_quick_build",
  
  // Calculator Widgets
  CALC_QUICK_ACCESS: "calc_quick_access",
  CALC_SAVED_RESULTS: "calc_saved_results",
  CALC_ROI_SUMMARY: "calc_roi_summary",
  
  // Analytics Widgets
  ANALYTICS_KPI_GRID: "analytics_kpi_grid",
  ANALYTICS_TREND_LINE: "analytics_trend_line",
  ANALYTICS_PIE_CHART: "analytics_pie_chart",
  ANALYTICS_GAUGE: "analytics_gauge",
  ANALYTICS_HEATMAP: "analytics_heatmap",
  
  // Activity & Social
  ACTIVITY_FEED: "activity_feed",
  NOTIFICATIONS: "notifications",
  SAVED_ITEMS: "saved_items",
  RECENT_VIEWED: "recent_viewed",
  
  // Quick Actions
  QUICK_ACTIONS: "quick_actions",
  SHORTCUTS: "shortcuts",
} as const;

export type WidgetType = typeof WIDGET_TYPES[keyof typeof WIDGET_TYPES];

// Dashboard Layouts - User's saved dashboard configurations
export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Layout Identity
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false), // Share with other users
  
  // Layout Settings
  theme: varchar("theme", { length: 20 }).default("dark"), // "light", "dark", "system"
  columns: integer("columns").default(12), // Grid columns (12 is standard)
  rowHeight: integer("row_height").default(80), // Pixel height per row
  compactType: varchar("compact_type", { length: 20 }).default("vertical"), // "vertical", "horizontal", null
  
  // Layout Data (JSON blob for flexibility)
  layout: jsonb("layout").notNull().default(sql`'[]'::jsonb`), // Array of widget positions
  
  // Metadata
  thumbnail: text("thumbnail"), // Auto-generated preview image
  viewCount: integer("view_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("dashboard_layouts_user_idx").on(table.userId),
  defaultIdx: index("dashboard_layouts_default_idx").on(table.isDefault),
  publicIdx: index("dashboard_layouts_public_idx").on(table.isPublic),
}));

export const insertDashboardLayoutSchema = createInsertSchema(dashboardLayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export type DashboardLayout = typeof dashboardLayouts.$inferSelect;
export type InsertDashboardLayout = z.infer<typeof insertDashboardLayoutSchema>;

// Dashboard Widget Instances - Individual widgets in a layout
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  layoutId: varchar("layout_id").notNull().references(() => dashboardLayouts.id, { onDelete: "cascade" }),
  
  // Widget Identity
  widgetType: varchar("widget_type", { length: 50 }).notNull(), // From WIDGET_TYPES
  title: varchar("title", { length: 100 }), // Custom title override
  
  // Grid Position (react-grid-layout compatible)
  x: integer("x").notNull().default(0), // Grid column
  y: integer("y").notNull().default(0), // Grid row
  w: integer("w").notNull().default(4), // Width in grid units
  h: integer("h").notNull().default(3), // Height in grid units
  minW: integer("min_w").default(2),
  minH: integer("min_h").default(2),
  maxW: integer("max_w"),
  maxH: integer("max_h"),
  
  // Widget Configuration
  settings: jsonb("settings").default(sql`'{}'::jsonb`), // Widget-specific settings
  dataSource: jsonb("data_source"), // Custom data query overrides
  refreshInterval: integer("refresh_interval").default(60), // Seconds (0 = manual)
  
  // Display Options
  showHeader: boolean("show_header").default(true),
  showBorder: boolean("show_border").default(true),
  backgroundColor: varchar("background_color", { length: 20 }),
  
  // State
  isCollapsed: boolean("is_collapsed").default(false),
  isLocked: boolean("is_locked").default(false), // Prevent moving/resizing
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  layoutIdx: index("dashboard_widgets_layout_idx").on(table.layoutId),
  typeIdx: index("dashboard_widgets_type_idx").on(table.widgetType),
}));

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;

// Widget Layout Item Type (for JSON layout array)
export const widgetLayoutItemSchema = z.object({
  i: z.string(), // Widget ID
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
  maxW: z.number().optional(),
  maxH: z.number().optional(),
  static: z.boolean().optional(),
});

export type WidgetLayoutItem = z.infer<typeof widgetLayoutItemSchema>;

// Dashboard Templates - Pre-built layouts users can clone
export const dashboardTemplates = pgTable("dashboard_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Template Identity
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // "operator", "owner", "investor", "service_tech"
  
  // Template Data
  layout: jsonb("layout").notNull(), // Default widget positions
  widgets: jsonb("widgets").notNull(), // Default widget configurations
  
  // Display
  thumbnail: text("thumbnail"),
  isPremium: boolean("is_premium").default(false),
  
  // Stats
  usageCount: integer("usage_count").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("dashboard_templates_category_idx").on(table.category),
  premiumIdx: index("dashboard_templates_premium_idx").on(table.isPremium),
}));

export const insertDashboardTemplateSchema = createInsertSchema(dashboardTemplates).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

export type DashboardTemplate = typeof dashboardTemplates.$inferSelect;
export type InsertDashboardTemplate = z.infer<typeof insertDashboardTemplateSchema>;

// ============================================================================
// LOCATION INTELLIGENCE SYSTEM - Demographics, Walkability, Aerial Views
// ============================================================================

// Location Demographics (ATTOM + Census data)
export const locationDemographicsSchema = z.object({
  population: z.number(),
  populationDensity: z.number(),
  medianHouseholdIncome: z.number(),
  medianAge: z.number(),
  householdCount: z.number(),
  renterPercentage: z.number(),
  ownerPercentage: z.number(),
  averageHouseholdSize: z.number(),
  educationBachelorPlus: z.number(),
  unemploymentRate: z.number(),
  povertyRate: z.number(),
  growthRate5Year: z.number().optional(),
  projectedGrowth: z.number().optional(),
  dataSource: z.enum(["attom", "census", "estimate"]),
  lastUpdated: z.string(),
  confidence: z.number().min(0).max(100),
});

export type LocationDemographics = z.infer<typeof locationDemographicsSchema>;

// Walkability Metrics (Walk Score API)
export const walkabilityMetricsSchema = z.object({
  walkScore: z.number().min(0).max(100),
  walkDescription: z.string(),
  transitScore: z.number().min(0).max(100).nullable(),
  transitDescription: z.string().nullable(),
  transitSummary: z.string().nullable(),
  bikeScore: z.number().min(0).max(100).nullable(),
  bikeDescription: z.string().nullable(),
  nearbyAmenities: z.array(z.object({
    type: z.string(),
    name: z.string(),
    distance: z.string(),
  })).optional(),
  logoUrl: z.string(),
  moreInfoLink: z.string(),
});

export type WalkabilityMetrics = z.infer<typeof walkabilityMetricsSchema>;

// Aerial View Preview (Google Aerial View API)
export const aerialPreviewSchema = z.object({
  imageUrl: z.string(),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  viewType: z.enum(["satellite", "aerial_3d", "street_level"]),
  captureDate: z.string().optional(),
  resolution: z.enum(["low", "medium", "high"]).default("medium"),
  available: z.boolean(),
  error: z.string().optional(),
});

export type AerialPreview = z.infer<typeof aerialPreviewSchema>;

// Combined Location Intelligence Response
export const locationIntelligenceSchema = z.object({
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  demographics: locationDemographicsSchema.optional(),
  walkability: walkabilityMetricsSchema.optional(),
  aerialPreview: aerialPreviewSchema.optional(),
  fetchedAt: z.string(),
  tier: z.string().default("free"),
});

export type LocationIntelligence = z.infer<typeof locationIntelligenceSchema>;

// Voice Diagnostic Input (for Service Guy AI)
export const voiceDiagnosticInputSchema = z.object({
  transcript: z.string(),
  manufacturer: z.string().optional(),
  machineType: z.enum(["washer", "dryer", "payment", "unknown"]).optional(),
  errorCode: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
});

export type VoiceDiagnosticInput = z.infer<typeof voiceDiagnosticInputSchema>;

// Vision Diagnostic Result (for equipment photo analysis)
export const visionDiagnosticResultSchema = z.object({
  extractedText: z.string(),
  errorCodes: z.array(z.object({
    code: z.string(),
    description: z.string(),
    confidence: z.number(),
  })),
  detectedBrand: z.string().nullable(),
  detectedModel: z.string().nullable(),
  machineType: z.enum(["washer", "dryer", "payment", "unknown"]),
  visibleParts: z.array(z.object({
    name: z.string(),
    condition: z.enum(["good", "worn", "damaged", "unknown"]),
    notes: z.string(),
  })),
  wearPatterns: z.array(z.object({
    area: z.string(),
    severity: z.enum(["minor", "moderate", "severe"]),
    description: z.string(),
  })),
  damageAssessment: z.array(z.object({
    type: z.string(),
    location: z.string(),
    severity: z.enum(["minor", "moderate", "severe"]),
    repairRecommendation: z.string(),
  })),
  overallCondition: z.enum(["excellent", "good", "fair", "poor", "critical"]),
  recommendations: z.array(z.string()),
  estimatedUrgency: z.enum(["immediate", "soon", "routine", "monitor"]),
  analyzedAt: z.string(),
  confidence: z.number(),
});

export type VisionDiagnosticResult = z.infer<typeof visionDiagnosticResultSchema>;

// ============================================================================
// END OF SCHEMA - Complete Platform with Industry-Leading Features
// ============================================================================
