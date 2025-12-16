/**
 * Unified Authentication Service
 * Flexible auth supporting multiple providers
 * 
 * Priority Order (configurable via DISABLE_CLOUDFLARE_AUTH env var):
 * 1. Session-based auth (existing logged-in users - OTP, Google, etc.)
 * 2. Cloudflare Access (Zero Trust - only if enabled)
 * 3. Google OAuth (standard OAuth)
 * 4. Email OTP (passwordless)
 */

import { Request, Response, NextFunction } from "express";
import { cloudflareAccess } from "./cloudflare-access";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscriptionTier: string;
  role?: string;
  authProvider: 'cloudflare-access' | 'google' | 'replit' | 'session';
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthenticatedUser;
  provider?: string;
  error?: string;
}

class UnifiedAuthService {
  /**
   * Check if Cloudflare Access is disabled (for Replit Deployments)
   */
  private isCloudflareDisabled(): boolean {
    return process.env.DISABLE_CLOUDFLARE_AUTH === 'true' || 
           process.env.DISABLE_CLOUDFLARE_AUTH === '1';
  }

  /**
   * Authenticate request using all available methods
   */
  async authenticate(req: Request): Promise<AuthResult> {
    // 1. Try existing session first (OTP, Google, or prior auth)
    const sessionResult = await this.trySession(req);
    if (sessionResult.authenticated) {
      return sessionResult;
    }

    // 2. Try Cloudflare Access (only if not disabled for deployments)
    if (!this.isCloudflareDisabled() && cloudflareAccess.isConfigured()) {
      const cfResult = await this.tryCloudflareAccess(req);
      if (cfResult.authenticated) {
        return cfResult;
      }
    }

    // 3. Not authenticated
    return { authenticated: false };
  }

  private async tryCloudflareAccess(req: Request): Promise<AuthResult> {
    try {
      const claims = await cloudflareAccess.authenticateRequest(req);
      
      if (!claims) {
        return { authenticated: false };
      }

      // Provision or get user
      const user = await cloudflareAccess.provisionUser(claims);
      
      // Update session for subsequent requests
      if ((req as any).session) {
        (req as any).session.userId = user.id;
        (req as any).session.cloudflareAuth = true;
        (req as any).session.email = user.email;
        (req as any).session.authProvider = 'cloudflare-access';
      }

      return {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          subscriptionTier: user.subscriptionTier || 'free',
          role: user.role,
          authProvider: 'cloudflare-access',
        },
        provider: 'cloudflare-access',
      };
    } catch (error) {
      console.error('Cloudflare Access auth error:', error);
      return { authenticated: false, error: String(error) };
    }
  }

  private async trySession(req: Request): Promise<AuthResult> {
    try {
      const session = (req as any).session;
      const userId = session?.userId;
      
      if (!userId) {
        return { authenticated: false };
      }

      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return { authenticated: false };
      }

      const provider = session.authProvider || 
                       (session.cloudflareAuth ? 'cloudflare-access' : 
                        session.googleAuth ? 'google' : 'session');

      return {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          profileImageUrl: user.profileImageUrl || undefined,
          subscriptionTier: user.subscriptionTier || 'free',
          role: user.role || undefined,
          authProvider: provider as any,
        },
        provider,
      };
    } catch (error) {
      console.error('Session auth error:', error);
      return { authenticated: false, error: String(error) };
    }
  }

  /**
   * Get the best login URL based on configuration
   */
  getLoginUrl(redirectPath: string = '/dashboard'): string {
    // OTP is always available as primary
    return `/login?redirect=${encodeURIComponent(redirectPath)}`;
  }

  /**
   * Get logout URL
   */
  getLogoutUrl(): string {
    return '/api/auth/logout';
  }

  /**
   * Check if Cloudflare Access is the primary auth provider
   */
  isCloudflareAccessPrimary(): boolean {
    return !this.isCloudflareDisabled() && cloudflareAccess.isConfigured();
  }

  /**
   * Get all configured auth providers
   */
  getConfiguredProviders(): string[] {
    const providers: string[] = [];
    
    // OTP is always available
    providers.push('otp');
    
    // Google OAuth if configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push('google');
    }
    
    // Cloudflare Access if configured and not disabled
    if (!this.isCloudflareDisabled() && cloudflareAccess.isConfigured()) {
      providers.push('cloudflare-access');
    }
    
    return providers;
  }

  /**
   * Get auth provider info for frontend
   */
  getProviderInfo() {
    const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    const cloudflareEnabled = !this.isCloudflareDisabled() && cloudflareAccess.isConfigured();

    return {
      primary: 'otp',
      providers: this.getConfiguredProviders(),
      otp: {
        enabled: true,
        requestUrl: '/api/auth/otp/request',
        verifyUrl: '/api/auth/otp/verify',
        label: 'Sign in with Email',
      },
      google: {
        enabled: googleEnabled,
        loginUrl: googleEnabled ? '/api/auth/google/login' : null,
        label: 'Sign in with Google',
      },
      cloudflareAccess: {
        enabled: cloudflareEnabled,
        loginUrl: cloudflareEnabled ? '/api/auth/cloudflare/login' : null,
        label: 'Enterprise SSO',
      },
    };
  }
}

export const unifiedAuth = new UnifiedAuthService();

/**
 * Middleware: Require authentication (any provider)
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const result = await unifiedAuth.authenticate(req);
  
  if (!result.authenticated) {
    res.status(401).json({ 
      error: "Authentication required",
      loginUrl: unifiedAuth.getLoginUrl(req.originalUrl),
    });
    return;
  }
  
  (req as any).user = result.user;
  (req as any).authProvider = result.provider;
  next();
}

/**
 * Middleware: Optional authentication - sets user if available
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const result = await unifiedAuth.authenticate(req);
  
  if (result.authenticated && result.user) {
    (req as any).user = result.user;
    (req as any).authProvider = result.provider;
  }
  
  next();
}

/**
 * Middleware: Require admin role
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const result = await unifiedAuth.authenticate(req);
  
  if (!result.authenticated) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  
  if (result.user?.role !== 'admin' && result.user?.role !== 'superadmin') {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  
  (req as any).user = result.user;
  (req as any).authProvider = result.provider;
  next();
}
