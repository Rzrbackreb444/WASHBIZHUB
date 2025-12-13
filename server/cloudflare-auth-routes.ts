/**
 * Cloudflare Access Authentication Routes
 * Enterprise-grade Zero Trust authentication endpoints
 */

import { Router, Request, Response, NextFunction } from "express";
import { cloudflareAccess } from "./services/cloudflare-access";
import { cloudflareApi } from "./services/cloudflare-api";
import { unifiedAuth } from "./services/unified-auth";
import { db } from "./db";
import { adminActivityLog, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * GET /api/auth/cloudflare/status
 * Check Cloudflare Access configuration status
 */
router.get("/status", (req: Request, res: Response) => {
  const status = cloudflareAccess.getConfigurationStatus();
  
  res.json({
    configured: status.configured,
    audienceConfigured: cloudflareAccess.hasAudienceConfigured(),
    provider: "cloudflare-access",
    teamDomain: process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN ? "✓ Set" : "✗ Missing (REQUIRED)",
    audience: process.env.CLOUDFLARE_ACCESS_AUDIENCE ? "✓ Set" : "✗ Missing (REQUIRED for Zero Trust)",
    issues: status.issues.length > 0 ? status.issues : undefined,
    security: status.configured ? "✓ Zero Trust validation enabled" : "⚠ Configuration incomplete",
  });
});

/**
 * GET /api/auth/providers
 * Get available authentication providers for frontend
 */
router.get("/providers", (req: Request, res: Response) => {
  res.json({
    primary: unifiedAuth.isCloudflareAccessPrimary() ? 'cloudflare-access' : 'google',
    providers: unifiedAuth.getConfiguredProviders(),
    cloudflareAccess: {
      enabled: cloudflareAccess.isConfigured(),
      loginUrl: cloudflareAccess.isConfigured() ? '/api/auth/cloudflare/login' : null,
      label: 'Sign in with Enterprise SSO',
    },
    google: {
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      loginUrl: '/api/auth/google/login',
      label: 'Sign in with Google',
    },
  });
});

/**
 * GET /api/auth/cloudflare/debug
 * Debug endpoint to see incoming Cloudflare headers and tokens
 */
router.get("/debug", async (req: Request, res: Response) => {
  const cfHeaders = {
    'cf-access-jwt-assertion': req.headers['cf-access-jwt-assertion'] ? '✓ Present' : '✗ Missing',
    'cf-access-authenticated-user-email': req.headers['cf-access-authenticated-user-email'] || 'Not set',
    'cf-ray': req.headers['cf-ray'] || 'Not set (not behind Cloudflare)',
    'cf-connecting-ip': req.headers['cf-connecting-ip'] || 'Not set',
  };
  
  const cfAuthCookie = req.cookies?.['CF_Authorization'] ? '✓ Present' : '✗ Missing';
  
  // Try to decode token (without full validation) to show audience
  let tokenInfo: any = { status: 'No token found' };
  const token = req.headers['cf-access-jwt-assertion'] as string || req.cookies?.['CF_Authorization'];
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
        tokenInfo = {
          status: 'Token found and decoded',
          email: payload.email,
          aud: payload.aud,  // THIS IS YOUR AUDIENCE TAG
          iss: payload.iss,
          exp: new Date(payload.exp * 1000).toISOString(),
          sub: payload.sub,
        };
      }
    } catch (e) {
      tokenInfo = { status: 'Token found but failed to decode', error: String(e) };
    }
  }
  
  res.json({
    message: 'Cloudflare Access Debug Info',
    headers: cfHeaders,
    cookie: { 'CF_Authorization': cfAuthCookie },
    token: tokenInfo,
    hint: tokenInfo.aud ? `Your CLOUDFLARE_ACCESS_AUDIENCE should be: ${Array.isArray(tokenInfo.aud) ? tokenInfo.aud[0] : tokenInfo.aud}` : 'Login via Cloudflare to see your audience tag',
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
      // For Cloudflare Access, redirect to signed-out page after logout
      // Note: Cloudflare logout URL clears their session, then we show confirmation
      res.redirect("/signed-out");
    } else {
      res.redirect("/signed-out");
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.redirect("/signed-out");
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

/**
 * POST /api/auth/cloudflare/setup
 * Automatically configure Cloudflare Access application
 * Requires CLOUDFLARE_GLOBAL_API_KEY to be set
 */
router.post("/setup", async (req: Request, res: Response) => {
  try {
    if (!cloudflareApi.isConfigured()) {
      return res.status(503).json({
        error: "Cloudflare API not configured",
        message: "Please set CLOUDFLARE_GLOBAL_API_KEY and CLOUDFLARE_EMAIL secrets",
      });
    }

    // Get the app domain from request or environment
    const appDomain = req.body.domain || 
      process.env.REPLIT_DEV_DOMAIN || 
      process.env.REPLIT_DOMAINS?.split(',')[0] ||
      'washbizhub.com';

    console.log(`🔐 Setting up Cloudflare Access for domain: ${appDomain}`);

    const result = await cloudflareApi.setupWashBizHubAccess(appDomain);

    res.json({
      success: true,
      message: "Cloudflare Access configured successfully",
      app: {
        id: result.app.id,
        name: result.app.name,
        domain: result.app.domain,
        audienceTag: result.audienceTag,
      },
      teamDomain: result.teamDomain,
      identityProviders: result.identityProviders.map(idp => ({
        id: idp.id,
        name: idp.name,
        type: idp.type,
      })),
      nextSteps: [
        `Set CLOUDFLARE_ACCESS_AUDIENCE to: ${result.audienceTag}`,
        `Set CLOUDFLARE_ACCESS_TEAM_DOMAIN to: ${result.teamDomain}`,
        "Restart the application to apply changes",
      ],
    });
  } catch (error: any) {
    console.error("Cloudflare setup error:", error);
    res.status(500).json({
      error: "Setup failed",
      message: error.message,
      hint: "Check your CLOUDFLARE_GLOBAL_API_KEY and CLOUDFLARE_EMAIL are correct",
    });
  }
});

/**
 * GET /api/auth/cloudflare/accounts
 * List Cloudflare accounts (for debugging/setup)
 */
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    if (!cloudflareApi.isConfigured()) {
      return res.status(503).json({
        error: "Cloudflare API not configured",
        configured: false,
      });
    }

    const accounts = await cloudflareApi.getAccounts();
    res.json({
      success: true,
      accounts: accounts.map(a => ({ id: a.id, name: a.name })),
    });
  } catch (error: any) {
    console.error("Failed to get accounts:", error);
    res.status(500).json({
      error: "Failed to get accounts",
      message: error.message,
    });
  }
});

