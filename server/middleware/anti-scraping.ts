import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { serviceGuyUsage, diagnosticAccessLogs, scrapingBlocklist } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import crypto from "crypto";

// Rate limiting configuration by tier
const TIER_LIMITS = {
  free: { monthlyLookups: 5, requestsPerMinute: 2 },
  starter: { monthlyLookups: 50, requestsPerMinute: 10 },
  pro: { monthlyLookups: -1, requestsPerMinute: 30 }, // -1 = unlimited
  enterprise: { monthlyLookups: -1, requestsPerMinute: 100 },
};

// Bot detection patterns
const BOT_USER_AGENTS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
  /python-requests/i, /scrapy/i, /httpclient/i, /java\//i,
  /phantomjs/i, /headless/i, /selenium/i, /puppeteer/i,
];

// Generate fingerprint hash from request headers
function generateFingerprint(req: Request): string {
  const components = [
    req.ip,
    req.headers["user-agent"] || "",
    req.headers["accept-language"] || "",
    req.headers["accept-encoding"] || "",
  ].join("|");
  
  return crypto.createHash("sha256").update(components).digest("hex").substring(0, 32);
}

// Check if user agent appears to be a bot
function detectBot(userAgent: string | undefined): boolean {
  if (!userAgent) return true; // No user agent = suspicious
  return BOT_USER_AGENTS.some(pattern => pattern.test(userAgent));
}

// Check if IP is in blocklist
async function isBlocked(ip: string, userId?: string, fingerprint?: string): Promise<boolean> {
  const now = new Date();
  
  const blocked = await db.select()
    .from(scrapingBlocklist)
    .where(
      and(
        sql`(${scrapingBlocklist.ipAddress} = ${ip} OR ${scrapingBlocklist.userId} = ${userId} OR ${scrapingBlocklist.fingerprintHash} = ${fingerprint})`,
        sql`(${scrapingBlocklist.isPermanent} = true OR ${scrapingBlocklist.blockedUntil} > ${now})`
      )
    )
    .limit(1);
  
  return blocked.length > 0;
}

// Get or create usage record
async function getOrCreateUsage(userId: string | null, sessionId: string | null, ip: string): Promise<typeof serviceGuyUsage.$inferSelect | null> {
  const periodStart = new Date();
  periodStart.setDate(1); // First of current month
  periodStart.setHours(0, 0, 0, 0);
  
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  
  // Try to find existing usage record
  let existing;
  if (userId) {
    [existing] = await db.select()
      .from(serviceGuyUsage)
      .where(and(
        eq(serviceGuyUsage.userId, userId),
        gte(serviceGuyUsage.periodStart, periodStart)
      ))
      .limit(1);
  } else if (sessionId) {
    [existing] = await db.select()
      .from(serviceGuyUsage)
      .where(and(
        eq(serviceGuyUsage.sessionId, sessionId),
        gte(serviceGuyUsage.periodStart, periodStart)
      ))
      .limit(1);
  } else {
    [existing] = await db.select()
      .from(serviceGuyUsage)
      .where(and(
        eq(serviceGuyUsage.ipAddress, ip),
        gte(serviceGuyUsage.periodStart, periodStart)
      ))
      .limit(1);
  }
  
  if (existing) return existing;
  
  // Create new usage record
  const [newUsage] = await db.insert(serviceGuyUsage).values({
    userId,
    sessionId,
    ipAddress: ip,
    lookupCount: 0,
    periodStart,
    periodEnd,
    tierLimit: 5, // Default to free tier
  }).returning();
  
  return newUsage;
}

// Main anti-scraping middleware for diagnostic endpoints
export async function antiScrapingMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"];
  const fingerprint = generateFingerprint(req);
  
  // Add fingerprint to request for later use
  (req as any).fingerprint = fingerprint;
  
  try {
    // Check blocklist first
    if (await isBlocked(ip, (req as any).user?.id, fingerprint)) {
      console.log(`[ANTI-SCRAPE] Blocked request from ${ip}`);
      return res.status(429).json({ 
        error: "Access temporarily restricted. Please try again later.",
        blocked: true 
      });
    }
    
    // Check for obvious bots - BLOCK THEM
    if (detectBot(userAgent)) {
      console.log(`[ANTI-SCRAPE] Bot blocked from ${ip}: ${userAgent}`);
      
      // Add to blocklist for 1 hour
      await db.insert(scrapingBlocklist).values({
        ipAddress: ip,
        fingerprintHash: fingerprint,
        reason: "bot_detected",
        evidence: { userAgent, timestamp: new Date().toISOString() },
        blockedUntil: new Date(Date.now() + 60 * 60 * 1000), // 1 hour block
      }).catch(() => {}); // Ignore if already blocked
      
      return res.status(403).json({ 
        error: "Automated access is not permitted. Please use a browser.",
        code: "BOT_DETECTED"
      });
    }
    
    // Check honeypot field (if client sends this hidden field, they're scraping)
    if (req.body?.wbh_verify_human) {
      console.log(`[ANTI-SCRAPE] Honeypot triggered from ${ip}`);
      
      // Block for 24 hours - honeypot is serious
      await db.insert(scrapingBlocklist).values({
        ipAddress: ip,
        fingerprintHash: fingerprint,
        reason: "honeypot_triggered",
        evidence: { userAgent, timestamp: new Date().toISOString() },
        blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour block
        isPermanent: false,
      }).catch(() => {});
      
      return res.status(403).json({ error: "Access denied" });
    }
    
    next();
  } catch (error) {
    console.error("[ANTI-SCRAPE] Error:", error);
    next(); // Allow on error to prevent blocking legitimate users
  }
}

