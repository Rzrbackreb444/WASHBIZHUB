import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil?: number;
  suspicionScore: number;
  fingerprint: string;
}

const ipRateLimits = new Map<string, RateLimitEntry>();
const sessionRateLimits = new Map<string, RateLimitEntry>();
const honeypotHits = new Set<string>();
const blockedIPs = new Set<string>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_ANONYMOUS = 10;
const MAX_REQUESTS_AUTHENTICATED = 30;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const MAX_PAGE_SIZE = 20;
const SUSPICION_THRESHOLD = 5;

const BOT_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'httpie', 'postman', 'insomnia', 'axios', 'node-fetch', 'go-http-client',
  'java/', 'libwww', 'lwp-trivial', 'scrapy', 'beautifulsoup', 'selenium',
  'phantomjs', 'headless', 'puppeteer', 'playwright'
];

const SUSPICIOUS_PATTERNS = [
  /\/api\/error-codes.*offset=\d{3,}/i,
  /\/api\/error-codes.*limit=\d{3,}/i,
  /\/api\/diagnostic-codes.*offset=\d{3,}/i,
];

function getClientFingerprint(req: Request): string {
  const ua = String(req.headers['user-agent'] || '');
  const accept = String(req.headers['accept'] || '');
  const acceptLang = String(req.headers['accept-language'] || '');
  const acceptEnc = String(req.headers['accept-encoding'] || '');
  return `${ua.substring(0, 50)}|${accept.substring(0, 20)}|${acceptLang.substring(0, 10)}|${acceptEnc.substring(0, 10)}`;
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function isBotUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

function isSuspiciousRequest(req: Request): boolean {
  const url = req.originalUrl || req.url;
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(url));
}

function calculateSuspicionScore(req: Request, entry: RateLimitEntry): number {
  let score = entry.suspicionScore;
  
  const ua = req.headers['user-agent'] || '';
  if (!ua || ua.length < 10) score += 2;
  if (isBotUserAgent(ua)) score += 3;
  
  if (!req.headers['accept-language']) score += 1;
  if (!req.headers['accept']) score += 1;
  
  if (isSuspiciousRequest(req)) score += 2;
  
  const currentFingerprint = getClientFingerprint(req);
  if (entry.fingerprint && entry.fingerprint !== currentFingerprint) {
    score += 2;
  }
  
  const requestRate = entry.count / ((Date.now() - entry.firstRequest) / 1000);
  if (requestRate > 2) score += 2;
  if (requestRate > 5) score += 3;
  
  return score;
}

export function antiScrapingMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);
  
  if (blockedIPs.has(clientIP)) {
    console.warn(`🚫 Blocked IP attempted access: ${clientIP}`);
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Your IP has been temporarily blocked due to suspicious activity'
    });
  }
  
  if (honeypotHits.has(clientIP)) {
    blockedIPs.add(clientIP);
    setTimeout(() => blockedIPs.delete(clientIP), BLOCK_DURATION_MS);
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const now = Date.now();
  let entry = ipRateLimits.get(clientIP);
  
  if (!entry || (now - entry.firstRequest) > WINDOW_MS) {
    entry = { 
      count: 0, 
      firstRequest: now, 
      suspicionScore: 0,
      fingerprint: getClientFingerprint(req)
    };
    ipRateLimits.set(clientIP, entry);
  }
  
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down. Try again later.',
      retryAfter
    });
  }
  
  entry.count++;
  entry.suspicionScore = calculateSuspicionScore(req, entry);
  
  const isAuthenticated = !!(req as any).user;
  const maxRequests = isAuthenticated ? MAX_REQUESTS_AUTHENTICATED : MAX_REQUESTS_ANONYMOUS;
  
  if (entry.count > maxRequests) {
    const blockDuration = entry.suspicionScore > SUSPICION_THRESHOLD 
      ? BLOCK_DURATION_MS * 2 
      : BLOCK_DURATION_MS;
    
    entry.blockedUntil = now + blockDuration;
    
    console.warn(`🚨 Rate limit exceeded: IP=${clientIP}, count=${entry.count}, suspicion=${entry.suspicionScore}`);
    
    const retryAfter = Math.ceil(blockDuration / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please wait before making more requests.',
      retryAfter
    });
  }
  
  if (entry.suspicionScore > SUSPICION_THRESHOLD) {
    console.warn(`⚠️ Suspicious activity detected: IP=${clientIP}, score=${entry.suspicionScore}`);
    res.setHeader('X-RateLimit-Warning', 'suspicious-activity-detected');
  }
  
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil((entry.firstRequest + WINDOW_MS) / 1000).toString());
  
  next();
}

