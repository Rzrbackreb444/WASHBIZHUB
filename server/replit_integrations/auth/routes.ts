import type { Express } from "express";

// Register auth-specific routes
// Note: /api/auth/user is handled by the main auth-routes.ts (mounted at /api/auth)
// to ensure all auth methods (Google OAuth, Email OTP, Replit Auth) use the same endpoint
export function registerAuthRoutes(app: Express): void {
  // No additional routes needed - auth-routes.ts handles /api/auth/user
  // This prevents duplicate endpoints that could cause auth confusion
}
