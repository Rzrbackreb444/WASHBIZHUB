/**
 * Unified Authentication Service
 * Enterprise-grade auth with Google OAuth and Email OTP as providers
 * 
 * Priority Order:
 * 1. Session-based auth (existing logged-in users)
 * 2. Google OAuth (primary public auth)
 * 3. Email OTP (passwordless alternative)
 */

import { Request, Response, NextFunction } from "express";
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
   * Authenticate request using all available methods
   */
  async authenticate(req: Request): Promise<AuthResult> {
    // Try existing session (includes Google OAuth and Email OTP sessions)
    const sessionResult = await this.trySession(req);
    if (sessionResult.authenticated) {
      return sessionResult;
    }

    // Not authenticated
    return { authenticated: false };
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
                       (session.googleAuth ? 'google' : 
                        session.otpAuth ? 'email-otp' : 'session');

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
    return `/login?redirect=${encodeURIComponent(redirectPath)}`;
  }

  /**
   * Get logout URL
   */
  getLogoutUrl(): string {
    return '/api/auth/logout';
  }

  /**
   * Get all configured auth providers
   */
  getConfiguredProviders(): string[] {
    const providers: string[] = ['email-otp'];
    
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push('google');
    }
    
    return providers;
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
