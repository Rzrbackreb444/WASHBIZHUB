import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface TenantContext {
  projectId: string;
  subdomain?: string;
  customDomain?: string;
  businessProfile?: any;
}

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

const RESERVED_SUBDOMAINS = ['www', 'api', 'app', 'admin', 'dashboard', 'mail', 'blog'];

export async function tenantResolverMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const host = req.get('host') || '';
  const hostname = host.split(':')[0];
  
  if (req.path.startsWith('/api') || req.path.startsWith('/assets')) {
    return next();
  }
  
  try {
    const customDomainResult = await db.execute(sql`
      SELECT cd.*, sp.id as project_id, sp.name, sp.subdomain, sp.is_published
      FROM custom_domains cd
      JOIN site_projects sp ON cd.project_id = sp.id
      WHERE cd.domain = ${hostname} AND cd.status = 'active'
      LIMIT 1
    `);
    
    if (customDomainResult.rows.length > 0) {
      const row = customDomainResult.rows[0] as any;
      req.tenantContext = {
        projectId: row.project_id,
        customDomain: hostname,
      };
      return next();
    }
    
    const mainDomain = process.env.MAIN_DOMAIN || 'washbizhub.com';
    if (hostname.endsWith(`.${mainDomain}`)) {
      const subdomain = hostname.replace(`.${mainDomain}`, '');
      
      if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
        return next();
      }
      
      const subdomainResult = await db.execute(sql`
        SELECT id, name, subdomain, is_published, user_id
        FROM site_projects
        WHERE subdomain = ${subdomain} AND is_published = true
        LIMIT 1
      `);
      
      if (subdomainResult.rows.length > 0) {
        const row = subdomainResult.rows[0] as any;
        req.tenantContext = {
          projectId: row.id,
          subdomain: subdomain,
        };
        return next();
      }
    }
  } catch (error) {
    console.error('Tenant resolver error:', error);
  }
  
  next();
}
