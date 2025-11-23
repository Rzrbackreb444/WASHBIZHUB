/**
 * Multi-Tenant Middleware
 * 
 * Resolves the current tenant based on request domain/subdomain
 * Powers WashBizHub.com, StrokeRecoveryAcademy.com, and StrokeLyfe.app
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { Tenant } from "@shared/schema";

// Extend Express Request to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
    }
  }
}

/**
 * Extract domain from request
 * Handles various deployment scenarios:
 * - Production: washbizhub.com, strokerecoveryacademy.com, strokelyfe.app
 * - Development: localhost, *.replit.dev
 * - Preview: *.replit.app
 */
function extractDomain(req: Request): string {
  const host = req.headers.host || req.hostname;
  
  // Handle port numbers in development
  const domain = host.split(':')[0];
  
  // For Replit development/preview environments
  if (domain.includes('replit.dev') || domain.includes('replit.app') || domain === 'localhost') {
    // Check for explicit tenant header (useful for testing)
    const tenantHeader = req.headers['x-tenant-domain'] as string;
    if (tenantHeader) {
      return tenantHeader;
    }
    
    // Default to WashBizHub for development
    return 'washbizhub.com';
  }
  
  return domain;
}

/**
 * Tenant Resolution Middleware
 * 
 * Attaches req.tenant to every request based on domain
 * Falls back to WashBizHub if tenant not found
 */
export async function resolveTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const domain = extractDomain(req);
    
    // Look up tenant by domain
    const tenant = await storage.getTenantByDomain(domain);
    
    if (tenant && tenant.isActive) {
      req.tenant = tenant;
    } else {
      // Fallback: Try to get WashBizHub tenant
      const fallbackTenant = await storage.getTenantByDomain('washbizhub.com');
      if (fallbackTenant) {
        req.tenant = fallbackTenant;
      } else {
        // No tenant found - this shouldn't happen in production
        console.error(`❌ No tenant found for domain: ${domain} (and no fallback available)`);
        return res.status(503).json({ 
          message: "Platform configuration error. Please contact support.",
          code: "TENANT_NOT_FOUND"
        });
      }
    }
    
    // Log tenant resolution for debugging
    if (req.tenant) {
      console.log(`✅ Tenant resolved: ${req.tenant.name} (${req.tenant.domain})`);
    }
    
    next();
  } catch (error) {
    console.error("❌ Tenant resolution error:", error);
    
    // Don't block request - continue without tenant
    // This allows health checks and static assets to work
    next();
  }
}

/**
 * Require Tenant Middleware
 * 
 * Use this for routes that MUST have a tenant context
 * Returns 503 if no tenant is available
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant) {
    return res.status(503).json({ 
      message: "Platform not available. Please check your domain configuration.",
      code: "TENANT_REQUIRED"
    });
  }
  next();
}

/**
 * Helper: Get tenant-specific AI knowledge base path
 */
export function getAiKnowledgeBasePath(tenant?: Tenant): string {
  if (!tenant) {
    return 'laundromat-bible'; // Default fallback
  }
  return tenant.aiKnowledgeBasePath || 'laundromat-bible';
}

/**
 * Helper: Get tenant-specific Amazon catalog type
 */
export function getAmazonCatalogType(tenant?: Tenant): string {
  if (!tenant) {
    return 'commercial_laundry'; // Default fallback
  }
  return tenant.amazonCatalogType || 'commercial_laundry';
}

/**
 * Helper: Check if feature is enabled for tenant
 */
export function isTenantFeatureEnabled(tenant: Tenant | undefined, feature: keyof Tenant): boolean {
  if (!tenant) return false;
  return tenant[feature] === true;
}
