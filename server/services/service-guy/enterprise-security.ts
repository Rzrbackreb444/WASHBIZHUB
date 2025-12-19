import { db } from '../../db';
import { enterpriseApiKeys, enterpriseAuditLogs, enterpriseDistributors } from '@shared/schema';
import { eq, and, sql, gt } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const SALT_ROUNDS = 12;

export async function generateApiKey(
  distributorId: string,
  name: string,
  scopes: Record<string, boolean>,
  options?: {
    rateLimit?: number;
    expiresAt?: Date;
    allowedIps?: string[];
    createdBy?: string;
  }
): Promise<{
  keyId: string;
  apiKey: string;
  prefix: string;
}> {
  const rawKey = crypto.randomBytes(32).toString('base64url');
  const prefix = 'sgai_' + (process.env.NODE_ENV === 'production' ? 'live_' : 'test_');
  const fullKey = prefix + rawKey;
  const keyHash = await bcrypt.hash(fullKey, SALT_ROUNDS);
  const lastFour = rawKey.slice(-4);
  
  const [created] = await db
    .insert(enterpriseApiKeys)
    .values({
      distributorId,
      name,
      keyPrefix: prefix,
      keyHash,
      lastFourChars: lastFour,
      scopes: scopes as any,
      rateLimit: options?.rateLimit || 1000,
      expiresAt: options?.expiresAt,
      allowedIps: options?.allowedIps,
      createdBy: options?.createdBy,
      usageResetAt: new Date(Date.now() + 3600000),
    })
    .returning();
  
  await logAuditEvent({
    distributorId,
    actorType: 'user',
    actorId: options?.createdBy,
    action: 'create',
    resource: 'api_key',
    resourceId: created.id,
    description: `API key "${name}" created`,
    success: true,
  });
  
  return {
    keyId: created.id,
    apiKey: fullKey,
    prefix,
  };
}

export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  distributorId?: string;
  keyId?: string;
  scopes?: Record<string, boolean>;
  error?: string;
}> {
  if (!apiKey || !apiKey.startsWith('sgai_')) {
    return { valid: false, error: 'Invalid API key format' };
  }
  
  const prefix = apiKey.substring(0, 10);
  
  const keys = await db
    .select()
    .from(enterpriseApiKeys)
    .where(
      and(
        eq(enterpriseApiKeys.keyPrefix, prefix),
        eq(enterpriseApiKeys.status, 'active')
      )
    );
  
  for (const key of keys) {
    const matches = await bcrypt.compare(apiKey, key.keyHash);
    if (matches) {
      if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
        await db
          .update(enterpriseApiKeys)
          .set({ status: 'expired' })
          .where(eq(enterpriseApiKeys.id, key.id));
        return { valid: false, error: 'API key expired' };
      }
      
      const now = new Date();
      if (!key.usageResetAt || new Date(key.usageResetAt) < now) {
        await db
          .update(enterpriseApiKeys)
          .set({
            currentUsage: 1,
            usageResetAt: new Date(now.getTime() + (key.rateLimitWindow || 3600) * 1000),
            lastUsedAt: now,
          })
          .where(eq(enterpriseApiKeys.id, key.id));
      } else {
        const currentUsage = (key.currentUsage || 0) + 1;
        if (currentUsage > (key.rateLimit || 1000)) {
          return { valid: false, error: 'Rate limit exceeded' };
        }
        
        await db
          .update(enterpriseApiKeys)
          .set({
            currentUsage,
            lastUsedAt: now,
          })
          .where(eq(enterpriseApiKeys.id, key.id));
      }
      
      return {
        valid: true,
        distributorId: key.distributorId,
        keyId: key.id,
        scopes: key.scopes as Record<string, boolean>,
      };
    }
  }
  
  return { valid: false, error: 'Invalid API key' };
}

export async function revokeApiKey(
  keyId: string,
  revokedBy?: string
): Promise<boolean> {
  const [key] = await db
    .select()
    .from(enterpriseApiKeys)
    .where(eq(enterpriseApiKeys.id, keyId))
    .limit(1);
  
  if (!key) return false;
  
  await db
    .update(enterpriseApiKeys)
    .set({
      status: 'revoked',
      revokedAt: new Date(),
      revokedBy,
    })
    .where(eq(enterpriseApiKeys.id, keyId));
  
  await logAuditEvent({
    distributorId: key.distributorId,
    actorType: 'user',
    actorId: revokedBy,
    action: 'delete',
    resource: 'api_key',
    resourceId: keyId,
    description: `API key "${key.name}" revoked`,
    success: true,
  });
  
  return true;
}