// Rate limiting middleware for diagnostic lookups
export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userId = (req as any).user?.id || null;
  const sessionId = req.sessionID || null;
  const fingerprint = (req as any).fingerprint || generateFingerprint(req);
  
  try {
    // Check blocklist
    if (await isBlocked(ip, userId, fingerprint)) {
      return res.status(429).json({ 
        error: "Too many requests. Please try again later.",
        blocked: true 
      });
    }
    
    // Get usage record
    const usage = await getOrCreateUsage(userId, sessionId, ip);
    if (!usage) {
      return next(); // Allow if we can't track
    }
    
    // Get user's tier
    let tier = "free";
    if ((req as any).user?.subscriptionTier) {
      tier = (req as any).user.subscriptionTier;
    }
    
    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
    
    // Check monthly limit
    if (limits.monthlyLookups !== -1 && (usage.lookupCount || 0) >= limits.monthlyLookups) {
      return res.status(429).json({
        error: "Monthly lookup limit reached",
        limit: limits.monthlyLookups,
        used: usage.lookupCount,
        upgradeUrl: "/pricing",
        tier,
      });
    }
    
    // Check per-minute rate limit
    const now = new Date();
    const minuteAgo = new Date(now.getTime() - 60 * 1000);
    
    if (usage.minuteResetAt && new Date(usage.minuteResetAt) < minuteAgo) {
      // Reset minute counter
      await db.update(serviceGuyUsage)
        .set({ lookupThisMinute: 1, minuteResetAt: now })
        .where(eq(serviceGuyUsage.id, usage.id));
    } else if ((usage.lookupThisMinute || 0) >= limits.requestsPerMinute) {
      return res.status(429).json({
        error: "Too many requests. Please slow down.",
        retryAfter: 60,
      });
    } else {
      // Increment minute counter
      await db.update(serviceGuyUsage)
        .set({ 
          lookupThisMinute: sql`${serviceGuyUsage.lookupThisMinute} + 1`,
          minuteResetAt: usage.minuteResetAt || now,
        })
        .where(eq(serviceGuyUsage.id, usage.id));
    }
    
    // Store usage info for later increment
    (req as any).usageId = usage.id;
    (req as any).tier = tier;
    (req as any).remainingLookups = limits.monthlyLookups === -1 
      ? "unlimited" 
      : limits.monthlyLookups - (usage.lookupCount || 0) - 1;
    
    next();
  } catch (error) {
    console.error("[RATE LIMIT] Error:", error);
    next(); // Allow on error to prevent blocking legitimate users
  }
}

// Log access and increment usage counter
export async function logDiagnosticAccess(
  req: Request,
  diagnosticCodeId: string | null,
  requestedCode: string,
  requestedManufacturer: string,
  responseType: string
) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userId = (req as any).user?.id || null;
  const sessionId = req.sessionID || null;
  const fingerprint = (req as any).fingerprint;
  const usageId = (req as any).usageId;
  
  try {
    // Log the access
    await db.insert(diagnosticAccessLogs).values({
      userId,
      sessionId,
      ipAddress: ip,
      diagnosticCodeId,
      requestedCode,
      requestedManufacturer,
      userAgent: req.headers["user-agent"],
      referer: req.headers.referer,
      acceptLanguage: req.headers["accept-language"],
      honeypotTriggered: (req as any).honeypotTriggered || false,
      responseType,
      fingerprintHash: fingerprint,
    });
    
    // Increment usage counter if we have a usage record
    if (usageId) {
      await db.update(serviceGuyUsage)
        .set({ 
          lookupCount: sql`${serviceGuyUsage.lookupCount} + 1`,
          lastLookupAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(serviceGuyUsage.id, usageId));
    }
  } catch (error) {
    console.error("[ACCESS LOG] Error:", error);
  }
}

// Content obfuscation for free tier (hide detailed procedures)
export function obfuscateContent(content: any, tier: string): any {
  if (tier === "pro" || tier === "enterprise") {
    return content; // Full access
  }
  
  // For free/starter tiers, hide detailed procedures
  const obfuscated = { ...content };
  
  if (tier === "free") {
    // Only show basic info
    obfuscated.troubleshootingSteps = ["Upgrade to view detailed repair steps"];
    obfuscated.partsWithPricing = null;
    obfuscated.quickFix = "Upgrade to Pro for quick fix tips";
    obfuscated.testModeEntry = null;
  } else if (tier === "starter") {
    // Show some info but not all
    if (obfuscated.troubleshootingSteps?.length > 3) {
      obfuscated.troubleshootingSteps = [
        ...obfuscated.troubleshootingSteps.slice(0, 3),
        "Upgrade to Pro for complete repair procedure..."
      ];
    }
  }
  
  return obfuscated;
}
