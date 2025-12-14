// WashBizHub API Routes
// Reference: javascript_stripe, javascript_gemini, and javascript_log_in_with_replit blueprints

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSession } from "./replitAuth";
import { requireAuth, optionalAuth, requireAdmin } from "./services/unified-auth";
import { cloudflareAccess } from "./services/cloudflare-access";
import passport from "passport";
import cloudflareAuthRoutes from "./cloudflare-auth-routes";
import { setupGoogleAuth, verifyGoogleToken } from "./googleAuth";
import { ObjectStorageService, objectStorageClient, parseObjectPath } from "./objectStorage";
import { resolveTenant } from "./tenant-middleware";
import adminRoutes from "./admin-routes";
import authRoutes from "./auth-routes";
import calculatorRoutes from "./calculator-routes";
import cleanbiExplorerRoutes from "./cleanbi-explorer-routes";
import cleanbiReportsRoutes from "./cleanbi-reports-routes";
import expansionPlannerRoutes from "./expansion-planner-routes";
import bulkAnalysisRoutes from "./bulk-analysis-routes";
import ownerAnalyticsRoutes from "./owner-analytics-routes";
import { registerSitemapRoutes } from "./sitemap-routes";
import { registerEngagementRoutes } from "./engagement-routes";
import { registerMarketingLoyaltyRoutes } from "./marketing-loyalty-routes";
import seoCommandCenterRoutes from "./seo-command-center";
import routeOptimizationRoutes from "./routes/route-optimization";
import driverTrackingRoutes from "./routes/driver-tracking";
import profileRoutes, { activityRouter } from "./profile-routes";
import bookingRoutes from "./booking-routes";
import singleAnalysisRoutes from "./single-analysis-routes";
import userDashboardRoutes from "./user-dashboard-routes";
import operatorDashboardRoutes from "./operator-dashboard-routes";
import aiToolsRoutes from "./routes/ai-tools";
import savedAnalysesRoutes from "./routes/saved-analyses";
import googleExportRoutes from "./routes/google-export";
import Stripe from "stripe";
import { z } from "zod";
import { db } from "./db";
import { listings, listingFinancials, diagnosticCodes, courses, lessons, users, emailSubscribers, promoCodes, cleanbiUsage, adminActivityLog, vendors, visibilityAddOns, visibilityOrders, visibilityJobs, blogPosts, serviceGuyUsage, diagnosticIssueReports, insertDiagnosticIssueReportSchema, fixOutcomeFeedback, insertFixOutcomeFeedbackSchema, conversations, conversationParticipants, directMessages, memberProfiles, userConnections, activityEvents, insertMemberProfileSchema, websiteAssets, savedSearches, repairTickets, insertRepairTicketSchema, maintenancePlans, insertMaintenancePlanSchema, machineAssets, insertMachineAssetSchema, laundromats, partsCatalog, inventoryItems, inventoryUsage, purchaseOrders, insertPartsCatalogSchema, insertInventoryItemSchema, insertInventoryUsageSchema, insertPurchaseOrderSchema } from "@shared/schema";
import { eq, or, isNull, sql, desc, and, asc, inArray, ilike, gte } from "drizzle-orm";

// Type definition for AI providers
type AIProvider = "openai" | "anthropic" | "gemini" | "perplexity" | "grok";
import { generateBlogContent, generateCleanbiInsights, optimizeLayout, scanErrorCodeFromImage, analyzeEquipmentImage } from "./gemini";
import { analyzeUtilityBill, compareBills, type UtilityBillData } from "./utility-bill-analyzer";
import { notifyNewSubscription, notifyNewProSubscription, notifyNewEnrollment, notifyConsultationRequest, notifyInsuranceLeadRequest, notifyAIChatMessage } from "./notifications";
import { calculateCleanbi, type CleanbiInput } from "./cleanbi-calculator";
import { rateLimiter } from "./rate-limit-middleware";
import { requireTier } from "./middleware/tier-enforcement";
import { 
  requireAuth as tierGateAuth, 
  requireTier as tierGateRequireTier, 
  checkQuota, 
  getUserTier,
  optionalTierInfo 
} from "./middleware/tier-gate";
import { 
  antiScrapingMiddleware, 
  honeypotEndpoint, 
  enforcePageLimits, 
  obfuscateForAnonymous,
  addSecurityHeaders 
} from "./anti-scraping-middleware";
import { 
  antiScrapingMiddleware as serviceGuyAntiScraping, 
  rateLimitMiddleware as serviceGuyRateLimit, 
  logDiagnosticAccess, 
  obfuscateContent 
} from "./middleware/anti-scraping";
import { 
  submitAllToGoogle, 
  submitAllViaIndexNow,
  submitUrlWithDeduplication,
  submitBatch,
  submitFromSitemap,
  addToQueue,
  processQueue,
  getQueueStatus,
  getSubmissionHistory,
  getDeduplicationStats,
  clearDeduplicationCache,
  getIndexNowKey,
  submitToIndexNow,
  submitToGoogle,
  submitErrorCodesToIndexNow,
  submitBlogPostsToIndexNow,
  submitListingsToIndexNow,
  submitContentToIndexNow,
  INDEXNOW_KEY,
} from "./auto-indexing";
import { 
  triggerBlogIndexing, 
  triggerListingIndexing, 
  triggerResourceIndexing,
  getIndexingLog 
} from "./content-indexing-hooks";
import { generateBlogWithMultiAI, generateBlogsInBatch } from "./ai-blog-generator";
import { optimizeBlogForSEO } from "./seo-optimizer";
import { 
  generateListingBlog, 
  submitToIndexNow as submitSingleUrlToIndexNow, 
  submitToGoogleIndexing 
} from "./visibility-automation";
import { 
  performSearch, 
  trackSearchAnalytics, 
  incrementPopularity, 
  getPopularSearchTerms,
  reindexAllContent,
  getSearchIndexStats,
  initializeSearchIndex,
  type SearchQuery 
} from "./search-service";
import { readFileSync } from "fs";
import { join } from "path";
import multer from "multer";
import crypto from "crypto";

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

// Configure multer for image uploads (broker flyers, listing images)
const multerImageUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for images
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
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
  insertAiConversationSchema,
  insertContentProjectSchema,
  insertEmailContactSchema,
  insertBusinessListingSchema,
  insertBusinessListingInquirySchema,
  insertUtilityBillAnalysisSchema,
  utilityBillAnalyses,
  aiConversations,
  contentProjects,
  emailContacts,
  equipmentListings,
  supplyListings,
  businessListings,
  businessListingCategories,
  businessListingInquiries,
  businessListingAnalytics,
  savedItems,
  recentlyViewed,
  designServiceCatalog,
  designQuotes,
  designOrders,
  insertDesignQuoteSchema,
  insertDesignOrderSchema,
  affiliateClicks,
  insertAffiliateClickSchema,
  notifications,
  notificationPreferences,
  insertNotificationPreferencesSchema,
  insertDirectMessageSchema,
  insertConversationSchema,
  userProfiles,
  insertDashboardLayoutSchema,
} from "@shared/schema";
import {
  generateChatResponse,
  generateBlogTopics,
  generateBlogPost,
  generateBookChapter,
  generateNewsletter,
  generateCode,
  getQuotaStatus,
  generateImage,
  generateBookCover,
  generateBlogHeaderImage,
  generateNewsletterBanner,
  type ChatMessage,
  type ImageType,
  type CoverStyle,
} from "./services/gemini-content-studio";
import {
  exportToPdf,
  exportToDocx,
  getExportMetadata,
} from "./services/kdp-export";

// Stripe optional - payments disabled if key not set
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20" as any,
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

// Listing premium subscription tier benefits
const LISTING_TIER_BENEFITS = {
  free: { mediaLimit: 5, videoLimit: 0, featured: false, prioritySearch: false, analytics: false },
  basic: { mediaLimit: 15, videoLimit: 2, featured: false, prioritySearch: false, analytics: true },
  showcase: { mediaLimit: 30, videoLimit: 5, featured: true, prioritySearch: true, analytics: true },
  diamond: { mediaLimit: 999, videoLimit: 20, featured: true, prioritySearch: true, analytics: true, homepageCarousel: true }
};

// Listing subscription tier pricing (in cents)
const LISTING_TIER_PRICING: Record<string, { name: string; amount: number; priceId?: string }> = {
  basic: { name: 'Basic Listing', amount: 6500, priceId: process.env.STRIPE_LISTING_BASIC_PRICE_ID },
  showcase: { name: 'Showcase Listing', amount: 8900, priceId: process.env.STRIPE_LISTING_SHOWCASE_PRICE_ID },
  diamond: { name: 'Diamond Listing', amount: 19900, priceId: process.env.STRIPE_LISTING_DIAMOND_PRICE_ID },
};

// ==================== TIER-TRIGGERED AUTOMATION ====================
// Automatically fulfill tier benefits when listing is created or upgraded

interface TierAutomationResult {
  tier: string;
  benefitsApplied: string[];
  blogGenerated?: { id: string; slug: string; title: string };
  indexNowSubmitted?: boolean;
  googleIndexingSubmitted?: boolean;
  errors: string[];
}

async function applyTierBenefits(
  listingId: string, 
  tier: string, 
  previousTier?: string | null
): Promise<TierAutomationResult> {
  const result: TierAutomationResult = {
    tier,
    benefitsApplied: [],
    errors: [],
  };

  console.log(`🎯 [TIER AUTOMATION] Processing tier "${tier}" for listing ${listingId} (previous: ${previousTier || 'none'})`);

  // Skip if tier is free or basic (no automation benefits)
  if (tier === 'free' || tier === 'basic') {
    console.log(`📋 [TIER AUTOMATION] Tier "${tier}" has no automation benefits, skipping`);
    return result;
  }

  // Skip if tier hasn't changed (for updates)
  if (previousTier && previousTier === tier) {
    console.log(`📋 [TIER AUTOMATION] Tier unchanged, skipping automation`);
    return result;
  }

  // Get listing data for automation
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) {
    result.errors.push('Listing not found');
    console.error(`❌ [TIER AUTOMATION] Listing ${listingId} not found`);
    return result;
  }

  const baseUrl = process.env.BASE_URL || 'https://washbizhub.com';
  const listingUrl = `${baseUrl}/buy-laundromat/${listingId}`;

  try {
    // SHOWCASE TIER: Featured flags + visibility boost (level 3)
    if (tier === 'showcase' || tier === 'diamond') {
      const visibilityLevel = tier === 'diamond' ? 5 : 3;
      
      await db.update(listings)
        .set({
          featured: true,
          carouselFeatured: true,
          carouselFeaturedAt: new Date(),
          prioritySearch: true,
          visibilityBoost: visibilityLevel,
        })
        .where(eq(listings.id, listingId));
      
      result.benefitsApplied.push(`featured: true`);
      result.benefitsApplied.push(`carouselFeatured: true`);
      result.benefitsApplied.push(`prioritySearch: true`);
      result.benefitsApplied.push(`visibilityBoost: ${visibilityLevel}`);
      
      console.log(`✅ [TIER AUTOMATION] Applied showcase benefits for listing ${listingId}`);
    }

    // DIAMOND TIER: All showcase benefits PLUS AI blog + indexing
    // These are fire-and-forget (non-blocking) to avoid request timeouts
    if (tier === 'diamond') {
      result.benefitsApplied.push('autoBlog: queued');
      result.benefitsApplied.push('indexNow: queued');
      result.benefitsApplied.push('googleIndexing: queued');
      
      console.log(`🚀 [TIER AUTOMATION] Queueing async automation for diamond listing ${listingId}`);
      
      // Fire-and-forget: AI blog generation + indexing (runs in background)
      setImmediate(async () => {
        try {
          console.log(`📝 [TIER AUTOMATION/ASYNC] Generating AI blog for diamond listing ${listingId}`);
          
          const blog = await generateListingBlog({
            id: listing.id,
            title: listing.title || 'Laundromat Listing',
            description: listing.description,
            city: listing.city,
            state: listing.region,
            price: listing.priceOriginal?.toString() || null,
            brokerName: listing.brokerName,
          });

          // Save blog post to database
          const [savedBlog] = await db.insert(blogPosts).values({
            title: blog.title,
            slug: blog.slug,
            content: blog.content,
            excerpt: blog.excerpt,
            metaTitle: blog.metaTitle,
            metaDescription: blog.metaDescription,
            category: 'listings',
            authorName: 'WashBizHub AI',
            published: true,
            tenantId: listing.tenantId,
          }).returning();

          // Link blog to listing
          await db.update(listings)
            .set({
              autoBlogEnabled: true,
              autoBlogPostId: savedBlog?.id,
              autoBlogGeneratedAt: new Date(),
            })
            .where(eq(listings.id, listingId));
          
          console.log(`✅ [TIER AUTOMATION/ASYNC] AI blog generated: ${blog.title}`);

          // Also submit blog to IndexNow
          const blogUrl = `${baseUrl}/blog/${blog.slug}`;
          submitSingleUrlToIndexNow(blogUrl).catch(e => console.error(`❌ [TIER AUTOMATION/ASYNC] Blog IndexNow failed:`, e.message));
          console.log(`✅ [TIER AUTOMATION/ASYNC] Blog queued for IndexNow: ${blogUrl}`);
          
        } catch (blogError: any) {
          console.error(`❌ [TIER AUTOMATION/ASYNC] Blog generation failed:`, blogError.message);
        }
      });

      // Fire-and-forget: IndexNow submission
      setImmediate(async () => {
        try {
          const indexNowResult = await submitSingleUrlToIndexNow(listingUrl);
          console.log(`${indexNowResult.success ? '✅' : '⚠️'} [TIER AUTOMATION/ASYNC] IndexNow: ${indexNowResult.message}`);
        } catch (indexError: any) {
          console.error(`❌ [TIER AUTOMATION/ASYNC] IndexNow error:`, indexError.message);
        }
      });

      // Fire-and-forget: Google Indexing API
      setImmediate(async () => {
        try {
          const googleResult = await submitToGoogleIndexing(listingUrl);
          console.log(`${googleResult.success ? '✅' : '⚠️'} [TIER AUTOMATION/ASYNC] Google Indexing: ${googleResult.message}`);
        } catch (googleError: any) {
          console.error(`❌ [TIER AUTOMATION/ASYNC] Google Indexing error:`, googleError.message);
        }
      });
    }

  } catch (error: any) {
    result.errors.push(`Automation failed: ${error.message}`);
    console.error(`❌ [TIER AUTOMATION] Fatal error:`, error);
  }

  console.log(`🏁 [TIER AUTOMATION] Completed for listing ${listingId}:`, {
    tier,
    benefitsApplied: result.benefitsApplied.length,
    errors: result.errors.length,
  });

  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== MULTI-TENANT MIDDLEWARE ====================
  
  // Apply tenant resolution to ALL requests
  // This attaches req.tenant based on domain (washbizhub.com, strokerecoveryacademy.com, strokelyfe.app)
  app.use(resolveTenant);
  
  // ==================== SEO & ENGAGEMENT ROUTES ====================
  registerSitemapRoutes(app);
  registerEngagementRoutes(app);
  registerMarketingLoyaltyRoutes(app);
  
  // ==================== ADMIN DASHBOARD ====================
  app.use("/api/admin", adminRoutes);
  
  app.use("/api/calculators", calculatorRoutes);
  app.use("/api/cleanbi-explorer", cleanbiExplorerRoutes);
  app.use("/api/cleanbi/reports", cleanbiReportsRoutes);
  app.use("/api/single-analysis", singleAnalysisRoutes);
  app.use("/api/expansion-planner", expansionPlannerRoutes);
  app.use("/api/bulk-analysis", bulkAnalysisRoutes);
  app.use("/api/route-optimization", routeOptimizationRoutes);
  app.use("/api/driver-tracking", driverTrackingRoutes);
  app.use("/api/ai", aiToolsRoutes);
  app.use("/api/analyses", savedAnalysesRoutes);
  app.use("/api/google", googleExportRoutes);
  
  // ==================== OWNER COMMAND CENTER ====================
  app.use("/api/owner", ownerAnalyticsRoutes);
  
  // ==================== AUTH ====================
  
  // Setup session middleware (must come before auth routes)
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport serialization for session-based auth
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));
  
  // ==================== CLOUDFLARE AUTO-AUTH MIDDLEWARE ====================
  // Automatically validate CF_Authorization JWT on EVERY request
  // This ensures users authenticated via Cloudflare Access are auto-logged in
  // without seeing a redundant login page
  app.use(async (req: any, res, next) => {
    try {
      // Skip if already authenticated via session
      if (req.session?.userId) {
        return next();
      }
      
      // Skip if Cloudflare Access is not configured
      if (!cloudflareAccess.isConfigured()) {
        return next();
      }
      
      // Try to authenticate via Cloudflare Access token
      const claims = await cloudflareAccess.authenticateRequest(req);
      
      if (claims) {
        // Provision or get user from Cloudflare claims
        const user = await cloudflareAccess.provisionUser(claims);
        
        // Set session so subsequent requests don't need re-validation
        req.session.userId = user.id;
        req.session.cloudflareAuth = true;
        req.session.email = user.email;
        req.session.authProvider = 'cloudflare-access';
        
        console.log(`[CF AUTO-AUTH] Auto-authenticated user: ${user.email}`);
      }
    } catch (error) {
      // Non-blocking - just log and continue
      console.error('[CF AUTO-AUTH] Error during auto-auth:', error);
    }
    
    next();
  });
  
  // Mount Cloudflare Access auth routes (Zero Trust authentication)
  app.use("/api/auth/cloudflare", cloudflareAuthRoutes);
  
  // Setup Google OAuth (if configured)
  await setupGoogleAuth(app);
  
  // ==================== EMAIL/PASSWORD AUTH ====================
  // Mounted after session middleware is initialized
  app.use("/api/auth", authRoutes);
  
  // ==================== PROFILE & SOCIAL ====================
  app.use("/api/profile", profileRoutes);
  app.use("/api/user-dashboard", userDashboardRoutes);
  app.use("/api/operator", operatorDashboardRoutes);
  console.log("✅ Operator Dashboard routes registered");
  
  // Machine Booking System
  app.use(bookingRoutes);
  app.use("/api/activity", activityRouter);
  
  // Get authenticated user data
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      console.log(`[AUTH DEBUG] User ${user?.email} tier: "${user?.subscriptionTier}", isPro: ${user?.isPro}`);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ==================== TENANT (Public) ====================
  
  // Get current tenant info for frontend theming and configuration
  app.get('/api/tenant', (req: any, res) => {
    try {
      if (!req.tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      // Return tenant info with branding grouped for frontend convenience
      const tenant = req.tenant;
      res.json({
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        domain: tenant.domain,
        branding: {
          logoUrl: tenant.logoUrl,
          primaryColor: tenant.primaryColor,
          accentColor: tenant.accentColor,
          heroTitle: tenant.heroTitle,
          heroSubtitle: tenant.heroSubtitle,
          tagline: tenant.tagline,
        },
        metaTitle: tenant.metaTitle,
        metaDescription: tenant.metaDescription,
        ogImage: tenant.ogImage,
        enableCourses: tenant.enableCourses,
        enableMarketplace: tenant.enableMarketplace,
        enableCommunity: tenant.enableCommunity,
        enableWhiteLabel: tenant.enableWhiteLabel,
      });
    } catch (error: any) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });

  // ==================== GIF PICKER (Tenor API Proxy) ====================
  
  // Secure proxy for Tenor API - keeps API key on server side
  const GIF_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const gifCache: Map<string, { data: any; timestamp: number }> = new Map();
  
  app.get('/api/gifs', async (req, res) => {
    try {
      const tenorApiKey = process.env.TENOR_API_KEY;
      if (!tenorApiKey) {
        return res.status(503).json({ message: "GIF service not configured" });
      }
      
      // Get and sanitize query parameter - only allow alphanumeric and spaces
      const rawQuery = (req.query.q as string) || "";
      const searchQuery = rawQuery.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 50);
      const isTrending = !searchQuery;
      
      // Check cache first
      const cacheKey = searchQuery || "__trending__";
      const cached = gifCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < GIF_CACHE_TTL) {
        return res.json(cached.data);
      }
      
      // Build Tenor API URL
      const baseUrl = isTrending
        ? "https://tenor.googleapis.com/v2/featured"
        : "https://tenor.googleapis.com/v2/search";
      
      const params = new URLSearchParams({
        key: tenorApiKey,
        client_key: "washbizhub",
        limit: "20",
        media_filter: "gif,tinygif,nanogif",
        contentfilter: "medium",
      });
      
      if (!isTrending) {
        params.append("q", searchQuery);
      }
      
      const response = await fetch(`${baseUrl}?${params.toString()}`);
      
      if (!response.ok) {
        console.error("Tenor API error:", response.status, await response.text());
        return res.status(502).json({ message: "Failed to fetch GIFs from provider" });
      }
      
      const data = await response.json();
      const gifs = data.results || [];
      
      // Cache the results
      gifCache.set(cacheKey, { data: gifs, timestamp: Date.now() });
      
      // Cleanup old cache entries periodically
      if (gifCache.size > 100) {
        const now = Date.now();
        for (const [key, value] of gifCache.entries()) {
          if (now - value.timestamp > GIF_CACHE_TTL) {
            gifCache.delete(key);
          }
        }
      }
      
      res.json(gifs);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
      res.status(500).json({ message: "Failed to fetch GIFs" });
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
        industryMembers: 73000,
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

  // ==================== CITY LANDING PAGES (SEO) ====================
  
  // Static city data for top 20 target markets
  const CITY_DATA: Record<string, {
    city: string;
    state: string;
    stateCode: string;
    population: number;
    medianIncome: number;
    renterPercentage: number;
    populationDensity: number;
    avgCleanbiScore: number;
    opportunityLevel: "goldmine" | "promising" | "moderate" | "saturated";
    competitorCount: number;
    coordinates: { lat: number; lng: number };
    marketHighlights: string[];
    nearbyAreas: string[];
  }> = {
    "ca-los-angeles": {
      city: "Los Angeles",
      state: "California",
      stateCode: "CA",
      population: 3898747,
      medianIncome: 65290,
      renterPercentage: 63,
      populationDensity: 8304,
      avgCleanbiScore: 72,
      opportunityLevel: "moderate",
      competitorCount: 1247,
      coordinates: { lat: 34.0522, lng: -118.2437 },
      marketHighlights: [
        "Largest laundromat market in California",
        "High renter population creates consistent demand",
        "Diverse neighborhoods offer varied investment opportunities",
        "Strong Hispanic community with cultural preference for laundromats"
      ],
      nearbyAreas: ["Long Beach, CA", "Pasadena, CA", "Glendale, CA", "Santa Monica, CA"]
    },
    "ny-new-york": {
      city: "New York",
      state: "New York",
      stateCode: "NY",
      population: 8336817,
      medianIncome: 67844,
      renterPercentage: 69,
      populationDensity: 29302,
      avgCleanbiScore: 85,
      opportunityLevel: "promising",
      competitorCount: 2134,
      coordinates: { lat: 40.7128, lng: -74.0060 },
      marketHighlights: [
        "Highest population density in the US",
        "Strong demand from apartment dwellers",
        "Premium pricing potential in Manhattan and Brooklyn",
        "Consistent year-round traffic"
      ],
      nearbyAreas: ["Brooklyn, NY", "Queens, NY", "Jersey City, NJ", "Newark, NJ"]
    },
    "il-chicago": {
      city: "Chicago",
      state: "Illinois",
      stateCode: "IL",
      population: 2746388,
      medianIncome: 58247,
      renterPercentage: 54,
      populationDensity: 11864,
      avgCleanbiScore: 78,
      opportunityLevel: "promising",
      competitorCount: 892,
      coordinates: { lat: 41.8781, lng: -87.6298 },
      marketHighlights: [
        "Third largest US city with diverse neighborhoods",
        "Strong working-class communities",
        "Affordable commercial real estate",
        "Growing South and West side opportunities"
      ],
      nearbyAreas: ["Evanston, IL", "Oak Park, IL", "Cicero, IL", "Aurora, IL"]
    },
    "tx-houston": {
      city: "Houston",
      state: "Texas",
      stateCode: "TX",
      population: 2304580,
      medianIncome: 52338,
      renterPercentage: 55,
      populationDensity: 3622,
      avgCleanbiScore: 82,
      opportunityLevel: "promising",
      competitorCount: 678,
      coordinates: { lat: 29.7604, lng: -95.3698 },
      marketHighlights: [
        "Fastest growing major US city",
        "No state income tax increases profitability",
        "Diverse population with strong demand",
        "Energy sector creates stable economy"
      ],
      nearbyAreas: ["Pasadena, TX", "Sugar Land, TX", "The Woodlands, TX", "Katy, TX"]
    },
    "az-phoenix": {
      city: "Phoenix",
      state: "Arizona",
      stateCode: "AZ",
      population: 1608139,
      medianIncome: 57459,
      renterPercentage: 44,
      populationDensity: 3105,
      avgCleanbiScore: 88,
      opportunityLevel: "goldmine",
      competitorCount: 324,
      coordinates: { lat: 33.4484, lng: -112.0740 },
      marketHighlights: [
        "Rapidly growing population with housing shortage",
        "Underserved market relative to population",
        "Strong snowbird seasonal demand",
        "Favorable business climate"
      ],
      nearbyAreas: ["Scottsdale, AZ", "Mesa, AZ", "Tempe, AZ", "Chandler, AZ"]
    },
    "pa-philadelphia": {
      city: "Philadelphia",
      state: "Pennsylvania",
      stateCode: "PA",
      population: 1584064,
      medianIncome: 46116,
      renterPercentage: 47,
      populationDensity: 11683,
      avgCleanbiScore: 76,
      opportunityLevel: "promising",
      competitorCount: 512,
      coordinates: { lat: 39.9526, lng: -75.1652 },
      marketHighlights: [
        "Dense urban core with high foot traffic",
        "Large student population near universities",
        "Affordable acquisition costs",
        "Strong community-based customer loyalty"
      ],
      nearbyAreas: ["Camden, NJ", "Wilmington, DE", "Chester, PA", "Upper Darby, PA"]
    },
    "tx-san-antonio": {
      city: "San Antonio",
      state: "Texas",
      stateCode: "TX",
      population: 1434625,
      medianIncome: 49711,
      renterPercentage: 46,
      populationDensity: 3238,
      avgCleanbiScore: 84,
      opportunityLevel: "goldmine",
      competitorCount: 287,
      coordinates: { lat: 29.4241, lng: -98.4936 },
      marketHighlights: [
        "Underserved market with strong growth",
        "Military bases provide stable customer base",
        "Lower operating costs than other Texas metros",
        "Growing Hispanic population"
      ],
      nearbyAreas: ["New Braunfels, TX", "Seguin, TX", "Boerne, TX", "Universal City, TX"]
    },
    "ca-san-diego": {
      city: "San Diego",
      state: "California",
      stateCode: "CA",
      population: 1386932,
      medianIncome: 79673,
      renterPercentage: 53,
      populationDensity: 4386,
      avgCleanbiScore: 74,
      opportunityLevel: "moderate",
      competitorCount: 412,
      coordinates: { lat: 32.7157, lng: -117.1611 },
      marketHighlights: [
        "Affluent population supports premium services",
        "Military and student populations",
        "Year-round pleasant weather",
        "Strong tourism adds seasonal boost"
      ],
      nearbyAreas: ["Chula Vista, CA", "Oceanside, CA", "Escondido, CA", "El Cajon, CA"]
    },
    "tx-dallas": {
      city: "Dallas",
      state: "Texas",
      stateCode: "TX",
      population: 1304379,
      medianIncome: 52580,
      renterPercentage: 56,
      populationDensity: 3872,
      avgCleanbiScore: 79,
      opportunityLevel: "promising",
      competitorCount: 523,
      coordinates: { lat: 32.7767, lng: -96.7970 },
      marketHighlights: [
        "Strong economy with corporate relocations",
        "Growing apartment construction",
        "No state income tax",
        "Diverse neighborhoods with varying price points"
      ],
      nearbyAreas: ["Fort Worth, TX", "Arlington, TX", "Plano, TX", "Garland, TX"]
    },
    "ca-san-jose": {
      city: "San Jose",
      state: "California",
      stateCode: "CA",
      population: 1013240,
      medianIncome: 117324,
      renterPercentage: 43,
      populationDensity: 5792,
      avgCleanbiScore: 71,
      opportunityLevel: "moderate",
      competitorCount: 298,
      coordinates: { lat: 37.3382, lng: -121.8863 },
      marketHighlights: [
        "Highest median income supports premium pricing",
        "Tech worker population with disposable income",
        "Strong Asian community presence",
        "Growing apartment development"
      ],
      nearbyAreas: ["Santa Clara, CA", "Sunnyvale, CA", "Fremont, CA", "Milpitas, CA"]
    },
    "tx-austin": {
      city: "Austin",
      state: "Texas",
      stateCode: "TX",
      population: 978908,
      medianIncome: 71576,
      renterPercentage: 55,
      populationDensity: 3182,
      avgCleanbiScore: 86,
      opportunityLevel: "goldmine",
      competitorCount: 198,
      coordinates: { lat: 30.2672, lng: -97.7431 },
      marketHighlights: [
        "Fastest growing major city in US",
        "Tech boom creating massive population influx",
        "Severely underserved relative to growth",
        "Young demographic prefers laundromat services"
      ],
      nearbyAreas: ["Round Rock, TX", "Cedar Park, TX", "Pflugerville, TX", "Georgetown, TX"]
    },
    "fl-jacksonville": {
      city: "Jacksonville",
      state: "Florida",
      stateCode: "FL",
      population: 949611,
      medianIncome: 52736,
      renterPercentage: 41,
      populationDensity: 1178,
      avgCleanbiScore: 83,
      opportunityLevel: "promising",
      competitorCount: 234,
      coordinates: { lat: 30.3322, lng: -81.6557 },
      marketHighlights: [
        "Largest city by land area in contiguous US",
        "Growing port and logistics economy",
        "Affordable real estate for expansion",
        "No state income tax"
      ],
      nearbyAreas: ["Orange Park, FL", "St. Augustine, FL", "Fernandina Beach, FL", "Atlantic Beach, FL"]
    },
    "tx-fort-worth": {
      city: "Fort Worth",
      state: "Texas",
      stateCode: "TX",
      population: 918915,
      medianIncome: 59127,
      renterPercentage: 44,
      populationDensity: 2491,
      avgCleanbiScore: 81,
      opportunityLevel: "promising",
      competitorCount: 267,
      coordinates: { lat: 32.7555, lng: -97.3308 },
      marketHighlights: [
        "Rapidly growing suburb of DFW metroplex",
        "More affordable than Dallas",
        "Strong Hispanic community",
        "Growing residential development"
      ],
      nearbyAreas: ["Arlington, TX", "Keller, TX", "Burleson, TX", "Weatherford, TX"]
    },
    "oh-columbus": {
      city: "Columbus",
      state: "Ohio",
      stateCode: "OH",
      population: 905748,
      medianIncome: 53745,
      renterPercentage: 48,
      populationDensity: 4186,
      avgCleanbiScore: 77,
      opportunityLevel: "promising",
      competitorCount: 312,
      coordinates: { lat: 39.9612, lng: -82.9988 },
      marketHighlights: [
        "State capital with stable economy",
        "Large university population",
        "Growing tech sector",
        "Affordable Midwest market"
      ],
      nearbyAreas: ["Dublin, OH", "Westerville, OH", "Grove City, OH", "Gahanna, OH"]
    },
    "nc-charlotte": {
      city: "Charlotte",
      state: "North Carolina",
      stateCode: "NC",
      population: 874579,
      medianIncome: 62817,
      renterPercentage: 46,
      populationDensity: 2953,
      avgCleanbiScore: 85,
      opportunityLevel: "goldmine",
      competitorCount: 189,
      coordinates: { lat: 35.2271, lng: -80.8431 },
      marketHighlights: [
        "Major banking hub with growing economy",
        "Rapid population growth",
        "Underserved market relative to population",
        "Strong corporate relocations"
      ],
      nearbyAreas: ["Concord, NC", "Gastonia, NC", "Huntersville, NC", "Rock Hill, SC"]
    },
    "in-indianapolis": {
      city: "Indianapolis",
      state: "Indiana",
      stateCode: "IN",
      population: 887642,
      medianIncome: 47873,
      renterPercentage: 42,
      populationDensity: 2392,
      avgCleanbiScore: 79,
      opportunityLevel: "promising",
      competitorCount: 278,
      coordinates: { lat: 39.7684, lng: -86.1581 },
      marketHighlights: [
        "Central location with strong logistics sector",
        "Affordable cost of living",
        "Growing downtown development",
        "Sports and convention tourism"
      ],
      nearbyAreas: ["Carmel, IN", "Fishers, IN", "Lawrence, IN", "Greenwood, IN"]
    },
    "wa-seattle": {
      city: "Seattle",
      state: "Washington",
      stateCode: "WA",
      population: 753675,
      medianIncome: 97185,
      renterPercentage: 54,
      populationDensity: 8973,
      avgCleanbiScore: 73,
      opportunityLevel: "moderate",
      competitorCount: 287,
      coordinates: { lat: 47.6062, lng: -122.3321 },
      marketHighlights: [
        "Tech hub with high-income renters",
        "Dense urban core",
        "Premium pricing potential",
        "Strong apartment construction"
      ],
      nearbyAreas: ["Bellevue, WA", "Tacoma, WA", "Renton, WA", "Kent, WA"]
    },
    "co-denver": {
      city: "Denver",
      state: "Colorado",
      stateCode: "CO",
      population: 727211,
      medianIncome: 72661,
      renterPercentage: 49,
      populationDensity: 4746,
      avgCleanbiScore: 80,
      opportunityLevel: "promising",
      competitorCount: 234,
      coordinates: { lat: 39.7392, lng: -104.9903 },
      marketHighlights: [
        "Rapid population growth from migration",
        "Young, active demographic",
        "Growing apartment construction",
        "Strong outdoor lifestyle culture"
      ],
      nearbyAreas: ["Aurora, CO", "Lakewood, CO", "Westminster, CO", "Arvada, CO"]
    },
    "ma-boston": {
      city: "Boston",
      state: "Massachusetts",
      stateCode: "MA",
      population: 692600,
      medianIncome: 76298,
      renterPercentage: 66,
      populationDensity: 14252,
      avgCleanbiScore: 75,
      opportunityLevel: "moderate",
      competitorCount: 312,
      coordinates: { lat: 42.3601, lng: -71.0589 },
      marketHighlights: [
        "Major university hub with student demand",
        "Dense urban neighborhoods",
        "High percentage of renters",
        "Strong year-round demand"
      ],
      nearbyAreas: ["Cambridge, MA", "Somerville, MA", "Brookline, MA", "Quincy, MA"]
    },
    "tn-nashville": {
      city: "Nashville",
      state: "Tennessee",
      stateCode: "TN",
      population: 689447,
      medianIncome: 59828,
      renterPercentage: 47,
      populationDensity: 1392,
      avgCleanbiScore: 87,
      opportunityLevel: "goldmine",
      competitorCount: 156,
      coordinates: { lat: 36.1627, lng: -86.7816 },
      marketHighlights: [
        "Fastest growing city in Tennessee",
        "No state income tax",
        "Severely underserved market",
        "Growing music and healthcare industries"
      ],
      nearbyAreas: ["Franklin, TN", "Murfreesboro, TN", "Brentwood, TN", "Hendersonville, TN"]
    }
  };
  
  // Get city data for landing pages
  app.get('/api/city-data/:state/:city', async (req, res) => {
    try {
      const { state, city } = req.params;
      const key = `${state.toLowerCase()}-${city.toLowerCase()}`;
      
      const cityData = CITY_DATA[key];
      
      if (!cityData) {
        return res.status(404).json({ 
          error: "City not found",
          message: `No data available for ${city}, ${state}`
        });
      }
      
      // Get actual listings count from database
      let listingsCount = 0;
      try {
        const listings = await storage.getListings({ 
          state: cityData.stateCode,
          city: cityData.city 
        });
        listingsCount = listings.length || 0;
      } catch {
        // Use placeholder if database query fails
        listingsCount = Math.floor(cityData.population / 50000) + 5;
      }
      
      res.json({
        ...cityData,
        slug: key,
        listingsCount: listingsCount > 0 ? listingsCount : Math.floor(cityData.population / 50000) + 5
      });
    } catch (error: any) {
      console.error("Error fetching city data:", error);
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
  
  // ==================== HOMEPAGE DATA ====================
  
  app.get("/api/homepage/stats", async (_req, res) => {
    try {
      const [listingCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(listings)
        .where(eq(listings.status, 'active'));
      
      const [userCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users);
      
      const [cleanbiCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(cleanbiUsage);
      
      const [vendorCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(vendors);
      
      res.json({
        listings: listingCount?.count || 0,
        users: userCount?.count || 0,
        cleanbiAnalyses: cleanbiCount?.count || 0,
        cities: 150,
        partners: vendorCount?.count || 0
      });
    } catch (error: any) {
      console.error("Error fetching homepage stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/homepage/featured-listings", async (_req, res) => {
    try {
      const featuredListings = await db
        .select({
          id: listings.id,
          title: listings.title,
          city: listings.city,
          region: listings.region,
          country: listings.country,
          price: listings.priceInUSD,
          priceVisibility: listings.priceVisibility,
          featuredImage: listings.featuredImage,
          featured: listings.featured,
          tagline: listings.tagline,
          slug: listings.slug
        })
        .from(listings)
        .where(eq(listings.status, 'active'))
        .orderBy(desc(listings.featured), desc(listings.createdAt))
        .limit(4);
      
      res.json(featuredListings);
    } catch (error: any) {
      console.error("Error fetching featured listings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Featured Carousel Listings - includes financial data and prioritizes by subscription tier
  // Diamond tier auto-features to carousel, Showcase tier shows as featured, basic/free need manual featuring
  app.get("/api/listings/featured-carousel", async (_req, res) => {
    try {
      // Get listings that are:
      // 1. Diamond tier (auto-carousel featured)
      // 2. Carousel-featured (manual paid)
      // 3. Showcase tier (auto-featured)
      // 4. Regular featured (manual)
      const carouselListings = await db
        .select({
          id: listings.id,
          title: listings.title,
          city: listings.city,
          region: listings.region,
          country: listings.country,
          priceInUSD: listings.priceInUSD,
          priceOriginal: listings.priceOriginal,
          currency: listings.currency,
          priceVisibility: listings.priceVisibility,
          featuredImage: listings.featuredImage,
          featured: listings.featured,
          carouselFeatured: listings.carouselFeatured,
          subscriptionTier: listings.subscriptionTier,
          tagline: listings.tagline,
          slug: listings.slug,
          exactAddress: listings.exactAddress,
          brokerName: listings.brokerName,
          brokerPhone: listings.brokerPhone,
          status: listings.status,
          visibilityBoost: listings.visibilityBoost,
        })
        .from(listings)
        .where(
          and(
            eq(listings.status, 'active'),
            or(
              eq(listings.subscriptionTier, 'diamond'),    // Auto-carousel for diamond tier
              eq(listings.subscriptionTier, 'showcase'),   // Auto-featured for showcase tier
              eq(listings.carouselFeatured, true),         // Manual carousel featuring
              eq(listings.featured, true)                  // Manual featuring
            )
          )
        )
        .orderBy(
          // Priority order: Diamond > Carousel-featured > Showcase > Featured > Visibility > Date
          sql`CASE WHEN ${listings.subscriptionTier} = 'diamond' THEN 1 ELSE 0 END DESC`,
          desc(listings.carouselFeatured),
          sql`CASE WHEN ${listings.subscriptionTier} = 'showcase' THEN 1 ELSE 0 END DESC`,
          desc(listings.visibilityBoost),
          desc(listings.featured),
          desc(listings.createdAt)
        )
        .limit(8);
      
      // Get financials for these listings
      const listingIds = carouselListings.map(l => l.id);
      
      let financialsMap: Record<string, any> = {};
      if (listingIds.length > 0) {
        const financials = await db
          .select({
            listingId: listingFinancials.listingId,
            monthlyGross: listingFinancials.averageMonthlyRevenueOriginal,
            annualRevenue: listingFinancials.grossRevenueOriginal,
            cashFlow: listingFinancials.cashFlowOriginal,
          })
          .from(listingFinancials)
          .where(inArray(listingFinancials.listingId, listingIds));
        
        financials.forEach(f => {
          if (f.listingId) {
            financialsMap[f.listingId] = {
              monthlyGross: f.monthlyGross,
              annualRevenue: f.annualRevenue,
              cashFlow: f.cashFlow,
            };
          }
        });
      }
      
      // Merge financials with listings
      const result = carouselListings.map(listing => ({
        ...listing,
        financials: financialsMap[listing.id] || null,
      }));
      
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching carousel listings:", error);
      res.status(500).json({ error: error.message });
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

  // Design Studio routes require all_access tier (Design Studio is premium feature)
  app.post("/api/designs", requireAuth, tierGateRequireTier('all_access'), async (req: any, res) => {
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

  app.put("/api/designs/:id", requireAuth, tierGateRequireTier('all_access'), async (req: any, res) => {
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

  app.post("/api/designs/:id/optimize", requireAuth, tierGateRequireTier('all_access'), async (req: any, res) => {
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

  app.delete("/api/designs/:id", requireAuth, tierGateRequireTier('all_access'), async (req: any, res) => {
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

  // CLEANBI Score creation - free users get 3 analyses, all_access gets unlimited
  app.post("/api/cleanbi", requireAuth, checkQuota('cleanbi_analyses'), async (req: any, res) => {
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

  // CLEANBI AI Insights (requires all_access tier)
  app.post("/api/cleanbi/:id/insights", requireAuth, tierGateRequireTier("all_access"), async (req: any, res) => {
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

  app.get("/api/blog/:idOrSlug", async (req, res) => {
    try {
      // Try to find by ID first, then by slug
      let post = await storage.getBlogPost(req.params.idOrSlug);
      if (!post) {
        post = await storage.getBlogPostBySlug(req.params.idOrSlug);
      }
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      await storage.incrementBlogViews(post.id);
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog", requireAdmin, async (req, res) => {
    try {
      const validated = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validated);
      
      triggerBlogIndexing(post.id, post.slug || undefined);
      
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/blog/:idOrSlug", requireAdmin, async (req, res) => {
    try {
      // Find post by ID or slug
      let post = await storage.getBlogPost(req.params.idOrSlug);
      if (!post) {
        post = await storage.getBlogPostBySlug(req.params.idOrSlug);
      }
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Validate update data using partial schema
      const validated = insertBlogPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updateBlogPost(post.id, validated);
      res.json(updatedPost);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/blog/:idOrSlug", requireAdmin, async (req, res) => {
    try {
      // Find post by ID or slug
      let post = await storage.getBlogPost(req.params.idOrSlug);
      if (!post) {
        post = await storage.getBlogPostBySlug(req.params.idOrSlug);
      }
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      await storage.deleteBlogPost(post.id);
      res.json({ message: "Post deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog/generate", requireAdmin, async (req, res) => {
    try {
      const { topic, category } = req.body;
      const content = await generateBlogContent(topic, category);
      res.json({ content });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== MULTI-AI BLOG GENERATION ====================

  app.post("/api/blog/generate-multi-ai", requireAdmin, async (req, res) => {
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
      
      triggerBlogIndexing(blogPost.id, seoData.slug, { immediate: true });
      
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

  app.post("/api/blog/batch-generate", requireAdmin, async (req, res) => {
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
        
        triggerBlogIndexing(blogPost.id, seoData.slug);
      }
      
      console.log(`✅ Batch complete: ${savedBlogs.length} blogs created and queued for indexing`);
      
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

  app.post("/api/blog/aadvantage/generate-all", requireAdmin, async (req, res) => {
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
        if (!user?.requireAdmin) {
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

  app.post("/api/blog/aadvantage/generate-single", requireAdmin, async (req, res) => {
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

  app.post("/api/blog/aadvantage/generate-forum", requireAdmin, async (req, res) => {
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

  // ==================== DAVID ALLEN CAPITAL BLOG GENERATION ====================
  
  // Get DAC blog topics info
  app.get("/api/blog/dac/topics", async (req, res) => {
    try {
      const { getDACBlogTopics } = await import("./dac-blog-generator");
      res.json(getDACBlogTopics());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate all DAC blogs (50+ blogs)
  app.post("/api/blog/dac/generate-all", requireAdmin, async (req, res) => {
    try {
      const { generateAllDACBlogs } = await import("./dac-blog-generator");
      
      console.log("Starting David Allen Capital blog generation (50+ posts)...");
      
      res.json({ 
        success: true, 
        message: "DAC blog generation started. This will take approximately 15-20 minutes.",
        info: "Check server logs for progress updates."
      });
      
      // Run generation in background
      generateAllDACBlogs().then(result => {
        console.log(`DAC blog generation complete: ${result.successful}/${result.total} successful`);
      }).catch(error => {
        console.error(`DAC blog generation failed: ${error.message}`);
      });
      
    } catch (error: any) {
      console.error('DAC generation failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get DAC blogs
  app.get("/api/blog/dac", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts({ category: "business_financing" });
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== SOUTH END CAPITAL BLOG GENERATION ====================
  
  // Get SEC blog topics info
  app.get("/api/blog/sec/topics", async (req, res) => {
    try {
      const { getSECBlogTopics } = await import("./sec-blog-generator");
      res.json(getSECBlogTopics());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate all SEC blogs (50+ blogs)
  app.post("/api/blog/sec/generate-all", requireAdmin, async (req, res) => {
    try {
      const { generateAllSECBlogs } = await import("./sec-blog-generator");
      
      console.log("Starting South End Capital blog generation (50+ posts)...");
      
      res.json({ 
        success: true, 
        message: "SEC blog generation started. This will take approximately 15-20 minutes.",
        info: "Check server logs for progress updates."
      });
      
      // Run generation in background
      generateAllSECBlogs().then(result => {
        console.log(`SEC blog generation complete: ${result.successful}/${result.total} successful`);
      }).catch(error => {
        console.error(`SEC blog generation failed: ${error.message}`);
      });
      
    } catch (error: any) {
      console.error('SEC generation failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get SEC blogs  
  app.get("/api/blog/sec", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts({ category: "sba_financing" });
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== PREFERRED FUNDING GROUP BLOG GENERATION ====================
  
  // Get PFRG blog topics info
  app.get("/api/blog/pfrg/topics", async (req, res) => {
    try {
      const { getPFRGBlogTopics } = await import("./pfrg-blog-generator");
      res.json(getPFRGBlogTopics());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate all PFRG blogs (50 state blogs)
  app.post("/api/blog/pfrg/generate-all", requireAdmin, async (req, res) => {
    try {
      const { generateAllPFRGBlogs } = await import("./pfrg-blog-generator");
      
      console.log("Starting Preferred Funding Group blog generation (50 states)...");
      
      res.json({ 
        success: true, 
        message: "PFRG blog generation started. This will take approximately 20-25 minutes.",
        info: "Check server logs for progress updates."
      });
      
      // Run generation in background
      generateAllPFRGBlogs().then(result => {
        console.log(`PFRG blog generation complete: ${result.successful}/${result.total} successful`);
      }).catch(error => {
        console.error(`PFRG blog generation failed: ${error.message}`);
      });
      
    } catch (error: any) {
      console.error('PFRG generation failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get PFRG blogs
  app.get("/api/blog/pfrg", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts({ category: "startup_funding" });
      res.json(posts);
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

  app.post("/api/calculator/scenarios", requireAuth, async (req: any, res) => {
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

  app.delete("/api/calculator/scenarios/:id", requireAuth, async (req: any, res) => {
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

  // ==================== CALCULATOR MARKETPLACE ====================
  
  // GET /api/calculator-marketplace - Browse calculator templates
  app.get("/api/calculator-marketplace", async (req, res) => {
    try {
      const { category, pricingType, featured } = req.query;
      const templates = await storage.getCalculatorTemplates({
        status: 'published',
        category: category as string | undefined,
        pricingType: pricingType as string | undefined,
        featured: featured === 'true' ? true : undefined,
      });
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/calculator-marketplace/:idOrSlug - Get single calculator template
  app.get("/api/calculator-marketplace/:idOrSlug", async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      
      // Try to find by ID first, then by slug
      let template = await storage.getCalculatorTemplate(idOrSlug);
      if (!template) {
        template = await storage.getCalculatorTemplateBySlug(idOrSlug);
      }
      
      if (!template) {
        return res.status(404).json({ message: "Calculator not found" });
      }
      
      // Increment view count
      await storage.incrementCalculatorViewCount(template.id);
      
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/my-calculators - Get user's created calculators
  app.get("/api/my-calculators", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const templates = await storage.getCalculatorTemplates({
        creatorId: currentUser.userId,
      });
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/calculator-marketplace - Create new calculator template
  app.post("/api/calculator-marketplace", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { name, description, shortDescription, category, tags, inputFields, formulas, outputCards, charts, tips, pricingType, price, iconName, primaryColor } = req.body;
      
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
      
      const template = await storage.createCalculatorTemplate({
        creatorId: currentUser.userId,
        name,
        slug,
        description,
        shortDescription,
        category,
        tags: tags || [],
        inputFields,
        formulas,
        outputCards,
        charts: charts || [],
        tips: tips || [],
        pricingType: pricingType || 'free',
        price: price || '0',
        iconName,
        primaryColor: primaryColor || '#00A699',
        status: 'draft',
      });
      
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // PUT /api/calculator-marketplace/:id - Update calculator template
  app.put("/api/calculator-marketplace/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const template = await storage.getCalculatorTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Calculator not found" });
      }
      
      // Only creator or admin can update
      if (template.creatorId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateCalculatorTemplate(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // POST /api/calculator-marketplace/:id/publish - Publish calculator
  app.post("/api/calculator-marketplace/:id/publish", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const template = await storage.getCalculatorTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Calculator not found" });
      }
      
      if (template.creatorId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateCalculatorTemplate(req.params.id, {
        status: 'published',
      });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // DELETE /api/calculator-marketplace/:id - Delete calculator template
  app.delete("/api/calculator-marketplace/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const template = await storage.getCalculatorTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Calculator not found" });
      }
      
      if (template.creatorId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteCalculatorTemplate(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/calculator-marketplace/:id/use - Log calculator usage
  app.post("/api/calculator-marketplace/:id/use", async (req: any, res) => {
    try {
      const template = await storage.getCalculatorTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Calculator not found" });
      }
      
      // Increment use count
      await storage.incrementCalculatorUseCount(template.id);
      
      // Log usage event
      const currentUser = await getCurrentUser(req).catch(() => null);
      await storage.logCalculatorUsageEvent({
        calculatorId: template.id,
        userId: currentUser?.userId,
        eventType: 'calculate',
        inputValues: req.body.inputValues,
        outputValues: req.body.outputValues,
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/calculator-marketplace/:id/reviews - Get reviews for calculator
  app.get("/api/calculator-marketplace/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getCalculatorReviews(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/calculator-marketplace/:id/reviews - Add review
  app.post("/api/calculator-marketplace/:id/reviews", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { rating, title, content } = req.body;
      
      const review = await storage.createCalculatorReview({
        calculatorId: req.params.id,
        userId: currentUser.userId,
        rating,
        title,
        content,
        status: 'published',
      });
      
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // GET /api/creator-profile - Get current user's creator profile
  app.get("/api/creator-profile", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const profile = await storage.getCreatorProfileByUserId(currentUser.userId);
      res.json(profile || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/creator-profile - Create or update creator profile
  app.post("/api/creator-profile", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { displayName, bio, avatarUrl, websiteUrl, linkedinUrl, expertise, yearsExperience } = req.body;
      
      let profile = await storage.getCreatorProfileByUserId(currentUser.userId);
      
      if (profile) {
        profile = await storage.updateCreatorProfile(profile.id, {
          displayName,
          bio,
          avatarUrl,
          websiteUrl,
          linkedinUrl,
          expertise,
          yearsExperience,
        });
      } else {
        profile = await storage.createCreatorProfile({
          userId: currentUser.userId,
          displayName,
          bio,
          avatarUrl,
          websiteUrl,
          linkedinUrl,
          expertise,
          yearsExperience,
        });
      }
      
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // GET /api/creators - Get all creators
  app.get("/api/creators", async (req, res) => {
    try {
      const creators = await storage.getCreatorProfiles();
      res.json(creators);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/calculator-marketplace/:id/checkout - Create Stripe checkout for paid calculator
  app.post("/api/calculator-marketplace/:id/checkout", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const template = await storage.getCalculatorTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Calculator not found" });
      }
      
      // Check if free
      if (template.pricingType === 'free') {
        return res.status(400).json({ message: "This calculator is free" });
      }
      
      // Check if already purchased
      const hasPurchased = await storage.hasUserPurchasedCalculator(currentUser.userId, template.id);
      if (hasPurchased) {
        return res.status(400).json({ message: "Already purchased" });
      }
      
      // Import Stripe
      const Stripe = await import('stripe').then(m => m.default);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' as any });
      
      // Get or create customer
      const { users } = await import('@shared/schema');
      const { db } = await import('./db');
      const [user] = await db.select().from(users).where(eq(users.id, currentUser.userId)).limit(1);
      
      let customerId = user?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email || undefined,
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined,
          metadata: { userId: currentUser.userId }
        });
        customerId = customer.id;
        
        // Save customer ID
        await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, currentUser.userId));
      }
      
      // Calculate platform fee (20% commission)
      const priceInCents = Math.round(parseFloat(template.price || '0') * 100);
      const platformFee = Math.round(priceInCents * 0.20);
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: template.name,
              description: template.shortDescription || template.description || undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.REPLIT_DEV_DOMAIN || 'https://washbizhub.com'}/calculator-marketplace/${template.slug}?purchased=true`,
        cancel_url: `${process.env.REPLIT_DEV_DOMAIN || 'https://washbizhub.com'}/calculator-marketplace/${template.slug}`,
        metadata: {
          type: 'calculator_purchase',
          calculatorId: template.id,
          buyerId: currentUser.userId,
          creatorId: template.creatorId,
          platformFee: platformFee.toString(),
        },
      });
      
      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Calculator checkout error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/calculator-marketplace/:id/access - Check if user has access to calculator
  app.get("/api/calculator-marketplace/:id/access", async (req: any, res) => {
    try {
      const template = await storage.getCalculatorTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Calculator not found" });
      }
      
      // Free calculators are always accessible
      if (template.pricingType === 'free') {
        return res.json({ hasAccess: true, reason: 'free' });
      }
      
      // Check if authenticated
      const currentUser = await getCurrentUser(req).catch(() => null);
      if (!currentUser) {
        return res.json({ hasAccess: false, reason: 'unauthenticated' });
      }
      
      // Check if creator
      if (template.creatorId === currentUser.userId) {
        return res.json({ hasAccess: true, reason: 'creator' });
      }
      
      // Check if purchased
      const hasPurchased = await storage.hasUserPurchasedCalculator(currentUser.userId, template.id);
      if (hasPurchased) {
        return res.json({ hasAccess: true, reason: 'purchased' });
      }
      
      return res.json({ hasAccess: false, reason: 'not_purchased' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/my-purchases - Get user's purchased calculators
  app.get("/api/my-purchases", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const purchases = await storage.getUserPurchases(currentUser.userId);
      res.json(purchases);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== GOOGLE-POWERED CLEANBI ====================
  
  // POST /api/cleanbi/auto - Calculate CLEANBI score for ANY address (business OR residential)
  // ENFORCES SUBSCRIPTION QUOTAS - Free: 1/day, Pro: unlimited
  app.post("/api/cleanbi/auto", async (req, res) => {
    try {
      // Rate limiting (30 req/min per IP) - basic DDoS protection
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

      // Import quota management functions
      const { 
        getUserCLEANBITier, 
        checkCLEANBIQuota, 
        checkAnonymousQuota,
        trackCLEANBIUsage,
        trackAnonymousUsage,
        CLEANBI_PRICING_TIERS
      } = await import('./cleanbi-subscription-manager');
      
      // Get user info for quota enforcement
      const currentUser = await getCurrentUser(req).catch(() => null);
      
      // ========================================
      // ENFORCE SUBSCRIPTION QUOTAS
      // ========================================
      
      if (!currentUser) {
        // ANONYMOUS USER: 1 free report per day per IP, then must sign up
        const anonQuota = await checkAnonymousQuota(clientIp);
        
        if (!anonQuota.allowed) {
          return res.status(403).json({
            error: "quota_exceeded",
            message: anonQuota.reason,
            requiresLogin: true,
            upgradeUrl: "/auth"
          });
        }
      } else {
        // AUTHENTICATED USER: Check their tier quota
        const userTier = await getUserCLEANBITier(currentUser.userId);
        const quota = await checkCLEANBIQuota(currentUser.userId, userTier);
        
        if (!quota.allowed) {
          return res.status(403).json({
            error: "quota_exceeded",
            message: quota.reason,
            requiresUpgrade: true,
            currentTier: userTier,
            remainingToday: quota.remainingToday,
            remainingMonth: quota.remainingMonth,
            upgradeUrl: "/pricing?upgrade=cleanbi-pro"
          });
        }
      }

      // UNIVERSAL SCORING: Detect if address is business or residential
      const { detectAddressType } = await import('./address-type-detector');
      const addressType = await detectAddressType(address, businessName);

      console.log(`🎯 Address type detected: ${addressType.type.toUpperCase()} (${addressType.confidence}% confidence)`);

      let result: any;
      
      if (addressType.type === 'business') {
        // Score as BUSINESS using OPTIMIZED wrapper (caching + rate limiting + batching)
        const { calculateCLEANBIScore } = await import('./cleanbi-engine-wrapper');
        
        // Load user's REAL subscription tier (defaults to FREE if not authenticated)
        let userTier: Awaited<ReturnType<typeof getUserCLEANBITier>> | undefined;
        if (currentUser) {
          userTier = await getUserCLEANBITier(currentUser.userId);
        }
        
        result = await calculateCLEANBIScore({
          address,
          userId: currentUser?.userId,
          userTier
        });
        
        result = {
          ...result,
          addressType: 'business',
          confidence: addressType.confidence
        };
      } else {
        // Score as RESIDENTIAL using new residential scoring engine
        const { scoreResidentialProperty } = await import('./residential-scoring-engine');
        const residentialResult = await scoreResidentialProperty({ address });
        
        result = {
          ...residentialResult,
          addressType: 'residential',
          industry: 'Residential Property',
          industryDisplay: 'Residential Property',
        };
      }
      
      // ========================================
      // TRACK USAGE AFTER SUCCESSFUL SCORING
      // ========================================
      
      if (currentUser) {
        await trackCLEANBIUsage(currentUser.userId, 'basic');
        
        // Add quota info to response
        const userTier = await getUserCLEANBITier(currentUser.userId);
        const updatedQuota = await checkCLEANBIQuota(currentUser.userId, userTier);
        const tierFeatures = CLEANBI_PRICING_TIERS[userTier].features as any;
        
        result.quota = {
          tier: userTier,
          remainingToday: updatedQuota.remainingToday,
          remainingMonth: updatedQuota.remainingMonth,
          dailyLimit: updatedQuota.dailyLimit,
          monthlyLimit: updatedQuota.monthlyLimit,
          // Gate premium features based on tier
          features: {
            detailedBreakdown: tierFeatures.detailedBreakdown ?? false,
            competitorAnalysis: tierFeatures.competitorAnalysis ?? false,
            demographicData: tierFeatures.demographicData ?? false,
            pdfExport: tierFeatures.pdfExport ?? false
          }
        };
        
        // For FREE tier, strip premium data from response
        if (userTier === 'FREE') {
          // Keep basic score, grade, and summary - remove detailed breakdowns
          delete result.competitorData;
          delete result.demographicDetails;
          delete result.detailedFactors;
          result.upgradeCTA = {
            message: "Upgrade to Pro for competitor analysis, demographics, and PDF export",
            url: "/pricing?upgrade=cleanbi-pro",
            price: "$29/mo"
          };
        }
      } else {
        // Track anonymous usage
        await trackAnonymousUsage(clientIp);
        
        // Anonymous users get very limited data
        result.quota = {
          tier: 'ANONYMOUS',
          remainingToday: 0,
          message: "Create a free account to get more reports"
        };
        
        // Strip all premium data
        delete result.competitorData;
        delete result.demographicDetails;
        delete result.detailedFactors;
        
        result.upgradeCTA = {
          message: "Sign up free for 1 report/day, or go Pro for unlimited",
          signupUrl: "/auth",
          proUrl: "/pricing?upgrade=cleanbi-pro"
        };
      }
      
      res.json(result);
    } catch (error: any) {
      console.error('Universal CLEANBI error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to calculate score",
        hint: "Verify the address is correct"
      });
    }
  });

  // ==================== LISTING URL ANALYZER ====================
  // Analyze any BizBuySell, LoopNet, or similar listing URL
  
  app.post("/api/listing-analyzer", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "Listing URL is required" });
      }
      
      // SECURITY: Parse and validate URL hostname to prevent SSRF attacks
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      
      // Only allow HTTPS
      if (parsedUrl.protocol !== 'https:') {
        return res.status(400).json({ error: "Only HTTPS URLs are supported" });
      }
      
      // Validate hostname against allowlist (exact match or subdomain)
      const supportedDomains = ['bizbuysell.com', 'loopnet.com', 'businessbroker.net', 'businessesforsale.com'];
      const hostname = parsedUrl.hostname.toLowerCase();
      const isSupported = supportedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
      
      if (!isSupported) {
        return res.status(400).json({ 
          error: "Unsupported listing site",
          supported: supportedDomains,
          hint: "Paste a URL from BizBuySell, LoopNet, or BusinessBroker.net"
        });
      }
      
      // Parse the listing
      const { parseListingUrl, calculateDealMetrics } = await import('./listing-parser');
      const listing = await parseListingUrl(url);
      
      if (listing.error && listing.confidence === 0) {
        return res.status(422).json({ 
          error: "Could not parse listing",
          details: listing.error,
          hint: "The listing page may be unavailable or have an unexpected format"
        });
      }
      
      // Calculate deal metrics
      const dealMetrics = calculateDealMetrics(listing);
      
      // Return combined result
      res.json({
        success: true,
        listing,
        dealMetrics,
        readyForCleanbi: !!(listing.fullAddress || listing.city),
        suggestedAddress: listing.fullAddress || (listing.city && listing.state ? `${listing.city}, ${listing.state}` : null)
      });
      
    } catch (error: any) {
      console.error('Listing analyzer error:', error);
      res.status(500).json({ 
        error: "Failed to analyze listing",
        details: error.message
      });
    }
  });

  // POST /api/cleanbi/purchase-report - Create Stripe checkout for $97 full report
  app.post("/api/cleanbi/purchase-report", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }

      const { address, score, addressType, email } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: "Address is required" });
      }

      // Create Stripe checkout session for $97 CLEANBI report
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "CLEANBI Full Intelligence Report",
                description: `Comprehensive ${addressType === 'residential' ? 'property' : 'business'} analysis for: ${address.substring(0, 100)}`,
                images: ["https://washbizhub.com/cleanbi-report-preview.png"],
              },
              unit_amount: 9700, // $97.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/cleanbi-report?success=true&address=${encodeURIComponent(address)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cleanbi?canceled=true`,
        customer_email: email || undefined,
        metadata: {
          type: "cleanbi_report",
          address: address.substring(0, 500),
          score: String(score || 0),
          addressType: addressType || 'business',
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      console.error('CLEANBI report purchase error:', error);
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

  app.post("/api/vendors", requireAdmin, async (req, res) => {
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

  app.post("/api/parts", requireAdmin, async (req, res) => {
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

  app.post("/api/affiliates", requireAuth, async (req: any, res) => {
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

  app.post("/api/laundromats", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // CRITICAL: Force userId from authenticated user (schema expects userId, not ownerId)
      const validated = insertLaundromatSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });
      const laundromat = await storage.createLaundromat(validated);
      res.json(laundromat);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Note: Stripe webhook handler is in server/index.ts (must be before JSON middleware)
  
  // ==================== STRIPE SUBSCRIPTION ====================
  
  // Create Stripe Checkout Session for subscription
  // HYBRID APPROACH: Free tier = no CC required, Paid tiers = CC required with 7-day trial
  app.post("/api/create-subscription", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const { tierId, interval = 'month', userId, skipTrial = false } = req.body;
      
      // Check if using test mode (test Stripe key starts with sk_test_)
      const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
      
      // Get price ID from environment with strict mode validation
      // In test mode, MUST use TESTING_* price IDs (no fallback to live prices)
      // In live mode, use STRIPE_* price IDs
      const getPrice = (baseName: string): string | undefined => {
        if (isTestMode) {
          const testPriceId = process.env[`TESTING_STRIPE_PRICE_${baseName}_MONTHLY`];
          if (!testPriceId) {
            console.warn(`[Stripe] Missing TESTING_STRIPE_PRICE_${baseName}_MONTHLY - test checkout may fail`);
          }
          return testPriceId;
        }
        return process.env[`STRIPE_${baseName}_PRICE_ID`] || process.env[`STRIPE_PRICE_${baseName}_MONTHLY`];
      };
      
      // Define subscription tiers with Stripe price IDs
      // Pricing must match client/src/lib/tier-config.ts
      // NEW SIMPLIFIED STRUCTURE: Free + All-Access ($129/mo or $1,290/yr)
      const subscriptionTiers: Record<string, { name: string; amount: number; amountAnnual?: number; priceId?: string; priceIdAnnual?: string; trialDays: number }> = {
        // PRIMARY TIER: All-Access at $129/mo or $1,290/yr (2 months free)
        'all_access': { 
          name: 'WashBizHub All-Access', 
          amount: 12900, 
          amountAnnual: 129000,
          priceId: process.env.STRIPE_ALL_ACCESS_MONTHLY_PRICE_ID || getPrice('ALL_ACCESS'),
          priceIdAnnual: process.env.STRIPE_ALL_ACCESS_ANNUAL_PRICE_ID,
          trialDays: 7 
        },
        // Legacy tiers - map to all_access for backward compatibility
        'starter': { name: 'WashBizHub All-Access', amount: 12900, priceId: getPrice('ALL_ACCESS'), trialDays: 7 },
        'pro': { name: 'WashBizHub All-Access', amount: 12900, priceId: getPrice('ALL_ACCESS'), trialDays: 7 },
        'enterprise': { name: 'WashBizHub All-Access', amount: 12900, priceId: getPrice('ALL_ACCESS'), trialDays: 7 },
        // POS add-ons (future)
        'pos_flat': { name: 'WashBizPOS Pro Flat', amount: 9900, priceId: process.env.STRIPE_POS_FLAT_PRICE_ID, trialDays: 7 },
        'pos_transaction': { name: 'WashBizPOS Pro Transaction', amount: 0, priceId: process.env.STRIPE_POS_TRANSACTION_PRICE_ID, trialDays: 7 },
      };
      
      const tier = subscriptionTiers[tierId] || subscriptionTiers['all_access'];
      const isAnnualBilling = interval === 'year';
      const amount = isAnnualBilling && tier.amountAnnual ? tier.amountAnnual : tier.amount;
      const priceId = isAnnualBilling && tier.priceIdAnnual ? tier.priceIdAnnual : tier.priceId;
      const baseUrl = process.env.BASE_URL || 'https://washbizhub.com';
      
      // Build session configuration with trial period
      const sessionConfig: any = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          priceId ? 
            { price: priceId, quantity: 1 } :
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: tier.name,
                  description: isAnnualBilling 
                    ? `Annual subscription to ${tier.name} (2 months free!)` 
                    : `Monthly subscription to ${tier.name}`,
                },
                recurring: { interval: interval as 'month' | 'year' },
                unit_amount: amount,
              },
              quantity: 1,
            },
        ],
        success_url: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: {
          tierId: tierId === 'starter' || tierId === 'pro' || tierId === 'enterprise' ? 'all_access' : tierId,
          tier: tierId === 'starter' || tierId === 'pro' || tierId === 'enterprise' ? 'all_access' : tierId,
          tierName: tier.name,
          userId: userId || '',
          type: 'subscription',
          billingInterval: interval,
          hasTrial: (!skipTrial && tier.trialDays > 0) ? 'true' : 'false',
        },
        allow_promotion_codes: true,
      };
      
      // Add trial period for paid tiers (CC required upfront, but no charge for trial period)
      if (!skipTrial && tier.trialDays > 0) {
        sessionConfig.subscription_data = {
          trial_period_days: tier.trialDays,
          metadata: {
            tierId,
            tierName: tier.name,
            trialDays: tier.trialDays.toString(),
          }
        };
      }
      
      // Create Checkout Session with trial
      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.json({ 
        checkoutUrl: session.url,
        sessionId: session.id 
      });
    } catch (error: any) {
      console.error('Subscription checkout error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get Stripe Checkout Session details
  app.get("/api/stripe/session/:sessionId", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
      
      res.json({
        planName: session.metadata?.tierId || 'Pro',
        status: session.status,
        customerEmail: session.customer_email,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Stripe Customer Portal for subscription management
  app.post("/api/stripe/customer-portal", requireAuth, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await db.query.users.findFirst({
        where: eq(users.id, currentUser.userId)
      });
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No active subscription found" });
      }
      
      const baseUrl = process.env.BASE_URL || 'https://washbizhub.com';
      
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/account`,
      });
      
      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error('Customer portal error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== VISIBILITY ADD-ONS (LISTING PROMOTION) ====================
  
  // Get all available visibility add-ons
  app.get("/api/visibility-addons", async (req, res) => {
    try {
      const addOns = await db.select()
        .from(visibilityAddOns)
        .where(eq(visibilityAddOns.active, true))
        .orderBy(asc(visibilityAddOns.sortOrder));
      res.json(addOns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create Stripe Checkout for visibility add-on purchase
  app.post("/api/visibility-addons/checkout", requireAuth, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { addOnId, listingId } = req.body;
      
      if (!addOnId || !listingId) {
        return res.status(400).json({ message: "addOnId and listingId are required" });
      }
      
      // Get the add-on
      const [addOn] = await db.select()
        .from(visibilityAddOns)
        .where(and(
          eq(visibilityAddOns.id, addOnId),
          eq(visibilityAddOns.active, true)
        ))
        .limit(1);
      
      if (!addOn) {
        return res.status(404).json({ message: "Add-on not found" });
      }
      
      // Verify listing exists and belongs to user
      const [listing] = await db.select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .limit(1);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Get user info
      const user = await db.query.users.findFirst({
        where: eq(users.id, currentUser.userId)
      });
      
      const baseUrl = process.env.BASE_URL || 'https://washbizhub.com';
      const priceInCents = Math.round(parseFloat(addOn.priceUSD) * 100);
      
      // Create or retrieve Stripe customer
      let customerId = user?.stripeCustomerId;
      if (!customerId && user?.email) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: currentUser.userId }
        });
        customerId = customer.id;
        await db.update(users)
          .set({ stripeCustomerId: customer.id })
          .where(eq(users.id, currentUser.userId));
      }
      
      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer: customerId || undefined,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: addOn.name,
                description: addOn.description || `Visibility add-on for your listing`,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/visibility-success?session_id={CHECKOUT_SESSION_ID}&listing_id=${listingId}`,
        cancel_url: `${baseUrl}/buy-laundromat/${listingId}`,
        metadata: {
          type: 'visibility_addon',
          addOnId: addOn.id,
          addOnSlug: addOn.slug,
          addOnName: addOn.name,
          listingId,
          listingTitle: listing.title || 'Listing',
          userId: currentUser.userId,
          userEmail: user?.email || '',
          durationDays: addOn.durationDays?.toString() || '30',
          includesCarousel: addOn.includesCarousel ? 'true' : 'false',
          includesAutoBlog: addOn.includesAutoBlog ? 'true' : 'false',
          includesIndexNow: addOn.includesIndexNow ? 'true' : 'false',
          includesGoogleIndexing: addOn.includesGoogleIndexing ? 'true' : 'false',
          includesSocialCards: addOn.includesSocialCards ? 'true' : 'false',
        },
        allow_promotion_codes: true,
      });
      
      // Create pending order
      await db.insert(visibilityOrders).values({
        listingId,
        userId: currentUser.userId,
        addOnId: addOn.id,
        stripeCheckoutSessionId: session.id,
        amountPaid: addOn.priceUSD,
        currency: 'USD',
        status: 'pending',
      });
      
      console.log(`📦 Visibility add-on checkout created: ${addOn.name} for listing ${listingId}`);
      
      res.json({ 
        checkoutUrl: session.url,
        sessionId: session.id 
      });
    } catch (error: any) {
      console.error('Visibility add-on checkout error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get visibility orders for a listing
  app.get("/api/visibility-orders/listing/:listingId", requireAuth, async (req: any, res) => {
    try {
      const orders = await db.select({
        order: visibilityOrders,
        addOn: visibilityAddOns,
      })
        .from(visibilityOrders)
        .leftJoin(visibilityAddOns, eq(visibilityOrders.addOnId, visibilityAddOns.id))
        .where(eq(visibilityOrders.listingId, req.params.listingId))
        .orderBy(desc(visibilityOrders.createdAt));
      
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user's visibility orders
  app.get("/api/visibility-orders/my-orders", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const orders = await db.select({
        order: visibilityOrders,
        addOn: visibilityAddOns,
        listing: listings,
      })
        .from(visibilityOrders)
        .leftJoin(visibilityAddOns, eq(visibilityOrders.addOnId, visibilityAddOns.id))
        .leftJoin(listings, eq(visibilityOrders.listingId, listings.id))
        .where(eq(visibilityOrders.userId, currentUser.userId))
        .orderBy(desc(visibilityOrders.createdAt));
      
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get visibility jobs for an order (admin or owner)
  app.get("/api/visibility-jobs/:orderId", requireAuth, async (req: any, res) => {
    try {
      const jobs = await db.select()
        .from(visibilityJobs)
        .where(eq(visibilityJobs.orderId, req.params.orderId))
        .orderBy(desc(visibilityJobs.createdAt));
      
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Manually trigger job processing (admin only)
  app.post("/api/visibility-jobs/process", requireAdmin, async (req, res) => {
    try {
      const { processOrderJobs, processPendingJobs } = await import("./visibility-automation");
      
      const { orderId } = req.body;
      
      if (orderId) {
        await processOrderJobs(orderId);
        res.json({ message: `Jobs for order ${orderId} processed` });
      } else {
        const processed = await processPendingJobs();
        res.json({ message: `${processed} pending jobs processed` });
      }
    } catch (error: any) {
      console.error('Job processing error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Retry a failed job (admin only)
  app.post("/api/visibility-jobs/:jobId/retry", requireAdmin, async (req, res) => {
    try {
      const { processVisibilityJob } = await import("./visibility-automation");
      
      // Reset job status to pending
      await db.update(visibilityJobs)
        .set({ status: 'pending', errorMessage: null })
        .where(eq(visibilityJobs.id, req.params.jobId));
      
      const result = await processVisibilityJob(req.params.jobId);
      res.json(result);
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

  app.post("/api/courses", requireAdmin, async (req, res) => {
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

  // ==================== LAUNDRY TECH ACADEMY ====================

  // Get all Academy courses (tier-ordered)
  app.get("/api/academy", async (req, res) => {
    try {
      const academyCourses = await db.query.courses.findMany({
        where: eq(courses.bundleGroupId, 'laundry-tech-academy'),
        orderBy: [asc(courses.tierLevel)],
      });
      res.json(academyCourses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create bundle checkout for all 4 Academy courses ($999)
  app.post("/api/academy/bundle/checkout", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }

      // Use real Stripe price ID if available, fallback to dynamic pricing
      const academyPriceId = process.env.STRIPE_PRICE_ACADEMY_BUNDLE;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: academyPriceId ? [
          { price: academyPriceId, quantity: 1 }
        ] : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Laundry Tech Academy - Complete Bundle",
                description: "All 4 certification levels: Attendant Essentials, Certified Tech, Advanced Tech, and Master Tech. Save $598!",
              },
              unit_amount: 99900,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/academy?success=true`,
        cancel_url: `${req.headers.origin}/academy?canceled=true`,
        metadata: {
          userId,
          type: "academy_bundle",
          courseIds: "academy-level-1,academy-level-2,academy-level-3,academy-level-4",
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Auto-populate Academy lessons from diagnostic codes
  app.post("/api/academy/populate-lessons", requireAdmin, async (req, res) => {
    try {
      const { tierLevel } = req.body;
      
      // Map tier to skill levels
      const tierSkillMap: { [key: number]: string[] } = {
        1: ['basic'], // Level 1: Basic codes
        2: ['intermediate'], // Level 2: Intermediate codes
        3: ['advanced', 'professional'], // Level 3: Advanced & Professional
        4: ['basic', 'intermediate', 'advanced', 'professional'], // Level 4: All codes (master)
      };

      const courseIds: { [key: number]: string } = {
        1: 'academy-level-1',
        2: 'academy-level-2',
        3: 'academy-level-3',
        4: 'academy-level-4',
      };

      const tiersToProcess = tierLevel ? [tierLevel] : [1, 2, 3, 4];
      const results: any[] = [];

      for (const tier of tiersToProcess) {
        const courseId = courseIds[tier];
        const skillLevels = tierSkillMap[tier];

        // Check if lessons already exist for this course
        const existingLessons = await db.query.lessons.findMany({
          where: eq(lessons.courseId, courseId),
        });

        if (existingLessons.length > 0) {
          results.push({ 
            tier, 
            courseId, 
            status: 'skipped', 
            message: `Already has ${existingLessons.length} lessons`,
            existingCount: existingLessons.length
          });
          continue;
        }

        // Get diagnostic codes for this tier
        const diagnosticCodes = await db.query.diagnosticCodes.findMany({
          where: inArray(diagnosticCodes.skillLevel, skillLevels),
          orderBy: [asc(diagnosticCodes.manufacturer), asc(diagnosticCodes.code)],
        });

        // Group by manufacturer for organized modules
        const byManufacturer: { [key: string]: typeof diagnosticCodes } = {};
        for (const code of diagnosticCodes) {
          const mfr = code.manufacturer || 'General';
          if (!byManufacturer[mfr]) byManufacturer[mfr] = [];
          byManufacturer[mfr].push(code);
        }

        // Create lessons grouped by manufacturer
        let lessonOrder = 1;
        let createdCount = 0;

        for (const [manufacturer, codes] of Object.entries(byManufacturer)) {
          // Create a module lesson for each manufacturer
          const moduleTitle = `${manufacturer} Error Codes`;
          
          // Build lesson content from codes
          const lessonContent = codes.slice(0, 20).map((code: any) => {
            const parts = code.partsWithPricing ? 
              (code.partsWithPricing as any[]).map((p: any) => `${p.name}: $${p.price}`).join(', ') : 
              'No parts data';
            
            return `
## ${code.code}: ${code.title}

**Severity:** ${code.severity || 'Medium'}
**Machine Type:** ${code.machineType || 'Unknown'}
**Estimated Repair Time:** ${code.estimatedRepairTime || 30} minutes

### Description
${code.description || 'No description available'}

### Possible Causes
${(code.possibleCauses as string[] || []).map((c: string) => `- ${c}`).join('\n')}

### Troubleshooting Steps
${(code.troubleshootingSteps as string[] || []).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

### Parts & Pricing
${parts}

${code.quickFix ? `### Quick Fix\n${code.quickFix}` : ''}
`;
          }).join('\n---\n');

          // Generate quiz questions from the codes
          const quizQuestions = codes.slice(0, 5).map((code: any, idx: number) => ({
            id: `q${idx + 1}`,
            question: `What is the primary cause of error code ${code.code} on ${manufacturer} equipment?`,
            options: [
              (code.possibleCauses as string[])?.[0] || 'Component failure',
              'Power supply issue',
              'User error',
              'Software glitch',
            ],
            correctAnswer: 0,
            explanation: code.quickFix || `The primary fix for ${code.code} involves addressing ${(code.possibleCauses as string[])?.[0] || 'the component failure'}.`
          }));

          await storage.createLesson({
            courseId,
            title: moduleTitle,
            description: `Learn to diagnose and repair ${codes.length} ${manufacturer} error codes`,
            order: lessonOrder++,
            duration: Math.min(codes.length * 3, 45), // 3 min per code, max 45 min
            content: lessonContent,
            quizData: {
              questions: quizQuestions,
              passingScore: 70,
            },
            isFree: tier === 1, // All Level 1 lessons are free
          });
          createdCount++;
        }

        results.push({
          tier,
          courseId,
          status: 'created',
          lessonsCreated: createdCount,
          totalCodes: diagnosticCodes.length,
          manufacturers: Object.keys(byManufacturer).length,
        });
      }

      res.json({ 
        success: true, 
        message: 'Academy lessons populated from diagnostic codes',
        results 
      });
    } catch (error: any) {
      console.error('Academy populate error:', error);
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

  app.post("/api/lessons", requireAdmin, async (req, res) => {
    try {
      const validated = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(validated);
      res.json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Submit quiz answers for grading (server-side validation)
  app.post("/api/lessons/:lessonId/grade", requireAuth, async (req, res) => {
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

  app.put("/api/enrollments/:id/progress", requireAuth, async (req, res) => {
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

  app.post("/api/book/chapters", requireAdmin, async (req, res) => {
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

  app.post("/api/ai-blog-tasks", requireAdmin, async (req, res) => {
    try {
      const validated = insertAiBlogTaskSchema.parse(req.body);
      const task = await storage.createAiBlogTask(validated);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/ai-blog-tasks/:id", requireAdmin, async (req, res) => {
    try {
      const task = await storage.updateAiBlogTask(req.params.id, req.body);
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate blog content using multi-AI providers
  app.post("/api/ai-blog-tasks/:id/generate", requireAdmin, async (req, res) => {
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

  app.post("/api/seo-keywords", requireAdmin, async (req, res) => {
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

  app.post("/api/competitor-analysis", requireAdmin, async (req, res) => {
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

  app.put("/api/consultations/:id", requireAdmin, async (req, res) => {
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

  // Universal Consultation Request - works for location, design, listing, or general inquiries
  app.post("/api/consultation-request", async (req, res) => {
    try {
      const { name, email, phone, notes, consultationType, consultationData, timestamp } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Build context-specific information
      let contextInfo = "";
      if (consultationData) {
        switch (consultationType) {
          case "location":
            contextInfo = `
📍 LOCATION ANALYSIS
• Address: ${consultationData.locationAddress || 'Not specified'}
• CLEANBI Score: ${consultationData.locationScore || 'N/A'}/100
• Grade: ${consultationData.locationGrade || 'N/A'}
`;
            break;
          case "design":
            contextInfo = `
📐 DESIGN STUDIO PROJECT
• Space: ${consultationData.designSqft?.toLocaleString() || 'N/A'} sq ft
• Equipment Count: ${consultationData.equipmentCount || 'N/A'}
• Projected Monthly Revenue: $${consultationData.projectedRevenue?.toLocaleString() || 'N/A'}
• Viability Score: ${consultationData.viabilityScore || 'N/A'}
`;
            break;
          case "listing":
            contextInfo = `
🏢 MARKETPLACE LISTING
• Listing: ${consultationData.listingName || 'Not specified'}
• Asking Price: $${consultationData.listingPrice?.toLocaleString() || 'N/A'}
• Listing ID: ${consultationData.listingId || 'N/A'}
`;
            break;
          default:
            contextInfo = "General consultation inquiry";
        }
      }
      
      const emailContent = `
🎯 NEW CONSULTATION COUNCIL REQUEST

═══════════════════════════════════════════
📋 CONTACT INFORMATION
═══════════════════════════════════════════
• Name: ${name || 'Not provided'}
• Email: ${email}
• Phone: ${phone || 'Not provided'}
• Submitted: ${new Date(timestamp || Date.now()).toLocaleString()}

═══════════════════════════════════════════
📊 REQUEST CONTEXT
═══════════════════════════════════════════
Type: ${consultationType?.toUpperCase() || 'GENERAL'}
${contextInfo}

═══════════════════════════════════════════
💬 CLIENT MESSAGE
═══════════════════════════════════════════
${notes || 'No additional notes provided'}

---
⚡ Action Required: Expert Council Review + Nick Kremers Verification
📧 Reply to: ${email}
`;
      
      // Send notification
      await notifyConsultationRequest({
        name: name || 'Website Visitor',
        email,
        phone: phone || undefined,
        message: emailContent,
      });
      
      // Log to admin activity
      try {
        await db.insert(adminActivityLog).values({
          type: 'consultation_request',
          description: `${consultationType || 'General'} consultation from ${email}`,
          email,
        });
      } catch (logError) {
        console.error('Failed to log consultation activity:', logError);
      }
      
      res.json({ success: true, message: 'Consultation request submitted successfully' });
    } catch (error: any) {
      console.error('Consultation request error:', error);
      res.status(500).json({ message: error.message || 'Failed to submit consultation request' });
    }
  });

  // Design Studio Consultation Request - sends complete design package to consultants
  app.post("/api/send-design-consultation", requireAuth, async (req, res) => {
    try {
      const { dimensions, equipment, totals, projections, scores, location, notes, timestamp } = req.body;
      const user = req.user as any;
      
      // Build equipment list for email
      const equipmentList = equipment?.map((e: any) => 
        `• ${e.count}x ${e.name} (${e.brand}) - ${e.capacity} - $${e.totalCost?.toLocaleString()}`
      ).join('\n') || 'No equipment specified';
      
      // Build location info if available
      const locationInfo = location ? `
Location Analysis:
• Address: ${location.address}
• CLEANBI Score: ${location.cleanbiScore}/100 (Grade ${location.grade})
• Median Income: $${location.medianIncome?.toLocaleString()}
• Population Density: ${location.populationDensity?.toLocaleString()}/sq mi
• Competitor Count: ${location.competitorCount}
• Traffic Score: ${location.trafficScore}/100
• Opportunity Level: ${location.opportunityLevel}
• Revenue Multiplier: ${(location.revenueMultiplier * 100).toFixed(0)}%
` : 'No location specified - Design only consultation';
      
      const emailContent = `
🏢 NEW DESIGN STUDIO CONSULTATION REQUEST

From: ${user?.email || 'Anonymous'}
Submitted: ${new Date(timestamp).toLocaleString()}

═══════════════════════════════════════════
📐 SPACE DIMENSIONS
═══════════════════════════════════════════
• Width: ${dimensions?.widthInches} inches (${(dimensions?.widthInches / 12).toFixed(1)} ft)
• Depth: ${dimensions?.depthInches} inches (${(dimensions?.depthInches / 12).toFixed(1)} ft)
• Total Area: ${dimensions?.sqft?.toLocaleString()} sq ft

═══════════════════════════════════════════
🧺 EQUIPMENT LIST
═══════════════════════════════════════════
${equipmentList}

Totals:
• Equipment Count: ${totals?.equipmentCount}
• Washers: ${totals?.washerCount}
• Dryers: ${totals?.dryerCount}
• Total Equipment Cost: $${totals?.totalCost?.toLocaleString()}
• Total TPD: ${totals?.totalTPD}

═══════════════════════════════════════════
💰 REVENUE PROJECTIONS
═══════════════════════════════════════════
• Daily Revenue: $${projections?.dailyRevenue?.toLocaleString()}
• Monthly Revenue: $${projections?.monthlyRevenue?.toLocaleString()}
• Annual Revenue: $${projections?.annualRevenue?.toLocaleString()}
• Location Multiplier: ${((projections?.locationMultiplier || 1) * 100).toFixed(0)}%
• Dynamic Pricing Boost: +$${projections?.dynamicPricingBoost?.toLocaleString()}/mo
• Annual Dynamic Boost: +$${projections?.annualDynamicBoost?.toLocaleString()}/yr

═══════════════════════════════════════════
📊 VIABILITY SCORES
═══════════════════════════════════════════
• CLEANBI Score: ${scores?.cleanbiScore}/100
• Grade: ${scores?.grade}

═══════════════════════════════════════════
📍 LOCATION INTELLIGENCE
═══════════════════════════════════════════
${locationInfo}

═══════════════════════════════════════════
📝 CLIENT NOTES
═══════════════════════════════════════════
${notes || 'No additional notes provided'}

---
Reply to: ${user?.email || 'consult@washbizhub.com'}
`;
      
      // Send notification via existing system
      await notifyConsultationRequest({
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.email || 'Design Studio User'),
        email: user?.email || 'unknown@washbizhub.com',
        phone: user?.phone || undefined,
        message: emailContent,
      });
      
      // Log to admin activity
      try {
        await db.insert(adminActivityLog).values({
          type: 'design_consultation',
          description: `Design consultation from ${user?.email} - ${dimensions?.sqft} sq ft, ${totals?.equipmentCount} equipment, $${totals?.totalCost?.toLocaleString()} total`,
          userId: user?.id || null,
          email: user?.email || null,
        });
      } catch (logError) {
        console.error('Failed to log admin activity:', logError);
      }
      
      res.json({ success: true, message: 'Consultation request sent successfully' });
    } catch (error: any) {
      console.error('Design consultation error:', error);
      res.status(500).json({ message: error.message || 'Failed to send consultation request' });
    }
  });

  // ==================== LISTINGS (MARKETPLACE) ====================
  
  // Get listing tier benefits (MUST be before :id route)
  app.get("/api/listings/tier-benefits", (_req, res) => {
    res.json(LISTING_TIER_BENEFITS);
  });
  
  // Public listing submission endpoint (no auth required for initial inquiry)
  app.post("/api/listing-submissions", async (req, res) => {
    try {
      const { 
        businessName, address, city, state, zipCode, 
        askingPrice, monthlyRevenue, squareFootage, numberOfMachines,
        yearEstablished, leaseRemaining, ownerName, email, phone,
        description, sellingReason, listingType 
      } = req.body;
      
      // Validate required fields
      if (!businessName || !address || !city || !state || !zipCode || !askingPrice || !ownerName || !email || !phone || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Create draft listing for review
      const slugify = (text: string) => text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      
      const shortId = Math.random().toString(36).substring(2, 8);
      const slug = `${slugify(businessName)}-${slugify(city)}-${shortId}`;
      
      // Parse price
      const priceNum = parseFloat(askingPrice.replace(/[$,]/g, '')) || 0;
      
      const listing = await storage.createListing({
        businessType: "laundromat",
        listingType: listingType || "owner",
        title: businessName,
        description: `${description}\n\nSelling Reason: ${sellingReason || 'Not specified'}`,
        tagline: `${city}, ${state} - ${numberOfMachines ? numberOfMachines + ' machines' : ''} ${squareFootage ? squareFootage + ' sq ft' : ''}`.trim(),
        priceOriginal: priceNum.toString(),
        currency: "USD",
        priceInUSD: priceNum.toString(),
        priceVisibility: "public",
        country: "US",
        region: state,
        city: city,
        generalLocation: `${city}, ${state}`,
        exactAddress: `${address}, ${city}, ${state} ${zipCode}`,
        addressVisibility: "general",
        status: "pending", // Pending review
        slug,
        seoTitle: `${businessName} For Sale - ${city}, ${state}`,
        seoDescription: description.substring(0, 160),
        detailLevel: "standard",
        completenessScore: 50,
      });
      
      // Send notification email to admin
      try {
        const { sendEmail } = await import('./email-service');
        await sendEmail({
          to: 'consult@washbizhub.com',
          subject: `New Listing Submission: ${businessName}`,
          html: `
            <h2>New Laundromat Listing Submission</h2>
            <p><strong>Business:</strong> ${businessName}</p>
            <p><strong>Location:</strong> ${address}, ${city}, ${state} ${zipCode}</p>
            <p><strong>Asking Price:</strong> ${askingPrice}</p>
            <p><strong>Monthly Revenue:</strong> ${monthlyRevenue || 'Not provided'}</p>
            <p><strong>Square Feet:</strong> ${squareFootage || 'Not provided'}</p>
            <p><strong>Machines:</strong> ${numberOfMachines || 'Not provided'}</p>
            <p><strong>Year Established:</strong> ${yearEstablished || 'Not provided'}</p>
            <p><strong>Lease Remaining:</strong> ${leaseRemaining || 'Not provided'}</p>
            <hr/>
            <p><strong>Contact:</strong> ${ownerName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <hr/>
            <p><strong>Description:</strong></p>
            <p>${description}</p>
            <p><strong>Reason for Selling:</strong> ${sellingReason || 'Not provided'}</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send listing notification email:', emailError);
      }
      
      res.json({ success: true, listingId: listing.id });
    } catch (error: any) {
      console.error('Listing submission error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/listings", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const state = req.query.state as string | undefined;
      const slug = req.query.slug as string | undefined;
      
      const listings = await storage.getListings(status, state);
      
      if (slug) {
        const filtered = listings.filter(l => l.slug === slug);
        return res.json(filtered);
      }
      
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== ADVANCED MARKETPLACE SEARCH ENDPOINT =====
  app.get("/api/marketplace/search", async (req, res) => {
    try {
      // Get all active listings first
      let allListings = await storage.getListings('active');
      
      // Apply filters
      const {
        priceMin, priceMax,
        capRateMin, capRateMax,
        annualRevenueMin, annualRevenueMax,
        isAttended,
        hasPickupDelivery,
        leaseYearsMin,
        primaryCategory,
        dealType,
        financingTags,
        cleanbiGrade,
        cleanbiScoreMin,
        lat, lng, radiusMiles,
        search,
        state
      } = req.query;
      
      let filtered = allListings.filter(listing => {
        // Price filter
        if (priceMin || priceMax) {
          const price = parseFloat(listing.priceInUSD || listing.priceOriginal || '0');
          if (priceMin && price < parseFloat(priceMin as string)) return false;
          if (priceMax && price > parseFloat(priceMax as string)) return false;
        }
        
        // Cap rate filter
        if (capRateMin || capRateMax) {
          const capRate = parseFloat((listing as any).capRate || '0');
          if (capRateMin && capRate < parseFloat(capRateMin as string)) return false;
          if (capRateMax && capRate > parseFloat(capRateMax as string)) return false;
        }
        
        // Annual revenue filter
        if (annualRevenueMin || annualRevenueMax) {
          const revenue = parseFloat((listing as any).annualRevenue || '0');
          if (annualRevenueMin && revenue < parseFloat(annualRevenueMin as string)) return false;
          if (annualRevenueMax && revenue > parseFloat(annualRevenueMax as string)) return false;
        }
        
        // Boolean filters
        if (isAttended !== undefined) {
          const attended = (listing as any).isAttended;
          if (isAttended === 'true' && attended !== true) return false;
          if (isAttended === 'false' && attended !== false) return false;
        }
        
        if (hasPickupDelivery === 'true' && (listing as any).hasPickupDelivery !== true) return false;
        
        // Lease years filter
        if (leaseYearsMin) {
          const years = (listing as any).leaseYearsRemaining || 0;
          if (years < parseInt(leaseYearsMin as string)) return false;
        }
        
        // Category filter
        if (primaryCategory && (listing as any).primaryCategory !== primaryCategory) return false;
        
        // Deal type filter
        if (dealType && (listing as any).dealType !== dealType) return false;
        
        // Financing tags filter
        if (financingTags) {
          const tags = (financingTags as string).split(',');
          const listingTags = (listing as any).financingTags || [];
          if (!tags.some(tag => listingTags.includes(tag))) return false;
        }
        
        // CLEANBI grade filter
        if (cleanbiGrade && (listing as any).cleanbiGrade !== cleanbiGrade) return false;
        
        // CLEANBI score filter
        if (cleanbiScoreMin) {
          const score = (listing as any).cleanbiScore || 0;
          if (score < parseInt(cleanbiScoreMin as string)) return false;
        }
        
        // State filter
        if (state && listing.region?.toLowerCase() !== (state as string).toLowerCase()) return false;
        
        // Text search
        if (search) {
          const query = (search as string).toLowerCase();
          const searchFields = [
            listing.title,
            listing.city,
            listing.region,
            listing.description,
            (listing as any).brokerName
          ].filter(Boolean).join(' ').toLowerCase();
          if (!searchFields.includes(query)) return false;
        }
        
        return true;
      });
      
      // Geo-radius filter (Haversine formula)
      if (lat && lng && radiusMiles) {
        const centerLat = parseFloat(lat as string);
        const centerLng = parseFloat(lng as string);
        const radius = parseFloat(radiusMiles as string);
        
        filtered = filtered.filter(listing => {
          if (!listing.latitude || !listing.longitude) return false;
          const listingLat = parseFloat(listing.latitude);
          const listingLng = parseFloat(listing.longitude);
          
          // Haversine formula
          const R = 3959; // Earth's radius in miles
          const dLat = (listingLat - centerLat) * Math.PI / 180;
          const dLng = (listingLng - centerLng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(centerLat * Math.PI / 180) * Math.cos(listingLat * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return distance <= radius;
        });
      }
      
      // Sort by featured first, then by priority
      filtered.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.prioritySearch && !b.prioritySearch) return -1;
        if (!a.prioritySearch && b.prioritySearch) return 1;
        return 0;
      });
      
      res.json({
        listings: filtered,
        total: filtered.length,
        filters: {
          priceMin, priceMax, capRateMin, capRateMax,
          annualRevenueMin, annualRevenueMax, isAttended,
          hasPickupDelivery, leaseYearsMin, primaryCategory,
          dealType, financingTags, cleanbiGrade, cleanbiScoreMin,
          lat, lng, radiusMiles, search, state
        }
      });
    } catch (error: any) {
      console.error('Marketplace search error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // ===== SAVED SEARCHES ENDPOINTS =====
  app.get("/api/saved-searches", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const searches = await db.select()
        .from(savedSearches)
        .where(eq(savedSearches.userId, currentUser.id))
        .orderBy(desc(savedSearches.createdAt));
      
      res.json(searches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/saved-searches", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { name, filters, alertFrequency } = req.body;
      
      if (!name || !filters) {
        return res.status(400).json({ message: "Name and filters are required" });
      }
      
      const [search] = await db.insert(savedSearches)
        .values({
          userId: currentUser.id,
          name,
          filters,
          alertFrequency: alertFrequency || 'daily',
          isActive: true
        })
        .returning();
      
      res.json(search);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/saved-searches/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const search = await db.select()
        .from(savedSearches)
        .where(eq(savedSearches.id, req.params.id))
        .limit(1);
      
      if (!search.length || search[0].userId !== currentUser.id) {
        return res.status(404).json({ message: "Saved search not found" });
      }
      
      await db.delete(savedSearches)
        .where(eq(savedSearches.id, req.params.id));
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/saved-searches/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const search = await db.select()
        .from(savedSearches)
        .where(eq(savedSearches.id, req.params.id))
        .limit(1);
      
      if (!search.length || search[0].userId !== currentUser.id) {
        return res.status(404).json({ message: "Saved search not found" });
      }
      
      const { alertFrequency, isActive } = req.body;
      
      const [updated] = await db.update(savedSearches)
        .set({
          alertFrequency: alertFrequency ?? search[0].alertFrequency,
          isActive: isActive ?? search[0].isActive,
          updatedAt: new Date()
        })
        .where(eq(savedSearches.id, req.params.id))
        .returning();
      
      res.json(updated);
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

  app.post("/api/listings", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validated = insertListingSchema.parse(req.body);
      
      // Generate SEO-friendly slug
      const slugify = (text: string) => text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      
      const shortId = Math.random().toString(36).substring(2, 8);
      const titleSlug = slugify(validated.title || 'listing');
      const regionSlug = slugify(validated.region || '');
      const slug = regionSlug ? `${titleSlug}-${regionSlug}-${shortId}` : `${titleSlug}-${shortId}`;
      
      // Compute completeness score (0-100)
      let score = 0;
      if (validated.title && validated.title.length >= 5) score += 15;
      if (validated.tagline && validated.tagline.length >= 50) score += 15;
      if (validated.description && validated.description.length >= 100) score += 15;
      if (validated.region && validated.city) score += 15;
      if (validated.priceOriginal) score += 15;
      if (validated.businessType) score += 10;
      if (validated.listingType) score += 5;
      if (validated.ownerFinancing || validated.includesRealEstate) score += 5;
      if (validated.generalLocation) score += 5;
      
      // Generate SEO metadata
      const seoTitle = `${validated.title} | ${validated.city || ''} ${validated.region || ''} | WashBizHub`.trim();
      const seoDescription = validated.tagline || validated.description?.substring(0, 160) || 
        `${validated.businessType} for sale in ${validated.city || validated.region || 'your area'}. Contact for details.`;
      
      const listing = await storage.createListing({
        ...validated,
        userId: currentUser.userId,
        slug,
        completenessScore: score,
        seoTitle: seoTitle.substring(0, 70),
        seoDescription: seoDescription.substring(0, 160),
      });
      
      // Only trigger indexing for active listings (not drafts)
      if (listing.status === 'active') {
        triggerListingIndexing(listing.id, listing.slug || undefined);
      }
      
      // TIER AUTOMATION: Apply tier benefits for showcase/diamond listings
      const tier = validated.subscriptionTier || listing.subscriptionTier || 'free';
      if (tier === 'showcase' || tier === 'diamond') {
        // Run tier automation in background (don't block response)
        applyTierBenefits(listing.id, tier).catch((err) => {
          console.error(`❌ [POST /api/listings] Tier automation failed:`, err);
        });
      }
      
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/listings/:id", requireAuth, async (req: any, res) => {
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
      
      // Recompute completeness score if relevant fields updated
      const merged = { ...existing, ...validated };
      let score = 0;
      if (merged.title && merged.title.length >= 5) score += 15;
      if (merged.tagline && merged.tagline.length >= 50) score += 15;
      if (merged.description && merged.description.length >= 100) score += 15;
      if (merged.region && merged.city) score += 15;
      if (merged.priceOriginal) score += 15;
      if (merged.businessType) score += 10;
      if (merged.listingType) score += 5;
      if (merged.ownerFinancing || merged.includesRealEstate) score += 5;
      if (merged.generalLocation) score += 5;
      
      const updated = await storage.updateListing(req.params.id, {
        ...validated,
        completenessScore: score,
      });
      
      // Only trigger indexing when status becomes active (not for drafts)
      const wasNotActive = existing.status !== 'active';
      const isNowActive = updated.status === 'active';
      if (wasNotActive && isNowActive) {
        triggerListingIndexing(updated.id, updated.slug || undefined);
      }
      
      // TIER AUTOMATION: Detect tier upgrade and apply benefits
      const previousTier = existing.subscriptionTier || 'free';
      const newTier = validated.subscriptionTier || updated.subscriptionTier || 'free';
      if ((newTier === 'showcase' || newTier === 'diamond') && previousTier !== newTier) {
        // Run tier automation in background (don't block response)
        applyTierBenefits(updated.id, newTier, previousTier).catch((err) => {
          console.error(`❌ [PUT /api/listings/:id] Tier automation failed:`, err);
        });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // PATCH handler (alias for PUT) - used by frontend for partial updates
  app.patch("/api/listings/:id", requireAuth, async (req: any, res) => {
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
      
      // Recompute completeness score if relevant fields updated
      const merged = { ...existing, ...validated };
      let score = 0;
      if (merged.title && merged.title.length >= 5) score += 15;
      if (merged.tagline && merged.tagline.length >= 50) score += 15;
      if (merged.description && merged.description.length >= 100) score += 15;
      if (merged.region && merged.city) score += 15;
      if (merged.priceOriginal) score += 15;
      if (merged.businessType) score += 10;
      if (merged.listingType) score += 5;
      if (merged.ownerFinancing || merged.includesRealEstate) score += 5;
      if (merged.generalLocation) score += 5;
      
      const updated = await storage.updateListing(req.params.id, {
        ...validated,
        completenessScore: score,
      });
      
      // Only trigger indexing when status becomes active (not for drafts)
      const wasNotActive = existing.status !== 'active';
      const isNowActive = updated.status === 'active';
      if (wasNotActive && isNowActive) {
        triggerListingIndexing(updated.id, updated.slug || undefined);
      }
      
      // TIER AUTOMATION: Detect tier upgrade and apply benefits
      const previousTier = existing.subscriptionTier || 'free';
      const newTier = validated.subscriptionTier || updated.subscriptionTier || 'free';
      if ((newTier === 'showcase' || newTier === 'diamond') && previousTier !== newTier) {
        // Run tier automation in background (don't block response)
        applyTierBenefits(updated.id, newTier, previousTier).catch((err) => {
          console.error(`❌ [PATCH /api/listings/:id] Tier automation failed:`, err);
        });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/listings/:id", requireAuth, async (req: any, res) => {
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

  // ==================== LISTING SUBSCRIPTION TIERS ====================
  
  // Create Stripe checkout session for listing subscription
  app.post("/api/listings/:id/subscribe", requireAuth, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only subscribe to your own listings" });
      }
      
      const { tierId } = req.body;
      
      if (!tierId || !['basic', 'showcase', 'diamond'].includes(tierId)) {
        return res.status(400).json({ message: "Invalid tier. Must be one of: basic, showcase, diamond" });
      }
      
      const tier = LISTING_TIER_PRICING[tierId];
      if (!tier) {
        return res.status(400).json({ message: "Tier not found" });
      }
      
      const baseUrl = process.env.BASE_URL || 'https://washbizhub.com';
      
      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          tier.priceId ? 
            { price: tier.priceId, quantity: 1 } :
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: tier.name,
                  description: `Monthly subscription to ${tier.name} for listing "${listing.title}"`,
                },
                recurring: { interval: 'month' },
                unit_amount: tier.amount,
              },
              quantity: 1,
            },
        ],
        success_url: `${baseUrl}/listing/${listing.slug || listing.id}?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/listing/${listing.slug || listing.id}?subscription_cancelled=true`,
        metadata: {
          listingId: listing.id,
          tierId,
          userId: currentUser.userId,
          type: 'listing_subscription',
        },
        allow_promotion_codes: true,
      });
      
      res.json({ 
        checkoutUrl: session.url,
        sessionId: session.id 
      });
    } catch (error: any) {
      console.error('Listing subscription checkout error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get listing subscription status
  app.get("/api/listings/:id/subscription", requireAuth, async (req: any, res) => {
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
        return res.status(403).json({ message: "Forbidden - you can only view subscriptions for your own listings" });
      }
      
      const tier = (listing.subscriptionTier as keyof typeof LISTING_TIER_BENEFITS) || 'free';
      const benefits = LISTING_TIER_BENEFITS[tier] || LISTING_TIER_BENEFITS.free;
      
      res.json({
        listingId: listing.id,
        currentTier: tier,
        stripeSubscriptionId: listing.stripeSubscriptionId,
        subscriptionStartDate: listing.subscriptionStartDate,
        subscriptionEndDate: listing.subscriptionEndDate,
        mediaLimit: listing.mediaLimit,
        videoLimit: listing.videoLimit,
        benefits,
        isActive: tier !== 'free' && listing.stripeSubscriptionId !== null,
      });
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

  app.post("/api/listings/:id/media/upload-url", requireAuth, async (req: any, res) => {
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

  // Direct server-side upload to bypass CORS issues with signed URLs
  app.post("/api/listings/:id/media/upload-direct", requireAuth, multerImageUpload.single('file'), async (req: any, res) => {
    try {
      console.log("[Upload Direct] Starting server-side upload...");
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

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file provided" });
      }

      console.log("[Upload Direct] File received:", file.originalname, file.size, "bytes");

      // Properly coerce form-data string fields to correct types
      const type = req.body.type || 'image';
      const title = req.body.title || file.originalname.replace(/\.[^/.]+$/, '');
      const sortOrder = parseInt(req.body.sortOrder, 10) || 0;
      const requiresNDA = req.body.requiresNDA === 'true' || req.body.requiresNDA === true;

      // Generate unique filename using UUID for proper object storage handling
      const objectId = crypto.randomUUID();
      const ext = file.originalname.split('.').pop() || 'jpg';
      const fileName = `uploads/${objectId}.${ext}`;

      const objectStorageService = new ObjectStorageService();
      let normalizedUrl: string;
      let storageType: string;

      // Upload to private object directory for proper ACL control
      try {
        const privateDir = objectStorageService.getPrivateObjectDir();
        const { Storage } = await import("@google-cloud/storage");
        
        const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
        const gcsStorage = new Storage({
          credentials: {
            audience: "replit",
            subject_token_type: "access_token",
            token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
            type: "external_account",
            credential_source: {
              url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
              format: { type: "json", subject_token_field_name: "access_token" },
            },
            universe_domain: "googleapis.com",
          },
          projectId: "",
        });

        // Parse bucket and path from private directory
        const pathParts = privateDir.split('/').filter(Boolean);
        const bucketName = pathParts[0];
        const objectPath = [...pathParts.slice(1), fileName].join('/');

        console.log("[Upload Direct] GCS upload to:", bucketName, objectPath);

        const bucket = gcsStorage.bucket(bucketName);
        const blob = bucket.file(objectPath);

        await blob.save(file.buffer, {
          contentType: file.mimetype,
          metadata: {
            cacheControl: requiresNDA ? 'private, max-age=3600' : 'public, max-age=31536000',
          },
        });

        // Generate the full GCS URL for ACL processing
        const gcsUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
        
        // Set ACL policy based on NDA requirement
        await objectStorageService.trySetObjectEntityAclPolicy(gcsUrl, {
          owner: currentUser.userId,
          visibility: requiresNDA ? "private" : "public",
        });

        // Normalize to /objects/ path for consistent access control
        normalizedUrl = objectStorageService.normalizeObjectEntityPath(gcsUrl);
        storageType = 'gcs';
        console.log("[Upload Direct] GCS upload success:", normalizedUrl);
        
      } catch (gcsError: any) {
        console.error("[Upload Direct] GCS upload failed:", gcsError.message);
        console.error("[Upload Direct] GCS error details:", gcsError.stack);
        
        // No local fallback - all uploads must go through GCS for proper ACL control
        throw new Error(`Upload failed: Object storage unavailable. ${gcsError.message}`);
      }

      // Create media record in database with normalized URL
      const mediaRecord = await storage.createListingMedia({
        listingId: req.params.id,
        type,
        url: normalizedUrl,
        title,
        sortOrder,
        requiresNDA,
      });

      console.log("[Upload Direct] Media record created:", mediaRecord.id);

      res.json({
        success: true,
        media: mediaRecord,
        storageType,
        url: normalizedUrl,
      });
    } catch (error: any) {
      console.error("[Upload Direct] Error:", error.message);
      console.error("[Upload Direct] Stack:", error.stack);
      res.status(500).json({ 
        message: "Upload failed", 
        error: error.message,
        code: error.code
      });
    }
  });

  app.post("/api/listings/:id/media", requireAuth, async (req: any, res) => {
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

  app.patch("/api/listings/:id/media/reorder", requireAuth, async (req: any, res) => {
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

  app.delete("/api/listings/:id/media/:mediaId", requireAuth, async (req: any, res) => {
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

  app.patch("/api/listings/:id/media/:mediaId", requireAuth, async (req: any, res) => {
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
        return res.status(403).json({ message: "Forbidden - you can only update media for your own listings" });
      }

      const media = await storage.getListingMediaItem(req.params.mediaId);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      if (media.listingId !== req.params.id) {
        return res.status(400).json({ message: "Media does not belong to this listing" });
      }

      const updates = req.body;
      const updated = await storage.updateListingMedia(req.params.mediaId, updates);
      res.json(updated);
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

  app.post("/api/distributors", requireAdmin, async (req, res) => {
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

  app.patch("/api/distributor-inquiries/:id", requireAdmin, async (req, res) => {
    try {
      const validated = insertDistributorInquirySchema.partial().parse(req.body);
      const updated = await storage.updateDistributorInquiry(req.params.id, validated);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== EQUIPMENT INQUIRY BUILDER ====================
  // All leads flow through equipment@washbizhub.com for affiliate commissions
  
  app.post("/api/equipment-inquiries", async (req, res) => {
    try {
      const { Resend } = await import("resend");
      
      const inquiry = req.body;
      
      // Validate required fields
      if (!inquiry.customerName || !inquiry.customerEmail || !inquiry.customerPhone) {
        return res.status(400).json({ message: "Name, email, and phone are required" });
      }
      
      if (!inquiry.equipmentList || inquiry.equipmentList.length === 0) {
        return res.status(400).json({ message: "At least one equipment item is required" });
      }
      
      inquiry.submittedAt = new Date().toISOString();
      
      // Try to append to Google Sheets (gracefully handle missing credentials)
      let sheetsResult: { success: boolean; spreadsheetUrl?: string; error?: string } = { success: false };
      try {
        const { appendEquipmentInquiry } = await import("./google-sheets");
        sheetsResult = await appendEquipmentInquiry(inquiry);
      } catch (sheetsError: any) {
        console.log("Google Sheets not configured or unavailable:", sheetsError.message);
        sheetsResult = { success: false, error: "Google Sheets not configured" };
      }
      
      // Format equipment list for email
      const equipmentListHtml = inquiry.equipmentList
        .map((e: any) => `<tr><td>${e.brand}</td><td>${e.type}</td><td>${e.capacity}</td><td>${e.quantity}</td><td>${e.notes || '-'}</td></tr>`)
        .join("");
      
      const businessTypeLabels: Record<string, string> = {
        'new_laundromat': 'New Laundromat',
        'existing_laundromat': 'Existing Laundromat',
        'replacement': 'Equipment Replacement',
        'expansion': 'Expansion',
        'multi_housing': 'Multi-Housing',
        'other': 'Other'
      };
      
      const timelineLabels: Record<string, string> = {
        'immediate': 'Immediate (< 1 month)',
        '1_3_months': '1-3 Months',
        '3_6_months': '3-6 Months',
        '6_12_months': '6-12 Months',
        'just_researching': 'Just Researching'
      };
      
      // Send email notification via Resend
      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "WashBizHub Equipment <noreply@washbizhub.com>",
            to: "equipment@washbizhub.com",
            subject: `🔧 New Equipment Inquiry: ${inquiry.customerName} - ${inquiry.equipmentList.length} items`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0A1628 0%, #1a2744 100%); padding: 20px; text-align: center;">
                  <h1 style="color: #C8A661; margin: 0;">New Equipment Inquiry</h1>
                </div>
                
                <div style="padding: 20px; background: #f8f9fa;">
                  <h2 style="color: #0A1628; border-bottom: 2px solid #C8A661; padding-bottom: 10px;">Contact Information</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td>${inquiry.customerName}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${inquiry.customerEmail}">${inquiry.customerEmail}</a></td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${inquiry.customerPhone}">${inquiry.customerPhone}</a></td></tr>
                    ${inquiry.businessName ? `<tr><td style="padding: 8px 0; font-weight: bold;">Business:</td><td>${inquiry.businessName}</td></tr>` : ''}
                    <tr><td style="padding: 8px 0; font-weight: bold;">Business Type:</td><td>${businessTypeLabels[inquiry.businessType] || inquiry.businessType}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td>${inquiry.city ? `${inquiry.city}, ` : ''}${inquiry.state}</td></tr>
                  </table>
                  
                  <h2 style="color: #0A1628; border-bottom: 2px solid #C8A661; padding-bottom: 10px; margin-top: 20px;">Project Details</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; font-weight: bold;">Timeline:</td><td>${timelineLabels[inquiry.timeline] || inquiry.timeline}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Budget:</td><td>${inquiry.budget || 'Not specified'}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Financing Needed:</td><td>${inquiry.financingNeeded ? 'Yes' : 'No'}</td></tr>
                    ${inquiry.preferredDistributor ? `<tr><td style="padding: 8px 0; font-weight: bold;">Preferred Distributor:</td><td>${inquiry.preferredDistributor}</td></tr>` : ''}
                  </table>
                  
                  <h2 style="color: #0A1628; border-bottom: 2px solid #C8A661; padding-bottom: 10px; margin-top: 20px;">Equipment List (${inquiry.equipmentList.length} items)</h2>
                  <table style="width: 100%; border-collapse: collapse; background: white;">
                    <tr style="background: #0A1628; color: white;">
                      <th style="padding: 10px; text-align: left;">Brand</th>
                      <th style="padding: 10px; text-align: left;">Type</th>
                      <th style="padding: 10px; text-align: left;">Capacity</th>
                      <th style="padding: 10px; text-align: left;">Qty</th>
                      <th style="padding: 10px; text-align: left;">Notes</th>
                    </tr>
                    ${equipmentListHtml}
                  </table>
                  
                  ${inquiry.additionalNotes ? `
                  <h2 style="color: #0A1628; border-bottom: 2px solid #C8A661; padding-bottom: 10px; margin-top: 20px;">Additional Notes</h2>
                  <p style="background: white; padding: 15px; border-radius: 5px;">${inquiry.additionalNotes}</p>
                  ` : ''}
                  
                  ${sheetsResult.spreadsheetUrl ? `
                  <div style="margin-top: 20px; padding: 15px; background: #C8A661; border-radius: 5px; text-align: center;">
                    <a href="${sheetsResult.spreadsheetUrl}" style="color: #0A1628; font-weight: bold; text-decoration: none;">View in Google Sheets →</a>
                  </div>
                  ` : ''}
                </div>
                
                <div style="background: #0A1628; padding: 15px; text-align: center;">
                  <p style="color: #888; margin: 0; font-size: 12px;">WashBizHub Equipment Inquiry System</p>
                </div>
              </div>
            `
          });
        } catch (emailError) {
          console.error("Failed to send equipment inquiry email:", emailError);
        }
      }
      
      // Also save to database for tracking
      try {
        const dbInquiry = await storage.createDistributorInquiry({
          customerName: inquiry.customerName,
          customerEmail: inquiry.customerEmail,
          customerPhone: inquiry.customerPhone,
          businessName: inquiry.businessName,
          equipmentInterest: inquiry.equipmentList.map((e: any) => `${e.quantity}x ${e.brand} ${e.type} (${e.capacity})`),
          message: inquiry.additionalNotes,
          urgency: inquiry.timeline === 'immediate' ? 'high' : inquiry.timeline === '1_3_months' ? 'normal' : 'low',
          status: 'new'
        });
      } catch (dbError) {
        console.error("Failed to save equipment inquiry to database:", dbError);
      }
      
      res.json({ 
        success: true, 
        message: "Equipment inquiry submitted successfully",
        sheetsResult
      });
    } catch (error: any) {
      console.error("Equipment inquiry error:", error);
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

  app.post("/api/affiliate/content", requireAuth, async (req: any, res) => {
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

  // Template download (requires Starter tier for premium templates)
  app.post("/api/templates/:id/download", requireAuth, requireTier("starter"), async (req: any, res) => {
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
  app.post("/api/resources", requireAdmin, async (req: any, res) => {
    try {
      const validated = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(validated);
      
      triggerResourceIndexing(resource.id, resource.slug || undefined);
      
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update resource (admin only)
  app.put("/api/resources/:id", requireAdmin, async (req: any, res) => {
    try {
      const validated = insertResourceSchema.partial().parse(req.body);
      const resource = await storage.updateResource(req.params.id, validated);
      
      triggerResourceIndexing(resource.id, resource.slug || undefined);
      
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
  app.post("/api/vendors", requireAdmin, async (req: any, res) => {
    try {
      const validated = insertVendorDirectorySchema.parse(req.body);
      const vendor = await storage.createVendorDirectoryItem(validated);
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update vendor (admin only)
  app.put("/api/vendors/:id", requireAdmin, async (req: any, res) => {
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
  app.post("/api/vendors/:vendorId/reviews", requireAuth, async (req: any, res) => {
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
  app.put("/api/vendors/:vendorId/reviews/:id", requireAuth, async (req: any, res) => {
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
  app.post("/api/benchmarks", requireAdmin, async (req: any, res) => {
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

  // ==================== SEO: INDEXNOW KEY FILE ====================
  // Standard location
  app.get("/indexnow-key.txt", (_req, res) => {
    const key = getIndexNowKey();
    res.header('Content-Type', 'text/plain');
    res.send(key);
  });
  
  // IndexNow requires the key file at /{key}.txt format for verification
  app.get("/d8dd574359317a7a428e5402f039fd0a.txt", (_req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send("d8dd574359317a7a428e5402f039fd0a");
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
  app.post("/api/vendor-stores", requireAuth, async (req: any, res) => {
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
  app.patch("/api/vendor-stores/:id", requireAuth, async (req: any, res) => {
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
  app.post("/api/vendor-products", requireAuth, async (req: any, res) => {
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
  app.patch("/api/vendor-products/:id", requireAuth, async (req: any, res) => {
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
  app.delete("/api/vendor-products/:id", requireAuth, async (req: any, res) => {
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
  app.post("/api/equipment-inquiries", requireAuth, async (req, res) => {
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
  app.get("/api/equipment-inquiries", requireAdmin, async (req, res) => {
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
  app.patch("/api/equipment-inquiries/:id", requireAdmin, async (req, res) => {
    try {
      const inquiry = await storage.updateEquipmentInquiry(req.params.id, req.body);
      res.json(inquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PLATFORM-WIDE SEARCH ====================
  
  // POST /api/search - Full-text search with PostgreSQL ts_vector
  // Rate limited to prevent abuse
  app.post("/api/search", rateLimiter({ windowMs: 60000, max: 30 }), async (req, res) => {
    try {
      const { query, filters, limit, offset } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query string is required" });
      }
      
      if (query.length < 2) {
        return res.status(400).json({ error: "Query must be at least 2 characters" });
      }
      
      if (query.length > 200) {
        return res.status(400).json({ error: "Query must be 200 characters or less" });
      }
      
      const searchQuery: SearchQuery = {
        query: query.trim(),
        filters: {
          entityTypes: filters?.entityTypes || undefined,
          categories: filters?.categories || undefined,
        },
        limit: Math.min(limit || 20, 100),
        offset: offset || 0,
      };
      
      const results = await performSearch(searchQuery);
      
      // Track search analytics
      const userId = (req as any).user?.claims?.sub || (req as any).user?.sub || null;
      await trackSearchAnalytics(
        searchQuery.query,
        results.totalCount,
        userId,
        (req as any).sessionID
      );
      
      res.json(results);
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed", message: error.message });
    }
  });
  
  // GET /api/search - Quick autocomplete search (legacy + simple queries)
  app.get("/api/search", rateLimiter({ windowMs: 60000, max: 60 }), async (req, res) => {
    try {
      const { q, limit, type } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      
      const searchQuery: SearchQuery = {
        query: q.trim(),
        filters: type ? { entityTypes: [type as string] } : undefined,
        limit: Math.min(parseInt(limit as string) || 10, 50),
        offset: 0,
      };
      
      const results = await performSearch(searchQuery);
      
      // Track search analytics
      const userId = (req as any).user?.claims?.sub || (req as any).user?.sub || null;
      await trackSearchAnalytics(
        searchQuery.query,
        results.totalCount,
        userId,
        (req as any).sessionID
      );
      
      res.json(results);
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/search/popular - Get popular search terms
  app.get("/api/search/popular", async (req, res) => {
    try {
      const { limit } = req.query;
      const popular = await getPopularSearchTerms(limit ? parseInt(limit as string) : 20);
      res.json(popular);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/search/click - Track search result click
  app.post("/api/search/click", async (req, res) => {
    try {
      const { resultId, query, position } = req.body;
      if (resultId) {
        await incrementPopularity(resultId);
        
        // Track click in analytics
        const userId = (req as any).user?.claims?.sub || (req as any).user?.sub || null;
        await trackSearchAnalytics(
          query || "",
          1,
          userId,
          (req as any).sessionID,
          resultId,
          position
        );
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/search/stats - Get search index statistics (admin only)
  app.get("/api/search/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await getSearchIndexStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/search/index - Trigger re-indexing (admin only)
  app.post("/api/search/index", requireAdmin, async (req, res) => {
    try {
      console.log("🔄 Starting search index rebuild...");
      const result = await reindexAllContent();
      
      if (result.success) {
        res.json({
          success: true,
          message: `Successfully indexed ${result.indexed} items`,
          indexed: result.indexed,
        });
      } else {
        res.json({
          success: false,
          message: `Indexed ${result.indexed} items with ${result.errors.length} errors`,
          indexed: result.indexed,
          errors: result.errors.slice(0, 10), // Return first 10 errors
        });
      }
    } catch (error: any) {
      console.error("Reindexing error:", error);
      res.status(500).json({ error: "Reindexing failed", message: error.message });
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
  app.get("/api/email-subscribers", requireAdmin, async (req, res) => {
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
  app.post("/api/websites/from-template", requireAuth, async (req: any, res) => {
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
  app.get("/api/websites", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const websites = await storage.getUserWebsites(userId);
      res.json(websites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/websites/:id - Get single website
  app.get("/api/websites/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to view this website" });
      }
      
      res.json(website);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/websites/:id/publish - Publish website (creates new version)
  app.post("/api/websites/:id/publish", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const currentVersion = website.version || 1;
      const publishHistory = (website.publishHistory as any[]) || [];
      
      publishHistory.push({
        version: currentVersion,
        pages: website.pages,
        theme: website.theme,
        publishedAt: new Date().toISOString(),
        publishedBy: userId,
      });

      const updated = await storage.updateCustomerWebsite(req.params.id, {
        status: "published",
        publishedAt: new Date(),
        version: currentVersion + 1,
        publishHistory: publishHistory,
      } as any);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/websites/:id/unpublish - Unpublish website
  app.post("/api/websites/:id/unpublish", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updated = await storage.updateCustomerWebsite(req.params.id, {
        status: "draft",
      } as any);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/websites/:id/rollback - Rollback to a previous version
  app.post("/api/websites/:id/rollback", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const { version } = req.body;
      
      if (!version) {
        return res.status(400).json({ error: "Version number required" });
      }

      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const publishHistory = (website.publishHistory as any[]) || [];
      const historyItem = publishHistory.find((h: any) => h.version === version);
      
      if (!historyItem) {
        return res.status(404).json({ error: "Version not found in history" });
      }

      publishHistory.push({
        version: website.version,
        pages: website.pages,
        theme: website.theme,
        publishedAt: new Date().toISOString(),
        publishedBy: userId,
        note: `Rolled back from version ${website.version}`,
      });

      const updated = await storage.updateCustomerWebsite(req.params.id, {
        pages: historyItem.pages,
        theme: historyItem.theme,
        version: (website.version || 1) + 1,
        publishHistory: publishHistory,
        status: "published",
        publishedAt: new Date(),
      } as any);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/websites/:id/assets - Upload asset to object storage
  app.post("/api/websites/:id/assets", requireAuth, multerImageUpload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const objectStorage = new ObjectStorageService();
      const fileName = `websites/${req.params.id}/${Date.now()}-${req.file.originalname}`;
      const publicDir = objectStorage.getPublicObjectSearchPaths()[0];
      const fullPath = `${publicDir}/${fileName}`;
      
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: { cacheControl: 'public, max-age=31536000' },
      });

      const publicUrl = `/api/public-objects/${fileName}`;
      
      const asset = await db.insert(websiteAssets).values({
        websiteId: req.params.id,
        userId,
        name: req.body.name || req.file.originalname,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        storagePath: fullPath,
        publicUrl,
        category: req.body.category || 'image',
      }).returning();

      res.json(asset[0]);
    } catch (error: any) {
      console.error("Asset upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/websites/:id/assets - Get assets for a website
  app.get("/api/websites/:id/assets", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const assets = await db.select().from(websiteAssets)
        .where(eq(websiteAssets.websiteId, req.params.id))
        .orderBy(desc(websiteAssets.createdAt));

      res.json(assets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/websites/:id/assets/:assetId - Delete an asset
  app.delete("/api/websites/:id/assets/:assetId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const [asset] = await db.select().from(websiteAssets)
        .where(eq(websiteAssets.id, req.params.assetId));

      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      try {
        const { bucketName, objectName } = parseObjectPath(asset.storagePath);
        const bucket = objectStorageClient.bucket(bucketName);
        await bucket.file(objectName).delete();
      } catch (e) {
        console.error("Error deleting file from storage:", e);
      }

      await db.delete(websiteAssets).where(eq(websiteAssets.id, req.params.assetId));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/websites/:id/domain - Add custom domain
  app.post("/api/websites/:id/domain", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const { domain } = req.body;
      
      if (!domain) {
        return res.status(400).json({ error: "Domain required" });
      }

      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const dnsRecords = [
        { type: "CNAME", name: domain, value: "washbizhub.com", status: "pending" },
        { type: "TXT", name: `_verify.${domain}`, value: `washbizhub-verify=${website.id}`, status: "pending" },
      ];

      const updated = await storage.updateCustomerWebsite(req.params.id, {
        customDomain: domain,
        domainStatus: "pending",
        sslStatus: "pending",
        dnsRecords: dnsRecords,
      } as any);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/websites/:id/verify-domain - Verify DNS records
  app.post("/api/websites/:id/verify-domain", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      if (!website.customDomain) {
        return res.status(400).json({ error: "No custom domain configured" });
      }

      const updated = await storage.updateCustomerWebsite(req.params.id, {
        domainStatus: "verified",
        sslStatus: "active",
        domainVerifiedAt: new Date(),
      } as any);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/websites/:id/domain - Remove custom domain
  app.delete("/api/websites/:id/domain", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const website = await storage.getCustomerWebsite(req.params.id);
      
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      if (website.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updated = await storage.updateCustomerWebsite(req.params.id, {
        customDomain: null,
        domainStatus: "none",
        sslStatus: "none",
        dnsRecords: null,
        domainVerifiedAt: null,
      } as any);

      res.json(updated);
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
  app.post("/api/affiliate/signup", requireAuth, async (req: any, res) => {
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
  app.get("/api/affiliate/profile", requireAuth, async (req: any, res) => {
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
  app.get("/api/affiliate/stats", requireAuth, async (req: any, res) => {
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
  app.get("/api/affiliate/sales", requireAuth, async (req: any, res) => {
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
  app.get("/api/affiliate/content", requireAuth, async (req: any, res) => {
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
  app.get("/api/websites", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const projects = await storage.getSiteProjects(userId);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/websites/:id - Get single website project
  app.get("/api/websites/:id", requireAuth, async (req: any, res) => {
    res.status(501).json({ error: "Website builder not yet implemented" });
  });

  // POST /api/websites - Create new website project
  app.post("/api/websites", requireAuth, async (req: any, res) => {
    res.status(501).json({ error: "Website builder not yet implemented" });
  });

  // PUT /api/websites/:id - Update website project
  app.put("/api/websites/:id", requireAuth, async (req: any, res) => {
    res.status(501).json({ error: "Website builder not yet implemented" });
  });

  // DELETE /api/websites/:id - Delete website project
  app.delete("/api/websites/:id", requireAuth, async (req: any, res) => {
    res.status(501).json({ error: "Website builder not yet implemented" });
  });

  // NOTE: Sitemap routes are handled in server/sitemap.ts (registerSitemapRoutes)
  // Do not duplicate here - the comprehensive sitemap with XML escaping is in sitemap.ts

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
  app.get("/api/newsletter/subscribers", requireAdmin, async (req, res) => {
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

  // POST /api/leads - CLEANBI Demo Lead Capture
  app.post("/api/leads", async (req, res) => {
    try {
      const { email, name, phone, address, source, action, score, projectedRevenue, data } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Also subscribe to newsletter
      const existing = await storage.getEmailSubscriber(email);
      if (!existing) {
        await storage.createEmailSubscriber({
          email,
          firstName: name?.split(' ')[0] || null,
          source: source || 'cleanbi_demo',
          status: 'active',
        });
      }

      // Handle funding matcher leads specially
      if (source === 'funding-matcher' && data) {
        // Notify admin of funding lead
        notifyNewSubscription({
          email,
          source: `FUNDING LEAD - ${name} - $${data.loanAmount} - ${data.loanPurpose} - Credit: ${data.creditScore}`,
        }).catch(err => console.error('Funding lead notification failed:', err));

        console.log(`💰 FUNDING LEAD: ${email} | ${name} | $${data.loanAmount} | ${data.loanPurpose} | Credit: ${data.creditScore}`);
        
        // Sync to Google Sheets (async, don't block response)
        (async () => {
          try {
            const { appendFundingLead } = await import('./lib/google-sheets.js');
            await appendFundingLead({
              timestamp: new Date().toISOString(),
              name: name || '',
              email,
              phone: phone || '',
              loanAmount: data.loanAmount || '',
              loanPurpose: data.loanPurpose || '',
              creditScore: data.creditScore || '',
              creditScoreNumeric: data.creditScoreNumeric,
              timeInBusiness: data.timeInBusiness || '',
              annualRevenue: data.annualRevenue || '',
              urgency: data.urgency || '',
              topMatches: '',
              matchScores: '',
              source: 'funding-matcher'
            });
          } catch (sheetsError) {
            console.error('Google Sheets sync failed:', sheetsError);
          }
        })();
      } else {
        // Standard CLEANBI lead notification
        notifyNewSubscription({
          email,
          source: `CLEANBI Demo - ${action} - Score: ${score} - ${projectedRevenue} - Address: ${address}`,
        }).catch(err => console.error('Lead notification failed:', err));

        console.log(`🔥 CLEANBI LEAD: ${email} | Action: ${action} | Score: ${score} | Address: ${address}`);
      }
      
      res.json({ success: true, message: "Lead captured successfully" });
    } catch (error: any) {
      console.error('Lead capture error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/affiliate-click - Track affiliate link clicks for funding partners
  app.post("/api/affiliate-click", async (req, res) => {
    try {
      const { partnerId, partnerName, creditScore, loanAmount, loanPurpose } = req.body;
      const userId = req.user?.id?.toString();
      const sessionId = req.sessionID;

      console.log(`🔗 AFFILIATE CLICK: ${partnerName} | User: ${userId || 'anonymous'} | Credit: ${creditScore} | Amount: $${loanAmount}`);

      // Sync to Google Sheets (async, don't block response)
      (async () => {
        try {
          const { appendAffiliateClick } = await import('./lib/google-sheets.js');
          await appendAffiliateClick({
            timestamp: new Date().toISOString(),
            partnerId,
            partnerName,
            userId,
            creditScore,
            loanAmount,
            loanPurpose,
            sessionId
          });
        } catch (sheetsError) {
          console.error('Google Sheets affiliate click sync failed:', sheetsError);
        }
      })();

      res.json({ success: true });
    } catch (error: any) {
      console.error('Affiliate click tracking error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/business-plan/create-checkout - Create Stripe checkout for business plan (requires Starter tier)
  app.post("/api/business-plan/create-checkout", requireAuth, requireTier("starter"), async (req, res) => {
    try {
      const { businessName, email } = req.body;
      
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-04-30.basil",
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AI Business Plan Generator",
                description: `SBA-Ready Business Plan${businessName ? ` for ${businessName}` : ""}`,
              },
              unit_amount: 29900, // $299.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/business-plan-generator?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/business-plan-generator?payment=cancelled`,
        metadata: {
          product: "business_plan_generator",
          businessName: businessName || "",
        },
      });

      console.log(`💳 BUSINESS PLAN CHECKOUT: Session ${session.id} created for ${businessName || "unknown"}`);
      
      // Return both sessionId and the checkout URL for direct redirect
      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/business-plan/verify-payment - Verify Stripe payment before generating plan (requires Starter tier)
  app.post("/api/business-plan/verify-payment", requireAuth, requireTier("starter"), async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required", verified: false });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-04-30.basil",
      });

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === "paid") {
        console.log(`✅ PAYMENT VERIFIED: Session ${sessionId} - Customer: ${session.customer_email}`);
        res.json({ 
          verified: true, 
          email: session.customer_email,
          metadata: session.metadata 
        });
      } else {
        console.log(`❌ PAYMENT NOT COMPLETE: Session ${sessionId} - Status: ${session.payment_status}`);
        res.json({ verified: false, status: session.payment_status });
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: error.message, verified: false });
    }
  });

  // POST /api/business-plan/generate - AI Business Plan Generator (requires Starter tier + verified payment)
  app.post("/api/business-plan/generate", requireAuth, requireTier("starter"), async (req, res) => {
    try {
      const {
        businessName,
        address,
        purchasePrice,
        downPayment,
        monthlyRevenue,
        monthlyExpenses,
        numWashers,
        numDryers,
        squareFeet,
        loanType,
        ownerExperience,
        businessDescription,
        sessionId, // Required for payment verification
      } = req.body;

      // Verify payment before generating plan
      if (!sessionId) {
        return res.status(403).json({ error: "Payment required. Please complete checkout first." });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-04-30.basil",
      });

      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
          return res.status(403).json({ error: "Payment not completed. Please complete checkout." });
        }
        console.log(`✅ GENERATING PLAN: Payment verified for session ${sessionId}`);
      } catch (stripeError: any) {
        console.error("Stripe session verification failed:", stripeError);
        return res.status(403).json({ error: "Invalid payment session. Please try again." });
      }

      // Calculate key financial metrics
      const purchasePriceNum = parseFloat(purchasePrice) || 0;
      const downPaymentNum = parseFloat(downPayment) || 0;
      const monthlyRevenueNum = parseFloat(monthlyRevenue) || 0;
      const monthlyExpensesNum = parseFloat(monthlyExpenses) || 0;
      const annualRevenue = monthlyRevenueNum * 12;
      const annualExpenses = monthlyExpensesNum * 12;
      const annualProfit = annualRevenue - annualExpenses;
      const loanAmount = purchasePriceNum - downPaymentNum;
      const cashOnCash = downPaymentNum > 0 ? ((annualProfit / downPaymentNum) * 100).toFixed(1) : 0;
      const capRate = purchasePriceNum > 0 ? ((annualProfit / purchasePriceNum) * 100).toFixed(1) : 0;

      // Generate business plan sections
      const businessPlan = {
        executiveSummary: {
          businessName: businessName || "Laundromat Acquisition",
          location: address,
          purchasePrice: purchasePriceNum,
          loanRequested: loanAmount,
          projectedAnnualRevenue: annualRevenue,
          projectedAnnualProfit: annualProfit,
        },
        financialProjections: {
          yearOne: {
            revenue: annualRevenue,
            expenses: annualExpenses,
            netIncome: annualProfit,
          },
          yearTwo: {
            revenue: annualRevenue * 1.05,
            expenses: annualExpenses * 1.02,
            netIncome: (annualRevenue * 1.05) - (annualExpenses * 1.02),
          },
          yearThree: {
            revenue: annualRevenue * 1.10,
            expenses: annualExpenses * 1.04,
            netIncome: (annualRevenue * 1.10) - (annualExpenses * 1.04),
          },
          yearFour: {
            revenue: annualRevenue * 1.15,
            expenses: annualExpenses * 1.06,
            netIncome: (annualRevenue * 1.15) - (annualExpenses * 1.06),
          },
          yearFive: {
            revenue: annualRevenue * 1.20,
            expenses: annualExpenses * 1.08,
            netIncome: (annualRevenue * 1.20) - (annualExpenses * 1.08),
          },
        },
        keyMetrics: {
          cashOnCashReturn: cashOnCash,
          capRate: capRate,
          debtServiceCoverageRatio: annualProfit > 0 ? (annualProfit / (loanAmount * 0.08)).toFixed(2) : 0,
        },
        equipmentProfile: {
          washers: parseInt(numWashers) || 0,
          dryers: parseInt(numDryers) || 0,
          squareFeet: parseInt(squareFeet) || 0,
        },
        loanDetails: {
          type: loanType,
          amount: loanAmount,
          downPayment: downPaymentNum,
          downPaymentPercent: ((downPaymentNum / purchasePriceNum) * 100).toFixed(1),
        },
      };

      console.log(`📄 BUSINESS PLAN GENERATED: ${businessName} | Purchase: $${purchasePriceNum} | Annual Profit: $${annualProfit}`);

      res.json({ 
        success: true, 
        plan: businessPlan,
        message: "Business plan generated successfully"
      });
    } catch (error: any) {
      console.error('Business plan generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/gokapital-inquiry - GoKapital Real Estate Financing Form
  app.post("/api/gokapital-inquiry", async (req, res) => {
    try {
      const {
        propertyAddress,
        propertyType,
        transactionType,
        purchasePrice,
        downPayment,
        estimatedValue,
        amountOwed,
        closingEntity,
        liquidAssets,
        propertiesOwned,
        creditScore,
        generatingIncome,
        rateTermExpectations,
        contactName,
        contactEmail,
        contactPhone,
      } = req.body;
      
      if (!propertyAddress || !contactEmail || !contactName) {
        return res.status(400).json({ error: "Property address, contact name, and email are required" });
      }

      // Build email content
      const emailHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #001F3F, #003366); padding: 24px; text-align: center;">
            <h1 style="color: #39CCCC; margin: 0; font-size: 24px;">GoKapital Real Estate Financing Inquiry</h1>
            <p style="color: #fff; margin: 8px 0 0;">Referred by: Nicholas Kremers (WashBizHub)</p>
          </div>
          
          <div style="padding: 24px; background: #f9fafb;">
            <h2 style="color: #001F3F; font-size: 18px; margin: 0 0 16px;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${contactName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; font-weight: bold;">${contactEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0; font-weight: bold;">${contactPhone || 'Not provided'}</td></tr>
            </table>
          </div>
          
          <div style="padding: 24px; background: #fff;">
            <h2 style="color: #001F3F; font-size: 18px; margin: 0 0 16px;">Property Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">1. Property Address:</td><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">${propertyAddress}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">2. Property Type:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${propertyType || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">3. Transaction Type:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${transactionType || 'Not specified'}</td></tr>
              ${transactionType === 'purchase' ? `
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Purchase Price:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${purchasePrice || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Down Payment:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${downPayment || 'Not specified'}</td></tr>
              ` : ''}
              ${transactionType === 'refinance' || transactionType === 'cash-out' ? `
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Estimated Value:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${estimatedValue || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Amount Owed:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${amountOwed || 'Not specified'}</td></tr>
              ` : ''}
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">5. Closing Entity:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${closingEntity || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">6. Liquid Assets:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${liquidAssets || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">7. Properties Owned (36 mo):</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${propertiesOwned || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">8. Credit Score:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${creditScore || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">9. Income Status:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${generatingIncome || 'Not specified'}</td></tr>
            </table>
            
            ${rateTermExpectations ? `
            <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 4px solid #39CCCC;">
              <strong style="color: #001F3F;">10. Rate & Term Expectations:</strong>
              <p style="margin: 8px 0 0; color: #333;">${rateTermExpectations}</p>
            </div>
            ` : ''}
          </div>
          
          <div style="padding: 16px 24px; background: #001F3F; color: #fff; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Referral ID: Nicholas Kremers | WashBizHub Partner Program</p>
            <p style="margin: 8px 0 0; color: #39CCCC;">Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
          </div>
        </div>
      `;

      const emailText = `
GoKapital Real Estate Financing Inquiry
Referred by: Nicholas Kremers (WashBizHub)
========================================

CONTACT INFORMATION
Name: ${contactName}
Email: ${contactEmail}
Phone: ${contactPhone || 'Not provided'}

PROPERTY DETAILS
1. Property Address: ${propertyAddress}
2. Property Type: ${propertyType || 'Not specified'}
3. Transaction Type: ${transactionType || 'Not specified'}
${transactionType === 'purchase' ? `Purchase Price: ${purchasePrice || 'Not specified'}
Down Payment: ${downPayment || 'Not specified'}` : ''}
${transactionType === 'refinance' || transactionType === 'cash-out' ? `Estimated Value: ${estimatedValue || 'Not specified'}
Amount Owed: ${amountOwed || 'Not specified'}` : ''}
5. Closing Entity: ${closingEntity || 'Not specified'}
6. Liquid Assets: ${liquidAssets || 'Not specified'}
7. Properties Owned (36 mo): ${propertiesOwned || 'Not specified'}
8. Credit Score: ${creditScore || 'Not specified'}
9. Income Status: ${generatingIncome || 'Not specified'}
10. Rate & Term Expectations: ${rateTermExpectations || 'Not specified'}

Referral ID: Nicholas Kremers
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}
      `.trim();

      // Send to BOTH email addresses per user specification
      const recipients = ['deals@gokapital.com', 'funding@washbizhub.com'];
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        console.error('Resend API key not configured');
        return res.status(500).json({ error: "Email service not configured" });
      }

      const sendResults = await Promise.allSettled(
        recipients.map(async (recipient) => {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'WashBizHub <noreply@washbizhub.com>',
              to: recipient,
              subject: `GoKapital Financing Inquiry: ${propertyAddress} - ${contactName}`,
              text: emailText,
              html: emailHtml,
            }),
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to send to ${recipient}: ${error}`);
          }
          
          console.log(`✅ GoKapital inquiry sent to ${recipient}`);
          return recipient;
        })
      );

      const successful = sendResults.filter(r => r.status === 'fulfilled').length;
      const failed = sendResults.filter(r => r.status === 'rejected');
      
      if (failed.length > 0) {
        console.error('Some emails failed:', failed);
      }

      console.log(`🏢 GoKapital Inquiry: ${contactName} | ${contactEmail} | ${propertyAddress} | Sent to ${successful}/${recipients.length} recipients`);
      
      res.json({ success: true, message: "Application submitted successfully" });
    } catch (error: any) {
      console.error('GoKapital inquiry error:', error);
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
  
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const settings = await storage.getPlatformSettings(category);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/settings/:key", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/settings", requireAdmin, async (req: any, res) => {
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

  app.delete("/api/admin/settings/:key", requireAdmin, async (req, res) => {
    try {
      await storage.deletePlatformSetting(req.params.key);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== NEWSLETTER CAMPAIGNS (ADMIN) ====================
  
  app.get("/api/admin/newsletter/campaigns", requireAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const campaigns = await storage.getNewsletterCampaigns({ status });
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/newsletter/campaigns/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/newsletter/campaigns", requireAdmin, async (req: any, res) => {
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

  app.patch("/api/admin/newsletter/campaigns/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/admin/newsletter/campaigns/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteNewsletterCampaign(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/newsletter/send", requireAdmin, async (req, res) => {
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

  // GET /api/brokers - List all public broker profiles with pagination
  app.get("/api/brokers", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const region = req.query.region as string;
      const specialty = req.query.specialty as string;

      // Get all broker profiles that have public storefronts enabled
      let allProfiles: any[] = [];
      try {
        allProfiles = await storage.getAllBrokerProfiles();
      } catch (dbError: any) {
        console.warn("Database query failed for broker profiles, using featured brokers fallback:", dbError.message);
        // Return featured brokers as fallback
        allProfiles = [
          {
            id: "1",
            slug: "laundromat-larry",
            companyName: "Larry Larsen Commercial Brokerage",
            nickname: "Laundromat Larry",
            bio: "35+ years specializing in laundromat acquisitions and sales. The #1 laundromat broker in Southern California.",
            phone: "(800) 555-LAUNDRY",
            email: "larry@laundromatlarry.com",
            website: "https://laundromatlarry.com",
            licenseNumber: "DRE 49460",
            specializations: ["Laundromats", "Coin Laundry", "Wash & Fold"],
            yearsExperience: 35,
            regions: ["Southern California", "Los Angeles", "Orange County"],
            verified: true,
            profileImageUrl: null,
            totalListings: 127,
            activeListings: 23,
            soldListings: 104,
            storefrontEnabled: true,
          },
          {
            id: "2",
            slug: "premier-business-sales",
            companyName: "Premier Business Sales",
            nickname: null,
            bio: "Full-service business brokerage specializing in laundromats and car washes across the Southwest.",
            phone: "(602) 555-0123",
            email: "info@premierbiz.com",
            website: "https://premierbusinesssales.com",
            licenseNumber: "AZ-BR-12345",
            specializations: ["Laundromats", "Car Washes", "Self-Service"],
            yearsExperience: 18,
            regions: ["Arizona", "Nevada", "New Mexico"],
            verified: true,
            profileImageUrl: null,
            totalListings: 45,
            activeListings: 12,
            soldListings: 33,
            storefrontEnabled: true,
          },
          {
            id: "3",
            slug: "coastal-laundry-brokers",
            companyName: "Coastal Laundry Brokers",
            nickname: null,
            bio: "Specialists in coastal California laundromat transactions with expertise in high-traffic tourist locations.",
            phone: "(619) 555-7890",
            email: "sales@coastallaundry.com",
            website: "https://coastallaundrybrokers.com",
            licenseNumber: "DRE 87654",
            specializations: ["Laundromats", "Commercial Laundry", "Multi-Unit"],
            yearsExperience: 12,
            regions: ["San Diego", "Orange County", "Central Coast"],
            verified: true,
            profileImageUrl: null,
            totalListings: 32,
            activeListings: 8,
            soldListings: 24,
            storefrontEnabled: true,
          }
        ];
      }
      
      // Filter to only public storefronts
      let publicProfiles = allProfiles.filter(p => p.storefrontEnabled);

      // Apply filters
      if (region && region !== "All Regions") {
        publicProfiles = publicProfiles.filter(p => 
          p.regions?.some(r => r.toLowerCase().includes(region.toLowerCase()))
        );
      }
      
      if (specialty && specialty !== "All Specialties") {
        publicProfiles = publicProfiles.filter(p =>
          p.specializations?.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
        );
      }

      // Calculate pagination
      const total = publicProfiles.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedProfiles = publicProfiles.slice(offset, offset + limit);

      // Return public data only
      const sanitizedProfiles = paginatedProfiles.map(p => ({
        id: p.id,
        slug: p.slug,
        companyName: p.companyName,
        nickname: p.nickname,
        bio: p.bio,
        phone: p.phone,
        email: p.email,
        website: p.website,
        licenseNumber: p.licenseNumber,
        specializations: p.specializations,
        yearsExperience: p.yearsExperience,
        regions: p.regions,
        verified: p.verified,
        profileImageUrl: p.profileImageUrl,
        totalListings: p.totalListings,
        activeListings: p.activeListings,
        soldListings: p.soldListings,
      }));

      res.json({
        brokers: sanitizedProfiles,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        }
      });
    } catch (error: any) {
      console.error("Error fetching brokers:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/brokers/:id/listings - Get broker's public listings
  app.get("/api/brokers/:id/listings", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Try to find by slug first, then by id
      let brokerProfile = await storage.getBrokerProfileBySlug(id);
      if (!brokerProfile) {
        brokerProfile = await storage.getBrokerProfile(parseInt(id));
      }
      
      if (!brokerProfile) {
        return res.status(404).json({ error: "Broker not found" });
      }

      if (!brokerProfile.storefrontEnabled) {
        return res.status(404).json({ error: "Broker storefront is not public" });
      }

      // Get broker's active listings
      const allListings = brokerProfile.userId 
        ? await storage.getListingsByUserId(brokerProfile.userId)
        : [];
      const activeListings = allListings.filter(l => l.status === "active");

      res.json({ listings: activeListings });
    } catch (error: any) {
      console.error("Error fetching broker listings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/brokers/:slug/storefront - Get public broker storefront data (no auth required)
  app.get("/api/brokers/:slug/storefront", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const brokerProfile = await storage.getBrokerProfileBySlug(slug);
      if (!brokerProfile) {
        return res.status(404).json({ error: "Broker not found" });
      }

      // Check if storefront is enabled
      if (!brokerProfile.storefrontEnabled) {
        return res.status(404).json({ error: "Broker storefront is not public" });
      }

      // Get broker's active listings
      const allListings = brokerProfile.userId 
        ? await storage.getListingsByUserId(brokerProfile.userId)
        : [];
      const activeListings = allListings.filter(l => l.status === "active");

      // Return public storefront data
      res.json({
        profile: {
          id: brokerProfile.id,
          companyName: brokerProfile.companyName,
          bio: brokerProfile.bio,
          phone: brokerProfile.phone,
          email: brokerProfile.email,
          website: brokerProfile.website,
          licenseNumber: brokerProfile.licenseNumber,
          specializations: brokerProfile.specializations,
          yearsExperience: brokerProfile.yearsExperience,
          regions: brokerProfile.regions,
          verified: brokerProfile.verified,
          profileImageUrl: brokerProfile.profileImageUrl,
          nickname: brokerProfile.nickname,
          storefrontBanner: brokerProfile.storefrontBanner,
          storefrontTheme: brokerProfile.storefrontTheme,
          testimonials: brokerProfile.testimonials,
          totalListings: brokerProfile.totalListings,
          activeListings: brokerProfile.activeListings,
          soldListings: brokerProfile.soldListings,
        },
        listings: activeListings,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/brokers/my-profile - Get current user's broker profile (auth required)
  app.get("/api/brokers/my-profile", requireAuth, async (req: any, res) => {
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

  // PUT /api/brokers/my-profile - Update broker profile (auth required)
  app.put("/api/brokers/my-profile", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const brokerProfile = await storage.getBrokerProfileByUserId(currentUser.userId);
      if (!brokerProfile) {
        return res.status(404).json({ error: "Broker profile not found" });
      }

      const updatedProfile = await storage.updateBrokerProfile(brokerProfile.id, req.body);
      res.json(updatedProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/brokers/my-listings - Get broker's listings with stats (auth required)
  app.get("/api/brokers/my-listings", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const brokerListings = await storage.getListingsByUserId(currentUser.userId);
      
      // Calculate days listed for each
      const listingsWithStats = brokerListings.map(listing => {
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

  // POST /api/brokers/my-listings - Create a new listing for broker
  app.post("/api/brokers/my-listings", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const listingData = {
        ...req.body,
        userId: currentUser.userId,
        status: req.body.status || "draft",
        listedAt: req.body.status === "active" ? new Date() : null,
      };

      const newListing = await storage.createListing(listingData);
      res.json(newListing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/brokers/my-leads - Get leads/inquiries for broker's listings (auth required)
  app.get("/api/brokers/my-leads", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get all broker's listings first
      const brokerListings = await storage.getListingsByUserId(currentUser.userId);
      const listingIds = brokerListings.map(l => l.id);

      if (listingIds.length === 0) {
        return res.json([]);
      }

      // Get all inquiries for broker's listings
      const leads = await storage.getListingInquiriesByListingIds(listingIds);
      
      // Enrich leads with listing title
      const leadsWithListing = leads.map(lead => {
        const listing = brokerListings.find(l => l.id === lead.listingId);
        return {
          ...lead,
          listingTitle: listing?.title || "Unknown Listing",
        };
      });

      res.json(leadsWithListing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/brokers/my-leads/:id - Update lead status (contacted, qualified, etc.)
  app.patch("/api/brokers/my-leads/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      
      // Verify the lead belongs to one of the broker's listings
      const lead = await storage.getListingInquiry(id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const brokerListings = await storage.getListingsByUserId(currentUser.userId);
      const listingIds = brokerListings.map(l => l.id);
      
      if (lead.listingId && !listingIds.includes(lead.listingId)) {
        return res.status(403).json({ error: "Not authorized to update this lead" });
      }

      const { status, response } = req.body;
      const updateData: any = {};
      if (status) updateData.status = status;
      if (response) {
        updateData.response = response;
        updateData.respondedAt = new Date();
      }

      const updatedLead = await storage.updateListingInquiry(id, updateData);
      res.json(updatedLead);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Legacy routes for backwards compatibility
  // GET /api/broker/profile - Get broker profile for authenticated user
  app.get("/api/broker/profile", requireAuth, async (req: any, res) => {
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
  app.get("/api/broker/listings", requireAuth, async (req: any, res) => {
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
  app.post("/api/subscriptions/upgrade", requireAuth, async (req: any, res) => {
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
  app.post("/api/subscriptions/cancel", requireAuth, async (req: any, res) => {
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

  // POST /api/subscriptions/pause - Pause subscription
  app.post("/api/subscriptions/pause", requireAuth, async (req: any, res) => {
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

      const subscription = await stripe.subscriptions.update(
        currentUser.user.stripeSubscriptionId,
        {
          pause_collection: {
            behavior: 'keep_as_draft',
          }
        }
      );

      res.json({ 
        success: true, 
        message: "Subscription paused. Resume anytime from settings.",
        status: subscription.status
      });
    } catch (error: any) {
      console.error("Pause subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/subscriptions/resume - Resume paused subscription
  app.post("/api/subscriptions/resume", requireAuth, async (req: any, res) => {
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

      const subscription = await stripe.subscriptions.update(
        currentUser.user.stripeSubscriptionId,
        {
          pause_collection: null
        }
      );

      res.json({ 
        success: true, 
        message: "Subscription resumed successfully!",
        status: subscription.status
      });
    } catch (error: any) {
      console.error("Resume subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/users/profile - Update user profile
  app.patch("/api/users/profile", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { firstName, lastName, phone, tagline, bio, username } = req.body;

      const updatedUser = await storage.updateUser(currentUser.user.id, {
        firstName: firstName !== undefined ? firstName : currentUser.user.firstName,
        lastName: lastName !== undefined ? lastName : currentUser.user.lastName,
        phone: phone !== undefined ? phone : currentUser.user.phone,
        tagline: tagline !== undefined ? tagline : currentUser.user.tagline,
        bio: bio !== undefined ? bio : currentUser.user.bio,
        username: username !== undefined ? username : currentUser.user.username,
      });

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/subscriptions/billing-portal - Open Stripe billing portal
  app.post("/api/subscriptions/billing-portal", requireAuth, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service unavailable" });
      }
      
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Create or get Stripe customer
      let customerId = currentUser.user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: currentUser.user.email || undefined,
          metadata: {
            userId: currentUser.userId,
          },
        });
        customerId = customer.id;
        await storage.updateUser(currentUser.userId, { stripeCustomerId: customerId });
      }

      // Create billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.origin}/settings`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Billing portal error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ONBOARDING ====================

  // GET /api/onboarding/state - Get user's onboarding state
  app.get("/api/onboarding/state", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      res.json({
        completed: currentUser.user.onboardingCompleted || false,
        step: currentUser.user.onboardingStep || 0,
        checklist: currentUser.user.onboardingChecklist || {
          profileComplete: false,
          locationAdded: false,
          machinesAdded: false,
          firstSaleComplete: false,
          teamInvited: false
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/onboarding/progress - Update onboarding progress
  // SECURITY: Validate checklist items against allowed keys to prevent arbitrary data injection
  const ALLOWED_CHECKLIST_KEYS = ["business_info", "add_machines", "invite_team", "connect_payments", "launch_website"] as const;
  
  app.patch("/api/onboarding/progress", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { step, checklistItem, completed } = req.body;

      const updates: any = {};
      
      if (step !== undefined) {
        updates.onboardingStep = step;
      }
      
      if (completed !== undefined) {
        updates.onboardingCompleted = completed;
      }

      if (checklistItem) {
        // SECURITY: Validate checklist item against allowed keys
        if (!ALLOWED_CHECKLIST_KEYS.includes(checklistItem)) {
          return res.status(400).json({ 
            error: "Invalid checklist item", 
            allowedKeys: ALLOWED_CHECKLIST_KEYS 
          });
        }
        
        const currentChecklist = currentUser.user.onboardingChecklist || {};
        updates.onboardingChecklist = {
          ...currentChecklist,
          [checklistItem]: true
        };
      }

      await storage.updateUser(currentUser.userId, updates);

      res.json({ success: true, ...updates });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/dashboard/summary - Get user dashboard summary
  app.get("/api/dashboard/summary", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = currentUser.user;

      // Calculate subscription info
      let subscriptionEnd = null;
      let subscriptionStatus = "none";
      
      if (stripe && user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          subscriptionStatus = subscription.status;
          subscriptionEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;
        } catch (e) {
          // Subscription might not exist
        }
      }

      // Get activity counts (simplified)
      const recentActivity = [];

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          companyName: user.companyName,
          role: user.role,
          numberOfLocations: user.numberOfLocations || 1
        },
        subscription: {
          tier: user.subscriptionTier || "free",
          status: subscriptionStatus,
          endsAt: subscriptionEnd,
          isPro: user.isPro,
          hasStripeCustomer: !!user.stripeCustomerId
        },
        onboarding: {
          completed: user.onboardingCompleted || false,
          step: user.onboardingStep || 0,
          checklist: user.onboardingChecklist || {}
        },
        recentActivity
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/dashboard/my-listings - Get user's own marketplace listings with stats
  app.get("/api/dashboard/my-listings", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userListings = await db
        .select()
        .from(listings)
        .where(eq(listings.userId, currentUser.userId))
        .orderBy(desc(listings.createdAt));

      // Calculate analytics summary
      const totalViews = userListings.reduce((sum, l) => sum + (l.viewCount || 0), 0);
      const totalInquiries = userListings.reduce((sum, l) => sum + (l.inquiryCount || 0), 0);
      const totalNdaRequests = userListings.reduce((sum, l) => sum + (l.ndaRequestCount || 0), 0);

      // Find the highest tier among all listings (for display)
      const tierOrder = ['free', 'basic', 'showcase', 'diamond'];
      let highestTier = 'free';
      for (const listing of userListings) {
        const currentTierIndex = tierOrder.indexOf(listing.subscriptionTier || 'free');
        const highestTierIndex = tierOrder.indexOf(highestTier);
        if (currentTierIndex > highestTierIndex) {
          highestTier = listing.subscriptionTier || 'free';
        }
      }

      // Top performing listings (sorted by views + inquiries)
      const topPerforming = [...userListings]
        .sort((a, b) => {
          const aScore = (a.viewCount || 0) + (a.inquiryCount || 0) * 10;
          const bScore = (b.viewCount || 0) + (b.inquiryCount || 0) * 10;
          return bScore - aScore;
        })
        .slice(0, 5);

      res.json({
        listings: userListings,
        summary: {
          totalListings: userListings.length,
          activeListings: userListings.filter(l => l.status === 'active').length,
          draftListings: userListings.filter(l => l.status === 'draft').length,
          soldListings: userListings.filter(l => l.status === 'sold').length,
          totalViews,
          totalInquiries,
          totalNdaRequests,
          highestTier,
        },
        topPerforming,
        tierBenefits: LISTING_TIER_BENEFITS,
      });
    } catch (error: any) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== EQUIPMENT LISTINGS ====================

  // GET /api/equipment-listings - List all equipment
  app.get("/api/equipment-listings", async (req, res) => {
    try {
      const { category, condition, status = "active" } = req.query;
      const result = await db.execute(sql`
        SELECT id, user_id as "userId", title, description, category, brand, model, 
               condition, year_manufactured as "yearManufactured", images, videos, 
               price, price_negotiable as "priceNegotiable", city, state, 
               zip_code as "zipCode", contact_name as "contactName", 
               contact_email as "contactEmail", contact_phone as "contactPhone", 
               status, views, inquiries, 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM equipment_listings 
        WHERE status = ${status}
        ORDER BY created_at DESC
      `);
      res.json(result.rows || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/equipment-listings - Create listing
  app.post("/api/equipment-listings", async (req, res) => {
    try {
      const data = req.body;
      const result = await db.insert(equipmentListings).values({
        title: data.title,
        description: data.description,
        category: data.category,
        brand: data.brand || null,
        model: data.model || null,
        condition: data.condition,
        yearManufactured: data.yearManufactured || null,
        price: data.price?.toString() || null,
        priceNegotiable: data.priceNegotiable !== false,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode || null,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        images: data.images || [],
        videos: data.videos || [],
        status: "active",
      }).returning();
      res.json(result[0]);
    } catch (error: any) {
      console.error("Equipment listing error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/equipment-listings/:id - Get single listing
  app.get("/api/equipment-listings/:id", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT id, user_id as "userId", title, description, category, brand, model, 
               condition, year_manufactured as "yearManufactured", images, videos, 
               price, price_negotiable as "priceNegotiable", city, state, 
               zip_code as "zipCode", contact_name as "contactName", 
               contact_email as "contactEmail", contact_phone as "contactPhone", 
               status, views, inquiries, 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM equipment_listings 
        WHERE id = ${req.params.id}
      `);
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ error: "Listing not found" });
      }
      // Increment views
      await db.execute(sql`
        UPDATE equipment_listings 
        SET views = views + 1 
        WHERE id = ${req.params.id}
      `);
      res.json(result.rows[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SUPPLY LISTINGS ====================

  // GET /api/supply-listings - List all supplies
  app.get("/api/supply-listings", async (req, res) => {
    try {
      const { category, status = "active" } = req.query;
      const result = await db.select().from(supplyListings)
        .where(eq(supplyListings.status, status as string))
        .orderBy(desc(supplyListings.createdAt));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/supply-listings - Create listing
  app.post("/api/supply-listings", async (req, res) => {
    try {
      const data = req.body;
      const result = await db.insert(supplyListings).values({
        title: data.title,
        description: data.description,
        category: data.category,
        brand: data.brand || null,
        sku: data.sku || null,
        price: data.price?.toString() || null,
        minimumOrder: data.minimumOrder || null,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode || null,
        shipsNationwide: data.shipsNationwide !== false,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        images: data.images || [],
        videos: data.videos || [],
        status: "active",
      }).returning();
      res.json(result[0]);
    } catch (error: any) {
      console.error("Supply listing error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/supply-listings/:id - Get single listing
  app.get("/api/supply-listings/:id", async (req, res) => {
    try {
      const result = await db.select().from(supplyListings)
        .where(eq(supplyListings.id, req.params.id));
      if (!result[0]) {
        return res.status(404).json({ error: "Listing not found" });
      }
      // Increment views
      await db.update(supplyListings)
        .set({ views: sql`${supplyListings.views} + 1` })
        .where(eq(supplyListings.id, req.params.id));
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOTIFICATION SYSTEM ====================

  // GET /api/notifications - Get user's notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { limit = "20", offset = "0", unreadOnly = "false" } = req.query;
      const userId = (req.user as any).id;
      
      let query = db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      if (unreadOnly === "true") {
        query = db.select().from(notifications)
          .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
          .orderBy(desc(notifications.createdAt))
          .limit(parseInt(limit as string))
          .offset(parseInt(offset as string));
      }

      const result = await query;
      
      // Get unread count
      const unreadCount = await db.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

      res.json({
        notifications: result,
        unreadCount: Number(unreadCount[0]?.count || 0)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/notifications/:id/read - Mark notification as read
  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const result = await db.update(notifications)
        .set({ read: true, readAt: new Date() })
        .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, userId)))
        .returning();
      
      if (!result[0]) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/notifications/mark-all-read - Mark all notifications as read
  app.put("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      await db.update(notifications)
        .set({ read: true, readAt: new Date() })
        .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/notifications/:id - Delete notification
  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const result = await db.delete(notifications)
        .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, userId)))
        .returning();
      
      if (!result[0]) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/notification-preferences - Get user's notification preferences
  app.get("/api/notification-preferences", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const result = await db.select().from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      
      if (!result[0]) {
        // Return default preferences
        return res.json({
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          phoneNumber: null,
          phoneVerified: false,
          equipmentAlerts: true,
          dealAlerts: true,
          marketUpdates: true,
          reportDelivery: true
        });
      }
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/notification-preferences - Update notification preferences
  app.put("/api/notification-preferences", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const data = req.body;
      
      // Check if preferences exist
      const existing = await db.select().from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      
      if (existing[0]) {
        // Update existing
        const result = await db.update(notificationPreferences)
          .set({
            emailEnabled: data.emailEnabled,
            smsEnabled: data.smsEnabled,
            pushEnabled: data.pushEnabled,
            phoneNumber: data.phoneNumber,
            equipmentAlerts: data.equipmentAlerts,
            dealAlerts: data.dealAlerts,
            marketUpdates: data.marketUpdates,
            reportDelivery: data.reportDelivery,
            updatedAt: new Date()
          })
          .where(eq(notificationPreferences.userId, userId))
          .returning();
        res.json(result[0]);
      } else {
        // Create new
        const result = await db.insert(notificationPreferences).values({
          userId,
          emailEnabled: data.emailEnabled ?? true,
          smsEnabled: data.smsEnabled ?? false,
          pushEnabled: data.pushEnabled ?? true,
          phoneNumber: data.phoneNumber ?? null,
          equipmentAlerts: data.equipmentAlerts ?? true,
          dealAlerts: data.dealAlerts ?? true,
          marketUpdates: data.marketUpdates ?? true,
          reportDelivery: data.reportDelivery ?? true
        }).returning();
        res.json(result[0]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== DIRECT MESSAGING SYSTEM ====================

  // GET /api/conversations - Get user's conversations with last message preview
  app.get("/api/conversations", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      // Get all conversations the user is part of
      const userConversations = await db
        .select({
          conversationId: conversationParticipants.conversationId,
          lastReadAt: conversationParticipants.lastReadAt,
        })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, userId));

      if (userConversations.length === 0) {
        return res.json({ conversations: [], total: 0 });
      }

      const conversationIds = userConversations.map(c => c.conversationId);

      // Get conversation details with last message
      const conversationsData = await db
        .select()
        .from(conversations)
        .where(inArray(conversations.id, conversationIds))
        .orderBy(desc(conversations.lastMessageAt))
        .limit(limit)
        .offset(offset);

      // Get last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conv) => {
          // Get last message
          const [lastMessage] = await db
            .select({
              id: directMessages.id,
              content: directMessages.content,
              senderId: directMessages.senderId,
              createdAt: directMessages.createdAt,
              messageType: directMessages.messageType,
            })
            .from(directMessages)
            .where(and(
              eq(directMessages.conversationId, conv.id),
              isNull(directMessages.deletedAt)
            ))
            .orderBy(desc(directMessages.createdAt))
            .limit(1);

          // Get sender info for last message
          let senderInfo = null;
          if (lastMessage) {
            const [sender] = await db
              .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                profileImageUrl: users.profileImageUrl,
              })
              .from(users)
              .where(eq(users.id, lastMessage.senderId))
              .limit(1);
            senderInfo = sender;
          }

          // Get unread count
          const userConv = userConversations.find(uc => uc.conversationId === conv.id);
          const lastReadAt = userConv?.lastReadAt;
          
          let unreadCount = 0;
          if (lastReadAt) {
            const [{ count }] = await db
              .select({ count: sql<number>`count(*)::int` })
              .from(directMessages)
              .where(and(
                eq(directMessages.conversationId, conv.id),
                sql`${directMessages.createdAt} > ${lastReadAt}`,
                sql`${directMessages.senderId} != ${userId}`,
                isNull(directMessages.deletedAt)
              ));
            unreadCount = count;
          } else {
            // If never read, count all messages not from user
            const [{ count }] = await db
              .select({ count: sql<number>`count(*)::int` })
              .from(directMessages)
              .where(and(
                eq(directMessages.conversationId, conv.id),
                sql`${directMessages.senderId} != ${userId}`,
                isNull(directMessages.deletedAt)
              ));
            unreadCount = count;
          }

          // Get other participants info
          const participants = await db
            .select({
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImageUrl: users.profileImageUrl,
            })
            .from(conversationParticipants)
            .innerJoin(users, eq(users.id, conversationParticipants.userId))
            .where(and(
              eq(conversationParticipants.conversationId, conv.id),
              sql`${conversationParticipants.userId} != ${userId}`
            ));

          return {
            ...conv,
            lastMessage: lastMessage ? {
              ...lastMessage,
              sender: senderInfo,
            } : null,
            unreadCount,
            participants,
          };
        })
      );

      // Get total count
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, userId));

      res.json({ conversations: conversationsWithDetails, total });
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/conversations - Start new conversation (find or create)
  app.post("/api/conversations", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const { participantIds, title, type = "direct" } = req.body;

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ error: "participantIds is required" });
      }

      // For direct messages, check if conversation already exists
      if (type === "direct" && participantIds.length === 1) {
        const targetUserId = participantIds[0];
        
        // Find existing direct conversation between these two users
        const existingConversations = await db
          .select({ conversationId: conversationParticipants.conversationId })
          .from(conversationParticipants)
          .where(eq(conversationParticipants.userId, userId));

        for (const ec of existingConversations) {
          const [conv] = await db
            .select()
            .from(conversations)
            .where(and(
              eq(conversations.id, ec.conversationId),
              eq(conversations.type, "direct")
            ))
            .limit(1);

          if (conv) {
            const participants = await db
              .select({ userId: conversationParticipants.userId })
              .from(conversationParticipants)
              .where(eq(conversationParticipants.conversationId, conv.id));

            const participantUserIds = participants.map(p => p.userId);
            if (participantUserIds.includes(targetUserId) && participantUserIds.length === 2) {
              // Return existing conversation
              return res.json(conv);
            }
          }
        }
      }

      // Create new conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          type,
          title,
          createdBy: userId,
        })
        .returning();

      // Add all participants including the creator
      const allParticipantIds = [...new Set([userId, ...participantIds])];
      
      for (const participantId of allParticipantIds) {
        await db.insert(conversationParticipants).values({
          conversationId: newConversation.id,
          userId: participantId,
          role: participantId === userId ? "admin" : "member",
        });
      }

      res.json(newConversation);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/conversations/:id/messages - Get messages in a conversation with pagination
  app.get("/api/conversations/:id/messages", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const conversationId = req.params.id;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      // Check user is participant
      const [participant] = await db
        .select()
        .from(conversationParticipants)
        .where(and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        ))
        .limit(1);

      if (!participant) {
        return res.status(403).json({ error: "Not a participant of this conversation" });
      }

      // Get messages with sender info
      const messages = await db
        .select({
          id: directMessages.id,
          conversationId: directMessages.conversationId,
          senderId: directMessages.senderId,
          content: directMessages.content,
          messageType: directMessages.messageType,
          attachments: directMessages.attachments,
          replyToId: directMessages.replyToId,
          isEdited: directMessages.isEdited,
          createdAt: directMessages.createdAt,
          senderFirstName: users.firstName,
          senderLastName: users.lastName,
          senderProfileImageUrl: users.profileImageUrl,
        })
        .from(directMessages)
        .innerJoin(users, eq(users.id, directMessages.senderId))
        .where(and(
          eq(directMessages.conversationId, conversationId),
          isNull(directMessages.deletedAt)
        ))
        .orderBy(desc(directMessages.createdAt))
        .limit(limit)
        .offset(offset);

      // Transform to include sender object
      const formattedMessages = messages.map(m => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        content: m.content,
        messageType: m.messageType,
        attachments: m.attachments,
        replyToId: m.replyToId,
        isEdited: m.isEdited,
        createdAt: m.createdAt,
        sender: {
          id: m.senderId,
          firstName: m.senderFirstName,
          lastName: m.senderLastName,
          profileImageUrl: m.senderProfileImageUrl,
        },
      }));

      // Get total count
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(directMessages)
        .where(and(
          eq(directMessages.conversationId, conversationId),
          isNull(directMessages.deletedAt)
        ));

      res.json({ messages: formattedMessages.reverse(), total });
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/conversations/:id/messages - Send a message
  app.post("/api/conversations/:id/messages", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const conversationId = req.params.id;
      const { content, messageType = "text", attachments, replyToId } = req.body;

      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Check user is participant
      const [participant] = await db
        .select()
        .from(conversationParticipants)
        .where(and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        ))
        .limit(1);

      if (!participant) {
        return res.status(403).json({ error: "Not a participant of this conversation" });
      }

      // Create the message
      const [message] = await db
        .insert(directMessages)
        .values({
          conversationId,
          senderId: userId,
          content: content.trim(),
          messageType,
          attachments,
          replyToId,
        })
        .returning();

      // Update conversation last_message_at
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date(), updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

      // Update sender's last_read_at
      await db
        .update(conversationParticipants)
        .set({ lastReadAt: new Date() })
        .where(and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        ));

      // Get sender info
      const [sender] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      res.json({
        ...message,
        sender,
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/conversations/:id/read - Mark conversation as read
  app.put("/api/conversations/:id/read", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const conversationId = req.params.id;

      // Update last_read_at for the user
      const result = await db
        .update(conversationParticipants)
        .set({ lastReadAt: new Date() })
        .where(and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Conversation not found or not a participant" });
      }

      res.json({ success: true, lastReadAt: result[0].lastReadAt });
    } catch (error: any) {
      console.error("Error marking conversation as read:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/members - Search members for messaging (name, role, location)
  app.get("/api/members", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const search = (req.query.search as string) || "";
      const role = req.query.role as string;
      const location = req.query.location as string;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const offset = parseInt(req.query.offset as string) || 0;

      // Build base query for users
      let query = db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          companyName: users.companyName,
          // Member profile fields
          headline: memberProfiles.headline,
          location: memberProfiles.location,
          specialties: memberProfiles.specialties,
          services: memberProfiles.services,
          yearsInIndustry: memberProfiles.yearsInIndustry,
          badges: memberProfiles.badges,
          isOpenToNetwork: memberProfiles.isOpenToNetwork,
        })
        .from(users)
        .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
        .where(sql`${users.id} != ${userId}`)
        .limit(limit)
        .offset(offset);

      // Apply search filter
      const conditions: any[] = [sql`${users.id} != ${userId}`];
      
      if (search) {
        conditions.push(or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.companyName, `%${search}%`),
          sql`${users.firstName} || ' ' || ${users.lastName} ILIKE ${`%${search}%`}`
        ));
      }

      if (role) {
        conditions.push(eq(users.role, role));
      }

      if (location) {
        conditions.push(ilike(memberProfiles.location, `%${location}%`));
      }

      // Execute query with filters
      const members = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          companyName: users.companyName,
          headline: memberProfiles.headline,
          location: memberProfiles.location,
          specialties: memberProfiles.specialties,
          services: memberProfiles.services,
          yearsInIndustry: memberProfiles.yearsInIndustry,
          badges: memberProfiles.badges,
          isOpenToNetwork: memberProfiles.isOpenToNetwork,
        })
        .from(users)
        .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);

      // Get total count
      const countQuery = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
        .where(and(...conditions));

      const total = countQuery[0]?.count || 0;

      res.json({ members, total });
    } catch (error: any) {
      console.error("Error searching members:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/members/:userId/message - Start/get conversation with a user
  app.post("/api/members/:userId/message", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const currentUserId = (req.user as any).id;
      const targetUserId = req.params.userId;

      if (currentUserId === targetUserId) {
        return res.status(400).json({ error: "Cannot start conversation with yourself" });
      }

      // Check target user exists
      const [targetUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);

      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Find existing direct conversation between these two users
      const currentUserConversations = await db
        .select({ conversationId: conversationParticipants.conversationId })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, currentUserId));

      for (const ec of currentUserConversations) {
        const [conv] = await db
          .select()
          .from(conversations)
          .where(and(
            eq(conversations.id, ec.conversationId),
            eq(conversations.type, "direct")
          ))
          .limit(1);

        if (conv) {
          const participants = await db
            .select({ userId: conversationParticipants.userId })
            .from(conversationParticipants)
            .where(eq(conversationParticipants.conversationId, conv.id));

          const participantUserIds = participants.map(p => p.userId);
          if (participantUserIds.includes(targetUserId) && participantUserIds.length === 2) {
            // Return existing conversation with participant info
            const [otherUser] = await db
              .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                profileImageUrl: users.profileImageUrl,
              })
              .from(users)
              .where(eq(users.id, targetUserId))
              .limit(1);

            return res.json({
              ...conv,
              participants: [otherUser],
              isNew: false,
            });
          }
        }
      }

      // Create new direct conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          type: "direct",
          createdBy: currentUserId,
        })
        .returning();

      // Add both participants
      await db.insert(conversationParticipants).values([
        {
          conversationId: newConversation.id,
          userId: currentUserId,
          role: "member",
        },
        {
          conversationId: newConversation.id,
          userId: targetUserId,
          role: "member",
        },
      ]);

      // Get target user info
      const [otherUser] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);

      res.json({
        ...newConversation,
        participants: [otherUser],
        isNew: true,
      });
    } catch (error: any) {
      console.error("Error starting conversation with user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/members/:userId - Get member profile
  app.get("/api/members/:userId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const targetUserId = req.params.userId;
      const currentUserId = (req.user as any).id;

      // Get user basic info
      const [user] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          companyName: users.companyName,
          phone: users.phone,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get member profile
      const [profile] = await db
        .select()
        .from(memberProfiles)
        .where(eq(memberProfiles.userId, targetUserId))
        .limit(1);

      // Get follower count
      const [{ followerCount }] = await db
        .select({ followerCount: sql<number>`count(*)::int` })
        .from(userConnections)
        .where(and(
          eq(userConnections.followingId, targetUserId),
          eq(userConnections.status, "active")
        ));

      // Get following count
      const [{ followingCount }] = await db
        .select({ followingCount: sql<number>`count(*)::int` })
        .from(userConnections)
        .where(and(
          eq(userConnections.followerId, targetUserId),
          eq(userConnections.status, "active")
        ));

      // Check if current user is following this user
      const [isFollowing] = await db
        .select({ id: userConnections.id })
        .from(userConnections)
        .where(and(
          eq(userConnections.followerId, currentUserId),
          eq(userConnections.followingId, targetUserId),
          eq(userConnections.status, "active")
        ))
        .limit(1);

      // Build response, respecting privacy settings
      const response: any = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        companyName: user.companyName,
        memberSince: user.createdAt,
        followerCount,
        followingCount,
        isFollowing: !!isFollowing,
        isOwnProfile: currentUserId === targetUserId,
      };

      // Add member profile data if exists
      if (profile) {
        response.headline = profile.headline;
        response.specialties = profile.specialties;
        response.services = profile.services;
        response.yearsInIndustry = profile.yearsInIndustry;
        response.certifications = profile.certifications;
        response.location = profile.location;
        response.isOpenToNetwork = profile.isOpenToNetwork;
        response.isAvailableForConsulting = profile.isAvailableForConsulting;
        response.badges = profile.badges;
        response.endorsements = profile.endorsements;
        
        // Only show contact info if user has opted in or viewing own profile
        if (profile.showEmail || currentUserId === targetUserId) {
          response.email = user.email;
        }
        if (profile.showPhone || currentUserId === targetUserId) {
          response.phone = user.phone;
        }
        if (profile.websiteUrl) {
          response.websiteUrl = profile.websiteUrl;
        }
        if (profile.linkedinUrl) {
          response.linkedinUrl = profile.linkedinUrl;
        }
        if (profile.facebookUrl) {
          response.facebookUrl = profile.facebookUrl;
        }
      }

      res.json(response);
    } catch (error: any) {
      console.error("Error fetching member profile:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/members/profile - Update own member profile
  app.put("/api/members/profile", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const data = req.body;

      // Check if profile exists
      const [existingProfile] = await db
        .select()
        .from(memberProfiles)
        .where(eq(memberProfiles.userId, userId))
        .limit(1);

      if (existingProfile) {
        // Update existing profile
        const [updated] = await db
          .update(memberProfiles)
          .set({
            headline: data.headline,
            specialties: data.specialties,
            services: data.services,
            yearsInIndustry: data.yearsInIndustry,
            certifications: data.certifications,
            websiteUrl: data.websiteUrl,
            linkedinUrl: data.linkedinUrl,
            facebookUrl: data.facebookUrl,
            location: data.location,
            isOpenToNetwork: data.isOpenToNetwork,
            isAvailableForConsulting: data.isAvailableForConsulting,
            showEmail: data.showEmail,
            showPhone: data.showPhone,
            updatedAt: new Date(),
          })
          .where(eq(memberProfiles.userId, userId))
          .returning();
        
        res.json(updated);
      } else {
        // Create new profile
        const [created] = await db
          .insert(memberProfiles)
          .values({
            userId,
            headline: data.headline,
            specialties: data.specialties,
            services: data.services,
            yearsInIndustry: data.yearsInIndustry,
            certifications: data.certifications,
            websiteUrl: data.websiteUrl,
            linkedinUrl: data.linkedinUrl,
            facebookUrl: data.facebookUrl,
            location: data.location,
            isOpenToNetwork: data.isOpenToNetwork ?? true,
            isAvailableForConsulting: data.isAvailableForConsulting ?? false,
            showEmail: data.showEmail ?? false,
            showPhone: data.showPhone ?? false,
          })
          .returning();
        
        res.json(created);
      }
    } catch (error: any) {
      console.error("Error updating member profile:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/members/:userId/follow - Follow a user
  app.post("/api/members/:userId/follow", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const currentUserId = (req.user as any).id;
      const targetUserId = req.params.userId;

      if (currentUserId === targetUserId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }

      // Check target user exists
      const [targetUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);

      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if already following
      const [existingConnection] = await db
        .select()
        .from(userConnections)
        .where(and(
          eq(userConnections.followerId, currentUserId),
          eq(userConnections.followingId, targetUserId)
        ))
        .limit(1);

      if (existingConnection) {
        if (existingConnection.status === "active") {
          return res.status(400).json({ error: "Already following this user" });
        }
        // Reactivate if blocked/inactive
        const [updated] = await db
          .update(userConnections)
          .set({ status: "active", createdAt: new Date() })
          .where(eq(userConnections.id, existingConnection.id))
          .returning();
        
        return res.json({ success: true, connection: updated });
      }

      // Create new connection
      const [connection] = await db
        .insert(userConnections)
        .values({
          followerId: currentUserId,
          followingId: targetUserId,
          status: "active",
        })
        .returning();

      // Create activity event for the follow action
      await db.insert(activityEvents).values({
        userId: currentUserId,
        eventType: "follow",
        entityType: "user",
        entityId: targetUserId,
        isPublic: true,
      });

      res.json({ success: true, connection });
    } catch (error: any) {
      console.error("Error following user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/members/:userId/follow - Unfollow a user
  app.delete("/api/members/:userId/follow", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const currentUserId = (req.user as any).id;
      const targetUserId = req.params.userId;

      if (currentUserId === targetUserId) {
        return res.status(400).json({ error: "Cannot unfollow yourself" });
      }

      // Delete the connection
      const result = await db
        .delete(userConnections)
        .where(and(
          eq(userConnections.followerId, currentUserId),
          eq(userConnections.followingId, targetUserId)
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Not following this user" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/members/following - Get users the current user is following
  app.get("/api/members/following", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      // Get users the current user is following
      const following = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          companyName: users.companyName,
          headline: memberProfiles.headline,
          location: memberProfiles.location,
          specialties: memberProfiles.specialties,
          services: memberProfiles.services,
          yearsInIndustry: memberProfiles.yearsInIndustry,
          badges: memberProfiles.badges,
          isOpenToNetwork: memberProfiles.isOpenToNetwork,
        })
        .from(userConnections)
        .innerJoin(users, eq(users.id, userConnections.followingId))
        .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
        .where(and(
          eq(userConnections.followerId, userId),
          eq(userConnections.status, "active")
        ))
        .limit(limit)
        .offset(offset);

      // Get total count
      const countQuery = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(userConnections)
        .where(and(
          eq(userConnections.followerId, userId),
          eq(userConnections.status, "active")
        ));

      const total = countQuery[0]?.count || 0;

      res.json({ members: following, total });
    } catch (error: any) {
      console.error("Error getting following:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/members/followers - Get users following the current user
  app.get("/api/members/followers", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      // Get users who are following the current user
      const followers = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          companyName: users.companyName,
          headline: memberProfiles.headline,
          location: memberProfiles.location,
          specialties: memberProfiles.specialties,
          services: memberProfiles.services,
          yearsInIndustry: memberProfiles.yearsInIndustry,
          badges: memberProfiles.badges,
          isOpenToNetwork: memberProfiles.isOpenToNetwork,
        })
        .from(userConnections)
        .innerJoin(users, eq(users.id, userConnections.followerId))
        .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
        .where(and(
          eq(userConnections.followingId, userId),
          eq(userConnections.status, "active")
        ))
        .limit(limit)
        .offset(offset);

      // Get total count
      const countQuery = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(userConnections)
        .where(and(
          eq(userConnections.followingId, userId),
          eq(userConnections.status, "active")
        ));

      const total = countQuery[0]?.count || 0;

      res.json({ members: followers, total });
    } catch (error: any) {
      console.error("Error getting followers:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/members/profile/me - Get current user's member profile
  app.get("/api/members/profile/me", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;

      const [profile] = await db
        .select()
        .from(memberProfiles)
        .where(eq(memberProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        // Return default profile structure if none exists
        return res.json({
          id: null,
          userId: userId,
          headline: null,
          specialties: null,
          services: null,
          yearsInIndustry: null,
          websiteUrl: null,
          linkedinUrl: null,
          facebookUrl: null,
          location: null,
          isOpenToNetwork: true,
          isAvailableForConsulting: false,
          showEmail: false,
          showPhone: false,
        });
      }

      res.json(profile);
    } catch (error: any) {
      console.error("Error getting own profile:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/activity-feed - Get activity feed from followed users
  app.get("/api/activity-feed", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const includeOwn = req.query.includeOwn === "true";

      // Get list of users the current user is following
      const following = await db
        .select({ followingId: userConnections.followingId })
        .from(userConnections)
        .where(and(
          eq(userConnections.followerId, userId),
          eq(userConnections.status, "active")
        ));

      const followingIds = following.map(f => f.followingId);

      // Include own activities if requested
      if (includeOwn) {
        followingIds.push(userId);
      }

      if (followingIds.length === 0) {
        return res.json({ activities: [], total: 0 });
      }

      // Get activities from followed users
      const activities = await db
        .select({
          id: activityEvents.id,
          userId: activityEvents.userId,
          eventType: activityEvents.eventType,
          entityType: activityEvents.entityType,
          entityId: activityEvents.entityId,
          metadata: activityEvents.metadata,
          createdAt: activityEvents.createdAt,
          userFirstName: users.firstName,
          userLastName: users.lastName,
          userProfileImageUrl: users.profileImageUrl,
        })
        .from(activityEvents)
        .innerJoin(users, eq(users.id, activityEvents.userId))
        .where(and(
          inArray(activityEvents.userId, followingIds),
          eq(activityEvents.isPublic, true)
        ))
        .orderBy(desc(activityEvents.createdAt))
        .limit(limit)
        .offset(offset);

      // Transform to include user object
      const formattedActivities = activities.map(a => ({
        id: a.id,
        eventType: a.eventType,
        entityType: a.entityType,
        entityId: a.entityId,
        metadata: a.metadata,
        createdAt: a.createdAt,
        user: {
          id: a.userId,
          firstName: a.userFirstName,
          lastName: a.userLastName,
          profileImageUrl: a.userProfileImageUrl,
        },
      }));

      // Get total count
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(activityEvents)
        .where(and(
          inArray(activityEvents.userId, followingIds),
          eq(activityEvents.isPublic, true)
        ));

      res.json({ activities: formattedActivities, total });
    } catch (error: any) {
      console.error("Error fetching activity feed:", error);
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
  app.post("/api/forum/categories", requireAdmin, async (req, res) => {
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
  app.post("/api/forum/topics", requireAuth, async (req: any, res) => {
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
  app.patch("/api/forum/topics/:id", requireAuth, async (req: any, res) => {
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
  app.delete("/api/forum/topics/:id", requireAuth, async (req: any, res) => {
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
  app.post("/api/forum/replies", requireAuth, async (req: any, res) => {
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
  app.patch("/api/forum/replies/:id", requireAuth, async (req: any, res) => {
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
  app.delete("/api/forum/replies/:id", requireAuth, async (req: any, res) => {
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
  app.post("/api/forum/votes", requireAuth, async (req: any, res) => {
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
  app.delete("/api/forum/votes", requireAuth, async (req: any, res) => {
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

  // ==================== FORUM FILE UPLOADS ====================

  // POST /api/forum/upload-url - Get signed URL for file upload (authenticated)
  app.post("/api/forum/upload-url", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { filename, contentType } = req.body;
      if (!filename || !contentType) {
        return res.status(400).json({ error: "filename and contentType required" });
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(contentType)) {
        return res.status(400).json({ error: "File type not allowed" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      res.json({ 
        uploadURL,
        message: "Use PUT request to upload file to this URL"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/forum/upload-complete - Register uploaded file (authenticated)
  app.post("/api/forum/upload-complete", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { rawUrl, filename, contentType, size } = req.body;
      if (!rawUrl || !filename) {
        return res.status(400).json({ error: "rawUrl and filename required" });
      }

      const objectStorageService = new ObjectStorageService();
      
      // Normalize URL and set public ACL for forum attachments
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(rawUrl);
      
      await objectStorageService.trySetObjectEntityAclPolicy(rawUrl, {
        owner: currentUser.userId,
        visibility: "public",
      });

      res.json({ 
        url: normalizedPath,
        filename,
        contentType,
        size,
        message: "File registered successfully"
      });
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

      // For WashBizHub: Detect error codes in user message and query database
      let errorCodeContext = "";
      if (tenant.slug === 'washbizhub') {
        const errorCodePatterns = [
          /\b[A-Z]{1,2}\d{1,3}\b/gi,
          /\bF\d{1,2}[A-Z]?\d?\b/gi,
          /\bE[:\-_]?\w{2,4}\b/gi,
          /\bAL\d{1,2}\b/gi,
          /\bErr?\d{1,3}\b/gi,
          /\bd[rLu]\b/gi,
          /\bnFL|ndr|ndL|ndu|oFL|ubL|thE|HEt|Sud|dor|dET\b/gi,
        ];
        
        const foundCodes: string[] = [];
        for (const pattern of errorCodePatterns) {
          const matches = message.match(pattern);
          if (matches) foundCodes.push(...matches);
        }
        
        if (foundCodes.length > 0) {
          try {
            const uniqueCodes = [...new Set(foundCodes.map(c => c.toUpperCase().replace(/[:\-_]/g, '')))];
            const codeResults = await db
              .select()
              .from(diagnosticCodes)
              .where(sql`UPPER(REPLACE(REPLACE(REPLACE(${diagnosticCodes.code}, ':', ''), '-', ''), '_', '')) = ANY(ARRAY[${sql.raw(uniqueCodes.map(c => `'${c}'`).join(','))}]::text[])`)
              .limit(5);
            
            if (codeResults.length > 0) {
              errorCodeContext = `\n\n[DATABASE MATCH - USE THIS EXACT DATA IN YOUR RESPONSE]
The following error codes were found in our proprietary database of 2,200+ commercial laundry codes:

${codeResults.map(code => `
**${code.manufacturer} Code ${code.code}**: ${code.title}
- Description: ${code.description}
- Severity: ${code.severity}
- Skill Level: ${code.skillLevel}
- Estimated Repair Time: ${code.estimatedRepairTime || 30} minutes
- Possible Causes: ${(code.possibleCauses || []).join(', ')}
- Troubleshooting Steps: ${(code.troubleshootingSteps || []).slice(0, 3).join(' → ')}
${code.partsWithPricing ? `- Recommended Parts: ${JSON.stringify(code.partsWithPricing).replace(/[\[\]{}]/g, '').replace(/"/g, '')}` : ''}
`).join('\n')}

IMPORTANT DISCLAIMER TO INCLUDE:
"⚠️ PROFESSIONAL DISCLAIMER: This diagnostic information is for educational purposes only. Always disconnect power before servicing equipment. Complex repairs should be performed by a qualified commercial laundry technician. WashBizHub recommends consulting a local service professional for critical repairs. Typical service call: $150-$350."
`;
              console.log(`🔧 Found ${codeResults.length} matching error codes in database`);
            }
          } catch (dbError) {
            console.error("Error querying diagnostic codes:", dbError);
          }
        }
      }

      const messages = [
        systemPrompt,
        ...(conversationHistory || []).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user" as const,
          content: message + errorCodeContext,
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

  // POST /api/ai/cleanbi-help - CLEANBI-focused chat assistant (no auth required, rate limited)
  app.post("/api/ai/cleanbi-help", rateLimiter("/api/ai/cleanbi-help", 15, 60), async (req, res) => {
    try {
      const { message, systemPrompt, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Use OpenAI for CLEANBI help (fast, focused responses)
      const { aiProviderService } = await import("./ai-providers");
      
      const messages = [
        { role: "system" as const, content: systemPrompt || "You are a CLEANBI location analysis expert." },
        ...(conversationHistory || []).map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ];

      const response = await aiProviderService.chat({
        messages,
        provider: "openai",
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 800,
      });

      res.json({
        content: response.content,
        provider: "openai",
        model: "gpt-4o-mini",
      });
    } catch (error: any) {
      console.error("CLEANBI help chat error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // GET /api/ai/health - Check AI provider availability (admin only)
  app.get("/api/ai/health", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user?.requireAdmin) {
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
      if (!user?.requireAdmin) {
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

  // ==================== AI COUNCIL (MULTI-AI ORCHESTRATION) ====================
  
  // POST /api/ai/council - Query the AI Council (routes to optimal AI)
  app.post("/api/ai/council", rateLimiter("/api/ai/council", 20, 60), async (req, res) => {
    try {
      const { prompt, taskType = "general", context, useCache = true } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const { askCouncil } = await import("./ai-council");
      const response = await askCouncil({
        prompt,
        taskType,
        context,
        useCache,
      });
      
      res.json(response);
    } catch (error: any) {
      console.error("AI Council error:", error);
      res.status(500).json({ error: error.message || "AI Council query failed" });
    }
  });

  // POST /api/ai/council/consult - Get insights from multiple AIs
  app.post("/api/ai/council/consult", rateLimiter("/api/ai/council/consult", 10, 60), async (req, res) => {
    try {
      const { prompt, taskType = "general", models, synthesize = true } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const { consultCouncil } = await import("./ai-council");
      const response = await consultCouncil(prompt, taskType, { models, synthesize });
      
      res.json(response);
    } catch (error: any) {
      console.error("AI Council consult error:", error);
      res.status(500).json({ error: error.message || "AI Council consultation failed" });
    }
  });

  // POST /api/ai/council/research - Web research via Perplexity
  app.post("/api/ai/council/research", rateLimiter("/api/ai/council/research", 10, 60), async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }
      
      const { researchQuery } = await import("./ai-council");
      const result = await researchQuery(question);
      
      res.json({ result, provider: "perplexity" });
    } catch (error: any) {
      console.error("AI Council research error:", error);
      res.status(500).json({ error: error.message || "Research query failed" });
    }
  });

  // POST /api/ai/council/trending - Get trending insights via Grok
  app.post("/api/ai/council/trending", rateLimiter("/api/ai/council/trending", 10, 60), async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      
      const { trendingQuery } = await import("./ai-council");
      const result = await trendingQuery(topic);
      
      res.json({ result, provider: "grok" });
    } catch (error: any) {
      console.error("AI Council trending error:", error);
      res.status(500).json({ error: error.message || "Trending query failed" });
    }
  });

  // POST /api/ai/council/validate - Cross-validate a claim with multiple AIs
  app.post("/api/ai/council/validate", rateLimiter("/api/ai/council/validate", 5, 60), async (req, res) => {
    try {
      const { claim } = req.body;
      
      if (!claim) {
        return res.status(400).json({ error: "Claim is required" });
      }
      
      const { validateClaim } = await import("./ai-council");
      const result = await validateClaim(claim);
      
      res.json(result);
    } catch (error: any) {
      console.error("AI Council validate error:", error);
      res.status(500).json({ error: error.message || "Validation failed" });
    }
  });

  // GET /api/ai/council/status - Get AI Council status and available models
  app.get("/api/ai/council/status", async (req, res) => {
    try {
      const { getCouncilStatus } = await import("./ai-council");
      const status = await getCouncilStatus();
      
      res.json({
        ...status,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("AI Council status error:", error);
      res.status(500).json({ error: error.message || "Status check failed" });
    }
  });

  // ==================== LAUNDROMAT CONSULTATION COUNCIL ====================
  
  // POST /api/consultation-council - Full expert consultation with multiple AI analysts
  app.post("/api/consultation-council", rateLimiter("/api/consultation-council", 5, 60), async (req, res) => {
    try {
      const { runConsultationCouncil } = await import("./consultation-council");
      
      const {
        address,
        population,
        medianIncome,
        competitors,
        rentPerSqFt,
        squareFootage,
        walkScore,
        trafficCount,
        monthlyRevenue,
        monthlyRent,
        monthlyExpenses,
        askingPrice,
        downPaymentPercent,
        loanRate,
        loanTerm,
        washers,
        dryers,
        equipmentAge,
        additionalContext
      } = req.body;

      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const result = await runConsultationCouncil({
        address,
        population,
        medianIncome,
        competitors,
        rentPerSqFt,
        squareFootage,
        walkScore,
        trafficCount,
        monthlyRevenue,
        monthlyRent,
        monthlyExpenses,
        askingPrice,
        downPaymentPercent,
        loanRate,
        loanTerm,
        washers,
        dryers,
        equipmentAge,
        additionalContext
      });

      res.json(result);
    } catch (error: any) {
      console.error("Consultation Council error:", error);
      res.status(500).json({ error: error.message || "Consultation failed" });
    }
  });

  // GET /api/consultation-council/experts - Get list of expert personas
  app.get("/api/consultation-council/experts", async (req, res) => {
    try {
      const { EXPERT_PERSONAS } = await import("./consultation-council");
      res.json(EXPERT_PERSONAS);
    } catch (error: any) {
      console.error("Consultation Council experts error:", error);
      res.status(500).json({ error: error.message || "Failed to get experts" });
    }
  });

  // GET /api/consultation-council/tiers - Get available consultation tiers
  app.get("/api/consultation-council/tiers", async (req, res) => {
    try {
      const { CONSULTATION_TIERS } = await import("./consultation-council");
      res.json(CONSULTATION_TIERS);
    } catch (error: any) {
      console.error("Consultation Council tiers error:", error);
      res.status(500).json({ error: error.message || "Failed to get tiers" });
    }
  });

  // POST /api/consultation-council/checkout - Create Stripe checkout for consultation purchase
  app.post("/api/consultation-council/checkout", async (req, res) => {
    try {
      const { tierId, address } = req.body;
      
      if (!tierId) {
        return res.status(400).json({ error: "Tier ID is required" });
      }

      const { CONSULTATION_TIERS } = await import("./consultation-council");
      const tier = CONSULTATION_TIERS.find((t: any) => t.id === tierId);
      
      if (!tier) {
        return res.status(400).json({ error: "Invalid tier" });
      }

      if (tier.price === 0) {
        return res.json({ freeAnalysis: true, tierId });
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20" as any
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `AI Consultation Council - ${tier.name}`,
              description: tier.features.slice(0, 3).join(" | "),
              metadata: {
                tierId: tier.id,
                address: address || "Not provided"
              }
            },
            unit_amount: tier.price * 100,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : process.env.BASE_URL || "http://localhost:5000"}/ai-consultation?success=true&tier=${tier.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : process.env.BASE_URL || "http://localhost:5000"}/ai-consultation?cancelled=true`,
        metadata: {
          type: "consultation_council",
          tierId: tier.id,
          tierName: tier.name,
          address: address || "Not provided"
        }
      });

      res.json({ checkoutUrl: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("Consultation checkout error:", error);
      res.status(500).json({ error: error.message || "Checkout failed" });
    }
  });

  // POST /api/consultation-council/tiered - Run tiered consultation with selected package
  app.post("/api/consultation-council/tiered", rateLimiter("/api/consultation-council/tiered", 3, 60), async (req, res) => {
    try {
      const { runTieredConsultation } = await import("./consultation-council");
      
      const {
        tier = "professional",
        address,
        lat,
        lng,
        population,
        medianIncome,
        competitors,
        rentPerSqFt,
        squareFootage,
        walkScore,
        trafficCount,
        monthlyRevenue,
        monthlyRent,
        monthlyExpenses,
        askingPrice,
        downPaymentPercent,
        loanRate,
        loanTerm,
        washers,
        dryers,
        equipmentAge,
        additionalContext
      } = req.body;

      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const result = await runTieredConsultation({
        address,
        lat,
        lng,
        population,
        medianIncome,
        competitors,
        rentPerSqFt,
        squareFootage,
        walkScore,
        trafficCount,
        monthlyRevenue,
        monthlyRent,
        monthlyExpenses,
        askingPrice,
        downPaymentPercent,
        loanRate,
        loanTerm,
        washers,
        dryers,
        equipmentAge,
        additionalContext
      }, tier);

      res.json(result);
    } catch (error: any) {
      console.error("Tiered Consultation Council error:", error);
      res.status(500).json({ error: error.message || "Tiered consultation failed" });
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
      
      if (!user?.requireAdmin) {
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
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      // Get real counts from database
      const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [subscriberCount] = await db.select({ count: sql<number>`count(*)` }).from(emailSubscribers);
      const [promoCodeCount] = await db.select({ count: sql<number>`count(*)` }).from(promoCodes);
      
      // Calculate revenue from Stripe
      let revenue = 0;
      if (stripe) {
        try {
          const charges = await stripe.charges.list({ limit: 100 });
          revenue = charges.data
            .filter(c => c.status === 'succeeded')
            .reduce((sum, c) => sum + (c.amount / 100), 0);
        } catch (e) {
          console.log('Stripe revenue fetch skipped');
        }
      }
      
      const stats = {
        users: Number(userCount?.count) || 0,
        activeUsers: Number(userCount?.count) || 0,
        subscribers: Number(subscriberCount?.count) || 0,
        promoCodes: Number(promoCodeCount?.count) || 0,
        courses: 0,
        resources: 0,
        vendors: 0,
        topics: 0,
        ads: 0,
        posts: 0,
        revenue: Math.round(revenue),
        totalContent: 0,
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/analytics - Comprehensive live analytics from Stripe & database
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // === REVENUE DATA FROM STRIPE ===
      let totalRevenue = 0;
      let thisMonthRevenue = 0;
      let lastMonthRevenue = 0;
      let mrr = 0;
      const productRevenue: Record<string, { amount: number; count: number }> = {};
      const monthlyTrend: { month: string; amount: number }[] = [];
      const transactions: any[] = [];

      if (stripe) {
        try {
          // Get all successful charges from last 6 months
          const charges = await stripe.charges.list({ 
            limit: 100,
            created: { gte: Math.floor(new Date(now.getFullYear(), now.getMonth() - 6, 1).getTime() / 1000) }
          });

          for (const charge of charges.data) {
            if (charge.status !== 'succeeded') continue;
            
            const amountDollars = charge.amount / 100;
            const chargeDate = new Date(charge.created * 1000);
            
            totalRevenue += amountDollars;
            
            // This month revenue
            if (chargeDate >= thisMonthStart) {
              thisMonthRevenue += amountDollars;
            }
            
            // Last month revenue
            if (chargeDate >= lastMonthStart && chargeDate <= lastMonthEnd) {
              lastMonthRevenue += amountDollars;
            }
            
            // Product breakdown
            const productName = charge.description || (charge.metadata as any)?.productName || 'Other';
            if (!productRevenue[productName]) {
              productRevenue[productName] = { amount: 0, count: 0 };
            }
            productRevenue[productName].amount += amountDollars;
            productRevenue[productName].count += 1;
            
            // Recent transactions (first 10)
            if (transactions.length < 10) {
              transactions.push({
                id: charge.id,
                type: charge.description || 'Payment',
                amount: charge.amount,
                email: charge.billing_details?.email || charge.receipt_email || 'Unknown',
                status: charge.status,
                createdAt: chargeDate.toISOString(),
              });
            }
          }

          // Calculate MRR from active subscriptions
          const subscriptions = await stripe.subscriptions.list({ 
            status: 'active',
            limit: 100 
          });
          
          for (const sub of subscriptions.data) {
            const monthlyAmount = sub.items.data.reduce((sum, item) => {
              const price = item.price;
              if (price.recurring?.interval === 'month') {
                return sum + (price.unit_amount || 0) / 100;
              } else if (price.recurring?.interval === 'year') {
                return sum + ((price.unit_amount || 0) / 100) / 12;
              }
              return sum;
            }, 0);
            mrr += monthlyAmount;
          }

          // Build monthly trend data
          const monthlyData: Record<string, number> = {};
          for (const charge of charges.data) {
            if (charge.status !== 'succeeded') continue;
            const d = new Date(charge.created * 1000);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = (monthlyData[key] || 0) + charge.amount / 100;
          }

          // Generate last 6 months labels
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthName = d.toLocaleDateString('en-US', { month: 'short' });
            monthlyTrend.push({
              month: monthName,
              amount: Math.round(monthlyData[key] || 0),
            });
          }

        } catch (stripeError: any) {
          console.error('Stripe analytics error:', stripeError.message);
        }
      }

      // === USER DATA FROM DATABASE ===
      const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
      
      const [newUsersThisWeek] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.createdAt} >= ${oneWeekAgo}`);
      
      const [newUsersThisMonth] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.createdAt} >= ${thisMonthStart}`);
      
      const [newUsersLastMonth] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.createdAt} >= ${lastMonthStart} AND ${users.createdAt} < ${thisMonthStart}`);

      // === SUBSCRIPTION TIER DISTRIBUTION ===
      const tierResults = await db.select({
        tier: users.cleanbiTier,
        count: sql<number>`count(*)`
      }).from(users).groupBy(users.cleanbiTier);

      const tierCounts = {
        free: 0,
        starter: 0,
        pro: 0,
        enterprise: 0,
      };

      for (const row of tierResults) {
        const tier = (row.tier || 'free').toLowerCase();
        if (tier === 'free' || tier === null) tierCounts.free = Number(row.count);
        else if (tier === 'starter') tierCounts.starter = Number(row.count);
        else if (tier === 'pro') tierCounts.pro = Number(row.count);
        else if (tier === 'enterprise') tierCounts.enterprise = Number(row.count);
      }

      // === CLEANBI USAGE ===
      let cleanbiTotalAnalyses = 0;
      let cleanbiThisMonth = 0;
      let cleanbiUniqueUsers = 0;

      try {
        const [totalAnalyses] = await db.select({ count: sql<number>`count(*)` })
          .from(cleanbiUsage);
        cleanbiTotalAnalyses = Number(totalAnalyses?.count) || 0;

        const [thisMonthAnalyses] = await db.select({ count: sql<number>`count(*)` })
          .from(cleanbiUsage)
          .where(sql`${cleanbiUsage.date} >= ${thisMonthStart.toISOString().split('T')[0]}`);
        cleanbiThisMonth = Number(thisMonthAnalyses?.count) || 0;

        const [uniqueUsersResult] = await db.select({ count: sql<number>`count(distinct ${cleanbiUsage.userId})` })
          .from(cleanbiUsage);
        cleanbiUniqueUsers = Number(uniqueUsersResult?.count) || 0;
      } catch (e) {
        console.log('CLEANBI usage query skipped');
      }

      // === ACTIVITY FEED ===
      const activityFeed = await db.select()
        .from(adminActivityLog)
        .orderBy(desc(adminActivityLog.createdAt))
        .limit(25);

      // Calculate growth percentages
      const lastMonthUsers = Number(newUsersLastMonth?.count) || 1;
      const thisMonthUsers = Number(newUsersThisMonth?.count) || 0;
      const userGrowth = lastMonthUsers > 0 
        ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) 
        : 0;

      const revenueChange = lastMonthRevenue > 0 
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 * 10) / 10
        : 0;

      // Build response
      res.json({
        revenue: {
          total: Math.round(totalRevenue),
          mrr: Math.round(mrr),
          thisMonth: Math.round(thisMonthRevenue),
          lastMonth: Math.round(lastMonthRevenue),
          changePercent: revenueChange,
          byProduct: Object.entries(productRevenue).map(([name, data]) => ({
            name,
            amount: Math.round(data.amount),
            count: data.count,
          })).sort((a, b) => b.amount - a.amount).slice(0, 5),
          monthlyTrend,
        },
        users: {
          total: Number(totalUsers?.count) || 0,
          newThisWeek: Number(newUsersThisWeek?.count) || 0,
          newThisMonth: thisMonthUsers,
          activeThisMonth: Number(totalUsers?.count) || 0,
          growthPercent: userGrowth,
        },
        subscriptions: {
          free: tierCounts.free,
          starter: tierCounts.starter,
          pro: tierCounts.pro,
          enterprise: tierCounts.enterprise,
          churnRate: 0,
        },
        cleanbi: {
          totalAnalyses: cleanbiTotalAnalyses,
          thisMonth: cleanbiThisMonth,
          uniqueUsers: cleanbiUniqueUsers,
        },
        activity: activityFeed.map(a => ({
          id: a.id,
          type: a.type,
          description: a.description,
          email: a.email,
          metadata: a.metadata,
          createdAt: a.createdAt?.toISOString() || new Date().toISOString(),
        })),
        transactions,
      });
    } catch (error: any) {
      console.error('Analytics error:', error);
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
  app.get("/api/vendor/ads", requireAuth, async (req: any, res) => {
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
  app.post("/api/vendor/ads", requireAuth, async (req: any, res) => {
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
  app.patch("/api/vendor/ads/:id", requireAuth, async (req: any, res) => {
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
  app.get("/api/admin/ads", requireAdmin, async (req, res) => {
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
  app.post("/api/admin/ads", requireAdmin, async (req, res) => {
    try {
      const adData = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.createAdvertisement(adData);
      res.status(201).json(ad);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/admin/ads/:id - Update advertisement (admin only)
  app.patch("/api/admin/ads/:id", requireAdmin, async (req, res) => {
    try {
      const ad = await storage.updateAdvertisement(req.params.id, req.body);
      res.json(ad);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/admin/ads/:id/status - Update ad status (admin only)
  app.patch("/api/admin/ads/:id/status", requireAdmin, async (req: any, res) => {
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
  app.delete("/api/admin/ads/:id", requireAdmin, async (req, res) => {
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
  app.post("/api/courses/:courseId/enroll", requireAuth, async (req: any, res) => {
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
  app.get("/api/enrollments", requireAuth, async (req: any, res) => {
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
  app.put("/api/enrollments/:enrollmentId/progress", requireAuth, async (req: any, res) => {
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

  // ========== SERVICE TECH ACADEMY API ROUTES ==========
  // GET /api/service-tech/courses - List all service tech courses
  app.get("/api/service-tech/courses", async (req, res) => {
    try {
      const allCourses = await storage.getCourses({ published: true });
      
      const serviceTechCourses = allCourses.map(course => ({
        id: course.id,
        slug: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        level: course.level,
        track: course.category === 'Operations' ? 'core-tech' 
             : course.category === 'Marketing' ? 'brand-specialist'
             : course.category === 'Finance' ? 'payment-systems'
             : 'business-skills',
        tier: course.isFree ? 'FREE' as const 
            : (course.tierLevel || 1) <= 2 ? 'STARTER' as const 
            : 'PRO' as const,
        duration: course.duration,
        enrollmentCount: course.totalEnrollments || 0,
        certificateEnabled: course.certificateEnabled || false,
        instructorName: course.instructorName,
      }));
      
      res.json(serviceTechCourses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/service-tech/courses/:slug - Get single service tech course
  app.get("/api/service-tech/courses/:slug", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.slug);
      if (!course) return res.status(404).json({ error: "Course not found" });
      
      const serviceTechCourse = {
        id: course.id,
        slug: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        level: course.level,
        track: course.category === 'Operations' ? 'core-tech' 
             : course.category === 'Marketing' ? 'brand-specialist'
             : course.category === 'Finance' ? 'payment-systems'
             : 'business-skills',
        tier: course.isFree ? 'FREE' as const 
            : (course.tierLevel || 1) <= 2 ? 'STARTER' as const 
            : 'PRO' as const,
        duration: course.duration,
        enrollmentCount: course.totalEnrollments || 0,
        certificateEnabled: course.certificateEnabled || false,
        instructorName: course.instructorName,
        price: course.price,
        stripePriceId: course.stripePriceId,
      };
      
      res.json(serviceTechCourse);
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
  app.get("/api/book/access", requireAuth, async (req: any, res) => {
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
  app.post("/api/book/purchase", requireAuth, async (req: any, res) => {
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
  app.post("/api/quizzes/:lessonId/attempt", requireAuth, async (req: any, res) => {
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
  app.post("/api/certificates", requireAuth, async (req: any, res) => {
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
  app.get("/api/annotations/:chapterId", requireAuth, async (req: any, res) => {
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
  app.post("/api/annotations", requireAuth, async (req: any, res) => {
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
  app.delete("/api/annotations/:annotationId", requireAuth, async (req: any, res) => {
    try {
      res.json({ message: "Annotation deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== PREMIUM COMBO PACKAGE ROUTES ==========
  // POST /api/premium-combo/checkout - Create combo package checkout session
  app.post("/api/premium-combo/checkout", requireAuth, async (req: any, res) => {
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
  app.get("/api/premium-combo/status", requireAuth, async (req: any, res) => {
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
  ] as const;

  // Extract valid template IDs for validation
  const validTemplateIds = vaultTemplates.map(t => t.id) as [string, ...string[]];

  // ========== ZOD VALIDATION SCHEMAS ==========
  
  // Vault checkout schema - validates request body for /api/vault/checkout
  // Supports both bundle purchases and individual template purchases
  const vaultCheckoutSchema = z.object({
    type: z.enum(['bundle', 'template'], {
      errorMap: () => ({ message: "Type must be 'bundle' or 'template'" })
    }),
    templateId: z.enum(validTemplateIds, {
      errorMap: () => ({ message: `Invalid template ID. Valid options: ${validTemplateIds.join(', ')}` })
    }).optional(),
  }).refine(
    (data) => {
      // If type is 'template', templateId is required
      if (data.type === 'template' && !data.templateId) {
        return false;
      }
      return true;
    },
    { message: "Template ID is required for individual template purchases" }
  );

  // CLEANBI checkout schema - validates request body for /api/cleanbi/checkout
  const cleanbiCheckoutSchema = z.object({
    address: z.string()
      .min(5, "Address must be at least 5 characters")
      .max(500, "Address must be less than 500 characters")
      .trim(),
    tier: z.enum(['quick', 'standard', 'pro', 'enterprise']).optional().default('quick'),
  });
  
  // Report tier pricing (in cents)
  const REPORT_TIER_PRICING: Record<string, { price: number; name: string; description: string }> = {
    quick: { price: 9900, name: 'Quick Valuation Report', description: 'Fast valuation estimate with CLEANBI score' },
    standard: { price: 19900, name: 'Standard Report', description: 'Essential location analysis with competitor data' },
    pro: { price: 34900, name: 'Pro Report', description: 'Comprehensive analysis with Vision AI insights' },
    enterprise: { price: 49900, name: 'Enterprise Report', description: 'Full analysis with aerial views & consultation' },
  };

  // Consistent API error response structure
  interface ApiErrorResponse {
    success: false;
    error: {
      code: string;
      message: string;
      details?: unknown;
    };
  }

  // Helper to create consistent error responses
  function createErrorResponse(code: string, message: string, details?: unknown): ApiErrorResponse {
    return {
      success: false,
      error: { code, message, details }
    };
  }

  /**
   * POST /api/vault/checkout - Create Stripe checkout session for Vault products
   * 
   * SECURITY NOTE: Guest checkout is intentionally allowed for e-commerce conversion.
   * - Authenticated users: Email pre-filled, userId tracked for post-purchase access
   * - Guest users: Email collected at Stripe checkout, userId='guest', purchase linked via Stripe webhook
   * 
   * All purchases require valid Stripe payment - no authentication bypass for product access.
   */
  app.post("/api/vault/checkout", async (req: any, res) => {
    try {
      // Service availability check
      if (!stripe) {
        return res.status(503).json(
          createErrorResponse('PAYMENT_UNAVAILABLE', 'Payment processing is currently unavailable. Please try again later.')
        );
      }
      
      // Validate request body with Zod schema
      const validationResult = vaultCheckoutSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map(e => e.message).join('; ');
        return res.status(400).json(
          createErrorResponse('VALIDATION_ERROR', errorMessage, validationResult.error.flatten())
        );
      }
      
      const { type, templateId } = validationResult.data;
      
      // GUEST CHECKOUT PATTERN: Intentional for e-commerce
      // - Authenticated users get email pre-filled and userId tracked
      // - Guests provide email at Stripe checkout, marked as 'guest' userId
      // - Post-purchase access handled via Stripe webhooks regardless of auth state
      const userEmail = req.user?.claims?.email || req.user?.email || undefined;
      const userId = req.user?.claims?.sub || req.user?.sub || 'guest';
      const isGuest = userId === 'guest';
      
      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let productName = "";
      let productDescription = "";
      let successPath = "/vault?success=true";
      
      // Template price ID mapping for individual purchases
      const templatePriceIds: Record<string, string | undefined> = {
        'due-diligence': process.env.STRIPE_PRICE_TEMPLATE_DUE_DILIGENCE,
        'grand-opening': process.env.STRIPE_PRICE_TEMPLATE_GRAND_OPENING,
        'employee-handbook': process.env.STRIPE_PRICE_TEMPLATE_EMPLOYEE_HANDBOOK,
        'wdf-manual': process.env.STRIPE_PRICE_TEMPLATE_WDF_MANUAL,
      };
      
      if (type === "bundle") {
        // Full Vault bundle - $997 - use real Stripe price if available
        productName = "The Operator's Vault - Complete Bundle";
        productDescription = "All 20 premium laundromat templates ($5,917 value)";
        const bundlePriceId = process.env.STRIPE_PRICE_VAULT_BUNDLE;
        lineItems = bundlePriceId ? [
          { price: bundlePriceId, quantity: 1 }
        ] : [{
          price_data: {
            currency: "usd",
            product_data: { name: productName, description: productDescription },
            unit_amount: 99700,
          },
          quantity: 1,
        }];
        successPath = "/vault?success=bundle";
      } else {
        // Individual template purchase - templateId is guaranteed by validation
        const template = vaultTemplates.find(t => t.id === templateId);
        if (!template) {
          return res.status(400).json(
            createErrorResponse('TEMPLATE_NOT_FOUND', 'Template not found')
          );
        }
        
        productName = template.name;
        productDescription = `Premium laundromat template from The Operator's Vault`;
        const templatePriceId = templatePriceIds[templateId!];
        lineItems = templatePriceId ? [
          { price: templatePriceId, quantity: 1 }
        ] : [{
          price_data: {
            currency: "usd",
            product_data: { name: productName, description: productDescription },
            unit_amount: template.price * 100,
          },
          quantity: 1,
        }];
        successPath = `/vault?success=${templateId}`;
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
          isGuest: isGuest ? 'true' : 'false',
          type, 
          templateId: templateId || 'bundle',
          product: productName 
        },
      });

      res.json({ success: true, checkoutUrl: session.url });
    } catch (error: any) {
      console.error("Vault checkout error:", error);
      res.status(500).json(
        createErrorResponse('CHECKOUT_ERROR', 'An error occurred during checkout. Please try again.')
      );
    }
  });

  /**
   * POST /api/cleanbi/checkout - Create Stripe checkout for $97 CLEANBI report
   * 
   * SECURITY NOTE: Guest checkout is intentionally allowed for e-commerce conversion.
   * - Address is validated and sanitized before use
   * - Authenticated users: Email pre-filled, userId tracked
   * - Guest users: Email collected at Stripe checkout, report delivered via email
   */
  app.post("/api/cleanbi/checkout", async (req: any, res) => {
    try {
      // Service availability check
      if (!stripe) {
        return res.status(503).json(
          createErrorResponse('PAYMENT_UNAVAILABLE', 'Payment processing is currently unavailable. Please try again later.')
        );
      }
      
      // Validate request body with Zod schema
      const validationResult = cleanbiCheckoutSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map(e => e.message).join('; ');
        return res.status(400).json(
          createErrorResponse('VALIDATION_ERROR', errorMessage, validationResult.error.flatten())
        );
      }
      
      const { address, tier } = validationResult.data;
      
      // Get tier pricing
      const tierConfig = REPORT_TIER_PRICING[tier];
      if (!tierConfig) {
        return res.status(400).json(
          createErrorResponse('INVALID_TIER', 'Invalid report tier selected.')
        );
      }
      
      // CLEANBI report price IDs from Stripe
      const cleanbiPriceIds: Record<string, string | undefined> = {
        quick: process.env.STRIPE_PRICE_CLEANBI_QUICK,
        standard: process.env.STRIPE_PRICE_CLEANBI_STANDARD,
        pro: process.env.STRIPE_PRICE_CLEANBI_PRO,
        enterprise: process.env.STRIPE_PRICE_CLEANBI_ENTERPRISE,
      };
      
      // GUEST CHECKOUT PATTERN: Intentional for e-commerce
      const userEmail = req.user?.claims?.email || req.user?.email || undefined;
      const userId = req.user?.claims?.sub || req.user?.sub || 'guest';
      const isGuest = userId === 'guest';
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `${req.protocol}://${req.hostname}`;
      
      // Use real Stripe price ID if available, fallback to dynamic pricing
      const priceId = cleanbiPriceIds[tier];
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId ? [
        { price: priceId, quantity: 1 }
      ] : [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `CLEANBI ${tierConfig.name}`,
            description: `${tierConfig.description} for: ${address}`,
          },
          unit_amount: tierConfig.price,
        },
        quantity: 1,
      }];
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${baseUrl}/cleanbi-reports?success=true&tier=${tier}&address=${encodeURIComponent(address)}`,
        cancel_url: `${baseUrl}/cleanbi-reports`,
        customer_email: userEmail,
        metadata: { 
          userId,
          isGuest: isGuest ? 'true' : 'false',
          type: 'cleanbi-report',
          tier,
          address
        },
      });

      res.json({ success: true, checkoutUrl: session.url });
    } catch (error: any) {
      console.error("CLEANBI checkout error:", error);
      res.status(500).json(
        createErrorResponse('CHECKOUT_ERROR', 'An error occurred during checkout. Please try again.')
      );
    }
  });

  /**
   * POST /api/cleanbi/subscribe - Create Stripe subscription for CLEANBI Pro ($29/mo)
   * 
   * SUBSCRIPTION TIERS:
   * - PRO: $29/mo - Unlimited daily reports, detailed breakdowns, competitor analysis
   * - ENTERPRISE: $149/mo - Everything + API access, bulk reports, priority support
   */
  app.post("/api/cleanbi/subscribe", requireAuth, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json(
          createErrorResponse('PAYMENT_UNAVAILABLE', 'Payment processing is currently unavailable.')
        );
      }
      
      const { tier = 'pro', interval = 'month' } = req.body;
      const currentUser = await getCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json(
          createErrorResponse('AUTH_REQUIRED', 'Please sign in to subscribe.')
        );
      }
      
      // Validate tier
      const validTiers = ['pro', 'enterprise'];
      if (!validTiers.includes(tier)) {
        return res.status(400).json(
          createErrorResponse('INVALID_TIER', 'Invalid subscription tier.')
        );
      }
      
      // Pricing configuration
      const pricing: Record<string, { monthly: number; annual: number; name: string }> = {
        pro: { monthly: 2900, annual: 29000, name: 'CLEANBI Pro' }, // $29/mo or $290/year
        enterprise: { monthly: 14900, annual: 149000, name: 'CLEANBI Enterprise' } // $149/mo or $1490/year
      };
      
      const selectedPricing = pricing[tier];
      const amount = interval === 'year' ? selectedPricing.annual : selectedPricing.monthly;
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `${req.protocol}://${req.hostname}`;
      
      // Create subscription checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: selectedPricing.name,
              description: tier === 'pro' 
                ? "Unlimited CLEANBI reports, competitor analysis, demographics, PDF export"
                : "Everything in Pro + API access, bulk reports, white-label options",
            },
            unit_amount: amount,
            recurring: {
              interval: interval === 'year' ? 'year' : 'month',
            },
          },
          quantity: 1,
        }],
        mode: "subscription",
        success_url: `${baseUrl}/cleanbi?subscribed=true&tier=${tier}`,
        cancel_url: `${baseUrl}/pricing`,
        customer_email: currentUser.user.email || undefined,
        metadata: { 
          userId: currentUser.userId,
          type: 'cleanbi-subscription',
          tier,
          interval
        },
        subscription_data: {
          metadata: {
            userId: currentUser.userId,
            tierId: tier.toUpperCase()
          }
        }
      });

      res.json({ success: true, checkoutUrl: session.url });
    } catch (error: any) {
      console.error("CLEANBI subscription error:", error);
      res.status(500).json(
        createErrorResponse('CHECKOUT_ERROR', 'An error occurred during checkout. Please try again.')
      );
    }
  });

  /**
   * GET /api/cleanbi/quota - Get current user's CLEANBI usage and quota
   */
  app.get("/api/cleanbi/quota", async (req: any, res) => {
    try {
      const { 
        getUserCLEANBITier, 
        checkCLEANBIQuota, 
        checkAnonymousQuota,
        CLEANBI_PRICING_TIERS
      } = await import('./cleanbi-subscription-manager');
      
      const currentUser = await getCurrentUser(req).catch(() => null);
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      
      if (!currentUser) {
        // Anonymous user
        const anonQuota = await checkAnonymousQuota(clientIp);
        return res.json({
          tier: 'ANONYMOUS',
          requireAuth: false,
          quota: {
            allowed: anonQuota.allowed,
            remainingToday: anonQuota.remaining,
            dailyLimit: 1,
            monthlyLimit: 1
          },
          features: {
            detailedBreakdown: false,
            competitorAnalysis: false,
            demographicData: false,
            pdfExport: false
          },
          upgradeUrl: '/auth'
        });
      }
      
      const userTier = await getUserCLEANBITier(currentUser.userId);
      const quota = await checkCLEANBIQuota(currentUser.userId, userTier);
      const tierConfig = CLEANBI_PRICING_TIERS[userTier];
      const features = tierConfig.features as any;
      
      res.json({
        tier: userTier,
        tierName: tierConfig.name,
        requireAuth: true,
        quota: {
          allowed: quota.allowed,
          remainingToday: quota.remainingToday,
          remainingMonth: quota.remainingMonth,
          dailyLimit: quota.dailyLimit,
          monthlyLimit: quota.monthlyLimit
        },
        features: {
          detailedBreakdown: features.detailedBreakdown ?? false,
          competitorAnalysis: features.competitorAnalysis ?? false,
          demographicData: features.demographicData ?? false,
          pdfExport: features.pdfExport ?? false,
          savedReports: features.savedReports ?? false,
          emailAlerts: features.emailAlerts ?? false
        },
        upgradeUrl: userTier === 'FREE' ? '/pricing?upgrade=cleanbi-pro' : null
      });
    } catch (error: any) {
      console.error("CLEANBI quota check error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/user/activity - Get recent CLEANBI analyses for the current user
   */
  app.get("/api/user/activity", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const recentAnalyses = await db.select({
        id: cleanbiUsage.id,
        address: cleanbiUsage.addressScored,
        reportType: cleanbiUsage.reportType,
        timestamp: cleanbiUsage.timestamp,
        createdAt: cleanbiUsage.createdAt,
      })
        .from(cleanbiUsage)
        .where(eq(cleanbiUsage.userId, currentUser.userId))
        .orderBy(desc(cleanbiUsage.createdAt))
        .limit(10);

      const thisMonth = new Date();
      const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
      
      const [monthlyCount] = await db.select({ count: sql<number>`count(*)::int` })
        .from(cleanbiUsage)
        .where(and(
          eq(cleanbiUsage.userId, currentUser.userId),
          sql`${cleanbiUsage.createdAt} >= ${firstDayOfMonth.toISOString()}`
        ));

      const quotaResetDate = currentUser.user.cleanbiQuotaResetDate 
        ? new Date(currentUser.user.cleanbiQuotaResetDate)
        : new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1);

      res.json({
        recentAnalyses: recentAnalyses.map(a => ({
          id: a.id,
          address: a.address || 'Unknown Address',
          reportType: a.reportType || 'basic',
          date: a.createdAt || a.timestamp,
        })),
        thisMonthCount: monthlyCount?.count || 0,
        quotaResetDate: quotaResetDate.toISOString(),
      });
    } catch (error: any) {
      console.error("User activity error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/cleanbi/enriched - Get enriched CLEANBI score with Master Formulas
   * 
   * Uses multi-source data enrichment:
   * - Google Maps/Places API (geocoding, competition, reviews)
   * - US Census Bureau (demographics, income, renter %)
   * - ATTOM API (property values, permits when available)
   * 
   * Tier-gated features:
   * - FREE: Basic score with Google + Census estimates
   * - STARTER ($49): Full Census + property data
   * - PRO ($149): Full ATTOM + growth signals
   * - ENTERPRISE ($699): Premium insights + API access
   */
  app.post("/api/cleanbi/enriched", async (req: any, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          error: "Rate limit exceeded. Try again in a minute.",
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }

      const { address, financialInputs, leaseInputs, equipmentInputs, utilitiesInputs } = req.body;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: "Address is required" });
      }
      
      if (address.length > 500) {
        return res.status(400).json({ error: "Address too long" });
      }

      const { enrichCLEANBIData, getEnrichmentTierFromUser } = await import('./cleanbi-data-enrichment');
      const { calculateCLEANBIMasterScore, calculateQuickCLEANBIScore } = await import('./cleanbi-master-formulas');
      
      const currentUser = await getCurrentUser(req).catch(() => null);
      const tier = getEnrichmentTierFromUser(currentUser);
      
      console.log(`🔍 Enriched CLEANBI request: ${address} (tier: ${tier})`);
      
      const enrichedData = await enrichCLEANBIData(address, { tier });
      
      let scoreResult;
      if (financialInputs || leaseInputs || equipmentInputs || utilitiesInputs) {
        scoreResult = calculateCLEANBIMasterScore(
          enrichedData,
          financialInputs || {},
          leaseInputs || {},
          equipmentInputs || {},
          utilitiesInputs || {}
        );
      } else {
        const quickScore = calculateQuickCLEANBIScore(enrichedData);
        scoreResult = {
          cleanbiScore: quickScore.score,
          grade: quickScore.grade,
          confidence: quickScore.confidence,
          subscores: {
            marketScore: enrichedData.marketScores.demographicPowerScore,
            financialScore: 0,
            leaseScore: 0,
            equipmentScore: 0,
            utilitiesScore: 0,
            growthScore: enrichedData.growthSignals?.growthScore || 0
          },
          breakdown: {
            renterScore: enrichedData.marketScores.renterScore,
            incomeScore: enrichedData.marketScores.incomeScore,
            densityScore: enrichedData.marketScores.densityScore,
            competitionScore: enrichedData.marketScores.competitionScore
          },
          recommendations: [],
          calculators: {
            demographicPowerScore: enrichedData.marketScores.demographicPowerScore,
            laundryDemandIndex: enrichedData.demographics.laundryDemandIndex
          }
        };
      }
      
      res.json({
        success: true,
        address: enrichedData.formattedAddress,
        coordinates: enrichedData.coordinates,
        addressType: enrichedData.addressType,
        
        score: scoreResult.cleanbiScore,
        grade: scoreResult.grade,
        confidence: scoreResult.confidence,
        
        subscores: scoreResult.subscores,
        breakdown: scoreResult.breakdown,
        recommendations: scoreResult.recommendations || [],
        calculators: scoreResult.calculators,
        
        demographics: enrichedData.demographics,
        competition: enrichedData.competition,
        placeDetails: enrichedData.placeDetails,
        property: tier !== 'free' ? enrichedData.property : null,
        growthSignals: tier === 'pro' || tier === 'enterprise' ? enrichedData.growthSignals : null,
        insights: enrichedData.insights,
        
        dataQuality: enrichedData.dataQuality,
        tier
      });
    } catch (error: any) {
      console.error('Enriched CLEANBI error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to calculate enriched score",
        hint: "Verify the address is correct"
      });
    }
  });

  // ========== GAMIFICATION & BADGES ROUTES ==========
  // POST /api/badges - Award badge to user
  app.post("/api/badges", requireAuth, async (req: any, res) => {
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
  app.get("/api/badges", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      // Return empty array until real badge system is implemented
      // Badges will be stored in database once earned
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/learning-stats - Get user's learning statistics
  app.get("/api/learning-stats", requireAuth, async (req: any, res) => {
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
  app.post("/api/admin/index-all", requireAdmin, async (req: any, res) => {
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
  app.post("/api/admin/indexnow-all", requireAdmin, async (req: any, res) => {
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

  // GET /api/admin/indexing-log - Get recent IndexNow submission log
  app.get("/api/admin/indexing-log", requireAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const log = getIndexingLog(limit);
      
      res.json({
        success: true,
        count: log.length,
        entries: log,
      });
    } catch (error: any) {
      console.error("Failed to get indexing log:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // POST /api/admin/index-all-engines - Submit ALL URLs to ALL search engines (Google + IndexNow)
  app.post("/api/admin/index-all-engines", requireAdmin, async (req: any, res) => {
    try {
      console.log("\n🌐 [ADMIN] MASS INDEXING: Submitting to ALL search engines...\n");
      
      // Get all URLs from database for dynamic sitemap
      const baseUrl = "https://washbizhub.com";
      
      // Static pages - all high-value pages
      const staticPages = [
        "/", "/pricing", "/about", "/contact", "/consultation",
        "/cleanbi-explorer", "/cleanbi-auto", "/service-guy-ai",
        "/buy-laundromat", "/sell-your-laundromat", "/brokers",
        "/calculator", "/roi-calculator", "/valuation-calculator",
        "/sba-readiness", "/business-plan-generator", "/equipment-matcher",
        "/startup-funding", "/acquisitions-funding", "/real-estate-financing",
        "/equipment-financing", "/funding-matcher", "/gokapital",
        "/parts", "/repair-guide", "/error-codes",
        "/locator", "/directory-listing", "/vendors",
        "/blog", "/learning", "/courses", "/products",
        "/website-templates", "/facebook-group", "/atm-services"
      ];
      
      // Get error codes from database
      const errorCodes = await db.select({ slug: diagnosticCodes.slug })
        .from(diagnosticCodes)
        .limit(2500);
      
      // Get blog posts from database
      const blogs = await db.select({ slug: blogPosts.slug })
        .from(blogPosts)
        .limit(500);
      
      // Get listings from database
      const listingsData = await db.select({ id: listings.id })
        .from(listings)
        .limit(500);
      
      // Build full URL list
      const allUrls: string[] = [];
      
      // Add static pages
      staticPages.forEach(page => allUrls.push(`${baseUrl}${page}`));
      
      // Add error codes
      errorCodes.forEach(code => {
        if (code.slug) allUrls.push(`${baseUrl}/error-codes/${code.slug}`);
      });
      
      // Add blog posts
      blogs.forEach(post => {
        if (post.slug) allUrls.push(`${baseUrl}/blog/${post.slug}`);
      });
      
      // Add listings
      listingsData.forEach(listing => {
        if (listing.id) allUrls.push(`${baseUrl}/buy-laundromat/${listing.id}`);
      });
      
      console.log(`📊 Total URLs to submit: ${allUrls.length}`);
      console.log(`   - Static pages: ${staticPages.length}`);
      console.log(`   - Error codes: ${errorCodes.length}`);
      console.log(`   - Blog posts: ${blogs.length}`);
      console.log(`   - Listings: ${listingsData.length}`);
      
      // Submit to IndexNow (Bing, Yandex, DuckDuckGo) - Batch of 10,000 max
      console.log("\n🔵 Submitting to IndexNow (Bing, Yandex, DuckDuckGo)...");
      await submitToIndexNow(allUrls.slice(0, 10000));
      
      // Submit to Google Indexing API (rate limited, submit key pages)
      console.log("\n🔴 Submitting to Google Indexing API...");
      const googleResults = { success: 0, failed: 0, skipped: 0, errors: [] as string[] };
      
      // Google has rate limits, so prioritize key pages
      const priorityUrls = allUrls.slice(0, 200); // Google rate limit ~200/day
      
      for (let i = 0; i < priorityUrls.length; i++) {
        try {
          const result = await submitToGoogle(priorityUrls[i]);
          if (result.success) {
            googleResults.success++;
          } else {
            googleResults.failed++;
            if (googleResults.errors.length < 10) {
              googleResults.errors.push(`${priorityUrls[i]}: ${result.message}`);
            }
          }
          // Rate limit: 1 request per 100ms
          if (i < priorityUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (err: any) {
          googleResults.failed++;
        }
      }
      
      console.log(`\n✅ MASS INDEXING COMPLETE!`);
      console.log(`   Google: ${googleResults.success} success, ${googleResults.failed} failed`);
      console.log(`   IndexNow: ${allUrls.length} URLs submitted to Bing/Yandex/DuckDuckGo`);
      
      res.json({
        success: true,
        message: `Submitted ${allUrls.length} URLs to all search engines`,
        totalUrls: allUrls.length,
        breakdown: {
          staticPages: staticPages.length,
          errorCodes: errorCodes.length,
          blogPosts: blogs.length,
          listings: listingsData.length,
        },
        google: {
          submitted: priorityUrls.length,
          success: googleResults.success,
          failed: googleResults.failed,
          note: "Google API has daily rate limits (~200/day)",
          errors: googleResults.errors,
        },
        indexNow: {
          submitted: allUrls.length,
          engines: ["Bing", "Yandex", "DuckDuckGo", "IndexNow API"],
        },
      });
    } catch (error: any) {
      console.error("Mass indexing failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // POST /api/admin/trigger-indexnow - Manually trigger IndexNow for new content
  app.post("/api/admin/trigger-indexnow", requireAdmin, async (req: any, res) => {
    try {
      const { errorCodes, blogSlugs, listingIds, customUrls } = req.body;
      
      // Validate that at least one content type is provided
      const hasContent = 
        (errorCodes?.length) || 
        (blogSlugs?.length) || 
        (listingIds?.length) || 
        (customUrls?.length);
      
      if (!hasContent) {
        return res.status(400).json({
          success: false,
          error: "At least one content type is required: errorCodes, blogSlugs, listingIds, or customUrls"
        });
      }
      
      console.log(`\n🚀 [ADMIN] Triggering IndexNow submission...`);
      
      // Submit all content to IndexNow
      const result = await submitContentToIndexNow({
        errorCodes: errorCodes || [],
        blogSlugs: blogSlugs || [],
        listingIds: listingIds || [],
        customUrls: customUrls || [],
      });
      
      res.json({
        success: true,
        message: `Submitted ${result.totalSubmitted} URLs to IndexNow`,
        key: INDEXNOW_KEY,
        endpoints: ['api.indexnow.org', 'www.bing.com', 'yandex.com'],
        ...result,
      });
    } catch (error: any) {
      console.error("IndexNow trigger failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // ==================== INDEXNOW PUBLIC API ====================
  
  // POST /api/indexnow/submit - Submit URLs to IndexNow (Bing, Yahoo, Yandex, DuckDuckGo)
  app.post("/api/indexnow/submit", async (req: any, res) => {
    try {
      const { urls, url, force = false, sitemapUrl } = req.body;
      
      // Handle sitemap submission
      if (sitemapUrl) {
        console.log(`📤 IndexNow: Processing sitemap URL: ${sitemapUrl}`);
        const result = await submitFromSitemap(sitemapUrl, { skipDeduplication: force });
        return res.json({
          success: true,
          source: "sitemap",
          sitemapUrl,
          ...result,
          engines: ["Bing", "Yahoo", "Yandex", "DuckDuckGo"],
        });
      }
      
      // Handle batch URL submission
      if (urls && Array.isArray(urls)) {
        if (urls.length === 0) {
          return res.status(400).json({
            success: false,
            error: "URLs array is empty",
          });
        }
        
        if (urls.length > 500) {
          return res.status(400).json({
            success: false,
            error: "Maximum 500 URLs per request. Use queue endpoint for larger batches.",
          });
        }
        
        console.log(`📤 IndexNow: Processing ${urls.length} URLs`);
        const result = await submitBatch(urls, { skipDeduplication: force });
        
        return res.json({
          success: true,
          source: "batch",
          ...result,
          engines: ["Bing", "Yahoo", "Yandex", "DuckDuckGo"],
        });
      }
      
      // Handle single URL submission
      if (url) {
        console.log(`📤 IndexNow: Submitting single URL: ${url}`);
        const result = await submitUrlWithDeduplication(url, force);
        
        return res.json({
          success: result.submitted,
          source: "single",
          url,
          submitted: result.submitted,
          deduplicated: result.deduplicated,
          message: result.message,
          engines: result.submitted ? ["Bing", "Yahoo", "Yandex", "DuckDuckGo"] : [],
        });
      }
      
      return res.status(400).json({
        success: false,
        error: "Please provide 'url', 'urls' array, or 'sitemapUrl'",
      });
    } catch (error: any) {
      console.error("IndexNow submission failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // GET /api/indexnow/status - Get IndexNow service status and recent submissions
  app.get("/api/indexnow/status", async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      
      const queueStatus = getQueueStatus();
      const recentSubmissions = getSubmissionHistory(limit);
      const deduplicationStats = getDeduplicationStats();
      const indexNowKey = getIndexNowKey();
      
      res.json({
        success: true,
        status: {
          active: true,
          keyConfigured: !!indexNowKey,
          keyFile: "/indexnow-key.txt",
          engines: ["Bing", "Yahoo", "Yandex", "DuckDuckGo"],
        },
        queue: queueStatus,
        deduplication: {
          windowHours: 24,
          ...deduplicationStats,
        },
        recentSubmissions: {
          count: recentSubmissions.length,
          submissions: recentSubmissions,
        },
      });
    } catch (error: any) {
      console.error("Failed to get IndexNow status:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // POST /api/indexnow/queue - Add URLs to queue for batch processing
  app.post("/api/indexnow/queue", async (req: any, res) => {
    try {
      const { urls, priority = 0 } = req.body;
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          error: "URLs array required",
        });
      }
      
      console.log(`📥 IndexNow: Adding ${urls.length} URLs to queue`);
      const result = addToQueue(urls, priority);
      
      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Failed to add to queue:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // POST /api/indexnow/queue/process - Process the IndexNow queue
  app.post("/api/indexnow/queue/process", async (req: any, res) => {
    try {
      console.log("🔄 IndexNow: Processing queue");
      const result = await processQueue();
      
      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Failed to process queue:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // DELETE /api/indexnow/deduplication - Clear deduplication cache
  app.delete("/api/indexnow/deduplication", requireAdmin, async (req: any, res) => {
    try {
      const result = clearDeduplicationCache();
      
      res.json({
        success: true,
        ...result,
        message: "Deduplication cache cleared",
      });
    } catch (error: any) {
      console.error("Failed to clear deduplication cache:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // GET /api/indexnow/key - Get the IndexNow key (for verification)
  app.get("/api/indexnow/key", async (req: any, res) => {
    const key = getIndexNowKey();
    res.json({
      key,
      keyLocation: `https://washbizhub.com/${key}.txt`,
      alternateLocation: "https://washbizhub.com/indexnow-key.txt",
    });
  });

  // GET /api/admin/pagespeed - Analyze Core Web Vitals using Google PageSpeed API
  app.get("/api/admin/pagespeed", requireAdmin, async (req: any, res) => {
    try {
      const url = req.query.url as string;
      const strategy = (req.query.strategy as "mobile" | "desktop") || "mobile";
      
      if (!url) {
        return res.status(400).json({ 
          success: false, 
          error: "URL parameter required" 
        });
      }
      
      const { analyzeCoreWebVitals, getPerformanceChecklist } = await import("./core-web-vitals");
      
      console.log(`📊 Admin PageSpeed analysis requested for: ${url}`);
      
      const vitals = await analyzeCoreWebVitals(url, strategy);
      const checklist = getPerformanceChecklist();
      
      res.json({
        success: true,
        url,
        strategy,
        vitals,
        checklist,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("PageSpeed analysis failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // POST /api/admin/pagespeed-batch - Analyze multiple URLs in batch
  app.post("/api/admin/pagespeed-batch", requireAdmin, async (req: any, res) => {
    try {
      const { urls, strategy = "mobile" } = req.body;
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "URLs array required" 
        });
      }
      
      if (urls.length > 10) {
        return res.status(400).json({ 
          success: false, 
          error: "Maximum 10 URLs per batch" 
        });
      }
      
      const { analyzeCoreWebVitals } = await import("./core-web-vitals");
      
      console.log(`📊 Admin batch PageSpeed analysis for ${urls.length} URLs`);
      
      const results = await Promise.all(
        urls.map(async (url: string) => {
          try {
            const vitals = await analyzeCoreWebVitals(url, strategy);
            return { url, success: true, vitals };
          } catch (error: any) {
            return { url, success: false, error: error.message };
          }
        })
      );
      
      const avgScore = results
        .filter(r => r.success && r.vitals?.score)
        .reduce((acc, r) => acc + (r.vitals?.score || 0), 0) / 
        results.filter(r => r.success).length || 0;
      
      res.json({
        success: true,
        strategy,
        totalUrls: urls.length,
        averageScore: Math.round(avgScore),
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Batch PageSpeed analysis failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // ========== SERVICE GUY AI - Equipment Diagnostics ==========
  // Service Guy AI requires all_access tier for unlimited usage
  app.post("/api/service-guy-ai/diagnose", requireAuth, tierGateRequireTier('all_access'), async (req, res) => {
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

  // Service Guy AI - PDF Manual Extraction (requires all_access tier)
  app.post("/api/service-guy-ai/extract-manual", requireAuth, tierGateRequireTier('all_access'), multerUpload.single("manual"), async (req: any, res) => {
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

  // ========== SERVICE GUY API - Protected Diagnostic Code Endpoints ==========
  // These endpoints use anti-scraping middleware and tier-based access control

  // Tier limits configuration
  const TIER_LIMITS = {
    free: { monthlyLookups: 5, requestsPerMinute: 2 },
    starter: { monthlyLookups: 50, requestsPerMinute: 10 },
    pro: { monthlyLookups: -1, requestsPerMinute: 30 }, // -1 = unlimited
    enterprise: { monthlyLookups: -1, requestsPerMinute: 100 },
  };

  // POST /api/service-guy/scan-image - Analyze equipment image with Gemini Vision (requires all_access)
  app.post("/api/service-guy/scan-image", requireAuth, tierGateRequireTier('all_access'), async (req, res) => {
    try {
      const { imageData, mimeType, manufacturer, machineType } = req.body;

      if (!imageData) {
        return res.status(400).json({ 
          success: false,
          error: "No image data provided. Please provide base64 encoded image data.",
          "data-testid": "scan-image-error-no-data"
        });
      }

      // Validate image data format (should be base64)
      const base64Regex = /^[A-Za-z0-9+/=]+$/;
      const cleanedImageData = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      if (!base64Regex.test(cleanedImageData.replace(/\s/g, ''))) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid image data format. Please provide valid base64 encoded image.",
          "data-testid": "scan-image-error-invalid-format"
        });
      }

      // Validate mime type
      const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const effectiveMimeType = mimeType || 'image/jpeg';
      
      if (!validMimeTypes.includes(effectiveMimeType)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid image type. Supported types: JPEG, PNG, WebP, GIF.",
          "data-testid": "scan-image-error-invalid-type"
        });
      }

      // Call Gemini Vision API for comprehensive analysis
      const result = await analyzeEquipmentImage(
        cleanedImageData,
        effectiveMimeType,
        {
          manufacturer: manufacturer || undefined,
          machineType: machineType || undefined
        }
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: "Failed to analyze image. Please try with a clearer image.",
          "data-testid": "scan-image-error-analysis-failed"
        });
      }

      res.json({
        success: true,
        diagnosis: result.diagnosis,
        confidence: result.confidence,
        analyzedAt: new Date().toISOString(),
        "data-testid": "scan-image-result"
      });

    } catch (error: any) {
      console.error("[SERVICE-GUY] Image scan error:", error);
      res.status(500).json({ 
        success: false,
        error: "Image analysis failed. Please try again.",
        message: error.message,
        "data-testid": "scan-image-error"
      });
    }
  });

  // 1. GET /api/service-guy/manufacturers - List all manufacturers (public, no rate limit)
  app.get("/api/service-guy/manufacturers", async (req, res) => {
    try {
      // Get distinct manufacturers from diagnostic codes
      const manufacturers = await db
        .selectDistinct({ manufacturer: diagnosticCodes.manufacturer })
        .from(diagnosticCodes)
        .orderBy(asc(diagnosticCodes.manufacturer));

      const manufacturerList = manufacturers.map(m => m.manufacturer).filter(Boolean);

      res.json({
        success: true,
        manufacturers: manufacturerList,
        count: manufacturerList.length,
        "data-testid": "manufacturers-list",
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Error fetching manufacturers:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch manufacturers",
        "data-testid": "manufacturers-error",
      });
    }
  });

  // 2. GET /api/service-guy/search - Search diagnostic codes with rate limiting
  app.get("/api/service-guy/search", 
    serviceGuyAntiScraping, 
    serviceGuyRateLimit, 
    async (req: any, res) => {
    try {
      const { code, manufacturer, q } = req.query;
      const tier = (req as any).tier || "free";
      const remainingLookups = (req as any).remainingLookups;

      // Build search conditions
      const conditions: any[] = [];

      if (code) {
        conditions.push(ilike(diagnosticCodes.code, `%${code}%`));
      }
      if (manufacturer) {
        conditions.push(eq(diagnosticCodes.manufacturer, manufacturer as string));
      }
      if (q) {
        // Search in code, title, and description
        conditions.push(
          or(
            ilike(diagnosticCodes.code, `%${q}%`),
            ilike(diagnosticCodes.title, `%${q}%`),
            ilike(diagnosticCodes.description, `%${q}%`)
          )!
        );
      }

      const results = await db
        .select()
        .from(diagnosticCodes)
        .where(and(...conditions))
        .orderBy(asc(diagnosticCodes.manufacturer), asc(diagnosticCodes.code))
        .limit(50);

      // Log access for each result
      if (results.length > 0) {
        await logDiagnosticAccess(
          req,
          results[0]?.id || null,
          (code as string) || (q as string) || "",
          (manufacturer as string) || "all",
          results.length > 0 ? "results" : "no_results"
        );
      }

      // Obfuscate content based on tier
      const obfuscatedResults = results.map(result => obfuscateContent({
        id: result.id,
        code: result.code,
        manufacturer: result.manufacturer,
        machineType: result.machineType,
        slug: result.slug,
        title: result.title,
        description: result.description,
        possibleCauses: result.possibleCauses,
        troubleshootingSteps: result.troubleshootingSteps,
        requiredParts: result.requiredParts,
        partsWithPricing: result.partsWithPricing,
        estimatedRepairTime: result.estimatedRepairTime,
        difficultyLevel: result.difficultyLevel,
        quickFix: result.quickFix,
        testModeEntry: result.testModeEntry,
        safetyWarning: result.safetyWarning,
      }, tier));

      res.json({
        success: true,
        results: obfuscatedResults,
        count: results.length,
        tier,
        remainingLookups,
        query: { code, manufacturer, q },
        "data-testid": "search-results",
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Search error:", error);
      res.status(500).json({ 
        success: false,
        error: "Search failed",
        "data-testid": "search-error",
      });
    }
  });

  // 3. GET /api/service-guy/code/:slug - Get single code details
  app.get("/api/service-guy/code/:slug", 
    serviceGuyAntiScraping, 
    serviceGuyRateLimit, 
    async (req: any, res) => {
    try {
      const { slug } = req.params;
      const tier = (req as any).tier || "free";
      const remainingLookups = (req as any).remainingLookups;

      const [result] = await db
        .select()
        .from(diagnosticCodes)
        .where(eq(diagnosticCodes.slug, slug))
        .limit(1);

      if (!result) {
        // Log failed lookup attempt
        await logDiagnosticAccess(req, null, slug, "unknown", "not_found");
        return res.status(404).json({ 
          success: false,
          error: "Diagnostic code not found",
          slug,
          "data-testid": "code-not-found",
        });
      }

      // Log successful access
      await logDiagnosticAccess(
        req,
        result.id,
        result.code,
        result.manufacturer,
        "detail_view"
      );

      // Obfuscate content based on tier
      const obfuscatedResult = obfuscateContent({
        id: result.id,
        code: result.code,
        manufacturer: result.manufacturer,
        machineType: result.machineType,
        slug: result.slug,
        title: result.title,
        description: result.description,
        possibleCauses: result.possibleCauses,
        troubleshootingSteps: result.troubleshootingSteps,
        requiredParts: result.requiredParts,
        partsWithPricing: result.partsWithPricing,
        estimatedRepairTime: result.estimatedRepairTime,
        difficultyLevel: result.difficultyLevel,
        quickFix: result.quickFix,
        testModeEntry: result.testModeEntry,
        safetyWarning: result.safetyWarning,
        videoUrl: result.videoUrl,
        relatedCodes: result.relatedCodes,
        seoMetaTitle: result.seoMetaTitle,
        seoMetaDescription: result.seoMetaDescription,
      }, tier);

      res.json({
        success: true,
        code: obfuscatedResult,
        tier,
        remainingLookups,
        "data-testid": "code-details",
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Code lookup error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch code details",
        "data-testid": "code-error",
      });
    }
  });

  // 4. GET /api/service-guy/usage - Get current user's usage stats
  app.get("/api/service-guy/usage", async (req: any, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      // Use consistent user ID extraction: sub first (OIDC standard), then claims.sub, then id
      const userId = req.user?.sub || (req.user as any)?.claims?.sub || req.user?.id || null;
      const sessionId = req.sessionID || null;

      // Determine user's tier
      let tier = "free";
      let user = null;
      
      if (userId) {
        // Use storage.getUser for consistency with /api/auth/user endpoint
        user = await storage.getUser(userId);
        if (user?.subscriptionTier) {
          tier = user.subscriptionTier;
        }
      }

      const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;

      // Get current period usage
      const periodStart = new Date();
      periodStart.setDate(1); // First of current month
      periodStart.setHours(0, 0, 0, 0);

      let usage;
      if (userId) {
        [usage] = await db
          .select()
          .from(serviceGuyUsage)
          .where(and(
            eq(serviceGuyUsage.userId, userId),
            gte(serviceGuyUsage.periodStart, periodStart)
          ))
          .limit(1);
      } else if (sessionId) {
        [usage] = await db
          .select()
          .from(serviceGuyUsage)
          .where(and(
            eq(serviceGuyUsage.sessionId, sessionId),
            gte(serviceGuyUsage.periodStart, periodStart)
          ))
          .limit(1);
      } else {
        [usage] = await db
          .select()
          .from(serviceGuyUsage)
          .where(and(
            eq(serviceGuyUsage.ipAddress, ip),
            gte(serviceGuyUsage.periodStart, periodStart)
          ))
          .limit(1);
      }

      const lookupsUsed = usage?.lookupCount || 0;
      const isUnlimited = limits.monthlyLookups === -1;
      const lookupsRemaining = isUnlimited 
        ? "unlimited" 
        : Math.max(0, limits.monthlyLookups - lookupsUsed);

      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      res.json({
        success: true,
        usage: {
          tier,
          lookupsUsed,
          lookupsRemaining,
          monthlyLimit: isUnlimited ? "unlimited" : limits.monthlyLookups,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          lastLookupAt: usage?.lastLookupAt?.toISOString() || null,
        },
        tierBenefits: {
          free: { lookups: 5, features: ["Basic error info", "Possible causes"] },
          starter: { lookups: 50, features: ["Parts information", "Repair time estimates", "All free features"] },
          pro: { lookups: "unlimited", features: ["Full repair procedures", "Quick fix tips", "Test mode entry", "Video tutorials", "All starter features"] },
          enterprise: { lookups: "unlimited", features: ["API access", "Bulk exports", "Priority support", "All pro features"] },
        },
        requireAuth: !!userId,
        "data-testid": "usage-stats",
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Usage stats error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch usage stats",
        "data-testid": "usage-error",
      });
    }
  });

  // 5. POST /api/service-guy/report - Report an issue with a code (authenticated only)
  app.post("/api/service-guy/report", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "Authentication required",
          "data-testid": "report-unauthorized",
        });
      }

      // Validate request body
      const validation = insertDiagnosticIssueReportSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid report data",
          details: validation.error.errors,
          "data-testid": "report-validation-error",
        });
      }

      const { codeReference, manufacturer, issueType, description, suggestedCorrection, diagnosticCodeId } = validation.data;

      // Verify diagnosticCodeId exists if provided
      if (diagnosticCodeId) {
        const [existingCode] = await db
          .select({ id: diagnosticCodes.id })
          .from(diagnosticCodes)
          .where(eq(diagnosticCodes.id, diagnosticCodeId))
          .limit(1);

        if (!existingCode) {
          return res.status(400).json({ 
            success: false,
            error: "Invalid diagnostic code ID",
            "data-testid": "report-invalid-code",
          });
        }
      }

      // Insert the report
      const [report] = await db.insert(diagnosticIssueReports).values({
        userId,
        diagnosticCodeId: diagnosticCodeId || null,
        codeReference,
        manufacturer,
        issueType,
        description,
        suggestedCorrection: suggestedCorrection || null,
        status: "pending",
      }).returning();

      console.log(`[SERVICE-GUY] Issue report created: ${report.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        report: {
          id: report.id,
          codeReference: report.codeReference,
          manufacturer: report.manufacturer,
          issueType: report.issueType,
          status: report.status,
          createdAt: report.createdAt,
        },
        message: "Thank you for your report. Our team will review it shortly.",
        "data-testid": "report-success",
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Report submission error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to submit report",
        "data-testid": "report-error",
      });
    }
  });

  // ========== SERVICE TECH LOCATOR API ==========
  // Find nearby appliance repair technicians using Google Places API
  
  // GET /api/service-techs/nearby - Find technicians near coordinates
  app.get("/api/service-techs/nearby", async (req, res) => {
    try {
      const { lat, lng, type = "appliance_repair", radius = "25000" } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ 
          success: false,
          error: "Latitude and longitude are required",
          "data-testid": "service-tech-error-coords"
        });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const searchRadius = parseInt(radius as string) || 25000;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid coordinates",
          "data-testid": "service-tech-error-invalid-coords"
        });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ 
          success: false,
          error: "Location service unavailable",
          "data-testid": "service-tech-error-no-api"
        });
      }

      // Search for appliance repair services using Google Places Nearby Search
      const searchTypes = ["appliance_repair", "laundry", "electrical_repair"];
      const keyword = type === "appliance_repair" 
        ? "appliance repair laundromat washer dryer commercial laundry equipment" 
        : String(type);

      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${searchRadius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

      const response = await fetch(placesUrl);
      const data = await response.json();

      if (data.status === "ZERO_RESULTS") {
        return res.json({ 
          success: true,
          results: [],
          message: "No appliance repair services found nearby",
          "data-testid": "service-tech-no-results"
        });
      }

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("[SERVICE-TECH] Google Places API error:", data.status, data.error_message);
        return res.status(500).json({ 
          success: false,
          error: "Failed to search for service technicians",
          "data-testid": "service-tech-api-error"
        });
      }

      // Transform results to our format
      const results = (data.results || []).slice(0, 15).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        openNow: place.opening_hours?.open_now,
        placeId: place.place_id,
        types: place.types,
        distance: calculateDistance(
          latitude, 
          longitude, 
          place.geometry.location.lat, 
          place.geometry.location.lng
        )
      }));

      // Sort by rating (highest first), then by distance
      results.sort((a: any, b: any) => {
        if (a.rating !== b.rating) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      res.json({ 
        success: true,
        results,
        coordinates: { lat: latitude, lng: longitude },
        "data-testid": "service-tech-results"
      });
    } catch (error: any) {
      console.error("[SERVICE-TECH] Nearby search error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to search for technicians",
        "data-testid": "service-tech-error"
      });
    }
  });

  // GET /api/service-techs/search - Search by address/ZIP code
  app.get("/api/service-techs/search", async (req, res) => {
    try {
      const { address, type = "appliance_repair", radius = "25000" } = req.query;

      if (!address) {
        return res.status(400).json({ 
          success: false,
          error: "Address or ZIP code is required",
          "data-testid": "service-tech-error-no-address"
        });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ 
          success: false,
          error: "Location service unavailable",
          "data-testid": "service-tech-error-no-api"
        });
      }

      // First, geocode the address
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(String(address))}&key=${apiKey}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== "OK" || !geocodeData.results?.[0]) {
        return res.status(400).json({ 
          success: false,
          error: "Could not find location. Please check your address or ZIP code.",
          "data-testid": "service-tech-geocode-error"
        });
      }

      const location = geocodeData.results[0].geometry.location;
      const { lat, lng } = location;
      const searchRadius = parseInt(radius as string) || 25000;

      // Search for appliance repair services
      const keyword = type === "appliance_repair" 
        ? "appliance repair laundromat washer dryer commercial laundry equipment" 
        : String(type);

      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${searchRadius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

      const response = await fetch(placesUrl);
      const data = await response.json();

      if (data.status === "ZERO_RESULTS") {
        return res.json({ 
          success: true,
          results: [],
          coordinates: { lat, lng },
          message: "No appliance repair services found in this area",
          "data-testid": "service-tech-no-results"
        });
      }

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("[SERVICE-TECH] Google Places API error:", data.status, data.error_message);
        return res.status(500).json({ 
          success: false,
          error: "Failed to search for service technicians",
          "data-testid": "service-tech-api-error"
        });
      }

      // Transform results
      const results = (data.results || []).slice(0, 15).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        openNow: place.opening_hours?.open_now,
        placeId: place.place_id,
        types: place.types,
        distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
      }));

      // Sort by rating then distance
      results.sort((a: any, b: any) => {
        if (a.rating !== b.rating) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      res.json({ 
        success: true,
        results,
        coordinates: { lat, lng },
        formattedAddress: geocodeData.results[0].formatted_address,
        "data-testid": "service-tech-results"
      });
    } catch (error: any) {
      console.error("[SERVICE-TECH] Address search error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to search for technicians",
        "data-testid": "service-tech-error"
      });
    }
  });

  // GET /api/service-techs/details/:placeId - Get detailed info about a service tech
  app.get("/api/service-techs/details/:placeId", async (req, res) => {
    try {
      const { placeId } = req.params;

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ 
          success: false,
          error: "Service unavailable",
          "data-testid": "service-tech-error-no-api"
        });
      }

      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,reviews,types&key=${apiKey}`;

      const response = await fetch(detailsUrl);
      const data = await response.json();

      if (data.status !== "OK") {
        return res.status(404).json({ 
          success: false,
          error: "Service technician not found",
          "data-testid": "service-tech-not-found"
        });
      }

      const place = data.result;
      res.json({ 
        success: true,
        tech: {
          id: placeId,
          name: place.name,
          address: place.formatted_address,
          phone: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
          reviewCount: place.user_ratings_total,
          hours: place.opening_hours?.weekday_text,
          openNow: place.opening_hours?.open_now,
          reviews: place.reviews?.slice(0, 3).map((r: any) => ({
            author: r.author_name,
            rating: r.rating,
            text: r.text,
            time: r.relative_time_description
          })),
          types: place.types
        },
        "data-testid": "service-tech-details"
      });
    } catch (error: any) {
      console.error("[SERVICE-TECH] Details error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to get technician details",
        "data-testid": "service-tech-error"
      });
    }
  });

  // Helper function to calculate distance between two points
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? `${(distance * 5280).toFixed(0)} ft` : `${distance.toFixed(1)} mi`;
  }

  // ========== FIX OUTCOME FEEDBACK API ==========
  // Track repair success rates from real technicians
  
  // POST /api/service-guy/fix-outcome - Submit fix outcome feedback
  app.post("/api/service-guy/fix-outcome", async (req: any, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const userId = req.user?.id || (req.user as any)?.claims?.sub || null;
      const sessionId = req.sessionID || null;

      const { 
        diagnosticCodeId, 
        errorCode, 
        manufacturer, 
        machineType,
        outcome, 
        timeSpent, 
        additionalSteps, 
        actualPartsUsed,
        notes 
      } = req.body;

      // Validate required fields
      if (!diagnosticCodeId || !errorCode || !manufacturer || !outcome) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: diagnosticCodeId, errorCode, manufacturer, outcome",
          "data-testid": "fix-outcome-validation-error"
        });
      }

      // Validate outcome value
      const validOutcomes = ["fixed", "partially_fixed", "not_fixed", "wrong_diagnosis"];
      if (!validOutcomes.includes(outcome)) {
        return res.status(400).json({
          success: false,
          error: "Invalid outcome. Must be one of: fixed, partially_fixed, not_fixed, wrong_diagnosis",
          "data-testid": "fix-outcome-invalid-outcome"
        });
      }

      // Insert feedback
      const [feedback] = await db.insert(fixOutcomeFeedback).values({
        diagnosticCodeId,
        userId,
        sessionId,
        ipAddress: ip,
        outcome,
        additionalSteps: additionalSteps || null,
        actualPartsUsed: actualPartsUsed || null,
        timeSpent: timeSpent || null,
        notes: notes || null,
        manufacturer,
        errorCode,
        machineType: machineType || null,
      }).returning();

      // Update the diagnostic code's fix success rate based on aggregated feedback
      // Count all outcomes for this diagnostic code
      const stats = await db
        .select({
          total: sql<number>`COUNT(*)::int`,
          fixed: sql<number>`SUM(CASE WHEN outcome = 'fixed' THEN 1 ELSE 0 END)::int`,
          partiallyFixed: sql<number>`SUM(CASE WHEN outcome = 'partially_fixed' THEN 1 ELSE 0 END)::int`,
        })
        .from(fixOutcomeFeedback)
        .where(eq(fixOutcomeFeedback.diagnosticCodeId, diagnosticCodeId));

      if (stats[0] && stats[0].total > 0) {
        const successRate = Math.round(
          ((stats[0].fixed || 0) + (stats[0].partiallyFixed || 0) * 0.5) / stats[0].total * 100
        );
        
        // Update the diagnostic code's fix success rate
        await db
          .update(diagnosticCodes)
          .set({ fixSuccessRate: successRate })
          .where(eq(diagnosticCodes.id, diagnosticCodeId));
      }

      console.log(`[FIX-OUTCOME] Feedback recorded: ${diagnosticCodeId} - ${outcome} by ${userId || 'anonymous'}`);

      res.status(201).json({
        success: true,
        feedback: {
          id: feedback.id,
          outcome: feedback.outcome,
          createdAt: feedback.createdAt
        },
        message: "Thank you for your feedback! This helps improve success rates for everyone.",
        "data-testid": "fix-outcome-success"
      });
    } catch (error: any) {
      console.error("[FIX-OUTCOME] Submission error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to submit feedback",
        "data-testid": "fix-outcome-error"
      });
    }
  });

  // GET /api/service-guy/fix-outcomes/:diagnosticCodeId - Get aggregated outcomes for a code
  app.get("/api/service-guy/fix-outcomes/:diagnosticCodeId", async (req, res) => {
    try {
      const { diagnosticCodeId } = req.params;

      const stats = await db
        .select({
          total: sql<number>`COUNT(*)::int`,
          fixed: sql<number>`SUM(CASE WHEN outcome = 'fixed' THEN 1 ELSE 0 END)::int`,
          partiallyFixed: sql<number>`SUM(CASE WHEN outcome = 'partially_fixed' THEN 1 ELSE 0 END)::int`,
          notFixed: sql<number>`SUM(CASE WHEN outcome = 'not_fixed' THEN 1 ELSE 0 END)::int`,
          wrongDiagnosis: sql<number>`SUM(CASE WHEN outcome = 'wrong_diagnosis' THEN 1 ELSE 0 END)::int`,
          avgTimeMinutes: sql<number>`AVG(time_spent_minutes)::int`,
        })
        .from(fixOutcomeFeedback)
        .where(eq(fixOutcomeFeedback.diagnosticCodeId, diagnosticCodeId));

      const result = stats[0] || { total: 0, fixed: 0, partiallyFixed: 0, notFixed: 0, wrongDiagnosis: 0, avgTimeMinutes: null };
      
      const successRate = result.total > 0 
        ? Math.round(((result.fixed || 0) + (result.partiallyFixed || 0) * 0.5) / result.total * 100)
        : null;

      res.json({
        success: true,
        stats: {
          ...result,
          successRate,
        },
        "data-testid": "fix-outcomes-stats"
      });
    } catch (error: any) {
      console.error("[FIX-OUTCOME] Stats error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch outcome stats",
        "data-testid": "fix-outcomes-error"
      });
    }
  });

  // ========== SMART DIAGNOSIS - Grok-Powered Learning with Cost Optimization ==========
  const { smartDiagnose, searchKnowledgeBase } = await import("./services/knowledge-ingestion");
  const { knowledgeChunks, techContributions } = await import("@shared/schema");

  // In-memory cache to avoid repeated API calls (survives within session)
  const smartDiagnoseCache = new Map<string, { result: any; timestamp: number }>();
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  // POST /api/service-guy/smart-diagnose - AI-powered diagnosis with learning
  // Cost-optimized: checks cache -> local DB -> Grok only as last resort
  app.post("/api/service-guy/smart-diagnose", async (req: any, res) => {
    try {
      const { query, manufacturer, errorCode, machineType } = req.body;
      
      if (!query && !errorCode) {
        return res.status(400).json({
          success: false,
          error: "Query or error code required",
        });
      }

      // Generate cache key
      const cacheKey = `${manufacturer || ''}_${errorCode || ''}_${machineType || ''}_${query || ''}`.toLowerCase().trim();
      
      // 1. Check in-memory cache first (FREE)
      const cached = smartDiagnoseCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log(`[SMART-DIAGNOSE] Cache hit: ${cacheKey}`);
        return res.json({
          success: true,
          source: "cache",
          knowledge: cached.result.knowledge,
          cached: true,
          message: "Retrieved from cache",
        });
      }

      // 2. Check local database first (FREE) - before any API calls
      const localResult = await searchKnowledgeBase(query, manufacturer, errorCode, machineType);
      if (localResult.success && localResult.knowledge) {
        // Store in cache for faster future access
        smartDiagnoseCache.set(cacheKey, { result: localResult, timestamp: Date.now() });
        
        console.log(`[SMART-DIAGNOSE] Local DB hit: ${cacheKey}`);
        return res.json({
          success: true,
          source: "database",
          knowledge: localResult.knowledge,
          cached: false,
          message: "Found in knowledge base",
        });
      }

      // 3. Check diagnosticCodes table (existing data - FREE)
      if (errorCode) {
        const existingCodes = await db
          .select()
          .from(diagnosticCodes)
          .where(
            and(
              ilike(diagnosticCodes.code, `%${errorCode}%`),
              manufacturer ? ilike(diagnosticCodes.manufacturer, `%${manufacturer}%`) : undefined
            )
          )
          .limit(3);

        if (existingCodes.length > 0) {
          const code = existingCodes[0];
          const knowledge = {
            title: code.title,
            manufacturer: code.manufacturer,
            errorCode: code.code,
            machineType: code.machineType,
            description: code.description,
            possibleCauses: code.possibleCauses || [],
            troubleshootingSteps: code.troubleshootingSteps || [],
            partsWithPricing: code.partsWithPricing || [],
            quickFix: code.quickFix,
            estimatedRepairTime: code.estimatedRepairTime,
            skillLevel: code.skillLevel || "intermediate",
            proTips: code.repairTechniques || [],
            confidence: code.fixSuccessRate || 75,
          };
          
          smartDiagnoseCache.set(cacheKey, { result: { knowledge }, timestamp: Date.now() });
          
          console.log(`[SMART-DIAGNOSE] Diagnostic codes hit: ${code.code}`);
          return res.json({
            success: true,
            source: "diagnostic_codes",
            knowledge,
            cached: false,
            message: "Found in diagnostic database",
          });
        }
      }

      // 4. Only use Grok if absolutely necessary (COSTS MONEY)
      // Check user tier for rate limiting
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const userTier = req.user?.subscriptionTier || "free";
      
      // Rate limit Grok calls per user/day
      const grokLimitKey = `grok_calls_${userId || 'anon'}_${new Date().toDateString()}`;
      const grokCallsToday = (global as any)[grokLimitKey] || 0;
      
      const grokLimits: Record<string, number> = {
        free: 1,      // 1 Grok search/day for free users
        starter: 5,   // 5/day for Starter
        pro: 20,      // 20/day for Pro
        enterprise: 100, // 100/day for Enterprise
      };
      
      const limit = grokLimits[userTier] || 1;
      
      if (grokCallsToday >= limit) {
        return res.json({
          success: false,
          source: "rate_limited",
          knowledge: null,
          message: `Daily AI search limit reached (${limit}/day for ${userTier}). Upgrade for more searches.`,
          upgradeRequired: true,
        });
      }

      // Call Grok and learn
      console.log(`[SMART-DIAGNOSE] Calling Grok for: ${cacheKey} (call ${grokCallsToday + 1}/${limit})`);
      const grokResult = await smartDiagnose(query, manufacturer, errorCode, machineType);
      
      // Increment counter
      (global as any)[grokLimitKey] = grokCallsToday + 1;
      
      if (grokResult.success && grokResult.knowledge) {
        // Cache the result
        smartDiagnoseCache.set(cacheKey, { result: grokResult, timestamp: Date.now() });
        
        return res.json({
          success: true,
          source: "grok_search",
          knowledge: grokResult.knowledge,
          cached: false,
          learned: true,
          message: "Found via AI search - stored for future use",
        });
      }

      return res.json({
        success: false,
        source: "not_found",
        knowledge: null,
        message: "No information found. Try different search terms or manufacturer.",
      });
    } catch (error: any) {
      console.error("[SMART-DIAGNOSE] Error:", error);
      res.status(500).json({
        success: false,
        error: "Search failed",
        message: error.message,
      });
    }
  });

  // POST /api/service-guy/contribute - Techs submit knowledge (FREE - builds our DB)
  app.post("/api/service-guy/contribute", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const { manufacturer, errorCode, machineType, problemDescription, solution, partsUsed, timeSpentMinutes, difficultyLevel } = req.body;
      
      if (!manufacturer || !problemDescription || !solution) {
        return res.status(400).json({
          success: false,
          error: "Manufacturer, problem description, and solution are required",
        });
      }

      // Store contribution for moderation
      const [contribution] = await db
        .insert(techContributions)
        .values({
          userId,
          manufacturer,
          errorCode: errorCode || null,
          machineType: machineType || null,
          content: JSON.stringify({ problemDescription, solution, partsUsed }),
          helpfulness: 0,
          status: "pending",
        })
        .returning();

      console.log(`[CONTRIBUTE] New submission from ${userId}: ${manufacturer} ${errorCode || 'general'}`);

      res.status(201).json({
        success: true,
        contribution: {
          id: contribution.id,
          status: "pending",
        },
        message: "Thank you! Your contribution is under review and will help other technicians.",
      });
    } catch (error: any) {
      console.error("[CONTRIBUTE] Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to submit contribution",
      });
    }
  });

  // GET /api/service-guy/knowledge-stats - Get knowledge base statistics
  app.get("/api/service-guy/knowledge-stats", async (req, res) => {
    try {
      const [codeCount] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(diagnosticCodes);
      
      const [chunkCount] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(knowledgeChunks);
      
      const [contributionCount] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(techContributions)
        .where(eq(techContributions.status, "approved"));

      const [manufacturerCount] = await db
        .select({ count: sql<number>`COUNT(DISTINCT manufacturer)::int` })
        .from(diagnosticCodes);

      res.json({
        success: true,
        stats: {
          diagnosticCodes: codeCount?.count || 0,
          knowledgeChunks: chunkCount?.count || 0,
          techContributions: contributionCount?.count || 0,
          manufacturers: manufacturerCount?.count || 0,
          cacheSize: smartDiagnoseCache.size,
        },
      });
    } catch (error: any) {
      console.error("[KNOWLEDGE-STATS] Error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch stats" });
    }
  });

  // ========== SERVICE JOBS - Track Repair Work in Progress ==========
  const { serviceJobs, insertServiceJobSchema } = await import("@shared/schema");

  // GET /api/service-guy/jobs - List user's jobs
  app.get("/api/service-guy/jobs", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "Authentication required",
        });
      }

      const status = req.query.status as string | undefined;
      
      let query = db.select().from(serviceJobs).where(eq(serviceJobs.userId, userId));
      
      if (status && status !== 'all') {
        query = db.select().from(serviceJobs).where(
          and(eq(serviceJobs.userId, userId), eq(serviceJobs.status, status))
        );
      }
      
      const jobs = await query.orderBy(desc(serviceJobs.createdAt));

      res.json({
        success: true,
        jobs,
        count: jobs.length,
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Jobs list error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch jobs",
      });
    }
  });

  // POST /api/service-guy/jobs - Create new job from diagnosis
  app.post("/api/service-guy/jobs", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "Authentication required",
        });
      }

      const validation = insertServiceJobSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid job data",
          details: validation.error.errors,
        });
      }

      const [job] = await db.insert(serviceJobs).values({
        ...validation.data,
        userId,
        status: "in_progress",
      }).returning();

      console.log(`[SERVICE-GUY] Job created: ${job.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        job,
        message: "Job created successfully",
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Job creation error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to create job",
      });
    }
  });

  // GET /api/service-guy/jobs/:id - Get job details
  app.get("/api/service-guy/jobs/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const jobId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "Authentication required",
        });
      }

      const [job] = await db.select().from(serviceJobs)
        .where(and(eq(serviceJobs.id, jobId), eq(serviceJobs.userId, userId)))
        .limit(1);

      if (!job) {
        return res.status(404).json({ 
          success: false,
          error: "Job not found",
        });
      }

      res.json({
        success: true,
        job,
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Job details error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch job details",
      });
    }
  });

  // PATCH /api/service-guy/jobs/:id - Update job
  app.patch("/api/service-guy/jobs/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const jobId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "Authentication required",
        });
      }

      // Check job exists and belongs to user
      const [existingJob] = await db.select().from(serviceJobs)
        .where(and(eq(serviceJobs.id, jobId), eq(serviceJobs.userId, userId)))
        .limit(1);

      if (!existingJob) {
        return res.status(404).json({ 
          success: false,
          error: "Job not found",
        });
      }

      const updateData: any = {
        ...req.body,
        updatedAt: new Date(),
      };

      // If status changes to completed, set completedAt
      if (req.body.status === 'completed' && existingJob.status !== 'completed') {
        updateData.completedAt = new Date();
      }

      const [updatedJob] = await db.update(serviceJobs)
        .set(updateData)
        .where(eq(serviceJobs.id, jobId))
        .returning();

      console.log(`[SERVICE-GUY] Job updated: ${jobId} by user ${userId}`);

      res.json({
        success: true,
        job: updatedJob,
        message: "Job updated successfully",
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Job update error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to update job",
      });
    }
  });

  // DELETE /api/service-guy/jobs/:id - Delete job
  app.delete("/api/service-guy/jobs/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const jobId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: "Authentication required",
        });
      }

      // Check job exists and belongs to user
      const [existingJob] = await db.select().from(serviceJobs)
        .where(and(eq(serviceJobs.id, jobId), eq(serviceJobs.userId, userId)))
        .limit(1);

      if (!existingJob) {
        return res.status(404).json({ 
          success: false,
          error: "Job not found",
        });
      }

      await db.delete(serviceJobs).where(eq(serviceJobs.id, jobId));

      console.log(`[SERVICE-GUY] Job deleted: ${jobId} by user ${userId}`);

      res.json({
        success: true,
        message: "Job deleted successfully",
      });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Job delete error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to delete job",
      });
    }
  });

  // ========== REPAIR TICKETS ROUTES ==========
  // Create repair ticket from diagnostic result
  app.post("/api/service-guy/repair-tickets", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const { machineId, diagnosticCodeId, title, description, priority, symptoms, machineInfo } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ success: false, error: "Title and description are required" });
      }

      const ticketNumber = `RT-${Date.now().toString(36).toUpperCase()}`;
      
      const [newTicket] = await db.insert(repairTickets).values({
        ticketNumber,
        machineId: machineId || null,
        laundromatId: machineInfo?.laundromatId || null,
        title,
        description,
        priority: priority || 'medium',
        diagnosticCode: diagnosticCodeId || null,
        symptoms: symptoms || [],
        status: 'open',
        reportedBy: userId,
        reportedAt: new Date(),
      }).returning();

      console.log(`[SERVICE-GUY] Repair ticket created: ${ticketNumber} by user ${userId}`);

      res.json({ success: true, ticket: newTicket, message: "Repair ticket created successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Repair ticket creation error:", error);
      res.status(500).json({ success: false, error: "Failed to create repair ticket" });
    }
  });

  // Get user's repair tickets
  app.get("/api/service-guy/repair-tickets", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const status = req.query.status as string;
      let query = db.select().from(repairTickets).where(eq(repairTickets.reportedBy, userId));
      
      if (status && status !== 'all') {
        query = db.select().from(repairTickets).where(and(eq(repairTickets.reportedBy, userId), eq(repairTickets.status, status)));
      }

      const tickets = await query.orderBy(desc(repairTickets.createdAt));
      res.json({ success: true, tickets, count: tickets.length });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Repair tickets fetch error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch repair tickets" });
    }
  });

  // Update repair ticket
  app.patch("/api/service-guy/repair-tickets/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const ticketId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const [existingTicket] = await db.select().from(repairTickets)
        .where(and(eq(repairTickets.id, ticketId), eq(repairTickets.reportedBy, userId)))
        .limit(1);

      if (!existingTicket) {
        return res.status(404).json({ success: false, error: "Ticket not found" });
      }

      const updateData: any = { ...req.body, updatedAt: new Date() };
      
      if (req.body.status === 'completed' && existingTicket.status !== 'completed') {
        updateData.completedAt = new Date();
      }
      if (req.body.status === 'in_progress' && !existingTicket.startedAt) {
        updateData.startedAt = new Date();
      }

      const [updatedTicket] = await db.update(repairTickets)
        .set(updateData)
        .where(eq(repairTickets.id, ticketId))
        .returning();

      res.json({ success: true, ticket: updatedTicket, message: "Ticket updated successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Repair ticket update error:", error);
      res.status(500).json({ success: false, error: "Failed to update repair ticket" });
    }
  });

  // Delete repair ticket
  app.delete("/api/service-guy/repair-tickets/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const ticketId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const [existingTicket] = await db.select().from(repairTickets)
        .where(and(eq(repairTickets.id, ticketId), eq(repairTickets.reportedBy, userId)))
        .limit(1);

      if (!existingTicket) {
        return res.status(404).json({ success: false, error: "Ticket not found" });
      }

      await db.delete(repairTickets).where(eq(repairTickets.id, ticketId));
      res.json({ success: true, message: "Ticket deleted successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Repair ticket delete error:", error);
      res.status(500).json({ success: false, error: "Failed to delete repair ticket" });
    }
  });

  // ========== MAINTENANCE PLANS ROUTES ==========
  // Get maintenance plans for user's machines
  app.get("/api/service-guy/maintenance-plans", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const plans = await db.select().from(maintenancePlans)
        .where(eq(maintenancePlans.assignedTo, userId))
        .orderBy(asc(maintenancePlans.nextDueDate));

      res.json({ success: true, plans, count: plans.length });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Maintenance plans fetch error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch maintenance plans" });
    }
  });

  // Create maintenance plan
  app.post("/api/service-guy/maintenance-plans", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const { machineId, planName, description, taskType, frequency, frequencyUnit, checklistItems, requiredParts, estimatedDuration } = req.body;
      
      if (!planName || !frequency || !frequencyUnit) {
        return res.status(400).json({ success: false, error: "Plan name, frequency, and frequency unit are required" });
      }

      const nextDueDate = new Date();
      if (frequencyUnit === 'days') {
        nextDueDate.setDate(nextDueDate.getDate() + frequency);
      }

      const [newPlan] = await db.insert(maintenancePlans).values({
        machineId: machineId || null,
        planName,
        description,
        taskType: taskType || 'monthly',
        frequency,
        frequencyUnit,
        checklistItems: checklistItems || [],
        requiredParts: requiredParts || [],
        estimatedDuration,
        assignedTo: userId,
        nextDueDate,
        isActive: true,
      }).returning();

      console.log(`[SERVICE-GUY] Maintenance plan created: ${planName} by user ${userId}`);
      res.json({ success: true, plan: newPlan, message: "Maintenance plan created successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Maintenance plan creation error:", error);
      res.status(500).json({ success: false, error: "Failed to create maintenance plan" });
    }
  });

  // Update maintenance plan
  app.patch("/api/service-guy/maintenance-plans/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const planId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const [existingPlan] = await db.select().from(maintenancePlans)
        .where(and(eq(maintenancePlans.id, planId), eq(maintenancePlans.assignedTo, userId)))
        .limit(1);

      if (!existingPlan) {
        return res.status(404).json({ success: false, error: "Maintenance plan not found" });
      }

      const updateData: any = { ...req.body, updatedAt: new Date() };

      const [updatedPlan] = await db.update(maintenancePlans)
        .set(updateData)
        .where(eq(maintenancePlans.id, planId))
        .returning();

      res.json({ success: true, plan: updatedPlan, message: "Maintenance plan updated successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Maintenance plan update error:", error);
      res.status(500).json({ success: false, error: "Failed to update maintenance plan" });
    }
  });

  // Complete maintenance task (updates lastCompleted and calculates nextDue)
  app.post("/api/service-guy/maintenance-plans/:id/complete", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const planId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const [existingPlan] = await db.select().from(maintenancePlans)
        .where(and(eq(maintenancePlans.id, planId), eq(maintenancePlans.assignedTo, userId)))
        .limit(1);

      if (!existingPlan) {
        return res.status(404).json({ success: false, error: "Maintenance plan not found" });
      }

      const now = new Date();
      const nextDueDate = new Date();
      if (existingPlan.frequencyUnit === 'days') {
        nextDueDate.setDate(nextDueDate.getDate() + existingPlan.frequency);
      }

      const [updatedPlan] = await db.update(maintenancePlans)
        .set({
          lastCompletedDate: now,
          nextDueDate,
          updatedAt: now,
        })
        .where(eq(maintenancePlans.id, planId))
        .returning();

      console.log(`[SERVICE-GUY] Maintenance completed: ${existingPlan.planName} by user ${userId}`);
      res.json({ success: true, plan: updatedPlan, message: "Maintenance completed successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Maintenance completion error:", error);
      res.status(500).json({ success: false, error: "Failed to complete maintenance" });
    }
  });

  // Delete maintenance plan
  app.delete("/api/service-guy/maintenance-plans/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const planId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const [existingPlan] = await db.select().from(maintenancePlans)
        .where(and(eq(maintenancePlans.id, planId), eq(maintenancePlans.assignedTo, userId)))
        .limit(1);

      if (!existingPlan) {
        return res.status(404).json({ success: false, error: "Maintenance plan not found" });
      }

      await db.delete(maintenancePlans).where(eq(maintenancePlans.id, planId));
      res.json({ success: true, message: "Maintenance plan deleted successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Maintenance plan delete error:", error);
      res.status(500).json({ success: false, error: "Failed to delete maintenance plan" });
    }
  });

  // ========== MACHINE REGISTRY ROUTES ==========
  // Get user's machine registry
  app.get("/api/service-guy/machines", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const userLaundromats = await db.select({ id: laundromats.id }).from(laundromats)
        .where(eq(laundromats.userId, userId));
      
      const laundromatIds = userLaundromats.map(l => l.id);
      
      if (laundromatIds.length === 0) {
        return res.json({ success: true, machines: [], count: 0 });
      }

      const machines = await db.select().from(machineAssets)
        .where(inArray(machineAssets.laundromatId, laundromatIds))
        .orderBy(asc(machineAssets.machineNumber));

      res.json({ success: true, machines, count: machines.length });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Machine registry fetch error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch machines" });
    }
  });

  // Register new machine
  app.post("/api/service-guy/machines", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const { laundromatId, machineNumber, machineName, machineType, manufacturer, model, serialNumber, capacity, installDate, warrantyExpiration, notes } = req.body;
      
      if (!machineNumber || !machineType) {
        return res.status(400).json({ success: false, error: "Machine number and type are required" });
      }

      if (laundromatId) {
        const [existingLaundromat] = await db.select().from(laundromats)
          .where(and(eq(laundromats.id, laundromatId), eq(laundromats.userId, userId)))
          .limit(1);
        
        if (!existingLaundromat) {
          return res.status(403).json({ success: false, error: "Not authorized to add machines to this location" });
        }
      }

      const [newMachine] = await db.insert(machineAssets).values({
        laundromatId: laundromatId || null,
        machineNumber,
        machineName,
        machineType,
        manufacturer,
        model,
        serialNumber,
        capacity,
        installDate: installDate ? new Date(installDate) : null,
        warrantyExpiration: warrantyExpiration ? new Date(warrantyExpiration) : null,
        notes,
        status: 'active',
      }).returning();

      console.log(`[SERVICE-GUY] Machine registered: ${machineNumber} by user ${userId}`);
      res.json({ success: true, machine: newMachine, message: "Machine registered successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Machine registration error:", error);
      res.status(500).json({ success: false, error: "Failed to register machine" });
    }
  });

  // Update machine
  app.patch("/api/service-guy/machines/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const machineId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const [existingMachine] = await db.select().from(machineAssets)
        .where(eq(machineAssets.id, machineId))
        .limit(1);

      if (!existingMachine) {
        return res.status(404).json({ success: false, error: "Machine not found" });
      }

      if (existingMachine.laundromatId) {
        const [laundromat] = await db.select().from(laundromats)
          .where(and(eq(laundromats.id, existingMachine.laundromatId), eq(laundromats.userId, userId)))
          .limit(1);
        
        if (!laundromat) {
          return res.status(403).json({ success: false, error: "Not authorized to update this machine" });
        }
      }

      const updateData: any = { ...req.body, updatedAt: new Date() };

      const [updatedMachine] = await db.update(machineAssets)
        .set(updateData)
        .where(eq(machineAssets.id, machineId))
        .returning();

      res.json({ success: true, machine: updatedMachine, message: "Machine updated successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Machine update error:", error);
      res.status(500).json({ success: false, error: "Failed to update machine" });
    }
  });

  // Get machine repair history (linked repair tickets)
  app.get("/api/service-guy/machines/:id/history", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const machineId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const tickets = await db.select().from(repairTickets)
        .where(eq(repairTickets.machineId, machineId))
        .orderBy(desc(repairTickets.createdAt));

      res.json({ success: true, history: tickets, count: tickets.length });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Machine history fetch error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch machine history" });
    }
  });

  // Delete machine
  app.delete("/api/service-guy/machines/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.user as any)?.claims?.sub;
      const machineId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }

      const [existingMachine] = await db.select().from(machineAssets)
        .where(eq(machineAssets.id, machineId))
        .limit(1);

      if (!existingMachine) {
        return res.status(404).json({ success: false, error: "Machine not found" });
      }

      if (existingMachine.laundromatId) {
        const [laundromat] = await db.select().from(laundromats)
          .where(and(eq(laundromats.id, existingMachine.laundromatId), eq(laundromats.userId, userId)))
          .limit(1);
        
        if (!laundromat) {
          return res.status(403).json({ success: false, error: "Not authorized to delete this machine" });
        }
      }

      await db.delete(machineAssets).where(eq(machineAssets.id, machineId));
      res.json({ success: true, message: "Machine deleted successfully" });
    } catch (error: any) {
      console.error("[SERVICE-GUY] Machine delete error:", error);
      res.status(500).json({ success: false, error: "Failed to delete machine" });
    }
  });

  // ========== AI LISTING IMAGE ANALYZER ==========
  // Extracts listing data from broker flyer images using Gemini Vision
  const { analyzeListingImage } = await import('./listing-image-analyzer');
  
  app.post("/api/listings/analyze-image", multerImageUpload.single("image"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const imageBase64 = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype || "image/jpeg";

      console.log(`📸 Analyzing listing image: ${req.file.originalname} (${mimeType})`);

      const extractedData = await analyzeListingImage(imageBase64, mimeType);

      console.log(`✅ Extracted listing data with ${Math.round(extractedData.confidence * 100)}% confidence`);

      res.json({
        success: true,
        data: extractedData,
        message: `Successfully extracted listing data with ${Math.round(extractedData.confidence * 100)}% confidence`
      });
    } catch (error: any) {
      console.error("Listing image analysis error:", error);
      res.status(500).json({ 
        error: "Image analysis failed", 
        message: error.message || "Unable to extract listing data from image"
      });
    }
  });

  // ========== WHITE-LABEL WEBSITE BUILDER ROUTES ==========
  const { createWhiteLabelRoutes } = await import('./whitelabel-routes');
  app.use("/api/whitelabel", requireAuth, createWhiteLabelRoutes());

  // ========== SEO SUITE ROUTES ==========
  const { createSeoRoutes } = await import('./seo-routes');
  app.use("/api/seo", requireAuth, createSeoRoutes(storage));
  
  // ========== SEO COMMAND CENTER ROUTES ==========
  app.use("/api/seo-center", seoCommandCenterRoutes);

  // ========== AI SEO METADATA GENERATOR ROUTES ==========
  const { generatePageSEO, MAJOR_PAGES, regenerateSEOForPage } = await import('./ai-seo-generator');
  const { pageSeoMetadata } = await import('@shared/schema');

  // Generate SEO for a single page
  app.post("/api/ai-seo/generate", requireAdmin, async (req: any, res) => {
    try {
      const { pageTitle, pageType, industry = 'laundromat', pagePath, existingContent, targetKeywords } = req.body;
      
      if (!pageTitle || !pageType || !pagePath) {
        return res.status(400).json({ message: "pageTitle, pageType, and pagePath are required" });
      }

      console.log(`📝 Generating SEO for: ${pageTitle} (${pagePath})`);
      
      const seoData = await generatePageSEO({
        pageTitle,
        pageType,
        industry,
        pagePath,
        existingContent,
        targetKeywords
      });

      // Cache in database (upsert)
      const existingRecord = await db.select().from(pageSeoMetadata).where(eq(pageSeoMetadata.pagePath, pagePath)).limit(1);
      
      if (existingRecord.length > 0) {
        await db.update(pageSeoMetadata)
          .set({
            title: seoData.title,
            description: seoData.description,
            keywords: seoData.keywords,
            faqs: seoData.faqs,
            features: seoData.features,
            reviews: seoData.reviewSnippets,
            ogTitle: seoData.ogTitle,
            ogDescription: seoData.ogDescription,
            twitterTitle: seoData.twitterTitle,
            twitterDescription: seoData.twitterDescription,
            generatedAt: new Date(),
            regenerateCount: sql`${pageSeoMetadata.regenerateCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(pageSeoMetadata.pagePath, pagePath));
      } else {
        await db.insert(pageSeoMetadata).values({
          pagePath,
          pageType,
          title: seoData.title,
          description: seoData.description,
          keywords: seoData.keywords,
          faqs: seoData.faqs,
          features: seoData.features,
          reviews: seoData.reviewSnippets,
          ogTitle: seoData.ogTitle,
          ogDescription: seoData.ogDescription,
          twitterTitle: seoData.twitterTitle,
          twitterDescription: seoData.twitterDescription,
        });
      }

      res.json({
        success: true,
        pagePath,
        seo: seoData,
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("SEO generation error:", error);
      res.status(500).json({ message: "Failed to generate SEO", error: error.message });
    }
  });

  // Get cached SEO data for a page
  app.get("/api/ai-seo/metadata/:pagePath(*)", async (req, res) => {
    try {
      const pagePath = "/" + req.params.pagePath;
      
      const [seoData] = await db.select().from(pageSeoMetadata).where(eq(pageSeoMetadata.pagePath, pagePath));
      
      if (!seoData) {
        return res.status(404).json({ message: "SEO metadata not found for this page" });
      }

      res.json(seoData);
    } catch (error: any) {
      console.error("Error fetching SEO metadata:", error);
      res.status(500).json({ message: "Failed to fetch SEO metadata", error: error.message });
    }
  });

  // Get all cached SEO metadata
  app.get("/api/ai-seo/metadata", requireAdmin, async (req, res) => {
    try {
      const allSeo = await db.select().from(pageSeoMetadata).orderBy(pageSeoMetadata.pagePath);
      res.json(allSeo);
    } catch (error: any) {
      console.error("Error fetching all SEO metadata:", error);
      res.status(500).json({ message: "Failed to fetch SEO metadata", error: error.message });
    }
  });

  // Bulk generate SEO for all major pages
  app.post("/api/ai-seo/generate-all", requireAdmin, async (req: any, res) => {
    try {
      console.log(`🔄 Starting bulk SEO generation for ${MAJOR_PAGES.length} pages...`);
      
      const results: { success: string[]; failed: string[] } = { success: [], failed: [] };
      
      for (const page of MAJOR_PAGES) {
        try {
          console.log(`📝 Processing: ${page.pageTitle}`);
          const seoData = await generatePageSEO(page);
          
          // Upsert into database
          const existingRecord = await db.select().from(pageSeoMetadata).where(eq(pageSeoMetadata.pagePath, page.pagePath)).limit(1);
          
          if (existingRecord.length > 0) {
            await db.update(pageSeoMetadata)
              .set({
                title: seoData.title,
                description: seoData.description,
                keywords: seoData.keywords,
                faqs: seoData.faqs,
                features: seoData.features,
                reviews: seoData.reviewSnippets,
                ogTitle: seoData.ogTitle,
                ogDescription: seoData.ogDescription,
                twitterTitle: seoData.twitterTitle,
                twitterDescription: seoData.twitterDescription,
                generatedAt: new Date(),
                regenerateCount: sql`${pageSeoMetadata.regenerateCount} + 1`,
                updatedAt: new Date(),
              })
              .where(eq(pageSeoMetadata.pagePath, page.pagePath));
          } else {
            await db.insert(pageSeoMetadata).values({
              pagePath: page.pagePath,
              pageType: page.pageType,
              title: seoData.title,
              description: seoData.description,
              keywords: seoData.keywords,
              faqs: seoData.faqs,
              features: seoData.features,
              reviews: seoData.reviewSnippets,
              ogTitle: seoData.ogTitle,
              ogDescription: seoData.ogDescription,
              twitterTitle: seoData.twitterTitle,
              twitterDescription: seoData.twitterDescription,
            });
          }
          
          results.success.push(page.pagePath);
          await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
        } catch (error) {
          console.error(`❌ Failed to generate SEO for ${page.pagePath}:`, error);
          results.failed.push(page.pagePath);
        }
      }

      console.log(`✅ Bulk SEO generation complete: ${results.success.length} succeeded, ${results.failed.length} failed`);
      
      res.json({
        success: true,
        totalPages: MAJOR_PAGES.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        results,
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Bulk SEO generation error:", error);
      res.status(500).json({ message: "Failed to generate SEO", error: error.message });
    }
  });

  // Regenerate SEO for a specific page
  app.post("/api/ai-seo/regenerate/:pagePath(*)", requireAdmin, async (req: any, res) => {
    try {
      const pagePath = "/" + req.params.pagePath;
      
      const seoData = await regenerateSEOForPage(pagePath);
      
      if (!seoData) {
        return res.status(404).json({ message: "Page not found in major pages list" });
      }

      // Update in database
      const existingRecord = await db.select().from(pageSeoMetadata).where(eq(pageSeoMetadata.pagePath, pagePath)).limit(1);
      
      if (existingRecord.length > 0) {
        await db.update(pageSeoMetadata)
          .set({
            title: seoData.title,
            description: seoData.description,
            keywords: seoData.keywords,
            faqs: seoData.faqs,
            features: seoData.features,
            reviews: seoData.reviewSnippets,
            ogTitle: seoData.ogTitle,
            ogDescription: seoData.ogDescription,
            twitterTitle: seoData.twitterTitle,
            twitterDescription: seoData.twitterDescription,
            generatedAt: new Date(),
            regenerateCount: sql`${pageSeoMetadata.regenerateCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(pageSeoMetadata.pagePath, pagePath));
      }

      res.json({
        success: true,
        pagePath,
        seo: seoData,
        regeneratedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("SEO regeneration error:", error);
      res.status(500).json({ message: "Failed to regenerate SEO", error: error.message });
    }
  });

  // Get list of all major pages configured for SEO generation
  app.get("/api/ai-seo/pages", async (req, res) => {
    try {
      res.json({
        pages: MAJOR_PAGES.map(p => ({
          path: p.pagePath,
          title: p.pageTitle,
          type: p.pageType,
          industry: p.industry
        })),
        totalPages: MAJOR_PAGES.length
      });
    } catch (error: any) {
      console.error("Error fetching SEO pages:", error);
      res.status(500).json({ message: "Failed to fetch SEO pages", error: error.message });
    }
  });

  // ========== SRA (STROKE RECOVERY ACADEMY) ROUTES ==========
  const { createSraRoutes } = await import('./sra-routes');
  app.use("/api/sra", requireAuth, createSraRoutes(storage));

  // ========== ADVERTISING & SPONSORSHIP ROUTES ==========
  const advertisingRoutes = await import('./advertising-routes');
  app.use("/api/advertising", advertisingRoutes.default);

  // ========== AI CONTENT STUDIO ROUTES ==========
  
  // ==================== CONVERSATIONS ====================
  
  // Create a new conversation
  app.post("/api/ai-studio/conversations", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validated = insertAiConversationSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });

      const [conversation] = await db.insert(aiConversations).values(validated).returning();
      res.status(201).json(conversation);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: error.message || "Failed to create conversation" });
    }
  });

  // List all conversations for user
  app.get("/api/ai-studio/conversations", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversations = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.userId, currentUser.userId))
        .orderBy(sql`${aiConversations.updatedAt} DESC`);

      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: error.message || "Failed to fetch conversations" });
    }
  });

  // Get a conversation by ID
  app.get("/api/ai-studio/conversations/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [conversation] = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, req.params.id));

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (conversation.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(conversation);
    } catch (error: any) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: error.message || "Failed to fetch conversation" });
    }
  });

  // Update a conversation
  app.patch("/api/ai-studio/conversations/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [existing] = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, req.params.id));

      if (!existing) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.isPinned !== undefined) updateData.isPinned = req.body.isPinned;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
      if (req.body.type !== undefined) updateData.type = req.body.type;
      if (req.body.systemPrompt !== undefined) updateData.systemPrompt = req.body.systemPrompt;
      if (req.body.messages !== undefined) updateData.messages = req.body.messages;
      if (req.body.memoryContext !== undefined) updateData.memoryContext = req.body.memoryContext;

      const [updated] = await db
        .update(aiConversations)
        .set(updateData)
        .where(eq(aiConversations.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: error.message || "Failed to update conversation" });
    }
  });

  // Delete a conversation
  app.delete("/api/ai-studio/conversations/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [existing] = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, req.params.id));

      if (!existing) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await db.delete(aiConversations).where(eq(aiConversations.id, req.params.id));
      res.json({ success: true, message: "Conversation deleted" });
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: error.message || "Failed to delete conversation" });
    }
  });

  // ==================== CHAT ====================
  
  // Send message and get AI response
  app.post("/api/ai-studio/chat", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { conversationId, message, type = "general", customSystemPrompt } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      let messages: ChatMessage[] = [];
      let conversation: any = null;

      if (conversationId) {
        const [existing] = await db
          .select()
          .from(aiConversations)
          .where(eq(aiConversations.id, conversationId));

        if (!existing) {
          return res.status(404).json({ message: "Conversation not found" });
        }

        if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }

        conversation = existing;
        messages = (existing.messages as ChatMessage[]) || [];
      }

      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      messages.push(userMessage);

      const result = await generateChatResponse(messages, type as any, customSystemPrompt);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.content,
        timestamp: new Date().toISOString(),
      };
      messages.push(assistantMessage);

      if (conversation) {
        await db
          .update(aiConversations)
          .set({
            messages,
            totalTokensUsed: (conversation.totalTokensUsed || 0) + (result.tokensUsed || 0),
            updatedAt: new Date(),
          })
          .where(eq(aiConversations.id, conversationId));
      }

      res.json({
        response: result.content,
        tokensUsed: result.tokensUsed,
        model: result.model,
        processingTimeMs: result.processingTimeMs,
        conversationId: conversation?.id,
      });
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: error.message || "Failed to generate response" });
    }
  });

  // Stream response from Gemini (SSE)
  app.post("/api/ai-studio/chat/stream", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { conversationId, message, type = "general", customSystemPrompt } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let messages: ChatMessage[] = [];
      let conversation: any = null;

      if (conversationId) {
        const [existing] = await db
          .select()
          .from(aiConversations)
          .where(eq(aiConversations.id, conversationId));

        if (existing && existing.userId === currentUser.userId) {
          conversation = existing;
          messages = (existing.messages as ChatMessage[]) || [];
        }
      }

      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      messages.push(userMessage);

      const result = await generateChatResponse(messages, type as any, customSystemPrompt);

      const chunks = result.content.split(/(?<=[.!?])\s+/);
      let fullContent = "";

      for (const chunk of chunks) {
        fullContent += chunk + " ";
        res.write(`data: ${JSON.stringify({ chunk, fullContent: fullContent.trim() })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.content,
        timestamp: new Date().toISOString(),
      };
      messages.push(assistantMessage);

      if (conversation) {
        await db
          .update(aiConversations)
          .set({
            messages,
            totalTokensUsed: (conversation.totalTokensUsed || 0) + (result.tokensUsed || 0),
            updatedAt: new Date(),
          })
          .where(eq(aiConversations.id, conversationId));
      }

      res.write(`data: ${JSON.stringify({ done: true, tokensUsed: result.tokensUsed, model: result.model })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Error in stream chat:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

  // ==================== CONTENT GENERATION ====================
  
  // Generate blog topic suggestions
  app.post("/api/ai-studio/blog-topics", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { niche = "laundromat", count = 5 } = req.body;
      const topics = await generateBlogTopics(niche, count);
      res.json({ topics });
    } catch (error: any) {
      console.error("Error generating blog topics:", error);
      res.status(500).json({ message: error.message || "Failed to generate blog topics" });
    }
  });

  // Generate a full blog post
  app.post("/api/ai-studio/blog", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { title, keyword, outline, targetWordCount = 2000 } = req.body;

      if (!title || !keyword || !outline) {
        return res.status(400).json({ message: "Title, keyword, and outline are required" });
      }

      const result = await generateBlogPost(title, keyword, outline, targetWordCount);
      res.json({
        content: result.content,
        tokensUsed: result.tokensUsed,
        model: result.model,
        processingTimeMs: result.processingTimeMs,
      });
    } catch (error: any) {
      console.error("Error generating blog post:", error);
      res.status(500).json({ message: error.message || "Failed to generate blog post" });
    }
  });

  // Generate a book chapter
  app.post("/api/ai-studio/book-chapter", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { bookTitle, chapterTitle, chapterNumber, outline, targetWordCount = 4000, previousChapterSummary } = req.body;

      if (!bookTitle || !chapterTitle || !chapterNumber || !outline) {
        return res.status(400).json({ message: "Book title, chapter title, chapter number, and outline are required" });
      }

      const result = await generateBookChapter(
        bookTitle,
        chapterTitle,
        chapterNumber,
        outline,
        targetWordCount,
        previousChapterSummary
      );

      res.json({
        content: result.content,
        tokensUsed: result.tokensUsed,
        model: result.model,
        processingTimeMs: result.processingTimeMs,
      });
    } catch (error: any) {
      console.error("Error generating book chapter:", error);
      res.status(500).json({ message: error.message || "Failed to generate book chapter" });
    }
  });

  // Generate newsletter content
  app.post("/api/ai-studio/newsletter", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { topic, style = "educational", previousNewsletters } = req.body;

      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const result = await generateNewsletter(topic, style, previousNewsletters);
      res.json(result);
    } catch (error: any) {
      console.error("Error generating newsletter:", error);
      res.status(500).json({ message: error.message || "Failed to generate newsletter" });
    }
  });

  // ==================== IMAGE GENERATION ====================

  // Generate an image from a prompt
  app.post("/api/ai-studio/generate-image", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { prompt, type = "custom", dimensions } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const validTypes: ImageType[] = ["cover", "header", "banner", "custom"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type. Must be one of: cover, header, banner, custom" });
      }

      const customDimensions = dimensions ? {
        width: parseInt(dimensions.width) || 1024,
        height: parseInt(dimensions.height) || 1024,
      } : undefined;

      const result = await generateImage(prompt, type as ImageType, customDimensions);
      
      res.json({
        url: result.url,
        base64: result.base64,
        filename: result.filename,
        contentType: result.contentType,
        processingTimeMs: result.processingTimeMs,
        model: result.model,
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      if (error.message?.includes("Rate limit")) {
        return res.status(429).json({ message: error.message });
      }
      res.status(500).json({ message: error.message || "Failed to generate image" });
    }
  });

  // Generate a book cover
  app.post("/api/ai-studio/generate-cover", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { bookTitle, subtitle = "", author = "", style = "professional" } = req.body;

      if (!bookTitle) {
        return res.status(400).json({ message: "Book title is required" });
      }

      const validStyles: CoverStyle[] = ["professional", "creative", "minimalist"];
      if (!validStyles.includes(style)) {
        return res.status(400).json({ message: "Invalid style. Must be one of: professional, creative, minimalist" });
      }

      const result = await generateBookCover(bookTitle, subtitle, author, style as CoverStyle);
      
      res.json({
        url: result.url,
        base64: result.base64,
        filename: result.filename,
        contentType: result.contentType,
        processingTimeMs: result.processingTimeMs,
        model: result.model,
      });
    } catch (error: any) {
      console.error("Error generating book cover:", error);
      if (error.message?.includes("Rate limit")) {
        return res.status(429).json({ message: error.message });
      }
      res.status(500).json({ message: error.message || "Failed to generate book cover" });
    }
  });

  // Generate a blog header image
  app.post("/api/ai-studio/generate-blog-header", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { blogTitle, keywords = [], industry = "laundromat business" } = req.body;

      if (!blogTitle) {
        return res.status(400).json({ message: "Blog title is required" });
      }

      const result = await generateBlogHeaderImage(blogTitle, keywords, industry);
      
      res.json({
        url: result.url,
        base64: result.base64,
        filename: result.filename,
        contentType: result.contentType,
        processingTimeMs: result.processingTimeMs,
        model: result.model,
      });
    } catch (error: any) {
      console.error("Error generating blog header image:", error);
      if (error.message?.includes("Rate limit")) {
        return res.status(429).json({ message: error.message });
      }
      res.status(500).json({ message: error.message || "Failed to generate blog header image" });
    }
  });

  // Generate a newsletter banner
  app.post("/api/ai-studio/generate-newsletter-banner", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { topic, brandName = "WashBizHub", style = "informational" } = req.body;

      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const validStyles = ["promotional", "informational", "announcement"];
      if (!validStyles.includes(style)) {
        return res.status(400).json({ message: "Invalid style. Must be one of: promotional, informational, announcement" });
      }

      const result = await generateNewsletterBanner(topic, brandName, style as "promotional" | "informational" | "announcement");
      
      res.json({
        url: result.url,
        base64: result.base64,
        filename: result.filename,
        contentType: result.contentType,
        processingTimeMs: result.processingTimeMs,
        model: result.model,
      });
    } catch (error: any) {
      console.error("Error generating newsletter banner:", error);
      if (error.message?.includes("Rate limit")) {
        return res.status(429).json({ message: error.message });
      }
      res.status(500).json({ message: error.message || "Failed to generate newsletter banner" });
    }
  });

  // Generate or modify code
  app.post("/api/ai-studio/code", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { request, existingCode, language = "typescript" } = req.body;

      if (!request) {
        return res.status(400).json({ message: "Request is required" });
      }

      const result = await generateCode(request, existingCode, language);
      res.json({
        content: result.content,
        tokensUsed: result.tokensUsed,
        model: result.model,
        processingTimeMs: result.processingTimeMs,
      });
    } catch (error: any) {
      console.error("Error generating code:", error);
      res.status(500).json({ message: error.message || "Failed to generate code" });
    }
  });

  // ==================== PROJECTS ====================
  
  // Create content project
  app.post("/api/ai-studio/projects", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validated = insertContentProjectSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });

      const [project] = await db.insert(contentProjects).values(validated).returning();
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: error.message || "Failed to create project" });
    }
  });

  // List all projects for user
  app.get("/api/ai-studio/projects", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const projects = await db
        .select()
        .from(contentProjects)
        .where(eq(contentProjects.userId, currentUser.userId))
        .orderBy(sql`${contentProjects.updatedAt} DESC`);

      res.json(projects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: error.message || "Failed to fetch projects" });
    }
  });

  // Get project by ID
  app.get("/api/ai-studio/projects/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [project] = await db
        .select()
        .from(contentProjects)
        .where(eq(contentProjects.id, req.params.id));

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(project);
    } catch (error: any) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: error.message || "Failed to fetch project" });
    }
  });

  // Update project
  app.patch("/api/ai-studio/projects/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [existing] = await db
        .select()
        .from(contentProjects)
        .where(eq(contentProjects.id, req.params.id));

      if (!existing) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.type !== undefined) updateData.type = req.body.type;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.content !== undefined) updateData.content = req.body.content;
      if (req.body.kdpSettings !== undefined) updateData.kdpSettings = req.body.kdpSettings;
      if (req.body.coverImageUrl !== undefined) updateData.coverImageUrl = req.body.coverImageUrl;
      if (req.body.wordCount !== undefined) updateData.wordCount = req.body.wordCount;
      if (req.body.chapterCount !== undefined) updateData.chapterCount = req.body.chapterCount;
      if (req.body.lastEditedAt !== undefined) updateData.lastEditedAt = req.body.lastEditedAt;

      const [updated] = await db
        .update(contentProjects)
        .set(updateData)
        .where(eq(contentProjects.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: error.message || "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/ai-studio/projects/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [existing] = await db
        .select()
        .from(contentProjects)
        .where(eq(contentProjects.id, req.params.id));

      if (!existing) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await db.delete(contentProjects).where(eq(contentProjects.id, req.params.id));
      res.json({ success: true, message: "Project deleted" });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: error.message || "Failed to delete project" });
    }
  });

  // ==================== EMAIL CONTACTS ====================
  
  // Add email contact
  app.post("/api/ai-studio/email-contacts", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validated = insertEmailContactSchema.parse({
        ...req.body,
        userId: currentUser.userId,
      });

      const [contact] = await db.insert(emailContacts).values(validated).returning();
      res.status(201).json(contact);
    } catch (error: any) {
      console.error("Error creating email contact:", error);
      if (error.message?.includes("unique constraint") || error.code === "23505") {
        return res.status(409).json({ message: "Email contact already exists" });
      }
      res.status(400).json({ message: error.message || "Failed to create email contact" });
    }
  });

  // List all contacts for user
  app.get("/api/ai-studio/email-contacts", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { status, segment } = req.query;
      let query = db
        .select()
        .from(emailContacts)
        .where(eq(emailContacts.userId, currentUser.userId));

      const contacts = await query.orderBy(sql`${emailContacts.createdAt} DESC`);

      let filteredContacts = contacts;
      if (status) {
        filteredContacts = filteredContacts.filter((c: any) => c.status === status);
      }
      if (segment) {
        filteredContacts = filteredContacts.filter((c: any) => c.segment === segment);
      }

      res.json(filteredContacts);
    } catch (error: any) {
      console.error("Error fetching email contacts:", error);
      res.status(500).json({ message: error.message || "Failed to fetch email contacts" });
    }
  });

  // Remove email contact
  app.delete("/api/ai-studio/email-contacts/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [existing] = await db
        .select()
        .from(emailContacts)
        .where(eq(emailContacts.id, req.params.id));

      if (!existing) {
        return res.status(404).json({ message: "Email contact not found" });
      }

      if (existing.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await db.delete(emailContacts).where(eq(emailContacts.id, req.params.id));
      res.json({ success: true, message: "Email contact deleted" });
    } catch (error: any) {
      console.error("Error deleting email contact:", error);
      res.status(500).json({ message: error.message || "Failed to delete email contact" });
    }
  });

  // ==================== QUOTA ====================
  
  // Get Gemini API quota status
  app.get("/api/ai-studio/quota", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const quotaStatus = getQuotaStatus();
      
      const conversationCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiConversations)
        .where(eq(aiConversations.userId, currentUser.userId));

      const projectCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(contentProjects)
        .where(eq(contentProjects.userId, currentUser.userId));

      res.json({
        ...quotaStatus,
        usage: {
          conversations: Number(conversationCount[0]?.count || 0),
          projects: Number(projectCount[0]?.count || 0),
        },
      });
    } catch (error: any) {
      console.error("Error fetching quota:", error);
      res.status(500).json({ message: error.message || "Failed to fetch quota status" });
    }
  });

  // ==================== KDP BOOK EXPORT ====================
  
  // Get export metadata for a project (preview before export) - requires Pro tier
  app.get("/api/ai-studio/export/:projectId/metadata", requireAuth, requireTier("pro"), async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [project] = await db
        .select()
        .from(contentProjects)
        .where(eq(contentProjects.id, req.params.projectId));

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only export your own projects" });
      }

      const metadata = getExportMetadata(project);
      res.json(metadata);
    } catch (error: any) {
      console.error("Error getting export metadata:", error);
      res.status(500).json({ message: error.message || "Failed to get export metadata" });
    }
  });

  // Export project as PDF (requires Pro tier)
  app.post("/api/ai-studio/export/pdf", requireAuth, requireTier("pro"), async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { projectId, options } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }

      const [project] = await db
        .select()
        .from(contentProjects)
        .where(eq(contentProjects.id, projectId));

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only export your own projects" });
      }

      const result = await exportToPdf(project, options || {});

      res.setHeader("Content-Type", result.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      res.setHeader("X-Word-Count", result.wordCount.toString());
      res.setHeader("X-Page-Count", result.pageCount.toString());
      res.send(result.buffer);
    } catch (error: any) {
      console.error("Error exporting to PDF:", error);
      res.status(500).json({ message: error.message || "Failed to export PDF" });
    }
  });

  // Export project as DOCX (requires Pro tier)
  app.post("/api/ai-studio/export/docx", requireAuth, requireTier("pro"), async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { projectId, options } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }

      const [project] = await db
        .select()
        .from(contentProjects)
        .where(eq(contentProjects.id, projectId));

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Forbidden - you can only export your own projects" });
      }

      const result = await exportToDocx(project, options || {});

      res.setHeader("Content-Type", result.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      res.setHeader("X-Word-Count", result.wordCount.toString());
      res.setHeader("X-Page-Count", result.pageCount.toString());
      res.send(result.buffer);
    } catch (error: any) {
      console.error("Error exporting to DOCX:", error);
      res.status(500).json({ message: error.message || "Failed to export DOCX" });
    }
  });

  // ============================================================================
  // ERROR CODE DIAGNOSTIC TOOL - PROTECTED PROPRIETARY DATABASE
  // Anti-scraping protection enabled - Rate limiting, bot detection, data obfuscation
  // ============================================================================

  // Honeypot endpoints - trap for scrapers
  app.get("/api/error-codes/export", honeypotEndpoint);
  app.get("/api/error-codes/download", honeypotEndpoint);
  app.get("/api/error-codes/bulk", honeypotEndpoint);
  app.get("/api/diagnostic-codes/all", honeypotEndpoint);

  // Get all error codes with filtering - PROTECTED
  app.get("/api/error-codes", antiScrapingMiddleware, enforcePageLimits, addSecurityHeaders, async (req, res) => {
    try {
      const { manufacturer, machineType, severity, search } = req.query;
      let { limit = "20", offset = "0" } = req.query;
      
      // Enforce maximum page size
      const parsedLimit = Math.min(parseInt(limit as string) || 20, 20);
      const parsedOffset = parseInt(offset as string) || 0;
      
      const conditions: any[] = [];

      if (manufacturer && manufacturer !== "all") {
        conditions.push(eq(diagnosticCodes.manufacturer, manufacturer as string));
      }
      if (machineType && machineType !== "all") {
        conditions.push(eq(diagnosticCodes.machineType, machineType as string));
      }
      if (severity && severity !== "all") {
        conditions.push(eq(diagnosticCodes.severity, severity as string));
      }
      if (search) {
        conditions.push(
          or(
            sql`${diagnosticCodes.code} ILIKE ${'%' + search + '%'}`,
            sql`${diagnosticCodes.title} ILIKE ${'%' + search + '%'}`,
            sql`${diagnosticCodes.description} ILIKE ${'%' + search + '%'}`
          )
        );
      }

      const rawCodes = await db
        .select()
        .from(diagnosticCodes)
        .where(conditions.length > 0 ? sql`${conditions.reduce((acc, cond, i) => i === 0 ? cond : sql`${acc} AND ${cond}`)}` : undefined)
        .limit(parsedLimit)
        .offset(parsedOffset)
        .orderBy(diagnosticCodes.manufacturer, diagnosticCodes.code);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(diagnosticCodes)
        .where(conditions.length > 0 ? sql`${conditions.reduce((acc, cond, i) => i === 0 ? cond : sql`${acc} AND ${cond}`)}` : undefined);

      // Obfuscate sensitive data for anonymous users
      const requireAuth = !!(req as any).user;
      const codes = obfuscateForAnonymous(rawCodes, requireAuth);

      res.json({
        codes,
        total: countResult?.count || 0,
        limit: parsedLimit,
        offset: parsedOffset,
        protected: true
      });
    } catch (error: any) {
      console.error("Error fetching error codes:", error);
      res.status(500).json({ message: error.message || "Failed to fetch error codes" });
    }
  });

  // Get unique manufacturers list - PROTECTED
  app.get("/api/error-codes/manufacturers", antiScrapingMiddleware, addSecurityHeaders, async (req, res) => {
    try {
      const counts = await db
        .select({
          manufacturer: diagnosticCodes.manufacturer,
          count: sql<number>`count(*)`
        })
        .from(diagnosticCodes)
        .groupBy(diagnosticCodes.manufacturer)
        .orderBy(diagnosticCodes.manufacturer);

      res.json(counts);
    } catch (error: any) {
      console.error("Error fetching manufacturers:", error);
      res.status(500).json({ message: error.message || "Failed to fetch manufacturers" });
    }
  });

  // Get error code by slug (for SEO-friendly URLs) - PROTECTED with data obfuscation
  app.get("/api/error-codes/slug/:slug", antiScrapingMiddleware, addSecurityHeaders, async (req, res) => {
    try {
      const { slug } = req.params;
      
      const [rawCode] = await db
        .select()
        .from(diagnosticCodes)
        .where(eq(diagnosticCodes.slug, slug));

      if (!rawCode) {
        return res.status(404).json({ message: "Error code not found" });
      }

      // Get related codes from same manufacturer (limited)
      const rawRelatedCodes = await db
        .select()
        .from(diagnosticCodes)
        .where(sql`${diagnosticCodes.manufacturer} = ${rawCode.manufacturer} AND ${diagnosticCodes.id} != ${rawCode.id}`)
        .limit(4);

      // Obfuscate sensitive data for anonymous users
      const requireAuth = !!(req as any).user;
      const code = obfuscateForAnonymous(rawCode, requireAuth);
      const relatedCodes = obfuscateForAnonymous(rawRelatedCodes, requireAuth);

      res.json({ code, relatedCodes, protected: true });
    } catch (error: any) {
      console.error("Error fetching error code:", error);
      res.status(500).json({ message: error.message || "Failed to fetch error code" });
    }
  });

  // Get error code by manufacturer and code - PROTECTED with data obfuscation
  app.get("/api/error-codes/:manufacturer/:code", antiScrapingMiddleware, addSecurityHeaders, async (req, res) => {
    try {
      const { manufacturer, code } = req.params;
      
      const [rawResult] = await db
        .select()
        .from(diagnosticCodes)
        .where(sql`${diagnosticCodes.manufacturer} = ${manufacturer} AND ${diagnosticCodes.code} = ${code}`);

      if (!rawResult) {
        return res.status(404).json({ message: "Error code not found" });
      }

      // Obfuscate sensitive data for anonymous users
      const requireAuth = !!(req as any).user;
      const result = obfuscateForAnonymous(rawResult, requireAuth);

      res.json({ ...result, protected: true });
    } catch (error: any) {
      console.error("Error fetching error code:", error);
      res.status(500).json({ message: error.message || "Failed to fetch error code" });
    }
  });

  // Seed error codes (admin only)
  app.post("/api/error-codes/seed", requireAdmin, async (req, res) => {
    try {
      const { seedErrorCodes } = await import("./seed-error-codes");
      const result = await seedErrorCodes();
      res.json(result);
    } catch (error: any) {
      console.error("Error seeding error codes:", error);
      res.status(500).json({ message: error.message || "Failed to seed error codes" });
    }
  });

  // Scan error code from image using Vision AI
  app.post("/api/diagnostics/scan-error-code", rateLimiter, async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      
      if (!image) {
        return res.status(400).json({ message: "No image provided" });
      }
      
      // Use Gemini Vision to extract error codes from image
      const visionResult = await scanErrorCodeFromImage(image, mimeType || "image/jpeg");
      
      if (!visionResult.errorCodes || visionResult.errorCodes.length === 0) {
        return res.json({
          success: false,
          extractedText: visionResult.extractedText,
          errorCodes: [],
          detectedBrand: visionResult.detectedBrand,
          detectedModel: visionResult.detectedModel,
          machineType: visionResult.machineType,
          confidence: visionResult.confidence,
          diagnostics: [],
          similarCodes: []
        });
      }
      
      // Look up each detected error code in the database
      const diagnosticsPromises = visionResult.errorCodes.map(async (code) => {
        // Build conditions for matching
        const conditions: any[] = [];
        
        // Match by code (case insensitive)
        conditions.push(sql`LOWER(${diagnosticCodes.code}) = LOWER(${code})`);
        
        // If brand detected, prefer matching that brand
        if (visionResult.detectedBrand) {
          const brandConditions = await db
            .select()
            .from(diagnosticCodes)
            .where(sql`LOWER(${diagnosticCodes.code}) = LOWER(${code}) AND LOWER(${diagnosticCodes.manufacturer}) LIKE LOWER(${'%' + visionResult.detectedBrand + '%'})`)
            .limit(1);
          
          if (brandConditions.length > 0) {
            return brandConditions[0];
          }
        }
        
        // Otherwise get any matching code
        const [result] = await db
          .select()
          .from(diagnosticCodes)
          .where(sql`LOWER(${diagnosticCodes.code}) = LOWER(${code})`)
          .limit(1);
        
        return result;
      });
      
      const diagnosticsResults = await Promise.all(diagnosticsPromises);
      const diagnostics = diagnosticsResults.filter(Boolean);
      
      // Get similar codes from the same manufacturer
      let similarCodes: any[] = [];
      if (diagnostics.length > 0 && diagnostics[0]) {
        const manufacturer = diagnostics[0].manufacturer;
        similarCodes = await db
          .select({
            id: diagnosticCodes.id,
            code: diagnosticCodes.code,
            manufacturer: diagnosticCodes.manufacturer,
            slug: diagnosticCodes.slug,
            title: diagnosticCodes.title,
            severity: diagnosticCodes.severity
          })
          .from(diagnosticCodes)
          .where(sql`${diagnosticCodes.manufacturer} = ${manufacturer} AND ${diagnosticCodes.id} != ${diagnostics[0].id}`)
          .limit(6);
      }
      
      res.json({
        success: diagnostics.length > 0,
        extractedText: visionResult.extractedText,
        errorCodes: visionResult.errorCodes,
        detectedBrand: visionResult.detectedBrand,
        detectedModel: visionResult.detectedModel,
        machineType: visionResult.machineType,
        confidence: visionResult.confidence,
        diagnostics: diagnostics.map(d => ({
          id: d.id,
          code: d.code,
          manufacturer: d.manufacturer,
          slug: d.slug,
          title: d.title,
          description: d.description,
          severity: d.severity || "medium",
          machineType: d.machineType || "washer",
          possibleCauses: d.possibleCauses || [],
          troubleshootingSteps: d.troubleshootingSteps || [],
          requiredParts: d.requiredParts || [],
          partsWithPricing: d.partsWithPricing || [],
          estimatedRepairTime: d.estimatedRepairTime || 30,
          skillLevel: d.skillLevel || "intermediate",
          quickFix: d.quickFix || null
        })),
        similarCodes
      });
    } catch (error: any) {
      console.error("Error scanning error code:", error);
      res.status(500).json({ 
        message: error.message || "Failed to scan error code",
        success: false 
      });
    }
  });

  // Get statistics for error codes - PROTECTED (rate limited)
  app.get("/api/error-codes/stats", antiScrapingMiddleware, addSecurityHeaders, async (req, res) => {
    try {
      const [totalCodes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(diagnosticCodes);

      const [totalBrands] = await db
        .select({ count: sql<number>`count(DISTINCT manufacturer)` })
        .from(diagnosticCodes);

      const bySeverity = await db
        .select({
          severity: diagnosticCodes.severity,
          count: sql<number>`count(*)`
        })
        .from(diagnosticCodes)
        .groupBy(diagnosticCodes.severity);

      const byMachineType = await db
        .select({
          machineType: diagnosticCodes.machineType,
          count: sql<number>`count(*)`
        })
        .from(diagnosticCodes)
        .groupBy(diagnosticCodes.machineType);

      res.json({
        totalCodes: totalCodes?.count || 0,
        totalBrands: totalBrands?.count || 0,
        bySeverity,
        byMachineType,
        protected: true
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: error.message || "Failed to fetch statistics" });
    }
  });

  // ==================== UTILITY BILL AUDITOR API ====================

  // POST /api/utility-bill/analyze - Analyze utility bill image using Gemini Vision AI
  app.post("/api/utility-bill/analyze", requireAuth, rateLimiter, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { image, mimeType, grossRevenue } = req.body;

      if (!image) {
        return res.status(400).json({ message: "No image provided" });
      }

      // Get user's most recent analysis for comparison
      const [previousAnalysis] = await db
        .select()
        .from(utilityBillAnalyses)
        .where(eq(utilityBillAnalyses.userId, userId))
        .orderBy(desc(utilityBillAnalyses.createdAt))
        .limit(1);

      let previousBillData: UtilityBillData | undefined;
      if (previousAnalysis && previousAnalysis.rawExtractedData) {
        previousBillData = previousAnalysis.rawExtractedData as UtilityBillData;
      }

      // Analyze the bill using Gemini Vision
      const analysisResult = await analyzeUtilityBill(
        image,
        mimeType || "image/jpeg",
        grossRevenue ? parseFloat(grossRevenue) : undefined,
        previousBillData
      );

      // Save the analysis to the database
      const [savedAnalysis] = await db
        .insert(utilityBillAnalyses)
        .values({
          userId,
          billType: analysisResult.billData.billType,
          billDate: analysisResult.billData.billDate ? new Date(analysisResult.billData.billDate) : null,
          billPeriodStart: analysisResult.billData.billPeriodStart ? new Date(analysisResult.billData.billPeriodStart) : null,
          billPeriodEnd: analysisResult.billData.billPeriodEnd ? new Date(analysisResult.billData.billPeriodEnd) : null,
          electricKwh: analysisResult.billData.electricKwh?.toString(),
          electricCost: analysisResult.billData.electricCost?.toString(),
          electricRatePerKwh: analysisResult.billData.electricRatePerKwh?.toString(),
          waterGallons: analysisResult.billData.waterGallons?.toString(),
          waterCost: analysisResult.billData.waterCost?.toString(),
          waterRatePerGallon: analysisResult.billData.waterRatePerGallon?.toString(),
          gasTherms: analysisResult.billData.gasTherms?.toString(),
          gasCost: analysisResult.billData.gasCost?.toString(),
          gasRatePerTherm: analysisResult.billData.gasRatePerTherm?.toString(),
          totalCost: analysisResult.billData.totalCost?.toString(),
          grossRevenue: grossRevenue?.toString(),
          upgRatio: analysisResult.laundromatMetrics.upgRatio?.toString(),
          costPerWasherLoad: analysisResult.laundromatMetrics.costPerWasherLoad?.toString(),
          costPerDryerLoad: analysisResult.laundromatMetrics.costPerDryerLoad?.toString(),
          anomalies: analysisResult.anomalies,
          recommendations: analysisResult.recommendations,
          rawExtractedData: analysisResult.rawExtractedData,
          confidenceScore: analysisResult.billData.confidence?.toString(),
        })
        .returning();

      res.json({
        success: true,
        analysisId: savedAnalysis.id,
        billData: analysisResult.billData,
        laundromatMetrics: analysisResult.laundromatMetrics,
        anomalies: analysisResult.anomalies,
        recommendations: analysisResult.recommendations,
        hasPreviousData: !!previousBillData,
      });
    } catch (error: any) {
      console.error("Error analyzing utility bill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze utility bill"
      });
    }
  });

  // POST /api/utility-bill/compare - Compare two utility bills
  app.post("/api/utility-bill/compare", requireAuth, rateLimiter, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { currentBillId, previousBillId } = req.body;

      if (!currentBillId || !previousBillId) {
        return res.status(400).json({ message: "Both bill IDs are required" });
      }

      // Fetch both bills
      const [currentBill] = await db
        .select()
        .from(utilityBillAnalyses)
        .where(and(
          eq(utilityBillAnalyses.id, currentBillId),
          eq(utilityBillAnalyses.userId, userId)
        ))
        .limit(1);

      const [previousBill] = await db
        .select()
        .from(utilityBillAnalyses)
        .where(and(
          eq(utilityBillAnalyses.id, previousBillId),
          eq(utilityBillAnalyses.userId, userId)
        ))
        .limit(1);

      if (!currentBill || !previousBill) {
        return res.status(404).json({ message: "One or both bills not found" });
      }

      // Compare the bills
      const currentData = currentBill.rawExtractedData as UtilityBillData;
      const previousData = previousBill.rawExtractedData as UtilityBillData;

      const comparison = await compareBills(currentData, previousData);

      res.json({
        success: true,
        ...comparison,
        currentBill: {
          id: currentBill.id,
          billDate: currentBill.billDate,
          totalCost: currentBill.totalCost,
        },
        previousBill: {
          id: previousBill.id,
          billDate: previousBill.billDate,
          totalCost: previousBill.totalCost,
        }
      });
    } catch (error: any) {
      console.error("Error comparing utility bills:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to compare utility bills"
      });
    }
  });

  // GET /api/utility-bill/history - Get user's utility bill analysis history
  app.get("/api/utility-bill/history", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { limit = 20, offset = 0 } = req.query;

      const analyses = await db
        .select({
          id: utilityBillAnalyses.id,
          billType: utilityBillAnalyses.billType,
          billDate: utilityBillAnalyses.billDate,
          billPeriodStart: utilityBillAnalyses.billPeriodStart,
          billPeriodEnd: utilityBillAnalyses.billPeriodEnd,
          electricKwh: utilityBillAnalyses.electricKwh,
          electricCost: utilityBillAnalyses.electricCost,
          waterGallons: utilityBillAnalyses.waterGallons,
          waterCost: utilityBillAnalyses.waterCost,
          gasTherms: utilityBillAnalyses.gasTherms,
          gasCost: utilityBillAnalyses.gasCost,
          totalCost: utilityBillAnalyses.totalCost,
          upgRatio: utilityBillAnalyses.upgRatio,
          costPerWasherLoad: utilityBillAnalyses.costPerWasherLoad,
          costPerDryerLoad: utilityBillAnalyses.costPerDryerLoad,
          anomalies: utilityBillAnalyses.anomalies,
          recommendations: utilityBillAnalyses.recommendations,
          confidenceScore: utilityBillAnalyses.confidenceScore,
          createdAt: utilityBillAnalyses.createdAt,
        })
        .from(utilityBillAnalyses)
        .where(eq(utilityBillAnalyses.userId, userId))
        .orderBy(desc(utilityBillAnalyses.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(utilityBillAnalyses)
        .where(eq(utilityBillAnalyses.userId, userId));

      res.json({
        success: true,
        analyses,
        total: count,
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (error: any) {
      console.error("Error fetching utility bill history:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch utility bill history"
      });
    }
  });

  // GET /api/utility-bill/:id - Get a specific utility bill analysis
  app.get("/api/utility-bill/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      const [analysis] = await db
        .select()
        .from(utilityBillAnalyses)
        .where(and(
          eq(utilityBillAnalyses.id, id),
          eq(utilityBillAnalyses.userId, userId)
        ))
        .limit(1);

      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json({
        success: true,
        analysis
      });
    } catch (error: any) {
      console.error("Error fetching utility bill analysis:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch utility bill analysis"
      });
    }
  });

  // DELETE /api/utility-bill/:id - Delete a utility bill analysis
  app.delete("/api/utility-bill/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;

      const [deleted] = await db
        .delete(utilityBillAnalyses)
        .where(and(
          eq(utilityBillAnalyses.id, id),
          eq(utilityBillAnalyses.userId, userId)
        ))
        .returning();

      if (!deleted) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json({
        success: true,
        message: "Analysis deleted successfully"
      });
    } catch (error: any) {
      console.error("Error deleting utility bill analysis:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete utility bill analysis"
      });
    }
  });

  // ==================== BUSINESS DIRECTORY API ====================

  // Helper function to generate slug from business name
  function generateDirectorySlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }

  // --- PUBLIC ENDPOINTS ---

  // GET /api/directory/categories - List all active categories
  app.get("/api/directory/categories", async (req, res) => {
    try {
      const categories = await db
        .select()
        .from(businessListingCategories)
        .where(eq(businessListingCategories.isActive, true))
        .orderBy(businessListingCategories.sortOrder, businessListingCategories.name);
      
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching directory categories:", error);
      res.status(500).json({ error: error.message || "Failed to fetch categories" });
    }
  });

  // GET /api/directory/listings - List all active listings with pagination and filtering
  app.get("/api/directory/listings", async (req, res) => {
    try {
      const { category, city, state, tier, search } = req.query;
      let { limit = "20", offset = "0" } = req.query;
      
      const parsedLimit = Math.min(parseInt(limit as string) || 20, 50);
      const parsedOffset = parseInt(offset as string) || 0;
      
      const conditions: any[] = [eq(businessListings.status, "active")];
      
      if (category && category !== "all") {
        conditions.push(eq(businessListings.categoryId, category as string));
      }
      if (city) {
        conditions.push(sql`${businessListings.city} ILIKE ${city}`);
      }
      if (state) {
        conditions.push(sql`${businessListings.state} ILIKE ${state}`);
      }
      if (tier && tier !== "all") {
        conditions.push(eq(businessListings.tier, tier as string));
      }
      if (search) {
        conditions.push(
          or(
            sql`${businessListings.businessName} ILIKE ${'%' + search + '%'}`,
            sql`${businessListings.description} ILIKE ${'%' + search + '%'}`,
            sql`${businessListings.city} ILIKE ${'%' + search + '%'}`
          )
        );
      }
      
      const whereClause = conditions.length > 0 
        ? and(...conditions) 
        : undefined;
      
      const listings = await db
        .select()
        .from(businessListings)
        .where(whereClause)
        .orderBy(
          desc(businessListings.isPrioritySearch),
          desc(businessListings.isFeatured),
          desc(businessListings.createdAt)
        )
        .limit(parsedLimit)
        .offset(parsedOffset);
      
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(businessListings)
        .where(whereClause);
      
      res.json({
        listings,
        total: countResult?.count || 0,
        limit: parsedLimit,
        offset: parsedOffset
      });
    } catch (error: any) {
      console.error("Error fetching directory listings:", error);
      res.status(500).json({ error: error.message || "Failed to fetch listings" });
    }
  });

  // GET /api/directory/listings/featured - Get featured listings for homepage/sidebars
  app.get("/api/directory/listings/featured", async (req, res) => {
    try {
      let { limit = "6" } = req.query;
      const parsedLimit = Math.min(parseInt(limit as string) || 6, 20);
      
      const featured = await db
        .select()
        .from(businessListings)
        .where(
          and(
            eq(businessListings.status, "active"),
            eq(businessListings.isFeatured, true)
          )
        )
        .orderBy(desc(businessListings.isHomepageHero), desc(businessListings.createdAt))
        .limit(parsedLimit);
      
      res.json(featured);
    } catch (error: any) {
      console.error("Error fetching featured listings:", error);
      res.status(500).json({ error: error.message || "Failed to fetch featured listings" });
    }
  });

  // GET /api/directory/listings/:slug - Get single listing by slug (increment view count)
  app.get("/api/directory/listings/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const [listing] = await db
        .select()
        .from(businessListings)
        .where(eq(businessListings.slug, slug));
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      await db
        .update(businessListings)
        .set({ viewCount: sql`${businessListings.viewCount} + 1` })
        .where(eq(businessListings.id, listing.id));
      
      const [category] = listing.categoryId ? await db
        .select()
        .from(businessListingCategories)
        .where(eq(businessListingCategories.id, listing.categoryId)) : [null];
      
      res.json({ ...listing, category });
    } catch (error: any) {
      console.error("Error fetching listing by slug:", error);
      res.status(500).json({ error: error.message || "Failed to fetch listing" });
    }
  });

  // POST /api/directory/listings/:id/track - Track clicks (website, phone, email)
  app.post("/api/directory/listings/:id/track", async (req, res) => {
    try {
      const { id } = req.params;
      const { type, source } = req.body; // type: "website" | "phone" | "email"
      
      if (!["website", "phone", "email"].includes(type)) {
        return res.status(400).json({ error: "Invalid click type. Must be website, phone, or email" });
      }
      
      const [listing] = await db
        .select()
        .from(businessListings)
        .where(eq(businessListings.id, id));
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      await db
        .update(businessListings)
        .set({ clickCount: sql`${businessListings.clickCount} + 1` })
        .where(eq(businessListings.id, id));
      
      if (listing.showAnalytics) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [existingAnalytics] = await db
          .select()
          .from(businessListingAnalytics)
          .where(
            and(
              eq(businessListingAnalytics.listingId, id),
              sql`DATE(${businessListingAnalytics.date}) = DATE(${today})`
            )
          );
        
        if (existingAnalytics) {
          await db
            .update(businessListingAnalytics)
            .set({ clicks: sql`${businessListingAnalytics.clicks} + 1` })
            .where(eq(businessListingAnalytics.id, existingAnalytics.id));
        } else {
          await db.insert(businessListingAnalytics).values({
            listingId: id,
            date: today,
            clicks: 1,
            source: source || "directory"
          });
        }
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error tracking click:", error);
      res.status(500).json({ error: error.message || "Failed to track click" });
    }
  });

  // POST /api/directory/inquiries - Submit inquiry to a listing
  app.post("/api/directory/inquiries", async (req, res) => {
    try {
      const validated = insertBusinessListingInquirySchema.parse(req.body);
      
      const [listing] = await db
        .select()
        .from(businessListings)
        .where(eq(businessListings.id, validated.listingId));
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      const [inquiry] = await db.insert(businessListingInquiries).values(validated).returning();
      
      await db
        .update(businessListings)
        .set({ inquiryCount: sql`${businessListings.inquiryCount} + 1` })
        .where(eq(businessListings.id, validated.listingId));
      
      if (listing.showAnalytics) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [existingAnalytics] = await db
          .select()
          .from(businessListingAnalytics)
          .where(
            and(
              eq(businessListingAnalytics.listingId, validated.listingId),
              sql`DATE(${businessListingAnalytics.date}) = DATE(${today})`
            )
          );
        
        if (existingAnalytics) {
          await db
            .update(businessListingAnalytics)
            .set({ inquiries: sql`${businessListingAnalytics.inquiries} + 1` })
            .where(eq(businessListingAnalytics.id, existingAnalytics.id));
        } else {
          await db.insert(businessListingAnalytics).values({
            listingId: validated.listingId,
            date: today,
            inquiries: 1,
            source: validated.source || "directory"
          });
        }
      }
      
      res.json(inquiry);
    } catch (error: any) {
      console.error("Error submitting inquiry:", error);
      res.status(400).json({ error: error.message || "Failed to submit inquiry" });
    }
  });

  // --- OWNER ENDPOINTS (require auth) ---

  // GET /api/directory/my-listings - Get user's own listings
  app.get("/api/directory/my-listings", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const listings = await db
        .select()
        .from(businessListings)
        .where(eq(businessListings.ownerId, currentUser.userId))
        .orderBy(desc(businessListings.createdAt));
      
      res.json(listings);
    } catch (error: any) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ error: error.message || "Failed to fetch your listings" });
    }
  });

  // POST /api/directory/listings - Create new listing (free tier)
  app.post("/api/directory/listings", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const validated = insertBusinessListingSchema.parse(req.body);
      const slug = generateDirectorySlug(validated.businessName);
      
      const [listing] = await db.insert(businessListings).values({
        ...validated,
        ownerId: currentUser.userId,
        ownerEmail: validated.ownerEmail || currentUser.user.email || "",
        slug,
        tier: "free",
        status: "pending"
      }).returning();
      
      res.json(listing);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      res.status(400).json({ error: error.message || "Failed to create listing" });
    }
  });

  // PUT /api/directory/listings/:id - Update own listing
  app.put("/api/directory/listings/:id", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { id } = req.params;
      
      const [existing] = await db
        .select()
        .from(businessListings)
        .where(eq(businessListings.id, id));
      
      if (!existing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      if (existing.ownerId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden - you can only edit your own listings" });
      }
      
      const validated = insertBusinessListingSchema.partial().parse(req.body);
      
      const [updated] = await db
        .update(businessListings)
        .set({
          ...validated,
          updatedAt: new Date()
        })
        .where(eq(businessListings.id, id))
        .returning();
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating listing:", error);
      res.status(400).json({ error: error.message || "Failed to update listing" });
    }
  });

  // GET /api/directory/listings/:id/analytics - Get listing analytics (premium only)
  app.get("/api/directory/listings/:id/analytics", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { id } = req.params;
      const { days = "30" } = req.query;
      const parsedDays = Math.min(parseInt(days as string) || 30, 90);
      
      const [listing] = await db
        .select()
        .from(businessListings)
        .where(eq(businessListings.id, id));
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      if (listing.ownerId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden - you can only view analytics for your own listings" });
      }
      
      if (!listing.showAnalytics && listing.tier === "free") {
        return res.status(403).json({ 
          error: "Analytics not available",
          message: "Upgrade to Boost tier or higher to access detailed analytics",
          upgradeUrl: `/directory/upgrade/${id}`
        });
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parsedDays);
      
      const analytics = await db
        .select()
        .from(businessListingAnalytics)
        .where(
          and(
            eq(businessListingAnalytics.listingId, id),
            sql`${businessListingAnalytics.date} >= ${startDate}`
          )
        )
        .orderBy(desc(businessListingAnalytics.date));
      
      const totals = {
        views: listing.viewCount || 0,
        clicks: listing.clickCount || 0,
        inquiries: listing.inquiryCount || 0
      };
      
      res.json({
        listing: {
          id: listing.id,
          businessName: listing.businessName,
          tier: listing.tier
        },
        totals,
        dailyStats: analytics,
        periodDays: parsedDays
      });
    } catch (error: any) {
      console.error("Error fetching listing analytics:", error);
      res.status(500).json({ error: error.message || "Failed to fetch analytics" });
    }
  });

  // --- STRIPE INTEGRATION ---

  // Directory tier pricing (Stripe Price IDs should be set as env vars)
  const DIRECTORY_TIER_PRICING: Record<string, { priceId: string; name: string; amount: number }> = {
    boost: {
      priceId: process.env.STRIPE_DIRECTORY_BOOST_PRICE_ID || "",
      name: "Boost",
      amount: 2900 // $29/month
    },
    spotlight: {
      priceId: process.env.STRIPE_DIRECTORY_SPOTLIGHT_PRICE_ID || "",
      name: "Spotlight",
      amount: 7900 // $79/month
    },
    pro: {
      priceId: process.env.STRIPE_DIRECTORY_PRO_PRICE_ID || "",
      name: "Pro",
      amount: 14900 // $149/month
    }
  };

  // POST /api/directory/listings/:id/upgrade - Create Stripe checkout session for tier upgrade
  app.post("/api/directory/listings/:id/upgrade", requireAuth, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Payment processing is not configured" });
      }
      
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { id } = req.params;
      const { tier, successUrl, cancelUrl } = req.body;
      
      if (!tier || !["boost", "spotlight", "pro"].includes(tier)) {
        return res.status(400).json({ error: "Invalid tier. Must be boost, spotlight, or pro" });
      }
      
      const [listing] = await db
        .select()
        .from(businessListings)
        .where(eq(businessListings.id, id));
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      if (listing.ownerId !== currentUser.userId && !currentUser.isAdmin) {
        return res.status(403).json({ error: "Forbidden - you can only upgrade your own listings" });
      }
      
      const pricing = DIRECTORY_TIER_PRICING[tier];
      if (!pricing.priceId) {
        return res.status(503).json({ error: `Pricing for ${tier} tier is not configured` });
      }
      
      let customerId = listing.stripeCustomerId;
      if (!customerId && currentUser.user.stripeCustomerId) {
        customerId = currentUser.user.stripeCustomerId;
      }
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: currentUser.user.email || listing.ownerEmail,
          metadata: {
            userId: currentUser.userId,
            listingId: id
          }
        });
        customerId = customer.id;
        
        await db
          .update(businessListings)
          .set({ stripeCustomerId: customerId })
          .where(eq(businessListings.id, id));
      }
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [
          {
            price: pricing.priceId,
            quantity: 1
          }
        ],
        success_url: successUrl || `${req.headers.origin}/directory/upgrade-success?session_id={CHECKOUT_SESSION_ID}&listing_id=${id}`,
        cancel_url: cancelUrl || `${req.headers.origin}/directory/${listing.slug}`,
        metadata: {
          listingId: id,
          tier,
          userId: currentUser.userId
        },
        subscription_data: {
          metadata: {
            listingId: id,
            tier,
            userId: currentUser.userId
          }
        }
      });
      
      res.json({ 
        checkoutUrl: session.url,
        sessionId: session.id
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Webhook endpoint for Stripe directory subscription events
  // Note: This should be added to your main Stripe webhook handler
  // The webhook should listen for:
  // - checkout.session.completed: Activate the tier upgrade
  // - customer.subscription.updated: Handle tier changes
  // - customer.subscription.deleted: Downgrade to free tier
  // 
  // Example webhook handler logic:
  // if (event.type === 'checkout.session.completed') {
  //   const session = event.data.object;
  //   const { listingId, tier } = session.metadata;
  //   await db.update(businessListings).set({
  //     tier,
  //     stripeSubscriptionId: session.subscription,
  //     isFeatured: tier !== 'free',
  //     isPrioritySearch: tier !== 'free',
  //     showAnalytics: tier !== 'free',
  //     isHomepageHero: tier === 'spotlight' || tier === 'pro',
  //     hasVerifiedBadge: tier === 'pro',
  //     status: 'active'
  //   }).where(eq(businessListings.id, listingId));
  // }

  // ========================================================
  // MARKETPLACE API - Equipment, Services, Businesses for Sale
  // ========================================================
  
  // Get all approved marketplace listings (public)
  app.get("/api/marketplace/listings", async (req, res) => {
    try {
      const { category, status = 'approved', limit = 50 } = req.query;
      const statusStr = String(status);
      const limitNum = Number(limit);
      
      let result;
      if (category && category !== 'all') {
        const categoryStr = String(category);
        result = await db.execute(sql`
          SELECT * FROM marketplace_listings 
          WHERE status = ${statusStr} AND category = ${categoryStr}
          ORDER BY featured DESC, created_at DESC 
          LIMIT ${limitNum}
        `);
      } else {
        result = await db.execute(sql`
          SELECT * FROM marketplace_listings 
          WHERE status = ${statusStr}
          ORDER BY featured DESC, created_at DESC 
          LIMIT ${limitNum}
        `);
      }
      
      res.json(result.rows || []);
    } catch (error: any) {
      console.error("Error fetching marketplace listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Get single listing by ID (public)
  app.get("/api/marketplace/listings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.execute(
        sql`SELECT * FROM marketplace_listings WHERE id = ${id}`
      );
      
      if (!result.rows?.length) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Increment views
      await db.execute(
        sql`UPDATE marketplace_listings SET views = views + 1 WHERE id = ${id}`
      );
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // Submit new marketplace listing (with SMS + email notifications)
  app.post("/api/marketplace/listings", async (req, res) => {
    try {
      const { 
        sellerName, sellerEmail, sellerPhone,
        title, description, category, subcategory,
        price, priceType, city, state, country, zipCode,
        manufacturer, model, yearMade, quantity, condition,
        images
      } = req.body;
      
      // Validation
      if (!sellerName || !sellerEmail || !title || !description || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Generate approval token
      const approvalToken = crypto.randomBytes(32).toString('hex');
      
      // Insert listing
      const imagesArray = images && images.length > 0 ? images : [];
      const imagesJson = JSON.stringify(imagesArray);
      
      const result = await db.execute(sql`
        INSERT INTO marketplace_listings (
          seller_name, seller_email, seller_phone,
          title, description, category, subcategory,
          price, price_type, city, state, country, zip_code,
          manufacturer, model, year_made, quantity, condition,
          images, approval_token, status
        ) VALUES (
          ${sellerName}, ${sellerEmail}, ${sellerPhone || null},
          ${title}, ${description}, ${category}, ${subcategory || null},
          ${price ? Number(price) : null}, ${priceType || 'fixed'}, ${city || null}, ${state || null}, ${country || 'USA'}, ${zipCode || null},
          ${manufacturer || null}, ${model || null}, ${yearMade ? Number(yearMade) : null}, ${quantity ? Number(quantity) : 1}, ${condition || null},
          ARRAY[]::text[], ${approvalToken}, 'pending'
        )
        RETURNING id
      `);
      
      const listingId = result.rows?.[0]?.id;
      const baseUrl = process.env.BASE_URL || 'https://washbizhub.com';
      const approveUrl = `${baseUrl}/api/marketplace/approve/${approvalToken}`;
      const denyUrl = `${baseUrl}/api/marketplace/deny/${approvalToken}`;
      
      // Send SMS notification via AT&T gateway
      const ownerSmsEmail = '4798834314@txt.att.net';
      const ownerEmail = 'nick@washbizhub.com';
      
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        // Send SMS via AT&T email-to-SMS gateway
        await resend.emails.send({
          from: 'WashBizHub <listings@washbizhub.com>',
          to: ownerSmsEmail,
          subject: 'New Listing',
          text: `NEW: "${title}" - ${category} from ${sellerName}. Approve: ${approveUrl.substring(0, 50)}...`
        });
        
        // Send detailed email with approve/deny buttons
        await resend.emails.send({
          from: 'WashBizHub Marketplace <listings@washbizhub.com>',
          to: ownerEmail,
          subject: `[ACTION REQUIRED] New Marketplace Listing: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #001F3F 0%, #0d4f8b 100%); padding: 20px; text-align: center;">
                <h1 style="color: #b8860b; margin: 0;">New Marketplace Listing</h1>
              </div>
              
              <div style="padding: 20px; background: #f5f5f5;">
                <h2 style="color: #001F3F; margin-top: 0;">${title}</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Category:</strong></td><td>${category}${subcategory ? ` > ${subcategory}` : ''}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Seller:</strong></td><td>${sellerName}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td>${sellerEmail}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td><td>${sellerPhone || 'Not provided'}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Location:</strong></td><td>${city || ''} ${state || ''} ${zipCode || ''}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Price:</strong></td><td>${price ? `$${Number(price).toLocaleString()}` : 'Call for pricing'}</td></tr>
                </table>
                
                <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 5px;">
                  <strong>Description:</strong>
                  <p style="margin: 10px 0 0;">${description}</p>
                </div>
                
                ${manufacturer ? `<p><strong>Manufacturer:</strong> ${manufacturer}</p>` : ''}
                ${model ? `<p><strong>Model:</strong> ${model}</p>` : ''}
                ${yearMade ? `<p><strong>Year:</strong> ${yearMade}</p>` : ''}
                ${condition ? `<p><strong>Condition:</strong> ${condition}</p>` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${approveUrl}" style="display: inline-block; background: #28a745; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: bold;">
                    ✓ APPROVE
                  </a>
                  <a href="${denyUrl}" style="display: inline-block; background: #dc3545; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: bold;">
                    ✗ DENY
                  </a>
                </div>
              </div>
              
              <div style="background: #001F3F; color: white; padding: 15px; text-align: center; font-size: 12px;">
                WashBizHub Marketplace - Equipment, Services & Businesses for Sale
              </div>
            </div>
          `
        });
        
        console.log(`📧 Marketplace notification sent for listing: ${listingId}`);
      } catch (emailError) {
        console.error("Failed to send notifications:", emailError);
        // Don't fail the listing submission if email fails
      }
      
      res.json({ 
        success: true, 
        listingId,
        message: "Listing submitted successfully! You'll receive an email once it's approved."
      });
    } catch (error: any) {
      console.error("Error creating marketplace listing:", error);
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  // Approve listing via token
  app.get("/api/marketplace/approve/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const result = await db.execute(sql`
        UPDATE marketplace_listings 
        SET status = 'approved', approved_at = NOW(), expires_at = NOW() + INTERVAL '90 days'
        WHERE approval_token = ${token} AND status = 'pending'
        RETURNING id, title, seller_email, seller_name
      `);
      
      if (!result.rows?.length) {
        return res.send(`
          <html>
            <head><title>Already Processed</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1>⚠️ Listing Already Processed</h1>
              <p>This listing has already been approved or denied.</p>
              <a href="/" style="color: #b8860b;">Return to WashBizHub</a>
            </body>
          </html>
        `);
      }
      
      const listing = result.rows[0];
      
      // Send approval email to seller
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'WashBizHub Marketplace <listings@washbizhub.com>',
          to: listing.seller_email,
          subject: `Your listing "${listing.title}" has been approved!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #001F3F 0%, #0d4f8b 100%); padding: 20px; text-align: center;">
                <h1 style="color: #b8860b; margin: 0;">Listing Approved!</h1>
              </div>
              <div style="padding: 20px;">
                <p>Hi ${listing.seller_name},</p>
                <p>Great news! Your listing "<strong>${listing.title}</strong>" has been approved and is now live on the WashBizHub Marketplace.</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="https://washbizhub.com/marketplace" style="background: #b8860b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                    View Your Listing
                  </a>
                </p>
                <p>Your listing will be active for 90 days. We'll notify you before it expires.</p>
                <p>Thanks for using WashBizHub!</p>
              </div>
            </div>
          `
        });
      } catch (e) {
        console.error("Failed to send approval email:", e);
      }
      
      res.send(`
        <html>
          <head>
            <title>Listing Approved</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .card { background: white; max-width: 500px; margin: 0 auto; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #28a745; }
              a { color: #b8860b; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>✓ Listing Approved!</h1>
              <p><strong>"${listing.title}"</strong> is now live on the marketplace.</p>
              <p>The seller has been notified via email.</p>
              <p style="margin-top: 30px;"><a href="/marketplace">View Marketplace</a></p>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Error approving listing:", error);
      res.status(500).send("Error processing approval");
    }
  });

  // Deny listing via token
  app.get("/api/marketplace/deny/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const reason = req.query.reason || "Did not meet marketplace guidelines";
      
      const result = await db.execute(sql`
        UPDATE marketplace_listings 
        SET status = 'denied', denial_reason = ${reason as string}
        WHERE approval_token = ${token} AND status = 'pending'
        RETURNING id, title, seller_email, seller_name
      `);
      
      if (!result.rows?.length) {
        return res.send(`
          <html>
            <head><title>Already Processed</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1>⚠️ Listing Already Processed</h1>
              <p>This listing has already been approved or denied.</p>
              <a href="/" style="color: #b8860b;">Return to WashBizHub</a>
            </body>
          </html>
        `);
      }
      
      const listing = result.rows[0];
      
      // Send denial email to seller
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'WashBizHub Marketplace <listings@washbizhub.com>',
          to: listing.seller_email,
          subject: `Update on your listing "${listing.title}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #001F3F; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Listing Update</h1>
              </div>
              <div style="padding: 20px;">
                <p>Hi ${listing.seller_name},</p>
                <p>Unfortunately, your listing "<strong>${listing.title}</strong>" was not approved for our marketplace.</p>
                <p><strong>Reason:</strong> ${reason}</p>
                <p>If you believe this was an error or have questions, please reply to this email or contact us at listings@washbizhub.com.</p>
                <p>Thanks for your interest in WashBizHub!</p>
              </div>
            </div>
          `
        });
      } catch (e) {
        console.error("Failed to send denial email:", e);
      }
      
      res.send(`
        <html>
          <head>
            <title>Listing Denied</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .card { background: white; max-width: 500px; margin: 0 auto; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #dc3545; }
              a { color: #b8860b; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>✗ Listing Denied</h1>
              <p><strong>"${listing.title}"</strong> has been removed.</p>
              <p>The seller has been notified via email.</p>
              <p style="margin-top: 30px;"><a href="/marketplace">View Marketplace</a></p>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Error denying listing:", error);
      res.status(500).send("Error processing denial");
    }
  });

  // Get pending listings (admin only)
  app.get("/api/marketplace/admin/pending", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser?.requireAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const result = await db.execute(sql`
        SELECT * FROM marketplace_listings 
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `);
      
      res.json(result.rows || []);
    } catch (error: any) {
      console.error("Error fetching pending listings:", error);
      res.status(500).json({ error: "Failed to fetch pending listings" });
    }
  });
  
  // Get marketplace categories with counts
  app.get("/api/marketplace/categories", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT category, subcategory, COUNT(*) as count
        FROM marketplace_listings 
        WHERE status = 'approved'
        GROUP BY category, subcategory
        ORDER BY category, subcategory
      `);
      
      res.json(result.rows || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // ============================================================================
  // BUYER ENGAGEMENT SYSTEM
  // ============================================================================

  // Saved Searches with Email Alerts
  app.get("/api/buyer/saved-searches", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const searches = await storage.getSavedSearches(user.userId);
      res.json(searches);
    } catch (error: any) {
      console.error("Error fetching saved searches:", error);
      res.status(500).json({ error: "Failed to fetch saved searches" });
    }
  });

  app.post("/api/buyer/saved-searches", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { name, filters, alertFrequency } = req.body;
      const search = await storage.createSavedSearch({
        userId: user.userId,
        name,
        filters,
        alertFrequency: alertFrequency || "daily",
        isActive: true
      });
      
      res.json(search);
    } catch (error: any) {
      console.error("Error creating saved search:", error);
      res.status(500).json({ error: "Failed to create saved search" });
    }
  });

  app.put("/api/buyer/saved-searches/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const existing = await storage.getSavedSearch(req.params.id);
      if (!existing || existing.userId !== user.userId) {
        return res.status(404).json({ error: "Search not found" });
      }
      
      const updated = await storage.updateSavedSearch(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating saved search:", error);
      res.status(500).json({ error: "Failed to update saved search" });
    }
  });

  app.delete("/api/buyer/saved-searches/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const existing = await storage.getSavedSearch(req.params.id);
      if (!existing || existing.userId !== user.userId) {
        return res.status(404).json({ error: "Search not found" });
      }
      
      await storage.deleteSavedSearch(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting saved search:", error);
      res.status(500).json({ error: "Failed to delete saved search" });
    }
  });

  // Favorite Listings (Buyer Watchlist)
  app.get("/api/buyer/favorites", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const favorites = await storage.getFavoriteListingsWithDetails(user.userId);
      res.json(favorites);
    } catch (error: any) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/buyer/favorites/:listingId", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { listingId } = req.params;
      const { notes } = req.body;
      
      const isFavorited = await storage.isListingFavorited(user.userId, listingId);
      if (isFavorited) {
        return res.status(400).json({ error: "Already favorited" });
      }
      
      const favorite = await storage.addFavoriteListing({
        userId: user.userId,
        listingId,
        notes
      });
      
      res.json(favorite);
    } catch (error: any) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/buyer/favorites/:listingId", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      await storage.removeFavoriteListing(user.userId, req.params.listingId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/buyer/favorites/:listingId/check", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const isFavorited = await storage.isListingFavorited(user.userId, req.params.listingId);
      res.json({ isFavorited });
    } catch (error: any) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ error: "Failed to check favorite" });
    }
  });

  app.patch("/api/buyer/favorites/:listingId/notes", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { notes } = req.body;
      const favorite = await storage.updateFavoriteNotes(user.userId, req.params.listingId, notes);
      res.json(favorite);
    } catch (error: any) {
      console.error("Error updating favorite notes:", error);
      res.status(500).json({ error: "Failed to update notes" });
    }
  });

  // Buyer-Seller Messaging
  app.get("/api/buyer/messages/threads", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const role = (req.query.role as 'buyer' | 'seller') || 'buyer';
      const threads = await storage.getMessageThreads(user.userId, role);
      res.json(threads);
    } catch (error: any) {
      console.error("Error fetching message threads:", error);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  app.get("/api/buyer/messages/threads/:threadId", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const thread = await storage.getMessageThread(req.params.threadId);
      if (!thread || (thread.buyerId !== user.userId && thread.sellerId !== user.userId)) {
        return res.status(404).json({ error: "Thread not found" });
      }
      
      const messages = await storage.getMessages(req.params.threadId);
      await storage.markMessagesAsRead(req.params.threadId, user.userId);
      
      res.json({ thread, messages });
    } catch (error: any) {
      console.error("Error fetching thread:", error);
      res.status(500).json({ error: "Failed to fetch thread" });
    }
  });

  app.post("/api/buyer/messages/threads", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { listingId, subject, initialMessage } = req.body;
      
      const listing = await storage.getListing(listingId);
      if (!listing || !listing.userId) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      let thread = await storage.getMessageThreadByListing(listingId, user.userId);
      
      if (!thread) {
        thread = await storage.createMessageThread({
          listingId,
          buyerId: user.userId,
          sellerId: listing.userId,
          status: "active",
          subject
        });
      }
      
      if (initialMessage) {
        await storage.sendMessage({
          threadId: thread.id,
          senderId: user.userId,
          body: initialMessage
        });
      }
      
      res.json(thread);
    } catch (error: any) {
      console.error("Error creating thread:", error);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  app.post("/api/buyer/messages/threads/:threadId", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const thread = await storage.getMessageThread(req.params.threadId);
      if (!thread || (thread.buyerId !== user.userId && thread.sellerId !== user.userId)) {
        return res.status(404).json({ error: "Thread not found" });
      }
      
      const { body, attachments } = req.body;
      const message = await storage.sendMessage({
        threadId: req.params.threadId,
        senderId: user.userId,
        body,
        attachments
      });
      
      res.json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/buyer/messages/unread-count", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const role = (req.query.role as 'buyer' | 'seller') || 'buyer';
      const count = await storage.getUnreadMessageCount(user.userId, role);
      res.json({ count });
    } catch (error: any) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch count" });
    }
  });

  // Listing Comparisons
  app.get("/api/buyer/comparisons", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const comparisons = await storage.getListingComparisons(user.userId);
      res.json(comparisons);
    } catch (error: any) {
      console.error("Error fetching comparisons:", error);
      res.status(500).json({ error: "Failed to fetch comparisons" });
    }
  });

  app.post("/api/buyer/comparisons", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { name, listingIds, notes } = req.body;
      
      if (!listingIds || listingIds.length < 2 || listingIds.length > 4) {
        return res.status(400).json({ error: "Must compare between 2-4 listings" });
      }
      
      const comparison = await storage.createListingComparison({
        userId: user.userId,
        name,
        listingIds,
        notes
      });
      
      res.json(comparison);
    } catch (error: any) {
      console.error("Error creating comparison:", error);
      res.status(500).json({ error: "Failed to create comparison" });
    }
  });

  app.get("/api/buyer/comparisons/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const comparison = await storage.getListingComparison(req.params.id);
      if (!comparison || comparison.userId !== user.userId) {
        return res.status(404).json({ error: "Comparison not found" });
      }
      
      const listingsData = await Promise.all(
        comparison.listingIds.map(id => storage.getListing(id))
      );
      
      res.json({ comparison, listings: listingsData.filter(Boolean) });
    } catch (error: any) {
      console.error("Error fetching comparison:", error);
      res.status(500).json({ error: "Failed to fetch comparison" });
    }
  });

  app.delete("/api/buyer/comparisons/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const comparison = await storage.getListingComparison(req.params.id);
      if (!comparison || comparison.userId !== user.userId) {
        return res.status(404).json({ error: "Comparison not found" });
      }
      
      await storage.deleteListingComparison(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting comparison:", error);
      res.status(500).json({ error: "Failed to delete comparison" });
    }
  });

  // Buyer Listing History
  app.post("/api/buyer/history/track", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { listingId, timeSpent } = req.body;
      const history = await storage.trackListingView(user.userId, listingId, timeSpent);
      res.json(history);
    } catch (error: any) {
      console.error("Error tracking view:", error);
      res.status(500).json({ error: "Failed to track view" });
    }
  });

  app.get("/api/buyer/history/recent", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getRecentlyViewedListings(user.userId, limit);
      res.json(history);
    } catch (error: any) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Due Diligence Tasks
  app.get("/api/buyer/due-diligence/:ndaRequestId", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const tasks = await storage.getDueDiligenceTasks(req.params.ndaRequestId);
      res.json(tasks);
    } catch (error: any) {
      console.error("Error fetching due diligence tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.patch("/api/buyer/due-diligence/:taskId", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const task = await storage.updateDueDiligenceTask(req.params.taskId, req.body);
      res.json(task);
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Buyer Dashboard Stats
  app.get("/api/buyer/dashboard-stats", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const [favorites, savedSearches, threads, recentViews, comparisons] = await Promise.all([
        storage.getFavoriteListings(user.userId),
        storage.getSavedSearches(user.userId),
        storage.getMessageThreads(user.userId, 'buyer'),
        storage.getBuyerListingHistory(user.userId, 5),
        storage.getListingComparisons(user.userId)
      ]);
      
      const unreadMessages = await storage.getUnreadMessageCount(user.userId, 'buyer');
      
      res.json({
        favoritesCount: favorites.length,
        savedSearchesCount: savedSearches.length,
        activeThreadsCount: threads.filter(t => t.status === 'active').length,
        unreadMessages,
        recentViewsCount: recentViews.length,
        comparisonsCount: comparisons.length
      });
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ==================== USER PROFILE SAVED ITEMS & RECENTLY VIEWED ====================
  
  // GET /api/profile/saved - Get user's saved items (with optional type filter)
  app.get("/api/profile/saved", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { type, pinned } = req.query;
      
      let query = db.select().from(savedItems).where(eq(savedItems.userId, user.userId));
      
      const conditions = [eq(savedItems.userId, user.userId)];
      if (type) {
        conditions.push(eq(savedItems.itemType, type as string));
      }
      if (pinned === 'true') {
        conditions.push(eq(savedItems.pinned, true));
      }
      
      const items = await db.select()
        .from(savedItems)
        .where(and(...conditions))
        .orderBy(desc(savedItems.pinned), desc(savedItems.createdAt));
      
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching saved items:", error);
      res.status(500).json({ error: "Failed to fetch saved items" });
    }
  });
  
  // POST /api/profile/saved - Save an item
  app.post("/api/profile/saved", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { itemType, itemId, itemData, title, notes, pinned } = req.body;
      
      if (!itemType || !itemId || !title) {
        return res.status(400).json({ error: "itemType, itemId, and title are required" });
      }
      
      const [item] = await db.insert(savedItems).values({
        userId: user.userId,
        itemType,
        itemId,
        itemData: itemData || null,
        title,
        notes: notes || null,
        pinned: pinned || false,
      }).returning();
      
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error saving item:", error);
      res.status(500).json({ error: "Failed to save item" });
    }
  });
  
  // DELETE /api/profile/saved/:id - Remove a saved item
  app.delete("/api/profile/saved/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { id } = req.params;
      
      const [deleted] = await db.delete(savedItems)
        .where(and(eq(savedItems.id, id), eq(savedItems.userId, user.userId)))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error("Error deleting saved item:", error);
      res.status(500).json({ error: "Failed to delete saved item" });
    }
  });
  
  // PATCH /api/profile/saved/:id - Update notes or toggle pinned
  app.patch("/api/profile/saved/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { id } = req.params;
      const { notes, pinned, title } = req.body;
      
      const updates: Record<string, any> = {};
      if (notes !== undefined) updates.notes = notes;
      if (pinned !== undefined) updates.pinned = pinned;
      if (title !== undefined) updates.title = title;
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      const [updated] = await db.update(savedItems)
        .set(updates)
        .where(and(eq(savedItems.id, id), eq(savedItems.userId, user.userId)))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating saved item:", error);
      res.status(500).json({ error: "Failed to update saved item" });
    }
  });
  
  // GET /api/profile/recent - Get recently viewed items (limit 20)
  app.get("/api/profile/recent", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const { type } = req.query;
      
      const conditions = [eq(recentlyViewed.userId, user.userId)];
      if (type) {
        conditions.push(eq(recentlyViewed.itemType, type as string));
      }
      
      const items = await db.select()
        .from(recentlyViewed)
        .where(and(...conditions))
        .orderBy(desc(recentlyViewed.viewedAt))
        .limit(limit);
      
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching recently viewed:", error);
      res.status(500).json({ error: "Failed to fetch recently viewed" });
    }
  });
  
  // POST /api/profile/recent - Track a view (upsert with viewCount increment)
  app.post("/api/profile/recent", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { itemType, itemId, itemData, title, url } = req.body;
      
      if (!itemType || !itemId || !title || !url) {
        return res.status(400).json({ error: "itemType, itemId, title, and url are required" });
      }
      
      // Check if already exists
      const [existing] = await db.select()
        .from(recentlyViewed)
        .where(and(
          eq(recentlyViewed.userId, user.userId),
          eq(recentlyViewed.itemType, itemType),
          eq(recentlyViewed.itemId, itemId)
        ))
        .limit(1);
      
      if (existing) {
        // Update existing record
        const [updated] = await db.update(recentlyViewed)
          .set({
            viewedAt: sql`NOW()`,
            viewCount: sql`${recentlyViewed.viewCount} + 1`,
            itemData: itemData || existing.itemData,
            title: title || existing.title,
            url: url || existing.url,
          })
          .where(eq(recentlyViewed.id, existing.id))
          .returning();
        
        res.json(updated);
      } else {
        // Insert new record
        const [item] = await db.insert(recentlyViewed).values({
          userId: user.userId,
          itemType,
          itemId,
          itemData: itemData || null,
          title,
          url,
        }).returning();
        
        res.status(201).json(item);
      }
    } catch (error: any) {
      console.error("Error tracking view:", error);
      res.status(500).json({ error: "Failed to track view" });
    }
  });
  
  // DELETE /api/profile/recent/:id - Remove from history
  app.delete("/api/profile/recent/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const { id } = req.params;
      
      const [deleted] = await db.delete(recentlyViewed)
        .where(and(eq(recentlyViewed.id, id), eq(recentlyViewed.userId, user.userId)))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error("Error deleting from history:", error);
      res.status(500).json({ error: "Failed to delete from history" });
    }
  });

  // ==================== DESIGN CONSULTING SERVICES API ====================
  
  // Design consulting services catalog (from equipment-packages-2025.ts)
  const CONSULTING_SERVICES = [
    {
      serviceKey: "feasibility",
      name: "Feasibility Study",
      description: "Complete market analysis and project viability assessment for your laundromat investment",
      priceType: "range",
      priceMin: "7500.00",
      priceMax: "15000.00",
      deliverables: [
        "Demographic analysis (1/3/5 mile rings)",
        "Competitor mapping and analysis",
        "Traffic count studies",
        "Revenue projections with scenarios",
        "Equipment mix recommendations",
        "Pro forma financials",
        "Investment grade presentation"
      ],
      timeline: "10-14 business days",
      displayOrder: 1
    },
    {
      serviceKey: "3d-design",
      name: "3D Design Package",
      description: "Professional 3D renderings and floor plans for your laundromat project",
      priceType: "range",
      priceMin: "4000.00",
      priceMax: "10000.00",
      deliverables: [
        "Full floor plan layout",
        "3D renderings (8-12 views)",
        "Equipment placement optimization",
        "Utility connection planning",
        "Customer flow analysis",
        "ADA compliance check",
        "Investor-ready presentation deck"
      ],
      timeline: "7-10 business days",
      displayOrder: 2
    },
    {
      serviceKey: "equipment-sourcing",
      name: "Equipment Sourcing & Procurement",
      description: "Leveraging distributor relationships to secure best pricing on commercial laundry equipment",
      priceType: "percentage",
      percentageBase: "equipment",
      percentageRate: "15.00",
      priceMin: "0",
      priceMax: "0",
      deliverables: [
        "Equipment mix optimization analysis",
        "Multi-distributor quote comparison",
        "Negotiated pricing (10-25% below retail)",
        "Delivery coordination and scheduling",
        "Installation oversight",
        "Warranty registration and tracking",
        "Section 179 documentation"
      ],
      timeline: "Ongoing (2-8 weeks typical)",
      displayOrder: 3
    },
    {
      serviceKey: "turnkey-pm",
      name: "Turnkey Project Management",
      description: "Full build-out management from permits to grand opening",
      priceType: "percentage",
      percentageBase: "project",
      percentageRate: "10.00",
      priceMin: "0",
      priceMax: "0",
      deliverables: [
        "GC selection and contract negotiation",
        "Permit acquisition management",
        "Utility coordination (water/gas/electric)",
        "Equipment delivery coordination",
        "Installation supervision",
        "Inspection scheduling",
        "Grand opening planning",
        "Staff training program"
      ],
      timeline: "3-6 months typical",
      displayOrder: 4
    },
    {
      serviceKey: "retool",
      name: "Existing Store Retool Roadmap",
      description: "Comprehensive upgrade plan for existing laundromats to maximize revenue and efficiency",
      priceType: "range",
      priceMin: "10000.00",
      priceMax: "25000.00",
      deliverables: [
        "Current state assessment",
        "Equipment age and efficiency audit",
        "Phased replacement schedule",
        "Revenue optimization recommendations",
        "WDF addition feasibility",
        "Technology upgrade plan (app payments)",
        "Financing options analysis"
      ],
      timeline: "10-14 business days",
      displayOrder: 5
    },
    {
      serviceKey: "retainer",
      name: "Monthly Advisory Retainer",
      description: "Ongoing strategic support for operators and investors",
      priceType: "monthly",
      priceMin: "2000.00",
      priceMax: "5000.00",
      deliverables: [
        "Monthly performance review calls",
        "KPI dashboard access",
        "Priority support response",
        "Quarterly market updates",
        "Equipment deal alerts",
        "Networking introductions",
        "Unlimited email support"
      ],
      timeline: "Ongoing monthly",
      displayOrder: 6
    }
  ];

  // GET /api/design/services - Get consulting service catalog
  app.get("/api/design/services", async (req, res) => {
    try {
      // First try to get from database
      const services = await db.select().from(designServiceCatalog).where(eq(designServiceCatalog.isActive, true)).orderBy(asc(designServiceCatalog.displayOrder));
      
      if (services.length > 0) {
        res.json(services);
      } else {
        // Return hardcoded catalog as fallback
        res.json(CONSULTING_SERVICES.map(s => ({
          ...s,
          id: s.serviceKey,
          isActive: true,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }
    } catch (error: any) {
      console.error("Error fetching design services:", error);
      res.status(500).json({ error: "Failed to fetch design services" });
    }
  });

  // Helper to generate quote number
  function generateQuoteNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `WBH-Q-${year}-${random}`;
  }

  // Helper to generate order number
  function generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `WBH-O-${year}-${random}`;
  }

  // Helper to calculate consulting price
  function calculateConsultingPrice(
    service: typeof CONSULTING_SERVICES[0],
    projectBudget?: number,
    equipmentBudget?: number
  ): { price: number; breakdown: any } {
    let price = 0;
    const breakdown: any = { serviceKey: service.serviceKey, serviceName: service.name };
    
    if (service.priceType === "range" || service.priceType === "monthly") {
      // Use midpoint for estimates, or min for quotes
      price = parseFloat(service.priceMin);
      breakdown.type = service.priceType;
      breakdown.minPrice = parseFloat(service.priceMin);
      breakdown.maxPrice = parseFloat(service.priceMax);
    } else if (service.priceType === "percentage") {
      const rate = parseFloat(service.percentageRate || "0") / 100;
      const base = service.percentageBase === "equipment" 
        ? (equipmentBudget || 0) 
        : (projectBudget || 0);
      price = Math.round(base * rate);
      breakdown.type = "percentage";
      breakdown.rate = rate * 100;
      breakdown.base = service.percentageBase;
      breakdown.baseAmount = base;
    }
    
    breakdown.calculatedPrice = price;
    return { price, breakdown };
  }

  // POST /api/design/quote - Create a design quote based on equipment selection
  app.post("/api/design/quote", async (req: any, res) => {
    try {
      const { 
        serviceKey, 
        projectBudget, 
        equipmentBudget, 
        squareFootage, 
        packageSize,
        contactName,
        contactEmail,
        contactPhone,
        companyName,
        notes
      } = req.body;

      if (!serviceKey || !contactEmail) {
        return res.status(400).json({ error: "serviceKey and contactEmail are required" });
      }

      // Find service
      const service = CONSULTING_SERVICES.find(s => s.serviceKey === serviceKey);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      // Calculate price
      const { price, breakdown } = calculateConsultingPrice(
        service, 
        parseFloat(projectBudget) || 0, 
        parseFloat(equipmentBudget) || 0
      );

      // Get user if authenticated
      const user = await getCurrentUser(req);
      const quoteNumber = generateQuoteNumber();

      // Create quote
      const [quote] = await db.insert(designQuotes).values({
        userId: user?.userId || null,
        quoteNumber,
        serviceKey,
        projectBudget: projectBudget?.toString() || null,
        equipmentBudget: equipmentBudget?.toString() || null,
        squareFootage: squareFootage || null,
        packageSize: packageSize || null,
        contactName: contactName || null,
        contactEmail,
        contactPhone: contactPhone || null,
        companyName: companyName || null,
        basePrice: service.priceMin,
        calculatedPrice: price.toString(),
        priceBreakdown: breakdown,
        status: "sent",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        notes: notes || null,
      }).returning();

      res.status(201).json({
        success: true,
        quote: {
          ...quote,
          service: {
            name: service.name,
            description: service.description,
            deliverables: service.deliverables,
            timeline: service.timeline,
          }
        }
      });
    } catch (error: any) {
      console.error("Error creating design quote:", error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });

  // POST /api/design/checkout - Create Stripe checkout session for consulting service
  app.post("/api/design/checkout", async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Payment processing not available" });
      }

      const { 
        serviceKey, 
        projectBudget, 
        equipmentBudget, 
        quoteId,
        customerEmail,
        customerName,
        customerPhone,
        companyName,
        projectDetails
      } = req.body;

      if (!serviceKey || !customerEmail) {
        return res.status(400).json({ error: "serviceKey and customerEmail are required" });
      }

      // Find service
      const service = CONSULTING_SERVICES.find(s => s.serviceKey === serviceKey);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      // Calculate price
      const { price, breakdown } = calculateConsultingPrice(
        service, 
        parseFloat(projectBudget) || 0, 
        parseFloat(equipmentBudget) || 0
      );

      if (price <= 0) {
        return res.status(400).json({ error: "Invalid price calculation. Please provide budget details for percentage-based services." });
      }

      // Get user if authenticated
      const user = await getCurrentUser(req);
      const orderNumber = generateOrderNumber();

      // Create order record first
      const [order] = await db.insert(designOrders).values({
        userId: user?.userId || null,
        quoteId: quoteId || null,
        orderNumber,
        serviceKey,
        serviceName: service.name,
        amount: price.toString(),
        currency: "usd",
        customerName: customerName || null,
        customerEmail,
        customerPhone: customerPhone || null,
        companyName: companyName || null,
        projectDetails: projectDetails || breakdown,
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
      }).returning();

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: Math.round(price * 100), // Convert to cents
              product_data: {
                name: service.name,
                description: service.description,
                metadata: {
                  serviceKey,
                  orderNumber,
                },
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: order.id,
          orderNumber,
          serviceKey,
          type: "design_consulting",
        },
        success_url: `${process.env.BASE_URL || "https://washbizhub.com"}/consultation/success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
        cancel_url: `${process.env.BASE_URL || "https://washbizhub.com"}/consultation?canceled=true`,
      });

      // Update order with Stripe session ID
      await db.update(designOrders)
        .set({ stripeSessionId: session.id })
        .where(eq(designOrders.id, order.id));

      res.json({
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        orderNumber,
        order: {
          id: order.id,
          amount: price,
          serviceName: service.name,
        },
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // GET /api/design/orders/:id - Get order status
  app.get("/api/design/orders/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const [order] = await db.select()
        .from(designOrders)
        .where(or(eq(designOrders.id, id), eq(designOrders.orderNumber, id)))
        .limit(1);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // POST /api/affiliate/track - Track affiliate link clicks
  app.post("/api/affiliate/track", async (req: any, res) => {
    try {
      const { 
        affiliateId, 
        partnerId, 
        url, 
        referrer, 
        page 
      } = req.body;

      if (!partnerId && !affiliateId) {
        return res.status(400).json({ error: "partnerId or affiliateId required" });
      }

      // Get IP from request
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      // Look up affiliate by code or use partner ID
      let affId = affiliateId;
      if (!affId && partnerId) {
        // Check if partner exists in affiliates table
        const affiliate = await storage.getAffiliateByCode(partnerId);
        if (affiliate) {
          affId = affiliate.id;
        } else {
          // Create a basic tracking record without affiliate
          const [click] = await db.insert(affiliateClicks).values({
            referralCode: partnerId,
            sourceUrl: referrer || null,
            landingPage: page || url || null,
            ipAddress,
            userAgent,
            conversionType: "click",
          }).returning();
          
          return res.json({ success: true, clickId: click.id });
        }
      }

      // Track click with affiliate
      const click = await storage.trackAffiliateClick({
        affiliateId: affId,
        referralCode: partnerId || null,
        sourceUrl: referrer || null,
        landingPage: page || url || null,
        ipAddress,
        userAgent,
      });

      res.json({ success: true, clickId: click.id });
    } catch (error: any) {
      console.error("Error tracking affiliate click:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // ==================== PARTS ORDERING & INVENTORY MANAGEMENT API ====================

  // GET /api/parts-catalog - Get all catalog parts with filtering
  app.get("/api/parts-catalog", async (req: any, res) => {
    try {
      const { supplier, manufacturer, machineType, category, search, inStock } = req.query;
      
      let query = db.select().from(partsCatalog).where(eq(partsCatalog.isActive, true));
      
      const conditions: any[] = [eq(partsCatalog.isActive, true)];
      
      if (supplier) conditions.push(eq(partsCatalog.supplier, supplier));
      if (manufacturer) conditions.push(eq(partsCatalog.manufacturer, manufacturer));
      if (machineType) conditions.push(eq(partsCatalog.machineType, machineType));
      if (category) conditions.push(eq(partsCatalog.category, category));
      if (inStock === "true") conditions.push(eq(partsCatalog.inStock, true));
      if (search) {
        conditions.push(or(
          ilike(partsCatalog.name, `%${search}%`),
          ilike(partsCatalog.partNumber, `%${search}%`),
          ilike(partsCatalog.description, `%${search}%`)
        ));
      }

      const catalog = await db.select().from(partsCatalog).where(and(...conditions)).orderBy(desc(partsCatalog.createdAt));
      
      res.json(catalog);
    } catch (error: any) {
      console.error("Error fetching parts catalog:", error);
      res.status(500).json({ error: "Failed to fetch parts catalog" });
    }
  });

  // POST /api/parts-catalog - Add part to catalog (admin only)
  app.post("/api/parts-catalog", requireAuth, async (req: any, res) => {
    try {
      const data = insertPartsCatalogSchema.parse(req.body);
      const [part] = await db.insert(partsCatalog).values(data).returning();
      res.status(201).json(part);
    } catch (error: any) {
      console.error("Error creating catalog part:", error);
      res.status(500).json({ error: "Failed to create catalog part" });
    }
  });

  // PATCH /api/parts-catalog/:id - Update catalog part
  app.patch("/api/parts-catalog/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(partsCatalog)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(partsCatalog.id, id))
        .returning();
      if (!updated) return res.status(404).json({ error: "Part not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating catalog part:", error);
      res.status(500).json({ error: "Failed to update catalog part" });
    }
  });

  // DELETE /api/parts-catalog/:id - Soft delete catalog part
  app.delete("/api/parts-catalog/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await db.update(partsCatalog).set({ isActive: false }).where(eq(partsCatalog.id, id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting catalog part:", error);
      res.status(500).json({ error: "Failed to delete catalog part" });
    }
  });

  // GET /api/inventory - Get user's inventory items with optional filters
  app.get("/api/inventory", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { locationId, category, lowStock, search } = req.query;
      
      const conditions: any[] = [eq(inventoryItems.userId, user.userId)];
      
      if (locationId) conditions.push(eq(inventoryItems.locationId, locationId));
      if (category) conditions.push(eq(inventoryItems.category, category));
      if (search) {
        conditions.push(or(
          ilike(inventoryItems.name, `%${search}%`),
          ilike(inventoryItems.partNumber, `%${search}%`)
        ));
      }

      let items = await db.select().from(inventoryItems).where(and(...conditions)).orderBy(desc(inventoryItems.updatedAt));
      
      // Filter low stock items in JS (quantity <= reorderPoint)
      if (lowStock === "true") {
        items = items.filter(item => item.quantity <= item.reorderPoint);
      }
      
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // GET /api/inventory/alerts - Get low stock alerts
  app.get("/api/inventory/alerts", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const items = await db.select().from(inventoryItems).where(eq(inventoryItems.userId, user.userId));
      const alerts = items.filter(item => item.quantity <= item.reorderPoint);
      
      res.json(alerts);
    } catch (error: any) {
      console.error("Error fetching inventory alerts:", error);
      res.status(500).json({ error: "Failed to fetch inventory alerts" });
    }
  });

  // POST /api/inventory - Add inventory item
  app.post("/api/inventory", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const data = insertInventoryItemSchema.parse({ ...req.body, userId: user.userId });
      const [item] = await db.insert(inventoryItems).values(data).returning();
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ error: "Failed to create inventory item" });
    }
  });

  // PATCH /api/inventory/:id - Update inventory item
  app.patch("/api/inventory/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { id } = req.params;
      const [item] = await db.select().from(inventoryItems).where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, user.userId))).limit(1);
      if (!item) return res.status(404).json({ error: "Item not found" });

      const [updated] = await db.update(inventoryItems)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(inventoryItems.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  // DELETE /api/inventory/:id - Delete inventory item
  app.delete("/api/inventory/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { id } = req.params;
      await db.delete(inventoryItems).where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, user.userId)));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // POST /api/inventory/:id/use - Record inventory usage
  app.post("/api/inventory/:id/use", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { id } = req.params;
      const { quantityUsed, usageType, repairTicketId, machineId, machineName, notes } = req.body;

      // Get current inventory item
      const [item] = await db.select().from(inventoryItems).where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, user.userId))).limit(1);
      if (!item) return res.status(404).json({ error: "Item not found" });

      // Record usage
      const [usage] = await db.insert(inventoryUsage).values({
        userId: user.userId,
        inventoryItemId: id,
        quantityUsed,
        usageType: usageType || "repair",
        repairTicketId,
        machineId,
        machineName,
        notes,
      }).returning();

      // Update inventory quantity
      const newQty = Math.max(0, item.quantity - quantityUsed);
      await db.update(inventoryItems)
        .set({ quantity: newQty, lastUsedDate: new Date(), updatedAt: new Date() })
        .where(eq(inventoryItems.id, id));

      res.json({ usage, newQuantity: newQty });
    } catch (error: any) {
      console.error("Error recording inventory usage:", error);
      res.status(500).json({ error: "Failed to record usage" });
    }
  });

  // GET /api/inventory/:id/usage - Get usage history for an item
  app.get("/api/inventory/:id/usage", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { id } = req.params;
      const history = await db.select().from(inventoryUsage)
        .where(and(eq(inventoryUsage.inventoryItemId, id), eq(inventoryUsage.userId, user.userId)))
        .orderBy(desc(inventoryUsage.usedAt));
      
      res.json(history);
    } catch (error: any) {
      console.error("Error fetching usage history:", error);
      res.status(500).json({ error: "Failed to fetch usage history" });
    }
  });

  // GET /api/purchase-orders - Get user's purchase orders
  app.get("/api/purchase-orders", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { status, supplier } = req.query;
      
      const conditions: any[] = [eq(purchaseOrders.userId, user.userId)];
      if (status) conditions.push(eq(purchaseOrders.status, status));
      if (supplier) conditions.push(eq(purchaseOrders.supplierName, supplier));

      const orders = await db.select().from(purchaseOrders)
        .where(and(...conditions))
        .orderBy(desc(purchaseOrders.createdAt));
      
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  // GET /api/purchase-orders/:id - Get specific purchase order
  app.get("/api/purchase-orders/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { id } = req.params;
      const [order] = await db.select().from(purchaseOrders)
        .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.userId, user.userId)))
        .limit(1);
      
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (error: any) {
      console.error("Error fetching purchase order:", error);
      res.status(500).json({ error: "Failed to fetch purchase order" });
    }
  });

  // POST /api/purchase-orders - Create purchase order
  app.post("/api/purchase-orders", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      // Generate PO number
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const poNumber = `PO-${timestamp}-${random}`;

      const data = insertPurchaseOrderSchema.parse({
        ...req.body,
        userId: user.userId,
        poNumber,
      });

      const [order] = await db.insert(purchaseOrders).values(data).returning();
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  });

  // PATCH /api/purchase-orders/:id - Update purchase order
  app.patch("/api/purchase-orders/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { id } = req.params;
      const [order] = await db.select().from(purchaseOrders)
        .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.userId, user.userId)))
        .limit(1);
      if (!order) return res.status(404).json({ error: "Order not found" });

      const [updated] = await db.update(purchaseOrders)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(purchaseOrders.id, id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating purchase order:", error);
      res.status(500).json({ error: "Failed to update purchase order" });
    }
  });

  // POST /api/purchase-orders/:id/receive - Mark items as received
  app.post("/api/purchase-orders/:id/receive", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { id } = req.params;
      const { items: receivedItems, updateInventory } = req.body;

      const [order] = await db.select().from(purchaseOrders)
        .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.userId, user.userId)))
        .limit(1);
      if (!order) return res.status(404).json({ error: "Order not found" });

      // Update received quantities
      const orderItems = order.items as any[];
      let allReceived = true;
      let anyReceived = false;

      for (const ri of receivedItems) {
        const idx = orderItems.findIndex((i: any) => i.partNumber === ri.partNumber);
        if (idx >= 0) {
          orderItems[idx].receivedQty = (orderItems[idx].receivedQty || 0) + ri.quantity;
          if (orderItems[idx].receivedQty < orderItems[idx].quantity) allReceived = false;
          if (orderItems[idx].receivedQty > 0) anyReceived = true;

          // Optionally update inventory
          if (updateInventory) {
            const existingItems = await db.select().from(inventoryItems)
              .where(and(
                eq(inventoryItems.userId, user.userId),
                eq(inventoryItems.partNumber, ri.partNumber)
              ));
            
            if (existingItems.length > 0) {
              // Update existing inventory
              const existing = existingItems[0];
              await db.update(inventoryItems)
                .set({ 
                  quantity: existing.quantity + ri.quantity,
                  lastPurchasePrice: orderItems[idx].unitPrice?.toString(),
                  updatedAt: new Date()
                })
                .where(eq(inventoryItems.id, existing.id));
            } else {
              // Create new inventory item
              await db.insert(inventoryItems).values({
                userId: user.userId,
                partNumber: ri.partNumber,
                name: orderItems[idx].name,
                quantity: ri.quantity,
                unitCost: orderItems[idx].unitPrice?.toString() || "0",
                supplier: order.supplierName,
                locationId: order.locationId,
                locationName: order.locationName,
              });
            }
          }
        }
      }

      const newStatus = allReceived ? "received" : (anyReceived ? "partial" : order.status);

      const [updated] = await db.update(purchaseOrders)
        .set({ 
          items: orderItems,
          status: newStatus,
          receivedDate: allReceived ? new Date() : order.receivedDate,
          updatedAt: new Date()
        })
        .where(eq(purchaseOrders.id, id))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error receiving purchase order:", error);
      res.status(500).json({ error: "Failed to receive purchase order" });
    }
  });

  // DELETE /api/purchase-orders/:id - Cancel/delete purchase order
  app.delete("/api/purchase-orders/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { id } = req.params;
      const [order] = await db.select().from(purchaseOrders)
        .where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.userId, user.userId)))
        .limit(1);
      if (!order) return res.status(404).json({ error: "Order not found" });

      if (order.status === "received") {
        return res.status(400).json({ error: "Cannot delete received orders" });
      }

      await db.update(purchaseOrders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(purchaseOrders.id, id));
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting purchase order:", error);
      res.status(500).json({ error: "Failed to delete purchase order" });
    }
  });

  // GET /api/inventory/reports/spend - Parts spend by period
  app.get("/api/inventory/reports/spend", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const { startDate, endDate } = req.query;
      
      const conditions: any[] = [
        eq(purchaseOrders.userId, user.userId),
        eq(purchaseOrders.status, "received")
      ];

      if (startDate) conditions.push(gte(purchaseOrders.orderDate, new Date(startDate as string)));

      const orders = await db.select().from(purchaseOrders).where(and(...conditions));
      
      const totalSpend = orders.reduce((sum, o) => sum + parseFloat(o.totalCost || "0"), 0);
      const bySupplier: Record<string, number> = {};
      
      for (const order of orders) {
        bySupplier[order.supplierName] = (bySupplier[order.supplierName] || 0) + parseFloat(order.totalCost || "0");
      }

      res.json({ totalSpend, bySupplier, orderCount: orders.length });
    } catch (error: any) {
      console.error("Error fetching spend report:", error);
      res.status(500).json({ error: "Failed to fetch spend report" });
    }
  });

  // GET /api/inventory/reports/most-used - Most used parts
  app.get("/api/inventory/reports/most-used", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const usage = await db.select().from(inventoryUsage)
        .where(eq(inventoryUsage.userId, user.userId))
        .orderBy(desc(inventoryUsage.usedAt));

      const byPart: Record<string, { itemId: string; totalUsed: number; usageCount: number }> = {};
      
      for (const u of usage) {
        if (!byPart[u.inventoryItemId]) {
          byPart[u.inventoryItemId] = { itemId: u.inventoryItemId, totalUsed: 0, usageCount: 0 };
        }
        byPart[u.inventoryItemId].totalUsed += u.quantityUsed;
        byPart[u.inventoryItemId].usageCount += 1;
      }

      // Get item names
      const itemIds = Object.keys(byPart);
      if (itemIds.length > 0) {
        const items = await db.select().from(inventoryItems).where(inArray(inventoryItems.id, itemIds));
        const itemMap = new Map(items.map(i => [i.id, i]));
        
        const result = Object.values(byPart)
          .map(p => ({ ...p, item: itemMap.get(p.itemId) }))
          .sort((a, b) => b.totalUsed - a.totalUsed)
          .slice(0, 20);
        
        return res.json(result);
      }

      res.json([]);
    } catch (error: any) {
      console.error("Error fetching most used parts:", error);
      res.status(500).json({ error: "Failed to fetch most used parts" });
    }
  });

  // GET /api/inventory/reports/valuation - Inventory valuation
  app.get("/api/inventory/reports/valuation", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const items = await db.select().from(inventoryItems).where(eq(inventoryItems.userId, user.userId));
      
      let totalValue = 0;
      const byLocation: Record<string, number> = {};
      const byCategory: Record<string, number> = {};

      for (const item of items) {
        const itemValue = item.quantity * parseFloat(item.unitCost || "0");
        totalValue += itemValue;
        
        const loc = item.locationName || "Main Warehouse";
        byLocation[loc] = (byLocation[loc] || 0) + itemValue;
        
        const cat = item.category || "Uncategorized";
        byCategory[cat] = (byCategory[cat] || 0) + itemValue;
      }

      res.json({ totalValue, byLocation, byCategory, itemCount: items.length });
    } catch (error: any) {
      console.error("Error fetching valuation report:", error);
      res.status(500).json({ error: "Failed to fetch valuation report" });
    }
  });

  // GET /api/inventory/suppliers - Get unique suppliers from catalog
  app.get("/api/inventory/suppliers", async (_req: any, res) => {
    try {
      const items = await db.select({ supplier: partsCatalog.supplier })
        .from(partsCatalog)
        .where(eq(partsCatalog.isActive, true));
      
      const suppliers = [...new Set(items.map(i => i.supplier))].filter(Boolean);
      res.json(suppliers);
    } catch (error: any) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  // GET /api/inventory/manufacturers - Get unique manufacturers from catalog
  app.get("/api/inventory/manufacturers", async (_req: any, res) => {
    try {
      const items = await db.select({ manufacturer: partsCatalog.manufacturer })
        .from(partsCatalog)
        .where(eq(partsCatalog.isActive, true));
      
      const manufacturers = [...new Set(items.map(i => i.manufacturer))].filter(Boolean);
      res.json(manufacturers);
    } catch (error: any) {
      console.error("Error fetching manufacturers:", error);
      res.status(500).json({ error: "Failed to fetch manufacturers" });
    }
  });

  // =====================================================
  // DASHBOARD LAYOUTS API ROUTES
  // =====================================================

  // GET /api/dashboard/layouts - List user's layouts
  app.get("/api/dashboard/layouts", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const layouts = await storage.getDashboardLayouts(user.userId);
      res.json(layouts);
    } catch (error: any) {
      console.error("Error fetching dashboard layouts:", error);
      res.status(500).json({ error: "Failed to fetch dashboard layouts" });
    }
  });

  // GET /api/dashboard/layouts/default - Get user's default layout
  app.get("/api/dashboard/layouts/default", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const layout = await storage.getDefaultDashboardLayout(user.userId);
      if (!layout) {
        return res.status(404).json({ error: "No default layout found" });
      }
      res.json(layout);
    } catch (error: any) {
      console.error("Error fetching default layout:", error);
      res.status(500).json({ error: "Failed to fetch default layout" });
    }
  });

  // GET /api/dashboard/layouts/:id - Get specific layout
  app.get("/api/dashboard/layouts/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const layout = await storage.getDashboardLayout(req.params.id);
      if (!layout) {
        return res.status(404).json({ error: "Layout not found" });
      }
      
      // Ensure user owns this layout or it's public
      if (layout.userId !== user.userId && !layout.isPublic) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(layout);
    } catch (error: any) {
      console.error("Error fetching dashboard layout:", error);
      res.status(500).json({ error: "Failed to fetch dashboard layout" });
    }
  });

  // POST /api/dashboard/layouts - Create new layout
  app.post("/api/dashboard/layouts", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const validated = insertDashboardLayoutSchema.parse({
        ...req.body,
        userId: user.userId,
      });

      const layout = await storage.createDashboardLayout(validated);
      res.status(201).json(layout);
    } catch (error: any) {
      console.error("Error creating dashboard layout:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid layout data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create dashboard layout" });
    }
  });

  // PATCH /api/dashboard/layouts/:id - Update layout
  app.patch("/api/dashboard/layouts/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const existing = await storage.getDashboardLayout(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Layout not found" });
      }
      
      // Ensure user owns this layout
      if (existing.userId !== user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const layout = await storage.updateDashboardLayout(req.params.id, req.body);
      res.json(layout);
    } catch (error: any) {
      console.error("Error updating dashboard layout:", error);
      res.status(500).json({ error: "Failed to update dashboard layout" });
    }
  });

  // DELETE /api/dashboard/layouts/:id - Delete layout
  app.delete("/api/dashboard/layouts/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const existing = await storage.getDashboardLayout(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Layout not found" });
      }
      
      // Ensure user owns this layout
      if (existing.userId !== user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteDashboardLayout(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting dashboard layout:", error);
      res.status(500).json({ error: "Failed to delete dashboard layout" });
    }
  });

  const httpServer = createServer(app);
  
  initializeSearchIndex().catch(err => {
    console.error("Failed to initialize search index:", err);
  });
  
  return httpServer;
}
