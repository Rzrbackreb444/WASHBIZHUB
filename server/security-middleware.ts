import { Request, Response, NextFunction } from "express";

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.replit.dev wss://*.replit.dev",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
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

const authAttempts = new Map<string, { count: number; firstAttempt: number; blocked: boolean }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const MAX_AUTH_ATTEMPTS = 10;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

export function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   'unknown';
  
  const now = Date.now();
  let record = authAttempts.get(clientIP);
  
  if (!record || now - record.firstAttempt > AUTH_WINDOW_MS) {
    record = { count: 0, firstAttempt: now, blocked: false };
    authAttempts.set(clientIP, record);
  }
  
  if (record.blocked && now - record.firstAttempt < BLOCK_DURATION_MS) {
    return res.status(429).json({
      error: "Too many authentication attempts. Please try again later.",
      retryAfter: Math.ceil((BLOCK_DURATION_MS - (now - record.firstAttempt)) / 1000)
    });
  }
  
  record.count++;
  
  if (record.count > MAX_AUTH_ATTEMPTS) {
    record.blocked = true;
    console.warn(`[SECURITY] Blocked IP ${clientIP} for excessive auth attempts`);
    return res.status(429).json({
      error: "Too many authentication attempts. Please try again later.",
      retryAfter: Math.ceil(BLOCK_DURATION_MS / 1000)
    });
  }
  
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of authAttempts.entries()) {
    if (now - record.firstAttempt > AUTH_WINDOW_MS + BLOCK_DURATION_MS) {
      authAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);