export async function listApiKeys(distributorId: string) {
  return db
    .select({
      id: enterpriseApiKeys.id,
      name: enterpriseApiKeys.name,
      keyPrefix: enterpriseApiKeys.keyPrefix,
      lastFourChars: enterpriseApiKeys.lastFourChars,
      scopes: enterpriseApiKeys.scopes,
      rateLimit: enterpriseApiKeys.rateLimit,
      currentUsage: enterpriseApiKeys.currentUsage,
      status: enterpriseApiKeys.status,
      expiresAt: enterpriseApiKeys.expiresAt,
      lastUsedAt: enterpriseApiKeys.lastUsedAt,
      createdAt: enterpriseApiKeys.createdAt,
    })
    .from(enterpriseApiKeys)
    .where(eq(enterpriseApiKeys.distributorId, distributorId))
    .orderBy(enterpriseApiKeys.createdAt);
}

interface AuditLogParams {
  distributorId?: string;
  actorType: 'user' | 'api_key' | 'system' | 'admin';
  actorId?: string;
  actorEmail?: string;
  actorIp?: string;
  actorUserAgent?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
  durationMs?: number;
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(enterpriseAuditLogs).values({
      distributorId: params.distributorId,
      actorType: params.actorType,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorIp: params.actorIp,
      actorUserAgent: params.actorUserAgent,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      description: params.description,
      previousValue: params.previousValue,
      newValue: params.newValue,
      metadata: params.metadata,
      success: params.success ?? true,
      errorMessage: params.errorMessage,
      durationMs: params.durationMs,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[AuditLog] Failed to log event:', error);
  }
}

export async function getAuditLogs(
  distributorId: string,
  options?: {
    limit?: number;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  let query = db
    .select()
    .from(enterpriseAuditLogs)
    .where(eq(enterpriseAuditLogs.distributorId, distributorId))
    .orderBy(sql`${enterpriseAuditLogs.timestamp} DESC`)
    .limit(options?.limit || 100);
  
  return query;
}

export function apiKeyAuthMiddleware(requiredScope?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    
    const apiKey = authHeader.substring(7);
    const startTime = Date.now();
    
    const validation = await validateApiKey(apiKey);
    
    if (!validation.valid) {
      await logAuditEvent({
        actorType: 'api_key',
        actorIp: req.ip,
        actorUserAgent: req.headers['user-agent'],
        action: 'api_call',
        resource: req.path,
        description: `API authentication failed: ${validation.error}`,
        success: false,
        errorMessage: validation.error,
        durationMs: Date.now() - startTime,
      });
      
      return res.status(401).json({ error: validation.error });
    }
    
    if (requiredScope && validation.scopes && !validation.scopes[requiredScope]) {
      await logAuditEvent({
        distributorId: validation.distributorId,
        actorType: 'api_key',
        actorId: validation.keyId,
        actorIp: req.ip,
        actorUserAgent: req.headers['user-agent'],
        action: 'api_call',
        resource: req.path,
        description: `Insufficient scope: requires '${requiredScope}'`,
        success: false,
        errorMessage: 'Insufficient permissions',
        durationMs: Date.now() - startTime,
      });
      
      return res.status(403).json({ error: `Insufficient permissions. Required scope: ${requiredScope}` });
    }
    
    (req as any).distributorId = validation.distributorId;
    (req as any).apiKeyId = validation.keyId;
    (req as any).apiKeyScopes = validation.scopes;
    (req as any).auditStartTime = startTime;
    
    next();
  };
}

export function auditMiddleware(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const startTime = (req as any).auditStartTime || Date.now();
      
      logAuditEvent({
        distributorId: (req as any).distributorId,
        actorType: (req as any).apiKeyId ? 'api_key' : 'user',
        actorId: (req as any).apiKeyId || (req as any).userId,
        actorIp: req.ip,
        actorUserAgent: req.headers['user-agent'],
        action,
        resource,
        resourceId: req.params.id,
        description: `${action} ${resource}`,
        success,
        durationMs: Date.now() - startTime,
      });
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

export async function getDistributorStats(distributorId: string) {
  const [distributor] = await db
    .select()
    .from(enterpriseDistributors)
    .where(eq(enterpriseDistributors.id, distributorId))
    .limit(1);
  
  const activeKeys = await db
    .select({ count: sql<number>`count(*)` })
    .from(enterpriseApiKeys)
    .where(
      and(
        eq(enterpriseApiKeys.distributorId, distributorId),
        eq(enterpriseApiKeys.status, 'active')
      )
    );
  
  const recentLogs = await db
    .select({ count: sql<number>`count(*)` })
    .from(enterpriseAuditLogs)
    .where(
      and(
        eq(enterpriseAuditLogs.distributorId, distributorId),
        gt(enterpriseAuditLogs.timestamp, new Date(Date.now() - 24 * 60 * 60 * 1000))
      )
    );
  
  return {
    distributor,
    activeApiKeys: Number(activeKeys[0]?.count || 0),
    last24hApiCalls: Number(recentLogs[0]?.count || 0),
  };
}
