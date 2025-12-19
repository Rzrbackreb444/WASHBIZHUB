import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

interface DeviceFingerprint {
  userAgent: string;
  ip: string;
  acceptLanguage: string;
  acceptEncoding: string;
}

interface SubscriptionTier {
  id: string;
  name: string;
  level: number;
  features: string[];
  rateLimit: number;
  exportLimit: number;
  apiAccess: boolean;
  cleanbiAccess: boolean;
  demographicsAccess: boolean;
  competitionAccess: boolean;
  posAccess: boolean;
  dashboardAccess: boolean;
  whiteLabel: boolean;
}

const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: "free",
    name: "Free",
    level: 0,
    features: ["basic_calculator", "limited_marketplace"],
    rateLimit: 30,
    exportLimit: 0,
    apiAccess: false,
    cleanbiAccess: false,
    demographicsAccess: false,
    competitionAccess: false,
    posAccess: false,
    dashboardAccess: false,
    whiteLabel: false,
  },
  starter: {
    id: "starter",
    name: "Starter",
    level: 1,
    features: ["calculators", "marketplace", "basic_cleanbi"],
    rateLimit: 100,
    exportLimit: 5,
    apiAccess: false,
    cleanbiAccess: true,
    demographicsAccess: false,
    competitionAccess: false,
    posAccess: false,
    dashboardAccess: true,
    whiteLabel: false,
  },
  professional: {
    id: "professional",
    name: "Professional",
    level: 2,
    features: ["calculators", "marketplace", "cleanbi", "demographics", "competition", "templates"],
    rateLimit: 500,
    exportLimit: 50,
    apiAccess: true,
    cleanbiAccess: true,
    demographicsAccess: true,
    competitionAccess: true,
    posAccess: false,
    dashboardAccess: true,
    whiteLabel: false,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    level: 3,
    features: ["all"],
    rateLimit: 2000,
    exportLimit: 500,
    apiAccess: true,
    cleanbiAccess: true,
    demographicsAccess: true,
    competitionAccess: true,
    posAccess: true,
    dashboardAccess: true,
    whiteLabel: true,
  },
  distributor: {
    id: "distributor",
    name: "Distributor White-Label",
    level: 4,
    features: ["all", "white_label", "fleet_monitoring", "service_ai", "parts_intelligence", "dispatch", "receptionist"],
    rateLimit: 10000,
    exportLimit: -1,
    apiAccess: true,
    cleanbiAccess: true,
    demographicsAccess: true,
    competitionAccess: true,
    posAccess: true,
    dashboardAccess: true,
    whiteLabel: true,
  },
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const suspiciousActivityStore = new Map<string, number>();
const deviceFingerprintStore = new Map<string, DeviceFingerprint[]>();

function getClientIdentifier(req: Request): string {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const userId = (req as any).user?.id;
  const sessionId = req.sessionID;
  return userId ? `user:${userId}` : sessionId ? `session:${sessionId}` : `ip:${ip}`;
}

function generateDeviceFingerprint(req: Request): string {
  const data: DeviceFingerprint = {
    userAgent: req.headers["user-agent"] || "",
    ip: req.ip || "",
    acceptLanguage: req.headers["accept-language"] || "",
    acceptEncoding: req.headers["accept-encoding"] || "",
  };
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex").substring(0, 16);
}

function getUserTier(req: Request): SubscriptionTier {
  const user = (req as any).user;
  if (!user) return SUBSCRIPTION_TIERS.free;
  
  const distributorId = (req as any).distributorId;
  if (distributorId) return SUBSCRIPTION_TIERS.distributor;
  
  const tierName = user.subscriptionTier || "free";
  return SUBSCRIPTION_TIERS[tierName] || SUBSCRIPTION_TIERS.free;
}

export function rateLimitMiddleware(customLimit?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientIdentifier(req);
    const tier = getUserTier(req);
    const limit = customLimit || tier.rateLimit;
    const windowMs = 60 * 1000;
    const now = Date.now();

    let entry = rateLimitStore.get(clientId);
    
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      res.setHeader("Retry-After", Math.ceil((entry.blockUntil - now) / 1000));
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
        message: "Your access has been temporarily blocked due to excessive requests. Please try again later."
      });
    }

    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs, blocked: false };
    }

    entry.count++;
    
    if (entry.count > limit * 2) {
      entry.blocked = true;
      entry.blockUntil = now + (5 * 60 * 1000);
      rateLimitStore.set(clientId, entry);
      
      logSecurityEvent(req, "rate_limit_block", { count: entry.count, limit });
      
      return res.status(429).json({
        error: "Rate limit exceeded",
        blocked: true,
        message: "Too many requests. Your access has been temporarily blocked."
      });
    }

    if (entry.count > limit) {
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("Retry-After", Math.ceil((entry.resetTime - now) / 1000));
      
      return res.status(429).json({
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        limit,
        message: "You have exceeded the rate limit. Please wait before making more requests."
      });
    }

    rateLimitStore.set(clientId, entry);
    
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - entry.count));
    res.setHeader("X-RateLimit-Reset", entry.resetTime);

    next();
  };
}

