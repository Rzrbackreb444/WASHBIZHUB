import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { serviceGuyUsage, diagnosticAccessLogs, scrapingBlocklist } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import crypto from "crypto";

// Rate limiting configuration by tier - PROTECT VALUABLE DATABASE
// Free users get minimal access to prevent scraping and demonstrate value
const TIER_LIMITS = {
  free: { monthlyLookups: 3, requestsPerMinute: 1 },      // 3 lookups/month, 1/min max - just enough to see value
  starter: { monthlyLookups: 50, requestsPerMinute: 5 },  // $29/mo - 50 lookups, reasonable pace
  pro: { monthlyLookups: 500, requestsPerMinute: 15 },    // $79/mo - 500 lookups (NOT unlimited to prevent abuse)
  enterprise: { monthlyLookups: -1, requestsPerMinute: 30 }, // $199/mo - unlimited, reasonable rate
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

// Enhanced content obfuscation - PROTECT VALUABLE DATABASE
// Tiers: free (guests/basic), starter ($29), pro ($79), enterprise ($199)
export function obfuscateContent(content: any, tier: string): any {
  const obfuscated = { ...content };
  
  // Mark content as protected
  obfuscated.isProtected = true;
  obfuscated.tier = tier;
  
  // ENTERPRISE ($199/mo) - Most access, but still protect crown jewels
  if (tier === "enterprise") {
    // Full troubleshooting steps and parts
    // Still hide some proprietary data
    obfuscated.internalNotes = undefined;
    obfuscated.proprietaryData = undefined;
    return obfuscated;
  }
  
  // PRO ($79/mo) - Good access for working technicians
  if (tier === "pro") {
    // Show troubleshooting steps but limit detailed parts pricing
    if (obfuscated.partsWithPricing?.length > 5) {
      obfuscated.partsWithPricing = [
        ...obfuscated.partsWithPricing.slice(0, 5),
        { partNumber: "...", name: "Upgrade to Enterprise for complete parts list", estimatedPrice: 0 }
      ];
    }
    obfuscated.testModeEntry = obfuscated.testModeEntry ? 
      obfuscated.testModeEntry.substring(0, 50) + "... [Enterprise access for full procedure]" : null;
    return obfuscated;
  }
  
  // STARTER ($29/mo) - Limited access, tease value
  if (tier === "starter") {
    // Truncate possible causes
    if (obfuscated.possibleCauses?.length > 2) {
      obfuscated.possibleCauses = [
        ...obfuscated.possibleCauses.slice(0, 2),
        `+ ${obfuscated.possibleCauses.length - 2} more causes (Pro access)`
      ];
    }
    
    // Show first 2 troubleshooting steps only
    if (obfuscated.troubleshootingSteps?.length > 2) {
      obfuscated.troubleshootingSteps = [
        obfuscated.troubleshootingSteps[0],
        obfuscated.troubleshootingSteps[1],
        `📋 ${obfuscated.troubleshootingSteps.length - 2} more steps available with Pro subscription`
      ];
    }
    
    // No parts pricing
    obfuscated.partsWithPricing = null;
    obfuscated.requiredParts = obfuscated.requiredParts?.length > 0 ? 
      ["Parts list available with Pro subscription"] : null;
    
    // Hide advanced fields
    obfuscated.quickFix = "🔓 Quick fix tips available with Pro subscription";
    obfuscated.testModeEntry = null;
    
    return obfuscated;
  }
  
  // FREE TIER - Show just enough to demonstrate value, protect everything else
  // These users haven't paid anything - give them a taste, not the meal
  
  // Truncate description to tease
  if (obfuscated.description && obfuscated.description.length > 80) {
    obfuscated.description = obfuscated.description.substring(0, 80) + "... [Sign up for full description]";
  }
  
  // Show only first cause, heavily redacted
  if (obfuscated.possibleCauses?.length > 0) {
    obfuscated.possibleCauses = [
      obfuscated.possibleCauses[0]?.substring(0, 30) + "...",
      `🔒 ${obfuscated.possibleCauses.length} possible causes identified - Subscribe to view`
    ];
  }
  
  // No troubleshooting steps for free users
  obfuscated.troubleshootingSteps = [
    "🔒 Detailed repair procedure protected",
    "Subscribe to Service Guy AI to unlock step-by-step repair guides"
  ];
  
  // Hide all parts information
  obfuscated.partsWithPricing = null;
  obfuscated.requiredParts = null;
  
  // Hide quick fix and test mode
  obfuscated.quickFix = null;
  obfuscated.testModeEntry = null;
  
  // Hide repair time and difficulty from free users
  obfuscated.estimatedRepairTime = null;
  obfuscated.difficultyLevel = "Subscribe to view";
  
  // Add upgrade prompt
  obfuscated.upgradePrompt = {
    message: "Unlock full diagnostic data with Service Guy AI subscription",
    tiers: [
      { name: "Starter", price: "$29/mo", features: ["50 lookups/month", "Basic troubleshooting", "Email support"] },
      { name: "Pro", price: "$79/mo", features: ["Unlimited lookups", "Full repair procedures", "Parts pricing", "Priority support"] },
      { name: "Enterprise", price: "$199/mo", features: ["Multi-user access", "API access", "Complete database", "Dedicated support"] }
    ]
  };
  
  return obfuscated;
}
