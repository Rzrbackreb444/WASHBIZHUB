import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  users, listings, forumTopics, forumReplies, courses, enrollments,
  vendors, blogPosts, aiAgents, posTransactions, cleanbiUsage,
  newsletterSubscribers, tenants, pageSeoMetadata
} from "@shared/schema";
import { z } from "zod";
import { eq, sql, desc, count, sum, gte, and } from "drizzle-orm";
import multer from "multer";
import { ObjectStorageService } from "./objectStorage";

import * as bcrypt from "bcrypt";

const router = Router();

// Admin password hash from environment variable (secure storage)
// Generate hash: node -e "require('bcrypt').hash('your-secure-password', 12).then(console.log)"
function getAdminPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH || null;
}

// Check if email is in admin allowlist from environment variable
// Format: comma-separated emails in ADMIN_EMAILS env var
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS || "nick@washbizhub.com";
  return adminEmails.split(",").map(e => e.trim().toLowerCase()).includes(email.toLowerCase());
}

// Simple session storage (in production, use Redis)
const adminSessions = new Map<string, { email: string; expiresAt: Date; rememberMe: boolean }>();

// Generate secure session token
function generateToken(): string {
  const randomBytes = Array.from({ length: 32 }, () => 
    Math.random().toString(36).substring(2)
  ).join('').substring(0, 64);
  return `admin_${Date.now()}_${randomBytes}`;
}

// Middleware to check admin auth
export function requireAdmin(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.cookies?.adminToken;
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - no token provided" });
  }
  
  const session = adminSessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    adminSessions.delete(token);
    return res.status(401).json({ error: "Session expired - please login again" });
  }
  
  // Verify the session email is still an authorized admin
  if (!isAdminEmail(session.email)) {
    adminSessions.delete(token);
    return res.status(403).json({ error: "Admin access revoked" });
  }
  
  next();
}

