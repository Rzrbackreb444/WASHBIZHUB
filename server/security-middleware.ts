import { Request, Response, NextFunction } from "express";

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.replit.dev wss://*.replit.dev https://maps.googleapis.com https://accounts.google.com https://oauth2.googleapis.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '));
  
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
  
  next();
}

export function apiKeyProtection(req: Request, res: Response, next: NextFunction) {
  const sensitivePatterns = [
    /api[_-]?key/i,
    /secret[_-]?key/i,
    /private[_-]?key/i,
    /password/i,
    /token/i,
    /credential/i,
  ];
  
  const responseBody = JSON.stringify(res.locals);
  const hasSensitiveData = sensitivePatterns.some(pattern => pattern.test(responseBody));
  
  if (hasSensitiveData && !req.path.includes('/admin/')) {
    console.warn(`[SECURITY] Potential sensitive data exposure at ${req.path}`);
  }
  
  next();
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER?.toLowerCase()}.repl.co` : '',
    'https://washbizhub.com',
    'https://www.washbizhub.com',
    'https://washbizhub.xyz',
    'https://www.washbizhub.xyz',
    'https://strokerecoveryacademy.com',
    'https://www.strokerecoveryacademy.com',
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
}

// Auth rate limiting - balanced security with user experience
const authAttempts = new Map<string, { count: number; firstAttempt: number; blockedUntil: number }>();
const AUTH_WINDOW_MS = 10 * 60 * 1000; // 10 minute window
const MAX_AUTH_ATTEMPTS = 20; // 20 attempts before soft block (generous for typos)
const SOFT_BLOCK_MS = 5 * 60 * 1000; // 5 minute cooldown (short recovery)
const HARD_BLOCK_THRESHOLD = 50; // 50 attempts triggers longer block
const HARD_BLOCK_MS = 30 * 60 * 1000; // 30 minute block for persistent abuse

export function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                   req.socket.remoteAddress || 
                   'unknown';
  
  const now = Date.now();
  let record = authAttempts.get(clientIP);
  
  // Clean slate after window expires
  if (!record || now - record.firstAttempt > AUTH_WINDOW_MS) {
    record = { count: 0, firstAttempt: now, blockedUntil: 0 };
    authAttempts.set(clientIP, record);
  }
  
  // Check if currently blocked
  if (record.blockedUntil > now) {
    const secondsLeft = Math.ceil((record.blockedUntil - now) / 1000);
    const minutesLeft = Math.ceil(secondsLeft / 60);
    return res.status(429).json({
      error: `Too many attempts. Please wait ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} before trying again.`,
      retryAfter: secondsLeft
    });
  }
  
  record.count++;
  
  // Hard block for persistent abuse
  if (record.count >= HARD_BLOCK_THRESHOLD) {
    record.blockedUntil = now + HARD_BLOCK_MS;
    console.warn(`[SECURITY] Hard blocked IP ${clientIP} for ${HARD_BLOCK_THRESHOLD}+ auth attempts`);
    return res.status(429).json({
      error: "Account temporarily locked due to unusual activity. Please try again in 30 minutes or use Google sign-in.",
      retryAfter: Math.ceil(HARD_BLOCK_MS / 1000)
    });
  }
  
  // Soft block after max attempts
  if (record.count > MAX_AUTH_ATTEMPTS) {
    record.blockedUntil = now + SOFT_BLOCK_MS;
    console.warn(`[SECURITY] Soft blocked IP ${clientIP} for ${record.count} auth attempts`);
    return res.status(429).json({
      error: "Too many attempts. Please wait 5 minutes or try signing in with Google.",
      retryAfter: Math.ceil(SOFT_BLOCK_MS / 1000)
    });
  }
  
  next();
}

// Helper to clear rate limit on successful login (call from auth routes)
export function clearAuthRateLimit(ip: string) {
  authAttempts.delete(ip);
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of authAttempts.entries()) {
    if (now - record.firstAttempt > AUTH_WINDOW_MS + HARD_BLOCK_MS) {
      authAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);
