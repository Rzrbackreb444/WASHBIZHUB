/**
 * Cloudflare Access Authentication Routes
 * Enterprise-grade Zero Trust authentication endpoints
 */

import { Router, Request, Response, NextFunction } from "express";
import { cloudflareAccess } from "./services/cloudflare-access";
import { db } from "./db";
import { adminActivityLog } from "@shared/schema";

const router = Router();

/**
 * GET /api/auth/cloudflare/status
 * Check Cloudflare Access configuration status
 */
router.get("/status", (req: Request, res: Response) => {
  res.json({
    configured: cloudflareAccess.isConfigured(),
    provider: "cloudflare-access",
  });
});

/**
 * GET /api/auth/cloudflare/login
 * Redirect to Cloudflare Access login
 */
router.get("/login", (req: Request, res: Response) => {
  if (!cloudflareAccess.isConfigured()) {
    return res.status(503).json({ 
      error: "Cloudflare Access not configured",
      message: "Please configure CLOUDFLARE_ACCESS_TEAM_DOMAIN and CLOUDFLARE_ACCESS_AUDIENCE" 
    });
  }

  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const loginUrl = cloudflareAccess.getLoginUrl(redirectPath);
  
  res.redirect(loginUrl);
});

/**
 * GET /api/auth/cloudflare/callback
 * Handle Cloudflare Access callback after authentication
 */
router.get("/callback", async (req: Request, res: Response) => {
  try {
    const claims = await cloudflareAccess.authenticateRequest(req);
    
    if (!claims) {
      return res.redirect("/login?error=authentication_failed");
    }

    // Provision or update user
    const user = await cloudflareAccess.provisionUser(claims);
    
    // Set session
    (req as any).session.userId = user.id;
    (req as any).session.cloudflareAuth = true;
    (req as any).session.email = user.email;
    
    // Log the login
    try {
      await db.insert(adminActivityLog).values({
        type: 'user_login',
        description: `User logged in via Cloudflare Access: ${user.email}`,
        email: user.email,
        metadata: {
          userId: user.id,
          authProvider: 'cloudflare-access',
          country: claims.country,
        },
        tenant: 'washbizhub.com',
      });
    } catch (e) {
      console.error('Failed to log login activity:', e);
    }

    const redirectTo = (req.query.state as string) || "/dashboard";
    res.redirect(redirectTo);
  } catch (error) {
    console.error("Cloudflare callback error:", error);
    res.redirect("/login?error=callback_failed");
  }
});

/**
 * POST /api/auth/cloudflare/verify
 * Verify a Cloudflare Access token and return user info
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const claims = await cloudflareAccess.authenticateRequest(req);
    
    if (!claims) {
      return res.status(401).json({ 
        authenticated: false,
        error: "Invalid or missing token" 
      });
    }

    // Provision or get user
    const user = await cloudflareAccess.provisionUser(claims);
    
    // Set session
    (req as any).session.userId = user.id;
    (req as any).session.cloudflareAuth = true;
    (req as any).session.email = user.email;

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionTier: user.subscriptionTier,
      },
      claims: {
        email: claims.email,
        exp: claims.exp,
        country: claims.country,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ 
      authenticated: false,
      error: "Verification failed" 
    });
  }
});

/**
 * GET /api/auth/cloudflare/logout
 * Logout from Cloudflare Access
 */
router.get("/logout", async (req: Request, res: Response) => {
  try {
    // Destroy local session
    (req as any).session?.destroy?.((err: any) => {
      if (err) console.error("Session destroy error:", err);
    });

    if (cloudflareAccess.isConfigured()) {
      // Redirect to Cloudflare logout
      res.redirect(cloudflareAccess.getLogoutUrl());
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.redirect("/");
  }
});

/**
 * GET /api/auth/cloudflare/user
 * Get current authenticated user from Cloudflare Access
 */
router.get("/user", async (req: Request, res: Response) => {
  try {
    // First check session
    const sessionUserId = (req as any).session?.userId;
    if (sessionUserId && (req as any).session?.cloudflareAuth) {
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, sessionUserId))
        .limit(1);
      
      if (user) {
        return res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          subscriptionTier: user.subscriptionTier,
          authProvider: 'cloudflare-access',
        });
      }
    }

    // Try to authenticate from Cloudflare headers/cookies
    const claims = await cloudflareAccess.authenticateRequest(req);
    
    if (claims) {
      const user = await cloudflareAccess.provisionUser(claims);
      
      // Update session
      (req as any).session.userId = user.id;
      (req as any).session.cloudflareAuth = true;
      (req as any).session.email = user.email;
      
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        subscriptionTier: user.subscriptionTier,
        authProvider: 'cloudflare-access',
      });
    }

    res.status(401).json({ error: "Not authenticated" });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;

/**
 * Cloudflare Access middleware for protecting routes
 */
export async function requireCloudflareAuth(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Check session first
    if ((req as any).session?.userId && (req as any).session?.cloudflareAuth) {
      return next();
    }

    // Try Cloudflare Access token
    const claims = await cloudflareAccess.authenticateRequest(req);
    
    if (claims) {
      const user = await cloudflareAccess.provisionUser(claims);
      (req as any).session.userId = user.id;
      (req as any).session.cloudflareAuth = true;
      (req as any).session.email = user.email;
      (req as any).user = user;
      return next();
    }

    res.status(401).json({ error: "Authentication required" });
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}

/**
 * Optional Cloudflare auth middleware - sets user if authenticated but doesn't block
 */
export async function optionalCloudflareAuth(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Check session first
    if ((req as any).session?.userId && (req as any).session?.cloudflareAuth) {
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, (req as any).session.userId))
        .limit(1);
      
      if (user) {
        (req as any).user = user;
      }
      return next();
    }

    // Try Cloudflare Access token
    const claims = await cloudflareAccess.authenticateRequest(req);
    
    if (claims) {
      const user = await cloudflareAccess.provisionUser(claims);
      (req as any).session.userId = user.id;
      (req as any).session.cloudflareAuth = true;
      (req as any).session.email = user.email;
      (req as any).user = user;
    }

    next();
  } catch (error) {
    // Don't block on optional auth errors
    next();
  }
}