/**
 * GET /api/auth/cloudflare/apps
 * List existing Cloudflare Access applications
 */
router.get("/apps", async (req: Request, res: Response) => {
  try {
    if (!cloudflareApi.isConfigured()) {
      return res.status(503).json({
        error: "Cloudflare API not configured",
        configured: false,
      });
    }

    const apps = await cloudflareApi.listAccessApps();
    res.json({
      success: true,
      apps: apps.map(app => ({
        id: app.id,
        name: app.name,
        domain: app.domain,
        aud: app.aud,
        sessionDuration: app.session_duration,
      })),
    });
  } catch (error: any) {
    console.error("Failed to list apps:", error);
    res.status(500).json({
      error: "Failed to list apps",
      message: error.message,
    });
  }
});

/**
 * GET /api/auth/cloudflare/identity-providers
 * List configured identity providers
 */
router.get("/identity-providers", async (req: Request, res: Response) => {
  try {
    if (!cloudflareApi.isConfigured()) {
      return res.status(503).json({
        error: "Cloudflare API not configured",
        configured: false,
      });
    }

    const idps = await cloudflareApi.listIdentityProviders();
    res.json({
      success: true,
      identityProviders: idps.map(idp => ({
        id: idp.id,
        name: idp.name,
        type: idp.type,
      })),
    });
  } catch (error: any) {
    console.error("Failed to list identity providers:", error);
    res.status(500).json({
      error: "Failed to list identity providers",
      message: error.message,
    });
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