export function antiScrapingMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientId = getClientIdentifier(req);
  const fingerprint = generateDeviceFingerprint(req);
  const userAgent = req.headers["user-agent"] || "";
  
  const botPatterns = [
    /curl/i,
    /wget/i,
    /python-requests/i,
    /scrapy/i,
    /phantomjs/i,
    /headless/i,
    /selenium/i,
    /puppeteer/i,
    /playwright/i,
    /axios/i,
    /node-fetch/i,
    /got\//i,
  ];

  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /yandexbot/i,
    /duckduckbot/i,
    /slurp/i,
    /baiduspider/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /embedly/i,
    /quora link preview/i,
    /outbrain/i,
    /pinterest/i,
    /slackbot/i,
    /discordbot/i,
    /whatsapp/i,
    /telegrambot/i,
  ];

  const isAllowedBot = allowedBots.some(pattern => pattern.test(userAgent));
  
  if (!isAllowedBot) {
    const isSuspiciousBot = botPatterns.some(pattern => pattern.test(userAgent));
    
    if (isSuspiciousBot) {
      const suspiciousCount = (suspiciousActivityStore.get(clientId) || 0) + 1;
      suspiciousActivityStore.set(clientId, suspiciousCount);
      
      logSecurityEvent(req, "suspicious_bot_detected", { userAgent, suspiciousCount });
      
      if (suspiciousCount > 10) {
        return res.status(403).json({
          error: "Access denied",
          message: "Automated access to this resource is not permitted."
        });
      }
    }
  }

  if (!userAgent || userAgent.length < 10) {
    logSecurityEvent(req, "missing_user_agent", { userAgent });
    return res.status(403).json({
      error: "Invalid request",
      message: "Please use a standard web browser to access this resource."
    });
  }

  const referer = req.headers.referer || req.headers.referrer;
  const isApiRequest = req.path.startsWith("/api/");
  const origin = req.headers.origin;
  
  if (isApiRequest && !origin && !referer && !isAllowedBot) {
    const suspiciousCount = (suspiciousActivityStore.get(clientId) || 0) + 1;
    suspiciousActivityStore.set(clientId, suspiciousCount);
    
    if (suspiciousCount > 20) {
      logSecurityEvent(req, "missing_origin_referer", { path: req.path });
    }
  }

  next();
}

export function subscriptionValidationMiddleware(requiredTierLevel: number = 0, requiredFeature?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tier = getUserTier(req);
    
    if (tier.level < requiredTierLevel) {
      logSecurityEvent(req, "subscription_access_denied", { 
        userTier: tier.id, 
        requiredLevel: requiredTierLevel 
      });
      
      return res.status(403).json({
        error: "Subscription required",
        currentTier: tier.name,
        requiredLevel: requiredTierLevel,
        upgradeUrl: "/pricing",
        message: "Your current subscription does not include access to this feature. Please upgrade to continue."
      });
    }
    
    if (requiredFeature && !tier.features.includes("all") && !tier.features.includes(requiredFeature)) {
      return res.status(403).json({
        error: "Feature not available",
        currentTier: tier.name,
        requiredFeature,
        upgradeUrl: "/pricing",
        message: `The ${requiredFeature} feature is not included in your ${tier.name} subscription.`
      });
    }

    (req as any).subscriptionTier = tier;
    next();
  };
}

export function featureGateMiddleware(feature: keyof SubscriptionTier) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tier = getUserTier(req);
    const hasAccess = tier[feature] === true || tier.features.includes("all");
    
    if (!hasAccess) {
      return res.status(403).json({
        error: "Feature not available",
        feature,
        currentTier: tier.name,
        upgradeUrl: "/enterprise-pricing",
        message: `Access to ${feature} requires an upgraded subscription.`
      });
    }
    
    (req as any).subscriptionTier = tier;
    next();
  };
}

export function distributorValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  const distributorId = req.params.distributorId || req.headers["x-distributor-id"];
  const user = (req as any).user;
  
  if (!distributorId) {
    return res.status(400).json({
      error: "Distributor ID required",
      message: "A valid distributor ID is required to access this resource."
    });
  }

  if (user && user.distributorId && user.distributorId !== distributorId) {
    logSecurityEvent(req, "distributor_mismatch", { 
      userDistributor: user.distributorId, 
      requestedDistributor: distributorId 
    });
    
    return res.status(403).json({
      error: "Access denied",
      message: "You do not have permission to access this distributor's data."
    });
  }

  (req as any).distributorId = distributorId;
  next();
}