export function honeypotEndpoint(req: Request, res: Response) {
  const clientIP = getClientIP(req);
  console.warn(`🍯 Honeypot triggered: IP=${clientIP}, URL=${req.originalUrl}`);
  
  honeypotHits.add(clientIP);
  blockedIPs.add(clientIP);
  
  setTimeout(() => {
    honeypotHits.delete(clientIP);
    blockedIPs.delete(clientIP);
  }, BLOCK_DURATION_MS * 4);
  
  res.status(200).json({
    codes: [],
    total: 0,
    message: "No data available"
  });
}

export function protectDetailedData(req: Request, res: Response, next: NextFunction) {
  const isAuthenticated = !!(req as any).user;
  
  if (!isAuthenticated) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access detailed diagnostic information',
      loginUrl: '/api/login'
    });
  }
  
  next();
}

export function enforcePageLimits(req: Request, res: Response, next: NextFunction) {
  let limit = parseInt(req.query.limit as string) || 10;
  let offset = parseInt(req.query.offset as string) || 0;
  
  if (limit > MAX_PAGE_SIZE) {
    limit = MAX_PAGE_SIZE;
    req.query.limit = MAX_PAGE_SIZE.toString();
  }
  
  if (offset > 500) {
    const clientIP = getClientIP(req);
    console.warn(`⚠️ Large offset requested: IP=${clientIP}, offset=${offset}`);
    
    const entry = ipRateLimits.get(clientIP);
    if (entry) {
      entry.suspicionScore += 3;
    }
  }
  
  next();
}

export function obfuscateForAnonymous(data: any, isAuthenticated: boolean): any {
  if (isAuthenticated) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => obfuscateSingleItem(item));
  }
  
  return obfuscateSingleItem(data);
}

function obfuscateSingleItem(item: any): any {
  if (!item) return item;
  
  const obfuscated = { ...item };
  
  if (obfuscated.troubleshootingSteps && Array.isArray(obfuscated.troubleshootingSteps)) {
    obfuscated.troubleshootingSteps = obfuscated.troubleshootingSteps.slice(0, 2);
    obfuscated.troubleshootingSteps.push('... Login to see all steps');
  }
  
  if (obfuscated.partsWithPricing && Array.isArray(obfuscated.partsWithPricing)) {
    obfuscated.partsWithPricing = obfuscated.partsWithPricing.slice(0, 1).map((p: any) => ({
      ...p,
      partNumber: '***-***',
      price: null,
      supplier: 'Login to view'
    }));
  }
  
  if (obfuscated.possibleCauses && Array.isArray(obfuscated.possibleCauses)) {
    obfuscated.possibleCauses = obfuscated.possibleCauses.slice(0, 2);
  }
  
  delete obfuscated.quickFix;
  delete obfuscated.testModeEntry;
  delete obfuscated.manualReference;
  
  obfuscated.requiresAuth = true;
  obfuscated.authMessage = 'Login or subscribe for complete diagnostic information';
  
  return obfuscated;
}

export function addSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
}

setInterval(() => {
  const now = Date.now();
  
  Array.from(ipRateLimits.entries()).forEach(([ip, entry]) => {
    if (now - entry.firstRequest > WINDOW_MS * 5) {
      ipRateLimits.delete(ip);
    }
  });
  
  Array.from(sessionRateLimits.entries()).forEach(([session, entry]) => {
    if (now - entry.firstRequest > WINDOW_MS * 5) {
      sessionRateLimits.delete(session);
    }
  });
}, 60000);

export function getAntiScrapingStats() {
  return {
    activeRateLimits: ipRateLimits.size,
    blockedIPs: blockedIPs.size,
    honeypotHits: honeypotHits.size
  };
}
