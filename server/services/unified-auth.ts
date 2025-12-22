/**
 * Unified Authentication Service
 * Enterprise-grade auth supporting multiple providers:
 * 
 * Priority Order:
 * 1. Passport-based auth (Replit OIDC, Google OAuth via passport)
 * 2. Session-based auth (session.userId from email OTP, etc.)
 * 3. Future: API keys, etc.
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
  authProvider: 'cloudflare-access' | 'google' | 'replit' | 'session' | 'email-otp';
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
    // 1. Try passport-based auth (Replit OIDC, Google OAuth)
    const passportResult = await this.tryPassportAuth(req);
    if (passportResult.authenticated) {
      return passportResult;
    }

    // 2. Try session-based auth (session.userId from email OTP, etc.)
    const sessionResult = await this.trySession(req);
    if (sessionResult.authenticated) {
      return sessionResult;
    }

    // Not authenticated
    return { authenticated: false };
  }

  /**
   * Check for passport-based authentication (Replit OIDC, Google OAuth)
   */
  private async tryPassportAuth(req: Request): Promise<AuthResult> {
    try {
      const passportUser = (req as any).user;
      
      // Check if passport session exists with claims (Replit OIDC)
      if (passportUser?.claims?.sub) {
        const userId = passportUser.claims.sub;
        const email = passportUser.claims.email;
        
        // Fetch full user from database
        const [user] = await db.select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user) {
          return {
            authenticated: true,
            user: {
              id: user.id,
              email: user.email || email,
              firstName: user.firstName || passportUser.claims.first_name || undefined,
              lastName: user.lastName || passportUser.claims.last_name || undefined,
              profileImageUrl: user.profileImageUrl || passportUser.claims.profile_image_url || undefined,
              subscriptionTier: user.subscriptionTier || 'free',
              role: user.role || undefined,
              authProvider: 'replit',
            },
            provider: 'replit',
          };
        }
      }

      // Check for passport isAuthenticated function (Google OAuth via passport)
      if (typeof (req as any).isAuthenticated === 'function' && (req as any).isAuthenticated()) {
        const user = passportUser;
        if (user?.id || user?.claims?.sub) {
          const userId = user.id || user.claims?.sub;
          
          const [dbUser] = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (dbUser) {
            return {
              authenticated: true,
              user: {
                id: dbUser.id,
                email: dbUser.email,
                firstName: dbUser.firstName || undefined,
                lastName: dbUser.lastName || undefined,
                profileImageUrl: dbUser.profileImageUrl || undefined,
                subscriptionTier: dbUser.subscriptionTier || 'free',
                role: dbUser.role || undefined,
                authProvider: 'google',
              },
              provider: 'google',
            };
          }
        }
      }

      return { authenticated: false };
    } catch (error) {
      console.error('Passport auth error:', error);
      return { authenticated: false, error: String(error) };
    }
  }

  /**
   * Check for session-based authentication (session.userId)
   */
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
    return '/api/logout';
  }

  /**
   * Get all configured auth providers
   */
  getConfiguredProviders(): string[] {
    const providers: string[] = ['replit', 'email-otp'];
    
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
  
  // Set unified user object on request
  (req as any).user = result.user;
  // Also set claims for backwards compatibility with code expecting req.user.claims.sub
  (req as any).user.claims = { sub: result.user!.id, email: result.user!.email };
  (req as any).user.sub = result.user!.id;
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
    // Also set claims for backwards compatibility
    (req as any).user.claims = { sub: result.user.id, email: result.user.email };
    (req as any).user.sub = result.user.id;
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
  
  // Check admin by role or email
  const adminEmails = ['nick@washbizhub.com', 'rzrbackreb444@gmail.com', 'thelaundromatfb@gmail.com'];
  const isAdmin = result.user?.role === 'admin' || 
                  result.user?.role === 'superadmin' ||
                  adminEmails.includes(result.user?.email?.toLowerCase() || '');
  
  if (!isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  
  (req as any).user = result.user;
  (req as any).user.claims = { sub: result.user!.id, email: result.user!.email };
  (req as any).user.sub = result.user!.id;
  (req as any).authProvider = result.provider;
  next();
}