export function exportProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const tier = getUserTier(req);
  const user = (req as any).user;
  
  if (tier.exportLimit === 0) {
    return res.status(403).json({
      error: "Export not available",
      message: "Data export is not included in your current subscription. Please upgrade to access this feature.",
      upgradeUrl: "/pricing"
    });
  }

  (req as any).addWatermark = tier.level < 3;
  (req as any).exportUserId = user?.id;
  (req as any).exportTimestamp = Date.now();
  
  next();
}

function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters for secure URL signing");
  }
  return secret;
}

export function generateSignedUrl(resourcePath: string, userId: string, expiresIn: number = 3600): string {
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const nonce = crypto.randomBytes(8).toString("hex");
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(`${resourcePath}:${userId}:${expires}:${nonce}`)
    .digest("hex");
  
  return `${resourcePath}?expires=${expires}&sig=${signature}&uid=${userId}&nonce=${nonce}`;
}

const usedNonces = new Set<string>();
const NONCE_EXPIRY_MS = 3600 * 1000;

export function validateSignedUrl(req: Request, res: Response, next: NextFunction) {
  const { expires, sig, uid, nonce } = req.query;
  
  if (!expires || !sig || !uid || !nonce) {
    return res.status(401).json({
      error: "Invalid access token",
      message: "This resource requires a valid access token."
    });
  }
  
  const expiresNum = parseInt(expires as string);
  if (Date.now() / 1000 > expiresNum) {
    return res.status(401).json({
      error: "Link expired",
      message: "This access link has expired. Please request a new one."
    });
  }
  
  const nonceKey = `${uid}:${nonce}`;
  if (usedNonces.has(nonceKey)) {
    logSecurityEvent(req, "replay_attack_detected", { uid, nonce });
    return res.status(401).json({
      error: "Token already used",
      message: "This access token has already been used."
    });
  }
  
  const resourcePath = req.path;
  let expectedSig: string;
  try {
    expectedSig = crypto
      .createHmac("sha256", getSigningSecret())
      .update(`${resourcePath}:${uid}:${expires}:${nonce}`)
      .digest("hex");
  } catch (error) {
    return res.status(500).json({
      error: "Configuration error",
      message: "Server is not properly configured for secure access."
    });
  }
  
  if (sig !== expectedSig) {
    logSecurityEvent(req, "invalid_signed_url", { path: resourcePath, uid });
    return res.status(401).json({
      error: "Invalid access token",
      message: "The access token is invalid or has been tampered with."
    });
  }
  
  usedNonces.add(nonceKey);
  setTimeout(() => usedNonces.delete(nonceKey), NONCE_EXPIRY_MS);
  
  (req as any).signedUrlUserId = uid;
  next();
}

export function addExportWatermark(data: any, userId: string, format: string = "json"): any {
  const watermark = {
    _washbizhub: {
      exported_by: userId,
      exported_at: new Date().toISOString(),
      license: "Proprietary - Authorized use only",
      tracking_id: crypto.randomBytes(8).toString("hex"),
    }
  };
  
  if (format === "json" && typeof data === "object") {
    return { ...data, ...watermark };
  }
  
  return data;
}

interface SecurityLogEntry {
  timestamp: string;
  event: string;
  clientId: string;
  ip: string;
  path: string;
  method: string;
  userAgent: string;
  userId?: string;
  distributorId?: string;
  details: any;
}

const securityLogs: SecurityLogEntry[] = [];
const MAX_SECURITY_LOGS = 10000;

function logSecurityEvent(req: Request, event: string, details: any = {}): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    clientId: getClientIdentifier(req),
    ip: req.ip || "",
    path: req.path,
    method: req.method,
    userAgent: req.headers["user-agent"] || "",
    userId: (req as any).user?.id,
    distributorId: (req as any).distributorId,
    details,
  };
  
  securityLogs.unshift(entry);
  
  if (securityLogs.length > MAX_SECURITY_LOGS) {
    securityLogs.pop();
  }
  
  if (["rate_limit_block", "suspicious_bot_detected", "distributor_mismatch", "invalid_signed_url"].includes(event)) {
    console.warn(`[SECURITY] ${event}:`, JSON.stringify(entry));
  }
}

export function getSecurityLogs(limit: number = 100): SecurityLogEntry[] {
  return securityLogs.slice(0, limit);
}

export function clearExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime && (!entry.blocked || (entry.blockUntil && now > entry.blockUntil))) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(clearExpiredRateLimits, 60000);

export { SUBSCRIPTION_TIERS, getUserTier };