// Admin login with secure password verification
router.post("/login", async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  
  // Verify email is in admin allowlist
  if (!isAdminEmail(email)) {
    console.log(`[Admin] Login attempt from non-admin email: ${email}`);
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  // Get password hash from environment
  const passwordHash = getAdminPasswordHash();
  if (!passwordHash) {
    console.error("[Admin] ADMIN_PASSWORD_HASH environment variable not set!");
    return res.status(500).json({ error: "Admin authentication not configured" });
  }
  
  // Verify password with bcrypt
  try {
    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
      console.log(`[Admin] Invalid password for: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("[Admin] Password verification error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
  
  // Create session
  const token = generateToken();
  const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 24 hours
  const expiresAt = new Date(Date.now() + sessionDuration);
  
  adminSessions.set(token, { email, expiresAt, rememberMe: !!rememberMe });
  
  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: sessionDuration
  });
  
  console.log(`[Admin] Successful login: ${email} (remember: ${!!rememberMe})`);
  return res.json({ success: true, token, user: { email } });
});

// Admin logout
router.post("/logout", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.cookies?.adminToken;
  
  if (token) {
    adminSessions.delete(token);
  }
  
  res.clearCookie("adminToken");
  return res.json({ success: true });
});

// Check auth status
router.get("/check", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || 
                req.cookies?.adminToken;
  
  if (!token) {
    return res.json({ authenticated: false });
  }
  
  const session = adminSessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    adminSessions.delete(token);
    return res.json({ authenticated: false });
  }
  
  return res.json({ authenticated: true, email: session.email });
});

// Dashboard overview stats
router.get("/dashboard/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // User stats
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [newUsersThisMonth] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));
    const [proUsersResult] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.isPro, true));

    // Listing stats
    const [totalListingsResult] = await db.select({ count: count() }).from(listings);
    const [activeListingsResult] = await db.select({ count: count() })
      .from(listings)
      .where(eq(listings.status, "active"));

    // Forum stats
    const [totalTopicsResult] = await db.select({ count: count() }).from(forumTopics);
    const [totalRepliesResult] = await db.select({ count: count() }).from(forumReplies);
    const [topicsThisWeek] = await db.select({ count: count() })
      .from(forumTopics)
      .where(gte(forumTopics.createdAt, sevenDaysAgo));

    // Course stats
    const [totalCoursesResult] = await db.select({ count: count() }).from(courses);
    const [totalEnrollmentsResult] = await db.select({ count: count() }).from(enrollments);

    // Blog stats
    const [totalBlogPostsResult] = await db.select({ count: count() }).from(blogPosts);
    const [publishedBlogsResult] = await db.select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    // Vendor stats
    const [totalVendorsResult] = await db.select({ count: count() }).from(vendors);

    // AI Agent stats
    const [totalAiAgentsResult] = await db.select({ count: count() }).from(aiAgents);

    // CLEANBI usage
    let cleanbiScans = 0;
    try {
      const [cleanbiResult] = await db.select({ count: count() }).from(cleanbiUsage);
      cleanbiScans = cleanbiResult?.count || 0;
    } catch (e) {
      // Table might not exist
    }

    // Newsletter subscribers
    let subscriberCount = 0;
    try {
      const [subscribersResult] = await db.select({ count: count() }).from(newsletterSubscribers);
      subscriberCount = subscribersResult?.count || 0;
    } catch (e) {
      // Table might not exist
    }

    // Tenants
    let tenantCount = 0;
    try {
      const [tenantsResult] = await db.select({ count: count() }).from(tenants);
      tenantCount = tenantsResult?.count || 0;
    } catch (e) {
      // Table might not exist
    }

    res.json({
      users: {
        total: totalUsersResult?.count || 0,
        newThisMonth: newUsersThisMonth?.count || 0,
        proUsers: proUsersResult?.count || 0,
      },
      listings: {
        total: totalListingsResult?.count || 0,
        active: activeListingsResult?.count || 0,
      },
      forum: {
        totalTopics: totalTopicsResult?.count || 0,
        totalReplies: totalRepliesResult?.count || 0,
        topicsThisWeek: topicsThisWeek?.count || 0,
      },
      courses: {
        total: totalCoursesResult?.count || 0,
        enrollments: totalEnrollmentsResult?.count || 0,
      },
      content: {
        blogPosts: totalBlogPostsResult?.count || 0,
        publishedBlogs: publishedBlogsResult?.count || 0,
      },
      vendors: {
        total: totalVendorsResult?.count || 0,
      },
      aiAgents: {
        total: totalAiAgentsResult?.count || 0,
      },
      cleanbi: {
        totalScans: cleanbiScans,
      },
      newsletter: {
        subscribers: subscriberCount,
      },
      tenants: {
        total: tenantCount,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Recent users
router.get("/dashboard/recent-users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isPro: users.isPro,
      subscriptionTier: users.subscriptionTier,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(20);
    
    res.json(recentUsers);
  } catch (error) {
    console.error("Recent users error:", error);
    res.status(500).json({ error: "Failed to fetch recent users" });
  }
});

// Recent listings
router.get("/dashboard/recent-listings", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentListings = await db.select({
      id: listings.id,
      title: listings.title,
      businessType: listings.businessType,
      status: listings.status,
      priceInUSD: listings.priceInUSD,
      city: listings.city,
      region: listings.region,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .orderBy(desc(listings.createdAt))
    .limit(20);
    
    res.json(recentListings);
  } catch (error) {
    console.error("Recent listings error:", error);
    res.status(500).json({ error: "Failed to fetch recent listings" });
  }
});

// Recent forum activity
router.get("/dashboard/recent-forum", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentTopics = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      categoryId: forumTopics.categoryId,
      views: forumTopics.views,
      replyCount: forumTopics.replyCount,
      createdAt: forumTopics.createdAt,
    })
    .from(forumTopics)
    .orderBy(desc(forumTopics.createdAt))
    .limit(15);
    
    res.json(recentTopics);
  } catch (error) {
    console.error("Recent forum error:", error);
    res.status(500).json({ error: "Failed to fetch recent forum activity" });
  }
});

// All users list
router.get("/dashboard/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username,
      isPro: users.isPro,
      isAdmin: users.isAdmin,
      subscriptionTier: users.subscriptionTier,
      aiConsultantTier: users.aiConsultantTier,
      cleanbiTier: users.cleanbiTier,
      role: users.role,
      companyName: users.companyName,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);
    
    res.json(allUsers);
  } catch (error) {
    console.error("Users list error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Recent blog posts
router.get("/dashboard/recent-blogs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentBlogs = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      status: blogPosts.status,
      category: blogPosts.category,
      type: blogPosts.type,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(15);
    
    res.json(recentBlogs);
  } catch (error) {
    console.error("Recent blogs error:", error);
    res.status(500).json({ error: "Failed to fetch recent blogs" });
  }
});

// CLEANBI usage stats
router.get("/dashboard/cleanbi-usage", requireAdmin, async (req: Request, res: Response) => {
  try {
    const usage = await db.select()
      .from(cleanbiUsage)
      .orderBy(desc(cleanbiUsage.createdAt))
      .limit(50);
    
    res.json(usage);
  } catch (error) {
    console.error("CLEANBI usage error:", error);
    res.json([]);
  }
});

// Tenant list
router.get("/dashboard/tenants", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allTenants = await db.select()
      .from(tenants)
      .orderBy(desc(tenants.createdAt));
    
    res.json(allTenants);
  } catch (error) {
    console.error("Tenants error:", error);
    res.json([]);
  }
});

// ==================== PAGE SEO METADATA ====================

// Get SEO metadata for a specific page
router.get("/page-seo", requireAdmin, async (req: Request, res: Response) => {
  try {
    const pagePath = req.query.pagePath as string;
    
    if (!pagePath) {
      return res.status(400).json({ error: "pagePath query parameter is required" });
    }
    
    const [seoData] = await db.select()
      .from(pageSeoMetadata)
      .where(eq(pageSeoMetadata.pagePath, pagePath))
      .limit(1);
    
    if (!seoData) {
      return res.json({ 
        pagePath,
        title: "",
        description: "",
        keywords: []
      });
    }
    
    res.json(seoData);
  } catch (error) {
    console.error("Get page SEO error:", error);
    res.status(500).json({ error: "Failed to fetch page SEO data" });
  }
});

// Save/Update SEO metadata for a page
router.post("/page-seo", requireAdmin, async (req: Request, res: Response) => {
  try {
    const inputSchema = z.object({
      pagePath: z.string().min(1),
      pageType: z.string().default("content"),
      title: z.string().default(""),
      description: z.string().default(""),
      keywords: z.array(z.string()).default([]),
      focusKeyphrase: z.string().optional(),
      secondaryKeyphrases: z.array(z.string()).optional(),
      featuredImageUrl: z.string().optional(),
      featuredImageAlt: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImageUrl: z.string().optional(),
      twitterTitle: z.string().optional(),
      twitterDescription: z.string().optional(),
      twitterImageUrl: z.string().optional(),
      twitterCardType: z.string().optional(),
      optimizationMode: z.enum(["auto", "manual", "hybrid"]).optional(),
      seoScore: z.number().optional(),
      isManuallyEdited: z.boolean().optional(),
      faqs: z.array(z.any()).optional(),
      features: z.array(z.any()).optional(),
      reviews: z.array(z.any()).optional()
    });
    
    const parseResult = inputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: parseResult.error.flatten() 
      });
    }
    
    const data = parseResult.data;
    
    const existingEntry = await db.select({ id: pageSeoMetadata.id })
      .from(pageSeoMetadata)
      .where(eq(pageSeoMetadata.pagePath, data.pagePath))
      .limit(1);
    
    let result;
    
    if (existingEntry.length > 0) {
      [result] = await db.update(pageSeoMetadata)
        .set({
          title: data.title,
          description: data.description,
          keywords: data.keywords as any,
          focusKeyphrase: data.focusKeyphrase || null,
          secondaryKeyphrases: data.secondaryKeyphrases || [],
          featuredImageUrl: data.featuredImageUrl || null,
          featuredImageAlt: data.featuredImageAlt || null,
          ogTitle: data.ogTitle || null,
          ogDescription: data.ogDescription || null,
          ogImageUrl: data.ogImageUrl || null,
          twitterTitle: data.twitterTitle || null,
          twitterDescription: data.twitterDescription || null,
          twitterImageUrl: data.twitterImageUrl || null,
          twitterCardType: data.twitterCardType || "summary_large_image",
          optimizationMode: data.optimizationMode || "manual",
          seoScore: data.seoScore || 0,
          isManuallyEdited: true,
          lastEditedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(pageSeoMetadata.pagePath, data.pagePath))
        .returning();
    } else {
      const pageType = data.pagePath.startsWith('/blog') ? 'blog' 
        : data.pagePath.startsWith('/calculator') || data.pagePath.startsWith('/cleanbi') ? 'tool'
        : data.pagePath.startsWith('/laundromat-listings') ? 'marketplace'
        : data.pagePath.startsWith('/pricing') ? 'pricing'
        : 'content';
      
      [result] = await db.insert(pageSeoMetadata)
        .values({
          pagePath: data.pagePath,
          pageType,
          title: data.title,
          description: data.description,
          keywords: data.keywords as any,
          focusKeyphrase: data.focusKeyphrase || null,
          secondaryKeyphrases: data.secondaryKeyphrases || [],
          featuredImageUrl: data.featuredImageUrl || null,
          featuredImageAlt: data.featuredImageAlt || null,
          ogTitle: data.ogTitle || null,
          ogDescription: data.ogDescription || null,
          ogImageUrl: data.ogImageUrl || null,
          twitterTitle: data.twitterTitle || null,
          twitterDescription: data.twitterDescription || null,
          twitterImageUrl: data.twitterImageUrl || null,
          twitterCardType: data.twitterCardType || "summary_large_image",
          optimizationMode: data.optimizationMode || "manual",
          seoScore: data.seoScore || 0,
          faqs: data.faqs || [],
          features: data.features || [],
          reviews: data.reviews || [],
          isManuallyEdited: true,
          lastEditedAt: new Date()
        })
        .returning();
    }
    
    res.json({ 
      success: true, 
      message: "SEO metadata saved successfully",
      data: result 
    });
  } catch (error) {
    console.error("Save page SEO error:", error);
    res.status(500).json({ error: "Failed to save page SEO data" });
  }
});

// AI Optimize SEO for a page
router.post("/page-seo/ai-optimize", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { pagePath, focusKeyphrase, currentTitle, currentDescription } = req.body;
    
    if (!focusKeyphrase) {
      return res.status(400).json({ error: "Focus keyphrase is required for AI optimization" });
    }
    
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `You are an SEO expert. Optimize the following SEO elements for the focus keyphrase: "${focusKeyphrase}"
    
Current page: ${pagePath}
Current title: ${currentTitle || "None"}
Current description: ${currentDescription || "None"}

Generate optimized versions that:
1. Include the focus keyphrase naturally
2. Are compelling and click-worthy
3. Follow best practices (title 50-60 chars, description 150-160 chars)
4. Are relevant to a laundromat industry website

Return JSON with these fields:
- title: optimized SEO title
- description: optimized meta description
- keywords: array of 5-8 relevant keywords
- ogTitle: slightly different title for social sharing
- ogDescription: engaging description for social media`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    
    const result = JSON.parse(completion.choices[0].message.content || "{}");
    res.json(result);
  } catch (error) {
    console.error("AI optimize SEO error:", error);
    res.status(500).json({ error: "Failed to generate AI optimizations" });
  }
});

// ==================== SEO IMAGE UPLOAD ====================

const objectStorageService = new ObjectStorageService();
const seoImageUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get signed URL for SEO image upload
router.post("/page-seo/upload-url", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { fileName, contentType } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }
    
    const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
    
    res.json({ 
      uploadUrl,
      message: "Use PUT request to upload file to this URL"
    });
  } catch (error) {
    console.error("Get upload URL error:", error);
    res.status(500).json({ error: "Failed to get upload URL" });
  }
});

// Upload SEO image directly
router.post("/page-seo/upload-image", requireAdmin, seoImageUpload.single('image'), async (req: Request, res: Response) => {
  try {
    console.log("[Upload] Starting image upload...");
    const file = req.file;
    if (!file) {
      console.log("[Upload] No file provided");
      return res.status(400).json({ error: "No image file provided" });
    }
    
    console.log("[Upload] File received:", file.originalname, file.size, "bytes");
    const { type = 'featured' } = req.body;
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop() || 'jpg';
    const fileName = `seo-${type}-${timestamp}.${ext}`;
    
    // Upload to public folder for SEO images
    const publicPaths = objectStorageService.getPublicObjectSearchPaths();
    console.log("[Upload] Public paths:", publicPaths);
    
    if (!publicPaths || publicPaths.length === 0) {
      console.error("[Upload] No public object paths configured");
      return res.status(500).json({ error: "Object storage not configured - no public paths" });
    }
    
    const publicPath = publicPaths[0];
    const { Storage } = await import("@google-cloud/storage");
    
    const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
    const storage = new Storage({
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
    
    // Parse bucket and path
    const pathParts = publicPath.split('/').filter(Boolean);
    const bucketName = pathParts[0];
    const objectPath = [...pathParts.slice(1), 'seo-images', fileName].join('/');
    
    console.log("[Upload] Uploading to bucket:", bucketName, "path:", objectPath);
    
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(objectPath);
    
    // Upload the file
    await blob.save(file.buffer, {
      contentType: file.mimetype,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    
    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
    console.log("[Upload] Success! URL:", publicUrl);
    
    res.json({ 
      success: true,
      url: publicUrl,
      fileName,
      type
    });
  } catch (error: any) {
    console.error("[Upload] SEO image error:", error?.message || error);
    console.error("[Upload] Stack:", error?.stack);
    res.status(500).json({ 
      error: "Failed to upload image", 
      details: error?.message || "Unknown error",
      code: error?.code
    });
  }
});

// ==================== COMPREHENSIVE SEO ANALYSIS ====================

router.post("/page-seo/analyze", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      pagePath, 
      title, 
      description, 
      focusKeyphrase,
      secondaryKeyphrases,
      content,
      featuredImageUrl,
      featuredImageAlt,
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription
    } = req.body;
    
    const issues: Array<{ type: 'error' | 'warning' | 'success' | 'info'; message: string; priority: number }> = [];
    let totalScore = 0;
    const maxScore = 100;
    
    // ===== TITLE ANALYSIS (25 points) =====
    let titleScore = 0;
    if (!title || title.length === 0) {
      issues.push({ type: 'error', message: 'SEO title is missing - add a compelling title', priority: 1 });
    } else {
      if (title.length < 30) {
        issues.push({ type: 'warning', message: `Title is too short (${title.length} chars) - aim for 50-60 characters`, priority: 2 });
        titleScore = 8;
      } else if (title.length > 60) {
        issues.push({ type: 'warning', message: `Title is too long (${title.length} chars) - may be truncated in search results`, priority: 2 });
        titleScore = 12;
      } else {
        issues.push({ type: 'success', message: `Title length is optimal (${title.length} chars)`, priority: 5 });
        titleScore = 18;
      }
      
      // Check focus keyphrase in title
      if (focusKeyphrase && title.toLowerCase().includes(focusKeyphrase.toLowerCase())) {
        issues.push({ type: 'success', message: 'Focus keyphrase appears in title', priority: 3 });
        titleScore += 7;
      } else if (focusKeyphrase) {
        issues.push({ type: 'error', message: 'Focus keyphrase NOT in title - add it for better rankings', priority: 1 });
      }
    }
    totalScore += titleScore;
    
    // ===== DESCRIPTION ANALYSIS (25 points) =====
    let descScore = 0;
    if (!description || description.length === 0) {
      issues.push({ type: 'error', message: 'Meta description is missing - add a compelling description', priority: 1 });
    } else {
      if (description.length < 100) {
        issues.push({ type: 'warning', message: `Description is too short (${description.length} chars) - aim for 150-160 characters`, priority: 2 });
        descScore = 8;
      } else if (description.length > 160) {
        issues.push({ type: 'warning', message: `Description is too long (${description.length} chars) - will be truncated`, priority: 2 });
        descScore = 12;
      } else {
        issues.push({ type: 'success', message: `Description length is optimal (${description.length} chars)`, priority: 5 });
        descScore = 18;
      }
      
      // Check focus keyphrase in description
      if (focusKeyphrase && description.toLowerCase().includes(focusKeyphrase.toLowerCase())) {
        issues.push({ type: 'success', message: 'Focus keyphrase appears in description', priority: 3 });
        descScore += 7;
      } else if (focusKeyphrase) {
        issues.push({ type: 'warning', message: 'Consider adding focus keyphrase to description', priority: 2 });
      }
    }
    totalScore += descScore;
    
    // ===== FOCUS KEYPHRASE ANALYSIS (20 points) =====
    let keyphraseScore = 0;
    if (!focusKeyphrase || focusKeyphrase.length === 0) {
      issues.push({ type: 'error', message: 'No focus keyphrase defined - essential for SEO targeting', priority: 1 });
    } else {
      issues.push({ type: 'success', message: `Focus keyphrase set: "${focusKeyphrase}"`, priority: 4 });
      keyphraseScore = 12;
      
      // Check keyphrase length
      const wordCount = focusKeyphrase.split(' ').length;
      if (wordCount >= 2 && wordCount <= 4) {
        issues.push({ type: 'success', message: 'Keyphrase length is ideal (2-4 words)', priority: 5 });
        keyphraseScore += 4;
      } else if (wordCount === 1) {
        issues.push({ type: 'warning', message: 'Single-word keyphrases are very competitive - consider long-tail keywords', priority: 3 });
        keyphraseScore += 2;
      }
      
      // Check secondary keyphrases
      const secondaryList = Array.isArray(secondaryKeyphrases) ? secondaryKeyphrases : [];
      if (secondaryList.length >= 2) {
        issues.push({ type: 'success', message: `${secondaryList.length} secondary keyphrases defined`, priority: 4 });
        keyphraseScore += 4;
      } else if (secondaryList.length > 0) {
        issues.push({ type: 'info', message: 'Add 2-5 secondary keyphrases for better coverage', priority: 3 });
        keyphraseScore += 2;
      } else {
        issues.push({ type: 'warning', message: 'No secondary keyphrases - add 2-5 for semantic coverage', priority: 2 });
      }
    }
    totalScore += keyphraseScore;
    
    // ===== IMAGE ANALYSIS (15 points) =====
    let imageScore = 0;
    if (!featuredImageUrl) {
      issues.push({ type: 'warning', message: 'No featured image - pages with images get 94% more views', priority: 2 });
    } else {
      issues.push({ type: 'success', message: 'Featured image is set', priority: 4 });
      imageScore = 8;
      
      if (featuredImageAlt && featuredImageAlt.length > 0) {
        issues.push({ type: 'success', message: 'Image alt text is set (great for accessibility & SEO)', priority: 4 });
        imageScore += 5;
        
        // Check if keyphrase in alt text
        if (focusKeyphrase && featuredImageAlt.toLowerCase().includes(focusKeyphrase.toLowerCase())) {
          issues.push({ type: 'success', message: 'Focus keyphrase in image alt text', priority: 4 });
          imageScore += 2;
        }
      } else {
        issues.push({ type: 'error', message: 'Missing image alt text - critical for accessibility & SEO', priority: 1 });
      }
    }
    totalScore += imageScore;
    
    // ===== SOCIAL MEDIA ANALYSIS (15 points) =====
    let socialScore = 0;
    
    // Open Graph
    if (ogTitle || ogDescription) {
      issues.push({ type: 'success', message: 'Open Graph tags configured for social sharing', priority: 4 });
      socialScore += 5;
    } else {
      issues.push({ type: 'info', message: 'Set Open Graph tags for better Facebook/LinkedIn previews', priority: 3 });
    }
    
    // Twitter
    if (twitterTitle || twitterDescription) {
      issues.push({ type: 'success', message: 'Twitter Card configured', priority: 4 });
      socialScore += 5;
    } else {
      issues.push({ type: 'info', message: 'Set Twitter Card for better Twitter previews', priority: 3 });
    }
    
    // Social image
    if (featuredImageUrl) {
      socialScore += 5;
    }
    totalScore += socialScore;
    
    // ===== URL ANALYSIS =====
    if (pagePath) {
      if (focusKeyphrase) {
        const slugifiedKeyphrase = focusKeyphrase.toLowerCase().replace(/\s+/g, '-');
        if (pagePath.toLowerCase().includes(slugifiedKeyphrase) || 
            pagePath.toLowerCase().includes(focusKeyphrase.toLowerCase().replace(/\s+/g, ''))) {
          issues.push({ type: 'success', message: 'Focus keyphrase appears in URL', priority: 4 });
        } else {
          issues.push({ type: 'info', message: 'Consider including focus keyphrase in URL for better SEO', priority: 3 });
        }
      }
      
      if (pagePath.length > 75) {
        issues.push({ type: 'warning', message: 'URL is quite long - shorter URLs often rank better', priority: 3 });
      }
    }
    
    // Sort issues by priority (lower number = higher priority)
    issues.sort((a, b) => a.priority - b.priority);
    
    // Calculate grade
    let grade = 'Needs Work';
    let gradeColor = '#C8A661';
    if (totalScore >= 90) { grade = 'A+'; gradeColor = '#22C55E'; }
    else if (totalScore >= 80) { grade = 'A'; gradeColor = '#22C55E'; }
    else if (totalScore >= 70) { grade = 'B'; gradeColor = '#A3E635'; }
    else if (totalScore >= 55) { grade = 'C'; gradeColor = '#FBBF24'; }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (!focusKeyphrase) {
      recommendations.push('Define a focus keyphrase to target specific search queries');
    }
    if (titleScore < 20) {
      recommendations.push('Optimize your title to include the focus keyphrase and be 50-60 characters');
    }
    if (descScore < 20) {
      recommendations.push('Write a compelling meta description with your focus keyphrase (150-160 chars)');
    }
    if (imageScore < 10) {
      recommendations.push('Add a featured image with descriptive alt text');
    }
    if (socialScore < 10) {
      recommendations.push('Configure Open Graph and Twitter Card for better social sharing');
    }
    
    res.json({
      score: totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      grade,
      gradeColor,
      breakdown: {
        title: { score: titleScore, max: 25 },
        description: { score: descScore, max: 25 },
        keyphrase: { score: keyphraseScore, max: 20 },
        image: { score: imageScore, max: 15 },
        social: { score: socialScore, max: 15 }
      },
      issues: issues.map(i => ({ type: i.type, message: i.message })),
      recommendations,
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("SEO analysis error:", error);
    res.status(500).json({ error: "Failed to analyze SEO" });
  }
});

export default router;
